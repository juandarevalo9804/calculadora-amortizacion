# Abreviaciones de las tasas de interés

Guía de las siglas que aparecen en los enunciados (EA, EM, NT, MV...), qué significan y cómo se usan en el cálculo.

---

## 1. Cómo se lee una sigla

Toda sigla responde a **tres preguntas**:

| Pregunta | Opciones |
|---|---|
| ¿Es **efectiva** o **nominal**? | E = efectiva, N = nominal |
| ¿De qué **periodo** es? | A, S, C, T, B, M... |
| ¿Se cobra al **final** o al **inicio** del periodo? | V = vencida, A = anticipada |

Ejemplos de lectura:

| Sigla | Se lee | Tipo | Periodo | Cobro |
|---|---|---|---|---|
| **EA** | Efectiva anual | Efectiva | Anual | Vencida |
| **NT** | Nominal trimestral | Nominal | Trimestral | Vencida |
| **NTA** | Nominal trimestral anticipada | Nominal | Trimestral | Anticipada |

---

## 2. Periodos y su m (periodos por año)

| Periodo | Letra | m | Duración |
|---|---|---|---|
| Anual | A | 1 | 12 meses |
| Semestral | S | 2 | 6 meses |
| Cuatrimestral | C | 3 | 4 meses |
| Trimestral | T | 4 | 3 meses |
| Bimestral | B | 6 | 2 meses |
| Mensual | M | 12 | 1 mes |
| Quincenal | Q | 24 | 15 días |
| Semanal | (S) | 52 | 7 días |
| Diaria | D | 360 o 365 | 1 día |

Para el año de días, tu profesor define si usa 360 (año comercial) o 365.

---

## 3. Tasas efectivas (E)

La tasa **ya es la del periodo**. No se divide, se usa directamente como `i`.

| Sigla | Se lee | Periodo | m | Qué es |
|---|---|---|---|---|
| **EA** | Efectiva anual | Anual | 1 | Lo que crece la plata en 1 año |
| **ES** | Efectiva semestral | Semestral | 2 | Lo que crece en 1 semestre |
| **EC** | Efectiva cuatrimestral | Cuatrimestral | 3 | Lo que crece en 1 cuatrimestre |
| **ET** | Efectiva trimestral | Trimestral | 4 | Lo que crece en 1 trimestre |
| **EB** | Efectiva bimestral | Bimestral | 6 | Lo que crece en 1 bimestre |
| **EM** | Efectiva mensual | Mensual | 12 | Lo que crece en 1 mes |
| **EQ** | Efectiva quincenal | Quincenal | 24 | Lo que crece en 15 días |
| **ED** | Efectiva diaria | Diaria | 360/365 | Lo que crece en 1 día |

**Fórmula:**

```
i = valor / 100
```

Ejemplo: 2% EM → i = 0,02 mensual (2% **por mes**).

---

## 4. Tasas nominales vencidas (N)

La tasa es **anual** y está repartida en m periodos. Hay que dividirla entre m para obtener la tasa del periodo.

Se pueden escribir de dos formas:

| Forma "N + periodo" | Forma "periodo + V" | Se lee | m |
|---|---|---|---|
| **NA** | **AV** | Nominal anual vencida | 1 |
| **NS** | **SV** | Nominal semestral vencida | 2 |
| **NC** | **CV** | Nominal cuatrimestral vencida | 3 |
| **NT** | **TV** | Nominal trimestral vencida | 4 |
| **NB** | **BV** | Nominal bimestral vencida | 6 |
| **NM** | **MV** | Nominal mensual vencida | 12 |
| **NQ** | **QV** | Nominal quincenal vencida | 24 |
| **ND** | **DV** | Nominal diaria vencida | 360/365 |

**Fórmula:**

```
i = (valor / 100) / m
```

Ejemplos:

| Tasa | Cálculo | i del periodo |
|---|---|---|
| 37,10% NT | 0,371 / 4 | 0,09275 trimestral |
| 37,10% CV | 0,371 / 3 | 0,123667 cuatrimestral |
| 24% MV | 0,24 / 12 | 0,02 mensual |
| 8% NS | 0,08 / 2 | 0,04 semestral |

---

## 5. Tasas anticipadas (A al final)

El interés se cobra al **inicio** del periodo. La sigla termina en **A** (o lleva "anticipada" escrito). Antes de usarla hay que pasarla a vencida.

| Sigla | Se lee | m |
|---|---|---|
| **EAA** | Efectiva anual anticipada | 1 |
| **ESA** | Efectiva semestral anticipada | 2 |
| **ETA** | Efectiva trimestral anticipada | 4 |
| **EMA** | Efectiva mensual anticipada | 12 |
| **NSA** o **SA** | Nominal semestral anticipada | 2 |
| **NTA** o **TA** | Nominal trimestral anticipada | 4 |
| **NMA** o **MA** | Nominal mensual anticipada | 12 |

**Fórmulas:**

```
Nominal anticipada -> periódica anticipada:   d = (valor / 100) / m
Efectiva anticipada:                          d = valor / 100

Anticipada -> vencida:                        i = d / (1 - d)
Vencida -> anticipada:                        d = i / (1 + i)
```

Ejemplo: 24% NTA → d = 0,24 / 4 = 0,06 → i = 0,06 / 0,94 = **0,06383** trimestral vencida.

---

## 6. Cómo reconocer cada una en un enunciado

| Si dice... | Es... |
|---|---|
| "24,96% EA", "5% ET", "2% EM" | Efectiva (vencida) |
| "24% NMV", "24% MV", "24% mes vencido" | Nominal vencida |
| "24% NMA", "24% MA", "24% mes anticipado" | Nominal anticipada |
| "10% periódico" | Efectiva del periodo de pago |
| "30% de interés anual" (sin más) | Efectiva anual (EA) |
| "8% nominal" (sin periodo) | Ambigua: se asume que el periodo coincide con las cuotas del ejercicio (confirma con tu profesor) |

Regla rápida:

- Empieza por **E** → efectiva, no se divide.
- Empieza por **N** o termina en **V** → nominal vencida, se divide entre m.
- Termina en **A** (como NTA, MA) → anticipada, se pasa a vencida con `i = d / (1 - d)`.

---

## 7. Tasa periódica

No es un tipo de tasa aparte. Es la **tasa de un solo periodo** y se obtiene así:

| Si te dan... | La tasa periódica es... |
|---|---|
| Efectiva (EA, EM, ET...) | La misma tasa |
| Nominal (NT, MV, CV...) | valor / m |
| Anticipada | d / (1 - d) |

Por eso, "10% periódico para el periodo" se trata como una **efectiva del periodo de pago**.

---

## 8. Conversión entre tasas (cambio de periodo)

Para pasar una tasa efectiva de un periodo a otro:

```
i_llegada = (1 + i_partida)^(m_partida / m_llegada) - 1
```

Cadena completa para cualquier conversión:

```
nominal  ->  periódica  ->  (anticipada a vencida)  ->  otro periodo  ->  nominal
 j/m                         d/(1-d)                    (1+i)^(m1/m2)-1     i*m
```

Ejemplos con las siglas de la guía:

| Conversión | Cadena | Resultado |
|---|---|---|
| 10% ES → TV | i_s → i_t → j_t | 19,52% TV |
| 18% SV → NM | j_s → i_s → i_m → j_m | 17,36% NM |
| 36% NT → EM | j_t → i_t → i_m | 2,914% EM |
| 25% MV → CM | j_m → i_m → i_c → j_c | 25,79% CM (25,74% si redondeas i_m a 2,08%) |

---

## 9. Símbolos usados en las fórmulas

| Símbolo | Significado |
|---|---|
| **i** | Tasa periódica vencida (efectiva del periodo) |
| **j** | Tasa nominal vencida |
| **d** | Tasa periódica anticipada |
| **j_a** | Tasa nominal anticipada |
| **m** | Periodos por año |
| **i_s, i_t, i_m, i_c** | Efectiva semestral, trimestral, mensual, cuatrimestral |
| **j_s, j_t, j_m, j_c** | Nominal semestral, trimestral, mensual, cuatrimestral |

---

## 10. Tabla resumen de todas las siglas

| Sigla | Significado | Tipo | Periodo | Cobro | m | Qué haces |
|---|---|---|---|---|---|---|
| EA | Efectiva anual | Efectiva | Anual | Vencida | 1 | i = valor |
| ES | Efectiva semestral | Efectiva | Semestral | Vencida | 2 | i = valor |
| EC | Efectiva cuatrimestral | Efectiva | Cuatrimestral | Vencida | 3 | i = valor |
| ET | Efectiva trimestral | Efectiva | Trimestral | Vencida | 4 | i = valor |
| EM | Efectiva mensual | Efectiva | Mensual | Vencida | 12 | i = valor |
| NS / SV | Nominal semestral | Nominal | Semestral | Vencida | 2 | i = valor / 2 |
| NC / CV | Nominal cuatrimestral | Nominal | Cuatrimestral | Vencida | 3 | i = valor / 3 |
| NT / TV | Nominal trimestral | Nominal | Trimestral | Vencida | 4 | i = valor / 4 |
| NM / MV | Nominal mensual | Nominal | Mensual | Vencida | 12 | i = valor / 12 |
| NSA / SA | Nominal semestral anticipada | Nominal | Semestral | Anticipada | 2 | d = valor / 2; i = d/(1-d) |
| NTA / TA | Nominal trimestral anticipada | Nominal | Trimestral | Anticipada | 4 | d = valor / 4; i = d/(1-d) |
| NMA / MA | Nominal mensual anticipada | Nominal | Mensual | Anticipada | 12 | d = valor / 12; i = d/(1-d) |
