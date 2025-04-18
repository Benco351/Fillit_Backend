import { RequestHandler } from 'express';
import jwt, { JwtHeader, JwtPayload } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import fetch from 'node-fetch';
import {
  JWKS_URL,
  COGNITO_ISSUER,
  COGNITO_AUDIENCE
} from '../assets/constants';

const CACHE_DURATION = 60 * 60 * 1000;  // 1h
let keyCache: Record<string,string> = {};
let cacheExpires = 0;

// Define the JWK interface and response structure
interface Jwk {
  kid: string;
  kty: 'RSA';
  alg: string;
  use: string;
  n: string;
  e: string;
}
interface JwksResponse {
  keys: Jwk[];
}

const fetchKeys = async (): Promise<Record<string,string>> => {
  if (Date.now() < cacheExpires && Object.keys(keyCache).length) {
    return keyCache;
  }

  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error(`Failed to fetch JWKS: ${res.statusText}`);
  const jwks = (await res.json()) as JwksResponse;

  keyCache = Object.fromEntries(
    jwks.keys.map(({ kid, ...jwk }) => [
      kid,
      jwkToPem(jwk)
    ])
  );
  cacheExpires = Date.now() + CACHE_DURATION;
  return keyCache;
};

export const tokenAuthentication: RequestHandler = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed Authorization header' });
  }
  const token = header.slice(7);

  try {
    const pems = await fetchKeys();

    const decoded = jwt.decode(token, { complete: true }) as { header?: JwtHeader } | null;
    const kid = decoded?.header?.kid;
    if (!kid || !pems[kid]) {
      return res.status(401).json({ message: 'Invalid token key ID' });
    }

    jwt.verify(
      token,
      pems[kid],
      {
        issuer:   COGNITO_ISSUER,
        audience: COGNITO_AUDIENCE,
        algorithms: ['RS256'],
      },
      (err, payload) => {
        if (err) {
          return res.status(401).json({ message: err.message });
        }
        (req as any).user = payload as JwtPayload;
        next();
      }
    );
  } catch (error: any) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal authentication error' });
  }
};
