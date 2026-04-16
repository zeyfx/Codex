# Arquitetura

O **Codex** migrou de **Electron para Tauri v2** ganhando performance e operações nativas em Rust.

## Divisão do Projeto

O app possui duas grandes partes:

1. **Frontend (`src/`)**
   - **`App.tsx`**: Roteador raiz e verificação de rotas (SplashScreen, Protected Routes).
   - Componentes chave: `TitleBar.tsx` (busca fuzzy e controles de janela nativos customizados).
   - Páginas: `LoginPage`, `LibraryPage`, `ItemDetailPage`, `DownloaderPage`, `ProfilePage`, `AdminPage`.
   - Estado: `Zustand` em `src/stores/`.
   - UI base: renderização raw de Markdown via `react-markdown`.

2. **Backend Nativo Tauri (`src-tauri/`)**
   - **`main.rs`**: Setup central do Tauri, registrando comandos IPC.
   - **`auth.rs`**: Controlador do login do Discord, lida com redirects.
   - **`discord_rpc.rs`**: Processo de background em thread paralela para mostrar status "Jogando Codex" no Discord.
   - **`ytdlp.rs`**: Motor de captura abstraindo binários (ffmpeg e yt-dlp) sem interferir na UI.
