# Search Activities

**Requirements** <br/>
- [Node.js]
- [NPM]

**How to install the project?** <br/>
Just run ```npm install```

**How to run the project?** <br/>
Just run ```npm start```

**Where are the activity labels to crawl?** <br/>
In the root folder, in the file ```activitiesString.json```

**Where can I change my parameters?** <br/>
In the root folder, in the file ```generalConfig.json```
```
{
  "numberOfTabsUsed": 1, //Parallel parameter
  "baseUrl" : "https://duckduckgo.com/?q=",
  "endUrlImage" : "&iar=images&ia=images&iax=images",
  "wantedNumberResults": 2,
  "crawlMode": "image", //OR "web"
  "requestWords" : "how to ",
  "headlessMode": true  //To see chrome GUI
}
```
