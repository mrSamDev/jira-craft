import { configManager } from "../utils/config.js";
import logger from "../utils/log.js";

function createTable(headers: string[], rows: string[][]): string {
  const columnWidths = headers.map((header, index) => {
    const columnValues = [header, ...rows.map((row) => row[index] || "")];
    return Math.max(...columnValues.map((val) => val.length));
  });

  const separator = columnWidths.map((width) => "─".repeat(width)).join("─┼─");

  const formatRow = (row: string[]) => row.map((cell, i) => cell.padEnd(columnWidths[i])).join(" │ ");

  return [formatRow(headers), separator, ...rows.map((row) => formatRow(row))].join("\n");
}

export async function displayOptions(): Promise<void> {
  const config = await configManager.load();

  logger.info("\n📋 Current Configuration\n");

  logger.info("🔑 JIRA Settings");
  logger.info("──────────────");
  logger.log(`Base URL  : ${config.jira.baseUrl || "Not configured"}`);
  logger.log(`Username  : ${config.jira.username || "Not configured"}`);
  logger.log(`API Token : ${config.jira.token ? "********" : "Not configured"}\n`);

  logger.info("🌿 Git Projects");
  logger.info("────────────");
  if (!config.git?.projects?.length) {
    logger.log("No projects configured\n");
  } else {
    const projectRows = config.git.projects.map((project, index) => [(index + 1).toString(), project.prefix || "N/A", project.branchNameStyle || "Default"]);

    logger.log(createTable(["#", "Prefix", "Branch Style"], projectRows));
    logger.log("\n");
  }

  logger.info("🛠️  Available Commands");
  logger.info("─────────────────");

  const commands = [
    {
      name: "config",
      description: "Configure CLI settings",
      options: ["JIRA Settings", "Git Project Settings"],
    },
    {
      name: "start-work",
      description: "Start work on a JIRA ticket",
      options: ["Auto-fetch JIRA details", "Smart branch naming"],
    },
  ];

  const commandRows = commands.map((cmd) => [cmd.name, cmd.description, cmd.options.join(", ")]);

  logger.log(createTable(["Command", "Description", "Features"], commandRows));
  logger.log("\n");

  logger.info("📝 Branch Name Styles");
  logger.info("─────────────────");

  const styles = [
    ["prefix/type/id-title", "feat/feature/DC-123-new-feature"],
    ["prefix/type/id/title", "feat/feature/DC-123/new-feature"],
    ["type/id/title", "feature/DC-123/new-feature"],
  ];

  logger.log(createTable(["Pattern", "Example"], styles));
  logger.log("\n");
}
