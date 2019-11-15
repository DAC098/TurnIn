import typeorm from "typeorm";
import { Submission } from "./Submission";

@typeorm.Entity({
	name: "submitted_files"
})
export class SubmissionFile {

	@typeorm.PrimaryColumn()
	filename: string;

	@typeorm.ManyToOne("Submission","id",{
		primary: true,
		nullable: false
	})
	@typeorm.JoinColumn()
	submission: Submission
	
}