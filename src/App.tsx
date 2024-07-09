import "./App.css";

function App() {
  return (
    <main>
      <nav>
        <ul>
          <li>Brand</li>
          <li className="float-right sticky">Sticky Right</li>
          <li>
            <a href="#">Item </a>
          </li>
          <li>
            <a href="#">Menu ▾</a>
            <ul>
              <li>
                <a href="#">Menu 1</a>
              </li>
              <li>
                <a href="#">Menu 2</a>
              </li>
            </ul>
          </li>
          <li className="float-right">Collapse</li>
        </ul>
      </nav>
      <h1>Mert Yaşin</h1>
      <div className="card">
        <p>Hello world</p>
      </div>
    </main>
  );
}

export default App;
