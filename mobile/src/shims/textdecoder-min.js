// Minimal TextDecoder/TextEncoder polyfill for Metro pre-main load (CommonJS).
// Provides utf-8/utf-16le decoding used by some dependencies.

// Ensure global is available in Metro's pre-main context
const g = typeof global !== 'undefined' ? global : (typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {});

// Ensure global is defined (don't reassign if it already exists)
if (typeof global === 'undefined') {
  global = g;
}

console.log('[TextDecoder Polyfill] Starting polyfill load...');

function toU8(input) {
  if (!input) return new Uint8Array(0);
  return input instanceof ArrayBuffer
    ? new Uint8Array(input)
    : new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
}

function decodeUtf16Le(bytes) {
  const len = bytes.length;
  const codeUnits = new Uint16Array(Math.floor(len / 2));
  for (let i = 0; i + 1 < len; i += 2) codeUnits[i / 2] = bytes[i] | (bytes[i + 1] << 8);
  let out = '';
  const chunk = 0x8000;
  for (let i = 0; i < codeUnits.length; i += chunk) {
    out += String.fromCharCode.apply(null, codeUnits.subarray(i, i + chunk));
  }
  return out;
}

function decodeUtf8(bytes) {
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
}

function TextDecoderPolyfill(label) {
  this.enc = (label || 'utf-8').toLowerCase();
  if (this.enc === 'utf8') this.enc = 'utf-8';
}

TextDecoderPolyfill.prototype.decode = function (input) {
  const bytes = toU8(input);
  if (this.enc === 'utf-16le' || this.enc === 'utf-16') return decodeUtf16Le(bytes);
  if (this.enc === 'utf-8') return decodeUtf8(bytes);
  return '';
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

// ALWAYS set the polyfills (no conditionals - ensures they're available)
global.TextDecoder = TextDecoderPolyfill;
global.TextEncoder = TextEncoderPolyfill;
globalThis.TextDecoder = TextDecoderPolyfill;
globalThis.TextEncoder = TextEncoderPolyfill;

// Create global decoder/encoder instances for code that expects them
global.decoder = new TextDecoderPolyfill('utf-8');
global.encoder = new TextEncoderPolyfill();
globalThis.decoder = global.decoder;
globalThis.encoder = global.encoder;

console.log('[TextDecoder Polyfill] Polyfills loaded successfully');
console.log('[TextDecoder Polyfill] global.decoder:', typeof global.decoder);
console.log('[TextDecoder Polyfill] global.encoder:', typeof global.encoder);
console.log('[TextDecoder Polyfill] global.decoder.decode:', typeof global.decoder.decode);

