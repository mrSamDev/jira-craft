import { select, input, confirm } from "@inquirer/prompts";
import { JiraService } from "../services/jira-service";
import { GitService } from "../services/git-service";
import chalk from "chalk";

const log = console.log;
const error = console.error;

const BRANCH_TYPES = {
  Story: "feature",
  Bug: "bugfix",
  Task: "task",
  "Sub-task": "task",
  Improvement: "improvement",
  Hotfix: "hotfix",
} as const;

export async function startWork(ticketId?: string): Promise<void> {
  try {
    const gitService = new GitService();

    if (!(await gitService.isGitRepository())) {
      throw new Error("Please run this command from within a git repository");
    }

    const jiraService = await JiraService.initialize();

    if (!ticketId) {
      ticketId = await input({
        message: "Enter JIRA ticket ID:",
        validate: (value) => value.trim() !== "" || "JIRA ID is required",
      });
    }

    log(chalk.blue("\nFetching JIRA issue details..."));
    const issue = await jiraService.getIssue(ticketId);

    let defaultType = BRANCH_TYPES[issue.issueType as keyof typeof BRANCH_TYPES] || "task";

    log(chalk.cyan("\nJIRA Issue Details:"));
    log(`Title: ${issue.title}`);
    log(`Type: ${issue.issueType}`);

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

    const branchName = GitService.formatBranchName({
      type: defaultType,
      ticketId,
      title: issue.title,
    });

    await gitService.createAndCheckoutBranch(branchName);

    log(chalk.green(`\n✓ Successfully created and checked out branch: ${chalk.bold(branchName)}`));

    // Display next steps
    log(chalk.blue("\nNext steps:"));
    log("1. Start making your changes");
    log(`2. Push your branch: ${chalk.cyan(`git push -u origin ${branchName}`)}`);
    log(`3. Create a pull request when ready\n`);
  } catch (e: any) {
    error(chalk.red(`\n✗ Error: ${e.message}`));
    process.exit(1);
  }
}
