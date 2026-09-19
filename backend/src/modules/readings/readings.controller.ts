import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { ReadingsService } from './services/readings.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { ReadingDocument } from './schemas/reading.schema.js';

@Controller('readings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @Get()
  @Roles('STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE')
  async getAll() {
    const list = await this.readingsService.findAll();
    return list.map((r) => ({
      ...r,
      id: r._id ? r._id.toString() : r.id,
    }));
  }

  @Get(':id')
  @Roles('STUDENT_ROLE', 'TEACHER_ROLE', 'ADMIN_ROLE')
  async getOne(@Param('id') id: string) {
    const reading = await this.readingsService.findById(id);
    if (!reading) throw new BadRequestException('Lectura no encontrada');
    return {
      ...reading,
      id: reading._id ? reading._id.toString() : reading.id,
    };
  }

  @Post()
  @Roles('TEACHER_ROLE', 'ADMIN_ROLE')
  async create(@Body() body: Partial<ReadingDocument>) {
    if (!body.title || !body.content) {
      throw new BadRequestException('El título y el contenido son obligatorios');
    }
    const created = await this.readingsService.create(body);
    return {
      ...created,
      id: created._id ? created._id.toString() : created.id,
    };
  }

  @Put(':id')
  @Roles('TEACHER_ROLE', 'ADMIN_ROLE')
  async update(@Param('id') id: string, @Body() body: Partial<ReadingDocument>) {
    if (!id || id === 'undefined' || id === 'null') {
      throw new BadRequestException('ID de lectura no válido');
    }
    const updated = await this.readingsService.update(id, body);
    if (!updated) throw new BadRequestException('Lectura no encontrada');
    return {
      ...updated,
      id: updated._id ? updated._id.toString() : updated.id,
    };
  }

  @Delete(':id')
  @Roles('TEACHER_ROLE', 'ADMIN_ROLE')
  async delete(@Param('id') id: string) {
    if (!id || id === 'undefined' || id === 'null') {
      throw new BadRequestException('ID de lectura no válido');
    }
    const success = await this.readingsService.delete(id);
    return { success };
  }
}
