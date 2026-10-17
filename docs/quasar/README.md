# MedicalPractice — Quasar Prototype

Полный интерактивный frontend-прототип одной частной практики и кабинета пациента.
Немецкий интерфейс, только вымышленные данные, без backend и настоящей авторизации.

## Быстрый запуск на Windows

Установите Node.js **24.x** (включает npm). Распакуйте весь архив в отдельную папку.
Откройте PowerShell в папке, где лежат этот README и корневой package.json:

```powershell
npm.cmd ci
npm.cmd run dev --workspace frontend
```

Откройте адрес, показанный Quasar в терминале. Остановить сервер: Ctrl+C.
Использование `npm.cmd` позволяет обойти блокировку PowerShell-скрипта npm.ps1
без изменения политики выполнения PowerShell. При установке нужен доступ к npm.

Вход: **Patientenbereich → Als Demopatient anmelden**.
Свободные даты доступны без входа: **Termin vereinbaren** → `/#/termine`.
Настройки владельца и инструменты разработки: значок оформления в шапке →
**Demo: Farben & Einstellungen** под переключателем Hell / Dunkel / System.
Переход доступен на публичных страницах и в кабинете пациента; он открывает `/#/demo/erscheinungsbild`.
Выберите Waldgrün, Pflaume или Stahlblau и нажмите **Farben anwenden**.
Эта страница не является защищённой административной панелью.
Для реального сайта отключите демонстрационный переход в `frontend/src/config/demo.ts`.
Обычному посетителю доступен переключатель Hell / Dunkel / System (значок в Header).
Waldgrün / Pflaume / Stahlblau и собственный HEX-цвет настраиваются отдельно от медицинского профиля.
Подробности изменений и границы проверки: `docs/UX-REFINEMENT.md`.

## Проверки и сборка

```powershell
npm.cmd run check
npm.cmd run lint --workspace frontend
npm.cmd test
npm.cmd run build
```

Сборка создаёт `frontend/dist/spa/` и копирует её в корневой `dist/` для Sites.
Это SPA с hash-маршрутами: отдельные исходные страницы находятся в `frontend/src/pages/`,
а собранный сайт имеет одну HTML-точку входа и отдельные JS/CSS-ресурсы.
Не открывайте index.html двойным щелчком: сборку нужно отдавать HTTP-сервером.

Для просмотра готовой сборки без повторной установки зависимостей (нужен только Node 24):

```powershell
node scripts/serve-build.mjs
```

Откройте http://localhost:4173 . Этот сервер предназначен только для локального просмотра.

## Структура

- `frontend/src/pages/public/`: главная, услуги, врач, практика, контакт, FAQ, юридические заглушки.
- `frontend/src/pages/auth/`: вход, регистрация, ожидание одобрения, сброс пароля.
- `frontend/src/pages/patient/`: dashboard, список, календарь/запись, детали, профиль, настройки.
- `frontend/src/layouts/`: публичный и пациентский layouts на QLayout/QDrawer.
- `frontend/src/components/`: общие небольшие Quasar-компоненты.
- `frontend/src/stores/`: Pinia, демосостояние.
- `frontend/src/services/`: правила расписания, typed async mock-service, localStorage.
- `frontend/tests/`: автоматические проверки правил и сценариев сервиса.
- `docs/`: архитектура, будущий API, сценарии ручной проверки и результаты.

## Передача в MedicalPractice-Platform

Код продукта — содержимое `frontend/`. Внешний AI Workspace не изменён.
Корневые package.json/package-lock.json управляют npm workspace для этой поставки.
При переносе только frontend в существующий продукт нужно согласовать менеджер пакетов,
создать его собственный lockfile и повторить проверки; не копировать чужой корневой manifest
поверх существующего без сравнения. GitHub в ходе этой реализации не изменялся.

Предыдущие HTML-прототипы сохранены в истории существующего Sites-проекта и не нужны
новому frontend. Реальный Django/DRF, Wagtail, база, права, аутентификация и работа врача
остаются следующим этапом. Этот прототип не является готовой медицинской системой.
