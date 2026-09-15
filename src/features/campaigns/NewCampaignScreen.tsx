import { useState } from "react";
import { StyleSheet } from "react-native";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateCampaignMutation } from "@castadi/shared/hooks";
import { campaignFormSchema, type CampaignFormInput, type CampaignFormOutput } from "@castadi/shared/schemas";
import { spacing } from "@castadi/shared/tokens";
import { OBJECTIVES } from "@castadi/shared/types";
import { toast } from "@/platform/toast";
import { Button, Card, DateField, DevFillButton, PickerField, Screen, TextField } from "@/ui";
import { openCampaignDetail } from "./campaignStatus";

export function NewCampaignScreen() {
  const create = useCreateCampaignMutation();
  // Computed once via lazy initializer, not at render time — `new Date()`/`Date.now()` are impure.
  const [{ startDate, endDate }] = useState(() => {
    const now = Date.now();
    return {
      startDate: new Date(now + 86_400_000).toISOString().slice(0, 10),
      endDate: new Date(now + 30 * 86_400_000).toISOString().slice(0, 10),
    };
  });

  const { control, handleSubmit, reset } = useForm<CampaignFormInput, unknown, CampaignFormOutput>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      objective: "",
      description: "",
      startDate,
      endDate,
      totalBudget: "" as unknown as number,
    },
  });

  const fillTestData = () => {
    if (!__DEV__) return;
    reset({
      name: `Test Campaign ${Date.now().toString().slice(-4)}`,
      objective: "BRAND_AWARENESS",
      description: "",
      startDate,
      endDate,
      totalBudget: "10000" as unknown as number,
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const campaign = await create.mutateAsync(values);
      toast.success("Campaign created");
      router.replace(openCampaignDetail(campaign.id));
    } catch {
      // The API client already surfaced the error.
    }
  });

  return (
    <Screen edges={["bottom"]} contentStyle={styles.content}>
      {__DEV__ ? <DevFillButton title="Fill test data" onPress={fillTestData} /> : null}
      <Card>
        <TextField control={control} name="name" label="Campaign name" />
        <PickerField control={control} name="objective" label="Objective" options={OBJECTIVES} />
        <DateField control={control} name="startDate" label="Start date" />
        <DateField control={control} name="endDate" label="End date" />
        <TextField control={control} name="totalBudget" label="Total budget (₹)" keyboardType="decimal-pad" />
        <TextField control={control} name="description" label="Description (optional)" multiline />
      </Card>
      <Button title="Create campaign" onPress={onSubmit} loading={create.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing(4), paddingBottom: spacing(10) },
});
