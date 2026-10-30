# Публикация КВАДРАНТА

Опубликованный сайт: [kvadrant-oge-mvp.pages.dev](https://kvadrant-oge-mvp.pages.dev/). Исходники: [Laskan0/kvadrant-oge-mvp](https://github.com/Laskan0/kvadrant-oge-mvp).

Целевой хостинг — Cloudflare Pages со статической сборкой. Репозиторий — GitHub, основная ветка `main`.

## Проверка перед публикацией

```sh
npm ci
npm test
npm run build
```

В `.node-version` указана версия Node.js 24. В GitHub Actions подготовлены установка зависимостей, unit-тесты и сборка.

## Настройки Cloudflare Pages

При создании приложения выбрать **Continue to Pages → Import an existing Git repository** и репозиторий проекта.

- Production branch: `main`.
- Framework preset: React (Vite), если доступен, либо None с явными настройками ниже.
- Build command: `npm run build`.
- Build output directory: `dist`.
- Root directory: корень репозитория.
- Node.js: файл `.node-version` со значением `24`; при необходимости выставить `NODE_VERSION=24` в настройках сборки.
- Backend, Functions и секреты не требуются.

При новой git-интеграции Cloudflare может запросить доступ GitHub к выбранному репозиторию. Пользователь подтверждает предоставление этого доступа.

После публикации проверить HTTPS-ссылку в чистом браузерном контексте: загрузку старта, формулы и шрифты, весь урок, обе задачи, перелёты, финал, повторное прохождение и перезагрузку. Ссылку добавить в README и PLAN.

## Обновления

Изменения в `main` запускают новую сборку Pages. Дождаться успешного деплоя и проверить обновлённый сайт по основной ссылке. Результат работы GitHub Actions не подменяет проверку статуса Pages.

## Официальные инструкции

- [React на Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/).
- [Версии среды сборки и настройка Node.js](https://developers.cloudflare.com/pages/configuration/build-image/).

На дату подготовки документа Cloudflare предлагает Workers для новых проектов. Здесь сохраняем Pages согласно согласованному ТЗ; backend и миграция не требуются.
