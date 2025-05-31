import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwtAuthGuard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findByUser(@Request() req) {
    return this.notificationsService.findByUser(req.user.userId);
  }

  @Get('unread')
  findUnreadByUser(@Request() req) {
    return this.notificationsService.findUnreadByUser(req.user.userId);
  }

  @Post(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  @Delete()
  removeAll(@Request() req) {
    return this.notificationsService.removeAllByUser(req.user.userId);
  }
}