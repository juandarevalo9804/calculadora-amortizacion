# Formulario de amortización: cómo se obtiene cada campo

Guía para el programa. Primero se resume qué se agrega, modifica o quita, y luego se explica **cada campo**: qué es, de dónde sale su valor y qué fórmula usa.

---

## 1. Resumen de cambios

| Acción | Campo | Sección (div) |
|---|---|---|
| **Se queda** | Monto del préstamo | Datos del crédito |
| **Se queda** | Plazo en cuotas | Datos del crédito |
| **Se queda** | Periodicidad de pago | Datos del crédito |
| **Se queda** | Momento del pago (vencida/anticipada) | Opciones |
| **Se queda** | Abonos extra (periodo, valor, tipo) | Abonos extra |
| **Se queda** | Período de gracia (activar, número de periodos, tratamiento) | Período de gracia |
| **Se modifica** | "Tipo" de tasa: solo **Efectiva** o **Nominal** | Tasa de interés |
| **Se agrega** | **Periodo** de la tasa (Anual, Semestral, Cuatrimestral, Trimestral, Bimestral, Mensual) | Tasa de interés |
| **Se agrega** | **Efecto del abono extra** (mantener plazo o mantener cuota) | Opciones |
| **Se agrega (opcional)** | Tasa **Vencida / Anticipada** | Tasa de interés |
| **Se agrega (opcional)** | **% financiado** (por defecto 100%) | Datos del crédito |
| **Se agrega** | Fila **periodo 0** en la tabla | Tabla de resultados |

---

## 2. Campos de entrada (lo que escribe el usuario)

### 2.1 Sección "Datos del crédito"

#### Monto del préstamo

- **Qué es:** el valor del bien o del crédito.
- **Cómo se usa:** si no hay % financiado, es directamente el préstamo P.
- **Fórmula:**

```
P = Monto * (% financiado / 100)
```

Ejemplo (moto): 4.000.000 con 60% financiado → P = 4.000.000 * 0,60 = **2.400.000**.

#### % financiado (nuevo, opcional)

- **Qué es:** la parte del monto que se financia. Por defecto 100.
- **Dónde se usa:** solo en el cálculo de P de arriba.

#### Plazo en cuotas

- **Qué es:** el número de cuotas **n**.
- **Cómo se obtiene si el enunciado da años:**

```
n = años * m_pago
```

Donde `m_pago` es el número de periodos por año de la periodicidad de pago (ver tabla de m más abajo).

Ejemplos:

| Enunciado | Cálculo | n |
|---|---|---|
| 3 años, cuotas cada 4 meses | 3 * 3 | 9 |
| 8 pagos trimestrales | dado | 8 |
| 24 cuotas mensuales | dado | 24 |

#### Periodicidad de pago

- **Qué es:** cada cuánto se paga una cuota. Define el periodo con el que se calcula todo (la tasa, la cuota, los intereses).
- **Cómo se usa:** aporta `m_pago` para convertir la tasa al periodo de pago.

**Tabla de m (periodos por año):**

| Periodo | Letra | m |
|---|---|---|
| Anual | A | 1 |
| Semestral | S | 2 |
| Cuatrimestral | C | 3 |
| Trimestral | T | 4 |
| Bimestral | B | 6 |
| Mensual | M | 12 |

---

### 2.2 Sección "Tasa de interés"

Solo existen dos tipos de tasa: **efectiva** y **nominal**. La "periódica" no es un tipo aparte, porque una tasa efectiva ya es la tasa del periodo. Por eso "10% periódico" se carga como **Efectiva + el periodo de la cuota**.

Los cuatro campos trabajan juntos para producir **una sola cosa**: la tasa periódica vencida del periodo de pago, `i_pago`, que es la que usa todo el programa.

#### Tipo (Efectiva / Nominal)

Define cómo se obtiene la tasa del periodo:

| Tipo | Qué significa | Fórmula |
|---|---|---|
| **Efectiva** | El valor ya es la tasa del periodo elegido | `i = valor / 100` |
| **Nominal** | El valor es una tasa anual repartida en m periodos | `i = (valor / 100) / m_tasa` |

Aquí `m_tasa` es el m del campo **Periodo** de la tasa.

Ejemplos:

| Tasa | Tipo | Periodo | Cálculo | i |
|---|---|---|---|---|
| 24,96% EA | Efectiva | Anual | 0,2496 | 0,2496 |
| 2% EM | Efectiva | Mensual | 0,02 | 0,02 |
| 37,10% NT | Nominal | Trimestral | 0,371 / 4 | 0,09275 |
| 37,10% CV | Nominal | Cuatrimestral | 0,371 / 3 | 0,123667 |
| 8% NS | Nominal | Semestral | 0,08 / 2 | 0,04 |

#### Valor

- **Qué es:** el número que da el enunciado (24,96; 37,10; 10...).
- **Cómo se usa:** se divide entre 100 para pasarlo a decimal, y si es nominal, se divide entre `m_tasa`.

#### Periodo de la tasa (nuevo)

- **Qué es:** el periodo al que pertenece la tasa (la letra A, S, C, T, M).
- **Cómo se usa:** aporta `m_tasa`. En una nominal es el número entre el que se divide, y en una efectiva indica a qué periodo corresponde la tasa.
- El programa forma la sigla solo: Efectiva + Anual = **EA**, Nominal + Trimestral = **NT**.

#### Vencida / Anticipada (nuevo, opcional)

- **Qué es:** si el interés se cobra al final (vencida) o al inicio (anticipada) del periodo.
- **Cómo se usa:** solo si es anticipada. El valor obtenido arriba es `d` y se pasa a vencida:

```
i = d / (1 - d)
```

Ejemplo: 24% NTA → d = 0,24 / 4 = 0,06 → i = 0,06 / 0,94 = **0,06383**.

Si es vencida, no se hace nada.

#### Tasa del periodo de pago (campo calculado: i_pago)

Es el resultado final de la sección. Se obtiene pasando `i` al periodo de la periodicidad de pago:

```
i_pago = (1 + i)^(m_tasa / m_pago) - 1
```

- Si el periodo de la tasa y el de pago son iguales, el exponente es 1 y `i_pago = i`.
- Si la tasa es de un periodo más largo que el de pago (anual → mensual), el exponente es una fracción.
- Si la tasa es de un periodo más corto (trimestral → cuatrimestral), el exponente es mayor que 1.

**Orden completo:**

```
valor  →  i (efectiva o nominal)  →  (si anticipada: d/(1-d))  →  i_pago
```

Ejemplos:

| Enunciado | i | Periodicidad de pago | i_pago |
|---|---|---|---|
| 24,96% EA | 0,2496 | Mensual | (1,2496)^(1/12) - 1 = 0,018742 |
| 37,10% NT | 0,09275 | Cuatrimestral | (1,09275)^(4/3) - 1 = 0,12554 |
| 37,10% CV | 0,123667 | Cuatrimestral | 0,123667 (exponente 1) |
| 10% periódico | 0,10 | Trimestral | 0,10 (exponente 1) |
| 34,5% EA | 0,345 | Mensual | (1,345)^(1/12) - 1 = 0,025007 |
| 8% NS | 0,04 | Trimestral | (1,04)^(2/4) - 1 = 0,019804 |

---

### 2.3 Sección "Opciones"

#### Momento del pago (se queda)

- **Qué es:** cuándo se paga la **cuota**: al final del periodo (vencida) o al inicio (anticipada).
- **Afecta:** la fórmula de la cuota (ver 3.1) y el cálculo del interés en la tabla (ver 3.3).
- **No confundir** con la tasa vencida/anticipada: la tasa indica cuándo se cobra el **interés**, y el momento del pago indica cuándo se paga la **cuota**. Son campos separados.

#### Efecto del abono extra (nuevo)

- **Qué es:** qué ocurre con el plan de pagos después de un abono extra a capital.
- **Opciones y fórmulas:**

**Mantener plazo (baja la cuota).** El saldo que queda se trata como un préstamo nuevo con las cuotas que faltan:

```
Saldo_nuevo = Saldo_k - Abono
A_nueva     = Saldo_nuevo * i / (1 - (1 + i)^-(n - k))
```

Donde `k` es el periodo del abono y `n - k` las cuotas que faltan. Si el pago es anticipado, se divide además entre `(1 + i)`.

**Mantener cuota (acorta el plazo).** La cuota no cambia, y se calcula cuántas cuotas faltan:

```
n_nuevo = -ln(1 - (Saldo_nuevo * i / A)) / ln(1 + i)
```

Normalmente da decimal, así que la última cuota queda más pequeña (se redondea hacia arriba el número de cuotas y se ajusta la última).

---

### 2.4 Sección "Abonos extra" (se queda)

Cada fila tiene tres campos:

| Campo | Qué es | Cómo se usa |
|---|---|---|
| **Periodo (k)** | En qué cuota se hace el abono | Es el periodo donde se suma el abono al pago |
| **Valor** | Cuánto se abona | Se suma al pago y va completo a capital |
| **Tipo** | "Único" (un solo abono) | Se aplica una vez en el periodo k |

Efecto en la tabla en el periodo k:

```
Pago         = A + Abono
Amortización = Pago - Interés        (el abono va completo a capital)
Saldo final  = Saldo inicial - Amortización
```

Después se aplica el "Efecto del abono extra" para recalcular la cuota o el plazo.

---

### 2.5 Sección "Período de gracia" (se queda)

Se conserva tal como está en el formulario.

#### Activar gracia

Habilita los dos campos siguientes. Si está desactivado, el cálculo es el normal (g = 0).

#### Número de periodos (g)

- **Qué es:** cuántos periodos iniciales no se amortiza capital.
- **Cómo se usa:** la cuota se calcula solo sobre los periodos restantes: `n_cuota = n - g`.

#### Tratamiento

| Tratamiento | Qué pasa en cada periodo de gracia | Saldo al terminar la gracia |
|---|---|---|
| **Se capitalizan** | No hay pago. El interés se suma al saldo | `P * (1 + i_pago)^g` |
| **Se pagan solo intereses** | Pago = saldo * i_pago. El capital no baja | `P` (sin cambio) |

Después de la gracia, la cuota se calcula con la fórmula de 3.1 usando:

```
P_cuota = saldo al terminar la gracia
n_cuota = n - g
```

Decide una interpretación para "Plazo en cuotas" y mantenla en todo el programa: puede ser el total de periodos (gracia + cuotas de pago) o solo las cuotas de pago.

---

## 3. Campos calculados (columnas y resultados)

Son los valores que genera el programa a partir de las entradas.

### 3.1 Cuota (A)

- **Qué es:** el pago fijo de cada periodo.
- **De dónde sale:** de igualar el préstamo con el valor presente de las n cuotas.

**Datos que necesita:** P (préstamo), `i = i_pago`, n.

**Cuota vencida** (pago al final de cada periodo). Se parte del valor presente de una anualidad vencida y se despeja A:

```
P = A * (1 - (1 + i)^-n) / i

A = P * i / (1 - (1 + i)^-n)
```

**Cuota anticipada** (pago al inicio de cada periodo). Cada cuota se paga un periodo antes, por eso el valor presente se multiplica por (1 + i):

```
P = A * (1 - (1 + i)^-n) / i * (1 + i)

A = P * i / ((1 - (1 + i)^-n) * (1 + i))
```

**Cómo se calcula, paso a paso:**

1. Obtener `i_pago` (sección 2.2).
2. Calcular `(1 + i)^-n`.
3. Calcular `1 - (1 + i)^-n`.
4. Calcular `P * i`.
5. Dividir el resultado del paso 4 entre el del paso 3.
6. Si el momento del pago es anticipado, dividir además entre `(1 + i)`.

Si `i = 0`, la fórmula divide entre cero y se usa `A = P / n`.

Ejemplos:

| Caso | P | i | n | Cuota |
|---|---|---|---|---|
| Moto, 37,10% NT | 2.400.000 | 0,12554 | 9 | ≈ 459.957 |
| Moto, 37,10% CV | 2.400.000 | 0,123667 | 9 | ≈ 456.724 |
| $200.000.000, 24,96% EA | 200.000.000 | 0,018742 | 24 | ≈ 10.424.140 |

### 3.2 Fila 0 (periodo 0)

Es el momento del desembolso. Solo lleva el saldo final:

```
Saldo final (periodo 0) = P
```

No hay interés, pago ni amortización.

### 3.3 Columnas de cada periodo (1 a n)

| Columna | Fórmula | Explicación |
|---|---|---|
| **Saldo inicial** | `Saldo final del periodo anterior` | El saldo final de una fila es el saldo inicial de la siguiente |
| **Interés** | `Saldo inicial * i_pago` | Lo que cobra el banco por el saldo del periodo |
| **Pago** | `A` | La cuota fija (en el periodo con abono, `A + Abono`) |
| **Amortización** | `Pago - Interés` | La parte del pago que reduce la deuda |
| **Saldo final** | `Saldo inicial - Amortización` | Lo que se debe después del pago |

**Con pago anticipado**, la cuota se paga al inicio del periodo, así que el interés se calcula sobre lo que queda después de pagar:

```
Interés      = (Saldo inicial - Pago) * i_pago
Amortización = Pago
Saldo final  = (Saldo inicial - Pago) + Interés
```

**Atajo para revisar:** cada amortización es la anterior multiplicada por (1 + i). Sirve para verificar la tabla, no para construirla.

### 3.4 Fila de totales

| Columna | Fórmula | Qué debe dar |
|---|---|---|
| **Total interés** | suma de la columna Interés | Costo total del crédito |
| **Total pagos** | suma de la columna Pago | Préstamo + total de intereses |
| **Total amortización** | suma de la columna Amortización | Igual al préstamo P |

Validaciones:

- El saldo final de la última fila debe ser 0 (o casi, por redondeo).
- `Total pagos = P + Total interés`.
- `Total amortización = P`.

---

## 4. Ejemplo completo: $200.000.000, 24 cuotas mensuales, 24,96% EA, abono de $38.000.000 en el mes 8

| Paso | Cálculo | Resultado |
|---|---|---|
| Tipo, valor, periodo | Efectiva, 24,96, Anual | i = 0,2496 |
| i_pago | (1,2496)^(1/12) - 1 | 0,018742 |
| Cuota | 200.000.000 * 0,018742 / (1 - (1,018742)^-24) | ≈ 10.424.140 |
| Saldo después de la cuota 8 | de la tabla | ≈ 142.956.510 |
| Saldo nuevo | 142.956.510 - 38.000.000 | ≈ 104.956.510 |
| Cuotas que faltan | 24 - 8 | 16 |
| Nueva cuota (mantener plazo) | 104.956.510 * 0,018742 / (1 - (1,018742)^-16) | ≈ 7.653.246 |

Si redondeas i a 0,01874 y usas el saldo 104.955.479,4, la nueva cuota da ≈ 7.653.044. La diferencia es solo redondeo.

---

## 5. Orden completo de cálculo en el programa

1. Leer los campos de la tasa y calcular `i_pago` (sección 2.2).
2. Calcular P = Monto * % financiado.
3. Calcular n (si el plazo viene en años: años * m_pago).
4. Si hay período de gracia, ajustar el saldo y n (sección 2.5).
5. Calcular la cuota A (sección 3.1).
6. Generar la fila 0 y las filas 1 a n (secciones 3.2 y 3.3).
7. En el periodo de cada abono: sumar el abono al pago y aplicar el "Efecto del abono extra" (sección 2.3).
8. Calcular los totales y validar (sección 3.4).

---

## 6. Código de ejemplo (JavaScript)

```javascript
const PERIODOS = {
  anual: 1,
  semestral: 2,
  cuatrimestral: 3,
  trimestral: 4,
  bimestral: 6,
  mensual: 12,
};

// Tasa periódica vencida del periodo de pago (decimal)
function tasaPeriodoPago(tipo, valor, periodoTasa, periodoPago, anticipada = false) {
  const mTasa = PERIODOS[periodoTasa];
  const mPago = PERIODOS[periodoPago];

  let i = valor / 100;
  if (tipo === "nominal") i = i / mTasa;        // nominal -> periódica
  if (anticipada) i = i / (1 - i);              // anticipada -> vencida

  return Math.pow(1 + i, mTasa / mPago) - 1;    // al periodo de pago
}

// Cuota fija
function cuota(P, i, n, anticipada = false) {
  if (i === 0) return P / n;
  let A = (P * i) / (1 - Math.pow(1 + i, -n));
  if (anticipada) A = A / (1 + i);
  return A;
}

// Ejemplos
tasaPeriodoPago("efectiva", 24.96, "anual", "mensual");              // ~0.018742
tasaPeriodoPago("nominal", 37.10, "trimestral", "cuatrimestral");    // ~0.12554
cuota(200000000, 0.018742, 24);                                      // ~10.424.140
```

---

## 7. Casos de prueba para validar el programa

| Caso | Entrada | Resultado esperado |
|---|---|---|
| Moto, 37,10% NT | P = 2.400.000, n = 9, cuatrimestral | i ≈ 12,554%, cuota ≈ 459.957 |
| Moto, 37,10% CV | P = 2.400.000, n = 9, cuatrimestral | i ≈ 12,3667%, cuota ≈ 456.724 |
| 24,96% EA, abono mes 8 | P = 200.000.000, n = 24, mensual, abono 38.000.000 | cuota ≈ 10.424.140, nueva cuota ≈ 7.653.246 |
| 10% periódico, abono periodo 3 | P = 3.000.000, n = 8, trimestral, abono 500.000 | cuota inicial ≈ 562.324 (mantener plazo) |
| Conversión | 10% ES a TV | 19,52% TV |

Los resultados pueden variar en las unidades según el redondeo.
