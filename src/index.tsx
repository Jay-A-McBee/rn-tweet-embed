import React from 'react';
import { View, SafeAreaView } from 'react-native';

import {
  TweetEmbedContextConsumer,
  TweetEmbedStandalone,
} from './components/tweet-embed';
import TwitterWidgetJSProvider from './components/twitter-widget-provider';

const Example: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* <TwitterWidgetJSProvider>
        <View>
          <TweetEmbedContextConsumer tweetId={'1236076554909872128'} />
        </View>
      </TwitterWidgetJSProvider> */}
      <View>
        <TweetEmbedStandalone tweetId={'1216914559937716225'} />
      </View>
    </SafeAreaView>
  );
};

export default Example;
