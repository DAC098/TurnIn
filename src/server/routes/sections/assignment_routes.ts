import typeorm from "typeorm";

import router from "./router";
import { Assignment } from "app/entities";
import sendJSON from "app/lib/servers/response/json";

router.addRoute({
	path: "/:id([0-9]+)/assignments",
	methods: "get"
}, async ([stream,headers,flags,data], route_data) => {
	let assignment_repo = typeorm.getRepository(Assignment);
	let assignment_results = await assignment_repo.find({
		relations: ["files"],
		where: [
			{id: route_data.params["id"]}
		]
	});

	sendJSON(stream,200,{data: assignment_results})
});