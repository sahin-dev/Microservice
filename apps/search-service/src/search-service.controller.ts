import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SearchService } from './search.service';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @MessagePattern({ cmd: 'index_task' })
  indexTask(@Payload() task: any) {
    return this.searchService.indexTask(task);
  }

  @MessagePattern({ cmd: 'index_project' })
  indexProject(@Payload() project: any) {
    return this.searchService.indexProject(project);
  }

  @MessagePattern({ cmd: 'index_user' })
  indexUser(@Payload() user: any) {
    return this.searchService.indexUser(user);
  }

  @MessagePattern({ cmd: 'remove_task_index' })
  removeTask(@Payload() taskId: string) {
    return this.searchService.removeTask(taskId);
  }

  @MessagePattern({ cmd: 'remove_project_index' })
  removeProject(@Payload() projectId: string) {
    return this.searchService.removeProject(projectId);
  }

  @MessagePattern({ cmd: 'remove_user_index' })
  removeUser(@Payload() userId: string) {
    return this.searchService.removeUser(userId);
  }

  @MessagePattern({ cmd: 'search' })
  search(@Payload() data: { query: string; indices?: string[] }) {
    return this.searchService.search(data.query, data.indices);
  }

  @MessagePattern({ cmd: 'search_tasks' })
  searchTasks(@Payload() query: string) {
    return this.searchService.searchTasks(query);
  }

  @MessagePattern({ cmd: 'search_projects' })
  searchProjects(@Payload() query: string) {
    return this.searchService.searchProjects(query);
  }

  @MessagePattern({ cmd: 'search_users' })
  searchUsers(@Payload() query: string) {
    return this.searchService.searchUsers(query);
  }

  @MessagePattern({ cmd: 'autocomplete_task' })
  autocompleteTask(@Payload() data: { prefix: string; limit?: number }) {
    return this.searchService.autocompleteTask(data.prefix, data.limit);
  }

  @MessagePattern({ cmd: 'autocomplete_project' })
  autocompleteProject(@Payload() data: { prefix: string; limit?: number }) {
    return this.searchService.autocompleteProject(data.prefix, data.limit);
  }

  @MessagePattern({ cmd: 'autocomplete_user' })
  autocompleteUser(@Payload() data: { prefix: string; limit?: number }) {
    return this.searchService.autocompleteUser(data.prefix, data.limit);
  }
}