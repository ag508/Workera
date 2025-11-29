import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Resume } from './resume.entity';
import { Application } from './application.entity';
import { Tenant } from './tenant.entity';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'simple-json', default: [] })
  skills: string[];

  @Column({ nullable: true })
  linkedin: string;

  @Column({ nullable: true })
  github: string;

  @Column({ nullable: true })
  portfolio: string;

  @OneToMany(() => Resume, resume => resume.candidate)
  resumes: Resume[];

  @OneToMany(() => Application, application => application.candidate)
  applications: Application[];

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
