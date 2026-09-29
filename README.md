# Family Covenant Church — GitHub Pages site

This folder is a **static copy of the public website**, made to be hosted free on GitHub Pages.
It is generated automatically — don't edit these HTML files by hand. Change content in the
admin panel of the PHP site (or edit the templates in `php-site/views`) and rebuild.

GitHub Pages can only host static files. It can't run PHP or MySQL, so the admin panel,
uploads and hall bookings live on the PHP site. This static copy:

- shows sermons, articles, announcements, the gallery and all other pages
- when connected to the PHP site (`--api`):
  - shows the "Live now" banner and plays the YouTube stream automatically
  - sends "Get involved" requests to the admin panel
  - links "Admin" in the footer to the PHP site
- when not connected: the join section shows WhatsApp/phone/email buttons instead of the form

## Publish on GitHub Pages

1. Push the whole project (with this `github-pages` folder and `.github/workflows`) to a GitHub repository.
2. In the repository go to **Settings → Pages** and set **Source: GitHub Actions**.
3. The *Deploy GitHub Pages* workflow publishes this folder. Your site appears at
   `https://<your-user>.github.io/<repo>/`.

## Keep it updated automatically from the PHP site

In the repository, open **Settings → Secrets and variables → Actions → Variables** and add:

| Variable | Example |
|---|---|
| `FCC_API_URL` | `https://fccbulawayo.org` (the address of the PHP site) |
| `FCC_PAGES_URL` | `https://your-user.github.io/your-repo` |

On the PHP site, add the GitHub Pages address to `cors_origins` in `config.php`
(for example `'cors_origins' => ['https://your-user.github.io']`).

The workflow then rebuilds this site from the PHP site's content every 30 minutes, on every
push, and whenever you press **Run workflow** in the Actions tab. So admin changes appear on
GitHub Pages within half an hour, and the live-stream banner switches on straight away.

## Rebuild by hand

From the `php-site` folder:

```bash
php tools/build-github-pages.php --api=https://fccbulawayo.org --from-api
```

Or build from your local database (e.g. XAMPP), without connecting a PHP site:

```bash
php tools/build-github-pages.php
```
