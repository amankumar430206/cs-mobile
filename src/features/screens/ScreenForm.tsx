import { useState } from "react";
import { StyleSheet, View } from "react-native";
import * as Location from "expo-location";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { screenFormSchema, type ScreenFormInput, type ScreenFormOutput } from "@castadi/shared/schemas";
import { spacing } from "@castadi/shared/tokens";
import {
  INSTALLATION_ENVIRONMENTS,
  INTERNET_TYPES,
  REVENUE_MODELS,
  SCREEN_SIZE_PRESETS,
  type Screen,
  type ScreenCategory,
} from "@castadi/shared/types";
import { toast } from "@/platform/toast";
import { Button, Card, DevFillButton, FilterChips, PickerField, Section, Text, TextField, TimeField } from "@/ui";
import { PincodeLookup } from "./PincodeLookup";

type Field = keyof ScreenFormInput;

// Same three steps and field grouping as cs-web's ScreenForm wizard; editing shows everything at once.
const STEPS = ["Basics", "Location", "Pricing"] as const;
const STEP_FIELDS: Field[][] = [
  ["screenName", "categoryCode", "screenSize", "resolution", "installationEnvironment", "os", "deviceSerialNumber"],
  ["installationAddress", "city", "state", "gpsLatitude", "gpsLongitude", "locationUrl", "internetType", "operatingHoursStart", "operatingHoursEnd", "dailyFootfall"],
  ["ownershipDetails", "revenueModel", "pricePerDay", "estimatedDailyImpressions", "maxAdCapacity"],
];

const stepOf = (field: string) => Math.max(0, STEP_FIELDS.findIndex((fields) => fields.includes(field as Field)));

const SIZE_OPTIONS = [...SCREEN_SIZE_PRESETS.map((preset) => ({ value: preset.value, label: preset.label })), { value: "custom", label: "Custom" }];

function toDefaultValues(categories: ScreenCategory[], screen?: Screen): ScreenFormInput {
  const categoryCode = screen ? (categories.find((c) => c.id === screen.categoryId)?.code ?? "") : (categories[0]?.code ?? "");
  return {
    screenName: screen?.screenName ?? "",
    categoryCode,
    screenSize: screen?.screenSize ?? "",
    resolution: screen?.resolution ?? "",
    os: screen?.os ?? "Android",
    deviceSerialNumber: screen?.deviceSerialNumber ?? "",
    installationAddress: screen?.installationAddress ?? "",
    city: screen?.city ?? "",
    state: screen?.state ?? "",
    gpsLatitude: screen ? String(screen.gpsLatitude) : "",
    gpsLongitude: screen ? String(screen.gpsLongitude) : "",
    locationUrl: screen?.locationUrl ?? "",
    internetType: screen?.internetType ?? INTERNET_TYPES[0].value,
    operatingHoursStart: screen?.operatingHoursStart ?? "09:00",
    operatingHoursEnd: screen?.operatingHoursEnd ?? "21:00",
    ownershipDetails: screen?.ownershipDetails ?? "",
    revenueModel: screen?.revenueModel ?? REVENUE_MODELS[0].value,
    pricePerDay: screen ? String(screen.pricePerDay) : "",
    estimatedDailyImpressions: screen?.estimatedDailyImpressions != null ? String(screen.estimatedDailyImpressions) : "",
    installationEnvironment: screen?.installationEnvironment ?? INSTALLATION_ENVIRONMENTS[0].value,
    dailyFootfall: screen?.dailyFootfall != null ? String(screen.dailyFootfall) : "",
    maxAdCapacity: screen?.maxAdCapacity != null ? String(screen.maxAdCapacity) : "1",
  };
}

interface ScreenFormProps {
  categories: ScreenCategory[];
  screen?: Screen;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: ScreenFormOutput) => void;
}

export function ScreenForm({ categories, screen, submitLabel, isSubmitting, onSubmit }: ScreenFormProps) {
  const isWizard = !screen;
  const [step, setStep] = useState(0);
  const [locating, setLocating] = useState(false);

  const { control, handleSubmit, trigger, setValue, getValues, reset } = useForm<ScreenFormInput, unknown, ScreenFormOutput>({
    resolver: zodResolver(screenFormSchema),
    defaultValues: toDefaultValues(categories, screen),
  });
  const [screenSize, resolution] = useWatch({ control, name: ["screenSize", "resolution"] });
  const matchingPreset = SCREEN_SIZE_PRESETS.find((preset) => preset.screenSize === screenSize && preset.resolution === resolution);

  const show = (index: number) => !isWizard || step === index;

  const goNext = async () => {
    if (await trigger(STEP_FIELDS[step])) setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const onInvalid = (errors: FieldErrors<ScreenFormInput>) => {
    const first = Object.keys(errors)[0];
    if (first && isWizard) setStep(stepOf(first));
    toast.error("Fix the highlighted fields and try again.");
  };

  const submit = handleSubmit(onSubmit, onInvalid);

  // Same values as cs-web's ScreenForm test fill; __DEV__-guarded so release bundles drop them.
  const fillTestData = () => {
    if (!__DEV__) return;
    reset({
      screenName: "Test Auto Screen",
      categoryCode: categories.find((c) => c.code === "AUTO_RICKSHAW")?.code ?? categories[0]?.code ?? "",
      screenSize: "10 inch",
      resolution: "1280x720",
      os: "Android",
      deviceSerialNumber: `TEST-DEV-${Date.now()}`,
      installationAddress: "12 MG Road, Bengaluru",
      city: "Bengaluru",
      state: "Karnataka",
      gpsLatitude: "12.9716",
      gpsLongitude: "77.5946",
      locationUrl: "https://maps.google.com/?q=12.9716,77.5946",
      internetType: "4G",
      operatingHoursStart: "08:00",
      operatingHoursEnd: "22:00",
      ownershipDetails: "",
      revenueModel: "AUTO_CAB_DRIVER",
      pricePerDay: "500",
      estimatedDailyImpressions: "2000",
      installationEnvironment: "OUTDOOR",
      dailyFootfall: "300",
      maxAdCapacity: "1",
    });
  };

  const captureCurrentLocation = async () => {
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        toast.error("Allow location access in Settings, or enter the coordinates manually.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const latitude = position.coords.latitude.toFixed(6);
      const longitude = position.coords.longitude.toFixed(6);
      setValue("gpsLatitude", latitude, { shouldValidate: true });
      setValue("gpsLongitude", longitude, { shouldValidate: true });
      if (!getValues("locationUrl")) setValue("locationUrl", `https://maps.google.com/?q=${latitude},${longitude}`);

      // Only fills blanks, so nothing the partner typed is overwritten.
      const [place] = await Location.reverseGeocodeAsync(position.coords).catch(() => []);
      if (place) {
        if (!getValues("city") && place.city) setValue("city", place.city, { shouldValidate: true });
        if (!getValues("state") && place.region) setValue("state", place.region, { shouldValidate: true });
        if (!getValues("installationAddress") && place.formattedAddress) {
          setValue("installationAddress", place.formattedAddress, { shouldValidate: true });
        }
      }
      toast.success("Location captured");
    } catch {
      toast.error("Couldn't get your location. Try again, or enter the coordinates manually.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.form}>
      {isWizard ? (
        <Text tone="muted">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </Text>
      ) : null}
      {__DEV__ && isWizard ? <DevFillButton title="Fill test data" onPress={fillTestData} /> : null}

      {show(0) ? (
        <Section title="Basics">
          <Card>
            <TextField control={control} name="screenName" label="Screen name" />
            <PickerField
              control={control}
              name="categoryCode"
              label="Category"
              options={categories.map((category) => ({ value: category.code, label: category.label }))}
            />
            <View style={styles.fieldGroup}>
              <Text variant="label">Screen size & resolution</Text>
              <FilterChips
                options={SIZE_OPTIONS}
                value={matchingPreset?.value ?? "custom"}
                onChange={(value) => {
                  const preset = SCREEN_SIZE_PRESETS.find((option) => option.value === value);
                  if (!preset) return;
                  setValue("screenSize", preset.screenSize, { shouldValidate: true });
                  setValue("resolution", preset.resolution, { shouldValidate: true });
                }}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.flex}>
                <TextField control={control} name="screenSize" label="Size" placeholder="32 inch" />
              </View>
              <View style={styles.flex}>
                <TextField control={control} name="resolution" label="Resolution" placeholder="1920x1080" autoCapitalize="none" />
              </View>
            </View>
            <PickerField control={control} name="installationEnvironment" label="Installation environment" options={INSTALLATION_ENVIRONMENTS} />
            <TextField control={control} name="os" label="OS" />
            <TextField
              control={control}
              name="deviceSerialNumber"
              label="Device serial number"
              hint="Android version, model, RAM and storage are read from the Ad Player once it's linked."
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </Card>
        </Section>
      ) : null}

      {show(1) ? (
        <Section title="Location">
          <Card>
            <Button
              title={locating ? "Getting location…" : "Use my current location"}
              variant="outline"
              loading={locating}
              onPress={() => void captureCurrentLocation()}
            />
            <TextField control={control} name="installationAddress" label="Installation address" multiline autoComplete="street-address" />
            <PincodeLookup
              onResolved={(resolution) => {
                setValue("city", resolution.city, { shouldValidate: true });
                setValue("state", resolution.state, { shouldValidate: true });
              }}
            />
            <View style={styles.row}>
              <View style={styles.flex}>
                <TextField control={control} name="city" label="City" />
              </View>
              <View style={styles.flex}>
                <TextField control={control} name="state" label="State" />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.flex}>
                <TextField control={control} name="gpsLatitude" label="Latitude" keyboardType="numbers-and-punctuation" />
              </View>
              <View style={styles.flex}>
                <TextField control={control} name="gpsLongitude" label="Longitude" keyboardType="numbers-and-punctuation" />
              </View>
            </View>
            <TextField
              control={control}
              name="locationUrl"
              label="Map link (optional)"
              hint="Filled in from your location, or paste a Google Maps share link."
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <PickerField control={control} name="internetType" label="Internet type" options={INTERNET_TYPES} />
            <View style={styles.row}>
              <TimeField control={control} name="operatingHoursStart" label="Opens" />
              <TimeField control={control} name="operatingHoursEnd" label="Closes" />
            </View>
            <TextField control={control} name="dailyFootfall" label="Daily footfall (optional)" keyboardType="number-pad" />
          </Card>
        </Section>
      ) : null}

      {show(2) ? (
        <Section title="Pricing">
          <Card>
            <PickerField control={control} name="revenueModel" label="Revenue model" options={REVENUE_MODELS} />
            <TextField control={control} name="pricePerDay" label="Listed price per day (₹)" keyboardType="decimal-pad" />
            <TextField
              control={control}
              name="estimatedDailyImpressions"
              label="Est. daily impressions (optional)"
              hint="Your best estimate of how many people see the screen each day."
              keyboardType="number-pad"
            />
            <TextField
              control={control}
              name="maxAdCapacity"
              label="Max ad capacity"
              hint="Campaigns that can rotate on this screen on the same date. Keep 1 for one advertiser at a time."
              keyboardType="number-pad"
            />
            <TextField
              control={control}
              name="ownershipDetails"
              label="Ownership details (optional)"
              hint="Only if you don't own the screen outright — a lease, rented storefront or fleet arrangement."
              multiline
            />
          </Card>
        </Section>
      ) : null}

      <View style={styles.actions}>
        {isWizard && step > 0 ? (
          <Button title="Back" variant="outline" style={styles.flex} onPress={() => setStep((current) => current - 1)} disabled={isSubmitting} />
        ) : null}
        {isWizard && step < STEPS.length - 1 ? (
          <Button title="Continue" style={styles.flex} onPress={() => void goNext()} />
        ) : (
          <Button title={submitLabel} style={styles.flex} onPress={submit} loading={isSubmitting} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing(5) },
  fieldGroup: { gap: spacing(1.5) },
  row: { flexDirection: "row", gap: spacing(3) },
  flex: { flex: 1 },
  actions: { flexDirection: "row", gap: spacing(3) },
});
