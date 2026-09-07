import type {
  Product,
  FocusProduct,
  Manager,
  Reward,
  BossFight,
  Achievement,
} from "../types/sales";

// ---------------------------------------------------------------------------
// PRODUCTS — realistic B2B security / IT distribution catalogue
// ---------------------------------------------------------------------------
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Seagate Skyhawk HDD 8TB", sku: "ST8000VX010", category: "Storage", description: "Жёсткий диск для видеонаблюдения 24/7, оптимизирован под NVR-нагрузку.", price: 189, stock: 200, initialStock: 200, stockAgeDays: 182, marginPercent: 9 },
  { id: "p2", name: "Hikvision DS-2CD2143G2-I", sku: "IPC-2143G2", category: "IP Camera", description: "4MP купольная IP-камера с ИК-подсветкой до 30м и AcuSense-детекцией.", price: 96, stock: 80, initialStock: 80, stockAgeDays: 64, marginPercent: 18 },
  { id: "p3", name: "Hikvision DS-7616NI-K2 NVR", sku: "NVR-7616K2", category: "NVR", description: "16-канальный сетевой видеорегистратор с поддержкой 4K вывода.", price: 340, stock: 40, initialStock: 40, stockAgeDays: 41, marginPercent: 27 },
  { id: "p4", name: "HiLook IPC-B140H", sku: "HL-B140H", category: "IP Camera", description: "Бюджетная 4MP цилиндрическая камера, ИК до 30м, EXIR-технология.", price: 54, stock: 60, initialStock: 60, stockAgeDays: 33, marginPercent: 14 },
  { id: "p5", name: "Hikvision DS-K1T343 Access Terminal", sku: "AC-K1T343", category: "Access Control", description: "Терминал контроля доступа с распознаванием лиц и картой Mifare.", price: 410, stock: 60, initialStock: 60, stockAgeDays: 205, marginPercent: 22 },
  { id: "p6", name: "WD Purple Surveillance HDD 4TB", sku: "WD40PURZ", category: "Storage", description: "Диск для видеонаблюдения с AllFrame AI, до 64 камер на один диск.", price: 112, stock: 150, initialStock: 150, stockAgeDays: 148, marginPercent: 8 },
  { id: "p7", name: "Hikvision DS-2DE4425IW-DE PTZ", sku: "PTZ-4425", category: "PTZ Camera", description: "4MP PTZ-камера с 25x оптическим зумом и автослежением.", price: 780, stock: 20, initialStock: 20, stockAgeDays: 22, marginPercent: 31 },
  { id: "p8", name: "HiLook NVR-108MH-D/8P", sku: "HL-108MHD8P", category: "NVR", description: "8-канальный NVR со встроенным PoE-коммутатором на 8 портов.", price: 165, stock: 50, initialStock: 50, stockAgeDays: 97, marginPercent: 19 },
  { id: "p9", name: "Hikvision VMS License Pack 32ch", sku: "LIC-VMS32", category: "Software", description: "Лицензия на управление видео для 32 каналов, бессрочная.", price: 520, stock: 48, initialStock: 48, stockAgeDays: 15, marginPercent: 42 },
  { id: "p10", name: "Hikvision DS-K2604T Controller", sku: "AC-K2604T", category: "Access Control", description: "Контроллер доступа на 4 двери с поддержкой TCP/IP и RS-485.", price: 265, stock: 220, initialStock: 220, stockAgeDays: 233, marginPercent: 11 },
];

// ---------------------------------------------------------------------------
// FOCUS PRODUCTS — currently promoted by the ROP
// ---------------------------------------------------------------------------
export const FOCUS_PRODUCTS: FocusProduct[] = [
  { id: "fp1", productId: "p1", priority: "critical", xpReward: 300, coinReward: 120, active: true },
  { id: "fp2", productId: "p5", priority: "critical", xpReward: 320, coinReward: 130, active: true },
  { id: "fp3", productId: "p10", priority: "critical", xpReward: 280, coinReward: 110, active: true },
  { id: "fp4", productId: "p3", priority: "high", xpReward: 250, coinReward: 100, active: true },
  { id: "fp5", productId: "p7", priority: "high", xpReward: 260, coinReward: 105, active: true },
  { id: "fp6", productId: "p4", priority: "normal", xpReward: 100, coinReward: 35, active: true },
  { id: "fp7", productId: "p9", priority: "normal", xpReward: 120, coinReward: 45, active: true },
];

// ---------------------------------------------------------------------------
// MANAGERS
// ---------------------------------------------------------------------------
export const MANAGERS: Manager[] = [
  { id: "m1", name: "Алексей", avatar: "АЛ", level: 1, xp: 0, coins: 0, questsCompleted: 0, streak: 0, role: "manager" },
  { id: "m2", name: "Дмитрий", avatar: "ДМ", level: 1, xp: 0, coins: 0, questsCompleted: 0, streak: 0, role: "manager" },
  { id: "m3", name: "Ирина", avatar: "ИР", level: 1, xp: 0, coins: 0, questsCompleted: 0, streak: 0, role: "manager" },
  { id: "m4", name: "Сергей", avatar: "СЕ", level: 1, xp: 0, coins: 0, questsCompleted: 0, streak: 0, role: "manager" },
  { id: "m5", name: "Андрей", avatar: "АН", level: 1, xp: 0, coins: 0, questsCompleted: 0, streak: 0, role: "manager" },
  { id: "m6", name: "Ольга (РОП)", avatar: "ОР", level: 1, xp: 0, coins: 0, questsCompleted: 0, streak: 0, role: "rop" },
];

export const CURRENT_MANAGER_ID = "m2"; // "Дмитрий" — matches the spec's demo profile

// ---------------------------------------------------------------------------
// REWARD STORE
// ---------------------------------------------------------------------------
export const REWARDS: Reward[] = [
  { id: "r1", name: "Ozon сертификат $50", description: "Электронный сертификат на покупки", costCoins: 2500, icon: "gift" },
  { id: "r2", name: "Дополнительный выходной", description: "Один оплачиваемый день отдыха", costCoins: 5000, icon: "sun" },
  { id: "r3", name: "Парковка на неделю", description: "Личное место у офиса", costCoins: 1200, icon: "car" },
  { id: "r4", name: "Обед за счёт компании", description: "Любое кафе в бизнес-центре", costCoins: 800, icon: "utensils" },
  { id: "r5", name: "Беспроводные наушники", description: "Firm-brand ANC гарнитура", costCoins: 3400, icon: "headphones" },
  { id: "r6", name: "Доп. отпуск (2 дня)", description: "Присоединяются к следующему отпуску", costCoins: 8000, icon: "plane" },
];

// ---------------------------------------------------------------------------
// BOSS FIGHTS
// ---------------------------------------------------------------------------
const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
const in5d = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

export const BOSS_FIGHTS: BossFight[] = [
  {
    id: "bf1",
    title: "Слить остаток Seagate Skyhawk 8TB",
    description: "Общий рывок отдела — закрываем самый залежавшийся SKU на складе.",
    targetSku: "ST8000VX010",
    targetQuantity: 100,
    currentQuantity: 0,
    deadline: in48h,
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
    deadline: in5d,
    reward: "🏖️ Пятница выходной для отдела",
    active: false,
  },
];

// ---------------------------------------------------------------------------
// ACHIEVEMENTS
// ---------------------------------------------------------------------------
export const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", name: "First Blood", description: "Первая зафиксированная продажа", icon: "zap", unlocked: false },
  { id: "a2", name: "10 Kills", description: "10 закрытых квестов", icon: "swords", unlocked: false },
  { id: "a3", name: "Stock Hunter", description: "Продано 50 единиц фокусных товаров", icon: "crosshair", unlocked: false },
  { id: "a4", name: "Weekend Warrior", description: "10 квестов за выходные", icon: "calendar", unlocked: false },
  { id: "a5", name: "Boss Slayer", description: "Участие в Boss Fight", icon: "skull", unlocked: false },
  { id: "a6", name: "Warehouse Destroyer", description: "Остаток критического товара снижен на 50%", icon: "warehouse", unlocked: false },
  { id: "a7", name: "Streak Master", description: "7 дней подряд с продажами", icon: "flame", unlocked: false },
  { id: "a8", name: "Top 3 Finisher", description: "Топ-3 в рейтинге месяца", icon: "medal", unlocked: false },
  { id: "a9", name: "Coin Collector", description: "Накоплено 5000 Coins", icon: "coins", unlocked: false },
  { id: "a10", name: "Level 5", description: "Достигнут 5-й уровень", icon: "rocket", unlocked: false },
];
