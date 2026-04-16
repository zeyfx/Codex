# Frontend

* **React 19 + TypeScript**: Para performance e compilação robusta.
* **Vite 6**: Processo de build absurdamente rápido.
* **Tailwind CSS v4 + Framer Motion**: Estilização base do Glassmorphism.

## Roteamento
React Router em `App.tsx`:
Implementa estrutura central e Outlet:
* `/library` e suas filhas (`/library/:id`).
* Proteção estrita via `ProtectedRoute` impedindo manipulação da UI Library sem o UUID de sessão. 

## Estado Globa
`Zustand` facilita chamadas diretas sem context drilling (ex: atualizando status de barra de loading enquanto o download roda internamente em um componente folha).
