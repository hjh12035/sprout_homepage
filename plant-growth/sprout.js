(function () {
  const shared = window.PlantGrowthShared;

  function drawFacetLeaf(ctx, x, y, scale, rotate, colorA, colorB) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.scale(scale, scale);

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: 0 },
        { x: 18, y: -6 },
        { x: 30, y: -1 },
        { x: 20, y: 8 },
        { x: 6, y: 7 }
      ],
      colorA
    );

    shared.fillPolygon(
      ctx,
      [
        { x: 3, y: 1 },
        { x: 16, y: -2 },
        { x: 24, y: 2 },
        { x: 12, y: 6 }
      ],
      colorB
    );

    ctx.restore();
  }

  function drawFacetBud(ctx, color) {
    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: -14 },
        { x: 10, y: -4 },
        { x: 6, y: 14 },
        { x: -6, y: 14 },
        { x: -10, y: -4 }
      ],
      color
    );
  }

  function drawSprout(ctx, progress, color, sizeBoost = 1) {
    const p = shared.easeOutCubic(progress);
    const length = (58 + 230 * p) * sizeBoost;
    const nodes = [];
    const widths = [];

    for (let index = 0; index <= 9; index += 1) {
      const t = index / 9;
      const sway = Math.sin(t * 3.4) * (4 + (1 - t) * 2.2) * p;
      nodes.push({
        x: length * t,
        y: sway
      });
      widths.push(6 + t * 5.5);
    }

    shared.drawFacetedRibbon(ctx, nodes, widths, [
      shared.lighten(color, 24),
      color,
      shared.darken(color, 10)
    ]);

    if (p > 0.18) {
      const leafProgress = shared.easeOutCubic((p - 0.18) / 0.82);
      const anchor = nodes[3];
      drawFacetLeaf(
        ctx,
        anchor.x + 4,
        anchor.y - 10,
        0.48 + leafProgress * 1.1,
        -0.72,
        shared.lighten(color, 20),
        shared.darken(color, 8)
      );
    }

    if (p > 0.36) {
      const leafProgress = shared.easeOutCubic((p - 0.36) / 0.64);
      const anchor = nodes[5];
      drawFacetLeaf(
        ctx,
        anchor.x + 1,
        anchor.y + 9,
        0.42 + leafProgress * 1.0,
        0.76,
        shared.lighten(color, 16),
        shared.darken(color, 10)
      );
    }

    if (p > 0.56) {
      const budProgress = shared.easeOutCubic((p - 0.56) / 0.44);
      ctx.save();
      ctx.translate(length * 0.76, -8);
      ctx.scale(0.48 + budProgress * 0.52, 0.48 + budProgress * 0.52);
      drawFacetBud(ctx, shared.lighten(color, 30));
      ctx.restore();
    }
  }

  function drawHint(ctx, color) {
    ctx.save();
    ctx.translate(8, 10);
    ctx.scale(0.92, 0.92);

    drawFacetBud(ctx, shared.darken(color, 10));

    ctx.save();
    ctx.translate(-10, 12);
    ctx.rotate(-0.6);
    drawFacetLeaf(ctx, 0, 0, 0.72, -0.2, shared.lighten(color, 18), shared.darken(color, 8));
    ctx.restore();

    ctx.save();
    ctx.translate(10, 12);
    ctx.rotate(0.6);
    drawFacetLeaf(ctx, 0, 0, 0.72, 0.2, shared.lighten(color, 18), shared.darken(color, 8));
    ctx.restore();

    ctx.restore();
  }

  window.PlantGrowthMotifs = window.PlantGrowthMotifs || {};
  window.PlantGrowthMotifs.sprout = {
    draw: drawSprout,
    drawHint
  };
})();
