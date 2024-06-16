<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import MetaService from "../services/MetaService.js";

const router = useRouter();
const user = ref(null);
const deleteDialog = ref(false);

const props = defineProps({
  storyMeta: {
    required: true,
  },
  metaTypeName: {
    required: true,
  },
});

const emitActions = defineEmits(["getListData", "handleEdit"]);

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
});

async function deleteItem(id) {
  const apiPath = `${props.metaTypeName}api/${props.metaTypeName}/${id}`;
  await MetaService.deleteItem(apiPath);
  emitActions("getListData");
}
function updateItem(id) {
  emitActions("handleEdit", id);
}
</script>

<template>
  <v-card class="rounded-lg elevation-5 mb-8">
    <v-card-title class="headline">
      <v-row align="center">
        <v-col cols="10" v-if="metaTypeName !== 'historytracking'">
          {{ storyMeta.name }}
        </v-col>
        <v-col cols="10" v-else-if="metaTypeName === 'historytracking'">
          <v-chip class="ma-1" color="red" label>
            <v-icon start icon="mdi-gesture-double-tap"></v-icon>
            Action : {{ storyMeta.action }}
          </v-chip>
          <v-chip class="ma-1" color="blue" label>
            <v-icon start icon="mdi-email-outline"></v-icon>
            Email: {{ storyMeta.email }}
          </v-chip>
        </v-col>
        <v-col
          class="d-flex justify-end"
          v-if="metaTypeName !== 'historytracking'"
        >
          <v-icon
            size="small"
            icon="mdi-pencil"
            color="blue"
            @click.stop="updateItem(storyMeta.id)"
            class="mr-3"
          ></v-icon>
          <v-icon
            size="small"
            icon="mdi-delete-outline"
            color="error"
            @click.stop="deleteDialog = true"
          ></v-icon>
          <v-dialog v-model="deleteDialog" width="auto">
            <v-card>
              <v-card-text>
                {{ `Are you sure you want to delete the ${metaTypeName} ?` }}
              </v-card-text>
              <v-card-actions class="d-flex justify-center">
                <v-btn color="blue" @click="deleteDialog = false">NO</v-btn>
                <v-btn color="error" @click="deleteItem(storyMeta.id)"
                  >YES</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
    </v-card-title>
  </v-card>
</template>
