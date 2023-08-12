const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");
const { GraphQLBoolean } = require("graphql");

const directiveFn = (name, schema) => (fieldConfig) => {
	const directive = getDirective(schema, fieldConfig, name)?.[0];
	if (!directive) return;

	fieldConfig.args[name] = { type: GraphQLBoolean };
	const { resolve: defaultResolver } = fieldConfig;

	fieldConfig.resolve = async function (
		source,
		{ count, ...otherArgs },
		context,
		info
	) {
		try {
			const field_name = info.fieldName;
			let value = source ? source[field_name] : null;

			try {
				if (defaultResolver)
					value = await defaultResolver(
						source,
						{ count, ...otherArgs },
						context,
						info
					);
				return value;
			} catch (err) {
				throw err;
			}
		} catch (err) {
			throw err;
		}
	};

	return fieldConfig;
};

function countDirectiveTransformer(schema, directiveName) {
	return mapSchema(schema, {
		[MapperKind.FIELD]: directiveFn(directiveName, schema),
		[MapperKind.OBJECT_FIELD]: directiveFn(directiveName, schema),
	});
}

export const transformer = countDirectiveTransformer;
export const name = "count";
export const locations = ["FIELD", "OBJECT_FIELD"];
