import * as bcrypt from 'bcryptjs';
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
  return bcrypt.hash(password, salt); // Hash the password
}
