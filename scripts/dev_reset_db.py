"""Delete and recreate the LOCAL development PostgreSQL container volume (fictional data only)."""

import subprocess
import sys
from pathlib import Path

COMPOSE = ["docker", "compose", "-f", str(Path(__file__).resolve().parents[1] / "deployment" / "compose.dev.yml")]

print("Die lokale Entwicklungsdatenbank wird gelöscht und neu angelegt (nur Testdaten).")
if input('Zum Bestätigen "JA" eingeben: ').strip() != "JA":
    print("Abgebrochen, nichts geändert.")
    sys.exit(1)
subprocess.run([*COMPOSE, "down", "-v"], check=True)
subprocess.run([*COMPOSE, "up", "-d", "--wait"], check=True)
print("Neue leere Datenbank läuft. Jetzt die Aufgabe 'Demo-Daten anlegen' ausführen.")
