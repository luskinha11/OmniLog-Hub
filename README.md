# OmniLog Hub

Plataforma acadêmica de gestão logística integrada, desenvolvida com Node.js, Express, MySQL 8.4, HTML, CSS e JavaScript.

## 1. Requisitos

- Node.js 20 ou superior.
- MySQL Server 8.4 instalado e iniciado.
- Acesso ao banco configurado na porta `3307` neste ambiente.
- VS Code recomendado.

## 2. Configuração inicial

No terminal aberto dentro da pasta do projeto:

```bash
npm install
```

Se ainda não existir um arquivo `.env`, copie o modelo:

```bash
cp .env.example .env
```

Abra `.env` e informe a senha que você criou para o usuário `root` do MySQL. Mantenha `DB_PORT=3307` neste computador. Troque também `SESSION_SECRET`, `RESET_TOKEN_SECRET` e `ADMIN_PASSWORD` por valores privados e fortes. Nunca envie o `.env` para outras pessoas nem o publique no Git.

## 3. Banco de dados

Na primeira instalação, importe o schema pelo Git Bash:

```bash
"/c/Program Files/MySQL/MySQL Server 8.4/bin/mysql.exe" -h 127.0.0.1 -P 3307 -u root -p < database/schema.sql
```

O comando solicita a senha do MySQL. A importação cria o banco `omnilog_hub`, as tabelas, relacionamentos, índices, views, procedures e dados demonstrativos.

Se o banco já foi criado e está funcionando, não é necessário importar o schema novamente para atualizar a interface e as rotas desta versão.

## 4. Conferir conexão e criar administrador

```bash
npm run db:check
npm run seed:admin
npm run admin:check
```

A conta administrativa usa o e-mail e a senha definidos em `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`. O script cria ou atualiza essa conta. Não use a senha de exemplo em uma instalação publicada.

## 5. Iniciar a aplicação

```bash
npm run dev
```

Acesse `http://localhost:3000`. Para encerrar o servidor, pressione `Ctrl + C` no terminal.

## 6. Recursos implementados

### Conta e autenticação
- Cadastro de cliente com nome, e-mail e senha.
- Login e manutenção de sessão.
- Botão para sair da conta.
- Recuperação de senha por código de seis dígitos, com validade de dez minutos, uso único e limite de tentativas.
- Senhas armazenadas com hash bcrypt e limitação de tentativas nas rotas de autenticação.
- Perfis de acesso: ADMIN, MANAGER, OPERATOR e CUSTOMER.

### Cliente
- Catálogo de produtos, pesquisa por nome/categoria e consulta de estoque disponível.
- Carrinho com controle de quantidade e total em reais.
- Finalização de pedidos com reserva transacional de estoque.
- Histórico de pedidos e código de rastreio.
- Consulta pública do status de uma entrega por código.

### Administração e operação
- Indicadores de produtos, pedidos, clientes, unidades disponíveis e valor dos pedidos.
- Cadastro, edição, desativação e reativação de produtos (ADMIN e MANAGER).
- Consulta e ajuste de estoque, sem permitir quantidade inferior ao que já está reservado.
- Consulta de pedidos e atualização de status.
- Consulta e atualização de entregas.
- Cancelamento de pedidos libera as quantidades reservadas. Ao marcar uma entrega como concluída, o sistema baixa o estoque reservado.

### Engenharia e documentação
- API REST separada por módulos.
- Consultas SQL parametrizadas, chaves estrangeiras, restrições, views e procedures.
- Algoritmo de ordenação demonstrativa de rota e cálculo monetário em centavos.
- Estruturas de dados Stack e Queue.
- Testes unitários com Jest.
- Documentação das UCs recuperadas em `docs/UCs.md`.

## 7. Recuperação de senha por e-mail

Sem SMTP configurado, em `development`, o código de recuperação aparece no terminal do servidor para testes locais. Para enviar e-mail, preencha `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` e `EMAIL_FROM` no `.env`. Para Gmail, use uma senha de app, nunca a senha normal da conta. Não coloque credenciais diretamente no código.

## 8. Cliente desktop (UC 8 e UC 9)

O projeto inclui um cliente desktop com Electron que abre a mesma interface local e utiliza a mesma API/ conexão MySQL. Não existe uma segunda base de dados nem duplicação de regras de negócio.

```bash
npm install
npm run desktop
```

O Electron inicia o servidor local automaticamente. Se `npm run dev` já estiver rodando, o desktop reutiliza o servidor existente. O MySQL precisa estar ativo e o `.env` configurado.

## 9. Testes

```bash
npm test
npm run test:coverage
```

## 10. Estrutura

- `database/schema.sql`: banco, tabelas, views, procedures e dados de demonstração.
- `src/config`: pool e conexão MySQL.
- `src/middleware`: autenticação e autorização por perfil.
- `src/routes`: rotas de autenticação, produtos, estoque, pedidos, entregas e administração.
- `src/models`: pilha, fila e classes de domínio Vehicle, Shipment e Payment.
- `electron`: cliente desktop Electron.
- `docs`: backlog, modelagem, inglês técnico, Git Flow, testes, apresentação e mapa das UCs.
- `src/utils`: algoritmos.
- `public`: interface web, estilos e JavaScript do navegador.
- `scripts`: verificação do banco, criação e conferência da conta administrativa.
- `tests`: testes automatizados.

## 11. Atualizar uma instalação existente

Para atualizar da versão 2.1.0, pare o servidor, extraia esta versão sobre a pasta do projeto e mantenha o `.env` existente. Depois rode `npm install`. Não execute novamente o SQL se o banco já está funcionando.

1. Pare o servidor com `Ctrl + C`.
2. Faça uma cópia do seu `.env`.
3. Substitua os arquivos do projeto pelos arquivos desta versão, mantendo o `.env`.
4. Execute `npm install` e depois `npm run dev`.
5. Não reimporte `database/schema.sql` se o banco já estiver criado.

## 12. Limitações conhecidas

- Pagamentos estão representados no modelo de dados, mas não há integração com um gateway financeiro real.
- A otimização de rotas é demonstrativa e não consome trânsito ou mapas em tempo real.
- A recuperação por e-mail depende da configuração SMTP local.
- O cliente desktop usa Electron e a interface web compartilhada; confirme se o professor aceita Electron quando solicitar desktop nativo.
- A UC 6 não constava dos requisitos recuperados; envie o enunciado para completar sem inventar conteúdo.
- A sessão em memória é adequada para desenvolvimento local, não para produção.
