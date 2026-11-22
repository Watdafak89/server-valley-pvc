// Server Valley — High-Quality 2.5D Diorama & Volumetric Character Engine (Stardew Valley Edition)
// Combines warm Stardew Valley architecture & farmyard props with 2.5D 3/4 perspective extrusion,
// volumetric radial/cylindrical shading, directional sun shadows, and 10+ character outfit/hair/headgear styles.
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

  // ==================== 2.5D VOLUMETRIC CHARACTER MODEL (10 HAIRSTYLES, 8 FACES, 8 OUTFITS, HEADGEAR) ====================
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

    const shirt = style.shirt || '#c53030';
    const shirtHi = shadeHex(shirt, 0.30);
    const shirtSh = shadeHex(shirt, -0.26);
    const shirtDeep = shadeHex(shirt, -0.42);
    const shirtStyle = style.shirtStyle || 'overalls';

    const pants = style.pants || '#2c4969';
    const pantsHi = shadeHex(pants, 0.22);
    const pantsSh = shadeHex(pants, -0.28);

    const shoes = style.shoes || '#5c3317';
    const shoesHi = shadeHex(shoes, 0.32);
    const shoesSh = shadeHex(shoes, -0.32);

    const hair = style.hair || '#5a331c';
    const hairHi = shadeHex(hair, 0.38);
    const hairSh = shadeHex(hair, -0.28);
    const hairDeep = shadeHex(hair, -0.42);
    const hairStyle = style.hairStyle || 'short';
    const faceStyle = style.faceStyle || (style.glasses ? 'glasses' : 'smile');

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
    fillEllipse(ctx, 7.5, 26.2 + legL * 0.4, 2.3, 0.9, 'rgba(10,16,8,0.34)');
    fillEllipse(ctx, 12.5, 26.2 + legR * 0.4, 2.3, 0.9, 'rgba(10,16,8,0.34)');

    // 2. Back Hair Layers (Long / Twintails / Wolfcut) & 2.5D Backpack Depth
    if ((hairStyle === 'long' || hairStyle === 'wolfcut') && dir !== 'up') {
      const bhGrad = ctx.createLinearGradient(3, 8 + by, 17, 19 + by);
      bhGrad.addColorStop(0, hair);
      bhGrad.addColorStop(1, hairDeep);
      fillRoundRect(ctx, 3.2, 8.5 + by, 13.6, hairStyle === 'long' ? 10.5 : 7.8, 4, bhGrad, ol, 0.9);
    }
    if (hairStyle === 'twintails' && dir !== 'up') {
      const ttGrad = ctx.createLinearGradient(1, 7 + by, 19, 19 + by);
      ttGrad.addColorStop(0, hairHi);
      ttGrad.addColorStop(0.5, hair);
      ttGrad.addColorStop(1, hairDeep);
      fillEllipse(ctx, 3.0, 12.8 + by, 2.2, 5.2, ttGrad, ol, 0.85);
      fillEllipse(ctx, 17.0, 12.8 + by, 2.2, 5.2, ttGrad, ol, 0.85);
    }

    if (style.backpack && (dir === 'left' || dir === 'right' || dir === 'down')) {
      const bpX = dir === 'left' ? 12.8 : dir === 'right' ? 3.0 : 4.2;
      const bpW = dir === 'down' ? 11.6 : 4.2;
      const bpGrad = ctx.createLinearGradient(bpX, 13 + by, bpX + bpW, 20 + by);
      bpGrad.addColorStop(0, '#c87d3b');
      bpGrad.addColorStop(1, '#6e3814');
      fillRoundRect(ctx, bpX, 13.5 + by, bpW, 6.2, 2.2, bpGrad, ol, 0.85);
    }

    // 3. 2.5D Volumetric Legs & Extruded 3D Sneakers/Boots
    const drawLegAndShoe = (lx, lyOff, isBackLeg) => {
      const scaleDepth = isBackLeg ? 0.93 : 1.0;
      const legY = 19.6 + lyOff;
      const pGrad = ctx.createLinearGradient(lx, legY, lx + 4.2 * scaleDepth, legY);
      pGrad.addColorStop(0, pantsHi);
      pGrad.addColorStop(0.45, pants);
      pGrad.addColorStop(1, pantsSh);
      fillRoundRect(ctx, lx, legY, 4.2 * scaleDepth, 5.2, 1.6, pGrad, ol, 0.85);

      const sy = legY + 3.8;
      const sw = 4.8 * scaleDepth;
      const shoeX = lx - 0.3 + (dir === 'left' ? -0.5 : dir === 'right' ? 0.5 : 0);
      fillRoundRect(ctx, shoeX, sy + 1.2, sw, 2.1, 1.1, '#e2e8f0', ol, 0.8);
      const sGrad = ctx.createRadialGradient(shoeX + sw * 0.35, sy + 0.6, 0.3, shoeX + sw * 0.5, sy + 1.2, sw);
      sGrad.addColorStop(0, shoesHi);
      sGrad.addColorStop(0.55, shoes);
      sGrad.addColorStop(1, shoesSh);
      fillRoundRect(ctx, shoeX, sy, sw, 2.3, 1.3, sGrad, ol, 0.8);
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

    // 4. Back Arm
    const sleeveCol = shirtStyle === 'labcoat' ? '#f8fafc' : shirt;
    const sleeveHi  = shirtStyle === 'labcoat' ? '#ffffff' : shirtHi;
    const sleeveSh  = shirtStyle === 'labcoat' ? '#cbd5e1' : shirtSh;
    const sleeveDp  = shirtStyle === 'labcoat' ? '#94a3b8' : shirtDeep;

    const drawArm = (ax, ayOff, isBack) => {
      const ay = 13.8 + by + ayOff;
      const aGrad = ctx.createLinearGradient(ax, ay, ax + 2.8, ay + 5);
      aGrad.addColorStop(0, isBack ? sleeveCol : sleeveHi);
      aGrad.addColorStop(1, isBack ? sleeveDp : sleeveSh);
      fillRoundRect(ctx, ax, ay, 2.7, 4.8, 1.3, aGrad, ol, 0.8);
      const hGrad = ctx.createRadialGradient(ax + 1.1, ay + 4.7, 0.2, ax + 1.3, ay + 4.9, 1.6);
      hGrad.addColorStop(0, skinHi);
      hGrad.addColorStop(1, skinSh);
      fillEllipse(ctx, ax + 1.35, ay + 4.9, 1.25, 1.15, hGrad, ol, 0.75);
    };

    if (dir === 'left') drawArm(11.4, armR, true);
    if (dir === 'right') drawArm(5.8, armL, true);

    // 5. 2.5D Cylindrical Torso & 8 Distinct Outfit Styles!
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
    fillRoundRect(ctx, tx + 1.2, ty + 0.4, tw - 2.4, 1.3, 0.7, 'rgba(255,255,255,0.22)');

    if (dir !== 'up') {
      const cx = 10.0 + tiltX * 0.9;
      if (shirtStyle === 'overalls') {
        // Classic Stardew Valley Denim Overalls with shoulder straps & brass buttons!
        const ovGrad = ctx.createLinearGradient(tx, ty + 2, tx + tw, ty + th);
        ovGrad.addColorStop(0, pantsHi);
        ovGrad.addColorStop(0.5, pants);
        ovGrad.addColorStop(1, pantsSh);
        fillRoundRect(ctx, tx + 0.7, ty + 3.2, tw - 1.4, th - 3.6, 1.6, ovGrad, ol, 0.65);
        fillRoundRect(ctx, cx - 2.4, ty + 1.6, 4.8, 3.2, 0.9, ovGrad, ol, 0.55);
        // Straps
        fillRoundRect(ctx, cx - 3.1, ty + 0.2, 1.5, 3.0, 0.5, pantsHi, ol, 0.45);
        fillRoundRect(ctx, cx + 1.6, ty + 0.2, 1.5, 3.0, 0.5, pantsHi, ol, 0.45);
        // Brass buttons
        fillEllipse(ctx, cx - 2.3, ty + 2.5, 0.65, 0.65, '#fde047', '#78350f', 0.35);
        fillEllipse(ctx, cx + 2.3, ty + 2.5, 0.65, 0.65, '#fde047', '#78350f', 0.35);
      } else if (shirtStyle === 'jacket') {
        const teeGrad = ctx.createLinearGradient(cx - 2, ty, cx + 2, ty + th);
        teeGrad.addColorStop(0, '#ffffff');
        teeGrad.addColorStop(1, '#cbd5e1');
        fillRoundRect(ctx, cx - 1.9, ty + 0.5, 3.8, th - 1.2, 1.0, teeGrad);
        ctx.strokeStyle = shirtDeep;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(cx - 2.0, ty + 0.6); ctx.lineTo(cx - 2.0, ty + th - 1.2);
        ctx.moveTo(cx + 2.0, ty + 0.6); ctx.lineTo(cx + 2.0, ty + th - 1.2);
        ctx.stroke();
        fillRoundRect(ctx, tx + 0.5, ty + th - 1.8, tw - 1.0, 1.4, 0.5, '#3b2110');
        fillRoundRect(ctx, cx - 1.1, ty + th - 1.9, 2.2, 1.5, 0.4, '#fbbf24', '#78350f', 0.4);
      } else if (shirtStyle === 'polo') {
        fillRoundRect(ctx, cx - 1.1, ty + 0.8, 2.2, 3.8, 0.7, '#f8fafc', shirtSh, 0.5);
        fillEllipse(ctx, cx - 1.3, ty + 1.0, 1.6, 0.9, '#ffffff', ol, 0.55);
        fillEllipse(ctx, cx + 1.3, ty + 1.0, 1.6, 0.9, '#e2e8f0', ol, 0.55);
        fillRoundRect(ctx, tx + 0.5, ty + th - 1.7, tw - 1.0, 1.3, 0.5, '#3b2110');
      } else if (shirtStyle === 'hoodie') {
        fillRoundRect(ctx, cx - 2.8, ty + 3.4, 5.6, 2.8, 1.2, shirtSh, shirtDeep, 0.5);
        ctx.strokeStyle = '#fffdf0';
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(cx - 1.3, ty + 1.2); ctx.lineTo(cx - 1.3, ty + 3.8);
        ctx.moveTo(cx + 1.3, ty + 1.2); ctx.lineTo(cx + 1.3, ty + 3.8);
        ctx.stroke();
      } else if (shirtStyle === 'suit') {
        // Executive Suit with crisp white dress shirt & silk crimson/gold necktie!
        fillRoundRect(ctx, cx - 1.8, ty + 0.4, 3.6, 4.6, 0.8, '#ffffff');
        fillRoundRect(ctx, cx - 0.65, ty + 1.0, 1.3, 4.5, 0.4, '#e11d48', '#881337', 0.35);
        fillEllipse(ctx, cx + 2.4, ty + 2.4, 0.7, 0.45, '#fbbf24'); // gold lapel pin
      } else if (shirtStyle === 'labcoat') {
        // White Scientist / Engineer Lab Coat over colored inner shirt + ID badge!
        fillRoundRect(ctx, tx + 0.3, ty + 0.3, 3.2, th - 0.5, 1.2, '#f8fafc', '#94a3b8', 0.55);
        fillRoundRect(ctx, tx + tw - 3.5, ty + 0.3, 3.2, th - 0.5, 1.2, '#f1f5f9', '#94a3b8', 0.55);
        fillRoundRect(ctx, tx + tw - 2.8, ty + 2.2, 1.8, 1.4, 0.3, '#38bdf8', '#0284c7', 0.35);
      } else if (shirtStyle === 'vest') {
        // Preppy Academy Sweater Vest over White Collar Shirt
        fillEllipse(ctx, cx - 1.3, ty + 0.9, 1.5, 0.9, '#ffffff', ol, 0.5);
        fillEllipse(ctx, cx + 1.3, ty + 0.9, 1.5, 0.9, '#ffffff', ol, 0.5);
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(cx - 1.8, ty + 0.7);
        ctx.lineTo(cx, ty + 3.3);
        ctx.lineTo(cx + 1.8, ty + 0.7);
        ctx.stroke();
      } else if (shirtStyle === 'cyber_armor') {
        // Cyber Neon Tech Jacket with glowing cyan LED chest core & shoulder trims
        fillRoundRect(ctx, tx + 0.8, ty + 0.6, tw - 1.6, 1.2, 0.5, '#38bdf8');
        fillRoundRect(ctx, cx - 1.8, ty + 2.4, 3.6, 2.2, 0.7, '#0f172a', '#38bdf8', 0.7);
        fillEllipse(ctx, cx, ty + 3.5, 1.1, 0.7, '#67e8f9');
      }
    } else if (style.backpack && hairStyle !== 'long') {
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

    // 7. 2.5D Neck Cylinder & Cast Head Shadow
    fillEllipse(ctx, 10.0 + tiltX * 0.5, 13.7 + by, 3.6, 1.3, 'rgba(20, 10, 5, 0.26)');
    fillRoundRect(ctx, 8.3 + tiltX * 0.4, 11.8 + by, 3.4, 2.4, 1.0, skinDeep, ol, 0.7);

    // 8. 2.5D Volumetric Chibi Head Sphere + 3D Ears
    const hx = 10.0 + tiltX * 0.6;
    const hy = 7.7 + by;
    if (dir !== 'right') {
      fillEllipse(ctx, hx - 5.9, hy + 0.9, 1.4, 1.7, skin, ol, 0.85);
      fillEllipse(ctx, hx - 5.8, hy + 1.0, 0.65, 0.9, skinSh);
    }
    if (dir !== 'left') {
      fillEllipse(ctx, hx + 5.9, hy + 0.9, 1.4, 1.7, skinSh, ol, 0.85);
      fillEllipse(ctx, hx + 5.8, hy + 1.0, 0.65, 0.9, skinDeep);
    }

    const headGrad = ctx.createRadialGradient(hx - 2.2, hy - 2.4, 1.0, hx + 0.4, hy + 0.6, 7.6);
    headGrad.addColorStop(0, skinHi);
    headGrad.addColorStop(0.55, skin);
    headGrad.addColorStop(0.88, skinSh);
    headGrad.addColorStop(1, skinDeep);
    fillRoundRect(ctx, hx - 5.8, hy - 5.3, 11.6, 11.0, 4.8, headGrad, ol, 1.0);

    // 9. Hair & Face
    if (dir === 'up') {
      drawHairBack25D(ctx, hx, hy, by, hair, hairHi, hairSh, hairDeep, hairStyle, style, ol);
    } else {
      fillEllipse(ctx, hx, hy - 2.1, 4.9, 1.6, 'rgba(45, 22, 12, 0.22)');
      if (dir === 'down') {
        drawFrontFace25D(ctx, hx, hy, faceStyle, blink, style, ol, skinHi, skinSh);
      } else {
        drawSideFace25D(ctx, hx, hy, dir, faceStyle, blink, style, ol, skinHi, skinSh);
      }
      drawHairFront25D(ctx, hx, hy, by, dir, hair, hairHi, hairSh, hairDeep, hairStyle, style, ol);
    }

    ctx.restore();
  }

  function drawFrontFace25D(ctx, hx, hy, faceStyle, blink, style, ol, skinHi, skinSh) {
    // Rosy cheek glow
    fillEllipse(ctx, hx - 3.4, hy + 2.0, 1.7, 1.0, 'rgba(244, 102, 122, 0.45)');
    fillEllipse(ctx, hx + 3.4, hy + 2.0, 1.7, 1.0, 'rgba(244, 102, 122, 0.45)');
    fillEllipse(ctx, hx - 0.15, hy + 1.0, 0.45, 0.55, skinHi);
    fillEllipse(ctx, hx + 0.2, hy + 1.35, 0.45, 0.35, skinSh);

    const drawGlossyEye = (ex, ey, isStar = false) => {
      fillRoundRect(ctx, ex - 1.35, ey - 1.5, 2.7, 3.0, 1.1, '#ffffff', ol, 0.55);
      const iGrad = ctx.createLinearGradient(ex, ey - 1.2, ex, ey + 1.4);
      iGrad.addColorStop(0, isStar ? '#4c1d95' : '#1e1b4b');
      iGrad.addColorStop(0.55, isStar ? '#8b5cf6' : '#2563eb');
      iGrad.addColorStop(1, isStar ? '#f472b6' : '#60a5fa');
      fillRoundRect(ctx, ex - 1.05, ey - 1.2, 2.1, 2.5, 0.9, iGrad);
      fillEllipse(ctx, ex, ey + 0.1, 0.65, 0.75, '#0f172a');
      ctx.strokeStyle = ol;
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.arc(ex, ey - 0.3, 1.3, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      if (isStar) {
        fillEllipse(ctx, ex - 0.35, ey - 0.5, 0.65, 0.65, '#fde047');
        fillEllipse(ctx, ex + 0.45, ey + 0.6, 0.35, 0.35, '#ffffff');
      } else {
        fillEllipse(ctx, ex - 0.48, ey - 0.65, 0.52, 0.52, '#ffffff');
        fillEllipse(ctx, ex + 0.45, ey + 0.65, 0.28, 0.28, '#e0f2fe');
      }
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
      fillRoundRect(ctx, hx - 1.6, hy + 2.2, 3.2, 1.8, 0.8, '#be123c', ol, 0.6);
      fillRoundRect(ctx, hx - 1.1, hy + 2.2, 2.2, 0.6, 0.2, '#ffffff');
      return;
    }

    if (faceStyle === 'cool') {
      fillRoundRect(ctx, hx - 4.6, hy - 1.2, 4.1, 2.7, 0.9, '#0f172a', '#334155', 0.7);
      fillRoundRect(ctx, hx + 0.5, hy - 1.2, 4.1, 2.7, 0.9, '#0f172a', '#334155', 0.7);
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.85)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(hx - 3.8, hy - 0.6); ctx.lineTo(hx - 2.3, hy + 0.8);
      ctx.moveTo(hx + 1.3, hy - 0.6); ctx.lineTo(hx + 2.8, hy + 0.8);
      ctx.stroke();
      ctx.strokeStyle = '#9f3e2e';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.arc(hx + 0.2, hy + 2.3, 1.5, 0.1 * Math.PI, 0.82 * Math.PI);
      ctx.stroke();
      return;
    }

    if (faceStyle === 'cyber') {
      // Glowing Cyan/Neon AR Cyber Visor across both eyes!
      const vGrad = ctx.createLinearGradient(hx - 4.8, hy - 1.2, hx + 4.8, hy + 1.4);
      vGrad.addColorStop(0, '#06b6d4');
      vGrad.addColorStop(0.5, '#67e8f9');
      vGrad.addColorStop(1, '#3b82f6');
      fillRoundRect(ctx, hx - 4.8, hy - 1.2, 9.6, 2.7, 1.1, vGrad, '#0f172a', 0.8);
      fillRoundRect(ctx, hx - 3.6, hy - 0.7, 7.2, 0.7, 0.3, '#ffffff');
      ctx.strokeStyle = '#9f3e2e';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.arc(hx, hy + 2.3, 1.4, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      return;
    }

    if (faceStyle === 'wink') {
      if (!blink) drawGlossyEye(hx - 2.6, hy + 0.1);
      ctx.strokeStyle = ol;
      ctx.lineWidth = 0.95;
      ctx.beginPath();
      ctx.arc(hx + 2.6, hy + 0.5, 1.3, Math.PI * 1.15, Math.PI * 1.88);
      ctx.stroke();
      fillRoundRect(ctx, hx - 1.4, hy + 2.3, 2.8, 1.4, 0.7, '#e11d48', ol, 0.55);
      return;
    }

    if (!blink) {
      drawGlossyEye(hx - 2.6, hy + 0.1, faceStyle === 'star');
      drawGlossyEye(hx + 2.6, hy + 0.1, faceStyle === 'star');
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
    }

    if (style.beard) {
      const bGrad = ctx.createLinearGradient(hx, hy + 1.8, hx, hy + 5.2);
      bGrad.addColorStop(0, style.beard);
      bGrad.addColorStop(1, shadeHex(style.beard, -0.28));
      fillRoundRect(ctx, hx - 3.8, hy + 2.1, 7.6, 2.9, 1.4, bGrad, ol, 0.65);
    } else if (faceStyle === 'cat') {
      // Cute ":3" cat mouth!
      ctx.strokeStyle = '#9f3e2e';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.arc(hx - 0.8, hy + 2.4, 0.85, 0.1 * Math.PI, 0.95 * Math.PI);
      ctx.arc(hx + 0.8, hy + 2.4, 0.85, 0.05 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
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

    fillEllipse(ctx, hx + sign * 5.5, hy + 0.9, 0.9, 0.75, skinHi, ol, 0.65);
    fillEllipse(ctx, hx + sign * 1.8, hy + 2.0, 1.5, 0.9, 'rgba(244, 102, 122, 0.45)');

    if (faceStyle === 'cool' || faceStyle === 'cyber') {
      fillRoundRect(ctx, ex - 1.8, ey - 1.2, 3.6, 2.5, 0.8, faceStyle === 'cyber' ? '#06b6d4' : '#0f172a', '#334155', 0.7);
      fillEllipse(ctx, ex, ey - 0.4, 0.7, 0.35, '#e0f2fe');
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
    const hGrad = ctx.createRadialGradient(hx - 2.2, hy - 5.2, 0.8, hx, hy - 2.0, 7.8);
    hGrad.addColorStop(0, hairHi);
    hGrad.addColorStop(0.45, hair);
    hGrad.addColorStop(0.85, hairSh);
    hGrad.addColorStop(1, hairDeep);

    ctx.beginPath();
    ctx.arc(hx, hy - 1.4, 6.2, Math.PI * 0.92, Math.PI * 2.08);
    ctx.closePath();
    ctx.fillStyle = hGrad;
    ctx.fill();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 0.95;
    ctx.stroke();

    const drawLock = (lx, ly, lw, lh, rot = 0) => {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(rot);
      fillEllipse(ctx, 0, 0, lw, lh, hGrad, ol, 0.75);
      ctx.restore();
    };

    if (hairStyle === 'sidepart') {
      // Swept Korean Side-Part Bangs
      drawLock(hx - 2.5, hy - 2.6, 3.4, 2.1, -0.32);
      drawLock(hx + 2.8, hy - 2.7, 2.4, 1.8, 0.28);
    } else {
      drawLock(hx - 3.2, hy - 2.8, 2.2, 1.8, -0.25);
      drawLock(hx - 0.4, hy - 3.0, 2.4, 1.9, 0.05);
      drawLock(hx + 2.7, hy - 2.8, 2.2, 1.8, 0.25);
    }

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
    } else if (hairStyle === 'long' || hairStyle === 'twintails') {
      fillRoundRect(ctx, hx - 6.7, hy - 2.8, 2.4, 8.8, 1.2, hGrad, ol, 0.85);
      fillRoundRect(ctx, hx + 4.3, hy - 2.8, 2.4, 8.8, 1.2, hGrad, ol, 0.85);
      if (hairStyle === 'twintails') {
        fillEllipse(ctx, hx - 5.8, hy - 3.6, 1.4, 1.1, '#fb7185', ol, 0.6);
        fillEllipse(ctx, hx + 5.8, hy - 3.6, 1.4, 1.1, '#fb7185', ol, 0.6);
      }
    } else if (hairStyle === 'bun') {
      // Double Odango Space Buns on top!
      fillRoundRect(ctx, hx - 6.2, hy - 2.6, 2.0, 5.2, 1.0, hGrad, ol, 0.8);
      fillRoundRect(ctx, hx + 4.2, hy - 2.6, 2.0, 5.2, 1.0, hGrad, ol, 0.8);
      fillEllipse(ctx, hx - 4.8, hy - 5.8, 2.6, 2.5, hGrad, ol, 0.85);
      fillEllipse(ctx, hx + 4.8, hy - 5.8, 2.6, 2.5, hGrad, ol, 0.85);
      fillEllipse(ctx, hx - 4.8, hy - 4.2, 1.8, 0.7, '#fb7185');
      fillEllipse(ctx, hx + 4.8, hy - 4.2, 1.8, 0.7, '#fb7185');
    } else if (hairStyle === 'wolfcut') {
      // Layered Shaggy Wolf-Cut locks
      fillRoundRect(ctx, hx - 6.8, hy - 2.6, 2.6, 6.8, 1.2, hGrad, ol, 0.8);
      fillRoundRect(ctx, hx + 4.2, hy - 2.6, 2.6, 6.8, 1.2, hGrad, ol, 0.8);
      drawLock(hx - 6.2, hy + 2.8, 1.8, 1.2, -0.4);
      drawLock(hx + 6.2, hy + 2.8, 1.8, 1.2, 0.4);
    } else if (hairStyle === 'curly') {
      const puffs = [
        [hx - 5.4, hy - 2.5, 2.1], [hx + 5.4, hy - 2.5, 2.1],
        [hx - 4.0, hy - 5.3, 2.2], [hx + 4.0, hy - 5.3, 2.2],
        [hx, hy - 6.0, 2.4], [hx - 5.6, hy + 0.5, 1.8], [hx + 5.6, hy + 0.5, 1.8]
      ];
      puffs.forEach(([px0, py0, pr]) => fillEllipse(ctx, px0, py0, pr, pr * 0.92, hGrad, ol, 0.75));
    } else {
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

    if (hairStyle === 'long' || hairStyle === 'wolfcut') {
      fillRoundRect(ctx, hx - 6.4, hy - 1.0, 12.8, hairStyle === 'long' ? 12.2 : 9.4, 4.2, hGrad, ol, 0.95);
    } else if (hairStyle === 'twintails') {
      fillEllipse(ctx, hx - 5.6, hy + 2.8, 2.4, 5.6, hGrad, ol, 0.9);
      fillEllipse(ctx, hx + 5.6, hy + 2.8, 2.4, 5.6, hGrad, ol, 0.9);
    } else if (hairStyle === 'bun') {
      fillEllipse(ctx, hx - 4.8, hy - 5.8, 2.6, 2.5, hGrad, ol, 0.85);
      fillEllipse(ctx, hx + 4.8, hy - 5.8, 2.6, 2.5, hGrad, ol, 0.85);
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

  function drawHat25D(ctx, hx, hy, hatVal, trimColor, ol, dir) {
    if (hatVal === 'headphones') {
      // 2.5D RGB Gaming Headphones over hair!
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(hx, hy - 0.6, 6.6, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(hx, hy - 0.8, 6.6, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      // Left & Right Glowing Earcups
      fillRoundRect(ctx, hx - 7.8, hy - 1.6, 2.4, 4.4, 1.1, '#0f172a', '#38bdf8', 0.85);
      fillRoundRect(ctx, hx + 5.4, hy - 1.6, 2.4, 4.4, 1.1, '#0f172a', '#f472b6', 0.85);
      return;
    }

    if (hatVal === 'catears') {
      // Cute 2.5D Neko Cat Ears Headband!
      const drawEar = (ex, rot) => {
        ctx.save();
        ctx.translate(ex, hy - 5.4);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.moveTo(-2.4, 2.0);
        ctx.lineTo(0, -2.6);
        ctx.lineTo(2.4, 2.0);
        ctx.closePath();
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = ol;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-1.3, 1.4);
        ctx.lineTo(0, -1.3);
        ctx.lineTo(1.3, 1.4);
        ctx.closePath();
        ctx.fillStyle = '#fda4af';
        ctx.fill();
        ctx.restore();
      };
      drawEar(hx - 4.0, -0.25);
      drawEar(hx + 4.0, 0.25);
      return;
    }

    if (hatVal === 'crown') {
      // 2.5D Royal Golden Crown with Ruby & Sapphire Gems!
      ctx.beginPath();
      ctx.moveTo(hx - 4.8, hy - 4.4);
      ctx.lineTo(hx - 5.4, hy - 8.2);
      ctx.lineTo(hx - 2.2, hy - 6.0);
      ctx.lineTo(hx, hy - 9.0);
      ctx.lineTo(hx + 2.2, hy - 6.0);
      ctx.lineTo(hx + 5.4, hy - 8.2);
      ctx.lineTo(hx + 4.8, hy - 4.4);
      ctx.closePath();
      const cGrad = ctx.createLinearGradient(hx - 5, hy - 9, hx + 5, hy - 4);
      cGrad.addColorStop(0, '#fef08a');
      cGrad.addColorStop(0.5, '#f59e0b');
      cGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = cGrad;
      ctx.fill();
      ctx.strokeStyle = ol;
      ctx.lineWidth = 0.85;
      ctx.stroke();
      fillEllipse(ctx, hx, hy - 5.8, 1.0, 1.0, '#ef4444');
      return;
    }

    if (hatVal === 'straw' || hatVal === '#c85a17') {
      // Classic Stardew Valley Wide-Brimmed Straw Sun Hat!
      const brimGrad = ctx.createRadialGradient(hx - 2, hy - 4, 1, hx, hy - 3.5, 9);
      brimGrad.addColorStop(0, '#fef08a');
      brimGrad.addColorStop(0.6, '#eab308');
      brimGrad.addColorStop(1, '#a16207');
      fillEllipse(ctx, hx, hy - 3.5, 8.6, 2.4, brimGrad, ol, 0.9);
      // Straw dome & red ribbon
      ctx.beginPath();
      ctx.arc(hx, hy - 3.6, 5.2, Math.PI, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = brimGrad;
      ctx.fill();
      ctx.strokeStyle = ol;
      ctx.lineWidth = 0.85;
      ctx.stroke();
      fillRoundRect(ctx, hx - 5.1, hy - 4.6, 10.2, 1.3, 0.5, '#dc2626', ol, 0.5);
      return;
    }

    // Colored 2.5D Baseball Cap
    const hatColor = hatVal;
    const hatHi = shadeHex(hatColor, 0.32);
    const hatSh = shadeHex(hatColor, -0.28);
    const hGrad = ctx.createRadialGradient(hx - 2, hy - 6, 0.5, hx, hy - 4, 7);
    hGrad.addColorStop(0, hatHi);
    hGrad.addColorStop(0.6, hatColor);
    hGrad.addColorStop(1, hatSh);

    ctx.beginPath();
    ctx.arc(hx, hy - 2.8, 6.2, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = hGrad;
    ctx.fill();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 0.9;
    ctx.stroke();

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

    const sky = ctx.createLinearGradient(0, 0, 0, 34);
    sky.addColorStop(0, '#38bdf8');
    sky.addColorStop(0.6, '#bae6fd');
    sky.addColorStop(1, '#fef9c3');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 48, 36);

    fillEllipse(ctx, 10, 10, 6, 6, 'rgba(255, 251, 235, 0.65)');
    fillEllipse(ctx, 10, 10, 3.5, 3.5, '#fffbeb');
    fillEllipse(ctx, 12, 34, 20, 9, '#4d9c68');
    fillEllipse(ctx, 38, 33, 22, 10, '#3b8254');

    const ground = ctx.createLinearGradient(0, 33, 0, 48);
    ground.addColorStop(0, '#f3c26b');
    ground.addColorStop(1, '#d6963a');
    ctx.fillStyle = ground;
    ctx.fillRect(0, 34, 48, 14);

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

  // ==================== 2.5D STARDEW VALLEY TERRAIN (GOLDEN EARTH, EMERALD MEADOW & 3D CROPS) ====================
  function getStaticTileVariant(type, variant) {
    const key = '25d_sdv_' + type + '_' + variant;
    if (tileCache[key]) return tileCache[key];
    const c = makeCanvas(32, 32);
    const ctx = c.getContext('2d');

    if (type === 'grass') {
      const gGrad = ctx.createLinearGradient(0, 0, 32, 32);
      gGrad.addColorStop(0, variant % 2 === 0 ? '#5cc438' : '#55ba32');
      gGrad.addColorStop(1, variant % 2 === 0 ? '#449e26' : '#3f9422');
      ctx.fillStyle = gGrad;
      ctx.fillRect(0, 0, 32, 32);

      fillEllipse(ctx, 14, 14, 11, 8, 'rgba(163, 240, 110, 0.16)');

      const drawBladeTuft = (bx, by) => {
        fillEllipse(ctx, bx + 3, by + 4, 4, 1.4, 'rgba(18, 45, 12, 0.26)');
        ctx.strokeStyle = '#2b6e16';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(bx, by + 3); ctx.quadraticCurveTo(bx - 2, by - 2, bx - 3, by - 4);
        ctx.moveTo(bx + 3, by + 4); ctx.quadraticCurveTo(bx + 3, by - 2, bx + 4, by - 5);
        ctx.moveTo(bx + 6, by + 3); ctx.quadraticCurveTo(bx + 8, by - 1, bx + 9, by - 3);
        ctx.stroke();
        ctx.strokeStyle = '#9ef065';
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
        fillEllipse(ctx, 10, 22, 3.5, 1.5, 'rgba(15, 35, 12, 0.28)');
        fillEllipse(ctx, 9.5, 20, 3.0, 2.5, '#ffffff');
        fillEllipse(ctx, 9.5, 19.8, 1.3, 1.1, '#f59e0b');
      } else if (variant === 2) {
        // Lush 2.5D Clover / Fern Weed Cluster
        fillEllipse(ctx, 16, 19, 6.5, 2.5, 'rgba(12, 32, 10, 0.32)');
        fillEllipse(ctx, 13, 16, 4.5, 3.2, '#2b7a22', '#143d14', 0.7);
        fillEllipse(ctx, 19, 16, 4.5, 3.2, '#2b7a22', '#143d14', 0.7);
        fillEllipse(ctx, 16, 14, 4.5, 3.8, '#52b432', '#143d14', 0.7);
      } else if (variant === 3) {
        drawBladeTuft(8, 22);
        fillEllipse(ctx, 22, 14, 3.6, 1.5, 'rgba(15, 35, 12, 0.28)');
        fillEllipse(ctx, 21.5, 11.5, 3.2, 2.6, '#93c5fd');
        fillEllipse(ctx, 21.5, 11.3, 1.3, 1.1, '#fef08a');
      } else if (variant === 4) {
        fillEllipse(ctx, 19, 21, 3.6, 1.5, 'rgba(15, 35, 12, 0.28)');
        fillEllipse(ctx, 18.5, 18.5, 3.2, 2.6, '#fda4af');
        fillEllipse(ctx, 18.5, 18.3, 1.3, 1.1, '#fef08a');
        drawBladeTuft(8, 11);
      } else {
        // 2.5D Field Stones on grass
        fillEllipse(ctx, 21, 23, 5.0, 2.2, 'rgba(12, 28, 10, 0.34)');
        const pGrad = ctx.createRadialGradient(19, 20, 0.5, 20, 21, 4.5);
        pGrad.addColorStop(0, '#e2e8f0');
        pGrad.addColorStop(0.6, '#94a3b8');
        pGrad.addColorStop(1, '#475569');
        fillEllipse(ctx, 20, 21.2, 4.0, 2.6, pGrad, '#334155', 0.7);
      }
    } else if (type === 'path') {
      // Warm Golden-Ochre Stardew Farm Earth (#e5a94c -> #d99b3c) with 2.5D Pebbles & Divots
      const pGrad = ctx.createLinearGradient(0, 0, 0, 32);
      pGrad.addColorStop(0, '#eab257');
      pGrad.addColorStop(0.5, '#e3a648');
      pGrad.addColorStop(1, '#d69738');
      ctx.fillStyle = pGrad;
      ctx.fillRect(0, 0, 32, 32);

      if (variant === 0) {
        // Sunken 2.5D Circular Dirt Divot
        fillEllipse(ctx, 15, 15, 5.2, 3.4, '#b87622');
        fillEllipse(ctx, 15, 15.6, 4.4, 2.6, '#d99a3d');
      } else if (variant === 1 || variant === 3) {
        // 3D Golden-Brown Farm Pebbles
        fillEllipse(ctx, 10, 12, 3.2, 1.8, 'rgba(130, 78, 18, 0.32)');
        fillEllipse(ctx, 9.5, 11.2, 2.8, 1.5, '#f5c776');
        fillEllipse(ctx, 23, 21, 3.8, 2.0, 'rgba(130, 78, 18, 0.32)');
        fillEllipse(ctx, 22.5, 20.2, 3.2, 1.6, '#f2be68');
      } else if (variant === 2 || variant === 4) {
        // Tiny green dirt sprouts
        fillEllipse(ctx, 18, 20, 2.5, 1.0, 'rgba(110, 65, 14, 0.3)');
        fillEllipse(ctx, 17, 18.5, 2.0, 1.2, '#4cc438');
        fillEllipse(ctx, 19, 18.5, 2.0, 1.2, '#6ee048');
      }
    } else if (type === 'stone') {
      // 2.5D Extruded Cobblestone Path over Golden Farm Dirt
      ctx.fillStyle = '#c4822b';
      ctx.fillRect(0, 0, 32, 32);
      const stones = [
        [1, 1, 14, 13], [16, 1, 15, 13],
        [1, 16, 15, 14], [17, 16, 14, 14]
      ];
      stones.forEach(([sx, sy, sw, sh], idx) => {
        fillRoundRect(ctx, sx, sy + 1.5, sw, sh, 3.2, '#44403c');
        const stGrad = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
        stGrad.addColorStop(0, (idx + variant) % 2 === 0 ? '#e7e5e4' : '#d6d3d1');
        stGrad.addColorStop(0.6, (idx + variant) % 2 === 0 ? '#bfb9b2' : '#b5afa8');
        stGrad.addColorStop(1, '#8c857d');
        fillRoundRect(ctx, sx, sy, sw, sh - 1, 3.2, stGrad, '#44403c', 0.75);
      });
    } else if (type === 'soil') {
      // 2.5D Tilled Dark Farm Soil Bed + Volumetric Berry Bushes, Wooden Pole Trellises & Leafy Kale!
      ctx.drawImage(getStaticTileVariant('path', 0), 0, 0);
      fillRoundRect(ctx, 2, 3, 28, 26, 4, '#4a240b');
      const sGrad = ctx.createLinearGradient(3, 4, 3, 27);
      sGrad.addColorStop(0, '#6e3814');
      sGrad.addColorStop(1, '#87491e');
      fillRoundRect(ctx, 3, 4, 26, 24, 3.5, sGrad);
      fillRoundRect(ctx, 5, 7, 22, 5, 2, '#572b0e');
      fillRoundRect(ctx, 5, 17, 22, 5, 2, '#572b0e');

      if (variant % 3 === 0) {
        // 2.5D Volumetric Strawberry / Red-Berry Bush
        fillEllipse(ctx, 16, 23, 11, 4.5, 'rgba(20, 10, 4, 0.45)');
        const bGrad = ctx.createRadialGradient(13, 11, 1, 16, 15, 12);
        bGrad.addColorStop(0, '#86efac');
        bGrad.addColorStop(0.5, '#22c55e');
        bGrad.addColorStop(1, '#14532d');
        fillEllipse(ctx, 12, 16, 7.5, 6.5, bGrad, '#14532d', 0.8);
        fillEllipse(ctx, 20, 16, 7.5, 6.5, bGrad, '#14532d', 0.8);
        fillEllipse(ctx, 16, 12, 8.5, 7.0, bGrad, '#14532d', 0.8);
        // Glossy 3D Red Berries
        [[11, 15], [20, 14], [16, 18]].forEach(([bx, by]) => {
          fillEllipse(ctx, bx, by, 2.6, 2.6, '#ef4444', '#7f1d1d', 0.6);
          fillEllipse(ctx, bx - 0.7, by - 0.7, 0.8, 0.6, '#fecaca');
        });
      } else if (variant % 3 === 1) {
        // 2.5D Wooden Pole Trellis Crop
        fillEllipse(ctx, 16, 25, 6, 2.5, 'rgba(20, 10, 4, 0.42)');
        fillRoundRect(ctx, 14, 3, 4, 22, 1.5, '#8c4f23', '#3b1c08', 0.9);
        fillEllipse(ctx, 13, 19, 4.5, 3.0, '#22c55e', '#14532d', 0.7);
        fillEllipse(ctx, 19, 17, 4.5, 3.0, '#4ade80', '#14532d', 0.7);
        fillEllipse(ctx, 16, 13, 4.0, 2.8, '#86efac', '#14532d', 0.7);
      } else {
        // 2.5D Leafy Kale / Cauliflower Rosette
        fillEllipse(ctx, 16, 22, 9, 4, 'rgba(20, 10, 4, 0.42)');
        fillEllipse(ctx, 12, 16, 6, 4.5, '#22c55e', '#14532d', 0.75);
        fillEllipse(ctx, 20, 16, 6, 4.5, '#22c55e', '#14532d', 0.75);
        fillEllipse(ctx, 16, 13, 6.5, 5.0, '#4ade80', '#14532d', 0.75);
        fillEllipse(ctx, 16, 14, 3.8, 3.2, '#d9f99d');
      }
    } else if (type === 'fence') {
      // 2.5D Cylindrical Timber Fence Posts & Rails over Golden Farm Dirt
      ctx.drawImage(getStaticTileVariant('path', 0), 0, 0);
      fillRoundRect(ctx, 1, 24, 30, 5, 2, 'rgba(38, 20, 6, 0.34)');
      fillRoundRect(ctx, 0, 11, 32, 5, 1.5, '#c87838', '#3d200d', 1.0);
      fillRoundRect(ctx, 0, 19, 32, 5, 1.5, '#a85f27', '#3d200d', 1.0);
      [3, 21].forEach((px0) => {
        const pGrad = ctx.createLinearGradient(px0, 5, px0 + 8, 5);
        pGrad.addColorStop(0, '#e69d52');
        pGrad.addColorStop(0.5, '#b86b2e');
        pGrad.addColorStop(1, '#753c10');
        fillRoundRect(ctx, px0, 5, 8, 22, 2.5, pGrad, '#3b1c08', 1.0);
        fillEllipse(ctx, px0 + 4, 6.2, 3.6, 1.8, '#f5be78', '#3b1c08', 0.7);
      });
    }

    tileCache[key] = c;
    return c;
  }

  function drawTile(ctx, type, gx, gy, wx, wy, tick, grid) {
    const hash = ((gx * 73856093) ^ (gy * 19349663)) >>> 0;

    if (type === 'water') {
      const wGrad = ctx.createLinearGradient(wx, wy, wx + 32, wy + 32);
      wGrad.addColorStop(0, '#0284c7');
      wGrad.addColorStop(0.5, '#0369a1');
      wGrad.addColorStop(1, '#075985');
      ctx.fillStyle = wGrad;
      ctx.fillRect(wx, wy, 32, 32);

      const wave = Math.sin(tick / 14 + gx * 0.7 + gy * 0.5);
      fillEllipse(ctx, wx + 12 + wave * 3, wy + 10, 6, 1.4, 'rgba(125, 211, 252, 0.45)');
      fillEllipse(ctx, wx + 21 - wave * 2.5, wy + 23, 7, 1.5, 'rgba(186, 230, 253, 0.40)');

      if (grid) {
        const up = gy > 0 && grid[gy - 1][gx] !== 'water' && grid[gy - 1][gx] !== 'bridge';
        const dn = gy < grid.length - 1 && grid[gy + 1][gx] !== 'water' && grid[gy + 1][gx] !== 'bridge';
        const lt = gx > 0 && grid[gy][gx - 1] !== 'water' && grid[gy][gx - 1] !== 'bridge';
        const rt = gx < grid[0].length - 1 && grid[gy][gx + 1] !== 'water' && grid[gy][gx + 1] !== 'bridge';

        if (up) {
          const cliffGrad = ctx.createLinearGradient(wx, wy, wx, wy + 11);
          cliffGrad.addColorStop(0, '#c8872e');
          cliffGrad.addColorStop(0.4, '#8c5520');
          cliffGrad.addColorStop(1, '#4a280d');
          ctx.fillStyle = cliffGrad;
          ctx.fillRect(wx, wy, 32, 10);
          ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
          ctx.fillRect(wx + 1, wy + 10 + Math.round(wave), 30, 2);
        }
        if (dn) {
          ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
          ctx.fillRect(wx + 2, wy + 27, 28, 2);
          ctx.fillStyle = '#5c3614';
          ctx.fillRect(wx, wy + 29, 32, 3);
        }
        if (lt) {
          ctx.fillStyle = '#7a4a1d';
          ctx.fillRect(wx, wy, 5, 32);
        }
        if (rt) {
          ctx.fillStyle = '#7a4a1d';
          ctx.fillRect(wx + 27, wy, 5, 32);
        }
      }

      if (hash % 13 === 0) {
        fillEllipse(ctx, wx + 16, wy + 19, 7.5, 4.8, 'rgba(4, 24, 42, 0.42)');
        fillEllipse(ctx, wx + 15, wy + 16, 7, 4.5, '#22c55e', '#14532d', 0.7);
        if (hash % 26 === 0) {
          fillEllipse(ctx, wx + 15, wy + 14.5, 3.2, 2.2, '#fda4af', '#9f1239', 0.5);
        }
      }
      return;
    }

    if (type === 'bridge') {
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(wx, wy, 32, 32);
      ctx.fillStyle = 'rgba(3, 18, 34, 0.52)';
      ctx.fillRect(wx, wy + 24, 32, 7);
      ctx.fillStyle = '#5c3114';
      ctx.fillRect(wx, wy + 23, 32, 5);
      for (let i = 0; i < 32; i += 8) {
        fillRoundRect(ctx, wx + i + 0.5, wy + 3, 7, 21, 1.2, '#c87d3b', '#3d200d', 0.7);
      }
      fillRoundRect(ctx, wx, wy + 1, 32, 3.5, 1, '#e6b072', '#3d200d', 0.85);
      fillRoundRect(ctx, wx, wy + 22, 32, 3.5, 1, '#c98849', '#3d200d', 0.85);
      return;
    }

    const variant = hash % 6;
    ctx.drawImage(getStaticTileVariant(type, variant), wx, wy);

    // 2.5D Scalloped Stardew Grass-Over-Dirt Beveled Terrace Edges!
    if ((type === 'path' || type === 'stone') && grid) {
      const upGrass = gy > 0 && grid[gy - 1][gx] === 'grass';
      const dnGrass = gy < grid.length - 1 && grid[gy + 1][gx] === 'grass';
      const ltGrass = gx > 0 && grid[gy][gx - 1] === 'grass';
      const rtGrass = gx < grid[0].length - 1 && grid[gy][gx + 1] === 'grass';

      if (upGrass) {
        ctx.fillStyle = 'rgba(84, 48, 12, 0.35)';
        ctx.fillRect(wx, wy + 4, 32, 4);
        ctx.fillStyle = '#2b6e16';
        ctx.fillRect(wx, wy, 32, 4);
        for (let tx0 = 4; tx0 <= 28; tx0 += 8) {
          fillEllipse(ctx, wx + tx0, wy + 2.5, 4.5, 3.0, '#52b432');
          fillEllipse(ctx, wx + tx0, wy + 1.5, 3.0, 1.8, '#86efac');
        }
      }
      if (dnGrass) {
        for (let tx0 = 4; tx0 <= 28; tx0 += 8) {
          fillEllipse(ctx, wx + tx0, wy + 30, 4.5, 2.8, '#449e26');
        }
      }
      if (ltGrass) {
        ctx.fillStyle = '#449e26';
        ctx.fillRect(wx, wy, 3.5, 32);
      }
      if (rtGrass) {
        ctx.fillStyle = '#449e26';
        ctx.fillRect(wx + 28.5, wy, 3.5, 32);
      }
    }
  }

  // ==================== 2.5D VOLUMETRIC STARDEW TREES (OAK, PINE & PINK SAKURA) ====================
  function getTreeSprite(variant) {
    const key = '25d_sdv_tree_' + variant;
    if (treeCache[key]) return treeCache[key];
    const c = makeCanvas(76, 86);
    const ctx = c.getContext('2d');
    const ol = '#1a2916';

    ctx.save();
    ctx.translate(42, 70);
    ctx.rotate(0.18);
    const shGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
    shGrad.addColorStop(0, 'rgba(28, 20, 8, 0.45)');
    shGrad.addColorStop(0.65, 'rgba(28, 20, 8, 0.22)');
    shGrad.addColorStop(1, 'rgba(28, 20, 8, 0)');
    fillEllipse(ctx, 0, 0, 24, 8.5, shGrad);
    ctx.restore();

    // 3D Cylindrical Trunk with flared roots & acorns
    const trGrad = ctx.createLinearGradient(29, 44, 45, 44);
    trGrad.addColorStop(0, '#c87d3b');
    trGrad.addColorStop(0.45, '#8c4c1e');
    trGrad.addColorStop(1, '#42200a');
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
    fillEllipse(ctx, 37, 46, 9, 4, 'rgba(15, 10, 5, 0.45)');

    const isSakura = variant === 2;
    const isPine = variant === 1;
    const cTop = isSakura ? '#fff1f2' : isPine ? '#86efac' : '#d9f99d';
    const cHi  = isSakura ? '#fda4af' : isPine ? '#2dd4bf' : '#4ade80';
    const cMid = isSakura ? '#e11d48' : isPine ? '#0f766e' : '#16a34a';
    const cSh  = isSakura ? '#881337' : isPine ? '#134e4a' : '#14532d';

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

    fillEllipse(ctx, 31, 12, 7, 3.2, 'rgba(255,255,255,0.28)');
    fillEllipse(ctx, 19, 20, 5, 2.4, 'rgba(255,255,255,0.24)');

    treeCache[key] = c;
    return c;
  }

  function drawTree(ctx, wx, wy, variant = 0, tick = 0) {
    const sway = Math.sin(tick / 32 + wx * 0.04) * 1.4;
    ctx.drawImage(getTreeSprite(variant), Math.floor(wx - 22 + sway), Math.floor(wy - 48));
  }

  // ==================== 2.5D STARDEW VALLEY FARMHOUSE & LAB BUILDINGS (WITH 3/4 EXTRUDED SIDE WALL, LOG ALCOVE & PORCH) ====================
  function drawBuilding(ctx, b, isOnline, tick) {
    ctx.save();
    const x = b.tx * 32;
    const y = b.ty * 32;
    const w = b.tw * 32;
    const h = b.th * 32;
    const depthX = 14;
    const depthY = -9;
    const ol = '#261307';

    const roofBase = b.roofColor || '#b8332a';
    const roofHi = shadeHex(roofBase, 0.26);
    const roofDark = b.roofDark || shadeHex(roofBase, -0.28);
    const roofSide = shadeHex(roofBase, -0.42);

    // 1. 2.5D Directional Sun Cast Shadow
    ctx.fillStyle = 'rgba(24, 16, 6, 0.34)';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w + depthX + 14, y + h + depthY + 8);
    ctx.lineTo(x + w + depthX + 14, y + 26 + depthY);
    ctx.lineTo(x + w, y + 26);
    ctx.closePath();
    ctx.fill();
    fillRoundRect(ctx, x + 4, y + h - 4, w + depthX, 13, 5, 'rgba(24, 16, 6, 0.28)');

    // 2. 2.5D Extruded 3/4 Right Side Wall & Side Log Beam Columns
    ctx.beginPath();
    ctx.moveTo(x + w - 6, y + 24);
    ctx.lineTo(x + w - 6 + depthX, y + 24 + depthY);
    ctx.lineTo(x + w - 6 + depthX, y + h - 4 + depthY);
    ctx.lineTo(x + w - 6, y + h - 4);
    ctx.closePath();
    const sideGrad = ctx.createLinearGradient(x + w - 6, y + 24, x + w + depthX, y + h);
    sideGrad.addColorStop(0, '#9e581c');
    sideGrad.addColorStop(1, '#592b0e');
    ctx.fillStyle = sideGrad;
    ctx.fill();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 3. Main Vertical Wood-Plank Farmhouse Facade
    const wallGrad = ctx.createLinearGradient(x, y + 24, x, y + h - 18);
    wallGrad.addColorStop(0, '#e69d52');
    wallGrad.addColorStop(0.55, '#cf823a');
    wallGrad.addColorStop(1, '#a85e21');
    fillRoundRect(ctx, x + 2, y + 24, w - 8, h - 40, 2, wallGrad, ol, 1.8);

    // Vertical wood plank seams
    ctx.strokeStyle = 'rgba(110, 52, 14, 0.38)';
    ctx.lineWidth = 1.1;
    for (let px0 = x + 10; px0 < x + w - 10; px0 += 7) {
      ctx.beginPath();
      ctx.moveTo(px0, y + 26);
      ctx.lineTo(px0, y + h - 20);
      ctx.stroke();
    }

    // 4. Left Firewood Log-Stack Alcove (Volumetric Stacked Logs!)
    const alcX = x + 8;
    const alcY = y + 38;
    const alcW = Math.min(54, Math.floor(w * 0.28));
    const alcH = h - 60;
    fillRoundRect(ctx, alcX, alcY, alcW, alcH, 2.5, '#3b1c08', ol, 1.2);
    for (let ry = alcY + 5; ry < alcY + alcH - 4; ry += 7) {
      const shift = ((ry - alcY) % 14 === 0) ? 0 : 3.5;
      for (let rx = alcX + 6 + shift; rx < alcX + alcW - 5; rx += 7.5) {
        const logGrad = ctx.createRadialGradient(rx - 0.8, ry - 0.8, 0.4, rx, ry, 3.6);
        logGrad.addColorStop(0, '#fde68a');
        logGrad.addColorStop(0.6, '#d98f46');
        logGrad.addColorStop(1, '#6e380d');
        fillEllipse(ctx, rx, ry, 3.4, 3.4, logGrad, '#2b1306', 0.7);
      }
    }

    // 5. Elevated 2.5D Wooden Front Porch Deck + 3-Step Stairs + Flower Barrel!
    const porchY = y + h - 22;
    const pGrad = ctx.createLinearGradient(x, porchY, x, porchY + 20);
    pGrad.addColorStop(0, '#eba55b');
    pGrad.addColorStop(0.45, '#c87834');
    pGrad.addColorStop(1, '#7c4316');
    fillRoundRect(ctx, x + 1, porchY, w - 6, 20, 2.5, pGrad, ol, 1.6);

    const doorX = x + Math.floor(w * 0.56) - 14;
    const stairX = doorX - 8;
    for (let st = 0; st < 3; st++) {
      fillRoundRect(ctx, stairX - st, porchY + 6 + st * 4.5, 42 + st * 2, 4.5, 1.2, st % 2 === 0 ? '#eab068' : '#c87834', ol, 1.0);
    }

    // 6. Front Wooden Cabin Door + Glowing Window Pane + Red Doormat
    const doorY = porchY - 34;
    fillRoundRect(ctx, doorX, doorY, 26, 34, 3, '#9a5220', ol, 1.5);
    fillRoundRect(ctx, doorX + 3, doorY + 3, 20, 28, 2, '#c87838');
    fillRoundRect(ctx, doorX + 5, doorY + 5, 16, 11, 1.5, isOnline ? '#fef08a' : '#7dd3fc', '#4a250a', 1.0);
    fillEllipse(ctx, doorX + 20, doorY + 19, 1.8, 1.8, '#fbbf24', '#78350f', 0.6);
    fillRoundRect(ctx, doorX + 1, porchY + 1, 24, 6, 1.5, '#dc2626', '#7f1d1d', 0.9);

    // 7. Green-Shuttered Cottage Window
    const winX = doorX - 36;
    const winY = doorY + 3;
    fillRoundRect(ctx, winX - 7, winY, 7, 22, 1.5, '#5c9446', ol, 1.0);
    fillRoundRect(ctx, winX + 20, winY, 7, 22, 1.5, '#5c9446', ol, 1.0);
    fillRoundRect(ctx, winX, winY, 20, 22, 2, '#f8fafc', ol, 1.2);
    fillRoundRect(ctx, winX + 2.5, winY + 2.5, 15, 17, 1, isOnline ? '#fde047' : '#64748b');
    px(ctx, winX + 9, winY + 2, 2, 18, '#f8fafc');
    px(ctx, winX + 2, winY + 10, 16, 2, '#f8fafc');

    // 8. Overflowing Flower Barrel on Right Side of Porch
    const barX = x + w - 28;
    const barY = porchY - 12;
    fillRoundRect(ctx, barX, barY + 4, 15, 14, 2.5, '#a85e21', ol, 1.1);
    fillEllipse(ctx, barX + 7.5, barY + 2, 9, 4.5, '#22c55e', '#14532d', 0.8);
    fillEllipse(ctx, barX + 4, barY, 3, 2.5, '#f43f5e');
    fillEllipse(ctx, barX + 11, barY - 1, 3, 2.5, '#a855f7');
    fillEllipse(ctx, barX + 8, barY + 2, 2.8, 2.2, '#38bdf8');

    // 9. Brick Chimney + Volumetric 2.5D Smoke Puffs
    const chX = x + w - 34;
    const chY = y - 16;
    fillRoundRect(ctx, chX, chY, 15, 24, 2, '#9e3b2c', ol, 1.3);
    if (isOnline) {
      for (let i = 0; i < 3; i++) {
        const p = ((tick * 0.45 + i * 14) % 45);
        const alpha = Math.max(0, 0.58 - p / 75);
        const sx = chX + 7 + Math.sin(p * 0.15 + i) * 4;
        const sy = chY - 5 - p * 0.7;
        fillEllipse(ctx, sx, sy, 4 + p * 0.12, 3.5 + p * 0.1, `rgba(255,255,255,${alpha})`);
      }
    }

    // 10. 2.5D Extruded Side Roof Plane + Pitched Front Shingle Roof + Gable Peak with Round Attic Window!
    ctx.beginPath();
    ctx.moveTo(x + w - 12, y - 4);
    ctx.lineTo(x + w - 12 + depthX, y - 4 + depthY);
    ctx.lineTo(x + w + depthX, y + 28 + depthY);
    ctx.lineTo(x + w, y + 28);
    ctx.closePath();
    ctx.fillStyle = roofSide;
    ctx.fill();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const rGrad = ctx.createLinearGradient(x, y - 6, x, y + 30);
    rGrad.addColorStop(0, roofHi);
    rGrad.addColorStop(0.5, roofBase);
    rGrad.addColorStop(1, roofDark);
    fillRoundRect(ctx, x - 4, y - 4, w - 2, 34, 4, rGrad, ol, 1.8);

    // Standing roof seam ribs
    ctx.strokeStyle = 'rgba(25, 8, 2, 0.25)';
    ctx.lineWidth = 1.4;
    for (let rx = x + 8; rx < x + w - 12; rx += 14) {
      ctx.beginPath();
      ctx.moveTo(rx, y - 2);
      ctx.lineTo(rx, y + 28);
      ctx.stroke();
    }

    // Front Gable Triangle over the Door + Round Attic Louver Window
    const gabCX = doorX + 13;
    ctx.beginPath();
    ctx.moveTo(gabCX - 46, y + 28);
    ctx.lineTo(gabCX, y - 6);
    ctx.lineTo(gabCX + 46, y + 28);
    ctx.closePath();
    ctx.fillStyle = '#d98b42';
    ctx.fill();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Thick 2.5D Gable Roof Eave Frame
    ctx.strokeStyle = roofHi;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(gabCX - 48, y + 28);
    ctx.lineTo(gabCX, y - 7);
    ctx.lineTo(gabCX + 48, y + 28);
    ctx.stroke();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Round Attic Window inside Gable Peak
    fillEllipse(ctx, gabCX, y + 12, 6.5, 6.5, '#527994', ol, 1.4);
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(gabCX - 6, y + 12); ctx.lineTo(gabCX + 6, y + 12);
    ctx.moveTo(gabCX, y + 6); ctx.lineTo(gabCX, y + 18);
    ctx.stroke();

    // 11. Roadside 2.5D Mailbox
    const mbX = x + w + 4;
    const mbY = y + h - 22;
    fillRoundRect(ctx, mbX + 4, mbY + 8, 4, 14, 1, '#8c4b1a', ol, 1.0);
    fillRoundRect(ctx, mbX, mbY, 12, 9, 3, '#64748b', ol, 1.1);
    fillRoundRect(ctx, mbX + 10, mbY + 2, 2.5, 4, 1, '#ef4444');

    // 12. Beveled Wooden Signboard with Online LED
    const signW = Math.min(w - 16, 138);
    const signX = x + 6;
    const signY = y + 3;
    fillRoundRect(ctx, signX, signY, signW, 18, 4, '#fffbeb', ol, 1.4);
    const blink = Math.floor(tick / 18) % 2 === 0;
    fillEllipse(ctx, signX + 9, signY + 9, 3.8, 3.8, isOnline ? '#22c55e' : (blink ? '#ef4444' : '#7f1d1d'), ol, 0.8);

    ctx.fillStyle = '#2b1304';
    ctx.font = 'bold 10.5px Kanit, Tahoma, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(b.shortName, signX + 16, signY + 13);
    ctx.restore();
  }

  // ==================== 2.5D TOWN SHOPS & SCENERY BUILDINGS (EXPANDED 7x4 IT GENERAL STORE, CAFE, GREENHOUSE, BARN) ====================
  function drawSceneryBuilding(ctx, sb, tick) {
    ctx.save();
    const x = sb.tx * 32;
    const y = sb.ty * 32;
    const w = sb.tw * 32;
    const h = sb.th * 32;
    const depthX = 14;
    const depthY = -9;
    const ol = '#261307';

    // 1. GRAND 2.5D 2-STORY SERVER VALLEY IT GENERAL STORE (7x4 tiles = 224x128 px)
    if (sb.kind === 'it_store') {
      // 2.5D Angled Ground Shadow
      ctx.fillStyle = 'rgba(20, 14, 6, 0.34)';
      ctx.beginPath();
      ctx.moveTo(x + 6, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w + depthX + 16, y + h + depthY + 8);
      ctx.lineTo(x + w + depthX + 16, y + 10 + depthY);
      ctx.lineTo(x + w, y + 10);
      ctx.closePath();
      ctx.fill();

      // 3/4 Extruded Right Side Wall of 2-Story Store
      ctx.beginPath();
      ctx.moveTo(x + w - 4, y + 14);
      ctx.lineTo(x + w - 4 + depthX, y + 14 + depthY);
      ctx.lineTo(x + w - 4 + depthX, y + h - 4 + depthY);
      ctx.lineTo(x + w - 4, y + h - 4);
      ctx.closePath();
      ctx.fillStyle = '#b45309';
      ctx.fill();
      ctx.strokeStyle = ol;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // 2.5D Pitched Upper Roof
      const rGrad = ctx.createLinearGradient(x, y - 14, x, y + 22);
      rGrad.addColorStop(0, '#f87171');
      rGrad.addColorStop(0.5, '#dc2626');
      rGrad.addColorStop(1, '#7f1d1d');
      fillRoundRect(ctx, x - 4, y - 14, w + 4, 36, 5, rGrad, ol, 1.8);

      // Grand 2.5D Rooftop Billboard Sign ("🏪 ห้างอุปกรณ์ไอที IT GENERAL STORE")
      const billW = 182;
      const billX = x + Math.floor((w - billW) / 2);
      const billY = y - 25;
      fillRoundRect(ctx, billX, billY, billW, 25, 5, '#78350f', ol, 1.8);
      fillRoundRect(ctx, billX + 3, billY + 3, billW - 6, 19, 3.5, '#fef3c7');
      const bulbOn = Math.floor(tick / 12) % 2 === 0;
      fillEllipse(ctx, billX + 9, billY + 12, 3, 3, bulbOn ? '#f59e0b' : '#22c55e');
      fillEllipse(ctx, billX + billW - 9, billY + 12, 3, 3, bulbOn ? '#22c55e' : '#f59e0b');
      ctx.fillStyle = '#7f1d1d';
      ctx.font = 'bold 11.5px Kanit, Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏪 ห้างอุปกรณ์ไอที IT GENERAL STORE', billX + billW / 2, billY + 16);

      // Main Timber-Framed Storefront Wall
      const wGrad = ctx.createLinearGradient(x, y + 20, x, y + h);
      wGrad.addColorStop(0, '#fffbeb');
      wGrad.addColorStop(1, '#f3d39c');
      fillRoundRect(ctx, x + 2, y + 20, w - 6, h - 22, 3, wGrad, ol, 1.8);

      // Full-Width 2.5D Red & White Striped Canopy Awning with Scalloped Valance!
      const awnY = y + 22;
      fillRoundRect(ctx, x - 5, awnY, w + 6, 22, 4, '#7f1d1d', ol, 1.6);
      for (let ax = x - 2; ax < x + w - 6; ax += 12) {
        const isRed = Math.floor((ax - x) / 12) % 2 === 0;
        fillRoundRect(ctx, ax, awnY + 2, 12, 17, 2.5, isRed ? '#ef4444' : '#fffbeb');
      }
      ctx.fillStyle = 'rgba(28, 12, 4, 0.28)';
      ctx.fillRect(x + 4, awnY + 22, w - 12, 6);

      // Left & Right Large Illuminated Showcase Windows with 2.5D IT Hardware inside
      [x + 14, x + w - 72].forEach((wx, idx) => {
        fillRoundRect(ctx, wx, y + 50, 56, 36, 3.5, '#7c431e', ol, 1.4);
        const gGlow = ctx.createLinearGradient(wx, y + 52, wx, y + 84);
        gGlow.addColorStop(0, '#fef9c3');
        gGlow.addColorStop(1, '#fde047');
        fillRoundRect(ctx, wx + 3, y + 53, 50, 30, 2, gGlow);
        // Display shelf & hardware inside window
        px(ctx, wx + 5, y + 69, 46, 2, '#b45309');
        fillRoundRect(ctx, wx + 8, y + 57, 16, 11, 1.5, '#0f172a');
        fillRoundRect(ctx, wx + 10, y + 59, 12, 7, 1, idx === 0 ? '#38bdf8' : '#4ade80');
        fillRoundRect(ctx, wx + 30, y + 58, 14, 10, 2, idx === 0 ? '#2563eb' : '#dc2626');
        fillRoundRect(ctx, wx + 10, y + 72, 14, 8, 1.5, '#d97706');
        fillRoundRect(ctx, wx + 30, y + 72, 14, 8, 1.5, '#7c3aed');
      });

      // Center Double Glass Entrance Doors + "OPEN" Plaque
      const doorX = x + Math.floor(w / 2) - 20;
      const doorY = y + 48;
      fillRoundRect(ctx, doorX, doorY, 40, 56, 3, '#9a5220', ol, 1.5);
      fillRoundRect(ctx, doorX + 4, doorY + 5, 14, 30, 2, '#bae6fd', '#4a250a', 0.9);
      fillRoundRect(ctx, doorX + 22, doorY + 5, 14, 30, 2, '#bae6fd', '#4a250a', 0.9);
      fillRoundRect(ctx, doorX + 11, doorY + 14, 18, 9, 2, '#16a34a', '#052e16', 0.8);

      // Raised Wooden Storefront Porch + Red Carpet Mat + Outdoor Display Stalls
      const porchY = y + h - 22;
      fillRoundRect(ctx, x - 2, porchY, w + 2, 22, 3, '#c87834', ol, 1.6);
      fillRoundRect(ctx, doorX - 2, porchY + 3, 44, 13, 2.5, '#dc2626', '#7f1d1d', 1.1);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 9.5px Kanit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛒 ซื้อของ [E]', doorX + 20, porchY + 13);

      // Left Outdoor Merchandise Table & Right "SALE" Signboard
      fillRoundRect(ctx, x + 10, porchY - 8, 48, 16, 2.5, '#b86b2e', ol, 1.2);
      fillRoundRect(ctx, x + 14, porchY - 13, 12, 9, 2, '#2563eb', ol, 0.9);
      fillRoundRect(ctx, x + 29, porchY - 13, 12, 9, 2, '#f59e0b', ol, 0.9);
      fillRoundRect(ctx, x + 43, porchY - 12, 10, 8, 2, '#16a34a', ol, 0.9);
      fillRoundRect(ctx, x + w - 52, porchY - 12, 18, 20, 2.5, '#fbbf24', ol, 1.1);
      ctx.restore();
      return;
    }

    // 2. SMART 2.5D GLASS GREENHOUSE
    if (sb.kind === 'greenhouse') {
      fillRoundRect(ctx, x + 4, y + h - 4, w + 10, 12, 5, 'rgba(20, 28, 14, 0.30)');
      fillRoundRect(ctx, x + 2, y + 26, w - 4, h - 28, 4, '#78716c', ol, 1.6);
      const gGrad = ctx.createLinearGradient(x, y + 10, x + w, y + h);
      gGrad.addColorStop(0, 'rgba(224, 242, 254, 0.92)');
      gGrad.addColorStop(0.5, 'rgba(125, 211, 252, 0.85)');
      gGrad.addColorStop(1, 'rgba(56, 189, 248, 0.88)');
      fillRoundRect(ctx, x + 6, y + 10, w - 12, h - 24, 8, gGrad, '#334155', 1.6);
      // Lush trees visible inside greenhouse glass
      for (let gx = x + 24; gx < x + w - 20; gx += 28) {
        fillEllipse(ctx, gx, y + 54, 12, 15, 'rgba(22, 163, 74, 0.75)');
        fillEllipse(ctx, gx - 2, y + 48, 8, 10, 'rgba(74, 222, 128, 0.75)');
        fillEllipse(ctx, gx + 3, y + 52, 2.5, 2.5, '#ef4444');
      }
      // Curved Glass Roof Ribs
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.6;
      for (let fx = x + 22; fx < x + w - 16; fx += 22) {
        ctx.beginPath();
        ctx.moveTo(fx, y + 10);
        ctx.lineTo(fx, y + h - 14);
        ctx.stroke();
      }
      const doorX = x + Math.floor(w / 2) - 14;
      fillRoundRect(ctx, doorX, y + h - 36, 28, 34, 3, '#b86b2e', ol, 1.4);
      fillRoundRect(ctx, x + 36, y + 4, w - 72, 17, 4, '#fffbeb', ol, 1.3);
      ctx.fillStyle = '#14532d';
      ctx.font = 'bold 10px Kanit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sb.shortName, x + w / 2, y + 16);
      ctx.restore();
      return;
    }

    // 3. STARDEW RED BARN & 2.5D CYLINDRICAL FARM SILO
    if (sb.kind === 'barn') {
      const siloX = x + w - 34;
      const siloY = y - 26;
      const sGrad = ctx.createLinearGradient(siloX, siloY, siloX + 32, siloY);
      sGrad.addColorStop(0, '#f59e0b');
      sGrad.addColorStop(0.5, '#b45309');
      sGrad.addColorStop(1, '#78350f');
      fillRoundRect(ctx, siloX, siloY + 8, 32, h + 16, 6, sGrad, ol, 1.6);
      fillEllipse(ctx, siloX + 16, siloY + 8, 16, 10, '#cbd5e1', ol, 1.5);

      const bw = w - 28;
      fillRoundRect(ctx, x + 2, y + 20, bw, h - 22, 3, '#dc2626', ol, 1.8);
      fillRoundRect(ctx, x - 2, y - 2, bw + 8, 28, 5, '#7f1d1d', ol, 1.8);
      const doorX = x + Math.floor(bw / 2) - 22;
      fillRoundRect(ctx, doorX, y + h - 42, 44, 40, 2, '#f8fafc', ol, 1.4);
      fillRoundRect(ctx, doorX + 4, y + h - 38, 16, 32, 1, '#dc2626');
      fillRoundRect(ctx, doorX + 24, y + h - 38, 16, 32, 1, '#dc2626');
      fillRoundRect(ctx, x + 16, y + 4, bw - 32, 17, 4, '#fffbeb', ol, 1.3);
      ctx.fillStyle = '#7f1d1d';
      ctx.font = 'bold 10px Kanit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sb.shortName, x + bw / 2, y + 16);
      ctx.restore();
      return;
    }

    // 4. CAFE & BAKERY / BOOKSTORE / HARDWARE FORGE / VILLAGER COTTAGES
    drawBuilding(ctx, { ...sb, units: [] }, true, tick);
    const porchY = y + h - 22;
    if (sb.kind === 'cafe' || sb.kind === 'bookstore') {
      const c1 = sb.kind === 'cafe' ? '#15803d' : '#1d4ed8';
      const c2 = sb.kind === 'cafe' ? '#fef9c3' : '#eff6ff';
      for (let ax = x + 4; ax < x + w - 14; ax += 12) {
        const alt = Math.floor((ax - x) / 12) % 2 === 0;
        fillRoundRect(ctx, ax, y + 28, 12, 12, 2, alt ? c1 : c2, ol, 0.8);
      }
    } else if (sb.kind === 'forge') {
      fillRoundRect(ctx, x + 10, porchY - 22, 30, 26, 3, '#57534e', ol, 1.3);
      const glow = Math.floor(tick / 8) % 2 === 0 ? '#f97316' : '#fbbf24';
      fillEllipse(ctx, x + 25, porchY - 6, 8, 5, glow);
    }
    ctx.restore();
  }

  // ==================== 2.5D SERVER RACK / BEEHOUSE NODE ====================
  function drawServerRack(ctx, wx, wy, online, tick) {
    const ol = '#0f172a';
    fillEllipse(ctx, wx + 18, wy + 29, 16, 5.5, 'rgba(10, 18, 12, 0.42)');
    if (online) {
      const glow = ctx.createRadialGradient(wx + 16, wy + 14, 2, wx + 16, wy + 14, 26);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      fillEllipse(ctx, wx + 16, wy + 18, 24, 14, glow);
    }

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

    ctx.beginPath();
    ctx.moveTo(wx + 25, wy - 9);
    ctx.lineTo(wx + 31, wy - 14);
    ctx.lineTo(wx + 31, wy + 23);
    ctx.lineTo(wx + 25, wy + 28);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.stroke();

    const cabGrad = ctx.createLinearGradient(wx + 3, wy - 9, wx + 25, wy + 28);
    cabGrad.addColorStop(0, '#475569');
    cabGrad.addColorStop(1, '#1e293b');
    fillRoundRect(ctx, wx + 3, wy - 9, 22, 37, 2, cabGrad, ol, 1.4);

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
  }

  // ==================== 2.5D EXTRUDED TREASURE CRATE ====================
  function drawCrate(ctx, wx, wy, opened, tick) {
    const ol = '#291507';
    fillEllipse(ctx, wx + 17, wy + 26, 14, 4.5, 'rgba(10, 18, 10, 0.38)');

    const topCol = opened ? '#6b4829' : '#f5b062';
    const frontCol = opened ? '#573a20' : '#c97d36';
    const sideCol = opened ? '#3d2815' : '#8f531d';

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

    ctx.beginPath();
    ctx.moveTo(wx + 24, wy + 9);
    ctx.lineTo(wx + 29, wy + 4);
    ctx.lineTo(wx + 29, wy + 20);
    ctx.lineTo(wx + 24, wy + 25);
    ctx.closePath();
    ctx.fillStyle = sideCol;
    ctx.fill();
    ctx.stroke();

    fillRoundRect(ctx, wx + 4, wy + 9, 20, 16, 1.5, frontCol, ol, 1.4);
    ctx.fillStyle = '#334155';
    ctx.fillRect(wx + 5, wy + 14, 18, 2.5);
    fillRoundRect(ctx, wx + 11.5, wy + 12.5, 5, 5.5, 1.2, '#fbbf24', ol, 0.9);

    if (!opened) {
      const dy = Math.sin(tick / 10) * 2.5;
      fillEllipse(ctx, wx + 16, wy - 2 + dy, 5, 5, 'rgba(253, 224, 71, 0.32)');
      fillEllipse(ctx, wx + 16, wy - 2 + dy, 2.4, 2.4, '#fef08a', '#ca8a04', 0.7);
    }
  }

  // ==================== 2.5D ROOFED COBBLESTONE WATER WELL ====================
  function drawFountain(ctx, wx, wy, tick) {
    const ol = '#291507';
    fillEllipse(ctx, wx + 34, wy + 25, 38, 12, 'rgba(18, 22, 12, 0.38)');

    // 3D Cylindrical Cobblestone Well Base
    const wGrad = ctx.createLinearGradient(wx, wy + 4, wx + 64, wy + 28);
    wGrad.addColorStop(0, '#d6d3d1');
    wGrad.addColorStop(0.5, '#a8a29e');
    wGrad.addColorStop(1, '#57534e');
    fillRoundRect(ctx, wx + 2, wy + 6, 60, 22, 10, wGrad, ol, 1.6);
    fillEllipse(ctx, wx + 32, wy + 7, 30, 8, '#a8a29e', ol, 1.4);
    fillEllipse(ctx, wx + 32, wy + 7, 24, 5.5, '#0284c7', '#44403c', 1.0);

    // Timber Roof Support Posts & Hanging Water Bucket
    fillRoundRect(ctx, wx + 6, wy - 26, 5, 33, 1.5, '#8c4b1a', ol, 1.1);
    fillRoundRect(ctx, wx + 53, wy - 26, 5, 33, 1.5, '#6e380d', ol, 1.1);
    const bob = Math.sin(tick / 14) * 1.5;
    ctx.strokeStyle = '#d4a359';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(wx + 32, wy - 26);
    ctx.lineTo(wx + 32, wy + 2 + bob);
    ctx.stroke();
    fillRoundRect(ctx, wx + 26, wy + bob, 12, 7, 2, '#3b82f6', ol, 1.0);

    // 2.5D Pitched Terracotta Shingle Well Roof
    const rGrad = ctx.createLinearGradient(wx, wy - 48, wx, wy - 22);
    rGrad.addColorStop(0, '#f97316');
    rGrad.addColorStop(0.5, '#c2410c');
    rGrad.addColorStop(1, '#7c2d12');
    fillRoundRect(ctx, wx - 2, wy - 46, 68, 22, 4, rGrad, ol, 1.6);
  }

  // ==================== 2.5D SCARECROW & WOODEN BENCH ====================
  function drawBench(ctx, wx, wy) {
    const ol = '#2b1608';
    fillEllipse(ctx, wx + 25, wy + 26, 22, 4.5, 'rgba(12, 22, 10, 0.34)');
    fillRoundRect(ctx, wx + 5, wy + 16, 4, 10, 1, '#334155', ol, 0.9);
    fillRoundRect(ctx, wx + 39, wy + 16, 4, 10, 1, '#334155', ol, 0.9);
    const bGrad = ctx.createLinearGradient(wx, wy + 7, wx, wy + 22);
    bGrad.addColorStop(0, '#d98a46');
    bGrad.addColorStop(0.5, '#b56e33');
    bGrad.addColorStop(1, '#7c4619');
    fillRoundRect(ctx, wx + 3, wy + 8, 42, 6, 2, bGrad, ol, 1.1);
    fillRoundRect(ctx, wx + 2, wy + 15, 44, 6, 2, bGrad, ol, 1.1);

    // 2.5D Stardew Straw-Hat Scarecrow standing beside bench/crops
    const sx = wx - 22;
    const sy = wy - 6;
    fillEllipse(ctx, sx + 14, sy + 29, 7, 2.5, 'rgba(18, 24, 10, 0.34)');
    fillRoundRect(ctx, sx + 12, sy + 15, 4, 14, 1, '#8c4b1a', ol, 0.9);
    fillRoundRect(ctx, sx + 4, sy + 12, 20, 3.5, 1.5, '#d97736', ol, 0.9);
    fillRoundRect(ctx, sx + 9, sy + 12, 10, 9, 2, '#2563eb', ol, 1.0);
    fillEllipse(ctx, sx + 14, sy + 7.5, 5, 4.5, '#fde68a', ol, 1.0);
    fillEllipse(ctx, sx + 14, sy + 4, 9, 2.5, '#eab308', ol, 1.0);
    fillRoundRect(ctx, sx + 9, sy + 0.5, 10, 4, 2, '#facc15', ol, 0.9);
  }

  // ==================== 2.5D GRAND FAST-TRAVEL WARP BOARD (2-TILE WIDE ROOFED MAP BILLBOARD) ====================
  function drawWarpBoard(ctx, wx, wy, tick) {
    const ol = '#261306';
    // Wide ground shadow for 2-tile (64px) monument
    fillEllipse(ctx, wx + 32, wy + 27, 36, 9.5, 'rgba(12, 22, 10, 0.38)');

    // 3D Stone Plinth Foundation
    const stGrad = ctx.createLinearGradient(wx + 2, wy + 16, wx + 62, wy + 29);
    stGrad.addColorStop(0, '#d6d3d1');
    stGrad.addColorStop(0.5, '#a8a29e');
    stGrad.addColorStop(1, '#57534e');
    fillRoundRect(ctx, wx + 2, wy + 17, 60, 12, 4, stGrad, ol, 1.5);
    fillRoundRect(ctx, wx + 6, wy + 14, 52, 5, 2, '#e7e5e4', ol, 1.1);

    // Heavy Timber Twin Support Pillars
    fillRoundRect(ctx, wx + 7, wy - 38, 7, 54, 2, '#7c3f14', ol, 1.4);
    fillRoundRect(ctx, wx + 50, wy - 38, 7, 54, 2, '#5c2d0c', ol, 1.4);

    // Large 2.5D Wooden Map Frame (between pillars)
    const frameGrad = ctx.createLinearGradient(wx + 4, wy - 34, wx + 60, wy + 12);
    frameGrad.addColorStop(0, '#b4692c');
    frameGrad.addColorStop(0.5, '#8c4b1a');
    frameGrad.addColorStop(1, '#5c2d0c');
    fillRoundRect(ctx, wx + 4, wy - 33, 56, 44, 4, frameGrad, ol, 1.6);

    // Illuminated Map & Holographic Zone Screen inside Board
    const mapGrad = ctx.createLinearGradient(wx + 8, wy - 29, wx + 56, wy + 7);
    mapGrad.addColorStop(0, '#0f172a');
    mapGrad.addColorStop(0.5, '#1e3a5f');
    mapGrad.addColorStop(1, '#0c4a6e');
    fillRoundRect(ctx, wx + 8, wy - 29, 48, 36, 3, mapGrad, '#fbbf24', 1.4);

    // 4 Mini Colored Zone Quadrants on the Billboard Map
    fillRoundRect(ctx, wx + 11, wy - 26, 19, 12, 1.5, 'rgba(74, 222, 128, 0.35)', '#4ade80', 0.9);
    fillRoundRect(ctx, wx + 34, wy - 26, 19, 12, 1.5, 'rgba(56, 189, 248, 0.35)', '#38bdf8', 0.9);
    fillRoundRect(ctx, wx + 11, wy - 11, 19, 11, 1.5, 'rgba(244, 114, 182, 0.35)', '#f472b6', 0.9);
    fillRoundRect(ctx, wx + 34, wy - 11, 19, 11, 1.5, 'rgba(251, 191, 36, 0.35)', '#fbbf24', 0.9);

    // Crossroad lines & glowing compass crystal in center of map board
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(wx + 31, wy - 27, 2, 28);
    ctx.fillRect(wx + 10, wy - 13, 44, 2);

    const pulse = 0.65 + 0.35 * Math.sin(tick / 10);
    fillEllipse(ctx, wx + 32, wy - 12, 5.5 * pulse, 5.5 * pulse, 'rgba(92, 225, 230, 0.42)');
    fillEllipse(ctx, wx + 32, wy - 12, 2.8, 2.8, '#5ce1e6', '#ffffff', 0.9);

    // 2.5D Pitched Shingle Canopy Roof over the Grand Warp Board
    const rGrad = ctx.createLinearGradient(wx - 4, wy - 54, wx - 4, wy - 32);
    rGrad.addColorStop(0, '#0284c7');
    rGrad.addColorStop(0.55, '#0369a1');
    rGrad.addColorStop(1, '#1e3a8a');
    fillRoundRect(ctx, wx - 4, wy - 52, 72, 20, 4, rGrad, ol, 1.6);

    // Gold Banner Signplate on the Roof Front
    fillRoundRect(ctx, wx + 7, wy - 48, 50, 13, 3, '#fef3c7', '#78350f', 1.3);
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 8.5px Kanit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🗺️ สถานีวาร์ปด่วน [M]', wx + 32, wy - 39);

    // Hanging glowing travel lanterns on left & right eaves
    const swing = Math.sin(tick / 14) * 1.2;
    [-1, 1].forEach((side) => {
      const lx = side < 0 ? wx + 1 : wx + 63;
      const ly = wy - 31;
      fillEllipse(ctx, lx + swing, ly + 3, 6, 6, `rgba(253, 224, 71, ${0.28 * pulse})`);
      fillRoundRect(ctx, lx - 2.5 + swing, ly, 5, 7, 1.5, '#fde047', ol, 1.0);
    });
  }

  // ==================== 2.5D VILLAGE STREET LAMP ====================
  function drawLamp(ctx, wx, wy, nightFactor) {
    const ol = '#18181b';
    fillEllipse(ctx, wx + 17, wy + 27, 9, 3.2, 'rgba(10, 18, 10, 0.36)');
    const pGrad = ctx.createLinearGradient(wx + 13, wy, wx + 19, wy);
    pGrad.addColorStop(0, '#71717a');
    pGrad.addColorStop(0.5, '#3f3f46');
    pGrad.addColorStop(1, '#18181b');
    fillRoundRect(ctx, wx + 13, wy - 6, 6, 34, 2, pGrad, ol, 1.0);
    fillRoundRect(ctx, wx + 11, wy + 22, 10, 6, 2, pGrad, ol, 1.0);
    fillRoundRect(ctx, wx + 9, wy - 12, 14, 11, 2.5, '#27272a', ol, 1.1);
    fillRoundRect(ctx, wx + 8, wy - 14, 16, 4, 2, '#3f3f46', ol, 1.0);
    fillRoundRect(ctx, wx + 11.5, wy - 9.5, 9, 7, 1.5, nightFactor > 0.12 ? '#fef08a' : '#e0f2fe');

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

  // ==================== 2.5D SIMULATED BUILDING INTERIOR ENVIRONMENT (16x12 TILES = 512x384) ====================
  const INTERIOR_THEMES = {
    cottage:       { floor: 'wood',   accent: '#d97706', board: '🏠 บ้านพักนักศึกษาแอดมิน ปวช.', sub: 'เตียงพักผ่อนฟื้นพลังงาน 100% • โต๊ะทบทวนบทเรียน 18 สัปดาห์' },
    town_hall:     { floor: 'wood',   accent: '#b45309', board: '🌐 สัปดาห์ที่ 1: NOS & Client-Server Network', sub: 'Core Gigabit Switch • Client ⇄ Server vs Peer-to-Peer' },
    vm_lab:        { floor: 'tech',   accent: '#2563eb', board: '🖥️ สัปดาห์ที่ 2–3: Virtualization (VM) & Server OS', sub: 'Hypervisor Type-2 • RAM/Disk Allocation • Ubuntu Server 24.04 ISO' },
    core_hall:     { floor: 'tech',   accent: '#059669', board: '⌨️ สัปดาห์ที่ 4–5: Static IP, Linux CLI & chmod', sub: 'Netplan 192.168.1.10/24 • chmod 755 (r=4,w=2,x=1) • sudo/usermod' },
    raid_barn:     { floor: 'steel',  accent: '#92400e', board: '💽 สัปดาห์ที่ 6: Disk Management & RAID Storage', sub: 'RAID 0 (Speed) • RAID 1 (Mirror) • RAID 5 (Parity) • /etc/fstab' },
    remote_tower:  { floor: 'tech',   accent: '#7c3aed', board: '🔐 สัปดาห์ที่ 7: Remote Access (SSH & RDP)', sub: 'OpenSSH TCP :22 (Encrypted) • RDP :3389 • Disable Telnet :23' },
    dhcp_house:    { floor: 'tech',   accent: '#0891b2', board: '📡 สัปดาห์ที่ 8: DHCP Server (D-O-R-A Process)', sub: 'Discover → Offer → Request → Acknowledge • Pool 192.168.1.100–200' },
    dns_tower:     { floor: 'wood',   accent: '#d97706', board: '📖 สัปดาห์ที่ 9: DNS Server (BIND9 Port 53)', sub: 'valley.local Zone • A Record / CNAME / MX • nslookup & dig' },
    cron_clock:    { floor: 'brass',  accent: '#ca8a04', board: '⏱️ สัปดาห์ที่ 10: Systemd Services & Cron Jobs', sub: 'systemctl enable/start • htop • crontab: 0 2 * * * (Auto Backup)' },
    web_market:    { floor: 'brass',  accent: '#db2777', board: '🌍 สัปดาห์ที่ 11: Web Server & Database (LAMP Stack)', sub: 'Apache2/Nginx (:80/:443) • MariaDB (:3306) • VirtualHost' },
    file_barn:     { floor: 'steel',  accent: '#ea580c', board: '📂 สัปดาห์ที่ 12: File Server (Samba & SFTP)', sub: 'Samba SMB (:445) Linux⇄Windows • SFTP (:22) vs FTP (:21)' },
    mail_proxy:    { floor: 'brass',  accent: '#dc2626', board: '✉️ สัปดาห์ที่ 13: Squid Proxy & Mail Server', sub: 'Squid Proxy (:3128) ACL/Cache • SMTP (:25) • IMAP (:143) • POP3 (:110)' },
    win_hall:      { floor: 'azure',  accent: '#0284c7', board: '🪟 สัปดาห์ที่ 14: Windows Server (AD DS, IIS & PowerShell)', sub: 'Active Directory Domain Controller • GPO • IIS Web • PowerShell' },
    firewall_gate: { floor: 'steel',  accent: '#475569', board: '🛡️ สัปดาห์ที่ 15: Firewall & Server Hardening (UFW)', sub: 'Default Deny Incoming • Allow 22, 53, 80, 443 • Deny Telnet 23' },
    backup_vault:  { floor: 'steel',  accent: '#16a34a', board: '💾 สัปดาห์ที่ 16: กฎสำรองข้อมูล 3-2-1 & Disaster Recovery', sub: '3 Copies • 2 Media Types • 1 Offsite Cloud • tar.gz / rsync / mysqldump' },
    log_obs:       { floor: 'tech',   accent: '#0d9488', board: '🔎 สัปดาห์ที่ 17: Server Monitoring & Log Analysis', sub: '/var/log/auth.log • journalctl -u • ss -tulnp • Root Cause Analysis' },
    grand_hall:    { floor: 'royal',  accent: '#9333ea', board: '🏆 สัปดาห์ที่ 18: สภาแอดมินหลวง (Final Enterprise Audit)', sub: 'บูรณาการครบ 18 สัปดาห์ • ตรวจสอบความพร้อมทั้งหมู่บ้าน Server Valley' }
  };

  function drawBuildingInterior(ctx, b, isOnline, tick) {
    const theme = INTERIOR_THEMES[b.id] || INTERIOR_THEMES.town_hall;
    const rx = 32;
    const ry = 24;
    const rw = 448;
    const rh = 312;
    const wallH = 76;
    const floorY = ry + wallH;
    const floorH = rh - wallH;
    const ol = '#1e120a';

    fillRoundRect(ctx, rx - 14, ry - 10, rw + 28, rh + 28, 12, 'rgba(0, 0, 0, 0.55)');
    fillRoundRect(ctx, rx - 8, ry - 6, rw + 16, rh + 14, 8, b.roofDark || '#3b2010', ol, 2.5);

    const wallBase = b.wallColor || '#f5e4c3';
    const wGrad = ctx.createLinearGradient(rx, ry, rx, floorY);
    wGrad.addColorStop(0, shadeHex(wallBase, 0.12));
    wGrad.addColorStop(0.75, wallBase);
    wGrad.addColorStop(1, shadeHex(wallBase, -0.22));
    fillRoundRect(ctx, rx, ry, rw, wallH + 6, 4, wGrad, ol, 2);

    ctx.fillStyle = shadeHex(b.roofColor || theme.accent, -0.25);
    ctx.fillRect(rx + 2, floorY - 22, rw - 4, 18);
    ctx.fillStyle = '#3b2110';
    ctx.fillRect(rx + 2, floorY - 5, rw - 4, 6);

    const fGrad = ctx.createLinearGradient(rx, floorY, rx, floorY + floorH);
    if (theme.floor === 'wood') {
      fGrad.addColorStop(0, '#d9a15b');
      fGrad.addColorStop(1, '#a86f32');
    } else if (theme.floor === 'tech') {
      fGrad.addColorStop(0, '#1e293b');
      fGrad.addColorStop(1, '#0f172a');
    } else if (theme.floor === 'steel') {
      fGrad.addColorStop(0, '#475569');
      fGrad.addColorStop(1, '#1e293b');
    } else if (theme.floor === 'azure') {
      fGrad.addColorStop(0, '#e0f2fe');
      fGrad.addColorStop(1, '#bae6fd');
    } else if (theme.floor === 'royal') {
      fGrad.addColorStop(0, '#3b0764');
      fGrad.addColorStop(1, '#1e1b4b');
    } else {
      fGrad.addColorStop(0, '#f3e5ab');
      fGrad.addColorStop(1, '#d4b475');
    }
    ctx.fillStyle = fGrad;
    ctx.fillRect(rx + 2, floorY, rw - 4, floorH - 2);

    ctx.save();
    ctx.strokeStyle = (theme.floor === 'tech' || theme.floor === 'steel' || theme.floor === 'royal')
      ? 'rgba(148, 163, 184, 0.16)'
      : 'rgba(60, 30, 10, 0.14)';
    ctx.lineWidth = 1;
    for (let gx = rx + 32; gx < rx + rw; gx += 32) {
      ctx.beginPath(); ctx.moveTo(gx, floorY); ctx.lineTo(gx, floorY + floorH); ctx.stroke();
    }
    for (let gy = floorY + 24; gy < floorY + floorH; gy += 24) {
      ctx.beginPath(); ctx.moveTo(rx + 2, gy); ctx.lineTo(rx + rw - 2, gy); ctx.stroke();
    }

    if (b.id !== 'cottage') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.fillRect(160, floorY + 42, 195, 12);
      ctx.fillRect(322, floorY + 12, 12, 42);
      const pulseX = 164 + ((tick * 2.2) % 180);
      ctx.fillStyle = isOnline ? '#4ade80' : '#38bdf8';
      ctx.fillRect(pulseX, floorY + 46, 18, 4);
    }

    const rugCol = theme.accent;
    fillRoundRect(ctx, 168, floorY + 62, 176, 98, 8, shadeHex(rugCol, -0.25), '#fde047', 1.5);
    fillRoundRect(ctx, 176, floorY + 70, 160, 82, 5, rugCol);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.font = 'bold 11px Kanit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.shortName.toUpperCase(), 256, floorY + 115);
    ctx.restore();

    const bx = 148;
    const by = ry + 10;
    const bw = 216;
    const bh = 54;
    fillRoundRect(ctx, bx + 2, by + 3, bw, bh, 5, 'rgba(0,0,0,0.35)');
    fillRoundRect(ctx, bx, by, bw, bh, 5, '#0f172a', '#d97706', 2.2);
    fillRoundRect(ctx, bx + 4, by + 4, bw - 8, 18, 3, theme.accent);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10.5px Kanit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(theme.board, bx + bw / 2, by + 17);
    ctx.fillStyle = '#bae6fd';
    ctx.font = '9.5px Kanit, sans-serif';
    ctx.fillText(theme.sub, bx + bw / 2, by + 34);
    ctx.fillStyle = isOnline ? '#4ade80' : '#fde047';
    ctx.font = 'bold 9px Kanit, sans-serif';
    ctx.fillText(
      isOnline ? '🟢 SYSTEM ONLINE — กด [E] ที่กระดานนี้เพื่อเปิดคู่มือบทเรียน' : '🟡 กด [E] ที่กระดานเพื่ออ่านคู่มือ • คุยกับ NPC & ทำแล็บที่ตู้เซิร์ฟเวอร์',
      bx + bw / 2,
      by + 48
    );

    [rx + 28, rx + rw - 82].forEach((wx) => {
      fillRoundRect(ctx, wx, ry + 14, 54, 42, 4, '#38bdf8', '#4a2511', 2.2);
      fillRoundRect(ctx, wx + 4, ry + 18, 46, 34, 2, '#bae6fd');
      ctx.fillStyle = '#4a2511';
      ctx.fillRect(wx + 26, ry + 14, 2, 42);
      ctx.fillRect(wx, ry + 34, 54, 2);
      ctx.save();
      const beam = ctx.createLinearGradient(wx, ry + 56, wx + 40, floorY + 95);
      beam.addColorStop(0, 'rgba(254, 249, 195, 0.24)');
      beam.addColorStop(1, 'rgba(254, 249, 195, 0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(wx + 2, floorY);
      ctx.lineTo(wx + 52, floorY);
      ctx.lineTo(wx + 86, floorY + 95);
      ctx.lineTo(wx + 22, floorY + 95);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    const drawWorkstationDesk = (dx, dy, label, screenCol) => {
      fillEllipse(ctx, dx + 34, dy + 34, 34, 8, 'rgba(0,0,0,0.28)');
      fillRoundRect(ctx, dx, dy + 10, 68, 22, 3, '#7c431e', ol, 1.3);
      fillRoundRect(ctx, dx, dy + 6, 68, 18, 3, '#b87338', ol, 1.2);
      [dx + 8, dx + 36].forEach((mx, mi) => {
        fillRoundRect(ctx, mx + 8, dy + 10, 6, 5, 1, '#334155');
        fillRoundRect(ctx, mx, dy - 6, 22, 16, 2, '#0f172a', '#475569', 1.1);
        fillRoundRect(ctx, mx + 2, dy - 4, 18, 12, 1, mi === 0 ? screenCol : '#1e293b');
      });
      if (label) {
        ctx.fillStyle = '#fffbeb';
        ctx.font = 'bold 8.5px Kanit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, dx + 34, dy + 20);
      }
    };

    if (b.id === 'cottage') {
      const bedX = 310;
      const bedY = floorY + 14;
      fillEllipse(ctx, bedX + 32, bedY + 50, 34, 9, 'rgba(0,0,0,0.28)');
      fillRoundRect(ctx, bedX, bedY, 64, 52, 5, '#7c431e', ol, 1.5);
      fillRoundRect(ctx, bedX + 4, bedY + 6, 56, 42, 4, '#fef3c7');
      fillRoundRect(ctx, bedX + 10, bedY + 8, 44, 12, 4, '#ffffff', '#cbd5e1', 1);
      fillRoundRect(ctx, bedX + 4, bedY + 22, 56, 26, 4, '#ef4444', '#991b1b', 1.2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Kanit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛏️ เตียงพักผ่อน [E]', bedX + 32, bedY + 38);
      drawWorkstationDesk(84, floorY + 18, 'โต๊ะทบทวน ปวช.', '#0284c7');
    } else {
      drawWorkstationDesk(52, floorY + 16, 'Admin Terminal', '#0f172a');
      drawWorkstationDesk(372, floorY + 18, 'Server Cluster', '#0284c7');
    }

    const exitX = 220;
    const exitY = floorY + floorH - 26;
    fillRoundRect(ctx, exitX - 6, exitY - 4, 84, 28, 6, 'rgba(253, 224, 71, 0.25)');
    fillRoundRect(ctx, exitX, exitY, 72, 22, 4, '#92400e', '#fde047', 1.8);
    ctx.fillStyle = '#fef9c3';
    ctx.font = 'bold 10.5px Kanit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚪 ทางออก [E]', exitX + 36, exitY + 15);
  }

  return {
    drawCharacter,
    getPortrait,
    getItemIcon,
    drawTile,
    drawTree,
    drawBuilding,
    drawSceneryBuilding,
    drawBuildingInterior,
    drawServerRack,
    drawCrate,
    drawFountain,
    drawWarpBoard,
    drawBench,
    drawLamp
  };
})();
