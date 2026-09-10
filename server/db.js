// ---------------------------------------------------------------------------
// Pure-JS data store — a single JSON file, no native dependencies at all.
// Two Railway builds in a row failed on native npm modules (rolldown, then
// better-sqlite3) needing a C++ toolchain the build image didn't reliably
// provide. This trades a little bit of database rigor for something that
// simply always works: plain objects in memory, persisted to disk on every
// mutation. Perfectly fine at this app's scale (a sales team, not millions
// of rows).
// ---------------------------------------------------------------------------
const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data", "salesquest.json");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

function seedData() {
  const demoPasswordHash = bcrypt.hashSync("demo123", 10);
  const demoManagers = [
    { id: "m1", name: "Алексей", email: "alexei@qgroup.demo", avatar: "АЛ", role: "manager" },
    { id: "m2", name: "Дмитрий", email: "dmitri@qgroup.demo", avatar: "ДМ", role: "manager" },
    { id: "m3", name: "Ирина", email: "irina@qgroup.demo", avatar: "ИР", role: "manager" },
    { id: "m4", name: "Сергей", email: "sergei@qgroup.demo", avatar: "СЕ", role: "manager" },
    { id: "m5", name: "Андрей", email: "andrei@qgroup.demo", avatar: "АН", role: "manager" },
    { id: "m6", name: "Ольга (РОП)", email: "olga@qgroup.demo", avatar: "ОР", role: "rop" },
  ];

  const accounts = demoManagers.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    passwordHash: demoPasswordHash,
    role: m.role,
    status: "approved",
    avatar: m.avatar,
    level: 1,
    xp: 0,
    coins: 0,
    totalCashBonus: 0,
    questsCompleted: 0,
    streak: 0,
    lastSaleDate: null,
  }));

  const nowIso = new Date().toISOString();
  const products = [
    { id: "p1", name: "Seagate Skyhawk HDD 8TB", sku: "ST8000VX010", category: "Storage", description: "Жёсткий диск для видеонаблюдения 24/7, оптимизирован под NVR-нагрузку.", price: 189, stock: 200, initialStock: 200, imageUrl: null, soldCount: 0 },
    { id: "p2", name: "Hikvision DS-2CD2143G2-I", sku: "IPC-2143G2", category: "IP Camera", description: "4MP купольная IP-камера с ИК-подсветкой до 30м и AcuSense-детекцией.", price: 96, stock: 80, initialStock: 80, imageUrl: null, soldCount: 0 },
    { id: "p3", name: "Hikvision DS-7616NI-K2 NVR", sku: "NVR-7616K2", category: "NVR", description: "16-канальный сетевой видеорегистратор с поддержкой 4K вывода.", price: 340, stock: 40, initialStock: 40, imageUrl: null, soldCount: 0 },
    { id: "p4", name: "HiLook IPC-B140H", sku: "HL-B140H", category: "IP Camera", description: "Бюджетная 4MP цилиндрическая камера, ИК до 30м, EXIR-технология.", price: 54, stock: 60, initialStock: 60, imageUrl: null, soldCount: 0 },
    { id: "p5", name: "Hikvision DS-K1T343 Access Terminal", sku: "AC-K1T343", category: "Access Control", description: "Терминал контроля доступа с распознаванием лиц и картой Mifare.", price: 410, stock: 60, initialStock: 60, imageUrl: null, soldCount: 0 },
    { id: "p6", name: "WD Purple Surveillance HDD 4TB", sku: "WD40PURZ", category: "Storage", description: "Диск для видеонаблюдения с AllFrame AI, до 64 камер на один диск.", price: 112, stock: 150, initialStock: 150, imageUrl: null, soldCount: 0 },
    { id: "p7", name: "Hikvision DS-2DE4425IW-DE PTZ", sku: "PTZ-4425", category: "PTZ Camera", description: "4MP PTZ-камера с 25x оптическим зумом и автослежением.", price: 780, stock: 20, initialStock: 20, imageUrl: null, soldCount: 0 },
    { id: "p8", name: "HiLook NVR-108MH-D/8P", sku: "HL-108MHD8P", category: "NVR", description: "8-канальный NVR со встроенным PoE-коммутатором на 8 портов.", price: 165, stock: 50, initialStock: 50, imageUrl: null, soldCount: 0 },
    { id: "p9", name: "Hikvision VMS License Pack 32ch", sku: "LIC-VMS32", category: "Software", description: "Лицензия на управление видео для 32 каналов, бессрочная.", price: 520, stock: 48, initialStock: 48, imageUrl: null, soldCount: 0 },
    { id: "p10", name: "Hikvision DS-K2604T Controller", sku: "AC-K2604T", category: "Access Control", description: "Контроллер доступа на 4 двери с поддержкой TCP/IP и RS-485.", price: 265, stock: 220, initialStock: 220, imageUrl: null, soldCount: 0 },
  ];

  const focusProducts = [
    { id: "fp1", productId: "p1", priority: "critical", xpReward: 5, coinReward: 6, cashBonus: 0, active: true, createdAt: nowIso },
    { id: "fp2", productId: "p5", priority: "critical", xpReward: 5, coinReward: 7, cashBonus: 0, active: true, createdAt: nowIso },
    { id: "fp3", productId: "p10", priority: "critical", xpReward: 5, coinReward: 6, cashBonus: 0, active: true, createdAt: nowIso },
    { id: "fp4", productId: "p3", priority: "high", xpReward: 3, coinReward: 4, cashBonus: 0, active: true, createdAt: nowIso },
    { id: "fp5", productId: "p7", priority: "high", xpReward: 3, coinReward: 5, cashBonus: 0, active: true, createdAt: nowIso },
    { id: "fp6", productId: "p4", priority: "normal", xpReward: 1, coinReward: 2, cashBonus: 0, active: true, createdAt: nowIso },
    { id: "fp7", productId: "p9", priority: "normal", xpReward: 1, coinReward: 2, cashBonus: 0, active: true, createdAt: nowIso },
  ];

  const rewards = [
    { id: "r1", name: "Ozon сертификат $50", description: "Электронный сертификат на покупки", costCoins: 100, icon: "gift" },
    { id: "r2", name: "Дополнительный выходной", description: "Один оплачиваемый день отдыха", costCoins: 200, icon: "sun" },
    { id: "r3", name: "Парковка на неделю", description: "Личное место у офиса", costCoins: 40, icon: "car" },
    { id: "r4", name: "Обед за счёт компании", description: "Любое кафе в бизнес-центре", costCoins: 25, icon: "utensils" },
    { id: "r5", name: "Беспроводные наушники", description: "Firm-brand ANC гарнитура", costCoins: 120, icon: "headphones" },
    { id: "r6", name: "Доп. отпуск (2 дня)", description: "Присоединяются к следующему отпуску", costCoins: 280, icon: "plane" },
  ];

  const achievements = [
    { id: "a1", name: "First Blood", description: "Первая зафиксированная продажа", icon: "zap" },
    { id: "a2", name: "10 Kills", description: "10 закрытых квестов", icon: "swords" },
    { id: "a3", name: "Stock Hunter", description: "Продано 50 единиц фокусных товаров", icon: "crosshair" },
    { id: "a4", name: "Weekend Warrior", description: "10 квестов за выходные", icon: "calendar" },
    { id: "a5", name: "Boss Slayer", description: "Участие в Boss Fight", icon: "skull" },
    { id: "a6", name: "Warehouse Destroyer", description: "Остаток критического товара снижен на 50%", icon: "warehouse" },
    { id: "a7", name: "Streak Master", description: "7 дней подряд с продажами", icon: "flame" },
    { id: "a8", name: "Top 3 Finisher", description: "Топ-3 в рейтинге месяца", icon: "medal" },
    { id: "a9", name: "Coin Collector", description: "Накоплено 250 Coins", icon: "coins" },
    { id: "a10", name: "Level 5", description: "Достигнут 5-й уровень", icon: "rocket" },
  ];

  const bossFights = [
    {
      id: "bf1",
      title: "Слить остаток Seagate Skyhawk 8TB",
      description: "Общий рывок отдела — закрываем самый залежавшийся SKU на складе.",
      targetSku: "ST8000VX010",
      targetQuantity: 100,
      currentQuantity: 0,
      deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      reward: "🍕 Пицца для отдела",
      active: true,
    },
    {
      id: "bf2",
      title: "Очистить Access Control остатки",
      description: "Совместная зачистка контроллеров DS-K2604T перед приходом новой партии.",
      targetSku: "AC-K2604T",
      targetQuantity: 80,
      currentQuantity: 0,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      reward: "🏖️ Пятница выходной для отдела",
      active: false,
    },
  ];

  return { accounts, products, focusProducts, bossFights, rewards, achievements, accountAchievements: [], sales: [], redemptions: [] };
}

function load() {
  if (fs.existsSync(DB_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    } catch {
      console.error("[db] Corrupt data file, reseeding.");
    }
  }
  const seeded = seedData();
  persist(seeded);
  console.log("[db] Seeded demo data.");
  return seeded;
}

function persist(state) {
  // Write-then-rename for a touch of crash safety — never leaves a half-written file.
  const tmpPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(state));
  fs.renameSync(tmpPath, DB_PATH);
}

const state = load();

/** Persist the current in-memory state to disk. Call after any mutation. */
function save() {
  persist(state);
}

module.exports = { state, save };
