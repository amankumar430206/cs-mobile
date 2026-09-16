import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
  /** Photo/video pixel size, when the picker reports it (not for document-picker files). */
  width?: number;
  height?: number;
  /** Video length in seconds, when known. */
  durationSeconds?: number;
}

export interface PickLimits {
  types: string[];
  maxBytes: number;
  typeMessage: string;
  sizeMessage: string;
}

// Mirror cs-api's upload limits so bad picks fail here instead of after a slow upload.
export const DOCUMENT_LIMITS: PickLimits = {
  types: ["image/jpeg", "image/png", "application/pdf"],
  maxBytes: 5 * 1024 * 1024,
  typeMessage: "Only JPG, PNG or PDF files are allowed.",
  sizeMessage: "File is too large (max 5 MB).",
};

export const PHOTO_LIMITS: PickLimits = {
  types: ["image/jpeg", "image/png"],
  maxBytes: 5 * 1024 * 1024,
  typeMessage: "Only JPG or PNG photos are allowed.",
  sizeMessage: "Photo is too large (max 5 MB).",
};

// cs-api checks the file's real content and only accepts MP4. iPhone camera recordings are
// QuickTime (MOV), so those are rejected here with an explanation rather than by the API.
export const VIDEO_LIMITS: PickLimits = {
  types: ["video/mp4"],
  maxBytes: 20 * 1024 * 1024,
  typeMessage: "Only MP4 videos are allowed. iPhone recordings are saved as MOV — choose an MP4 file instead.",
  sizeMessage: "Video is too large (max 20 MB).",
};

// cs-api's creative upload accepts a wider mix, including MOV — an iPhone recording works here.
export const CREATIVE_LIMITS: PickLimits = {
  types: ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/quicktime"],
  maxBytes: 50 * 1024 * 1024,
  typeMessage: "Only JPG, PNG, GIF, MP4 or MOV files are allowed.",
  sizeMessage: "File is too large (max 50 MB).",
};

export class FilePickError extends Error {}

/** Exported for tests; every picker below runs its result through this. */
export function validatePickedFile(file: PickedFile, limits: PickLimits): PickedFile {
  if (!limits.types.includes(file.type)) throw new FilePickError(limits.typeMessage);
  if (file.size !== undefined && file.size > limits.maxBytes) throw new FilePickError(limits.sizeMessage);
  return file;
}

function fromImageAsset(asset: ImagePicker.ImagePickerAsset): PickedFile {
  const type = asset.mimeType ?? (asset.uri.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg");
  const extension = type === "image/png" ? "png" : "jpg";
  return {
    uri: asset.uri,
    name: asset.fileName ?? `photo-${Date.now()}.${extension}`,
    type,
    size: asset.fileSize,
    width: asset.width || undefined,
    height: asset.height || undefined,
  };
}

function fromVideoAsset(asset: ImagePicker.ImagePickerAsset): PickedFile {
  const uri = asset.uri.toLowerCase();
  const type = asset.mimeType ?? (uri.endsWith(".mov") ? "video/quicktime" : "video/mp4");
  return {
    uri: asset.uri,
    name: asset.fileName ?? `video-${Date.now()}.mp4`,
    type,
    size: asset.fileSize,
    width: asset.width || undefined,
    height: asset.height || undefined,
    // expo-image-picker reports video duration in milliseconds.
    durationSeconds: asset.duration ? asset.duration / 1000 : undefined,
  };
}

async function requireCamera() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) throw new FilePickError("Allow camera access in Settings to use the camera.");
}

export async function takePhoto(limits: PickLimits = DOCUMENT_LIMITS): Promise<PickedFile | null> {
  await requireCamera();
  // quality < 1 re-encodes to JPEG, which also keeps typical phone photos under the 5 MB limit.
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.7 });
  return result.canceled ? null : validatePickedFile(fromImageAsset(result.assets[0]), limits);
}

export async function pickPhoto(limits: PickLimits = DOCUMENT_LIMITS): Promise<PickedFile | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.7,
    // iOS: hand back JPEG rather than HEIC, which cs-api doesn't accept.
    preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
  });
  return result.canceled ? null : validatePickedFile(fromImageAsset(result.assets[0]), limits);
}

export async function recordVideo(limits: PickLimits = VIDEO_LIMITS): Promise<PickedFile | null> {
  await requireCamera();
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["videos"],
    videoMaxDuration: 20,
    videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
  });
  return result.canceled ? null : validatePickedFile(fromVideoAsset(result.assets[0]), limits);
}

export async function pickVideo(limits: PickLimits = VIDEO_LIMITS): Promise<PickedFile | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["videos"],
    preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
  });
  return result.canceled ? null : validatePickedFile(fromVideoAsset(result.assets[0]), limits);
}

export async function pickFile(limits: PickLimits = DOCUMENT_LIMITS): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: limits.types, copyToCacheDirectory: true });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return validatePickedFile({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? "application/octet-stream", size: asset.size }, limits);
}
