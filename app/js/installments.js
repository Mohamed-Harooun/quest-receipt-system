// منطق الأقساط فقط (بدون DOM)
App.installments = {
  addMonths: function (iso, n) {
    var p = iso.split('-').map(Number), y = p[0], m = p[1] - 1 + n, d = p[2];
    y += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
    d = Math.min(d, new Date(y, m + 1, 0).getDate());
    return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  },
  // آخر قسط بياخد الكسور عشان المجموع يطلع مظبوط
  build: function (c, oldList) {
    var rest = c.total - c.down, each = Math.floor(rest / c.months), list = [];
    for (var i = 0; i < c.months; i++) {
      list.push({
        no: i + 1,
        due: this.addMonths(c.start, i),
        amount: i === c.months - 1 ? rest - each * (c.months - 1) : each,
        paid: !!(oldList && oldList[i] && oldList[i].paid)
      });
    }
    return list;
  },
  // وصل المقدم: بيتعامل كأنه قسط رقم 0 (kind = down)
  down: function (c) { return c.down > 0 ? { no: 0, kind: 'down', amount: c.down, paid: c.downPaid !== undefined ? !!c.downPaid : true } : null; },
  all: function (c) { var d = this.down(c); return (d ? [d] : []).concat(c.installments); },
  get: function (c, n) { return n === 0 ? this.down(c) : c.installments[n - 1]; },
  remaining: function (c) {
    return this.all(c).reduce(function (s, x) { return s + (x.paid ? 0 : x.amount); }, 0);
  }
};
