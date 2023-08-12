const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");
const { GraphQLEnumType, GraphQLString } = require("graphql");
const GraphQLJSON = require("graphql-type-json");

const sortTypesEnumValues = {
	asc: { value: "asc" },
	desc: { value: "desc" },
};

const sortTypesEnum = new GraphQLEnumType({
	name: "SortType",
	values: sortTypesEnumValues,
});

const directiveFn = (name, schema) => (fieldConfig) => {
	const directive = getDirective(schema, fieldConfig, name)?.[0];
	if (!directive) return;

	fieldConfig.args[name] = { type: GraphQLJSON };
	const { resolve: defaultResolver } = fieldConfig;

	fieldConfig.resolve = async function (
		source,
		{ sort, ...otherArgs },
		context,
		info
	) {
		try {
			const field_name = info.fieldName;
			let value = source ? source[field_name] : null;

			if (defaultResolver)
				value = await defaultResolver(
					source,
					{ sort, sort_query: sort, ...otherArgs },
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

function sortDirectiveTransformer(schema, directiveName) {
	return mapSchema(schema, {
		[MapperKind.FIELD]: directiveFn(directiveName, schema),
		[MapperKind.OBJECT_FIELD]: directiveFn(directiveName, schema),
	});
}

export const transformer = sortDirectiveTransformer;
export const name = "sort";
export const locations = ["FIELD", "OBJECT_FIELD"];
