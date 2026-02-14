// Hard TextDecoder/TextEncoder shim for Expo Go (Hermes/JSC).
// Ensures decode is always present and a shared decoder is available.
// fast-text-encoding sets globals via IIFE, doesn't use CommonJS exports
require('fast-text-encoding');

// Get the constructors from global scope (set by fast-text-encoding IIFE)
const TextDecoder = global.TextDecoder;
const TextEncoder = global.TextEncoder;

const decoder = new TextDecoder('utf-8');
const encoder = new TextEncoder();

// Align globals/scope variants
globalThis.self = globalThis.self || globalThis;
globalThis.window = globalThis.window || globalThis;
global.self = globalThis;
global.window = globalThis;

const targets = [global, globalThis, global.window, global.self];
function lock(name, value) {
  for (const t of targets) {
    if (!t) continue;
    try {
      Object.defineProperty(t, name, {
        configurable: false,
        enumerable: false,
        writable: false,
        value,
      });
    } catch (_) {
      t[name] = value;
    }
  }
}

lock('TextDecoder', TextDecoder);
lock('TextEncoder', TextEncoder);
lock('decoder', decoder);
lock('encoder', encoder);

module.exports = { TextDecoder, TextEncoder, decoder, encoder };
