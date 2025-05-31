import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @MessagePattern({ cmd: 'create_project' })
  create(@Payload() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @MessagePattern({ cmd: 'find_all_projects' })
  findAll() {
    return this.projectsService.findAll();
  }

  @MessagePattern({ cmd: 'find_one_project' })
  findOne(@Payload() id: string) {
    return this.projectsService.findOne(id);
  }

  @MessagePattern({ cmd: 'find_projects_by_owner' })
  findByOwner(@Payload() ownerId: string) {
    return this.projectsService.findByOwner(ownerId);
  }

  @MessagePattern({ cmd: 'find_projects_by_member' })
  findByMember(@Payload() memberId: string) {
    return this.projectsService.findByMember(memberId);
  }

  @MessagePattern({ cmd: 'update_project' })
  update(@Payload() data: { id: string; updateProjectDto: UpdateProjectDto }) {
    return this.projectsService.update(data.id, data.updateProjectDto);
  }

  @MessagePattern({ cmd: 'remove_project' })
  remove(@Payload() id: string) {
    return this.projectsService.remove(id);
  }

  @MessagePattern({ cmd: 'add_project_member' })
  addMember(@Payload() data: { id: string; memberId: string }) {
    return this.projectsService.addMember(data.id, data.memberId);
  }

  @MessagePattern({ cmd: 'remove_project_member' })
  removeMember(@Payload() data: { id: string; memberId: string }) {
    return this.projectsService.removeMember(data.id, data.memberId);
  }
}