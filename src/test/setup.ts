import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import {
  deviceManagementServer,
  resetDeviceManagementMock,
} from "../../tests/mocks/device-management/server";

beforeAll(() => deviceManagementServer.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  deviceManagementServer.resetHandlers();
  resetDeviceManagementMock();
});
afterAll(() => deviceManagementServer.close());

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});
