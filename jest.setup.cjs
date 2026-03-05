require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('util');
Object.assign(global, { TextDecoder, TextEncoder });

global.Request = class Request { };
global.Response = class Response { };
global.Headers = class Headers { };
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
