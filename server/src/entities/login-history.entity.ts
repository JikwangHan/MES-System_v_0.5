import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

// 로그인 시도 이력 테이블: 성공/실패, 잠금 원인 등을 기록합니다.
@Entity('user_login_history')
export class LoginHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn({ type: 'datetime' })
  loginAt: Date;

  @Column({ default: false })
  success: boolean;

  @Column({ length: 50, nullable: true })
  failReason?: string | null; // WRONG_PASSWORD, LOCKED, USER_NOT_FOUND 등

  @Column({ length: 100, nullable: true })
  ip?: string | null;

  @Column({ length: 255, nullable: true })
  userAgent?: string | null;
}
