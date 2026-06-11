import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'clevermat-super-secret-key-12345';

// Hash password using PBKDF2
export function hashPassword(password: string): string {
  const salt = 'clevermat-static-salt'; // standard salt
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// Session signing
export function signSession(userId: string): string {
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(userId);
  const signature = hmac.digest('hex');
  return `${userId}.${signature}`;
}

// Session verification
export function verifySession(sessionCookie: string | undefined): string | null {
  if (!sessionCookie) return null;
  const parts = sessionCookie.split('.');
  if (parts.length !== 2) return null;
  const [userId, signature] = parts;
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(userId);
  const expectedSignature = hmac.digest('hex');
  if (signature === expectedSignature) {
    return userId;
  }
  return null;
}
