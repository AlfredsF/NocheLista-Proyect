const { spawn } = require('child_process');
const path = require('path');

const ROOT = __dirname;
const BACKEND_DIR = path.join(ROOT, 'NocheLista', 'backend');
const PYTHON = path.join(ROOT, 'NocheLista', '.venv', 'Scripts', 'python.exe');
const FRONTEND_DIR = path.join(ROOT, 'frontend-react');

function prefix(stream, label, write) {
  stream.on('data', (data) => {
    for (const line of data.toString().split(/\r?\n/)) {
      if (line) write(`[${label}] ${line}\n`);
    }
  });
}

console.log('Starting NocheLista dev servers...');
console.log(`  Backend:  http://localhost:8000`);
console.log(`  Frontend: http://localhost:5173\n`);

const backend = spawn(PYTHON, ['manage.py', 'runserver', '--noreload'], {
  cwd: BACKEND_DIR,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: false,
});
prefix(backend.stdout, 'backend', process.stdout.write.bind(process.stdout));
prefix(backend.stderr, 'backend', process.stderr.write.bind(process.stderr));

const frontend = spawn('cmd.exe', ['/c', 'npm run dev'], {
  cwd: FRONTEND_DIR,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: false,
});
prefix(frontend.stdout, 'frontend', process.stdout.write.bind(process.stdout));
prefix(frontend.stderr, 'frontend', process.stderr.write.bind(process.stderr));

let closing = false;
function shutdown(signal) {
  if (closing) return;
  closing = true;
  console.log(`\n${signal} received — shutting down...`);
  backend.kill();
  frontend.kill();
  setTimeout(() => process.exit(0), 2000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

backend.on('close', (code) => {
  console.log(`[backend] exited with code ${code}`);
  if (!closing) shutdown('backend exit');
});
frontend.on('close', (code) => {
  console.log(`[frontend] exited with code ${code}`);
  if (!closing) shutdown('frontend exit');
});
