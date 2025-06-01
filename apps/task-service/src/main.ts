import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { TasksModule } from './task-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(TasksModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'task_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  
  await app.listen();
  console.log('Task service is listening');
}
bootstrap();