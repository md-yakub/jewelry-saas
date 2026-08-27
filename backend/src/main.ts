import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const instanceId = config.get<string>("INSTANCE_ID", "local");

  app.enableShutdownHooks();
  app.set("trust proxy", 1);

  app.use((_request: Request, response: Response, next: NextFunction) => {
    response.setHeader("X-Instance-Id", instanceId);
    next();
  });
  app.use(helmet());
  app.enableCors({
    origin: config.get<string>("CORS_ORIGIN", "http://localhost:5173"),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = config.get<number>("PORT", 3000);
  const nodeEnv = config.get<string>("NODE_ENV", "development");
  const swaggerEnabled =
    nodeEnv !== "production" ||
    config.get<string>("SWAGGER_ENABLED") === "true";

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Jewelry SaaS API")
      .setDescription(
        "OpenAPI documentation for the multi-tenant jewelry shop SaaS backend. Protected shop routes use JWT bearer authentication and are scoped by /shops/:shopId. Successful API responses are wrapped in a data envelope with a timestamp.",
      )
      .setVersion("1.0.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste the access token returned from login or refresh.",
        },
        "access-token",
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(port);

  const appUrl = await app.getUrl();
  console.log(`Application URL: ${appUrl}`);
  if (swaggerEnabled) {
    console.log(`Swagger URL: ${appUrl}/api/docs`);
  }
}

void bootstrap();
