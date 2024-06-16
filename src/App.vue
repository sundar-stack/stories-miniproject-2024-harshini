<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import MenuBar from "./components/MenuBar.vue";

const router = useRouter();
const route = useRoute();
const routePath = ref("/");

const handleAuth = () => {
  const userInfo = localStorage.getItem("user") || "{}";
  const { token = "", role = "" } = JSON.parse(userInfo);
  if (!token || !role) router.push({ name: "login" });
  routePath.value = route.path;
};

watch(() => route.params, handleAuth);
</script>


<template>
  <v-app :style="{ background: '#F4F4F4' }">
    <MenuBar :key="$route.fullPath" v-if="routePath !== '/'" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>