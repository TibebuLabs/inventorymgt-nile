export function isPositiveInteger(value: string): boolean {
  const positiveIntegerRegex = /^(0|[1-9]\d*)$/; // Allow only positive integers (including 0)
  return positiveIntegerRegex.test(value);
}
