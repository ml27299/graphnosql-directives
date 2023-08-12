import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import required from "../libs/required";

const debug = {
	info: require("debug")("api:authorization:info"),
	verbose: require("debug")("api:authorization:verbose"),
};

const directiveFn = (name, schema) => (fieldConfig) => {
	const directive = getDirective(schema, fieldConfig, name)?.[0];
	if (!directive || Object.keys(directive).length === 0) return;
	const { resolve: defaultResolver } = fieldConfig;

	fieldConfig.resolve = async function (
		_,
		args = {},
		{ auth, headers, cookies, request, raw, ...ctx },
		info
	) {
		try {
			function getJwtSubject(directive) {
				return directive.requires;
			}

			const token = ctx.getToken();

			debug.info({ cookies });
			debug.info({ headers });
			debug.info({ token });

			if (!token) {
				throw new Error("Token not found");
			}

			const subject = getJwtSubject(directive);
			debug.info({ subject });

			const response = await auth.verifyJwtToken(subject, token);
			if (!response || response.status === "rejected") {
				throw new Error("JWT Not Authorized");
			}

			const { account } = response.value;
			//if (args.filter) Object.assign(args.filter, { account: account._id });

			try {
				return await defaultResolver(
					_,
					Object.assign(args, { account }),
					{ auth, headers, cookies, ...ctx },
					info
				);
			} catch (err) {
				throw err;
			}
		} catch (err) {
			throw err;
		}
	};

	return fieldConfig;
};

function authDirectiveTransformer(
	schema = required`schema`,
	directiveName = required`directiveName`
) {
	return mapSchema(schema, {
		[MapperKind.OBJECT_TYPE]: directiveFn(directiveName, schema),
		[MapperKind.OBJECT_FIELD]: directiveFn(directiveName, schema),
	});
}

export const transformer = authDirectiveTransformer;
export const name = "auth";
export const locations = ["OBJECT_TYPE", "OBJECT_FIELD"];
export const setFieldDirective = ({
	schemaComposer = required`schemaComposer`,
	Type = required`Type`,
	fieldName = required`fieldName`,
	authorization,
	privileged,
}) => {
	const directiveName = name;
	const existingDirectives =
		schemaComposer[Type].getFieldDirectives(fieldName) || [];
	const hasDirectiveAlready = existingDirectives.find(
		({ name }) => name === directiveName
	);

	if (!authorization && !privileged) return;
	if (hasDirectiveAlready) return;

	schemaComposer[Type].setFieldDirectives(
		fieldName,
		[
			...existingDirectives,
			{
				name: directiveName,
				args: {
					requires: privileged || authorization,
				},
			},
		].filter(Boolean)
	);
};
