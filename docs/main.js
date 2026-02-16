import React, { useMemo, useState } from "https://esm.sh/react@19.2.0";
import { createRoot } from "https://esm.sh/react-dom@19.2.0/client";
import { Card, ConfigProvider, Space, Switch, Typography } from "https://esm.sh/antd@6.3.0";
import htm from "https://esm.sh/htm@3.1.1";
import { FormattedInputNumber } from "./dist/index.esm.js";

const html = htm.bind(React.createElement);

function App() {
  const [value, setValue] = useState(12345.67);
  const [useGrouping, setUseGrouping] = useState(true);
  const [allowNegative, setAllowNegative] = useState(true);

  const display = useMemo(() => (value === null ? "null" : value), [value]);

  return html`
    <${ConfigProvider}>
      <main className="page">
        <${Card} className="card" title="antd-formatted-inputnumber demo">
          <${Space} direction="vertical" size="middle" style=${{ width: "100%" }}>
            <${Typography.Paragraph}>
              Bu sayfa, component'in GitHub Pages üzerinde yayınlanan canlı örneğidir.
            </${Typography.Paragraph}>

            <${FormattedInputNumber}
              value=${value}
              onChange=${(nextValue) => setValue(nextValue)}
              precision=${2}
              locale="tr-TR"
              allowNegative=${allowNegative}
              useGrouping=${useGrouping}
              placeholder="Bir sayı girin"
            />

            <${Space}>
              <span>Binlik ayraç</span>
              <${Switch} checked=${useGrouping} onChange=${setUseGrouping} />
            </${Space}>

            <${Space}>
              <span>Negatif değer</span>
              <${Switch} checked=${allowNegative} onChange=${setAllowNegative} />
            </${Space}>

            <${Typography.Text}>
              Sayısal değer: <strong>${display}</strong>
            </${Typography.Text}>
          </${Space}>
        </${Card}>
      </main>
    </${ConfigProvider}>
  `;
}

createRoot(document.getElementById("root")).render(html`<${App} />`);
