import React from 'react';
import { NativeModules } from 'react-native';

const { TwitterWidgetJSManager } = NativeModules;

export const useTwitterWidgetJS = () => {
  const [widgetJS, setWidgetJS] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const getScript = React.useCallback(async () => {
    const data = await TwitterWidgetJSManager.fetchWidgetJS();
    setWidgetJS(data);
  }, [setWidgetJS]);

  React.useEffect(() => {
    try {
      getScript();
    } catch (e) {
      setError(e);
    }
  }, [getScript]);

  return {
    widgetJS,
    error
  };
};
