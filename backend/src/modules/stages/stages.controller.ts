import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { StagesService } from './services/stages.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { StageDocument } from './schemas/stage.schema.js';

@Controller('stages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Get()
  @Roles('STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE')
  async getAll() {
    const list = await this.stagesService.findAll();
    return list.map((s) => ({
      ...s,
      id: s.id || (s._id ? s._id.toString() : s.stageNumber),
      _id: s._id ? s._id.toString() : undefined,
    }));
  }

  @Get(':id')
  @Roles('STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE')
  async getOne(@Param('id') id: string) {
    const stage = await this.stagesService.findById(id);
    if (!stage) throw new BadRequestException('Etapa no encontrada');
    return {
      ...stage,
      id: stage.id || (stage._id ? stage._id.toString() : stage.stageNumber),
      _id: stage._id ? stage._id.toString() : undefined,
    };
  }

  @Post()
  @Roles('TEACHER_ROLE', 'ADMIN_ROLE')
  async create(@Body() body: Partial<StageDocument>) {
    if (!body.title) {
      throw new BadRequestException('El título de la etapa es obligatorio');
    }
    const created = await this.stagesService.create(body);
    return {
      ...created,
      id: created.id || (created._id ? created._id.toString() : created.stageNumber),
      _id: created._id ? created._id.toString() : undefined,
    };
  }

  @Put(':id')
  @Roles('TEACHER_ROLE', 'ADMIN_ROLE')
  async update(@Param('id') id: string, @Body() body: Partial<StageDocument>) {
    if (!id || id === 'undefined' || id === 'null') {
      throw new BadRequestException('ID de etapa no válido');
    }
    const updated = await this.stagesService.update(id, body);
    if (!updated) throw new BadRequestException('Etapa no encontrada');
    return {
      ...updated,
      id: updated.id || (updated._id ? updated._id.toString() : updated.stageNumber),
      _id: updated._id ? updated._id.toString() : undefined,
    };
  }

  @Delete(':id')
  @Roles('TEACHER_ROLE', 'ADMIN_ROLE')
  async delete(@Param('id') id: string) {
    if (!id || id === 'undefined' || id === 'null') {
      throw new BadRequestException('ID de etapa no válido');
    }
    const success = await this.stagesService.delete(id);
    if (!success) throw new BadRequestException('No se pudo eliminar la etapa o no existe');
    return { success: true };
  }
}
