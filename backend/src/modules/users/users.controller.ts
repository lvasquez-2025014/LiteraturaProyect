import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { UsersService } from './services/users.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { UserRole } from './schemas/user.schema.js';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN_ROLE', 'TEACHER_ROLE')
  async getUsers(@Query('role') role?: UserRole) {
    const users = await this.usersService.findAll(role);
    // Remove hashed passwords before sending
    return users.map((u) => {
      const { password, ...safeUser } = u;
      return safeUser;
    });
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
    return safeUser;
  }

  @Patch(':id/role')
  @Roles('ADMIN_ROLE')
  async updateRole(
    @Param('id') id: string,
    @Body() body: { role: UserRole; grade?: string; section?: string },
  ) {
    if (!body.role) {
      throw new BadRequestException('El rol es obligatorio');
    }
    const updated = await this.usersService.updateRole(id, body.role, body.grade, body.section);
    if (!updated) {
      throw new BadRequestException('Estudiante o docente no encontrado');
    }
    const { password, ...safeUser } = updated;
    return safeUser;
  }

  @Delete(':id')
  @Roles('ADMIN_ROLE')
  async deleteUser(@Param('id') id: string) {
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
}
