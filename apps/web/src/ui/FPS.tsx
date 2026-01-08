import { useEffect, useState } from 'react';

export function useFPS(): number {
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let last = performance.now();
    let acc = 0;
    let frames = 0;
    let id: number;

    const loop = () => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      acc += dt;
      frames++;

      if (acc >= 1000) {
        setFps(Math.round((frames * 1000) / acc));
        acc = 0;
        frames = 0;
      }

      id = requestAnimationFrame(loop);
    };

    id = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(id);
    };
  }, []);

  return fps;
}
