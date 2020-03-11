# rn-tweet-embed

Add a tweet to a native app with panache

# Problem

Twitter sunsetted their TwitterKit SDK on October 31, 2018, but you need to embed a tweet in a React Native project. You can limp your way through a native module, but Objective-C looks like an alien language and Java is, well, Java.

# Let's make that tweet a bed

We can seemlessly embed a tweet on the cheap with a simple WebView component and the Twitter for websites Javascript API (https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions)

## Naive to Goodish to Good

Ok, so this is about problem solving. No doubt the tweet embed evokes the same sense of accomplishment I get from a freshly mown lawn, but this is about the ride. I solve problems by first doing it the simplest and most naive way possible. If I can get something off the ground without doing research, I'll give that a shot and probably see how my instincts were wrong or what concerns are going to come up down the road. If we were making paper airplanes in a 'tabula rasa' state, this is my iteration 1.

<img src='https://www.rightlivelihoodquest.com/wp-content/uploads/2018/09/crumpled-paper-ball.jpg' width='500'>

It will fly if thrown hard enough. It's not very efficient or streamlined and it certainly won't glide gracefully to a stop. But, it checks all boxes in terms of going from point A to B in the air. Once all this "badness" is out in the open, we can start to improve the implementation without the fear of a failed outcome - I mean this **literal** piece of garbage already flies.

## Just load the tweet's status url

The WebView `source` prop accepts a uri string and a tweet url has the following structure `https://twitter.com/:userHandle/status/:tweetId`. Ok, let's put on our dunce cap and get crackin'.

```javascript
<WebView
  source={{ uri: 'https://twitter.com/AkMcbell/status/1236076558693142528' }}
/>
```

<img src='https://github.com/Jay-A-McBee/rn-tweet-embed/blob/master/naive.png' width='250'>

Hmm... I don't hate this. We're rendering a specific tweet - an indisputable fact. Unfortunatley, we'll have to know the twitter user's handle (not impossible, but 100% required). The styling is also off. We're clerly in a browser window so it doesn't feel quite right. The tweet might get cut off vertically and we don't have an exposed method to measure this DOM node and adjust accordingly. _Dynamically updating height is going to be a concern_. Let's keep this impl in our hip pocket - it's ugly and forces us to need more info about the tweet. Nevertheless, we got here pretty quickly and, in a pinch, it might work.

## Let's do some research

A quick google search of terms like 'tweet embed' will probably land you on the twitter dev blog (https://blog.twitter.com/developer/en_us/topics/tips/2019/displaying-tweets-in-ios-apps.html). Ok, published December 19th of this last year, we're on the right track.

> The current recommended way to integrate Tweets into your app is by using our Javascript-based Embedded Tweets. Integrating WebViews into your app can be a complicated task, especially since Embedded Tweets have a dynamic height due to the variable content of Tweets.
> I recommend reading the article (a Swift implementation), but here's what it boils down to:

- load twitter's widget.js script
- inject this script and a configured execution of the method `twttr.widgets.createTweet` into the WebView

It looks like widget.js will do the work for us.

## Let's dust off some script tags

The WebView `source` prop accepts a static html template, I know how to use a script tag and Twitter provides an optimized loading snippet.

```
const template = `
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

![twitter embed](https://github.com/Jay-A-McBee/rn-tweet-embed/blob/master/twitter-embed.gif?raw=true)
