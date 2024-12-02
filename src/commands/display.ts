import { configManager } from "../utils/config";
import chalk from "chalk";

export async function displayOptions(): Promise<void> {
  const config = await configManager.load();

  console.log("\n" + chalk.blue.bold("📋 Current Configuration:\n"));

  console.log(chalk.yellow.bold("JIRA Settings:"));
  console.log(`Base URL: ${config.jira.baseUrl || "Not configured"}`);
  console.log(`Username: ${config.jira.username || "Not configured"}`);
  console.log(`Token: ${config.jira.token ? "********" : "Not configured"}\n`);

  console.log(chalk.blue.bold("🛠️  Available Commands:\n"));

  const commands = [
    {
      name: "config",
      description: "Configure CLI settings",
      options: ["JIRA Settings", "Git Projects", "Preferences"],
    },
    {
      name: "start-work",
      description: "Start work on a JIRA ticket",
      options: ["Creates feature branch", "Updates JIRA status"],
    },
  ];

  commands.forEach((cmd) => {
    console.log(chalk.cyan.bold(`${cmd.name}:`));
    console.log(`Description: ${cmd.description}`);
    console.log("Options:");
    cmd.options.forEach((opt) => console.log(`  - ${opt}`));
    console.log();
  });
}
