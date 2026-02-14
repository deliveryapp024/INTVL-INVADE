// Minimal TextDecoder polyfill to prevent runtime crashes in Hermes/Expo.
// Provides utf-8/utf-16le decoding used by some dependencies.

type Input = ArrayBufferView | ArrayBuffer | undefined;

const toU8 = (input: Input): Uint8Array => {
  if (!input) return new Uint8Array(0);
  return input instanceof ArrayBuffer
    ? new Uint8Array(input)
    : new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
};

const decodeUtf16Le = (bytes: Uint8Array): string => {
  const len = bytes.length;
  const codeUnits = new Uint16Array(Math.floor(len / 2));
  for (let i = 0; i + 1 < len; i += 2) codeUnits[i / 2] = bytes[i] | (bytes[i + 1] << 8);
  let out = '';
  const chunk = 0x8000;
  for (let i = 0; i < codeUnits.length; i += chunk) out += String.fromCharCode(...codeUnits.subarray(i, i + chunk));
  return out;
};

const decodeUtf8 = (bytes: Uint8Array): string => {
  let out = '';
  for (let i = 0; i < bytes.length; ) {
    const b0 = bytes[i++];
    if ((b0 & 0x80) === 0) {
      out += String.fromCharCode(b0);
      continue;
    }
    if ((b0 & 0xe0) === 0xc0) {
      const b1 = bytes[i++] & 0x3f;
      out += String.fromCharCode(((b0 & 0x1f) << 6) | b1);
      continue;
    }
    if ((b0 & 0xf0) === 0xe0) {
      const b1 = bytes[i++] & 0x3f;
      const b2 = bytes[i++] & 0x3f;
      out += String.fromCharCode(((b0 & 0x0f) << 12) | (b1 << 6) | b2);
      continue;
    }
    const b1 = bytes[i++] & 0x3f;
    const b2 = bytes[i++] & 0x3f;
    const b3 = bytes[i++] & 0x3f;
    const cp = ((b0 & 0x07) << 18) | (b1 << 12) | (b2 << 6) | b3;
    const u = cp - 0x10000;
    out += String.fromCharCode(0xd800 | (u >> 10), 0xdc00 | (u & 0x3ff));
  }
  return out;
};

class TextDecoderPolyfill {
  private enc: string;
  constructor(label?: string) {
    this.enc = (label ?? 'utf-8').toLowerCase();
    if (this.enc === 'utf8') this.enc = 'utf-8';
  }
  decode(input?: Input): string {
    const bytes = toU8(input);
    if (this.enc === 'utf-16le' || this.enc === 'utf-16') return decodeUtf16Le(bytes);
    if (this.enc === 'utf-8') return decodeUtf8(bytes);
    return '';
  }
}

const TD = (global as any).TextDecoder;
if (!TD || !TD.prototype || typeof TD.prototype.decode !== 'function') {
  (global as any).TextDecoder = TextDecoderPolyfill as any;
}

