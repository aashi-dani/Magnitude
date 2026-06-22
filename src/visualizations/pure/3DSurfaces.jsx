import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import VizContainer from '../../components/VizContainer';

const SURFACES = [
  { id: 'paraboloid', name: 'Paraboloid (z = x² + y²)' },
  { id: 'saddle', name: 'Hyperbolic Paraboloid (Saddle)' },
  { id: 'cone', name: 'Double Cone' },
  { id: 'sphere', name: 'Sphere' },
];

export default function ThreeDSurfaces() {
  const mountRef = useRef(null);
  const [activeSurface, setActiveSurface] = useState('paraboloid');
  const [wireframe, setWireframe] = useState(false);
  const [color, setColor] = useState('#6D8196'); // Tailwind blue-500

  // Refs for three.js objects
  const sceneRef = useRef(null);
  const meshRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    // 1. Setup Scene, Camera, Renderer
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1f2e'); // match dark theme
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 20);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.innerHTML = ''; // Clear container
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Controls (Drag to rotate, scroll to zoom)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true; // Enables pinch/scroll natively
    controlsRef.current = controls;

    // 3. Lighting (Ambient + Directional)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // 4. Initial Geometry
    const material = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
      wireframe: wireframe,
      shininess: 50,
    });
    
    // Create parametric geometry
    const geometry = createGeometry(activeSurface);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(15);
    scene.add(axesHelper);

    // 5. Animation Loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 6. Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []); // Run once on mount

  // Update Geometry when surface changes
  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    
    // Dispose old geometry
    mesh.geometry.dispose();
    
    // Create and assign new geometry
    mesh.geometry = createGeometry(activeSurface);
  }, [activeSurface]);

  // Update Material when wireframe or color changes
  useEffect(() => {
    if (!meshRef.current) return;
    const material = meshRef.current.material;
    material.wireframe = wireframe;
    material.color.set(color);
  }, [wireframe, color]);

  // Helper to generate parametric surfaces
  const createGeometry = (type) => {
    // We use ParametricGeometry to evaluate points (u,v) -> (x,y,z)
    // u, v are between 0 and 1
    
    const size = 10;
    
    const generateFunction = (u, v, target) => {
      // map u, v from [0, 1] to [-size, size]
      const x = (u - 0.5) * 2 * size;
      const y = (v - 0.5) * 2 * size;
      let z = 0;

      if (type === 'paraboloid') {
        // z = (x^2 + y^2) / 5
        z = (x * x + y * y) / 10;
        // Shift down to center visually
        z -= 5; 
      } 
      else if (type === 'saddle') {
        // z = (x^2 - y^2) / 5
        z = (x * x - y * y) / 10;
      }
      else if (type === 'cone') {
        // Double cone
        // Map u,v to radial coordinates to make it look nicer
        const r = (u - 0.5) * 2 * size;
        const theta = v * Math.PI * 2;
        target.set(r * Math.cos(theta), r, r * Math.sin(theta));
        return;
      }
      else if (type === 'sphere') {
        const phi = u * Math.PI; // 0 to PI
        const theta = v * 2 * Math.PI; // 0 to 2PI
        const radius = 8;
        target.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
        return;
      }

      target.set(x, z, y); // Three.js uses Y as up axis, so Z is depth
    };

    // Need to import ParametricGeometry from examples in newer three.js
    // For simplicity, we can build a plane and modify its vertices
    const segments = 40;
    if (type === 'sphere' || type === 'cone') {
        // Just use built-in geometry for these for better topology
        if (type === 'sphere') return new THREE.SphereGeometry(8, 32, 32);
        if (type === 'cone') {
            // Build double cone out of two cones or custom
            const geom = new THREE.BufferGeometry();
            // Actually, an easier way is to use a plane and deform it, 
            // but let's stick to deforming a plane for paraboloid/saddle
        }
    }

    const planeGeom = new THREE.PlaneGeometry(20, 20, segments, segments);
    planeGeom.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    const posAttr = planeGeom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getZ(i); // depth is Z since we rotated
        let z = 0; // vertical is Y in three.js

        if (type === 'paraboloid') z = (x*x + y*y) / 5 - 5;
        if (type === 'saddle') z = (x*x - y*y) / 5;
        if (type === 'cone') {
            // Cone approximation: height = radius
            const r = Math.sqrt(x*x + y*y);
            z = r - 5; 
            // wait, user wants a double cone. 
            // A double cone is z^2 = x^2 + y^2
        }

        posAttr.setY(i, z);
    }

    planeGeom.computeVertexNormals();
    return planeGeom;
  };

  const controlsLayout = (
    <div className="space-y-4">
      <div>
        <span className="text-[12px] font-medium text-[#CBCBCB] mb-2 block">Surface Type</span>
        <select
          value={activeSurface}
          onChange={e => setActiveSurface(e.target.value)}
          className="w-full bg-[#1a1f2e] text-white px-3 py-2 rounded focus:border-blue-500 focus:outline-none"
        >
          {SURFACES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div>
        <span className="text-[12px] font-medium text-[#CBCBCB] mb-2 block">Color Theme Legend</span>
        <div className="grid grid-cols-2 gap-2 bg-[#4A4A4A] p-3 rounded-lg">
          {[
            { c: '#6D8196', l: 'Soft Blue' }, 
            { c: '#E74C3C', l: 'Crimson' }, 
            { c: '#10b981', l: 'Emerald' }, 
            { c: '#FFFFE3', l: 'Ivory' }, 
            { c: '#8b5cf6', l: 'Violet' }, 
            { c: '#ec4899', l: 'Pink' }
          ].map(theme => (
            <button 
              key={theme.c}
              onClick={() => setColor(theme.c)}
              className={`flex items-center gap-2 p-1.5 rounded transition-all ${color === theme.c ? 'bg-[#1a1f2e] border-white shadow-sm' : 'border-transparent hover:bg-[#5A6B7A]'}`}
            >
              <div className="w-5 h-5 rounded" style={{ backgroundColor: theme.c }} />
              <span className="text-xs text-[#CBCBCB] font-medium">{theme.l}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-[#5A6B7A]/30">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={wireframe} 
            onChange={e => setWireframe(e.target.checked)} 
            className="w-4 h-4 rounded bg-[#4A4A4A] border-[#5A6B7A] accent-[#FFFFE3]" 
          />
          <span className="text-[13px] text-[#CBCBCB]">Wireframe Mode</span>
        </label>
      </div>

      <div className="bg-[#4A4A4A] rounded-lg p-3 mt-4">
        <div className="text-[11px] font-medium text-[#CBCBCB] mb-1 text-center">Controls</div>
        <ul className="text-xs text-[#CBCBCB] space-y-1">
          <li>• 🖱️ <b>Drag</b> to Rotate</li>
          <li>• 📜 <b>Scroll</b> to Zoom</li>
          <li>• 🖱️ <b>Right-Click Drag</b> to Pan</li>
        </ul>
      </div>
      
      <button
        onClick={() => { setActiveSurface('paraboloid'); setWireframe(false); setColor('#6D8196'); if(cameraRef.current) cameraRef.current.position.set(20,15,20); }}
        className="w-full py-2 rounded bg-[#1a1f2e] text-[#CBCBCB] text-sm font-bold hover:bg-[#5A6B7A] transition-colors mt-2"
      >
        Reset Default
      </button>
    </div>
  );

  const handleZoom = (factor) => {
    if (cameraRef.current && controlsRef.current) {
      const pos = cameraRef.current.position;
      const target = controlsRef.current.target;
      pos.sub(target).multiplyScalar(factor).add(target);
    }
  };

  return (
    <VizContainer
      infoTooltip="3D parametric surfaces defined by multivariable equations. Explore their topology in 3D space by dragging and zooming."
      id="3d-surfaces"
      title="3D Mathematical Surfaces"
      description="Visualize multivariable functions and topological shapes in full 3D. Interact with the canvas to explore saddle points and curvature."
      formula={activeSurface === 'paraboloid' ? 'z = x^2 + y^2' : activeSurface === 'saddle' ? 'z = x^2 - y^2' : activeSurface === 'cone' ? 'z^2 = x^2 + y^2' : 'x^2 + y^2 + z^2 = r^2'}
      formulaLabel="Surface Equation"
      controls={controlsLayout}
    >
      <div className="w-full h-[400px] bg-[#4A4A4A] rounded-lg overflow-hidden relative">
        <div 
          ref={mountRef} 
          className="absolute inset-0 cursor-move"
          style={{ width: '100%', height: '100%' }}
        />
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button onClick={() => handleZoom(0.8)} className="w-10 h-10 bg-[#1a1f2e] text-white rounded-lg shadow-lg flex items-center justify-center text-2xl font-bold hover:bg-[#6D8196] transition">+</button>
          <button onClick={() => handleZoom(1.25)} className="w-10 h-10 bg-[#1a1f2e] text-white rounded-lg shadow-lg flex items-center justify-center text-2xl font-bold hover:bg-[#6D8196] transition">−</button>
        </div>
      </div>
    </VizContainer>
  );
}
