import { type INestApplication, VersioningType } from '@nestjs/common';
import { useContainer } from 'class-validator';
import compression from 'compression';
import helmet from 'helmet';
import { I18nValidationPipe } from 'nestjs-i18n';

import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';
import { settings } from '@/infrastructure/config/app.config';
import { setupSwagger } from '@/infrastructure/swagger/swagger.config';

import { AppModule } from './app.module';

export function configureApp(app: INestApplication): void {
  if (settings.API_PREFIX) app.setGlobalPrefix(settings.API_PREFIX);

  if (settings.API_VERSION) {
    app.enableVersioning({
      defaultVersion: settings.API_VERSION,
      type: VersioningType.URI,
    });
  }

  if (settings.CORS_ORIGIN.length > 0) {
    app.enableCors({
      credentials: settings.CORS_CREDENTIALS,
      methods: settings.CORS_METHODS,
      origin: settings.CORS_ORIGIN,
    });
  }

  app.use(
    helmet({
      ...(settings.NODE_ENV !== 'production' && {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'img-src': ["'self'", 'data:'],
            'script-src': ["'self'", "'unsafe-inline'"],
            'style-src': ["'self'", "'unsafe-inline'"],
          },
        },
      }),
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
    }),
  );
  app.use(compression());

  app.useGlobalPipes(
    new I18nValidationPipe({
      forbidNonWhitelisted: false,
      transform: true,
      whitelist: true,
    }),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalFilters(app.get(GlobalExceptionFilter));
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  setupSwagger(app);
}
