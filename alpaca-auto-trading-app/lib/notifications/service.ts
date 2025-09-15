import webpush from 'web-push';
import nodemailer from 'nodemailer';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class NotificationService {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    // Configure web-push with VAPID keys only if they exist
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    
    if (publicKey && privateKey) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
        publicKey,
        privateKey
      );
    }

    // Configure email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendWebPush(userId: string, payload: NotificationPayload): Promise<void> {
    try {
      // Check if VAPID keys are configured
      if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        console.log(`VAPID keys not configured, skipping web push for user ${userId}`);
        return Promise.resolve();
      }

      // In a real app, you'd fetch the user's subscription from the database
      // For now, we'll simulate sending the notification
      console.log(`Sending web push to user ${userId}:`, payload);
      
      // Mock implementation - in real app, you'd fetch subscriptions from DB
      // and send to each subscription endpoint
      return Promise.resolve();
    } catch (error) {
      console.error('Web push error:', error);
      throw error;
    }
  }

  async sendEmail(emailPayload: EmailPayload): Promise<void> {
    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@example.com',
        to: emailPayload.to,
        subject: emailPayload.subject,
        text: emailPayload.text,
        html: emailPayload.html,
      });
    } catch (error) {
      console.error('Email error:', error);
      throw error;
    }
  }

  async notifyTradeExecution(userId: string, tradeDetails: any): Promise<void> {
    const payload: NotificationPayload = {
      title: 'Trade Executed',
      body: `${tradeDetails.side.toUpperCase()} ${tradeDetails.quantity} ${tradeDetails.symbol} at $${tradeDetails.price}`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: '/trading',
        type: 'trade_execution',
        symbol: tradeDetails.symbol,
      },
    };

    await this.sendWebPush(userId, payload);
  }

  async notifyRiskAlert(userId: string, alertDetails: any): Promise<void> {
    const payload: NotificationPayload = {
      title: 'Risk Alert',
      body: alertDetails.message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: '/trading',
        type: 'risk_alert',
        severity: alertDetails.severity,
      },
    };

    await this.sendWebPush(userId, payload);
  }

  async notifyAISignal(userId: string, signalDetails: any): Promise<void> {
    const payload: NotificationPayload = {
      title: 'AI Trading Signal',
      body: `${signalDetails.action.toUpperCase()} signal for ${signalDetails.symbol} (${Math.round(signalDetails.confidence * 100)}% confidence)`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: '/trading',
        type: 'ai_signal',
        symbol: signalDetails.symbol,
        action: signalDetails.action,
        confidence: signalDetails.confidence,
      },
    };

    await this.sendWebPush(userId, payload);
  }
}

export const notificationService = new NotificationService();
