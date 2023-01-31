import React from 'react';

enum menuItems {
  TELLING = "+ New Recording",
  TEMPLATE = "+ New Planned Recording",
  DECK = "+ New Collection",
};

export const NewButton: React.FC<{setUpdating: React.Dispatch<React.SetStateAction<[boolean, string]>>}> = ({ setUpdating }) => {
  const showForm: React.MouseEventHandler<HTMLLIElement> = (e) => {
    let payload = "";
    switch ((e.target as HTMLLIElement).textContent) {
      case menuItems.TELLING:
        payload = "Recording";
        break;
      case menuItems.TEMPLATE:
        payload = "Planned Recording";
        break;
      case menuItems.DECK:
        payload = "Deck";
        break;
      default:
        console.log("Unrecognized menu item: ", (e.target as HTMLLIElement).textContent);
    }
    setUpdating([true, payload]);
  };
  return (
    <div className="header-menu">
      <button className="header-control">+ New</button>
      <ul className="drop-down">
        <li onClick={showForm}>{menuItems.TELLING}</li>
        <li onClick={showForm}>{menuItems.TEMPLATE}</li>
        <li onClick={showForm}>{menuItems.DECK}</li>
      </ul>
    </div>
  );
};
