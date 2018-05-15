const db = require('modules/psql');
const log = require('modules/log');
const setup = require('modules/setup');

const createUser = require('modules/psql/helpers/users/createUser');
const createImage = require('modules/psql/helpers/images/createImage');

let users = [
	[
		{'type': 'master'},
		{
			"username": "test_user",
			"password": "test_user",
			"email": "test_user@example.com",
			"fname": "test2",
			"lname": "bot",
			"permissions": {}
		}
	],
	[
		{'type': 'master'},
		{
			"username": "student_one",
			"password": "student_one",
			"fname": "student",
			"lname": "bot_one",
			"is_student": true
		}
	],
	[
		{'type': 'master'},
		{
			"username": "student_two",
			"password": "student_two",
			"is_student": true
		}
	],
	[
		{'type': 'master'},
		{
			"username": "teacher_one",
			"password": "teacher_one",
			"email": "teacher_one@example.com",
			"is_teacher": true
		}
	],
	[
		{'type': 'master'},
		{
			"username": "teacher_two",
			"password": "teacher_two",
			"email": "teacher_two@example.com",
			"is_teacher": true,
			"fname": "teacher",
			"lname": "bot_two"
		}
	]
];

let sections = new Map([
	[
		'CSCI 311',
		{
			"title": "CSCI 311",
			"num": 8398,
			"year": 2018,
			"semester": "fall",
			"teacher_id": "(select id from users where username = 'teacher_two')"
		}
	],
	[
		'CINS 465',
		{
			"title": "CINS 465",
			"num": 5216,
			"year": 2018,
			"semester": "spring",
			"teacher_id": "(select id from users where username = 'teacher_one')"
		}
	],
	[
		'CSCI 211',
		{
			"title": "CSCI 211",
			"num": 6354,
			"year": 2017,
			"semester": "summer",
			"teacher_id": "(select id from users where username = 'teacher_two')"
		}
	],
	[
		'CSCI 111',
		{
			"title": "CSCI 111",
			"num": 3524,
			"year": 2017,
			"semester": "winter",
			"teacher_id": "(select id from users where username = 'teacher_one')"
		}
	]
]);

let images = new Map([
	[
		async (con) => {
			let res = await con.query(`select * from users where username = 'teacher_two'`);

			return {
				"id": res.rows.length === 1 ? res.rows[0]['id'] : 0
			};
		},
		{
			"image_name": "node:9.10.0",
			"image_type": "hub"
		}
	],
	[
		async (con) => {
			let res = await con.query(`select * from users where username = 'teacher_two'`);

			return {
				"id": res.rows.length === 1 ? res.rows[0]['id'] : 0
			};
		},
		{
			"image_name": "ubuntu:16.04",
			"image_type": "hub"
		}
	],
	[
		async (con) => {
			let res = await con.query(`select * from users where username = 'teacher_two'`);

			return {
				"id": res.rows.length === 1 ? res.rows[0]['id'] : 0
			}
		},
		{
			"image_name": "postgres:10.1",
			"image_type": "hub"
		}
	],
	[
		async (con) => {
			let res = await con.query(`select * from users where username = 'teacher_one'`);

			return {
				"id": res.rows.length === 1 ? res.rows[0]['id'] : 0
			};
		},
		{
			"image_name": "node:8.11.1",
			"image_type": "hub"
		}
	],
	[
		async (con) => {
			let res = await con.query(`select * from users where username = 'teacher_one'`);

			return {
				"id": res.rows.length === 1 ? res.rows[0]['id'] : 0
			};
		},
		{
			"image_name": "redis:latest",
			"image_type": "hub",
		}
	],
	[
		async (con) => {
			let res = await con.query(`select * from users where username = 'teacher_one'`);

			return {
				"id": res.rows.length === 1 ? res.rows[0]['id'] : 0
			};
		},
		{
			"image_name": "node:6.14.1",
			"image_type": "hub",
		}
	]
]);


let assignments = new Map([
	[
		'first assignment',
		{
			"title": "first assignment",
			"section_id": "(select id from sections where title = 'CSCI 111')",
			"description": "the first assignment of the class",
			"points": 100,
			"options": {}
		}
	],
	[
		'second_assignment',
		{
			"title": "second assignment",
			"section_id": "(select id from sections where title = 'CSCI 111')",
			"description": "the second assignment of the class",
			"points": 100,
			"options": {}
		}
	],
	[
		'third assignment',
		{
			"title": "third assignment",
			"section_id": "(select id from sections where title = 'CSCI 111')",
			"description": "the third assignment of the class",
			"points": 100,
			"options": {
				"exec": [
					"ls -val",
					"pwd",
					"cd /",
					"ls -val",
					"cd ~",
					"ls -val",
					"cd /app"
				],
				"extract": [
					"/etc"
				]
			}
		}
	],
	[
		'fourth assignment',
		{
			"title": "fourth assignment",
			"section_id": "(select id from sections where title = 'CSCI 111')",
			"description": "the fourth assignment of the class",
			"points": 100,
			"options": {}
		}
	]
]);

let assignment_images = [
	{
		"image_id": "(select id from images where image_name = 'node:9.10.0')",
		"assignment_id": "(select assignments.id as id from assignments join sections on assignments.section_id = sections.id where assignments.title = 'first assignment' and sections.title = 'CSCI 111')"
	},
	{
		"image_id": "(select id from images where image_name = 'node:9.10.0')",
		"assignment_id": "(select assignments.id as id from assignments join sections on assignments.section_id = sections.id where assignments.title = 'second assignment' and sections.title = 'CSCI 111')"
	},
	{
		"image_id": "(select id from images where image_name = 'node:9.10.0')",
		"assignment_id": "(select assignments.id as id from assignments join sections on assignments.section_id = sections.id where assignments.title = 'third assignment' and sections.title = 'CSCI 111')"
	}
];

let submissions = new Map([
	{
		"users_id": "(select id from users where username = 'student_one')",
		"assignment_id": "(select assignments.id as id from assignments join sections on assignments.section_id = sections.id where assignments.title = 'third assignment' and sections.title = 'CSCI 111')",
		"image_id": "(select id from images where image_name = 'node:9.10.0')"
	},
	{
		"users_id": "(select id from users where username = 'student_one')",
		"assignment_id": "(select assignments.id as id from assignments join sections on assignments.section_id = sections.id where assignments.title = 'third assignment' and sections.title = 'CSCI 111')",
		"image_id": "(select id from images where image_name = 'node:9.10.0')"
	},
	{
		"users_id": "(select id from users where username = 'student_one')",
		"assignment_id": "(select assignments.id as id from assignments join sections on assignments.section_id = sections.id where assignments.title = 'third assignment' and sections.title = 'CSCI 111')",
		"image_id": "(select id from images where image_name = 'node:9.10.0')"
	}
]);

const getArguments = async (data,con) => {
	let args = [];

	for(let a of data) {
		if(typeof a === 'function') {
			let rtn = a(con);

			if(typeof rtn.then === 'function') {
				args.push(await rtn);
			} else {
				args.push(rtn);
			}
		} else {
			args.push(a);
		}
	}

	return [...args,con];
};

const createUsers = async (con) => {
	for(let data of users) {
		let args = await getArguments(data,con);

		let result = await createUser(...args);

		if(!result.success && result.reason !== 'username already used') {
			log.warn(`failed to create user: ${result.reason}`);
		}
	}
};

const createSections = async (con) => {

};

const createImages = async (con) => {
	for(let data of images) {
		let args = await getArguments(data,con);

		let result = await createImage(...args);

		if(!result.success && result.reason !== 'image name already used') {
			log.warn(`failed to create image: ${result.reason}`);
		}
	}
};

const createAssignments = async (con) => {

};

const createAssignmentImages = async (con) => {

};

const createSubmissions = async (con) => {

};

let run_ops = false;

const run = async () => {
	if(run_ops)
		return;

	let con = null;
	let run_list = [
		createUsers,
		createSections,
		createImages,
		createAssignments,
		createAssignmentImages,
		createSubmissions
	];

	try {
		con = await db.connect();
	} catch(err) {
		log.error(`connecting to database for test data: ${err.stack}`);
	}

	if(con === null) {
		log.warn('no database connection');
		return;
	}

	for(let fn of run_list) {
		try {
			await con.beginTrans();

			await fn(con);

			await con.commitTrans();
		} catch(err) {
			await con.rollbackTrans();

			log.error(`running test data method: ${err.stack}`);
		}
	}

	con.release();

	run_ops = true;
};

module.exports = run;