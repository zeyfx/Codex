# Tutorial Definitivo: Upload e Sistema CI/CD no Github

Este documento detalha o step-by-step para lançar atualizações, assinar o instalador nativo do **Codex** e não estourar a segurança da máquina local, utilizando o Github Actions.

---

## 1. O Problema: Por que o push deu erro antes?
No seu terminal ocorreu o erro:
`error: src refspec main does not match any`. 
Isso aconteceu porque o repositório foi iniciado (`git init`), **mas nenhum arquivo foi commitado ainda**. Sem commitar os arquivos, a "árvore" ou branch "main" literalmente não existe no seu computador, logo o github não tinha o que receber.

## 2. A Solução (Primeiro Upload Oficial do App)

Garantida a segurança através do `.gitignore` (onde listamos para não fofocar a chave `codex.key` ou o arquivo gigantesco da pasta `node_modules`), você precisará fazer apenas isto no seu terminal da pasta `Codex`:

### Passo 2.1: Preencher a cápsula (Commitar)
````bash
# Adiciona todos os arquivos seguros no carrinho
git add .

# Carimba o pacote e assina com o nome da etapa
git commit -m "feat: initial tauri release e updater"
````

### Passo 2.2: Enviar a cápsula
Se você já atrelou o repositório como foi feito através do comando `git remote add origin ...`, basta subir a nova ramificação recém-criada:
````bash
# Envia oficialmente a sua base pela 1ªvez para o servidor deles
git push -u origin main
````

---

## 3. Lançando uma Atualização Automática (Gatilho do Action)

O GitHub Actions está configurado para ouvir uma palavra "mágica" para disparar os servidores Linux deles, compilar o Rust e gerar os executáveis `.msi`. E a "palavra mágica" no caso do nosso script em `.github/workflows/release.yml` é uma **TAG**.

Sempre que terminar um dia longo de código e melhorias, suba o commit normal (`git push`).
Após isso, crie uma Tag e envie ela:

````bash
# 1. Defina a nova versão
git tag v1.0.0

# 2. Empurre a etiqueta para que os robôs do Github observem!
git push --tags
````

A partir disso, clique na barra superior do repositório no Github chamada **"Actions"** e preste atenção na mágica acontecendo por lá.

---

###  ⚠️ CUIDADO REDOBRADO
As variáveis secretas do Github!
Ao entrar no repositório, você **PRECISA IR EM:**
`Settings > Secrets and variables > Actions > New repository secret`

E adicionar:
* `TAURI_PRIVATE_KEY` (Cole dentro o conteúdo do arquivo cru: `src-tauri/codex.key`)
* `TAURI_KEY_PASSWORD` (A senha base: `vortex2026`)

Senão ele irá falhar ao compilar o release por incapacidade de assinar digitalmente o executável Windows.
