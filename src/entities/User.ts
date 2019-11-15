import typeorm from "typeorm"

import { Submission } from "./Submission";
import { DockerImage } from "./DockerImage";
import { Section } from "./Section";

@typeorm.Entity({
	name: "users"
})
export class User {

	@typeorm.PrimaryGeneratedColumn()
	id: number;

	@typeorm.Column({
		type: "varchar",
		nullable: false
	})
	username: string;

	@typeorm.Column({
		type: "varchar",
		nullable: false
	})
	password: string;

	@typeorm.Column({
		type: "varchar",
		nullable: false,
	})
	salt: string;

	@typeorm.Column({
		type: "varchar",
		unique: true,
		nullable: true
	})
	email: string;
	
	@typeorm.Column({
		nullable: true
	})
	fname: string;

	@typeorm.Column({
		nullable: true
	})
	lname: string;

	@typeorm.ManyToMany("Section","id")
	enrolled: Section[];

	@typeorm.OneToMany("Submission","id")
	submissions: Submission[];

	@typeorm.OneToMany("DockerImage","id")
	docker_images: DockerImage[];

	@typeorm.OneToMany("Section","id")
	teaching: Section[];
}