export default class handlerSearchEngine
{
	constructor()
	{
		if (this.constructor === handlerSearchEngine)
		{
			throw new TypeError('Abstract class "handlerSearchEngine" cannot be instantiated directly');
		}
	}

	static domToResults(mapClassNameCode, maxNumberResults)
	{
		throw new Error('You must implement this function');
	}
}