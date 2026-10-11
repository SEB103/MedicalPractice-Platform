# Clean product repository policy

This standalone repository contains product source, documentation, tests, dependency lockfiles, CI/CD, deployment and licenses only. Claude Code workspace, its prompts, agents, skills, local tickets/references and generated reports must remain in the **separate outer workspace** repository or untracked directories.

`.gitignore` is a guardrail only. Before commits check `git status --short`, `git diff --cached --name-only` and run `python scripts/validate_scaffold.py`. Never commit `.env`, medical/patient details, DB dumps, tokens or machine-specific configuration.

All changes should go through focused Pull Requests with GitHub Actions tests. Auth, privacy, migrations, staging and deployment may require human approval. GitHub Actions needs to work when this repository is cloned **alone**.
