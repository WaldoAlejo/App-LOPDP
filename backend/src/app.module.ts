import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { AreasModule } from './modules/areas/areas.module';
import { ProcessesModule } from './modules/processes/processes.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { ObservationsModule } from './modules/observations/observations.module';
import { VersionsModule } from './modules/versions/versions.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    AreasModule,
    ProcessesModule,
    CatalogsModule,
    TreatmentsModule,
    ObservationsModule,
    VersionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
