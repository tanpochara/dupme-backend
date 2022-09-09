import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  console.log('the server is listening on port 3001');
  await app.listen(3001);
}
bootstrap();
