import { db } from './schema';

const sanitizeData = (data) => {
  if (data === undefined || data === null) return data;
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    return data;
  }
};

// Category Repository
export const CategoryRepository = {
  async getAll() {
    return await db.categories.toArray();
  },
  async getById(id) {
    return await db.categories.get(id);
  },
  async add(category) {
    // Pastikan kita tidak mengirim ID ke db.add jika ID-nya adalah auto-increment (++)
    const raw = sanitizeData(category);
    const categoryData = { name: raw.name }; 
    const id = await db.categories.add(categoryData);
    return { id, ...categoryData };
  },
  async update(id, changes) {
    const raw = sanitizeData(changes);
    await db.categories.update(id, raw);
    return { id, ...raw };
  },
  async delete(id) {
    await db.categories.delete(id);
  },
};

// Product Repository
export const ProductRepository = {
  async getAll() {
    return await db.products.toArray();
  },
  async getFeatured() {
    // Implementasi untuk mendapatkan produk unggulan (misalnya, berdasarkan properti 'featured')
    return await db.products.where('featured').equals(1).toArray();
  },
  async getById(id) {
    return await db.products.get(id);
  },
  async add(product) {
    const raw = sanitizeData(product);
    const id = await db.products.add(raw);
    return { id, ...raw };
  },
  async update(id, changes) {
    const raw = sanitizeData(changes);
    await db.products.update(id, raw);
    return { id, ...raw };
  },
  async delete(id) {
    await db.products.delete(id);
  },
};

const createRepo = (tableName) => ({
    async add(record) {
      const raw = sanitizeData(record);
      const id = await db[tableName].add({ ...raw, createdAt: new Date().toISOString() });
      return { id, ...raw };
    },
    async bulkAdd(records) {
      const rawRecords = sanitizeData(records);
      return db[tableName].bulkAdd(rawRecords.map(r => ({ ...r, createdAt: new Date().toISOString() })));
    },
    async update(id, changes) {
      const raw = sanitizeData(changes);
      return await db[tableName].update(id, { ...raw, updatedAt: new Date().toISOString() });
    },
    async delete(id) {
      await db[tableName].delete(id);
    },
    async getById(id) {
      return db[tableName].get(id);
    },
    async getAll() {
      return db[tableName].toArray();
    },
    async where(index, value) {
      return db[tableName].where(index).equals(value).toArray();
    },
});

export const savingsRepo = createRepo('savings');
export const debtsRepo = createRepo('debts');
export const incomesRepo = createRepo('incomes');
export const expensesRepo = createRepo('expenses');
export const dailyLedgerRepo = createRepo('dailyLedger');
export const salesRepo = createRepo('sales');
export const stockMutationsRepo = createRepo('stockMutations');
export const savingAccountsRepo = createRepo('saving_accounts');
export const savingTransactionsRepo = createRepo('saving_transactions');



