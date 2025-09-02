import AWS from 'aws-sdk';

export const getAwsCredentialsFromSSM = async (): Promise<{ accessKeyId: string; secretAccessKey: string }> => {
  const ssm = new AWS.SSM({ region: process.env.COGNITO_REGION });
  const accessKeyIdParam = await ssm.getParameter({
    Name: process.env.AWS_ACCESS_KEY_ID_SSM!,
    WithDecryption: true,
  }).promise();
  const secretAccessKeyParam = await ssm.getParameter({
    Name: process.env.AWS_SECRET_ACCESS_KEY_SSM!,
    WithDecryption: true,
  }).promise();

  const accessKeyId = accessKeyIdParam.Parameter?.Value;
  const secretAccessKey = secretAccessKeyParam.Parameter?.Value;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Failed to retrieve AWS credentials from SSM');
  }
  return { accessKeyId, secretAccessKey };
};