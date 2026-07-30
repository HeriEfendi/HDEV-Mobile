import { initDB } from '@/db';

export const UsersRepository = {
  async getAll() {
    const db = await initDB();
    return await db.getAll('users');
  },

  async add(user: any) {
    const db = await initDB();
    const newUser = { id: Date.now(), ...user };
    await db.put('users', newUser);
    return newUser;
  },

  async getById(id: number) {
    const db = await initDB();
    return await db.get('users', id);
  },

  async update(id: number, user: any) {
    const db = await initDB();
    return await db.put('users', { ...user, id });
  },

  async delete(id: number) {
    const db = await initDB();
    return await db.delete('users', id);
  },

  async seed() {
      const users = await this.getAll();
      if (users.length > 0) return;
      const seeds = [
          { name: 'Ahmad Heri', email: 'heri@example.com', avatar: 'https://i.pravatar.cc/150?img=1' },
          { name: 'Budi Santoso', email: 'budi@example.com', avatar: 'https://i.pravatar.cc/150?img=2' },
          { name: 'Citra Dewi', email: 'citra@example.com', avatar: 'https://i.pravatar.cc/150?img=5' },
      ];
      for (const u of seeds) {
          await this.add(u);
      }
  }
};
