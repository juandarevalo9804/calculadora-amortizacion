# Aclaraciones: tasas, periodicidad y campos de la página

## 1. Qué campos se usan para la tasa

La página usa **una sola caja de tasa** y dos listas desplegables:

| Campo | Para qué sirve | ¿Siempre aparece? |
|---|---|---|
| **Tasa (%)** | El número que escribes (por ejemplo 24,96) | Sí |
| **Tipo de tasa** | Indica qué clase de tasa es: EA, nominal vencida, nominal anticipada, periódica vencida o periódica anticipada | Sí |
| **Periodo de capitalización** (`k`) | Indica cada cuánto se capitalizan los intereses o a qué periodo se refiere la tasa | **No.** Solo aparece si el tipo no es EA |

---

## 2. Qué tasas necesitan el campo adicional

| Tipo de tasa | ¿Necesita "Periodo de capitalización"? | Qué función cumple ese campo |
|---|---|---|
| **Efectiva anual (EA)** | **No** | Ninguna. La EA ya es una tasa anual con la capitalización incluida |
| **Nominal vencida** | **Sí** | Dice en cuántos periodos se reparte la tasa anual. La página divide la tasa entre `k` (`p = j / k`) y luego capitaliza `k` veces para llegar a la EA |
| **Nominal anticipada** | **Sí** | Igual que la nominal vencida: la tasa se divide entre `k` (`d = ja / k`), se pasa a vencida con `p = d / (1 − d)` y se capitaliza `k` veces |
| **Periódica vencida** | **Sí** | Dice a qué periodo pertenece la tasa (por ejemplo, "2 % mensual"). **No se divide**: la tasa ya es del periodo. Se usa `k` solo para capitalizar a EA |
| **Periódica anticipada** | **Sí** | Igual que la periódica vencida: indica el periodo de la tasa. No se divide, solo se pasa a vencida con `p = d / (1 − d)` y se capitaliza `k` veces |

### Resumen

- **No necesita el campo:** solo la EA.
- **Lo necesitan:** nominal vencida, nominal anticipada, periódica vencida y periódica anticipada.
- **Diferencia clave:** en las nominales el campo se usa para **dividir** la tasa anual. En las periódicas el campo solo **indica el periodo** de la tasa y no se divide.

---

## 3. Cómo funciona cada tasa

Todas se llevan primero a una tasa periódica vencida `p` (la del periodo de capitalización), luego a la EA y luego a la tasa del periodo de pago:

```
EA = (1 + p)^k − 1
i  = (1 + EA)^(1/m) − 1        (m = periodos por año de la cuota)
```

Ejemplos con 24 % y capitalización mensual (`k = 12`):

| Tipo | Conversión | EA resultante |
|---|---|---|
| Nominal vencida (24 % NM) | `p = 24 % / 12 = 2 %` | **26,82 %** |
| Nominal anticipada (24 % NMA) | `d = 2 %` y `p = 0,02 / 0,98 = 2,0408 %` | **27,43 %** |
| Periódica vencida (2 % mensual) | `p = 2 %` | **26,82 %** |
| Periódica anticipada (2 % mensual anticipado) | `d = 2 %` y `p = 2,0408 %` | **27,43 %** |

### Nominal contra periódica

- **Nominal:** el número que escribes es **anual** (24 %), por eso se divide entre `k`.
- **Periódica:** el número que escribes es **de un solo periodo** (2 % mensual), por eso no se divide.

### Vencida contra anticipada

En la tasa anticipada los intereses se cobran al **inicio** del periodo. Por eso, con el mismo valor, la anticipada tiene una EA mayor (27,43 % contra 26,82 %).

### Ejemplo con capitalización distinta a la periodicidad de pago

Tasa de 12 % nominal trimestral vencida (`k = 4`) con cuotas mensuales (`m = 12`):

```
p  = 12 % / 4 = 3 % trimestral
EA = 1,03^4 − 1 = 12,5509 %
i  = (1,125509)^(1/12) − 1 = 0,9902 % mensual
```

La tasa de entrada y la periodicidad de las cuotas son datos independientes. Por eso el campo de capitalización y el de periodicidad de cuotas son dos campos distintos.

---

## 4. En la efectiva anual, ¿dónde se cobran los intereses?

La EA es, por definición, una tasa **vencida**: los intereses se causan al final del año y la tasa ya incluye la capitalización de los intereses intermedios. Por eso no tiene variante vencida o anticipada.

La EA no dice cuándo pagas, solo cuánto crece el dinero en un año. La página la convierte a la tasa del periodo de pago:

```
i = (1 + EA)^(1/m) − 1
```

Con 24,96 % EA y pagos mensuales, `i = 1,8742 %` mensual. Esa `i` es **vencida**: cada mes el interés se calcula sobre el saldo y se cobra al final del mes. Doce meses a 1,8742 % dan exactamente 24,96 % en el año.

### Dónde se decide si se cobra al inicio o al final

Eso lo decide la casilla **"Cuotas al inicio del periodo"**, que es independiente de la tasa:

| Situación | Resultado |
|---|---|
| EA y casilla desmarcada | Cuotas e intereses al final de cada periodo (el caso normal) |
| EA y casilla marcada | La tasa sigue siendo vencida, pero la primera cuota se paga en el momento 0 y todas se pagan al inicio del periodo |

Cuando eliges un tipo de tasa anticipado, la casilla se marca sola. Puedes desmarcarla si tu crédito tiene tasa anticipada pero cobra las cuotas al final.

### Nota sobre la "efectiva anual anticipada"

Si un banco ofrece una tasa "efectiva anual anticipada" (poco común), no es lo mismo que una EA. Se convierte con `EA = d / (1 − d)`. La página todavía no tiene esa opción: sus tasas anticipadas son nominales o periódicas.

---

## 5. Periodicidad de las cuotas

"Periodicidad de las cuotas" define cada cuánto se paga:

| Periodicidad | Periodos por año (`m`) | Meses entre cuotas |
|---|---|---|
| Mensual | 12 | 1 |
| Bimestral | 6 | 2 |
| Trimestral | 4 | 3 |
| Cuatrimestral | 3 | 4 |
| Semestral | 2 | 6 |
| Anual | 1 | 12 |

Ejemplo con **cuatrimestral** y 24 cuotas:

- El crédito dura 24 × 4 = **96 meses**.
- La tasa se convierte a cuatrimestral: `i = (1 + EA)^(1/3) − 1`.
- Los "periodos" de la tabla son cuatrimestres. La fila 8 es el octavo pago, que cae en el mes 32 (8 × 4), no en el mes 8.

### Efecto en los abonos

- El campo **"Desde el periodo"** cuenta **cuotas**, no meses. Para abonar en el mes 32 con cuotas cuatrimestrales, debes poner el periodo 8.
- La frecuencia del abono se convierte a periodos con `meses ÷ meses por periodo`, redondeado, con un mínimo de 1.
- Solo es exacto cuando la frecuencia del abono es múltiplo de la periodicidad de las cuotas. Por ejemplo, con cuotas cuatrimestrales, un abono semestral da 6 ÷ 4 = 1,5, que se redondea a 2 periodos (cada 8 meses, no cada 6). Un abono mensual o trimestral caería cada 4 meses, porque no hay pagos entre una cuota y la siguiente.
