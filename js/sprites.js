// Server Valley — 2.5D HD-2D Diorama & Volumetric Character Rendering Engine
// True 3/4 perspective volumetric characters, 3D extruded buildings with side walls,
// raised relief terrain, angled directional sun shadows, and HD-2D lighting.
window.Sprites = (function () {
  const itemCache = {};
  const portraitCache = {};
  const tileCache = {};
  const treeCache = {};
  const shadeCache = {};

  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  function px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  // Smooth rounded rectangle helper for 2.5D volumetric shapes
  function roundRectPath(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }

  function fillRoundRect(ctx, x, y, w, h, r, fill, stroke, lineWidth = 1) {
    roundRectPath(ctx, x, y, w, h, r);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  function fillEllipse(ctx, cx, cy, rx, ry, fill, stroke, lineWidth = 1) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  // Hue-shifting color shader for rich 2.5D materials
  function shadeHex(hex, pct) {
    if (!hex || typeof hex !== 'string' || hex[0] !== '#') return hex || '#888888';
    const key = hex + '_' + pct;
    if (shadeCache[key]) return shadeCache[key];
    let h = hex.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const num = parseInt(h, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    if (pct < 0) {
      const f = 1 + pct;
      r = Math.max(0, Math.round(r * f * 0.94));
      g = Math.max(0, Math.round(g * f * 0.97));
      b = Math.max(0, Math.min(255, Math.round(b * (f + 0.06))));
    } else {
      r = Math.min(255, Math.round(r + (255 - r) * pct * 1.05));
      g = Math.min(255, Math.round(g + (255 - g) * pct));
      b = Math.min(255, Math.round(b + (255 - b) * pct * 0.86));
    }
    const res = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    shadeCache[key] = res;
    return res;
  }

  // ==================== 2.5D VOLUMETRIC CHIBI FIGURINE CHARACTER MODEL ====================
  // Renders a smooth 3D-shaded 2.5D figurine with directional sun lighting,
  // 3/4 depth extrusion, dynamic perspective shadows, and full customizer support.
  function drawCharacter(ctx, x, y, style, dir = 'down', frame = 0, scale = 2, tick = 0) {
    ctx.save();
    const offsetX = scale === 2 ? -4 : 0;
    const offsetY = scale === 2 ? -14 : 0;
    ctx.translate(Math.floor(x + offsetX), Math.floor(y + offsetY));
    ctx.scale(scale, scale);

    const ol = '#23140d';
    const skin = style.skin || '#f6cfa6';
    const skinHi = shadeHex(skin, 0.28);
    const skinSh = shadeHex(skin, -0.18);
    const skinDeep = shadeHex(skin, -0.34);

    const shirt = style.shirt || '#2a7b5f';
    const shirtHi = shadeHex(shirt, 0.30);
    const shirtSh = shadeHex(shirt, -0.26);
    const shirtDeep = shadeHex(shirt, -0.42);
    const shirtStyle = style.shirtStyle || 'jacket';
    const accent = style.accent || '#f5faf5';

    const pants = style.pants || '#2c4969';
    const pantsHi = shadeHex(pants, 0.22);
    const pantsSh = shadeHex(pants, -0.28);

    const shoes = style.shoes || '#5c3317';
    const shoesHi = shadeHex(shoes, 0.32);
    const shoesSh = shadeHex(shoes, -0.32);

    const hair = style.hair || '#2b1b12';
    const hairHi = shadeHex(hair, 0.38);
    const hairSh = shadeHex(hair, -0.28);
    const hairDeep = shadeHex(hair, -0.42);
    const hairStyle = style.hairStyle || 'short';
    const faceStyle = style.faceStyle || (style.glasses ? 'glasses' : 'smile');

    // Smooth 2.5D walk bounce, breathing & 3D limb swing
    const isWalking = frame === 1 || frame === 3;
    const bob = isWalking ? -1.1 : Math.sin(tick / 18) * 0.45;
    const tiltX = dir === 'left' ? -0.6 : dir === 'right' ? 0.6 : 0;
    const by = bob;
    const stride = frame === 1 ? 1 : frame === 3 ? -1 : 0;
    const legL = stride * 1.4;
    const legR = -stride * 1.4;
    const armL = -stride * 1.3;
    const armR = stride * 1.3;
    const blink = (tick % 200) > 192;

    // 1. 2.5D Angled Perspective Ground Shadow + Contact Ambient Occlusion
    ctx.save();
    ctx.translate(10.5, 26.2);
    ctx.rotate(0.12);
    const shGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 7.5);
    shGrad.addColorStop(0, 'rgba(12, 20, 10, 0.48)');
    shGrad.addColorStop(0.65, 'rgba(15, 26, 14, 0.25)');
    shGrad.addColorStop(1, 'rgba(15, 26, 14, 0)');
    fillEllipse(ctx, 0, 0, 7.2 + Math.abs(stride) * 0.6, 2.7, shGrad);
    ctx.restore();
    // Foot contact AO
    fillEllipse(ctx, 7.5, 26.2 + legL * 0.4, 2.3, 0.9, 'rgba(10,16,8,0.34)');
    fillEllipse(ctx, 12.5, 26.2 + legR * 0.4, 2.3, 0.9, 'rgba(10,16,8,0.34)');

    // 2. Back Long Hair & 2.5D Side Backpack Depth (drawn behind torso)
    if (hairStyle === 'long' && dir !== 'up') {
      const bhGrad = ctx.createLinearGradient(3, 8 + by, 17, 19 + by);
      bhGrad.addColorStop(0, hair);
      bhGrad.addColorStop(1, hairDeep);
      fillRoundRect(ctx, 3.2, 8.5 + by, 13.6, 10.5, 4, bhGrad, ol, 0.9);
    }

    if (style.backpack && (dir === 'left' || dir === 'right' || dir === 'down')) {
      const bpX = dir === 'left' ? 12.8 : dir === 'right' ? 3.0 : 4.2;
      const bpW = dir === 'down' ? 11.6 : 4.2;
      const bpGrad = ctx.createLinearGradient(bpX, 13 + by, bpX + bpW, 20 + by);
      bpGrad.addColorStop(0, '#c87d3b');
      bpGrad.addColorStop(1, '#6e3814');
      fillRoundRect(ctx, bpX, 13.5 + by, bpW, 6.2, 2.2, bpGrad, ol, 0.85);
    }

    // 3. 2.5D Volumetric Legs & Extruded 3D Sneakers
    const drawLegAndShoe = (lx, lyOff, isBackLeg) => {
      const scaleDepth = isBackLeg ? 0.93 : 1.0;
      const legY = 19.6 + lyOff;
      // Cylindrical pant leg
      const pGrad = ctx.createLinearGradient(lx, legY, lx + 4.2 * scaleDepth, legY);
      pGrad.addColorStop(0, pantsHi);
      pGrad.addColorStop(0.45, pants);
      pGrad.addColorStop(1, pantsSh);
      fillRoundRect(ctx, lx, legY, 4.2 * scaleDepth, 5.2, 1.6, pGrad, ol, 0.85);

      // 3D Rounded Sneaker with thick extruded sole + toe cap highlight
      const sy = legY + 3.8;
      const sw = 4.8 * scaleDepth;
      const shoeX = lx - 0.3 + (dir === 'left' ? -0.5 : dir === 'right' ? 0.5 : 0);
      // Thick 2.5D rubber sole (bottom)
      fillRoundRect(ctx, shoeX, sy + 1.2, sw, 2.1, 1.1, '#e2e8f0', ol, 0.8);
      // Upper shoe body with 3D gradient
      const sGrad = ctx.createRadialGradient(shoeX + sw * 0.35, sy + 0.6, 0.3, shoeX + sw * 0.5, sy + 1.2, sw);
      sGrad.addColorStop(0, shoesHi);
      sGrad.addColorStop(0.55, shoes);
      sGrad.addColorStop(1, shoesSh);
      fillRoundRect(ctx, shoeX, sy, sw, 2.3, 1.3, sGrad, ol, 0.8);
      // Specular toe shine
      fillEllipse(ctx, shoeX + sw * 0.38, sy + 0.7, 0.9, 0.45, 'rgba(255,255,255,0.45)');
    };

    if (dir === 'left') {
      drawLegAndShoe(8.6, legR * 0.8, true);
      drawLegAndShoe(7.2, legL, false);
    } else if (dir === 'right') {
      drawLegAndShoe(7.2, legL * 0.8, true);
      drawLegAndShoe(8.6, legR, false);
    } else {
      drawLegAndShoe(5.5, legL, legL < 0);
      drawLegAndShoe(10.3, legR, legR < 0);
    }

    // 4. Back Arm (in side views for true 2.5D overlap)
    const drawArm = (ax, ayOff, isBack) => {
      const ay = 13.8 + by + ayOff;
      const aGrad = ctx.createLinearGradient(ax, ay, ax + 2.8, ay + 5);
      aGrad.addColorStop(0, isBack ? shirt : shirtHi);
      aGrad.addColorStop(1, isBack ? shirtDeep : shirtSh);
      fillRoundRect(ctx, ax, ay, 2.7, 4.8, 1.3, aGrad, ol, 0.8);
      // 3D spherical hand
      const hGrad = ctx.createRadialGradient(ax + 1.1, ay + 4.7, 0.2, ax + 1.3, ay + 4.9, 1.6);
      hGrad.addColorStop(0, skinHi);
      hGrad.addColorStop(1, skinSh);
      fillEllipse(ctx, ax + 1.35, ay + 4.9, 1.25, 1.15, hGrad, ol, 0.75);
    };

    if (dir === 'left') drawArm(11.4, armR, true);
    if (dir === 'right') drawArm(5.8, armL, true);

    // 5. 2.5D Cylindrical Torso & Outfit Detailing
    const tx = 5.0 + tiltX * 0.4;
    const ty = 13.0 + by;
    const tw = 10.0;
    const th = 7.4;
    const tGrad = ctx.createLinearGradient(tx, ty, tx + tw, ty + th);
    tGrad.addColorStop(0, shirtHi);
    tGrad.addColorStop(0.45, shirt);
    tGrad.addColorStop(0.85, shirtSh);
    tGrad.addColorStop(1, shirtDeep);
    fillRoundRect(ctx, tx, ty, tw, th, 2.8, tGrad, ol, 0.95);

    // 2.5D Top Shoulder Rim Light & Under-Head Cast Shadow
    fillRoundRect(ctx, tx + 1.2, ty + 0.4, tw - 2.4, 1.3, 0.7, 'rgba(255,255,255,0.22)');

    if (dir !== 'up') {
      const cx = 10.0 + tiltX * 0.9;
      if (shirtStyle === 'jacket') {
        // 3D Open IT Jacket over inner tee + extruded lapels + buckle belt
        const teeGrad = ctx.createLinearGradient(cx - 2, ty, cx + 2, ty + th);
        teeGrad.addColorStop(0, '#ffffff');
        teeGrad.addColorStop(1, '#cbd5e1');
        fillRoundRect(ctx, cx - 1.9, ty + 0.5, 3.8, th - 1.2, 1.0, teeGrad);
        // Lapel shadow lines
        ctx.strokeStyle = shirtDeep;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(cx - 2.0, ty + 0.6); ctx.lineTo(cx - 2.0, ty + th - 1.2);
        ctx.moveTo(cx + 2.0, ty + 0.6); ctx.lineTo(cx + 2.0, ty + th - 1.2);
        ctx.stroke();
        // 3D Leather Belt & Metallic Buckle
        fillRoundRect(ctx, tx + 0.5, ty + th - 1.8, tw - 1.0, 1.4, 0.5, '#3b2110');
        fillRoundRect(ctx, cx - 1.1, ty + th - 1.9, 2.2, 1.5, 0.4, '#fbbf24', '#78350f', 0.4);
      } else if (shirtStyle === 'polo') {
        // 3D Folded White Collar & Button Placket
        fillRoundRect(ctx, cx - 1.1, ty + 0.8, 2.2, 3.8, 0.7, '#f8fafc', shirtSh, 0.5);
        fillEllipse(ctx, cx - 1.3, ty + 1.0, 1.6, 0.9, '#ffffff', ol, 0.55);
        fillEllipse(ctx, cx + 1.3, ty + 1.0, 1.6, 0.9, '#e2e8f0', ol, 0.55);
        fillRoundRect(ctx, tx + 0.5, ty + th - 1.7, tw - 1.0, 1.3, 0.5, '#3b2110');
      } else if (shirtStyle === 'hoodie') {
        // 3D Puffy Kangaroo Pocket + Drawstrings
        fillRoundRect(ctx, cx - 2.8, ty + 3.4, 5.6, 2.8, 1.2, shirtSh, shirtDeep, 0.5);
        ctx.strokeStyle = '#fffdf0';
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(cx - 1.3, ty + 1.2); ctx.lineTo(cx - 1.3, ty + 3.8);
        ctx.moveTo(cx + 1.3, ty + 1.2); ctx.lineTo(cx + 1.3, ty + 3.8);
        ctx.stroke();
      }
    } else if (style.backpack && hairStyle !== 'long') {
      // Full 3D extruded leather backpack on back view
      const bpGrad = ctx.createLinearGradient(5.5, 13.5 + by, 14.5, 20.5 + by);
      bpGrad.addColorStop(0, '#d89b52');
      bpGrad.addColorStop(0.5, '#9c5221');
      bpGrad.addColorStop(1, '#5c2d0c');
      fillRoundRect(ctx, 5.4, 13.6 + by, 9.2, 6.6, 2.0, bpGrad, ol, 0.9);
      fillRoundRect(ctx, 6.4, 14.2 + by, 7.2, 2.6, 1.2, '#e0a963', ol, 0.65);
      fillRoundRect(ctx, 9.1, 16.4 + by, 1.8, 1.4, 0.4, '#ffd54f', '#78350f', 0.4);
    }

    // 6. Front Arms
    if (dir === 'left') {
      drawArm(8.4, armL, false);
    } else if (dir === 'right') {
      drawArm(8.8, armR, false);
    } else {
      drawArm(3.1, armL, false);
      drawArm(14.2, armR, false);
    }

    // 7. 2.5D Neck Cylinder & Cast Head Shadow on Collar
    fillEllipse(ctx, 10.0 + tiltX * 0.5, 13.7 + by, 3.6, 1.3, 'rgba(20, 10, 5, 0.26)');
    fillRoundRect(ctx, 8.3 + tiltX * 0.4, 11.8 + by, 3.4, 2.4, 1.0, skinDeep, ol, 0.7);

    // 8. 2.5D Volumetric Chibi Head Sphere + 3D Ears
    const hx = 10.0 + tiltX * 0.6;
    const hy = 7.7 + by;
    // Left & Right 3D Ears
    if (dir !== 'right') {
      fillEllipse(ctx, hx - 5.9, hy + 0.9, 1.4, 1.7, skin, ol, 0.85);
      fillEllipse(ctx, hx - 5.8, hy + 1.0, 0.65, 0.9, skinSh);
    }
    if (dir !== 'left') {
      fillEllipse(ctx, hx + 5.9, hy + 0.9, 1.4, 1.7, skinSh, ol, 0.85);
      fillEllipse(ctx, hx + 5.8, hy + 1.0, 0.65, 0.9, skinDeep);
    }

    // Main 3D Head Volume with radial directional sunlight from upper-left
    const headGrad = ctx.createRadialGradient(hx - 2.2, hy - 2.4, 1.0, hx + 0.4, hy + 0.6, 7.6);
    headGrad.addColorStop(0, skinHi);
    headGrad.addColorStop(0.55, skin);
    headGrad.addColorStop(0.88, skinSh);
    headGrad.addColorStop(1, skinDeep);
    fillRoundRect(ctx, hx - 5.8, hy - 5.3, 11.6, 11.0, 4.8, headGrad, ol, 1.0);

    // Subtle 2.5D Chin Rim Reflection
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(hx, hy + 1.2, 4.3, 0.25 * Math.PI, 0.75 * Math.PI);
    ctx.stroke();

    // 9. 2.5D Volumetric Hair & Expressive 3D Face
    if (dir === 'up') {
      drawHairBack25D(ctx, hx, hy, by, hair, hairHi, hairSh, hairDeep, hairStyle, style, ol);
    } else {
      // Forehead ambient occlusion shadow cast by bangs
      fillEllipse(ctx, hx, hy - 2.1, 4.9, 1.6, 'rgba(45, 22, 12, 0.22)');

      // Expressive 2.5D Face (Front / 3/4 Side Profile)
      if (dir === 'down') {
        drawFrontFace25D(ctx, hx, hy, faceStyle, blink, style, ol, skinHi, skinSh);
      } else {
        drawSideFace25D(ctx, hx, hy, dir, faceStyle, blink, style, ol, skinHi, skinSh);
      }

      // 3D Sculpted Front/Side Hair + Specular Halo Ring
      drawHairFront25D(ctx, hx, hy, by, dir, hair, hairHi, hairSh, hairDeep, hairStyle, style, ol);
    }

    ctx.restore();
  }

  function drawFrontFace25D(ctx, hx, hy, faceStyle, blink, style, ol, skinHi, skinSh) {
    // Soft airbrushed 2.5D rosy cheek glow
    const blushL = ctx.createRadialGradient(hx - 3.4, hy + 2.0, 0.1, hx - 3.4, hy + 2.0, 1.8);
    blushL.addColorStop(0, 'rgba(244, 102, 122, 0.55)');
    blushL.addColorStop(1, 'rgba(244, 102, 122, 0)');
    fillEllipse(ctx, hx - 3.4, hy + 2.0, 1.8, 1.1, blushL);

    const blushR = ctx.createRadialGradient(hx + 3.4, hy + 2.0, 0.1, hx + 3.4, hy + 2.0, 1.8);
    blushR.addColorStop(0, 'rgba(244, 102, 122, 0.55)');
    blushR.addColorStop(1, 'rgba(244, 102, 122, 0)');
    fillEllipse(ctx, hx + 3.4, hy + 2.0, 1.8, 1.1, blushR);

    // 3D Tiny Nose Bridge Highlight & Shadow Dot
    fillEllipse(ctx, hx - 0.15, hy + 1.0, 0.45, 0.55, skinHi);
    fillEllipse(ctx, hx + 0.2, hy + 1.35, 0.45, 0.35, skinSh);

    const drawGlossyEye = (ex, ey) => {
      // White sclera base
      fillRoundRect(ctx, ex - 1.35, ey - 1.5, 2.7, 3.0, 1.1, '#ffffff', ol, 0.55);
      // 3D Iris gradient
      const iGrad = ctx.createLinearGradient(ex, ey - 1.2, ex, ey + 1.4);
      iGrad.addColorStop(0, '#1e1b4b');
      iGrad.addColorStop(0.55, '#2563eb');
      iGrad.addColorStop(1, '#60a5fa');
      fillRoundRect(ctx, ex - 1.05, ey - 1.2, 2.1, 2.5, 0.9, iGrad);
      // Deep pupil
      fillEllipse(ctx, ex, ey + 0.1, 0.65, 0.75, '#0f172a');
      // Thick upper lash arc
      ctx.strokeStyle = ol;
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.arc(ex, ey - 0.3, 1.3, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      // Dual 2.5D anime specular catchlights!
      fillEllipse(ctx, ex - 0.48, ey - 0.65, 0.52, 0.52, '#ffffff');
      fillEllipse(ctx, ex + 0.45, ey + 0.65, 0.28, 0.28, '#e0f2fe');
    };

    if (faceStyle === 'happy') {
      ctx.strokeStyle = ol;
      ctx.lineWidth = 0.95;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(hx - 2.6, hy + 0.6, 1.3, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(hx + 2.6, hy + 0.6, 1.3, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      // 3D Happy Open Smile
      fillRoundRect(ctx, hx - 1.6, hy + 2.2, 3.2, 1.8, 0.8, '#be123c', ol, 0.6);
      fillRoundRect(ctx, hx - 1.1, hy + 2.2, 2.2, 0.6, 0.2, '#ffffff');
      return;
    }

    if (faceStyle === 'cool') {
      // 3D Aviator / Cyber Sunglasses with metallic frame & glossy lens gradient
      const sgGrad = ctx.createLinearGradient(hx - 4.5, hy - 1.5, hx + 4.5, hy + 1.8);
      sgGrad.addColorStop(0, '#0f172a');
      sgGrad.addColorStop(0.5, '#1e293b');
      sgGrad.addColorStop(1, '#090d16');
      fillRoundRect(ctx, hx - 4.6, hy - 1.2, 4.1, 2.7, 0.9, sgGrad, '#334155', 0.7);
      fillRoundRect(ctx, hx + 0.5, hy - 1.2, 4.1, 2.7, 0.9, sgGrad, '#334155', 0.7);
      // Bridge
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(hx - 0.5, hy - 0.4); ctx.lineTo(hx + 0.5, hy - 0.4);
      ctx.stroke();
      // Diagonal cyan specular reflection
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.85)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(hx - 3.8, hy - 0.6); ctx.lineTo(hx - 2.3, hy + 0.8);
      ctx.moveTo(hx + 1.3, hy - 0.6); ctx.lineTo(hx + 2.8, hy + 0.8);
      ctx.stroke();
      // Confident smirk
      ctx.strokeStyle = '#9f3e2e';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.arc(hx + 0.2, hy + 2.3, 1.5, 0.1 * Math.PI, 0.82 * Math.PI);
      ctx.stroke();
      return;
    }

    if (faceStyle === 'wink') {
      if (!blink) drawGlossyEye(hx - 2.6, hy + 0.1);
      else {
        ctx.strokeStyle = ol; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(hx - 3.8, hy + 0.2); ctx.lineTo(hx - 1.4, hy + 0.2); ctx.stroke();
      }
      // Right winking eye arc
      ctx.strokeStyle = ol;
      ctx.lineWidth = 0.95;
      ctx.beginPath();
      ctx.arc(hx + 2.6, hy + 0.5, 1.3, Math.PI * 1.15, Math.PI * 1.88);
      ctx.stroke();
      // Cute cat-smile
      fillRoundRect(ctx, hx - 1.4, hy + 2.3, 2.8, 1.4, 0.7, '#e11d48', ol, 0.55);
      return;
    }

    // Default 'smile' & 'glasses'
    if (!blink) {
      drawGlossyEye(hx - 2.6, hy + 0.1);
      drawGlossyEye(hx + 2.6, hy + 0.1);
    } else {
      ctx.strokeStyle = ol;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(hx - 3.8, hy + 0.3); ctx.lineTo(hx - 1.4, hy + 0.3);
      ctx.moveTo(hx + 1.4, hy + 0.3); ctx.lineTo(hx + 3.8, hy + 0.3);
      ctx.stroke();
    }

    if (faceStyle === 'glasses' || style.glasses) {
      fillRoundRect(ctx, hx - 4.5, hy - 1.3, 3.8, 2.8, 0.9, 'rgba(125, 211, 252, 0.24)', '#1e293b', 0.75);
      fillRoundRect(ctx, hx + 0.7, hy - 1.3, 3.8, 2.8, 0.9, 'rgba(125, 211, 252, 0.24)', '#1e293b', 0.75);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(hx - 0.7, hy - 0.1); ctx.lineTo(hx + 0.7, hy - 0.1);
      ctx.stroke();
      fillEllipse(ctx, hx - 3.7, hy - 0.6, 0.45, 0.35, 'rgba(255,255,255,0.75)');
      fillEllipse(ctx, hx + 1.5, hy - 0.6, 0.45, 0.35, 'rgba(255,255,255,0.75)');
    }

    if (style.beard) {
      const bGrad = ctx.createLinearGradient(hx, hy + 1.8, hx, hy + 5.2);
      bGrad.addColorStop(0, style.beard);
      bGrad.addColorStop(1, shadeHex(style.beard, -0.28));
      fillRoundRect(ctx, hx - 3.8, hy + 2.1, 7.6, 2.9, 1.4, bGrad, ol, 0.65);
    } else {
      ctx.strokeStyle = '#b85644';
      ctx.lineWidth = 0.9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(hx, hy + 2.1, 1.5, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }
  }

  function drawSideFace25D(ctx, hx, hy, dir, faceStyle, blink, style, ol, skinHi, skinSh) {
    const sign = dir === 'left' ? -1 : 1;
    const ex = hx + sign * 2.5;
    const ey = hy + 0.1;

    // 3D Protruding Chibi Nose on profile edge
    fillEllipse(ctx, hx + sign * 5.5, hy + 0.9, 0.9, 0.75, skinHi, ol, 0.65);
    // Cheek blush
    fillEllipse(ctx, hx + sign * 1.8, hy + 2.0, 1.5, 0.9, 'rgba(244, 102, 122, 0.45)');

    if (faceStyle === 'cool') {
      fillRoundRect(ctx, ex - 1.8, ey - 1.2, 3.6, 2.5, 0.8, '#0f172a', '#334155', 0.7);
      fillEllipse(ctx, ex, ey - 0.4, 0.7, 0.35, '#7dd3fc');
    } else if (!blink && faceStyle !== 'happy') {
      fillRoundRect(ctx, ex - 1.1, ey - 1.4, 2.2, 2.8, 0.9, '#ffffff', ol, 0.55);
      fillRoundRect(ctx, ex - 0.85 + sign * 0.2, ey - 1.1, 1.7, 2.3, 0.75, '#2563eb');
      fillEllipse(ctx, ex + sign * 0.2, ey, 0.55, 0.65, '#0f172a');
      fillEllipse(ctx, ex + sign * 0.35, ey - 0.6, 0.45, 0.45, '#ffffff');
    } else {
      ctx.strokeStyle = ol;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(ex, ey + 0.3, 1.1, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }

    if (faceStyle === 'glasses' || style.glasses) {
      fillRoundRect(ctx, ex - 1.8, ey - 1.3, 3.6, 2.7, 0.8, 'rgba(125, 211, 252, 0.26)', '#1e293b', 0.75);
    }

    if (style.beard) {
      fillRoundRect(ctx, hx + (sign < 0 ? -4.8 : 0.2), hy + 2.0, 4.6, 2.7, 1.2, style.beard, ol, 0.6);
    } else {
      ctx.strokeStyle = '#b85644';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(hx + sign * 2.2, hy + 2.8);
      ctx.lineTo(hx + sign * 3.8, hy + 2.6);
      ctx.stroke();
    }
  }

  function drawHairFront25D(ctx, hx, hy, by, dir, hair, hairHi, hairSh, hairDeep, hairStyle, style, ol) {
    // 3D Volumetric Hair Dome with radial anisotropic sheen
    const hGrad = ctx.createRadialGradient(hx - 2.2, hy - 5.2, 0.8, hx, hy - 2.0, 7.8);
    hGrad.addColorStop(0, hairHi);
    hGrad.addColorStop(0.45, hair);
    hGrad.addColorStop(0.85, hairSh);
    hGrad.addColorStop(1, hairDeep);

    // Base crown cap
    ctx.beginPath();
    ctx.arc(hx, hy - 1.4, 6.2, Math.PI * 0.92, Math.PI * 2.08);
    ctx.closePath();
    ctx.fillStyle = hGrad;
    ctx.fill();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 0.95;
    ctx.stroke();

    // Sculpted 3D Bang Strands across forehead
    const drawLock = (lx, ly, lw, lh, rot = 0) => {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(rot);
      fillEllipse(ctx, 0, 0, lw, lh, hGrad, ol, 0.75);
      ctx.restore();
    };

    drawLock(hx - 3.2, hy - 2.8, 2.2, 1.8, -0.25);
    drawLock(hx - 0.4, hy - 3.0, 2.4, 1.9, 0.05);
    drawLock(hx + 2.7, hy - 2.8, 2.2, 1.8, 0.25);

    // Hairstyle-specific 3D volumes
    if (hairStyle === 'spiky' && !style.hat) {
      const spikes = [
        [hx - 4.2, hy - 5.5, -0.45],
        [hx - 1.5, hy - 6.6, -0.15],
        [hx + 1.4, hy - 6.5, 0.18],
        [hx + 4.1, hy - 5.3, 0.48]
      ];
      spikes.forEach(([sx, sy, ang]) => {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(-1.8, 2.2);
        ctx.quadraticCurveTo(0, -2.4, 1.8, 2.2);
        ctx.closePath();
        ctx.fillStyle = hGrad;
        ctx.fill();
        ctx.strokeStyle = ol;
        ctx.lineWidth = 0.85;
        ctx.stroke();
        ctx.restore();
      });
    } else if (hairStyle === 'bob') {
      fillRoundRect(ctx, hx - 6.6, hy - 2.8, 2.6, 7.6, 1.3, hGrad, ol, 0.85);
      fillRoundRect(ctx, hx + 4.0, hy - 2.8, 2.6, 7.6, 1.3, hGrad, ol, 0.85);
    } else if (hairStyle === 'long') {
      fillRoundRect(ctx, hx - 6.7, hy - 2.8, 2.5, 9.5, 1.2, hGrad, ol, 0.85);
      fillRoundRect(ctx, hx + 4.2, hy - 2.8, 2.5, 9.5, 1.2, hGrad, ol, 0.85);
    } else if (hairStyle === 'curly') {
      const puffs = [
        [hx - 5.4, hy - 2.5, 2.1], [hx + 5.4, hy - 2.5, 2.1],
        [hx - 4.0, hy - 5.3, 2.2], [hx + 4.0, hy - 5.3, 2.2],
        [hx, hy - 6.0, 2.4], [hx - 5.6, hy + 0.5, 1.8], [hx + 5.6, hy + 0.5, 1.8]
      ];
      puffs.forEach(([px0, py0, pr]) => fillEllipse(ctx, px0, py0, pr, pr * 0.92, hGrad, ol, 0.75));
    } else {
      // 'short' or 'ponytail' neat sideburns
      fillRoundRect(ctx, hx - 6.1, hy - 2.6, 1.8, 4.4, 0.9, hGrad, ol, 0.75);
      fillRoundRect(ctx, hx + 4.3, hy - 2.6, 1.8, 4.4, 0.9, hGrad, ol, 0.75);
    }

    if (hairStyle === 'ponytail') {
      const ptX = dir === 'left' ? hx + 6.4 : dir === 'right' ? hx - 6.4 : hx + 5.4;
      fillEllipse(ctx, ptX + (dir === 'right' ? 1.0 : -1.0), hy - 1.2, 1.2, 1.2, '#fb7185', ol, 0.65);
      fillEllipse(ctx, ptX, hy + 1.4, 2.1, 3.4, hGrad, ol, 0.85);
    }

    // Glossy 2.5D Anisotropic Hair Angel-Ring Sheen
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.lineWidth = 1.15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(hx - 0.3, hy - 1.8, 4.4, Math.PI * 1.18, Math.PI * 1.78);
    ctx.stroke();

    if (style.hat) {
      drawHat25D(ctx, hx, hy, style.hat, style.hatTrim, ol, dir);
    }
  }

  function drawHairBack25D(ctx, hx, hy, by, hair, hairHi, hairSh, hairDeep, hairStyle, style, ol) {
    const hGrad = ctx.createRadialGradient(hx - 2.0, hy - 4.0, 1.0, hx, hy, 8.0);
    hGrad.addColorStop(0, hairHi);
    hGrad.addColorStop(0.5, hair);
    hGrad.addColorStop(0.88, hairSh);
    hGrad.addColorStop(1, hairDeep);

    fillRoundRect(ctx, hx - 6.0, hy - 5.6, 12.0, 10.8, 4.8, hGrad, ol, 1.0);

    if (hairStyle === 'long') {
      fillRoundRect(ctx, hx - 6.4, hy - 1.0, 12.8, 12.2, 4.2, hGrad, ol, 0.95);
    } else if (hairStyle === 'bob') {
      fillRoundRect(ctx, hx - 6.4, hy - 2.0, 12.8, 8.2, 3.8, hGrad, ol, 0.95);
    } else if (hairStyle === 'ponytail') {
      fillEllipse(ctx, hx, hy + 0.5, 1.6, 1.1, '#fb7185', ol, 0.7);
      fillRoundRect(ctx, hx - 2.4, hy + 1.2, 4.8, 7.2, 2.2, hGrad, ol, 0.9);
    } else if (hairStyle === 'curly') {
      const puffs = [
        [hx - 4.5, hy - 2.0, 2.4], [hx + 4.5, hy - 2.0, 2.4],
        [hx, hy - 4.8, 2.8], [hx - 3.5, hy + 2.2, 2.4], [hx + 3.5, hy + 2.2, 2.4], [hx, hy + 2.6, 2.6]
      ];
      puffs.forEach(([px0, py0, pr]) => fillEllipse(ctx, px0, py0, pr, pr, hGrad, ol, 0.75));
    }

    // Specular sheen arc on back of hair
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
    ctx.lineWidth = 1.15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(hx, hy - 1.2, 4.3, Math.PI * 1.15, Math.PI * 1.82);
    ctx.stroke();

    if (style.hat) {
      drawHat25D(ctx, hx, hy, style.hat, style.hatTrim, ol, 'up');
    }
  }

  function drawHat25D(ctx, hx, hy, hatColor, trimColor, ol, dir) {
    const hatHi = shadeHex(hatColor, 0.32);
    const hatSh = shadeHex(hatColor, -0.28);
    const hGrad = ctx.createRadialGradient(hx - 2, hy - 6, 0.5, hx, hy - 4, 7);
    hGrad.addColorStop(0, hatHi);
    hGrad.addColorStop(0.6, hatColor);
    hGrad.addColorStop(1, hatSh);

    // 3D Rounded Cap Dome
    ctx.beginPath();
    ctx.arc(hx, hy - 2.8, 6.2, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = hGrad;
    ctx.fill();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // Extruded 2.5D Brim Visor
    const brimX = dir === 'left' ? hx - 7.4 : dir === 'right' ? hx - 5.4 : hx - 6.6;
    fillRoundRect(ctx, brimX, hy - 3.8, 13.2, 2.1, 1.0, trimColor || '#ffd166', ol, 0.85);
    if (dir !== 'up') {
      fillRoundRect(ctx, hx - 1.3, hy - 5.9, 2.6, 1.7, 0.5, '#fffbeb', ol, 0.5);
    }
  }

  // ==================== 2.5D DIORAMA PORTRAIT (48x48) ====================
  function getPortrait(key, style) {
    if (portraitCache[key]) return portraitCache[key];
    const c = makeCanvas(48, 48);
    const ctx = c.getContext('2d');

    // 2.5D Atmospheric Sky Gradient + Depth-of-Field Hills + Sunlit Horizon
    const sky = ctx.createLinearGradient(0, 0, 0, 34);
    sky.addColorStop(0, '#38bdf8');
    sky.addColorStop(0.6, '#bae6fd');
    sky.addColorStop(1, '#fef9c3');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 48, 36);

    // Soft glowing sun orb
    fillEllipse(ctx, 10, 10, 6, 6, 'rgba(255, 251, 235, 0.65)');
    fillEllipse(ctx, 10, 10, 3.5, 3.5, '#fffbeb');

    // Layered 2.5D rolling valley hills
    fillEllipse(ctx, 12, 34, 20, 9, '#4d9c68');
    fillEllipse(ctx, 38, 33, 22, 10, '#3b8254');

    // 2.5D Foreground grass terrace with rim highlight
    const ground = ctx.createLinearGradient(0, 33, 0, 48);
    ground.addColorStop(0, '#86efac');
    ground.addColorStop(0.2, '#4ade80');
    ground.addColorStop(1, '#15803d');
    ctx.fillStyle = ground;
    ctx.fillRect(0, 34, 48, 14);

    // Draw zoomed 2.5D bust-up character
    drawCharacter(ctx, 8, 20, style, 'down', 0, 2, 0);
    portraitCache[key] = c;
    return c;
  }

  // ==================== 2.5D ITEM ICONS ====================
  function getItemIcon(itemId) {
    if (itemCache[itemId]) return itemCache[itemId];
    const c = makeCanvas(32, 32);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.scale(2, 2);
    const ol = '#26170e';

    // Subtle 2.5D drop shadow under every icon
    fillEllipse(ctx, 8, 14.2, 5.5, 1.5, 'rgba(0,0,0,0.22)');

    switch (itemId) {
      case 'lan_cable':
        px(ctx, 2, 4, 12, 9, ol);
        px(ctx, 3, 5, 10, 7, '#1d5bbf');
        px(ctx, 4, 6, 8, 5, '#3b8df5');
        px(ctx, 5, 7, 6, 3, '#102f63');
        px(ctx, 5, 2, 4, 4, ol); px(ctx, 6, 3, 2, 2, '#ffd54f');
        px(ctx, 8, 11, 4, 4, ol); px(ctx, 9, 12, 2, 2, '#ffd54f');
        break;
      case 'iso_usb':
        px(ctx, 4, 1, 8, 5, ol); px(ctx, 5, 2, 6, 4, '#cfd8dc');
        px(ctx, 6, 3, 1, 2, '#546e7a'); px(ctx, 9, 3, 1, 2, '#546e7a');
        px(ctx, 3, 5, 10, 10, ol); px(ctx, 4, 6, 8, 8, '#d84315');
        px(ctx, 5, 6, 6, 7, '#ff9800'); px(ctx, 6, 8, 4, 4, '#fff8e1'); px(ctx, 7, 9, 2, 2, '#e65100');
        break;
      case 'cli_wrench':
        px(ctx, 1, 2, 14, 12, ol); px(ctx, 2, 3, 12, 10, '#37474f');
        px(ctx, 3, 4, 10, 8, '#0b1820');
        px(ctx, 4, 6, 2, 1, '#69f0ae'); px(ctx, 6, 7, 2, 1, '#69f0ae');
        px(ctx, 4, 8, 2, 1, '#69f0ae'); px(ctx, 8, 9, 4, 1, '#5ce1e6');
        px(ctx, 2, 13, 12, 1, '#90a4ae');
        break;
      case 'ssh_key':
        px(ctx, 2, 4, 7, 7, ol); px(ctx, 3, 5, 5, 5, '#f0b429');
        px(ctx, 4, 6, 3, 3, '#fff6cc'); px(ctx, 5, 7, 1, 1, '#8c5500');
        px(ctx, 8, 6, 7, 4, ol); px(ctx, 8, 7, 6, 2, '#ffd54f');
        px(ctx, 11, 9, 1, 3, '#d49000'); px(ctx, 13, 9, 1, 2, '#d49000');
        break;
      case 'port_scanner':
      case 'log_lens':
        px(ctx, 2, 1, 9, 9, ol); px(ctx, 3, 2, 7, 7, '#0288d1');
        px(ctx, 4, 3, 5, 5, '#80e5ff'); px(ctx, 5, 4, 2, 2, '#ffffff');
        px(ctx, 9, 8, 2, 2, ol); px(ctx, 10, 9, 4, 4, '#6d4c41'); px(ctx, 11, 10, 3, 3, '#4e342e');
        break;
      case 'config_scroll':
        px(ctx, 2, 1, 12, 14, ol); px(ctx, 3, 2, 10, 12, '#f7dfb1');
        px(ctx, 2, 2, 12, 2, '#a66329'); px(ctx, 2, 12, 12, 2, '#a66329');
        px(ctx, 5, 5, 6, 1, '#5a3214'); px(ctx, 5, 7, 5, 1, '#1d6fa5'); px(ctx, 5, 9, 6, 1, '#2e8b57');
        break;
      case 'ufw_shield':
        px(ctx, 2, 1, 12, 10, ol); px(ctx, 4, 11, 8, 3, ol);
        px(ctx, 3, 2, 10, 8, '#d84315'); px(ctx, 5, 10, 6, 3, '#bf360c');
        px(ctx, 5, 4, 6, 5, '#ffca28'); px(ctx, 6, 5, 4, 3, '#fff59d'); px(ctx, 7, 6, 2, 3, '#ff5722');
        break;
      case 'admin_coffee':
        px(ctx, 5, 1, 1, 2, '#ffffff'); px(ctx, 9, 1, 1, 2, '#ffffff');
        px(ctx, 3, 4, 9, 10, ol); px(ctx, 4, 5, 7, 8, '#f5f5f5');
        px(ctx, 5, 6, 5, 6, '#6d4c41'); px(ctx, 5, 6, 5, 2, '#3e2723');
        px(ctx, 11, 6, 3, 5, ol); px(ctx, 11, 7, 2, 3, '#e0e0e0'); px(ctx, 11, 8, 1, 1, '#6d4c41');
        break;
      case 'packet_kit':
        px(ctx, 2, 4, 12, 9, ol); px(ctx, 3, 5, 10, 7, '#d98a36');
        px(ctx, 4, 6, 8, 4, '#f5b867'); px(ctx, 5, 6, 2, 2, '#fff0c4'); px(ctx, 9, 6, 2, 2, '#fff0c4');
        break;
      case 'win_license':
        px(ctx, 1, 1, 14, 14, ol); px(ctx, 2, 2, 12, 12, '#1e3a8a');
        px(ctx, 3, 3, 4, 4, '#38bdf8'); px(ctx, 9, 3, 4, 4, '#60a5fa');
        px(ctx, 3, 9, 4, 4, '#60a5fa'); px(ctx, 9, 9, 4, 4, '#93c5fd');
        break;
      case 'raid_toolkit':
        px(ctx, 1, 2, 14, 12, ol); px(ctx, 2, 3, 12, 5, '#455a64');
        px(ctx, 3, 4, 10, 3, '#78909c'); px(ctx, 11, 5, 2, 1, '#69f0ae');
        px(ctx, 2, 9, 12, 4, '#37474f'); px(ctx, 3, 10, 10, 2, '#607d8b'); px(ctx, 11, 10, 2, 1, '#40c4ff');
        break;
      case 'mail_key':
        px(ctx, 1, 3, 14, 11, ol); px(ctx, 2, 4, 12, 9, '#f8fafc');
        px(ctx, 3, 5, 2, 2, '#e53935'); px(ctx, 5, 7, 2, 2, '#e53935');
        px(ctx, 7, 8, 2, 2, '#e53935'); px(ctx, 9, 7, 2, 2, '#e53935'); px(ctx, 11, 5, 2, 2, '#e53935');
        break;
      default:
        px(ctx, 6, 2, 4, 12, '#ffd54f'); px(ctx, 2, 6, 12, 4, '#ffd54f'); px(ctx, 5, 5, 6, 6, '#ffab00');
        break;
    }

    itemCache[itemId] = c;
    return c;
  }

  // ==================== 2.5D EXTRUDED TERRAIN & RELIEF GROUND RENDERER ====================
  function getStaticTileVariant(type, variant) {
    const key = '25d_' + type + '_' + variant;
    if (tileCache[key]) return tileCache[key];
    const c = makeCanvas(32, 32);
    const ctx = c.getContext('2d');

    if (type === 'grass') {
      // Rich 2.5D directional meadow gradient per tile
      const gGrad = ctx.createLinearGradient(0, 0, 32, 32);
      gGrad.addColorStop(0, variant % 2 === 0 ? '#74bf54' : '#6eb84f');
      gGrad.addColorStop(1, variant % 2 === 0 ? '#5b9e3f' : '#56963b');
      ctx.fillStyle = gGrad;
      ctx.fillRect(0, 0, 32, 32);

      // Soft 2.5D ground undulation mound highlight
      fillEllipse(ctx, 14, 14, 12, 8, 'rgba(163, 230, 112, 0.16)');

      // 3D Vertical Grass Blades & 3D Wildflowers with drop shadows
      const drawBladeTuft = (bx, by) => {
        fillEllipse(ctx, bx + 3, by + 4, 4, 1.4, 'rgba(20, 45, 15, 0.24)');
        ctx.strokeStyle = '#3b7326';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(bx, by + 3); ctx.quadraticCurveTo(bx - 2, by - 2, bx - 3, by - 4);
        ctx.moveTo(bx + 3, by + 4); ctx.quadraticCurveTo(bx + 3, by - 2, bx + 4, by - 5);
        ctx.moveTo(bx + 6, by + 3); ctx.quadraticCurveTo(bx + 8, by - 1, bx + 9, by - 3);
        ctx.stroke();
        ctx.strokeStyle = '#9be870';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(bx + 3, by + 3); ctx.lineTo(bx + 4, by - 4);
        ctx.stroke();
      };

      if (variant === 0) {
        drawBladeTuft(7, 11);
        drawBladeTuft(20, 24);
      } else if (variant === 1) {
        drawBladeTuft(18, 10);
        drawBladeTuft(8, 25);
      } else if (variant === 2) {
        drawBladeTuft(12, 18);
      } else if (variant === 3) {
        // 3D Blooming Daisy & Buttercup with ground shadows
        drawBladeTuft(8, 22);
        fillEllipse(ctx, 22, 14, 3.8, 1.6, 'rgba(15, 35, 12, 0.30)');
        fillEllipse(ctx, 21.5, 11.5, 3.4, 2.8, '#ffffff');
        fillEllipse(ctx, 21.5, 11.3, 1.6, 1.4, '#f59e0b');
      } else if (variant === 4) {
        // 3D Pink Valley Blossom
        fillEllipse(ctx, 19, 21, 3.8, 1.6, 'rgba(15, 35, 12, 0.30)');
        fillEllipse(ctx, 18.5, 18.5, 3.4, 2.8, '#fda4af');
        fillEllipse(ctx, 18.5, 18.3, 1.5, 1.3, '#fef08a');
        drawBladeTuft(8, 11);
      } else {
        // 3D Mossy Pebble on grass
        fillEllipse(ctx, 21, 23, 4.5, 2.0, 'rgba(12, 28, 10, 0.32)');
        const pGrad = ctx.createRadialGradient(19, 20, 0.5, 20, 21, 4.5);
        pGrad.addColorStop(0, '#cbd5e1');
        pGrad.addColorStop(0.6, '#94a3b8');
        pGrad.addColorStop(1, '#475569');
        fillEllipse(ctx, 20, 21.2, 3.8, 2.5, pGrad, '#334155', 0.6);
      }
    } else if (type === 'path') {
      // 2.5D Warm Sandstone Dirt Path with embedded 3D stepping pebbles
      const pGrad = ctx.createLinearGradient(0, 0, 0, 32);
      pGrad.addColorStop(0, '#e3be82');
      pGrad.addColorStop(0.5, '#d6ad6f');
      pGrad.addColorStop(1, '#c79c5c');
      ctx.fillStyle = pGrad;
      ctx.fillRect(0, 0, 32, 32);

      // Subtle 3D sunken wheel/foot texture + raised pebbles
      fillEllipse(ctx, 9, 10, 4, 2.2, 'rgba(145, 98, 42, 0.25)');
      fillEllipse(ctx, 8.5, 9.2, 3.4, 1.8, '#edd2a4');
      fillEllipse(ctx, 23, 22, 4.5, 2.4, 'rgba(145, 98, 42, 0.25)');
      fillEllipse(ctx, 22.5, 21.2, 3.8, 1.9, '#e8c892');
      if (variant % 2 === 0) {
        fillEllipse(ctx, 16, 16, 5.2, 3.0, 'rgba(130, 86, 34, 0.24)');
        fillEllipse(ctx, 15.5, 15.2, 4.6, 2.5, '#ebd0a0');
      }
    } else if (type === 'stone') {
      // 2.5D Extruded 3D Cobblestone Plaza Tiles (each stone has top bevel, gradient & deep crevice shadow!)
      ctx.fillStyle = '#57534e';
      ctx.fillRect(0, 0, 32, 32);
      const stones = [
        [1, 1, 14, 13], [16, 1, 15, 13],
        [1, 16, 15, 14], [17, 16, 14, 14]
      ];
      stones.forEach(([sx, sy, sw, sh], idx) => {
        // Bottom 3D extrusion thickness
        fillRoundRect(ctx, sx, sy + 1.5, sw, sh, 3.2, '#44403c');
        const stGrad = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
        stGrad.addColorStop(0, (idx + variant) % 2 === 0 ? '#e7e5e4' : '#d6d3d1');
        stGrad.addColorStop(0.6, (idx + variant) % 2 === 0 ? '#bfb9b2' : '#b5afa8');
        stGrad.addColorStop(1, '#968f87');
        fillRoundRect(ctx, sx, sy, sw, sh - 1, 3.2, stGrad, '#57534e', 0.7);
        // Top-left specular bevel edge
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(sx + 2.5, sy + 1.2);
        ctx.lineTo(sx + sw - 3, sy + 1.2);
        ctx.stroke();
      });
    } else if (type === 'soil') {
      // 2.5D Raised Timber Planter Box with 3D Lush Crops!
      ctx.drawImage(getStaticTileVariant('grass', 0), 0, 0);
      // Angled planter shadow
      fillRoundRect(ctx, 3, 5, 28, 26, 3, 'rgba(15, 28, 10, 0.35)');
      // 3D Vertical Wood Planter Front Wall (extruded 4px)
      fillRoundRect(ctx, 2, 3, 28, 26, 3, '#5c3419', '#2b1608', 1.0);
      // Rich dark soil bed inside
      const sGrad = ctx.createLinearGradient(4, 4, 4, 24);
      sGrad.addColorStop(0, '#5c3114');
      sGrad.addColorStop(1, '#7c4722');
      fillRoundRect(ctx, 4, 4, 24, 21, 2, sGrad);
      // 3D Raised soil furrows
      fillRoundRect(ctx, 5, 7, 22, 5, 2, '#94582c');
      fillRoundRect(ctx, 5, 15, 22, 5, 2, '#94582c');
      // 3D Volumetric Sprouting Crops with drop shadows
      const drawCrop = (cx, cy, hasFruit) => {
        fillEllipse(ctx, cx + 1, cy + 3, 4.5, 2.0, 'rgba(20, 10, 4, 0.42)');
        const leafGrad = ctx.createRadialGradient(cx - 1, cy - 2, 0.5, cx, cy, 5);
        leafGrad.addColorStop(0, '#bef264');
        leafGrad.addColorStop(0.55, '#4ade80');
        leafGrad.addColorStop(1, '#15803d');
        fillEllipse(ctx, cx - 2.2, cy, 3.2, 2.2, leafGrad, '#14532d', 0.6);
        fillEllipse(ctx, cx + 2.2, cy, 3.2, 2.2, leafGrad, '#14532d', 0.6);
        fillEllipse(ctx, cx, cy - 1.8, 2.8, 2.4, leafGrad, '#14532d', 0.6);
        if (hasFruit) {
          fillEllipse(ctx, cx + 1.5, cy + 0.8, 2.0, 2.0, '#ef4444', '#7f1d1d', 0.5);
          fillEllipse(ctx, cx + 1.0, cy + 0.2, 0.6, 0.5, '#fecaca');
        }
      };
      drawCrop(10, 9, variant % 2 === 0);
      drawCrop(21, 17, variant % 2 === 1);
    } else if (type === 'fence') {
      ctx.drawImage(getStaticTileVariant('grass', 0), 0, 0);
      // 2.5D Angled Fence Ground Shadow
      ctx.fillStyle = 'rgba(14, 28, 10, 0.34)';
      ctx.fillRect(2, 24, 28, 5);
      // 3D Horizontal Timber Rails with top highlight & bottom shadow
      fillRoundRect(ctx, 0, 11, 32, 5, 1.5, '#b46934', '#3d200d', 1.0);
      fillRoundRect(ctx, 0, 19, 32, 5, 1.5, '#9c5727', '#3d200d', 1.0);
      // 3D Cylindrical Vertical Fence Posts with domed caps
      [3, 21].forEach((px0) => {
        const pGrad = ctx.createLinearGradient(px0, 5, px0 + 8, 5);
        pGrad.addColorStop(0, '#e09a5c');
        pGrad.addColorStop(0.5, '#b86d35');
        pGrad.addColorStop(1, '#753f17');
        fillRoundRect(ctx, px0, 6, 8, 22, 2.5, pGrad, '#3b1e0b', 1.0);
        fillEllipse(ctx, px0 + 4, 7.2, 3.6, 1.8, '#f2b880', '#3b1e0b', 0.7);
      });
    }

    tileCache[key] = c;
    return c;
  }

  function drawTile(ctx, type, gx, gy, wx, wy, tick, grid) {
    const hash = ((gx * 73856093) ^ (gy * 19349663)) >>> 0;

    if (type === 'water') {
      // 2.5D Deep Recessed Water Basin with depth gradient & animated caustic light
      const wGrad = ctx.createLinearGradient(wx, wy, wx + 32, wy + 32);
      wGrad.addColorStop(0, '#0284c7');
      wGrad.addColorStop(0.5, '#0369a1');
      wGrad.addColorStop(1, '#075985');
      ctx.fillStyle = wGrad;
      ctx.fillRect(wx, wy, 32, 32);

      const wave = Math.sin(tick / 14 + gx * 0.7 + gy * 0.5);
      // Animated 2.5D water surface caustics & specular ripples
      fillEllipse(ctx, wx + 12 + wave * 3, wy + 10, 6, 1.4, 'rgba(125, 211, 252, 0.45)');
      fillEllipse(ctx, wx + 21 - wave * 2.5, wy + 23, 7, 1.5, 'rgba(186, 230, 253, 0.40)');
      if (wave > 0.2) {
        fillEllipse(ctx, wx + 12 + wave * 3, wy + 9.8, 2.5, 0.7, 'rgba(255, 255, 255, 0.75)');
      }

      // 2.5D Extruded 3D Cliff / Shoreline Embankment Wall!
      // When land is NORTH of water, we see the vertical 3D earth cliff wall dropping into the water!
      if (grid) {
        const up = gy > 0 && grid[gy - 1][gx] !== 'water' && grid[gy - 1][gx] !== 'bridge';
        const dn = gy < grid.length - 1 && grid[gy + 1][gx] !== 'water' && grid[gy + 1][gx] !== 'bridge';
        const lt = gx > 0 && grid[gy][gx - 1] !== 'water' && grid[gy][gx - 1] !== 'bridge';
        const rt = gx < grid[0].length - 1 && grid[gy][gx + 1] !== 'water' && grid[gy][gx + 1] !== 'bridge';

        if (up) {
          // 3D Extruded Vertical Cliff Face (10px deep!)
          const cliffGrad = ctx.createLinearGradient(wx, wy, wx, wy + 11);
          cliffGrad.addColorStop(0, '#a37c4c');
          cliffGrad.addColorStop(0.35, '#78552f');
          cliffGrad.addColorStop(1, '#3e2914');
          ctx.fillStyle = cliffGrad;
          ctx.fillRect(wx, wy, 32, 10);
          // Grass overhang lip at top of cliff
          ctx.fillStyle = '#4d9136';
          ctx.fillRect(wx, wy, 32, 2.5);
          // Animated 2.5D shoreline foam lapping against the base of the cliff wall
          ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
          ctx.fillRect(wx + 1, wy + 10 + Math.round(wave), 30, 2);
          // Deep underwater shadow below cliff
          ctx.fillStyle = 'rgba(7, 32, 56, 0.35)';
          ctx.fillRect(wx, wy + 12, 32, 5);
        }
        if (dn) {
          ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
          ctx.fillRect(wx + 2, wy + 27, 28, 2);
          ctx.fillStyle = '#5c4024';
          ctx.fillRect(wx, wy + 29, 32, 3);
        }
        if (lt) {
          const sideCliff = ctx.createLinearGradient(wx, wy, wx + 7, wy);
          sideCliff.addColorStop(0, '#78552f');
          sideCliff.addColorStop(1, '#3e2914');
          ctx.fillStyle = sideCliff;
          ctx.fillRect(wx, wy, 6, 32);
          ctx.fillStyle = 'rgba(224, 242, 254, 0.6)';
          ctx.fillRect(wx + 6, wy + 2, 2, 28);
        }
        if (rt) {
          ctx.fillStyle = '#5c4024';
          ctx.fillRect(wx + 27, wy, 5, 32);
          ctx.fillStyle = 'rgba(224, 242, 254, 0.6)';
          ctx.fillRect(wx + 25, wy + 2, 2, 28);
        }
      }

      // 3D Floating Lily Pad with underwater drop shadow & lotus flower
      if (hash % 13 === 0) {
        fillEllipse(ctx, wx + 16, wy + 19, 7.5, 4.8, 'rgba(4, 24, 42, 0.42)');
        const lpGrad = ctx.createRadialGradient(wx + 14, wy + 15, 1, wx + 15, wy + 16, 7);
        lpGrad.addColorStop(0, '#86efac');
        lpGrad.addColorStop(0.7, '#22c55e');
        lpGrad.addColorStop(1, '#15803d');
        fillEllipse(ctx, wx + 15, wy + 16, 7, 4.5, lpGrad, '#14532d', 0.7);
        if (hash % 26 === 0) {
          fillEllipse(ctx, wx + 15, wy + 14.5, 3.2, 2.2, '#fda4af', '#9f1239', 0.5);
          fillEllipse(ctx, wx + 15, wy + 14.3, 1.2, 0.9, '#fef08a');
        }
      }
      return;
    }

    if (type === 'bridge') {
      // 2.5D Elevated 3D Timber Bridge with water below, cast shadow, side thickness & railings!
      const wGrad = ctx.createLinearGradient(wx, wy, wx, wy + 32);
      wGrad.addColorStop(0, '#0369a1');
      wGrad.addColorStop(1, '#075985');
      ctx.fillStyle = wGrad;
      ctx.fillRect(wx, wy, 32, 32);

      // Bridge shadow on water + vertical timber support pilings
      ctx.fillStyle = 'rgba(3, 18, 34, 0.52)';
      ctx.fillRect(wx, wy + 24, 32, 7);
      ctx.fillStyle = '#3b1e0b';
      ctx.fillRect(wx + 3, wy + 24, 5, 8);
      ctx.fillRect(wx + 24, wy + 24, 5, 8);

      // Extruded 3D Bridge Front Fascia Beam
      ctx.fillStyle = '#5c3114';
      ctx.fillRect(wx, wy + 23, 32, 5);

      // 3D Rounded Wooden Deck Planks
      for (let i = 0; i < 32; i += 8) {
        const plGrad = ctx.createLinearGradient(wx + i, wy + 3, wx + i + 7, wy + 23);
        plGrad.addColorStop(0, '#d99b58');
        plGrad.addColorStop(0.5, '#b87638');
        plGrad.addColorStop(1, '#8c5320');
        fillRoundRect(ctx, wx + i + 0.5, wy + 3, 7, 21, 1.2, plGrad, '#3d200d', 0.7);
      }

      // 3D Raised Handrails (top & bottom)
      fillRoundRect(ctx, wx, wy + 1, 32, 3.5, 1, '#e6b072', '#3d200d', 0.85);
      fillRoundRect(ctx, wx, wy + 22, 32, 3.5, 1, '#c98849', '#3d200d', 0.85);
      return;
    }

    const variant = hash % 6;
    ctx.drawImage(getStaticTileVariant(type, variant), wx, wy);

    // 2.5D Extruded Beveled Terrain Transitions (Grass overhanging paths / Stone raised curbs!)
    if ((type === 'path' || type === 'stone') && grid) {
      const upGrass = gy > 0 && grid[gy - 1][gx] === 'grass';
      const dnGrass = gy < grid.length - 1 && grid[gy + 1][gx] === 'grass';
      const ltGrass = gx > 0 && grid[gy][gx - 1] === 'grass';
      const rtGrass = gx < grid[0].length - 1 && grid[gy][gx + 1] === 'grass';

      if (upGrass) {
        // 2.5D Grass overhang lip + cast shadow onto sunken path
        ctx.fillStyle = 'rgba(28, 45, 18, 0.30)';
        ctx.fillRect(wx, wy + 3, 32, 4);
        ctx.fillStyle = '#4d9136';
        ctx.fillRect(wx, wy, 32, 3.5);
        ctx.fillStyle = '#78c456';
        ctx.fillRect(wx, wy, 32, 1.8);
      }
      if (dnGrass) {
        // Raised earth lip at south edge
        ctx.fillStyle = '#8c6438';
        ctx.fillRect(wx, wy + 28, 32, 4);
        ctx.fillStyle = '#5ca142';
        ctx.fillRect(wx, wy + 30, 32, 2);
      }
      if (ltGrass) {
        ctx.fillStyle = 'rgba(28, 45, 18, 0.25)';
        ctx.fillRect(wx + 3, wy, 3, 32);
        ctx.fillStyle = '#5ca142';
        ctx.fillRect(wx, wy, 3, 32);
      }
      if (rtGrass) {
        ctx.fillStyle = '#5ca142';
        ctx.fillRect(wx + 29, wy, 3, 32);
      }
    }
  }

  // ==================== 2.5D VOLUMETRIC MULTI-SPHERE TREES ====================
  function getTreeSprite(variant) {
    const key = '25d_tree_' + variant;
    if (treeCache[key]) return treeCache[key];
    const c = makeCanvas(76, 86);
    const ctx = c.getContext('2d');
    const ol = '#1a2916';

    // 1. 2.5D Angled Directional Tree Shadow on Ground
    ctx.save();
    ctx.translate(42, 70);
    ctx.rotate(0.18);
    const shGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
    shGrad.addColorStop(0, 'rgba(12, 24, 10, 0.45)');
    shGrad.addColorStop(0.65, 'rgba(12, 24, 10, 0.22)');
    shGrad.addColorStop(1, 'rgba(12, 24, 10, 0)');
    fillEllipse(ctx, 0, 0, 24, 8.5, shGrad);
    ctx.restore();

    if (variant === 1) {
      // 2.5D Volumetric Conical Alpine Pine / Spruce Tree
      const trGrad = ctx.createLinearGradient(31, 50, 43, 50);
      trGrad.addColorStop(0, '#a86b3c');
      trGrad.addColorStop(0.5, '#784420');
      trGrad.addColorStop(1, '#3d200c');
      fillRoundRect(ctx, 31, 50, 12, 22, 3, trGrad, ol, 1.4);

      const cones = [
        { y: 40, w: 54, h: 22 },
        { y: 27, w: 44, h: 20 },
        { y: 15, w: 32, h: 18 },
        { y: 5,  w: 20, h: 15 }
      ];
      cones.forEach((cn) => {
        // Under-cone shadow
        fillEllipse(ctx, 37, cn.y + cn.h - 2, cn.w * 0.44, 4.5, 'rgba(10, 28, 16, 0.38)');
        const cGrad = ctx.createRadialGradient(37 - cn.w * 0.18, cn.y + 4, 2, 37, cn.y + cn.h * 0.6, cn.w * 0.6);
        cGrad.addColorStop(0, '#86efac');
        cGrad.addColorStop(0.35, '#22c55e');
        cGrad.addColorStop(0.75, '#15803d');
        cGrad.addColorStop(1, '#052e16');

        ctx.beginPath();
        ctx.moveTo(37, cn.y);
        ctx.quadraticCurveTo(37 + cn.w * 0.52, cn.y + cn.h * 0.85, 37 + cn.w * 0.46, cn.y + cn.h);
        ctx.quadraticCurveTo(37, cn.y + cn.h + 3, 37 - cn.w * 0.46, cn.y + cn.h);
        ctx.quadraticCurveTo(37 - cn.w * 0.52, cn.y + cn.h * 0.85, 37, cn.y);
        ctx.closePath();
        ctx.fillStyle = cGrad;
        ctx.fill();
        ctx.strokeStyle = ol;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      });
    } else {
      // 2.5D Volumetric Multi-Sphere Oak (v0) & Sakura Blossom Tree (v2)
      // Cylindrical 3D Trunk with flared roots
      const trGrad = ctx.createLinearGradient(29, 44, 45, 44);
      trGrad.addColorStop(0, '#b57642');
      trGrad.addColorStop(0.45, '#824d26');
      trGrad.addColorStop(1, '#3f220e');
      ctx.beginPath();
      ctx.moveTo(31, 40);
      ctx.lineTo(43, 40);
      ctx.quadraticCurveTo(44, 62, 49, 70);
      ctx.lineTo(25, 70);
      ctx.quadraticCurveTo(30, 62, 31, 40);
      ctx.closePath();
      ctx.fillStyle = trGrad;
      ctx.fill();
      ctx.strokeStyle = ol;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Cast canopy shadow on upper trunk
      fillEllipse(ctx, 37, 46, 9, 4, 'rgba(15, 10, 5, 0.45)');

      const isSakura = variant === 2;
      const cTop = isSakura ? '#fff1f2' : '#d9f99d';
      const cHi  = isSakura ? '#fda4af' : '#4ade80';
      const cMid = isSakura ? '#e11d48' : '#16a34a';
      const cSh  = isSakura ? '#881337' : '#14532d';

      // 3D Spherical Foliage Clusters ordered back-to-front
      const spheres = [
        { cx: 21, cy: 36, rx: 15, ry: 13 },
        { cx: 53, cy: 37, rx: 15, ry: 13 },
        { cx: 37, cy: 40, rx: 18, ry: 14 },
        { cx: 25, cy: 24, rx: 16, ry: 14 },
        { cx: 49, cy: 25, rx: 16, ry: 14 },
        { cx: 37, cy: 19, rx: 18, ry: 15 }
      ];

      spheres.forEach((sp) => {
        const g = ctx.createRadialGradient(
          sp.cx - sp.rx * 0.32,
          sp.cy - sp.ry * 0.35,
          1.5,
          sp.cx + sp.rx * 0.1,
          sp.cy + sp.ry * 0.15,
          Math.max(sp.rx, sp.ry) * 1.15
        );
        g.addColorStop(0, cTop);
        g.addColorStop(0.28, cHi);
        g.addColorStop(0.72, cMid);
        g.addColorStop(1, cSh);
        fillEllipse(ctx, sp.cx, sp.cy, sp.rx, sp.ry, g, ol, 1.4);
      });

      // Rim specular leaf highlights on sun-facing top-left crown
      fillEllipse(ctx, 31, 12, 7, 3.2, 'rgba(255,255,255,0.28)');
      fillEllipse(ctx, 19, 20, 5, 2.4, 'rgba(255,255,255,0.24)');
    }

    treeCache[key] = c;
    return c;
  }

  function drawTree(ctx, wx, wy, variant = 0, tick = 0) {
    const sway = Math.sin(tick / 32 + wx * 0.04) * 1.4;
    ctx.drawImage(getTreeSprite(variant), Math.floor(wx - 22 + sway), Math.floor(wy - 48));
  }

  // ==================== 2.5D ARCHITECTURAL BUILDINGS (3/4 EXTRUDED SIDE WALL & ROOF) ====================
  function drawBuilding(ctx, b, isOnline, tick) {
    const x = b.tx * 32;
    const y = b.ty * 32;
    const w = b.tw * 32;
    const h = b.th * 32;
    const depthX = 16; // 2.5D 3/4 oblique right-side extrusion depth!
    const depthY = -10;
    const ol = '#261409';

    const roofBase = b.roofColor || '#b54635';
    const roofHi = shadeHex(roofBase, 0.28);
    const roofDark = b.roofDark || shadeHex(roofBase, -0.28);
    const roofSide = shadeHex(roofBase, -0.42);

    const wallBase = b.wallColor || '#f5e4c3';
    const wallHi = shadeHex(wallBase, 0.12);
    const wallSh = shadeHex(wallBase, -0.16);
    const wallSide = shadeHex(wallBase, -0.32);

    // 1. 2.5D Long Directional Sun Cast Shadow on Ground (projected behind & right)
    ctx.save();
    ctx.fillStyle = 'rgba(12, 22, 10, 0.34)';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w + depthX + 18, y + h + depthY + 8);
    ctx.lineTo(x + w + depthX + 18, y + 32 + depthY);
    ctx.lineTo(x + w, y + 32);
    ctx.closePath();
    ctx.fill();
    fillRoundRect(ctx, x + 6, y + h - 4, w + depthX, 14, 6, 'rgba(12, 22, 10, 0.30)');
    ctx.restore();

    // 2. 2.5D Extruded 3D Right Side Wall (oblique parallelogram plane!)
    ctx.beginPath();
    ctx.moveTo(x + w - 4, y + 30);
    ctx.lineTo(x + w - 4 + depthX, y + 30 + depthY);
    ctx.lineTo(x + w - 4 + depthX, y + h - 2 + depthY);
    ctx.lineTo(x + w - 4, y + h - 2);
    ctx.closePath();
    const sideWallGrad = ctx.createLinearGradient(x + w - 4, y + 30, x + w + depthX, y + h);
    sideWallGrad.addColorStop(0, wallSide);
    sideWallGrad.addColorStop(1, shadeHex(wallBase, -0.46));
    ctx.fillStyle = sideWallGrad;
    ctx.fill();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Side Wall Stone Masonry Foundation
    ctx.beginPath();
    ctx.moveTo(x + w - 4, y + h - 14);
    ctx.lineTo(x + w - 4 + depthX, y + h - 14 + depthY);
    ctx.lineTo(x + w - 4 + depthX, y + h - 2 + depthY);
    ctx.lineTo(x + w - 4, y + h - 2);
    ctx.closePath();
    ctx.fillStyle = '#47433e';
    ctx.fill();
    ctx.stroke();

    // 3. Front Wall with 2.5D Vertical Sunlight Gradient + Eaves Drop Shadow
    const frontWallGrad = ctx.createLinearGradient(x, y + 30, x, y + h);
    frontWallGrad.addColorStop(0, wallHi);
    frontWallGrad.addColorStop(0.65, wallBase);
    frontWallGrad.addColorStop(1, wallSh);
    fillRoundRect(ctx, x + 2, y + 30, w - 6, h - 31, 2, frontWallGrad, ol, 1.8);

    // Deep 2.5D Roof Overhang Cast Shadow on Upper Front Wall
    const eaveSh = ctx.createLinearGradient(x, y + 32, x, y + 46);
    eaveSh.addColorStop(0, 'rgba(28, 12, 4, 0.45)');
    eaveSh.addColorStop(1, 'rgba(28, 12, 4, 0)');
    ctx.fillStyle = eaveSh;
    ctx.fillRect(x + 4, y + 32, w - 10, 14);

    // 3D Stone Masonry Foundation Plinth
    fillRoundRect(ctx, x + 2, y + h - 14, w - 6, 13, 1.5, '#6e6a63', ol, 1.4);
    for (let sx = x + 6; sx < x + w - 14; sx += 16) {
      fillRoundRect(ctx, sx, y + h - 12, 13, 9, 2, '#a8a29e', '#44403c', 0.7);
      ctx.fillStyle = '#e7e5e4';
      ctx.fillRect(sx + 2, y + h - 11, 9, 1.5);
    }

    // 3D Timber Framing Pillars
    fillRoundRect(ctx, x + 3, y + 31, 6, h - 33, 1, '#6b3b19', ol, 1.0);
    fillRoundRect(ctx, x + w - 10, y + 31, 6, h - 33, 1, '#542c12', ol, 1.0);

    // 4. 2.5D Cylindrical Brick Chimney + Volumetric 3D Smoke Puffs
    const chX = x + w - 28;
    const chY = y - 16;
    const chGrad = ctx.createLinearGradient(chX, chY, chX + 16, chY);
    chGrad.addColorStop(0, '#c86d55');
    chGrad.addColorStop(0.55, '#8d4a3a');
    chGrad.addColorStop(1, '#4a2118');
    fillRoundRect(ctx, chX, chY, 16, 28, 2, chGrad, ol, 1.4);
    fillRoundRect(ctx, chX - 2, chY - 2, 20, 6, 2, '#5c2d22', ol, 1.2);
    if (isOnline) {
      for (let i = 0; i < 4; i++) {
        const p = ((tick * 0.45 + i * 12) % 48);
        const alpha = Math.max(0, 0.62 - p / 76);
        const sx = chX + 8 + Math.sin(p * 0.15 + i) * 5;
        const sy = chY - 6 - p * 0.75;
        const rad = 4 + p * 0.14;
        const smGrad = ctx.createRadialGradient(sx - 1, sy - 1, 0.5, sx, sy, rad);
        smGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        smGrad.addColorStop(1, 'rgba(226, 232, 240, 0)');
        fillEllipse(ctx, sx, sy, rad, rad * 0.85, smGrad);
      }
    }

    // 5. 2.5D Extruded Side Roof Plane (3/4 Perspective Slope!)
    ctx.beginPath();
    ctx.moveTo(x + w - 18, y - 6);
    ctx.lineTo(x + w - 18 + depthX, y - 6 + depthY);
    ctx.lineTo(x + w + 4 + depthX, y + 32 + depthY);
    ctx.lineTo(x + w + 4, y + 32);
    ctx.closePath();
    const sideRoofGrad = ctx.createLinearGradient(x + w - 10, y - 6, x + w + depthX, y + 32);
    sideRoofGrad.addColorStop(0, roofDark);
    sideRoofGrad.addColorStop(1, roofSide);
    ctx.fillStyle = sideRoofGrad;
    ctx.fill();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 6. 2.5D Pitched Front Roof with Volumetric Shingle Tiers & Highlight Ridge
    const mainRoofGrad = ctx.createLinearGradient(x, y - 8, x, y + 36);
    mainRoofGrad.addColorStop(0, roofHi);
    mainRoofGrad.addColorStop(0.45, roofBase);
    mainRoofGrad.addColorStop(1, roofDark);

    ctx.beginPath();
    ctx.moveTo(x + 14, y - 6);
    ctx.lineTo(x + w - 16, y - 6);
    ctx.lineTo(x + w + 4, y + 32);
    ctx.lineTo(x - 6, y + 32);
    ctx.closePath();
    ctx.fillStyle = mainRoofGrad;
    ctx.fill();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 3D Roof Fascia Trim Board (front overhang thickness)
    fillRoundRect(ctx, x - 7, y + 29, w + 12, 6, 2, roofDark, ol, 1.4);
    // 3D Top Roof Ridge Beam with specular sun highlight
    fillRoundRect(ctx, x + 12, y - 9, w - 26, 6, 2.5, roofHi, ol, 1.3);

    // Layered 2.5D Curved Roof Shingle Courses
    ctx.strokeStyle = 'rgba(20, 8, 2, 0.25)';
    ctx.lineWidth = 1.3;
    for (let ry = y + 3; ry <= y + 25; ry += 7) {
      const t = (ry - (y - 6)) / 38;
      const lx = x + 14 - t * 18;
      const rx = x + w - 16 + t * 18;
      ctx.beginPath();
      ctx.moveTo(lx, ry);
      ctx.lineTo(rx, ry);
      ctx.stroke();
    }

    // 7. Rooftop 2.5D Tech Landmarks
    if (b.id === 'remote_tower' || b.id === 'dns_tower' || b.id === 'mail_proxy') {
      const ax = x + 22;
      const ay = y - 28;
      fillRoundRect(ctx, ax, ay, 5, 24, 2, '#64748b', ol, 1.0);
      fillRoundRect(ctx, ax - 7, ay + 6, 19, 3.5, 1.5, '#cbd5e1', ol, 0.8);
      const pulse = Math.floor(tick / 14) % 2 === 0;
      const orbCol = isOnline ? (pulse ? '#38bdf8' : '#0284c7') : (pulse ? '#f87171' : '#991b1b');
      fillEllipse(ctx, ax + 2.5, ay - 3, 4.5, 4.5, orbCol, ol, 1.0);
      if (isOnline) fillEllipse(ctx, ax + 1.5, ay - 4, 1.5, 1.5, '#ffffff');
    } else if (b.id === 'win_hall') {
      const cx = x + 16;
      const cy = y - 18;
      fillRoundRect(ctx, cx, cy, 18, 18, 3, '#1e3a8a', ol, 1.2);
      px(ctx, cx + 3, cy + 3, 5, 5, '#38bdf8');
      px(ctx, cx + 10, cy + 3, 5, 5, '#60a5fa');
      px(ctx, cx + 3, cy + 10, 5, 5, '#60a5fa');
      px(ctx, cx + 10, cy + 10, 5, 5, '#93c5fd');
    } else if (b.id === 'cron_clock') {
      const cx = x + 24;
      const cy = y - 10;
      fillEllipse(ctx, cx, cy, 10, 10, '#d97706', ol, 1.3);
      fillEllipse(ctx, cx, cy, 7.5, 7.5, '#fffbeb', '#78350f', 0.8);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 5);
      ctx.moveTo(cx, cy); ctx.lineTo(cx + 4, cy);
      ctx.stroke();
    } else if (b.id === 'grand_hall') {
      fillRoundRect(ctx, x + Math.floor(w / 2) - 14, y - 20, 28, 13, 3, '#d97706', ol, 1.2);
      fillRoundRect(ctx, x + Math.floor(w / 2) - 11, y - 17, 22, 7, 2, '#fef08a');
    }

    // 8. 2.5D Arched Wooden Door + Protruding 3D Awning + Beveled Stone Step
    const doorX = x + Math.floor(w / 2) - 15;
    const doorY = y + h - 38;
    // Recessed door frame shadow
    fillRoundRect(ctx, doorX - 2, doorY - 2, 30, 37, 4, '#2b1406');
    const dGrad = ctx.createLinearGradient(doorX, doorY, doorX + 26, doorY + 34);
    dGrad.addColorStop(0, '#b86f37');
    dGrad.addColorStop(0.5, '#8f4f20');
    dGrad.addColorStop(1, '#5e3111');
    fillRoundRect(ctx, doorX, doorY, 26, 34, 3.5, dGrad, ol, 1.3);
    fillRoundRect(ctx, doorX + 4, doorY + 5, 18, 11, 2, '#c98249', '#5e3111', 0.8);
    fillEllipse(ctx, doorX + 21, doorY + 19, 2.0, 2.0, '#fbbf24', '#78350f', 0.6);

    // 3D Protruding Door Awning with cast shadow
    ctx.fillStyle = 'rgba(20, 8, 2, 0.32)';
    ctx.fillRect(doorX - 3, doorY - 1, 32, 4);
    fillRoundRect(ctx, doorX - 5, doorY - 7, 36, 7, 2.5, roofBase, ol, 1.2);
    // 3D Extruded Stone Doorstep
    fillRoundRect(ctx, doorX - 5, y + h - 5, 36, 7, 2, '#a8a29e', ol, 1.1);
    ctx.fillStyle = '#e7e5e4';
    ctx.fillRect(doorX - 3, y + h - 4, 32, 2);

    // 9. 2.5D Deep-Set Glowing Windows + 3D Flowerboxes
    const winPositions = [x + 15, x + w - 43];
    winPositions.forEach((wx) => {
      fillRoundRect(ctx, wx - 1, y + 46, 26, 24, 3, '#5c3114', ol, 1.3);
      const wGlow = ctx.createLinearGradient(wx + 2, y + 49, wx + 20, y + 66);
      if (isOnline) {
        wGlow.addColorStop(0, '#fef9c3');
        wGlow.addColorStop(0.5, '#fde047');
        wGlow.addColorStop(1, '#f59e0b');
      } else {
        wGlow.addColorStop(0, '#64748b');
        wGlow.addColorStop(1, '#334155');
      }
      fillRoundRect(ctx, wx + 2, y + 49, 20, 18, 2, wGlow);
      // Window mullions
      px(ctx, wx + 11, y + 49, 2, 18, '#5c3114');
      px(ctx, wx + 2, y + 57, 20, 2, '#5c3114');
      // 3D Protruding Flowerbox + shadow
      ctx.fillStyle = 'rgba(20, 10, 4, 0.30)';
      ctx.fillRect(wx - 2, y + 73, 28, 4);
      fillRoundRect(ctx, wx - 2, y + 68, 28, 6, 2, '#7c431e', ol, 1.0);
      fillEllipse(ctx, wx + 7, y + 67, 5, 3, '#22c55e');
      fillEllipse(ctx, wx + 17, y + 67, 5, 3, '#16a34a');
      fillEllipse(ctx, wx + 7, y + 66.5, 2.2, 2.0, '#fb7185');
      fillEllipse(ctx, wx + 17, y + 66.5, 2.2, 2.0, '#fde047');
    });

    // 10. 2.5D Beveled Wooden Name Signboard with Glowing Status LED
    const signW = Math.min(w - 10, 148);
    const signX = x + Math.floor((w - signW) / 2);
    const signY = y + 12;
    fillRoundRect(ctx, signX + 2, signY + 3, signW, 21, 4, 'rgba(15, 8, 2, 0.38)');
    const sGrad = ctx.createLinearGradient(signX, signY, signX, signY + 20);
    sGrad.addColorStop(0, '#fffbeb');
    sGrad.addColorStop(1, '#f3d9a4');
    fillRoundRect(ctx, signX, signY, signW, 20, 4, sGrad, ol, 1.5);

    const blink = Math.floor(tick / 18) % 2 === 0;
    const ledCol = isOnline ? '#22c55e' : (blink ? '#ef4444' : '#7f1d1d');
    fillEllipse(ctx, signX + 10, signY + 10, 4.2, 4.2, ledCol, ol, 0.9);
    if (isOnline) fillEllipse(ctx, signX + 9, signY + 8.8, 1.4, 1.2, '#bbf7d0');

    ctx.fillStyle = '#2b1304';
    ctx.font = 'bold 11px Kanit, Tahoma, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(b.shortName, signX + 18, signY + 14);
  }

  // ==================== 2.5D 3D EXTRUDED SERVER RACK CABINET ====================
  function drawServerRack(ctx, wx, wy, online, tick) {
    const ol = '#0f172a';
    // 2.5D Angled Floor Shadow + Ambient Glow when online
    fillEllipse(ctx, wx + 18, wy + 29, 16, 5.5, 'rgba(10, 18, 12, 0.42)');
    if (online) {
      const glow = ctx.createRadialGradient(wx + 16, wy + 14, 2, wx + 16, wy + 14, 26);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      fillEllipse(ctx, wx + 16, wy + 18, 24, 14, glow);
    }

    // 1. 3D Top Perspective Roof Plane of Server Cabinet
    ctx.beginPath();
    ctx.moveTo(wx + 3, wy - 9);
    ctx.lineTo(wx + 9, wy - 14);
    ctx.lineTo(wx + 31, wy - 14);
    ctx.lineTo(wx + 25, wy - 9);
    ctx.closePath();
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // 2. 3D Right Side Extruded Panel of Server Cabinet
    ctx.beginPath();
    ctx.moveTo(wx + 25, wy - 9);
    ctx.lineTo(wx + 31, wy - 14);
    ctx.lineTo(wx + 31, wy + 23);
    ctx.lineTo(wx + 25, wy + 28);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.stroke();

    // 3. Front Server Cabinet Body
    const cabGrad = ctx.createLinearGradient(wx + 3, wy - 9, wx + 25, wy + 28);
    cabGrad.addColorStop(0, '#475569');
    cabGrad.addColorStop(1, '#1e293b');
    fillRoundRect(ctx, wx + 3, wy - 9, 22, 37, 2, cabGrad, ol, 1.4);

    // 3 Blade Server Bays inside cabinet
    for (let r = 0; r < 3; r++) {
      const ry = wy - 4 + r * 10;
      fillRoundRect(ctx, wx + 6, ry, 16, 8, 1.5, '#090d16', '#334155', 0.7);
      const blink = Math.floor(tick / 10 + r) % 2 === 0;
      if (online) {
        fillEllipse(ctx, wx + 9.5, ry + 4, 1.8, 1.8, '#4ade80');
        fillRoundRect(ctx, wx + 13, ry + 2.2, 7, 2, 0.8, blink ? '#38bdf8' : '#0284c7');
        fillRoundRect(ctx, wx + 13, ry + 5.2, 5, 1.2, 0.5, '#22c55e');
      } else {
        fillEllipse(ctx, wx + 9.5, ry + 4, 1.8, 1.8, blink ? '#ef4444' : '#7f1d1d');
        fillRoundRect(ctx, wx + 13, ry + 2.5, 7, 2, 0.8, '#334155');
      }
    }

    // Diagonal Tempered Glass Door Reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.beginPath();
    ctx.moveTo(wx + 6, wy - 6);
    ctx.lineTo(wx + 11, wy - 6);
    ctx.lineTo(wx + 7, wy + 24);
    ctx.lineTo(wx + 6, wy + 24);
    ctx.closePath();
    ctx.fill();
  }

  // ==================== 2.5D 3D EXTRUDED TREASURE CRATE ====================
  function drawCrate(ctx, wx, wy, opened, tick) {
    const ol = '#291507';
    fillEllipse(ctx, wx + 17, wy + 26, 14, 4.5, 'rgba(10, 18, 10, 0.38)');

    const topCol = opened ? '#6b4829' : '#f5b062';
    const frontCol = opened ? '#573a20' : '#c97d36';
    const sideCol = opened ? '#3d2815' : '#8f531d';

    // 1. 3D Top Lid Plane
    ctx.beginPath();
    ctx.moveTo(wx + 4, wy + 9);
    ctx.lineTo(wx + 9, wy + 4);
    ctx.lineTo(wx + 29, wy + 4);
    ctx.lineTo(wx + 24, wy + 9);
    ctx.closePath();
    ctx.fillStyle = topCol;
    ctx.fill();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // 2. 3D Right Side Plane
    ctx.beginPath();
    ctx.moveTo(wx + 24, wy + 9);
    ctx.lineTo(wx + 29, wy + 4);
    ctx.lineTo(wx + 29, wy + 20);
    ctx.lineTo(wx + 24, wy + 25);
    ctx.closePath();
    ctx.fillStyle = sideCol;
    ctx.fill();
    ctx.stroke();

    // 3. 3D Front Chest Face
    fillRoundRect(ctx, wx + 4, wy + 9, 20, 16, 1.5, frontCol, ol, 1.4);
    // Iron band & Gold Lock Clasp
    ctx.fillStyle = '#334155';
    ctx.fillRect(wx + 5, wy + 14, 18, 2.5);
    fillRoundRect(ctx, wx + 11.5, wy + 12.5, 5, 5.5, 1.2, '#fbbf24', ol, 0.9);

    if (!opened) {
      const dy = Math.sin(tick / 10) * 2.5;
      fillEllipse(ctx, wx + 16, wy - 2 + dy, 5, 5, 'rgba(253, 224, 71, 0.32)');
      fillEllipse(ctx, wx + 16, wy - 2 + dy, 2.4, 2.4, '#fef08a', '#ca8a04', 0.7);
    }
  }

  // ==================== 2.5D 3D TIERED CENTRAL PLAZA FOUNTAIN ====================
  function drawFountain(ctx, wx, wy, tick) {
    const ol = '#33302b';
    fillEllipse(ctx, wx + 34, wy + 24, 46, 15, 'rgba(12, 22, 14, 0.36)');

    // 3D Extruded Outer Stone Basin Wall
    const wallGrad = ctx.createLinearGradient(wx - 8, wy + 6, wx + 72, wy + 34);
    wallGrad.addColorStop(0, '#d6d3d1');
    wallGrad.addColorStop(0.5, '#a8a29e');
    wallGrad.addColorStop(1, '#57534e');
    fillEllipse(ctx, wx + 32, wy + 21, 42, 13, '#57534e', ol, 1.5);
    fillEllipse(ctx, wx + 32, wy + 17, 42, 13, wallGrad, ol, 1.5);

    // Glowing 2.5D Water Pool inside Basin
    const poolGrad = ctx.createRadialGradient(wx + 26, wy + 15, 2, wx + 32, wy + 17, 36);
    poolGrad.addColorStop(0, '#7dd3fc');
    poolGrad.addColorStop(0.65, '#0284c7');
    poolGrad.addColorStop(1, '#0c4a6e');
    fillEllipse(ctx, wx + 32, wy + 17, 36, 10, poolGrad, '#78716c', 1.0);

    // 3D Cylindrical Center Pedestal & Upper Bowl
    const pedGrad = ctx.createLinearGradient(wx + 24, wy - 10, wx + 40, wy - 10);
    pedGrad.addColorStop(0, '#f5f5f4');
    pedGrad.addColorStop(0.55, '#d6d3d1');
    pedGrad.addColorStop(1, '#78716c');
    fillRoundRect(ctx, wx + 25, wy - 8, 14, 25, 3, pedGrad, ol, 1.2);
    fillEllipse(ctx, wx + 32, wy - 9, 13, 4.5, pedGrad, ol, 1.2);

    // Animated 2.5D Water Plume & Parabolic Droplets
    const h = 9 + Math.sin(tick / 6) * 3;
    const plumeGrad = ctx.createLinearGradient(wx + 32, wy - 12 - h, wx + 32, wy - 9);
    plumeGrad.addColorStop(0, '#ffffff');
    plumeGrad.addColorStop(1, '#7dd3fc');
    fillRoundRect(ctx, wx + 29.5, wy - 11 - h, 5, h + 3, 2.5, plumeGrad);
    fillEllipse(ctx, wx + 32, wy - 11 - h, 5, 2.2, '#ffffff');

    const p = (tick % 24) / 24;
    const dropY = wy - 10 + p * 24;
    fillEllipse(ctx, wx + 18 - p * 4, dropY, 2.0, 2.4, '#e0f2fe');
    fillEllipse(ctx, wx + 46 + p * 4, dropY, 2.0, 2.4, '#e0f2fe');

    // Expanding 2.5D Elliptical Water Ripples
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.75 - p * 0.65})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(wx + 32, wy + 17, 10 + p * 20, 3 + p * 5.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ==================== 2.5D PARK BENCH ====================
  function drawBench(ctx, wx, wy) {
    const ol = '#2b1608';
    fillEllipse(ctx, wx + 25, wy + 26, 22, 4.5, 'rgba(12, 22, 10, 0.34)');
    // Iron side legs
    fillRoundRect(ctx, wx + 5, wy + 16, 4, 10, 1, '#334155', ol, 0.9);
    fillRoundRect(ctx, wx + 39, wy + 16, 4, 10, 1, '#334155', ol, 0.9);
    // 3D Backrest & Extruded Seat Planks
    const bGrad = ctx.createLinearGradient(wx, wy + 7, wx, wy + 22);
    bGrad.addColorStop(0, '#d98a46');
    bGrad.addColorStop(0.5, '#b56e33');
    bGrad.addColorStop(1, '#7c4619');
    fillRoundRect(ctx, wx + 3, wy + 8, 42, 6, 2, bGrad, ol, 1.1);
    fillRoundRect(ctx, wx + 2, wy + 15, 44, 6, 2, bGrad, ol, 1.1);
  }

  // ==================== 2.5D VILLAGE STREET LAMP & VOLUMETRIC HALO ====================
  function drawLamp(ctx, wx, wy, nightFactor) {
    const ol = '#18181b';
    fillEllipse(ctx, wx + 17, wy + 27, 9, 3.2, 'rgba(10, 18, 10, 0.36)');

    // 3D Cylindrical Iron Post
    const pGrad = ctx.createLinearGradient(wx + 13, wy, wx + 19, wy);
    pGrad.addColorStop(0, '#71717a');
    pGrad.addColorStop(0.5, '#3f3f46');
    pGrad.addColorStop(1, '#18181b');
    fillRoundRect(ctx, wx + 13, wy - 6, 6, 34, 2, pGrad, ol, 1.0);
    fillRoundRect(ctx, wx + 11, wy + 22, 10, 6, 2, pGrad, ol, 1.0);

    // 3D Lantern Housing & Glowing Glass Core
    fillRoundRect(ctx, wx + 9, wy - 12, 14, 11, 2.5, '#27272a', ol, 1.1);
    fillRoundRect(ctx, wx + 8, wy - 14, 16, 4, 2, '#3f3f46', ol, 1.0);
    const bulbCol = nightFactor > 0.12 ? '#fef08a' : '#e0f2fe';
    fillRoundRect(ctx, wx + 11.5, wy - 9.5, 9, 7, 1.5, bulbCol);

    if (nightFactor > 0.08) {
      ctx.save();
      const grad = ctx.createRadialGradient(wx + 16, wy - 6, 3, wx + 16, wy + 4, 76);
      grad.addColorStop(0, `rgba(254, 240, 138, ${0.55 * nightFactor})`);
      grad.addColorStop(0.45, `rgba(251, 191, 36, ${0.24 * nightFactor})`);
      grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(wx + 16, wy + 2, 76, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  return {
    drawCharacter,
    getPortrait,
    getItemIcon,
    drawTile,
    drawTree,
    drawBuilding,
    drawServerRack,
    drawCrate,
    drawFountain,
    drawBench,
    drawLamp
  };
})();
