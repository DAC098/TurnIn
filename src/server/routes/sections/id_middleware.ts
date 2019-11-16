import typeorm from "typeorm";

import router from "./router";
import { Section } from "app/entities";
import sendJSON from "app/lib/servers/response/json";
import logger from "app/server/logger";

router.addRoute({
	path: "/:id([0-9]+)",
	no_final: true,
	options: {
		end: false
	}
}, async ([stream,headers,flags,data], route_data) => {
	let section_repo = typeorm.getRepository(Section);
	let section_result = await section_repo.findOne({
		where: [
			{id: route_data.params["id"]}
		]
	});

	if (section_result == null) {
		sendJSON(stream,404,{message: "section not found"});

		return false;
	}

	data["section"] = section_result;
});