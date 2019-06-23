const puppeteer = require("puppeteer");
import searchResult from "../entities/searchResult"
import handlerSearchEngine from "../entities/handlerSearchEngine"
import handlerDuckDuck from "../entities/handlerDuckDuck"

async function getResultsFromUrls(activitiesString, urls, wantedNumberResults)
{
    try
    {
		const browser = await puppeteer.launch(/*{headless: false}*/);


		//For each activity
		let promisesOfResults = [];
		for(let i = 0; i < urls.length; i++)
		{
			//Launch Browser and open page
			const page = await browser.newPage();
			await page.goto(urls[i], {waitUntil: "load"});

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

			//Create one promise per activity
			promisesOfResults.push(page.evaluate(handlerDuckDuck.domToResults4, myMap, wantedNumberResults));
		}


		//Execute all promises sending a message for each promise
		await executePromisesAndSendMessage(activitiesString, promisesOfResults, wantedNumberResults);

		//Stop browser
		browser.close();
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
			async ({activitiesString, urls, wantedNumberResults}) =>
			{
				await getResultsFromUrls(activitiesString, urls, wantedNumberResults);
				resolve();
			});
	});
}

function executePromisesAndSendMessage(activitiesString, proms, wantedNumberResults)
{
	for (let i =0; i < proms.length; i++)
	{
		proms[i]
		//Send array of results
		.then(results =>
		{
			process.send(
				{
					activityName: activitiesString[i],
					wantedNumberResults: wantedNumberResults,
					realNumberResults: results.length,
					results: results});
		})
		//Send empty array if error
		.catch(e =>
		{
			console.error(e);
			process.send(
				{
					activityName: activitiesString[i],
					wantedNumberResults: wantedNumberResults,
					realNumberResults: 0,
					results: []
				});
		});
	}
	return Promise.all(proms);
}

//Launch work!
promiseParentMessage().then();