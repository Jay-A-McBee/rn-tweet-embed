import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import RNFetchBlob, { FetchBlobResponse } from 'rn-fetch-blob';

export const TwitterWidgetJSContext = React.createContext<{
  js: string | null;
}>({
  js: null,
});

enum StorageIdentifier {
  Script = 'twitterWidgetScript',
  SaveDate = 'saveDate',
}

const TWITTER_WIDGET_URL = 'https://platform.twitter.com/widgets.js';

// cache invalidation - redownload the script when local version is 30 days old
const millisecondsPerDay = 1000 * 60 * 60 * 24;
const todayInMS = Date.now();
const msToDays = (time: number) => time / millisecondsPerDay;

const TwitterWidgetJSProvider: React.FC<{
  children: JSX.Element;
}> = ({ children }) => {
  const [widgetJS, setWidgetJS] = React.useState<string | null>(null);

  const checkLocalStorage = React.useCallback(() => {
    return Promise.all([
      AsyncStorage.getItem(StorageIdentifier.Script),
      AsyncStorage.getItem(StorageIdentifier.SaveDate),
    ]);
  }, []);

  const saveToLocalStorage = React.useCallback(
    (script: string, date: string) => {
      AsyncStorage.setItem(StorageIdentifier.Script, script);
      AsyncStorage.setItem(StorageIdentifier.SaveDate, date);
    },
    [],
  );

  const diffTime = (saveTime: number, now: number) =>
    msToDays(now) - msToDays(saveTime);

  const getScript = React.useCallback(async () => {
    const [script, saveDate] = await checkLocalStorage();
    if (saveDate && diffTime(parseInt(saveDate, 10), todayInMS) < 30) {
      setWidgetJS(script);
    } else {
      const { data }: FetchBlobResponse = await RNFetchBlob.fetch(
        'GET',
        TWITTER_WIDGET_URL,
      );

      saveToLocalStorage(data, todayInMS.toString());
      setWidgetJS(data);
    }
  }, [checkLocalStorage, saveToLocalStorage]);

  React.useEffect(() => {
    try {
      getScript();
    } catch (e) {
      console.warn(e);
    }
  }, [getScript]);
  const value = React.useMemo<{ js: string | null; isLoading: boolean }>(
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
