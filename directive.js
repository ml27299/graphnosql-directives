import { getDirective } from "@graphql-tools/utils";

export default ({ schema, name, resolve }) => {
	return (fieldConfig) => {
		const directive = getDirective(schema, fieldConfig, name)?.[0];
		if (!directive || Object.keys(directive).length === 0) return;
		const { resolve: defaultResolver } = fieldConfig;

		fieldConfig.resolve = async (parent, args, ctx, info) => {
			try {
				let resolveArgs;
				if (resolve.then) {
					resolveArgs = await resolve(parent, args, ctx, info);
				} else {
					resolveArgs = resolve(parent, args, ctx, info);
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
