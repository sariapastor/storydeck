import React from "react";
import { Navigation } from "./Navigation";
import { TitleBarActions } from "./TitleBarActions";
import "./Header.css";

interface HeaderProps {
  title: string;
  setUpdating: React.Dispatch<React.SetStateAction<[boolean, string]>>;
}

export const Header: React.FC<HeaderProps> = ({ title, setUpdating }) => {
  return (
    <header>
      <div data-tauri-drag-region className="titlebar">
        <Navigation />
        <div className="window-title">
          <h3>{title}</h3>
        </div>
        <TitleBarActions setUpdating={setUpdating} />
      </div>
      <div className="titlebar-spacer"></div>
    </header>
  );
};