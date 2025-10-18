import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationModule } from './notification/notification.module';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';

@Module({
  imports: [NotificationModule],
  controllers: [AppController],
  providers: [AppService, RabbitmqService],
})
export class AppModule {}
