(function () {
  const shared = window.PlantGrowthShared;

  function drawFloret(ctx, x, y, scale, colorA, colorB) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: -3 },
        { x: 5, y: -1 },
        { x: 7, y: 1 },
        { x: 2, y: 4 },
        { x: -4, y: 2 }
      ],
      colorA
    );

    shared.fillPolygon(
      ctx,
      [
        { x: -1, y: -2 },
        { x: 3, y: 0 },
        { x: 2, y: 3 },
        { x: -2, y: 2 }
      ],
      colorB
    );

    ctx.restore();
  }

  function drawFacetLeaf(ctx, x, y, angle, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    shared.fillPolygon(
      ctx,
      [
        { x: -2, y: 0 },
        { x: 14, y: -4 },
        { x: 38, y: -1 },
        { x: 16, y: 6 },
        { x: 0, y: 4 }
      ],
      "#8FA68E"
    );

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: 1 },
        { x: 10, y: -2 },
        { x: 22, y: 0 },
        { x: 9, y: 4 }
      ],
      "#A8B5A0"
    );

    shared.fillPolygon(
      ctx,
      [
        { x: -4, y: 0 },
        { x: 0, y: -2 },
        { x: 1, y: 2 }
      ],
      "#6E7D6A"
    );

    ctx.restore();
  }

  function floretColors(baseColor, band) {
    if (band < 0.26) {
      return [shared.darken(baseColor, 8), shared.darken(baseColor, 22)];
    }
    if (band < 0.72) {
      return [shared.lighten(baseColor, 14), shared.lighten(baseColor, 2)];
    }
    return [shared.darken(baseColor, 18), shared.darken(baseColor, 30)];
  }

  function drawSpikeCluster(ctx, tip, axisAngle, stemLength, progress, color, sizeBoost) {
    const rowCount = 34;
    const visibleRows = Math.max(1, Math.floor(rowCount * progress));
    const spikeLength = stemLength * 0.42;
    const maxRadius = (6.4 + stemLength * 0.018) * sizeBoost;
    const cos = Math.cos(axisAngle);
    const sin = Math.sin(axisAngle);
    const perpX = -sin;
    const perpY = cos;

    const spineNodes = [];
    const spineWidths = [];
    for (let index = 0; index <= 10; index += 1) {
      const t = index / 10;
      const along = t * spikeLength;
      const spindle = Math.max(0.1, 1 - Math.abs(t - 0.44) / 0.56);
      spineNodes.push({
        x: tip.x - cos * along,
        y: tip.y - sin * along
      });
      spineWidths.push((maxRadius * spindle + 1.4) * 1.1);
    }

    shared.drawFacetedRibbon(ctx, spineNodes, spineWidths, [
      shared.darken(color, 24),
      shared.darken(color, 12),
      shared.lighten(color, 4),
      shared.darken(color, 18)
    ]);

    for (let row = 0; row < visibleRows; row += 1) {
      const t = row / Math.max(1, rowCount - 1);
      const along = t * spikeLength;
      const centerX = tip.x - cos * along;
      const centerY = tip.y - sin * along;
      const spindle = Math.max(0.12, 1 - Math.abs(t - 0.46) / 0.54);
      const radius = maxRadius * spindle;
      const grainCount = Math.max(4, Math.round(4 + spindle * 6));
      const [floretA, floretB] = floretColors(color, t);

      for (let index = 0; index < grainCount; index += 1) {
        const lane = grainCount === 1 ? 0 : index / (grainCount - 1) - 0.5;
        const spread = t > 0.75 ? 1.24 : 1.06;
        const offset = lane * radius * spread;
        const jitter = Math.sin((row + 1) * (index + 1) * 0.9) * radius * 0.04;
        const overlapPush = (0.15 + spindle * 0.22) * (index % 2 === 0 ? 1 : -1);
        const grainX = centerX + perpX * (offset + jitter) + cos * overlapPush;
        const grainY = centerY + perpY * (offset + jitter * 0.8) + sin * overlapPush;
        const grainScale = 0.22 + spindle * 0.44 + (index % 2) * 0.03;

        drawFloret(ctx, grainX, grainY, grainScale * sizeBoost, floretA, floretB);
      }
    }
  }

  function drawStemAndBloom(ctx, p, color, stemLength, xOffset, tilt, sizeBoost) {
    const nodes = [];
    const widths = [];

    ctx.save();
    ctx.translate(xOffset, 0);
    ctx.rotate(tilt);

    for (let index = 0; index <= 11; index += 1) {
      const t = index / 11;
      const sway =
        (Math.sin(t * Math.PI * 2.1 - 0.4) * (4.6 + (1 - t) * 2.2) +
          Math.sin(t * Math.PI * 5.1) * 1.1) *
        p;
      nodes.push({
        x: stemLength * t,
        y: sway
      });

      const base = 8.2 + (1 - t) * 2.8;
      const taper = t * 2.5;
      widths.push(base - taper);
    }

    shared.drawFacetedRibbon(ctx, nodes, widths, ["#5A4A4A", "#6B5B73", "#74647D", "#857790"]);

    if (p > 0.16) {
      const leafGrowth = shared.easeOutCubic((p - 0.16) / 0.84);
      const leafA = nodes[3];
      const leafB = nodes[5];
      if (leafA) {
        drawFacetLeaf(ctx, leafA.x - 2, leafA.y + 6, -0.58, (0.5 + leafGrowth * 0.78) * sizeBoost);
      }
      if (leafB) {
        drawFacetLeaf(ctx, leafB.x + 3, leafB.y + 10, 0.52, (0.46 + leafGrowth * 0.68) * sizeBoost);
      }
    }

    if (p > 0.24) {
      const bloomProgress = shared.easeOutCubic((p - 0.24) / 0.76);
      const tip = nodes[nodes.length - 1];
      const prev = nodes[nodes.length - 2] || tip;
      const axisAngle = Math.atan2(tip.y - prev.y, tip.x - prev.x);
      drawSpikeCluster(ctx, tip, axisAngle, stemLength, bloomProgress, color, sizeBoost);
    }

    ctx.restore();
  }

  function drawLavender(ctx, progress, color, sizeBoost = 1) {
    const p = shared.easeOutCubic(progress);
    const baseLength = (84 + 206 * p) * sizeBoost;
    const stalks = [
      { x: -34, h: 1.02, tilt: 0.02 },
      { x: -16, h: 0.82, tilt: -0.12 },
      { x: 2, h: 1.08, tilt: 0.04 },
      { x: 20, h: 1.0, tilt: 0.12 },
      { x: 36, h: 0.86, tilt: -0.03 }
    ];

    for (let index = 0; index < stalks.length; index += 1) {
      const stalk = stalks[index];
      drawStemAndBloom(
        ctx,
        p,
        color,
        baseLength * stalk.h,
        stalk.x * sizeBoost,
        stalk.tilt,
        0.92 + index * 0.03
      );
    }
  }

  function drawHint(ctx, color) {
    ctx.save();
    const stemNodes = [
      { x: -38, y: 2 },
      { x: -12, y: 0 },
      { x: 12, y: -1 },
      { x: 34, y: -1 }
    ];
    const stemWidths = [6.6, 5.8, 4.8, 4];
    shared.drawFacetedRibbon(ctx, stemNodes, stemWidths, ["#5A4A4A", "#6B5B73", "#74647D", "#857790"]);

    drawSpikeCluster(ctx, { x: 38, y: -1 }, 0, 96, 1, color, 0.66);
    ctx.restore();
  }

  window.PlantGrowthMotifs = window.PlantGrowthMotifs || {};
  window.PlantGrowthMotifs.lavender = {
    draw: drawLavender,
    drawHint
  };
})();
