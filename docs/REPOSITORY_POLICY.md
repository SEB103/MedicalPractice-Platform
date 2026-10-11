# Clean product repository policy

This standalone repository contains product source, documentation, tests, dependency lockfiles, CI/CD, deployment and licenses only. Claude Code workspace, its prompts, agents, skills, local tickets/references and generated reports must remain in the **separate outer workspace** repository or untracked directories.

`.gitignore` is a guardrail only. Before commits check `git status --short`, `git diff --cached --name-only` and run `python scripts/validate_scaffold.py`. Never commit `.env`, medical/patient details, DB dumps, tokens or machine-specific configuration.

All changes should go through focused Pull Requests with GitHub Actions tests. Auth, privacy, migrations, staging and deployment may require human approval. GitHub Actions needs to work when this repository is cloned **alone**.

## Nested checkout and copying the scaffold

When this repository has already been cloned, **do not run `git init` again**.
Copy the *contents* of the scaffold's `MedicalPractice-Platform/` folder into
`AI-Workspace-Django-Quasar/project/`; never create `project/MedicalPractice-Platform/`.
Preserve the repository's existing `.git/` and `LICENSE`. Do not bring in a
second `.git/` directory or overwrite an existing license/copyright header.

The source archive v0.1.1 intentionally omits a static SHA-256 manifest: a
file-list hash snapshot becomes stale on the very next source code change. Git
and the reproducible release process are responsible for source and artifact
versioning; future release digests should be generated from release artifacts.
