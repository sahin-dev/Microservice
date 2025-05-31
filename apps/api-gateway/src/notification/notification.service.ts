import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
  ) {}

  findByUser(userId: string) {
    return firstValueFrom(
      this.notificationClient.send(
        { cmd: 'find_notifications_by_user' },
        userId,
      ),
    );
  }

  findUnreadByUser(userId: string) {
    return firstValueFrom(
      this.notificationClient.send(
        { cmd: 'find_unread_notifications_by_user' },
        userId,
      ),
    );
  }

  markAsRead(id: string) {
    return firstValueFrom(
      this.notificationClient.send(
        { cmd: 'mark_notification_as_read' },
        id,
      ),
    );
  }

  markAllAsRead(userId: string) {
    return firstValueFrom(
      this.notificationClient.send(
        { cmd: 'mark_all_notifications_as_read' },
        userId,
      ),
    );
  }

  remove(id: string) {
    return firstValueFrom(
      this.notificationClient.send(
        { cmd: 'remove_notification' },
        id,
      ),
    );
  }

  removeAllByUser(userId: string) {
    return firstValueFrom(
      this.notificationClient.send(
        { cmd: 'remove_all_notifications_by_user' },
        userId,
      ),
    );
  }
}