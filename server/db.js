// ---------------------------------------------------------------------------
// SQLite database — single file, persisted via a Railway Volume mounted at
// DB_PATH (defaults to a local file for dev). Creates the schema on first
// run and seeds demo data if the accounts table is empty.
// ---------------------------------------------------------------------------
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("node:path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data", "salesquest.db");

// Ensure the data directory exists (for local dev without a mounted volume).
require("node:fs").mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('manager','rop','admin')),
    status TEXT NOT NULL CHECK(status IN ('pending','approved')) DEFAULT 'pending',
    avatar TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    coins INTEGER NOT NULL DEFAULT 0,
    quests_completed INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price REAL NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    initial_stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS focus_products (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    priority TEXT NOT NULL CHECK(priority IN ('critical','high','normal')),
    xp_reward INTEGER NOT NULL,
    coin_reward INTEGER NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS boss_fights (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    target_sku TEXT NOT NULL,
    target_quantity INTEGER NOT NULL,
    current_quantity INTEGER NOT NULL DEFAULT 0,
    deadline TEXT NOT NULL,
    reward TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS rewards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    cost_coins INTEGER NOT NULL,
    icon TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS account_achievements (
    account_id TEXT NOT NULL REFERENCES accounts(id),
    achievement_id TEXT NOT NULL REFERENCES achievements(id),
    unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (account_id, achievement_id)
  );

  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL REFERENCES accounts(id),
    focus_product_id TEXT NOT NULL REFERENCES focus_products(id),
    quantity INTEGER NOT NULL,
    xp_earned INTEGER NOT NULL,
    coins_earned INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS redemptions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL REFERENCES accounts(id),
    reward_id TEXT NOT NULL REFERENCES rewards(id),
    cost_coins INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ---------------------------------------------------------------------------
// Seed demo data once, only if the database is empty.
// ---------------------------------------------------------------------------
function seedIfEmpty() {
  const accountCount = db.prepare("SELECT COUNT(*) AS n FROM accounts").get().n;
  if (accountCount > 0) return;

  const demoPasswordHash = bcrypt.hashSync("demo123", 10);
  const insertAccount = db.prepare(`
    INSERT INTO accounts (id, name, email, password_hash, role, status, avatar, level, xp, coins, quests_completed, streak)
    VALUES (@id, @name, @email, @password_hash, @role, 'approved', @avatar, 1, 0, 0, 0, 0)
  `);
  const demoManagers = [
    { id: "m1", name: "Алексей", email: "alexei@qgroup.demo", avatar: "АЛ", role: "manager" },
    { id: "m2", name: "Дмитрий", email: "dmitri@qgroup.demo", avatar: "ДМ", role: "manager" },
    { id: "m3", name: "Ирина", email: "irina@qgroup.demo", avatar: "ИР", role: "manager" },
    { id: "m4", name: "Сергей", email: "sergei@qgroup.demo", avatar: "СЕ", role: "manager" },
    { id: "m5", name: "Андрей", email: "andrei@qgroup.demo", avatar: "АН", role: "manager" },
    { id: "m6", name: "Ольга (РОП)", email: "olga@qgroup.demo", avatar: "ОР", role: "rop" },
  ];
  for (const m of demoManagers) {
    insertAccount.run({ ...m, password_hash: demoPasswordHash });
  }

  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, sku, category, description, price, stock, initial_stock, image_url)
    VALUES (@id, @name, @sku, @category, @description, @price, @stock, @initial_stock, NULL)
  `);
  const products = [
    { id: "p1", name: "Seagate Skyhawk HDD 8TB", sku: "ST8000VX010", category: "Storage", description: "Жёсткий диск для видеонаблюдения 24/7, оптимизирован под NVR-нагрузку.", price: 189, stock: 200, initial_stock: 200 },
    { id: "p2", name: "Hikvision DS-2CD2143G2-I", sku: "IPC-2143G2", category: "IP Camera", description: "4MP купольная IP-камера с ИК-подсветкой до 30м и AcuSense-детекцией.", price: 96, stock: 80, initial_stock: 80 },
    { id: "p3", name: "Hikvision DS-7616NI-K2 NVR", sku: "NVR-7616K2", category: "NVR", description: "16-канальный сетевой видеорегистратор с поддержкой 4K вывода.", price: 340, stock: 40, initial_stock: 40 },
    { id: "p4", name: "HiLook IPC-B140H", sku: "HL-B140H", category: "IP Camera", description: "Бюджетная 4MP цилиндрическая камера, ИК до 30м, EXIR-технология.", price: 54, stock: 60, initial_stock: 60 },
    { id: "p5", name: "Hikvision DS-K1T343 Access Terminal", sku: "AC-K1T343", category: "Access Control", description: "Терминал контроля доступа с распознаванием лиц и картой Mifare.", price: 410, stock: 60, initial_stock: 60 },
    { id: "p6", name: "WD Purple Surveillance HDD 4TB", sku: "WD40PURZ", category: "Storage", description: "Диск для видеонаблюдения с AllFrame AI, до 64 камер на один диск.", price: 112, stock: 150, initial_stock: 150 },
    { id: "p7", name: "Hikvision DS-2DE4425IW-DE PTZ", sku: "PTZ-4425", category: "PTZ Camera", description: "4MP PTZ-камера с 25x оптическим зумом и автослежением.", price: 780, stock: 20, initial_stock: 20 },
    { id: "p8", name: "HiLook NVR-108MH-D/8P", sku: "HL-108MHD8P", category: "NVR", description: "8-канальный NVR со встроенным PoE-коммутатором на 8 портов.", price: 165, stock: 50, initial_stock: 50 },
    { id: "p9", name: "Hikvision VMS License Pack 32ch", sku: "LIC-VMS32", category: "Software", description: "Лицензия на управление видео для 32 каналов, бессрочная.", price: 520, stock: 48, initial_stock: 48 },
    { id: "p10", name: "Hikvision DS-K2604T Controller", sku: "AC-K2604T", category: "Access Control", description: "Контроллер доступа на 4 двери с поддержкой TCP/IP и RS-485.", price: 265, stock: 220, initial_stock: 220 },
  ];
  for (const p of products) insertProduct.run(p);

  const insertFocus = db.prepare(`
    INSERT INTO focus_products (id, product_id, priority, xp_reward, coin_reward, active)
    VALUES (@id, @product_id, @priority, @xp_reward, @coin_reward, 1)
  `);
  const focusProducts = [
    { id: "fp1", product_id: "p1", priority: "critical", xp_reward: 300, coin_reward: 120 },
    { id: "fp2", product_id: "p5", priority: "critical", xp_reward: 320, coin_reward: 130 },
    { id: "fp3", product_id: "p10", priority: "critical", xp_reward: 280, coin_reward: 110 },
    { id: "fp4", product_id: "p3", priority: "high", xp_reward: 250, coin_reward: 100 },
    { id: "fp5", product_id: "p7", priority: "high", xp_reward: 260, coin_reward: 105 },
    { id: "fp6", product_id: "p4", priority: "normal", xp_reward: 100, coin_reward: 35 },
    { id: "fp7", product_id: "p9", priority: "normal", xp_reward: 120, coin_reward: 45 },
  ];
  for (const fp of focusProducts) insertFocus.run(fp);

  const insertReward = db.prepare(`
    INSERT INTO rewards (id, name, description, cost_coins, icon) VALUES (@id, @name, @description, @cost_coins, @icon)
  `);
  const rewards = [
    { id: "r1", name: "Ozon сертификат $50", description: "Электронный сертификат на покупки", cost_coins: 2500, icon: "gift" },
    { id: "r2", name: "Дополнительный выходной", description: "Один оплачиваемый день отдыха", cost_coins: 5000, icon: "sun" },
    { id: "r3", name: "Парковка на неделю", description: "Личное место у офиса", cost_coins: 1200, icon: "car" },
    { id: "r4", name: "Обед за счёт компании", description: "Любое кафе в бизнес-центре", cost_coins: 800, icon: "utensils" },
    { id: "r5", name: "Беспроводные наушники", description: "Firm-brand ANC гарнитура", cost_coins: 3400, icon: "headphones" },
    { id: "r6", name: "Доп. отпуск (2 дня)", description: "Присоединяются к следующему отпуску", cost_coins: 8000, icon: "plane" },
  ];
  for (const r of rewards) insertReward.run(r);

  const insertAchievement = db.prepare(`
    INSERT INTO achievements (id, name, description, icon) VALUES (@id, @name, @description, @icon)
  `);
  const achievements = [
    { id: "a1", name: "First Blood", description: "Первая зафиксированная продажа", icon: "zap" },
    { id: "a2", name: "10 Kills", description: "10 закрытых квестов", icon: "swords" },
    { id: "a3", name: "Stock Hunter", description: "Продано 50 единиц фокусных товаров", icon: "crosshair" },
    { id: "a4", name: "Weekend Warrior", description: "10 квестов за выходные", icon: "calendar" },
    { id: "a5", name: "Boss Slayer", description: "Участие в Boss Fight", icon: "skull" },
    { id: "a6", name: "Warehouse Destroyer", description: "Остаток критического товара снижен на 50%", icon: "warehouse" },
    { id: "a7", name: "Streak Master", description: "7 дней подряд с продажами", icon: "flame" },
    { id: "a8", name: "Top 3 Finisher", description: "Топ-3 в рейтинге месяца", icon: "medal" },
    { id: "a9", name: "Coin Collector", description: "Накоплено 5000 Coins", icon: "coins" },
    { id: "a10", name: "Level 5", description: "Достигнут 5-й уровень", icon: "rocket" },
  ];
  for (const a of achievements) insertAchievement.run(a);

  const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const in5d = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const insertBoss = db.prepare(`
    INSERT INTO boss_fights (id, title, description, target_sku, target_quantity, current_quantity, deadline, reward, active)
    VALUES (@id, @title, @description, @target_sku, @target_quantity, 0, @deadline, @reward, @active)
  `);
  insertBoss.run({
    id: "bf1",
    title: "Слить остаток Seagate Skyhawk 8TB",
    description: "Общий рывок отдела — закрываем самый залежавшийся SKU на складе.",
    target_sku: "ST8000VX010",
    target_quantity: 100,
    deadline: in48h,
    reward: "🍕 Пицца для отдела",
    active: 1,
  });
  insertBoss.run({
    id: "bf2",
    title: "Очистить Access Control остатки",
    description: "Совместная зачистка контроллеров DS-K2604T перед приходом новой партии.",
    target_sku: "AC-K2604T",
    target_quantity: 80,
    deadline: in5d,
    reward: "🏖️ Пятница выходной для отдела",
    active: 0,
  });

  console.log("[db] Seeded demo data.");
}

seedIfEmpty();

module.exports = db;
