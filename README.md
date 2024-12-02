# JiraCraft

Simple CLI tool that creates Git branches from JIRA tickets. Automatically fetches ticket details and creates properly formatted branch names.

## Installation

```bash
# Clone and install dependencies
npm install

# Make command available globally
npm link
```

## Setup

Configure your JIRA credentials:

```bash
jc config
```

## Usage

From within any git repository:

```bash
jc start-work

# Or directly with a ticket ID
jc start-work DC-1234
```

The tool will:

1. Fetch the ticket details from JIRA
2. Create a branch name following the pattern: `type/ticket-id/title`
3. Create and checkout the new branch

## License

MIT
