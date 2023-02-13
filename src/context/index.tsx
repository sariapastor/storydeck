import React, { PropsWithChildren } from 'react';
import { DeckContextProvider } from './deckcontext';
import { NavigationContextProvider } from './navcontext';

export * from './navcontext';
export * from './deckcontext';

export const AppContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <NavigationContextProvider>
            <DeckContextProvider>
                {children}
            </DeckContextProvider>
        </NavigationContextProvider>
    );
};