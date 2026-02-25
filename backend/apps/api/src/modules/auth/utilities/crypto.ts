import bcrypt from "bcryptjs";
/**
 * Hashes password
 * @param password Password
 * @returns Generated password hash
 */
export const hashPassword = async (password: string) => {
	const salt = await bcrypt.genSalt();
	return bcrypt.hash(password, salt);
};

/**
 * Verify password hash
 * @param password Plain password
 * @param hash Password hash
 * @returns True, if verification is successful
 */
export const verifyPassword = (password: string, hash: string) => {
	return bcrypt.compare(password, hash);
};
