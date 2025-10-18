import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly logger = new Logger(RabbitmqService.name);

  async onModuleInit() {
    try {
      const url = process.env.RABBITMQ_URL;
      if (!url) {
        throw new Error('RABBITMQ_URL environment variable is not set');
      }

      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      this.logger.log('Connected to RabbitMQ');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unknown error connecting to RabbitMQ';
      this.logger.error(`Failed to connect to RabbitMQ: ${message}`);
    }
  }

  async subscribe(
    exchange: string,
    routingKey: string,
    queue: string,
    callback: (msg: any) => Promise<void>,
  ) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    const q = await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(q.queue, exchange, routingKey);

    this.channel.consume(q.queue, async (msg) => {
      if (!msg) return;
      try {
        const content = JSON.parse(msg.content.toString());
        await callback(content);
        this.channel!.ack(msg);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unknown error in message handler';
        this.logger.error(`Error handling message: ${message}`);
        this.channel!.nack(msg, false, false);
      }
    });

    this.logger.log(
      `Subscribe on ${exchange} (${routingKey}) → queue: ${queue}`,
    );
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log('🔌 RabbitMQ connection closed');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unknown error closing connection';
      this.logger.error(`Error closing RabbitMQ connection: ${message}`);
    }
  }
}
