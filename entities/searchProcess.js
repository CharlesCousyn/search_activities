const puppeteer = require("puppeteer");
import searchResult from "../entities/searchResult"
import handlerSearchEngine from "../entities/handlerSearchEngine"
import handlerDuckDuck from "../entities/handlerDuckDuck"




async function getResultsFromUrls(urlArray)
{
    try
    {
		const browser = await puppeteer.launch(/*{headless: false}*/);
		urlArray.forEach( async url =>
		{
			//Launch Browser and open page
			const page = await browser.newPage();
			await page.goto(url, {waitUntil: "load"});

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

			let wantedNumberOfResults = 10;
			console.log("Getting " + wantedNumberOfResults + " results from DuckDuckGo....");
			let results = await page.evaluate(handlerDuckDuck.domToResults4, myMap, wantedNumberOfResults);

			console.log("Results gathered !");
			console.log("Number: " + results.length + "/"+wantedNumberOfResults);

			//await browser.close();
		});
    }
    catch (error)
    {
        console.error(error);
    }
}


function promiseParentMessage()
{
	return new Promise((resolve, reject) =>
	{
		process.on('message',
			async m =>
			{
				let results = await getResultsFromUrls(m[1]);
				process.send([m[0], results]);
				resolve();
			});
	});
}

promiseParentMessage().then();