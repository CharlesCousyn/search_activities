const puppeteer = require("puppeteer");
import searchResult from "../entities/searchResult"
import handlerSearchEngine from "../entities/handlerSearchEngine"
import handlerDuckDuck from "../entities/handlerDuckDuck"



async function getResultsFromActivityString(activityString)
{
    try
    {
        //Launch Browser and open page
        const browser = await puppeteer.launch(/*{headless: false}*/);
        const page = await browser.newPage();
        await page.goto(activityString,{waitUntil: "load"});

        //Get access to console output
        page.on('console', async msg => {
			const args = await msg.args();
			args.forEach(async (arg) => {
				const val = await arg.jsonValue();
				// value is serializable
				if (JSON.stringify(val) !== JSON.stringify({})) console.log(val);
				// value is unserializable (or an empty oject)
				else {
					const { type, subtype, description } = arg._remoteObject;
					console.log(`type: ${type}, subtype: ${subtype}, description:\n ${description}`);
				}
			})});

        //Adding the class result in Browser context
        let myMap = [
            [searchResult.name, searchResult.toString()],
            [handlerSearchEngine.name, handlerSearchEngine.toString()],
            [handlerDuckDuck.name, handlerDuckDuck.toString()]
        ];

		let wantedNumberOfResults = 750;
		console.log("Getting " + wantedNumberOfResults + " results from DuckDuckGo....");
        let results = await page.evaluate(handlerDuckDuck.domToResults4, myMap, wantedNumberOfResults);

		console.log("Results gathered !");
		console.log("Number: " + results.length + "/"+wantedNumberOfResults);

        //await browser.close();
    }
    catch (error)
    {
        console.error(error);
    }
}

getResultsFromActivityString("https://duckduckgo.com/?q=how+to+make+tea")
    .then();