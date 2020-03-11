# rn-tweet-embed

Add a tweet to a native app with panache

# Problem

Twitter sunsetted their TwitterKit SDK on October 31, 2018, but you need to embed a tweet in a React Native project. You can limp your way through a native module, but Objective-C looks like an alien language and Java is, well, Java.

# Let's make that tweet a bed

We can seemlessly embed a tweet on the cheap with a simple WebView component and the Twitter for websites Javascript API (https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions)

# Naive to Goodish to Good

Ok, so this is about problem solving. No doubt the tweet embed evokes the same sense of accomplishment I get from a freshly mown lawn, but this is about the ride. I solve problems by first doing it the simplest and most naive way possible. If we were making paper airplanes, this is my iteration 1.
![mach 1](https://www.rightlivelihoodquest.com/wp-content/uploads/2018/09/crumpled-paper-ball.jpg)
It will fly if thrown hard enough. It's not very efficient or streamlined and it certainly won't glide gracefully to a stop. But, it checks all boxes in terms of going from point A to B in the air. Once all this "badness" is out in the open, we can start to improve the implementation without the fear of a failed outcome - I mean this **literal** piece of garbage already flies.

# Just load the tweet's status url

The WebView `source` prop accepts a uri string and a tweet url has the following structure `https://twitter.com/:userHandle/status/:tweetId`. Ok, let's put on our dunce cap and get crackin'.

```javascript
<WebView
  source={{ uri: https://twitter.com/someTwitterHandle/status/1236076558693142528}}
/>
```

Hmm... I don't hate this. We're rendering a specific tweet, but we'll have to know the twitter user's handle (not impossible, but 100% necessary). The styling is also off. We're clerly in a browser window so it doesn't feel quite right. The tweet might get cut off vertically and we don't have an exposed method to measure this DOM node and adjust accordingly.

![twitter embed](https://github.com/Jay-A-McBee/rn-tweet-embed/blob/master/twitter-embed.gif?raw=true)
