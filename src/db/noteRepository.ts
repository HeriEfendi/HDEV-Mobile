import { toRaw } from 'vue';
import { db } from './schema';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface NoteItem {
  id?: number;
  title: string;
  content: string;
  type: 'text' | 'checklist';
  checklist?: ChecklistItem[];
  color: string;
  fontFamily: string;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteLabel {
  id?: number;
  name: string;
}

export const NOTE_COLORS = [
  { name: 'default', label: 'Default', hex: '#ffffff', darkHex: '#1e293b', border: '#cbd5e1' },
  { name: 'coral', label: 'Koral', hex: '#faebd7', darkHex: '#451a1a', border: '#f3d5b5' },
  { name: 'peach', label: 'Peach', hex: '#ffe4c4', darkHex: '#432818', border: '#f7c59f' },
  { name: 'yellow', label: 'Kuning', hex: '#fef08a', darkHex: '#423b0c', border: '#fde047' },
  { name: 'mint', label: 'Mint', hex: '#d1fae5', darkHex: '#0c3b2e', border: '#a7f3d0' },
  { name: 'teal', label: 'Teal', hex: '#ccfbf1', darkHex: '#0f3938', border: '#99f6e4' },
  { name: 'sky', label: 'Biru Muda', hex: '#e0f2fe', darkHex: '#0c2d48', border: '#bae6fd' },
  { name: 'purple', label: 'Ungu', hex: '#f3e8ff', darkHex: '#3b1c54', border: '#e9d5ff' },
  { name: 'pink', label: 'Merah Muda', hex: '#fce7f3', darkHex: '#4d1933', border: '#fbcfe8' },
  { name: 'gray', label: 'Abu-abu', hex: '#f1f5f9', darkHex: '#1f2937', border: '#e2e8f0' },
];

export const FONT_FAMILIES = [
  { id: 'sans', label: 'Default (Sans-Serif)', cssFont: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { id: 'modern', label: 'Modern (Segoe / Trebuchet)', cssFont: '"Segoe UI", "Trebuchet MS", "Lucida Sans Unicode", sans-serif' },
  { id: 'serif', label: 'Klasik (Georgia / Serif)', cssFont: 'Georgia, Cambria, "Times New Roman", Times, serif' },
  { id: 'elegant', label: 'Elegan (Palatino / Garamond)', cssFont: '"Palatino Linotype", "Book Antiqua", Palatino, "Garamond", serif' },
  { id: 'rounded', label: 'Bulat (Rounded / Soft)', cssFont: '"Segoe UI Rounded", "Comfortaa", "Arial Rounded MT Bold", system-ui, sans-serif' },
  { id: 'handwriting', label: 'Tulisan Tangan (Comic / Print)', cssFont: '"Comic Sans MS", "Comic Sans", "Segoe Print", "Bradley Hand", cursive, sans-serif' },
  { id: 'casual', label: 'Coretan / Marker', cssFont: '"Caveat", "Brush Script MT", "Chalkboard SE", cursive' },
  { id: 'mono', label: 'Monospace (Code / Consolas)', cssFont: 'ui-monospace, "Cascadia Code", "Consolas", "Courier New", monospace' },
  { id: 'typewriter', label: 'Mesin Ketik (Courier)', cssFont: '"Courier New", Courier, "Lucida Console", monospace' },
  { id: 'condensed', label: 'Ringkas / Narrow', cssFont: '"Arial Narrow", "Trebuchet MS", sans-serif-condensed, sans-serif' },
  { id: 'display', label: 'Judul Tebal (Impact)', cssFont: 'Impact, Haettenschweiler, "Arial Black", sans-serif' },
];

export const FONT_SIZES = [
  { id: 'sm', label: 'Kecil', cssSize: '0.88rem' },
  { id: 'md', label: 'Normal', cssSize: '1rem' },
  { id: 'lg', label: 'Besar', cssSize: '1.18rem' },
  { id: 'xl', label: 'Sangat Besar', cssSize: '1.38rem' },
];

/** Strip Vue reactive Proxy so IndexedDB can clone the value safely. */
function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(toRaw(obj as any)));
}

export const NoteRepository = {
  async getAll(): Promise<NoteItem[]> {
    await this.seedInitialNotesIfEmpty();
    return await db.table('notes').toArray();
  },

  async getById(id: number): Promise<NoteItem | undefined> {
    return await db.table('notes').get(id);
  },

  async add(note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<NoteItem> {
    const now = new Date().toISOString();
    const newNote: Omit<NoteItem, 'id'> = toPlain({
      ...note,
      isPinned: note.isPinned ?? false,
      isArchived: note.isArchived ?? false,
      isTrashed: note.isTrashed ?? false,
      color: note.color || 'default',
      fontFamily: note.fontFamily || 'sans',
      fontSize: note.fontSize || 'md',
      labels: note.labels || [],
      checklist: note.checklist || [],
      createdAt: now,
      updatedAt: now,
    });
    const id = await db.table('notes').add(newNote);
    return { id, ...newNote };
  },

  async update(id: number, changes: Partial<NoteItem>): Promise<void> {
    const updatedAt = new Date().toISOString();
    await db.table('notes').update(id, toPlain({ ...changes, updatedAt }));
  },

  async delete(id: number): Promise<void> {
    const note = await this.getById(id);
    if (note) {
      if (note.isTrashed) {
        await db.table('notes').delete(id);
      } else {
        await this.update(id, { isTrashed: true, isPinned: false });
      }
    }
  },

  async restore(id: number): Promise<void> {
    await this.update(id, { isTrashed: false });
  },

  async togglePin(id: number, currentStatus: boolean): Promise<void> {
    await this.update(id, { isPinned: !currentStatus });
  },

  async toggleArchive(id: number, currentStatus: boolean): Promise<void> {
    await this.update(id, { isArchived: !currentStatus, isPinned: false });
  },

  // --- Labels ---
  async getLabels(): Promise<NoteLabel[]> {
    const labels = await db.table('note_labels').toArray();
    if (labels.length === 0) {
      const defaultLabels = [
        { name: 'Penting' },
        { name: 'Kerja' },
        { name: 'Pribadi' },
        { name: 'Ide' },
        { name: 'Belanja' },
      ];
      await db.table('note_labels').bulkAdd(defaultLabels);
      return await db.table('note_labels').toArray();
    }
    return labels;
  },

  async addLabel(name: string): Promise<NoteLabel> {
    const existing = await db.table('note_labels').where('name').equals(name.trim()).first();
    if (existing) return existing;
    const id = await db.table('note_labels').add({ name: name.trim() });
    return { id, name: name.trim() };
  },

  async deleteLabel(id: number): Promise<void> {
    await db.table('note_labels').delete(id);
  },

  // --- Initial Seeding ---
  async seedInitialNotesIfEmpty(): Promise<void> {
    const count = await db.table('notes').count();
    if (count > 0) return;

    const now = new Date().toISOString();
    const sampleNotes: Omit<NoteItem, 'id'>[] = [
      {
        title: '📌 Selamat Datang di Catatan!',
        content: 'Fitur catatan ini siap membantu kamu menyimpan berbagai hal.\n\nKamu bisa:\n• Mengubah warna latar belakang catatan\n• Memilih gaya font & ukuran font\n• Menambahkan label / tag\n• Memilih mode Checklist atau Teks\n• Menyematkan (pin) catatan di bagian atas',
        type: 'text',
        color: 'yellow',
        fontFamily: 'handwriting',
        fontSize: 'lg',
        isPinned: true,
        isArchived: false,
        isTrashed: false,
        labels: ['Penting', 'Ide'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: '🛒 Belanja Bahan Baku Usaha',
        content: '',
        type: 'checklist',
        checklist: [
          { id: '1', text: 'Tepung terigu pro tinggi 5kg', completed: true },
          { id: '2', text: 'Gula pasir 10kg', completed: true },
          { id: '3', text: 'Minyak goreng 5 liter', completed: false },
          { id: '4', text: 'Kotak kemasan 100 pcs', completed: false },
        ],
        color: 'mint',
        fontFamily: 'rounded',
        fontSize: 'md',
        isPinned: true,
        isArchived: false,
        isTrashed: false,
        labels: ['Belanja', 'Kerja'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: '💡 Ide Pengembangan Produk Baru',
        content: '1. Varian rasa baru untuk camilan (Pedas Manis & Kebuli)\n2. Promo diskon khusus akhir bulan\n3. Integrasi pencetakan struk bluetooth pada kasir',
        type: 'text',
        color: 'purple',
        fontFamily: 'sans',
        fontSize: 'md',
        isPinned: false,
        isArchived: false,
        isTrashed: false,
        labels: ['Ide', 'Kerja'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: '📋 Jadwal Rutin Mingguan',
        content: '',
        type: 'checklist',
        checklist: [
          { id: 'c1', text: 'Cek stok barang masuk dan keluar', completed: true },
          { id: 'c2', text: 'Rekap buku kas & pengeluaran mingguan', completed: false },
          { id: 'c3', text: 'Backup database aplikasi', completed: false },
        ],
        color: 'sky',
        fontFamily: 'serif',
        fontSize: 'md',
        isPinned: false,
        isArchived: false,
        isTrashed: false,
        labels: ['Kerja', 'Penting'],
        createdAt: now,
        updatedAt: now,
      },
    ];

    await db.table('notes').bulkAdd(sampleNotes);
  },
};
