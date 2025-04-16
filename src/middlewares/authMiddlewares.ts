import { Request, Response, NextFunction } from 'express';
import jwt, { JwtHeader, VerifyErrors } from 'jsonwebtoken';
import https from 'https';
import jwkToPem from 'jwk-to-pem';
import { JWKS_URL, COGNITO_ISSUER } from '../assets/constants'; 


// Cache for public keys
let publicKeysCache: Record<string, any> | null = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const getCognitoPublicKeys = async (): Promise<Record<string, any>> => {
  // Return cached keys if available and not expired
  if (publicKeysCache && (Date.now() - cacheTime) < CACHE_DURATION) {
    return publicKeysCache;
  }

  return new Promise((resolve, reject) => {
    https.get(JWKS_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const { keys } = JSON.parse(data);
          const publicKeys = keys.reduce((agg: any, key: any) => {
            agg[key.kid] = jwkToPem(key); // Convert JWK to PEM
            return agg;
          }, {});
          
          // Update cache
          publicKeysCache = publicKeys;
          cacheTime = Date.now();
          
          resolve(publicKeys);
        } catch (error) {
          reject('Failed to parse JWKS data');
        }
      });
    }).on('error', reject);
  });
};

export const tokenAuthentication = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // Assumes format "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const publicKeys = await getCognitoPublicKeys();
    const decodedHeader = jwt.decode(token, { complete: true }) as JwtHeader | null;
    
    if (!decodedHeader) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const { kid } = decodedHeader;

    if (!kid || !publicKeys[kid]) {
      return res.status(401).json({ message: 'Invalid token key ID' });
    }

    const publicKey = publicKeys[kid];

    jwt.verify(token, publicKey, { issuer: COGNITO_ISSUER }, (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized', error: err.message });
      }
      next(); // Proceed to the next middleware or route handler
    });
  } catch (catchedError) {
    console.error('Authentication error:', catchedError);
    return res.status(500).json({ message: 'Failed to authenticate token'});
  }
};
