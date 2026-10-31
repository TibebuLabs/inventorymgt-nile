import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notfications.service';
import * as jwt from 'jsonwebtoken';

/**
 * Real-time notification gateway.
 *
 * A socket is authenticated with the JWT it sends in the handshake
 * (`auth.token`). The token's `sub` claim is the employee id. We keep a map of
 * employeeId → socketIds so a notification can be delivered to every open tab
 * of the same user.
 */
@WebSocketGateway({
  cors: {
    origin: (
      process.env.ALLOWED_ORIGINS ||
      'http://localhost:5173,http://localhost:5174,http://localhost:3000'
    )
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
  },
  namespace: '/',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  /** employeeId → set of socket ids (supports multiple tabs/devices) */
  private employeeSockets = new Map<number, Set<string>>();

  constructor(private readonly notificationsService: NotificationsService) {}

  handleConnection(client: Socket) {
    const employeeId = this.extractEmployeeId(client);

    if (!employeeId) {
      this.logger.warn(
        `Socket ${client.id} connected without a valid auth token — disconnecting`,
      );
      client.disconnect(true);
      return;
    }

    (client.data as any).employeeId = employeeId;

    if (!this.employeeSockets.has(employeeId)) {
      this.employeeSockets.set(employeeId, new Set());
    }
    this.employeeSockets.get(employeeId)!.add(client.id);

    this.logger.log(
      `Employee ${employeeId} connected (socket: ${client.id}) — ${this.employeeSockets.get(employeeId)!.size} active`,
    );
  }

  handleDisconnect(client: Socket) {
    for (const [employeeId, sockets] of this.employeeSockets.entries()) {
      if (sockets.delete(client.id)) {
        if (sockets.size === 0) {
          this.employeeSockets.delete(employeeId);
        }
        this.logger.log(
          `Employee ${employeeId} disconnected (socket: ${client.id})`,
        );
        return;
      }
    }
  }

  /**
   * Persist a notification and (if the employee is online) push it in real
   * time. Returns `true` when at least one live socket received the event.
   */
  async sendNotificationToEmployee(
    employeeId: number,
    message: string,
    grnId?: number,
    srnId?: number,
    type = 'system',
    link?: string,
  ): Promise<boolean> {
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      this.logger.error(`Invalid employeeId: ${employeeId}`);
      return false;
    }

    // 1. Persist first so the user still sees it after a refresh/offline.
    let notificationId: number | null = null;
    try {
      const saved = await this.notificationsService.createNotification(
        employeeId,
        message,
        grnId,
        srnId,
        type,
        link,
      );
      notificationId = saved.id;
    } catch (err) {
      this.logger.error(
        `Failed to persist notification: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      // Keep going: real-time delivery is still useful.
    }

    // 2. Push to every socket the employee has open.
    const sockets = this.employeeSockets.get(employeeId);
    if (!sockets || sockets.size === 0) {
      this.logger.log(
        `Employee ${employeeId} is offline — notification stored (id: ${notificationId ?? 'n/a'})`,
      );
      return false;
    }

    const payload = {
      id: notificationId,
      type,
      message,
      grnId: grnId ?? null,
      srnId: srnId ?? null,
      employeeId,
      link: link ?? null,
      read: false,
      timestamp: new Date().toISOString(),
    };

    for (const socketId of sockets) {
      this.server.to(socketId).emit('notification', payload);
    }

    this.logger.log(
      `Notification delivered to employee ${employeeId} (${sockets.size} socket(s))`,
    );
    return true;
  }

  /** Fan a notification out to several employees at once. */
  async sendNotificationToEmployees(
    employeeIds: number[],
    message: string,
    grnId?: number,
    srnId?: number,
    type = 'system',
    link?: string,
  ): Promise<number> {
    const unique = [...new Set(employeeIds)].filter(
      (id) => Number.isInteger(id) && id > 0,
    );

    // Sequential on purpose: each persistence call uses a DB connection and
    // the hosted pool only allows a handful of concurrent clients.
    let delivered = 0;
    for (const id of unique) {
      try {
        const ok = await this.sendNotificationToEmployee(
          id,
          message,
          grnId,
          srnId,
          type,
          link,
        );
        if (ok) delivered += 1;
      } catch (err) {
        this.logger.error(`Failed to notify employee ${id}: ${err}`);
      }
    }

    return delivered;
  }

  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @MessageBody() data: { notificationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const employeeId = (client.data as any)?.employeeId as number | undefined;
    this.logger.log(
      `Mark-read request for notification ${data?.notificationId} from employee ${employeeId ?? 'unknown'}`,
    );
    if (data?.notificationId) {
      await this.notificationsService
        .markAsRead(data.notificationId, employeeId)
        .catch((err) => this.logger.error(`mark-read failed: ${err}`));
    }
  }

  /** Extract the employee id from the JWT sent in the socket handshake. */
  private extractEmployeeId(client: Socket): number | null {
    try {
      const raw =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization ||
        '';

      const token = String(raw).replace(/^Bearer\s+/i, '').trim();
      if (!token) return null;

      const secret = process.env.JWT_SECRET || 'fallback-dev-secret';
      const payload = jwt.verify(token, secret) as { sub?: number | string };

      const id = Number(payload?.sub);
      return Number.isInteger(id) && id > 0 ? id : null;
    } catch {
      return null;
    }
  }
}
