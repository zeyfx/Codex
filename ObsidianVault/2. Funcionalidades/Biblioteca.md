# Biblioteca

A Biblioteca (Library) atua como um repositório central alimentado pelo banco de dados **Supabase**.

## LibraryPage
Exibe os cards formatáveis com badges informativas.
Utiliza fuzzy search com `fuse.js` (conectando a prop do estado global do header).

## ItemDetailPage
Quando o usuário seleciona um software/Vst ou kit:
* Toda arquitetura de tutorial e guia detalhado é parseada com **react-markdown** em blocos ricos (css estilizado em `.codex-markdown`).
* Inclui botão "Capturar/Download" interagindo com o Backend caso haja pacote associado.
* Administradores (`AdminPage.tsx`) têm permissões in-place para alterar essas informações.
