import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "@api/modules/auth";

import { NotificationPreference } from "./entities/notification-preference.entity";
import { PushSubscription } from "./entities/push-subscription.entity";
import { PushController } from "./push.controller";
import { PushService } from "./push.service";

@Module({
  imports: [TypeOrmModule.forFeature([PushSubscription, NotificationPreference]), AuthModule, ConfigModule],
  controllers: [PushController],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
