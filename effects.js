/* Background effects for your own camera: blur, or a picture behind you, the way meeting apps do it.
   Everything happens in this browser. The camera picture never leaves the device.

   How: a small copy of each camera frame goes to Google's MediaPipe selfie segmenter (it runs on the graphics chip
   when it can), which says how likely each pixel is to be you. That mask cuts you out of the full-size frame and lays you
   over a blurred copy of the frame, or over a picture, on a <canvas> shown on top of your video.
   The segmenter (about 10 MB, cached by the browser afterwards) is only downloaded once an effect is turned on.

   Use: const fx = CamFx.attach(video, canvas); fx.set('blur' | 'slight' | 'bg:office' | 'none').then(...);
   fx.wake() after the camera restarts or the elements move. fx.showing is true while the canvas covers the video. */
(function () {
  const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
  const here = document.currentScript ? document.currentScript.src : document.baseURI;
  const MODEL = new URL('effects/selfie_segmenter.tflite', here).href;
  const PIC = id => new URL('effects/bg-' + id + '.jpg', here).href;
  const PHONE = /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));
  const OUT_MAX = PHONE ? 640 : 960;   /* longest side of the picture we draw; phones get a smaller one */
  const SEG_MAX = 256;                 /* longest side of the copy the segmenter looks at (its own input is 256 x 256) */
  const SEG_GAP = PHONE ? 50 : 30;     /* at most 20 masks a second on phones, 33 on computers; frames in between reuse the last mask */
  const SEG_SHARE = 1 / 4;             /* and never more than about a quarter of the page's time: a slow device gets fewer masks, not a slow call */
  /* Blur strength, in pixels of the full-size picture. Meet's "slightly blur" is the lighter one. */
  const BLUR = { blur: 30, slight: 12 };

  /* Safari before 18 has no canvas blur filter, so there the blur comes from shrinking the frame and stretching it back. */
  const FILTER_OK = (() => { try { const c = document.createElement('canvas').getContext('2d'); c.filter = 'blur(2px)'; return c.filter === 'blur(2px)'; } catch (e) { return false; } })();

  let segP = null;
  function softwareGL() {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const name = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '';
      const lose = gl.getExtension('WEBGL_lose_context'); lose && lose.loseContext();
      return /swiftshader|llvmpipe|software|basic render/i.test(name);
    } catch (e) { return true; }
  }
  function segmenter() {
    if (!segP) {
      segP = (async () => {
        const { FilesetResolver, ImageSegmenter } = await import(MP + '/vision_bundle.mjs');
        const files = await FilesetResolver.forVisionTasks(MP + '/wasm');
        const make = delegate => ImageSegmenter.createFromOptions(files, {
          baseOptions: { modelAssetPath: MODEL, delegate }, runningMode: 'VIDEO', outputCategoryMask: false, outputConfidenceMasks: true
        });
        if (window.CAMFX_DELEGATE === 'CPU' || softwareGL()) return make('CPU');   /* WebGL drawn without a graphics chip is slower than the processor */
        try { return await make('GPU'); } catch (e) { return await make('CPU'); }   /* no usable WebGL: the processor does it */
      })();
      segP.catch(() => { segP = null; });   /* offline or blocked: the next try starts over */
    }
    return segP;
  }
  const pics = {};
  function picture(id) {
    if (!pics[id]) {
      pics[id] = new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = PIC(id); });
      pics[id].catch(() => { delete pics[id]; });
    }
    return pics[id];
  }
  const canvas2d = (w, h) => { const c = document.createElement('canvas'); if (w) { c.width = w; c.height = h; } return c; };

  function attach(video, canvas) {
    const out = canvas.getContext('2d');
    const segIn = canvas2d(), segCtx = segIn.getContext('2d');
    const mask = canvas2d(), maskCtx = mask.getContext('2d');
    const me = canvas2d(), meCtx = me.getContext('2d');
    const soft = canvas2d(), softCtx = soft.getContext('2d');   /* the blurred background, drawn small */
    const tiny = canvas2d(), tinyCtx = tiny.getContext('2d');   /* only used without the canvas blur filter */
    let effect = 'none', seg = null, pic = null, gen = 0;
    let running = false, waiting = 0, waitKind = '', lastFrame = 0, lastSeg = -1e9, lastTs = 0, haveMask = false, segCost = 0;
    let level = null, maskPix = null, W = 0, H = 0, vw = 0, vh = 0;

    const api = {
      showing: false,
      stats: { frames: 0, segs: 0, segMs: 0, drawMs: 0 },   /* how much work the effect costs, for checking speed */
      get effect() { return effect; },
      /* Choose an effect. Resolves once it is drawn (or switched off); rejects if the segmenter could not load. */
      async set(id) {
        const my = ++gen;
        effect = id || 'none';
        if (effect === 'none') { stop(); return; }
        const needPic = effect.startsWith('bg:') ? effect.slice(3) : null;
        const [s, p] = await Promise.all([segmenter(), needPic ? picture(needPic) : null]);
        if (my !== gen) return;   /* another choice came in while this one loaded */
        seg = s; pic = p;
        start();
      },
      wake() { if (running && performance.now() - lastFrame > 400) { cancel(); loop(); } },
      stop() { gen++; effect = 'none'; stop(); }
    };

    function show(on) {
      if (api.showing === on) return;
      api.showing = on; canvas.style.visibility = on ? 'visible' : 'hidden';
    }
    function start() { if (!running) { running = true; loop(); } }
    function stop() { running = false; cancel(); haveMask = false; level = null; show(false); }
    function cancel() {
      if (waitKind === 'v' && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(waiting);
      else if (waitKind === 'r') cancelAnimationFrame(waiting);
      waitKind = '';
    }
    /* One step per new camera frame when the browser can tell us (Chrome, Safari 15.4+), otherwise per screen refresh. */
    function loop() {
      if (!running) return;
      if (video.requestVideoFrameCallback) { waitKind = 'v'; waiting = video.requestVideoFrameCallback(step); }
      else { waitKind = 'r'; waiting = requestAnimationFrame(step); }
    }
    function step() {
      waitKind = '';
      if (!running) return;
      loop();
      lastFrame = performance.now();
      if (video.readyState < 2 || !video.videoWidth) return;
      try { draw(); } catch (e) { /* a frame the browser could not read (camera just restarted): try the next one */ }
    }
    function size() {
      if (video.videoWidth === vw && video.videoHeight === vh) return;
      vw = video.videoWidth; vh = video.videoHeight;   /* a phone turned sideways swaps these */
      const k = Math.min(1, OUT_MAX / Math.max(vw, vh));
      W = canvas.width = me.width = Math.round(vw * k); H = canvas.height = me.height = Math.round(vh * k);
      const s = SEG_MAX / Math.max(vw, vh);
      segIn.width = mask.width = Math.round(vw * s); segIn.height = mask.height = Math.round(vh * s);
      maskPix = maskCtx.createImageData(mask.width, mask.height);
      level = null; haveMask = false;
      soft.width = Math.max(1, Math.round(W / 4)); soft.height = Math.max(1, Math.round(H / 4));
    }
    function segment(now) {
      segCtx.drawImage(video, 0, 0, segIn.width, segIn.height);
      const ts = Math.max(now, lastTs + 1); lastTs = ts;   /* the segmenter wants ever-increasing timestamps */
      seg.segmentForVideo(segIn, ts, r => {
        const masks = r.confidenceMasks; if (!masks || !masks.length) return;
        takeMask(masks[masks.length - 1].getAsFloat32Array());   /* the last mask is "person" */
      });
    }
    /* Soften the mask over time (less shimmer at the edges) and sharpen it a little (a clean outline, no ghost halo). */
    function takeMask(f) {
      const n = f.length, px = maskPix.data;
      if (!level || level.length !== n) { level = Float32Array.from(f); }
      for (let i = 0; i < n; i++) {
        const v = level[i] = level[i] * 0.3 + f[i] * 0.7;
        const t = Math.min(1, Math.max(0, (v - 0.3) / 0.45));
        px[i * 4 + 3] = t * t * (3 - 2 * t) * 255;
      }
      maskCtx.putImageData(maskPix, 0, 0);
      haveMask = true;
    }
    function background() {
      if (pic) {   /* the picture fills the frame, cropped like object-fit: cover */
        const k = Math.max(W / pic.naturalWidth, H / pic.naturalHeight), w = pic.naturalWidth * k, h = pic.naturalHeight * k;
        out.drawImage(pic, (W - w) / 2, (H - h) / 2, w, h);
        return;
      }
      const r = (BLUR[effect] || BLUR.blur) * W / 960;
      const sw = soft.width, sh = soft.height;
      if (FILTER_OK) {
        const b = r / 4, pad = Math.ceil(b * 2);   /* drawn a little larger, so the blur does not darken the edges */
        softCtx.filter = `blur(${b}px)`;
        softCtx.drawImage(video, -pad, -pad, sw + pad * 2, sh + pad * 2);
        softCtx.filter = 'none';
      } else {
        const tw = Math.max(2, Math.round(W / (r * 0.6))), th = Math.max(2, Math.round(tw * H / W));
        if (tiny.width !== tw || tiny.height !== th) { tiny.width = tw; tiny.height = th; }
        tinyCtx.drawImage(video, 0, 0, tw, th);
        softCtx.drawImage(tiny, 0, 0, sw, sh);
      }
      out.drawImage(soft, 0, 0, W, H);
    }
    function draw() {
      size();
      const now = performance.now();
      const st = api.stats;
      if (now - lastSeg >= Math.max(SEG_GAP, segCost / SEG_SHARE)) {
        lastSeg = now; segment(now);
        const ms = performance.now() - now;
        segCost = segCost ? segCost * 0.8 + ms * 0.2 : ms;
        st.segs++; st.segMs += ms;
      }
      if (!haveMask) return;
      const t0 = performance.now();   /* until the first mask, your plain video stays in view */
      meCtx.globalCompositeOperation = 'copy';
      meCtx.drawImage(video, 0, 0, W, H);
      meCtx.globalCompositeOperation = 'destination-in';
      meCtx.drawImage(mask, 0, 0, W, H);   /* stretching the small mask smooths its edges */
      out.globalCompositeOperation = 'source-over';
      background();
      out.drawImage(me, 0, 0);
      show(true);
      st.frames++; st.drawMs += performance.now() - t0;
    }
    canvas.style.visibility = 'hidden';
    return api;
  }

  window.CamFx = { attach, preload: () => segmenter().then(() => true, () => false), PHONE };
})();
