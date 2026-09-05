"use client";
import { setupWorker } from "msw/browser";
import { deviceManagementHandlers } from "./handlers";
export const deviceManagementWorker = setupWorker(...deviceManagementHandlers);
