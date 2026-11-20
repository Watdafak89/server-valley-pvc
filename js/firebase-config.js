// ตั้งค่า Firebase Realtime Database สำหรับห้องเรียนขนาดใหญ่ (รองรับ 40–100 คนพร้อมกันบน GitHub Pages!)
// เชื่อมต่อกับโปรเจกต์ server-valley-pvc (Singapore asia-southeast1) เรียบร้อยแล้ว!
window.SERVER_VALLEY_FIREBASE = {
  databaseURL: 'https://server-valley-pvc-default-rtdb.asia-southeast1.firebasedatabase.app',

  // ชื่อห้องเรียนเริ่มต้นสำหรับนักเรียน (ปรับแก้ได้ตามห้องเรียน เช่น 'PVC2569')
  defaultRoom: 'CLASS1',

  // เข้าห้องเรียนใหญ่ 40–100 คนให้อัตโนมัติทันทีที่นักเรียนกดเริ่มเกม!
  autoJoinOnStart: true
};
