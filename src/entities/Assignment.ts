import typeorm from "typeorm";
import { Section } from "./Section";
import { AssignmentFile } from "./AssignmentFile";
import { DockerImage } from "./DockerImage";

@typeorm.Entity({
	name: "assignments"
})
@typeorm.Unique("unique_title_section",["title","section"])
export class Assignment {

	@typeorm.PrimaryGeneratedColumn()
	id: number;

	@typeorm.Column({
		nullable: false
	})
	title: string;
	
	@typeorm.ManyToOne("Section","id",{
		nullable: false,
	})
	@typeorm.JoinColumn()
	section: Section;

	@typeorm.Column()
	description: string;

	@typeorm.Column({
		default: 0
	})
	points: number;

	@typeorm.Column({
		type: "timestamptz",
		default: () => "CURRENT_TIMESTAMP"
	})
	open_date: number;

	@typeorm.Column({
		type: "timestamptz",
		default: null,
		nullable: true
	})
	close_date: number;
	
	@typeorm.Column({
		type: "json",
		nullable: true
	})
	options: {}

	@typeorm.Column({
		default: false
	})
	allow_custom_images: boolean;

	@typeorm.OneToMany("AssignmentFile","assignment")
	files: AssignmentFile[];

	@typeorm.ManyToMany("DockerImage","assignments")
	@typeorm.JoinTable({
		name: "assignments_to_images"
	})
	docker_images: DockerImage[];

}