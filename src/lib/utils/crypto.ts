/**
 * Crypto Utils - Encryption/Decryption
 *
 * Usado para criptografar dados sensíveis antes de armazenar no banco:
 * - WhatsApp access tokens
 * - Tokens de API de integrações
 * - Qualquer credencial de terceiros
 *
 * Algoritmo: AES-256-CBC
 * Encoding: hex
 *
 * IMPORTANTE:
 * - ENCRYPTION_KEY deve ter 32 caracteres (256 bits)
 * - NUNCA commite a ENCRYPTION_KEY no git
 * - Use .env.local para desenvolvimento
 * - Use Vercel Environment Variables para produção
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error(
    'ENCRYPTION_KEY must be a 64-character hex string (32 bytes). Generate with: openssl rand -hex 32'
  );
}

/**
 * Criptografa um texto usando AES-256-CBC
 *
 * @param text - Texto a ser criptografado
 * @returns Texto criptografado no formato: iv:encryptedData
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Descriptografa um texto criptografado com AES-256-CBC
 *
 * @param encryptedText - Texto criptografado no formato: iv:encryptedData
 * @returns Texto original descriptografado
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, encryptedData] = encryptedText.split(':');

  if (!ivHex || !encryptedData) {
    throw new Error('Invalid encrypted text format. Expected: iv:encryptedData');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
