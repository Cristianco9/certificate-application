/**
 * Module for configuring Passport authentication strategies.
 * @module index
 */
// Import Passport for authentication
import passport from 'passport';
// Import the auth-app JWT authentication strategy for JWT authentication
import { authAppJwtStrategy } from './authApp/strategies/jwt.strategy';
// Import the officials-app JWT authentication strategy for JWT authentication
import { officialsAppJwtStrategy } from './officialsApp/strategies/jwt.strategy';
// Import the record-app JWT authentication strategy for JWT authentication
import { recordAppJwtStrategy } from './recordApp/strategies/jwt.strategy';
/**
 * Configure Passport authentication strategies.
 * This module configures Passport to use authentication strategies:
 */

// Use the auth-app JwtStrategy for JWT authentication
passport.use(authAppJwtStrategy);
// Use the officials-app JwtStrategy for JWT authentication
passport.use(officialsAppJwtStrategy);
// Use the record-app JwtStrategy for JWT authentication
passport.use(recordAppJwtStrategy);
