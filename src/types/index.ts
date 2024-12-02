interface JiraConfig {
  baseUrl: string;
  token: string;
  username: string;
}

export interface JiraIssue {
  title: string;
  description: string;
  issueType: string;
}

export interface JiraResponse {
  fields: {
    summary: string;
    description: string;
    issuetype: {
      name: string;
    };
  };
}

export interface Config {
  jira: JiraConfig;
}
