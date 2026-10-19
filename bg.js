(function () {
  "use strict";
  var canvas = document.getElementById("bg-canvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 0, H = 0, DPR = 1, nodes = [], raf = null;
  var NODE_COUNT = 44;
  var LINK_DIST = 130;
  var GRID_GAP = 54;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = Math.max(1, Math.floor(window.innerWidth * DPR));
    H = canvas.height = Math.max(1, Math.floor(window.innerHeight * DPR));
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }

  function seed() {
    nodes = [];
    for (var i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.16 * DPR,
        vy: (Math.random() - 0.5) * 0.16 * DPR,
        r: (Math.random() * 1.3 + 0.7) * DPR,
        amber: Math.random() < 0.15
      });
    }
  }

  function drawGrid() {
    ctx.strokeStyle = "rgba(89,214,198,0.05)";
    ctx.lineWidth = 1;
    var gap = GRID_GAP * DPR;
    for (var gx = 0; gx < W; gx += gap) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (var gy = 0; gy < H; gy += gap) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();

    var i, j, n, m, dx, dy, dist, alpha;
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (!reduceMotion) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
    }
    for (i = 0; i < nodes.length; i++) {
      for (j = i + 1; j < nodes.length; j++) {
        n = nodes[i]; m = nodes[j];
        dx = n.x - m.x; dy = n.y - m.y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST * DPR) {
          alpha = (1 - dist / (LINK_DIST * DPR)) * 0.14;
          ctx.strokeStyle = "rgba(240,169,64," + alpha + ")";
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
        }
      }
    }
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      ctx.beginPath();
      ctx.fillStyle = n.amber ? "rgba(240,169,64,0.55)" : "rgba(89,214,198,0.45)";
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reduceMotion) raf = requestAnimationFrame(frame);
  }

  function start() {
    resize();
    seed();
    if (raf) cancelAnimationFrame(raf);
    frame();
  }

  window.addEventListener("resize", start);
  start();
})();
