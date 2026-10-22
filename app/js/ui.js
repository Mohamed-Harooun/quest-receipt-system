// الشاشات فقط: بتعرض وبتنادي على customers / print
(function () {
  var U = App.util, root = document.getElementById('app'), C = App.customers;
  var FIELDS = [
    ['name', 'الاسم'], ['phone', 'التليفون'], ['address', 'العنوان'], ['area', 'المنطقة'],
    ['agent', 'المندوب'], ['acknowledger', 'المقر بما فيه'], ['items', 'اسم المنتج'],
    ['total', 'الإجمالي', 'number'], ['down', 'المقدم', 'number'],
    ['months', 'عدد الأشهر', 'number'], ['start', 'تاريخ أول قسط', 'date']
  ];
  var ui = App.ui = {};

  var rowsHTML = function (q) {
    return C.search(q).map(function (c) {
      return '<tr><td><b>' + c.id + '</b></td><td>' + U.esc(c.name) + '</td><td>' + U.esc(c.phone) + '</td><td>' + U.money(App.installments.remaining(c)) +
        '</td><td><button data-a="open" data-id="' + c.id + '" class="btn-secondary">فتح</button></td></tr>';
    }).join('') || '<tr><td colspan="5" class="empty">لا يوجد عملاء مطابقين للبحث</td></tr>';
  };
  // تحديث صفوف الجدول فقط (عشان حقل البحث ميفقدش الفوكس)
  ui.rows = function (q) { document.getElementById('rows').innerHTML = rowsHTML(q); };

  ui.list = function (q) {
    var rows = rowsHTML(q);
    root.innerHTML = '<h1>نظام الأقساط</h1><div class="bar"><input id="q" placeholder="بحث بالاسم / الرقم / التليفون..." value="' + U.esc(q) + '">' +
      '<button data-a="new">+ عميل جديد</button><button data-a="backup" class="btn-secondary">نسخة احتياطية</button>' +
      '<label class="btn btn-secondary">استعادة<input type="file" id="imp" hidden></label></div>' +
      '<div class="table-card"><table><thead><tr><th>#</th><th>الاسم</th><th>التليفون</th><th>المتبقي</th><th></th></tr></thead><tbody id="rows">' + rows + '</tbody></table></div>' +
      (window.desktop ? '<p class="hint" dir="ltr">Data: ' + U.esc(window.desktop.dir()) + '</p>' : '');
  };

  ui.form = function (id) {
    var c = id ? C.get(id) : { months: 12, start: new Date().toISOString().slice(0, 10) };
    root.innerHTML = '<div class="top-bar"><button data-a="list" class="btn-back" title="رجوع">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M13 5l7 7-7 7"/></svg>' +
      '<span>رجوع</span></button></div>' +
      '<h1>' + (id ? 'تعديل عميل' : 'عميل جديد') + '</h1><div class="card"><form data-id="' + (id || '') + '" class="form">' +
      FIELDS.map(function (f) {
        var isFull = f[0] === 'items';
        return '<label' + (isFull ? ' class="full-width"' : '') + '>' + f[1] + '<input name="' + f[0] + '" type="' + (f[2] || 'text') + '" value="' + U.esc(c[f[0]]) + '"' +
          (['name', 'total', 'months', 'start'].indexOf(f[0]) > -1 ? ' required' : '') + '></label>';
      }).join('') + '<div class="bar"><button>حفظ</button><button type="button" data-a="list" class="btn-secondary">إلغاء</button></div></form></div>';
  };

  ui.detail = function (id, balance) {
    var c = C.get(id);
    var rows = App.installments.all(c).map(function (i) {
      var isDown = i.kind === 'down';
      return '<tr class="' + (i.paid ? 'paid' : '') + '"><td>' + (isDown ? 'مقدم' : i.no) + '</td><td>' + (i.due ? U.date(i.due) : '—') + '</td>' +
        '<td id="amt-' + i.no + '">' + U.money(i.amount) + '</td>' +
        '<td><input type="checkbox" data-a="pay" data-n="' + i.no + '"' + (i.paid ? ' checked' : '') + '></td>' +
        '<td><div class="actions-cell">' +
          '<button data-a="edit-inst" data-n="' + i.no + '" class="btn-secondary">تعديل</button>' +
          (isDown ? '' : '<button data-a="print-one" data-n="' + i.no + '" class="btn-secondary">طباعة</button>') +
        '</div></td></tr>';
    }).join('');

    var warningBar = '';
    if (balance !== undefined && balance !== 0) {
      var absDiff = Math.abs(balance);
      var msg = balance > 0
        ? 'مجموع الوصولات أقل من المطلوب بـ ' + U.money(absDiff) + ' — وزّع هذا الفرق على أحد الوصولات'
        : 'مجموع الوصولات أكثر من المطلوب بـ ' + U.money(absDiff) + ' — قلّص هذا المبلغ من أحد الوصولات';
      warningBar = '<div class="warning-bar"><span class="warning-icon">⚠️</span><span>' + msg + '</span></div>';
    }

    root.dataset.id = id;
    root.innerHTML = '<div class="top-bar"><button data-a="list" class="btn-back" title="رجوع">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M13 5l7 7-7 7"/></svg>' +
      '<span>رجوع</span></button></div>' +
      '<h1>' + U.esc(c.name) + ' <span class="badge">#' + c.id + '</span></h1>' +
      '<div class="summary-bar"><span>الإجمالي: <b>' + U.money(c.total) + '</b></span> <span class="sep">•</span> <span>المقدم: <b>' + U.money(c.down) + '</b></span> <span class="sep">•</span> <span>المتبقي: <b class="rem">' + U.money(App.installments.remaining(c)) + '</b></span></div>' +
      warningBar +
      '<div class="bar"><button data-a="print-all">طباعة كل الوصولات</button><button data-a="print-paid" class="btn-secondary">طباعة المدفوع</button><button data-a="print-unpaid" class="btn-secondary">طباعة غير المدفوع</button>' +
      '<button data-a="edit" class="btn-secondary">تعديل</button><button data-a="delete" class="danger">حذف</button></div>' +
      '<div class="table-card"><table><thead><tr><th>#</th><th>الاستحقاق</th><th>المبلغ</th><th>مدفوع</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  };
})();
