import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksRepository } from './tasks.repository';
import { TaskStatus } from './schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    // Check for circular dependencies if dependsOn is provided
    if (createTaskDto.dependsOn && createTaskDto.dependsOn.length > 0) {
      const hasCircular = await this.tasksRepository.checkCircularDependency(
        null, // New task doesn't have an ID yet
        createTaskDto.dependsOn,
      );
      
      if (hasCircular) {
        throw new Error('Circular dependency detected');
      }
    }
    
    const task = await this.tasksRepository.create(createTaskDto);
    
    // Send notification if task is assigned to someone
    if (task.assigneeId) {
      this.notificationClient.emit('task_assigned', {
        taskId: task._id,
        assigneeId: task.assigneeId,
        taskTitle: task.title,
      });
    }
    
    return task;
  }

  findAll() {
    return this.tasksRepository.findAll();
  }

  findOne(id: string) {
    return this.tasksRepository.findOne(id);
  }

  findByProject(projectId: string) {
    return this.tasksRepository.findByProject(projectId);
  }

  findByAssignee(assigneeId: string) {
    return this.tasksRepository.findByAssignee(assigneeId);
  }

  findByStatus(status: TaskStatus) {
    return this.tasksRepository.findByStatus(status);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    // Check for circular dependencies if dependsOn is updated
    if (updateTaskDto.dependsOn && updateTaskDto.dependsOn.length > 0) {
      const hasCircular = await this.tasksRepository.checkCircularDependency(
        id,
        updateTaskDto.dependsOn,
      );
      
      if (hasCircular) {
        throw new Error('Circular dependency detected');
      }
    }
    
    const oldTask = await this.tasksRepository.findOne(id);
    const updatedTask = await this.tasksRepository.update(id, updateTaskDto);
    
    // Send notification if status changed
    if (oldTask.status !== updatedTask.status) {
      this.notificationClient.emit('task_status_changed', {
        taskId: updatedTask._id,
        taskTitle: updatedTask.title,
        oldStatus: oldTask.status,
        newStatus: updatedTask.status,
      });
    }
    
    // Send notification if assignee changed
    if (updateTaskDto.assigneeId && oldTask.assigneeId?.toString() !== updateTaskDto.assigneeId) {
      this.notificationClient.emit('task_assigned', {
        taskId: updatedTask._id,
        assigneeId: updatedTask.assigneeId,
        taskTitle: updatedTask.title,
      });
    }
    
    return updatedTask;
  }

  remove(id: string) {
    return this.tasksRepository.remove(id);
  }
}