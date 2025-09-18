'use client';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';

export default function PriceDepth({ points }: { points: number[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = ref.current!; 
    const w = mount.clientWidth || 600, h = 220;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000); 
    camera.position.set(0, 0, 90);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); 
    renderer.setSize(w, h); 
    mount.appendChild(renderer.domElement);

    // Ligne prix en profondeur (extrusion légère)
    const max = Math.max(...points), min = Math.min(...points);
    const norm = (v: number) => ((v - min) / (max - min || 1)) * 40 - 20;
    const grp = new THREE.Group();
    for (let z = 0; z < 6; z++) {
      const geo = new THREE.BufferGeometry();
      const verts = new Float32Array(points.length * 3);
      for (let i = 0; i < points.length; i++) { 
        verts[i * 3] = (i / points.length) * 80 - 40; 
        verts[i * 3 + 1] = norm(points[i]); 
        verts[i * 3 + 2] = -z * 0.7; 
      }
      geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      const mat = new THREE.LineBasicMaterial({ 
        color: new THREE.Color().setHSL(.62, .7, .5 - z * 0.05), 
        transparent: true, 
        opacity: .9 - z * 0.12 
      });
      grp.add(new THREE.Line(geo, mat));
    }
    scene.add(grp);

    const light = new THREE.AmbientLight(0xffffff, .8); 
    scene.add(light);
    let raf = 0;
    const tick = () => { 
      grp.rotation.z += 0.0015; 
      raf = requestAnimationFrame(tick); 
      renderer.render(scene, camera); 
    };
    tick();

    const onResize = () => { 
      const W = mount.clientWidth || w; 
      renderer.setSize(W, h); 
      camera.aspect = W / h; 
      camera.updateProjectionMatrix(); 
    };
    window.addEventListener('resize', onResize);
    return () => { 
      cancelAnimationFrame(raf); 
      window.removeEventListener('resize', onResize); 
      mount.removeChild(renderer.domElement); 
      renderer.dispose(); 
    };
  }, [points]);
  return (
    <div className="ds-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div ref={ref} style={{ width: '100%', height: 220 }} />
    </div>
  );
}
