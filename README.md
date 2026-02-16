# Formatted Input Number

AntD Input komponenti tabanlı formatlanmış sayı input komponenti.

## Kurulum
```bash
yarn add antd-formatted-inputnumber antd react react-dom
```

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

> Not: `antd`, `react`, `react-dom` peer dependency olarak tanımlıdır; kullanan projede ayrıca kurulmalıdır.