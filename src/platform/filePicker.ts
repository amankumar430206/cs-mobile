import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

// Mirrors cs-api's KYC upload limits, so bad picks fail here instead of after a slow upload.
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

export class FilePickError extends Error {}

function validate(file: PickedFile): PickedFile {
  if (!ALLOWED_TYPES.includes(file.type)) throw new FilePickError("Only JPG, PNG or PDF files are allowed.");
  if (file.size !== undefined && file.size > MAX_BYTES) throw new FilePickError("File is too large (max 5 MB).");
  return file;
}

function fromImageAsset(asset: ImagePicker.ImagePickerAsset): PickedFile {
  const type = asset.mimeType ?? (asset.uri.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg");
  const extension = type === "image/png" ? "png" : "jpg";
  return { uri: asset.uri, name: asset.fileName ?? `photo-${Date.now()}.${extension}`, type, size: asset.fileSize };
}

export async function takePhoto(): Promise<PickedFile | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) throw new FilePickError("Allow camera access in Settings to take a photo.");
  // quality < 1 re-encodes to JPEG, which also keeps typical phone photos under the 5 MB limit.
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.7 });
  return result.canceled ? null : validate(fromImageAsset(result.assets[0]));
}

export async function pickPhoto(): Promise<PickedFile | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.7,
    // iOS: hand back JPEG rather than HEIC, which cs-api doesn't accept.
    preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
  });
  return result.canceled ? null : validate(fromImageAsset(result.assets[0]));
}

export async function pickFile(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: ALLOWED_TYPES, copyToCacheDirectory: true });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return validate({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? "application/octet-stream", size: asset.size });
}
