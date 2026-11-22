// 4x Expanded World Map (84x54 = 4,536 tiles), 4 Districts, 17 Buildings, 14 NPCs & 18-Week Quests
window.GAME_DATA = (function () {
  const MAP_W = 84;
  const MAP_H = 54;

  // Player appearance (Vocational IT Intern — customizable on Title Screen)
  const PLAYER_STYLE = {
    skin: '#f6cfa6',
    hair: '#2b1b12',
    shirt: '#2a7b5f',
    accent: '#f4f9f4',
    pants: '#2c4969',
    hat: '#c85a17',
    hatTrim: '#ffd166',
    glasses: true,
    backpack: true
  };

  // 12 Iconic Stardew-Hotbar Items covering all 18 Weeks
  const ITEMS = {
    lan_cable: {
      id: 'lan_cable',
      name: 'สายแลน Cat6',
      type: 'tool',
      desc: 'สายสัญญาณเครือข่าย Gigabit ใช้เชื่อมต่อระบบหลัก (สัปดาห์ที่ 1)',
      price: 40
    },
    iso_usb: {
      id: 'iso_usb',
      name: 'แฟลชไดรฟ์ ISO Server',
      type: 'tool',
      desc: 'ไฟล์อิมเมจ Ubuntu Server / Windows Server ใช้ในโรงหลอม VM (สัปดาห์ที่ 2–3)',
      price: 60
    },
    cli_wrench: {
      id: 'cli_wrench',
      name: 'ประแจ CLI & Systemd',
      type: 'tool',
      desc: 'เครื่องมือ Command Line สำหรับตั้งค่า IP, chmod, systemctl และ Cron Job (สัปดาห์ที่ 4–5, 10)',
      price: 75
    },
    raid_toolkit: {
      id: 'raid_toolkit',
      name: 'ชุดดิสก์ RAID & Backup',
      type: 'tool',
      desc: 'ชุดจัดการฮาร์ดดิสก์ RAID 0/1/5 และการสำรองข้อมูล 3-2-1 (สัปดาห์ที่ 6, 16)',
      price: 85
    },
    ssh_key: {
      id: 'ssh_key',
      name: 'กุญแจเข้ารหัส SSH',
      type: 'tool',
      desc: 'คู่กุญแจความปลอดภัยสำหรับรีโมตผ่านพอร์ต 22 (สัปดาห์ที่ 7)',
      price: 80
    },
    config_scroll: {
      id: 'config_scroll',
      name: 'ม้วนสคริปต์ Config',
      type: 'tool',
      desc: 'แม่แบบไฟล์ตั้งค่า DHCP, DNS, Apache/MariaDB และ Samba (สัปดาห์ที่ 8–9, 11–12)',
      price: 85
    },
    mail_key: {
      id: 'mail_key',
      name: 'ชุด Proxy & Mail Server',
      type: 'tool',
      desc: 'เครื่องมือตั้งค่า Squid Proxy (3128) และบริการอีเมล SMTP/IMAP/POP3 (สัปดาห์ที่ 13)',
      price: 90
    },
    win_license: {
      id: 'win_license',
      name: 'ชุดเครื่องมือ Windows Server',
      type: 'tool',
      desc: 'ชุดจัดการ Active Directory (AD DS), IIS และ PowerShell (สัปดาห์ที่ 14)',
      price: 110
    },
    ufw_shield: {
      id: 'ufw_shield',
      name: 'โล่ไฟร์วอลล์ UFW',
      type: 'tool',
      desc: 'ระบบกรองพอร์ตและป้องกันการบุกรุกขาเข้า Default Deny (สัปดาห์ที่ 15)',
      price: 100
    },
    log_lens: {
      id: 'log_lens',
      name: 'แว่นสแกนพอร์ต & Log',
      type: 'utility',
      desc: 'กด F ใกล้ตู้เซิร์ฟเวอร์เพื่อสแกนพอร์ต/สถานะทันที! ใช้ในสัปดาห์ที่ 17–18',
      price: 95
    },
    admin_coffee: {
      id: 'admin_coffee',
      name: 'กาแฟแอดมินร้อน',
      type: 'consumable',
      energy: 40,
      speedBoostSec: 25,
      desc: 'กด F เพื่อดื่ม! ฟื้นพลังงาน +40 ⚡ และวิ่งไวขึ้น 25 วินาที',
      price: 35
    },
    packet_kit: {
      id: 'packet_kit',
      name: 'ขนมปังไบต์ (Byte Bread)',
      type: 'consumable',
      energy: 25,
      desc: 'กด F เพื่อกิน! ฟื้นพลังงาน +25 ⚡ หอมกรุ่นจากเตาหมู่บ้าน',
      price: 20
    }
  };

  // 17 Distinct Buildings across 4 Large Districts (NW, NE, SW, SE)
  const BUILDINGS = [
    // ===== ZONE 1 (NW): เขตหมู่บ้านพื้นฐาน (สัปดาห์ที่ 1–5) =====
    {
      id: 'cottage',
      zone: 'โซน 1: หมู่บ้านพื้นฐาน (NW)',
      shortName: 'บ้านพักแอดมิน',
      fullName: 'บ้านพักนักศึกษาฝึกงาน (Admin Cottage)',
      tx: 4, ty: 4, tw: 6, th: 4,
      roofColor: '#b84a39', roofDark: '#7d2f23', wallColor: '#f5e1be',
      units: [], alwaysOnline: true, warpX: 7, warpY: 10
    },
    {
      id: 'town_hall',
      zone: 'โซน 1: หมู่บ้านพื้นฐาน (NW)',
      shortName: 'ส.1 ลานหมู่บ้าน',
      fullName: 'ศาลาลานหมู่บ้าน (สัปดาห์ที่ 1: NOS & Client-Server)',
      tx: 15, ty: 4, tw: 6, th: 4,
      roofColor: '#9c5a25', roofDark: '#693914', wallColor: '#f8ebd2',
      units: [1], warpX: 18, warpY: 10
    },
    {
      id: 'vm_lab',
      zone: 'โซน 1: หมู่บ้านพื้นฐาน (NW)',
      shortName: 'ส.2-3 โรงหลอม VM',
      fullName: 'โรงหลอมเครื่องจำลอง (สัปดาห์ที่ 2–3: Virtualization & OS)',
      tx: 25, ty: 4, tw: 6, th: 4,
      roofColor: '#3d72a4', roofDark: '#264b6e', wallColor: '#e6edf2',
      units: [2, 3], warpX: 28, warpY: 10
    },
    {
      id: 'core_hall',
      zone: 'โซน 1: หมู่บ้านพื้นฐาน (NW)',
      shortName: 'ส.4-5 คอนโซลหลัก',
      fullName: 'ห้องคอนโซลหลัก (สัปดาห์ที่ 4–5: Static IP, CLI & chmod)',
      tx: 15, ty: 13, tw: 6, th: 4,
      roofColor: '#2e7d5b', roofDark: '#1c523b', wallColor: '#e8f2ea',
      units: [4, 5], warpX: 18, warpY: 19
    },

    // ===== ZONE 2 (NE): เขตบริการเครือข่าย (สัปดาห์ที่ 6–10) =====
    {
      id: 'raid_barn',
      zone: 'โซน 2: ย่านบริการเครือข่าย (NE)',
      shortName: 'ส.6 โกดัง RAID',
      fullName: 'โกดังดิสก์และสตอเรจ (สัปดาห์ที่ 6: Disk & RAID Storage)',
      tx: 46, ty: 4, tw: 6, th: 4,
      roofColor: '#7b5e3b', roofDark: '#523c24', wallColor: '#f3e5d0',
      units: [6], warpX: 49, warpY: 10
    },
    {
      id: 'remote_tower',
      zone: 'โซน 2: ย่านบริการเครือข่าย (NE)',
      shortName: 'ส.7 หอสื่อสาร SSH',
      fullName: 'สถานีสื่อสารทางไกล (สัปดาห์ที่ 7: Remote SSH/RDP)',
      tx: 58, ty: 4, tw: 6, th: 4,
      roofColor: '#6b4fa1', roofDark: '#473270', wallColor: '#efe9f7',
      units: [7], warpX: 61, warpY: 10
    },
    {
      id: 'dhcp_house',
      zone: 'โซน 2: ย่านบริการเครือข่าย (NE)',
      shortName: 'ส.8 ศูนย์จ่าย IP',
      fullName: 'ศูนย์จ่ายน้ำและไอพี (สัปดาห์ที่ 8: DHCP Server)',
      tx: 72, ty: 4, tw: 6, th: 4,
      roofColor: '#2c8c99', roofDark: '#1c5f69', wallColor: '#e4f3f5',
      units: [8], warpX: 75, warpY: 10
    },
    {
      id: 'dns_tower',
      zone: 'โซน 2: ย่านบริการเครือข่าย (NE)',
      shortName: 'ส.9 หอคอย DNS',
      fullName: 'หอคอยสมุดโทรศัพท์โดเมน (สัปดาห์ที่ 9: DNS Server)',
      tx: 46, ty: 13, tw: 6, th: 4,
      roofColor: '#c9822b', roofDark: '#8c5515', wallColor: '#faecd6',
      units: [9], warpX: 49, warpY: 19
    },
    {
      id: 'cron_clock',
      zone: 'โซน 2: ย่านบริการเครือข่าย (NE)',
      shortName: 'ส.10 หอ Systemd',
      fullName: 'หอนาฬิกาอัตโนมัติ (สัปดาห์ที่ 10: Systemd & Cron Jobs)',
      tx: 60, ty: 13, tw: 6, th: 4,
      roofColor: '#b58900', roofDark: '#7a5c00', wallColor: '#fdf6e3',
      units: [10], warpX: 63, warpY: 19
    },

    // ===== ZONE 3 (SW): เขตบริการแอปและข้อมูล (สัปดาห์ที่ 11–14) =====
    {
      id: 'web_market',
      zone: 'โซน 3: ย่านแอปและข้อมูล (SW)',
      shortName: 'ส.11 ตลาดเว็บ&DB',
      fullName: 'ตลาดเว็บและฐานข้อมูล (สัปดาห์ที่ 11: LAMP Stack)',
      tx: 5, ty: 30, tw: 6, th: 4,
      roofColor: '#c94c68', roofDark: '#8a2d43', wallColor: '#fcebf0',
      units: [11], warpX: 8, warpY: 36
    },
    {
      id: 'file_barn',
      zone: 'โซน 3: ย่านแอปและข้อมูล (SW)',
      shortName: 'ส.12 โกดังแชร์ไฟล์',
      fullName: 'โกดังแชร์ไฟล์กลาง (สัปดาห์ที่ 12: Samba & FTP)',
      tx: 17, ty: 30, tw: 6, th: 4,
      roofColor: '#a6542b', roofDark: '#6e3418', wallColor: '#f5e2d0',
      units: [12], warpX: 20, warpY: 36
    },
    {
      id: 'mail_proxy',
      zone: 'โซน 3: ย่านแอปและข้อมูล (SW)',
      shortName: 'ส.13 Proxy&Mail',
      fullName: 'สถานีไปรษณีย์และพร็อกซี (สัปดาห์ที่ 13: Squid & Mail)',
      tx: 5, ty: 39, tw: 6, th: 4,
      roofColor: '#d9534f', roofDark: '#962d2a', wallColor: '#fff0ef',
      units: [13], warpX: 8, warpY: 45
    },
    {
      id: 'win_hall',
      zone: 'โซน 3: ย่านแอปและข้อมูล (SW)',
      shortName: 'ส.14 Windows Srv',
      fullName: 'ศาลา Windows Server (สัปดาห์ที่ 14: AD DS, IIS & PowerShell)',
      tx: 25, ty: 39, tw: 6, th: 4,
      roofColor: '#0284c7', roofDark: '#0369a1', wallColor: '#e0f2fe',
      units: [14], warpX: 28, warpY: 45
    },

    // ===== ZONE 4 (SE): เขตความมั่นคงและการดูแลระบบ (สัปดาห์ที่ 15–18) =====
    {
      id: 'firewall_gate',
      zone: 'โซน 4: ป้อมความมั่นคง (SE)',
      shortName: 'ส.15 ป้อมไฟร์วอลล์',
      fullName: 'ป้อมปราการไฟร์วอลล์ (สัปดาห์ที่ 15: UFW Firewall)',
      tx: 48, ty: 30, tw: 6, th: 4,
      roofColor: '#455a64', roofDark: '#263238', wallColor: '#cfd8dc',
      units: [15], warpX: 51, warpY: 36
    },
    {
      id: 'backup_vault',
      zone: 'โซน 4: ป้อมความมั่นคง (SE)',
      shortName: 'ส.16 คลัง Backup',
      fullName: 'ธนาคารสำรองข้อมูล (สัปดาห์ที่ 16: Backup 3-2-1 & Recovery)',
      tx: 64, ty: 30, tw: 6, th: 4,
      roofColor: '#2e7d32', roofDark: '#1b5e20', wallColor: '#e8f5e9',
      units: [16], warpX: 67, warpY: 36
    },
    {
      id: 'log_obs',
      zone: 'โซน 4: ป้อมความมั่นคง (SE)',
      shortName: 'ส.17 หอตรวจ Log',
      fullName: 'หอสังเกตการณ์และแก้ปัญหา (สัปดาห์ที่ 17: Monitoring & Logs)',
      tx: 48, ty: 39, tw: 6, th: 4,
      roofColor: '#00838f', roofDark: '#005662', wallColor: '#e0f7fa',
      units: [17], warpX: 51, warpY: 45
    },
    {
      id: 'grand_hall',
      zone: 'โซน 4: ป้อมความมั่นคง (SE)',
      shortName: 'ส.18 สภาแอดมิน',
      fullName: 'สภาแอดมินหลวง (สัปดาห์ที่ 18: โครงงานบูรณาการปลายภาค)',
      tx: 64, ty: 39, tw: 7, th: 4,
      roofColor: '#8e24aa', roofDark: '#5c1470', wallColor: '#f3e5f5',
      units: [18], warpX: 67, warpY: 45
    }
  ];

  // 16 Interactive Server Racks / Terminal Stations
  const STATIONS = [
    { id: 'rack_w1', name: 'ตู้สวิตช์หลักหมู่บ้าน (NOS Core)', tx: 20, ty: 9, units: [1], ports: 'LAN Gigabit • Client-Server Core' },
    { id: 'rack_w23', name: 'เครื่องแม่ข่ายจำลอง (VM & OS Host)', tx: 30, ty: 9, units: [2, 3], ports: 'VirtualBox / Ubuntu Server 24.04 ISO' },
    { id: 'rack_w45', name: 'คอนโซลหลัก (CLI & User Server)', tx: 20, ty: 18, units: [4, 5], ports: 'Static IP 192.168.1.10/24 • chmod/sudo' },
    { id: 'rack_w6', name: 'ตู้จัดเก็บข้อมูล RAID Storage', tx: 51, ty: 9, units: [6], ports: 'ext4 / fstab • RAID 0 / 1 / 5 / 10' },
    { id: 'rack_w7', name: 'เสาสัญญาณรีโมต (SSH/RDP Node)', tx: 63, ty: 9, units: [7], ports: 'TCP 22 (SSH) • TCP 3389 (RDP) • 10000 (Webmin)' },
    { id: 'rack_w8', name: 'เครื่องจ่ายไอพี (ISC-DHCP Server)', tx: 77, ty: 9, units: [8], ports: 'UDP 67/68 • Pool 192.168.1.100-200' },
    { id: 'rack_w9', name: 'เซิร์ฟเวอร์แปลงชื่อโดเมน (BIND9 DNS)', tx: 51, ty: 18, units: [9], ports: 'UDP/TCP 53 • valley.local Zone' },
    { id: 'rack_w10', name: 'คอนโซล Systemd & Cron Scheduler', tx: 65, ty: 18, units: [10], ports: 'systemctl • htop • crontab (0 2 * * *)' },
    { id: 'rack_w11', name: 'ตู้ LAMP Stack (Apache2 + MariaDB)', tx: 10, ty: 35, units: [11], ports: 'TCP 80/443 (Web) • TCP 3306 (MariaDB)' },
    { id: 'rack_w12', name: 'เซิร์ฟเวอร์คลังไฟล์ (Samba & FTP)', tx: 22, ty: 35, units: [12], ports: 'TCP 445 (SMB) • TCP 21 (FTP) • 22 (SFTP)' },
    { id: 'rack_w13', name: 'ตู้ Proxy & Mail Gateway', tx: 10, ty: 44, units: [13], ports: 'TCP 3128 (Squid) • 25 (SMTP) • 143 (IMAP) • 110 (POP3)' },
    { id: 'rack_w14', name: 'ตู้ Windows Server 2022 (AD DS & IIS)', tx: 30, ty: 44, units: [14], ports: 'AD DS Domain Controller • IIS (80/443) • RDP (3389)' },
    { id: 'rack_w15', name: 'แผงควบคุมไฟร์วอลล์ (UFW Gateway)', tx: 53, ty: 35, units: [15], ports: 'UFW Default Deny • Allow 22,53,80,443' },
    { id: 'rack_w16', name: 'ตู้เซฟสำรองข้อมูล (3-2-1 Backup Vault)', tx: 69, ty: 35, units: [16], ports: 'tar.gz • rsync • mysqldump • Offsite Cloud' },
    { id: 'rack_w17', name: 'จอมอนิเตอร์ Log & Diagnostics', tx: 53, ty: 44, units: [17], ports: '/var/log/auth.log • journalctl • ss -tulnp' },
    { id: 'rack_w18', name: 'แท่นตรวจสอบระบบหลวง (Final Audit)', tx: 70, ty: 44, units: [18], ports: 'Full 18-Week Enterprise Server Health Audit' }
  ];

  // 7 Collectible Treasure Crates across all 4 Districts
  const CRATES = [
    { id: 'crate_lan', tx: 11, ty: 10, itemId: 'lan_cable', qty: 1, label: 'กล่องสายแลน Cat6' },
    { id: 'crate_iso', tx: 32, ty: 9, itemId: 'iso_usb', qty: 1, label: 'กล่องแฟลชไดรฟ์ ISO' },
    { id: 'crate_coffee_plaza', tx: 39, ty: 28, itemId: 'admin_coffee', qty: 2, label: 'กล่องกาแฟแอดมิน (จัตุรัสกลาง)' },
    { id: 'crate_lens_plaza', tx: 44, ty: 28, itemId: 'log_lens', qty: 1, label: 'กล่องแว่นสแกนพอร์ต & Log' },
    { id: 'crate_bread_ne', tx: 54, ty: 10, itemId: 'packet_kit', qty: 2, label: 'กล่องขนมปังไบต์ (โซน 2)' },
    { id: 'crate_coffee_sw', tx: 14, ty: 35, itemId: 'admin_coffee', qty: 2, label: 'กล่องกาแฟแอดมิน (โซน 3)' },
    { id: 'crate_coffee_se', tx: 58, ty: 35, itemId: 'admin_coffee', qty: 2, label: 'กล่องกาแฟแอดมิน (โซน 4)' }
  ];

  // Special Interactive Landmarks (Rest Bed, Grand IT General Store, Grand Fast-Travel Warp Board)
  const SPECIAL_PROPS = [
    { id: 'rest_spot', kind: 'bed', tx: 10, ty: 7, label: 'พักผ่อนที่บ้านพัก (ฟื้นพลังงานเต็ม 100%)' },
    { id: 'it_shop', kind: 'shop', tx: 35, ty: 23, label: '🏪 เข้าซื้อของที่ห้างสรรพสินค้าไอที (Server Valley IT General Store)' },
    { id: 'warp_sign', kind: 'warp', tx: 13, ty: 10, tw: 2, label: '🗺️ ป้ายสถานีวาร์ปด่วนใหญ่ (เดินทางไปทั้ง 4 โซน / เปิดแผนที่ M)' }
  ];

  // 9 Village Scenery & Town Store Buildings (Grand IT General Store, Café & Bakery, Tech Bookstore, Glass Greenhouse, Barn & Silo, Hardware Forge & Villager Cottages!)
  const SCENERY_BUILDINGS = [
    {
      id: 'it_general_store',
      kind: 'it_store',
      action: 'shop',
      shortName: '🏪 ห้างไอที IT Mart',
      fullName: 'ห้างสรรพสินค้าอุปกรณ์ไอที (Server Valley IT General Store)',
      tx: 32, ty: 19, tw: 7, th: 4,
      roofColor: '#c92a2a', roofDark: '#7f1d1d', wallColor: '#fff3d1'
    },
    {
      id: 'tech_bookstore',
      kind: 'bookstore',
      action: 'codex',
      shortName: '📚 ร้านหนังสือไอที',
      fullName: 'ศูนย์หนังสือและคู่มือเซิร์ฟเวอร์ (Valley Tech Bookstore)',
      tx: 44, ty: 19, tw: 6, th: 4,
      roofColor: '#1d4ed8', roofDark: '#1e3a8a', wallColor: '#eff6ff'
    },
    {
      id: 'cafe_bakery',
      kind: 'cafe',
      action: 'shop',
      shortName: '☕ คาเฟ่แอดมิน',
      fullName: 'ร้านกาแฟแอดมินและเบเกอรีไบต์ (Admin Coffee & Byte Bakery)',
      tx: 33, ty: 4, tw: 6, th: 4,
      roofColor: '#15803d', roofDark: '#14532d', wallColor: '#fef9c3'
    },
    {
      id: 'villager_cottage_nw',
      kind: 'cottage_deco',
      action: 'flavor',
      shortName: '🏡 บ้านช่างเทคนิค',
      fullName: 'บ้านพักช่างเทคนิคประจำหมู่บ้าน (Technician Cottage)',
      tx: 29, ty: 13, tw: 6, th: 4,
      roofColor: '#b45309', roofDark: '#78350f', wallColor: '#fde68a',
      flavorText: '🏡 บ้านพักช่างเทคนิคประจำหมู่บ้าน — กลิ่นซุปหอมกรุ่นลอยออกมาจากปล่องไฟ!'
    },
    {
      id: 'valley_barn',
      kind: 'barn',
      action: 'flavor',
      shortName: '🌾 โรงนา & ไซโล',
      fullName: 'โรงนาและหอไซโลเก็บเสบียงหมู่บ้าน (Server Valley Red Barn & Silo)',
      tx: 73, ty: 13, tw: 6, th: 4,
      roofColor: '#b91c1c', roofDark: '#7f1d1d', wallColor: '#dc2626',
      flavorText: '🌾 โรงนาและไซโลประจำหมู่บ้าน — เก็บเสบียงอาหารและสายไฟเบอร์สำรองของหมู่บ้าน!'
    },
    {
      id: 'smart_greenhouse',
      kind: 'greenhouse',
      action: 'flavor',
      shortName: '🌿 เรือนกระจก IoT',
      fullName: 'เรือนกระจกเกษตรอัจฉริยะ (Smart IoT Glass Greenhouse)',
      tx: 29, ty: 30, tw: 6, th: 4,
      roofColor: '#38bdf8', roofDark: '#0284c7', wallColor: '#e0f2fe',
      flavorText: '🌿 เรือนกระจกอัจฉริยะควบคุมอุณหภูมิและความชื้นอัตโนมัติด้วย Linux Cron Job!'
    },
    {
      id: 'hardware_forge',
      kind: 'forge',
      action: 'shop',
      shortName: '🛠️ โรงซ่อมฮาร์ดแวร์',
      fullName: 'ร้านช่างตีเหล็กและซ่อมบำรุงเมนบอร์ด (Hardware Forge & Repair)',
      tx: 15, ty: 39, tw: 6, th: 4,
      roofColor: '#57534e', roofDark: '#292524', wallColor: '#d6d3d1'
    },
    {
      id: 'admin_residence_se',
      kind: 'cottage_deco',
      action: 'flavor',
      shortName: '🏠 บ้านแอดมินอาวุโส',
      fullName: 'บ้านพักวิศวกรความมั่นคงปลอดภัย (Security Engineer House)',
      tx: 56, ty: 30, tw: 6, th: 4,
      roofColor: '#6d28d9', roofDark: '#4c1d95', wallColor: '#f3e8ff',
      flavorText: '🏠 บ้านพักวิศวกรความมั่นคง — ประตูหน้าบ้านล็อกด้วยรหัส SSH Key 4096-bit!'
    },
    {
      id: 'server_clinic_se',
      kind: 'bookstore',
      action: 'codex',
      shortName: '🏥 คลินิกกู้ภัยระบบ',
      fullName: 'คลินิกตรวจสุขภาพและกู้ภัยเซิร์ฟเวอร์ (Server Clinic & Guild)',
      tx: 56, ty: 39, tw: 6, th: 4,
      roofColor: '#0f766e', roofDark: '#134e4a', wallColor: '#ccfbf1'
    }
  ];

  // 14 Expressive Village NPCs
  const NPCS = [
    {
      id: 'elder_admin', name: 'ผู้ใหญ่บ้านลุงแอดมิน', role: 'หัวหน้าหมู่บ้าน (สัปดาห์ 1)',
      tx: 16, ty: 9, units: [1],
      style: { skin: '#f0c299', hair: '#d9d9d9', beard: '#d9d9d9', shirt: '#7c4d2b', accent: '#f4d58d', pants: '#3e2c1c', hat: '#5c3a21', hatTrim: '#d9a441' },
      idleTalk: 'หมู่บ้านเรากว้างถึง 4 โซน 18 สัปดาห์เลยนะ! กด Shift วิ่งเร็ว หรือกด M คลิกอาคารเพื่อวาร์ปด่วนก็ได้!'
    },
    {
      id: 'art_vm', name: 'ช่างอาร์ต', role: 'วิศวกร VM & OS (สัปดาห์ 2–3)',
      tx: 26, ty: 9, units: [2, 3],
      style: { skin: '#f4cba3', hair: '#222831', shirt: '#2b6cb0', accent: '#bee3f8', pants: '#2d3748', glasses: true },
      idleTalk: 'จำลองเครื่องด้วย VirtualBox ให้คล่อง แล้วติดตั้ง Ubuntu Server พร้อม OpenSSH ให้เป็นเรื่องง่าย!'
    },
    {
      id: 'prof_rin', name: 'อาจารย์ริน', role: 'อาจารย์ CLI & สิทธิ์ (สัปดาห์ 4–5)',
      tx: 16, ty: 18, units: [4, 5],
      style: { skin: '#f7d6b5', hair: '#4a1e2e', shirt: '#2f855a', accent: '#e6fffa', pants: '#234e52', glasses: true },
      idleTalk: 'Static IP ต้องนิ่ง คำสั่ง CLI ต้องแม่น และสูตร chmod คือ r=4, w=2, x=1 นะจ๊ะ!'
    },
    {
      id: 'disk_tech', name: 'ช่างดิสก์', role: 'วิศวกร RAID Storage (สัปดาห์ 6)',
      tx: 47, ty: 9, units: [6],
      style: { skin: '#e8bc92', hair: '#4a3525', shirt: '#8b5e34', accent: '#fde68a', pants: '#3e2c1c', hat: '#5c3a21', hatTrim: '#f59e0b' },
      idleTalk: 'ฮาร์ดดิสก์พังได้ทุกเมื่อ! ถ้าใช้ RAID 1 หรือ RAID 5 ข้อมูลขององค์กรก็จะยังปลอดภัยอยู่!'
    },
    {
      id: 'non_remote', name: 'พี่นนท์', role: 'ผู้ดูแลระบบระยะไกล (สัปดาห์ 7)',
      tx: 59, ty: 9, units: [7],
      style: { skin: '#e8bc92', hair: '#1e1e2f', shirt: '#6b46c1', accent: '#e9d8fd', pants: '#2d3748', hat: '#44337a', hatTrim: '#b794f4' },
      idleTalk: 'รีโมตด้วย SSH พอร์ต 22 แบบเข้ารหัสปลอดภัยสุด ๆ อย่าเผลอเปิด Telnet พอร์ต 23 เชียวนะ!'
    },
    {
      id: 'meen_dhcp', name: 'เจ๊มีน', role: 'หัวหน้าศูนย์จ่าย IP (สัปดาห์ 8)',
      tx: 73, ty: 9, units: [8],
      style: { skin: '#f5cca6', hair: '#742a2a', shirt: '#2c7a7b', accent: '#b2f5ea', pants: '#285e61' },
      idleTalk: 'D-O-R-A! Discover, Offer, Request, Acknowledge ท่องให้แม่นเลยนะ!'
    },
    {
      id: 'sage_dns', name: 'ปู่โดเมน', role: 'ผู้เฝ้าหอคอย DNS (สัปดาห์ 9)',
      tx: 47, ty: 18, units: [9],
      style: { skin: '#ecc098', hair: '#eceff1', beard: '#eceff1', shirt: '#b7791f', accent: '#fefcbf', pants: '#5f370e', glasses: true },
      idleTalk: 'DNS พอร์ต 53 แปลงชื่อโดเมนเป็น IP ด้วย A Record, CNAME และ MX Record นะหลาน!'
    },
    {
      id: 'cron_master', name: 'พี่ครอน', role: 'ผู้คุมเวลา Systemd (สัปดาห์ 10)',
      tx: 61, ty: 18, units: [10],
      style: { skin: '#f4cba3', hair: '#5a3a18', shirt: '#b58900', accent: '#fffbeb', pants: '#3b2f13', glasses: true },
      idleTalk: 'อยากให้เซิร์ฟเวอร์สำรองข้อมูลเองทุกตี 2? ตั้ง crontab เป็น "0 2 * * *" แล้วนอนหลับสบายได้เลย!'
    },
    {
      id: 'mind_web', name: 'แม่ค้ามายด์', role: 'เจ้าของตลาดเว็บ & DB (สัปดาห์ 11)',
      tx: 6, ty: 35, units: [11],
      style: { skin: '#f9d8b8', hair: '#5a2d0c', shirt: '#b83280', accent: '#fed7e2', pants: '#521b41' },
      idleTalk: 'Apache2 พอร์ต 80/443 กับ MariaDB พอร์ต 3306 คือคู่หู LAMP Stack ที่ขาดไม่ได้!'
    },
    {
      id: 'uncle_samba', name: 'ลุงแซม', role: 'ผู้ดูแลโกดังแชร์ไฟล์ (สัปดาห์ 12)',
      tx: 18, ty: 35, units: [12],
      style: { skin: '#e6b88a', hair: '#4a3525', beard: '#4a3525', shirt: '#c05621', accent: '#feebc8', pants: '#4a2511', hat: '#7b341e', hatTrim: '#f6ad55' },
      idleTalk: 'แชร์ไฟล์ระหว่าง Linux กับ Windows ใช้ Samba พอร์ต 445 ส่วนส่งไฟล์เข้ารหัสใช้ SFTP พอร์ต 22!'
    },
    {
      id: 'mail_ops', name: 'พี่เมล์', role: 'นายไปรษณีย์ Proxy & Mail (สัปดาห์ 13)',
      tx: 6, ty: 44, units: [13],
      style: { skin: '#f5cfa7', hair: '#2c1810', shirt: '#c53030', accent: '#fff5f5', pants: '#2d3748', hat: '#9b2c2c', hatTrim: '#feb2b2' },
      idleTalk: 'Squid Proxy พอร์ต 3128 ช่วยกรองเว็บและเก็บ Cache ส่วนส่งเมลใช้ SMTP พอร์ต 25!'
    },
    {
      id: 'teacher_win', name: 'ครูวิน', role: 'ผู้เชี่ยวชาญ Windows Server (สัปดาห์ 14)',
      tx: 26, ty: 44, units: [14],
      style: { skin: '#f5cfa7', hair: '#1e3a5f', shirt: '#0284c7', accent: '#e0f2fe', pants: '#1e293b', glasses: true, hat: '#0369a1', hatTrim: '#7dd3fc' },
      idleTalk: 'Active Directory (AD DS), IIS (C:\\inetpub\\wwwroot) และ PowerShell คือหัวใจของ Windows Server!'
    },
    {
      id: 'guard_k', name: 'หัวหน้ายามเค', role: 'ผู้บัญชาการไฟร์วอลล์ (สัปดาห์ 15)',
      tx: 49, ty: 35, units: [15],
      style: { skin: '#e3b488', hair: '#1a202c', shirt: '#37474f', accent: '#ff8a65', pants: '#1c2429', hat: '#263238', hatTrim: '#ff5252' },
      idleTalk: 'Default Deny Incoming แล้วเปิดเฉพาะพอร์ตที่จำเป็น ห้ามเปิด Telnet 23 เด็ดขาด!'
    },
    {
      id: 'back_keeper', name: 'พี่แบ็ค', role: 'ผู้พิทักษ์คลัง Backup (สัปดาห์ 16)',
      tx: 65, ty: 35, units: [16],
      style: { skin: '#f0c59c', hair: '#1f4027', shirt: '#2e7d32', accent: '#dcfce7', pants: '#14532d' },
      idleTalk: 'จำกฎ 3-2-1 Backup ให้ขึ้นใจ: 3 สำเนา, 2 สื่อจัดเก็บ, 1 ชุดนอกสถานที่!'
    },
    {
      id: 'doc_serv', name: 'หมอเซิร์ฟ', role: 'แพทย์วินิจฉัย Log (สัปดาห์ 17)',
      tx: 49, ty: 44, units: [17],
      style: { skin: '#f6d6b8', hair: '#1e293b', shirt: '#00838f', accent: '#ffffff', pants: '#164e63', glasses: true },
      idleTalk: 'เซิร์ฟเวอร์ป่วยอย่าเพิ่งรีบูตมั่ว! อ่าน /var/log/auth.log, journalctl และเช็ก ss -tulnp ก่อนเสมอ!'
    },
    {
      id: 'dean_admin', name: 'ผอ.เซิร์ฟเวอร์', role: 'ประธานสภาแอดมินหลวง (สัปดาห์ 18)',
      tx: 65, ty: 44, units: [18],
      style: { skin: '#ecc098', hair: '#e2e8f0', beard: '#e2e8f0', shirt: '#6a1b9a', accent: '#f3e5f5', pants: '#3b0764', hat: '#4a148c', hatTrim: '#ffd54f' },
      idleTalk: 'ยินดีต้อนรับสู่สัปดาห์ที่ 18! มาตรวจประเมินระบบทั้งหมู่บ้านครบวงจรเพื่อรับเกียรติบัตรแอดมิน ปวช. กัน!'
    }
  ];

  // 10 Outdoor Town & Shopkeeper NPCs standing across the Village Map (Greetable & Interactive!)
  const TOWN_NPCS = [
    {
      id: 'shopkeeper_byte',
      name: 'เฮียไบต์ (เจ้าของห้างไอที)',
      role: '🏪 ผู้จัดการห้าง Server Valley IT Mart',
      tx: 34, ty: 23,
      dir: 'down',
      action: 'shop',
      marker: '🛒',
      markerColor: '#4ade80',
      style: {
        skin: '#f6cfa6', hair: '#241712', hairStyle: 'sidepart', faceStyle: 'smile',
        shirt: '#c92a2a', shirtStyle: 'vest', pants: '#1e293b', shoes: '#5c3317', hat: '#b91c1c'
      },
      greetings: [
        'สวัสดีวัยรุ่นแอดมิน! ยินดีต้อนรับสู่ห้างสรรพสินค้าอุปกรณ์ไอที Server Valley IT Mart!',
        'ไม่ว่าจะต้องการกาแฟแอดมินฟื้นพลังงาน สายแลน Cat6 แฟลชไดรฟ์ ISO หรือเครื่องมือดูแลเซิร์ฟเวอร์ เฮียจัดให้ครบในราคาพิเศษ!'
      ],
      quickReplies: [
        '👋 สวัสดีครับ/ค่ะเฮียไบต์! วันนี้มีโปรโมชันอะไรบ้าง?',
        '☕ ขอแวะเติมเสบียงกาแฟแอดมินหน่อยครับ/ค่ะ!'
      ],
      replyAnswers: [
        'ฮ่า ๆ วันนี้สายแลน Cat6 แท้หัว RJ45 ทองเหลือง กับกาแฟแอดมินคั่วสดขายดีสุด ๆ! กดเปิดหน้าร้านเลือกซื้อได้เลย!',
        'จัดไปเลย! กาแฟแอดมิน 1 แก้ว ฟื้นพลังงาน +35 แถมวิ่งไวขึ้นด้วยนะ พร้อมลุยแล็บ 18 สัปดาห์แน่นอน!'
      ]
    },
    {
      id: 'barista_latte',
      name: 'บาริสต้าลัตเต้',
      role: '☕ เจ้าของคาเฟ่แอดมิน & เบเกอรีไบต์',
      tx: 36, ty: 8,
      dir: 'down',
      action: 'shop',
      marker: '☕',
      markerColor: '#fbbf24',
      style: {
        skin: '#fde0c4', hair: '#a36a2c', hairStyle: 'ponytail', faceStyle: 'happy',
        shirt: '#15803d', shirtStyle: 'overalls', pants: '#5c3317', shoes: '#5c3317', hat: ''
      },
      greetings: [
        'สวัสดีจ้า~ กลิ่นกาแฟเอสเพรสโซ่หอม ๆ จากคาเฟ่แอดมินพร้อมเสิร์ฟแล้วนะ!',
        'เวลาทำแล็บตั้งค่าเซิร์ฟเวอร์เหนื่อย ๆ แวะมาซื้อกาแฟหรือขนมปังไบต์ไปเติม Energy ได้ตลอดเลยนะ!'
      ],
      quickReplies: [
        '👋 ทักทาย: กลิ่นกาแฟหอมมาถึงหน้าคาเฟ่เลย!',
        '🥐 เมนูแนะนำสำหรับแอดมินอดนอนคืออะไร?'
      ],
      replyAnswers: [
        'ขอบคุณจ้า! เมล็ดกาแฟของเราปลูกในเรือนกระจก IoT ของหมู่บ้าน คั่วสดใหม่ทุกเช้าเลยนะ 😊',
        'ต้อง "กาแฟแอดมิน (Admin Espresso)" คู่กับ "ขนมปังไบต์" เลยจ้ะ ดื่มปุ๊บตาสว่าง พิมพ์คำสั่ง Linux ไม่ผิดแม้แต่ตัวเดียว!'
      ]
    },
    {
      id: 'librarian_fah',
      name: 'บรรณารักษ์ฟ้า',
      role: '📚 ผู้ดูแลร้านหนังสือ & คู่มือเซิร์ฟเวอร์',
      tx: 47, ty: 23,
      dir: 'down',
      action: 'codex',
      marker: '📖',
      markerColor: '#38bdf8',
      style: {
        skin: '#fde0c4', hair: '#1e3a5f', hairStyle: 'bob', faceStyle: 'glasses',
        shirt: '#2563eb', shirtStyle: 'suit', pants: '#1e293b', shoes: '#1f2428', hat: ''
      },
      greetings: [
        'สวัสดีค่ะ! ร้านหนังสือไอที Valley Tech Bookstore ยินดีต้อนรับนักศึกษาปวช. ทุกคนค่ะ',
        'ที่นี่รวบรวมสรุปเนื้อหาครบทั้ง 18 สัปดาห์ ทั้งคำสั่ง Linux, พอร์ตเครือข่าย และ Windows Server เปิดอ่านฟรีก่อนเข้าห้องสอบได้เลยนะคะ!'
      ],
      quickReplies: [
        '👋 สวัสดีครับ/ค่ะพี่ฟ้า ขอคำแนะนำการจำพอร์ตหน่อย!',
        '📖 ขอดูคู่มือสรุป 18 สัปดาห์หน่อยครับ/ค่ะ'
      ],
      replyAnswers: [
        'เคล็ดลับจำพอร์ตยอดฮิต: SSH=22, DNS=53, DHCP=67/68, HTTP=80, HTTPS=443, SMB=445, MariaDB=3306, RDP=3389 ท่องชุดนี้สอบผ่านฉลุยค่ะ!',
        'ได้เลยค่ะ! กดปุ่มเปิดคลังความรู้ด้านล่าง หรือกดปุ่ม B บนคีย์บอร์ดได้ทุกเมื่อเลยนะคะ!'
      ]
    },
    {
      id: 'farmer_kla',
      name: 'ลุงกล้า เกษตรกรสมาร์ตฟาร์ม',
      role: '🌾 ชาวไร่ประจำแปลงเกษตรโซน 1',
      tx: 6, ty: 14,
      patrol: [
        { tx: 6, ty: 14 },
        { tx: 11, ty: 14 },
        { tx: 11, ty: 11 },
        { tx: 6, ty: 11 }
      ],
      speed: 36,
      dir: 'right',
      action: 'chat',
      marker: '🌾',
      markerColor: '#a3e635',
      style: {
        skin: '#c68642', hair: '#5a331c', hairStyle: 'short', faceStyle: 'smile',
        shirt: '#d97706', shirtStyle: 'overalls', pants: '#2c4969', shoes: '#5c3317', hat: 'straw'
      },
      greetings: [
        'อ้าว สวัสดีหลานแอดมิน! วันนี้อากาศดีเหมาะกับการเดินสายแลนและรดน้ำแปลงผักจริง ๆ!',
        'ตั้งแต่หมู่บ้านเรามีระบบ Server คอยแจ้งพยากรณ์อากาศและตั้งเวลาสูบน้ำจากบ่อน้ำ ผลผลิตในไร่ก็งอกงามขึ้นเป็นเท่าตัวเลย!'
      ],
      quickReplies: [
        '👋 สวัสดีครับ/ค่ะลุงกล้า ผักในแปลงงามมากเลย!',
        '💡 ลุงกล้าใช้ระบบอะไรตั้งเวลารดน้ำผักครับ?'
      ],
      replyAnswers: [
        'ฮ่า ๆ ขอบใจมากหลาน! ถ้าเดินสำรวจเหนื่อย ๆ แวะเข้าบ้านพักแอดมินไปนอนพักฟื้นพลังงานได้เสมอนะ!',
        'ลุงให้พี่ครอน (สัปดาห์ที่ 10) ช่วยตั้ง Linux Cron Job สั่งปั๊มน้ำทำงานอัตโนมัติทุกเช้าตอน 06:00 น. (`0 6 * * *`) สะดวกสุด ๆ ไปเลย!'
      ]
    },
    {
      id: 'plaza_guide_nana',
      name: 'นานะ ไกด์ประจำลานน้ำพุ',
      role: '⛲ ทูตต้อนรับจัตุรัสกลาง Server Valley',
      tx: 38, ty: 26,
      patrol: [
        { tx: 38, ty: 26 },
        { tx: 45, ty: 26 },
        { tx: 45, ty: 28 },
        { tx: 38, ty: 28 }
      ],
      speed: 42,
      dir: 'right',
      action: 'map',
      marker: '💬',
      markerColor: '#f472b6',
      style: {
        skin: '#fde0c4', hair: '#f472b6', hairStyle: 'twintails', faceStyle: 'wink',
        shirt: '#b83280', shirtStyle: 'hoodie', pants: '#1e293b', shoes: '#e2e8f0', hat: 'catears'
      },
      greetings: [
        'ยาฮู้~ สวัสดีจ้า! ยินดีต้อนรับสู่ลานน้ำพุจัตุรัสกลางหมู่บ้าน Server Valley นะ!',
        'หมู่บ้านของเรามี 4 โซน 17 อาคารเรียนครบ 18 สัปดาห์ แถมยังมีห้างไอที IT Mart อยู่ทางซ้ายมือของลานน้ำพุด้วยนะ!'
      ],
      quickReplies: [
        '👋 ทักทายนานะ! หมู่บ้านบรรยากาศสดใสมากเลย',
        '🗺️ อยากเดินทางไปโซนอื่นเร็ว ๆ ต้องทำยังไง?'
      ],
      replyAnswers: [
        'ใช่ไหมล่ะ! ยิ่งเพื่อน ๆ ช่วยกันทำแล็บกู้คืนเซิร์ฟเวอร์ให้ครบ ไฟสถานะของอาคารต่าง ๆ ก็จะยิ่งสว่างไสวทั่วหมู่บ้านเลย ✨',
        'ง่ายนิดเดียว! เดินไปที่ "ป้ายสถานีวาร์ปด่วนใหญ่" แถวลานหมู่บ้านโซน 1 หรือกดปุ่ม M บนคีย์บอร์ด แล้วคลิกอาคารที่ต้องการวาร์ปได้ทันทีเลยจ้า!'
      ]
    },
    {
      id: 'student_ton',
      name: 'ต้น เด็กปวช.สายไอที',
      role: '🧑‍💻 นักศึกษาฝึกงานไอที (โซน 1)',
      tx: 17, ty: 11,
      patrol: [
        { tx: 17, ty: 11 },
        { tx: 28, ty: 11 }
      ],
      speed: 46,
      dir: 'right',
      action: 'chat',
      marker: '💬',
      markerColor: '#60a5fa',
      style: {
        skin: '#f6cfa6', hair: '#241712', hairStyle: 'spiky', faceStyle: 'cool',
        shirt: '#2b6cb0', shirtStyle: 'jacket', pants: '#22272e', shoes: '#2563eb', hat: 'headphones'
      },
      greetings: [
        'โย่วเพื่อน! กำลังเดินไปเข้าอาคารเรียนสัปดาห์ไหนอยู่เหรอ?',
        'เมื่อกี้เราเพิ่งเข้าไปทำแล็บในอาคารมา พอเดินเข้าประตูอาคารปุ๊บ ข้างในมีทั้งอาจารย์ประจำสัปดาห์ กล่องเบิกอุปกรณ์ และตู้ Server Rack ให้ฝึกทำแล็บครบเลย!'
      ],
      quickReplies: [
        '👋 ไงต้น! สู้ ๆ กับการฝึกงานแอดมินนะ!',
        '🖥️ มีทริคเวลาทำแล็บตั้งค่า IP ไหม?'
      ],
      replyAnswers: [
        'สู้ตายอยู่แล้วเพื่อน! ไว้เจอกันบนตาราง Leaderboard ของห้องเรียนนะ! 🔥',
        'จำไว้เลยว่าเครื่องแม่ข่าย (Server) ต้องใช้ Static IP คงที่เสมอ เช่น `192.168.1.10/24` เพื่อให้เครื่องลูกข่ายหาเจอตลอดเวลา!'
      ]
    },
    {
      id: 'iot_botanist_mali',
      name: 'พี่มะลิ นักวิจัยเรือนกระจก IoT',
      role: '🌿 ผู้ดูแล Smart Glass Greenhouse (โซน 3)',
      tx: 29, ty: 35,
      patrol: [
        { tx: 29, ty: 35 },
        { tx: 35, ty: 35 }
      ],
      speed: 38,
      dir: 'right',
      action: 'chat',
      marker: '🌿',
      markerColor: '#34d399',
      style: {
        skin: '#f6cfa6', hair: '#10b981', hairStyle: 'long', faceStyle: 'smile',
        shirt: '#e2e8f0', shirtStyle: 'labcoat', pants: '#0d9488', shoes: '#e2e8f0', hat: ''
      },
      greetings: [
        'สวัสดีจ้ะ! ด้านหลังพี่คือเรือนกระจกเกษตรอัจฉริยะ (Smart IoT Greenhouse) ของหมู่บ้านเราเอง',
        'เซนเซอร์วัดความชื้นและอุณหภูมิในเรือนกระจกส่งข้อมูลไปเก็บในฐานข้อมูล MariaDB (พอร์ต 3306) และแสดงผลบนเว็บ Apache2 (พอร์ต 80/443) แบบเรียลไทม์เลยนะ!'
      ],
      quickReplies: [
        '👋 สวัสดีครับ/ค่ะพี่มะลิ เรือนกระจกสวยมากเลย!',
        '📊 ข้อมูลเซนเซอร์สำรองไว้ยังไงไม่ให้หายครับ?'
      ],
      replyAnswers: [
        'ขอบคุณจ้า! กระจกใสสะท้อนแสงแดดอบอุ่น แถมต้นไม้ข้างในก็เติบโตดีเพราะระบบเซิร์ฟเวอร์ที่เสถียรนี่แหละ 🌱',
        'พี่ใช้กฎ 3-2-1 Backup และตั้ง `mysqldump` ร่วมกับ `rsync` สำรองข้อมูลขึ้นเซิร์ฟเวอร์ทุกคืนตามที่เรียนในสัปดาห์ที่ 16 เลยจ้ะ!'
      ]
    },
    {
      id: 'blacksmith_khem',
      name: 'ช่างเข้ม โรงซ่อมฮาร์ดแวร์',
      role: '🛠️ หัวหน้าช่าง Hardware Forge & Repair (โซน 3)',
      tx: 18, ty: 44,
      dir: 'down',
      action: 'shop',
      marker: '🛠️',
      markerColor: '#fb923c',
      style: {
        skin: '#c68642', hair: '#241712', hairStyle: 'wolfcut', faceStyle: 'cyber',
        shirt: '#c05621', shirtStyle: 'cyber_armor', pants: '#22272e', shoes: '#1f2428', hat: ''
      },
      greetings: [
        'เฮ้! ยินดีต้อนรับสู่โรงซ่อมฮาร์ดแวร์และประกอบตู้แร็คเซิร์ฟเวอร์!',
        'ถ้าต้องการอุปกรณ์เสริม เครื่องมือซ่อมบำรุง หรือไอเท็มช่วยทำเควส แวะเปิดดูรายการสินค้ากับพี่ตรงนี้ได้เลย!'
      ],
      quickReplies: [
        '👋 สวัสดีครับ/ค่ะช่างเข้ม แว่น Cyber เท่มาก!',
        '💽 ถ้าฮาร์ดดิสก์ในเซิร์ฟเวอร์เสีย 1 ลูก ควรใช้ RAID อะไร?'
      ],
      replyAnswers: [
        'แน่นอน! แว่น Cyber AR ตัวนี้สแกนความร้อนของ CPU และสถานะไฟ LED ของพอร์ตแลนได้ในพริบตา! ⚡',
        'ถ้ามีดิสก์ 2 ลูกให้ใช้ RAID 1 (Mirroring) แต่ถ้ามีตั้งแต่ 3 ลูกขึ้นไปแนะนำ RAID 5 เลย ดิสก์พังไป 1 ลูกระบบก็ยังออนไลน์ต่อได้ไม่สะดุด!'
      ]
    },
    {
      id: 'rancher_boon',
      name: 'ลุงบุญ นายสถานีโรงนา & ไซโล',
      role: '🐂 ผู้ดูแลโรงนาแดงและหอไซโล (โซน 2)',
      tx: 72, ty: 18,
      patrol: [
        { tx: 72, ty: 18 },
        { tx: 78, ty: 18 }
      ],
      speed: 35,
      dir: 'right',
      action: 'chat',
      marker: '🌾',
      markerColor: '#f87171',
      style: {
        skin: '#e3ae7c', hair: '#5a331c', hairStyle: 'curly', faceStyle: 'happy',
        shirt: '#c53030', shirtStyle: 'overalls', pants: '#2c4969', shoes: '#5c3317', hat: 'straw'
      },
      greetings: [
        'ฮ่า ๆ สวัสดีหลานรัก! เดินมาไกลถึงฝั่งตะวันออกของโซน 2 เลยนะ!',
        'โรงนาสีแดงและหอไซโลตรงนี้เก็บเสบียงและม้วนสายไฟเบอร์ออปติกสำรองไว้เลี้ยงคนทั้งหมู่บ้านเลยล่ะ!'
      ],
      quickReplies: [
        '👋 สวัสดีครับ/ค่ะลุงบุญ โรงนาสีแดงเด่นมาแต่ไกลเลย!',
        '🌐 แถวโซน 2 นี้มีอาคารเรียนเรื่องอะไรบ้างครับ?'
      ],
      replyAnswers: [
        'เพิ่งทาสีใหม่รับฤดูใบไม้ผลินี้เลยล่ะ! เดินชมวิวทุ่งหญ้าและบ่อน้ำแถวนี้ตามสบายเลยนะ!',
        'โซน 2 (NE) นี่รวมหัวใจของระบบเครือข่ายเลย! มีตั้งแต่ RAID Storage (ส.6), SSH รีโมต (ส.7), DHCP จ่ายไอพี (ส.8), DNS โดเมน (ส.9) ไปจนถึง Systemd & Cron (ส.10) เลย!'
      ]
    },
    {
      id: 'nurse_patch',
      name: 'พยาบาลแพทช์ (คลินิกกู้ภัยระบบ)',
      role: '🏥 ผู้เชี่ยวชาญ Security Patch & Recovery (โซน 4)',
      tx: 56, ty: 44,
      patrol: [
        { tx: 56, ty: 44 },
        { tx: 61, ty: 44 }
      ],
      speed: 38,
      dir: 'right',
      action: 'codex',
      marker: '🏥',
      markerColor: '#2dd4bf',
      style: {
        skin: '#fde0c4', hair: '#8b5cf6', hairStyle: 'bun', faceStyle: 'star',
        shirt: '#e2e8f0', shirtStyle: 'labcoat', pants: '#1e3a5f', shoes: '#e2e8f0', hat: ''
      },
      greetings: [
        'สวัสดีค่ะ! คลินิกตรวจสุขภาพและกู้ภัยเซิร์ฟเวอร์ประจำโซน 4 ยินดีให้บริการค่ะ 💚',
        'การอัปเดต Security Patch สม่ำเสมอ เปิด Firewall (UFW) และตรวจ Log ใน `/var/log/auth.log` คือวัคซีนป้องกันเซิร์ฟเวอร์ที่ดีที่สุดนะคะ!'
      ],
      quickReplies: [
        '👋 สวัสดีครับ/ค่ะคุณพยาบาลแพทช์!',
        '🛡️ ถ้าเจอคนสุ่มรหัสผ่าน SSH ใน Log ต้องทำยังไงครับ?'
      ],
      replyAnswers: [
        'สวัสดีจ้า! ดูแลสุขภาพเซิร์ฟเวอร์แล้ว อย่าลืมดูแลสุขภาพตัวเองและเติม Energy ในเกมด้วยนะ ✨',
        'ถ้าพบข้อความ `Failed password` รัว ๆ ใน `/var/log/auth.log` คือการโจมตีแบบ Brute Force! ต้องรีบปิด Root Login, เปลี่ยนไปใช้ SSH Key และบล็อก IP ผู้บุกรุกด้วย Firewall ทันทีค่ะ!'
      ]
    }
  ];

  // 18 Progressive Weekly Quests (18-Week Thai ปวช. Semester)
  const QUESTS = [
    {
      id: 1, unit: 1, week: 1,
      title: 'สัปดาห์ที่ 1: ปลุกเครือข่ายหมู่บ้าน (NOS & Client-Server)',
      npcId: 'elder_admin', stationId: 'rack_w1', requiredItem: 'lan_cable',
      rewardBytes: 100, rewardItem: null,
      directionHint: 'โซน 1 (NW) ศาลาลานหมู่บ้าน — เก็บกล่องสายแลน Cat6 แล้วคุยลุงแอดมิน',
      summary: 'เก็บสายแลน Cat6 เชื่อมต่อสวิตช์หลัก และแยกความต่าง Client-Server กับ Peer-to-Peer',
      introDialog: [
        'สวัสดีนักศึกษาฝึกงาน! ยินดีต้อนรับสู่หลักสูตร 18 สัปดาห์แห่งหมู่บ้าน Server Valley!',
        'เริ่มสัปดาห์ที่ 1: เก็บ "สายแลน Cat6" จากกล่องข้างทางด้านซ้าย แล้วกด E ที่ตู้สวิตช์หลักเพื่อปลุกระบบ Client-Server นะ!'
      ],
      completeDialog: [
        'เยี่ยมมาก! สัปดาห์ที่ 1 ผ่านฉลุย! ต่อไปเดินไปทางขวาที่ "โรงหลอม VM" เพื่อพบช่างอาร์ตในสัปดาห์ที่ 2 ได้เลย!'
      ]
    },
    {
      id: 2, unit: 2, week: 2,
      title: 'สัปดาห์ที่ 2: สร้างเครื่องเสมือน (Virtualization / VM)',
      npcId: 'art_vm', stationId: 'rack_w23', requiredItem: null,
      rewardBytes: 110, rewardItem: { id: 'admin_coffee', qty: 1 },
      directionHint: 'โซน 1 (NW) โรงหลอม VM หลังคาสีน้ำเงิน — พบช่างอาร์ต',
      summary: 'จัดสเปก Virtual Machine (Hypervisor Type-2, RAM, Disk, Internal/Bridged Network)',
      introDialog: [
        'ยินดีต้อนรับสู่สัปดาห์ที่ 2! มาสร้างเครื่องแม่ข่ายจำลองบน VirtualBox กัน',
        'กด E ที่ตู้เครื่องแม่ข่ายจำลองข้างพี่ เพื่อจัดสเปก RAM/Disk และเลือกโหมดเครือข่ายที่ปลอดภัยไม่ชนเน็ตวิทยาลัย!'
      ],
      completeDialog: [
        'จัดสเปก VM ได้เฉียบมาก! ต่อไปเก็บ "แฟลชไดรฟ์ ISO Server" จากกล่องข้างโรงหลอม แล้วลุยสัปดาห์ที่ 3 ต่อเลย!'
      ]
    },
    {
      id: 3, unit: 3, week: 3,
      title: 'สัปดาห์ที่ 3: ติดตั้งระบบปฏิบัติการ (Server OS Installation)',
      npcId: 'art_vm', stationId: 'rack_w23', requiredItem: 'iso_usb',
      rewardBytes: 120, rewardItem: { id: 'cli_wrench', qty: 1 },
      directionHint: 'โซน 1 (NW) โรงหลอม VM — เก็บกล่องแฟลชไดรฟ์ ISO แล้วใช้งานตู้ VM',
      summary: 'ติดตั้ง Ubuntu Server 24.04 พร้อม OpenSSH และเรียนรู้โครงสร้างโฟลเดอร์ /etc, /var, /',
      introDialog: [
        'สัปดาห์ที่ 3 แล้ว! นำ "แฟลชไดรฟ์ ISO Server" ไปกด E ที่ตู้ VM Host เพื่อติดตั้ง Ubuntu Server และเรียนรู้โครงสร้างไดเรกทอรี Linux!'
      ],
      completeDialog: [
        'ติดตั้ง Ubuntu Server สำเร็จ! พี่มอบ "ประแจ CLI & Systemd" ให้พกไว้ใช้ ต่อไปลงมาทางใต้ที่ "ห้องคอนโซลหลัก" พบอาจารย์ริน (สัปดาห์ที่ 4)!'
      ]
    },
    {
      id: 4, unit: 4, week: 4,
      title: 'สัปดาห์ที่ 4: ตั้งค่า Static IP & คำสั่ง CLI พื้นฐาน',
      npcId: 'prof_rin', stationId: 'rack_w45', requiredItem: 'cli_wrench',
      rewardBytes: 130, rewardItem: null,
      directionHint: 'โซน 1 (NW) ห้องคอนโซลหลัก หลังคาเขียว — พบอาจารย์ริน',
      summary: 'ฝึกใช้ Terminal CLI (ip addr, hostnamectl) และตั้งค่า Static IP 192.168.1.10/24 ด้วย Netplan',
      introDialog: [
        'สวัสดีสัปดาห์ที่ 4 จ้ะ! เครื่องแม่ข่ายต้องใช้ Static IP คงที่ กด E ที่ตู้คอนโซลหลักเพื่อฝึกพิมพ์คำสั่ง CLI และตั้งค่า Netplan ได้เลย!'
      ],
      completeDialog: [
        'เก่งมาก! เครื่องได้ Static IP เรียบร้อย ต่อไปทำสัปดาห์ที่ 5 เรื่องบัญชีผู้ใช้และ chmod ต่อที่ห้องนี้เลยจ้ะ!'
      ]
    },
    {
      id: 5, unit: 5, week: 5,
      title: 'สัปดาห์ที่ 5: จัดการผู้ใช้งาน กลุ่ม และสิทธิ์ไฟล์ (chmod)',
      npcId: 'prof_rin', stationId: 'rack_w45', requiredItem: 'cli_wrench',
      rewardBytes: 140, rewardItem: { id: 'raid_toolkit', qty: 1 },
      directionHint: 'โซน 1 (NW) ห้องคอนโซลหลัก — ทำแล็บ User & chmod 755/600',
      summary: 'คำนวณบิต chmod 755 (r=4, w=2, x=1), กำหนดสิทธิ์กุญแจ 600 และเพิ่มผู้ใช้เข้ากลุ่ม itdept',
      introDialog: [
        'สัปดาห์ที่ 5 มาฝึกกำหนดสิทธิ์ไฟล์ด้วย chmod และจัดการผู้ใช้กัน กด E ที่ตู้คอนโซลหลักได้เลย!'
      ],
      completeDialog: [
        'ผ่านโซน 1 ครบ 5 สัปดาห์แล้ว! ครูมอบ "ชุดดิสก์ RAID & Backup" ให้ ต่อไปข้ามถนนใหญ่ไป "โซน 2 (NE) โกดัง RAID" พบช่างดิสก์ในสัปดาห์ที่ 6!'
      ]
    },
    {
      id: 6, unit: 6, week: 6,
      title: 'สัปดาห์ที่ 6: จัดการดิสก์ ไฟล์ระบบ และ RAID Storage',
      npcId: 'disk_tech', stationId: 'rack_w6', requiredItem: 'raid_toolkit',
      rewardBytes: 150, rewardItem: { id: 'ssh_key', qty: 1 },
      directionHint: 'โซน 2 (NE) โกดัง RAID — ข้ามถนนกลางไปฝั่งตะวันออกเฉียงเหนือ พบช่างดิสก์',
      summary: 'เลือก RAID 0/1/5 ให้เหมาะกับงาน และฝึกคำสั่ง lsblk, df -h, mount และ /etc/fstab',
      introDialog: [
        'ยินดีต้อนรับสู่โซน 2 สัปดาห์ที่ 6! ข้อมูลเซิร์ฟเวอร์สำคัญมาก ต้องรู้จักจัดระบบดิสก์และ RAID!',
        'นำ "ชุดดิสก์ RAID & Backup" ไปกด E ที่ตู้ RAID Storage ข้างพี่ได้เลย!'
      ],
      completeDialog: [
        'เยี่ยมยอด! ระบบ RAID ปลอดภัยและเมานต์ดิสก์ถาวรใน /etc/fstab แล้ว พี่ให้ "กุญแจเข้ารหัส SSH" ไว้ไปลุยสัปดาห์ที่ 7 ที่หอสื่อสาร SSH ด้านขวาเลย!'
      ]
    },
    {
      id: 7, unit: 7, week: 7,
      title: 'สัปดาห์ที่ 7: บริหารจัดการระยะไกล (SSH, RDP & Webmin)',
      npcId: 'non_remote', stationId: 'rack_w7', requiredItem: 'ssh_key',
      rewardBytes: 150, rewardItem: { id: 'config_scroll', qty: 1 },
      directionHint: 'โซน 2 (NE) หอสื่อสาร SSH หลังคาสีม่วง — พบพี่นนท์',
      summary: 'จับคู่พอร์ตรีโมต (SSH 22, RDP 3389), ปฏิเสธ Telnet (23) และทดสอบเชื่อมต่อ ssh admin@192.168.1.10',
      introDialog: [
        'สัปดาห์ที่ 7 มาตั้งค่าระบบ Remote Administration กัน! ใช้กุญแจ SSH กด E ที่เสาสัญญาณรีโมตข้างพี่เลย!'
      ],
      completeDialog: [
        'เชื่อมต่อ SSH สำเร็จ! พี่มอบ "ม้วนสคริปต์ Config" ไว้ให้ใช้ตั้งค่า DHCP & DNS ต่อไปเดินไปขวาสุดที่ "ศูนย์จ่าย IP" พบเจ๊มีน (สัปดาห์ที่ 8)!'
      ]
    },
    {
      id: 8, unit: 8, week: 8,
      title: 'สัปดาห์ที่ 8: ติดตั้งและตั้งค่า DHCP Server (DORA)',
      npcId: 'meen_dhcp', stationId: 'rack_w8', requiredItem: 'config_scroll',
      rewardBytes: 160, rewardItem: null,
      directionHint: 'โซน 2 (NE) มุมขวาบน ศูนย์จ่าย IP หลังคาสีฟ้า — พบเจ๊มีน',
      summary: 'เรียงลำดับ D-O-R-A และกำหนดช่วง IP Pool 192.168.1.100–200 (พอร์ต UDP 67/68)',
      introDialog: [
        'สัปดาห์ที่ 8 แล้วจ้า! ช่วยเจ๊เรียงลำดับ DORA และตั้งค่า IP Pool ที่ตู้ ISC-DHCP Server ข้าง ๆ ทีนะ!'
      ],
      completeDialog: [
        'IP ไหลลื่นทั้งหมู่บ้านแล้ว! ต่อไปเดินลงมาที่ "หอคอย DNS" ฝั่งตะวันตกเฉียงใต้ของโซน 2 เพื่อพบปู่โดเมน (สัปดาห์ที่ 9)!'
      ]
    },
    {
      id: 9, unit: 9, week: 9,
      title: 'สัปดาห์ที่ 9: บริหารจัดการ DNS Server (BIND9)',
      npcId: 'sage_dns', stationId: 'rack_w9', requiredItem: 'config_scroll',
      rewardBytes: 160, rewardItem: null,
      directionHint: 'โซน 2 (NE) หอคอย DNS หลังคาสีส้มทอง — พบปู่โดเมน',
      summary: 'ตั้งค่า Zone File (A Record, CNAME, MX) พอร์ต 53 และทดสอบ nslookup valley.local',
      introDialog: [
        'โฮ่ ๆ สัปดาห์ที่ 9 มาตั้งค่าสมุดโทรศัพท์โดเมน BIND9 กัน กด E ที่เซิร์ฟเวอร์ DNS ข้างปู่ได้เลย!'
      ],
      completeDialog: [
        'แปลงชื่อ valley.local สำเร็จแล้ว! ต่อไปเดินไปทางขวาที่ "หอนาฬิกา Systemd" เพื่อพบพี่ครอนในสัปดาห์ที่ 10!'
      ]
    },
    {
      id: 10, unit: 10, week: 10,
      title: 'สัปดาห์ที่ 10: จัดการเซอร์วิส Systemd & Cron Jobs',
      npcId: 'cron_master', stationId: 'rack_w10', requiredItem: 'cli_wrench',
      rewardBytes: 170, rewardItem: null,
      directionHint: 'โซน 2 (NE) หอนาฬิกา Systemd หลังคาสีทอง — พบพี่ครอน',
      summary: 'ใช้คำสั่ง systemctl enable/restart, ตรวจสอบโปรเซส และตั้งเวลา Crontab 0 2 * * *',
      introDialog: [
        'สัปดาห์ที่ 10! แอดมินเก่ง ๆ ต้องให้เครื่องทำงานอัตโนมัติแทนเราได้ กด E ที่คอนโซล Systemd & Cron ข้างพี่เลย!'
      ],
      completeDialog: [
        'ผ่านโซน 2 ครบกลางภาคแล้ว! ต่อไปข้ามไป "โซน 3 (SW) ตลาดเว็บ & DB" ฝั่งตะวันตกเฉียงใต้ เพื่อพบแม่ค้ามายด์ (สัปดาห์ที่ 11)!'
      ]
    },
    {
      id: 11, unit: 11, week: 11,
      title: 'สัปดาห์ที่ 11: เปิดบริการ Web & Database (LAMP Stack)',
      npcId: 'mind_web', stationId: 'rack_w11', requiredItem: 'config_scroll',
      rewardBytes: 175, rewardItem: { id: 'admin_coffee', qty: 1 },
      directionHint: 'โซน 3 (SW) ตลาดเว็บ & DB หลังคาชมพู — พบแม่ค้ามายด์',
      summary: 'สตาร์ท apache2 (80/443) + mariadb (3306) และตั้ง Document Root ที่ /var/www/html',
      introDialog: [
        'ยินดีต้อนรับสู่โซน 3 สัปดาห์ที่ 11! ช่วยเปิดเว็บไซต์หมู่บ้านและฐานข้อมูลที่ตู้ LAMP Stack ข้างพี่ทีนะ!'
      ],
      completeDialog: [
        'เว็บเปิดได้แล้วจ้า! ต่อไปเดินไปทางขวาที่ "โกดังแชร์ไฟล์" เพื่อพบลุงแซมในสัปดาห์ที่ 12!'
      ]
    },
    {
      id: 12, unit: 12, week: 12,
      title: 'สัปดาห์ที่ 12: บริการแชร์ไฟล์เครือข่าย (Samba & FTP)',
      npcId: 'uncle_samba', stationId: 'rack_w12', requiredItem: 'config_scroll',
      rewardBytes: 175, rewardItem: { id: 'mail_key', qty: 1 },
      directionHint: 'โซน 3 (SW) โกดังแชร์ไฟล์ — พบลุงแซม',
      summary: 'ตั้งค่า smb.conf พอร์ต 445 ให้ Windows เข้าใช้งานได้ และเลือกใช้ SFTP (22) อย่างปลอดภัย',
      introDialog: [
        'สัปดาห์ที่ 12! ช่วยลุงตั้งค่า Samba Share ที่ตู้คลังไฟล์ข้าง ๆ เพื่อแชร์เอกสารให้เครื่อง Windows ทีนะ!'
      ],
      completeDialog: [
        'แชร์ไฟล์ฉลุย! ลุงมอบ "ชุด Proxy & Mail Server" ให้ ต่อไปเดินลงใต้มาที่ "สถานี Proxy & Mail" พบพี่เมล์ (สัปดาห์ที่ 13)!'
      ]
    },
    {
      id: 13, unit: 13, week: 13,
      title: 'สัปดาห์ที่ 13: ตั้งค่า Proxy Server & Mail Server',
      npcId: 'mail_ops', stationId: 'rack_w13', requiredItem: 'mail_key',
      rewardBytes: 185, rewardItem: { id: 'win_license', qty: 1 },
      directionHint: 'โซน 3 (SW) สถานี Proxy & Mail หลังคาสีแดง — พบพี่เมล์',
      summary: 'ตั้งค่า Squid Proxy ACL (พอร์ต 3128) และจับคู่พอร์ตอีเมล SMTP (25), IMAP (143), POP3 (110)',
      introDialog: [
        'สัปดาห์ที่ 13 แล้ว! เราต้องตั้ง Squid Proxy กรองเว็บอันตรายและเปิดระบบอีเมลของวิทยาลัย กด E ที่ตู้ Proxy & Mail ได้เลย!'
      ],
      completeDialog: [
        'ยอดเยี่ยม! Proxy กรองเว็บและ Mail Server พร้อมทำงาน พี่มอบ "ชุดเครื่องมือ Windows Server" ให้ เดินไปทางขวาที่ "ศาลา Windows Server" พบครูวิน (สัปดาห์ที่ 14)!'
      ]
    },
    {
      id: 14, unit: 14, week: 14,
      title: 'สัปดาห์ที่ 14: Windows Server (AD DS, IIS & PowerShell)',
      npcId: 'teacher_win', stationId: 'rack_w14', requiredItem: 'win_license',
      rewardBytes: 200, rewardItem: { id: 'ufw_shield', qty: 1 },
      directionHint: 'โซน 3 (SW) ศาลา Windows Server หลังคาสีฟ้า — พบครูวิน',
      summary: 'สร้าง Active Directory Domain Controller, ตั้งค่า IIS (C:\\inetpub\\wwwroot) และรัน PowerShell',
      introDialog: [
        'สัปดาห์ที่ 14 มาลุยฝั่ง Windows Server 2022 กัน! กด E ที่ตู้ Windows Server ข้างครู เพื่อทำแล็บ AD DS, IIS และ PowerShell สีน้ำเงิน!'
      ],
      completeDialog: [
        'เก่งครบทั้ง Linux และ Windows Server แล้ว! ครูมอบ "โล่ไฟร์วอลล์ UFW" ให้ ข้ามสะพานไป "โซน 4 (SE) ป้อมไฟร์วอลล์" พบหัวหน้ายามเค (สัปดาห์ที่ 15)!'
      ]
    },
    {
      id: 15, unit: 15, week: 15,
      title: 'สัปดาห์ที่ 15: ป้องกันเซิร์ฟเวอร์ด้วย Firewall (UFW)',
      npcId: 'guard_k', stationId: 'rack_w15', requiredItem: 'ufw_shield',
      rewardBytes: 210, rewardItem: null,
      directionHint: 'โซน 4 (SE) ป้อมไฟร์วอลล์ — พบหัวหน้ายามเค',
      summary: 'ตั้งนโยบาย Default Deny Incoming, เปิดพอร์ตจำเป็น และบล็อก Telnet (23) กับ MySQL ภายนอก (3306)',
      introDialog: [
        'ยินดีต้อนรับสู่โซนสุดท้าย (โซน 4) สัปดาห์ที่ 15! นำโล่ UFW ไปกด E ที่แผงควบคุมไฟร์วอลล์เพื่อปิดช่องโหว่ทันที!'
      ],
      completeDialog: [
        'ป้อมไฟร์วอลล์แข็งแกร่งแล้ว! ต่อไปเดินไปทางขวาที่ "คลัง Backup" เพื่อพบพี่แบ็คในสัปดาห์ที่ 16!'
      ]
    },
    {
      id: 16, unit: 16, week: 16,
      title: 'สัปดาห์ที่ 16: สำรองและกู้คืนข้อมูล (Backup 3-2-1)',
      npcId: 'back_keeper', stationId: 'rack_w16', requiredItem: 'raid_toolkit',
      rewardBytes: 220, rewardItem: { id: 'log_lens', qty: 1 },
      directionHint: 'โซน 4 (SE) คลัง Backup หลังคาเขียวเข้ม — พบพี่แบ็ค',
      summary: 'วางแผนกฎสำรองข้อมูล 3-2-1, แยก Full/Incremental/Differential และฝึกคำสั่ง tar & rsync',
      introDialog: [
        'สัปดาห์ที่ 16! ถ้าระบบโดน Ransomware หรือฮาร์ดดิสก์พัง สิ่งเดียวที่ช่วยเราได้คือ Backup! กด E ที่ตู้เซฟสำรองข้อมูลข้างพี่เลย!'
      ],
      completeDialog: [
        'ระบบสำรองข้อมูล 3-2-1 สมบูรณ์แล้ว! พี่ให้ "แว่นสแกนพอร์ต & Log" ไว้ใช้ เดินลงมาทางใต้ที่ "หอตรวจ Log" พบหมอเซิร์ฟ (สัปดาห์ที่ 17)!'
      ]
    },
    {
      id: 17, unit: 17, week: 17,
      title: 'สัปดาห์ที่ 17: เฝ้าระวังระบบ ตรวจสอบ Log และแก้ปัญหา',
      npcId: 'doc_serv', stationId: 'rack_w17', requiredItem: 'log_lens',
      rewardBytes: 230, rewardItem: null,
      directionHint: 'โซน 4 (SE) หอตรวจ Log หลังคาสีฟ้าอมเขียว — พบหมอเซิร์ฟ',
      summary: 'วิเคราะห์ 3 เคสเซิร์ฟเวอร์ล่มจริงจาก /var/log/auth.log, nslookup, ufw status และ ss -tulnp',
      introDialog: [
        'สัปดาห์ที่ 17 แล้ว! มีเหตุฉุกเฉิน 3 เคสเกิดขึ้นพร้อมกัน กด E ที่จอมอนิเตอร์ Log เพื่อช่วยหมอวินิจฉัยและแก้ปัญหาให้ตรงจุด!'
      ],
      completeDialog: [
        'วินิจฉัยได้แม่นยำระดับมืออาชีพ! เหลือภารกิจสุดท้ายแล้ว เดินไปทางขวาที่ "สภาแอดมินหลวง" พบ ผอ.เซิร์ฟเวอร์ (สัปดาห์ที่ 18)!'
      ]
    },
    {
      id: 18, unit: 18, week: 18,
      title: 'สัปดาห์ที่ 18: โครงงานบูรณาการและตรวจประเมินระบบครบวงจร',
      npcId: 'dean_admin', stationId: 'rack_w18', requiredItem: 'log_lens',
      rewardBytes: 350, rewardItem: null,
      directionHint: 'โซน 4 (SE) สภาแอดมินหลวง หลังคาสีม่วง — พบ ผอ.เซิร์ฟเวอร์',
      summary: 'ตรวจสอบสถาปัตยกรรม พอร์ตทองคำ และคำสั่งตรวจสุขภาพเซิร์ฟเวอร์ครบทั้ง 18 สัปดาห์',
      introDialog: [
        'ขอต้อนรับสู่สัปดาห์ที่ 18 สัปดาห์สุดท้ายของภาคเรียน! คุณได้ฟื้นฟูเซิร์ฟเวอร์มาแล้วถึง 17 สัปดาห์',
        'กด E ที่ "แท่นตรวจสอบระบบหลวง" ข้างผม เพื่อทำ Final Server Audit ครบวงจรและรับเกียรติบัตรผู้ดูแลระบบ ปวช. 100%!'
      ],
      completeDialog: [
        'ขอแสดงความยินดีอย่างยิ่ง! คุณผ่านครบทั้ง 18 สัปดาห์ของรายวิชาระบบปฏิบัติการเครื่องแม่ข่ายเบื้องต้นแล้ว! Server Valley ออนไลน์สมบูรณ์ 100%!'
      ]
    }
  ];

  // Build 84x54 (4x Larger!) Scenic 4-District Tile Map
  function createTileMap() {
    const grid = [];
    for (let y = 0; y < MAP_H; y++) {
      const row = [];
      for (let x = 0; x < MAP_W; x++) row.push('grass');
      grid.push(row);
    }

    const fillRect = (x1, y1, x2, y2, tile) => {
      for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
          if (y >= 0 && y < MAP_H && x >= 0 && x < MAP_W) grid[y][x] = tile;
        }
      }
    };

    // Grand Boulevards dividing 4 Districts
    fillRect(3, 25, 80, 27, 'path'); // Main East-West Boulevard
    fillRect(40, 3, 43, 50, 'path'); // Main North-South Avenue

    // Warm Golden-Ochre Stardew Farmyards in front of all District Buildings!
    // Zone 1 (NW) Farmyard Clearing (matches the uploaded Stardew Valley screenshot!)
    fillRect(3, 8, 34, 21, 'path');
    fillRect(4, 8, 9, 8, 'grass');   // Lush green grass fringe right under Cottage front porch!
    fillRect(15, 8, 20, 8, 'grass'); // Grass fringe under Town Hall porch
    fillRect(25, 8, 30, 8, 'grass'); // Grass fringe under VM Lab porch

    // Separated Stardew Crop Plots in the Admin Farmyard (with golden-dirt walkways between plots!)
    fillRect(4, 12, 5, 13, 'soil');
    fillRect(7, 12, 8, 13, 'soil');
    fillRect(10, 12, 11, 13, 'soil');
    fillRect(4, 15, 5, 16, 'soil');
    fillRect(7, 15, 8, 16, 'soil');
    fillRect(10, 15, 11, 16, 'soil');

    // Wooden Farm Fence enclosing the West & South sides of the Admin Crop Yard (East side open to village!)
    fillRect(2, 8, 2, 17, 'fence');
    fillRect(2, 17, 11, 17, 'fence');

    // Zone 2 (NE) Golden Earth Clearing & Crop Plots
    fillRect(45, 8, 79, 21, 'path');
    fillRect(53, 12, 54, 13, 'soil');
    fillRect(56, 12, 57, 13, 'soil');
    fillRect(68, 12, 70, 14, 'soil');
    fillRect(31, 4, 39, 7, 'grass');
    fillRect(65, 4, 71, 8, 'grass');

    // Zone 3 (SW) Golden Earth Clearing & Crop Plots
    fillRect(4, 34, 34, 47, 'path');
    fillRect(12, 38, 14, 40, 'soil');
    fillRect(16, 38, 18, 40, 'soil');

    // Zone 4 (SE) Golden Earth Clearing & Crop Plots
    fillRect(47, 34, 74, 47, 'path');
    fillRect(56, 38, 58, 40, 'soil');
    fillRect(60, 38, 62, 40, 'soil');

    // District Internal Service Roads
    fillRect(4, 10, 79, 11, 'path');
    fillRect(4, 19, 79, 20, 'path');
    fillRect(4, 35, 79, 36, 'path');
    fillRect(4, 45, 79, 46, 'path');

    // Vertical Connectors inside Districts
    fillRect(12, 10, 13, 46, 'path');
    fillRect(27, 10, 28, 46, 'path');
    fillRect(55, 10, 56, 46, 'path');
    fillRect(71, 10, 72, 46, 'path');

    // Grand Central Plaza (Heart of Server Valley)
    fillRect(37, 23, 46, 30, 'stone');

    // 3 Scenic Waterways + Wooden Bridges!
    // 1. West Stream (with horizontal bridge on Boulevard)
    fillRect(22, 22, 24, 28, 'water');
    fillRect(22, 25, 24, 27, 'bridge');

    // 2. East Lake (with horizontal bridge on Boulevard)
    fillRect(59, 22, 63, 28, 'water');
    fillRect(59, 25, 63, 27, 'bridge');

    // 3. South Koi Pond (with vertical bridge on Central Avenue)
    fillRect(38, 39, 45, 42, 'water');
    fillRect(40, 39, 43, 42, 'bridge');

    // Decorative Park Fences around Central Plaza corners
    fillRect(35, 23, 36, 23, 'fence');
    fillRect(47, 23, 48, 23, 'fence');

    return grid;
  }

  // Generate Collision-Safe Trees (Border Forest + Cozy Park Groves with zero overlaps!)
  function createTrees(grid) {
    const trees = [];
    const occupied = new Set();
    const mark = (x, y) => occupied.add(x + ',' + y);

    // Protect buildings + scenery buildings + 2-tile apron around them
    [...BUILDINGS, ...SCENERY_BUILDINGS].forEach((b) => {
      for (let y = b.ty - 1; y <= b.ty + b.th + 1; y++) {
        for (let x = b.tx - 1; x <= b.tx + b.tw; x++) mark(x, y);
      }
    });
    // Protect NPCs, Town NPCs, Stations, Crates, Props
    [...NPCS, ...TOWN_NPCS, ...STATIONS, ...CRATES, ...SPECIAL_PROPS].forEach((o) => {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) mark(o.tx + dx, o.ty + dy);
      }
    });

    // Outer forest border
    for (let x = 0; x < MAP_W; x += 2) {
      trees.push({ tx: x, ty: 0, v: x % 3 });
      trees.push({ tx: Math.min(MAP_W - 1, x + 1), ty: MAP_H - 1, v: (x + 1) % 3 });
    }
    for (let y = 2; y < MAP_H - 1; y += 2) {
      trees.push({ tx: 0, ty: y, v: y % 3 });
      trees.push({ tx: MAP_W - 2, ty: y, v: (y + 1) % 3 });
    }

    // Scenic inner groves scattered deterministically on safe grass tiles
    for (let y = 3; y < MAP_H - 3; y += 3) {
      for (let x = 3; x < MAP_W - 3; x += 4) {
        const hash = ((x * 2654435761) ^ (y * 2246822519)) >>> 0;
        if (hash % 3 !== 0) continue;
        if (grid[y][x] !== 'grass') continue;
        if (occupied.has(x + ',' + y)) continue;
        trees.push({ tx: x, ty: y, v: hash % 3 });
        mark(x, y);
      }
    }
    return trees;
  }

  // Warm Village Street Lamps across all 4 Districts & Plaza
  const LAMPS = [
    { tx: 37, ty: 23 }, { tx: 46, ty: 23 }, { tx: 37, ty: 30 }, { tx: 46, ty: 30 },
    { tx: 14, ty: 10 }, { tx: 24, ty: 10 }, { tx: 45, ty: 10 }, { tx: 57, ty: 10 },
    { tx: 70, ty: 10 }, { tx: 14, ty: 19 }, { tx: 45, ty: 19 }, { tx: 59, ty: 19 },
    { tx: 11, ty: 35 }, { tx: 23, ty: 35 }, { tx: 47, ty: 35 }, { tx: 63, ty: 35 },
    { tx: 11, ty: 45 }, { tx: 24, ty: 45 }, { tx: 47, ty: 45 }, { tx: 63, ty: 45 }
  ];

  return {
    MAP_W,
    MAP_H,
    PLAYER_STYLE,
    ITEMS,
    BUILDINGS,
    SCENERY_BUILDINGS,
    STATIONS,
    CRATES,
    SPECIAL_PROPS,
    NPCS,
    TOWN_NPCS,
    QUESTS,
    LAMPS,
    createTileMap,
    createTrees
  };
})();
