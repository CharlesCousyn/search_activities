const puppeteer = require("puppeteer");
const pThrottle = require('p-throttle');
import searchResultWeb from "./searchResultWeb"
import searchResultImage from "./searchResultImage"
import handlerSearchEngine from "../entities/handlerSearchEngine"
import handlerDuckDuck from "../entities/handlerDuckDuck"

//options: { wantedNumberResults: 750, activitiesPerSecond: 2, web: true}
async function getResultsFromUrls(activitiesString, urls, options)
{
    try
    {
    	//Launch Browser
		const browser = await puppeteer.launch(/*{headless: false}*/);

		//Choose the type of results
		//And choosing callback of evaluate
		let resultClass;
		let method;
		if(options.web)
		{
			resultClass = searchResultWeb;
			method = handlerDuckDuck.domToResultsWeb;
		}
		else if(options.image)
		{
			resultClass = searchResultImage;
			method = handlerDuckDuck.domToResultsImage;
		}

		//For each activity
		let promisesOfResults = [];
		for(let i = 0; i < urls.length; i++)
		{
			//Adding classes in Browser context
			let myMap = [
				[resultClass.name, resultClass.toString()],
				[handlerSearchEngine.name, handlerSearchEngine.toString()],
				[handlerDuckDuck.name, handlerDuckDuck.toString()]
			];

			//Create one promise (with rate limit) per activity
			let pThrottlePromise = pThrottle(async () =>
			{
				//Open page
				const page = await browser.newPage();

				//Get access to console output
				page.on('console', async msg => {
					const args = await msg.args();
					args.forEach(async (arg) => {
						const val = await arg.jsonValue();
						// value is serializable
						if (JSON.stringify(val) !== JSON.stringify({})) console.log(val);
						// value is unserializable (or an empty oject)
						else
							{
							const { type, subtype, description } = arg._remoteObject;
							console.log(`type: ${type}, subtype: ${subtype}, description:\n ${description}`);
						}
					})});

				await page.goto(urls[i], {waitUntil: "load"});

				let results =  await page.evaluate(method, myMap, options.wantedNumberResults);

				await page.close();

				return results;
			}, options.activitiesPerSecond, 1000);

			promisesOfResults.push(pThrottlePromise());
		}


		//Execute all promises sending a message for each promise
		await executePromisesAndSendMessage(activitiesString, promisesOfResults, options.wantedNumberResults);

		//Stop browser
		browser.close();
    }
    catch (error)
    {
        console.error(error);
    }
}

//options: { wantedNumberResults: 750, activitiesPerSecond: 2, web: true}
function promiseParentMessage()
{
	return new Promise((resolve, reject) =>
	{
		process.on('message',
			async ({activitiesString, urls, options}) =>
			{
				await getResultsFromUrls(activitiesString, urls, options);
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
promiseParentMessage().then(/*()=> {process.disconnect()}*/);