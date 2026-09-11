# RUBIN — 13 референсов в Figma

Плагин генерирует **13 лендингов** — по одному на каждый сайт из брифа.  
**Google Sans** + **наши блоки RUBIN** + **верстка референса**.

## Список (13)

| # | Реф | Композиция |
|---|-----|------------|
| 01 | [basecraft.ru](https://basecraft.ru/) | Warm bento: overlapping media, metrics 6-col, gallery 3×2, tinted myths |
| 02 | [11x.ai](https://www.11x.ai/) | Cinema dark: full-bleed video, dual worker-cards, people strips |
| 03 | kling.ai | Centered giant video hero + 3 step cards |
| 04 | vidu.com | Split: portrait + copy, dual product videos |
| 05 | moonvalley.ai | Cinematic video + before/after narrative |
| 06 | lumalabs.ai | Bold centered H1 + huge video + stats band |
| 07 | runwayml.com | Product tool hero + horizontal tool cards |
| 08 | [tavus.io](https://tavus.io/) | Face video + 3 model cards (ясность / безопасность / люди) |
| 09 | harvey.ai | Strict centered typography, 3 trust columns |
| 10 | descript.com | Split product + vertical workflow timeline |
| 11 | arcads.ai | 2×2 video ad grid with people |
| 12 | [sana.ai](https://sana.ai/) | Dual soft photography cards + email CTA |
| 13 | synthesia.io | Avatar grid 4×2 + logo strip |

## Наши блоки (контент RUBIN)

- Hero: «Крипта — это про людей»
- Мифы · Три шага · Люди · Доверие · Продукт · CTA · Подвал
- Фото-плейсхолдеры с caption-bar и бейджем «ФОТО»
- Без скринов профита и обещаний доходности

## Шрифт

**Google Sans** (fallback: Google Sans Text → Product Sans → Inter)

## Design System (UI-kit)

Страница **«DS · RUBIN components»** — отдельный плагин, артборды лендинга не трогает.

Единственный актуальный исходник DS — **`figma-ds-plugin/code.js`**. Правки вносить только туда.

1. Figma → Plugins → Development → Import **`figma-ds-plugin/manifest.json`**
2. Запустить **RUBIN DS**
3. Страница создаётся/обновляется: Foundations → Actions → Forms → Navigation → Cards → Feedback → Layout

Спека: `docs/SANA-DESIGN-SYSTEM.md` · шрифт Google Sans · артборд 1728.

Компоненты-расширения (нет на референсе, добавлены под блоки лендинга): `Section / Hero`, `Steps / Card`, `Timeline / Row 6`.

Дефолтные тексты внутри компонентов — на русском и про RUBIN, чтобы инстансы на лендинге не тянули чужие подписи.

## Запуск (лендинги)

1. Установи Google Sans в Figma (опционально)
2. Plugins → Development → Import `manifest.json`
3. **RUBIN Landing Generator**

Страница: `RUBIN · 13 референсов · Google Sans`  
Сетка: 7 артбордов в верхнем ряду + 6 в нижнем.
