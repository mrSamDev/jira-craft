import chalk from "chalk";

interface Logger {
  log: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  success: (message: string) => void;
}

const logger: Logger = {
  log: (message: string) => console.log(message),
  error: (message: string) => console.log(chalk.red(`✗ ${message}`)),
  info: (message: string) => console.log(chalk.blue(`ℹ ${message}`)),
  success: (message: string) => console.log(chalk.green(`✓ ${message}`)),
};

export default logger;
