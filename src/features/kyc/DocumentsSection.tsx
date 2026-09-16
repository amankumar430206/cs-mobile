import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { useMyDocumentsQuery, useUploadDocumentMutation } from "@castadi/shared/hooks";
import { radii, spacing } from "@castadi/shared/tokens";
import { formatDate } from "@/lib/format";
import { FilePickError, pickFile, pickPhoto, takePhoto, type PickedFile } from "@/platform/filePicker";
import { toast } from "@/platform/toast";
import { useTheme } from "@/theme/ThemeProvider";
import { ActionSheet, Button, Card, Icon, Section, Skeleton, Text, type SheetAction } from "@/ui";
import type { DocumentTypeOption } from "./documentTypes";

export function DocumentsSection({ documentTypes }: { documentTypes: DocumentTypeOption[] }) {
  const { colors } = useTheme();
  const documents = useMyDocumentsQuery();
  const upload = useUploadDocumentMutation();
  const [target, setTarget] = useState<DocumentTypeOption | null>(null);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const uploadPicked = async (documentType: string, pick: () => Promise<PickedFile | null>) => {
    let file: PickedFile | null;
    try {
      file = await pick();
    } catch (err) {
      toast.error(err instanceof FilePickError ? err.message : "Couldn't open that file. Please try another.");
      return;
    }
    if (!file) return;

    setUploadingType(documentType);
    try {
      await upload.mutateAsync({ documentType, file });
      toast.success("Document uploaded");
    } catch {
      // The API client already surfaced the error.
    } finally {
      setUploadingType(null);
    }
  };

  const actions: SheetAction[] = target
    ? [
        { key: "camera", label: "Take photo", icon: "camera", onPress: () => void uploadPicked(target.value, takePhoto) },
        { key: "library", label: "Choose from photos", icon: "photo", onPress: () => void uploadPicked(target.value, pickPhoto) },
        { key: "file", label: "Choose a PDF or image file", icon: "document", onPress: () => void uploadPicked(target.value, pickFile) },
      ]
    : [];

  return (
    <Section title="Documents">
      <Text variant="caption" tone="muted">
        JPG, PNG or PDF, up to 5 MB each.
      </Text>

      {documents.isPending ? (
        <Skeleton height={220} radius={radii.lg} />
      ) : (
        <Card style={styles.card}>
          {documentTypes.map((type, index) => {
            const existing = documents.data?.find((document) => document.documentType === type.value);
            const uploading = uploadingType === type.value;
            return (
              <View
                key={type.value}
                style={[styles.row, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}
              >
                <Icon name={existing ? "check" : "document"} size={20} color={existing ? colors.success : colors.mutedForeground} />
                <View style={styles.text}>
                  <Text variant="label" weight="semibold">
                    {type.label}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {existing ? `Uploaded ${formatDate(existing.uploadedAt)}` : "Not uploaded"}
                  </Text>
                </View>
                {existing ? (
                  <Button title="View" variant="ghost" style={styles.action} onPress={() => void Linking.openURL(existing.downloadUrl)} />
                ) : (
                  <Button
                    title="Upload"
                    variant="outline"
                    style={styles.action}
                    loading={uploading}
                    disabled={uploadingType !== null && !uploading}
                    onPress={() => setTarget(type)}
                  />
                )}
              </View>
            );
          })}
        </Card>
      )}

      <ActionSheet visible={target !== null} title={target?.label} actions={actions} onClose={() => setTarget(null)} />
    </Section>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, gap: 0, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing(3), paddingHorizontal: spacing(4), paddingVertical: spacing(3) },
  text: { flex: 1, gap: 2 },
  action: { minHeight: 36, paddingHorizontal: spacing(3) },
});
