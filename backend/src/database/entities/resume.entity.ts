import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Candidate } from './candidate.entity';

@Entity('resumes')
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  rawText: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'jsonb', default: [] })
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;

  @Column({ type: 'jsonb', default: [] })
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
  }>;

  @Column({ type: 'jsonb', default: [] })
  skills: string[];

  @Column({ type: 'jsonb', nullable: true })
  certifications: string[];

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ default: false })
  isParsed: boolean;

  @ManyToOne(() => Candidate, candidate => candidate.resumes)
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @Column()
  candidateId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
