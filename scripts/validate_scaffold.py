#!/usr/bin/env python3
"""Standalone product scaffold checks, with no third-party dependencies."""

from pathlib import Path
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    '.gitignore', '.gitattributes', '.github/workflows/scaffold-ci.yml',
    '.github/dependabot.yml', 'backend/README.md', 'frontend/README.md',
    'docs/ARCHITECTURE.md', 'packaging/product.json',
]
IGNORE_RULES = [
    '/.claude/', '/CLAUDE.md', '/AGENTS.md', '/task-context/',
    '/generated-docs/', '/generated/', '/reference/',
]
BLOCKED_ROOTS = {
    '.claude', '.codex', '.agents', '.opencode',
    'CLAUDE.md', 'AGENTS.md', 'CLAUDE.local.md', 'opencode.jsonc',
    'task-context', 'reference', 'generated', 'generated-docs',
}


def validate():
    errors = [f'missing {p}' for p in REQUIRED if not (ROOT / p).is_file()]
    meta_file = ROOT / 'packaging/product.json'
    if meta_file.exists():
        try:
            meta = json.loads(meta_file.read_text(encoding='utf-8'))
        except (OSError, ValueError) as exc:
            errors.append(f'invalid product.json: {exc}')
        else:
            if meta.get('releaseEnabled'):
                errors.append('releaseEnabled must remain false until real app CI/release validation exists')
            if meta.get('version') != '0.0.1':
                print('INFO: version differs from initial scaffold; review tag/release policies.')
    ignore_file = ROOT / '.gitignore'
    if ignore_file.exists():
        lines = ignore_file.read_text(encoding='utf-8').splitlines()
        errors.extend(f'missing ignore rule: {r}' for r in IGNORE_RULES if r not in lines)

    # On GitHub Actions, check the ACTUAL tracked file list, not merely .gitignore.
    # git ls-files includes index entries and helps detect accidentally staged AI files.
    tracked = subprocess.run(
        ['git', 'ls-files', '-z'], cwd=ROOT, capture_output=True, check=False,
    )
    if tracked.returncode == 0:
        paths = [p.decode('utf-8', errors='replace').replace('\\', '/')
                 for p in tracked.stdout.split(b'\0') if p]
        for path in paths:
            if path.split('/')[0] in BLOCKED_ROOTS:
                errors.append(f'forbidden tracked AI/local file: {path}')
            if path == '.env' or path.startswith('.env.') and path != '.env.example':
                errors.append(f'forbidden tracked secret config: {path}')
    if errors:
        for error in errors:
            print('FAIL:', error)
        return 1
    print('Product scaffold checks passed (NOT a Django or Quasar build/test).')
    return 0


if __name__ == '__main__':
    sys.exit(validate())
