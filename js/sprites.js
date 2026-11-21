// Server Valley — Authentic Stardew Valley 16-Bit Pixel-Art Engine
// Crisp integer pixel-art (32x32 tiles, 16x32 tall farmer sprites, wood-plank farmhouses with porch & log stack,
// golden-ochre farm dirt, scalloped emerald grass borders, roofed stone wells, beehouses, scarecrows & sakura trees)
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
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
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
      r = Math.max(0, Math.round(r * f * 0.95));
      g = Math.max(0, Math.round(g * f * 0.97));
      b = Math.max(0, Math.min(255, Math.round(b * (f + 0.04))));
    } else {
      r = Math.min(255, Math.round(r + (255 - r) * pct * 1.04));
      g = Math.min(255, Math.round(g + (255 - g) * pct));
      b = Math.min(255, Math.round(b + (255 - b) * pct * 0.85));
    }
    const res = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    shadeCache[key] = res;
    return res;
  }

  // ==================== STARDEW VALLEY 16x28 FARMER PIXEL SPRITE ====================
  function drawCharacter(ctx, x, y, style, dir = 'down', frame = 0, scale = 2, tick = 0) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const offsetX = scale === 2 ? -4 : 0;
    const offsetY = scale === 2 ? -16 : 0;
    ctx.translate(Math.floor(x + offsetX), Math.floor(y + offsetY));
    ctx.scale(scale, scale);

    const ol = '#291309';
    const skin = style.skin || '#f6cfa6';
    const skinHi = shadeHex(skin, 0.20);
    const skinSh = shadeHex(skin, -0.18);

    const shirt = style.shirt || '#b83227';
    const shirtHi = shadeHex(shirt, 0.22);
    const shirtSh = shadeHex(shirt, -0.24);
    const shirtStyle = style.shirtStyle || 'jacket';

    const pants = style.pants || '#245294';
    const pantsHi = shadeHex(pants, 0.20);
    const pantsSh = shadeHex(pants, -0.25);

    const shoes = style.shoes || '#5c3317';
    const shoesHi = shadeHex(shoes, 0.22);

    const hair = style.hair || '#4a2512';
    const hairHi = shadeHex(hair, 0.26);
    const hairSh = shadeHex(hair, -0.25);
    const hairStyle = style.hairStyle || 'short';
    const faceStyle = style.faceStyle || (style.glasses ? 'glasses' : 'smile');

    const bob = (frame === 1 || frame === 3) ? -1 : 0;
    const by = bob;
    const legL = frame === 1 ? -1 : frame === 3 ? 1 : 0;
    const legR = -legL;
    const armL = frame === 1 ? 1 : frame === 3 ? -1 : 0;
    const armR = -armL;
    const blink = (tick % 200) > 192;

    // 1. Crisp Stardew oval pixel shadow under feet
    px(ctx, 5, 25, 10, 2, 'rgba(38, 22, 8, 0.32)');
    px(ctx, 4, 26, 12, 1, 'rgba(38, 22, 8, 0.24)');

    // 2. Back hair if long
    if (hairStyle === 'long' && dir !== 'up') {
      px(ctx, 4, 9 + by, 12, 9, ol);
      px(ctx, 5, 9 + by, 10, 8, hairSh);
    }

    // 3. Legs & Farmer Boots (with Stardew blue-overall legs!)
    // Left leg
    px(ctx, 6, 20 + legL, 4, 6, ol);
    px(ctx, 7, 20 + legL, 2, 3, pants);
    px(ctx, 7, 20 + legL, 1, 3, pantsHi);
    px(ctx, 6, 23 + legL, 4, 3, ol);
    px(ctx, 7, 23 + legL, 2, 2, shoes);
    px(ctx, 7, 23 + legL, 1, 1, shoesHi);

    // Right leg
    px(ctx, 10, 20 + legR, 4, 6, ol);
    px(ctx, 11, 20 + legR, 2, 3, pants);
    px(ctx, 12, 20 + legR, 1, 3, pantsSh);
    px(ctx, 10, 23 + legR, 4, 3, ol);
    px(ctx, 11, 23 + legR, 2, 2, shoes);
    px(ctx, 11, 23 + legR, 1, 1, shoesHi);

    // 4. Torso (Shirt + Classic Stardew Farmer Overalls / Jacket / Polo)
    px(ctx, 5, 13 + by, 10, 8, ol);
    px(ctx, 6, 14 + by, 8, 6, shirt);
    px(ctx, 6, 14 + by, 8, 1, shirtHi);

    if (shirtStyle === 'jacket') {
      // Classic Stardew Farmer Overalls & straps over shirt!
      px(ctx, 6, 17 + by, 8, 3, pants);
      px(ctx, 7, 14 + by, 1, 4, pantsHi);
      px(ctx, 12, 14 + by, 1, 4, pantsHi);
      px(ctx, 7, 16 + by, 1, 1, '#ffd54f'); // brass overall button
      px(ctx, 12, 16 + by, 1, 1, '#ffd54f');
      px(ctx, 8, 17 + by, 4, 2, pantsHi);
    } else if (shirtStyle === 'polo') {
      px(ctx, 8, 14 + by, 4, 1, '#ffffff');
      px(ctx, 9, 15 + by, 2, 2, '#ffffff');
      px(ctx, 6, 19 + by, 8, 1, '#3b200d');
      px(ctx, 9, 19 + by, 2, 1, '#ffd54f');
    } else {
      // Hoodie
      px(ctx, 7, 14 + by, 6, 1, shirtSh);
      px(ctx, 8, 15 + by, 1, 2, '#fff8e7');
      px(ctx, 11, 15 + by, 1, 2, '#fff8e7');
      px(ctx, 7, 17 + by, 6, 2, shirtSh);
    }

    // 5. Swinging Pixel Arms & Hands
    px(ctx, 4, 14 + by + armL, 2, 6, ol);
    px(ctx, 4, 14 + by + armL, 1, 4, shirt);
    px(ctx, 4, 18 + by + armL, 1, 1, skin);

    px(ctx, 14, 14 + by + armR, 2, 6, ol);
    px(ctx, 15, 14 + by + armR, 1, 4, shirtSh);
    px(ctx, 15, 18 + by + armR, 1, 1, skin);

    // 6. Head & Expressive Stardew Pixel Face
    px(ctx, 5, 3 + by, 10, 11, ol);
    px(ctx, 4, 4 + by, 12, 9, ol);
    px(ctx, 5, 4 + by, 10, 9, skin);
    px(ctx, 6, 4 + by, 8, 1, skinHi);
    px(ctx, 5, 12 + by, 10, 1, skinSh);

    if (dir === 'up') {
      px(ctx, 4, 3 + by, 12, 10, ol);
      px(ctx, 5, 3 + by, 10, 9, hair);
      px(ctx, 6, 4 + by, 8, 2, hairHi);
      px(ctx, 5, 10 + by, 10, 2, hairSh);
      if (hairStyle === 'long') {
        px(ctx, 4, 11 + by, 12, 7, ol);
        px(ctx, 5, 11 + by, 10, 6, hair);
      } else if (hairStyle === 'ponytail') {
        px(ctx, 8, 9 + by, 4, 2, '#e63946');
        px(ctx, 8, 11 + by, 4, 5, hair);
      }
    } else {
      // Hair Bangs & Sideburns
      px(ctx, 5, 2 + by, 10, 4, ol);
      px(ctx, 4, 3 + by, 12, 3, ol);
      px(ctx, 5, 3 + by, 10, 3, hair);
      px(ctx, 6, 3 + by, 4, 1, hairHi);
      px(ctx, 11, 3 + by, 3, 1, hairHi);
      px(ctx, 4, 5 + by, 2, 4, hair);
      px(ctx, 14, 5 + by, 2, 4, hairSh);

      if (hairStyle === 'spiky' && !style.hat) {
        px(ctx, 5, 1 + by, 2, 2, hair);
        px(ctx, 9, 0 + by, 3, 3, hairHi);
        px(ctx, 13, 1 + by, 2, 2, hair);
      } else if (hairStyle === 'bob' || hairStyle === 'long') {
        const hLen = hairStyle === 'long' ? 9 : 6;
        px(ctx, 4, 5 + by, 2, hLen, hair);
        px(ctx, 14, 5 + by, 2, hLen, hairSh);
      } else if (hairStyle === 'curly') {
        px(ctx, 4, 2 + by, 12, 4, hair);
        px(ctx, 5, 2 + by, 3, 2, hairHi);
        px(ctx, 11, 2 + by, 3, 2, hairHi);
      }

      if (dir === 'down') {
        // Rosy cheeks
        px(ctx, 5, 10 + by, 1, 1, '#e88b84');
        px(ctx, 14, 10 + by, 1, 1, '#e88b84');

        if (faceStyle === 'cool') {
          px(ctx, 5, 7 + by, 4, 2, '#111827');
          px(ctx, 11, 7 + by, 4, 2, '#111827');
          px(ctx, 9, 7 + by, 2, 1, '#374151');
          px(ctx, 6, 7 + by, 1, 1, '#7dd3fc');
          px(ctx, 12, 7 + by, 1, 1, '#7dd3fc');
        } else if (faceStyle === 'happy') {
          px(ctx, 6, 8 + by, 2, 1, ol);
          px(ctx, 12, 8 + by, 2, 1, ol);
        } else if (faceStyle === 'wink') {
          px(ctx, 6, 7 + by, 2, 2, ol);
          px(ctx, 6, 7 + by, 1, 1, '#ffffff');
          px(ctx, 12, 8 + by, 2, 1, ol);
        } else if (!blink) {
          // Crisp Stardew 2x2 dark eyes with 1px white catchlight
          px(ctx, 6, 7 + by, 2, 2, '#1f1008');
          px(ctx, 6, 7 + by, 1, 1, '#ffffff');
          px(ctx, 12, 7 + by, 2, 2, '#1f1008');
          px(ctx, 12, 7 + by, 1, 1, '#ffffff');
        } else {
          px(ctx, 6, 8 + by, 2, 1, ol);
          px(ctx, 12, 8 + by, 2, 1, ol);
        }

        if (faceStyle === 'glasses' || style.glasses) {
          px(ctx, 5, 7 + by, 4, 2, 'rgba(125,211,252,0.35)');
          px(ctx, 11, 7 + by, 4, 2, 'rgba(125,211,252,0.35)');
          px(ctx, 5, 6 + by, 4, 1, '#1e293b');
          px(ctx, 11, 6 + by, 4, 1, '#1e293b');
          px(ctx, 9, 7 + by, 2, 1, '#1e293b');
        }

        if (style.beard) {
          px(ctx, 6, 10 + by, 8, 3, style.beard);
        } else {
          px(ctx, 9, 11 + by, 2, 1, '#b85d4b');
        }
      } else if (dir === 'left') {
        px(ctx, 6, 7 + by, 2, 2, '#1f1008');
        px(ctx, 6, 7 + by, 1, 1, '#ffffff');
        if (style.beard) px(ctx, 5, 10 + by, 5, 3, style.beard);
      } else if (dir === 'right') {
        px(ctx, 12, 7 + by, 2, 2, '#1f1008');
        px(ctx, 13, 7 + by, 1, 1, '#ffffff');
        if (style.beard) px(ctx, 10, 10 + by, 5, 3, style.beard);
      }
    }

    // 7. Classic Stardew Wide-Brimmed Straw Sun Hat (or Colored Cap)
    if (style.hat) {
      const isStraw = style.hat === '#c85a17' || style.hat === '#d97706';
      const crownCol = isStraw ? '#e8b04b' : style.hat;
      const crownHi  = isStraw ? '#fae082' : shadeHex(style.hat, 0.25);
      const brimCol  = isStraw ? '#d19234' : shadeHex(style.hat, -0.15);
      const bandCol  = isStraw ? '#b8332a' : (style.hatTrim || '#ffd166');
      // Hat crown
      px(ctx, 5, 0 + by, 10, 4, ol);
      px(ctx, 6, 1 + by, 8, 2, crownCol);
      px(ctx, 7, 1 + by, 6, 1, crownHi);
      // Hat ribbon band
      px(ctx, 5, 3 + by, 10, 1, bandCol);
      // Wide Stardew sun-hat brim
      px(ctx, 2, 4 + by, 16, 2, ol);
      px(ctx, 3, 4 + by, 14, 1, brimCol);
    }

    ctx.restore();
  }

  // ==================== STARDEW DIALOG & HUD PORTRAIT (48x48) ====================
  function getPortrait(key, style) {
    if (portraitCache[key]) return portraitCache[key];
    const c = makeCanvas(48, 48);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Warm Stardew wooden portrait frame background + sunny farm sky
    px(ctx, 0, 0, 48, 28, '#78c5f0');
    px(ctx, 0, 18, 48, 12, '#b0e2ff');
    px(ctx, 4, 5, 12, 4, '#ffffff');
    px(ctx, 30, 8, 13, 4, '#ffffff');
    // Distant green hills & golden dirt foreground
    px(ctx, 0, 26, 48, 8, '#4ca82c');
    px(ctx, 0, 34, 48, 14, '#e5a94c');

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

  // ==================== STARDEW VALLEY TERRAIN TILES (GOLDEN OCHRE EARTH, LUSH GRASS & CROP PLOTS) ====================
  function getStaticTileVariant(type, variant) {
    const key = 'sdv_' + type + '_' + variant;
    if (tileCache[key]) return tileCache[key];
    const c = makeCanvas(32, 32);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.scale(2, 2); // Crisp 16x16 pixel grid scaled 2x to 32x32!

    if (type === 'grass') {
      // Vibrant Stardew Valley Emerald-Lime Meadow Grass
      px(ctx, 0, 0, 16, 16, variant % 2 === 0 ? '#52b432' : '#4ca82d');
      const hi = '#74d646';
      const mid = '#3f9423';
      const deep = '#2b6e16';
      // Dithered pixel grass blades
      px(ctx, 1, 2, 1, 2, mid); px(ctx, 2, 1, 1, 2, hi);
      px(ctx, 10, 9, 1, 2, mid); px(ctx, 11, 8, 1, 2, hi);
      if (variant === 0) {
        px(ctx, 6, 12, 1, 2, deep); px(ctx, 7, 11, 1, 2, hi);
        px(ctx, 13, 3, 2, 1, hi);
      } else if (variant === 1) {
        // Tiny pastel white/pink clover blossoms like top-right of screenshot!
        px(ctx, 5, 6, 3, 3, deep);
        px(ctx, 5, 5, 1, 1, '#ffffff'); px(ctx, 7, 6, 1, 1, '#ffadc4'); px(ctx, 6, 7, 1, 1, '#ffffff');
      } else if (variant === 2) {
        // Lush dark-green 5-leaf weed tuft like top-left of screenshot!
        px(ctx, 5, 6, 6, 5, '#194d14');
        px(ctx, 6, 5, 4, 5, '#2b7a22');
        px(ctx, 5, 7, 2, 2, '#52b432'); px(ctx, 9, 7, 2, 2, '#52b432'); px(ctx, 7, 5, 2, 2, '#74d646');
      } else if (variant === 3) {
        // Tiny blue & pink pixel wildflowers
        px(ctx, 10, 5, 3, 3, deep);
        px(ctx, 10, 4, 1, 1, '#93c5fd'); px(ctx, 12, 5, 1, 1, '#ffffff');
        px(ctx, 3, 11, 1, 2, mid);
      } else if (variant === 4) {
        px(ctx, 4, 10, 2, 2, deep); px(ctx, 4, 9, 2, 1, '#ff9eb5');
        px(ctx, 12, 12, 1, 2, mid);
      } else {
        // Double gray field stones on grass
        px(ctx, 8, 10, 5, 4, '#3d4852');
        px(ctx, 9, 10, 3, 3, '#8795a1');
        px(ctx, 9, 10, 2, 1, '#dae1e7');
      }
    } else if (type === 'path') {
      // Iconic Stardew Valley Warm Golden-Ochre Farm Dirt (#e5a94c / #dfa043)
      px(ctx, 0, 0, 16, 16, variant % 2 === 0 ? '#e5a94c' : '#e0a346');
      const hi = '#f2be68';
      const sh = '#c98830';
      const pebble = '#b37220';
      // Warm dithered dirt speckles
      px(ctx, 2, 3, 2, 1, sh); px(ctx, 3, 2, 1, 1, hi);
      px(ctx, 11, 12, 2, 1, sh); px(ctx, 12, 11, 1, 1, hi);
      if (variant === 0) {
        // Sunken circular dirt divot (just like the screenshot!)
        px(ctx, 6, 6, 5, 4, sh);
        px(ctx, 7, 6, 3, 1, pebble);
        px(ctx, 7, 7, 3, 2, '#d8983c');
        px(ctx, 7, 9, 3, 1, hi);
      } else if (variant === 1) {
        // Tiny pebbles & green sprout in dirt
        px(ctx, 5, 9, 2, 2, sh); px(ctx, 5, 9, 1, 1, hi);
        px(ctx, 11, 4, 2, 2, '#3f9423'); px(ctx, 12, 3, 1, 1, '#74d646');
      } else if (variant === 2) {
        // Cluster of 3 small farm pebbles
        px(ctx, 4, 5, 2, 2, pebble); px(ctx, 4, 5, 1, 1, '#d69e5c');
        px(ctx, 7, 6, 2, 1, sh);
        px(ctx, 12, 10, 2, 1, sh);
      } else if (variant === 3) {
        px(ctx, 9, 4, 2, 1, hi);
        px(ctx, 3, 12, 3, 2, sh); px(ctx, 4, 12, 1, 1, hi);
      } else if (variant === 4) {
        // Tiny green dirt weeds
        px(ctx, 7, 11, 2, 2, '#3f9423'); px(ctx, 6, 10, 1, 1, '#74d646'); px(ctx, 9, 10, 1, 1, '#74d646');
      } else {
        px(ctx, 5, 4, 2, 1, sh);
        px(ctx, 10, 8, 2, 2, pebble); px(ctx, 10, 8, 1, 1, hi);
      }
    } else if (type === 'stone') {
      // Stardew Cobblestone Path over Golden Dirt
      px(ctx, 0, 0, 16, 16, '#c98830');
      const rocks = [
        [1, 1, 6, 6], [8, 1, 7, 6],
        [1, 8, 7, 7], [9, 8, 6, 7]
      ];
      rocks.forEach(([rx, ry, rw, rh], i) => {
        px(ctx, rx, ry, rw, rh, '#4a4640');
        px(ctx, rx + 1, ry + 1, rw - 2, rh - 2, (i + variant) % 2 === 0 ? '#a8a299' : '#969086');
        px(ctx, rx + 1, ry + 1, rw - 3, 1, '#d4cfc7');
        px(ctx, rx + 1, ry + rh - 2, rw - 2, 1, '#706b63');
      });
    } else if (type === 'soil') {
      // Authentic Stardew Valley Tilled Dark Soil Plot + Lush Pixel Crops (Berries / Trellis / Kale)!
      px(ctx, 0, 0, 16, 16, '#e5a94c'); // Golden dirt border
      // Tilled dark brown soil bed
      px(ctx, 1, 1, 14, 14, '#5e3112');
      px(ctx, 2, 2, 12, 12, '#7d441b');
      px(ctx, 2, 4, 12, 1, '#633312');
      px(ctx, 2, 10, 12, 1, '#633312');

      if (variant % 3 === 0) {
        // Bushy Red-Berry Crop (Strawberries/Cranberries like center-right of screenshot!)
        px(ctx, 3, 2, 10, 11, '#144513');
        px(ctx, 4, 1, 8, 11, '#267820');
        px(ctx, 3, 3, 10, 8, '#3da82d');
        px(ctx, 5, 2, 6, 4, '#6ee048');
        // Bright red pixel berries with yellow seeds!
        px(ctx, 4, 7, 3, 3, '#d9261c'); px(ctx, 5, 7, 1, 1, '#ffd54f');
        px(ctx, 9, 6, 3, 3, '#d9261c'); px(ctx, 10, 6, 1, 1, '#ffd54f');
        px(ctx, 7, 9, 2, 2, '#ff4d3d');
      } else if (variant % 3 === 1) {
        // Wooden Pole Trellis Crop (like top-left crop rows in screenshot!)
        px(ctx, 6, 12, 4, 2, 'rgba(0,0,0,0.30)');
        px(ctx, 7, 1, 2, 13, '#4a250c');
        px(ctx, 7, 1, 1, 12, '#8c4f23');
        // Green climbing sprout leaves at base of pole
        px(ctx, 5, 9, 6, 4, '#185418');
        px(ctx, 5, 10, 2, 2, '#4cc438');
        px(ctx, 9, 9, 2, 2, '#6ee048');
      } else {
        // Leafy Green Cauliflower / Kale Rosette (like middle crop plot in screenshot!)
        px(ctx, 4, 4, 8, 8, '#174f1a');
        px(ctx, 3, 5, 10, 6, '#288028');
        px(ctx, 5, 3, 6, 8, '#46b835');
        px(ctx, 6, 5, 4, 4, '#88f065');
        px(ctx, 7, 6, 2, 2, '#d9fca7');
      }
    } else if (type === 'fence') {
      // Connected Stardew Valley Wooden Post-and-Rail Fence over Golden Dirt!
      ctx.drawImage(getStaticTileVariant('path', 0), 0, 0, 16, 16);
      // Fence ground shadow
      px(ctx, 0, 13, 16, 2, 'rgba(54, 28, 8, 0.32)');
      // Horizontal rails connecting across tile
      px(ctx, 0, 5, 16, 3, '#42200a');
      px(ctx, 0, 6, 16, 1, '#c87838');
      px(ctx, 0, 9, 16, 3, '#42200a');
      px(ctx, 0, 10, 16, 1, '#a85f27');
      // Two thick vertical Stardew fence posts with flat ring tops
      [2, 10].forEach((fx) => {
        px(ctx, fx, 2, 5, 13, '#3b1c08');
        px(ctx, fx + 1, 3, 3, 11, '#b86b2e');
        px(ctx, fx + 1, 3, 1, 11, '#db8c48');
        // Post flat cap ring
        px(ctx, fx + 1, 2, 3, 2, '#e8a45c');
        px(ctx, fx + 2, 3, 1, 1, '#85461a');
      });
    }

    tileCache[key] = c;
    return c;
  }

  function drawTile(ctx, type, gx, gy, wx, wy, tick, grid) {
    const hash = ((gx * 73856093) ^ (gy * 19349663)) >>> 0;

    if (type === 'water') {
      // Stardew Valley Water Basin with terraced dirt/rock bank wall
      px(ctx, wx, wy, 32, 32, '#247ba0');
      const phase = Math.floor((tick / 16 + gx * 0.7 + gy * 0.5) % 4);
      px(ctx, wx + 2, wy + 2, 28, 28, '#2d8cb5');
      px(ctx, wx + 4 + phase * 2, wy + 8, 8, 2, '#75d0f2');
      px(ctx, wx + 16 - phase * 2, wy + 22, 10, 2, '#75d0f2');

      if (grid) {
        const up = gy > 0 && grid[gy - 1][gx] !== 'water' && grid[gy - 1][gx] !== 'bridge';
        const dn = gy < grid.length - 1 && grid[gy + 1][gx] !== 'water' && grid[gy + 1][gx] !== 'bridge';
        const lt = gx > 0 && grid[gy][gx - 1] !== 'water' && grid[gy][gx - 1] !== 'bridge';
        const rt = gx < grid[0].length - 1 && grid[gy][gx + 1] !== 'water' && grid[gy][gx + 1] !== 'bridge';
        if (up) {
          px(ctx, wx, wy, 32, 8, '#6e4219');
          px(ctx, wx, wy, 32, 4, '#9c622b');
          px(ctx, wx, wy, 32, 2, '#e5a94c');
          px(ctx, wx + 2, wy + 8 + (phase % 2), 28, 2, '#d4f5ff');
        }
        if (dn) {
          px(ctx, wx, wy + 28, 32, 4, '#5c3614');
          px(ctx, wx + 2, wy + 26, 28, 2, 'rgba(212,245,255,0.6)');
        }
        if (lt) {
          px(ctx, wx, wy, 5, 32, '#7a4a1d');
          px(ctx, wx + 5, wy + 2, 2, 28, 'rgba(212,245,255,0.6)');
        }
        if (rt) {
          px(ctx, wx + 27, wy, 5, 32, '#7a4a1d');
          px(ctx, wx + 25, wy + 2, 2, 28, 'rgba(212,245,255,0.6)');
        }
      }

      if (hash % 13 === 0) {
        px(ctx, wx + 8, wy + 12, 14, 10, '#1e5e2a');
        px(ctx, wx + 9, wy + 11, 12, 8, '#46b849');
        if (hash % 26 === 0) {
          px(ctx, wx + 11, wy + 12, 4, 4, '#ffadc4');
          px(ctx, wx + 12, wy + 13, 2, 2, '#fff59d');
        }
      }
      return;
    }

    if (type === 'bridge') {
      px(ctx, wx, wy, 32, 32, '#247ba0');
      px(ctx, wx, wy + 2, 32, 28, '#3b1c08');
      px(ctx, wx, wy + 4, 32, 24, '#b86b2e');
      for (let i = 0; i < 32; i += 8) {
        px(ctx, wx + i, wy + 4, 2, 24, '#633312');
        px(ctx, wx + i + 2, wy + 5, 5, 2, '#db8c48');
      }
      px(ctx, wx, wy + 3, 32, 3, '#e09652');
      px(ctx, wx, wy + 26, 32, 3, '#94521f');
      return;
    }

    const variant = hash % 6;
    ctx.drawImage(getStaticTileVariant(type, variant), wx, wy);

    // Iconic Stardew Scalloped Grass-Over-Dirt Cliff/Lip Transitions (like top-right of screenshot!)
    if ((type === 'path' || type === 'stone') && grid) {
      const gLight = '#74d646';
      const gMain  = '#52b432';
      const gDark  = '#2b6e16';
      const lipSoil = '#b07228';

      if (gy > 0 && grid[gy - 1][gx] === 'grass') {
        // Sunken dirt bevel lip + jagged green grass tufts hanging down
        px(ctx, wx, wy + 4, 32, 3, lipSoil);
        px(ctx, wx, wy, 32, 4, gDark);
        px(ctx, wx, wy, 32, 2, gMain);
        for (let tx0 = 0; tx0 < 32; tx0 += 8) {
          px(ctx, wx + tx0 + 2, wy + 2, 4, 3, gMain);
          px(ctx, wx + tx0 + 3, wy + 1, 2, 2, gLight);
        }
      }
      if (gy < grid.length - 1 && grid[gy + 1][gx] === 'grass') {
        px(ctx, wx, wy + 28, 32, 4, gDark);
        for (let tx0 = 0; tx0 < 32; tx0 += 8) {
          px(ctx, wx + tx0 + 1, wy + 27, 5, 4, gMain);
          px(ctx, wx + tx0 + 2, wy + 27, 3, 2, gLight);
        }
      }
      if (gx > 0 && grid[gy][gx - 1] === 'grass') {
        px(ctx, wx, wy, 4, 32, gDark);
        px(ctx, wx, wy + 4, 5, 10, gMain);
        px(ctx, wx, wy + 20, 5, 8, gMain);
      }
      if (gx < grid[0].length - 1 && grid[gy][gx + 1] === 'grass') {
        px(ctx, wx + 28, wy, 4, 32, gDark);
        px(ctx, wx + 27, wy + 6, 5, 10, gMain);
        px(ctx, wx + 27, wy + 20, 5, 8, gMain);
      }
    }
  }

  // ==================== STARDEW VALLEY TREES (OAK + PINE + PINK SAKURA BLOSSOM) ====================
  function getTreeSprite(variant) {
    const key = 'sdv_tree_' + variant;
    if (treeCache[key]) return treeCache[key];
    const c = makeCanvas(64, 80);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.scale(2, 2); // 32x40 crisp pixel grid!
    const ol = '#1e160d';

    // Pixel ground shadow
    px(ctx, 6, 33, 20, 4, 'rgba(38, 22, 8, 0.28)');
    px(ctx, 8, 32, 16, 6, 'rgba(38, 22, 8, 0.22)');

    // Textured Stardew Tree Trunk with root flare & bark grain (like bottom-left of screenshot!)
    px(ctx, 12, 20, 8, 15, '#3b1c0a');
    px(ctx, 10, 33, 12, 3, '#3b1c0a');
    px(ctx, 13, 20, 6, 14, '#8c4c1e');
    px(ctx, 14, 20, 2, 14, '#b86c32');
    px(ctx, 17, 21, 1, 13, '#5e3010');
    px(ctx, 11, 33, 3, 2, '#8c4c1e');
    px(ctx, 18, 33, 3, 2, '#5e3010');
    // Cute fallen acorns at roots
    px(ctx, 9, 35, 2, 2, '#d99b26');
    px(ctx, 12, 36, 2, 2, '#d99b26');

    if (variant === 1) {
      // Deep Forest Teal-Green Tree (top-left of screenshot!)
      const c1 = '#0f3822';
      const c2 = '#195e36';
      const c3 = '#2d8a4e';
      const c4 = '#52b868';
      px(ctx, 4, 6, 24, 16, c1);
      px(ctx, 6, 3, 20, 20, c1);
      px(ctx, 5, 5, 22, 16, c2);
      px(ctx, 7, 4, 18, 14, c3);
      for (let ly = 5; ly <= 17; ly += 3) {
        for (let lx = 6 + (ly % 2) * 2; lx <= 22; lx += 4) {
          px(ctx, lx, ly, 3, 2, c4);
        }
      }
    } else {
      // Variant 0: Lush Emerald Leafy Oak (bottom-left of screenshot)
      // Variant 2: Fluffy Pink Cherry Blossom Tree (right side of screenshot!)
      const isSakura = variant === 2;
      const cOl  = isSakura ? '#5c1936' : '#143d14';
      const cSh  = isSakura ? '#9e3b68' : '#216b1e';
      const cMid = isSakura ? '#d9689b' : '#3ba12b';
      const cHi  = isSakura ? '#f79ec8' : '#65cf42';
      const cTop = isSakura ? '#ffd6eb' : '#9ef065';

      // Rounded scalloped canopy silhouette
      px(ctx, 5, 6, 22, 16, cOl);
      px(ctx, 7, 3, 18, 20, cOl);
      px(ctx, 3, 9, 26, 11, cOl);

      px(ctx, 6, 7, 20, 15, cSh);
      px(ctx, 8, 4, 16, 18, cSh);
      px(ctx, 4, 10, 24, 9, cSh);

      px(ctx, 6, 5, 20, 14, cMid);
      px(ctx, 5, 8, 22, 10, cMid);

      // Individually dithered Stardew leaf clusters across crown!
      for (let ly = 5; ly <= 17; ly += 3) {
        for (let lx = 6 + (ly % 2); lx <= 22; lx += 4) {
          px(ctx, lx, ly, 3, 2, cHi);
          if (ly <= 12) px(ctx, lx + 1, ly, 2, 1, cTop);
        }
      }
    }

    treeCache[key] = c;
    return c;
  }

  function drawTree(ctx, wx, wy, variant = 0, tick = 0) {
    const sway = Math.round(Math.sin(tick / 35 + wx * 0.04));
    ctx.drawImage(getTreeSprite(variant), Math.floor(wx - 16 + sway), Math.floor(wy - 46));
  }

  // ==================== STARDEW VALLEY WOODEN FARMHOUSE & CABIN BUILDINGS ====================
  // Matches the uploaded screenshot: vertical wood-plank walls, pitched shingle roof with front gable peak
  // and round attic window, left firewood log-stack shed, green-shuttered window, raised wooden front porch
  // with 3-step stairs, red doormat, flower barrel, mailbox & shipping bin!
  function drawBuilding(ctx, b, isOnline, tick) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const x = b.tx * 32;
    const y = b.ty * 32;
    const w = b.tw * 32;
    const h = b.th * 32;
    const ol = '#2b1306';

    const roofBase = b.roofColor || '#b8332a';
    const roofHi = shadeHex(roofBase, 0.22);
    const roofDark = b.roofDark || shadeHex(roofBase, -0.28);

    // Warm Stardew wood-plank wall palette (tinted slightly by building wallColor)
    const woodMain = '#cf823a';
    const woodHi   = '#e69d52';
    const woodSeam = '#9e581c';
    const woodDark = '#6e380d';

    // 1. Ground Shadow under porch & cabin
    px(ctx, x + 4, y + h - 2, w - 4, 10, 'rgba(38, 22, 8, 0.30)');

    // 2. Brick Chimney + Cozy Puffing Smoke
    const chX = x + w - 34;
    const chY = y - 16;
    px(ctx, chX, chY, 16, 26, ol);
    px(ctx, chX + 2, chY + 2, 12, 22, '#9e3b2c');
    px(ctx, chX + 2, chY + 8, 12, 2, '#5c1f16');
    px(ctx, chX + 2, chY + 15, 12, 2, '#5c1f16');
    if (isOnline) {
      for (let i = 0; i < 3; i++) {
        const p = ((tick * 0.4 + i * 15) % 42);
        const sx = chX + 4 + Math.sin(p * 0.15 + i) * 4;
        const sy = chY - 6 - p * 0.65;
        px(ctx, sx, sy, 6, 5, 'rgba(255,255,255,0.65)');
      }
    }

    // 3. Right-Side Stacked Log Columns (exact detail on right edge of Farmhouse in screenshot!)
    const logColX = x + w - 14;
    px(ctx, logColX, y + 20, 14, h - 22, ol);
    for (let ly = y + 22; ly < y + h - 8; ly += 10) {
      px(ctx, logColX + 2, ly, 10, 8, '#b56727');
      px(ctx, logColX + 2, ly, 10, 2, '#de914b');
      px(ctx, logColX + 2, ly + 6, 10, 2, '#753c10');
    }

    // 4. Main Cabin Wall with Vertical Wood Planks (like the Stardew Farmhouse!)
    px(ctx, x + 2, y + 24, w - 14, h - 40, ol);
    px(ctx, x + 4, y + 26, w - 18, h - 44, woodMain);
    // Vertical plank grooves every 6px
    for (let px0 = x + 8; px0 < x + w - 14; px0 += 6) {
      px(ctx, px0, y + 26, 2, h - 44, woodSeam);
      px(ctx, px0 + 2, y + 26, 2, h - 44, woodHi);
    }
    // Under-eave shadow band
    px(ctx, x + 4, y + 32, w - 18, 6, 'rgba(45, 18, 4, 0.30)');

    // 5. Left Firewood Log-Stack Alcove (stacked cut log circles under left roof eave, exact match to screenshot!)
    const alcX = x + 8;
    const alcY = y + 40;
    const alcW = Math.min(54, Math.floor(w * 0.28));
    const alcH = h - 62;
    px(ctx, alcX, alcY, alcW, alcH, '#3b1c08');
    px(ctx, alcX + 2, alcY + 2, alcW - 4, alcH - 4, '#592b0e');
    // Draw tightly packed circular firewood log ends!
    for (let ry = alcY + 4; ry < alcY + alcH - 6; ry += 7) {
      const rowShift = ((ry - alcY) % 14 === 0) ? 0 : 3;
      for (let rx = alcX + 4 + rowShift; rx < alcX + alcW - 8; rx += 8) {
        px(ctx, rx, ry, 6, 6, '#7a3e14');
        px(ctx, rx + 1, ry + 1, 4, 4, '#d98f46');
        px(ctx, rx + 2, ry + 2, 2, 2, '#f5be78');
      }
    }

    // 6. Elevated Wooden Front Porch Deck + Vertical Skirt Planks + 3-Step Front Stairs!
    const porchY = y + h - 22;
    px(ctx, x + 2, porchY, w - 12, 20, ol);
    // Horizontal porch deck surface
    px(ctx, x + 4, porchY + 2, w - 16, 8, '#d4873c');
    px(ctx, x + 4, porchY + 2, w - 16, 2, '#eba55b');
    px(ctx, x + 4, porchY + 6, w - 16, 2, '#9e581c');
    // Vertical porch skirt boards below deck
    px(ctx, x + 4, porchY + 10, w - 16, 8, '#a85e21');
    for (let sx = x + 8; sx < x + w - 14; sx += 6) {
      px(ctx, sx, porchY + 10, 2, 8, '#6e380d');
    }

    // Front 3-Step Wooden Staircase (centered under front door)
    const doorX = x + Math.floor(w * 0.56) - 14;
    const stairX = doorX - 8;
    const stairW = 44;
    px(ctx, stairX - 2, porchY + 6, stairW + 4, 16, ol);
    for (let st = 0; st < 3; st++) {
      const sy = porchY + 7 + st * 4;
      px(ctx, stairX, sy, stairW, 3, '#de914b');
      px(ctx, stairX, sy + 3, stairW, 1, '#753c10');
    }

    // 7. Front Wooden Cabin Door + Glass Pane + Red Welcome Doormat!
    const doorY = porchY - 34;
    px(ctx, doorX - 2, doorY - 2, 28, 36, ol);
    px(ctx, doorX, doorY, 24, 32, '#8c4b1a');
    px(ctx, doorX + 2, doorY + 2, 20, 28, '#c47432');
    // Door top glass window & brass handle
    px(ctx, doorX + 5, doorY + 5, 14, 10, '#4a250a');
    px(ctx, doorX + 6, doorY + 6, 12, 8, isOnline ? '#ffe680' : '#8ab4cf');
    px(ctx, doorX + 18, doorY + 18, 2, 3, '#ffd54f');
    // Red Welcome Doormat on Porch right in front of door!
    px(ctx, doorX + 1, porchY + 1, 22, 6, '#5c1111');
    px(ctx, doorX + 2, porchY + 2, 20, 4, '#c92a2a');

    // 8. Green-Shuttered Cottage Window (between log alcove & door, exact match to screenshot!)
    const winX = doorX - 36;
    const winY = doorY + 2;
    // Left & Right Green Louvered Shutters (#5c8a47)
    px(ctx, winX - 8, winY, 8, 22, ol);
    px(ctx, winX - 7, winY + 1, 6, 20, '#689c52');
    px(ctx, winX - 6, winY + 4, 4, 2, '#3d632c');
    px(ctx, winX - 6, winY + 10, 4, 2, '#3d632c');
    px(ctx, winX - 6, winY + 16, 4, 2, '#3d632c');

    px(ctx, winX + 20, winY, 8, 22, ol);
    px(ctx, winX + 21, winY + 1, 6, 20, '#689c52');
    px(ctx, winX + 22, winY + 4, 4, 2, '#3d632c');
    px(ctx, winX + 22, winY + 10, 4, 2, '#3d632c');
    px(ctx, winX + 22, winY + 16, 4, 2, '#3d632c');

    // Center 4-pane window frame
    px(ctx, winX, winY, 20, 22, ol);
    px(ctx, winX + 2, winY + 2, 16, 18, '#e2e8f0');
    px(ctx, winX + 4, winY + 4, 12, 14, isOnline ? '#ffd966' : '#527994');
    px(ctx, winX + 9, winY + 2, 2, 18, '#e2e8f0');
    px(ctx, winX + 2, winY + 10, 16, 2, '#e2e8f0');

    // 9. Overflowing Wooden Flower Barrel on Right Side of Porch!
    const barX = x + w - 34;
    const barY = porchY - 12;
    px(ctx, barX, barY + 4, 16, 14, ol);
    px(ctx, barX + 2, barY + 6, 12, 10, '#a85e21');
    px(ctx, barX + 1, barY + 9, 14, 2, '#475569'); // iron barrel hoop
    // Colorful pixel flowers spilling out
    px(ctx, barX - 1, barY - 2, 18, 8, '#267820');
    px(ctx, barX + 1, barY - 4, 5, 5, '#ec4899');
    px(ctx, barX + 8, barY - 5, 5, 5, '#8b5cf6');
    px(ctx, barX + 5, barY - 1, 5, 4, '#38bdf8');
    px(ctx, barX + 11, barY, 4, 4, '#fbbf24');

    // 10. Stardew Valley Pitched Red-Shingle Roof + Right Gable Peak with Round Attic Window!
    // Left main roof slope with vertical standing seams
    px(ctx, x - 4, y - 4, w - 8, 38, ol);
    px(ctx, x - 2, y - 2, w - 12, 34, roofBase);
    px(ctx, x - 2, y - 2, w - 12, 4, roofHi);
    px(ctx, x - 2, y + 26, w - 12, 6, roofDark);
    for (let rx = x + 6; rx < x + w - 18; rx += 14) {
      px(ctx, rx, y, 3, 28, roofDark);
      px(ctx, rx + 3, y, 2, 28, roofHi);
    }

    // Pitched Front Gable Triangle over the Door/Right wing (just like the screenshot!)
    const gabCenterX = doorX + 12;
    const gabW = Math.min(104, Math.floor(w * 0.56));
    for (let step = 0; step < 7; step++) {
      const sw = gabW - step * 14;
      if (sw < 12) break;
      const sx = gabCenterX - Math.floor(sw / 2);
      const sy = y + 22 - step * 4;
      // Roof step shingle overhang
      px(ctx, sx - 3, sy - 3, sw + 6, 8, ol);
      px(ctx, sx - 1, sy - 2, sw + 2, 5, roofDark);
      px(ctx, sx, sy - 3, sw, 3, roofHi);
      // Vertical wood-plank gable wall fill under the roof pitch
      if (step < 5) {
        px(ctx, sx + 2, sy + 2, sw - 4, 8, woodMain);
        for (let gx = sx + 4; gx < sx + sw - 4; gx += 6) {
          px(ctx, gx, sy + 2, 2, 8, woodSeam);
        }
      }
    }

    // Round Attic Louver Window inside the Gable Peak!
    px(ctx, gabCenterX - 6, y + 6, 12, 12, ol);
    px(ctx, gabCenterX - 5, y + 7, 10, 10, '#d4873c');
    px(ctx, gabCenterX - 3, y + 9, 6, 6, '#527994');
    px(ctx, gabCenterX - 1, y + 7, 2, 10, '#d4873c');
    px(ctx, gabCenterX - 5, y + 11, 10, 2, '#d4873c');

    // 11. Roadside Metal Mailbox + Wooden Shipping Bin & Barrel next to the Building!
    const mbX = x + w + 4;
    const mbY = y + h - 22;
    px(ctx, mbX + 4, mbY + 8, 5, 14, ol);
    px(ctx, mbX + 5, mbY + 8, 3, 13, '#9e581c');
    px(ctx, mbX, mbY, 13, 10, ol);
    px(ctx, mbX + 1, mbY + 1, 11, 8, '#64748b');
    px(ctx, mbX + 2, mbY + 2, 9, 3, '#94a3b8');
    px(ctx, mbX + 11, mbY + 3, 2, 4, '#ef4444'); // red mailbox flag!

    // 12. Wooden Name Signboard with Online/Offline LED
    const signW = Math.min(w - 16, 138);
    const signX = x + 6;
    const signY = y + 4;
    px(ctx, signX, signY, signW, 18, ol);
    px(ctx, signX + 2, signY + 2, signW - 4, 14, '#faeccb');
    const blink = Math.floor(tick / 18) % 2 === 0;
    px(ctx, signX + 5, signY + 5, 7, 7, isOnline ? '#2ec45c' : (blink ? '#e63946' : '#7a1c22'));

    ctx.fillStyle = '#331807';
    ctx.font = 'bold 10.5px Kanit, Tahoma, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(b.shortName, signX + 15, signY + 13);
    ctx.restore();
  }

  // ==================== STARDEW VALLEY BEEHOUSE / SERVER NODE WITH FLOATING BUBBLE ====================
  function drawServerRack(ctx, wx, wy, online, tick) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const ol = '#291507';
    px(ctx, wx + 2, wy + 26, 28, 6, 'rgba(38, 22, 8, 0.30)');

    // Wooden Gabled Beehouse / Server Node Cabinet (matches the row of beehouses in screenshot!)
    // Legs
    px(ctx, wx + 4, wy + 22, 4, 6, ol);
    px(ctx, wx + 24, wy + 22, 4, 6, ol);
    // Wooden body
    px(ctx, wx + 3, wy + 2, 26, 22, ol);
    px(ctx, wx + 5, wy + 4, 22, 18, '#d4873c');
    px(ctx, wx + 5, wy + 9, 22, 2, '#8c4b1a');
    px(ctx, wx + 5, wy + 15, 22, 2, '#8c4b1a');
    // Server LED / Slot opening
    px(ctx, wx + 9, wy + 11, 14, 4, '#1e293b');
    const blink = Math.floor(tick / 10) % 2 === 0;
    px(ctx, wx + 11, wy + 12, 3, 2, online ? '#4eff7a' : (blink ? '#ff4444' : '#7a1616'));
    px(ctx, wx + 16, wy + 12, 5, 2, online ? '#38bdf8' : '#475569');

    // Pitched Wooden Beehouse Roof
    px(ctx, wx + 1, wy - 2, 30, 6, ol);
    px(ctx, wx + 3, wy - 5, 26, 5, ol);
    px(ctx, wx + 6, wy - 8, 20, 4, ol);
    px(ctx, wx + 3, wy - 1, 26, 4, '#e69d52');
    px(ctx, wx + 5, wy - 4, 22, 4, '#f2b66d');
    px(ctx, wx + 8, wy - 7, 16, 3, '#fae082');

    // Stardew Floating White Speech Bubble above Node (just like the honey jar bubble in screenshot!)
    const dy = Math.round(Math.sin(tick / 12) * 2);
    const bx = wx + 5;
    const by = wy - 30 + dy;
    px(ctx, bx + 1, by, 20, 18, ol);
    px(ctx, bx, by + 1, 22, 16, ol);
    px(ctx, bx + 1, by + 1, 20, 16, 'rgba(255, 253, 245, 0.94)');
    px(ctx, bx + 9, by + 17, 4, 3, ol);
    px(ctx, bx + 10, by + 17, 2, 2, '#fffdf5');
    // Icon inside bubble (Green Check / Golden Server Jar)
    if (online) {
      px(ctx, bx + 6, by + 4, 10, 10, '#16a34a');
      px(ctx, bx + 8, by + 6, 6, 6, '#86efac');
    } else {
      px(ctx, bx + 7, by + 3, 8, 2, '#8c4b1a');
      px(ctx, bx + 6, by + 5, 10, 9, '#d97706');
      px(ctx, bx + 7, by + 6, 8, 7, '#fde047');
      px(ctx, bx + 8, by + 8, 6, 2, '#ffffff');
    }
    ctx.restore();
  }

  // ==================== STARDEW VALLEY WOODEN SHIPPING CHEST / SUPPLY CRATE ====================
  function drawCrate(ctx, wx, wy, opened, tick) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const ol = '#2b1306';
    px(ctx, wx + 2, wy + 23, 28, 5, 'rgba(38, 22, 8, 0.30)');
    px(ctx, wx + 2, wy + 4, 28, 21, ol);
    px(ctx, wx + 4, wy + 6, 24, 17, opened ? '#8c5828' : '#d4873c');
    // Horizontal plank seams & iron straps (matches shipping bin in top-right of screenshot!)
    px(ctx, wx + 4, wy + 6, 24, 4, opened ? '#6e4219' : '#eba55b');
    px(ctx, wx + 4, wy + 11, 24, 2, '#753c10');
    px(ctx, wx + 4, wy + 17, 24, 2, '#753c10');
    px(ctx, wx + 7, wy + 5, 2, 6, '#334155');
    px(ctx, wx + 23, wy + 5, 2, 6, '#334155');
    px(ctx, wx + 13, wy + 10, 6, 4, '#475569');
    if (!opened) {
      const dy = Math.round(Math.sin(tick / 10) * 2);
      px(ctx, wx + 14, wy - 4 + dy, 4, 4, '#fff59d');
    }
    ctx.restore();
  }

  // ==================== STARDEW VALLEY ROOFED COBBLESTONE WATER WELL ====================
  // Exact match to the roofed stone water well on the right side of the user's screenshot!
  function drawFountain(ctx, wx, wy, tick) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const ol = '#241409';
    // Ground shadow
    px(ctx, wx - 4, wy + 22, 72, 16, 'rgba(38, 22, 8, 0.32)');

    // 1. Circular Cobblestone Well Base
    px(ctx, wx, wy + 4, 64, 28, ol);
    px(ctx, wx + 2, wy + 6, 60, 24, '#78716c');
    // Individual rounded stone bricks on well wall
    for (let sy = wy + 8; sy < wy + 26; sy += 6) {
      const shift = ((sy - wy) % 12 === 0) ? 0 : 5;
      for (let sx = wx + 4 + shift; sx < wx + 54; sx += 10) {
        px(ctx, sx, sy, 8, 4, '#a8a29e');
        px(ctx, sx, sy, 6, 1, '#d6d3d1');
      }
    }
    // Dark Water Pool inside Well Rim
    px(ctx, wx + 4, wy + 2, 56, 12, ol);
    px(ctx, wx + 6, wy + 3, 52, 10, '#a8a29e');
    px(ctx, wx + 10, wy + 5, 44, 7, '#1e4e6e');
    px(ctx, wx + 12, wy + 6, 40, 5, '#2d82b5');

    // 2. Wooden Support Posts & Pitched Terracotta-Tile Well Roof!
    px(ctx, wx + 6, wy - 28, 5, 34, ol);
    px(ctx, wx + 7, wy - 28, 3, 34, '#8c4b1a');
    px(ctx, wx + 53, wy - 28, 5, 34, ol);
    px(ctx, wx + 54, wy - 28, 3, 34, '#8c4b1a');

    // Rope & Water Bucket hanging in center
    const bob = Math.round(Math.sin(tick / 14));
    px(ctx, wx + 31, wy - 26, 2, 28 + bob, '#d4a359');
    px(ctx, wx + 25, wy - 1 + bob, 14, 8, ol);
    px(ctx, wx + 26, wy + bob, 12, 6, '#3b82f6');

    // Pitched Shingle Well Roof (matches the screenshot!)
    px(ctx, wx - 2, wy - 48, 68, 24, ol);
    px(ctx, wx, wy - 46, 64, 20, '#8c3b20');
    for (let ry = wy - 45; ry < wy - 28; ry += 5) {
      px(ctx, wx + 1, ry, 62, 1, '#4a1c0b');
      for (let rx = wx + 2; rx < wx + 60; rx += 8) {
        px(ctx, rx, ry + 1, 6, 3, '#b85632');
        px(ctx, rx, ry + 1, 4, 1, '#d9774c');
      }
    }
    ctx.restore();
  }

  // ==================== STARDEW VALLEY SCARECROW & WOODEN BENCH ====================
  function drawBench(ctx, wx, wy) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const ol = '#291308';
    // Draw a classic Stardew Straw-Hat Scarecrow + Wooden Farm Bench!
    px(ctx, wx + 2, wy + 22, 44, 6, 'rgba(38, 22, 8, 0.28)');
    px(ctx, wx + 2, wy + 8, 44, 16, ol);
    px(ctx, wx + 4, wy + 10, 40, 5, '#cf823a');
    px(ctx, wx + 4, wy + 16, 40, 5, '#a85e21');
    px(ctx, wx + 6, wy + 21, 4, 5, '#42200a');
    px(ctx, wx + 38, wy + 21, 4, 5, '#42200a');

    // Cute Stardew Scarecrow standing right beside the bench/plot (like center of screenshot!)
    const sx = wx - 22;
    const sy = wy - 6;
    px(ctx, sx + 9, sy + 28, 10, 3, 'rgba(38, 22, 8, 0.30)');
    // Wooden stake post
    px(ctx, sx + 12, sy + 16, 4, 14, ol);
    px(ctx, sx + 13, sy + 16, 2, 13, '#b86b2e');
    // Outstretched arms & blue overalls
    px(ctx, sx + 4, sy + 12, 20, 4, ol);
    px(ctx, sx + 5, sy + 13, 18, 2, '#d97736');
    px(ctx, sx + 9, sy + 12, 10, 9, ol);
    px(ctx, sx + 10, sy + 13, 8, 7, '#245294');
    // Burlap head & wide straw hat
    px(ctx, sx + 9, sy + 4, 10, 8, ol);
    px(ctx, sx + 10, sy + 5, 8, 6, '#e6b875');
    px(ctx, sx + 11, sy + 7, 1, 2, ol);
    px(ctx, sx + 16, sy + 7, 1, 2, ol);
    px(ctx, sx + 5, sy + 3, 18, 3, ol);
    px(ctx, sx + 6, sy + 4, 16, 1, '#d99b38');
    px(ctx, sx + 8, sy, 12, 4, ol);
    px(ctx, sx + 9, sy + 1, 10, 2, '#f2c45a');
    ctx.restore();
  }

  // ==================== STARDEW WOODEN LAMP POST & TREE STUMP ====================
  function drawLamp(ctx, wx, wy, nightFactor) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    px(ctx, wx + 10, wy + 25, 12, 5, 'rgba(38, 22, 8, 0.28)');
    px(ctx, wx + 13, wy - 8, 6, 36, '#2b1408');
    px(ctx, wx + 14, wy - 8, 3, 35, '#7c431e');
    px(ctx, wx + 9, wy - 12, 14, 5, '#2b1408');
    px(ctx, wx + 10, wy - 7, 12, 10, '#2b1408');
    px(ctx, wx + 12, wy - 5, 8, 7, nightFactor > 0.15 ? '#ffe57f' : '#fff8dc');
    if (nightFactor > 0.12) {
      const grad = ctx.createRadialGradient(wx + 16, wy - 2, 4, wx + 16, wy - 2, 68);
      grad.addColorStop(0, `rgba(255, 224, 125, ${0.48 * nightFactor})`);
      grad.addColorStop(1, 'rgba(255, 224, 125, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(wx + 16, wy - 2, 68, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ==================== STARDEW VALLEY COZY CABIN BUILDING INTERIORS (16x12 TILES) ====================
  const INTERIOR_THEMES = {
    cottage:       { floor: '#c87d3b', wall: '#d99652', accent: '#b8332a', board: '🏠 บ้านพักนักศึกษาแอดมิน ปวช.', sub: 'เตียงพักผ่อนฟื้นพลังงาน 100% • โต๊ะทบทวนบทเรียน 18 สัปดาห์' },
    town_hall:     { floor: '#c87d3b', wall: '#e0a25e', accent: '#b45309', board: '🌐 สัปดาห์ที่ 1: NOS & Client-Server Network', sub: 'Core Gigabit Switch • Client ⇄ Server vs Peer-to-Peer' },
    vm_lab:        { floor: '#b87234', wall: '#7fa6c9', accent: '#2563eb', board: '🖥️ สัปดาห์ที่ 2–3: Virtualization (VM) & Server OS', sub: 'Hypervisor Type-2 • RAM/Disk Allocation • Ubuntu Server 24.04 ISO' },
    core_hall:     { floor: '#b87234', wall: '#78b08a', accent: '#059669', board: '⌨️ สัปดาห์ที่ 4–5: Static IP, Linux CLI & chmod', sub: 'Netplan 192.168.1.10/24 • chmod 755 (r=4,w=2,x=1) • sudo/usermod' },
    raid_barn:     { floor: '#a66228', wall: '#c78c52', accent: '#92400e', board: '💽 สัปดาห์ที่ 6: Disk Management & RAID Storage', sub: 'RAID 0 (Speed) • RAID 1 (Mirror) • RAID 5 (Parity) • /etc/fstab' },
    remote_tower:  { floor: '#b87234', wall: '#9f86c9', accent: '#7c3aed', board: '🔐 สัปดาห์ที่ 7: Remote Access (SSH & RDP)', sub: 'OpenSSH TCP :22 (Encrypted) • RDP :3389 • Disable Telnet :23' },
    dhcp_house:    { floor: '#b87234', wall: '#78b8c4', accent: '#0891b2', board: '📡 สัปดาห์ที่ 8: DHCP Server (D-O-R-A Process)', sub: 'Discover → Offer → Request → Acknowledge • Pool 192.168.1.100–200' },
    dns_tower:     { floor: '#c87d3b', wall: '#e0a958', accent: '#d97706', board: '📖 สัปดาห์ที่ 9: DNS Server (BIND9 Port 53)', sub: 'valley.local Zone • A Record / CNAME / MX • nslookup & dig' },
    cron_clock:    { floor: '#c87d3b', wall: '#dec068', accent: '#ca8a04', board: '⏱️ สัปดาห์ที่ 10: Systemd Services & Cron Jobs', sub: 'systemctl enable/start • htop • crontab: 0 2 * * * (Auto Backup)' },
    web_market:    { floor: '#c87d3b', wall: '#e08ca8', accent: '#db2777', board: '🌍 สัปดาห์ที่ 11: Web Server & Database (LAMP Stack)', sub: 'Apache2/Nginx (:80/:443) • MariaDB (:3306) • VirtualHost' },
    file_barn:     { floor: '#a66228', wall: '#d68854', accent: '#ea580c', board: '📂 สัปดาห์ที่ 12: File Server (Samba & SFTP)', sub: 'Samba SMB (:445) Linux⇄Windows • SFTP (:22) vs FTP (:21)' },
    mail_proxy:    { floor: '#c87d3b', wall: '#e0827e', accent: '#dc2626', board: '✉️ สัปดาห์ที่ 13: Squid Proxy & Mail Server', sub: 'Squid Proxy (:3128) ACL/Cache • SMTP (:25) • IMAP (:143) • POP3 (:110)' },
    win_hall:      { floor: '#b87234', wall: '#7ec4f2', accent: '#0284c7', board: '🪟 สัปดาห์ที่ 14: Windows Server (AD DS, IIS & PowerShell)', sub: 'Active Directory Domain Controller • GPO • IIS Web • PowerShell' },
    firewall_gate: { floor: '#945824', wall: '#8e9eab', accent: '#475569', board: '🛡️ สัปดาห์ที่ 15: Firewall & Server Hardening (UFW)', sub: 'Default Deny Incoming • Allow 22, 53, 80, 443 • Deny Telnet 23' },
    backup_vault:  { floor: '#a66228', wall: '#7ec28b', accent: '#16a34a', board: '💾 สัปดาห์ที่ 16: กฎสำรองข้อมูล 3-2-1 & Disaster Recovery', sub: '3 Copies • 2 Media Types • 1 Offsite Cloud • tar.gz / rsync / mysqldump' },
    log_obs:       { floor: '#b87234', wall: '#78bfb8', accent: '#0d9488', board: '🔎 สัปดาห์ที่ 17: Server Monitoring & Log Analysis', sub: '/var/log/auth.log • journalctl -u • ss -tulnp • Root Cause Analysis' },
    grand_hall:    { floor: '#b87234', wall: '#b388eb', accent: '#9333ea', board: '🏆 สัปดาห์ที่ 18: สภาแอดมินหลวง (Final Enterprise Audit)', sub: 'บูรณาการครบ 18 สัปดาห์ • ตรวจสอบความพร้อมทั้งหมู่บ้าน Server Valley' }
  };

  function drawBuildingInterior(ctx, b, isOnline, tick) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const theme = INTERIOR_THEMES[b.id] || INTERIOR_THEMES.town_hall;
    const rx = 32;
    const ry = 24;
    const rw = 448;
    const rh = 312;
    const wallH = 76;
    const floorY = ry + wallH;
    const floorH = rh - wallH;
    const ol = '#211005';

    // 1. Stardew Cabin Interior Cutaway Border
    px(ctx, rx - 8, ry - 8, rw + 16, rh + 16, ol);
    px(ctx, rx - 4, ry - 4, rw + 8, rh + 8, '#6e380d');

    // 2. Back Wooden Cabin Wall with Wainscoting
    px(ctx, rx, ry, rw, wallH, theme.wall);
    for (let wx = rx; wx < rx + rw; wx += 16) {
      px(ctx, wx, ry, 2, wallH, 'rgba(45, 18, 4, 0.16)');
    }
    px(ctx, rx, floorY - 22, rw, 18, '#8c4b1a');
    px(ctx, rx, floorY - 4, rw, 5, ol);

    // 3. Stardew Warm Wood-Plank Floorboards
    px(ctx, rx, floorY, rw, floorH, theme.floor);
    for (let fy = floorY; fy < floorY + floorH; fy += 16) {
      px(ctx, rx, fy, rw, 2, '#854a1a');
      for (let fx = rx + ((fy % 32 === 0) ? 24 : 48); fx < rx + rw; fx += 64) {
        px(ctx, fx, fy, 2, 16, '#854a1a');
      }
    }

    // Center Woven Farmhouse Rug
    px(ctx, 164, floorY + 60, 184, 100, ol);
    px(ctx, 168, floorY + 64, 176, 92, '#fde047');
    px(ctx, 172, floorY + 68, 168, 84, theme.accent);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = 'bold 11px Kanit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.shortName, 256, floorY + 114);

    // 4. Back-Wall Knowledge Blackboard / Server Schematic Board
    const bx = 148;
    const by = ry + 10;
    const bw = 216;
    const bh = 54;
    px(ctx, bx - 2, by - 2, bw + 4, bh + 4, ol);
    px(ctx, bx, by, bw, bh, '#5c3114');
    px(ctx, bx + 4, by + 4, bw - 8, bh - 8, '#163826');
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 10.5px Kanit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(theme.board, bx + bw / 2, by + 18);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '9.5px Kanit, sans-serif';
    ctx.fillText(theme.sub, bx + bw / 2, by + 33);
    ctx.fillStyle = isOnline ? '#86efac' : '#fde047';
    ctx.font = 'bold 9px Kanit, sans-serif';
    ctx.fillText('📖 กด [E] ที่กระดานนี้เพื่อเปิดอ่านคู่มือบทเรียน', bx + bw / 2, by + 47);

    // 5. Shuttered Cottage Windows on Back Wall
    [rx + 28, rx + rw - 82].forEach((wx) => {
      px(ctx, wx - 2, ry + 14, 54, 42, ol);
      px(ctx, wx, ry + 16, 50, 38, '#8c4b1a');
      px(ctx, wx + 4, ry + 20, 42, 30, '#84d2f6');
      px(ctx, wx + 24, ry + 16, 3, 38, '#8c4b1a');
      px(ctx, wx, ry + 34, 50, 3, '#8c4b1a');
    });

    // 6. Interior Furniture (Stardew Wooden Desks, Bookshelves, Bed in Cottage)
    if (b.id === 'cottage') {
      const bedX = 310;
      const bedY = floorY + 14;
      px(ctx, bedX, bedY, 64, 52, ol);
      px(ctx, bedX + 2, bedY + 2, 60, 48, '#8c4b1a');
      px(ctx, bedX + 6, bedY + 8, 52, 12, '#ffffff');
      px(ctx, bedX + 6, bedY + 20, 52, 26, '#c92a2a');
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Kanit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛏️ เตียงนอน [E]', bedX + 32, bedY + 36);
    } else {
      // Left Wooden Workbench & Right Server Bookshelf/Rack
      px(ctx, 52, floorY + 14, 68, 28, ol);
      px(ctx, 54, floorY + 16, 64, 24, '#b86b2e');
      px(ctx, 62, floorY + 6, 22, 16, '#1e293b');
      px(ctx, 64, floorY + 8, 18, 12, '#38bdf8');

      px(ctx, 384, floorY + 10, 56, 36, ol);
      px(ctx, 386, floorY + 12, 52, 32, '#334155');
      for (let r = 0; r < 3; r++) {
        px(ctx, 390, floorY + 16 + r * 9, 44, 6, '#0f172a');
        px(ctx, 393, floorY + 18 + r * 9, 4, 2, isOnline ? '#4eff7a' : '#38bdf8');
      }
    }

    // 7. Bottom Exit Red Doormat (tx=8, ty=10)
    const exitX = 220;
    const exitY = floorY + floorH - 26;
    px(ctx, exitX - 2, exitY - 2, 76, 24, ol);
    px(ctx, exitX, exitY, 72, 20, '#b8332a');
    px(ctx, exitX + 3, exitY + 3, 66, 14, '#e0483e');
    ctx.fillStyle = '#fff9db';
    ctx.font = 'bold 10.5px Kanit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚪 ทางออก [E]', exitX + 36, exitY + 14);
    ctx.restore();
  }

  // ==================== STARDEW VALLEY TOWN SHOPS & SCENERY BUILDINGS ====================
  // Renders: (1) Grand 2-Story IT General Store (Pierre's General Store style!),
  // (2) Admin Coffee & Bakery, (3) Smart Glass Greenhouse, (4) Red Barn & Silo,
  // (5) Hardware Forge & Blacksmith, (6) Tech Bookstore & Villager Cottages!
  function drawSceneryBuilding(ctx, sb, tick) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const x = sb.tx * 32;
    const y = sb.ty * 32;
    const w = sb.tw * 32;
    const h = sb.th * 32;
    const ol = '#291306';

    // Ground shadow
    px(ctx, x + 4, y + h - 2, w - 4, 12, 'rgba(38, 22, 8, 0.32)');

    // ===== 1. GRAND 2-STORY SERVER VALLEY IT GENERAL STORE (7x4 tiles = 224x128 px) =====
    if (sb.kind === 'it_store') {
      // Upper 2nd Story Facade & Shingle Roof
      px(ctx, x - 4, y - 14, w + 8, 38, ol);
      px(ctx, x - 2, y - 12, w + 4, 34, '#b91c1c');
      px(ctx, x - 2, y - 12, w + 4, 5, '#ef4444');
      px(ctx, x - 2, y + 16, w + 4, 6, '#7f1d1d');
      for (let rx = x + 6; rx < x + w - 8; rx += 14) {
        px(ctx, rx, y - 10, 3, 28, '#7f1d1d');
        px(ctx, rx + 3, y - 10, 2, 28, '#f87171');
      }

      // Grand Rooftop Store Billboard Sign ("🏪 SERVER VALLEY IT GENERAL STORE")
      const billW = 176;
      const billX = x + Math.floor((w - billW) / 2);
      const billY = y - 24;
      px(ctx, billX - 2, billY - 2, billW + 4, 28, ol);
      px(ctx, billX, billY, billW, 24, '#78350f');
      px(ctx, billX + 3, billY + 3, billW - 6, 18, '#fef3c7');
      // Animated marquee bulbs on sign corners
      const bulbOn = Math.floor(tick / 12) % 2 === 0;
      px(ctx, billX + 6, billY + 6, 4, 4, bulbOn ? '#f59e0b' : '#fde047');
      px(ctx, billX + billW - 10, billY + 6, 4, 4, bulbOn ? '#fde047' : '#f59e0b');
      ctx.fillStyle = '#7f1d1d';
      ctx.font = 'bold 11.5px Kanit, Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏪 ห้างอุปกรณ์ไอที IT GENERAL STORE', billX + billW / 2, billY + 16);

      // Main Timber-Framed Storefront Wall
      px(ctx, x + 2, y + 20, w - 4, h - 22, ol);
      px(ctx, x + 4, y + 22, w - 8, h - 26, '#f6deb0');
      // Vertical wood pillars
      px(ctx, x + 4, y + 22, 8, h - 26, '#8c4b1a');
      px(ctx, x + w - 12, y + 22, 8, h - 26, '#8c4b1a');
      px(ctx, x + Math.floor(w / 2) - 24, y + 22, 6, h - 26, '#8c4b1a');
      px(ctx, x + Math.floor(w / 2) + 18, y + 22, 6, h - 26, '#8c4b1a');

      // Full-Width Red & White Striped Storefront Canopy Awning!
      const awnY = y + 24;
      px(ctx, x - 4, awnY, w + 8, 22, ol);
      for (let ax = x - 2; ax < x + w - 2; ax += 12) {
        const isRed = ((ax - x) / 12) % 2 === 0;
        px(ctx, ax, awnY + 2, 12, 14, isRed ? '#dc2626' : '#fffbeb');
        px(ctx, ax, awnY + 14, 12, 4, isRed ? '#991b1b' : '#fde68a');
      }
      // Awning drop shadow on wall
      px(ctx, x + 4, awnY + 22, w - 8, 6, 'rgba(38, 16, 4, 0.28)');

      // Left & Right Large Illuminated Storefront Showcase Windows
      const drawShowcaseWindow = (wx, wy, isLeft) => {
        px(ctx, wx, wy, 56, 36, ol);
        px(ctx, wx + 2, wy + 2, 52, 32, '#7c431e');
        px(ctx, wx + 4, wy + 4, 48, 28, '#fef08a');
        px(ctx, wx + 6, wy + 6, 44, 22, '#fffbeb');
        // Shelves inside window with pixel IT gear (monitors, RAM, coffee, USBs)
        px(ctx, wx + 6, wy + 18, 44, 2, '#b45309');
        if (isLeft) {
          // Mini pixel monitor + keyboard + LAN spool in left window
          px(ctx, wx + 10, wy + 8, 14, 10, '#1e293b');
          px(ctx, wx + 12, wy + 10, 10, 6, '#38bdf8');
          px(ctx, wx + 30, wy + 10, 10, 8, '#16a34a');
          px(ctx, wx + 12, wy + 21, 12, 6, '#d97706');
          px(ctx, wx + 32, wy + 21, 10, 6, '#2563eb');
        } else {
          // Server rack unit + Admin Coffee + Golden Shields in right window
          px(ctx, wx + 10, wy + 8, 12, 10, '#dc2626');
          px(ctx, wx + 12, wy + 10, 8, 6, '#fde047');
          px(ctx, wx + 28, wy + 9, 14, 9, '#334155');
          px(ctx, wx + 30, wy + 11, 4, 2, '#4ade80');
          px(ctx, wx + 12, wy + 21, 14, 6, '#7c3aed');
          px(ctx, wx + 32, wy + 21, 10, 6, '#ea580c');
        }
      };
      drawShowcaseWindow(x + 16, y + 52, true);
      drawShowcaseWindow(x + w - 72, y + 52, false);

      // Center Double Glass Storefront Doors + "OPEN" Sign!
      const doorX = x + Math.floor(w / 2) - 20;
      const doorY = y + 50;
      px(ctx, doorX, doorY, 40, 56, ol);
      px(ctx, doorX + 2, doorY + 2, 36, 52, '#9a5220');
      px(ctx, doorX + 5, doorY + 6, 13, 28, '#bae6fd');
      px(ctx, doorX + 22, doorY + 6, 13, 28, '#bae6fd');
      // "OPEN" plaque in door window
      px(ctx, doorX + 12, doorY + 15, 16, 8, '#16a34a');
      px(ctx, doorX + 14, doorY + 17, 12, 4, '#dcfce7');

      // Raised Wooden Storefront Sidewalk Porch & Outdoor Merchandise Stalls!
      const porchY = y + h - 22;
      px(ctx, x - 2, porchY, w + 4, 22, ol);
      px(ctx, x, porchY + 2, w, 12, '#d4873c');
      px(ctx, x, porchY + 14, w, 6, '#9e581c');
      // Red Carpet Welcome Mat in front of Double Doors
      px(ctx, doorX - 2, porchY + 2, 44, 12, '#7f1d1d');
      px(ctx, doorX, porchY + 4, 40, 8, '#dc2626');
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 9px Kanit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛒 ซื้อของ [E]', doorX + 20, porchY + 11);

      // Left Outdoor Display Table (Hardware & Coffee Crates)
      px(ctx, x + 10, porchY - 8, 48, 16, ol);
      px(ctx, x + 12, porchY - 6, 44, 12, '#b86b2e');
      px(ctx, x + 15, porchY - 12, 12, 9, '#2563eb');
      px(ctx, x + 30, porchY - 12, 12, 9, '#f59e0b');
      px(ctx, x + 44, porchY - 11, 10, 8, '#16a34a');

      // Right Outdoor Barrel & "SALE 🪙" A-Frame Signboard
      px(ctx, x + w - 54, porchY - 12, 18, 20, ol);
      px(ctx, x + w - 52, porchY - 10, 14, 16, '#fbbf24');
      px(ctx, x + w - 50, porchY - 8, 10, 10, '#1e293b');
      px(ctx, x + w - 48, porchY - 5, 6, 4, '#4ade80');
      px(ctx, x + w - 30, porchY - 10, 16, 18, ol);
      px(ctx, x + w - 28, porchY - 8, 12, 14, '#a85e21');
      ctx.restore();
      return;
    }

    // ===== 2. SMART GLASS GREENHOUSE (Stardew Valley Translucent Glass Greenhouse!) =====
    if (sb.kind === 'greenhouse') {
      // Stone Brick Lower Foundation
      px(ctx, x + 2, y + 26, w - 4, h - 28, ol);
      px(ctx, x + 4, y + 28, w - 8, h - 32, '#78716c');
      // Translucent Blue-Cyan Glass Walls & Lush Plants Visible Inside!
      px(ctx, x + 6, y + 30, w - 12, h - 46, '#bae6fd');
      // Lush green plants & red fruits inside glass
      for (let gx = x + 12; gx < x + w - 20; gx += 22) {
        px(ctx, gx, y + 44, 16, 26, '#15803d');
        px(ctx, gx + 2, y + 40, 12, 22, '#22c55e');
        px(ctx, gx + 4, y + 48, 4, 4, '#ef4444');
        px(ctx, gx + 10, y + 54, 4, 4, '#f59e0b');
      }
      // Pitched Glass Roof with Iron Mullion Grid & Diagonal White Sheen
      for (let step = 0; step < 6; step++) {
        const inset = step * 10;
        const ry = y + 24 - step * 4;
        px(ctx, x + inset, ry, w - inset * 2, 8, ol);
        px(ctx, x + inset + 2, ry + 1, w - inset * 2 - 4, 6, step % 2 === 0 ? '#7dd3fc' : '#e0f2fe');
      }
      // Vertical iron glass-frame bars
      for (let fx = x + 16; fx < x + w - 12; fx += 20) {
        px(ctx, fx, y + 8, 3, h - 22, '#334155');
      }
      // Wooden Greenhouse Door
      const doorX = x + Math.floor(w / 2) - 14;
      px(ctx, doorX, y + h - 36, 28, 34, ol);
      px(ctx, doorX + 2, y + h - 34, 24, 30, '#b86b2e');
      px(ctx, doorX + 5, y + h - 30, 18, 16, '#e0f2fe');
      // Signboard
      px(ctx, x + 36, y + 10, w - 72, 16, ol);
      px(ctx, x + 38, y + 12, w - 76, 12, '#faeccb');
      ctx.fillStyle = '#14532d';
      ctx.font = 'bold 10px Kanit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sb.shortName, x + w / 2, y + 22);
      ctx.restore();
      return;
    }

    // ===== 3. STARDEW RED BARN & TALL CYLINDRICAL FARM SILO =====
    if (sb.kind === 'barn') {
      // Tall Cylindrical Farm Silo on the Right Side!
      const siloX = x + w - 34;
      const siloY = y - 26;
      px(ctx, siloX, siloY + 12, 32, h + 12, ol);
      px(ctx, siloX + 2, siloY + 14, 28, h + 8, '#b45309');
      px(ctx, siloX + 4, siloY + 14, 10, h + 8, '#d97706');
      for (let sy = siloY + 24; sy < y + h - 8; sy += 16) {
        px(ctx, siloX + 1, sy, 30, 3, '#475569'); // steel silo hoops
      }
      // Domed Silver Silo Roof
      px(ctx, siloX - 2, siloY + 4, 36, 12, ol);
      px(ctx, siloX + 2, siloY - 2, 28, 8, ol);
      px(ctx, siloX, siloY + 6, 32, 8, '#94a3b8');
      px(ctx, siloX + 4, siloY, 24, 6, '#cbd5e1');

      // Crimson Red Barn Body
      const bw = w - 28;
      px(ctx, x + 2, y + 24, bw, h - 26, ol);
      px(ctx, x + 4, y + 26, bw - 4, h - 30, '#dc2626');
      for (let bx = x + 10; bx < x + bw - 4; bx += 8) {
        px(ctx, bx, y + 26, 2, h - 30, '#991b1b');
      }
      // Gambrel Barn Roof with White Trim
      for (let step = 0; step < 6; step++) {
        const inset = step * 10;
        const ry = y + 22 - step * 4;
        px(ctx, x + inset - 2, ry, bw - inset * 2 + 4, 8, ol);
        px(ctx, x + inset, ry + 1, bw - inset * 2, 6, '#7f1d1d');
        px(ctx, x + inset + 2, ry + 1, bw - inset * 2 - 4, 2, '#f8fafc');
      }
      // Double White X-Braced Barn Doors
      const doorX = x + Math.floor(bw / 2) - 22;
      const doorY = y + h - 42;
      px(ctx, doorX, doorY, 44, 40, ol);
      px(ctx, doorX + 2, doorY + 2, 40, 36, '#f8fafc');
      px(ctx, doorX + 6, doorY + 6, 15, 28, '#dc2626');
      px(ctx, doorX + 23, doorY + 6, 15, 28, '#dc2626');
      // Golden Hay Bales stacked beside door
      px(ctx, x + 8, y + h - 18, 18, 14, ol);
      px(ctx, x + 10, y + h - 16, 14, 10, '#eab308');
      px(ctx, x + 10, y + h - 16, 14, 3, '#fef08a');
      ctx.restore();
      return;
    }

    // ===== 4. CAFE & BAKERY / BOOKSTORE / HARDWARE FORGE / VILLAGER COTTAGES =====
    // First draw base Stardew cabin body using drawBuilding
    drawBuilding(ctx, { ...sb, units: [] }, true, tick);

    // Add custom storefront awning & outdoor props!
    const porchY = y + h - 22;
    if (sb.kind === 'cafe') {
      // Green & Cream Striped Café Awning + Outdoor Umbrella Table!
      for (let ax = x + 4; ax < x + w - 16; ax += 12) {
        const isGrn = ((ax - x) / 12) % 2 === 0;
        px(ctx, ax, y + 30, 12, 12, isGrn ? '#15803d' : '#fef9c3');
      }
      // Outdoor Café Umbrella & Table on Left
      px(ctx, x + 10, porchY - 18, 28, 10, ol);
      px(ctx, x + 12, porchY - 16, 24, 6, '#ef4444');
      px(ctx, x + 22, porchY - 8, 4, 14, '#78350f');
      px(ctx, x + 14, porchY + 2, 20, 6, '#faeccb');
    } else if (sb.kind === 'bookstore') {
      // Blue & White Striped Bookstore Awning + Outdoor Book Cart!
      for (let ax = x + 4; ax < x + w - 16; ax += 12) {
        const isBlu = ((ax - x) / 12) % 2 === 0;
        px(ctx, ax, y + 30, 12, 12, isBlu ? '#1d4ed8' : '#eff6ff');
      }
      // Outdoor Book Display Stand
      px(ctx, x + 12, porchY - 8, 32, 16, ol);
      px(ctx, x + 14, porchY - 6, 28, 12, '#b86b2e');
      px(ctx, x + 16, porchY - 10, 6, 6, '#ef4444');
      px(ctx, x + 24, porchY - 10, 6, 6, '#3b82f6');
      px(ctx, x + 32, porchY - 10, 6, 6, '#22c55e');
    } else if (sb.kind === 'forge') {
      // Glowing Brick Forge Furnace & Iron Anvil outside!
      px(ctx, x + 10, porchY - 22, 30, 26, ol);
      px(ctx, x + 12, porchY - 20, 26, 22, '#57534e');
      const glow = Math.floor(tick / 8) % 2 === 0 ? '#f97316' : '#fbbf24';
      px(ctx, x + 17, porchY - 10, 16, 10, glow);
      // Iron Anvil
      px(ctx, x + 46, porchY - 6, 18, 10, '#1e293b');
      px(ctx, x + 44, porchY - 10, 22, 5, '#475569');
    }
    ctx.restore();
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
    drawBench,
    drawLamp
  };
})();
