// Import the necessary modules from passport-jwt
import { Strategy, ExtractJwt } from "passport-jwt";
// Import the configuration settings
import { config } from "../../../../config/config.js";

// Define options for the JWT strategy
const options = {
  // Extract JWT from the Authorization header as a Bearer token
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // Secret key for verifying the JWT specific to officials
  secretOrKey: config.officialsAppJwtKey
};

/**
 * JWT strategy for Passport authentication for officials.
 * This strategy extracts the JWT from the Authorization header and verifies
 * it using the secret key.
 * If the token is valid, the payload is returned.
 *
 * @param {object} payload
 * - The payload extracted from the verified JWT.
 * @param {function} done
 * - The callback function to be called after verification.
 * @returns {function}
 * - The done function with either an error or the payload.
 */
export const officialsAppJwtStrategy = new Strategy(options, (payload, done) => {
  // Pass the payload to the done function if verification is successful
  return done(null, payload);
});
