import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe — strips unknown fields, whitelist, throws on bad input
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS — restrict to allowed origins from .env
  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS || 'http://localhost:5173'
  )
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // Swagger — production-grade API documentation
  const config = new DocumentBuilder()
    .setTitle('Store Management System API')
    .setDescription(
      'Production-ready API for the Store Management System. ' +
        'Handles GRN, SRN, Stock Control Cards, Store Issue Vouchers, ' +
        'Employees, Departments, and Role-based Access Control.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addTag('Authentication', 'Login and token management')
    .addTag('employees', 'Employee CRUD')
    .addTag('department', 'Department management')
    .addTag('role', 'Role management')
    .addTag('grn', 'Goods Receiving Notes')
    .addTag('srn', 'Store Requisition Notes')
    .addTag('store-issue-voucher', 'Store Issue Vouchers')
    .addTag('scc', 'Stock Control Cards')
    .addTag('addtostock', 'Add GRN items to stock')
    .addTag('out-stock', 'Issue stock from SRN')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Store Management API running on: http://localhost:${port}`);
  console.log(`📖 Swagger docs: http://localhost:${port}/api`);
}
bootstrap();
