import { RequestHandler } from 'express';
import jwt, { JwtHeader, JwtPayload, VerifyErrors } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import fetch from 'node-fetch';
import {CACHE_DURATION , JWKS_URL, COGNITO_ISSUER, COGNITO_AUDIENCE } from '../assets/constants';
import { logger } from '../config/logger';

let keyCache: Record<string, string> = {};
let cacheExpires = 0;

/* ── types for JWKS fetch ───────────────────────────────────────────── */
interface Jwk {
  kid: string;
  kty: 'RSA';
  alg: string;
  use: string;
  n: string;
  e: string;
}
interface JwksResponse { keys: Jwk[]; }

/* ── fetch & cache Cognito public keys ──────────────────────────────── */
const fetchKeys = async (): Promise<Record<string, string>> => {
  if (Date.now() < cacheExpires && Object.keys(keyCache).length) return keyCache;

  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error(`Failed to fetch JWKS: ${res.statusText}`);

  const jwks = (await res.json()) as JwksResponse;
  keyCache = Object.fromEntries(jwks.keys.map(jwk => [jwk.kid, jwkToPem(jwk)]));
  cacheExpires = Date.now() + CACHE_DURATION;
  return keyCache;
};

/* ── Express middleware ─────────────────────────────────────────────── */
export const tokenAuthentication: RequestHandler = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed Authorization header' });
  }
  const token = header.slice(7);

  try {
    const pems = await fetchKeys();

    /* decode header → pick correct PEM */
    const decodedHeader = jwt.decode(token, { complete: true }) as { header?: JwtHeader } | null;
    const kid = decodedHeader?.header?.kid;
    if (!kid || !pems[kid]) {
      return res.status(401).json({ message: 'Invalid token key ID' });
    }

    /* synchronous verify; throws if invalid */
    const payload = jwt.verify(token, pems[kid], {
      issuer:   COGNITO_ISSUER,
      audience: COGNITO_AUDIENCE,        // App-client ID for ID-tokens
      algorithms: ['RS256'],
    }) as JwtPayload;

    /* optional: ensure it is an ID token */
    if (payload.token_use !== 'id') {
      return res.status(401).json({ message: 'Not an ID token' });
    }

    (req as any).user = payload;
    next();

  } catch (err) {
    const msg = (err as VerifyErrors)?.message ?? 'Internal authentication error';
    logger.error('Authentication error:', err);
    res.status(401).json({ message: msg });
  }
};
