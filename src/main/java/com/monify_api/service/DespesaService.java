package com.monify_api.service;

import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.CategoriaDespesa;
import com.monify_api.model.entity.Despesa;
import com.monify_api.model.entity.Parcela;
import com.monify_api.model.repository.DespesaRepository;
import com.monify_api.model.repository.ParcelaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class DespesaService {

    private DespesaRepository repository;
    private ParcelaRepository parcelaRepository;

    public DespesaService(DespesaRepository repository, ParcelaRepository parcelaRepository) {
        this.repository = repository;
        this.parcelaRepository = parcelaRepository;
    }

    public List<Despesa> getDespesas() {
        return repository.findAll();
    }

    public Optional<Despesa> getDespesaById(Long id) {
        return repository.findById(id);
    }

    public List<Despesa> getDespesasByCategoria(CategoriaDespesa categoria) {
        return repository.findByCategoriaDespesa(categoria);
    }

    public List<Parcela> getParcelas(Despesa despesa) {
        return parcelaRepository.findByDespesaOrderByIdAsc(despesa);
    }

    @Transactional
    public Despesa salvar(Despesa despesa) {
        validar(despesa);
        if (!Boolean.TRUE.equals(despesa.getParcelada())) {
            despesa.setParcelada(false);
        }
        Despesa salva = repository.save(despesa);
        sincronizarParcelas(salva);
        return salva;
    }

    @Transactional
    public void excluir(Despesa despesa) {
        Objects.requireNonNull(despesa.getId());
        // Composicao: as parcelas nao existem sem a despesa
        parcelaRepository.deleteAll(parcelaRepository.findByDespesaOrderByIdAsc(despesa));
        repository.delete(despesa);
    }

    public void validar(Despesa despesa) {
        if (despesa.getNome() == null || despesa.getNome().trim().equals("")) {
            throw new RegraNegocioException("Nome inválido");
        }
        if (despesa.getData() == null) {
            throw new RegraNegocioException("Data inválida");
        }
        if (despesa.getValor() == null || despesa.getValor() <= 0) {
            throw new RegraNegocioException("Valor inválido");
        }
        if (despesa.getFormaPagamento() == null || despesa.getFormaPagamento().getId() == null
                || despesa.getFormaPagamento().getId() == 0) {
            throw new RegraNegocioException("Forma de pagamento inválida");
        }
        if (despesa.getCategoriaDespesa() == null || despesa.getCategoriaDespesa().getId() == null
                || despesa.getCategoriaDespesa().getId() == 0) {
            throw new RegraNegocioException("Categoria de despesa inválida");
        }
        if (Boolean.TRUE.equals(despesa.getParcelada())) {
            Integer qtd = despesa.getQuantidadeParcelas();
            if (qtd == null || qtd < 2) {
                throw new RegraNegocioException("Quantidade de parcelas inválida (informe um número maior ou igual a 2)");
            }
        }
        validarLimiteGasto(despesa);
    }

    // Regra da CategoriaDespesa: se limiteGasto = true, a soma das despesas da categoria
    // no mes da despesa nao pode ultrapassar o valorLimite.
    private void validarLimiteGasto(Despesa despesa) {
        CategoriaDespesa categoria = despesa.getCategoriaDespesa();
        if (!Boolean.TRUE.equals(categoria.getLimiteGasto()) || categoria.getValorLimite() == null) {
            return;
        }
        YearMonth mes = YearMonth.from(despesa.getData());
        Long idIgnorado = despesa.getId() == null ? -1L : despesa.getId();
        Double totalMes = repository.somarValorPorCategoriaNoPeriodo(
                categoria, mes.atDay(1), mes.atEndOfMonth(), idIgnorado);
        double total = totalMes + despesa.getValor();
        if (total > categoria.getValorLimite()) {
            throw new RegraNegocioException(String.format(
                    "Limite de gasto mensal da categoria %s excedido (limite: %.2f, total no mês: %.2f)",
                    categoria.getNome(), categoria.getValorLimite(), total));
        }
    }

    // Composicao Despesa -> Parcela: gera (ou regera) as parcelas quando a despesa e parcelada.
    private void sincronizarParcelas(Despesa despesa) {
        List<Parcela> atuais = parcelaRepository.findByDespesaOrderByIdAsc(despesa);
        int quantidade = Boolean.TRUE.equals(despesa.getParcelada())
                ? despesa.getQuantidadeParcelas()
                : 0;

        if (quantidade == atuais.size() && somaConfere(atuais, despesa.getValor())) {
            return;
        }
        if (atuais.stream().anyMatch(p -> Boolean.TRUE.equals(p.getPago()))) {
            throw new RegraNegocioException(
                    "Despesa possui parcelas pagas: não é possível alterar o valor ou o parcelamento");
        }
        parcelaRepository.deleteAll(atuais);
        if (quantidade > 0) {
            parcelaRepository.saveAll(gerarParcelas(despesa, quantidade));
        }
    }

    private boolean somaConfere(List<Parcela> parcelas, Float valor) {
        if (parcelas.isEmpty()) {
            return true;
        }
        double soma = parcelas.stream().mapToDouble(Parcela::getValorParcela).sum();
        return Math.abs(soma - valor) < 0.01;
    }

    private List<Parcela> gerarParcelas(Despesa despesa, int quantidade) {
        BigDecimal total = new BigDecimal(Float.toString(despesa.getValor()));
        BigDecimal valorBase = total.divide(BigDecimal.valueOf(quantidade), 2, RoundingMode.DOWN);
        BigDecimal ultima = total.subtract(valorBase.multiply(BigDecimal.valueOf(quantidade - 1)));

        List<Parcela> parcelas = new ArrayList<>();
        for (int i = 1; i <= quantidade; i++) {
            BigDecimal valor = (i == quantidade) ? ultima : valorBase;
            parcelas.add(new Parcela(null, valor.floatValue(), false, despesa));
        }
        return parcelas;
    }
}
