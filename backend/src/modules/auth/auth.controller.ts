import { Controller, Post, Body, Get, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email?: string; password?: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('google')
  async googleLogin(@Body() body: { idToken?: string; credential?: string }) {
    const token = body.idToken || body.credential;
    if (!token) {
      throw new BadRequestException('Se requiere idToken o credential de Google');
    }
    return this.authService.loginWithGoogle(token);
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
  async renewToken(@CurrentUser() user: any) {
    return this.authService.renewToken(user.id);
  }
}
