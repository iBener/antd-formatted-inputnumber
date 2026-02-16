# Formatted Input Number

AntD Input komponenti tabanlı formatlanmış sayı input komponenti.

## Kurulum
```bash
yarn add antd-formatted-inputnumber
```

> Not: Ayrıca kurulu olması gereken paketler `antd`, `react`, `react-dom` peer dependency olarak tanımlıdır.

## Usage
```tsx
import { FormattedInputNumber } from 'antd-formatted-inputnumber';

function App() {
  const [value, setValue] = useState<number | null>(null);

  return (
    <FormattedInputNumber
      value={value}
      onChange={setValue}
      locale="tr-TR"
      precision={2}
    />
  );
}
```

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

## Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| value | number \| string | - | Input değeri |
| onChange | (value: number \| null, displayValue: string) => void | - | onChange(value, displayValue) callback|
| locale | string | 'tr-TR' | Sayı formatı için kullanılacak `locale` değeri |
| allowNegative | boolean | true | Negatif değer girilebilir mi? |
| allowNull | boolean | true | Değer `false` ise `null` veya `undefined` değerler input'ta "0" olarak gösterilir. |
| useGrouping | boolean | true | Sayıları binlik ayracı kullanarak mı formatlayacağını belirler |
| notifyOnSetValue | boolean | false | Dışardan `value` set edildiğinde `onChange` çağrılıp çağrılmayacağını belirler |

Diğer tüm AntD Input props'ları varsayılan olarak desteklenmektedir.
