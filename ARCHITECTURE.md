# Arquitetura do Projeto: Codex

O **Codex** é uma plataforma focada em fornecer infraestrutura rica e utilitários para artistas, beatmakers e produtores. Ele serve como uma biblioteca para gerenciar kits, plugins VST e samples, e agora também encapsula uma poderosa "Capture Engine" (motor de download).

Recentemente, o projeto passou por uma grande migração: mudou de **Electron para Tauri v2**, recebendo melhorias massivas em performance, redução no tamanho final do pacote e maior estabilidade com operações nativas em Rust.

---

## 🛠️ Stack Tecnológica

### Frontend (User Interface)
* **Framework Core:** React 19 + TypeScript + Vite 6
* **Estilização:** Tailwind CSS v4 (Design system Premium Dark / Glassmorphism)
* **Animações e Micro-interações:** Framer Motion 12
* **Gerenciamento de Estado:** Zustand 5 (`src/stores/`)
* **Roteamento:** React Router v7 (`react-router-dom`)
* **Renderização Markdown:** `react-markdown` integrado nas páginas de detalhe para rich-text e tabelas (`ItemDetailPage`)
* **Busca Local:** Fuse.js (Fuzzy search integrado no `TitleBar`)

### Backend / Core Nativo (Tauri & Rust)
* **Framework:** Tauri v2 (`@tauri-apps/api`, `@tauri-apps/cli`)
* **Linguagem Backend:** Rust
* **Funcionalidades Nativas (IPC Handlers `src-tauri/src/main.rs`):**
  * **Yt-Dlp & FFmpeg:** Downloads de vídeo/áudio, extração de assets e formatação estruturada de metadados (`ytdlp.rs`).
  * **Autenticação:** Login nativo pelo navegador acoplado com o Discord OAuth (`auth.rs`).
  * **Discord Rich Presence (RPC):** Integração automática de status no Discord, indicando uso ativo do aplicativo (`discord_rpc.rs`).
* **Plugins Tauri:** `plugin-shell` (executar binários), `plugin-dialog` (salvar arquivos).

### Serviços Externos
* **Banco de Dados & Autenticação Server-side:** Supabase (PostgreSQL para perfis, items da biblioteca, etc.).
* **Integração Auth:** Discord OAuth 2.0.

---

## 📂 Estrutura de Diretórios e O que Fazem

A base do código foi consolidada em dois universos principais que se comunicam via RPC (Remote Procedure Call) nativo do Tauri.

```
codex/
├── src-tauri/               # Backend Rust e Configuração Tauri
│   ├── Cargo.toml           # Dependências do Rust
│   ├── tauri.conf.json      # Configuração global da janela, CSP e build de UI
│   └── src/
│       ├── main.rs          # Entrada do app; registra IPC Hooks e inicia o Discord RPC
│       ├── ytdlp.rs         # Motor de Captura: instala ffmpeg/yt-dlp e gere os downloads
│       ├── auth.rs          # Processamento via URI customizada/popup para Discord Login
│       └── discord_rpc.rs   # Processo em Background para Discord Rich Presence
├── src/                     # React / Frontend
│   ├── App.tsx              # Roteador central (Splash, Auth, Protected Routes)
│   ├── main.tsx             # Entrypoint do React
│   ├── components/          # Componentes visuais
│   │   ├── SplashScreen.tsx # Tela de carregamento/bootstrapping (logo animada, status)
│   │   ├── TitleBar.tsx     # Barra de título nativa com busca de comando embutida
│   │   └── ProtectedRoute.tsx # Route Wrapper para barrar não autenticados
│   ├── pages/               # Views principais da UI
│   │   ├── LoginPage.tsx    # Tela de Entrada Auth Discord
│   │   ├── LibraryPage.tsx  # Navegação de VSTs, Kits, etc. (Cards)
│   │   ├── ItemDetailPage.tsx # Render de Markdown e downloads de biblioteca
│   │   ├── DownloaderPage.tsx # UX do Capture Engine (Vídeo -> Áudio, logs)
│   │   ├── ProfilePage.tsx  # Dados e progresso do perfil do usuário
│   │   └── AdminPage.tsx    # Interface de criação de novos itens no Supabase
│   ├── hooks/               # React hooks p/ regra de negócio genérica (ex: useAuth)
│   ├── stores/              # Actions e State do Zustand (ex: authStore, searchStore)
│   ├── lib/                 # Utilitários (ex: api.ts, fetchers do Supabase/Discord)
│   └── styles/              # CSS base e tokens do Tailwind CSS
```

---

## 🧭 Visão Geral das Camadas do App

### 1. Sistema de Autenticação
O `App.tsx` lida com o estado. O usuário deslogado cai na `LoginPage`. Clicar em "Entrar com Discord" chama o backend Rust (`auth::discord_login`) que lida com o fluxo de autenticação e redirecionamento, comunicando o Token para a UI do front-end armazenar o perfil via Supabase. O wrapper `ProtectedRoute` barra acessos ao app raiz.

### 2. Biblioteca e Renderização Modular (`Library` & `ItemDetail`)
A página `LibraryPage` exibe tudo no Supabase. Quando um item é escolhido, a interface passa para a `ItemDetailPage`. Esta foi altamente refinada e adaptada para suportar `react-markdown` moderno (já que antes existia um parser manual ou renderizadores quebrados), o que permite criar tutorias ricos (bold, tabelas, blocos de código formatados) nativos dentro do app para os criadores de música.

### 3. Capture Engine (`DownloaderPage`)
Antigamente um *script Python* falho de linha de comando, promovido para o App: 
É focado na experiência de extração de Samples/Beats de vídeos e faixas inteiras de mídias online.
O Backend Rust (`ytdlp.rs`) resolve os binários `yt-dlp` e `ffmpeg` ocultamente sem o usuário perceber. O frontend (`DownloaderPage`) implementa um "wizard" passo-a-passo e interage com os métodos `tauri.invoke('download_video')`, reportando tudo suavemente enquanto converte.

### 4. Integração Persistente (Discord RPC)
Configurado no bootstrap Rust (em `setup()`), ele cria um cliente em background que mostra o Discord status `"Jogando Codex"` e um convite para o servidor, funcionando ininterruptamente enquanto o Rust estiver de pé.

---

## 🎨 Sistema de Design & UI
Conforme especificado pelo `DESIGN.md` e os arquivos dentro de `src/styles/`:
* A paleta de cor adota pretos marcantes (`#060608`) e aros Indigo. 
* Ele esconde o frame padrão do sistema operacional ("Decorations", em `tauri.conf.json`) e usa uma Janela Customizada (`TitleBar.tsx` no React) que permite mover a janela.
* O uso extensivo do Framer Motion (`AnimatePresence`) assegura que navegações entre rotas (`/library` para `/profile`) ou modais de pesquisa não cortem de vez, mas esmaeçam perfeitamente.
