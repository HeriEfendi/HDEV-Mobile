<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('update:isOpen', false)">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ debtId ? 'Edit Utang' : 'Tambah Utang' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('update:isOpen', false)">Batal</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap bg-light ion-padding">
      <div class="mobile-card p-4">
        <div class="form-stack">
          <div class="field-group mb-3">
            <label class="field-label">Pemberi Utang</label>
            <input type="text" v-model="form.lender" class="form-control app-control" placeholder="Contoh: Bank, Teman" />
          </div>
          
          <div class="field-group mb-3">
            <label class="field-label">Jumlah (Rp)</label>
            <NumberInput v-model="form.amount" placeholder="0" />
          </div>

          <div class="field-group mb-3">
            <label class="field-label">Jatuh Tempo</label>
            <input type="date" v-model="form.dueDate" class="form-control app-control" />
          </div>

          <div class="field-group mb-3">
            <label class="field-label">Status</label>
            <select v-model="form.status" class="form-control app-control">
              <option value="Belum Lunas">Belum Lunas</option>
              <option value="Lunas">Lunas</option>
            </select>
          </div>
        </div>
      </div>

      <div class="p-3">
        <button class="btn btn-action primary w-100 py-3 fw-bold fs-6" @click="save" :disabled="!form.lender || form.amount <= 0">
          Simpan {{ debtId ? 'Perubahan' : 'Utang' }}
        </button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script>
import { ref, watch, reactive } from 'vue'
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from '@ionic/vue';
import { debtsRepo } from '../../../db/repositories'

export default {
  name: 'DebtModal',
  components: { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent },
  props: {
    isOpen: Boolean,
    debtId: Number
  },
  emits: ['update:isOpen', 'saved'],
  setup(props, { emit }) {
    const form = reactive({
      lender: '',
      amount: null,
      dueDate: new Date().toISOString().slice(0, 10),
      status: 'Belum Lunas'
    })

    const load = async () => {
      if (props.debtId) {
        const data = await debtsRepo.getById(props.debtId)
        if (data) {
          form.lender = data.lender || ''
          form.amount = data.amount || 0
          form.dueDate = (data.dueDate || new Date().toISOString()).slice(0, 10)
          form.status = data.status || 'Belum Lunas'
        }
      } else {
        form.lender = ''
        form.amount = null
        form.dueDate = new Date().toISOString().slice(0, 10)
        form.status = 'Belum Lunas'
      }
    }

    watch(() => props.isOpen, (val) => { if (val) load() })

    const save = async () => {
      const payload = { ...form, amount: Number(form.amount) }
      if (props.debtId) {
        await debtsRepo.update(props.debtId, payload)
      } else {
        await debtsRepo.add(payload)
      }
      emit('saved')
      emit('update:isOpen', false)
    }

    return { form, save }
  }
}
</script>
