import { ComponentType } from "react";
import Posts from "./components/Posts";
import Post from "./components/Post";
import Tags from "./components/Tags";
import Tag from "./components/Tag";
import About from "./home/About";
import Projects from "./projects/Projects";
import Bookmarks from "./bookmarks/Bookmarks";
import Jams from "./jams/Jams";
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
    // The nav labels this "About", so /about is a URL people type. Without it
    // the request falls through to the "/:slug" catch-all and reports a
    // missing post.
    path: "/about",
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
    path: "/bookmarks/:rest*",
    component: Bookmarks,
  },
  {
    path: "/jams",
    component: Jams,
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
