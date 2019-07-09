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
In the root folder, in the file ```main.js```, there is an object named options. 
The format is:
```
{ 
  wantedNumberResults: 750, 
  activitiesPerSecond: 2, 
  image: true
  ***OR***
  web: true
}
```
(Warning: The properties "image" and "web" are mutually exclusive)
