# Предложение REST-контракта /api/v1/

Это проект контракта, не описание существующего backend. Сейчас сетевых запросов нет.

| Endpoint | Назначение |
| --- | --- |
| GET /api/v1/me/ | Профиль и approval status |
| PATCH /api/v1/me/ | Изменение допустимых полей профиля |
| GET /api/v1/services/ | Виды посещений и продолжительность |
| GET /api/v1/availability/?date=YYYY-MM-DD&service_id=... | Доступные слоты с server IDs |
| GET /api/v1/appointments/ | Записи текущего пациента, пагинация |
| POST /api/v1/appointments/ | Создать заявку по slot_id и service_id |
| POST /api/v1/appointments/{id}/cancel/ | Отменить с проверкой владельца и правил |
| POST /api/v1/appointments/{id}/reschedule/ | Атомарно перенести с проверкой нового slot_id |

Для production использовать стабильные ID услуг вместо demo-строк и timezone-aware
ISO 8601 timestamps с часовым поясом/offset. В UI отображать Europe/Berlin.
Документировать политику DST для availability. Клиентские часы не определяют права изменения.

Ошибки: 401 (сессия), 403 (нет approval/permissions), 404, 409 (занятый слот),
422 или 400 (валидируемые поля), 429 и 5xx. Выбрать единый envelope с code/message/fields.
Прототип уже отображает ошибку и сохраняет исходную запись при неудаче переноса.

Способ аутентификации, registration/password endpoints и CSRF/CORS ещё нужно согласовать.
В production проверять доступ сервером на каждом endpoint; localStorage-роль не переносить.
API-клиенту нужны credentials-policy, отмена запросов, server IDs, idempotency и
обновление данных после конфликтов. Моковый PatientService служит границей замены,
но не имитирует полный формат будущего DRF API.
