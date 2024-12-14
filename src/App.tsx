import { Route } from "wouter";
import "./styles/custom.css";
import Header from "./pages/Header";
import Footer from "./pages/Footer";
import { routes } from "./routes";

function App() {
  return (
    <main>
      <Header />
      <div className="content">
        {routes.map((route, index) => (
          <Route key={index} path={route.path} component={route.component} />
        ))}
      </div>
      <Footer />
    </main>
  );
}

export default App;
