const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");
const { GraphQLEnumType } = require("graphql");

const DBTypesEnumValues = {
	mongo: { value: "mongo" },
	es: { value: "es" },
};
const DBTypesEnum = new GraphQLEnumType({
	name: "DBTypes",
	values: DBTypesEnumValues,
});

const directiveFn = (name, schema) => (fieldConfig) => {
	const directive = getDirective(schema, fieldConfig, name)?.[0];
	if (!directive || Object.keys(directive).length === 0) return;

	fieldConfig.args[name] = { type: DBTypesEnum };
	const { resolve: defaultResolver } = fieldConfig;

	fieldConfig.resolve = async function (
		source,
		{ db, ...otherArgs },
		context,
		info
	) {
		try {
			otherArgs.db_type = db;
			const fieldName = info.fieldName;
			let value = source[fieldName];

			if (defaultResolver)
				value = await defaultResolver(source, otherArgs, context, info);
			return value;
		} catch (err) {
			throw err;
		}
	};

	return fieldConfig;
};

function dbDirectiveTransformer(schema, directiveName) {
	return mapSchema(schema, {
		[MapperKind.OBJECT_FIELD]: directiveFn(directiveName, schema),
	});
}

export const transformer = dbDirectiveTransformer;
export const name = "db";
export const locations = ["OBJECT_FIELD"];
