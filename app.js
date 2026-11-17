const elementos = {
  capital: document.getElementById('capital'),
  cuotas: document.getElementById('cuotas'),
  periodicidad: document.getElementById('periodicidad'),
  tipoTasa: document.getElementById('tipoTasa'),
  tasaValor: document.getElementById('tasaValor'),
  periodoTasa: document.getElementById('periodoTasa'),
  capitalizacion: document.getElementById('capitalizacion'),
  labelPeriodoTasa: document.getElementById('labelPeriodoTasa'),
  labelCapitalizacion: document.getElementById('labelCapitalizacion'),
  momentoPago: document.getElementById('momentoPago'),
  activarGracia: document.getElementById('activarGracia'),
  graciaPeriodos: document.getElementById('graciaPeriodos'),
  tratamientoGracia: document.getElementById('tratamientoGracia'),
  listaAbonos: document.getElementById('listaAbonos'),
  agregarAbono: document.getElementById('agregarAbono'),
  btnCalcular: document.getElementById('btnCalcular'),
  escenarioActivo: document.getElementById('escenarioActivo'),
  scenarioGrid: document.getElementById('scenarioGrid'),
  mejorEscenario: document.getElementById('mejorEscenario'),
  tablaBody: document.getElementById('tablaBody'),
  totalesTabla: document.getElementById('totalesTabla'),
  graficaSaldo: document.getElementById('graficaSaldo'),
  rangoGrafica: document.getElementById('rangoGrafica'),
  graficaAnterior: document.getElementById('graficaAnterior'),
  graficaSiguiente: document.getElementById('graficaSiguiente'),
  valorEA: document.getElementById('valorEA'),
  valorCuota: document.getElementById('valorCuota'),
  valorCuotaBase: document.getElementById('valorCuotaBase'),
  valorIntereses: document.getElementById('valorIntereses'),
  resumenSinAbonos: document.getElementById('resumenSinAbonos'),
  resumenReducirPlazo: document.getElementById('resumenReducirPlazo'),
  resumenReducirCuota: document.getElementById('resumenReducirCuota'),
  conversionTexto: document.getElementById('conversionTexto')
};

let paginaGrafica = 0;
let filasGraficaActuales = [];
const PUNTOS_POR_PAGINA = 6;



function actualizarCamposTasa() {
  const tipo = elementos.tipoTasa.value;
  const esNominal = tipo === 'nominal_vencida' || tipo === 'nominal_anticipada';
  elementos.labelCapitalizacion.style.display = esNominal ? '' : 'none';
}

function crearFilaAbono(periodo = 1, valor = 1000000) {
  const fila = document.createElement('div');
  fila.className = 'abono-fila';

  const inputPeriodo = document.createElement('input');
  inputPeriodo.type = 'number';
  inputPeriodo.value = periodo;
  inputPeriodo.min = '1';
  inputPeriodo.placeholder = 'Per.';

  const inputValor = document.createElement('input');
  inputValor.type = 'number';
  inputValor.value = valor;
  inputValor.min = '0';
  inputValor.step = '1000';
  inputValor.placeholder = 'Monto';

  const inputFrecuencia = document.createElement('select');
  inputFrecuencia.innerHTML = `
    <option value="unico">Único</option>
    <option value="periodico">Periódico</option>
  `;

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'abono-borrar';
  boton.textContent = '×';
  boton.addEventListener('click', () => {
    fila.remove();
    calcular();
  });
  fila.addEventListener('input', calcular);
  fila.addEventListener('change', calcular);

  fila.appendChild(inputPeriodo);
  fila.appendChild(inputValor);
  fila.appendChild(inputFrecuencia);
  fila.appendChild(boton);
  return fila;
}

function leerAbonos() {
  const filas = [...document.querySelectorAll('.abono-fila')];
  return filas.map((fila) => {
    const inputs = fila.querySelectorAll('input');
    const periodo = Number(inputs[0].value || 0);
    const valor = Number(inputs[1].value || 0);
    return {
      periodo,
      valor,
      frecuencia: fila.querySelector('select').value
    };
  }).filter((item) => item.periodo > 0 && item.valor > 0);
}

function dibujarTabla(filas) {
  const tabla = elementos.tablaBody;
  tabla.innerHTML = '';
  elementos.totalesTabla.innerHTML = '';

  if (!filas.length) {
    tabla.innerHTML = '<tr><td colspan="7">No hay datos para mostrar.</td></tr>';
    return;
  }

  const cuotasTotales = Number(elementos.cuotas.value || 0);
  const saldoInicial = Number(filas[0]?.saldoInicial ?? 0);
  const filaCero = {
    periodo: 0,
    saldo: saldoInicial,
    intereses: 0,
    cuota: 0,
    abonoExtra: 0,
    amortizacion: 0,
    cuotasPorPagar: cuotasTotales
  };

  const filasConCero = [filaCero, ...filas];
  let totalIntereses = 0;
  let totalAbono = 0;
  let totalCuota = 0;

  filasConCero.forEach((fila) => {
    const tr = document.createElement('tr');
    const saldo = fila.saldo ?? fila.saldoFinal ?? fila.saldoInicial ?? 0;
    const cuota = Number(fila.cuota || 0);
    const interes = Number(fila.intereses || 0);
    const abono = Number(fila.abonoExtra || 0);
    const amortizacion = Number(fila.amortizacion || 0);
    const cuotasPorPagar = Math.max(0, cuotasTotales - (Number(fila.periodo) || 0));

    totalIntereses += interes;
    totalAbono += abono;
    totalCuota += cuota + abono;

    if (fila.periodo === 0) {
      tr.innerHTML = `
        <td>0</td>
        <td>${formatMoney(saldo)}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>${cuotasTotales}</td>
      `;
    } else {
      if (fila.tipo === 'gracia') tr.classList.add('gracia');
      if (fila.abonoExtra > 0) tr.classList.add('extra');

      tr.innerHTML = `
        <td>${fila.periodo}</td>
        <td>${formatMoney(saldo)}</td>
        <td>${formatMoney(interes)}</td>
        <td>${formatMoney(cuota + abono)}</td>
        <td>${formatMoney(abono)}</td>
        <td>${formatMoney(amortizacion + abono)}</td>
        <td>${cuotasPorPagar}</td>
      `;
    }

    tabla.appendChild(tr);
  });

  const totalRow = document.createElement('tr');
  totalRow.className = 'total-row';
  totalRow.innerHTML = `
    <td>Total</td>
    <td></td>
    <td>${formatMoney(totalIntereses)}</td>
    <td>${formatMoney(totalCuota)}</td>
    <td>${formatMoney(totalAbono)}</td>
    <td></td>
    <td></td>
  `;
  tabla.appendChild(totalRow);
}

function dibujarGraficaSaldo(filas) {
  filasGraficaActuales = filas;
  const valores = filas.length
    ? [
      { periodo: 0, saldo: Number(filas[0].saldoInicial || 0) },
      ...filas.map((fila) => ({
        periodo: Number(fila.periodo),
        saldo: Number(fila.saldoFinal || 0)
      }))
    ]
    : [];
  const svg = elementos.graficaSaldo;

  if (!valores.length) {
    elementos.rangoGrafica.textContent = 'Sin datos';
    svg.innerHTML = '';
    elementos.graficaAnterior.disabled = true;
    elementos.graficaSiguiente.disabled = true;
    return;
  }

  const maxPagina = Math.max(0, Math.ceil((valores.length - PUNTOS_POR_PAGINA) / (PUNTOS_POR_PAGINA - 1)));
  paginaGrafica = Math.min(paginaGrafica, maxPagina);
  const inicio = paginaGrafica * (PUNTOS_POR_PAGINA - 1);
  const puntos = valores.slice(inicio, inicio + PUNTOS_POR_PAGINA);
  const primerPeriodo = puntos[0].periodo;
  const ultimoPeriodo = puntos[puntos.length - 1].periodo;

  elementos.rangoGrafica.textContent = `Periodo ${primerPeriodo} - Periodo ${ultimoPeriodo}`;
  elementos.graficaAnterior.disabled = paginaGrafica === 0;
  elementos.graficaSiguiente.disabled = paginaGrafica >= maxPagina;

  const ancho = 960;
  const alto = 360;
  const izquierda = 160;
  const derecha = 28;
  const arriba = 24;
  const abajo = 56;
  const anchoTrazado = ancho - izquierda - derecha;
  const altoTrazado = alto - arriba - abajo;
  const saldos = puntos.map((punto) => punto.saldo);
  let minimo = Math.min(...saldos);
  let maximo = Math.max(...saldos);
  const rango = maximo - minimo;
  const margen = rango === 0 ? Math.max(maximo * 0.05, 1) : rango * 0.1;
  minimo = Math.max(0, minimo - margen);
  maximo += margen;

  const x = (indice) => izquierda + (puntos.length === 1 ? anchoTrazado / 2 : (indice / (puntos.length - 1)) * anchoTrazado);
  const y = (saldo) => arriba + ((maximo - saldo) / (maximo - minimo)) * altoTrazado;
  const puntosXY = puntos.map((punto, indice) => ({ ...punto, x: x(indice), y: y(punto.saldo) }));
  let linea = `M ${puntosXY[0].x} ${puntosXY[0].y}`;
  for (let indice = 1; indice < puntosXY.length; indice += 1) {
    linea += ` H ${puntosXY[indice].x} V ${puntosXY[indice].y}`;
  }
  const area = `${linea} L ${puntosXY[puntosXY.length - 1].x} ${arriba + altoTrazado} L ${puntosXY[0].x} ${arriba + altoTrazado} Z`;
  const marcas = Array.from({ length: 5 }, (_, indice) => {
    const saldo = maximo - ((maximo - minimo) * indice) / 4;
    const posicion = y(saldo);
    return `
      <line class="chart-grid-line" x1="${izquierda}" y1="${posicion}" x2="${ancho - derecha}" y2="${posicion}" />
      <text class="chart-axis-label" x="${izquierda - 12}" y="${posicion + 4}" text-anchor="end">${formatMoney(saldo)}</text>
    `;
  }).join('');
  const etiquetas = puntosXY.map((punto) => `
    <text class="chart-axis-label" x="${punto.x}" y="${alto - 20}" text-anchor="middle">Periodo ${punto.periodo}</text>
  `).join('');
  const circulos = puntosXY.map((punto) => `
    <circle class="chart-point" cx="${punto.x}" cy="${punto.y}" r="8">
      <title>Periodo ${punto.periodo}: ${formatMoney(punto.saldo)}</title>
    </circle>
  `).join('');

  svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
  svg.innerHTML = `
    ${marcas}
    <path class="chart-area" d="${area}" />
    <path class="chart-line" d="${linea}" />
    ${circulos}
    ${etiquetas}
  `;
}

function actualizarResumen(data) {
  const conversion = data.conversion;
  const sinAbonos = data.sinAbonos;
  const plazo = data.reducirPlazo;
  const cuota = data.reducirCuota;
  const tarjetas = {
    sin_abonos: { resultado: sinAbonos, elemento: elementos.resumenSinAbonos, ahorro: 0 },
    reducir_plazo: {
      resultado: plazo,
      elemento: elementos.resumenReducirPlazo,
      ahorro: sinAbonos.totalIntereses - plazo.totalIntereses
    },
    reducir_cuota: {
      resultado: cuota,
      elemento: elementos.resumenReducirCuota,
      ahorro: sinAbonos.totalIntereses - cuota.totalIntereses
    }
  };

  elementos.valorEA.textContent = `${(conversion.ea * 100).toFixed(2)}%`;
  elementos.valorCuota.textContent = `${(conversion.i * 100).toFixed(4)}%`;
  elementos.valorCuotaBase.textContent = formatMoney(sinAbonos.cuota || 0);
  elementos.valorIntereses.textContent = formatMoney(sinAbonos.totalIntereses || 0);

  Object.entries(tarjetas).forEach(([escenario, datos]) => {
    const primeraCuota = datos.resultado.filas.find((fila) => fila.tipo === 'amortizacion');
    const cuotaRegular = escenario === 'reducir_plazo'
      ? datos.resultado.cuota
      : (primeraCuota?.cuota ?? datos.resultado.cuota);
    const ahorro = escenario === 'sin_abonos'
      ? ''
      : `<div><span>Ahorro en intereses</span><strong class="scenario-savings">${formatMoney(datos.ahorro)}</strong></div>`;

    datos.elemento.innerHTML = `
      <div class="scenario-metrics">
        <div><span>Cuotas totales</span><strong>${datos.resultado.filas.length}</strong></div>
        <div><span>Cuota regular final</span><strong>${formatMoney(cuotaRegular || 0)}</strong></div>
        <div><span>Total intereses</span><strong>${formatMoney(datos.resultado.totalIntereses || 0)}</strong></div>
        ${ahorro}
      </div>
    `;
  });

  const seleccionado = elementos.escenarioActivo.value;
  elementos.scenarioGrid.querySelectorAll('.scenario-card').forEach((tarjeta) => {
    const activa = tarjeta.dataset.scenario === seleccionado;
    tarjeta.classList.toggle('selected', activa);
    tarjeta.setAttribute('aria-pressed', String(activa));
  });

  const hayAbonos = data.hayAbonos;
  if (!hayAbonos) {
    elementos.mejorEscenario.textContent = 'Agrega un abono para comparar cuál escenario genera mayor ahorro en intereses.';
  } else {
    const diferenciaIntereses = plazo.totalIntereses - cuota.totalIntereses;
    const diferenciaPeriodos = Math.abs(plazo.filas.length - cuota.filas.length);
    if (Math.abs(diferenciaIntereses) < 0.01) {
      elementos.mejorEscenario.innerHTML = 'Reducir el plazo y reducir la cuota generan un ahorro similar en intereses. Elige el escenario según prefieras terminar antes o tener pagos más bajos.';
    } else if (diferenciaIntereses < 0) {
      elementos.mejorEscenario.innerHTML = `Reducir el plazo te ahorra <strong>${formatMoney(-diferenciaIntereses)}</strong> más en intereses que reducir la cuota y terminas de pagar <strong>${diferenciaPeriodos} periodos antes</strong>. Reducir la cuota te deja pagos más bajos (útil si necesitas liberar flujo de caja).`;
    } else {
      elementos.mejorEscenario.innerHTML = `Reducir la cuota te ahorra <strong>${formatMoney(diferenciaIntereses)}</strong> más en intereses que reducir el plazo. Reducir el plazo te permite terminar de pagar antes y reducir la cuota deja pagos más bajos.`;
    }
  }

  const texto = `
    Tasa periódica vencida del periodo de pago: ${(conversion.i * 100).toFixed(4)}%<br>
    Tasa periódica anticipada equivalente: ${(conversion.d * 100).toFixed(4)}%<br>
    Tasa efectiva anual (EA): ${(conversion.ea * 100).toFixed(4)}%<br>
    Tasa nominal vencida equivalente: ${(conversion.nominalVencida * 100).toFixed(4)}%<br>
    Tasa nominal anticipada equivalente: ${(conversion.nominalAnticipada * 100).toFixed(4)}%
  `;
  elementos.conversionTexto.innerHTML = texto;
}

function calcular() {
  const tipoTasa = elementos.tipoTasa.value;
  const esPeriodica = tipoTasa === 'periodica_vencida' || tipoTasa === 'periodica_anticipada';
  const periodicidad = Number(elementos.periodicidad.value || 12);
  const capitalizacion = esPeriodica
    ? periodicidad
    : Number(elementos.capitalizacion.value || 1);

  const config = {
    capital: Number(elementos.capital.value || 0),
    cuotas: Number(elementos.cuotas.value || 0),
    tasa: Number(elementos.tasaValor.value || 0),
    tipoTasa,
    capitalizacion,
    periodicidad,
    momentoPago: elementos.momentoPago.value,
    gracia: elementos.activarGracia.checked ? Number(elementos.graciaPeriodos.value || 0) : 0,
    tratamientoGracia: elementos.tratamientoGracia.value,
    abonos: leerAbonos(),
    escenario: elementos.escenarioActivo.value
  };

  const sinAbonos = simularCredito({ ...config, escenario: 'sin_abonos', abonos: [] });
  const reducirPlazo = simularCredito({ ...config, escenario: 'reducir_plazo' });
  const reducirCuota = simularCredito({ ...config, escenario: 'reducir_cuota' });

  const escenarioSeleccionado = elementos.escenarioActivo.value;
  let filasActivas = sinAbonos.filas;
  if (escenarioSeleccionado === 'reducir_plazo') filasActivas = reducirPlazo.filas;
  if (escenarioSeleccionado === 'reducir_cuota') filasActivas = reducirCuota.filas;

  dibujarTabla(filasActivas);
  dibujarGraficaSaldo(filasActivas);
  actualizarResumen({
    conversion: sinAbonos.conversion,
    sinAbonos,
    reducirPlazo,
    reducirCuota,
    hayAbonos: config.abonos.length > 0
  });
}

elementos.agregarAbono.addEventListener('click', () => {
  elementos.listaAbonos.appendChild(crearFilaAbono());
});

elementos.btnCalcular.addEventListener('click', calcular);

elementos.tipoTasa.addEventListener('change', () => {
  actualizarCamposTasa();
  calcular();
});

elementos.escenarioActivo.addEventListener('change', calcular);
elementos.graficaAnterior.addEventListener('click', () => {
  if (paginaGrafica === 0) return;
  paginaGrafica -= 1;
  dibujarGraficaSaldo(filasGraficaActuales);
});

elementos.graficaSiguiente.addEventListener('click', () => {
  paginaGrafica += 1;
  dibujarGraficaSaldo(filasGraficaActuales);
});

function seleccionarEscenario(escenario) {
  elementos.escenarioActivo.value = escenario;
  calcular();
}

elementos.scenarioGrid.addEventListener('click', (evento) => {
  const tarjeta = evento.target.closest('.scenario-card');
  if (tarjeta) seleccionarEscenario(tarjeta.dataset.scenario);
});

elementos.scenarioGrid.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Enter' && evento.key !== ' ') return;
  const tarjeta = evento.target.closest('.scenario-card');
  if (!tarjeta) return;
  evento.preventDefault();
  seleccionarEscenario(tarjeta.dataset.scenario);
});

elementos.listaAbonos.appendChild(crearFilaAbono(8, 38000000));
actualizarCamposTasa();
calcular();
