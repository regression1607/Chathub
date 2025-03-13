import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files from the 'public' directory
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}
bootstrap()