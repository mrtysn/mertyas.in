import { ComponentType } from "react";
import About from "./home/About";
import Projects from "./projects/Projects";
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
];
