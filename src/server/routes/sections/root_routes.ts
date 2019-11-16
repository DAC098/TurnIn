import typeorm from "typeorm";

import router from "./router";
import { Section, User, Semesters } from "app/entities";
import sendJSON from "app/lib/servers/response/json";
import parseJSON from "app/lib/parsing/http/json";

router.addRoute({
	path: "/",
	methods: "get"
}, async ([stream,headers,flags,data], route_data) => {
	let section_repo = typeorm.getRepository(Section);
	let sections_result = await section_repo.find({
		relations: ["enrolled"]
	});

	sendJSON(stream,200,{data: sections_result});
});

interface NewSectionJSON {
	title: string,
	num: number,
	year: number,
	semester: string,
	teacher_id: number
}

router.addRoute({
	path: "/",
	methods: "post"
}, async ([stream,headers,flags,data], route_data) => {
	let section_repo = typeorm.getRepository(Section);
	let user_repo = typeorm.getRepository(User);
	let section = new Section();
	let body = await parseJSON<NewSectionJSON>(stream);

	if (typeof body.teacher_id === "number") {
		let user_result = await user_repo.findOne({id: body.teacher_id});

		if (user_result) {
			section.teacher = user_result;
		}
		else {
			sendJSON(stream, 200, {
				message:"failed to find the requested teacher",
				teacher_id: body.teacher_id
			});

			return;
		}
	}

	if (typeof body.num !== "number" || 
		typeof body.year !== "number" ||
		typeof body.title !== "string" ||
		typeof body.semester !== "string"
	) {
		sendJSON(stream,200,{
			message: "num, year, semester, and title are required for a section"
		});

		return;
	}

	section.title = body.title;
	section.num = body.num;
	section.year = body.year;
	section.semester = <Semesters>body.semester.toLowerCase()
	
	try {
		await section_repo.save(section);

		sendJSON(stream,200,{message:"okay",data: section});
	}
	catch(err) {
		sendJSON(stream,500,{
			message: err.message
		});
	}
});