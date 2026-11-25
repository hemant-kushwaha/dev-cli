import { query, type Query } from "@anthropic-ai/claude-agent-sdk";
import {
  buildModeOptions,
  type CliMode,
  type SessionOptions,
} from "./modes.js";
import { InputQueue } from "./input-queue.js";

export type AgentSession = {
  query: Query;
  inputQueue: InputQueue;
  mode: CliMode;
};

export function createSession(
  mode: CliMode,
  sessionOptions: SessionOptions = {},
): AgentSession {
  const inputQueue = new InputQueue();
  const agentQuery = query({
    prompt: inputQueue.generator(),
    options: buildModeOptions(mode, sessionOptions),
  });

  return { query: agentQuery, inputQueue, mode };
}
