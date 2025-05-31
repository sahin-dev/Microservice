import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const project = await this.projectsRepository.create(createProjectDto);
    
    // Notify members if any are added during creation
    if (project.members && project.members.length > 0) {
      this.notificationClient.emit('project_member_added', {
        projectId: project._id,
        projectName: project.name,
        memberIds: project.members,
      });
    }
    
    return project;
  }

  findAll() {
    return this.projectsRepository.findAll();
  }

  findOne(id: string) {
    return this.projectsRepository.findOne(id);
  }

  findByOwner(ownerId: string) {
    return this.projectsRepository.findByOwner(ownerId);
  }

  findByMember(memberId: string) {
    return this.projectsRepository.findByMember(memberId);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const oldProject = await this.projectsRepository.findOne(id);
    const updatedProject = await this.projectsRepository.update(id, updateProjectDto);
    
    // Notify about status change
    if (oldProject.status !== updatedProject.status) {
      this.notificationClient.emit('project_status_changed', {
        projectId: updatedProject._id,
        projectName: updatedProject.name,
        oldStatus: oldProject.status,
        newStatus: updatedProject.status,
      });
    }
    
    // Notify new members
    if (updateProjectDto.members) {
      const oldMemberIds = oldProject.members.map(id => id.toString());
      const newMemberIds = updateProjectDto.members;
      
      const addedMembers = newMemberIds.filter(id => !oldMemberIds.includes(id));
      
      if (addedMembers.length > 0) {
        this.notificationClient.emit('project_member_added', {
          projectId: updatedProject._id,
          projectName: updatedProject.name,
          memberIds: addedMembers,
        });
      }
    }
    
    return updatedProject;
  }

  async remove(id: string) {
    const project = await this.projectsRepository.findOne(id);
    
    // Notify members about project deletion
    if (project.members && project.members.length > 0) {
      this.notificationClient.emit('project_deleted', {
        projectId: project._id,
        projectName: project.name,
        memberIds: project.members,
      });
    }
    
    return this.projectsRepository.remove(id);
  }

  async addMember(id: string, memberId: string) {
    const updatedProject = await this.projectsRepository.addMember(id, memberId);
    
    // Notify the new member
    this.notificationClient.emit('project_member_added', {
      projectId: updatedProject._id,
      projectName: updatedProject.name,
      memberIds: [memberId],
    });
    
    return updatedProject;
  }

  async removeMember(id: string, memberId: string) {
    const updatedProject = await this.projectsRepository.removeMember(id, memberId);
    
    // Notify the removed member
    this.notificationClient.emit('project_member_removed', {
      projectId: updatedProject._id,
      projectName: updatedProject.name,
      memberId: memberId,
    });
    
    return updatedProject;
  }
}