import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { NotificationsModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(NotificationsModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'notification_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  
  await app.listen();
  console.log('Notification service is listening');
}
bootstrap();