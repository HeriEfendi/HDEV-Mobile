<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('update:isOpen', false)">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <ion-buttons slot="end">
            <ion-button @click="$emit('update:isOpen', false)">Batal</ion-button>
        </ion-buttons>
        <ion-title>{{ isEdit ? 'Edit User' : 'Tambah User' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap">
      <div v-if="loading" class="loading-state text-center py-5">
        <ion-spinner />
      </div>
      <ion-card v-else class="mobile-card mx-2">
        <ion-card-content class="form-stack">
          <div class="field-group">
            <label class="field-label">Name</label>
            <input v-model="user.name" class="form-control app-control" placeholder="Nama pengguna" />
          </div>
          <div class="field-group">
            <label class="field-label">Email</label>
            <input type="email" v-model="user.email" class="form-control app-control" placeholder="user@example.com" />
          </div>
          <ion-button expand="block" class="btn-action primary ion-margin-top" :disabled="saving" @click="saveUser">Save User</ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-modal>
</template>

<script>
import { ref, watch } from 'vue'
import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonSpinner, IonCard, IonCardContent, IonButtons, IonIcon } from '@ionic/vue';
import { UsersRepository } from '@/db/usersRepository'

export default {
  name: 'UsersEditModal',
  props: ['isOpen', 'userId'],
  emits: ['update:isOpen', 'saved'],
  components: { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonSpinner, IonCard, IonCardContent, IonButtons, IonIcon },
  setup(props, { emit }) {
    const isEdit = ref(!!props.userId)
    const user = ref({ name: '', email: '' })
    const loading = ref(false)
    const saving = ref(false)

    const fetchUser = async () => {
      if (!props.userId) {
          user.value = { name: '', email: '' }
          return
      }
      loading.value = true
      try {
        user.value = await UsersRepository.getById(parseInt(props.userId))
      } finally {
        loading.value = false
      }
    }

    watch(() => props.isOpen, (val) => {
        if (val) {
            isEdit.value = !!props.userId
            fetchUser()
        }
    })

    const saveUser = async () => {
      if (!user.value.name || !user.value.email) return
      saving.value = true
      try {
        if (isEdit.value) {
            await UsersRepository.update(parseInt(props.userId), user.value)
        } else {
            await UsersRepository.add(user.value)
        }
        emit('saved')
        emit('update:isOpen', false)
      } finally {
        saving.value = false
      }
    }

    return { user, loading, saving, saveUser, isEdit }
  }
}
</script>
