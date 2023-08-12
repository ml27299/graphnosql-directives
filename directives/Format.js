const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");

const { GraphQLEnumType } = require("graphql");

const formatTypesEnumValues = {
	ucfirst: {
		value: "ucfirst",
		exec: (value) => {
			return value.ucFirst();
		},
	},
	lowercase: {
		value: "lowercase",
		exec: (value) => {
			return value.toLowerCase();
		},
	},
	uppercase: {
		value: "uppercase",
		exec: (value) => {
			return value.toUpperCase();
		},
	},
};

const formatTypesEnum = new GraphQLEnumType({
	name: "FormatType",
	values: formatTypesEnumValues,
});

const directiveFn = (name, schema) => (fieldConfig) => {
	const directive = getDirective(schema, fieldConfig, name)?.[0];
	if (!directive || Object.keys(directive).length === 0) return;

	fieldConfig.args[name] = { type: formatTypesEnum };
	const { resolve: defaultResolver } = fieldConfig;

	fieldConfig.resolve = async function (
		source,
		{ format, ...otherArgs },
		context,
		info
	) {
		try {
			const fieldName = info.fieldName;
			let value = source[fieldName];

			if (defaultResolver)
				value = await defaultResolver(source, otherArgs, context, info);

			if (!formatTypesEnumValues[format]) return value;
			return formatTypesEnumValues[format].exec(value);
		} catch (err) {
			throw err;
		}
	};

	return fieldConfig;
};

function formatDirectiveTransformer(schema, directiveName) {
	return mapSchema(schema, {
		[MapperKind.FIELD]: directiveFn(directiveName, schema),
		[MapperKind.OBJECT_FIELD]: directiveFn(directiveName, schema),
	});
}

export const transformer = formatDirectiveTransformer;
export const name = "format";
export const locations = ["FIELD", "OBJECT_FIELD"];
