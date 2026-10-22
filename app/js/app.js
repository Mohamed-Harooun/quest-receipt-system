// نقطة البداية: ربط الأحداث بالـ ui والـ customers
(function () {
  var root = document.getElementById('app'), C = App.customers, ui = App.ui;
  var cur = function () { return Number(root.dataset.id); };

  var actions = {
    list: function () { ui.list(''); },
    new: function () { ui.form(); },
    open: function (e) { ui.detail(Number(e.dataset.id)); },
    edit: function () { ui.form(cur()); },
    backup: function () { App.storage.exportFile(C.list); },
    delete: function () { if (confirm('حذف العميل نهائياً؟')) { C.remove(cur()); ui.list(''); } },
    pay: function (e) { C.setPaid(cur(), Number(e.dataset.n), e.checked); ui.detail(cur()); },
    'print-one': function (e) {
      var c = C.get(cur());
      var n = Number(e.dataset.n);
      if (n > 0 && c.installments[n - 1]) App.print.run(c, [c.installments[n - 1]]);
    },
    'print-all': function () { var c = C.get(cur()); App.print.run(c, c.installments); },
    'print-paid': function () { var c = C.get(cur()); App.print.run(c, c.installments.filter(function (i) { return i.paid; })); },
    'print-unpaid': function () { var c = C.get(cur()); App.print.run(c, c.installments.filter(function (i) { return !i.paid; })); },
    'edit-inst': function (e) {
      var no = Number(e.dataset.n);
      var c = C.get(cur());
      var inst = no === 0 ? { amount: c.down } : c.installments[no - 1];
      var cell = document.getElementById('amt-' + no);
      if (!cell) return;
      cell.innerHTML = '<div class="edit-amt-box">' +
        '<input type="number" id="input-amt-' + no + '" value="' + inst.amount + '" class="input-amt" step="1">' +
        '<button data-a="save-inst" data-n="' + no + '" class="btn-sm">حفظ</button>' +
        '<button data-a="cancel-inst" data-n="' + no + '" class="btn-sm btn-secondary">إلغاء</button>' +
        '</div>';
      var inp = document.getElementById('input-amt-' + no);
      if (inp) {
        inp.focus();
        inp.select();
        inp.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            actions['save-inst']({ dataset: { n: no } });
          } else if (ev.key === 'Escape') {
            ui.detail(cur());
          }
        });
      }
    },
    'save-inst': function (e) {
      var no = Number(e.dataset.n);
      var inp = document.getElementById('input-amt-' + no);
      if (!inp) return;
      var val = Number(inp.value);
      if (isNaN(val) || val <= 0) return alert('أدخل مبلغ صحيح — المبلغ لازم يكون أكبر من صفر');
      if (val % 1 !== 0) return alert('المبلغ لازم يكون رقم صحيح بدون كسور');
      C.updateInstallment(cur(), no, val);
      ui.detail(cur(), C.checkBalance(cur()));
    },
    'cancel-inst': function () {
      ui.detail(cur());
    }
  };

  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-a]');
    if (t && t.type !== 'checkbox' && actions[t.dataset.a]) actions[t.dataset.a](t);
  });
  root.addEventListener('change', function (e) {
    if (e.target.dataset.a === 'pay') actions.pay(e.target);
    if (e.target.id === 'imp') App.storage.importFile(e.target.files[0], function (d) {
      if (!C.isValidBackup(d)) return alert('الملف ده مش نسخة احتياطية صالحة');
      if (!confirm('سيتم استبدال كل البيانات الحالية بـ ' + d.length + ' عميل. متأكد؟')) return;
      C.replaceAll(d); ui.list('');
    }, function () { alert('الملف تالف أو مش بصيغة JSON'); });
    if (e.target.id === 'imp') e.target.value = '';
  });
  root.addEventListener('input', function (e) { if (e.target.id === 'q') ui.rows(e.target.value); });
  root.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = {}, f = e.target;
    Array.prototype.forEach.call(f.elements, function (x) {
      if (x.name) d[x.name] = x.type === 'number' ? Number(x.value) : x.value;
    });
    if (d.nationalId) d.nationalId = App.util.digits(d.nationalId);
    if (f.dataset.id) d.id = Number(f.dataset.id);
    var err = C.validate(d);
    if (err) return alert(err);
    ui.detail(C.save(d));
  });

  ui.list('');
})();
