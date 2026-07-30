<template>
  <ion-menu content-id="main-content" side="end" class="app-sidebar">
    <ion-content class="sidebar-content">
      <div class="sidebar-hero">
        <p class="eyebrow">Workspace</p>
        <h2>Menu Aplikasi</h2>
        <p>Akses cepat modul kerja, keuangan, supply chain, dan pengaturan.</p>
      </div>

      <div class="sidebar-section" v-for="group in menuGroups" :key="group.title">
        <div class="section-title">{{ group.title }}</div>
        <ion-list class="sidebar-list">
          <ion-item
            v-for="item in group.items"
            :key="item.path"
            :router-link="item.path"
            @click="closeMenu"
            router-direction="root"
            lines="none"
            class="sidebar-item"
            :style="{ '--accent': item.accent }"
          >
            <div slot="start" class="sidebar-icon">
              <ion-icon :icon="item.icon" />
            </div>
            <ion-label>
              <h3>{{ item.label }}</h3>
              <p>{{ item.desc }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <ion-item button @click="exitApp" lines="none" class="sidebar-item danger-item">
        <div slot="start" class="sidebar-icon">
          <ion-icon :icon="logOutOutline" />
        </div>
        <ion-label>
          <h3>Tutup Aplikasi</h3>
          <p>Keluar dari aplikasi</p>
        </ion-label>
      </ion-item>
    </ion-content>
  </ion-menu>
</template>

<script>
import { IonMenu, IonContent, IonList, IonItem, IonLabel, IonIcon, menuController } from '@ionic/vue';
import { checkmarkCircleOutline, documentTextOutline, walletOutline, arrowDownCircleOutline, arrowUpCircleOutline, cardOutline, basketOutline, listOutline, peopleOutline, personOutline, logOutOutline, timeOutline, cartOutline, layersOutline, informationCircleOutline, cloudDownloadOutline, alarmOutline, journalOutline } from 'ionicons/icons';

export default {
  name: 'AppSidebar',
  components: { IonMenu, IonContent, IonList, IonItem, IonLabel, IonIcon },
  setup() {
    const menuGroups = [
      {
        title: 'Personal',
        items: [
          { label: 'Catatan', path: '/notes', icon: journalOutline, desc: 'Catatan & Ide Pribadi', accent: '#eab308' },
          { label: 'To Do', path: '/todo-personal', icon: checkmarkCircleOutline, desc: 'Task pribadi', accent: '#2563eb' },
          { label: 'To Do Team', path: '/todo', icon: checkmarkCircleOutline, desc: 'Task tim', accent: '#7c3aed' },
          { label: 'Ceklok', path: '/ceklok', icon: timeOutline, desc: 'Presensi & jam kerja', accent: '#0d9488' },
          { label: 'Pengingat', path: '/reminders', icon: alarmOutline, desc: 'Hari penting & notifikasi', accent: '#f59e0b' },
        ],
      },
      {
        title: 'Keuangan',
        items: [
          { label: 'Buku Kas', path: '/buku_kas', icon: documentTextOutline, desc: 'Bisnis, hobi & renovasi', accent: '#059669' },
          { label: 'Tabungan', path: '/savings', icon: walletOutline, desc: 'Modal usaha', accent: '#d97706' },
          { label: 'Pengeluaran', path: '/expenses', icon: arrowDownCircleOutline, desc: 'Dana keluar', accent: '#dc2626' },
          { label: 'Pendapatan', path: '/incomes', icon: arrowUpCircleOutline, desc: 'Dana masuk', accent: '#16a34a' },
          { label: 'Utang', path: '/debts', icon: cardOutline, desc: 'Catatan utang', accent: '#9333ea' },
        ],
      },
      {
        title: 'Supply Chain',
        items: [
          { label: 'Kasir (POS)', path: '/cashier', icon: cartOutline, desc: 'Penjualan & Kasir', accent: '#10b981' },
          { label: 'Manajemen Stok', path: '/stock', icon: layersOutline, desc: 'Monitor & atur stok', accent: '#8b5cf6' },
          { label: 'Produk', path: '/products', icon: basketOutline, desc: 'Stok produk', accent: '#ea580c' },
          { label: 'Kategori', path: '/categories', icon: listOutline, desc: 'Master kategori', accent: '#475569' },
        ],
      },
      {
        title: 'General Setting',
        items: [
          { label: 'Users', path: '/users', icon: peopleOutline, desc: 'Data pengguna', accent: '#0f766e' },
          { label: 'Backup & Restore', path: '/backup-restore', icon: cloudDownloadOutline, desc: 'Ekspor & Impor Database', accent: '#6366f1' },
          { label: 'Tentang Aplikasi', path: '/about', icon: informationCircleOutline, desc: 'Tentang & Developer', accent: '#0ea5e9' },
          { label: 'Profile', path: '/profile', icon: personOutline, desc: 'Data profil', accent: '#0ea5e9' },
        ],
      },
    ]

    const closeMenu = () => menuController.close()
    const exitApp = () => {
      if (navigator.app && navigator.app.exitApp) navigator.app.exitApp()
      else window.close()
    }

    return { menuGroups, exitApp, logOutOutline, closeMenu }
  },
}
</script>

<style scoped>
.app-sidebar {
  --width: min(86vw, 360px);
}

.sidebar-content {
  --background: linear-gradient(180deg, #ecf3fd 0%, #f8fbff 48%, #ffffff 100%);
}

.sidebar-hero {
  margin: 16px 14px 12px;
  padding: 18px;
  border-radius: 26px;
  color: white;
  background:
    radial-gradient(circle at top right, rgba(255,255,255,.34), transparent 34%),
    linear-gradient(135deg, #0f766e 0%, #2563eb 54%, #7c3aed 100%);
  box-shadow: 0 18px 40px rgba(37, 99, 235, .20);
}

.sidebar-hero h2 {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.1;
  font-weight: 900;
}

.sidebar-hero p:last-child {
  margin: 8px 0 0;
  font-size: .86rem;
  line-height: 1.4;
  opacity: .86;
}

.sidebar-section {
  margin: 0 10px 14px;
}

.section-title {
  margin: 0 6px 8px;
  color: #64748b;
  font-size: .72rem;
  font-weight: 900;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.sidebar-list {
  padding: 0;
  background: transparent;
}

.sidebar-item {
  --min-height: 62px;
  --padding-start: 10px;
  --inner-padding-end: 10px;
  --border-radius: 20px;
  --background: rgba(255,255,255,.86);
  margin-bottom: 8px;
  border: 1px solid rgba(15, 23, 42, .06);
  border-radius: 20px;
  overflow: hidden;
}

.sidebar-item.router-link-active,
.sidebar-item:active {
  --background: color-mix(in srgb, var(--accent) 10%, white);
  transform: scale(.99);
}

.sidebar-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: var(--accent, #2563eb);
  background: color-mix(in srgb, var(--accent, #2563eb) 12%, white);
}

.sidebar-icon ion-icon {
  font-size: 1.25rem;
}

.sidebar-item h3 {
  margin: 0;
  color: #0f172a;
  font-size: .94rem;
  font-weight: 900;
}

.sidebar-item p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: .75rem;
}

.danger-item {
  --accent: #dc2626;
  margin: 0 10px 18px;
}
</style>
