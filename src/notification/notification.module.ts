import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Module({
  providers: [NotificationService, RabbitmqService],
})
export class NotificationModule {}
