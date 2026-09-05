"use client";
let startPromise: Promise<unknown> | null = null;
export function startDeviceManagementMock(): Promise<unknown> {
  const localE2e = typeof window !== "undefined" && window.location.hostname === "127.0.0.1";
  const featureMock = process.env.NEXT_PUBLIC_DEVICE_MANAGEMENT_USE_MOCK === "true";
  if (
    process.env.NEXT_PUBLIC_USE_MOCK_API !== "true" &&
    !featureMock &&
    process.env.NODE_ENV !== "development" &&
    !localE2e
  ) {
    return Promise.resolve();
  }
  startPromise ??= import("../../../tests/mocks/device-management/browser").then(
    ({ deviceManagementWorker }) => deviceManagementWorker.start({ onUnhandledRequest: "bypass" })
  );
  return startPromise;
}
