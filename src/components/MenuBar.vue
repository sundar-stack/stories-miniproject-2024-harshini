<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices";

const router = useRouter();

const user = ref(null);
const title = ref("STORY TELLER");

onMounted(() => {
  user.value = JSON.parse(localStorage.getItem("user"));
});

function logout() {
  UserServices.logoutUser()
    .then(() => {})
    .catch((error) => {
      console.log(error);
    });
  localStorage.removeItem("user");
  user.value = null;
  router.push({ name: "login" });
}
</script>

<template>
  <div>
    <v-app-bar color="primary" app dark>
      <v-toolbar-title class="title">
        {{ title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <span v-if="user?.role === 'admin'">
        <v-btn class="mx-2" :to="{ name: 'stories' }"> Stories </v-btn>
        <v-btn
          class="mx-2"
          :to="{ name: 'stories-meta', params: { metaType: 'categories' } }"
        >
          Categories
        </v-btn>
        <v-btn
          class="mx-2"
          :to="{ name: 'stories-meta', params: { metaType: 'languages' } }"
        >
          Languages
        </v-btn>
        <v-btn
          class="mx-2"
          :to="{ name: 'stories-meta', params: { metaType: 'countries' } }"
        >
          Countries
        </v-btn>
        <v-btn
          class="mx-2"
          :to="{ name: 'stories-meta', params: { metaType: 'timeperiods' } }"
        >
          Time Periods
        </v-btn>
        <v-btn
          class="mx-2"
          :to="{
            name: 'stories-meta',
            params: { metaType: 'historytracking' },
          }"
        >
          History Tracking
        </v-btn>
      </span>
      <v-menu v-if="user !== null" min-width="200px" rounded>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar class="mx-auto text-center" color="accent" size="large">
              <span class="white--text font-weight-bold">{{
                `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
              }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar color="accent">
                <span class="white--text text-h5">{{
                  `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
                }}</span>
              </v-avatar>
              <h3>{{ `${user.first_name} ${user.last_name}` }}</h3>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text" @click="logout()"> Logout </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>
  </div>
</template>
