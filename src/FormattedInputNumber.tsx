import type { InputProps, InputRef } from "antd";
import { Input } from "antd";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";

interface FormattedInputNumberProps extends Omit<InputProps, "onChange" | "value"> {
  value?: number | null;
  onChange?: (value: number | null, displayValue: string) => void;
  locale?: string;
  precision?: number;
  allowNegative?: boolean;
  allowNull?: boolean;
  /** Sayıları binlik ayracı kullanarak mı formatlayacağını belirler. Varsayılan true'dur. */
  useGrouping?: boolean;
  /** Dışardan `value` set edildiğinde `onChange` çağrılıp çağrılmayacağını belirler */
  notifyOnSetValue?: boolean;
}

/**
 * Kullanıcının sayısal değer girişini formatlı şekilde yapmasını ve görüntülenmesini sağlayan bir React bileşenidir.
 *
 * @example
 * <FormattedInputNumber
 *   value={1234.56}
 *   onChange={(value, displayValue) => console.log(value, displayValue)}
 *   locale="tr-TR"
 *   precision={2}
 * />
 * // Input display: 1.234,56
 * // Console output: > 1234.56, "1.234,56"
 *
 * @description
 * - `value`: Sayısal değer. `allowNull` false ise `null` veya `undefined` değerler input'ta 0 gösterilir.
 * - `onChange`: Değer değiştiğinde çağrılır, parametre olarak sayısal değeri ve formatlanmış değeri verir.
 * - `locale`: Sayı formatı için locale. Örneğin "tr-TR" için binlik ayracı "." ve ondalık ayracı "," olur.
 * - `precision`: Ondalık basamak sayısı. Varsayılan 2'dir.
 * - `notifyOnSetValue`: Dışardan `value` set edildiğinde `onChange` çağrılıp çağrılmayacağını belirler. Varsayılan false'dur.
 *
 * @notes
 * - Kullanıcı sadece geçerli sayısal karakterler girebilir.
 * - Dışarıdan gelen `value` prop'u değiştiğinde input değeri güncellenir.
 * - "." veya "," tuşlarına basıldığında cursor doğrudan ondalık ayracına atlar.
 * - Binlik ve ondalık ayraçlar silinemez, cursor uygun şekilde hareket eder.
 * - Tüm bu işlemler sırasında cursor zıplaması yaşanmaması için useLayoutEffect kullanılır.
 *
 * @author İbrahim Bener (https://github.com/iBener)
 * @date 2026-02-10
 */

export const FormattedInputNumber = React.forwardRef<InputRef, FormattedInputNumberProps>(
  (
    {
      value,
      onChange,
      locale = "tr-TR",
      precision = 2,
      allowNegative = true,
      allowNull = true,
      useGrouping = true,
      notifyOnSetValue = false,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<InputRef>(null);
    const [displayValue, setDisplayValue] = useState<string>("");
    const [rangeSelected, setRangeSelected] = useState(false);
    const pendingCursorRef = useRef<number | null>(null);
    const displayValueRef = useRef<string>("");
    const defaultTextAlign = props.style?.textAlign || "right";
    const localeSprtrs = useMemo(() => getLocaleSeperators(locale), [locale]);
    const { grouping, decimal } = localeSprtrs;

    // Forward ref assignment
    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(inputRef.current);
      } else {
        (ref as React.MutableRefObject<InputRef | null>).current =
          inputRef.current;
      }
    }, [ref]);

    const cursorRef = useRef<{
      selectionStart: number | null;
      selectionEnd: number | null;
    }>({ selectionStart: null, selectionEnd: null });

    const formatNumber = useCallback(
      (num: number) => {
        const formatted = num.toLocaleString(locale, {
          minimumFractionDigits: precision > 0 ? precision : 0,
          maximumFractionDigits: precision > 0 ? precision : 0
        });
        return useGrouping
          ? formatted
          : grouping
            ? formatted.replace(new RegExp(`\\${grouping}`, "g"), "")
            : formatted;
      },
      [locale, precision, useGrouping, grouping]
    );

    const toNumber = useCallback(
      (formatliSayi: string): number | null => {
        if (!formatliSayi || formatliSayi.trim() === "") {
          return null;
        }
        const rawValue = grouping
          ? formatliSayi
              .replace(new RegExp(`\\${grouping}`, "g"), "")
              .replace(new RegExp(`\\${decimal}`), ".")
          : formatliSayi.replace(new RegExp(`\\${decimal}`), ".");
        return parseFloat(rawValue);
      },
      [grouping, decimal]
    );

    /****************************************************************************
     * Cursor pozisyonunu useLayoutEffect ile set et.
     * useLayoutEffect, React DOM güncellemesinden SONRA ama browser PAINT'ten
     * ÖNCE senkron çalışır → cursor zıplaması görünmez.
     ***************************************************************************/
    useLayoutEffect(() => {
      if (pendingCursorRef.current !== null) {
        const el = inputRef.current?.input;
        if (el) {
          el.setSelectionRange(
            pendingCursorRef.current,
            pendingCursorRef.current
          );
        }
        pendingCursorRef.current = null;
      }
    });

    /****************************************************************************
     * Değer güncelleme: React state + ref + cursor pozisyonu
     ***************************************************************************/
    const updateValue = useCallback(
      (newDisplayValue: string, cursorPos?: number, shouldNotify?: boolean) => {
        const newNumberValue = toNumber(newDisplayValue);

        const negativeDefendedValue = allowNegative
          ? newNumberValue
          : newNumberValue != null && newNumberValue < 0
            ? 0
            : newNumberValue;

        const finalNumberValue =
          negativeDefendedValue === null || isNaN(negativeDefendedValue)
            ? allowNull // Değer null olabilir mi?
              ? null
              : 0
            : negativeDefendedValue;

        const formattedNewValue =
          finalNumberValue != null ? formatNumber(finalNumberValue) : "";

        if (cursorPos !== undefined) {
          if (formattedNewValue === displayValueRef.current) {
            // Formatlanmış değer değişmedi → React re-render yapmayacak
            const el = inputRef.current?.input;
            if (el) {
              // Tarayıcı DOM'u değiştirmiş olabilir (Backspace/Delete ile)
              // Bu yüzden DOM'u manuel geri yaz ve cursor'u set et
              el.value = formattedNewValue;
              el.setSelectionRange(cursorPos, cursorPos);
            }
          } else {
            // Değer değişti, re-render olacak → cursor'u useLayoutEffect'te set edeceğiz
            pendingCursorRef.current = cursorPos;
          }
        }

        displayValueRef.current = formattedNewValue;
        setDisplayValue(formattedNewValue);

        if ((notifyOnSetValue || shouldNotify) ?? true) {
          onChange?.(finalNumberValue, formattedNewValue);
        }
      },
      [
        onChange,
        toNumber,
        formatNumber,
        allowNegative,
        allowNull,
        useGrouping,
        notifyOnSetValue
      ]
    );

    // Dışarıdan gelen prop value değiştiğinde (form reset, initial value vb.)
    useEffect(() => {
      if (value !== undefined && value !== null) {
        const formatted = formatNumber(Number(value));
        updateValue(formatted, undefined, false);
      } else {
        updateValue("", undefined, false);
      }
    }, [value, locale, precision, formatNumber, updateValue]);

    const calcBinlikAyracFarki = (formatted: string) => {
      const yeniBinlikAyracSayisi = grouping
        ? (formatted.match(new RegExp(`\\${grouping}`, "g")) || []).length
        : 0;
      const current = displayValueRef.current;
      const eskiBinlikAyracSayisi = grouping
        ? (current.match(new RegExp(`\\${grouping}`, "g")) || []).length
        : 0;
      return yeniBinlikAyracSayisi - eskiBinlikAyracSayisi;
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const currentTarget = event.currentTarget;
      const { selectionStart, selectionEnd } = currentTarget;
      setRangeSelected(selectionStart !== selectionEnd);

      if (
        event.ctrlKey ||
        (event.shiftKey && allowedShiftKeys.includes(event.key.toLowerCase()))
      ) {
        return;
      }
      if (!allowedKeysForNumberInput.includes(event.key)) {
        event.preventDefault();
      }

      // Negatif işaret toggle
      const negativeToggled = handleNegativeToggle(
        event.key,
        event.currentTarget
      );
      if (negativeToggled) {
        event.preventDefault();
        return;
      }

      // "." veya "," basıldığında karakterin input'a eklenmesini engelle
      // ve cursor'u doğrudan decimal ayracından sonraya taşı
      const jumpToDecimal = handleJumpToDecimal(event.key);
      if (jumpToDecimal) {
        event.preventDefault();
        return;
      }

      // Backspace/Delete ile özel durumlar
      const backspaceOrDelete = handleBackspaceOrDelete(
        event.key,
        event.currentTarget
      );
      if (backspaceOrDelete) {
        event.preventDefault();
        return;
      }
    };

    const handleNegativeToggle = (
      key: string,
      currentTarget: HTMLInputElement
    ): boolean => {
      if (key === "-") {
        const currentValue = toNumber(displayValueRef.current) || 0;
        if (currentValue == 0) {
          const startWithMinus = displayValueRef.current.startsWith("-");
          const newValue = startWithMinus
            ? displayValueRef.current.slice(1)
            : `-${displayValueRef.current}`;
          const cursorPos = currentTarget.selectionStart ?? 0;
          const newCursorPos = startWithMinus ? cursorPos - 1 : cursorPos + 1;
          updateValue(newValue, newCursorPos);
          return true;
        }
        const toggledValue = -currentValue;
        const isNegativeValue = toggledValue < 0;
        if ((allowNegative && isNegativeValue) || toggledValue >= 0) {
          const formattedToggledValue = formatNumber(toggledValue);
          const cursorPos =
            (currentTarget.selectionStart ?? 0) + (isNegativeValue ? 1 : -1);
          updateValue(formattedToggledValue, cursorPos);
        }
        return true;
      }
      return false;
    };

    const handleJumpToDecimal = (key: string): boolean => {
      const jumpToDecimal = seperators.includes(key);
      if (jumpToDecimal) {
        const currentDisplay = displayValueRef.current;
        const decimalIndex = currentDisplay.lastIndexOf(decimal);
        if (decimalIndex >= 0) {
          const newCursorPos = decimalIndex + 1;
          const el = inputRef.current?.input;
          if (el) {
            el.setSelectionRange(newCursorPos, newCursorPos);
          }
        }
        return true;
      }
      return false;
    };

    const handleBackspaceOrDelete = (
      key: string,
      currentTarget: HTMLInputElement
    ): boolean => {
      const { selectionStart, selectionEnd } = currentTarget;
      cursorRef.current = { selectionStart, selectionEnd };

      // Backspace/Delete ile özel durumlar
      if (
        deleteKeys.includes(key) &&
        selectionStart === selectionEnd &&
        selectionStart != null
      ) {
        const el = inputRef.current?.input;
        const currentDisplay = displayValueRef.current;
        const decimalIndex = currentDisplay.indexOf(decimal);

        // Cursor tam kısımda mı (ondalık ayracından önce veya eşit)?
        const posAddition = key === "Backspace" ? -1 : 0;
        const charAtPos = currentDisplay[selectionStart + posAddition];
        const cursorInIntegerPart =
          decimalIndex < 0 || selectionStart <= decimalIndex;
        const jumpingChars = [...seperators, "-", " "]; // Silinmeye çalışıldığında atlanacak karakterler

        // Tam kısım 0 ise ve cursor tam kısımdaysa → silmeyi engelle, cursor'u taşı
        if (cursorInIntegerPart && !jumpingChars.includes(charAtPos)) {
          const integerPart = currentDisplay.split(decimal)[0];
          const integerValue = toNumber(integerPart);
          if (integerValue === 0 && el) {
            // Cursor'u decimal ayracından sonraya taşı
            if (decimalIndex >= 0) {
              el.setSelectionRange(decimalIndex, decimalIndex);
            }
            return true;
          }
        }

        // Ayraç (binlik, ondalık) veya "-" üzerinde silmeye çalışırken → cursor'u atla
        if (el && jumpingChars.includes(charAtPos)) {
          const newCursorPos =
            selectionStart + posAddition + (key === "Delete" ? 1 : 0);
          el.setSelectionRange(newCursorPos, newCursorPos);
          return true;
        }
      }
      return false;
    };

    const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
      const target = event.currentTarget;

      const { value } = target;
      if (!value || value.trim() === "") {
        const newPosition = allowNull ? 0 : 1; // Cursor'u 0'ın sağına koy
        updateValue("", newPosition);
        return;
      }

      const cursorPosition = target.selectionStart ?? 0;
      const cursorAtEnd = cursorPosition === value.length;
      if (cursorAtEnd && value.includes(decimal)) {
        const parts = value.split(decimal);
        if (parts[1] && parts[1].length > precision) {
          const lastDigits = parts[1].slice(-precision);
          updateValue(`${parts[0]}${decimal}${lastDigits}`);
          return;
        }
      }

      const decimalIndex = value.indexOf(decimal);
      const cursorAtDecimal =
        decimalIndex >= 0 ? cursorPosition > decimalIndex + 1 : false;
      if (cursorAtDecimal && value.includes(decimal)) {
        const parts = value.split(decimal);
        const integerPart = parts[0];
        const decimalPart = parts[1] || "";
        const firstDigits = decimalPart.slice(0, precision);
        updateValue(`${integerPart}${decimal}${firstDigits}`, cursorPosition);
        return;
      }

      const bastakiSifirCount = countLeadingZeros(value);
      const number = toNumber(value);

      const formatted = formatNumber(Number(number));
      const ayracFarki = rangeSelected ? 0 : calcBinlikAyracFarki(formatted);
      const hesaplanan = cursorPosition + ayracFarki - bastakiSifirCount;
      const newPosition = Math.max(0, hesaplanan); // Cursor pozisyonu negatif olamaz
      updateValue(formatted, newPosition);
    };

    return (
      <Input
        {...props}
        ref={inputRef}
        value={displayValue}
        onInput={event => {
          handleInput(event);
          props.onInput?.(event); // Event'i üst component'e de taşı
        }}
        onKeyDown={event => {
          handleKeyDown(event);
          props.onKeyDown?.(event); // Event'i üst component'e de taşı
        }}
        style={{ ...props.style, textAlign: defaultTextAlign }}
      />
    );
  }
);

function getLocaleSeperators(locale: string) {
  const formatted = new Intl.NumberFormat(locale).format(12345.6);
  const ayraclar = formatted.replace(/\d/g, "");

  // Binlik ayraç
  // Eğer sadece bir ayrac varsa, bunun ondalık olduğunu varsayıyoruz
  const groupingSeparator = ayraclar.length > 1 ? ayraclar.charAt(0) : "";

  // Ondalık ayraç
  const decimalSeparator = ayraclar.charAt(ayraclar.length - 1);

  return {
    grouping: groupingSeparator,
    decimal: decimalSeparator
  };
}

function countLeadingZeros(str: string): number {
  const match = str.match(/^-?(0+)(?=\d)/);
  return match ? match[1].length : 0;
}

const allowedShiftKeys = [
  "arrowleft",
  "arrowright",
  "home",
  "end",
  "insert",
  "delete"
];

const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const seperators = [".", ","];
const deleteKeys = ["Backspace", "Delete"];

const allowedKeysForNumberInput = [
  ...numbers,
  ...seperators,
  ...deleteKeys,
  "ArrowRight",
  "ArrowLeft",
  "Shift",
  "Home",
  "End",
  "Tab",
  "F12",
  "F5",
  "-"
];
