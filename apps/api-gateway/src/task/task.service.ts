import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './interfaces/task.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TasksService {
  constructor(
    @Inject('TASK_SERVICE') private taskClient: ClientProxy,
    @Inject('SEARCH_SERVICE') private searchClient: ClientProxy,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const task = await firstValueFrom(
      this.taskClient.send({ cmd: 'create_task' }, createTaskDto),
    );
    
    // Index the task for search
    this.searchClient.emit('index_task', task);
    
    return task;
  }

  findAll() {
    return firstValueFrom(
      this.taskClient.send({ cmd: 'find_all_tasks' }, {}),
    );
  }

  findOne(id: string) {
    return firstValueFrom(
      this.taskClient.send({ cmd: 'find_one_task' }, id),
    );
  }

  findByProject(projectId: string) {
    return firstValueFrom(
      this.taskClient.send({ cmd: 'find_tasks_by_project' }, projectId),
    );
  }

  findByAssignee(assigneeId: string) {
    return firstValueFrom(
      this.taskClient.send({ cmd: 'find_tasks_by_assignee' }, assigneeId),
    );
  }

  findByStatus(status: TaskStatus) {
    return firstValueFrom(
      this.taskClient.send({ cmd: 'find_tasks_by_status' }, status),
    );
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await firstValueFrom(
      this.taskClient.send(
        { cmd: 'update_task' },
        { id, updateTaskDto },
      ),
    );
    
    // Update the task in search index
    this.searchClient.emit('index_task', task);
    
    return task;
  }

  async remove(id: string) {
    const task = await firstValueFrom(
      this.taskClient.send({ cmd: 'remove_task' }, id),
    );
    
    // Remove the task from search index
    this.searchClient.emit('remove_task_index', id);
    
    return task;
  }
}