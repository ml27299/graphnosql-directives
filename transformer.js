import { mapSchema, MapperKind } from "@graphql-tools/utils";

export default (
	schema = required`schema`,
	directiveName = required`directiveName`,
	directiveFn = required`directiveFn`,
	locations = []
) => {
	return mapSchema(
		schema,
		locations.reduce((result, location) => {
			result[MapperKind[location]] = directiveFn(directiveName, schema);
			return result;
		}, {})
	);
};
