App.util = {
  esc: function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  },
  // يحوّل الأرقام العربية/الفارسية لإنجليزية ويشيل المسافات
  digits: function (s) {
    return String(s || '').replace(/[\u0660-\u0669]/g, function (d) { return d.charCodeAt(0) - 0x660; })
      .replace(/[\u06F0-\u06F9]/g, function (d) { return d.charCodeAt(0) - 0x6F0; }).replace(/\s/g, '');
  },
  money: function (n) { return Number(n || 0).toLocaleString('en-US') + ' ' + App.config.currency; },
  date: function (iso) { var p = iso.split('-'); return p[2] + ' / ' + p[1] + ' / ' + p[0]; }
};
