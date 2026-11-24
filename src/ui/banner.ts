import chalk from "chalk";
import boxen from "boxen";
import figlet from "figlet";


export function printBanner(){
    const title = figlet.textSync("Dev-cli" , {font:"Standard"});
    const panel = boxen(
        chalk.cyan("Welcome to DevCLI \n") +
          chalk.dim("Full Production Ready"),
        { padding: 1, borderColor: "cyan" }
      );

      console.log(title);
      console.log(panel);
}