<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('update:isOpen', false)">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ incomeId ? 'Edit Pendapatan' : 'Tambah Pendapatan' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('update:isOpen', false)">Batal</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap bg-light ion-padding">
      <div class="mobile-card p-4">
        <div class="form-stack">
          <div class="field-group mb-3">
            <label class="field-label">Deskripsi</label>
            <input type="text" v-model="form.description" class="form-control app-control" placeholder="Contoh: Gaji, Penjualan" />
          </div>
          
          <div class="field-group mb-3">
            <label class="field-label">Jumlah (Rp)</label>
            <NumberInput v-model="form.amount" placeholder="0" />
          </div>

          <div class="field-group mb-3">
            <label class="field-label">Tanggal</label>
            <input type="date" v-model="form.date" class="form-control app-control" />
          </div>

          <div class="field-group mb-3">
            <label class="field-label">Kategori</label>
            <select v-model="form.category" class="form-control app-control">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="p-3">
        <button class="btn btn-action primary w-100 py-3 fw-bold fs-6" @click="save" :disabled="!form.description || form.amount <= 0">
          Simpan {{ incomeId ? 'Perubahan' : 'Pendapatan' }}
        </button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script>
import { ref, watch, reactive } from 'vue'
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from '@ionic/vue';
import { incomesRepo } from '../../../db/repositories'

export default {
  name: 'IncomeModal',
  components: { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent },
  props: {
    isOpen: Boolean,
    incomeId: Number
  },
  emits: ['update:isOpen', 'saved'],
  setup(props, { emit }) {
    const categories = [
      'Gaji', 'Penjualan', 'Investasi', 'Hadiah', 'Lain-lain'
    ]
    const form = reactive({
      description: '',
      amount: null,
      date: new Date().toISOString().slice(0, 10),
      category: 'Gaji'
    })

    const load = async () => {
      if (props.incomeId) {
        const data = await incomesRepo.getById(props.incomeId)
        if (data) {
          form.description = data.description || ''
          form.amount = data.amount || 0
          form.date = (data.date || new Date().toISOString()).slice(0, 10)
          form.category = data.category || 'Gaji'
        }
      } else {
        form.description = ''
        form.amount = null
        form.date = new Date().toISOString().slice(0, 10)
        form.category = 'Gaji'
      }
    }

    watch(() => props.isOpen, (val) => { if (val) load() })

    const save = async () => {
      const payload = { ...form, amount: Number(form.amount) }
      if (props.incomeId) {
        await incomesRepo.update(props.incomeId, payload)
      } else {
        await incomesRepo.add(payload)
      }
      emit('saved')
      emit('update:isOpen', false)
    }

    return { form, save, categories }
  }
}
</script>
