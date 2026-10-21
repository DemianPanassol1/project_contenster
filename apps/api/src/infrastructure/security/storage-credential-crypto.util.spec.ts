import { describe, expect, it } from 'vitest';

import {
  decryptStorageCredential,
  encryptStorageCredential,
} from './storage-credential-crypto.util';

describe('storage credential crypto', () => {
  it('encrypts credentials with a non-deterministic envelope and decrypts them', () => {
    const value = 'credential-for-tests';
    const encrypted = encryptStorageCredential(value);

    expect(encrypted).not.toContain(value);
    expect(encrypted).not.toBe(encryptStorageCredential(value));
    expect(decryptStorageCredential(encrypted)).toBe(value);
  });

  it('rejects a modified encrypted credential', () => {
    const encrypted = encryptStorageCredential('credential-for-tests');
    const envelope = JSON.parse(encrypted) as { value: string };
    envelope.value = `${envelope.value.slice(0, -2)}AA`;

    expect(() => decryptStorageCredential(JSON.stringify(envelope))).toThrow();
  });
});
