import type { TranslationSchema } from "./en";

/**
 * Portuguese (Brazil) translations for GameNode.
 * This file contains all Portuguese strings used across web and mobile apps.
 */
export const ptBR: TranslationSchema = {
  actions: {
    cancel: "Cancelar",
    confirm: "Confirmar",
    goBack: "Voltar",
    save: "Salvar",
    delete: "Excluir",
    remove: "Remover",
    edit: "Editar",
    create: "Criar",
    update: "Atualizar",
    submit: "Enviar",
    skip: "Pular",
    close: "Fechar",
    login: "Entrar",
    logout: "Sair",
    selectAll: "Selecionar todos os itens",
    yes: "Sim",
    no: "Não",
    share: "Compartilhar",
    showMore: "Mostrar mais",
    showLess: "Mostrar menos",
    viewMore: "Ver Mais",
    seeMore: "Ver mais",
  },
  common: {
    loading: "Carregando...",
    error: "Ocorreu um erro",
    noResults: "Nenhum resultado encontrado",
    search: "Buscar",
    searchPlaceholder: "Buscar...",
    or: "OU",
    actions: "Acoes",
  },
  auth: {
    loginRequired: "Esta ação requer que você esteja logado.",
    loginPrompt: "Por favor, faça login para continuar.",
    signIn: "Entrar",
    fetchingCredentials: "Buscando suas credenciais...",
  },
  confirm: {
    title: "Confirmar ação",
    message: "Tem certeza de que deseja fazer isso?",
  },
  game: {
    searchPlaceholder: "Buscar jogos",
    selectGame: "Encontrar e selecionar um jogo",
    searchLabel: "Buscar por um jogo",
    removeFromLibrary: "Remover da sua biblioteca",
    searchTips: {
      pressHold:
        "Pressione e segure a capa de um jogo para adicioná-lo rapidamente à sua biblioteca",
      acronym: "Você também pode buscar pelas siglas dos jogos (ex.: tw3, gow)",
    },
    details: {
      launchDate: "Data de lançamento",
      whereToPlay: "Onde jogar",
      whereToBuy: "Onde comprar",
      summary: "Resumo",
      notAvailable: "Não disponível",
      developers: "Desenvolvedora(s)",
      publishers: "Editora(s)",
    },
    extra: {
      otherVersions: "Outras versões deste jogo",
      remakeOf: "Remake de",
      remasterOf: "Remaster de",
      expansionOf: "Expansão de",
      expansions: "Expansões",
      dlcOf: "DLC de",
      dlcs: "DLCs",
      similarGames: "Jogos similares",
    },
    ttb: {
      title: "Tempo para zerar",
      notEnoughSubmissions: "Sem envios suficientes.",
      basedOnIgdb: "Baseado em {{count}} envios para a",
      mainStory: "História principal",
      mainExtras: "Principal + Extras",
      completionist: "100%",
      mainStoryDesc:
        "Tempo médio para terminar o jogo até os créditos sem gastar tempo relevante em extras como missões secundárias.",
      mainExtrasDesc:
        "Tempo médio para terminar o jogo incluindo alguns extras como missões secundárias, sem ser totalmente minucioso.",
      completionistDesc:
        "Tempo médio para terminar o jogo com 100% de conclusão.",
    },
    labels: {
      share: "Compartilhar",
      playedIn: "Jogado em",
      tip: "Dica",
      inLibrary: "Na sua biblioteca",
      gridView: "Grade",
      listView: "Lista",
      userRating: "Avaliação dos Usuários",
      externalStore: "Loja externa",
    },
    buttons: {
      update: "Atualizar",
      addLibrary: "Adicionar à biblioteca",
    },
    tooltips: {
      addFavorites: "Adicionar aos seus favoritos",
      removeLibrary: "Remover da sua biblioteca",
      share: "Compartilhar este jogo",
    },
    tabs: {
      overview: "Visão Geral",
      reviews: "Avaliações",
      discussion: "Discussão",
      achievements: "Conquistas",
    },
    timeline: {
      added: "Jogo adicionado à sua coleção",
      reviewed: "Jogo avaliado",
      finished: "Jogo marcado como concluído",
    },
    progress: {
      yourProgress: "Seu progresso",
      added: "Adicionado",
      reviewed: "Avaliado",
      finished: "Concluído",
      xpGained: "+{{xp}} XP",
    },
    messages: {
      notEnoughReviews: "Não temos avaliações suficientes para este jogo.",
      noEntry: "Nenhuma entrada encontrada.",
    },
    achievement: {
      overviewTitle: "Conquistas",
      notAvailable: "Não Disponível",
      ownedBy: "Obtida por",
      trophies: "Trofeus",
      achievements: "Conquistas",
      obtainedAt: "Obtida em {{date}}",
    },
    collectionTypes: {
      upcoming: "Em breve",
    },
    share: {
      title: "GameNode Compartilhar",
      seeMoreAt: "Veja mais em https://gamenode.app/game/{{gameId}}",
      recentlyPlayed: "Estes são meus jogos recentes!",
      myReview: "Minha avaliação deste jogo",
      shareReview: "Compartilhe sua avaliação com amigos!",
      options: {
        rating: "Nota",
        ownedPlatforms: "Plataformas possuidas",
        divider: "Divisor",
        transparentBackground: "Fundo transparente",
      },
      messages: {
        generateFailed: "Falha ao gerar a imagem final.",
      },
    },
  },
  collection: {
    create: "Criar coleção",
    update: "Atualizar coleção",
    remove: "Remover coleção",
    removeGame: "Remover jogo",
    labels: {
      name: "Nome da coleção",
      description: "Descrição",
      public: "Coleção pública",
      featured: "Coleção em destaque",
      automation: "Automação",
      enableAutoStatus: "Ativar status automático para jogos",
    },
    placeholders: {
      name: "🎮 Jogando agora",
      description: "Jogos que estou jogando atualmente",
    },
    descriptions: {
      public: "Se esta coleção é visível para outros usuários",
      featured:
        "Se esta coleção deve aparecer em destaque no seu perfil e biblioteca",
      autoStatus:
        "Todos os jogos desta coleção serão preenchidos com o status selecionado ao serem adicionados. Afeta apenas novas entradas.",
    },
    titles: {
      createModal: "Criar coleção",
      updateModal: "Atualizar coleção",
      featured: "Coleções em Destaque",
      all: "Todas as Coleções",
      new: "Nova Coleção",
    },
    actions: {
      updateDetails: "Atualizar titulo e descricao",
      reorderGames: "Reordenar jogos",
      moveGames: "Mover jogos para outra colecao",
      discard: "Descartar",
      apply: "Aplicar",
    },
    messages: {
      applyingChanges: "Aplicando alterações...",
      orderingUpdated: "A ordenação da sua coleção foi atualizada.",
      createSuccess: "Coleção criada com sucesso.",
      updateSuccess: "Coleção atualizada com sucesso.",
      orderingHint:
        'Arraste e solte elementos para reordenar jogos nesta coleção. Esta ordenação será mostrada quando um visitante selecionar "Ordem do Usuário" (padrão) como opção de ordenação.',
      syncFailed: "Falha ao sincronizar alterações!",
      changesCount: "{{count}} alterações",
      atLeastOneGame: "Pelo menos um jogo deve ser selecionado.",
      targetCollectionStringError:
        "Coleções de destino retornadas como string. Por favor, contate o suporte.",
      atLeastOneCollection: "Pelo menos uma coleção deve ser selecionada",
      relevantFilteringFailed:
        "A filtragem de entradas relevantes da coleção está falhando. Por favor, contate o suporte.",
      gamesToMove: "Jogos para mover",
      gamesToMoveHint:
        "Selecione quais jogos você quer mover. Você pode pesquisar digitando o nome de um jogo.",
      targetCollections: "Coleções de destino",
      targetCollectionsHint:
        "Coleções nas quais você quer inserir esses jogos. Você pode pesquisar pelo nome de uma coleção.",
    },
    sorts: {
      addedDate: "Data de Adição",
      releaseDate: "Data de Lançamento",
      userOrder: "Ordem do Usuário",
    },
    validation: {
      featuredMustBePublic: "Coleções em destaque devem ser públicas",
    },
  },
  collectionEntry: {
    labels: {
      status: "Status",
      platforms: "Plataformas",
      rating: "Avaliação",
      collections: "Coleções",
      optional: "Opcional",
      finishedDate: "Data de conclusão",
    },
    titles: {
      editGame: "Editar jogo",
      addGame: "Adicionar jogo",
    },
    tabs: {
      details: "Detalhes",
      review: "Avaliação",
      dlcs: "DLCs",
      playlog: "Registro de Jogo",
      achievements: "Conquistas",
    },
    dlcs: {
      title: "Adicionar conteudo relacionado a este jogo",
      description:
        "Esses itens serao adicionados a sua biblioteca junto com este jogo. Eles so ficarao visiveis ao visitar a pagina de detalhes da entrada. Eles vao herdar o status e as plataformas deste jogo, mas nao serao adicionados a colecoes. Voce sempre pode adiciona-los manualmente depois.",
    },
    descriptions: {
      statusDisabled:
        "Desativado devido ao status padrão das coleções selecionadas.",
      collectionsOptional:
        "Opcional. Em quais coleções você quer salvar este jogo?",
      finishedDateOptional: "Opcional. Deixe vazio se você não lembrar.",
      platformSearch: "Você pode buscar uma plataforma digitando o nome dela",
      preferredPlatformsHint:
        "para preencher este campo automaticamente ao adicionar novos jogos.",
    },
    statuses: {
      playing: "Jogando",
      finished: "Concluído",
      planned: "Planejado",
      dropped: "Abandonado",
    },
    placeholders: {
      platforms: "Selecione plataformas",
      collections: "Selecione coleções",
      reviewContent:
        "Conteúdo da avaliação. Deixe vazio para criar uma avaliação apenas com nota.",
    },
    buttons: {
      update: "Atualizar",
      add: "Adicionar",
      editInLibrary: "Editar na biblioteca",
      viewGame: "Ver Jogo",
    },
    validation: {
      collectionRequired: "A coleção deve ser válida.",
      platformRequired: "Selecione pelo menos uma plataforma.",
      ratingInvalid: "A avaliação deve ser um número entre 1 e 5.",
      ratingInvalidDecimal: "A avaliação deve ter no máximo uma casa decimal.",
    },
    messages: {
      updateSuccess: "Jogo atualizado na sua biblioteca!",
      addSuccess: "Jogo adicionado à sua biblioteca!",
      confirmRemove: "Tem certeza?",
      moveSuccess: "{{count}} jogos movidos com sucesso!",
      fetchError: "Erro ao buscar dados do jogo. Por favor, tente novamente.",
      removeWarning:
        "Você está prestes a remover este jogo e todos os dados relacionados (incluindo avaliações!) da sua biblioteca.",
      moveHint:
        "Se você deseja mover este jogo entre coleções, você pode usar a opção Atualizar.",
    },
    review: {
      quickLabel: "Deixe uma avaliação rápida",
      quickDescription: "Você sempre pode editá-la depois.",
      optionalDescription:
        "Opcional. Deixe vazio para criar uma avaliação apenas com nota.",
    },
    related: {
      title: "Conteúdo relacionado",
      description: "DLCs e expansões possuídos",
    },
    timeline: {
      startedPlaying: "Começou a Jogar",
      markedFinished: "Jogo marcado como concluído",
      droppedGame: "Jogo abandonado",
      addedWishlist: "Jogo adicionado à Lista de Desejos",
      unknown: "Desconhecido",
    },
  },
  review: {
    remove: "Remover avaliação",
    titles: {
      yourReview: "Sua avaliação",
    },
    descriptions: {
      writePublic:
        "Escreva suas opiniões sobre este jogo. As avaliações são públicas para todos os usuários.",
    },
    messages: {
      updated: "Avaliação atualizada com sucesso!",
      created: "Avaliação criada!",
      noContent: "Esta avaliacao nao tem conteudo.",
      saveFailed:
        "Não foi possível salvar sua avaliação. Se isso persistir, entre em contato com o suporte.",
      confirmRemove: "Tem certeza de que deseja remover esta avaliação?",
    },
  },
  comment: {
    remove: "Remover comentário",
    titles: {
      removeModal: "Remover comentário",
      commentsInPost: "Comentários nesta postagem",
      commentsInActivity: "Comentários nesta atividade",
      commentsInReview: "Comentários nesta avaliação",
    },
    labels: {
      replyingTo: "Respondendo ao comentário de {{username}}",
    },
    placeholders: {
      writeComment: "Escreva um comentário sobre isso...",
    },
    messages: {
      submitted: "Comentário enviado com sucesso!",
      confirmRemove: "Tem certeza de que deseja remover este comentário?",
      removed: "Comentário removido com sucesso!",
      fetchError: "Erro ao buscar comentários. Por favor, tente novamente.",
    },
  },
  view: {
    grid: "Grade",
    list: "Lista",
    compact: "Visualização Compacta",
    detailed: "Visualização Detalhada",
  },
  language: {
    label: "Idioma",
    english: "English",
    portuguese: "Português",
  },
  navigation: {
    home: "Início",
    explore: "Explorar",
    library: "Biblioteca",
    profile: "Perfil",
    preferences: "Preferências",
    back: "Voltar",
    menu: "Menu",
    settings: "Configurações",
    collections: "Coleções",
    reviews: "Avaliações",
    journal: "Diário",
    posts: "Postagens",
    stats: "Estatísticas",
    activity: "Atividade",
    blog: "Blog",
    achievements: "Conquistas",
    feats: "Feitos",
    about: "Sobre",
    privacy: "Privacidade",
    terms: "Termos",
  },
  home: {
    recentActivity: "Atividade Recente",
    lastReviews: "Últimas avaliações",
    trendingGames: "Jogos em alta",
    trendingReviews: "Avaliações em alta",
    noResultsTryAgain: "Nenhum resultado encontrado. Tente novamente.",
  },
  activity: {
    tabs: {
      all: "Todos",
      following: "Seguindo",
    },
    items: {
      addedTo: "Adicionado a {{collection}}",
      reviewed: "Avaliou",
      postedAbout: "Publicou sobre",
      followed: "Seguiu",
      unknown:
        "Realizou uma acao ainda nao mapeada. Isso sera atualizado em breve.",
      obtainedAllAndPlatinum:
        "Obteve troféu de platina e completou todas as conquistas",
      completedAllAchievements: "Completou todas as conquistas",
      obtainedPlatinum: "Obteve troféu de platina",
      obtainedAchievements: "Obteve {{count}} conquista{{suffix}}",
    },
    messages: {
      noActivities:
        "Nenhuma atividade para mostrar. Tente um filtro diferente.",
      fetchError: "Erro ao buscar atividades. Por favor, tente novamente.",
      noRecentActivity: "Nenhuma atividade recente para mostrar.",
    },
  },
  recommendation: {
    basedOnPlayed: "Com base nos seus jogos jogados",
    gamesYouMayLike: "Jogos de {{name}} que você pode gostar",
  },
  landing: {
    headline: "Uma nova forma de organizar toda a sua coleção de jogos",
    headlineAlt: "Organize todos os seus jogos em um só lugar",
    subheadline:
      "GameNode é a plataforma ideal para gerenciar sua coleção de jogos virtualmente.",
    features: {
      customCollections: "Coleções Personalizadas",
      review: "Avaliação",
      achievements: "Conquistas",
      activities: "Atividades",
      addGames: "Adicione jogos ao seu espaço de biblioteca",
      makeReviews: "Faça Avaliações",
      shareWorld: "Compartilhe com o mundo",
    },
    featureDescription:
      "Atualize sua lista de desejos, avalie os títulos que você já experimentou e adicione os lançamentos mais esperados à sua lista. Conecte-se com seus amigos, acompanhe suas atividades e fique por dentro das últimas sessões de jogo de cada um.",
    platforms: {
      title: "Sincronize com plataformas",
      description: "Importe jogos das suas plataformas para sua conta GameNode",
      syncDescription:
        "Sincronize sua biblioteca, seu tempo de jogo diretamente no nosso site.",
      soon: "Em breve",
    },
    mobile: {
      title: "Também disponível para celular",
      titleAlt: "Também estamos no seu celular!",
      description:
        "Acesse nosso app e aproveite todas as funcionalidades na palma da sua mão — onde e quando quiser.",
      googlePlay: "Google Play",
      appStoreSoon: "Em breve na App Store",
      soonIOS: "Em breve no iOS.",
    },
    support: {
      title: "GameNode é mantido exclusivamente com apoio da comunidade",
      description:
        "Colabore conosco para manter nossa plataforma 100% gratuita e em constante evolução.",
      buyCoffe: "Nos pague um café",
      apoia: "Apoia.se",
    },
    header: {
      aboutUs: "Sobre nos",
      serviceStatus: "Status do servico",
      collaborate: "Colaborar",
      androidApp: "App Android",
      joinIn: "Participar",
    },
  },
  notifications: {
    title: "Notificações",
    empty: "Nenhuma notificação.",
    titles: {
      success: "Sucesso",
      error: "Erro",
      failed: "Falhou",
      changesApplied: "Alterações aplicadas!",
    },
    messages: {
      error: "Algo deu errado!",
    },
  },
  buttons: {
    goBack: "Voltar",
    confirm: "Confirmar",
  },
  profile: {
    labels: {
      newUsername: "Selecione um novo nome de usuário",
      stats: "Estatísticas",
      previewAvatar: "Como sua nova foto de perfil vai aparecer",
      previewBanner:
        "O tamanho real do banner pode variar conforme o dispositivo e modelo.",
    },
    titles: {
      selectAchievements: "Selecionar conquistas em destaque",
      activity: "Atividade de {{username}}",
      library: "Biblioteca de {{username}}",
      favoriteGames: "Jogos favoritos",
    },
    tabs: {
      games: "Jogos",
      reviews: "Avaliações",
      collections: "Coleções",
      achievements: "Conquistas",
      feats: "Feitos",
      journal: "Diário",
      posts: "Postagens",
    },
    collections: {
      featured: "Destaque",
      public: "Coleções Públicas",
      loading: "Carregando coleções...",
    },
    messages: {
      usernameUpdateCooldown:
        "Você atualizou seu nome de usuário nos últimos 30 dias. Por favor, tente novamente mais tarde.",
      usernameUpdated: "Seu nome de usuário foi atualizado!",
      bioUpdated: "Biografia atualizada com sucesso!",
      achievementsUpdated: "Conquista em destaque atualizada com sucesso!",
      noAchievements:
        "Você ainda não obteve nenhuma conquista. Volte aqui mais tarde, aventureiro!",
      noReviews: "O usuário não tem avaliações.",
      noReviewsOwn: "Você não tem avaliações. Faça sua primeira!",
      noFeaturedAchievements: "Nenhuma conquista em destaque encontrada.",
      noPublicFavoriteGames:
        "Este usuário não possui jogos favoritos públicos.",
      fetchFailed: "Não foi possível buscar esses dados. Tente novamente.",
    },
    usernameRules: {
      unique: "Deve ser único",
      minLength: "Deve ter pelo menos 5 caracteres",
      cooldown: "Você só pode alterá-lo novamente após 30 dias",
    },
    stats: {
      totalGamesPlayed: "Total de Jogos Jogados",
      playedThisYear: "Jogados este ano",
      totalPlaytime: "Tempo total estimado de jogo (em horas)*",
      playtimeNote1:
        "Baseado em dados de conexões disponíveis (ex: Steam, PSN).",
      playtimeNote2: "O tempo real de jogo pode ser muito maior.",
      backlogTracking: "Acompanhamento de backlog",
      totalGames: "Total de jogos",
      finishedGames: "Jogos concluídos",
      total: "Total",
      reviewed: "Avaliados",
      estimatedPlaytime: "Tempo de jogo estimado (em horas)*",
      year: "Ano",
      finishYear: "Ano de Conclusão",
      releaseYear: "Ano de lançamento",
      playtime: "Tempo de Jogo",
      gamesByYear: "Jogos por ano",
      gamesByPlatform: "Jogos por plataforma",
      libraryDistribution: "Distribuição da biblioteca",
      gamesLabel: "Jogos",
      collectionsLabel: "Coleções",
      finishedGamesLabel: "Jogos concluídos",
    },
    recent: {
      recentlyPlayed: "Jogados Recentemente",
      recentActivity: "Atividade recente",
    },
    memberSince: "Membro desde {{date}}",
  },
  preferences: {
    categories: {
      connections: "Conexões",
      account: "Conta",
      library: "Biblioteca",
    },
    links: {
      reportBug: "Reportar um bug ",
      signOut: "Sair",
    },
    labels: {
      autoImport: "Ativar importação automática",
      targetCollection: "Coleção de destino (opcional)",
      connectionIcon: "Ícone da conexão",
      whatWillDo: "O que isso fará",
      confirmUsername: "Confirme com seu nome de usuário",
      dangerZone: "Zona de Perigo",
      preferredPlatforms: "Plataformas Preferidas",
      steamProfileUrl: "URL pública do seu perfil Steam",
      psnOnlineId: "Seu ID online da PSN",
      gamertag: "Seu Gamertag",
    },
    titles: {
      sync: "Sincronizar",
      restartAccount: "Reiniciar Conta",
      editPreferredPlatforms: "Edite suas plataformas preferidas",
    },
    descriptions: {
      autoImport:
        "Importar automaticamente jogos recém-detectados para sua biblioteca.",
      targetCollection:
        "Os jogos serão adicionados diretamente à sua biblioteca se não especificado.",
      steamProfileUrlExample: "ex.: https://steamcommunity.com/id/seu-usuario/",
      psnOnlineId: "Normalmente é o seu nome de usuário.",
      gamertag: "É o nome que aparece no seu console ou nos apps do Xbox.",
    },
    placeholders: {
      none: "Nenhum",
    },
    statuses: {
      connected: "Conectado",
      notConnected: "Não conectado",
    },
    messages: {
      connectionSetup: "Conexão {{type}} configurada com sucesso!",
      connectionRemoved: "Conexão {{type}} removida com sucesso!",
      confirmRestart: "Tem certeza de que deseja reiniciar sua conta?",
      restartNote1:
        "Isso não removerá seu e-mail e a associação de ID de usuário de nossos bancos de dados. Nem removerá dados analíticos coletados.",
      restartNote2:
        "Se você deseja remover completamente esses dados, entre em contato conosco pelo Discord ou e-mail (support@gamenode.app).",
      irreversible:
        "Esta ação é irreversível. Não poderemos restaurar sua conta se você reiniciá-la.",
      restartLogout:
        "Após usar este serviço, você será desconectado e poderá fazer login novamente com uma conta totalmente nova.",
      noPlatforms: "Nenhuma plataforma preferida adicionada.",
      availableConnectionsError:
        "Erro ao buscar conexões disponíveis. Por favor, atualize esta página.",
    },
    validation: {
      usernameRequired: "Um nome de usuário deve ser informado.",
    },
    restartWarnings: {
      profile: "Limpar seu perfil",
      achievements: "Limpar suas conquistas",
      connections: "Limpar suas conexões",
      activity: "Limpar sua atividade",
      preferences: "Limpar suas preferências",
      reviews: "Limpar suas avaliações",
      library: "Limpar sua biblioteca",
      libraryFull:
        "Limpar sua biblioteca, incluindo coleções e jogos adicionados",
      playtime: "Limpar seu tempo de jogo",
      playtimeFull:
        "Limpar todas as informações relacionadas a tempo de jogo, incluindo sessões manuais",
    },
    platforms: {
      loading: "Carregando plataformas...",
      description:
        "Estas plataformas serão usadas automaticamente ao adicionar novos jogos que suportam estas plataformas.",
      editTitle: "Editar Plataforma Preferida",
      addTitle: "Adicionar Plataforma Preferida",
      updateSuccess: "Plataforma preferida atualizada com sucesso.",
      addSuccess: "Plataforma preferida adicionada com sucesso.",
      platformLabel: "Plataforma",
      labelField: "Rótulo",
      labelDescription:
        "Opcional. Isso ajuda você a identificar esta plataforma. Não afeta a funcionalidade. Visível apenas para você.",
      enabled: "Ativado",
    },
  },
  playtime: {
    titles: {
      playSessions: "Sessões de jogo",
      yourPlaySessions: "Suas sessões de jogo",
      submitPlaySession: "Enviar sessão de jogo",
    },
    labels: {
      platform: "Plataforma",
      source: "Origem",
      totalPlaytime: "Tempo total de jogo",
      lastPlayedDate: "Última data jogada",
    },
    descriptions: {
      totalPlaytime: "Tempo total de jogo (em minutos)",
      lastPlayedDate:
        "Esta é a última vez que você jogou este jogo. Isso é opcional.",
    },
    platforms: {
      steam: "Steam",
      psn: "PSN",
      epicGames: "EpicGames",
      gog: "GOG",
      battleNet: "Battle.net",
      nintendoWii: "Nintendo Wii",
      nintendoWiiU: "Nintendo Wii U",
      nintendoSwitch: "Nintendo Switch",
      emulator: "Emulador",
      xbox: "Xbox",
    },
    validation: {
      numberRequired: "O tempo total de jogo deve ser um número.",
      playtimeRequired: "O tempo total de jogo deve ser fornecido.",
      platformRequired: "Uma plataforma deve ser selecionada.",
    },
    messages: {
      sessionRecorded: "Sessão de jogo registrada com sucesso",
    },
    hints: {
      profileStats:
        "Suas informações de tempo de jogo nos ajudam a montar estatísticas do seu perfil, retrospectiva e mais.",
      autoImport:
        "Recomendamos configurar suas conexões para importar automaticamente seus dados de tempo de jogo. Esses dados podem ser sobrescritos se encontrarmos dados deste jogo em uma das suas conexões.",
      noPlaySessions:
        "Nenhuma sessão de jogo encontrada para este jogo. Você pode configurar uma conexão ou adicionar manualmente seu tempo de jogo.",
    },
    buttons: {
      addSession: "Adicionar sessão",
    },
  },
  library: {
    buttons: {
      importGames: "Importar jogos",
    },
    placeholders: {
      selectCollection: "Selecione uma coleção",
    },
    sorts: {
      addedDate: "Data de Adição",
      releaseDate: "Data de Lançamento",
      userOrder: "Ordem do Usuário",
    },
    labels: {
      showDLCs: "Mostrar DLCs/Extras",
    },
  },
  importer: {
    title: "IMPORTADOR DE JOGOS",
    description:
      "Selecione um ou múltiplos jogos que você deseja trazer para sua biblioteca GameNode.",
    titlePrimary: "IMPORTADOR",
    titleAccent: "DE JOGOS",
    collectionsHint:
      "Opcional. Selecione coleções para adicionar os jogos importados.",
    noItemsAvailable:
      "Nenhum item disponível para importação. Verifique se sua biblioteca na plataforma de destino está configurada como pública.",
    buttons: {
      import: "Importar",
    },
    messages: {
      overview:
        "O sistema de importacao ajuda voce a trazer jogos de outras plataformas para o GameNode.",
      noConnectionsPrefix:
        "Parece que voce nao tem nenhuma conexao configurada para importar.",
      clickHere: "Clique aqui",
      noConnectionsSuffix: "para configurar uma.",
      itemExcluded: "Item já na sua biblioteca excluído com sucesso.",
      applyingChanges: "Aplicando alterações...",
      importSuccess: "{{count}} jogos importados com sucesso!",
      selectAtLeastOne: "Selecione pelo menos um jogo.",
      invalidExternalGame:
        "Erro ao inserir jogo. ID de jogo externo inválido. Por favor, contate o suporte.",
      syncFailed: "Falha ao sincronizar alterações!",
    },
  },
  achievements: {
    titles: {
      redeemCode: "Resgatar conquista com um código",
    },
    labels: {
      code: "Seu código de conquista",
    },
    descriptions: {
      codeFormat: "Pode conter letras e números",
    },
    buttons: {
      redeem: "Resgatar",
    },
    messages: {
      redeemed: "Código resgatado com sucesso. Aproveite!",
    },
    validation: {
      codeRequired: "Um código de conquista deve ser informado!",
    },
  },
  awards: {
    title: "PRÊMIOS",
    subtitle:
      "Os indicados do The Game Awards e da comunidade GameNode em um só lugar",
    voteNow: "Vote agora",
    participationReward: "Ganhe 1000XP e uma medalha por participar!",
    categoriesCount: "{{count}} Categorias",
    votedByPublic: "Votado pelo público",
    resultsDate: "Resultados {{date}}",
    currentPhase: "Fase Atual",
    indicatedBy: "Indicado por",
    labels: {
      nominees: "Indicados",
      preview: "Pré-visualização",
      layout: "Layout",
      suggestionsFromEditors: "Sugestões dos nossos editores",
    },
    layouts: {
      compact: "Compacto",
      large: "Grande",
    },
    phases: {
      startingSoon: "Começando em Breve",
      countingVotes: "Contagem de Votos",
      eventEnded: "Evento Encerrado",
      voting: "Votação",
    },
    phaseMessages: {
      votingStartsIn: "Votação começa em {{time}}",
      votingEnded: "Votação encerrada. Resultados sairão em {{time}}",
      resultsOut: "Os resultados saíram!",
      votingEndsIn: "Votação termina em {{time}}",
    },
    share: {
      title: "Compartilhe seus votos!",
      linkCopied: "Link Copiado!",
      shareWithLink: "Compartilhar com Link",
      shareWithImage: "Compartilhar com Imagem",
      scrollHint: "Role/deslize para ver a imagem completa.",
    },
    messages: {
      voteSubmitted: "Seu voto para {{category}} foi enviado!",
      votingIn:
        "Você está votando na categoria {{category}} para a edição {{edition}}.",
      excludingGames: "Excluindo {{count}} jogos não lançados em {{year}}.",
      tapToVote:
        "Toque em uma categoria para expandir e votar nos seus jogos favoritos.",
      recentVotedIn: "votou em",
      highlights:
        "Descubra seus destaques de {{year}}: horas jogadas, jogos favoritos, coleções criadas e conquistas épicas.",
    },
    buttons: {
      shareVotes: "Compartilhe seus votos!",
    },
    titles: {
      yourVotes: "Seus votos",
      recentVotes: "Votos recentes",
    },
  },
  reports: {
    labels: {
      category: "Categoria da denúncia",
      reason: "Motivo",
    },
    descriptions: {
      reason:
        "Opcional. Detalhes extras que podem nos ajudar a decidir se este conteúdo é prejudicial.",
      privacy:
        "Não se preocupe, o usuário denunciado nunca saberá que você o denunciou.",
    },
    buttons: {
      submit: "Enviar denúncia",
    },
    messages: {
      error:
        "Erro ao enviar sua denúncia. Por favor, tente novamente. Se isso persistir, contate o suporte.",
      success:
        "Obrigado por enviar sua denúncia! Ela será revisada por nossos moderadores o mais breve possível.",
      contentDeleted: "O conteúdo denunciado pode ter sido excluído.",
      alert:
        "Uma das suas postagens vai contra as regras de conduta do GameNode. Isso inclui conteudo discriminatorio, ataques diretos ou pessoais a outros usuarios, ou qualquer tipo de mau comportamento repetido.",
      suspend:
        "Voce foi suspenso por 14 dias porque uma das suas postagens vai contra as regras de conduta do GameNode. Isso inclui conteudo discriminatorio, ataques diretos ou pessoais a outros usuarios, ou qualquer tipo de mau comportamento repetido. Voce esta proibido de criar ou editar postagens. Voce ainda pode acessar e gerenciar sua biblioteca.",
      ban: "Voce foi banido permanentemente porque uma das suas postagens vai contra as regras de conduta do GameNode. Isso inclui conteudo discriminatorio, ataques diretos ou pessoais a outros usuarios, ou qualquer tipo de mau comportamento repetido. Voce esta proibido de criar ou editar postagens. Voce ainda pode acessar e gerenciar sua biblioteca.",
      appeal:
        "Se voce acha que isso e um erro, fale conosco pelo nosso Discord.",
    },
  },
  blog: {
    recentPosts: "Postagens recentes do blog",
    recentReviews: "Avaliações recentes",
    disclaimer:
      "Nossas postagens do blog são publicadas por colaboradores independentes como forma de dar visibilidade aos grandes escritores e editores da nossa comunidade. Você também pode escrever para nós se tiver interesse!",
    contentNotice:
      "Sendo assim, estas postagens do blog podem não compartilhar ou refletir os ideais, visão ou opiniões da equipe principal do GameNode. O conteúdo é de responsabilidade do autor da postagem. Por favor, contate nossa equipe pelo Discord se notar algum problema.",
    nav: {
      home: "Início",
      archive: "Arquivo",
      news: "Notícias",
      reviews: "Avaliações",
      articles: "Artigos",
      gameNode: "GameNode",
    },
    labels: {
      draft: "Rascunho",
      reviewedGame: "Jogo avaliado",
      tags: "Tags",
    },
    list: {
      title: "Postagens do blog",
      taggedTitle: "Postagens do blog para {{tag}}",
      empty:
        "Nenhuma postagem corresponde a este criterio. Altere os parametros ou",
    },
    buttons: {
      seeMore: "Ver mais",
    },
    messages: {
      postDeleted: "Postagem excluída com sucesso!",
    },
  },
  posts: {
    titles: {
      confirmRemove: "Confirmar remoção da postagem",
    },
    messages: {
      published: "Postagem publicada com sucesso!",
      removeWarning:
        "Esta postagem será excluída permanentemente. Você não pode desfazer esta ação.",
    },
  },
  recap: {
    title: "RETROSPECTIVA",
    labels: {
      topGenresStyles: "Gêneros e estilos mais jogados",
      playedGames: "Jogos Jogados",
      hoursPlayed: "Horas Jogadas",
      preview: "Pré-visualização",
      period: "Período",
    },
    overview: {
      description:
        "Confira seus destaques de {{year}}: horas jogadas, jogos favoritos, coleções criadas e conquistas épicas.",
    },
    buttons: {
      create: "Criar minha retrospectiva",
      availableSoon: "Disponível em breve",
    },
    periods: {
      week: "Semana",
      month: "Mês",
      year: "Ano",
    },
    stats: {
      heading: "Neste ano no GameNode voce...",
      graphsTitle: "Graficos e mais graficos",
      thanks: "Obrigado por escolher a gente este ano.",
      addedGames: "jogos adicionados",
      reviewsMade: "reviews feitas",
      collectionsCreated: "colecoes criadas",
      followersGained: "seguidores ganhos",
      likesGiven: "curtidas dadas",
      dataNote:
        "Baseado em dados recebidos de plataformas conectadas e datas de jogado/concluído/abandonado em itens da biblioteca.",
      dataNotePlatforms:
        "Baseado em dados recebidos de plataformas conectadas.",
      thisIs: "Isso é",
      minutes: "{{count}} minutos",
      days: "{{count}} dias",
      weeks: "{{count}} semanas",
      months: "{{count}} meses",
    },
    share: {
      linkCopied: "Link copiado para a área de transferência",
      sharePrompt: "Compartilhe sua retrospectiva com seus amigos!",
    },
    messages: {
      dataNote: "Baseado em dados recebidos de plataformas conectadas.",
      generating:
        "Sua retrospectiva está sendo gerada. Volte amanhã para conferir!",
    },
  },
  upload: {
    labels: {
      maxFiles: "Máx. de arquivos: {{max}}",
      maxSize: "Tamanho máx: {{size}}MB",
    },
    messages: {
      invalidImageSource: "Fonte de imagem invalida",
    },
    dragPrompt: "Arraste imagens aqui ou clique para selecionar arquivos",
  },
  user: {
    labels: {
      level: "Nível {{level}}",
      xp: "{{exp}} / {{cost}} XP",
    },
  },
  journal: {
    loading: "Carregando Diário...",
    achievements: {
      loading: "Carregando conquistas...",
      description:
        "Esta seção do diário é dedicada a exibir as conquistas que você obteve nos jogos que joga. É uma forma de celebrar seus marcos de jogo e compartilhar suas realizações com a comunidade.",
      autoUpdate:
        "Estas informações são atualizadas automaticamente de forma periódica* a partir das plataformas de jogos que você conecta ao seu perfil GameNode, como Steam, Xbox e PlayStation.",
      updateNote:
        "*A frequência de atualização pode variar com base na plataforma e nas limitações de sua API.",
      tipLabel: "Dica: ",
      tipAction:
        "{{action}} as conquistas para mostrar detalhes. As conquistas mais recentes são mostradas primeiro.",
      tap: "Toque",
      hover: "Passe o mouse sobre",
      count: "{{count}} conquista{{suffix}}",
    },
    overview: {
      gamesCount: "{{count}} jogos",
    },
  },
  errors: {
    unexpected: "Ocorreu um erro inesperado ao carregar esta página",
    copiedToClipboard: "Detalhes do erro copiados para a área de transferência",
    pasteInstructions:
      "Agora você pode colar os detalhes do erro ao reportar o problema.",
    showDetails: "Mostrar detalhes",
    reportPrompt:
      "Por favor, nos informe sobre este erro enviando uma mensagem via",
    email: "e-mail",
    discord: "Discord",
    fetchFailed: "Falha ao buscar {{resource}}. Por favor, tente novamente.",
    pageNotFound: "A página que você está procurando não existe.",
    inDevelopment: "Esta página ainda está em desenvolvimento.",
    comeBackSoon: "Volte em breve!",
    oops: "Ops!",
    error404: "Erro 404",
  },
  explore: {
    metaTitle: "Explorar - GameNode",
    fetchError: "Erro ao buscar jogos. Por favor, recarregue esta pagina.",
    periods: {
      week: "Semana",
      month: "Mês",
      threeMonths: "3 meses",
      sixMonths: "6 meses",
      year: "Ano",
      allTime: "Todo o período",
    },
    filters: {
      themes: "Temas",
      genres: "Gêneros",
      platforms: "Plataformas",
      modes: "Modos",
      trendingIn: "Em alta em",
    },
    placeholders: {
      selectPeriod: "Selecionar período",
      loading: "Carregando...",
    },
  },
  follow: {
    titles: {
      followers: "Seguidores",
      following: "Seguindo",
    },
  },
  app: {
    title: "GameNode",
    metaDescription:
      "GameNode é a plataforma ideal para gerenciar sua coleção de jogos virtualmente.",
    betterInApp: "GameNode é (ainda) melhor no app!",
    openInApp: "Abrir no app",
  },
  mobile: {
    library: {
      collectionsTitle: "Suas colecoes",
      collectionsTitleFor: "Colecoes de {{username}}",
    },
    activity: {
      tip: "Dica: pressione e segure para ver as acoes.",
      loadingMore: "Carregando mais atividades...",
    },
    importer: {
      description:
        "O sistema de importacao ajuda voce a trazer jogos de outras plataformas para o GameNode.",
      noConnections:
        "Parece que voce nao tem nenhuma conexao configurada para importar.",
      clickHere: "Clique aqui",
      setUpOne: "para configurar uma.",
    },
    awards: {
      sharePrompt: "Estes são meus indicados do GameNode Awards!",
      shareCreate: "Crie o seu em https://gamenode.app",
      resultsTitle: "Resultados do Awards",
    },
    recap: {
      titleOwn: "Seu Recap de {{year}}",
      titleFor: "Recap de {{year}} para {{username}}",
    },
    preferences: {
      profile: "Perfil",
      editProfile: "Editar perfil",
      editProfileDetails: "Editar detalhes do perfil",
      misc: "Diversos",
      cacheClearedSuccess: "Cache limpo com sucesso!",
      clearLocalCache: "Limpar cache local",
      importerSystem: "Sistema de importação",
    },
    wrapped: {
      title: "Retrospectiva",
      sharePrompt: "Este é meu GameNode Wrapped!",
      shareDescription: "Compartilhe sua retrospectiva com amigos!",
      recentlyPlayed: "Jogos recentes",
      recap: "Retrospectiva {{year}}",
      weekly: "Wrapped Semanal",
      monthly: "Wrapped Mensal",
      yearly: "Wrapped Anual",
      labels: {
        period: "Período",
        gridStyle: "Estilo da grade",
        excludedGames: "Jogos excluídos",
        excludedGamesHint: "Eles não aparecerão na imagem gerada.",
        withRecentPlaytime: "Com tempo de jogo recente",
        withTotalPlaytime: "Com tempo de jogo total",
        withPlatform: "Com plataforma",
      },
      buttons: {
        generate: "Gerar",
      },
      messages: {
        noPlaytime:
          "Não encontramos informações de tempo de jogo para o período selecionado. Você pode alterar o período abaixo ou configurar uma conexão para começar a importar dados.",
      },
    },
    search: {
      startTyping: "Comece a digitar para ver resultados.",
      placeholder: "Buscar usuários ou jogos",
      noResults: "Sem resultados.",
      fetchFailed: "Falha ao buscar resultados.",
    },
  },
  shell: {
    search: {
      placeholder: "Buscar usuários ou jogos",
      noResults: "Sem resultados.",
      fetchFailed: "Falha ao buscar resultados.",
    },
  },
  legal: {
    tos: {
      title: "Termos de serviço",
      section1Title: "1. Termos",
      section1Content:
        "Ao acessar o site GameNode, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis, e concorda que é responsável pelo cumprimento de quaisquer leis locais aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas registradas aplicáveis.",
      section2Title: "2. Licença de Uso",
      section2Intro:
        "É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site da GameNode para visualização transitória pessoal e não comercial apenas. Esta é a concessão de uma licença, não uma transferência de título, e sob esta licença você não pode:",
      section2Item1: "modificar ou copiar os materiais;",
      section2Item2:
        "usar os materiais para qualquer finalidade comercial, ou para qualquer exibição pública (comercial ou não comercial);",
      section2Item3:
        "tentar descompilar ou fazer engenharia reversa de qualquer software contido no site GameNode;",
      section2Item4:
        "remover quaisquer direitos autorais ou outras notações proprietárias dos materiais; ou",
      section2Item5:
        "transferir os materiais para outra pessoa ou 'espelhar' os materiais em qualquer outro servidor.",
      section2Outro:
        "Esta licença será automaticamente terminada se você violar qualquer uma destas restrições e pode ser terminada pela GameNode a qualquer momento. Ao encerrar sua visualização destes materiais ou após o término desta licença, você deve destruir quaisquer materiais baixados em sua posse, seja em formato eletrônico ou impresso.",
      section3Title: "3. Isenção de Responsabilidade",
      section3Content:
        "Os materiais no site da GameNode são fornecidos 'como estão'. GameNode não oferece garantias, expressas ou implícitas, e por meio deste se isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a uma finalidade específica ou não violação de propriedade intelectual ou outra violação de direitos.",
      section3Content2:
        "Além disso, a GameNode não garante nem faz quaisquer representações relativas à precisão, resultados prováveis ou confiabilidade do uso dos materiais em seu site ou de outra forma relacionados a tais materiais ou em quaisquer sites vinculados a este site.",
      section4Title: "4. Limitações",
      section4Content:
        "Em nenhum caso a GameNode ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro, ou devido à interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais no site da GameNode, mesmo que a GameNode ou um representante autorizado da GameNode tenha sido notificado oralmente ou por escrito da possibilidade de tais danos. Como algumas jurisdições não permitem limitações em garantias implícitas, ou limitações de responsabilidade por danos consequentes ou incidentais, estas limitações podem não se aplicar a você.",
      section5Title: "5. Precisão dos materiais",
      section5Content:
        "Os materiais que aparecem no site da GameNode podem incluir erros técnicos, tipográficos ou fotográficos. GameNode não garante que qualquer um dos materiais em seu site seja preciso, completo ou atual. GameNode pode fazer alterações nos materiais contidos em seu site a qualquer momento sem aviso prévio. No entanto, GameNode não se compromete a atualizar os materiais.",
      section6Title: "6. Links",
      section6Content:
        "A GameNode não revisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de qualquer site vinculado. A inclusão de qualquer link não implica endosso pela GameNode do site. O uso de qualquer site vinculado é por conta e risco do usuário.",
      section7Title: "7. Modificações",
      section7Content:
        "A GameNode pode revisar estes termos de serviço para seu site a qualquer momento sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual destes termos de serviço.",
      section8Title: "8. Lei Aplicável",
      section8Content:
        "Estes termos e condições são regidos e interpretados de acordo com as leis do Brasil e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais daquele Estado, País ou localidade.",
    },
    privacy: {
      title: "Política de Privacidade",
      intro:
        "Sua privacidade é importante para nós. É política da GameNode respeitar sua privacidade em relação a qualquer informação que possamos coletar de você em nosso site, GameNode, e outros sites que possuímos e operamos. Só pedimos informações pessoais quando realmente precisamos delas para fornecer um serviço a você. Coletamos de forma justa e legal, com seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado. Só retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Os dados que armazenamos, protegeremos dentro de meios comercialmente aceitáveis para evitar perda e roubo, bem como acesso não autorizado, divulgação, cópia, uso ou modificação. Não compartilhamos nenhuma informação de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei. Nosso site pode ter links para sites externos que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não podemos aceitar responsabilidade por suas respectivas políticas de privacidade. Você é livre para recusar nossa solicitação de informações pessoais, com o entendimento de que podemos não conseguir fornecer alguns dos serviços desejados. Seu uso continuado de nosso site será considerado como aceitação de nossas práticas em torno de privacidade e informações pessoais. Se você tiver alguma dúvida sobre como lidamos com dados de usuário e informações pessoais, sinta-se à vontade para nos contatar.",
      contactTitle: "Contato",
      contactText:
        "Você pode entrar em contato conosco a qualquer momento usando nosso e-mail:",
      contactEmail: "support@gamenode.app",
      cookieTitle: "Política de Cookies do GameNode",
      cookieIntro:
        "Esta é a Política de Cookies do GameNode, acessível a partir da URL https://gamenode.app.",
      whatAreCookiesTitle: "O que são Cookies",
      whatAreCookiesContent:
        "Como é prática comum em quase todos os sites profissionais, este site usa cookies, que são pequenos arquivos baixados para o seu computador, para melhorar sua experiência. Esta página descreve quais informações eles coletam, como as usamos e por que às vezes precisamos armazenar esses cookies. Também compartilharemos como você pode impedir que esses cookies sejam armazenados, porém isso pode desativar ou 'quebrar' certos elementos da funcionalidade do site.",
      howWeUseTitle: "Como Usamos os Cookies",
      howWeUseContent:
        "Usamos cookies por vários motivos detalhados abaixo. Infelizmente, na maioria dos casos, não há opções padrão do setor para desabilitar os cookies sem desabilitar completamente a funcionalidade e os recursos que eles adicionam a este site. Recomenda-se que você deixe todos os cookies se não tiver certeza se precisa deles ou não, caso sejam usados para fornecer um serviço que você usa.",
      disablingTitle: "Desabilitando Cookies",
      disablingContent:
        "Você pode impedir a configuração de cookies ajustando as configurações do seu navegador (consulte a Ajuda do seu navegador para saber como fazer isso). Esteja ciente de que desabilitar os cookies afetará a funcionalidade deste e de muitos outros sites que você visita. Desabilitar os cookies geralmente resultará também na desabilitação de certas funcionalidades e recursos deste site. Portanto, recomenda-se que você não desabilite os cookies.",
      thirdPartyTitle: "Cookies de Terceiros",
      thirdPartyContent:
        "Em alguns casos especiais, também usamos cookies fornecidos por terceiros confiáveis. A seção a seguir detalha quais cookies de terceiros você pode encontrar através deste site.",
      cloudflareIntro: "Nosso site e conteúdo são servidos e protegidos pela",
      cloudflare: "Cloudflare",
      cloudflareContent:
        ". Dessa forma, este provedor terceiro pode injetar alguns cookies de terceiros para analisar suas visitas em nosso site. Para evitar isso, desabilite os cookies em seu navegador ou use alguma forma de proteção contra rastreamento.",
      cloudflarePrivacy: "Você pode ler o aviso de privacidade da Cloudflare",
      here: "aqui",
      cookiesWeSetTitle: "Os cookies que definimos",
      weUse: "Usamos",
      posthog: "Posthog",
      posthogContent:
        " para análises de produto e web. Isso significa que o Javascript do Posthog é injetado neste site e usado para coletar informações sobre suas páginas visitadas, padrões de uso, etc. Nunca vendemos esses dados. Eles são usados exclusivamente para melhorar nosso serviço.",
      posthogPrivacy: "Você pode ler o aviso de privacidade do Posthog",
      matomoNote:
        "Anteriormente, usávamos o Matomo como nossa ferramenta de análise preferida. Descontinuamos este serviço devido ao custo de manutenção de manter nossa própria instância.",
      consentTitle: "Consentimento",
      consentContent:
        "Por favor, tenha em mente que ao usar nosso site e serviços você concorda com nossa política de privacidade e termos de serviço.",
      dataRemoval:
        "Se você deseja parar de usar nossos serviços e ter seus dados removidos do nosso lado (ou seja, dados que realmente temos acesso e controle), sinta-se à vontade para nos contatar.",
    },
  },
};
