import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailService } from '../mail/mail.service';
import { TokenCleanupService } from './token-cleanup.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    ScheduleModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, MailService, TokenCleanupService],
  exports: [AuthService],
})
export class AuthModule {}
