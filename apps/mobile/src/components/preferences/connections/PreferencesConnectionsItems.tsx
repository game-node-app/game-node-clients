import {
  CardRow,
  CardSection,
} from "@/components/general/card";
import PreferencesConnectionItem from "@/components/preferences/connections/PreferencesConnectionItem";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { useTranslation } from "@repo/locales";
import { UserConnectionDto } from "@repo/wrapper/server";
import { IconPlugConnected } from "@tabler/icons-react";

const CONNECTION_TYPES = [
  UserConnectionDto.type.STEAM,
  UserConnectionDto.type.PSN,
  UserConnectionDto.type.XBOX,
  UserConnectionDto.type.EPICGAMES,
  UserConnectionDto.type.NINTENDO,
  UserConnectionDto.type.GOG,
];

const PreferencesConnectionsItems = () => {
  const { t } = useTranslation();

  return (
    <CardSection title={t("preferences.categories.connections")}>
      {CONNECTION_TYPES.map((type) => (
        <PreferencesConnectionItem key={type} type={type} />
      ))}
      <CardRow
        icon={<IconPlugConnected size={20} />}
        title={t("mcp.title")}
        href={getTabAwareHref("/mcp")}
      />
    </CardSection>
  );
};

export default PreferencesConnectionsItems;
