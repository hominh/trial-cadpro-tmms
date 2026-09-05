import { setupServer } from "msw/node";
import { deviceManagementHandlers, resetDeviceManagementMock } from "./handlers";
export const deviceManagementServer = setupServer(...deviceManagementHandlers);
export { resetDeviceManagementMock };
