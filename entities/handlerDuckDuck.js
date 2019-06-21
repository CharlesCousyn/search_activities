import searchResult from "../entities/searchResult"
import handlerSearchEngine from "../entities/handlerSearchEngine"

export default class handlerSearchDuckDuck extends handlerSearchEngine
{
	constructor()
	{
		super();
		this.baseUrl = "https://duckduckgo.com/?q=";
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

