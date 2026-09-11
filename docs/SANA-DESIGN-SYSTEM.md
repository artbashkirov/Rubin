# Sana (Sana Labs) — Design System · спека для переноса в Figma (UI-kit)

Дата снятия: **8 августа 2026**. Источник — live-сайт, не догадки.

Документ описывает **что реально есть на sanalabs.com**, чтобы собрать UI-kit в Figma для лендинга RUBIN.
Компоненты в Figma по этому документу **не создавались** — это только спецификация.

---

## 0. Как снимались данные

| Источник | Что взято | Статус |
|---|---|---|
| `https://sanalabs.com/` | CSS-переменные, шрифты, футер, nav, hero | ✅ |
| `https://sanalabs.com/products/sana/` | hero, метрики, табы, партнёрство, интеграции, логотипы, прайсинг | ✅ |
| `https://sanalabs.com/products/sana-learn/` | quote-карточки, FAQ, сравнение, кейсы | ✅ |
| `https://brand.sanalabs.com/` | логотипы, wordmark, symbol | ⚠️ портал v0.1 — только ZIP-архив, гайдлайны на странице не опубликованы |
| CSS: `/css/base.css` + `/css/web2.css` | полный CSSOM (с media-контекстом) | ✅ основной источник цифр |
| Figma RUBIN, нода `156:68231` «Ref · Sana» | сверка ритма | ✅ см. §6 — эталон расходится с live |

**Важно про единицы:** в CSS `html { font-size: 10px }`, значит **1rem = 10px**. Все значения ниже приведены **в px**.

Все размеры сняты на десктопе. Единственный значимый брейкпоинт — **950px** (плюс редкие 1460 / 1400 / 1200 / 1024 / 768 / 650 / 580 / 480).

---

## 1. Foundations

### 1.1 Сетка и раскладка

Живой сайт (проверено измерением DOM на 1920px):

| Параметр | Значение |
|---|---|
| Контейнер `.wrap` / `.columns` | `max-width: 1496` (это `1432 + 2×32`) |
| Боковой паддинг контейнера | **32** (мобайл 24) |
| Ширина контента | **1432** |
| Колонок | **12** |
| Гаттер | **20** |
| Row-gap в `.columns` | **24** |
| Ширина колонки при контенте 1432 | **101** = (1432 − 11×20) / 12 |
| Высота хедера | **52**, inner тоже 1496 / паддинг 32 |

Варианты контейнера: `.wrap.narrow` 846 · `.wrap.wide` 1632 · `.wrap.extra-wide` 2200 · `.wrap.no-padding` 0.

**Grid для артборда RUBIN 1728:** контент 1432 по центру → **margin 148 слева/справа, 12 колонок по 101, gutter 20**.
Для 1440: margin 32, контент 1376, колонка 96.33.

Другие сеточные примитивы:

| Класс | Раскладка |
|---|---|
| `.two-col` | 2 равные, gutter 20 |
| `.two-cols` / `.three-cols` | 2 / 3 равные, column-gap 18, row-gap 40 |
| `.flex-cols` | flex, равные, gap 18 (переопределяется `--vertical` / `--gutter`) |
| `.icon-grid` | 4 колонки, gap 40 / 20, паддинг 20 (мобайл 3 → 2) |
| `.image-grid` | 12 колонок, gap 22 / 20 |
| `.integration-grid` | 12 колонок, gap 16 / 24 |
| `.pile` | наложение элементов в одну ячейку (для оверлеев) |
| `.stack` | flex-column, gap `--stack-gap` (по умолчанию 10) |
| `.flow` / `.prose` | `> * + *` → margin-top 1em |

Вертикальный ритм секций (`.page section`):

| Класс | Padding-block (desktop) | Мобайл |
|---|---|---|
| по умолчанию | **40** | 24 |
| `.reduced-padding` | 32 | — |
| `.medium-padding` | 64 | — |
| `.extra-padding` | 140 | 80 |
| `.first` | **100 сверху** / 40 снизу | 100 / 36 |
| `.no-padding` | 0 | 0 |

> Секции у Sana «тонкие» (40px), а воздух создаётся не паддингом секции, а `margin-*` утилитами внутри (см. 1.4).

### 1.2 Цвета

Все токены объявлены как CSS-переменные на `:root`.

**Нейтральные (рабочая палитра — 95% сайта):**

| Токен | HEX | Роль |
|---|---|---|
| `--white` | `#FFFFFF` | основной фон, текст на тёмном, фон карточек |
| `--black` | `#000000` | текст, primary-кнопка, индикаторы |
| `--blackish` / `--off-black` | `#0A0A0A` | фон тёмных секций, цвет текста хедера |
| `--sand` | `#F6F5F4` | фон вложенного блока цитаты, chip `.eyebrow-tag` |
| `--lightgrey` | `#F9F9FB` | светлый фон-полоса |
| `--grey` | `#B8B7C3` | вспомогательный |
| `--darkgrey` | `#A2A2A2` | вспомогательный |
| `--darkergrey` | `#666666` | вспомогательный |

**Альфа-токены (то, чем реально сделаны бордеры, фоны и «тихие» состояния):**

| Токен / значение | Где применяется |
|---|---|
| `rgba(0,0,0,0.03)` | hover фона nav-ссылки, фон `.integrations-card-wrapper` |
| `--black-05` `rgba(0,0,0,0.05)` | фон soft-кнопки, `.toc`, `.faq-row` бордер, тени-хайрлайны |
| `--black-08` `rgba(0,0,0,0.08)` | бордеры/тени |
| `--black-10` `rgba(10,10,10,0.1)` | стандартный «subtle» бордер 1px |
| `rgba(0,0,0,0.6)` / `opacity .6` | вторичный текст, неактивные состояния |
| `rgba(255,255,255,0.1)` | бордеры на тёмном фоне |
| `rgba(255,255,255,0.3)` | бордеры инпутов на тёмном |

Утилиты текста: `.fade-8` (0.8), `.fade-5` (0.5), `.fade-4` (0.4), `.color-black-80`, `.black`, `.white`, `.blackish`.

**Акцентные токены** (объявлены, но на продуктовых страницах почти не используются — брать только осознанно):

| Токен | HEX | Реальное применение |
|---|---|---|
| `--red` | `#FA0019` | **текст ошибки формы**, точки-маркеры в тёмном аккордеоне |
| — | `#FF5454` | текст ошибки на тёмном фоне |
| `--blue` | `#0055FF` | фон карточки Sana Learn на главной |
| `--orange` | `#FF6400` | фон карточки Sana на главной |
| `--sky` / `--lightblue` | `#6ACDE3` | — |
| `--iceblue` | `#E4EFF7` | — |
| `--neon` | `#CDFE00` | — |
| `--neonpink` / `--lightpink` | `#FF8CFD` | — |
| `--pink` | `#EF029F` | — |
| `--sunflower` | `#FFEB00` | — |
| `--green` | `#00DD00` | — |
| `--darkblue` | `#09102B` | — |
| `--maroon` | `#401220` | — |
| `--darkred` | `#9B0019` | — |
| `--brown` | `#402517` | — |
| `--wd-dark-blue` | `#002146` | Workday co-branding |

Утилиты фона: `.bg-{token}` для каждого токена (`!important`), плюс `.bg-blur` = `rgba(10,10,10,0.24)` + `backdrop-filter: blur(120px)`.

> **Для RUBIN:** нейтральная база + один акцент. Радужную палитру Sana не переносить целиком — она у них есть в CSS, но не в дизайне продуктовых страниц.

### 1.3 Типографика

**Гарнитуры на сайте:**

| Семейство | Что это | Где используется | Замена в Figma |
|---|---|---|---|
| **Sana Sans** | вариативный (opsz 14–100, wght 400–700), проприетарный | всё: заголовки, body, UI | **Google Sans** (правило проекта) · fallback Inter |
| **SanaSerif** | проприетарный серифный | легаси-заголовки в `base.css`, `.type-quote-01`, `.serif`; на текущих продуктовых страницах перебит на Sana Sans | замены нет — в эталоне Figma заменён на Google Sans / Inter. Если нужен сериф — согласовать отдельно |
| **JetBrainsMono** | `.type-mono` | подписи-моно, редко | JetBrains Mono (есть в Google Fonts) |

**Маппинг весов (`font-variation-settings: "wght"` → Figma):**

| wght на сайте | Figma (Google Sans) |
|---|---|
| 400 | Regular |
| 420 / 440 / 450 / 460 | Medium (для UI-текста 14px) — точного 450 нет |
| 500 | Medium |
| 600 | SemiBold (или Bold) |
| 700 | Bold |

Ось `opsz` в Figma не воспроизводится — игнорировать.

**Type scale (desktop, актуальный из `web2.css`):**

| Стиль | Size | Line-height | Letter-spacing | Weight | Применение |
|---|---|---|---|---|---|
| `.super` | 180 | 100% | −0.02em | 400 | гигантские числа |
| `.maxi` | 140 | 100% | −0.02em | 400 | гигантские числа |
| `.feature-counter .number` | 112 | 100% | −0.03em | 500 | счётчик в круге |
| `h1` / `.h1` | **72** | 100% | −0.02em | 400 | заголовок страницы |
| `h1.display` | **72** (clamp 44→72) | **95%** (68.4) | −0.03em | 500 | hero — измерено на живой странице |
| `.total-price` | 72 | 100% | −0.04em | — | калькулятор цены |
| `.type-headline-01` / `.type-heading-medium` | 56 | 107% | −0.5px | 400 | легаси |
| `h2` / `.h2` | **48** | **100%** (48) | −0.02em | 500 | заголовок секции |
| `h1.alt` / `.h1-alt` | 48 | — | 0 | 500 | |
| `.type-quote-01` | 40 | 120% | −0.01em | 400 | крупная цитата (SanaSerif) |
| `h3` / `.h3` | **32** | 110% | −0.01em | 500 | подзаголовок, тайтл плана |
| `.type-headline-02` / `.type-heading-small` | 32 | 112% | −0.5px | 400 | |
| `h2.alt` / `.h2.alt` | 28 | 34 | −0.01em | 500 | |
| `.type-subheading-large` / `.type-subhead-02` | 24 | 117% | −0.5px | 450 / 400 | |
| `h4` / `.h4` | **22** | 120% | −0.01em | 500 | |
| `.type-body-big` / `.type-subheading-big` | 18 | 133% | 0 | 400 / 500 | крупный body |
| `.type-t1` / `.h5` | 18 | 130% | — | 450 | |
| **`p` / body** | **16** | **140%** (22.4) | −0.01em | 400 | базовый текст |
| `.type-body-01` / `.type-subhead-01` | 16 | 150% | 0 | 400 / 500 | |
| `.type-small` / `.type-detail` / `.detail` | **14** | 140% | 0 / −0.01em | 450 / 400 | подписи, UI, nav |
| `.new-detail` | 14 | 100% | −0.01em | 600 | |
| `.type-micro` | 12 | 150% | 0 | 500 | микроподписи |
| `.counter-detail` | 12 | 14 | +0.04em, **uppercase**, opacity .6 | 450 | счётчики-лейблы |
| `.media-caption p` | 12 | — | — | — | подпись под медиа |
| `.business-info p` | 11 | 13 | +0.04em, uppercase | — | |
| `.learn-tag` / grid-tag | 9 (мобайл 12) | 140% | +0.06em, uppercase | — | тег на карточке |

**Мобайл (≤950):** `h1` (в `.new-type`) 38 · `h2` 32 · `h3` 28 · `h4` 18 · `.super`/`.maxi` 80.

Прочее: `h1..h6, p, a` по умолчанию наследуют размер/вес; `a { color: inherit; text-decoration: none }`; `text-wrap: balance` на `h1`.

### 1.4 Spacing scale

Утилиты нижнего отступа:

| Класс | Desktop | Mobile (≤950) |
|---|---|---|
| `.margin-xs` | 12 | — |
| `.margin-s` | 20 | — |
| `.margin-sm` | 30 | — |
| `.margin-m` | 64 | 32 |
| `.margin-l` | 72 | 50 |
| `.margin-xl` | 100 | 60 |
| `.margin-small-s` | — | 20 |

Реально встречающийся шаг внутри компонентов: **4 · 6 · 8 · 10 · 12 · 16 · 20 · 24 · 26 · 30 · 32 · 40 · 48 · 56 · 64 · 72 · 100 · 120**.
Базовая единица — **4**, «рабочая» — **8**.

Частные значения: `.eyebrow` → margin-bottom 24 · `h1 + .pill` → 40 · `.pill + h1` → 24 · `.key-stats` → margin-top 64 · `hr` в `.page` → margin-block 36.

### 1.5 Радиусы

| px | Где |
|---|---|
| 4 | `.media.rounded` |
| **6** | nav-item, submenu-item, базовый input, чекбокс (`::before`) |
| **8** | `.pill`, `.coming-soon-tag`, `.custom-tag`, `.change-tags`, `.stat-card`, `.case-study-slide-card`, `.speaker-image`, `.media.rounded-8` |
| 9 | `.image-grid-card` |
| 10 | dropdown подменю, `.integration-item-icon` |
| **12** | `.media-tag.new-tag`, базовый `select`, инпут прайсинга, custom-range |
| 14 | иконка в списке интеграций |
| **16** | `.media.rounded-m`, `.quote-card-content`, `.home-product-card`, `.custom-cta-box`, `.home-testimonial-module`, `.ms-tag` |
| 20 | `.eyebrow-tag`, item в `.modes-sticky-nav` |
| 23 | `.ms-control`, `.ms-dropdown` |
| **24** | `.media.rounded-l`, `.quote-card`, `.image-card`, `.integrations-card-wrapper`, `.partnership-service`, `.start-box`, `.future-event-card-big`, `.product-card` (мобайл) |
| **32** | **`.btn`**, `.media.rounded-32`, `.learn-tag`, pill-таб, `.integration-item`, tooltip, контейнер `.modes-sticky-nav` |
| 34 | контейнер точек слайдера, toggle autoplay |
| 36 | кнопка в хедере |
| 40 | `.product-card` (desktop), `.events-listing-row-tag`, кнопка в `.chat-bar` |
| 44 / 64 | `.feature-counter` (мобайл / desktop) |
| 70 | `.chat-bar` |
| 100% | аватары, круглые стрелки слайдера |

> Ключевые три: **8 → 16/24 → 32 (pill-кнопки)**.

### 1.6 Тени

| Имя | Значение | Где |
|---|---|---|
| **Hairline card** | `0 0 0 1px rgba(10,10,10,.05)`, `0 2px 4px rgba(10,10,10,.08)` | `.quote-card`, `.media-tag.new-tag`, заливка range |
| **Dropdown** | `0 0 0 1px rgba(0,0,0,.05)`, `0 8px 16px rgba(0,0,0,.08)` | подменю хедера и футера |
| `.shadow-medium` | `0 8px 12px rgba(0,0,0,.04)`, `0 16px 32px rgba(0,0,0,.04)` | утилита |
| Product card | `0 8px 24px rgba(0,0,0,.12)`, `0 0 2px rgba(0,0,0,.04)` | `.product-card` |
| Chat bar | `0 0 0 1px rgba(0,0,0,.04)`, `0 16px 16px rgba(0,0,0,.04)` | `.chat-bar` |
| Pill outline | `0 0 0 1.5px #0A0A0A` | `.pill` — обводка сделана тенью, не бордером |
| Dropdown (multiselect) | `0 6px 16px rgba(10,10,10,.08)` | `.ms-dropdown` |
| Quote wall | `0 4px 24px rgba(0,0,0,.1)` | `.quote-wall .blockquote` |

Бордеры-утилиты: `.border-subtle` / `.border-top-subtle` / `.border-bottom-subtle` = `1px solid rgba(0,0,0,.1)`.

### 1.7 Motion (для справки, в Figma не нужно)

`--easeOut: cubic-bezier(0.16, 1, 0.3, 1)` · `--easeInOut: cubic-bezier(0.83, 0, 0.17, 1)`.
Типовые длительности: 0.2s (кнопки), 0.3–0.4s (nav, табы), 0.6s (появления), 1–2s (медиа).
`.appear` — translateY(20) + opacity 0 → 0, задержка `calc(var(--i) * 0.08s)`.

### 1.8 Логотип

Из `brand.sanalabs.com` (портал v0.1, всё остальное — только в ZIP):

| Ассет | Геометрия |
|---|---|
| Wordmark «Sana» | viewBox `0 0 66 24`, в хедере рендерится **53 × 20**, `fill: currentColor` |
| Symbol (кластер точек) | viewBox `0 0 32 32`, монохром, `currentColor`; в футере 40px |
| «A Workday company» | max-width 131, opacity .6 |
| Логотипы партнёров | монохромные SVG, `max-height: 66`, ширина auto |

---

## 2. Инвентарь компонентов — чеклист

Отмечено то, что **реально существует** на сайте. Ничего «на всякий случай» не добавлено.

- [x] Button (primary / soft / ghost / inverse; 2 размера)
- [x] Button — иконочная круглая (стрелки слайдера, play/pause)
- [x] Link (nav / submenu / footer / inline / breadcrumb)
- [x] Input — text/email (underline и pill-варианты)
- [x] Select
- [x] Checkbox
- [x] Multiselect (chips + dropdown)
- [x] Range slider (только в калькуляторе цены)
- [x] Field label / helper / error
- [x] Nav item + Dropdown menu
- [x] Header (7 тем)
- [x] Announcement bar
- [x] Tabs — 4 разных типа (inline underline / pill / vertical rail / text-list)
- [x] Sticky pill nav
- [x] Pill / Tag / Badge — 7 разновидностей
- [x] Card — quote, image, image-grid, stat, case-study, product, home-product, integrations, partnership-service, CTA-box, start-box, event, text-card, media-box
- [x] Quote — карточка, блок, слайдер, стена, оверлей на медиа
- [x] Pricing column (не карточка!) + Pricing calculator + Comparison row
- [x] Logo cell / Logo strip / Logo grid (rotating)
- [x] CTA banner
- [x] Fixed / sticky CTA
- [x] Footer (2 колонки + 3 nav-колонки + newsletter + bottom bar)
- [x] Media frame (7 аспектов × 5 радиусов) + caption + overlay + play
- [x] Divider (`hr`)
- [x] Accordion / FAQ row (2 варианта)
- [x] Stats — key-stat, stat-block, roi-stat, feature-counter
- [x] Slider UI (dots + arrows + autoplay toggle)
- [x] Tooltip
- [x] Checklist (галочка + текст)
- [x] Integration item
- [x] Speaker / person row
- [x] Table-like rows (comparison, features list, events, changelog)
- [x] Chat bar (hero-элемент)

---

## 3. Спецификации компонентов

### 3.1 Button `.btn`

Базовые свойства (все варианты): `display: inline-flex`, `border: 0`, `outline: 0`, `transition: .2s`.

| Размер | Height | Padding | Radius | Font |
|---|---|---|---|---|
| **Default** | **38** (max-height 38) | `10 / 16 / 7` (низ меньше — оптическая компенсация) | **32** | 16 / 140% / wght 450 |
| **Header** | **36** (min-height) | `4 / 12 / 0` | **36** | 14 / 140% / wght 450 |
| Tutor-страницы | 38 | как default | 32 | 14 / wght 450 |
| Submit в форме | ≤38 | `13 / 16 / 12` | 32 | 16 / wght 500 |

Варианты (замерено):

| Вариант | Fill | Text | Border |
|---|---|---|---|
| **Primary** `.btn.bg-black.white` | `#000000` | `#FFFFFF` | — |
| **Soft / tertiary** `.btn` | `rgba(0,0,0,0.05)` | `#000000` | — |
| **Ghost** `.bg-white .btn.ghost` | transparent | inherit | `1px rgba(0,0,0,0.1)` |
| **Ghost on dark** `.bg-black .btn.ghost` | transparent | inherit | `1px rgba(255,255,255,0.1)` |
| **Secondary** `.btn.secondary` | transparent | inherit | `1px currentColor` через `::after`, radius `2em` |
| **Inverse** (на тёмном хедере / тёмной секции) | `#FFFFFF` | `#000000` | — |

Состояния:
- **Hover** — `opacity: 0.6` (у `.fixed-cta` вместо этого fill `#2E2E2E`).
- **Disabled** — `opacity: 0.6`, `pointer-events: none`.
- **Focus** — **отсутствует** (`outline: 0` глобально). Если делаем свой kit — добавить focus-ring осознанно.
- С иконкой — `gap: 8`, иконка `font-size: 18` (равна `1em` текста).
- Два подряд — `margin-left: 6`.

Автолейаут в Figma: horizontal, hug × hug, align center, padding по таблице, gap 8, radius 32.

### 3.2 Круглая иконка-кнопка

| Тип | Размер | Fill |
|---|---|---|
| Стрелка слайдера цитат | 41 × 41, radius 100% | `#FFFFFF`, иконка чёрная, 41% от размера |
| Стрелка blockquote-слайдера | 40 × 40, radius 100% | `#000000`, иконка белая |
| Autoplay toggle | 34 × 34, radius 100% | `rgba(0,0,0,.05)` → hover `.1` |
| Play/pause в pill-табах | 38 × 38, radius 38 | `#FFFFFF` |

Disabled стрелки — `opacity: 0.2`.

### 3.3 Link

| Тип | Спецификация |
|---|---|
| Базовая `a` | `color: inherit`, без подчёркивания |
| **Nav item** | 14 / 140%, `min-height: 36`, padding `4 / 12 / 0`, radius **6**, hover/active `bg rgba(0,0,0,.03)`; с иконкой — gap 4, padding-right 8, иконка 16 |
| **Submenu item** | 14 / 140%, `min-height: 40`, padding `11 / 12 / 8`, radius 6, выравнивание слева, hover `bg rgba(0,0,0,.03)` |
| **Submenu title** | 12 / 150%, wght 500, `opacity: .4`, padding `8 / 12 / 4` |
| **Footer link** | `opacity: .6` → hover 1 |
| **Inline (prose / changelog)** | `text-decoration: underline`, `opacity: .6` |
| **Heading-as-link** (`a.h3`, `a.type-heading-small`) | hover `opacity: .6` |
| **Breadcrumb** | flex, column-gap 8, не-текущие `opacity: .6` → hover 1 |
| **«→ Label»** | стрелка — обычный символ в тексте, не иконка-компонент |

### 3.4 Input

**Underline (базовый, футер, легаси):** 16px, padding `10 / 0`, `border-bottom: 1px`, фон прозрачный, radius 0, margin-bottom 15.

**Pill (`.form-wrap`, основной современный):**

| Свойство | Значение |
|---|---|
| Min-height | **48** |
| Padding | `14 / 20 / 11` |
| Radius | **32** |
| Font | 14 / 140% |
| Border | `1px rgba(0,0,0,0.1)` |
| Placeholder | `rgba(17,17,17,0.5)` |
| Отступ между полями | 18 |

Состояния (light / dark):

| Состояние | Light border | Dark border |
|---|---|---|
| Default | `rgba(0,0,0,.1)` | `rgba(255,255,255,.3)` |
| Hover | `rgba(0,0,0,.3)` | `rgba(255,255,255,.3)` |
| Focus | `#000000` | `#FFFFFF` |
| Filled (не в фокусе) | `rgba(0,0,0,.3)` | `rgba(255,255,255,.3)` |
| Error | текст ошибки `#FA0019` / `#FF5454`, 14 / 143%, wght 450 |

**Компакт (страница прайсинга):** height 42, radius 12, padding-inline 12, 14px wght 500, border `rgba(10,10,10,.3)`.

**Label:** 14 / 140%, wght 400, margin-bottom 6. **Helper (`.hs-field-desc`):** тот же стиль, `opacity: .6`.

### 3.5 Textarea

**Стилизованного варианта нет.** В разметке встречается только класс-хук `hs-fieldtype-textarea` без собственных визуальных правил — наследует базовый underline-input. В UI-kit добавлять только если решим расширять систему (пометить как «наше расширение»).

### 3.6 Select

| Вариант | Спецификация |
|---|---|
| Базовый | `min-height: 43`, radius **12**, padding `10 / 14`, 16px, шеврон-SVG справа 10, `appearance: none` |
| В `.form-wrap` | наследует pill-инпут: min-height 48, radius 32; шеврон 16×16 `opacity .6` справа 24 |
| Плейсхолдер | класс `.is-placeholder` → цвет `rgba(17,17,17,.5)` (тёмная тема `rgba(255,255,255,.4)`) |
| Калькулятор цены | radius 12, min-height 38, без тени |
| Кастомный dropdown (Choices.js) | список radius 20, item radius 12, padding `7.5 / 10 / 4`, hover `rgba(10,10,10,.1)`, тень `0 8px 16px rgba(10,10,10,.08)` |

### 3.7 Checkbox

| Свойство | Значение |
|---|---|
| Размер | **20 × 20** (в `.form-wrap`); базовый — 22 × 22 |
| Бокс | `::before`, border `1.25px rgba(0,0,0,0.16)`, radius **6** |
| Hover | border `1.25px rgba(0,0,0,0.3)` |
| Checked | fill `#000000` + белая галочка (SVG 18px по центру) |
| На тёмном | border `rgba(255,255,255,.16)` → hover `.3`; checked fill `#FFFFFF` + чёрная галочка |
| Отступ до текста | margin-right 8; текст с `margin-left: 28`, line-height 1.5 |

**Radio-кнопок в дизайн-системе нет.**

### 3.8 Multiselect `.ms-*`

| Часть | Спецификация |
|---|---|
| Control | min-height 48, radius **23**, padding 10, gap 6, bg white, border `1px rgba(10,10,10,.1)` → hover/focus `.3` |
| Tag | radius **16**, bg `rgba(10,10,10,.05)`, padding `6 / 8 / 2 / 14`, 13px wght 500, gap 8 |
| Tag remove | 20 × 20, radius 16, hover bg `rgba(10,10,10,.1)` |
| Dropdown | top `100% + 4`, radius 23, max-height 440, тень `0 6px 16px rgba(10,10,10,.08)`, padding-top 10 |
| Option | padding `8 / 24 / 4`, gap 8; hover `rgba(10,10,10,.03)`; selected `rgba(10,10,10,.05)` + wght 500 |

### 3.9 Header / Nav

| Свойство | Значение |
|---|---|
| Позиция | `fixed`, `z-index: 100` |
| Высота | **52** |
| Inner | grid `80px / 1fr / max-content`, column-gap 20, max-width 1496, padding-inline 32 |
| Wordmark | 53 × 20 |
| Nav ul | flex, column-gap **16** |
| Right block | flex, column-gap **8** |
| Мобайл (≤950) | padding-inline 24, grid `1fr / max-content / min-content`, nav скрыт, бургер 20px |

Темы (варианты компонента):

| Класс | Фон | Текст | Кнопка |
|---|---|---|---|
| default / `.black` | `--white` | `#0A0A0A` | primary чёрная |
| `.white` / `.bg-black` | `--blackish` | белый | белая (текст чёрный) |
| `.transparent-dark` (не скроллед) | прозрачный | `#0A0A0A` | primary |
| `.transparent-light` (не скроллед) | прозрачный | белый | белая |
| `.fully-transparent-light` | прозрачный | белый | белая |
| `.transparent.scrolled` | `--white` | чёрный | primary; border-bottom `1px rgba(0,0,0,.17)` |
| `.inverted-on-scroll.black.scrolled` | `--black` | белый | — |

При hover по любому пункту nav на прозрачном хедере фон становится белым (`--bg: #FFF`).

**Dropdown подменю:** radius **10**, padding 4, min-width **240**, bg white, тень `0 0 0 1px rgba(0,0,0,.05), 0 8px 16px rgba(0,0,0,.08)`, top `100% + 3`. Широкий вариант `.wide` — min-width 472, колонки flex 1.

**Announcement bar:** fixed сверху или снизу, padding `16 / 25 / 13`, текст 15 (мобайл 12), выделение — bold + underline; body получает offset 53 / 67 / 84.

### 3.10 Tabs — 4 типа

**A. Inline underline** `.tabs-nav.inline-tabs-nav`
column-gap 27 · item padding 8 · 14px wght 500 · default `opacity .4`, border-bottom 1px transparent · **active** `opacity 1` + border-bottom `1px currentColor`.

**B. Pill tabs** `.agents-features-tabs-nav`
gap 8, wrap, центр · item radius **32**, padding `9 / 16 / 5` · **hover** bg white + чёрный текст · **active** bg white (или `rgba(255,255,255,.7)` + blur 10 когда есть таймер) + полоса-таймер `.timer` (белая заливка слева направо) · рядом круглый play/pause 38 × 38.

**C. Vertical rail** `.tabs-nav.vertical-tabs`
padding-left 28 · рельс 4px radius 8 `rgba(10,10,10,.1)` слева · item padding-block 16, max-width 350 · `opacity .4` → hover `.8` → **active** 1 + индикатор 4px `#000` слева · внутри `strong` (заголовок, margin-bottom 2) + описание `.fade-8`. Мобайл — горизонтально, рельс сверху, 14px.

**D. Text list** `.teams-tabs-nav`
вертикальный список, `opacity .3` → **active** 1, у активного появляется `→` (`span` с `display: inline`). Размер наследуется от заголовка (в макете — крупный, ~32px).

**E. Side nav** `.integrations-nav` — колонка, gap 16, item gap 10, `opacity .4` → hover/active 1.

**F. Sticky pill nav** `.modes-sticky-nav` — контейнер `position: sticky; bottom: 16`, radius **32**, padding 8, gap 8, bg `rgba(10,10,10,.03)`, blur 4; item radius 20, padding `7 / 12 / 4`, 14px wght 500, active bg white.

### 3.11 Pill / Tag / Badge

| Компонент | Размер / padding | Radius | Fill / Border | Font |
|---|---|---|---|---|
| **`.pill`** | padding `4 / 6 / 1` | **8** | обводка тенью `0 0 0 1.5px #0A0A0A` | 14, wght **600**, lh 100%, ls −0.01em |
| `.pill.no-border` | padding `5 / 6 / 2` | 8 | без обводки | то же |
| `.eyebrow-tag` | padding `7 / 12 / 4`, margin-inline 10 | 20 | bg `--sand` | 14, wght 500 |
| `.learn-tag` / grid-tag | padding `6 / 10 / 4`, max-h 27 (21) | 32 | по контексту | 9 (мобайл 12), uppercase, ls +0.06em |
| `.coming-soon-tag` | padding `4 / 6 / 0` | 8 | bg `rgba(10,10,10,.05)`, blur 48, текст `rgba(10,10,10,.6)` | 12, wght 500 |
| `.custom-tag` | padding `4 / 8 / 4 / 6`, gap 4 | 8 | bg `rgba(10,10,10,.05)` | наследует |
| `.media-tag.new-tag` | min-h **40**, padding `0 / 16 / 0 / 12`, gap 6 | 12 | bg white + hairline-тень; позиция 32 / 32 | 14, wght 500 |
| `.change-tags > span` | padding `4 / 8`, gap 6, кружок 8×8 | 8 | bg `rgba(10,10,10,.03)`, текст `#9A9A9A` | наследует |
| `.events-listing-row-tag` | padding `7 / 10 / 5`, max-h 32 | 40 | border `1px rgba(0,0,0,.1)` | наследует |

> `.eyebrow` — **не чип**, а просто параграф с `margin-bottom: 24` над заголовком (часто 16px или uppercase-подпись).

### 3.12 Card — варианты

**Quote card** `.quote-card` (главный «карточный» паттерн):
bg `#FFFFFF` · radius **24** · padding `24 / 24 / 64` · тень hairline (`0 0 0 1px rgba(10,10,10,.05), 0 2px 4px rgba(10,10,10,.08)`)
внутри `.quote-card-content`: bg `--sand` `#F6F5F4`, radius **16**, padding **40**
автор: аватар **48 × 48** круг, `border: 2px solid #FFF`, `margin-top: -24`, padding-left 40, margin-bottom 30; имя + роль ниже.
Замерено: 461 × 396 при 3 карточках в ряду (ширина `33.33% − 16`, margin-right 24).

**Image card** `.image-card`: radius 24, aspect **4 / 5** (мобайл 4/6), padding `32 / 27`, column space-between, row-gap 48, фон-картинка `.bg` абсолютом. Замерено 340 × 425.

**Image grid card** `.image-grid-card`: radius **9**, overlay-контент сверху `padding 20 / 30`, max-width 314, row-gap 4, тэглайн `opacity .7`.

**Stat card** `.stat-card`: bg `#F7F7F7`, текст `#111111`, padding 32, radius 8, column space-between, row-gap 111.4, min-height 100%.

**Case study card** `.case-study-slide-card`: aspect **10 / 13**, radius 8, padding 30, row-gap 30, фон-медиа с опциональным затемнением 30%, hover `scale(1.03)` фона; логотип сверху.

**Product card** `.product-card`: radius **40** (мобайл 24), тень `0 8px 24px rgba(0,0,0,.12), 0 0 2px rgba(0,0,0,.04)`; `.top` padding 16 (внутренняя `.gc-5` — 24); `.bottom` padding `24 / 32`, grid `1fr / 160 / 1fr`.

**Home product card** `.home-product-card`: radius 16, margin-inline 32, padding `64 / 43`, по центру; состояние `.active` → margin 0, radius 0, padding-inline 75 (эффект «раскрытия на всю ширину»).

**Integrations card** `.integrations-card-wrapper`: radius 24, padding 32, bg `rgba(10,10,10,.03)`; список в 3 колонки (`columns: 3`), кнопка абсолютом bottom/left 32; стек карточек с отступом 16.

**Partnership service tile** `.partnership-service`: radius **24**, padding `20 / 24`, bg `rgba(10,10,10,.05)`, flex-column `justify-content: flex-end`, row-gap 26 (иконка-галочка сверху, подпись снизу), hover `opacity .6`. Замерено **341 × 104**. CTA-вариант той же плитки — bg чёрный, текст белый.

**CTA box** `.custom-cta-box`: radius 16, padding 24, border `1px rgba(0,0,0,.05)`, `--stack-gap: 31`.

**Start box** `.start-box`: aspect 352 / 317, медиа radius 24 (hover `scale(1.02)`), sticky-оверлей сверху padding `32.4 / 40`.

**Event card** `.future-event-card-big`: radius 24, padding 40, фон-медиа, контент column row-gap 120, вложенный `.event-card-nugget` с бордером `1px rgba(0,0,0,.1)`.

**Text card / block**: `.text-card` padding `48 / 56` (мобайл `32 / 28`); `.text-block` padding `46 / 64` (мобайл 32).

**Media box** `.media-box`: bg white, max-width 550; `.box-title` — padding-block `10 / 6` + border-bottom `1px rgba(10,10,10,.1)`; `.box-content` — padding-block `10 / 8`, flex space-between; кликабельный вариант `a.box-content` hover bg `#F5F5F5`.

### 3.13 Quote — не-карточные варианты

| Вариант | Спецификация |
|---|---|
| `.quote-wrap` | max-width **540**, `.quote` margin-bottom 1em, `.quote-id` padding-left 60, аватар 40 × 40 круг абсолютом слева, имя `opacity .7` |
| `.blockquote` (страничный) | padding-top 56; автор grid, аватар **40** круг, роль `opacity .65`, lh 137% |
| `.blockquote` (careers) | текст цитаты **36 / 120%**, аватар **48** квадрат radius 8, grid `48 / 1fr` gap 20, margin-top 44 |
| `.quote-slider .quote-slide` | ширина 50% − gap, padding-right 130, логотип высотой 30, стрелки 41px внизу справа (`previous` смещён на 60) |
| `.quote-wall .blockquote` | radius **35**, padding 30, bg white, тень `0 4px 24px rgba(0,0,0,.1)`; hover — карточка `scale(1.18)`, соседи затухают до 0.4 / 0.2 / 0.05 «волнами» |
| Оверлей-цитата на медиа | текст `.type-quote-01` 40 / 120%, ниже роль (19px) и организация (16px); в эталоне Figma — 40 padding внутри оверлея |

### 3.14 Pricing

**Важно: карточек с рамкой у Sana нет.** План — это колонка без фона и бордера.

Структура (замерено на `/products/sana/`):

```
section > .columns > .gc-12
  h2 "Pricing" (48px, по центру, .margin-l = 72)
  .margin-xl (100)
    .flex-cols  (--vertical: 60, 3 равные колонки, column-gap 18–20)
      .flex-col                      ← «Pricing plan»
        p.h3            (32px, margin-bottom 12)      ← название плана
        p.margin-s > strong (16px bold, mb 20)        ← цена
        a.btn                                          ← CTA (primary у Enterprise, soft у остальных)
        hr              (1px currentColor @20%, margin-block 36)
        ul.checklist    (li: grid 24 / 1fr, gap 16, margin-bottom 13)
```

Ширина колонки при контенте 1432 — **464**.

**Checklist:** `li` — grid `24px / 1fr`, column-gap 16, `align-items: start`; иконка-галочка 16–24px (`.type-body-big` вариант → 16px); отступ между пунктами 13.

**Pricing calculator** (страница `/pricing`): select radius 12 min-h 38 · custom range: трек 32px высотой, radius 12, bg `rgba(10,10,10,.1)`, заливка белая с hairline-тенью и «ручкой» 2 × 21 · `.total-price` 72px ls −0.04em, margin-top 30 · `.per-user-price` `opacity .6`, margin `24 / 32` · `.tailored-pricing-message` — скрытое сообщение для enterprise.

**Comparison row** `.comp-row`: grid `0.4fr / 0.2fr / 0.4fr`, column-gap 20, max-width **1110**, padding `40 / 40`, border-bottom `1px rgba(0,0,0,.1)`; строка-заголовок padding-block 18, цвет `rgba(0,0,0,.6)`; левая колонка `rgba(0,0,0,.6)` max-width 337, правая max-width 372. Мобайл — одна колонка, row-gap 12.

### 3.15 Logo cell / Logo strip

| Компонент | Спецификация |
|---|---|
| `.static-logos` | grid `repeat(var(--numLogos, 6), 1fr)`, column-gap **20**, `align-items: center`; ячейка flex center; `img { max-height: 66; width: auto }`. Мобайл — `--numLogosMobile` (по умолчанию 2). Замерено: 1432 × 65, 8 логотипов |
| `.partner-logo-grid` | grid **7 колонок**, column-gap 20; `.slot` height **100** (мобайл 60), логотип `object-fit: contain`; ротация логотипов через `.hidden` (opacity 0, transition 1s); `.logo-pool` — скрытый резервуар |
| `.logo-border` | border-top / -bottom `1px rgba(255,255,255,.1)` — обрамление полосы на тёмном |
| `.medals` | flex center wrap, gap 20, padding-block 30 (бейджи G2 и т.п.) |

Полоса логотипов обычно лежит на full-bleed фоне `rgba(10,10,10,.03)` ≈ `#F6F6F6`, с заголовком `.h3` слева или по центру.

### 3.16 CTA banner

На продуктовой странице — секция с центрированным `h2` (48), лидом (16 / 140%) и одной primary-кнопкой.
В эталоне Figma (`13 CTA`) — плашка 1232 × 200 с padding 56, текст слева (`48px` + `28px` лид), кнопка справа.
`.fixed-cta` — sticky снизу: padding 24, градиентная белая подложка `::after` (высота 100% + 16), кнопка hover fill `#2E2E2E`.

### 3.17 Footer

| Часть | Спецификация |
|---|---|
| `.site-footer` | padding `40 / 0 / 24` (внутри `.wrap` 1496 / 32) |
| `.site-footer-inner` | grid 2 колонки по `50% − 10`, column-gap 20 (мобайл — 1 колонка, gap 40) |
| `.footer-left` | flex-column space-between, row-gap 20: символ 40px сверху, newsletter снизу |
| `.footer-right` | grid **3 колонки**, column-gap 20 (≤768 — 2 колонки, row-gap 32) |
| `.footer-nav-col` | заголовок `p` margin-bottom **24** (мобайл 12); ссылки — flex-column, row-gap **8**, `opacity .6` → hover 1 |
| Подменю в футере | раскрывается вверх: radius 10, padding 4, min-width 240 (`.wide` 472), та же dropdown-тень |
| `.footer-newsletter` | max-width **220**, margin-top 64; underline-input 14 / wght 450; плавающий лейбл «Subscribe to our newsletter» уезжает вверх на −22 при фокусе; линия под полем 170 → 100% ширины; сабмит — «→» 32 × 32 справа |
| `.site-footer-bottom` | margin-top **70**, padding-block 16; копирайт `opacity .5`; соцссылки flex column-gap **24**, `opacity .6` → 1; «A Workday company» max-width 131 `opacity .6` |
| Символ Sana | 40px, при появлении — анимация переворота |

### 3.18 Media frame

| Аспект | Класс |
|---|---|
| 16 / 9 | `.media.landscape` |
| 668 / 375 | `.media.hero` |
| 41 / 30 | `.media.landscape-tall` |
| 1 / 1 | `.media.square` |
| 9 / 16 | `.media.portrait` |
| 36 / 19 (мобайл 4/5) | `.media.banner` |
| 8 / 4 (мобайл 8/7) | `.media.event-image` |
| авто | `.media.natural` |

Радиусы: `.rounded` 4 · `.rounded-8` 8 · `.rounded-m` **16** · `.rounded-l` **24** · `.rounded-32` 32.
Содержимое — `object-fit: cover`, абсолютом на 100% / 100%.

Дополнения: `.media-caption` — 12px, margin-top **16** · `.media.with-logo .logo` — абсолют 32 / 32 · `.media.with-overlay` — контент по центру · `.media.with-embed .play-icon` — 44px по центру, hover `opacity .6` · `.media.with-box` / `.media-sticker` — «наклейка» 400px, sticky снизу.

> Для RUBIN медиа = **серый прямоугольник с подписью внутри**, аспект и радиус берём из этой таблицы (базово `.rounded-l` 24 + 16/9).

### 3.19 Divider

| Контекст | Значение |
|---|---|
| Базовый `hr` | `border-bottom: 2px solid #000` |
| `.page hr` (актуальный) | `border-bottom: 1px solid currentColor`, `opacity: .2`, `margin-block: 36` |
| `.page hr.no-margin` | margin-block 0 |
| `.bg-black hr` | 1px `#68677E`, margin `18 / 0 / 13` |
| Утилиты | `.border-subtle` / `-top-` / `-bottom-` = `1px rgba(0,0,0,.1)` |
| Вертикальный | `.two-col.separator::after` — 1px `rgba(0,0,0,.1)` по центру, высота 100% |

### 3.20 Accordion / FAQ

**FAQ row** `.faq-row` (актуальный, светлый):
border-top `1px rgba(10,10,10,.05)` · padding `16 / 90 / 32 / 0` · внутри `.columns` с row-gap 8 → **вопрос слева 6 колонок, ответ справа 6 колонок** · шеврон 16 × 16 справа, top 16, при открытии `rotate(180deg)`, transition .5s.
Замерено: 1432 × 71 в свёрнутом виде.

**Accordion (тёмная секция)** `.accordion`:
левая колонка max-width `50% − 10` · `.accordion-rows` margin-top 70 (мобайл 40)
строка `.top`: padding-left 22, padding-block 8, 22px / 1.5em, цвет `rgba(255,255,255,.6)`, border-bottom `1px rgba(255,255,255,.3)`; маркер-квадрат 8 × 8 `--red` слева (`opacity .6` → 1)
активная / hover: текст белый, бордер `rgba(255,255,255,.6)`, маркер `opacity 1`
`.bottom`: padding `16 / 0 / 48`, 18px / 1.5em, `opacity .7`
медиа-панель справа `50% − 10`, абсолютом, opacity 0 → 1 у активной.

### 3.21 Stats

| Компонент | Спецификация |
|---|---|
| `.key-stats` / `.key-stat` | flex space-between, margin-top **64**, по центру; элемент max-width 300, подпись max-width 207 `opacity .6` |
| `.stat-block` | border-top `1px` (20% чёрн./бел.), padding-top **32**, flex-column row-gap 8 · контейнер `.stat-blocks` gap 20 |
| `.roi-stat` | flex `1 1 230`, padding-inline 24, правый разделитель `1px rgba(10,10,10,.1)`; лейбл `.type-small` `opacity .8` margin-bottom 34; число `.h2` margin-bottom 9; текст max-width 210 |
| `.feature-counter` | aspect 191 / 176, max-width **191**, radius **64** (мобайл 130 / 44); число **112px** wght 500 ls −0.03em, `tabular-nums` |
| Метрики в эталоне Figma | 6 колонок по 195.3: лейбл 16 → число 40 → подпись |

### 3.22 Slider UI

| Часть | Спецификация |
|---|---|
| Контейнер точек | `position: static`, padding `8 / 20 / 9`, min-height **34**, radius **34**, bg `rgba(0,0,0,.05)`, `width: fit-content` |
| Точка | 6 × 6, radius 8, margin `0 4.5`, bg `rgba(0,0,0,.1)`; hover → чёрная |
| Активная точка | ширина **80** (transition .4s), внутри `.timer` — чёрная заливка прогресса |
| Обвязка `-ui-wrapper` | margin-top **63** (мобайл 38), flex center, gap 16 |
| Стрелки | см. §3.2 |
| Слайды | ширина: image-card `25% − 18`; quote-card `33.33% − 16` (≤1400 `50% − 12`, ≤950 95%); margin-right 24 |

### 3.23 Tooltip

`.icon-with-tooltip .tooltip-text`: bg `--black`, текст белый 14px wght 500, radius **32**, padding `5.5 / 12 / 2`, `white-space: nowrap`, позиция над иконкой по центру.
Мобайл: radius 12, padding `12 / 12 / 10`, min-width 195, перенос разрешён.
Триггер `.icon-with-tooltip` — padding 8.

### 3.24 Integration item

`.integration-item`: bg white, border `1px rgba(10,10,10,.05)`, radius **32**, padding **20**, flex row, column-gap 12, span 6 колонок.
Иконка `.integration-item-icon` — 40 × 40, radius **10**, border `1px rgba(10,10,10,.05)`, `object-fit: contain`.
Компакт `.narrow` — span 3, padding `16 / 20`, radius **16**, иконка 24 × 24 radius 6, тег скрыт.
Список в карточке интеграций: item-иконка 40 × 40 radius **14** с hairline-тенью, grid `40 / 1fr` gap 14, отступ 12.

### 3.25 Прочее (существует, но специфично)

| Компонент | Кратко |
|---|---|
| `.speaker` | grid `48 / 1fr`, gap 20; фото 48 × 48 radius **8** |
| `.events-listing-row` | 12-колоночный grid, gap `24 / 20`, margin-bottom 40, hover `opacity .6` |
| `.changelog-row` | grid `25% / 75%` (дата / контент), margin-bottom 60; пагинация prev/next с border-top |
| `.features-list-row` | grid 5 колонок, gap 20; чётные строки — подложка `rgba(104,103,126,.1)`; заголовок колонки border-top `1px #68677E`, padding-top 23 |
| `.business-info` | grid `122 / 1fr`, gap 24; текст 11 / 13, uppercase, ls +0.04em |
| `.toc` | sticky top 100, bg `rgba(10,10,10,.05)`, radius 0.4em, padding 32, кастомный скроллбар 8px |
| `.chat-bar` | max-width **900**, height 77, radius **70**, bg white, hairline-тень + blur 18; внутри кнопка radius 40, bg чёрный, padding `10 / 44 / 7 / 16` |
| `.cookie` | сторонний баннер, единственное место с фиолетовым градиентом `#4700DE → #5235FF`. **Не часть бренд-системы** |

---

## 4. Чего на сайте НЕТ

Не выдумывать и не добавлять «для полноты» — этого в системе Sana нет:

- **Focus-ring / focus-visible.** Везде `outline: 0`. Если делаем свой kit — это осознанное расширение, а не копия Sana.
- **Radio buttons.**
- **Switch / toggle** как контрол (есть только круглая кнопка play/pause в слайдерах).
- **Textarea** со своим оформлением.
- **Stepper, spinner, number input.**
- **Progress bar** как компонент (прогресс есть только как заливка активной точки слайдера и pill-таба).
- **Modal / dialog** в брендовом стиле. `.dialouge` — легаси-обёртка для форм (radius 15, max-width 700); cookie-поп-ап — сторонний.
- **Toast / snackbar.** `.wd-toast` — маленький Workday-баннер, не универсальный компонент.
- **Date picker** брендовый (используется сторонний Pikaday).
- **Table** как компонент. Вместо неё — «псевдотаблицы» на grid: `.comp-row`, `.features-list-row`, `.events-listing-row`.
- **Pagination** (кроме prev/next в changelog).
- **Breadcrumb-разделители / иконки** (только gap 8 и opacity).
- **Avatar group / stacked avatars.**
- **Skeleton / loading states.**
- **Empty states.**
- **Sidebar / app shell / dashboard-layout.**
- **Семантические цвета состояний.** Есть только error (`#FA0019` / `#FF5454`). Ни success, ни warning, ни info в системе не заданы.
- **Отдельные dark-theme токены.** Тёмная тема собирается утилитами: `.bg-black` / `.bg-off-black` + `.white` + белые альфа-бордеры.
- **Иконочная библиотека с уровнями размеров.** Иконки — монохромный SVG-спрайт (`<use xlink:href="#id">`), `fill/stroke: currentColor`, размер = `1em` от текста (типовые: 16, 18, 20, 24, 32).
- **Больше двух размеров кнопки.** Только 38 (контент) и 36 / 14px (хедер).
- **Elevation-шкала.** 4–5 разных теней, не система уровней.
- **Компонент «pricing card».** Планы — колонки без фона и рамки.
- **Компонент «eyebrow chip».** `.eyebrow` — просто текст с отступом.

---

## 5. Маппинг: компонент Sana → имя в Figma

Схема именования: `Категория/Компонент` + property-варианты. Всё, что можно, делаем **компонентом с variants**, а не отдельными фреймами.

### 5.1 Foundations (styles / variables)

| Sana | Figma |
|---|---|
| CSS-переменные цветов | Variables collection `Color` → группы `Base/*`, `Alpha/*`, `Accent/*` |
| `--white` / `--black` / `--blackish` / `--sand` | `Color/Base/White`, `Base/Black`, `Base/Off-black`, `Base/Sand` |
| `rgba(0,0,0,.05 / .1 / .6)` | `Color/Alpha/Black-05`, `Alpha/Black-10`, `Alpha/Black-60` |
| `rgba(255,255,255,.1 / .3)` | `Color/Alpha/White-10`, `Alpha/White-30` |
| `--red` | `Color/Semantic/Error` |
| type scale | Text styles `Display/72`, `H1/72`, `H2/48`, `H3/32`, `H4/22`, `Body/16`, `Body Large/18`, `Caption/14`, `Micro/12`, `Overline/12 Caps` |
| `.shadow-medium`, hairline, dropdown | Effect styles `Elevation/Card Hairline`, `Elevation/Dropdown`, `Elevation/Medium`, `Elevation/Product` |
| `.wrap` / `.columns` | Grid style `Grid/Desktop 1728` (12 cols · 101 · gutter 20 · margin 148) и `Grid/Desktop 1440` |
| spacing utilities | Variables `Space/4 … Space/120` |
| radii | Variables `Radius/6 · 8 · 12 · 16 · 24 · 32 · Full` |

### 5.2 Компоненты

| Sana (CSS / DOM) | Figma component | Variants (properties) |
|---|---|---|
| `.btn` | `Button` | `Variant: Primary / Soft / Ghost / Secondary / Inverse` · `Size: Default 38 / Header 36` · `Icon: None / Leading / Trailing` · `State: Default / Hover / Disabled` |
| круглые стрелки, play/pause | `Button / Icon Round` | `Size: 34 / 38 / 41` · `Theme: Light / Dark` · `State: Default / Disabled` |
| `a`, nav-ссылки | `Link` | `Type: Inline / Nav / Submenu / Footer / Breadcrumb` · `State: Default / Hover / Active` |
| `.form-wrap input` | `Input / Text` | `State: Default / Hover / Focus / Filled / Error` · `Theme: Light / Dark` · `Size: Pill 48 / Compact 42 / Underline` |
| — (нет на сайте) | `Input / Textarea` | помечать как **extension**, не Sana |
| `select` | `Input / Select` | `State: Placeholder / Filled / Open` · `Theme: Light / Dark` |
| `input[type=checkbox]` | `Input / Checkbox` | `State: Off / On / Hover` · `Theme: Light / Dark` |
| `.ms-*` | `Input / Multiselect` | `State: Empty / With tags / Open` |
| `.ms-tag` | `Input / Select Tag` | `State: Default / Hover remove` |
| `.pricing-calculator .custom-range` | `Input / Range` | — |
| label + `.hs-field-desc` + error | `Form / Field` | `Helper: Off / On` · `Error: Off / On` |
| `.site-header nav a` | `Nav / Item` | `State: Default / Hover / Active` · `Chevron: Off / On` |
| `.sub-menu-menus` | `Nav / Dropdown` | `Width: 240 / 472` |
| `.site-header` | `Nav / Header` | `Theme: Light / Dark / Transparent-light / Transparent-dark / Scrolled` |
| `.announcement-bar` | `Nav / Announcement Bar` | `Position: Top / Bottom` |
| `.tabs-nav.inline-tabs-nav` | `Tabs / Inline Underline` + `Tabs / Inline Item` | `State: Default / Active` |
| `.agents-features-tabs-nav` | `Tabs / Pill` + `Tabs / Pill Item` | `State: Default / Hover / Active / Active+Timer` |
| `.tabs-nav.vertical-tabs` | `Tabs / Vertical Rail` + item | `State: Default / Hover / Active` |
| `.teams-tabs-nav` | `Tabs / Text List` + item | `State: Default / Active` |
| `.modes-sticky-nav` | `Nav / Sticky Pill Nav` | — |
| `.pill` | `Badge / Pill` | `Border: On / Off` |
| `.eyebrow-tag` | `Badge / Eyebrow Tag` | — |
| `.learn-tag` | `Badge / Tag Uppercase` | — |
| `.coming-soon-tag`, `.custom-tag`, `.change-tags` | `Badge / Soft Tag` | `Icon: None / Dot / Glyph` |
| `.media-tag.new-tag` | `Badge / Media Tag` | — |
| `.quote-card` | `Card / Quote` | `Avatar: On / Off` |
| `.image-card` | `Card / Image 4:5` | — |
| `.image-grid-card` | `Card / Image Grid` | `Overlay: On / Off` · `Width: Full / 80% / 60%` |
| `.stat-card` | `Card / Stat` | — |
| `.case-study-slide-card` | `Card / Case Study 10:13` | `Filter: On / Off` |
| `.product-card` | `Card / Product` | — |
| `.home-product-card` | `Card / Product Wide` | `State: Default / Active` |
| `.integrations-card-wrapper` | `Card / Integrations` | — |
| `.partnership-service` | `Card / Service Tile` | `Theme: Soft / Dark CTA` |
| `.custom-cta-box` | `Card / CTA Box` | — |
| `.start-box`, `.future-event-card-big` | `Card / Media Overlay` | `Ratio: 352:317 / Custom` |
| `.text-card`, `.text-block` | `Card / Text` | `Padding: L (48/56) / M (46/64)` |
| `.media-box` | `Card / Media Box` | `Rows: 1 / 2 / 3` |
| `.blockquote`, `.quote-wrap` | `Quote / Block` | `Avatar: None / Circle 40 / Square 48` |
| оверлей-цитата на медиа | `Quote / Media Overlay` | — |
| `.quote-wall .blockquote` | `Quote / Wall Card` | — |
| `.flex-col` в прайсинге | `Pricing / Plan Column` | `CTA: Primary / Soft` · `Featured: Off / On` |
| `ul.checklist li` | `List / Check Item` | `Lines: 1 / 2` |
| `.comp-row` | `Table / Comparison Row` | `Type: Header / Body` |
| `.pricing-calculator` | `Pricing / Calculator` | — |
| `.static-logos .static-logo` | `Logo / Cell` | — |
| `.static-logos` | `Logo / Strip` | `Count: 5 / 6 / 7 / 8` |
| `.partner-logo-grid` | `Logo / Grid 7` | — |
| CTA-секция / `13 CTA` | `Section / CTA Banner` | `Layout: Centered / Split` |
| `.fixed-cta` | `Section / Sticky CTA` | — |
| `.site-footer` | `Section / Footer` | `Theme: Light / Dark` |
| `.footer-nav-col` | `Footer / Nav Column` | `Items: 4 / 5 / 6` |
| `.footer-newsletter` | `Footer / Newsletter` | `State: Idle / Focus / Filled` |
| `.media` | `Media / Frame` | `Ratio: 16:9 / 4:5 / 1:1 / 9:16 / 41:30 / 36:19 / 668:375` · `Radius: 8 / 16 / 24 / 32` · `Caption: Off / On` · `Overlay: None / Play / Logo` |
| `hr`, `.border-*` | `Divider` | `Direction: Horizontal / Vertical` · `Theme: Light / Dark` |
| `.faq-row` | `Accordion / FAQ Row` | `State: Closed / Open` |
| `.accordion` | `Accordion / Dark Row` | `State: Default / Active` |
| `.key-stat` | `Stat / Key` | — |
| `.stat-block` | `Stat / Block` | `Theme: Light / Dark` |
| `.roi-stat` | `Stat / ROI` | `Divider: On / Off` |
| `.feature-counter` | `Stat / Counter Circle` | — |
| точки + стрелки + autoplay | `Slider / Controls` | `Dots: 3…9` · `Autoplay: Off / On` |
| `.flickity-page-dots .dot` | `Slider / Dot` | `State: Default / Active` |
| `.icon-with-tooltip` | `Tooltip` | `Direction: Up / Down` · `Width: Auto / 195` |
| `.integration-item` | `Integration / Item` | `Size: Full 32r / Narrow 16r` · `Tag: Off / On` |
| `.speaker` | `Person / Row` | — |
| inline SVG sprite | `Icon / *` | `Size: 16 / 18 / 20 / 24 / 32` — все на currentColor |
| wordmark / symbol | `Brand / Wordmark`, `Brand / Symbol` | — |

---

## 6. Сверка с эталоном в Figma (RUBIN · нода `156:68231` «Ref · Sana»)

Эталон — **1440 × 9681**, 15 секций: `00 Nav · 01 Hero · 02 Platform · 03 Features · 04 Metrics · 05 Testimonials · 06 Model agnostic · 07 Teams · 08 Partnership · 09 Integrations · 10 iOS app · 11 Logos · 12 Pricing · 13 CTA · Footer`.
Порядок секций **совпадает** с live `/products/sana/` — как каркас нарратива эталон корректен.

Но по метрикам эталон — это **вольная реинтерпретация**, а не 1:1. Расхождения:

| Параметр | Live sanalabs.com | Эталон Figma 156:68231 | Что делать в RUBIN |
|---|---|---|---|
| Артборд | 1496 max (контент 1432) | 1440 | **1728** (по правилам проекта) |
| Боковое поле | 32 (контент 1432) | **104** (контент 1232) | взять live: контент **1432**, поле 148 при 1728 |
| Hero H1 | 72 / 68.4 (95%), ls −0.03em, Sana Sans Medium | **88 / 84**, ls −2.6px, Inter Medium | использовать **72 / 68**, Google Sans Medium |
| Hero lead | 16 / 22.4 | **20 / 30** | 16 / 22.4 (или 18 / 24, если нужен воздух — согласовать) |
| Цвет текста | `#000000` / `#0A0A0A` | `#0A1217` | `#0A0A0A` |
| Вторичный текст | `opacity .6` от чёрного | `#6A7278` | `rgba(10,10,10,.6)` |
| Кнопка | h **38**, padding `10/16/7`, radius **32**, 16px | h 37, padding `10/22`, radius **999**, 14px | взять live: 38 / `10 16 7` / 32 / 16px |
| Кнопка в хедере | h **36**, radius 36, 14px | тот же btn 37 | развести два размера |
| Высота хедера | **52** | 48 | 52 |
| Nav gap | 16 | 24 | 16 |
| Медиа-радиус | 24 (`.rounded-l`) | 24 | ✅ совпадает |
| Прайсинг | колонки **без рамки**, `hr` + checklist | 3 плашки 398.7 × 574 с padding 32 | использовать live-паттерн (колонки + `hr`) |
| Шрифты | Sana Sans + SanaSerif | Google Sans + Inter | Google Sans (правило проекта), Inter как fallback |
| Гаттер | 20 | 18 (между колонками 1232) | 20 |
| Точки слайдера | активная **80 × 6**, r8, контейнер-пилюля | активная 24 × 8, без контейнера | взять live |

**Вывод:** эталон использовать как **карту секций и порядок блоков**, а числа (типографика, отступы, размеры кнопок, сетка) брать из этого документа — они сняты с живого сайта.

---

## 7. Порядок сборки UI-kit в Figma (предложение)

1. Variables: `Color`, `Space`, `Radius` → Text styles → Effect styles → Grid styles.
2. Атомы: `Icon/*`, `Button`, `Link`, `Badge/*`, `Divider`, `Media/Frame`.
3. Формы: `Input/*`, `Form/Field`.
4. Молекулы: `Nav/*`, `Tabs/*`, `Slider/*`, `List/Check Item`, `Tooltip`, `Stat/*`.
5. Карточки: `Card/*`, `Quote/*`, `Pricing/*`, `Logo/*`, `Integration/*`.
6. Секции: `Section/CTA Banner`, `Section/Footer`, `Accordion/*`.
7. Страничный шаблон 1728 с Grid style и вертикальным ритмом секций из §1.1.

---

## 8. Что осталось непроверенным

- **`brand.sanalabs.com` — только ZIP** (`260402_sana-logotype.zip`, v0.1 от 02.04.2026). Официальные правила по отступам логотипа, минимальным размерам, охранному полю и фирменной палитре на странице не опубликованы. Если нужны — скачать архив и разобрать отдельно (нужно ваше подтверждение на скачивание).
- **Sana Sans / SanaSerif — проприетарные**, в Figma их не будет. Все замены помечены в §1.3.
- Страницы `/pricing`, `/integrations`, `/security`, `/stories`, `/careers` не открывались покомпонентно — но их стили лежат в тех же `base.css` + `web2.css`, которые разобраны полностью, поэтому пропущенных компонентов быть не должно. Если найдётся что-то новое — дописать сюда.
