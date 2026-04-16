# Codex — Desktop App

Plataforma para artistas, beatmakers e produtores baixarem kits, plugins VST e samples.

## Stack

| Camada | Tech |
|--------|------|
| Desktop | Electron 34 |
| Build | electron-vite 3 + Vite 6 |
| UI | React 19 + TypeScript 5 |
| Estilos | Tailwind CSS v4 |
| Animações | Framer Motion 12 |
| Estado global | Zustand 5 |
| Roteamento | React Router v7 |
| Backend/DB | Supabase 2 |
| Auth | Discord OAuth 2.0 |

## Setup

### 1. Clone e instale dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Preencha `.env` com:
- **Supabase**: URL e anon key do seu projeto
- **Discord**: Client ID, Secret e Redirect URI da sua app em https://discord.com/developers/applications

### 3. Configure o Discord OAuth

No painel do Discord Developer:
- Redirects autorizados: `http://localhost:6543/auth/callback`
- Scopes necessários: `identify`, `email`, `guilds`

### 4. Rode a migration no Supabase

Execute o arquivo `supabase/migrations/001_profiles.sql` no SQL Editor do Supabase.

### 5. Rode em desenvolvimento

```bash
npm run dev
```

### 6. Build de produção

```bash
npm run build
```

## Estrutura do projeto

```
codex/
├── .env.example              # Template de variáveis de ambiente
├── electron.vite.config.ts   # Configuração do electron-vite
├── package.json
├── tsconfig.json             # Root (referencia node + web)
├── tsconfig.node.json        # TS config para main/preload
├── tsconfig.web.json         # TS config para renderer (React)
├── supabase/
│   └── migrations/
│       └── 001_profiles.sql  # Migration da tabela profiles
└── src/
    ├── main/
    │   └── index.ts          # Processo principal do Electron + IPC handlers
    ├── preload/
    │   └── index.ts          # Bridge segura (contextBridge) entre main e renderer
    └── renderer/
        ├── index.html        # HTML entry point
        └── src/
            ├── main.tsx      # React entry point
            ├── App.tsx       # Rotas / layout raiz
            ├── env.d.ts      # Declaração global de window.api
            ├── styles/
            │   └── index.css # Tailwind v4 entry
            ├── pages/
            │   └── LoginPage.tsx
            ├── components/   # Componentes reutilizáveis (a criar)
            ├── hooks/
            │   └── useAuth.ts
            ├── stores/
            │   └── authStore.ts
            ├── lib/
            │   ├── supabase.ts
            │   └── discord.ts
            └── types/
                └── index.ts  # DiscordUser, AuthUser, UserProfile
```

## Fluxo de autenticação

1. Usuário clica em "Entrar com Discord"
2. `src/main/index.ts` abre uma janela popup com a URL de OAuth do Discord
3. Discord redireciona para `localhost:5173/auth/callback?code=...`
4. O código é capturado via `will-redirect` no Electron e enviado ao renderer via IPC
5. O renderer troca o código por um access token diretamente na API do Discord
6. Os dados do usuário são buscados e salvos no Supabase (`profiles`)
7. O usuário é redirecionado para `/profile`
