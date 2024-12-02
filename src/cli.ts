#!/usr/bin/env node
import { Command } from "commander";
import { select, input } from "@inquirer/prompts";
import { configureAll } from "./commands/config";
import { displayOptions } from "./commands/display";
import { startWork } from "./programs/start-work";
import logger from "./utils/log";

const program = new Command();

async function promptUserChoices(): Promise<void> {
  const action = await select({
    message: "What would you like to do?",
    choices: [
      { name: "Display Options & Configuration", value: "display" },
      { name: "Configure Settings", value: "config" },
      { name: "Start Work on JIRA Ticket", value: "start-work" },
      { name: "Exit", value: "exit" },
    ],
  });

  switch (action) {
    case "display":
      await displayOptions();
      break;
    case "config":
      await configureAll();
      break;

    case "start-work": {
      const jiraId = await input({
        message: "Enter JIRA ticket ID:",
        validate: (value) => value.trim() !== "" || "JIRA ID is required",
      });

      await startWork(jiraId);

      break;
    }

    case "exit": {
      console.log("Goodbye! 👋");
      process.exit(0);
    }
  }

  await promptUserChoices();
}

program.name("jiracraft").description("JIRA ticket to Git branch creation").version("1.0.0");

program
  .command("start-work [ticketId]")
  .description("Start work on a JIRA ticket")
  .action(async (ticketId) => {
    try {
      await startWork(ticketId);
    } catch (error: any) {
      logger.error(error.message);
      process.exit(1);
    }
  });

program.action(promptUserChoices);

program.parse();
