<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('update:isOpen', false)" class="debt-form-modal">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ debtId ? 'Edit Data Utang' : 'Tambah Utang Baru' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('update:isOpen', false)">Batal</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap bg-light ion-padding">
      <div class="mobile-card p-4 shadow-sm mb-3">
        <div class="form-stack">
          <!-- Pemberi Utang -->
          <div class="field-group mb-3">
            <label class="field-label fw-bold text-dark">
              Pemberi Utang / Lembaga <span class="text-danger">*</span>
            </label>
            <input
              type="text"
              v-model="form.lender"
              class="form-control app-control"
              placeholder="Contoh: Bank BCA, Teman, Supplier, Koperasi"
            />
          </div>

          <!-- Jumlah Utang -->
          <div class="field-group mb-3">
            <label class="field-label fw-bold text-dark">
              Jumlah Total Utang (Rp) <span class="text-danger">*</span>
            </label>
            <NumberInput v-model="form.amount" placeholder="0" />
          </div>

          <!-- Opsi Jatuh Tempo (Bisa Tidak Diisi) -->
          <div class="field-group mb-3 p-3 bg-light rounded-3 border">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div>
                <label class="field-label fw-bold text-dark mb-0 d-block">Tentukan Tanggal Jatuh Tempo?</label>
                <small class="text-muted text-xs">Nonaktifkan jika tidak ada batas tanggal jatuh tempo pasti</small>
              </div>
              <ion-toggle
                :checked="form.hasDueDate"
                @ionChange="form.hasDueDate = $event.detail.checked"
              />
            </div>

            <div v-if="form.hasDueDate" class="mt-2 pt-2 border-top">
              <label class="field-label text-xs fw-semibold text-secondary">Tanggal Batas Jatuh Tempo</label>
              <input type="date" v-model="form.dueDate" class="form-control app-control" />
            </div>
            <div v-else class="text-xs text-muted mt-1 fst-italic">
              * Bebas / Tanpa batas jatuh tempo tertentu.
            </div>
          </div>

          <!-- Skema Pembayaran: Sekaligus vs Dicicil -->
          <div class="field-group mb-3 p-3 bg-light rounded-3 border">
            <label class="field-label fw-bold text-dark mb-2 d-block">Skema / Cara Pembayaran</label>
            <div class="d-flex gap-2 mb-3">
              <button
                type="button"
                class="btn flex-fill py-2 text-xs fw-bold"
                :class="form.paymentType === 'full' ? 'btn-primary' : 'btn-outline-secondary bg-white'"
                @click="form.paymentType = 'full'"
              >
                Bayar Sekaligus
              </button>
              <button
                type="button"
                class="btn flex-fill py-2 text-xs fw-bold"
                :class="form.paymentType === 'installment' ? 'btn-primary' : 'btn-outline-secondary bg-white'"
                @click="form.paymentType = 'installment'"
              >
                Dicicil / Terjadwal
              </button>
            </div>

            <!-- Detail Cicilan jika dicicil -->
            <div v-if="form.paymentType === 'installment'" class="d-flex flex-column gap-2 pt-2 border-top">
              <div>
                <label class="field-label text-xs fw-semibold text-secondary">Frekuensi Jadwal Pembayaran</label>
                <select v-model="form.installmentFrequency" class="form-select app-control">
                  <option value="monthly">Setiap Bulan (Bulanan)</option>
                  <option value="quarterly">3 Bulan Sekali (Per Kuartal)</option>
                  <option value="biannual">6 Bulan Sekali (Per Semester)</option>
                  <option value="annual">1 Tahun Sekali (Tahunan)</option>
                  <option value="custom">Fleksibel / Sesuai Kesepakatan</option>
                </select>
              </div>

              <!-- Tanggal bayar per bulan -->
              <div v-if="form.installmentFrequency !== 'custom'" class="mt-1">
                <label class="field-label text-xs fw-semibold text-secondary">
                  Jadwal Bayar Setiap Tanggal:
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-white text-muted text-xs">Setiap Tanggal</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    v-model.number="form.payDayOfMonth"
                    class="form-control app-control"
                    placeholder="Contoh: 5"
                  />
                  <span class="input-group-text bg-white text-muted text-xs">
                    {{ form.installmentFrequency === 'monthly' ? 'Tiap Bulan' : 'Pada Bulan Jadwal' }}
                  </span>
                </div>
                <small class="text-muted text-xs mt-1 d-block">
                  Contoh: Isi <strong>5</strong> jika pembayaran dilakukan setiap tanggal 5.
                </small>
              </div>

              <!-- Estimasi Nominal Cicilan per Periode (Opsional) -->
              <div class="mt-2">
                <label class="field-label text-xs fw-semibold text-secondary">
                  Estimasi Nominal per Cicilan (Opsional)
                </label>
                <NumberInput v-model="form.installmentAmount" placeholder="Contoh: 500.000" />
              </div>
            </div>
          </div>

          <!-- Status Utang -->
          <div class="field-group mb-3">
            <label class="field-label fw-bold text-dark">Status Pelunasan</label>
            <select v-model="form.status" class="form-control app-control">
              <option value="Belum Lunas">Belum Lunas</option>
              <option value="Lunas">Lunas</option>
            </select>
          </div>

          <!-- Catatan / Keterangan -->
          <div class="field-group mb-2">
            <label class="field-label fw-bold text-dark">Catatan / Keterangan (Opsional)</label>
            <textarea
              v-model="form.notes"
              class="form-control app-control"
              rows="2"
              placeholder="Contoh: Bunga 0%, Rekening tujuan transfer BCA 1234567, dll"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="p-2">
        <button
          class="btn btn-action primary w-100 py-3 fw-bold fs-6 shadow-sm"
          @click="save"
          :disabled="!form.lender || !form.amount || Number(form.amount) <= 0"
        >
          Simpan {{ debtId ? 'Perubahan' : 'Utang' }}
        </button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script>
import { reactive, watch } from 'vue'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonToggle
} from '@ionic/vue'
import { debtsRepo } from '../../../db/repositories'

export default {
  name: 'DebtModal',
  components: {
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonToggle
  },
  props: {
    isOpen: Boolean,
    debtId: Number
  },
  emits: ['update:isOpen', 'saved'],
  setup(props, { emit }) {
    const form = reactive({
      lender: '',
      amount: null,
      hasDueDate: true,
      dueDate: new Date().toISOString().slice(0, 10),
      paymentType: 'full', // 'full' or 'installment'
      installmentFrequency: 'monthly', // 'monthly', 'quarterly', 'biannual', 'annual', 'custom'
      payDayOfMonth: 5,
      installmentAmount: null,
      status: 'Belum Lunas',
      notes: ''
    })

    const load = async () => {
      if (props.debtId) {
        const data = await debtsRepo.getById(props.debtId)
        if (data) {
          form.lender = data.lender || ''
          form.amount = data.amount || 0
          form.hasDueDate = Boolean(data.dueDate)
          form.dueDate = data.dueDate ? String(data.dueDate).slice(0, 10) : new Date().toISOString().slice(0, 10)
          form.paymentType = data.paymentType || (data.installmentFrequency ? 'installment' : 'full')
          form.installmentFrequency = data.installmentFrequency || 'monthly'
          form.payDayOfMonth = data.payDayOfMonth || 5
          form.installmentAmount = data.installmentAmount || null
          form.status = data.status || 'Belum Lunas'
          form.notes = data.notes || ''
        }
      } else {
        form.lender = ''
        form.amount = null
        form.hasDueDate = false
        form.dueDate = new Date().toISOString().slice(0, 10)
        form.paymentType = 'full'
        form.installmentFrequency = 'monthly'
        form.payDayOfMonth = 5
        form.installmentAmount = null
        form.status = 'Belum Lunas'
        form.notes = ''
      }
    }

    watch(() => props.isOpen, (val) => {
      if (val) load()
    })

    const save = async () => {
      if (!form.lender || !form.amount || Number(form.amount) <= 0) return

      const payload = {
        lender: form.lender.trim(),
        amount: Number(form.amount),
        dueDate: form.hasDueDate && form.dueDate ? form.dueDate : null,
        paymentType: form.paymentType,
        installmentFrequency: form.paymentType === 'installment' ? form.installmentFrequency : null,
        payDayOfMonth: form.paymentType === 'installment' ? Number(form.payDayOfMonth || 5) : null,
        installmentAmount: form.paymentType === 'installment' && form.installmentAmount ? Number(form.installmentAmount) : null,
        status: form.status,
        notes: form.notes ? form.notes.trim() : ''
      }

      if (props.debtId) {
        const currentData = await debtsRepo.getById(props.debtId)
        await debtsRepo.update(props.debtId, {
          ...currentData,
          ...payload
        })
      } else {
        await debtsRepo.add({
          ...payload,
          installments: [],
          paidAmount: form.status === 'Lunas' ? Number(form.amount) : 0
        })
      }

      emit('saved')
      emit('update:isOpen', false)
    }

    return { form, save }
  }
}
</script>

<style scoped>
.debt-form-modal {
  --max-width: 540px;
}
</style>
