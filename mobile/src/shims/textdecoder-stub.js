// Minimal stub to ensure TextDecoder/TextEncoder exist before any other module runs.
function StubTextDecoder() {}
StubTextDecoder.prototype.decode = function (input) {
  if (!input) return '';
  if (input instanceof Uint8Array) {
    let out = '';
    for (let i = 0; i < input.length; i++) out += String.fromCharCode(input[i]);
    return out;
  }
  return String(input);
};

function StubTextEncoder() {}
StubTextEncoder.prototype.encode = function (str = '') {
  const s = String(str);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
  return out;
};

const g = globalThis || global || {};
g.TextDecoder = g.TextDecoder || StubTextDecoder;
g.TextEncoder = g.TextEncoder || StubTextEncoder;
if (typeof global !== 'undefined') {
  global.TextDecoder = global.TextDecoder || StubTextDecoder;
  global.TextEncoder = global.TextEncoder || StubTextEncoder;
}
if (typeof self !== 'undefined') {
  self.TextDecoder = self.TextDecoder || StubTextDecoder;
  self.TextEncoder = self.TextEncoder || StubTextEncoder;
}

module.exports = { StubTextDecoder, StubTextEncoder };
