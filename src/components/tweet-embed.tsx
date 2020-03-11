import React, { MutableRefObject } from 'react';
import { Linking, Animated } from 'react-native';
import WebView, {
  WebViewNavigation,
  WebViewMessageEvent,
} from 'react-native-webview';

import { TwitterWidgetJSContext } from './twitter-widget-provider';
import { useTwitterWidgetJS } from '../hooks/useTwitterWidgetJS';
import { LoadingIndicator } from './loading-indicator';

const aboutBlank = /about\:blank/;

const htmlTemplate = `
  <html>
    <head>
      <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no'>
    </head>
    <body>
      <div id="wrapper"></div>
    </body>
  </html>
`;

const useTweetEmbedMethods = ({
  js,
  tweetId,
}: {
  js: string | null;
  tweetId: string;
}) => {
  const [isLoading, setIsLoading] = React.useState(true);

  // dynamic css values
  const height = React.useRef(new Animated.Value(200));
  const opacity = React.useRef(new Animated.Value(0));
  // access to stopLoading method
  const webViewHandle = React.useRef<WebView>(null);

  const handleMessage = React.useCallback((event: WebViewMessageEvent) => {
    Animated.parallel([
      Animated.timing(height.current, {
        toValue: parseInt(event.nativeEvent.data, 10) + 20,
      }),
      Animated.timing(opacity.current, {
        toValue: 1,
      }),
    ]).start();
    setIsLoading(false);
  }, []);

  const onNavigationStateChange = React.useCallback(
    async ({ url }: WebViewNavigation) => {
      if (!aboutBlank.test(url) && webViewHandle.current) {
        try {
          webViewHandle.current.stopLoading();
          await Linking.openURL(url);
        } catch (e) {
          console.log(e);
        }
      }
    },
    [],
  );

  const createTweet = React.useMemo(() => {
    return `
      ${js}

      twttr.widgets.createTweet(
        '${tweetId}',
        document.getElementById('wrapper'),
        { align: 'center' }
      ).then(el => {
        window.ReactNativeWebView.postMessage(el.offsetHeight);
      })
      
      true;
    `;
  }, [js, tweetId]);

  return {
    createTweet,
    onNavigationStateChange,
    handleMessage,
    isLoading,
    webViewHandle,
    height: height.current,
    opacity: opacity.current,
  };
};

const TweetPreview: React.FC<{
  isLoading: boolean;
  height: Animated.Value;
  opacity: Animated.Value;
  webViewHandle: MutableRefObject<WebView | null>;
  handleMessage: (event: WebViewMessageEvent) => void;
  onNavigationStateChange: ({ url }: WebViewNavigation) => void;
  createTweet: string;
}> = ({
  isLoading,
  height,
  opacity,
  webViewHandle,
  handleMessage,
  onNavigationStateChange,
  createTweet,
}) => (
  <>
    <LoadingIndicator isLoading={isLoading} />
    <Animated.View
      style={{
        height: height,
        opacity: opacity,
      }}>
      <WebView
        ref={webViewHandle}
        originWhitelist={['*']}
        source={{ html: htmlTemplate }}
        onMessage={handleMessage}
        onNavigationStateChange={onNavigationStateChange}
        injectedJavaScript={createTweet}
      />
    </Animated.View>
  </>
);

export const TweetEmbedStandalone: React.FC<{ tweetId: string }> = ({
  tweetId,
}) => {
  const js = useTwitterWidgetJS();
  const methods = useTweetEmbedMethods({ js, tweetId });
  return <TweetPreview {...methods} />;
};

export const TweetEmbedContextConsumer: React.FC<{ tweetId: string }> = ({
  tweetId,
}) => {
  const { js } = React.useContext(TwitterWidgetJSContext);
  const methods = useTweetEmbedMethods({ js, tweetId });
  return <TweetPreview {...methods} />;
};
