import { ValueTransformer } from 'typeorm';
import { decryptAesGcm, encryptAesGcm } from './crypto.util';

// TypeORM 컬럼용 암호화 Transformer
// - 저장 시: 평문 -> 암호문(Base64)
// - 조회 시: 암호문(Base64) -> 평문
export class EncryptedTransformer implements ValueTransformer {
  to(value: string | null): string | null {
    if (value === null || value === undefined || value === '') return value as any;
    return encryptAesGcm(String(value));
  }

  from(value: string | null): string | null {
    if (value === null || value === undefined || value === '') return value as any;
    return decryptAesGcm(String(value));
  }
}
