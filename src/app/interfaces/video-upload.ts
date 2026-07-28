export interface VideoUploadUrlResponse {
  uploadUrl: string;
  blobUrl: string;
  fileName: string;
}

export interface SaveVideoPayload {
  preRecordedVideoId: string;
  teacherId: string;
  gradeStreamId: string;
  teacherFullNames: string;
  streamName: string;
  videoTitle: string;
  description: string;
  videoUpload: string;
  uploadedTime: string;
}
