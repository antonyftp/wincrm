import type { ReactNode } from "react";
import ThemeToggle from "./ThemeToggle";

type Props = {
  title: string;
  crumbs?: ReactNode;
  actions?: ReactNode;
};

export default function Topbar({ title, crumbs, actions }: Props) {
  return (
    <header className="topbar">
      <div>
        {crumbs && <div className="crumbs">{crumbs}</div>}
        <h1>{title}</h1>
      </div>
      <div className="right">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  );
}
