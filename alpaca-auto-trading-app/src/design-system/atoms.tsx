'use client';
import { animated, useSpring } from '@react-spring/web';
import { ReactNode, useEffect, useRef } from 'react';
import { DS } from './tokens';

export function Card({ children, hover = true, id }: { children: ReactNode; hover?: boolean; id?: string }) {
  const [s, api] = useSpring(() => ({ y: 0, shadow: 0 }));
  return (
    <animated.div
      id={id}
      className="ds-card"
      style={{
        padding: DS.spacing(2),
        borderRadius: DS.radius,
        boxShadow: s.shadow.to((v) => `0 ${4 + v}px ${20 + v * 10}px rgba(0,0,0,${.06 + .06 * v})`),
        transform: s.y.to(v => `translateY(${v}px)`),
        willChange: 'transform, box-shadow'
      }}
      onMouseEnter={() => hover && api.start({ y: -2, shadow: 1 })}
      onMouseLeave={() => hover && api.start({ y: 0, shadow: 0 })}
    >
      {children}
    </animated.div>
  );
}

export function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const [s] = useSpring(() => ({ 
    from: { opacity: 0, y: 6 }, 
    to: { opacity: 1, y: 0 }, 
    config: { tension: 190, friction: 18 } 
  }), []);
  return (
    <animated.div style={{ opacity: s.opacity, transform: s.y.to(y => `translateY(${y}px)`) }}>
      <div style={{ fontSize: 12, color: 'var(--ds-muted)' }}>{label}</div>
      <div style={{ fontSize: 28, fontVariationSettings: `"wght" ${600}` }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: 'var(--ds-muted)' }}>{hint}</div>}
    </animated.div>
  );
}

export function MoodBar() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // WAAPI — animation douce de la teinte d'accent selon l'humeur (pilotée ailleurs)
    const node = el.current; 
    if (!node) return;
    const anim = node.animate(
      [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 
      { duration: 900, fill: 'forwards', easing: 'cubic-bezier(.2,.8,.2,1)' }
    );
    return () => anim.cancel();
  }, []);
  return (
    <div 
      ref={el} 
      style={{ 
        height: 4, 
        borderRadius: 999, 
        background: 'var(--ds-accent)', 
        transformOrigin: 'left' 
      }} 
    />
  );
}
