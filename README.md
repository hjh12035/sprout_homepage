# sprout_homepage

生机主页（GitHub Pages 静态模板），核心特性是植物主题的四向拖拽翻页。

## Features

- Full-page switching with up to four directions per page: left/right/up/down.
- Directional theme binding: each route has a motif and matched theme color.
- Procedural plant growth during drag (not sprite translation).
- Drag direction is always toward screen center.
- Piecewise overlay opacity:
  - progress 0.0 to 0.3: opacity ramps from 0 to 1.
  - progress 0.3 to 0.7: opacity remains 1.
  - progress 0.7 to 1.0: opacity fades from 1 to 0.
- Release behavior:
  - progress < 0.5: smooth rollback to origin page.
  - progress >= 0.5: auto-commit to target page.
- Keyboard fallback follows drag semantics:
  - ArrowRight triggers left-edge route.
  - ArrowLeft triggers right-edge route.
  - ArrowDown triggers top-edge route.
  - ArrowUp triggers bottom-edge route.
- Icon-only edge hints (no visible text labels) and touch drag support.
- Current motifs: sprout, cherry_branch, lavender, sunflower, ginkgo, bamboo.

## Current Pages

- home
- about
- ginkgo
- gallery
- poem
- sunflower
- bamboo

## Current Route Binding

| From | Direction | To | Motif | Theme |
|---|---|---|---|---|
| home | left | about | sprout | #9FD97A |
| home | right | gallery | cherry_branch | #F2A7C2 |
| home | up | poem | lavender | #A788E8 |
| home | down | sunflower | sunflower | #F2A02D |
| about | left | ginkgo | ginkgo | #D9A73A |
| about | right | home | sprout | #9FD97A |
| ginkgo | right | about | ginkgo | #D9A73A |
| gallery | left | home | cherry_branch | #F2A7C2 |
| poem | down | home | lavender | #A788E8 |
| sunflower | up | home | sunflower | #F2A02D |
| sunflower | down | bamboo | bamboo | #6FA85E |
| bamboo | up | sunflower | bamboo | #6FA85E |

## Files

- index.html
- styles.css
- app.js
- plant-growth/shared.js
- plant-growth/sprout.js
- plant-growth/cherry-branch.js
- plant-growth/lavender.js
- plant-growth/sunflower.js
- plant-growth/ginkgo.js
- plant-growth/bamboo.js
- plant-growth/renderer.js
- plant-growth/index.js

## Local Preview

Open index.html directly in browser, or run a static server in this folder.

Example:

1. python -m http.server 8765
2. Open http://127.0.0.1:8765

## Deploy To GitHub Pages

1. Push this repository to GitHub.
2. Go to Settings -> Pages.
3. In Build and deployment, choose Deploy from a branch.
4. Select main branch and /(root), then save.
5. Wait for Pages build, then open the published URL.
