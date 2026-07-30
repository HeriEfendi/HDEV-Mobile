<template>
  <ion-page>
    <ion-content class="home-page">
      <section class="home-hero">
        <div>
          <p class="hero-eyebrow">Dashboard</p>
          <h1>Halo, mau kelola apa hari ini?</h1>
          <p class="hero-subtitle">Akses cepat semua modul kerja dan catatan bisnis dalam satu tempat.</p>
        </div>
      </section>

      <ion-grid class="menu-grid">
        <ion-row>
          <ion-col
            size="6" size-sm="4" size-md="3" size-lg="2"
            v-for="item in visibleMenuItems"
            :key="item.path"
          >
            <router-link :to="item.path" class="menu-link">
              <ion-card class="menu-card" :style="{ '--accent': item.accent }">
                <ion-card-content class="menu-card-content">
                  <div class="menu-icon-wrap">
                    <ion-icon :icon="item.icon" />
                  </div>
                  <div class="menu-text">
                    <span class="menu-title">{{ item.name }}</span>
                    <span class="menu-desc">{{ item.description }}</span>
                  </div>
                  <ion-badge v-if="item.count !== undefined" class="menu-count">{{ item.count }}</ion-badge>
                </ion-card-content>
              </ion-card>
            </router-link>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>

    <!-- FAB Gear Button -->
    <div
      class="fab-gear"
      :style="{ bottom: fabPos.y + 'px', right: fabPos.x + 'px' }"
      @mousedown="startDrag"
      @touchstart.prevent="startDrag"
      :class="{ dragging: isDragging }"
    >
      <ion-icon :icon="settingsOutline" />
    </div>

    <!-- Settings Modal -->
    <ion-modal :is-open="settingsOpen" @didDismiss="settingsOpen = false" class="settings-modal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Atur Tampilan Menu</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="settingsOpen = false">
              <ion-icon :icon="closeOutline" />
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content class="">
        <p class="settings-hint ms-4">Aktifkan/nonaktifkan menu dan seret untuk mengatur urutan.</p>

        <div class="menu-settings-list mx-2">
          <div
            v-for="(item, index) in settingsItems"
            :key="item.path"
            class="menu-settings-item"
            :class="{ 'item-disabled': !item.visible }"
            draggable="true"
            @dragstart="onDragStart(index)"
            @dragover.prevent="onDragOver(index)"
            @dragend="onDragEnd"
            :data-dragging="dragIndex === index"
          >
            <!-- Drag Handle -->
            <div class="drag-handle">
              <ion-icon :icon="reorderTwoOutline" />
            </div>

            <!-- Icon + Info -->
            <div class="item-icon-wrap" :style="{ background: item.accent + '22', color: item.accent }">
              <ion-icon :icon="item.icon" />
            </div>
            <div class="item-info flex-grow-1">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-desc">{{ item.description }}</div>
            </div>

            <!-- Toggle -->
            <ion-toggle
              :checked="item.visible"
              @ionChange="item.visible = $event.detail.checked"
              class="ms-auto"
            />
          </div>
        </div>
      </ion-content>

      <ion-footer>
        <div class="settings-footer">
          <button class="btn btn-action light btn-md" @click="resetSettings">Reset</button>
          <button class="btn btn-action primary btn-md" @click="saveSettings">Simpan</button>
        </div>
      </ion-footer>
    </ion-modal>

    <!-- Popup Pengingat Hari Penting -->
    <ion-modal
      :is-open="reminderPopupOpen"
      @didDismiss="reminderPopupOpen = false"
      :initial-breakpoint="0.85"
      :breakpoints="[0, 0.85]"
      class="reminder-modal"
    >
      <div class="reminder-modal-wrap d-flex flex-column h-100">
        <!-- Hero Header -->
        <div class="reminder-modal-hero">
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-3">
              <div class="reminder-hero-badge">
                <ion-icon :icon="alarmOutline" />
              </div>
              <div>
                <span class="reminder-hero-eyebrow">HARI PENTING & ALARM</span>
                <h3 class="reminder-hero-title">Pengingat Terdekat</h3>
                <p class="reminder-hero-sub">{{ upcomingReminders.length }} agenda mendatang dalam 30 hari</p>
              </div>
            </div>
            <button class="reminder-close-btn" @click="reminderPopupOpen = false" aria-label="Tutup">
              <ion-icon :icon="closeOutline" />
            </button>
          </div>
        </div>

        <!-- Modal Body Content -->
        <ion-content class="reminder-modal-content">
          <!-- Empty State -->
          <div v-if="upcomingReminders.length === 0" class="empty-state py-5">
            <div class="empty-icon-wrap mb-3">
              <ion-icon :icon="calendarOutline" style="font-size: 2.8rem; color: #94a3b8;" />
            </div>
            <h6 class="fw-bold text-dark mb-1">Tidak Ada Agenda</h6>
            <p class="text-muted text-xs mb-0">Semua tenang! Belum ada pengingat dalam 30 hari ke depan.</p>
          </div>

          <!-- Reminder Cards List -->
          <div v-else class="reminder-card-list">
            <div
              v-for="r in upcomingReminders"
              :key="r.id"
              class="reminder-item-card"
              :class="{
                'is-today': getDaysUntil(r) === 0,
                'is-soon': getDaysUntil(r) > 0 && getDaysUntil(r) <= 3
              }"
            >
              <div class="reminder-card-left-strip" :style="{ background: getDaysUntil(r) === 0 ? '#f59e0b' : getDaysUntil(r) <= 3 ? '#ef4444' : '#2563eb' }"></div>
              
              <div class="reminder-card-main">
                <div class="reminder-emoji-box">
                  {{ r.emoji || '📅' }}
                </div>

                <div class="reminder-info-box">
                  <div class="reminder-title-text">{{ r.title }}</div>
                  <div class="reminder-date-text">
                    <ion-icon :icon="calendarOutline" class="me-1" />
                    {{ formatPopupDate(r) }}
                  </div>
                </div>

                <div class="reminder-badge-box">
                  <span
                    class="pill-badge"
                    :class="{
                      'warning': getDaysUntil(r) === 0,
                      'danger':  getDaysUntil(r) > 0 && getDaysUntil(r) <= 3,
                      'primary': getDaysUntil(r) > 3
                    }"
                  >
                    {{ getDaysLabel(r) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ion-content>

        <!-- Footer -->
        <div class="reminder-modal-footer">
          <router-link
            to="/reminders"
            @click="reminderPopupOpen = false"
            class="btn btn-action primary btn-md d-flex align-items-center justify-content-center gap-2 flex-grow-1 text-decoration-none py-2"
          >
            <ion-icon :icon="calendarOutline" />
            <span>Kelola Semua Pengingat</span>
          </router-link>
          <button
            class="btn btn-action light btn-md px-3 py-2"
            @click="reminderPopupOpen = false"
          >
            Tutup
          </button>
        </div>
      </div>
    </ion-modal>
  </ion-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import {
  IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
  IonIcon, IonBadge, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonButton, IonToggle, IonFooter
} from '@ionic/vue'
import {
  checkboxOutline, documentTextOutline, walletOutline, basketOutline,
  personOutline, cashOutline, timeOutline, cartOutline, layersOutline,
  informationCircleOutline, settingsOutline, closeOutline, reorderTwoOutline,
  alarmOutline, calendarOutline
} from 'ionicons/icons'

import { ReminderRepository, getNextOccurrence, daysUntil } from '@/db/reminderRepository'

const STORAGE_KEY = 'home_menu_settings'

const ALL_MENU = [
  { name: 'To Do', path: '/todo-personal', icon: checkboxOutline, count: 0, description: 'Tugas pribadi', accent: 'var(--color-blue)', visible: true },
  { name: 'To Do Team', path: '/todo', icon: checkboxOutline, count: 0, description: 'Kerja tim', accent: 'var(--color-purple)', visible: true },
  { name: 'Buku Kas', path: '/buku_kas', icon: documentTextOutline, count: 0, description: 'Bisnis, hobi & renovasi', accent: 'var(--color-green)', visible: true },
  { name: 'Ceklok', path: '/ceklok', icon: timeOutline, count: 0, description: 'Presensi kerja', accent: 'var(--color-cyan)', visible: true },
  { name: 'Pengingat', path: '/reminders', icon: alarmOutline, count: 0, description: 'Hari penting', accent: 'var(--color-amber)', visible: true },
  { name: 'Pengeluaran', path: '/expenses', icon: cashOutline, count: 0, description: 'Keluar dana', accent: 'var(--color-orange)', visible: true },
  { name: 'Kasir (POS)', path: '/cashier', icon: cartOutline, count: 0, description: 'Penjualan & Kasir', accent: 'var(--color-emerald)', visible: true },
  { name: 'Tabungan', path: '/savings', icon: walletOutline, count: 0, description: 'Simpanan dana', accent: 'var(--color-yellow)', visible: true },
  { name: 'Produk', path: '/products', icon: basketOutline, count: 0, description: 'Stok produk', accent: 'var(--color-red)', visible: true },
  { name: 'Manajemen Stok', path: '/stock', icon: layersOutline, count: 0, description: 'Monitor & atur stok', accent: 'var(--color-indigo)', visible: true },
  { name: 'Tentang Aplikasi', path: '/about', icon: informationCircleOutline, description: 'Tentang & Developer', accent: 'var(--color-sky)', visible: true },
]

export default {
  name: 'HomeView',
  components: {
    IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
    IonIcon, IonBadge, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons,
    IonButton, IonToggle, IonFooter
  },
  setup() {
    // ── Menu state ─────────────────────────────────────────────────────────
    const menuItems = ref(loadSettings())

    function loadSettings() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
        if (!saved) return ALL_MENU.map(m => ({ ...m }))
        // Merge: pertahankan urutan & visible dari storage, tapi isi data statis dari ALL_MENU
        const merged = saved.map(s => {
          const base = ALL_MENU.find(m => m.path === s.path)
          return base ? { ...base, visible: s.visible } : null
        }).filter(Boolean)
        // Tambahkan item baru yang belum ada di storage
        ALL_MENU.forEach(m => {
          if (!merged.find(x => x.path === m.path)) merged.push({ ...m })
        })
        return merged
      } catch { return ALL_MENU.map(m => ({ ...m })) }
    }

    const visibleMenuItems = computed(() => menuItems.value.filter(m => m.visible))

    // ── Settings modal ──────────────────────────────────────────────────────
    const settingsOpen = ref(false)
    const settingsItems = ref([])

    function openSettings() {
      if (isDragging.value) return
      settingsItems.value = menuItems.value.map(m => ({ ...m }))
      settingsOpen.value = true
    }

    function saveSettings() {
      menuItems.value = settingsItems.value.map(m => ({ ...m }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(
        menuItems.value.map(m => ({ path: m.path, visible: m.visible }))
      ))
      settingsOpen.value = false
    }

    function resetSettings() {
      settingsItems.value = ALL_MENU.map(m => ({ ...m }))
    }

    // ── Drag-to-reorder (settings list) ────────────────────────────────────
    const dragIndex = ref(null)

    function onDragStart(i) { dragIndex.value = i }
    function onDragOver(i) {
      if (dragIndex.value === null || dragIndex.value === i) return
      const arr = [...settingsItems.value]
      const [moved] = arr.splice(dragIndex.value, 1)
      arr.splice(i, 0, moved)
      settingsItems.value = arr
      dragIndex.value = i
    }
    function onDragEnd() { dragIndex.value = null }

    // ── FAB drag position ───────────────────────────────────────────────────
    const fabPos = ref({ x: 20, y: 28 })
    const isDragging = ref(false)
    let dragStart = null
    // Threshold lebih besar agar tap biasa tidak dianggap drag di Android
    const DRAG_THRESHOLD = 10

    function startDrag(e) {
      const touch = e.touches ? e.touches[0] : e
      dragStart = { clientX: touch.clientX, clientY: touch.clientY, x: fabPos.value.x, y: fabPos.value.y }
      isDragging.value = false
      let hasMoved = false

      const moveHandler = ev => {
        const t = ev.touches ? ev.touches[0] : ev
        const dx = t.clientX - dragStart.clientX
        const dy = t.clientY - dragStart.clientY
        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
          hasMoved = true
          isDragging.value = true
        }
        if (!hasMoved) return
        fabPos.value = {
          x: Math.max(8, dragStart.x - dx),
          y: Math.max(8, dragStart.y - dy)
        }
      }
      const upHandler = () => {
        document.removeEventListener('mousemove', moveHandler)
        document.removeEventListener('touchmove', moveHandler)
        document.removeEventListener('mouseup', upHandler)
        document.removeEventListener('touchend', upHandler)
        if (!hasMoved) {
          // Ini tap murni, langsung buka modal tanpa bergantung @click
          openSettings()
        }
        setTimeout(() => { isDragging.value = false }, 50)
      }
      document.addEventListener('mousemove', moveHandler)
      document.addEventListener('touchmove', moveHandler, { passive: false })
      document.addEventListener('mouseup', upHandler)
      document.addEventListener('touchend', upHandler)
    }

    // ── Fetch counts ────────────────────────────────────────────────────────
    const fetchCounts = async () => {
      try {
        const { initDB } = await import('@/db')
        const db = await initDB()
        const todos = await db.getAll('todos')
        const teamTodos = await db.getAll('team_todos')
        const projects = await db.getAll('projects')
        const ceklokLogs = await db.getAll('ceklok_logs').catch(() => [])

        const updateCount = (path, count) => {
          const item = menuItems.value.find(m => m.path === path)
          if (item) item.count = count
        }

        updateCount('/todo-personal', todos.length)
        updateCount('/todo', teamTodos.length)
        updateCount('/buku_kas', projects.length)
        updateCount('/ceklok', ceklokLogs.length)

        const allReminders = await ReminderRepository.getAll().catch(() => [])
        updateCount('/reminders', allReminders.length)

        const { savingAccountsRepo, ProductRepository, salesRepo, expensesRepo } = await import('../db/repositories')

        const allProducts = await ProductRepository.getAll()
        const lowStockItems = allProducts.filter(p => p.stock !== null && p.stock !== undefined && p.stock <= 10)

        updateCount('/cashier', (await salesRepo.getAll()).length)
        updateCount('/savings', (await savingAccountsRepo.getAll()).length)
        updateCount('/expenses', (await expensesRepo.getAll()).length)
        updateCount('/products', allProducts.length)
        updateCount('/stock', lowStockItems.length)
      } catch (e) {
        console.error('Gagal memuat count:', e)
      }
    }

    // ── Reminder popup ──────────────────────────────────────────────────────
    const reminderPopupOpen = ref(false)
    const upcomingReminders = ref([])

    async function loadUpcomingReminders() {
      try {
        const upcoming = await ReminderRepository.getUpcoming(30)
        upcomingReminders.value = upcoming
        if (upcoming.length > 0) reminderPopupOpen.value = true
      } catch (e) {
        console.warn('Gagal memuat pengingat:', e)
      }
    }

    function getDaysUntilSync(r) {
      const next = getNextOccurrence(r) ?? r.date
      return daysUntil(next)
    }

    function getDaysLabel(r) {
      const d = getDaysUntilSync(r)
      if (d === 0) return 'Hari ini! 🎉'
      if (d === 1) return 'Besok!'
      if (d < 0) return `${Math.abs(d)} hari lalu`
      return `${d} hari lagi`
    }

    function getDaysClass(r) {
      const d = getDaysUntilSync(r)
      if (d === 0) return 'text-warning fw-black'
      if (d <= 3) return 'text-danger fw-bold'
      if (d <= 7) return 'text-warning'
      return 'text-success'
    }

    function formatPopupDate(r) {
      const d = getNextOccurrence(r) ?? r.date
      return new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
    }

    onIonViewWillEnter(fetchCounts)
    onMounted(async () => {
      await fetchCounts()
      await loadUpcomingReminders()
    })

    return {
      visibleMenuItems,
      settingsOpen, settingsItems,
      openSettings, saveSettings, resetSettings,
      dragIndex, onDragStart, onDragOver, onDragEnd,
      fabPos, isDragging, startDrag,
      settingsOutline, closeOutline, reorderTwoOutline, calendarOutline, alarmOutline,
      reminderPopupOpen, upcomingReminders,
      getDaysUntil: getDaysUntilSync, getDaysLabel, getDaysClass, formatPopupDate
    }
  }
}
</script>

<style scoped>
/* ── FAB Gear ─────────────────────────────────────────── */
.fab-gear {
  position: fixed;
  z-index: 999;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(30, 41, 59, 0.45);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, opacity 0.2s;
  opacity: 0.6;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  user-select: none;
  touch-action: none;
}
.fab-gear:hover { opacity: 1; background: rgba(30,41,59,0.75); }
.fab-gear.dragging { opacity: 0.9; transform: scale(1.1); cursor: grabbing; }
.fab-gear ion-icon { font-size: 1.4rem; color: #fff; pointer-events: none; }

/* ── Settings Modal ───────────────────────────────────── */
.settings-hint {
  font-size: 0.82rem;
  color: #64748b;
  margin-bottom: 12px;
}

.menu-settings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-settings-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  transition: background 0.15s, border-color 0.15s, opacity 0.2s;
  cursor: grab;
}
.menu-settings-item:active { cursor: grabbing; }
.menu-settings-item[data-dragging="true"] {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59,130,246,0.15);
}
.menu-settings-item.item-disabled { opacity: 0.45; }

.drag-handle {
  color: #94a3b8;
  font-size: 1.2rem;
  flex-shrink: 0;
  cursor: grab;
}

.item-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.item-info { min-width: 0; }
.item-name { font-size: 0.88rem; font-weight: 600; color: #1e293b; }
.item-desc { font-size: 0.75rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ── Settings Footer ──────────────────────────────────── */
.settings-footer {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}
.settings-footer .btn { flex: 1; }

/* ── Reminder Modal Styling (Matching Home/Sidebar theme) ── */
.reminder-modal {
  --background: #ecf3fd;
  --border-radius: 28px 28px 0 0;
}

.reminder-modal-wrap {
  background: #ecf3fd;
}

.reminder-modal-hero {
  padding: 20px 18px 16px;
  background: #3b82f6;
  /* background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.34), transparent 34%),
    linear-gradient(135deg, #0f766e 0%, #2563eb 54%, #7c3aed 100%); */
  color: white;
  border-radius: 28px 28px 0 0;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.22);
}

.reminder-hero-badge {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: #fff;
  flex-shrink: 0;
}

.reminder-hero-eyebrow {
  display: block;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  opacity: 0.82;
  margin-bottom: 2px;
}

.reminder-hero-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.2;
}

.reminder-hero-sub {
  margin: 2px 0 0;
  font-size: 0.78rem;
  opacity: 0.88;
}

.reminder-close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  flex-shrink: 0;
}
.reminder-close-btn:active {
  transform: scale(0.92);
  background: rgba(255, 255, 255, 0.3);
}

.reminder-modal-content {
  --background: #ecf3fd;
}

.reminder-card-list {
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reminder-item-card {
  position: relative;
  display: flex;
  overflow: hidden;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.reminder-item-card.is-today {
  background: linear-gradient(180deg, #ffffff 0%, #fffbeb 100%);
  border-color: rgba(245, 158, 11, 0.4);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.12);
}

.reminder-item-card.is-soon {
  background: linear-gradient(180deg, #ffffff 0%, #fff1f2 100%);
  border-color: rgba(239, 68, 68, 0.3);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.1);
}

.reminder-card-left-strip {
  width: 5px;
  flex-shrink: 0;
}

.reminder-card-main {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  width: 100%;
}

.reminder-emoji-box {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  flex-shrink: 0;
  line-height: 1;
}

.reminder-info-box {
  flex: 1;
  min-width: 0;
}

.reminder-title-text {
  font-size: 0.94rem;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reminder-date-text {
  font-size: 0.76rem;
  color: #64748b;
  margin-top: 2px;
  display: flex;
  align-items: center;
}

.reminder-badge-box {
  flex-shrink: 0;
}

.reminder-modal-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #ecf3fd;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}
</style>
