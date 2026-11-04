# UC 10 — Versionamento com Git Flow

## Modelo de branches
- `main`: versões estáveis e entregáveis.
- `develop`: integração do trabalho em andamento.
- `feature/nome`: funcionalidade isolada.
- `release/x.y.z`: preparação de versão.
- `hotfix/descricao`: correção urgente sobre `main`.

## Comandos de referência
```bash
git init
git add .
git commit -m "chore: estrutura inicial do OmniLog Hub"
git branch -M main
git checkout -b develop
git checkout -b feature/desktop-electron
git add .
git commit -m "feat: adiciona cliente desktop Electron"
git checkout develop
git merge --no-ff feature/desktop-electron
git tag -a v2.2.0 -m "OmniLog Hub 2.2.0"
```

## Padrão de commits
`feat:` funcionalidade; `fix:` correção; `docs:` documentação; `test:` testes; `refactor:` reorganização sem alteração funcional; `chore:` manutenção.

## Cuidados
O `.gitignore` exclui `.env`, `node_modules` e cobertura de testes. Nunca faça commit de senha do MySQL, credenciais SMTP, tokens ou dados pessoais reais.

## Evidências a guardar
Histórico `git log --oneline --graph --all`, branches `git branch -a`, tag de release `git tag` e pull request/merge request, caso seja usado GitHub ou GitLab.
