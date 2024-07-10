import { ComponentType } from "react";
import Home from "./home/Home";
import Blog from "./blog/Blog";
import Post from "./blog/Post";
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
    component: Home,
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
    path: "/about",
    component: About,
  },
  {
    path: "/projects",
    component: Projects,
  },
];
