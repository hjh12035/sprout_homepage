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

function paintStem(ctx, length, color, thickness = 6) {
  const segments = 8;
  ctx.lineWidth = thickness;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);

  for (let i = 1; i <= segments; i += 1) {
    const t = i / segments;
    const x = length * t;
    const sway = Math.sin(i * 0.86) * (4.2 + (1 - t) * 3.6);
    const y = sway * (1 - t * 0.35);
    ctx.lineTo(x, y);
  }

  ctx.stroke();
}

function paintLeaf(ctx, x, y, scale, rotate, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.scale(scale, scale);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(20, -8);
  ctx.lineTo(34, 0);
  ctx.lineTo(20, 9);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

function paintBud(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.88, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.88, 0);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function paintBlossom(ctx, x, y, scale, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  for (let i = 0; i < 5; i += 1) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, -3);
    ctx.lineTo(14, 0);
    ctx.lineTo(8, 3);
    ctx.closePath();
    ctx.fillStyle = rgba(lighten(color, 24), 0.94);
    ctx.fill();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fillStyle = rgba(lighten(color, 42), 0.98);
  ctx.fill();

  ctx.restore();
}

function drawSprout(ctx, progress, color, sizeBoost = 1) {
  const p = easeOutCubic(progress);
  const stemLength = (48 + 220 * p) * sizeBoost;
  paintStem(ctx, stemLength, rgba(color, 0.95), 7 * sizeBoost);

  if (p > 0.16) {
    const lp = easeOutCubic((p - 0.16) / 0.84);
    paintLeaf(
      ctx,
      stemLength * 0.28,
      -8 * sizeBoost,
      (0.35 + lp * 1.15) * sizeBoost,
      -0.74,
      rgba(lighten(color, 32), 0.94)
    );
  }

  if (p > 0.34) {
    const lp = easeOutCubic((p - 0.34) / 0.66);
    paintLeaf(
      ctx,
      stemLength * 0.48,
      7 * sizeBoost,
      (0.3 + lp * 1.0) * sizeBoost,
      0.76,
      rgba(lighten(color, 14), 0.96)
    );
  }

  if (p > 0.54) {
    const lp = easeOutCubic((p - 0.54) / 0.46);
    paintLeaf(
      ctx,
      stemLength * 0.67,
      -5 * sizeBoost,
      (0.24 + lp * 0.84) * sizeBoost,
      -0.56,
      rgba(lighten(color, 24), 0.92)
    );
  }
}

function drawCherryBranch(ctx, progress, color, sizeBoost = 1) {
  const p = easeOutCubic(progress);
  const branchLength = (56 + 250 * p) * sizeBoost;
  paintStem(ctx, branchLength, rgba(darken(color, 36), 0.96), 6.5 * sizeBoost);

  const branchCount = Math.floor(6 * p);
  for (let i = 0; i < branchCount; i += 1) {
    const t = (i + 1) / 7;
    const x = branchLength * (0.2 + t * 0.7);
    const y = (i % 2 === 0 ? -1 : 1) * (8 + i * 4) * sizeBoost;
    ctx.beginPath();
    ctx.moveTo(x - 18 * sizeBoost, 0);
    ctx.lineTo(x, y);
    ctx.lineWidth = 4 * sizeBoost;
    ctx.strokeStyle = rgba(darken(color, 42), 0.92);
    ctx.stroke();
  }

  if (p > 0.28) {
    const bp = (p - 0.28) / 0.72;
    paintBlossom(ctx, branchLength * 0.4, -16 * sizeBoost, 0.58 + bp * 0.66, color);
  }

  if (p > 0.46) {
    const bp = (p - 0.46) / 0.54;
    paintBlossom(ctx, branchLength * 0.63, 18 * sizeBoost, 0.48 + bp * 0.58, color);
  }

  if (p > 0.61) {
    const bp = (p - 0.61) / 0.39;
    paintBlossom(ctx, branchLength * 0.82, -14 * sizeBoost, 0.42 + bp * 0.5, color);
  }
}

function drawLavender(ctx, progress, color, sizeBoost = 1) {
  const p = easeOutCubic(progress);
  const stemLength = (52 + 232 * p) * sizeBoost;
  paintStem(ctx, stemLength, rgba(darken(color, 26), 0.95), 6.2 * sizeBoost);

  const buds = Math.floor(p * 20);
  for (let i = 0; i < buds; i += 1) {
    const t = (i + 1) / 20;
    const x = stemLength * (0.24 + t * 0.72);
    const y = (i % 2 === 0 ? -1 : 1) * (5 + t * 15) * sizeBoost;
    const size = (2.3 + t * 5) * sizeBoost;
    paintBud(ctx, x, y, size, rgba(lighten(color, 12), 0.9));
  }
}

function drawMotif(ctx, motif, progress, color, sizeBoost = 1) {
  switch (motif) {
    case "cherry_branch":
      drawCherryBranch(ctx, progress, color, sizeBoost);
      break;
    case "lavender":
      drawLavender(ctx, progress, color, sizeBoost);
      break;
    case "sprout":
    default:
      drawSprout(ctx, progress, color, sizeBoost);
      break;
  }
}

function directionAnchor(direction, width, height) {
  switch (direction) {
    case "left":
      return { x: 20, y: height * 0.5, angle: 0 };
    case "right":
      return { x: width - 20, y: height * 0.5, angle: Math.PI };
    case "up":
      return { x: width * 0.5, y: 20, angle: Math.PI / 2 };
    case "down":
      return { x: width * 0.5, y: height - 20, angle: -Math.PI / 2 };
    default:
      return { x: 0, y: 0, angle: 0 };
  }
}

function drawGrowthCluster(ctx, motif, growth, color) {
  const shootCount = 1 + Math.floor(growth * 8);
  const spreadBase = 14 + growth * 72;

  for (let i = 0; i < shootCount; i += 1) {
    const rank = i / Math.max(shootCount - 1, 1);
    const localGrowth = clamp(growth * 1.2 - i * 0.08, 0, 1);
    if (localGrowth <= 0) {
      continue;
    }

    const spread = (i - (shootCount - 1) / 2) * spreadBase;
    const twist = (i % 2 === 0 ? -1 : 1) * (0.05 + rank * 0.2);
    const tintShift = i % 2 === 0 ? 18 : -14;
    const branchColor = tintShift > 0 ? lighten(color, tintShift) : darken(color, -tintShift);

    ctx.save();
    ctx.translate(0, spread);
    ctx.rotate(twist);
    ctx.scale(0.72 + rank * 0.68, 0.72 + rank * 0.68);
    drawMotif(ctx, motif, localGrowth, branchColor, 0.86 + growth * 0.94);
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

  function drawTinyBud(ctx, color) {
    ctx.save();
    ctx.fillStyle = rgba(lighten(color, 22), 0.96);
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.bezierCurveTo(10, -14, 18, 2, 0, 18);
    ctx.bezierCurveTo(-18, 2, -10, -14, 0, -12);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -2, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = rgba(darken(color, 16), 0.96);
    ctx.fill();
    ctx.restore();
  }

  function drawTinyFlower(ctx, color) {
    ctx.save();
    ctx.translate(0, -4);
    for (let i = 0; i < 5; i += 1) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8, -3);
      ctx.lineTo(14, 0);
      ctx.lineTo(8, 3);
      ctx.closePath();
      ctx.fillStyle = rgba(lighten(color, 18), 0.95);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = rgba(darken(color, 12), 0.95);
    ctx.fill();
    ctx.restore();
  }

  function drawTinySpike(ctx, color) {
    ctx.save();
    ctx.fillStyle = rgba(lighten(color, 22), 0.96);
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(0, -10 + i * 8);
      ctx.lineTo(6, -4 + i * 8);
      ctx.lineTo(0, 4 + i * 8);
      ctx.lineTo(-6, -4 + i * 8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = rgba(darken(color, 18), 0.96);
    ctx.fill();
    ctx.restore();
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
    hintCtx.scale(1.2, 1.2);
    hintCtx.translate(-14, 0);

    switch (route.motif) {
      case "cherry_branch":
        drawTinyFlower(hintCtx, route.themeColor);
        break;
      case "lavender":
        drawTinySpike(hintCtx, route.themeColor);
        break;
      case "sprout":
      default:
        drawTinyBud(hintCtx, route.themeColor);
        break;
    }

    hintCtx.restore();
  }

  function render(activeDirection, activeRoute, progress) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    if (!activeDirection || !activeRoute) {
      return;
    }

    const growth = easeOutCubic(progress);
    const anchor = directionAnchor(activeDirection, width, height);
    const alpha = clamp(0.08 + overlayOpacity(progress) * 0.94, 0, 1);

    ctx.save();
    ctx.translate(anchor.x, anchor.y);
    ctx.rotate(anchor.angle);
    ctx.globalAlpha = alpha;

    const fogRadius = 180 + growth * 460;
    const fog = ctx.createRadialGradient(0, 0, 0, 0, 0, fogRadius);
    fog.addColorStop(0, rgba(lighten(activeRoute.themeColor, 28), 0.9));
    fog.addColorStop(0.3, rgba(activeRoute.themeColor, 0.4));
    fog.addColorStop(1, rgba(activeRoute.themeColor, 0));

    ctx.fillStyle = fog;
    ctx.beginPath();
    ctx.arc(0, 0, fogRadius, 0, Math.PI * 2);
    ctx.fill();

    const largeScale = 0.62 + growth * 1.56;
    ctx.save();
    ctx.scale(largeScale, largeScale);
    drawGrowthCluster(ctx, activeRoute.motif, growth, activeRoute.themeColor);
    ctx.restore();

    ctx.beginPath();
    ctx.fillStyle = rgba(lighten(activeRoute.themeColor, 26), 0.94);
    ctx.arc(0, 0, 10 + growth * 18, 0, Math.PI * 2);
    ctx.fill();

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
  overlayOpacity
};
})();
