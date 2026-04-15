import { Module } from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';
import { RiskAssessmentService } from './risk-assessment.service';

@Module({
  controllers: [TreatmentsController],
  providers: [TreatmentsService, RiskAssessmentService],
  exports: [TreatmentsService, RiskAssessmentService],
})
export class TreatmentsModule {}
