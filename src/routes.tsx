import { ComponentType } from "react";
import Blog from "./blog/Blog";
import Post from "./blog/Post";
import About from "./pages/About";
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
    path: "/blog",
    component: Blog,
  },
  {
    path: "/blog/*",
    component: Post,
  },
  {
    path: "/projects",
    component: Projects,
  },
];
