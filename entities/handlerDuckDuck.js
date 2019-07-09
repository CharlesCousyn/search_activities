import searchResultWeb from "./searchResultWeb"
import searchResultImage from "./searchResultImage"
import handlerSearchEngine from "../entities/handlerSearchEngine"

export default class handlerSearchDuckDuck extends handlerSearchEngine
{
	constructor()
	{
		super();
		this.baseUrl = "https://duckduckgo.com/?q=";
		this.endUrlImage = "&iar=images&ia=images&iax=images";
	}

	static domToResultsWeb(mapClassNameCode, maxNumberResults) {
		return new Promise(
			async resolve => {
				//Get the classes to be known by browser
				mapClassNameCode.forEach(tab =>{eval("window." + tab[0] + " = " + tab[1]);});

				let niPlusNiMoins = true;

				//Loop if we could have more results
				do {
					let results = [];
					document.querySelectorAll(".result__body")
					.forEach(elem =>
					{
						let title = elem.querySelector("h2.result__title > a.result__a").textContent;
						let url = elem.querySelector("h2.result__title > a.result__a").href;
						let snippet = elem.querySelector(".result__snippet ").textContent;
						results.push(new searchResultWeb(title, url, snippet));
					});

					//Is it exactly the quantity I want?
					if(results.length === maxNumberResults)
					{
						niPlusNiMoins = false;
						resolve(results);
					}
					//Have I too much results?
					else if(results.length > maxNumberResults)
					{
						results = results.slice(0, maxNumberResults);
						niPlusNiMoins = false;
						resolve(results);
					}
					//I have not enough results
					else
					{
						let button = document.querySelector(".result--more__btn");

						//If button exists, we click
						if(button !== null)
						{
							let promiseResolveIfEndOfLoading = new Promise((resolve, reject) =>
							{
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
							});

							//Click to have more results available
							button.click();

							//Waiting loading
							await promiseResolveIfEndOfLoading;
						}
						else
						{
							//If here no more results available
							//console.log("No more results available !!");
							niPlusNiMoins = false;
							resolve(results);
						}
					}
				} while(niPlusNiMoins);
			}
		);
	}

	static domToResultsImage(mapClassNameCode, maxNumberResults)
	{
		return new Promise(async resolve =>
		{
			//Get the classes to be known by browser
			mapClassNameCode.forEach(tab =>{eval("window." + tab[0] + " = " + tab[1]);});

			let results = [];

			//Find the first image and click on it
			document.querySelector(".tile.tile--img.has-detail").click();

			//Find the detail panel and get infos from it
			let detailPanel = document.querySelector(".detail.detail--slider.detail--images.detail--xd");

			//Loop if we could have more results
			let niPlusNiMoins = true;
			while(niPlusNiMoins)
			{
				let imageComponent = detailPanel.querySelector(".detail__media__img-link.js-detail-img.js-image-detail-link");
				let linkToRelatedWebstite = detailPanel.querySelector(".detail__body.detail__body--images .c-detail__title a");

				let titleRelatedWebsite = linkToRelatedWebstite.textContent;
				let urlImage = imageComponent.href;
				let urlRelatedWebsite = linkToRelatedWebstite.href;

				results.push(new searchResultImage(titleRelatedWebsite, urlRelatedWebsite, urlImage));

				//Exactly the good number
				if(results.length === maxNumberResults)
				{
					niPlusNiMoins = false;
				}
				//Too Much?
				else if(results.length > maxNumberResults)
				{
					results = results.slice(0, maxNumberResults);
					niPlusNiMoins = false;
				}
				//Not Enought
				else
				{

					await new Promise(resolve =>
					{
						setTimeout(() =>
						{
							detailPanel.querySelector(".tile-nav--sm.tile-nav--sm--next.js-detail-next.can-scroll").click();
							resolve();
						}, 250);
					});
				}

			}

			resolve(results);
		});
	}
}

