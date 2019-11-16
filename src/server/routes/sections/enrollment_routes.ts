import typeorm from "typeorm";

import router from "./router";
import { User, Section } from "app/entities";
import sendJSON from "app/lib/servers/response/json";

const enrollments_path = "/:id([0-9]+)/enrollments";

router.addRoute({
	path: enrollments_path,
	methods: "get"
}, async ([stream,headers,flags,data],route_data) => {
	let section = <Section>data["section"];

	section.enrolled = await typeorm.getConnection()
		.createQueryBuilder()
		.relation(User,"enrolled")
		.of(section)
		.loadMany();

	sendJSON(stream,200,{data: section.enrolled});
});