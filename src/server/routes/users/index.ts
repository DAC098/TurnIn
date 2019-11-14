import typeorm from "typeorm";

import {default as server_router} from "app/server/router";
import {User} from "app/entities/User"

import router from "./router";
import sendJSON from "app/lib/servers/response/json";
import parseJSON from "app/lib/parsing/http/json";
import { genSalt, genHash } from "app/lib/security";

router.addRoute({
	path: "/:id",
	no_final: true,
	options: {
		end: false
	}
}, async ([stream,headers,flags,data], route_data) => {
	let user_repo = typeorm.getRepository(User);
	let user_results = await user_repo.find({
		where: [
			{id: route_data.params["id"]}
		]
	});

	if (user_results.length === 0) {
		sendJSON(stream,404,{message:"user not found"});

		return false;
	}

	data["user"] = user_results[0];
});

router.addRoute({
	path: "/:id",
	methods: "get"
}, async ([stream,headers,flags,data], route_data) => {
	let user = <User>data["user"];

	sendJSON(stream,200,{data: {
		username: user.username,
		email: user.email,
		fname: user.fname,
		lname: user.lname,
		id: user.id
	}});
});

router.addRoute({
	path: "/:id",
	methods: "put"
}, async ([stream,headers,flags,data], route_data) => {
	let user_repo = typeorm.getRepository(User);
	let user = <User>data["user"];
	let body = await parseJSON(stream);

	try {
		sendJSON(stream,200,{message:"updated user"});
	}
	catch(err) {
		sendJSON(stream,500,{message:"error when updating user"});
	}
});

router.addRoute({
	path:"/:id",
	methods: "delete"
}, async ([stream,headers,flags,data], route_data) => {
	let user_repo = typeorm.getRepository(User);
	let user = <User>data["user"];

	try {
		await user_repo.delete(user);

		sendJSON(stream,200,{message:"deleted user"});
	}
	catch(err) {
		sendJSON(stream,500,{message:"error when deleting user"});
	}
});

router.addRoute({
	path: "/",
	methods: "get"
}, async ([stream,headers,flags,data],route_data) => {
	let user_repo = typeorm.getRepository(User);
	let user_results = await user_repo.find({
		select: ["id","username","email","fname","lname"]
	});

	sendJSON(stream,200,{data: user_results});
});

interface NewUserJSON {
	username: string,
	password: string,
	email: string,
	fname: string,
	lname: string
}

router.addRoute({
	path: "/",
	methods: "post"
}, async ([stream,headers,flags,data],route_data) => {
	let user_repo = typeorm.getRepository(User);
	let user = new User();
	let body = await parseJSON<NewUserJSON>(stream);

	if (body.email != null) {
		let email_check = await user_repo.find({email: body.email});

		if (email_check.length > 0) {
			sendJSON(stream,400,{message: "email already in use"});

			return;
		}

		user.email = body.email;
	}

	if (body.username == null || body.password == null) {
		sendJSON(stream,400,{message: "username and password must be given"});

		return;
	}
	
	let salt = genSalt();
	let password = genHash(body.password, salt);

	user.username = body.username;
	user.password = password;
	user.salt = salt;

	if (body.fname != null) {
		user.fname = body.fname;
	}

	if (body.lname != null) {
		user.lname = body.lname;
	}
	
	try {
		await user_repo.save(user);

		sendJSON(stream,200,{message:"okay"});
	}
	catch(err) {
		sendJSON(stream,500,{message:err.message});
	}
});

server_router.addMount({
	path: "/users"
},router);