import React, { useState } from "react";
import "./App.css";
import {FormattedInputNumber} from "../src/FormattedInputNumber";

function App() {
  const [value, setValue] = useState<number | null>(null);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React yay!
        </a>
        <div>
          <h1>Welcome to React with TypeScript!</h1>
          <p>This is a simple React application using TypeScript.</p>
        </div>
        <FormattedInputNumber
          value={value}
          onChange={setValue}
          style={{ width: 500 }}
          placeholder="Enter a number"
        />
      </header>
    </div>
  );
}

export default App;
