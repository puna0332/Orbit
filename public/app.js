/* =========================================================================
   Orbit — static SPA (no build step), localStorage-backed demo data.
   Pairs with D:\Orbit.v2 mockups (Lớp 0/1/2) and description.md.
   ========================================================================= */
(function () {
  'use strict';

  var STORAGE_KEY = 'orbit_state_v1';

  /* Bộ icon thật tách từ sheet element người dùng cấp (assets/icons/*.png) */
  function ic(name, size) {
    return '<img class="ic-img" src="assets/icons/' + name + '.png" alt="" width="' + size + '" height="' + size + '">';
  }
  var ICONS = { birthday: 'cake', trip: 'plane', memory: 'leaf', meeting: 'people', work: 'calendar', workshop: 'sun', custom: 'calendar' };
  /* Khung event (ô icon nền pastel) tách từ sheet "elements chung 1" — mục 2 chỉ giữ
     các loại là SỰ KIỆN, bỏ nhóm tính năng (ảnh, video, nhạc, thời tiết, đồng bộ...). */
  var EVENT_TILE = { birthday: 'birthday', trip: 'trip', memory: 'memory', meeting: 'family', work: 'work', workshop: 'study', custom: 'goal' };
  function evTile(kind, size) {
    var name = EVENT_TILE[kind] || EVENT_TILE.custom;
    return '<img class="ev-tile" src="assets/events/' + name + '.png" alt="" width="' + size + '" height="' + size + '">';
  }
  var TONE = { birthday: 'tone-pink', trip: 'tone-blue', memory: 'tone-green', meeting: 'tone-purple', work: 'tone-orange', workshop: 'tone-blue', custom: 'tone-purple' };
  var TONE_DOT = { 'tone-pink': '#B5505E', 'tone-blue': '#3D63A8', 'tone-green': '#3E7A4C', 'tone-purple': '#6A50B0', 'tone-orange': '#B6702A', 'tone-peach': '#C2764A', 'tone-mint': '#3E8A72', 'tone-lilac': '#6B5DB8', 'tone-slate': '#4A6076', 'tone-cream': '#8A7A66' };

  /* Bộ 10 icon sự kiện của app (tách từ element sheet) */
  var EVENT_CATS = [
    { k: 'birthday', label: 'Sinh nhật', img: 'ev-01-birthday.png', tone: 'tone-pink' },
    { k: 'memory',   label: 'Kỷ niệm & Hẹn hò', img: 'ev-02-memory.png', tone: 'tone-green' },
    { k: 'family',   label: 'Gia đình', img: 'ev-03-family.png', tone: 'tone-peach' },
    { k: 'friends',  label: 'Tụ tập & Bạn bè', img: 'ev-04-friends.png', tone: 'tone-orange' },
    { k: 'trip',     label: 'Đi ăn & Đi chơi', img: 'ev-05-trip.png', tone: 'tone-blue' },
    { k: 'fun',      label: 'Giải trí', img: 'ev-06-fun.png', tone: 'tone-purple' },
    { k: 'health',   label: 'Tập luyện & Sức khỏe', img: 'ev-07-health.png', tone: 'tone-mint' },
    { k: 'study',    label: 'Học tập & Deadline', img: 'ev-08-study.png', tone: 'tone-lilac' },
    { k: 'work',     label: 'Công việc', img: 'ev-09-work.png', tone: 'tone-slate' },
    { k: 'other',    label: 'Khác', img: 'ev-10-other.png', tone: 'tone-cream' }
  ];
  var EV_BY_KEY = {};
  EVENT_CATS.forEach(function (c) { EV_BY_KEY[c.k] = c; });
  // Loại cũ (meeting/workshop/custom) vẫn dùng icon riêng cho tới khi người dùng đổi
  var LEGACY_EV = { meeting: 'ev-04-friends.png', workshop: 'ev-08-study.png', custom: 'ev-10-other.png' };
  function evIcon(kind, size) {
    var c = EV_BY_KEY[kind];
    var src = c ? c.img : (LEGACY_EV[kind] || 'ev-10-other.png');
    return '<img class="ev-ic" src="assets/event-icons/' + src + '" alt="" width="' + size + '" height="' + size + '">';
  }
  function evTone(kind) {
    var c = EV_BY_KEY[kind];
    return c ? c.tone : (TONE[kind] || 'tone-cream');
  }
  // Ảnh mây pastel thật (10 màu) dùng làm nền thẻ dịp sắp tới trên Home
  var CLOUD_IMG = {
    'tone-pink': 'cloud-02-rose.png', 'tone-purple': 'cloud-04-lavender.png',
    'tone-blue': 'cloud-05-skyblue.png', 'tone-green': 'cloud-07-mint.png',
    'tone-orange': 'cloud-01-peach.png', 'tone-peach': 'cloud-01-peach.png',
    'tone-mint': 'cloud-07-mint.png', 'tone-lilac': 'cloud-06-lilac.png',
    'tone-slate': 'cloud-09-powderblue.png', 'tone-cream': 'cloud-03-cream.png'
  };
  function cloudImg(tone) { return CLOUD_IMG[tone] || 'cloud-01-peach.png'; }
  /* 5 nhóm quan hệ. Muốn thêm loại mới chỉ cần thêm một dòng ở đây — form thêm
     người, bộ lọc và Cài đặt -> Quỹ đạo đều đọc chung danh sách này. */
  var REL_TYPES = [
    { k: 'family', label: 'Gia đình' },
    { k: 'love', label: 'Tình yêu' },
    { k: 'friend', label: 'Bạn bè' },
    { k: 'acquaintance', label: 'Người quen' },
    { k: 'other', label: 'Khác' }
  ];
  var REL_LABEL = (function () {
    var m = {};
    REL_TYPES.forEach(function (r) { m[r.k] = r.label; });
    m.soulmate = 'Tình yêu'; m.closefriend = 'Bạn bè'; m.coworker = 'Người quen';   // dữ liệu cũ
    return m;
  })();
  var REL_MIGRATE = { soulmate: 'love', closefriend: 'friend', coworker: 'acquaintance' };
  /* Viền avatar trên quỹ đạo, phân biệt bằng màu theo mối quan hệ */
  var REL_RING = {
    family: '#E2A275',
    love: '#D985A5',
    friend: '#88ADD5',
    acquaintance: '#94B9A0',
    other: '#B4A0C9'
  };
  function ringColor(rel) { return REL_RING[rel] || REL_RING.other; }
  /* Icon thanh điều khiển quỹ đạo: SVG nét mảnh, cùng độ dày nét với bộ icon
     trong app (thay cho ký tự +, −, ⊙, Ⅱ, ⟲ vốn mảnh và lệch tông). */
  function svgIcon(paths, size) {
    var s = size || 18;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  var ORBIT_IC = {
    plus: '<path d="M12 5.5v13M5.5 12h13"/>',
    minus: '<path d="M5.5 12h13"/>',
    target: '<circle cx="12" cy="12" r="7.4"/><circle cx="12" cy="12" r="2.3"/>',
    pause: '<path d="M9.4 6.2v11.6M14.6 6.2v11.6" stroke-width="2.6"/>',
    play: '<path d="M9.2 5.9 18.4 12 9.2 18.1z" fill="currentColor" stroke="none"/>',
    reset: '<path d="M19.6 12a7.6 7.6 0 1 1-2.5-5.6"/><path d="M19.8 4.4v4.3h-4.3"/>'
  };
  var PRIORITIES = [
    { k: 'highest', label: 'Cao nhất' },
    { k: 'high', label: 'Cao' },
    { k: 'medium', label: 'Trung bình' },
    { k: 'low', label: 'Thấp' }
  ];
  var DEFAULT_PRIORITY = { family: 'highest', love: 'high', friend: 'medium', acquaintance: 'low', other: 'low' };
  function defaultSettings() {
    return {
      theme: 'light', aiEnabled: true, reminderDefaultTime: '09:00', profileName: 'Bạn',
      gender: 'female',   /* 'female' = chủ đề kem/hồng, 'male' = xanh nước biển */
      relationPriority: JSON.parse(JSON.stringify(DEFAULT_PRIORITY)), groups: [],
      homeOccasions: true, homeSuggest: true, homeSuggestHidden: false,
      diaryCoverTheme: 'sky'
    };
  }
  /* Các bộ khung nền (bìa) cho trang Nhật ký — chọn trong Cài đặt › Bìa nhật ký */
  /* `sheet` = khung TRANG GIẤY nằm lọt trong lòng cuốn sổ đang mở (đơn vị % so với khung
     ảnh bìa). Đây là chỗ đặt tờ giấy để viết — không phải phủ lên cả cuốn sổ. Bản desktop
     và mobile là hai bản cắt khác nhau nên mỗi bên có bộ số riêng. */
  var DIARY_THEMES = [
    { id: 'sky', label: 'Trời đêm xanh', shortLabel: 'Trời xanh', swatch: '#AFC9E8',
      desktop: 'assets/diary/cover-desktop-cut.png', mobile: 'assets/diary/cover-mobile-cut.png',
      sheet: { desktop: { l: 7.7, t: 4.0, r: 6.0, b: 10.1 }, mobile: { l: 12.5, t: 3.6, r: 6.4, b: 7.6 } } },
    { id: 'coast', label: 'Biển hoàng hôn', shortLabel: 'Biển hoàng hôn', swatch: '#E0943A',
      desktop: 'assets/diary/cover-coast-desktop-cut.png', mobile: 'assets/diary/cover-coast-mobile-cut.png',
      sheet: { desktop: { l: 7.7, t: 4.0, r: 6.0, b: 10.1 }, mobile: { l: 12.5, t: 3.6, r: 6.4, b: 7.6 } } },
    { id: 'meadow', label: 'Đồng cỏ xanh', shortLabel: 'Đồng cỏ', swatch: '#6FA050',
      desktop: 'assets/diary/cover-meadow-desktop-cut.png', mobile: 'assets/diary/cover-meadow-mobile-cut.png',
      sheet: { desktop: { l: 7.7, t: 4.0, r: 6.0, b: 10.1 }, mobile: { l: 12.5, t: 3.6, r: 6.4, b: 7.6 } } },
    { id: 'forest', label: 'Núi rừng hoàng hôn', shortLabel: 'Núi rừng', swatch: '#3F6B8C',
      desktop: 'assets/diary/cover-forest-desktop-cut.png', mobile: 'assets/diary/cover-forest-mobile-cut.png',
      sheet: { desktop: { l: 7.7, t: 4.0, r: 6.0, b: 10.1 }, mobile: { l: 12.5, t: 3.6, r: 6.4, b: 7.6 } } },
    { id: 'sunset', label: 'Hoàng hôn hồng', shortLabel: 'Hoàng hôn', swatch: '#F0B9C7',
      desktop: 'assets/diary/cover-sunset-desktop-cut.png', mobile: 'assets/diary/cover-sunset-mobile-cut.png',
      sheet: { desktop: { l: 7.7, t: 4.0, r: 6.0, b: 10.1 }, mobile: { l: 12.5, t: 3.6, r: 6.4, b: 7.6 } } }
  ];
  /* Khung trang giấy của bìa đang dùng, theo khung nhìn hiện tại */
  function sheetRect(theme) {
    var wide = (window.innerWidth || 1024) >= 900;
    var s = theme && theme.sheet;
    if (!s) return { l: 7.7, t: 4.0, r: 6.0, b: 10.1 };
    return (wide ? s.desktop : s.mobile) || s.desktop;
  }
  /* Kiểu chữ cho trang viết — xếp font CÓ ĐỦ glyph tiếng Việt lên trước: một số font
     (vd Georgia) thiếu glyph "ế/ộ…" nên trình duyệt phải mượn font khác cho từng dấu,
     chữ bị hở ra như "Viế t". */
  var DIARY_FONTS = [
    { id: 'serif', label: 'Có chân', css: 'Cambria, "Noto Serif", "Times New Roman", Georgia, serif' },
    { id: 'hand', label: 'Viết tay', css: '"Segoe Script", "Bradley Hand", "Comic Sans MS", cursive' },
    { id: 'sans', label: 'Không chân', css: '"Segoe UI", system-ui, Roboto, sans-serif' },
    { id: 'mono', label: 'Máy chữ', css: 'Consolas, "Courier New", ui-monospace, monospace' }
  ];
  function fontCss(id) {
    var f = DIARY_FONTS.find(function (x) { return x.id === id; });
    return f ? f.css : DIARY_FONTS[0].css;
  }
  /* Ngày kiểu thư: "Ngày 30 tháng 10 năm 2026" */
  function letterDate(iso) {
    var d = iso ? new Date(iso + 'T00:00:00') : new Date();
    if (isNaN(d.getTime())) d = new Date();
    return 'Ngày ' + d.getDate() + ' tháng ' + (d.getMonth() + 1) + ' năm ' + d.getFullYear();
  }

  function getDiaryTheme() {
    var cur = (state.settings && state.settings.diaryCoverTheme) || 'sky';
    return DIARY_THEMES.find(function (t) { return t.id === cur; }) || DIARY_THEMES[0];
  }

  /* ---------------------------- Mẫu giấy viết nhật ký ----------------------------
     QUAN TRỌNG — mọi kích thước ở đây là PHẦN TRĂM, không phải px:
       box  : lề khung chữ (t/r/b/l theo % bề rộng/chiều cao tờ giấy)
       top  : khoảng cách từ mép trên tờ giấy tới ĐƯỜNG KẺ ĐẦU TIÊN (% chiều cao)
       gap  : khoảng cách giữa hai đường kẻ (% chiều cao)
       size : cỡ chữ (% bề rộng tờ giấy)
     Nhờ vậy cùng một bài viết, khi render ở khung ngang (máy tính) hay khung dọc
     (điện thoại) đều ra đúng tỉ lệ — nội dung lưu dạng CHỮ, không lưu ảnh đã vẽ,
     nên không bao giờ bị "khoá cứng" theo một hướng giấy nào.
     snap = false: giấy không dòng, chữ chảy tự do. */
  var PAPER_BUILTINS = [
    { id: 'paper-blank', label: 'Giấy trắng', kind: 'blank', snap: false,
      box: { t: 9, r: 8, b: 9, l: 10 }, top: 7.8, gap: 5.0, size: 3.1, ink: '#3D342D', ar: 0.7071 },
    { id: 'paper-rule', label: 'Giấy kẻ dòng', kind: 'rule', snap: true,
      box: { t: 7, r: 8, b: 8, l: 10 }, top: 7.4, gap: 5.0, size: 3.1, ink: '#3D342D', ar: 0.7071 },
    { id: 'paper-dot', label: 'Giấy chấm', kind: 'dot', snap: true,
      box: { t: 7, r: 8, b: 8, l: 10 }, top: 7.4, gap: 5.0, size: 3.1, ink: '#3D342D', ar: 0.7071 }
  ];
  function allPapers() {
    return PAPER_BUILTINS.concat((state.papers || []).map(function (p) {
      return Object.assign({ custom: true, kind: 'image', snap: p.snap !== false }, p);
    }));
  }
  function getPaper(id) {
    var list = allPapers();
    return list.find(function (p) { return p.id === id; }) || PAPER_BUILTINS[1];
  }
  /* Ảnh giấy hiển thị theo khung nhìn: máy tính dùng bản ngang, điện thoại bản dọc.
     Nếu người dùng chỉ upload một ảnh thì cả hai dùng chung ảnh đó. */
  function paperImg(p) {
    var wide = (window.innerWidth || 1024) >= 900;
    if (!p.img) return '';
    return (wide ? (p.img.desktop || p.img.mobile) : (p.img.mobile || p.img.desktop)) || '';
  }
  /* Tỉ lệ tờ giấy cũng phải theo từng bản ảnh: bản dọc cho điện thoại, bản ngang cho
     máy tính — hai ảnh có thể khác tỉ lệ nên không dùng chung một con số được. */
  function paperAr(p) {
    var a = p && p.ar;
    if (typeof a === 'number' && a > 0) return a;
    if (a && typeof a === 'object') {
      var wide = (window.innerWidth || 1024) >= 900;
      var v = wide ? (a.desktop || a.mobile) : (a.mobile || a.desktop);
      if (v > 0) return v;
    }
    return 0.7071;
  }
  var AVATAR_COLORS = ['#E8A6B4', '#8CB4E0', '#8FCB9B', '#C6A6E8', '#F0B870', '#7FB8B0', '#E08C7D', '#9E9EDB'];
  var DOW = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'];

  var ONBOARD_SLIDES = [
    { title: 'Lưu giữ những điều ta trân trọng', sub: 'Cho những khoảnh khắc không muốn phải quên đi', primary: 'Bắt đầu', showSkip: true },
    { title: 'Không bỏ lỡ dịp nào', sub: 'Orbit nhắc bạn trước những ngày sinh nhật, kỷ niệm quan trọng', primary: 'Tiếp tục',
      shot: 'assets/shots/shot-events.jpg', shotAlt: 'Trang Sự kiện với lịch tháng và các dịp sắp tới' },
    { title: 'Giữ kết nối qua Orbit', sub: 'Sắp xếp người thân, bạn bè theo mức độ gắn bó của riêng bạn', primary: 'Tiếp tục',
      shot: 'assets/shots/shot-people.jpg', shotAlt: 'Trang Mọi người với sơ đồ quỹ đạo và danh sách liên kết' },
    { title: 'Sẵn sàng bắt đầu?', sub: 'Thêm người đầu tiên của bạn và để Orbit lo phần còn lại', primary: 'Vào ứng dụng',
      shot: 'assets/shots/shot-profile.jpg', shotAlt: 'Trang cá nhân với ảnh bìa, các thẻ nhật ký và quỹ đạo' }
  ];

  /* ---------------------------- utils ---------------------------- */
  function uid(prefix) { return prefix + '_' + Math.random().toString(36).slice(2, 9); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function todayISO() { var d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function toISO(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function toMMDD(d) { return pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function addDays(base, days) {
    var d = typeof base === 'string' ? new Date(base + 'T00:00:00') : new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  }
  function daysBetween(aISO, bISO) {
    var a = new Date(aISO + 'T00:00:00'), b = new Date(bISO + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  }
  function nextBirthdayISO(mmdd, todayIso) {
    var parts = mmdd.split('-'); var mm = Number(parts[0]), dd = Number(parts[1]);
    var today = new Date(todayIso + 'T00:00:00');
    var year = today.getFullYear();
    var cand = new Date(year, mm - 1, dd);
    if (cand < today) { year += 1; cand = new Date(year, mm - 1, dd); }
    return toISO(cand);
  }
  function formatMMDD(mmdd) { var p = mmdd.split('-'); return Number(p[1]) + ' tháng ' + Number(p[0]); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function hashStr(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return Math.abs(h); }
  function avatarColor(id) { return AVATAR_COLORS[hashStr(id) % AVATAR_COLORS.length]; }
  function initials(name) {
    var parts = name.trim().split(/\s+/);
    return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  }
  function dotColor(tone) { return TONE_DOT[tone] || '#999'; }
  function timeAgo(iso) {
    var diff = Date.now() - new Date(iso).getTime();
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'vừa xong';
    if (mins < 60) return mins + ' phút trước';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + ' giờ trước';
    return Math.floor(hrs / 24) + ' ngày trước';
  }

  /* ---------------------------- data model ---------------------------- */
  /* Bỏ "mức độ thân thiết": thứ tự trong một nhóm giờ do mức ưu tiên của nhóm
     quan hệ + dấu ★ quyết định, nên không còn trường closeness nữa. Tham số cũ
     vẫn nhận cho tương thích với các lời gọi cũ nhưng không lưu vào dữ liệu. */
  function mkPerson(name, rel, _closeness, favorite, birthdayMMDD, sinceYear, quote, notes) {
    return {
      id: uid('p'), name: name, relationship: rel, favorite: !!favorite,
      birthday: birthdayMMDD || '', since: sinceYear || null, quote: quote || '', notes: notes || '',
      memories: [], favoriteTag: false,
      reminders: birthdayMMDD ? [{ id: uid('rm'), label: 'Sinh nhật', mmdd: birthdayMMDD, enabled: true }] : [],
      activity: [{ id: uid('ac'), text: 'Đã thêm vào Orbit', at: new Date().toISOString() }]
    };
  }
  function mkEvent(title, type, date) { return { id: uid('ev'), title: title, type: type, date: date, location: '' }; }

  function seedState() {
    /* Bản gốc có 8 nhân vật mẫu (Linh, Bố, Mẹ, Minh, Trân, Lan, Quân, Hà) để demo.
       Người dùng muốn tự phân loại lại nên cài mới giờ bắt đầu trắng. */
    var st = emptyState();
    st.onboardingDone = false;
    return st;
  }
  function seedStateLegacy() {
    var today = todayISO();
    var mmddPlus = function (days) { return toMMDD(addDays(today, days)); };
    var isoPlus = function (days) { return toISO(addDays(today, days)); };

    var people = [
      mkPerson('Linh', 'friend', 1, true, mmddPlus(15), 2021, 'Luôn ở đây, cùng nhau lớn lên qua thật nhiều mùa. ✨', 'Linh thích matcha, mèo, và những chuyến đi biển...'),
      mkPerson('Bố', 'family', 1, false, mmddPlus(120), null, '', ''),
      mkPerson('Mẹ', 'family', 1, false, mmddPlus(200), null, '', ''),
      mkPerson('Minh', 'friend', 2, false, mmddPlus(75), 2019, '', ''),
      mkPerson('Trân', 'friend', 2, false, mmddPlus(250), 2020, '', ''),
      mkPerson('Lan', 'friend', 3, false, mmddPlus(300), 2022, '', ''),
      mkPerson('Quân', 'coworker', 3, false, mmddPlus(170), null, '', ''),
      mkPerson('Hà', 'coworker', 3, false, mmddPlus(140), null, '', '')
    ];
    // gán sẵn avatar từ bộ element cho dữ liệu demo (người dùng vẫn đổi được)
    var demoAvatars = { 'Linh': 'av-01', 'Bố': 'av-07', 'Mẹ': 'av-16', 'Minh': 'av-09',
                        'Trân': 'av-13', 'Lan': 'av-02', 'Quân': 'av-08', 'Hà': 'av-03' };
    people.forEach(function (p) { if (demoAvatars[p.name]) p.avatar = demoAvatars[p.name]; });

    people[0].memories = [
      { id: uid('mm'), caption: 'Hoàng hôn', color: '#E8A6B4' },
      { id: uid('mm'), caption: 'Sóng biển', color: '#8CB4E0' },
      { id: uid('mm'), caption: 'Cà phê', color: '#8FCB9B' }
    ];

    var events = [
      mkEvent('Chuyến đi', 'trip', isoPlus(30)),
      mkEvent('Họp nhóm', 'meeting', isoPlus(75)),
      mkEvent('Làm proposal', 'work', isoPlus(90)),
      mkEvent('Workshop kỹ năng', 'workshop', isoPlus(110)),
      mkEvent('Team building', 'meeting', isoPlus(130))
    ];
    events.push({ id: uid('ev'), title: 'Một kỷ niệm', type: 'memory', annMMDD: toMMDD(new Date()), personId: people[0].id });

    return {
      onboardingDone: false,
      onboardingSlide: 0,
      people: people,
      events: events,
      settings: defaultSettings()
    };
  }
  function emptyState(keepSettings) {
    return {
      onboardingDone: true, onboardingSlide: 0, people: [], events: [], diaries: [], papers: [],
      settings: keepSettings || defaultSettings()
    };
  }

  var state = loadState();
  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        // Luôn quay về Lớp 0 (onboarding) mỗi lần mở lại app — dữ liệu người/sự
        // kiện/ghi chú vẫn giữ nguyên, chỉ riêng tiến trình onboarding reset mỗi phiên.
        if (!(localStorage.getItem('orbit_token') || sessionStorage.getItem('orbit_token'))) {
          parsed.onboardingDone = false;
          parsed.onboardingSlide = 0;
        }
        // Thiết kế gốc là giao diện SÁNG. Theme 'system' khiến máy đang dark-mode
        // hiển thị nền đen, lệch hẳn mockup -> migrate sang 'light'; chỉ tối khi user tự chọn.
        if (parsed.settings && parsed.settings.theme === 'system') parsed.settings.theme = 'light';
        if (!parsed.settings) parsed.settings = defaultSettings();
        var st = parsed.settings;
        if (!st.relationPriority) st.relationPriority = JSON.parse(JSON.stringify(DEFAULT_PRIORITY));
        if (!Array.isArray(parsed.people)) parsed.people = [];
        if (!Array.isArray(parsed.events)) parsed.events = [];
        if (!Array.isArray(parsed.diaries)) parsed.diaries = [];
        if (!Array.isArray(parsed.papers)) parsed.papers = [];
        if (!Array.isArray(st.groups)) st.groups = [];
        if (typeof st.homeOccasions !== 'boolean') st.homeOccasions = true;
        if (st.gender !== 'male' && st.gender !== 'female') st.gender = 'female';
        if (typeof st.homeSuggest !== 'boolean') st.homeSuggest = true;
        if (typeof st.homeSuggestHidden !== 'boolean') st.homeSuggestHidden = false;
        (parsed.people || []).forEach(function (p) {
          if (REL_MIGRATE[p.relationship]) p.relationship = REL_MIGRATE[p.relationship];
          if (!REL_LABEL[p.relationship]) p.relationship = 'other';
          if (!Array.isArray(p.groups)) p.groups = [];
          if ('closeness' in p) delete p.closeness;
        });
        return parsed;
      }
    } catch (e) { /* ignore corrupt storage */ }
    var s = seedState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    return s;
  }
  /* ---------------------- Tài khoản & đồng bộ máy chủ ----------------------
     - Token phiên lưu ở localStorage; gửi kèm header Bearer.
     - Mọi thay đổi `state` được đẩy lên D1 sau 900ms (gộp nhiều lần lưu).
     - Chưa đăng nhập thì app vẫn chạy như cũ, chỉ dùng localStorage. */
  function readToken() {
    return localStorage.getItem('orbit_token') || sessionStorage.getItem('orbit_token') || '';
  }
  var ACCT = {
    token: readToken(),
    user: null,
    pushTimer: 0,
    pushing: false,
    pending: false
  };

  /* ---------------------- Dùng thử 7 ngày (chưa đăng nhập) ----------------------
     Chế độ khách chỉ lưu trên máy. Hết 7 ngày thì xoá sạch dữ liệu cục bộ và
     mời tạo tài khoản — dữ liệu thật nằm trên máy chủ (D1). */
  var TRIAL_DAYS = 7;
  var trialExpired = false;

  function trialStart() {
    var st = state.settings;
    if (!st.trialStart) {
      st.trialStart = todayISO();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    return st.trialStart;
  }
  function trialInfo() {
    if (ACCT.token) return { signedIn: true, active: true, daysLeft: 0, endsAt: '' };
    var start = new Date(trialStart() + 'T00:00:00');
    var end = new Date(start.getTime() + TRIAL_DAYS * 86400000);
    var msLeft = end.getTime() - Date.now();
    return {
      signedIn: false,
      active: msLeft > 0,
      daysLeft: Math.max(0, Math.ceil(msLeft / 86400000)),
      endsAt: toISO(end)
    };
  }
  function enforceTrial() {
    if (ACCT.token) return;
    var t = trialInfo();
    if (t.active) return;
    /* Hết hạn: xoá dữ liệu khách, chỉ giữ cờ để hiện hộp mời đăng ký */
    state = emptyState(defaultSettings());
    state.onboardingDone = false;   /* quay về bước 0 để hiện hộp mời đăng ký */
    state.onboardingSlide = 0;
    state.settings.trialStart = todayISO();
    state.settings.trialExpired = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    trialExpired = true;
  }

  function api(path, opts) {
    opts = opts || {};
    var headers = { 'content-type': 'application/json' };
    if (ACCT.token) headers.authorization = 'Bearer ' + ACCT.token;
    return fetch(path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok) { var e = new Error(data.error || ('http_' + r.status)); e.status = r.status; e.data = data; throw e; }
        return data;
      });
    });
  }

  /* "Nhớ đăng nhập" = lưu token bền (localStorage). Không nhớ = chỉ sống trong tab
     hiện tại (sessionStorage) — đóng trình duyệt là hết, tránh người sau mở máy
     lại thấy dữ liệu của tài khoản trước. */
  function setToken(t, remember) {
    ACCT.token = t || '';
    localStorage.removeItem('orbit_token');
    sessionStorage.removeItem('orbit_token');
    if (!t) return;
    if (remember === false) sessionStorage.setItem('orbit_token', t);
    else localStorage.setItem('orbit_token', t);
  }

  function stateForServer() {
    var copy = JSON.parse(JSON.stringify(state));
    delete copy.signedIn;
    return copy;
  }

  function pushStateNow() {
    if (!ACCT.token) return;
    if (ACCT.pushing) { ACCT.pending = true; return; }
    ACCT.pushing = true;
    api('/api/state', { method: 'PUT', body: { state: stateForServer() } })
      .then(function () { ACCT.pending = false; })
      .catch(function (err) {
        if (err.status === 401) { setToken(''); ACCT.user = null; state.signedIn = false; }
        else { ACCT.pending = true; }
      })
      .then(function () { ACCT.pushing = false; if (ACCT.pending) { ACCT.pending = false; pushStateNow(); } });
  }

  function schedulePush() {
    if (!ACCT.token) return;
    clearTimeout(ACCT.pushTimer);
    ACCT.pushTimer = setTimeout(pushStateNow, 900);
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    schedulePush();
  }

  function pullState() {
    if (!ACCT.token) return Promise.resolve(null);
    return api('/api/state').then(function (r) { return r.state; }).catch(function () { return null; });
  }

  /* Nạp dữ liệu từ máy chủ khi mở app (chỉ khi có token) */
  function hydrateFromServer() {
    if (!ACCT.token) return;
    api('/api/auth/me').then(function (r) {
      ACCT.user = r.user;
      state.signedIn = true;
      return pullState();
    }).then(function (remote) {
      if (remote) {
        var keep = { onboardingDone: state.onboardingDone, onboardingSlide: state.onboardingSlide };
        state = Object.assign(remote, {});
        if (typeof state.settings !== 'object' || !state.settings) state = loadState();
        else {
          if (!state.settings.relationPriority) state.settings.relationPriority = JSON.parse(JSON.stringify(DEFAULT_PRIORITY));
          state.signedIn = true;
          state.onboardingDone = true;
          state.onboardingSlide = 0;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        applyTheme();
        render();
        /* Đã có tài khoản: vào thẳng trang chủ thay vì đứng lại ở onboarding */
        if (location.hash === '#/onboarding' || !location.hash) location.hash = '#/home';
      }
    }).catch(function (err) {
      if (err && err.status === 401) { setToken(''); ACCT.user = null; state.signedIn = false; render(); }
    });
  }
  function logActivity(p, text) {
    p.activity = p.activity || [];
    p.activity.push({ id: uid('ac'), text: text, at: new Date().toISOString() });
    if (p.activity.length > 30) p.activity.shift();
  }

  /* ========================= Hướng dẫn từng bước =========================
     Overlay tối + "lỗ sáng" khoét đúng vùng cần chỉ, kèm thẻ mô tả. Chạy được
     trên mọi trang vì mỗi bước tự điều hướng rồi mới đo lại toạ độ. */
  var TOUR_STEPS = [
    { route: 'home', sel: '.home-hero', title: 'Đây là Orbit của bạn',
      text: 'Mọi thứ xoay quanh những người bạn quan tâm: dịp sắp tới, nhật ký và lời nhắn.' },
    { route: 'home', sel: '.home-quick', title: 'Bốn nút tắt nhanh',
      text: 'Thêm người, thêm lịch, viết nhật ký hoặc tạo link để người khác viết cho bạn.' },
    { route: 'home', sel: '.home-section', title: '7 ngày tới',
      text: 'Dải ngày trong tuần — ngày nào có sự kiện sẽ được tô đậm. Bấm một ngày để xem lịch ngày đó.' },
    { route: 'calendar', sel: '.cal-board', title: 'Lịch sự kiện',
      text: 'Toàn bộ sinh nhật, kỷ niệm, cuộc hẹn nằm trên một lịch. Bấm ô bất kỳ để thêm sự kiện.' },
    { route: 'diary', sel: '.diary-book', title: 'Nhật ký',
      text: 'Chọn bìa sổ, mẫu giấy và kiểu chữ bên phải, rồi chạm vào trang để viết.' },
    { route: 'people', sel: '.orbit-center', title: 'Mọi người',
      text: 'Mỗi người nằm trên một vòng quỹ đạo theo mức độ thân thiết. Càng gần tâm càng gần bạn.' },
    { route: 'me', sel: '.pd-cover', title: 'Trang cá nhân',
      text: 'Đổi ảnh bìa, ảnh đại diện và tên ở đây — tên này cũng hiện khi bạn viết nhật ký.' },
    { route: 'settings', sel: '.settings-group', title: 'Cài đặt',
      text: 'Chủ đề nam/nữ, nhắc nhở, mẫu tin nhắn, sao lưu dữ liệu… tất cả ở đây. Mở lại hướng dẫn này bất cứ lúc nào.' }
  ];
  var tourIdx = -1;

  function tourEl() { return document.getElementById('orbitTour'); }

  function mountTour() {
    var el = tourEl();
    if (!el) {
      el = document.createElement('div');
      el.id = 'orbitTour';
      el.className = 'tour';
      el.innerHTML = '<div class="tour-hole"></div>' +
        '<div class="tour-card" role="dialog" aria-live="polite">' +
        '<div class="tour-count"></div><h3 class="tour-title"></h3><p class="tour-text"></p>' +
        '<div class="tour-actions">' +
        '<button class="tour-skip" data-tour="skip">Bỏ qua</button>' +
        '<div class="tour-nav"><button class="tour-prev" data-tour="prev" aria-label="Bước trước">‹</button>' +
        '<button class="tour-next" data-tour="next">Tiếp →</button></div>' +
        '</div></div>';
      document.body.appendChild(el);
      el.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('[data-tour]') : null;
        if (!b) return;
        var a = b.getAttribute('data-tour');
        if (a === 'next') return tourGo(1);
        if (a === 'prev') return tourGo(-1);
        endTour();
      });
    }
    return el;
  }

  function startTour() {
    tourIdx = 0;
    showTourStep();
  }
  function endTour() {
    tourIdx = -1;
    var el = tourEl();
    if (el) el.remove();
    state.settings.tourDone = true;
    save();
  }
  function tourGo(dir) {
    tourIdx += dir;
    if (tourIdx < 0) tourIdx = 0;
    if (tourIdx >= TOUR_STEPS.length) { endTour(); return; }
    showTourStep();
  }

  function showTourStep() {
    var step = TOUR_STEPS[tourIdx];
    if (!step) { endTour(); return; }
    var el = mountTour();
    el.querySelector('.tour-count').textContent = 'Bước ' + (tourIdx + 1) + '/' + TOUR_STEPS.length;
    el.querySelector('.tour-title').textContent = step.title;
    el.querySelector('.tour-text').textContent = step.text;
    el.querySelector('.tour-prev').style.visibility = tourIdx === 0 ? 'hidden' : 'visible';
    el.querySelector('.tour-next').textContent = tourIdx === TOUR_STEPS.length - 1 ? 'Xong' : 'Tiếp →';

    if ((location.hash || '').indexOf('#/' + step.route) !== 0) {
      navigate(step.route);
    }
    /* Đợi layout xong (2 frame) rồi mới đo — nếu đo sớm sẽ ra toạ độ 0 */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { positionTour(); });
    });
  }

  function positionTour() {
    var step = TOUR_STEPS[tourIdx];
    var el = tourEl();
    if (!step || !el) return;
    var target = document.querySelector(step.sel);
    var hole = el.querySelector('.tour-hole');
    var card = el.querySelector('.tour-card');
    var vw = window.innerWidth, vh = window.innerHeight;

    var r = target ? target.getBoundingClientRect() : null;
    if (!r || (r.width === 0 && r.height === 0)) {
      /* Không tìm thấy vùng cần chỉ: cho lỗ sáng giữa màn hình để không chặn bước */
      r = { left: vw / 2 - 80, top: vh / 2 - 60, width: 160, height: 120, bottom: vh / 2 + 60 };
    }
    var pad = 8;
    var top = Math.max(6, r.top - pad);
    var left = Math.max(6, r.left - pad);
    var w = Math.min(vw - 12, r.width + pad * 2);
    var h = Math.min(vh - 12, r.height + pad * 2);
    hole.style.cssText = 'position:absolute;border-radius:16px;left:' + left + 'px;top:' + top +
      'px;width:' + w + 'px;height:' + h + 'px;';

    var cardW = Math.min(340, vw - 32);
    card.style.width = cardW + 'px';
    var below = top + h + 16;
    var cardH = card.offsetHeight || 170;
    if (below + cardH > vh - 12 && top - cardH - 16 > 8) {
      card.style.top = (top - cardH - 16) + 'px';
    } else {
      card.style.top = Math.min(vh - cardH - 12, below) + 'px';
    }
    var cx = Math.min(Math.max(12, left + w / 2 - cardW / 2), vw - cardW - 12);
    card.style.left = cx + 'px';
  }

  window.addEventListener('resize', function () { if (tourIdx >= 0) positionTour(); });
  window.addEventListener('scroll', function () { if (tourIdx >= 0) positionTour(); }, true);

  /* ---------------------------- theme ---------------------------- */
  function applyTheme() {
    var mode = state.settings.theme;
    var effective = mode;
    if (mode === 'system') {
      effective = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    if (effective === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    /* Giới tính đổi cả nền lẫn bảng màu: nữ = kem/hồng như cũ, nam = xanh nước biển */
    document.documentElement.setAttribute('data-gender', state.settings.gender === 'male' ? 'male' : 'female');
  }
  function setTheme(val) { state.settings.theme = val; save(); applyTheme(); render(); }
  /* Chọn giới tính = đổi bộ nền/chủ đề (nữ: kem hồng, nam: xanh nước biển) */
  function setGender(g) {
    state.settings.gender = g === 'male' ? 'male' : 'female';
    save(); applyTheme();
    if (!state.onboardingDone) render(); else render();
  }
  function toggleAI() { state.settings.aiEnabled = !state.settings.aiEnabled; save(); render(); }

  /* ---------------------------- router ---------------------------- */
  function currentRoute() {
    var hash = location.hash.replace(/^#\/?/, '');
    return hash ? hash.split('/').filter(Boolean) : [];
  }
  function navigate(path) { location.hash = '#/' + path; render(); }

  var peopleViewMode = 'orbit';
  var peopleRelSel = [];      // chọn nhiều mối quan hệ; rỗng = tất cả
  var peopleGroupSel = [];    // chọn nhiều nhóm; rỗng = tất cả
  var peopleFavOnly = false;
  var openAddPersonRel = 'friend';
  var openAddPersonAvatar = '';   /* avatar chọn trong modal Thêm người */
  var pdTab = 'all';        // tab đang chọn ở trang cá nhân (của người khác)
  var pdTabFor = null;      // hồ sơ đang xem, đổi người thì reset về Tổng
  var meTab = 'overview';   // tab đang chọn ở Trang cá nhân của chính bạn
  var diaryDraft = null;    // bài nhật ký đang soạn: {id?, text, target, paperId, free, font, date}
  var diaryLayingIn = false; // true = chạy animation "trải giấy" ở lần render kế tiếp
  var peopleQuery = '';
  var orbitCollapsed = true; // true = contact drawer closed, orbit stays visible
  var orbitMotionPaused = false;
  var orbitView = { scale: 1.05, x: 0, y: 0 }; // panel đóng: orbit chiếm trọn khung
  var calSelectedDay = null;
  var calStripMore = false;
  var orbitJustDragged = false;
  var orbitFocus = null;   // id người đang được focus (camera + thẻ thông tin)
  var orbitFocusRAF = null;
  var movePickerOpen = false;
  var calMonthOffset = 0;
  var bannerDismissed = false;

  function searchPeople(list) {
    var q = peopleQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(function (p) { return (p.name || '').toLowerCase().indexOf(q) >= 0; });
  }

  /* ---- Orbit: zoom + pan kiểu bản đồ ---- */
  function applyOrbitView() {
    var pan = document.getElementById('orbitPan');
    if (!pan) return;
    pan.style.transform = 'translate(' + orbitView.x + 'px,' + orbitView.y + 'px) scale(' + orbitView.scale + ')';
  }
  function zoomOrbit(factor, cx, cy) {
    var vp = document.getElementById('orbitViewport');
    var next = Math.min(3.2, Math.max(0.5, orbitView.scale * factor));
    if (vp && cx != null) {
      // giữ nguyên điểm dưới con trỏ khi phóng to (như Google Maps)
      var r = vp.getBoundingClientRect();
      var px = cx - r.left - r.width / 2;
      var py = cy - r.top - r.height / 2;
      var k = next / orbitView.scale;
      orbitView.x = px - (px - orbitView.x) * k;
      orbitView.y = py - (py - orbitView.y) * k;
    }
    orbitView.scale = next;
    applyOrbitView();
  }
  // Panel danh bạ mở thì khung orbit hẹp đi -> phải lùi camera ra mới thấy toàn cảnh
  function defaultOrbitScale() {
    if (window.innerWidth < 900) return 1.0;
    // Orbit gốc (Tất cả) giữ đúng khung cũ; chế độ lọc có layout riêng nên cần lùi nhẹ
    if (!hasActiveFilter()) return 1.05;
    return orbitCollapsed ? 1.05 : 0.95;
  }
  function resetOrbitView() { orbitView = { scale: defaultOrbitScale(), x: 0, y: 0 }; applyOrbitView(); }

  /* Thu/phóng camera có easing: dùng khi bấm X hoặc nút về giữa, để nó lùi ra
     mượt như lúc zoom vào chứ không bật phịch về vị trí cũ. */
  var orbitAnimRAF = null;
  function stopOrbitAnim() { if (orbitAnimRAF) { cancelAnimationFrame(orbitAnimRAF); orbitAnimRAF = null; } }
  function animateOrbitView(target, ms) {
    stopOrbitAnim();
    var from = { scale: orbitView.scale, x: orbitView.x, y: orbitView.y };
    var dur = ms || 420, t0 = performance.now();
    var tick = function (now) {
      var k = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3); // easeOutCubic
      orbitView.scale = from.scale + (target.scale - from.scale) * e;
      orbitView.x = from.x + (target.x - from.x) * e;
      orbitView.y = from.y + (target.y - from.y) * e;
      applyOrbitView();
      if (k < 1) orbitAnimRAF = requestAnimationFrame(tick); else orbitAnimRAF = null;
    };
    orbitAnimRAF = requestAnimationFrame(tick);
  }
  function bindOrbitGestures() {
    var vp = document.getElementById('orbitViewport');
    if (!vp || vp.dataset.bound) return;
    vp.dataset.bound = '1';
    // Kéo-thả avatar sang vòng trong / vòng ngoài
    var dragAv = null;
    vp.addEventListener('pointerdown', function (e) {
      var av = e.target.closest('.orbit-avatar');
      if (!av) return;
      dragAv = { av: av, pid: av.dataset.pid, x: e.clientX, y: e.clientY, moved: false };
    });
    vp.addEventListener('pointermove', function (e) {
      if (!dragAv) return;
      if (!dragAv.moved && Math.hypot(e.clientX - dragAv.x, e.clientY - dragAv.y) > 6) {
        dragAv.moved = true; dragAv.av.classList.add('dragging-av');
      }
      if (!dragAv.moved) return;
      var st = document.querySelector('.orbit-stage');
      if (!st) return;
      var b = st.getBoundingClientRect();
      var ringTotals = document.querySelectorAll('.orbit-ring').length || 6;
      var ring = Math.min(ringTotals, Math.max(1, Math.round(Math.hypot(e.clientX - (b.left + b.width / 2), e.clientY - (b.top + b.height / 2)) / (b.width / 2) * (ringTotals + 0.2))));
      vp.dataset.dropRing = ring;
      document.querySelectorAll('.orbit-ring').forEach(function (r) {
        r.classList.toggle('drop-target', Number(r.dataset.ring) === ring);
      });
    });
    vp.addEventListener('pointerup', function () {
      if (!dragAv) return;
      var d = dragAv; dragAv = null;
      d.av.classList.remove('dragging-av');
      document.querySelectorAll('.orbit-ring').forEach(function (r) { r.classList.remove('drop-target'); });
      if (!d.moved) return;
      var ring = Number(vp.dataset.dropRing);
      delete vp.dataset.dropRing;
      var p = state.people.find(function (x) { return x.id === d.pid; });
      if (p && ring) {
        p.ring = ring; orbitJustDragged = true; save(); render();
        setTimeout(function () { orbitJustDragged = false; }, 0);
      }
    });
    vp.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoomOrbit(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY);
    }, { passive: false });
    var drag = null;
    vp.addEventListener('pointerdown', function (e) {
      // Bỏ qua mọi phần tử tương tác để click của chúng không bị "nuốt"
      // bởi thao tác kéo bản đồ (thẻ thông tin, nút, liên kết, input).
      if (e.target.closest('.orbit-avatar, .orbit-zoom, .orbit-focus-card, .contacts-tab, button, a, input, select, textarea')) return;
      drag = { x: e.clientX, y: e.clientY, ox: orbitView.x, oy: orbitView.y };
      vp.setPointerCapture(e.pointerId); vp.classList.add('dragging');
    });
    vp.addEventListener('pointermove', function (e) {
      if (!drag) return;
      orbitView.x = drag.ox + (e.clientX - drag.x);
      orbitView.y = drag.oy + (e.clientY - drag.y);
      applyOrbitView();
    });
    function endDrag() { drag = null; vp.classList.remove('dragging'); }
    vp.addEventListener('pointerup', endDrag);
    vp.addEventListener('pointercancel', endDrag);
    // pinch 2 ngón trên điện thoại
    var pinch = null;
    vp.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      }
    }, { passive: true });
    vp.addEventListener('touchmove', function (e) {
      if (e.touches.length === 2 && pinch) {
        var d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        zoomOrbit(d / pinch);
        pinch = d;
        e.preventDefault();
      }
    }, { passive: false });
    vp.addEventListener('touchend', function () { pinch = null; }, { passive: true });
    applyOrbitView();
  }

  function render() {
    /* Trang mời công khai: người nhận không cần (và không nên) đi qua onboarding */
    var pre = currentRoute();
    if (pre[0] === 'memory' && pre[1] === 'invite' && pre[2]) {
      document.getElementById('app').innerHTML = renderInvitePage(pre[2]);
      loadInvitePage(pre[2]);
      return;
    }
    if (!state.onboardingDone) {
      document.getElementById('app').innerHTML = renderOnboarding();
      return;
    }
    var parts = currentRoute();
    var page = parts[0] || 'home';
    var inner = '';
    if (page === 'onboarding') { page = 'home'; parts = ['home']; }
    /* Link/QR "Viết cho tôi": trang riêng, không có thanh điều hướng */
    if (page === 'write') {
      document.getElementById('app').innerHTML = renderWriteForMe(parts[1] || '');
      return;
    }
    if (page === 'home') inner = renderHome();
    else if (page === 'people') inner = parts[1] ? renderPersonDetail(parts[1]) : renderPeople();
    else if (page === 'me') inner = renderMe();
    else if (page === 'diary') {
      /* #/diary/new = mở sổ và bắt đầu viết ngay (nút tắt từ trang chủ) */
      if (parts[1] === 'new' && !diaryDraft) {
        diaryDraft = {
          text: '', target: 'me', paperId: (state.settings.diaryPaperId || 'paper-rule'),
          free: null, font: (state.settings.diaryFont || 'serif'), date: todayISO(), remind: true
        };
        diaryLayingIn = true;
      }
      inner = renderDiary();
    }
    else if (page === 'calendar') inner = renderCalendar();
    else if (page === 'settings') inner = parts[1] ? renderSettingsSub(parts[1]) : renderSettings();
    else inner = renderHome();

    document.getElementById('app').innerHTML = shell(inner, page, page === 'me');
    afterRender(page, parts);
  }

  function afterRender(page, parts) {
    if (page === 'people' && parts[1]) bindNotesArea(parts[1]);
    if (page === 'people' && !parts[1]) { bindOrbitGestures(); bindPeopleSearch(); applyFocusCamera(); }
    if (page === 'settings' && parts[1] === 'data') bindImportInput();
    if (page === 'diary') { layoutPapers(); if (document.getElementById('paperImportInput')) bindPaperImport(); }
    else if (page === 'me' || (page === 'people' && parts[1])) layoutPapers();
    if (diaryDraft) syncDiaryText();
    bindProfileUploads();
    bindReminderInputs();
    /* hiệu ứng quét giấy chỉ chạy đúng một lần lúc mở; hết animation thì dọn class + mép sáng */
    if (diaryLayingIn) setTimeout(function () {
      diaryLayingIn = false;
      var sh = document.querySelector('.diary-sheet.lay-in');
      if (sh) sh.classList.remove('lay-in');
      var edge = document.querySelector('.sweep-edge');
      if (edge) edge.remove();
    }, 1000);
  }

  /* Giữ nội dung đang gõ trong diaryDraft để đổi giấy / đổi người nhận (render lại) không mất chữ */
  function syncDiaryText() {
    var ta = document.getElementById('diaryText');
    if (!ta || !diaryDraft) return;
    diaryDraft.text = ta.value;
    ta.addEventListener('input', function () { if (diaryDraft) diaryDraft.text = ta.value; });
  }

  function bindPeopleSearch() {
    var el = document.getElementById('peopleSearch');
    if (!el) return;
    el.addEventListener('input', function () {
      peopleQuery = el.value;
      var pos = el.selectionStart;
      render();
      var again = document.getElementById('peopleSearch');
      if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (e) {} }
    });
  }

  /* Tan thành bọt rồi biến mất: dùng cho di chuyển và xoá */
  function bubbleThen(pid, done) {
    var el = document.querySelector('.orbit-avatar[data-pid="' + pid + '"]');
    if (!el) { done(pid); return; }
    var r = el.getBoundingClientRect();
    var layer = document.createElement('div');
    layer.className = 'bubble-layer';
    layer.style.left = (r.left + r.width / 2) + 'px';
    layer.style.top = (r.top + r.height / 2) + 'px';
    for (var i = 0; i < 14; i++) {
      var b = document.createElement('i');
      var a = (Math.PI * 2 * i) / 14;
      var dist = 22 + Math.random() * 30;
      b.style.setProperty('--bx', (Math.cos(a) * dist).toFixed(1) + 'px');
      b.style.setProperty('--by', (Math.sin(a) * dist - 10).toFixed(1) + 'px');
      b.style.animationDelay = (i * 16) + 'ms';
      b.style.width = b.style.height = (4 + Math.round(Math.random() * 4)) + 'px';
      layer.appendChild(b);
    }
    document.body.appendChild(layer);
    el.classList.add('dissolving');
    setTimeout(function () {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
      done(pid);
    }, 700);
  }

  /* Camera bám theo người được chọn theo thời gian thực: chỉ pan + zoom mỗi
     frame, tuyệt đối không xoay nội dung nên avatar/tên luôn thẳng đứng dù
     map vẫn đang quay như bình thường. */
  function stopFocusFollow() {
    if (orbitFocusRAF) { cancelAnimationFrame(orbitFocusRAF); orbitFocusRAF = null; }
  }
  function applyFocusCamera() {
    stopFocusFollow();
    if (!orbitFocus) {
      if (orbitAnimRAF) return;            // đang lùi camera có easing -> đừng cắt ngang
      orbitView = { scale: defaultOrbitScale(), x: 0, y: 0 }; applyOrbitView(); return;
    }
    var targetScale = 1.55;
    var tick = function () {
      var av = document.querySelector('.orbit-avatar[data-pid="' + orbitFocus + '"]');
      var vp = document.getElementById('orbitViewport');
      if (!av || !vp) { stopFocusFollow(); return; }
      var ab = av.getBoundingClientRect(), vb = vp.getBoundingClientRect();
      var dx = (vb.left + vb.width / 2) - (ab.left + ab.width / 2);
      var dy = (vb.top + vb.height * 0.42) - (ab.top + ab.height / 2);
      orbitView.x += dx * 0.22;
      orbitView.y += dy * 0.22;
      orbitView.scale += (targetScale - orbitView.scale) * 0.12;
      applyOrbitView();
      placeFocusCard(av);
      orbitFocusRAF = requestAnimationFrame(tick);
    };
    orbitFocusRAF = requestAnimationFrame(tick);
  }

  /* Thẻ thông tin nằm NGAY CẠNH avatar được chọn và bám theo nó khi map quay.
     Trên mobile vẫn là bottom sheet nên chỉ chạy ở desktop. */
  function placeFocusCard(av) {
    if (window.innerWidth < 900) return;
    var card = document.querySelector('.orbit-focus-card');
    if (!card) return;
    if (!card._w) { card._w = card.offsetWidth; card._h = card.offsetHeight; }
    var w = card._w, h = card._h, gap = 18;
    var ab = av.getBoundingClientRect();
    var x = ab.right + gap;
    if (x + w > window.innerWidth - 16) x = ab.left - w - gap;
    if (x < 16) x = Math.max(16, Math.min(window.innerWidth - w - 16, ab.right + gap));
    var y = ab.top + ab.height / 2 - h / 2;
    y = Math.max(16, Math.min(window.innerHeight - h - 16, y));
    card.style.transform = 'translate3d(' + Math.round(x) + 'px,' + Math.round(y) + 'px,0)';
    card.classList.add('anchored');
  }

  /* ---------------------------- shell / nav ---------------------------- */
  /* "Trang cá nhân" là hồ sơ của CHÍNH người dùng, không phải hồ sơ liên hệ */
  function profileHref() { return '#/me'; }

  function navLink(key, icon, label, active, suffix) {
    return '<a class="sidebar-link ' + (active === key ? 'active' : '') + '" href="#/' + key + '"><span class="ic">' + icon + '</span>' + label +
      (suffix ? '<span class="nav-count">' + suffix + '</span>' : '') + '</a>';
  }
  function bottomItem(key, icon, label, active, suffix) {
    return '<a class="nav-item ' + (active === key ? 'active' : '') + '" href="#/' + key + '"><span class="ic">' + icon + '</span>' +
      '<span class="lbl">' + label + '</span>' + (suffix ? '<span class="nav-count">' + suffix + '</span>' : '') + '</a>';
  }
  function shell(inner, active, onProfile) {
    return (
      '<div class="app-shell shell-' + active + '" style="display:flex;width:100%;">' +
      '<aside class="sidebar">' +
        (active === 'people' ? '<div class="sidebar-hero-card"><img class="sidebar-hero" src="assets/sidebar-girl-cloud.png" alt="" aria-hidden="true"></div>' : '') +
        '<div class="sidebar-logo">✦ Orbit</div>' +
        '<nav class="sidebar-nav">' +
          navLink('home', ic('home', 22), 'Home', active) +
          '<a class="sidebar-link' + (onProfile ? ' active' : '') + '" href="' + profileHref() + '">' +
            '<span class="ic">' + ic('profile', 24) + '</span>Trang cá nhân</a>' +
          navLink('people', ic('people', 22), 'Mọi người', onProfile ? '__none' : active, state.people.length) +
          navLink('diary', ic('diary', 24), 'Nhật ký', active) +
          navLink('calendar', ic('calendar', 22), 'Sự kiện', active) +
          navLink('settings', ic('settings', 22), 'Cài đặt', active) +
        '</nav>' +
        '<div class="sidebar-illustration"><div class="side-deco">' +
          '<img class="flower" src="assets/flower-tulip.png" alt="">' +
          '<img class="sp sp1" src="assets/stars/star-02.png" alt="">' +
          '<img class="sp sp2" src="assets/stars/star-06.png" alt="">' +
          '</div>' +
          '<div class="slogan">Lưu những điều quan trọng với bạn</div></div>' +
      '</aside>' +
      '<div class="shell-main">' +
        '<div class="view-root page-' + active + '"><div class="view-inner">' + inner + '</div></div>' +
        '<nav class="bottom-nav">' +
          bottomItem('home', ic('home', 22), 'Home', active) +
          '<a class="nav-item' + (onProfile ? ' active' : '') + '" href="' + profileHref() + '"><span class="ic">' + ic('profile', 24) + '</span><span class="lbl">Hồ sơ</span></a>' +
          bottomItem('people', ic('people', 22), 'Mọi người', onProfile ? '__none' : active, state.people.length) +
          '<button class="fab" data-action="open-quickadd">' + ic('plus', 54) + '</button>' +
          bottomItem('diary', ic('diary', 24), 'Nhật ký', active) +
          bottomItem('calendar', ic('calendar', 22), 'Sự kiện', active) +
          bottomItem('settings', ic('settings', 22), 'Cài đặt', active) +
        '</nav>' +
      '</div></div>'
    );
  }

  /* ---------------------------- occasions (home logic) ---------------------------- */
  function getOccasions(windowDays) {
    var today = todayISO();
    var todayMMDD = toMMDD(new Date());
    var list = [];
    state.people.forEach(function (p) {
      if (!p.birthday) return;
      var nb = nextBirthdayISO(p.birthday, today);
      var daysAway = daysBetween(today, nb);
      if (daysAway <= windowDays) list.push({ id: 'bday-' + p.id, title: 'Sinh nhật ' + p.name, icon: ICONS.birthday, tone: TONE.birthday, daysAway: daysAway, personId: p.id, kind: 'birthday', dateISO: nb, time: '' });
    });
    state.events.forEach(function (ev) {
      if (ev.type === 'memory' && ev.annMMDD) {
        if (ev.annMMDD === todayMMDD) {
          list.push({ id: ev.id, title: ev.title, icon: ICONS.memory, tone: TONE.memory, daysAway: 0, special: 'Ngày này năm ngoái', kind: 'memory', personId: ev.personId, dateISO: today, time: ev.time || '' });
        }
        return;
      }
      if (!ev.date) return;
      var daysAway = daysBetween(today, ev.date);
      if (daysAway >= 0 && daysAway <= windowDays) {
        list.push({ id: ev.id, title: ev.title, icon: ICONS[ev.type] || ICONS.custom, tone: TONE[ev.type] || TONE.custom, daysAway: daysAway, kind: ev.type, personId: ev.personId, dateISO: ev.date, time: ev.time || '', place: ev.location || '' });
      }
    });
    // Mockup xếp: dịp sắp tới theo ngày trước, "kỷ niệm ngày này năm ngoái" ở cuối.
    list.sort(function (a, b) {
      var am = a.kind === 'memory' ? 1 : 0, bm = b.kind === 'memory' ? 1 : 0;
      if (am !== bm) return am - bm;
      return a.daysAway - b.daysAway;
    });
    return list;
  }
  function occasionSubtitle(o) {
    var bits = [];
    if (o.special) bits.push(o.special);
    else if (o.daysAway === 0) bits.push('Hôm nay');
    else if (o.daysAway === 1) bits.push('Ngày mai');
    else bits.push('Sau ' + o.daysAway + ' ngày');
    var d = o.dateISO ? shortDayLabel(o.dateISO) : '';
    if (d) bits.push(d);
    if (o.time) bits.push(o.time);
    return bits.join(' · ');
  }
  /* "T2, 12/11" — nhãn ngày ngắn dùng ở trang chủ */
  function shortDayLabel(iso) {
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return '';
    var wd = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
    return wd + ', ' + d.getDate() + '/' + (d.getMonth() + 1);
  }
  function buildSuggestion() {
    if (!state.settings.aiEnabled) return null;
    var occ = getOccasions(14).filter(function (o) { return o.kind === 'birthday'; });
    if (occ.length) {
      var o = occ[0];
      var person = state.people.find(function (p) { return p.id === o.personId; });
      return { icon: 'envelope', text: 'Thử nhắn tin chúc mừng sinh nhật ' + (person ? person.name : '') + ' nhé!', href: person ? '#/people/' + person.id : '#/home' };
    }
    var noNote = state.people.find(function (p) { return !p.notes; });
    if (noNote) return { icon: 'leaf', text: 'Ghi lại vài điều bạn nhớ về ' + noNote.name, href: '#/people/' + noNote.id };
    return null;
  }

  /* ---------------------------- Home ---------------------------- */
  /* Ngày đang chọn ở dải "7 ngày tới" của trang chủ */
  var homeDay = null;
  function isoOfDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function homeWeekDays() {
    var out = [], now = new Date();
    for (var i = 0; i < 7; i++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      var iso = isoOfDate(d);
      out.push({
        iso: iso, d: d,
        events: state.events.filter(function (e) { return e.date === iso; })
      });
    }
    return out;
  }

  function renderHome() {
    var today = new Date();
    var todayIso = todayISO();
    var dateLabel = cap(today.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }));
    var occasions = getOccasions(60);
    var windowNote = '';
    if (!occasions.length) {
      occasions = getOccasions(180);
      if (occasions.length) windowNote = ' (trong 180 ngày tới)';
    }
    var hasOccasions = occasions.length > 0;
    var withoutBday = state.people.filter(function (p) { return !p.birthday; });

    /* ---------- Nút tắt nhanh ---------- */
    var quick =
      '<div class="home-quick">' +
      '<button class="hq" data-action="open-add-person"><span class="hq-ic tone-pink">' + ic('people', 20) + '</span><span>Thêm người</span></button>' +
      '<button class="hq" data-action="open-add-event"><span class="hq-ic tone-purple">' + ic('calendar', 20) + '</span><span>Thêm lịch</span></button>' +
      '<a class="hq" href="#/diary/new"><span class="hq-ic tone-green">' + ic('diary', 20) + '</span><span>Viết nhật ký</span></a>' +
      '<button class="hq" data-action="open-write-for-me"><span class="hq-ic tone-orange">' + ic('envelope', 20) + '</span><span>Viết cho tôi</span></button>' +
      '</div>';

    /* ---------- 7 ngày tới: dải ngày + lịch của ngày đang chọn ---------- */
    var week = homeWeekDays();
    if (!homeDay || !week.some(function (w) { return w.iso === homeDay; })) homeDay = todayIso;
    var selDay = week.filter(function (w) { return w.iso === homeDay; })[0] || week[0];
    var weekStrip = '<div class="wk-strip">' + week.map(function (w) {
      var hasEv = w.events.length > 0;
      return '<button class="wk-day' + (w.iso === homeDay ? ' on' : '') + (w.iso === todayIso ? ' today' : '') +
        (hasEv ? ' has-ev' : '') + '" ' +
        'data-action="home-day" data-date="' + w.iso + '" aria-pressed="' + (w.iso === homeDay) + '" ' +
        'aria-label="' + shortDayLabel(w.iso) + (hasEv ? ', ' + w.events.length + ' sự kiện' : '') + '">' +
        '<span class="wk-wd">' + ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][w.d.getDay()] + '</span>' +
        '<span class="wk-num">' + w.d.getDate() + '/' + (w.d.getMonth() + 1) + '</span>' +
        '<span class="wk-dot' + (hasEv ? ' on' : '') + '"></span></button>';
    }).join('') + '</div>';
    var weekList = selDay.events.length ? selDay.events.map(function (e) {
      var cat = EV_BY_KEY[e.type];
      return '<a class="wk-ev" href="#/calendar">' +
        '<span class="wk-ev-time">' + esc(e.time || '--:--') + '</span>' +
        '<span class="wk-ev-b"><b>' + esc(e.title) + '</b><em>' +
        (cat ? cat.label : 'Sự kiện') + (e.location ? ' · ' + esc(e.location) : '') + '</em></span>' +
        '<span class="wk-ev-ic">' + evIcon(e.type, 26) + '</span></a>';
    }).join('') : '<div class="wk-empty">Không có sự kiện trong ngày này. <a href="#/calendar">Mở lịch ›</a></div>';

    /* ---------- Sự kiện sắp tới ---------- */
    var upcoming = state.events.filter(function (e) { return e.date && e.date >= todayIso; })
      .sort(function (a, b) { return (a.date + (a.time || '99:99')).localeCompare(b.date + (b.time || '99:99')); })
      .slice(0, 5);
    var upList = upcoming.length ? upcoming.map(function (e) {
      var d = new Date(e.date + 'T00:00:00');
      return '<a class="up-row" href="#/calendar">' +
        '<span class="up-date"><b>' + (isNaN(d.getTime()) ? '' : d.getDate()) + '</b>' +
        '<em>Th' + (isNaN(d.getTime()) ? '' : d.getMonth() + 1) + '</em></span>' +
        '<span class="up-t"><b>' + esc(e.title) + '</b><em>' + shortDayLabel(e.date) +
        (e.time ? ' · ' + esc(e.time) : '') + (e.location ? ' · ' + esc(e.location) : '') + '</em></span>' +
        '</a>';
    }).join('') : '<p class="muted" style="margin:0;font-size:13px;">Chưa có sự kiện nào sắp tới. ' +
      '<a href="#/calendar">Thêm sự kiện ›</a></p>';

    /* ---------- 60 ngày tới: hộp cuộn, ~5-6 đám mây ---------- */
    var occBody;
    if (hasOccasions) {
      occBody = '<div class="occasion-scroll"><div class="occasion-row">' + occasions.map(function (o) {
        return '<a class="occasion-card cloud ' + o.tone + '" href="' + (o.personId ? '#/people/' + o.personId : '#/calendar') + '" ' +
          'style="--cloud-img:url(assets/clouds/' + cloudImg(o.tone) + ')">' +
          '<div class="ic">' + evIcon(o.kind, 42) + '</div><div class="t">' + esc(o.title) + '</div>' +
          '<div class="s">' + occasionSubtitle(o) + '</div></a>';
      }).join('') + '</div></div>' +
        (windowNote ? '<div class="occ-note">Không có dịp trong 60 ngày — đang hiện' + windowNote + '</div>' : '');
    } else if (withoutBday.length > 0) {
      occBody = '<p class="muted" style="margin:0 0 12px;font-size:13px;">' + withoutBday.length + ' người bạn chưa lưu ngày sinh.</p>' +
        '<div class="occasion-row">' + withoutBday.slice(0, 3).map(function (p) {
          return '<a class="occasion-card cloud tone-purple" href="#/people/' + p.id + '" style="--cloud-img:url(assets/clouds/' + cloudImg('tone-purple') + ')"><div class="ic">' + evIcon('birthday', 42) + '</div>' +
            '<div class="t">' + esc(p.name) + '</div><div class="s">Thêm ngày sinh</div></a>';
        }).join('') + '</div>';
    } else {
      occBody = '<p class="muted" style="margin:0;font-size:13px;">' +
        (state.people.length === 0 ? 'Thêm người đầu tiên để bắt đầu.' : 'Không có dịp nào sắp tới trong 180 ngày.') + '</p>';
    }

    var suggestion = buildSuggestion();

    return (
      '<div class="home-hero">' +
      '<button class="home-bell home-bell-float" data-action="toast" data-msg="Chưa có thông báo mới">' + ic('bell', 26) + '</button>' +
      '<div class="home-hero-text"><div class="date">' + dateLabel + '</div>' +
      '<h1>Chào bạn ' + ic('sun', 26) + '</h1>' +
      '<p class="sub">Những người bạn yêu thương luôn ở gần đây ✨</p></div>' +
      '<div class="home-hero-art"></div>' +
      '<div class="home-deco" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
      '</div>' +

      (state.settings.homeQuick === false ? '' : quick) +

      /* 7 ngày tới */
      (state.settings.homeWeek === false ? '' :
        '<section class="home-section">' +
        '<div class="home-section-head"><h2>7 ngày tới</h2>' +
        '<a class="link-more" href="#/calendar">Mở lịch ›</a></div>' +
        weekStrip + '<div class="wk-list">' + weekList + '</div>' +
        '</section>') +

      /* 60 ngày tới */
      (state.settings.homeOccasions === false ? '' :
        '<section class="home-section">' +
        '<div class="home-section-head"><h2>60 ngày tới</h2>' +
        '<button class="link-more" data-action="open-all-upcoming">Xem tất cả ›</button></div>' +
        occBody + '</section>') +

      /* Sự kiện sắp tới */
      (state.settings.homeUpcoming === false ? '' :
        '<section class="home-section">' +
        '<div class="home-section-head"><h2>Sự kiện sắp tới</h2>' +
        '<button class="link-more" data-action="open-add-event">+ Thêm</button></div>' +
        '<div class="up-list">' + upList + '</div></section>') +

      /* Gợi ý chỉ là thông báo phụ: thu thành một dải mảnh, có nút ẩn ngay tại chỗ */
      (suggestion && state.settings.homeSuggest !== false && !state.settings.homeSuggestHidden ?
        '<div class="suggest-bar">' +
        '<a class="suggest-bar-main" href="' + suggestion.href + '">' +
        '<span class="sb-ic">' + ic(suggestion.icon, 18) + '</span>' +
        '<span class="sb-txt">' + esc(suggestion.text) + '</span></a>' +
        '<button class="sb-hide" data-action="hide-home-suggest" aria-label="Ẩn gợi ý" title="Ẩn gợi ý">✕</button>' +
        '</div>' : '')
    );
  }

  /* "Viết cho tôi": link + mã QR để người khác mở viết cho bạn */
  function openWriteForMe() {
    if (!state.settings.shareToken) {
      state.settings.shareToken = 'w' + Math.random().toString(36).slice(2, 9);
      save();
    }
    var url = location.origin + '/#/write/' + state.settings.shareToken;
    var qr = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=' + encodeURIComponent(url);
    openModal(
      '<div class="modal-sheet"><div class="modal-head"><h3>Viết cho tôi</h3>' +
      '<button data-action="close-modal">✕</button></div>' +
      '<p class="muted" style="margin:0 0 12px;font-size:13px;">Gửi link hoặc cho quét mã này — người nhận mở ra sẽ viết được một lời nhắn gửi thẳng vào Orbit của bạn.</p>' +
      '<div class="wf-qr"><img src="' + qr + '" alt="Mã QR viết cho tôi" width="180" height="180"></div>' +
      '<div class="wf-link"><input id="wfLink" type="text" readonly value="' + esc(url) + '">' +
      '<button class="btn btn-primary" data-action="copy-write-link">Sao chép</button></div>' +
      '<div class="gap-note">Mã QR tạo qua dịch vụ qrserver.com. Bản demo lưu lời nhắn ngay trên máy này — muốn nhận từ máy khác cần backend.</div>' +
      '</div>'
    );
  }

  /* Trang mở từ link/QR: người khác viết lời nhắn cho chủ tài khoản */
  function renderWriteForMe(token) {
    var to = state.settings.profileName || 'Bạn';
    return '<div class="wf-page"><div class="card wf-card">' +
      '<div class="wf-star">✦</div>' +
      '<h1>Viết cho ' + esc(to) + '</h1>' +
      '<p class="muted">Một lời nhắn nhỏ sẽ được gửi vào Orbit của ' + esc(to) + '.</p>' +
      '<form id="form-write-for-me">' +
      '<input type="hidden" name="token" value="' + esc(token || '') + '">' +
      '<textarea name="text" rows="5" placeholder="Bạn muốn nhắn gì?" required></textarea>' +
      '<input type="text" name="from" placeholder="Tên của bạn (không bắt buộc)">' +
      '<button type="submit" class="btn btn-primary btn-block">Gửi lời nhắn</button></form>' +
      '<a class="link-more" href="#/home">Mở Orbit ›</a>' +
      '</div></div>';
  }

  function openAllUpcomingModal() {
    var occ = getOccasions(180);
    openModal(
      '<div class="modal-sheet"><div class="modal-head"><h3>Tất cả dịp sắp tới</h3><button data-action="close-modal">✕</button></div>' +
      (occ.length ? occ.map(function (o) {
        return '<div class="suggest-card card" style="margin-bottom:8px;"><div class="ic-wrap" style="background:transparent;">' + ic(o.icon, 26) + '</div>' +
          '<div class="txt">' + esc(o.title) + '<br><span class="muted" style="font-weight:400;">' + occasionSubtitle(o) + '</span></div></div>';
      }).join('') : '<p class="muted">Không có dịp nào trong 180 ngày tới.</p>') +
      '</div>'
    );
  }

  /* ---------------------------- People / Orbit ---------------------------- */
  /* Bộ lọc: chọn được nhiều mối quan hệ và nhiều nhóm; cả hai rỗng = tất cả.
     Chọn cả hai thì giao nhau (phải khớp cả quan hệ lẫn nhóm). */
  function hasActiveFilter() {
    return peopleRelSel.length > 0 || peopleGroupSel.length > 0 || peopleFavOnly;
  }
  function relChip(r) {
    var on = peopleRelSel.indexOf(r.k) > -1;
    return '<button class="pill' + (on ? ' active' : '') + '" data-action="toggle-rel-filter" data-rel="' + r.k + '" aria-pressed="' + on + '">' + r.label + '</button>';
  }
  function groupChip(g) {
    var on = peopleGroupSel.indexOf(g.id) > -1;
    return '<button class="pill' + (on ? ' active' : '') + '" data-action="toggle-group-filter" data-gid="' + esc(g.id) + '" aria-pressed="' + on + '">' + esc(g.name) + '</button>';
  }
  function personMatchesFilters(p) {
    if (peopleRelSel.length && peopleRelSel.indexOf(p.relationship) < 0) return false;
    if (peopleGroupSel.length) {
      var gs = p.groups || [], hit = false;
      for (var i = 0; i < peopleGroupSel.length; i++) { if (gs.indexOf(peopleGroupSel[i]) > -1) { hit = true; break; } }
      if (!hit) return false;
    }
    if (peopleFavOnly && !p.favorite) return false;
    return true;
  }
  /* Bảng thống kê: bao nhiêu liên kết, chia theo mối quan hệ */
  function connectionStats() {
    var counts = {};
    REL_TYPES.forEach(function (r) { counts[r.k] = 0; });
    state.people.forEach(function (p) {
      counts[p.relationship] = (counts[p.relationship] || 0) + 1;
    });
    return {
      total: state.people.length,
      groups: (state.settings.groups || []).length,
      counts: counts,
      max: Math.max.apply(null, REL_TYPES.map(function (r) { return counts[r.k] || 0; }).concat([1]))
    };
  }
  function statsCardHtml() {
    var s = connectionStats();
    if (!s.total) return '';
    var rows = REL_TYPES.map(function (r) {
      var n = s.counts[r.k] || 0;
      var w = Math.round((n / s.max) * 100);
      return '<div class="stats-row' + (n ? '' : ' is-zero') + '">' +
        '<span class="stats-dot" style="background:' + ringColor(r.k) + '"></span>' +
        '<span class="stats-label">' + r.label + '</span>' +
        '<span class="stats-bar"><i style="width:' + w + '%;background:' + ringColor(r.k) + '"></i></span>' +
        '<b class="stats-num">' + n + '</b></div>';
    }).join('');
    return '<details class="stats-card"' + (window.innerWidth >= 900 ? ' open' : '') + '>' +
      '<summary><span>Thống kê liên kết</span>' +
      '<em>' + s.total + ' liên kết · ' + s.groups + ' nhóm</em></summary>' +
      '<div class="stats-rows">' + rows + '</div></details>';
  }

  function groupNames(ids) {
    var all = (state.settings.groups || []);
    return (ids || []).map(function (id) {
      var g = all.filter(function (x) { return x.id === id; })[0];
      return g ? g.name : '';
    }).filter(Boolean);
  }

  /* Avatar: ưu tiên ảnh người dùng tải lên (p.photo = dataURL), sau đó tới avatar
     chọn từ bộ sẵn có (p.avatar = 'av-07' hoặc dataURL), cuối cùng mới fallback chữ cái. */
  var AVATAR_COUNT = 26;
  var AVATAR_PRESETS = ['av-01', 'av-02', 'av-03', 'av-04', 'av-05', 'av-06', 'av-07', 'av-08',
    'av-09', 'av-10', 'av-11', 'av-12', 'av-13', 'av-14', 'av-15', 'av-16', 'av-17', 'av-18',
    'av-19', 'av-20'];
  /* Giá trị avatar ('av-07' | dataURL | đường dẫn) → src dùng được cho <img> */
  function avatarSrc(v) {
    if (!v) return '';
    return /^av-\d+$/.test(v) ? 'assets/avatars/' + v + '.png' : v;
  }
  function avatarInner(p, size) {
    var v = p.photo || p.avatar;
    if (v) return '<img class="av-img" src="' + esc(avatarSrc(v)) + '" alt="">';
    return initials(p.name);
  }
  function avatarStyle(p) {
    return (p.photo || p.avatar) ? 'background:transparent;' : 'background:' + avatarColor(p.id) + ';';
  }

  /* ===== Ảnh đại diện + ảnh nền: dùng chung cho trang của bạn ('me') và người khác ===== */
  function profileAvatarOf(id) {
    if (id === 'me') return state.settings.profileAvatar || '';
    var p = state.people.find(function (x) { return x.id === id; });
    return p ? (p.photo || p.avatar || '') : '';
  }
  /* Ảnh bìa hồ sơ mặc định đổi theo giới tính (nam: tranh biển hoàng hôn) */
  function defaultCover(kind) {
    var male = state.settings.gender === 'male';
    if (kind === 'tall') return male ? 'assets/cover-male-tall.jpg' : 'assets/cover-default-tall.jpg';
    return male ? 'assets/cover-male-wide.jpg' : 'assets/cover-default-wide.jpg';
  }
  function profileCoverOf(id) {
    if (id === 'me') return state.settings.profileCover || '';
    var p = state.people.find(function (x) { return x.id === id; });
    return p ? (p.cover || '') : '';
  }
  function profileNameOf(id) {
    if (id === 'me') return state.settings.profileName || 'Bạn';
    var p = state.people.find(function (x) { return x.id === id; });
    return p ? p.name : '';
  }
  function setProfileAvatar(id, val) {
    if (id === 'me') {
      state.settings.profileAvatar = val || '';
    } else {
      var p = state.people.find(function (x) { return x.id === id; });
      if (!p) return;
      p.photo = ''; p.avatar = val || '';
    }
    save(); closeModal(); render();
    showToast(val ? 'Đã đổi ảnh đại diện' : 'Đã bỏ ảnh đại diện');
  }
  function setProfileCover(id, val) {
    if (id === 'me') {
      state.settings.profileCover = val || '';
    } else {
      var p = state.people.find(function (x) { return x.id === id; });
      if (!p) return;
      p.cover = val || '';
    }
    save(); closeModal(); render();
    showToast(val ? 'Đã đổi ảnh nền' : 'Đã bỏ ảnh nền');
  }
  function openAvatarPicker(id) {
    var cur = profileAvatarOf(id);
    var grid = AVATAR_PRESETS.map(function (a) {
      return '<button class="av-pick' + (cur === a ? ' on' : '') + '" data-action="pick-avatar" ' +
        'data-id="' + esc(id) + '" data-av="' + a + '" aria-label="Chọn ảnh ' + a + '">' +
        '<img src="assets/avatars/' + a + '.png" alt=""></button>';
    }).join('');
    openModal(
      '<div class="modal-sheet avatar-sheet"><div class="modal-head"><h3>Ảnh đại diện — ' +
      esc(profileNameOf(id)) + '</h3><button data-action="close-modal">✕</button></div>' +
      '<div class="av-grid">' + grid + '</div>' +
      '<label class="btn btn-block av-upload">Tải ảnh từ máy' +
      '<input type="file" accept="image/*" id="avatarUpload" data-id="' + esc(id) + '" hidden></label>' +
      (cur ? '<button class="btn btn-block av-clear" data-action="clear-avatar" data-id="' + esc(id) + '">Bỏ ảnh đại diện</button>' : '') +
      '</div>'
    );
  }
  function openCoverPicker(id) {
    var cur = profileCoverOf(id);
    var presets = [
      { v: '', label: 'Mặc định', css: 'background-image:url(' + defaultCover('wide') + ')' },
      { v: 'assets/cover-default-tall.jpg', label: 'Mây hồng', css: 'background-image:url(assets/cover-default-tall.jpg)' },
      { v: 'assets/cover-male-wide.jpg', label: 'Biển hoàng hôn', css: 'background-image:url(assets/cover-male-wide.jpg)' }
    ];
    var grid = presets.map(function (p) {
      return '<button class="cover-pick' + (cur === p.v ? ' on' : '') + '" data-action="pick-cover" ' +
        'data-id="' + esc(id) + '" data-v="' + esc(p.v) + '"><span class="cover-pick-thumb" style="' + p.css + '"></span>' +
        '<span>' + p.label + '</span></button>';
    }).join('');
    openModal(
      '<div class="modal-sheet cover-sheet"><div class="modal-head"><h3>Ảnh nền — ' +
      esc(profileNameOf(id)) + '</h3><button data-action="close-modal">✕</button></div>' +
      '<div class="cover-grid">' + grid + '</div>' +
      '<label class="btn btn-block av-upload">Tải ảnh từ máy' +
      '<input type="file" accept="image/*" id="coverUpload" data-id="' + esc(id) + '" hidden></label>' +
      (cur ? '<button class="btn btn-block av-clear" data-action="clear-cover" data-id="' + esc(id) + '">Bỏ ảnh nền</button>' : '') +
      '</div>'
    );
  }
  /* Nhập "nhắc trước" (ngày) và "giờ gửi" ở trang Nhắc nhở — lưu ngay, không render lại
     để con trỏ không nhảy khi đang gõ số */
  function bindReminderInputs() {
    var rs = document.getElementById('rmSearch');
    if (rs && !rs.dataset.bound) {
      rs.dataset.bound = '1';
      rs.addEventListener('input', function () {
        rmQuery = rs.value;
        var pos = rs.selectionStart;
        render();
        var again = document.getElementById('rmSearch');
        if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (e) {} }
      });
    }
    var nb = document.querySelector('[data-role="remind-before"]');
    if (nb && !nb.dataset.bound) {
      nb.dataset.bound = '1';
      nb.addEventListener('change', function () {
        var v = parseInt(nb.value, 10);
        state.settings.remindBefore = isNaN(v) ? 3 : Math.max(0, Math.min(30, v));
        save();
      });
    }
    var nt = document.querySelector('[data-role="remind-time"]');
    if (nt && !nt.dataset.bound) {
      nt.dataset.bound = '1';
      nt.addEventListener('change', function () {
        if (nt.value) { state.settings.reminderDefaultTime = nt.value; save(); }
      });
    }
  }

  /* 2 ô chọn file trong modal avatar/cover: đọc + nén rồi lưu */
  function bindProfileUploads() {
    var a = document.getElementById('avatarUpload');
    if (a && !a.dataset.bound) {
      a.dataset.bound = '1';
      a.addEventListener('change', function (e) {
        var f = e.target.files && e.target.files[0]; if (!f) return;
        compressImage(f).then(function (url) {
          if (!url) { showToast('Không đọc được ảnh'); return; }
          setProfileAvatar(a.dataset.id, url);
        });
      });
    }
    var c = document.getElementById('coverUpload');
    if (c && !c.dataset.bound) {
      c.dataset.bound = '1';
      c.addEventListener('change', function (e) {
        var f = e.target.files && e.target.files[0]; if (!f) return;
        compressImage(f).then(function (url) {
          if (!url) { showToast('Không đọc được ảnh'); return; }
          setProfileCover(c.dataset.id, url);
        });
      });
    }
    var ap = document.getElementById('addPersonAvatarUpload');
    if (ap && !ap.dataset.bound) {
      ap.dataset.bound = '1';
      ap.addEventListener('change', function (e) {
        var f = e.target.files && e.target.files[0]; if (!f) return;
        compressImage(f).then(function (url) {
          if (!url) { showToast('Không đọc được ảnh'); return; }
          openAddPersonAvatar = url;
          var box = ap.parentElement.parentElement.querySelector('.av-grid');
          if (box) {
            var picks = box.querySelectorAll('.av-pick');
            for (var i = 0; i < picks.length; i++) picks[i].classList.remove('on');
            var prev = box.querySelector('.av-upload-preview');
            if (!prev) {
              prev = document.createElement('span');
              prev.className = 'av-pick av-upload-preview on';
              box.appendChild(prev);
            }
            prev.innerHTML = '<img src="' + url + '" alt="">';
          }
          showToast('Đã chọn ảnh từ máy');
        });
      });
    }
  }

  /* ===== Quỹ đạo: số vòng theo sĩ số (rule người dùng đặt) ===== */
  function ringCountFor(n) {
    if (n <= 3) return 1;
    if (n <= 8) return 2;
    if (n <= 18) return 3;
    if (n <= 32) return 4;
    if (n <= 50) return 5;
    if (n <= 72) return 6;
    if (n <= 98) return 7;
    if (n <= 150) return 8;
    return 9;                       // 151–300 và 301–500
  }
  /* Đường kính từng vòng: trải đều tới 99%. Từ 98 người trở lên thì thu hẹp lại
     một chút để nhường chỗ cho các chấm nhỏ. */
  function ringPcts(k, dotMode) {
    var out = [];
    for (var i = 0; i < k; i++) {
      if (k === 1) { out.push(58); continue; }
      out.push(Math.round((dotMode ? 18 : 0) + (99 - (dotMode ? 18 : 0)) * (i + 1) / k));
    }
    return out;
  }
  /* Hạng ưu tiên: gia đình luôn gần tâm nhất, còn lại theo Cài đặt -> Quỹ đạo */
  var PRIORITY_RANK = { highest: 0, high: 1, medium: 2, low: 3 };
  function relRank(rel) {
    if (rel === 'family') return -1;
    var pr = (state.settings && state.settings.relationPriority) || DEFAULT_PRIORITY;
    var lvl = pr[rel] || 'low';
    return PRIORITY_RANK[lvl] === undefined ? 3 : PRIORITY_RANK[lvl];
  }
  /* Chia người vào vòng: người bị kéo tay giữ nguyên vòng đã đặt, số còn lại
     xếp theo thứ tự ưu tiên rồi chia theo chu vi (vòng rộng nhận nhiều hơn). */
  function layoutOrbit(people) {
    var n = people.length;
    var k = ringCountFor(n);
    var dotMode = n >= 98;
    var pcts = ringPcts(k, dotMode);
    var rings = [];
    for (var i = 0; i < k; i++) rings.push([]);
    var auto = [];
    people.forEach(function (p) {
      if (p.ring && Number(p.ring) >= 1) rings[Math.min(k, Number(p.ring)) - 1].push(p);
      else auto.push(p);
    });
    auto.sort(function (a, b) {
      return relRank(a.relationship) - relRank(b.relationship) ||
        (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0) ||
        String(a.name).localeCompare(String(b.name), 'vi');
    });
    var total = pcts.reduce(function (s, v) { return s + v; }, 0);
    var targets = pcts.map(function (v) { return Math.round(n * v / total); });
    var diff = n - targets.reduce(function (s, v) { return s + v; }, 0);
    targets[targets.length - 1] = Math.max(0, targets[targets.length - 1] + diff);
    var idx = 0;
    for (var r = 0; r < k; r++) {
      var need = Math.max(0, targets[r] - rings[r].length);
      for (var j = 0; j < need && idx < auto.length; j++) rings[r].push(auto[idx++]);
    }
    while (idx < auto.length) rings[k - 1].push(auto[idx++]);
    return { rings: rings, pcts: pcts, k: k, dotMode: dotMode };
  }
  function renderOrbit(people, compact) {
    var lay = layoutOrbit(people);
    var rings = lay.rings, pcts = lay.pcts, dotMode = lay.dotMode;
    var scene = '';
    rings.forEach(function (list, r) {
      var d = pcts[r], period = 90 + r * 40;
      scene += '<div class="orbit-ring" data-ring="' + (r + 1) + '" style="width:' + d + '%;height:' + d + '%"></div>';
      if (dotMode) {
        /* Từ 98 người: phần lớn chỉ là chấm nhỏ; chỉ gia đình và người có dấu sao
           được vẽ avatar kèm tên. Đặt tĩnh theo góc để vài trăm phần tử vẫn nhẹ. */
        scene += '<div class="orbit-static" style="width:' + d + '%;height:' + d + '%">';
        list.forEach(function (p, i) {
          /* Lệch góc mỗi vòng để avatar/chấm không xếp thành cột thẳng đứng
             theo trục 12 giờ - 6 giờ (trước đây nhãn chồng lên nhau). */
          var ang = ((i + 0.5) / Math.max(list.length, 1)) * Math.PI * 2 - Math.PI / 2 + r * 0.62;
          var pos = 'left:' + (50 + 50 * Math.cos(ang)).toFixed(2) + '%;top:' + (50 + 50 * Math.sin(ang)).toFixed(2) + '%;';
          if (p.relationship === 'family' || p.favorite) {
            scene += '<button class="orbit-avatar orbit-static-av' + (orbitFocus === p.id ? ' focused' : '') + '" data-action="focus-person" data-pid="' + esc(p.id) + '" style="' + pos + avatarStyle(p) + 'border-color:' + ringColor(p.relationship) + ';" aria-label="Chọn ' + esc(p.name) + '">' +
              '<span class="av-wrap">' + avatarInner(p) + '</span>' + (p.favorite ? '<span class="fav-dot">★</span>' : '') + '<span class="name-tag">' + esc(p.name) + '</span></button>';
          } else {
            scene += '<i class="orbit-member-dot" data-action="focus-person" data-pid="' + esc(p.id) + '" title="' + esc(p.name) + '" style="' + pos + 'background:' + avatarColor(p.id) + '"></i>';
          }
        });
        scene += '</div>';
        return;
      }
      list.forEach(function (p, i) {
        var delay = -(i / Math.max(list.length, 1) + r * 0.11) * period;
        scene += '<div class="orbit-track" style="width:' + d + '%;height:' + d + '%;--period:' + period + 's;--phase:' + delay + 's">' +
          '<button class="orbit-avatar orbit-traveler' + (orbitFocus === p.id ? ' focused' : '') + '" data-action="focus-person" data-pid="' + esc(p.id) + '" style="' + avatarStyle(p) + 'border-color:' + ringColor(p.relationship) + ';" aria-label="Chọn ' + esc(p.name) + '">' +
          '<span class="av-wrap">' + avatarInner(p) + '</span>' + (p.favorite ? '<span class="fav-dot">★</span>' : '') + '<span class="name-tag">' + esc(p.name) + '</span></button></div>';
      });
      ['#DFA8B9', '#B5CBB3', '#E8C076', '#A9BFD9'].forEach(function (color, i) {
        var delay = -(i / 4 + r * 0.17) * period;
        scene += '<div aria-hidden="true" class="orbit-track orbit-dust-track" style="width:' + d + '%;height:' + d + '%;--period:' + period + 's;--phase:' + delay + 's">' +
          '<i class="orbit-dust" style="background:' + color + ';width:' + (5 + i * 2) + 'px;height:' + (5 + i * 2) + 'px"></i></div>';
      });
    });
    /* Sức chứa: stage gốc (danh bạ mở) chỉ đủ cho ~17 người trên một vòng mà không
       chồng nhau — hai vòng liền kề chỉ cách 41px trong khi avatar 56px. Vượt ngưỡng
       đó thì phải dùng layout thu gọn (avatar nhỏ + stage rộng) mới đủ chỗ. */
    var tight = compact || (!orbitCollapsed && people.length > 17) || people.length >= 98;
    return '<div class="orbit-wrap' + (compact ? ' is-filtered' : '') + (dotMode ? ' is-dots' : '') + (tight && !compact ? ' is-tight' : '') + '"><div class="orbit-viewport' + (orbitMotionPaused ? ' motion-paused' : '') + '" id="orbitViewport" aria-label="Bản đồ mối quan hệ, kéo để di chuyển, cuộn để phóng to">' +
      '<div class="orbit-pan" id="orbitPan"><div class="orbit-stage">' + scene +
      '<div class="orbit-center" title="Bạn"><img class="av-img" src="assets/avatars/av-01.png" alt="Bạn"></div></div></div>' +
      '<div class="orbit-zoom">' +
      '<button data-action="orbit-zoom" data-dz="1" data-tip="Phóng to" aria-label="Phóng to">' + svgIcon(ORBIT_IC.plus) + '</button>' +
      '<button data-action="orbit-zoom" data-dz="-1" data-tip="Thu nhỏ" aria-label="Thu nhỏ">' + svgIcon(ORBIT_IC.minus) + '</button>' +
      '<button data-action="orbit-reset" data-tip="Về toàn cảnh" aria-label="Về toàn cảnh">' + svgIcon(ORBIT_IC.target) + '</button>' +
      '<button data-action="orbit-motion" data-tip="' + (orbitMotionPaused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động') + '" aria-label="' + (orbitMotionPaused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động') + '" aria-pressed="' + orbitMotionPaused + '">' + svgIcon(orbitMotionPaused ? ORBIT_IC.play : ORBIT_IC.pause) + '</button>' +
      '<button data-action="reset-orbit-layout" data-tip="Đặt lại quỹ đạo" aria-label="Đặt lại quỹ đạo theo mức ưu tiên">' + svgIcon(ORBIT_IC.reset) + '</button></div>' +
      renderOrbitFocusCard() + '</div></div>';
  }

  function renderOrbitFocusCard() {
    if (!orbitFocus) return '';
    var p = state.people.find(function (x) { return x.id === orbitFocus; });
    if (!p) return '';
    var nb = p.birthday ? nextBirthdayISO(p.birthday, todayISO()) : null;
    var days = nb ? daysBetween(todayISO(), nb) : null;
    var bdayText = nb ? (days === 0 ? 'Hôm nay · ' + formatMMDD(p.birthday) : days + ' ngày nữa · ' + formatMMDD(p.birthday)) : 'Chưa có';
    var mems = (p.memories || []).map(function (m) { return m.caption; }).filter(Boolean);
    var memText = mems.length ? (mems.length > 1 ? mems[0] + ' +' + (mems.length - 1) : mems[0]) : 'Chưa có kỷ niệm';
    var chips = '';
    var ringTotals = ringCountFor(state.people.length);
    for (var i = 1; i <= ringTotals; i++) {
      chips += '<button class="ring-chip' + (p.ring === i ? ' on' : '') + '" data-action="move-person" data-pid="' + esc(p.id) + '" data-ring="' + i + '">Vòng ' + i + '</button>';
    }
    return '<div class="orbit-focus-card" role="dialog" aria-label="Thông tin ' + esc(p.name) + '">' +
      '<div class="fc-head"><span class="fc-av" style="' + avatarStyle(p) + '">' + avatarInner(p) + '</span>' +
      '<div class="fc-title"><b>' + esc(p.name) + '</b><span>' + esc(REL_LABEL[p.relationship] || 'Khác') + '</span></div>' +
      '<button class="fc-close" data-action="close-focus" aria-label="Đóng">✕</button></div>' +
      '<div class="fc-facts">' +
      '<div class="fc-fact"><span>Mối quan hệ</span><b>' + esc(REL_LABEL[p.relationship] || 'Khác') + '</b></div>' +
      ((p.groups || []).length ? '<div class="fc-fact"><span>Nhóm</span><b>' + esc(groupNames(p.groups).join(', ')) + '</b></div>' : '') +
      '<div class="fc-fact"><span>Sinh nhật</span><b>' + esc(bdayText) + '</b></div>' +
      '<div class="fc-fact"><span>Ký ức nổi bật</span><b>' + esc(memText) + '</b></div>' +
      '</div>' +
      '<div class="fc-actions">' +
      '<button class="fc-btn" data-action="nav" data-to="people/' + esc(p.id) + '">Xem chi tiết</button>' +
      '<button class="fc-btn" data-action="toggle-move" data-pid="' + esc(p.id) + '">Di chuyển</button>' +
      '<button class="fc-btn danger" data-action="delete-person" data-id="' + esc(p.id) + '">Xoá</button>' +
      '</div>' +
      (movePickerOpen ? '<div class="fc-rings">' + chips + '</div>' : '') +
      '</div>';
  }

  function renderPeopleGrid(list) {
    if (!list.length) return '<div class="empty-state">Chưa có ai trong nhóm này.</div>';
    var html = '<div class="people-grid">';
    list.forEach(function (p) {
      html += '<a class="person-chip" href="#/people/' + p.id + '"><div class="avatar" style="' + avatarStyle(p) + '">' + avatarInner(p) + '</div>' +
        (p.favorite ? '<span class="fav">★</span>' : '') + '<div class="pname">' + esc(p.name) + '</div></a>';
    });
    html += '<a class="person-chip add-new" href="#" data-action="open-add-person"><div class="avatar">+</div><div class="pname">Thêm người</div></a></div>';
    return html;
  }

  function ensureContactAvatars() {
    // Upgrade existing contacts, not only new seed data. Keep chosen/uploaded images.
    var changed = false;
    state.people.forEach(function (p) {
      if (!p.photo && typeof p.avatar === 'undefined') {
        p.avatar = 'av-' + String(1 + Math.floor(Math.random() * AVATAR_COUNT)).padStart(2, '0');
        changed = true;
      }
    });
    if (changed) save();
  }
  function togglePeopleDrawer() {
    orbitCollapsed = !orbitCollapsed;
    // khung orbit đổi bề rộng -> lùi/tiến camera cho khớp, có easing
    if (!orbitFocus) animateOrbitView({ scale: defaultOrbitScale(), x: 0, y: 0 }, 340);
    var split = document.querySelector('.people-split');
    if (!split) return;
    split.classList.toggle('contacts-collapsed', orbitCollapsed);
    /* Đổi bề rộng khung là đổi sức chứa -> phải cập nhật layout thu gọn ngay,
       không chờ render lại (render chỉ chạy khi dữ liệu/route đổi). */
    var wrap = document.querySelector('.orbit-wrap');
    if (wrap && !wrap.classList.contains('is-filtered')) {
      wrap.classList.toggle('is-tight', !orbitCollapsed && wrap.querySelectorAll('.orbit-avatar').length > 17);
    }
    var panel = document.getElementById('contactsPanel');
    if (panel) panel.inert = orbitCollapsed && window.innerWidth >= 900;
    document.querySelectorAll('[data-action="toggle-orbit"]').forEach(function (b) {
      b.setAttribute('aria-expanded', String(!orbitCollapsed));
      var label = b.querySelector('span'), arrow = b.querySelector('i');
      if (label) label.textContent = orbitCollapsed ? 'Danh bạ' : 'Thu gọn';
      if (arrow) arrow.textContent = orbitCollapsed ? '‹' : '›';
    });
  }
  function toggleOrbitMotion() {
    orbitMotionPaused = !orbitMotionPaused;
    var vp = document.getElementById('orbitViewport');
    if (vp) vp.classList.toggle('motion-paused', orbitMotionPaused);
    document.querySelectorAll('[data-action="orbit-motion"]').forEach(function (b) {
      var lbl = orbitMotionPaused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động';
      b.innerHTML = svgIcon(orbitMotionPaused ? ORBIT_IC.play : ORBIT_IC.pause);
      b.dataset.tip = lbl;
      b.setAttribute('aria-pressed', String(orbitMotionPaused));
      b.setAttribute('aria-label', lbl);
    });
  }
  function renderPeople() {
    ensureContactAvatars();
    var filtered = state.people.filter(personMatchesFilters);
    var listed = searchPeople(filtered);
    return '<div class="people-head"><h1 class="page-title" style="margin:0">Mọi người' +
      '<span class="page-count" title="Tổng số người trong Orbit">' + state.people.length + '</span></h1>' +
      '<button class="btn-add-round" data-action="open-add-person" aria-label="Thêm người">+</button></div>' +
      '<div class="people-split' + (orbitCollapsed ? ' contacts-collapsed' : '') + '">' +
      '<section class="people-orbit-col">' + renderOrbit(filtered, hasActiveFilter()) + '</section>' +
      '<button class="contacts-tab" data-action="toggle-orbit" aria-controls="contactsPanel" aria-expanded="' + !orbitCollapsed + '">' +
      '<span>' + (orbitCollapsed ? 'Danh bạ' : 'Thu gọn') + '</span><i aria-hidden="true">' + (orbitCollapsed ? '‹' : '›') + '</i></button>' +
      '<section class="people-list-col" id="contactsPanel" aria-label="Danh sách liên lạc">' +
      '<div class="contacts-panel-head"><b>Liên lạc <span>' + listed.length + '</span></b></div>' +
      statsCardHtml() +
      '<label class="search-pill"><span aria-hidden="true">⌕</span>' +
      '<input id="peopleSearch" type="search" aria-label="Tìm người" placeholder="Tìm người…" value="' + esc(peopleQuery) + '"></label>' +
      '<div class="filter-block"><span class="filter-label">Mối quan hệ</span><div class="filter-pills">' +
      '<button class="pill' + (!hasActiveFilter() ? ' active' : '') + '" data-action="clear-filters">Tất cả</button>' +
      REL_TYPES.map(relChip).join('') +
      '<button class="pill' + (peopleFavOnly ? ' active' : '') + '" data-action="toggle-fav-filter" aria-pressed="' + peopleFavOnly + '">★ Yêu thích</button></div></div>' +
      ((state.settings.groups || []).length ? '<div class="filter-block"><span class="filter-label">Nhóm</span><div class="filter-pills">' +
        (state.settings.groups || []).map(groupChip).join('') + '</div></div>' : '') +
      renderPeopleGrid(listed) + '</section></div>';
  }

  function relDurationLabel(p) {
    var bits = [];
    if (p.relationship && REL_LABEL[p.relationship]) bits.push(REL_LABEL[p.relationship]);
    if (p.since) {
      var years = new Date().getFullYear() - Number(p.since);
      if (years > 0) bits.push('bên nhau ' + years + ' năm');
    }
    return bits.join(' · ');
  }

  function renderPersonDetail(id) {
    var p = state.people.find(function (x) { return x.id === id; });
    if (p && state.settings.lastPersonId !== p.id) {
      state.settings.lastPersonId = p.id;
      save();
    }
    if (p && pdTabFor !== p.id) { pdTab = 'all'; pdTabFor = p.id; }
    if (!p) return '<p>Không tìm thấy người này.</p><a class="btn btn-ghost" href="#/people">‹ Quay lại</a>';
    var mems = (p.memories || []).filter(function (m) { return !m.hidden; });
    var memTiles = mems.slice(0, 3).map(function (m) {
      if (m.type === 'guest_message') {
        return '<button class="memory-tile guest" data-action="open-guest-memory" data-id="' + esc(p.id) + '" data-mid="' + esc(m.id) + '" style="background:' + (m.color || '#F6E2E4') + ';">' +
          '<span class="mem-badge">Lời nhắn gửi đến bạn</span>' + esc(m.caption) + '</button>';
      }
      return '<div class="memory-tile" style="background:' + m.color + ';">' + esc(m.caption) + '</div>';
    }).join('');
    var extra = mems.length > 3
      ? '<div class="memory-tile" style="background:#999;"><div class="more-badge">+' + (mems.length - 3) + '</div></div>'
      : '<div class="memory-tile add" data-action="add-memory" data-id="' + p.id + '">+</div>';

    var postedPhotos = [];
    (p.memories || []).forEach(function (m) { (m.images || []).forEach(function (src) { postedPhotos.push(src); }); });

    var collapsed = !!state.settings.pdSideCollapsed;
    /* Mục đầu danh bạ luôn là CHÍNH BẠN, để từ hồ sơ của người khác bấm một lần là về được
       Trang cá nhân của mình — hai dải danh bạ ở hai trang vì thế giống hệt nhau. */
    var selfEntry = '<a class="pd-person" href="#/me">' +
      '<span class="avatar"><img class="av-img" src="assets/avatars/av-01.png" alt=""></span>' +
      '<span class="pd-name"><b>' + esc(state.settings.profileName || 'Bạn') + '</b><em>Trang của bạn</em></span></a>';
    var peopleCol = selfEntry + state.people.map(function (q) {
      return '<a class="pd-person' + (q.id === p.id ? ' on' : '') + '" href="#/people/' + q.id + '">' +
        '<span class="avatar" style="' + avatarStyle(q) + '">' + avatarInner(q) + '</span>' +
        '<span class="pd-name"><b>' + esc(q.name) + '</b><em>' + esc(REL_LABEL[q.relationship] || 'Khác') + '</em></span>' +
        (q.favorite ? '<span class="pd-fav">★</span>' : '') + '</a>';
    }).join('');

    var cover = p.cover ? esc(p.cover) : defaultCover('wide');
    var coverTall = p.coverTall ? esc(p.coverTall) : defaultCover('tall');

    return (
      '<div class="pd-shell' + (collapsed ? ' side-collapsed' : '') + '">' +

      '<aside class="pd-side" id="pdSide"' + (collapsed ? ' inert' : '') + '>' +
      '<div class="pd-side-head"><h2>Mọi người</h2><span class="pd-count">' + state.people.length + '</span></div>' +
      '<div class="pd-list">' + peopleCol + '</div>' +
      '<a class="pd-add" href="#" data-action="open-add-person">＋ Thêm người</a>' +
      '</aside>' +

      '<button class="pd-side-toggle" data-action="toggle-pd-side" aria-expanded="' + (!collapsed) + '" ' +
      'aria-controls="pdSide" title="' + (collapsed ? 'Mở danh bạ' : 'Thu gọn danh bạ') + '">' +
      '<i>' + (collapsed ? '›' : '‹') + '</i><span>Mọi người</span></button>' +

      '<div class="pd-panel">' +
      '<div class="pd-cover" style="--pd-cover:url(\'' + (profileCoverOf(p.id) || cover) + '\');--pd-cover-tall:url(\'' + (profileCoverOf(p.id) || coverTall) + '\')">' +
      '<button class="pd-back" data-action="nav" data-to="people" aria-label="Quay lại">‹</button>' +
      '<button class="pd-more" data-action="toast" data-msg="Thêm tuỳ chọn — demo" aria-label="Tuỳ chọn">⋯</button>' +
      '<button class="pd-cover-edit" data-action="open-cover-picker" data-id="' + p.id + '" title="Đổi ảnh nền" aria-label="Đổi ảnh nền">🖼 <span>Ảnh nền</span></button>' +
      '</div>' +

      '<div class="pd-head">' +
      '<button class="pd-avatar" data-action="open-avatar-picker" data-id="' + p.id + '" style="' + avatarStyle(p) + '" title="Đổi ảnh đại diện" aria-label="Đổi ảnh đại diện của ' + esc(p.name) + '">' +
      avatarInner(p) + '</button>' +
      '<div class="pd-id">' +
      '<h2>' + esc(p.name) + (p.favorite ? ' <span class="pd-star">★</span>' : '') + '</h2>' +
      '<div class="meta">' + relDurationLabel(p) + '</div>' +
      '<div class="quick-actions pd-actions">' +
      '<button class="tone-pink" data-action="quick-birthday" data-id="' + p.id + '">' + ic('cake', 20) + '<span>Sinh nhật</span></button>' +
      '<button class="tone-purple" data-action="toggle-favorite" data-id="' + p.id + '">' + (p.favorite ? '💖' : '🤍') + '<span>' + (p.favorite ? 'Bỏ thích' : 'Yêu thích') + '</span></button>' +
      '<button class="tone-blue" data-action="quick-note-focus">' + ic('leaf', 20) + '<span>Ghi chú</span></button>' +
      '<button class="tone-green" data-action="add-memory" data-id="' + p.id + '">' + ic('plane', 20) + '<span>Kỷ niệm</span></button>' +
      '<button class="tone-lilac" data-action="invite-memory" data-id="' + p.id + '"><span class="ic-emoji">✨</span><span>Mời gửi kỷ niệm</span></button>' +
      '</div></div>' +
      (p.quote ? '<div class="pd-quote">' + esc(p.quote) + '<span class="sp">✦</span></div>' : '') +
      '</div>' +

      '<nav class="pd-tabs" aria-label="Mục hồ sơ">' +
      (function () {
        var tabs = [['all', 'Tổng'], ['photos', 'Ảnh đăng'], ['diary', 'Nhật ký'], ['activity', 'Hoạt động']];
        return tabs.map(function (t) {
          return '<button class="pd-tab' + (pdTab === t[0] ? ' on' : '') + '" data-action="pd-tab" data-tab="' + t[0] + '">' + t[1] + '</button>';
        }).join('');
      })() +
      '</nav>' +

      '<div class="pd-grid">' +

      /* 70% trái: mỗi tab hiện nội dung riêng, tab Tổng trộn theo thời gian */
      '<div class="pd-col pd-col-feed">' +
      (function () {
        var items = [];
        (p.memories || []).forEach(function (m) {
          (m.images || []).forEach(function (src, i) {
            items.push({ kind: 'photo', src: src, caption: m.caption || '', at: m.createdAt || null, key: m.id + '_' + i });
          });
        });
        (p.activity || []).forEach(function (a) {
          items.push({ kind: 'activity', text: a.text, at: a.at || null, key: a.id });
        });
        items.sort(function (x, y) { return (Date.parse(y.at) || 0) - (Date.parse(x.at) || 0); });

        var photos = items.filter(function (i) { return i.kind === 'photo'; });

        function tlRow(it) {
          var when = it.at ? timeAgo(it.at) : '';
          if (it.kind === 'photo') {
            return '<div class="tl-item"><img class="tl-thumb" src="' + esc(it.src) + '" alt="">' +
              '<div class="tl-body"><b>Ảnh kỷ niệm</b>' + (it.caption ? '<span>' + esc(it.caption) + '</span>' : '') + '</div>' +
              '<time class="tl-time">' + esc(when) + '</time></div>';
          }
          return '<div class="tl-item"><span class="tl-dot"></span>' +
            '<div class="tl-body"><b>' + esc(it.text) + '</b></div>' +
            '<time class="tl-time">' + esc(when) + '</time></div>';
        }

        if (pdTab === 'photos') {
          return photos.length
            ? '<div class="posted-grid">' + photos.map(function (it) { return '<img src="' + esc(it.src) + '" alt="">'; }).join('') + '</div>'
            : '<p class="muted feed-empty">Chưa có ảnh nào. Ảnh gửi qua link mời sẽ xuất hiện ở đây.</p>';
        }
        if (pdTab === 'diary') {
          var pe = diaryEntries(p.id);
          return pe.length ? pe.map(function (d) { return entryCardHtml(d, { deletable: true }); }).join('')
            : '<p class="muted feed-empty">Chưa có dòng nhật ký nào về ' + esc(p.name) + '. <a class="me-link" href="#/diary">Viết ngay ›</a></p>';
        }
        if (pdTab === 'activity') {
          return items.filter(function (i) { return i.kind === 'activity'; }).map(tlRow).join('') ||
            '<p class="muted feed-empty">Chưa có hoạt động.</p>';
        }
        return items.length ? items.map(tlRow).join('') : '<p class="muted feed-empty">Chưa có gì trong dòng thời gian của ' + esc(p.name) + '.</p>';
      })() +
      '</div>' +

      /* 30% phải: thông tin — kỷ niệm — ghi chú — nhắc nhở, dính khi cuộn */
      '<div class="pd-col pd-col-intro">' +

      '<section class="pd-block" id="pdIntro">' +
      '<div class="section-head"><h2>Thông tin</h2></div>' +
      '<div class="quickinfo-row"><span class="ic">' + ic('cake', 18) + '</span> Sinh nhật <b>' + (p.birthday ? formatMMDD(p.birthday) : 'Chưa có') + '</b></div>' +
      '<div class="quickinfo-row"><span class="ic">🏷️</span> Mối quan hệ <b>' + (REL_LABEL[p.relationship] || 'Khác') + '</b></div>' +
      ((p.groups || []).length ? '<div class="quickinfo-row"><span class="ic">📁</span> Nhóm <b>' + esc(groupNames(p.groups).join(', ')) + '</b></div>' : '') +
      (p.since ? '<div class="quickinfo-row"><span class="ic">✦</span> Quen từ <b>' + esc(String(p.since)) + '</b></div>' : '') +
      '</section>' +

      '<section class="pd-block" id="pdMemories">' +
      '<div class="section-head"><h2>Kỷ niệm</h2><button class="link-more" data-action="add-memory" data-id="' + p.id + '">+ Thêm</button></div>' +
      '<div class="memory-grid">' + memTiles + extra + '</div>' +
      '</section>' +

      '<section class="pd-block" id="pdNotes">' +
      '<div class="section-head"><h2>Ghi chú</h2></div>' +
      '<textarea id="notes-area" placeholder="Viết điều bạn nhớ về ' + esc(p.name) + '...">' + esc(p.notes) + '</textarea></section>' +

      '<section class="pd-block">' +
      '<div class="section-head"><h2>Nhắc nhở</h2></div>' +
      ((p.reminders || []).map(function (r) {
        return '<div class="reminder-row"><div class="t">' + esc(r.label) + '<span>' + (r.mmdd ? formatMMDD(r.mmdd) : (r.date || '')) + '</span></div>' +
          '<button class="toggle ' + (r.enabled ? 'on' : '') + '" data-action="toggle-reminder" data-pid="' + p.id + '" data-rid="' + r.id + '"></button></div>';
      }).join('') || '<p class="muted" style="margin:0;">Chưa có nhắc nhở.</p>') +
      '<button class="btn btn-text" data-action="add-reminder-inline" data-pid="' + p.id + '" style="margin-top:8px;">+ Thêm nhắc nhở</button>' +
      '</section>' +
      '<button class="btn btn-danger btn-block" data-action="delete-person" data-id="' + p.id + '">Xoá liên hệ</button>' +
      '</div>' +
      '</div></div></div>'


    );
  }

  function bindNotesArea(personId) {
    var ta = document.getElementById('notes-area');
    if (!ta) return;
    ta.addEventListener('blur', function () {
      var p = state.people.find(function (x) { return x.id === personId; });
      if (!p) return;
      if (p.notes !== ta.value) { p.notes = ta.value; logActivity(p, 'Đã cập nhật ghi chú'); save(); }
    });
  }

  /* ---------------------------- Calendar ---------------------------- */
  function eventsOnDate(iso, mmdd) {
    var out = [];
    state.people.forEach(function (p) {
      if (p.birthday === mmdd) out.push({ title: 'Sinh nhật ' + p.name, kind: 'birthday', date: iso, personName: p.name, time: '', location: '', note: '' });
    });
    state.events.forEach(function (ev) {
      var pm = ev.personId ? state.people.find(function (x) { return x.id === ev.personId; }) : null;
      var base = { date: iso, note: ev.note || '', location: ev.location || '', time: ev.time || '', personName: pm ? pm.name : '' };
      if (ev.type === 'memory') {
        if (ev.annMMDD === mmdd) out.push(Object.assign({ title: ev.title, kind: 'memory' }, base));
        return;
      }
      if (ev.date === iso) out.push(Object.assign({ title: ev.title, kind: ev.type }, base));
    });
    return out;
  }

  /* Chi tiết sự kiện: chỉ hiện những trường thực sự có dữ liệu */
  function openEventDetail(dateIso, idx) {
    var evs = eventsOnDate(dateIso, dateIso.slice(5, 7) + '-' + dateIso.slice(8, 10));
    var e = evs[idx];
    if (!e) return;
    var dd = new Date(dateIso + 'T00:00:00');
    var rows = [['Ngày', DOW[(dd.getDay() + 6) % 7] + ', ' + dd.getDate() + '/' + (dd.getMonth() + 1) + '/' + dd.getFullYear()]];
    if (e.time) rows.push(['Thời gian', e.time]);
    if (e.location) rows.push(['Địa điểm', e.location]);
    if (e.personName) rows.push(['Liên quan', e.personName]);
    if (e.note) rows.push(['Ghi chú', e.note]);
    openModal(
      '<div class="modal-card event-detail">' +
      '<div class="ed-head"><span class="cal-tag ' + evTone(e.kind) + '">' + evIcon(e.kind, 26) + '<span>' + esc(e.title) + '</span></span>' +
      '<button class="btn-icon" data-action="close-modal" aria-label="Đóng">✕</button></div>' +
      '<div class="ed-rows">' + rows.map(function (r) {
        return '<div class="ed-row"><span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b></div>';
      }).join('') + '</div></div>'
    );
  }

  /* ---------------------------- Trang cá nhân của BẠN ---------------------------- */
  function receivedMessages() {
    var out = [];
    state.people.forEach(function (p) {
      (p.memories || []).forEach(function (m) {
        if (m.type === 'guest_message' && !m.hidden) out.push({ p: p, m: m });
      });
    });
    out.sort(function (a, b) { return (Date.parse(b.m.at) || 0) - (Date.parse(a.m.at) || 0); });
    return out;
  }

  /* Cùng khung pd-panel/pd-cover/pd-head/pd-tabs/pd-grid dùng cho trang hồ sơ của người
     khác (renderPersonDetail) — để "Trang cá nhân" của chính bạn trông giống hệt, chỉ
     khác nội dung (không có danh bạ bên trái vì đây không phải một liên hệ để duyệt). */
  var ME_TABS = [['overview', 'Tổng quan'], ['diary', 'Nhật ký'], ['messages', 'Lời nhắn'], ['groups', 'Nhóm']];
  function renderMe() {
    var name = state.settings.profileName || 'Bạn';
    var stats = connectionStats();
    var msgs = receivedMessages();
    var groups = state.settings.groups || [];
    var upcoming = getOccasions(30).length;

    var relRows = REL_TYPES.map(function (r) {
      var n = stats.counts[r.k] || 0;
      if (!n) return '';
      return '<div class="me-rel"><span class="stats-dot" style="background:' + ringColor(r.k) + '"></span>' +
        '<span>' + r.label + '</span><b>' + n + '</b></div>';
    }).join('');

    function msgRow(x, trimLen) {
      return '<a class="me-msg" href="#/people/' + x.p.id + '"><img src="' + (x.m.images && x.m.images[0] ? x.m.images[0] : 'assets/avatars/av-01.png') + '" alt="">' +
        '<div class="t"><b>' + esc(x.p.name) + '</b><span>' + esc((x.m.caption || '').slice(0, trimLen)) + '</span></div>' +
        '<time>' + (x.m.at ? timeAgo(x.m.at) : '') + '</time></a>';
    }

    var feed;
    if (meTab === 'diary') {
      var mine = diaryEntries('me');
      feed = mine.length ? mine.map(function (d) { return entryCardHtml(d, { deletable: true }); }).join('')
        : '<p class="muted feed-empty">Chưa có bài nhật ký nào. <a class="me-link" href="#/diary">Mở sổ viết ngay ›</a></p>';
    } else if (meTab === 'messages') {
      feed = msgs.length ? msgs.map(function (x) { return msgRow(x, 90); }).join('')
        : '<p class="muted feed-empty">Chưa nhận lời nhắn nào. Mời ai đó gửi kỷ niệm từ trang hồ sơ của họ.</p>';
    } else if (meTab === 'groups') {
      feed = groups.length ? groups.map(function (g) {
        var n = state.people.filter(function (p) { return (p.groups || []).indexOf(g.id) > -1; }).length;
        return '<div class="me-group"><span>' + esc(g.name) + '</span><b>' + n + '</b></div>';
      }).join('') : '<p class="muted feed-empty">Chưa có nhóm nào. Tạo nhóm trong Cài đặt › Quỹ đạo.</p>';
    } else {
      feed = msgs.length ? msgs.slice(0, 8).map(function (x) {
        return '<div class="tl-item"><img class="tl-thumb" src="' + (x.m.images && x.m.images[0] ? x.m.images[0] : 'assets/avatars/av-01.png') + '" alt="">' +
          '<div class="tl-body"><b>' + esc(x.p.name) + ' đã gửi lời nhắn</b>' + (x.m.caption ? '<span>' + esc(x.m.caption.slice(0, 80)) + '</span>' : '') + '</div>' +
          '<time class="tl-time">' + (x.m.at ? timeAgo(x.m.at) : '') + '</time></div>';
      }).join('') : '<p class="muted feed-empty">Chưa có hoạt động nào. Khi ai đó gửi lời nhắn, nó sẽ hiện ở đây.</p>';
    }

    var railCollapsed = !!state.settings.pdSideCollapsed;
    /* Dải danh bạ bên trái giống hệt trang hồ sơ người khác — chỉ thêm chính bạn ở đầu
       danh sách (đang chọn), bấm vào ai là nhảy sang hồ sơ của người đó ở mục Mọi người. */
    var railPeople = state.people.map(function (q) {
      return '<a class="pd-person" href="#/people/' + q.id + '">' +
        '<span class="avatar" style="' + avatarStyle(q) + '">' + avatarInner(q) + '</span>' +
        '<span class="pd-name"><b>' + esc(q.name) + '</b><em>' + esc(REL_LABEL[q.relationship] || 'Khác') + '</em></span>' +
        (q.favorite ? '<span class="pd-fav">★</span>' : '') + '</a>';
    }).join('');

    return (
      '<div class="pd-shell' + (railCollapsed ? ' side-collapsed' : '') + '">' +

      '<aside class="pd-side" id="meSide"' + (railCollapsed ? ' inert' : '') + '>' +
      '<div class="pd-side-head"><h2>Mọi người</h2><span class="pd-count">' + state.people.length + '</span></div>' +
      '<div class="pd-list">' +
      '<a class="pd-person on" href="#/me">' +
      '<span class="avatar"><img class="av-img" src="assets/avatars/av-01.png" alt=""></span>' +
      '<span class="pd-name"><b>' + esc(name) + '</b><em>Trang của bạn</em></span></a>' +
      railPeople +
      '</div>' +
      '<a class="pd-add" href="#" data-action="open-add-person">＋ Thêm người</a>' +
      '</aside>' +

      '<button class="pd-side-toggle" data-action="toggle-pd-side" aria-expanded="' + (!railCollapsed) + '" ' +
      'aria-controls="meSide" title="' + (railCollapsed ? 'Mở danh bạ' : 'Thu gọn danh bạ') + '">' +
      '<i>' + (railCollapsed ? '›' : '‹') + '</i><span>Mọi người</span></button>' +

      '<div class="pd-panel">' +
      '<div class="pd-cover" style="--pd-cover:url(\'' + (profileCoverOf('me') || defaultCover('wide')) + '\');--pd-cover-tall:url(\'' + (profileCoverOf('me') || defaultCover('tall')) + '\')">' +
      '<button class="pd-more" data-action="nav" data-to="settings" aria-label="Cài đặt">' + ic('settings', 18) + '</button>' +
      '<button class="pd-cover-edit" data-action="open-cover-picker" data-id="me" title="Đổi ảnh nền" aria-label="Đổi ảnh nền">🖼 <span>Ảnh nền</span></button>' +
      '</div>' +

      '<div class="pd-head">' +
      '<button class="pd-avatar" data-action="open-avatar-picker" data-id="me" style="' + (state.settings.profileAvatar ? 'background:transparent;' : '') + '" title="Đổi ảnh đại diện" aria-label="Đổi ảnh đại diện">' +
      (state.settings.profileAvatar
        ? '<img class="av-img" src="' + esc(avatarSrc(state.settings.profileAvatar)) + '" alt="">'
        : initials(name)) +
      '<span class="pd-avatar-edit" aria-hidden="true">✎</span></button>' +
      '<div class="pd-id">' +
      '<h2>' + esc(name) + '</h2>' +
      '<div class="meta">' + state.people.length + ' người trong quỹ đạo</div>' +
      '<div class="quick-actions pd-actions">' +
      '<button class="tone-pink" data-action="edit-me-name">' + ic('profile', 18) + '<span>Đổi tên</span></button>' +
      '<button class="tone-blue" data-action="nav" data-to="diary">' + ic('diary', 18) + '<span>Nhật ký</span></button>' +
      '<button class="tone-purple" data-action="nav" data-to="people">' + ic('people', 18) + '<span>Quỹ đạo</span></button>' +
      '<button class="tone-green" data-action="nav" data-to="calendar">' + ic('calendar', 18) + '<span>Sự kiện</span></button>' +
      '</div></div>' +
      '<div class="pd-quote">Trang cá nhân của bạn trong Orbit<span class="sp">✦</span></div>' +
      '</div>' +

      '<nav class="pd-tabs" aria-label="Mục trang cá nhân">' +
      ME_TABS.map(function (t) {
        return '<button class="pd-tab' + (meTab === t[0] ? ' on' : '') + '" data-action="me-tab" data-tab="' + t[0] + '">' + t[1] +
          (t[0] === 'messages' && msgs.length ? '<span class="count-chip">' + msgs.length + '</span>' : '') + '</button>';
      }).join('') +
      '</nav>' +

      '<div class="pd-grid">' +
      '<div class="pd-col pd-col-feed">' + feed + '</div>' +

      '<div class="pd-col pd-col-intro">' +
      '<section class="pd-block"><div class="section-head"><h2>Thông tin</h2></div>' +
      '<div class="quickinfo-row"><span class="ic">' + ic('people', 18) + '</span> Liên kết <b>' + stats.total + '</b></div>' +
      '<div class="quickinfo-row"><span class="ic">📁</span> Nhóm <b>' + stats.groups + '</b></div>' +
      '<div class="quickinfo-row"><span class="ic">' + ic('bell', 18) + '</span> Lời nhắn đã nhận <b>' + msgs.length + '</b></div>' +
      '<div class="quickinfo-row"><span class="ic">' + ic('cake', 18) + '</span> Dịp trong 30 ngày <b>' + upcoming + '</b></div>' +
      '</section>' +

      '<section class="pd-block"><div class="section-head"><h2>Quỹ đạo của bạn</h2></div>' +
      (relRows ? '<div class="me-rel-list">' + relRows + '</div>' : '<p class="muted" style="margin:0;">Chưa có liên kết nào. Thêm người đầu tiên nhé.</p>') +
      '<a class="me-link" href="#/people">Xem bản đồ quỹ đạo ›</a></section>' +

      (msgs.length ? '<section class="pd-block"><div class="section-head"><h2>Lời nhắn gần đây</h2>' +
        '<span class="count-chip">' + msgs.length + '</span></div>' +
        msgs.slice(0, 3).map(function (x) { return msgRow(x, 60); }).join('') +
        '</section>' : '') +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  

  /* Danh sách chủ đề đầy đủ — dùng trong ngăn kéo "Chủ đề" xổ ra từ bên phải màn hình */
  function diaryThemeOptionsHtml(curId) {
    return DIARY_THEMES.map(function (t) {
      return '<button class="theme-opt' + (t.id === curId ? ' on' : '') + '" style="--tab-tint:' + t.swatch + '" ' +
        'data-action="pick-diary-theme" data-theme="' + t.id + '" aria-pressed="' + (t.id === curId) + '">' +
        '<span class="theme-opt-thumb" style="background-image:url(' + t.mobile + ')"></span>' +
        '<span class="theme-opt-body"><b>' + esc(t.label) + '</b>' +
        (t.id === curId ? '<span class="theme-opt-tag">Đang dùng</span>' : '<span class="theme-opt-tag theme-opt-tag-ghost">Chạm để chọn</span>') +
        '</span>' +
        '<span class="theme-opt-check" aria-hidden="true">' + (t.id === curId ? '✓' : '') + '</span>' +
        '</button>';
    }).join('');
  }

  /* Tờ giấy dùng chung cho cả lúc VIẾT và lúc ĐỌC LẠI bài đã lưu. Tỉ lệ lấy từ chính mẫu
     giấy (--paper-ar), khung chữ và đường kẻ canh bằng % nên điện thoại hay máy tính đều
     ra đúng một bố cục. */
  function paperHtml(paper, opts) {
    opts = opts || {};
    var img = paperImg(paper);
    var style = '--paper-ar:' + paperAr(paper) + ';color:' + (paper.ink || '#3D342D') + ';';
    if (img) style += 'background-image:url(' + img + ');';
    var inner = opts.editable
      ? '<textarea class="paper-ink paper-input" id="' + (opts.id || 'diaryText') + '" spellcheck="false" ' +
        'placeholder="Hôm nay của bạn thế nào?">' + esc(opts.text || '') + '</textarea>'
      : '<div class="paper-ink">' + esc(opts.text || '') + '</div>';
    var head = opts.head ? '<div class="paper-head">' + opts.head + '</div>' : '';
    /* Lề trái kiểu sổ bấm lỗ: dãy lỗ đục + đường đứt để xé */
    var binding = (paper.binding === false || paper.custom) ? '' :
      '<div class="paper-binding" aria-hidden="true"><span class="pb-holes"></span><span class="pb-tear"></span></div>';
    return '<div class="paper ' + (opts.editable ? 'edit' : 'read') + (paper.inbook ? ' inbook' : '') +
      (opts.head ? ' has-head' : '') + ' font-' + (opts.font || 'serif') +
      ' kind-' + paper.kind + (img ? ' has-img' : '') +
      '" data-paper="' + paper.id + '" style="' + style + '">' +
      (paper.kind === 'rule' || paper.kind === 'dot' ? '<div class="paper-rules" aria-hidden="true"></div>' : '') +
      binding + head + inner +
      '</div>';
  }

  /* Canh chữ lên đúng đường kẻ. MỌI khoảng cách tính theo BỀ RỘNG tờ giấy (%) nên:
       - đổi từ khung ngang sang khung dọc vẫn giữ đúng tỉ lệ;
       - trang đọc dài ra (bài dài) thì các dòng kẻ vẫn chạy đều, chữ không trôi khỏi dòng. */
  function layoutPapers(root) {
    var list = (root || document).querySelectorAll('.paper');
    Array.prototype.forEach.call(list, function (el) {
      var paper = getPaper(el.dataset.paper);
      var w = el.clientWidth;
      if (!w) return;
      var edit = el.classList.contains('edit');
      var inbook = el.classList.contains('inbook');
      var ar = paperAr(paper);
      /* Đổi bề rộng cửa sổ qua mốc 900px thì phải đổi luôn BẢN ẢNH GIẤY (ngang ↔ dọc)
         và tỉ lệ tờ giấy — không cần render lại cả trang. */
      el.style.setProperty('--paper-ar', ar);
      var imgUrl = paperImg(paper);
      el.style.backgroundImage = imgUrl ? 'url("' + imgUrl + '")' : '';
      if (inbook) {
        /* Giấy nằm trong sổ: kích thước do khung .diary-sheet quyết định, không ép tỉ lệ */
        el.style.minHeight = '';
      } else if (!edit) {
        /* Trang đọc: thấp nhất ~45% một trang giấy cho gọn; bài dài thì tờ giấy tự giãn
           theo nội dung. Ảnh nền neo mép trên và phủ đúng bề rộng (xem .paper.has-img)
           nên cắt bớt phần dưới KHÔNG làm chữ trôi khỏi đường kẻ. */
        el.style.minHeight = Math.round((w / ar) * 0.45) + 'px';
      }
      var sizeRaw = (paper.size / 100) * w;
      var gap = (paper.gap / 100) * w;
      /* Cỡ chữ không bao giờ được vượt quá ~0.72 khoảng cách dòng (để chữ vẫn nằm gọn
         trong ô dòng của giấy) và không nhỏ hơn 8px. Khoảng cách dòng LUÔN lấy đúng theo
         mẫu giấy — nhờ vậy chữ không bao giờ trôi khỏi đường kẻ, kể cả khi tờ giấy nhỏ. */
      var size = Math.max(8, Math.min(sizeRaw, gap * 0.72));
      var firstLine = (paper.top / 100) * w;
      var padT = (paper.box.t / 100) * w;
      /* Dãy lỗ đục: chia đều ~6 lỗ theo chiều cao tờ giấy */
      var bindEl = el.querySelector('.paper-binding');
      if (bindEl) {
        var holesEl = bindEl.querySelector('.pb-holes');
        var ph = el.clientHeight || Math.round(w / ar);
        if (holesEl) holesEl.style.backgroundSize = '100% ' + Math.max(26, (ph * 0.92) / 6) + 'px';
      }
      var ink = el.querySelector('.paper-ink');
      /* Phần đầu giấy ("Viết cho" + ngày) chiếm đúng HEAD_ROWS dòng kẻ, nhờ vậy chữ
         phía dưới vẫn rơi đúng vào các đường kẻ tiếp theo. */
      var head = el.querySelector('.paper-head');
      var HEAD_ROWS = 2;   /* đầu giấy chiếm 2 dòng kẻ → chữ bắt đầu viết sớm hơn */
      if (head) {
        var headSize = Math.max(10, size * 0.68);
        head.style.height = (gap * HEAD_ROWS) + 'px';
        head.style.lineHeight = gap + 'px';
        head.style.fontSize = headSize + 'px';
        head.style.paddingLeft = (paper.box.l / 100) * w + 'px';
        head.style.paddingRight = (paper.box.r / 100) * w + 'px';
        /* đặt baseline dòng đầu giấy ĐÚNG lên đường kẻ đầu tiên (giống công thức của phần chữ) */
        var headBase = (gap - headSize) / 2 + headSize * 0.8;
        head.style.paddingTop = Math.max(2, firstLine - headBase) + 'px';
      }
      var headOffset = head ? gap * HEAD_ROWS : 0;
      if (ink) {
        ink.style.fontSize = size + 'px';
        ink.style.paddingRight = (paper.box.r / 100) * w + 'px';
        ink.style.paddingBottom = (paper.box.b / 100) * w + 'px';
        ink.style.paddingLeft = (paper.box.l / 100) * w + 'px';
        if (paper.snap === false) {
          /* Giấy không dòng: chữ chảy tự nhiên, không canh đường kẻ */
          ink.style.lineHeight = '1.72';
          ink.style.paddingTop = (Math.max(2, firstLine - size * 1.15) + headOffset) + 'px';
        } else {
          ink.style.lineHeight = gap + 'px';
          /* baseline của dòng đầu trong hộp dòng cao `gap`: ~ (gap - size)/2 + 0.8*size */
          var baseline = (gap - size) / 2 + size * 0.8;
          ink.style.paddingTop = (Math.max(2, firstLine - baseline) + headOffset) + 'px';
        }
      }
      var rules = el.querySelector('.paper-rules');
      if (rules) {
        if (paper.kind === 'rule') {
          var edge = Math.max(0.5, gap - 1);
          rules.style.backgroundImage = 'repeating-linear-gradient(to bottom,' +
            'transparent 0,transparent ' + edge + 'px,' +
            'rgba(122,101,82,.34) ' + edge + 'px,rgba(122,101,82,.34) ' + gap + 'px)';
        } else {
          rules.style.backgroundImage = 'radial-gradient(circle,rgba(122,101,82,.40) 1.1px,transparent 1.3px)';
          rules.style.backgroundSize = gap + 'px ' + gap + 'px';
        }
        /* đặt đường kẻ/dãy chấm ĐẦU TIÊN đúng tại `top` */
        rules.style.backgroundPosition = '0 ' + (firstLine - gap) + 'px';
      }
    });
  }

  function diaryEntries(target) {
    return (state.diaries || [])
      .filter(function (d) { return (d.target || 'me') === target; })
      .sort(function (a, b) { return (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0); });
  }
  function entryPaper(entry) {
    var p = Object.assign({}, getPaper(entry.paperId));
    p.snap = !entry.free;
    return p;
  }
  function entryCardHtml(entry, opts) {
    opts = opts || {};
    var who = entry.target && entry.target !== 'me' ? state.people.find(function (x) { return x.id === entry.target; }) : null;
    var entryHead = '<span class="ph-label">Viết cho</span>' +
      '<b class="ph-who">' + (who ? esc(who.name) : 'chính bạn') + '</b>' +
      '<span class="ph-date-txt">' + letterDate(entry.date || (entry.at ? String(entry.at).slice(0, 10) : '')) + '</span>';
    return '<article class="diary-entry">' +
      '<div class="entry-paper">' + paperHtml(entryPaper(entry), {
        text: entry.text, head: entryHead, font: entry.font || 'serif'
      }) + '</div>' +
      '<div class="entry-meta">' +
      '<span class="entry-who">' + (who ? 'Viết cho ' + esc(who.name) : 'Trang của bạn') + '</span>' +
      '<time>' + (entry.at ? timeAgo(entry.at) : '') + '</time>' +
      (opts.deletable ? '<button class="entry-del" data-action="diary-del" data-id="' + entry.id + '" title="Xoá bài">✕</button>' : '') +
      '</div></article>';
  }


  function diaryThemeDrawerHtml(curId) {
    return '<div class="theme-drawer" role="dialog" aria-modal="true" aria-label="Chọn chủ đề bìa nhật ký">' +
      '<div class="theme-drawer-head"><h3>Chủ đề</h3>' +
      '<button data-action="close-diary-theme-drawer" aria-label="Đóng">✕</button></div>' +
      '<p class="theme-drawer-sub">Chọn một bộ bìa cho sổ nhật ký của bạn</p>' +
      '<div class="theme-drawer-list">' + diaryThemeOptionsHtml(curId) + '</div>' +
      '</div>';
  }

  function openDiaryThemeDrawer() {
    closeDiaryThemeDrawer();
    var theme = getDiaryTheme();
    document.body.insertAdjacentHTML('beforeend',
      '<div class="theme-drawer-backdrop" id="theme-drawer-backdrop">' + diaryThemeDrawerHtml(theme.id) + '</div>');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      var bd = document.getElementById('theme-drawer-backdrop');
      if (bd) bd.classList.add('open');
    });
  }
  function closeDiaryThemeDrawer() {
    var bd = document.getElementById('theme-drawer-backdrop');
    if (!bd) return;
    bd.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () { if (bd.parentNode) bd.remove(); }, 220);
  }

  /* Nhật ký: MỘT cuốn sổ, giấy trải lên khi viết; phần tuỳ chỉnh nằm ở cột phải */
  function renderDiary() {
    var theme = getDiaryTheme();
    var sr = sheetRect(theme);

    var sheetInner = diaryDraft ? diaryPaperHtml() : (
      '<button class="diary-sheet diary-sheet-idle" data-action="diary-new" ' +
      'aria-label="Viết nhật ký vào trang giấy trong sổ">' +
      '<span class="ds-idle-ico">✍</span>' +
      '<b>Chạm để viết</b>' +
      '<small>Trang giấy nằm trong sổ</small>' +
      '</button>');

    var recent = diaryDraft ? '' : diaryEntries('me').slice(0, 3);
    return '<div class="diary-layout">' +
      '<div class="diary-main">' +
      '<div class="diary-head"><h1 class="page-title">Nhật ký</h1></div>' +
      '<div class="diary-stage">' +
      '<div class="diary-cover-wrap">' +
      '<div class="diary-book">' +
      '<img class="cover-img cover-desktop" src="' + theme.desktop + '" alt="Sổ nhật ký">' +
      '<img class="cover-img cover-mobile" src="' + theme.mobile + '" alt="Sổ nhật ký">' +
      '<div class="diary-sheet' + (diaryDraft ? ' is-writing' : '') + (diaryLayingIn ? ' lay-in' : '') + '" ' +
      'style="left:' + sr.l + '%;top:' + sr.t + '%;right:' + sr.r + '%;bottom:' + sr.b + '%">' +
      (diaryDraft && diaryLayingIn ? '<span class="sweep-edge" aria-hidden="true"></span>' : '') +
      sheetInner +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      (recent.length
        ? '<section class="diary-recent"><div class="section-head"><h2>Bài gần đây</h2>' +
          '<a class="link-more" href="#/me">Xem tất cả ›</a></div>' +
          recent.map(function (d) { return entryCardHtml(d, { deletable: true }); }).join('') + '</section>'
        : '') +
      '</div>' +
      '<aside class="diary-side">' + renderDiarySide() + '</aside>' +
      '</div>';
  }

  /* Tờ giấy đang viết (nằm trong lòng sổ): đầu giấy có "Viết cho" + ngày kiểu thư */
  function diaryPaperHtml() {
    var paper = Object.assign({}, getPaper(diaryDraft.paperId), { inbook: true });
    if (diaryDraft.free != null) paper.snap = !diaryDraft.free;

    var cur = diaryDraft.target || 'me';
    var targets = [{ id: 'me', name: state.settings.profileName || 'Bạn' }].concat(state.people.map(function (p) {
      return { id: p.id, name: p.name };
    }));
    var head =
      '<span class="ph-label">Viết cho</span>' +
      '<select class="ph-select" data-role="diary-target" aria-label="Viết cho ai">' +
      targets.map(function (t) {
        return '<option value="' + t.id + '"' + (t.id === cur ? ' selected' : '') + '>' + esc(t.name) + '</option>';
      }).join('') + '</select>' +
      '<span class="ph-date-wrap">' +
      '<span class="ph-date-txt">' + letterDate(diaryDraft.date) + '</span>' +
      '<input type="date" id="diaryDate" class="ph-date-input" data-role="diary-date" ' +
      'value="' + (diaryDraft.date || todayISO()) + '" aria-label="Chọn ngày cho bài viết">' +
      '</span>';
    return paperHtml(paper, {
      editable: true, text: diaryDraft.text, id: 'diaryText',
      head: head, font: diaryDraft.font || 'serif'
    });
  }

  /* Cột phải kiểu "sổ tay sketch": bìa sổ · mẫu giấy · kiểu chữ · dòng kẻ · Huỷ/Lưu */
  function renderDiarySide() {
    var theme = getDiaryTheme();
    var paper = diaryDraft ? Object.assign({}, getPaper(diaryDraft.paperId)) : null;
    if (diaryDraft && diaryDraft.free != null) paper.snap = !diaryDraft.free;

    var themes = DIARY_THEMES.map(function (t) {
      return '<button class="sk-swatch' + (t.id === theme.id ? ' on' : '') + '" data-action="pick-diary-theme" ' +
        'data-theme="' + t.id + '" title="' + esc(t.label) + '" aria-pressed="' + (t.id === theme.id) + '">' +
        '<span class="sk-swatch-thumb" style="background-image:url(' + t.mobile + ')"></span>' +
        '<span class="sk-swatch-name">' + esc(t.shortLabel) + '</span></button>';
    }).join('');

    var body = '';
    if (diaryDraft) {
      var chips = allPapers().map(function (p) {
        var thumb = p.img ? 'background-image:url(' + paperImg(p) + ')' : '';
        return '<button class="sk-paper' + (p.id === diaryDraft.paperId ? ' on' : '') + '" data-action="diary-paper" ' +
          'data-paper-id="' + p.id + '" title="' + esc(p.label) + '">' +
          '<span class="sk-paper-thumb pkind-' + p.kind + '" style="' + thumb + '"></span>' +
          '<span class="sk-paper-name">' + esc(p.label) + '</span></button>';
      }).join('') +
        '<label class="sk-paper sk-paper-add" title="Import ảnh làm mẫu giấy">' +
        '<span class="sk-paper-thumb pkind-import">＋</span><span class="sk-paper-name">Ảnh</span>' +
        '<input type="file" accept="image/*" id="paperImportInput" hidden></label>';

      var fonts = DIARY_FONTS.map(function (f) {
        return '<button class="sk-font font-' + f.id + (f.id === (diaryDraft.font || 'serif') ? ' on' : '') + '" ' +
          'data-action="diary-font" data-font="' + f.id + '">' + f.label + '</button>';
      }).join('');

      var snapping = paper.snap !== false;
      body =
        '<section class="sk-block"><h3 class="sk-title">Mẫu giấy</h3><div class="sk-papers">' + chips + '</div></section>' +
        '<section class="sk-block"><h3 class="sk-title">Kiểu chữ</h3><div class="sk-fonts">' + fonts + '</div></section>' +
        '<section class="sk-block"><h3 class="sk-title">Dòng kẻ</h3><div class="sk-seg">' +
        '<button class="sk-seg-btn' + (snapping ? ' on' : '') + '" data-action="diary-snap" data-snap="1">Canh dòng kẻ</button>' +
        '<button class="sk-seg-btn' + (!snapping ? ' on' : '') + '" data-action="diary-snap" data-snap="0">Viết tự do</button>' +
        '</div></section>' +
        '<section class="sk-block"><h3 class="sk-title">Nhắc nhở</h3><div class="sk-seg">' +
        '<button class="sk-seg-btn' + (diaryDraft.remind !== false ? ' on' : '') + '" data-action="diary-remind" data-on="1">Có nhắc</button>' +
        '<button class="sk-seg-btn' + (diaryDraft.remind === false ? ' on' : '') + '" data-action="diary-remind" data-on="0">Không nhắc</button>' +
        '</div></section>' +
        (paper.custom
          ? '<section class="sk-block"><h3 class="sk-title">Khớp đường kẻ</h3>' +
            '<label class="sk-slider">Dòng <input type="range" min="3" max="9" step="0.1" data-role="paper-gap" value="' + paper.gap + '"></label>' +
            '<label class="sk-slider">Lề trên <input type="range" min="3" max="20" step="0.1" data-role="paper-top" value="' + paper.top + '"></label>' +
            '</section>'
          : '') +
        '<div class="sk-actions">' +
        '<button class="sk-btn ghost" data-action="diary-cancel">Huỷ</button>' +
        '<button class="sk-btn primary" data-action="diary-save">Lưu vào sổ</button>' +
        '</div>';
    } else {
      body = '<p class="sk-hint">Chạm vào trang giấy trong sổ để bắt đầu viết. Chọn bìa bên trên, ' +
        'còn mẫu giấy · kiểu chữ · cách canh dòng sẽ hiện ra khi bạn mở sổ.</p>' +
        '<div class="sk-actions"><button class="sk-btn primary" data-action="diary-new">Mở sổ viết</button></div>';
    }

    return '<section class="sk-block"><h3 class="sk-title">Bìa sổ</h3><div class="sk-themes">' + themes + '</div></section>' + body;
  }

  /* Trình soạn cũ đã bỏ — giờ tờ giấy được trải ngay trong cuốn sổ (xem renderDiary). */

  function renderCalendar() {
    var base = new Date();
    var viewDate = new Date(base.getFullYear(), base.getMonth() + calMonthOffset, 1);
    var year = viewDate.getFullYear(), month = viewDate.getMonth();
    var monthLabel = 'Tháng ' + (month + 1) + ', ' + year;
    var firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var daysInPrevMonth = new Date(year, month, 0).getDate();
    var cellsCount = Math.ceil((firstDow + daysInMonth) / 7) * 7;
    var todayIso = todayISO();
    var selIso = calSelectedDay || todayIso;

    var cellsHtml = '';
    for (var i = 0; i < cellsCount; i++) {
      var dayNum = i - firstDow + 1;
      var cellDate, outside = false;
      if (dayNum < 1) { cellDate = new Date(year, month - 1, daysInPrevMonth + dayNum); outside = true; }
      else if (dayNum > daysInMonth) { cellDate = new Date(year, month + 1, dayNum - daysInMonth); outside = true; }
      else { cellDate = new Date(year, month, dayNum); }
      var iso = toISO(cellDate), mmdd = toMMDD(cellDate);
      var isToday = iso === todayIso;
      var dayEvents = eventsOnDate(iso, mmdd);
      var isSel = selIso === iso;
      // tối đa 2 chip + "+N" còn lại
      var chips = dayEvents.slice(0, 2).map(function (e, idx) {
        return '<button class="cal-tag ' + evTone(e.kind) + '" data-action="open-event" data-date="' + iso + '" data-idx="' + idx + '">' + evIcon(e.kind, 14) + '<span>' + esc(e.title) + '</span></button>';
      }).join('');
      var rest = dayEvents.length - Math.min(2, dayEvents.length);
      if (rest > 0) chips += '<span class="cal-tag cal-tag-more">+' + rest + '</span>';
      cellsHtml += '<div class="cal-cell' + (outside ? ' outside' : '') + (isToday ? ' today' : '') + (isSel ? ' selected' : '') + '" data-action="select-day" data-date="' + iso + '" role="button" tabindex="0">' +
        '<span class="daynum">' + cellDate.getDate() + '</span>' +
        '<div class="cal-tags-desktop">' + chips + '</div>' +
        '<div class="cal-dots">' + dayEvents.slice(0, 3).map(function (e) { return '<span class="cal-dot" style="background:' + dotColor(evTone(e.kind)) + '"></span>'; }).join('') + '</div>' +
        '</div>';
    }

    // Thanh sự kiện động của ngày đang chọn
    var selEvents = eventsOnDate(selIso, selIso.slice(5, 7) + '-' + selIso.slice(8, 10));
    var dd = new Date(selIso + 'T00:00:00');
    var stripDate = (selIso === todayIso ? 'Hôm nay · ' : DOW[(dd.getDay() + 6) % 7] + ', ') + dd.getDate() + '/' + (dd.getMonth() + 1);
    var MAX_CHIPS = 3;
    var stripChips = selEvents.slice(0, MAX_CHIPS).map(function (e, idx) {
      return '<button class="strip-chip ' + evTone(e.kind) + '" data-action="open-event" data-date="' + selIso + '" data-idx="' + idx + '">' +
        evIcon(e.kind, 22) + '<span>' + esc(e.title) + '</span>' + (e.time ? '<em>' + esc(e.time) + '</em>' : '') + '</button>';
    }).join('');
    var restCount = Math.max(0, selEvents.length - MAX_CHIPS);
    var strip = '<div class="cal-strip' + (selEvents.length ? '' : ' empty') + '">' +
      '<span class="strip-date">' + esc(stripDate) + '</span>';
    if (selEvents.length) {
      strip += '<div class="strip-chips">' + stripChips +
        (restCount ? '<button class="strip-chip strip-more" data-action="toggle-strip-more">+' + restCount + ' sự kiện</button>' : '') +
        '</div>';
    } else {
      strip += '<span class="strip-empty">Không có sự kiện nào trong ngày này</span>' +
        '<button class="strip-add" data-action="open-add-event" data-date="' + selIso + '">＋ Thêm sự kiện</button>';
    }
    strip += '</div>';
    if (calStripMore && restCount) {
      strip += '<div class="strip-panel">' + selEvents.map(function (e, idx) {
        return '<button class="strip-chip ' + evTone(e.kind) + '" data-action="open-event" data-date="' + selIso + '" data-idx="' + idx + '">' +
          evIcon(e.kind, 22) + '<span>' + esc(e.title) + '</span>' + (e.time ? '<em>' + esc(e.time) + '</em>' : '') + '</button>';
      }).join('') + '</div>';
    }

    return (
      '<div class="cal-topbar"><h1 class="page-title">Sự kiện</h1>' +
      '<div class="cal-nav"><button class="btn-icon" data-action="cal-prev" aria-label="Tháng trước">‹</button>' +
      '<div class="cal-month-label">' + monthLabel + '</div><button class="btn-icon" data-action="cal-next" aria-label="Tháng sau">›</button></div>' +
      '<div class="cal-actions"><button class="btn btn-ghost" data-action="cal-today">Hôm nay</button>' +
      '<button class="btn-icon btn-add" data-action="open-add-event" data-date="' + todayIso + '" aria-label="Thêm sự kiện">＋</button></div></div>' +
      strip +
      '<div class="cal-board">' +
      '<div class="cal-dowrow">' + DOW.map(function (d) { return '<div class="cal-dow">' + d + '</div>'; }).join('') + '</div>' +
      '<div class="cal-grid">' + cellsHtml + '</div></div>' +
      '<img class="cal-corner" src="assets/cal-corner.png" alt="" aria-hidden="true">'
    );
  }

  /* ==================== Gửi một kỷ niệm (invite link) ==================== */

  var OWNER_KEY = 'orbit_owner_v1';

  function b64urlFrom(bytes) {
    var s = '';
    var arr = new Uint8Array(bytes);
    for (var i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  /* Danh tính chủ Orbit chỉ nằm trên máy này: id ngẫu nhiên 128-bit + secret.
     Không có đăng nhập, nên đây là thứ duy nhất chứng minh quyền đọc hộp thư. */
  function ownerIdentity() {
    try {
      var raw = localStorage.getItem(OWNER_KEY);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && o.id && o.secret) return o;
      }
    } catch (e) {}
    var rnd = new Uint8Array(48);
    (window.crypto || window.msCrypto).getRandomValues(rnd);
    var ident = { id: b64urlFrom(rnd.subarray(0, 16)), secret: b64urlFrom(rnd.subarray(16, 48)) };
    try { localStorage.setItem(OWNER_KEY, JSON.stringify(ident)); } catch (e) {}
    return ident;
  }

  function apiCall(path, method, body) {
    var opts = { method: method || 'GET', headers: {} };
    if (ACCT.token) opts.headers.authorization = 'Bearer ' + ACCT.token;
    if (body) { opts.headers['content-type'] = 'application/json'; opts.body = JSON.stringify(body); }
    return fetch(path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, data: j }; });
    });
  }

  var inviteShare = null;   // { token, url, personId, expiresAt }

  function openInviteModal(pid) {
    var p = state.people.find(function (x) { return x.id === pid; });
    if (!p) return;
    /* Lời mời gắn với tài khoản: khách dùng thử phải đăng ký trước */
    if (!ACCT.token) {
      showToast('Đăng nhập để gửi lời mời kỷ niệm');
      openAuth();
      return;
    }
    openModal('<div class="modal-sheet invite-sheet"><div class="modal-head"><h3>Mời gửi kỷ niệm</h3>' +
      '<button data-action="close-modal">✕</button></div><div class="invite-loading">Đang tạo link…</div></div>');
    apiCall('/api/invite', 'POST', {
      ownerName: (state.settings.profileName || 'Bạn'),
      personId: p.id, personName: p.name
    }).then(function (res) {
      if (!res.ok) { openModal('<div class="modal-sheet"><div class="modal-head"><h3>Không tạo được link</h3>' +
        '<button data-action="close-modal">✕</button></div><p class="muted">Lỗi ' + res.status + '. Thử lại sau nhé.</p></div>'); return; }
      var url = location.origin + res.data.path;
      inviteShare = { token: res.data.token, url: url, personId: p.id, expiresAt: res.data.expiresAt };
      var qrSvg = '';
      try {
        var qr = qrcode(0, 'M'); qr.addData(url); qr.make();
        qrSvg = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
      } catch (e) { qrSvg = ''; }
      var days = Math.max(1, Math.round((Date.parse(res.data.expiresAt) - Date.now()) / 864e5));
      openModal('<div class="modal-sheet invite-sheet">' +
        '<div class="modal-head"><h3>Mời ' + esc(p.name) + ' gửi kỷ niệm</h3><button data-action="close-modal">✕</button></div>' +
        '<p class="invite-lead">Gửi link này cho ' + esc(p.name) + '. Họ mở là viết được ngay — không cần tài khoản, không thấy dữ liệu nào khác của bạn.</p>' +
        '<div class="invite-qr">' + qrSvg + '</div>' +
        '<label class="invite-link-label">Link mời</label>' +
        '<div class="invite-link"><input id="invite-url" type="text" readonly value="' + esc(url) + '">' +
        '<button class="btn btn-primary" data-action="copy-invite">Sao chép</button></div>' +
        '<div class="invite-actions">' +
        '<button class="btn btn-ghost" data-action="share-invite">Chia sẻ…</button>' +
        '<button class="btn btn-ghost danger-ghost" data-action="revoke-invite">Thu hồi link</button></div>' +
        '<p class="invite-note">Link chỉ nhận được <b>một</b> lời nhắn, hết hạn sau ' + days + ' ngày. Bạn có thể tạo link mới bất cứ lúc nào.</p>' +
        '</div>');
    }).catch(function () {
      openModal('<div class="modal-sheet"><div class="modal-head"><h3>Mất kết nối</h3>' +
        '<button data-action="close-modal">✕</button></div><p class="muted">Không gọi được máy chủ. Kiểm tra mạng rồi thử lại.</p></div>');
    });
  }

  function copyInviteLink() {
    var inp = document.getElementById('invite-url');
    if (!inp) return;
    inp.select(); inp.setSelectionRange(0, 99999);
    var done = function () { showToast('Đã sao chép link'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inp.value).then(done, function () { document.execCommand('copy'); done(); });
    } else { document.execCommand('copy'); done(); }
  }

  /* ---------------------- Hộp thư kỷ niệm nhận được ---------------------- */

  var inboxSyncAt = 0;
  function syncInbox(force) {
    if (!ACCT.token) return;
    var ident = ownerIdentity();
    var now = Date.now();
    if (!force && now - inboxSyncAt < 45000) return Promise.resolve();
    inboxSyncAt = now;
    return apiCall('/api/inbox')
      .then(function (res) {
        if (!res.ok || !res.data.memories) return;
        var changed = false;
        res.data.memories.forEach(function (m) {
          var person = state.people.filter(function (x) { return x.id === m.personId; })[0];
          if (!person) return;                       // người đã bị xoá -> bỏ qua
          person.memories = person.memories || [];
          var exists = person.memories.some(function (x) { return x.id === m.id; });
          if (exists) return;
          person.memories.push({
            id: m.id, caption: m.content, color: '#F6E2E4',
            type: 'guest_message', images: m.images || [], createdAt: m.createdAt,
            source: m.source, hidden: !!m.hidden
          });
          logActivity(person, 'Nhận một lời nhắn từ link mời');
          changed = true;
        });
        if (changed) { save(); render(); }
      })
      .catch(function () { /* offline: để lần sau */ });
  }

  function openGuestMemory(pid, mid) {
    var p = state.people.find(function (x) { return x.id === pid; });
    if (!p) return;
    var m = (p.memories || []).filter(function (x) { return x.id === mid; })[0];
    if (!m) return;
    var imgs = (m.images || []).map(function (src) {
      return '<img class="gm-img" src="' + src + '" alt="">';
    }).join('');
    var when = m.createdAt ? timeAgo(m.createdAt) : '';
    openModal('<div class="modal-sheet guest-sheet"><div class="modal-head"><h3>Lời nhắn gửi đến bạn</h3>' +
      '<button data-action="close-modal">✕</button></div>' +
      '<div class="gm-body">' + esc(m.caption).replace(/\n/g, '<br>') + '</div>' +
      (imgs ? '<div class="gm-imgs">' + imgs + '</div>' : '') +
      '<p class="gm-meta">Nhận ' + esc(when) + ' · từ link mời dành cho ' + esc(p.name) + '</p>' +
      '<div class="gm-actions">' +
      '<button class="btn btn-ghost" data-action="hide-guest-memory" data-id="' + esc(pid) + '" data-mid="' + esc(mid) + '">Ẩn khỏi Kỷ niệm</button>' +
      '<button class="btn btn-ghost danger-ghost" data-action="delete-guest-memory" data-id="' + esc(pid) + '" data-mid="' + esc(mid) + '">Xoá</button>' +
      '</div></div>');
  }

  function guestMemoryAction(action, pid, mid) {
    var p = state.people.find(function (x) { return x.id === pid; });
    if (!p) return;
    var ident = ownerIdentity();
    apiCall('/api/memory/' + encodeURIComponent(mid) + '/' + action, 'POST',
      { hidden: true }).then(function (res) {
        if (!res.ok) { showToast('Không thực hiện được, thử lại sau'); return; }
        if (action === 'delete') {
          p.memories = (p.memories || []).filter(function (x) { return x.id !== mid; });
        } else {
          (p.memories || []).forEach(function (x) { if (x.id === mid) x.hidden = true; });
        }
        save(); closeModal(); render(); showToast(action === 'delete' ? 'Đã xoá lời nhắn' : 'Đã ẩn lời nhắn');
      }).catch(function () { showToast('Mất kết nối'); });
  }

  /* ---------------------- Trang công khai cho người nhận ---------------------- */

  function renderInvitePage(token) {
    return '<div class="invite-page" id="invitePage">' +
      '<div class="invite-bg" aria-hidden="true"></div>' +
      '<div class="invite-card" id="inviteCard"><div class="invite-state">Đang mở lời mời…</div></div></div>';
  }

  function loadInvitePage(token) {
    var card = document.getElementById('inviteCard');
    if (!card) return;
    apiCall('/api/invite/' + encodeURIComponent(token)).then(function (res) {
      var d = res.data || {};
      if (!res.ok && d.status !== 'used') return inviteStateCard('missing');
      if (d.status !== 'open') return inviteStateCard(d.status);
      card.innerHTML = inviteFormHtml(d);
      bindInviteForm(token, d);
    }).catch(function () { inviteStateCard('offline'); });
  }

  function inviteStateCard(state) {
    var card = document.getElementById('inviteCard');
    if (!card) return;
    var map = {
      used: ['Lời mời này đã được sử dụng 🌙', 'Mỗi link chỉ nhận một lời nhắn. Nếu bạn muốn gửi thêm, hãy xin người ấy một link mới nhé.'],
      expired: ['Lời mời đã hết hạn', 'Link mời chỉ sống 30 ngày. Bạn nhắn người ấy tạo link mới nhé.'],
      revoked: ['Lời mời đã được thu hồi', 'Người tạo link đã thu hồi lời mời này.'],
      missing: ['Không tìm thấy lời mời', 'Link có thể sai hoặc đã bị xoá.'],
      offline: ['Không kết nối được', 'Kiểm tra mạng rồi mở lại link nhé.']
    };
    var m = map[state] || map.missing;
    card.innerHTML = '<div class="invite-state"><div class="st-emoji">✨</div><h1>' + m[0] + '</h1><p>' + m[1] + '</p></div>';
  }

  function inviteFormHtml(d) {
    var max = d.maxContent || 500;
    var hints = ['Một kỷ niệm đáng nhớ', 'Một lời chúc', 'Điều mình trân trọng ở bạn', 'Một câu nhắn ngẫu hứng'];
    return '<div class="invite-head">' +
      '<p class="invite-from">Gửi ' + esc(d.personName || 'bạn') + '</p>' +
      '<h1>Một lời nhắn, một kỷ niệm ✨</h1>' +
      '<p class="invite-sub">Có điều gì bạn muốn nhắn gửi, hay một kỷ niệm mà hai người từng có? Hãy để lại một chút yêu thương tại đây nhé.</p></div>' +
      '<form id="form-invite-memory" novalidate>' +
      '<div class="field"><textarea id="invite-text" name="content" maxlength="' + max + '" rows="5" placeholder="Viết một chút…"></textarea>' +
      '<div class="invite-count"><span id="invite-count">0</span>/' + max + '</div></div>' +
      '<div class="invite-hints">' + hints.map(function (h) {
        return '<button type="button" class="hint-chip" data-action="invite-hint" data-hint="' + esc(h) + '">' + h + '</button>';
      }).join('') + '</div>' +
      '<div class="invite-attach"><label class="attach-btn">📎 Đính kèm ảnh<input id="invite-files" type="file" accept="image/*" multiple hidden></label>' +
      '<span class="attach-note" id="attach-note">Tối đa 3 ảnh</span></div>' +
      '<div class="invite-thumbs" id="invite-thumbs"></div>' +
      '<button type="submit" class="btn btn-primary btn-block invite-send" id="invite-send">Gửi kỷ niệm ✨</button>' +
      '<p class="invite-error" id="invite-error" hidden></p>' +
      '</form>';
  }

  function bindInviteForm(token, d) {
    var ta = document.getElementById('invite-text');
    var count = document.getElementById('invite-count');
    var files = document.getElementById('invite-files');
    var thumbs = document.getElementById('invite-thumbs');
    var note = document.getElementById('attach-note');
    var errBox = document.getElementById('invite-error');
    var picked = [];

    ta.addEventListener('input', function () { count.textContent = ta.value.length; });

    files.addEventListener('change', function () {
      var list = Array.prototype.slice.call(files.files || []).slice(0, 3 - picked.length);
      list.forEach(function (file) {
        if (!/^image\//.test(file.type)) return;
        compressImage(file).then(function (dataUrl) {
          if (!dataUrl || picked.length >= 3) return;
          picked.push(dataUrl);
          renderThumbs();
        });
      });
      files.value = '';
    });

    function renderThumbs() {
      thumbs.innerHTML = picked.map(function (src, i) {
        return '<span class="thumb"><img src="' + src + '" alt=""><button type="button" data-action="invite-remove-photo" data-i="' + i + '">✕</button></span>';
      }).join('');
      note.textContent = picked.length + '/3 ảnh';
    }

    var form = document.getElementById('form-invite-memory');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var content = ta.value.trim();
      errBox.hidden = true;
      if (!content) { errBox.textContent = 'Bạn viết một chút gì đó trước nhé.'; errBox.hidden = false; ta.focus(); return; }
      var btn = document.getElementById('invite-send');
      btn.disabled = true; btn.textContent = 'Đang gửi…';
      /* Ảnh: upload trước rồi gửi URL — bản ghi D1 không phải mang cả ảnh base64 */
      var uploads = picked.map(function (src) {
        return apiCall('/api/upload', 'POST', { data: src })
          .then(function (r) { return (r.ok && r.data && r.data.url) ? r.data.url : src; })
          .catch(function () { return src; });
      });
      Promise.all(uploads).then(function (urls) {
      return apiCall('/api/invite/' + encodeURIComponent(token), 'POST', { content: content, images: urls });
      })
        .then(function (res) {
          if (res.ok) return showInviteSuccess();
          var map = {
            used: 'Lời mời này vừa được dùng rồi.', expired: 'Lời mời đã hết hạn.',
            revoked: 'Lời mời đã bị thu hồi.', rate_limited: 'Bạn gửi hơi nhanh, thử lại sau ít phút nhé.',
            too_many_images: 'Chỉ đính kèm được tối đa 3 ảnh.', bad_image: 'Có ảnh không đọc được, thử ảnh khác nhé.',
            too_long: 'Lời nhắn dài quá ' + (d.maxContent || 500) + ' ký tự.'
          };
          errBox.textContent = map[res.data && res.data.error] || 'Gửi không thành công, thử lại nhé.';
          errBox.hidden = false;
          btn.disabled = false; btn.textContent = 'Gửi kỷ niệm ✨';
        })
        .catch(function () {
          errBox.textContent = 'Mất kết nối. Thử lại khi có mạng nhé.';
          errBox.hidden = false;
          btn.disabled = false; btn.textContent = 'Gửi kỷ niệm ✨';
        });
    });

    document.getElementById('invitePage').addEventListener('click', function (e) {
      var t = e.target.closest('[data-action]');
      if (!t) return;
      if (t.dataset.action === 'invite-hint') {
        ta.value = t.dataset.hint ? (ta.value ? ta.value + ' ' : '') + t.dataset.hint : ta.value;
        count.textContent = ta.value.length; ta.focus();
      }
      if (t.dataset.action === 'invite-remove-photo') {
        picked.splice(Number(t.dataset.i), 1); renderThumbs();
      }
    });
  }

  function showInviteSuccess() {
    var card = document.getElementById('inviteCard');
    if (!card) return;
    card.innerHTML = '<div class="invite-state success">' +
      '<div class="stars" aria-hidden="true">' + '<i></i><i></i><i></i><i></i><i></i><i></i>' + '</div>' +
      '<div class="st-emoji">✨</div>' +
      '<h1>Kỷ niệm của bạn đã được gửi đi ✨</h1>' +
      '<p>Một ngôi sao nhỏ vừa được lưu vào Orbit của người ấy.</p></div>';
  }

  /* Nén ảnh phía client để không đẩy file thô lên (giới hạn 400KB/ảnh ở server) */
  function compressImage(file) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var max = 1000;
          var scale = Math.min(1, max / Math.max(img.width, img.height));
          var cv = document.createElement('canvas');
          cv.width = Math.round(img.width * scale); cv.height = Math.round(img.height * scale);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          var q = 0.72, out = cv.toDataURL('image/jpeg', q);
          var tries = 0;
          while (out.length > 360 * 1024 && tries < 4) {
            q -= 0.12; tries++;
            out = cv.toDataURL('image/jpeg', Math.max(0.3, q));
          }
          resolve(out);
        };
        img.onerror = function () { resolve(null); };
        img.src = reader.result;
      };
      reader.onerror = function () { resolve(null); };
      reader.readAsDataURL(file);
    });
  }

  /* ---------------------------- Settings ---------------------------- */
  function settingsRow(key, icon, tone, title, sub) {
    return '<a class="settings-row card" href="#/settings/' + key + '"><div class="ic-wrap ' + tone + '">' + icon + '</div>' +
      '<div class="t"><b>' + title + '</b><span>' + sub + '</span></div><div class="chev">›</div></a>';
  }
  function settingsGroup(title, rows) {
    return '<section class="settings-group"><h2 class="settings-group-title">' + title + '</h2>' +
      '<div class="settings-list">' + rows + '</div></section>';
  }
  /* Cài đặt chia nhóm: Tài khoản lên đầu, rồi tới nhóm hiển thị, nhóm trợ lý & nhắc nhở,
     nhóm quỹ đạo & nhóm, cuối cùng là dữ liệu. */
  function renderSettings() {
    return '<h1 class="page-title">Cài đặt</h1>' +
      settingsGroup('Tài khoản',
        settingsRow('account', ic('profile', 24), 'tone-blue', 'Tài khoản',
          'Tên hiển thị, ảnh đại diện, ảnh nền')) +
      settingsGroup('Chủ đề & hiển thị',
        settingsRow('appearance', ic('sun', 24), 'tone-purple', 'Chế độ hiển thị', 'Sáng / Tối / Theo hệ thống') +
        settingsRow('home', ic('home', 22), 'tone-peach', 'Trang chủ', 'Bật/tắt các khối trên trang chủ')) +
      settingsGroup('Trợ lý & nhắc nhở',
        settingsRow('reminders', ic('bell', 24), 'tone-pink', 'Nhắc nhở',
          'Người nhận, sự kiện, mẫu tin, kênh gửi') +
        settingsRow('ai', ic('sun', 24), 'tone-orange', 'Tính năng AI', 'Bật / Tắt, gợi ý cá nhân hoá')) +
      settingsGroup('Quỹ đạo & nhóm',
        settingsRow('orbit', ic('calendar', 24), 'tone-purple', 'Quỹ đạo',
          'Mức ưu tiên xếp vòng theo mối quan hệ') +
        settingsRow('groups', ic('people', 24), 'tone-mint', 'Nhóm', 'Tự tạo nhóm để lọc và sắp xếp')) +
      settingsGroup('Dữ liệu',
                '<button class="settings-row card settings-btn" data-action="start-tour">' +
        '<div class="ic-wrap tone-blue">' + ic('sun', 22) + '</div>' +
        '<div class="t"><b>Hướng dẫn sử dụng</b><span>Xem lại các bước cơ bản ngay trên app</span></div>' +
        '<div class="chev">›</div></button>' +settingsRow('data', ic('envelope', 24), 'tone-green', 'Xuất / Xoá dữ liệu',
          'Sao lưu và quản lý dữ liệu'));
  }
  function backBtn() { return '<button class="subpage-back" data-action="nav" data-to="settings">‹ Cài đặt</button>'; }

  function renderSettingsSub(key) {
    if (key === 'appearance') return subAppearance();
    if (key === 'home') return subHome();
    if (key === 'orbit') return subOrbit();
    if (key === 'groups') return subGroups();
    if (key === 'ai') return subAI();
    if (key === 'data') return subData();
    if (key === 'account') return subAccount();
    if (key === 'reminders') return subReminders();
    return backBtn() + '<p>Không tìm thấy mục cài đặt.</p>';
  }
  function subAppearance() {
    var cur = state.settings.theme;
    function opt(val, label) {
      return '<label class="radio-opt ' + (cur === val ? 'selected' : '') + '">' +
        '<input type="radio" name="theme" value="' + val + '" ' + (cur === val ? 'checked' : '') + ' data-action="settings-theme" data-theme="' + val + '"> ' + label + '</label>';
    }
    return backBtn() + '<h1 class="page-title">Chế độ hiển thị</h1><div class="radio-group">' + opt('light', '☀️ Sáng') + opt('dark', '🌙 Tối') + opt('system', '💻 Theo hệ thống') + '</div>';
  }
  function subHome() {
    var occ = state.settings.homeOccasions !== false;
    var sug = state.settings.homeSuggest !== false;
    function row(icon, tone, title, sub, action, on) {
      return '<div class="settings-row card" style="margin-bottom:10px;">' +
        '<div class="ic-wrap ' + tone + '">' + ic(icon, 22) + '</div>' +
        '<div class="t"><b>' + title + '</b><span>' + sub + '</span></div>' +
        '<button class="toggle ' + (on ? 'on' : '') + '" data-action="' + action + '" aria-pressed="' + on + '"></button></div>';
    }
    var quick = state.settings.homeQuick !== false;
    var week = state.settings.homeWeek !== false;
    var up = state.settings.homeUpcoming !== false;
    return backBtn() + '<h1 class="page-title">Trang chủ</h1>' +
      row('people', 'tone-pink', 'Bốn nút tắt nhanh', 'Thêm người · Thêm lịch · Viết nhật ký · Viết cho tôi', 'toggle-home-quick', quick) +
      row('calendar', 'tone-green', 'Khối "7 ngày tới"', 'Dải ngày trong tuần và lịch của ngày đang chọn', 'toggle-home-week', week) +
      row('cake', 'tone-purple', 'Khối "60 ngày tới"', 'Năm tấm mây tóm tắt dịp sắp tới, cuộn ngang', 'toggle-home-occasions', occ) +
      row('bell', 'tone-blue', 'Khối "Sự kiện sắp tới"', 'Năm sự kiện gần nhất kèm ngày và giờ', 'toggle-home-upcoming', up) +
      row('sun', 'tone-orange', 'Gợi ý hôm nay', 'Dải nhắc việc nhỏ, có nút ẩn ngay trên trang chủ', 'toggle-home-suggest', sug) +
      '<div class="gap-note">Tắt bớt để trang chủ gọn hơn. Gợi ý đã ẩn bằng nút ✕ vẫn có thể bật lại ở đây.</div>';
  }
  function subOrbit() {
    var pr = state.settings.relationPriority || DEFAULT_PRIORITY;
    var rows = REL_TYPES.map(function (r) {
      var opts = PRIORITIES.map(function (p) {
        return '<option value="' + p.k + '"' + ((pr[r.k] || DEFAULT_PRIORITY[r.k]) === p.k ? ' selected' : '') + '>' + p.label + '</option>';
      }).join('');
      return '<div class="priority-row"><span>' + r.label + '</span>' +
        '<select data-action="set-priority" data-rel="' + r.k + '" aria-label="Ưu tiên ' + r.label + '">' + opts + '</select></div>';
    }).join('');
    return backBtn() + '<h1 class="page-title">Quỹ đạo</h1>' +
      '<div class="card" style="padding:16px;">' +
      '<p class="muted" style="margin:0 0 12px;">Gia đình luôn nằm ở vòng gần tâm nhất. Các nhóm còn lại xếp theo mức ưu tiên bên dưới — mức cao hơn thì gần tâm hơn.</p>' +
      rows + '</div>' +
      '<div class="gap-note">Số vòng tự đổi theo sĩ số. Từ 98 người trở lên, quỹ đạo chuyển sang dạng chấm và chỉ hiện avatar của gia đình và người có dấu ★.</div>' +
      '<button class="btn btn-block" data-action="reset-orbit-layout" style="margin-top:16px;">Đặt lại quỹ đạo</button>';
  }
  function subGroups() {
    var gs = state.settings.groups || [];
    var list = gs.length ? gs.map(function (g) {
      var count = state.people.filter(function (p) { return (p.groups || []).indexOf(g.id) > -1; }).length;
      return '<div class="group-row"><div class="t"><b>' + esc(g.name) + '</b><span>' + count + ' người</span></div>' +
        '<button class="link-more" data-action="delete-group" data-gid="' + esc(g.id) + '">Xoá</button></div>';
    }).join('') : '<p class="muted" style="margin:0;">Chưa có nhóm nào. Tạo nhóm để gom người theo lớp học, công ty, chuyến đi…</p>';
    return backBtn() + '<h1 class="page-title">Nhóm</h1>' +
      '<div class="card" style="padding:16px;">' + list + '</div>' +
      '<form id="form-add-group" style="margin-top:16px;">' +
      '<div class="field"><label>Tên nhóm mới</label><input type="text" name="name" placeholder="Vd: Đại học, Công ty cũ…" required></div>' +
      '<button class="btn btn-primary btn-block" type="submit">Tạo nhóm</button></form>';
  }
  function subAI() {
    var on = state.settings.aiEnabled;
    return backBtn() + '<h1 class="page-title">Tính năng AI</h1>' +
      '<div class="settings-row card" style="margin-bottom:16px;"><div class="ic-wrap tone-orange">✨</div>' +
      '<div class="t"><b>Gợi ý thông minh</b><span>Đề xuất hành động dựa trên dịp sắp tới &amp; ghi chú</span></div>' +
      '<button class="toggle ' + (on ? 'on' : '') + '" data-action="toggle-ai"></button></div>' +
      '<div class="gap-note">⚠️ Đây là gợi ý theo luật đơn giản (rule-based), CHƯA dùng mô hình AI thật. Muốn gợi ý AI thật cần tích hợp một API model (OpenAI/Claude...) ở backend — phần này cần bạn chọn dịch vụ và cấp API key.</div>';
  }
  function subData() {
    return backBtn() + '<h1 class="page-title">Xuất / Xoá dữ liệu</h1><div class="settings-list">' +
      '<button class="settings-row card" style="width:100%;border:none;text-align:left;background:var(--card);cursor:pointer;color:inherit;font:inherit;" data-action="export-data">' +
      '<div class="ic-wrap tone-green">⬇️</div><div class="t"><b>Xuất dữ liệu (.json)</b><span>Tải toàn bộ người, sự kiện, ghi chú</span></div><div class="chev">›</div></button>' +
      '<button class="settings-row card" style="width:100%;border:none;text-align:left;background:var(--card);cursor:pointer;color:inherit;font:inherit;" data-action="import-data">' +
      '<div class="ic-wrap tone-blue">⬆️</div><div class="t"><b>Nhập lại dữ liệu</b><span>Từ file .json đã xuất trước đó</span></div><div class="chev">›</div></button>' +
      '<button class="settings-row card" style="width:100%;border:none;text-align:left;background:var(--card);cursor:pointer;color:inherit;font:inherit;" data-action="wipe-people">' +
      '<div class="ic-wrap" style="background:var(--pink);color:var(--danger);">👥</div><div class="t"><b style="color:var(--danger);">Xoá tất cả liên hệ</b><span>Giữ lại cài đặt, sự kiện và ghi chú chung</span></div><div class="chev">›</div></button>' +
      '<button class="settings-row card" style="width:100%;border:none;text-align:left;background:var(--card);cursor:pointer;color:inherit;font:inherit;" data-action="wipe-data">' +
      '<div class="ic-wrap" style="background:var(--pink);color:var(--danger);">🗑️</div><div class="t"><b style="color:var(--danger);">Xoá toàn bộ dữ liệu</b><span>Không thể hoàn tác</span></div><div class="chev">›</div></button>' +
      '</div><input type="file" id="import-file-input" accept="application/json" style="display:none;">' +
      '<div class="gap-note">⚠️ Dữ liệu hiện chỉ lưu trên trình duyệt của thiết bị này (localStorage). Muốn đồng bộ nhiều thiết bị cần backend thật (vd Supabase) — xem mục Tài khoản.</div>';
  }
  function subAccount() {
    var nm = state.settings.profileName || 'Bạn';
    var av = state.settings.profileAvatar;
    return backBtn() + '<h1 class="page-title">Tài khoản</h1>' +
      '<div class="card acc-card">' +
      '<button class="acc-avatar" data-action="open-avatar-picker" data-id="me" title="Đổi ảnh đại diện" ' +
      'style="' + (av ? 'background:transparent;' : '') + '">' +
      (av ? '<img src="' + esc(avatarSrc(av)) + '" alt="">' : initials(nm)) +
      '<span class="acc-avatar-edit" aria-hidden="true">✎</span></button>' +
      '<div class="acc-id"><b>' + esc(nm) + '</b><span>Tên này hiện ở "Viết cho", trang cá nhân và lời nhắn</span></div>' +
      '</div>' +
      '<div class="field"><label>Tên hiển thị</label>' +
      '<input type="text" id="profile-name-input" value="' + esc(nm) + '" maxlength="40"></div>' +
      '<button class="btn btn-primary btn-block" data-action="save-profile-name">Lưu tên</button>' +
      (ACCT.token
        ? '<div class="acc-server"><span class="acc-dot"></span><div><b>Đã kết nối máy chủ</b>' +
          '<span>' + esc((state.account && state.account.email) || (ACCT.user && ACCT.user.email) || '') +
          ' · dữ liệu được sao lưu và đồng bộ</span></div>' +
          '<button class="acc-out" data-action="auth-signout">Đăng xuất</button></div>'
        : '<button class="acc-signin" data-action="auth-open">Đăng nhập để đồng bộ dữ liệu</button>' +
          '<div class="acc-trial">Bản dùng thử trên máy này còn <b>' + trialInfo().daysLeft + ' ngày</b> ' +
          '(hết hạn ' + (trialInfo().endsAt || '').split('-').reverse().join('/') + '). Hết hạn dữ liệu sẽ bị xoá.</div>') +
      '<div class="field"><label>Chủ đề theo giới tính</label><div class="sk-seg">' +
      '<button class="sk-seg-btn' + ((state.settings.gender || 'female') !== 'male' ? ' on' : '') + '" data-action="set-gender" data-g="female">Nữ · kem hồng</button>' +
      '<button class="sk-seg-btn' + ((state.settings.gender) === 'male' ? ' on' : '') + '" data-action="set-gender" data-g="male">Nam · xanh biển</button>' +
      '</div></div>' +
      '<div class="settings-list" style="margin-top:18px;">' +
      '<button class="settings-row card settings-btn" data-action="open-avatar-picker" data-id="me">' +
      '<div class="ic-wrap tone-blue">' + ic('profile', 22) + '</div>' +
      '<div class="t"><b>Ảnh đại diện</b><span>Chọn trong bộ có sẵn hoặc tải ảnh lên</span></div><div class="chev">›</div></button>' +
      '<button class="settings-row card settings-btn" data-action="open-cover-picker" data-id="me">' +
      '<div class="ic-wrap tone-purple">' + ic('sun', 22) + '</div>' +
      '<div class="t"><b>Ảnh nền trang cá nhân</b><span>Ảnh bìa phía trên hồ sơ của bạn</span></div><div class="chev">›</div></button>' +
      '</div>' +
      '<div class="gap-note" style="margin-top:16px;">⚠️ Chưa có đăng nhập/đồng bộ thật. Đây là hồ sơ lưu cục bộ trên thiết bị. Muốn đăng nhập (email, Google...) và đồng bộ nhiều máy cần dựng backend auth thật (vd Supabase Auth) — cần bạn cung cấp project &amp; khoá API khi muốn triển khai.</div>';
  }

  /* ---------- Nhắc nhở: hàng loạt, từng người, theo sự kiện, mẫu tin, kênh gửi ---------- */
  var NOTIFY_CHANNELS = [
    { k: 'push', label: 'Thông báo trên app', sub: 'Máy đã cài Orbit (push notification)', ph: 'Tên thiết bị, vd: iPhone của bạn', icon: '📱' },
    { k: 'telegram', label: 'Telegram', sub: 'Nhận tin qua bot Telegram', ph: 'vd: @username hoặc chat id', icon: '✈️' },
    { k: 'zalo', label: 'Zalo', sub: 'Nhận tin qua Zalo OA', ph: 'vd: 09xx xxx xxx', icon: '💬' }
  ];
  function notifyCfg() {
    if (!state.settings.notify) state.settings.notify = {};
    return state.settings.notify;
  }
  function chCfg(k) {
    var n = notifyCfg();
    if (!n[k]) n[k] = { on: false, id: '' };
    return n[k];
  }
  function defaultMsgTemplate(catKey) {
    var c = EV_BY_KEY[catKey];
    return 'Nhắc nhẹ: ' + (c ? c.label.toLowerCase() : 'sự kiện') + ' của {tên} vào {ngày}. Bạn chuẩn bị gì chưa?';
  }
  function msgTemplateFor(catKey) {
    var t = state.settings.msgTemplates || {};
    return t[catKey] || defaultMsgTemplate(catKey);
  }
  function openTemplateEditor(catKey) {
    var c = EV_BY_KEY[catKey];
    openModal(
      '<div class="modal-sheet"><div class="modal-head"><h3>Mẫu tin — ' + esc(c ? c.label : catKey) +
      '</h3><button data-action="close-modal">✕</button></div>' +
      '<form id="form-msg-template">' +
      '<input type="hidden" name="cat" value="' + esc(catKey) + '">' +
      '<div class="field"><label>Nội dung tin nhắc</label>' +
      '<textarea name="text" rows="4" maxlength="240" required>' + esc(msgTemplateFor(catKey)) + '</textarea>' +
      '<em class="field-hint">Dùng được các thẻ: {tên} · {sự kiện} · {ngày} · {giờ}</em></div>' +
      '<div class="sk-actions"><button type="button" class="sk-btn ghost" data-action="reset-msg-template" data-cat="' +
      esc(catKey) + '">Mặc định</button>' +
      '<button type="submit" class="sk-btn primary">Lưu mẫu tin</button></div></form></div>'
    );
  }
  /* Người đang chọn + bộ lọc của khối "Theo người" (để ngoài render cho khỏi mất) */
  var rmRel = 'all', rmGroup = 'all', rmQuery = '', rmSel = null;
  function rmDateLabel(v) {
    if (!v) return '';
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    return m ? (m[3] + '/' + m[2] + '/' + m[1]) : v;
  }
  /* Gom mọi thứ có thể nhắc của một người: sinh nhật → nhắc tay → sự kiện → nhật ký.
     Chống trùng: nếu đã có sự kiện loại "sinh nhật" hoặc nhắc tay tên "Sinh nhật" thì
     không sinh thêm dòng sinh nhật tự động (lỗi trước đây: 2 dòng sinh nhật). */
  function personReminderItems(p) {
    var items = [];
    var bd = p.birthday ? formatMMDD(p.birthday) : '';
    var hasBdEvent = state.events.some(function (e) {
      return e.personId === p.id && e.type === 'birthday';
    });
    if (p.birthday && !hasBdEvent) {
      items.push({
        key: 'bd', group: 'Sinh nhật', label: 'Sinh nhật', date: formatMMDD(p.birthday),
        on: p.remindBirthday !== false, lead: p.remindBirthdayLead
      });
    }
    (p.reminders || []).forEach(function (r) {
      var dupBd = /sinh\s*nhật/i.test(r.label || '') || (bd && r.mmdd === bd);
      if (dupBd && (p.birthday || hasBdEvent)) return;   /* đã có dòng sinh nhật rồi */
      items.push({
        key: 'rm:' + r.id, group: 'Nhắc hẹn', label: r.label,
        date: r.mmdd ? formatMMDD(r.mmdd) : rmDateLabel(r.date), on: r.enabled !== false, lead: r.lead
      });
    });
    state.events.filter(function (e) { return e.personId === p.id; }).forEach(function (e) {
      var c = EV_BY_KEY[e.type];
      items.push({
        key: 'ev:' + e.id, group: c ? c.label : 'Sự kiện', label: e.title,
        date: e.date ? rmDateLabel(e.date) : (e.annMMDD ? formatMMDD(e.annMMDD) : ''),
        on: e.remind !== false, lead: e.lead
      });
    });
    state.diaries.filter(function (d) { return d.target === p.id; }).forEach(function (d) {
      items.push({
        key: 'dy:' + d.id, group: 'Nhật ký', label: 'Trang nhật ký',
        date: rmDateLabel(d.date), on: d.remind !== false, lead: d.lead
      });
    });
    return items;
  }
  /* Bật/tắt + đặt "nhắc trước" cho một mục nhắc (dùng chung cho toggle lẻ và toggle cả nhóm) */
  function setReminderFlag(p, key, val) {
    if (key === 'bd') p.remindBirthday = !!val;
    else if (key.indexOf('rm:') === 0) {
      var r = (p.reminders || []).find(function (x) { return x.id === key.slice(3); });
      if (r) r.enabled = !!val;
    } else if (key.indexOf('ev:') === 0) {
      var e = state.events.find(function (x) { return x.id === key.slice(3); });
      if (e) e.remind = !!val;
    } else if (key.indexOf('dy:') === 0) {
      var d = state.diaries.find(function (x) { return x.id === key.slice(3); });
      if (d) d.remind = !!val;
    }
  }
  function setReminderLead(p, key, val) {
    var v = Math.max(0, Math.min(30, Number(val) || 0));
    if (key === 'bd') p.remindBirthdayLead = v;
    else if (key.indexOf('rm:') === 0) {
      var r = (p.reminders || []).find(function (x) { return x.id === key.slice(3); });
      if (r) r.lead = v;
    } else if (key.indexOf('ev:') === 0) {
      var e = state.events.find(function (x) { return x.id === key.slice(3); });
      if (e) e.lead = v;
    } else if (key.indexOf('dy:') === 0) {
      var d = state.diaries.find(function (x) { return x.id === key.slice(3); });
      if (d) d.lead = v;
    }
  }
  function subReminders() {
    var people = state.people;
    var cfg = state.settings;
    var peopleAll = cfg.remindPeopleAll !== false;
    var eventsAll = cfg.remindEventsAll !== false;
    var evMap = cfg.eventRemind || {};

    function toggleRow(title, sub, action, on, data) {
      return '<div class="rm-row"><div class="t"><b>' + title + '</b><span>' + sub + '</span></div>' +
        '<button class="toggle ' + (on ? 'on' : '') + '" data-action="' + action + '" ' + (data || '') +
        ' aria-pressed="' + on + '"></button></div>';
    }

    /* ---- Sự kiện (đứng TRÊN phần mối quan hệ) ---- */
    var evRows = EVENT_CATS.map(function (c) {
      var on = evMap[c.k] !== false;
      return toggleRow(c.label, 'Bật nhắc cho nhóm sự kiện này', 'toggle-event-remind', on,
        'data-cat="' + c.k + '"');
    }).join('');

    /* ---- Bộ lọc: 2 dropdown (quan hệ + nhóm) + ô tìm, dính trên đầu danh sách ---- */
    var relOpts = ['all'].concat(REL_TYPES.map(function (r) { return r.k; })).map(function (k) {
      return '<option value="' + k + '"' + (rmRel === k ? ' selected' : '') + '>' +
        (k === 'all' ? 'Mọi mối quan hệ' : REL_LABEL[k]) + '</option>';
    }).join('');
    var gs = cfg.groups || [];
    var groupOpts = '<option value="all"' + (rmGroup === 'all' ? ' selected' : '') + '>Mọi nhóm</option>' +
      gs.map(function (g) {
        return '<option value="' + esc(g.id) + '"' + (rmGroup === g.id ? ' selected' : '') + '>' + esc(g.name) + '</option>';
      }).join('');

    var q = (rmQuery || '').trim().toLowerCase();
    var list = people.filter(function (p) {
      if (rmRel !== 'all' && p.relationship !== rmRel) return false;
      if (rmGroup !== 'all' && (p.groups || []).indexOf(rmGroup) < 0) return false;
      if (q && p.name.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });

    /* Người đang xem: giữ lựa chọn cũ, nếu không còn trong danh sách thì lấy người đầu */
    var sel = list.filter(function (p) { return p.id === rmSel; })[0] || list[0] || null;
    rmSel = sel ? sel.id : null;
    var leadDefault = cfg.remindBefore == null ? 3 : cfg.remindBefore;

    var listRows = list.length ? list.map(function (p) {
      var items = personReminderItems(p);
      var active = items.filter(function (it) { return it.on; }).length;
      return '<button class="rm-prow' + (sel && sel.id === p.id ? ' on' : '') + '" ' +
        'data-action="rm-select" data-pid="' + p.id + '">' +
        '<span class="rm-av">' + avatarInner(p) + '</span>' +
        '<span class="rm-prow-t"><b>' + esc(p.name) + '</b><em>' +
        (REL_LABEL[p.relationship] || 'Khác') + '</em></span>' +
        '<span class="rm-count">' + active + '</span></button>';
    }).join('') : '<div class="rm-empty">Không tìm thấy ai khớp bộ lọc.</div>';

    var detail = '<div class="rm-empty">Chọn một người ở danh sách bên trái.</div>';
    if (sel) {
      var items = personReminderItems(sel).filter(function (it) { return evMap[it.group] !== false; });
      var personOn = sel.remindOn !== false;
      var groups = {};
      items.forEach(function (it) { (groups[it.group] = groups[it.group] || []).push(it); });
      var body = Object.keys(groups).length ? Object.keys(groups).map(function (g) {
        var arr = groups[g];
        var allOn = arr.every(function (it) { return it.on; });
        return '<div class="rm-grp">' +
          '<div class="rm-grp-head"><span class="rm-grp-name">' + esc(g) +
          ' <em>(' + arr.length + ')</em></span>' +
          '<button class="toggle sm ' + (allOn && personOn ? 'on' : '') + '" data-action="toggle-remind-group" ' +
          'data-pid="' + sel.id + '" data-group="' + esc(g) + '" aria-label="Bật/tắt cả nhóm ' + esc(g) + '"></button></div>' +
          arr.map(function (it) {
            var lead = it.lead == null ? leadDefault : it.lead;
            return '<div class="rm-item">' +
              '<div class="t"><b>' + esc(it.label) + '</b><span>' + esc(it.date) + '</span></div>' +
              '<select class="rm-lead" data-role="rm-lead" data-pid="' + sel.id + '" data-key="' + esc(it.key) + '" ' +
              'aria-label="Nhắc trước cho ' + esc(it.label) + '">' +
              [0, 1, 2, 3, 5, 7].map(function (v) {
                return '<option value="' + v + '"' + (Number(lead) === v ? ' selected' : '') + '>' + v + ' ngày</option>';
              }).join('') + '</select>' +
              '<button class="toggle ' + (it.on && personOn ? 'on' : '') + '" data-action="toggle-remind-item" ' +
              'data-pid="' + sel.id + '" data-key="' + esc(it.key) + '" aria-label="Bật nhắc cho ' + esc(it.label) + '"></button>' +
              '</div>';
          }).join('') + '</div>';
      }).join('') : '<div class="rm-empty">Chưa có sự kiện hay nhắc hẹn nào.</div>';

      detail = '<div class="rm-detail-head">' +
        '<span class="rm-av lg">' + avatarInner(sel) + '</span>' +
        '<div class="rm-detail-id"><b>' + esc(sel.name) + '</b><em>' +
        (REL_LABEL[sel.relationship] || 'Khác') + ' · ' + items.length + ' mục</em></div>' +
        '<button class="toggle ' + (personOn ? 'on' : '') + '" data-action="toggle-person-remind" data-pid="' + sel.id + '" ' +
        'aria-label="Bật nhắc cho ' + esc(sel.name) + '"></button>' +
        '</div><div class="rm-detail-body">' + body + '</div>';
    }

    var tplRows = EVENT_CATS.slice(0, 6).map(function (c) {
      return '<div class="rm-row"><div class="t"><b>' + c.label + '</b><span>' +
        esc(msgTemplateFor(c.k)).slice(0, 58) + '…</span></div>' +
        '<button class="rm-pencil" data-action="edit-msg-template" data-cat="' + c.k + '" aria-label="Sửa mẫu tin ' + c.label + '">✎</button></div>';
    }).join('');

    var chRows = NOTIFY_CHANNELS.map(function (ch) {
      var c = chCfg(ch.k);
      return '<div class="notify-card' + (c.on ? ' on' : '') + '">' +
        '<div class="notify-head"><span class="notify-emoji">' + ch.icon + '</span>' +
        '<div class="t"><b>' + ch.label + '</b><span>' + ch.sub + '</span></div>' +
        '<button class="toggle ' + (c.on ? 'on' : '') + '" data-action="toggle-notify" data-ch="' + ch.k + '"></button></div>' +
        (c.on
          ? '<div class="notify-body"><input type="text" data-role="notify-input" data-ch="' + ch.k + '" value="' +
            esc(c.id || '') + '" placeholder="' + ch.ph + '">' +
            '<button class="btn btn-primary" data-action="save-notify" data-ch="' + ch.k + '">Kết nối</button></div>'
          : '') +
        '</div>';
    }).join('');

    return backBtn() + '<h1 class="page-title">Nhắc nhở</h1>' +

      '<section class="settings-group"><h2 class="settings-group-title">Bật hàng loạt</h2>' +
      '<div class="card rm-card">' +
      toggleRow('Tất cả mọi người', people.length + ' người trong quỹ đạo', 'toggle-remind-people-all', peopleAll) +
      toggleRow('Tất cả sự kiện', EVENT_CATS.length + ' nhóm sự kiện', 'toggle-remind-events-all', eventsAll) +
      '<div class="rm-bulk-actions">' +
      '<button class="btn btn-ghost" data-action="remind-all-on">Bật tất cả</button>' +
      '<button class="btn btn-ghost" data-action="remind-all-off">Tắt tất cả</button>' +
      '</div></div></section>' +

      '<section class="settings-group"><h2 class="settings-group-title">Sự kiện</h2>' +
      '<div class="card rm-card">' + evRows + '</div>' +
      '<div class="card rm-card" style="margin-top:10px;">' +
      '<div class="rm-row"><div class="t"><b>Nhắc trước</b><span>Số ngày báo trước cho mỗi sự kiện</span></div>' +
      '<input class="rm-num" type="number" min="0" max="30" value="' + (cfg.remindBefore == null ? 3 : cfg.remindBefore) + '" data-role="remind-before"></div>' +
      '<div class="rm-row"><div class="t"><b>Giờ gửi</b><span>Thời điểm gửi tin nhắc</span></div>' +
      '<input class="rm-num" type="time" value="' + esc(cfg.reminderDefaultTime || '09:00') + '" data-role="remind-time"></div>' +
      '</div></section>' +

      '<section class="settings-group"><h2 class="settings-group-title">Theo người</h2>' +
      '<div class="rm-shell">' +
      '<div class="rm-pane rm-left">' +
      '<div class="rm-left-top">' +
      '<input class="rm-search" id="rmSearch" type="search" placeholder="Tìm đích danh…" value="' + esc(rmQuery) + '">' +
      '<div class="rm-selects">' +
      '<select class="rm-select" data-role="rm-rel" aria-label="Lọc theo quan hệ">' + relOpts + '</select>' +
      '<select class="rm-select" data-role="rm-group" aria-label="Lọc theo nhóm">' + groupOpts + '</select>' +
      '</div></div>' +
      '<div class="rm-left-list">' + listRows + '</div>' +
      '</div>' +
      '<div class="rm-pane rm-right">' + detail + '</div>' +
      '</div></section>' +

      '<section class="settings-group"><h2 class="settings-group-title">Mẫu tin nhắn</h2>' +
      '<div class="card rm-card">' + tplRows + '</div></section>' +

      '<section class="settings-group"><h2 class="settings-group-title">Kênh nhận thông báo</h2>' +
      chRows +
      '<div class="gap-note">⚠️ Phần này mới lưu cấu hình trên máy — chưa gửi tin thật. Muốn gửi thật cần bot Telegram '
      + '/ Zalo OA token hoặc web push + backend, cấp khoá khi bạn muốn triển khai.</div></section>';
  }

  function bindImportInput() {
    var inp = document.getElementById('import-file-input');
    if (!inp) return;
    inp.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(reader.result);
          if (!parsed.people || !parsed.events || !parsed.settings) throw new Error('bad');
          state = parsed;
          save();
          showToast('Đã nhập dữ liệu thành công');
          render();
        } catch (err) { showToast('File không hợp lệ'); }
      };
      reader.readAsText(file);
    });
  }

  /* ---------------------------- Onboarding ---------------------------- */
  /* ---------------------- Đăng nhập / tạo tài khoản ----------------------
     Không nhét form vào trang onboarding (làm vỡ bố cục): bấm "Bắt đầu" sẽ mở
     một hộp giữa màn hình, nền phía sau làm mờ. Tài khoản lưu cục bộ, mật khẩu
     chỉ giữ dạng băm SHA-256 kèm salt. */
  var authTab = 'login';
  var authOpen = false;
  var authRemember = true;
  var authDraftEmail = '';
  var authForgot = false;
  var resetToken = '';
  var appConfig = { googleClientId: '', mailConfigured: false };

  function authRand() {
    var a = new Uint8Array(16); crypto.getRandomValues(a);
    return Array.from(a).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  function authHash(salt, pass) {
    var data = new TextEncoder().encode(salt + ':' + pass);
    return crypto.subtle.digest('SHA-256', data).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }
  function openAuth() {
    authOpen = true;
    authForgot = false;
    authTab = state.account ? 'login' : 'signup';
    authRemember = state.settings.rememberLogin !== false;
    render();
    var first = document.querySelector('#form-orbit-auth input');
    if (first) setTimeout(function () { first.focus(); }, 40);
  }
  function closeAuth() { authOpen = false; render(); }

  /* ----- Hộp thông tin cơ bản, mở ngay sau khi tạo tài khoản ----- */
  var setupOpen = false;
  var setupAvatar = '';
  function openProfileSetup() {
    setupOpen = true;
    setupAvatar = state.settings.profileAvatar || 'av-01';
    render();
  }
  function closeProfileSetup() { setupOpen = false; render(); }
  function profileSetupHtml() {
    if (!setupOpen) return '';
    var name = state.settings.profileName && state.settings.profileName !== 'Bạn' ? state.settings.profileName : '';
    var bd = state.settings.profileBirthday || '';
    var grid = AVATAR_PRESETS.map(function (a) {
      return '<button type="button" class="setup-av' + (setupAvatar === a ? ' on' : '') + '" ' +
        'data-action="setup-avatar" data-av="' + a + '" aria-pressed="' + (setupAvatar === a) + '" ' +
        'aria-label="Chọn ảnh ' + a + '"><img src="assets/avatars/' + a + '.png" alt=""></button>';
    }).join('');
    return '<div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="setup-title">' +
      '<div class="auth-scrim"></div>' +
      '<div class="auth-card setup-card">' +
      '<div class="auth-head">' +
      '<h2 id="setup-title">Thông tin cơ bản</h2>' +
      '<p>Vài thông tin để Orbit gọi tên bạn và nhắc đúng dịp. Có thể sửa lại trong Cài đặt.</p>' +
      '</div>' +
      '<form id="form-orbit-profile" novalidate>' +
      '<div class="setup-av-row">' +
      '<span class="setup-av-current"><img src="assets/avatars/' + esc(setupAvatar || 'av-01') + '.png" alt=""></span>' +
      '<div class="setup-av-grid">' + grid + '</div>' +
      '</div>' +
      '<label class="auth-field"><span>Tên hiển thị</span>' +
      '<input type="text" name="name" maxlength="32" placeholder="Vd: Trân" value="' + esc(name) + '" autocomplete="given-name"></label>' +
      '<label class="auth-field"><span>Ngày sinh</span>' +
      '<input type="date" name="birthday" value="' + esc(bd) + '"></label>' +
      '<div class="auth-err" role="alert" hidden></div>' +
      '<button class="btn btn-primary btn-block" type="submit">Bắt đầu dùng Orbit →</button>' +
      '<button class="auth-skip" type="button" data-action="setup-skip">Để sau</button>' +
      '</form></div></div>';
  }
  function saveProfileSetup(form) {
    var fd = new FormData(form);
    var name = String(fd.get('name') || '').trim();
    var bd = String(fd.get('birthday') || '').trim();
    var err = form.querySelector('.auth-err');
    if (!name) { if (err) { err.textContent = 'Bạn nhập tên giúp mình nhé.'; err.hidden = false; } return; }
    state.settings.profileName = name;
    state.settings.profileAvatar = setupAvatar || '';
    state.settings.profileBirthday = bd;
    if (ACCT.token) {
      api('/api/profile', { method: 'PUT', body: { name: name, birthday: bd, avatar: setupAvatar || '' } })
        .catch(function () { });
    }
    setupOpen = false;
    if (!state.onboardingDone) { state.onboardingSlide = 1; }
    save(); render();
    showToast('Đã lưu thông tin của ' + name);
  }

  function authModalHtml() {
    if (!authOpen) return '';
    var acc = state.account;
    var signedIn = !!state.signedIn;
    return '<div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">' +
      '<div class="auth-scrim" data-action="auth-close"></div>' +
      '<div class="auth-card">' +
      '<button class="auth-x" data-action="auth-close" aria-label="Đóng">✕</button>' +
      '<div class="auth-head">' +
      '<h2 id="auth-title">' + (signedIn ? 'Bạn đã đăng nhập' : 'Chào mừng tới Orbit') + '</h2>' +
      '<p>' + (signedIn
        ? 'Đang dùng tài khoản <b>' + esc(acc ? acc.email : '') + '</b>.'
        : 'Đăng nhập để giữ dữ liệu của bạn trên thiết bị này, hoặc dùng thử ngay.') + '</p>' +
      '</div>' +
      (signedIn
        ? '<button class="btn btn-primary btn-block" data-action="auth-continue">Tiếp tục →</button>' +
          '<button class="auth-skip" data-action="auth-signout">Đăng xuất khỏi thiết bị này</button>'
        : (authForgot
          ? '<div class="auth-head" style="margin-bottom:4px"><h2 style="font-size:17px">Quên mật khẩu</h2>' +
            '<p>Nhập email đã đăng ký, Orbit sẽ gửi liên kết đặt lại mật khẩu (hết hạn sau 60 phút).</p></div>' +
            '<form id="form-orbit-forgot" novalidate>' +
            '<label class="auth-field"><span>Email</span>' +
            '<input type="email" name="email" autocomplete="email" placeholder="ban@orbit.app" value="' + esc(authDraftEmail) + '"></label>' +
            '<div class="auth-err" role="alert" hidden></div>' +
            '<button class="btn btn-primary btn-block" type="submit">Gửi liên kết đặt lại</button>' +
            '</form>' +
            '<button class="auth-skip" data-action="auth-forgot-back">← Quay lại đăng nhập</button>'
          : '<div class="auth-tabs">' +
            '<button class="auth-tab' + (authTab === 'login' ? ' on' : '') + '" data-action="auth-tab" data-t="login">Đăng nhập</button>' +
            '<button class="auth-tab' + (authTab === 'signup' ? ' on' : '') + '" data-action="auth-tab" data-t="signup">Đăng ký</button>' +
            '</div>' +
            '<form id="form-orbit-auth" data-mode="' + authTab + '" novalidate>' +
          '<label class="auth-field"><span>Email</span>' +
          '<input type="email" name="email" autocomplete="email" placeholder="ban@orbit.app" value="' +
          (acc && authTab === 'login' && authRemember ? esc(acc.email) : esc(authDraftEmail)) + '"></label>' +
          '<label class="auth-field"><span>Mật khẩu</span>' +
          '<input type="password" name="password" autocomplete="' + (authTab === 'login' ? 'current-password' : 'new-password') + '" placeholder="Ít nhất 6 ký tự"></label>' +
          (authTab === 'signup'
            ? '<label class="auth-field"><span>Nhập lại mật khẩu</span><input type="password" name="password2" autocomplete="new-password" placeholder="Nhập lại mật khẩu"></label>'
            : '') +
          '<label class="auth-remember"><input type="checkbox" name="remember"' + (authRemember ? ' checked' : '') + '><span>Nhớ thông tin đăng nhập trên máy này</span></label>' +
          '<div class="auth-err" role="alert" hidden></div>' +
          '<button class="btn btn-primary btn-block" type="submit">' + (authTab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản') + '</button>' +
          '</form>' +
          /* Chỉ hiện khi máy chủ đã cấu hình gửi mail — tránh nút chết */
          (appConfig.mailConfigured ? '<button class="auth-forgot" data-action="auth-forgot">Quên mật khẩu?</button>' : '') +
          '<div class="auth-or"><span>hoặc</span></div>' +
          '<button class="auth-google" data-action="auth-google">' + ic('link', 18) + ' Tiếp tục với Google</button>' +
          '<button class="auth-skip" data-action="auth-guest">Dùng thử không cần tài khoản</button>')) +
      '</div></div>';
  }

  function afterAuth(remember, isNew) {
    state.settings.rememberLogin = remember !== false;
    authOpen = false;
    if (isNew) { save(); openProfileSetup(); return; }
    save();
    if (state.onboardingDone) render(); else { state.onboardingSlide = 1; save(); render(); }
  }

  function submitAuth(form) {
    var fd = new FormData(form);
    var email = String(fd.get('email') || '').trim().toLowerCase();
    var pass = String(fd.get('password') || '');
    var pass2 = String(fd.get('password2') || '');
    var remember = !!fd.get('remember');
    authRemember = remember;
    authDraftEmail = email;
    var err = form.querySelector('.auth-err');
    var mode = form.dataset.mode || 'login';
    var btn = form.querySelector('button[type=submit]');
    function fail(msg) {
      if (err) { err.textContent = msg; err.hidden = false; }
      showToast(msg);
      if (btn) { btn.disabled = false; btn.textContent = mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'; }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('Email chưa đúng định dạng.');
    if (pass.length < 8) return fail('Mật khẩu cần ít nhất 8 ký tự.');
    if (mode === 'signup' && pass !== pass2) return fail('Hai mật khẩu chưa khớp nhau.');
    if (btn) { btn.disabled = true; btn.textContent = mode === 'login' ? 'Đang đăng nhập…' : 'Đang tạo…'; }

    var ep = mode === 'signup' ? '/api/auth/register' : '/api/auth/login';
    api(ep, { method: 'POST', body: { email: email, password: pass } }).then(function (r) {
      setToken(r.token, remember);
      ACCT.user = r.user;
      state.account = { email: r.user.email, provider: 'server', at: todayISO() };
      state.signedIn = true;
      state.settings.rememberLogin = remember;
      if (!state.settings.profileName || state.settings.profileName === 'Bạn') {
        state.settings.profileName = r.user.name || email.split('@')[0];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      showToast(mode === 'signup' ? 'Đã tạo tài khoản cho ' + email : 'Đã đăng nhập');
      authOpen = false;
      if (mode === 'signup') { openProfileSetup(); return; }
      return pullState().then(function (remote) {
        if (remote) {
          state = Object.assign(remote, {});
          state.signedIn = true; state.onboardingDone = true; state.onboardingSlide = 0;
          if (!state.settings.relationPriority) state.settings.relationPriority = JSON.parse(JSON.stringify(DEFAULT_PRIORITY));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          applyTheme(); render();
          if (location.hash === '#/onboarding' || !location.hash) location.hash = '#/home';
        } else {
          /* Tài khoản đã tồn tại nhưng chưa có dữ liệu trên máy chủ: vào thẳng trang chủ */
          state.onboardingDone = true; state.onboardingSlide = 0;
          save(); render();
          if (location.hash === '#/onboarding' || !location.hash) location.hash = '#/home';
        }
      });
    }).catch(function (e) {
      if (e.status === 409) { authTab = 'login'; authOpen = true; }
      var msg = e.status === 409 ? 'Email này đã có tài khoản — chuyển sang Đăng nhập giúp bạn.'
        : e.status === 401 ? 'Email hoặc mật khẩu chưa đúng.'
        : e.status === 400 ? (e.data && e.data.error === 'weak_password' ? 'Mật khẩu cần ít nhất 8 ký tự.' : 'Thông tin chưa hợp lệ.')
        : 'Không kết nối được máy chủ — kiểm tra mạng rồi thử lại.';
      fail(msg);
    });
  }

  function authGoogle() {
    var cid = appConfig.googleClientId || window.ORBIT_GOOGLE_CLIENT_ID;
    if (!cid) { showToast('Chưa cấu hình Google Client ID — hãy dùng email & mật khẩu.'); return; }
    function boot() {
      window.google.accounts.id.initialize({
        client_id: cid,
        callback: function (res) {
          api('/api/auth/google', { method: 'POST', body: { credential: res.credential } }).then(function (r) {
            setToken(r.token);
            ACCT.user = r.user;
            state.account = { email: r.user.email, provider: 'google', at: todayISO() };
            state.signedIn = true;
            authOpen = false;
            showToast('Xin chào ' + (r.user.name || r.user.email));
            return pullState().then(function (remote) {
              if (remote) {
                state = Object.assign(remote, {});
                state.signedIn = true; state.onboardingDone = true; state.onboardingSlide = 0;
                if (!state.settings.relationPriority) state.settings.relationPriority = JSON.parse(JSON.stringify(DEFAULT_PRIORITY));
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                applyTheme(); render();
                if (location.hash === '#/onboarding' || !location.hash) location.hash = '#/home';
              } else { save(); render(); if (location.hash === '#/onboarding' || !location.hash) location.hash = '#/home'; }
            });
          }).catch(function () { showToast('Đăng nhập Google chưa thành công — thử lại nhé.'); });
        }
      });
      window.google.accounts.id.prompt();
    }
    if (window.google && window.google.accounts) return boot();
    var sc = document.createElement('script');
    sc.src = 'https://accounts.google.com/gsi/client';
    sc.onload = boot;
    document.head.appendChild(sc);
  }

  function resetCardHtml() {
    if (!resetToken) return '';
    return '<div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title">' +
      '<div class="auth-scrim"></div>' +
      '<div class="auth-card">' +
      '<div class="auth-head"><h2 id="reset-title">Đặt mật khẩu mới</h2>' +
      '<p>Liên kết chỉ dùng một lần. Sau khi đổi, mọi thiết bị khác sẽ phải đăng nhập lại.</p></div>' +
      '<form id="form-orbit-reset" novalidate>' +
      '<label class="auth-field"><span>Mật khẩu mới</span>' +
      '<input type="password" name="password" autocomplete="new-password" placeholder="Ít nhất 8 ký tự"></label>' +
      '<label class="auth-field"><span>Nhập lại mật khẩu</span>' +
      '<input type="password" name="password2" autocomplete="new-password" placeholder="Nhập lại mật khẩu"></label>' +
      '<div class="auth-err" role="alert" hidden></div>' +
      '<button class="btn btn-primary btn-block" type="submit">Lưu mật khẩu mới</button>' +
      '</form>' +
      '<button class="auth-skip" data-action="reset-cancel">Để sau</button>' +
      '</div></div>';
  }

  function submitReset(form) {
    var fd = new FormData(form);
    var pass = String(fd.get('password') || '');
    var pass2 = String(fd.get('password2') || '');
    var err = form.querySelector('.auth-err');
    function fail(m) { if (err) { err.textContent = m; err.hidden = false; } }
    if (pass.length < 8) return fail('Mật khẩu cần ít nhất 8 ký tự.');
    if (pass !== pass2) return fail('Hai mật khẩu chưa khớp nhau.');
    api('/api/auth/reset', { method: 'POST', body: { token: resetToken, password: pass } }).then(function () {
      resetToken = '';
      history.replaceState(null, '', location.pathname + '#/onboarding');
      showToast('Đã đổi mật khẩu — hãy đăng nhập lại');
      authTab = 'login'; authForgot = false; authOpen = true;
      render();
    }).catch(function (e) {
      fail(e.status === 400 ? 'Liên kết đã hết hạn hoặc đã dùng — yêu cầu liên kết mới.' : 'Không kết nối được máy chủ.');
    });
  }

  function submitForgot(form) {
    var fd = new FormData(form);
    var email = String(fd.get('email') || '').trim().toLowerCase();
    var err = form.querySelector('.auth-err');
    function fail(m) { if (err) { err.textContent = m; err.hidden = false; } }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('Email chưa đúng định dạng.');
    api('/api/auth/forgot', { method: 'POST', body: { email: email } }).then(function (r) {
      if (r.delivered) {
        showToast('Đã gửi liên kết tới ' + email);
        authForgot = false;
        render();
      } else {
        fail(r.known === false
          ? 'Email này chưa có tài khoản. Kiểm tra lại hoặc tạo tài khoản mới.'
          : (appConfig.mailConfigured
            ? 'Chưa gửi được mail — thử lại sau ít phút.'
            : 'Máy chủ chưa cấu hình gửi mail nên không gửi được liên kết.'));
      }
    }).catch(function (e) {
      fail(e.status === 429 ? 'Bạn thử hơi nhiều lần — đợi một lát rồi thử lại.' : 'Không kết nối được máy chủ.');
    });
  }

  function trialCardHtml() {
    if (!trialExpired) return '';
    return '<div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="trial-title">' +
      '<div class="auth-scrim"></div>' +
      '<div class="auth-card">' +
      '<div class="auth-head">' +
      '<h2 id="trial-title">Hết 7 ngày dùng thử</h2>' +
      '<p>Dữ liệu dùng thử trên máy này đã được xoá. Tạo tài khoản miễn phí để bắt đầu lại — ' +
      'lần này dữ liệu được lưu trên máy chủ và đồng bộ giữa các thiết bị.</p>' +
      '</div>' +
      '<button class="btn btn-primary btn-block" data-action="auth-open">Tạo tài khoản / Đăng nhập</button>' +
      '<button class="auth-skip" data-action="trial-dismiss">Để sau</button>' +
      '</div></div>';
  }

  function renderOnboarding() {
    var i = state.onboardingSlide || 0;
    var s = ONBOARD_SLIDES[i];
    var gender = state.settings.gender === 'male' ? 'male' : 'female';
    var shot = s.shot
      ? '<div class="onboard-art-band has-shot">' +
        '<img class="band-shot" src="' + s.shot + '" alt="' + s.shotAlt + '" loading="lazy"></div>'
      : '<div class="onboard-art-band"></div>';
    return (
      '<div class="onboard-wrap"><div class="onboard-content">' +
      '<div class="onboard-top">' +
      '<div class="onboard-logo-badge"><img src="assets/logo-orbit.png" alt="Orbit"></div>' +
      '<h1 class="onboard-title">' + s.title + '</h1>' +
      '<p class="onboard-sub">' + s.sub + '</p>' +

      '</div>' +
      shot +
      '<div class="onboard-bottom">' +
      '<button class="btn btn-primary btn-block" data-action="' +
      (i === 0 ? 'auth-open' : (i < ONBOARD_SLIDES.length - 1 ? 'onboard-next' : 'onboard-finish')) + '">' +
      (i === 0 && state.signedIn ? 'Tiếp tục' : s.primary) + ' →</button>' +
      (s.showSkip ? '<button class="onboard-skip" data-action="contacts-import">Nhập danh bạ</button>' : '') +
      '<div class="onboard-dots">' + ONBOARD_SLIDES.map(function (_, idx) { return '<span class="d ' + (idx === i ? 'on' : '') + '" data-action="onboard-dot" data-i="' + idx + '"></span>'; }).join('') + '</div>' +
      '</div></div>' +
      /* Ảnh demo màn hình rộng: absolute so với .onboard-wrap nên không đẩy bố cục */
      (s.shot ? '<img class="onboard-shot" src="' + s.shot + '" alt="' + s.shotAlt + '" loading="lazy">' : '') +
      authModalHtml() + profileSetupHtml() + resetCardHtml() + trialCardHtml() + '</div>'
    );
  }
  function onboardNext() { state.onboardingSlide = Math.min((state.onboardingSlide || 0) + 1, ONBOARD_SLIDES.length - 1); save(); render(); }
  function finishOnboarding() {
    state.onboardingDone = true;
    var firstRun = !state.settings.tourDone;
    save();
    navigate('home');
    syncInbox(true);
    if (firstRun) setTimeout(startTour, 500);
  }
  function tryContactsImport() {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      navigator.contacts.select(['name', 'tel'], { multiple: true }).then(function (contacts) {
        showToast('Đã nhận ' + contacts.length + ' liên hệ (demo)');
      }).catch(function () { showToast('Bạn đã huỷ chọn danh bạ'); });
    } else {
      showToast('Trình duyệt này chưa hỗ trợ nhập danh bạ trực tiếp (cần app di động / Chrome Android)');
    }
  }

  /* ---------------------------- Modal + toast ---------------------------- */
  function openModal(html) {
    closeModal();
    document.body.insertAdjacentHTML('beforeend', '<div class="modal-backdrop" id="modal-backdrop">' + html + '</div>');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    var el = document.getElementById('modal-backdrop');
    if (el) el.remove();
    document.body.style.overflow = '';
  }
  function showToast(msg) {
    var root = document.getElementById('toast-root');
    root.innerHTML = '<div class="toast">' + esc(msg) + '</div>';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { root.innerHTML = ''; }, 2200);
  }

  function openQuickAddModal() {
    openModal(
      '<div class="modal-sheet"><div class="modal-head"><h3>Thêm nhanh</h3><button data-action="close-modal">✕</button></div>' +
      '<div style="display:flex;flex-direction:column;gap:10px;">' +
      '<button class="btn btn-ghost btn-block" data-action="open-add-person">' + ic('people', 20) + ' Thêm người mới</button>' +
      '<button class="btn btn-ghost btn-block" data-action="open-add-event">' + ic('calendar', 20) + ' Thêm sự kiện mới</button>' +
      '</div></div>'
    );
  }
  function openAddPersonModal() {
    var gs = state.settings.groups || [];
    var relPicked = openAddPersonRel || 'friend';
    var relHtml = REL_TYPES.map(function (r, i) {
      return '<label class="chip-radio' + (r.k === relPicked ? ' on' : '') + '">' +
        '<input type="radio" name="relationship" value="' + r.k + '"' + (r.k === relPicked ? ' checked' : '') + '>' +
        '<span>' + r.label + '</span></label>';
    }).join('');
    var groupHtml = gs.map(function (g) {
      return '<label class="chip-check"><input type="checkbox" name="groups" value="' + esc(g.id) + '"><span>' + esc(g.name) + '</span></label>';
    }).join('');
    openModal(
      '<div class="modal-sheet"><div class="modal-head"><h3>Thêm người mới</h3><button data-action="close-modal">✕</button></div>' +
      '<form id="form-add-person">' +
      '<div class="field"><label>Tên</label><input type="text" name="name" required placeholder="Vd: Hoa"></div>' +
      '<div class="field"><label>Ảnh đại diện <em class="field-hint">chọn từ bộ có sẵn hoặc tải ảnh lên</em></label>' +
      '<div class="av-grid av-grid-sm">' +
      AVATAR_PRESETS.slice(0, 12).map(function (a) {
        return '<button type="button" class="av-pick' + (openAddPersonAvatar === a ? ' on' : '') + '" ' +
          'data-action="add-person-avatar" data-av="' + a + '" aria-label="Chọn ảnh ' + a + '">' +
          '<img src="assets/avatars/' + a + '.png" alt=""></button>';
      }).join('') +
      '</div>' +
      '<label class="btn btn-block av-upload" style="margin-top:8px;">Tải ảnh từ máy' +
      '<input type="file" accept="image/*" id="addPersonAvatarUpload" hidden></label>' +
      '</div>' +
      '<div class="field"><label>Mối quan hệ</label><div class="chip-picker rel-picker">' + relHtml + '</div></div>' +
      '<div class="field"><label>Nhóm <em class="field-hint">không bắt buộc, chọn nhiều được</em></label>' +
      '<div class="chip-picker group-picker">' + groupHtml +
      '<span class="new-group-row"><input type="text" id="new-group-name" placeholder="Nhóm mới…">' +
      '<button type="button" class="chip-add" data-action="new-group-inline">+ Tạo</button></span></div></div>' +
      '<div class="field"><label>Ngày sinh (không bắt buộc)</label><input type="date" name="birthday"></div>' +
      '<button type="submit" class="btn btn-primary btn-block">Thêm vào Orbit</button></form></div>'
    );
  }
  function openAddEventModal(dateIso) {
    openModal(
      '<div class="modal-sheet"><div class="modal-head"><h3>Thêm sự kiện</h3><button data-action="close-modal">✕</button></div>' +
      '<form id="form-add-event">' +
      '<div class="field"><label>Tiêu đề</label><input type="text" name="title" required placeholder="Vd: Họp nhóm"></div>' +
      '<div class="field"><label>Loại sự kiện</label>' +
      '<div class="ev-picker">' + EVENT_CATS.map(function (c, i) {
        return '<label class="ev-opt ' + c.tone + '"><input type="radio" name="type" value="' + c.k + '"' + (i === 0 ? ' checked' : '') + '>' +
          '<span class="ev-opt-in"><img src="assets/event-icons/' + c.img + '" alt=""><em>' + c.label + '</em></span></label>';
      }).join('') + '</div></div>' +
      '<div class="field"><label>Ngày</label><input type="date" name="date" value="' + (dateIso || todayISO()) + '" required></div>' +
      '<div class="field"><label>Giờ (không bắt buộc)</label><input type="time" name="time"></div>' +
      '<div class="field"><label>Địa điểm (không bắt buộc)</label><input type="text" name="location" placeholder="Vd: Quán cà phê"></div>' +
      '<label class="remind-opt"><input type="checkbox" name="remind" value="1" checked>' +
      '<span><b>Nhắc nhở cho sự kiện này</b><em>Mặc định bật — tắt nếu bạn không muốn bị nhắc</em></span></label>' +
      '<button type="submit" class="btn btn-primary btn-block">Lưu sự kiện</button></form></div>'
    );
  }

  /* ---------------------------- mutations ---------------------------- */
  function toggleFavorite(id) {
    var p = state.people.find(function (x) { return x.id === id; }); if (!p) return;
    p.favorite = !p.favorite; logActivity(p, p.favorite ? 'Đã đánh dấu yêu thích' : 'Đã bỏ yêu thích'); save(); render();
  }
  function toggleReminder(pid, rid) {
    var p = state.people.find(function (x) { return x.id === pid; }); if (!p) return;
    var r = (p.reminders || []).find(function (x) { return x.id === rid; }); if (!r) return;
    r.enabled = !r.enabled; logActivity(p, (r.enabled ? 'Đã bật' : 'Đã tắt') + ' nhắc nhở: ' + r.label); save(); render();
  }
  function quickActionBirthday(id) {
    var p = state.people.find(function (x) { return x.id === id; }); if (!p) return;
    var r = (p.reminders || []).find(function (r) { return r.label === 'Sinh nhật'; });
    if (!r) {
      if (!p.birthday) { showToast('Chưa có ngày sinh để đặt nhắc nhở'); return; }
      r = { id: uid('rm'), label: 'Sinh nhật', mmdd: p.birthday, enabled: true };
      p.reminders = p.reminders || []; p.reminders.push(r);
    } else { r.enabled = true; }
    logActivity(p, 'Đã bật nhắc nhở sinh nhật'); save(); showToast('Đã bật nhắc nhở sinh nhật'); render();
  }
  function addMemoryPrompt(id) {
    var p = state.people.find(function (x) { return x.id === id; }); if (!p) return;
    var caption = prompt('Mô tả ngắn cho kỷ niệm này:'); if (!caption) return;
    var colors = ['#E8A6B4', '#8CB4E0', '#8FCB9B', '#C6A6E8', '#F0B870'];
    var color = colors[(p.memories || []).length % colors.length];
    p.memories = p.memories || []; p.memories.push({ id: uid('mm'), caption: caption, color: color });
    logActivity(p, 'Đã thêm kỷ niệm: ' + caption); save(); render();
  }
  function openInlineReminderForm(pid) {
    var p = state.people.find(function (x) { return x.id === pid; }); if (!p) return;
    var label = prompt('Nội dung nhắc nhở:', 'Nhắc hẹn'); if (!label) return;
    var dateStr = prompt('Ngày (YYYY-MM-DD):', todayISO()); if (!dateStr) return;
    p.reminders = p.reminders || [];
    p.reminders.push({ id: uid('rm'), label: label, date: dateStr, enabled: true });
    logActivity(p, 'Đã thêm nhắc nhở: ' + label); save(); render();
  }
  function deletePerson(id) { state.people = state.people.filter(function (p) { return p.id !== id; }); save(); navigate('people'); }
  function exportData() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = 'orbit-data.json'; a.click();
    URL.revokeObjectURL(url); showToast('Đã xuất dữ liệu');
  }
  /* Xoá riêng danh bạ, giữ cài đặt. Sự kiện gắn với người bị xoá cũng dọn theo
     để không còn sự kiện trỏ tới id đã mất. */
  /* Đặt lại quỹ đạo: bỏ mọi vòng người dùng đã kéo tay, xếp lại theo mức ưu tiên */
  function resetOrbitLayout() {
    var had = state.people.filter(function (p) { return p.ring; }).length;
    state.people.forEach(function (p) { delete p.ring; });
    save(); render();
    showToast(had ? 'Đã đặt lại quỹ đạo cho ' + had + ' người' : 'Quỹ đạo đã đúng thứ tự ưu tiên');
  }
  function createGroup(name) {
    var n = (name || '').trim();
    if (!n) return null;
    var g = { id: uid('g'), name: n };
    state.settings.groups = state.settings.groups || [];
    state.settings.groups.push(g);
    save();
    return g;
  }
  function deleteGroup(gid) {
    var g = (state.settings.groups || []).filter(function (x) { return x.id === gid; })[0];
    if (!g) return;
    if (!confirm('Xoá nhóm "' + g.name + '"? Người trong nhóm không bị xoá.')) return;
    state.settings.groups = (state.settings.groups || []).filter(function (x) { return x.id !== gid; });
    state.people.forEach(function (p) {
      if (Array.isArray(p.groups)) p.groups = p.groups.filter(function (x) { return x !== gid; });
    });
    peopleGroupSel = peopleGroupSel.filter(function (x) { return x !== gid; });
    save(); render(); showToast('Đã xoá nhóm');
  }
  function setRelationPriority(rel, level) {
    state.settings.relationPriority = state.settings.relationPriority || JSON.parse(JSON.stringify(DEFAULT_PRIORITY));
    state.settings.relationPriority[rel] = level;
    save();
    showToast('Đã đổi mức ưu tiên');
  }
  function wipePeople() {
    if (!confirm('Xoá toàn bộ liên hệ? Sự kiện gắn với những người này cũng bị xoá. Không thể hoàn tác.')) return;
    var ids = {};
    state.people.forEach(function (p) { ids[p.id] = 1; });
    var removed = state.people.length;
    state.people = [];
    state.events = state.events.filter(function (ev) { return !(ev.personId && ids[ev.personId]); });
    save(); render(); showToast('Đã xoá ' + removed + ' liên hệ');
  }
  function wipeData() {
    if (!confirm('Xoá toàn bộ dữ liệu? Không thể hoàn tác.')) return;
    state = emptyState(state.settings); save(); navigate('home'); showToast('Đã xoá toàn bộ dữ liệu');
  }
  function saveProfileName() {
    var v = document.getElementById('profile-name-input').value.trim();
    if (v) { state.settings.profileName = v; save(); showToast('Đã lưu tên hiển thị'); }
  }

  /* ---------------------------- global event delegation ---------------------------- */
  function onGlobalClick(e) {
    if (e.target.classList && e.target.classList.contains('modal-backdrop')) { closeModal(); return; }
    if (e.target.classList && e.target.classList.contains('theme-drawer-backdrop')) { closeDiaryThemeDrawer(); return; }
    var t = e.target.closest && e.target.closest('[data-action]');
    if (!t) return;
    /* Link placeholder href="#" (nút "Thêm người"...) chỉ để bắt click, không được đổi hash —
       nếu không, route nhảy về Home ngay sau khi mở modal. */
    if (t.tagName === 'A' && t.getAttribute('href') === '#') e.preventDefault();
    var action = t.dataset.action;
    switch (action) {
      case 'nav':
        if (orbitJustDragged) { orbitJustDragged = false; break; }
        navigate(t.dataset.to); break;
      case 'select-day': calSelectedDay = t.dataset.date; calStripMore = false; render(); break;
      case 'toggle-pd-side':
        state.settings.pdSideCollapsed = !state.settings.pdSideCollapsed;
        save(); render(); break;
      case 'open-event': openEventDetail(t.dataset.date, Number(t.dataset.idx)); break;
      case 'toggle-strip-more': calStripMore = !calStripMore; render(); break;
      case 'focus-person':
        if (orbitJustDragged) { orbitJustDragged = false; break; }
        orbitFocus = t.dataset.pid; movePickerOpen = false; render(); break;
      case 'close-focus': {
        var keep = { scale: orbitView.scale, x: orbitView.x, y: orbitView.y };
        orbitFocus = null; movePickerOpen = false; stopFocusFollow();
        render();
        orbitView = keep; applyOrbitView();   // giữ khung đang zoom
        animateOrbitView({ scale: defaultOrbitScale(), x: 0, y: 0 }); // rồi lùi ra từ từ
        break;
      }
      case 'toggle-move': movePickerOpen = !movePickerOpen; render(); break;
      case 'move-person':
        var moveRing = Number(t.dataset.ring);
        movePickerOpen = false;
        bubbleThen(t.dataset.pid, function (pid) {
          var person = state.people.find(function (x) { return x.id === pid; });
          if (person) { person.ring = moveRing; save(); }
          render();
        }); break;
      case 'delete-person':
        if (!confirm('Xoá liên hệ này? Hành động không hoàn tác được.')) break;
        bubbleThen(t.dataset.id, function (pid) {
          state.people = state.people.filter(function (x) { return x.id !== pid; });
          if (orbitFocus === pid) { orbitFocus = null; stopFocusFollow(); }
          save(); render(); showToast('Đã xoá liên hệ');
        }); break;
      case 'open-quickadd': openQuickAddModal(); break;
      case 'open-add-person': openAddPersonModal(); break;
      case 'open-add-event': openAddEventModal(t.dataset.date || ''); break;
      case 'close-modal': closeModal(); break;
      case 'toast': showToast(t.dataset.msg || ''); break;
      case 'set-view-mode': peopleViewMode = t.dataset.mode; render(); break;
      case 'toggle-orbit': togglePeopleDrawer(); break;
      case 'orbit-motion': toggleOrbitMotion(); break;
      case 'orbit-zoom': zoomOrbit(t.dataset.dz === '1' ? 1.25 : 1 / 1.25); break;
      case 'orbit-reset': {
        var keep2 = { scale: orbitView.scale, x: orbitView.x, y: orbitView.y };
        orbitFocus = null; movePickerOpen = false; stopFocusFollow();
        render();
        orbitView = keep2; applyOrbitView();
        animateOrbitView({ scale: defaultOrbitScale(), x: 0, y: 0 });
        break;
      }
      case 'open-avatar-picker': openAvatarPicker(t.dataset.id); break;
      case 'add-person-avatar': {
        openAddPersonAvatar = t.dataset.av || '';
        var picks = t.parentElement.querySelectorAll('.av-pick');
        for (var pi = 0; pi < picks.length; pi++) picks[pi].classList.remove('on');
        t.classList.add('on');
        break;
      }
      case 'pick-avatar': setProfileAvatar(t.dataset.id, t.dataset.av); break;
      case 'clear-avatar': setProfileAvatar(t.dataset.id, ''); break;
      case 'open-cover-picker': openCoverPicker(t.dataset.id); break;
      case 'pick-cover': setProfileCover(t.dataset.id, t.dataset.v); break;
      case 'clear-cover': setProfileCover(t.dataset.id, ''); break;
      case 'toggle-rel-filter': {
        var rel = t.dataset.rel, ri = peopleRelSel.indexOf(rel);
        if (ri > -1) peopleRelSel.splice(ri, 1); else peopleRelSel.push(rel);
        render(); break;
      }
      case 'toggle-group-filter': {
        var gid = t.dataset.gid, gi = peopleGroupSel.indexOf(gid);
        if (gi > -1) peopleGroupSel.splice(gi, 1); else peopleGroupSel.push(gid);
        render(); break;
      }
      case 'toggle-fav-filter': peopleFavOnly = !peopleFavOnly; render(); break;
      case 'clear-filters': peopleRelSel = []; peopleGroupSel = []; peopleFavOnly = false; render(); break;
      case 'reset-orbit-layout': resetOrbitLayout(); break;
      case 'delete-group': deleteGroup(t.dataset.gid); break;
      case 'new-group-inline': {
        var gi2 = document.getElementById('new-group-name');
        var nm = (gi2 && gi2.value || '').trim();
        if (!nm) { if (gi2) gi2.focus(); return; }
        var ng = createGroup(nm);
        var box = document.querySelector('.group-picker');
        if (ng && box) {
          var lab = document.createElement('label');
          lab.className = 'chip-check';
          lab.innerHTML = '<input type="checkbox" name="groups" value="' + esc(ng.id) + '" checked><span>' + esc(ng.name) + '</span>';
          box.insertBefore(lab, box.querySelector('.new-group-row'));
        }
        if (gi2) gi2.value = '';
        break;
      }
      case 'toggle-favorite': toggleFavorite(t.dataset.id); break;
      case 'delete-person': if (confirm('Xoá liên hệ này?')) deletePerson(t.dataset.id); break;
      case 'toggle-reminder': toggleReminder(t.dataset.pid, t.dataset.rid); break;
      case 'toggle-remind-people-all': {
        state.settings.remindPeopleAll = state.settings.remindPeopleAll === false;
        save(); render(); break;
      }
      case 'toggle-remind-events-all': {
        state.settings.remindEventsAll = state.settings.remindEventsAll === false;
        save(); render(); break;
      }
      case 'remind-all-on': {
        state.settings.remindPeopleAll = true;
        state.settings.remindEventsAll = true;
        state.people.forEach(function (p) { p.remindOn = true; (p.reminders || []).forEach(function (r) { r.enabled = true; }); });
        var evOn = {}; EVENT_CATS.forEach(function (c) { evOn[c.k] = true; });
        state.settings.eventRemind = evOn;
        save(); render(); showToast('Đã bật toàn bộ nhắc nhở'); break;
      }
      case 'remind-all-off': {
        state.settings.remindPeopleAll = false;
        state.settings.remindEventsAll = false;
        state.people.forEach(function (p) { p.remindOn = false; (p.reminders || []).forEach(function (r) { r.enabled = false; }); });
        var evOff = {}; EVENT_CATS.forEach(function (c) { evOff[c.k] = false; });
        state.settings.eventRemind = evOff;
        save(); render(); showToast('Đã tắt toàn bộ nhắc nhở'); break;
      }
      case 'toggle-person-remind': {
        var pp = state.people.find(function (x) { return x.id === t.dataset.pid; });
        if (!pp) break;
        pp.remindOn = pp.remindOn === false;
        (pp.reminders || []).forEach(function (r) { r.enabled = pp.remindOn; });
        save(); render(); break;
      }
      case 'rm-select': {
        rmSel = t.dataset.pid;
        render(); break;
      }
      case 'toggle-remind-group': {
        var pg = state.people.find(function (x) { return x.id === t.dataset.pid; });
        if (!pg) break;
        var gName = t.dataset.group;
        var gItems = personReminderItems(pg).filter(function (it) { return it.group === gName; });
        var turnOn = !gItems.every(function (it) { return it.on; });
        gItems.forEach(function (it) { setReminderFlag(pg, it.key, turnOn); });
        save(); render(); break;
      }
      case 'toggle-remind-item': {
        var pItem = state.people.find(function (x) { return x.id === t.dataset.pid; });
        if (!pItem) break;
        setReminderFlag(pItem, t.dataset.key || '', !(personReminderItems(pItem)
          .filter(function (it) { return it.key === t.dataset.key; })[0] || {}).on);
        save(); render(); break;
      }
      case 'toggle-event-remind': {
        var em = state.settings.eventRemind || (state.settings.eventRemind = {});
        em[t.dataset.cat] = em[t.dataset.cat] === false;
        save(); render(); break;
      }
      case 'edit-msg-template': openTemplateEditor(t.dataset.cat); break;
      case 'reset-msg-template': {
        if (state.settings.msgTemplates) delete state.settings.msgTemplates[t.dataset.cat];
        save(); closeModal(); render(); showToast('Đã khôi phục mẫu tin mặc định'); break;
      }
      case 'toggle-notify': {
        var ch = chCfg(t.dataset.ch);
        ch.on = !ch.on;
        save(); render(); break;
      }
      case 'save-notify': {
        var cc = chCfg(t.dataset.ch);
        var inp = document.querySelector('[data-role="notify-input"][data-ch="' + t.dataset.ch + '"]');
        cc.id = inp ? inp.value.trim() : '';
        if (!cc.id) { showToast('Nhập tài khoản muốn nhận tin trước đã'); break; }
        cc.on = true; save(); render();
        showToast('Đã lưu kênh ' + (t.dataset.ch === 'push' ? 'thông báo app' : t.dataset.ch === 'telegram' ? 'Telegram' : 'Zalo') + ' (chưa gửi thật)');
        break;
      }
      case 'add-reminder-inline': openInlineReminderForm(t.dataset.pid); break;
      case 'quick-birthday': quickActionBirthday(t.dataset.id); break;
      case 'quick-note-focus': var ta = document.getElementById('notes-area'); if (ta) ta.focus(); break;
      case 'add-memory': addMemoryPrompt(t.dataset.id); break;
      case 'invite-memory': openInviteModal(t.dataset.id); break;
      case 'pd-tab': pdTab = t.dataset.tab || 'all'; render(); break;
      case 'me-tab': meTab = t.dataset.tab || 'overview'; render(); break;
      case 'hide-home-suggest': state.settings.homeSuggestHidden = true; save(); render(); showToast('Đã ẩn gợi ý — bật lại trong Cài đặt'); break;
      case 'home-day': homeDay = t.dataset.date; render(); break;
      case 'set-gender': setGender(t.dataset.g); break;
      case 'open-write-for-me': openWriteForMe(); break;
      case 'copy-write-link': {
        var wf = document.getElementById('wfLink');
        if (!wf) break;
        wf.select();
        var done = false;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(wf.value).then(function () { showToast('Đã sao chép link'); });
          done = true;
        }
        if (!done) { try { document.execCommand('copy'); showToast('Đã sao chép link'); } catch (e) { showToast('Chọn link và copy tay nhé'); } }
        break;
      }
      case 'toggle-home-quick':
        state.settings.homeQuick = state.settings.homeQuick === false; save(); render(); break;
      case 'toggle-home-week':
        state.settings.homeWeek = state.settings.homeWeek === false; save(); render(); break;
      case 'toggle-home-upcoming':
        state.settings.homeUpcoming = state.settings.homeUpcoming === false; save(); render(); break;
      case 'toggle-home-occasions': state.settings.homeOccasions = state.settings.homeOccasions === false; save(); render(); break;
      case 'toggle-home-suggest': state.settings.homeSuggest = state.settings.homeSuggest === false; if (state.settings.homeSuggest) state.settings.homeSuggestHidden = false; save(); render(); break;
      case 'edit-me-name': {
        var cur = state.settings.profileName || 'Bạn';
        var nn = prompt('Tên hiển thị của bạn:', cur);
        if (nn && nn.trim() && nn.trim() !== cur) {
          state.settings.profileName = nn.trim().slice(0, 40);
          save(); render(); showToast('Đã đổi tên hiển thị');
        }
        break;
      }
      case 'copy-invite': copyInviteLink(); break;
      case 'share-invite':
        if (inviteShare && navigator.share) {
          navigator.share({ title: 'Một lời nhắn cho bạn', text: 'Gửi bạn một lời mời nhỏ trên Orbit', url: inviteShare.url })
            .catch(function () {});
        } else { copyInviteLink(); }
        break;
      case 'revoke-invite':
        if (!inviteShare) break;
        if (!confirm('Thu hồi link này? Người nhận sẽ không mở được nữa.')) break;
        (function () {
          apiCall('/api/invite/' + encodeURIComponent(inviteShare.token) + '/revoke', 'POST', {}).then(function (res) {
              showToast(res.ok ? 'Đã thu hồi link' : 'Không thu hồi được');
              if (res.ok) closeModal();
            }).catch(function () { showToast('Mất kết nối'); });
        })();
        break;
      case 'open-guest-memory': openGuestMemory(t.dataset.id, t.dataset.mid); break;
      case 'hide-guest-memory': guestMemoryAction('hide', t.dataset.id, t.dataset.mid); break;
      case 'delete-guest-memory': guestMemoryAction('delete', t.dataset.id, t.dataset.mid); break;
      case 'open-all-upcoming': openAllUpcomingModal(); break;
      case 'cal-prev': calMonthOffset--; render(); break;
      case 'cal-next': calMonthOffset++; render(); break;
      case 'cal-today': calMonthOffset = 0; render(); break;
      case 'dismiss-banner': bannerDismissed = true; render(); break;
      case 'settings-theme': setTheme(t.dataset.theme); break;
      case 'pick-diary-theme': {
        var dth = t.dataset.theme;
        if (dth && state.settings.diaryCoverTheme !== dth) {
          syncDiaryText();   /* đổi bìa giữa lúc viết thì không được mất chữ đang gõ */
          state.settings.diaryCoverTheme = dth; save(); render();
          var picked = DIARY_THEMES.find(function (x) { return x.id === dth; });
          showToast('Đã đổi bìa: ' + (picked ? picked.label : dth));
        }
        closeDiaryThemeDrawer();
        break;
      }
      case 'open-diary-theme-drawer': openDiaryThemeDrawer(); break;
      case 'close-diary-theme-drawer': closeDiaryThemeDrawer(); break;
      case 'diary-new':
        diaryDraft = {
          text: '', target: 'me', paperId: (state.settings.diaryPaperId || 'paper-rule'),
          free: null, font: (state.settings.diaryFont || 'serif'), date: todayISO(),
          remind: true   /* mặc định có nhắc nhở, tắt được ngay trong bảng bên phải */
        };
        diaryLayingIn = true;   /* lần render này chạy animation trải giấy */
        render(); break;
      case 'diary-cancel': diaryDraft = null; render(); break;
      case 'diary-save': diarySave(); break;
      case 'diary-date': {
        var dEl = document.getElementById('diaryDate');
        if (!dEl) break;
        if (dEl.showPicker) { try { dEl.showPicker(); break; } catch (e) {} }
        dEl.click(); break;
      }
      case 'diary-remind': {
        if (!diaryDraft) break;
        syncDiaryText();
        diaryDraft.remind = t.dataset.on === '1';
        render(); break;
      }
      case 'diary-snap': {
        if (!diaryDraft) break;
        syncDiaryText();
        diaryDraft.free = t.dataset.snap === '0';
        render(); break;
      }
      case 'diary-font': {
        if (!diaryDraft) break;
        syncDiaryText();
        diaryDraft.font = t.dataset.font || 'serif';
        state.settings.diaryFont = diaryDraft.font;
        save(); render(); break;
      }
      case 'diary-free': {
        if (!diaryDraft) break;
        syncDiaryText();
        var baseP = getPaper(diaryDraft.paperId);
        var snapping = diaryDraft.free != null ? !diaryDraft.free : baseP.snap !== false;
        diaryDraft.free = snapping;   /* đang canh dòng -> chuyển sang viết tự do, và ngược lại */
        render(); break;
      }
      case 'diary-target':
        if (!diaryDraft) break;
        syncDiaryText(); diaryDraft.target = t.dataset.target || 'me'; render(); break;
      case 'diary-paper':
        if (!diaryDraft) break;
        syncDiaryText(); diaryDraft.paperId = t.dataset.paperId; diaryDraft.free = null; render(); break;
      case 'diary-del': {
        var delId = t.dataset.id;
        state.diaries = (state.diaries || []).filter(function (d) { return d.id !== delId; });
        save(); render(); showToast('Đã xoá bài nhật ký'); break;
      }
      case 'toggle-ai': toggleAI(); break;
      case 'export-data': exportData(); break;
      case 'import-data': var inp = document.getElementById('import-file-input'); if (inp) inp.click(); break;
      case 'wipe-data': wipeData(); break;
      case 'wipe-people': wipePeople(); break;
      case 'contacts-import': tryContactsImport(); break;
      case 'start-tour': startTour(); break;
      case 'auth-open': trialExpired = false; openAuth(); break;
      case 'trial-dismiss': trialExpired = false; render(); break;
      case 'auth-forgot': authForgot = true; authOpen = true; render(); break;
      case 'auth-forgot-back': authForgot = false; authTab = 'login'; render(); break;
      case 'reset-cancel':
        resetToken = '';
        history.replaceState(null, '', location.pathname + (state.onboardingDone ? '#/home' : '#/onboarding'));
        render(); break;
      case 'setup-avatar': setupAvatar = t.dataset.av; render(); break;
      case 'setup-skip':
        setupOpen = false;
        if (!state.onboardingDone) state.onboardingSlide = 1;
        save(); render(); break;
      case 'auth-close': closeAuth(); break;
      case 'auth-tab': authTab = t.dataset.t; render(); break;
      case 'auth-google': authGoogle(); break;
      case 'auth-guest': authOpen = false; state.onboardingSlide = 1; save(); render(); break;
      case 'auth-continue': closeAuth(); state.onboardingSlide = 1; save(); render(); break;
      case 'auth-signout':
        if (ACCT.token) { api('/api/auth/logout', { method: 'POST' }).catch(function () { }); setToken(''); }
        ACCT.user = null;
        /* Xoá bản cục bộ để người đăng nhập sau không thấy dữ liệu của tài khoản trước */
        state = emptyState(state.settings);
        state.signedIn = false;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        authOpen = false;
        showToast('Đã đăng xuất');
        navigate('onboarding');
        break;
      case 'onboard-next': onboardNext(); break;
      case 'onboard-dot': state.onboardingSlide = Number(t.dataset.i); save(); render(); break;
      case 'onboard-finish': finishOnboarding(); break;
      case 'save-profile-name': saveProfileName(); break;
    }
  }
  function onGlobalSubmit(e) {
    var form = e.target;
    if (form.id === 'form-orbit-auth') { e.preventDefault(); submitAuth(form); return; }
    if (form.id === 'form-orbit-profile') { e.preventDefault(); saveProfileSetup(form); return; }
    if (form.id === 'form-orbit-forgot') { e.preventDefault(); submitForgot(form); return; }
    if (form.id === 'form-orbit-reset') { e.preventDefault(); submitReset(form); return; }
    if (form.id === 'form-add-group') {
      e.preventDefault();
      var gname = (new FormData(form).get('name') || '').trim();
      if (!gname) return;
      createGroup(gname); render(); showToast('Đã tạo nhóm ' + gname);
      return;
    }
    if (form.id === 'form-add-person') {
      e.preventDefault();
      var fd = new FormData(form);
      var name = (fd.get('name') || '').trim();
      if (!name) return;
      var birthdayRaw = fd.get('birthday');
      var birthday = birthdayRaw ? toMMDD(new Date(birthdayRaw + 'T00:00:00')) : '';
      var p = mkPerson(name, fd.get('relationship'), null, false, birthday, null, '', '');
      p.groups = (fd.getAll('groups') || []).filter(Boolean);
      if (openAddPersonAvatar) p.avatar = openAddPersonAvatar;
      openAddPersonAvatar = '';
      state.people.push(p); save(); closeModal(); showToast('Đã thêm ' + name); navigate('people');
    } else if (form.id === 'form-msg-template') {
      e.preventDefault();
      var tfd = new FormData(form);
      var cat = tfd.get('cat');
      var txt = (tfd.get('text') || '').trim();
      if (!state.settings.msgTemplates) state.settings.msgTemplates = {};
      if (txt) state.settings.msgTemplates[cat] = txt.slice(0, 240);
      save(); closeModal(); render(); showToast('Đã lưu mẫu tin nhắn');
    } else if (form.id === 'form-write-for-me') {
      e.preventDefault();
      var wfd = new FormData(form);
      var wtext = (wfd.get('text') || '').trim();
      if (!wtext) return;
      state.messages = state.messages || [];
      state.messages.unshift({
        id: uid('ms'), text: wtext, from: (wfd.get('from') || '').trim() || 'Một người bạn',
        at: new Date().toISOString(), token: wfd.get('token') || ''
      });
      save();
      form.innerHTML = '<div class="wf-done">✨<b>Đã gửi lời nhắn!</b><span>Cảm ơn bạn, ' +
        esc(state.settings.profileName || 'chủ tài khoản') + ' sẽ nhận được nó trong Orbit.</span>' +
        '<a class="btn btn-primary btn-block" href="#/home">Mở Orbit</a></div>';
    } else if (form.id === 'form-add-event') {
      e.preventDefault();
      var fd2 = new FormData(form);
      var title = (fd2.get('title') || '').trim();
      if (!title) return;
      var ev = mkEvent(title, fd2.get('type'), fd2.get('date'));
      ev.location = fd2.get('location') || '';
      ev.time = fd2.get('time') || '';
      ev.remind = !!fd2.get('remind');   /* mặc định tick sẵn, người dùng có thể bỏ trước khi lưu */
      state.events.push(ev); save(); closeModal(); showToast(ev.remind ? 'Đã thêm sự kiện (có nhắc nhở)' : 'Đã thêm sự kiện (không nhắc)'); render();
    }
  }

  function diarySave() {
    if (!diaryDraft) return;
    var ta = document.getElementById('diaryText');
    if (ta) diaryDraft.text = ta.value;
    var text = (diaryDraft.text || '').trim();
    if (!text) { showToast('Bạn chưa viết gì mà ✍'); return; }
    var paper = getPaper(diaryDraft.paperId);
    var target = diaryDraft.target || 'me';
    var prev = diaryDraft.id ? (state.diaries || []).find(function (d) { return d.id === diaryDraft.id; }) : null;
    var entry = {
      id: diaryDraft.id || uid('dy'),
      text: text,
      target: target,
      paperId: paper.id,
      free: diaryDraft.free != null ? !!diaryDraft.free : paper.snap === false,
      font: diaryDraft.font || 'serif',
      date: diaryDraft.date || todayISO(),
      remind: diaryDraft.remind !== false,
      at: (prev && prev.at) || new Date().toISOString()
    };
    state.diaries = state.diaries || [];
    var i = -1;
    for (var k = 0; k < state.diaries.length; k++) { if (state.diaries[k].id === entry.id) { i = k; break; } }
    if (i > -1) state.diaries[i] = entry; else state.diaries.unshift(entry);
    var who = state.people.find(function (p) { return p.id === target; });
    if (who) logActivity(who, 'Có một dòng nhật ký mới');
    state.settings.diaryPaperId = paper.id;
    save();
    diaryDraft = null;
    render();
    showToast(who ? 'Đã lưu vào nhật ký của ' + who.name : 'Đã lưu vào nhật ký của bạn');
  }

  /* Đo ảnh giấy vừa import để TỰ tìm đường kẻ ngang và lề dọc, nhờ vậy chữ khớp dòng
     ngay mà không phải kéo tay. Chỉ nhận kết quả khi tín hiệu đủ rõ (nhiều dòng, khoảng
     cách đều); ảnh giấy trơn/ảnh chụp lộn xộn thì trả null và giữ mặc định. */
  function detectPaperGrid(ctx, w, h) {
    var data;
    try { data = ctx.getImageData(0, 0, w, h).data; } catch (e) { return null; }
    var x0 = Math.floor(w * 0.18), x1 = Math.floor(w * 0.82);
    var y0 = Math.floor(h * 0.06), y1 = Math.floor(h * 0.94);
    var rowLum = new Float32Array(h);
    for (var y = y0; y < y1; y++) {
      var s = 0, n = 0, base = y * w * 4;
      for (var x = x0; x < x1; x += 3) {
        var i = base + x * 4;
        s += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114; n++;
      }
      rowLum[y] = s / n;
    }
    var sample = [];
    for (var yy = y0; yy < y1; yy++) sample.push(rowLum[yy]);
    sample.sort(function (a, b) { return a - b; });
    var med = sample[Math.floor(sample.length * 0.5)];

    function groupCenters(vals) {
      var out = [], cur = [];
      vals.forEach(function (v) {
        if (cur.length && v - cur[cur.length - 1] <= 2) cur.push(v);
        else { if (cur.length) out.push(cur); cur = [v]; }
      });
      if (cur.length) out.push(cur);
      return out.map(function (g) {
        var t = 0; g.forEach(function (v) { t += v; }); return t / g.length;
      });
    }

    var darkRows = [];
    for (var r = y0; r < y1; r++) if (rowLum[r] < med - 7) darkRows.push(r);
    var centers = groupCenters(darkRows);
    if (centers.length < 4) return null;

    var gaps = [];
    for (var k = 1; k < centers.length; k++) gaps.push(centers[k] - centers[k - 1]);
    var gsort = gaps.slice().sort(function (a, b) { return a - b; });
    var mg = gsort[Math.floor(gsort.length / 2)];
    if (!(mg > h * 0.015)) return null;
    var steady = gaps.filter(function (g) { return Math.abs(g - mg) <= mg * 0.3; }).length / gaps.length;
    if (steady < 0.6) return null;

    /* lề dọc: cột tối bất thường trong khoảng 4–35% bề rộng (đường kẻ lề của giấy) */
    var leftPct = null;
    var cx0 = Math.floor(w * 0.04), cx1 = Math.floor(w * 0.35);
    var colLum = new Float32Array(w);
    for (var cx = cx0; cx < cx1; cx++) {
      var s2 = 0, n2 = 0;
      for (var cy = y0; cy < y1; cy += 4) {
        var j = (cy * w + cx) * 4;
        s2 += data[j] * 0.299 + data[j + 1] * 0.587 + data[j + 2] * 0.114; n2++;
      }
      colLum[cx] = s2 / n2;
    }
    var best = null, bestDelta = 0;
    for (var c2 = cx0 + 2; c2 < cx1 - 2; c2++) {
      var neighbors = (colLum[c2 - 2] + colLum[c2 + 2]) / 2;
      var d = neighbors - colLum[c2];
      if (d > bestDelta) { bestDelta = d; best = c2; }
    }
    if (best && bestDelta > 9) leftPct = +((best / w) * 100 + 1.6).toFixed(2);

    return {
      gap: +((mg / w) * 100).toFixed(2),
      top: +((centers[0] / w) * 100).toFixed(2),
      left: leftPct,
      lines: centers.length
    };
  }


  /* Import ảnh làm mẫu giấy. Ảnh được thu nhỏ + nén JPEG để vừa localStorage.
     Hai ảnh import liên tiếp (một dọc, một ngang) trong vòng 3 phút sẽ được ghép
     vào CÙNG một mẫu giấy: bản ngang cho máy tính, bản dọc cho điện thoại. */
  var lastPaperImport = null;   // { id, at }
  function bindPaperImport() {
    var inp = document.getElementById('paperImportInput');
    if (!inp) return;
    inp.addEventListener('change', function () {
      var file = inp.files && inp.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) { showToast('Chọn một tệp ảnh nhé'); return; }
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var maxW = 1400;
          var scale = Math.min(1, maxW / img.width);
          var w = Math.max(1, Math.round(img.width * scale));
          var h = Math.max(1, Math.round(img.height * scale));
          var cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          var ctx = cv.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          var dataUrl = cv.toDataURL('image/jpeg', 0.82);
          var landscape = w >= h;
          /* Dò đường kẻ + lề của chính ảnh này để canh chữ ngay từ lần đầu */
          var grid = detectPaperGrid(ctx, w, h);

          state.papers = state.papers || [];
          var pair = lastPaperImport && (Date.now() - lastPaperImport.at < 180000)
            ? state.papers.find(function (p) { return p.id === lastPaperImport.id; }) : null;

          if (pair) {
            pair.img = pair.img || {};
            pair.img[landscape ? 'desktop' : 'mobile'] = dataUrl;
            pair.ar = (pair.ar && typeof pair.ar === 'object') ? pair.ar : {};
            pair.ar[landscape ? 'desktop' : 'mobile'] = +(w / h).toFixed(4);
            if (grid) {
              pair.gap = grid.gap;
              pair.top = grid.top;
              if (grid.left != null) pair.box = Object.assign({}, pair.box, { l: grid.left });
            }
            lastPaperImport = { id: pair.id, at: Date.now() };
            save();
            if (diaryDraft) { diaryDraft.paperId = pair.id; diaryDraft.free = null; }
            render();
            showToast((landscape ? 'Đã thêm bản ngang cho máy tính' : 'Đã thêm bản dọc cho điện thoại') +
              (grid ? ' · đã tự canh ' + grid.lines + ' dòng kẻ' : ''));
            return;
          }

          var paper = {
            id: uid('pp'),
            label: 'Giấy của tôi ' + (state.papers.length + 1),
            img: landscape ? { desktop: dataUrl } : { mobile: dataUrl },
            ar: (function () { var o = {}; o[landscape ? 'desktop' : 'mobile'] = +(w / h).toFixed(4); return o; })(),
            snap: true,
            box: { t: 6, r: 6, b: 6, l: (grid && grid.left != null) ? grid.left : 7 },
            top: grid ? grid.top : 8,
            gap: grid ? grid.gap : 5.2,
            size: grid ? Math.min(4.6, Math.max(2.6, +(grid.gap / 1.6).toFixed(2))) : 3.1,
            ink: '#3D342D'
          };
          var addLen = JSON.stringify(paper).length;
          var used = 0;
          try { used = (localStorage.getItem(STORAGE_KEY) || '').length; } catch (e) {}
          if (used + addLen > 4400000) { showToast('Bộ nhớ trình duyệt sắp đầy — xoá bớt bài hoặc ảnh cũ nhé'); return; }

          state.papers.push(paper);
          lastPaperImport = { id: paper.id, at: Date.now() };
          save();
          if (diaryDraft) { diaryDraft.paperId = paper.id; diaryDraft.free = null; }
          render();
          showToast(grid
            ? 'Đã thêm mẫu giấy — tự canh được ' + grid.lines + ' dòng kẻ'
            : 'Đã thêm mẫu giấy — chỉnh "Dòng" và "Lề trên" cho khớp đường kẻ');
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* Kéo thanh "Dòng" / "Lề trên" của mẫu giấy import: cập nhật trực tiếp, không render lại
     để không mất focus và không nháy trang. */
  function onGlobalInput(e) {
    var el = e.target;
    if (!el || !el.dataset || !diaryDraft) return;
    if (el.dataset.role !== 'paper-gap' && el.dataset.role !== 'paper-top') return;
    var p = (state.papers || []).find(function (x) { return x.id === diaryDraft.paperId; });
    if (!p) return;
    p[el.dataset.role === 'paper-gap' ? 'gap' : 'top'] = parseFloat(el.value) || p.gap;
    save();
    layoutPapers();
  }

  function onGlobalChange(e) {
    var el = e.target;
    if (!el || !el.dataset) return;
    /* Đầu tờ giấy + thanh công cụ của trang viết */
    if (diaryDraft) {
      if (el.dataset.role === 'diary-target') {
        syncDiaryText(); diaryDraft.target = el.value || 'me'; render(); return;
      }
      if (el.dataset.role === 'diary-font') {
        syncDiaryText(); diaryDraft.font = el.value; state.settings.diaryFont = el.value; save(); render(); return;
      }
      if (el.dataset.role === 'diary-date' || el.id === 'diaryDate') {
        if (el.value) { syncDiaryText(); diaryDraft.date = el.value; render(); }
        return;
      }
    }
    if (el.dataset.action === 'set-priority') {
      setRelationPriority(el.dataset.rel, el.value);
      render();
    }
    /* Bộ lọc dropdown + "nhắc trước" của khối Theo người */
    if (el.dataset.role === 'rm-rel') { rmRel = el.value || 'all'; render(); return; }
    if (el.dataset.role === 'rm-group') { rmGroup = el.value || 'all'; render(); return; }
    if (el.dataset.role === 'rm-lead') {
      var pLead = state.people.find(function (x) { return x.id === el.dataset.pid; });
      if (pLead) { setReminderLead(pLead, el.dataset.key || '', el.value); save(); }
      return;
    }
  }

  /* ---------------------------- init ---------------------------- */
  function init() {
    applyTheme();
    enforceTrial();
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq.addEventListener) mq.addEventListener('change', function () { if (state.settings.theme === 'system') applyTheme(); });
    }
    /* Link chia sẻ dạng /memory/invite/<token> (không dấu #) -> chuyển về route hash */
    var pm = /^\/memory\/invite\/([A-Za-z0-9_-]+)\/?$/.exec(location.pathname);
    if (pm) history.replaceState(null, '', '/#/memory/invite/' + pm[1]);
    if (!location.hash) location.hash = state.onboardingDone ? '#/home' : '#/onboarding';
    document.addEventListener('click', onGlobalClick);
    document.addEventListener('submit', onGlobalSubmit);
    document.addEventListener('change', onGlobalChange);
    document.addEventListener('input', onGlobalInput);
    /* Đổi kích thước cửa sổ: canh lại dòng ngay, và canh lại lần nữa ở frame kế tiếp vì
       một số trình duyệt cập nhật innerWidth SAU khi bắn sự kiện resize (đổi hướng giấy). */
    window.addEventListener('resize', function () {
      layoutPapers();
      requestAnimationFrame(function () { layoutPapers(); });
    });
    window.addEventListener('hashchange', function () {
      var m = /#\/reset\?token=([a-f0-9]{32,128})/.exec(location.hash);
      resetToken = m ? m[1] : resetToken;
      render();
    });
    render();
    /* loadState luôn đưa về onboarding nên không thể chờ cờ onboardingDone ở đây;
       hộp thư chỉ đọc, gọi sớm cũng không hại gì. */
    syncInbox(true);
    setInterval(function () { syncInbox(false); }, 60000);
    hydrateFromServer();
    api('/api/config').then(function (r) { appConfig = r; }).catch(function () { });
    var rm = /#\/reset\?token=([a-f0-9]{32,128})/.exec(location.hash);
    if (rm) { resetToken = rm[1]; render(); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
