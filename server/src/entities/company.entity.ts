import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { LoginHistory } from './login-history.entity';

// 회사(테넌트) 정보를 표현하는 엔티티입니다.
// - code: 회사별로 고유하게 사용하는 코드(로그인 시 사용)
// - name: 회사명
// - status: ACTIVE / SUSPENDED 등 회사 상태 관리
@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 30, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => LoginHistory, (history) => history.company)
  loginHistories: LoginHistory[];
}
