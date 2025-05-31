import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './schemas/task.schema';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern({ cmd: 'create_task' })
  create(@Payload() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @MessagePattern({ cmd: 'find_all_tasks' })
  findAll() {
    return this.tasksService.findAll();
  }

  @MessagePattern({ cmd: 'find_one_task' })
  findOne(@Payload() id: string) {
    return this.tasksService.findOne(id);
  }

  @MessagePattern({ cmd: 'find_tasks_by_project' })
  findByProject(@Payload() projectId: string) {
    return this.tasksService.findByProject(projectId);
  }

  @MessagePattern({ cmd: 'find_tasks_by_assignee' })
  findByAssignee(@Payload() assigneeId: string) {
    return this.tasksService.findByAssignee(assigneeId);
  }

  @MessagePattern({ cmd: 'find_tasks_by_status' })
  findByStatus(@Payload() status: TaskStatus) {
    return this.tasksService.findByStatus(status);
  }

  @MessagePattern({ cmd: 'update_task' })
  update(@Payload() data: { id: string; updateTaskDto: UpdateTaskDto }) {
    return this.tasksService.update(data.id, data.updateTaskDto);
  }

  @MessagePattern({ cmd: 'remove_task' })
  remove(@Payload() id: string) {
    return this.tasksService.remove(id);
  }
}