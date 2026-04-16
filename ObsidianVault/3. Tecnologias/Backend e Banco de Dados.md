# Backend e Banco de Dados

## Rust & Tauri
Toda chamada que demanda acesso ao OS é abstraída no **Tauri**:
* `plugin-shell`: Para abrir links externos (`shell.open()`) ou invocar apps.
* `discord_rpc.rs`: Integração nativa SDK do Discord mostrando para a rede que o usuário usa a plataforma em realtime. Tudo mantido em loop em uma thread apartada (spawn async).

## Supabase (Database)
Utilizado para armazenar:
* A lista rica de Itens (Kits, DAWs, VSTs) requisitada pela tabela `library_items`.
* `profiles` de usuário atrelado à `users` (auth table base).
A modelagem é simplificada, retornando em JSON consumível diretamente pelo front. As Roles de Admin limitam acesso na View de CRUD para novos itens (`AdminPage.tsx`).
