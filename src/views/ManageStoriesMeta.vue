<script setup>
import { onMounted, watch } from "vue";
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import StoryMetaCard from "../components/StoryMetaCard.vue";
import MetaService from "../services/MetaService";

const route = useRoute();
const router = useRouter();

const storiesMeta = ref([]);
const isAdd = ref(false);
const user = ref(null);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const metaInfo = ref({
  name: "",
});
const isEditMode = ref(false);
const editId = ref(null);

const metaType = ref(null);
const metaTypeName = ref(null);
const formRef = ref(null);
const inputRules = ref({
  required: [(v) => !!v || "Text Required"],
});

async function getListData() {
  let apiPath = `${metaTypeName.value}api/${metaTypeName.value}`;
  if (metaTypeName.value === "historytracking") {
    apiPath = `storyTeller/chathistory`;
  }
  await MetaService.getItems(apiPath)
    .then((response) => {
      storiesMeta.value = response.data;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function createItem() {
  const isFormValid = await formRef.value.validate();
  if (isFormValid.valid) {
    const apiPath = `${metaTypeName.value}api/${metaTypeName.value}`;
    await MetaService.addItem(apiPath, metaInfo.value)
      .then(() => {
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = `${metaInfo.value.name} ${metaTypeName.value} added successfully!`;
        closeForm();
      })
      .catch((error) => {
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
    await getListData();
  }
}

async function updateItem() {
  const isFormValid = await formRef.value.validate();
  if (isFormValid.valid) {
    const apiPath = `${metaTypeName.value}api/${metaTypeName.value}/${editId.value}`;
    await MetaService.updateItem(apiPath, metaInfo.value)
      .then(() => {
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = `${metaInfo.value.name} ${metaTypeName.value} updated successfully!`;
        closeForm();
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
    await getListData();
  }
}

async function getItem(id) {
  const apiPath = `${metaTypeName.value}api/${metaTypeName.value}/${id}`;
  await MetaService.getItem(apiPath)
    .then((itemData) => {
      metaInfo.value = itemData.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

function openForm() {
  isAdd.value = true;
}

function closeForm() {
  isAdd.value = false;
  metaInfo.value = { name: "" };
  isEditMode.value = false;
  editId.value = null;
}

function closeSnackBar() {
  snackbar.value.value = false;
}
function handleEdit(id) {
  editId.value = id;
  openForm();
  isEditMode.value = true;
  getItem(id);
}

const handleRouteChange = async () => {
  const user = localStorage.getItem("user") || "{}";
  const { token = "", role = "" } = JSON.parse(user);
  if (!token || !role || role !== "admin") router.push({ name: "login" });

  metaType.value = route.params.metaType;
  if (metaType.value === "categories") {
    metaTypeName.value = "category";
  } else if (metaType.value === "languages") {
    metaTypeName.value = "language";
  } else if (metaType.value === "timeperiods") {
    metaTypeName.value = "timeperiod";
  } else if (metaType.value === "historytracking") {
    metaTypeName.value = "historytracking";
  } else {
    metaTypeName.value = "country";
  }
  console.log(metaTypeName.value);
  await getListData();
};

onMounted(async () => {
  handleRouteChange();
});
watch(() => route.params, handleRouteChange);
</script>

<template>
  <v-container>
    <div id="body">
      <v-row align="center" class="mb-4">
        <v-col cols="8"
          ><v-card-title class="pl-0 text-h4 font-weight-bold"
            >{{ `Manage ${metaType}` }}
          </v-card-title>
        </v-col>
        <v-col
          class="d-flex justify-end"
          cols="4"
          v-if="metaTypeName !== 'historytracking'"
        >
          <v-btn color="accent" @click="openForm()" append-icon="mdi-plus">{{
            `Create ${metaTypeName}`
          }}</v-btn>
        </v-col>
      </v-row>
      <StoryMetaCard
        v-for="storyMeta in storiesMeta"
        :key="storyMeta.id"
        :storyMeta="storyMeta"
        :metaTypeName="metaTypeName"
        @getListData="getListData()"
        @openForm="openForm()"
        @handleEdit="handleEdit"
        v-show="storiesMeta.length && storiesMeta !== 0"
      />
      <v-card
        class="rounded-lg elevation-5 mb-8"
        v-show="!storiesMeta || storiesMeta.length === 0"
      >
        <v-card-title class="headline" align="center"
          >NO DETAILS FOUND MATCHING THIS CRITERIA</v-card-title
        >
      </v-card>
      <v-dialog persistent v-model="isAdd" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">{{
            isEditMode ? `Update ${metaTypeName}` : `Create ${metaTypeName}`
          }}</v-card-title>
          <v-form
            @submit.prevent="isEditMode ? updateItem() : createItem()"
            ref="formRef"
          >
            <v-card-text>
              <v-text-field
                v-model="metaInfo.name"
                :label="`Enter ${metaTypeName} name`"
                :rules="inputRules.required"
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn variant="flat" color="secondary" @click="closeForm()"
                >Close</v-btn
              >
              <v-btn variant="flat" color="primary" type="submit">{{
                isEditMode ? `Update ${metaTypeName}` : `Create ${metaTypeName}`
              }}</v-btn>
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