import handlerDuckDuck from "./entities/handlerDuckDuck";

const OS = require('os');
const fork = require('child_process').fork;
const fs = require('fs').promises;

async function getResultsFromActivitiesString(activitiesStringTab, options)
{
	//Handling options errors
	if(options.image && options.web)
	{
		throw new Error("Cannot getResultsFromActivitiesString with options image and web to true !");
	}
	else if(typeof options === undefined)
	{
		throw new Error("Cannot getResultsFromActivitiesString without options !");
	}
	else if(options.wantedNumberResults === undefined)
	{
		throw new Error("Cannot getResultsFromActivitiesString without option wantedNumberResults !");
	}
	else if(options.activitiesPerSecond === undefined)
	{
		throw new Error("Cannot getResultsFromActivitiesString without option activitiesPerSecond !");
	}


	let numberActivities = activitiesStringTab.length;

	//Initiate handler
	let myHandlerDuckDuck = new handlerDuckDuck();

	//Static variables
	let baseUrl = myHandlerDuckDuck.baseUrl;
	let endUrlImage = myHandlerDuckDuck.endUrlImage;
	let requestWords = "how to ";

	//Construct url from activities string
	let urlTab = activityString2Url(activitiesStringTab, baseUrl, endUrlImage, requestWords, options);
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
				await createFileOfResults(allResults, options);
				console.log("New file of results generated !");

				//Exit
				process.exit(0);
			}
		});

		child.on("exit", () =>
		{
			console.log(child.pid);
			console.log("exit");
		});

		child.send(
			{
				activitiesString: arrayOfArrays[0][i],
				urls: arrayOfArrays[1][i],
				options: options
			});
	}

	//Configuring output
	let stringToDisp = "";
	if(options.web)
	{
		stringToDisp = "web";
	}
	else if(options.image)
	{
		stringToDisp = "image";
	}
	console.log("Searching " + options.wantedNumberResults + " " + stringToDisp + " results for "+ numberActivities + " activities...");

}

async function createFileOfResults(allResults, options)
{
	let timestamp = (new Date()).getTime();
	let folderName="";
	if(options.image)
	{
		folderName = "resultsImage";
	}
	else if(options.web)
	{
		folderName = "resultsWeb";
	}

	try
	{
		await fs.writeFile(__dirname + "/" + folderName + "/" + timestamp + "_results.json", JSON.stringify(allResults, null, "\t"));
	}
	catch(e)
	{
		console.error(e);
	}
}

function activityString2Url(activitiesStringTab, baseUrl, endUrl, requestWords, options)
{
	let urlTab = [];
	if(options.web)
	{
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
	}
	else if(options.image)
	{
		activitiesStringTab.forEach(elem =>
		{
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

			urlTab.push(baseUrl + parameter + endUrl);
		});
	}


	return urlTab;
}

//Divide work and give to processors
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

	//Removing empty arrays to support tests on few activities
	arrayOfArrays1 = arrayOfArrays1.filter(array => array.length > 0);
	arrayOfArrays2 = arrayOfArrays2.filter(array => array.length > 0);

	return [arrayOfArrays1, arrayOfArrays2];
}

//Execute the main process
(async () => {
	let data = await fs.readFile("./activitiesString.json");
	let activitiesStringTab = JSON.parse(data.toString());


	//options: { wantedNumberResults: 750, activitiesPerSecond: 2, web: true}
	await getResultsFromActivitiesString(activitiesStringTab, { wantedNumberResults: 750, activitiesPerSecond: 2, web: true } );
})();