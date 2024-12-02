import { select, input } from "@inquirer/prompts";
import { configManager } from "@utils/config";

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
  console.log("JIRA configuration updated successfully!");
}

async function configureAll() {
  while (true) {
    const config = await select({
      message: "What would you like to configure?",
      choices: [
        { name: "JIRA Settings", value: "jira" },
        { name: "Git Project", value: "git" },
        { name: "Preferences", value: "preferences" },
        { name: "Exit", value: "exit" },
      ],
    });

    if (config === "exit") break;

    switch (config) {
      case "jira":
        await configureJira();
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
