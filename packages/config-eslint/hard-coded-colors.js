"use strict";

/**
 * Rollout of `gamenode/no-hard-coded-colors` (design decision 3).
 *
 * The rule is `warn` repo-wide. Files listed here are migrated and enforced as
 * `error`, so they cannot regress while the rest of the repo is cleaned up in
 * follow-up work. The same list drives `bin/lint-css-colors.js`, so a migrated
 * `.css`/CSS Module is enforced there too.
 *
 * To add a file during the migration:
 *   1. migrate it to theme tokens (and mark artwork with `theme-exempt`);
 *   2. append its repo-relative path below (POSIX separators, no leading `./`);
 *   3. confirm the package's lint reports no message for it.
 *
 * The consuming ESLint configs call `migratedColorOverrides("<package root>")`
 * and only pick up source entries under their own root, because eslintrc
 * `overrides` patterns are relative to the config file. Entries for other
 * packages are ignored, so this list stays the single source of truth (the CSS
 * checker reads the whole list and matches against the repo root).
 *
 * Initial entries: the app entry points this change wires the provider into and
 * the default (today) components it will expose through presenter keys. They
 * already use tokens, so they start enforced.
 */

const MIGRATED_COLOR_FILES = Object.freeze([
  "apps/admin/src/pages/_app.tsx",
  "apps/mobile/src/App.tsx",
  "apps/mobile/src/components/achievement/MobileGameAchievementListItem.tsx",
  "apps/mobile/src/components/explore/TrendingShelf.tsx",
  "apps/mobile/src/components/general/RoundedIcon.tsx",
  "apps/mobile/src/components/general/splash/EntrySplash.tsx",
  "apps/mobile/src/components/globals.css",
  "apps/mobile/src/components/preferences/appearance/PreferencesAppearanceItems.tsx",
  "apps/mobile/src/components/sidebar/MobileSidebarButton.tsx",
  "apps/mobile/src/components/sidebar/MobileSidebarMenu.tsx",
  "apps/mobile/src/components/sidebar/MobileSidebarSection.tsx",
  "apps/mobile/src/components/theme.module.css",
  "apps/mobile/src/main.tsx",
  "apps/mobile/src/pages/explore.tsx",
  "apps/mobile/src/pages/game.tsx",
  "apps/mobile/src/pages/home.tsx",
  "apps/mobile/src/pages/notifications.tsx",
  "apps/mobile/src/pages/posts.tsx",
  "apps/mobile/src/pages/profile/stats.tsx",
  "apps/web/src/components/about/AboutProgressSection.tsx",
  "apps/web/src/components/general/shell/GlobalAppShell.tsx",
  "apps/web/src/components/general/shell/header/ConsoleAccountMenu.tsx",
  "apps/web/src/components/general/shell/header/GlobalShellConsoleHeader.module.css",
  "apps/web/src/components/general/shell/header/GlobalShellConsoleHeader.tsx",
  "apps/web/src/components/general/shell/header/GlobalShellHeaderNotifications.tsx",
  "apps/web/src/components/general/shell/header/XboxNotificationsSkin.module.css",
  "apps/web/src/components/general/shell/header/XboxNotificationsSkin.tsx",
  "apps/web/src/components/general/shell/navbar/GlobalShellConsoleBottomNav.module.css",
  "apps/web/src/components/general/shell/navbar/GlobalShellConsoleBottomNav.tsx",
  "apps/web/src/components/general/shell/navbar/GlobalShellConsoleNav.module.css",
  "apps/web/src/components/general/shell/navbar/GlobalShellConsoleNav.tsx",
  "apps/web/src/components/globals.css",
  "apps/web/src/pages/_app.tsx",
  "apps/web/src/pages/_document.tsx",
  "apps/web/src/pages/explore/index.tsx",
  "apps/web/src/pages/game/[id]/index.tsx",
  "apps/web/src/pages/home/index.tsx",
  "apps/web/src/pages/importer/index.tsx",
  "apps/web/src/pages/notifications.tsx",
  "apps/web/src/pages/posts/index.tsx",
  "apps/web/src/pages/profile/[userId]/stats.tsx",
  "packages/ui/src/components/activity/item/ActivityItem.tsx",
  "packages/ui/src/components/activity/item/useActivityItemData.tsx",
  "packages/ui/src/components/blog/RecentBlogPostsCarousel.tsx",
  "packages/ui/src/components/blog/card/BlogPostCard.tsx",
  "packages/ui/src/components/blog/card/BlogPostFeaturedCard.tsx",
  "packages/ui/src/components/collection/card/CollectionThumbnailCard.tsx",
  "packages/ui/src/components/collection/collection-entry/detail/CollectionEntryDetailView.tsx",
  "packages/ui/src/components/collection/form/CollectionLimitNotice.tsx",
  "packages/ui/src/components/explore/ExploreTrendingGames.tsx",
  "packages/ui/src/components/game/achievement/list/GameAchievementsListItem.tsx",
  "packages/ui/src/components/game/achievement/view/GameAchievementProgressOverview.tsx",
  "packages/ui/src/components/game/figure/GameHoverEditFigure.tsx",
  "packages/ui/src/components/game/info/GameInfoView.tsx",
  "packages/ui/src/components/game/info/ttb/GameInfoTimeToBeatItem.tsx",
  "packages/ui/src/components/game/search/search-bar/GameSearchBar.tsx",
  "packages/ui/src/components/game/share/GameInfoSharePreview.tsx",
  "packages/ui/src/components/game/view/select/GameSelectViewFigure.tsx",
  "packages/ui/src/components/general/DetailsBox.tsx",
  "packages/ui/src/components/general/GradientSeparator.tsx",
  "packages/ui/src/components/general/LanguagePickerMenu/LanguageSwitcherMenu.tsx",
  "packages/ui/src/components/general/RoundedIcon.tsx",
  "packages/ui/src/components/general/card/TrendingReviewCard.tsx",
  "packages/ui/src/components/general/input/ActionChip.tsx",
  "packages/ui/src/components/general/input/GameRating.tsx",
  "packages/ui/src/components/general/input/ItemDropdown/ItemDropdown.tsx",
  "packages/ui/src/components/general/not-found/NotFoundView.tsx",
  "packages/ui/src/components/home/HomeView.tsx",
  "packages/ui/src/components/home/ReleaseCalendar.module.css",
  "packages/ui/src/components/library/tabs/LibraryViewTabs.tsx",
  "packages/ui/src/components/library/view/sidebar/LibraryViewSidebar.tsx",
  "packages/ui/src/components/mcp/McpGuide.module.css",
  "packages/ui/src/components/notifications/view/NotificationsList.tsx",
  "packages/ui/src/components/notifications/view/NotificationsPanel.tsx",
  "packages/ui/src/components/posts/PostsList.tsx",
  "packages/ui/src/components/posts/PostsListItem.tsx",
  "packages/ui/src/components/posts/feed/PostsFeed.tsx",
  "packages/ui/src/components/posts/feed/PostsFeedView.tsx",
  "packages/ui/src/components/posts/hooks/usePostsListItemActions.tsx",
  "packages/ui/src/components/profile/edit/ProfileBannerPreview.tsx",
  "packages/ui/src/components/profile/edit/ProfileEditAvatarUploader.tsx",
  "packages/ui/src/components/profile/edit/ProfileEditBannerUploader.tsx",
  "packages/ui/src/components/profile/edit/ProfileEditForm.tsx",
  "packages/ui/src/components/profile/edit/ProfileVideoCropStep.tsx",
  "packages/ui/src/components/profile/edit/ProfileVideoSupporterNotice.tsx",
  "packages/ui/src/components/profile/edit/ProfileVideoUploadStatus.tsx",
  "packages/ui/src/components/profile/review/ProfileReviewListItem.tsx",
  "packages/ui/src/components/profile/util/profileBannerLayout.ts",
  "packages/ui/src/components/profile/view/ProfileFooter.tsx",
  "packages/ui/src/components/profile/view/ProfileStatsSimpleOverview.tsx",
  "packages/ui/src/components/profile/view/ProfileUserInfoWithBanner.tsx",
  "packages/ui/src/components/profile/view/ProfileViewContent.tsx",
  "packages/ui/src/components/profile/view/navbar/ProfileViewNavbarItem.tsx",
  "packages/ui/src/components/profile/view/stats/ProfileStatsDistributionRadarByTypeChart.tsx",
  "packages/ui/src/components/profile/view/stats/ProfileStatsView.tsx",
  "packages/ui/src/components/review/view/ReviewListItem.tsx",
  "packages/ui/src/components/settings/SettingsModal.tsx",
  "packages/ui/src/components/settings/SettingsPanel.tsx",
  "packages/ui/src/components/settings/SettingsSidebar.tsx",
  "packages/ui/src/components/settings/common/SettingsButton.tsx",
  "packages/ui/src/components/settings/common/SettingsCard.tsx",
  "packages/ui/src/components/settings/common/SettingsPill.tsx",
  "packages/ui/src/components/settings/common/SettingsRow.tsx",
  "packages/ui/src/components/settings/common/SettingsSection.tsx",
  "packages/ui/src/components/settings/tabs/SettingsAppearanceTab.tsx",
  "packages/ui/src/components/settings/tabs/SettingsConnectionsTab.tsx",
  "packages/ui/src/components/settings/tabs/SettingsMcpTab.tsx",
  "packages/ui/src/components/settings/tabs/appearance/SettingsCustomCoversSection.tsx",
  "packages/ui/src/components/settings/tabs/appearance/SettingsThemeOptionCard.tsx",
  "packages/ui/src/components/settings/tabs/mcp/McpAppTile.tsx",
  "packages/ui/src/components/settings/tabs/mcp/McpCodeField.tsx",
  "packages/ui/src/components/settings/tabs/mcp/McpConnectTabs.tsx",
  "packages/ui/src/components/settings/tabs/mcp/McpConnectedApps.tsx",
  "packages/ui/src/components/settings/tabs/mcp/McpCopyButton.tsx",
  "packages/ui/src/components/settings/tabs/mcp/McpRevokeDialog.tsx",
  "packages/ui/src/components/settings/tabs/notifications/SettingsLockedSwitch.tsx",
  "packages/ui/src/components/settings/tabs/notifications/SettingsNotificationTypesTable.tsx",
  "packages/ui/src/components/settings/tabs/privacy/SettingsPrivacyBlockedSection.tsx",
  "packages/ui/src/components/settings/tabs/privacy/SettingsPrivacyComingSoon.tsx",
  "packages/ui/src/components/settings/tabs/privacy/SettingsSessionsCard.tsx",
  "packages/ui/src/components/settings/tabs/privacy/SettingsSignInMethodsCard.tsx",
  "packages/ui/src/components/settings/tabs/profile/SettingsProfileActionBar.tsx",
  "packages/ui/src/components/settings/tabs/profile/SettingsProfileFavorites.tsx",
  "packages/ui/src/components/settings/tabs/profile/SettingsProfileField.tsx",
  "packages/ui/src/components/settings/tabs/profile/SettingsProfileImages.tsx",
  "packages/ui/src/components/settings/tabs/profile/SettingsProfileUsernameField.tsx",
  "packages/ui/src/components/user-level/UserLevel.tsx",
  "packages/ui/src/components/user-level/UserLevelInfo.tsx",
]);

/**
 * Tests assert colors on purpose (contrast checks, class expectations), and
 * theme definitions are the one legitimate place for literals (gamenode pins
 * today's values; generated files come from the generator).
 */
const COLOR_RULE_OFF_PATTERNS = Object.freeze([
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/*.spec.ts",
  "**/*.spec.tsx",
  "**/__tests__/**/*.ts",
  "**/__tests__/**/*.tsx",
]);

/**
 * Authored styles of the experience and theme packs are new code, not legacy:
 * they must use tokens from their first commit. `lint-css-colors.js` applies
 * these as `error`; every other CSS file starts as `warn`.
 *
 * Theme definitions (`theme/themes/*.ts`) are the token source and are not
 * affected; only their CSS packs are covered.
 */
const NEW_PACK_COLOR_PATTERNS = Object.freeze([
  "packages/ui/src/theme/experiences/**/*.css",
  "packages/ui/src/theme/themes/*/**/*.css",
]);

const ESLINT_SOURCE_FILE = /\.(?:[cm]?[jt]sx?)$/;

function normalizeRoot(packageRoot) {
  return packageRoot.replace(/^\/+|\/+$/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.+^${}()|[\]\\]/g, "\\$&");
}

/**
 * Minimal glob matcher for the checked-in patterns (`*`, `**` and `?`). A
 * pattern is matched against the repo-relative POSIX path.
 */
function matchesColorPattern(file, patterns) {
  return patterns.some((pattern) => {
    let source = "^";

    for (let index = 0; index < pattern.length; index += 1) {
      const char = pattern[index];

      if (char === "*") {
        if (pattern[index + 1] === "*") {
          index += 1;

          if (pattern[index + 1] === "/") {
            index += 1;
            source += "(?:.*/)?";
          } else {
            source += ".*";
          }
        } else {
          source += "[^/]*";
        }
      } else if (char === "?") {
        source += "[^/]";
      } else {
        source += escapeRegExp(char);
      }
    }

    return new RegExp(`${source}$`).test(file);
  });
}

/**
 * CSS rollout (design decision 3): migrated files and new packs are enforced,
 * everything else is a warning until the follow-up migration empties the
 * warning set.
 */
function getCssColorSeverity(file, options = {}) {
  const migratedFiles = options.migratedFiles ?? MIGRATED_COLOR_FILES;
  const newPackPatterns = options.newPackPatterns ?? NEW_PACK_COLOR_PATTERNS;

  if (migratedFiles.includes(file)) return "error";
  if (matchesColorPattern(file, newPackPatterns)) return "error";

  return "warn";
}

/**
 * Returns eslintrc `overrides` entries for the migrated files that live under
 * `packageRoot` (repo-relative, e.g. "apps/web"). Patterns are made relative to
 * the consuming config, as eslintrc requires.
 */
function migratedColorOverrides(packageRoot) {
  const prefix = `${normalizeRoot(packageRoot)}/`;
  const files = MIGRATED_COLOR_FILES.filter(
    (file) => file.startsWith(prefix) && ESLINT_SOURCE_FILE.test(file),
  ).map((file) => file.slice(prefix.length).replace(/\[/g, "[[]"));

  if (files.length === 0) return [];

  return [
    {
      files,
      rules: {
        "gamenode/no-hard-coded-colors": "error",
      },
    },
  ];
}

function colorRuleOffOverrides() {
  return [
    {
      files: [...COLOR_RULE_OFF_PATTERNS],
      rules: {
        "gamenode/no-hard-coded-colors": "off",
      },
    },
  ];
}

module.exports = {
  COLOR_RULE_OFF_PATTERNS,
  MIGRATED_COLOR_FILES,
  NEW_PACK_COLOR_PATTERNS,
  colorRuleOffOverrides,
  getCssColorSeverity,
  matchesColorPattern,
  migratedColorOverrides,
};
