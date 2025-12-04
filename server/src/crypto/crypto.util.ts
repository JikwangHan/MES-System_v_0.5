import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

// 서버 부팅 시 .env를 먼저 로드합니다. (AppModule보다 먼저 import되기 때문)
dotenv.config({ path: process.env.ENV_FILE_PATH || '.env.development' });

// AES-256-GCM 기반 암호화/복호화 유틸리티
// - 키는 환경변수 DATA_ENCRYPTION_KEY_BASE64 에서 Base64로 로드 (32바이트)
// - IV는 12바이트 난수 사용

const base64Key = process.env.DATA_ENCRYPTION_KEY_BASE64;
if (!base64Key) {
  throw new Error('DATA_ENCRYPTION_KEY_BASE64 환경변수가 설정되지 않았습니다.');
}
const KEY = Buffer.from(base64Key, 'base64');
if (KEY.length !== 32) {
  throw new Error('DATA_ENCRYPTION_KEY_BASE64는 32바이트(256bit) 키여야 합니다.');
}

export function encryptAesGcm(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // 저장/전송을 위해 [IV | CIPHERTEXT | TAG]를 하나로 묶어 Base64로 반환
  return Buffer.concat([iv, encrypted, authTag]).toString('base64');
}

export function decryptAesGcm(payload: string): string {
  const raw = Buffer.from(payload, 'base64');
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(raw.length - 16);
  const cipherText = raw.subarray(12, raw.length - 16);

  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(cipherText), decipher.final()]);
  return decrypted.toString('utf8');
}
