import os from "os";
import path from "path";
import fs from "fs/promises";
import type { Config } from "@type/index";

class ConfigManager {
  private configPath: string;

  constructor() {
    this.configPath = path.join(os.homedir(), ".jiracraft", "config.json");
  }

  private async ensureConfigDir(): Promise<void> {
    const configDir = path.dirname(this.configPath);
    try {
      await fs.mkdir(configDir, { recursive: true });
    } catch (error: any) {
      if (error.code !== "EEXIST") throw error;
    }
  }

  async load(): Promise<Config> {
    try {
      await this.ensureConfigDir();
      const data = await fs.readFile(this.configPath, "utf8");
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return {
          jira: {
            baseUrl: "",
            token: "",
            username: "",
          },
        };
      }
      throw error;
    }
  }

  async save(config: Config): Promise<void> {
    await this.ensureConfigDir();
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  async updateSection<K extends keyof Config>(section: K, values: Partial<Config[K]>): Promise<Config> {
    const config = await this.load();
    config[section] = { ...config[section], ...values };
    await this.save(config);
    return config;
  }
}

export const configManager = new ConfigManager();
