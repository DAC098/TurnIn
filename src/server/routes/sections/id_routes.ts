import typeorm from "typeorm";

import router from "./router";
import { Section, User, Assignment } from "app/entities";
import sendJSON from "app/lib/servers/response/json";
import parseJSON from "app/lib/parsing/http/json";

const id_path = "/:id([0-9]+)";

router.addRoute({
	path: id_path,
	methods: "get"
}, async ([stream,headers,flags,data],route_data) => {
	let section = <Section>data["section"];
	let connection = typeorm.getConnection();

	section.enrolled = await connection.createQueryBuilder()
		.relation(Section,"enrolled")
		.of(section)
		.loadMany();
	section.assignments = await connection.createQueryBuilder()
		.relation(Section,"assignments")
		.of(section)
		.loadMany();
	section.teacher = await connection.createQueryBuilder()
		.relation(Section,"teacher")
		.of(section)
		.loadOne();
	section.graders = await connection.createQueryBuilder()
		.relation(Section,"graders")
		.of(section)
		.loadMany();

	sendJSON(stream,200,{data:section});
});

interface UpdateSectionJSON {}

router.addRoute({
	path: id_path,
	methods: "put"
}, async ([stream,headers,flags,data], route_data) => {
	let section_repo = typeorm.getRepository(Section);
	let section = <Section>data["section"];
	let body = parseJSON<UpdateSectionJSON>(stream);

	sendJSON(stream,200,{message: "updated section"});
});

router.addRoute({
	path: id_path,
	methods: "delete"
}, async ([stream,headers,flags,data],route_data) => {
	let section_repo = typeorm.getRepository(Section);
	let section = <Section>data["section"];

	await section_repo.delete(section);

	sendJSON(stream,200,{message: "deleted section"});
});