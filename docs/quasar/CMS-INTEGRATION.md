# Подготовка к Wagtail / Django REST

Это подготовленная граница интеграции, а не установленная CMS.

- `types/content.ts`: типы публичного контента, изображений, разделов услуг и provider.
- `services/content.ts`: асинхронный mock provider и mapper нормализованных Wagtail изображений.
- `mocks/content.ts`: данные трёх тематических конфигураций.
- `stores/demo.ts`: загрузка контента по теме через provider; локальный fallback при ошибке.
- `PracticeMedia.vue`: QImg, srcset/sizes, alt, подпись, точка кадрирования, обработка ошибки.

Для подключения: реализовать `PracticeContentProvider.get(theme)` через согласованный public
Django API с валидацией ответа. Backend нормализует Wagtail Page/StreamField и изображения
в `PracticeContent`. Существующие страницы не требуют собственной загрузки CMS-данных.
Для каталога услуг синхронизировать CMS service ID с booking API; расписание и доступность
остаются доменными данными Django, а не публичными полями Wagtail.

Предложение полей: тема, hero lead/emphasis/eyebrow/note/image, portrait, gallery, values,
about sections, serviceDetails. Изображение: id, alt, caption, renditions (url/width/height),
focal point (%). Рендиции генерирует сервер; фронтенд выбирает подходящий размер через srcset.
Сериализатор здесь является предложением контракта, а не копией стандартного Wagtail JSON.

Для настоящих фотографий заменить соответствующие MediaAsset или ответ provider;
портрет сейчас null и показывает честную заглушку. Не выдавать иллюстрации за фотографии.
Перед публикацией нужны разрешения на снимки и согласие изображённых людей.

Справочная документация, изученная при реализации:
https://docs.wagtail.org/en/stable/advanced_topics/api/v2/configuration.html
https://docs.wagtail.org/en/stable/advanced_topics/images/focal_points.html
