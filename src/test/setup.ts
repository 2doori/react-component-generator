import { GlobalWindow } from 'happy-dom';
import { mock } from 'bun:test';

const happyWindow = new GlobalWindow();
// @ts-expect-error happy-dom global setup
globalThis.window = happyWindow;
// @ts-expect-error happy-dom global setup
globalThis.document = happyWindow.document;

import '@testing-library/jest-dom';

mock.module('react-live', () => ({
  LiveProvider: ({ children }: { children: unknown }) => children,
  LivePreview: () => null,
  LiveError: () => null,
}));
