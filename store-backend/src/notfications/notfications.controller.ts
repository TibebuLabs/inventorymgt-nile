import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notfications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * The employee id always comes from the JWT — never the query string — so a
   * user can only read their own notifications.
   */
  @Get()
  getNotifications(@Req() req: any) {
    return this.notificationsService.getNotifications(req.user.userId);
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }
}
