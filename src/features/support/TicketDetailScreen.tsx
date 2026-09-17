import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAddTicketMessageMutation,
  useMeQuery,
  useReopenTicketMutation,
  useSubmitTicketFeedbackMutation,
  useTicketDetailQuery,
} from "@castadi/shared/hooks";
import { ticketMessageSchema, type TicketMessageFormValues } from "@castadi/shared/schemas";
import { radii, spacing, typography } from "@castadi/shared/tokens";
import { TERMINAL_TICKET_STATUSES, type Ticket, type TicketMessage } from "@castadi/shared/types";
import { formatDateTime } from "@/lib/format";
import { toast } from "@/platform/toast";
import { fontFamily } from "@/theme/fonts";
import { useTheme } from "@/theme/ThemeProvider";
import { Button, Card, Screen, Section, Skeleton, StatusPill, StatusView, Text, TextField, useFieldBackground } from "@/ui";
import { TICKET_STATUS, ticketCategoryLabel } from "./supportStatus";

// No live stream on mobile: an open thread checks for replies on this interval.
const POLL_MS = 20_000;

export function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ticketId = id ?? "";
  const { data: user } = useMeQuery();
  const detail = useTicketDetailQuery(ticketId, { refetchInterval: POLL_MS });

  if (detail.isError) {
    return (
      <StatusView title="Couldn't load this ticket" message="Check your connection and try again.">
        <Button title="Try again" onPress={() => void detail.refetch()} />
      </StatusView>
    );
  }

  if (!detail.data || !user) {
    return (
      <Screen edges={["bottom"]} contentStyle={styles.content}>
        <Skeleton height={120} radius={radii.lg} />
        <Skeleton height={220} radius={radii.lg} />
      </Screen>
    );
  }

  const { ticket, messages } = detail.data;
  const status = TICKET_STATUS[ticket.status];
  const closed = TERMINAL_TICKET_STATUSES.includes(ticket.status);

  return (
    <Screen edges={["bottom"]} contentStyle={styles.content} onRefresh={() => void detail.refetch()} refreshing={detail.isRefetching}>
      <Stack.Screen options={{ title: "Ticket" }} />

      <Card>
        <View style={styles.headerRow}>
          <Text variant="heading" style={styles.flex}>
            {ticket.subject}
          </Text>
          <StatusPill label={status.label} tone={status.tone} />
        </View>
        <Text variant="caption" tone="muted">
          {ticketCategoryLabel(ticket.category)} · Raised {formatDateTime(ticket.createdAt)}
        </Text>
        <Text selectable style={styles.description}>
          {ticket.description}
        </Text>
      </Card>

      {ticket.status === "WAITING_FOR_CUSTOMER" ? (
        <Card>
          <Text variant="label" weight="semibold">
            Our team is waiting for your reply
          </Text>
          <Text variant="caption" tone="muted">
            Answer below so we can keep going.
          </Text>
        </Card>
      ) : null}

      <Section title={messages.length ? `Conversation (${messages.length})` : "Conversation"}>
        {messages.length === 0 ? (
          <Text variant="caption" tone="muted">
            No replies yet. We&apos;ll notify you when someone responds.
          </Text>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} mine={message.senderId === user.id} />)
        )}
      </Section>

      {closed ? <ClosedTicketActions ticket={ticket} /> : <ReplyComposer ticketId={ticket.id} />}
    </Screen>
  );
}

function MessageBubble({ message, mine }: { message: TicketMessage; mine: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.bubble,
        mine
          ? { alignSelf: "flex-end", backgroundColor: `${colors.primary}1F`, borderColor: `${colors.primary}55` }
          : { alignSelf: "flex-start", backgroundColor: colors.card, borderColor: colors.cardBorder },
      ]}
    >
      <Text variant="caption" weight="semibold" tone={mine ? "primary" : "default"}>
        {mine ? "You" : `${message.senderName} · CASTADI Support`}
      </Text>
      <Text selectable>{message.message}</Text>
      <Text variant="caption" tone="muted">
        {formatDateTime(message.createdAt)}
      </Text>
    </View>
  );
}

function ReplyComposer({ ticketId }: { ticketId: string }) {
  const addMessage = useAddTicketMessageMutation(ticketId);
  const { control, handleSubmit, reset } = useForm<TicketMessageFormValues>({
    resolver: zodResolver(ticketMessageSchema),
    defaultValues: { message: "" },
  });

  const send = handleSubmit(async (values) => {
    try {
      await addMessage.mutateAsync({ message: values.message.trim() });
      reset({ message: "" });
    } catch {
      // The API client already surfaced the error.
    }
  });

  return (
    <Card>
      <TextField control={control} name="message" label="Reply" placeholder="Write a reply…" multiline maxLength={5000} style={styles.reply} />
      <Button title="Send reply" loading={addMessage.isPending} onPress={send} />
    </Card>
  );
}

function ClosedTicketActions({ ticket }: { ticket: Ticket }) {
  const reopen = useReopenTicketMutation(ticket.id);

  return (
    <>
      {ticket.resolutionSummary ? (
        <Card>
          <Text variant="label" weight="semibold">
            Resolution
          </Text>
          <Text selectable>{ticket.resolutionSummary}</Text>
        </Card>
      ) : null}

      <FeedbackCard ticket={ticket} />

      <Button
        title="Still not fixed? Reopen this ticket"
        variant="outline"
        loading={reopen.isPending}
        onPress={() =>
          reopen.mutate(undefined, {
            onSuccess: () => toast.success("Ticket reopened"),
          })
        }
      />
    </>
  );
}

function FeedbackCard({ ticket }: { ticket: Ticket }) {
  const { colors } = useTheme();
  const fieldBackground = useFieldBackground();
  const submit = useSubmitTicketFeedbackMutation(ticket.id);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  if (ticket.feedbackRating != null) {
    return (
      <Card>
        <Text variant="label" weight="semibold">
          Thanks for your feedback
        </Text>
        <Text tone="primary" accessibilityLabel={`You rated ${ticket.feedbackRating} out of 5`}>
          {"★".repeat(ticket.feedbackRating)}
          <Text tone="muted">{"★".repeat(5 - ticket.feedbackRating)}</Text>
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      <Text variant="label" weight="semibold">
        How did we do?
      </Text>
      <View style={styles.stars} accessibilityRole="radiogroup">
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable
            key={value}
            onPress={() => setRating(value)}
            hitSlop={6}
            accessibilityRole="radio"
            accessibilityState={{ checked: rating === value }}
            accessibilityLabel={`${value} out of 5`}
          >
            <Text style={[styles.star, { color: value <= rating ? colors.primary : colors.border }]}>★</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Anything else to add? (optional)"
        placeholderTextColor={colors.mutedForeground}
        multiline
        maxLength={2000}
        style={[styles.comment, { color: colors.foreground, borderColor: colors.border, backgroundColor: fieldBackground }]}
      />
      <Button
        title="Submit feedback"
        disabled={rating === 0}
        loading={submit.isPending}
        onPress={() =>
          submit.mutate(
            { rating, comment: comment.trim() || undefined },
            { onSuccess: () => toast.success("Thanks for the feedback!") }
          )
        }
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(4), paddingBottom: spacing(10) },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing(3) },
  flex: { flex: 1 },
  description: { lineHeight: 24 },
  bubble: { maxWidth: "88%", borderWidth: 1, borderRadius: radii.lg, padding: spacing(3), gap: spacing(1) },
  reply: { minHeight: 90, textAlignVertical: "top" },
  stars: { flexDirection: "row", gap: spacing(2) },
  star: { fontSize: 30, lineHeight: 36 },
  comment: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing(3),
    fontSize: typography.sizes.base,
    fontFamily: fontFamily.normal,
    textAlignVertical: "top",
  },
});
