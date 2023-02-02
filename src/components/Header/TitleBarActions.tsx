import React from 'react';
import { useDeck } from '../../context';

enum menuItem {
  TELLING = "recording",
  TEMPLATE = "plan",
  DECK = "collection",
};

export const TitleBarActions: React.FC = () => {
  const { showForm } = useDeck();
  // const showForm = (payload: menuItem) => setUpdating([true, payload]);
  return (
    <div className="actions">
      <button onClick={() => showForm(menuItem.TELLING)}>📼</button>
      <button onClick={() => showForm(menuItem.TEMPLATE)}>📓</button>
      <button onClick={() => showForm(menuItem.DECK)}>🗂️</button>
    </div>
  );
};
