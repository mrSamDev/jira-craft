import { select, input, confirm } from "@inquirer/prompts";
import { configManager } from "../utils/config.js";
import { BranchNameStyle } from "../types/index.js";
import logger from "../utils/log.js";

async function configureJira() {
  const jiraConfig = {
    baseUrl: await input({
      message: "Enter your JIRA base URL:",
      default: "https://your-domain.atlassian.net",
    }),
    username: await input({
      message: "Enter your JIRA username (email):",
    }),
    token: await input({
      message: "Enter your JIRA API token:",
    }),
  };
  await configManager.updateSection("jira", jiraConfig);
  logger.info("JIRA configuration updated successfully!");
}

async function configureGitProjects() {
  const config = await configManager.load();
  const projects = config.git?.projects || [];

  while (true) {
    logger.info("\nCurrent Projects:");
    if (projects.length === 0) {
      logger.log("No projects configured");
    } else {
      projects.forEach((project, index) => {
        logger.log(`${index + 1}. ${project.prefix || "No prefix"} (${project.branchNameStyle || "Default style"})`);
      });
    }

    const action = await select({
      message: "Project configuration:",
      choices: [
        { name: "Add new project", value: "add" },
        { name: "Remove project", value: "remove", disabled: projects.length === 0 },
        { name: "Done", value: "done" },
      ],
    });

    if (action === "done") break;

    if (action === "add") {
      logger.info("\nBranch name style examples:");
      logger.log("1. prefix/issue-type/ticket-id-title");
      logger.log("   Example: feat/feature/DC-123-add-new-feature");
      logger.log("\n2. prefix/issue-type/ticket-id/title");
      logger.log("   Example: feat/feature/DC-123/add-new-feature");
      logger.log("\n3. issue-type/ticket-id/title");
      logger.log("   Example: feature/DC-123/add-new-feature\n");

      const prefix = await input({
        message: "Enter project prefix (e.g., feat, fix):",
        default: "feat",
      });

      const branchNameStyle = await select({
        message: "Select branch name style:",
        choices: [
          {
            name: "Style 1: With prefix and hyphen",
            value: BranchNameStyle.PREFIX_TYPE_TICKET_TITLE,
          },
          {
            name: "Style 2: With prefix and slash",
            value: BranchNameStyle.PREFIX_TYPE_TICKET_SLASH_TITLE,
          },
          {
            name: "Style 3: Without prefix",
            value: BranchNameStyle.TYPE_TICKET_TITLE,
          },
        ],
      });

      projects.push({
        prefix,
        branchNameStyle,
      });

      logger.success("Project added successfully!");
    }

    if (action === "remove") {
      const projectIndex = await select({
        message: "Select project to remove:",
        choices: projects.map((project, index) => ({
          name: `${project.prefix || "No prefix"} (${project.branchNameStyle || "Default style"})`,
          value: index,
        })),
      });

      projects.splice(projectIndex, 1);
      logger.success("Project removed successfully!");
    }
  }

  await configManager.updateSection("git", { projects });
  logger.success("Git projects configuration updated!");
}

async function configureAll() {
  while (true) {
    const config = await select({
      message: "What would you like to configure?",
      choices: [
        { name: "JIRA Settings", value: "jira" },
        { name: "Git Projects", value: "git" },
        { name: "Exit", value: "exit" },
      ],
    });

    if (config === "exit") break;

    switch (config) {
      case "jira":
        await configureJira();
        break;
      case "git":
        await configureGitProjects();
        break;
    }

    const continueConfig = await select({
      message: "Would you like to configure anything else?",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
    });

    if (!continueConfig) break;
  }
}

export { configureAll, configureJira };
