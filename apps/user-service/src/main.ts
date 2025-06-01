import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { UsersModule } from './user-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(UsersModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'user_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  
  await app.listen();
  console.log('User service is listening');
}
bootstrap();