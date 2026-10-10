/* =========================================================
   AssetTrack - script.js
   A working asset monitoring and maintenance reporting app.
   Everything is saved in this browser (localStorage), so no
   server or database is needed to try it out.
   ========================================================= */
(function () {
'use strict';

/* ---------------------------------------------------------
   1. QR CODE GENERATOR (built in, works offline)
   Byte mode, error correction M, versions 1 to 6.
   --------------------------------------------------------- */
var QR = (function () {
    var EC = { 1: [10, [[1, 16]]], 2: [16, [[1, 28]]], 3: [26, [[1, 44]]], 4: [18, [[2, 32]]], 5: [24, [[2, 43]]], 6: [16, [[4, 27]]] };
    var ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34] };
    function mul(x, y) { var z = 0; for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z & 255; }
    function divisor(deg) {
        var r = [], i, j, root = 1;
        for (i = 0; i < deg; i++) r.push(0);
        r[deg - 1] = 1;
        for (i = 0; i < deg; i++) { for (j = 0; j < deg; j++) { r[j] = mul(r[j], root); if (j + 1 < deg) r[j] ^= r[j + 1]; } root = mul(root, 2); }
        return r;
    }
    function remainder(data, div) {
        var r = div.map(function () { return 0; });
        data.forEach(function (b) { var f = b ^ r.shift(); r.push(0); div.forEach(function (c, i) { r[i] ^= mul(c, f); }); });
        return r;
    }
    function utf8(s) { return Array.prototype.slice.call(unescape(encodeURIComponent(s))).map(function (c) { return c.charCodeAt(0); }); }
    function bit(x, i) { return (x >>> i) & 1; }
    function make(text) {
        var bytes = utf8(text), v, ecLen, groups, cap;
        for (v = 1; v <= 6; v++) {
            ecLen = EC[v][0]; groups = EC[v][1];
            cap = groups.reduce(function (a, g) { return a + g[0] * g[1]; }, 0);
            if (bytes.length + 2 <= cap) break;
        }
        if (v > 6) throw new Error('QR text too long');
        var bits = [];
        function put(val, n) { for (var i = n - 1; i >= 0; i--) bits.push(bit(val, i)); }
        put(4, 4); put(bytes.length, 8); bytes.forEach(function (b) { put(b, 8); });
        put(0, Math.min(4, cap * 8 - bits.length));
        while (bits.length % 8) bits.push(0);
        var data = [], i, k;
        for (i = 0; i < bits.length; i += 8) { var n = 0; for (k = 0; k < 8; k++) n = n * 2 + bits[i + k]; data.push(n); }
        for (var pad = 0xEC; data.length < cap; pad ^= 0xEC ^ 0x11) data.push(pad);
        var blocks = [], pos = 0, div = divisor(ecLen);
        groups.forEach(function (g) { for (var b = 0; b < g[0]; b++) { var d = data.slice(pos, pos + g[1]); pos += g[1]; blocks.push({ d: d, e: remainder(d, div) }); } });
        var out = [], maxLen = Math.max.apply(null, blocks.map(function (b) { return b.d.length; }));
        for (i = 0; i < maxLen; i++) blocks.forEach(function (b) { if (i < b.d.length) out.push(b.d[i]); });
        for (i = 0; i < ecLen; i++) blocks.forEach(function (b) { out.push(b.e[i]); });
        var size = 17 + 4 * v, mod = [], fn = [], y, x;
        for (y = 0; y < size; y++) { mod.push([]); fn.push([]); for (x = 0; x < size; x++) { mod[y].push(false); fn[y].push(false); } }
        function setF(x, y, d) { if (x >= 0 && y >= 0 && x < size && y < size) { mod[y][x] = d; fn[y][x] = true; } }
        for (i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
        [[3, 3], [size - 4, 3], [3, size - 4]].forEach(function (c) {
            for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) { var d = Math.max(Math.abs(dx), Math.abs(dy)); setF(c[0] + dx, c[1] + dy, d !== 2 && d !== 4); }
        });
        var al = ALIGN[v];
        al.forEach(function (a, ia) { al.forEach(function (b, ib) {
            if ((ia === 0 && ib === 0) || (ia === 0 && ib === al.length - 1) || (ia === al.length - 1 && ib === 0)) return;
            for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) setF(a + dx, b + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }); });
        function format(mask) {
            var d = mask, r = d, i2;
            for (i2 = 0; i2 < 10; i2++) r = (r << 1) ^ ((r >>> 9) * 0x537);
            var bs = ((d << 10) | r) ^ 0x5412;
            for (i2 = 0; i2 <= 5; i2++) setF(8, i2, bit(bs, i2) === 1);
            setF(8, 7, bit(bs, 6) === 1); setF(8, 8, bit(bs, 7) === 1); setF(7, 8, bit(bs, 8) === 1);
            for (i2 = 9; i2 < 15; i2++) setF(14 - i2, 8, bit(bs, i2) === 1);
            for (i2 = 0; i2 < 8; i2++) setF(size - 1 - i2, 8, bit(bs, i2) === 1);
            for (i2 = 8; i2 < 15; i2++) setF(8, size - 15 + i2, bit(bs, i2) === 1);
            setF(8, size - 8, true);
        }
        format(0);
        var idx = 0;
        for (var right = size - 1; right >= 1; right -= 2) {
            if (right === 6) right = 5;
            for (var vert = 0; vert < size; vert++) for (var j = 0; j < 2; j++) {
                var xx = right - j, up = ((right + 1) & 2) === 0, yy = up ? size - 1 - vert : vert;
                if (!fn[yy][xx] && idx < out.length * 8) { mod[yy][xx] = bit(out[idx >>> 3], 7 - (idx & 7)) === 1; idx++; }
            }
        }
        var MASKS = [
            function (x, y) { return (x + y) % 2 === 0; }, function (x, y) { return y % 2 === 0; },
            function (x, y) { return x % 3 === 0; }, function (x, y) { return (x + y) % 3 === 0; },
            function (x, y) { return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; },
            function (x, y) { return x * y % 2 + x * y % 3 === 0; },
            function (x, y) { return (x * y % 2 + x * y % 3) % 2 === 0; },
            function (x, y) { return ((x + y) % 2 + x * y % 3) % 2 === 0; }
        ];
        function applyMask(m) { for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) if (!fn[y][x] && MASKS[m](x, y)) mod[y][x] = !mod[y][x]; }
        function penalty() {
            var p = 0, y, x, PAT = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], RPAT = PAT.slice().reverse();
            function lineScore(get) {
                var s = 0, r = 1, i, k;
                for (i = 1; i < size; i++) { if (get(i) === get(i - 1)) r++; else { if (r >= 5) s += 3 + r - 5; r = 1; } }
                if (r >= 5) s += 3 + r - 5;
                for (i = 0; i + 11 <= size; i++) {
                    var a = true, b = true;
                    for (k = 0; k < 11; k++) { var vv = get(i + k) ? 1 : 0; if (vv !== PAT[k]) a = false; if (vv !== RPAT[k]) b = false; }
                    if (a) s += 40; if (b) s += 40;
                }
                return s;
            }
            for (y = 0; y < size; y++) p += lineScore(function (i) { return mod[y][i]; });
            for (x = 0; x < size; x++) p += lineScore(function (i) { return mod[i][x]; });
            var dark = 0;
            for (y = 0; y < size; y++) for (x = 0; x < size; x++) {
                if (mod[y][x]) dark++;
                if (x < size - 1 && y < size - 1 && mod[y][x] === mod[y][x + 1] && mod[y][x] === mod[y + 1][x] && mod[y][x] === mod[y + 1][x + 1]) p += 3;
            }
            var total = size * size, k2 = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
            return p + Math.max(0, k2) * 10;
        }
        var best = 0, bestP = 1e9;
        for (var m = 0; m < 8; m++) { applyMask(m); format(m); var pp = penalty(); if (pp < bestP) { bestP = pp; best = m; } applyMask(m); }
        applyMask(best); format(best);
        return mod;
    }
    function svg(text, label) {
        var m = make(text), n = m.length, q = 4, path = '', y, x, s;
        for (y = 0; y < n; y++) {
            x = 0;
            while (x < n) {
                if (m[y][x]) { s = x; while (x < n && m[y][x]) x++; path += 'M' + (s + q) + ' ' + (y + q) + 'h' + (x - s) + 'v1h-' + (x - s) + 'z'; }
                else x++;
            }
        }
        var t = n + 2 * q;
        return '<svg class="qr" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + t + ' ' + t + '" shape-rendering="crispEdges" role="img" aria-label="' + String(label || 'QR code').replace(/"/g, '') + '"><rect width="' + t + '" height="' + t + '" fill="#fff"/><path d="' + path + '" fill="#000"/></svg>';
    }
    return { svg: svg };
})();

/* ---------------------------------------------------------
   2. SMALL HELPERS
   --------------------------------------------------------- */
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function uid() { return Math.random().toString(36).slice(2, 10); }
function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }
function fmtDate(t) { return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function pct(n, total) { return total ? (n / total * 100).toFixed(1) + '%' : '0%'; }
function initials(n) { return String(n).split(/\s+/).slice(0, 2).map(function (w) { return w[0] || ''; }).join('').toUpperCase() || 'U'; }
function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove('on'); }, 2600); }
function saveBlob(blob, name) {
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
}

var ICONS = {
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    box: 'M21 8l-9-5-9 5v8l9 5 9-5zM3.3 7.5L12 12.5l8.7-5M12 22V12.5',
    qr: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v3M14 20h3M20 20h1',
    clip: 'M9 4h6v3H9zM7 5H5v16h14V5h-2M9 12h6M9 16h4',
    users: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M22 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8',
    chart: 'M18 20V10M12 20V4M6 20v-6',
    gear: 'M12 15a3 3 0 100-6 3 3 0 000 6M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z',
    search: 'M11 19a8 8 0 100-16 8 8 0 000 16M21 21l-4.3-4.3',
    plus: 'M12 5v14M5 12h14',
    edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z',
    trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
    menu: 'M3 6h18M3 12h18M3 18h18',
    x: 'M18 6L6 18M6 6l12 12',
    eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 100-6 3 3 0 000 6',
    eyeoff: 'M17.9 17.9A10.9 10.9 0 0112 20C5 20 1 12 1 12a18.5 18.5 0 015.1-5.9M9.9 4.2A9.1 9.1 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.2 3.2M1 1l22 22',
    print: 'M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z',
    download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
    alert: 'M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01',
    check: 'M20 6L9 17l-5-5',
    wrench: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.8-3.8a6 6 0 01-7.9 7.9l-6.9 6.9a2.1 2.1 0 01-3-3l6.9-6.9a6 6 0 017.9-7.9l-3.8 3.8z',
    user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8',
    lock: 'M5 11h14v10H5zM8 11V7a4 4 0 018 0v4',
    mail: 'M3 5h18v14H3zM3 5l9 8 9-8',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    chev: 'M6 9l6 6 6-6',
    dots: 'M12 5h.01M12 12h.01M12 19h.01',
    monitor: 'M2 4h20v13H2zM8 21h8M12 17v4',
    snow: 'M12 2v20M4.9 7l14.2 10M19.1 7L4.9 17',
    chair: 'M6 3h12v8H6zM5 11h14v4H5zM7 15v6M17 15v6',
    building: 'M4 21V4h10v17M14 9h6v12M8 8h2M8 12h2M8 16h2'
};
function ic(n) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICONS[n] + '"/></svg>'; }
function cube(cls) {
    return '<svg class="cube ' + (cls || '') + '" viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">' +
        '<path d="M24 4l17 9.5v21L24 44 7 34.5v-21z"/><path d="M7 13.5l17 9.5 17-9.5M24 23v21"/><circle cx="31" cy="31" r="2.4" fill="#fff" stroke="none"/></svg>';
}
function catIcon(cat) {
    var c = String(cat || '').toLowerCase();
    if (c.indexOf('hvac') > -1) return 'snow';
    if (c.indexOf('furn') > -1) return 'chair';
    if (c.indexOf('office') > -1) return 'print';
    if (c.indexOf('av') === 0) return 'monitor';
    return 'monitor';
}

/* ---------------------------------------------------------
   3. DATA (saved in this browser)
   --------------------------------------------------------- */
var KEY = 'assettrack_db', SKEY = 'assettrack_session', SEEDED = 'assettrack_seeded';
var DB = null;
var CATEGORIES = ['IT Equipment', 'AV Equipment', 'HVAC', 'Office Equipment', 'Furniture'];
var STATUSES = ['Active', 'Under Maintenance', 'Inactive'];
var ASSIGNEES = ['Unassigned', 'Tech Team', 'Maintenance', 'Facilities'];

function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { toast('Browser storage is full or blocked.'); } }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
function loadDB() { try { var r = lsGet(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function save() { lsSet(KEY, JSON.stringify(DB)); }

function hashPw(pw, salt) {
    var text = salt + ':' + pw;
    function fallback() { var h = 5381; for (var i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0; return 'x' + (h >>> 0).toString(16); }
    try {
        if (window.crypto && crypto.subtle && window.TextEncoder) {
            return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (b) {
                return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
            }, function () { return fallback(); });
        }
    } catch (e) {}
    return Promise.resolve(fallback());
}
function newUser(name, username, email, role, pw) {
    var salt = uid() + uid();
    return hashPw(pw, salt).then(function (h) {
        return { id: uid(), name: name, username: username, email: email, role: role, salt: salt, hash: h, created: Date.now() };
    });
}

function sampleAssets() {
    var now = Date.now(), D = 864e5, list = [];
    var fixed = [
        ['Laptop #001', 'IT Equipment', 'Computer Lab', 'Active'],
        ['Projector #002', 'AV Equipment', 'Room 101', 'Active'],
        ['Aircon #001', 'HVAC', 'Building 1', 'Under Maintenance'],
        ['Computer #004', 'IT Equipment', 'Computer Lab', 'Under Maintenance'],
        ['Printer #003', 'Office Equipment', 'Admin Office', 'Active'],
        ['Chair #015', 'Furniture', 'Room 202', 'Inactive'],
        ['Laptop #006', 'IT Equipment', 'Faculty Room', 'Under Maintenance']
    ];
    fixed.forEach(function (f, i) { list.push({ id: 'A' + pad(i + 1, 3), name: f[0], category: f[1], location: f[2], status: f[3], created: now - (200 + i * 31) * D }); });
    var kinds = [
        ['Computer', 'IT Equipment', ['Computer Lab', 'Computer Lab 2']], ['Monitor', 'IT Equipment', ['Computer Lab', 'Faculty Room']],
        ['Projector', 'AV Equipment', ['Room 101', 'Room 102', 'Room 201', 'Room 301']], ['Speaker', 'AV Equipment', ['Auditorium', 'Library']],
        ['Aircon', 'HVAC', ['Building 1', 'Building 2', 'Room 201']], ['Electric Fan', 'HVAC', ['Room 202', 'Room 203']],
        ['Printer', 'Office Equipment', ['Admin Office', 'Registrar', 'Library']], ['Scanner', 'Office Equipment', ['Registrar', 'Admin Office']],
        ['Chair', 'Furniture', ['Room 202', 'Room 203', 'Library']], ['Table', 'Furniture', ['Room 101', 'Faculty Room']]
    ];
    var used = {}, i2, k, n, name;
    list.forEach(function (a) { used[a.name] = 1; });
    for (i2 = 8; i2 <= 48; i2++) {
        k = kinds[(i2 * 7 + 3) % kinds.length]; n = 1 + (i2 * 5) % 40;
        do { name = k[0] + ' #' + pad(n, 3); n++; } while (used[name]);
        used[name] = 1;
        list.push({ id: 'A' + pad(i2, 3), name: name, category: k[1], location: k[2][i2 % k[2].length], status: (i2 === 20 || i2 === 35) ? 'Inactive' : 'Active', created: (i2 === 47 ? now - 3 * D : i2 === 48 ? now - 12 * D : now - (60 + i2 * 7) * D) });
    }
    return list;
}
function sampleReports() {
    var now = Date.now(), D = 864e5;
    function r(asset, issue, st, who, days, by) { return { id: uid(), assetId: asset, issue: issue, status: st, assigned: who, date: now - days * D - 36e5, by: by }; }
    return [
        r('A004', "Won't turn on", 'In Progress', 'Tech Team', 1, 'Maria Santos'),
        r('A002', 'Blurry display', 'Open', 'Unassigned', 2, 'Juan Dela Cruz'),
        r('A003', 'Not cooling', 'Resolved', 'Maintenance', 3, 'Admin'),
        r('A006', 'Broken leg', 'Resolved', 'Facilities', 4, 'Maria Santos'),
        r('A007', 'Overheating', 'In Progress', 'Tech Team', 5, 'Juan Dela Cruz'),
        r('A005', 'Paper jam on every print job', 'Open', 'Unassigned', 6, 'Anonymous')
    ];
}
function buildWorkspace(opt) {
    return newUser(opt.name, opt.username, opt.email, 'Admin', opt.password).then(function (admin) {
        var users = [admin];
        var p = opt.sample ? newUser('Juan Dela Cruz', 'tech', 'tech@assettrack.local', 'Technician', 'tech123') : Promise.resolve(null);
        return p.then(function (t) {
            if (t) users.push(t);
            return { workspace: opt.workspace, users: users, assets: opt.sample ? sampleAssets() : [], reports: opt.sample ? sampleReports() : [] };
        });
    });
}

/* ---------------------------------------------------------
   4. LOGIN SESSION AND PERMISSIONS
   --------------------------------------------------------- */
function currentUser() {
    var id = lsGet(SKEY);
    if (!id || !DB) return null;
    return DB.users.filter(function (u) { return u.id === id; })[0] || null;
}
function isAdmin(u) { return u && u.role === 'Admin'; }
function canManage(u) { return u && (u.role === 'Admin' || u.role === 'Technician'); }
function assetById(id) { return DB && DB.assets.filter(function (a) { return a.id === id; })[0]; }
function nextAssetId() {
    var max = 0;
    DB.assets.forEach(function (a) { var n = parseInt(String(a.id).slice(1), 10); if (n > max) max = n; });
    return 'A' + pad(max + 1, 3);
}
function syncAsset(assetId) {
    var a = assetById(assetId);
    if (!a || a.status === 'Inactive') return;
    var busy = DB.reports.some(function (r) { return r.assetId === assetId && r.status === 'In Progress'; });
    if (busy) a.status = 'Under Maintenance';
    else if (a.status === 'Under Maintenance') a.status = 'Active';
}
function statusPill(s) {
    var c = { 'Active': 'active', 'Under Maintenance': 'maint', 'Inactive': 'inactive', 'Open': 'open', 'In Progress': 'progress', 'Resolved': 'resolved' }[s] || 'open';
    return '<span class="pill ' + c + '">' + esc(s) + '</span>';
}
function qrUrl(a) { return location.href.split('#')[0] + '#/report/' + a.id; }

/* ---------------------------------------------------------
   5. SCREENS
   --------------------------------------------------------- */
var ui = { q: '', cat: '', loc: '', st: '', page: 1, tab: 'All', qrId: null, sidebar: false };
var PAGE_SIZE = 6;

/* ----- login and create workspace ----- */
function authShell(inner) {
    return '<div class="auth"><section class="auth-hero">' + cube() +
        '<h1>AssetTrack</h1><div class="tag">Monitor<b>&middot;</b>Maintain<b>&middot;</b>Keep It Running</div>' +
        '<p class="blurb">A web-based asset monitoring and maintenance reporting system that organizations can configure for their own equipment and materials.</p></section>' +
        '<section class="auth-panel"><div class="auth-card">' + inner + '</div></section></div>';
}
function viewLogin() {
    return authShell(
        '<h2>Welcome Back!</h2><p class="sub">Log in to your workspace</p>' +
        '<form data-form="login" novalidate>' +
        '<div class="field"><div class="input-wrap">' + ic('user') + '<input id="lgUser" placeholder="Email or Username" autocomplete="username" aria-label="Email or Username"></div></div>' +
        '<div class="field"><div class="input-wrap">' + ic('lock') + '<input id="lgPass" type="password" placeholder="Password" autocomplete="current-password" aria-label="Password"><button type="button" class="eye" data-act="eye" aria-label="Show password">' + ic('eye') + '</button></div></div>' +
        '<div class="error hide" id="formErr" role="alert"></div>' +
        '<button class="btn wide" type="submit">Login</button></form>' +
        '<p class="or">Don\'t have an account?</p>' +
        '<a class="btn outline wide" href="#/register">Create Workspace</a>' +
        '<div class="demo-note">Demo account: <b>admin</b> / <b>admin123</b></div>');
}
function viewRegister() {
    return authShell(
        '<h2>Create Workspace</h2><p class="sub">Set up AssetTrack for your organization</p>' +
        '<form data-form="register" novalidate>' +
        '<div class="field"><label for="rgWs">Workspace name</label><input id="rgWs" placeholder="e.g. STI College - Gentri Workspace" maxlength="60"></div>' +
        '<div class="field"><label for="rgName">Your full name</label><input id="rgName" placeholder="Juan Dela Cruz" autocomplete="name" maxlength="60"></div>' +
        '<div class="row2"><div class="field"><label for="rgUser">Username</label><input id="rgUser" autocomplete="username" maxlength="30"></div>' +
        '<div class="field"><label for="rgMail">Email</label><input id="rgMail" type="email" autocomplete="email"></div></div>' +
        '<div class="row2"><div class="field"><label for="rgPass">Password</label><input id="rgPass" type="password" autocomplete="new-password"></div>' +
        '<div class="field"><label for="rgPass2">Confirm password</label><input id="rgPass2" type="password" autocomplete="new-password"></div></div>' +
        '<label class="checkrow"><input type="checkbox" id="rgSample" checked><span>Add sample assets and reports so I can try it out</span></label>' +
        '<div class="error hide" id="formErr" role="alert"></div>' +
        '<button class="btn wide" type="submit">Create Workspace</button></form>' +
        '<p class="or">Already have an account?</p>' +
        '<a class="btn outline wide" href="#/login">Back to Login</a>');
}

/* ----- app shell ----- */
var NAV = [['dashboard', 'Dashboard', 'grid'], ['assets', 'Assets', 'box'], ['qr', 'QR Codes', 'qr'], ['maintenance', 'Maintenance Reports', 'clip'], ['users', 'Users', 'users'], ['reports', 'Reports', 'chart'], ['settings', 'Settings', 'gear']];
function shell(page, user, body) {
    var links = NAV.filter(function (n) { return n[0] !== 'users' || isAdmin(user); }).map(function (n) {
        return '<a href="#/' + n[0] + '" class="' + (n[0] === page ? 'active' : '') + '">' + ic(n[2]) + n[1] + '</a>';
    }).join('');
    return '<div class="shell"><aside class="sidebar' + (ui.sidebar ? ' open' : '') + '" id="sidebar"><div class="brand">' + cube() + 'AssetTrack</div><nav class="nav">' + links + '</nav><div class="foot">v1.0</div></aside>' +
        '<div class="main"><header class="topbar"><button class="burger" data-act="burger" aria-label="Open menu">' + ic('menu') + '</button>' +
        '<div class="ws">' + esc(DB.workspace) + '</div>' +
        '<button class="userbtn" data-act="usermenu" aria-label="Account menu"><span class="avatar">' + esc(initials(user.name)) + '</span><span class="nm">' + esc(user.role === 'Admin' ? 'Admin' : user.name.split(' ')[0]) + '</span>' + ic('chev') + '</button></header>' +
        '<div class="content">' + body + '</div></div></div>';
}
function head(title, sub, right) {
    return '<div class="page-head"><div><h1>' + esc(title) + '</h1><p>' + esc(sub) + '</p></div>' + (right || '') + '</div>';
}

/* ----- dashboard ----- */
function counts() {
    var a = DB.assets, c = { total: a.length, active: 0, maint: 0, inactive: 0, open: 0, month: 0 };
    a.forEach(function (x) {
        if (x.status === 'Active') c.active++; else if (x.status === 'Under Maintenance') c.maint++; else c.inactive++;
        if (Date.now() - x.created < 30 * 864e5) c.month++;
    });
    c.open = DB.reports.filter(function (r) { return r.status !== 'Resolved'; }).length;
    return c;
}
function reportRows(list, withActions, user) {
    return list.map(function (r) {
        var a = assetById(r.assetId);
        var assign = withActions ? '<td>' + (canManage(user) ?
            '<select class="inline" data-in="assign" data-id="' + r.id + '" aria-label="Assign report">' + ASSIGNEES.map(function (s) { return '<option' + (s === r.assigned ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' : esc(r.assigned)) + '</td>' : '';
        var act = withActions ? '<td>' + (canManage(user) || isAdmin(user) ? '<button class="iconbtn" data-menu="report" data-id="' + r.id + '" aria-label="Actions">' + ic('dots') + '</button>' : '') + '</td>' : '';
        return '<tr><td>' + fmtDate(r.date) + '</td><td>' + esc(a ? a.name : r.assetId) + '</td><td class="issue">' + esc(r.issue) + '</td><td>' + statusPill(r.status) + '</td>' + assign + act + '</tr>';
    }).join('');
}
function viewDashboard(user) {
    var c = counts();
    var recent = DB.reports.slice().sort(function (a, b) { return b.date - a.date; }).slice(0, 5);
    var seg = [['Active', c.active, '#22b35e'], ['Under Maintenance', c.maint, '#f5b13d'], ['Inactive', c.inactive, '#e8433c']];
    var R = 78, C = 2 * Math.PI * R, off = 0, circles = '';
    seg.forEach(function (s) {
        var len = c.total ? s[1] / c.total * C : 0;
        if (len > 0) circles += '<circle cx="100" cy="100" r="' + R + '" fill="none" stroke="' + s[2] + '" stroke-width="24" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>';
        off += len;
    });
    if (!circles) circles = '<circle cx="100" cy="100" r="' + R + '" fill="none" stroke="#e3e9f3" stroke-width="24"/>';
    var legend = seg.map(function (s) { return '<div><i style="background:' + s[2] + '"></i>' + (s[0] === 'Inactive' ? 'Inactive' : s[0]) + '<span class="n">' + s[1] + ' (' + pct(s[1], c.total) + ')</span></div>'; }).join('');
    function stat(cls, icon, label, num, sub, subCls, go) {
        return '<button class="stat" data-act="goto" ' + go + '><span class="sicon ' + cls + '">' + ic(icon) + '</span><span><span class="lbl">' + label + '</span><br><span class="num">' + num + '</span><br><span class="sub ' + subCls + '">' + sub + '</span></span></button>';
    }
    return head('Dashboard', 'Overview of your assets and maintenance activities.') +
        '<div class="stats">' +
        stat('blue', 'box', 'Total Assets', c.total, '+' + c.month + ' this month', 't-green', 'data-p="assets" data-st=""') +
        stat('green', 'check', 'Active Assets', c.active, pct(c.active, c.total), 't-green', 'data-p="assets" data-st="Active"') +
        stat('orange', 'wrench', 'Under Maintenance', c.maint, pct(c.maint, c.total), 't-orange', 'data-p="assets" data-st="Under Maintenance"') +
        stat('red', 'alert', 'Reported Problems', c.open, pct(c.open, c.total), 't-red', 'data-p="maintenance" data-tab="Open"') +
        '</div><div class="grid2"><section class="panel"><div class="panel-head"><h2>Recent Maintenance Reports</h2><a href="#/maintenance">View all ' + ic('arrow') + '</a></div>' +
        (recent.length ? '<div class="tbl"><table><thead><tr><th>Date</th><th>Asset</th><th>Issue</th><th>Status</th></tr></thead><tbody>' + reportRows(recent, false, user) + '</tbody></table></div>' : '<div class="empty">No reports yet.</div>') +
        '</section><section class="panel"><div class="panel-head"><h2>Asset Status Overview</h2></div><div class="donut-wrap"><div class="donut"><svg viewBox="0 0 200 200" aria-hidden="true">' + circles + '</svg><div class="mid"><b>' + c.total + '</b><span>Total Assets</span></div></div><div class="legend">' + legend + '</div></div></section></div>';
}

/* ----- assets ----- */
function filteredAssets() {
    var q = ui.q.toLowerCase();
    return DB.assets.filter(function (a) {
        return (!q || (a.name + ' ' + a.id + ' ' + a.category + ' ' + a.location).toLowerCase().indexOf(q) > -1) &&
            (!ui.cat || a.category === ui.cat) && (!ui.loc || a.location === ui.loc) && (!ui.st || a.status === ui.st);
    });
}
function pageButtons(page, pages) {
    var nums = [], i, last = 0;
    for (i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 1 || (page <= 3 && i <= 4) || (page >= pages - 2 && i >= pages - 3)) nums.push(i);
    var h = '<button data-act="page" data-n="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + ' aria-label="Previous page">&lsaquo;</button>';
    nums.forEach(function (n) {
        if (last && n - last > 1) h += '<button disabled>&hellip;</button>';
        h += '<button class="' + (n === page ? 'on' : '') + '" data-act="page" data-n="' + n + '">' + n + '</button>'; last = n;
    });
    return h + '<button data-act="page" data-n="' + (page + 1) + '"' + (page >= pages ? ' disabled' : '') + ' aria-label="Next page">&rsaquo;</button>';
}
function assetsTable(user) {
    var list = filteredAssets(), pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (ui.page > pages) ui.page = pages;
    var from = (ui.page - 1) * PAGE_SIZE, rows = list.slice(from, from + PAGE_SIZE);
    var body = rows.map(function (a) {
        return '<tr><td>' + esc(a.id) + '</td><td><b>' + esc(a.name) + '</b></td><td>' + esc(a.category) + '</td><td>' + esc(a.location) + '</td><td>' + statusPill(a.status) + '</td>' +
            '<td><button class="iconbtn qrmini" data-act="qr-open" data-id="' + a.id + '" aria-label="Show QR code for ' + esc(a.name) + '">' + ic('qr') + '</button></td>' +
            '<td><button class="iconbtn" data-menu="asset" data-id="' + a.id + '" aria-label="Actions for ' + esc(a.name) + '">' + ic('dots') + '</button></td></tr>';
    }).join('');
    return '<div class="tbl"><table><thead><tr><th>ID</th><th>Asset Name</th><th>Category</th><th>Location</th><th>Status</th><th>QR Code</th><th>Actions</th></tr></thead><tbody>' +
        (body || '<tr><td colspan="7" class="empty">No assets match your search.</td></tr>') + '</tbody></table></div>' +
        '<div class="pager"><span>' + (list.length ? 'Showing ' + (from + 1) + '-' + (from + rows.length) + ' of ' + list.length + ' assets' : 'No assets') + '</span><div class="pages">' + pageButtons(ui.page, pages) + '</div></div>';
}
function uniq(key) {
    var seen = {}, out = [];
    DB.assets.forEach(function (a) { if (!seen[a[key]]) { seen[a[key]] = 1; out.push(a[key]); } });
    return out.sort();
}
function viewAssets(user) {
    function opts(list, cur, all) { return '<option value="">' + all + '</option>' + list.map(function (x) { return '<option' + (x === cur ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join(''); }
    return head('Assets', 'Manage and view all your equipment and materials.', '<button class="btn" data-act="asset-new">' + ic('plus') + ' Add Asset</button>') +
        '<section class="panel"><div class="filters"><div class="search">' + ic('search') + '<input data-in="q" value="' + esc(ui.q) + '" placeholder="Search assets..." aria-label="Search assets"></div>' +
        '<select data-in="cat" aria-label="Category">' + opts(uniq('category'), ui.cat, 'All Categories') + '</select>' +
        '<select data-in="loc" aria-label="Location">' + opts(uniq('location'), ui.loc, 'All Locations') + '</select>' +
        '<select data-in="st" aria-label="Status">' + opts(STATUSES, ui.st, 'All Status') + '</select></div>' +
        '<div id="assetsBody" style="margin-top:14px">' + assetsTable(user) + '</div></section>';
}

/* ----- QR codes ----- */
function qrLabel(a, small) {
    return '<div class="qr-label"><div class="t">' + cube().replace('stroke="#fff"', 'stroke="#0b2a66"').replace('fill="#fff"', 'fill="#0b2a66"') + 'AssetTrack</div>' +
        QR.svg(qrUrl(a), 'QR code for ' + a.name) + '<b>' + esc(a.name) + '</b><span>' + esc(a.category) + '</span><span>' + esc(a.id) + '</span></div>';
}
function viewQr() {
    if (!ui.qrId || !assetById(ui.qrId)) ui.qrId = DB.assets.length ? DB.assets[0].id : null;
    var a = assetById(ui.qrId);
    if (!a) return head('QR Code Generator', 'Generate and print QR codes for your assets.') + '<section class="panel empty">Add an asset first.</section>';
    var options = DB.assets.map(function (x) { return '<option value="' + x.id + '"' + (x.id === a.id ? ' selected' : '') + '>' + esc(x.id + ' - ' + x.name) + '</option>'; }).join('');
    return head('QR Code Generator', 'Generate and print QR codes for your assets.') +
        '<div class="qr-grid"><section class="panel"><div class="field"><label for="qrSel">Select Asset</label><select id="qrSel" data-in="qrsel">' + options + '</select></div>' +
        qrLabel(a) + '<div class="btnrow"><button class="btn" data-act="qr-download" data-id="' + a.id + '">' + ic('download') + ' Download QR Code</button><button class="btn outline" data-act="qr-print" data-id="' + a.id + '">' + ic('print') + ' Print QR Code</button></div></section>' +
        '<div class="stack"><section class="panel"><div class="panel-head"><h2>Bulk Generate</h2></div><p class="muted" style="margin-bottom:14px">Generate QR codes for multiple assets at once.</p><button class="btn outline wide" data-act="bulk">Generate Multiple QR Codes</button></section>' +
        '<section class="panel"><div class="panel-head"><h2>QR Code Preview</h2></div><div class="preview-row">' + QR.svg(qrUrl(a), 'QR preview') + '<p class="muted" style="flex:1;min-width:140px">Print and attach this QR code to the physical asset. Scanning it opens the problem report form.</p></div></section></div></div>';
}

/* ----- maintenance reports ----- */
function viewMaintenance(user) {
    var tabs = ['All', 'Open', 'In Progress', 'Resolved'];
    var all = DB.reports.slice().sort(function (a, b) { return b.date - a.date; });
    var list = ui.tab === 'All' ? all : all.filter(function (r) { return r.status === ui.tab; });
    var tabHtml = tabs.map(function (t) {
        var n = t === 'All' ? all.length : all.filter(function (r) { return r.status === t; }).length;
        return '<button class="' + (ui.tab === t ? 'on' : '') + '" data-act="tab" data-t="' + t + '">' + t + '<small>' + n + '</small></button>';
    }).join('');
    return head('Maintenance Reports', 'View and manage all maintenance reports.', '<a class="btn" href="#/report">' + ic('plus') + ' Report a Problem</a>') +
        '<div class="tabs">' + tabHtml + '</div><section class="panel"><div class="tbl"><table><thead><tr><th>Date</th><th>Asset</th><th>Issue</th><th>Status</th><th>Assigned To</th><th>Actions</th></tr></thead><tbody>' +
        (list.length ? reportRows(list, true, user) : '<tr><td colspan="6" class="empty">No reports in this tab.</td></tr>') + '</tbody></table></div></section>';
}

/* ----- report a problem (public page) ----- */
function viewReport(arg) {
    var a = arg ? assetById(arg) : null, user = currentUser();
    var back = user ? '<a class="backlink" href="#/maintenance">&larr; Back to Maintenance Reports</a>' : '';
    var notFound = arg && !a;
    var assetField = a ?
        '<div class="field"><label>Asset</label><input readonly value="' + esc(a.name + ' (' + a.id + ')') + '"><input type="hidden" id="rpAsset" value="' + a.id + '"></div>' +
        '<div class="field"><label>Location</label><input readonly value="' + esc(a.location) + '"></div>' :
        '<div class="field"><label for="rpAsset">Asset</label><select id="rpAsset" data-in="rpasset"><option value="">Select an asset</option>' + DB.assets.map(function (x) { return '<option value="' + x.id + '">' + esc(x.id + ' - ' + x.name) + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label>Location</label><input readonly id="rpLoc" value=""></div>';
    var side = a ? '<aside class="panel asset-card"><div class="big"><span class="ico">' + ic(catIcon(a.category)) + '</span><div><b style="font-size:17px">' + esc(a.name) + '</b><div class="muted">' + esc(a.category) + '</div><div class="muted small">' + esc(a.id) + '</div></div></div><dl><div><dt>Location</dt><dd>' + esc(a.location) + '</dd></div><div><dt>Status</dt><dd>' + statusPill(a.status) + '</dd></div></dl></aside>' :
        '<aside class="panel asset-card"><div class="big"><span class="ico">' + ic('qr') + '</span><div><b style="font-size:17px">Pick an asset</b><div class="muted small">Or scan the QR code on the equipment.</div></div></div></aside>';
    return '<div class="plain">' + back + '<div class="plain-in"><section class="panel"><div class="rep-head"><span class="ico">' + ic('wrench') + '</span><div><h1>Report an Asset Problem</h1><p class="muted">Scan the QR code on the asset and fill out the form below.</p></div></div>' +
        (notFound ? '<div class="error">That asset was not found in this workspace. Choose one from the list instead.</div>' : '') +
        '<form data-form="report" novalidate>' + (notFound ? '' : assetField).replace(/^$/, '') +
        (notFound ? '<div class="field"><label for="rpAsset">Asset</label><select id="rpAsset" data-in="rpasset"><option value="">Select an asset</option>' + DB.assets.map(function (x) { return '<option value="' + x.id + '">' + esc(x.id + ' - ' + x.name) + '</option>'; }).join('') + '</select></div><div class="field"><label>Location</label><input readonly id="rpLoc" value=""></div>' : '') +
        '<div class="field"><label for="rpText">Problem Description <em>*</em></label><textarea id="rpText" placeholder="Describe the issue in detail..." maxlength="500"></textarea></div>' +
        '<div class="error hide" id="formErr" role="alert"></div><button class="btn wide" type="submit">Submit Report</button></form></section>' + side + '</div></div>';
}
function viewSubmitted() {
    var user = currentUser();
    return '<div class="photo-page"><div class="photo-top"><div class="brand">' + cube() + 'AssetTrack</div>' + ic('menu') + '</div><div class="photo-mid"><div class="done-card"><div class="ok">' + ic('check') + '</div><h1>Report Submitted!</h1>' +
        '<p>Your maintenance report has been sent to the administrator. Thank you for helping keep our assets in good condition.</p><a class="btn" href="#/' + (user ? 'dashboard' : 'login') + '">Back to Home</a></div></div>' +
        '<div class="photo-foot">AssetTrack &nbsp;&middot;&nbsp; Monitor &nbsp;&middot;&nbsp; Maintain &nbsp;&middot;&nbsp; Keep It Running</div></div>';
}

/* ----- users ----- */
function viewUsers(user) {
    if (!isAdmin(user)) return head('Users', 'Manage who can use this workspace.') + '<section class="panel empty">Only administrators can manage users.</section>';
    var rows = DB.users.map(function (u) {
        var me = u.id === user.id;
        return '<tr><td><b>' + esc(u.name) + '</b>' + (me ? ' <span class="muted small">(you)</span>' : '') + '</td><td>' + esc(u.username) + '</td><td>' + esc(u.email) + '</td><td>' +
            (me ? esc(u.role) : '<select class="inline" data-in="role" data-id="' + u.id + '" aria-label="Role for ' + esc(u.name) + '">' + ['Admin', 'Technician', 'Staff'].map(function (r) { return '<option' + (r === u.role ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select>') +
            '</td><td>' + fmtDate(u.created) + '</td><td>' + (me ? '' : '<button class="iconbtn" data-act="user-del" data-id="' + u.id + '" aria-label="Remove ' + esc(u.name) + '">' + ic('trash') + '</button>') + '</td></tr>';
    }).join('');
    return head('Users', 'Manage who can use this workspace.', '<button class="btn" data-act="user-new">' + ic('plus') + ' Add User</button>') +
        '<section class="panel"><div class="tbl"><table><thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Added</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<p class="muted small" style="margin-top:14px"><b>Admin</b> can do everything. <b>Technician</b> can update and assign reports. <b>Staff</b> can view and report problems.</p></section>';
}

/* ----- reports (summary and export) ----- */
function barList(map, total) {
    var keys = Object.keys(map).sort(function (a, b) { return map[b] - map[a]; });
    if (!keys.length) return '<div class="empty">No data yet.</div>';
    return '<div class="bars">' + keys.map(function (k) {
        return '<div class="bar-row"><div class="top"><span>' + esc(k) + '</span><b>' + map[k] + '</b></div><div class="track"><div class="fill" style="width:' + (total ? Math.max(3, map[k] / total * 100) : 0) + '%"></div></div></div>';
    }).join('') + '</div>';
}
function viewReports() {
    var c = counts(), byCat = {}, byLoc = {}, perAsset = {};
    DB.assets.forEach(function (a) { byCat[a.category] = (byCat[a.category] || 0) + 1; byLoc[a.location] = (byLoc[a.location] || 0) + 1; });
    DB.reports.forEach(function (r) { perAsset[r.assetId] = (perAsset[r.assetId] || 0) + 1; });
    var top = Object.keys(perAsset).sort(function (a, b) { return perAsset[b] - perAsset[a]; }).slice(0, 5).map(function (id) {
        var a = assetById(id); return '<tr><td>' + esc(a ? a.name : id) + '</td><td>' + esc(a ? a.location : '') + '</td><td><b>' + perAsset[id] + '</b></td></tr>';
    }).join('');
    var resolved = DB.reports.filter(function (r) { return r.status === 'Resolved'; }).length;
    function card(l, n, cls) { return '<div class="panel"><div class="muted small">' + l + '</div><div class="num ' + cls + '" style="font-size:30px;font-weight:800">' + n + '</div></div>'; }
    return head('Reports', 'Summary of your assets and maintenance activity.', '<div class="btnrow" style="gap:8px"><button class="btn outline" data-act="csv-assets">' + ic('download') + ' Assets CSV</button><button class="btn outline" data-act="csv-reports">' + ic('download') + ' Reports CSV</button></div>') +
        '<div class="cards3">' + card('Total assets', c.total, '') + card('Open problems', c.open, 't-red') + card('Resolved problems', resolved, 't-green') + '</div>' +
        '<div class="grid2"><section class="panel"><div class="panel-head"><h2>Assets by Category</h2></div>' + barList(byCat, c.total) + '</section>' +
        '<section class="panel"><div class="panel-head"><h2>Assets by Location</h2></div>' + barList(byLoc, c.total) + '</section></div>' +
        '<section class="panel"><div class="panel-head"><h2>Assets with the Most Reports</h2></div>' + (top ? '<div class="tbl"><table><thead><tr><th>Asset</th><th>Location</th><th>Reports</th></tr></thead><tbody>' + top + '</tbody></table></div>' : '<div class="empty">No reports yet.</div>') + '</section>';
}

/* ----- settings ----- */
function viewSettings(user) {
    return head('Settings', 'Manage your account and workspace.') +
        '<div class="setting-grid"><section class="panel"><div class="panel-head"><h2>Profile</h2></div><form data-form="profile" novalidate>' +
        '<div class="field"><label for="stName">Full name</label><input id="stName" value="' + esc(user.name) + '" maxlength="60"></div>' +
        '<div class="row2"><div class="field"><label for="stUser">Username</label><input id="stUser" value="' + esc(user.username) + '" maxlength="30"></div><div class="field"><label for="stMail">Email</label><input id="stMail" type="email" value="' + esc(user.email) + '"></div></div>' +
        '<div class="field"><label>Role</label><input readonly value="' + esc(user.role) + '"></div><div class="error hide" id="formErr" role="alert"></div><button class="btn" type="submit">Save profile</button></form></section>' +
        '<section class="panel"><div class="panel-head"><h2>Change Password</h2></div><form data-form="password" novalidate>' +
        '<div class="field"><label for="pwOld">Current password</label><input id="pwOld" type="password" autocomplete="current-password"></div>' +
        '<div class="row2"><div class="field"><label for="pwNew">New password</label><input id="pwNew" type="password" autocomplete="new-password"></div><div class="field"><label for="pwNew2">Confirm</label><input id="pwNew2" type="password" autocomplete="new-password"></div></div>' +
        '<div class="error hide" id="formErr2" role="alert"></div><button class="btn" type="submit">Update password</button></form></section>' +
        (isAdmin(user) ? '<section class="panel"><div class="panel-head"><h2>Workspace</h2></div><form data-form="workspace" novalidate><div class="field"><label for="wsName">Workspace name</label><input id="wsName" value="' + esc(DB.workspace) + '" maxlength="60"><span class="hint">Shown at the top of every page.</span></div><button class="btn" type="submit">Save workspace</button></form></section>' +
        '<section class="panel"><div class="panel-head"><h2>Data</h2></div><p class="muted" style="margin-bottom:14px">Your data lives in this browser only. Download a backup before clearing browser data.</p><div class="stack" style="gap:10px"><button class="btn outline" data-act="backup">' + ic('download') + ' Download backup (JSON)</button><button class="btn ghost" data-act="reset-sample">Reset to sample data</button><button class="btn danger" data-act="ws-delete">Delete workspace</button></div></section>' : '') +
        '<section class="panel"><div class="panel-head"><h2>Session</h2></div><button class="btn outline" data-act="logout">' + ic('logout') + ' Log out</button></section></div>';
}

/* ---------------------------------------------------------
   6. ROUTER
   --------------------------------------------------------- */
function parseRoute() {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    return { page: parts[0] || '', arg: parts[1] ? decodeURIComponent(parts[1]) : null };
}
function go(p) {
    var target = '#/' + p;
    if (location.hash === target) render(); else location.hash = target;
}
function render() {
    var r = parseRoute(), user = currentUser(), app = $('#app');
    if (!DB) { if (r.page !== 'register') { location.hash = '#/register'; return; } app.innerHTML = viewRegister(); return; }
    var open = { login: 1, register: 1, report: 1, submitted: 1 };
    var page = r.page || (user ? 'dashboard' : 'login');
    if (!user && !open[page]) { location.hash = '#/login'; return; }
    if (user && (page === 'login' || page === 'register')) { location.hash = '#/dashboard'; return; }
    ui.sidebar = false; closeMenu();
    var html;
    switch (page) {
        case 'login': html = viewLogin(); break;
        case 'register': html = viewRegister(); break;
        case 'report': html = viewReport(r.arg); break;
        case 'submitted': html = viewSubmitted(); break;
        case 'dashboard': html = shell(page, user, viewDashboard(user)); break;
        case 'assets': html = shell(page, user, viewAssets(user)); break;
        case 'qr': if (r.arg) ui.qrId = r.arg; html = shell(page, user, viewQr()); break;
        case 'maintenance': html = shell(page, user, viewMaintenance(user)); break;
        case 'users': html = shell(page, user, viewUsers(user)); break;
        case 'reports': html = shell(page, user, viewReports()); break;
        case 'settings': html = shell(page, user, viewSettings(user)); break;
        default: location.hash = user ? '#/dashboard' : '#/login'; return;
    }
    app.innerHTML = html;
    var u = $('#lgUser'); if (u) u.focus();
}
window.addEventListener('hashchange', function () { render(); window.scrollTo(0, 0); });

/* ---------------------------------------------------------
   7. POPUPS AND MENUS
   --------------------------------------------------------- */
function openModal(html, wide) {
    $('#modalRoot').innerHTML = '<div class="modal-bg" data-act="mbg"><div class="modal' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true">' + html + '</div></div>';
    var f = $('#modalRoot input:not([type=hidden]):not([type=checkbox]), #modalRoot select'); if (f) f.focus();
}
function closeModal() { $('#modalRoot').innerHTML = ''; }
var pendingConfirm = null;
function confirmBox(title, msg, label, fn) {
    pendingConfirm = fn;
    openModal('<h2>' + esc(title) + '</h2><p class="sub">' + esc(msg) + '</p><div class="actions"><button class="btn ghost" data-act="close">Cancel</button><button class="btn danger" data-act="confirm-yes">' + esc(label) + '</button></div>');
}
function closeMenu() { $('#menuRoot').innerHTML = ''; }
function openMenu(btn, items) {
    var root = $('#menuRoot');
    root.innerHTML = '<div class="dropdown" role="menu">' + items.map(function (i) {
        return i === '-' ? '<hr>' : '<button role="menuitem" class="' + (i.danger ? 'danger' : '') + '" data-act="' + i.act + '" data-id="' + (i.id || '') + '">' + (i.icon ? ic(i.icon) : '') + esc(i.label) + '</button>';
    }).join('') + '</div>';
    var d = $('.dropdown', root), r = btn.getBoundingClientRect();
    var top = r.bottom + 4, left = Math.max(8, Math.min(window.innerWidth - d.offsetWidth - 8, r.right - d.offsetWidth));
    if (top + d.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - d.offsetHeight - 4);
    d.style.top = top + 'px'; d.style.left = left + 'px';
}
function assetModal(a) {
    var cats = CATEGORIES.concat(uniq('category').filter(function (c) { return CATEGORIES.indexOf(c) < 0; }));
    openModal('<h2>' + (a ? 'Edit Asset' : 'Add Asset') + '</h2><p class="sub">' + (a ? 'Update the details of ' + esc(a.name) + '.' : 'The asset ID is created for you.') + '</p>' +
        '<form data-form="asset" data-id="' + (a ? a.id : '') + '" novalidate><div class="field"><label for="asName">Asset name <em>*</em></label><input id="asName" value="' + esc(a ? a.name : '') + '" placeholder="e.g. Laptop #010" maxlength="60"></div>' +
        '<div class="row2"><div class="field"><label for="asCat">Category</label><input id="asCat" list="catList" value="' + esc(a ? a.category : CATEGORIES[0]) + '" maxlength="40"><datalist id="catList">' + cats.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist></div>' +
        '<div class="field"><label for="asLoc">Location</label><input id="asLoc" list="locList" value="' + esc(a ? a.location : '') + '" placeholder="e.g. Room 101" maxlength="40"><datalist id="locList">' + uniq('location').map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist></div></div>' +
        '<div class="field"><label for="asSt">Status</label><select id="asSt">' + STATUSES.map(function (s) { return '<option' + (a && a.status === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div>' +
        '<div class="error hide" id="formErr" role="alert"></div><div class="actions"><button type="button" class="btn ghost" data-act="close">Cancel</button><button class="btn" type="submit">' + (a ? 'Save changes' : 'Add Asset') + '</button></div></form>');
}
function userModal() {
    openModal('<h2>Add User</h2><p class="sub">Create an account for someone in your workspace.</p><form data-form="user" novalidate>' +
        '<div class="field"><label for="uName">Full name</label><input id="uName" maxlength="60"></div><div class="row2"><div class="field"><label for="uUser">Username</label><input id="uUser" maxlength="30"></div><div class="field"><label for="uRole">Role</label><select id="uRole"><option>Staff</option><option>Technician</option><option>Admin</option></select></div></div>' +
        '<div class="field"><label for="uMail">Email</label><input id="uMail" type="email"></div><div class="field"><label for="uPass">Temporary password</label><input id="uPass" type="text" autocomplete="off"><span class="hint">At least 6 characters. Tell them to change it in Settings.</span></div>' +
        '<div class="error hide" id="formErr" role="alert"></div><div class="actions"><button type="button" class="btn ghost" data-act="close">Cancel</button><button class="btn" type="submit">Add User</button></div></form>');
}
function qrModal(a) {
    openModal('<h2>' + esc(a.name) + '</h2><p class="sub">Scan to open the problem report form.</p>' + qrLabel(a) +
        '<div class="btnrow"><button class="btn" data-act="qr-download" data-id="' + a.id + '">' + ic('download') + ' Download</button><button class="btn outline" data-act="qr-print" data-id="' + a.id + '">' + ic('print') + ' Print</button></div>' +
        '<div class="actions"><button class="btn ghost" data-act="close">Close</button></div>');
}
function bulkModal() {
    var list = filteredAssets();
    openModal('<h2>Generate Multiple QR Codes</h2><p class="sub">Choose the assets, then print the labels.</p><form data-form="bulk">' +
        '<label class="checkrow"><input type="checkbox" id="bkAll" checked><span><b>Select all (' + DB.assets.length + ')</b></span></label><div class="pick-list">' +
        DB.assets.map(function (a) { return '<label><input type="checkbox" class="bk" value="' + a.id + '" checked> <span>' + esc(a.id + ' - ' + a.name) + ' <span class="muted">' + esc(a.location) + '</span></span></label>'; }).join('') +
        '</div><div class="actions"><button type="button" class="btn ghost" data-act="close">Cancel</button><button class="btn" type="submit">Generate</button></div></form>', true);
}
function showBulk(ids) {
    var list = ids.map(assetById).filter(Boolean);
    if (!list.length) { toast('Select at least one asset.'); return; }
    openModal('<h2>' + list.length + ' QR code' + (list.length > 1 ? 's' : '') + ' ready</h2><p class="sub">Print them and attach each label to its asset.</p><div class="bulk-grid">' + list.map(qrLabel).join('') + '</div>' +
        '<div class="actions"><button class="btn ghost" data-act="close">Close</button><button class="btn" data-act="bulk-print" data-ids="' + list.map(function (a) { return a.id; }).join(',') + '">' + ic('print') + ' Print All</button></div>', true);
}
function printLabels(list) {
    $('#printArea').innerHTML = list.map(qrLabel).join('');
    window.print();
    setTimeout(function () { $('#printArea').innerHTML = ''; }, 800);
}
function downloadQr(a) {
    var svg = QR.svg(qrUrl(a), a.name).replace('<svg ', '<svg width="600" height="600" ');
    var img = new Image();
    img.onload = function () {
        var c = document.createElement('canvas'); c.width = 640; c.height = 770;
        var x = c.getContext('2d');
        x.fillStyle = '#fff'; x.fillRect(0, 0, 640, 770);
        x.imageSmoothingEnabled = false; x.drawImage(img, 20, 20, 600, 600);
        x.textAlign = 'center'; x.fillStyle = '#0f1f3d'; x.font = '700 36px Arial, sans-serif'; x.fillText(a.name, 320, 675);
        x.fillStyle = '#55657f'; x.font = '24px Arial, sans-serif'; x.fillText(a.id + '  |  ' + a.category, 320, 720);
        c.toBlob(function (b) { if (b) { saveBlob(b, 'QR-' + a.id + '.png'); toast('QR code downloaded'); } });
    };
    img.onerror = function () { toast('Could not create the image.'); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function csv(rows) { return '﻿' + rows.map(function (r) { return r.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n'); }

/* ---------------------------------------------------------
   8. EVENTS
   --------------------------------------------------------- */
function showErr(msg, id) { var e = $('#' + (id || 'formErr')); if (e) { e.textContent = msg; e.classList.remove('hide'); } }
function rowMenuItems(kind, id, user) {
    if (kind === 'asset') {
        var items = [{ label: 'View QR Code', act: 'qr-open', id: id, icon: 'qr' }, { label: 'Report a Problem', act: 'report-asset', id: id, icon: 'alert' }, { label: 'Edit Asset', act: 'asset-edit', id: id, icon: 'edit' }];
        if (isAdmin(user)) items.push('-', { label: 'Delete Asset', act: 'asset-del', id: id, icon: 'trash', danger: true });
        return items;
    }
    var r = DB.reports.filter(function (x) { return x.id === id; })[0], out = [];
    if (!r) return out;
    if (r.status !== 'In Progress') out.push({ label: 'Mark In Progress', act: 'rep-progress', id: id, icon: 'wrench' });
    if (r.status !== 'Resolved') out.push({ label: 'Mark Resolved', act: 'rep-resolved', id: id, icon: 'check' });
    if (r.status !== 'Open') out.push({ label: 'Reopen', act: 'rep-open', id: id, icon: 'alert' });
    if (isAdmin(user)) out.push('-', { label: 'Delete Report', act: 'rep-del', id: id, icon: 'trash', danger: true });
    return out;
}
function setReportStatus(id, st) {
    var r = DB.reports.filter(function (x) { return x.id === id; })[0]; if (!r) return;
    r.status = st; syncAsset(r.assetId); save(); render(); toast('Report marked ' + st);
}

document.addEventListener('click', function (e) {
    var user = currentUser();
    var menuBtn = e.target.closest('[data-menu]');
    if (menuBtn) { e.stopPropagation(); openMenu(menuBtn, rowMenuItems(menuBtn.dataset.menu, menuBtn.dataset.id, user)); return; }
    var t = e.target.closest('[data-act]');
    if (!e.target.closest('.dropdown') ) closeMenu();
    if (!t) return;
    var act = t.dataset.act, id = t.dataset.id;
    if (act !== 'mbg') closeMenu();
    switch (act) {
        case 'mbg': if (e.target === t) closeModal(); break;
        case 'close': closeModal(); break;
        case 'eye': { var inp = t.parentNode.querySelector('input'); var show = inp.type === 'password'; inp.type = show ? 'text' : 'password'; t.innerHTML = ic(show ? 'eyeoff' : 'eye'); break; }
        case 'burger': ui.sidebar = !ui.sidebar; $('#sidebar').classList.toggle('open', ui.sidebar); break;
        case 'usermenu': openMenu(t, [{ label: 'Settings', act: 'to-settings', icon: 'gear' }, { label: 'Log out', act: 'logout', icon: 'logout' }]); e.stopPropagation(); break;
        case 'to-settings': go('settings'); break;
        case 'logout': lsDel(SKEY); closeModal(); go('login'); break;
        case 'goto': ui.st = t.dataset.st || ''; ui.cat = ''; ui.loc = ''; ui.q = ''; ui.page = 1; if (t.dataset.tab) ui.tab = t.dataset.tab; go(t.dataset.p); break;
        case 'page': ui.page = Math.max(1, parseInt(t.dataset.n, 10) || 1); $('#assetsBody').innerHTML = assetsTable(user); break;
        case 'tab': ui.tab = t.dataset.t; render(); break;
        case 'asset-new': assetModal(null); break;
        case 'asset-edit': assetModal(assetById(id)); break;
        case 'asset-del': { var a = assetById(id); if (a) confirmBox('Delete ' + a.name + '?', 'This also removes its maintenance reports. This cannot be undone.', 'Delete', function () {
            DB.assets = DB.assets.filter(function (x) { return x.id !== id; }); DB.reports = DB.reports.filter(function (x) { return x.assetId !== id; }); save(); closeModal(); render(); toast('Asset deleted'); }); break; }
        case 'qr-open': { var q = assetById(id); if (q) qrModal(q); break; }
        case 'qr-download': { var d = assetById(id); if (d) downloadQr(d); break; }
        case 'qr-print': { var p = assetById(id); if (p) printLabels([p]); break; }
        case 'bulk': bulkModal(); break;
        case 'bulk-print': printLabels(t.dataset.ids.split(',').map(assetById).filter(Boolean)); break;
        case 'report-asset': go('report/' + id); break;
        case 'rep-progress': setReportStatus(id, 'In Progress'); break;
        case 'rep-resolved': setReportStatus(id, 'Resolved'); break;
        case 'rep-open': setReportStatus(id, 'Open'); break;
        case 'rep-del': confirmBox('Delete this report?', 'This cannot be undone.', 'Delete', function () { var r = DB.reports.filter(function (x) { return x.id === id; })[0]; DB.reports = DB.reports.filter(function (x) { return x.id !== id; }); if (r) syncAsset(r.assetId); save(); closeModal(); render(); toast('Report deleted'); }); break;
        case 'user-new': userModal(); break;
        case 'user-del': { var u = DB.users.filter(function (x) { return x.id === id; })[0]; if (u) confirmBox('Remove ' + u.name + '?', 'They will no longer be able to log in.', 'Remove', function () { DB.users = DB.users.filter(function (x) { return x.id !== id; }); save(); closeModal(); render(); toast('User removed'); }); break; }
        case 'confirm-yes': if (pendingConfirm) { var fn = pendingConfirm; pendingConfirm = null; fn(); } break;
        case 'csv-assets': saveBlob(new Blob([csv([['ID', 'Asset Name', 'Category', 'Location', 'Status', 'Added']].concat(DB.assets.map(function (a) { return [a.id, a.name, a.category, a.location, a.status, fmtDate(a.created)]; })))], { type: 'text/csv' }), 'assets.csv'); toast('Assets exported'); break;
        case 'csv-reports': saveBlob(new Blob([csv([['Date', 'Asset ID', 'Asset', 'Issue', 'Status', 'Assigned To', 'Reported By']].concat(DB.reports.map(function (r) { var a = assetById(r.assetId); return [fmtDate(r.date), r.assetId, a ? a.name : '', r.issue, r.status, r.assigned, r.by]; })))], { type: 'text/csv' }), 'maintenance-reports.csv'); toast('Reports exported'); break;
        case 'backup': saveBlob(new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' }), 'assettrack-backup.json'); toast('Backup downloaded'); break;
        case 'reset-sample': confirmBox('Reset to sample data?', 'All current assets and reports will be replaced with the sample set. Users are kept.', 'Reset', function () { DB.assets = sampleAssets(); DB.reports = sampleReports(); save(); closeModal(); render(); toast('Sample data restored'); }); break;
        case 'ws-delete': confirmBox('Delete this workspace?', 'All assets, reports and users in this browser will be erased. You will need to create a new workspace.', 'Delete everything', function () { lsDel(KEY); lsDel(SKEY); DB = null; closeModal(); location.hash = '#/register'; render(); }); break;
    }
});

document.addEventListener('input', function (e) {
    var t = e.target, k = t.dataset && t.dataset.in;
    if (!k) return;
    if (k === 'q') { ui.q = t.value; ui.page = 1; $('#assetsBody').innerHTML = assetsTable(currentUser()); }
});
document.addEventListener('change', function (e) {
    var t = e.target, k = t.dataset && t.dataset.in, user = currentUser();
    if (e.target.id === 'bkAll') { $$('.bk').forEach(function (c) { c.checked = t.checked; }); return; }
    if (!k) return;
    if (k === 'cat' || k === 'loc' || k === 'st') { ui[k] = t.value; ui.page = 1; $('#assetsBody').innerHTML = assetsTable(user); }
    else if (k === 'qrsel') { ui.qrId = t.value; render(); }
    else if (k === 'rpasset') { var a = assetById(t.value); var l = $('#rpLoc'); if (l) l.value = a ? a.location : ''; }
    else if (k === 'assign') { var r = DB.reports.filter(function (x) { return x.id === t.dataset.id; })[0]; if (r) { r.assigned = t.value; save(); toast('Assigned to ' + t.value); } }
    else if (k === 'role') { var u = DB.users.filter(function (x) { return x.id === t.dataset.id; })[0]; if (u) {
        if (u.role === 'Admin' && t.value !== 'Admin' && DB.users.filter(function (x) { return x.role === 'Admin'; }).length < 2) { toast('There must be at least one Admin.'); render(); return; }
        u.role = t.value; save(); toast(u.name + ' is now ' + t.value); } }
});

document.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, kind = f.dataset.form, user = currentUser(), err;
    if (!kind) return;
    $$('.error', f.parentNode).forEach(function (x) { if (x.id) x.classList.add('hide'); });

    if (kind === 'login') {
        var who = $('#lgUser').value.trim().toLowerCase(), pw = $('#lgPass').value;
        if (!who || !pw) return showErr('Enter your username and password.');
        var u = DB && DB.users.filter(function (x) { return x.username.toLowerCase() === who || x.email.toLowerCase() === who; })[0];
        if (!u) return showErr('Username or password is incorrect.');
        hashPw(pw, u.salt).then(function (h) {
            if (h !== u.hash) return showErr('Username or password is incorrect.');
            lsSet(SKEY, u.id); go('dashboard');
        });
    }
    else if (kind === 'register') {
        var ws = $('#rgWs').value.trim(), name = $('#rgName').value.trim(), un = $('#rgUser').value.trim(), mail = $('#rgMail').value.trim(), p1 = $('#rgPass').value, p2 = $('#rgPass2').value;
        if (!ws || !name || !un || !mail || !p1) return showErr('Please fill in every field.');
        if (!/^\S+@\S+\.\S+$/.test(mail)) return showErr('Enter a valid email address.');
        if (!/^[A-Za-z0-9._-]{3,30}$/.test(un)) return showErr('Username can use letters, numbers, dot, dash and underscore (3-30 characters).');
        if (p1.length < 6) return showErr('Password needs at least 6 characters.');
        if (p1 !== p2) return showErr('The two passwords do not match.');
        var make = function () {
            buildWorkspace({ workspace: ws, name: name, username: un, email: mail, password: p1, sample: $('#rgSample').checked }).then(function (db) {
                DB = db; save(); lsSet(SEEDED, '1'); lsSet(SKEY, db.users[0].id); ui = { q: '', cat: '', loc: '', st: '', page: 1, tab: 'All', qrId: null, sidebar: false };
                go('dashboard'); toast('Workspace created. Welcome, ' + name.split(' ')[0] + '!');
            });
        };
        if (DB) confirmBox('Replace the existing workspace?', 'A workspace already exists in this browser. Creating a new one erases it.', 'Replace', function () { closeModal(); make(); });
        else make();
    }
    else if (kind === 'asset') {
        var an = $('#asName').value.trim(), ac = $('#asCat').value.trim(), al = $('#asLoc').value.trim(), as = $('#asSt').value;
        if (!an) return showErr('Enter an asset name.');
        if (!ac || !al) return showErr('Enter a category and a location.');
        if (f.dataset.id) { var ex = assetById(f.dataset.id); ex.name = an; ex.category = ac; ex.location = al; ex.status = as; toast('Asset updated'); }
        else { DB.assets.push({ id: nextAssetId(), name: an, category: ac, location: al, status: as, created: Date.now() }); toast('Asset added'); }
        save(); closeModal(); render();
    }
    else if (kind === 'report') {
        var aid = $('#rpAsset').value, text = $('#rpText').value.trim();
        if (!aid) return showErr('Choose which asset has the problem.');
        if (!text) return showErr('Please describe the problem.');
        DB.reports.unshift({ id: uid(), assetId: aid, issue: text, status: 'Open', assigned: 'Unassigned', date: Date.now(), by: user ? user.name : 'Anonymous' });
        save(); go('submitted');
    }
    else if (kind === 'user') {
        var n1 = $('#uName').value.trim(), u1 = $('#uUser').value.trim(), m1 = $('#uMail').value.trim(), r1 = $('#uRole').value, pw1 = $('#uPass').value;
        if (!n1 || !u1 || !m1 || !pw1) return showErr('Please fill in every field.');
        if (!/^\S+@\S+\.\S+$/.test(m1)) return showErr('Enter a valid email address.');
        if (pw1.length < 6) return showErr('Password needs at least 6 characters.');
        if (DB.users.some(function (x) { return x.username.toLowerCase() === u1.toLowerCase() || x.email.toLowerCase() === m1.toLowerCase(); })) return showErr('That username or email is already used.');
        newUser(n1, u1, m1, r1, pw1).then(function (nu) { DB.users.push(nu); save(); closeModal(); render(); toast('User added'); });
    }
    else if (kind === 'profile') {
        var pn = $('#stName').value.trim(), pu = $('#stUser').value.trim(), pm = $('#stMail').value.trim();
        if (!pn || !pu || !pm) return showErr('Please fill in every field.');
        if (!/^\S+@\S+\.\S+$/.test(pm)) return showErr('Enter a valid email address.');
        if (DB.users.some(function (x) { return x.id !== user.id && (x.username.toLowerCase() === pu.toLowerCase() || x.email.toLowerCase() === pm.toLowerCase()); })) return showErr('That username or email is already used.');
        user.name = pn; user.username = pu; user.email = pm; save(); render(); toast('Profile saved');
    }
    else if (kind === 'password') {
        var o = $('#pwOld').value, n = $('#pwNew').value, n2 = $('#pwNew2').value;
        if (!o || !n) return showErr('Fill in the current and new password.', 'formErr2');
        if (n.length < 6) return showErr('New password needs at least 6 characters.', 'formErr2');
        if (n !== n2) return showErr('The new passwords do not match.', 'formErr2');
        hashPw(o, user.salt).then(function (h) {
            if (h !== user.hash) return showErr('Current password is incorrect.', 'formErr2');
            var salt = uid() + uid();
            hashPw(n, salt).then(function (nh) { user.salt = salt; user.hash = nh; save(); f.reset(); toast('Password updated'); });
        });
    }
    else if (kind === 'workspace') {
        var wn = $('#wsName').value.trim(); if (!wn) return;
        DB.workspace = wn; save(); render(); toast('Workspace saved');
    }
    else if (kind === 'bulk') { showBulk($$('.bk').filter(function (c) { return c.checked; }).map(function (c) { return c.value; })); }
});
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); closeMenu(); } });

/* ---------------------------------------------------------
   9. START
   --------------------------------------------------------- */
function start() {
    DB = loadDB();
    if (!DB && !lsGet(SEEDED)) {
        // First visit: create a demo workspace so there is something to look at.
        buildWorkspace({ workspace: 'STI College - Gentri Workspace', name: 'Admin', username: 'admin', email: 'admin@assettrack.local', password: 'admin123', sample: true }).then(function (db) {
            DB = db; save(); lsSet(SEEDED, '1'); render();
        });
    } else render();
}
start();

})();
