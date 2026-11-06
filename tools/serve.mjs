import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2] ?? 'preview');
const port=Number(process.argv[3] ?? '7456');
if (!fs.existsSync(path.join(root,'index.html'))) { console.error(`没有 index.html：${root}。先执行对应构建。`); process.exit(1); }
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.css':'text/css','.wasm':'application/wasm','.ttf':'font/ttf','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  let uri; try { uri=decodeURIComponent(new URL(req.url??'/', 'http://localhost').pathname); } catch {res.writeHead(400);res.end('Bad path');return;}
  const file=path.resolve(root,'.'+uri+(uri.endsWith('/')?'index.html':''));
  if (!(file===root||file.startsWith(root+path.sep))) {res.writeHead(403);res.end('Forbidden');return;}
  if (!fs.existsSync(file)||!fs.statSync(file).isFile()) {res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
});
server.on('error',e=>{console.error(`端口 ${port} 不可用，不会自动更换存档来源：${e.message}`);process.exit(1);});
server.listen(port,'127.0.0.1',()=>console.log(`http://127.0.0.1:${port} · 仅本机 · Ctrl+C 停止`));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
