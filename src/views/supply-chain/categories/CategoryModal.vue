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
      <div class="mobile-card p-4 mb-3">
        <!-- Preview Kategori -->
        <div class="d-flex align-items-center gap-3 p-3 rounded-3 mb-4" :style="{ background: selectedColor + '15', border: `1.5px solid ${selectedColor}40` }">
          <div class="cat-preview-icon" :style="{ background: selectedColor, color: '#fff' }">
            <ion-icon :icon="selectedIconObj" />
          </div>
          <div>
            <span class="text-xs fw-bold text-uppercase" :style="{ color: selectedColor }">Preview Kategori</span>
            <h5 class="fw-bold text-dark mb-0">{{ name || 'Nama Kategori' }}</h5>
          </div>
        </div>

        <div class="form-stack">
          <!-- Nama Kategori -->
          <div class="field-group mb-4">
            <label class="field-label fw-bold text-dark">Nama Kategori <span class="text-danger">*</span></label>
            <input type="text" v-model="name" class="form-control app-control" placeholder="Contoh: Makanan, Minuman, Pakaian" />
          </div>

          <!-- Pilihan Warna Tag -->
          <div class="field-group mb-4">
            <label class="field-label fw-bold text-dark">Warna Aksen</label>
            <div class="d-flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                v-for="c in colorOptions"
                :key="c"
                class="color-chip-btn"
                :style="{ background: c }"
                :class="{ active: selectedColor === c }"
                @click="selectedColor = c"
              >
                <ion-icon v-if="selectedColor === c" :icon="checkmarkOutline" class="text-white" />
              </button>
            </div>
          </div>

          <!-- Pilihan Ikon -->
          <div class="field-group mb-2">
            <label class="field-label fw-bold text-dark">Ikon Kategori</label>
            <div class="d-flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                v-for="item in iconOptions"
                :key="item.name"
                class="icon-chip-btn"
                :class="{ active: selectedIcon === item.name }"
                @click="selectedIcon = item.name"
              >
                <ion-icon :icon="item.icon" />
                <span class="text-xs">{{ item.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="p-2">
        <button class="btn btn-action primary w-100 py-3 fw-bold fs-6" @click="save">
          Simpan {{ categoryId ? 'Perubahan' : 'Kategori' }}
        </button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, toastController } from '@ionic/vue';
import {
  checkmarkOutline, fastFoodOutline, cafeOutline, shirtOutline,
  colorPaletteOutline, sparklesOutline, basketOutline, pricetagOutline
} from 'ionicons/icons';
import { CategoryRepository } from '../../../db/repositories'

export default {
  name: 'CategoryModal',
  props: ['isOpen', 'categoryId'],
  emits: ['update:isOpen', 'saved'],
  components: { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent },
  setup(props, { emit }) {
    const name = ref('')
    const selectedColor = ref('#10b981')
    const selectedIcon = ref('food')

    const colorOptions = [
      '#10b981', // emerald
      '#0ea5e9', // sky
      '#6366f1', // indigo
      '#8b5cf6', // purple
      '#f59e0b', // amber
      '#ef4444', // red
      '#ec4899', // pink
      '#475569', // slate
    ]

    const iconOptions = [
      { name: 'food', label: 'Makanan', icon: fastFoodOutline },
      { name: 'drink', label: 'Minuman', icon: cafeOutline },
      { name: 'fashion', label: 'Pakaian', icon: shirtOutline },
      { name: 'craft', label: 'Kerajinan', icon: colorPaletteOutline },
      { name: 'retail', label: 'Sembako', icon: basketOutline },
      { name: 'featured', label: 'Spesial', icon: sparklesOutline },
      { name: 'tag', label: 'Umum', icon: pricetagOutline },
    ]

    const selectedIconObj = computed(() => {
      const match = iconOptions.find(i => i.name === selectedIcon.value)
      return match ? match.icon : pricetagOutline
    })

    const loadCategory = async () => {
      if (props.categoryId) {
        const data = await CategoryRepository.getById(Number(props.categoryId))
        name.value = data?.name || ''
        selectedColor.value = data?.color || '#10b981'
        selectedIcon.value = data?.icon || 'food'
      } else {
        name.value = ''
        selectedColor.value = '#10b981'
        selectedIcon.value = 'food'
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

      const payload = {
        name: name.value.trim(),
        color: selectedColor.value,
        icon: selectedIcon.value
      }

      if (props.categoryId) {
        await CategoryRepository.update(Number(props.categoryId), payload)
        await showToast('Kategori berhasil diperbarui!', 'success')
      } else {
        await CategoryRepository.add(payload)
        await showToast('Kategori berhasil ditambahkan!', 'success')
      }
      
      emit('saved')
      emit('update:isOpen', false)
    }

    return {
      name, selectedColor, selectedIcon, colorOptions, iconOptions,
      selectedIconObj, checkmarkOutline, save
    }
  }
}
</script>

<style scoped>
.cat-preview-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 1.4rem;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.12);
}

.color-chip-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid transparent;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}

.color-chip-btn:active {
  transform: scale(0.9);
}

.color-chip-btn.active {
  border-color: #0f172a;
  transform: scale(1.1);
}

.icon-chip-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s;
}

.icon-chip-btn.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #2563eb;
  font-weight: 700;
}
</style>
