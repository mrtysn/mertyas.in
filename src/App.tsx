import { Route, Switch } from "wouter";
import "./styles/custom.css";
import Header from "./home/Header";
import Footer from "./home/Footer";
import { routes } from "./routes";

function App() {
  return (
    <>
      {/* First stop for the keyboard, so the nav can be jumped over. */}
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <Header />
      {/* The nav and the footer sit outside <main>, so "main" is this page's own
          content and a screen reader can jump straight to it. */}
      <main id="content" className="content">
        {/*
          Switch renders only the first match. Without it every <Route> matches
          independently, so a page would render next to every other route that
          also matches it. Order in `routes` matters.
        */}
        <Switch>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} component={route.component} />
          ))}
        </Switch>
      </main>
      <Footer />
    </>
  );
}

export default App;
