import { Injectable } from '@nestjs/common';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import { SVG_MIME_TYPE } from '@contenster/shared';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
const XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/';

export const MAX_SVG_SIZE_IN_BYTES = 1024 * 1024;
export const MAX_SVG_ELEMENTS = 5_000;
export const MAX_SVG_DEPTH = 64;
export const MAX_SVG_DIMENSION = 8_192;

const ADDITIONAL_ALLOWED_ATTRIBUTES = [
  'xmlns',
  'xmlns:xlink',
  'xlink:href',
  'xml:space',
  'role',
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'focusable',
] as const;

const FORBIDDEN_TAGS = new Set([
  'script',
  'foreignobject',
  'style',
  'a',
  'iframe',
  'object',
  'embed',
  'audio',
  'video',
  'animate',
  'animatemotion',
  'animatetransform',
  'discard',
  'handler',
  'listener',
  'set',
]);

const SAFE_STYLE_PROPERTIES = new Set([
  'clip-path',
  'clip-rule',
  'color',
  'color-interpolation',
  'color-interpolation-filters',
  'direction',
  'display',
  'dominant-baseline',
  'enable-background',
  'fill',
  'fill-opacity',
  'fill-rule',
  'filter',
  'flood-color',
  'flood-opacity',
  'font-family',
  'font-size',
  'font-stretch',
  'font-style',
  'font-variant',
  'font-weight',
  'isolation',
  'letter-spacing',
  'lighting-color',
  'marker-end',
  'marker-mid',
  'marker-start',
  'mask',
  'mix-blend-mode',
  'opacity',
  'overflow',
  'paint-order',
  'pointer-events',
  'shape-rendering',
  'stop-color',
  'stop-opacity',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'text-anchor',
  'text-decoration',
  'text-rendering',
  'transform',
  'transform-origin',
  'unicode-bidi',
  'vector-effect',
  'visibility',
  'word-spacing',
  'writing-mode',
]);
const INTERNAL_FRAGMENT_PATTERN = /^#[A-Za-z_][A-Za-z0-9_.:-]*$/;
const INTERNAL_URL_PATTERN = /^url\(\s*["']?#[A-Za-z_][A-Za-z0-9_.:-]*["']?\s*\)$/i;
const EMBEDDED_RASTER_PATTERN = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/i;
const RENDERED_CONTENT_TAGS = new Set([
  'circle',
  'ellipse',
  'image',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'text',
  'use',
]);
const DIMENSION_PATTERN = /^(\d+(?:\.\d+)?)(%|px|pt|pc|cm|mm|in)?$/;
const DIMENSION_UNIT_TO_PX: Record<string, number> = {
  '': 1,
  px: 1,
  pt: 96 / 72,
  pc: 16,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  in: 96,
};

const startsWithBytes = (buffer: Buffer, bytes: readonly number[]): boolean =>
  buffer.length >= bytes.length && bytes.every((byte, index) => buffer[index] === byte);

export class InvalidSvgContentError extends Error {
  constructor() {
    super('Invalid or unsafe SVG content.');
    this.name = InvalidSvgContentError.name;
  }
}

@Injectable()
export class SvgSanitizerService {
  sanitize(buffer: Buffer): Buffer {
    if (buffer.length === 0 || buffer.length > MAX_SVG_SIZE_IN_BYTES) {
      throw new InvalidSvgContentError();
    }

    const source = this.decode(buffer);

    if (
      source.includes('\0') ||
      /<!DOCTYPE/i.test(source) ||
      /<!ENTITY/i.test(source) ||
      /<\?xml-stylesheet/i.test(source)
    ) {
      throw new InvalidSvgContentError();
    }

    const inputDom = this.parse(source);

    try {
      this.assertDocumentStructure(inputDom.window.document);
      const domPurify = createDOMPurify(inputDom.window);
      const root = inputDom.window.document.documentElement;

      domPurify.sanitize(root, {
        ADD_ATTR: [...ADDITIONAL_ALLOWED_ATTRIBUTES],
        ADD_TAGS: ['use'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        FORBID_TAGS: [...FORBIDDEN_TAGS],
        IN_PLACE: true,
        KEEP_CONTENT: false,
        SAFE_FOR_XML: true,
        USE_PROFILES: { svg: true, svgFilters: true },
      });

      this.assertSafeDocument(inputDom.window.document);
      const output = root.outerHTML;
      const sanitizedBuffer = Buffer.from(output, 'utf8');

      if (sanitizedBuffer.length === 0 || sanitizedBuffer.length > MAX_SVG_SIZE_IN_BYTES) {
        throw new InvalidSvgContentError();
      }

      return sanitizedBuffer;
    } finally {
      inputDom.window.close();
    }
  }

  private decode(buffer: Buffer): string {
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    } catch {
      throw new InvalidSvgContentError();
    }
  }

  private parse(source: string): JSDOM {
    try {
      return new JSDOM(source, { contentType: SVG_MIME_TYPE });
    } catch {
      throw new InvalidSvgContentError();
    }
  }

  private assertSafeDocument(document: Document): void {
    this.assertDocumentStructure(document);

    const root = document.documentElement;
    const elements = [root, ...Array.from(root.querySelectorAll('*'))];

    for (const element of elements) {
      if (
        element.namespaceURI !== SVG_NAMESPACE ||
        FORBIDDEN_TAGS.has(element.localName.toLowerCase())
      ) {
        throw new InvalidSvgContentError();
      }

      for (const attribute of Array.from(element.attributes)) {
        this.assertSafeAttribute(attribute);
      }
    }

    const hasUsableContent = elements.slice(1).some((element) => {
      if (!RENDERED_CONTENT_TAGS.has(element.localName.toLowerCase())) {
        return false;
      }

      return !element.closest('defs, symbol, clipPath, mask, filter');
    });

    if (!hasUsableContent) {
      throw new InvalidSvgContentError();
    }
  }

  private assertDocumentStructure(document: Document): void {
    const root = document.documentElement;

    if (root.localName.toLowerCase() !== 'svg' || root.namespaceURI !== SVG_NAMESPACE) {
      throw new InvalidSvgContentError();
    }

    const elements = [root, ...Array.from(root.querySelectorAll('*'))];

    if (elements.length > MAX_SVG_ELEMENTS) {
      throw new InvalidSvgContentError();
    }

    for (const element of elements) {
      if (this.getDepth(element, root) > MAX_SVG_DEPTH) {
        throw new InvalidSvgContentError();
      }
    }

    this.assertSafeDimensions(root);
  }

  private getDepth(element: Element, root: Element): number {
    let depth = 0;
    let current: Element | null = element;

    while (current && current !== root) {
      depth += 1;
      current = current.parentElement;
    }

    return depth;
  }

  private assertSafeAttribute(attribute: Attr): void {
    const name = attribute.name.toLowerCase();
    const value = attribute.value.trim();

    if (
      name.startsWith('on') ||
      name === 'xml:base' ||
      ![null, SVG_NAMESPACE, XLINK_NAMESPACE, XML_NAMESPACE, XMLNS_NAMESPACE].includes(
        attribute.namespaceURI,
      )
    ) {
      throw new InvalidSvgContentError();
    }

    if (attribute.namespaceURI === XMLNS_NAMESPACE) {
      const isExpectedNamespace =
        (name === 'xmlns' && value === SVG_NAMESPACE) ||
        (name === 'xmlns:xlink' && value === XLINK_NAMESPACE);

      if (!isExpectedNamespace) {
        throw new InvalidSvgContentError();
      }

      return;
    }

    if (name === 'style') {
      this.assertSafeInlineStyle(attribute.ownerElement, value);
      return;
    }

    if (name === 'href' || name === 'xlink:href' || name === 'src') {
      const isInternalReference = INTERNAL_FRAGMENT_PATTERN.test(value);
      const isEmbeddedRaster =
        attribute.ownerElement?.localName.toLowerCase() === 'image' &&
        this.isSafeEmbeddedRaster(value);

      if (!isInternalReference && !isEmbeddedRaster) {
        throw new InvalidSvgContentError();
      }

      return;
    }

    if (/url\s*\(/i.test(value)) {
      if (!INTERNAL_URL_PATTERN.test(value)) {
        throw new InvalidSvgContentError();
      }

      return;
    }

    if (/javascript:|data:|file:|https?:|@import|expression\s*\(/i.test(value)) {
      throw new InvalidSvgContentError();
    }
  }

  private isSafeEmbeddedRaster(value: string): boolean {
    const match = EMBEDDED_RASTER_PATTERN.exec(value);

    if (!match) {
      return false;
    }

    const mimeType = match[1].toLowerCase();
    const imageBuffer = Buffer.from(match[2], 'base64');

    switch (mimeType) {
      case 'image/png':
        return startsWithBytes(imageBuffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      case 'image/jpeg':
        return startsWithBytes(imageBuffer, [0xff, 0xd8, 0xff]);
      case 'image/webp':
        return (
          startsWithBytes(imageBuffer, [0x52, 0x49, 0x46, 0x46]) &&
          startsWithBytes(imageBuffer.subarray(8), [0x57, 0x45, 0x42, 0x50])
        );
      default:
        return false;
    }
  }

  private assertSafeInlineStyle(element: Element | null, rawValue: string): void {
    if (
      !element ||
      /@import|expression\s*\(|javascript:|vbscript:|data:|file:|https?:|behavior\s*:|-moz-binding/i.test(
        rawValue,
      )
    ) {
      throw new InvalidSvgContentError();
    }

    const style = (element as SVGElement).style;

    if (!style || (rawValue.trim() && style.length === 0)) {
      throw new InvalidSvgContentError();
    }

    for (const property of Array.from(style)) {
      const normalizedProperty = property.toLowerCase();
      const value = style.getPropertyValue(property).trim();

      if (!SAFE_STYLE_PROPERTIES.has(normalizedProperty)) {
        throw new InvalidSvgContentError();
      }

      if (/url\s*\(/i.test(value) && !INTERNAL_URL_PATTERN.test(value)) {
        throw new InvalidSvgContentError();
      }
    }
  }

  private assertSafeDimensions(root: Element): void {
    const viewBox = root.getAttribute('viewBox');
    const width = root.getAttribute('width');
    const height = root.getAttribute('height');
    const hasValidViewBox = viewBox ? this.isValidViewBox(viewBox) : false;
    if ((width && !this.isValidDimension(width)) || (height && !this.isValidDimension(height))) {
      throw new InvalidSvgContentError();
    }

    if (!hasValidViewBox && (!width || !height)) {
      throw new InvalidSvgContentError();
    }

    if (viewBox && !hasValidViewBox) {
      throw new InvalidSvgContentError();
    }
  }

  private isValidDimension(value: string): boolean {
    const match = DIMENSION_PATTERN.exec(value.trim());
    const dimension = match ? Number(match[1]) : Number.NaN;
    const unit = match?.[2] ?? '';

    if (unit === '%') {
      return Number.isFinite(dimension) && dimension > 0 && dimension <= 1_000;
    }

    const factor = DIMENSION_UNIT_TO_PX[unit];

    return (
      factor !== undefined &&
      Number.isFinite(dimension) &&
      dimension > 0 &&
      dimension * factor <= MAX_SVG_DIMENSION
    );
  }

  private isValidViewBox(value: string): boolean {
    const parts = value
      .trim()
      .split(/[\s,]+/)
      .map(Number);

    return (
      parts.length === 4 &&
      parts.every(Number.isFinite) &&
      Math.abs(parts[0]) <= 1_000_000 &&
      Math.abs(parts[1]) <= 1_000_000 &&
      parts[2] > 0 &&
      parts[2] <= MAX_SVG_DIMENSION &&
      parts[3] > 0 &&
      parts[3] <= MAX_SVG_DIMENSION
    );
  }
}
