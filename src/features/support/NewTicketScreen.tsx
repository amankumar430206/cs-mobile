import { StyleSheet } from "react-native";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateTicketMutation, useMeQuery } from "@castadi/shared/hooks";
import { createTicketSchema, type CreateTicketFormValues } from "@castadi/shared/schemas";
import { spacing } from "@castadi/shared/tokens";
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "@castadi/shared/types";
import { ticketRoute } from "@/features/account/routes";
import { humanize } from "@/lib/format";
import { toast } from "@/platform/toast";
import { Button, Card, DevFillButton, PickerField, Screen, Text, TextField } from "@/ui";

const PRIORITY_OPTIONS = TICKET_PRIORITIES.map((value) => ({ value, label: humanize(value) }));

export function NewTicketScreen() {
  const { data: user } = useMeQuery();
  const create = useCreateTicketMutation();
  const { control, handleSubmit, reset } = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { subject: "", description: "", priority: "MEDIUM" },
  });

  const fillTestData = () => {
    if (!__DEV__) return;
    reset({
      category: "TECHNICAL_SUPPORT",
      priority: "MEDIUM",
      subject: "Test ticket from the app",
      description: "This is a test ticket raised from the CASTADI mobile app in development.",
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return;
    try {
      const ticket = await create.mutateAsync(values);
      toast.success("Ticket raised — we'll get back to you soon.");
      router.replace(ticketRoute(user.role, ticket.id));
    } catch {
      // The API client already surfaced the error.
    }
  });

  return (
    <Screen edges={["bottom"]} contentStyle={styles.content}>
      <Text tone="muted">Tell us what&apos;s going on. The more detail you share, the faster we can help.</Text>
      {__DEV__ ? <DevFillButton title="Fill test data" onPress={fillTestData} /> : null}
      <Card>
        <PickerField control={control} name="category" label="Category" options={TICKET_CATEGORIES} placeholder="Choose a category" />
        <PickerField control={control} name="priority" label="Priority" options={PRIORITY_OPTIONS} />
        <TextField control={control} name="subject" label="Subject" placeholder="A short summary" maxLength={255} />
        <TextField
          control={control}
          name="description"
          label="Description"
          placeholder="What happened, and what did you expect?"
          multiline
          maxLength={5000}
          style={styles.description}
        />
      </Card>
      <Button title="Raise ticket" loading={create.isPending} onPress={onSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(4), paddingBottom: spacing(10) },
  description: { minHeight: 140, textAlignVertical: "top" },
});
