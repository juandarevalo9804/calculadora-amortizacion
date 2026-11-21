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

class TasaConversionError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'TasaConversionError';
  }
}

function convertirTasa(
  valor,
  tipo,
  capitalizacion = 12,
  periodicidadPago = 12,
  tipoPeriodo = 'vencida'
) {
  const tasa = Number(valor) / 100;
  const tipoNorm = normalizarTipo(tipo);
  const mTasa = Number(capitalizacion);
  const mPago = Number(periodicidadPago);
  if (!Number.isFinite(mTasa) || !Number.isFinite(mPago) || mTasa <= 0 || mPago <= 0) {
    throw new TasaConversionError('Los periodos de tasa y pago deben ser mayores que cero');
  }
  if (!Number.isFinite(tasa) || tasa < 0) throw new TasaConversionError('La tasa debe ser un número positivo');
  if (tipoNorm !== 'efectiva' && tipoNorm !== 'nominal') {
    throw new TasaConversionError('Tipo de tasa no soportado: ' + tipo);
  }
  if (tipoPeriodo !== 'vencida' && tipoPeriodo !== 'anticipada') {
    throw new TasaConversionError('El periodo de la tasa debe ser vencido o anticipado');
  }

  let tasaPeriodo = tipoNorm === 'nominal' ? tasa / mTasa : tasa;

  if (tipoPeriodo === 'anticipada') {
    if (tasaPeriodo >= 1) {
      throw new TasaConversionError('La tasa anticipada debe ser menor que 100% en su periodo');
    }
    tasaPeriodo = tasaPeriodo / (1 - tasaPeriodo);
  }

  if (!Number.isFinite(tasaPeriodo) || 1 + tasaPeriodo <= 0) {
    throw new TasaConversionError('La tasa vencida equivalente no es válida');
  }

  const i = Math.pow(1 + tasaPeriodo, mTasa / mPago) - 1;
  const ea = Math.pow(1 + i, mPago) - 1;
  if (!Number.isFinite(i) || !Number.isFinite(ea)) {
    throw new TasaConversionError('No se pudo convertir la tasa con los periodos indicados');
  }
  const d = i / (1 + i);
  const nominalVencida = i * mPago;
  const nominalAnticipada = d * mPago;

  return {
    valorOriginal: tasa,
    tasaPeriodica: tasaPeriodo,
    ea,
    i,
    d,
    nominalVencida,
    nominalAnticipada,
    capitalizacion: mTasa,
    periodicidadPago: mPago
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
  tasaAnticipada = false,
  momentoPago,
  gracia = 0,
  tratamientoGracia = 'capitaliza',
  abonos = [],
  escenario = 'sin_abonos'
}) {
  const capitalBase = Number(capital) || 0;
  const cuotaTotal = Number(cuotas) || 0;
  if (capitalBase <= 0 || cuotaTotal <= 0) return { filas: [], conversion: null, cuota: 0, totalIntereses: 0 };

  const conversion = convertirTasa(
    tasa,
    tipoTasa,
    capitalizacion,
    periodicidad,
    tasaAnticipada ? 'anticipada' : 'vencida'
  );
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
      if (periodoReal === 1) {
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
        (escenario === 'reducir_cuota' || escenario === 'mantener_cuota')
        && abonoExtra > 0
        && periodoReal < cuotaTotal
        && saldoFinal > 0
      ) {
        cuotaActual = cuotaFija(
          saldoFinal,
          i,
          cuotaTotal - periodoReal,
          momentoPago === 'anticipada'
        );
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    convertirTasa,
    cuotaFija,
    obtenerAbonosMap,
    simularCredito
  };
}
