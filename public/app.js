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
  var REL_LABEL = { family: 'Gia đình', soulmate: 'Tri kỉ', closefriend: 'Bạn thân', friend: 'Bạn', coworker: 'Đồng nghiệp', other: 'Khác' };
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
  function mkPerson(name, rel, closeness, favorite, birthdayMMDD, sinceYear, quote, notes) {
    return {
      id: uid('p'), name: name, relationship: rel, closeness: closeness, favorite: !!favorite,
      birthday: birthdayMMDD || '', since: sinceYear || null, quote: quote || '', notes: notes || '',
      memories: [], favoriteTag: false,
      reminders: birthdayMMDD ? [{ id: uid('rm'), label: 'Sinh nhật', mmdd: birthdayMMDD, enabled: true }] : [],
      activity: [{ id: uid('ac'), text: 'Đã thêm vào Orbit', at: new Date().toISOString() }]
    };
  }
  function mkEvent(title, type, date) { return { id: uid('ev'), title: title, type: type, date: date, location: '' }; }

  function seedState() {
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
      settings: { theme: 'light', aiEnabled: true, reminderDefaultTime: '09:00', profileName: 'Bạn' }
    };
  }
  function emptyState(keepSettings) {
    return {
      onboardingDone: true, onboardingSlide: 0, people: [], events: [],
      settings: keepSettings || { theme: 'light', aiEnabled: true, reminderDefaultTime: '09:00', profileName: 'Bạn' }
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
  var peopleFilter = 'all';
  var peopleQuery = '';
  var orbitCollapsed = true; // true = contact drawer closed, orbit stays visible
  var orbitMotionPaused = false;
  var orbitView = { scale: 1.05, x: 0, y: 0 }; // mở đầu chỉ thấy vòng 1-4, vòng 5-6 nằm ngoài khung
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
  function resetOrbitView() { orbitView = { scale: 1.05, x: 0, y: 0 }; applyOrbitView(); }
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
      var ring = Math.min(5, Math.max(1, Math.round(Math.hypot(e.clientX - (b.left + b.width / 2), e.clientY - (b.top + b.height / 2)) / (b.width / 2) * 5.2)));
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
    else if (page === 'calendar') inner = renderCalendar();
    else if (page === 'settings') inner = parts[1] ? renderSettingsSub(parts[1]) : renderSettings();
    else inner = renderHome();

    document.getElementById('app').innerHTML = shell(inner, page);
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
    if (!orbitFocus) { orbitView = { scale: 1.05, x: 0, y: 0 }; applyOrbitView(); return; }
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
  function navLink(key, icon, label, active) {
    return '<a class="sidebar-link ' + (active === key ? 'active' : '') + '" href="#/' + key + '"><span class="ic">' + icon + '</span>' + label + '</a>';
  }
  function bottomItem(key, icon, label, active) {
    return '<a class="nav-item ' + (active === key ? 'active' : '') + '" href="#/' + key + '"><span class="ic">' + icon + '</span>' + label + '</a>';
  }
  function shell(inner, active) {
    return (
      '<div class="app-shell shell-' + active + '" style="display:flex;width:100%;">' +
      '<aside class="sidebar">' +
        (active === 'people' ? '<div class="sidebar-hero-card"><img class="sidebar-hero" src="assets/sidebar-girl-cloud.png" alt="" aria-hidden="true"></div>' : '') +
        '<div class="sidebar-logo">✦ Orbit</div>' +
        '<nav class="sidebar-nav">' +
          navLink('home', ic('home', 22), 'Home', active) +
          navLink('people', ic('people', 22), 'Mọi người', active) +
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
          bottomItem('people', ic('people', 22), 'Mọi người', active) +
          '<button class="fab" data-action="open-quickadd">' + ic('plus', 54) + '</button>' +
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

      '<section class="home-section">' +
      '<div class="home-section-head"><h2>60 ngày tới</h2>' +
      '<button class="link-more" data-action="open-all-upcoming">Xem tất cả ›</button></div>' +
      occBody + '</section>' +

      (suggestion ?
        '<section class="home-section"><div class="home-section-head"><h2>Gợi ý hôm nay</h2></div>' +
        '<a class="suggest-card" href="' + suggestion.href + '"><div class="ic-wrap">' + ic(suggestion.icon, 28) + '</div>' +
        '<div class="txt">' + esc(suggestion.text) + '</div><div class="chev">›</div></a></section>' : '')
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
  function pillBtn(key, label) { return '<button class="pill ' + (peopleFilter === key ? 'active' : '') + '" data-action="set-filter" data-filter="' + key + '">' + label + '</button>'; }

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

  // Sức chứa từng vòng: 8, 10, 14, 20, 28 (mỗi vòng cộng thêm 2 so với mức tăng trước)
  var RING_CAP = [8, 10, 14, 20, 28, 38];
  var RING_PCT = [24, 39, 54, 69, 84, 99];
  // Vòng tự động: gia đình -> 1-2, người yêu/bạn thân -> 2-3, còn lại -> 4+
  function autoRingFor(p) {
    if (p.ring) return Math.min(6, Math.max(1, Number(p.ring)));
    // Gia đình -> 1-2; Tri kỉ -> 3-4; Bạn thân -> 4-5; Bạn & còn lại -> vòng 5-6 đổ ra
    if (p.relationship === 'family') return p.closeness === 1 ? 1 : 2;
    if (p.relationship === 'soulmate') return 3;
    if (p.relationship === 'closefriend') return 4;
    if (p.relationship === 'friend') return 6;
    return 6;
  }
  function renderOrbit(people) {
    var rings = [[], [], [], [], [], []];
    people.forEach(function (p) {
      var idx = autoRingFor(p) - 1;
      // vòng đầy thì đẩy ra vòng ngoài kế tiếp
      while (idx < 5 && rings[idx].length >= RING_CAP[idx]) idx++;
      rings[idx].push(p);
    });
    var scene = '';
    rings.forEach(function (list, r) {
      var diameter = RING_PCT[r], period = 90 + r * 40;
      scene += '<div class="orbit-ring" data-ring="' + (r + 1) + '" style="width:' + diameter + '%;height:' + diameter + '%"></div>';
      list.forEach(function (p, i) {
        var delay = -(i / Math.max(list.length, 1) + r * 0.11) * period;
        scene += '<div class="orbit-track" style="width:' + diameter + '%;height:' + diameter + '%;--period:' + period + 's;--phase:' + delay + 's">' +
          '<button class="orbit-avatar orbit-traveler' + (orbitFocus === p.id ? ' focused' : '') + '" data-action="focus-person" data-pid="' + esc(p.id) + '" style="' + avatarStyle(p) + '" aria-label="Chọn ' + esc(p.name) + '">' +
          '<span class="av-wrap">' + avatarInner(p) + '</span>' + (p.favorite ? '<span class="fav-dot">★</span>' : '') + '<span class="name-tag">' + esc(p.name) + '</span></button></div>';
      });
      ['#DFA8B9', '#B5CBB3', '#E8C076', '#A9BFD9'].forEach(function (color, i) {
        var delay = -(i / 4 + r * 0.17) * period;
        scene += '<div aria-hidden="true" class="orbit-track orbit-dust-track" style="width:' + diameter + '%;height:' + diameter + '%;--period:' + period + 's;--phase:' + delay + 's">' +
          '<i class="orbit-dust" style="background:' + color + ';width:' + (5 + i * 2) + 'px;height:' + (5 + i * 2) + 'px"></i></div>';
      });
    });
    return '<div class="orbit-wrap"><div class="orbit-viewport' + (orbitMotionPaused ? ' motion-paused' : '') + '" id="orbitViewport" aria-label="Bản đồ mối quan hệ, kéo để di chuyển, cuộn để phóng to">' +
      '<div class="orbit-pan" id="orbitPan"><div class="orbit-stage">' + scene +
      '<div class="orbit-center" title="Bạn"><img class="av-img" src="assets/avatars/av-01.png" alt="Bạn"></div></div></div>' +
      '<div class="orbit-zoom"><button data-action="orbit-zoom" data-dz="1" aria-label="Phóng to">+</button>' +
      '<button data-action="orbit-zoom" data-dz="-1" aria-label="Thu nhỏ">−</button>' +
      '<button data-action="orbit-reset" aria-label="Về toàn cảnh" title="Về toàn cảnh">⊙</button>' +
      '<button data-action="orbit-motion" aria-label="Tạm dừng chuyển động" aria-pressed="' + orbitMotionPaused + '">' + (orbitMotionPaused ? '▷' : 'Ⅱ') + '</button></div>' +
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
    for (var i = 1; i <= 6; i++) {
      chips += '<button class="ring-chip' + (p.ring === i ? ' on' : '') + '" data-action="move-person" data-pid="' + esc(p.id) + '" data-ring="' + i + '">Vòng ' + i + '</button>';
    }
    return '<div class="orbit-focus-card" role="dialog" aria-label="Thông tin ' + esc(p.name) + '">' +
      '<div class="fc-head"><span class="fc-av" style="' + avatarStyle(p) + '">' + avatarInner(p) + '</span>' +
      '<div class="fc-title"><b>' + esc(p.name) + '</b><span>' + esc(REL_LABEL[p.relationship] || 'Khác') + '</span></div>' +
      '<button class="fc-close" data-action="close-focus" aria-label="Đóng">✕</button></div>' +
      '<div class="fc-facts">' +
      '<div class="fc-fact"><span>Mối quan hệ</span><b>' + esc(REL_LABEL[p.relationship] || 'Khác') + '</b></div>' +
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
    var split = document.querySelector('.people-split');
    if (!split) return;
    split.classList.toggle('contacts-collapsed', orbitCollapsed);
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
      b.textContent = orbitMotionPaused ? '▷' : 'Ⅱ';
      b.setAttribute('aria-pressed', String(orbitMotionPaused));
      b.setAttribute('aria-label', orbitMotionPaused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động');
    });
  }
  function renderPeople() {
    ensureContactAvatars();
    var filtered = state.people.filter(function (p) { return peopleFilter === 'all' || p.relationship === peopleFilter; });
    var listed = searchPeople(peopleViewMode === 'favorite' ? filtered.filter(function (p) { return p.favorite; }) : filtered);
    return '<div class="people-head"><h1 class="page-title" style="margin:0">Mọi người</h1>' +
      '<button class="btn-add-round" data-action="open-add-person" aria-label="Thêm người">+</button></div>' +
      '<div class="people-split' + (orbitCollapsed ? ' contacts-collapsed' : '') + '">' +
      '<section class="people-orbit-col">' + renderOrbit(filtered) + '</section>' +
      '<button class="contacts-tab" data-action="toggle-orbit" aria-controls="contactsPanel" aria-expanded="' + !orbitCollapsed + '">' +
      '<span>' + (orbitCollapsed ? 'Danh bạ' : 'Thu gọn') + '</span><i aria-hidden="true">' + (orbitCollapsed ? '‹' : '›') + '</i></button>' +
      '<section class="people-list-col" id="contactsPanel" aria-label="Danh sách liên lạc">' +
      '<div class="contacts-panel-head"><b>Liên lạc <span>' + listed.length + '</span></b></div>' +
      '<label class="search-pill"><span aria-hidden="true">⌕</span>' +
      '<input id="peopleSearch" type="search" aria-label="Tìm người" placeholder="Tìm người…" value="' + esc(peopleQuery) + '"></label>' +
      '<div class="filter-pills">' + pillBtn('all', 'Tất cả') + pillBtn('family', 'Gia đình') + pillBtn('friend', 'Bạn bè') + pillBtn('coworker', 'Đồng nghiệp') +
      '<button class="pill ' + (peopleViewMode === 'favorite' ? 'active' : '') + '" data-action="set-view-mode" data-mode="' + (peopleViewMode === 'favorite' ? 'list' : 'favorite') + '">★ Yêu thích</button></div>' +
      renderPeopleGrid(listed) + '</section></div>';
  }

  function relDurationLabel(p) {
    var bits = [];
    if (p.relationship && REL_LABEL[p.relationship]) bits.push(REL_LABEL[p.relationship]);
    if (p.since) {
      var years = new Date().getFullYear() - Number(p.since);
      if (years > 0) bits.push('bên nhau ' + years + ' năm');
    } else {
      bits.push(p.closeness === 1 ? 'Thân nhất' : p.closeness === 2 ? 'Thân' : 'Quen biết');
    }
    return bits.join(' · ');
  }

  function renderPersonDetail(id) {
    var p = state.people.find(function (x) { return x.id === id; });
    if (!p) return '<p>Không tìm thấy người này.</p><a class="btn btn-ghost" href="#/people">‹ Quay lại</a>';
    var mems = p.memories || [];
    var memTiles = mems.slice(0, 3).map(function (m) { return '<div class="memory-tile" style="background:' + m.color + ';">' + esc(m.caption) + '</div>'; }).join('');
    var extra = mems.length > 3
      ? '<div class="memory-tile" style="background:#999;"><div class="more-badge">+' + (mems.length - 3) + '</div></div>'
      : '<div class="memory-tile add" data-action="add-memory" data-id="' + p.id + '">+</div>';

    // Cột "Mọi người" bên trái như mockup
    var peopleCol = state.people.map(function (q) {
      return '<a class="pd-person' + (q.id === p.id ? ' on' : '') + '" href="#/people/' + q.id + '">' +
        '<span class="avatar" style="' + avatarStyle(q) + '">' + avatarInner(q) + '</span>' +
        '<span class="pd-name"><b>' + esc(q.name) + '</b><em>' + esc(REL_LABEL[q.relationship] || 'Khác') + '</em></span>' +
        (q.favorite ? '<span class="pd-fav">★</span>' : '') + '</a>';
    }).join('');

    return (
      '<div class="pd-layout">' +
      '<aside class="pd-side">' +
      '<div class="pd-side-head"><h2>Mọi người</h2><span class="pd-count">' + state.people.length + '</span></div>' +
      '<div class="pd-list">' + peopleCol + '</div>' +
      '<a class="pd-add" href="#" data-action="open-add-person">＋ Thêm người</a>' +
      '</aside>' +

      '<div class="pd-main">' +
      '<div class="pd-cover">' +
      '<button class="pd-back" data-action="nav" data-to="people" aria-label="Quay lại">‹</button>' +
      '<button class="pd-more" data-action="toast" data-msg="Thêm tuỳ chọn — demo" aria-label="Tuỳ chọn">⋯</button>' +
      '<span class="pd-cover-star s1">✦</span><span class="pd-cover-star s2">✧</span><span class="pd-cover-star s3">✦</span>' +
      '</div>' +

      '<div class="pd-head">' +
      '<button class="avatar avatar-edit pd-avatar" data-action="open-avatar-picker" data-id="' + p.id + '" style="' + avatarStyle(p) + '" title="Đổi ảnh đại diện">' +
      avatarInner(p) + '<span class="edit-badge">✎</span></button>' +
      '<div class="pd-title"><h2>' + esc(p.name) + (p.favorite ? ' <span class="pd-star">★</span>' : '') + '</h2>' +
      '<div class="meta">' + relDurationLabel(p) + '</div></div>' +
      '<div class="quick-actions">' +
      '<button class="tone-pink" data-action="quick-birthday" data-id="' + p.id + '" title="Sinh nhật">' + ic('cake', 22) + '</button>' +
      '<button class="tone-purple" data-action="toggle-favorite" data-id="' + p.id + '" title="Yêu thích">' + (p.favorite ? '💖' : '🤍') + '</button>' +
      '<button class="tone-blue" data-action="quick-note-focus" title="Ghi chú">' + ic('leaf', 22) + '</button>' +
      '<button class="tone-green" data-action="add-memory" data-id="' + p.id + '" title="Thêm kỷ niệm">' + ic('plane', 22) + '</button>' +
      '</div></div>' +

      (p.quote ? '<div class="quote-box">' + esc(p.quote) + '</div>' : '') +

      '<div class="pd-grid">' +
      '<div class="pd-col">' +
      '<section class="card pd-card">' +
      '<div class="section-head" style="margin:0 0 12px;"><h2>Kỷ niệm</h2><button class="link-more" data-action="add-memory" data-id="' + p.id + '">+ Thêm</button></div>' +
      '<div class="memory-grid">' + memTiles + extra + '</div></section>' +

      '<section class="card pd-card">' +
      '<div class="section-head" style="margin:0 0 10px;"><h2>Ghi chú</h2></div>' +
      '<textarea id="notes-area" placeholder="Viết điều bạn nhớ về ' + esc(p.name) + '...">' + esc(p.notes) + '</textarea></section>' +

      '<section class="card pd-card">' +
      '<div class="section-head" style="margin:0 0 10px;"><h2>Hoạt động gần đây</h2></div>' +
      ((p.activity || []).slice().reverse().slice(0, 6).map(function (a) {
        return '<div class="activity-item"><div class="dot"></div><div>' + esc(a.text) + '<div class="when">' + timeAgo(a.at) + '</div></div></div>';
      }).join('') || '<p class="muted" style="margin:0;">Chưa có hoạt động.</p>') +
      '</section></div>' +

      '<div class="pd-col">' +
      '<section class="card pd-card">' +
      '<div class="section-head" style="margin:0 0 12px;"><h2>Thông tin nhanh</h2></div>' +
      '<div class="quickinfo-row"><span class="ic">' + ic('cake', 18) + '</span> Sinh nhật <b>' + (p.birthday ? formatMMDD(p.birthday) : 'Chưa có') + '</b></div>' +
      '<div class="quickinfo-row"><span class="ic">❤️</span> Mức độ <b>' + (p.closeness === 1 ? 'Thân nhất' : p.closeness === 2 ? 'Thân' : 'Quen biết') + '</b></div>' +
      '<div class="quickinfo-row"><span class="ic">🏷️</span> Nhóm <b>' + (REL_LABEL[p.relationship] || 'Khác') + '</b></div>' +
      '</section>' +

      '<section class="card pd-card">' +
      '<div class="section-head" style="margin:0 0 10px;"><h2>Nhắc nhở</h2></div>' +
      ((p.reminders || []).map(function (r) {
        return '<div class="reminder-row"><div class="t">' + esc(r.label) + '<span>' + (r.mmdd ? formatMMDD(r.mmdd) : (r.date || '')) + '</span></div>' +
          '<button class="toggle ' + (r.enabled ? 'on' : '') + '" data-action="toggle-reminder" data-pid="' + p.id + '" data-rid="' + r.id + '"></button></div>';
      }).join('') || '<p class="muted" style="margin:0;">Chưa có nhắc nhở.</p>') +
      '<button class="btn btn-text" data-action="add-reminder-inline" data-pid="' + p.id + '" style="margin-top:8px;">+ Thêm nhắc nhở</button>' +
      '</section>' +
      '<button class="btn btn-danger btn-block" data-action="delete-person" data-id="' + p.id + '">Xoá liên hệ</button>' +
      '</div></div></div></div>'
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
      settingsRow('data', ic('envelope', 24), 'tone-green', 'Xuất / Xoá dữ liệu', 'Sao lưu và quản lý dữ liệu') +
      settingsRow('account', ic('avatar', 26), 'tone-blue', 'Tài khoản', 'Thông tin cá nhân, bảo mật') +
      '</div>';
  }
  function backBtn() { return '<button class="subpage-back" data-action="nav" data-to="settings">‹ Cài đặt</button>'; }

  function renderSettingsSub(key) {
    if (key === 'appearance') return subAppearance();
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
  function finishOnboarding() { state.onboardingDone = true; save(); navigate('home'); }
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
    openModal(
      '<div class="modal-sheet"><div class="modal-head"><h3>Thêm người mới</h3><button data-action="close-modal">✕</button></div>' +
      '<form id="form-add-person">' +
      '<div class="field"><label>Tên</label><input type="text" name="name" required placeholder="Vd: Hoa"></div>' +
      '<div class="field"><label>Mối quan hệ</label><select name="relationship">' +
      '<option value="family">Gia đình</option><option value="friend" selected>Bạn bè</option>' +
      '<option value="coworker">Đồng nghiệp</option><option value="soulmate">Tri kỉ</option><option value="closefriend">Bạn thân</option><option value="friend">Bạn</option><option value="coworker">Đồng nghiệp</option><option value="other">Khác</option></select></div>' +
      '<div class="field"><label>Mức độ thân thiết</label><select name="closeness">' +
      '<option value="1">Thân nhất</option><option value="2" selected>Thân</option><option value="3">Quen biết</option></select></div>' +
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
      case 'open-event': openEventDetail(t.dataset.date, Number(t.dataset.idx)); break;
      case 'toggle-strip-more': calStripMore = !calStripMore; render(); break;
      case 'focus-person':
        if (orbitJustDragged) { orbitJustDragged = false; break; }
        orbitFocus = t.dataset.pid; movePickerOpen = false; render(); break;
      case 'close-focus': orbitFocus = null; movePickerOpen = false; stopFocusFollow(); render(); break;
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
      case 'orbit-reset':
        orbitFocus = null; movePickerOpen = false; stopFocusFollow();
        orbitView = { scale: 1.05, x: 0, y: 0 }; applyOrbitView(); render(); break;
      case 'open-avatar-picker': openAvatarPicker(t.dataset.id); break;
      case 'pick-avatar': setPersonAvatar(t.dataset.id, t.dataset.av); break;
      case 'clear-avatar': clearPersonAvatar(t.dataset.id); break;
      case 'set-filter': peopleFilter = t.dataset.filter; render(); break;
      case 'toggle-favorite': toggleFavorite(t.dataset.id); break;
      case 'delete-person': if (confirm('Xoá liên hệ này?')) deletePerson(t.dataset.id); break;
      case 'toggle-reminder': toggleReminder(t.dataset.pid, t.dataset.rid); break;
      case 'add-reminder-inline': openInlineReminderForm(t.dataset.pid); break;
      case 'quick-birthday': quickActionBirthday(t.dataset.id); break;
      case 'quick-note-focus': var ta = document.getElementById('notes-area'); if (ta) ta.focus(); break;
      case 'add-memory': addMemoryPrompt(t.dataset.id); break;
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
      case 'contacts-import': tryContactsImport(); break;
      case 'onboard-next': onboardNext(); break;
      case 'onboard-dot': state.onboardingSlide = Number(t.dataset.i); save(); render(); break;
      case 'onboard-finish': finishOnboarding(); break;
      case 'save-profile-name': saveProfileName(); break;
    }
  }
  function onGlobalSubmit(e) {
    var form = e.target;
    if (form.id === 'form-add-person') {
      e.preventDefault();
      var fd = new FormData(form);
      var name = (fd.get('name') || '').trim();
      if (!name) return;
      var birthdayRaw = fd.get('birthday');
      var birthday = birthdayRaw ? toMMDD(new Date(birthdayRaw + 'T00:00:00')) : '';
      var p = mkPerson(name, fd.get('relationship'), Number(fd.get('closeness')), false, birthday, null, '', '');
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

  /* ---------------------------- init ---------------------------- */
  function init() {
    applyTheme();
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq.addEventListener) mq.addEventListener('change', function () { if (state.settings.theme === 'system') applyTheme(); });
    }
    if (!location.hash) location.hash = state.onboardingDone ? '#/home' : '#/onboarding';
    document.addEventListener('click', onGlobalClick);
    document.addEventListener('submit', onGlobalSubmit);
    window.addEventListener('hashchange', render);
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
