// قالب الوصل (نسخة طبق الأصل من الوصل المطبوع) + تقسيمه 3 في الصفحة
App.print = {
  receipt: function (c, i) {
    var U = App.util, C = App.config, d = (i.due || '').split('-');
    var line = function (label, v) {
      return '<div class="f"><b>' + label + '</b><span class="line">' + U.esc(v) + '</span></div>';
    };
    var cell = function (label, v) {
      return '<div class="lr"><div class="lc">' + label + '</div><div class="vc">' + U.esc(v) + '</div></div>';
    };
    var amount = Number(i.amount).toLocaleString('en-US');
    var downAmt = c.down > 0 ? Number(c.down).toLocaleString('en-US') : '';
    return '<div class="receipt">' +
      '<div class="r-top">' +
        '<div class="grp"><p class="slogan">نحن لا ندعي التميز ولكننا نسعى إليه</p>' +
          '<div class="lbox">' + cell('المنطقة', c.area) + cell('رقم العميل', c.id) + '</div></div>' +
        '<div class="mini"><div>' + i.no + '</div><div>' + c.months + '</div></div>' +
        '<div class="title"><h2>' + U.esc(C.company) + '</h2><p>' + U.esc(C.tagline) + '</p></div>' +
        '<div class="grp"><p class="slogan">لسنا مقلدون ولكننا الوحيدون</p>' +
          '<div class="lbox">' + cell('مقدم', downAmt) + cell('قسط', amount) + '</div></div>' +
      '</div>' +
      '<div class="frame">' +
        '<div class="two"><div>' + line('الاسم :', c.name) + line('العنوان / منزل :', c.address) + line('العمل :', c.work) + '</div>' +
        '<div>' + line('التليفون :', c.phone) + line('البطاقة ش/ع :', c.nationalId) + line('الوظيفة :', c.job) + '</div></div>' +
        line('اسم المنتج :', c.items) +
        '<div class="txt"><span>بموجب هذه الكمبيالة أتعهد أنا بأن أدفع مبلغ</span><span class="amt">' + amount + '</span>' +
        '<span>جنيه فقط وقدره :</span><span class="line grow"></span><span>لا غير</span></div>' +
        '<div class="txt">في تاريخ &nbsp;<b class="dt">' + (d.length === 3 ? d[2] + ' / ' + d[1] + ' / ' + d[0] : '&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;') + '</b>&nbsp; علما بأن القيمة وصلتنا بضاعة والدفع والتقاضي وفقا لإدارة الدائن وللدائن الحق في</div>' +
        '<div class="txt">تحويل هذه الكمبيالة لمن يشاء بدون توقف على رضائي</div>' +
        (function () {
          var ack = c.acknowledger || '';
          var ackClass = '';
          if (ack.length > 55) ackClass = ' ack-xxlong';
          else if (ack.length > 40) ackClass = ' ack-xlong';
          else if (ack.length > 25) ackClass = ' ack-long';
          return '<div class="txt sign"><span>تحريرا في : &nbsp;&nbsp; / &nbsp;&nbsp; / &nbsp;&nbsp; 20</span>' +
            '<span>المندوب (</span><span class="line sign-agent-line">' + U.esc(c.agent) + '</span><span>)</span>' +
            '<span>المقر بما فيه (</span><span class="line sign-ack-line' + ackClass + '" title="' + U.esc(ack) + '">' + U.esc(ack) + '</span><span>)</span></div>';
        })() +
      '</div>' +
      '<div class="r-foot"><span>تنبيه (الرجاء الاحتفاظ بالإيصال)</span><b dir="ltr">' + U.esc(C.phone) + '</b></div>' +
    '</div>';
  },
  getFontSize: function () {
    try { return localStorage.getItem('qest.receipt.fontSize') || '9.5pt'; }
    catch (e) { return '9.5pt'; }
  },
  setFontSize: function (size) {
    document.documentElement.style.setProperty('--receipt-data-size', size);
    try { localStorage.setItem('qest.receipt.fontSize', size); } catch (e) {}
  },
  // معاينة قبل الطباعة: تعرض الصفحات زي ما هتتطبع، والطباعة من زرار "طباعة"
  run: function (c, insts) {
    if (!insts.length) { alert('لا توجد أقساط للطباعة'); return; }
    var n = App.config.receiptsPerPage, pages = [];
    for (var k = 0; k < insts.length; k += n) {
      pages.push('<section class="sheet">' + insts.slice(k, k + n).map(function (i) { return App.print.receipt(c, i); }).join('<div class="cut-line"><span>✂</span></div>') + '</section>');
    }
    this.html = pages.join('');
    var curSize = this.getFontSize();
    this.setFontSize(curSize);

    var sizes = [
      { val: '8pt', label: 'صغير جداً (8pt)' },
      { val: '8.5pt', label: 'صغير (8.5pt)' },
      { val: '9.5pt', label: 'افتراضي (9.5pt)' },
      { val: '10.5pt', label: 'متوسط (10.5pt)' },
      { val: '11.5pt', label: 'كبير (11.5pt)' },
      { val: '12.5pt', label: 'كبير جداً (12.5pt)' },
      { val: '13.5pt', label: 'ضخم (13.5pt)' }
    ];
    var optionsHTML = sizes.map(function (s) {
      return '<option value="' + s.val + '"' + (s.val === curSize ? ' selected' : '') + '>' + s.label + '</option>';
    }).join('');
    var selectHTML = '<label class="pv-control"><span>حجم الخط:</span><select id="pv-font-size">' + optionsHTML + '</select></label>';

    var box = this._box();
    box.innerHTML = '<div class="pv-bar">' +
      '<button data-p="go">طباعة</button>' +
      '<button data-p="close" class="gray">إلغاء</button>' +
      selectHTML +
      '<span class="pv-info">' + insts.length + ' وصل - ' + pages.length + ' صفحة</span>' +
      '</div><div class="pv-pages">' + this.html + '</div>';
    box.hidden = false;
    box.scrollTop = 0;
  },
  _box: function () {
    var box = document.getElementById('preview');
    if (box) return box;
    box = document.createElement('div');
    box.id = 'preview'; box.hidden = true;
    document.body.appendChild(box);
    box.addEventListener('click', function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-p');
      if (a === 'close') box.hidden = true;
      if (a === 'go') {
        App.print.setFontSize(App.print.getFontSize());
        document.getElementById('print-area').innerHTML = App.print.html;
        window.print();
      }
    });
    box.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'pv-font-size') {
        App.print.setFontSize(e.target.value);
      }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') box.hidden = true; });
    return box;
  }
};
// تطبيق الحجم المحفوظ عند بدء التشغيل
App.print.setFontSize(App.print.getFontSize());
