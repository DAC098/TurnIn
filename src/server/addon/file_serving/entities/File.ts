import typeorm from "typeorm";

@typeorm.Entity()
export class File {

	@typeorm.PrimaryGeneratedColumn()
	id: number;
	
	@typeorm.Column("varchar")
	name: string;

	@typeorm.Column({
		type: "bool",
		default: true
	})
	accessable: boolean;
}
