import React from 'react';

import { useTwitterWidgetJS } from '../hooks/useTwitterWidgetJS';

export const TwitterWidgetJSContext = React.createContext<{
  js: string | null;
}>({
  js: null,
});

const TwitterWidgetJSProvider: React.FC<{
  children: JSX.Element;
}> = ({ children }) => {
  const widgetJS = useTwitterWidgetJS();
  const value = React.useMemo<{ js: string | null }>(
    () => ({
      js: widgetJS,
    }),
    [widgetJS],
  );

  return (
    <TwitterWidgetJSContext.Provider value={value}>
      {children}
    </TwitterWidgetJSContext.Provider>
  );
};

export default TwitterWidgetJSProvider;
