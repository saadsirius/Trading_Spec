/**
 * File: src/webc/ai-sparkline.ts
 * Description: Web Component for AI-powered sparkline visualization.
 */
'use client';

class AISparkline extends HTMLElement {
  private canvas: HTMLCanvasElement | null = null;
  private data: number[] = [];
  private animationId: number | null = null;

  static get observedAttributes() {
    return ['data'];
  }

  connectedCallback() {
    this.createCanvas();
    this.render();
  }

  disconnectedCallback() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'data' && oldValue !== newValue) {
      this.parseData(newValue);
      this.render();
    }
  }

  private createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 140;
    this.canvas.height = 32;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.appendChild(this.canvas);
  }

  private parseData(dataString: string) {
    if (!dataString) {
      this.data = [];
      return;
    }
    
    try {
      this.data = dataString.split(',').map(Number).filter(n => !isNaN(n));
    } catch {
      this.data = [];
    }
  }

  private render() {
    if (!this.canvas || this.data.length === 0) return;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = this.canvas;
    const padding = 2;
    const drawWidth = width - padding * 2;
    const drawHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find min/max for scaling
    const min = Math.min(...this.data);
    const max = Math.max(...this.data);
    const range = max - min || 1;

    // Draw sparkline
    ctx.beginPath();
    ctx.strokeStyle = '#22D3EE';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    this.data.forEach((value, index) => {
      const x = padding + (index / (this.data.length - 1)) * drawWidth;
      const y = padding + drawHeight - ((value - min) / range) * drawHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Add subtle glow effect
    ctx.shadowColor = '#22D3EE';
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

// Register the custom element
if (typeof window !== 'undefined' && !customElements.get('ai-sparkline')) {
  customElements.define('ai-sparkline', AISparkline);
}

export default AISparkline;