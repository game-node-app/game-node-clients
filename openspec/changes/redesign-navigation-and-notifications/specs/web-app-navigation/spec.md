# Spec Delta

## Purpose

Define a navegação autenticada do app web do GameNode: Dock lateral com destinos agrupados, Topbar com busca e notificações, e menu da conta. O objetivo é dar acesso a todas as áreas do produto em qualquer largura de tela.

## ADDED Requirements

### Requirement: Composição do shell autenticado
Nas rotas que usam o shell global, o web SHALL exibir uma Topbar no topo e um Dock lateral à esquerda, ambos como painéis com fundo `#111111`, raio de 8 px e o conteúdo da página ao lado do Dock. Rotas fora do shell (`/`, `/about`, `/awards`, `/auth`, `/oauth/consent`) SHALL continuar sem Topbar e sem Dock.

#### Scenario: Página autenticada em desktop
- **WHEN** um usuário abre `/explore` em uma janela de 1440 px
- **THEN** vê a Topbar com 56 px de altura no topo e o Dock aberto de 248 px à esquerda, abaixo da Topbar
- **AND** o conteúdo da página ocupa o espaço restante sem ficar sob o Dock

#### Scenario: Rota fora do shell
- **WHEN** qualquer pessoa abre `/` ou `/auth`
- **THEN** a página aparece sem Topbar e sem Dock

### Requirement: Destinos do Dock
O Dock SHALL listar, em ordem, o grupo "Descobrir" (Início, Explorar, Daily Nodes, GameNode + IA, Atividade, Blog), o grupo "Seu espaço" (Perfil, Biblioteca, Coleções, Diário, Conquistas, Feitos, Wrapped) e, no rodapé, Premium e o bloco da conta. Cada item SHALL levar ao destino atual equivalente do produto.

#### Scenario: Navegação por item
- **WHEN** o usuário aciona Início, Explorar, Daily Nodes, GameNode + IA, Atividade, Blog, Biblioteca, Conquistas ou Feitos
- **THEN** o app navega para `/home`, `/explore`, `/daily`, `/mcp`, `/activity`, `/blog`, `/library`, `/achievements` ou `/feats`, respectivamente

#### Scenario: Itens do perfil
- **WHEN** o usuário aciona Perfil, Coleções ou Diário
- **THEN** o app abre o perfil do próprio usuário na aba principal, `collections` ou `journal`, respectivamente

#### Scenario: Ações que não são rotas
- **WHEN** o usuário aciona Wrapped ou Premium
- **THEN** Wrapped abre o compartilhamento de jogos jogados recentemente e Premium abre o modal de configurações na aba `premium`, sem trocar de rota

### Requirement: Estados visuais dos itens do Dock
Cada item do Dock SHALL mostrar o estado Default (rótulo `#ADADAD`), Hover (fundo `#222222`, rótulo branco), Active (fundo `#222222`, rótulo branco em semibold) quando corresponde à página atual, e Focus (contorno `#F15025` de 2 px) quando recebe foco por teclado.

#### Scenario: Item da página atual
- **WHEN** o usuário está em `/explore`
- **THEN** apenas o item Explorar aparece no estado Active e expõe `aria-current="page"`

#### Scenario: Foco por teclado
- **WHEN** o usuário navega pelo Dock com Tab
- **THEN** o item focado mostra o contorno de foco laranja e pode ser acionado com Enter

### Requirement: Indicador de novidade
Itens marcados como novos (Daily Nodes e GameNode + IA) SHALL mostrar a pill "Novo" quando o Dock está aberto e um ponto laranja de 8 px no canto do ícone quando está recolhido.

#### Scenario: Novidade com Dock aberto
- **WHEN** o Dock está aberto
- **THEN** Daily Nodes e GameNode + IA mostram à direita a pill "Novo" em laranja sobre fundo laranja translúcido

#### Scenario: Novidade com Dock recolhido
- **WHEN** o Dock está recolhido
- **THEN** os mesmos itens mostram um ponto laranja sobre o ícone

### Requirement: Recolher e expandir o Dock
Em telas `md` ou maiores, o Dock SHALL alternar entre aberto (248 px, ícone e rótulo, títulos de grupo) e recolhido (72 px, só ícones, divisores no lugar dos títulos, tooltip com o rótulo no hover) pelo botão do cabeçalho, e SHALL lembrar a última escolha no mesmo navegador.

#### Scenario: Recolher
- **WHEN** o usuário aciona o botão de recolher (chevron para a esquerda) no Dock aberto
- **THEN** o Dock passa a 72 px, mostra só ícones e o botão vira um chevron para a direita
- **AND** o conteúdo da página ganha a largura liberada

#### Scenario: Tooltip no recolhido
- **WHEN** o Dock está recolhido e o ponteiro passa sobre um item
- **THEN** aparece um tooltip com o rótulo do item

#### Scenario: Preferência lembrada
- **WHEN** o usuário recolhe o Dock e recarrega a página
- **THEN** o Dock continua recolhido

### Requirement: Dock em telas pequenas
Abaixo de `md`, o Dock SHALL ficar oculto por padrão e abrir como gaveta aberta (com rótulos) por um botão de menu na Topbar, fechando ao navegar ou ao tocar fora dela.

#### Scenario: Abrir gaveta
- **WHEN** o usuário, em 390 px, aciona o botão de menu da Topbar
- **THEN** o Dock aparece aberto sobre o conteúdo

#### Scenario: Fechar ao navegar
- **WHEN** a gaveta está aberta e o usuário aciona um item
- **THEN** o app navega e a gaveta fecha

### Requirement: Topbar
A Topbar SHALL mostrar o logo do GameNode à esquerda, que leva a `/home`. Para usuários autenticados, SHALL mostrar à direita o botão de busca e o sino de notificações. Para visitantes, SHALL mostrar "Entrar" no lugar desses botões.

#### Scenario: Usuário autenticado
- **WHEN** um usuário autenticado vê a Topbar
- **THEN** vê o logo, a lupa de busca e o sino

#### Scenario: Visitante
- **WHEN** um visitante vê a Topbar
- **THEN** vê o logo e o botão "Entrar", que leva a `/auth`

### Requirement: Busca global pela Topbar
A busca da Topbar SHALL aparecer recolhida (só a lupa, 40 × 40 px) e abrir a busca global existente ao ser acionada ou com o atalho Ctrl K (⌘ K no macOS).

#### Scenario: Abrir pela lupa
- **WHEN** o usuário aciona a lupa
- **THEN** a busca global abre com foco no campo de texto

#### Scenario: Atalho de teclado
- **WHEN** o usuário pressiona Ctrl K em qualquer página do shell
- **THEN** a busca global abre

### Requirement: Sino de notificações com contador
O sino da Topbar SHALL mostrar uma badge laranja com o número de notificações não lidas quando houver alguma, e nenhuma badge quando não houver. Acioná-lo SHALL abrir o popover de notificações.

#### Scenario: Há não lidas
- **WHEN** a inbox informa 3 notificações não lidas
- **THEN** o sino mostra a badge "3" no canto superior direito
- **AND** o nome acessível do botão inclui a contagem

#### Scenario: Contagem alta
- **WHEN** a inbox informa mais de 99 não lidas
- **THEN** a badge mostra "99+"

#### Scenario: Sem não lidas
- **WHEN** a inbox informa zero não lidas
- **THEN** o sino aparece sem badge

### Requirement: Bloco da conta no Dock
O rodapé do Dock SHALL mostrar o avatar do usuário (32 px), o nome de usuário e a legenda "Minha conta". Quando o Dock está recolhido, SHALL mostrar só o avatar. Acioná-lo SHALL abrir o menu da conta e mostrar o estado Open (fundo `#222222` com borda `#2A2A2A`) enquanto o menu estiver aberto.

#### Scenario: Abrir menu da conta
- **WHEN** o usuário aciona o bloco da conta
- **THEN** o menu da conta abre ao lado do bloco, alinhado pela base
- **AND** o bloco fica no estado Open até o menu fechar

### Requirement: Itens do menu da conta
O menu da conta SHALL mostrar um cabeçalho com avatar, nome e "Ver perfil", que leva ao perfil do usuário. Depois SHALL listar Configurações, Temas e Downloads, um divisor, e Sair em tom de perigo (`#DDA4A4`).

#### Scenario: Ações do menu
- **WHEN** o usuário aciona Configurações, Temas, Downloads ou Sair
- **THEN** Configurações abre o modal de configurações na aba `profile`, Temas abre na aba `appearance`, Downloads abre a página de download do app em nova aba, e Sair leva a `/auth/logout`
- **AND** o menu fecha

#### Scenario: Teclado
- **WHEN** o menu está aberto e o usuário usa as setas e Esc
- **THEN** o foco percorre os itens e Esc fecha o menu, devolvendo o foco ao bloco da conta
