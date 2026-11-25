import { existsSync } from "node:fs";
import type {
  Options,
  PermissionMode,
  SandboxSettings,
} from "@anthropic-ai/claude-agent-sdk";
import { buildAgentEnv, ENV_FILE, isAnthropicVar } from "../config/env.js";

export type CliMode = "agent" | "ask" | "plan";

export type SessionOptions = {
  /** Load the working directory's .claude settings, .mcp.json and CLAUDE.md. */
  trustProject?: boolean;
};

const READ_TOOLS = ["Read", "Glob", "Grep", "WebSearch", "WebFetch"] as const;
const AGENT_TOOLS = ["Read", "Edit", "Write", "Bash", "Glob", "Grep"] as const;
const BLOCKED_WRITE_TOOLS = ["Edit", "Write", "Bash"] as const;

// The directory dev-cli was started in.
const START_DIR = process.cwd();

/**
 * Bash commands run inside the SDK's OS sandbox. The agent process itself
 * needs the ANTHROPIC_* variables, but the commands it runs do not, so they
 * are unset there and dev-cli's own .env is unreadable from them.
 */
function buildSandbox(agentEnv: Record<string, string>): SandboxSettings {
  return {
    enabled: true,
    // Refuse to start rather than silently run commands unsandboxed.
    failIfUnavailable: true,
    // Ignore the model's dangerouslyDisableSandbox escape hatch.
    allowUnsandboxedCommands: false,
    credentials: {
      envVars: Object.keys(agentEnv)
        .filter(isAnthropicVar)
        .map((name) => ({ name, mode: "deny" as const })),
      files: existsSync(ENV_FILE)
        ? [{ path: ENV_FILE, mode: "deny" as const }]
        : [],
    },
  };
}

function buildBaseOptions({ trustProject = false }: SessionOptions): Options {
  const env = buildAgentEnv();
  return {
    maxTurns: 25,
    maxBudgetUsd: 1.0,
    model: "deepseek-v4-1-flash-1017",
    effort: "medium",
    cwd: START_DIR,
    env,
    // By default nothing in the working directory configures the agent: no
    // .claude/settings.json (hooks, permission rules), no .mcp.json, no
    // project commands, agents, skills or CLAUDE.md.
    settingSources: trustProject ? ["project"] : [],
    strictMcpConfig: !trustProject,
    sandbox: buildSandbox(env),
  };
}

export function cliModeToPermissionMode(mode: CliMode): PermissionMode {
  switch (mode) {
    case "agent":
      return "acceptEdits";
    case "ask":
      return "dontAsk";
    case "plan":
      return "plan";
  }
}

export function buildModeOptions(
  mode: CliMode,
  sessionOptions: SessionOptions = {},
): Options {
  const base = buildBaseOptions(sessionOptions);
  switch (mode) {
    case "agent":
      return {
        ...base,
        permissionMode: "acceptEdits" satisfies PermissionMode,
        allowedTools: [...AGENT_TOOLS],
      };
    case "ask":
      return {
        ...base,
        permissionMode: "dontAsk" satisfies PermissionMode,
        allowedTools: [...READ_TOOLS],
        disallowedTools: [...BLOCKED_WRITE_TOOLS],
      };
    case "plan":
      return {
        ...base,
        permissionMode: "plan" satisfies PermissionMode,
        allowedTools: [...READ_TOOLS],
        disallowedTools: [...BLOCKED_WRITE_TOOLS],
      };
  }
}

export function parseCliMode(value: string): CliMode | null {
  if (value === "agent" || value === "ask" || value === "plan") {
    return value;
  }
  return null;
}
