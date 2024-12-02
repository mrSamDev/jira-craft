import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class GitService {
  async isGitRepository(): Promise<boolean> {
    try {
      await execAsync("git rev-parse --is-inside-work-tree");
      return true;
    } catch {
      return false;
    }
  }

  async getCurrentBranch(): Promise<string> {
    const { stdout } = await execAsync("git branch --show-current");
    return stdout.trim();
  }

  async createAndCheckoutBranch(branchName: string): Promise<void> {
    // Check if we're in a git repository
    if (!(await this.isGitRepository())) {
      throw new Error("Not a git repository. Please run this command from within a git repository.");
    }

    // Create and checkout the new branch
    try {
      await execAsync(`git checkout -b ${branchName}`);
    } catch (error: any) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  static formatBranchName(params: { type: string; ticketId: string; title: string }): string {
    const { type, ticketId, title } = params;

    const formattedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9-\s]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

    return `${type}/${ticketId}/${formattedTitle}`;
  }
}
