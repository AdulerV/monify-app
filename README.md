# Monify App

Front-end React do Monify. Consome a `monify_api` (Spring Boot).

- **Base de código:** `saa-app` (componentes Card/FormGroup/toastr, padrão listagem + cadastro, axios).
- **Estilização:** `FinanceTrack`, mantida de forma estrita: `custom.css`, `index.css`, `App.css`, `styles/home.css` e `styles/navbar.css` são cópias idênticas; mesmo tema (Bootswatch Pulse), fonte Lexend, Bootstrap Icons e mesma marcação/classes.

## Como executar

1. Suba a API (`monify_api`) em `http://localhost:8080`.
2. Nesta pasta:

```bash
npm install
npm start
```

3. Acesse http://localhost:3000, clique em **Cadastre-se** e faça login.

Para outra URL da API, defina `REACT_APP_API_URL` (ex.: `http://localhost:8081/api/v1`) antes do `npm start`.
Para outra origem do front, ajuste `app.cors.origens` / `CORS_ORIGENS` na API.

## Telas

| Menu | Tela | Recursos da API |
|---|---|---|
| Início | Saldo, entradas, saídas, parcelas a pagar, limites de gasto do mês, metas em andamento | todos |
| Lançamentos | Receitas e despesas (filtro por tipo, mês e ano; parcelamento) | `/receitas`, `/despesas` |
| Lançamentos | Categorias (com limite de gasto mensal) | `/categoriasreceita`, `/categoriasdespesa` |
| Lançamentos | Formas de pagamento | `/formaspagamento` |
| Objetivos | Metas (progresso e status calculado pela API) e aportes | `/metasfinanceiras`, `/aportes` |
| Pagamentos | Parcelas pendentes/pagas, pagar parcela ou fatura do filtro | `/parcelas` |
| Relatórios | Mensal (pizzas por categoria/forma, volume, aportes) e anual (mês a mês) | `/receitas`, `/despesas`, `/aportes` |
| Usuários (admin) | Cadastro e manutenção de usuários | `/usuarios` |

## Dados por usuário

Cada usuário vê apenas os próprios lançamentos, categorias, formas de pagamento, metas, parcelas e aportes. O filtro é feito pela API a partir do token do login, então o front-end não precisa filtrar nada.
