import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly rabbitmq: RabbitmqService) {}

  async onModuleInit() {
    // Tunggu koneksi RabbitMQ siap
    await this.waitForRabbitMQ();

    // ✅ Subscribe ke event inventory.updated
    this.rabbitmq
      .subscribe(
        'inventory-exchange',
        'inventory.updated',
        'notification-inventory-updated', // queue name
        (msg) => this.handleInventoryUpdated(msg),
      )
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `❌ Failed to subscribe inventory.updated: ${message}`,
        );
      });

    // ✅ Subscribe ke event inventory.failed
    this.rabbitmq
      .subscribe(
        'inventory-exchange',
        'inventory.failed',
        'notification-inventory-failed', // queue name
        (msg) => this.handleInventoryFailed(msg),
      )
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `❌ Failed to subscribe inventory.failed: ${message}`,
        );
      });
  }

  /**
   * Tunggu koneksi RabbitMQ sebelum melakukan subscribe
   */
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

  private async handleInventoryFailed(data: any): Promise<void> {
    const { itemId, userId, reason } = data;

    this.logger.warn(
      `⚠️ Inventory failed for user ${userId}, item ${itemId}. Reason: ${reason}`,
    );
  }
}
