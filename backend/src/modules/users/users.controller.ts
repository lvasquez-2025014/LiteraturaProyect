import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './services/users.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import { UserRole } from './schemas/user.schema.js';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN_ROLE', 'TEACHER_ROLE')
  async getUsers(@Query('role') role?: UserRole) {
    const users = await this.usersService.findAll(role);
    const rawAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : '';
    const rootAdminEmails = rawAdminEmail
      ? rawAdminEmail
          .toLowerCase()
          .split(',')
          .map((e) => e.trim())
          .filter((e) => e.length > 0)
      : [];

    // Remove hashed passwords before sending y normalizar id + flag isSuperAdmin
    return users.map((u) => {
      const { password, ...safeUser } = u;
      const isSuperAdmin = rootAdminEmails.includes((u.email || '').toLowerCase().trim());
      return {
        ...safeUser,
        id: u._id ? u._id.toString() : (u as any).id,
        isSuperAdmin,
      };
    });
  }

  @Get('leaderboard')
  @Roles('STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE')
  async getLeaderboard(
    @Query('grade') grade?: string,
    @Query('section') section?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.usersService.getLeaderboard(grade, section, parsedLimit);
  }

  @Post()
  @Roles('ADMIN_ROLE')
  async createUser(
    @Body() body: { email: string; password?: string; name: string; role: UserRole; grade?: string; section?: string },
  ) {
    if (!body.email || !body.name || !body.role || !body.password) {
      throw new BadRequestException('Email, nombre, contraseña y rol son obligatorios');
    }

    const existing = await this.usersService.findByEmail(body.email);
    if (existing) {
      throw new BadRequestException('Ya existe una cuenta registrada con este correo electrónico');
    }

    const user = await this.usersService.createUser(
      body.email,
      body.password,
      body.name,
      body.role,
      body.grade || '',
      body.section || '',
    );

    const { password: _, ...safeUser } = user;
    return {
      ...safeUser,
      id: user._id ? user._id.toString() : (user as any).id,
    };
  }

  @Patch(':id/role')
  @Roles('ADMIN_ROLE')
  async updateRole(
    @Param('id') id: string,
    @Body() body: { role: UserRole; grade?: string; section?: string },
    @CurrentUser() requester: any,
  ) {
    if (!id || id === 'undefined' || id === 'null') {
      throw new BadRequestException('ID de estudiante o docente no válido');
    }
    if (!body.role) {
      throw new BadRequestException('El rol es obligatorio');
    }

    const targetUser = await this.usersService.findById(id);
    if (!targetUser) {
      throw new BadRequestException('Estudiante o docente no encontrado');
    }

    const rawAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : '';
    const rootAdminEmails = rawAdminEmail
      ? rawAdminEmail
          .toLowerCase()
          .split(',')
          .map((e) => e.trim())
          .filter((e) => e.length > 0)
      : [];

    const requesterEmail = (requester?.email || '').toLowerCase().trim();
    const isRequesterSuperAdmin = rootAdminEmails.includes(requesterEmail);
    const targetEmail = (targetUser.email || '').toLowerCase().trim();

    // 1. La cuenta del Administrador Principal configurada en .env no puede ser degradada
    if (rootAdminEmails.includes(targetEmail) && body.role !== 'ADMIN_ROLE') {
      throw new ForbiddenException('No se puede revocar el rol de Administrador Principal configurado en el .env');
    }

    // 2. Solo el Administrador Principal del .env puede cambiar o asignar roles de Administrador
    if ((targetUser.role === 'ADMIN_ROLE' || body.role === 'ADMIN_ROLE') && !isRequesterSuperAdmin) {
      throw new ForbiddenException('Solo el Administrador Principal configurado en el .env puede gestionar roles de Administrador');
    }

    const updated = await this.usersService.updateRole(id, body.role, body.grade, body.section);
    if (!updated) {
      throw new BadRequestException('Estudiante o docente no encontrado');
    }
    const { password, ...safeUser } = updated;
    return {
      ...safeUser,
      id: updated._id ? updated._id.toString() : (updated as any).id,
      isSuperAdmin: rootAdminEmails.includes(targetEmail),
    };
  }

  @Delete(':id')
  @Roles('ADMIN_ROLE')
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() requester: any,
  ) {
    if (!id || id === 'undefined' || id === 'null') {
      throw new BadRequestException('ID no válido');
    }

    const targetUser = await this.usersService.findById(id);
    if (!targetUser) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const rawAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : '';
    const rootAdminEmails = rawAdminEmail
      ? rawAdminEmail
          .toLowerCase()
          .split(',')
          .map((e) => e.trim())
          .filter((e) => e.length > 0)
      : [];

    const requesterEmail = (requester?.email || '').toLowerCase().trim();
    const isRequesterSuperAdmin = rootAdminEmails.includes(requesterEmail);
    const targetEmail = (targetUser.email || '').toLowerCase().trim();

    // 1. La cuenta del Administrador Principal configurada en el .env no puede ser eliminada
    if (rootAdminEmails.includes(targetEmail)) {
      throw new ForbiddenException('La cuenta del Administrador Principal configurada en el .env no puede ser eliminada');
    }

    // 2. No se puede eliminar a uno mismo
    if (requester?.id === id || requesterEmail === targetEmail) {
      throw new BadRequestException('No puedes eliminar tu propia cuenta');
    }

    // 3. Regla estricta: Los administradores NO pueden borrar a otros administradores, ÚNICAMENTE el del correo del .env
    if (targetUser.role === 'ADMIN_ROLE' && !isRequesterSuperAdmin) {
      throw new ForbiddenException('Los administradores no tienen permisos para eliminar a otros administradores. Solo el Administrador Principal del .env puede hacerlo.');
    }

    const deleted = await this.usersService.delete(id);
    return { success: deleted };
  }


  @Post(':id/reading-attempt')
  @Roles('STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE')
  async recordReadingAttempt(
    @Param('id') id: string,
    @Body() body: { wpm: number; comprehensionScore: number; xpEarned: number; readingLevel: number },
  ) {
    const updatedUser = await this.usersService.recordReadingAttempt(id, body);
    if (!updatedUser) {
      throw new BadRequestException('Estudiante no encontrado');
    }
    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }

  @Post(':id/claim-chest')
  @Roles('STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE')
  async claimChest(@Param('id') id: string) {
    const result = await this.usersService.claimDailyChest(id);
    if (!result.success) {
      throw new BadRequestException(result.message);
    }
    return result;
  }

  @Post(':id/claim-mission')
  @Roles('STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE')
  async claimMission(
    @Param('id') id: string,
    @Body() body: { missionId: string; rewardXp: number; rewardCoins: number },
  ) {
    if (!body.missionId) throw new BadRequestException('ID de misión requerido');
    const result = await this.usersService.claimMission(
      id,
      body.missionId,
      body.rewardXp || 40,
      body.rewardCoins || 15,
    );
    if (!result.success) {
      throw new BadRequestException(result.message);
    }
    return result;
  }

  @Patch(':id/cosmetics')
  @Roles('STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE')
  async updateCosmetics(
    @Param('id') id: string,
    @Body() body: { equippedTitle?: string; equippedFrame?: string },
  ) {
    const updated = await this.usersService.updateCosmetics(id, body.equippedTitle, body.equippedFrame);
    if (!updated) throw new BadRequestException('Estudiante no encontrado');
    return updated;
  }

  @Post(':id/buy-cosmetic')
  @Roles('STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE')
  async buyCosmetic(
    @Param('id') id: string,
    @Body() body: { cost: number; itemType: 'frame' | 'title'; itemId: string },
  ) {
    if (!body.itemId || !body.itemType || body.cost === undefined) {
      throw new BadRequestException('Datos del artículo incompletos');
    }
    const result = await this.usersService.buyCosmetic(id, body.cost, body.itemType, body.itemId);
    if (!result.success) {
      throw new BadRequestException(result.message);
    }
    return result;
  }
}
