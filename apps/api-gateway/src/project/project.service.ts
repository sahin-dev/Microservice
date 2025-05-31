import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject('PROJECT_SERVICE') private projectClient: ClientProxy,
    @Inject('SEARCH_SERVICE') private searchClient: ClientProxy,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const project = await firstValueFrom(
      this.projectClient.send({ cmd: 'create_project' }, createProjectDto),
    );
    
    // Index the project for search
    this.searchClient.emit('index_project', project);
    
    return project;
  }

  findAll() {
    return firstValueFrom(
      this.projectClient.send({ cmd: 'find_all_projects' }, {}),
    );
  }

  findOne(id: string) {
    return firstValueFrom(
      this.projectClient.send({ cmd: 'find_one_project' }, id),
    );
  }

  findByOwner(ownerId: string) {
    return firstValueFrom(
      this.projectClient.send({ cmd: 'find_projects_by_owner' }, ownerId),
    );
  }

  findByMember(memberId: string) {
    return firstValueFrom(
      this.projectClient.send({ cmd: 'find_projects_by_member' }, memberId),
    );
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await firstValueFrom(
      this.projectClient.send(
        { cmd: 'update_project' },
        { id, updateProjectDto },
      ),
    );
    
    // Update the project in search index
    this.searchClient.emit('index_project', project);
    
    return project;
  }

  async remove(id: string) {
    const project = await firstValueFrom(
      this.projectClient.send({ cmd: 'remove_project' }, id),
    );
    
    // Remove the project from search index
    this.searchClient.emit('remove_project_index', id);
    
    return project;
  }

  addMember(id: string, memberId: string) {
    return firstValueFrom(
      this.projectClient.send(
        { cmd: 'add_project_member' },
        { id, memberId },
      ),
    );
  }

  removeMember(id: string, memberId: string) {
    return firstValueFrom(
      this.projectClient.send(
        { cmd: 'remove_project_member' },
        { id, memberId },
      ),
    );
  }
}