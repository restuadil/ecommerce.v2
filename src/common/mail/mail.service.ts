import { Inject, Injectable } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import * as nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { Logger } from "winston";

import { ConfigService } from "src/config/config.service";
@Injectable()
export class MailService {
  constructor(
    @Inject("MAIL_TRANSPORTER")
    private readonly transporter: nodemailer.Transporter,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async sendMail(options: MailOptions): Promise<void> {
    try {
      const from = this.configService.get<string>("EMAIL_FROM");
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.info(`Email sent to ${JSON.stringify(options.to)}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error}`);
      throw error;
    }
  }
}
