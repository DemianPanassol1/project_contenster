import { describe, expect, it, vi } from 'vitest';

import { Portal } from './entities';
import { PortalsRepository } from './portals.repository';

describe('PortalsRepository', () => {
  it('persists the aggregate through the portal relation cascade', async () => {
    const portal = { id: 4 } as Portal;
    const save = vi.fn().mockResolvedValue(portal);
    const transaction = vi.fn((callback: (manager: { save: typeof save }) => Promise<Portal>) =>
      callback({ save }),
    );
    const repository = new PortalsRepository(
      { transaction } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(repository.saveAggregate(portal)).resolves.toBe(portal);

    expect(transaction).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledWith(Portal, portal);
  });
});
