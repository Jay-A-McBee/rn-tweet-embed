import React from 'react';
import { View } from 'react-native';

import { TweetEmbed } from './components/tweet-embed';
import TwitterWidgetJSProvider from './components/twitter-widget-provider';

const Example: React.FC = () => {
  return (
    <TwitterWidgetJSProvider>
      <View>
        <TweetEmbed tweetId={'1236076554909872128'} />
      </View>
    </TwitterWidgetJSProvider>
  );
};

export default Example;
