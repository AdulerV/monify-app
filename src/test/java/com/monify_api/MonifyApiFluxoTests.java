package com.monify_api;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class MonifyApiFluxoTests {

    @Autowired
    private MockMvc mvc;

    private String token;

    @BeforeEach
    void autenticar() throws Exception {
        mvc.perform(post("/api/v1/usuarios").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"ana\",\"cpf\":\"123\",\"senha\":\"s3nha\",\"senhaRepeticao\":\"s3nha\",\"admin\":false}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.senha").value(nullValue()));

        String resp = mvc.perform(post("/api/v1/usuarios/auth").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"ana\",\"senha\":\"s3nha\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        token = JsonPath.read(resp, "$.token");
    }

    private MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder req, String body) {
        return req.header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(body);
    }

    private MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder req) {
        return req.header("Authorization", "Bearer " + token);
    }

    private Integer criar(String url, String body) throws Exception {
        String resp = mvc.perform(json(post(url), body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resp, "$.id");
    }

    @Test
    void semTokenNegaAcesso() throws Exception {
        mvc.perform(get("/api/v1/despesas")).andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/usuarios/auth").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"ana\",\"senha\":\"errada\"}"))
                .andExpect(status().isUnauthorized());
        // usuario comum nao administra usuarios
        mvc.perform(auth(get("/api/v1/usuarios"))).andExpect(status().isForbidden());
    }

    @Test
    void receitaComCategoria() throws Exception {
        Integer idCat = criar("/api/v1/categoriasreceita", "{\"nome\":\"Salário\"}");
        Integer idRec = criar("/api/v1/receitas",
                "{\"nome\":\"Salário nov\",\"data\":\"2026-11-05\",\"volume\":false,\"valor\":5000,\"idCategoriaReceita\":" + idCat + "}");

        mvc.perform(auth(get("/api/v1/receitas/" + idRec)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nomeCategoriaReceita").value("Salário"))
                .andExpect(jsonPath("$.data").value("2026-11-05"));

        mvc.perform(json(post("/api/v1/receitas"), "{\"nome\":\"Sem categoria\",\"data\":\"2026-11-05\",\"valor\":10}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Categoria de receita inválida"));

        // categoria em uso nao pode ser excluida
        mvc.perform(auth(delete("/api/v1/categoriasreceita/" + idCat)))
                .andExpect(status().isBadRequest());
        mvc.perform(auth(get("/api/v1/categoriasreceita/" + idCat + "/receitas")))
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void despesaParceladaGeraParcelasELimiteDeGasto() throws Exception {
        Integer idForma = criar("/api/v1/formaspagamento", "{\"nome\":\"Cartão de crédito\"}");
        Integer idCat = criar("/api/v1/categoriasdespesa",
                "{\"nome\":\"Lazer\",\"limiteGasto\":true,\"valorLimite\":500}");

        Integer idDesp = criar("/api/v1/despesas",
                "{\"nome\":\"Show\",\"data\":\"2026-11-10\",\"valor\":100,\"parcelada\":true,\"quantidadeParcelas\":3," +
                        "\"idFormaPagamento\":" + idForma + ",\"idCategoriaDespesa\":" + idCat + "}");

        mvc.perform(auth(get("/api/v1/despesas/" + idDesp + "/parcelas")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].valorParcela").value(33.33))
                .andExpect(jsonPath("$[2].valorParcela").value(33.34))
                .andExpect(jsonPath("$[0].pago").value(false));

        // ultrapassa o limite mensal de 500 da categoria (100 + 450)
        mvc.perform(json(post("/api/v1/despesas"),
                        "{\"nome\":\"Viagem\",\"data\":\"2026-11-20\",\"valor\":450,\"parcelada\":false," +
                                "\"idFormaPagamento\":" + idForma + ",\"idCategoriaDespesa\":" + idCat + "}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Limite de gasto mensal")));

        // outro mes nao conta para o limite
        criar("/api/v1/despesas",
                "{\"nome\":\"Viagem\",\"data\":\"2026-12-20\",\"valor\":450,\"parcelada\":false," +
                        "\"idFormaPagamento\":" + idForma + ",\"idCategoriaDespesa\":" + idCat + "}");

        // alterar para 4 parcelas regera as parcelas
        mvc.perform(json(put("/api/v1/despesas/" + idDesp),
                        "{\"nome\":\"Show\",\"data\":\"2026-11-10\",\"valor\":100,\"parcelada\":true,\"quantidadeParcelas\":4," +
                                "\"idFormaPagamento\":" + idForma + ",\"idCategoriaDespesa\":" + idCat + "}"))
                .andExpect(status().isOk());
        String parcelas = mvc.perform(auth(get("/api/v1/despesas/" + idDesp + "/parcelas")))
                .andExpect(jsonPath("$", hasSize(4)))
                .andReturn().getResponse().getContentAsString();
        Integer idParcela = JsonPath.read(parcelas, "$[0].id");

        // paga uma parcela; depois disso nao e possivel mudar o parcelamento
        mvc.perform(json(put("/api/v1/parcelas/" + idParcela),
                        "{\"valorParcela\":25,\"pago\":true,\"idDespesa\":" + idDesp + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pago").value(true));
        mvc.perform(json(put("/api/v1/despesas/" + idDesp),
                        "{\"nome\":\"Show\",\"data\":\"2026-11-10\",\"valor\":100,\"parcelada\":true,\"quantidadeParcelas\":2," +
                                "\"idFormaPagamento\":" + idForma + ",\"idCategoriaDespesa\":" + idCat + "}"))
                .andExpect(status().isBadRequest());
        // alterar so o nome mantem as parcelas
        mvc.perform(json(put("/api/v1/despesas/" + idDesp),
                        "{\"nome\":\"Show da banda\",\"data\":\"2026-11-10\",\"valor\":100,\"parcelada\":true,\"quantidadeParcelas\":4," +
                                "\"idFormaPagamento\":" + idForma + ",\"idCategoriaDespesa\":" + idCat + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nomeFormaPagamento").value("Cartão de crédito"));
        mvc.perform(auth(get("/api/v1/despesas/" + idDesp + "/parcelas")))
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[0].pago").value(true));

        // forma de pagamento em uso nao pode ser excluida
        mvc.perform(auth(delete("/api/v1/formaspagamento/" + idForma))).andExpect(status().isBadRequest());

        // composicao: excluir a despesa exclui as parcelas
        mvc.perform(auth(delete("/api/v1/despesas/" + idDesp))).andExpect(status().isNoContent());
        mvc.perform(auth(get("/api/v1/parcelas"))).andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void metaFinanceiraAtualizaStatusComAportes() throws Exception {
        Integer idMeta = criar("/api/v1/metasfinanceiras",
                "{\"nome\":\"Reserva\",\"valor\":1000,\"dataEnvio\":\"2026-11-01\",\"dataAlvo\":\"2027-06-30\",\"investimentoInicial\":200}");

        mvc.perform(auth(get("/api/v1/metasfinanceiras/" + idMeta)))
                .andExpect(jsonPath("$.status").value(false));

        criar("/api/v1/aportes", "{\"valor\":300,\"dataEnvio\":\"2026-11-15\",\"idMetaFinanceira\":" + idMeta + "}");
        Integer idAporte = criar("/api/v1/aportes",
                "{\"valor\":500,\"dataEnvio\":\"2026-12-15\",\"idMetaFinanceira\":" + idMeta + "}");

        mvc.perform(auth(get("/api/v1/metasfinanceiras/" + idMeta)))
                .andExpect(jsonPath("$.status").value(true));
        mvc.perform(auth(get("/api/v1/metasfinanceiras/" + idMeta + "/aportes")))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[1].nomeMetaFinanceira").value("Reserva"));

        // remover um aporte faz a meta voltar a nao atingida
        mvc.perform(auth(delete("/api/v1/aportes/" + idAporte))).andExpect(status().isNoContent());
        mvc.perform(auth(get("/api/v1/metasfinanceiras/" + idMeta)))
                .andExpect(jsonPath("$.status").value(false));

        // data alvo anterior a data de envio
        mvc.perform(json(post("/api/v1/metasfinanceiras"),
                        "{\"nome\":\"X\",\"valor\":10,\"dataEnvio\":\"2026-11-01\",\"dataAlvo\":\"2026-10-01\"}"))
                .andExpect(status().isBadRequest());

        // composicao: excluir a meta exclui os aportes
        mvc.perform(auth(delete("/api/v1/metasfinanceiras/" + idMeta))).andExpect(status().isNoContent());
        mvc.perform(auth(get("/api/v1/aportes"))).andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void swaggerPublico() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
    }

    @Test
    void corsPermiteFrontEndInclusiveEm403() throws Exception {
        mvc.perform(options("/api/v1/despesas")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
        mvc.perform(get("/api/v1/despesas").header("Origin", "http://localhost:3000"))
                .andExpect(status().isForbidden())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
        mvc.perform(post("/api/v1/usuarios/auth").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"ana\",\"senha\":\"s3nha\"}"))
                .andExpect(jsonPath("$.admin").value(false));
    }
}
