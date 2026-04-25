import { Module } from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';
import { RiskAssessmentService } from './risk-assessment.service';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  TreatmentCodeService,
  TreatmentValidationService,
  TreatmentStateMachineService,
  TreatmentRiskService,
  TreatmentAccessService,
  TreatmentCompletenessService,
} from './services';

@Module({
  imports: [NotificationsModule],
  controllers: [TreatmentsController],
  providers: [
    TreatmentsService,
    RiskAssessmentService,
    TreatmentCodeService,
    TreatmentValidationService,
    TreatmentStateMachineService,
    TreatmentRiskService,
    TreatmentAccessService,
    TreatmentCompletenessService,
  ],
  exports: [TreatmentsService, RiskAssessmentService],
})
export class TreatmentsModule {}
