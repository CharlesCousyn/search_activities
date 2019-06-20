import searchResult from "../entities/searchResult"
import handlerSearchEngine from "../entities/handlerSearchEngine"

export default class handlerSearchDuckDuck extends handlerSearchEngine
{
	constructor()
	{
		super();
	}

	static domToResults(mapClassNameCode, maxNumberResults)
	{
		//Get the classes to be known by browser
		mapClassNameCode.forEach(tab =>{eval("window." + tab[0] + " = " + tab[1]);});

		//Click x times function of number of results available

		//let test = this.test();
		let observer = this.createObserver();

		//Loop if not enough results
		let passageCount = 0;
		let enoughResults = false;
		while(!enoughResults)
		{
			//Construct the results with the DOM
			let nodeList = document.querySelectorAll(".result__body");
			//Loop and Stop crawling if we have enough results
			let i = 0;
			while(i < maxNumberResults && i < nodeList.length)
			{
				let title = nodeList[i].querySelector("h2.result__title > a.result__a").textContent;
				let url = nodeList[i].querySelector("h2.result__title > a.result__a").href;
				let snippet = nodeList[i] .querySelector(".result__snippet ").textContent;

				console.log("this.results: "+handlerSearchDuckDuck.results);
				handlerSearchDuckDuck.results.push(new searchResult(title, url, snippet));

				i++;
			}

			//Click if not enough result
			if(handlerSearchDuckDuck.results.length < maxNumberResults)
			{
				observer.observe(document.querySelector(".results"), {childList: true});

				passageCount++;
				document.querySelector(".result--more__btn").click();
				handlerSearchDuckDuck.results = [];
			}
			else
			{
				enoughResults = true;
			}
		}

		//Finished observation
		observer.disconnect();


		//Show Results infos
		console.log("Results Crawled: " + handlerSearchDuckDuck.results.length);
		handlerSearchDuckDuck.results.forEach(elem =>
		{
			console.log(elem.toString());
		});
		console.log("Nombre de clicks: " + passageCount);

		return handlerSearchDuckDuck.results;
	}

	static domToResults2(mapClassNameCode, maxNumberResults)
	{
		console.log("Appel domToResults2");
		//Get the classes to be known by browser
		mapClassNameCode.forEach(tab =>{eval("window." + tab[0] + " = " + tab[1]);});

		//Click x times function of number of results available

		//Loop if not enough results
		//Construct the results with the DOM
		handlerSearchDuckDuck.results = [];
		document.querySelectorAll(".result__body")
		.forEach(elem =>
		{
			let title = elem.querySelector("h2.result__title > a.result__a").textContent;
			let url = elem.querySelector("h2.result__title > a.result__a").href;
			let snippet = elem.querySelector(".result__snippet ").textContent;
			//console.log("this.results: "+handlerSearchDuckDuck.results);
			handlerSearchDuckDuck.results.push(new searchResult(title, url, snippet));
		});

		//Is it exactly the quantity I want?
		if(handlerSearchDuckDuck.results.length === maxNumberResults)
		{
			console.log("Coucou 1");

			//Show Results infos
			console.log("Results Crawled: " + handlerSearchDuckDuck.results.length);
			handlerSearchDuckDuck.results.forEach(elem =>{console.log(elem.toString());});

			return handlerSearchDuckDuck.results;
		}
		//Have I too much results?
		else if(handlerSearchDuckDuck.results.length > maxNumberResults)
		{
			console.log("Coucou 2");
			handlerSearchDuckDuck.results = handlerSearchDuckDuck.results.slice(0, maxNumberResults);

			//Show Results infos
			console.log("Results Crawled: " + handlerSearchDuckDuck.results.length);
			handlerSearchDuckDuck.results.forEach(elem =>{console.log(elem.toString());});

			return handlerSearchDuckDuck.results;
		}
		//I have not enough results
		else
		{
			console.log("Coucou 3");
			//Create the observer
			let observer = new MutationObserver(mutationsList =>
				{
					console.log("Coucou callback 0");
					try
					{
						window.handlerSearchDuckDuck.domToResults2(mapClassNameCode, maxNumberResults);
						console.log("No error");
					}
					catch(error)
					{
						console.log(error)
					}

				}
			);

			//Launch the observer
			observer.observe(document.querySelector(".results"), {childList: true});

			//If button exists, we click
			let button = document.querySelector(".result--more__btn");
			if(button !== undefined)
			{
				button.click();
			}
			else
			{
				//If here no more results available
				console.log("No more results available !!");
			}
		}



		//observer.disconnect();

/*
		//Show Results infos
		console.log("Coucou NOOOO");
		console.log("Results Crawled: " + handlerSearchDuckDuck.results.length);
		handlerSearchDuckDuck.results.forEach(elem =>
		{
			console.log(elem.toString());
		});

		return handlerSearchDuckDuck.results;*/
	}

	static domToResults3(mapClassNameCode, maxNumberResults, passageCount, results)
	{
		console.log("Appel domToResults3");
		//Get the classes to be known by browser
		if(passageCount === 0)
		{
			mapClassNameCode.forEach(tab =>{eval("window." + tab[0] + " = " + tab[1]);});
		}

		//Click x times function of number of results available

		//Loop if not enough results
		//Construct the results with the DOM
		results = [];
		document.querySelectorAll(".result__body")
		.forEach(elem =>
		{
			let title = elem.querySelector("h2.result__title > a.result__a").textContent;
			let url = elem.querySelector("h2.result__title > a.result__a").href;
			let snippet = elem.querySelector(".result__snippet ").textContent;
			//console.log("this.results: "+handlerSearchDuckDuck.results);
			results.push(new searchResult(title, url, snippet));
		});

		//Is it exactly the quantity I want?
		try {
			//console.log("results.length > maxNumberResults: " + results.length +">"+ maxNumberResults);
			console.log("Coucou  0");
			console.log();

			//console.log("maxNumberResults: " + maxNumberResults);
			//console.log("results.length: " +  results.length);
		}
		catch(error)
		{
			console.error(error)
		}
		if(results.length === maxNumberResults)
		{
			console.log("Coucou 1");

			//Show Results infos
			console.log("Results Crawled: " + results.length);
			results.forEach(elem =>{console.log(elem.toString());});

			return results;
		}
		//Have I too much results?
		else if(results.length > maxNumberResults)
		{
			console.log("Coucou 2");
			//console.log("Results Crawled: " + results.length);
			console.log("Coucou 2.1");
			results = results.slice(0, maxNumberResults);
			console.log("Coucou 2.2");
			//console.log("Results Crawled: " + results.length);
			console.log("Coucou 2.3");

			//Show Results infos
			//console.log("Results Crawled: " + results.length);
			console.log("Coucou 2.4");
			//results.forEach(elem =>{console.log(elem.toString());});
			console.log("Coucou 2.5");

			return results;
		}
		//I have not enough results
		else
		{
			console.log("Coucou 3");


			//If button exists, we click
			let button = document.querySelector(".result--more__btn");
			if(button !== undefined)
			{
				button.click();

				setTimeout(handlerSearchDuckDuck.domToResults3, 2000, mapClassNameCode, maxNumberResults, passageCount + 1, results);
				//handlerSearchDuckDuck.domToResults3(mapClassNameCode, maxNumberResults);
			}
			else
			{
				//If here no more results available
				console.log("No more results available !!");
				return results;
			}
		}



		//observer.disconnect();

		/*
				//Show Results infos
				console.log("Coucou NOOOO");
				console.log("Results Crawled: " + results.length);
				results.forEach(elem =>
				{
					console.log(elem.toString());
				});

				return results;*/
	}

	static domToResults4(mapClassNameCode, maxNumberResults) {
		return new Promise(
			resolve => {
				//Get the classes to be known by browser
				mapClassNameCode.forEach(tab =>{eval("window." + tab[0] + " = " + tab[1]);});

				let idSetInterval = setInterval(
					() =>
					{
						let results = [];
						document.querySelectorAll(".result__body")
						.forEach(elem =>
						{
							let title = elem.querySelector("h2.result__title > a.result__a").textContent;
							let url = elem.querySelector("h2.result__title > a.result__a").href;
							let snippet = elem.querySelector(".result__snippet ").textContent;
							results.push(new searchResult(title, url, snippet));
						});

						//Is it exactly the quantity I want?
						if(results.length === maxNumberResults)
						{
							clearInterval(idSetInterval);
							resolve(results);
						}
						//Have I too much results?
						else if(results.length > maxNumberResults)
						{
							results =results.slice(0, maxNumberResults);
							clearInterval(idSetInterval);
							resolve(results);
						}
						//I have not enough results
						else
						{
							//If button exists, we click
							let button = document.querySelector(".result--more__btn");
							if(button !== null)
							{
								button.click();
							}
							else
							{
								//If here no more results available
								console.log("No more results available !!");
								clearInterval(idSetInterval);
								resolve(results);
							}
						}
					},
					2000,
				);
			}
		);
	}
}