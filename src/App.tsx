import { Route } from "wouter";
import Blog from "./blog/Blog";
import Post from "./blog/Post";
import Home from "./home/Home";
import Header from "./home/Header";
import Footer from "./home/Footer";
import "./styles/custom.css";

function App() {
  return (
    <main>
      <Header />
      <div className="minHeight">
        <Route path="/" component={Home} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/*" component={Post} />
      </div>
      <Footer />
    </main>
  );
}

export default App;
