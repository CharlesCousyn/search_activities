export default class searchResultWeb
{
    constructor (title, url, snippet)
    {
        if(arguments.length === 1)
        {
            this.title = title.title;
            this.url = title.url;
            this.snippet = title.snippet;
        }
        else
        {
            this.title = title;
            this.url = url;
            this.snippet = snippet;
        }
    }

    toString()
    {
        return "Title: " + this.title + "\nUrl: " + this.url +"\nSnippet: " + this.snippet;
    }

    toJSON()
    {
        return{
            "title": this.title,
            "url": this.url,
            "snippet": this.snippet
        };
    }
}