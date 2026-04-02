/**
 * English translations for GameNode.
 * This file contains all English strings used across web and mobile apps.
 */
export const en = {
  actions: {
    cancel: "Cancel",
    confirm: "Confirm",
    goBack: "Go back",
    save: "Save",
    delete: "Delete",
    remove: "Remove",
    edit: "Edit",
    create: "Create",
    update: "Update",
    submit: "Submit",
    close: "Close",
    login: "Log in",
    logout: "Log out",
    selectAll: "Select all items",
    yes: "Yes",
    no: "No",
    share: "Share",
    showMore: "Show more",
    viewMore: "View More",
    seeMore: "See more",
  },
  common: {
    loading: "Loading...",
    error: "An error occurred",
    noResults: "No results found",
    search: "Search",
    searchPlaceholder: "Search...",
    or: "OR",
  },
  auth: {
    loginRequired: "This action requires you to be logged in.",
    loginPrompt: "Please log in to continue.",
    signIn: "Sign in",
    fetchingCredentials: "Fetching your credentials...",
  },
  confirm: {
    title: "Confirm action",
    message: "Are you sure you want to do this?",
  },
  game: {
    searchPlaceholder: "Search for games",
    selectGame: "Find and select a game",
    searchLabel: "Search for a game",
    removeFromLibrary: "Remove from your library",
    labels: {
      share: "Share",
      playedIn: "Played in",
      tip: "Tip",
      inLibrary: "In your library",
      gridView: "Grid",
      listView: "List",
      userRating: "User Rating",
    },
    buttons: {
      update: "Update",
      addLibrary: "Add to library",
    },
    tooltips: {
      addFavorites: "Add to your favorites",
      removeLibrary: "Remove from your library",
      share: "Share this game",
    },
    tabs: {
      overview: "Overview",
      reviews: "Reviews",
      discussion: "Discussion",
      achievements: "Achievements",
    },
    timeline: {
      added: "Game added to your collection",
      reviewed: "Game reviewed",
      finished: "Game marked as finished",
    },
    progress: {
      yourProgress: "Your progress",
      added: "Added",
      reviewed: "Reviewed",
      finished: "Finished",
      xpGained: "+{{xp}} XP",
    },
    messages: {
      notEnoughReviews: "We do not have enough reviews for this game.",
      noEntry: "No entry found.",
    },
    achievement: {
      notAvailable: "Not Available",
      ownedBy: "Owned by",
    },
    collectionTypes: {
      upcoming: "Upcoming",
    },
    share: {
      title: "GameNode Share",
      seeMoreAt: "See more at https://gamenode.app/game/{{gameId}}",
      recentlyPlayed: "These are my recently played games!",
      myReview: "My review of this game",
      shareReview: "Share your review with friends!",
    },
  },
  collection: {
    create: "Create collection",
    update: "Update collection",
    remove: "Remove collection",
    removeGame: "Remove game",
    labels: {
      name: "Collection name",
      description: "Description",
      public: "Public collection",
      featured: "Featured collection",
      automation: "Automation",
      enableAutoStatus: "Enable automatic status for games",
    },
    placeholders: {
      name: "🎮 Playing now",
      description: "Games I'm currently playing",
    },
    descriptions: {
      public: "If this collections is visible to other users",
      featured:
        "If this collections should be featured in your profile and library",
      autoStatus:
        "All games in this collection will be filled with the selected status when being added. Only affects new entries.",
    },
    titles: {
      createModal: "Create collection",
      updateModal: "Update collection",
      featured: "Featured Collections",
      all: "All Collections",
      new: "New Collection",
    },
    messages: {
      applyingChanges: "Applying changes...",
      orderingUpdated: "Your collection ordering has been updated.",
      createSuccess: "Successfully created collection.",
      updateSuccess: "Successfully updated collection.",
    },
    sorts: {
      addedDate: "Added Date",
      releaseDate: "Release Date",
      userOrder: "User Order",
    },
    validation: {
      featuredMustBePublic: "Featured collections must be public",
    },
  },
  collectionEntry: {
    labels: {
      status: "Status",
      platforms: "Platforms",
    },
    tabs: {
      details: "Details",
      review: "Review",
      dlcs: "DLCs",
      playlog: "Playlog",
      achievements: "Achievements",
    },
    descriptions: {
      statusDisabled:
        "Disabled because of selected collections' default status.",
    },
    statuses: {
      playing: "Playing",
      finished: "Finished",
      planned: "Planned",
      dropped: "Dropped",
    },
    placeholders: {
      platforms: "Select platforms",
      collections: "Select collections",
    },
    buttons: {
      update: "Update",
      add: "Add",
      editInLibrary: "Edit in library",
      viewGame: "View Game",
    },
    messages: {
      updateSuccess: "Game updated on your library!",
      addSuccess: "Game added to your library!",
      confirmRemove: "Are you sure?",
      moveSuccess: "Successfully moved {{count}} games!",
      fetchError: "Error while fetching game data. Please try again.",
      removeWarning:
        "You are about to remove this game and any related data (including reviews!) from your library.",
      moveHint:
        "If you wish to move this game between collections, you can use the Update option instead.",
    },
    timeline: {
      startedPlaying: "Started Playing",
      markedFinished: "Marked game as finished",
      droppedGame: "Dropped game",
      addedWishlist: "Added game to Wishlist",
      unknown: "Unknown",
    },
  },
  review: {
    remove: "Remove review",
    messages: {
      updated: "Review successfully updated!",
      created: "Review created!",
      saveFailed:
        "We couldn't save your review. If this persists, please contact support.",
      confirmRemove: "Are you sure you want to remove this review?",
    },
  },
  comment: {
    remove: "Remove comment",
    titles: {
      removeModal: "Remove comment",
    },
    messages: {
      submitted: "Successfully submitted your comment!",
      confirmRemove: "Are you sure you want to remove this comment?",
      removed: "Successfully removed your comment!",
    },
  },
  view: {
    grid: "Grid",
    list: "List",
    compact: "Compact View",
    detailed: "Detailed View",
  },
  language: {
    label: "Language",
    english: "English",
    portuguese: "Português",
  },
  navigation: {
    home: "Home",
    explore: "Explore",
    library: "Library",
    profile: "Profile",
    preferences: "Preferences",
    back: "Back",
    menu: "Menu",
    settings: "Settings",
    collections: "Collections",
    reviews: "Reviews",
    journal: "Journal",
    posts: "Posts",
    stats: "Stats",
    activity: "Activity",
    blog: "Blog",
    achievements: "Achievements",
    feats: "Feats",
  },
  home: {
    recentActivity: "Recent Activity",
    lastReviews: "Last reviews",
  },
  landing: {
    headline: "A new way to organize your entire game collection",
    headlineAlt: "Organize all your games in one place",
    subheadline:
      "GameNode is the ideal platform to manage your game collection virtually.",
    features: {
      customCollections: "Custom Collections",
      review: "Review",
      achievements: "Achievements",
      activities: "Activities",
      addGames: "Add games to your library space",
      makeReviews: "Make Reviews",
      shareWorld: "Share with the world",
    },
    featureDescription:
      "Update your wishlist, review the titles you've already tried, and add the most anticipated releases to your wishlist. Connect with your friends, follow their activity, and keep up with each one's latest gaming sessions.",
    platforms: {
      title: "Sync with platforms",
      description: "Import games from your platforms to your GameNode account",
      syncDescription:
        "Sync your library, your playtime directly on our website.",
      soon: "Soon",
    },
    mobile: {
      title: "Also available for mobile",
      titleAlt: "We're also on your phone!",
      description:
        "Access our app and enjoy all the features in the palm of your hand — wherever and whenever you want.",
      googlePlay: "Google Play",
      appStoreSoon: "Soon on App Store",
      soonIOS: "Soon in iOS.",
    },
    support: {
      title: "GameNode is maintained exclusively with community support",
      description:
        "Collaborate with us to keep our platform 100% Free and constantly evolving.",
      buyCoffe: "Buy us a coffee",
    },
  },
  notifications: {
    title: "Notifications",
    empty: "No notifications.",
    titles: {
      success: "Success",
      error: "Error",
      failed: "Failed",
      changesApplied: "Changes applied!",
    },
    messages: {
      error: "Something went wrong!",
    },
  },
  buttons: {
    goBack: "Go back",
    confirm: "Confirm",
  },
  profile: {
    labels: {
      newUsername: "Select a new username",
      stats: "Stats",
    },
    titles: {
      selectAchievements: "Select featured achievements",
      activity: "{{username}}'s Activity",
      library: "{{username}}'s library",
    },
    tabs: {
      games: "Games",
      reviews: "Reviews",
      collections: "Collections",
      achievements: "Achievements",
      feats: "Feats",
      journal: "Journal",
      posts: "Posts",
    },
    collections: {
      featured: "Featured",
      public: "Public Collections",
      loading: "Loading collections...",
    },
    messages: {
      usernameUpdateCooldown:
        "You have updated your username in the last 30 days. Please try again later.",
      usernameUpdated: "Your username has been updated!",
      bioUpdated: "Successfully updated your bio!",
      achievementsUpdated: "Successfully updated featured achievement!",
      noAchievements:
        "You have not obtained any achievements. Return here later, adventurer!",
      noReviews: "User has no reviews.",
      noReviewsOwn: "You have no reviews. Make your first one!",
      noFeaturedAchievements: "No featured achievements found.",
    },
    usernameRules: {
      unique: "Must be unique",
      minLength: "Must have at least 5 characters",
      cooldown: "You can only change it again after 30 days",
    },
    stats: {
      totalGamesPlayed: "Total Games Played",
      playedThisYear: "Played this year",
      totalPlaytime: "Total estimated playtime (in hours)*",
      playtimeNote1:
        "Based on data from available connections (e.g. Steam, PSN).",
      playtimeNote2: "Actual playtime may be much greater.",
      backlogTracking: "Backlog tracking",
      totalGames: "Total games",
      finishedGames: "Finished games",
      total: "Total",
      reviewed: "Reviewed",
      estimatedPlaytime: "Estimated playtime (in hours)*",
      year: "Year",
      finishYear: "Finish Year",
      releaseYear: "Release year",
      playtime: "Playtime",
    },
    recent: {
      recentlyPlayed: "Recently Played",
      recentActivity: "Recent activity",
    },
    memberSince: "Since {{date}}",
  },
  preferences: {
    categories: {
      connections: "Connections",
      account: "Account",
      library: "Library",
    },
    links: {
      reportBug: "Report a bug ",
      signOut: "Sign out",
    },
    labels: {
      autoImport: "Enable automatic importing",
      targetCollection: "Target collection (optional)",
      connectionIcon: "Connection icon",
      whatWillDo: "What this will do",
      confirmUsername: "Confirm with your username",
      dangerZone: "Danger Zone",
      preferredPlatforms: "Preferred Platforms",
    },
    titles: {
      sync: "Sync",
      restartAccount: "Restart Account",
    },
    descriptions: {
      autoImport: "Automatically import newly detected games to your library.",
      targetCollection:
        "Games will be added directly to your library if not specified.",
    },
    placeholders: {
      none: "None",
    },
    statuses: {
      connected: "Connected",
      notConnected: "Not connected",
    },
    messages: {
      connectionSetup: "Successfully set up {{type}} connection!",
      connectionRemoved: "Successfully removed {{type}} connection!",
      confirmRestart: "Are you sure you want to restart your account?",
      restartNote1:
        "This won't remove your email and it's user id association from our databases. Nor will it remove collected analytic data.",
      restartNote2:
        "If you want to completely remove this data, please reach out to us through Discord or email (support@gamenode.app).",
      irreversible:
        "This action is irreversible. We won't be able to restore your account if you restart it.",
      restartLogout:
        "After using this service, you will be logged off, and will be able to log-in again with a brand new account.",
      noPlatforms: "No preferred platform added.",
    },
    restartWarnings: {
      profile: "Wipe your profile",
      achievements: "Wipe your achievements",
      connections: "Wipe your connections",
      activity: "Wipe your activity",
      preferences: "Wipe your preferences",
      reviews: "Wipe your reviews",
      library: "Wipe your library",
      libraryFull: "Wipe your library, including collections and added games",
      playtime: "Wipe your playtime",
      playtimeFull:
        "Wipe all playtime related information, including manual sessions",
    },
    platforms: {
      loading: "Loading platforms...",
      description:
        "These platforms will be used automatically when adding new games that support these platforms.",
    },
  },
  playtime: {
    platforms: {
      steam: "Steam",
      psn: "PSN",
      epicGames: "EpicGames",
      gog: "GOG",
      battleNet: "Battle.net",
      nintendoWii: "Nintendo Wii",
      nintendoWiiU: "Nintendo Wii U",
      nintendoSwitch: "Nintendo Switch",
      emulator: "Emulator",
      xbox: "Xbox",
    },
    validation: {
      numberRequired: "Total playtime must be a number.",
      platformRequired: "A platform must be selected.",
    },
    messages: {
      sessionRecorded: "Play session recorded successfully",
    },
  },
  library: {
    buttons: {
      importGames: "Import games",
    },
    placeholders: {
      selectCollection: "Select a collection",
    },
    sorts: {
      addedDate: "Added Date",
      releaseDate: "Release Date",
      userOrder: "User Order",
    },
  },
  importer: {
    title: "GAME IMPORTER",
    description:
      "Select one or multiple games which you want to bring to your GameNode library.",
    collectionsHint:
      "Optional. Select collections to add the imported games to.",
    noItemsAvailable:
      "No items available for importing. Check if your library at the target platform is set to public.",
    buttons: {
      import: "Import",
    },
    messages: {
      itemExcluded: "Successfully excluded item already in your library.",
      applyingChanges: "Applying changes...",
      importSuccess: "Successfully imported {{count}} games!",
      selectAtLeastOne: "Select at least one game.",
      invalidExternalGame:
        "Error while inserting game. Invalid external game ID. Please contact support.",
      syncFailed: "Failed to sync changes!",
    },
  },
  achievements: {
    titles: {
      redeemCode: "Redeem achievement with a code",
    },
    labels: {
      code: "Your achievement code",
    },
    descriptions: {
      codeFormat: "It may contain letters and numbers",
    },
    buttons: {
      redeem: "Redeem",
    },
    messages: {
      redeemed: "Successfully redeemed your code. Enjoy!",
    },
  },
  awards: {
    title: "AWARDS",
    subtitle: "The Game Awards and GameNode community's nominees in one place",
    voteNow: "Vote now",
    participationReward: "Earn 1000XP and a badge for participating!",
    categoriesCount: "{{count}} Categories",
    votedByPublic: "Voted by the public",
    resultsDate: "Results {{date}}",
    currentPhase: "Current Phase",
    indicatedBy: "Indicated by",
    labels: {
      nominees: "Nominees",
      preview: "Preview",
      layout: "Layout",
    },
    layouts: {
      compact: "Compact",
      large: "Large",
    },
    phases: {
      startingSoon: "Starting Soon",
      countingVotes: "Counting of Votes",
      eventEnded: "Event Ended",
      voting: "Voting",
    },
    phaseMessages: {
      votingStartsIn: "Voting starts in {{time}}",
      votingEnded: "Voting ended. Results will be out in {{time}}",
      resultsOut: "Results are out!",
      votingEndsIn: "Voting ends in {{time}}",
    },
    share: {
      title: "Share your votes!",
      linkCopied: "Link Copied!",
      shareWithLink: "Share with Link",
      shareWithImage: "Share with Image",
      scrollHint: "Scroll/swipe to see full image.",
    },
    messages: {
      voteSubmitted: "Your vote for {{category}} has been submitted!",
    },
  },
  reports: {
    messages: {
      error:
        "Error while sending your report. Please try again. If this persists, contact support.",
      success:
        "Thank you for submitting your report! It will be reviewed by our moderators as soon as possible.",
      contentDeleted: "The reported content may have been deleted.",
    },
  },
  blog: {
    recentPosts: "Recent blog posts",
    recentReviews: "Recent reviews",
    disclaimer:
      "Our blog posts are published by independent contributors as a way to give visibility to the great writers and editors of our community. You too can write for us if interested!",
    contentNotice:
      "As such, these blog posts may not share or reflect the ideals, vision or opinions of the core GameNode team. Content is of responsibility of the Post author. Please contact our team through Discord if you notice any issues.",
    nav: {
      home: "Home",
      archive: "Archive",
      news: "News",
      reviews: "Reviews",
      articles: "Articles",
      gameNode: "GameNode",
    },
    buttons: {
      seeMore: "See more",
    },
    messages: {
      postDeleted: "Successfully deleted post!",
    },
  },
  posts: {
    messages: {
      published: "Successfully published post!",
    },
  },
  recap: {
    title: "RECAP",
    labels: {
      topGenresStyles: "Most played genres and styles",
      playedGames: "Played Games",
      hoursPlayed: "Hours Played",
      preview: "Preview",
      period: "Period",
    },
    periods: {
      week: "Week",
      month: "Month",
      year: "Year",
    },
    stats: {
      dataNote:
        "Based on data received from connected platforms and played/finished/dropped dates in library items.",
      dataNotePlatforms: "Based on data received from connected platforms.",
      thisIs: "This is",
      minutes: "{{count}} minutes",
      days: "{{count}} days",
      weeks: "{{count}} weeks",
      months: "{{count}} months",
    },
    share: {
      linkCopied: "Link copied to clipboard",
      sharePrompt: "Share your recap with your friends!",
    },
    messages: {
      dataNote: "Based on data received from connected platforms.",
    },
  },
  upload: {
    labels: {
      maxFiles: "Max files: {{max}}",
      maxSize: "Max size: {{size}}MB",
    },
    dragPrompt: "Drag images here or click to select files",
  },
  user: {
    labels: {
      level: "Level {{level}}",
      xp: "{{exp}} / {{cost}} XP",
    },
  },
  journal: {
    loading: "Loading Journal...",
    achievements: {
      loading: "Loading achievements...",
      description:
        "This section of the journal is dedicated to showcasing the achievements you've obtained in the games you play. It's a way to celebrate your gaming milestones and share your accomplishments with the community.",
      autoUpdate:
        "This information is automatically updated periodically* from the gaming platforms you connect to your GameNode profile, such as Steam, Xbox and PlayStation.",
      updateNote:
        "*The update frequency may vary based on the platform and its API limitations.",
      tipLabel: "Tip: ",
      tipAction:
        "{{action}} the achievements to show details. Latest achievements are shown first.",
      tap: "Tap",
      hover: "Hover",
    },
  },
  errors: {
    unexpected: "An unexpected error has occurred while loading this page",
    copiedToClipboard: "Error details copied to clipboard",
    pasteInstructions:
      "You may now paste the error details when reporting the issue.",
    showDetails: "Show details",
    reportPrompt:
      "Please let us know about this error by sending us a message via",
    email: "email",
    discord: "Discord",
    fetchFailed: "Failed to fetch {{resource}}. Please try again.",
    pageNotFound: "The page you are looking for doesn't exist.",
    inDevelopment: "This page is still in development.",
    comeBackSoon: "Come back soon!",
    oops: "Oops!",
    error404: "Error 404",
  },
  app: {
    betterInApp: "GameNode is (even) better in the app!",
    openInApp: "Open in app",
  },
  mobile: {
    preferences: {
      profile: "Profile",
      editProfile: "Edit profile",
      editProfileDetails: "Edit profile details",
      misc: "Misc",
      cacheClearedSuccess: "Cache cleared successfully!",
      clearLocalCache: "Clear local cache",
      importerSystem: "Importer system",
    },
    wrapped: {
      title: "Wrapped",
      sharePrompt: "This is my GameNode Wrapped!",
      shareDescription: "Share your wrapped with friends!",
      recentlyPlayed: "Recently played games",
      recap: "{{year}} Recap",
    },
    search: {
      startTyping: "Start typing to see results.",
      placeholder: "Search for users or games",
      noResults: "No results.",
      fetchFailed: "Failed to fetch results.",
    },
    awards: {
      sharePrompt: "These are my GameNode Awards nominees!",
    },
  },
  shell: {
    search: {
      placeholder: "Search for users or games",
      noResults: "No results.",
      fetchFailed: "Failed to fetch results.",
    },
  },
  legal: {
    tos: {
      title: "Terms of service",
      section1Title: "1. Terms",
      section1Content:
        "By accessing the website at GameNode you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.",
      section2Title: "2. Use License",
      section2Intro:
        "Permission is granted to temporarily download one copy of the materials (information or software) on GameNode's website for personal, non-commercial transitory viewing only. This is the grant of a licence, not a transfer of title, and under this licence you may not:",
      section2Item1: "modify or copy the materials;",
      section2Item2:
        "use the materials for any commercial purpose, or for any public display (commercial or non-commercial);",
      section2Item3:
        "attempt to decompile or reverse engineer any software contained on GameNode website;",
      section2Item4:
        "remove any copyright or other proprietary notations from the materials; or",
      section2Item5:
        "transfer the materials to another person or 'mirror' the materials on any other server.",
      section2Outro:
        "This licence shall automatically terminate if you violate any of these restrictions and may be terminated by GameNode at any time. Upon terminating your viewing of these materials or upon the termination of this licence, you must destroy any downloaded materials in your possession whether in electronic or printed format.",
      section3Title: "3. Disclaimer",
      section3Content:
        "The materials on GameNode's website are provided on an 'as is' basis. GameNode makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
      section3Content2:
        "Further, GameNode does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.",
      section4Title: "4. Limitations",
      section4Content:
        "In no event shall GameNode or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GameNode's website, even if GameNode or a GameNode authorised representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.",
      section5Title: "5. Accuracy of materials",
      section5Content:
        "The materials appearing on GameNode's website could include technical, typographical, or photographic errors. GameNode does not warrant that any of the materials on its website are accurate, complete or current. GameNode may make changes to the materials contained on its website at any time without notice. However GameNode does not make any commitment to update the materials.",
      section6Title: "6. Links",
      section6Content:
        "GameNode has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by GameNode of the site. Use of any such linked website is at the user's own risk.",
      section7Title: "7. Modifications",
      section7Content:
        "GameNode may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.",
      section8Title: "8. Governing Law",
      section8Content:
        "These terms and conditions are governed by and construed in accordance with the laws of Brasil and you irrevocably submit to the exclusive jurisdiction of the courts in that State, Country or location.",
    },
    privacy: {
      title: "Privacy Policy",
      intro:
        "Your privacy is important to us. It is GameNode's policy to respect your privacy regarding any information we may collect from you across our website, GameNode, and other sites we own and operate. We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we're collecting it and how it will be used. We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we'll protect within commercially acceptable means to prevent loss and theft, as well as unauthorised access, disclosure, copying, use or modification. We don't share any personally identifying information publicly or with third-parties, except when required to by law. Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies. You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services. Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.",
      contactTitle: "Contact",
      contactText:
        "You may reach out to us at any given moment using our email:",
      contactEmail: "support@gamenode.app",
      cookieTitle: "Cookie Policy for GameNode",
      cookieIntro:
        "This is the Cookie Policy for GameNode, accessible from URL https://gamenode.app.",
      whatAreCookiesTitle: "What Are Cookies",
      whatAreCookiesContent:
        "As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or break certain elements of the sites functionality.",
      howWeUseTitle: "How We Use Cookies",
      howWeUseContent:
        "We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.",
      disablingTitle: "Disabling Cookies",
      disablingContent:
        "You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site. Therefore it is recommended that you do not disable cookies.",
      thirdPartyTitle: "Third-party Cookies",
      thirdPartyContent:
        "In some special cases we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.",
      cloudflareIntro: "Our website and content is served and protected by",
      cloudflare: "Cloudflare",
      cloudflareContent:
        ". As such, this third party provider may inject some third party cookies to analyze your visits in our site. To avoid this, either disable cookies in your browser, or use some form of tracking protection.",
      cloudflarePrivacy: "You may read Cloudflare's privacy notice",
      here: "here",
      cookiesWeSetTitle: "The cookies we set",
      weUse: "We use",
      posthog: "Posthog",
      posthogContent:
        " for product and web analytics. This means Posthog's Javascript is injected in this website and used to collected information about your visited pages, usage patterns and etc. We never sell this data. It's used exclusively for improving our service.",
      posthogPrivacy: "You may read Posthog's privacy notice",
      matomoNote:
        "Previously, we used Matomo as our analytics tool of choice. We discontinued this service because of the maintenance cost of keeping our own instance.",
      consentTitle: "Consent",
      consentContent:
        "Please keep in mind that by using our website and services you hereby agree to our privacy policy and terms of service.",
      dataRemoval:
        "If you with to stop using our services and to have your data removed from our end (e.g. data we actually have access and control of), please feel free to contact us.",
    },
  },
};

export type TranslationSchema = typeof en;
