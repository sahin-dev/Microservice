import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ProjectsModule } from './project-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(ProjectsModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'project_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  
  await app.listen();
  console.log('Project service is listening');
}
bootstrap();