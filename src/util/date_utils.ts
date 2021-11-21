function addDays(date: Date, days: number): Date {
	date.setDate(date.getDate() + days);
	return date;
}

export function getDates(startDate: Date, stopDate: Date): any {
	var dateArray = new Array();
	var currentDate = startDate;
	while (currentDate <= stopDate) {
		dateArray.push(new Date (currentDate));
		currentDate = addDays(currentDate, 1);
	}
	return dateArray;
}