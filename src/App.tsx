import { Route } from "wouter";
import "./styles/custom.css";
import Header from "./home/Header";
import Footer from "./home/Footer";
import Home from "./home/Home";
import Blog from "./blog/Blog";
import Post from "./blog/Post";
import About from "./home/About";

function App() {
  return (
    <main>
      <Header />
      <div className="content">
        <Route path="/" component={Home} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/*" component={Post} />
        <Route path="/about" component={About} />
      </div>
      <Footer />
    </main>
  );
}

export default App;
