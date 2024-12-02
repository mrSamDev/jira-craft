import { configManager } from "../utils/config";
import logger from "../utils/log";

export async function displayOptions(): Promise<void> {
  const config = await configManager.load();

  logger.info("\n" + "📋 Current Configuration:\n");

  logger.info("JIRA Settings:");
  logger.info(`Base URL: ${config.jira.baseUrl || "Not configured"}`);
  logger.info(`Username: ${config.jira.username || "Not configured"}`);
  logger.info(`Token: ${config.jira.token ? "********" : "Not configured"}\n`);

  logger.info("🛠️  Available Commands:\n");

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
    logger.info(`${cmd.name}:`);
    logger.log(`Description: ${cmd.description}`);
    logger.log("Options:");
    cmd.options.forEach((opt) => console.log(`  - ${opt}`));
  });
}
