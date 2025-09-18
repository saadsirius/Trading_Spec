export const clamp = (x:number,min:number,max:number)=> Math.min(max, Math.max(min,x));
export const pct = (a:number,b:number)=> b===0?0:((a-b)/b)*100;
