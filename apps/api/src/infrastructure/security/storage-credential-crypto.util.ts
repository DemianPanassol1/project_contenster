import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { settings } from '@/infrastructure/config/app.config';

interface EncryptedCredentialEnvelope {
  iv: string;
  tag: string;
  value: string;
}

const encryptionKey = (): Buffer => {
  if (!settings.STORAGE_CREDENTIALS_ENCRYPTION_KEY) {
    throw new Error('Storage credentials encryption key is not configured.');
  }

  return Buffer.from(settings.STORAGE_CREDENTIALS_ENCRYPTION_KEY, 'base64');
};

export const encryptStorageCredential = (value: string): string => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);

  return JSON.stringify({
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    value: encrypted.toString('base64'),
  } satisfies EncryptedCredentialEnvelope);
};

export const decryptStorageCredential = (encryptedValue: string): string => {
  const envelope = JSON.parse(encryptedValue) as EncryptedCredentialEnvelope;
  const decipher = createDecipheriv(
    'aes-256-gcm',
    encryptionKey(),
    Buffer.from(envelope.iv, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(envelope.value, 'base64')),
    decipher.final(),
  ]).toString('utf8');
};
