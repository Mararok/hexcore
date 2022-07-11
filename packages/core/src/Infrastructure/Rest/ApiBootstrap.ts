import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { exit } from 'process';
import { AllExceptionFilter } from './AllExceptionFilter';
import { injectSwagger } from './SwaggerBootstrap';
import { createFastifyAdapter } from './FastifyBootstrap';
import { HexcoreLogger } from '../../Util/Logger';

export interface ApiBootstrapOptions {
  mainModule: any;
  appName: string;
  appVersion: string;
  serverPort: number;
}

export async function apiBootstrap(options: ApiBootstrapOptions): Promise<void> {
  const apiLogger = HexcoreLogger.create('api');
  const allExceptionFilter = new AllExceptionFilter(apiLogger);
  const adapter = await createFastifyAdapter(allExceptionFilter);
  const app = await NestFactory.create<NestFastifyApplication>(options.mainModule, adapter, {
    logger: apiLogger,
  });
  app.useGlobalFilters(allExceptionFilter);

  injectSwagger(app, options.appName, options.appVersion);

  app.enableShutdownHooks();

  /*process.on('SIGINT', function () {
    console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
    setTimeout(function () {
      exit(0);
    }, 1000);
    app.close().then(() => {
      process.exit(0);
    });
  });*/

  await app.listen(options.serverPort, '0.0.0.0');
}
