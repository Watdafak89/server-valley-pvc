// Server Valley — Main Game Engine, Renderer, HUD, Dialog, Codex, Shop & Save System
(function () {
  const TILE = 32;
  const TOTAL_UNITS = 18;
  const SAVE_KEY = 'server_valley_pvc_18w_v2';
  const LEGACY_SAVE_KEY = 'server_valley_pvc_save_v1';
  const GD = window.GAME_DATA;

  const DEFAULT_PROFILE = {
    studentName: 'นักศึกษาฝึกงาน ปวช.',
    studentClass: 'ระดับ ปวช. สาขาเทคโนโลยีสารสนเทศ',
    collegeName: 'วิทยาลัยอาชีวศึกษา / วิทยาลัยเทคนิค',
    instructorName: 'อาจารย์ผู้สอนรายวิชาฯ',
    skin: '#f6cfa6',
    hairStyle: 'short',
    hairColor: '#5a331c',
    faceStyle: 'smile',
    shirtColor: '#c53030',
    shirtStyle: 'jacket',
    pantsColor: '#2c4969',
    shoesColor: '#5c3317',
    hatColor: '#c85a17',
    headMiddle: '',
    headLower: ''
  };

  // DOM References
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const titleScreen = document.getElementById('title-screen');
  const hudTopLeft = document.getElementById('hud-top-left');
  const hudTopRight = document.getElementById('hud-top-right');
  const hudEnergy = document.getElementById('hud-energy');
  const hudHotbar = document.getElementById('hud-hotbar');
  const toastContainer = document.getElementById('toast-container');

  // Static 4x World Map & Collision-Safe Trees
  const tileMap = GD.createTileMap();
  const trees = GD.createTrees(tileMap);
  const treeLookup = new Set(trees.map((t) => t.tx + ',' + t.ty));

  // Live Game State
  let state = createFreshState();
  let running = false;
  let tick = 0;
  let lastTime = 0;
  let stepSoundCooldown = 0;
  let particles = [];
  let fireflies = [];
  let butterflies = [];
  let petals = [];
  const KOI_FISH = [
    { x: 60.5 * TILE, y: 23.5 * TILE, vx: 0.35, color: '#ff6b35', minX: 59.4 * TILE, maxX: 62.6 * TILE },
    { x: 62.0 * TILE, y: 24.7 * TILE, vx: -0.28, color: '#fff5e4', minX: 59.4 * TILE, maxX: 62.6 * TILE },
    { x: 39.2 * TILE, y: 40.3 * TILE, vx: 0.3, color: '#ff9f1c', minX: 38.4 * TILE, maxX: 40.5 * TILE },
    { x: 43.2 * TILE, y: 41.2 * TILE, vx: -0.32, color: '#ff5252', minX: 43.1 * TILE, maxX: 44.6 * TILE }
  ];
  const BENCHES = [
    { tx: 6, ty: 14 },
    { tx: 37, ty: 29 }, { tx: 45, ty: 29 },
    { tx: 16, ty: 21 }, { tx: 48, ty: 21 },
    { tx: 14, ty: 37 }, { tx: 56, ty: 37 }
  ];
  let activeModalId = null;
  let returnToLabUnit = null;
  let currentLabUnit = null;

  // Teacher Admin Mode State
  const TEACHER_PIN_KEY = 'sv_teacher_pin';
  const TEACHER_SESSION_KEY = 'sv_teacher_admin_on';
  let isTeacherAdmin = false;
  let teacherGodSpeed = false;
  let announceTimer = null;
  try {
    if (sessionStorage.getItem(TEACHER_SESSION_KEY) === '1') isTeacherAdmin = true;
  } catch (e) {}

  // Input State & Movement Control Mode ('both' | 'wasd' | 'arrows')
  const CONTROL_MODE_KEY = 'sv_control_mode';
  let controlMode = 'both';
  try {
    const savedCtrl = localStorage.getItem(CONTROL_MODE_KEY);
    if (savedCtrl === 'both' || savedCtrl === 'wasd' || savedCtrl === 'arrows') controlMode = savedCtrl;
  } catch (e) {}

  const keys = {};
  const touchDir = { up: false, down: false, left: false, right: false };

  function mapEventToMoveCode(e) {
    if (e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyS' || e.code === 'KeyD' ||
        e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
      return e.code;
    }
    const k = (e.key || '').toLowerCase();
    if (k === 'w' || k === 'ไ' || k === '"') return 'KeyW';
    if (k === 's' || k === 'ห' || k === 'ฆ') return 'KeyS';
    if (k === 'a' || k === 'ฟ' || k === 'ฤ') return 'KeyA';
    if (k === 'd' || k === 'ก' || k === 'ฏ') return 'KeyD';
    if (k === 'arrowup' || k === 'up') return 'ArrowUp';
    if (k === 'arrowdown' || k === 'down') return 'ArrowDown';
    if (k === 'arrowleft' || k === 'left') return 'ArrowLeft';
    if (k === 'arrowright' || k === 'right') return 'ArrowRight';
    const kc = e.keyCode || e.which;
    if (kc === 87) return 'KeyW';
    if (kc === 83) return 'KeyS';
    if (kc === 65) return 'KeyA';
    if (kc === 68) return 'KeyD';
    if (kc === 38) return 'ArrowUp';
    if (kc === 40) return 'ArrowDown';
    if (kc === 37) return 'ArrowLeft';
    if (kc === 39) return 'ArrowRight';
    return null;
  }

  function updateKeycapTesterUI() {
    const map = { KeyW: 'kc-w', KeyA: 'kc-a', KeyS: 'kc-s', KeyD: 'kc-d' };
    Object.keys(map).forEach((code) => {
      const el = document.getElementById(map[code]);
      if (el) el.classList.toggle('pressed', !!keys[code]);
    });
  }

  function clearAllKeys() {
    Object.keys(keys).forEach((k) => { keys[k] = false; });
    touchDir.up = touchDir.down = touchDir.left = touchDir.right = false;
    updateKeycapTesterUI();
  }

  function blurActiveInput() {
    const ae = document.activeElement;
    if (ae && typeof ae.blur === 'function' && ae !== document.body) {
      ae.blur();
    }
  }

  // Dialog State
  let dialogQueue = null; // { speaker, role, style, lines[], index, choices?, onEnd? }
  let doorCooldown = 0;

  function createFreshState() {
    return {
      started: false,
      profile: { ...DEFAULT_PROFILE },
      day: 1,
      minutes: 8 * 60, // 08:00 AM
      bytes: 150,
      energy: 100,
      maxEnergy: 100,
      speedBoostTimer: 0,
      insideBuildingId: null,
      outsidePos: null,
      player: {
        x: 7 * TILE,
        y: 10 * TILE,
        dir: 'down',
        frame: 0,
        animTimer: 0
      },
      selectedSlot: 0,
      inventory: [
        { id: 'admin_coffee', qty: 2 },
        { id: 'packet_kit', qty: 1 }
      ],
      openedCrates: [],
      completedUnits: [],
      acceptedQuests: [],
      solvedCodexQuizzes: [],
      bestMasterQuiz: null,
      activeQuestId: 1
    };
  }

  function profileToStyle(prof) {
    const p = { ...DEFAULT_PROFILE, ...(prof || {}) };
    return {
      skin: p.skin,
      hair: p.hairColor,
      hairStyle: p.hairStyle,
      faceStyle: p.faceStyle,
      glasses: p.faceStyle === 'glasses',
      shirt: p.shirtColor,
      shirtStyle: p.shirtStyle,
      accent: '#f4f9f4',
      pants: p.pantsColor,
      shoes: p.shoesColor,
      hat: p.hatColor || '',
      headMiddle: p.headMiddle || '',
      headLower: p.headLower || '',
      hatTrim: '#ffd166',
      backpack: true
    };
  }

  function styleCacheKey(prefix, s) {
    return [prefix, s.skin, s.hair, s.hairStyle, s.faceStyle, s.shirt, s.shirtStyle, s.pants, s.shoes, s.hat, s.headMiddle, s.headLower].join('_');
  }

  function applyPlayerAppearance(prof) {
    if (!prof) return;
    Object.assign(GD.PLAYER_STYLE, profileToStyle(prof));
  }

  function refreshHudAvatar() {
    const av = document.getElementById('hud-avatar');
    if (!av) return;
    const avCtx = av.getContext('2d');
    avCtx.imageSmoothingEnabled = true;
    avCtx.clearRect(0, 0, 48, 48);
    const key = styleCacheKey('hud', GD.PLAYER_STYLE);
    avCtx.drawImage(Sprites.getPortrait(key, GD.PLAYER_STYLE), 0, 0, 48, 48);
  }

  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.profile = { ...DEFAULT_PROFILE, ...(parsed.profile || {}) };
        return parsed;
      }
      // Migrate profile gracefully from v1 if present
      const oldRaw = localStorage.getItem(LEGACY_SAVE_KEY);
      if (oldRaw) {
        const old = JSON.parse(oldRaw);
        if (old && old.profile) {
          return { ...createFreshState(), profile: { ...DEFAULT_PROFILE, ...old.profile }, started: false };
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // ==================== INVENTORY HELPERS ====================
  function hasItem(itemId) {
    return state.inventory.some((slot) => slot.id === itemId && slot.qty > 0);
  }

  function addItem(itemId, qty = 1) {
    const existing = state.inventory.find((s) => s.id === itemId);
    if (existing) {
      existing.qty += qty;
    } else if (state.inventory.length < 12) {
      state.inventory.push({ id: itemId, qty });
    } else {
      state.inventory.push({ id: itemId, qty });
    }
    renderHotbar();
    saveGame();
  }

  function consumeItem(itemId, qty = 1) {
    const idx = state.inventory.findIndex((s) => s.id === itemId);
    if (idx === -1) return false;
    state.inventory[idx].qty -= qty;
    if (state.inventory[idx].qty <= 0) {
      state.inventory.splice(idx, 1);
      if (state.selectedSlot >= state.inventory.length) {
        state.selectedSlot = Math.max(0, state.inventory.length - 1);
      }
    }
    renderHotbar();
    saveGame();
    return true;
  }

  // ==================== TOASTS & PARTICLES ====================
  function showToast(msg, isSuccess = false) {
    const t = document.createElement('div');
    t.className = 'toast' + (isSuccess ? ' success' : '');
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.3s';
      setTimeout(() => t.remove(), 320);
    }, 3200);
  }

  function spawnParticles(wx, wy, color = '#ffe066', count = 16) {
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const spd = 0.8 + Math.random() * 2.2;
      particles.push({
        x: wx,
        y: wy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 1.2,
        life: 32 + Math.random() * 24,
        color,
        size: 3 + Math.floor(Math.random() * 3)
      });
    }
  }

  const coopOnlineUnits = new Set();
  let myBubble = '';
  let myBubbleUntil = 0;

  // ==================== QUEST & WORLD HELPERS ====================
  function getActiveQuest() {
    return GD.QUESTS.find((q) => q.id === state.activeQuestId) || null;
  }

  function isUnitDone(unit) {
    return state.completedUnits.includes(unit);
  }

  function isUnitOnlineInVillage(unit) {
    if (isUnitDone(unit)) return true;
    const st = window.Multiplayer ? Multiplayer.getStatus() : null;
    return !!(st && st.connected && st.coopShared && coopOnlineUnits.has(unit));
  }

  function isBuildingOnline(b) {
    if (b.alwaysOnline) return true;
    return b.units.length > 0 && b.units.every((u) => isUnitOnlineInVillage(u));
  }

  function isStationOnline(st) {
    return st.units.every((u) => isUnitOnlineInVillage(u));
  }

  function getBuildingById(id) {
    return GD.BUILDINGS.find((b) => b.id === id) || null;
  }

  function getBuildingForUnit(unit) {
    return GD.BUILDINGS.find((b) => b.units && b.units.includes(Number(unit))) || null;
  }

  function getInteriorLayout(buildingId) {
    const b = getBuildingById(buildingId);
    if (!b) return null;
    const npc = GD.NPCS.find((n) => n.units && b.units.some((u) => n.units.includes(u))) || null;
    const station = GD.STATIONS.find((s) => s.units && b.units.some((u) => s.units.includes(u))) || null;
    // Find if any quest in this building requires a tool item so we provide a Lab Supply Crate inside!
    const qWithItem = GD.QUESTS.find((q) => b.units.includes(q.unit) && q.requiredItem);
    const supplyItemId = qWithItem ? qWithItem.requiredItem : null;
    return {
      building: b,
      npc,
      station,
      supplyItemId,
      isCottage: b.id === 'cottage',
      npcPos: { x: 6 * TILE, y: 4.1 * TILE },
      stationPos: { x: 10 * TILE, y: 4.1 * TILE },
      supplyPos: { x: 3.3 * TILE, y: 5.5 * TILE },
      boardPos: { x: 8 * TILE, y: 3.1 * TILE },
      bedPos: { x: 10.2 * TILE, y: 4.2 * TILE },
      exitPos: { x: 7.5 * TILE, y: 9.6 * TILE }
    };
  }

  function enterBuilding(buildingId) {
    const b = getBuildingById(buildingId);
    if (!b) return;
    closeDialog();
    closeAllModals();
    state.outsidePos = {
      x: (b.tx + Math.floor(b.tw / 2)) * TILE - 16,
      y: (b.ty + b.th) * TILE + 8
    };
    state.insideBuildingId = b.id;
    state.player.x = 7.5 * TILE;
    state.player.y = 8.1 * TILE;
    state.player.dir = 'up';
    doorCooldown = 0.5;
    SoundFX.click();
    spawnParticles(state.player.x + 16, state.player.y + 16, '#fde047', 18);
    updateHUD();
    saveGame();
    const layout = getInteriorLayout(b.id);
    if (layout && layout.npc) {
      showToast(`🏠 เข้าสู่ "${b.fullName}" — พบ ${layout.npc.name} และตู้ปฏิบัติการด้านใน!`, true);
    } else {
      showToast(`🏠 เข้าสู่ "${b.fullName}"`, true);
    }
  }

  function exitBuilding() {
    const b = getBuildingById(state.insideBuildingId);
    closeDialog();
    closeAllModals();
    if (state.outsidePos && typeof state.outsidePos.x === 'number') {
      state.player.x = state.outsidePos.x;
      state.player.y = state.outsidePos.y;
    } else if (b) {
      state.player.x = (b.tx + Math.floor(b.tw / 2)) * TILE - 16;
      state.player.y = (b.ty + b.th) * TILE + 8;
    } else {
      state.player.x = 7 * TILE;
      state.player.y = 10 * TILE;
    }
    state.player.dir = 'down';
    state.insideBuildingId = null;
    doorCooldown = 0.5;
    SoundFX.click();
    spawnParticles(state.player.x + 16, state.player.y + 16, '#86efac', 16);
    updateHUD();
    saveGame();
    showToast(`🚪 ออกจากอาคารกลับสู่หมู่บ้าน Server Valley`, true);
  }

  function getZoneName(tx, ty) {
    if (state.insideBuildingId) {
      const b = getBuildingById(state.insideBuildingId);
      if (b) return `🏠 ภายใน: ${b.shortName}`;
    }
    if (tx >= 36 && tx <= 47 && ty >= 22 && ty <= 31) return 'จัตุรัสกลางหมู่บ้าน';
    if (tx < 42 && ty < 27) return 'โซน 1: หมู่บ้านพื้นฐาน (NW)';
    if (tx >= 42 && ty < 27) return 'โซน 2: ย่านบริการเครือข่าย (NE)';
    if (tx < 42 && ty >= 27) return 'โซน 3: ย่านแอปและข้อมูล (SW)';
    return 'โซน 4: ป้อมความมั่นคง (SE)';
  }

  function getPlayerRank() {
    const n = state.completedUnits.length;
    if (n >= TOTAL_UNITS) return 'Lv.18 มหาเทพผู้ดูแลระบบ ปวช. 🏆';
    if (n >= 14) return 'Lv.' + (n + 1) + ' สถาปนิกเซิร์ฟเวอร์อาวุโส';
    if (n >= 10) return 'Lv.' + (n + 1) + ' วิศวกรเครือข่าย';
    if (n >= 5) return 'Lv.' + (n + 1) + ' ช่างเทคนิคเซิร์ฟเวอร์';
    if (n >= 2) return 'Lv.' + (n + 1) + ' แอดมินฝึกหัด';
    return 'Lv.1 ผู้ช่วยแอดมินมือใหม่';
  }

  // ==================== COLLISION CHECK ====================
  function isBlockedPixel(px, py) {
    // Player hitbox (feet area: width 18, height 12)
    const points = [
      [px + 7, py + 24],
      [px + 25, py + 24],
      [px + 7, py + 34],
      [px + 25, py + 34]
    ];

    // Inside a 2.5D Building Interior Room (16x12 tiles = 512x384)
    if (state.insideBuildingId) {
      const layout = getInteriorLayout(state.insideBuildingId);
      for (const [cx, cy] of points) {
        // Outer room walls (walkable floor is x: 46..466, y: 108..324)
        if (cx < 48 || cx > 464 || cy < 110 || cy > 324) return true;
        // Interior NPC hitbox
        if (layout && layout.npc) {
          if (Math.abs(cx - (layout.npcPos.x + 16)) < 14 && Math.abs(cy - (layout.npcPos.y + 24)) < 11) return true;
        }
        // Interior Server Rack hitbox
        if (layout && layout.station) {
          if (Math.abs(cx - (layout.stationPos.x + 16)) < 15 && Math.abs(cy - (layout.stationPos.y + 20)) < 12) return true;
        }
        // Interior Supply Crate hitbox
        if (layout && layout.supplyItemId) {
          if (Math.abs(cx - (layout.supplyPos.x + 16)) < 13 && Math.abs(cy - (layout.supplyPos.y + 18)) < 10) return true;
        }
      }
      return false;
    }

    for (const [cx, cy] of points) {
      const tx = Math.floor(cx / TILE);
      const ty = Math.floor(cy / TILE);
      if (tx < 1 || ty < 1 || tx >= GD.MAP_W - 1 || ty >= GD.MAP_H - 1) return true;
      const t = tileMap[ty][tx];
      if (t === 'water' || t === 'fence') return true;

      // Building footprints (Quest Buildings + Town Scenery & Store Buildings)
      for (const b of GD.BUILDINGS) {
        if (tx >= b.tx && tx < b.tx + b.tw && ty >= b.ty && ty < b.ty + b.th) {
          return true;
        }
      }
      if (GD.SCENERY_BUILDINGS) {
        for (const sb of GD.SCENERY_BUILDINGS) {
          if (tx >= sb.tx && tx < sb.tx + sb.tw && ty >= sb.ty && ty < sb.ty + sb.th) {
            return true;
          }
        }
      }

      // Trees O(1) lookup & Central Plaza Fountain & Admin Farmyard Well & Grand Fast-Travel Warp Board & Arcade Cabinets
      if (treeLookup.has(tx + ',' + ty)) return true;
      if ((tx === 41 || tx === 42) && ty === 24) return true;
      if ((tx === 12 || tx === 13) && ty === 14) return true;
      if ((tx === 13 || tx === 14) && ty === 10) return true;
      if (tx === 36 && ty === 15) return true;
      if (tx === 38 && ty === 24) return true;

      // Outdoor Town & Shopkeeper NPCs hitbox (supports both stationary and walking NPCs!)
      if (GD.TOWN_NPCS) {
        for (const tn of GD.TOWN_NPCS) {
          const nwx = typeof tn.wx === 'number' ? tn.wx : tn.tx * TILE;
          const nwy = typeof tn.wy === 'number' ? tn.wy : tn.ty * TILE;
          if (Math.abs(cx - (nwx + 16)) < 13 && Math.abs(cy - (nwy + 24)) < 10) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Find nearest interactable object within reach (supports both Interior Rooms & Outdoor Village!)
  function findNearestInteractable() {
    const px = state.player.x + 16;
    const py = state.player.y + 22;
    let best = null;
    let bestDist = 64;

    const consider = (kind, obj, wx, wy, label) => {
      const d = Math.hypot(px - wx, py - wy);
      if (d < bestDist) {
        bestDist = d;
        best = { kind, obj, wx, wy, label };
      }
    };

    if (state.insideBuildingId) {
      const layout = getInteriorLayout(state.insideBuildingId);
      if (!layout) return null;
      if (layout.npc) {
        consider('npc', layout.npc, layout.npcPos.x + 16, layout.npcPos.y + 16, `คุยกับ ${layout.npc.name}`);
      }
      if (layout.station) {
        consider('station', layout.station, layout.stationPos.x + 16, layout.stationPos.y + 16, `ปฏิบัติการ ${layout.station.name}`);
      }
      if (layout.supplyItemId && GD.ITEMS[layout.supplyItemId]) {
        const it = GD.ITEMS[layout.supplyItemId];
        consider('interior_supply', { itemId: layout.supplyItemId }, layout.supplyPos.x + 16, layout.supplyPos.y + 16, `เบิกอุปกรณ์แล็บ: ${it.name}`);
      }
      if (layout.isCottage) {
        consider('special', { kind: 'bed' }, layout.bedPos.x + 16, layout.bedPos.y + 16, 'พักผ่อนที่เตียง (ฟื้นพลังงานเต็ม 100%)');
      }
      const boardUnit = (layout.building.units && layout.building.units[0]) || 1;
      consider('interior_board', { unit: boardUnit }, layout.boardPos.x, layout.boardPos.y + 16, `อ่านกระดานความรู้ประจำอาคาร (สัปดาห์ที่ ${layout.building.units.join(', ') || 1})`);
      consider('exit_door', layout.building, layout.exitPos.x + 16, layout.exitPos.y + 12, '🚪 ออกจากอาคารกลับสู่หมู่บ้าน');
      return best;
    }

    // Outside in the Village: Building Entrance Doors!
    GD.BUILDINGS.forEach((b) => {
      const doorWx = (b.tx + b.tw / 2) * TILE;
      const doorWy = (b.ty + b.th) * TILE;
      consider('building_door', b, doorWx, doorWy - 2, `🚪 เข้าสู่อาคาร: ${b.shortName}`);
    });

    // Town Store & Scenery Building Front Doors (Grand IT General Store, Café, Bookstore, etc.)
    if (GD.SCENERY_BUILDINGS) {
      GD.SCENERY_BUILDINGS.forEach((sb) => {
        const doorWx = (sb.tx + sb.tw / 2) * TILE;
        const doorWy = (sb.ty + sb.th) * TILE;
        const lbl = sb.action === 'shop'
          ? `🛒 ซื้อของที่ ${sb.shortName}`
          : sb.action === 'codex'
          ? `📚 เปิดคลังความรู้ที่ ${sb.shortName}`
          : `🔍 สำรวจ ${sb.shortName}`;
        consider('scenery_door', sb, doorWx, doorWy - 2, lbl);
      });
    }

    // Outdoor Town & Shopkeeper NPCs (IT Store Shopkeeper + Walking Village Residents)
    if (GD.TOWN_NPCS) {
      GD.TOWN_NPCS.forEach((tn) => {
        const nwx = typeof tn.wx === 'number' ? tn.wx : tn.tx * TILE;
        const nwy = typeof tn.wy === 'number' ? tn.wy : tn.ty * TILE;
        const lbl = tn.action === 'shop'
          ? `🛒 ทักทาย & ซื้อของกับ ${tn.name}`
          : `👋 ทักทาย ${tn.name}`;
        consider('town_npc', tn, nwx + 16, nwy + 16, lbl);
      });
    }

    GD.CRATES.forEach((c) => {
      if (!state.openedCrates.includes(c.id)) {
        consider('crate', c, c.tx * TILE + 16, c.ty * TILE + 16, `เก็บ ${c.label}`);
      }
    });
    GD.SPECIAL_PROPS.forEach((sp) => {
      if (sp.kind !== 'bed' && sp.kind !== 'shop') {
        const spanW = (sp.tw || 1) * TILE;
        consider('special', sp, sp.tx * TILE + spanW / 2, sp.ty * TILE + 16, sp.label);
      }
    });

    return best;
  }

  // ==================== INTERACTION HANDLER ====================
  function interact() {
    if (activeModalId) return;
    if (dialogQueue) {
      advanceDialog();
      return;
    }

    const target = findNearestInteractable();
    if (!target) {
      showToast(state.insideBuildingId
        ? 'เดินเข้าใกล้ผู้เชี่ยวชาญ ตู้เซิร์ฟเวอร์ กล่องอุปกรณ์ หรือประตูทางออก แล้วกด E'
        : 'เดินไปหน้าประตูอาคารเรียนหรือร้านค้าไอที แล้วกด E เพื่อเข้าใช้งาน!');
      return;
    }

    if (target.kind === 'building_door') {
      enterBuilding(target.obj.id);
      return;
    }

    if (target.kind === 'scenery_door') {
      const sb = target.obj;
      if (sb.action === 'shop') {
        openShopModal();
      } else if (sb.action === 'codex') {
        openCodexModal();
      } else {
        SoundFX.click();
        showToast(sb.flavorText || `🏡 ${sb.fullName}`, true);
      }
      return;
    }

    if (target.kind === 'exit_door') {
      exitBuilding();
      return;
    }

    if (target.kind === 'interior_board') {
      openCodexModal(target.obj.unit || 1);
      return;
    }

    if (target.kind === 'interior_supply') {
      const itemId = target.obj.itemId;
      const item = GD.ITEMS[itemId];
      if (!item) return;
      if (!hasItem(itemId)) {
        addItem(itemId, 1);
        SoundFX.pickup();
        spawnParticles(target.wx, target.wy, '#ffd54f', 20);
        showToast(`🎒 เบิกอุปกรณ์ "${item.name}" สำหรับทำแล็บเรียบร้อยแล้ว!`, true);
      } else {
        SoundFX.click();
        showToast(`✅ คุณมี "${item.name}" อยู่ในกระเป๋าแล้ว นำไปกด E ที่ตู้เซิร์ฟเวอร์ได้เลย!`, true);
      }
      updateHUD();
      saveGame();
      return;
    }

    if (target.kind === 'crate') {
      const c = target.obj;
      state.openedCrates.push(c.id);
      addItem(c.itemId, c.qty);
      SoundFX.pickup();
      spawnParticles(c.tx * TILE + 16, c.ty * TILE + 10, '#ffd54f', 18);
      const item = GD.ITEMS[c.itemId];
      showToast(`🎒 ได้รับ ${item.name} x${c.qty}!`, true);
      updateHUD();
      saveGame();
      return;
    }

    if (target.kind === 'special') {
      if (target.obj.kind === 'bed') {
        SoundFX.sleep();
        state.day += 1;
        state.minutes = 7 * 60;
        state.energy = state.maxEnergy;
        spawnParticles(state.player.x + 16, state.player.y + 12, '#80ffdb', 22);
        showToast(`🌙 พักผ่อนเต็มอิ่มที่บ้านพัก! เช้าวันที่ ${state.day} — พลังงานฟื้นเต็ม 100 ⚡`, true);
        updateHUD();
        saveGame();
      } else if (target.obj.kind === 'shop') {
        openShopModal();
      } else if (target.obj.kind === 'warp') {
        openMapModal();
      } else if (target.obj.kind === 'arcade') {
        openArcadeModal(target.obj.gameMode || 'catcher');
      }
      return;
    }

    if (target.kind === 'npc') {
      handleNpcTalk(target.obj);
      return;
    }

    if (target.kind === 'town_npc') {
      handleTownNpcTalk(target.obj);
      return;
    }

    if (target.kind === 'station') {
      handleStationInteract(target.obj);
      return;
    }
  }

  function handleTownNpcTalk(tn) {
    const pName = (state.profile && state.profile.studentName) || 'แอดมิน';
    const buildChoices = () => {
      const list = [];
      if (Array.isArray(tn.quickReplies)) {
        tn.quickReplies.forEach((qText, idx) => {
          list.push({
            label: qText,
            action: () => {
              const ans = (tn.replyAnswers && tn.replyAnswers[idx]) || 'ยินดีที่ได้พูดคุยกันนะ!';
              const nwx = typeof tn.wx === 'number' ? tn.wx : tn.tx * TILE;
              const nwy = typeof tn.wy === 'number' ? tn.wy : tn.ty * TILE;
              spawnParticles(nwx + 16, nwy + 8, '#fde047', 16);
              openDialog({
                speaker: tn.name,
                role: tn.role,
                style: tn.style,
                lines: [ans],
                choices: buildActionOnlyChoices()
              });
            }
          });
        });
      }
      list.push(...buildActionOnlyChoices());
      return list;
    };

    const buildActionOnlyChoices = () => {
      const actChoices = [];
      if (tn.action === 'shop') {
        actChoices.push({
          label: '🛒 เปิดร้านค้าอุปกรณ์ไอที (IT Store)',
          primary: true,
          action: () => { closeDialog(); openShopModal(); }
        });
      } else if (tn.action === 'codex') {
        actChoices.push({
          label: '📚 เปิดคลังความรู้ 18 สัปดาห์',
          primary: true,
          action: () => { closeDialog(); openCodexModal(); }
        });
      } else if (tn.action === 'map') {
        actChoices.push({
          label: '🗺️ เปิดแผนที่หมู่บ้าน & วาร์ปด่วน',
          primary: true,
          action: () => { closeDialog(); openMapModal(); }
        });
      }
      return actChoices;
    };

    const lines = (tn.greetings && tn.greetings.length)
      ? tn.greetings.map((l) => l.replace('{player}', pName))
      : [`สวัสดี ${pName}! ยินดีต้อนรับสู่หมู่บ้าน Server Valley นะ!`];

    openDialog({
      speaker: tn.name,
      role: tn.role,
      style: tn.style,
      lines,
      choices: buildChoices()
    });
  }

  function handleNpcTalk(npc) {
    const q = getActiveQuest();
    const isActiveNpc = q && q.npcId === npc.id;

    if (isActiveNpc) {
      if (!state.acceptedQuests.includes(q.id)) {
        state.acceptedQuests.push(q.id);
        saveGame();
        openDialog({
          speaker: npc.name,
          role: npc.role,
          style: npc.style,
          lines: q.introDialog,
          choices: [
            { label: `📖 อ่านคู่มือสัปดาห์ที่ ${q.unit} ก่อน`, action: () => { closeDialog(); openCodexModal(q.unit); } },
            { label: '🖥️ ไปลุยปฏิบัติการเลย!', primary: true, action: () => { closeDialog(); tryStartQuestLab(q); } }
          ]
        });
      } else {
        openDialog({
          speaker: npc.name,
          role: npc.role,
          style: npc.style,
          lines: [
            `เควสปัจจุบัน: ${q.title}`,
            q.requiredItem && !hasItem(q.requiredItem)
              ? `อย่าลืมเก็บ "${GD.ITEMS[q.requiredItem].name}" จากกล่องไม้ใกล้ ๆ ก่อนนะ!`
              : 'พร้อมเริ่มปฏิบัติการที่ตู้เซิร์ฟเวอร์ข้าง ๆ หรือกดปุ่มด้านล่างเพื่อเปิดคอนโซลได้เลย!'
          ],
          choices: [
            { label: `📖 คู่มือสัปดาห์ที่ ${q.unit}`, action: () => { closeDialog(); openCodexModal(q.unit); } },
            { label: '🖥️ เปิดห้องแล็บปฏิบัติการ', primary: true, action: () => { closeDialog(); tryStartQuestLab(q); } }
          ]
        });
      }
      updateHUD();
      return;
    }

    // Allow reading & practicing any week's lab directly (Classroom-friendly for 18-week teaching!)
    const allDone = npc.units.every((u) => isUnitDone(u));
    const unitChoices = npc.units.map((u) => ({
      label: isUnitDone(u) ? `🔁 ทบทวนแล็บสัปดาห์ที่ ${u}` : `🧪 ทำแล็บสัปดาห์ที่ ${u} ทันที`,
      primary: !isUnitDone(u),
      action: () => { closeDialog(); openLabModal(u, isUnitDone(u)); }
    }));
    openDialog({
      speaker: npc.name,
      role: npc.role,
      style: npc.style,
      lines: [
        allDone
          ? `${npc.idleTalk} (ขอบคุณนะ ${state.profile.studentName} ที่กู้ระบบโซนนี้จนออนไลน์แล้ว!)`
          : `${npc.idleTalk} (สามารถกดทำแล็บสัปดาห์ที่ ${npc.units.join(', ')} ได้ทันที หรือเดินตามเควสหลัก "${q ? q.title : 'ครบแล้ว'}" ก็ได้นะ!)`
      ],
      choices: [
        { label: `📚 คลังเนื้อหาสัปดาห์ที่ ${npc.units[0] || 1}`, action: () => { closeDialog(); openCodexModal(npc.units[0] || 1); } },
        ...unitChoices
      ]
    });
  }

  function handleStationInteract(station) {
    const q = getActiveQuest();
    if (q && q.stationId === station.id) {
      if (!state.acceptedQuests.includes(q.id)) {
        state.acceptedQuests.push(q.id);
      }
      tryStartQuestLab(q);
      return;
    }

    // Allow both reviewing completed stations & classroom-mode practice on any week's station!
    const allOnline = isStationOnline(station);
    openDialog({
      speaker: station.name,
      role: allOnline ? 'สถานะ: ONLINE 🟢' : 'สถานะ: OFFLINE 🔴 (พร้อมฝึกปฏิบัติ)',
      style: GD.PLAYER_STYLE,
      lines: [
        `บริการ/พอร์ต: ${station.ports}`,
        allOnline
          ? 'ตู้เซิร์ฟเวอร์ทำงานปกติ! ต้องการฝึกทำแล็บทบทวนอีกครั้งหรือไม่?'
          : 'ต้องการเปิดห้องแล็บปฏิบัติการของตู้นี้เลย (โหมดห้องเรียน) หรืออ่านคู่มือก่อน?'
      ],
      choices: [
        { label: `📖 คู่มือสัปดาห์ที่ ${station.units[0]}`, action: () => { closeDialog(); openCodexModal(station.units[0]); } },
        ...station.units.map((u) => ({
          label: isUnitDone(u) ? `🔁 ทบทวนสัปดาห์ที่ ${u}` : `🖥️ เปิดแล็บสัปดาห์ที่ ${u}`,
          primary: !isUnitDone(u),
          action: () => { closeDialog(); openLabModal(u, isUnitDone(u)); }
        }))
      ]
    });
  }

  function tryStartQuestLab(q) {
    if (q.requiredItem && !hasItem(q.requiredItem)) {
      SoundFX.error();
      const itemName = GD.ITEMS[q.requiredItem].name;
      showToast(`⚠️ ต้องมีไอเท็ม "${itemName}" ก่อน! ลองเดินเก็บจากกล่องไม้เรืองแสงใกล้ ๆ`);
      return;
    }
    if (state.energy < 8) {
      SoundFX.error();
      showToast('⚡ พลังงานเหลือน้อยมาก! ดื่มกาแฟแอดมิน (กด F) หรือพักที่บ้านพักแอดมินก่อนนะ');
      return;
    }
    openLabModal(q.unit, false);
  }

  // ==================== USE SELECTED HOTBAR ITEM (F) ====================
  function useSelectedItem() {
    if (activeModalId || dialogQueue) return;
    const slot = state.inventory[state.selectedSlot];
    if (!slot) {
      showToast('ช่อง Hotbar นี้ว่างอยู่ — เลือกช่องที่มีไอเท็มด้วยปุ่ม 1–9, 0, -, =');
      return;
    }
    const item = GD.ITEMS[slot.id];
    if (!item) return;

    if (item.type === 'consumable') {
      consumeItem(item.id, 1);
      state.energy = Math.min(state.maxEnergy, state.energy + (item.energy || 20));
      if (item.speedBoostSec) {
        state.speedBoostTimer = item.speedBoostSec;
      }
      SoundFX.useItem();
      spawnParticles(state.player.x + 16, state.player.y + 10, '#69f0ae', 16);
      showToast(`✨ ใช้ ${item.name}! ฟื้นพลังงาน +${item.energy} ⚡${item.speedBoostSec ? ` และวิ่งไวขึ้น ${item.speedBoostSec} วิ!` : ''}`, true);
      updateHUD();
      return;
    }

    if (item.id === 'log_lens' || item.id === 'port_scanner') {
      SoundFX.useItem();
      const target = findNearestInteractable();
      if (target && target.kind === 'station') {
        const online = isStationOnline(target.obj);
        spawnParticles(target.wx, target.wy, '#5ce1e6', 14);
        showToast(`🔎 สแกน ${target.obj.name}: [${online ? 'ONLINE 🟢' : 'OFFLINE 🔴'}] • ${target.obj.ports}`, online);
      } else {
        showToast('🔎 แว่นสแกนพอร์ต & Log: เดินเข้าใกล้ตู้เซิร์ฟเวอร์แล้วกด F เพื่อสแกนพอร์ตและสถานะบริการ!');
      }
      return;
    }

    // Tool item: if standing near matching station, interact!
    const target = findNearestInteractable();
    if (target && target.kind === 'station') {
      handleStationInteract(target.obj);
    } else {
      SoundFX.click();
      showToast(`🛠️ กำลังถือ "${item.name}" — ${item.desc}`);
    }
  }

  // ==================== LAB COMPLETION ====================
  function completeUnitQuest(unit, isReplay) {
    closeAllModals();
    if (isReplay) {
      state.bytes += 25;
      SoundFX.questComplete();
      showToast(`🎉 ทบทวนแล็บหน่วยที่ ${unit} สำเร็จ! รับโบนัส +25 Bytes 🪙`, true);
      updateHUD();
      saveGame();
      return;
    }

    const q = GD.QUESTS.find((x) => x.unit === unit);
    if (!q) return;

    state.energy = Math.max(0, state.energy - 10);
    if (!state.completedUnits.includes(unit)) {
      state.completedUnits.push(unit);
    }
    coopOnlineUnits.add(unit);
    if (window.Multiplayer) Multiplayer.notifyUnitCompleted(unit);
    state.bytes += q.rewardBytes;
    if (q.rewardItem) {
      addItem(q.rewardItem.id, q.rewardItem.qty);
    }

    // Advance active quest
    const nextQ = GD.QUESTS.find((x) => !state.completedUnits.includes(x.unit));
    state.activeQuestId = nextQ ? nextQ.id : null;

    // Celebration particles at station
    const st = GD.STATIONS.find((s) => s.id === q.stationId);
    if (state.insideBuildingId) {
      spawnParticles(10 * TILE + 16, 4.1 * TILE + 8, '#69f0ae', 32);
    } else if (st) {
      spawnParticles(st.tx * TILE + 16, st.ty * TILE + 8, '#69f0ae', 32);
    }

    SoundFX.questComplete();
    const rewardText = q.rewardItem ? ` + ${GD.ITEMS[q.rewardItem.id].name}` : '';
    showToast(`🏆 ผ่านเควสหน่วยที่ ${unit}! รับ ${q.rewardBytes} Bytes 🪙${rewardText}`, true);

    updateHUD();
    saveGame();

    // NPC congratulation dialog
    const npc = GD.NPCS.find((n) => n.id === q.npcId);
    if (npc) {
      openDialog({
        speaker: npc.name,
        role: npc.role,
        style: npc.style,
        lines: q.completeDialog,
        onEnd: () => {
          if (state.completedUnits.length >= TOTAL_UNITS) {
            openCertModal();
          }
        }
      });
    }
  }

  // ==================== DIALOG UI ====================
  const dialogOverlay = document.getElementById('dialog-overlay');
  const dialogPortrait = document.getElementById('dialog-portrait');
  const dialogSpeaker = document.getElementById('dialog-speaker');
  const dialogRole = document.getElementById('dialog-role');
  const dialogText = document.getElementById('dialog-text');
  const dialogChoices = document.getElementById('dialog-choices');
  const btnDialogNext = document.getElementById('btn-dialog-next');

  function openDialog(cfg) {
    dialogQueue = { ...cfg, index: 0 };
    dialogOverlay.classList.remove('hidden');
    renderDialogLine();
  }

  function renderDialogLine() {
    if (!dialogQueue) return;
    SoundFX.talk();
    dialogSpeaker.textContent = dialogQueue.speaker;
    dialogRole.textContent = dialogQueue.role || '';

    const pCtx = dialogPortrait.getContext('2d');
    pCtx.imageSmoothingEnabled = true;
    pCtx.clearRect(0, 0, 96, 96);
    const pCanvas = Sprites.getPortrait(dialogQueue.speaker, dialogQueue.style || GD.PLAYER_STYLE);
    pCtx.drawImage(pCanvas, 0, 0, 96, 96);

    dialogText.textContent = dialogQueue.lines[dialogQueue.index];
    dialogChoices.innerHTML = '';

    const isLast = dialogQueue.index >= dialogQueue.lines.length - 1;
    if (isLast && dialogQueue.choices && dialogQueue.choices.length > 0) {
      dialogQueue.choices.forEach((ch) => {
        const b = document.createElement('button');
        b.className = 'wood-btn small-btn' + (ch.primary ? ' primary-btn' : '');
        b.textContent = ch.label;
        b.onclick = ch.action;
        dialogChoices.appendChild(b);
      });
    }
    btnDialogNext.textContent = isLast ? 'ปิด ✕' : 'ต่อไป ▶';
  }

  function advanceDialog() {
    if (!dialogQueue) return;
    if (dialogQueue.index < dialogQueue.lines.length - 1) {
      dialogQueue.index++;
      renderDialogLine();
    } else {
      const cb = dialogQueue.onEnd;
      closeDialog();
      if (cb) cb();
    }
  }

  function closeDialog() {
    dialogQueue = null;
    dialogOverlay.classList.add('hidden');
    clearAllKeys();
    blurActiveInput();
  }

  btnDialogNext.onclick = advanceDialog;

  // ==================== MODAL SYSTEM ====================
  const modalBackdrop = document.getElementById('modal-backdrop');

  function openModal(id) {
    closeDialog();
    clearAllKeys();
    document.querySelectorAll('.modal-window').forEach((m) => m.classList.add('hidden'));
    modalBackdrop.classList.remove('hidden');
    document.getElementById(id).classList.remove('hidden');
    activeModalId = id;
    SoundFX.click();
  }

  function closeAllModals() {
    const wasCodex = activeModalId === 'modal-codex';
    if (activeModalId === 'modal-arcade') stopArcadeLoop();
    modalBackdrop.classList.add('hidden');
    document.querySelectorAll('.modal-window').forEach((m) => m.classList.add('hidden'));
    activeModalId = null;
    clearAllKeys();
    blurActiveInput();

    if (wasCodex && returnToLabUnit !== null) {
      const u = returnToLabUnit;
      returnToLabUnit = null;
      openLabModal(u, isUnitDone(u));
    }
  }

  document.querySelectorAll('.close-btn').forEach((btn) => {
    btn.onclick = () => {
      SoundFX.click();
      closeAllModals();
    };
  });

  // ==================== CODEX (KNOWLEDGE LIBRARY) ====================
  let selectedCodexUnit = 1;

  function openCodexModal(unitId = null) {
    if (unitId) selectedCodexUnit = unitId;
    else {
      const q = getActiveQuest();
      if (q) selectedCodexUnit = q.unit;
    }
    openModal('modal-codex');
    renderCodexSidebar();
    renderCodexReader(selectedCodexUnit);
  }

  function renderCodexSidebar(filter = '') {
    const list = document.getElementById('codex-unit-list');
    list.innerHTML = '';
    const q = filter.trim().toLowerCase();

    window.CODEX_UNITS.forEach((u) => {
      const hay = (u.title + u.eng + u.summary + u.commands + u.bullets.join(' ')).toLowerCase();
      if (q && !hay.includes(q)) return;

      const done = isUnitDone(u.id);
      const btn = document.createElement('button');
      btn.className = 'codex-unit-btn' + (u.id === selectedCodexUnit ? ' active' : '');
      btn.innerHTML = `
        <div class="unit-tag">
          <span>${u.code}</span>
          <span>${done ? '✅ ผ่านแล้ว' : '📘 เรียนรู้'}</span>
        </div>
        <div class="unit-name">${u.title}</div>
      `;
      btn.onclick = () => {
        SoundFX.click();
        selectedCodexUnit = u.id;
        renderCodexSidebar(filter);
        renderCodexReader(u.id);
      };
      list.appendChild(btn);
    });
  }

  function renderCodexReader(unitId) {
    const u = window.CODEX_UNITS.find((x) => x.id === unitId) || window.CODEX_UNITS[0];
    const reader = document.getElementById('codex-reader');
    const done = isUnitDone(u.id);
    const quizSolved = state.solvedCodexQuizzes.includes(u.id);

    const tableHtml = u.table
      ? `<div class="codex-section">
          <h4>📊 ตารางสรุปเปรียบเทียบสำคัญ</h4>
          <table class="codex-table">
            <thead><tr>${u.table.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${u.table.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>`
      : '';

    reader.innerHTML = `
      <h3>${u.code}: ${u.title}</h3>
      <div class="codex-meta-row">
        <span class="codex-badge">${u.eng}</span>
        <span class="codex-badge">📍 ${u.location}</span>
        <span class="codex-badge ${done ? 'done' : ''}">${done ? '✅ ผ่านเควสปฏิบัติแล้ว' : '⏳ รอทำเควสในหมู่บ้าน'}</span>
      </div>
      <div class="codex-section">
        <h4>📝 สาระสำคัญของบทเรียน</h4>
        <p style="margin-bottom:8px;">${u.summary}</p>
        <ul>${u.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
      </div>
      ${tableHtml}
      <div class="codex-section">
        <h4>💻 คลังคำสั่งปฏิบัติการจริง (Command Cheatsheet)</h4>
        <div class="code-block">${u.commands.replace(/</g, '&lt;')}</div>
      </div>
      <div class="codex-section exam-tip">
        <h4>💡 เกร็ดความรู้เตรียมสอบ ปวช.</h4>
        <p>${u.examTip}</p>
      </div>
      <div class="codex-section">
        <h4>🧠 แบบฝึกหัดทบทวนท้ายบท ${quizSolved ? '(✅ รับรางวัลแล้ว +20 Bytes)' : '(ตอบถูกได้ +20 Bytes 🪙)'}</h4>
        <p style="font-weight:600;margin-bottom:8px;">${u.quiz.q}</p>
        <div id="codex-quiz-opts" style="display:flex;flex-direction:column;gap:6px;"></div>
        <div id="codex-quiz-fb" class="lab-feedback hidden" style="margin-top:8px;"></div>
      </div>
    `;

    const optsWrap = reader.querySelector('#codex-quiz-opts');
    const fb = reader.querySelector('#codex-quiz-fb');
    u.quiz.options.forEach((opt, oi) => {
      const b = document.createElement('button');
      b.className = 'wood-btn small-btn';
      b.style.textAlign = 'left';
      b.textContent = opt;
      b.onclick = () => {
        if (oi === u.quiz.answer) {
          fb.className = 'lab-feedback ok';
          fb.classList.remove('hidden');
          if (!state.solvedCodexQuizzes.includes(u.id)) {
            state.solvedCodexQuizzes.push(u.id);
            state.bytes += 20;
            updateHUD();
            saveGame();
            fb.textContent = '✅ ถูกต้อง! เก่งมาก รับโบนัสอ่านทบทวน +20 Bytes 🪙';
          } else {
            fb.textContent = '✅ ถูกต้อง! ทบทวนได้แม่นยำมาก';
          }
          SoundFX.pickup();
        } else {
          fb.className = 'lab-feedback err';
          fb.classList.remove('hidden');
          fb.textContent = '❌ ยังไม่ถูก ลองอ่านสรุปด้านบนอีกครั้งแล้วตอบใหม่ได้เลย!';
          SoundFX.error();
        }
      };
      optsWrap.appendChild(b);
    });
  }

  document.getElementById('codex-search').addEventListener('input', (e) => {
    renderCodexSidebar(e.target.value);
  });

  function warpToTile(tx, ty, label) {
    state.insideBuildingId = null;
    state.player.x = tx * TILE;
    state.player.y = ty * TILE;
    state.player.dir = 'up';
    doorCooldown = 0.5;
    closeAllModals();
    SoundFX.useItem();
    spawnParticles(state.player.x + 16, state.player.y + 16, '#5ce1e6', 24);
    showToast(`✨ วาร์ปมายังหน้าอาคาร "${label}" เรียบร้อย! (กด E ที่ประตูเพื่อเข้าสู่อาคาร)`, true);
    updateHUD();
    saveGame();
  }

  // ==================== QUEST JOURNAL MODAL (18 WEEKS) ====================
  function openQuestsModal() {
    openModal('modal-quests');
    const wrap = document.getElementById('quest-list-container');
    wrap.innerHTML = '';

    GD.QUESTS.forEach((q) => {
      const done = isUnitDone(q.unit);
      const isNow = state.activeQuestId === q.id;
      const cls = done ? 'completed' : isNow ? 'active' : 'locked';
      const statusHtml = done
        ? '<span class="quest-status-pill done">✅ สำเร็จแล้ว</span>'
        : isNow
        ? '<span class="quest-status-pill now">📌 สัปดาห์ปัจจุบัน</span>'
        : '<span class="quest-status-pill lock">📅 สัปดาห์ที่ ' + q.unit + '</span>';

      const bld = GD.BUILDINGS.find((b) => b.units.includes(q.unit));
      const card = document.createElement('div');
      card.className = 'quest-card ' + cls;
      card.innerHTML = `
        <div>
          <div style="font-weight:700;font-size:15px;">${q.title}</div>
          <div style="font-size:13px;color:#5c381c;margin:2px 0;">${q.summary}</div>
          <div style="font-size:12px;color:#2e6b3e;">🧭 ${q.directionHint} • รางวัล ${q.rewardBytes} Bytes 🪙</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0;">
          ${statusHtml}
          <div style="display:flex;gap:5px;">
            ${bld ? '<button class="wood-btn small-btn primary-btn enter-jump" title="เข้าสู่ห้องปฏิบัติการในอาคารนี้ทันที">🏠 เข้าอาคาร</button>' : ''}
            ${bld ? '<button class="wood-btn small-btn warp-jump" title="วาร์ปไปหน้าอาคารนี้">📍 หน้าบ้าน</button>' : ''}
            <button class="wood-btn small-btn codex-jump">📖 คู่มือ</button>
          </div>
        </div>
      `;
      card.querySelector('.codex-jump').onclick = () => openCodexModal(q.unit);
      const eb = card.querySelector('.enter-jump');
      if (eb && bld) eb.onclick = () => enterBuilding(bld.id);
      const wb = card.querySelector('.warp-jump');
      if (wb && bld) wb.onclick = () => warpToTile(bld.tx + Math.floor(bld.tw / 2), bld.ty + bld.th, bld.shortName);
      wrap.appendChild(card);
    });
  }

  // ==================== LAB MODAL ====================
  function openLabModal(unit, isReplay = false) {
    currentLabUnit = unit;
    const u = window.CODEX_UNITS.find((x) => x.id === unit);
    document.getElementById('lab-title').textContent = `🖥️ แล็บปฏิบัติการ ${u.code}: ${u.title}`;
    document.getElementById('lab-subtitle').textContent = isReplay
      ? 'โหมดฝึกทบทวนปฏิบัติการ (ทำสำเร็จรับโบนัส +25 Bytes)'
      : 'ผ่านภารกิจนี้เพื่อเปิดระบบเซิร์ฟเวอร์ให้กลับมา Online 🟢';
    document.getElementById('btn-lab-codex-hint').classList.remove('hidden');

    openModal('modal-lab');
    const body = document.getElementById('lab-body');
    Labs.renderLab(unit, body, () => completeUnitQuest(unit, isReplay));
  }

  document.getElementById('btn-lab-codex-hint').onclick = () => {
    returnToLabUnit = currentLabUnit;
    openCodexModal(currentLabUnit);
  };

  // ==================== IT SHOP MODAL ====================
  function openShopModal() {
    openModal('modal-shop');
    renderShop();
  }

  function renderShop() {
    document.getElementById('shop-bytes-display').textContent = `${state.bytes} Bytes 🪙`;
    const grid = document.getElementById('shop-items-grid');
    grid.innerHTML = '';

    const shopIds = ['admin_coffee', 'packet_kit', 'log_lens', 'lan_cable', 'iso_usb', 'raid_toolkit', 'win_license'];
    shopIds.forEach((id) => {
      const item = GD.ITEMS[id];
      if (!item) return;
      const card = document.createElement('div');
      card.className = 'shop-card';

      const top = document.createElement('div');
      top.className = 'shop-card-top';
      const ic = document.createElement('canvas');
      ic.width = 32;
      ic.height = 32;
      ic.getContext('2d').drawImage(Sprites.getItemIcon(id), 0, 0);
      top.appendChild(ic);
      const titleBox = document.createElement('div');
      titleBox.innerHTML = `<div style="font-weight:700;font-size:14px;">${item.name}</div><div style="font-size:12px;color:#9e5b00;font-weight:700;">${item.price} Bytes 🪙</div>`;
      top.appendChild(titleBox);

      const desc = document.createElement('div');
      desc.className = 'shop-desc';
      desc.textContent = item.desc;

      const buyBtn = document.createElement('button');
      buyBtn.className = 'wood-btn small-btn primary-btn';
      buyBtn.textContent = `ซื้อ (${item.price} 🪙)`;
      buyBtn.onclick = () => {
        if (state.bytes < item.price) {
          SoundFX.error();
          showToast('❌ เหรียญ Bytes ไม่พอ! ทำเควสหรือตอบแบบฝึกหัดในคลังเนื้อหาเพื่อรับ Bytes เพิ่มนะ');
          return;
        }
        state.bytes -= item.price;
        addItem(id, 1);
        SoundFX.pickup();
        showToast(`🛒 ซื้อ ${item.name} สำเร็จ!`, true);
        updateHUD();
        renderShop();
      };

      card.appendChild(top);
      card.appendChild(desc);
      card.appendChild(buyBtn);
      grid.appendChild(card);
    });
  }

  // ==================== WORLD MAP MODAL (4x MAP + CLICK-TO-WARP!) ====================
  function openMapModal() {
    openModal('modal-map');
    const mc = document.getElementById('world-map-canvas');
    const mctx = mc.getContext('2d');
    const s = 8; // 84 * 8 = 672, 54 * 8 = 432
    mc.width = GD.MAP_W * s;
    mc.height = GD.MAP_H * s;
    mc.style.cursor = 'pointer';
    mctx.imageSmoothingEnabled = false;

    for (let y = 0; y < GD.MAP_H; y++) {
      for (let x = 0; x < GD.MAP_W; x++) {
        const t = tileMap[y][x];
        mctx.fillStyle =
          t === 'water' ? '#3b95c4' :
          t === 'path' ? '#d7b278' :
          t === 'stone' ? '#b9b4a8' :
          t === 'bridge' ? '#9c6232' :
          t === 'soil' ? '#8b5a34' : '#6db04d';
        mctx.fillRect(x * s, y * s, s, s);
      }
    }

    // Zone Quadrant Labels
    mctx.fillStyle = 'rgba(255,255,255,0.68)';
    mctx.font = 'bold 11px Kanit, sans-serif';
    mctx.textAlign = 'left';
    mctx.fillText('โซน 1: พื้นฐาน (ส.1–5)', 12, 16);
    mctx.fillText('โซน 2: เครือข่าย (ส.6–10)', 350, 16);
    mctx.fillText('โซน 3: แอป & Windows (ส.11–14)', 12, 424);
    mctx.fillText('โซน 4: มั่นคง & Log (ส.15–18)', 350, 424);

    // Town Scenery & Store Buildings on Map
    if (GD.SCENERY_BUILDINGS) {
      GD.SCENERY_BUILDINGS.forEach((sb) => {
        mctx.fillStyle = sb.roofColor;
        mctx.fillRect(sb.tx * s, sb.ty * s, sb.tw * s, sb.th * s);
        mctx.strokeStyle = '#fde047';
        mctx.lineWidth = 1.5;
        mctx.strokeRect(sb.tx * s, sb.ty * s, sb.tw * s, sb.th * s);
        mctx.fillStyle = '#fff';
        mctx.font = 'bold 8.5px Kanit, sans-serif';
        mctx.textAlign = 'center';
        mctx.fillText(sb.shortName, (sb.tx + sb.tw / 2) * s, (sb.ty + sb.th / 2 + 0.4) * s);
      });
    }

    // Quest Buildings
    GD.BUILDINGS.forEach((b) => {
      const online = isBuildingOnline(b);
      mctx.fillStyle = b.roofColor;
      mctx.fillRect(b.tx * s, b.ty * s, b.tw * s, b.th * s);
      mctx.strokeStyle = online ? '#5cff7d' : '#ff4d4d';
      mctx.lineWidth = 2;
      mctx.strokeRect(b.tx * s, b.ty * s, b.tw * s, b.th * s);

      mctx.fillStyle = '#fff';
      mctx.font = 'bold 9px Kanit, sans-serif';
      mctx.textAlign = 'center';
      mctx.fillText(b.shortName, (b.tx + b.tw / 2) * s, (b.ty + b.th / 2 + 0.4) * s);
    });

    // Active quest target highlight
    const q = getActiveQuest();
    if (q) {
      const st = GD.STATIONS.find((x) => x.id === q.stationId);
      if (st) {
        mctx.strokeStyle = '#ffe033';
        mctx.lineWidth = 3;
        mctx.beginPath();
        mctx.arc(st.tx * s + 4, st.ty * s + 4, 14, 0, Math.PI * 2);
        mctx.stroke();
      }
    }

    // Connected Classmates (Sky-Blue markers on Map!)
    if (window.Multiplayer) {
      Multiplayer.getPeers().forEach((peer) => {
        const fx = (peer.rx / TILE) * s + 4;
        const fy = (peer.ry / TILE) * s + 4;
        mctx.fillStyle = '#38bdf8';
        mctx.beginPath();
        mctx.arc(fx, fy, 4.5, 0, Math.PI * 2);
        mctx.fill();
        mctx.strokeStyle = '#0c4a6e';
        mctx.lineWidth = 1.5;
        mctx.stroke();
      });
    }

    // Player marker
    const ptx = (state.player.x / TILE) * s + 4;
    const pty = (state.player.y / TILE) * s + 4;
    mctx.fillStyle = '#ff2e2e';
    mctx.beginPath();
    mctx.arc(ptx, pty, 5.5, 0, Math.PI * 2);
    mctx.fill();
    mctx.strokeStyle = '#fff';
    mctx.lineWidth = 2;
    mctx.stroke();

    // Click on Map Canvas to Warp straight to any Building!
    mc.onclick = (ev) => {
      const rect = mc.getBoundingClientRect();
      const mx = ((ev.clientX - rect.left) / rect.width) * mc.width;
      const my = ((ev.clientY - rect.top) / rect.height) * mc.height;
      const tx = mx / s;
      const ty = my / s;
      const hit = GD.BUILDINGS.find(
        (b) => tx >= b.tx - 1 && tx <= b.tx + b.tw + 1 && ty >= b.ty - 1 && ty <= b.ty + b.th + 1
      );
      const hitScenery = !hit && GD.SCENERY_BUILDINGS && GD.SCENERY_BUILDINGS.find(
        (sb) => tx >= sb.tx - 1 && tx <= sb.tx + sb.tw + 1 && ty >= sb.ty - 1 && ty <= sb.ty + sb.th + 1
      );
      if (hit) {
        warpToTile(hit.warpX, hit.warpY, hit.shortName);
      } else if (hitScenery) {
        warpToTile(hitScenery.tx + Math.floor(hitScenery.tw / 2), hitScenery.ty + hitScenery.th + 1, hitScenery.shortName);
      } else {
        showToast('💡 คลิกที่อาคารหรือร้านค้าใดก็ได้บนแผนที่เพื่อวาร์ปไปยังหน้าร้าน/ห้องแล็บนั้นทันที!');
      }
    };

    const serverBuildings = GD.BUILDINGS.filter((b) => !b.alwaysOnline);
    const legendEl = document.getElementById('map-legend');
    legendEl.innerHTML = `
      <span class="legend-item">🔴 คุณ</span>
      <span class="legend-item">🟡 เควสปัจจุบัน</span>
      <span class="legend-item">🟢 Online (${serverBuildings.filter((b) => isBuildingOnline(b)).length}/${serverBuildings.length})</span>
      <span class="legend-item">✨ <strong>คลิกที่อาคารบนแผนที่เพื่อวาร์ปด่วน!</strong></span>
      <div style="width:100%;display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-top:4px;">
        <button class="wood-btn small-btn" id="warp-z1">🏠 โซน 1 (ส.1–5)</button>
        <button class="wood-btn small-btn" id="warp-z2">🌐 โซน 2 (ส.6–10)</button>
        <button class="wood-btn small-btn" id="warp-z3">🪟 โซน 3 (ส.11–14)</button>
        <button class="wood-btn small-btn" id="warp-z4">🛡️ โซน 4 (ส.15–18)</button>
        <button class="wood-btn small-btn primary-btn" id="warp-plaza">🏪 จัตุรัสกลาง</button>
      </div>
    `;
    legendEl.querySelector('#warp-z1').onclick = () => warpToTile(18, 10, 'โซน 1: หมู่บ้านพื้นฐาน');
    legendEl.querySelector('#warp-z2').onclick = () => warpToTile(49, 10, 'โซน 2: ย่านบริการเครือข่าย');
    legendEl.querySelector('#warp-z3').onclick = () => warpToTile(20, 36, 'โซน 3: ย่านแอป & Windows');
    legendEl.querySelector('#warp-z4').onclick = () => warpToTile(51, 36, 'โซน 4: ป้อมความมั่นคง');
    legendEl.querySelector('#warp-plaza').onclick = () => warpToTile(41, 26, 'จัตุรัสกลาง Server Valley');
  }

  // ==================== CERTIFICATE & MASTER QUIZ ====================
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatThaiDate() {
    const d = new Date();
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`;
  }

  function openCertModal() {
    openModal('modal-cert');
    const done = state.completedUnits.length;
    const pct = Math.round((done / TOTAL_UNITS) * 100);
    const quizStr = state.bestMasterQuiz
      ? `${state.bestMasterQuiz.score} / ${state.bestMasterQuiz.total} คะแนน`
      : 'ยังไม่ได้ทดสอบ';
    const p = state.profile || DEFAULT_PROFILE;
    const isFull = done >= TOTAL_UNITS;

    document.getElementById('cert-body').innerHTML = `
      <div id="cert-printable" class="cert-frame">
        <div style="font-size:36px;margin-bottom:4px;">${isFull ? '🏆🎓✨' : '📜🔧'}</div>
        <div class="cert-college">${escapeHtml(p.collegeName)}</div>
        <h3>${isFull ? 'เกียรติบัตรผู้ดูแลระบบ Server Valley' : 'ใบรับรองความก้าวหน้าการเรียนรู้ Server Valley'}</h3>
        <p style="font-size:14px;color:#5c381c;">ขอมอบให้ไว้เพื่อแสดงว่า</p>
        <div class="cert-student">${escapeHtml(p.studentName)}</div>
        <div class="cert-class">${escapeHtml(p.studentClass)}</div>
        <p style="font-size:14px;color:#381e0c;line-height:1.6;">
          ${isFull
            ? `ได้ผ่านการฝึกปฏิบัติครบทั้ง ${TOTAL_UNITS} หน่วยการเรียนรู้ (Linux Server &amp; Windows Server)<br/>ในรายวิชา <strong>ระบบปฏิบัติการเครื่องแม่ข่ายเบื้องต้น (ระดับ ปวช.)</strong> ด้วยผลการฟื้นฟูระบบ 100%`
            : `กำลังศึกษาและฝึกปฏิบัติรายวิชา <strong>ระบบปฏิบัติการเครื่องแม่ข่ายเบื้องต้น (ระดับ ปวช.)</strong><br/>ผ่านแล้ว ${done} จาก ${TOTAL_UNITS} หน่วยการเรียนรู้ (Linux Server &amp; Windows Server)`}
        </p>
        <div class="cert-stats">
          <div class="cert-stat-pill">📊 ความคืบหน้า: ${pct}% (${done}/${TOTAL_UNITS} หน่วย)</div>
          <div class="cert-stat-pill">🎖️ ยศ: ${getPlayerRank()}</div>
          <div class="cert-stat-pill">📝 Master Quiz สูงสุด: ${quizStr}</div>
        </div>
        <p style="font-size:13px;color:#6e4526;margin-top:6px;">ให้ไว้ ณ วันที่ ${formatThaiDate()}</p>
        <div class="cert-sign-row">
          <div class="cert-sign-block">
            <div class="cert-sign-line"></div>
            <div>( ${escapeHtml(p.instructorName)} )</div>
            <div style="font-size:12px;color:#6e4526;">ครูผู้สอนรายวิชาฯ</div>
          </div>
          <div class="cert-sign-block">
            <div class="cert-sign-line"></div>
            <div>( ผู้ใหญ่บ้านลุงแอดมิน )</div>
            <div style="font-size:12px;color:#6e4526;">Server Valley Academy</div>
          </div>
        </div>
      </div>

      <div class="no-print" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:14px;">
        <button id="cert-print-btn" class="wood-btn primary-btn">🖨️ พิมพ์ / บันทึกเกียรติบัตร (PDF)</button>
        <button id="cert-quiz-btn" class="wood-btn">🏆 ทำแบบทดสอบรวม (${window.MASTER_QUIZ_BANK.length} ข้อ)</button>
      </div>

      <div class="cert-edit-panel no-print">
        <h4 style="font-size:14px;margin-bottom:8px;">✏️ แก้ไขข้อมูลบนเกียรติบัตร (ชื่อนักเรียน / วิทยาลัย / ครูผู้สอน)</h4>
        <div class="setup-grid">
          <div class="setup-field">
            <label>ชื่อ-นามสกุลนักเรียน</label>
            <input id="cert-in-name" class="pixel-input" value="${escapeHtml(p.studentName)}" />
          </div>
          <div class="setup-field">
            <label>ระดับชั้น / ห้อง / รหัส</label>
            <input id="cert-in-class" class="pixel-input" value="${escapeHtml(p.studentClass)}" />
          </div>
          <div class="setup-field">
            <label>ชื่อวิทยาลัย / สถานศึกษา</label>
            <input id="cert-in-college" class="pixel-input" value="${escapeHtml(p.collegeName)}" />
          </div>
          <div class="setup-field">
            <label>ชื่อครูผู้สอน</label>
            <input id="cert-in-instructor" class="pixel-input" value="${escapeHtml(p.instructorName)}" />
          </div>
        </div>
        <button id="cert-save-info" class="wood-btn small-btn primary-btn" style="margin-top:10px;">💾 บันทึกและอัปเดตเกียรติบัตร</button>
      </div>
    `;
    document.getElementById('cert-print-btn').onclick = () => window.print();
    document.getElementById('cert-quiz-btn').onclick = openMasterQuiz;
    document.getElementById('cert-save-info').onclick = () => {
      state.profile.studentName = document.getElementById('cert-in-name').value.trim() || DEFAULT_PROFILE.studentName;
      state.profile.studentClass = document.getElementById('cert-in-class').value.trim() || DEFAULT_PROFILE.studentClass;
      state.profile.collegeName = document.getElementById('cert-in-college').value.trim() || DEFAULT_PROFILE.collegeName;
      state.profile.instructorName = document.getElementById('cert-in-instructor').value.trim() || DEFAULT_PROFILE.instructorName;
      saveGame();
      updateHUD();
      SoundFX.pickup();
      showToast('✅ อัปเดตข้อมูลบนเกียรติบัตรเรียบร้อยแล้ว!', true);
      openCertModal();
    };
  }

  function openMasterQuiz() {
    document.getElementById('lab-title').textContent = '🏆 แบบทดสอบประมวลความรู้รวม (Master Quiz ปวช.)';
    document.getElementById('lab-subtitle').textContent = `ครอบคลุมทั้ง ${TOTAL_UNITS} หน่วยการเรียนรู้ (Linux Server & Windows Server)`;
    document.getElementById('btn-lab-codex-hint').classList.add('hidden');
    openModal('modal-lab');

    Labs.renderMasterQuiz(document.getElementById('lab-body'), (score, total) => {
      if (!state.bestMasterQuiz || score > state.bestMasterQuiz.score) {
        state.bestMasterQuiz = { score, total };
      }
      state.bytes += score * 15;
      saveGame();
      updateHUD();
      closeAllModals();
      showToast(`🏆 ทำ Master Quiz ได้ ${score}/${total} คะแนน! รับโบนัส +${score * 15} Bytes 🪙`, true);
    });
  }

  // ==================== HUD & 12-SLOT STARDEW HOTBAR RENDER ====================
  const HOTBAR_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];

  function renderHotbar() {
    const wrap = document.getElementById('hotbar-slots');
    wrap.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const slot = state.inventory[i];
      const div = document.createElement('div');
      div.className = 'hotbar-slot' + (i === state.selectedSlot ? ' selected' : '');
      div.innerHTML = `<span class="slot-key">${HOTBAR_KEYS[i]}</span>`;
      if (slot && GD.ITEMS[slot.id]) {
        const ic = document.createElement('canvas');
        ic.width = 32;
        ic.height = 32;
        ic.getContext('2d').drawImage(Sprites.getItemIcon(slot.id), 0, 0);
        div.appendChild(ic);
        if (slot.qty > 1) {
          const q = document.createElement('span');
          q.className = 'slot-qty';
          q.textContent = slot.qty;
          div.appendChild(q);
        }
        div.title = GD.ITEMS[slot.id].name + ' — ' + GD.ITEMS[slot.id].desc;
      }
      div.onclick = () => {
        SoundFX.click();
        state.selectedSlot = i;
        renderHotbar();
      };
      wrap.appendChild(div);
    }

    const cur = state.inventory[state.selectedSlot];
    const banner = document.getElementById('selected-item-banner');
    const moveHint = controlMode === 'arrows' ? 'ลูกศร เดิน' : controlMode === 'wasd' ? 'WASD เดิน' : 'WASD/ลูกศร เดิน';
    if (cur && GD.ITEMS[cur.id]) {
      const it = GD.ITEMS[cur.id];
      banner.textContent = `🎒 ${it.name} — ${it.type === 'consumable' || it.type === 'utility' ? 'กด [F] ใช้งาน' : 'กด [E] ที่ตู้เซิร์ฟเวอร์'} • ${moveHint} • Shift วิ่ง`;
    } else {
      banner.textContent = `ช่องว่าง • ${moveHint} • [Shift] วิ่งเร็ว • [E] โต้ตอบ • [M] วาร์ปด่วน`;
    }
  }

  function updateHUD() {
    const pct = Math.round((state.completedUnits.length / TOTAL_UNITS) * 100);
    const nameEl = document.getElementById('hud-player-name');
    if (nameEl) nameEl.textContent = ((state.profile && state.profile.studentName) || DEFAULT_PROFILE.studentName) + ' ✏️';
    document.getElementById('hud-rank').textContent = getPlayerRank();
    document.getElementById('hud-uptime-pct').textContent = pct + '%';
    document.getElementById('hud-uptime-fill').style.width = pct + '%';

    // Clock
    const hh = String(Math.floor(state.minutes / 60) % 24).padStart(2, '0');
    const mm = String(Math.floor(state.minutes % 60)).padStart(2, '0');
    document.getElementById('hud-day').textContent = `วันที่ ${state.day} • ฤดูใบไม้ผลิ`;
    document.getElementById('hud-time').textContent = `${hh}:${mm} น.`;
    document.getElementById('hud-weather').textContent = state.minutes >= 18 * 60 ? '🌙' : state.minutes >= 16 * 60 ? '🌇' : '☀️';
    document.getElementById('hud-bytes').textContent = state.bytes;
    document.getElementById('hud-zone').textContent = getZoneName(
      Math.floor((state.player.x + 16) / TILE),
      Math.floor((state.player.y + 16) / TILE)
    );

    // Energy
    const ep = Math.max(0, Math.min(100, Math.round((state.energy / state.maxEnergy) * 100)));
    document.getElementById('energy-fill').style.height = ep + '%';
    document.getElementById('energy-text').textContent = state.energy;

    // Active Quest Tracker
    const q = getActiveQuest();
    if (q) {
      const qBld = getBuildingForUnit(q.unit);
      document.getElementById('tracker-title').textContent = q.title;
      let obj = q.summary;
      if (state.insideBuildingId && qBld && state.insideBuildingId === qBld.id) {
        if (q.requiredItem && !hasItem(q.requiredItem)) {
          obj = `กด [E] เบิก "${GD.ITEMS[q.requiredItem].name}" จากกล่องอุปกรณ์ด้านซ้ายในห้อง แล้วใช้งานตู้เซิร์ฟเวอร์`;
        } else {
          obj = `คุยกับผู้เชี่ยวชาญในห้อง หรือกด [E] ที่ตู้เซิร์ฟเวอร์ด้านขวาเพื่อเริ่มแล็บปฏิบัติการ!`;
        }
        document.getElementById('tracker-direction').textContent = `🏠 ภายใน ${qBld.shortName} • เดินลงประตูด้านล่างเพื่อออกจากอาคาร`;
      } else {
        if (qBld) {
          obj = `เดินไปที่หน้าประตู "${qBld.shortName}" แล้วกด [E] (หรือเดินเข้าประตู) เพื่อเข้าไปรับเควสและทำแล็บด้านในบ้าน`;
        }
        document.getElementById('tracker-direction').textContent = '🧭 ' + q.directionHint;
      }
      document.getElementById('tracker-objective').textContent = obj;
    } else {
      document.getElementById('tracker-title').textContent = `🏆 ครบทั้ง ${TOTAL_UNITS} หน่วยการเรียนรู้แล้ว!`;
      document.getElementById('tracker-objective').textContent = 'Server Valley ออนไลน์ 100%! เข้าไปทบทวนแล็บในอาคารแต่ละหลังหรือทำ Master Quiz ได้เลย';
      document.getElementById('tracker-direction').textContent = '🎓 กดปุ่ม 🎓 เพื่อดูและพิมพ์เกียรติบัตร ปวช.';
    }
  }

  // ==================== UPDATE & RENDER LOOP ====================
  function update(dt) {
    tick++;
    if (doorCooldown > 0) doorCooldown = Math.max(0, doorCooldown - dt);

    // Gentle Stardew clock progression (1 game minute every ~1.2 real seconds when roaming)
    if (state.started && !activeModalId && !dialogQueue) {
      state.minutes += dt * 0.9;
      if (state.minutes >= 22 * 60 + 30) {
        state.day += 1;
        state.minutes = 7 * 60;
        state.energy = Math.min(state.maxEnergy, state.energy + 35);
        showToast(`🌅 เช้าวันใหม่ วันที่ ${state.day} แล้ว! พลังงานฟื้นคืนบางส่วน`, true);
        saveGame();
      }
      if (state.speedBoostTimer > 0) {
        state.speedBoostTimer = Math.max(0, state.speedBoostTimer - dt);
      }
      if (teacherGodSpeed) {
        state.energy = state.maxEnergy;
      }

      // Movement (supports WASD, Arrow keys, or Both depending on controlMode)
      const allowWasd = controlMode === 'both' || controlMode === 'wasd';
      const allowArrows = controlMode === 'both' || controlMode === 'arrows';
      let dx = 0;
      let dy = 0;
      if ((allowWasd && keys['KeyW']) || (allowArrows && keys['ArrowUp']) || touchDir.up) dy -= 1;
      if ((allowWasd && keys['KeyS']) || (allowArrows && keys['ArrowDown']) || touchDir.down) dy += 1;
      if ((allowWasd && keys['KeyA']) || (allowArrows && keys['ArrowLeft']) || touchDir.left) dx -= 1;
      if ((allowWasd && keys['KeyD']) || (allowArrows && keys['ArrowRight']) || touchDir.right) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;
        const sprinting = keys['ShiftLeft'] || keys['ShiftRight'];
        const rawBase = state.speedBoostTimer > 0 ? 215 : 155;
        const baseSpeed = teacherGodSpeed ? rawBase * 1.85 : rawBase;
        const speed = (sprinting ? baseSpeed * 1.48 : baseSpeed) * dt;

        if (Math.abs(dx) > Math.abs(dy)) {
          state.player.dir = dx < 0 ? 'left' : 'right';
        } else {
          state.player.dir = dy < 0 ? 'up' : 'down';
        }

        const nx = state.player.x + dx * speed;
        if (!isBlockedPixel(nx, state.player.y)) state.player.x = nx;
        const ny = state.player.y + dy * speed;
        if (!isBlockedPixel(state.player.x, ny)) state.player.y = ny;

        // Auto-Enter Building when walking up into a building's front door threshold, or Auto-Exit when walking down onto exit mat
        if (doorCooldown <= 0) {
          if (state.insideBuildingId) {
            if (dy > 0 && state.player.y > 8.65 * TILE && Math.abs((state.player.x + 16) - 8 * TILE) < 34) {
              exitBuilding();
              return;
            }
          } else if (dy < 0) {
            const px = state.player.x + 16;
            const py = state.player.y + 24;
            const hitBld = GD.BUILDINGS.find((b) => {
              const doorWx = (b.tx + b.tw / 2) * TILE;
              const doorWy = (b.ty + b.th) * TILE;
              return Math.abs(px - doorWx) < 20 && Math.abs(py - doorWy) < 11;
            });
            if (hitBld) {
              enterBuilding(hitBld.id);
              return;
            }
          }
        }

        state.player.animTimer += dt * (sprinting ? 1.45 : 1);
        if (state.player.animTimer > 0.14) {
          state.player.animTimer = 0;
          state.player.frame = (state.player.frame + 1) % 4;
        }
        stepSoundCooldown -= dt;
        if (stepSoundCooldown <= 0) {
          SoundFX.step();
          if (sprinting || state.speedBoostTimer > 0) {
            particles.push({
              x: state.player.x + 14 + (Math.random() - 0.5) * 8,
              y: state.player.y + 30,
              vx: -dx * 0.5 + (Math.random() - 0.5) * 0.4,
              vy: -0.4 - Math.random() * 0.3,
              life: 16,
              color: '#e8d8b5',
              size: 4
            });
          }
          stepSoundCooldown = sprinting ? 0.2 : state.speedBoostTimer > 0 ? 0.24 : 0.32;
        }
      } else {
        state.player.frame = 0;
      }

      if (tick % 20 === 0) updateHUD();
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Ambient fireflies / dust motes scaled for 4x world
    if (fireflies.length < 64) {
      fireflies.push({
        x: Math.random() * GD.MAP_W * TILE,
        y: Math.random() * GD.MAP_H * TILE,
        phase: Math.random() * Math.PI * 2
      });
    }
    fireflies.forEach((f) => {
      f.phase += 0.03;
      f.x += Math.cos(f.phase) * 0.25;
      f.y += Math.sin(f.phase * 0.8) * 0.2;
    });

    // Daytime 16-bit fluttering butterflies
    if (butterflies.length < 28) {
      const cols = ['#ffe066', '#ff99c8', '#80e5ff', '#ffffff'];
      butterflies.push({
        x: Math.random() * GD.MAP_W * TILE,
        y: Math.random() * GD.MAP_H * TILE,
        phase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.5,
        color: cols[butterflies.length % cols.length]
      });
    }
    butterflies.forEach((b) => {
      b.phase += 0.22;
      b.x += b.vx + Math.sin(b.phase * 0.3) * 0.4;
      b.y += b.vy + Math.cos(b.phase * 0.25) * 0.3;
      if (b.x < 32) b.x = GD.MAP_W * TILE - 64;
      if (b.x > GD.MAP_W * TILE - 32) b.x = 64;
      if (b.y < 32) b.y = GD.MAP_H * TILE - 64;
      if (b.y > GD.MAP_H * TILE - 32) b.y = 64;
    });

    // Gentle drifting cherry blossom petals
    if (petals.length < 40) {
      petals.push({
        x: Math.random() * GD.MAP_W * TILE,
        y: Math.random() * GD.MAP_H * TILE,
        phase: Math.random() * 6.28,
        spd: 0.25 + Math.random() * 0.35
      });
    }
    petals.forEach((pt) => {
      pt.phase += 0.04;
      pt.x += pt.spd + Math.sin(pt.phase) * 0.35;
      pt.y += pt.spd * 0.65;
      if (pt.x > GD.MAP_W * TILE) pt.x = 0;
      if (pt.y > GD.MAP_H * TILE) pt.y = 0;
    });

    // Swimming Koi Fish in lakes & pond
    KOI_FISH.forEach((f) => {
      f.x += f.vx;
      if (f.x < f.minX || f.x > f.maxX) f.vx *= -1;
    });

    // Walking / Patrol AI for Outdoor Town NPCs (pause politely when player is nearby or talking)
    if (GD.TOWN_NPCS && !state.insideBuildingId) {
      GD.TOWN_NPCS.forEach((tn) => {
        if (typeof tn.wx !== 'number') {
          tn.wx = tn.tx * TILE;
          tn.wy = tn.ty * TILE;
          tn.wpIdx = 0;
          tn.pauseTimer = 0.8 + Math.random() * 1.5;
          tn.frame = 0;
          tn.animTimer = 0;
        }
        if (!Array.isArray(tn.patrol) || tn.patrol.length < 2) {
          tn.frame = 0;
          return;
        }
        const dPlayer = Math.hypot((state.player.x + 16) - (tn.wx + 16), (state.player.y + 16) - (tn.wy + 16));
        if (dialogQueue || dPlayer < 54) {
          tn.frame = 0;
          return;
        }
        if (tn.pauseTimer > 0) {
          tn.pauseTimer -= dt;
          tn.frame = 0;
          return;
        }
        const wp = tn.patrol[tn.wpIdx % tn.patrol.length];
        const targetX = wp.tx * TILE;
        const targetY = wp.ty * TILE;
        const dx = targetX - tn.wx;
        const dy = targetY - tn.wy;
        const dist = Math.hypot(dx, dy);
        const spd = (tn.speed || 38) * dt;
        if (dist <= spd + 1) {
          tn.wx = targetX;
          tn.wy = targetY;
          tn.wpIdx = (tn.wpIdx + 1) % tn.patrol.length;
          tn.pauseTimer = 1.4 + Math.random() * 1.8;
          tn.frame = 0;
        } else {
          tn.wx += (dx / dist) * spd;
          tn.wy += (dy / dist) * spd;
          if (Math.abs(dx) > Math.abs(dy)) tn.dir = dx < 0 ? 'left' : 'right';
          else tn.dir = dy < 0 ? 'up' : 'down';
          tn.animTimer = (tn.animTimer || 0) + dt;
          if (tn.animTimer > 0.17) {
            tn.animTimer = 0;
            tn.frame = ((tn.frame || 0) + 1) % 4;
          }
        }
      });
    }

    // Smoothly interpolate connected classmates
    if (window.Multiplayer) {
      Multiplayer.stepInterpolation();
      if (tick % 30 === 0 && activeModalId === 'modal-multiplayer') {
        refreshActiveMpTab();
      }
    }
  }

  function render() {
    const vw = canvas.width;
    const vh = canvas.height;
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, vw, vh);

    // Camera zoom (cozy Stardew scale)
    const zoom = vw < 700 ? 1.15 : 1.45;
    const viewW = vw / zoom;
    const viewH = vh / zoom;
    const activeQ = getActiveQuest();
    const nightFactor = state.minutes >= 18 * 60 ? Math.min(1, (state.minutes - 18 * 60) / 150) : 0;

    // ==================== MODE A: INSIDE A 2.5D BUILDING INTERIOR ROOM ====================
    if (state.insideBuildingId) {
      const b = getBuildingById(state.insideBuildingId);
      const layout = getInteriorLayout(state.insideBuildingId);
      if (b && layout) {
        // Dark diorama surrounding void
        const bgGrad = ctx.createRadialGradient(vw / 2, vh / 2, 80, vw / 2, vh / 2, Math.max(vw, vh) * 0.7);
        bgGrad.addColorStop(0, '#1e293b');
        bgGrad.addColorStop(1, '#090d16');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, vw, vh);

        // Center the 512x384 (16x12 tiles) interior diorama room
        const camX = 256 - viewW / 2;
        const camY = 186 - viewH / 2;

        ctx.save();
        ctx.scale(zoom, zoom);
        ctx.translate(-Math.floor(camX), -Math.floor(camY));

        // 1. Draw 2.5D Simulated Room Environment (Walls, Themed Floor, Windows, Whiteboard, Desks, Clusters)
        Sprites.drawBuildingInterior(ctx, b, isBuildingOnline(b), tick);

        // 2. Y-Sorted Interior Entities (NPC, Server Rack, Supply Crate, Classmates in same room, Player)
        const roomList = [];

        if (layout.supplyItemId && GD.ITEMS[layout.supplyItemId]) {
          const hasIt = hasItem(layout.supplyItemId);
          roomList.push({
            y: layout.supplyPos.y + 22,
            draw: () => {
              Sprites.drawCrate(ctx, layout.supplyPos.x, layout.supplyPos.y, hasIt, tick);
              ctx.fillStyle = 'rgba(20, 10, 4, 0.85)';
              ctx.fillRect(layout.supplyPos.x - 16, layout.supplyPos.y + 26, 64, 13);
              ctx.fillStyle = '#fde68a';
              ctx.font = 'bold 9px Kanit, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('📦 อุปกรณ์แล็บ', layout.supplyPos.x + 16, layout.supplyPos.y + 36);
              if (!hasIt) {
                drawFloatingMarker(ctx, layout.supplyPos.x + 16, layout.supplyPos.y - 8, '!', '#ffd54f');
              }
            }
          });
        }

        if (layout.station) {
          const online = isStationOnline(layout.station);
          roomList.push({
            y: layout.stationPos.y + 28,
            draw: () => {
              Sprites.drawServerRack(ctx, layout.stationPos.x, layout.stationPos.y, online, tick);
              ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
              ctx.fillRect(layout.stationPos.x - 28, layout.stationPos.y + 30, 88, 14);
              ctx.fillStyle = online ? '#86efac' : '#bae6fd';
              ctx.font = 'bold 9.5px Kanit, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(layout.station.name, layout.stationPos.x + 16, layout.stationPos.y + 40);
              drawFloatingMarker(ctx, layout.stationPos.x + 16, layout.stationPos.y - 18, '⚡', '#5ce1e6');
            }
          });
        }

        if (layout.npc) {
          const npc = layout.npc;
          roomList.push({
            y: layout.npcPos.y + 30,
            draw: () => {
              Sprites.drawCharacter(ctx, layout.npcPos.x, layout.npcPos.y - 10, npc.style, 'down', 0, 2, tick + 17);
              ctx.fillStyle = 'rgba(30, 15, 5, 0.86)';
              ctx.fillRect(layout.npcPos.x - 26, layout.npcPos.y + 28, 84, 15);
              ctx.fillStyle = '#fff5d6';
              ctx.font = 'bold 10px Kanit, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(npc.name, layout.npcPos.x + 16, layout.npcPos.y + 39);
              drawFloatingMarker(ctx, layout.npcPos.x + 16, layout.npcPos.y - 15, '!', '#ffcf33');
            }
          });
        }

        // Connected Classmates who are inside the SAME building
        if (window.Multiplayer) {
          const nowMs = Date.now();
          Multiplayer.getPeers().forEach((peer, pi) => {
            if (peer.insideBuildingId !== state.insideBuildingId) return;
            roomList.push({
              y: peer.ry + 32,
              draw: () => {
                const pStyle = {
                  ...GD.PLAYER_STYLE,
                  skin: peer.skin || '#f6cfa6',
                  hair: peer.hair || '#241712',
                  hairStyle: peer.hairStyle || 'short',
                  faceStyle: peer.faceStyle || 'smile',
                  glasses: peer.faceStyle === 'glasses',
                  shirt: peer.shirt || '#2b6cb0',
                  shirtStyle: peer.shirtStyle || 'jacket',
                  pants: peer.pants || '#2c4969',
                  shoes: peer.shoes || '#5c3317',
                  hat: peer.hat || '',
                  headMiddle: peer.headMiddle || '',
                  headLower: peer.headLower || ''
                };
                if (peer.isTeacher) drawTeacherAdminAura(ctx, peer.rx + 16, peer.ry + 28, tick);
                Sprites.drawCharacter(ctx, peer.rx, peer.ry - 6, pStyle, peer.dir || 'down', peer.frame || 0, 2, tick + pi * 29);
                if (peer.isTeacher) drawTeacherCrownBadge(ctx, peer.rx + 16, peer.ry - 14, tick);
                const label = (peer.isTeacher ? '👑 ครู ' : '') + (peer.name || 'เพื่อนร่วมห้อง');
                ctx.font = 'bold 10px Kanit, sans-serif';
                const nw = Math.max(58, ctx.measureText(label).width + 14);
                ctx.fillStyle = peer.isTeacher ? 'rgba(120, 53, 15, 0.92)' : 'rgba(12, 54, 78, 0.85)';
                ctx.fillRect(peer.rx + 16 - nw / 2, peer.ry + 29, nw, 15);
                ctx.strokeStyle = peer.isTeacher ? '#fde047' : '#5ce1e6';
                ctx.lineWidth = peer.isTeacher ? 1.5 : 1;
                ctx.strokeRect(peer.rx + 16 - nw / 2, peer.ry + 29, nw, 15);
                ctx.fillStyle = peer.isTeacher ? '#fef9c3' : '#e0fbff';
                ctx.textAlign = 'center';
                ctx.fillText(label, peer.rx + 16, peer.ry + 40);
                if (peer.bubble && peer.bubbleUntil > nowMs) {
                  drawSpeechBubble(ctx, peer.rx + 16, peer.ry - 20, peer.bubble);
                }
              }
            });
          });
        }

        // Local Player inside Room
        roomList.push({
          y: state.player.y + 32,
          draw: () => {
            if (isTeacherAdmin) drawTeacherAdminAura(ctx, state.player.x + 16, state.player.y + 28, tick);
            Sprites.drawCharacter(ctx, state.player.x, state.player.y - 6, GD.PLAYER_STYLE, state.player.dir, state.player.frame, 2, tick);
            if (isTeacherAdmin) {
              drawTeacherCrownBadge(ctx, state.player.x + 16, state.player.y - 14, tick);
              const tLabel = '👑 ครู ' + ((state.profile && state.profile.studentName) || 'ครูผู้สอน');
              ctx.font = 'bold 10px Kanit, sans-serif';
              const nw = Math.max(64, ctx.measureText(tLabel).width + 14);
              ctx.fillStyle = 'rgba(120, 53, 15, 0.92)';
              ctx.fillRect(state.player.x + 16 - nw / 2, state.player.y + 29, nw, 15);
              ctx.strokeStyle = '#fde047';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(state.player.x + 16 - nw / 2, state.player.y + 29, nw, 15);
              ctx.fillStyle = '#fef9c3';
              ctx.textAlign = 'center';
              ctx.fillText(tLabel, state.player.x + 16, state.player.y + 40);
            }
            if (myBubble && myBubbleUntil > Date.now()) {
              drawSpeechBubble(ctx, state.player.x + 16, state.player.y - (isTeacherAdmin ? 22 : 13), myBubble);
            }
          }
        });

        roomList.sort((a, b0) => a.y - b0.y);
        roomList.forEach((r) => r.draw());

        // Floating [E] Prompt inside Room
        if (state.started && !activeModalId && !dialogQueue) {
          const target = findNearestInteractable();
          if (target) {
            const text = `[E] ${target.label}`;
            ctx.font = 'bold 11px Kanit, sans-serif';
            const tw = ctx.measureText(text).width + 14;
            const bx = target.wx - tw / 2;
            const by = target.wy - 42 + Math.sin(tick / 10) * 2;
            ctx.fillStyle = 'rgba(42, 20, 6, 0.92)';
            ctx.fillRect(bx, by, tw, 20);
            ctx.strokeStyle = '#ffd54f';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(bx, by, tw, 20);
            ctx.fillStyle = '#fff8dc';
            ctx.textAlign = 'center';
            ctx.fillText(text, target.wx, by + 14);
          }
        }

        // Particles inside room
        particles.forEach((p) => {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
        return;
      }
    }

    // ==================== MODE B: OUTDOOR 2.5D SERVER VALLEY VILLAGE ====================
    const worldW = GD.MAP_W * TILE;
    const worldH = GD.MAP_H * TILE;

    let camX = state.player.x + 16 - viewW / 2;
    let camY = state.player.y + 16 - viewH / 2;
    camX = Math.max(0, Math.min(Math.max(0, worldW - viewW), camX));
    camY = Math.max(0, Math.min(Math.max(0, worldH - viewH), camY));

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-Math.floor(camX), -Math.floor(camY));

    // Visible tile bounds
    const startX = Math.max(0, Math.floor(camX / TILE) - 1);
    const endX = Math.min(GD.MAP_W - 1, Math.ceil((camX + viewW) / TILE) + 1);
    const startY = Math.max(0, Math.floor(camY / TILE) - 1);
    const endY = Math.min(GD.MAP_H - 1, Math.ceil((camY + viewH) / TILE) + 1);

    // 1. 2.5D Auto-Tiled Ground Tiles
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        Sprites.drawTile(ctx, tileMap[y][x], x, y, x * TILE, y * TILE, tick, tileMap);
      }
    }

    // 1.5 Swimming Koi Fish inside East Lake & South Koi Pond
    KOI_FISH.forEach((f) => {
      if (f.x < camX - 32 || f.x > camX + viewW + 32 || f.y < camY - 32 || f.y > camY + viewH + 32) return;
      const tailWag = Math.sin(tick / 6 + f.x) * 2;
      ctx.fillStyle = 'rgba(12, 42, 68, 0.35)';
      ctx.fillRect(Math.floor(f.x), Math.floor(f.y + 3), 10, 4);
      ctx.fillStyle = f.color;
      ctx.fillRect(Math.floor(f.x), Math.floor(f.y), 8, 4);
      ctx.fillRect(Math.floor(f.vx > 0 ? f.x - 3 : f.x + 8), Math.floor(f.y + 1 + tailWag * 0.4), 3, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(f.vx > 0 ? f.x + 5 : f.x + 1), Math.floor(f.y + 1), 2, 1);
    });

    // 1.6 Subtle Glowing Fiber-Optic Data Pulses streaming along Main Boulevards
    const pulseCount = Math.max(2, Math.min(14, state.completedUnits.length + 2));
    for (let i = 0; i < pulseCount; i++) {
      const hx = ((tick * 1.8 + i * 210) % (GD.MAP_W * TILE));
      const hy = 26.5 * TILE + (i % 2 === 0 ? 4 : 20);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(92, 225, 230, 0.52)' : 'rgba(105, 240, 174, 0.52)';
      ctx.fillRect(Math.floor(hx), Math.floor(hy), 10, 2);
      const vy = ((tick * 1.6 + i * 160) % (GD.MAP_H * TILE));
      const vx = 41.5 * TILE + (i % 2 === 0 ? 4 : 20);
      ctx.fillRect(Math.floor(vx), Math.floor(vy), 2, 10);
    }

    // 2. Y-Sorted Renderables with Viewport Culling for fast 4x Map rendering
    const renderList = [];

    // Grand 2.5D Fast-Travel Warp Board & Retro Arcade Mini-Game Cabinets
    GD.SPECIAL_PROPS.forEach((sp) => {
      if (sp.kind !== 'warp' && sp.kind !== 'arcade') return;
      if (sp.tx < startX - 3 || sp.tx > endX + 3 || sp.ty < startY - 3 || sp.ty > endY + 3) return;
      const wx = sp.tx * TILE;
      const wy = sp.ty * TILE;
      if (sp.kind === 'warp') {
        renderList.push({
          y: wy + 28,
          draw: () => {
            Sprites.drawWarpBoard(ctx, wx, wy, tick);
          }
        });
      } else if (sp.kind === 'arcade') {
        renderList.push({
          y: wy + 29,
          draw: () => {
            Sprites.drawArcadeCabinet(ctx, wx, wy, sp.cabinetColor || '#ec4899', tick);
            drawFloatingMarker(ctx, wx + 16, wy - 26, '🕹️', sp.cabinetColor || '#ec4899');
          }
        });
      }
    });

    // Town Scenery & Store Buildings (Grand 7x4 IT General Store, Café & Bakery, Tech Bookstore, Glass Greenhouse, Red Barn & Silo, Hardware Forge & Villager Cottages!)
    if (GD.SCENERY_BUILDINGS) {
      GD.SCENERY_BUILDINGS.forEach((sb) => {
        if (sb.tx + sb.tw < startX - 2 || sb.tx > endX + 2 || sb.ty + sb.th < startY - 2 || sb.ty > endY + 2) return;
        renderList.push({
          y: (sb.ty + sb.th) * TILE,
          draw: () => Sprites.drawSceneryBuilding(ctx, sb, tick)
        });
      });
    }

    // Central Plaza Animated Well / Fountain & Admin Farmyard Roofed Stone Water Well!
    if (41 >= startX - 3 && 41 <= endX + 3 && 24 >= startY - 3 && 24 <= endY + 3) {
      renderList.push({
        y: 24 * TILE + 28,
        draw: () => Sprites.drawFountain(ctx, 41 * TILE, 24 * TILE, tick)
      });
    }
    if (12 >= startX - 3 && 12 <= endX + 3 && 14 >= startY - 3 && 14 <= endY + 3) {
      renderList.push({
        y: 14 * TILE + 28,
        draw: () => Sprites.drawFountain(ctx, 12 * TILE, 14 * TILE, tick)
      });
    }
    // Stardew Farmyard Beehouses next to Admin Cottage fence (like top-left of screenshot!)
    if (3 >= startX - 2 && 3 <= endX + 2 && 8 >= startY - 2 && 8 <= endY + 2) {
      renderList.push({
        y: 8 * TILE + 26,
        draw: () => {
          Sprites.drawServerRack(ctx, 3 * TILE, 8 * TILE, state.completedUnits.length > 0, tick);
        }
      });
    }

    // Cozy Park Benches
    BENCHES.forEach((bn) => {
      if (bn.tx < startX - 2 || bn.tx > endX + 2 || bn.ty < startY - 2 || bn.ty > endY + 2) return;
      renderList.push({
        y: bn.ty * TILE + 24,
        draw: () => Sprites.drawBench(ctx, bn.tx * TILE, bn.ty * TILE)
      });
    });

    // All 17 Enterable 2.5D Buildings with Glowing Entrance Mats & Active Quest Beacons!
    GD.BUILDINGS.forEach((b) => {
      if (b.tx + b.tw < startX - 2 || b.tx > endX + 2 || b.ty + b.th < startY - 2 || b.ty > endY + 2) return;
      const isQuestBuilding = activeQ && b.units && b.units.includes(activeQ.unit);
      renderList.push({
        y: (b.ty + b.th) * TILE,
        draw: () => {
          Sprites.drawBuilding(ctx, b, isBuildingOnline(b), tick);
          // Glowing 2.5D Welcome Mat in front of the door
          const doorX = (b.tx + Math.floor(b.tw / 2)) * TILE;
          const doorY = (b.ty + b.th) * TILE;
          ctx.fillStyle = isQuestBuilding ? 'rgba(253, 224, 71, 0.45)' : 'rgba(255, 255, 255, 0.18)';
          ctx.fillRect(doorX - 18, doorY + 1, 36, 10);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(doorX - 15, doorY + 2, 30, 7);
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 8px Kanit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🚪 เข้า [E]', doorX, doorY + 8);
          if (isQuestBuilding) {
            drawFloatingMarker(ctx, doorX, doorY - 24, '!', '#ffcf33');
          }
        }
      });
    });

    trees.forEach((tr) => {
      if (tr.tx < startX - 2 || tr.tx > endX + 2 || tr.ty < startY - 2 || tr.ty > endY + 2) return;
      renderList.push({
        y: tr.ty * TILE + 26,
        draw: () => Sprites.drawTree(ctx, tr.tx * TILE, tr.ty * TILE, tr.v, tick)
      });
    });

    GD.CRATES.forEach((c) => {
      const opened = state.openedCrates.includes(c.id);
      const isNeeded = activeQ && activeQ.requiredItem === c.itemId && !hasItem(c.itemId);
      renderList.push({
        y: c.ty * TILE + 22,
        draw: () => {
          Sprites.drawCrate(ctx, c.tx * TILE, c.ty * TILE, opened, tick);
          if (isNeeded && !opened) {
            drawFloatingMarker(ctx, c.tx * TILE + 16, c.ty * TILE - 8, '!', '#ffd54f');
          }
        }
      });
    });

    GD.LAMPS.forEach((lp) => {
      if (lp.tx < startX - 3 || lp.tx > endX + 3 || lp.ty < startY - 3 || lp.ty > endY + 3) return;
      renderList.push({
        y: lp.ty * TILE + 26,
        draw: () => Sprites.drawLamp(ctx, lp.tx * TILE, lp.ty * TILE, nightFactor)
      });
    });

    // Outdoor Town & Shopkeeper NPCs standing or walking across the Village Map
    if (GD.TOWN_NPCS) {
      GD.TOWN_NPCS.forEach((tn, idx) => {
        const wx = typeof tn.wx === 'number' ? tn.wx : tn.tx * TILE;
        const wy = typeof tn.wy === 'number' ? tn.wy : tn.ty * TILE;
        const curTx = wx / TILE;
        const curTy = wy / TILE;
        if (curTx < startX - 3 || curTx > endX + 3 || curTy < startY - 3 || curTy > endY + 3) return;
        // Turn gently toward player when player is nearby
        let lookDir = tn.dir || 'down';
        const dPlayer = Math.hypot((state.player.x + 16) - (wx + 16), (state.player.y + 16) - (wy + 16));
        if (dPlayer < 72) {
          const dx = (state.player.x + 16) - (wx + 16);
          const dy = (state.player.y + 16) - (wy + 16);
          if (Math.abs(dx) > Math.abs(dy)) lookDir = dx < 0 ? 'left' : 'right';
          else lookDir = dy < 0 ? 'up' : 'down';
        }
        const walkFrame = dPlayer < 54 ? 0 : (tn.frame || 0);
        renderList.push({
          y: wy + 31,
          draw: () => {
            Sprites.drawCharacter(ctx, wx, wy - 6, tn.style, lookDir, walkFrame, 2, tick + idx * 19);
            // Floating role/greeting marker above NPC
            if (tn.marker) {
              drawFloatingMarker(ctx, wx + 16, wy - 17, tn.marker, tn.markerColor || '#ffd54f');
            }
            // Nameplate under NPC feet
            ctx.font = 'bold 9.5px Kanit, sans-serif';
            const nw = Math.max(58, ctx.measureText(tn.name).width + 12);
            ctx.fillStyle = tn.action === 'shop' ? 'rgba(124, 45, 18, 0.90)' : 'rgba(30, 20, 10, 0.86)';
            ctx.fillRect(wx + 16 - nw / 2, wy + 28, nw, 14);
            ctx.strokeStyle = tn.markerColor || '#fde68a';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(wx + 16 - nw / 2, wy + 28, nw, 14);
            ctx.fillStyle = '#fffbeb';
            ctx.textAlign = 'center';
            ctx.fillText(tn.name, wx + 16, wy + 38.5);
          }
        });
      });
    }

    // Connected Classmates who are OUTSIDE in the village
    if (window.Multiplayer) {
      const nowMs = Date.now();
      Multiplayer.getPeers().forEach((peer, pi) => {
        if (peer.insideBuildingId) return;
        if (peer.rx < camX - 64 || peer.rx > camX + viewW + 64 || peer.ry < camY - 64 || peer.ry > camY + viewH + 64) return;
        renderList.push({
          y: peer.ry + 32,
          draw: () => {
            const pStyle = {
              ...GD.PLAYER_STYLE,
              skin: peer.skin || '#f6cfa6',
              hair: peer.hair || '#241712',
              hairStyle: peer.hairStyle || 'short',
              faceStyle: peer.faceStyle || 'smile',
              glasses: peer.faceStyle === 'glasses',
              shirt: peer.shirt || '#2b6cb0',
              shirtStyle: peer.shirtStyle || 'jacket',
              pants: peer.pants || '#2c4969',
              shoes: peer.shoes || '#5c3317',
              hat: peer.hat || '',
              headMiddle: peer.headMiddle || '',
              headLower: peer.headLower || ''
            };
            if (peer.isTeacher) {
              drawTeacherAdminAura(ctx, peer.rx + 16, peer.ry + 28, tick);
            }
            Sprites.drawCharacter(ctx, peer.rx, peer.ry - 6, pStyle, peer.dir || 'down', peer.frame || 0, 2, tick + pi * 29);
            if (peer.isTeacher) {
              drawTeacherCrownBadge(ctx, peer.rx + 16, peer.ry - 14, tick);
            }
            const label = (peer.isTeacher ? '👑 ครู ' : '') + (peer.name || 'เพื่อนร่วมห้อง');
            ctx.font = 'bold 10px Kanit, sans-serif';
            const nw = Math.max(58, ctx.measureText(label).width + 14);
            ctx.fillStyle = peer.isTeacher ? 'rgba(120, 53, 15, 0.92)' : 'rgba(12, 54, 78, 0.85)';
            ctx.fillRect(peer.rx + 16 - nw / 2, peer.ry + 29, nw, 15);
            ctx.strokeStyle = peer.isTeacher ? '#fde047' : '#5ce1e6';
            ctx.lineWidth = peer.isTeacher ? 1.5 : 1;
            ctx.strokeRect(peer.rx + 16 - nw / 2, peer.ry + 29, nw, 15);
            ctx.fillStyle = peer.isTeacher ? '#fef9c3' : '#e0fbff';
            ctx.textAlign = 'center';
            ctx.fillText(label, peer.rx + 16, peer.ry + 40);

            if (peer.bubble && peer.bubbleUntil > nowMs) {
              drawSpeechBubble(ctx, peer.rx + 16, peer.ry - 20, peer.bubble);
            }
          }
        });
      });
    }

    // Player
    renderList.push({
      y: state.player.y + 32,
      draw: () => {
        if (isTeacherAdmin) {
          drawTeacherAdminAura(ctx, state.player.x + 16, state.player.y + 28, tick);
        }
        Sprites.drawCharacter(
          ctx,
          state.player.x,
          state.player.y - 6,
          GD.PLAYER_STYLE,
          state.player.dir,
          state.player.frame,
          2,
          tick
        );
        if (isTeacherAdmin) {
          drawTeacherCrownBadge(ctx, state.player.x + 16, state.player.y - 14, tick);
          const tLabel = '👑 ครู ' + ((state.profile && state.profile.studentName) || 'ครูผู้สอน');
          ctx.font = 'bold 10px Kanit, sans-serif';
          const nw = Math.max(64, ctx.measureText(tLabel).width + 14);
          ctx.fillStyle = 'rgba(120, 53, 15, 0.92)';
          ctx.fillRect(state.player.x + 16 - nw / 2, state.player.y + 29, nw, 15);
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(state.player.x + 16 - nw / 2, state.player.y + 29, nw, 15);
          ctx.fillStyle = '#fef9c3';
          ctx.textAlign = 'center';
          ctx.fillText(tLabel, state.player.x + 16, state.player.y + 40);
        }
        if (myBubble && myBubbleUntil > Date.now()) {
          drawSpeechBubble(ctx, state.player.x + 16, state.player.y - (isTeacherAdmin ? 22 : 13), myBubble);
        }
      }
    });

    renderList.sort((a, b) => a.y - b.y);
    renderList.forEach((r) => r.draw());

    // 4. Directional Guide Arrow near player pointing to active quest's Building Entrance Door!
    if (state.started && activeQ && !activeModalId && !dialogQueue) {
      let tx = 18 * TILE;
      let ty = 8 * TILE;
      const qBld = getBuildingForUnit(activeQ.unit);
      if (qBld) {
        tx = (qBld.tx + Math.floor(qBld.tw / 2)) * TILE;
        ty = (qBld.ty + qBld.th) * TILE;
      }
      const dist = Math.hypot(tx - (state.player.x + 16), ty - (state.player.y + 16));
      if (dist > 65) {
        const ang = Math.atan2(ty - (state.player.y + 16), tx - (state.player.x + 16));
        const ax = state.player.x + 16 + Math.cos(ang) * 34;
        const ay = state.player.y + 16 + Math.sin(ang) * 34;
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(ang);
        ctx.fillStyle = '#ffe033';
        ctx.strokeStyle = '#4a230b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-5, -5);
        ctx.lineTo(-5, 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 5. Floating [E] Prompt for Nearest Interactable
    if (state.started && !activeModalId && !dialogQueue) {
      const target = findNearestInteractable();
      if (target) {
        const text = `[E] ${target.label}`;
        ctx.font = 'bold 11px Kanit, sans-serif';
        const tw = ctx.measureText(text).width + 14;
        const bx = target.wx - tw / 2;
        const by = target.wy - 42 + Math.sin(tick / 10) * 2;
        ctx.fillStyle = 'rgba(42, 20, 6, 0.9)';
        ctx.fillRect(bx, by, tw, 20);
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, tw, 20);
        ctx.fillStyle = '#fff8dc';
        ctx.textAlign = 'center';
        ctx.fillText(text, target.wx, by + 14);
      }
    }

    // 6. 2.5D Volumetric Particles, Floating Butterflies (with 3D ground shadow!), Petals & Glowing Fireflies
    particles.forEach((p) => {
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.arc(p.x, p.y + 3, p.size * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2);
      ctx.fill();
    });

    // Daytime 2.5D fluttering butterflies with height shadow on ground below
    if (nightFactor < 0.35) {
      butterflies.forEach((b) => {
        if (b.x < camX - 20 || b.x > camX + viewW + 20 || b.y < camY - 20 || b.y > camY + viewH + 20) return;
        const wing = Math.sin(b.phase) > 0 ? 3.2 : 1.3;
        const bx = Math.floor(b.x);
        const by = Math.floor(b.y);
        // 2.5D Ground shadow 10px below floating butterfly
        ctx.fillStyle = 'rgba(15, 28, 12, 0.22)';
        ctx.beginPath();
        ctx.ellipse(bx, by + 10, 2.5, 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        // Butterfly wings
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.ellipse(bx - wing * 0.6, by, wing, 2.0, -0.2, 0, Math.PI * 2);
        ctx.ellipse(bx + wing * 0.6, by, wing, 2.0, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2b1b12';
        ctx.fillRect(bx - 0.5, by - 1.5, 1.2, 3);
      });
    }

    // 2.5D Drifting cherry blossom petals with ground shadow
    petals.forEach((pt) => {
      if (pt.x < camX - 20 || pt.x > camX + viewW + 20 || pt.y < camY - 20 || pt.y > camY + viewH + 20) return;
      ctx.fillStyle = 'rgba(15, 25, 12, 0.16)';
      ctx.fillRect(Math.floor(pt.x + 2), Math.floor(pt.y + 7), 2, 1);
      ctx.fillStyle = nightFactor > 0.3 ? 'rgba(255, 196, 220, 0.52)' : 'rgba(255, 178, 206, 0.90)';
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y, 2.2, 1.3, pt.phase * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2.5D Glowing Fireflies / Sun Motes with radial bloom
    fireflies.forEach((f) => {
      if (f.x < camX - 20 || f.x > camX + viewW + 20 || f.y < camY - 20 || f.y > camY + viewH + 20) return;
      const a = 0.25 + 0.55 * Math.abs(Math.sin(f.phase));
      const g = ctx.createRadialGradient(f.x, f.y, 0.5, f.x, f.y, 6);
      if (nightFactor > 0.15) {
        g.addColorStop(0, `rgba(236, 252, 203, ${a})`);
        g.addColorStop(0.4, `rgba(163, 230, 53, ${a * 0.55})`);
        g.addColorStop(1, 'rgba(163, 230, 53, 0)');
      } else {
        g.addColorStop(0, `rgba(255, 253, 230, ${a * 0.55})`);
        g.addColorStop(1, 'rgba(255, 253, 230, 0)');
      }
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    // 7. 2.5D HD-2D Atmospheric Post-Processing: Diagonal Sunbeam God-Rays, Horizon Depth & Tilt-Shift Vignette
    ctx.save();
    if (nightFactor < 0.45) {
      // Diagonal warm sunlight shafts streaming from upper-left across the 2.5D diorama
      const sunAlpha = (1 - nightFactor * 2) * 0.075;
      ctx.fillStyle = `rgba(255, 247, 194, ${sunAlpha})`;
      const rayShift = Math.sin(tick / 90) * 18;
      for (let r = 0; r < 3; r++) {
        const rx = vw * (0.08 + r * 0.30) + rayShift;
        const rw = vw * 0.11;
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx + rw, 0);
        ctx.lineTo(rx + rw + vh * 0.48, vh);
        ctx.lineTo(rx + vh * 0.48, vh);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Golden Hour / Evening / Night Atmospheric Tint
    if (state.minutes >= 16 * 60 + 30 && state.minutes < 18 * 60 + 30) {
      const k = Math.sin(((state.minutes - 16.5 * 60) / 120) * Math.PI) * 0.18;
      ctx.fillStyle = `rgba(255, 145, 55, ${k})`;
      ctx.fillRect(0, 0, vw, vh);
    } else if (state.minutes >= 18 * 60 + 30) {
      const k = Math.min(0.36, ((state.minutes - 18.5 * 60) / 180) * 0.36);
      ctx.fillStyle = `rgba(14, 24, 58, ${k})`;
      ctx.fillRect(0, 0, vw, vh);
    }

    // 2.5D Diorama Tilt-Shift Depth Gradient (top atmospheric sky-light & bottom shadow vignette)
    const topHaze = ctx.createLinearGradient(0, 0, 0, Math.min(110, vh * 0.16));
    topHaze.addColorStop(0, nightFactor > 0.3 ? 'rgba(15, 23, 42, 0.32)' : 'rgba(254, 249, 195, 0.18)');
    topHaze.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topHaze;
    ctx.fillRect(0, 0, vw, Math.min(110, vh * 0.16));

    const botVig = ctx.createLinearGradient(0, vh - Math.min(100, vh * 0.15), 0, vh);
    botVig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    botVig.addColorStop(1, 'rgba(12, 18, 10, 0.24)');
    ctx.fillStyle = botVig;
    ctx.fillRect(0, vh - Math.min(100, vh * 0.15), vw, Math.min(100, vh * 0.15));
    ctx.restore();
  }

  function drawFloatingMarker(ctx, cx, cy, symbol, color) {
    const dy = Math.sin(tick / 10) * 4;
    // 2.5D 3D Floating Quest Badge with glow & drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12, 6, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy - 2 + dy);
    ctx.fillStyle = '#381e0c';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -0.5, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(-2.5, -3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#241104';
    ctx.font = 'bold 12px Kanit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(symbol, 0, 4);
    ctx.restore();
  }

  function drawTeacherAdminAura(ctx, cx, cy, tick) {
    ctx.save();
    const pulse = 1 + Math.sin(tick / 10) * 0.12;
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22 * pulse);
    grad.addColorStop(0, 'rgba(253, 224, 71, 0.55)');
    grad.addColorStop(0.6, 'rgba(245, 158, 11, 0.28)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 22 * pulse, 9 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 16 * pulse, 6.2 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawTeacherCrownBadge(ctx, cx, cy, tick) {
    const dy = Math.sin(tick / 11) * 2.2;
    ctx.save();
    ctx.translate(cx, cy + dy);
    // Glowing golden crown
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-8, 4);
    ctx.lineTo(-9, -4);
    ctx.lineTo(-4, 0);
    ctx.lineTo(0, -6);
    ctx.lineTo(4, 0);
    ctx.lineTo(9, -4);
    ctx.lineTo(8, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Ruby jewel on crown center
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function loop(ts) {
    if (!lastTime) lastTime = ts;
    const dt = Math.min(0.05, (ts - lastTime) / 1000);
    lastTime = ts;
    update(dt);
    render();
    if (activeModalId === 'modal-customize') renderCustomizerPreview();
    requestAnimationFrame(loop);
  }

  // ==================== 2.5D CHARACTER CUSTOMIZER & PROFILE EDITOR ====================
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  const CUSTOM_OPTIONS = {
    hairStyle: [
      { val: 'short', label: '💇 ผมสั้นเรียบ' },
      { val: 'spiky', label: '⚡ ผมตั้งเท่' },
      { val: 'sidepart', label: '✨ ผมปัดข้าง' },
      { val: 'wolfcut', label: '🐺 วูล์ฟคัท' },
      { val: 'bob', label: '🎀 ผมบ๊อบน่ารัก' },
      { val: 'long', label: '🌸 ผมยาวสลวย' },
      { val: 'ponytail', label: '🎗️ ผมหางม้า' },
      { val: 'twintails', label: '🎶 ทวินเทลคู่' },
      { val: 'bun', label: '🍡 ดังโงะ/มวยผม' },
      { val: 'curly', label: '☁️ ผมหยักศก' }
    ],
    hairColor: [
      { val: '#241712', name: 'ดำธรรมชาติ' },
      { val: '#5a331c', name: 'น้ำตาลช็อกโกแลต' },
      { val: '#a36a2c', name: 'น้ำตาลคาราเมล' },
      { val: '#e6b84c', name: 'บลอนด์ทอง' },
      { val: '#9e2a2b', name: 'แดงเชอร์รี' },
      { val: '#3b4cca', name: 'น้ำเงินโคบอลต์' },
      { val: '#e2e8f0', name: 'เงินซิลเวอร์' },
      { val: '#f472b6', name: 'ชมพูพาสเทล' },
      { val: '#10b981', name: 'เขียวมินต์ไซเบอร์' },
      { val: '#8b5cf6', name: 'ม่วงลาเวนเดอร์' }
    ],
    faceStyle: [
      { val: 'smile', label: '😊 ยิ้มสดใส' },
      { val: 'glasses', label: '🤓 แว่นเด็กไอที' },
      { val: 'cool', label: '😎 แว่นกันแดดเท่' },
      { val: 'wink', label: '😉 ขยิบตาขี้เล่น' },
      { val: 'happy', label: '😄 ยิ้มตาหยี' },
      { val: 'cat', label: '😺 ยิ้มเหมียว :3' },
      { val: 'cyber', label: '🥽 แว่น Cyber AR' },
      { val: 'star', label: '🤩 ตาประกายดาว' }
    ],
    skin: [
      { val: '#fde0c4', name: 'ขาวอมชมพู' },
      { val: '#f6cfa6', name: 'ขาวเหลือง' },
      { val: '#e3ae7c', name: 'ผิวสองสี' },
      { val: '#c68642', name: 'ผิวแทน' },
      { val: '#8d5524', name: 'ผิวเข้ม' }
    ],
    shirtStyle: [
      { val: 'overalls', label: '🌾 ชุดเอี๊ยม Stardew' },
      { val: 'jacket', label: '🧥 แจ็กเก็ตไอที' },
      { val: 'polo', label: '👔 เสื้อโปโล' },
      { val: 'hoodie', label: '🎽 เสื้อฮู้ดดี้' },
      { val: 'suit', label: '🕴️ สูทผูกไทด์' },
      { val: 'labcoat', label: '🥼 เสื้อกาวน์วิศวกร' },
      { val: 'vest', label: '🧶 เสื้อกั๊กไหมพรม' },
      { val: 'cyber_armor', label: '⚡ เกราะ Cyber Neon' },
      { val: 'ro_knight', label: '⚔️ เกราะอัศวิน Rune Knight (RO)' },
      { val: 'ro_mage', label: '🔮 เสื้อคลุมจอมเวท High Wizard (RO)' },
      { val: 'ro_assassin', label: '🗡️ ชุดนินจา Assassin Cross (RO)' },
      { val: 'kafra_dress', label: '🎀 ชุดเมดสาว Kafra Service (RO)' }
    ],
    shirtColor: [
      { val: '#2a7b5f', name: 'เขียวแอดมิน' },
      { val: '#2b6cb0', name: 'น้ำเงิน Windows' },
      { val: '#b83280', name: 'ชมพูมาเจนต้า' },
      { val: '#c05621', name: 'ส้ม Ubuntu' },
      { val: '#6b46c1', name: 'ม่วงรอยัล' },
      { val: '#2d3748', name: 'ดำชาร์โคล' },
      { val: '#e2e8f0', name: 'ขาวคลีน' },
      { val: '#c53030', name: 'แดงคริมสัน' },
      { val: '#d97706', name: 'เหลืองแอมเบอร์' },
      { val: '#0d9488', name: 'เขียวน้ำทะเล' }
    ],
    pantsColor: [
      { val: '#2c4969', name: 'ยีนส์เดนิม' },
      { val: '#22272e', name: 'ดำสแล็ก' },
      { val: '#8c6b43', name: 'น้ำตาลกากี' },
      { val: '#1e3a5f', name: 'กรมท่า' },
      { val: '#3b523b', name: 'เขียวคาร์โก้' },
      { val: '#64748b', name: 'เทาโมเดิร์น' },
      { val: '#7c2d12', name: 'น้ำตาลเรโทร' }
    ],
    shoesColor: [
      { val: '#5c3317', name: 'บูทหนังน้ำตาล' },
      { val: '#1f2428', name: 'ผ้าใบดำ' },
      { val: '#e2e8f0', name: 'สนีกเกอร์ขาว' },
      { val: '#c83e37', name: 'ผ้าใบแดง' },
      { val: '#2563eb', name: 'สปอร์ตน้ำเงิน' },
      { val: '#d97706', name: 'บูทเหลือง' }
    ],
    hatStylePills: [
      { val: '', label: '✕ ไม่ใส่ส่วนบน' },
      { val: 'poring_hat', label: '🍮 หมวก Poring (RO)' },
      { val: 'ghostring_hat', label: '👻 หมวกผี Ghostring (RO)' },
      { val: 'deviruchi_hat', label: '👿 หมวกปีศาจ Deviruchi' },
      { val: 'valkyrie_helm', label: '🪶 หมวก Valkyrie Helm' },
      { val: 'solar_god_helm', label: '☀️ มงกุฎสุริยเทพ Helm of Sun' },
      { val: 'Lord_kaho', label: '👑 เขาเทพ Lord Kaho Horn' },
      { val: 'bapho_horns', label: '😈 เขาบาโฟ Baphomet Horns' },
      { val: 'magestic_goat', label: '🐐 เขาแพะ Majestic Goat' },
      { val: 'feather_beret', label: '🪶 หมวกเบเร่ต์ขนนก Feather Beret' },
      { val: 'drooping_cat', label: '🐈‍⬛ ตุ๊กตาแมวหมอบ Drooping Cat' },
      { val: 'angel_halo', label: '😇 วงแหวนนางฟ้า Angel Halo' },
      { val: 'wizard_hat', label: '🧙 หมวกจอมเวท Wizard Hat' },
      { val: 'corsair_hat', label: '🏴‍☠️ หมวกโจรสลัด Corsair' },
      { val: 'alice_band', label: '🎀 ที่คาดผมเมด Alice Doll' },
      { val: 'apple_archer', label: '🍎 แอปเปิลปักธนู Apple of Archer' },
      { val: 'bunny_band', label: '🐰 หูกระต่าย Kafra Bunny' },
      { val: 'leaf_head', label: '🌱 ใบไม้แรคคูน Smokie Leaf' },
      { val: 'poopoo_hat', label: '💩 หมวกอุนจิในตำนาน Poo Poo Hat' },
      { val: 'crown', label: '👑 มงกุฎราชา Golden Crown' },
      { val: 'catears', label: '🐱 หูแมวดำ Neko Ears' },
      { val: 'headphones', label: '🎧 หูฟังเกมมิ่ง RGB' },
      { val: 'straw', label: '👒 หมวกฟาง Stardew' }
    ],
    hatColor: [
      { val: '', name: 'ไม่ใส่หมวก (โชว์ทรงผม)' },
      { val: '#c85a17', name: 'หมวกแก๊ปส้มอิฐ' },
      { val: '#1e40af', name: 'หมวกแก๊ปน้ำเงิน' },
      { val: '#6b46c1', name: 'หมวกแก๊ปม่วง' },
      { val: '#2d3748', name: 'หมวกแก๊ปดำ' },
      { val: '#b91c1c', name: 'หมวกแก๊ปแดง' },
      { val: '#047857', name: 'หมวกแก๊ปเขียว' }
    ],
    headMiddle: [
      { val: '', label: '✕ ไม่ใส่ส่วนกลาง' },
      { val: 'angel_ears', label: '🪽 หูปีกนางฟ้า (Angel Wing Ears)' },
      { val: 'evil_ears', label: '🦇 หูปีกปีศาจ (Evil Wing Ears)' },
      { val: 'elf_ears', label: '🧝 หูเอลฟ์ (Elf Ears)' },
      { val: 'robo_ears', label: '🤖 หูไซเบอร์ (Chii Persocom)' },
      { val: 'angel_wing_back', label: '🕊️ ปีกนางฟ้าใหญ่ (Archangel Wings)' },
      { val: 'fallen_angel_wing', label: '🖤 ปีกทูตสวรรค์ตกสวรรค์ (Fallen Angel)' },
      { val: 'devil_wing_back', label: '👿 ปีกเดวิลรุ้งดำ (Deviling Wings)' },
      { val: 'dragon_bone_wing', label: '🦴 ปีกโครงกระดูกมังกร (Dragon Bone)' },
      { val: 'fairy_wing', label: '🦋 ปีกภูตผีเสื้อ (Fairy Wings)' },
      { val: 'ice_crystal_wing', label: '❄️ ปีกคริสตัลน้ำแข็ง (Ice Wings)' },
      { val: 'golden_wing', label: '✨ ปีกทองคำ (Golden Wings)' },
      { val: 'peco_wing', label: '🐤 ปีกนกเปโกะ (Peco Peco Wings)' },
      { val: 'giant_bow_back', label: '🎀 โบว์ยักษ์ติดหลัง (Giant Ribbon)' },
      { val: 'blush_stickers', label: '😊 แก้มแดงชมพู (Blush)' },
      { val: 'monocle', label: '🧐 แว่นตาข้างเดียว (Monocle)' },
      { val: 'eyepatch', label: '🏴‍☠️ ผ้าคาดตาโจรสลัด (Eyepatch)' },
      { val: 'cyclops_visor', label: '🚨 แว่นเลเซอร์ (Cyclops Visor)' },
      { val: 'sunglasses_ro', label: '🕶️ แว่นดำแฟชั่น (RO Sunglasses)' },
      { val: 'opera_masque', label: '🎭 หน้ากากแฟนทอม (Opera Masque)' },
      { val: 'floating_aura', label: '🔮 ลูกแก้วออร่า Lv.99 (Spirit Orbs)' }
    ],
    headLower: [
      { val: '', label: '✕ ไม่ใส่ส่วนล่าง' },
      { val: 'pipe', label: '🪈 คาบไปป์พ่นควัน (Gentleman Pipe)' },
      { val: 'rose_mouth', label: '🌹 คาบดอกกุหลาบ (Romantic Rose)' },
      { val: 'toast_mouth', label: '🍞 คาบขนมปังทาแยม (Crunch Toast)' },
      { val: 'donut_mouth', label: '🍩 คาบโดนัทสีชมพู (Sweet Donut)' },
      { val: 'fish_mouth', label: '🐟 คาบปลาสด (Tasty Fish)' },
      { val: 'pirate_dagger', label: '🗡️ คาบมีดสั้นโจรสลัด (Pirate Dagger)' },
      { val: 'Scroll_mouth', label: '📜 คาบคัมภีร์นินจา (Ninja Scroll)' },
      { val: 'lollipop_mouth', label: '🍭 คาบอมยิ้ม (Candy Lollipop)' },
      { val: 'grass_leaf', label: '🌿 คาบใบหญ้า (Four-Leaf Clover)' },
      { val: 'bubblegum', label: '🫧 เป่าลูกโป่งหมากฝรั่ง (Bubblegum)' },
      { val: 'ninja_mask', label: '🥷 ผ้าปิดปากนินจา (Assassin Mask)' },
      { val: 'flu_mask', label: '😷 หน้ากากอนามัย (Flu Mask)' },
      { val: 'gangster_scarf', label: '🧣 ผ้าโพกปากแก๊งสเตอร์ (Gangster Mask)' },
      { val: 'red_scarf', label: '🧣 ผ้าพันคอแดง (Crimson Scarf)' },
      { val: 'santa_beard', label: '🎅 เคราซานต้าขาวฟู (Santa Beard)' }
    ]
  };

  const setupProfile = { ...DEFAULT_PROFILE };
  const inStudentName = document.getElementById('input-student-name');
  const inStudentClass = document.getElementById('input-student-class');
  const inCollegeName = document.getElementById('input-college-name');
  const inInstructorName = document.getElementById('input-instructor-name');

  let custDraft = { ...DEFAULT_PROFILE };
  const CUST_DIRS = ['down', 'left', 'up', 'right'];
  let custDirIdx = 0;
  let custWalk = true;

  function renderSetupAvatar() {
    const pv = document.getElementById('setup-avatar-preview');
    if (!pv) return;
    const pCtx = pv.getContext('2d');
    pCtx.imageSmoothingEnabled = true;
    pCtx.clearRect(0, 0, 84, 84);
    const previewStyle = profileToStyle(setupProfile);
    const key = styleCacheKey('setup', previewStyle);
    pCtx.drawImage(Sprites.getPortrait(key, previewStyle), 0, 0, 84, 84);
  }

  function renderCustomizerPreview() {
    const pv = document.getElementById('cust-preview-canvas');
    if (!pv) return;
    const pCtx = pv.getContext('2d');
    pCtx.clearRect(0, 0, pv.width, pv.height);

    // 2.5D Diorama Pedestal Turntable & Spotlight under Character
    pCtx.save();
    // Soft spotlight cone from above
    const spot = pCtx.createLinearGradient(80, 0, 80, 175);
    spot.addColorStop(0, 'rgba(255, 253, 220, 0.35)');
    spot.addColorStop(1, 'rgba(255, 253, 220, 0)');
    pCtx.fillStyle = spot;
    pCtx.beginPath();
    pCtx.moveTo(45, 0);
    pCtx.lineTo(115, 0);
    pCtx.lineTo(145, 175);
    pCtx.lineTo(15, 175);
    pCtx.closePath();
    pCtx.fill();

    // 3D Turntable Podium Base (extruded wood & gold rim)
    pCtx.fillStyle = 'rgba(15, 25, 12, 0.35)';
    pCtx.beginPath();
    pCtx.ellipse(80, 174, 54, 13, 0, 0, Math.PI * 2);
    pCtx.fill();

    pCtx.fillStyle = '#5c3114';
    pCtx.strokeStyle = '#261409';
    pCtx.lineWidth = 2;
    pCtx.beginPath();
    pCtx.ellipse(80, 170, 50, 11, 0, 0, Math.PI * 2);
    pCtx.fill();
    pCtx.stroke();

    const podGrad = pCtx.createRadialGradient(72, 162, 4, 80, 165, 48);
    podGrad.addColorStop(0, '#fde68a');
    podGrad.addColorStop(0.65, '#d99b52');
    podGrad.addColorStop(1, '#8c5022');
    pCtx.fillStyle = podGrad;
    pCtx.beginPath();
    pCtx.ellipse(80, 165, 50, 11, 0, 0, Math.PI * 2);
    pCtx.fill();
    pCtx.stroke();
    pCtx.restore();

    const frame = custWalk ? (Math.floor(tick / 12) % 4) : 0;
    const dir = CUST_DIRS[custDirIdx];
    Sprites.drawCharacter(pCtx, 20, 10, profileToStyle(custDraft), dir, frame, 6, tick);
  }

  function buildCustomizerUI() {
    const col = document.getElementById('cust-options-col');
    if (!col) return;
    col.innerHTML = '';

    // 1. Editable Player Name & Class/Room Box (live sync with custDraft)
    const nameGroup = document.createElement('div');
    nameGroup.className = 'cust-group';
    nameGroup.style.background = 'linear-gradient(135deg, #fffbeb, #fef3c7)';
    nameGroup.style.borderColor = '#d97706';
    nameGroup.innerHTML = `
      <div class="cust-group-title" style="color:#92400e;">✏️ แก้ไขชื่อตัวละคร & ระดับชั้น (แสดงบนหัวในโหมดออนไลน์ & เกียรติบัตร)</div>
      <div style="display:grid; grid-template-columns: 1.4fr 1fr; gap:8px; margin-top:4px;">
        <div>
          <label style="display:block; font-size:0.75rem; font-weight:700; color:#78350f; margin-bottom:2px;">👤 ชื่อ-นามสกุล / ชื่อตัวละคร</label>
          <input id="cust-input-name" type="text" maxlength="40" placeholder="เช่น นายสมชาย สายเซิร์ฟเวอร์"
            style="width:100%; padding:6px 10px; border:2px solid #b45309; border-radius:6px; font-family:inherit; font-size:0.9rem; font-weight:600; background:#fffdf8; color:#271306;" />
        </div>
        <div>
          <label style="display:block; font-size:0.75rem; font-weight:700; color:#78350f; margin-bottom:2px;">🏫 ระดับชั้น / ห้อง</label>
          <input id="cust-input-class" type="text" maxlength="28" placeholder="เช่น ปวช.2/1 เทคโนโลยีสารสนเทศ"
            style="width:100%; padding:6px 10px; border:2px solid #b45309; border-radius:6px; font-family:inherit; font-size:0.88rem; background:#fffdf8; color:#271306;" />
        </div>
      </div>
    `;
    col.appendChild(nameGroup);

    const custNameInput = nameGroup.querySelector('#cust-input-name');
    const custClassInput = nameGroup.querySelector('#cust-input-class');
    custNameInput.value = custDraft.studentName || '';
    custClassInput.value = custDraft.studentClass || '';
    custNameInput.addEventListener('input', () => {
      custDraft.studentName = custNameInput.value;
    });
    custClassInput.addEventListener('input', () => {
      custDraft.studentClass = custClassInput.value;
    });

    const addPillGroup = (title, field, list) => {
      const g = document.createElement('div');
      g.className = 'cust-group';
      g.innerHTML = `<div class="cust-group-title">${title}</div><div class="cust-row"></div>`;
      const row = g.querySelector('.cust-row');
      list.forEach((opt) => {
        const b = document.createElement('button');
        b.className = 'cust-pill' + (custDraft[field] === opt.val ? ' active' : '');
        b.textContent = opt.label;
        b.onclick = () => {
          SoundFX.click();
          custDraft[field] = opt.val;
          if (field === 'hairStyle' && custDraft.hatColor && ['#c85a17', '#1e40af', '#6b46c1', '#2d3748', '#b91c1c', '#047857', 'straw'].includes(custDraft.hatColor)) {
            // Auto-remove only full-coverage caps/straw hat when picking a hairstyle, keeping Ragnarok headgear on!
            custDraft.hatColor = '';
          }
          buildCustomizerUI();
        };
        row.appendChild(b);
      });
      col.appendChild(g);
    };

    const addSwatchGroup = (title, field, list) => {
      const g = document.createElement('div');
      g.className = 'cust-group';
      g.innerHTML = `<div class="cust-group-title">${title}</div><div class="cust-row"></div>`;
      const row = g.querySelector('.cust-row');
      list.forEach((opt) => {
        const b = document.createElement('button');
        b.className = 'cust-swatch' + (custDraft[field] === opt.val ? ' active' : '');
        b.title = opt.name;
        if (opt.val === '') {
          b.style.background = '#fffdf8';
          b.textContent = '✕';
        } else {
          b.style.background = opt.val;
        }
        b.onclick = () => {
          SoundFX.click();
          custDraft[field] = opt.val;
          buildCustomizerUI();
        };
        row.appendChild(b);
      });
      col.appendChild(g);
    };

    addPillGroup('👑 แฟชั่นส่วนบน — หมวก & Headgear (Ragnarok Upper — 22 สไตล์)', 'hatColor', CUSTOM_OPTIONS.hatStylePills);
    addSwatchGroup('🧢 สีหมวกแก๊ป (Colored Caps — กด ✕ เพื่อถอดส่วนบน)', 'hatColor', CUSTOM_OPTIONS.hatColor);
    addPillGroup('🪽 แฟชั่นส่วนกลาง — หู แว่น & ปีกหลัง (Ragnarok Middle & Wings — 20 สไตล์)', 'headMiddle', CUSTOM_OPTIONS.headMiddle);
    addPillGroup('🌹 แฟชั่นส่วนล่าง — ที่คาบปาก ผ้าปิดปาก & ไปป์ (Ragnarok Lower — 15 สไตล์)', 'headLower', CUSTOM_OPTIONS.headLower);
    addPillGroup('💇 ทรงผม 2.5D (Hairstyle — 10 สไตล์)', 'hairStyle', CUSTOM_OPTIONS.hairStyle);
    addSwatchGroup('🎨 สีผม (Hair Color — 10 เฉดสี)', 'hairColor', CUSTOM_OPTIONS.hairColor);
    addPillGroup('😊 ใบหน้าและแว่นตา (Face & Eyewear — 8 สไตล์)', 'faceStyle', CUSTOM_OPTIONS.faceStyle);
    addSwatchGroup('🧑 สีผิว (Skin Tone)', 'skin', CUSTOM_OPTIONS.skin);
    addPillGroup('👕 สไตล์ชุดแต่งกาย & ชุดอาชีพ RO (Outfit Style — 12 สไตล์)', 'shirtStyle', CUSTOM_OPTIONS.shirtStyle);
    addSwatchGroup('🎨 สีชุดหลัก (Outfit Color)', 'shirtColor', CUSTOM_OPTIONS.shirtColor);
    addSwatchGroup('👖 สีกางเกง / เอี๊ยม (Pants Color)', 'pantsColor', CUSTOM_OPTIONS.pantsColor);
    addSwatchGroup('👟 สีรองเท้า (Shoes Color)', 'shoesColor', CUSTOM_OPTIONS.shoesColor);
  }

  function randomizeProfile(target) {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)].val;
    target.hairStyle = pick(CUSTOM_OPTIONS.hairStyle);
    target.hairColor = pick(CUSTOM_OPTIONS.hairColor);
    target.faceStyle = pick(CUSTOM_OPTIONS.faceStyle);
    target.skin = pick(CUSTOM_OPTIONS.skin);
    target.shirtStyle = pick(CUSTOM_OPTIONS.shirtStyle);
    target.shirtColor = pick(CUSTOM_OPTIONS.shirtColor);
    target.pantsColor = pick(CUSTOM_OPTIONS.pantsColor);
    target.shoesColor = pick(CUSTOM_OPTIONS.shoesColor);
    const allHats = [...CUSTOM_OPTIONS.hatStylePills, ...CUSTOM_OPTIONS.hatColor];
    target.hatColor = Math.random() < 0.35 ? '' : pick(allHats);
    target.headMiddle = Math.random() < 0.35 ? '' : pick(CUSTOM_OPTIONS.headMiddle);
    target.headLower = Math.random() < 0.35 ? '' : pick(CUSTOM_OPTIONS.headLower);
  }

  function openCustomizerModal() {
    if (!state.started) {
      if (inStudentName && inStudentName.value.trim()) setupProfile.studentName = inStudentName.value.trim();
      if (inStudentClass && inStudentClass.value.trim()) setupProfile.studentClass = inStudentClass.value.trim();
    }
    custDraft = state.started ? { ...DEFAULT_PROFILE, ...state.profile } : { ...DEFAULT_PROFILE, ...setupProfile };
    custDirIdx = 0;
    openModal('modal-customize');
    buildCustomizerUI();
    renderCustomizerPreview();
  }

  document.getElementById('btn-cust-rot-left').onclick = () => {
    SoundFX.click();
    custDirIdx = (custDirIdx + 3) % 4;
  };
  document.getElementById('btn-cust-rot-right').onclick = () => {
    SoundFX.click();
    custDirIdx = (custDirIdx + 1) % 4;
  };
  document.getElementById('btn-cust-walk-toggle').onclick = () => {
    SoundFX.click();
    custWalk = !custWalk;
    document.getElementById('btn-cust-walk-toggle').textContent = custWalk ? '🚶 เดิน' : '🧍 ยืน';
  };
  document.getElementById('btn-cust-random').onclick = () => {
    SoundFX.pickup();
    randomizeProfile(custDraft);
    buildCustomizerUI();
  };
  document.getElementById('btn-cust-save').onclick = () => {
    SoundFX.questComplete();
    custDraft.studentName = (custDraft.studentName || '').trim() || DEFAULT_PROFILE.studentName;
    custDraft.studentClass = (custDraft.studentClass || '').trim() || DEFAULT_PROFILE.studentClass;
    Object.assign(setupProfile, custDraft);
    if (inStudentName) inStudentName.value = custDraft.studentName;
    if (inStudentClass) inStudentClass.value = custDraft.studentClass;

    if (state.started) {
      Object.assign(state.profile, custDraft);
      applyPlayerAppearance(state.profile);
      refreshHudAvatar();
      updateHUD();
      saveGame();
      showToast(`✨ บันทึกชื่อ "${state.profile.studentName}" และชุดแต่งกาย 2.5D เรียบร้อยแล้ว!`, true);
    } else {
      renderSetupAvatar();
      showToast(`✨ บันทึกชื่อ "${setupProfile.studentName}" และชุดแต่งกายเรียบร้อย!`, true);
    }
    closeAllModals();
  };

  document.getElementById('btn-open-customizer-title').onclick = openCustomizerModal;
  document.getElementById('btn-setup-avatar-click').onclick = openCustomizerModal;
  document.getElementById('btn-random-look-title').onclick = () => {
    SoundFX.pickup();
    randomizeProfile(setupProfile);
    renderSetupAvatar();
  };
  document.getElementById('hud-avatar').onclick = openCustomizerModal;
  const hudPlayerNameEl = document.getElementById('hud-player-name');
  if (hudPlayerNameEl) hudPlayerNameEl.onclick = openCustomizerModal;
  document.getElementById('btn-open-customizer-help').onclick = openCustomizerModal;

  function readSetupInputsInto(targetProfile) {
    if (inStudentName && inStudentName.value.trim()) targetProfile.studentName = inStudentName.value.trim();
    if (inStudentClass && inStudentClass.value.trim()) targetProfile.studentClass = inStudentClass.value.trim();
    if (inCollegeName && inCollegeName.value.trim()) targetProfile.collegeName = inCollegeName.value.trim();
    if (inInstructorName && inInstructorName.value.trim()) targetProfile.instructorName = inInstructorName.value.trim();
    const appearKeys = ['skin', 'hairStyle', 'hairColor', 'faceStyle', 'shirtColor', 'shirtStyle', 'pantsColor', 'shoesColor', 'hatColor', 'headMiddle', 'headLower'];
    appearKeys.forEach((k) => {
      if (setupProfile[k] !== undefined) targetProfile[k] = setupProfile[k];
    });
  }

  function startGameplay(loadedState = null) {
    SoundFX.init();
    SoundFX.click();
    state = loadedState || createFreshState();
    state.profile = { ...DEFAULT_PROFILE, ...(state.profile || {}) };
    readSetupInputsInto(state.profile);
    applyPlayerAppearance(state.profile);
    state.started = true;

    titleScreen.classList.add('hidden');
    hudTopLeft.classList.remove('hidden');
    hudTopRight.classList.remove('hidden');
    hudEnergy.classList.remove('hidden');
    hudHotbar.classList.remove('hidden');
    clearAllKeys();
    blurActiveInput();

    refreshHudAvatar();
    renderHotbar();
    updateHUD();
    saveGame();

    if (!loadedState) {
      openDialog({
        speaker: 'จดหมายจากคุณปู่แอดมิน',
        role: 'ผู้ดูแลระบบอาวุโส',
        style: GD.NPCS[0].style,
        lines: [
          `ถึงหลานรัก "${state.profile.studentName}" (${state.profile.collegeName}) — ยินดีต้อนรับสู่ "หมู่บ้าน Server Valley" ฉบับขยายใหญ่ 4 เท่า 4 โซน ครบหลักสูตร 18 สัปดาห์!`,
          `ระบบเครื่องแม่ข่ายทั้ง ${TOTAL_UNITS} สัปดาห์ (ทั้ง Linux Server & Windows Server) กำลังรอการฟื้นฟู เดินตามลูกศรสีเหลือง (กด Shift วิ่งเร็ว) ไปเก็บสายแลนแล้วคุยกับ "ลุงแอดมิน" ได้เลย!`,
          'เคล็ดลับสำหรับห้องเรียน: กด M เปิดแผนที่แล้ว "คลิกที่อาคารใดก็ได้เพื่อวาร์ปด่วน" ไปยังสัปดาห์ที่ครูสอนทันที หรือกด B เปิดคลังเนื้อหา 18 สัปดาห์!'
        ]
      });
    } else {
      showToast(`💾 โหลดเซฟเดิมสำเร็จ! ยินดีต้อนรับกลับสู่ Server Valley คุณ${state.profile.studentName}`, true);
    }

    // Auto-join large classroom / invite link if present
    setTimeout(autoJoinFromInviteOrConfig, 350);
  }

  // Keyboard Listeners (capture phase + supports English & Thai keyboard layouts for WASD!)
  window.addEventListener('keydown', (e) => {
    // Allow typing inside visible inputs/terminals without triggering game hotkeys!
    const ae = document.activeElement;
    const tag = ae && ae.tagName;
    const isVisibleInput = (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && ae.offsetParent !== null;
    if (isVisibleInput) {
      if (e.key === 'Escape') {
        ae.blur();
        if (activeModalId) closeAllModals();
      }
      return;
    }

    // Do not hijack browser shortcuts like Ctrl+R, Ctrl+F, Alt+Tab
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const moveCode = mapEventToMoveCode(e);
    if (moveCode) {
      keys[moveCode] = true;
      if (state.started && !activeModalId && !dialogQueue) {
        e.preventDefault();
      }
      updateKeycapTesterUI();
    }
    if (e.code) keys[e.code] = true;

    if (e.key === 'Escape') {
      if (activeModalId) closeAllModals();
      else if (dialogQueue) closeDialog();
      return;
    }

    if (!state.started) return;

    if (e.code === 'KeyE' || e.code === 'Space') {
      if (!activeModalId) {
        e.preventDefault();
        interact();
      }
      return;
    }

    if (activeModalId === 'modal-arcade') {
      handleArcadeKey(e.code, e.key);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      return;
    }

    if (activeModalId || dialogQueue) return;

    if (e.code === 'KeyF') {
      useSelectedItem();
    } else if (e.code === 'KeyB') {
      openCodexModal();
    } else if (e.code === 'KeyQ') {
      openQuestsModal();
    } else if (e.code === 'KeyM') {
      openMapModal();
    } else if (e.code === 'KeyP') {
      openShopModal();
    } else {
      const slotIdx = HOTBAR_KEYS.indexOf(e.key);
      if (e.code === 'KeyL') {
        openMultiplayerModal(isTeacherAdmin ? 'connect' : 'leaderboard');
      } else if (e.code === 'KeyT') {
        openMultiplayerModal('teacher');
      } else if (e.code === 'KeyC') {
        openCustomizerModal();
      } else if (slotIdx !== -1) {
        state.selectedSlot = slotIdx;
        SoundFX.click();
        renderHotbar();
      }
    }
  }, true);

  window.addEventListener('keyup', (e) => {
    const moveCode = mapEventToMoveCode(e);
    if (moveCode) {
      keys[moveCode] = false;
      updateKeycapTesterUI();
    }
    if (e.code) keys[e.code] = false;
  }, true);

  window.addEventListener('blur', clearAllKeys);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearAllKeys();
  });
  canvas.addEventListener('pointerdown', blurActiveInput);

  // ==================== MULTIPLAYER, LEADERBOARD, CHAT & TEACHER DASHBOARD ====================
  function drawSpeechBubble(ctx, cx, cy, text) {
    const shortTxt = text.length > 26 ? text.slice(0, 25) + '…' : text;
    ctx.font = 'bold 10.5px Kanit, sans-serif';
    const w = Math.max(40, ctx.measureText(shortTxt).width + 14);
    const bx = Math.floor(cx - w / 2);
    const by = Math.floor(cy - 22);
    ctx.fillStyle = '#2b1b12';
    ctx.fillRect(bx - 1, by - 1, w + 2, 20);
    ctx.fillStyle = '#fffdf5';
    ctx.fillRect(bx, by, w, 18);
    ctx.fillStyle = '#2b1b12';
    ctx.fillRect(Math.floor(cx - 2), by + 18, 4, 3);
    ctx.fillStyle = '#2b1b12';
    ctx.textAlign = 'center';
    ctx.fillText(shortTxt, cx, by + 13);
  }

  let currentMpTab = 'leaderboard';

  function openMultiplayerModal(tab = 'leaderboard') {
    const safeTab = (tab === 'connect' && !isTeacherAdmin) ? 'leaderboard' : tab;
    openModal('modal-multiplayer');
    syncTeacherAdminUI();
    switchMpTab(safeTab);
  }

  function switchMpTab(tab) {
    if (tab === 'connect' && !isTeacherAdmin) {
      tab = 'leaderboard';
    }
    currentMpTab = tab;
    document.querySelectorAll('.mp-tab-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.mptab === tab);
    });
    document.querySelectorAll('.mp-pane').forEach((p) => p.classList.add('hidden'));
    const pane = document.getElementById('mp-pane-' + tab);
    if (pane) pane.classList.remove('hidden');
    refreshActiveMpTab();
  }

  function refreshActiveMpTab() {
    if (currentMpTab === 'leaderboard') renderLeaderboard();
    else if (currentMpTab === 'teacher') renderTeacherDashboard();
  }

  function renderLeaderboard() {
    const wrap = document.getElementById('mp-leaderboard-wrap');
    if (!wrap || !window.Multiplayer) return;
    const players = Multiplayer.getAllPlayersSorted();
    const medals = ['🥇', '🥈', '🥉'];
    wrap.innerHTML = `
      <table class="mp-table">
        <thead>
          <tr>
            <th>อันดับ</th>
            <th>ชื่อนักเรียน</th>
            <th>ห้อง / ชั้น</th>
            <th>ความคืบหน้า</th>
            <th>Master Quiz</th>
            <th>Bytes 🪙</th>
            <th>คะแนนรวม</th>
          </tr>
        </thead>
        <tbody>
          ${players.map((p, i) => `
            <tr class="${p.isMe ? 'me-row' : ''}">
              <td>${medals[i] || (i + 1)}</td>
              <td>${escapeHtml(p.name)} ${p.isMe ? '(คุณ)' : ''}</td>
              <td>${escapeHtml(p.studentClass || '-')}</td>
              <td><strong>${p.doneCount}/${TOTAL_UNITS}</strong> (${Math.round((p.doneCount / TOTAL_UNITS) * 100)}%)</td>
              <td>${p.bestQuiz ? `${p.bestQuiz.score}/${p.bestQuiz.total}` : '-'}</td>
              <td>${p.bytes || 0}</td>
              <td><strong>${p.totalScore}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function getSelectedAdminUnit() {
    const sel = document.getElementById('admin-unit-select');
    return sel ? (Number(sel.value) || 1) : 1;
  }

  function syncTeacherAdminUI() {
    const lockBox = document.getElementById('teacher-admin-lock-box');
    const panel = document.getElementById('teacher-admin-panel');
    const hudBtn = document.getElementById('btn-teacher-admin');
    const godBtn = document.getElementById('btn-admin-godspeed');
    const connectTabBtn = document.getElementById('mp-tab-btn-connect');
    const connectPane = document.getElementById('mp-pane-connect');
    if (lockBox) lockBox.classList.toggle('hidden', isTeacherAdmin);
    if (panel) panel.classList.toggle('hidden', !isTeacherAdmin);
    if (hudBtn) hudBtn.classList.toggle('teacher-active', isTeacherAdmin);
    // Online Room Connection tab is exclusively visible in Teacher Admin Mode
    if (connectTabBtn) connectTabBtn.classList.toggle('hidden', !isTeacherAdmin);
    if (!isTeacherAdmin && connectPane && !connectPane.classList.contains('hidden')) {
      switchMpTab('leaderboard');
    }
    if (godBtn) {
      godBtn.textContent = teacherGodSpeed
        ? '⚡ วิ่งไวพิเศษ 2x & พลังงานไม่จำกัด: เปิดอยู่ 🟢'
        : '⚡ วิ่งไวพิเศษ 2x & พลังงานไม่จำกัด: ปิดอยู่';
      godBtn.classList.toggle('primary-btn', teacherGodSpeed);
    }
  }

  function showTeacherAnnouncementBanner(text, teacherName) {
    const banner = document.getElementById('teacher-announce-banner');
    const senderEl = document.getElementById('announce-sender');
    const textEl = document.getElementById('announce-text');
    if (!banner || !textEl) return;
    if (senderEl) senderEl.textContent = `👑 ประกาศด่วนจาก ${teacherName || 'คุณครูผู้สอน'}`;
    textEl.textContent = text;
    banner.classList.remove('hidden');
    SoundFX.questComplete();
    if (announceTimer) clearTimeout(announceTimer);
    announceTimer = setTimeout(() => {
      banner.classList.add('hidden');
    }, 12000);
  }

  function getUnitWarpCoords(unit) {
    const b = GD.BUILDINGS.find((x) => x.units && x.units.includes(Number(unit)));
    if (b) {
      return {
        x: (b.tx + Math.floor(b.tw / 2)) * TILE,
        y: (b.ty + b.th) * TILE + 8,
        title: b.name
      };
    }
    const st = GD.STATIONS.find((s) => s.units && s.units.includes(Number(unit)));
    if (st) {
      return {
        x: st.tx * TILE,
        y: (st.ty + 1) * TILE,
        title: st.name
      };
    }
    return { x: 41 * TILE, y: 26 * TILE, title: 'จัตุรัสกลางหมู่บ้าน' };
  }

  function handleTeacherAdminCommand(cmd) {
    if (!cmd || !cmd.action) return;
    const tName = cmd.teacherName || 'คุณครูผู้สอน';

    if (cmd.action === 'announce' && cmd.text) {
      showTeacherAnnouncementBanner(cmd.text, tName);
    } else if (cmd.action === 'summon') {
      if (cmd.senderId === (window.Multiplayer && Multiplayer.myId)) return;
      closeAllModals();
      closeDialog();
      state.insideBuildingId = cmd.insideBuildingId || null;
      const angle = Math.random() * Math.PI * 2;
      const dist = state.insideBuildingId ? (16 + Math.random() * 18) : (36 + Math.random() * 28);
      const baseX = cmd.x || (state.insideBuildingId ? 7.5 * TILE : 41 * TILE);
      const baseY = cmd.y || (state.insideBuildingId ? 7.5 * TILE : 26 * TILE);
      const nx = baseX + Math.cos(angle) * dist;
      const ny = baseY + Math.sin(angle) * dist;
      state.player.x = isBlockedPixel(nx, ny) ? baseX : nx;
      state.player.y = isBlockedPixel(nx, ny) ? baseY : ny;
      spawnParticles(state.player.x + 16, state.player.y + 16, '#fde047', 26);
      showTeacherAnnouncementBanner(`🧲 ${tName} เรียกตัวนักเรียนมารวมพล!`, tName);
      updateHUD();
    } else if (cmd.action === 'warp_unit' && cmd.unit) {
      closeAllModals();
      closeDialog();
      const bld = getBuildingForUnit(cmd.unit);
      if (bld) {
        enterBuilding(bld.id);
        const offset = (cmd.senderId === (window.Multiplayer && Multiplayer.myId)) ? 0 : ((Math.random() - 0.5) * 48);
        state.player.x = Math.max(2 * TILE, Math.min(13 * TILE, 7.5 * TILE + offset));
      } else {
        const target = getUnitWarpCoords(cmd.unit);
        state.insideBuildingId = null;
        state.player.x = target.x;
        state.player.y = target.y;
      }
      spawnParticles(state.player.x + 16, state.player.y + 16, '#38bdf8', 24);
      showTeacherAnnouncementBanner(`🏠 เข้าสู่ห้องปฏิบัติการสัปดาห์ที่ ${cmd.unit}${bld ? ': ' + bld.shortName : ''}`, tName);
      updateHUD();
    } else if (cmd.action === 'open_lab' && cmd.unit) {
      if (cmd.senderId === (window.Multiplayer && Multiplayer.myId)) return;
      closeDialog();
      openLabModal(Number(cmd.unit), isUnitDone(Number(cmd.unit)));
      showToast(`👑 ${tName} เปิดหน้าต่างแล็บสัปดาห์ที่ ${cmd.unit} ให้ทำพร้อมกัน!`, true);
    } else if (cmd.action === 'open_codex' && cmd.unit) {
      if (cmd.senderId === (window.Multiplayer && Multiplayer.myId)) return;
      closeDialog();
      openCodexModal(Number(cmd.unit));
      showToast(`👑 ${tName} เปิดคู่มือคลังเนื้อหาสัปดาห์ที่ ${cmd.unit}!`, true);
    } else if (cmd.action === 'start_quiz') {
      if (cmd.senderId === (window.Multiplayer && Multiplayer.myId)) return;
      closeDialog();
      openMasterQuiz();
      showTeacherAnnouncementBanner('📝 เริ่มทำแบบทดสอบรวม Master Quiz 18 ข้อ พร้อมกัน!', tName);
    } else if (cmd.action === 'bonus') {
      const addB = Number(cmd.bytes) || 100;
      state.bytes += addB;
      state.energy = state.maxEnergy;
      spawnParticles(state.player.x + 16, state.player.y + 12, '#4ade80', 28);
      SoundFX.questComplete();
      updateHUD();
      saveGame();
      showToast(`🎁 ได้รับโบนัสจาก ${tName}: +${addB} Bytes 🪙 & ฟื้นฟูพลังงานเต็ม 100%!`, true);
    } else if (cmd.action === 'unlock_unit' && cmd.unit) {
      const u = Number(cmd.unit);
      coopOnlineUnits.add(u);
      if (cmd.targetId && !state.completedUnits.includes(u)) {
        state.completedUnits.push(u);
        const nextQ = GD.QUESTS.find((x) => !state.completedUnits.includes(x.unit));
        state.activeQuestId = nextQ ? nextQ.id : null;
        saveGame();
      }
      SoundFX.questComplete();
      updateHUD();
      showToast(`✅ ${tName} อนุมัติผ่านสัปดาห์ที่ ${u} ให้เรียบร้อยแล้ว!`, true);
    } else if (cmd.action === 'unlock_all') {
      for (let u = 1; u <= TOTAL_UNITS; u++) coopOnlineUnits.add(u);
      SoundFX.questComplete();
      updateHUD();
      showToast(`🏆 ${tName} ปลดล็อกอาคารทั้ง 18 สัปดาห์ให้ห้องเรียนออนไลน์ 100%!`, true);
    } else if (cmd.action === 'reset_coop') {
      coopOnlineUnits.clear();
      state.completedUnits.forEach((u) => coopOnlineUnits.add(u));
      updateHUD();
      showToast(`🔄 ${tName} รีเซ็ตสถานะอาคาร Co-op ของห้องเรียนแล้ว`, true);
    }
  }

  function renderTeacherDashboard() {
    syncTeacherAdminUI();
    const cardsEl = document.getElementById('teacher-summary-cards');
    const tableEl = document.getElementById('teacher-table-wrap');
    if (!cardsEl || !tableEl || !window.Multiplayer) return;

    const players = Multiplayer.getAllPlayersSorted();
    const avgPct = players.length
      ? Math.round(players.reduce((acc, p) => acc + (p.doneCount / TOTAL_UNITS) * 100, 0) / players.length)
      : 0;
    const quizTakers = players.filter((p) => p.bestQuiz);
    const avgQuiz = quizTakers.length
      ? (quizTakers.reduce((acc, p) => acc + p.bestQuiz.score, 0) / quizTakers.length).toFixed(1)
      : '-';
    const villageOnlineCount = Array.from({ length: TOTAL_UNITS }, (_, i) => i + 1).filter((u) => isUnitOnlineInVillage(u)).length;

    cardsEl.innerHTML = `
      <div class="teacher-stat-card">
        <div class="teacher-stat-val">${players.length}</div>
        <div class="teacher-stat-lbl">🧑‍🎓 นักเรียนในห้องตอนนี้</div>
      </div>
      <div class="teacher-stat-card">
        <div class="teacher-stat-val">${avgPct}%</div>
        <div class="teacher-stat-lbl">📊 ความคืบหน้าเฉลี่ยทั้งห้อง</div>
      </div>
      <div class="teacher-stat-card">
        <div class="teacher-stat-val">${villageOnlineCount}/${TOTAL_UNITS}</div>
        <div class="teacher-stat-lbl">🟢 สัปดาห์ที่หมู่บ้านออนไลน์</div>
      </div>
      <div class="teacher-stat-card">
        <div class="teacher-stat-val">${avgQuiz}</div>
        <div class="teacher-stat-lbl">📝 คะแนน Master Quiz เฉลี่ย</div>
      </div>
    `;

    const selUnit = getSelectedAdminUnit();

    tableEl.innerHTML = `
      <table class="mp-table">
        <thead>
          <tr>
            <th>ชื่อ-นามสกุล</th>
            <th>ห้อง / รหัส</th>
            <th>โซนปัจจุบัน</th>
            <th>ผ่านแล้ว</th>
            <th>รายการสัปดาห์ที่ผ่าน</th>
            <th>Quiz สูงสุด</th>
            <th>สถานะ</th>
            ${isTeacherAdmin ? '<th>👑 จัดการรายบุคคล (แอดมินครู)</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${players.map((p) => {
            const wList = (p.completedUnits || []).slice().sort((a, b) => a - b).join(', ') || 'ยังไม่เริ่ม';
            const roleBadge = p.isTeacher ? ' <span class="admin-badge-live" style="font-size:10px;padding:1px 6px;">👑 ครู</span>' : '';
            return `
              <tr class="${p.isMe ? 'me-row' : ''}">
                <td>${escapeHtml(p.name)}${roleBadge} ${p.isMe ? '(คุณ)' : ''}</td>
                <td>${escapeHtml(p.studentClass || '-')}</td>
                <td>${escapeHtml(p.zone || '-')}</td>
                <td><strong>${p.doneCount}/${TOTAL_UNITS}</strong></td>
                <td style="font-size:12px;">${wList}</td>
                <td>${p.bestQuiz ? `${p.bestQuiz.score}/${p.bestQuiz.total}` : 'ยังไม่สอบ'}</td>
                <td><span class="mp-online-badge">● ออนไลน์</span></td>
                ${isTeacherAdmin ? `
                  <td>
                    <div class="student-admin-actions">
                      ${!p.isMe ? `
                        <button class="student-admin-btn" data-stu-act="goto" data-stu-id="${escapeHtml(p.id)}" title="วาร์ปครูไปหานักเรียนคนนี้">👁️ ไปหา</button>
                        <button class="student-admin-btn" data-stu-act="pull" data-stu-id="${escapeHtml(p.id)}" title="ดึงนักเรียนคนนี้มาหาครู">🧲 ดึงมา</button>
                      ` : ''}
                      <button class="student-admin-btn" data-stu-act="bonus" data-stu-id="${escapeHtml(p.id)}" title="แจกโบนัส +50 Bytes ให้นักเรียนคนนี้">🎁 +50🪙</button>
                      <button class="student-admin-btn" data-stu-act="pass" data-stu-id="${escapeHtml(p.id)}" title="อนุมัติให้ผ่านสัปดาห์ที่ ${selUnit}">✅ ให้ผ่าน W${selUnit}</button>
                    </div>
                  </td>
                ` : ''}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    if (isTeacherAdmin) {
      tableEl.querySelectorAll('.student-admin-btn').forEach((btn) => {
        btn.onclick = () => {
          SoundFX.click();
          const act = btn.dataset.stuAct;
          const sid = btn.dataset.stuId;
          const targetP = players.find((x) => x.id === sid);
          if (!targetP) return;

          if (act === 'goto') {
            closeAllModals();
            state.insideBuildingId = targetP.insideBuildingId || null;
            state.player.x = targetP.x || 41 * TILE;
            state.player.y = (targetP.y || 26 * TILE) + (state.insideBuildingId ? 8 : 24);
            spawnParticles(state.player.x + 16, state.player.y + 16, '#fde047', 22);
            showToast(`👁️ วาร์ปมาหานักเรียน "${targetP.name}" แล้ว!`, true);
          } else if (act === 'pull') {
            Multiplayer.sendAdminCommand({
              action: 'summon',
              targetId: sid,
              insideBuildingId: state.insideBuildingId || null,
              x: Math.round(state.player.x),
              y: Math.round(state.player.y),
              chatText: `🧲 คุณครูดึงตัว ${targetP.name} มาพบที่จุดรวมพล`
            });
            showToast(`🧲 ดึงตัว "${targetP.name}" มาหาครูแล้ว!`, true);
          } else if (act === 'bonus') {
            Multiplayer.sendAdminCommand({
              action: 'bonus',
              targetId: sid,
              bytes: 50,
              chatText: `🎁 คุณครูมอบโบนัสพิเศษ +50 Bytes ให้ ${targetP.name}!`
            });
            showToast(`🎁 ส่งโบนัส +50 Bytes ให้ "${targetP.name}" แล้ว!`, true);
          } else if (act === 'pass') {
            const u = getSelectedAdminUnit();
            if (targetP.isMe) {
              if (!state.completedUnits.includes(u)) state.completedUnits.push(u);
              coopOnlineUnits.add(u);
              saveGame();
              updateHUD();
              renderTeacherDashboard();
            } else {
              Multiplayer.sendAdminCommand({
                action: 'unlock_unit',
                targetId: sid,
                unit: u,
                chatText: `✅ คุณครูอนุมัติให้ ${targetP.name} ผ่านสัปดาห์ที่ ${u}!`
              });
            }
            showToast(`✅ อนุมัติให้ "${targetP.name}" ผ่านสัปดาห์ที่ ${u} เรียบร้อย!`, true);
          }
        };
      });
    }
  }

  function appendChatBubbleUI(entry) {
    const box = document.getElementById('chat-messages');
    if (!box) return;
    const div = document.createElement('div');
    div.className = 'chat-msg' + (entry.system ? ' sys' : '');
    if (entry.system) {
      div.innerHTML = `<span class="chat-time">${entry.time || ''}</span>${escapeHtml(entry.text)}`;
    } else {
      div.innerHTML = `<span class="chat-time">${entry.time || ''}</span><strong>${escapeHtml(entry.name)}:</strong> ${escapeHtml(entry.text)}`;
      if (entry.senderId === Multiplayer.myId) {
        myBubble = entry.text;
        myBubbleUntil = Date.now() + 5500;
      }
    }
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function clearChatMessagesUI() {
    const box = document.getElementById('chat-messages');
    if (box) box.innerHTML = '';
  }

  if (window.Multiplayer) {
    Multiplayer.init({
      getLocalPlayer: () => ({
        name: (state.profile && state.profile.studentName) || DEFAULT_PROFILE.studentName,
        studentClass: (state.profile && state.profile.studentClass) || DEFAULT_PROFILE.studentClass,
        x: Math.round(state.player.x),
        y: Math.round(state.player.y),
        dir: state.player.dir,
        frame: state.player.frame,
        skin: GD.PLAYER_STYLE.skin,
        hair: GD.PLAYER_STYLE.hair,
        hairStyle: GD.PLAYER_STYLE.hairStyle,
        faceStyle: GD.PLAYER_STYLE.faceStyle,
        shirt: GD.PLAYER_STYLE.shirt,
        shirtStyle: GD.PLAYER_STYLE.shirtStyle,
        pants: GD.PLAYER_STYLE.pants,
        shoes: GD.PLAYER_STYLE.shoes,
        hat: GD.PLAYER_STYLE.hat || '',
        headMiddle: GD.PLAYER_STYLE.headMiddle || '',
        headLower: GD.PLAYER_STYLE.headLower || '',
        zone: getZoneName(Math.floor((state.player.x + 16) / TILE), Math.floor((state.player.y + 16) / TILE)),
        insideBuildingId: state.insideBuildingId || null,
        completedUnits: state.completedUnits,
        bestQuiz: state.bestMasterQuiz,
        bytes: state.bytes,
        isTeacher: isTeacherAdmin
      }),
      onCoopUnitUnlocked: (unit, byName) => {
        if (!coopOnlineUnits.has(unit)) {
          coopOnlineUnits.add(unit);
          if (!isUnitDone(unit)) {
            showToast(`🤝 ${byName || 'เพื่อนร่วมห้อง'} ฟื้นฟูสัปดาห์ที่ ${unit} สำเร็จ! อาคารออนไลน์ร่วมกันแล้ว!`, true);
          }
        }
      },
      onChatMessage: appendChatBubbleUI,
      onChatCleared: clearChatMessagesUI,
      onToast: showToast,
      onAdminCommand: handleTeacherAdminCommand,
      onStatusChange: (st) => {
        const bar = document.getElementById('mp-status-bar');
        const lbl = document.getElementById('mp-btn-label');
        const discBtn = document.getElementById('btn-mp-disconnect');
        const invBtn = document.getElementById('btn-mp-invite-link');
        const chatHud = document.getElementById('hud-chat');
        const badge = document.getElementById('chat-room-badge');
        if (bar) bar.textContent = 'สถานะ: ' + st.statusText;
        if (lbl) lbl.textContent = st.connected ? `เพื่อน (${Multiplayer.getStatus().onlineCount})` : 'เพื่อน/ครู';
        if (discBtn) discBtn.classList.toggle('hidden', !st.connected);
        if (invBtn) invBtn.classList.toggle('hidden', !(st.connected && window.location.protocol.startsWith('http')));
        if (chatHud) chatHud.classList.toggle('hidden', !st.connected);
        if (badge) badge.textContent = st.roomCode ? `💬 ห้อง ${st.roomCode}` : '💬 แชทในห้อง';
        const roomInput = document.getElementById('mp-room-input');
        if (roomInput && st.roomCode && st.mode === 'p2p-host') roomInput.value = st.roomCode;
      }
    });

    // Update online player count badge periodically
    setInterval(() => {
      const st = Multiplayer.getStatus();
      const lbl = document.getElementById('mp-btn-label');
      if (st.connected && lbl) lbl.textContent = `เพื่อน (${st.onlineCount})`;
    }, 1500);
  }

  // Multiplayer Modal Controls (Firebase 40–100 + Online Room Code + LAN)
  document.querySelectorAll('.mp-tab-btn').forEach((btn) => {
    btn.onclick = () => {
      SoundFX.click();
      switchMpTab(btn.dataset.mptab);
    };
  });

  const urlParams = new URLSearchParams(window.location.search);
  const fbUrlInput = document.getElementById('mp-fb-url');
  const fbRoomInput = document.getElementById('mp-fb-room');
  const lanUrlInput = document.getElementById('mp-lan-url');

  if (lanUrlInput && window.location.protocol.startsWith('http')) {
    lanUrlInput.value = window.location.origin;
  }

  // Prefill Firebase URL & Room from URL params, firebase-config.js, or last used
  const cfgFb = window.SERVER_VALLEY_FIREBASE || {};
  const initFbUrl = urlParams.get('fb') || cfgFb.databaseURL || localStorage.getItem('sv_last_fb_url') || '';
  const initFbRoom = urlParams.get('room') || cfgFb.defaultRoom || 'CLASS1';
  if (fbUrlInput && initFbUrl) fbUrlInput.value = initFbUrl;
  if (fbRoomInput && initFbRoom) fbRoomInput.value = initFbRoom;

  function autoJoinFromInviteOrConfig() {
    if (!window.Multiplayer) return;
    const pFb = urlParams.get('fb');
    const pRoom = urlParams.get('room');
    const pLan = urlParams.get('lan');
    if (pFb) {
      Multiplayer.connectFirebaseRoom(pFb, pRoom || 'CLASS1');
    } else if (pLan && window.location.protocol.startsWith('http')) {
      Multiplayer.connectLanServer(window.location.origin, pRoom || 'CLASS1');
    } else if (pRoom) {
      Multiplayer.joinOnlineRoom(pRoom);
    } else if (cfgFb.databaseURL && cfgFb.autoJoinOnStart) {
      Multiplayer.connectFirebaseRoom(cfgFb.databaseURL, cfgFb.defaultRoom || 'CLASS1');
    }
  }

  function copyTextToClipboard(text, okMsg) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    showToast(okMsg, true);
  }

  document.getElementById('mp-coop-toggle').onchange = (e) => {
    if (window.Multiplayer) Multiplayer.setCoopShared(e.target.checked);
  };
  document.getElementById('btn-mp-fb-connect').onclick = () => {
    SoundFX.click();
    const u = fbUrlInput.value.trim();
    const r = fbRoomInput.value.trim() || 'CLASS1';
    if (u) try { localStorage.setItem('sv_last_fb_url', u); } catch (e) {}
    Multiplayer.connectFirebaseRoom(u, r);
  };
  document.getElementById('btn-mp-fb-copy-link').onclick = () => {
    const u = fbUrlInput.value.trim();
    const r = (fbRoomInput.value.trim() || 'CLASS1').toUpperCase();
    if (!u) return showToast('⚠️ กรุณาวาง Firebase Database URL ก่อนคัดลอกลิงก์ชวนเพื่อน');
    if (!window.location.protocol.startsWith('http')) {
      return showToast('💡 อัปโหลดขึ้น GitHub Pages ก่อน แล้วปุ่มนี้จะสร้างลิงก์ชวนนักเรียนทั้งห้องให้ทันที!');
    }
    const link = `${window.location.origin}${window.location.pathname}?fb=${encodeURIComponent(u)}&room=${encodeURIComponent(r)}`;
    copyTextToClipboard(link, '🔗 คัดลอกลิงก์ชวนเข้าห้องใหญ่ 40–100 คนแล้ว! ส่งให้นักเรียนใน LINE/Classroom ได้เลย');
  };
  document.getElementById('btn-mp-invite-link').onclick = () => {
    const link = Multiplayer.buildInviteLink();
    if (!link) return showToast('เปิดผ่านลิงก์ GitHub Pages / LAN เพื่อสร้างลิงก์ชวน');
    copyTextToClipboard(link, '🔗 คัดลอกลิงก์ชวนเข้าห้องเรียนแล้ว! ส่งให้เพื่อนคลิกเข้าห้องได้ทันที');
  };
  document.getElementById('btn-mp-host').onclick = () => {
    SoundFX.click();
    Multiplayer.hostOnlineRoom(document.getElementById('mp-room-input').value);
  };
  document.getElementById('btn-mp-join').onclick = () => {
    SoundFX.click();
    Multiplayer.joinOnlineRoom(document.getElementById('mp-room-input').value);
  };
  document.getElementById('btn-mp-copy').onclick = () => {
    const val = document.getElementById('mp-room-input').value.trim();
    if (!val) return showToast('ยังไม่มีรหัสห้องให้คัดลอก');
    copyTextToClipboard(val, `📋 คัดลอกรหัสห้อง "${val}" แล้ว!`);
  };
  document.getElementById('btn-mp-lan-connect').onclick = () => {
    SoundFX.click();
    Multiplayer.connectLanServer(
      document.getElementById('mp-lan-url').value,
      document.getElementById('mp-lan-room').value
    );
  };
  document.getElementById('btn-mp-disconnect').onclick = () => Multiplayer.disconnect();
  document.getElementById('btn-lb-refresh').onclick = () => { SoundFX.click(); renderLeaderboard(); };
  document.getElementById('btn-export-csv').onclick = () => {
    SoundFX.pickup();
    Multiplayer.exportTeacherCSV(state.profile.collegeName, state.profile.instructorName);
    showToast('📥 ดาวน์โหลดรายงานคะแนน CSV สำเร็จ! (เปิดใน Excel ได้ทันที)', true);
  };

  // ==================== TEACHER ADMIN CONSOLE WIRING ====================
  const adminUnitSelect = document.getElementById('admin-unit-select');
  if (adminUnitSelect && window.CODEX_UNITS) {
    adminUnitSelect.innerHTML = window.CODEX_UNITS.map((u) => (
      `<option value="${u.id}">สัปดาห์ที่ ${u.id}: ${u.title}</option>`
    )).join('');
    adminUnitSelect.onchange = () => {
      if (isTeacherAdmin) renderTeacherDashboard();
    };
  }

  function getSavedTeacherPin() {
    try {
      const saved = localStorage.getItem(TEACHER_PIN_KEY);
      if (saved && saved !== '1234') return saved;
      return 'Watzero1234';
    } catch (e) {
      return 'Watzero1234';
    }
  }

  const pinInput = document.getElementById('input-teacher-pin');
  const unlockAdminNow = () => {
    const entered = (pinInput && pinInput.value.trim()) || '';
    if (entered !== getSavedTeacherPin()) {
      SoundFX.error();
      showToast('❌ รหัสผ่านแอดมินคุณครูไม่ถูกต้อง');
      return;
    }
    isTeacherAdmin = true;
    if (pinInput) pinInput.value = '';
    try { sessionStorage.setItem(TEACHER_SESSION_KEY, '1'); } catch (e) {}
    SoundFX.questComplete();
    syncTeacherAdminUI();
    renderTeacherDashboard();
    showToast('👑 เปิดโหมดแอดมินสำหรับคุณครูแล้ว! (ปลดล็อกแท็บเชื่อมต่อห้องออนไลน์ & มงกุฎครู 👑)', true);
  };

  document.getElementById('btn-unlock-teacher-admin').onclick = unlockAdminNow;
  if (pinInput) {
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') unlockAdminNow();
    });
  }

  document.getElementById('btn-lock-teacher-admin').onclick = () => {
    SoundFX.click();
    isTeacherAdmin = false;
    teacherGodSpeed = false;
    try { sessionStorage.removeItem(TEACHER_SESSION_KEY); } catch (e) {}
    syncTeacherAdminUI();
    renderTeacherDashboard();
    showToast('🔒 ปิดโหมดแอดมินสำหรับคุณครูแล้ว');
  };

  document.getElementById('btn-change-teacher-pin').onclick = () => {
    const nextPin = prompt('กำหนดรหัสผ่านใหม่สำหรับโหมดแอดมินครู:', '');
    if (nextPin && nextPin.trim()) {
      try { localStorage.setItem(TEACHER_PIN_KEY, nextPin.trim()); } catch (e) {}
      showToast('🔑 บันทึกรหัสผ่านแอดมินคุณครูใหม่เรียบร้อยแล้ว!', true);
    }
  };

  document.getElementById('btn-announce-close').onclick = () => {
    document.getElementById('teacher-announce-banner').classList.add('hidden');
  };

  const announceInput = document.getElementById('admin-announce-input');
  const sendTeacherAnnouncement = (textVal) => {
    const msg = (textVal || (announceInput && announceInput.value) || '').trim();
    if (!msg) return showToast('⚠️ กรุณาพิมพ์ข้อความประกาศก่อนส่ง');
    Multiplayer.sendAdminCommand({
      action: 'announce',
      text: msg,
      chatText: `📢 [ประกาศจากคุณครู] ${msg}`
    });
    if (announceInput) announceInput.value = '';
    showToast('📢 ส่งประกาศขึ้นหน้าจอนักเรียนทั้งห้องเรียบร้อยแล้ว!', true);
  };

  document.getElementById('btn-admin-announce').onclick = () => sendTeacherAnnouncement();
  if (announceInput) {
    announceInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendTeacherAnnouncement();
    });
  }
  document.querySelectorAll('.admin-preset-msg').forEach((btn) => {
    btn.onclick = () => sendTeacherAnnouncement(btn.dataset.msg);
  });

  // Classroom Remote Broadcast Buttons
  document.getElementById('btn-admin-warp-class').onclick = () => {
    const u = getSelectedAdminUnit();
    Multiplayer.sendAdminCommand({
      action: 'warp_unit',
      unit: u,
      chatText: `📍 คุณครูวาร์ปนักเรียนทั้งห้องไปยังอาคารสัปดาห์ที่ ${u}!`
    });
  };

  document.getElementById('btn-admin-open-lab-class').onclick = () => {
    const u = getSelectedAdminUnit();
    Multiplayer.sendAdminCommand({
      action: 'open_lab',
      unit: u,
      chatText: `🖥️ คุณครูสั่งเปิดหน้าต่างแล็บปฏิบัติการสัปดาห์ที่ ${u} บนหน้าจอนักเรียนทุกคน!`
    });
    showToast(`🖥️ สั่งเปิดแล็บสัปดาห์ที่ ${u} บนจอนักเรียนทั้งห้องแล้ว!`, true);
  };

  document.getElementById('btn-admin-open-codex-class').onclick = () => {
    const u = getSelectedAdminUnit();
    Multiplayer.sendAdminCommand({
      action: 'open_codex',
      unit: u,
      chatText: `📖 คุณครูเปิดคู่มือคลังเนื้อหาสัปดาห์ที่ ${u} ให้นักเรียนทุกคนอ่านพร้อมกัน`
    });
    showToast(`📖 สั่งเปิดคู่มือสัปดาห์ที่ ${u} บนจอนักเรียนทั้งห้องแล้ว!`, true);
  };

  document.getElementById('btn-admin-summon-all').onclick = () => {
    closeAllModals();
    Multiplayer.sendAdminCommand({
      action: 'summon',
      insideBuildingId: state.insideBuildingId || null,
      x: Math.round(state.player.x),
      y: Math.round(state.player.y),
      chatText: '🧲 คุณครูเรียกตัวนักเรียนทุกคนมารวมพลที่ตำแหน่งของคุณครู!'
    });
    spawnParticles(state.player.x + 16, state.player.y + 16, '#fde047', 30);
    showToast('🧲 เรียกตัวนักเรียนทั้งห้องมารวมพลรอบตัวคุณครูแล้ว!', true);
  };

  document.getElementById('btn-admin-start-quiz-all').onclick = () => {
    Multiplayer.sendAdminCommand({
      action: 'start_quiz',
      chatText: '📝 คุณครูสั่งเริ่มทำแบบทดสอบรวม Master Quiz 18 ข้อ พร้อมกันทั้งห้อง!'
    });
    showToast('📝 สั่งเปิดหน้าจอสอบ Master Quiz 18 ข้อ ให้นักเรียนทั้งห้องแล้ว!', true);
  };

  document.getElementById('btn-admin-bonus-all').onclick = () => {
    Multiplayer.sendAdminCommand({
      action: 'bonus',
      bytes: 100,
      chatText: '🎁 คุณครูแจกโบนัสพิเศษ +100 Bytes 🪙 และฟื้นฟูพลังงานเต็ม 100% ให้นักเรียนทั้งห้อง!'
    });
  };

  document.getElementById('btn-admin-unlock-unit-coop').onclick = () => {
    const u = getSelectedAdminUnit();
    coopOnlineUnits.add(u);
    Multiplayer.sendAdminCommand({
      action: 'unlock_unit',
      unit: u,
      chatText: `✅ คุณครูปลดล็อกอาคารสัปดาห์ที่ ${u} ให้ออนไลน์ทั้งห้องเรียนแล้ว!`
    });
    renderTeacherDashboard();
  };

  document.getElementById('btn-admin-unlock-all-coop').onclick = () => {
    for (let u = 1; u <= TOTAL_UNITS; u++) coopOnlineUnits.add(u);
    Multiplayer.sendAdminCommand({
      action: 'unlock_all',
      chatText: '🏆 คุณครูปลดล็อกอาคารครบทั้ง 18 สัปดาห์ให้ห้องเรียนออนไลน์ 100%!'
    });
    renderTeacherDashboard();
  };

  document.getElementById('btn-admin-reset-coop').onclick = () => {
    if (!confirm('ต้องการรีเซ็ตสถานะอาคาร Co-op ของห้องเรียนนี้ (สำหรับสอนห้องถัดไป) หรือไม่?')) return;
    coopOnlineUnits.clear();
    Multiplayer.sendAdminCommand({
      action: 'reset_coop',
      chatText: '🔄 คุณครูรีเซ็ตสถานะอาคาร Co-op ของห้องเรียนเพื่อเริ่มคาบเรียนใหม่'
    });
    renderTeacherDashboard();
  };

  // Teacher Personal God-Mode & Demo Tools
  document.getElementById('btn-admin-godspeed').onclick = () => {
    SoundFX.pickup();
    teacherGodSpeed = !teacherGodSpeed;
    if (teacherGodSpeed) state.energy = state.maxEnergy;
    syncTeacherAdminUI();
    updateHUD();
    showToast(teacherGodSpeed ? '⚡ เปิดโหมดครูวิ่งไว 2x & พลังงานไม่จำกัดแล้ว!' : '⚡ ปิดโหมดวิ่งไว 2x แล้ว', true);
  };

  document.getElementById('btn-admin-open-lab-self').onclick = () => {
    const u = getSelectedAdminUnit();
    openLabModal(u, isUnitDone(u));
  };

  document.getElementById('btn-admin-warp-self').onclick = () => {
    const u = getSelectedAdminUnit();
    const bld = getBuildingForUnit(u);
    if (bld) {
      enterBuilding(bld.id);
    } else {
      const target = getUnitWarpCoords(u);
      closeAllModals();
      state.insideBuildingId = null;
      state.player.x = target.x;
      state.player.y = target.y;
      spawnParticles(state.player.x + 16, state.player.y + 16, '#fde047', 24);
      updateHUD();
      showToast(`🚀 วาร์ปมายังสัปดาห์ที่ ${u}: ${target.title}`, true);
    }
  };

  document.getElementById('btn-admin-unlock-all-self').onclick = () => {
    for (let u = 1; u <= TOTAL_UNITS; u++) {
      if (!state.completedUnits.includes(u)) state.completedUnits.push(u);
      coopOnlineUnits.add(u);
    }
    state.activeQuestId = null;
    SoundFX.questComplete();
    saveGame();
    updateHUD();
    renderTeacherDashboard();
    showToast('🔓 ปลดล็อกครบทั้ง 18 สัปดาห์บนเครื่องครูเรียบร้อยแล้ว!', true);
  };

  document.getElementById('btn-admin-all-items').onclick = () => {
    Object.keys(GD.ITEMS).forEach((itemId) => {
      if (!hasItem(itemId)) {
        state.inventory.push({ id: itemId, qty: 1 });
      }
    });
    state.bytes += 1000;
    state.energy = state.maxEnergy;
    SoundFX.questComplete();
    renderHotbar();
    updateHUD();
    saveGame();
    renderTeacherDashboard();
    showToast('🎒 เสกไอเท็มครบทุกชิ้น + 1,000 Bytes 🪙 เข้ากระเป๋าครูแล้ว!', true);
  };

  document.getElementById('btn-admin-time-day').onclick = () => {
    state.minutes = 8 * 60 + 30;
    updateHUD();
    showToast('☀️ เปลี่ยนเวลาในเกมเป็นช่วงเช้า (08:30 น.)', true);
  };
  document.getElementById('btn-admin-time-eve').onclick = () => {
    state.minutes = 17 * 60 + 15;
    updateHUD();
    showToast('🌇 เปลี่ยนเวลาในเกมเป็นช่วงเย็น Golden Hour (17:15 น.)', true);
  };
  document.getElementById('btn-admin-time-night').onclick = () => {
    state.minutes = 20 * 60;
    updateHUD();
    showToast('🌙 เปลี่ยนเวลาในเกมเป็นช่วงกลางคืน (20:00 น.)', true);
  };

  // In-Game Chat Controls
  const chatInput = document.getElementById('chat-input');
  const sendChatNow = () => {
    if (!chatInput || !chatInput.value.trim()) return;
    Multiplayer.sendChat(chatInput.value);
    chatInput.value = '';
    chatInput.blur();
    SoundFX.talk();
  };
  document.getElementById('btn-chat-send').onclick = sendChatNow;
  chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChatNow(); });
  document.querySelectorAll('.emote-pill').forEach((b) => {
    b.onclick = () => {
      Multiplayer.sendChat(b.dataset.emote);
      SoundFX.talk();
    };
  });
  const btnChatCollapse = document.getElementById('btn-chat-collapse');
  const chatBodyWrap = document.getElementById('chat-body-wrap');
  if (btnChatCollapse && chatBodyWrap) {
    btnChatCollapse.onclick = () => {
      SoundFX.click();
      const isHidden = chatBodyWrap.classList.toggle('hidden');
      btnChatCollapse.textContent = isHidden ? '🔼 แสดง' : '🔽 ย่อ';
      btnChatCollapse.title = isHidden ? 'แสดงช่องแชท' : 'ย่อช่องแชท';
    };
  }

  const btnQuestCollapse = document.getElementById('btn-quest-collapse');
  const questTrackerBody = document.getElementById('quest-tracker-body');
  if (btnQuestCollapse && questTrackerBody) {
    btnQuestCollapse.onclick = () => {
      SoundFX.click();
      const isHidden = questTrackerBody.classList.toggle('hidden');
      btnQuestCollapse.textContent = isHidden ? '🔼 แสดง' : '🔽 ย่อ';
      btnQuestCollapse.title = isHidden ? 'แสดงรายละเอียดเควสปัจจุบัน' : 'ย่อกรอบเควสปัจจุบัน';
    };
  }

  // Title Buttons & Prefill Saved Profile
  const saved = loadGame();
  if (saved && saved.profile) {
    Object.assign(setupProfile, saved.profile);
    if (inStudentName && saved.profile.studentName !== DEFAULT_PROFILE.studentName) inStudentName.value = saved.profile.studentName;
    if (inStudentClass && saved.profile.studentClass !== DEFAULT_PROFILE.studentClass) inStudentClass.value = saved.profile.studentClass;
    if (inCollegeName && saved.profile.collegeName !== DEFAULT_PROFILE.collegeName) inCollegeName.value = saved.profile.collegeName;
    if (inInstructorName && saved.profile.instructorName !== DEFAULT_PROFILE.instructorName) inInstructorName.value = saved.profile.instructorName;
  }
  renderSetupAvatar();

  if (saved && saved.started) {
    document.getElementById('btn-continue-game').classList.remove('hidden');
  }
  document.getElementById('btn-new-game').onclick = () => startGameplay(null);
  document.getElementById('btn-continue-game').onclick = () => startGameplay(loadGame());
  document.getElementById('btn-title-codex').onclick = () => {
    SoundFX.init();
    openCodexModal(1);
  };

  // HUD Quick Menu Buttons
  document.getElementById('btn-multiplayer').onclick = () => openMultiplayerModal(isTeacherAdmin ? 'connect' : 'leaderboard');
  document.getElementById('btn-teacher-admin').onclick = () => openMultiplayerModal('teacher');
  syncTeacherAdminUI();
  document.getElementById('btn-codex').onclick = () => openCodexModal();
  document.getElementById('btn-quests').onclick = openQuestsModal;
  document.getElementById('btn-open-quests').onclick = openQuestsModal;
  document.getElementById('btn-map').onclick = openMapModal;
  document.getElementById('btn-shop').onclick = openShopModal;
  document.getElementById('btn-cert-quick').onclick = openCertModal;
  document.getElementById('btn-help').onclick = () => openModal('modal-help');
  document.getElementById('btn-audio').onclick = () => {
    const on = SoundFX.toggle();
    document.getElementById('btn-audio').innerHTML = on ? '🔊<span>เสียง</span>' : '🔇<span>เงียบ</span>';
  };
  const bannerEl = document.getElementById('selected-item-banner');
  bannerEl.style.cursor = 'pointer';
  bannerEl.onclick = useSelectedItem;

  // Movement Controls Settings Wiring (WASD / Arrows / Both)
  function syncControlModeUI() {
    document.querySelectorAll('#ctrl-mode-group [data-ctrl-mode]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.ctrlMode === controlMode);
    });
    const statusEl = document.getElementById('ctrl-mode-status');
    if (statusEl) {
      if (controlMode === 'wasd') {
        statusEl.textContent = 'โหมดปัจจุบัน: ใช้เฉพาะปุ่ม W A S D ในการเดิน (กด Shift ค้างเพื่อวิ่งเร็ว)';
      } else if (controlMode === 'arrows') {
        statusEl.textContent = 'โหมดปัจจุบัน: ใช้เฉพาะปุ่มลูกศร ↑ ↓ ← → ในการเดิน (กด Shift ค้างเพื่อวิ่งเร็ว)';
      } else {
        statusEl.textContent = 'โหมดปัจจุบัน: เดินได้ทั้ง W A S D และปุ่มลูกศร (กด Shift ค้างเพื่อวิ่งเร็ว)';
      }
    }
    if (state.started) renderHotbar();
  }

  document.querySelectorAll('#ctrl-mode-group [data-ctrl-mode]').forEach((btn) => {
    btn.onclick = () => {
      SoundFX.click();
      controlMode = btn.dataset.ctrlMode;
      try { localStorage.setItem(CONTROL_MODE_KEY, controlMode); } catch (e) {}
      syncControlModeUI();
      const label = controlMode === 'wasd' ? 'ปุ่ม W A S D' : controlMode === 'arrows' ? 'ปุ่มลูกศร' : 'W A S D + ลูกศร';
      showToast(`🎮 ตั้งค่าการควบคุมเป็น "${label}" เรียบร้อยแล้ว!`, true);
    };
  });
  syncControlModeUI();

  // Help Modal Buttons
  document.getElementById('btn-win-minigame').onclick = () => {
    openLabModal(14, isUnitDone(14));
  };
  document.getElementById('btn-toggle-touch').onclick = () => {
    document.getElementById('touch-controls').classList.toggle('hidden');
    closeAllModals();
  };
  document.getElementById('btn-master-quiz').onclick = openMasterQuiz;
  document.getElementById('btn-view-cert').onclick = openCertModal;
  document.getElementById('btn-reset-save').onclick = () => {
    if (confirm('ต้องการล้างข้อมูลเซฟและเริ่มเล่นใหม่ทั้งหมดหรือไม่?')) {
      localStorage.removeItem(SAVE_KEY);
      location.reload();
    }
  };

  // Touch Controls Wiring
  document.querySelectorAll('.dpad-btn[data-dir]').forEach((btn) => {
    const d = btn.dataset.dir;
    const on = (e) => { e.preventDefault(); touchDir[d] = true; };
    const off = (e) => { e.preventDefault(); touchDir[d] = false; };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
  });
  document.querySelector('.dpad-btn[data-action="interact"]').onclick = interact;
  document.querySelector('.touch-use-btn').onclick = useSelectedItem;

  // ==================== RETRO ARCADE MINI-GAME ENGINE (PACKET CATCHER & CYBER SNAKE) ====================
  const arcadeCanvas = document.getElementById('arcade-canvas');
  const arcadeCtx = arcadeCanvas ? arcadeCanvas.getContext('2d') : null;
  let arcadeMode = 'catcher'; // 'catcher' | 'snake'
  let arcadeRaf = null;
  let arcadeState = null;
  let arcadeBest = { catcher: 0, snake: 0 };
  try {
    const ab = JSON.parse(localStorage.getItem('sv_arcade_best') || '{}');
    if (ab && typeof ab.catcher === 'number') arcadeBest.catcher = ab.catcher;
    if (ab && typeof ab.snake === 'number') arcadeBest.snake = ab.snake;
  } catch (e) {}

  function stopArcadeLoop() {
    if (arcadeRaf) {
      cancelAnimationFrame(arcadeRaf);
      arcadeRaf = null;
    }
    if (arcadeState) arcadeState.running = false;
  }

  function updateArcadeHUD(statusTxt = '') {
    const scEl = document.getElementById('arcade-score-label');
    const bsEl = document.getElementById('arcade-best-label');
    const stEl = document.getElementById('arcade-status-label');
    const btnC = document.getElementById('btn-arcade-mode-catcher');
    const btnS = document.getElementById('btn-arcade-mode-snake');
    if (scEl) scEl.textContent = `🎯 คะแนน: ${arcadeState ? arcadeState.score : 0}`;
    if (bsEl) bsEl.textContent = `🏆 สถิติสูงสุด: ${arcadeBest[arcadeMode] || 0}`;
    if (stEl && statusTxt) stEl.textContent = statusTxt;
    if (btnC) btnC.classList.toggle('primary-btn', arcadeMode === 'catcher');
    if (btnS) btnS.classList.toggle('primary-btn', arcadeMode === 'snake');
  }

  function finishArcadeRound(reasonText) {
    if (!arcadeState || !arcadeState.running) return;
    arcadeState.running = false;
    const score = arcadeState.score || 0;
    if (score > (arcadeBest[arcadeMode] || 0)) {
      arcadeBest[arcadeMode] = score;
      try { localStorage.setItem('sv_arcade_best', JSON.stringify(arcadeBest)); } catch (e) {}
    }
    const rewardBytes = Math.min(80, Math.floor(score / 2));
    if (rewardBytes > 0) {
      state.bytes += rewardBytes;
      updateHUD();
      saveGame();
      SoundFX.questComplete();
      showToast(`🕹️ จบเกมอาร์เคด! ได้ ${score} คะแนน — รับรางวัล +${rewardBytes} Bytes 🪙`, true);
    } else {
      SoundFX.error();
    }
    updateArcadeHUD(reasonText || `จบเกม! (+${rewardBytes}🪙)`);
  }

  function startArcadeGame(mode = arcadeMode) {
    stopArcadeLoop();
    arcadeMode = mode;
    const W = 440;
    const H = 300;
    const hintEl = document.getElementById('arcade-controls-hint');

    if (mode === 'catcher') {
      arcadeState = {
        running: true,
        score: 0,
        lives: 3,
        paddleX: W / 2 - 36,
        paddleW: 72,
        items: [],
        spawnTick: 0,
        tick: 0
      };
      if (hintEl) hintEl.innerHTML = '📡 <strong>Packet Catcher:</strong> กด <strong>A/D</strong> หรือ <strong>◀ ▶</strong> (หรือแตะบนจอ) รับแพ็กเก็ต 🟢/🪙 หลบไวรัส 👾 (3 ชีวิต)';
      updateArcadeHUD('❤️ ชีวิต: 3');
    } else {
      arcadeState = {
        running: true,
        score: 0,
        grid: 20,
        cols: 22,
        rows: 15,
        snake: [{ x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }],
        dir: { x: 1, y: 0 },
        nextDir: { x: 1, y: 0 },
        food: { x: 15, y: 7 },
        lastStep: performance.now(),
        stepMs: 118
      };
      if (hintEl) hintEl.innerHTML = '🐍 <strong>Cyber Snake:</strong> กด <strong>WASD</strong> หรือ <strong>ลูกศร ▲▼◀▶</strong> บังคับงูเก็บเหรียญ Bytes 🪙 ห้ามชนกำแพงหรือหางตัวเอง!';
      updateArcadeHUD('🐍 กำลังเล่น!');
    }

    const stepArcade = (now) => {
      if (!arcadeCtx || activeModalId !== 'modal-arcade') {
        stopArcadeLoop();
        return;
      }
      drawArcadeFrame(now);
      if (arcadeState && arcadeState.running) {
        arcadeRaf = requestAnimationFrame(stepArcade);
      }
    };
    arcadeRaf = requestAnimationFrame(stepArcade);
  }

  function drawArcadeFrame(now) {
    if (!arcadeCtx || !arcadeState) return;
    const ctxA = arcadeCtx;
    const W = 440;
    const H = 300;
    ctxA.clearRect(0, 0, W, H);

    // Retro Neon Cyber Grid Background
    ctxA.fillStyle = '#020617';
    ctxA.fillRect(0, 0, W, H);
    ctxA.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctxA.lineWidth = 1;
    for (let x = 0; x <= W; x += 20) {
      ctxA.beginPath(); ctxA.moveTo(x, 0); ctxA.lineTo(x, H); ctxA.stroke();
    }
    for (let y = 0; y <= H; y += 20) {
      ctxA.beginPath(); ctxA.moveTo(0, y); ctxA.lineTo(W, y); ctxA.stroke();
    }

    if (arcadeMode === 'catcher') {
      const st = arcadeState;
      if (st.running) {
        st.tick++;
        const spd = 6.2;
        if (keys['KeyA'] || keys['ArrowLeft']) st.paddleX -= spd;
        if (keys['KeyD'] || keys['ArrowRight']) st.paddleX += spd;
        st.paddleX = Math.max(4, Math.min(W - st.paddleW - 4, st.paddleX));

        st.spawnTick++;
        const spawnGap = Math.max(18, 42 - Math.floor(st.score / 5));
        if (st.spawnTick >= spawnGap) {
          st.spawnTick = 0;
          const roll = Math.random();
          const kind = roll < 0.28 ? 'virus' : roll < 0.45 ? 'gold' : 'packet';
          st.items.push({
            x: 18 + Math.random() * (W - 36),
            y: -14,
            vy: 2.3 + Math.min(3.4, st.score * 0.04) + Math.random() * 1.1,
            kind
          });
        }

        for (let i = st.items.length - 1; i >= 0; i--) {
          const it = st.items[i];
          it.y += it.vy;
          // Catch collision with Firewall Paddle
          if (it.y >= H - 36 && it.y <= H - 14 && it.x >= st.paddleX - 8 && it.x <= st.paddleX + st.paddleW + 8) {
            st.items.splice(i, 1);
            if (it.kind === 'virus') {
              st.lives--;
              SoundFX.error();
              updateArcadeHUD(`❤️ ชีวิต: ${st.lives}`);
              if (st.lives <= 0) finishArcadeRound('💥 โดนไวรัส! จบเกม');
            } else {
              st.score += it.kind === 'gold' ? 5 : 2;
              SoundFX.pickup();
              updateArcadeHUD(`❤️ ชีวิต: ${st.lives}`);
            }
            continue;
          }
          if (it.y > H + 16) st.items.splice(i, 1);
        }
      }

      // Draw Falling Packets & Viruses
      st.items.forEach((it) => {
        ctxA.save();
        ctxA.font = 'bold 18px Kanit, sans-serif';
        ctxA.textAlign = 'center';
        if (it.kind === 'virus') {
          ctxA.fillStyle = '#ef4444';
          ctxA.beginPath(); ctxA.arc(it.x, it.y, 11, 0, Math.PI * 2); ctxA.fill();
          ctxA.fillText('👾', it.x, it.y + 6);
        } else if (it.kind === 'gold') {
          ctxA.fillStyle = '#f59e0b';
          ctxA.beginPath(); ctxA.arc(it.x, it.y, 11, 0, Math.PI * 2); ctxA.fill();
          ctxA.fillText('🪙', it.x, it.y + 6);
        } else {
          ctxA.fillStyle = '#10b981';
          ctxA.fillRect(it.x - 10, it.y - 8, 20, 16);
          ctxA.strokeStyle = '#a7f3d0';
          ctxA.lineWidth = 1.5;
          ctxA.strokeRect(it.x - 10, it.y - 8, 20, 16);
          ctxA.fillStyle = '#022c22';
          ctxA.font = 'bold 9px monospace';
          ctxA.fillText('PKT', it.x, it.y + 3);
        }
        ctxA.restore();
      });

      // Draw Server Catcher Paddle
      ctxA.fillStyle = '#38bdf8';
      ctxA.fillRect(st.paddleX, H - 26, st.paddleW, 13);
      ctxA.strokeStyle = '#e0f2fe';
      ctxA.lineWidth = 2;
      ctxA.strokeRect(st.paddleX, H - 26, st.paddleW, 13);
      ctxA.fillStyle = '#082f49';
      ctxA.font = 'bold 9.5px Kanit, sans-serif';
      ctxA.textAlign = 'center';
      ctxA.fillText('SERVER', st.paddleX + st.paddleW / 2, H - 16);
    } else {
      // Cyber Snake Mode
      const st = arcadeState;
      if (st.running && now - st.lastStep >= st.stepMs) {
        st.lastStep = now;
        st.dir = { ...st.nextDir };
        const head = { x: st.snake[0].x + st.dir.x, y: st.snake[0].y + st.dir.y };
        const hitWall = head.x < 0 || head.x >= st.cols || head.y < 0 || head.y >= st.rows;
        const hitSelf = st.snake.some((seg) => seg.x === head.x && seg.y === head.y);
        if (hitWall || hitSelf) {
          finishArcadeRound('💥 ชนแล้ว! จบเกม');
        } else {
          st.snake.unshift(head);
          if (head.x === st.food.x && head.y === st.food.y) {
            st.score += 4;
            st.stepMs = Math.max(72, 118 - Math.floor(st.score / 2));
            SoundFX.pickup();
            updateArcadeHUD('🐍 กำลังเล่น!');
            let tries = 0;
            do {
              st.food = { x: Math.floor(Math.random() * st.cols), y: Math.floor(Math.random() * st.rows) };
              tries++;
            } while (st.snake.some((s) => s.x === st.food.x && s.y === st.food.y) && tries < 40);
          } else {
            st.snake.pop();
          }
        }
      }

      // Draw Glowing Food Byte Coin
      const fx = st.food.x * st.grid + st.grid / 2;
      const fy = st.food.y * st.grid + st.grid / 2;
      ctxA.fillStyle = '#fde047';
      ctxA.beginPath(); ctxA.arc(fx, fy, 7.5, 0, Math.PI * 2); ctxA.fill();
      ctxA.fillStyle = '#78350f';
      ctxA.font = 'bold 10px monospace';
      ctxA.textAlign = 'center';
      ctxA.fillText('B', fx, fy + 3.5);

      // Draw Neon Cyber Snake
      st.snake.forEach((seg, idx) => {
        ctxA.fillStyle = idx === 0 ? '#4ade80' : idx % 2 === 0 ? '#10b981' : '#059669';
        ctxA.fillRect(seg.x * st.grid + 2, seg.y * st.grid + 2, st.grid - 4, st.grid - 4);
        ctxA.strokeStyle = '#bbf7d0';
        ctxA.lineWidth = idx === 0 ? 1.8 : 0.8;
        ctxA.strokeRect(seg.x * st.grid + 2, seg.y * st.grid + 2, st.grid - 4, st.grid - 4);
      });
    }

    if (!arcadeState.running) {
      ctxA.fillStyle = 'rgba(2, 6, 23, 0.72)';
      ctxA.fillRect(0, 0, W, H);
      ctxA.fillStyle = '#fde047';
      ctxA.font = 'bold 22px Kanit, sans-serif';
      ctxA.textAlign = 'center';
      ctxA.fillText(`GAME OVER • ${arcadeState.score} คะแนน`, W / 2, H / 2 - 12);
      ctxA.fillStyle = '#e2e8f0';
      ctxA.font = 'bold 14px Kanit, sans-serif';
      ctxA.fillText('กดปุ่ม "▶ เริ่มเล่น / เล่นใหม่" เพื่อเล่นต่อ!', W / 2, H / 2 + 18);
    }
  }

  function handleArcadeKey(code, key) {
    if (!arcadeState || !arcadeState.running) return;
    if (arcadeMode === 'snake') {
      const d = arcadeState.dir;
      if ((code === 'ArrowUp' || code === 'KeyW') && d.y !== 1) arcadeState.nextDir = { x: 0, y: -1 };
      else if ((code === 'ArrowDown' || code === 'KeyS') && d.y !== -1) arcadeState.nextDir = { x: 0, y: 1 };
      else if ((code === 'ArrowLeft' || code === 'KeyA') && d.x !== 1) arcadeState.nextDir = { x: -1, y: 0 };
      else if ((code === 'ArrowRight' || code === 'KeyD') && d.x !== -1) arcadeState.nextDir = { x: 1, y: 0 };
    }
  }

  function openArcadeModal(initialMode = 'catcher') {
    openModal('modal-arcade');
    startArcadeGame(initialMode);
  }

  const btnArcCatcher = document.getElementById('btn-arcade-mode-catcher');
  const btnArcSnake = document.getElementById('btn-arcade-mode-snake');
  const btnArcStart = document.getElementById('btn-arcade-start');
  if (btnArcCatcher) btnArcCatcher.onclick = () => { SoundFX.click(); startArcadeGame('catcher'); };
  if (btnArcSnake) btnArcSnake.onclick = () => { SoundFX.click(); startArcadeGame('snake'); };
  if (btnArcStart) btnArcStart.onclick = () => { SoundFX.click(); startArcadeGame(arcadeMode); };

  const wireArcBtn = (id, dirCode) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      keys[dirCode] = true;
      handleArcadeKey(dirCode, '');
    });
    const off = () => { keys[dirCode] = false; };
    el.addEventListener('pointerup', off);
    el.addEventListener('pointerleave', off);
  };
  wireArcBtn('btn-arcade-left', 'ArrowLeft');
  wireArcBtn('btn-arcade-right', 'ArrowRight');
  wireArcBtn('btn-arcade-up', 'ArrowUp');
  wireArcBtn('btn-arcade-down', 'ArrowDown');

  if (arcadeCanvas) {
    arcadeCanvas.addEventListener('pointermove', (e) => {
      if (arcadeMode === 'catcher' && arcadeState && arcadeState.running && e.buttons) {
        const r = arcadeCanvas.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * 440;
        arcadeState.paddleX = Math.max(4, Math.min(440 - arcadeState.paddleW - 4, mx - arcadeState.paddleW / 2));
      }
    });
  }

  // Boot Renderer
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(loop);
})();
