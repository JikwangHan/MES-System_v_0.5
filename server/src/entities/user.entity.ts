import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Company } from './company.entity';
import { EncryptedTransformer } from '../crypto/encrypted.transformer';

// User 엔티티: 로그인/권한/프로필/보안 관련 필드를 포함합니다.
// 비밀번호는 bcrypt 해시로만 저장하며, 평문은 절대 저장하지 않습니다.
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // 로그인에 사용하는 아이디 (고유)
  @Column({ unique: true, length: 50 })
  username: string;

  // 표시 이름 (개인정보: 암호화) - 암호문 길이를 고려해 넉넉히 255자로 설정
  @Column({ length: 255, transformer: new EncryptedTransformer() })
  displayName: string;

  // bcrypt 해시만 저장
  @Column({ length: 255 })
  passwordHash: string;

  // 역할: SYSTEM_ADMIN | COMPANY_ADMIN | USER
  @Column({ length: 20, default: 'STAFF' })
  role: string;

  // 회사(테넌트) 연결
  @ManyToOne(() => Company, (company) => company.users, { nullable: true, onDelete: 'SET NULL' })
  company: Company | null;

  // 연락처, 업체명은 선택 입력 가능 (업체명은 회사 엔티티와 중복되지만, 사용자 상세에 별도로 기록할 수 있게 유지)
  // 암호문(Base64) 길이를 고려해 충분히 크게 잡습니다.
  @Column({ type: 'varchar', length: 512, nullable: true, transformer: new EncryptedTransformer() })
  phone?: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true, transformer: new EncryptedTransformer() })
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
