require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (typeof global.Request === 'undefined') {
  global.Request = class Request { };
}
if (typeof global.Response === 'undefined') {
  global.Response = class Response { };
}
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers { };
}

jest.mock('uncrypto', () => ({
  getRandomValues: jest.fn(),
  randomUUID: jest.fn(),
}));

const { ReadableStream, TransformStream } = require('node:stream/web');
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;

const { MessageChannel, MessagePort } = require('worker_threads');
global.MessageChannel = MessageChannel;
global.MessagePort = MessagePort;

// Use native fetch/Request/Response/Headers available in Node.js 18+
// No need to require undici as it might cause module-not-found issues in some environments
if (typeof global.fetch === 'undefined' && typeof fetch !== 'undefined') {
  global.fetch = fetch;
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
} else if (typeof global.fetch === 'undefined') {
  // If truly missing (older Node), the previous class stubs 10-15 will be used or we can use undici as a fallback
  try {
    const { fetch, Request: UndiciRequest, Response: UndiciResponse, Headers: UndiciHeaders } = require('undici');
    global.fetch = fetch;
    global.Request = UndiciRequest;
    global.Response = UndiciResponse;
    global.Headers = UndiciHeaders;
  } catch (e) {
    console.warn('Native fetch and undici are both missing. Some tests might fail.');
  }
}
