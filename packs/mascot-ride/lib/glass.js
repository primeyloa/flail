// Liquid glass: flat in the middle, bending the background only near the rim, like a thick lens.
// Slow to render, so keep bubbles hidden (visibility) whenever they aren't on screen.
(function () {
  const NS = "http://www.w3.org/2000/svg";

  function lensMap(w, h, radius, band) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const image = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const qx = Math.abs(x - w / 2) - (w / 2 - radius), qy = Math.abs(y - h / 2) - (h / 2 - radius);
        const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
        const depth = radius - (outside + Math.min(Math.max(qx, qy), 0));
        const strength = Math.max(0, 1 - depth / band) ** 2;
        const nx = Math.sign(x - w / 2) * Math.max(qx, 0), ny = Math.sign(y - h / 2) * Math.max(qy, 0);
        const length = Math.hypot(nx, ny) || 1;
        const i = (y * w + x) * 4;
        image.data[i] = 128 - (nx / length) * strength * 127;
        image.data[i + 1] = 128 - (ny / length) * strength * 127;
        image.data[i + 2] = 128;
        image.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    return canvas.toDataURL();
  }

  let count = 0;
  function create(parent, { x, y, w, h, radius = h / 2, band = 70, bend = 150, lines = [], fontSize = 88 }) {
    const id = `lens-${++count}`;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    svg.innerHTML = `<filter id="${id}" x="0" y="0" width="${w}" height="${h}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feImage href="${lensMap(w, h, radius, band)}" x="0" y="0" width="${w}" height="${h}" result="map" preserveAspectRatio="none"/>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="${bend}" xChannelSelector="R" yChannelSelector="G" result="bent"/>
      <feGaussianBlur in="bent" stdDeviation="1.2"/>
    </filter>`;
    parent.appendChild(svg);

    const el = document.createElement("div");
    el.className = "glass";
    el.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${radius}px;backdrop-filter:url(#${id});display:flex;align-items:center;justify-content:center;visibility:hidden;`;
    if (lines.length) {
      const text = document.createElement("p");
      text.style.cssText = `margin:0;text-align:center;font:400 ${fontSize}px/1.08 var(--font-display);color:var(--ink);`;
      text.innerHTML = lines.join("<br>");
      el.appendChild(text);
    }
    parent.appendChild(el);
    return el;
  }

  // Swells in, stays until `until`, then fades. Hidden the rest of the time, to save render time.
  function show(tl, bubbles, at, until) {
    bubbles.forEach((el, i) => {
      const start = at + i * 0.08;
      tl.set(el, { visibility: "visible" }, start);
      tl.fromTo(el, { opacity: 0, scale: 0.9, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "power2.out" }, start);
      tl.to(el, { opacity: 0, scale: 0.97, duration: 0.3, ease: "power1.in" }, until - 0.3);
      tl.set(el, { visibility: "hidden" }, until);
    });
  }

  window.FlailGlass = { create, show };
})();
