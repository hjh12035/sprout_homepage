(function () {
  const shared = window.PlantGrowthShared;

  function drawCotyledonLeaf(ctx, x, y, scale, rotate, colorA, colorB) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.scale(scale, scale);

    shared.fillPolygon(
      ctx,
      [
        { x: 0, y: 0 },
        { x: 11, y: -7 },
        { x: 25, y: -9 },
        { x: 38, y: -4 },
        { x: 34, y: 6 },
        { x: 18, y: 10 },
        { x: 5, y: 6 }
      ],
      colorA
    );

    shared.fillPolygon(
      ctx,
      [
        { x: 8, y: 2 },
        { x: 18, y: -3 },
        { x: 26, y: -1 },
        { x: 16, y: 4 }
      ],
      colorB
    );

    ctx.restore();
  }

  function drawSprout(ctx, progress, color, sizeBoost = 1) {
    const p = shared.easeOutCubic(progress);
    const length = (24 + 120 * p) * sizeBoost;
    const nodes = [];
    const widths = [];

    for (let index = 0; index <= 8; index += 1) {
      const t = index / 8;
      const sway =
        (Math.sin(t * Math.PI * 1.55 + 0.18) * (3 + (1 - t) * 1.5) +
          Math.sin(t * Math.PI * 3.2) * 0.8 -
          Math.pow(t, 1.22) * 4.6) *
        p;
      nodes.push({
        x: length * t,
        y: sway
      });
      widths.push((5.8 - t * 2.9) * (0.92 + p * 0.08));
    }

    shared.drawFacetedRibbon(ctx, nodes, widths, [
      shared.lighten(color, 78),
      shared.lighten(color, 62),
      shared.lighten(color, 46)
    ]);

    if (p > 0.2) {
      const leafProgress = shared.easeOutCubic((p - 0.2) / 0.8);
      const tip = nodes[nodes.length - 1];
      const leafOuter = shared.lighten(color, 26);
      const leafInner = shared.lighten(color, 58);
      const leafScale = (0.22 + leafProgress * 0.56) * sizeBoost;

      drawCotyledonLeaf(ctx, tip.x - 1.8, tip.y - 2.2, leafScale, -1.42, leafOuter, leafInner);
      drawCotyledonLeaf(ctx, tip.x - 1.2, tip.y + 2.6, leafScale * 0.96, 1.34, leafOuter, leafInner);
    }
  }

  function drawHint(ctx, color) {
    ctx.save();
    const stemNodes = [
      { x: -10, y: 9 },
      { x: -7, y: 7 },
      { x: -3, y: 4 },
      { x: 1, y: 0 }
    ];
    const stemWidths = [3.6, 3.1, 2.6, 2.1];
    shared.drawFacetedRibbon(ctx, stemNodes, stemWidths, [
      shared.lighten(color, 78),
      shared.lighten(color, 62),
      shared.lighten(color, 46)
    ]);

    const leafOuter = shared.lighten(color, 22);
    const leafInner = shared.lighten(color, 54);
    drawCotyledonLeaf(ctx, 2, -2, 0.54, -1.4, leafOuter, leafInner);
    drawCotyledonLeaf(ctx, 2, 3, 0.52, 1.28, leafOuter, leafInner);

    ctx.restore();
  }

  window.PlantGrowthMotifs = window.PlantGrowthMotifs || {};
  window.PlantGrowthMotifs.sprout = {
    draw: drawSprout,
    drawHint
  };
})();
