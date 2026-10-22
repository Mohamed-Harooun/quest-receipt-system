// Repository: كل عمليات العملاء (إضافة/تعديل/حذف/بحث)
App.customers = {
  list: App.storage.load(),
  _save: function () { App.storage.save(this.list); },
  get: function (id) { return this.list.filter(function (c) { return c.id === id; })[0]; },
  search: function (q) {
    q = (q || '').trim();
    return this.list.filter(function (c) {
      return !q || c.name.indexOf(q) > -1 || String(c.id) === q || (c.phone || '').indexOf(q) > -1;
    });
  },
  save: function (data) {           // data.id موجود = تعديل
    var old = data.id ? this.get(data.id) : null, S = App.installments;
    if (old) {
      var same = ['total', 'down', 'months', 'start'].every(function (k) { return old[k] === data[k]; });
      data.installments = same ? old.installments : S.build(data, old.installments);
      data.downPaid = old.downPaid !== undefined ? old.downPaid : true;
      this.list[this.list.indexOf(old)] = data;
    } else {
      data.id = this.list.reduce(function (m, c) { return Math.max(m, c.id); }, 0) + 1;
      data.installments = S.build(data);
      data.downPaid = true;
      this.list.push(data);
    }
    this._save(); return data.id;
  },
  remove: function (id) { this.list = this.list.filter(function (c) { return c.id !== id; }); this._save(); },
  setPaid: function (id, no, paid) {
    var c = this.get(id);
    if (no === 0) c.downPaid = paid; else c.installments[no - 1].paid = paid;
    this._save();
  },
  // رسالة الخطأ لو البيانات غلط، أو null لو سليمة
  validate: function (d) {
    var max = App.config.maxMonths;
    if (!(d.total > 0)) return 'الإجمالي لازم يكون أكبر من صفر';
    if (d.total % 1 || d.down % 1) return 'المبالغ لازم تكون أرقام صحيحة بدون كسور';
    if (d.down < 0 || d.down >= d.total) return 'المقدم لازم يكون صفر أو أكتر، وأقل من الإجمالي';
    if (d.months % 1 || d.months < 1 || d.months > max) return 'عدد الأشهر لازم يكون رقم صحيح من 1 إلى ' + max;
    if (d.total - d.down < d.months) return 'المتبقي بعد المقدم أقل من عدد الأشهر';
    if (!d.start) return 'اختار تاريخ أول قسط';
    return null;
  },
  updateInstallment: function (id, no, newAmount) {
    var c = this.get(id);
    if (!c) return;
    newAmount = Number(newAmount) || 0;
    if (no === 0) {
      c.down = newAmount;
    } else if (c.installments && c.installments[no - 1]) {
      c.installments[no - 1].amount = newAmount;
    }
    this._save();
  },
  // يرجع الفرق: موجب = ناقص، سالب = زيادة، صفر = تمام
  checkBalance: function (id) {
    var c = this.get(id);
    if (!c) return 0;
    var instSum = (c.installments || []).reduce(function (s, i) { return s + i.amount; }, 0);
    return c.total - c.down - instSum;
  },
  isValidBackup: function (a) {
    return Array.isArray(a) && a.every(function (c) {
      return c && typeof c.id === 'number' && typeof c.name === 'string' && Array.isArray(c.installments) &&
        c.installments.every(function (i) {
          return typeof i.no === 'number' && typeof i.amount === 'number' && /^\d{4}-\d{2}-\d{2}$/.test(i.due);
        });
    });
  },
  replaceAll: function (arr) { this.list = arr; this._save(); }
};
