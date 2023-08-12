const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");
const { GraphQLString } = require("graphql");

const directiveFn = (name, schema) => (fieldConfig) => {
	const directive = getDirective(schema, fieldConfig, name)?.[0];
	if (!directive || Object.keys(directive).length === 0) return;
	console.log({ fieldConfig });
	// fieldConfig.args[name] = { type: GraphQLString };
	// const { resolve: defaultResolver } = fieldConfig;

	// fieldConfig.resolve = async function (
	// 	source,
	// 	{ filter, ...otherArgs },
	// 	context,
	// 	info
	// ) {
	// 	try {
	// 		const field_name = info.fieldName;
	// 		let filter_query = null;

	// 		if (filter)
	// 			filter_query = ~filter.indexOf("{")
	// 				? JSON.parse(filter || "{}")
	// 				: filter;
	// 		let value = source ? source[field_name] : null;

	// 		if (defaultResolver)
	// 			value = await defaultResolver(
	// 				source,
	// 				{ filter_query, ...otherArgs },
	// 				context,
	// 				info
	// 			);
	// 		return value;
	// 	} catch (err) {
	// 		throw new ServerError(err);
	// 	}
	// };

	return fieldConfig;
};

function filterDirectiveTransformer(schema, directiveName) {
	return mapSchema(
		schema,
		locations.reduce((result, location) =>
			Object.assign(result, {
				[MapperKind[location]]: directiveFn(directiveName, schema),
			})
		)
	);
}

export const transformer = filterDirectiveTransformer;
export const name = "useCache";
export const locations = ["FIELD", "OBJECT_FIELD"];
