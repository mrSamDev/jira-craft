import { select, input, confirm } from "@inquirer/prompts";
import { JiraService } from "../services/jira-service";
import { GitService } from "../services/git-service";
import { configManager } from "../utils/config.js";
import type { Project } from "../types/index";
import chalk from "chalk";
import logger from "../utils/log";

const BRANCH_TYPES = {
  Story: "feature",
  Bug: "bugfix",
  Task: "task",
  "Sub-task": "task",
  Improvement: "improvement",
  Hotfix: "hotfix",
} as const;

async function selectProject(projects: Project[]) {
  if (projects.length === 0) {
    return null;
  }

  if (projects.length === 1) {
    return projects[0];
  }

  return await select({
    message: "Select project:",
    choices: projects.map((project, index) => ({
      name: `${project.prefix || "Default"} (${project.branchNameStyle})`,
      value: project,
    })),
  });
}

export async function startWork(ticketId?: string): Promise<void> {
  try {
    const gitService = new GitService();

    if (!(await gitService.isGitRepository())) {
      throw new Error("Please run this command from within a git repository");
    }

    const jiraService = await JiraService.initialize();
    const config = await configManager.load();

    // Get project configuration
    const project = await selectProject(config.git?.projects || []);

    if (!ticketId) {
      ticketId = await input({
        message: "Enter JIRA ticket ID:",
        validate: (value) => value.trim() !== "" || "JIRA ID is required",
      });
    }

    logger.info("\nFetching JIRA issue details...");
    const issue = await jiraService.getIssue(ticketId);

    let defaultType = issue.issueType ? gitService.toUrlFriendly(issue.issueType) : BRANCH_TYPES[issue.issueType as keyof typeof BRANCH_TYPES] || "task";

    logger.info("\nJIRA Issue Details:");
    logger.log(`Title    : ${issue.title}`);
    logger.log(`Type     : ${issue.issueType}`);
    logger.log(`Priority : ${issue.priority}`);

    const confirmed = await confirm({
      message: "Use these details for branch creation?",
      default: true,
    });

    if (!confirmed) {
      issue.title = await input({
        message: "Enter ticket title:",
        default: issue.title,
        validate: (value) => value.trim() !== "" || "Title is required",
      });

      defaultType = await select({
        message: "Select branch type:",
        choices: Object.entries(BRANCH_TYPES).map(([name, value]) => ({
          name,
          value,
        })),
        default: defaultType,
      });
    }

    const branchName = gitService.formatBranchName({
      prefix: project?.prefix,
      type: defaultType,
      ticketId,
      title: issue.title,
      style: project?.branchNameStyle,
    });

    await gitService.createAndCheckoutBranch(branchName);

    logger.success(`\n✓ Successfully created and checked out branch: ${chalk.bold(branchName)}`);

    // Display next steps
    logger.info("\nNext steps:");
    logger.log("1. Start making your changes");
    logger.log(`2. Push your branch: ${chalk.cyan(`git push -u origin ${branchName}`)}`);
    logger.log(`3. Create a pull request when ready\n`);
  } catch (e: any) {
    logger.error(`\n✗ Error: ${e.message}`);
    process.exit(1);
  }
}
