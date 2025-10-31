import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const styles = {
  body: `
    backgroundColor: '#dbeafe';
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    margin: 0;
    padding: '40px 20px';
  `,
  container: `
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  `,
  header: `
    backgroundColor: '#2563eb',
    padding: '32px',
    textAlign: 'center' as const,
  `,
  logo: `
    width: '64px',
    height: '64px',
    marginBottom: '12px',
  `,
  brandName: `
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
    fontFamily: "'Poppins', sans-serif",
  `,
  content: `
    padding: '40px 32px',
  `,
  title: `
    color: '#1e293b',
    fontSize: '24px',
    fontWeight: '600',
    marginTop: 0,
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif",
  `,
  subtitle: `
    color: '#64748b',
    fontSize: '16px',
    fontWeight: '400',
    marginTop: 0,
    marginBottom: '24px',
    lineHeight: '1.6',
    fontFamily: "'Poppins', sans-serif",
  `,
  text: `
    color: '#475569',
    fontSize: '15px',
    fontWeight: '400',
    lineHeight: '1.6',
    marginBottom: '24px',
    fontFamily: "'Poppins', sans-serif",
  `,
  otpContainer: `
    padding: 15px 30px;
    border-radius: 6px;
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 3px;
    display: inline-block;
  `,
  otpBox: `
    width: '64px',
    height: '72px',
    backgroundColor: '#f1f5f9',
    border: '2px solid #2563eb',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '700',
    color: '#2563eb',
    fontFamily: "'Poppins', sans-serif",
  `,
  infoBox: `
    backgroundColor: '#f1f5f9',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '24px',
  `,
  infoText: `
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '400',
    margin: 0,
    lineHeight: '1.5',
    fontFamily: "'Poppins', sans-serif",
  `,
  footer: `
    backgroundColor: '#f8fafc',
    padding: '24px 32px',
    textAlign: 'center' as const,
    borderTop: '1px solid #e2e8f0',
  `,
  footerText: `
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '400',
    margin: '4px 0',
    fontFamily: "'Poppins', sans-serif",
  `,
};

export async function sendVerificationEmail(otpCode: string, email: string) {
  try {
    await resend.emails.send({
      from: 'EduLite <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your EduLite account',
      html: `
        <div style="${styles.container}">
          <div style="${styles.header}">
            <img
              src="/public/logo.png"
              alt="EduLite Logo"
              style="${styles.logo}"
            />
            <h1 style="${styles.brandName}">EduLite</h1>
          </div>

          {/* Main Content */}
          <div style="${styles.content}">
            <h2 style="${styles.title}">Verify Your Email</h2>
            <p style="${styles.subtitle}">
              Welcome to EduLite! We're excited to have you start your learning journey.
            </p>

            <p style="${styles.text}">
              To complete your registration, please use the verification code below:
            </p>

            {/* OTP Display */}
            <div style="${styles.otpContainer}">
              ${otpCode}
            </div>

            <p style="${styles.text}">
              This code will expire in <strong>10 minutes</strong>.
            </p>

            <div style="${styles.infoBox}">
              <p style="${styles.infoText}">
                If you didn't request this code, please ignore this email or contact our support team.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style="${styles.footer}">
            <p style="${styles.footerText}">
              This email was sent to <strong>${email}</strong>
            </p>
            <p style="${styles.footerText}">
              © 2025 EduLite. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to send email' };
  }
}
