import typeorm from "typeorm"
import { Semesters, ISection } from "./interfaces/ISection";
import { IUser } from "./interfaces/IUser";
import { IEnrollment } from "./interfaces/IEnrolled";

export {Semesters} from "./interfaces/ISection";

@typeorm.Entity({
	name: "sections"
})
export class Section implements ISection {

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

	@typeorm.OneToOne("User","id")
	@typeorm.JoinColumn()
	teacher: IUser;
	
	@typeorm.OneToMany("Enrollment","section")
	enrollment: IEnrollment;
}