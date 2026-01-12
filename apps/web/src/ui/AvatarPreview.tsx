import { loadRpm } from '@metaverse/avatars';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  AnimationMixer,
  AnimationAction,
  LoopRepeat,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface AvatarPreviewProps {
  avatarUrl?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AvatarPreview({
  avatarUrl,
  width = 200,
  height = 200,
  className = '',
  style,
}: AvatarPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const avatarRef = useRef<THREE.Object3D | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const idleActionRef = useRef<AnimationAction | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 1.6, 2.5);
    camera.lookAt(0, 1, 0);

    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Lights
    const ambientLight = new AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Controls for rotation
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = (2 * Math.PI) / 3;
    controls.target.set(0, 1, 0);
    controls.update();

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();

      // Update animation mixer
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (idleActionRef.current) {
        idleActionRef.current.stop();
        idleActionRef.current = null;
      }
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [width, height]);

  // Load avatar
  useEffect(() => {
    if (!avatarUrl || !sceneRef.current) {
      // Clear existing avatar
      if (avatarRef.current && sceneRef.current) {
        sceneRef.current.remove(avatarRef.current);
        avatarRef.current = null;
      }
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Clear existing avatar
    if (avatarRef.current && sceneRef.current) {
      sceneRef.current.remove(avatarRef.current);
      avatarRef.current = null;
    }

    loadRpm(avatarUrl)
      .then(({ object: avatar, animations }) => {
        if (!sceneRef.current) return;

        // Center avatar
        const box = new THREE.Box3().setFromObject(avatar);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.8 / maxDim; // Scale to fit in ~1.8 units height

        avatar.scale.set(scale, scale, scale);
        avatar.position.set(-center.x * scale, -center.y * scale + 1, -center.z * scale);

        // Enable shadows
        avatar.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        sceneRef.current.add(avatar);
        avatarRef.current = avatar;

        // Setup animations if available
        if (animations && animations.length > 0) {
          mixerRef.current = new AnimationMixer(avatar);

          // Try to find idle animation
          let idleClip = animations.find(
            (clip) =>
              clip.name.toLowerCase().includes('idle') ||
              clip.name.toLowerCase().includes('tpose') ||
              clip.name.toLowerCase() === 'idle'
          );

          // Fallback to first animation if no idle found
          if (!idleClip && animations.length > 0) {
            idleClip = animations[0];
          }

          if (idleClip) {
            const action = mixerRef.current.clipAction(idleClip);
            action.setLoop(LoopRepeat, Infinity);
            action.play();
            idleActionRef.current = action;
            console.log(`[AvatarPreview] Playing idle animation: ${idleClip.name}`);
          }
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load avatar preview:', err);
        setError('Avatar konnte nicht geladen werden');
        setLoading(false);
      });
  }, [avatarUrl]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--color-background-secondary)',
        border: '1px solid var(--glass-border)',
        ...style,
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            color: 'var(--color-label)',
            fontSize: '14px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '8px' }}>⏳</div>
            <div className="text-footnote">Lädt...</div>
          </div>
        </div>
      )}
      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'var(--color-label)',
            fontSize: '12px',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ marginBottom: '8px', fontSize: '24px' }}>⚠️</div>
            <div className="text-footnote">{error}</div>
          </div>
        </div>
      )}
      {!loading && !error && !avatarUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-label-secondary)',
            fontSize: '48px',
          }}
        >
          👤
        </div>
      )}
      {!loading && !error && avatarUrl && (
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '11px',
            color: 'var(--color-label-secondary)',
            opacity: 0.7,
            pointerEvents: 'none',
          }}
          className="text-footnote"
        >
          Ziehen zum Rotieren
        </div>
      )}
    </div>
  );
}
