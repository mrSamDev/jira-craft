interface JiraConfig {
  baseUrl: string;
  token: string;
  username: string;
}

export interface JiraIssue {
  title: string;
  description: string;
  issueType: string;
  priority: string;
}

export interface JiraResponse {
  fields: {
    summary: string;
    description: string;
    issuetype: {
      name: string;
    };
    priority: {
      name: string;
    };
  };
}

export enum BranchNameStyle {
  PREFIX_TYPE_TICKET_TITLE = "prefix/issue-type/ticket-id-title",
  PREFIX_TYPE_TICKET_SLASH_TITLE = "prefix/issue-type/ticket-id/title",
  TYPE_TICKET_TITLE = "issue-type/ticket-id/title",
}

export interface Project {
  prefix?: string;
  branchNameStyle?: BranchNameStyle;
}

interface GitConfig {
  projects?: Project[];
}

export interface Config {
  jira: JiraConfig;
  git: GitConfig;
}
