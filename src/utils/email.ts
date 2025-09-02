import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { getAwsCredentialsFromSSM } from "./aws";


let sesClient: SESClient | null = null;

async function getSesClient(): Promise<SESClient> {
  if (!sesClient) {
    const creds = await getAwsCredentialsFromSSM();
    sesClient = new SESClient({
      region: process.env.COGNITO_REGION || process.env.AWS_REGION,
      credentials: {
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
      },
    });
  }
  return sesClient;
}

export async function sendEmail(to: string, subject: string, htmlBody: string, textBody?: string) {
  const params = {
    Destination: { ToAddresses: [to] },
    Message: {
      Body: {
        Html: { Data: htmlBody },
        ...(textBody ? { Text: { Data: textBody } } : {}),
      },
      Subject: { Data: subject },
    },
    Source: process.env.SES_SENDER_EMAIL!,
  };

  try {
    const client = await getSesClient();
    await client.send(new SendEmailCommand(params));
    return true;
  } catch (error) {
    console.error("SES sendEmail error:", error);
    return false;
  }
}