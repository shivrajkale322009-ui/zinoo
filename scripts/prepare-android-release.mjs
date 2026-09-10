import { spawnSync } from 'node:child_process';
import process from 'node:process';

const npmCli = process.env.npm_execpath;

const steps = [
  ['Install locked dependencies and apply patches', ['ci', '--legacy-peer-deps']],
  ['Build current web application', ['run', 'build']],
  ['Synchronize web and native Android projects', ['exec', 'cap', 'sync', 'android']],
  ['Verify copied Android web assets', ['run', 'android:release:verify']]
];

const fail = (message) => {
  console.error(`\nANDROID RELEASE PREPARATION FAILED\n${message}`);
  process.exit(1);
};

for (const [label, args] of steps) {
  console.log(`\n[android release] ${label}`);
  if (!npmCli) fail(`${label}: npm did not provide npm_execpath.`);
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    shell: false
  });

  if (result.error) fail(`${label}: ${result.error.message}`);
  if (result.status !== 0) fail(`${label} exited with code ${result.status ?? 'unknown'}.`);
}

console.log('\nANDROID RELEASE PREPARATION SUCCESSFUL');
