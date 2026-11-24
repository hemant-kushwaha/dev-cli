import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";
import chalk from "chalk";

export async function runQuery(prompt:string) {
    try {
        for await (const message of query({
            prompt,
            options:{
                model:'deepseek-v4-1-flash-1017',
                maxTurns:5,
                allowedTools:["Read" , "Glob", "Grep"],
                permissionMode:"acceptEdits"
            }

        })){
                if (message.type === "result" && message.subtype === "success") {
                    console.log(message.result);
                }
        }
        
    } catch (error) {
         console.error(chalk.red("Error: "), error);        
    }
    
}