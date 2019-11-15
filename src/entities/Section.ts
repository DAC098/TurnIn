import typeorm from "typeorm"

import { Assignment } from "./Assignment";
import { User } from "./User";

enum Semesters {
	SPRING,
	SUMMER,
	WINTER,
	FALL
}

@typeorm.Entity({
	name: "sections"
})
export class Section {

	@typeorm.PrimaryGeneratedColumn()
	id: number;

	@typeorm.Column({
		type: "varchar",
		nullable: false
	})
	title: string;

	@typeorm.Column({
		type: "int",
		nullable: false
	})
	num: number;

	@typeorm.Column({
		type: "int",
		nullable: false
	})
	year: number;

	@typeorm.Column({
		type: "enum",
		enum: Semesters,
		nullable: false
	})
	semester: Semesters;

	@typeorm.ManyToOne("User","id")
	@typeorm.JoinColumn()
	teacher: User;
	
	@typeorm.ManyToMany("User","id")
	@typeorm.JoinTable({
		name: "enrollments"
	})
	enrolled: User[];

	@typeorm.OneToMany("Assignment","section")
	assignments: Assignment[];
}