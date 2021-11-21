import TurndownService from 'turndown';

const turndownService = new TurndownService();

export function htmlToMarkdown(htmlInput: string): string {
	try {
		const markdown = turndownService.turndown(htmlInput);
		return markdown;
	}
	catch(e) {
		throw new Error(e);
	}
}