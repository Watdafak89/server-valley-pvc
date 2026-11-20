// 11 Interactive Server OS Hands-on Labs + Master Review Quiz
window.Labs = (function () {
  function el(html) {
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstElementChild;
  }

  function showFeedback(box, ok, msg) {
    box.className = 'lab-feedback ' + (ok ? 'ok' : 'err');
    box.innerHTML = msg;
    box.classList.remove('hidden');
    if (ok) SoundFX.questComplete();
    else SoundFX.error();
  }

  // Render lab by week/unit number (1..18)
  function renderLab(unit, container, onSuccess) {
    container.innerHTML = '';
    const map = {
      1: lab1NOS,
      2: lab2VM,
      3: lab3InstallOS,
      4: lab4StaticCLI,
      5: lab5ChmodUser,
      6: lab6StorageRAID,
      7: lab6RemoteSSH,
      8: lab7DHCP,
      9: lab8DNS,
      10: lab10SystemdCron,
      11: lab9WebDB,
      12: lab10SambaFTP,
      13: lab13ProxyMail,
      14: lab12WindowsServer,
      15: lab11Firewall,
      16: lab16BackupRecovery,
      17: lab17LogTroubleshoot,
      18: lab18FinalCapstone
    };
    const fn = map[unit];
    if (fn) fn(container, onSuccess);
  }

  // ==================== LAB 1: NOS & Client-Server ====================
  function lab1NOS(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจหน่วยที่ 1 (พื้นฐานเครือข่ายและ NOS):</strong>
        ตู้สวิตช์กลางหมู่บ้านเชื่อมต่อสายแลน Cat6 แล้ว! ช่วยวิเคราะห์สถาปัตยกรรมเครือข่ายและเลือกระบบปฏิบัติการเครื่องแม่ข่าย (NOS) ให้ถูกต้องเพื่อเปิดระบบหลัก
      </div>
    `));

    const form = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>1. สถาปัตยกรรมเครือข่ายหมู่บ้าน</h4>
          <div class="lab-field">
            <label>เครือข่ายที่มีเครื่องศูนย์กลางคุมบัญชีผู้ใช้และสิทธิ์การเข้าถึง (เช่น วิทยาลัย/องค์กร)</label>
            <select id="l1-arch" class="lab-select">
              <option value="">-- เลือกคำตอบ --</option>
              <option value="p2p">Peer-to-Peer (P2P)</option>
              <option value="cs">Client-Server</option>
            </select>
          </div>
          <div class="lab-field">
            <label>เครือข่ายขนาดเล็ก 3–5 เครื่อง ไม่มีเครื่องศูนย์กลาง ทุกเครื่องเท่าเทียมกัน</label>
            <select id="l1-small" class="lab-select">
              <option value="">-- เลือกคำตอบ --</option>
              <option value="p2p">Peer-to-Peer (P2P)</option>
              <option value="cs">Client-Server</option>
            </select>
          </div>
        </div>
        <div class="lab-panel">
          <h4>2. ประเภทระบบปฏิบัติการเครื่องแม่ข่าย (NOS)</h4>
          <div class="lab-field">
            <label>ระบบปฏิบัติการแบบมาตรฐานเปิด (Open Source / ฟรี)</label>
            <select id="l1-open" class="lab-select">
              <option value="">-- เลือกคำตอบ --</option>
              <option value="linux">Linux Server (Ubuntu Server / Rocky Linux)</option>
              <option value="win">Windows Server (Proprietary)</option>
            </select>
          </div>
          <div class="lab-field">
            <label>ระบบปฏิบัติการแบบมาตรฐานปิด (Proprietary / มีลิขสิทธิ์ เน้น GUI)</label>
            <select id="l1-prop" class="lab-select">
              <option value="">-- เลือกคำตอบ --</option>
              <option value="linux">Linux Server (Ubuntu Server)</option>
              <option value="win">Windows Server</option>
            </select>
          </div>
        </div>
      </div>
    `);
    container.appendChild(form);

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">⚡ ทดสอบและเปิดสวิตช์หลักหมู่บ้าน</button>`);
    btn.onclick = () => {
      const a = form.querySelector('#l1-arch').value;
      const b = form.querySelector('#l1-small').value;
      const c = form.querySelector('#l1-open').value;
      const d = form.querySelector('#l1-prop').value;
      if (a === 'cs' && b === 'p2p' && c === 'linux' && d === 'win') {
        showFeedback(fb, true, '✅ ถูกต้องทั้งหมด! สวิตช์หลักของหมู่บ้านเปิดทำงานในโหมด Client-Server เรียบร้อยแล้ว');
        setTimeout(() => onSuccess(), 900);
      } else {
        showFeedback(fb, false, '❌ ยังมีบางข้อคลาดเคลื่อน ลองทบทวน: Client-Server มีศูนย์กลางคุมสิทธิ์, P2P เหมาะกับวงเล็ก, Linux เป็น Open Source และ Windows Server เป็น Proprietary (กดปุ่ม 📖 เปิดคู่มือหน่วยนี้ได้นะ)');
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== LAB 2: Virtualization / VM Builder ====================
  function lab2VM(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจหน่วยที่ 2 (Virtualization / VM Builder):</strong>
        จัดสเปกเครื่องเสมือน (Virtual Machine) บนเครื่องฝึกปฏิบัติ ปวช. เพื่อเตรียมสร้าง <strong>Ubuntu Server + แล็บ DHCP จำลอง</strong> โดยไม่ให้แจก IP ชนกับเครือข่ายจริงของวิทยาลัย!
      </div>
    `));

    const ui = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>⚙️ จัดสรรฮาร์ดแวร์จำลอง (Virtual Hardware)</h4>
          <div class="lab-field">
            <label>โปรแกรมจำลองเครื่องบน Windows (Hosted Hypervisor Type-2)</label>
            <select id="l2-hyp" class="lab-select">
              <option value="">-- เลือก Hypervisor --</option>
              <option value="vbox">Oracle VirtualBox / VMware Workstation (Type-2)</option>
              <option value="bios">BIOS / Notepad</option>
            </select>
          </div>
          <div class="lab-field">
            <label>หน่วยความจำ RAM สำหรับ Linux Server (แนะนำ ≥ 2048 MB): <strong id="l2-ram-val">1024 MB</strong></label>
            <input id="l2-ram" type="range" min="512" max="4096" step="512" value="1024" style="width:100%" />
          </div>
          <div class="lab-field">
            <label>พื้นที่ Virtual Disk (แนะนำ ≥ 20 GB): <strong id="l2-disk-val">10 GB</strong></label>
            <input id="l2-disk" type="range" min="5" max="40" step="5" value="10" style="width:100%" />
          </div>
        </div>
        <div class="lab-panel">
          <h4>🌐 การตั้งค่าการ์ดเครือข่ายเสมือน (VM Network)</h4>
          <div class="lab-field">
            <label>ต้องการทดสอบ DHCP Server ระหว่าง VM ด้วยกัน <u>ไม่ให้ชนเครือข่ายจริง</u> ควรเลือกโหมดใด?</label>
            <select id="l2-net1" class="lab-select">
              <option value="">-- เลือกโหมดเครือข่าย --</option>
              <option value="bridged">Bridged Adapter (รับ IP วงจริงของวิทยาลัย)</option>
              <option value="internal">Internal Network / Host-Only (วงจำลองแยกอิสระ)</option>
            </select>
          </div>
          <div class="lab-field">
            <label>หากต้องการให้ VM เสมือนเสียบสาย LAN จริงและให้เครื่องอื่นในห้องแล็บเข้าเว็บได้ เลือกโหมดใด?</label>
            <select id="l2-net2" class="lab-select">
              <option value="">-- เลือกโหมดเครือข่าย --</option>
              <option value="bridged">Bridged Adapter</option>
              <option value="internal">Internal Network</option>
            </select>
          </div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const ramSlider = ui.querySelector('#l2-ram');
    const diskSlider = ui.querySelector('#l2-disk');
    ramSlider.oninput = () => (ui.querySelector('#l2-ram-val').textContent = ramSlider.value + ' MB');
    diskSlider.oninput = () => (ui.querySelector('#l2-disk-val').textContent = diskSlider.value + ' GB');

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">🖥️ สร้างเครื่องแม่ข่ายจำลอง (Create VM)</button>`);
    btn.onclick = () => {
      const hyp = ui.querySelector('#l2-hyp').value;
      const ram = Number(ramSlider.value);
      const disk = Number(diskSlider.value);
      const net1 = ui.querySelector('#l2-net1').value;
      const net2 = ui.querySelector('#l2-net2').value;
      if (hyp !== 'vbox') {
        return showFeedback(fb, false, '❌ เลือก Hypervisor Type-2 เช่น Oracle VirtualBox หรือ VMware Workstation');
      }
      if (ram < 2048 || disk < 20) {
        return showFeedback(fb, false, '❌ ทรัพยากรน้อยเกินไป! ควรจัดสรร RAM อย่างน้อย 2048 MB และ Disk อย่างน้อย 20 GB');
      }
      if (net1 !== 'internal' || net2 !== 'bridged') {
        return showFeedback(fb, false, '❌ ตรวจสอบโหมดเครือข่ายอีกครั้ง: แล็บ DHCP แยกวงใช้ Internal Network ส่วนเชื่อมต่อวง LAN จริงใช้ Bridged Adapter');
      }
      showFeedback(fb, true, '✅ สร้างเครื่อง VM สำเร็จ! สเปกพร้อมรองรับการติดตั้ง Server OS แล้ว');
      setTimeout(() => onSuccess(), 900);
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== LAB 3: Server OS Installation ====================
  function lab3InstallOS(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจหน่วยที่ 3 (ติดตั้งระบบปฏิบัติการเครื่องแม่ข่าย):</strong>
        เสียบแฟลชไดรฟ์ <code>ubuntu-24.04-live-server.iso</code> เรียบร้อย! ช่วยเลือกโครงสร้างไดเรกทอรี Linux ให้ตรงหน้าที่และเลือกคำสั่งอัปเดตระบบหลังติดตั้ง
      </div>
    `));

    const ui = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>📂 จับคู่ไดเรกทอรีสำคัญของ Linux Server</h4>
          <div class="lab-field">
            <label>เก็บไฟล์ตั้งค่า (Configuration Files) ของระบบและเซอร์วิสทั้งหมด</label>
            <select id="l3-d1" class="lab-select">
              <option value="">-- เลือกโฟลเดอร์ --</option>
              <option value="/etc">/etc</option>
              <option value="/home">/home</option>
              <option value="/tmp">/tmp</option>
            </select>
          </div>
          <div class="lab-field">
            <label>เก็บไฟล์เว็บไซต์ (/var/www) และไฟล์บันทึกเหตุการณ์ (/var/log)</label>
            <select id="l3-d2" class="lab-select">
              <option value="">-- เลือกโฟลเดอร์ --</option>
              <option value="/boot">/boot</option>
              <option value="/var">/var</option>
              <option value="/bin">/bin</option>
            </select>
          </div>
          <div class="lab-field">
            <label>รากของระบบไฟล์ทั้งหมดบน Linux (เทียบเท่าไดรฟ์ C:)</label>
            <select id="l3-d3" class="lab-select">
              <option value="">-- เลือกโฟลเดอร์ --</option>
              <option value="/">/ (Root)</option>
              <option value="/home">/home</option>
            </select>
          </div>
        </div>
        <div class="lab-panel">
          <h4>💿 ขั้นตอนหลังติดตั้ง Ubuntu Server</h4>
          <div class="lab-field">
            <label>ควรติ๊กเลือกติดตั้งบริการใดระหว่างลง Ubuntu Server เพื่อให้รีโมตจัดการได้ทันที?</label>
            <select id="l3-ssh" class="lab-select">
              <option value="">-- เลือกตัวเลือก --</option>
              <option value="openssh">Install OpenSSH Server</option>
              <option value="games">Install 3D Game Pack</option>
            </select>
          </div>
          <div class="lab-field">
            <label>คำสั่งอัปเดตรายชื่อแพ็กเกจล่าสุดบน Ubuntu Server</label>
            <select id="l3-apt" class="lab-select">
              <option value="">-- เลือกคำสั่ง --</option>
              <option value="apt">sudo apt update && sudo apt upgrade -y</option>
              <option value="format">format c: /q</option>
            </select>
          </div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">💿 เริ่มติดตั้งและบูต Ubuntu Server</button>`);
    btn.onclick = () => {
      const ok =
        ui.querySelector('#l3-d1').value === '/etc' &&
        ui.querySelector('#l3-d2').value === '/var' &&
        ui.querySelector('#l3-d3').value === '/' &&
        ui.querySelector('#l3-ssh').value === 'openssh' &&
        ui.querySelector('#l3-apt').value === 'apt';
      if (ok) {
        showFeedback(fb, true, '✅ ติดตั้ง Ubuntu Server 24.04 LTS + OpenSSH และอัปเดตแพ็กเกจสำเร็จ 100%!');
        setTimeout(() => onSuccess(), 900);
      } else {
        showFeedback(fb, false, '❌ ยังไม่ถูกต้องทั้งหมด ลองเช็ก: /etc เก็บ Config, /var เก็บเว็บและ Log, / คือ Root, เลือก OpenSSH และอัปเดตด้วย sudo apt update');
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== LAB 4: Static IP & Interactive Linux Terminal ====================
  function lab4StaticCLI(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจหน่วยที่ 4 (Static IP &amp; Linux CLI Terminal):</strong>
        1) ทดลองรันคำสั่งใน Terminal ให้ครบ 2 คำสั่ง คือ <code>ip addr</code> และ <code>hostnamectl set-hostname srv-valley</code><br/>
        2) กรอกค่า <strong>Static IP</strong> ใน Netplan ให้ถูกต้อง: IP <code>192.168.1.10/24</code> และ Default Gateway <code>192.168.1.1</code>
      </div>
    `));

    const state = { ranIp: false, ranHost: false };

    const term = el(`
      <div class="lab-terminal">
        <div class="term-output" id="l4-out">Ubuntu 24.04 LTS Server — Server Valley Console
พิมพ์คำสั่งด้านล่าง หรือคลิกปุ่มช่วยคำสั่งเพื่อฝึกใช้งาน:
• ip addr
• hostnamectl set-hostname srv-valley</div>
        <div class="term-input-row">
          <span class="term-prompt">admin@ubuntu:~$</span>
          <input id="l4-cmd" class="term-input" type="text" placeholder="พิมพ์คำสั่ง Linux ที่นี่ แล้วกด Enter..." />
          <button id="l4-run" class="wood-btn small-btn primary-btn">Run</button>
        </div>
        <div class="quick-cmd-chips">
          <button class="cmd-chip" data-cmd="ip addr">ip addr</button>
          <button class="cmd-chip" data-cmd="hostnamectl set-hostname srv-valley">hostnamectl set-hostname srv-valley</button>
          <button class="cmd-chip" data-cmd="ls -la">ls -la</button>
          <button class="cmd-chip" data-cmd="pwd">pwd</button>
        </div>
      </div>
    `);
    container.appendChild(term);

    const out = term.querySelector('#l4-out');
    const inp = term.querySelector('#l4-cmd');
    const appendLine = (txt, cls = '') => {
      const span = document.createElement('div');
      span.className = cls;
      span.textContent = txt;
      out.appendChild(span);
      out.scrollTop = out.scrollHeight;
    };

    const runCmd = (raw) => {
      const cmd = raw.trim();
      if (!cmd) return;
      SoundFX.click();
      appendLine('admin@ubuntu:~$ ' + cmd, 'term-line-cmd');
      if (cmd === 'ip addr' || cmd === 'ip a') {
        state.ranIp = true;
        appendLine('2: enp0s3: <BROADCAST,MULTICAST,UP> mtu 1500\n   inet 192.168.1.99/24 (dynamic) -> ต้องเปลี่ยนเป็น Static IP!', 'term-line-ok');
      } else if (cmd.startsWith('hostnamectl set-hostname')) {
        state.ranHost = true;
        appendLine('✓ เปลี่ยนชื่อเครื่องแม่ข่ายเป็น srv-valley เรียบร้อยแล้ว!', 'term-line-ok');
      } else if (cmd === 'ls -la' || cmd === 'ls') {
        appendLine('drwxr-xr-x  admin admin  /etc/netplan/00-installer-config.yaml', 'term-line-info');
      } else if (cmd === 'pwd') {
        appendLine('/home/admin', 'term-line-info');
      } else {
        appendLine('ไม่พบคำสั่งนี้ในโหมดฝึก ลองพิมพ์ ip addr หรือ hostnamectl set-hostname srv-valley', 'term-line-err');
      }
      inp.value = '';
    };

    term.querySelector('#l4-run').onclick = () => runCmd(inp.value);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') runCmd(inp.value); });
    term.querySelectorAll('.cmd-chip').forEach((b) => {
      b.onclick = () => runCmd(b.dataset.cmd);
    });

    const netForm = el(`
      <div class="lab-panel">
        <h4>📝 ตั้งค่า Static IP (/etc/netplan/00-installer-config.yaml)</h4>
        <div class="lab-card-grid">
          <div class="lab-field">
            <label>Static IP Address พร้อม CIDR (เช่น 192.168.1.10/24)</label>
            <input id="l4-ip" class="lab-input" placeholder="192.168.1.10/24" />
          </div>
          <div class="lab-field">
            <label>Default Gateway (เราเตอร์หมู่บ้าน: 192.168.1.1)</label>
            <input id="l4-gw" class="lab-input" placeholder="192.168.1.1" />
          </div>
          <div class="lab-field">
            <label>โหมด dhcp4 สำหรับ Static IP</label>
            <select id="l4-dhcp" class="lab-select">
              <option value="yes">dhcp4: yes (รับอัตโนมัติ)</option>
              <option value="no">dhcp4: no (กำหนด IP คงที่)</option>
            </select>
          </div>
        </div>
      </div>
    `);
    container.appendChild(netForm);

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">✅ บันทึกและสั่ง sudo netplan apply</button>`);
    btn.onclick = () => {
      const ip = netForm.querySelector('#l4-ip').value.trim();
      const gw = netForm.querySelector('#l4-gw').value.trim();
      const dhcp = netForm.querySelector('#l4-dhcp').value;
      if (!state.ranIp || !state.ranHost) {
        return showFeedback(fb, false, '❌ กรุณาทดลองรันคำสั่ง <code>ip addr</code> และ <code>hostnamectl set-hostname srv-valley</code> ใน Terminal ด้านบนให้ครบก่อนนะ!');
      }
      if (ip === '192.168.1.10/24' && gw === '192.168.1.1' && dhcp === 'no') {
        showFeedback(fb, true, '✅ sudo netplan apply สำเร็จ! เครื่อง srv-valley ได้ Static IP 192.168.1.10/24 เรียบร้อยแล้ว');
        setTimeout(() => onSuccess(), 900);
      } else {
        showFeedback(fb, false, '❌ ตรวจสอบค่า Netplan อีกครั้ง: IP = 192.168.1.10/24, Gateway = 192.168.1.1 และ dhcp4 ต้องเป็น no');
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== LAB 5: User, Group & Interactive chmod Calculator ====================
  function lab5ChmodUser(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจหน่วยที่ 5 (User, Group &amp; chmod Permission Lab):</strong>
        1) ใช้ตัวคำนวณบิตด้านล่างกำหนดสิทธิ์โฟลเดอร์เว็บ <code>/var/www/html</code> ให้เป็น <strong>chmod 755 (rwxr-xr-x)</strong><br/>
        2) เลือกคำสั่งสร้างผู้ใช้และเพิ่มเข้ากลุ่ม <code>itdept</code> ให้ถูกต้อง
      </div>
    `));

    const ui = el(`
      <div class="lab-panel">
        <h4>🔐 เครื่องคำนวณสิทธิ์ Linux (r = 4, w = 2, x = 1) — เป้าหมาย: <span style="color:#0e6b3a">chmod 755</span></h4>
        <div class="perm-grid">
          <div class="perm-box" data-role="u">
            <div><strong>Owner (เจ้าของ)</strong></div>
            <div class="perm-digit" id="p-u">0</div>
            <div class="perm-checks">
              <label><input type="checkbox" value="4" /> r(4)</label>
              <label><input type="checkbox" value="2" /> w(2)</label>
              <label><input type="checkbox" value="1" /> x(1)</label>
            </div>
          </div>
          <div class="perm-box" data-role="g">
            <div><strong>Group (กลุ่ม)</strong></div>
            <div class="perm-digit" id="p-g">0</div>
            <div class="perm-checks">
              <label><input type="checkbox" value="4" /> r(4)</label>
              <label><input type="checkbox" value="2" /> w(2)</label>
              <label><input type="checkbox" value="1" /> x(1)</label>
            </div>
          </div>
          <div class="perm-box" data-role="o">
            <div><strong>Others (ผู้อื่น)</strong></div>
            <div class="perm-digit" id="p-o">0</div>
            <div class="perm-checks">
              <label><input type="checkbox" value="4" /> r(4)</label>
              <label><input type="checkbox" value="2" /> w(2)</label>
              <label><input type="checkbox" value="1" /> x(1)</label>
            </div>
          </div>
        </div>
        <div style="margin-top:10px;text-align:center;font-size:15px;">
          คำสั่งที่ได้: <code id="chmod-preview" style="background:#111920;color:#69f0ae;padding:4px 10px;border-radius:4px;">sudo chmod 000 /var/www/html</code>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const calcPerm = () => {
      const vals = {};
      ['u', 'g', 'o'].forEach((r) => {
        let sum = 0;
        ui.querySelectorAll(`.perm-box[data-role="${r}"] input:checked`).forEach((c) => (sum += Number(c.value)));
        vals[r] = sum;
        ui.querySelector(`#p-${r}`).textContent = sum;
      });
      const code = `${vals.u}${vals.g}${vals.o}`;
      ui.querySelector('#chmod-preview').textContent = `sudo chmod ${code} /var/www/html`;
      return code;
    };
    ui.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.onchange = () => { SoundFX.click(); calcPerm(); }));

    const userPanel = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>👤 จัดการบัญชีผู้ใช้และกลุ่ม</h4>
          <div class="lab-field">
            <label>คำสั่งเพิ่มผู้ใช้ somchai เข้ากลุ่ม itdept โดยไม่ลบกลุ่มเดิม</label>
            <select id="l5-grp" class="lab-select">
              <option value="">-- เลือกคำสั่ง --</option>
              <option value="usermod">sudo usermod -aG itdept somchai</option>
              <option value="deluser">sudo deluser somchai</option>
            </select>
          </div>
          <div class="lab-field">
            <label>สิทธิ์ไฟล์กุญแจส่วนตัว SSH ที่ให้เฉพาะเจ้าของอ่าน/เขียนได้เท่านั้น (rw-------) คือเลขใด?</label>
            <select id="l5-sshperm" class="lab-select">
              <option value="">-- เลือกตัวเลข chmod --</option>
              <option value="777">777</option>
              <option value="600">600</option>
              <option value="444">444</option>
            </select>
          </div>
        </div>
      </div>
    `);
    container.appendChild(userPanel);

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">🔐 ยืนยันการตั้งค่าสิทธิ์และผู้ใช้</button>`);
    btn.onclick = () => {
      const code = calcPerm();
      const grp = userPanel.querySelector('#l5-grp').value;
      const sshp = userPanel.querySelector('#l5-sshperm').value;
      if (code === '755' && grp === 'usermod' && sshp === '600') {
        showFeedback(fb, true, '✅ ยอดเยี่ยม! ตั้งค่า chmod 755 (rwxr-xr-x), เพิ่มผู้ใช้เข้ากลุ่ม itdept และเข้าใจสิทธิ์ 600 ครบถ้วน!');
        setTimeout(() => onSuccess(), 900);
      } else {
        showFeedback(fb, false, `❌ ลองตรวจอีกครั้ง: ตอนนี้ chmod คือ ${code} (ต้องเป็น 755 = เจ้าของติ๊ก r,w,x / กลุ่มและผู้อื่นติ๊ก r,x), เพิ่มเข้ากลุ่มใช้ usermod -aG และไฟล์ส่วนตัวใช้ 600`);
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== LAB 6: Remote Administration (SSH / RDP / Webmin) ====================
  function lab6RemoteSSH(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจหน่วยที่ 6 (Remote Administration):</strong>
        1) จับคู่โปรโตคอลรีโมตกับพอร์ตมาตรฐานให้ถูกต้อง<br/>
        2) เชื่อมต่อรีโมตเข้าเครื่อง <code>192.168.1.10</code> ด้วยคำสั่ง <code>ssh admin@192.168.1.10</code> ใน Terminal
      </div>
    `));

    let sshConnected = false;

    const ui = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>📡 จับคู่พอร์ตรีโมตมาตรฐาน</h4>
          <div class="lab-field">
            <label>SSH (รีโมต Linux แบบเข้ารหัสปลอดภัย)</label>
            <select id="l6-ssh" class="lab-select">
              <option value="">-- เลือกพอร์ต --</option>
              <option value="22">TCP Port 22</option>
              <option value="23">TCP Port 23</option>
              <option value="80">TCP Port 80</option>
            </select>
          </div>
          <div class="lab-field">
            <label>RDP (Remote Desktop สำหรับ Windows Server GUI)</label>
            <select id="l6-rdp" class="lab-select">
              <option value="">-- เลือกพอร์ต --</option>
              <option value="3389">TCP Port 3389</option>
              <option value="53">UDP Port 53</option>
            </select>
          </div>
          <div class="lab-field">
            <label>โปรโตคอลใด <u>ไม่ควรเปิดใช้</u> เพราะส่งรหัสผ่านแบบไม่เข้ารหัส?</label>
            <select id="l6-bad" class="lab-select">
              <option value="">-- เลือกคำตอบ --</option>
              <option value="telnet">Telnet (Port 23)</option>
              <option value="ssh">OpenSSH (Port 22)</option>
            </select>
          </div>
        </div>
        <div class="lab-panel">
          <h4>🔑 ทดสอบเชื่อมต่อ SSH ด้วยกุญแจ</h4>
          <div class="lab-terminal">
            <div class="term-output" id="l6-out" style="min-height:95px;">Client Workstation พร้อมเชื่อมต่อ...
พิมพ์: ssh admin@192.168.1.10</div>
            <div class="term-input-row">
              <span class="term-prompt">pc&gt;</span>
              <input id="l6-cmd" class="term-input" placeholder="ssh admin@192.168.1.10" />
              <button id="l6-go" class="wood-btn small-btn primary-btn">Connect</button>
            </div>
            <div class="quick-cmd-chips">
              <button class="cmd-chip" id="l6-chip">ssh admin@192.168.1.10</button>
            </div>
          </div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const doSSH = (val) => {
      const out = ui.querySelector('#l6-out');
      const cmd = val.trim();
      SoundFX.click();
      if (cmd === 'ssh admin@192.168.1.10') {
        sshConnected = true;
        out.innerHTML += `\n<span class="term-line-cmd">pc&gt; ${cmd}</span>\n<span class="term-line-ok">🔑 ยืนยันตัวตนด้วย SSH Key สำเร็จ!\nWelcome to srv-valley (Ubuntu 24.04 LTS) — Encrypted Session Active!</span>`;
      } else {
        out.innerHTML += `\n<span class="term-line-err">รูปแบบไม่ถูกต้อง ลองพิมพ์: ssh admin@192.168.1.10</span>`;
      }
      out.scrollTop = out.scrollHeight;
    };
    ui.querySelector('#l6-go').onclick = () => doSSH(ui.querySelector('#l6-cmd').value);
    ui.querySelector('#l6-chip').onclick = () => {
      ui.querySelector('#l6-cmd').value = 'ssh admin@192.168.1.10';
      doSSH('ssh admin@192.168.1.10');
    };

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">📡 ยืนยันระบบ Remote Administration</button>`);
    btn.onclick = () => {
      const ok =
        ui.querySelector('#l6-ssh').value === '22' &&
        ui.querySelector('#l6-rdp').value === '3389' &&
        ui.querySelector('#l6-bad').value === 'telnet' &&
        sshConnected;
      if (ok) {
        showFeedback(fb, true, '✅ หอสื่อสารทางไกลออนไลน์แล้ว! เชื่อมต่อผ่าน SSH พอร์ต 22 อย่างปลอดภัย');
        setTimeout(() => onSuccess(), 900);
      } else {
        showFeedback(fb, false, '❌ ตรวจสอบอีกครั้ง: SSH=22, RDP=3389, Telnet(23) ไม่ปลอดภัย และอย่าลืมกด Connect รันคำสั่ง ssh admin@192.168.1.10!');
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== LAB 7: DHCP Server & DORA ====================
  function lab7DHCP(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจหน่วยที่ 7 (DHCP Server &amp; DORA):</strong>
        1) คลิกเรียงลำดับกระบวนการแจก IP แบบ <strong>D-O-R-A</strong> ทั้ง 4 ขั้นตอนให้ถูกต้อง<br/>
        2) กำหนดช่วง <strong>IP Pool</strong> ให้แจกตั้งแต่ <code>192.168.1.100</code> ถึง <code>192.168.1.200</code> (เว้นช่วงต้นไว้ให้เครื่องแม่ข่าย Static IP)
      </div>
    `));

    const chosen = [];
    const doraButtons = [
      { id: 'O', label: 'Offer (เซิร์ฟเวอร์เสนอ IP)' },
      { id: 'A', label: 'Acknowledge (ยืนยันสัญญาเช่า)' },
      { id: 'D', label: 'Discover (ลูกข่ายประกาศหา DHCP)' },
      { id: 'R', label: 'Request (ลูกข่ายตกลงขอใช้ IP)' }
    ];

    const ui = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>🔁 เรียงลำดับขั้นตอน DHCP (คลิกตามลำดับ 1 → 4)</h4>
          <div id="dora-btns" style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;"></div>
          <div style="font-size:13px;background:#f4e5c3;padding:8px;border-radius:5px;border:1.5px solid #8b4a1e;">
            ลำดับที่เลือก: <strong id="dora-seq">(ยังไม่ได้เลือก)</strong>
            <button id="dora-reset" class="wood-btn small-btn" style="float:right;padding:2px 8px;">ล้าง</button>
          </div>
        </div>
        <div class="lab-panel">
          <h4>💧 ตั้งค่า DHCP Pool (/etc/dhcp/dhcpd.conf)</h4>
          <div class="lab-field">
            <label>IP เริ่มต้นแจก (Range Start — แนะนำ 192.168.1.100)</label>
            <input id="l7-start" class="lab-input" value="192.168.1.100" />
          </div>
          <div class="lab-field">
            <label>IP สิ้นสุดการแจก (Range End — แนะนำ 192.168.1.200)</label>
            <input id="l7-end" class="lab-input" value="192.168.1.200" />
          </div>
          <div class="lab-field">
            <label>พอร์ตมาตรฐานของ DHCP Server / Client</label>
            <select id="l7-port" class="lab-select">
              <option value="">-- เลือกพอร์ต --</option>
              <option value="67">UDP 67 / 68</option>
              <option value="80">TCP 80 / 443</option>
            </select>
          </div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const btnWrap = ui.querySelector('#dora-btns');
    const seqEl = ui.querySelector('#dora-seq');
    const renderSeq = () => {
      seqEl.textContent = chosen.length ? chosen.join(' → ') : '(ยังไม่ได้เลือก)';
    };
    doraButtons.forEach((b) => {
      const btn = el(`<button class="wood-btn small-btn" style="text-align:left">${b.label}</button>`);
      btn.onclick = () => {
        if (chosen.includes(b.id)) return;
        SoundFX.click();
        chosen.push(b.id);
        btn.disabled = true;
        btn.style.opacity = '0.55';
        renderSeq();
      };
      btnWrap.appendChild(btn);
    });
    ui.querySelector('#dora-reset').onclick = () => {
      chosen.length = 0;
      btnWrap.querySelectorAll('button').forEach((b) => { b.disabled = false; b.style.opacity = '1'; });
      renderSeq();
    };

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const submit = el(`<button class="wood-btn primary-btn">💧 เปิดบริการ ISC-DHCP Server</button>`);
    submit.onclick = () => {
      const seqOk = chosen.join('') === 'DORA';
      const s = ui.querySelector('#l7-start').value.trim();
      const e = ui.querySelector('#l7-end').value.trim();
      const port = ui.querySelector('#l7-port').value;
      if (seqOk && s === '192.168.1.100' && e === '192.168.1.200' && port === '67') {
        showFeedback(fb, true, '✅ ยอดเยี่ยม! ลำดับ D → O → R → A ถูกต้อง และเครื่องลูกข่ายกำลังได้รับ IP 192.168.1.100–200 อัตโนมัติแล้ว!');
        setTimeout(() => onSuccess(), 900);
      } else {
        showFeedback(fb, false, '❌ ตรวจสอบอีกครั้ง: ลำดับต้องเป็น Discover → Offer → Request → Acknowledge (D-O-R-A), ช่วง IP 192.168.1.100–192.168.1.200 และพอร์ต UDP 67/68');
      }
    };
    container.appendChild(fb);
    container.appendChild(submit);
  }

  // ==================== LAB 8: DNS Server (BIND9 Zone) ====================
  function lab8DNS(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจหน่วยที่ 8 (DNS Server — สมุดโทรศัพท์โดเมน):</strong>
        กำหนดระเบียน DNS Record สำหรับโดเมน <code>valley.local</code> (IP <code>192.168.1.10</code>) และตรวจสอบพอร์ตมาตรฐาน + คำสั่งทดสอบแปลงชื่อโดเมน
      </div>
    `));

    const ui = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>📖 ตั้งค่า Zone File (db.valley.local)</h4>
          <div class="lab-field">
            <label>ระเบียนแปลงชื่อ <code>valley.local</code> เป็น IPv4 (192.168.1.10)</label>
            <select id="l8-a" class="lab-select">
              <option value="">-- เลือกชนิด Record --</option>
              <option value="A">A Record</option>
              <option value="MX">MX Record</option>
              <option value="PTR">PTR Record</option>
            </select>
          </div>
          <div class="lab-field">
            <label>ระเบียนตั้งชื่อนามแฝง (Alias) ให้ <code>www.valley.local</code> ชี้ไปที่ <code>valley.local</code></label>
            <select id="l8-cname" class="lab-select">
              <option value="">-- เลือกชนิด Record --</option>
              <option value="CNAME">CNAME Record</option>
              <option value="NS">NS Record</option>
            </select>
          </div>
          <div class="lab-field">
            <label>ระเบียนสำหรับระบุ Mail Server รับส่งอีเมล</label>
            <select id="l8-mx" class="lab-select">
              <option value="">-- เลือกชนิด Record --</option>
              <option value="MX">MX Record</option>
              <option value="AAAA">AAAA Record</option>
            </select>
          </div>
        </div>
        <div class="lab-panel">
          <h4>🔎 พอร์ตและการทดสอบ DNS</h4>
          <div class="lab-field">
            <label>พอร์ตมาตรฐานของบริการ DNS</label>
            <select id="l8-port" class="lab-select">
              <option value="">-- เลือกพอร์ต --</option>
              <option value="53">Port 53 (UDP/TCP)</option>
              <option value="21">Port 21 (TCP)</option>
            </select>
          </div>
          <div class="lab-field">
            <label>คำสั่งทดสอบแปลงชื่อโดเมนเป็น IP Address</label>
            <select id="l8-cmd" class="lab-select">
              <option value="">-- เลือกคำสั่ง --</option>
              <option value="nslookup">nslookup valley.local (หรือ dig)</option>
              <option value="mkdir">mkdir valley.local</option>
            </select>
          </div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">🗼 รัน named-checkzone และเปิดหอคอย DNS</button>`);
    btn.onclick = () => {
      const ok =
        ui.querySelector('#l8-a').value === 'A' &&
        ui.querySelector('#l8-cname').value === 'CNAME' &&
        ui.querySelector('#l8-mx').value === 'MX' &&
        ui.querySelector('#l8-port').value === '53' &&
        ui.querySelector('#l8-cmd').value === 'nslookup';
      if (ok) {
        showFeedback(fb, true, '✅ หอคอย DNS ออนไลน์แล้ว! nslookup valley.local -> 192.168.1.10 สำเร็จ!');
        setTimeout(() => onSuccess(), 900);
      } else {
        showFeedback(fb, false, '❌ ตรวจสอบอีกครั้ง: IPv4 ใช้ A Record, ชื่อเล่น www ใช้ CNAME, เมลใช้ MX, พอร์ต DNS คือ 53 และทดสอบด้วย nslookup');
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== LAB 9: Web Server & Database (LAMP Stack) ====================
  function lab9WebDB(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจหน่วยที่ 9 (Web Server &amp; Database — LAMP Stack):</strong>
        1) สตาร์ทเซอร์วิส <code>apache2</code> และ <code>mariadb</code> ในแผงควบคุม<br/>
        2) ระบุพอร์ตและโฟลเดอร์เก็บไฟล์เว็บ (Document Root) ให้ถูกต้อง เพื่อเปิดร้านค้าออนไลน์หมู่บ้าน!
      </div>
    `));

    const svc = { apache: false, db: false };

    const ui = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>🚀 แผงควบคุมเซอร์วิส LAMP Stack</h4>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px;">
            <button id="l9-start-web" class="wood-btn">▶ sudo systemctl enable --now apache2</button>
            <button id="l9-start-db" class="wood-btn">▶ sudo systemctl enable --now mariadb</button>
          </div>
          <div id="l9-status" style="font-family:'JetBrains Mono',monospace;font-size:12.5px;background:#111920;color:#ffd166;padding:10px;border-radius:5px;">
apache2.service  : ● INACTIVE (dead)
mariadb.service  : ● INACTIVE (dead)</div>
        </div>
        <div class="lab-panel">
          <h4>🌐 ตรวจสอบพอร์ตและ Document Root</h4>
          <div class="lab-field">
            <label>โฟลเดอร์เริ่มต้นเก็บไฟล์หน้าเว็บ (index.html) ของ Apache บน Ubuntu</label>
            <select id="l9-root" class="lab-select">
              <option value="">-- เลือกโฟลเดอร์ --</option>
              <option value="/var/www/html">/var/www/html</option>
              <option value="/etc/ssh">/etc/ssh</option>
            </select>
          </div>
          <div class="lab-field">
            <label>พอร์ตมาตรฐานของ HTTP / HTTPS</label>
            <select id="l9-webport" class="lab-select">
              <option value="">-- เลือกพอร์ต --</option>
              <option value="80-443">TCP 80 (HTTP) / TCP 443 (HTTPS)</option>
              <option value="22-23">TCP 22 / TCP 23</option>
            </select>
          </div>
          <div class="lab-field">
            <label>พอร์ตมาตรฐานของฐานข้อมูล MySQL / MariaDB</label>
            <select id="l9-dbport" class="lab-select">
              <option value="">-- เลือกพอร์ต --</option>
              <option value="3306">TCP 3306</option>
              <option value="445">TCP 445</option>
            </select>
          </div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const refreshStatus = () => {
      ui.querySelector('#l9-status').innerHTML =
        `apache2.service  : <span style="color:${svc.apache ? '#69f0ae' : '#ff7b7b'}">${svc.apache ? '● ACTIVE (running) — Port 80/443' : '● INACTIVE (dead)'}</span>\n` +
        `mariadb.service  : <span style="color:${svc.db ? '#69f0ae' : '#ff7b7b'}">${svc.db ? '● ACTIVE (running) — Port 3306' : '● INACTIVE (dead)'}</span>`;
    };
    ui.querySelector('#l9-start-web').onclick = () => { SoundFX.pickup(); svc.apache = true; refreshStatus(); };
    ui.querySelector('#l9-start-db').onclick = () => { SoundFX.pickup(); svc.db = true; refreshStatus(); };

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">🛍️ ทดสอบเปิดเว็บ http://valley.local</button>`);
    btn.onclick = () => {
      if (!svc.apache || !svc.db) {
        return showFeedback(fb, false, '❌ อย่าลืมกดปุ่มสตาร์ททั้ง apache2 และ mariadb ด้านซ้ายก่อนนะ!');
      }
      const ok =
        ui.querySelector('#l9-root').value === '/var/www/html' &&
        ui.querySelector('#l9-webport').value === '80-443' &&
        ui.querySelector('#l9-dbport').value === '3306';
      if (ok) {
        showFeedback(fb, true, '✅ HTTP 200 OK! เว็บไซต์ตลาดชุมชน valley.local และฐานข้อมูล MariaDB ออนไลน์สมบูรณ์แล้ว!');
        setTimeout(() => onSuccess(), 900);
      } else {
        showFeedback(fb, false, '❌ ตรวจสอบอีกครั้ง: Apache Document Root คือ /var/www/html, HTTP/HTTPS คือ 80/443 และ MariaDB คือ 3306');
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== LAB 10: File Sharing (Samba & FTP) ====================
  function lab10SambaFTP(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจหน่วยที่ 10 (File &amp; Resource Sharing — Samba &amp; FTP):</strong>
        ช่วยลุงแซมตั้งค่าไฟล์ <code>/etc/samba/smb.conf</code> เพื่อแชร์โฟลเดอร์ <code>/srv/samba/public</code> ให้เครื่อง Windows อ่านและเขียนไฟล์เอกสารได้!
      </div>
    `));

    const ui = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>📁 ตั้งค่า /etc/samba/smb.conf</h4>
          <div class="lab-field">
            <label>บริการที่ทำให้ Linux แชร์โฟลเดอร์ให้ Windows เปิดผ่าน \\\\192.168.1.10\\SharedDocs ได้</label>
            <select id="l10-svc" class="lab-select">
              <option value="">-- เลือกบริการ --</option>
              <option value="samba">Samba (SMB/CIFS — TCP Port 445)</option>
              <option value="dns">BIND9 DNS (Port 53)</option>
            </select>
          </div>
          <div class="lab-field">
            <label>หากต้องการให้ผู้ใช้อ่านและแก้ไข/อัปโหลดไฟล์ได้ด้วย ต้องตั้งค่า <code>read only</code> เป็นอะไร?</label>
            <select id="l10-ro" class="lab-select">
              <option value="">-- เลือกค่า --</option>
              <option value="no">read only = no</option>
              <option value="yes">read only = yes</option>
            </select>
          </div>
          <div class="lab-field">
            <label>คำสั่งตั้งรหัสผ่านให้ผู้ใช้ student เพื่อเข้าใช้งาน Samba Share</label>
            <select id="l10-pwd" class="lab-select">
              <option value="">-- เลือกคำสั่ง --</option>
              <option value="smbpasswd">sudo smbpasswd -a student</option>
              <option value="ping">ping student</option>
            </select>
          </div>
        </div>
        <div class="lab-panel">
          <h4>📦 ความรู้เสริม FTP vs SFTP</h4>
          <div class="lab-field">
            <label>FTP ปกติใช้พอร์ต 21 (ไม่เข้ารหัส) หากต้องการรับส่งไฟล์แบบ <u>เข้ารหัสปลอดภัย</u> ควรใช้โปรโตคอลใด?</label>
            <select id="l10-sftp" class="lab-select">
              <option value="">-- เลือกคำตอบ --</option>
              <option value="sftp">SFTP (ทำงานผ่าน SSH พอร์ต 22)</option>
              <option value="telnet">Telnet (พอร์ต 23)</option>
            </select>
          </div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">📂 รีสตาร์ท Samba (systemctl restart smbd)</button>`);
    btn.onclick = () => {
      const ok =
        ui.querySelector('#l10-svc').value === 'samba' &&
        ui.querySelector('#l10-ro').value === 'no' &&
        ui.querySelector('#l10-pwd').value === 'smbpasswd' &&
        ui.querySelector('#l10-sftp').value === 'sftp';
      if (ok) {
        showFeedback(fb, true, '✅ โกดังแชร์ไฟล์ Samba ออนไลน์แล้ว! เครื่อง Windows ในหมู่บ้านเปิดแชร์ไฟล์ได้ทันที');
        setTimeout(() => onSuccess(), 900);
      } else {
        showFeedback(fb, false, '❌ ตรวจสอบอีกครั้ง: Samba ใช้พอร์ต 445, อ่าน+เขียนได้ใช้ read only = no, ตั้งรหัสด้วย smbpasswd -a และส่งไฟล์เข้ารหัสใช้ SFTP (22)');
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== LAB 11: Final Boss — UFW Firewall Security ====================
  function lab11Firewall(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจสุดท้าย หน่วยที่ 11 (Server Security &amp; UFW Firewall):</strong>
        กำหนดนโยบายเริ่มต้น (Default Incoming) และเลือก <strong>ALLOW</strong> เฉพาะพอร์ตบริการที่หมู่บ้านจำเป็นต้องใช้ พร้อม <strong>DENY</strong> พอร์ตอันตรายและพอร์ตที่ห้ามเปิดสู่ภายนอก!
      </div>
    `));

    const rules = [
      { port: '22/tcp', name: 'SSH (รีโมตแอดมิน)', want: 'allow', choice: 'allow' },
      { port: '80/tcp', name: 'HTTP (เว็บหมู่บ้าน)', want: 'allow', choice: 'allow' },
      { port: '443/tcp', name: 'HTTPS (เว็บเข้ารหัส SSL)', want: 'allow', choice: 'allow' },
      { port: '53', name: 'DNS (แปลงชื่อโดเมน)', want: 'allow', choice: 'allow' },
      { port: '23/tcp', name: 'Telnet (ไม่เข้ารหัส — เสี่ยงโดนดักรหัส!)', want: 'deny', choice: 'allow' },
      { port: '3306/tcp', name: 'MySQL/MariaDB (จากอินเทอร์เน็ตภายนอก)', want: 'deny', choice: 'allow' }
    ];

    const ui = el(`
      <div>
        <div class="lab-panel" style="margin-bottom:10px;">
          <h4>🛡️ นโยบายขาเข้าเริ่มต้น (Default Incoming Policy)</h4>
          <select id="l11-def" class="lab-select">
            <option value="allow">sudo ufw default allow incoming (เปิดรับทุกพอร์ต)</option>
            <option value="deny" selected>sudo ufw default deny incoming (ปิดทั้งหมดก่อน แล้วค่อยเปิดเท่าที่จำเป็น)</option>
          </select>
        </div>
        <div class="lab-panel">
          <h4>🔥 ตั้งกฎกรองพอร์ต UFW (Port Filtering)</h4>
          <div id="l11-rules"></div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const ruleWrap = ui.querySelector('#l11-rules');
    const renderRules = () => {
      ruleWrap.innerHTML = '';
      rules.forEach((r) => {
        const row = el(`
          <div class="fw-rule-row">
            <div><strong>Port ${r.port}</strong> — ${r.name}</div>
            <div class="fw-toggle-group">
              <button class="fw-btn allow ${r.choice === 'allow' ? 'selected' : ''}">ALLOW</button>
              <button class="fw-btn deny ${r.choice === 'deny' ? 'selected' : ''}">DENY</button>
            </div>
          </div>
        `);
        row.querySelector('.allow').onclick = () => { SoundFX.click(); r.choice = 'allow'; renderRules(); };
        row.querySelector('.deny').onclick = () => { SoundFX.click(); r.choice = 'deny'; renderRules(); };
        ruleWrap.appendChild(row);
      });
    };
    renderRules();

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">🛡️ เปิดใช้งานไฟร์วอลล์ (sudo ufw enable)</button>`);
    btn.onclick = () => {
      const def = ui.querySelector('#l11-def').value;
      const wrong = rules.filter((r) => r.choice !== r.want);
      if (def === 'deny' && wrong.length === 0) {
        showFeedback(fb, true, '🎉 UFW Firewall Active! บล็อก Telnet (23) และฐานข้อมูลภายนอก (3306) สำเร็จ พร้อมเปิด SSH, DNS, HTTP/HTTPS อย่างปลอดภัย! หมู่บ้าน Server Valley ออนไลน์ 100%!');
        setTimeout(() => onSuccess(), 1100);
      } else {
        showFeedback(fb, false, '❌ ยังมีช่องโหว่หรือปิดพอร์ตจำเป็น! คำแนะนำ: Default Incoming ต้องเป็น DENY, เปิด ALLOW พอร์ต 22, 80, 443, 53 และสั่ง DENY พอร์ต 23 (Telnet) กับ 3306 (ไม่ควรเปิดฐานข้อมูลสู่ภายนอก)');
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== LAB 12: Windows Server (AD DS, IIS & PowerShell) ====================
  function lab12WindowsServer(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจหน่วยที่ 12 (มินิเกมฝั่ง Windows Server 2022 — AD DS, IIS &amp; PowerShell):</strong>
        1) ตั้งค่า <strong>Active Directory (AD DS)</strong> &amp; <strong>IIS Web Server</strong> ด้านบน<br/>
        2) ทดลองรันคำสั่ง <strong>PowerShell</strong> สีน้ำเงินด้านล่างให้ครบ 3 คำสั่ง: <code>Get-NetIPAddress</code>, <code>Install-WindowsFeature Web-Server</code> และ <code>New-ADUser -Name "Somchai"</code>
      </div>
    `));

    const psState = { ip: false, iis: false, aduser: false };

    const ui = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>🪟 1. Active Directory (AD DS) &amp; Domain Join</h4>
          <div class="lab-field">
            <label>Role ที่ใช้เปลี่ยน Windows Server เป็น Domain Controller คุมบัญชีและ GPO</label>
            <select id="l12-role" class="lab-select">
              <option value="">-- เลือก Server Role --</option>
              <option value="adds">Active Directory Domain Services (AD DS)</option>
              <option value="paint">Print &amp; Document Spooler Only</option>
            </select>
          </div>
          <div class="lab-field">
            <label>ก่อนนำเครื่องลูกข่าย Windows เข้าร่วมโดเมน (Join Domain <code>valley.local</code>) ต้องชี้ DNS ไปที่ใด?</label>
            <select id="l12-dns" class="lab-select">
              <option value="">-- เลือกการตั้งค่า DNS --</option>
              <option value="dc">IP ของเครื่อง Domain Controller (192.168.1.20)</option>
              <option value="none">ไม่ต้องใส่ค่า DNS</option>
            </select>
          </div>
          <div class="lab-field">
            <label>โครงสร้างจัดเก็บผู้ใช้/คอมพิวเตอร์ใน AD เพื่อแยกใช้นโยบาย GPO (เช่น Students_PVC)</label>
            <select id="l12-ou" class="lab-select">
              <option value="">-- เลือกคำตอบ --</option>
              <option value="ou">Organizational Unit (OU)</option>
              <option value="swap">Linux Swap Partition</option>
            </select>
          </div>
        </div>
        <div class="lab-panel">
          <h4>🌐 2. IIS Web Server &amp; โครงสร้าง AD สด</h4>
          <div class="lab-field">
            <label>โฟลเดอร์เริ่มต้น (Document Root) ของ IIS Web Server บน Windows Server</label>
            <select id="l12-iisroot" class="lab-select">
              <option value="">-- เลือกโฟลเดอร์ --</option>
              <option value="inetpub">C:\\inetpub\\wwwroot</option>
              <option value="varwww">/var/www/html</option>
            </select>
          </div>
          <div class="lab-field">
            <label>พอร์ตรีโมตหน้าจอ GUI (Remote Desktop: RDP) ของ Windows Server</label>
            <select id="l12-rdp" class="lab-select">
              <option value="">-- เลือกพอร์ต --</option>
              <option value="3389">TCP Port 3389</option>
              <option value="22">TCP Port 22</option>
            </select>
          </div>
          <div class="ad-tree" id="l12-ad-tree">🌐 Forest: valley.local (DC: WIN-SRV01)
 ├── 📁 OU=Teachers
 ├── 📁 OU=Students_PVC
 │    └── ⏳ (รอสร้าง User ผ่าน PowerShell...)
 └── 🌐 IIS Role: ⏳ รอติดตั้ง...</div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const updateTree = () => {
      ui.querySelector('#l12-ad-tree').textContent =
`🌐 Forest: valley.local (DC: WIN-SRV01 • 192.168.1.20)
 ├── 📁 OU=Teachers
 ├── 📁 OU=Students_PVC
 │    └── ${psState.aduser ? '👤 User: Somchai (Enabled ✅)' : '⏳ (รอสร้าง User ผ่าน PowerShell...)'}
 └── 🌐 IIS Role: ${psState.iis ? 'RUNNING 🟢 (C:\\inetpub\\wwwroot)' : '⏳ รอติดตั้ง...'}`;
    };

    const psTerm = el(`
      <div class="lab-terminal ps-terminal">
        <div class="term-output" id="l12-ps-out">Windows PowerShell (Administrator) — WIN-SRV01
Copyright (C) Server Valley Vocational Lab.
คลิกปุ่มคำสั่งด้านล่าง หรือพิมพ์คำสั่ง PowerShell ให้ครบ 3 คำสั่ง:</div>
        <div class="term-input-row">
          <span class="term-prompt">PS C:\\Administrator&gt;</span>
          <input id="l12-ps-in" class="term-input" placeholder="พิมพ์คำสั่ง PowerShell แล้วกด Enter..." />
          <button id="l12-ps-run" class="wood-btn small-btn primary-btn">Run</button>
        </div>
        <div class="quick-cmd-chips">
          <button class="cmd-chip" data-cmd="Get-NetIPAddress">Get-NetIPAddress</button>
          <button class="cmd-chip" data-cmd="Install-WindowsFeature Web-Server">Install-WindowsFeature Web-Server</button>
          <button class="cmd-chip" data-cmd='New-ADUser -Name "Somchai"'>New-ADUser -Name "Somchai"</button>
          <button class="cmd-chip" data-cmd="gpupdate /force">gpupdate /force</button>
        </div>
      </div>
    `);
    container.appendChild(psTerm);

    const out = psTerm.querySelector('#l12-ps-out');
    const inp = psTerm.querySelector('#l12-ps-in');
    const pushOut = (txt, cls = '') => {
      const d = document.createElement('div');
      d.className = cls;
      d.textContent = txt;
      out.appendChild(d);
      out.scrollTop = out.scrollHeight;
    };

    const runPS = (raw) => {
      const cmd = raw.trim();
      if (!cmd) return;
      SoundFX.click();
      pushOut('PS C:\\Administrator> ' + cmd, 'term-line-cmd');
      const low = cmd.toLowerCase();
      if (low.startsWith('get-netipaddress') || low === 'ipconfig') {
        psState.ip = true;
        pushOut('InterfaceAlias : Ethernet0\nIPAddress      : 192.168.1.20\nPrefixLength   : 24 (Static IP — Domain Controller)', 'term-line-ok');
      } else if (low.includes('install-windowsfeature') && low.includes('web-server')) {
        psState.iis = true;
        pushOut('[oooooooooo 100%] Success: True | Restart Needed: No\n✓ ติดตั้ง IIS Web Server (Web-Server) ที่ C:\\inetpub\\wwwroot สำเร็จ!', 'term-line-ok');
        updateTree();
      } else if (low.startsWith('new-aduser')) {
        psState.aduser = true;
        pushOut('✓ สร้างบัญชี Active Directory User "Somchai" ใน OU=Students_PVC เรียบร้อย!', 'term-line-ok');
        updateTree();
      } else if (low.startsWith('gpupdate')) {
        pushOut('Updating policy...\nComputer Policy update has completed successfully.\nUser Policy update has completed successfully.', 'term-line-info');
      } else {
        pushOut('ลองใช้คำสั่ง: Get-NetIPAddress, Install-WindowsFeature Web-Server หรือ New-ADUser -Name "Somchai"', 'term-line-err');
      }
      inp.value = '';
    };

    psTerm.querySelector('#l12-ps-run').onclick = () => runPS(inp.value);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') runPS(inp.value); });
    psTerm.querySelectorAll('.cmd-chip').forEach((b) => {
      b.onclick = () => runPS(b.dataset.cmd);
    });

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn win-btn">🪟 ยืนยันและเปิดใช้งาน Windows Server 2022 (AD DS + IIS)</button>`);
    btn.onclick = () => {
      const formOk =
        ui.querySelector('#l12-role').value === 'adds' &&
        ui.querySelector('#l12-dns').value === 'dc' &&
        ui.querySelector('#l12-ou').value === 'ou' &&
        ui.querySelector('#l12-iisroot').value === 'inetpub' &&
        ui.querySelector('#l12-rdp').value === '3389';
      if (!formOk) {
        return showFeedback(fb, false, '❌ ตรวจสอบการตั้งค่า AD DS / IIS อีกครั้ง: ใช้ Role AD DS, ชี้ DNS ไปที่ IP Domain Controller, จัดกลุ่มด้วย OU, โฟลเดอร์ IIS คือ C:\\inetpub\\wwwroot และ RDP พอร์ต 3389');
      }
      if (!psState.ip || !psState.iis || !psState.aduser) {
        return showFeedback(fb, false, '❌ กรุณากดรันคำสั่ง PowerShell ด้านบนให้ครบทั้ง 3 คำสั่งก่อนนะ! (Get-NetIPAddress, Install-WindowsFeature Web-Server, New-ADUser)');
      }
      showFeedback(fb, true, '🎉 สำเร็จ! Windows Server 2022 Domain Controller (valley.local), IIS Web Server และบัญชี AD User ออนไลน์พร้อมใช้งานแล้ว!');
      setTimeout(() => onSuccess(), 1000);
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== WEEK 6: Storage & RAID Lab ====================
  function lab6StorageRAID(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจสัปดาห์ที่ 6 (Disk Management &amp; RAID Storage):</strong>
        1) เลือกระดับ <strong>RAID</strong> ให้เหมาะกับความต้องการของแต่ละระบบ<br/>
        2) ทดลองรันคำสั่งตรวจสอบดิสก์ <code>lsblk</code> และ <code>df -h</code> ใน Terminal ด้านล่าง
      </div>
    `));

    const st = { lsblk: false, df: false };

    const ui = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>💾 เลือกระดับ RAID ให้ตรงโจทย์</h4>
          <div class="lab-field">
            <label>มีดิสก์ 2 ลูก ต้องการสำเนาข้อมูลเหมือนกัน (Mirroring) ทนพังได้ 1 ลูก</label>
            <select id="w6-r1" class="lab-select">
              <option value="">-- เลือก RAID --</option>
              <option value="raid0">RAID 0 (Striping)</option>
              <option value="raid1">RAID 1 (Mirroring)</option>
              <option value="raid5">RAID 5 (Parity)</option>
            </select>
          </div>
          <div class="lab-field">
            <label>มีดิสก์ 3 ลูกขึ้นไป ต้องการความคุ้มค่าพื้นที่ + มี Parity ทนพังได้ 1 ลูก</label>
            <select id="w6-r5" class="lab-select">
              <option value="">-- เลือก RAID --</option>
              <option value="raid0">RAID 0</option>
              <option value="raid1">RAID 1</option>
              <option value="raid5">RAID 5 (Parity)</option>
            </select>
          </div>
          <div class="lab-field">
            <label>ไฟล์ใดบน Linux ที่ใช้บันทึกการ Mount ดิสก์ให้อัตโนมัติทุกครั้งที่เปิดเครื่อง?</label>
            <select id="w6-fstab" class="lab-select">
              <option value="">-- เลือกไฟล์ --</option>
              <option value="fstab">/etc/fstab</option>
              <option value="hosts">/etc/hosts</option>
            </select>
          </div>
        </div>
        <div class="lab-panel">
          <h4>🖥️ คอนโซลตรวจดิสก์ (Storage CLI)</h4>
          <div class="lab-terminal">
            <div class="term-output" id="w6-out" style="min-height:105px;">Storage Server Ready — พิมพ์หรือคลิก lsblk และ df -h</div>
            <div class="term-input-row">
              <span class="term-prompt">admin@raid:~$</span>
              <input id="w6-in" class="term-input" placeholder="lsblk หรือ df -h" />
              <button id="w6-run" class="wood-btn small-btn primary-btn">Run</button>
            </div>
            <div class="quick-cmd-chips">
              <button class="cmd-chip" data-cmd="lsblk">lsblk</button>
              <button class="cmd-chip" data-cmd="df -h">df -h</button>
              <button class="cmd-chip" data-cmd="sudo mount /dev/sdb1 /mnt/data">sudo mount /dev/sdb1 /mnt/data</button>
            </div>
          </div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const out = ui.querySelector('#w6-out');
    const inp = ui.querySelector('#w6-in');
    const run = (raw) => {
      const c = raw.trim();
      if (!c) return;
      SoundFX.click();
      out.innerHTML += `\n<span class="term-line-cmd">admin@raid:~$ ${c}</span>`;
      if (c === 'lsblk') {
        st.lsblk = true;
        out.innerHTML += `\n<span class="term-line-ok">sda  50G  disk  (OS Root /)\nsdb  500G disk  ├─sdb1 ext4 /mnt/data (RAID Array Ready)</span>`;
      } else if (c === 'df -h') {
        st.df = true;
        out.innerHTML += `\n<span class="term-line-ok">/dev/sda1  50G  Used 12G  Avail 38G  24% /\n/dev/sdb1 500G  Used 10G Avail 490G   2% /mnt/data</span>`;
      } else if (c.startsWith('sudo mount')) {
        out.innerHTML += `\n<span class="term-line-info">✓ Mounted /dev/sdb1 onto /mnt/data (ext4)</span>`;
      } else {
        out.innerHTML += `\n<span class="term-line-err">ลองคำสั่ง lsblk หรือ df -h</span>`;
      }
      out.scrollTop = out.scrollHeight;
      inp.value = '';
    };
    ui.querySelector('#w6-run').onclick = () => run(inp.value);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(inp.value); });
    ui.querySelectorAll('.cmd-chip').forEach((b) => (b.onclick = () => run(b.dataset.cmd)));

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">💾 ยืนยันระบบดิสก์และ RAID Storage</button>`);
    btn.onclick = () => {
      const ok =
        ui.querySelector('#w6-r1').value === 'raid1' &&
        ui.querySelector('#w6-r5').value === 'raid5' &&
        ui.querySelector('#w6-fstab').value === 'fstab' &&
        st.lsblk && st.df;
      if (ok) {
        showFeedback(fb, true, '✅ โกดังดิสก์ RAID ออนไลน์แล้ว! ข้อมูลปลอดภัยและตั้งค่า /etc/fstab เรียบร้อย');
        setTimeout(() => onSuccess(), 900);
      } else {
        showFeedback(fb, false, '❌ ตรวจสอบอีกครั้ง: Mirror 2 ลูก = RAID 1, 3 ลูกขึ้นไปมี Parity = RAID 5, เมานต์ถาวร = /etc/fstab และรันทั้ง lsblk + df -h ด้วยนะ!');
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== WEEK 10: Systemd & Cron Schedule Builder ====================
  function lab10SystemdCron(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจสัปดาห์ที่ 10 (Systemd Services &amp; Cron Jobs):</strong>
        1) สร้างตารางเวลา <strong>Crontab</strong> ให้สคริปต์สำรองข้อมูลทำงาน <strong>ทุกวัน เวลา 02:00 น. (<code>0 2 * * *</code>)</strong><br/>
        2) เลือกคำสั่ง <code>systemctl</code> และคำสั่งดูโปรเซสให้ถูกต้อง
      </div>
    `));

    const ui = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>⏰ ตัวสร้างตารางงาน Cron (นาที ชั่วโมง วัน เดือน สัปดาห์)</h4>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
            <div class="lab-field">
              <label>นาที (0–59)</label>
              <select id="w10-min" class="lab-select">
                <option value="0">0 (นาทีที่ 00)</option>
                <option value="30">30 (นาทีที่ 30)</option>
                <option value="*/15">*/15 (ทุก 15 นาที)</option>
              </select>
            </div>
            <div class="lab-field">
              <label>ชั่วโมง (0–23)</label>
              <select id="w10-hr" class="lab-select">
                <option value="0">0 (เที่ยงคืน)</option>
                <option value="2">2 (ตีสอง 02:00)</option>
                <option value="12">12 (เที่ยงวัน)</option>
              </select>
            </div>
          </div>
          <div style="margin-top:8px;padding:10px;background:#111920;color:#69f0ae;border-radius:5px;font-family:'JetBrains Mono',monospace;font-size:13px;">
            <div id="w10-cron-preview">0 0 * * * /usr/local/bin/backup.sh</div>
          </div>
        </div>
        <div class="lab-panel">
          <h4>⚙️ คำสั่ง Systemd &amp; Process</h4>
          <div class="lab-field">
            <label>สั่งให้เซอร์วิส apache2 เปิดทำงานทันที <u>และ</u> เปิดอัตโนมัติทุกครั้งที่บูตเครื่อง</label>
            <select id="w10-sys" class="lab-select">
              <option value="">-- เลือกคำสั่ง --</option>
              <option value="enable">sudo systemctl enable --now apache2</option>
              <option value="stop">sudo systemctl stop apache2</option>
            </select>
          </div>
          <div class="lab-field">
            <label>คำสั่งตรวจสอบการใช้งาน CPU / RAM และโปรเซสแบบเรียลไทม์</label>
            <select id="w10-proc" class="lab-select">
              <option value="">-- เลือกคำสั่ง --</option>
              <option value="htop">top หรือ htop</option>
              <option value="mkdir">mkdir -p</option>
            </select>
          </div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const updateCron = () => {
      const m = ui.querySelector('#w10-min').value;
      const h = ui.querySelector('#w10-hr').value;
      ui.querySelector('#w10-cron-preview').textContent = `${m} ${h} * * * /usr/local/bin/backup.sh`;
    };
    ui.querySelector('#w10-min').onchange = updateCron;
    ui.querySelector('#w10-hr').onchange = updateCron;
    updateCron();

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">⏰ บันทึก Crontab และเปิดหอนาฬิกา Systemd</button>`);
    btn.onclick = () => {
      const ok =
        ui.querySelector('#w10-min').value === '0' &&
        ui.querySelector('#w10-hr').value === '2' &&
        ui.querySelector('#w10-sys').value === 'enable' &&
        ui.querySelector('#w10-proc').value === 'htop';
      if (ok) {
        showFeedback(fb, true, '✅ ตั้งเวลา Cron "0 2 * * *" (ทุกวันตี 2) และจัดการ Systemd เรียบร้อยแล้ว!');
        setTimeout(() => onSuccess(), 900);
      } else {
        showFeedback(fb, false, '❌ ตรวจสอบอีกครั้ง: ตี 2 ตรงต้องเลือก นาที=0 ชั่วโมง=2 (0 2 * * *), เปิดอัตโนมัติตอนบูตใช้ systemctl enable --now และดูโปรเซสใช้ top/htop');
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== WEEK 13: Proxy Server & Mail Server ====================
  function lab13ProxyMail(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจสัปดาห์ที่ 13 (Squid Proxy Server &amp; Mail Server):</strong>
        ตั้งค่าพอร์ตและกฎกรองเว็บของ <strong>Squid Proxy</strong> พร้อมจับคู่โปรโตคอลรับ–ส่งอีเมล (<strong>SMTP, IMAP, POP3</strong>) ให้ครบถ้วน!
      </div>
    `));

    const ui = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>🚦 ตั้งค่า Squid Proxy Server (/etc/squid/squid.conf)</h4>
          <div class="lab-field">
            <label>พอร์ตมาตรฐานของ Squid Proxy Server</label>
            <select id="w13-squid" class="lab-select">
              <option value="">-- เลือกพอร์ต --</option>
              <option value="3128">TCP Port 3128</option>
              <option value="22">TCP Port 22</option>
              <option value="53">UDP Port 53</option>
            </select>
          </div>
          <div class="lab-field">
            <label>ต้องการบล็อกกลุ่มเว็บต้องห้าม <code>blocked_sites</code> ใน squid.conf ต้องเขียนคำสั่งใด?</label>
            <select id="w13-acl" class="lab-select">
              <option value="">-- เลือกกฎ ACL --</option>
              <option value="deny">http_access deny blocked_sites</option>
              <option value="allow">http_access allow all</option>
            </select>
          </div>
        </div>
        <div class="lab-panel">
          <h4>✉️ จับคู่โปรโตคอล Mail Server</h4>
          <div class="lab-field">
            <label>โปรโตคอลสำหรับ <u>ส่งอีเมล</u> (Postfix — พอร์ต 25 / 587)</label>
            <select id="w13-smtp" class="lab-select">
              <option value="">-- เลือกโปรโตคอล --</option>
              <option value="smtp">SMTP</option>
              <option value="pop3">POP3</option>
            </select>
          </div>
          <div class="lab-field">
            <label>โปรโตคอลสำหรับ <u>รับอีเมลแบบซิงก์หลายอุปกรณ์</u> เก็บเมลไว้บน Server (พอร์ต 143/993)</label>
            <select id="w13-imap" class="lab-select">
              <option value="">-- เลือกโปรโตคอล --</option>
              <option value="imap">IMAP</option>
              <option value="pop3">POP3 (โหลดลงเครื่องเดียว)</option>
            </select>
          </div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">✉️ เปิดสถานี Proxy &amp; Mail Server</button>`);
    btn.onclick = () => {
      const ok =
        ui.querySelector('#w13-squid').value === '3128' &&
        ui.querySelector('#w13-acl').value === 'deny' &&
        ui.querySelector('#w13-smtp').value === 'smtp' &&
        ui.querySelector('#w13-imap').value === 'imap';
      if (ok) {
        showFeedback(fb, true, '✅ Squid Proxy (3128) และระบบ Mail Server (SMTP/IMAP/POP3) ออนไลน์สมบูรณ์แล้ว!');
        setTimeout(() => onSuccess(), 900);
      } else {
        showFeedback(fb, false, '❌ ตรวจสอบอีกครั้ง: Squid ใช้พอร์ต 3128, บล็อกเว็บใช้ http_access deny, ส่งเมล = SMTP (25), รับเมลซิงก์หลายเครื่อง = IMAP (143)');
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== WEEK 16: Backup & Recovery (3-2-1 Rule, tar & rsync) ====================
  function lab16BackupRecovery(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจสัปดาห์ที่ 16 (Backup Strategy 3-2-1 &amp; Recovery):</strong>
        1) วางแผนการสำรองข้อมูลตาม <strong>กฎ 3-2-1</strong> และเลือกประเภท Backup ให้ถูกต้อง<br/>
        2) ทดลองรันคำสั่ง <code>tar</code> และ <code>rsync</code> ในคอนโซลสำรองข้อมูล
      </div>
    `));

    const st = { tar: false, rsync: false };

    const ui = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>🏦 วางแผนกฎ 3-2-1 &amp; ประเภทการสำรองข้อมูล</h4>
          <div class="lab-field">
            <label>ความหมายของกฎสำรองข้อมูล 3-2-1 ที่ถูกต้อง</label>
            <select id="w16-321" class="lab-select">
              <option value="">-- เลือกคำตอบ --</option>
              <option value="ok">3 สำเนา, 2 ชนิดสื่อจัดเก็บ, 1 ชุดเก็บนอกสถานที่ (Offsite/Cloud)</option>
              <option value="bad">สำรอง 3 ไฟล์ไว้ในโฟลเดอร์เดียวกันบนดิสก์ลูกเดียว</option>
            </select>
          </div>
          <div class="lab-field">
            <label>ประเภท Backup ที่สำรองเฉพาะไฟล์ที่เปลี่ยนจากครั้งล่าสุด (เร็วและประหยัดพื้นที่ที่สุด)</label>
            <select id="w16-inc" class="lab-select">
              <option value="">-- เลือกประเภท --</option>
              <option value="full">Full Backup</option>
              <option value="inc">Incremental Backup</option>
            </select>
          </div>
          <div class="lab-field">
            <label>คำสั่งสำรองฐานข้อมูล MariaDB / MySQL ออกเป็นไฟล์ .sql</label>
            <select id="w16-db" class="lab-select">
              <option value="">-- เลือกคำสั่ง --</option>
              <option value="mysqldump">mysqldump -u root -p college_db &gt; backup.sql</option>
              <option value="rm">rm -rf /var/lib/mysql</option>
            </select>
          </div>
        </div>
        <div class="lab-panel">
          <h4>📦 คอนโซลสำรองข้อมูล (tar &amp; rsync)</h4>
          <div class="lab-terminal">
            <div class="term-output" id="w16-out" style="min-height:105px;">Backup Vault พร้อมทำงาน — คลิกหรือพิมพ์คำสั่ง tar และ rsync ด้านล่าง:</div>
            <div class="term-input-row">
              <span class="term-prompt">admin@vault:~$</span>
              <input id="w16-in" class="term-input" placeholder="tar หรือ rsync..." />
              <button id="w16-run" class="wood-btn small-btn primary-btn">Run</button>
            </div>
            <div class="quick-cmd-chips">
              <button class="cmd-chip" data-cmd="sudo tar -czvf web.tar.gz /var/www/html">tar -czvf web.tar.gz /var/www/html</button>
              <button class="cmd-chip" data-cmd="rsync -avz web.tar.gz admin@192.168.1.50:/backup/">rsync -avz web.tar.gz offsite</button>
            </div>
          </div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const out = ui.querySelector('#w16-out');
    const inp = ui.querySelector('#w16-in');
    const run = (raw) => {
      const c = raw.trim();
      if (!c) return;
      SoundFX.click();
      out.innerHTML += `\n<span class="term-line-cmd">admin@vault:~$ ${c}</span>`;
      if (c.includes('tar')) {
        st.tar = true;
        out.innerHTML += `\n<span class="term-line-ok">✓ บีบอัด /var/www/html -> web.tar.gz (14.2 MB) สำเร็จ!</span>`;
      } else if (c.includes('rsync')) {
        st.rsync = true;
        out.innerHTML += `\n<span class="term-line-ok">✓ ซิงก์ไฟล์สำรองส่งไปยัง Offsite Server (192.168.1.50) สำเร็จ 100%!</span>`;
      } else {
        out.innerHTML += `\n<span class="term-line-err">ลองกดปุ่มคำสั่ง tar และ rsync ด้านล่าง</span>`;
      }
      out.scrollTop = out.scrollHeight;
      inp.value = '';
    };
    ui.querySelector('#w16-run').onclick = () => run(inp.value);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(inp.value); });
    ui.querySelectorAll('.cmd-chip').forEach((b) => (b.onclick = () => run(b.dataset.cmd)));

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">🏦 ยืนยันระบบสำรองข้อมูล 3-2-1</button>`);
    btn.onclick = () => {
      const ok =
        ui.querySelector('#w16-321').value === 'ok' &&
        ui.querySelector('#w16-inc').value === 'inc' &&
        ui.querySelector('#w16-db').value === 'mysqldump' &&
        st.tar && st.rsync;
      if (ok) {
        showFeedback(fb, true, '✅ ธนาคารสำรองข้อมูล 3-2-1 ออนไลน์แล้ว! ข้อมูลปลอดภัยแม้เจอ Ransomware หรือดิสก์เสีย');
        setTimeout(() => onSuccess(), 900);
      } else {
        showFeedback(fb, false, '❌ ตรวจสอบอีกครั้ง: กฎ 3-2-1 = 3 สำเนา/2 สื่อ/1 นอกสถานที่, เร็วสุด = Incremental, สำรอง DB = mysqldump และอย่าลืมรัน tar + rsync!');
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== WEEK 17: Monitoring, Logs & Incident Troubleshooting ====================
  function lab17LogTroubleshoot(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจสัปดาห์ที่ 17 (Log Monitoring &amp; Incident Troubleshooting):</strong>
        อ่านบันทึกเหตุการณ์ (Log) จากหน้าจอฉุกเฉินด้านล่าง แล้ววินิจฉัยวิธีแก้ปัญหาทั้ง 3 เคสให้ถูกต้อง!
      </div>
    `));

    const ui = el(`
      <div>
        <div class="code-block" style="margin-bottom:12px;">[ALERT 1] /var/log/auth.log:
Failed password for root from 203.0.113.88 port 54120 ssh2 (x450 attempts!)

[ALERT 2] Client Report:
"เปิดเว็บ http://192.168.1.10 ได้ปกติ แต่พิมพ์ http://valley.local แล้วขึ้น DNS_PROBE_FINISHED_NXDOMAIN"

[ALERT 3] Server Check:
apache2.service: ACTIVE (running on port 80) | แต่เครื่องอื่นเข้าเว็บไม่ได้ เมื่อตรวจ ufw status พบว่าพอร์ต 80 ยังไม่ได้ Allow!</div>
        <div class="lab-card-grid">
          <div class="lab-panel">
            <h4>🚨 เคส 1: โดนสุ่มรหัส SSH Root รัว ๆ</h4>
            <select id="w17-c1" class="lab-select">
              <option value="">-- เลือกวิธีแก้ --</option>
              <option value="harden">ปิด PermitRootLogin no ใช้ SSH Key และบล็อก IP โจมตี</option>
              <option value="open">เปิด Telnet พอร์ต 23 แทน</option>
            </select>
          </div>
          <div class="lab-panel">
            <h4>🌐 เคส 2: เข้า IP ได้ แต่เข้าชื่อเว็บไม่ได้</h4>
            <select id="w17-c2" class="lab-select">
              <option value="">-- เลือกจุดตรวจสอบ --</option>
              <option value="dns">ตรวจสอบ DNS Server (BIND9) และทดสอบด้วย nslookup</option>
              <option value="mouse">เปลี่ยนเมาส์และคีย์บอร์ดใหม่</option>
            </select>
          </div>
          <div class="lab-panel">
            <h4>🧱 เคส 3: Apache รันอยู่ แต่ภายนอกเข้าไม่ได้</h4>
            <select id="w17-c3" class="lab-select">
              <option value="">-- เลือกคำสั่งแก้ --</option>
              <option value="ufw">เปิดพอร์ตเว็บด้วย sudo ufw allow 80/tcp</option>
              <option value="del">ลบโฟลเดอร์ /var/www/html</option>
            </select>
          </div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">🩺 ยืนยันการวินิจฉัยและปิดเคสทั้ง 3 เหตุการณ์</button>`);
    btn.onclick = () => {
      const ok =
        ui.querySelector('#w17-c1').value === 'harden' &&
        ui.querySelector('#w17-c2').value === 'dns' &&
        ui.querySelector('#w17-c3').value === 'ufw';
      if (ok) {
        showFeedback(fb, true, '✅ ยอดเยี่ยมระดับ Senior Admin! ปิดทั้ง 3 เคสฉุกเฉินและกู้หอตรวจ Log เรียบร้อยแล้ว!');
        setTimeout(() => onSuccess(), 900);
      } else {
        showFeedback(fb, false, '❌ ยังวินิจฉัยไม่ครบทุกเคส: เคส 1 = ปิด Root SSH/ใช้ Key, เคส 2 = ตรวจ DNS/nslookup, เคส 3 = เปิด ufw allow 80/tcp');
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== WEEK 18: Final 18-Week Enterprise Capstone Audit ====================
  function lab18FinalCapstone(container, onSuccess) {
    container.appendChild(el(`
      <div class="lab-brief">
        <strong>ภารกิจสุดท้าย สัปดาห์ที่ 18 (Final 18-Week Enterprise Server Audit):</strong>
        ผอ.เซิร์ฟเวอร์ขอให้คุณตรวจรับรองระบบเครือข่ายทั้งหมดของหมู่บ้าน (Linux + Windows + Security + Backup) เพื่อจบหลักสูตร 18 สัปดาห์อย่างสมบูรณ์!
      </div>
    `));

    const ui = el(`
      <div class="lab-card-grid">
        <div class="lab-panel">
          <h4>🔑 1. ตรวจเช็กพอร์ตทองคำ (Golden Ports)</h4>
          <div class="lab-field">
            <label>คู่พอร์ต SSH / DNS / HTTPS / Samba เรียงตามลำดับ</label>
            <select id="w18-p1" class="lab-select">
              <option value="">-- เลือกชุดพอร์ตที่ถูกต้อง --</option>
              <option value="ok">22 / 53 / 443 / 445</option>
              <option value="bad">23 / 80 / 3306 / 21</option>
            </select>
          </div>
          <div class="lab-field">
            <label>คู่พอร์ต Squid Proxy / MySQL / Windows RDP เรียงตามลำดับ</label>
            <select id="w18-p2" class="lab-select">
              <option value="">-- เลือกชุดพอร์ตที่ถูกต้อง --</option>
              <option value="ok">3128 / 3306 / 3389</option>
              <option value="bad">67 / 25 / 110</option>
            </select>
          </div>
        </div>
        <div class="lab-panel">
          <h4>🏛️ 2. ตรวจรับรองความมั่นคงและดูแลระบบ</h4>
          <div class="lab-field">
            <label>คำสั่งตรวจพอร์ตที่เปิดฟังอยู่ทั้งหมดบน Linux Server สมัยใหม่</label>
            <select id="w18-ss" class="lab-select">
              <option value="">-- เลือกคำสั่ง --</option>
              <option value="ss">sudo ss -tulnp</option>
              <option value="cd">cd /tmp</option>
            </select>
          </div>
          <div class="lab-field">
            <label>ลำดับวงจรการดูแลระบบเครื่องแม่ข่ายมืออาชีพครบทั้ง 18 สัปดาห์</label>
            <select id="w18-life" class="lab-select">
              <option value="">-- เลือกลำดับ --</option>
              <option value="ok">วางแผน (VM/OS) → ติดตั้งบริการ → ล็อก Firewall → สำรอง 3-2-1 → เฝ้าระวัง Log</option>
              <option value="bad">เปิดทุกพอร์ตทิ้งไว้ ไม่ต้องสำรองข้อมูล และไม่ดู Log</option>
            </select>
          </div>
        </div>
      </div>
    `);
    container.appendChild(ui);

    const fb = el(`<div class="lab-feedback hidden"></div>`);
    const btn = el(`<button class="wood-btn primary-btn">🏆 อนุมัติ Final Audit — จบหลักสูตร 18 สัปดาห์ 100%!</button>`);
    btn.onclick = () => {
      const ok =
        ui.querySelector('#w18-p1').value === 'ok' &&
        ui.querySelector('#w18-p2').value === 'ok' &&
        ui.querySelector('#w18-ss').value === 'ss' &&
        ui.querySelector('#w18-life').value === 'ok';
      if (ok) {
        showFeedback(fb, true, '🎉🏆 ผ่าน Final Capstone Audit 100%! ขอแสดงความยินดีกับการจบหลักสูตร 18 สัปดาห์ Server Valley (ปวช.)!');
        setTimeout(() => onSuccess(), 1100);
      } else {
        showFeedback(fb, false, '❌ ตรวจสอบอีกครั้ง: SSH=22/DNS=53/HTTPS=443/Samba=445, Squid=3128/MySQL=3306/RDP=3389 และคำสั่งตรวจพอร์ตคือ sudo ss -tulnp');
      }
    };
    container.appendChild(fb);
    container.appendChild(btn);
  }

  // ==================== MASTER QUIZ (Comprehensive 18-Week Exam) ====================
  function renderMasterQuiz(container, onFinish) {
    container.innerHTML = '';
    const bank = window.MASTER_QUIZ_BANK;
    let idx = 0;
    let score = 0;

    const wrap = el(`<div class="lab-panel"></div>`);
    container.appendChild(wrap);

    function showQ() {
      if (idx >= bank.length) {
        const pct = Math.round((score / bank.length) * 100);
        wrap.innerHTML = `
          <div style="text-align:center;padding:16px;">
            <h3>🏆 สรุปผลแบบทดสอบรวม (รายวิชาระบบปฏิบัติการเครื่องแม่ข่ายเบื้องต้น ปวช.)</h3>
            <p style="font-size:28px;font-weight:700;color:#1b6e3c;margin:10px 0;">${score} / ${bank.length} คะแนน (${pct}%)</p>
            <p style="margin-bottom:16px;">${pct >= 80 ? 'ยอดเยี่ยมระดับแอดมินมืออาชีพ! พร้อมสอบปลายภาค ปวช. แน่นอน!' : 'เก่งมาก! ลองเปิดคลังเนื้อหา (B) ทบทวนจุดที่ยังไม่แม่นแล้วมาลองใหม่ได้นะ'}</p>
            <button id="mq-done" class="wood-btn primary-btn">รับรางวัลและปิดหน้าต่าง</button>
          </div>
        `;
        wrap.querySelector('#mq-done').onclick = () => onFinish(score, bank.length);
        return;
      }
      const item = bank[idx];
      wrap.innerHTML = `
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;color:#6e4526;">
          <span>ข้อที่ ${idx + 1} / ${bank.length}</span>
          <span>คะแนนสะสม: ${score}</span>
        </div>
        <h4 style="font-size:17px;margin-bottom:12px;">${item.q}</h4>
        <div id="mq-opts" style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;"></div>
        <div id="mq-fb" class="lab-feedback hidden"></div>
        <button id="mq-next" class="wood-btn primary-btn hidden" style="margin-top:10px;">ข้อถัดไป ▶</button>
      `;
      const opts = wrap.querySelector('#mq-opts');
      const fb = wrap.querySelector('#mq-fb');
      const nextBtn = wrap.querySelector('#mq-next');

      item.options.forEach((opt, oi) => {
        const b = el(`<button class="wood-btn" style="text-align:left">${opt}</button>`);
        b.onclick = () => {
          opts.querySelectorAll('button').forEach((x) => (x.disabled = true));
          if (oi === item.answer) {
            score++;
            showFeedback(fb, true, `✅ ถูกต้อง! ${item.explain}`);
          } else {
            showFeedback(fb, false, `❌ ยังไม่ถูก — คำตอบที่ถูกคือ "${item.options[item.answer]}" (${item.explain})`);
          }
          nextBtn.classList.remove('hidden');
        };
        opts.appendChild(b);
      });
      nextBtn.onclick = () => {
        idx++;
        showQ();
      };
    }

    showQ();
  }

  return {
    renderLab,
    renderMasterQuiz
  };
})();
