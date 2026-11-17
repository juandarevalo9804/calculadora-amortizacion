# Plan: página web de tablas de amortización (ingeniería económica)

**Versión con la lógica separada del HTML.**

## 1. Decisión de tecnología

**Recomendación: JavaScript puro en un solo archivo `.html`.**

| Opción | Instalación | Cómo se abre | Veredicto |
|---|---|---|---|
| **HTML + JavaScript (archivos separados)** | Ninguna | Doble clic en `index.html` | Es la más simple |
| Python (Streamlit/Flask) | Python + librerías | Terminal + navegador | Más pasos |
| Python (Tkinter) | Python | Ejecutar script | No es una página web |

Con HTML + JS el navegador hace los cálculos. No necesitas servidor, internet ni instalar nada.

**Cómo abrirlo:** descomprime la carpeta `amortizacion` (los 4 archivos deben quedar juntos) y haz doble clic en `index.html`. Se abre en Chrome, Edge o Firefox.

---

## 2. Notación

| Símbolo | Significado |
|---|---|
| P | Capital (préstamo) |
| n | Número de cuotas |
| m | Periodos por año de la cuota (mensual = 12, bimestral = 6, trimestral = 4, cuatrimestral = 3, semestral = 2, anual = 1) |
| i | Tasa periódica vencida de cada cuota |
| d | Tasa periódica anticipada |
| EA | Tasa efectiva anual |
| k | Periodos de capitalización por año de la tasa que da el usuario |
| g | Periodos de gracia |
| A | Cuota fija |
| S | Saldo |

---

## 3. Fórmulas

### 3.1 Conversión de tasas

Se lleva siempre todo a **EA** y de ahí a la tasa del periodo de pago.

| Tasa ingresada | Paso a tasa periódica vencida `p` (del periodo de capitalización) |
|---|---|
| EA | No aplica: ya es EA |
| Nominal vencida `j` | `p = j / k` |
| Periódica vencida | `p` = la tasa dada |
| Nominal anticipada `ja` | `d = ja / k` y luego `p = d / (1 − d)` |
| Periódica anticipada | `d` = la tasa dada y luego `p = d / (1 − d)` |

Después:

```
EA = (1 + p)^k − 1                  (si la tasa no era EA)
i  = (1 + EA)^(1/m) − 1             tasa periódica vencida del periodo de pago
d  = i / (1 + i)                    tasa periódica anticipada equivalente
Nominal vencida   = i · m
Nominal anticipada = d · m
```

### 3.2 Cuota fija

**Vencida (cuota al final del periodo):**

```
A = P · i / (1 − (1 + i)^(−n))
```

**Anticipada (cuota al inicio del periodo):**

```
A = P · i / [ (1 + i) · (1 − (1 + i)^(−n)) ]
```

### 3.3 Cada fila de la tabla

**Cuota vencida:**

```
Interés(t)      = Saldo(t−1) · i
Amortización(t) = A − Interés(t)
Saldo(t)        = Saldo(t−1) − Amortización(t)
```

**Cuota anticipada:** igual, pero el **interés del primer pago es 0**, porque se paga en el momento 0.

**Último periodo:** la amortización es igual al saldo y la cuota es `interés + saldo`. Así el saldo final queda en 0 sin errores de redondeo.

### 3.4 Periodo de gracia (diferido, solo intereses)

Durante los `g` periodos de gracia el capital no baja:

```
Vencida:    Cuota = Interés = Saldo · i
Anticipada: Cuota = Interés = Saldo · d = Saldo · i / (1 + i)
```

Después de la gracia se calcula la cuota fija sobre `n` cuotas (sección 3.2). El total de periodos es `g + n`.

### 3.5 Abonos extra

Si en el periodo `t` hay un abono `X`:

```
Saldo(t) = Saldo(t−1) − Amortización(t) − X
Cuota mostrada = A + X  (la página los muestra en columnas separadas)
```

Luego hay dos opciones:

**Opción 1. Reducir plazo (mantener la cuota A):**

- La cuota sigue siendo A.
- Cuotas que quedan después del abono (vencida):

```
n' = −ln(1 − S · i / A) / ln(1 + i)
```

- La última cuota es menor, porque es `saldo + interés`.

**Opción 2. Reducir cuota (mantener el plazo):**

```
r  = periodos que faltan
A' = S · i / (1 − (1 + i)^(−r))
```

En el ejemplo: `r = 16`, `S = 104.955.479,4` y `A' = 7.653.043,79`.

### 3.6 Abonos periódicos

Para pasar de meses a periodos de la cuota:

```
paso = round( meses_entre_abonos / (12 / m) )     (mínimo 1)
```

| Frecuencia | Meses |
|---|---|
| Mensual | 1 |
| Trimestral | 3 |
| Cuatrimestral | 4 |
| Semestral | 6 |
| Anual | 12 |

Los abonos caen en los periodos `desde, desde + paso, desde + 2·paso, ...` hasta el periodo final o el fin del crédito.

### 3.7 Resultados que se comparan

```
Intereses totales  = suma de la columna Interés
Ahorro en intereses = Intereses sin abonos − Intereses con abonos
Cuotas que quedan   = periodos totales − periodo actual
```

---

## 4. Plan para armarlo

### Paso 1. Estructura de archivos (cada uno con una sola responsabilidad)

```
amortizacion/
├── index.html     -> solo la estructura (formulario, tarjetas, tabla)
├── estilos.css    -> solo el aspecto (colores, tamaños, modo oscuro)
├── calculos.js    -> solo la LÓGICA financiera (no sabe que existe el HTML)
└── app.js         -> la interfaz: lee el formulario, llama a calculos.js y dibuja
```

`index.html` carga los archivos en este orden, y el orden importa:

```html
<link rel="stylesheet" href="estilos.css">
...
<script src="calculos.js"></script>
<script src="app.js"></script>
```

No se usan módulos (`import`) a propósito: los módulos no funcionan al abrir con doble clic.

**Pantalla (`index.html`):**

1. Datos del crédito: capital, cuotas, periodicidad, gracia, tasa, tipo de tasa y periodo de capitalización.
2. Casilla de cuotas anticipadas, que se marca sola si la tasa es anticipada.
3. Lista de abonos: periodo inicial, frecuencia, monto y periodo final opcional.
4. Bloque de conversión de tasas.
5. Tarjetas de comparación: sin abonos, reducir plazo y reducir cuota.
6. Tabla con pestañas para cambiar de escenario.

### Paso 2. Funciones de cada archivo

**`calculos.js` (lógica pura: recibe números y devuelve números):**

| Función | Qué hace |
|---|---|
| `convertirTasa(valor, tipo, k, m)` | Convierte la tasa a EA, `i` y `d` (sección 3.1) |
| `cuotaVencida(P, i, n)` | Cuota fija vencida (sección 3.2) |
| `cuotaFija(P, i, n, anticipada)` | Cuota vencida o anticipada (sección 3.2) |
| `mapaAbonos(lista, T, m)` | Convierte la lista de abonos en `{periodo: monto}` (sección 3.6) |
| `simular(modo, P, n, g, i, anticipada, abonos)` | Genera las filas de la tabla. Modo: `plazo`, `cuota` o `sin` (secciones 3.3 a 3.5) |

**`app.js` (interfaz: usa las funciones de arriba):**

| Función | Qué hace |
|---|---|
| `agregarAbono()` / `leerAbonos()` | Crea filas de abonos en pantalla y las lee como una lista |
| `calcular()` | Lee los datos, llama a `calculos.js` con los tres escenarios y actualiza tarjetas y tasas |
| `dibujarTabla()` | Pinta la tabla del escenario seleccionado |

**Regla de oro:** si cambia una fórmula, solo editas `calculos.js`. Si cambia lo que se ve, editas `index.html`, `estilos.css` o `app.js`.

### Paso 3. Lógica de `simular()` (en `calculos.js`)

```
saldo = P
cuota = ann(P, i, n, anticipada)
para t = 1 hasta g + n, mientras saldo > 0:
    si t <= g:                               # gracia
        interes = saldo * i  (o saldo * d si es anticipada)
        cuota_t = interes ; amort = 0
    si no:
        si modo = "cuota" y t = g + 1: cuota = ann(saldo, i, n, anticipada)
        interes = 0 si (anticipada y t = g + 1) si no saldo * i
        amort = cuota - interes
        si amort >= saldo o t = último: amort = saldo
    abono = min(abonos[t], saldo - amort)
    saldo = saldo - amort - abono
    si modo = "cuota" y hubo abono y t > g:
        cuota = saldo * i / (1 - (1+i)^-(g + n - t))
    guardar fila
```

### Paso 4. Validación con el ejemplo del Excel

Con `P = 200.000.000`, `n = 24`, `24,96 % EA`, mensual, abono de `38.000.000` en el periodo 8:

| Dato | Valor esperado |
|---|---|
| `i` mensual | 1,874 % |
| Cuota A1 | 10.423.892 |
| Interés periodo 1 | 3.748.000 |
| Saldo antes del abono (periodo 7) | 150.557.915,7 |
| Interés periodo 8 | 2.821.455,3 |
| Saldo después del abono | 104.955.479,4 |
| Cuota nueva (reducir cuota) | 7.653.043,79 |
| Fin del crédito (reducir plazo) | Periodo 20 |
| Última cuota (reducir plazo) | 2.753.275,8 |

Si la página da estos números, el cálculo está bien. Para otros casos, compara con una hoja de Excel usando `=PAGO(i; n; -P)` (o `=PAGO(i; n; -P; 0; 1)` para anticipada).

### Paso 5. Pruebas extra

1. Sin abonos y sin gracia, el saldo final debe ser 0.
2. Con tasa 0 %, la cuota debe ser `P / n`.
3. Con tasa anticipada, la primera fila debe tener interés 0.
4. Con gracia, el saldo debe mantenerse igual durante esos periodos.
5. Un abono mayor que el saldo debe cancelar el crédito sin saldo negativo.

### Paso 6. Entrega

Una carpeta `amortizacion` con los 4 archivos. Para usarla, doble clic en `index.html`. Para compartirla, envía la carpeta comprimida en `.zip`.

### Paso 7. Probar la lógica sin el navegador (opcional)

`calculos.js` se puede probar con Node.js porque no depende del HTML:

```js
const c = require('./calculos.js');
const r = c.convertirTasa(0.2496, 'ea', 1, 12);
const ab = c.mapaAbonos([{desde: 8, frecuencia: 0, monto: 38e6, hasta: 0}], 24, 12);
const t = c.simular('plazo', 2e8, 24, 0, r.i, false, ab);
console.log(t.A0, t.n);   // 10423892 y 20
```

---

## 5. Ideas para mejorar después

- Exportar la tabla a Excel o CSV.
- Gráfica de saldo contra periodo, comparando escenarios.
- Gracia con capitalización de intereses (hoy solo paga intereses).
- Guardar los datos del último cálculo en el navegador.
