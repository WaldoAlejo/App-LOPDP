import { Controller, Post, Body, UseGuards, Request, Response, HttpCode, HttpStatus } from '@nestjs/common';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private shouldUseSecureCookies(): boolean {
    if (process.env.FORCE_HTTPS === 'true') {
      return true;
    }

    const frontendUrl = process.env.FRONTEND_URL;
    return typeof frontendUrl === 'string' && frontendUrl.startsWith('https://');
  }

  private getCookieOptions(maxAgeMs: number): any {
    const useSecureCookies = this.shouldUseSecureCookies();
    return {
      httpOnly: true,
      secure: useSecureCookies,
      sameSite: 'strict' as const,
      maxAge: maxAgeMs,
      path: '/',
    };
  }

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 15000 } }) // 5 intentos cada 15 segundos
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const result = await this.authService.login(dto);
    const accessMaxAge = 15 * 60 * 1000; // 15m
    const refreshMaxAge = 7 * 24 * 60 * 60 * 1000; // 7d
    res.cookie('access_token', result.tokens.accessToken, this.getCookieOptions(accessMaxAge));
    res.cookie('refresh_token', result.tokens.refreshToken, this.getCookieOptions(refreshMaxAge));
    return { user: result.user };
  }

  @Public()
  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 refresh por minuto
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Request() req: ExpressRequest,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return { message: 'No refresh token' };
    }
    const tokens = await this.authService.refresh(refreshToken);
    const accessMaxAge = 15 * 60 * 1000; // 15m
    const refreshMaxAge = 7 * 24 * 60 * 60 * 1000; // 7d
    res.cookie('access_token', tokens.accessToken, this.getCookieOptions(accessMaxAge));
    res.cookie('refresh_token', tokens.refreshToken, this.getCookieOptions(refreshMaxAge));
    return { message: 'Token refrescado' };
  }

  @Post('logout')
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req: ExpressRequest & { user: { sub: string } },
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const useSecureCookies = this.shouldUseSecureCookies();
    res.clearCookie('access_token', { path: '/', httpOnly: true, secure: useSecureCookies, sameSite: 'strict' });
    res.clearCookie('refresh_token', { path: '/', httpOnly: true, secure: useSecureCookies, sameSite: 'strict' });
    return this.authService.logout(req.user.sub);
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 solicitudes por hora
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() req: ExpressRequest & { user: { sub: string } }, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.sub, dto);
  }
}
