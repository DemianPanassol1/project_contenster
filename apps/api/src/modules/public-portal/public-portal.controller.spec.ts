import { describe, expect, it, vi } from 'vitest';

import { PublicPortalController } from './public-portal.controller';
import type { PublicPortalService } from './public-portal.service';

describe('PublicPortalController', () => {
  it('prioritizes the first forwarded host when resolving the portal', async () => {
    const resolve = vi.fn().mockResolvedValue(undefined);
    const service = { resolve } as unknown as PublicPortalService;
    const controller = new PublicPortalController(service);

    await controller.resolve('localhost:4001, proxy.internal', 'api.example.test');

    expect(resolve).toHaveBeenCalledWith('localhost:4001');
  });

  it('uses the Host header when no forwarded host is available', async () => {
    const resolve = vi.fn().mockResolvedValue(undefined);
    const service = { resolve } as unknown as PublicPortalService;
    const controller = new PublicPortalController(service);

    await controller.resolve(undefined, 'portal.example.test');

    expect(resolve).toHaveBeenCalledWith('portal.example.test');
  });
});
