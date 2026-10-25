import { describe, expect, it, vi } from 'vitest';

import {
  FileType,
  PortalFontScale,
  PortalLoginHeaderMode,
  PortalLoginLayout,
  PortalLoginMediaSlot,
  PortalLoginMediaType,
  PortalSplitMediaPosition,
} from '@contenster/shared';

import { type PublicPortalRepository } from './public-portal.repository';
import { PublicPortalService } from './public-portal.service';

describe('PublicPortalService', () => {
  it('returns the core fallback without querying persistence when the Host is absent', async () => {
    const findByHost = vi.fn();
    const repository = { findByHost } as unknown as PublicPortalRepository;
    const service = new PublicPortalService(repository);

    await expect(service.resolve(undefined)).resolves.toMatchObject({
      identity: { applicationName: 'Contenster Slim Core' },
      login: { headerMode: PortalLoginHeaderMode.text, layout: PortalLoginLayout.centered },
    });
    expect(findByHost).not.toHaveBeenCalled();
  });

  it('normalizes the Host and resolves translated portal data with Portuguese fallback', async () => {
    const findByHost = vi.fn().mockResolvedValue({
      brandAssetFile: null,
      darkBackground: '#101010',
      darkError: '#FF0000',
      darkPaper: '#202020',
      darkPrimary: '#111111',
      darkSecondary: '#222222',
      darkSuccess: '#00FF00',
      darkWarning: '#FFFF00',
      faviconFile: null,
      fontScale: PortalFontScale.large,
      headerIconFile: null,
      lightBackground: '#F7F8FA',
      lightError: '#F43F5E',
      lightPaper: '#FFFFFF',
      lightPrimary: '#7266FF',
      lightSecondary: '#6B7280',
      lightSuccess: '#10B981',
      lightWarning: '#F59E0B',
      loginHeaderMode: PortalLoginHeaderMode.text,
      loginLayout: PortalLoginLayout.split,
      loginMedia: [
        {
          file: {
            client: null,
            fileType: FileType.image,
            id: 9,
            mimeType: 'image/png',
            publicUrl: '/uploads/core/image/login.png',
          },
          mediaType: PortalLoginMediaType.image,
          posterFile: null,
          slot: PortalLoginMediaSlot.splitPanelDesktop,
        },
      ],
      splitMediaPosition: PortalSplitMediaPosition.left,
      supportUrl: 'https://support.example.test/',
      translations: [
        {
          applicationDescription: 'Descrição em português',
          applicationName: 'Aplicação',
          language: { languageCode: 'pt' },
          loginBrandAssetAlt: null,
          loginDescription: null,
          loginTitle: 'Entre',
          supportText: 'Precisa de ajuda?',
        },
      ],
    });
    const repository = {
      findByHost,
    } as unknown as PublicPortalRepository;
    const service = new PublicPortalService(repository);

    const resolved = await service.resolve('Portal.Example.Test:443');

    expect(findByHost).toHaveBeenCalledWith('portal.example.test');
    expect(resolved).toMatchObject({
      identity: {
        applicationDescription: 'Descrição em português',
        applicationName: 'Aplicação',
        fontScale: PortalFontScale.large,
      },
      login: {
        layout: PortalLoginLayout.split,
        media: {
          split_panel_desktop: {
            asset: { id: 9, url: '/uploads/core/image/login.png' },
            mediaType: PortalLoginMediaType.image,
          },
        },
        splitMediaPosition: PortalSplitMediaPosition.left,
        title: 'Entre',
      },
    });
  });

  it('preserves a localhost port when resolving a portal', async () => {
    const findByHost = vi.fn().mockResolvedValue(null);
    const repository = { findByHost } as unknown as PublicPortalRepository;
    const service = new PublicPortalService(repository);

    await service.resolve('localhost:4001');

    expect(findByHost).toHaveBeenCalledWith('localhost:4001');
  });
});
