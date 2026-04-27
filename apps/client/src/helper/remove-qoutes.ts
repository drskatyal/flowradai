export const removeQuotedText = (input: string = ''): string => {
  return input.replace(/\s*"""[\s\S]*?"""\s*/g, '');
};
