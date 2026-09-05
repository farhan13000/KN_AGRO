import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

export const mediaApi = {
  /**
   * Uploads one file and resolves to the stored asset:
   * { url, publicId, resourceType, format, bytes, originalName, mimeType }.
   *
   * The field name must be "file" — that is what the backend's multer
   * single-file middleware reads. apiClient strips its own JSON
   * Content-Type for FormData so the browser can set the boundary.
   */
  async upload(kind, file, { onProgress } = {}) {
    const body = new FormData();
    body.append("file", file);

    const response = await apiClient.post(API_ENDPOINTS.MEDIA.UPLOAD(kind), body, {
      onUploadProgress: onProgress
        ? (event) => {
            // event.total is absent on some browsers/proxies — report
            // nothing rather than dividing by undefined and rendering NaN%.
            if (!event.total) return;
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        : undefined,
    });

    return unwrapApiData(response)?.asset || null;
  },
};
