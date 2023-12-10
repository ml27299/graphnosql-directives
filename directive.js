import { getDirective } from "@graphql-tools/utils";
import required from "./libs/required";

const isAsyncFunction = (func) =>
	Object.prototype.toString.call(func) === "[object AsyncFunction]";

export default (resolve = required`resolve`) => {
	return (name, schema) => (fieldConfig) => {
		const directive = getDirective(schema, fieldConfig, name)?.[0];
		if (!directive || Object.keys(directive).length === 0) return;
		const { resolve: defaultResolver } = fieldConfig;

		fieldConfig.resolve = async (parent, args, ctx, info) => {
			try {
				let resolveArgs;
				if (isAsyncFunction(resolve)) {
					resolveArgs = await resolve(
						parent,
						{ directive, ...args },
						ctx,
						info
					);
				} else {
					resolveArgs = resolve(parent, { directive, ...args }, ctx, info);
				}
				Object.assign(args, resolveArgs);
				return await defaultResolver(parent, args, ctx, info);
			} catch (err) {
				throw err;
			}
		};

		return fieldConfig;
	};
};
