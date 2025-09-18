const tpl = document.createElement('template');
tpl.innerHTML = `<style>
:host{ display:inline-block; }
.c{ width:120px; height:28px; }
svg{ width:100%; height:100%; overflow:visible; }
path{ fill:none; stroke: var(--ds-accent, #22d3ee); stroke-width:2; }
</style><div class="c"><svg viewBox="0 0 120 28"><path/></svg></div>`;

export class AISparkline extends HTMLElement {
  shadow: ShadowRoot; 
  path: SVGPathElement;
  
  constructor() { 
    super(); 
    this.shadow = this.attachShadow({ mode: 'open' }); 
    this.shadow.appendChild(tpl.content.cloneNode(true)); 
    this.path = this.shadow.querySelector('path') as SVGPathElement; 
  }
  
  static get observedAttributes() { return ['data']; }
  
  attributeChangedCallback() { this.render(); }
  
  connectedCallback() { this.render(); }
  
  render() { 
    try {
      const data = (this.getAttribute('data') || '').split(',').map(x => Number(x)).filter(x => Number.isFinite(x));
      if (!data.length) return;
      const max = Math.max(...data), min = Math.min(...data);
      const pts = data.map((v, i) => [
        (i / (data.length - 1)) * 120, 
        28 - ((v - min) / Math.max(1e-9, (max - min))) * 28
      ]);
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
      this.path.setAttribute('d', d);
    } catch {} 
  }
}

if (!customElements.get('ai-sparkline')) {
  customElements.define('ai-sparkline', AISparkline);
}
