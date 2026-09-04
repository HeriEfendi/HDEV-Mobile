import { ref } from 'vue';

export interface BusinessProfile {
  storeName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  address: string;
  receiptHeader: string;
  receiptFooter: string;
  enableTax: boolean;
  taxRate: number; // percentage, e.g. 10 or 11
  logoUrl?: string;
  receiptPaperWidth?: '58mm' | '80mm';
  accentColor?: string;
}

const STORAGE_KEY = 'business_store_profile';

const defaultProfile: BusinessProfile = {
  storeName: 'HK UMKM Store',
  tagline: 'Solusi Usaha & Bisnis Mandiri',
  ownerName: '',
  phone: '',
  address: 'Jl. Merdeka No. 10',
  receiptHeader: 'Terima kasih atas kunjungan Anda',
  receiptFooter: 'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.',
  enableTax: false,
  taxRate: 11,
  logoUrl: '',
  receiptPaperWidth: '58mm',
  accentColor: '#3b82f6',
};

export function applyThemeAccent(color?: string) {
  if (!color || typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--bs-primary', color);
  root.style.setProperty('--ion-color-primary', color);
  root.style.setProperty('--color-blue', color);
}

export const businessProfile = ref<BusinessProfile>(loadProfile());

function loadProfile(): BusinessProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      applyThemeAccent(defaultProfile.accentColor);
      return { ...defaultProfile };
    }
    const parsed = { ...defaultProfile, ...JSON.parse(raw) };
    applyThemeAccent(parsed.accentColor);
    return parsed;
  } catch (e) {
    console.error('Gagal memuat profil toko:', e);
    applyThemeAccent(defaultProfile.accentColor);
    return { ...defaultProfile };
  }
}

export const BusinessProfileRepository = {
  get(): BusinessProfile {
    return businessProfile.value;
  },
  save(profile: Partial<BusinessProfile>): BusinessProfile {
    const updated = { ...businessProfile.value, ...profile };
    businessProfile.value = updated;
    if (updated.accentColor) {
      applyThemeAccent(updated.accentColor);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Gagal menyimpan profil toko:', e);
    }
    return updated;
  },
  reset(): BusinessProfile {
    businessProfile.value = { ...defaultProfile };
    applyThemeAccent(defaultProfile.accentColor);
    localStorage.removeItem(STORAGE_KEY);
    return { ...defaultProfile };
  }
};

