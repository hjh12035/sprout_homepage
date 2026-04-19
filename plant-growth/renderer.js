(function () {
  const shared = window.PlantGrowthShared;
  const motifs = window.PlantGrowthMotifs || {};

  function resolveMotif(name) {
    return motifs[name] || motifs.sprout;
  }

  function directionAnchor(direction, width, height) {
    switch (direction) {
      case "left":
        return { x: 28, y: height * 0.5, angle: 0 };
      case "right":
        return { x: width - 28, y: height * 0.5, angle: Math.PI };
      case "up":
        return { x: width * 0.5, y: 28, angle: Math.PI / 2 };
      case "down":
        return { x: width * 0.5, y: height - 28, angle: -Math.PI / 2 };
      default:
        return { x: 0, y: 0, angle: 0 };
    }
  }

  function drawGrowthCluster(ctx, motif, growth, color) {
    const shootCount = 1 + Math.floor(growth * 8);
    const spread = 10 + growth * 90;

    for (let index = 0; index < shootCount; index += 1) {
      const rank = shootCount > 1 ? index / (shootCount - 1) : 0;
      const localProgress = shared.clamp(growth * 1.18 - index * 0.09, 0, 1);
      if (localProgress <= 0) {
        continue;
      }

      const offset = (index - (shootCount - 1) / 2) * spread;
      const tilt = (index % 2 === 0 ? -1 : 1) * (0.03 + rank * 0.18);
      const tint = index % 2 === 0 ? shared.lighten(color, 14) : shared.darken(color, 10);

      ctx.save();
      ctx.translate(0, offset);
      ctx.rotate(tilt);
      ctx.scale(0.72 + rank * 0.76, 0.72 + rank * 0.76);
      motif.draw(ctx, localProgress, tint, 0.9 + growth * 1.1);
      ctx.restore();
    }
  }

  function createPlantRenderer(canvas) {
    const ctx = canvas.getContext("2d");

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawHint(hintCanvas, route, direction) {
      const hintCtx = hintCanvas.getContext("2d");
      hintCtx.clearRect(0, 0, hintCanvas.width, hintCanvas.height);

      hintCtx.save();
      hintCtx.translate(hintCanvas.width / 2, hintCanvas.height / 2);

      const angleByDirection = {
        right: Math.PI,
        left: 0,
        up: Math.PI / 2,
        down: -Math.PI / 2
      };

      hintCtx.rotate(angleByDirection[direction] || 0);
      hintCtx.globalAlpha = 1;
      
      // Scale up significantly for the new 440px canvas sizes
      hintCtx.scale(5.5, 5.5);
      
      // We no longer translate off-center because the canvas itself is symmetrically positioned 
      // half-in and half-out of the screen edges in CSS.

      const motif = resolveMotif(route.motif);
      motif.drawHint(hintCtx, route.themeColor);
      hintCtx.restore();
    }

    function render(activeDirection, activeRoute, progress) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      if (!activeDirection || !activeRoute) {
        return;
      }

      const anchor = directionAnchor(activeDirection, width, height);
      const growth = shared.easeOutCubic(progress);
      const alpha = shared.clamp(0.08 + shared.overlayOpacity(progress) * 0.94, 0, 1);
      const motif = resolveMotif(activeRoute.motif);

      ctx.save();
      ctx.translate(anchor.x, anchor.y);
      ctx.rotate(anchor.angle);
      ctx.globalAlpha = alpha;

      const fogRadius = 140 + growth * 280;
      const fog = ctx.createRadialGradient(0, 0, 0, 0, 0, fogRadius);
      fog.addColorStop(0, shared.rgba(shared.lighten(activeRoute.themeColor, 24), 0.88));
      fog.addColorStop(0.35, shared.rgba(activeRoute.themeColor, 0.32));
      fog.addColorStop(1, shared.rgba(activeRoute.themeColor, 0));
      ctx.fillStyle = fog;
      ctx.beginPath();
      ctx.arc(0, 0, fogRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.scale(0.9 + growth * 0.86, 0.9 + growth * 0.86);
      drawGrowthCluster(ctx, motif, growth, activeRoute.themeColor);
      ctx.restore();

      ctx.restore();
    }

    return {
      resize,
      drawHint,
      render
    };
  }

  window.PlantGrowth = {
    createPlantRenderer,
    overlayOpacity: shared.overlayOpacity
  };
})();
