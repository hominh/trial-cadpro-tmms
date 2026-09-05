import { makeDevices } from "./device-map.fixtures";

export const DEVICE_MAP_FIXTURE_SEED = 20260904;
export const generatePerformanceFixtures = () => ({
  twoThousand: makeDevices(2000, DEVICE_MAP_FIXTURE_SEED),
  fiveThousand: makeDevices(5000, DEVICE_MAP_FIXTURE_SEED),
  tooDense: makeDevices(5001, DEVICE_MAP_FIXTURE_SEED),
});
