import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    // Set the current user as the owner if not specified
    if (!createProjectDto.ownerId) {
      createProjectDto.ownerId = req.user.userId;
    }
    
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get('owner/:ownerId')
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.projectsService.findByOwner(ownerId);
  }

  @Get('member/:memberId')
  findByMember(@Param('memberId') memberId: string) {
    return this.projectsService.findByMember(memberId);
  }

  @Get('my-projects')
  findMyProjects(@Request() req) {
    return this.projectsService.findByOwner(req.user.userId);
  }

  @Get('my-memberships')
  findMyMemberships(@Request() req) {
    return this.projectsService.findByMember(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':id/members/:memberId')
  addMember(@Param('id') id: string, @Param('memberId') memberId: string) {
    return this.projectsService.addMember(id, memberId);
  }

  @Delete(':id/members/:memberId')
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string) {
    return this.projectsService.removeMember(id, memberId);
  }
}