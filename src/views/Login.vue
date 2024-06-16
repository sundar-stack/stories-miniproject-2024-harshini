<script setup>
import { onMounted } from "vue";
import { ref, toRaw } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices.js";

const router = useRouter();
const isCreateAccount = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const user = ref({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
});
const loginFormRef = ref(null);
const createAccountFormRef = ref(null);

const inputRules = ref({
  required: [(v) => !!v || "Text Required"],
  email: [
    (v) => !!v || "Text Required",
    (value) => {
      const pattern =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return pattern.test(value) || "Invalid e-mail address";
    },
  ],
  password: [
    (v) => !!v || "Text Required",
    (value) => {
      if (value.length < 8) {
        return "Password should be greater than 8 characters";
      } else {
        return true;
      }
    },
  ],
});

onMounted(async () => {
  const userInfo = localStorage.getItem("user") || "{}";
  const { token = "", role = "" } = JSON.parse(userInfo);
  if (token && role) router.push({ name: "stories" });
});

async function createAccount() {
  const isFormValid = await createAccountFormRef.value.validate();
  if (isFormValid.valid) {
    await UserServices.addUser(user.value)
      .then(() => {
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = "Account created successfully!";
        user.value = {
          first_name: "",
          last_name: "",
          email: "",
          password: "",
        };
        closeCreateAccount();
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = "error";
      });
  }
}

async function signin() {
  const isFormValid = await loginFormRef.value.validate();
  if (isFormValid.valid) {
    await UserServices.loginUser(user)
      .then((data) => {
        window.localStorage.setItem("user", JSON.stringify(data.data));
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = "Sign In successful!";
        router.push({ name: "stories" });
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
  }
}

function openCreateAccount() {
  isCreateAccount.value = true;
}

function closeCreateAccount() {
  isCreateAccount.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <v-container>
    <div class="signin-bg"></div>
    <div id="body" class="signin-body-container">
      <v-card class="rounded-lg elevation-5" width="650">
        <v-card-title class="headline mb-2">Sign In </v-card-title>
        <v-form @submit.prevent="signin()" ref="loginFormRef">
          <v-card-text>
            <v-text-field
              v-model="user.email"
              label="Email"
              :rules="inputRules.email"
            ></v-text-field>

            <v-text-field
              v-model="user.password"
              label="Password"
              :rules="inputRules.password"
            ></v-text-field>
          </v-card-text>
          <v-card-actions class="ml-2 mr-2">
            <v-btn variant="flat" color="secondary" @click="openCreateAccount()"
              >Create Account</v-btn
            >
            <v-spacer></v-spacer>

            <v-btn variant="flat" color="primary" type="submit">Sign In</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>

      <v-dialog persistent v-model="isCreateAccount" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">Sign Up </v-card-title>
          <v-form @submit.prevent="createAccount()" ref="createAccountFormRef">
            <v-card-text>
              <v-text-field
                v-model="user.first_name"
                label="First Name"
                :rules="inputRules.required"
              ></v-text-field>

              <v-text-field
                v-model="user.last_name"
                label="Last Name"
                :rules="inputRules.required"
              ></v-text-field>

              <v-text-field
                v-model="user.email"
                label="Email"
                :rules="inputRules.email"
              ></v-text-field>

              <v-text-field
                v-model="user.password"
                label="Password"
                :rules="inputRules.password"
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                variant="flat"
                color="secondary"
                @click="closeCreateAccount()"
                >Close</v-btn
              >
              <v-btn variant="flat" color="primary" type="submit"
                >Create Account</v-btn
              >
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="snackbar.value" rounded="pill">
        {{ snackbar.text }}

        <template v-slot:actions>
          <v-btn
            :color="snackbar.color"
            variant="text"
            @click="closeSnackBar()"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </v-container>
</template>

<style scoped>
.signin-bg {
  position: absolute;
  inset: 0;
  background: url("./story-bg.jpg") no-repeat center center fixed;
  background-size: cover;
  filter: brightness(0.6);
}
.signin-body-container {
  height: 95dvh;
  display: grid;
  place-items: center;
}
</style>
