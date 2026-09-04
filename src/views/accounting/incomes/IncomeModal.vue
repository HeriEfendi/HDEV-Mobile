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
            <label class="field-label">Kategori Pemasukan (M-05)</label>
            <select v-model="selectedCategoryChoice" class="form-control app-control" @change="onCategoryChange">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              <option value="__custom__">+ Kategori Kustom Baru...</option>
            </select>
          </div>

          <div v-if="selectedCategoryChoice === '__custom__'" class="field-group mb-3">
            <label class="field-label text-primary">Tulis Nama Kategori Kustom</label>
            <input type="text" v-model="customCategoryText" class="form-control app-control" placeholder="Contoh: Sponsor Event, Royalti" />
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
      'Penjualan Toko / POS',
      'Pesanan / Pre-Order / Catering',
      'Jasa & Layanan',
      'Komisi / Titip Jual (Konsinyasi)',
      'Modal Pemilik / Investasi',
      'Gaji / Upah',
      'Hadiah / Bonus',
      'Lain-lain'
    ]

    const selectedCategoryChoice = ref('Penjualan Toko / POS')
    const customCategoryText = ref('')

    const form = reactive({
      description: '',
      amount: null,
      date: new Date().toISOString().slice(0, 10),
      category: 'Penjualan Toko / POS'
    })

    const onCategoryChange = () => {
      if (selectedCategoryChoice.value !== '__custom__') {
        form.category = selectedCategoryChoice.value
      }
    }

    const load = async () => {
      if (props.incomeId) {
        const data = await incomesRepo.getById(props.incomeId)
        if (data) {
          form.description = data.description || ''
          form.amount = data.amount || 0
          form.date = (data.date || new Date().toISOString()).slice(0, 10)
          
          const cat = data.category || 'Penjualan Toko / POS'
          if (categories.includes(cat)) {
            selectedCategoryChoice.value = cat
            customCategoryText.value = ''
          } else {
            selectedCategoryChoice.value = '__custom__'
            customCategoryText.value = cat
          }
          form.category = cat
        }
      } else {
        form.description = ''
        form.amount = null
        form.date = new Date().toISOString().slice(0, 10)
        selectedCategoryChoice.value = 'Penjualan Toko / POS'
        customCategoryText.value = ''
        form.category = 'Penjualan Toko / POS'
      }
    }

    watch(() => props.isOpen, (val) => { if (val) load() })

    const save = async () => {
      const finalCat = selectedCategoryChoice.value === '__custom__'
        ? (customCategoryText.value.trim() || 'Lain-lain')
        : selectedCategoryChoice.value

      const payload = { ...form, category: finalCat, amount: Number(form.amount) }
      if (props.incomeId) {
        await incomesRepo.update(props.incomeId, payload)
      } else {
        await incomesRepo.add(payload)
      }
      emit('saved')
      emit('update:isOpen', false)
    }

    return { form, categories, save, selectedCategoryChoice, customCategoryText, onCategoryChange }
  }
}
</script>
