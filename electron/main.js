// العملية الرئيسية: التخزين في ملف على الهارد + نسخة احتياطية يومية تلقائية
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const fs = require('fs');
const path = require('path');

if (!app.requestSingleInstanceLock()) app.quit();   // نسخة واحدة بس مفتوحة (عشان الملف ميتكتبش من اتنين)

const dir = path.join(app.getPath('documents'), 'QestData');
const file = path.join(dir, 'data.json');
const backups = path.join(dir, 'backups');
const KEEP_BACKUPS = 30;

const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

function load() {
  fs.mkdirSync(backups, { recursive: true });
  try { if (fs.existsSync(file)) return readJSON(file); } catch (e) { /* ملف تالف: نجرب النسخ */ }
  const names = fs.readdirSync(backups).filter((n) => n.endsWith('.json')).sort().reverse();
  for (const n of names) { try { return readJSON(path.join(backups, n)); } catch (e) {} }
  return [];
}

function dailyBackup() {
  const dest = path.join(backups, 'data-' + new Date().toISOString().slice(0, 10) + '.json');
  if (fs.existsSync(file) && !fs.existsSync(dest)) fs.copyFileSync(file, dest);
  fs.readdirSync(backups).filter((n) => n.endsWith('.json')).sort().reverse()
    .slice(KEEP_BACKUPS).forEach((n) => fs.unlinkSync(path.join(backups, n)));
}

function save(list) {
  fs.mkdirSync(backups, { recursive: true });
  dailyBackup();                               // قبل أول تعديل في اليوم
  fs.writeFileSync(file + '.tmp', JSON.stringify(list));
  fs.renameSync(file + '.tmp', file);          // كتابة آمنة: مفيش ملف نص مكتوب
}

app.whenReady().then(() => {
  ipcMain.on('data:load', (e) => { e.returnValue = load(); });
  ipcMain.on('data:save', (e, list) => { save(list); e.returnValue = true; });
  ipcMain.on('data:dir', (e) => { e.returnValue = dir; });
  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({
    width: 1100, height: 800, title: 'نظام الأقساط',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  win.loadFile(path.join(__dirname, '..', 'app', 'index.html'));
});
app.on('window-all-closed', () => app.quit());
