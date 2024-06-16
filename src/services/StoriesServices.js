import apiClient from "./services";

export default {
  createStory(story) {
    return apiClient.post(`story/add/`, story);
  },
  getStories(userId) {
    return apiClient.get(`story/list/all?userId=${userId}`);
  },
  deleteStory(id) {
    return apiClient.delete(`story/${id}`);
  },
  translate(id, lang) {
    return apiClient.get(`story/translate/${id}?language=${lang}`);
  },
  like(id, value, body) {
    return apiClient.put(`story/${id}?like=${value}`, body);
  },
  updateStory(story) {
    return apiClient.put(`story/update/${story.id}`, story);
  }
};