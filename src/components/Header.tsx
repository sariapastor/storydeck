import React from "react";

import { BackButton } from "./header/BackButton";
import { NewButton } from "./header/NewButton";
import "./Header.css";
import { ViewState } from "../types";


interface HeaderProps {
  title: string;
  setUpdating: React.Dispatch<React.SetStateAction<[boolean, string]>>;
  viewStack: ViewState[];
  setViewStack: React.Dispatch<React.SetStateAction<ViewState[]>>;
}

export const Header: React.FC<HeaderProps> = ({ title, setUpdating, viewStack, setViewStack }) => {
  return (
    <header>
      <div data-tauri-drag-region className="titlebar">
        <BackButton viewStack={viewStack} setViewStack={setViewStack} />
        <div className="window-title">
          <h3>{title}</h3>
        </div>
        <NewButton setUpdating={setUpdating} />
      </div>
      <div className="titlebar-spacer"></div>
    </header>
  );
};

