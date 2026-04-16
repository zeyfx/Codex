# Autenticação

A autenticação é gerida nativamente com o protocolo OAuth 2.0 do Discord:

1. A rota inicial exige o login (`LoginPage.tsx`).
2. Ao clicar no botão de "Entrar com Discord", o backend Rust (`auth::discord_login`) intercepta e abre a URL de OAuth num webview ou browser.
3. O servidor interno responde em porta local (ex.: `localhost:6543/auth/callback`), onde o código OAuth é repassado ao `tauri::event`.
4. O cliente React recupera os tokens, salva dinamicamente o perfil via `Supabase` (atualizando avatar e base) e redireciona o usuário (para `/profile` ou `/library`).

## Store
A store via `Zustand` (`authStore`) gerencia o estado `isAuthenticated` permitindo proteger ou libertar rotas utilizando o Component Wrapper `ProtectedRoute.tsx`.
