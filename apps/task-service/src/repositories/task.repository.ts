import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const createdTask = new this.taskModel({
      ...createTaskDto,
      projectId: new Types.ObjectId(createTaskDto.projectId),
      assigneeId: createTaskDto.assigneeId ? new Types.ObjectId(createTaskDto.assigneeId) : null,
      dependsOn: createTaskDto.dependsOn?.map(id => new Types.ObjectId(id)) || [],
    });
    return createdTask.save();
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }

  async findOne(id: string): Promise<Task> {
    return this.taskModel.findById(id).exec();
  }

  async findByProject(projectId: string): Promise<Task[]> {
    return this.taskModel.find({ projectId: new Types.ObjectId(projectId) }).exec();
  }

  async findByAssignee(assigneeId: string): Promise<Task[]> {
    return this.taskModel.find({ assigneeId: new Types.ObjectId(assigneeId) }).exec();
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this.taskModel.find({ status }).exec();
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const updateData = { ...updateTaskDto };
    
    if (updateTaskDto.projectId) {
      updateData.projectId = new Types.ObjectId(updateTaskDto.projectId);
    }
    
    if (updateTaskDto.assigneeId) {
      updateData.assigneeId = new Types.ObjectId(updateTaskDto.assigneeId);
    }
    
    if (updateTaskDto.dependsOn) {
      updateData.dependsOn = updateTaskDto.dependsOn.map(id => new Types.ObjectId(id));
    }
    
    return this.taskModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string): Promise<Task> {
    return this.taskModel.findByIdAndDelete(id).exec();
  }

  async checkCircularDependency(taskId: string, dependsOnIds: string[]): Promise<boolean> {
    // Implementation of topological sort to detect circular dependencies
    const visited = new Set<string>();
    const temp = new Set<string>();
    
    const dfs = async (currentId: string): Promise<boolean> => {
      if (temp.has(currentId)) {
        return true; // Circular dependency detected
      }
      
      if (visited.has(currentId)) {
        return false;
      }
      
      const task = await this.taskModel.findById(currentId).exec();
      if (!task) {
        return false;
      }
      
      temp.add(currentId);
      
      for (const depId of task.dependsOn) {
        if (await dfs(depId.toString())) {
          return true;
        }
      }
      
      temp.delete(currentId);
      visited.add(currentId);
      
      return false;
    };
    
    // Check if adding these dependencies would create a cycle
    const tempTask = { _id: new Types.ObjectId(taskId), dependsOn: dependsOnIds.map(id => new Types.ObjectId(id)) };
    const mockDb = new Map<string, { dependsOn: Types.ObjectId[] }>();
    mockDb.set(taskId, { dependsOn: tempTask.dependsOn });
    
    // Add existing tasks to the mock DB
    const tasks = await this.taskModel.find().exec();
    for (const task of tasks) {
      if (task._id.toString() !== taskId) {
        mockDb.set(task._id.toString(), { dependsOn: task.dependsOn });
      }
    }
    
    // Check for cycles
    for (const depId of dependsOnIds) {
      if (await dfs(depId)) {
        return true; // Circular dependency detected
      }
    }
    
    return false;
  }
}