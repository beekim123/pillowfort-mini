import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pillowfort-package-test-'));
try {
 fs.mkdirSync(path.join(dir,'tools'),{recursive:true});
 for(const f of ['package.mjs','check-package.mjs','release.json'])fs.copyFileSync(path.join('tools',f),path.join(dir,'tools',f));
 const source=path.join(dir,'build/web-mobile');fs.mkdirSync(source,{recursive:true});
 fs.writeFileSync(path.join(source,'index.html'),'<!doctype html><title>Synthetic packaging fixture, NOT a game build</title>');
 fs.writeFileSync(path.join(source,'app.js'),'/* synthetic non-runtime fixture */');
 fs.writeFileSync(path.join(source,'secret.meta'),'must be excluded');fs.writeFileSync(path.join(source,'project.private.config.json'),'must be excluded');
 function run(file,...args){const r=spawnSync(process.execPath,[`tools/${file}`,...args],{cwd:dir,encoding:'utf8'});if(r.status!==0)throw new Error(r.stderr||r.stdout);return r.stdout;}
 run('package.mjs','h5');run('check-package.mjs','h5');
 const cfg=JSON.parse(fs.readFileSync('tools/release.json','utf8'));const manifest=JSON.parse(fs.readFileSync(path.join(dir,cfg.h5Output,'manifest.json'),'utf8'));
 if(manifest.files.length!==2)throw new Error('Private-file filtering failed');
 const archive=path.join(dir,cfg.h5Output,`${cfg.title}-${cfg.phase}-H5-TapTap.zip`);fs.appendFileSync(archive,'tamper');
 const bad=spawnSync(process.execPath,['tools/check-package.mjs','h5'],{cwd:dir,encoding:'utf8'});if(bad.status===0)throw new Error('Tampered package was incorrectly accepted');
 console.log('PASS: synthetic fixture packaging, private-file exclusion, every-file SHA256 verification, tamper rejection. Temporary fixture removed. This is not a Cocos build.');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
