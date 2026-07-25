<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('update:isOpen', false)">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ categoryId ? 'Edit Kategori' : 'Tambah Kategori' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('update:isOpen', false)">Batal</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap bg-light ion-padding">
      <div class="mobile-card p-4">
        <h5 class="fw-bold text-dark mb-4">Informasi Kategori</h5>

        <div class="form-stack">
          <div class="field-group mb-4">
            <label class="field-label">Nama Kategori</label>
            <input type="text" v-model="name" class="form-control app-control" placeholder="Contoh: Makanan, Minuman, Pakaian" />
          </div>
        </div>
      </div>

      <div class="p-3">
        <button class="btn btn-action primary w-100 py-3 fw-bold fs-6" @click="save">
          Simpan {{ categoryId ? 'Perubahan' : 'Kategori' }}
        </button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script>
import { ref, watch } from 'vue'
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, toastController } from '@ionic/vue';
import { CategoryRepository } from '../../../db/repositories'

export default {
  name: 'CategoryModal',
  props: ['isOpen', 'categoryId'],
  emits: ['update:isOpen', 'saved'],
  components: { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent },
  setup(props, { emit }) {
    const name = ref('')

    const loadCategory = async () => {
      if (props.categoryId) {
        const data = await CategoryRepository.getById(Number(props.categoryId))
        name.value = data?.name || ''
      } else {
        name.value = ''
      }
    }

    watch(() => props.isOpen, (val) => {
      if (val) loadCategory()
    })

    const showToast = async (msg, color = 'danger') => {
      const toast = await toastController.create({
        message: msg,
        duration: 2000,
        color: color,
        position: 'top'
      })
      await toast.present()
    }

    const save = async () => {
      if (!name.value.trim()) {
        await showToast('Nama kategori tidak boleh kosong!')
        return
      }

      if (props.categoryId) {
        await CategoryRepository.update(Number(props.categoryId), { name: name.value.trim() })
        await showToast('Kategori berhasil diperbarui!', 'success')
      } else {
        await CategoryRepository.add({ name: name.value.trim() })
        await showToast('Kategori berhasil ditambahkan!', 'success')
      }
      
      emit('saved')
      emit('update:isOpen', false)
    }

    return { name, save }
  }
}
</script>
