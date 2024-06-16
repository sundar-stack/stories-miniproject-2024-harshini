<script setup>
import { onMounted, onUpdated, ref, watch } from "vue";
import { useRouter } from "vue-router";
import StoriesServices from "../services/StoriesServices";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const router = useRouter();
const user = ref(null);
const translatedStoryText = ref("");
const translateLanguage = ref("english");
const deleteDialog = ref(false);
const translateLoadingDialog = ref(false);
const showDetails = ref(false);

const props = defineProps({
  story: {
    required: true,
  },
});

const emitActions = defineEmits(["getListData", "handleEdit"]);

const getTranslationText = () => {
  const storyData = props.story.story_language.find(
    (item) => item.language === "english"
  );
  translatedStoryText.value = storyData.story_translation;
};

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  getTranslationText();
});

onUpdated(() => {
  getTranslationText();
});

async function deleteItem(id) {
  await StoriesServices.deleteStory(id);
  emitActions("getListData");
}
function updateItem() {
  emitActions("handleEdit", {
    ...props.story,
    translatedStoryText: translatedStoryText.value,
  });
}
async function handleLanguageChange() {
  translateLoadingDialog.value = true;
  await StoriesServices.translate(props.story.id, translateLanguage.value)
    .then((response) => {
      translatedStoryText.value = response.data.story_translation;
      translateLoadingDialog.value = false;
    })
    .catch((error) => {
      translateLoadingDialog.value = false;
      alert(
        "OOPS! something went wrong while translating please choose a different option"
      );
    });
}

async function handleLike(isLiked) {
  try {
    await StoriesServices.like(props.story.id, isLiked, {
      userId: user.value.id,
    });
    emitActions("getListData");
  } catch (error) {
    console.log(error);
  }
}

watch(translateLanguage, () => handleLanguageChange());

const downloadPDF = () => {
  const { story } = props;
  const doc = new jsPDF();
  doc.text("STORY INFO", 10, 10);
  doc.text(story.title, 10, 20);
  autoTable(doc, {
    margin: { top: 30 },
    head: [
      [
        "Category",
        "Time Period",
        "Country",
        "Leading Character Male",
        "Leading Character Female",
        "Like Count",
        "Dislike Count",
      ],
    ],
    body: [
      [
        story?.categoryName,
        story?.time_period,
        story?.countryName,
        story?.lead_charecter_male,
        story?.lead_charecter_female,
        story?.likes,
        story?.dislikes,
      ],
    ],
  });

  const pageOneStory = translatedStoryText.value.slice(0, 1700);
  const pageTwoStory = translatedStoryText.value.slice(1700);

  const storyPara = doc
    .setFont("courier", "bold")
    .setFontSize(11)
    .splitTextToSize(pageOneStory, 180);

  doc.text(storyPara, 10, 60);

  if (pageTwoStory && pageTwoStory.length) {
    doc.addPage();
    const storyPara2 = doc
      .setFont("courier", "bold")
      .setFontSize(11)
      .splitTextToSize(pageTwoStory, 180);

    doc.text(storyPara2, 10, 10);
  }
  doc.save("story_info.pdf");
};
</script>
<template>
  <v-card class="rounded-lg elevation-5 mb-8">
    <v-card-title class="headline">
      <v-row align="center">
        <v-col cols="7">
          {{ story.title }}
          <v-chip class="ma-2" color="accent" label>
            <v-icon start icon="mdi-palette-swatch-variant"></v-icon>
            Category: {{ story.categoryName }}
          </v-chip>
        </v-col>
        <v-col class="d-flex justify-end align-center">
          <v-btn
            size="small"
            variant="flat"
            color="teal"
            @click.stop="downloadPDF()"
            append-icon="mdi-download"
            elevation="4"
            class="mr-3"
            >Download PDF
          </v-btn>
          <span v-show="user?.role === 'admin' || user?.id === story.userId">
            <v-icon
              size="small"
              icon="mdi-pencil"
              color="blue"
              @click="updateItem"
              class="mr-3"
              :disabled="translateLanguage !== 'english'"
            ></v-icon>
            <v-icon
              size="small"
              icon="mdi-delete-outline"
              color="error"
              @click="deleteDialog = true"
            ></v-icon>
          </span>
          <v-icon
            size="40"
            icon="mdi-plus"
            color="blue"
            v-show="!showDetails"
            @click="showDetails = true"
          ></v-icon>
          <v-icon
            size="40"
            icon="mdi-window-close"
            color="error"
            v-show="showDetails"
            @click="showDetails = false"
          ></v-icon>
          <v-dialog v-model="deleteDialog" width="auto">
            <v-card>
              <v-card-text>
                {{ `Are you sure you want to delete the story ?` }}
              </v-card-text>
              <v-card-actions class="d-flex justify-center">
                <v-btn color="blue" @click="deleteDialog = false">NO</v-btn>
                <v-btn color="error" @click="deleteItem(story.id)">YES</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
    </v-card-title>
    <v-expand-transition>
      <v-card-text class="pt-0" v-show="showDetails">
        <v-divider
          :thickness="2"
          class="border-opacity-25 mt-2 mb-2"
        ></v-divider>
        <v-chip class="ma-2" color="accent" label>
          <v-icon start icon="mdi-calendar-clock"></v-icon>
          Time Period: {{ story.time_period }}
        </v-chip>
        <v-chip class="ma-2" color="darkblue" label>
          <v-icon start icon="mdi-map-outline"></v-icon>
          Country: &nbsp;
          <strong>{{ story.countryName }}</strong>
        </v-chip>
        <v-chip class="ma-2" color="darkblue" label>
          <v-icon start icon="mdi-human-male"></v-icon>
          Lead Male Character: &nbsp;
          <strong> {{ story.lead_charecter_male }}</strong>
        </v-chip>
        <v-chip class="ma-2" color="darkblue" label>
          <v-icon start icon="mdi-human-female"></v-icon>
          Lead Female Character: &nbsp;
          <strong>{{ story.lead_charecter_female }}</strong>
        </v-chip>
        <v-divider
          :thickness="2"
          class="border-opacity-25 mt-2 mb-2"
        ></v-divider>
        <h3 class="text-center">STORY</h3>
        <v-divider
          :thickness="2"
          class="border-opacity-25 mt-2 mb-2"
        ></v-divider>
        <p
          v-for="(paragraph, index) in translatedStoryText?.split(`\n`)"
          :key="index"
        >
          {{ paragraph }}
          <v-divider class="border-opacity-0 mt-1"></v-divider>
        </p>
        <v-divider
          :thickness="2"
          class="border-opacity-25 mt-2 mb-2"
        ></v-divider>
        <v-row class="mt-2 d-flex align-center justify-center">
          <v-col cols="6" class="d-flex">
            <v-chip class="mt-5 mr-2" color="blue">
              <v-icon start icon="mdi-translate" size="24"></v-icon>
            </v-chip>
            <v-select
              label="Select Language To Translate"
              :items="story.languages"
              variant="outlined"
              v-model="translateLanguage"
            ></v-select>
          </v-col>
          <v-col cols="6" class="d-flex align-center justify-center">
            <v-chip class="mr-2 pa-5" color="blue" label>
              <v-icon
                :icon="story.isLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'"
                class="mr-2"
                size="30"
                @click="handleLike(true)"
                :disabled="story.isLiked"
              ></v-icon>
              <strong>{{ story.likes }}</strong>
            </v-chip>
            <v-chip class="mr-2 pa-5" color="error" label>
              <v-icon
                :icon="
                  story.isdisLiked ? 'mdi-thumb-down' : 'mdi-thumb-down-outline'
                "
                class="mr-2"
                size="30"
                @click="handleLike(false)"
                :disabled="story.isdisLiked"
              ></v-icon>
              <strong>{{ story.dislikes }}</strong>
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-expand-transition>
    <v-dialog v-model="translateLoadingDialog" max-width="450">
      <v-list class="py-2" color="primary" elevation="12" rounded="lg">
        <v-list-item
          prepend-icon="mdi-translate"
          title="Translating Story Please Wait ...."
        >
          <template v-slot:append>
            <v-progress-circular
              color="blue"
              indeterminate="shrink"
              size="40"
              width="4"
            ></v-progress-circular>
          </template>
        </v-list-item>
      </v-list>
    </v-dialog>
  </v-card>
</template>
