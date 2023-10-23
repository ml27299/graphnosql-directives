import { mapSchema, MapperKind } from "@graphql-tools/utils";
import required from "./libs/required";

export default (locations = [], directiveFn = required`directiveFn`) =>
	(schema = required`schema`, directiveName = required`directiveName`) => {
		return mapSchema(
			schema,
			locations.reduce((result, location) => {
				result[MapperKind[location]] = directiveFn(directiveName, schema);
				return result;
			}, {})
		);
	};
