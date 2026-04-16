# Capture Engine

A Capture Engine (`DownloaderPage.tsx` + `ytdlp.rs`) é uma poderosa infraestrutura para produtores resgatarem sons online. Anteriormente um script Python em terminal, ela foi portada nativamente para a plataforma Codex em uma interface rica.

## Funcionamento (Tauri/Rust)
A invocação `tauri.invoke('download_video')` é chamada pelas ações React, repassando as URLs de Youtube ou outras plataformas suportadas pelo **yt-dlp**.

- O backend gerencia silenciosamente as dependências binárias necessárias do `ffmpeg` em Windows, não poluindo o setup inicial do usuário. 
- Extrai áudio de alta perfomance lidando com progresso através de eventos (IPC) de forma assíncrona, não interferindo na fluidez da View (60fps).

## Wizard Interativo
A funcionalidade de tela se comporta em passos:
1. Input da mídia
2. Loading com Análise Remota
3. Qualidades e Formatos de Saída
4. Logs contínuos durante o download em terminal UI.
