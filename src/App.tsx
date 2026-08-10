import { Route, Switch } from "wouter";
import "./styles/custom.css";
import Header from "./home/Header";
import Footer from "./home/Footer";
import { routes } from "./routes";

function App() {
  return (
    <main>
      <Header />
      <div className="content">
        {/*
          Switch renders only the first match. Without it every <Route> matches
          independently, so /jams, /projects and /posts each rendered their own
          page *and* the "/:slug" catch-all underneath it, which showed "Post
          not found" at the bottom. Order in `routes` matters: the catch-all is
          last.
        */}
        <Switch>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} component={route.component} />
          ))}
        </Switch>
      </div>
      <Footer />
    </main>
  );
}

export default App;
