<template>
  <ion-page class="app-page">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero">
          <div class="d-flex align-items-center justify-content-between">
            <ion-title class="app-hero-title">Utang & Kewajiban</ion-title>
            <ion-buttons slot="end">
              <ion-button class="btn-action primary" @click="openModal()">
                <ion-icon slot="start" :icon="addOutline" /> Tambah Utang
              </ion-button>
            </ion-buttons>
          </div>
          <p class="app-hero-subtitle">Pantau kewajiban pembayaran, jatuh tempo, serta status pelunasan utang Anda.</p>
        </div>
      </ion-toolbar>

      <!-- Tabs Segment -->
      <div class="px-3 pb-3">
        <ion-segment v-model="activeTab" class="custom-segment">
          <ion-segment-button value="dashboard">
            <ion-label>Dashboard</ion-label>
          </ion-segment-button>
          <ion-segment-button value="riwayat">
            <ion-label>Riwayat & Detail</ion-label>
          </ion-segment-button>
          <ion-segment-button value="analisa">
            <ion-label>Analisa & Grafik</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>
    </ion-header>

    <ion-content class="app-content-wrap">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <ion-spinner />
        <p class="text-muted mt-2">Memuat data utang...</p>
      </div>

      <div v-else>
        <!-- ==================== TAB 1: DASHBOARD ==================== -->
        <div v-show="activeTab === 'dashboard'" class="ion-padding">
          <!-- Summary Cards Grid -->
          <ion-grid class="mx-2">
            <ion-row>
              <!-- Total Utang -->
              <ion-col size="6" size-md="3">
                <ion-card class="mobile-card m-0 h-100">
                  <ion-card-content class="p-3">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <ion-icon :icon="walletOutline" class="text-primary fs-5" />
                      <small class="text-muted text-xs fw-bold text-uppercase">Total Utang</small>
                    </div>
                    <div class="fs-6 fw-black text-dark mt-1">{{ formatPrice(summary.total) }}</div>
                    <small class="text-muted text-xs">{{ debts.length }} catatan utang</small>
                  </ion-card-content>
                </ion-card>
              </ion-col>

              <!-- Belum Lunas -->
              <ion-col size="6" size-md="3">
                <ion-card class="mobile-card m-0 h-100 border-start border-4 border-warning">
                  <ion-card-content class="p-3">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <ion-icon :icon="alertCircleOutline" class="text-warning fs-5" />
                      <small class="text-muted text-xs fw-bold text-uppercase">Belum Lunas</small>
                    </div>
                    <div class="fs-6 fw-black text-warning mt-1">{{ formatPrice(summary.unpaid) }}</div>
                    <small class="text-muted text-xs">{{ summary.unpaidCount }} utang tersisa</small>
                  </ion-card-content>
                </ion-card>
              </ion-col>

              <!-- Sudah Lunas -->
              <ion-col size="6" size-md="3">
                <ion-card class="mobile-card m-0 h-100 border-start border-4 border-success">
                  <ion-card-content class="p-3">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <ion-icon :icon="checkmarkCircleOutline" class="text-success fs-5" />
                      <small class="text-muted text-xs fw-bold text-uppercase">Sudah Lunas</small>
                    </div>
                    <div class="fs-6 fw-black text-success mt-1">{{ formatPrice(summary.paid) }}</div>
                    <small class="text-muted text-xs">{{ summary.paidCount }} utang selesai</small>
                  </ion-card-content>
                </ion-card>
              </ion-col>

              <!-- Jatuh Tempo Segera -->
              <ion-col size="6" size-md="3">
                <ion-card class="mobile-card m-0 h-100 border-start border-4 border-danger">
                  <ion-card-content class="p-3">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <ion-icon :icon="timeOutline" class="text-danger fs-5" />
                      <small class="text-muted text-xs fw-bold text-uppercase">Jatuh Tempo (&le;7h)</small>
                    </div>
                    <div class="fs-6 fw-black text-danger mt-1">{{ formatPrice(summary.dueSoonAmount) }}</div>
                    <small class="text-danger fw-semibold text-xs">{{ summary.dueSoonCount }} perlu perhatian</small>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>

          <!-- Alert Banner for Overdue -->
          <div v-if="overdueDebtsCount > 0" class="mx-3 my-3 alert alert-danger d-flex align-items-center justify-content-between rounded-3 shadow-sm border-0">
            <div class="d-flex align-items-center gap-2">
              <ion-icon :icon="alertCircleOutline" class="fs-4" />
              <div>
                <strong class="d-block text-sm">Peringatan Jatuh Tempo!</strong>
                <span class="text-xs">Ada {{ overdueDebtsCount }} utang yang sudah melewati batas tanggal jatuh tempo.</span>
              </div>
            </div>
            <button class="btn btn-sm btn-light text-danger fw-bold ms-2 text-nowrap" @click="activeTab = 'riwayat'; statusFilter = 'overdue';">
              Lihat Utang
            </button>
          </div>

          <!-- Progress / Settlement Bar -->
          <div class="mobile-card p-3 mx-3 mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-xs fw-bold text-muted text-uppercase">Tingkat Pelunasan Utang</span>
              <span class="badge" :class="paidPercentage >= 100 ? 'bg-success' : 'bg-primary'">
                {{ paidPercentage }}% Lunas
              </span>
            </div>
            <div class="progress" style="height: 12px; border-radius: 6px;">
              <div 
                class="progress-bar bg-success progress-bar-striped progress-bar-animated" 
                role="progressbar" 
                :style="{ width: paidPercentage + '%' }" 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
          </div>

          <!-- Charts Section -->
          <ion-grid class="mx-2">
            <ion-row>
              <!-- Bar Chart: 5 Utang Terbesar -->
              <ion-col size="12" size-md="7">
                <ion-card class="mobile-card m-0 h-100">
                  <ion-card-content class="container-padded">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <h6 class="fw-bold text-dark mb-0">5 Utang Terbesar</h6>
                      <span class="badge bg-light text-muted border text-xs">Pemberi Utang</span>
                    </div>
                    <VueApexCharts 
                      v-if="topDebtsChartSeries[0].data.some(v => v > 0)"
                      :key="'top-' + debts.length"
                      type="bar" 
                      height="240" 
                      :options="topDebtsChartOptions" 
                      :series="topDebtsChartSeries" 
                    />
                    <div v-else class="text-center py-4 text-muted text-sm">Belum ada data utang untuk ditampilkan.</div>
                  </ion-card-content>
                </ion-card>
              </ion-col>

              <!-- Donut Chart: Status Breakdown -->
              <ion-col size="12" size-md="5">
                <ion-card class="mobile-card m-0 h-100">
                  <ion-card-content class="container-padded">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <h6 class="fw-bold text-dark mb-0">Status Pelunasan</h6>
                      <span class="badge bg-light text-muted border text-xs">Proporsi</span>
                    </div>
                    <VueApexCharts 
                      v-if="statusDonutSeries.some(v => v > 0)"
                      :key="'donut-' + debts.length"
                      type="donut" 
                      height="240" 
                      :options="statusDonutOptions" 
                      :series="statusDonutSeries" 
                    />
                    <div v-else class="text-center py-4 text-muted text-sm">Belum ada data status.</div>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>

        <!-- ==================== TAB 2: RIWAYAT & DETAIL ==================== -->
        <div v-show="activeTab === 'riwayat'" class="ion-padding">
          <!-- Filter & Search Controls -->
          <div class="mobile-card p-3 mb-3 mx-3">
            <div class="row g-2 align-items-center">
              <div class="col-12 col-md-5">
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  class="form-control app-control" 
                  placeholder="Cari nama pemberi utang..." 
                />
              </div>

              <div class="col-6 col-md-4">
                <select v-model="statusFilter" class="form-select app-control">
                  <option value="all">Semua Status ({{ debts.length }})</option>
                  <option value="unpaid">Belum Lunas ({{ summary.unpaidCount }})</option>
                  <option value="paid">Lunas ({{ summary.paidCount }})</option>
                  <option value="overdue">Terlewat Jatuh Tempo ({{ overdueDebtsCount }})</option>
                </select>
              </div>

              <div class="col-6 col-md-3">
                <select v-model="sortBy" class="form-select app-control">
                  <option value="dueDateAsc">Jatuh Tempo (Terdekat)</option>
                  <option value="amountDesc">Nominal (Terbesar)</option>
                  <option value="newest">Terbaru</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Debt Items List -->
          <div v-if="filteredDebts.length > 0" class="row mx-2">
            <div v-for="debt in filteredDebts" :key="debt.id" class="col-12 col-sm-6 col-lg-4 g-2 m-0 mb-2 px-2">
              <div 
                class="mobile-card-sm h-100 p-3 d-flex flex-column justify-content-between border-start border-4"
                :class="getCardBorderClass(debt)"
              >
                <div>
                  <!-- Card Header: Status & Due Info -->
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge text-xs" :class="getStatusBadgeClass(debt)">
                      {{ isPaid(debt) ? 'Lunas' : 'Belum Lunas' }}
                    </span>

                    <span class="text-xs fw-semibold" :class="getDueDateColorClass(debt)">
                      <ion-icon :icon="calendarOutline" class="me-1 align-text-bottom" />
                      {{ formatDate(debt.dueDate) }}
                    </span>
                  </div>

                  <!-- Lender & Amount -->
                  <div class="mb-2">
                    <h6 class="fw-bold text-dark m-0 text-truncate" :title="debt.lender">{{ debt.lender }}</h6>
                    <div class="fs-5 fw-black mt-1" :class="isPaid(debt) ? 'text-success' : 'text-danger'">
                      {{ formatPrice(debt.amount) }}
                    </div>
                  </div>

                  <!-- Countdown Tag -->
                  <div v-if="!isPaid(debt)" class="mb-2">
                    <span class="badge bg-light text-dark border text-xs fw-normal">
                      {{ getDueDateCountdown(debt.dueDate) }}
                    </span>
                  </div>
                </div>

                <!-- Footer Actions -->
                <div class="d-flex align-items-center justify-content-between pt-2 border-top mt-2">
                  <!-- Toggle Status Button -->
                  <button 
                    class="btn btn-sm text-xs fw-bold px-2 py-1"
                    :class="isPaid(debt) ? 'btn-outline-warning' : 'btn-outline-success'"
                    @click="togglePaidStatus(debt)"
                    title="Ubah Status Pelunasan"
                  >
                    <ion-icon :icon="isPaid(debt) ? closeCircleOutline : checkmarkDoneOutline" class="me-1" />
                    {{ isPaid(debt) ? 'Batal Lunas' : 'Tandai Lunas' }}
                  </button>

                  <div class="d-flex align-items-center gap-1">
                    <button class="btn btn-light btn-sm text-primary" @click="openModal(debt.id)" title="Edit">
                      <ion-icon :icon="pencilOutline" />
                    </button>
                    <button class="btn btn-light btn-sm text-danger" @click="onDelete(debt.id)" title="Hapus">
                      <ion-icon :icon="trashOutline" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-5 text-muted mobile-card p-4 mx-3">
            <ion-icon :icon="walletOutline" style="font-size: 3.5rem; color: #cbd5e1;" />
            <h6 class="fw-bold mt-3 text-secondary">Tidak Ada Utang Ditemukan</h6>
            <p class="text-sm">
              {{ searchQuery ? 'Tidak ada data utang yang cocok dengan kata kunci.' : 'Klik "Tambah Utang" untuk mencatat kewajiban utang baru.' }}
            </p>
            <button class="btn btn-action primary btn-sm mt-2" @click="openModal()">
              <ion-icon :icon="addOutline" class="me-1" /> Tambah Utang Pertama
            </button>
          </div>
        </div>

        <!-- ==================== TAB 3: ANALISA & GRAFIK ==================== -->
        <div v-show="activeTab === 'analisa'" class="ion-padding">
          <ion-grid class="mx-2">
            <ion-row>
              <!-- Timeline/Trend Chart -->
              <ion-col size="12" size-lg="8">
                <ion-card class="mobile-card m-0 h-100">
                  <ion-card-content class="container-padded">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 class="fw-bold text-dark mb-0">Trend Jadwal Jatuh Tempo Utang</h6>
                        <small class="text-muted text-xs">Distribusi akumulasi utang berdasarkan bulan jatuh tempo</small>
                      </div>
                    </div>
                    <VueApexCharts 
                      v-if="dueTrendChartSeries[0].data.some(v => v > 0)"
                      :key="'trend-' + debts.length"
                      type="area" 
                      height="260" 
                      :options="dueTrendChartOptions" 
                      :series="dueTrendChartSeries" 
                    />
                    <div v-else class="text-center py-4 text-muted text-sm">Belum ada data trend jatuh tempo.</div>
                  </ion-card-content>
                </ion-card>
              </ion-col>

              <!-- Recommendations & Health Card -->
              <ion-col size="12" size-lg="4">
                <ion-card class="mobile-card m-0 h-100">
                  <ion-card-content class="container-padded">
                    <h6 class="fw-bold text-dark mb-3">Analisis Kesehatan Utang</h6>
                    
                    <div class="mb-3">
                      <div class="d-flex justify-content-between text-xs mb-1">
                        <span class="text-muted">Total Kewajiban</span>
                        <span class="fw-bold text-dark">{{ formatPrice(summary.total) }}</span>
                      </div>
                      <div class="d-flex justify-content-between text-xs mb-1">
                        <span class="text-muted">Telah Dilunasi</span>
                        <span class="fw-bold text-success">{{ formatPrice(summary.paid) }}</span>
                      </div>
                      <div class="d-flex justify-content-between text-xs mb-1">
                        <span class="text-muted">Tunggakan Belum Lunas</span>
                        <span class="fw-bold text-danger">{{ formatPrice(summary.unpaid) }}</span>
                      </div>
                    </div>

                    <hr class="my-3" />

                    <h6 class="fw-bold text-dark text-xs text-uppercase mb-2">Saran Pelunasan</h6>
                    <ul class="ps-3 text-xs text-muted mb-0 d-flex flex-column gap-2">
                      <li>Utamakan pelunasan utang yang <strong>sudah terlewat jatuh tempo</strong> untuk menghindari denda/bunga tambahan.</li>
                      <li>Alokasikan pembayaran rutin bulanan secara konsisten sebelum tanggal jatuh tempo.</li>
                      <li>Manfaatkan fitur 1-klik "Tandai Lunas" untuk mencatat pembayaran utang secara real-time.</li>
                    </ul>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>
      </div>
    </ion-content>

    <!-- Modal Form Utang -->
    <DebtModal v-model:is-open="isModalOpen" :debt-id="selectedDebtId" @saved="fetchAll" />
  </ion-page>
</template>

<script>
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { 
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, 
  IonIcon, IonButtons, IonSegment, IonSegmentButton, IonLabel, 
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonSpinner, 
  alertController 
} from '@ionic/vue'
import { 
  addOutline, trashOutline, createOutline, pencilOutline, 
  checkmarkCircleOutline, timeOutline, alertCircleOutline, walletOutline, 
  calendarOutline, checkmarkDoneOutline, closeCircleOutline 
} from 'ionicons/icons'
import { debtsRepo } from '../../../db/repositories'
import DebtModal from './DebtModal.vue'

const VueApexCharts = defineAsyncComponent(() => import("vue3-apexcharts"))

export default {
  name: 'AccountingDebtsListView',
  components: { 
    IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, 
    IonIcon, IonButtons, IonSegment, IonSegmentButton, IonLabel, 
    IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonSpinner, 
    DebtModal, VueApexCharts 
  },
  setup() {
    const activeTab = ref('dashboard')
    const loading = ref(false)
    const debts = ref([])
    const isModalOpen = ref(false)
    const selectedDebtId = ref(null)

    // Filters & Search
    const searchQuery = ref('')
    const statusFilter = ref('all')
    const sortBy = ref('dueDateAsc')

    const fetchAll = async () => {
      loading.value = true
      try {
        debts.value = await debtsRepo.getAll()
      } catch (err) {
        console.error('Error fetching debts:', err)
      } finally {
        loading.value = false
      }
    }

    const openModal = (id = null) => {
      selectedDebtId.value = id
      isModalOpen.value = true
    }

    const onDelete = async (id) => {
      const alert = await alertController.create({
        header: 'Konfirmasi Hapus',
        message: 'Yakin ingin menghapus data utang ini?',
        buttons: [
          { text: 'Batal', role: 'cancel' },
          { 
            text: 'Hapus', 
            role: 'destructive', 
            handler: async () => { 
              await debtsRepo.delete(id)
              await fetchAll() 
            } 
          }
        ]
      })
      await alert.present()
    }

    const isPaid = (debt) => {
      return debt && (debt.status === 'Lunas' || debt.status === 'Paid')
    }

    const togglePaidStatus = async (debt) => {
      const newStatus = isPaid(debt) ? 'Belum Lunas' : 'Lunas'
      await debtsRepo.update(debt.id, { ...debt, status: newStatus })
      await fetchAll()
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        maximumFractionDigits: 0 
      }).format(Number(price || 0))
    }

    const formatDate = (d) => {
      if (!d) return '-'
      const date = new Date(d)
      if (isNaN(date.getTime())) return d
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const getDueDateDiffDays = (dueDateStr) => {
      if (!dueDateStr) return 999
      const due = new Date(dueDateStr)
      if (isNaN(due.getTime())) return 999
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      due.setHours(0, 0, 0, 0)
      const diffMs = due.getTime() - today.getTime()
      return Math.round(diffMs / (1000 * 60 * 60 * 24))
    }

    const getDueDateCountdown = (dueDateStr) => {
      const diff = getDueDateDiffDays(dueDateStr)
      if (diff === 999) return '-'
      if (diff < 0) return `Terlewat ${Math.abs(diff)} hari`
      if (diff === 0) return 'Jatuh tempo hari ini!'
      return `${diff} hari lagi`
    }

    const getCardBorderClass = (debt) => {
      if (isPaid(debt)) return 'border-success'
      const diff = getDueDateDiffDays(debt.dueDate)
      if (diff < 0) return 'border-danger'
      if (diff <= 7) return 'border-warning'
      return 'border-primary'
    }

    const getStatusBadgeClass = (debt) => {
      if (isPaid(debt)) return 'bg-success text-white'
      const diff = getDueDateDiffDays(debt.dueDate)
      if (diff < 0) return 'bg-danger text-white'
      return 'bg-warning text-dark'
    }

    const getDueDateColorClass = (debt) => {
      if (isPaid(debt)) return 'text-muted'
      const diff = getDueDateDiffDays(debt.dueDate)
      if (diff < 0) return 'text-danger fw-bold'
      if (diff <= 7) return 'text-warning fw-bold'
      return 'text-muted'
    }

    // Summary calculations
    const summary = computed(() => {
      let total = 0
      let paid = 0
      let unpaid = 0
      let paidCount = 0
      let unpaidCount = 0
      let dueSoonAmount = 0
      let dueSoonCount = 0

      debts.value.forEach(d => {
        const amt = Number(d.amount || 0)
        total += amt
        if (isPaid(d)) {
          paid += amt
          paidCount++
        } else {
          unpaid += amt
          unpaidCount++
          const diff = getDueDateDiffDays(d.dueDate)
          if (diff <= 7) {
            dueSoonAmount += amt
            dueSoonCount++
          }
        }
      })

      return {
        total, paid, unpaid, paidCount, unpaidCount, dueSoonAmount, dueSoonCount
      }
    })

    const overdueDebtsCount = computed(() => {
      return debts.value.filter(d => !isPaid(d) && getDueDateDiffDays(d.dueDate) < 0).length
    })

    const paidPercentage = computed(() => {
      if (!summary.value.total) return 0
      return Math.round((summary.value.paid / summary.value.total) * 100)
    })

    // Filtered & Sorted Debts
    const filteredDebts = computed(() => {
      const q = searchQuery.value.toLowerCase().trim()
      let list = debts.value.filter(d => {
        if (q && !(d.lender || '').toLowerCase().includes(q)) {
          return false
        }
        if (statusFilter.value === 'unpaid') return !isPaid(d)
        if (statusFilter.value === 'paid') return isPaid(d)
        if (statusFilter.value === 'overdue') return !isPaid(d) && getDueDateDiffDays(d.dueDate) < 0
        return true
      })

      return list.sort((a, b) => {
        if (sortBy.value === 'dueDateAsc') {
          return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime()
        }
        if (sortBy.value === 'amountDesc') {
          return Number(b.amount || 0) - Number(a.amount || 0)
        }
        // newest default
        return (b.id || 0) - (a.id || 0)
      })
    })

    // Chart 1: Top 5 Highest Debts (Bar)
    const topDebtsChartSeries = computed(() => {
      const top5 = [...debts.value]
        .filter(d => !isPaid(d))
        .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
        .slice(0, 5)

      return [{
        name: 'Jumlah Utang',
        data: top5.map(d => Number(d.amount || 0))
      }]
    })

    const topDebtsChartOptions = computed(() => {
      const top5 = [...debts.value]
        .filter(d => !isPaid(d))
        .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
        .slice(0, 5)

      return {
        chart: { toolbar: { show: false } },
        colors: ['#3b82f6'],
        plotOptions: { bar: { borderRadius: 6, horizontal: true } },
        dataLabels: { enabled: false },
        xaxis: {
          categories: top5.map(d => d.lender || 'Tanpa Nama'),
          labels: {
            formatter: (val) => 'Rp' + (val / 1000).toLocaleString('id-ID') + 'k'
          }
        },
        tooltip: {
          y: { formatter: (val) => formatPrice(val) }
        }
      }
    })

    // Chart 2: Status Donut
    const statusDonutSeries = computed(() => {
      return [
        summary.value.unpaidCount,
        summary.value.paidCount,
        overdueDebtsCount.value
      ]
    })

    const statusDonutOptions = computed(() => ({
      chart: { type: 'donut' },
      colors: ['#f59e0b', '#10b981', '#ef4444'],
      labels: ['Belum Lunas', 'Sudah Lunas', 'Terlewat'],
      legend: { position: 'bottom' },
      dataLabels: { enabled: true }
    }))

    // Chart 3: Due Date Trend (Area)
    const dueTrendChartSeries = computed(() => {
      const monthMap = {}
      debts.value.forEach(d => {
        if (!d.dueDate) return
        const date = new Date(d.dueDate)
        if (isNaN(date.getTime())) return
        const key = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
        monthMap[key] = (monthMap[key] || 0) + Number(d.amount || 0)
      })

      const categories = Object.keys(monthMap)
      const data = categories.map(k => monthMap[k])

      return [{
        name: 'Target Pelunasan',
        data
      }]
    })

    const dueTrendChartOptions = computed(() => {
      const monthMap = {}
      debts.value.forEach(d => {
        if (!d.dueDate) return
        const date = new Date(d.dueDate)
        if (isNaN(date.getTime())) return
        const key = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
        monthMap[key] = (monthMap[key] || 0) + Number(d.amount || 0)
      })

      return {
        chart: { toolbar: { show: false } },
        colors: ['#6366f1'],
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 } },
        xaxis: { categories: Object.keys(monthMap) },
        yaxis: { labels: { formatter: (val) => 'Rp' + (val / 1000).toLocaleString('id-ID') + 'k' } },
        tooltip: { y: { formatter: (val) => formatPrice(val) } }
      }
    })

    onMounted(fetchAll)

    return {
      activeTab, loading, debts, isModalOpen, selectedDebtId,
      searchQuery, statusFilter, sortBy, filteredDebts,
      summary, overdueDebtsCount, paidPercentage,
      topDebtsChartSeries, topDebtsChartOptions,
      statusDonutSeries, statusDonutOptions,
      dueTrendChartSeries, dueTrendChartOptions,
      fetchAll, openModal, onDelete, togglePaidStatus, isPaid,
      getCardBorderClass, getStatusBadgeClass, getDueDateColorClass, getDueDateCountdown,
      formatPrice, formatDate,
      addOutline, trashOutline, createOutline, pencilOutline,
      walletOutline, alertCircleOutline, checkmarkCircleOutline, timeOutline,
      calendarOutline, checkmarkDoneOutline, closeCircleOutline
    }
  }
}
</script>
