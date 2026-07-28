<template>
  <ion-page class="app-page">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero">
          <div class="d-flex align-items-center justify-content-between">
            <ion-title class="app-hero-title">Utang</ion-title>
            <ion-buttons slot="end">
              <ion-button class="btn-action primary" @click="openModal()">
                <ion-icon slot="start" :icon="addOutline" /> Tambah
              </ion-button>
            </ion-buttons>
          </div>
          <p class="app-hero-subtitle">Kelola utang dan kewajiban pembayaran Anda.</p>
        </div>
      </ion-toolbar>
      <div class="px-3 pb-3">
        <ion-segment v-model="activeTab" class="custom-segment">
          <ion-segment-button value="dashboard">
            <ion-label>Dashboard</ion-label>
          </ion-segment-button>
          <ion-segment-button value="riwayat">
            <ion-label>Riwayat & Detail</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>
    </ion-header>

    <ion-content class="app-content-wrap">
      <!-- DASHBOARD TAB -->
      <div v-show="activeTab === 'dashboard'" class="ion-padding">
        <ion-grid class="mx-2">
          <ion-row>
            <ion-col size="6">
              <ion-card class="mobile-card m-0 h-100">
                <ion-card-content>
                  <small class="text-muted d-block text-xs">Total Utang</small>
                  <div class="fs-6 fw-black text-danger mt-1">{{ formatPrice(summary.total) }}</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="6">
              <ion-card class="mobile-card m-0 h-100">
                <ion-card-content>
                  <small class="text-muted d-block text-xs">Belum Lunas</small>
                  <div class="fs-6 fw-black text-warning mt-1">{{ formatPrice(summary.unpaid) }}</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>

      <!-- RIWAYAT & DETAIL TAB -->
      <div v-show="activeTab === 'riwayat'" class="ion-padding">
        <div v-if="debts.length" class="row mx-2 mb-2">
          <div v-for="debt in debts" :key="debt.id" class="col-12 col-sm-6 col-lg-4 g-2 m-0 mb-1 px-2">
            <div class="mobile-card-sm h-100 d-flex align-items-center justify-content-between p-2">
              <div class="d-flex flex-column" style="flex: 1; min-width: 0;">
                <span class="badge mb-1 small align-self-start" :class="debt.status === 'Paid' ? 'bg-success' : 'bg-warning'">{{ debt.status }}</span>
                <h6 class="fw-bold text-dark mb-0 text-truncate medium w-100">{{ debt.lender }}</h6>
              </div>
              <div class="d-flex flex-column align-items-end text-end me-2" style="flex: 2; min-width: 0;">
                <small class="text-muted medium">{{ formatDate(debt.dueDate) }}</small>
                <span class="text-danger fw-bold medium">{{ formatPrice(debt.amount) }}</span>
              </div>
              <div class="d-flex align-items-center gap-1" style="flex: 0;">
                <button class="btn btn-light btn-sm text-primary me-1" @click="openModal(debt.id)" title="Edit">
                  <ion-icon :icon="createOutline" />
                </button>
                <button class="btn btn-light btn-sm text-danger" @click="onDelete(debt.id)" title="Hapus">
                  <ion-icon :icon="trashOutline" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-5 text-muted mobile-card p-4 mx-3">
          <p>Tidak ada utang ditemukan.</p>
        </div>
      </div>
    </ion-content>
    <DebtModal v-model:is-open="isModalOpen" :debt-id="selectedDebtId" @saved="fetchAll" />
  </ion-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { debtsRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonButtons, IonSegment, IonSegmentButton, IonLabel, IonGrid, IonRow, IonCol, IonCard, IonCardContent, alertController } from '@ionic/vue';
import { addOutline, trashOutline, createOutline } from 'ionicons/icons';
import DebtModal from './DebtModal.vue'

export default {
  name: 'AccountingDebtsListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonButtons, IonSegment, IonSegmentButton, IonLabel, IonGrid, IonRow, IonCol, IonCard, IonCardContent, DebtModal },
  setup() {
    const router = useRouter()
    const activeTab = ref('dashboard')
    const debts = ref([])
    const isModalOpen = ref(false)
    const selectedDebtId = ref(null)

    const fetchAll = async () => { debts.value = await debtsRepo.getAll() }
    
    const openModal = (id = null) => {
      selectedDebtId.value = id
      isModalOpen.value = true
    }

    const onDelete = async (id) => {
      const alert = await alertController.create({
        header: 'Konfirmasi',
        message: 'Yakin ingin hapus data utang ini?',
        buttons: [
          { text: 'Batal', role: 'cancel' },
          { text: 'Hapus', role: 'destructive', handler: async () => { await debtsRepo.delete(id); fetchAll() } }
        ]
      });
      await alert.present();
    }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price || 0))
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'
    
    const summary = computed(() => ({
      total: debts.value.reduce((sum, d) => sum + Number(d.amount || 0), 0),
      unpaid: debts.value.filter(d => d.status !== 'Lunas').reduce((sum, d) => sum + Number(d.amount || 0), 0)
    }))
    
    onMounted(fetchAll)
    return { debts, onDelete, formatPrice, formatDate, addOutline, trashOutline, createOutline, activeTab, summary, openModal, isModalOpen, selectedDebtId, fetchAll }
  }
}
</script>


