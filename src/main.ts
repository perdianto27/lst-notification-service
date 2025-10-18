import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  const port = process.env.PORT || 3002;
  await app.listen(port);
  new Logger('Bootstrap').log(`Inventory Service running on port ${port}`);
}

bootstrap();
