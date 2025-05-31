import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query('q') query: string, @Query('type') type?: string) {
    if (type) {
      switch (type) {
        case 'tasks':
          return this.searchService.searchTasks(query);
        case 'projects':
          return this.searchService.searchProjects(query);
        case 'users':
          return this.searchService.searchUsers(query);
        default:
          return this.searchService.search(query);
      }
    }
    
    return this.searchService.search(query);
  }

  @Get('autocomplete')
  autocomplete(
    @Query('q') query: string,
    @Query('type') type: string,
    @Query('limit') limit?: number,
  ) {
    switch (type) {
      case 'tasks':
        return this.searchService.autocompleteTask(query, limit);
      case 'projects':
        return this.searchService.autocompleteProject(query, limit);
      case 'users':
        return this.searchService.autocompleteUser(query, limit);
      default:
        return { error: 'Invalid type. Use tasks, projects, or users.' };
    }
  }
}