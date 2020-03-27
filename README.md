# rn-tweet-embed

Add a tweet to a native app with panache

# Problem

Twitter sunsetted their TwitterKit SDK on October 31, 2018, but you need to embed a tweet in a React Native project. You can limp your way through a native module, but Objective-C looks like an alien language and Java is, well, Java.

# Let's make that tweet a bed

We can seemlessly embed a tweet on the cheap with a simple WebView component and the Twitter for websites Javascript API (https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions)

## Naive to Goodish to Good

Ok, so this is about problem solving. No doubt the tweet embed evokes the same sense of accomplishment I get from a freshly mown lawn, but this is more about the process. I solve problems by building momentum. If it's a small problem, I go straight to code. This is about solving a small problem, steadily building momentum and arriving at something that is efficient and reusable. I'll try to get something off the ground without doing research, see how my instincts were wrong or what concerns are going to come up down the road.

If you handed me a piece of paper and told me to make it fly, this would be iteration 1.

<img src='https://www.rightlivelihoodquest.com/wp-content/uploads/2018/09/crumpled-paper-ball.jpg' width='500'>

It will fly if thrown hard enough. It's not very efficient or streamlined and it certainly won't glide gracefully to a stop. But, it checks all boxes in terms of going from point A to B in the air. I am aware that this is far from a finished product, but I've got a base to build on - I mean this **literal** piece of garbage already flies.

## Just load the tweet's status url

The WebView `source` prop accepts a uri string and a tweet url has the following structure `https://twitter.com/:userHandle/status/:tweetId`. Ok, let's put on our dunce cap and get crackin'.

```javascript
<WebView
  source={{ uri: 'https://twitter.com/AkMcbell/status/1236076558693142528' }}
/>
```

<img src='https://github.com/Jay-A-McBee/rn-tweet-embed/blob/master/naive.png' width='250'>

Hmm... I don't hate this. We're rendering a specific tweet - an indisputable fact. Unfortunately, we'll have to know the twitter user's handle (not impossible, but 100% required). The styling is also off. We're clearly in a browser window so it doesn't feel quite right. The tweet might get cut off vertically and we don't have an exposed method to measure this DOM node and adjust accordingly. _Dynamically updating height is going to be a concern_. Let's keep this impl in our hip pocket - it's ugly and forces us to need more info about the tweet. Nevertheless, we got here pretty quickly and, in a pinch, it might work.

## Let's do some research

A quick google search of terms like 'tweet embed' will probably land you on the twitter dev blog (https://blog.twitter.com/developer/en_us/topics/tips/2019/displaying-tweets-in-ios-apps.html). Ok, published December 19th of this last year, we're on the right track.

> The current recommended way to integrate Tweets into your app is by using our Javascript-based Embedded Tweets. Integrating WebViews into your app can be a complicated task, especially since Embedded Tweets have a dynamic height due to the variable content of Tweets.

I recommend reading the article (a Swift solution), but here's what it boils down to:

- load twitter's widget.js script
- inject this script and a configured execution of the method `twttr.widgets.createTweet` into the WebView

It looks like widget.js will do the work for us.

## Let's dust off some script tags

The WebView `source` prop accepts a static html template, we can use a script tag and loading snippet. We can also use the WebView's `injectJavascript` prop to call our `createTweet` factory function.

```
const htmlTemplate = `
  <html>
    <head>
      <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no'>
      <script>
        window.twttr = (function(d, s, id) {
          var head = d.getElementsByTagName(s)[0];
          var t = window.twttr || {};
          var js = d.createElement('script');
          js.id = id;
          js.src = "https://platform.twitter.com/widgets.js";
          head.appendChild(js);

          t._e = [];
          t.ready = function(f) {
            t._e.push(f);
          };

          return t;
        }(document, "head", "twitter-wjs"));
      </script>
    </head>
    <body>
      <div id="wrapper"></div>
    </body>
  </html>
`;

  <WebView
    originWhitelist={['*']}
    source={{ html: template }}
    injectedJavaScript={`
      twttr.widgets.createTweet(
        '1236076554909872128',
        document.getElementById('wrapper'),
        { align: 'center' }
      )
      true
    `}
  />
```

![less naive](https://github.com/Jay-A-McBee/rn-tweet-embed/blob/master/less-naive.png?raw=true)

This is looking much better. Height will still be an issue when we've got more elements in the view, but this doesn't feel like a browser anymore. The downside here is that eventhough this is reusable, it's not efficient. We can easily build a component that accepts a tweet id and uses this template, but what if we have multiple tweets in the same view or throughout the app. Every time this component mounts we're going to request the widget.js script. Back to the drawing board.

In terms of paper airplane tech, I'd say we're about here:

![mach 2](https://www.nsta.org/main/news/stories/images/sc/0302/home4.gif)

Whoa! This is no paper wad. We've got configuration - look at all those folds. Still lacking some essential renfinement, but we're 90% there.

## In the words of Walter Sobchack - "Let's take that hill!"

So we need to make sure we only download the script a single time. I don't think our script tag in the template is going to be of much use. Let's chuck it.

```html
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
```

We're going to use the `rn-fetch-blob` library to load the twitter widget script - let's whip up a quick hook for that.

```js
const TWITTER_WIDGET_URL = 'https://platform.twitter.com/widgets.js';

export const useTwitterWidgetJS = () => {
  const [widgetJS, setWidgetJS] = React.useState<string | null>(null);

  const getScript = React.useCallback(async () => {
      const { data }: FetchBlobResponse = await RNFetchBlob.fetch(
        'GET',
        TWITTER_WIDGET_URL,
      );
      setWidgetJS(data);
    }
  }, [setWidgetJS]);

  React.useEffect(() => {
    try {
      getScript();
    } catch (e) {
      console.warn(e);
    }
  }, [getScript]);

  return widgetJS;
```

We're still faced with the dilemma of only wanting to do this a single time meaning that we can't just throw our hook into the `TweetPreview` and call it good. Hmm... this sounds like something we can solve with `React.Context`.

```js
export const TwitterWidgetJSContext = React.createContext<{
  js: string | null;
}>({
  js: null,
});
```

our exported Provider and how we'll use it

```js
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

<SafeAreaView style={{ flex: 1 }}>
  <TwitterWidgetJSProvider>
    <View>
      <TweetEmbed tweetId={'1236076554909872128'} />
    </View>
  </TwitterWidgetJSProvider>
</SafeAreaView>
```

So we've somewhat solved that problem. We won't have to fetch the script for every tweet we render, but we will fetch the script everytime our provider mounts. We could move it high enough in the tree to limit that or we can use a local cache to store the script after we fetch it the first time. I went the route of caching the script and invalidating that cache every 7 days.

Some new/updated methods and constants in our `useTwitterWidgetJS` hook.

```js
// cache invalidation - redownload the script when local version is a week old
const todayInMS = Date.now();
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const diffTime = (saveTime: number, now: number) =>
  now / MS_PER_DAY - saveTime / MS_PER_DAY;

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
```

We're not only loading the script a single time - we're loading the script once a week :rocket: - AsyncStorage is just one option. We could use `rn-fetch-blob` to both save the script to the cache of the device and read the script from the cache in our hook. Far be it from me from telling anyone how to run their cache.

After a number of semi-severe paper-cuts, we're now here reeling in origamic bliss and zipping through the air without a care in the world.

![mach 3](https://3.bp.blogspot.com/-QCtcFBgXE4U/UGmkXECP3FI/AAAAAAAAAXc/po3uIqoKbAQ/s1600/Paper-plane.jpg)

## Let's do some "bell and whistle" type shit

![twitter embed](https://github.com/Jay-A-McBee/rn-tweet-embed/blob/master/twitter-embed.gif?raw=true)
