import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { AiAssistantService } from './ai-assistant.service';
import { SuggestDto, ValidateDto, ChatDto } from './dto/suggest.dto';

@Controller('ai')
export class AiAssistantController {
  constructor(private aiService: AiAssistantService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 sugerencias por minuto
  @Post('suggest')
  @HttpCode(HttpStatus.OK)
  async suggest(@Body() dto: SuggestDto) {
    const result = await this.aiService.suggest(dto);
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 validaciones por minuto
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validate(@Body() dto: ValidateDto) {
    const result = await this.aiService.validate(dto);
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 mensajes de chat por minuto
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatDto) {
    const result = await this.aiService.chat(dto);
    return result;
  }
}
