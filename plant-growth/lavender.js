(function () {
  const shared = window.PlantGrowthShared;

  function drawFacetSpike(ctx, x, y, scale, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: -10 },
        { x: 8, y: -2 },
        { x: 0, y: 12 },
        { x: -8, y: -2 }
      ],
      shared.lighten(color, 16)
    );

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: -6 },
        { x: 4, y: -1 },
        { x: 0, y: 8 },
        { x: -4, y: -1 }
      ],
      shared.darken(color, 10)
    );

    ctx.restore();
  }

  function drawLavender(ctx, progress, color, sizeBoost = 1) {
    const p = shared.easeOutCubic(progress);
    const length = (54 + 236 * p) * sizeBoost;
    const nodes = [];
    const widths = [];

    for (let index = 0; index <= 10; index += 1) {
      const t = index / 10;
      const sway = Math.sin(t * 2.9) * (3.8 + (1 - t) * 1.6) * p;
      nodes.push({
        x: length * (0.1 + t * 0.84),
        y: sway
      });
      widths.push(5.8 + (1 - t) * 1.2);
    }

    shared.drawFacetedRibbon(ctx, nodes, widths, [
      shared.darken(color, 24),
      shared.darken(color, 8),
      color,
      shared.lighten(color, 10)
    ]);

    const spikeCount = Math.floor(9 * p);
    for (let index = 0; index < spikeCount; index += 1) {
      const t = (index + 1) / 10;
      const node = nodes[Math.min(nodes.length - 1, 2 + index)];
      if (!node) {
        continue;
      }

      const spikeScale = 0.42 + t * 0.34;
      drawFacetSpike(ctx, node.x, node.y - (index % 2 === 0 ? 4 : -4), spikeScale * sizeBoost, color);
    }
  }

  function drawHint(ctx, color) {
    ctx.save();
    ctx.translate(0, -1);
    drawFacetSpike(ctx, -8, 8, 0.92, color);
    drawFacetSpike(ctx, 0, 0, 1.12, color);
    drawFacetSpike(ctx, 8, 8, 0.92, color);
    ctx.restore();
  }

  window.PlantGrowthMotifs = window.PlantGrowthMotifs || {};
  window.PlantGrowthMotifs.lavender = {
    draw: drawLavender,
    drawHint
  };
})();
