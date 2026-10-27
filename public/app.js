/* =========================================================================
   Orbit — static SPA (no build step), localStorage-backed demo data.
   Pairs with D:\Orbit.v2 mockups (Lớp 0/1/2) and description.md.
   ========================================================================= */
(function () {
  'use strict';

  var STORAGE_KEY = 'orbit_state_v1';

  var ICONS = { birthday: '🎂', trip: '✈️', memory: '🍃', meeting: '👥', work: '🌱', workshop: '📖', custom: '📌' };
  var TONE = { birthday: 'tone-pink', trip: 'tone-blue', memory: 'tone-green', meeting: 'tone-purple', work: 'tone-orange', workshop: 'tone-blue', custom: 'tone-purple' };
  var TONE_DOT = { 'tone-pink': '#B5505E', 'tone-blue': '#3D63A8', 'tone-green': '#3E7A4C', 'tone-purple': '#6A50B0', 'tone-orange': '#B6702A' };
  var REL_LABEL = { family: 'Gia đình', friend: 'Bạn bè', coworker: 'Đồng nghiệp', other: 'Khác' };
  var AVATAR_COLORS = ['#E8A6B4', '#8CB4E0', '#8FCB9B', '#C6A6E8', '#F0B870', '#7FB8B0', '#E08C7D', '#9E9EDB'];
  var DOW = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'];

  var ONBOARD_SLIDES = [
    { art: '🌙🐾✨', title: 'Lưu những điều quan trọng', sub: 'Cho những người và khoảnh khắc bạn không muốn quên', primary: 'Bắt đầu', showSkip: true },
    { art: '📅💫', title: 'Không bỏ lỡ dịp nào', sub: 'Orbit nhắc bạn trước những ngày sinh nhật, kỷ niệm quan trọng', primary: 'Tiếp tục' },
    { art: '🌌👥', title: 'Giữ kết nối qua Orbit', sub: 'Sắp xếp người thân, bạn bè theo mức độ gắn bó của riêng bạn', primary: 'Tiếp tục' },
    { art: '✨🚀', title: 'Sẵn sàng bắt đầu?', sub: 'Thêm người đầu tiên của bạn và để Orbit lo phần còn lại', primary: 'Vào ứng dụng' }
  ];
  // NOTE: nội dung slide 2–4 là bản nháp (chưa có mockup gốc) — cần người dùng duyệt lại/thay thế.

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
      mkPerson('Hà', 'coworker', 3, false, mmddPlus(40), null, '', '')
    ];
    people[0].memories = [
      { id: uid('mm'), caption: 'Hoàng hôn', color: '#E8A6B4' },
      { id: uid('mm'), caption: 'Sóng biển', color: '#8CB4E0' },
      { id: uid('mm'), caption: 'Cà phê', color: '#8FCB9B' }
    ];

    var events = [
      mkEvent('Chuyến đi Đà Lạt', 'trip', isoPlus(30)),
      mkEvent('Họp nhóm', 'meeting', isoPlus(3)),
      mkEvent('Làm proposal', 'work', isoPlus(6)),
      mkEvent('Workshop kỹ năng', 'workshop', isoPlus(10)),
      mkEvent('Team building', 'meeting', isoPlus(18))
    ];
    events.push({ id: uid('ev'), title: 'Một kỷ niệm với Linh', type: 'memory', annMMDD: toMMDD(new Date()), personId: people[0].id });

    return {
      onboardingDone: false,
      onboardingSlide: 0,
      people: people,
      events: events,
      settings: { theme: 'system', aiEnabled: true, reminderDefaultTime: '09:00', profileName: 'Bạn' }
    };
  }
  function emptyState(keepSettings) {
    return {
      onboardingDone: true, onboardingSlide: 0, people: [], events: [],
      settings: keepSettings || { theme: 'system', aiEnabled: true, reminderDefaultTime: '09:00', profileName: 'Bạn' }
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
  var calMonthOffset = 0;
  var bannerDismissed = false;

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
    if (page === 'settings' && parts[1] === 'data') bindImportInput();
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
      '<div style="display:flex;width:100%;">' +
      '<aside class="sidebar">' +
        '<div class="sidebar-logo">✦ Orbit</div>' +
        '<nav class="sidebar-nav">' +
          navLink('home', '🏠', 'Home', active) +
          navLink('people', '👥', 'Mọi người', active) +
          navLink('calendar', '📅', 'Sự kiện', active) +
          navLink('settings', '⚙️', 'Cài đặt', active) +
        '</nav>' +
        '<div class="sidebar-illustration"><div style="font-size:48px;">🌙🐾</div>' +
          '<div class="slogan">&quot;Lưu những điều quan trọng với bạn ✨&quot;</div></div>' +
      '</aside>' +
      '<div class="shell-main">' +
        '<div class="topbar"><div class="logo">✦ Orbit</div>' +
          '<button class="bell" data-action="toast" data-msg="Chưa có thông báo mới">🔔</button></div>' +
        '<div class="view-root"><div class="view-inner">' + inner + '</div></div>' +
        '<nav class="bottom-nav">' +
          bottomItem('home', '🏠', 'Home', active) +
          bottomItem('people', '👥', 'Mọi người', active) +
          '<button class="fab" data-action="open-quickadd">+</button>' +
          bottomItem('calendar', '📅', 'Sự kiện', active) +
          bottomItem('settings', '⚙️', 'Cài đặt', active) +
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
          list.push({ id: ev.id, title: ev.title, icon: ICONS.memory, tone: TONE.memory, daysAway: 0, special: 'ngày này năm ngoái', kind: 'memory', personId: ev.personId });
        }
        return;
      }
      if (!ev.date) return;
      var daysAway = daysBetween(today, ev.date);
      if (daysAway >= 0 && daysAway <= windowDays) {
        list.push({ id: ev.id, title: ev.title, icon: ICONS[ev.type] || ICONS.custom, tone: TONE[ev.type] || TONE.custom, daysAway: daysAway, kind: ev.type });
      }
    });
    list.sort(function (a, b) { return a.daysAway - b.daysAway; });
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
      return { icon: '✉️', text: 'Thử nhắn tin chúc mừng sinh nhật ' + (person ? person.name : '') + ' nhé!', href: person ? '#/people/' + person.id : '#/home' };
    }
    var noNote = state.people.find(function (p) { return !p.notes; });
    if (noNote) return { icon: '📝', text: 'Ghi lại vài điều bạn nhớ về ' + noNote.name, href: '#/people/' + noNote.id };
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
      if (occasions.length) windowNote = '(trong 180 ngày tới)';
    }
    var hasOccasions = occasions.length > 0;
    var withoutBday = state.people.filter(function (p) { return !p.birthday; });

    var occBlock;
    if (hasOccasions) {
      occBlock =
        '<div class="section-head"><h2>60 ngày tới</h2><button class="link-more" data-action="open-all-upcoming">Xem tất cả ›</button></div>' +
        '<div class="hscroll">' +
        occasions.slice(0, 3).map(function (o) {
          return '<a class="occasion-card ' + o.tone + '" href="' + (o.personId ? '#/people/' + o.personId : '#/calendar') + '">' +
            '<div class="ic">' + o.icon + '</div><div><div class="t">' + esc(o.title) + '</div><div class="s">' + occasionSubtitle(o) + ' ' + windowNote + '</div></div></a>';
        }).join('') + '</div>';
    } else if (withoutBday.length > 0) {
      occBlock =
        '<h2 style="margin:var(--space-5) 0 4px;">60 ngày tới</h2>' +
        '<p class="muted">' + withoutBday.length + ' người bạn chưa lưu ngày sinh.</p>' +
        '<div class="hscroll">' + withoutBday.slice(0, 5).map(function (p) {
          return '<a class="occasion-card tone-purple" href="#/people/' + p.id + '"><div class="ic">🎂</div><div><div class="t">' + esc(p.name) + '</div><div class="s">Thêm ngày sinh</div></div></a>';
        }).join('') + '</div>';
    } else {
      occBlock =
        '<h2 style="margin:var(--space-5) 0 4px;">60 ngày tới</h2>' +
        '<p class="muted">' + (state.people.length === 0 ? 'Thêm người đầu tiên để bắt đầu.' : 'Không có dịp nào sắp tới trong 180 ngày.') + '</p>';
    }

    var suggestion = buildSuggestion();

    return (
      '<div class="hero"><div class="hero-text"><div class="date">' + dateLabel + '</div><h1>Chào bạn ⭐</h1>' +
      '<p>Những người bạn yêu thương luôn ở gần đây ✨</p></div><div class="hero-illustration">🌙🐾</div></div>' +
      occBlock +
      (suggestion ?
        '<div class="section-head"><h2>Gợi ý hôm nay</h2></div>' +
        '<a class="card suggest-card" href="' + suggestion.href + '"><div class="ic-wrap">' + suggestion.icon + '</div>' +
        '<div class="txt">' + esc(suggestion.text) + '</div><div class="chev">›</div></a>' : '')
    );
  }

  function openAllUpcomingModal() {
    var occ = getOccasions(180);
    openModal(
      '<div class="modal-sheet"><div class="modal-head"><h3>Tất cả dịp sắp tới</h3><button data-action="close-modal">✕</button></div>' +
      (occ.length ? occ.map(function (o) {
        return '<div class="suggest-card card" style="margin-bottom:8px;"><div class="ic-wrap" style="background:transparent;font-size:20px;">' + o.icon + '</div>' +
          '<div class="txt">' + esc(o.title) + '<br><span class="muted" style="font-weight:400;">' + occasionSubtitle(o) + '</span></div></div>';
      }).join('') : '<p class="muted">Không có dịp nào trong 180 ngày tới.</p>') +
      '</div>'
    );
  }

  /* ---------------------------- People / Orbit ---------------------------- */
  function pillBtn(key, label) { return '<button class="pill ' + (peopleFilter === key ? 'active' : '') + '" data-action="set-filter" data-filter="' + key + '">' + label + '</button>'; }

  function renderOrbit(people) {
    var groups = { 1: [], 2: [], 3: [] };
    people.forEach(function (p) { (groups[p.closeness] || groups[3]).push(p); });
    var ringPct = { 1: 38, 2: 64, 3: 90 };
    var ringsHtml =
      '<div class="orbit-ring" style="width:' + ringPct[1] + '%;height:' + ringPct[1] + '%;"></div>' +
      '<div class="orbit-ring" style="width:' + ringPct[2] + '%;height:' + ringPct[2] + '%;"></div>' +
      '<div class="orbit-ring" style="width:' + ringPct[3] + '%;height:' + ringPct[3] + '%;"></div>';
    var avatarsHtml = '';
    [1, 2, 3].forEach(function (ring) {
      var list = groups[ring];
      var radiusPct = ringPct[ring] / 2;
      list.forEach(function (p, i) {
        var angle = (i / (list.length || 1)) * 2 * Math.PI + ring * 0.6;
        var left = 50 + radiusPct * Math.cos(angle);
        var top = 50 + radiusPct * Math.sin(angle);
        avatarsHtml += '<button class="orbit-avatar" data-action="nav" data-to="people/' + p.id + '" style="left:' + left.toFixed(1) + '%;top:' + top.toFixed(1) + '%;background:' + avatarColor(p.id) + ';" title="' + esc(p.name) + '">' +
          initials(p.name) + (p.favorite ? '<span class="fav-dot">⭐</span>' : '') + '<span class="name-tag">' + esc(p.name) + '</span></button>';
      });
    });
    return '<div class="orbit-wrap"><div class="orbit-stage">' + ringsHtml + '<div class="orbit-center" title="Bạn">🙂</div>' + avatarsHtml + '</div></div>';
  }

  function renderPeopleGrid(list) {
    if (!list.length) return '<div class="empty-state"><div class="big">🌙</div>Chưa có ai trong nhóm này.</div>';
    var html = '<div class="people-grid">';
    list.forEach(function (p) {
      html += '<a class="person-chip" href="#/people/' + p.id + '"><div class="avatar" style="background:' + avatarColor(p.id) + '">' + initials(p.name) + '</div>' +
        (p.favorite ? '<span class="fav">⭐</span>' : '') + '<div class="pname">' + esc(p.name) + '</div></a>';
    });
    html += '<a class="person-chip add-new" href="#" data-action="open-add-person"><div class="avatar">+</div><div class="pname">Thêm người</div></a></div>';
    return html;
  }

  function renderPeople() {
    var filtered = state.people.filter(function (p) { return peopleFilter === 'all' ? true : p.relationship === peopleFilter; });
    var body = peopleViewMode === 'orbit' ? renderOrbit(filtered)
      : peopleViewMode === 'favorite' ? renderPeopleGrid(filtered.filter(function (p) { return p.favorite; }))
      : renderPeopleGrid(filtered);
    return (
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">' +
      '<h1 class="page-title" style="margin:0;">Mọi người</h1>' +
      '<div style="display:flex;gap:8px;"><button class="btn-icon" data-action="toast" data-msg="Tìm kiếm — demo">🔍</button>' +
      '<button class="btn-icon" data-action="open-add-person">➕</button></div></div>' +
      '<div class="view-switch" style="margin-top:12px;">' +
      '<button class="' + (peopleViewMode === 'orbit' ? 'active' : '') + '" data-action="set-view-mode" data-mode="orbit">🌌 Orbit</button>' +
      '<button class="' + (peopleViewMode === 'list' ? 'active' : '') + '" data-action="set-view-mode" data-mode="list">☰ Danh sách</button>' +
      '<button class="' + (peopleViewMode === 'favorite' ? 'active' : '') + '" data-action="set-view-mode" data-mode="favorite">♡ Yêu thích</button></div>' +
      '<div class="filter-pills">' + pillBtn('all', 'Tất cả') + pillBtn('family', 'Gia đình') + pillBtn('friend', 'Bạn bè') + pillBtn('coworker', 'Đồng nghiệp') + '</div>' +
      body
    );
  }

  /* ---------------------------- Person detail ---------------------------- */
  function relDurationLabel(p) {
    var relLabel = REL_LABEL[p.relationship] || 'Khác';
    if (p.since) { var years = new Date().getFullYear() - p.since; if (years > 0) return relLabel + ' • ' + years + ' năm'; }
    return relLabel;
  }

  function renderPersonDetail(id) {
    var p = state.people.find(function (x) { return x.id === id; });
    if (!p) return '<p>Không tìm thấy người này.</p><a class="btn btn-ghost" href="#/people">‹ Quay lại</a>';
    var color = avatarColor(p.id);
    var mems = p.memories || [];
    var memTiles = mems.slice(0, 3).map(function (m) { return '<div class="memory-tile" style="background:' + m.color + ';">' + esc(m.caption) + '</div>'; }).join('');
    var extra = mems.length > 3
      ? '<div class="memory-tile" style="background:#999;"><div class="more-badge">+' + (mems.length - 3) + '</div></div>'
      : '<div class="memory-tile add" data-action="add-memory" data-id="' + p.id + '">+</div>';

    return (
      '<div class="detail-cover"><button data-action="nav" data-to="people">‹</button><button data-action="toast" data-msg="Thêm tuỳ chọn — demo">⋯</button></div>' +
      '<div class="detail-profile"><div class="avatar" style="background:' + color + ';">' + initials(p.name) + '</div>' +
      '<h2>' + esc(p.name) + (p.favorite ? ' ⭐' : '') + '</h2><div class="meta">' + relDurationLabel(p) + '</div></div>' +
      '<div class="quick-actions">' +
      '<button class="tone-pink" data-action="quick-birthday" data-id="' + p.id + '" title="Sinh nhật">🎂</button>' +
      '<button class="tone-purple" data-action="toggle-favorite" data-id="' + p.id + '" title="Yêu thích">' + (p.favorite ? '💖' : '🤍') + '</button>' +
      '<button class="tone-blue" data-action="quick-note-focus" title="Ghi chú">📖</button>' +
      '<button class="tone-green" data-action="add-memory" data-id="' + p.id + '" title="Thêm kỷ niệm">✈️</button></div>' +
      (p.quote ? '<div class="quote-box">' + esc(p.quote) + '</div>' : '') +
      '<div class="detail-grid"><div>' +
      '<div class="section-head" style="margin-top:0;"><h2>Kỷ niệm</h2><button class="link-more" data-action="add-memory" data-id="' + p.id + '">+ Thêm</button></div>' +
      '<div class="memory-grid">' + memTiles + extra + '</div>' +
      '<div class="section-head"><h2>Ghi chú</h2></div>' +
      '<textarea id="notes-area" style="width:100%;min-height:90px;padding:12px;border-radius:var(--radius-m);border:1px solid var(--border);background:var(--cream);color:var(--ink);font-size:var(--text-base);" placeholder="Viết điều bạn nhớ về ' + esc(p.name) + '...">' + esc(p.notes) + '</textarea>' +
      '<div class="section-head"><h2>Hoạt động</h2></div>' +
      '<div class="card" style="padding:12px 16px;">' +
      ((p.activity || []).slice().reverse().slice(0, 6).map(function (a) {
        return '<div class="activity-item"><div class="dot"></div><div>' + esc(a.text) + '<div class="when">' + timeAgo(a.at) + '</div></div></div>';
      }).join('') || '<p class="muted">Chưa có hoạt động.</p>') +
      '</div></div><div>' +
      '<div class="card quickinfo-card">' +
      '<div class="quickinfo-row"><span class="ic">🎂</span> Sinh nhật <b>' + (p.birthday ? formatMMDD(p.birthday) : 'Chưa có') + '</b></div>' +
      '<div class="quickinfo-row"><span class="ic">❤️</span> Mức độ <b>' + (p.closeness === 1 ? 'Thân nhất' : p.closeness === 2 ? 'Thân' : 'Quen biết') + '</b></div>' +
      '<div class="quickinfo-row"><span class="ic">🏷️</span> Nhóm <b>' + REL_LABEL[p.relationship] + '</b></div></div>' +
      '<div class="section-head" style="margin-top:0;"><h2>Nhắc nhở</h2></div>' +
      '<div class="card reminders-card">' +
      ((p.reminders || []).map(function (r) {
        return '<div class="reminder-row"><div class="t">' + esc(r.label) + '<span>' + (r.mmdd ? formatMMDD(r.mmdd) : (r.date || '')) + '</span></div>' +
          '<button class="toggle ' + (r.enabled ? 'on' : '') + '" data-action="toggle-reminder" data-pid="' + p.id + '" data-rid="' + r.id + '"></button></div>';
      }).join('') || '<p class="muted">Chưa có nhắc nhở.</p>') +
      '<button class="btn btn-text" data-action="add-reminder-inline" data-pid="' + p.id + '" style="margin-top:8px;">+ Thêm nhắc nhở</button></div>' +
      '<button class="btn btn-danger btn-block" data-action="delete-person" data-id="' + p.id + '">Xoá liên hệ</button>' +
      '</div></div>'
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
    state.people.forEach(function (p) { if (p.birthday === mmdd) out.push({ title: 'Sinh nhật ' + p.name, icon: ICONS.birthday, tone: TONE.birthday }); });
    state.events.forEach(function (ev) {
      if (ev.type === 'memory') { if (ev.annMMDD === mmdd) out.push({ title: ev.title, icon: ICONS.memory, tone: TONE.memory }); return; }
      if (ev.date === iso) out.push({ title: ev.title, icon: ICONS[ev.type] || ICONS.custom, tone: TONE[ev.type] || TONE.custom });
    });
    return out;
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
      cellsHtml += '<div class="cal-cell ' + (outside ? 'outside' : '') + ' ' + (isToday ? 'today' : '') + '" data-action="open-add-event" data-date="' + iso + '">' +
        '<span class="daynum">' + cellDate.getDate() + '</span>' +
        '<div class="cal-tags-desktop">' + dayEvents.slice(0, 2).map(function (e) { return '<div class="cal-tag ' + e.tone + '">' + e.icon + ' ' + esc(e.title) + '</div>'; }).join('') + '</div>' +
        '<div class="cal-dots">' + dayEvents.slice(0, 3).map(function (e) { return '<span class="cal-dot" style="background:' + dotColor(e.tone) + '"></span>'; }).join('') + '</div>' +
        '</div>';
    }

    var upcoming = getOccasions(14);
    var featured = !bannerDismissed && upcoming[0];

    return (
      '<h1 class="page-title">Sự kiện</h1>' +
      (featured ? '<div class="cal-banner"><div style="font-size:20px;">' + featured.icon + '</div><div class="txt"><b>' + esc(featured.title) + '</b><span>' + occasionSubtitle(featured) + '</span></div><button class="x" data-action="dismiss-banner">✕</button></div>' : '') +
      '<div class="cal-header"><div class="cal-nav"><button class="btn-icon" data-action="cal-prev">‹</button>' +
      '<div class="cal-month-label">' + monthLabel + '</div><button class="btn-icon" data-action="cal-next">›</button></div>' +
      '<div style="display:flex;gap:8px;"><button class="btn btn-ghost" data-action="cal-today">Hôm nay</button>' +
      '<button class="btn-icon" data-action="open-add-event" data-date="' + todayIso + '">➕</button></div></div>' +
      '<div class="cal-grid">' + DOW.map(function (d) { return '<div class="cal-dow">' + d + '</div>'; }).join('') + cellsHtml + '</div>'
    );
  }

  /* ---------------------------- Settings ---------------------------- */
  function settingsRow(key, icon, tone, title, sub) {
    return '<a class="settings-row card" href="#/settings/' + key + '"><div class="ic-wrap ' + tone + '">' + icon + '</div>' +
      '<div class="t"><b>' + title + '</b><span>' + sub + '</span></div><div class="chev">›</div></a>';
  }
  function renderSettings() {
    return '<h1 class="page-title">Cài đặt</h1><div class="settings-list">' +
      settingsRow('reminders', '🔔', 'tone-pink', 'Nhắc nhở', 'Kênh, thời gian, nội dung') +
      settingsRow('appearance', '🌙', 'tone-purple', 'Chế độ hiển thị', 'Sáng / Tối / Tự động') +
      settingsRow('ai', '✨', 'tone-orange', 'Tính năng AI', 'Bật / Tắt, gợi ý cá nhân hoá') +
      settingsRow('data', '☁️', 'tone-green', 'Xuất / Xoá dữ liệu', 'Sao lưu và quản lý dữ liệu') +
      settingsRow('account', '👤', 'tone-blue', 'Tài khoản', 'Thông tin cá nhân, bảo mật') +
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
      '<div class="onboard-wrap"><div class="onboard-top"><div class="onboard-logo">✦ Orbit</div>' +
      '<div class="onboard-art">' + s.art + '</div><h1 class="onboard-title">' + s.title + '</h1>' +
      '<p class="onboard-sub">' + s.sub + '</p>' +
      (isDraft ? '<div class="gap-note" style="max-width:320px;margin:12px auto 0;">Nội dung slide này là bản nháp — chưa có mockup gốc, cần bạn duyệt lại.</div>' : '') +
      '</div><div class="onboard-bottom">' +
      '<button class="btn btn-primary btn-block" data-action="' + (i < ONBOARD_SLIDES.length - 1 ? 'onboard-next' : 'onboard-finish') + '">' + s.primary + ' →</button>' +
      (s.showSkip ? '<button class="onboard-skip" data-action="contacts-import">Nhập danh bạ</button>' : '') +
      '<div class="onboard-dots">' + ONBOARD_SLIDES.map(function (_, idx) { return '<span class="d ' + (idx === i ? 'on' : '') + '" data-action="onboard-dot" data-i="' + idx + '"></span>'; }).join('') + '</div>' +
      '</div></div>'
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
      '<button class="btn btn-ghost btn-block" data-action="open-add-person">👥 Thêm người mới</button>' +
      '<button class="btn btn-ghost btn-block" data-action="open-add-event">📅 Thêm sự kiện mới</button>' +
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
      '<option value="coworker">Đồng nghiệp</option><option value="other">Khác</option></select></div>' +
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
      '<div class="field"><label>Loại</label><select name="type">' +
      '<option value="meeting">Họp / gặp mặt</option><option value="trip">Chuyến đi</option>' +
      '<option value="work">Công việc</option><option value="workshop">Workshop</option><option value="custom">Khác</option></select></div>' +
      '<div class="field"><label>Ngày</label><input type="date" name="date" value="' + (dateIso || todayISO()) + '" required></div>' +
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
      case 'nav': navigate(t.dataset.to); break;
      case 'open-quickadd': openQuickAddModal(); break;
      case 'open-add-person': openAddPersonModal(); break;
      case 'open-add-event': openAddEventModal(t.dataset.date || ''); break;
      case 'close-modal': closeModal(); break;
      case 'toast': showToast(t.dataset.msg || ''); break;
      case 'set-view-mode': peopleViewMode = t.dataset.mode; render(); break;
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
