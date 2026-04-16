# Sistema de Design Codex

Este documento detalha a linguagem visual, componentes core e estruturas de layout do aplicativo Codex.

## 1. Identidade Visual
O Codex utiliza uma estética **Premium Dark / Glassmorphism**, focada em artistas e produtores musicais. A interface é projetada para ser imersiva, utilizando profundidade e efeitos de desfoque (blur) para guiar o olhar do usuário.

### 🎨 Paleta de Cores (Tokens)
| Tipo | Hex / Utility | Uso |
| :--- | :--- | :--- |
| **Fundo Primário** | `#060608` | Background principal de todas as janelas. |
| **Fundo Secundário** | `#0a0a0c` | Sidebars e Modais. |
| **Acento (Main)** | `Indigo-500` / `#6366f1` | Ações principais, botões e foco. |
| **Acento (Capture)** | `Red-500` / `#ef4444` | Motor de captura e downloads. |
| **Bordas** | `white/[0.04]` / `white/[0.06]` | Separações sutis de componentes. |
| **Vidro (Glass)** | `white/[0.05]` + `Blur-3xl` | Painéis flutuantes e itens de lista. |

### 🔡 Tipografia
- **Font-Family**: `'Manrope'`, `'Inter'`, `system-ui`.
- **Pesos**: `400` (Regular), `700` (Bold), `900` (Black/Heavy).
- **Estilo de Títulos**: Geralmente em Maiúsculas (Uppercase) com `tracking-widest`.
- **Smoothing**: `-webkit-font-smoothing: antialiased`.

---

## 2. Componentes Globais

### 🏷️ TitleBar (Navegação & Busca)
- **Função**: Controla a janela (Drag), pesquisa fuzzy e filtros globais.
- **Destaque**: Barra de pesquisa estilo "Command Palette" que expande com `Ctrl+P`.
- **Efeito**: Dropdown de resultados flutuante com `backdrop-blur`.

### 🗃️ Sidebar
- **Função**: Navegação lateral fixa.
- **Links**: Início, Biblioteca, Downloader, Admin e Perfil.
- **Estado Ativo**: Acento indigo com brilho externo (Glow).

### 🚀 SplashScreen
- **Função**: Loader inicial de bootstrapping.
- **Estilo**: Card centralizado com transparência 80%, barra de progresso indigo e logo pulsante.

---

## 3. Páginas & Layouts

### 📚 LibraryPage
- **Grade**: `grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
- **Cards**: Imagens com aspect-ratio quadrado, títulos pesados e categorias coloridas via tokens CSS (`cat-vst`, `cat-preset`, etc).

### 📑 ItemDetailPage
- **Estruturado em Markdown**: Renderização customizada via `codex-markdown`.
- **Interação**: Botão "Capturar" (Download) integrado e edição em tempo real de metadados para admins.

### 📥 DownloaderPage (Capture Engine)
- **Wizard**: 4 Passos (Input -> Análise -> Opções -> Download).
- **Estética**: Cartões de modo (`ModeCard`) com destaque para Extração de Áudio.
- **Status**: Indicador de motor pronto (Ponto verde pulsante).

---

## 4. Regras de Interface (UI Rules)
1. **Transições**: Toda troca de rota deve usar `AnimatePresence` com `opacity` e `y` offset suave (5px).
2. **Bordas**: Nunca usar preto puro ou branco puro para bordas; usar opacidade sutil (`white/5`).
3. **Botões**: Devem ter `transition-all` e um leve `active:scale-[0.98]`.
4. **Markdown**: Sempre usar o container `.codex-markdown` para garantir legibilidade de blocos de código e tabelas.
