import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ClassroomActivitiesService } from './services/classroom-activities.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';

@Controller('classroom-activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassroomActivitiesController {
  constructor(private readonly service: ClassroomActivitiesService) {}

  @Get('active')
  @Roles('STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE')
  async getActive(@Req() req: any) {
    const user = req.user;
    const activity = await this.service.findActive(user?.grade, user?.section);
    if (!activity) {
      return null;
    }
    return {
      ...activity,
      id: activity._id ? activity._id.toString() : activity.id,
    };
  }

  @Get()
  @Roles('TEACHER_ROLE', 'ADMIN_ROLE')
  async getAll() {
    const list = await this.service.findAll();
    return list.map((a) => ({
      ...a,
      id: a._id ? a._id.toString() : a.id,
    }));
  }

  @Get(':id')
  @Roles('STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE')
  async getOne(@Param('id') id: string) {
    const activity = await this.service.findById(id);
    if (!activity) throw new NotFoundException('Actividad no encontrada');
    return {
      ...activity,
      id: activity._id ? activity._id.toString() : activity.id,
    };
  }

  @Get(':id/ranking')
  @Roles('STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE')
  async getRanking(@Param('id') id: string) {
    return this.service.getRanking(id);
  }

  @Post()
  @Roles('TEACHER_ROLE', 'ADMIN_ROLE')
  async create(@Body() body: any, @Req() req: any) {
    if (!body.title || !body.content) {
      throw new BadRequestException('El título y el contenido de la lectura son requeridos');
    }
    const teacherId = req.user?.id || 'docente';
    const teacherName = req.user?.name || 'Profesor de Literatura';
    const created = await this.service.create(body, teacherId, teacherName);
    return {
      ...created,
      id: created._id ? created._id.toString() : created.id,
    };
  }

  @Patch(':id/status')
  @Roles('TEACHER_ROLE', 'ADMIN_ROLE')
  async updateStatus(@Param('id') id: string, @Body('status') status: 'ACTIVE' | 'FINISHED' | 'DRAFT') {
    if (!status) throw new BadRequestException('El estado es requerido');
    const success = await this.service.updateStatus(id, status);
    return { success };
  }

  @Post(':id/submit')
  @Roles('STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE')
  async submitAttempt(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const user = req.user;
    if (!user) throw new BadRequestException('Usuario no autenticado');

    const score = Number(body.score) || 0;
    const wpm = Number(body.wpm) || 0;
    const timeSpentSeconds = Number(body.timeSpentSeconds) || 0;
    const correctAnswersCount = Number(body.correctAnswersCount) || 0;
    const totalQuestions = Number(body.totalQuestions) || 0;
    const micUsed = Boolean(body.micUsed);
    const infractionsCount = Number(body.infractionsCount) || 0;

    const result = await this.service.submitAttempt(id, {
      studentId: user.id || user._id,
      studentName: user.name || 'Estudiante',
      studentEmail: user.email || '',
      grade: user.grade || '',
      section: user.section || '',
      carnet: user.carnet || '',
      avatarUrl: user.avatarUrl || '',
      score,
      wpm,
      timeSpentSeconds,
      correctAnswersCount,
      totalQuestions,
      micUsed,
      infractionsCount,
    });

    return result;
  }
}
