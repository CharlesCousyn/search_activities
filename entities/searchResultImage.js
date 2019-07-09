export default class searchResultImage
{
	constructor (titleRelatedPage, urlRelatedPage, urlImage)
	{
		if(arguments.length === 1)
		{
			this.titleRelatedPage = titleRelatedPage.titleRelatedPage;
			this.urlRelatedPage = titleRelatedPage.urlRelatedPage;
			this.urlImage = titleRelatedPage.urlImage;
		}
		else
		{
			this.titleRelatedPage = titleRelatedPage;
			this.urlRelatedPage = urlRelatedPage;
			this.urlImage = urlImage;
		}
	}

	toString()
	{
		return "Title Related Page: " + this.titleRelatedPage + "\nUrl Related Image: " + this.urlImage + "\nUrl Image: " + this.urlImage;
	}

	toJSON()
	{
		return{
			"titleRelatedPage": this.titleRelatedPage,
			"urlRelatedPage": this.urlRelatedPage,
			"urlImage": this.urlImage
		};
	}
}