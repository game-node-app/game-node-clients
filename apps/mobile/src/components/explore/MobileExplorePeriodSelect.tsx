import { IonSelect, IonSelectOption } from "@ionic/react";
import { useTranslation } from "@repo/locales";
import type { ExplorePeriodSelectProps } from "@repo/ui";

/** The Explore period picker as a native action sheet. */
const MobileExplorePeriodSelect = ({
  value,
  options,
  onChange,
}: ExplorePeriodSelectProps) => {
  const { t } = useTranslation();

  return (
    <IonSelect
      className={"gn-period-select"}
      aria-label={t("explore.filters.trendingIn")}
      interface="action-sheet"
      interfaceOptions={{ header: t("explore.filters.trendingIn") }}
      placeholder={t("explore.placeholders.selectPeriod")}
      onIonChange={(evt) => onChange(evt.detail.value)}
      value={value}
    >
      {options.map((option) => (
        <IonSelectOption key={option.value} value={option.value}>
          {option.label}
        </IonSelectOption>
      ))}
    </IonSelect>
  );
};

export { MobileExplorePeriodSelect };
