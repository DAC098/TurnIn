import typeorm from "typeorm"
import { IEnrollment } from "./interfaces/IEnrolled";
import { IUser } from "./interfaces/IUser";

@typeorm.Entity({
	name: "users"
})
export class User implements IUser {

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
		unique: true
	})
	email: string;
	
	@typeorm.Column()
	fname: string;

	@typeorm.Column()
	lname: string;

	@typeorm.OneToMany("Enrollment","user")
	enrollment: IEnrollment;
}