export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const PALETA_CORES = [
  '#98e6ff',
  '#50bbfa',
  '#6089ec',
  '#9329ed',
  '#761cc2',
  '#760690',
];

export function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// A API trabalha com datas ISO (AAAA-MM-DD); a exibicao e DD/MM/AAAA.
// O texto e lido diretamente para evitar deslocamento de fuso horario.
export function formatarData(dataIso) {
  if (!dataIso) return '—';
  const [ano, mes, dia] = String(dataIso).substring(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

export function mesDe(dataIso) {
  return dataIso ? Number(String(dataIso).substring(5, 7)) : null;
}

export function anoDe(dataIso) {
  return dataIso ? Number(String(dataIso).substring(0, 4)) : null;
}

export function hojeIso() {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${hoje.getFullYear()}-${mes}-${dia}`;
}

export function filtrarPorPeriodo(lista, campoData, filtroMes, filtroAno) {
  return lista.filter((item) => {
    const data = item[campoData];
    if (!data) return true;
    const filtraMes = filtroMes === 'Todos' || mesDe(data) === Number(filtroMes);
    const filtraAno = filtroAno === 'Todos' || anoDe(data) === Number(filtroAno);
    return filtraMes && filtraAno;
  });
}

export function anosDisponiveis(...listasComCampo) {
  const anos = new Set();
  listasComCampo.forEach(([lista, campo]) => {
    lista.forEach((item) => {
      if (item[campo]) anos.add(anoDe(item[campo]));
    });
  });
  anos.add(new Date().getFullYear());
  return [...anos].sort((a, b) => b - a);
}

export function somarValores(lista, campo = 'valor') {
  return lista.reduce((acc, item) => acc + (Number(item[campo]) || 0), 0);
}

// aceita "1.234,56", "1234,56" e "1234.56"
export function paraNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  let texto = String(valor).trim();
  if (texto.includes(',')) {
    texto = texto.replace(/\./g, '').replace(',', '.');
  }
  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : null;
}
