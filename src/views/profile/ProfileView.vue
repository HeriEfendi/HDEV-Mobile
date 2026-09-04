<template>
  <ion-page class="app-page">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero">
          <div class="d-flex align-items-center justify-content-between">
            <ion-title class="app-hero-title">Profil & Pengaturan Toko</ion-title>
            <ion-buttons slot="end">
              <button class="btn btn-action primary btn-md" @click="saveProfile">
                <ion-icon :icon="saveOutline" class="me-1" /> Simpan
              </button>
            </ion-buttons>
          </div>
          <p class="app-hero-subtitle">Atur identitas bisnis, informasi kontak, nota struk kasir, dan preferensi pajak.</p>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap bg-light ion-padding">
      <!-- Identitas Toko -->
      <div class="mobile-card p-4 mb-3">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="store-avatar-box">
            <ion-icon :icon="storefrontOutline" />
          </div>
          <div>
            <h5 class="fw-bold text-dark mb-0">Identitas Usaha</h5>
            <small class="text-muted">Data ini akan dicantumkan di struk dan nota WhatsApp</small>
          </div>
        </div>

        <div class="form-stack">
          <div class="field-group mb-3">
            <label class="field-label fw-bold text-dark">Nama Usaha / Toko <span class="text-danger">*</span></label>
            <input type="text" v-model="form.storeName" class="form-control app-control" placeholder="Contoh: Toko Berkah Mandiri" />
          </div>

          <div class="field-group mb-3">
            <label class="field-label">Slogan / Keterangan Singkat</label>
            <input type="text" v-model="form.tagline" class="form-control app-control" placeholder="Contoh: Pusat Grosir & Eceran Terpercaya" />
          </div>

          <div class="row mb-3">
            <div class="col-12 col-md-6 mb-3 mb-md-0">
              <label class="field-label">Nama Pemilik / Pengelola</label>
              <input type="text" v-model="form.ownerName" class="form-control app-control" placeholder="Nama pemilik usaha" />
            </div>
            <div class="col-12 col-md-6">
              <label class="field-label fw-bold text-dark">No. WhatsApp / Telepon Usaha</label>
              <input type="tel" v-model="form.phone" class="form-control app-control" placeholder="Contoh: 081234567890" />
            </div>
          </div>

          <div class="field-group mb-2">
            <label class="field-label">Alamat Lengkap Usaha</label>
            <textarea v-model="form.address" class="form-control app-control" rows="2" placeholder="Jl. Raya Utama No. 12, Kota ..."></textarea>
          </div>
        </div>
      </div>

      <!-- Pengaturan Struk Kasir -->
      <div class="mobile-card p-4 mb-3">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="store-avatar-box receipt-box">
            <ion-icon :icon="receiptOutline" />
          </div>
          <div>
            <h5 class="fw-bold text-dark mb-0">Pengaturan Struk Kasir</h5>
            <small class="text-muted">Kustomisasi header, footer, dan ukuran kertas printer thermal</small>
          </div>
        </div>

        <div class="form-stack">
          <div class="field-group mb-3">
            <label class="field-label">Pesan Pembuka (Header Struk)</label>
            <input type="text" v-model="form.receiptHeader" class="form-control app-control" placeholder="Contoh: Selamat Datang & Selamat Berbelanja" />
          </div>

          <div class="field-group mb-3">
            <label class="field-label">Pesan Penutup (Footer Struk)</label>
            <textarea v-model="form.receiptFooter" class="form-control app-control" rows="2" placeholder="Contoh: Terima kasih atas kunjungan Anda! Barang yang sudah dibeli tidak dapat ditukar."></textarea>
          </div>

          <div class="field-group mb-2">
            <label class="field-label">Ukuran Lebar Kertas Struk Thermal</label>
            <div class="d-flex gap-2">
              <button
                type="button"
                class="btn flex-fill py-2 d-flex align-items-center justify-content-center gap-2"
                :class="form.receiptPaperWidth === '58mm' ? 'btn-primary' : 'btn-outline-secondary'"
                @click="form.receiptPaperWidth = '58mm'"
              >
                <span>58mm (Standar Portabel)</span>
              </button>
              <button
                type="button"
                class="btn flex-fill py-2 d-flex align-items-center justify-content-center gap-2"
                :class="form.receiptPaperWidth === '80mm' ? 'btn-primary' : 'btn-outline-secondary'"
                @click="form.receiptPaperWidth = '80mm'"
              >
                <span>80mm (Lebar Desktop)</span>
              </button>
            </div>
            <small class="text-muted mt-1 d-block">Menentukan format perataan teks saat mencetak ke printer thermal.</small>
          </div>
        </div>
      </div>

      <!-- Pengaturan Tema Warna Aksen (B-05) -->
      <div class="mobile-card p-4 mb-3">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="store-avatar-box theme-box">
            <ion-icon :icon="colorPaletteOutline" />
          </div>
          <div>
            <h5 class="fw-bold text-dark mb-0">Warna Aksen Aplikasi</h5>
            <small class="text-muted">Sesuaikan warna identitas visual toko Anda</small>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-3 pt-2">
          <button
            v-for="color in themeColors"
            :key="color.value"
            type="button"
            class="color-chip-btn"
            :class="{ active: form.accentColor === color.value }"
            :style="{ background: color.value }"
            :title="color.label"
            @click="form.accentColor = color.value"
          >
            <span v-if="form.accentColor === color.value" class="chip-check">✓</span>
          </button>
        </div>
        <small class="text-muted mt-2 d-block">Warna terpilih: <strong>{{ getSelectedColorLabel(form.accentColor) }}</strong></small>
      </div>

      <!-- Pengaturan Pajak (PPN) -->
      <div class="mobile-card p-4 mb-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div class="d-flex align-items-center gap-3">
            <div class="store-avatar-box tax-box">
              <ion-icon :icon="cashOutline" />
            </div>
            <div>
              <h5 class="fw-bold text-dark mb-0">Pajak Pertambahan Nilai (PPN)</h5>
              <small class="text-muted">Terapkan tarif PPN otomatis ke seluruh transaksi kasir</small>
            </div>
          </div>
          <ion-toggle :checked="form.enableTax" @ionChange="form.enableTax = $event.detail.checked" />
        </div>

        <div v-if="form.enableTax" class="pt-3 border-top">
          <div class="field-group">
            <label class="field-label fw-bold text-dark mb-1">Tarif Pajak Tetap (%)</label>
            <div class="input-group mb-2">
              <input 
                type="number" 
                v-model.number="form.taxRate" 
                min="0" 
                max="100" 
                step="0.5" 
                class="form-control app-control fw-bold" 
                placeholder="11" 
              />
              <span class="input-group-text bg-white fw-bold">%</span>
            </div>
            <!-- Preset Quick Selection -->
            <div class="d-flex gap-2 mb-2">
              <button 
                type="button" 
                class="btn btn-sm py-1 px-2 border rounded-3 text-xs fw-semibold"
                :class="form.taxRate === 10 ? 'btn-primary text-white' : 'btn-light text-dark'"
                @click="form.taxRate = 10"
              >
                10%
              </button>
              <button 
                type="button" 
                class="btn btn-sm py-1 px-2 border rounded-3 text-xs fw-semibold"
                :class="form.taxRate === 11 ? 'btn-primary text-white' : 'btn-light text-dark'"
                @click="form.taxRate = 11"
              >
                11% (Standar RI)
              </button>
              <button 
                type="button" 
                class="btn btn-sm py-1 px-2 border rounded-3 text-xs fw-semibold"
                :class="form.taxRate === 12 ? 'btn-primary text-white' : 'btn-light text-dark'"
                @click="form.taxRate = 12"
              >
                12%
              </button>
            </div>
            <div class="p-2 rounded-3 bg-light border text-xs text-muted d-flex align-items-center gap-2">
              <ion-icon :icon="informationCircleOutline" class="text-primary fs-6 flex-shrink-0" />
              <span>Tarif <strong>{{ form.taxRate || 0 }}%</strong> otomatis dikunci di kasir untuk mencegah human error (kasir tidak perlu ketik manual tiap transaksi).</span>
            </div>
          </div>
        </div>
        <div v-else class="text-muted text-xs pt-2 border-top">
          <span class="badge bg-light text-secondary border me-1">Bebas Pajak</span>
          PPN dinonaktifkan. Semua transaksi kasir otomatis 0% tanpa perlu input manual.
        </div>
      </div>

      <!-- Info Developer / Tentang Aplikasi Banner -->
      <div class="mobile-card p-3 mb-4 d-flex align-items-center justify-content-between bg-white border">
        <div class="d-flex align-items-center gap-3">
          <ion-icon :icon="informationCircleOutline" class="fs-4 text-primary" />
          <div>
            <div class="fw-bold text-dark text-sm">Tentang Pengembang & Aplikasi</div>
            <small class="text-muted text-xs">Informasi versi, lisensi, dan profil developer</small>
          </div>
        </div>
        <router-link to="/about" class="btn btn-action light btn-sm text-decoration-none">
          Lihat Info
        </router-link>
      </div>

      <!-- Tombol Simpan Bawah -->
      <div class="p-2 mb-4">
        <button class="btn btn-action primary w-100 py-3 fw-bold fs-6" @click="saveProfile">
          <ion-icon :icon="saveOutline" class="me-2" /> Simpan Pengaturan Profil Toko
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonIcon, IonToggle, toastController
} from '@ionic/vue';
import {
  storefrontOutline, receiptOutline, cashOutline,
  saveOutline, informationCircleOutline, colorPaletteOutline
} from 'ionicons/icons';
import { BusinessProfileRepository, businessProfile, applyThemeAccent } from '@/db/businessProfile';

const themeColors = [
  { label: 'Biru HK (Default)', value: '#3b82f6' },
  { label: 'Hijau Emerald', value: '#10b981' },
  { label: 'Indigo / Ungu', value: '#6366f1' },
  { label: 'Amber / Oranye', value: '#f59e0b' },
  { label: 'Rose / Merah Elegan', value: '#f43f5e' },
  { label: 'Teal / Cyan', value: '#06b6d4' }
];

const form = ref({
  storeName: '',
  tagline: '',
  ownerName: '',
  phone: '',
  address: '',
  receiptHeader: '',
  receiptFooter: '',
  enableTax: false,
  taxRate: 10,
  logoUrl: '',
  receiptPaperWidth: '58mm',
  accentColor: '#3b82f6'
});

onMounted(() => {
  const current = BusinessProfileRepository.get();
  form.value = {
    ...current,
    receiptPaperWidth: current.receiptPaperWidth || '58mm',
    accentColor: current.accentColor || '#3b82f6'
  };
});

function getSelectedColorLabel(val?: string) {
  const found = themeColors.find(c => c.value === val);
  return found ? found.label : (val || 'Biru HK');
}

const saveProfile = async () => {
  if (!form.value.storeName.trim()) {
    const toast = await toastController.create({
      message: 'Nama usaha / toko tidak boleh kosong!',
      duration: 2000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
    return;
  }

  form.value.taxRate = Math.max(0, Number(form.value.taxRate) || 0);
  BusinessProfileRepository.save(form.value);

  const toast = await toastController.create({
    message: 'Profil usaha dan pengaturan toko berhasil disimpan! ✓',
    duration: 2500,
    color: 'success',
    position: 'top'
  });
  await toast.present();
};
</script>

<style scoped>
.store-avatar-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #eff6ff;
  color: #2563eb;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.receipt-box {
  background: #f0fdf4;
  color: #16a34a;
}

.tax-box {
  background: #fef3c7;
  color: #d97706;
}

.theme-box {
  background: #f3e8ff;
  color: #9333ea;
}

.color-chip-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.color-chip-btn:hover {
  transform: scale(1.1);
}

.color-chip-btn.active {
  border-color: #ffffff;
  outline: 3px solid #1e293b;
  transform: scale(1.1);
}

.chip-check {
  color: #ffffff;
  font-weight: 900;
  font-size: 1.1rem;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}
</style>
