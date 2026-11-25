import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";
import chalk from "chalk";
import { handleMessage, MessageHandlerOptions } from "./message-handler.js";

export async function runQuery(prompt:string, options:MessageHandlerOptions = {}) {
    try {
        const {verbose = false} = options;
        for await (const message of query({
            prompt,
            options:{
                model:'deepseek-v4-1-flash-1017',
                maxTurns:5,
                allowedTools:["Read" , "Glob", "Grep"],
                permissionMode:"acceptEdits"
            }

        })){
             handleMessage(message, {verbose:true});
        }
        
    } catch (error) {
         console.error(chalk.red("Error: "), error);        
    }
    
}