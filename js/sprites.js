// 16-Bit SNES / Stardew Valley Style Procedural Pixel-Art Engine
// Hue-shifted shading, crisp pixel outlines, auto-tiled borders, animated props & ambient life
window.Sprites = (function () {
  const itemCache = {};
  const portraitCache = {};
  const tileCache = {};
  const treeCache = {};

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

  // Draw a 16-bit pixel string art sprite (each char maps to palette color)
  function drawPixelMap(ctx, map, palette, ox = 0, oy = 0, s = 1) {
    for (let r = 0; r < map.length; r++) {
      const row = map[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch === '.' || ch === ' ') continue;
        const col = palette[ch];
        if (col) {
          ctx.fillStyle = col;
          ctx.fillRect(ox + c * s, oy + r * s, s, s);
        }
      }
    }
  }

  // ==================== 16-BIT CHARACTERS (with outlines, shading & eye blink) ====================
  function drawCharacter(ctx, x, y, style, dir = 'down', frame = 0, scale = 2, tick = 0) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    ctx.scale(scale, scale);

    const outline = '#2a1810';
    const skin = style.skin || '#f6cfa6';
    const skinShadow = '#d69f74';
    const shirt = style.shirt || '#2f7f5f';
    const accent = style.accent || '#eef7ee';
    const pants = style.pants || '#2e4a6b';
    const hair = style.hair || '#4a2b18';

    const bob = frame % 2 === 1 ? -1 : 0;
    const idleBreath = frame === 0 && Math.floor(tick / 40) % 2 === 1 ? 0.5 : 0;
    const legL = frame === 1 ? -1 : frame === 3 ? 1 : 0;
    const legR = -legL;
    const armSwing = frame === 1 ? 1 : frame === 3 ? -1 : 0;
    const blink = (tick % 210) > 202;

    // Soft oval pixel shadow
    ctx.fillStyle = 'rgba(18, 28, 16, 0.36)';
    ctx.fillRect(3, 20, 10, 2);
    ctx.fillRect(4, 19, 8, 4);

    // Legs & Boots (outlined)
    px(ctx, 3, 16 + legL, 5, 5, outline);
    px(ctx, 8, 16 + legR, 5, 5, outline);
    px(ctx, 4, 16 + legL, 3, 3, pants);
    px(ctx, 9, 16 + legR, 3, 3, pants);
    // Boot leather + highlight
    px(ctx, 4, 18 + legL, 3, 2, '#5c3317');
    px(ctx, 9, 18 + legR, 3, 2, '#5c3317');
    px(ctx, 4, 18 + legL, 2, 1, '#824b26');
    px(ctx, 9, 18 + legR, 2, 1, '#824b26');

    const by = bob + Math.floor(idleBreath);

    // Torso outline + 16-bit shaded tunic/jacket
    px(ctx, 2, 9 + by, 12, 8, outline);
    px(ctx, 3, 10 + by, 10, 6, shirt);
    // Shading & lapel highlight
    px(ctx, 3, 14 + by, 10, 2, 'rgba(0,0,0,0.22)');
    px(ctx, 5, 10 + by, 6, 5, accent);
    px(ctx, 6, 11 + by, 4, 3, 'rgba(255,255,255,0.25)');
    // Belt & golden buckle
    px(ctx, 3, 15 + by, 10, 1, '#3b2110');
    px(ctx, 7, 15 + by, 2, 1, '#f4c430');

    // Arms (outlined + shaded hands)
    px(ctx, 1, 10 + by + armSwing, 2, 6, outline);
    px(ctx, 13, 10 + by - armSwing, 2, 6, outline);
    px(ctx, 1, 11 + by + armSwing, 2, 3, shirt);
    px(ctx, 13, 11 + by - armSwing, 2, 3, shirt);
    px(ctx, 1, 14 + by + armSwing, 2, 2, skin);
    px(ctx, 13, 14 + by - armSwing, 2, 2, skin);

    // Head outline + shaded face
    px(ctx, 2, 1 + by, 12, 9, outline);
    px(ctx, 3, 2 + by, 10, 7, skin);
    px(ctx, 3, 8 + by, 10, 1, skinShadow); // Chin shadow

    // Hair base + 16-bit highlight sheen
    px(ctx, 2, 0 + by, 12, 4, outline);
    px(ctx, 3, 1 + by, 10, 3, hair);
    px(ctx, 4, 1 + by, 6, 1, 'rgba(255,255,255,0.25)');

    if (dir === 'up') {
      px(ctx, 3, 2 + by, 10, 7, hair);
      px(ctx, 4, 3 + by, 8, 2, 'rgba(255,255,255,0.16)');
      if (style.hat) {
        px(ctx, 2, 0 + by, 12, 3, outline);
        px(ctx, 3, 0 + by, 10, 2, style.hat);
        px(ctx, 3, 2 + by, 10, 1, style.hatTrim || '#ffd166');
      }
      if (style.backpack) {
        px(ctx, 3, 10 + by, 10, 6, outline);
        px(ctx, 4, 11 + by, 8, 4, '#9c5221');
        px(ctx, 5, 11 + by, 6, 2, '#d89b52');
        px(ctx, 7, 13 + by, 2, 1, '#ffd54f');
      }
    } else {
      // Side hair locks
      px(ctx, 3, 3 + by, 1, 4, hair);
      px(ctx, 12, 3 + by, 1, 4, hair);

      if (dir === 'down') {
        if (!blink) {
          px(ctx, 5, 5 + by, 2, 2, '#1d130e');
          px(ctx, 9, 5 + by, 2, 2, '#1d130e');
          px(ctx, 5, 5 + by, 1, 1, '#ffffff');
          px(ctx, 9, 5 + by, 1, 1, '#ffffff');
        } else {
          px(ctx, 5, 6 + by, 2, 1, '#3b2417');
          px(ctx, 9, 6 + by, 2, 1, '#3b2417');
        }
        // Subtle rosy cheeks
        px(ctx, 4, 7 + by, 1, 1, 'rgba(230,110,110,0.45)');
        px(ctx, 11, 7 + by, 1, 1, 'rgba(230,110,110,0.45)');

        if (style.glasses) {
          px(ctx, 4, 5 + by, 4, 3, 'rgba(92,225,230,0.35)');
          px(ctx, 8, 5 + by, 4, 3, 'rgba(92,225,230,0.35)');
          px(ctx, 7, 6 + by, 2, 1, '#2a2a2a');
          px(ctx, 4, 5 + by, 1, 1, '#ffffff');
          px(ctx, 9, 5 + by, 1, 1, '#ffffff');
        }
        if (style.beard) {
          px(ctx, 4, 7 + by, 8, 3, style.beard);
          px(ctx, 5, 9 + by, 6, 1, 'rgba(0,0,0,0.2)');
        } else {
          px(ctx, 7, 8 + by, 2, 1, '#c9785d');
        }
      } else if (dir === 'left') {
        if (!blink) {
          px(ctx, 4, 5 + by, 2, 2, '#1d130e');
          px(ctx, 4, 5 + by, 1, 1, '#ffffff');
        } else {
          px(ctx, 4, 6 + by, 2, 1, '#3b2417');
        }
        if (style.glasses) px(ctx, 3, 5 + by, 4, 3, 'rgba(92,225,230,0.4)');
        if (style.beard) px(ctx, 3, 7 + by, 5, 3, style.beard);
      } else if (dir === 'right') {
        if (!blink) {
          px(ctx, 10, 5 + by, 2, 2, '#1d130e');
          px(ctx, 11, 5 + by, 1, 1, '#ffffff');
        } else {
          px(ctx, 10, 6 + by, 2, 1, '#3b2417');
        }
        if (style.glasses) px(ctx, 9, 5 + by, 4, 3, 'rgba(92,225,230,0.4)');
        if (style.beard) px(ctx, 8, 7 + by, 5, 3, style.beard);
      }

      if (style.hat) {
        px(ctx, 1, 0 + by, 14, 3, outline);
        px(ctx, 2, 0 + by, 12, 2, style.hat);
        px(ctx, 3, 0 + by, 8, 1, 'rgba(255,255,255,0.25)');
        px(ctx, 1, 2 + by, 14, 1, style.hatTrim || '#ffd166');
      }
    }

    ctx.restore();
  }

  // Generate 16-bit Framed Pixel Portrait for Dialogs / HUD
  function getPortrait(key, style) {
    if (portraitCache[key]) return portraitCache[key];
    const c = makeCanvas(48, 48);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // 16-bit layered sky gradient + distant mountains + sunlit meadow
    px(ctx, 0, 0, 48, 12, '#7ec4e8');
    px(ctx, 0, 12, 48, 12, '#a8dcf5');
    px(ctx, 0, 24, 48, 10, '#d7f1fa');
    // Distant hills
    px(ctx, 0, 28, 22, 8, '#5ea16e');
    px(ctx, 26, 26, 22, 10, '#4f9162');
    // Meadow
    px(ctx, 0, 34, 48, 14, '#7dc464');
    px(ctx, 0, 34, 48, 2, '#9ce079');
    // Fluffy pixel clouds
    px(ctx, 4, 5, 11, 4, '#ffffff');
    px(ctx, 6, 3, 7, 2, '#ffffff');
    px(ctx, 33, 8, 10, 3, '#ffffff');
    px(ctx, 35, 6, 6, 2, '#ffffff');

    drawCharacter(ctx, 4, 8, style, 'down', 0, 2.5, 0);
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
        px(ctx, 5, 2, 4, 4, ol);
        px(ctx, 6, 3, 2, 2, '#ffd54f');
        px(ctx, 8, 11, 4, 4, ol);
        px(ctx, 9, 12, 2, 2, '#ffd54f');
        break;
      case 'iso_usb':
        px(ctx, 4, 1, 8, 5, ol);
        px(ctx, 5, 2, 6, 4, '#cfd8dc');
        px(ctx, 6, 3, 1, 2, '#546e7a');
        px(ctx, 9, 3, 1, 2, '#546e7a');
        px(ctx, 3, 5, 10, 10, ol);
        px(ctx, 4, 6, 8, 8, '#d84315');
        px(ctx, 5, 6, 6, 7, '#ff9800');
        px(ctx, 6, 8, 4, 4, '#fff8e1');
        px(ctx, 7, 9, 2, 2, '#e65100');
        break;
      case 'cli_wrench':
        px(ctx, 1, 2, 14, 12, ol);
        px(ctx, 2, 3, 12, 10, '#37474f');
        px(ctx, 3, 4, 10, 8, '#0b1820');
        px(ctx, 4, 6, 2, 1, '#69f0ae');
        px(ctx, 6, 7, 2, 1, '#69f0ae');
        px(ctx, 4, 8, 2, 1, '#69f0ae');
        px(ctx, 8, 9, 4, 1, '#5ce1e6');
        px(ctx, 2, 13, 12, 1, '#90a4ae');
        break;
      case 'ssh_key':
        px(ctx, 2, 4, 7, 7, ol);
        px(ctx, 3, 5, 5, 5, '#f0b429');
        px(ctx, 4, 6, 3, 3, '#fff6cc');
        px(ctx, 5, 7, 1, 1, '#8c5500');
        px(ctx, 8, 6, 7, 4, ol);
        px(ctx, 8, 7, 6, 2, '#ffd54f');
        px(ctx, 11, 9, 1, 3, '#d49000');
        px(ctx, 13, 9, 1, 2, '#d49000');
        break;
      case 'port_scanner':
      case 'log_lens':
        px(ctx, 2, 1, 9, 9, ol);
        px(ctx, 3, 2, 7, 7, '#0288d1');
        px(ctx, 4, 3, 5, 5, '#80e5ff');
        px(ctx, 5, 4, 2, 2, '#ffffff');
        px(ctx, 9, 8, 2, 2, ol);
        px(ctx, 10, 9, 4, 4, '#6d4c41');
        px(ctx, 11, 10, 3, 3, '#4e342e');
        break;
      case 'config_scroll':
        px(ctx, 2, 1, 12, 14, ol);
        px(ctx, 3, 2, 10, 12, '#f7dfb1');
        px(ctx, 2, 2, 12, 2, '#a66329');
        px(ctx, 2, 12, 12, 2, '#a66329');
        px(ctx, 5, 5, 6, 1, '#5a3214');
        px(ctx, 5, 7, 5, 1, '#1d6fa5');
        px(ctx, 5, 9, 6, 1, '#2e8b57');
        break;
      case 'ufw_shield':
        px(ctx, 2, 1, 12, 10, ol);
        px(ctx, 4, 11, 8, 3, ol);
        px(ctx, 3, 2, 10, 8, '#d84315');
        px(ctx, 5, 10, 6, 3, '#bf360c');
        px(ctx, 5, 4, 6, 5, '#ffca28');
        px(ctx, 6, 5, 4, 3, '#fff59d');
        px(ctx, 7, 6, 2, 3, '#ff5722');
        break;
      case 'admin_coffee':
        px(ctx, 5, 1, 1, 2, '#ffffff');
        px(ctx, 9, 1, 1, 2, '#ffffff');
        px(ctx, 3, 4, 9, 10, ol);
        px(ctx, 4, 5, 7, 8, '#f5f5f5');
        px(ctx, 5, 6, 5, 6, '#6d4c41');
        px(ctx, 5, 6, 5, 2, '#3e2723');
        px(ctx, 11, 6, 3, 5, ol);
        px(ctx, 11, 7, 2, 3, '#e0e0e0');
        px(ctx, 11, 8, 1, 1, '#6d4c41');
        break;
      case 'packet_kit':
        px(ctx, 2, 4, 12, 9, ol);
        px(ctx, 3, 5, 10, 7, '#d98a36');
        px(ctx, 4, 6, 8, 4, '#f5b867');
        px(ctx, 5, 6, 2, 2, '#fff0c4');
        px(ctx, 9, 6, 2, 2, '#fff0c4');
        break;
      case 'win_license':
        px(ctx, 1, 1, 14, 14, ol);
        px(ctx, 2, 2, 12, 12, '#1e3a8a');
        px(ctx, 3, 3, 4, 4, '#38bdf8');
        px(ctx, 9, 3, 4, 4, '#60a5fa');
        px(ctx, 3, 9, 4, 4, '#60a5fa');
        px(ctx, 9, 9, 4, 4, '#93c5fd');
        break;
      case 'raid_toolkit':
        px(ctx, 1, 2, 14, 12, ol);
        px(ctx, 2, 3, 12, 5, '#455a64');
        px(ctx, 3, 4, 10, 3, '#78909c');
        px(ctx, 11, 5, 2, 1, '#69f0ae');
        px(ctx, 2, 9, 12, 4, '#37474f');
        px(ctx, 3, 10, 10, 2, '#607d8b');
        px(ctx, 11, 10, 2, 1, '#40c4ff');
        break;
      case 'mail_key':
        px(ctx, 1, 3, 14, 11, ol);
        px(ctx, 2, 4, 12, 9, '#f8fafc');
        px(ctx, 3, 5, 2, 2, '#e53935');
        px(ctx, 5, 7, 2, 2, '#e53935');
        px(ctx, 7, 8, 2, 2, '#e53935');
        px(ctx, 9, 7, 2, 2, '#e53935');
        px(ctx, 11, 5, 2, 2, '#e53935');
        break;
      default:
        px(ctx, 6, 2, 4, 12, '#ffd54f');
        px(ctx, 2, 6, 12, 4, '#ffd54f');
        px(ctx, 5, 5, 6, 6, '#ffab00');
        break;
    }

    itemCache[itemId] = c;
    return c;
  }

  // ==================== 16-BIT AUTO-TILED GROUND RENDERER ====================
  // Uses cached 16x16 logical -> 32x32 pixel tiles + dynamic shoreline/path blending!
  function getStaticTileVariant(type, variant) {
    const key = type + '_' + variant;
    if (tileCache[key]) return tileCache[key];
    const c = makeCanvas(32, 32);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.scale(2, 2); // 16x16 crisp pixel grid!

    if (type === 'grass') {
      // Lush Stardew 16-bit hue-shifted meadow greens
      px(ctx, 0, 0, 16, 16, variant % 2 === 0 ? '#6ab04c' : '#65aa47');
      // Subtle sunlit dither speckles
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
        // Clover patch
        px(ctx, 5, 7, 2, 2, deep); px(ctx, 5, 6, 1, 1, light); px(ctx, 7, 7, 1, 1, light);
        px(ctx, 11, 12, 2, 1, light);
      } else if (variant === 3) {
        // Warm yellow-white meadow wildflowers
        px(ctx, 4, 10, 1, 3, deep);
        px(ctx, 3, 9, 3, 2, '#fff59d');
        px(ctx, 4, 9, 1, 1, '#f59e0b');
        px(ctx, 11, 5, 1, 2, deep);
        px(ctx, 10, 4, 3, 2, '#ffffff');
        px(ctx, 11, 4, 1, 1, '#ffd54f');
      } else if (variant === 4) {
        // Pink & sky-blue Stardew flowers
        px(ctx, 9, 9, 1, 3, deep);
        px(ctx, 8, 8, 3, 2, '#ff9eb5');
        px(ctx, 9, 8, 1, 1, '#ffe066');
        px(ctx, 3, 4, 2, 1, light);
      } else {
        // Tiny mossy pebble
        px(ctx, 10, 11, 3, 2, '#7b8a78');
        px(ctx, 10, 11, 2, 1, '#a9b8a4');
        px(ctx, 4, 6, 1, 2, midDark);
      }
    } else if (type === 'path') {
      // Warm 16-bit packed dirt & golden gravel road
      px(ctx, 0, 0, 16, 16, '#d9b377');
      px(ctx, 1, 2, 3, 2, '#c89e61');
      px(ctx, 9, 10, 4, 2, '#c89e61');
      px(ctx, 12, 3, 2, 1, '#ebd09b');
      px(ctx, 3, 12, 3, 1, '#ebd09b');
      if (variant % 3 === 0) {
        // Recessed cobblestone accent
        px(ctx, 6, 5, 4, 3, '#b58a4f');
        px(ctx, 6, 5, 3, 2, '#e6c68e');
      }
      if (variant % 2 === 1) {
        px(ctx, 2, 9, 2, 1, '#b58a4f');
        px(ctx, 11, 13, 2, 1, '#b58a4f');
      }
    } else if (type === 'stone') {
      // Handcrafted 16-bit beveled plaza flagstones
      px(ctx, 0, 0, 16, 16, '#8f887b'); // mortar lines
      // Stone 1
      px(ctx, 1, 1, 6, 6, '#c7c1b4');
      px(ctx, 1, 1, 5, 1, '#e3ded2');
      px(ctx, 1, 6, 6, 1, '#a39c8e');
      // Stone 2
      px(ctx, 8, 1, 7, 6, '#bdb7aa');
      px(ctx, 8, 1, 6, 1, '#d9d4c7');
      px(ctx, 8, 6, 7, 1, '#9c9588');
      // Stone 3
      px(ctx, 1, 8, 7, 7, '#bdb7aa');
      px(ctx, 1, 8, 6, 1, '#d9d4c7');
      px(ctx, 1, 14, 7, 1, '#9c9588');
      // Stone 4
      px(ctx, 9, 8, 6, 7, '#c7c1b4');
      px(ctx, 9, 8, 5, 1, '#e3ded2');
      px(ctx, 9, 14, 6, 1, '#a39c8e');
      if (variant === 0) {
        // Cute tiny moss pixel in mortar
        px(ctx, 7, 7, 2, 1, '#68a64e');
      }
    } else if (type === 'soil') {
      // Rich tilled Stardew farm soil + lush sprouts!
      px(ctx, 0, 0, 16, 16, '#6ab04c');
      px(ctx, 1, 1, 14, 14, '#6b3e1f');
      px(ctx, 2, 2, 12, 12, '#8c552e');
      // Furrow rows
      px(ctx, 2, 4, 12, 2, '#6b3e1f');
      px(ctx, 2, 9, 12, 2, '#6b3e1f');
      px(ctx, 2, 3, 12, 1, '#a86b3e');
      px(ctx, 2, 8, 12, 1, '#a86b3e');
      // 16-bit leafy crop sprouts
      px(ctx, 4, 3, 2, 3, '#2d7a36');
      px(ctx, 3, 2, 4, 2, '#6ce068');
      px(ctx, 4, 2, 2, 1, '#b8ff85');
      px(ctx, 10, 7, 2, 3, '#2d7a36');
      px(ctx, 9, 6, 4, 2, '#6ce068');
      px(ctx, 10, 6, 2, 1, '#b8ff85');
      if (variant % 2 === 0) {
        // Golden pixel berry
        px(ctx, 10, 8, 2, 2, '#ff5252');
        px(ctx, 10, 8, 1, 1, '#ffcdd2');
      }
    } else if (type === 'fence') {
      ctx.drawImage(getStaticTileVariant('grass', 0), 0, 0, 16, 16);
      // 16-bit wooden picket fence with shadows & woodgrain
      px(ctx, 1, 4, 4, 11, '#3d200d');
      px(ctx, 11, 4, 4, 11, '#3d200d');
      px(ctx, 2, 5, 2, 9, '#a6632e');
      px(ctx, 2, 5, 1, 9, '#cc8445');
      px(ctx, 12, 5, 2, 9, '#a6632e');
      px(ctx, 12, 5, 1, 9, '#cc8445');
      // Rails
      px(ctx, 0, 6, 16, 3, '#3d200d');
      px(ctx, 0, 7, 16, 1, '#c47b3d');
      px(ctx, 0, 11, 16, 3, '#3d200d');
      px(ctx, 0, 12, 16, 1, '#a6632e');
    }

    tileCache[key] = c;
    return c;
  }

  function drawTile(ctx, type, gx, gy, wx, wy, tick, grid) {
    const hash = ((gx * 73856093) ^ (gy * 19349663)) >>> 0;

    if (type === 'water') {
      // 16-bit animated shimmering deep-to-shallow water
      ctx.fillStyle = '#2d82b5';
      ctx.fillRect(wx, wy, 32, 32);
      const phase = Math.floor((tick / 16 + gx * 0.7 + gy * 0.5) % 4);
      ctx.fillStyle = '#3b98cc';
      ctx.fillRect(wx + 2, wy + 2, 28, 28);
      // Animated sunlit shimmer pixels
      ctx.fillStyle = '#7bd4f5';
      ctx.fillRect(wx + 4 + phase * 2, wy + 8, 8, 2);
      ctx.fillRect(wx + 16 - phase * 2, wy + 22, 10, 2);
      if (phase === 1 || phase === 2) {
        ctx.fillStyle = '#d4f5ff';
        ctx.fillRect(wx + 6 + phase * 2, wy + 8, 3, 2);
      }

      // Auto-tiled 16-bit shoreline banks & white foam when adjacent to land!
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

      // Occasional 16-bit lily pad with lotus flower
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
      // Draw shimmering water under bridge edges
      ctx.fillStyle = '#2d82b5';
      ctx.fillRect(wx, wy, 32, 32);
      // 16-bit timber planks + shadow + railings
      ctx.fillStyle = '#472610';
      ctx.fillRect(wx, wy + 1, 32, 30);
      ctx.fillStyle = '#a86936';
      ctx.fillRect(wx, wy + 3, 32, 26);
      for (let i = 0; i < 32; i += 8) {
        ctx.fillStyle = '#6e3f1c'; ctx.fillRect(wx + i, wy + 3, 2, 26);
        ctx.fillStyle = '#c9884f'; ctx.fillRect(wx + i + 2, wy + 4, 5, 2);
      }
      // Wooden rail trim
      ctx.fillStyle = '#d99e62';
      ctx.fillRect(wx, wy + 2, 32, 3);
      ctx.fillRect(wx, wy + 27, 32, 3);
      return;
    }

    // Cached 16-bit tile base
    const variant = hash % 6;
    ctx.drawImage(getStaticTileVariant(type, variant), wx, wy);

    // Auto-tiled 16-bit organic grass tufts overlapping path edges!
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

  // ==================== 16-BIT LAYERED TREES (3 Species + Gentle Wind Sway) ====================
  function getTreeSprite(variant) {
    if (treeCache[variant]) return treeCache[variant];
    const c = makeCanvas(56, 68);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.scale(2, 2); // 28x34 pixel canvas!

    const ol = '#1e2e1a';

    // Ground shadow
    ctx.fillStyle = 'rgba(18, 32, 16, 0.30)';
    ctx.fillRect(4, 28, 20, 5);
    ctx.fillRect(6, 27, 16, 6);

    if (variant === 1) {
      // 16-Bit Tiered Evergreen Pine
      // Trunk
      px(ctx, 11, 22, 6, 9, '#3d2210');
      px(ctx, 12, 22, 4, 8, '#754422');
      px(ctx, 12, 22, 2, 8, '#965d34');
      // 3 Conifer tiers (bottom -> top)
      const tiers = [
        { y: 15, w: 22, h: 9 },
        { y: 9, w: 18, h: 8 },
        { y: 3, w: 12, h: 8 }
      ];
      tiers.forEach((t) => {
        const x = Math.floor((28 - t.w) / 2);
        px(ctx, x, t.y, t.w, t.h, ol);
        px(ctx, x + 1, t.y + 1, t.w - 2, t.h - 2, '#1e5c3b');
        px(ctx, x + 2, t.y + 1, t.w - 4, t.h - 4, '#2f824e');
        px(ctx, x + 3, t.y + 1, Math.floor((t.w - 6) * 0.65), 2, '#57b868');
      });
      px(ctx, 13, 1, 2, 3, ol);
      px(ctx, 13, 2, 2, 2, '#57b868');
    } else {
      // 16-Bit Lush Stardew Oak (v0) or Fruit/Blossom Tree (v2)
      // Bark & flared roots
      px(ctx, 10, 18, 8, 12, '#3b2010');
      px(ctx, 9, 28, 10, 3, '#3b2010');
      px(ctx, 11, 19, 6, 10, '#784824');
      px(ctx, 11, 19, 2, 10, '#a36738');
      px(ctx, 15, 21, 2, 8, '#5c3418');

      const cDark = variant === 2 ? '#8f3959' : '#245e2e';
      const cMid = variant === 2 ? '#d96b8e' : '#3a8c40';
      const cHi = variant === 2 ? '#ffadc4' : '#6cc754';
      const cTop = variant === 2 ? '#ffe3ec' : '#a2e86b';

      // Canopy outline silhouette
      px(ctx, 4, 6, 20, 15, ol);
      px(ctx, 2, 9, 24, 10, ol);
      px(ctx, 7, 3, 14, 18, ol);

      // Deep shaded foliage
      px(ctx, 5, 7, 18, 13, cDark);
      px(ctx, 3, 10, 22, 8, cDark);
      // Mid foliage clusters
      px(ctx, 6, 5, 16, 12, cMid);
      px(ctx, 4, 9, 20, 7, cMid);
      // Sunlit leaf clusters
      px(ctx, 7, 4, 12, 6, cHi);
      px(ctx, 5, 8, 8, 5, cHi);
      px(ctx, 15, 9, 7, 4, cHi);
      // Bright 16-bit highlight pixels
      px(ctx, 9, 5, 6, 2, cTop);
      px(ctx, 6, 9, 4, 2, cTop);

      if (variant === 0) {
        // Little sunlit leaf dither
        px(ctx, 18, 13, 2, 2, cHi);
      } else if (variant === 2) {
        // Cute glowing blossom petals
        px(ctx, 8, 12, 2, 2, '#fff5f8');
        px(ctx, 17, 7, 2, 2, '#fff5f8');
      }
    }

    treeCache[variant] = c;
    return c;
  }

  function drawTree(ctx, wx, wy, variant = 0, tick = 0) {
    const sway = Math.sin(tick / 35 + wx * 0.04) * 1.1;
    ctx.drawImage(getTreeSprite(variant), Math.floor(wx - 12 + sway), Math.floor(wy - 34));
  }

  // ==================== 16-BIT BUILDINGS (Chimney Smoke, Rooftop Tech, Shingles, Flowerboxes) ====================
  function drawBuilding(ctx, b, isOnline, tick) {
    const x = b.tx * 32;
    const y = b.ty * 32;
    const w = b.tw * 32;
    const h = b.th * 32;
    const ol = '#2c180c';

    // Soft cast ground shadow
    ctx.fillStyle = 'rgba(18, 28, 16, 0.30)';
    ctx.fillRect(x + 8, y + h - 2, w, 12);

    // Brick Chimney + Animated Smoke when Online!
    const chX = x + w - 26;
    const chY = y - 14;
    px(ctx, chX, chY, 14, 24, ol);
    px(ctx, chX + 2, chY + 2, 10, 20, '#8d4a3a');
    px(ctx, chX + 2, chY + 2, 4, 20, '#b5634e');
    px(ctx, chX - 2, chY, 18, 4, '#5c2d22');
    if (isOnline) {
      for (let i = 0; i < 3; i++) {
        const p = ((tick * 0.4 + i * 14) % 42);
        const alpha = Math.max(0, 0.55 - p / 75);
        ctx.fillStyle = `rgba(245, 248, 255, ${alpha})`;
        const sx = chX + 4 + Math.sin(p * 0.16 + i) * 5;
        const sy = chY - 4 - p * 0.7;
        const sz = 5 + Math.floor(p / 10);
        ctx.fillRect(Math.floor(sx), Math.floor(sy), sz, sz);
      }
    }

    // Wall Outline + Stone Foundation + Warm Plastered Wall
    px(ctx, x + 2, y + 30, w - 4, h - 30, ol);
    px(ctx, x + 4, y + 32, w - 8, h - 34, b.wallColor || '#f5e4c3');
    // Subtle plaster shading under roof eaves
    ctx.fillStyle = 'rgba(40, 20, 5, 0.18)';
    ctx.fillRect(x + 4, y + 34, w - 8, 8);

    // 16-bit Stone Foundation course
    px(ctx, x + 4, y + h - 14, w - 8, 12, '#7d786f');
    for (let sx = x + 6; sx < x + w - 12; sx += 14) {
      px(ctx, sx, y + h - 12, 11, 8, '#a39e93');
      px(ctx, sx, y + h - 12, 9, 2, '#c4bfb4');
    }

    // Timber corner & vertical beams
    px(ctx, x + 4, y + 32, 6, h - 34, '#5c3114');
    px(ctx, x + 6, y + 32, 2, h - 34, '#874c24');
    px(ctx, x + w - 10, y + 32, 6, h - 34, '#5c3114');
    px(ctx, x + w - 8, y + 32, 2, h - 34, '#874c24');

    // 16-Bit Pitched Shingled Roof
    px(ctx, x - 6, y + 10, w + 12, 28, ol);
    px(ctx, x - 4, y + 12, w + 8, 24, b.roofDark || '#7d2f24');
    px(ctx, x - 2, y + 4, w + 4, 28, ol);
    px(ctx, x, y + 6, w, 24, b.roofColor || '#b54635');
    px(ctx, x + 6, y - 4, w - 12, 12, ol);
    px(ctx, x + 8, y - 2, w - 16, 10, b.roofColor || '#b54635');
    // Sunlit roof ridge highlight
    px(ctx, x + 10, y - 2, w - 20, 3, 'rgba(255,255,255,0.28)');

    // 16-bit scalloped shingle pattern
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    for (let ry = y + 10; ry < y + 29; ry += 6) {
      ctx.fillRect(x + 2, ry, w - 4, 2);
      for (let rx = x + ((ry % 12 === 0) ? 4 : 10); rx < x + w - 6; rx += 12) {
        ctx.fillRect(rx, ry - 4, 2, 4);
      }
    }

    // Rooftop Tech Gimmick per Building Type!
    if (b.id === 'remote_tower' || b.id === 'dns_tower' || b.id === 'mail_proxy') {
      // Animated Signal Antenna with blinking beacon!
      const ax = x + 18;
      const ay = y - 20;
      px(ctx, ax, ay, 4, 22, '#37474f');
      px(ctx, ax - 6, ay + 6, 16, 3, '#78909c');
      const pulse = Math.floor(tick / 15) % 2 === 0;
      px(ctx, ax - 1, ay - 4, 6, 6, isOnline ? (pulse ? '#5ce1e6' : '#0284c7') : (pulse ? '#ff4444' : '#6e1414'));
    } else if (b.id === 'win_hall') {
      // Classic 4-pane Windows Logo Crest on roof!
      const cx = x + 14;
      const cy = y - 10;
      px(ctx, cx, cy, 14, 14, '#1e3a8a');
      px(ctx, cx + 2, cy + 2, 4, 4, '#38bdf8');
      px(ctx, cx + 8, cy + 2, 4, 4, '#60a5fa');
      px(ctx, cx + 2, cy + 8, 4, 4, '#60a5fa');
      px(ctx, cx + 8, cy + 8, 4, 4, '#93c5fd');
    } else if (b.id === 'cron_clock') {
      // Mini golden pixel clock on gable!
      const cx = x + 14;
      const cy = y - 10;
      px(ctx, cx, cy, 14, 14, '#7a5c00');
      px(ctx, cx + 2, cy + 2, 10, 10, '#fffdf0');
      px(ctx, cx + 6, cy + 4, 2, 4, '#263238');
      px(ctx, cx + 6, cy + 7, 4, 2, '#d84315');
    } else if (b.id === 'grand_hall') {
      // Golden Crown Emblem
      px(ctx, x + Math.floor(w / 2) - 10, y - 14, 20, 10, '#f59e0b');
      px(ctx, x + Math.floor(w / 2) - 8, y - 12, 16, 6, '#fde047');
    }

    // Arched Wooden Door + Porch Step + Warm Sconce Lantern
    const doorX = x + Math.floor(w / 2) - 14;
    const doorY = y + h - 38;
    px(ctx, doorX - 2, doorY - 2, 32, 38, ol);
    px(ctx, doorX, doorY, 28, 34, '#6b3b19');
    px(ctx, doorX + 3, doorY + 3, 22, 28, '#965728');
    px(ctx, doorX + 6, doorY + 6, 16, 10, '#b56e38');
    px(ctx, doorX + 20, doorY + 18, 3, 3, '#ffd54f');
    // Stone doorstep
    px(ctx, doorX - 4, y + h - 4, 36, 6, '#9e988c');
    px(ctx, doorX - 2, y + h - 4, 32, 2, '#cfcac0');

    // Windows with warm glowing glass + pixel flowerboxes!
    const winPositions = [x + 16, x + w - 42];
    winPositions.forEach((wx) => {
      px(ctx, wx - 2, y + 46, 28, 26, ol);
      px(ctx, wx, y + 48, 24, 22, '#6b3b19');
      if (isOnline) {
        px(ctx, wx + 3, y + 51, 18, 16, '#ffd966');
        px(ctx, wx + 5, y + 53, 14, 12, '#fff2b2');
      } else {
        px(ctx, wx + 3, y + 51, 18, 16, '#435869');
        px(ctx, wx + 5, y + 53, 6, 4, '#627d91');
      }
      // Window mullions
      px(ctx, wx + 11, y + 51, 2, 16, '#5c3114');
      px(ctx, wx + 3, y + 58, 18, 2, '#5c3114');
      // Flowerbox underneath
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

  // ==================== 16-BIT SERVER RACK ====================
  function drawServerRack(ctx, wx, wy, online, tick) {
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.fillRect(wx + 2, wy + 26, 28, 8);

    // Outlined beveled steel cabinet
    px(ctx, wx + 3, wy - 10, 26, 38, '#141d24');
    px(ctx, wx + 5, wy - 8, 22, 34, '#37474f');
    px(ctx, wx + 5, wy - 8, 22, 3, '#607d8b'); // top specular highlight
    px(ctx, wx + 5, wy - 8, 2, 34, '#546e7a');

    for (let r = 0; r < 3; r++) {
      const ry = wy - 3 + r * 10;
      px(ctx, wx + 8, ry, 16, 8, '#101820');
      const blink = Math.floor(tick / 10 + r) % 2 === 0;
      if (online) {
        px(ctx, wx + 10, ry + 2, 3, 3, '#4eff7a');
        px(ctx, wx + 15, ry + 2, 7, 2, blink ? '#5ce1e6' : '#0284c7');
        px(ctx, wx + 15, ry + 5, 5, 1, '#2ec45c');
      } else {
        px(ctx, wx + 10, ry + 2, 3, 3, blink ? '#ff4444' : '#7a1616');
        px(ctx, wx + 15, ry + 2, 7, 2, '#37474f');
      }
    }

    // Online subtle data aura / Offline warning sparks
    if (online && Math.floor(tick / 20) % 2 === 0) {
      px(ctx, wx + 14, wy - 14, 4, 3, 'rgba(92,225,230,0.75)');
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
    // Wood highlight & iron bands
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
    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.24)';
    ctx.fillRect(wx - 10, wy + 26, 84, 12);
    // Stone basin (2 tiles wide = 64px)
    px(ctx, wx - 8, wy + 4, 80, 28, '#545049');
    px(ctx, wx - 6, wy + 6, 76, 24, '#bdb7aa');
    px(ctx, wx - 4, wy + 8, 72, 20, '#e3ded2');
    // Shimmering basin water
    px(ctx, wx, wy + 10, 64, 14, '#2d88bf');
    px(ctx, wx + 2, wy + 12, 60, 10, '#5ec8f2');
    // Center pedestal
    px(ctx, wx + 24, wy - 10, 16, 26, '#6e6a61');
    px(ctx, wx + 26, wy - 8, 12, 22, '#cfcac0');
    px(ctx, wx + 22, wy - 12, 20, 6, '#e3ded2');
    // Animated sparkling water jets!
    const p = tick % 20;
    const h = 8 + Math.sin(tick / 6) * 3;
    px(ctx, wx + 30, wy - 14 - h, 4, h + 4, '#b8f2ff');
    px(ctx, wx + 28, wy - 15 - h, 8, 3, '#ffffff');
    // Falling water droplets
    const dropY = (p / 20) * 18;
    px(ctx, wx + 18, wy - 8 + dropY, 3, 4, '#d4f7ff');
    px(ctx, wx + 43, wy - 8 + dropY, 3, 4, '#d4f7ff');
    // Ripples
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
