import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { ActionType } from '@contenster/shared';

import { RequirePermissionGuard } from './require-permission.guard';

const createContext = (session: unknown, body: unknown) => ({
  getClass: () => class TestController {},
  getHandler: () => () => undefined,
  switchToHttp: () => ({
    getRequest: () => ({ body, session }),
  }),
});

describe('RequirePermissionGuard', () => {
  const i18n = { t: vi.fn((key: string) => key) };

  it('allows handlers without permission metadata', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) };
    const resolver = { hasPermission: vi.fn() };
    const guard = new RequirePermissionGuard(reflector as never, resolver as never, i18n as never);

    expect(guard.canActivate(createContext(undefined, undefined) as never)).toBe(true);
    expect(resolver.hasPermission).not.toHaveBeenCalled();
  });

  it('uses the update action when a positive body id is present', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue({
        action: ActionType.create,
        functionalitySlug: 'users',
        options: { bodyIdField: 'id', updateActionType: ActionType.edit },
      }),
    };
    const resolver = { hasPermission: vi.fn().mockReturnValue(true) };
    const guard = new RequirePermissionGuard(reflector as never, resolver as never, i18n as never);
    const session = { user: { id: 1 } };

    expect(guard.canActivate(createContext(session, { id: '12' }) as never)).toBe(true);
    expect(resolver.hasPermission).toHaveBeenCalledWith(session, {
      action: ActionType.edit,
      functionalitySlug: 'users',
    });
  });

  it('rejects an authenticated session without the required permission', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue({
        action: ActionType.view,
        functionalitySlug: 'users',
        options: {},
      }),
    };
    const resolver = { hasPermission: vi.fn().mockReturnValue(false) };
    const guard = new RequirePermissionGuard(reflector as never, resolver as never, i18n as never);

    expect(() => guard.canActivate(createContext({ user: { id: 1 } }, {}) as never)).toThrow(
      ForbiddenException,
    );
  });
});
