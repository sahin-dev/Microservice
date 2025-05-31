import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsRepository {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const createdProject = new this.projectModel({
      ...createProjectDto,
      ownerId: new Types.ObjectId(createProjectDto.ownerId),
      members: createProjectDto.members?.map(id => new Types.ObjectId(id)) || [],
    });
    return createdProject.save();
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel.find().exec();
  }

  async findOne(id: string): Promise<Project> {
    return this.projectModel.findById(id).exec();
  }

  async findByOwner(ownerId: string): Promise<Project[]> {
    return this.projectModel.find({ ownerId: new Types.ObjectId(ownerId) }).exec();
  }

  async findByMember(memberId: string): Promise<Project[]> {
    return this.projectModel.find({ members: new Types.ObjectId(memberId) }).exec();
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const updateData = { ...updateProjectDto };
    
    if (updateProjectDto.ownerId) {
      updateData.ownerId = new Types.ObjectId(updateProjectDto.ownerId);
    }
    
    if (updateProjectDto.members) {
      updateData.members = updateProjectDto.members.map(id => new Types.ObjectId(id));
    }
    
    return this.projectModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string): Promise<Project> {
    return this.projectModel.findByIdAndDelete(id).exec();
  }

  async addMember(id: string, memberId: string): Promise<Project> {
    return this.projectModel.findByIdAndUpdate(
      id,
      { $addToSet: { members: new Types.ObjectId(memberId) } },
      { new: true },
    ).exec();
  }

  async removeMember(id: string, memberId: string): Promise<Project> {
    return this.projectModel.findByIdAndUpdate(
      id,
      { $pull: { members: new Types.ObjectId(memberId) } },
      { new: true },
    ).exec();
  }
}