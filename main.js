import handlerDuckDuck from "./entities/handlerDuckDuck";

const OS = require('os');
const fork = require('child_process').fork;
const fs = require('fs').promises;

async function getResultsFromActivitiesString(activitiesStringTab, wantedNumberResults)
{
	let numberActivities = activitiesStringTab.length;

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

	//Create the x child processes
	//Array of json objects {activityName: activitiesString[i], results: results}
	let allResults = [];
	for(let i = 0; i < arrayOfArrays[0].length; i++)
	{
		const child = fork(__dirname + "/entities/searchProcess.js",);

		child.on('message', async (m) =>
		{
			//Add the object activity-results to the array
			allResults.push(m);

			//Log progress
			let percents = 100 * allResults.length / numberActivities;
			console.log("Progress: " + allResults.length + "/" + numberActivities + " (" + percents +" %)");

			//Create a file with timestamp and exit if have have all results we need
			if(allResults.length === numberActivities)
			{
				console.log("Writing a new file of results ....");
				await createFile(allResults);
				console.log("New file of results generated !");

				//Exit program
				process.exit(0);
			}
		});

		child.send({activitiesString: arrayOfArrays[0][i], urls: arrayOfArrays[1][i], wantedNumberResults: wantedNumberResults});
	}

	console.log("Searching " + wantedNumberResults + " results for "+ numberActivities + " activities...");

}

async function createFile(allResults)
{
	let timestamp = (new Date()).getTime();

	try
	{
		await fs.writeFile(__dirname + "/results/" + timestamp + "_results.json", JSON.stringify(allResults, null, "\t"));
	}
	catch(e)
	{
		console.error(e);
	}
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
		"watch tv", "wash the floor", "wash the dishes", "drink water", "do poop"], 750).then();