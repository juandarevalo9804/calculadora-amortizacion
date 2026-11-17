function formatMoney(valor) {
  const number = Number(valor || 0);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(number);
}

function redondear(valor) {
  return Number((Number(valor) || 0).toFixed(2));
}

function normalizarTipo(valor) {
  return String(valor || '').trim().toLowerCase().replace(/\s+/g, '_');
}

function convertirTasa(valor, tipo, capitalizacion = 12, periodicidadPago = 12) {
  const tasa = Number(valor) / 100;
  const tipoNorm = normalizarTipo(tipo);
  let p = tasa;

  let ea = 0;

  if (tipoNorm === 'ea') {
    ea = tasa;
  } else if (tipoNorm === 'nominal_vencida') {
    p = tasa / Number(capitalizacion || 1);
    ea = Math.pow(1 + p, Number(capitalizacion || 1)) - 1;
  } else if (tipoNorm === 'nominal_anticipada') {
    const d = (tasa / Number(capitalizacion || 1));
    p = d / (1 - d);
    ea = Math.pow(1 + p, Number(capitalizacion || 1)) - 1;
  } else if (tipoNorm === 'periodica_anticipada') {
    p = tasa / (1 - tasa);
    ea = Math.pow(1 + p, Number(capitalizacion || 1)) - 1;
  } else if (tipoNorm === 'periodica_vencida') {
    p = tasa;
    ea = Math.pow(1 + p, Number(capitalizacion || 1)) - 1;
  } else {
    throw new Error('Tipo de tasa no soportado: ' + tipo);
  }

  const i = Math.pow(1 + ea, 1 / Number(periodicidadPago || 1)) - 1;
  const d = i / (1 + i);
  const nominalVencida = i * Number(periodicidadPago || 1);
  const nominalAnticipada = d * Number(periodicidadPago || 1);

  return {
    valorOriginal: tasa,
    tasaPeriodica: p,
    ea,
    i,
    d,
    nominalVencida,
    nominalAnticipada,
    capitalizacion: Number(capitalizacion || 1),
    periodicidadPago: Number(periodicidadPago || 1)
  };
}

function cuotaFija(P, i, n, anticipada = false) {
  const capital = Number(P);
  const tasa = Number(i);
  const cuotas = Number(n);
  if (cuotas <= 0) return 0;
  if (tasa === 0) return capital / cuotas;
  const factor = 1 - Math.pow(1 + tasa, -cuotas);
  if (!anticipada) {
    return (capital * tasa) / factor;
  }
  return ((capital * tasa) / ((1 + tasa) * factor));
}

function obtenerAbonosMap(abonos, totalPeriodos) {
  const mapa = {};
  if (!Array.isArray(abonos)) return mapa;
  abonos.forEach((abono) => {
    const periodo = Number(abono.periodo || 0);
    const valor = Number(abono.valor || 0);
    if (periodo > 0 && valor > 0) {
      if (abono.frecuencia === 'periodico') {
        for (let p = periodo; p <= totalPeriodos; p++) {
          mapa[p] = (mapa[p] || 0) + valor;
        }
      } else {
        mapa[periodo] = (mapa[periodo] || 0) + valor;
      }
    }
  });
  return mapa;
}

function simularCredito({
  capital,
  cuotas,
  tasa,
  tipoTasa,
  capitalizacion,
  periodicidad,
  momentoPago,
  gracia = 0,
  tratamientoGracia = 'capitaliza',
  abonos = [],
  escenario = 'sin_abonos'
}) {
  const capitalBase = Number(capital) || 0;
  const cuotaTotal = Number(cuotas) || 0;
  if (capitalBase <= 0 || cuotaTotal <= 0) return { filas: [], conversion: null, cuota: 0, totalIntereses: 0 };

  const conversion = convertirTasa(tasa, tipoTasa, capitalizacion, periodicidad);
  const i = conversion.i;
  const totalPeriodos = gracia + cuotaTotal;
  const abonosMap = obtenerAbonosMap(abonos, totalPeriodos);
  let saldo = capitalBase;
  let cuotaActual = cuotaFija(capitalBase, i, cuotaTotal, momentoPago === 'anticipada');
  const filas = [];
  let totalIntereses = 0;
  let totalPagado = 0;

  for (let periodo = 1; periodo <= cuotaTotal + gracia; periodo++) {
    const esGracia = periodo <= gracia;
    let saldoInicial = saldo;
    let interes = 0;
    let cuota = 0;
    let amortizacion = 0;
    let abonoExtra = 0;
    let saldoFinal = saldo;

    if (esGracia) {
      interes = saldoInicial * i;
      if (tratamientoGracia === 'capitaliza') {
        saldoFinal = saldoInicial * (1 + i);
        cuota = 0;
        amortizacion = 0;
      } else {
        cuota = interes;
        saldoFinal = saldoInicial;
        amortizacion = 0;
      }
    } else {
      const periodoReal = periodo - gracia;
      if (escenario === 'reducir_cuota' && periodoReal === 1) {
        cuotaActual = cuotaFija(saldoInicial, i, cuotaTotal, momentoPago === 'anticipada');
      }

      if (momentoPago === 'anticipada' && periodoReal === 1) {
        interes = 0;
      } else {
        interes = saldoInicial * i;
      }

      cuota = cuotaActual;

      amortizacion = Math.max(0, cuota - interes);
      if (amortizacion >= saldoInicial - 0.005 || periodo === totalPeriodos) {
        amortizacion = saldoInicial;
        cuota = interes + saldoInicial;
      }

      abonoExtra = escenario === 'sin_abonos'
        ? 0
        : Math.min(Number(abonosMap[periodo] || 0), Math.max(0, saldoInicial - amortizacion));
      saldoFinal = saldoInicial - amortizacion - abonoExtra;
      if (saldoFinal < 0) {
        saldoFinal = 0;
      }

      if (
        escenario === 'reducir_cuota'
        && abonoExtra > 0
        && periodoReal < cuotaTotal
        && saldoFinal > 0
      ) {
        cuotaActual = cuotaFija(saldoFinal, i, cuotaTotal - periodoReal);
      }
    }

    saldo = saldoFinal;
    totalIntereses += interes;
    totalPagado += cuota;

    filas.push({
      periodo,
      tipo: esGracia ? 'gracia' : 'amortizacion',
      saldoInicial: redondear(saldoInicial),
      cuota: redondear(cuota),
      intereses: redondear(interes),
      amortizacion: redondear(amortizacion),
      abonoExtra: redondear(abonoExtra),
      saldoFinal: redondear(saldoFinal)
    });

    if (!esGracia && saldoFinal <= 0) {
      break;
    }
  }

  return {
    conversion,
    filas,
    cuota: cuotaActual,
    totalIntereses: redondear(totalIntereses),
    totalPagado: redondear(totalPagado)
  };
}
