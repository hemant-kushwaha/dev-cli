import { Command } from "commander";

export function createCli() {
  const program = new Command()
    .name("dev-cli")
    .description("Cursor like Cli Agent")
    .version("0.1.0");

  program
  .command("hello")
  .description("Print a greet message")
  .action(()=>{
    console.log("hello world");
  });

  program
  .action(()=>{
    program.help();
  });

  return program;
}
