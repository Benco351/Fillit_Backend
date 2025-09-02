import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.COGNITO_REGION || process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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
    await sesClient.send(new SendEmailCommand(params));
    return true;
  } catch (error) {
    console.error("SES sendEmail error:", error);
    return false;
  }
}