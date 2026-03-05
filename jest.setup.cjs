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

const { fetch, Request: UndiciRequest, Response: UndiciResponse, Headers: UndiciHeaders } = require('undici');
global.fetch = fetch;
global.Request = UndiciRequest;
global.Response = UndiciResponse;
global.Headers = UndiciHeaders;
