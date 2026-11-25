import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { config } from "dotenv";
import { execa } from "execa";

/**
 * dev-cli's own .env, resolved from this file's location (src/config or
 * dist/config, both two levels below the package root).
 */
export const ENV_FILE = fileURLToPath(new URL("../../.env", import.meta.url));

// The only place .env is loaded. It is never read from the working directory,
// so the project being worked on cannot inject variables such as
// ANTHROPIC_BASE_URL. Variables already set in the shell win.
config({ path: ENV_FILE, override: false, quiet: true });

const PASSTHROUGH_VARS = ["PATH", "HOME", "SHELL", "TERM", "LANG", "TMPDIR", "USER"];

export function isAnthropicVar(name: string): boolean {
  return name.startsWith("ANTHROPIC_");
}

/**
 * The complete environment for the agent subprocess. The SDK's `env` option
 * replaces the inherited environment instead of merging with it, so anything
 * not copied here is invisible to the agent and its Bash commands.
 */
export function buildAgentEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [name, value] of Object.entries(process.env)) {
    if (value === undefined) continue;
    if (PASSTHROUGH_VARS.includes(name) || isAnthropicVar(name)) {
      env[name] = value;
    }
  }
  return env;
}

export function requireApiKey(): string {
  const key = process.env.ANTHROPIC_AUTH_TOKEN;
  if (!key) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY. Copy .env.example to .env and add your key."
    );
  }
  return key;
}

export async function checkEnvironment(): Promise<void> {
  const { stdout } = await execa("node", ["-v"]);
  const major = parseInt(stdout.trim().replace(/^v/, "").split(".")[0] ?? "0", 10);

  if (major < 18) {
    throw new Error(`Node.js 18+ required (found ${stdout.trim()})`);
  }

  requireApiKey();
  console.log(chalk.green("✓ Node.js is >= 18"));
  console.log(chalk.green("✓ ANTHROPIC_API_KEY is set"));
}
