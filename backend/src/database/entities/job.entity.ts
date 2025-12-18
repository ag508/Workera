import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Tenant } from './tenant.entity';
import { Application } from './application.entity';

export enum JobStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
  CLOSED = 'closed'
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  company: string;

  @Column({
    type: 'simple-enum',
    enum: JobStatus,
    default: JobStatus.DRAFT
  })
  status: JobStatus;

  @Column({ type: 'simple-json', nullable: true })
  channels: string[];

  @Column({ type: 'simple-json', nullable: true })
  requirements: string[];

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  salary: string;

  @ManyToOne(() => Tenant, tenant => tenant.jobs)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  tenantId: string;

  @OneToMany(() => Application, application => application.job)
  applications: Application[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
