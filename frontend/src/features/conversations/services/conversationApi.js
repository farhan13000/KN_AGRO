import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

export const conversationApi = {
  async listConversations(query) {
    const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.BASE, { params: query });
    return unwrapApiData(response);
  },

  /** Everyone this account may start a chat with — their own team, their seniors, and head office. */
  async listDirectory(query) {
    const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.DIRECTORY, { params: query });
    return unwrapApiData(response);
  },

  /**
   * Opens the chat with one person. Idempotent on the server — calling it
   * twice returns the same thread rather than a second one — so the
   * people picker can call it without first checking whether a thread
   * already exists.
   */
  async openDirectConversation(targetUserId) {
    const response = await apiClient.post(API_ENDPOINTS.CONVERSATIONS.DIRECT, { targetUserId });
    return unwrapApiData(response);
  },

  async getConversation(conversationId) {
    const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.DETAIL(conversationId));
    return unwrapApiData(response);
  },

  async listMessages(conversationId, query) {
    const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId), { params: query });
    return unwrapApiData(response);
  },

  async sendMessage(conversationId, body) {
    const response = await apiClient.post(API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId), { body });
    return unwrapApiData(response);
  },

  async markRead(conversationId) {
    const response = await apiClient.post(API_ENDPOINTS.CONVERSATIONS.READ(conversationId));
    return unwrapApiData(response);
  },

  async getUnreadCount() {
    const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.UNREAD_COUNT);
    return unwrapApiData(response);
  },
};
