// RegisterPaint('ripple-bg') — dégradé pulsé par temps
class RippleBg {
  static get inputProperties() { return []; }
  
  paint(ctx, geom) { 
    const t = Date.now() / 1000; 
    const r = Math.min(geom.width, geom.height) / 2;
    
    for (let i = 0; i < 6; i++) { 
      const rr = r * (i / 6); 
      const a = .08 + .06 * Math.sin(t + i);
      ctx.beginPath(); 
      ctx.arc(geom.width / 2, geom.height / 2, rr, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(34,211,238,${a})`; 
      ctx.lineWidth = 2; 
      ctx.stroke();
    }
  }
}

registerPaint('ripple-bg', RippleBg);
