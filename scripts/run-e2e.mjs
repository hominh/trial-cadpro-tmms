import { spawn } from "node:child_process";
import http from "node:http";

const isWindows = process.platform === "win32";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3107"], {
  cwd: process.cwd(),
  detached: !isWindows,
  env: process.env,
  stdio: "inherit",
});

function probe() {
  return new Promise((resolve) => {
    const request = http.get("http://127.0.0.1:3107", (response) => {
      response.resume();
      resolve(response.statusCode === 200 || response.statusCode === 404);
    });
    request.on("error", () => resolve(false));
    request.setTimeout(1000, () => { request.destroy(); resolve(false); });
  });
}

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (await probe()) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Timed out waiting for Next.js on port 3107.");
}

function stopServer() {
  if (!server.pid) return;
  if (isWindows) server.kill("SIGTERM");
  else {
    try { process.kill(-server.pid, "SIGTERM"); } catch { /* already stopped */ }
  }
}

let exitCode = 1;
try {
  await waitForServer();
  const testCommand = isWindows ? "cmd.exe" : process.execPath;
  const testArgs = isWindows
    ? ["/d", "/s", "/c", "npx playwright test"]
    : ["node_modules/@playwright/test/cli.js", "test"];
  const tests = spawn(testCommand, testArgs, {
    cwd: process.cwd(),
    env: { ...process.env, PLAYWRIGHT_EXTERNAL_SERVER: "1" },
    stdio: ["ignore", "inherit", "inherit"],
  });
  exitCode = await new Promise((resolve) => tests.on("exit", (code) => resolve(code ?? 1)));
} finally {
  stopServer();
}
process.exitCode = exitCode;
