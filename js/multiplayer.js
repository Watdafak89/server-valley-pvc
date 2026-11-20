// Server Valley — Dual-Mode Multiplayer Engine
// Supports: (1) Online Room Code via WebRTC/PeerJS, (2) Classroom LAN Server (PowerShell / Python), (3) Local Tab Test
window.Multiplayer = (function () {
  const PEER_PREFIX = 'sv-pvc-18w-';
  const myId = 'p_' + Math.random().toString(36).slice(2, 10);

  let mode = 'offline'; // 'offline' | 'p2p-host' | 'p2p-client' | 'lan' | 'firebase' | 'local-tab'
  let roomCode = '';
  let lanUrl = '';
  let fbUrl = '';
  let coopShared = true;
  let connected = false;
  let statusText = 'ออฟไลน์ (เล่นคนเดียว)';

  // PeerJS objects
  let peer = null;
  let hostConn = null;
  let clientConns = {}; // peerId -> DataConnection

  // LAN / Local-tab objects
  let syncTimer = null;
  let bc = null;

  // Firebase Realtime Database objects (40-100 players on GitHub Pages!)
  let fbApp = null;
  let fbDb = null;
  let fbRoomPath = '';
  let fbListeners = [];
  let fbMyPlayerRef = null;
  let fbLastSentSig = '';
  let fbLastSentAt = 0;

  // Shared Live State
  const peers = {}; // id -> { id, name, studentClass, x, y, tx, ty, dir, frame, shirt, hat, zone, completedUnits[], bestQuiz, bytes, lastSeen, bubble, bubbleUntil }
  const chatLog = []; // { id, name, text, time, system }
  const coopUnits = new Set(); // Shared online units when Co-op mode is ON
  let lastChatSeq = 0;

  // Callbacks wired by main.js
  let hooks = {
    getLocalPlayer: () => null,
    onCoopUnitUnlocked: () => {},
    onChatMessage: () => {},
    onStatusChange: () => {},
    onToast: () => {}
  };

  function nowTimeStr() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function pushChat(entry) {
    if (entry.msgId && chatLog.some((c) => c.msgId === entry.msgId)) return;
    chatLog.push(entry);
    if (chatLog.length > 60) chatLog.shift();

    // Attach floating speech bubble above speaker
    if (entry.senderId && entry.senderId !== myId && peers[entry.senderId]) {
      peers[entry.senderId].bubble = entry.text;
      peers[entry.senderId].bubbleUntil = Date.now() + 5500;
    }
    hooks.onChatMessage(entry);
  }

  function mergeCoopUnits(unitsArr, unlockedByName) {
    if (!coopShared || !Array.isArray(unitsArr)) return;
    unitsArr.forEach((u) => {
      if (!coopUnits.has(u)) {
        coopUnits.add(u);
        hooks.onCoopUnitUnlocked(u, unlockedByName);
      }
    });
  }

  function upsertPeer(data) {
    if (!data || !data.id || data.id === myId) return;
    const prev = peers[data.id];
    if (!prev) {
      peers[data.id] = {
        ...data,
        rx: data.x,
        ry: data.y,
        lastSeen: Date.now(),
        bubble: '',
        bubbleUntil: 0
      };
    } else {
      Object.assign(prev, data, { lastSeen: Date.now() });
    }
    if (coopShared && Array.isArray(data.completedUnits)) {
      mergeCoopUnits(data.completedUnits, data.name);
    }
  }

  function cleanupStalePeers() {
    const cutoff = Date.now() - 12000;
    Object.keys(peers).forEach((id) => {
      if (peers[id].lastSeen < cutoff) delete peers[id];
    });
  }

  function setStatus(newMode, isConn, text) {
    mode = newMode;
    connected = isConn;
    statusText = text;
    hooks.onStatusChange({ mode, connected, statusText, roomCode, lanUrl, coopShared });
  }

  function disconnect(silent = false) {
    if (syncTimer) { clearInterval(syncTimer); syncTimer = null; }
    if (bc) { try { bc.close(); } catch (e) {} bc = null; }
    if (hostConn) { try { hostConn.close(); } catch (e) {} hostConn = null; }
    Object.values(clientConns).forEach((c) => { try { c.close(); } catch (e) {} });
    clientConns = {};
    if (peer) { try { peer.destroy(); } catch (e) {} peer = null; }

    // Clean up Firebase Realtime DB listeners & remove my presence node
    fbListeners.forEach((fn) => { try { fn(); } catch (e) {} });
    fbListeners = [];
    if (fbMyPlayerRef) { try { fbMyPlayerRef.remove(); } catch (e) {} fbMyPlayerRef = null; }
    if (fbApp) { try { fbApp.delete(); } catch (e) {} fbApp = null; fbDb = null; }

    Object.keys(peers).forEach((k) => delete peers[k]);
    roomCode = '';
    setStatus('offline', false, 'ออฟไลน์ (เล่นคนเดียว)');
    if (!silent) hooks.onToast('🔌 ออกจากห้อง Multiplayer แล้ว');
  }

  function makePayload() {
    const p = hooks.getLocalPlayer();
    if (!p) return null;
    return {
      id: myId,
      ...p,
      coopShared,
      coopUnits: Array.from(coopUnits)
    };
  }

  // ==================== MODE 1: ONLINE ROOM CODE (WebRTC / PeerJS) ====================
  function hostOnlineRoom(customCode = '') {
    disconnect(true);
    const code = (customCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || ('SV' + Math.floor(1000 + Math.random() * 9000)));
    roomCode = code;

    if (typeof window.Peer === 'undefined') {
      setStatus('offline', false, 'ไม่พบสัญญาณอินเทอร์เน็ตสำหรับ PeerJS — แนะนำใช้โหมด LAN ห้องแล็บ');
      hooks.onToast('⚠️ โหลดระบบออนไลน์ไม่สำเร็จ (อาจไม่มีอินเทอร์เน็ต) — สามารถใช้โหมด LAN ห้องแล็บได้ทันที!');
      return;
    }

    setStatus('p2p-host', false, `กำลังสร้างห้องออนไลน์ ${code}...`);
    peer = new window.Peer(PEER_PREFIX + code);

    peer.on('open', () => {
      setStatus('p2p-host', true, `🌐 โฮสต์ห้องออนไลน์: ${code} (แชร์รหัสนี้ให้เพื่อน!)`);
      pushChat({ system: true, text: `สร้างห้องออนไลน์สำเร็จ! รหัสห้องคือ ${code}`, time: nowTimeStr() });
      hooks.onToast(`🌐 สร้างห้องสำเร็จ! รหัสห้อง: ${code}`, true);

      // Seed co-op units from host's current completed units
      const me = hooks.getLocalPlayer();
      if (me && Array.isArray(me.completedUnits)) {
        me.completedUnits.forEach((u) => coopUnits.add(u));
      }

      syncTimer = setInterval(() => {
        cleanupStalePeers();
        const meData = makePayload();
        if (!meData) return;
        const snapshot = {
          type: 'snapshot',
          coopShared,
          coopUnits: Array.from(coopUnits),
          players: [meData, ...Object.values(peers)]
        };
        Object.values(clientConns).forEach((c) => {
          if (c.open) c.send(snapshot);
        });
      }, 150);
    });

    peer.on('connection', (conn) => {
      clientConns[conn.peer] = conn;
      conn.on('data', (msg) => {
        if (!msg) return;
        if (msg.type === 'state' && msg.player) {
          upsertPeer(msg.player);
        } else if (msg.type === 'chat' && msg.entry) {
          pushChat(msg.entry);
          // Relay chat to all other clients
          Object.values(clientConns).forEach((c) => {
            if (c.open && c.peer !== conn.peer) c.send(msg);
          });
        }
      });
      conn.on('close', () => {
        delete clientConns[conn.peer];
      });
    });

    peer.on('error', (err) => {
      hooks.onToast('❌ สร้างห้องไม่สำเร็จ: ' + (err.type || err.message));
      setStatus('offline', false, 'สร้างห้องไม่สำเร็จ (ลองเปลี่ยนรหัสห้องหรือใช้โหมด LAN)');
    });
  }

  function joinOnlineRoom(codeInput) {
    disconnect(true);
    const code = codeInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!code) {
      hooks.onToast('⚠️ กรุณากรอกรหัสห้องก่อนเข้าร่วม!');
      return;
    }

    // Special local-tab test code for single-PC testing without internet!
    if (code === 'LOCAL' || code === 'TEST') {
      joinLocalTabRoom(code);
      return;
    }

    if (typeof window.Peer === 'undefined') {
      hooks.onToast('⚠️ ไม่มีอินเทอร์เน็ตสำหรับ PeerJS — ใช้โหมด LAN ห้องแล็บ หรือพิมพ์ LOCAL เพื่อทดสอบ 2 แท็บ!');
      return;
    }

    roomCode = code;
    setStatus('p2p-client', false, `กำลังเชื่อมต่อห้อง ${code}...`);
    peer = new window.Peer();

    peer.on('open', () => {
      hostConn = peer.connect(PEER_PREFIX + code, { reliable: false });
      hostConn.on('open', () => {
        setStatus('p2p-client', true, `🌐 เชื่อมต่อห้อง ${code} สำเร็จ!`);
        pushChat({ system: true, text: `เข้าร่วมห้อง ${code} เรียบร้อย!`, time: nowTimeStr() });
        hooks.onToast(`✅ เข้าร่วมห้อง ${code} สำเร็จ!`, true);

        syncTimer = setInterval(() => {
          cleanupStalePeers();
          const meData = makePayload();
          if (meData && hostConn && hostConn.open) {
            hostConn.send({ type: 'state', player: meData });
          }
        }, 150);
      });

      hostConn.on('data', (msg) => {
        if (!msg) return;
        if (msg.type === 'snapshot') {
          if (typeof msg.coopShared === 'boolean') coopShared = msg.coopShared;
          if (Array.isArray(msg.players)) {
            msg.players.forEach((p) => upsertPeer(p));
          }
          if (Array.isArray(msg.coopUnits)) {
            mergeCoopUnits(msg.coopUnits, 'เพื่อนร่วมห้อง');
          }
        } else if (msg.type === 'chat' && msg.entry) {
          pushChat(msg.entry);
        }
      });

      hostConn.on('close', () => {
        hooks.onToast('🔌 ห้องถูกปิดหรือหลุดการเชื่อมต่อ');
        disconnect(true);
      });
    });

    peer.on('error', (err) => {
      hooks.onToast('❌ เชื่อมต่อห้อง ' + code + ' ไม่สำเร็จ (' + (err.type || 'ไม่พบห้อง') + ')');
      setStatus('offline', false, 'ไม่พบห้อง ' + code);
    });
  }

  // ==================== MODE 2: CLASSROOM LAN SERVER (HTTP JSON SYNC) ====================
  function connectLanServer(urlInput, roomInput = 'CLASS1') {
    disconnect(true);
    let base = (urlInput || '').trim().replace(/\/+$/, '');
    if (!base && window.location.protocol.startsWith('http')) {
      base = window.location.origin;
    }
    if (!base) {
      hooks.onToast('⚠️ กรุณาระบุที่อยู่ LAN Server เช่น http://192.168.1.10:8080');
      return;
    }
    if (!/^https?:\/\//i.test(base)) base = 'http://' + base;

    const rCode = (roomInput || 'CLASS1').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '') || 'CLASS1';
    lanUrl = base;
    roomCode = rCode;
    setStatus('lan', false, `กำลังเชื่อมต่อ LAN Server (${base})...`);

    let failCount = 0;

    async function tickLan() {
      const meData = makePayload();
      if (!meData) return;
      try {
        const res = await fetch(`${lanUrl}/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room: roomCode,
            player: meData,
            coopShared,
            lastChatSeq
          })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        failCount = 0;
        if (!connected) {
          setStatus('lan', true, `🏫 LAN ห้องแล็บ: ${roomCode} (${lanUrl})`);
          pushChat({ system: true, text: `เชื่อมต่อเซิร์ฟเวอร์ห้องแล็บ ${lanUrl} ห้อง ${roomCode} สำเร็จ!`, time: nowTimeStr() });
          hooks.onToast(`🏫 เชื่อมต่อ LAN Server สำเร็จ!`, true);
        }
        cleanupStalePeers();
        if (Array.isArray(data.players)) {
          data.players.forEach((p) => upsertPeer(p));
        }
        if (Array.isArray(data.coopUnits)) {
          mergeCoopUnits(data.coopUnits, 'เพื่อนในห้องแล็บ');
        }
        if (Array.isArray(data.chats)) {
          data.chats.forEach((c) => {
            if (c.seq > lastChatSeq) lastChatSeq = c.seq;
            pushChat(c);
          });
        }
      } catch (e) {
        failCount++;
        if (failCount === 1 || failCount === 5) {
          setStatus('lan', false, `เชื่อมต่อ ${lanUrl} ไม่ได้ (ตรวจว่าครูรัน start-lan-server.bat แล้ว)`);
        }
        if (failCount >= 8) {
          hooks.onToast('❌ ติดต่อ LAN Server ไม่ได้ กรุณาตรวจสอบ IP และพอร์ต (เช่น 8080)');
          disconnect(true);
        }
      }
    }

    tickLan();
    syncTimer = setInterval(tickLan, 250);
  }

  // ==================== MODE 3: SAME-PC MULTI-TAB TEST (BroadcastChannel) ====================
  function joinLocalTabRoom(code) {
    disconnect(true);
    roomCode = code;
    if (typeof BroadcastChannel === 'undefined') {
      hooks.onToast('เบราว์เซอร์นี้ไม่รองรับโหมดทดสอบ 2 แท็บ');
      return;
    }
    bc = new BroadcastChannel('server_valley_tab_' + code);
    setStatus('local-tab', true, `🧪 โหมดทดสอบหลายแท็บ (ห้อง ${code})`);
    pushChat({ system: true, text: `เปิดโหมดทดสอบหลายแท็บ! ลองเปิด index.html อีกแท็บแล้วใส่รหัส ${code}`, time: nowTimeStr() });
    hooks.onToast(`🧪 เชื่อมต่อห้องทดสอบ ${code} แล้ว!`, true);

    bc.onmessage = (ev) => {
      const msg = ev.data;
      if (!msg) return;
      if (msg.type === 'state' && msg.player) upsertPeer(msg.player);
      if (msg.type === 'chat' && msg.entry) pushChat(msg.entry);
    };
    syncTimer = setInterval(() => {
      cleanupStalePeers();
      const meData = makePayload();
      if (meData && bc) bc.postMessage({ type: 'state', player: meData });
    }, 180);
  }

  // ==================== MODE 4: CLOUD CLASSROOM 40–100 PLAYERS (Firebase Realtime DB) ====================
  function connectFirebaseRoom(dbUrlInput, roomInput = 'CLASS1') {
    disconnect(true);
    let url = (dbUrlInput || '').trim().replace(/\/+$/, '');
    if (!url && window.SERVER_VALLEY_FIREBASE && window.SERVER_VALLEY_FIREBASE.databaseURL) {
      url = window.SERVER_VALLEY_FIREBASE.databaseURL.trim().replace(/\/+$/, '');
    }
    if (!url) {
      hooks.onToast('⚠️ กรุณาวาง Firebase Database URL ก่อน (ดูวิธีสร้างฟรี 2 นาทีใน FIREBASE-SETUP.md)');
      return;
    }
    if (!/^https:\/\/.+\.(firebaseio\.com|firebasedatabase\.app)$/i.test(url)) {
      hooks.onToast('⚠️ รูปแบบ URL ไม่ถูกต้อง ต้องขึ้นต้น https:// และลงท้าย .firebasedatabase.app หรือ .firebaseio.com');
      return;
    }
    if (typeof window.firebase === 'undefined' || !window.firebase.database) {
      hooks.onToast('⚠️ โหลด Firebase SDK ไม่สำเร็จ (กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต)');
      return;
    }

    const rCode = (roomInput || 'CLASS1').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '') || 'CLASS1';
    fbUrl = url;
    roomCode = rCode;
    fbRoomPath = 'sv_rooms/' + roomCode;
    fbLastSentSig = '';
    fbLastSentAt = 0;

    setStatus('firebase', false, `กำลังเชื่อมต่อห้องใหญ่ 40–100 คน (${roomCode})...`);

    try {
      fbApp = window.firebase.initializeApp({ databaseURL: fbUrl }, 'sv_mp_' + Date.now());
      fbDb = fbApp.database();
    } catch (err) {
      hooks.onToast('❌ เริ่มต้น Firebase ไม่สำเร็จ: ' + (err.message || err));
      disconnect(true);
      return;
    }

    const playersRef = fbDb.ref(fbRoomPath + '/players');
    const coopRef = fbDb.ref(fbRoomPath + '/coopUnits');
    const chatsRef = fbDb.ref(fbRoomPath + '/chats').limitToLast(40);
    const connRef = fbDb.ref('.info/connected');
    fbMyPlayerRef = playersRef.child(myId);

    const onConn = (snap) => {
      if (snap.val() === true) {
        fbMyPlayerRef.onDisconnect().remove();
        setStatus('firebase', true, `☁️ ห้องใหญ่ 40–100 คน (Firebase): ${roomCode}`);
        pushChat({ system: true, text: `เชื่อมต่อห้องเรียนใหญ่ ${roomCode} (รองรับสูงสุด 100 คน) สำเร็จ!`, time: nowTimeStr() });
        hooks.onToast(`☁️ เข้าห้องใหญ่ "${roomCode}" สำเร็จ! (รองรับ 40–100 คน)`, true);
        pushFirebaseSelf(true);
      }
    };
    connRef.on('value', onConn);
    fbListeners.push(() => connRef.off('value', onConn));

    // Live players listeners (Delta updates -> ultra-fast even with 100 students!)
    const onPlayerAdded = (snap) => {
      const val = snap.val();
      if (val && snap.key !== myId) upsertPeer({ ...val, id: snap.key });
    };
    const onPlayerChanged = (snap) => {
      const val = snap.val();
      if (val && snap.key !== myId) upsertPeer({ ...val, id: snap.key });
    };
    const onPlayerRemoved = (snap) => {
      if (snap.key && peers[snap.key]) delete peers[snap.key];
    };
    playersRef.on('child_added', onPlayerAdded);
    playersRef.on('child_changed', onPlayerChanged);
    playersRef.on('child_removed', onPlayerRemoved);
    fbListeners.push(() => {
      playersRef.off('child_added', onPlayerAdded);
      playersRef.off('child_changed', onPlayerChanged);
      playersRef.off('child_removed', onPlayerRemoved);
    });

    // Shared Co-op unlocked units
    const onCoopAdd = (snap) => {
      const unitNum = Number(snap.key);
      if (unitNum > 0) mergeCoopUnits([unitNum], snap.val() || 'เพื่อนร่วมห้อง');
    };
    coopRef.on('child_added', onCoopAdd);
    fbListeners.push(() => coopRef.off('child_added', onCoopAdd));

    // Live Chat stream (last 40 messages)
    const onChatAdd = (snap) => {
      const entry = snap.val();
      if (entry && entry.text) pushChat(entry);
    };
    chatsRef.on('child_added', onChatAdd);
    fbListeners.push(() => chatsRef.off('child_added', onChatAdd));

    function pushFirebaseSelf(force = false) {
      if (!fbMyPlayerRef) return;
      const p = hooks.getLocalPlayer();
      if (!p) return;
      const now = Date.now();
      const sig = `${p.x},${p.y},${p.dir},${p.frame},${p.completedUnits.length},${p.bytes},${p.zone},${p.name}`;
      if (!force && sig === fbLastSentSig && now - fbLastSentAt < 5000) return;
      fbLastSentSig = sig;
      fbLastSentAt = now;
      fbMyPlayerRef.set({
        id: myId,
        name: p.name,
        studentClass: p.studentClass,
        x: p.x,
        y: p.y,
        dir: p.dir,
        frame: p.frame,
        shirt: p.shirt,
        hat: p.hat,
        zone: p.zone,
        completedUnits: p.completedUnits || [],
        bestQuiz: p.bestQuiz || null,
        bytes: p.bytes || 0,
        ts: now
      }).catch(() => {});
    }

    // Seed local completed units into shared co-op map
    const meNow = hooks.getLocalPlayer();
    if (meNow && Array.isArray(meNow.completedUnits)) {
      meNow.completedUnits.forEach((u) => {
        coopUnits.add(u);
        coopRef.child(String(u)).set(meNow.name || 'นักเรียน').catch(() => {});
      });
    }

    syncTimer = setInterval(() => {
      cleanupStalePeers();
      pushFirebaseSelf(false);
    }, 260);
  }

  function buildInviteLink() {
    if (!window.location.protocol.startsWith('http')) return '';
    const base = window.location.origin + window.location.pathname;
    if (mode === 'firebase' && fbUrl && roomCode) {
      return `${base}?fb=${encodeURIComponent(fbUrl)}&room=${encodeURIComponent(roomCode)}`;
    }
    if ((mode === 'p2p-host' || mode === 'p2p-client') && roomCode) {
      return `${base}?room=${encodeURIComponent(roomCode)}`;
    }
    if (mode === 'lan' && roomCode) {
      return `${base}?lan=1&room=${encodeURIComponent(roomCode)}`;
    }
    return base;
  }

  // ==================== CHAT & EMOTES ====================
  function sendChat(rawText) {
    const text = (rawText || '').trim().slice(0, 120);
    if (!text) return;
    const me = hooks.getLocalPlayer();
    const entry = {
      msgId: myId + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      senderId: myId,
      name: me ? me.name : 'นักเรียน',
      text,
      time: nowTimeStr()
    };
    pushChat(entry);

    if (mode === 'p2p-host') {
      Object.values(clientConns).forEach((c) => {
        if (c.open) c.send({ type: 'chat', entry });
      });
    } else if (mode === 'p2p-client' && hostConn && hostConn.open) {
      hostConn.send({ type: 'chat', entry });
    } else if (mode === 'lan' && connected) {
      fetch(`${lanUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: roomCode, entry })
      }).catch(() => {});
    } else if (mode === 'firebase' && fbDb && connected) {
      fbDb.ref(fbRoomPath + '/chats').push(entry).catch(() => {});
    } else if (mode === 'local-tab' && bc) {
      bc.postMessage({ type: 'chat', entry });
    }
  }

  function notifyUnitCompleted(unit) {
    coopUnits.add(unit);
    const me = hooks.getLocalPlayer();
    if (mode === 'firebase' && fbDb && connected) {
      fbDb.ref(fbRoomPath + '/coopUnits/' + unit).set(me ? me.name : 'นักเรียน').catch(() => {});
    }
    if (connected && me) {
      sendChat(`🎉 ฟื้นฟูสัปดาห์ที่ ${unit} สำเร็จแล้ว!`);
    }
  }

  // Smoothly interpolate peer coordinates each animation frame
  function stepInterpolation() {
    Object.values(peers).forEach((p) => {
      p.rx += (p.x - p.rx) * 0.25;
      p.ry += (p.y - p.ry) * 0.25;
    });
  }

  // Build combined Leaderboard & Teacher Dashboard roster (Me + All Connected Peers)
  function getAllPlayersSorted() {
    const me = hooks.getLocalPlayer();
    const list = [];
    if (me) list.push({ ...me, id: myId, isMe: true });
    Object.values(peers).forEach((p) => list.push({ ...p, isMe: false }));

    list.forEach((p) => {
      const doneCount = Array.isArray(p.completedUnits) ? p.completedUnits.length : 0;
      const quizScore = p.bestQuiz ? p.bestQuiz.score : 0;
      p.doneCount = doneCount;
      p.quizScore = quizScore;
      p.totalScore = doneCount * 100 + quizScore * 20 + (p.bytes || 0);
    });

    list.sort((a, b) => b.totalScore - a.totalScore || b.doneCount - a.doneCount);
    return list;
  }

  // Export Teacher CSV Report (UTF-8 BOM so Thai characters open cleanly in Microsoft Excel!)
  function exportTeacherCSV(collegeName, instructorName) {
    const players = getAllPlayersSorted();
    const headers = [
      'อันดับ', 'ชื่อ-นามสกุล', 'ระดับชั้น/ห้อง', 'โซนปัจจุบัน',
      'ผ่านแล้ว (สัปดาห์)', 'คิดเป็น (%)', 'รายการสัปดาห์ที่ผ่าน',
      'คะแนน Master Quiz', 'เหรียญ Bytes', 'คะแนนรวม', 'วิทยาลัย', 'ครูผู้สอน'
    ];
    const esc = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const rows = [headers.map(esc).join(',')];

    players.forEach((p, idx) => {
      const pct = Math.round((p.doneCount / 18) * 100);
      const weeksStr = (p.completedUnits || []).slice().sort((a, b) => a - b).join(' ');
      const quizStr = p.bestQuiz ? `${p.bestQuiz.score}/${p.bestQuiz.total}` : 'ยังไม่สอบ';
      rows.push([
        idx + 1, p.name, p.studentClass || '-', p.zone || '-',
        `${p.doneCount}/18`, pct + '%', weeksStr || '-',
        quizStr, p.bytes || 0, p.totalScore, collegeName || '-', instructorName || '-'
      ].map(esc).join(','));
    });

    const csvContent = '\uFEFF' + rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `server-valley-scores-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return {
    myId,
    init(h) {
      hooks = { ...hooks, ...h };
    },
    hostOnlineRoom,
    joinOnlineRoom,
    connectLanServer,
    connectFirebaseRoom,
    buildInviteLink,
    disconnect,
    sendChat,
    notifyUnitCompleted,
    stepInterpolation,
    getPeers() { return Object.values(peers); },
    getChatLog() { return chatLog; },
    getAllPlayersSorted,
    exportTeacherCSV,
    setCoopShared(val) {
      coopShared = !!val;
      hooks.onStatusChange({ mode, connected, statusText, roomCode, lanUrl, coopShared });
    },
    getStatus() {
      return {
        mode, connected, statusText, roomCode, lanUrl, coopShared,
        onlineCount: 1 + Object.keys(peers).length
      };
    }
  };
})();
