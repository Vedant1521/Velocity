import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes (64 hex characters)
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // For AES, this is always 16 bytes

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not defined in environment variables");
}

// Ensure key is of correct length
const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");
if (keyBuffer.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte hex string (64 characters)");
}

/**
 * Encrypts a plain text string using AES-256-CBC.
 * Output format is: iv_hex:ciphertext_hex
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  // Return IV prepended to the ciphertext so we know which IV to use when decrypting
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts a cipher text string (format: iv_hex:ciphertext_hex) back into plain text.
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, encryptedHex] = encryptedText.split(":");
  
  if (!ivHex || !encryptedHex) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const encryptedBytes = Buffer.from(encryptedHex, "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  
  let decrypted = decipher.update(encryptedBytes);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString("utf8");
}
