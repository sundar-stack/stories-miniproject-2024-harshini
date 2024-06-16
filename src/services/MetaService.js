import apiClient from "./services";

export default {
  getItems(apiPath) {
    return apiClient.get(apiPath);
  },
  getItem(apiPath) {
    return apiClient.get(apiPath);
  },
  addItem(apiPath, category) {
    return apiClient.post(apiPath, category);
  },
  updateItem(apiPath, category) {
    return apiClient.put(apiPath, category);
  },
  deleteItem(apiPath) {
    return apiClient.delete(apiPath);
  },
};
