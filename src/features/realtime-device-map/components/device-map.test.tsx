import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MapStatusOverlay } from "./map-status-overlay";
import { getDeviceIcon } from "../utils/device-icon";

describe("device map presentation", () => {
  it("renders loading, stale and dense states with text", () => {
    const { rerender } = render(<MapStatusOverlay status="loading" count={0} unlocatedCount={0} lastSuccessAt={null} error={null} tooDense={null} />);
    expect(screen.getByText(/Đang tải/)).toBeInTheDocument();
    rerender(<MapStatusOverlay status="tooDense" count={0} unlocatedCount={0} lastSuccessAt={null} error={null} tooDense={{ matched: 5001, maxItems: 5000 }} />);
    expect(screen.getByText(/zoom in/)).toBeInTheDocument();
  });
  it("creates type/status/unknown icons without relying on color alone", () => {
    const known = getDeviceIcon({ typeCode: "lpr_camera", online: true, alertLevel: "normal", selected: false });
    const unknown = getDeviceIcon({ typeCode: "new_type", online: false, alertLevel: "high", selected: false });
    expect(known.options.html).toContain("CAM");
    expect(unknown.options.html).toContain("DEV");
    expect(unknown.options.html).toContain("is-offline");
  });
});
