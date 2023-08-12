const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");
const { GraphQLInt } = require("graphql");

const directiveFn = (name, schema) => (fieldConfig) => {
	const directive = getDirective(schema, fieldConfig, name)?.[0];
	if (!directive) return;

	fieldConfig.args[name] = { type: GraphQLInt };
	const { resolve: defaultResolver } = fieldConfig;

	fieldConfig.resolve = async function (
		source,
		{ limit, ...otherArgs },
		context,
		info
	) {
		try {
			const field_name = info.fieldName;
			let value = source ? source[field_name] : null;

			if (defaultResolver)
				value = await defaultResolver(
					source,
					{ limit, ...otherArgs },
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

function limitDirectiveTransformer(schema, directiveName) {
	return mapSchema(schema, {
		[MapperKind.FIELD]: directiveFn(directiveName, schema),
		[MapperKind.OBJECT_FIELD]: directiveFn(directiveName, schema),
	});
}

export const transformer = limitDirectiveTransformer;
export const name = "limit";
export const locations = ["FIELD", "OBJECT_FIELD"];
