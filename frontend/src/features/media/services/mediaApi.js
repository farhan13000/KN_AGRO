import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../core/api";

const UPLOAD_TIMEOUT_MS = 2 * 60 * 1000;

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
      // The client-wide timeout is tuned for small JSON calls. An upload
      // on a rural mobile connection can take far longer than that, and
      // being cut off mid-way showed up as a baffling "network error"
      // rather than anything about the file.
      timeout: UPLOAD_TIMEOUT_MS,
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
