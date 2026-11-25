import { query } from "@anthropic-ai/claude-agent-sdk";
import chalk from "chalk";
import { handleMessage } from "./message-handler.js";
import { buildModeOptions, CliMode } from "./modes.js";

export type RunQueryOptions = {
    mode?: CliMode;
    verbose?: boolean;
    trustProject?: boolean;
}

export async function runQuery(prompt:string, options:RunQueryOptions = {}) {
    try {
        const {verbose = false, mode =  "agent", trustProject = false} = options;
        for await (const message of query({
            prompt,
            options:buildModeOptions(mode, {trustProject})
        })){
             handleMessage(message, {verbose});
        }

    } catch (error) {
         console.error(chalk.red("Error: "), error);
    }

}
