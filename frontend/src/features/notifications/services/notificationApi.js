import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

export const notificationApi = {
  async listNotifications(query) {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BASE, { params: query });
    return unwrapApiData(response);
  },

  async getUnreadCount() {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return unwrapApiData(response);
  },

  async getUnreadCounts() {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNTS);
    return unwrapApiData(response);
  },

  async markModuleNotificationsRead(module) {
    const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.READ_MODULE(module));
    return unwrapApiData(response);
  },

  async markNotificationRead(notificationId) {
    const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.READ(notificationId));
    return unwrapApiData(response);
  },

  async markAllNotificationsRead() {
    const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
    return unwrapApiData(response);
  },

  async archiveNotification(notificationId) {
    const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.ARCHIVE(notificationId));
    return unwrapApiData(response);
  },
};
