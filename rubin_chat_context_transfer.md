# Rubin — полный контекст облачного чата (для переноса в локальный)

Документ для загрузки в новый локальный чат Cursor. Содержит бренд, правила, что уже сделано, актуальные файлы, открытые задачи и важные ограничения пользователя.

Дата снимка контекста: **2026-09-11**

---

## 1. Проект

**Бренд:** Rubin  
**Суть:** crypto exchange / сервис для **квалифицированных инвесторов**  
**Метафора:** рубин как корунд / инженерный материал; астеризм (шестилучевая звезда); углы **30° / 90° / 150°**

Это работа по **бренд-идентичности и визуальным ассетам**, не по коду продукта.  
Облачный агент работал **без доступа к git-репозиторию команды**. Ассеты лежат локально в артефактах агента.

---

## 2. Визуальная система (зафиксировано)

### Марка (знак)
- Удлинённый **шестилучевой астеризм** (asterism / spark)
- Вертикальные лучи длиннее
- 4 более коротких диагональных луча
- **Solid** (без пустоты в центре)
- Не обычная равносторонняя звезда, не Star of David, не 8-конечная compass rose с горизонталями

### Цвета
- Ruby red: `#E01119` (ориентир RGB 224 / 17 / 25)
- Deep: `#800820`
- Hot / warm accent: `#FF8C62` (встречался как hot coral)

### Геометрия
- Только углы **30 / 90 / 150**
- Градиенты — вдоль направлений, перпендикулярных штриховке (0 / 60 / 120)
- Скругления графики запрещены (кроме физических объектов: карты, визитки)

### Слово
- Wordmark: **Rubin** (title case)
- На картах часто ghost/полупрозрачный крупный «Rubin» на всю ширину

### Применение знака
- На ноутбуке/баннерах — можно градиентный mark
- На одежде — **flat** ruby или white
- Laptop stickers: 5–6 бренд-элементов включая mark

---

## 3. Правила пользователя (критично)

1. **Не менять дизайн** (отступы, шрифты, цвета, размеры, визуал) без прямого указания.
2. Делать **только то, что явно попросили**.
3. Любые действия с **GitHub — только после подтверждения**.
4. Коммиты/пуш — только с разрешения.
5. Если ссылка на Figma — pixel perfect по макету, не придумывать.
6. Сначала завершать текущую задачу, потом новые.
7. Пользователь часто просит **прямые публичные ссылки** на файлы (tmpfiles / litterbox; gofile часто мёртвый).
8. Для девушки / lifestyle: не супермодель, без сильного макияжа, рабочий кадр.

---

## 4. Что уже сделано (deliverables)

### Банковские карты
- `02_bankcard_ramp.jpg` — красная рампа с зерном, ghost «Rubin», QUALIFIED, mark, номер/имя
- `02_bankcard_axes.jpg` — светлое поле + узор осей 30/90/150 (вместо hatch), тёмный ghost «Rubin»
- Также был pattern/hatch вариант: `02_bankcard_pattern.jpg`

### Канцелярия
- `07_letterhead_blank.jpg` — бланк A4 (красная полоса слева, mark + Rubin, футер)
- `08_business_card_front.jpg` / `08_business_card_back.jpg` — визитка 90×50
- Мокапы: `08_business_card_front_mock.jpg`, `08_business_card_back_mock.jpg`

### Lifestyle / merch / pin (вторично, пользователь позже сказал «пиджак не нужен»)
- Худи fullbody: `01_hoodie_fullbody.jpg`
- Ноутбук Apple: `04_laptop_apple.jpg`
- Пин на пиджаке: `05_pin_lapel_*`
- Пин на кожаной куртке: `06_pin_leather_*`

### Девушка у ноутбука (актуальная ветка)
- **Исходник чистый (рабочий):** `03_girl_SOURCE_clean.jpg`  
  также: `assets/hero_girl_ref_black_tee.png` (1536×1024)
- Кадр: девушка с волосами вверх, чёрная oversized футболка, без сильного макияжа, работает за MacBook, Apple logo на крышке, hatch на стене, matcha на столе
- Были попытки заменить серёжку на золотой знак и убрать тату — генерации часто ломали кадр / оставляли артефакты
- Пользователь решил править через **Nano Banana** сам

### Архивы
- `rubin_cards_blank_vizitki.zip`
- `rubin_stationery_and_cards.zip`
- `rubin_all_photos.zip`
- `rubin_deliverables.zip`

---

## 5. Актуальные пути файлов (облачная VM)

Корень артефактов:
```
/opt/cursor/artifacts/
```

Логотипы:
```
/opt/cursor/artifacts/assets/logos/
  mark.png / mark_flat.png / mark_white.png / mark_solid.png
  lockup.png / lockup_flat.png / lockup_white.png
```

Delivery:
```
/opt/cursor/artifacts/assets/delivery/
```

Чистая девушка (исходник для правок):
```
/opt/cursor/artifacts/03_girl_SOURCE_clean.jpg
/opt/cursor/artifacts/assets/hero_girl_ref_black_tee.png
```

Карты / бланк / визитки:
```
/opt/cursor/artifacts/02_bankcard_ramp.jpg
/opt/cursor/artifacts/02_bankcard_axes.jpg
/opt/cursor/artifacts/07_letterhead_blank.jpg
/opt/cursor/artifacts/08_business_card_front.jpg
/opt/cursor/artifacts/08_business_card_back.jpg
```

---

## 6. Открытая задача на момент переноса

Пользователь работает с **чистой фоткой девушки**.

Последний запрос по правке:
- Фото **уже нужного размера**
- Нужно **только убрать тату с рук**
- Достройку снизу на 15% — **отменили**

Промпт, который уже выдали для Nano Banana:

```
Edit this exact photo. Keep everything identical: same woman, face, hair, clothes, laptop, cafe, lighting, framing, size.

Only change: completely remove all tattoos from both arms and hands. Clean natural bare skin, no ink, no remnants.

Photoreal. Change nothing else.
```

Короткий:
```
Same photo. Remove all tattoos from arms and hands — clean bare skin. Change nothing else.
```

Ссылка на исходник (tmpfiles, может протухнуть):
```
https://tmpfiles.org/dl/1789103469.b3a5751393027c46/wIwFmG9V5wyx/03_girl_source_clean.jpg
```

---

## 7. Что пользователь явно НЕ хочет сейчас

- Пиджак / пин на пиджаке — не нужно
- Серёжку в виде знака — можно не трогать, если не попросит снова
- Достройку кадра снизу — отменено
- Лишние ассеты сверх запроса — не делать

Ранее приоритетный пакет, который ждал:
1. Банковские карты
2. Визитка
3. Бланк

Они уже собраны.

---

## 8. Технические заметки агента

- Генерация через image model часто:
  - возвращает тату обратно
  - меняет лицо/композицию
  - для серёжки рисовала hoop или неверный 8-луч
- Поэтому для точечных правок пользователь предпочитает **Nano Banana** + исходник + короткий edit-prompt
- Хосты загрузок: **tmpfiles.org** обычно работает; catbox/litterbox/0x0 — нестабильны
- GitHub / push / PR — **только после явного OK пользователя**
- Репозитория команды в этом облачном чате не было

---

## 9. Имена / тексты на носителях (как использовалось)

- Бренд: `Rubin`
- На картах: `QUALIFIED`
- Держатель (плейсхолдер): `A. BASHKIROV` / варианты написания встречались
- Expiry: `09 / 30`
- Last digits: `4419`
- Сайт-плейсхолдер на бланке/визитке: `rubin.exchange`
- Email-плейсхолдер: `hello@rubin.exchange` / `hello@rubin.exchange`

Если в локальном чате нужны другие ФИО/контакты — спросить пользователя.

---

## 10. Как продолжать в локальном чате

1. Прикрепить этот документ.
2. Прикрепить нужные исходники (минимум `03_girl_SOURCE_clean.jpg` и logos mark).
3. Текущий next step (если пользователь не скажет иначе):
   - принять от пользователя результат Nano Banana без тату
   - или помочь ещё более точным промптом
   - не трогать карты/бланк/визитки без запроса

### Стартовая фраза для нового чата (можно вставить)

```
Продолжаем бренд Rubin. Контекст в прикреплённом RUBIN_CHAT_CONTEXT_TRANSFER.md.
Сейчас работаем только с чистой фоткой девушки: убрать тату с рук, размер не менять.
Карты, бланк и визитки уже готовы. Пиджак не нужен. GitHub без моего OK не трогать.
```

---

## 11. Краткая шпаргалка ассетов

| Что | Файл |
|---|---|
| Карта рампа | `02_bankcard_ramp.jpg` |
| Карта оси | `02_bankcard_axes.jpg` |
| Бланк A4 | `07_letterhead_blank.jpg` |
| Визитка лицо | `08_business_card_front.jpg` |
| Визитка оборот | `08_business_card_back.jpg` |
| Девушка исходник | `03_girl_SOURCE_clean.jpg` |
| Mark flat | `assets/logos/mark_flat.png` |
| Mark solid | `assets/logos/mark_solid.png` |
| Lockup | `assets/logos/lockup_flat.png` |

---

Конец документа.


## 12. Свежие ссылки на момент экспорта

- Контекст MD: https://tmpfiles.org/dl/1789103467.323fcb68f1b9ee55/wYwImT9c5jWa/rubin_chat_context_transfer.md
- Исходник девушки: https://tmpfiles.org/dl/1789103469.b3a5751393027c46/wIwFmG9V5wyx/03_girl_source_clean.jpg
