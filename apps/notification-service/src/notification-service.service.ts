import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationsRepository } from './notifications.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationType } from './schemas/notification.schema';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return this.notificationsRepository.create(createNotificationDto);
  }

  async findAll() {
    return this.notificationsRepository.findAll();
  }

  async findByUser(userId: string) {
    return this.notificationsRepository.findByUser(userId);
  }

  async findUnreadByUser(userId: string) {
    return this.notificationsRepository.findUnreadByUser(userId);
  }

  async markAsRead(id: string) {
    return this.notificationsRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string) {
    return this.notificationsRepository.markAllAsRead(userId);
  }

  async remove(id: string) {
    return this.notificationsRepository.remove(id);
  }

  async removeAllByUser(userId: string) {
    return this.notificationsRepository.removeAllByUser(userId);
  }

  // Event handlers
  async handleTaskAssigned(data: { taskId: string; assigneeId: string; taskTitle: string }) {
    const { taskId, assigneeId, taskTitle } = data;
    
    // Get user details
    const user = await firstValueFrom(
      this.userClient.send({ cmd: 'find_one_user' }, assigneeId),
    );
    
    if (!user) {
      return;
    }
    
    const notification: CreateNotificationDto = {
      type: NotificationType.TASK_ASSIGNED,
      message: `You have been assigned to task: ${taskTitle}`,
      userId: assigneeId,
      data: {
        taskId,
        taskTitle,
      },
    };
    
    return this.create(notification);
  }

  async handleTaskStatusChanged(data: {
    taskId: string;
    taskTitle: string;
    oldStatus: string;
    newStatus: string;
  }) {
    const { taskId, taskTitle, oldStatus, newStatus } = data;
    
    // In a real application, we would determine who should be notified
    // For simplicity, we'll assume we know the user ID
    const userId = data.userId || '60d0fe4f5311236168a109ca'; // Placeholder
    
    const notification: CreateNotificationDto = {
      type: NotificationType.TASK_STATUS_CHANGED,
      message: `Task "${taskTitle}" status changed from ${oldStatus} to ${newStatus}`,
      userId,
      data: {
        taskId,
        taskTitle,
        oldStatus,
        newStatus,
      },
    };
    
    return this.create(notification);
  }

  async handleProjectMemberAdded(data: {
    projectId: string;
    projectName: string;
    memberIds: string[];
  }) {
    const { projectId, projectName, memberIds } = data;
    
    const notifications = [];
    
    for (const memberId of memberIds) {
      const notification: CreateNotificationDto = {
        type: NotificationType.PROJECT_MEMBER_ADDED,
        message: `You have been added to project: ${projectName}`,
        userId: memberId,
        data: {
          projectId,
          projectName,
        },
      };
      
      notifications.push(this.create(notification));
    }
    
    return Promise.all(notifications);
  }

  async handleProjectMemberRemoved(data: {
    projectId: string;
    projectName: string;
    memberId: string;
  }) {
    const { projectId, projectName, memberId } = data;
    
    const notification: CreateNotificationDto = {
      type: NotificationType.PROJECT_MEMBER_REMOVED,
      message: `You have been removed from project: ${projectName}`,
      userId: memberId,
      data: {
        projectId,
        projectName,
      },
    };
    
    return this.create(notification);
  }

  async handleProjectStatusChanged(data: {
    projectId: string;
    projectName: string;
    oldStatus: string;
    newStatus: string;
    memberIds: string[];
  }) {
    const { projectId, projectName, oldStatus, newStatus, memberIds } = data;
    
    const notifications = [];
    
    for (const memberId of memberIds) {
      const notification: CreateNotificationDto = {
        type: NotificationType.PROJECT_STATUS_CHANGED,
        message: `Project "${projectName}" status changed from ${oldStatus} to ${newStatus}`,
        userId: memberId,
        data: {
          projectId,
          projectName,
          oldStatus,
          newStatus,
        },
      };
      
      notifications.push(this.create(notification));
    }
    
    return Promise.all(notifications);
  }

  async handleProjectDeleted(data: {
    projectId: string;
    projectName: string;
    memberIds: string[];
  }) {
    const { projectId, projectName, memberIds } = data;
    
    const notifications = [];
    
    for (const memberId of memberIds) {
      const notification: CreateNotificationDto = {
        type: NotificationType.PROJECT_DELETED,
        message: `Project "${projectName}" has been deleted`,
        userId: memberId,
        data: {
          projectId,
          projectName,
        },
      };
      
      notifications.push(this.create(notification));
    }
    
    return Promise.all(notifications);
  }

  async handleDeadlineApproaching(data: {
    taskId: string;
    taskTitle: string;
    dueDate: Date;
    assigneeId: string;
  }) {
    const { taskId, taskTitle, dueDate, assigneeId } = data;
    
    const notification: CreateNotificationDto = {
      type: NotificationType.DEADLINE_APPROACHING,
      message: `Task "${taskTitle}" is due soon: ${new Date(dueDate).toLocaleDateString()}`,
      userId: assigneeId,
      data: {
        taskId,
        taskTitle,
        dueDate,
      },
    };
    
    return this.create(notification);
  }
}