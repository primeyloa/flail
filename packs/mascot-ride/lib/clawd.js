// Clawd for panels: real poses from assets/clawd/sprites, swapped in whole frames like an old game.
(function () {
  const SPRITES = "../../../../../../assets/clawd/sprites/";

  function create(parent, poses, { flip = false } = {}) {
    const box = document.createElement("div");
    box.className = "clawd";
    box.style.cssText = `position:absolute;inset:0;${flip ? "transform:scaleX(-1);" : ""}`;
    const frames = {};
    poses.forEach((name, i) => {
      const img = document.createElement("img");
      img.src = `${SPRITES}${name}.svg`;
      img.alt = "";
      img.style.cssText = `position:absolute;inset:0;width:100%;height:100%;visibility:${i ? "hidden" : "visible"};`;
      box.appendChild(img);
      frames[name] = img;
    });
    parent.appendChild(box);
    return { box, frames, current: poses[0] };
  }

  // Holds a pose from `at` onward, with no in-between frames.
  function pose(tl, clawd, name, at) {
    if (name === clawd.current) return;
    tl.set(clawd.frames[clawd.current], { visibility: "hidden" }, at);
    tl.set(clawd.frames[name], { visibility: "visible" }, at);
    clawd.current = name;
  }

  function blink(tl, clawd, at) {
    const open = clawd.current;
    pose(tl, clawd, "blink", at);
    pose(tl, clawd, open, at + 0.1);
  }

  // Alternates lifted feet for a little walk, in steps, while the parent moves.
  function walk(tl, clawd, start, duration, stepTime = 0.2) {
    const end = start + duration;
    let foot = 0;
    for (let at = start; at < end; at += stepTime) pose(tl, clawd, foot++ % 2 ? "step-right" : "step-left", at);
    pose(tl, clawd, "default", end);
  }

  window.FlailClawd = { create, pose, blink, walk };
})();
