import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    // For development/testing: Use Gmail SMTP or Ethereal (fake SMTP)
    // For production: Configure your preferred email service
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');
    const emailService = this.configService.get<string>(
      'EMAIL_SERVICE',
      'gmail',
    );

    if (!emailUser || !emailPassword) {
      // Use Ethereal for testing if no credentials configured
      this.logger.warn(
        'No email credentials found. Using Ethereal test account...',
      );
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.logger.log(`Ethereal test account created: ${testAccount.user}`);
      } catch (error) {
        // If Ethereal fails (network issue), create a local test transport
        this.logger.warn(
          'Failed to connect to Ethereal. Using local test transport.',
        );
        this.transporter = nodemailer.createTransport({
          host: 'localhost',
          port: 1025,
          secure: false,
          ignoreTLS: true,
        });
        this.logger.warn(
          '⚠️  Email transport configured but no SMTP server available. Emails will not be sent.',
        );
        this.logger.warn(
          '💡 To enable emails, configure EMAIL_USER and EMAIL_PASSWORD in .env',
        );
      }
    } else {
      // Use configured email service
      this.transporter = nodemailer.createTransport({
        service: emailService,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });
      this.logger.log(`Email service configured with ${emailService}`);
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string,
  ): Promise<boolean> {
    try {
      const frontendUrl = this.configService.get<string>(
        'FRONTEND_URL',
        'http://localhost:5173',
      );
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: this.configService.get<string>(
          'EMAIL_FROM',
          '"Catálogos SaaS" <noreply@catalogos-saas.com>',
        ),
        to: email,
        subject: 'Recuperación de Contraseña - Catálogos SaaS',
        html: this.getPasswordResetEmailTemplate(
          userName,
          resetUrl,
          resetToken,
        ),
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Log preview URL for Ethereal
      if (info.messageId && info.messageId.includes('ethereal')) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`📧 Preview URL: ${previewUrl}`);
        }
      }

      this.logger.log(`✅ Password reset email sent to ${email}`);
      this.logger.log(`🔗 Reset URL: ${resetUrl}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${email}:`, error);
      // In development without email configured, still log the token for testing
      if (!this.configService.get<string>('EMAIL_USER')) {
        const frontendUrl = this.configService.get<string>(
          'FRONTEND_URL',
          'http://localhost:5173',
        );
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        this.logger.warn(
          `⚠️  Email not sent, but you can use this URL for testing:`,
        );
        this.logger.warn(`🔗 ${resetUrl}`);
        this.logger.warn(`📝 Token: ${resetToken}`);
        // Return true so the user flow isn't interrupted in development
        return true;
      }
      return false;
    }
  }

  private getPasswordResetEmailTemplate(
    userName: string,
    resetUrl: string,
    resetToken: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f24427; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #f24427; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .token-box { background: #fff; border: 2px dashed #ddd; padding: 15px; margin: 20px 0; text-align: center; font-size: 18px; font-weight: bold; letter-spacing: 2px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recuperación de Contraseña</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Catálogos SaaS.</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </div>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #0066cc;">${resetUrl}</p>
            <div class="token-box">
              Token: ${resetToken}
            </div>
            <p><strong>Este enlace expirará en 1 hora.</strong></p>
            <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo. Tu contraseña permanecerá sin cambios.</p>
            <p>Por seguridad, nunca compartas este enlace con nadie.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Catálogos SaaS. Todos los derechos reservados.</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
