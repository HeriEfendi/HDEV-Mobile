<template>
  <ion-page class="app-page">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero">
          <div class="d-flex align-items-center justify-content-between">
            <ion-title class="app-hero-title">Kategori Produk</ion-title>
            <ion-buttons slot="end">
              <ion-button class="btn-action primary" @click="createCategory">
                <ion-icon slot="start" :icon="addOutline" /> Tambah
              </ion-button>
            </ion-buttons>
          </div>
          <p class="app-hero-subtitle">Kelola klasifikasi produk Anda untuk manajemen stok yang lebih terorganisir.</p>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap bg-light">
      <div class="px-2 pt-2">
        <div v-if="categories.length === 0" class="empty-state text-center py-5">
          <ion-icon :icon="listOutline" style="font-size: 3rem;" class="text-muted mb-2" />
          <p class="text-muted">Belum ada kategori yang dibuat.</p>
        </div>

        <div v-else class="mobile-card p-3">
          <h6 class="fw-bold text-dark mb-3">Daftar Kategori</h6>
          <div class="list-group list-group-flush">
            <div 
              v-for="cat in categories" 
              :key="cat.id" 
              class="list-group-item d-flex justify-content-between align-items-center py-3 px-1 border-bottom-dashed"
            >
              <div>
                <span class="fw-semibold text-dark fs-6">{{ cat.name }}</span>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-light btn-sm text-primary py-1 px-2 border" @click="editCategory(cat.id)">
                  <ion-icon :icon="createOutline" />
                </button>
                <button class="btn btn-light btn-sm text-danger py-1 px-2 border" @click="confirmDelete(cat.id)">
                  <ion-icon :icon="trashOutline" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ion-alert
        :is-open="deleteId !== null"
        header="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak bisa dibatalkan."
        :buttons="[
          { text: 'Batal', role: 'cancel', handler: () => { deleteId = null } },
          { text: 'Hapus', role: 'destructive', handler: () => { remove() } }
        ]"
        @didDismiss="deleteId = null"
      />
      
      <CategoryModal 
        :isOpen="modalVisible" 
        :categoryId="selectedCategoryId" 
        @update:isOpen="modalVisible = $event" 
        @saved="fetch" 
      />
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { CategoryRepository } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonButtons, IonAlert, toastController } from '@ionic/vue';
import { addOutline, trashOutline, createOutline, listOutline } from 'ionicons/icons';
import CategoryModal from './CategoryModal.vue'

export default {
  name: 'CategoriesListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonButtons, IonAlert, CategoryModal },
  setup() {
    const categories = ref([])
    const deleteId = ref(null)
    const modalVisible = ref(false)
    const selectedCategoryId = ref(null)

    const fetch = async () => {
      categories.value = await CategoryRepository.getAll()
    }

    const editCategory = (id) => {
      selectedCategoryId.value = id
      modalVisible.value = true
    }

    const createCategory = () => {
      selectedCategoryId.value = null
      modalVisible.value = true
    }
    
    const confirmDelete = (id) => {
      deleteId.value = id
    }

    const remove = async () => {
      if (deleteId.value !== null) {
        await CategoryRepository.delete(deleteId.value)
        const toast = await toastController.create({
          message: 'Kategori berhasil dihapus!',
          duration: 2000,
          color: 'success',
          position: 'top'
        })
        await toast.present()
        deleteId.value = null
        await fetch()
      }
    }

    onMounted(fetch)

    return { categories, deleteId, editCategory, createCategory, confirmDelete, remove, addOutline, trashOutline, createOutline, listOutline, modalVisible, selectedCategoryId, fetch }
  }
}
</script>

<style scoped>
.border-bottom-dashed {
  border-bottom: 1px dashed rgba(0,0,0,0.08) !important;
}
.border-bottom-dashed:last-child {
  border-bottom: none !important;
}
</style>
