import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.ORIGIN || 'http://localhost:3000',
    credentials: true,
  })

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
