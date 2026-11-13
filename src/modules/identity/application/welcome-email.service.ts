import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class WelcomeEmailService {
  private readonly logger = new Logger(WelcomeEmailService.name);
  private transporter?: Transporter;

  constructor(private readonly config: ConfigService) {}

  async send(to: string, firstName: string): Promise<void> {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASSWORD');
    const from = this.config.get<string>('MAIL_FROM');
    if (!host || !user || !pass || !from) {
      this.logger.warn('Courriel de bienvenue non envoyé : configuration SMTP absente.');
      return;
    }

    try {
      this.transporter ??= nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT', 465),
        secure: this.config.get<string>('SMTP_SECURE', 'true') === 'true',
        auth: { user, pass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 12000,
      });
      const appUrl = this.config.get<string>('APP_PUBLIC_URL', 'https://www.surmesurestyle.com');
      const safeName = escapeHtml(firstName);
      await this.transporter.sendMail({
        from: { name: 'Sur Mesure Style', address: from },
        to,
        subject: 'Bienvenue chez Sur Mesure Style',
        text: `Bonjour ${firstName},\n\nBienvenue chez Sur Mesure Style. Votre compte est prêt. Vous pouvez vous connecter et retrouver vos créations, commandes et mensurations ici : ${appUrl}\n\nÀ bientôt,\nL’équipe Sur Mesure Style`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#392635;max-width:600px;margin:auto"><h1 style="color:#5e0a61">Bienvenue chez Sur Mesure Style</h1><p>Bonjour ${safeName},</p><p>Votre compte est prêt. Retrouvez vos créations, commandes et mensurations dans votre espace personnel.</p><p><a href="${escapeHtml(appUrl)}" style="display:inline-block;padding:12px 20px;background:#5e0a61;color:#fff;text-decoration:none;border-radius:24px">Ouvrir mon espace</a></p><p>À bientôt,<br>L’équipe Sur Mesure Style</p></div>`,
      });
    } catch (error) {
      this.logger.error(
        `Échec d’envoi du courriel de bienvenue : ${error instanceof Error ? error.message : 'erreur SMTP'}`,
      );
    }
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}
