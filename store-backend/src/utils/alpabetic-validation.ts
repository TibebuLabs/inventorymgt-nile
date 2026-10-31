export function isAlphabetic(value: string): boolean {
  const alphabeticRegex = /^[A-Za-z0-9\s]+$/;
  return alphabeticRegex.test(value);
}
