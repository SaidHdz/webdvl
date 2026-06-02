/**
 * Authentication helpers: password hashing and stateless JWT sessions.
 *
 * JWT was chosen over a server-side session table to keep the MVP simple: the
 * token carries the user id and is verified on each request. The secret comes
 * from the environment with a development fallback.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dvl-dev-secret-change-in-prod';
const TOKEN_TTL = '7d';
const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text password.
 * @param {string} plain - The raw password.
 * @returns {string} The bcrypt hash.
 */
export const hashPassword = (plain) => bcrypt.hashSync(plain, SALT_ROUNDS);

/**
 * Verifies a password against a stored hash.
 * @param {string} plain - The raw password to check.
 * @param {string} hash - The stored bcrypt hash.
 * @returns {boolean} True when the password matches.
 */
export const verifyPassword = (plain, hash) => bcrypt.compareSync(plain, hash);

/**
 * Issues a signed JWT for a user id.
 * @param {number} userId - The authenticated user id.
 * @returns {string} A signed JWT.
 */
export const signToken = (userId) => jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_TTL });

/**
 * Verifies a JWT and returns its payload.
 * @param {string} token - The JWT to verify.
 * @returns {Object} The decoded payload.
 * @throws {JsonWebTokenError} When the token is invalid or expired.
 */
export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
