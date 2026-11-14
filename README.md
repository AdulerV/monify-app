# Monify API

API REST de controle financeiro pessoal, implementada a partir do diagrama de classes do Monify e da arquitetura da `saaapi` (controller → DTO → service → repository → entity, ModelMapper, autenticação JWT).

## Stack

Java 17, Spring Boot 4.1.2, Spring Data JPA, Spring Security (JWT com jjwt 0.12), MySQL 8+, springdoc-openapi (Swagger), Lombok, ModelMapper.

## Como executar

1. Tenha um MySQL rodando (padrão: `localhost:3306`, usuário `root`, senha `root`). O banco `monify` e as tabelas são criados automaticamente na primeira execução.
   Para sobrescrever: variáveis `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` e `JWT_SECRET`.
2. `./mvnw spring-boot:run`
3. Swagger: http://localhost:8080/swagger-ui.html

Testes (usam H2 em memória no modo de compatibilidade MySQL, sem precisar do servidor): `./mvnw test`

## Autenticação

1. `POST /api/v1/usuarios` com `login`, `cpf`, `senha`, `senhaRepeticao`, `admin`
2. `POST /api/v1/usuarios/auth` com `login` e `senha` → devolve `token`
3. Envie `Authorization: Bearer <token>` nas demais chamadas

A resposta do `/auth` traz `login`, `token` e `admin`. O CORS é tratado no Spring Security e libera, por padrão, o front em `http://localhost:3000` (configurável em `app.cors.origens` / variável `CORS_ORIGENS`).

## Endpoints

| Recurso | Rota base | Extras |
|---|---|---|
| Receitas | `/api/v1/receitas` | |
| Despesas | `/api/v1/despesas` | `GET /{id}/parcelas` |
| Parcelas | `/api/v1/parcelas` | |
| Formas de pagamento | `/api/v1/formaspagamento` | |
| Categorias de receita | `/api/v1/categoriasreceita` | `GET /{id}/receitas` |
| Categorias de despesa | `/api/v1/categoriasdespesa` | `GET /{id}/despesas` |
| Metas financeiras | `/api/v1/metasfinanceiras` | `GET /{id}/aportes` |
| Aportes | `/api/v1/aportes` | |
| Usuários | `/api/v1/usuarios` | `POST /auth` |

Todos os recursos têm `GET`, `GET /{id}`, `POST`, `PUT /{id}` e `DELETE /{id}`. Datas no formato ISO (`2026-11-11`).

## Regras de negócio

- **Despesa parcelada**: ao salvar com `parcelada = true` e `quantidadeParcelas = n` (Integer ≥ 2; no diagrama original é float, alterado por ser uma contagem), o sistema gera `n` parcelas (centavos de arredondamento na última). Alterar valor ou quantidade regera as parcelas, exceto se alguma já estiver paga.
- **Limite de gasto**: se a categoria de despesa tem `limiteGasto = true`, a soma das despesas da categoria no mês não pode ultrapassar `valorLimite`.
- **Meta financeira**: `status` é calculado automaticamente (`true` quando investimento inicial + aportes ≥ valor) e recalculado a cada aporte incluído, alterado ou excluído.
- **Composições**: excluir uma despesa exclui suas parcelas; excluir uma meta exclui seus aportes.
- Formas de pagamento e categorias em uso não podem ser excluídas.
