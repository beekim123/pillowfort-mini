let ceiling = 1e300;
let units = [1,1e4,1e8,1e12,1e16,1e20,1e24,1e28,1e32,1e36,1e40,1e44,1e48,1e52,1e56,1e60,1e64,1e68];
let names = ['', '万','亿','兆','京','垓','秭','穰','沟','涧','正','载','极','恒河沙','阿僧祇','那由他','不可思议','无量大数'];
export function configureBig(b: {max:number; unit:number[]; unitName:string[]}): void { ceiling=b.max; units=[...b.unit]; names=[...b.unitName]; }
export function clamp(n: number, strict=false): number { if (!Number.isFinite(n)) { if(strict) throw new RangeError('Invalid big number'); return ceiling; } return Math.min(ceiling,Math.max(0,n)); }
export function mul(...parts: number[]): number { return parts.reduce((a,b)=>clamp(a*b),1); }
export function add(a:number,b:number):number {return clamp(a+b);}
export function unitIndex(n:number):number { n=clamp(n); let i=0; while(i+1<units.length&&n>=units[i+1]) i++; return i; }
export function fmt(n:number):string {
  const sign=n<0?'-':''; n=clamp(Math.abs(n));
  if(n<10000) return sign+Math.floor(n).toLocaleString('en-US');
  const i=unitIndex(n);
  // Work from the number's shortest decimal representation. Dividing first and
  // multiplying to truncate can turn exact 10050 into 1.004999...; adding an
  // epsilon would instead round legitimate values just below a boundary up.
  const [coefficient,exponentText]=n.toExponential().split('e');
  const exponent=Number(exponentText),unitExponent=Number(units[i].toExponential().split('e')[1]);
  const four=coefficient.replace('.','').slice(0,4).padEnd(4,'0');
  const format=(point:number)=>{const whole=four.slice(0,point),tail=four.slice(point).replace(/0+$/,'');return whole+(tail?'.'+tail:'');};
  if(exponent-unitExponent>=4)return sign+format(1)+'e'+exponent;
  return sign+format(exponent-unitExponent+1)+names[i];
}
export function unitColor(n:number):string {return ['#eef3ef','#74dca2','#76bcf6','#bb9aff','#ffc181','#ff8e94'][Math.min(5,unitIndex(n))];}
