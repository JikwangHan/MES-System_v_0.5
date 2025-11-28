import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// User 엔티티: 로그인/권한/프로필/보안 관련 필드를 포함합니다.
// 비밀번호는 bcrypt 해시로만 저장하며, 평문은 절대 저장하지 않습니다.
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // 로그인에 사용하는 아이디 (고유)
  @Column({ unique: true, length: 50 })
  username: string;

  // 표시 이름
  @Column({ length: 100 })
  displayName: string;

  // bcrypt 해시만 저장
  @Column({ length: 255 })
  passwordHash: string;

  // 역할: ADMIN | OWNER | STAFF
  @Column({ length: 20, default: 'STAFF' })
  role: string;

  // 연락처, 업체명은 선택 입력 가능
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  companyName?: string | null;

  // 계정 활성/잠금 상태
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isLocked: boolean;

  // 연속 로그인 실패 횟수 (예: 5회 이상이면 잠금)
  @Column({ default: 0 })
  failedLoginCount: number;

  // 비밀번호 변경 강제 여부(초기 admin 등)
  @Column({ default: false })
  mustChangePassword: boolean;

  // 최근 로그인/비밀번호 변경 시각
  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastPasswordChangedAt: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
