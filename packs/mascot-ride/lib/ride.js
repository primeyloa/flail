// Coaster motion: speed comes from height, so the car crawls over crests and flies down drops.
(function () {
  const FPS = 30;
  const TRACK = "M-700 760 C -300 760, -40 520, 300 520 C 720 520, 980 2360, 1560 2360 C 2100 2360, 2300 1040, 2860 1040 C 3200 1040, 3500 1300, 4300 1500";

  // Draws the rail and supports into a parent, and returns the rail path for simulate().
  function buildTrack(parent, groundY = 2700) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "10");
    svg.setAttribute("height", "10");
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:visible;";
    svg.innerHTML = `<g class="supports"></g><path class="rail" fill="none" stroke="#141413" stroke-width="16" stroke-linecap="round" d="${TRACK}"/>`;
    parent.appendChild(svg);
    const rail = svg.querySelector(".rail");
    let lines = "";
    for (let s = 0; s < rail.getTotalLength(); s += 320) {
      const p = rail.getPointAtLength(s);
      lines += `<line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${groundY}" stroke="#E8E6DC" stroke-width="10"/>`;
    }
    svg.querySelector(".supports").innerHTML = lines;
    return rail;
  }

  // Where the first crest is along the rail. Runs must start here, or the car lacks the energy to get over it.
  function firstCrest(rail) {
    let crest = 0;
    for (let s = 0; s < 1500; s += 5) if (rail.getPointAtLength(s).y < rail.getPointAtLength(crest).y) crest = s;
    return crest;
  }

  // Builds the car with a Clawd in each seat, feet inside the body, and the balloon behind them.
  function buildCar(parent) {
    const car = document.createElement("div");
    car.style.cssText = "position:absolute;left:0;top:0;width:0;height:0;";
    const box = (css) => `<div style="position:absolute;${css}"></div>`;
    car.innerHTML = `<div class="balloon" style="position:absolute;left:-210px;top:-120px;width:0;height:0;">
        ${box("left:-2px;top:-230px;width:4px;height:230px;background:var(--ink)")}
        ${box("left:-58px;top:-366px;width:116px;height:140px;border-radius:50% 50% 48% 48%;background:var(--coral)")}
      </div>
      <div class="seat-b" style="position:absolute;left:-245px;top:-186px;width:240px;height:160px;"></div>
      <div class="seat-a" style="position:absolute;left:15px;top:-186px;width:240px;height:160px;"></div>
      ${box("left:-250px;top:-66px;width:500px;height:58px;background:var(--ink);border-radius:12px 40px 12px 12px")}
      ${box("left:-220px;top:-18px;width:30px;height:30px;border-radius:50%;background:var(--grey)")}
      ${box("left:190px;top:-18px;width:30px;height:30px;border-radius:50%;background:var(--grey)")}`;
    parent.appendChild(car);
    return { car, balloon: car.querySelector(".balloon"), seatA: car.querySelector(".seat-a"), seatB: car.querySelector(".seat-b") };
  }

  // Returns one sample per frame: position, slope angle and speed along the track.
  function simulate(path, { startSpeed = 180, gravity = 500, startAt = 0, frames }) {
    const total = path.getTotalLength();
    const startY = path.getPointAtLength(startAt).y;
    const samples = [];
    let s = startAt;
    for (let i = 0; i < frames; i++) {
      const p = path.getPointAtLength(Math.min(s, total));
      const ahead = path.getPointAtLength(Math.min(s + 4, total));
      const speed = Math.sqrt(Math.max(startSpeed * startSpeed + 2 * gravity * (p.y - startY), 400));
      const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
      samples.push({ t: i / FPS, s, x: p.x, y: p.y, angle, speed });
      s += speed / FPS;
    }
    return samples;
  }

  // One full ride across panels: car, camera and balloon per frame. Deterministic, so a panel
  // can pick up exactly where the previous one stopped.
  function planRide(rail, { frames = 225, startSpeed = 170, gravity = 300, holdAtX = 2450 } = {}) {
    const smooth = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
    const samples = simulate(rail, { frames, startSpeed, gravity, startAt: firstCrest(rail) });
    const topSpeed = Math.max(...samples.map((x) => x.speed));
    const holdIndex = samples.findIndex((x) => x.x > holdAtX);
    let lean = null, held = null;
    samples.forEach((x, i) => {
      const relative = x.speed / topSpeed;
      const dropping = smooth((relative - 0.25) / 0.45);
      const climbing = smooth((x.x - 1560) / 700);
      const zoom = (0.9 + 0.75 * dropping) * (1 - climbing) + 0.7 * climbing;
      // Close on the drop, pull back on the climb, then stop and let the car leave.
      if (i === holdIndex) held = { x: 540 - x.x * zoom, y: 1040 - x.y * zoom, zoom };
      const shake = i < holdIndex ? relative ** 3 * 9 : 0;
      const shot = held || { x: 540 - x.x * zoom, y: 1040 - x.y * zoom, zoom };
      x.camera = { x: shot.x + Math.sin(i * 1.7) * shake, y: shot.y + Math.cos(i * 2.3) * shake, zoom: shot.zoom };
      // The balloon floats up at low speed and streams back at high speed, easing so it trails.
      const pull = smooth((x.speed - startSpeed) / (topSpeed * 0.65 - startSpeed)) * (1 - climbing);
      const target = (-x.angle - 6) * (1 - pull) + -92 * pull;
      lean = lean === null ? target : lean + (target - lean) * 0.16;
      x.balloon = lean;
      // Wind is what the camera flies through, so it dies away once the camera stops.
      const settled = holdIndex >= 0 ? smooth((i - holdIndex) / 12) : 0;
      x.wind = smooth((relative - 0.4) / 0.45) * (1 - settled);
    });
    return { samples, topSpeed, holdIndex };
  }

  // Thin lines streaming past the camera, stronger with speed (sample.wind, 0 to 1).
  // Plays frames `from` to `to` of the ride, starting at timeline time 0.
  function wind(tl, container, samples, { from = 0, to = samples.length, count = 16 } = {}) {
    const lines = [];
    for (let i = 0; i < count; i++) {
      const line = document.createElement("div");
      line.style.cssText = `position:absolute;left:0;height:5px;margin-top:-960px;border-radius:3px;background:var(--ink);opacity:0;top:${60 + ((i * 617) % 1800)}px;width:${160 + ((i * 271) % 320)}px;`;
      container.appendChild(line);
      lines.push(line);
    }
    const span = 1900;
    let travel = 0;
    samples.forEach((sample, frame) => {
      travel += sample.speed / FPS;
      if (frame < from || frame >= to) return;
      const at = (frame - from) / FPS;
      const vars = { duration: 1 / FPS, ease: "none" };
      // The first frame is set outright, so lines already in the air carry across a cut.
      const place = (target, values) => (frame === from ? tl.set(target, values, 0) : tl.to(target, { ...values, ...vars }, at - 1 / FPS));
      place(container, { rotation: sample.angle });
      lines.forEach((line, i) => {
        const x = span - ((travel * (1.1 + (i % 3) * 0.35) + i * 233) % span) - 400;
        place(line, { x, opacity: sample.wind * (0.25 + (i % 4) * 0.12) });
      });
    });
  }

  window.FlailRide = { buildTrack, firstCrest, buildCar, simulate, planRide, wind };
})();
