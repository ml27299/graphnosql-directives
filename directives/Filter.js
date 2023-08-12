const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");
const GraphQLJSON = require("graphql-type-json");

const directiveFn = (name, schema) => (fieldConfig) => {
	const directive = getDirective(schema, fieldConfig, name)?.[0];
	if (!directive) return;

	fieldConfig.args[name] = { type: GraphQLJSON };
	const { resolve: defaultResolver } = fieldConfig;

	fieldConfig.resolve = async function (
		source,
		{ filter, ...otherArgs },
		context,
		info
	) {
		try {
			const field_name = info.fieldName;
			let value = source ? source[field_name] : null;

			if (defaultResolver)
				value = await defaultResolver(
					source,
					{ filter, filter_query: filter, ...otherArgs },
					context,
					info
				);
			return value;
		} catch (err) {
			throw err;
		}
	};

	return fieldConfig;
};

function filterDirectiveTransformer(schema, directiveName) {
	return mapSchema(schema, {
		[MapperKind.FIELD]: directiveFn(directiveName, schema),
		[MapperKind.OBJECT_FIELD]: directiveFn(directiveName, schema),
	});
}

export const transformer = filterDirectiveTransformer;
export const name = "filter";
export const locations = ["FIELD", "OBJECT_FIELD"];
