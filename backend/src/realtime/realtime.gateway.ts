import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

export interface RealtimeEvent {
  type: 'application_created' | 'application_updated' | 'interview_scheduled' | 'resume_parsed' | 'job_posted' | 'candidate_created';
  data: any;
  tenantId: string;
  timestamp: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict to specific domains
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedClients: Map<string, { socket: Socket; tenantId?: string }> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, { socket: client });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @MessageBody() data: { tenantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      clientData.tenantId = data.tenantId;
      this.connectedClients.set(client.id, clientData);
      this.logger.log(`Client ${client.id} authenticated for tenant: ${data.tenantId}`);
      client.emit('authenticated', { success: true, tenantId: data.tenantId });
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
    this.logger.log(`Client ${client.id} joined room: ${data.room}`);
    client.emit('room_joined', { room: data.room });
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.room);
    this.logger.log(`Client ${client.id} left room: ${data.room}`);
    client.emit('room_left', { room: data.room });
  }

  /**
   * Broadcast event to all clients in a tenant
   */
  broadcastToTenant(tenantId: string, event: RealtimeEvent) {
    this.server.to(`tenant:${tenantId}`).emit('event', event);
    this.logger.log(`Broadcasting ${event.type} to tenant: ${tenantId}`);
  }

  /**
   * Broadcast event to specific room
   */
  broadcastToRoom(room: string, event: RealtimeEvent) {
    this.server.to(room).emit('event', event);
    this.logger.log(`Broadcasting ${event.type} to room: ${room}`);
  }

  /**
   * Send event to all connected clients (admin broadcast)
   */
  broadcastToAll(event: RealtimeEvent) {
    this.server.emit('event', event);
    this.logger.log(`Broadcasting ${event.type} to all clients`);
  }

  /**
   * Send notification about new application
   */
  notifyApplicationCreated(application: any, tenantId: string) {
    const event: RealtimeEvent = {
      type: 'application_created',
      data: {
        id: application.id,
        candidateName: `${application.candidate?.firstName} ${application.candidate?.lastName}`,
        jobTitle: application.job?.title,
        status: application.status,
      },
      tenantId,
      timestamp: new Date(),
    };
    this.broadcastToTenant(tenantId, event);
  }

  /**
   * Send notification about application status update
   */
  notifyApplicationUpdated(application: any, tenantId: string) {
    const event: RealtimeEvent = {
      type: 'application_updated',
      data: {
        id: application.id,
        candidateName: `${application.candidate?.firstName} ${application.candidate?.lastName}`,
        jobTitle: application.job?.title,
        status: application.status,
        previousStatus: application.previousStatus,
      },
      tenantId,
      timestamp: new Date(),
    };
    this.broadcastToTenant(tenantId, event);
  }

  /**
   * Send notification about scheduled interview
   */
  notifyInterviewScheduled(interview: any, tenantId: string) {
    const event: RealtimeEvent = {
      type: 'interview_scheduled',
      data: {
        id: interview.id,
        candidateName: `${interview.application?.candidate?.firstName} ${interview.application?.candidate?.lastName}`,
        jobTitle: interview.application?.job?.title,
        scheduledAt: interview.scheduledAt,
        type: interview.type,
      },
      tenantId,
      timestamp: new Date(),
    };
    this.broadcastToTenant(tenantId, event);
  }

  /**
   * Send notification about parsed resume
   */
  notifyResumeParsed(resume: any, tenantId: string) {
    const event: RealtimeEvent = {
      type: 'resume_parsed',
      data: {
        id: resume.id,
        candidateId: resume.candidateId,
        skills: resume.skills,
        experienceCount: resume.experience?.length || 0,
      },
      tenantId,
      timestamp: new Date(),
    };
    this.broadcastToTenant(tenantId, event);
  }

  /**
   * Send notification about new job posting
   */
  notifyJobPosted(job: any, tenantId: string) {
    const event: RealtimeEvent = {
      type: 'job_posted',
      data: {
        id: job.id,
        title: job.title,
        company: job.company,
        channels: job.channels,
      },
      tenantId,
      timestamp: new Date(),
    };
    this.broadcastToTenant(tenantId, event);
  }

  /**
   * Send notification about new candidate
   */
  notifyCandidateCreated(candidate: any, tenantId: string) {
    const event: RealtimeEvent = {
      type: 'candidate_created',
      data: {
        id: candidate.id,
        name: `${candidate.firstName} ${candidate.lastName}`,
        email: candidate.email,
        skills: candidate.skills,
      },
      tenantId,
      timestamp: new Date(),
    };
    this.broadcastToTenant(tenantId, event);
  }

  /**
   * Get count of connected clients
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get connected clients for a tenant
   */
  getConnectedClientsByTenant(tenantId: string): number {
    return Array.from(this.connectedClients.values()).filter(
      client => client.tenantId === tenantId
    ).length;
  }
}
