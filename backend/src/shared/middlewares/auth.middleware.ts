import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

// TypeScript definition to append our custom user properties 
// to Express's native Request object type dynamically.
export interface UserToken {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserToken;
    }
  }
}

/**
 * Express Middleware that intercepts incoming requests, validates the session JWT,
 * and sets the active user session metadata (req.user) for downstream controllers.
 */
export const verifyAccessToken =
  () => (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Retrieve the token from either the Authorization header (Bearer token)
      // or the HTTP-Only cookie-parser cookie.
      const token =
        req.headers.authorization?.split(" ")[1] || req.cookies?.access_token;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token missing, please login again",
        });
      }

      // 2. Validate token and extract the user payload using our JWT utility
      const decoded = verifyToken(token);

      if (!decoded || !decoded.userId) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      // 3. Attach the user ID to the request object so downstream controllers can use it
      req.user = {
        id: decoded.userId,
      };

      // 4. Pass execution to the next controller function in line
      return next();
    } catch (error) {
      // If verifyToken throws an error (e.g. token expired, signature tampered)
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  };
