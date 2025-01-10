import { useState } from "react";
import reactLogo from "@/assets/react.svg";
import viteLogo from "/vite.svg";
export default function HomePage() {
  const [count, setCount] = useState(0);
    return (
      <>
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>SOLOMON</h1>
        <h2>Vite + React</h2>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
          <p>
            Edit <code>src/App.jsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
        <div className="card d-flex w-100" style={{ width: "18rem" }}>
          <img src="https://via.placeholder.com/150" className="card-img-top" alt="..." />
          <div className="card-body">
            <h5 className="card-title">Card Title</h5>
            <p className="card-text">Some quick example text to build on the card title.</p>
            <a href="#" className="btn btn-danger">
              Go somewhere
            </a>
          </div>
        </div>
      </>
    );
}
