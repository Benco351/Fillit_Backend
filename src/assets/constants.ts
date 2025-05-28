// export const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@finner-cluster.m2rjy.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
/* constants.ts — used by the middleware */
export const COGNITO_ISSUER =
  `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/` +
  `${process.env.COGNITO_USER_POOL_ID}`;

export const JWKS_URL = `${COGNITO_ISSUER}/.well-known/jwks.json`;
/* ID-tokens carry aud = client-ID */
export const COGNITO_AUDIENCE = process.env.COGNITO_APP_CLIENT_ID;
export const CACHE_DURATION = 60 * 60 * 1000 * 5; // 5 hour