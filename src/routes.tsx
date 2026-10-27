import { ComponentType } from "react";
import About from "./home/About";
import Projects from "./projects/Projects";
import Bookmarks from "./bookmarks/Bookmarks";
import { RouteComponentProps } from "wouter";

export type RouteProps = {
  path: string;
  component: ComponentType<RouteComponentProps>;
};

export const routes: RouteProps[] = [
  {
    path: "/",
    component: About,
  },
  {
    // The nav labels this "About", so /about is a URL people type.
    path: "/about",
    component: About,
  },
  {
    path: "/projects",
    component: Projects,
  },
  {
    // One route for the root and every folder, so moving between them keeps
    // the page mounted — its search, filters and unfolded tree. "*?" is an
    // optional wildcard; ":rest*" is not one to wouter's regexparam, which
    // reads it as a single segment under a key literally named "rest*".
    path: "/bookmarks/*?",
    component: Bookmarks,
  },
];
