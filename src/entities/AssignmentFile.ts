import typeorm from "typeorm";
import { Assignment } from "./Assignment";

@typeorm.Entity({
	name: "assignment_files"
})
export class AssignmentFile {

	@typeorm.PrimaryColumn()
	filename: string;

	@typeorm.ManyToOne("Assignment","id",{
		nullable: false,
		primary: true
	})
	@typeorm.JoinColumn()
	assignment: Assignment
	
}