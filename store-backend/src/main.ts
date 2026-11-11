import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers (CSP disabled so Swagger UI still renders).
  app.use(helmet({ contentSecurityPolicy: false }));

  // Trust the Render/Cloudflare proxy so rate-limiting and IP logging use the
  // real client IP rather than the proxy's.
  const expressApp = app.getHttpAdapter().getInstance();
  if (typeof expressApp?.set === 'function') {
    expressApp.set('trust proxy', 1);
  }

  // Global validation pipe — strips unknown fields, whitelist, throws on bad input
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS — restrict to allowed origins from .env (comma-separated)
  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // Swagger — enabled in development or when explicitly requested via env.
  if (process.env.DISABLE_SWAGGER !== 'true') {
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
  }

  // Graceful shutdown so Prisma disconnects on SIGTERM (Render deploys).
  app.enableShutdownHooks();

  // Use PORT from environment (Render provides this), default to 3000
  // IMPORTANT: Listen on 0.0.0.0 to accept external requests on Render
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Store Management API running on: http://0.0.0.0:${port}`);
  logger.log(
    `📖 Swagger docs: ${
      process.env.DISABLE_SWAGGER === 'true' ? 'disabled' : `http://0.0.0.0:${port}/api`
    }`,
  );
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start application:', err);
  process.exit(1);
});
