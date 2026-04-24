import { Module } from '@nestjs/common';
import { EmailConfigService } from './email-config.service';
import { EmailConfigController } from './email-config.controller';

@Module({
  providers: [EmailConfigService],
  controllers: [EmailConfigController],
  exports: [EmailConfigService],
})
export class EmailConfigModule {}
