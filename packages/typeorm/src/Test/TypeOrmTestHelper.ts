import { DynamicModule, ForwardReference, Module, Provider, Type } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmMySqlModuleRootOptions } from '../TypeOrmMySqlModule';

// load encodings - JEST hack
import iconv from 'iconv-lite';
import encodings from 'iconv-lite/encodings';
import { EntitySchema } from 'typeorm';
iconv['encodings'] = encodings;
// load encodings - JEST hack

export const TypeOrmMySqlTestingModuleRootOptions = {
  imports: TypeOrmMySqlModuleRootOptions.imports,
  inject: TypeOrmMySqlModuleRootOptions.inject,
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
    let options: any = await TypeOrmMySqlModuleRootOptions.useFactory(configService);
    return {
      type: options.type,
      host: options.host,
      port: options.port,
      username: options.username,
      password: options.password,
      database: options.database,
      charset: options.charset,
      retryAttempts: options.retryAttempts,
      retryDelay: options.retryDelay,
      namingStrategy: options.namingStrategy,
      synchronize: true,
      dropSchema: true,
      autoLoadEntities: true,
      logging: false,
      loggerLevel: 'error',
    };
  },
};

export interface MySqlTestingModuleOptions {
  imports: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
  providers?: Provider[];
}

export function MySqlTestingModule(options: MySqlTestingModuleOptions): Promise<TestingModule> {
  const imports = [TypeOrmModule.forRootAsync(TypeOrmMySqlTestingModuleRootOptions), ...options.imports];
  return Test.createTestingModule({
    imports,
    providers: options.providers ?? [],
  }).compile();
}
