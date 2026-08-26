import type { Manager, Product, Sale } from "../types/sales";
import { MANAGERS, PRODUCTS } from "../data/mockData";

// ---------------------------------------------------------------------------
// SalesRepository — abstraction so the UI never talks to a data source
// directly. Swap MockSalesRepository for a RestSalesRepository /
// OneCSalesRepository / BitrixSalesRepository later without touching
// components.
// ---------------------------------------------------------------------------
export interface SalesRepository {
  getProducts(): Promise<Product[]>;
  getManagers(): Promise<Manager[]>;
  registerSale(data: Sale): Promise<void>;
  getLeaderboard(): Promise<Manager[]>;
}

const SIMULATED_LATENCY_MS = 120;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

/**
 * In-memory mock implementation used for the MVP. All UI state actually
 * lives in React state (see App.tsx) — this repository exists purely to
 * establish the contract that a real backend will fulfil later (REST API,
 * 1C, Bitrix24, Power BI export, Telegram bot, etc).
 */
export class MockSalesRepository implements SalesRepository {
  private sales: Sale[] = [];

  async getProducts(): Promise<Product[]> {
    return delay(PRODUCTS);
  }

  async getManagers(): Promise<Manager[]> {
    return delay(MANAGERS);
  }

  async registerSale(data: Sale): Promise<void> {
    this.sales.push(data);
    return delay(undefined);
  }

  async getLeaderboard(): Promise<Manager[]> {
    const sorted = [...MANAGERS].sort((a, b) => b.xp - a.xp);
    return delay(sorted);
  }
}

export const salesRepository: SalesRepository = new MockSalesRepository();
