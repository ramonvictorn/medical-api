import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto, CreateMultipleExamDto } from './dto/create-exam.dto';
import { UpdateExamDto, UpdateMultipleExamsDto } from './dto/update-exam.dto';
import { SearchExamDto } from './dto/search-exam.dto';
import { RemoveMultiplesExamsDto } from './dto/delete-multples-exams.dto';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(@Body() createExamDto: CreateExamDto) {
    return this.examsService.create(createExamDto);
  }

  @Post('/multiples')
  createMultiple(@Body() createMultipleExamDto: CreateMultipleExamDto) {
    return this.examsService.createMultiple(createMultipleExamDto);
  }

  @Patch('/multiples')
  updateMultiples(@Body() updateMultiplesExamsDto: UpdateMultipleExamsDto) {
    return this.examsService.updateMultiples(updateMultiplesExamsDto);
  }

  @Get()
  findAll(@Query() query: SearchExamDto) {
    return this.examsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.examsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateExamDto: UpdateExamDto,
  ) {
    return this.examsService.update(id, updateExamDto);
  }

  @Delete('/multiples')
  removeMultiples(@Body() removeMultiplesExamsDto: RemoveMultiplesExamsDto) {
    return this.examsService.removeMultiples(removeMultiplesExamsDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.examsService.remove(id);
  }

  @Patch(':id/toggle-lab/:laboratoryId')
  toggleExamOnLaboratory(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('laboratoryId', new ParseUUIDPipe({ version: '4' }))
    laboratoryId: string,
  ) {
    return this.examsService.toggleExamOnLaboratory(id, laboratoryId);
  }
}
