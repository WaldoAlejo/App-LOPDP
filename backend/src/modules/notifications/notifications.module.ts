import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EmailConfigModule } from '../email-config/email-config.module';

@Module({
  imports: [EmailConfigModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
