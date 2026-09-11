# Замеры референсов (viewport 1920×1080)

Снимали не только шрифты: **отступы, max-width, ритм секций, размеры карточек, nav, кнопки, вайб композиции**.

## sana.ai → вайб D

| Токен | Значение @1920 | На артборд 1440 |
|-------|----------------|-----------------|
| content maxW | 1432 | ~1232 |
| side margin | 244 | padX **104** |
| H1 | 88 / lh 83.6 / ls −2.64 | 88 |
| H1 → dual cards | ~118 | afterH1 **100** |
| Dual cards | 707×759, gap **18** | cardH **560**, cardGap **18** |
| Nav height | 36 | **48** |
| Button | h 36, pill, 14px | btnH **36** |
| Вайб | Quiet white, dual product photography, soft `#F6F5F4` | |

## basecraft.ru → вайб C

| Токен | Значение @1920 | На артборд 1440 |
|-------|----------------|-----------------|
| content maxW | **1200** | 1200 → padX **120** |
| Section padY | 80 (py-20) / **96** (py-24) / 120 | padY **96** |
| Hero | `100svh` | heroH **900** |
| Gaps | 24 / 40 / 56 | gap 24, gapLg 40 |
| Nav | ~57 | **56** |
| Button | h 40, pill 9999, 14px | btnH **40**, rBtn pill |
| Вайб | Warm dense, много медиа, soft cards | |

## hyperfoundation.org → вайб B

| Токен | Значение @1920 | На артборд 1440 |
|-------|----------------|-----------------|
| H1 column | left ~627, w ~666 (воздух) | manifestoW **700** |
| Side (features) | ~194 | padX **152** |
| Section padY | **160** | padY **160** |
| H1 | 90 / lh 90 | 90 |
| Lead-ish | 28 light | 28 |
| Вайб | Extreme air, manifesto, almost no chrome | |

## 11x.ai → вайб A

| Токен | Значение @1920 | На артборд 1440 |
|-------|----------------|-----------------|
| content maxW | 1440, side **240** | padX **96** (cinema) |
| H1 | **152** (short EN) | **112** (длинный RU) |
| H2 | 56–64 | 56 |
| Inner maxW | иногда 1152 | — |
| Section | full-bleed + sparse pad | padY **140**, heroH **960** |
| Вайб | Cinema full-bleed, sparse, high contrast | |

## Принцип

Вайбы отличаются **пакетом**: type + spacing + radius + palette + composition.  
Нельзя сводить реф только к `font-size`.
