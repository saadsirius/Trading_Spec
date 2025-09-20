/**
 * File: public/worklets/gradient.js
 * Description: CSS Houdini paint worklet for gradient effects.
 */
class GradientWorklet {
  static get inputProperties() {
    return ['--gradient-color', '--gradient-angle'];
  }

  paint(ctx, size, properties) {
    const color = properties.get('--gradient-color') || 'rgba(34, 211, 238, 0.1)';
    const angle = properties.get('--gradient-angle') || '45deg';
    
    // Parse angle
    const angleValue = parseFloat(angle);
    const angleRad = (angleValue * Math.PI) / 180;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(
      Math.cos(angleRad) * size.width,
      Math.sin(angleRad) * size.height,
      Math.cos(angleRad + Math.PI) * size.width,
      Math.sin(angleRad + Math.PI) * size.height
    );
    
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size.width, size.height);
  }
}

registerPaint('gradient', GradientWorklet);