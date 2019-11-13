export enum Semesters {
	SPRING = "spring",
	SUMMER = "summer",
	FALL = "fall",
	WINTER = "winter"
}

export interface ISection {

	id: number;

	title: string;

	num: number;

	year: number;

	semester: Semesters;
	
}