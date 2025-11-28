import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';

// 로그인 시도 이력을 기록하는 테이블입니다.
// 회사/사용자/성공여부/원인/IP/UA 등을 저장합니다.
@Entity('user_login_history')
export class LoginHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Company, (company) => company.loginHistories, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  company: Company | null;

  @CreateDateColumn({ type: 'datetime' })
  loginAt: Date;

  @Column({ default: false })
  success: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  failReason?: string | null; // WRONG_PASSWORD, LOCKED, USER_NOT_FOUND 등

  @Column({ type: 'varchar', length: 100, nullable: true })
  ip?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent?: string | null;
}
