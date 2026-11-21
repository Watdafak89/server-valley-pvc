// High-Craft 16-Bit RPG Pixel-Art Engine (Stardew Valley / SNES Chibi Proportions)
// Integer-scaled 20x28 character models, automatic 4-tone 16-bit shading, gable buildings & organic trees
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

  // 16-bit hue-friendly color shading helper (returns darkened/lightened hex)
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
      // Slight cool shift on shadows (classic 16-bit pixel-art trick!)
      r = Math.max(0, Math.round(r * f * 0.96));
      g = Math.max(0, Math.round(g * f * 0.98));
      b = Math.max(0, Math.min(255, Math.round(b * (f + 0.05))));
    } else {
      // Slight warm shift on highlights
      r = Math.min(255, Math.round(r + (255 - r) * pct * 1.05));
      g = Math.min(255, Math.round(g + (255 - g) * pct));
      b = Math.min(255, Math.round(b + (255 - b) * pct * 0.85));
    }
    const res = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    shadeCache[key] = res;
    return res;
  }

  // ==================== NEW 20x28 HIGH-DETAIL 16-BIT CHIBI CHARACTER MODEL ====================
  function drawCharacter(ctx, x, y, style, dir = 'down', frame = 0, scale = 2, tick = 0) {
    ctx.save();
    // Center 20x28 model neatly over the standard 32x32 tile anchor when scale=2
    const offsetX = scale === 2 ? -4 : 0;
    const offsetY = scale === 2 ? -14 : 0;
    ctx.translate(Math.floor(x + offsetX), Math.floor(y + offsetY));
    ctx.scale(scale, scale);

    const ol = '#26150e';
    const skin = style.skin || '#f6cfa6';
    const skinHi = shadeHex(skin, 0.22);
    const skinSh = shadeHex(skin, -0.18);
    const skinDeep = shadeHex(skin, -0.32);

    const shirt = style.shirt || '#2a7b5f';
    const shirtHi = shadeHex(shirt, 0.24);
    const shirtSh = shadeHex(shirt, -0.24);
    const shirtStyle = style.shirtStyle || 'jacket';
    const accent = style.accent || '#f5faf5';

    const pants = style.pants || '#2c4969';
    const pantsHi = shadeHex(pants, 0.16);
    const pantsSh = shadeHex(pants, -0.26);

    const shoes = style.shoes || '#5c3317';
    const shoesHi = shadeHex(shoes, 0.26);
    const shoesSh = shadeHex(shoes, -0.28);

    const hair = style.hair || '#2b1b12';
    const hairHi = shadeHex(hair, 0.30);
    const hairSh = shadeHex(hair, -0.26);
    const hairStyle = style.hairStyle || 'short';
    const faceStyle = style.faceStyle || (style.glasses ? 'glasses' : 'smile');

    // Smooth RPG walk & idle breathing
    const bob = frame === 1 || frame === 3 ? -1 : 0;
    const idleFloat = frame === 0 && Math.floor(tick / 36) % 2 === 1 ? 1 : 0;
    const by = bob + (scale > 2 ? idleFloat : 0);
    const legL = frame === 1 ? -1 : frame === 3 ? 1 : 0;
    const legR = -legL;
    const armL = frame === 1 ? 1 : frame === 3 ? -1 : 0;
    const armR = -armL;
    const blink = (tick % 200) > 192;

    // 1. Soft layered elliptical ground shadow
    ctx.fillStyle = 'rgba(18, 28, 16, 0.30)';
    ctx.fillRect(5, 25, 10, 3);
    ctx.fillRect(4, 26, 12, 1);
    ctx.fillStyle = 'rgba(18, 28, 16, 0.22)';
    ctx.fillRect(6, 26, 8, 2);

    // 2. Back Long Hair Layer (behind shoulders when facing down/side)
    if (hairStyle === 'long' && dir !== 'up') {
      px(ctx, 3, 9 + by, 14, 10, ol);
      px(ctx, 4, 9 + by, 12, 9, hairSh);
      px(ctx, 5, 10 + by, 10, 7, hair);
      px(ctx, 4, 17 + by, 3, 2, ol);
      px(ctx, 13, 17 + by, 3, 2, ol);
      px(ctx, 5, 17 + by, 2, 1, hairSh);
      px(ctx, 13, 17 + by, 2, 1, hairSh);
    }

    // 3. Legs (Pants) & Rounded 16-bit Sneakers/Boots
    // Left leg
    px(ctx, 5, 20 + legL, 5, 7, ol);
    px(ctx, 6, 20 + legL, 3, 4, pants);
    px(ctx, 6, 20 + legL, 1, 3, pantsHi);
    px(ctx, 8, 21 + legL, 1, 3, pantsSh);
    // Left shoe (rounded with rubber sole & highlight)
    px(ctx, 5, 24 + legL, 5, 3, ol);
    px(ctx, 6, 24 + legL, 3, 2, shoes);
    px(ctx, 6, 24 + legL, 2, 1, shoesHi);
    px(ctx, 6, 26 + legL, 3, 1, '#eceff1'); // crisp sneaker sole

    // Right leg
    px(ctx, 10, 20 + legR, 5, 7, ol);
    px(ctx, 11, 20 + legR, 3, 4, pants);
    px(ctx, 11, 20 + legR, 1, 3, pantsHi);
    px(ctx, 13, 21 + legR, 1, 3, pantsSh);
    // Right shoe
    px(ctx, 10, 24 + legR, 5, 3, ol);
    px(ctx, 11, 24 + legR, 3, 2, shoes);
    px(ctx, 11, 24 + legR, 2, 1, shoesHi);
    px(ctx, 11, 26 + legR, 3, 1, '#eceff1');

    // 4. Rounded Shoulders & Detailed RPG Torso
    px(ctx, 5, 13 + by, 10, 8, ol);
    px(ctx, 4, 14 + by, 12, 6, ol);
    px(ctx, 5, 14 + by, 10, 6, shirt);
    // Top shoulder highlight & bottom shadow fold
    px(ctx, 6, 14 + by, 8, 1, shirtHi);
    px(ctx, 5, 19 + by, 10, 1, shirtSh);

    if (shirtStyle === 'jacket') {
      // Open IT Jacket over bright inner tee + collar lapels + leather belt
      px(ctx, 8, 14 + by, 4, 6, accent);
      px(ctx, 9, 15 + by, 2, 4, '#ffffff');
      px(ctx, 7, 14 + by, 1, 5, shirtSh);
      px(ctx, 12, 14 + by, 1, 5, shirtSh);
      // Belt & gold buckle
      px(ctx, 5, 19 + by, 10, 1, '#3b2110');
      px(ctx, 9, 19 + by, 2, 1, '#f4c430');
    } else if (shirtStyle === 'polo') {
      // Crisp white folded collar + placket + 2 buttons
      px(ctx, 7, 14 + by, 6, 1, '#ffffff');
      px(ctx, 8, 15 + by, 4, 1, '#e2e8f0');
      px(ctx, 9, 15 + by, 2, 3, '#ffffff');
      px(ctx, 9, 16 + by, 1, 1, shirtSh);
      px(ctx, 5, 19 + by, 10, 1, '#3b2110');
    } else if (shirtStyle === 'hoodie') {
      // Cozy hood rim + twin drawstrings + kangaroo pocket
      px(ctx, 6, 14 + by, 8, 1, shirtSh);
      px(ctx, 8, 15 + by, 1, 3, '#fffdf0');
      px(ctx, 11, 15 + by, 1, 3, '#fffdf0');
      px(ctx, 7, 17 + by, 6, 2, shirtSh);
      px(ctx, 8, 17 + by, 4, 1, shirtHi);
    }

    // 5. Draped Arms & Hands
    // Left arm
    px(ctx, 3, 14 + by + armL, 3, 6, ol);
    px(ctx, 4, 15 + by + armL, 1, 3, shirt);
    px(ctx, 4, 15 + by + armL, 1, 1, shirtHi);
    px(ctx, 4, 18 + by + armL, 1, 1, skin);
    // Right arm
    px(ctx, 14, 14 + by + armR, 3, 6, ol);
    px(ctx, 15, 15 + by + armR, 1, 3, shirtSh);
    px(ctx, 15, 18 + by + armR, 1, 1, skin);

    // 6. Neck + Shadow under chin
    px(ctx, 8, 13 + by, 4, 2, skinDeep);
    px(ctx, 9, 13 + by, 2, 1, skinSh);

    // 7. Rounded Chibi RPG Head (tapered chin & forehead + cute side ears!)
    // Outer silhouette (rounded corners!)
    px(ctx, 5, 2 + by, 10, 12, ol);
    px(ctx, 4, 3 + by, 12, 10, ol);
    px(ctx, 6, 13 + by, 8, 1, ol);
    // Cute pixel ears
    px(ctx, 3, 7 + by, 2, 3, ol);
    px(ctx, 15, 7 + by, 2, 3, ol);
    px(ctx, 4, 8 + by, 1, 2, skinSh);
    px(ctx, 15, 8 + by, 1, 2, skinSh);

    // Inner face skin fill with warm highlight & jaw shading
    px(ctx, 5, 3 + by, 10, 10, skin);
    px(ctx, 6, 3 + by, 8, 1, skinHi);
    px(ctx, 5, 11 + by, 10, 1, skinSh);
    px(ctx, 6, 12 + by, 8, 1, skinSh);

    // 8. Back View vs Front/Side View (Hair + Expressive Anime-RPG Face)
    if (dir === 'up') {
      // Full lush hair back
      px(ctx, 4, 2 + by, 12, 11, ol);
      px(ctx, 5, 2 + by, 10, 10, hair);
      px(ctx, 6, 3 + by, 8, 2, hairHi);
      px(ctx, 5, 9 + by, 10, 3, hairSh);

      if (hairStyle === 'spiky' && !style.hat) {
        px(ctx, 4, 0 + by, 3, 3, ol); px(ctx, 5, 1 + by, 2, 2, hair);
        px(ctx, 8, -1 + by, 4, 4, ol); px(ctx, 9, 0 + by, 2, 3, hairHi);
        px(ctx, 13, 0 + by, 3, 3, ol); px(ctx, 13, 1 + by, 2, 2, hair);
      } else if (hairStyle === 'long') {
        px(ctx, 3, 9 + by, 14, 11, ol);
        px(ctx, 4, 9 + by, 12, 10, hair);
        px(ctx, 6, 11 + by, 8, 2, hairHi);
        px(ctx, 4, 16 + by, 12, 3, hairSh);
      } else if (hairStyle === 'bob') {
        px(ctx, 3, 5 + by, 14, 9, ol);
        px(ctx, 4, 5 + by, 12, 8, hair);
        px(ctx, 6, 6 + by, 8, 2, hairHi);
        px(ctx, 4, 11 + by, 12, 2, hairSh);
      } else if (hairStyle === 'ponytail') {
        px(ctx, 8, 9 + by, 4, 2, '#ff5c8a'); // cute ribbon tie
        px(ctx, 7, 11 + by, 6, 7, ol);
        px(ctx, 8, 11 + by, 4, 6, hair);
        px(ctx, 9, 12 + by, 2, 3, hairHi);
      } else if (hairStyle === 'curly') {
        px(ctx, 3, 1 + by, 14, 12, ol);
        px(ctx, 4, 2 + by, 12, 10, hair);
        px(ctx, 5, 3 + by, 3, 2, hairHi);
        px(ctx, 11, 3 + by, 3, 2, hairHi);
        px(ctx, 7, 7 + by, 5, 2, hairHi);
      }

      if (style.hat) {
        drawHat(ctx, by, style.hat, style.hatTrim, ol, 'up');
      }
      if (style.backpack && hairStyle !== 'long') {
        px(ctx, 5, 14 + by, 10, 7, ol);
        px(ctx, 6, 15 + by, 8, 5, '#9c5221');
        px(ctx, 7, 15 + by, 6, 2, '#d89b52');
        px(ctx, 9, 18 + by, 2, 1, '#ffd54f');
      }
    } else {
      // Sculpted Hair Crown + Parted Bangs
      px(ctx, 5, 1 + by, 10, 4, ol);
      px(ctx, 4, 2 + by, 12, 4, ol);
      px(ctx, 5, 2 + by, 10, 3, hair);
      // Curved 16-bit specular hair sheen arc
      px(ctx, 6, 2 + by, 3, 1, hairHi);
      px(ctx, 11, 2 + by, 3, 1, hairHi);
      // Parted organic bangs over forehead
      px(ctx, 5, 4 + by, 3, 2, hair);
      px(ctx, 9, 4 + by, 3, 2, hair);
      px(ctx, 13, 4 + by, 2, 2, hairSh);
      px(ctx, 8, 5 + by, 1, 1, skinSh); // subtle bang shadow

      // Hairstyle variations
      if (hairStyle === 'spiky' && !style.hat) {
        px(ctx, 4, 0 + by, 3, 2, ol); px(ctx, 5, 0 + by, 2, 2, hair);
        px(ctx, 8, -1 + by, 4, 3, ol); px(ctx, 9, 0 + by, 2, 2, hairHi);
        px(ctx, 13, 0 + by, 3, 2, ol); px(ctx, 13, 0 + by, 2, 2, hair);
        px(ctx, 4, 5 + by, 2, 3, hair);
        px(ctx, 14, 5 + by, 2, 3, hairSh);
      } else if (hairStyle === 'bob') {
        px(ctx, 3, 4 + by, 3, 9, ol); px(ctx, 4, 4 + by, 2, 8, hair); px(ctx, 4, 5 + by, 1, 3, hairHi);
        px(ctx, 14, 4 + by, 3, 9, ol); px(ctx, 14, 4 + by, 2, 8, hairSh);
      } else if (hairStyle === 'long') {
        px(ctx, 3, 4 + by, 3, 10, ol); px(ctx, 4, 4 + by, 2, 9, hair); px(ctx, 4, 5 + by, 1, 4, hairHi);
        px(ctx, 14, 4 + by, 3, 10, ol); px(ctx, 14, 4 + by, 2, 9, hairSh);
      } else if (hairStyle === 'curly') {
        px(ctx, 3, 1 + by, 14, 5, ol);
        px(ctx, 4, 1 + by, 12, 4, hair);
        px(ctx, 5, 1 + by, 3, 2, hairHi);
        px(ctx, 11, 2 + by, 3, 1, hairHi);
        px(ctx, 3, 4 + by, 3, 6, ol); px(ctx, 4, 4 + by, 2, 5, hair);
        px(ctx, 14, 4 + by, 3, 6, ol); px(ctx, 14, 4 + by, 2, 5, hairSh);
      } else {
        // 'short' or 'ponytail' side locks
        px(ctx, 4, 4 + by, 2, 4, hair);
        px(ctx, 14, 4 + by, 2, 4, hairSh);
      }

      // Ponytail visible on side/front
      if (hairStyle === 'ponytail') {
        if (dir === 'left') {
          px(ctx, 15, 5 + by, 2, 2, '#ff5c8a');
          px(ctx, 16, 6 + by, 4, 7, ol);
          px(ctx, 17, 7 + by, 2, 5, hair);
          px(ctx, 17, 7 + by, 1, 3, hairHi);
        } else if (dir === 'right') {
          px(ctx, 3, 5 + by, 2, 2, '#ff5c8a');
          px(ctx, 0, 6 + by, 4, 7, ol);
          px(ctx, 1, 7 + by, 2, 5, hair);
          px(ctx, 2, 7 + by, 1, 3, hairHi);
        } else {
          px(ctx, 15, 7 + by, 3, 6, ol);
          px(ctx, 15, 8 + by, 2, 4, hairSh);
        }
      }

      // Expressive 16-bit Anime-RPG Face
      if (dir === 'down') {
        drawFrontFace(ctx, by, faceStyle, blink, style, ol);
      } else if (dir === 'left') {
        if (faceStyle === 'cool') {
          px(ctx, 4, 7 + by, 5, 3, '#111827');
          px(ctx, 5, 7 + by, 2, 1, '#93c5fd');
        } else if (!blink && faceStyle !== 'happy') {
          px(ctx, 5, 7 + by, 2, 3, '#1a1210');
          px(ctx, 5, 7 + by, 1, 1, '#ffffff');
          px(ctx, 6, 9 + by, 1, 1, '#3b82f6');
        } else {
          px(ctx, 5, 8 + by, 2, 1, '#2d1a10');
        }
        if (faceStyle === 'glasses' || style.glasses) {
          px(ctx, 4, 7 + by, 4, 3, 'rgba(92,225,230,0.42)');
          px(ctx, 4, 7 + by, 4, 1, '#1e293b');
        }
        if (style.beard) px(ctx, 4, 10 + by, 6, 3, style.beard);
      } else if (dir === 'right') {
        if (faceStyle === 'cool') {
          px(ctx, 11, 7 + by, 5, 3, '#111827');
          px(ctx, 13, 7 + by, 2, 1, '#93c5fd');
        } else if (!blink && faceStyle !== 'happy') {
          px(ctx, 13, 7 + by, 2, 3, '#1a1210');
          px(ctx, 14, 7 + by, 1, 1, '#ffffff');
          px(ctx, 13, 9 + by, 1, 1, '#3b82f6');
        } else {
          px(ctx, 13, 8 + by, 2, 1, '#2d1a10');
        }
        if (faceStyle === 'glasses' || style.glasses) {
          px(ctx, 12, 7 + by, 4, 3, 'rgba(92,225,230,0.42)');
          px(ctx, 12, 7 + by, 4, 1, '#1e293b');
        }
        if (style.beard) px(ctx, 10, 10 + by, 6, 3, style.beard);
      }

      if (style.hat) {
        drawHat(ctx, by, style.hat, style.hatTrim, ol, dir);
      }
    }

    ctx.restore();
  }

  function drawFrontFace(ctx, by, faceStyle, blink, style, ol) {
    // Rosy RPG cheek blush
    px(ctx, 5, 10 + by, 2, 1, 'rgba(240, 110, 125, 0.50)');
    px(ctx, 13, 10 + by, 2, 1, 'rgba(240, 110, 125, 0.50)');

    if (faceStyle === 'happy') {
      // Joyful ^ ^ arched eyes
      px(ctx, 6, 8 + by, 1, 1, ol); px(ctx, 7, 7 + by, 1, 1, ol); px(ctx, 8, 8 + by, 1, 1, ol);
      px(ctx, 11, 8 + by, 1, 1, ol); px(ctx, 12, 7 + by, 1, 1, ol); px(ctx, 13, 8 + by, 1, 1, ol);
      // Big cheerful smile
      px(ctx, 8, 10 + by, 4, 2, '#c85a48');
      px(ctx, 9, 10 + by, 2, 1, '#ffffff');
      return;
    }

    if (faceStyle === 'cool') {
      // Stylish 16-bit sunglasses with diagonal cyan sheen
      px(ctx, 5, 7 + by, 5, 3, '#0f172a');
      px(ctx, 10, 7 + by, 5, 3, '#0f172a');
      px(ctx, 9, 7 + by, 2, 1, '#475569');
      px(ctx, 6, 7 + by, 2, 1, '#93c5fd');
      px(ctx, 11, 7 + by, 2, 1, '#93c5fd');
      px(ctx, 7, 8 + by, 1, 1, '#e0f2fe');
      px(ctx, 12, 8 + by, 1, 1, '#e0f2fe');
      px(ctx, 8, 11 + by, 4, 1, '#b5604d');
      return;
    }

    if (faceStyle === 'wink') {
      // Left sparkling eye + right playful wink!
      if (!blink) {
        px(ctx, 6, 7 + by, 2, 3, '#1e130e');
        px(ctx, 6, 7 + by, 1, 1, '#ffffff');
        px(ctx, 7, 9 + by, 1, 1, '#4f46e5');
      } else {
        px(ctx, 6, 8 + by, 2, 1, ol);
      }
      px(ctx, 11, 8 + by, 2, 1, ol);
      px(ctx, 13, 7 + by, 1, 1, ol);
      px(ctx, 8, 10 + by, 4, 1, '#c86450');
      px(ctx, 9, 11 + by, 2, 1, '#e08270');
      return;
    }

    // Default 'smile' & 'glasses' — 2x3 expressive RPG eyes with white shine & colored iris!
    if (!blink) {
      // Left eye
      px(ctx, 6, 7 + by, 2, 3, '#1a110d');
      px(ctx, 6, 7 + by, 1, 1, '#ffffff');
      px(ctx, 7, 9 + by, 1, 1, '#2563eb');
      // Right eye
      px(ctx, 12, 7 + by, 2, 3, '#1a110d');
      px(ctx, 12, 7 + by, 1, 1, '#ffffff');
      px(ctx, 13, 9 + by, 1, 1, '#2563eb');
    } else {
      px(ctx, 6, 8 + by, 2, 1, ol);
      px(ctx, 12, 8 + by, 2, 1, ol);
    }

    if (faceStyle === 'glasses' || style.glasses) {
      px(ctx, 5, 7 + by, 4, 3, 'rgba(92, 225, 230, 0.36)');
      px(ctx, 11, 7 + by, 4, 3, 'rgba(92, 225, 230, 0.36)');
      px(ctx, 5, 7 + by, 4, 1, '#1e293b');
      px(ctx, 11, 7 + by, 4, 1, '#1e293b');
      px(ctx, 9, 8 + by, 2, 1, '#1e293b');
      px(ctx, 5, 7 + by, 1, 1, '#ffffff');
      px(ctx, 11, 7 + by, 1, 1, '#ffffff');
    }

    if (style.beard) {
      px(ctx, 6, 10 + by, 8, 3, style.beard);
      px(ctx, 7, 12 + by, 6, 1, shadeHex(style.beard, -0.2));
    } else {
      px(ctx, 8, 11 + by, 4, 1, '#c46a56');
    }
  }

  function drawHat(ctx, by, hatColor, trimColor, ol, dir) {
    const hatHi = shadeHex(hatColor, 0.25);
    const hatSh = shadeHex(hatColor, -0.22);
    px(ctx, 4, 0 + by, 12, 4, ol);
    px(ctx, 5, 1 + by, 10, 3, hatColor);
    px(ctx, 6, 1 + by, 6, 1, hatHi);
    px(ctx, 5, 3 + by, 10, 1, hatSh);
    // Visor brim + emblem
    px(ctx, 3, 3 + by, 14, 2, ol);
    px(ctx, 4, 3 + by, 12, 1, trimColor || '#ffd166');
    if (dir !== 'up') {
      px(ctx, 9, 1 + by, 2, 2, '#fff59d');
    }
  }

  // ==================== DEDICATED 48x48 HIGH-CRAFT RPG BUST PORTRAIT ====================
  function getPortrait(key, style) {
    if (portraitCache[key]) return portraitCache[key];
    const c = makeCanvas(48, 48);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // 16-bit layered pastel sky + distant valley hills + sunlit meadow
    px(ctx, 0, 0, 48, 12, '#6ec0eb');
    px(ctx, 0, 12, 48, 12, '#9edaf7');
    px(ctx, 0, 24, 48, 10, '#d5f2fc');
    // Distant hills
    px(ctx, 0, 27, 24, 9, '#5aa36d');
    px(ctx, 22, 25, 26, 11, '#4b8f5f');
    // Meadow foreground
    px(ctx, 0, 35, 48, 13, '#7bc45e');
    px(ctx, 0, 35, 48, 2, '#9ee078');
    // Fluffy pixel clouds
    px(ctx, 4, 5, 12, 4, '#ffffff'); px(ctx, 6, 3, 7, 2, '#ffffff');
    px(ctx, 32, 7, 11, 3, '#ffffff'); px(ctx, 34, 5, 6, 2, '#ffffff');

    // Draw zoomed crisp bust-up character (head + shoulders dead-centered in 48x48!)
    drawCharacter(ctx, 8, 20, style, 'down', 0, 2, 0);
    portraitCache[key] = c;
    return c;
  }

  // ==================== 16-BIT ITEM ICONS ====================
  function getItemIcon(itemId) {
    if (itemCache[itemId]) return itemCache[itemId];
    const c = makeCanvas(32, 32);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.scale(2, 2);
    const ol = '#26170e';

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

  // ==================== 16-BIT AUTO-TILED GROUND RENDERER ====================
  function getStaticTileVariant(type, variant) {
    const key = type + '_' + variant;
    if (tileCache[key]) return tileCache[key];
    const c = makeCanvas(32, 32);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.scale(2, 2);

    if (type === 'grass') {
      px(ctx, 0, 0, 16, 16, variant % 2 === 0 ? '#6ab04c' : '#65aa47');
      const light = '#82c956';
      const midDark = '#519239';
      const deep = '#3f782b';
      if (variant === 0) {
        px(ctx, 2, 3, 2, 1, light); px(ctx, 11, 10, 2, 1, light);
        px(ctx, 6, 12, 1, 2, midDark); px(ctx, 7, 13, 1, 1, deep);
      } else if (variant === 1) {
        px(ctx, 3, 5, 1, 2, midDark); px(ctx, 5, 6, 1, 2, midDark);
        px(ctx, 4, 4, 1, 1, light); px(ctx, 12, 3, 1, 2, midDark);
      } else if (variant === 2) {
        px(ctx, 5, 7, 2, 2, deep); px(ctx, 5, 6, 1, 1, light); px(ctx, 7, 7, 1, 1, light);
        px(ctx, 11, 12, 2, 1, light);
      } else if (variant === 3) {
        px(ctx, 4, 10, 1, 3, deep); px(ctx, 3, 9, 3, 2, '#fff59d'); px(ctx, 4, 9, 1, 1, '#f59e0b');
        px(ctx, 11, 5, 1, 2, deep); px(ctx, 10, 4, 3, 2, '#ffffff'); px(ctx, 11, 4, 1, 1, '#ffd54f');
      } else if (variant === 4) {
        px(ctx, 9, 9, 1, 3, deep); px(ctx, 8, 8, 3, 2, '#ff9eb5'); px(ctx, 9, 8, 1, 1, '#ffe066');
        px(ctx, 3, 4, 2, 1, light);
      } else {
        px(ctx, 10, 11, 3, 2, '#7b8a78'); px(ctx, 10, 11, 2, 1, '#a9b8a4');
        px(ctx, 4, 6, 1, 2, midDark);
      }
    } else if (type === 'path') {
      px(ctx, 0, 0, 16, 16, '#d9b377');
      px(ctx, 1, 2, 3, 2, '#c89e61'); px(ctx, 9, 10, 4, 2, '#c89e61');
      px(ctx, 12, 3, 2, 1, '#ebd09b'); px(ctx, 3, 12, 3, 1, '#ebd09b');
      if (variant % 3 === 0) {
        px(ctx, 6, 5, 4, 3, '#b58a4f'); px(ctx, 6, 5, 3, 2, '#e6c68e');
      }
      if (variant % 2 === 1) {
        px(ctx, 2, 9, 2, 1, '#b58a4f'); px(ctx, 11, 13, 2, 1, '#b58a4f');
      }
    } else if (type === 'stone') {
      px(ctx, 0, 0, 16, 16, '#8f887b');
      px(ctx, 1, 1, 6, 6, '#c7c1b4'); px(ctx, 1, 1, 5, 1, '#e3ded2'); px(ctx, 1, 6, 6, 1, '#a39c8e');
      px(ctx, 8, 1, 7, 6, '#bdb7aa'); px(ctx, 8, 1, 6, 1, '#d9d4c7'); px(ctx, 8, 6, 7, 1, '#9c9588');
      px(ctx, 1, 8, 7, 7, '#bdb7aa'); px(ctx, 1, 8, 6, 1, '#d9d4c7'); px(ctx, 1, 14, 7, 1, '#9c9588');
      px(ctx, 9, 8, 6, 7, '#c7c1b4'); px(ctx, 9, 8, 5, 1, '#e3ded2'); px(ctx, 9, 14, 6, 1, '#a39c8e');
      if (variant === 0) px(ctx, 7, 7, 2, 1, '#68a64e');
    } else if (type === 'soil') {
      px(ctx, 0, 0, 16, 16, '#6ab04c');
      px(ctx, 1, 1, 14, 14, '#6b3e1f'); px(ctx, 2, 2, 12, 12, '#8c552e');
      px(ctx, 2, 4, 12, 2, '#6b3e1f'); px(ctx, 2, 9, 12, 2, '#6b3e1f');
      px(ctx, 2, 3, 12, 1, '#a86b3e'); px(ctx, 2, 8, 12, 1, '#a86b3e');
      px(ctx, 4, 3, 2, 3, '#2d7a36'); px(ctx, 3, 2, 4, 2, '#6ce068'); px(ctx, 4, 2, 2, 1, '#b8ff85');
      px(ctx, 10, 7, 2, 3, '#2d7a36'); px(ctx, 9, 6, 4, 2, '#6ce068'); px(ctx, 10, 6, 2, 1, '#b8ff85');
      if (variant % 2 === 0) { px(ctx, 10, 8, 2, 2, '#ff5252'); px(ctx, 10, 8, 1, 1, '#ffcdd2'); }
    } else if (type === 'fence') {
      ctx.drawImage(getStaticTileVariant('grass', 0), 0, 0, 16, 16);
      px(ctx, 1, 4, 4, 11, '#3d200d'); px(ctx, 11, 4, 4, 11, '#3d200d');
      px(ctx, 2, 5, 2, 9, '#a6632e'); px(ctx, 2, 5, 1, 9, '#cc8445');
      px(ctx, 12, 5, 2, 9, '#a6632e'); px(ctx, 12, 5, 1, 9, '#cc8445');
      px(ctx, 0, 6, 16, 3, '#3d200d'); px(ctx, 0, 7, 16, 1, '#c47b3d');
      px(ctx, 0, 11, 16, 3, '#3d200d'); px(ctx, 0, 12, 16, 1, '#a6632e');
    }

    tileCache[key] = c;
    return c;
  }

  function drawTile(ctx, type, gx, gy, wx, wy, tick, grid) {
    const hash = ((gx * 73856093) ^ (gy * 19349663)) >>> 0;

    if (type === 'water') {
      ctx.fillStyle = '#2d82b5';
      ctx.fillRect(wx, wy, 32, 32);
      const phase = Math.floor((tick / 16 + gx * 0.7 + gy * 0.5) % 4);
      ctx.fillStyle = '#3b98cc';
      ctx.fillRect(wx + 2, wy + 2, 28, 28);
      ctx.fillStyle = '#7bd4f5';
      ctx.fillRect(wx + 4 + phase * 2, wy + 8, 8, 2);
      ctx.fillRect(wx + 16 - phase * 2, wy + 22, 10, 2);
      if (phase === 1 || phase === 2) {
        ctx.fillStyle = '#d4f5ff';
        ctx.fillRect(wx + 6 + phase * 2, wy + 8, 3, 2);
      }

      if (grid) {
        const up = gy > 0 && grid[gy - 1][gx] !== 'water' && grid[gy - 1][gx] !== 'bridge';
        const dn = gy < grid.length - 1 && grid[gy + 1][gx] !== 'water' && grid[gy + 1][gx] !== 'bridge';
        const lt = gx > 0 && grid[gy][gx - 1] !== 'water' && grid[gy][gx - 1] !== 'bridge';
        const rt = gx < grid[0].length - 1 && grid[gy][gx + 1] !== 'water' && grid[gy][gx + 1] !== 'bridge';
        if (up) {
          ctx.fillStyle = '#8b6843'; ctx.fillRect(wx, wy, 32, 5);
          ctx.fillStyle = '#c4a472'; ctx.fillRect(wx, wy, 32, 2);
          ctx.fillStyle = 'rgba(220,248,255,0.65)'; ctx.fillRect(wx + 2, wy + 5 + (phase % 2), 28, 2);
        }
        if (dn) {
          ctx.fillStyle = '#6b4d2e'; ctx.fillRect(wx, wy + 28, 32, 4);
          ctx.fillStyle = 'rgba(220,248,255,0.5)'; ctx.fillRect(wx + 2, wy + 26, 28, 2);
        }
        if (lt) {
          ctx.fillStyle = '#8b6843'; ctx.fillRect(wx, wy, 4, 32);
          ctx.fillStyle = 'rgba(220,248,255,0.55)'; ctx.fillRect(wx + 4, wy + 2, 2, 28);
        }
        if (rt) {
          ctx.fillStyle = '#8b6843'; ctx.fillRect(wx + 28, wy, 4, 32);
          ctx.fillStyle = 'rgba(220,248,255,0.55)'; ctx.fillRect(wx + 26, wy + 2, 2, 28);
        }
      }

      if (hash % 13 === 0) {
        ctx.fillStyle = '#246b37'; ctx.fillRect(wx + 8, wy + 12, 14, 10);
        ctx.fillStyle = '#4ec462'; ctx.fillRect(wx + 9, wy + 11, 12, 8);
        ctx.fillStyle = '#2d82b5'; ctx.fillRect(wx + 15, wy + 11, 3, 4);
        if (hash % 26 === 0) {
          ctx.fillStyle = '#ff9eb5'; ctx.fillRect(wx + 10, wy + 13, 5, 4);
          ctx.fillStyle = '#fff59d'; ctx.fillRect(wx + 12, wy + 14, 2, 2);
        }
      }
      return;
    }

    if (type === 'bridge') {
      ctx.fillStyle = '#2d82b5'; ctx.fillRect(wx, wy, 32, 32);
      ctx.fillStyle = '#472610'; ctx.fillRect(wx, wy + 1, 32, 30);
      ctx.fillStyle = '#a86936'; ctx.fillRect(wx, wy + 3, 32, 26);
      for (let i = 0; i < 32; i += 8) {
        ctx.fillStyle = '#6e3f1c'; ctx.fillRect(wx + i, wy + 3, 2, 26);
        ctx.fillStyle = '#c9884f'; ctx.fillRect(wx + i + 2, wy + 4, 5, 2);
      }
      ctx.fillStyle = '#d99e62'; ctx.fillRect(wx, wy + 2, 32, 3); ctx.fillRect(wx, wy + 27, 32, 3);
      return;
    }

    const variant = hash % 6;
    ctx.drawImage(getStaticTileVariant(type, variant), wx, wy);

    if (type === 'path' && grid) {
      const gCol = '#6ab04c';
      const gDark = '#498233';
      if (gy > 0 && grid[gy - 1][gx] === 'grass') {
        ctx.fillStyle = gDark; ctx.fillRect(wx, wy, 32, 3);
        ctx.fillStyle = gCol; ctx.fillRect(wx + 4, wy, 8, 4); ctx.fillRect(wx + 18, wy, 10, 3);
      }
      if (gy < grid.length - 1 && grid[gy + 1][gx] === 'grass') {
        ctx.fillStyle = gDark; ctx.fillRect(wx, wy + 29, 32, 3);
        ctx.fillStyle = gCol; ctx.fillRect(wx + 2, wy + 28, 10, 4); ctx.fillRect(wx + 20, wy + 29, 8, 3);
      }
      if (gx > 0 && grid[gy][gx - 1] === 'grass') {
        ctx.fillStyle = gDark; ctx.fillRect(wx, wy, 3, 32);
        ctx.fillStyle = gCol; ctx.fillRect(wx, wy + 6, 4, 10);
      }
      if (gx < grid[0].length - 1 && grid[gy][gx + 1] === 'grass') {
        ctx.fillStyle = gDark; ctx.fillRect(wx + 29, wy, 3, 32);
        ctx.fillStyle = gCol; ctx.fillRect(wx + 28, wy + 12, 4, 10);
      }
    }
  }

  // ==================== UPGRADED ORGANIC SCALLOPED 16-BIT TREES ====================
  function getTreeSprite(variant) {
    if (treeCache[variant]) return treeCache[variant];
    const c = makeCanvas(64, 76);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.scale(2, 2); // 32x38 high-craft tree grid!
    const ol = '#1c2b18';

    // Soft elliptical shadow
    ctx.fillStyle = 'rgba(18, 32, 16, 0.28)';
    ctx.fillRect(5, 31, 22, 5);
    ctx.fillRect(8, 30, 16, 7);

    if (variant === 1) {
      // Majestic layered 16-bit Evergreen Spruce
      px(ctx, 13, 24, 6, 10, '#3a200f');
      px(ctx, 14, 24, 4, 9, '#754422');
      px(ctx, 14, 24, 2, 9, '#9e6236');
      const tiers = [
        { y: 18, w: 24, h: 9 },
        { y: 12, w: 20, h: 8 },
        { y: 6, w: 14, h: 8 },
        { y: 2, w: 8, h: 6 }
      ];
      tiers.forEach((t) => {
        const x = Math.floor((32 - t.w) / 2);
        px(ctx, x, t.y + 1, t.w, t.h - 1, ol);
        px(ctx, x + 2, t.y, t.w - 4, t.h, ol);
        px(ctx, x + 1, t.y + 2, t.w - 2, t.h - 3, '#1a5235');
        px(ctx, x + 2, t.y + 1, t.w - 4, t.h - 3, '#2d7d4b');
        px(ctx, x + 4, t.y + 1, Math.floor((t.w - 8) * 0.7), 3, '#58b86a');
        px(ctx, x + 5, t.y + 1, Math.max(2, Math.floor((t.w - 10) * 0.45)), 1, '#9be884');
      });
    } else {
      // Lush Rounded Multi-Blob Oak (v0) & Dreamy Sakura Blossom Tree (v2)
      // Flared trunk & mossy root
      px(ctx, 12, 20, 8, 13, '#381e0e');
      px(ctx, 10, 31, 12, 3, '#381e0e');
      px(ctx, 13, 21, 6, 11, '#784824');
      px(ctx, 13, 21, 2, 11, '#a66a3a');
      px(ctx, 17, 22, 2, 10, '#593317');
      px(ctx, 11, 31, 3, 2, '#5aa348'); // tiny moss tuft on root

      const cDeep = variant === 2 ? '#8f3959' : '#20572a';
      const cMid = variant === 2 ? '#d96b8e' : '#398a3f';
      const cHi = variant === 2 ? '#ffadc4' : '#6cc754';
      const cTop = variant === 2 ? '#ffe5ee' : '#b2f078';

      // Scalloped rounded leaf cloud silhouette (overlapping circles/blobs!)
      const blobs = [
        [7, 11, 10, 10], [15, 11, 10, 10], [11, 6, 10, 10],
        [4, 13, 8, 8], [20, 13, 8, 8], [10, 14, 12, 9]
      ];
      blobs.forEach(([bx, by, bw, bh]) => {
        px(ctx, bx, by + 1, bw, bh - 2, ol);
        px(ctx, bx + 1, by, bw - 2, bh, ol);
      });
      blobs.forEach(([bx, by, bw, bh]) => {
        px(ctx, bx + 1, by + 1, bw - 2, bh - 2, cDeep);
      });
      // Mid-lit clusters
      px(ctx, 6, 9, 20, 10, cMid);
      px(ctx, 10, 6, 12, 12, cMid);
      px(ctx, 5, 13, 22, 6, cMid);
      // Sunlit upper-left clusters
      px(ctx, 11, 6, 10, 5, cHi);
      px(ctx, 6, 11, 9, 5, cHi);
      px(ctx, 17, 11, 8, 4, cHi);
      // Crisp 16-bit specular leaf sparkles
      px(ctx, 12, 7, 6, 2, cTop);
      px(ctx, 8, 11, 4, 2, cTop);
      px(ctx, 19, 12, 3, 2, cTop);
      if (variant === 2) {
        px(ctx, 10, 16, 2, 2, '#fff5f8');
        px(ctx, 20, 15, 2, 2, '#fff5f8');
      }
    }

    treeCache[variant] = c;
    return c;
  }

  function drawTree(ctx, wx, wy, variant = 0, tick = 0) {
    const sway = Math.sin(tick / 35 + wx * 0.04) * 1.1;
    ctx.drawImage(getTreeSprite(variant), Math.floor(wx - 16 + sway), Math.floor(wy - 42));
  }

  // ==================== UPGRADED 16-BIT COZY GABLE BUILDINGS ====================
  function drawBuilding(ctx, b, isOnline, tick) {
    const x = b.tx * 32;
    const y = b.ty * 32;
    const w = b.tw * 32;
    const h = b.th * 32;
    const ol = '#2a160b';
    const roofBase = b.roofColor || '#b54635';
    const roofHi = shadeHex(roofBase, 0.22);
    const roofDark = b.roofDark || shadeHex(roofBase, -0.28);

    // Cast ground shadow
    ctx.fillStyle = 'rgba(18, 28, 16, 0.30)';
    ctx.fillRect(x + 8, y + h - 2, w, 12);

    // Textured Brick Chimney + Rising Cozy Smoke
    const chX = x + w - 28;
    const chY = y - 16;
    px(ctx, chX, chY, 16, 26, ol);
    px(ctx, chX + 2, chY + 2, 12, 22, '#8d4a3a');
    px(ctx, chX + 2, chY + 2, 5, 22, '#b8644f');
    px(ctx, chX + 2, chY + 9, 12, 2, '#5c2d22');
    px(ctx, chX + 2, chY + 16, 12, 2, '#5c2d22');
    px(ctx, chX - 2, chY, 20, 5, '#4a2118');
    if (isOnline) {
      for (let i = 0; i < 3; i++) {
        const p = ((tick * 0.42 + i * 15) % 45);
        const alpha = Math.max(0, 0.56 - p / 78);
        ctx.fillStyle = `rgba(245, 250, 255, ${alpha})`;
        const sx = chX + 5 + Math.sin(p * 0.16 + i) * 5;
        const sy = chY - 5 - p * 0.72;
        const sz = 5 + Math.floor(p / 9);
        ctx.fillRect(Math.floor(sx), Math.floor(sy), sz, sz);
      }
    }

    // Wall Outline + Plastered Timber Framing + Masonry Base
    px(ctx, x + 2, y + 30, w - 4, h - 30, ol);
    px(ctx, x + 4, y + 32, w - 8, h - 34, b.wallColor || '#f5e4c3');
    // Warm roof eaves drop-shadow on wall
    ctx.fillStyle = 'rgba(40, 20, 5, 0.22)';
    ctx.fillRect(x + 4, y + 34, w - 8, 9);

    // Stone masonry base
    px(ctx, x + 4, y + h - 14, w - 8, 12, '#736e66');
    for (let sx = x + 6; sx < x + w - 12; sx += 14) {
      px(ctx, sx, y + h - 12, 11, 8, '#a6a095');
      px(ctx, sx, y + h - 12, 9, 2, '#cfcac0');
    }

    // Corner timber beams + decorative cross beam
    px(ctx, x + 4, y + 32, 6, h - 34, '#542c12');
    px(ctx, x + 6, y + 32, 2, h - 34, '#8c5027');
    px(ctx, x + w - 10, y + 32, 6, h - 34, '#542c12');
    px(ctx, x + w - 8, y + 32, 2, h - 34, '#8c5027');

    // Stepped 16-Bit Gable Roof with Overhanging Eaves!
    px(ctx, x - 6, y + 12, w + 12, 26, ol);
    px(ctx, x - 4, y + 14, w + 8, 22, roofDark);
    for (let step = 0; step < 5; step++) {
      const inset = step * 8;
      const ry = y + 10 - step * 4;
      if (w - inset * 2 < 24) break;
      px(ctx, x - 2 + inset, ry - 2, w + 4 - inset * 2, 16, ol);
      px(ctx, x + inset, ry, w - inset * 2, 14, roofBase);
      px(ctx, x + inset + 2, ry, w - inset * 2 - 4, 2, roofHi);
    }

    // Scalloped shingle tiles
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    for (let ry = y + 6; ry < y + 32; ry += 6) {
      ctx.fillRect(x + 4, ry, w - 8, 2);
      for (let rx = x + ((ry % 12 === 0) ? 6 : 12); rx < x + w - 8; rx += 12) {
        ctx.fillRect(rx, ry - 4, 2, 4);
      }
    }

    // Rooftop Tech Landmark Emblems
    if (b.id === 'remote_tower' || b.id === 'dns_tower' || b.id === 'mail_proxy') {
      const ax = x + 22;
      const ay = y - 24;
      px(ctx, ax, ay, 4, 24, '#37474f');
      px(ctx, ax - 7, ay + 6, 18, 3, '#90a4ae');
      const pulse = Math.floor(tick / 14) % 2 === 0;
      px(ctx, ax - 1, ay - 5, 6, 6, isOnline ? (pulse ? '#5ce1e6' : '#0284c7') : (pulse ? '#ff4444' : '#6e1414'));
    } else if (b.id === 'win_hall') {
      const cx = x + 16;
      const cy = y - 14;
      px(ctx, cx, cy, 16, 16, '#1e3a8a');
      px(ctx, cx + 2, cy + 2, 5, 5, '#38bdf8');
      px(ctx, cx + 9, cy + 2, 5, 5, '#60a5fa');
      px(ctx, cx + 2, cy + 9, 5, 5, '#60a5fa');
      px(ctx, cx + 9, cy + 9, 5, 5, '#93c5fd');
    } else if (b.id === 'cron_clock') {
      const cx = x + 16;
      const cy = y - 14;
      px(ctx, cx, cy, 16, 16, '#7a5c00');
      px(ctx, cx + 2, cy + 2, 12, 12, '#fffdf0');
      px(ctx, cx + 7, cy + 4, 2, 5, '#263238');
      px(ctx, cx + 7, cy + 8, 5, 2, '#d84315');
    } else if (b.id === 'grand_hall') {
      px(ctx, x + Math.floor(w / 2) - 12, y - 18, 24, 12, '#b45309');
      px(ctx, x + Math.floor(w / 2) - 10, y - 16, 20, 8, '#fde047');
    }

    // Arched Wooden Door + Awning + Stone Step
    const doorX = x + Math.floor(w / 2) - 14;
    const doorY = y + h - 38;
    px(ctx, doorX - 2, doorY - 2, 32, 38, ol);
    px(ctx, doorX, doorY, 28, 34, '#6b3b19');
    px(ctx, doorX + 3, doorY + 3, 22, 28, '#9c5a2a');
    px(ctx, doorX + 6, doorY + 6, 16, 10, '#bd753d');
    px(ctx, doorX + 20, doorY + 18, 3, 3, '#ffd54f');
    // Mini wooden door awning
    px(ctx, doorX - 4, doorY - 6, 36, 6, ol);
    px(ctx, doorX - 2, doorY - 5, 32, 4, roofBase);
    // Stone doorstep
    px(ctx, doorX - 4, y + h - 4, 36, 6, '#9e988c');
    px(ctx, doorX - 2, y + h - 4, 32, 2, '#d4cfc5');

    // Warm Glowing Windows + Curtains + Flowerboxes
    const winPositions = [x + 16, x + w - 42];
    winPositions.forEach((wx) => {
      px(ctx, wx - 2, y + 46, 28, 26, ol);
      px(ctx, wx, y + 48, 24, 22, '#6b3b19');
      if (isOnline) {
        px(ctx, wx + 3, y + 51, 18, 16, '#ffd966');
        px(ctx, wx + 5, y + 53, 14, 12, '#fff5bf');
      } else {
        px(ctx, wx + 3, y + 51, 18, 16, '#435869');
        px(ctx, wx + 5, y + 53, 6, 4, '#627d91');
      }
      px(ctx, wx + 11, y + 51, 2, 16, '#5c3114');
      px(ctx, wx + 3, y + 58, 18, 2, '#5c3114');
      // Blooming flowerbox
      px(ctx, wx - 1, y + 70, 26, 6, '#5c3114');
      px(ctx, wx + 1, y + 71, 22, 4, '#8f5228');
      px(ctx, wx + 3, y + 67, 18, 4, '#47a855');
      px(ctx, wx + 5, y + 66, 4, 3, '#ff6b8b');
      px(ctx, wx + 14, y + 66, 4, 3, '#ffe066');
    });

    // Crisp Wooden Name Signboard with Online/Offline LED
    const signW = Math.min(w - 10, 146);
    const signX = x + Math.floor((w - signW) / 2);
    const signY = y + 14;
    px(ctx, signX, signY, signW, 20, ol);
    px(ctx, signX + 2, signY + 2, signW - 4, 16, '#faeccb');
    px(ctx, signX + 2, signY + 2, signW - 4, 2, '#fff9eb');

    const blink = Math.floor(tick / 18) % 2 === 0;
    px(ctx, signX + 6, signY + 6, 8, 8, isOnline ? '#2ec45c' : (blink ? '#e63946' : '#7a1c22'));
    if (isOnline) px(ctx, signX + 8, signY + 7, 3, 2, '#b9ffd0');

    ctx.fillStyle = '#331807';
    ctx.font = 'bold 11px Kanit, Tahoma, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(b.shortName, signX + 18, signY + 14);
  }

  // ==================== SLEEK 16-BIT SERVER RACK ====================
  function drawServerRack(ctx, wx, wy, online, tick) {
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.fillRect(wx + 2, wy + 26, 28, 8);

    px(ctx, wx + 3, wy - 10, 26, 38, '#121b22');
    px(ctx, wx + 5, wy - 8, 22, 34, '#334155');
    px(ctx, wx + 5, wy - 8, 22, 3, '#64748b');
    px(ctx, wx + 5, wy - 8, 2, 34, '#475569');

    for (let r = 0; r < 3; r++) {
      const ry = wy - 3 + r * 10;
      px(ctx, wx + 8, ry, 16, 8, '#0f172a');
      const blink = Math.floor(tick / 10 + r) % 2 === 0;
      if (online) {
        px(ctx, wx + 10, ry + 2, 3, 3, '#4eff7a');
        px(ctx, wx + 15, ry + 2, 7, 2, blink ? '#5ce1e6' : '#0284c7');
        px(ctx, wx + 15, ry + 5, 5, 1, '#2ec45c');
      } else {
        px(ctx, wx + 10, ry + 2, 3, 3, blink ? '#ff4444' : '#7a1616');
        px(ctx, wx + 15, ry + 2, 7, 2, '#334155');
      }
    }

    // Subtle glass door reflection highlight
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(wx + 8, wy - 6, 3, 28);

    if (online && Math.floor(tick / 20) % 2 === 0) {
      px(ctx, wx + 14, wy - 14, 4, 3, 'rgba(92,225,230,0.8)');
    } else if (!online && Math.floor(tick / 12) % 3 === 0) {
      px(ctx, wx + 22, wy - 14, 3, 3, '#ffd54f');
      px(ctx, wx + 26, wy - 10, 2, 2, '#ff7043');
    }
  }

  // ==================== 16-BIT IRON-BANDED TREASURE CHEST ====================
  function drawCrate(ctx, wx, wy, opened, tick) {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(wx + 4, wy + 23, 24, 6);
    px(ctx, wx + 4, wy + 6, 24, 19, '#2e180a');
    px(ctx, wx + 6, wy + 8, 20, 15, opened ? '#75502f' : '#c97d36');
    px(ctx, wx + 6, wy + 8, 20, 4, opened ? '#593b22' : '#e6a15c');
    px(ctx, wx + 6, wy + 13, 20, 2, '#455a64');
    px(ctx, wx + 13, wy + 11, 6, 6, '#f59e0b');
    px(ctx, wx + 15, wy + 13, 2, 2, '#fff59d');

    if (!opened) {
      const dy = Math.sin(tick / 10) * 3;
      px(ctx, wx + 14, wy - 4 + dy, 4, 4, '#fff59d');
      px(ctx, wx + 15, wy - 6 + dy, 2, 8, 'rgba(255,245,157,0.7)');
    }
  }

  // ==================== 16-BIT CENTRAL PLAZA ANIMATED FOUNTAIN ====================
  function drawFountain(ctx, wx, wy, tick) {
    ctx.fillStyle = 'rgba(0,0,0,0.24)';
    ctx.fillRect(wx - 10, wy + 26, 84, 12);
    px(ctx, wx - 8, wy + 4, 80, 28, '#545049');
    px(ctx, wx - 6, wy + 6, 76, 24, '#bdb7aa');
    px(ctx, wx - 4, wy + 8, 72, 20, '#e3ded2');
    px(ctx, wx, wy + 10, 64, 14, '#2d88bf');
    px(ctx, wx + 2, wy + 12, 60, 10, '#5ec8f2');
    px(ctx, wx + 24, wy - 10, 16, 26, '#6e6a61');
    px(ctx, wx + 26, wy - 8, 12, 22, '#cfcac0');
    px(ctx, wx + 22, wy - 12, 20, 6, '#e3ded2');
    const p = tick % 20;
    const h = 8 + Math.sin(tick / 6) * 3;
    px(ctx, wx + 30, wy - 14 - h, 4, h + 4, '#b8f2ff');
    px(ctx, wx + 28, wy - 15 - h, 8, 3, '#ffffff');
    const dropY = (p / 20) * 18;
    px(ctx, wx + 18, wy - 8 + dropY, 3, 4, '#d4f7ff');
    px(ctx, wx + 43, wy - 8 + dropY, 3, 4, '#d4f7ff');
    const r = (tick % 30) / 30;
    ctx.strokeStyle = `rgba(255,255,255,${0.8 - r * 0.7})`;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(wx + 12 - r * 6, wy + 13, 14 + r * 12, 8);
    ctx.strokeRect(wx + 38 - r * 6, wy + 13, 14 + r * 12, 8);
  }

  // ==================== 16-BIT DECORATIVE BENCH ====================
  function drawBench(ctx, wx, wy) {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(wx + 2, wy + 22, 44, 6);
    px(ctx, wx + 2, wy + 8, 44, 16, '#3b200d');
    px(ctx, wx + 4, wy + 10, 40, 5, '#b56e38');
    px(ctx, wx + 4, wy + 16, 40, 5, '#965728');
    px(ctx, wx + 6, wy + 21, 4, 5, '#455a64');
    px(ctx, wx + 38, wy + 21, 4, 5, '#455a64');
  }

  // ==================== 16-BIT VILLAGE STREET LAMP ====================
  function drawLamp(ctx, wx, wy, nightFactor) {
    ctx.fillStyle = 'rgba(0,0,0,0.24)';
    ctx.fillRect(wx + 10, wy + 25, 12, 5);
    px(ctx, wx + 13, wy - 8, 6, 36, '#262120');
    px(ctx, wx + 14, wy - 8, 2, 35, '#4a4341');
    px(ctx, wx + 9, wy - 12, 14, 5, '#262120');
    px(ctx, wx + 10, wy - 7, 12, 10, '#262120');
    px(ctx, wx + 12, wy - 5, 8, 7, nightFactor > 0.15 ? '#ffe57f' : '#d6e8f0');
    if (nightFactor > 0.12) {
      ctx.save();
      const grad = ctx.createRadialGradient(wx + 16, wy - 2, 4, wx + 16, wy - 2, 68);
      grad.addColorStop(0, `rgba(255, 224, 125, ${0.48 * nightFactor})`);
      grad.addColorStop(1, 'rgba(255, 224, 125, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(wx + 16, wy - 2, 68, 0, Math.PI * 2);
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
