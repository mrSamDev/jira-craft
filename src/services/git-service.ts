import { exec } from "child_process";
import { promisify } from "util";
import { BranchNameStyle } from "../types/index.js";

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
    if (!(await this.isGitRepository())) {
      throw new Error("Not a git repository. Please run this command from within a git repository.");
    }

    try {
      await execAsync(`git checkout -b ${branchName}`);
    } catch (error: any) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  formatBranchName(params: { prefix?: string; type: string; ticketId: string; title: string; style?: BranchNameStyle }): string {
    const { prefix, type, ticketId, title, style = BranchNameStyle.TYPE_TICKET_TITLE } = params;

    const formattedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9-\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    switch (style) {
      case BranchNameStyle.PREFIX_TYPE_TICKET_TITLE:
        return prefix ? `${prefix}/${type}/${ticketId}-${formattedTitle}` : `${type}/${ticketId}-${formattedTitle}`;

      case BranchNameStyle.PREFIX_TYPE_TICKET_SLASH_TITLE:
        return prefix ? `${prefix}/${type}/${ticketId}/${formattedTitle}` : `${type}/${ticketId}/${formattedTitle}`;

      case BranchNameStyle.TYPE_TICKET_TITLE:
      default:
        return `${type}/${ticketId}/${formattedTitle}`;
    }
  }

  toUrlFriendly(str: string) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
