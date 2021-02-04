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
  "headlessMode": true,  //To see chrome GUI
  "contentFiltering": "moderate", //OR "noFilter" OR "strict"
  "advertisementAllowed": false //Does advertisement results allowed?
}
```

**Where can I find the results?** <br/>
In the folder ``resultsImages`` or ``resultsWeb``
The format of the file generated is the following:
```
[
    {
        "name": "brush teeth",
        "url": "https://duckduckgo.com/?q=brush+teeth&iar=images&ia=images&iax=images",
        "wantedNumberResults": 10,
        "realNumberResults": 10,
        "results": 
        [
            {
              "titleRelatedPage": "When’s The Best Time to Brush My Teeth?",
              "urlRelatedPage": "http://www.orthodonticslimited.com/teeth/best-time-to-brush-teeth/",
              "urlImage": "http://www.orthodonticslimited.com/wp-content/uploads/2016/08/woman-about-to-brush-teeth.jpg"
            }, 
            ...
        ]
    },
    ...
]
```
