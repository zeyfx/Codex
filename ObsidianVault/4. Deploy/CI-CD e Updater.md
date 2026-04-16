# Deploy (CI/CD) e Auto-Updater

A automação de versionamento do **Codex** acontece através do *Github Actions*.

## O Pipeline (`release.yml`) 
Sempre que o repositório receber uma nova tag (Ex: `v1.0.5`), o Workflow de Github Actions será disparado:
1. Faz Checkout do código.
2. Instala Node.js (v20) e Rust.
3. Compila a aplicação via o plugin oficial `@tauri-apps/tauri-action`.
4. O próprio plugin injeta as chaves do Updater (`TAURI_PRIVATE_KEY` e `TAURI_KEY_PASSWORD`) vindas do Github Secrets.
5. Um release público é hospedado, gerando os instaladores e o arquivo mágico `latest.json`.

## Auto-Update no Frontend
A tela `SplashScreen.tsx` checa o endpoint `latest.json` público no momento inicial do App. Se uma rota apontar para uma versão de tag maior, ele ativa a interface gráfica de alerta, faz o download do patch Delta/Msi, e reinicia a runtime do sistema automaticamente.
