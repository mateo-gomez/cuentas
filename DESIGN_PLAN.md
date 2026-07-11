# Plan: Rediseño visual — Sistema Grafito

## Contexto

Prototipo HTML en `https://api.anthropic.com/v1/design/h/cfkwQPb7v3b1K5htSH5hoA` define el sistema **Grafito**:

- Monocromático (neutros fríos) + único color vivo en pastillas de categoría
- Tipografía editorial: Georgia/serif para montos + system sans para UI + monospace para metadatos
- Bottom tab bar con FAB central (reemplaza botones circulares actuales)

**Estado actual:** teal `#3F7C85` como primario, DrawerLayoutAndroid, botones circulares ±, AppBar colorido.

---

## Sistema de diseño (del prototipo)

```
Superficies: bg #f4f5f7 | surface #fff | surface2 #fbfbfc | surface3 #f1f2f4
Tinta:       ink #111214 | ink2 #2a2d33 | ink3 #5b5e64 | ink4 #898d94 | ink5 #b6b9bf
Líneas:      line #e6e7ea | line2 #eeeff1
Acción:      accent #1c2024 | onAccent #fff
Semántico:   pos #2f6b46 / posBg #e1ebe4 | neg #8b3a2e / negBg #efdedb

Category tones (bg / fg):
  sand   #efe6d6 / #7a663a | sage   #dfe6da / #4d5e41 | rose   #ecdcd7 / #7a4434
  sky    #d9e1e8 / #38516a | lilac  #e3dceb / #534667 | clay   #ead8c8 / #7a533a
  moss   #d6dfd0 / #475a36 | fog    #dcdfe3 / #4a5260 | butter #ebe4cb / #6f5e26
  wine   #e3d4d6 / #703c47

Fuentes: Georgia (serif) · System (sans) · monospace
```

---

## Archivos a modificar

| Archivo                                          | Cambio principal                                                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `cuentas/src/theme.ts`                           | Reemplazar paleta completa + agregar tones + mantener keys legacy                                    |
| `cuentas/src/screens/home/index.tsx`             | Quitar DrawerLayout/AppBar/botones circulares; agregar header inline + month switcher + BottomTabBar |
| `cuentas/src/screens/home/Transactions.tsx`      | Hero card saldo + lista agrupada por día con chips                                                   |
| `cuentas/src/screens/transaction/index.tsx`      | Quitar AppBar teal; toggle tipo + display serif monto + campos styled                                |
| `cuentas/src/screens/transaction/NumPad.tsx`     | Restyle (sin borde primario, teclas Georgia 28px)                                                    |
| `cuentas/src/screens/transaction/Categories.tsx` | Grid 4 col con CategoryChip                                                                          |
| `cuentas/src/screens/budget/index.tsx`           | Ring SVG donut + cards mejoradas + quitar AppBar teal                                                |

## Archivos nuevos

| Archivo                                   | Propósito                                                 |
| ----------------------------------------- | --------------------------------------------------------- |
| `cuentas/src/Components/BottomTabBar.tsx` | Tab bar 5 slots con FAB central elevado                   |
| `cuentas/src/Components/CategoryChip.tsx` | Pastilla de categoría; tone auto-asignado por hash del ID |

---

## Pasos de implementación

### 1. theme.ts

- Nuevas keys: `bg`, `surface`, `surface2`, `surface3`, `ink`→`ink5`, `line`→`line3`, `accent`, `onAccent`, `pos`, `posBg`, `neg`, `negBg`
- Keys legacy mapeadas a nuevos valores (no romper componentes no modificados):
  - `primary` → `#1c2024` (accent) | `background` → `#f4f5f7` | `white` → `#ffffff`
  - `greenLight` → `#2f6b46` | `red` → `#8b3a2e` | `secondary` → `#1c2024`
- Agregar `fonts.serif = 'Georgia'`, `fonts.mono = 'Courier New'`
- Agregar `categoryTones` object con los 10 tones

### 2. CategoryChip.tsx (nuevo)

```tsx
// Hash categoryId → tone name (10 opciones)
// Tamaños: sm (28px r8), md (36px r11), lg (52px r16)
// Muestra category.icon (Ionicons) si existe, sino inicial del nombre
```

### 3. BottomTabBar.tsx (nuevo)

```tsx
// 5 slots: grid-template 1fr 1fr 88px 1fr 1fr
// FAB: 60x60, borderRadius 30, accent bg, translateY -18
// Tabs: icon + label, active=ink, inactive=ink3
// Props: activeTab, onSelect, onPressPlus
```

### 4. Home screen

- Header: "cuentas" en Georgia 22 + botón "Buscar" pill
- Month switcher: chevron | mes Georgia 34px | chevron
- Mantener FlatList horizontal paginada (lógica de steps intacta)
- Reemplazar botones circulares con `<BottomTabBar>`
- `onPressPlus` → `navigate('/transactions/outcome')`
- Fondo: bg color

### 5. Transactions.tsx

- Hero card (surface, r-lg, shadow):
  ```
  SALDO DEL MES  [eyebrow]
  $55.888        [Georgia 48px]
  ─ ─ ─ ─ ─ ─ ─ [dashed divider]
  ↑ Ingresos    ↓ Gastos
  $x.xxx        $x.xxx
  ```
- DayGroup: fecha en eyebrow + total del día derecha
- TxRow: CategoryChip | nombre cat + descripción | monto (pos verde si ingreso)

### 6. Transaction screen

- Header: `Cancelar` ghost | Toggle Gasto/Ingreso | `Guardar`
- Monto: display Georgia 64px (no editable, solo muestra `formatNumber(transactionValue)`)
- Descripción: TextInput border-bottom only, 15px
- Fila 2 cols: [CategoryChip + cat nombre] | [icon calendario + fecha]
- Mantener toda la lógica existente (hooks, submit, params)

### 7. NumPad.tsx

- Restyle: sin borde externo, fondo transparent
- Teclas individuales: Georgia 28px, height 58, r-md, active state surface3
- Botón "Seleccionar categoría": accent bg, white, full-width, 48px (al fondo)
- `VirtualKeyboard` mantiene su función, solo se cambian estilos

### 8. Categories.tsx

- Grid 4 columnas usando `CategoryChip` (size lg)
- Card: surface bg, border line | seleccionada: border ink 2px
- Padding 14px top/bottom, 6px left/right, flex column center

### 9. Budget screen

- Header inline: eyebrow mes + title "Presupuesto" serif + botón "Configurar" pill
- Hero card con donut ring (react-native-svg si disponible):
  - SVG: r = (size-stroke)/2, stroke 14, rotate -90deg, animated dashoffset
  - Stats: Disponible serif 30px | Gastado + Meta en mono
- Category cards: CategoryChip sm + nombre + progress bar 4px + remaining

---

## Dependencias

- Verificar `react-native-svg`: `ls node_modules/react-native-svg 2>/dev/null`
  - Si no existe: `npx expo install react-native-svg`
  - Si no se puede instalar: aproximar ring con View circular + border

## Componentes NO modificados

- Auth screens (Login, Signup)
- Import screen
- Category screen (create/edit)
- Budget/Edit screen
- Hooks, services, utils — sin cambios

## Verificación

```bash
cd cuentas && npm run ts       # sin errores TypeScript
npx expo start                 # app carga en emulador
```

Comprobar visualmente:

- [x] Home: header serif, month switcher, hero card, transaction rows con chips, bottom tab bar
- [x] Nueva transacción: toggle tipo, display monto, numpad limpio, selector categoría con chips
- [x] Presupuesto: ring de progreso, category progress bars
