import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

// Reproducible targeted checks against the same compiled shared code as the preview.
// These checks do not launch a browser or claim Cocos/device validation.
const built = spawnSync(process.execPath, ['tools/build-preview.mjs'], { stdio: 'inherit' });
if (built.status !== 0) process.exit(built.status ?? 1);
const output = 'docs/verification/p1-walk';
fs.mkdirSync(output, { recursive: true });
const groups = [];
for (const name of ['data', 'battle', 'edge-cases', 'ui', 'relocation']) {
  const run = spawnSync(process.execPath, [`tools/qa/walk/check-${name}.mjs`], { encoding: 'utf8' });
  if (run.error) throw run.error;
  if (run.stderr) process.stderr.write(run.stderr);
  let report;
  try { report = JSON.parse(run.stdout); }
  catch { console.error(run.stdout); throw new Error(`Invalid review output: ${name}`); }
  fs.writeFileSync(`${output}/review-${name}.json`, JSON.stringify(report, null, 2) + '\n');
  groups.push({ name, passed: report.passed, total: report.total });
  if (run.status !== 0 || report.passed !== report.total) {
    console.error(`FAIL: ${name}; see ${output}/review-${name}.json`);
    process.exit(1);
  }
}
const report = {
  kind: 'Targeted shared-code checks; not browser/Cocos/device runtime',
  passed: groups.reduce((sum, group) => sum + group.passed, 0),
  total: groups.reduce((sum, group) => sum + group.total, 0),
  groups,
};
fs.writeFileSync(`${output}/review-summary.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
