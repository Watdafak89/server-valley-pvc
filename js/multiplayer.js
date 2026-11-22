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
  let lastAdminCmdId = '';
  let roomJoinedAt = 0;
  let hadOnlinePeersInRoom = false;

  // Callbacks wired by main.js
  let hooks = {
    getLocalPlayer: () => null,
    onCoopUnitUnlocked: () => {},
    onChatMessage: () => {},
    onChatCleared: () => {},
    onStatusChange: () => {},
    onToast: () => {},
    onAdminCommand: () => {}
  };

  function clearLocalChat(showSysMsg = '') {
    chatLog.length = 0;
    lastChatSeq = 0;
    hooks.onChatCleared();
    if (showSysMsg) {
      pushChat({
        msgId: 'sys_clear_' + Date.now(),
        system: true,
        text: showSysMsg,
        time: nowTimeStr()
      });
    }
  }

  function clearRoomChatIfEmpty(reasonMsg = '🧹 ล้างประวัติช่องแชทอัตโนมัติ เนื่องจากไม่มีผู้เล่นออนไลน์อยู่ในห้อง') {
    if (Object.keys(peers).length > 0) return;
    if (mode === 'firebase' && fbDb && fbRoomPath) {
      fbDb.ref(fbRoomPath + '/chats').remove().catch(() => {});
    }
    clearLocalChat(connected ? reasonMsg : '');
  }

  function handleIncomingAdminCmd(cmd) {
    if (!cmd || !cmd.cmdId || cmd.cmdId === lastAdminCmdId) return;
    if (cmd.ts && roomJoinedAt && cmd.ts < roomJoinedAt - 3000) return;
    lastAdminCmdId = cmd.cmdId;
    if (cmd.action === 'reset_coop') {
      coopUnits.clear();
    }
    if (cmd.targetId && cmd.targetId !== myId) return;
    hooks.onAdminCommand(cmd);
  }

  function nowTimeStr() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function pushChat(entry) {
    if (entry && entry.adminCmd) {
      handleIncomingAdminCmd(entry.adminCmd);
      if (entry.silentAdmin) return;
    }
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
    hadOnlinePeersInRoom = true;
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
    const beforeCount = Object.keys(peers).length;
    Object.keys(peers).forEach((id) => {
      if (peers[id].lastSeen < cutoff) delete peers[id];
    });
    const afterCount = Object.keys(peers).length;
    if (beforeCount > 0 && afterCount === 0 && hadOnlinePeersInRoom) {
      hadOnlinePeersInRoom = false;
      clearRoomChatIfEmpty('🧹 ล้างช่องแชทอัตโนมัติ เนื่องจากผู้เล่นคนอื่นออกจากห้องหมดแล้ว');
    }
  }

  function setStatus(newMode, isConn, text) {
    mode = newMode;
    connected = isConn;
    statusText = text;
    hooks.onStatusChange({ mode, connected, statusText, roomCode, lanUrl, coopShared });
  }

  function disconnect(silent = false) {
    const wasFirebase = mode === 'firebase' && fbDb && fbRoomPath;
    const noOtherPeers = Object.keys(peers).length === 0;

    if (syncTimer) { clearInterval(syncTimer); syncTimer = null; }
    if (bc) { try { bc.close(); } catch (e) {} bc = null; }
    if (hostConn) { try { hostConn.close(); } catch (e) {} hostConn = null; }
    Object.values(clientConns).forEach((c) => { try { c.close(); } catch (e) {} });
    clientConns = {};
    if (peer) { try { peer.destroy(); } catch (e) {} peer = null; }

    // If this player was the last person online in the Firebase room, wipe the room's chat node before closing
    if (wasFirebase && noOtherPeers) {
      try { fbDb.ref(fbRoomPath + '/chats').remove(); } catch (e) {}
    }

    // Clean up Firebase Realtime DB listeners & remove my presence node
    fbListeners.forEach((fn) => { try { fn(); } catch (e) {} });
    fbListeners = [];
    if (fbMyPlayerRef) { try { fbMyPlayerRef.remove(); } catch (e) {} fbMyPlayerRef = null; }
    if (fbApp) { try { fbApp.delete(); } catch (e) {} fbApp = null; fbDb = null; }

    Object.keys(peers).forEach((k) => delete peers[k]);
    hadOnlinePeersInRoom = false;
    roomCode = '';
    clearLocalChat('');
    setStatus('offline', false, 'ออฟไลน์ (เล่นคนเดียว)');
    if (!silent) hooks.onToast('🔌 ออกจากห้อง Multiplayer และล้างช่องแชทเรียบร้อยแล้ว');
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
        if (data.chatCleared) {
          clearLocalChat('🧹 ล้างประวัติช่องแชทอัตโนมัติ (เริ่มต้นห้องใหม่)');
        }
        if (Array.isArray(data.players)) {
          const activeIds = new Set();
          data.players.forEach((p) => {
            if (p && p.id && p.id !== myId) {
              activeIds.add(p.id);
              upsertPeer(p);
            }
          });
          const beforeCount = Object.keys(peers).length;
          Object.keys(peers).forEach((id) => {
            if (!activeIds.has(id)) delete peers[id];
          });
          if (beforeCount > 0 && Object.keys(peers).length === 0 && hadOnlinePeersInRoom) {
            hadOnlinePeersInRoom = false;
            clearRoomChatIfEmpty('🧹 ล้างช่องแชทอัตโนมัติ เนื่องจากไม่มีผู้เล่นคนอื่นออนไลน์อยู่ในห้อง');
          }
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
    const chatsFullRef = fbDb.ref(fbRoomPath + '/chats');
    const chatsRef = chatsFullRef.limitToLast(40);
    const adminCmdRef = fbDb.ref(fbRoomPath + '/adminCmd');
    const connRef = fbDb.ref('.info/connected');
    fbMyPlayerRef = playersRef.child(myId);
    roomJoinedAt = Date.now();
    hadOnlinePeersInRoom = false;

    const onAdminVal = (snap) => {
      const cmd = snap.val();
      if (cmd) handleIncomingAdminCmd(cmd);
    };
    adminCmdRef.on('value', onAdminVal);
    fbListeners.push(() => adminCmdRef.off('value', onAdminVal));

    // Check initial room occupancy: if no active players are online (or all existing entries are stale > 15s), auto-clear old room chats!
    let chatListenerAttached = false;
    const attachChatListeners = () => {
      if (chatListenerAttached) return;
      chatListenerAttached = true;
      const onChatAdd = (snap) => {
        const entry = snap.val();
        if (entry && entry.text) pushChat(entry);
      };
      const onChatClearedRemotely = (snap) => {
        if (!snap.exists() && chatLog.length > 0) {
          clearLocalChat('🧹 ล้างช่องแชทของห้องเรียบร้อยแล้ว');
        }
      };
      chatsRef.on('child_added', onChatAdd);
      chatsFullRef.on('value', onChatClearedRemotely);
      fbListeners.push(() => {
        chatsRef.off('child_added', onChatAdd);
        chatsFullRef.off('value', onChatClearedRemotely);
      });
    };

    playersRef.once('value', (snap) => {
      const now = Date.now();
      const all = snap.val() || {};
      let activeOthers = 0;
      Object.keys(all).forEach((pid) => {
        if (pid === myId) return;
        const p = all[pid];
        if (p && p.ts && (now - p.ts) < 15000) {
          activeOthers++;
        } else {
          // Prune stale ghost player node left behind from an older session
          playersRef.child(pid).remove().catch(() => {});
        }
      });

      if (activeOthers === 0) {
        // Room had nobody online! Auto-wipe old chat history in Firebase before attaching chat listener
        chatsFullRef.remove().finally(() => {
          clearLocalChat('');
          attachChatListeners();
          pushChat({ system: true, text: `เชื่อมต่อห้องเรียน ${roomCode} สำเร็จ! (🧹 ล้างประวัติแชทเก่าอัตโนมัติเนื่องจากไม่มีคนออนไลน์ในห้องก่อนหน้า)`, time: nowTimeStr() });
        });
      } else {
        hadOnlinePeersInRoom = true;
        attachChatListeners();
        pushChat({ system: true, text: `เชื่อมต่อห้องเรียนใหญ่ ${roomCode} (ออนไลน์อยู่ ${activeOthers + 1} คน) สำเร็จ!`, time: nowTimeStr() });
      }
    }).catch(() => {
      attachChatListeners();
    });

    const onConn = (snap) => {
      if (snap.val() === true) {
        fbMyPlayerRef.onDisconnect().remove();
        setStatus('firebase', true, `☁️ ห้องใหญ่ 40–100 คน (Firebase): ${roomCode}`);
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
      if (snap.key && peers[snap.key]) {
        delete peers[snap.key];
        if (Object.keys(peers).length === 0 && hadOnlinePeersInRoom) {
          hadOnlinePeersInRoom = false;
          clearRoomChatIfEmpty('🧹 ล้างช่องแชทอัตโนมัติ เนื่องจากผู้เล่นคนอื่นออกจากห้องหมดแล้ว');
        }
      }
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

    function pushFirebaseSelf(force = false) {
      if (!fbMyPlayerRef) return;
      const p = hooks.getLocalPlayer();
      if (!p) return;
      const now = Date.now();
      const sig = `${p.x},${p.y},${p.dir},${p.frame},${p.sitting ? 1 : 0},${p.completedUnits.length},${p.bytes},${p.zone},${p.insideBuildingId || ''},${p.name},${p.hairStyle},${p.hair},${p.faceStyle},${p.skin},${p.shirt},${p.shirtStyle},${p.pants},${p.shoes},${p.hat},${p.headMiddle || ''},${p.headLower || ''},${p.isTeacher ? 1 : 0}`;
      if (!force && sig === fbLastSentSig && now - fbLastSentAt < 5000) return;
      fbLastSentSig = sig;
      fbLastSentAt = now;
      fbMyPlayerRef.set({
        id: myId,
        name: p.name,
        studentClass: p.studentClass,
        isTeacher: !!p.isTeacher,
        insideBuildingId: p.insideBuildingId || null,
        x: p.x,
        y: p.y,
        dir: p.dir,
        frame: p.frame,
        sitting: !!p.sitting,
        skin: p.skin,
        hair: p.hair,
        hairStyle: p.hairStyle,
        faceStyle: p.faceStyle,
        shirt: p.shirt,
        shirtStyle: p.shirtStyle,
        pants: p.pants,
        shoes: p.shoes,
        hat: p.hat || '',
        headMiddle: p.headMiddle || '',
        headLower: p.headLower || '',
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

  // ==================== TEACHER ADMIN REMOTE CLASSROOM COMMANDS ====================
  function sendAdminCommand(payload) {
    const me = hooks.getLocalPlayer();
    const cmd = {
      ...payload,
      cmdId: 'adm_' + myId + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      senderId: myId,
      teacherName: (me && me.name) || 'ครูผู้สอน',
      ts: Date.now()
    };

    // Execute locally via handleIncomingAdminCmd if applicable
    handleIncomingAdminCmd(cmd);

    // 1. Direct Firebase Realtime DB broadcast node (instant for 40-100 players!)
    if (mode === 'firebase' && fbDb && connected) {
      fbDb.ref(fbRoomPath + '/adminCmd').set(cmd).catch(() => {});
      if (cmd.action === 'unlock_unit' && cmd.unit) {
        coopUnits.add(Number(cmd.unit));
        fbDb.ref(fbRoomPath + '/coopUnits/' + cmd.unit).set(cmd.teacherName).catch(() => {});
      } else if (cmd.action === 'unlock_all') {
        for (let u = 1; u <= 18; u++) {
          coopUnits.add(u);
          fbDb.ref(fbRoomPath + '/coopUnits/' + u).set(cmd.teacherName).catch(() => {});
        }
      } else if (cmd.action === 'reset_coop') {
        coopUnits.clear();
        fbDb.ref(fbRoomPath + '/coopUnits').remove().catch(() => {});
      }
    }

    // 2. Also relay via chat channel so P2P, LAN Server, and Local-Tab rooms all receive the admin command!
    const entry = {
      msgId: cmd.cmdId,
      senderId: myId,
      name: '👑 ' + cmd.teacherName,
      text: cmd.chatText || '',
      time: nowTimeStr(),
      system: true,
      adminCmd: cmd,
      silentAdmin: !cmd.chatText
    };
    if (cmd.chatText) pushChat(entry);

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
    } else if (mode === 'firebase' && fbDb && connected && cmd.chatText) {
      fbDb.ref(fbRoomPath + '/chats').push(entry).catch(() => {});
    } else if (mode === 'local-tab' && bc) {
      bc.postMessage({ type: 'chat', entry });
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
    sendAdminCommand,
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
