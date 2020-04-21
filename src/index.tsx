import React from 'react';
import { View, SafeAreaView } from 'react-native';

import TweetEmbed from './components/tweet-embed';

const Example: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <TweetEmbed tweetId={'1236076554909872128'} />
      </View>
      <View>
        <TweetEmbed tweetId={'1216914559937716225'} />
      </View>
    </SafeAreaView>
  );
};

export default Example;
