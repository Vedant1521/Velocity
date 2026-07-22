import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import "dotenv/config";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_CONNECT_REDIRECT_URI,
} = process.env;

// Ensure all required Google OAuth environment variables are defined at startup
if (
  !GOOGLE_CLIENT_ID ||
  !GOOGLE_CLIENT_SECRET ||
  !GOOGLE_REDIRECT_URI ||
  !GOOGLE_CONNECT_REDIRECT_URI
) {
  throw new Error("Google OAuth environment variables are missing in .env");
}

export type GoogleOAuthMode = "AUTH" | "EMAIL";

// Google API client initializer for ID token verification
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// 1. Google OAuth permission scopes:
// - AUTH: Basic access (email, profile) to register/log in users.
// - EMAIL: Advanced access to download and modify Gmail messages.
const GOOGLE_SCOPES = {
  AUTH: ["openid", "email", "profile"],
  EMAIL: [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/gmail.modify", // Allows reading/writing inbox
  ],
};

export class GoogleOAuthService {
  /**
   * Generates the Google Consent Screen URL for OAuth authorization redirects.
   */
  static buildAuthUrl(mode: GoogleOAuthMode) {
    const scopes = GOOGLE_SCOPES[mode].join(" ");
    const state = crypto.randomUUID(); // CSRF protection token

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      redirect_uri:
        mode === "AUTH" ? GOOGLE_REDIRECT_URI! : GOOGLE_CONNECT_REDIRECT_URI!,
      response_type: "code",
      scope: scopes,
      access_type: "offline", // Mandatory to receive a long-lived refresh_token
      prompt: "consent", // Force consent screen to guarantee refresh_token delivery
      state,
    });

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      state,
    };
  }

  /**
   * Exchanges the temporary authorization code received from Google for access/refresh tokens.
   */
  static async exchangeCode(code: string, mode: GoogleOAuthMode) {
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri:
          mode === "AUTH" ? GOOGLE_REDIRECT_URI! : GOOGLE_CONNECT_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data as {
      access_token: string;
      refresh_token?: string; // Sent only on first consent authorization
      expires_in: number;
      scope: string;
      id_token: string;
      token_type: string;
    };
  }

  /**
   * Decrypts and validates Google's secure ID Token, extracting verified user profile info.
   */
  static async verifyIdToken(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("Invalid Google ID token");
    }

    if (!payload.email_verified) {
      throw new Error("Google email is not verified");
    }

    return {
      googleId: payload.sub, // Unique Google user ID
      email: payload.email!,
      fullName: payload.name || "",
      avatar: payload.picture || "",
    };
  }
}
