import { describe, expect, it } from 'vitest';

import { InvalidSvgContentError, SvgSanitizerService } from './svg-sanitizer.service';

describe('SvgSanitizerService', () => {
  const service = new SvgSanitizerService();

  it('preserves a valid SVG document', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>';

    expect(service.sanitize(Buffer.from(svg)).toString()).toContain('<path');
  });

  it('rejects executable and remote SVG content', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><script>alert(1)</script><image href="https://example.test/image.png"/></svg>';

    expect(() => service.sanitize(Buffer.from(svg))).toThrow(InvalidSvgContentError);
  });
});
