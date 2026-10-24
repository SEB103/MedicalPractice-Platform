// Local development helper used by .vscode/launch.json: node scripts/dev.mjs <setup|seed|reset>.
// Development only: works with the Docker PostgreSQL from deployment/compose.dev.yml and fictional data.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const root = resolve(import.meta.dirname, "..");
const backend = join(root, "backend");
const windows = process.platform === "win32";
const venvPython = join(
  backend,
  ".venv",
  windows ? "Scripts" : "bin",
  windows ? "python.exe" : "python",
);
const compose = ["compose", "-f", join(root, "deployment", "compose.dev.yml")];
const devEnv = {
  ...process.env,
  DJANGO_DEBUG: "1",
  POSTGRES_PASSWORD: "local-dev-only",
};

function run(command, args, options = {}) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  // Windows can only start .cmd files (npm.cmd) through a shell; everything else runs directly.
  const shell = windows && command.endsWith(".cmd");
  // Arguments here are fixed literals, so joining them for the shell is safe.
  const result = shell
    ? spawnSync([command, ...args].join(" "), {
        stdio: "inherit",
        cwd: root,
        shell,
        ...options,
      })
    : spawnSync(command, args, { stdio: "inherit", cwd: root, ...options });
  if (result.status !== 0) {
    console.error(`\nFehlgeschlagen: ${command} ${args.join(" ")}`);
    if (command === "docker") console.error("Läuft Docker Desktop?");
    process.exit(result.status ?? 1);
  }
}

function systemPython() {
  for (const candidate of windows ? ["python", "py"] : ["python3", "python"]) {
    if (spawnSync(candidate, ["--version"]).status === 0) return candidate;
  }
  console.error("Python 3.12+ wurde nicht gefunden.");
  process.exit(1);
}

const manage = (...args) =>
  run(venvPython, ["manage.py", ...args], { cwd: backend, env: devEnv });

const commands = {
  setup() {
    if (!existsSync(venvPython))
      run(systemPython(), ["-m", "venv", join(backend, ".venv")]);
    run(venvPython, [
      "-m",
      "pip",
      "install",
      "-r",
      join(backend, "requirements-dev.txt"),
    ]);
    run(windows ? "npm.cmd" : "npm", ["ci"]);
    console.log(
      '\nEinrichtung abgeschlossen. Weiter mit "⚙ Demo-Daten anlegen".',
    );
  },
  seed() {
    run("docker", [...compose, "up", "-d", "--wait"]);
    manage("migrate");
    manage("seed_demo_practice");
    manage("seed_demo_accounts");
    console.log(
      '\nDemo-Daten bereit. Logins: backend/.env.demo-login. Jetzt "▶ Praxis starten (alles)".',
    );
  },
  async reset() {
    console.log(
      "Die LOKALE Entwicklungsdatenbank wird gelöscht und neu angelegt (nur Testdaten).",
    );
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const answer = await rl.question('Zum Bestätigen "JA" eingeben: ');
    rl.close();
    if (answer.trim() !== "JA") {
      console.log("Abgebrochen, nichts geändert.");
      return;
    }
    run("docker", [...compose, "down", "-v"]);
    commands.seed();
  },
};

const name = process.argv[2];
if (!commands[name]) {
  console.error("Verwendung: node scripts/dev.mjs <setup|seed|reset>");
  process.exit(1);
}
await commands[name]();
