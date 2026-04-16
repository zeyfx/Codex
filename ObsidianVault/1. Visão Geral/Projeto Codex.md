# Projeto Codex

Plataforma rica para artistas, beatmakers e produtores baixarem kits, plugins VST e samples. Conta também com a **Capture Engine**, um motor de download poderoso (vídeo para áudio).

## Stack Principal

| Camada | Tech |
|--------|------|
| Desktop | Tauri v2 |
| UI | React 19 + TypeScript 5 + Tailwind CSS v4 |
| Animações | Framer Motion 12 |
| Estado global | Zustand 5 |
| Roteamento | React Router v7 |
| Backend/DB | Supabase |
| Auth | Discord OAuth 2.0 |

## Setup e Execução

### 1. Dependências
```bash
npm install
```

### 2. Variáveis de Ambiente
Copie `.env.example` para `.env` e configure:
- **Supabase**: URL e anon key
- **Discord**: Client ID, Secret e Redirect URI (usado `http://localhost:6543/auth/callback` para auth)

### 3. Executando
Para desenvolvimento:
```bash
npm run dev
```

Para build de produção:
```bash
npm run build
```
