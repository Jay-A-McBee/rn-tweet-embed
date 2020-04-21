//
//  TwitterWidgetJSManager.m
//  RNTweetEmbed
//
//  Created by Jay Austin McBee on 4/20/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "TwitterWidgetJSManager.h"

@implementation TwitterWidgetJSManager

NSString * widgetJS = nil;

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(fetchWidgetJS,
                 fetchWidgetJSWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter: (RCTPromiseRejectBlock)reject)
{
  if(widgetJS == nil){
    NSURL * widgetURL = [NSURL URLWithString:@"https://platform.twitter.com/widgets.js"];
    NSMutableURLRequest * twitterWidgetJSRequest = [NSMutableURLRequest requestWithURL: widgetURL];
    NSURLSession * session = [NSURLSession sharedSession];
    NSURLSessionDataTask * task = [session dataTaskWithRequest:twitterWidgetJSRequest
                                             completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
      if(error != nil){
        reject(@"something_broke", @"error", error);
      }else if(data != nil){
        NSString * js = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
        widgetJS = js;
        resolve(js);
      }
    }
                                   ];
    [task resume];
  }else{
    resolve(widgetJS);
  }
}
@end
