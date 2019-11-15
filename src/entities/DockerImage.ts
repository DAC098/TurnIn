import typeorm from "typeorm";
import { User } from "./User";
import { Submission } from "./Submission";
import { Assignment } from "./Assignment";

export enum DockerImageType {
	CUSTOM = "custom",
	HUB = "hub",
	REMOTE = "remote"
}

export enum DockerImageStatus {
	CREATED = "created",
	READY = "ready",
	RUNNING = "running",
	REMOVED = "removed",
	ERROR = "error"
}

@typeorm.Entity({
	name: "docker_images"
})
export class DockerImage {

	@typeorm.PrimaryGeneratedColumn()
	id: number;

	@typeorm.ManyToOne("User","id",{
		nullable: false
	})
	@typeorm.JoinColumn()
	owner: User;

	@typeorm.Column()
	name: string;
	
	@typeorm.Column({
		unique: true,
		nullable: true
	})
	docker_id: string;
	
	@typeorm.Column({
		type: "json"
	})
	options: {};

	@typeorm.Column({
		type: "enum",
		enum: DockerImageType,
		nullable: false
	})
	type: DockerImageType;

	@typeorm.Column({
		type: "enum",
		enum: DockerImageStatus,
		nullable: false
	})
	status: DockerImageStatus;

	@typeorm.Column({
		default: false
	})
	exists: boolean;

	@typeorm.Column({
		default: false
	})
	dockerfile: boolean;

	@typeorm.Column({
		nullable: true
	})
	url: string;
	
	@typeorm.OneToMany("Submission","image")
	submissions: Submission[];

	@typeorm.ManyToMany("Assignment","id")
	assignments: Assignment[];
}