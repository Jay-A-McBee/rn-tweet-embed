import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import RNFetchBlob, { FetchBlobResponse } from 'rn-fetch-blob';

enum StorageIdentifier {
  Script = '@twitterWidgetScript',
  SaveDate = '@saveDate',
}

const TWITTER_WIDGET_URL = 'https://platform.twitter.com/widgets.js';

// cache invalidation - redownload the script when local version is a week old
const todayInMS = Date.now();
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const diffTime = (saveTime: number, now: number) =>
  now / MS_PER_DAY - saveTime / MS_PER_DAY;

export const useTwitterWidgetJS = () => {
  const [widgetJS, setWidgetJS] = React.useState<string | null>(null);

  const checkLocalStorage = React.useCallback(() => {
    return AsyncStorage.multiGet([
      StorageIdentifier.Script,
      StorageIdentifier.SaveDate,
    ]);
  }, []);

  const saveToLocalStorage = React.useCallback(
    (script: string, date: string) => {
      AsyncStorage.multiSet([
        [StorageIdentifier.Script, script],
        [StorageIdentifier.SaveDate, date],
      ]);
    },
    [],
  );

  const getScript = React.useCallback(async () => {
    const [[, script], [, saveDate]] = await checkLocalStorage();

    if (saveDate && diffTime(parseInt(saveDate, 10), todayInMS) < 7) {
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

  return widgetJS;
};
