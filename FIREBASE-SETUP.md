# ☁️ คู่มือเปิดห้องเรียนใหญ่ 40–100 คนบน GitHub Pages (Firebase ฟรีใน 2 นาที)

**Firebase Realtime Database (แผน Spark ฟรี 100%)** รองรับผู้เล่นออนไลน์พร้อมกันสูงสุด **100 คนในห้องเดียว** ทำงานผ่าน HTTPS พอร์ต 443 ลื่นไหลไม่หน่วงเครื่องครู และใช้ร่วมกับ **GitHub Pages** ได้อย่างสมบูรณ์

---

## ขั้นตอนที่ 1: สร้าง Firebase Realtime Database ฟรี
1. เข้าเว็บ [https://console.firebase.google.com/](https://console.firebase.google.com/) แล้วล็อกอินด้วยบัญชี Google
2. กด **Create a project (สร้างโปรเจกต์)** → ตั้งชื่อ เช่น `server-valley-pvc` → ปิด Google Analytics ก็ได้ → กด **Create project**
3. เมนูด้านซ้ายเลือก **Build → Realtime Database** → กด **Create Database**
4. เลือกโซนเซิร์ฟเวอร์ใกล้ไทย: **Singapore (`asia-southeast1`)** → เลือก **Start in test mode** → กด **Enable**
5. คัดลอก **Database URL** ด้านบน (หน้าตาประมาณนี้):
   ```
   https://server-valley-pvc-default-rtdb.asia-southeast1.firebasedatabase.app
   ```

---

## ขั้นตอนที่ 2: ตั้งค่ากฎความปลอดภัย (Rules) ให้ปลอดภัยสำหรับห้องเรียน
ในหน้า Realtime Database ไปที่แท็บ **Rules** แล้ววางกฎนี้แทนของเดิม จากนั้นกด **Publish** (กฎนี้เปิดให้เข้าได้เฉพาะโหนดห้องเกม `sv_rooms` เท่านั้น และไม่หมดอายุใน 30 วัน):

```json
{
  "rules": {
    "sv_rooms": {
      "$room": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

---

## ขั้นตอนที่ 3: เชื่อมกับเกมบน GitHub Pages (เลือกได้ 2 วิธี)

### วิธี A: ฝังถาวรในโค้ด (แนะนำที่สุด — นักเรียนเข้าลิงก์เดียวเชื่อมต่อออโต้เลย!)
1. เปิดไฟล์ `js/firebase-config.js`
2. วาง Database URL ของคุณลงไป:
   ```js
   window.SERVER_VALLEY_FIREBASE = {
     databaseURL: 'https://server-valley-pvc-default-rtdb.asia-southeast1.firebasedatabase.app',
     defaultRoom: 'CLASS1',
     autoJoinOnStart: true
   };
   ```
3. อัปโหลดขึ้น GitHub แล้วเปิด **Settings → Pages**
4. ส่งลิงก์ `https://ชื่อผู้ใช้.github.io/ชื่อโปรเจกต์/` ให้นักเรียนทั้ง 40–100 คน → พิมพ์ชื่อแล้วกดเริ่มเกมจะเข้าห้องเดียวกันทันที!

### วิธี B: กรอกในเกมแล้วส่งลิงก์เชิญ (ไม่ต้องแก้ไฟล์โค้ดเลย)
1. ครูเปิดเกมบน GitHub Pages → กดปุ่ม **👥 เพื่อน/ครู**
2. วาง **Firebase Database URL** + ตั้งชื่อห้อง (เช่น `PVC21`) → กด **☁️ เข้าห้องเรียนใหญ่ (40–100 คน)**
3. กดปุ่ม **🔗 คัดลอกลิงก์ชวนนักเรียนทั้งห้อง** แล้วส่งเข้ากลุ่ม LINE / Google Classroom
4. นักเรียนคลิกลิงก์นั้น ใส่ชื่อ แล้วกดเริ่มเกม → เข้าห้อง 40–100 คนอัตโนมัติ!
