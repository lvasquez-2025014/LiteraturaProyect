import { Controller, Post, Body, Get, UseGuards, BadRequestException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookie(res: Response, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  private clearAuthCookie(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });
  }

  @Post('login')
  async login(
    @Body() body: { email?: string; password?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(body.email, body.password);
    this.setAuthCookie(res, result.token);
    return result;
  }

  @Post('google')
  async googleLogin(
    @Body() body: { idToken?: string; credential?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = body.idToken || body.credential;
    if (!token) {
      throw new BadRequestException('Se requiere idToken o credential de Google');
    }
    const result = await this.authService.loginWithGoogle(token);
    this.setAuthCookie(res, result.token);
    return result;
  }

  @Get('config')
  getPublicConfig() {
    return {
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @Post('renew')
  @UseGuards(JwtAuthGuard)
  async renewToken(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.renewToken(user.id);
    this.setAuthCookie(res, result.token);
    return result;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookie(res);
    return { ok: true, message: 'Sesión cerrada correctamente' };
  }
}
