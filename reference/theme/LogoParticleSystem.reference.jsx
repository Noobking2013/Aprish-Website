import React, { useEffect, useRef } from "react";

/**
 * LogoParticleSystem Component
 * Scans an image (or falls back to generated text) and converts pixels into an interactive physics matrix.
 * Includes an automated fallback generator to guarantee the canvas is never blank.
 */
export default function LogoParticleSystem({
  imageSrc = "/logo.png", // Path to your transparent PNG in public/
  step = 3,               // Pixel scan step (1 = ultra dense, 3 = balanced, 5 = sparse)
  dotSize = 0.8,          // Radius of each dot in pixels
  ease = 0.05,            // Assembly speed (0.01 = floaty, 0.1 = snappy)
  mouseRadius = 100,      // Mouse forcefield radius
  forceMultiplier = 6,    // Repulsion strength
  overrideColor = null,   // Hex or RGB color to force all dots to one color
  className = "",
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, radius: mouseRadius });
  const animationFrameRef = useRef(null);

  useEffect(() => {
    mouseRef.current.radius = mouseRadius;
  }, [mouseRadius]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let isCancelled = false;

    // Ensure canvas dimensions match parent container or fall back to window size
    const updateDimensions = () => {
      const parentWidth = canvas.parentElement?.clientWidth;
      const parentHeight = canvas.parentElement?.clientHeight;
      canvas.width = parentWidth > 0 ? parentWidth : window.innerWidth;
      canvas.height = parentHeight > 0 ? parentHeight : window.innerHeight;
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // 1. Particle Physics Class
    class Particle {
      constructor(targetX, targetY, color) {
        // Spawn at a random screen coordinate
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.originX = targetX;
        this.originY = targetY;
        this.size = dotSize;
        this.color = overrideColor || color;
        this.ease = ease;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      update() {
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Repulsion physics inside cursor radius
        if (distance < mouseRef.current.radius) {
          const angle = Math.atan2(dy, dx);
          const force = (mouseRef.current.radius - distance) / mouseRef.current.radius;
          this.x -= Math.cos(angle) * force * forceMultiplier;
          this.y -= Math.sin(angle) * force * forceMultiplier;
        } else {
          // Linear interpolation easing back to target coordinates
          this.x += (this.originX - this.x) * this.ease;
          this.y += (this.originY - this.y) * this.ease;
        }
      }
    }

    // 2. Pixel Scanning Helper
    const scanAndSpawnParticles = (imgOrCanvas, width, height) => {
      if (isCancelled) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const startX = (canvas.width - width) / 2;
      const startY = (canvas.height - height) / 2;
      
      ctx.drawImage(imgOrCanvas, startX, startY, width, height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newParticles = [];

      for (let y = 0; y < imgData.height; y += step) {
        for (let x = 0; x < imgData.width; x += step) {
          const index = (y * 4 * imgData.width) + (x * 4);
          const alpha = imgData.data[index + 3];

          // Catch any non-transparent pixel
          if (alpha > 10) {
            let r = imgData.data[index];
            let g = imgData.data[index + 1];
            let b = imgData.data[index + 2];

            // Auto-boost dark pixels if overrideColor isn't active
            if (!overrideColor && r < 40 && g < 40 && b < 40) {
              r = 251; g = 191; b = 36; // Amber glow
            }

            const color = `rgb(${r}, ${g}, ${b})`;
            newParticles.push(new Particle(x, y, color));
          }
        }
      }

      particlesRef.current = newParticles;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      console.log(`[LogoEngine] Successfully spawned ${newParticles.length} particles.`);
      animate();
    };

    // 3. Fallback Text Generator (Guarantees particles if image loading fails)
    const useFallbackText = () => {
      if (isCancelled) return;
      console.warn(`[LogoEngine] Could not find or load "${imageSrc}". Using automatic text fallback!`);
      const offCanvas = document.createElement("canvas");
      offCanvas.width = 600;
      offCanvas.height = 200;
      const offCtx = offCanvas.getContext("2d");
      offCtx.fillStyle = "#FBBF24";
      offCtx.font = "bold 120px sans-serif";
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillText("aprish*", offCanvas.width / 2, offCanvas.height / 2);
      
      scanAndSpawnParticles(offCanvas, 600, 200);
    };

    // 4. Load Image with a Failsafe Timer
    const logoImage = new Image();
    logoImage.src = imageSrc;

    // If image doesn't load within 1.2 seconds, force the fallback text
    const fallbackTimer = setTimeout(() => {
      if (particlesRef.current.length === 0) {
        useFallbackText();
      }
    }, 1200);

    logoImage.onload = () => {
      clearTimeout(fallbackTimer);
      if (isCancelled) return;
      const maxImgWidth = Math.min(canvas.width * 0.65, 650);
      const imgWidth = maxImgWidth;
      const imgHeight = (logoImage.height / logoImage.width) * imgWidth;
      scanAndSpawnParticles(logoImage, imgWidth, imgHeight);
    };

    logoImage.onerror = () => {
      clearTimeout(fallbackTimer);
      useFallbackText();
    };

    // 5. Continuous Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        particles[i].draw();
        particles[i].update();
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    return () => {
      isCancelled = true;
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(fallbackTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [imageSrc, step, dotSize, ease, forceMultiplier, overrideColor]);

  const handleMouseMove = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = event.clientX - rect.left;
    mouseRef.current.y = event.clientY - rect.top;
  };

  const handleMouseLeave = () => {
    mouseRef.current.x = -9999;
    mouseRef.current.y = -9999;
  };

  return (
    <div className={`w-full h-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="block w-full h-full cursor-pointer"
      />
    </div>
  );
}