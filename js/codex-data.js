// Complete 18-Week Thai Vocational (ปวช.) Curriculum Knowledge Library
// รายวิชาระบบปฏิบัติการเครื่องแม่ข่ายเบื้องต้น (หลักสูตรการสอน 18 สัปดาห์)
window.CODEX_UNITS = [
  {
    id: 1,
    code: 'สัปดาห์ที่ 1',
    title: 'พื้นฐานระบบเครือข่ายและระบบปฏิบัติการเครื่องแม่ข่าย (NOS)',
    eng: 'Network Basics & Network Operating System',
    location: 'โซน 1 (NW) ศาลาลานหมู่บ้าน • ลุงแอดมิน',
    summary: 'ทำความเข้าใจสถาปัตยกรรมเครือข่าย Peer-to-Peer และ Client-Server พร้อมบทบาทหน้าที่ของระบบปฏิบัติการเครื่องแม่ข่าย (NOS)',
    bullets: [
      '<strong>เครื่องแม่ข่าย (Server)</strong> คือคอมพิวเตอร์สมรรถนะสูงที่ให้บริการข้อมูล โปรแกรม หรือทรัพยากรแก่เครื่องลูกข่าย (Client) ตลอด 24 ชั่วโมง',
      '<strong>NOS (Network Operating System)</strong> แบ่งเป็น 2 กลุ่มหลัก: <strong>มาตรฐานปิด (Proprietary)</strong> เช่น Windows Server และ <strong>มาตรฐานเปิด (Open Source)</strong> เช่น Ubuntu Server, Rocky Linux, Debian',
      '<strong>Peer-to-Peer (P2P)</strong> ทุกเครื่องมีศักดิ์ศรีเท่าเทียมกัน ไม่มีเครื่องศูนย์กลาง เหมาะกับวงเล็ก (2–10 เครื่อง)',
      '<strong>Client-Server</strong> มีเครื่องแม่ข่ายเป็นศูนย์กลางควบคุมบัญชีผู้ใช้ สิทธิ์การเข้าถึง และความปลอดภัย เหมาะกับองค์กรและวิทยาลัย'
    ],
    table: {
      headers: ['หัวข้อเปรียบเทียบ', 'Peer-to-Peer (P2P)', 'Client-Server'],
      rows: [
        ['เครื่องศูนย์กลาง', 'ไม่มี ทุกเครื่องเป็นทั้งผู้ให้และผู้รับ', 'มี Server ควบคุมและให้บริการจากส่วนกลาง'],
        ['ความปลอดภัย', 'ต่ำ จัดการสิทธิ์แยกแต่ละเครื่อง', 'สูง ควบคุมบัญชีผู้ใช้กลาง (AD/LDAP)'],
        ['ขนาดเครือข่าย', 'ขนาดเล็ก (2–10 เครื่อง)', 'ขนาดกลางถึงใหญ่'],
        ['การดูแลระบบ', 'ไม่ต้องมี Admin ประจำ', 'ต้องมีผู้ดูแลระบบ (System Administrator)']
      ]
    },
    commands: `uname -a                 # ดูเวอร์ชัน Kernel และสถาปัตยกรรมเครื่อง
lsb_release -a           # ดูชื่อและเวอร์ชันของ Ubuntu/Debian
hostnamectl              # ดู Hostname และข้อมูลระบบปฏิบัติการ
uptime                   # ดูระยะเวลาที่เครื่องแม่ข่ายเปิดทำงานต่อเนื่อง`,
    examTip: 'NOS แบบมาตรฐานปิด = Windows Server (มีค่าลิขสิทธิ์ เน้น GUI/AD), มาตรฐานเปิด = Linux Server (ฟรี เสถียรสูง นิยมคุมผ่าน CLI)',
    quiz: {
      q: 'ข้อใดคือข้อได้เปรียบหลักของระบบเครือข่ายแบบ Client-Server เมื่อเทียบกับ Peer-to-Peer?',
      options: [
        'ไม่ต้องใช้สายสัญญาณเครือข่าย',
        'สามารถจัดการบัญชีผู้ใช้ ความปลอดภัย และสำรองข้อมูลจากศูนย์กลางได้',
        'ทุกเครื่องมีสิทธิ์เท่าเทียมกันและไม่ต้องมีผู้ดูแลระบบ'
      ],
      answer: 1
    }
  },
  {
    id: 2,
    code: 'สัปดาห์ที่ 2',
    title: 'ระบบจำลองเครื่องคอมพิวเตอร์ (Virtualization & Hypervisor)',
    eng: 'Virtual Machines (VirtualBox / VMware)',
    location: 'โซน 1 (NW) โรงหลอม VM • ช่างอาร์ต',
    summary: 'การใช้เทคโนโลยี Virtualization เพื่อสร้างเครื่องแม่ข่ายจำลองบนเครื่องคอมพิวเตอร์ฝึกปฏิบัติอย่างปลอดภัย',
    bullets: [
      '<strong>Hypervisor</strong> คือซอฟต์แวร์แบ่งทรัพยากรฮาร์ดแวร์ (CPU, RAM, Disk, NIC) ของเครื่องจริง (Host) ให้กับเครื่องเสมือน (Guest VM)',
      '<strong>Type-1 (Bare-Metal)</strong> ติดตั้งลงฮาร์ดแวร์โดยตรง เช่น VMware ESXi, Proxmox VE, Hyper-V Server',
      '<strong>Type-2 (Hosted)</strong> ติดตั้งบน OS ปกติ เช่น <strong>Oracle VirtualBox</strong> และ <strong>VMware Workstation</strong>',
      '<strong>โหมดเครือข่าย VM</strong>: <strong>NAT</strong> (ออกเน็ตผ่าน Host), <strong>Bridged</strong> (ได้ IP วง LAN จริง), <strong>Internal / Host-Only</strong> (สื่อสารกันเฉพาะวงจำลอง)'
    ],
    table: {
      headers: ['โหมดเครือข่าย VM', 'ลักษณะการทำงาน', 'การนำไปใช้ในห้องแล็บ'],
      rows: [
        ['NAT', 'แชร์ IP เครื่อง Host ออกอินเทอร์เน็ตได้', 'อัปเดตแพ็กเกจ (apt update) เบื้องต้น'],
        ['Bridged Adapter', 'รับ IP วงเดียวกับ LAN จริง', 'ทดสอบ Web/SSH/Samba ให้เครื่องอื่นเข้าถึง'],
        ['Internal Network', 'แยกวงจำลองเฉพาะระหว่าง VM ด้วยกัน', 'ฝึกตั้งค่า DHCP Server ไม่ให้ชนเน็ตวิทยาลัย!']
      ]
    },
    commands: `# ตรวจสอบการรองรับ Virtualization (Intel VT-x / AMD-V) บน Linux
egrep -c '(vmx|svm)' /proc/cpuinfo
VBoxManage list vms                   # แสดงรายชื่อ VM ใน VirtualBox`,
    examTip: 'เวลาฝึกตั้งค่า DHCP Server บน VirtualBox ต้องใช้ Internal Network หรือ Host-Only เพื่อไม่ให้แจก IP ไปรบกวนเครือข่ายจริงของวิทยาลัย!',
    quiz: {
      q: 'หากต้องการทดสอบสร้าง DHCP Server จำลองระหว่าง VM 2 เครื่องโดยไม่ให้รบกวนเครือข่ายจริง ควรเลือกโหมดเครือข่ายใด?',
      options: ['Bridged Adapter', 'Internal Network', 'Bluetooth Sharing'],
      answer: 1
    }
  },
  {
    id: 3,
    code: 'สัปดาห์ที่ 3',
    title: 'การติดตั้งระบบปฏิบัติการเครื่องแม่ข่าย (Server OS Installation)',
    eng: 'Installing Ubuntu Server & Linux Directory Structure',
    location: 'โซน 1 (NW) โรงหลอม VM • ช่างอาร์ต',
    summary: 'การเตรียมไฟล์อิมเมจ ISO การแบ่งพาร์ติชัน โครงสร้างระบบไฟล์มาตรฐาน Linux (FHS) และขั้นตอนการติดตั้ง Server OS',
    bullets: [
      '<strong>ไฟล์ ISO</strong> เช่น <code>ubuntu-24.04-live-server-amd64.iso</code> หรือ <code>Windows_Server_2022.iso</code>',
      '<strong>โครงสร้างไดเรกทอรีสำคัญบน Linux</strong>: <code>/</code> (Root), <code>/etc</code> (ไฟล์ Config), <code>/var</code> (เว็บ <code>/var/www</code> และ Log <code>/var/log</code>), <code>/home</code> (ไฟล์ผู้ใช้), <code>Swap</code> (หน่วยความจำเสมือน)',
      'ระหว่างติดตั้ง Ubuntu Server ควรติ๊กเลือก <strong>Install OpenSSH Server</strong> เพื่อให้รีโมตจัดการได้ทันทีหลังบูต',
      'หลังติดตั้งเสร็จควรอัปเดตแพ็กเกจทันทีด้วย <code>sudo apt update && sudo apt upgrade -y</code>'
    ],
    table: {
      headers: ['ไดเรกทอรี Linux', 'หน้าที่หลัก'],
      rows: [
        ['/ (Root)', 'รากของระบบไฟล์ทั้งหมด เปรียบเสมือนไดรฟ์ C:'],
        ['/etc', 'เก็บไฟล์ตั้งค่า (Configuration Files) ของระบบและเซอร์วิส'],
        ['/var', 'เก็บข้อมูลที่มีการเปลี่ยนแปลง เช่น /var/www และ /var/log'],
        ['/home', 'เก็บโฟลเดอร์ส่วนตัวของผู้ใช้งานทั่วไป']
      ]
    },
    commands: `sudo apt update                # อัปเดตรายชื่อแพ็กเกจล่าสุด
sudo apt upgrade -y            # อัปเกรดซอฟต์แวร์และแพตช์ความปลอดภัย
df -h                          # ตรวจสอบพื้นที่พาร์ติชันดิสก์
free -h                        # ตรวจสอบหน่วยความจำ RAM และ Swap`,
    examTip: 'จำ 4 โฟลเดอร์ยอดฮิต: /etc (Config), /var/log (Log), /var/www (Web), /home (User Files)',
    quiz: {
      q: 'ไดเรกทอรีใดบน Linux Server ใช้สำหรับเก็บไฟล์ตั้งค่าระบบและเซอร์วิสต่าง ๆ?',
      options: ['/home', '/etc', '/tmp'],
      answer: 1
    }
  },
  {
    id: 4,
    code: 'สัปดาห์ที่ 4',
    title: 'การตั้งค่าพื้นฐาน Static IP และคำสั่ง CLI เครื่องแม่ข่าย',
    eng: 'Static IP (Netplan), Hostname & Basic CLI',
    location: 'โซน 1 (NW) ห้องคอนโซลหลัก • อาจารย์ริน',
    summary: 'เหตุผลที่เครื่องแม่ข่ายต้องใช้ Static IP การตั้งค่าผ่าน Netplan และคำสั่ง CLI พื้นฐานที่ใช้ทุกวัน',
    bullets: [
      '<strong>Static IP Address</strong> ทำให้เครื่องแม่ข่ายมี IP คงที่ ไม่เปลี่ยนไปมา เพื่อให้เครื่องลูกข่ายและ DNS หาเจอตลอดเวลา',
      '<strong>องค์ประกอบเครือข่าย 4 อย่าง</strong>: IP Address, Subnet Mask (เช่น 255.255.255.0 หรือ /24), Default Gateway และ DNS Server',
      '<strong>Netplan</strong> คือระบบตั้งค่าเครือข่ายของ Ubuntu Server แก้ไขไฟล์ YAML ใน <code>/etc/netplan/</code> แล้วสั่ง <code>sudo netplan apply</code>',
      '<strong>คำสั่ง CLI พื้นฐาน</strong>: <code>ip addr</code>, <code>ping</code>, <code>hostnamectl</code>, <code>pwd</code>, <code>ls -la</code>, <code>cd</code>, <code>mkdir</code>, <code>nano</code>'
    ],
    table: {
      headers: ['คำสั่ง Linux', 'หน้าที่', 'เทียบเท่า Windows'],
      rows: [
        ['ip addr', 'ดูหมายเลข IP และการ์ดแลน', 'ipconfig'],
        ['ls -la', 'ดูรายการไฟล์ทั้งหมดพร้อมสิทธิ์', 'dir'],
        ['hostnamectl set-hostname srv01', 'เปลี่ยนชื่อเครื่องแม่ข่าย', 'Rename-Computer'],
        ['ping 192.168.1.1', 'ทดสอบการเชื่อมต่อเครือข่าย', 'ping 192.168.1.1']
      ]
    },
    commands: `# ตัวอย่าง /etc/netplan/00-installer-config.yaml
network:
  version: 2
  ethernets:
    enp0s3:
      dhcp4: no
      addresses: [192.168.1.10/24]
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8]

sudo netplan apply && ip addr`,
    examTip: 'Subnet Mask 255.255.255.0 เขียนแบบ CIDR คือ /24 ใช้งาน IP เครื่องลูกข่ายได้ 254 หมายเลข (.1 ถึง .254)',
    quiz: {
      q: 'คำสั่งใดใช้ดูหมายเลข IP Address บน Ubuntu Server?',
      options: ['ip addr', 'mkdir ip', 'chmod ip'],
      answer: 0
    }
  },
  {
    id: 5,
    code: 'สัปดาห์ที่ 5',
    title: 'การจัดการผู้ใช้งาน กลุ่ม และสิทธิ์การเข้าถึง (User & chmod)',
    eng: 'User/Group Management & Linux Permissions',
    location: 'โซน 1 (NW) ห้องคอนโซลหลัก • อาจารย์ริน',
    summary: 'การสร้าง/ลบผู้ใช้ การจัดการกลุ่ม sudo และการคำนวณกำหนดสิทธิ์ไฟล์แบบฐานแปด (r=4, w=2, x=1)',
    bullets: [
      '<strong>root</strong> คือผู้ดูแลสูงสุด (UID 0) นิยมทำงานผ่านบัญชีทั่วไปแล้วเติม <code>sudo</code> เพื่อความปลอดภัย',
      '<strong>สิทธิ์ไฟล์แบ่ง 3 กลุ่ม</strong>: <strong>Owner (u)</strong> เจ้าของ | <strong>Group (g)</strong> กลุ่มเจ้าของ | <strong>Others (o)</strong> ผู้อื่น',
      '<strong>ค่าตัวเลข Octal</strong>: <strong>r (Read) = 4</strong>, <strong>w (Write) = 2</strong>, <strong>x (Execute) = 1</strong>',
      '<strong>ค่ามาตรฐานยอดนิยม</strong>: <code>755</code> (rwxr-xr-x โฟลเดอร์เว็บ/สคริปต์), <code>644</code> (rw-r--r-- ไฟล์ทั่วไป), <code>600</code> (rw------- ไฟล์กุญแจ SSH ส่วนตัว)'
    ],
    table: {
      headers: ['ตัวเลข', 'สัญลักษณ์', 'ความหมาย'],
      rows: [
        ['7 (4+2+1)', 'rwx', 'อ่าน + เขียน + รันได้ทั้งหมด'],
        ['6 (4+2+0)', 'rw-', 'อ่าน + เขียน (รันไม่ได้)'],
        ['5 (4+0+1)', 'r-x', 'อ่าน + รัน/เข้าโฟลเดอร์ (ห้ามแก้)'],
        ['4 (4+0+0)', 'r--', 'อ่านได้อย่างเดียว (Read Only)'],
        ['0 (0+0+0)', '---', 'ไม่มีสิทธิ์ใด ๆ']
      ]
    },
    commands: `sudo adduser somchai              # สร้างผู้ใช้ใหม่
sudo addgroup itdept              # สร้างกลุ่มใหม่
sudo usermod -aG itdept somchai   # เพิ่มผู้ใช้เข้ากลุ่ม itdept
sudo chmod 755 /var/www/html      # ตั้งสิทธิ์ rwxr-xr-x
sudo chown www-data:www-data index.html`,
    examTip: 'สูตรจำ chmod: r=4, w=2, x=1 บวกทีละกลุ่ม (Owner / Group / Others) เช่น 750 = rwxr-x---',
    quiz: {
      q: 'คำสั่ง chmod 750 report.sh กำหนดสิทธิ์ให้กลุ่ม (Group) อย่างไร?',
      options: ['rwx (อ่าน เขียน รัน)', 'r-x (อ่านและรัน แต่แก้ไม่ได้)', '--- (ไม่มีสิทธิ์)'],
      answer: 1
    }
  },
  {
    id: 6,
    code: 'สัปดาห์ที่ 6',
    title: 'การจัดการดิสก์ ไฟล์ระบบ และ RAID Storage',
    eng: 'Disk Management, Mounting & RAID (0, 1, 5, 10)',
    location: 'โซน 2 (NE) โกดังดิสก์ RAID • ช่างดิสก์',
    summary: 'การเพิ่มฮาร์ดดิสก์ให้เครื่องแม่ข่าย การฟอร์แมต การเมานต์ดิสก์อัตโนมัติ (fstab) และหลักการทำ RAID เพื่อเพิ่มความเร็วและป้องกันข้อมูลสูญหาย',
    bullets: [
      '<strong>การตรวจสอบดิสก์บน Linux</strong>: <code>lsblk</code> (ดูโครงสร้างดิสก์และพาร์ติชัน), <code>df -h</code> (ดูพื้นที่ว่าง), <code>du -sh</code> (ดูขนาดโฟลเดอร์)',
      '<strong>Filesystem ยอดนิยม</strong>: <strong>ext4 / XFS</strong> (Linux Server) และ <strong>NTFS / ReFS</strong> (Windows Server)',
      '<strong>การ Mount ดิสก์</strong> คือการนำพาร์ติชันมาผูกกับโฟลเดอร์ เช่น <code>sudo mount /dev/sdb1 /mnt/data</code> และบันทึกถาวรในไฟล์ <code>/etc/fstab</code>',
      '<strong>RAID (Redundant Array of Independent Disks)</strong>: <strong>RAID 0</strong> (Striping — เร็วสุด แต่พัง 1 ลูกข้อมูลหายหมด), <strong>RAID 1</strong> (Mirroring — สำเนาเหมือนกัน 2 ลูก ทนพังได้ 1 ลูก), <strong>RAID 5</strong> (อย่างน้อย 3 ลูก มี Parity ทนพังได้ 1 ลูก คุ้มค่าพื้นที่)'
    ],
    table: {
      headers: ['ระดับ RAID', 'จำนวนดิสก์ขั้นต่ำ', 'ความทนทานต่อดิสก์เสีย', 'จุดเด่นหลัก'],
      rows: [
        ['RAID 0 (Striping)', '2 ลูก', '0 ลูก (เสีย 1 ลูกข้อมูลหายหมด!)', 'ความเร็วอ่าน-เขียนสูงสุด ได้พื้นที่ 100%'],
        ['RAID 1 (Mirroring)', '2 ลูก', 'ทนเสียได้ 1 ลูก', 'ปลอดภัยสูง เขียนซ้ำเหมือนกัน (ได้พื้นที่ 50%)'],
        ['RAID 5 (Parity)', '3 ลูก', 'ทนเสียได้ 1 ลูก', 'สมดุลทั้งความเร็ว ความปลอดภัย และพื้นที่คุ้มค่า'],
        ['RAID 10 (1+0)', '4 ลูก', 'ทนเสียได้คู่ละ 1 ลูก', 'เร็วมากและปลอดภัยมาก เหมาะกับ Database Server']
      ]
    },
    commands: `lsblk                           # แสดงรายการฮาร์ดดิสก์และพาร์ติชันทั้งหมด
df -h                           # ตรวจสอบพื้นที่ใช้งานดิสก์เป็นหน่วย GB
sudo mkfs.ext4 /dev/sdb1        # ฟอร์แมตพาร์ติชันเป็นระบบไฟล์ ext4
sudo mount /dev/sdb1 /mnt/data  # เมานต์ดิสก์เข้ากับโฟลเดอร์ /mnt/data
cat /etc/fstab                  # ดูรายการ Mount อัตโนมัติตอนเปิดเครื่อง`,
    examTip: 'จำ RAID 3 แบบที่ออกสอบบ่อย: RAID 0 = เร็วแต่ไม่ปลอดภัย, RAID 1 = Mirror สำเนา 2 ลูก (พื้นที่เหลือครึ่ง), RAID 5 = ใช้ขั้นต่ำ 3 ลูก มี Parity ทนพังได้ 1 ลูก!',
    quiz: {
      q: 'RAID ระดับใดที่ใช้ฮาร์ดดิสก์อย่างน้อย 3 ลูก มีระบบ Parity และทนต่อการเสียของดิสก์ได้ 1 ลูกโดยข้อมูลไม่สูญหาย?',
      options: ['RAID 0', 'RAID 5', 'Single Disk'],
      answer: 1
    }
  },
  {
    id: 7,
    code: 'สัปดาห์ที่ 7',
    title: 'การบริหารจัดการเครื่องแม่ข่ายจากระยะไกล (Remote Administration)',
    eng: 'SSH, RDP, Webmin & SCP',
    location: 'โซน 2 (NE) หอสื่อสาร SSH • พี่นนท์',
    summary: 'การควบคุมเครื่องแม่ข่ายระยะไกลอย่างปลอดภัยผ่าน SSH, RDP และเว็บอินเทอร์เฟซโดยไม่ต้องเดินเข้าห้อง Server Room',
    bullets: [
      '<strong>SSH (Secure Shell) — TCP พอร์ต 22</strong>: มาตรฐานควบคุม Linux ระยะไกลแบบเข้ารหัส ปลอดภัยกว่า <strong>Telnet (พอร์ต 23)</strong> ที่ไม่เข้ารหัส',
      '<strong>RDP (Remote Desktop Protocol) — TCP พอร์ต 3389</strong>: รีโมตหน้าจอ GUI ของ Windows Server',
      '<strong>Webmin (พอร์ต 10000) / Cockpit (พอร์ต 9090)</strong>: จัดการ Linux Server ผ่านเว็บเบราว์เซอร์',
      '<strong>SSH Key Authentication</strong> ใช้คู่กุญแจ Public/Private Key ป้องกันการเดารหัสผ่าน (Brute-Force)'
    ],
    table: {
      headers: ['โปรโตคอล', 'พอร์ต', 'ระบบที่รองรับ', 'ความปลอดภัย'],
      rows: [
        ['SSH / SCP', 'TCP 22', 'Linux / Windows CLI', 'สูง (เข้ารหัส)'],
        ['Telnet', 'TCP 23', 'CLI เก่า', 'ต่ำมาก (ห้ามใช้!)'],
        ['RDP', 'TCP 3389', 'Windows Server GUI', 'ปานกลาง–สูง'],
        ['Webmin', 'TCP 10000', 'Web UI', 'สูงเมื่อเปิด HTTPS']
      ]
    },
    commands: `sudo apt install openssh-server -y
sudo systemctl enable --now ssh
ssh admin@192.168.1.10
scp backup.tar.gz admin@192.168.1.10:/home/admin/`,
    examTip: 'SSH = พอร์ต 22 (เข้ารหัส ปลอดภัย), Telnet = พอร์ต 23 (ส่งรหัสผ่านเป็นข้อความธรรมดา ห้ามเปิดใช้งาน), RDP = พอร์ต 3389',
    quiz: {
      q: 'โปรโตคอลใดใช้ควบคุม Linux Server ระยะไกลผ่าน CLI แบบเข้ารหัสข้อมูล และใช้พอร์ตใด?',
      options: ['Telnet พอร์ต 23', 'SSH พอร์ต 22', 'FTP พอร์ต 21'],
      answer: 1
    }
  },
  {
    id: 8,
    code: 'สัปดาห์ที่ 8',
    title: 'การติดตั้งและบริหารจัดการ DHCP Server (DORA)',
    eng: 'Dynamic Host Configuration Protocol',
    location: 'โซน 2 (NE) ศูนย์จ่าย IP • เจ๊มีน',
    summary: 'บริการแจกจ่าย IP Address, Subnet Mask, Gateway และ DNS อัตโนมัติแก่เครื่องลูกข่ายทั้งเครือข่าย',
    bullets: [
      '<strong>DHCP</strong> ทำงานบนพอร์ต <strong>UDP 67 (Server)</strong> และ <strong>UDP 68 (Client)</strong>',
      '<strong>กระบวนการ D-O-R-A</strong>: 1) <strong>Discover</strong> → 2) <strong>Offer</strong> → 3) <strong>Request</strong> → 4) <strong>Acknowledge (ACK)</strong>',
      '<strong>IP Pool (Range)</strong> เช่น <code>192.168.1.100 – 192.168.1.200</code> โดยเว้นช่วงต้นไว้ให้ Server / Router ที่ใช้ Static IP',
      '<strong>Lease Time</strong> คือระยะเวลาเช่าใช้ IP เมื่อใกล้หมดเวลาเครื่องลูกข่ายจะขอต่ออายุ (Renew)'
    ],
    table: {
      headers: ['ขั้นตอน DORA', 'ทิศทาง', 'ความหมายจำง่าย'],
      rows: [
        ['1. Discover', 'Client → Broadcast', 'ลูกข่ายตะโกนหา DHCP Server ขอ IP'],
        ['2. Offer', 'Server → Client', 'เซิร์ฟเวอร์เสนอ IP ว่างให้'],
        ['3. Request', 'Client → Server', 'ลูกข่ายตอบตกลงขอจอง IP นั้น'],
        ['4. Acknowledge', 'Server → Client', 'เซิร์ฟเวอร์อนุมัติพร้อม Gateway & DNS']
      ]
    },
    commands: `sudo apt install isc-dhcp-server -y
# ไฟล์ตั้งค่า: /etc/dhcp/dhcpd.conf
subnet 192.168.1.0 netmask 255.255.255.0 {
  range 192.168.1.100 192.168.1.200;
  option routers 192.168.1.1;
  option domain-name-servers 192.168.1.10, 8.8.8.8;
}
sudo systemctl restart isc-dhcp-server`,
    examTip: 'ท่องจำ D-O-R-A (Discover → Offer → Request → Acknowledge) และพอร์ต DHCP คือ UDP 67/68',
    quiz: {
      q: 'ลำดับการทำงานของโปรโตคอล DHCP ข้อใดถูกต้อง?',
      options: [
        'Discover → Offer → Request → Acknowledge',
        'Offer → Discover → Request → Acknowledge',
        'Request → Offer → Discover → Acknowledge'
      ],
      answer: 0
    }
  },
  {
    id: 9,
    code: 'สัปดาห์ที่ 9',
    title: 'การติดตั้งและบริหารจัดการ DNS Server (BIND9)',
    eng: 'Domain Name System & DNS Records',
    location: 'โซน 2 (NE) หอคอย DNS • ปู่โดเมน',
    summary: 'สมุดโทรศัพท์แห่งเครือข่ายที่แปลงชื่อโดเมนที่มนุษย์จำง่ายให้เป็นหมายเลข IP Address',
    bullets: [
      '<strong>DNS</strong> ทำงานบนพอร์ต <strong>53 (UDP/TCP)</strong> ซอฟต์แวร์หลักฝั่ง Linux คือ <strong>BIND9</strong>',
      '<strong>Forward Lookup Zone</strong> แปลง ชื่อโดเมน → IP | <strong>Reverse Lookup Zone</strong> แปลง IP → ชื่อโดเมน',
      '<strong>DNS Records สำคัญ</strong>: <strong>A</strong> (โดเมน → IPv4), <strong>AAAA</strong> (IPv6), <strong>CNAME</strong> (ชื่อนามแฝง เช่น www), <strong>MX</strong> (Mail Server), <strong>PTR</strong> (Reverse)'
    ],
    table: {
      headers: ['Record', 'หน้าที่', 'ตัวอย่าง'],
      rows: [
        ['A', 'แปลงชื่อโดเมนเป็น IPv4', 'valley.local → 192.168.1.10'],
        ['CNAME', 'ชื่อนามแฝง (Alias)', 'www.valley.local → valley.local'],
        ['MX', 'เซิร์ฟเวอร์รับส่งอีเมล', 'mail.valley.local (Priority 10)'],
        ['PTR', 'แปลง IP กลับเป็นโดเมน', '192.168.1.10 → valley.local']
      ]
    },
    commands: `sudo apt install bind9 bind9utils -y
sudo named-checkconf
sudo named-checkzone valley.local /etc/bind/db.valley.local
nslookup www.valley.local 192.168.1.10`,
    examTip: 'พอร์ต DNS = 53, IPv4 ใช้ A Record, ชื่อเล่น www ใช้ CNAME, อีเมลใช้ MX, ทดสอบด้วย nslookup หรือ dig',
    quiz: {
      q: 'DNS Record ชนิดใดใช้จับคู่ชื่อโดเมนกับหมายเลข IPv4?',
      options: ['MX Record', 'A Record', 'PTR Record'],
      answer: 1
    }
  },
  {
    id: 10,
    code: 'สัปดาห์ที่ 10',
    title: 'การจัดการเซอร์วิส โปรเซส และตารางงานอัตโนมัติ (Systemd & Cron)',
    eng: 'Service Management (systemctl), Processes & Cron Jobs',
    location: 'โซน 2 (NE) หอนาฬิกา Systemd • พี่ครอน',
    summary: 'การควบคุมเซอร์วิสเบื้องหลังด้วย systemd การตรวจสอบโปรเซสกิน CPU/RAM และการตั้งเวลาทำงานอัตโนมัติด้วย Crontab',
    bullets: [
      '<strong>systemd (<code>systemctl</code>)</strong> คือตัวจัดการเซอร์วิสหลักของ Linux: <code>start</code> (เริ่ม), <code>stop</code> (หยุด), <code>restart</code> (เริ่มใหม่), <code>enable</code> (เปิดอัตโนมัติตอนบูต), <code>status</code> (เช็กสถานะ)',
      '<strong>การตรวจสอบโปรเซส</strong>: <code>ps aux</code> (ดูรายการโปรเซส), <code>top</code> / <code>htop</code> (ดู CPU/RAM แบบเรียลไทม์), <code>kill -9 PID</code> (สั่งปิดโปรเซสที่ค้าง)',
      '<strong>Cron Job (<code>crontab -e</code>)</strong> ใช้ตั้งเวลารันสคริปต์อัตโนมัติ เช่น สำรองข้อมูลทุกวันเวลา 02:00 น.',
      '<strong>รูปแบบ 5 ช่องของ Cron</strong>: <code>นาที(0-59)  ชั่วโมง(0-23)  วันของเดือน(1-31)  เดือน(1-12)  วันในสัปดาห์(0-6)</code> เช่น <code>0 2 * * *</code> = ทุกวันเวลา 02:00 น.'
    ],
    table: {
      headers: ['รูปแบบ Cron', 'ความหมายเวลาทำงาน'],
      rows: [
        ['0 2 * * *', 'ทำงานทุกวัน เวลา 02:00 น. (นิยมตั้งเวลา Backup)'],
        ['*/15 * * * *', 'ทำงานทุก ๆ 15 นาที'],
        ['30 8 * * 1', 'ทำงานทุกวันจันทร์ เวลา 08:30 น.'],
        ['0 0 1 * *', 'ทำงานวันที่ 1 ของทุกเดือน เวลาเที่ยงคืน']
      ]
    },
    commands: `sudo systemctl status apache2     # ตรวจสอบสถานะเซอร์วิส
sudo systemctl enable --now ssh   # เปิดใช้ทันทีและให้เริ่มอัตโนมัติตอนบูต
ps aux | grep nginx               # ค้นหาโปรเซสที่ทำงานอยู่
htop                              # ดูกราฟ CPU/RAM แบบเรียลไทม์
crontab -e                        # แก้ไขตารางงานอัตโนมัติ
# ตัวอย่างใน crontab:
0 2 * * * /usr/local/bin/backup.sh`,
    examTip: 'จำความต่าง systemctl start vs enable: start คือเปิดทำงาน "เดี๋ยวนี้" ส่วน enable คือสั่งให้เปิดอัตโนมัติ "ทุกครั้งที่รีบูตเครื่อง" และลำดับ Cron คือ นาที → ชั่วโมง → วันที่ → เดือน → วันในสัปดาห์!',
    quiz: {
      q: 'คำสั่ง Cron "0 2 * * *" หมายถึงให้รันสคริปต์ในเวลาใด?',
      options: ['ทุกวัน เวลา 02:00 น.', 'ทุก ๆ 2 นาที', 'วันที่ 2 ของทุกเดือน เวลาเที่ยงคืน'],
      answer: 0
    }
  },
  {
    id: 11,
    code: 'สัปดาห์ที่ 11',
    title: 'การติดตั้ง Web Server และ Database Server (LAMP Stack)',
    eng: 'Apache / Nginx, MariaDB / MySQL & PHP',
    location: 'โซน 3 (SW) ตลาดเว็บ & DB • แม่ค้ามายด์',
    summary: 'การสร้างเครื่องแม่ข่ายให้บริการเว็บไซต์และระบบฐานข้อมูลด้วยชุดซอฟต์แวร์ LAMP Stack เพื่อรองรับเว็บแอปพลิเคชัน',
    bullets: [
      '<strong>LAMP Stack</strong> = <strong>L</strong>inux + <strong>A</strong>pache + <strong>M</strong>ySQL/MariaDB + <strong>P</strong>HP',
      '<strong>HTTP พอร์ต 80</strong> (ไม่เข้ารหัส) และ <strong>HTTPS พอร์ต 443</strong> (เข้ารหัส SSL/TLS มีแม่กุญแจ)',
      '<strong>Document Root</strong> ของ Apache บน Ubuntu คือ <code>/var/www/html/</code>',
      '<strong>MariaDB / MySQL</strong> ทำงานบนพอร์ต <strong>3306</strong> จัดการผ่าน CLI หรือ <strong>phpMyAdmin</strong>'
    ],
    table: {
      headers: ['บริการ', 'พอร์ตมาตรฐาน', 'เซอร์วิสบน Ubuntu'],
      rows: [
        ['Web (HTTP)', 'TCP 80', 'apache2 / nginx'],
        ['Web (HTTPS)', 'TCP 443', 'apache2 / nginx + SSL'],
        ['Database', 'TCP 3306', 'mariadb / mysql']
      ]
    },
    commands: `sudo apt install apache2 mariadb-server php libapache2-mod-php php-mysql -y
sudo systemctl enable --now apache2 mariadb
sudo mysql_secure_installation
curl -I http://localhost`,
    examTip: 'HTTP = 80, HTTPS = 443, MariaDB/MySQL = 3306, และโฟลเดอร์เว็บ Apache คือ /var/www/html',
    quiz: {
      q: 'อักษรตัว M ใน LAMP Stack หมายถึงบริการใด และใช้พอร์ตมาตรฐานใด?',
      options: ['MySQL/MariaDB พอร์ต 3306', 'Mail Server พอร์ต 25', 'Monitor พอร์ต 8080'],
      answer: 0
    }
  },
  {
    id: 12,
    code: 'สัปดาห์ที่ 12',
    title: 'การให้บริการแชร์ไฟล์และทรัพยากร (Samba & FTP)',
    eng: 'File & Resource Sharing (SMB/CIFS, FTP, SFTP)',
    location: 'โซน 3 (SW) โกดังแชร์ไฟล์ • ลุงแซม',
    summary: 'การแบ่งปันไฟล์เอกสารและทรัพยากรร่วมกันข้ามระบบปฏิบัติการระหว่าง Linux Server และเครื่องลูกข่าย Windows',
    bullets: [
      '<strong>Samba (SMB/CIFS) — พอร์ต 445</strong>: ทำให้ Linux แชร์โฟลเดอร์ให้เครื่อง Windows เปิดผ่าน <code>\\\\192.168.1.10\\SharedDocs</code>',
      '<strong>FTP (vsftpd) — พอร์ต 21/20</strong>: รับส่งไฟล์ผ่านโปรแกรมเช่น FileZilla (ไม่เข้ารหัส) หากต้องการเข้ารหัสให้ใช้ <strong>SFTP พอร์ต 22</strong>',
      'ตั้งค่าใน <code>/etc/samba/smb.conf</code> และสร้างรหัสผ่านผู้ใช้ Samba ด้วย <code>sudo smbpasswd -a username</code>'
    ],
    table: {
      headers: ['บริการ', 'พอร์ต', 'จุดเด่น'],
      rows: [
        ['Samba (SMB)', 'TCP 445', 'แชร์โฟลเดอร์ให้ Windows ใน LAN โดยตรง'],
        ['FTP', 'TCP 21/20', 'รับส่งไฟล์ผ่าน Client เช่น FileZilla (ไม่เข้ารหัส)'],
        ['SFTP', 'TCP 22', 'รับส่งไฟล์แบบเข้ารหัสผ่าน SSH ปลอดภัยสูง']
      ]
    },
    commands: `sudo apt install samba -y
sudo mkdir -p /srv/samba/public
sudo smbpasswd -a student
# แก้ไข /etc/samba/smb.conf -> read only = no
sudo systemctl restart smbd`,
    examTip: 'Samba = พอร์ต 445 (เชื่อม Linux ↔ Windows), FTP = 21, SFTP = 22 (เข้ารหัสปลอดภัยกว่า FTP)',
    quiz: {
      q: 'หากต้องการแชร์โฟลเดอร์จาก Ubuntu Server ให้เครื่อง Windows เปิดผ่าน File Explorer ได้ ควรใช้บริการใด?',
      options: ['Samba (พอร์ต 445)', 'BIND9 (พอร์ต 53)', 'ISC-DHCP (พอร์ต 67)'],
      answer: 0
    }
  },
  {
    id: 13,
    code: 'สัปดาห์ที่ 13',
    title: 'บริการ Proxy Server และ Mail Server เบื้องต้น',
    eng: 'Squid Proxy (Port 3128) & Mail Protocols (SMTP/IMAP/POP3)',
    location: 'โซน 3 (SW) สถานี Proxy & Mail • พี่เมล์',
    summary: 'การใช้ Proxy Server ควบคุมและเร่งความเร็วอินเทอร์เน็ตในองค์กร รวมถึงหลักการรับส่งอีเมลด้วย SMTP, IMAP และ POP3',
    bullets: [
      '<strong>Proxy Server (เช่น Squid — พอร์ต 3128)</strong> ทำหน้าที่เป็นตัวกลางระหว่างเครื่องลูกข่ายกับอินเทอร์เน็ต ช่วยเก็บ <strong>Cache</strong> (ลดการใช้แบนด์วิดท์), <strong>กรองเว็บไซต์ที่ไม่เหมาะสม (ACL)</strong> และบันทึกประวัติการใช้งาน (พ.ร.บ.คอมพิวเตอร์)',
      '<strong>SMTP (Simple Mail Transfer Protocol — พอร์ต 25 / 587)</strong> ใช้สำหรับ <strong>ส่งอีเมล (Send)</strong> เช่น ซอฟต์แวร์ Postfix',
      '<strong>IMAP (พอร์ต 143 / 993 SSL)</strong> ใช้ <strong>รับอีเมล</strong> โดยซิงก์เก็บไว้บนเซิร์ฟเวอร์ เปิดดูจากหลายเครื่อง (มือถือ+คอม) ได้ตรงกัน',
      '<strong>POP3 (พอร์ต 110 / 995 SSL)</strong> ใช้ <strong>รับอีเมล</strong> โดยดาวน์โหลดมาเก็บที่เครื่องลูกข่าย (มักลบบนเซิร์ฟเวอร์)'
    ],
    table: {
      headers: ['โปรโตคอล / บริการ', 'พอร์ตมาตรฐาน', 'หน้าที่หลัก'],
      rows: [
        ['Squid Proxy Server', 'TCP 3128', 'ตัวกลางออกเน็ต เก็บ Cache และกรองเว็บ (ACL)'],
        ['SMTP (Postfix)', 'TCP 25 / 587', 'ส่งอีเมลออกจากเครื่องและระหว่าง Mail Server'],
        ['IMAP (Dovecot)', 'TCP 143 / 993', 'รับอีเมลแบบซิงก์หลายอุปกรณ์ เก็บเมลบน Server'],
        ['POP3 (Dovecot)', 'TCP 110 / 995', 'รับอีเมลโดยดาวน์โหลดลงเครื่องลูกข่าย']
      ]
    },
    commands: `# ติดตั้ง Squid Proxy Server บน Ubuntu
sudo apt install squid -y
# ตัวอย่างกฎ ACL ใน /etc/squid/squid.conf
acl localnet src 192.168.1.0/24
acl blocked_sites dstdomain .gambling.example
http_access deny blocked_sites
http_access allow localnet
sudo systemctl restart squid`,
    examTip: 'จำให้แม่น! Squid Proxy = พอร์ต 3128, SMTP (ส่งเมล) = 25/587, POP3 (โหลดลงเครื่อง) = 110, IMAP (ซิงก์บนเซิร์ฟเวอร์) = 143!',
    quiz: {
      q: 'โปรโตคอลใดทำหน้าที่ "ส่งอีเมล" และซอฟต์แวร์ Squid Proxy ใช้พอร์ตมาตรฐานหมายเลขใด?',
      options: ['SMTP (25) และ Squid (3128)', 'POP3 (110) และ Squid (53)', 'IMAP (143) และ Squid (445)'],
      answer: 0
    }
  },
  {
    id: 14,
    code: 'สัปดาห์ที่ 14',
    title: 'การบริหารจัดการ Windows Server (Active Directory, IIS & PowerShell)',
    eng: 'Windows Server — AD DS, Domain Controller, IIS & PowerShell',
    location: 'โซน 3 (SW) ศาลา Windows Server • ครูวิน',
    summary: 'การบริหารจัดการเครื่องแม่ข่ายฝั่ง Windows Server 2019/2022 ด้วย Active Directory (AD DS), OU/GPO, IIS Web Server และ PowerShell',
    bullets: [
      '<strong>Active Directory Domain Services (AD DS)</strong> เปลี่ยนเครื่องเป็น <strong>Domain Controller (DC)</strong> คุมบัญชีผู้ใช้ คอมพิวเตอร์ และนโยบาย <strong>GPO</strong> ทั้งองค์กร',
      '<strong>Organizational Unit (OU)</strong> จัดกลุ่มผู้ใช้ เช่น <code>Students_PVC</code> เพื่อใช้นโยบาย GPO แยกกัน',
      'ก่อน <strong>Join Domain</strong> เครื่องลูกข่าย Windows ต้องตั้ง Preferred DNS ชี้ไปที่ IP ของ Domain Controller เสมอ',
      '<strong>IIS Web Server</strong> เก็บไฟล์เว็บที่ <code>C:\\inetpub\\wwwroot</code> | <strong>PowerShell</strong> ใช้รูปแบบ <code>Verb-Noun</code> เช่น <code>Get-NetIPAddress</code>, <code>New-ADUser</code>'
    ],
    table: {
      headers: ['งานบริหาร', 'Linux (Ubuntu Server)', 'Windows Server'],
      rows: [
        ['จัดการบัญชีศูนย์กลาง', 'OpenLDAP / FreeIPA', 'Active Directory (AD DS)'],
        ['Web Server', 'Apache2 (/var/www/html)', 'IIS (C:\\inetpub\\wwwroot)'],
        ['รีโมตระยะไกล', 'SSH (TCP 22)', 'RDP (TCP 3389)'],
        ['ติดตั้งบริการ', 'sudo apt install', 'Install-WindowsFeature']
      ]
    },
    commands: `Get-NetIPAddress -AddressFamily IPv4
Install-WindowsFeature AD-Domain-Services
Install-WindowsFeature Web-Server
New-ADUser -Name "Somchai" -Enabled $true
gpupdate /force`,
    examTip: 'ก่อน Join Domain ต้องชี้ DNS เครื่องลูกข่ายไปที่ IP ของ Domain Controller เสมอ! และโฟลเดอร์เว็บ IIS คือ C:\\inetpub\\wwwroot',
    quiz: {
      q: 'โฟลเดอร์เริ่มต้นสำหรับเก็บไฟล์เว็บไซต์ของ IIS บน Windows Server คือข้อใด?',
      options: ['/var/www/html', 'C:\\inetpub\\wwwroot', 'C:\\Windows\\System32'],
      answer: 1
    }
  },
  {
    id: 15,
    code: 'สัปดาห์ที่ 15',
    title: 'ความปลอดภัยเครื่องแม่ข่ายและไฟร์วอลล์ (Server Security & UFW)',
    eng: 'UFW Firewall, Port Filtering & Hardening',
    location: 'โซน 4 (SE) ป้อมไฟร์วอลล์ • หัวหน้ายามเค',
    summary: 'การป้องกันเครื่องแม่ข่ายจากการบุกรุกด้วยนโยบาย Default Deny การปิดพอร์ตอันตราย และการเสริมแกร่งระบบ (Hardening)',
    bullets: [
      '<strong>Default Deny Incoming</strong>: ปิดการเชื่อมต่อขาเข้าทั้งหมดเป็นค่าเริ่มต้น แล้วเปิด (Allow) เฉพาะพอร์ตที่ใช้งานจริง',
      '<strong>UFW (Uncomplicated Firewall)</strong> บน Ubuntu ต้องสั่ง <code>sudo ufw allow 22/tcp</code> ก่อน <code>sudo ufw enable</code> เสมอเพื่อไม่ให้ตัด SSH ตัวเอง',
      '<strong>Hardening</strong>: ปิดพอร์ต Telnet (23), ปิดพอร์ตฐานข้อมูล (3306) จากภายนอก, ตั้ง <code>PermitRootLogin no</code> และอัปเดตแพตช์สม่ำเสมอ'
    ],
    table: {
      headers: ['พอร์ต', 'บริการ', 'นโยบายแนะนำ'],
      rows: [
        ['22 (SSH)', 'รีโมตแอดมิน', 'ALLOW (จำกัดวง LAN ยิ่งดี)'],
        ['80 / 443', 'Web HTTP/HTTPS', 'ALLOW'],
        ['53', 'DNS', 'ALLOW'],
        ['23 (Telnet)', 'รีโมตไม่เข้ารหัส', 'DENY ทันที!'],
        ['3306 (MySQL)', 'ฐานข้อมูลจากภายนอก', 'DENY จากภายนอก']
      ]
    },
    commands: `sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 23/tcp
sudo ufw enable && sudo ufw status verbose`,
    examTip: 'กฎเหล็กแอดมิน: สั่ง sudo ufw allow 22/tcp ก่อน sudo ufw enable เสมอ!',
    quiz: {
      q: 'ก่อนเปิดใช้งาน UFW Firewall ขณะรีโมตผ่าน SSH ควรทำสิ่งใดเป็นอันดับแรก?',
      options: [
        'สั่ง sudo ufw deny 22',
        'สั่ง sudo ufw allow 22/tcp เพื่อไม่ให้ SSH ของตัวเองหลุด',
        'ลบไฟล์ใน /etc'
      ],
      answer: 1
    }
  },
  {
    id: 16,
    code: 'สัปดาห์ที่ 16',
    title: 'การสำรองและกู้คืนข้อมูลเครื่องแม่ข่าย (Backup & Recovery)',
    eng: '3-2-1 Backup Rule, Full/Incremental/Differential, tar & rsync',
    location: 'โซน 4 (SE) ธนาคารสำรองข้อมูล • พี่แบ็ค',
    summary: 'การวางแผนสำรองข้อมูลป้องกันฮาร์ดดิสก์พัง ไฟไหม้ หรือมัลแวร์เรียกค่าไถ่ (Ransomware) ด้วยกฎ 3-2-1 และเครื่องมือ tar, rsync, mysqldump',
    bullets: [
      '<strong>กฎสำรองข้อมูล 3-2-1</strong>: มีข้อมูลอย่างน้อย <strong>3 ชุด</strong> (ต้นฉบับ 1 + สำรอง 2), เก็บไว้บนสื่ออย่างน้อย <strong>2 ชนิด</strong> (เช่น RAID + External/NAS), และแยกเก็บนอกสถานที่อย่างน้อย <strong>1 ชุด</strong> (Offsite / Cloud)',
      '<strong>Full Backup</strong>: สำรองข้อมูลทั้งหมด กู้คืนง่ายสุดแต่ใช้เวลาและพื้นที่มากที่สุด',
      '<strong>Incremental Backup</strong>: สำรองเฉพาะไฟล์ที่เปลี่ยนจาก Backup ครั้งล่าสุด (เร็วและประหยัดพื้นที่ที่สุด แต่ตอนกู้คืนต้องไล่คืนทีละชุด)',
      '<strong>Differential Backup</strong>: สำรองไฟล์ที่เปลี่ยนนับจาก Full Backup ครั้งล่าสุด (กู้คืนเร็วกว่า Incremental เพราะใช้แค่ Full + Diff ล่าสุด)',
      '<strong>เครื่องมือสำคัญ</strong>: <code>tar -czvf</code> (บีบอัดไฟล์), <code>rsync -avz</code> (ซิงก์ไฟล์ข้ามเครื่อง), <code>mysqldump</code> (สำรองฐานข้อมูล), และ <strong>VM Snapshot</strong>'
    ],
    table: {
      headers: ['ประเภท Backup', 'ความเร็วตอนสำรอง', 'ความเร็วตอนกู้คืน', 'พื้นที่ที่ใช้'],
      rows: [
        ['Full Backup', 'ช้าที่สุด', 'เร็วที่สุด (ใช้ชุดเดียว)', 'มากที่สุด'],
        ['Incremental Backup', 'เร็วที่สุด', 'ช้าสุด (ต้องกู้ Full + ทุกชุดย่อย)', 'น้อยที่สุด'],
        ['Differential Backup', 'ปานกลาง', 'เร็ว (ใช้ Full + Diff ล่าสุด)', 'ปานกลาง']
      ]
    },
    commands: `# บีบอัดโฟลเดอร์เว็บเป็นไฟล์ .tar.gz
sudo tar -czvf backup-web.tar.gz /var/www/html

# ซิงก์ข้อมูลไปยังเครื่องสำรองอย่างมีประสิทธิภาพด้วย rsync
rsync -avz /var/www/html/ admin@192.168.1.50:/backup/web/

# สำรองฐานข้อมูล MariaDB / MySQL
mysqldump -u root -p college_db > college_db.sql`,
    examTip: 'กฎ 3-2-1 ออกสอบบ่อยมาก: 3 สำเนา, 2 สื่อจัดเก็บ, 1 นอกสถานที่ (Offsite) ช่วยรอดจาก Ransomware และไฟไหม้ห้อง Server!',
    quiz: {
      q: 'เลข "1" ในกฎการสำรองข้อมูล 3-2-1 (3-2-1 Backup Rule) หมายถึงข้อใด?',
      options: [
        'สำรองข้อมูลแค่ปีละ 1 ครั้ง',
        'เก็บข้อมูลสำรองไว้นอกสถานที่ (Offsite / Cloud) อย่างน้อย 1 ชุด',
        'เก็บไฟล์ทั้งหมดไว้ในฮาร์ดดิสก์ลูกเดียว'
      ],
      answer: 1
    }
  },
  {
    id: 17,
    code: 'สัปดาห์ที่ 17',
    title: 'การเฝ้าระวังระบบ ตรวจสอบ Log และแก้ไขปัญหา (Monitoring & Troubleshooting)',
    eng: 'System Logs (/var/log), journalctl & Network Diagnostics',
    location: 'โซน 4 (SE) หอสังเกตการณ์ Log • หมอเซิร์ฟ',
    summary: 'ศิลปะของแอดมินในการอ่านไฟล์ Log วินิจฉัยสาเหตุเมื่อเซิร์ฟเวอร์ล่ม เว็บเข้าไม่ได้ หรือมีการพยายามเจาะระบบ',
    bullets: [
      '<strong>ไฟล์ Log สำคัญใน <code>/var/log/</code></strong>: <code>/var/log/auth.log</code> (บันทึกการล็อกอิน SSH/sudo — ใช้ตรวจการแฮ็ก Brute-Force), <code>/var/log/syslog</code> (เหตุการณ์ระบบทั่วไป), <code>/var/log/apache2/error.log</code> (ข้อผิดพลาดเว็บไซต์)',
      '<strong><code>journalctl -u apache2</code></strong> ใช้ดู Log ของเซอร์วิส systemd แบบละเอียด และ <code>tail -f</code> ใช้ติดตาม Log แบบเรียลไทม์',
      '<strong>ลำดับการแก้ปัญหาเครือข่าย (Troubleshooting)</strong>: 1) เช็กสาย/IP (<code>ip addr</code>) → 2) เช็กเชื่อมต่อ Gateway (<code>ping</code>) → 3) เช็ก DNS (<code>nslookup</code>) → 4) เช็กพอร์ตและเซอร์วิส (<code>ss -tulnp</code> / <code>systemctl status</code>) → 5) เช็ก Firewall (<code>ufw status</code>)',
      'ฝั่ง Windows Server ใช้เครื่องมือ <strong>Event Viewer</strong> และ <strong>Performance Monitor</strong> ในการตรวจสอบข้อผิดพลาด'
    ],
    table: {
      headers: ['อาการเสียที่พบบ่อย', 'คำสั่ง / Log ที่ควรตรวจก่อน', 'สาเหตุยอดฮิต'],
      rows: [
        ['เข้าเว็บด้วยชื่อโดเมนไม่ได้ แต่เข้าด้วย IP ได้', 'nslookup valley.local', 'DNS Server มีปัญหา หรือยังไม่ได้ชี้ DNS'],
        ['มีคนพยายามเดารหัสผ่าน SSH รัว ๆ', 'tail -n 30 /var/log/auth.log', 'โดน Brute-Force โจมตีพอร์ต 22 (ควรใช้ SSH Key/Fail2Ban)'],
        ['เปิด Apache แล้วเข้าเว็บจากเครื่องอื่นไม่ได้', 'sudo ufw status และ ss -tulnp', 'ลืมเปิดพอร์ต 80/443 ใน Firewall (UFW)']
      ]
    },
    commands: `tail -f /var/log/auth.log          # ดูประวัติการล็อกอิน SSH แบบสด ๆ
sudo journalctl -u apache2 -n 20   # ดู Log ย้อนหลัง 20 บรรทัดของ Apache2
sudo ss -tulnp                     # ตรวจดูว่าเซอร์วิสใดเปิดฟังอยู่บนพอร์ตใด
traceroute 8.8.8.8                 # ตรวจสอบเส้นทางแพ็กเก็ตว่าขาดช่วงที่จุดใด`,
    examTip: 'จำให้แม่น: เข้าเว็บด้วย IP ได้แต่เข้าด้วยชื่อโดเมนไม่ได้ = ปัญหา DNS! ตรวจการแฮ็กล็อกอิน SSH = ดูไฟล์ /var/log/auth.log!',
    quiz: {
      q: 'หากเครื่องลูกข่ายสามารถเข้าเว็บด้วย IP (192.168.1.10) ได้ปกติ แต่พิมพ์ชื่อโดเมน (valley.local) แล้วเข้าไม่ได้ ปัญหาน่าจะเกิดจากส่วนใด?',
      options: ['สายแลนขาด', 'บริการ DNS Server หรือการตั้งค่า DNS', 'ฮาร์ดดิสก์เต็ม'],
      answer: 1
    }
  },
  {
    id: 18,
    code: 'สัปดาห์ที่ 18',
    title: 'โครงงานบูรณาการและตรวจสอบระบบครบวงจร (Final 18-Week Capstone)',
    eng: 'Enterprise Server Architecture Review & Final Audit',
    location: 'โซน 4 (SE) สภาแอดมินหลวง • ผอ.เซิร์ฟเวอร์',
    summary: 'สรุปภาพรวมการออกแบบ ดูแล และตรวจสอบความมั่นคงปลอดภัยของระบบปฏิบัติการเครื่องแม่ข่ายครบทั้งภาคเรียน 18 สัปดาห์',
    bullets: [
      '<strong>สถาปัตยกรรมเซิร์ฟเวอร์ครบวงจรของวิทยาลัย</strong> ประกอบด้วย: Virtualization (Hypervisor) + Linux Server (DHCP, DNS, LAMP Web/DB, Samba, Squid Proxy, Mail) + Windows Server (AD DS, GPO, IIS) + Security (UFW, SSH Key, RAID, 3-2-1 Backup, Log Monitoring)',
      '<strong>ตารางพอร์ตทองคำ (Golden Port Cheatsheet)</strong> ที่นักศึกษา ปวช. ควรจำขึ้นใจ: <code>21 FTP</code>, <code>22 SSH/SFTP</code>, <code>23 Telnet(ปิด!)</code>, <code>25 SMTP</code>, <code>53 DNS</code>, <code>67/68 DHCP</code>, <code>80 HTTP</code>, <code>110 POP3</code>, <code>143 IMAP</code>, <code>443 HTTPS</code>, <code>445 SMB</code>, <code>3128 Squid</code>, <code>3306 MySQL</code>, <code>3389 RDP</code>',
      '<strong>วงจรดูแลระบบมืออาชีพ</strong>: Plan (วางแผน) → Deploy (ติดตั้ง) → Secure (ล็อกไฟร์วอลล์/สิทธิ์) → Backup (สำรอง 3-2-1) → Monitor (เฝ้าระวัง Log)'
    ],
    table: {
      headers: ['พอร์ต', 'บริการ', 'พอร์ต', 'บริการ'],
      rows: [
        ['21', 'FTP (รับส่งไฟล์)', '143 / 993', 'IMAP (รับเมลซิงก์)'],
        ['22', 'SSH / SFTP (ปลอดภัย)', '443', 'HTTPS (เว็บเข้ารหัส)'],
        ['25 / 587', 'SMTP (ส่งอีเมล)', '445', 'Samba / SMB (แชร์ไฟล์)'],
        ['53', 'DNS (แปลงชื่อโดเมน)', '3128', 'Squid Proxy Server'],
        ['67 / 68', 'DHCP (แจก IP อัตโนมัติ)', '3306', 'MySQL / MariaDB'],
        ['80', 'HTTP (เว็บไซต์)', '3389', 'RDP (Windows Remote)']
      ]
    },
    commands: `# เช็กลิสต์ตรวจสุขภาพเครื่องแม่ข่ายประจำวัน (Daily Admin Health Check)
uptime && free -h && df -h         # 1. เช็กเวลาทำงาน RAM และพื้นที่ดิสก์
sudo systemctl --failed            # 2. เช็กว่ามีเซอร์วิสใดล่มหรือไม่
sudo ss -tulnp                     # 3. เช็กพอร์ตที่เปิดฟังทั้งหมด
sudo ufw status                    # 4. เช็กกฎ Firewall
tail -n 15 /var/log/auth.log       # 5. เช็กประวัติการล็อกอิน`,
    examTip: 'ทบทวนตารางพอร์ตทองคำ 12 พอร์ตด้านบน + สูตร chmod 4-2-1 + ลำดับ DORA + กฎ Backup 3-2-1 + AD DS/IIS = พร้อมคว้าเกรด 4 รายวิชา ปวช. แน่นอน!',
    quiz: {
      q: 'ข้อใดคือชุดคำสั่งตรวจสุขภาพเครื่องแม่ข่ายเพื่อเช็ก "พอร์ตที่เปิดฟัง" และ "สถานะไฟร์วอลล์" ตามลำดับ?',
      options: ['ss -tulnp และ ufw status', 'mkdir และ rmdir', 'ping และ clear'],
      answer: 0
    }
  }
];

// Master Review Quiz — 18 Questions (1 Comprehensive Question Per Week!)
window.MASTER_QUIZ_BANK = [
  {
    q: '1. [สัปดาห์ 1] ระบบเครือข่ายที่มีเครื่องศูนย์กลางคอยควบคุมบัญชีผู้ใช้และสิทธิ์การเข้าถึง เรียกว่าอะไร?',
    options: ['Peer-to-Peer', 'Client-Server', 'Ad-Hoc Mesh', 'Stand-Alone'],
    answer: 1,
    explain: 'Client-Server มี Server เป็นศูนย์กลางควบคุมบัญชีผู้ใช้และความปลอดภัย'
  },
  {
    q: '2. [สัปดาห์ 2] โปรแกรม Oracle VirtualBox และ VMware Workstation จัดเป็น Hypervisor ประเภทใด?',
    options: ['Type-1 Bare-Metal', 'Type-2 Hosted Hypervisor', 'BIOS Firmware', 'Firewall Engine'],
    answer: 1,
    explain: 'Type-2 ติดตั้งทำงานบนระบบปฏิบัติการหลัก (Host OS) อีกชั้นหนึ่ง'
  },
  {
    q: '3. [สัปดาห์ 3] ไดเรกทอรีใดบน Linux Server ที่เก็บไฟล์ตั้งค่า (Configuration) ของระบบและบริการต่าง ๆ?',
    options: ['/var/www', '/home', '/etc', '/boot'],
    answer: 2,
    explain: '/etc เป็นที่เก็บไฟล์ตั้งค่าหลัก เช่น /etc/netplan, /etc/samba/smb.conf'
  },
  {
    q: '4. [สัปดาห์ 4] เหตุใดเครื่องแม่ข่ายจึงควรตั้งค่าหมายเลข IP แบบ Static แทนการรับจาก DHCP อัตโนมัติ?',
    options: [
      'เพื่อให้เครื่องลูกข่ายและบริการอื่นติดต่อที่ IP เดิมได้ตลอดเวลาไม่เปลี่ยนไปมา',
      'เพราะเครื่องแม่ข่ายไม่รองรับการ์ดแลน',
      'เพื่อให้เครื่องบูตเร็วขึ้น 10 เท่า',
      'เพราะ Static IP ไม่ต้องใช้ Subnet Mask'
    ],
    answer: 0,
    explain: 'หาก IP ของ Server เปลี่ยนบ่อย เครื่องลูกข่ายและ DNS จะหาไม่เจอ'
  },
  {
    q: '5. [สัปดาห์ 5] คำสั่ง chmod 755 script.sh ให้สิทธิ์ Owner / Group / Others ตรงกับข้อใด?',
    options: ['rwx / rwx / rwx', 'rwx / r-x / r-x', 'rw- / r-- / r--', 'r-x / r-x / ---'],
    answer: 1,
    explain: '7 = 4+2+1 (rwx), 5 = 4+1 (r-x) ดังนั้น 755 คือ rwxr-xr-x'
  },
  {
    q: '6. [สัปดาห์ 6] RAID ระดับใดที่ทำ Mirroring สำเนาข้อมูลเหมือนกัน 2 ลูก ทนดิสก์พังได้ 1 ลูก (พื้นที่เหลือ 50%)?',
    options: ['RAID 0', 'RAID 1', 'RAID 5', 'JBOD'],
    answer: 1,
    explain: 'RAID 1 คือ Mirroring สำเนาข้อมูลเหมือนกันทั้ง 2 ลูก ปลอดภัยสูง'
  },
  {
    q: '7. [สัปดาห์ 7] หากต้องการรีโมตเข้าไปบริหารจัดการ Ubuntu Server อย่างปลอดภัย ควรใช้โปรโตคอลและพอร์ตใด?',
    options: ['Telnet พอร์ต 23', 'SSH พอร์ต 22', 'HTTP พอร์ต 80', 'DHCP พอร์ต 67'],
    answer: 1,
    explain: 'SSH (Port 22) เข้ารหัสข้อมูลทั้งหมด ปลอดภัยกว่า Telnet (Port 23)'
  },
  {
    q: '8. [สัปดาห์ 8] ข้อใดเรียงลำดับขั้นตอนการแจก IP ของ DHCP (DORA) ได้ถูกต้อง?',
    options: [
      'Discover → Offer → Request → Acknowledge',
      'Discover → Request → Offer → Acknowledge',
      'Offer → Request → Discover → Acknowledge',
      'Acknowledge → Offer → Request → Discover'
    ],
    answer: 0,
    explain: 'DORA: Discover → Offer → Request → Acknowledge'
  },
  {
    q: '9. [สัปดาห์ 9] บริการ DNS ทำหน้าที่หลักอย่างไร และทำงานบนพอร์ตหมายเลขใด?',
    options: [
      'แจกจ่าย IP อัตโนมัติ พอร์ต 67',
      'แปลงชื่อโดเมนเป็น IP Address พอร์ต 53',
      'แชร์ไฟล์ให้ Windows พอร์ต 445',
      'ให้บริการฐานข้อมูล พอร์ต 3306'
    ],
    answer: 1,
    explain: 'DNS แปลงชื่อโดเมน ↔ IP ทำงานบนพอร์ต 53'
  },
  {
    q: '10. [สัปดาห์ 10] คำสั่งใดใช้สั่งให้เซอร์วิส apache2 เริ่มทำงานอัตโนมัติทุกครั้งที่เปิดเครื่อง Linux Server?',
    options: [
      'sudo systemctl enable apache2',
      'sudo systemctl delete apache2',
      'sudo rm -rf apache2',
      'ping apache2'
    ],
    answer: 0,
    explain: 'systemctl enable สั่งให้เซอร์วิสทำงานอัตโนมัติเมื่อบูตเครื่อง'
  },
  {
    q: '11. [สัปดาห์ 11] พอร์ตมาตรฐานของ Web Server (HTTPS) และฐานข้อมูล MariaDB/MySQL คือหมายเลขใดตามลำดับ?',
    options: ['80 และ 21', '443 และ 3306', '22 และ 445', '53 และ 3389'],
    answer: 1,
    explain: 'HTTPS ใช้พอร์ต 443 และ MySQL/MariaDB ใช้พอร์ต 3306'
  },
  {
    q: '12. [สัปดาห์ 12] การแชร์ไฟล์จาก Linux Server ให้เครื่อง Windows เปิดผ่านเครือข่าย LAN ได้ นิยมใช้บริการใด?',
    options: ['Samba (SMB พอร์ต 445)', 'Apache2 (พอร์ต 80)', 'BIND9 (พอร์ต 53)', 'Squid (พอร์ต 3128)'],
    answer: 0,
    explain: 'Samba รองรับโปรโตคอล SMB/CIFS พอร์ต 445 เชื่อมต่อกับ Windows ได้โดยตรง'
  },
  {
    q: '13. [สัปดาห์ 13] ซอฟต์แวร์ Squid Proxy ใช้พอร์ตมาตรฐานใด และโปรโตคอลใดใช้สำหรับ "ส่งอีเมล"?',
    options: ['3128 และ SMTP (25)', '80 และ POP3 (110)', '53 และ IMAP (143)', '22 และ FTP (21)'],
    answer: 0,
    explain: 'Squid Proxy ใช้พอร์ต 3128 และ SMTP (พอร์ต 25/587) ใช้ส่งอีเมล'
  },
  {
    q: '14. [สัปดาห์ 14] บน Windows Server บทบาทใดใช้คุมบัญชีผู้ใช้และ GPO จากศูนย์กลาง และ IIS เก็บไฟล์เว็บที่ใด?',
    options: [
      'Active Directory (AD DS) และ C:\\inetpub\\wwwroot',
      'Samba และ /var/www/html',
      'BIND9 และ /etc/bind',
      'UFW และ /var/log'
    ],
    answer: 0,
    explain: 'AD DS คือ Domain Controller ของ Windows Server และ IIS เก็บเว็บที่ C:\\inetpub\\wwwroot'
  },
  {
    q: '15. [สัปดาห์ 15] หลักการตั้งค่า Firewall ที่ปลอดภัยสำหรับเครื่องแม่ข่ายคือข้อใด?',
    options: [
      'เปิดทุกพอร์ตไว้ก่อนเพื่อความสะดวก',
      'ปิดพอร์ตขาเข้าทั้งหมดเป็นค่าเริ่มต้น (Default Deny) แล้วเปิดเฉพาะพอร์ตที่จำเป็น',
      'ปิด Firewall ทิ้งเมื่อออกอินเทอร์เน็ต',
      'เปิดเฉพาะพอร์ต 23 (Telnet)'
    ],
    answer: 1,
    explain: 'Default Deny Incoming + Allow เฉพาะพอร์ตที่ใช้งานจริงช่วยลดพื้นที่โจมตี'
  },
  {
    q: '16. [สัปดาห์ 16] ในกฎการสำรองข้อมูล 3-2-1 เลข 3, 2, 1 หมายถึงอะไรตามลำดับ?',
    options: [
      '3 สำเนา, 2 ชนิดสื่อจัดเก็บ, 1 ชุดเก็บนอกสถานที่ (Offsite)',
      '3 ชั่วโมง, 2 วัน, 1 สัปดาห์',
      '3 เครื่อง, 2 สายแลน, 1 เราเตอร์',
      '3 ผู้ใช้, 2 รหัสผ่าน, 1 กลุ่ม'
    ],
    answer: 0,
    explain: '3-2-1 Backup: 3 Copies, 2 Different Media, 1 Offsite Backup'
  },
  {
    q: '17. [สัปดาห์ 17] หากต้องการตรวจสอบว่ามีผู้บุกรุกพยายามสุ่มรหัสผ่านเข้า SSH บน Ubuntu Server ควรตรวจไฟล์ Log ใด?',
    options: ['/var/log/auth.log', '/etc/hostname', '/var/www/html/index.html', '/home/user.txt'],
    answer: 0,
    explain: '/var/log/auth.log บันทึกเหตุการณ์การยืนยันตัวตน SSH และการใช้ sudo ทั้งหมด'
  },
  {
    q: '18. [สัปดาห์ 18] คำสั่งใดใช้ตรวจสอบพอร์ตที่กำลังเปิดรับการเชื่อมต่อ (Listening Ports) บน Linux Server สมัยใหม่?',
    options: ['sudo ss -tulnp', 'sudo mkdir -p', 'sudo chmod 777', 'sudo reboot'],
    answer: 0,
    explain: 'ss -tulnp แสดงพอร์ต TCP/UDP ที่เปิดฟังอยู่พร้อมชื่อโปรเซส (แทน netstat เดิม)'
  }
];
