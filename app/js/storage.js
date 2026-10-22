// طبقة التخزين الوحيدة. لو عايزين نغيرها لـ IndexedDB أو سيرفر نعدل هنا بس.
App.storage = {
  load: function () {
    if (window.desktop) return window.desktop.load();
    try { return JSON.parse(localStorage.getItem(App.config.storageKey)) || []; }
    catch (e) { return []; }
  },
  save: function (list) {
    if (window.desktop) return window.desktop.save(list);
    localStorage.setItem(App.config.storageKey, JSON.stringify(list));
  },
  exportFile: function (list) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(list)], { type: 'application/json' }));
    a.download = 'backup-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
  },
  importFile: function (file, done, fail) {
    var r = new FileReader();
    r.onload = function () { var d; try { d = JSON.parse(r.result); } catch (e) { return fail(); } done(d); };
    r.readAsText(file);
  }
};
