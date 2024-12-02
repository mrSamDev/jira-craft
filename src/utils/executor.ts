import { spawn } from "child_process";
import path from "path";

export function executeProgram(programName: string, args: string[] = []): void {
  // Point to the compiled version in dist
  const fullPath = path.join(__dirname, "..", programName.replace(/\.ts$/, ".js"));
  console.log("fullPath: ", fullPath);

  const childProcess = spawn("node", [fullPath, ...args], {
    stdio: "inherit",
  });

  childProcess.on("error", (error) => {
    console.error(`Error executing ${programName}:`, error);
    process.exit(1);
  });

  childProcess.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Program ${programName} exited with code ${code}`);
      process.exit(code ?? 1);
    }
  });
}
