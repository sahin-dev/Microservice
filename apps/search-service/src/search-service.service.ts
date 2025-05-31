import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService implements OnModuleInit {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  // Trie data structure for autocomplete
  private taskTrie = new Map();
  private projectTrie = new Map();
  private userTrie = new Map();

  async onModuleInit() {
    await this.createIndices();
  }

  private async createIndices() {
    const indices = ['tasks', 'projects', 'users'];
    
    for (const index of indices) {
      const exists = await this.elasticsearchService.indices.exists({ index });
      
      if (!exists) {
        await this.elasticsearchService.indices.create({
          index,
          body: {
            mappings: {
              properties: {
                id: { type: 'keyword' },
                title: { type: 'text' },
                description: { type: 'text' },
                name: { type: 'text' },
                tags: { type: 'keyword' },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' },
              },
            },
          },
        });
      }
    }
  }

  async indexTask(task: any) {
    // Add to Elasticsearch
    await this.elasticsearchService.index({
      index: 'tasks',
      id: task._id.toString(),
      body: {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        projectId: task.projectId.toString(),
        assigneeId: task.assigneeId ? task.assigneeId.toString() : null,
        status: task.status,
        priority: task.priority,
        tags: task.tags,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });
    
    // Add to Trie for autocomplete
    this.addToTrie(this.taskTrie, task.title.toLowerCase(), task);
  }

  async indexProject(project: any) {
    // Add to Elasticsearch
    await this.elasticsearchService.index({
      index: 'projects',
      id: project._id.toString(),
      body: {
        id: project._id.toString(),
        name: project.name,
        description: project.description,
        ownerId: project.ownerId.toString(),
        members: project.members.map(id => id.toString()),
        status: project.status,
        tags: project.tags,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
    
    // Add to Trie for autocomplete
    this.addToTrie(this.projectTrie, project.name.toLowerCase(), project);
  }

  async indexUser(user: any) {
    // Add to Elasticsearch
    await this.elasticsearchService.index({
      index: 'users',
      id: user._id.toString(),
      body: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        skills: user.skills,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
    
    // Add to Trie for autocomplete
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    this.addToTrie(this.userTrie, fullName, user);
    this.addToTrie(this.userTrie, user.email.toLowerCase(), user);
  }

  private addToTrie(trie: Map<string, any>, key: string, value: any) {
    let node = trie;
    
    // Add each character to the trie
    for (let i = 0; i &lt; key.length; i++) {
      const char = key[i];
      if (!node.has(char)) {
        node.set(char, new Map());
      }
      node = node.get(char);
      
      // Store the value at each node for prefix search
      if (!node.has('values')) {
        node.set('values', []);
      }
      
      // Avoid duplicates
      const values = node.get('values');
      const exists = values.some(v => v._id.toString() === value._id.toString());
      if (!exists) {
        values.push(value);
      }
    }
  }

  async removeTask(taskId: string) {
    // Remove from Elasticsearch
    await this.elasticsearchService.delete({
      index: 'tasks',
      id: taskId,
    });
    
    // Note: For a production system, we would need a more sophisticated approach
    // to remove items from the Trie. For simplicity, we're not implementing that here.
  }

  async removeProject(projectId: string) {
    await this.elasticsearchService.delete({
      index: 'projects',
      id: projectId,
    });
  }

  async removeUser(userId: string) {
    await this.elasticsearchService.delete({
      index: 'users',
      id: userId,
    });
  }

  async search(query: string, indices: string[] = ['tasks', 'projects', 'users']) {
    return this.elasticsearchService.search({
      index: indices,
      body: {
        query: {
          multi_match: {
            query,
            fields: ['title', 'description', 'name', 'firstName', 'lastName', 'tags'],
            fuzziness: 'AUTO',
          },
        },
      },
    });
  }

  async searchTasks(query: string) {
    return this.elasticsearchService.search({
      index: 'tasks',
      body: {
        query: {
          multi_match: {
            query,
            fields: ['title', 'description', 'tags'],
            fuzziness: 'AUTO',
          },
        },
      },
    });
  }

  async searchProjects(query: string) {
    return this.elasticsearchService.search({
      index: 'projects',
      body: {
        query: {
          multi_match: {
            query,
            fields: ['name', 'description', 'tags'],
            fuzziness: 'AUTO',
          },
        },
      },
    });
  }

  async searchUsers(query: string) {
    return this.elasticsearchService.search({
      index: 'users',
      body: {
        query: {
          multi_match: {
            query,
            fields: ['firstName', 'lastName', 'email', 'skills'],
            fuzziness: 'AUTO',
          },
        },
      },
    });
  }

  // Autocomplete using Trie
  autocompleteTask(prefix: string, limit: number = 10) {
    return this.autocomplete(this.taskTrie, prefix.toLowerCase(), limit);
  }

  autocompleteProject(prefix: string, limit: number = 10) {
    return this.autocomplete(this.projectTrie, prefix.toLowerCase(), limit);
  }

  autocompleteUser(prefix: string, limit: number = 10) {
    return this.autocomplete(this.userTrie, prefix.toLowerCase(), limit);
  }

  private autocomplete(trie: Map<string, any>, prefix: string, limit: number) {
    let node = trie;
    
    // Navigate to the node representing the prefix
    for (let i = 0; i &lt; prefix.length; i++) {
      const char = prefix[i];
      if (!node.has(char)) {
        return []; // Prefix not found
      }
      node = node.get(char);
    }
    
    // Return the values at this node (if any)
    if (node.has('values')) {
      return node.get('values').slice(0, limit);
    }
    
    return [];
  }
}