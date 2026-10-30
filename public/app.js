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
      relationPriority: JSON.parse(JSON.stringify(DEFAULT_PRIORITY)), groups: [],
      homeOccasions: true, homeSuggest: true, homeSuggestHidden: false
    };
  }
  var AVATAR_COLORS = ['#E8A6B4', '#8CB4E0', '#8FCB9B', '#C6A6E8', '#F0B870', '#7FB8B0', '#E08C7D', '#9E9EDB'];
  var DOW = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'];

  var ONBOARD_SLIDES = [
    { title: 'Lưu giữ những điều ta trân trọng', sub: 'Cho những khoảnh khắc không muốn phải quên đi', primary: 'Bắt đầu', showSkip: true },
    { title: 'Không bỏ lỡ dịp nào', sub: 'Orbit nhắc bạn trước những ngày sinh nhật, kỷ niệm quan trọng', primary: 'Tiếp tục' },
    { title: 'Giữ kết nối qua Orbit', sub: 'Sắp xếp người thân, bạn bè theo mức độ gắn bó của riêng bạn', primary: 'Tiếp tục' },
    { title: 'Sẵn sàng bắt đầu?', sub: 'Thêm người đầu tiên của bạn và để Orbit lo phần còn lại', primary: 'Vào ứng dụng' }
  ];
  // NOTE: slide 1 dùng đúng nội dung + material đã cấp; slide 2–4 vẫn là bản nháp (chưa có mockup/material riêng) — cần duyệt lại.

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
      onboardingDone: true, onboardingSlide: 0, people: [], events: [],
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
        parsed.onboardingDone = false;
        parsed.onboardingSlide = 0;
        // Thiết kế gốc là giao diện SÁNG. Theme 'system' khiến máy đang dark-mode
        // hiển thị nền đen, lệch hẳn mockup -> migrate sang 'light'; chỉ tối khi user tự chọn.
        if (parsed.settings && parsed.settings.theme === 'system') parsed.settings.theme = 'light';
        if (!parsed.settings) parsed.settings = defaultSettings();
        var st = parsed.settings;
        if (!st.relationPriority) st.relationPriority = JSON.parse(JSON.stringify(DEFAULT_PRIORITY));
        if (!Array.isArray(st.groups)) st.groups = [];
        if (typeof st.homeOccasions !== 'boolean') st.homeOccasions = true;
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
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function logActivity(p, text) {
    p.activity = p.activity || [];
    p.activity.push({ id: uid('ac'), text: text, at: new Date().toISOString() });
    if (p.activity.length > 30) p.activity.shift();
  }

  /* ---------------------------- theme ---------------------------- */
  function applyTheme() {
    var mode = state.settings.theme;
    var effective = mode;
    if (mode === 'system') {
      effective = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    if (effective === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }
  function setTheme(val) { state.settings.theme = val; save(); applyTheme(); render(); }
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
  var pdTab = 'all';        // tab đang chọn ở trang cá nhân
  var pdTabFor = null;      // hồ sơ đang xem, đổi người thì reset về Tổng
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
    if (page === 'home') inner = renderHome();
    else if (page === 'people') inner = parts[1] ? renderPersonDetail(parts[1]) : renderPeople();
    else if (page === 'me') inner = renderMe();
    else if (page === 'diary') inner = renderDiary();
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
      if (daysAway <= windowDays) list.push({ id: 'bday-' + p.id, title: 'Sinh nhật ' + p.name, icon: ICONS.birthday, tone: TONE.birthday, daysAway: daysAway, personId: p.id, kind: 'birthday' });
    });
    state.events.forEach(function (ev) {
      if (ev.type === 'memory' && ev.annMMDD) {
        if (ev.annMMDD === todayMMDD) {
          list.push({ id: ev.id, title: ev.title, icon: ICONS.memory, tone: TONE.memory, daysAway: 0, special: 'Ngày này năm ngoái', kind: 'memory', personId: ev.personId });
        }
        return;
      }
      if (!ev.date) return;
      var daysAway = daysBetween(today, ev.date);
      if (daysAway >= 0 && daysAway <= windowDays) {
        list.push({ id: ev.id, title: ev.title, icon: ICONS[ev.type] || ICONS.custom, tone: TONE[ev.type] || TONE.custom, daysAway: daysAway, kind: ev.type });
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
    if (o.special) return o.special;
    if (o.daysAway === 0) return 'Hôm nay';
    if (o.daysAway === 1) return 'Ngày mai';
    return 'Sau ' + o.daysAway + ' ngày';
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
  function renderHome() {
    var today = new Date();
    var dateLabel = cap(today.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }));
    var occasions = getOccasions(60);
    var windowNote = '';
    if (!occasions.length) {
      occasions = getOccasions(180);
      if (occasions.length) windowNote = ' (trong 180 ngày tới)';
    }
    var hasOccasions = occasions.length > 0;
    var withoutBday = state.people.filter(function (p) { return !p.birthday; });

    var occBody;
    if (hasOccasions) {
      occBody = '<div class="occasion-row">' + occasions.slice(0, 3).map(function (o) {
        return '<a class="occasion-card cloud ' + o.tone + '" href="' + (o.personId ? '#/people/' + o.personId : '#/calendar') + '" style="--cloud-img:url(assets/clouds/' + cloudImg(o.tone) + ')">' +
          '<div class="ic">' + evIcon(o.kind, 56) + '</div><div class="t">' + esc(o.title) + '</div>' +
          '<div class="s">' + occasionSubtitle(o) + windowNote + '</div></a>';
      }).join('') + '</div>';
    } else if (withoutBday.length > 0) {
      occBody = '<p class="muted" style="margin:0 0 12px;font-size:13px;">' + withoutBday.length + ' người bạn chưa lưu ngày sinh.</p>' +
        '<div class="occasion-row">' + withoutBday.slice(0, 3).map(function (p) {
          return '<a class="occasion-card cloud tone-purple" href="#/people/' + p.id + '" style="--cloud-img:url(assets/clouds/' + cloudImg('tone-purple') + ')"><div class="ic">' + evIcon('birthday', 56) + '</div>' +
            '<div class="t">' + esc(p.name) + '</div><div class="s">Thêm ngày sinh</div></a>';
        }).join('') + '</div>';
    } else {
      occBody = '<p class="muted" style="margin:0;font-size:13px;">' +
        (state.people.length === 0 ? 'Thêm người đầu tiên để bắt đầu.' : 'Không có dịp nào sắp tới trong 180 ngày.') + '</p>';
    }

    var suggestion = buildSuggestion();
    var initial = (state.settings.profileName || 'B').trim().charAt(0).toUpperCase();

    return (
      '<div class="home-hero">' +
      '<button class="home-bell home-bell-float" data-action="toast" data-msg="Chưa có thông báo mới">' + ic('bell', 26) + '</button>' +
      '<div class="home-hero-text"><div class="date">' + dateLabel + '</div>' +
      '<h1>Chào bạn ' + ic('sun', 26) + '</h1>' +
      '<p class="sub">Những người bạn yêu thương luôn ở gần đây ✨</p></div>' +
      '<div class="home-hero-art"></div>' +
      '</div>' +

      /* Mỗi khối trên trang chủ bật/tắt được trong Cài đặt -> Trang chủ */
      (state.settings.homeOccasions === false ? '' :
        '<section class="home-section">' +
        '<div class="home-section-head"><h2>60 ngày tới</h2>' +
        '<button class="link-more" data-action="open-all-upcoming">Xem tất cả ›</button></div>' +
        occBody + '</section>') +

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
     chọn từ bộ element (p.avatar = 'av-07'), cuối cùng mới fallback chữ cái. */
  var AVATAR_COUNT = 26;
  function avatarInner(p, size) {
    if (p.photo) return '<img class="av-img" src="' + esc(p.photo) + '" alt="">';
    if (p.avatar) return '<img class="av-img" src="assets/avatars/' + esc(p.avatar) + '.png" alt="">';
    return initials(p.name);
  }
  function avatarStyle(p) {
    return (p.photo || p.avatar) ? 'background:transparent;' : 'background:' + avatarColor(p.id) + ';';
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
    var peopleCol = state.people.map(function (q) {
      return '<a class="pd-person' + (q.id === p.id ? ' on' : '') + '" href="#/people/' + q.id + '">' +
        '<span class="avatar" style="' + avatarStyle(q) + '">' + avatarInner(q) + '</span>' +
        '<span class="pd-name"><b>' + esc(q.name) + '</b><em>' + esc(REL_LABEL[q.relationship] || 'Khác') + '</em></span>' +
        (q.favorite ? '<span class="pd-fav">★</span>' : '') + '</a>';
    }).join('');

    var cover = p.cover ? esc(p.cover) : 'assets/cover-default-wide.jpg';
    var coverTall = p.coverTall ? esc(p.coverTall) : 'assets/cover-default-tall.jpg';

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
      '<div class="pd-cover" style="--pd-cover:url(\'' + cover + '\');--pd-cover-tall:url(\'' + coverTall + '\')">' +
      '<button class="pd-back" data-action="nav" data-to="people" aria-label="Quay lại">‹</button>' +
      '<button class="pd-more" data-action="toast" data-msg="Thêm tuỳ chọn — demo" aria-label="Tuỳ chọn">⋯</button>' +
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
          return '<p class="muted feed-empty">Những dòng nhật ký về ' + esc(p.name) + ' sẽ hiện ở đây khi tính năng này được bật.</p>';
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

  function renderMe() {
    var name = state.settings.profileName || 'Bạn';
    var stats = connectionStats();
    var msgs = receivedMessages();
    var groups = state.settings.groups || [];
    var upcoming = getOccasions(30).length;
    var initial = name.trim().charAt(0).toUpperCase() || 'B';

    var rows = REL_TYPES.map(function (r) {
      var n = stats.counts[r.k] || 0;
      if (!n) return '';
      return '<div class="me-rel"><span class="stats-dot" style="background:' + ringColor(r.k) + '"></span>' +
        '<span>' + r.label + '</span><b>' + n + '</b></div>';
    }).join('');

    return '<div class="me-page">' +
      '<div class="me-cover"></div>' +
      '<div class="me-head">' +
      '<div class="me-avatar"><img src="assets/avatars/av-01.png" alt=""></div>' +
      '<div class="me-id"><h1>' + esc(name) + '</h1>' +
      '<p>Trang cá nhân của bạn · ' + state.people.length + ' người trong quỹ đạo</p></div>' +
      '<div class="me-actions">' +
      '<button class="btn btn-ghost" data-action="edit-me-name">Đổi tên hiển thị</button>' +
      '<button class="btn btn-primary" data-action="nav" data-to="settings">Cài đặt</button>' +
      '</div></div>' +

      '<div class="me-stats">' +
      '<div class="me-stat"><b>' + stats.total + '</b><span>Liên kết</span></div>' +
      '<div class="me-stat"><b>' + stats.groups + '</b><span>Nhóm</span></div>' +
      '<div class="me-stat"><b>' + msgs.length + '</b><span>Lời nhắn đã nhận</span></div>' +
      '<div class="me-stat"><b>' + upcoming + '</b><span>Dịp trong 30 ngày</span></div>' +
      '</div>' +

      '<div class="me-grid">' +
      '<section class="pd-block"><div class="section-head"><h2>Quỹ đạo của bạn</h2></div>' +
      (rows ? '<div class="me-rel-list">' + rows + '</div>' : '<p class="muted" style="margin:0;">Chưa có liên kết nào. Thêm người đầu tiên nhé.</p>') +
      '<a class="me-link" href="#/people">Xem bản đồ quỹ đạo ›</a></section>' +

      '<section class="pd-block"><div class="section-head"><h2>Lời nhắn đã nhận</h2>' +
      '<span class="count-chip">' + msgs.length + '</span></div>' +
      (msgs.length ? msgs.slice(0, 5).map(function (x) {
        return '<a class="me-msg" href="#/people/' + x.p.id + '"><img src="' + (x.m.images && x.m.images[0] ? x.m.images[0] : 'assets/avatars/av-01.png') + '" alt="">' +
          '<div class="t"><b>' + esc(x.p.name) + '</b><span>' + esc((x.m.caption || '').slice(0, 80)) + '</span></div>' +
          '<time>' + (x.m.at ? timeAgo(x.m.at) : '') + '</time></a>';
      }).join('') : '<p class="muted" style="margin:0;">Chưa nhận lời nhắn nào. Mời ai đó gửi kỷ niệm từ trang hồ sơ của họ.</p>') +
      '</section>' +

      '<section class="pd-block"><div class="section-head"><h2>Nhóm của bạn</h2>' +
      '<button class="link-more" data-action="nav" data-to="settings/groups">Quản lý</button></div>' +
      (groups.length ? groups.map(function (g) {
        var n = state.people.filter(function (p) { return (p.groups || []).indexOf(g.id) > -1; }).length;
        return '<div class="me-group"><span>' + esc(g.name) + '</span><b>' + n + '</b></div>';
      }).join('') : '<p class="muted" style="margin:0;">Chưa có nhóm nào.</p>') +
      '</section>' +
      '</div></div>';
  }

  /* Nhật ký: lớp nền là trang bìa sổ tay (đã tách nền); lớp giấy viết nhật ký sẽ thêm sau */
  function renderDiary() {
    return '<h1 class="page-title">Nhật ký</h1>' +
      '<div class="diary-stage">' +
      '<div class="diary-cover">' +
      '<img class="cover-img cover-desktop" src="assets/diary/cover-desktop-cut.png" alt="Bìa sổ nhật ký">' +
      '<img class="cover-img cover-mobile" src="assets/diary/cover-mobile-cut.png" alt="Bìa sổ nhật ký">' +
      '</div>' +
      '</div>';
  }

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
    if (body) { opts.headers['content-type'] = 'application/json'; opts.body = JSON.stringify(body); }
    return fetch(path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, data: j }; });
    });
  }

  var inviteShare = null;   // { token, url, personId, expiresAt }

  function openInviteModal(pid) {
    var p = state.people.find(function (x) { return x.id === pid; });
    if (!p) return;
    var ident = ownerIdentity();
    openModal('<div class="modal-sheet invite-sheet"><div class="modal-head"><h3>Mời gửi kỷ niệm</h3>' +
      '<button data-action="close-modal">✕</button></div><div class="invite-loading">Đang tạo link…</div></div>');
    apiCall('/api/invite', 'POST', {
      ownerId: ident.id, ownerSecret: ident.secret,
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
    var ident = ownerIdentity();
    var now = Date.now();
    if (!force && now - inboxSyncAt < 45000) return Promise.resolve();
    inboxSyncAt = now;
    return apiCall('/api/inbox?owner=' + encodeURIComponent(ident.id) + '&secret=' + encodeURIComponent(ident.secret))
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
      { ownerId: ident.id, ownerSecret: ident.secret, hidden: true }).then(function (res) {
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
      apiCall('/api/invite/' + encodeURIComponent(token), 'POST', { content: content, images: picked })
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
  function renderSettings() {
    return '<h1 class="page-title">Cài đặt</h1><div class="settings-list">' +
      settingsRow('reminders', ic('bell', 24), 'tone-pink', 'Nhắc nhở', 'Kênh, thời gian, nội dung') +
      settingsRow('appearance', ic('sun', 24), 'tone-purple', 'Chế độ hiển thị', 'Sáng / Tối / Tự động') +
      settingsRow('ai', ic('sun', 24), 'tone-orange', 'Tính năng AI', 'Bật / Tắt, gợi ý cá nhân hoá') +
      settingsRow('home', ic('home', 22), 'tone-peach', 'Trang chủ', 'Bật/tắt các khối trên trang chủ') +
      settingsRow('orbit', ic('calendar', 24), 'tone-purple', 'Quỹ đạo', 'Mức ưu tiên xếp vòng theo mối quan hệ') +
      settingsRow('groups', ic('people', 24), 'tone-mint', 'Nhóm', 'Tự tạo nhóm để lọc và sắp xếp') +
      settingsRow('data', ic('envelope', 24), 'tone-green', 'Xuất / Xoá dữ liệu', 'Sao lưu và quản lý dữ liệu') +
      settingsRow('account', ic('avatar', 26), 'tone-blue', 'Tài khoản', 'Thông tin cá nhân, bảo mật') +
      '</div>';
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
    return backBtn() + '<h1 class="page-title">Trang chủ</h1>' +
      row('calendar', 'tone-purple', 'Khối "60 ngày tới"', 'Ba tấm mây tóm tắt dịp sắp tới', 'toggle-home-occasions', occ) +
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
  function subReminders() {
    var rows = [];
    state.people.forEach(function (p) { (p.reminders || []).forEach(function (r) { rows.push({ r: r, personId: p.id, personName: p.name }); }); });
    return backBtn() + '<h1 class="page-title">Nhắc nhở</h1>' +
      '<p class="muted" style="margin-bottom:12px;">Giờ nhắc mặc định: ' + state.settings.reminderDefaultTime + '</p>' +
      '<div class="card" style="padding:0 16px;">' +
      (rows.length ? rows.map(function (row) {
        var r = row.r;
        return '<div class="reminder-row"><div class="t"><a href="#/people/' + row.personId + '">' + esc(row.personName) + '</a> — ' + esc(r.label) + '<span>' + (r.mmdd ? formatMMDD(r.mmdd) : (r.date || '')) + '</span></div>' +
          '<button class="toggle ' + (r.enabled ? 'on' : '') + '" data-action="toggle-reminder" data-pid="' + row.personId + '" data-rid="' + r.id + '"></button></div>';
      }).join('') : '<p class="muted" style="padding:16px 0;">Chưa có nhắc nhở nào.</p>') +
      '</div><div class="gap-note">⚠️ Nhắc nhở ở đây chỉ lưu trong máy — bản demo web chưa gửi push notification/email thật. Muốn nhắc nhở thật cần backend + dịch vụ thông báo (web push, email, hoặc app di động).</div>';
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
    return backBtn() + '<h1 class="page-title">Tài khoản</h1>' +
      '<div class="field"><label>Tên hiển thị</label><input type="text" id="profile-name-input" value="' + esc(state.settings.profileName) + '"></div>' +
      '<button class="btn btn-primary" data-action="save-profile-name">Lưu</button>' +
      '<div class="gap-note" style="margin-top:16px;">⚠️ Chưa có đăng nhập/đồng bộ thật. Đây là hồ sơ lưu cục bộ trên thiết bị. Muốn đăng nhập (email, Google...) và đồng bộ nhiều máy cần dựng backend auth thật (vd Supabase Auth) — cần bạn cung cấp project &amp; khoá API khi muốn triển khai.</div>';
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
  function renderOnboarding() {
    var i = state.onboardingSlide || 0;
    var s = ONBOARD_SLIDES[i];
    var isDraft = i > 0;
    return (
      '<div class="onboard-wrap"><div class="onboard-content">' +
      '<div class="onboard-top">' +
      '<div class="onboard-logo-badge"><img src="assets/logo-orbit.png" alt="Orbit"></div>' +
      '<h1 class="onboard-title">' + s.title + '</h1>' +
      '<p class="onboard-sub">' + s.sub + '</p>' +
      (isDraft ? '<div class="gap-note" style="max-width:320px;margin:12px auto 0;background:rgba(255,255,255,.9);">Nội dung slide này là bản nháp — chưa có mockup/material riêng, cần bạn duyệt lại.</div>' : '') +
      '</div><div class="onboard-art-band"></div><div class="onboard-bottom">' +
      '<button class="btn btn-primary btn-block" data-action="' + (i < ONBOARD_SLIDES.length - 1 ? 'onboard-next' : 'onboard-finish') + '">' + s.primary + ' →</button>' +
      (s.showSkip ? '<button class="onboard-skip" data-action="contacts-import">Nhập danh bạ</button>' : '') +
      '<div class="onboard-dots">' + ONBOARD_SLIDES.map(function (_, idx) { return '<span class="d ' + (idx === i ? 'on' : '') + '" data-action="onboard-dot" data-i="' + idx + '"></span>'; }).join('') + '</div>' +
      '</div></div></div>'
    );
  }
  function onboardNext() { state.onboardingSlide = Math.min((state.onboardingSlide || 0) + 1, ONBOARD_SLIDES.length - 1); save(); render(); }
  function finishOnboarding() { state.onboardingDone = true; save(); navigate('home'); syncInbox(true); }
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
    var t = e.target.closest && e.target.closest('[data-action]');
    if (!t) return;
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
      case 'pick-avatar': setPersonAvatar(t.dataset.id, t.dataset.av); break;
      case 'clear-avatar': clearPersonAvatar(t.dataset.id); break;
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
      case 'add-reminder-inline': openInlineReminderForm(t.dataset.pid); break;
      case 'quick-birthday': quickActionBirthday(t.dataset.id); break;
      case 'quick-note-focus': var ta = document.getElementById('notes-area'); if (ta) ta.focus(); break;
      case 'add-memory': addMemoryPrompt(t.dataset.id); break;
      case 'invite-memory': openInviteModal(t.dataset.id); break;
      case 'pd-tab': pdTab = t.dataset.tab || 'all'; render(); break;
      case 'hide-home-suggest': state.settings.homeSuggestHidden = true; save(); render(); showToast('Đã ẩn gợi ý — bật lại trong Cài đặt'); break;
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
          var ident = ownerIdentity();
          apiCall('/api/invite/' + encodeURIComponent(inviteShare.token) + '/revoke', 'POST',
            { ownerId: ident.id, ownerSecret: ident.secret }).then(function (res) {
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
      case 'toggle-ai': toggleAI(); break;
      case 'export-data': exportData(); break;
      case 'import-data': var inp = document.getElementById('import-file-input'); if (inp) inp.click(); break;
      case 'wipe-data': wipeData(); break;
      case 'wipe-people': wipePeople(); break;
      case 'contacts-import': tryContactsImport(); break;
      case 'onboard-next': onboardNext(); break;
      case 'onboard-dot': state.onboardingSlide = Number(t.dataset.i); save(); render(); break;
      case 'onboard-finish': finishOnboarding(); break;
      case 'save-profile-name': saveProfileName(); break;
    }
  }
  function onGlobalSubmit(e) {
    var form = e.target;
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
      state.people.push(p); save(); closeModal(); showToast('Đã thêm ' + name); navigate('people');
    } else if (form.id === 'form-add-event') {
      e.preventDefault();
      var fd2 = new FormData(form);
      var title = (fd2.get('title') || '').trim();
      if (!title) return;
      var ev = mkEvent(title, fd2.get('type'), fd2.get('date'));
      ev.location = fd2.get('location') || '';
      ev.time = fd2.get('time') || '';
      state.events.push(ev); save(); closeModal(); showToast('Đã thêm sự kiện'); render();
    }
  }

  function onGlobalChange(e) {
    var el = e.target;
    if (!el || !el.dataset) return;
    if (el.dataset.action === 'set-priority') {
      setRelationPriority(el.dataset.rel, el.value);
      render();
    }
  }

  /* ---------------------------- init ---------------------------- */
  function init() {
    applyTheme();
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
    window.addEventListener('hashchange', render);
    render();
    /* loadState luôn đưa về onboarding nên không thể chờ cờ onboardingDone ở đây;
       hộp thư chỉ đọc, gọi sớm cũng không hại gì. */
    syncInbox(true);
    setInterval(function () { syncInbox(false); }, 60000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
