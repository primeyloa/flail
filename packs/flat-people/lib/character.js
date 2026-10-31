// Flat 2D character rig. A panel calls createCharacter() once, then adds moves to
// its paused GSAP timeline, so it never has to redraw or re-animate a body by hand.
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const TICK = 1 / 30;
  const STRIDE_UNITS = 430; // Ground covered per stride, in rig units, so feet don't slide.
  // Each side has its own shoulder and hip, so both arms and both legs stay visible.
  const OFFSET = { armA: -34, armB: 38, legA: -26, legB: 28 };
  const FAR_ARM_REST = -8;

  const HAIR = {
    afro: (c) => `<circle cx="288" cy="200" r="126" fill="${c.hair}"/>`,
    puffs: (c) => `<circle cx="222" cy="150" r="58" fill="${c.hair}"/><circle cx="350" cy="130" r="58" fill="${c.hair}"/><path d="M216 245a90 90 0 0 1 176-20q-90-40-176 20z" fill="${c.hair}"/>`,
    fade: (c) => `<path d="M216 240a90 90 0 0 1 176-22q-78-30-150 2-14 8-26 20z" fill="${c.hair}"/>`,
  };

  // Long braids hang from the back of the head and sway as one part; a bun sits on the crown.
  function braids(c) {
    const strands = [[206, 250, 190, 400, 214, 545], [226, 262, 212, 410, 240, 575], [246, 272, 236, 420, 264, 590], [268, 282, 262, 410, 288, 560]];
    const lines = strands.map(([x1, y1, cx, cy, x2, y2]) => {
      const d = `M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`;
      return `<path d="${d}" stroke="${c.hair}" stroke-width="24" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#3A3A36" stroke-width="16" stroke-dasharray="3 15" fill="none"/><circle cx="${x2}" cy="${y2 + 8}" r="11" fill="${c.beads}"/>`;
    }).join("");
    return `<g data-part="braids" data-x="236" data-y="240">${lines}</g><circle cx="262" cy="108" r="58" fill="${c.hair}"/><circle cx="288" cy="214" r="106" fill="${c.hair}"/>`;
  }

  function limb(id, x, y, len, width, color, inner) {
    return `<g data-part="${id}" data-x="${x}" data-y="${y}"><line x1="${x}" y1="${y}" x2="${x}" y2="${y + len}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>${inner || ""}</g>`;
  }

  // The far side (B) is drawn in darker shades so overlapping limbs stay readable.
  function leg(side, c) {
    const far = side === "B";
    const trousers = far ? c.trousersFar : c.trousers, shoes = far ? c.shoesFar : c.shoes;
    const foot = `<g data-part="foot${side}" data-x="300" data-y="1005"><path d="M284 1016h48a20 20 0 0 1 20 20v4h-72v-16q0-6 4-8z" fill="${shoes}"/></g>`;
    return `<g transform="translate(${OFFSET["leg" + side]} 0)">${limb(`thigh${side}`, 300, 690, 170, 46, trousers, limb(`shin${side}`, 300, 860, 145, 46, trousers, foot))}</g>`;
  }

  function arm(side, c) {
    const far = side === "B";
    const top = far ? c.topFar : c.sleeve, skin = far ? c.skinFar : c.skin;
    const hand = `<circle cx="300" cy="694" r="20" fill="${skin}"/>`;
    return `<g transform="translate(${OFFSET["arm" + side]} 0)">${limb(`upper${side}`, 300, 410, 150, 40, top, limb(`fore${side}`, 300, 560, 130, 30, skin, hand))}</g>`;
  }

  function createCharacter(parent, config) {
    const c = Object.assign({ hair: "#141413", top: "#D97757", trousers: "#141413", shoes: "#D97757", skin: "#4A2A1C", sleeve: "#E8967A", topFar: "#C4684B", trousersFar: "#2E2E2B", shoesFar: "#C4684B", skinFar: "#3D2217", beads: "#141413", hairStyle: "afro", earring: null }, config);
    const fringe = `<path d="M206 240A98 98 0 0 1 402 226Q300 186 206 240z" fill="${c.hair}"/>`;
    const backHair = { afro: HAIR.afro(c), braids: braids(c) }[c.hairStyle] || "";
    const frontHair = { afro: fringe, braids: fringe }[c.hairStyle] || HAIR[c.hairStyle](c);
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 600 1060");
    svg.setAttribute("class", c.flip ? "character flip" : "character");
    svg.innerHTML = `
      <g data-part="body">
        ${arm("B", c)}
        ${leg("B", c)}
        ${leg("A", c)}
        <g data-part="torso" data-x="300" data-y="680">
          <rect x="278" y="320" width="44" height="80" rx="20" fill="${c.skin}"/>
          <path d="${c.build === "broad" ? "M234 410q0-38 40-38h52q40 2 40 38l-12 290h-108z" : "M246 410q0-34 36-36h36q36 2 36 36l-6 290h-96z"}" fill="${c.top}"/>
          <g data-part="head" data-x="300" data-y="345">
            <g transform="translate(304 328) scale(0.76) translate(-304 -328)">
              ${backHair}
              <circle cx="304" cy="240" r="92" fill="${c.skin}"/>
              ${frontHair}
              ${c.earring ? `<circle cx="238" cy="294" r="15" fill="none" stroke="${c.earring}" stroke-width="5"/>` : ""}
              <g data-part="eyes">
                <ellipse cx="322" cy="244" rx="8" ry="10" fill="#FAF9F5"/><circle cx="324" cy="245" r="5" fill="#141413"/>
                <ellipse cx="368" cy="244" rx="7" ry="10" fill="#FAF9F5"/><circle cx="370" cy="245" r="5" fill="#141413"/>
              </g>
              ${c.glasses ? `<g fill="none" stroke="${c.glasses}" stroke-width="5"><circle cx="322" cy="244" r="21"/><circle cx="370" cy="244" r="19"/><path d="M343 242h8M301 242l-40-6"/></g>` : ""}
              <path d="M328 286q20 16 40 0" stroke="#FAF9F5" stroke-width="6" fill="none" stroke-linecap="round"/>
            </g>
          </g>
        </g>
        ${arm("A", c)}
      </g>`;
    parent.appendChild(svg);

    const parts = {};
    svg.querySelectorAll("[data-part]").forEach((el) => {
      parts[el.dataset.part] = el;
      if (el.dataset.x) gsap.set(el, { svgOrigin: `${el.dataset.x} ${el.dataset.y}` });
    });
    return { svg, parts, scale: parent.clientWidth / 600 };
  }

  const smooth = (u) => u * u * (3 - 2 * u);
  const sinSq = (x) => Math.sin(x) ** 2;

  // One leg's pose at phase f (0 = heel strike, 0.5 = toe off). Continuous curves
  // keep limbs moving through each pose instead of pausing on it.
  function legPose(f) {
    const thigh = -20 * Math.cos(2 * Math.PI * f) - 2;
    const load = f < 0.45 ? 6 * sinSq((Math.PI * f) / 0.45) : 0;
    const swing = f >= 0.45 ? 50 * sinSq((Math.PI * (f - 0.45)) / 0.55) : 0;
    const shin = 4 + load + swing;
    return { thigh, shin, foot: -(thigh + shin) * 0.75 };
  }

  function armPose(f) {
    return {
      upper: 13 * Math.cos(2 * Math.PI * f),
      fore: -15 - 9 * Math.cos(2 * Math.PI * (f - 0.08)),
    };
  }

  // Sets the relaxed standing pose.
  function stand(tl, ch, at) {
    const p = ch.parts;
    tl.set(p.upperB, { rotation: FAR_ARM_REST }, at).set(p.foreA, { rotation: -6 }, at).set(p.foreB, { rotation: -6 }, at);
  }

  // Walks `strides` strides over `duration`, slowing to a stop. Ground speed and leg
  // phase share one curve, so the mover needs no separate tween. Use fromRest when the
  // character is already standing in frame, so the walk eases in from the standing pose.
  function walk(tl, ch, mover, { start, duration, strides, fromX, fromRest = false }) {
    const p = ch.parts;
    const decelAt = 0.62;
    const speed = 1 / (decelAt + (1 - decelAt) / 2);
    const progress = (u) => {
      if (fromRest) return smooth(u);
      if (u <= decelAt) return speed * u;
      const left = (1 - u) / (1 - decelAt);
      return 1 - (speed * (1 - decelAt) * left * left) / 2;
    };
    const distance = strides * STRIDE_UNITS * ch.scale;
    const steps = Math.round(duration / TICK);
    const o = { duration: TICK, ease: "none" };

    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const at = start + (i - 1) * TICK;
      const f = (strides * progress(u)) % 1;
      const amp = (1 - smooth(Math.max(0, (u - 0.68) / 0.32))) * (fromRest ? smooth(Math.min(1, u / 0.3)) : 1);
      const a = legPose(f), b = legPose((f + 0.5) % 1);
      // Positive rotation swings a limb back, so armPose(f) opposes legPose(f) on the same side.
      const armA = armPose(f), armB = armPose((f + 0.5) % 1);
      const mix = (value, rest) => amp * value + (1 - amp) * rest;
      const pose = (target, vars) => (i === 0 ? tl.set(target, vars, start) : tl.to(target, { ...vars, ...o }, at));

      pose(mover, { x: fromX + distance * progress(u) });
      pose(p.thighA, { rotation: mix(a.thigh, 0) });
      pose(p.shinA, { rotation: mix(a.shin, 0) });
      pose(p.footA, { rotation: mix(a.foot, 0) });
      pose(p.thighB, { rotation: mix(b.thigh, 0) });
      pose(p.shinB, { rotation: mix(b.shin, 0) });
      pose(p.footB, { rotation: mix(b.foot, 0) });
      pose(p.upperA, { rotation: mix(armA.upper, 0) });
      pose(p.foreA, { rotation: mix(armA.fore, -6) });
      pose(p.upperB, { rotation: mix(armB.upper, FAR_ARM_REST) });
      pose(p.foreB, { rotation: mix(armB.fore, -6) });
      pose(p.body, { y: amp * 5 * Math.cos(4 * Math.PI * f) });
      pose(p.torso, { rotation: amp * 1.5 });
      pose(p.head, { rotation: amp * (-1 + 0.8 * Math.sin(4 * Math.PI * f)) });
      if (p.braids) pose(p.braids, { rotation: amp * (4 + 3 * Math.sin(4 * Math.PI * f - 0.9)) });
    }
    return start + duration;
  }

  // A slow, relaxed wave with the far arm, so the near arm stays visible at her side.
  // The forearm trails the upper arm for follow-through.
  function wave(tl, ch, start, swings, swingTime) {
    const p = ch.parts;
    const lift = 0.75;
    tl.to(p.upperB, { rotation: -122, duration: lift, ease: "sine.inOut" }, start);
    tl.to(p.foreB, { rotation: -38, duration: lift, ease: "sine.inOut" }, start + 0.08);
    tl.to(p.head, { rotation: 3, duration: lift + 0.2, ease: "sine.inOut" }, start + 0.05);
    tl.to(p.torso, { rotation: -1.2, duration: lift + 0.2, ease: "sine.inOut" }, start);
    for (let i = 0; i < swings; i++) {
      tl.to(p.foreB, { rotation: i % 2 ? -38 : -14, duration: swingTime, ease: "sine.inOut" }, start + 0.08 + lift + i * swingTime);
    }
    return start + 0.08 + lift + swings * swingTime;
  }

  // A quiet laugh: the head tips back and the shoulders rise and fall.
  function laugh(tl, ch, start, duration) {
    const p = ch.parts;
    const bob = 0.42;
    tl.to(p.head, { rotation: -6, duration: 0.45, ease: "sine.inOut" }, start);
    tl.to(p.torso, { rotation: -1.5, duration: 0.45, ease: "sine.inOut" }, start);
    for (let i = 0; i < Math.floor(duration / bob); i++) {
      tl.to(p.body, { y: i % 2 ? 0 : -6, duration: bob, ease: "sine.inOut" }, start + i * bob);
    }
  }

  // A relaxed talking gesture with the near arm.
  function gesture(tl, ch, start, duration) {
    const p = ch.parts;
    const lift = 0.6, beat = 0.5;
    tl.to(p.upperA, { rotation: -32, duration: lift, ease: "sine.inOut" }, start);
    tl.to(p.foreA, { rotation: -72, duration: lift, ease: "sine.inOut" }, start + 0.06);
    for (let i = 0; i < Math.floor((duration - lift) / beat); i++) {
      tl.to(p.foreA, { rotation: i % 2 ? -72 : -54, duration: beat, ease: "sine.inOut" }, start + 0.06 + lift + i * beat);
    }
  }

  function blink(tl, ch, at) {
    tl.to(ch.parts.eyes, { scaleY: 0.08, svgOrigin: "345 244", duration: 0.07, ease: "sine.in" }, at);
    tl.to(ch.parts.eyes, { scaleY: 1, svgOrigin: "345 244", duration: 0.11, ease: "sine.out" }, at + 0.07);
  }

  window.FlailRig = { createCharacter, stand, walk, wave, laugh, gesture, blink };
})();
