import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';
import Mail from 'nodemailer/lib/mailer';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('/send-mail')
  async sendMail(@Body() sendMailDto: Mail.Options) {
    return await this.mailerService.sendMail(sendMailDto);
  }
}
