<template>
  <ion-app>
    <AppSidebar />
    <ion-router-outlet id="main-content" />

  </ion-app>
</template>

<script>

import AppSidebar from './layout/AppSidebar.vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { provide, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { App } from '@capacitor/app';

export default {
  name: 'App',
  components: { AppSidebar, IonApp, IonRouterOutlet },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    provide('sidebarVisible', store.state.sidebarVisible);

    let lastBackPress = 0;
    let backListener;

    const handleBackButton = async ({ canGoBack }) => {
      // Nested detail pages must return to their list page.
      if (route.name === 'FinancialRecordsDetails') {
        await router.replace('/buku_kas');
        return;
      }

      if (canGoBack && window.history.length > 1) {
        await router.back();
        return;
      }

      if (route.name === 'Dashboard') {
        const now = Date.now();
        if (now - lastBackPress < 2000) {
          await App.exitApp();
        } else {
          lastBackPress = now;
        }
        return;
      }

      await router.replace('/dashboard');
    };

    onMounted(async () => {
      backListener = await App.addListener('backButton', handleBackButton);
    });

    onUnmounted(() => {
      backListener?.remove();
    });
  },
};
</script>

