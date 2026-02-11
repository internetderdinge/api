// @ts-nocheck
import i18n from "../i18n/i18n";
import type { MedicationEntry } from "../types/MedicationEntry";

export const medicationName = (entry: MedicationEntry, lng: string): string => {
  const name = entry.medicationData?.Kurzname
    ? entry.medicationData.Kurzname
    : entry.localMedicationData?.meta?.name
      ? entry.localMedicationData.meta.name.replace(/ .*/, "")
      : i18n.t("A medication", { lng });

  return name;
};
