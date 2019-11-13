import typeorm from "typeorm"
import { IEnrollment } from "./interfaces/IEnrolled";
import { IUser } from "./interfaces/IUser";
import { ISection } from "./interfaces/ISection";

@typeorm.Entity({
	name: "enrollments"
})
@typeorm.Unique("unique_enrollments",["user_id","section_id"])
export class Enrollment implements IEnrollment {

	@typeorm.PrimaryGeneratedColumn()
	id: number;

	@typeorm.Column()
	user_id: number

	@typeorm.Column()
	section_id: number;

	@typeorm.ManyToOne("User","enrollment")
	@typeorm.JoinColumn({
		name: "user_id"
	})
	user: IUser;

	@typeorm.ManyToOne("Section","enrollment")
	@typeorm.JoinColumn({
		name: "section_id"
	})
	section: ISection;
	
}