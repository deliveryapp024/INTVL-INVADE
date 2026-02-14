// Simple, robust TextDecoder/TextEncoder polyfill for Metro pre-main load.
// Always sets the polyfill, regardless of what exists.

// Ensure global is available in Metro's pre-main context
if (typeof global === 'undefined') {
  global = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {};
}

// TextDecoder polyfill
function TextDecoderPolyfill(label) {
  this.encoding = (label || 'utf-8').toLowerCase();
  if (this.encoding === 'utf8') this.encoding = 'utf-8';
}

TextDecoderPolyfill.prototype.decode = function (input) {
  if (!input) return '';
  const bytes = input instanceof ArrayBuffer
    ? new Uint8Array(input)
    : input instanceof Uint8Array
      ? input
      : new Uint8Array(input);

  let out = '';
  for (let i = 0; i < bytes.length;) {
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

// TextEncoder polyfill
function TextEncoderPolyfill() { }

TextEncoderPolyfill.prototype.encode = function (str) {
  const s = String(str);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    out[i] = s.charCodeAt(i) & 0xff;
  }
  return out;
};

// Always set the polyfills (no conditionals)
global.TextDecoder = TextDecoderPolyfill;
global.TextEncoder = TextEncoderPolyfill;
globalThis.TextDecoder = TextDecoderPolyfill;
globalThis.TextEncoder = TextEncoderPolyfill;

// Create global decoder/encoder instances for code that expects them
global.decoder = new TextDecoderPolyfill('utf-8');
global.encoder = new TextEncoderPolyfill();
globalThis.decoder = global.decoder;
globalThis.encoder = global.encoder;

if (typeof self !== 'undefined') {
  self.TextDecoder = TextDecoderPolyfill;
  self.TextEncoder = TextEncoderPolyfill;
  self.decoder = global.decoder;
  self.encoder = global.encoder;
}
