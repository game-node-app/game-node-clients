# Spec Delta

## Purpose

Apresentar o GameNode a visitantes e usuários na rota pública `/about` do cliente web: o que o produto faz, como o Premium mantém o projeto e como entrar, apoiar ou participar da comunidade.

## ADDED Requirements

### Requirement: Composição conforme o design
A página `/about` SHALL reproduzir as seções do frame Figma `5335:19115` na ordem do design: cabeçalho, hero, manifesto, índice de funcionalidades, biblioteca e coleções, diário/tempo para zerar/avaliações, conquistas/níveis/retrospectiva, atividades e explorar, conexões, GameNode + IA, Daily/Prêmios/Blog, app para celular, Premium, Mural Premium, promessa, CTA final e rodapé.

#### Scenario: Visita desktop
- **WHEN** um visitante abre `/about` em uma janela de 1440 px de largura
- **THEN** vê as 17 áreas na ordem do design, com textos, cores, tipografia, imagens, proporções e espaçamentos correspondentes ao frame `5335:19115`

#### Scenario: Fora do shell do app
- **WHEN** a página `/about` é renderizada
- **THEN** ela usa o cabeçalho e o rodapé próprios da página, sem a barra e o dock do `GlobalAppShell`

### Requirement: Layout responsivo
A página SHALL se adaptar à largura conforme o frame mobile `5337:19115`, empilhando colunas e grades em telas estreitas, sem rolagem horizontal e sem cortar textos.

#### Scenario: Visita mobile
- **WHEN** a página é aberta com 390 px de largura
- **THEN** as seções seguem o frame `5337:19115`: colunas viram uma única coluna, o índice de funcionalidades fica em uma coluna e o Mural Premium usa menos colunas
- **THEN** a página não rola horizontalmente

#### Scenario: Largura intermediária
- **WHEN** a página é aberta com 768 px de largura
- **THEN** nenhum conteúdo se sobrepõe nem ultrapassa a largura da tela

### Requirement: Textos traduzidos
Todos os textos visíveis e alternativos da página SHALL vir das traduções, com conteúdo em pt-BR igual ao design e equivalente em inglês.

#### Scenario: Idioma português
- **WHEN** o idioma ativo é pt-BR
- **THEN** os textos correspondem aos do design

#### Scenario: Idioma inglês
- **WHEN** o idioma ativo é en
- **THEN** todos os textos da página, incluindo os dos mockups, aparecem em inglês, sem chaves de tradução cruas

### Requirement: Mockups ilustrativos
As ilustrações de produto SHALL ser conteúdo estático: não fazem chamadas à API, não recebem foco e ficam ocultas para tecnologias assistivas quando o texto da seção já descreve o recurso. Mockups não SHALL conter controles que aparentem funcionar.

#### Scenario: Navegação por teclado
- **WHEN** um visitante navega a página com Tab
- **THEN** o foco passa apenas por links e botões reais, nunca por abas, chips, interruptores ou botões dos mockups

#### Scenario: Notas de exemplo
- **WHEN** o visitante vê o tempo para zerar, a retrospectiva ou o mural
- **THEN** as notas do design que indicam valores ilustrativos ou perfis de exemplo aparecem, adaptadas ao conteúdo real quando o dado é real

### Requirement: Índice de funcionalidades navegável
O índice "Tudo o que cabe no GameNode" SHALL listar as 16 funcionalidades do design, e cada item que tem seção correspondente na página SHALL levar a ela.

#### Scenario: Ir para uma seção
- **WHEN** o visitante aciona "Biblioteca" no índice
- **THEN** a página rola até a seção "Biblioteca e coleções"

#### Scenario: Âncora de funcionalidades
- **WHEN** o visitante abre `/about#features`
- **THEN** a página posiciona o índice de funcionalidades no topo

### Requirement: Destinos reais
Links e CTAs da página SHALL levar a destinos existentes: cadastro e entrada pelo fluxo atual, assinatura do Premium pelo fluxo de apoio atual, `/mcp`, `/daily`, `/blog`, Google Play, GitHub e Discord oficiais. Itens sem destino real SHALL aparecer como texto ou desabilitados.

#### Scenario: Criar conta
- **WHEN** um visitante sem sessão aciona "Criar minha conta grátis" ou "Cadastre-se"
- **THEN** entra no fluxo existente de cadastro/entrada

#### Scenario: Assinar o Premium
- **WHEN** o visitante aciona "Conhecer o Premium" na seção Premium ou "Assinar o Premium" no mural
- **THEN** segue para o destino de assinatura atual: configurações de apoio com sessão ou entrada com retorno para elas sem sessão

#### Scenario: Conectar assistente
- **WHEN** o visitante aciona "Conecte seu assistente"
- **THEN** abre `/mcp`

#### Scenario: App Store indisponível
- **WHEN** o visitante vê "Em breve na App Store"
- **THEN** o item aparece desabilitado e não navega

#### Scenario: Links externos
- **WHEN** o visitante aciona Google Play, "Ver no GitHub" ou "Entrar no Discord"
- **THEN** o destino oficial correspondente abre em uma nova aba

### Requirement: Cabeçalho com página ativa
O cabeçalho SHALL indicar "Sobre" como página atual na rota `/about`, com o sublinhado do design e semântica de página atual.

#### Scenario: Link ativo
- **WHEN** a página `/about` é exibida
- **THEN** o link "Sobre" aparece destacado e marcado como página atual, e os demais links não

### Requirement: Mural Premium com apoiadores reais
A seção Mural Premium SHALL listar os apoiadores públicos retornados pelo serviço atual, com avatar, nome de usuário, selo Premium e link para o perfil, seguidos de um card "Seu nome aqui" que leva à assinatura.

#### Scenario: Lista carregada
- **WHEN** o serviço retorna apoiadores
- **THEN** cada um aparece em um card no visual do design, na ordem do serviço, e o card "Seu nome aqui" fecha a grade

#### Scenario: Mais apoiadores
- **WHEN** o serviço informa que há uma próxima página
- **THEN** a seção oferece carregar mais apoiadores

#### Scenario: Carregando, vazio ou erro
- **WHEN** a lista ainda carrega, volta vazia ou falha
- **THEN** a seção mostra placeholders, o card "Seu nome aqui" ou uma mensagem com opção de tentar de novo, e o resto da página continua utilizável

### Requirement: Contador do Daily
O card GameNode Daily SHALL mostrar o tempo até o próximo Daily a partir do horário de reinício informado pelo serviço, atualizado a cada segundo, e SHALL omitir o contador quando esse horário não estiver disponível.

#### Scenario: Contador ativo
- **WHEN** o horário do próximo Daily está disponível
- **THEN** o card mostra "Próximo em HH:MM:SS" contando para baixo

#### Scenario: Sem horário
- **WHEN** a requisição do Daily ainda carrega ou falha
- **THEN** o card aparece sem o contador e sem erro visível

### Requirement: Assets locais
Imagens e ícones da página SHALL ser servidos pelo próprio cliente web, sem URLs temporárias do Figma, com dimensões declaradas para evitar deslocamento de layout.

#### Scenario: Assets carregados
- **WHEN** a página é carregada
- **THEN** todas as imagens vêm de arquivos locais do app web, nenhum asset falha e nenhuma imagem aparece distorcida
