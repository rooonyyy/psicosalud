// Cliente de base de datos SIMULADA para PsicoSalud.
//
// Reemplaza al SDK de InsForge (servicio de pago) con la MISMA interfaz que usa
// la app:  client.database.from(...), client.functions.invoke(...),
//          client.storage.from(...), client.database.channel(...)
//
// Todo se guarda en localStorage del navegador, así que:
//   - no necesita internet, claves ni servidor
//   - los datos persisten al recargar la página
//   - para volver a los datos de ejemplo:  resetMockDb()  (o window.__resetMockDb() en consola)

import { buildSeed, newId } from './seed.js';

const DB_KEY = 'psicosalud_mock_db_v1';
const FILES_KEY = 'psicosalud_mock_files_v1';

// ── Persistencia (localStorage con respaldo en memoria) ───────────────────────
let memoryDb = null;
let memoryFiles = null;

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function loadDb() {
  let db = readJson(DB_KEY) || memoryDb;
  if (!db) {
    db = buildSeed();
    saveDb(db);
  }
  return db;
}

function saveDb(db) {
  memoryDb = db;
  writeJson(DB_KEY, db);
}

function loadFiles() {
  return readJson(FILES_KEY) || memoryFiles || {};
}

function saveFiles(files) {
  memoryFiles = files;
  return writeJson(FILES_KEY, files);
}

export function resetMockDb() {
  try {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(FILES_KEY);
  } catch { /* sin localStorage */ }
  memoryDb = null;
  memoryFiles = null;
  blobCache.clear();
  saveDb(buildSeed());
  notify(null);
}

// ── Eventos "en tiempo real" ──────────────────────────────────────────────────
const listeners = new Set();

function notify(table, event = '*') {
  listeners.forEach(fn => {
    try { fn(table, event); } catch (e) { console.error(e); }
  });
}

if (typeof window !== 'undefined') {
  // Si otra pestaña modifica la base, avisamos a esta también
  window.addEventListener('storage', (e) => {
    if (e.key === DB_KEY) notify(null);
  });
}

// ── Utilidades ────────────────────────────────────────────────────────────────
const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

const same = (a, b) => {
  if (a === null || a === undefined || b === null || b === undefined) return false;
  return String(a) === String(b);
};

const RELATIONS = {
  quizzes: {
    questions: { type: 'many', table: 'questions', fk: 'quiz_id' }
  },
  intervenciones: {
    areas: { type: 'one', table: 'areas', fk: 'area_id' },
    users: { type: 'one', table: 'users', fk: 'especialista_id' }
  }
};

// Restricciones UNIQUE del esquema original
const UNIQUE = {
  users: [{ col: 'email', msg: 'El correo electrónico ya está registrado', ci: true }],
  quizzes: [{ col: 'codigoArea', msg: 'duplicate key value violates unique constraint "quizzes_codigoArea_key"', ci: true }]
};

const dbError = (message, code = 'MOCK_ERROR') => ({ message, code });

// Divide "*, questions(*)" respetando paréntesis
function parseSelect(str) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of str) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur.trim());

  return parts.map(p => {
    const m = p.match(/^(\w+)\((.*)\)$/);
    return m ? { rel: m[1], cols: m[2].trim() || '*' } : { col: p };
  });
}

function project(row, cols) {
  if (!cols || cols === '*') return { ...row };
  const out = {};
  cols.split(',').map(c => c.trim()).forEach(c => {
    if (c === '*') Object.assign(out, row);
    else if (c) out[c] = row[c];
  });
  return out;
}

// ── Archivos (Storage simulado) ───────────────────────────────────────────────
const blobCache = new Map();

function dataUrlToBlobUrl(key, entry) {
  if (blobCache.has(key)) return blobCache.get(key);
  try {
    const [head, b64] = entry.dataUrl.split(',');
    const mime = (head.match(/data:(.*?);base64/) || [])[1] || 'application/octet-stream';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
    blobCache.set(key, url);
    return url;
  } catch {
    return null;
  }
}

const MOCK_URL_PREFIX = 'mock-storage://';

function resolveFileUrl(url) {
  if (typeof url !== 'string' || !url.startsWith(MOCK_URL_PREFIX)) return url;
  const key = url.slice(MOCK_URL_PREFIX.length);
  const entry = loadFiles()[key];
  return entry ? dataUrlToBlobUrl(key, entry) : null;
}

// ── Constructor de consultas (imita a PostgREST) ──────────────────────────────
class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.op = 'select';
    this.filters = [];
    this.orders = [];
    this.limitN = null;
    this.cols = '*';
    this.opts = {};
    this.payload = null;
    this.wantRows = false;
    this.mode = 'many'; // many | single | maybeSingle
  }

  select(cols = '*', opts = {}) {
    this.cols = cols || '*';
    if (this.op === 'select') this.opts = opts || {};
    else this.wantRows = true;
    return this;
  }

  insert(payload) { this.op = 'insert'; this.payload = payload; return this; }
  update(payload) { this.op = 'update'; this.payload = payload; return this; }
  delete() { this.op = 'delete'; return this; }

  eq(col, val) {
    this.filters.push(r => (val === null ? r[col] == null : same(r[col], val)));
    return this;
  }
  neq(col, val) {
    this.filters.push(r => r[col] != null && !same(r[col], val));
    return this;
  }
  in(col, arr) {
    const set = (arr || []).map(String);
    this.filters.push(r => r[col] != null && set.includes(String(r[col])));
    return this;
  }
  order(col, { ascending = true } = {}) {
    this.orders.push({ col, ascending });
    return this;
  }
  limit(n) { this.limitN = n; return this; }
  single() { this.mode = 'single'; return this; }
  maybeSingle() { this.mode = 'maybeSingle'; return this; }

  then(onFulfilled, onRejected) {
    return Promise.resolve().then(() => this._run()).then(onFulfilled, onRejected);
  }
  catch(onRejected) { return this.then(undefined, onRejected); }
  finally(fn) { return this.then(v => { fn?.(); return v; }, e => { fn?.(); throw e; }); }

  // -- ejecución --------------------------------------------------------------
  _run() {
    try {
      const db = loadDb();
      if (!Array.isArray(db[this.table])) {
        return { data: null, error: dbError(`relation "public.${this.table}" does not exist`, '42P01') };
      }
      if (this.op === 'select') return this._select(db);
      if (this.op === 'insert') return this._insert(db);
      if (this.op === 'update') return this._update(db);
      return this._delete(db);
    } catch (e) {
      console.error('[mockDb]', e);
      return { data: null, error: dbError(e.message || 'Error en la base simulada') };
    }
  }

  _matches(db) {
    return db[this.table].filter(r => this.filters.every(f => f(r)));
  }

  _sort(rows) {
    if (!this.orders.length) return rows;
    return [...rows].sort((a, b) => {
      for (const { col, ascending } of this.orders) {
        const va = a[col];
        const vb = b[col];
        if (va === vb) continue;
        if (va == null) return ascending ? 1 : -1;
        if (vb == null) return ascending ? -1 : 1;
        let cmp;
        if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
        else cmp = String(va).localeCompare(String(vb), 'es', { numeric: true });
        if (cmp !== 0) return ascending ? cmp : -cmp;
      }
      return 0;
    });
  }

  _shape(db, row, cols) {
    const tokens = parseSelect(cols || '*');
    const out = {};
    tokens.forEach(t => {
      if (t.rel) {
        const rel = RELATIONS[this.table]?.[t.rel];
        if (!rel) return;
        if (rel.type === 'many') {
          out[t.rel] = db[rel.table]
            .filter(r => same(r[rel.fk], row.id))
            .map(r => project(r, t.cols));
        } else {
          const target = db[rel.table].find(r => same(r.id, row[rel.fk]));
          out[t.rel] = target ? project(sanitize(rel.table, target), t.cols) : null;
        }
      } else {
        Object.assign(out, project(row, t.col));
      }
    });
    const clean = sanitize(this.table, out);
    return clone(clean);
  }

  _finish(rows, db, extra = {}) {
    const shaped = rows.map(r => this._shape(db, r, this.cols));
    if (this.mode === 'single') {
      if (shaped.length !== 1) {
        return { data: null, error: dbError('JSON object requested, multiple (or no) rows returned', 'PGRST116'), ...extra };
      }
      return { data: shaped[0], error: null, ...extra };
    }
    if (this.mode === 'maybeSingle') {
      if (shaped.length > 1) {
        return { data: null, error: dbError('JSON object requested, multiple (or no) rows returned', 'PGRST116'), ...extra };
      }
      return { data: shaped[0] ?? null, error: null, ...extra };
    }
    return { data: shaped, error: null, ...extra };
  }

  _select(db) {
    let rows = this._matches(db);
    const count = rows.length;
    const extra = this.opts.count ? { count } : {};

    if (this.opts.head) return { data: null, error: null, ...extra };

    rows = this._sort(rows);
    if (this.limitN != null) rows = rows.slice(0, this.limitN);
    return this._finish(rows, db, extra);
  }

  _checkUnique(db, row, ignoreId = null) {
    const rules = UNIQUE[this.table] || [];
    for (const { col, msg, ci } of rules) {
      const v = row[col];
      if (v == null || v === '') continue;
      const clash = db[this.table].some(r => {
        if (ignoreId != null && same(r.id, ignoreId)) return false;
        const rv = r[col];
        if (rv == null) return false;
        return ci ? String(rv).toLowerCase() === String(v).toLowerCase() : String(rv) === String(v);
      });
      if (clash) return dbError(msg, '23505');
    }
    return null;
  }

  _insert(db) {
    const items = Array.isArray(this.payload) ? this.payload : [this.payload];
    const created = [];

    for (const item of items) {
      const row = { ...clone(item) };
      if (row.id === undefined) {
        row.id = this.table === 'areas'
          ? db.areas.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0) + 1
          : newId();
      }
      if (this.table === 'areas' && row.total_trabajadores == null) row.total_trabajadores = 0;
      if (row.created_at === undefined) row.created_at = new Date().toISOString();

      const err = this._checkUnique(db, row);
      if (err) return { data: null, error: err };

      db[this.table].push(row);
      created.push(row);
    }

    saveDb(db);
    notify(this.table, 'INSERT');
    if (!this.wantRows) return { data: null, error: null };
    return this._finish(created, db);
  }

  _update(db) {
    const rows = this._matches(db);
    const patch = clone(this.payload) || {};
    delete patch.id;

    for (const r of rows) {
      const err = this._checkUnique(db, { ...r, ...patch }, r.id);
      if (err) return { data: null, error: err };
    }
    rows.forEach(r => Object.assign(r, patch));

    saveDb(db);
    notify(this.table, 'UPDATE');
    if (!this.wantRows) return { data: null, error: null };
    return this._finish(rows, db);
  }

  _delete(db) {
    const rows = this._matches(db);
    const ids = new Set(rows.map(r => String(r.id)));
    db[this.table] = db[this.table].filter(r => !ids.has(String(r.id)));

    // Comportamiento en cascada del esquema original
    if (this.table === 'areas') {
      db.intervenciones = db.intervenciones.filter(i => !ids.has(String(i.area_id)));
    } else if (this.table === 'quizzes') {
      db.questions = db.questions.filter(q => !ids.has(String(q.quiz_id)));
    } else if (this.table === 'users') {
      db.intervenciones.forEach(i => { if (ids.has(String(i.especialista_id))) i.especialista_id = null; });
    } else if (this.table === 'intervenciones') {
      db.reports.forEach(r => { if (ids.has(String(r.intervencion_id))) r.intervencion_id = null; });
    }

    saveDb(db);
    notify(this.table, 'DELETE');
    if (!this.wantRows) return { data: null, error: null };
    return this._finish(rows, db);
  }
}

// Nunca devolvemos el hash de contraseña al front; los archivos se resuelven a URL local
function sanitize(table, row) {
  if (!row) return row;
  let out = row;
  if (table === 'users' && 'password' in out) {
    out = { ...out };
    delete out.password;
  }
  if (table === 'reports' && out.archivo_url) {
    out = { ...out, archivo_url: resolveFileUrl(out.archivo_url) };
  }
  return out;
}

// ── "Edge Functions" simuladas ────────────────────────────────────────────────
async function sha256(text) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // crypto.subtle solo existe en HTTPS/localhost; respaldo simple para la demo
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return 'fallback-' + (h >>> 0).toString(16);
  }
}

const withoutPassword = (u) => {
  const copy = { ...u };
  delete copy.password;
  return copy;
};

const FUNCTIONS = {
  async 'auth-login'({ email, password }) {
    if (!email || !password) throw Object.assign(new Error('Faltan campos obligatorios'), { status: 400 });
    const db = loadDb();
    const user = db.users.find(u => String(u.email).toLowerCase() === String(email).toLowerCase());
    const hash = await sha256(password);
    if (!user || user.password !== hash) {
      throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
    }
    return { user: clone(withoutPassword(user)), token: `mock-token-${user.id}-${Date.now()}` };
  },

  async 'create-user'({ email, password, nombre, apellido1, apellido2, rol, iniciales }) {
    if (!email || !password || !nombre || !apellido1 || !rol) {
      throw Object.assign(new Error('Faltan campos obligatorios'), { status: 400 });
    }
    const db = loadDb();
    if (db.users.some(u => String(u.email).toLowerCase() === String(email).toLowerCase())) {
      throw Object.assign(new Error('El correo electrónico ya está registrado'), { status: 409 });
    }
    const row = {
      id: newId(),
      email,
      password: await sha256(password),
      nombre,
      apellido1,
      apellido2: apellido2 || '',
      rol,
      iniciales: iniciales || null,
      created_at: new Date().toISOString()
    };
    db.users.push(row);
    saveDb(db);
    notify('users', 'INSERT');
    return clone(withoutPassword(row));
  },

  async 'update-user'({ id, email, password, nombre, apellido1, apellido2, rol, iniciales }) {
    if (!id) throw Object.assign(new Error('Falta el ID del usuario'), { status: 400 });
    const db = loadDb();
    const user = db.users.find(u => same(u.id, id));
    if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

    if (email !== undefined && db.users.some(u => !same(u.id, id) && String(u.email).toLowerCase() === String(email).toLowerCase())) {
      throw Object.assign(new Error('El correo electrónico ya está registrado'), { status: 409 });
    }
    if (email !== undefined) user.email = email;
    if (nombre !== undefined) user.nombre = nombre;
    if (apellido1 !== undefined) user.apellido1 = apellido1;
    if (apellido2 !== undefined) user.apellido2 = apellido2;
    if (rol !== undefined) user.rol = rol;
    if (iniciales !== undefined) user.iniciales = iniciales;
    if (password) user.password = await sha256(password);

    saveDb(db);
    notify('users', 'UPDATE');
    return clone(withoutPassword(user));
  }
};

// ── Cliente público (misma forma que el SDK de InsForge) ──────────────────────
export function createMockClient() {
  return {
    database: {
      from: (table) => new QueryBuilder(table),

      // Realtime simulado: avisa cuando cambia una tabla (en esta u otra pestaña)
      channel(name) {
        const handlers = [];
        let active = null;
        const channel = {
          name,
          on(_type, filter, callback) {
            handlers.push({ filter: filter || {}, callback });
            return channel;
          },
          subscribe() {
            active = (table, event) => {
              handlers.forEach(({ filter, callback }) => {
                const tableOk = !filter.table || table === null || filter.table === table;
                const eventOk = !filter.event || filter.event === '*' || event === '*' || filter.event === event;
                if (tableOk && eventOk) callback({ table, eventType: event });
              });
            };
            listeners.add(active);
            return channel;
          },
          unsubscribe() {
            if (active) listeners.delete(active);
            active = null;
          }
        };
        return channel;
      }
    },

    functions: {
      async invoke(name, { body } = {}) {
        const fn = FUNCTIONS[name];
        if (!fn) {
          return { data: null, error: { message: `La función "${name}" no está disponible en modo simulado`, status: 404 } };
        }
        try {
          const data = await fn(body || {});
          return { data, error: null };
        } catch (e) {
          return { data: null, error: { message: e.message, status: e.status || 500 } };
        }
      }
    },

    storage: {
      from(bucket) {
        const keyOf = (path) => `${bucket}/${path}`;
        return {
          async upload(path, file) {
            try {
              const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(file);
              });
              const files = loadFiles();
              files[keyOf(path)] = { dataUrl, type: file.type, name: file.name, size: file.size };
              if (!saveFiles(files)) {
                delete files[keyOf(path)];
                memoryFiles = files; // se mantiene solo durante la sesión
                return {
                  data: null,
                  error: { message: 'El archivo es demasiado grande para la base simulada (límite ~5 MB del navegador).' }
                };
              }
              return { data: { path, key: path, url: MOCK_URL_PREFIX + keyOf(path) }, error: null };
            } catch (e) {
              return { data: null, error: { message: e.message || 'No se pudo guardar el archivo' } };
            }
          },

          getPublicUrl(path) {
            return { data: { publicUrl: MOCK_URL_PREFIX + keyOf(path) } };
          },

          async download(path) {
            const entry = loadFiles()[keyOf(path)];
            if (!entry) return { data: null, error: { message: 'Archivo no encontrado' } };
            const res = await fetch(entry.dataUrl);
            return { data: await res.blob(), error: null };
          },

          async remove(paths) {
            const files = loadFiles();
            (paths || []).forEach(p => {
              delete files[keyOf(p)];
              blobCache.delete(keyOf(p));
            });
            saveFiles(files);
            return { data: null, error: null };
          }
        };
      }
    }
  };
}

if (typeof window !== 'undefined') {
  window.__resetMockDb = resetMockDb;
}
