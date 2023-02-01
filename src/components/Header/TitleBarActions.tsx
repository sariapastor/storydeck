import React from 'react';

enum menuItem {
  TELLING = "Recording",
  TEMPLATE = "Planned Recording",
  DECK = "Deck",
};

export const TitleBarActions: React.FC<{setUpdating: React.Dispatch<React.SetStateAction<[boolean, string]>>}> = ({ setUpdating }) => {
  const showForm = (payload: menuItem) => setUpdating([true, payload]);
  return (
    <div className="actions">
      <button onClick={() => showForm(menuItem.TELLING)}>📼</button>
      <button onClick={() => showForm(menuItem.TEMPLATE)}>📓</button>
      <button onClick={() => showForm(menuItem.DECK)}>🗂️</button>
    </div>
  );
};
