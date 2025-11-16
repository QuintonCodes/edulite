import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(otpCode: string, email: string) {
  const otpDigits = otpCode.split('');

  try {
    await transporter.sendMail({
      from: `EduLite <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your EduLite account',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #e3f2fd; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #e3f2fd; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                    <tr>
                      <td style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); padding: 48px 32px; text-align: center;">
                        <div style="width: 72px; height: 72px; background-color: #ffffff; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7V13C2 17.55 5.84 21.74 12 23C18.16 21.74 22 17.55 22 13V7L12 2Z" fill="#1976d2"/>
                            <path d="M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="#ffffff"/>
                          </svg>
                        </div>
                        <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">EduLite</h1>
                        <p style="color: #bbdefb; font-size: 14px; margin: 8px 0 0 0; font-weight: 400;">Learning Made Simple</p>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 48px 32px;">
                        <h2 style="color: #1e293b; font-size: 28px; font-weight: 600; margin: 0 0 12px 0; text-align: center;">Verify Your Email</h2>
                        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; text-align: center;">
                          Welcome to EduLite! We're excited to have you start your learning journey with us.
                        </p>

                        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                          Please use the verification code below to complete your registration:
                        </p>

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center" style="padding: 0 0 32px 0;">
                              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  ${otpDigits
                                    .map(
                                      (digit) => `
                                    <td style="padding: 0 6px;">
                                      <div style="width: 56px; height: 64px; background-color: #e3f2fd; border: 2px solid #1976d2; border-radius: 12px; text-align: center; line-height: 64px;">
                                        <span style="color: #1976d2; font-size: 32px; font-weight: 700; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; vertical-align: middle;">${digit}</span>
                                      </div>
                                    </td>
                                  `,
                                    )
                                    .join('')}
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                          <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                            <strong>⏰ Important:</strong> This code will expire in <strong>10 minutes</strong>. Please use it promptly.
                          </p>
                        </div>

                        <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                          <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.6; text-align: center;">
                            If you didn't request this code, please ignore this email or contact our support team at <a href="mailto:support@edulite.com" style="color: #1976d2; text-decoration: none; font-weight: 500;">support@edulite.com</a>
                          </p>
                        </div>

                        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                          <p style="color: #94a3b8; font-size: 13px; margin: 0 0 12px 0; text-align: center; font-weight: 500;">
                            🔒 Security Tips
                          </p>
                          <ul style="color: #94a3b8; font-size: 12px; margin: 0; padding: 0 0 0 20px; line-height: 1.8;">
                            <li>Never share this code with anyone</li>
                            <li>EduLite will never ask for your verification code</li>
                            <li>Always verify the sender's email address</li>
                          </ul>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
                          This email was sent to <strong style="color: #1976d2;">${email}</strong>
                        </p>
                        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 16px 0;">
                          © 2025 EduLite. All rights reserved.
                        </p>

                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                          <tr>
                            <td style="padding: 0 8px;">
                              <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 12px;">Privacy Policy</a>
                            </td>
                            <td style="color: #cbd5e1;">|</td>
                            <td style="padding: 0 8px;">
                              <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 12px;">Terms of Service</a>
                            </td>
                            <td style="color: #cbd5e1;">|</td>
                            <td style="padding: 0 8px;">
                              <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 12px;">Help Center</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to send email' };
  }
}
