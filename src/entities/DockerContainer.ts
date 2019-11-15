import typeorm from "typeorm";
import { User } from "./User";

@typeorm.Entity({
	name: "docker_containers"
})
@typeorm.Unique("unique_docker_id_user",["owner","docker_id"])
export class DockerContainer {

	@typeorm.PrimaryGeneratedColumn()
	id: number;

	@typeorm.ManyToOne("User","id",{
		nullable: false
	})
	@typeorm.JoinColumn()
	owner: User;

	@typeorm.Column()
	name: string;

	@typeorm.Column()
	docker_id: string;

}