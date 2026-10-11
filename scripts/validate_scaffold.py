#!/usr/bin/env python3
"""Minimal product scaffold validator, no external dependencies."""
from pathlib import Path
import json
import sys
root=Path(__file__).resolve().parents[1]
paths=['.gitignore','.github/workflows/scaffold-ci.yml','backend/README.md','frontend/README.md','docs/ARCHITECTURE.md','packaging/product.json']
errors=[p for p in paths if not (root/p).is_file()]
meta=json.loads((root/'packaging/product.json').read_text(encoding='utf-8'))
if meta.get('version')!='0.0.1':
    print('INFO: metadata version differs from initial scaffold; ensure changelog and tag strategy are updated.')
if meta.get('releaseEnabled'):
    errors.append('releaseEnabled true although scaffold is not deployable')
ignore=(root/'.gitignore').read_text(encoding='utf-8')
for rule in ['/.claude/','/CLAUDE.md','/task-context/','/generated-docs/']:
    if rule not in ignore.splitlines():errors.append('missing ignore rule '+rule)
if errors:
    print('FAIL:',', '.join(errors));sys.exit(1)
print('Product scaffold structure OK; no Django/Quasar implementation checked.')
