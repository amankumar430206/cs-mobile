import { Text } from "./Text";

export function FieldMessage({ error, hint }: { error?: string; hint?: string }) {
  if (error) {
    return (
      <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
        {error}
      </Text>
    );
  }
  return hint ? (
    <Text variant="caption" tone="muted">
      {hint}
    </Text>
  ) : null;
}
