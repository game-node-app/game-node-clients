import PreferencesConnectionItem from "@/components/preferences/connections/PreferencesConnectionItem";
import { UserConnectionDto } from "@repo/wrapper/server";

const CONNECTION_TYPES = [
  UserConnectionDto.type.STEAM,
  UserConnectionDto.type.PSN,
  UserConnectionDto.type.XBOX,
  UserConnectionDto.type.EPICGAMES,
  UserConnectionDto.type.NINTENDO,
  UserConnectionDto.type.GOG,
];

/**
 * One row per game platform connection. Each connected platform carries its own "Import games"
 * action, so there is no separate importer entry in Preferences.
 */
const PreferencesConnectionsItems = () => (
  <>
    {CONNECTION_TYPES.map((type) => (
      <PreferencesConnectionItem key={type} type={type} />
    ))}
  </>
);

export default PreferencesConnectionsItems;
