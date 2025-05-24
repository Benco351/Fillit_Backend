export const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@finner-cluster.m2rjy.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
export const COGNITO_ISSUER = `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;
export const JWKS_URL = `${COGNITO_ISSUER}/.well-known/jwks.json`;
export const COGNITO_AUDIENCE = process.env.REACT_APP_CLIENT_ID;
export const COGNITO_REGION = process.env.COGNITO_REGION!;
export const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
export const AWS_ACCESS_KEY_ID= process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY= process.env.AWS_SECRET_ACCESS_KEY;

