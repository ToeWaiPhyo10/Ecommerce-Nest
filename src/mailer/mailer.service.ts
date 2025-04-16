import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailerService {
  constructor() {}
  mailTransport() {
    // For Gmail, we need to use the EMAIL_FROM as the username
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    // if (isProduction) {
    //   // Production email configuration (real delivery)
    //   return nodemailer.createTransport({
    //     service: process.env.EMAIL_SERVICE, // 'gmail', 'sendgrid', etc.
    //     auth: {
    //       user: process.env.EMAIL_USERNAME,
    //       pass: process.env.EMAIL_PASSWORD,
    //     },
    //   });
    // } else {
    //   // Development email configuration (Mailtrap)
    //   return nodemailer.createTransport({
    //     host: process.env.EMAIL_HOST, // 'sandbox.smtp.mailtrap.io'
    //     port: Number(process.env.EMAIL_PORT), // 2525
    //     secure: false,
    //     auth: {
    //       user: process.env.EMAIL_USERNAME,
    //       pass: process.env.EMAIL_PASSWORD,
    //     },
    //   });
    // }
  }

  async sendMail(sendMailDto: Mail.Options) {
    const transporter = this.mailTransport();
    try {
      // Make sure we have a from address
      if (!sendMailDto.from) {
        sendMailDto.from = process.env.EMAIL_FROM || 'noreply@example.com';
      }

      const result = await transporter.sendMail(sendMailDto);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
