import { spawn } from 'node:child_process';

function run(cmd, args, env = {}) {
  const p = spawn(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } });
  p.on('exit', (code) => process.exit(code ?? 1));
  return p;
}

// Run Venice (:3000) and Paris (:3001) in parallel for local E2E.
// Expect envs to be exported by CI/local shell (SUPABASE_*, EDGE_CONFIG_ID, VERCEL_API_TOKEN, INTERNAL_ADMIN_KEY).
run('pnpm', ['-w', 'concurrently',
  '--names', 'VENICE,PARIS',
  '--prefix', '[{name}]',
  'pnpm --filter ./services/embed dev',
  'pnpm dev:api'
]);


