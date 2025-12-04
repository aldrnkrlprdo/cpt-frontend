import '@testing-library/jest-dom';

// Polyfill for React Router / WHATWG APIs
import { TextEncoder, TextDecoder } from 'util';

// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder as any;
