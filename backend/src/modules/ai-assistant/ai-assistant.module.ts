import { Module } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';
import { AiAssistantController } from './ai-assistant.controller';

@Module({
  providers: [AiAssistantService],
  controllers: [AiAssistantController],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
