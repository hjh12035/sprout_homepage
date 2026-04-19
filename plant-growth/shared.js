(function () {
  function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value));
  }

  function easeOutCubic(t) {
    const clamped = clamp(t);
    return 1 - (1 - clamped) ** 3;
  }

  function overlayOpacity(progress) {
    const p = clamp(progress);
    return p <= 0.5 ? p * 2 : (1 - p) * 2;
  }

  function parseHex(hex) {
    const cleaned = String(hex || "").replace("#", "");
    if (cleaned.length !== 6) {
      return { r: 159, g: 217, b: 122 };
    }

    return {
      r: Number.parseInt(cleaned.slice(0, 2), 16),
      g: Number.parseInt(cleaned.slice(2, 4), 16),
      b: Number.parseInt(cleaned.slice(4, 6), 16)
    };
  }

  function rgbToHex({ r, g, b }) {
    const toHex = (value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function lighten(hex, amount) {
    const rgb = parseHex(hex);
    return rgbToHex({
      r: rgb.r + amount,
      g: rgb.g + amount,
      b: rgb.b + amount
    });
  }

  function darken(hex, amount) {
    const rgb = parseHex(hex);
    return rgbToHex({
      r: rgb.r - amount,
      g: rgb.g - amount,
      b: rgb.b - amount
    });
  }

  function rgba(hex, alpha) {
    const { r, g, b } = parseHex(hex);
    return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
  }

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  function midpoint(pointA, pointB, t = 0.5) {
    return {
      x: lerp(pointA.x, pointB.x, t),
      y: lerp(pointA.y, pointB.y, t)
    };
  }

  function polygonPath(ctx, points) {
    if (!points || points.length < 3) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index += 1) {
      ctx.lineTo(points[index].x, points[index].y);
    }
    ctx.closePath();
  }

  function fillPolygon(ctx, points, fillStyle) {
    polygonPath(ctx, points);
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  function drawFacetedRibbon(ctx, nodes, widths, palette) {
    if (!nodes || nodes.length < 2) {
      return;
    }

    const colors = palette && palette.length ? palette : ["#8fbf79"];

    for (let index = 0; index < nodes.length - 1; index += 1) {
      const start = nodes[index];
      const end = nodes[index + 1];
      const deltaX = end.x - start.x;
      const deltaY = end.y - start.y;
      const length = Math.hypot(deltaX, deltaY) || 1;
      const normalX = (-deltaY / length) * 0.5;
      const normalY = (deltaX / length) * 0.5;
      const startWidth = typeof widths[index] === "number" ? widths[index] : widths[widths.length - 1] || 6;
      const endWidth = typeof widths[index + 1] === "number" ? widths[index + 1] : startWidth;
      const halfStart = startWidth / 2;
      const halfEnd = endWidth / 2;
      const segmentColor = colors[index % colors.length];
      const facetColor = colors[(index + 1) % colors.length];
      const points = [
        { x: start.x + normalX * halfStart, y: start.y + normalY * halfStart },
        { x: end.x + normalX * halfEnd, y: end.y + normalY * halfEnd },
        { x: end.x - normalX * halfEnd, y: end.y - normalY * halfEnd },
        { x: start.x - normalX * halfStart, y: start.y - normalY * halfStart }
      ];

      fillPolygon(ctx, points, index % 2 === 0 ? segmentColor : facetColor);
    }
  }

  window.PlantGrowthShared = {
    clamp,
    easeOutCubic,
    overlayOpacity,
    parseHex,
    rgbToHex,
    lighten,
    darken,
    rgba,
    lerp,
    midpoint,
    polygonPath,
    fillPolygon,
    drawFacetedRibbon
  };
})();
