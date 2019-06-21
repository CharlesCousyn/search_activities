import handlerDuckDuck from "./entities/handlerDuckDuck";

const OS = require('os');
const fork = require('child_process').fork;

async function getResultsFromActivitiesString(activitiesStringTab)
{
	//Initiate handler
	let myHandlerDuckDuck = new handlerDuckDuck();

	//Static variables
	let baseUrl = myHandlerDuckDuck.baseUrl;
	let requestWords = "how to ";

	//Construct url from activities string
	let urlTab = activityString2Url(activitiesStringTab, baseUrl, requestWords);
	console.log(urlTab);

	//Getting number of core
	let cpuCount = OS.cpus().length;
	console.log(cpuCount);

	let arrayOfArrays = divideArrayOfUrlAndActivities(activitiesStringTab, urlTab, cpuCount);
	console.log(arrayOfArrays);

	//Construct promises
	let promises = [];
	for(let i = 0; i < arrayOfArrays[0].length; i++)
	{
		promises.push(promiseChildMessage(arrayOfArrays[0][i], arrayOfArrays[1][i]));
	}

	let allResults = await Promise.all(promises);

	console.log(allResults);

}

function promiseChildMessage(activitiesString, urls)
{
	return new Promise((resolve, reject) =>
	{
		const child = fork(__dirname + "/entities/searchProcess.js",);

		child.on('message', (m) =>
		{
			resolve(m);
		});

		child.on('error', (e) =>
		{
			reject(e);
		});

		child.on('exit', () =>
		{
			resolve();
		});


		child.send([activitiesString, urls]);
	});
}

function activityString2Url(activitiesStringTab, baseUrl, requestWords)
{
	let urlTab = [];

	activitiesStringTab.forEach(elem =>
	{
		elem = requestWords + elem;
		let parameter = elem.split(" ").reduce(((total, currentWord, index) =>
		{
			if(index === 0)
			{
				return total + currentWord
			}
			else
			{
				return total + "+" + currentWord
			}
		}), "");

		urlTab.push(baseUrl + parameter);
	});

	return urlTab;
}

function divideArrayOfUrlAndActivities(activitiesStringTab, urlTab, wantedTabs)
{
	let numberOfUrl = urlTab.length;
	let baseNumberOfUrlInSmallTabs = Math.floor(numberOfUrl / wantedTabs);

	let arrayOfArrays1 = [];
	let arrayOfArrays2 = [];

	//Adding the minimum of url
	for(let i = 0; i < wantedTabs; i++)
	{
		arrayOfArrays1.push(activitiesStringTab.splice(0, baseNumberOfUrlInSmallTabs));
		arrayOfArrays2.push(urlTab.splice(0, baseNumberOfUrlInSmallTabs));
	}

	//Adding the remaining activityString
	arrayOfArrays1.forEach(array =>
	{
		let activityString = activitiesStringTab.splice(0, 1)[0];
		if(activityString !== undefined)
		{
			array.push(activityString);
		}
	});

	//Adding the remaining url
	arrayOfArrays2.forEach(array =>
	{
		let url = urlTab.splice(0, 1)[0];
		if(url !== undefined)
		{
			array.push(url);
		}
	});

	return [arrayOfArrays1, arrayOfArrays2];
}

getResultsFromActivitiesString(
	["make tea", "brush teeth", "cook", "make kids", "cook pasta",
		"watch tv", "wash the floor", "wash the dishes", "drink water", "do poop"]).then();