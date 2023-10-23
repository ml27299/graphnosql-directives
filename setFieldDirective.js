import required from "./libs/required";

export default ({
	directiveName = required`directiveName`,
	schemaComposer = required`schemaComposer`,
	Type = required`Type`,
	fieldName = required`fieldName`,
	directiveArgs = {},
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
				args: directiveArgs,
			},
		].filter(Boolean)
	);
};
