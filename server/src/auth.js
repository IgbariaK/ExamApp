import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const defaultSecret = 'exam-app-local-development-secret';
const jwtSecret = process.env.JWT_SECRET || defaultSecret;

const base64UrlEncode = (value) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const base64UrlDecode = (value) => {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
};

const sign = (value) =>
  createHmac('sha256', jwtSecret).update(value).digest('base64url');

export const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const iterations = 120000;
  const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');
  return `pbkdf2$${iterations}$${salt}$${hash}`;
};

export const verifyPassword = (password, storedHash) => {
  if (!storedHash) return false;

  if (!storedHash.startsWith('pbkdf2$')) {
    return password === storedHash;
  }

  const [, iterationsText, salt, expectedHash] = storedHash.split('$');
  const actualHash = pbkdf2Sync(password, salt, Number(iterationsText), 32, 'sha256');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  return actualHash.length === expectedBuffer.length && timingSafeEqual(actualHash, expectedBuffer);
};

export const createToken = (user) => {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    })
  );
  const unsignedToken = `${header}.${payload}`;
  return `${unsignedToken}.${sign(unsignedToken)}`;
};

export const verifyToken = (token) => {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) {
    throw new Error('Invalid token.');
  }

  const unsignedToken = `${header}.${payload}`;
  if (signature !== sign(unsignedToken)) {
    throw new Error('Invalid token signature.');
  }

  const claims = JSON.parse(base64UrlDecode(payload));
  if (claims.exp && claims.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired.');
  }

  return claims;
};
