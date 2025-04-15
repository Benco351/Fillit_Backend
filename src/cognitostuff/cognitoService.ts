// // const AWS = require('aws-sdk');
// // const jwt = require('jsonwebtoken');

// // const cognito = new AWS.CognitoIdentityServiceProvider();
// // const cliendId = process.env.COGNITO_CLIENT_ID;

// // const userparams = {};

// // //signup
// // const data = await cognito.signUp(userparams).promice();

// // //login
// // const data = await cognito.initiateAuth(userparams).promice();


// // awsConfig.ts
// import AWS from 'aws-sdk';

// AWS.config.update({
//   region: 'us-east-1', // replace with your region
//   credentials: new AWS.Credentials({
//     accessKeyId: 'YOUR_ACCESS_KEY',
//     secretAccessKey: 'YOUR_SECRET_KEY',
//   }),
// });

// export const cognito = new AWS.CognitoIdentityServiceProvider();

// // signup.ts 
// //import { cognito } from './awsConfig';

// export async function signUpUser(email: string, password: string) {
//   const params = {
//     ClientId: 'YOUR_APP_CLIENT_ID', // no secret
//     Username: email,
//     Password: password,
//     UserAttributes: [
//       {
//         Name: 'email',
//         Value: email,
//       },
//     ],
//   };

//   try {
//     const result = await cognito.signUp(params).promise();
//     console.log('Signup successful:', result);
//   } catch (err) {
//     console.error('Signup failed:', err);
//   }
// }


// export async function loginUser(email: string, password: string) {
//     const params = {
//       AuthFlow: 'ADMIN_NO_SRP_AUTH',
//       ClientId: 'YOUR_APP_CLIENT_ID',
//       UserPoolId: 'YOUR_USER_POOL_ID',
//       AuthParameters: {
//         USERNAME: email,
//         PASSWORD: password,
//       },
//     };
  
//     try {
//       const result = await cognito.adminInitiateAuth(params).promise();
//       console.log('Login successful');
//       console.log('ID Token:', result.AuthenticationResult?.IdToken);
//       console.log('Access Token:', result.AuthenticationResult?.AccessToken);
//       console.log('Refresh Token:', result.AuthenticationResult?.RefreshToken);
//     } catch (err) {
//       console.error('Login failed:', err);
//     }
//   }
//   //////////////////////////////////////////////////////////////
//   import AWS from 'aws-sdk';
//   import crypto from 'crypto'
  
//   export default class Cognito {
//     private config = {
//       apiVersion: '2016-04-18',
//       region: 'ca-central-1',
//     }
//     private secretHash = '10j74r0nsekujafhd777t01omagltb34m16mvrb8e3v6rfop7ud3'
//     private clientId = '7lkobomofk4vsi2iktb0mdmaeq';
  
//     private cognitoIdentity;
  
//     constructor(){
//       this.cognitoIdentity = new AWS.CognitoIdentityServiceProvider(this.config)
//     }
  
//     public async signUpUser(username: string, password: string, userAttr: Array<any>): Promise<boolean> {
      
//       var params = {
//         ClientId: this.clientId, /* required */
//         Password: password, /* required */
//         Username: username, /* required */
//         SecretHash: this.hashSecret(username),
//         UserAttributes: userAttr,
//       }
  
//       try {
//         const data = await this.cognitoIdentity.signUp(params).promise()
//         console.log(data)
//         return true
//       } catch (error) {
//         console.log(error)
//         return false
//       }
//     }
  
//     public async signInUser(username: string, password: string): Promise<boolean> {
//       var params = {
//         AuthFlow: 'USER_PASSWORD_AUTH', /* required */
//         ClientId: this.clientId, /* required */
//         AuthParameters: {
//           'USERNAME': username,
//           'PASSWORD': password,
//           'SECRET_HASH': this.hashSecret(username)
//         },
//       }
  
//       try {
//         let data = await this.cognitoIdentity.initiateAuth(params).promise();
//         console.log(data); 
//         return true;
//       } catch (error) {
//         console.log(error)
//         return false;
//       }
//     }
  
//     public async confirmSignUp(username: string, code: string): Promise<boolean> {
//       var params = {
//         ClientId: this.clientId,
//         ConfirmationCode: code,
//         Username: username,
//         SecretHash: this.hashSecret(username),
//       };
  
//       try {
//         const cognitoResp = await this.cognitoIdentity.confirmSignUp(params).promise();
//         console.log(cognitoResp)
//         return true
//       } catch (error) {
//         console.log("error", error)
//         return false
//       }
//     }
  
//     public async forgotPassword(username): Promise<boolean> {
//       var params = {
//         ClientId: this.clientId, /* required */
//         Username: username, /* required */
//         SecretHash: this.hashSecret(username),
//       }
  
//       try {
//         const data = await this.cognitoIdentity.forgotPassword(params).promise();
//         console.log(data);
//         return true
//       } catch (error) {
//         console.log(error);
//         return false;
//       }
//     }
  
//     public async confirmNewPassword(username: string, password: string, code: string): Promise<boolean> {
//       var params = {
//         ClientId: this.clientId, /* required */
//         ConfirmationCode: code, /* required */
//         Password: password, /* required */
//         Username: username, /* required */
//         SecretHash: this.hashSecret(username),
//       };
  
//       try {
//         const data = await this. cognitoIdentity.confirmForgotPassword(params).promise();
//         console.log(data);
//         return true;
//       } catch (error) {
//         console.log(error);
//         return false;
//       }
//     }
  
//     private hashSecret(username: string): string {
//       return crypto.createHmac('SHA256', this.secretHash)
//       .update(username + this.clientId)
//       .digest('base64')  
//     } 
//   }