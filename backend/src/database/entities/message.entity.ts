import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('messages')
@Index(['tenantId', 'createdAt'])
@Index(['recipientEmail'])
@Index(['senderEmail'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  senderName: string;

  @Column()
  senderEmail: string;

  @Column({ nullable: true })
  senderAvatar: string;

  @Column()
  recipientEmail: string;

  @Column({ nullable: true })
  recipientName: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  preview: string;

  @Column({ default: true })
  unread: boolean;

  @Column({ default: false })
  starred: boolean;

  @Column({ default: false })
  archived: boolean;

  @Column({ nullable: true })
  candidateId: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => Message, message => message.replies, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Message;

  @OneToMany(() => Message, message => message.parent)
  replies: Message[];

  @Column({ default: false })
  emailNotificationSent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
