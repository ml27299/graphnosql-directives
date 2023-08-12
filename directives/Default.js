import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import required from "../libs/required";

function getTypeName(type) {
	switch (type.kind) {
		case "ListType":
			return "ListType";
		case "NonNullType":
			return getTypeName(type.type);
		case "NamedType":
			return type.name.value;
	}
}

const directiveFn = (name, schema) => (fieldConfig) => {
	const directive = getDirective(schema, fieldConfig, name)?.[0];
	if (!directive || Object.keys(directive).length === 0) return;

	const { resolve: defaultResolver } = fieldConfig;
	const type = fieldConfig.astNode?.type;

	if (!type) {
		throw new Error("There is no astNode in fieldConfig");
	}
	const typeName = getTypeName(type);
	fieldConfig.resolve = async function (parent, args, ctx, info) {
		try {
			console.log({
				parent,
				args,
			});
			const value = await defaultResolver(parent, args, ctx, info);
			console.log({ value });
			if (value === null || value === undefined) {
				const defaultValue = directive.value;
				let parsedDefaultValue;

				switch (typeName) {
					case "String":
						parsedDefaultValue = defaultValue;
						break;
					case "Boolean":
						parsedDefaultValue = Boolean(defaultValue);
						break;
					case "Int":
					case "Float":
						parsedDefaultValue = Number(defaultValue);
						break;
					default:
						try {
							parsedDefaultValue = JSON.parse(defaultValue);
						} catch {
							parsedDefaultValue = defaultValue;
						}
				}
				return parsedDefaultValue;
			}
			return value;
		} catch (err) {
			throw err;
		}
	};
	return fieldConfig;
};

function defaultDirectiveTransformer(
	schema = required`schema`,
	directiveName = required`directiveName`
) {
	return mapSchema(schema, {
		[MapperKind.OBJECT_FIELD]: directiveFn(directiveName, schema),
	});
}

export const transformer = defaultDirectiveTransformer;
export const name = "default";
export const locations = ["OBJECT_FIELD"];
