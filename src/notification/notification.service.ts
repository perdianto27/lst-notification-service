import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly rabbitmq: RabbitmqService) {}

  async onModuleInit() {
    // Subscribe ke event inventory.updated
    await this.waitForRabbitMQ();

    this.rabbitmq
      .subscribe(
        'inventory-exchange',
        'inventory.updated',
        'notification-listener', // queue name
        (msg) => this.handleInventoryUpdated(msg),
      )
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`❌ Failed to subscribe: ${message}`);
      });
  }

  private async waitForRabbitMQ(retries = 10, delayMs = 500) {
    for (let i = 0; i < retries; i++) {
      if (this.rabbitmq['channel']) return;
      this.logger.warn(`Waiting for RabbitMQ channel... (${i + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
    throw new Error('RabbitMQ channel not initialized after waiting');
  }

  private async handleInventoryUpdated(data: any): Promise<void> {
    const { itemId, userId, newStock } = data;

    this.logger.log(
      `📣 Order successfully processed for user ${userId}, item ${itemId}, new stock: ${newStock}`,
    );
  }
}
