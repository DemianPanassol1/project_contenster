export const splitValidationRules = (rules: string): string[] => {
  const result: string[] = [];
  let current = '';
  let bracketDepth = 0;

  for (const character of rules) {
    if (character === '[') bracketDepth += 1;
    if (character === ']') bracketDepth = Math.max(0, bracketDepth - 1);

    if (character === '|' && bracketDepth === 0) {
      if (current.trim()) result.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  if (current.trim()) result.push(current.trim());

  return result;
};
