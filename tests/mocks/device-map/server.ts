import { setupServer } from "msw/node";
import { deviceMapHandlers } from "./handlers";

export const deviceMapMockServer = setupServer(...deviceMapHandlers);
