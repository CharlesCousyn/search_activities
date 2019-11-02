import activitiesString from "./activitiesString"
import GENERAL_CONFIG from "./generalConfig"

const filesystem = require('fs').promises;
import { from} from 'rxjs'
import { map, concatMap, mergeMap, toArray, bufferCount, tap } from 'rxjs/operators'
import puppeteer from "puppeteer"
import searchResultWeb from "./entities/searchResultWeb";
import searchResultImage from "./entities/searchResultImage";

function addUrl(activityString, requestWords)
{
	//Static variables
	let baseUrl = GENERAL_CONFIG.baseUrl;
	let endUrlImage = GENERAL_CONFIG.endUrlImage;

	//Construct url from activities string
	return{
		name: activityString,
		url: activityString2Url(activityString, baseUrl, endUrlImage, requestWords),
		wantedNumberResults: GENERAL_CONFIG.wantedNumberResults
	};
}

async function createFileOfResults(allResults)
{
	let timestamp = (new Date()).getTime();
	let folderName = "";
	switch(GENERAL_CONFIG.crawlMode)
	{
		case "web":
			folderName = "resultsWeb";
			break;
		case "image":
			folderName = "resultsImage";
			break;
		default:
			console.error("Bad crawlMode");
			folderName = "";
	}

	try
	{
		await filesystem.writeFile(__dirname + "/" + folderName + "/" + timestamp + "_results.json", JSON.stringify(allResults, null, "\t"));
	}
	catch(e)
	{
		console.error(e);
	}
}

function activityString2Url(activityString, baseUrl, endUrl, requestWords)
{
	let parameter = "";
	switch(GENERAL_CONFIG.crawlMode)
	{
		case "web":
			activityString = requestWords + activityString;
			parameter = activityString.split(" ").reduce(((total, currentWord, index) =>
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
			return baseUrl + parameter;
		case "image":
			parameter = activityString.split(" ").reduce(((total, currentWord, index) =>
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

			return baseUrl + parameter + endUrl;
		default:
			console.error("Bad crawlMode, check the generalConfig.json file");
			return ""
	}

}

async function crawl(tab)
{
	switch(GENERAL_CONFIG.crawlMode)
	{
		case "web":
			return crawlWeb(tab);
		case "image":
			return crawlImages(tab);
	}
}

async function getResultsFromActivityObj(oneActivityObj, tab)
{
	//console.log(oneActivityObj);
	await tab.goto(oneActivityObj.url, {waitUntil: "load", timeout: 3000000});

	//Get results promise of results
	const results = await crawl(tab);

	oneActivityObj.realNumberResults = results.length;
	oneActivityObj.results = results;

	return oneActivityObj;
}

function waitForProm(tab, timeToWait)
{
	return tab.waitFor(timeToWait);
}

function getPropertyFromElement(tab, element, propertyName)
{
	return tab.evaluate((element, propertyName) => element[propertyName], element, propertyName);
}

async function crawlImages(tab)
{
	//ARTIFICIAL FIX
	const maxNumberResults = GENERAL_CONFIG.wantedNumberResults + 1;
	//const maxNumberResults = GENERAL_CONFIG.wantedNumberResults;

	let results = [];

	try
	{
		let detailPanelSelector = ".detail.detail--slider.detail--images.detail--xd";

		//Find the first image and click on it
		await tab.waitForSelector(".tile.tile--img.has-detail");
		await tab.click(".tile.tile--img.has-detail");
		//console.log("Click first image");


		//Loop if we could have more results
		let niPlusNiMoins = true;
		do
		{
			//Find the detail panel and get infos from it
			let detailPanel = await tab.$(detailPanelSelector);
			//console.log("Find the detail panel and get infos from it");

			//console.log("Getting one image info...");
			let [imageComponent, linkToRelatedWebstite] = await Promise.all([
				detailPanel.$(".detail__media__img-link.js-detail-img.js-image-detail-link"),
				detailPanel.$(".detail__body.detail__body--images .c-detail__title a")
			]);

			let [titleRelatedWebsite, urlImage, urlRelatedWebsite] = await Promise.all([
				getPropertyFromElement(tab, linkToRelatedWebstite, "textContent"),
				getPropertyFromElement(tab,imageComponent, "href"),
				getPropertyFromElement(tab, linkToRelatedWebstite, "href")
			]);

			console.log("titleRelatedWebsite", titleRelatedWebsite);

			results.push(new searchResultImage(titleRelatedWebsite, urlRelatedWebsite, urlImage));
			//console.log(results);

			//Exactly the good number
			if(results.length === maxNumberResults)
			{
				niPlusNiMoins = false;
				//console.log("Finished");
			}
			//Too Much?
			else if(results.length > maxNumberResults)
			{
				results = results.slice(0, maxNumberResults);
				niPlusNiMoins = false;
				//console.log("Too much");
			}
			//Not Enought
			else
			{
				//console.log("Not enough");
				const buttonNextSelector = ".tile-nav--sm.tile-nav--sm--next.js-detail-next.can-scroll";
				const completeSelector = `${detailPanelSelector} ${buttonNextSelector}`;

				await tab.waitForSelector(completeSelector);
				await Promise.all([
					tab.evaluate(selector => document.querySelector(selector).click(), completeSelector),
					waitForProm(tab, 250)]);
				//console.log("Click to next image done");
			}
		}while(niPlusNiMoins);
	}
	catch (e)
	{
		console.error(e);
	}

	//ARTIFICIAL FIX
	return results.slice(1, maxNumberResults);
	//return results;
}

async function crawlWeb(tab)
{
	const maxNumberResults = GENERAL_CONFIG.wantedNumberResults;
	let results = [];

	try
	{
		let niPlusNiMoins = true;

		//Loop if we could have more results
		do
		{
			//Reset result tab
			results = [];

			//Get current HTML results
			await tab.waitForSelector(".result__body");
			const elems = await tab.$$(".result__body");

			//extract info to create searchResults
			for(let elem of elems)
			{
				const [titleElem, urlElem, snippetElem] = await Promise.all([
					elem.$("h2.result__title > a.result__a"),
					elem.$("h2.result__title > a.result__a"),
					elem.$(".result__snippet ")
				]);

				const [title, url, snippet] = await Promise.all([
					getPropertyFromElement(tab, titleElem, "textContent"),
					getPropertyFromElement(tab, urlElem, "href"),
					getPropertyFromElement(tab, snippetElem, "textContent")
				]);
				results.push(new searchResultWeb(title, url, snippet));
			}

			//Is it exactly the quantity I want?
			if(results.length === maxNumberResults)
			{
				niPlusNiMoins = false;
				//console.log("Perfect Finished");
			}
			//Have I too much results?
			else if(results.length > maxNumberResults)
			{
				results = results.slice(0, maxNumberResults);
				niPlusNiMoins = false;
				//console.log("Too much but Finished");
			}
			//I have not enough results
			else
			{
				//console.log("Not enough");
				const buttonSelector = ".result--more__btn";

				await tab.waitForSelector("[id^=rrd-]");
				let oldNumberOfPages = (await tab.$$("[id^=rrd-]")).length;
				//console.log("oldNumberOfPages", oldNumberOfPages);

				await Promise.all([
					tab.waitForFunction(oldNumberOfPages =>
					{
						//console.log("oldNumberOfPages", oldNumberOfPages);
						const newNumberOfPages = document.querySelectorAll("[id^=rrd-]").length;
						const endElement = document.querySelector(".result.result--sep.is-hidden.js-result-sep.result--sep--hr.has-pagenum");
						//console.log("newNumberOfPages", newNumberOfPages);
						return (newNumberOfPages > oldNumberOfPages) || (endElement !== null /*&& endElement.hasAttribute("style")*/)
					}, {}, oldNumberOfPages),
					tab.waitForSelector(buttonSelector).then(() => tab.evaluate(selector => document.querySelector(selector).click(), buttonSelector)),
					waitForProm(tab, 1000)
				]);

				//console.log("New Content Or No More Content!!");
				//console.log("Button clicked!");

				//Waiting loading
				/*let promiseIfEndLoading = tab.evaluate(() => new Promise((resolve, reject) => {
						new MutationObserver((mutationRecords, observer) =>
						{
							for(let i = 0; i < mutationRecords.length; i++)
							{
								//Searching criterias of end of loading
								mutationRecords[i].addedNodes.forEach(
									node =>
									{
										if(node.id.substr(0, 4) === "rrd-")
										{
											//console.log("Nouveau batch de résultats");
											observer.disconnect();
											//resolve();
											setTimeout(resolve, 500);
										}
									}
								);

								if(mutationRecords[i].target.className === "result result--sep is-hidden js-result-sep result--sep--hr has-pagenum")
								{
									if(mutationRecords[i].attributeName === "style")
									{
										//console.log("Fin");
										observer.disconnect();
										//resolve();
										setTimeout(resolve, 500);
									}
								}

							}
						})
						.observe(document.querySelector(".results--main"), {
							childList: true,
							attributes: true,
							subtree: true
						});
					}));
*/

				//console.log((await tab.$$("[id^=rrd-]")).length, ">", oldNumberOfPages, (await tab.$$("[id^=rrd-]")).length > oldNumberOfPages);
				if((await tab.$$("[id^=rrd-]")).length > oldNumberOfPages)
				{
					//console.log("More results available !!");
				}
				else if((await tab.$(".result.result--sep.is-hidden.js-result-sep.result--sep--hr.has-pagenum")) !== null
					&& await tab.evaluate(() => document.querySelector(".result.result--sep.is-hidden.js-result-sep.result--sep--hr.has-pagenum")
					.hasAttribute("style")))
				{
					//console.log("No more results available !!");
					niPlusNiMoins = false;
				}
			}
		} while(niPlusNiMoins);
	}
	catch (e)
	{
		console.error(e);
	}

	return results;
}

function createAndConfigureTabs(browser)
{
	return Promise.all([...Array(GENERAL_CONFIG.numberOfTabsUsed).keys()].map(() => browser.newPage()));
}

function timeConversion(ms)
{
	let seconds = (ms / 1000).toFixed(1);
	let minutes = (ms / (1000 * 60)).toFixed(1);
	let hours = (ms / (1000 * 60 * 60)).toFixed(1);
	let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);

	if (seconds < 60) {
		return seconds + " Sec";
	} else if (minutes < 60) {
		return minutes + " Min";
	} else if (hours < 24) {
		return hours + " Hrs";
	} else {
		return days + " Days"
	}
}

function showProgress(currentNumberOfActivitiesCrawled, totalNumberOfActivities, beginTime)
{
	const timeElapsed = timeConversion(new Date() - beginTime);
	console.log(`Progress ${currentNumberOfActivitiesCrawled}/${totalNumberOfActivities} (${100.0 * currentNumberOfActivitiesCrawled/totalNumberOfActivities} %) (${timeElapsed} elapsed)`);
}

//Execute the main process
(async () =>
{
	//Create browser and tabs
	const browser = await puppeteer.launch({headless: GENERAL_CONFIG.headlessMode});

	const tabs = await createAndConfigureTabs(browser);

	//Request words
	let requestWords = GENERAL_CONFIG.requestWords;

	//Init Progress variables
	let totalNumberOfActivities = activitiesString.length;
	let currentNumberOfActivitiesCrawled = 0;
	let beginTime = new Date();
	showProgress(currentNumberOfActivitiesCrawled, totalNumberOfActivities, beginTime);

	from(activitiesString)
	.pipe(map(activityString => addUrl(activityString, requestWords)))
	.pipe(bufferCount(GENERAL_CONFIG.numberOfTabsUsed))
	.pipe(concatMap( someActivityObjects =>
		{
			let tabNumber = -1;
			return from(someActivityObjects)
			.pipe(mergeMap(oneActivityObj =>
			{
				tabNumber++;
				return getResultsFromActivityObj(oneActivityObj, tabs[tabNumber])
			}))
				.pipe(tap(oneActivityObj =>
				{
					currentNumberOfActivitiesCrawled++;
					showProgress(currentNumberOfActivitiesCrawled, totalNumberOfActivities, beginTime);
				}));
		}
	))
	//.pipe(mergeAll())
	.pipe(toArray())
	.subscribe(async activityObjTab =>
	{
		await createFileOfResults(activityObjTab);
		await browser.close();
	});
})();