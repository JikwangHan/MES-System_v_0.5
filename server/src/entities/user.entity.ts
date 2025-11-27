import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// 사용자 정보를 저장하는 엔티티입니다.
// 초기에는 최소 필드(id, name, 생성/수정 시각)만 두고,
// 추후 로그인 계정, 권한, 소속 공장/창고 등으로 확장할 수 있습니다.
@Entity('users')
export class User {
  // 기본 키: 자동 증가 숫자
  @PrimaryGeneratedColumn()
  id: number;

  // 사용자 이름(예: 테스트 사용자)
  @Column({ length: 100 })
  name: string;

  // 레코드 생성 시각 자동 기록
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 레코드 수정 시각 자동 기록
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
