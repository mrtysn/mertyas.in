import { ComponentType } from "react";
import Home from "./home/Home";
import { FULL_NAME } from "./utils/constants";
import Blog from "./blog/Blog";
import Post from "./blog/Post";
import About from "./home/About";
import Projects from "./projects/Projects";
import { RouteComponentProps } from "wouter";

export type RouteProps = {
  path: string;
  component: ComponentType<RouteComponentProps>;
  title?: string;
};

export const routes: RouteProps[] = [
  {
    path: "/",
    component: Home,
    title: FULL_NAME,
  },
  {
    path: "/blog",
    component: Blog,
    title: "Blog",
  },
  {
    path: "/blog/*",
    component: Post,
    title: "Blog",
  },
  {
    path: "/about",
    component: About,
    title: "About",
  },
  {
    path: "/projects",
    component: Projects,
    title: "Projects",
  },
];
