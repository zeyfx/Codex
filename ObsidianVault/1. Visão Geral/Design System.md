# Design System

A linguagem visual do Codex foca no público artista/produtor com a estética **Premium Dark / Glassmorphism**.

## Tokens 🎨
- Fundo Primário: `#060608`
- Fundo Secundário: `#0a0a0c`
- Acento Main: `Indigo-500` / `#6366f1`
- Acento Capture Engine: `Red-500` / `#ef4444`
- Glassmorphism: `white/[0.05] + backdrop-blur-3xl`
- Fontes: Manrope / Inter

## Padrões Globais
* **Transições:** Uso extensivo do `AnimatePresence` do framer-motion (opacidade com leve y blur de `5px`).
* **Bordas:** Evita-se preto e branco puros, utilizando bordas translúcidas (`white/5`).
* **Interações:** Botões e cards utilizam zoom reverso pequeno (`active:scale-[0.98]`).

## Estrutura da Janela
A janela nativa possui o decorador oculto (`decorations: false` no Tauri). A TitleBar.tsx do frontend implementa captura de clique-arraste na janela e uma "Command Palette" flexível chamada com `Ctrl+P`.
