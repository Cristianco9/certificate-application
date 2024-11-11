/**
 * Module for configuring Passport authentication strategies.
 * @module index
 */
// Import Passport for authentication
import passport from 'passport';
// Import the auth-app JWT authentication strategy for JWT authentication
import { authAppJwtStrategy } from './authApp/strategies/jwt.strategy.js';

/**
 * Configure Passport authentication strategies.
 * This module configures Passport to use authentication strategies:
 */

// Use the auth-app JwtStrategy for JWT authentication
passport.use(authAppJwtStrategy);
