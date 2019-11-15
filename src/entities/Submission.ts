import typeorm from "typeorm";
import { User } from "./User";
import { Assignment } from "./Assignment";
import { DockerImage } from "./DockerImage";
import { SubmissionFile } from "./SubmissionFile";

@typeorm.Entity({
	name: "submissions"
})
export class Submission {

	@typeorm.PrimaryGeneratedColumn()
	id: number;

	@typeorm.ManyToOne("User","id",{
		nullable: false
	})
	@typeorm.JoinColumn()
	user: User;
	
	@typeorm.ManyToOne("Assignment","id",{
		nullable: false
	})
	@typeorm.JoinColumn()
	assignment: Assignment;

	@typeorm.ManyToOne("DockerImage","id")
	@typeorm.JoinColumn()
	image: DockerImage;

	@typeorm.Column({
		type: "timestamptz",
		default: () => "CURRENT_TIMESTAMP"
	})
	sub_date: number;

	@typeorm.Column({
		type: "json",
		nullable: true
	})
	options: {}
	
	@typeorm.Column({
		nullable: true
	})
	comment: string;
	
	@typeorm.Column({
		nullable: true
	})
	grader_comment: string;

	@typeorm.Column({
		default: 0
	})
	points: number;
	
	@typeorm.OneToMany("SubmissionFile","section")
	files: SubmissionFile[];
	
}