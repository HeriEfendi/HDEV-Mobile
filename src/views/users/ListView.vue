<template>
  <ion-page class="app-page">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero">
          <div class="d-flex align-items-center justify-content-between">
            <ion-title class="app-hero-title">Users</ion-title>
            <ion-buttons slot="end">
              <ion-button class="btn-action primary" @click="createUser">
                <ion-icon slot="start" :icon="addOutline" /> Tambah
              </ion-button>
            </ion-buttons>
          </div>
          <p class="app-hero-subtitle">Manajemen data pengguna dan akses aplikasi.</p>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap">
      <div class="ion-padding">
        <div v-if="loading" class="ion-text-center"><ion-spinner /></div>
        <div v-else class="row mx-2">
          <div v-for="user in users" :key="user.id" class="col-12 col-sm-6 col-lg-4 g-2 m-0 mb-1 px-2">
            <div class="mobile-card-sm h-100 d-flex align-items-center justify-content-between p-2">
              <div class="d-flex align-items-center" style="flex: 1; min-width: 0;">
                <ion-avatar slot="start" class="me-3">
                  <ion-img :src="user.avatar || `https://i.pravatar.cc/150?u=${user.email}`" />
                </ion-avatar>
                <div class="d-flex flex-column" style="min-width: 0;">
                  <h6 class="fw-bold text-dark mb-0 text-truncate medium w-100">{{ user.name }}</h6>
                  <p class="text-muted small mb-0 text-truncate">{{ user.email }}</p>
                  <p class="text-muted small mb-0">Joined: {{ formatDate(user.created_at) }}</p>
                </div>
              </div>

              <div class="d-flex align-items-center gap-1" style="flex: 0;">
                <button class="btn btn-light btn-sm text-primary me-1" @click="editUser(user.id)" title="Edit">
                  <ion-icon :icon="createOutline" />
                </button>
                <button class="btn btn-light btn-sm text-danger" @click="deleteUser(user.id)" title="Hapus">
                  <ion-icon :icon="trashOutline" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <UsersEditModal 
      :isOpen="editModalVisible" 
      :userId="selectedUserId" 
      @update:isOpen="editModalVisible = $event" 
      @saved="fetchUsers" 
    />
  </ion-page>
</template>

<script>
import { ref } from 'vue'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonItem, IonLabel, IonList, IonAvatar, IonImg, IonSpinner, IonIcon, IonCard, IonCardContent, onIonViewWillEnter } from '@ionic/vue';
import { addOutline, trashOutline, createOutline } from 'ionicons/icons';
import { UsersRepository } from '@/db/usersRepository'
import UsersEditModal from './EditView.vue'

export default {
  name: 'UsersListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonItem, IonLabel, IonList, IonAvatar, IonImg, IonSpinner, IonIcon, IonCard, IonCardContent, UsersEditModal },
  setup() {
    const users = ref([])
    const loading = ref(false)
    const editModalVisible = ref(false)
    const selectedUserId = ref(null)

    const fetchUsers = async () => {
      loading.value = true
      try {
        users.value = await UsersRepository.getAll()
      } finally {
        loading.value = false
      }
    }

    const editUser = (id) => {
      selectedUserId.value = id
      editModalVisible.value = true
    }

    const createUser = () => {
      selectedUserId.value = null
      editModalVisible.value = true
    }

    const deleteUser = async (id) => {
      if (confirm('Yakin ingin menghapus user ini?')) {
        await UsersRepository.delete(id)
        await fetchUsers()
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    }

    onIonViewWillEnter(fetchUsers)

    return { users, loading, deleteUser, formatDate, addOutline, trashOutline, createOutline, editModalVisible, selectedUserId, editUser, createUser, fetchUsers }
  }
}
</script>
