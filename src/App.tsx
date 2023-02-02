import React from "react";
import { appWindow } from "@tauri-apps/api/window";
import { AppContextProvider, FormType, useDeck, useNavigation } from "./context";
import { Header } from "./components/Header";
import { MainDisplay } from "./components/MainDisplay";
import { AddNewResourceForm } from "./components/AddNewResourceForm";
import "./App.css";


function App(): JSX.Element {
  return (
    <AppContextProvider>
      <WrappedApp />
    </AppContextProvider>
  );
}

const WrappedApp: React.FC = () => {
  const { viewStack, position } = useNavigation();
  const { showForm } = useDeck();

  appWindow.listen<string>("Add", ({ event, payload }) => {
    console.log(event, payload);
    showForm(payload as FormType);
  });

  return (
    <>
      <Header title="Story Deck" />
      {/* <SideBar /> */}
      <AddNewResourceForm />
      <MainDisplay currentView={viewStack[position]} />
    </>
  );
};

export default App;
