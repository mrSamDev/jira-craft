import ky from "ky";
import { configManager } from "../utils/config";
import type { JiraIssue, JiraResponse } from "types/index";

export class JiraService {
  private api: typeof ky;

  constructor(baseUrl: string, username: string, token: string) {
    this.api = ky.create({
      prefixUrl: baseUrl,
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${username}:${token}`).toString("base64")}`,
      },
      retry: {
        limit: 2,
        methods: ["get"],
      },
      timeout: 10000,
    });
  }

  static async initialize(): Promise<JiraService> {
    const config = await configManager.load();
    const { baseUrl, username, token } = config.jira;

    if (!baseUrl || !username || !token) {
      throw new Error('JIRA configuration not found. Please run "dev config" first.');
    }

    return new JiraService(baseUrl, username, token);
  }

  async getIssue(issueKey: string): Promise<JiraIssue> {
    try {
      const response = await this.api.get(`rest/api/3/issue/${issueKey}`).json<JiraResponse>();

      return {
        title: response.fields.summary,
        description: response.fields.description,
        issueType: response.fields.issuetype.name.toLowerCase(),
      };
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 401:
            throw new Error("Invalid JIRA credentials. Please update your configuration.");
          case 404:
            throw new Error(`JIRA issue ${issueKey} not found.`);
          default:
            throw new Error(`JIRA API error: ${status}`);
        }
      }
      throw new Error(`Failed to fetch JIRA issue: ${error.message}`);
    }
  }
}
