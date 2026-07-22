import axios from "axios";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const {
  OUTLOOK_CLIENT_ID,
  OUTLOOK_CLIENT_SECRET,
  OUTLOOK_REDIRECT_URI,
  OUTLOOK_CONNECT_REDIRECT_URI,
} = process.env;

// Ensure all required Microsoft Outlook OAuth environment variables are defined at startup
if (
  !OUTLOOK_CLIENT_ID ||
  !OUTLOOK_CLIENT_SECRET ||
  !OUTLOOK_REDIRECT_URI ||
  !OUTLOOK_CONNECT_REDIRECT_URI
) {
  throw new Error("Microsoft Outlook OAuth environment variables are missing in .env");
}

export type OutlookOAuthMode = "AUTH" | "EMAIL";

// Microsoft Graph API permission scopes:
// - AUTH: Basic access (email, profile) to register/log in users.
// - EMAIL: Advanced access to download, draft, send messages, and request background offline access.
const OUTLOOK_SCOPES: Record<OutlookOAuthMode, string[]> = {
  AUTH: ["openid", "profile", "email", "User.Read"],
  EMAIL: [
    "openid",
    "profile",
    "email",
    "User.Read",
    "Mail.Read",
    "Mail.ReadWrite",
    "Mail.Send",
    "offline_access", // Required by Microsoft Graph to return a long-lived refresh_token
  ],
};

const AUTHORIZE_URL =
  "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize";
const TOKEN_URL =
  "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";

/**
 * Encodes a binary buffer into a Base64URL string (URL-safe without padding).
 * Used in PKCE security.
 */
function base64URLEncode(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Computes a SHA-256 hash of a binary buffer.
 * Used in PKCE security challenges.
 */
function sha256(buffer: Buffer) {
  return crypto.createHash("sha256").update(buffer).digest();
}

export class OutlookOAuthService {
  /**
   * Generates the Microsoft Consent Screen URL using PKCE (Proof Key for Code Exchange) flow.
   */
  static buildAuthUrl(mode: OutlookOAuthMode) {
    const scope = OUTLOOK_SCOPES[mode].join(" ");
    const state = crypto.randomUUID(); // CSRF protection token

    // PKCE Security Setup (prevents Authorization Code Interception attacks)
    const codeVerifier = base64URLEncode(crypto.randomBytes(32));
    const codeChallenge = base64URLEncode(sha256(Buffer.from(codeVerifier)));

    const redirectUri =
      mode === "AUTH" ? OUTLOOK_REDIRECT_URI! : OUTLOOK_CONNECT_REDIRECT_URI!;

    const params = new URLSearchParams({
      client_id: OUTLOOK_CLIENT_ID!,
      response_type: "code",
      redirect_uri: redirectUri,
      response_mode: "query",
      scope,
      prompt: "consent",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return {
      url: `${AUTHORIZE_URL}?${params.toString()}`,
      state,
      codeVerifier, // Must be stored in server-side Redis cache to complete handshake
    };
  }

  /**
   * Exchanges the temporary authorization code and verifier for access/refresh tokens.
   */
  static async exchangeCode(
    code: string,
    mode: OutlookOAuthMode,
    codeVerifier: string
  ) {
    const redirectUri =
      mode === "AUTH" ? OUTLOOK_REDIRECT_URI! : OUTLOOK_CONNECT_REDIRECT_URI!;

    const res = await axios.post(
      TOKEN_URL,
      new URLSearchParams({
        client_id: OUTLOOK_CLIENT_ID!,
        client_secret: OUTLOOK_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier, // Verifies PKCE handshake match
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return res.data as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      scope: string;
      id_token?: string;
      token_type: "Bearer";
    };
  }

  /**
   * Swaps a long-lived refresh_token for a fresh temporary access_token.
   */
  static async refreshToken(refreshToken: string) {
    const res = await axios.post(
      TOKEN_URL,
      new URLSearchParams({
        client_id: OUTLOOK_CLIENT_ID!,
        client_secret: OUTLOOK_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return res.data as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      scope: string;
      token_type: "Bearer";
    };
  }

  /**
   * Decodes Microsoft's signed ID Token to retrieve the user's verified identity profile.
   */
  static parseIdToken(idToken: string) {
    const decoded = jwt.decode(idToken) as any;

    if (!decoded?.sub) {
      throw new Error("Invalid Outlook ID token");
    }

    return {
      outlookId: decoded.sub, // Unique Microsoft user ID
      email: decoded.email || decoded.preferred_username,
      fullName: decoded.name ?? "",
      issuer: decoded.iss,
    };
  }
}
