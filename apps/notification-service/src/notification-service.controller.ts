import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern({ cmd: 'create_notification' })
  create(@Payload() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @MessagePattern({ cmd: 'find_all_notifications' })
  findAll() {
    return this.notificationsService.findAll();
  }

  @MessagePattern({ cmd: 'find_notifications_by_user' })
  findByUser(@Payload() userId: string) {
    return this.notificationsService.findByUser(userId);
  }

  @MessagePattern({ cmd: 'find_unread_notifications_by_user' })
  findUnreadByUser(@Payload() userId: string) {
    return this.notificationsService.findUnreadByUser(userId);
  }

  @MessagePattern({ cmd: 'mark_notification_as_read' })
  markAsRead(@Payload() id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @MessagePattern({ cmd: 'mark_all_notifications_as_read' })
  markAllAsRead(@Payload() userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @MessagePattern({ cmd: 'remove_notification' })
  remove(@Payload() id: string) {
    return this.notificationsService.remove(id);
  }

  @MessagePattern({ cmd: 'remove_all_notifications_by_user' })
  removeAllByUser(@Payload() userId: string) {
    return this.notificationsService.removeAllByUser(userId);
  }

  // Event handlers
  @EventPattern('task_assigned')
  handleTaskAssigned(@Payload() data: any) {
    return this.notificationsService.handleTaskAssigned(data);
  }

  @EventPattern('task_status_changed')
  handleTaskStatusChanged(@Payload() data: any) {
    return this.notificationsService.handleTaskStatusChanged(data);
  }

  @EventPattern('project_member_added')
  handleProjectMemberAdded(@Payload() data: any) {
    return this.notificationsService.handleProjectMemberAdded(data);
  }

  @EventPattern('project_member_removed')
  handleProjectMemberRemoved(@Payload() data: any) {
    return this.notificationsService.handleProjectMemberRemoved(data);
  }

  @EventPattern('project_status_changed')
  handleProjectStatusChanged(@Payload() data: any) {
    return this.notificationsService.handleProjectStatusChanged(data);
  }

  @EventPattern('project_deleted')
  handleProjectDeleted(@Payload() data: any) {
    return this.notificationsService.handleProjectDeleted(data);
  }

  @EventPattern('deadline_approaching')
  handleDeadlineApproaching(@Payload() data: any) {
    return this.notificationsService.handleDeadlineApproaching(data);
  }
}