<script setup>
import { onMounted, watch } from "vue";
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import StoryCard from "../components/StoryCard.vue";
import MetaService from "../services/MetaService";
import StoriesServices from "../services/StoriesServices";

const route = useRoute();
const router = useRouter();

const stories = ref([]);
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

const metaType = ref(null);
const metaTypeName = ref(null);
const formRef = ref(null);
const inputRules = ref({
  required: [(v) => !!v || "Text Required"],
});

const storyFormData = ref({
  title: "",
  languages: ["english"],
  category: "",
  country: "",
  lead_charecter_male: "",
  lead_charecter_female: "",
  search: "",
  time_period: "",
  updatedStory: "",
});

const categoryNames = ref([]);
const categories = ref([]);
const isFormLoading = ref(false);

const countryNames = ref([]);
const languageNames = ref([]);

const timePeriodNames = ref([]);

onMounted(async () => {
  const authUser = localStorage.getItem("user") || "{}";
  const { token = "", role = "" } = JSON.parse(authUser);
  if (!token || !role) router.push({ name: "login" });
  user.value = JSON.parse(authUser);
  await getListData();
});

async function getCategories() {
  try {
    const res = await MetaService.getItems("categoryapi/category");
    const categoriesData = res.data;
    categories.value = categoriesData;
    categoryNames.value = categoriesData.map((category) => category.name);
  } catch (error) {
    console.log(error);
  }
}

async function getLanguages() {
  try {
    const apiResponse = await MetaService.getItems("languageapi/language");
    const languages = apiResponse.data;
    languageNames.value = languages.map((item) => item.name);
  } catch (error) {
    console.log(error);
  }
}
async function getCountries() {
  try {
    const apiResponse = await MetaService.getItems("countryapi/country");
    const countries = apiResponse.data;
    countryNames.value = countries.map((item) => item.name);
  } catch (error) {
    console.log(error);
  }
}
async function getTimePeriods() {
  try {
    const apiResponse = await MetaService.getItems("timeperiodapi/timeperiod");
    const timePeriod = apiResponse.data;
    timePeriodNames.value = timePeriod.map((item) => item.name);
  } catch (error) {
    console.log(error);
  }
}

async function getListData() {
  await StoriesServices.getStories(user.value.id)
    .then((response) => {
      stories.value = response.data;
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
    const currCategory = categories.value.find(
      (cat) => storyFormData.value.category === cat.name
    );
    const categoryId = currCategory?.id;
    storyFormData.value = {
      ...storyFormData.value,
      userId: user.value.id,
      categoryId: categoryId,
    };
    isFormLoading.value = true;
    await StoriesServices.createStory(storyFormData.value)
      .then(() => {
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = `Story added successfully!`;
        isFormLoading.value = false;
        storyFormData.value = {
          title: "",
          languages: ["english"],
          category: "",
          country: "",
          lead_charecter_male: "",
          lead_charecter_female: "",
          search: "",
          time_period: "",
          updatedStory: "",
        };
        closeForm();
      })
      .catch((error) => {
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
        isFormLoading.value = false;
      });
    await getListData();
  }
}

async function updateItem() {
  const isFormValid = await formRef.value.validate();
  console.log("fdafaf",isFormValid);
  if (isFormValid.valid) {
    const currCategory = categories.value.find(
      (cat) => storyFormData.value.category === cat.name
    );
    const categoryId = currCategory?.id;
    storyFormData.value = {
      ...storyFormData.value,
      userId: user.value.id,
      categoryId: categoryId,
    };
    isFormLoading.value = true;
    await StoriesServices.updateStory(storyFormData.value)
      .then(() => {
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = `Story Upadted Successfully!`;
        isFormLoading.value = false;
        storyFormData.value = {
          title: "",
          languages: ["english"],
          category: "",
          country: "",
          lead_charecter_male: "",
          lead_charecter_female: "",
          search: "",
          time_period: "",
          updatedStory: "",
        };
        closeForm();
      })
      .catch((error) => {
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
        isFormLoading.value = false;
      });
    await getListData();
  }
}

async function openForm() {
  isAdd.value = true;
  await getCategories();
  await getLanguages();
  await getCountries();
  await getTimePeriods();
}

function closeForm() {
  isAdd.value = false;
  metaInfo.value = { name: "" };
  isEditMode.value = false;
  storyFormData.value = {
    title: "",
    languages: ["english"],
    category: "",
    country: "",
    lead_charecter_male: "",
    lead_charecter_female: "",
    search: "",
    time_period: "",
    updatedStory: "",
  };
}

function closeSnackBar() {
  snackbar.value.value = false;
}
function handleEdit(story) {
  const {
    title,
    id,
    categoryName,
    countryName,
    lead_charecter_male,
    lead_charecter_female,
    time_period,
    languages,
    translatedStoryText,
  } = story;
  isEditMode.value = true;
  openForm();
  storyFormData.value = {
    title,
    languages,
    category: categoryName,
    country: countryName,
    lead_charecter_male,
    lead_charecter_female,
    search: "",
    time_period,
    updatedStory: translatedStoryText,
    id
  };
}
</script>

<template>
  <v-container>
    <div id="body">
      <v-row align="center" class="mb-4">
        <v-col cols="8"
          ><v-card-title class="pl-0 text-h4 font-weight-bold"
            >{{ `Manage Stories` }}
          </v-card-title>
        </v-col>
        <v-col class="d-flex justify-end" cols="4">
          <v-btn color="accent" @click="openForm()" append-icon="mdi-plus">{{
            `Create Story`
          }}</v-btn>
        </v-col>
      </v-row>
      <StoryCard
        v-for="story in stories"
        :key="story.id"
        :story="story"
        @getListData="getListData()"
        @openForm="openForm()"
        @handleEdit="handleEdit"
        v-show="stories.length && stories !== 0"
      />
      <v-card
        class="rounded-lg elevation-5 mb-8"
        v-show="!stories || stories.length === 0"
      >
        <v-card-title class="headline" align="center"
          >NO DETAILS FOUND MATCHING THIS CRITERIA</v-card-title
        >
      </v-card>
      <v-dialog persistent v-model="isAdd" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">{{
            isEditMode ? `Update Story` : `Create Story`
          }}</v-card-title>
          <v-form
            @submit.prevent="isEditMode ? updateItem() : createItem()"
            ref="formRef"
          >
            <v-card-text>
              <v-text-field
                v-model="storyFormData.title"
                label="Enter Story Title"
                :rules="inputRules.required"
              ></v-text-field>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="storyFormData.lead_charecter_male"
                    label="Enter Lead Male Character Name"
                    :rules="inputRules.required"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="storyFormData.lead_charecter_female"
                    label="Enter Lead Female Character Name"
                    :rules="inputRules.required"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-select
                    label="Select Story Category"
                    :items="categoryNames"
                    variant="outlined"
                    v-model="storyFormData.category"
                    :rules="inputRules.required"
                    :disabled="isEditMode"
                  ></v-select>
                </v-col>
                <v-col>
                  <v-select
                    label="Select Story Translation Languages"
                    :items="languageNames"
                    variant="outlined"
                    v-model="storyFormData.languages"
                    :rules="inputRules.required"
                    multiple
                    chips
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-select
                    label="Select Country Name"
                    :items="countryNames"
                    variant="outlined"
                    v-model="storyFormData.country"
                    :rules="inputRules.required"
                    :disabled="isEditMode"
                  ></v-select>
                </v-col>
                <v-col>
                  <v-select
                    label="Select Time Period"
                    :items="timePeriodNames"
                    variant="outlined"
                    v-model="storyFormData.time_period"
                    :rules="inputRules.required"
                    :disabled="isEditMode"
                  ></v-select>
                </v-col>
              </v-row>
              <v-text-field
                v-if="!isEditMode"
                v-model="storyFormData.search"
                label="Enter Story Input To Generate AI Story"
                :rules="inputRules.required"
              ></v-text-field>
              <v-textarea
                v-if="isEditMode"
                v-model="storyFormData.updatedStory"
                label="STORY DATA"
                :rules="inputRules.required"
              ></v-textarea>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                :disabled="isFormLoading"
                variant="flat"
                color="secondary"
                @click="closeForm()"
                >Close</v-btn
              >
              <v-btn
                variant="tonal"
                :loading="isFormLoading"
                style="width: 180px; background: #47121d; color: #fff"
                type="submit"
                >{{ isEditMode ? `Update Story` : `Create Story` }}

                <template v-slot:loader>
                  LOADING
                  <v-progress-circular
                    color="secondary"
                    :size="25"
                    class="ml-2"
                    indeterminate
                  ></v-progress-circular>
                </template>
              </v-btn>
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
