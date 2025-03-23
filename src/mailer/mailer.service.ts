import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailerService {
  constructor() {}
  mailTransport() {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    return transporter;
  }

  async sendMail(sendMailDto: Mail.Options) {
    const transporter = this.mailTransport();
    try {
      const result = await transporter.sendMail(sendMailDto);
      return result;
    } catch (error) {}
  }
}
