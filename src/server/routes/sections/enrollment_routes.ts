import typeorm from "typeorm";
import ajv from "ajv";

import router from "./router";
import { User, Section } from "app/entities";
import sendJSON from "app/lib/servers/response/json";
import parseJSON from "app/lib/parsing/http/json";
import AJVInstance from "app/server/json_validator";

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

interface UpdateEnrollmentsJSON {
	users: number[]
}

const update_enrollment_schema = {
	type: "object",
	properties: {
		users: {
			type: "array",
			items: {
				type: "number"
			}
		},
		op: {
			type: "string",
			default: "add"
		}
	}
};

const updateEnrollmentsV = AJVInstance.compile(update_enrollment_schema);

router.addRoute({
	path: enrollments_path,
	methods: "put"
}, async ([stream,headers,flags,data], route_data) => {
	let user_repo = typeorm.getRepository(User);
	let section = <Section>data["section"];
	let body = await parseJSON<UpdateEnrollmentsJSON>(stream);
	let valid = updateEnrollmentsV(body);

	if (!valid) {
		sendJSON(stream,400,{
			message: "submitted json is invalid",
			error: AJVInstance.errorsText(updateEnrollmentsV.errors)
		});

		return;
	}
	
	let user_results = await user_repo.find({
		id: typeorm.In(body.users)
	});

	if (user_results.length !== body.users.length) {
		sendJSON(stream,400,{
			message: "some user ids were not found"
		});
	}


})