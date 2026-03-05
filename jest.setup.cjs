require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('util');
Object.assign(global, { TextDecoder, TextEncoder });

global.Request = class Request {};
global.Response = class Response {};
global.Headers = class Headers {};
jest.mock('uncrypto', () => ({
  getRandomValues: jest.fn(),
  randomUUID: jest.fn(),
}));
