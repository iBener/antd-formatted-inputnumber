## Demo (GitHub Pages)
Bu repo, `docs/` altında bir demo uygulaması ve GitHub Pages için otomatik deploy workflow'u içerir.

### Demo'yu localde çalıştırma

```bash
yarn demo:dev
```

Ardından `http://localhost:4173` adresini aç.

### Demo'yu build etme

```bash
yarn demo:build
```

Build çıktısı `site/` klasörüne üretilir.

### GitHub Pages'e yayınlama adımları

1. GitHub repo ayarlarından **Settings > Pages > Build and deployment** bölümünde **Source = GitHub Actions** seç.
2. `main` branch'e push yaptığında `.github/workflows/deploy-demo.yml` otomatik çalışır.
3. Deploy tamamlandığında demo sayfan `https://<kullanici>.github.io/<repo>/` adresinde açılır.