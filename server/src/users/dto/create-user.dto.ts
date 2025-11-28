export interface CreateUserDto {
  username: string;
  displayName: string;
  passwordHash: string;
  phone?: string | null;
  companyName?: string | null;
  role?: string;
  isActive?: boolean;
  isLocked?: boolean;
  failedLoginCount?: number;
  mustChangePassword?: boolean;
}
