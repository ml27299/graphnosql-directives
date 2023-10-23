import required from "./libs/required";

export default (
		directiveName = required`directiveName`,
		directiveArgsFn = () => {}
	) =>
	({
		schemaComposer = required`schemaComposer`,
		Type = required`Type`,
		fieldName = required`fieldName`,
		...fnTypeConfigs
	}) => {
		const existingDirectives =
			schemaComposer[Type].getFieldDirectives(fieldName) || [];
		const hasDirectiveAlready = existingDirectives.find(
			({ name }) => name === directiveName
		);

		if (hasDirectiveAlready) return;

		schemaComposer[Type].setFieldDirectives(
			fieldName,
			[
				...existingDirectives,
				{
					name: directiveName,
					args: directiveArgsFn(fnTypeConfigs),
				},
			].filter(Boolean)
		);
	};
