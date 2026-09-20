import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/services/users.service.js';
import { UserDocument } from '../users/schemas/user.schema.js';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private googleClientId: string;

  constructor(@Inject(UsersService) private readonly usersService: UsersService) {
    this.jwtSecret = process.env.JWT_SECRET || '';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '2h';
    this.googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    this.googleClient = new OAuth2Client(this.googleClientId);
  }

  private generateToken(user: UserDocument): string {
    const rawAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : '';
    const adminEmailConfig = rawAdminEmail
      ? rawAdminEmail
          .toLowerCase()
          .split(',')
          .map((e) => e.trim())
          .filter((e) => e.length > 0)
      : [];
    const isSuperAdmin = adminEmailConfig.includes((user.email || '').toLowerCase().trim());

    const payload = {
      id: user._id ? user._id.toString() : '',
      email: user.email,
      name: user.name,
      role: user.role,
      isSuperAdmin,
      avatarUrl: user.avatarUrl,
      grade: user.grade,
      section: user.section,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as any,
    });
  }

  private formatUserResponse(user: UserDocument, token: string) {
    const rawAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : '';
    const adminEmailConfig = rawAdminEmail
      ? rawAdminEmail
          .toLowerCase()
          .split(',')
          .map((e) => e.trim())
          .filter((e) => e.length > 0)
      : [];
    const isSuperAdmin = adminEmailConfig.includes((user.email || '').toLowerCase().trim());
    const isAdmin = user.role === 'ADMIN_ROLE';

    return {
      token,
      user: {
        id: user._id ? user._id.toString() : '',
        email: user.email,
        name: user.name,
        role: user.role,
        isSuperAdmin,
        avatarUrl: user.avatarUrl || '',
        grade: user.grade,
        section: user.section,
        stats: user.stats,
        coins: isAdmin ? 99999 : (user.coins ?? 60),
        equippedTitle: user.equippedTitle || 'Cadete de las Letras',
        equippedFrame: user.equippedFrame || 'frame-default',
      },
    };
  }

  async login(email?: string, password?: string) {
    if (!email || !password) {
      throw new BadRequestException('El correo y la contraseña son obligatorios');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generateToken(user);
    return this.formatUserResponse(user, token);
  }

  async loginWithGoogle(idToken?: string) {
    if (!idToken) {
      throw new BadRequestException('Token de Google requerido');
    }

    try {
      let payload: { email?: string; name?: string; picture?: string; sub?: string } | undefined;

      try {
        const ticket = await this.googleClient.verifyIdToken({
          idToken,
          audience: this.googleClientId,
        });
        const p = ticket.getPayload();
        if (p) {
          payload = {
            email: p.email,
            name: p.name,
            picture: p.picture,
            sub: p.sub,
          };
        }
      } catch (verifyErr: any) {
        console.warn('[Google Auth] Verificación local falló, consultando endpoint de Google...', verifyErr?.message);
        const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (!res.ok) {
          throw verifyErr;
        }
        const data = (await res.json()) as any;
        if (this.googleClientId && data.aud !== this.googleClientId) {
          throw new UnauthorizedException('Audiencia del token de Google no coincide');
        }
        payload = {
          email: data.email,
          name: data.name,
          picture: data.picture,
          sub: data.sub,
        };
      }

      if (!payload || !payload.email) {
        throw new UnauthorizedException('Token de Google inválido o sin correo');
      }

      const email = payload.email.toLowerCase();
      const name = payload.name || '';
      const picture = payload.picture || '';
      const googleId = payload.sub;

      let user = await this.usersService.findByEmail(email);

      // Autorización de rol Administrador estrictamente desde variable de entorno ADMIN_EMAIL
      const rawAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : '';
      const adminEmailConfig = rawAdminEmail
        ? rawAdminEmail
            .toLowerCase()
            .split(',')
            .map((e) => e.trim())
            .filter((e) => e.length > 0)
        : [];

      const isAdminAccount = adminEmailConfig.length > 0 && adminEmailConfig.includes(email);

      if (!user) {
        const initialRole = isAdminAccount ? 'ADMIN_ROLE' : 'STUDENT_ROLE';
        console.log(`[Google Auth] Registrando nueva cuenta institucional en MongoDB: ${email} con rol [${initialRole}]`);
        user = await this.usersService.createStudent(email, name, picture, googleId);
        if (initialRole === 'ADMIN_ROLE' && user._id) {
          await this.usersService.updateRole(user._id.toString(), 'ADMIN_ROLE');
          await this.usersService.updateProfile(user._id.toString(), { coins: 99999 });
          user.role = 'ADMIN_ROLE';
          user.coins = 99999;
        }
      } else {
        if (isAdminAccount && user.role !== 'ADMIN_ROLE' && user._id) {
          console.log(`[Google Auth] Asegurando rol de Administrador para cuenta designada: ${email}`);
          await this.usersService.updateRole(user._id.toString(), 'ADMIN_ROLE');
          user.role = 'ADMIN_ROLE';
        }
        if (user.role === 'ADMIN_ROLE' && user._id) {
          await this.usersService.updateProfile(user._id.toString(), { coins: 99999 });
          user.coins = 99999;
        }
        console.log(`[Google Auth] Cuenta institucional existente autenticada: ${email} con rol [${user.role}]`);
        if (picture && user.avatarUrl !== picture && user._id) {
          await this.usersService.updateProfile(user._id.toString(), { avatarUrl: picture });
          user.avatarUrl = picture;
        }
      }

      const token = this.generateToken(user);
      return this.formatUserResponse(user, token);
    } catch (err: any) {
      console.error('[Google Auth] Error en autenticación con Google:', err);
      throw new UnauthorizedException(err.message || 'Error autenticando con Google');
    }
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Cuenta no encontrada o no autorizada');
    }
    const rawAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : '';
    const adminEmailConfig = rawAdminEmail
      ? rawAdminEmail
          .toLowerCase()
          .split(',')
          .map((e) => e.trim())
          .filter((e) => e.length > 0)
      : [];
    const isSuperAdmin = adminEmailConfig.includes((user.email || '').toLowerCase().trim());
    const { password, ...safeUser } = user;
    return {
      ...safeUser,
      id: user._id ? user._id.toString() : '',
      isSuperAdmin,
    };
  }
}
