import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Department } from './department.entity';
import { JobGrade } from './job-grade.entity';
import { Location } from './location.entity';

@Entity('positions')
@Index(['tenantId', 'positionNumber'], { unique: true })
export class Position {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({ name: 'position_number', length: 50 })
  positionNumber: string;

  @Column({ length: 200 })
  title: string;

  @Column({ name: 'job_code', length: 50, nullable: true })
  jobCode: string;

  @Column({ name: 'job_family', length: 100, nullable: true })
  jobFamily: string;

  @Column({ name: 'department_id', type: 'uuid' })
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ name: 'job_grade_id', type: 'uuid' })
  jobGradeId: string;

  @ManyToOne(() => JobGrade)
  @JoinColumn({ name: 'job_grade_id' })
  jobGrade: JobGrade;

  @Column({ name: 'reports_to_position_id', type: 'uuid', nullable: true })
  reportsToPositionId: string;

  @Column({ name: 'incumbent_user_id', type: 'uuid', nullable: true })
  incumbentUserId: string;  // Current employee in position

  @Column({ name: 'is_vacant', default: true })
  isVacant: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'headcount', type: 'int', default: 1 })
  headcount: number;  // Number of positions with this definition

  @Column({ name: 'filled_count', type: 'int', default: 0 })
  filledCount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  requirements: {
    skills?: string[];
    certifications?: string[];
    education?: string;
    experienceYears?: number;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
