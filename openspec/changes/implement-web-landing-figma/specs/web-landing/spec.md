# Spec Delta

## Purpose

Apresentar o GameNode a visitantes com uma landing pública responsiva que explica o produto e oferece navegação para entrada, conteúdo e apoio ao projeto.

## ADDED Requirements

### Requirement: Apresentação visual completa
A landing SHALL reproduzir a composição e identidade visual do frame Figma `3994:4538`, incluindo cabeçalho, hero, funcionalidades, conexões, Premium e rodapé.

#### Scenario: Visita desktop
- **WHEN** um visitante abre `/` em largura de 1440 pixels
- **THEN** vê hero com CTA e mockups desktop/mobile, cinco cards, diagrama das seis plataformas, oferta Premium e rodapé na ordem do design
- **THEN** textos pt-BR, cores, imagens, tipografia, proporções e espaçamentos correspondem à referência

### Requirement: Navegação funcional
A landing SHALL oferecer destinos reais em links e CTAs, usando rotas existentes, âncoras e canais oficiais existentes, sem controles que apenas aparentem funcionar.

#### Scenario: Entrada
- **WHEN** o visitante aciona Entrar ou Comece Gratuitamente
- **THEN** acessa `/home` pelo fluxo existente

#### Scenario: Navegação institucional
- **WHEN** o visitante usa Sobre, Blog, Privacidade, funcionalidades ou Premium
- **THEN** acessa `/about`, `/blog`, `/privacy` ou a seção correspondente, respectivamente

#### Scenario: Apoio e downloads
- **WHEN** o visitante aciona Assinar Premium ou Downloads
- **THEN** acessa o Patreon oficial existente ou a página Android existente na Google Play, respectivamente
- **THEN** a landing não inicia checkout próprio

### Requirement: Preservação de sessão
A rota `/` SHALL continuar encaminhando usuários autenticados para `/home` sem alterar a sessão existente.

#### Scenario: Usuário autenticado
- **WHEN** a sessão identifica um usuário autenticado em `/`
- **THEN** ele é encaminhado para `/home`

### Requirement: Responsividade e acessibilidade
A landing SHALL manter conteúdo legível e ações acessíveis por teclado em desktop e celular, com foco visível, títulos semânticos, nomes acessíveis e alternativas para imagens informativas.

#### Scenario: Celular
- **WHEN** a largura disponível é 375 pixels
- **THEN** cards, Premium e rodapé se reorganizam sem rolagem horizontal nem corte de texto
- **THEN** todas as ações do cabeçalho permanecem acessíveis e as imagens preservam proporções

#### Scenario: Teclado
- **WHEN** o visitante percorre os controles com Tab e os ativa pelo teclado
- **THEN** o foco fica visível e as ações funcionam

### Requirement: Idiomas existentes
A landing SHALL apresentar os novos textos em pt-BR e en conforme o idioma ativo, sem expor chaves de tradução.

#### Scenario: Idioma inglês
- **WHEN** o idioma ativo é en
- **THEN** títulos, descrições, navegação e CTAs aparecem em inglês sem truncamento

### Requirement: Assets persistentes
A landing SHALL carregar imagens estáticas de arquivos locais persistentes, preservando os assets e posições do design sem URLs temporárias do Figma.

#### Scenario: Links temporários expirados
- **WHEN** as URLs temporárias da consulta Figma expiram
- **THEN** mockups, logos, capas, avatares e ilustrações continuam disponíveis nos assets locais
