import { ComponentType } from "react";
import Posts from "./components/Posts";
import Post from "./components/Post";
import Tags from "./components/Tags";
import Tag from "./components/Tag";
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
    path: "/projects",
    component: Projects,
  },
  {
    path: "/bookmarks",
    component: Bookmarks,
  },
  {
    path: "/posts",
    component: Posts,
  },
  {
    path: "/tags",
    component: Tags,
  },
  {
    path: "/tags/:tag",
    component: Tag,
  },
  {
    path: "/:slug",
    component: Post,
  },
];
