# sprout_homepage

生机主页（GitHub Pages 静态模板），核心特性是植物主题的四向拖拽翻页。

## Features

- Full-page switching with up to four directions per page: left/right/up/down.
- Directional theme binding: each route has a motif and matched theme color.
- Procedural plant growth during drag (not sprite translation).
- Drag direction is always toward screen center.
- Piecewise overlay opacity: 0->0.5 ramps up, 0.5->1 fades out.
- Release behavior:
	- progress < 0.5: smooth rollback to origin page.
	- progress >= 0.5: auto-commit to target page.
- Keyboard fallback follows drag semantics:
	- ArrowRight triggers left-edge route
	- ArrowLeft triggers right-edge route
	- ArrowDown triggers top-edge route
	- ArrowUp triggers bottom-edge route
- Icon-only edge hints (no visible text labels) and touch drag support.

## Current Route Binding

- home -> left: about, sprout, #9FD97A
- home -> right: gallery, cherry_branch, #F2A7C2
- home -> up: poem, lavender, #A788E8
- about -> right: home, sprout, #9FD97A
- gallery -> left: home, cherry_branch, #F2A7C2
- poem -> down: home, lavender, #A788E8

## Files

- index.html
- styles.css
- app.js
- plant-growth/
	- shared.js
	- sprout.js
	- cherry-branch.js
	- lavender.js
	- renderer.js
	- index.js

## Local Preview

Open index.html directly in browser, or run a static server in this folder.

## Deploy To GitHub Pages

1. Push this repository to GitHub.
2. Go to Settings -> Pages.
3. In Build and deployment, choose Deploy from a branch.
4. Select main branch and /(root), then save.
5. Wait for Pages build, then open the published URL.
