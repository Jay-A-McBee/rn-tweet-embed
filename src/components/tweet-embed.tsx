import React, { MutableRefObject } from 'react';
import { Linking, Animated, NativeModules } from 'react-native';
import WebView, {
  WebViewNavigation,
  WebViewMessageEvent,
} from 'react-native-webview';

import { useTwitterWidgetJS } from '../hooks/useTwitterWidgetJS';
import { LoadingIndicator } from './loading-indicator';

const ABOUT_BLANK_PATTERN = /about\:blank/;

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

const TweetEmbed: React.FC<{ tweetId: string }> = ({ tweetId }) => {
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
        useNativeDriver: false
      }),
      Animated.timing(opacity.current, {
        toValue: 1,
        useNativeDriver: false
      }),
    ]).start();
    setIsLoading(false);
  }, []);

  const onNavigationStateChange = React.useCallback(
    async ({ url }: WebViewNavigation) => {
      if (!ABOUT_BLANK_PATTERN.test(url) && webViewHandle.current) {
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

  const {
    widgetJS,
    error
  } = useTwitterWidgetJS();

  const createTweet = React.useMemo(() => {
    return `
     ${widgetJS}

     try{
       twttr.widgets.createTweet(
         '${tweetId}',
         document.getElementById('wrapper'),
         { align: 'center' }
       ).then(el => {
           window.ReactNativeWebView.postMessage(el.offsetHeight);
       })
     }catch(e){}
      
      true
    `
  }, [tweetId, widgetJS]);

  return (
    <>
      <LoadingIndicator isLoading={isLoading} />
      <Animated.View
        style={{
          height: height.current,
          opacity: opacity.current,
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
  )
};

export default TweetEmbed;