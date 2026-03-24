import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import gsap from 'gsap';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  X, 
  Volume2, 
  VolumeX, 
  Info,
  MousePointer2,
  Keyboard
} from 'lucide-react';

// --- Project Data ---
const PROJECTS = [
  {
    title: 'AI‑Vision Robotics System',
    description: 'End‑to‑end VLA pipeline with YOLOv8, CLIP, LangChain, Phi‑3, ROS2 Nav2, Gazebo.',
    tech: ['ROS2', 'YOLOv8', 'CLIP', 'LangChain', 'Phi-3', 'Gazebo'],
    repoUrl: 'https://github.com/Sunkeerth/Vision-Language-Action-Based-Robotic-Navigation-System',
    videoUrl: 'https://drive.google.com/file/d/13vN3dY9bAXRFbN5lKrTCaJZLXe9vyfb6/view?usp=drive_link',
    pos: { x: -15, z: -20 },
    color: 0x00ffff
  },
  {
    title: 'Telemedicine Kiosk',
    description: 'Voice‑assisted healthcare kiosk with QR scanning, symptom extraction, doctor assignment.',
    tech: ['Node.js', 'Express', 'MongoDB', 'Web Speech API'],
    repoUrl: 'https://github.com/Sunkeerth/AI-Assisted-Telemedicine-Kiosk-',
    videoUrl: '',
    pos: { x: -5, z: -25 },
    color: 0x00ffaa
  },
  {
    title: 'Agri‑Drone System',
    description: 'ESP32/ESP‑NOW based telemetry for agriculture drones, with GPS and failsafe.',
    tech: ['ESP32', 'ESP-NOW', 'UART', 'GPS', 'Arduino'],
    repoUrl: 'https://drive.google.com/drive/folders/1gpgImszF6rsuyoYargwEqgUpb2M51p9N',
    videoUrl: 'https://drive.google.com/file/d/13vN3dY9bAXRFbN5lKrTCaJZLXe9vyfb6/view?usp=drive_link',
    pos: { x: 5, z: -25 },
    color: 0x36bcf7
  },
  {
    title: 'Industrial Spray Sim',
    description: 'GPU‑based spray simulation with OpenUSD and NVIDIA Warp.',
    tech: ['OpenUSD', 'NVIDIA Warp', 'Python', 'CUDA'],
    repoUrl: 'https://github.com/Sunkeerth/Simulated-Paint-Spraying-on-a-Wall-Mesh',
    videoUrl: 'https://drive.google.com/file/d/1YuEfcAn7geeOS4lUxMUSKe_vZmqinJQd/view?usp=drive_link',
    pos: { x: 15, z: -20 },
    color: 0x0088ff
  },
  {
    title: 'Overtake Safety AI',
    description: 'Real‑time vehicle detection on ESP32‑CAM with TensorFlow Lite.',
    tech: ['ESP32-CAM', 'TensorFlow Lite', 'Embedded C', 'OpenCV'],
    repoUrl: 'https://www.linkedin.com/posts/sunkeerth-ab14b3337_roadsafety-embeddedai',
    videoUrl: 'https://drive.google.com/file/d/1Kz3dT7vVK9Jzer1csSB3vP8FhpN61bkW/view?usp=drive_link',
    pos: { x: -20, z: -5 },
    color: 0x00ffff
  },
  {
    title: 'RGAC Virtual Uni',
    description: 'Immersive VR‑based university with AI voice assistant.',
    tech: ['Unity3D', 'WebXR', 'C#', 'Blender'],
    repoUrl: 'https://github.com/Sunkeerth/RAGC-Virtual-university-',
    videoUrl: 'https://docs.google.com/presentation/d/1izYEt7LxrXkkg5zM5RCBBwlm3Jv_bgh3/edit?usp=drive_link',
    pos: { x: 20, z: -5 },
    color: 0x00ffaa
  },
  {
    title: 'Detection System',
    description: 'YOLOv8 detection on non‑COCO datasets with Weights & Biases tracking.',
    tech: ['YOLOv8', 'PyTorch', 'OpenCV', 'W&B'],
    repoUrl: 'https://github.com/Sunkeerth/Animal-and-Human-Detection-Model',
    videoUrl: 'https://drive.google.com/file/d/1zShsFxMASt87vY67p-0NcxFF-U5Be7Gp/view?usp=drive_link',
    pos: { x: 0, z: -35 },
    color: 0x36bcf7
  }
];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [voiceGuidanceActive, setVoiceGuidanceActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const controlsRef = useRef<PointerLockControls | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastFootstepTime = useRef<number>(0);

  // --- Sound Generation ---
  const playSound = (type: 'click' | 'footstep') => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(60, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  };

  const speakInstructions = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(
        "Welcome to Sunkeerth’s 3D portfolio. Use WASD keys to move, mouse to look around. Approach buildings to open doors, click to view project details. Enjoy the experience."
      );
      msg.rate = 0.9;
      msg.pitch = 1;
      window.speechSynthesis.speak(msg);
      setVoiceGuidanceActive(true);
    }
  };

  const enterExperience = () => {
    if (controlsRef.current) {
      controlsRef.current.lock();
      playSound('click');
      if (!voiceGuidanceActive) {
        speakInstructions();
      }
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isLocked && !selectedProject) {
        enterExperience();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isLocked, selectedProject, voiceGuidanceActive]);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.FogExp2(0x050505, 0.02);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    containerRef.current.appendChild(labelRenderer.domElement);

    // --- Controls ---
    const controls = new PointerLockControls(camera, document.body);
    controlsRef.current = controls;
    scene.add(controls.object);

    const onKeyDown = (event: KeyboardEvent) => {
      if (!controls.isLocked) return;
      switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // --- Ground ---
    const gridHelper = new THREE.GridHelper(200, 100, 0x36bcf7, 0x222222);
    scene.add(gridHelper);

    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    scene.add(ground);

    // --- Particles ---
    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0x36bcf7, size: 0.1, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // --- Buildings & Interactive Elements ---
    const buildings: THREE.Group[] = [];
    const doors: THREE.Mesh[] = [];
    const colliders: THREE.Box3[] = [];

    PROJECTS.forEach((project, index) => {
      const group = new THREE.Group();
      group.position.set(project.pos.x, 0, project.pos.z);

      // Main Structure
      const buildingGeo = new THREE.BoxGeometry(4, 8, 4);
      const buildingMat = new THREE.MeshStandardMaterial({ 
        color: 0x111111,
        emissive: project.color,
        emissiveIntensity: 0.1
      });
      const building = new THREE.Mesh(buildingGeo, buildingMat);
      building.position.y = 4;
      group.add(building);

      // Neon Edges
      const edges = new THREE.EdgesGeometry(buildingGeo);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: project.color }));
      line.position.y = 4;
      group.add(line);

      // Door
      const doorGeo = new THREE.PlaneGeometry(2, 3);
      const doorMat = new THREE.MeshStandardMaterial({ color: project.color, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, 1.5, 2.01);
      door.userData = { isOpen: false, originalX: 0 };
      group.add(door);
      doors.push(door);

      // Label
      const labelDiv = document.createElement('div');
      labelDiv.className = 'px-2 py-1 bg-black/80 border border-neon-cyan text-neon-cyan text-[10px] font-mono rounded';
      labelDiv.textContent = project.title;
      const label = new CSS2DObject(labelDiv);
      label.position.set(0, 9, 0);
      group.add(label);

      // Light
      const pLight = new THREE.PointLight(project.color, 1, 10);
      pLight.position.set(0, 2, 3);
      group.add(pLight);

      scene.add(group);
      buildings.push(group);

      // Collider
      const box = new THREE.Box3().setFromObject(building);
      colliders.push(box);
    });

    // --- Billboards (Info Panels) ---
    const createBillboard = (title: string, content: string[], x: number, z: number) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const frameGeo = new THREE.BoxGeometry(6, 4, 0.2);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.y = 3;
      group.add(frame);

      const div = document.createElement('div');
      div.className = 'p-4 bg-black/90 border-2 border-neon-cyan text-white w-64 rounded-lg';
      div.innerHTML = `
        <h3 class="text-neon-cyan font-bold border-b border-neon-cyan/30 mb-2">${title}</h3>
        <ul class="text-[10px] space-y-1">
          ${content.map(c => `<li>• ${c}</li>`).join('')}
        </ul>
      `;
      const label = new CSS2DObject(div);
      label.position.set(0, 3, 0.2);
      group.add(label);

      scene.add(group);
      colliders.push(new THREE.Box3().setFromObject(frame));
    };

    createBillboard('SKILLS', ['Python, JS, SQL', 'PyTorch, ROS2', 'LLMs, RAG, VLA'], -8, 5);
    createBillboard('EXPERIENCE', ['Amdox Intern', 'Ascender Intern', 'Robotics Lead'], 8, 5);

    // --- Raycaster for Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(0, 0); // Center of screen

    const onMouseClick = () => {
      if (!controls.isLocked) return;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      for (let i = 0; i < intersects.length; i++) {
        const obj = intersects[i].object;
        // Check if parent is a building group
        let parent = obj.parent;
        while (parent && !buildings.includes(parent as THREE.Group)) {
          parent = parent.parent;
        }
        
        if (parent) {
          const index = buildings.indexOf(parent as THREE.Group);
          setSelectedProject(PROJECTS[index]);
          playSound('click');
          controls.unlock();
          break;
        }
      }
    };

    window.addEventListener('click', onMouseClick);

    // --- Animation Loop ---
    let lastTime = performance.now();
    const animate = () => {
      requestAnimationFrame(animate);
      const time = performance.now();
      const delta = (time - lastTime) / 1000;

      if (controls.isLocked) {
        // Movement
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        // Footstep sound
        if (moveForward || moveBackward || moveLeft || moveRight) {
          const now = performance.now();
          if (now - lastFootstepTime.current > 350) {
            playSound('footstep');
            lastFootstepTime.current = now;
          }
        }

        const prevPos = camera.position.clone();
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        // Collision Detection
        const playerBox = new THREE.Box3().setFromCenterAndSize(
          camera.position,
          new THREE.Vector3(1, 2, 1)
        );

        for (const collider of colliders) {
          if (playerBox.intersectsBox(collider)) {
            camera.position.copy(prevPos);
            break;
          }
        }

        // Door Animations
        doors.forEach((door, idx) => {
          const dist = camera.position.distanceTo(buildings[idx].position);
          if (dist < 6 && !door.userData.isOpen) {
            gsap.to(door.position, { x: 2, duration: 0.5 });
            door.userData.isOpen = true;
          } else if (dist >= 6 && door.userData.isOpen) {
            gsap.to(door.position, { x: 0, duration: 0.5 });
            door.userData.isOpen = false;
          }
        });

        // Minimap Update
        if (minimapRef.current) {
          const ctx = minimapRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, 150, 150);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            ctx.fillRect(0, 0, 150, 150);
            
            // Buildings
            PROJECTS.forEach(p => {
              const mx = (p.pos.x + 50) * 1.5;
              const mz = (p.pos.z + 50) * 1.5;
              ctx.fillStyle = '#00ffff';
              ctx.fillRect(mx - 2, mz - 2, 4, 4);
            });

            // Player
            const px = (camera.position.x + 50) * 1.5;
            const pz = (camera.position.z + 50) * 1.5;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(px, pz, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      particles.rotation.y += 0.0005;
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
      lastTime = time;
    };

    animate();

    // --- Event Listeners ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    controls.addEventListener('lock', () => setIsLocked(true));
    controls.addEventListener('unlock', () => setIsLocked(false));

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('click', onMouseClick);
      containerRef.current?.removeChild(renderer.domElement);
      containerRef.current?.removeChild(labelRenderer.domElement);
    };
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(e => console.log("Audio blocked", e));
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">
      <div ref={containerRef} className="w-full h-full" />

      {/* Crosshair */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
        <div className="w-4 h-4 border border-neon-cyan/50 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-neon-cyan rounded-full" />
        </div>
      </div>

      {/* Minimap */}
      <div className="fixed top-6 right-6 z-40 glass neon-border p-1">
        <canvas ref={minimapRef} width={150} height={150} className="rounded" />
        <div className="absolute bottom-2 left-2 text-[8px] text-neon-cyan font-mono uppercase tracking-widest">Radar_System</div>
      </div>

      {/* UI Overlays */}
      {!isLocked && !selectedProject && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className="glass neon-border p-12 text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4 text-neon-cyan tracking-tighter">SUNKEERTH Y</h1>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              AI & Robotics Engineer Portfolio.<br/>
              Explore the 3D environment to view projects.
            </p>
            <button 
              onClick={enterExperience} 
              className="px-8 py-3 bg-neon-cyan text-black font-bold rounded-full hover:bg-white transition-all flex items-center gap-2 mx-auto"
            >
              <MousePointer2 size={18} /> CLICK TO ENTER
            </button>
            <div className="mt-8 grid grid-cols-2 gap-4 text-[10px] text-gray-500 font-mono uppercase">
              <div className="flex items-center gap-2 justify-center"><Keyboard size={14}/> WASD Move</div>
              <div className="flex items-center gap-2 justify-center"><MousePointer2 size={14}/> Mouse Look</div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Panel */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-4">
        <div className="glass px-4 py-2 text-[10px] font-mono text-gray-400 flex items-center gap-2">
          <Info size={14} className="text-neon-cyan" />
          APPROACH BUILDINGS TO OPEN DOORS • CLICK TO VIEW PROJECT
        </div>
        <button 
          onClick={() => { playSound('click'); speakInstructions(); }}
          className="glass px-4 py-2 text-[10px] font-mono text-neon-cyan flex items-center gap-2 hover:bg-neon-cyan/10 transition-colors pointer-events-auto"
        >
          <Volume2 size={14} /> REPLAY GUIDE
        </button>
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="glass neon-border w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => { setSelectedProject(null); playSound('click'); }}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h2 className="text-4xl font-bold text-neon-cyan tracking-tighter">{selectedProject.title}</h2>
                  <p className="text-gray-300 leading-relaxed">{selectedProject.description}</p>
                  
                  <div>
                    <h4 className="text-xs font-mono text-neon-cyan uppercase tracking-widest mb-3">Tech_Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tech.map((t: string) => (
                        <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <a 
                      href={selectedProject.repoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-all"
                    >
                      <Github size={18} /> Repository
                    </a>
                    {selectedProject.videoUrl && (
                      <a 
                        href={selectedProject.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 rounded-full text-sm transition-all"
                      >
                        <ExternalLink size={18} /> Watch Video
                      </a>
                    )}
                  </div>
                </div>

                <div className="aspect-video bg-black/50 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
                  {selectedProject.videoUrl ? (
                    <div className="text-center p-8">
                      <Volume2 className="text-neon-cyan mx-auto mb-4 opacity-50" size={48} />
                      <p className="text-xs text-gray-500 font-mono">VIDEO_STREAM_AVAILABLE</p>
                      <p className="text-[10px] text-gray-600 mt-2 italic">Click "Watch Video" to view on external player</p>
                    </div>
                  ) : (
                    <p className="text-gray-600 font-mono text-xs">NO_VIDEO_DATA</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Controls */}
      <button 
        onClick={() => { toggleAudio(); playSound('click'); }}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full glass neon-border flex items-center justify-center text-neon-cyan hover:scale-110 transition-all"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="animate-pulse" />}
      </button>
      <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop />

      {/* Social Links */}
      <div className="fixed top-6 left-6 z-40 flex flex-col gap-4">
        <a href="https://github.com/Sunkeerth" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass neon-border flex items-center justify-center text-gray-400 hover:text-neon-cyan transition-all">
          <Github size={18} />
        </a>
        <a href="https://www.linkedin.com/in/sunkeerth-y" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass neon-border flex items-center justify-center text-gray-400 hover:text-neon-cyan transition-all">
          <Linkedin size={18} />
        </a>
        <a href="mailto:sunkeerthaiml.bitm@gmail.com" className="w-10 h-10 rounded-full glass neon-border flex items-center justify-center text-gray-400 hover:text-neon-cyan transition-all">
          <Mail size={18} />
        </a>
      </div>
    </div>
  );
}
