<template>
  <ion-page>
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero" style="display: flex; flex-direction: column; gap: 8px; padding: 12px 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <ion-title style="padding: 0; font-size: 1.25rem;">Manajemen Produk</ion-title>
            <ion-buttons style="margin: 0;">
              <ion-button class="btn-action primary" @click="openCreate">
                <ion-icon slot="start" :icon="addOutline" /> Tambah
              </ion-button>
            </ion-buttons>
          </div>
          <p style="margin: 0; font-size: 0.85rem; color: #6c757d;">Kelola daftar produk, stok, dan kategori untuk operasional bisnis Anda.</p>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap bg-light">
      <!-- Search Bar -->
      <div class="px-3 pt-3">
        <div class="search-bar-wrap mb-3">
          <input 
            type="text" 
            v-model="searchQuery" 
            class="form-control app-control" 
            placeholder="Cari nama produk..." 
          />
        </div>

        <!-- Category Filter Chips -->
        <div class="filter-chips--mobile mb-3">
          <button 
            type="button" 
            class="btn btn-action btn-sm me-1"
            :class="selectedCategory === 'all' ? 'primary' : 'light'"
            @click="selectedCategory = 'all'"
          >
            Semua
          </button>
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            type="button" 
            class="btn btn-action btn-sm me-1"
            :class="selectedCategory === cat.id ? 'primary' : 'light'"
            @click="selectedCategory = cat.id"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredProducts.length === 0" class="empty-state text-center py-5">
        <ion-icon :icon="basketOutline" style="font-size: 3rem;" class="text-muted mb-2" />
        <p class="text-muted">Tidak ada produk ditemukan.</p>
      </div>

      <!-- Product Grid -->
      <ion-grid class="mx-2">
        <ion-row>
          <ion-col v-for="product in filteredProducts" :key="product.id" size="6" size-sm="4" size-md="3">
            <ion-card class="mobile-card m-0 h-100 d-flex flex-column">
              <ion-card-content class="p-2 d-flex flex-column h-100">
                <div class="position-relative text-center rounded-3 overflow-hidden mb-2" style="height: 100px; background: #f0edff;">
                  <img v-if="product.imageURL" :src="product.imageURL" class="w-100 h-100" style="object-fit: cover;" />
                  <div v-else class="d-flex h-100 align-items-center justify-content-center text-muted"><ion-icon :icon="basketOutline" style="font-size:2rem;" /></div>
                  <span v-if="product.featured === 1" class="badge bg-warning text-dark position-absolute top-0 start-0 m-1" style="font-size: 0.6rem;">Unggulan</span>
                </div>
                <div class="flex-grow-1">
                  <span class="badge bg-secondary mb-1" style="font-size: 0.6rem;">{{ getCategoryName(product.categoryId) }}</span>
                  <h6 class="fw-bold mb-1 text-dark" style="font-size: 0.85rem;">{{ product.name }}</h6>
                  <p class="text-indigo fw-bold mb-2" style="font-size: 0.8rem;">{{ formatPrice(product.price) }}</p>
                  
                </div>
                <div class="border-top pt-2 mt-auto">
                  <div class="mb-2">
                      <span v-if="product.stock === 0" class="badge bg-danger w-100">Habis</span>
                      <span v-else-if="product.stock <= 5" class="badge bg-warning text-dark w-100" style="font-size: 0.7rem;">Stok: {{ product.stock }}</span>
                      <span v-else class="badge bg-success w-100" style="font-size: 0.7rem;">Stok: {{ product.stock }}</span>
                  </div>
                  <div class="d-flex gap-1">
                    <button class="btn btn-light btn-sm flex-fill text-primary" @click="openEdit(product)"><ion-icon :icon="createOutline" /></button>
                    <button class="btn btn-light btn-sm flex-fill text-danger" @click="confirmDelete(product.id)"><ion-icon :icon="trashOutline" /></button>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Delete Alert -->
      <ion-alert
        :is-open="deleteId !== null"
        header="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak bisa dibatalkan."
        :buttons="[
          { text: 'Batal', role: 'cancel', handler: () => { deleteId = null } },
          { text: 'Hapus', role: 'destructive', handler: () => { deleteProduct() } }
        ]"
        @didDismiss="deleteId = null"
      />

      <ProductModal 
        :is-open="dialogCreate || dialogEdit" 
        :is-edit="dialogEdit"
        :product="activeProduct"
        :categories="categories"
        @close="closeModal"
        @save="saveProduct"
      />
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted, computed, toRaw } from 'vue'
import { ProductRepository, CategoryRepository } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonAlert, IonCard, IonCardContent, toastController, onIonViewWillEnter } from '@ionic/vue';
import { addOutline, trashOutline, createOutline, basketOutline, closeOutline } from 'ionicons/icons';
import { readProductImage, saveProductImageFromBase64, deleteProductImage } from '../../../composables/useProductImage';
import ProductModal from './ProductModal.vue';

export default {
  name: 'ProductsListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonAlert, IonCard, IonCardContent, ProductModal },
  setup() {
    const products = ref([])
    const categories = ref([])
    const searchQuery = ref('')
    const selectedCategory = ref('all')
    const deleteId = ref(null)

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

    const getCategoryName = (catId) => {
      const cat = categories.value.find(c => c.id === catId)
      return cat ? cat.name : 'Tanpa Kategori'
    }

    const fetchData = async () => {
      categories.value = await CategoryRepository.getAll()
      const data = await ProductRepository.getAll()
      await Promise.all(data.map(async (product) => {
        if (product.image) {
          product.imageURL = await readProductImage(product.image)
        } else {
          product.imageURL = null
        }
      }))
      products.value = data
    }

    onMounted(fetchData)
    onIonViewWillEnter(fetchData)

    const filteredProducts = computed(() => {
      return products.value.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = selectedCategory.value === 'all' || product.categoryId === selectedCategory.value
        return matchesSearch && matchesCategory
      })
    })

    const deleteProduct = async () => {
      if (deleteId.value !== null) {
        await ProductRepository.delete(deleteId.value)
        const toast = await toastController.create({
          message: 'Produk berhasil dihapus!',
          duration: 2000,
          color: 'success',
          position: 'top'
        })
        await toast.present()
        deleteId.value = null
        await fetchData()
      }
    }

    const dialogCreate = ref(false)
    const dialogEdit = ref(false)
    const activeProduct = ref({ name: '', price: 0, stock: 0, categoryId: null, featured: 0, isFeatured: false })

    const openCreate = () => {
        activeProduct.value = { name: '', price: 0, stock: 0, categoryId: categories.value[0]?.id || null, featured: 0, isFeatured: false }
        dialogCreate.value = true
    }

    const openEdit = (product) => {
        activeProduct.value = { ...product, isFeatured: product.featured === 1 || !!product.isFeatured }
        dialogEdit.value = true
    }

    const confirmDelete = (id) => {
      deleteId.value = id
    }

    const closeModal = () => {
        dialogCreate.value = false
        dialogEdit.value = false
    }

    const showToast = async (message, color = 'danger') => {
        const toast = await toastController.create({
            message,
            duration: 2000,
            color,
            position: 'top'
        })
        await toast.present()
    }

    const saveProduct = async (product) => {
        try {
            const rawProduct = toRaw(product)
            rawProduct.featured = (rawProduct.featured === 1 || rawProduct.isFeatured) ? 1 : 0
            
            // Handle image
            if (rawProduct.pendingBase64) {
                if (rawProduct.image) await deleteProductImage(rawProduct.image)
                rawProduct.image = await saveProductImageFromBase64(rawProduct.pendingBase64, rawProduct.id || Date.now())
                delete rawProduct.pendingBase64
            }

            if (dialogCreate.value) await ProductRepository.add(rawProduct)
            else await ProductRepository.update(rawProduct.id, rawProduct)
            
            await showToast('Produk berhasil disimpan!', 'success')
            closeModal()
            await fetchData()
        } catch (e) {
            console.error('Error saving product:', e)
            await showToast('Gagal menyimpan produk.')
        }
    }

    return {
      products,
      categories,
      searchQuery,
      selectedCategory,
      filteredProducts,
      deleteId,
      dialogCreate,
      dialogEdit,
      activeProduct,
      formatPrice,
      getCategoryName,
      openCreate,
      openEdit,
      closeModal,
      saveProduct,
      confirmDelete,
      deleteProduct,
      addOutline,
      trashOutline,
      createOutline,
      basketOutline
    }
  }
}
</script>

<style scoped>
.product-img-wrap {
  height: 120px;
  background: #f0edff;
  display: grid;
  place-items: center;
}
.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-img-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #b0a0e0;
  width: 100%;
  height: 100%;
}
</style>
