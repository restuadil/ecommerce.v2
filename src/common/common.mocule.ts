import { Global, Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";

import { ConfigService } from "src/config/config.service";

import { GlobalFilter } from "./filters/global.filter";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LoggerInterceptor } from "./interceptors/logger.interceptor";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { JobModule } from "./job/job.module";
import { MailModule } from "./mail/mail.module";
import { MailService } from "./mail/mail.service";
import { PrismaService } from "./prisma/prisma.service";
import { RedisModule } from "./redis/redis.module";
import { RedisService } from "./redis/redis.service";

@Global()
@Module({
  imports: [RedisModule, MailModule, JobModule],
  providers: [
    ConfigService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    RedisService,
    MailService,
    PrismaService,
  ],
  exports: [ConfigService, RedisService, MailService, JobModule, PrismaService],
})
export class CommonModule {}
