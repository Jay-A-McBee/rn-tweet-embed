import React from 'react';

import { useTwitterWidgetJS } from '../hooks/useTwitterWidgetJS';

export const TwitterWidgetJSContext = React.createContext<{
  js: string | null;
  error: string | null;
}>({
  js: null,
  error: null
});

const TwitterWidgetJSProvider: React.FC<{
  children: JSX.Element;
}> = ({ children }) => {

  const { widgetJS, error } = useTwitterWidgetJS();

  const value = React.useMemo<{ js: string | null, error: string | null }>(
    () => ({
      js: widgetJS,
      error
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
