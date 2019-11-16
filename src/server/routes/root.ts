import router from "../router";

const setup_obj = {};
const manifest = {};

const head_string = `
<title>TurnIn</title>
<meta name="description" content="TurnIn Server">
<meta name="author" content="David A Cathers">
<meta name="keywords" content="TDS,David Cathers,David C,dac098,o98dac">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
<link rel="icon" type="image/ico" href="/assets/images/favicon.ico">
<link href="/assets/stylesheets/main_style.css" rel="stylesheet">
<script type="application/javascript">
	window.__SERVER_SETUP__ = ${JSON.stringify(setup_obj)};
	window.__ASSET_MANIFEST__ = ${JSON.stringify(manifest)};
</script>
<script type="application/javascript">
const sendRequest = (method,path,body = {}) => {
	let headers = {};
	let add_body = false;

	if (method === "post" || method === "put") {
		headers["content-type"] = "application/json"
		add_body = true;
	}

	let options = {
		method: method.toUpperCase(),
		headers
	};

	if (add_body) {
		options["body"] = JSON.stringify(body);
	}

	return fetch(path, options);
}

const srh = (res) => {
	if (res.headers.get("content-type").includes("application/json"))
		return res.json();
	else
		return res.text();
}
</script>
<script type="application/javascript" src="/assets/scripts/runtime.js"></script>
`;

const getAppHTML = () => `
<!DOCTYPE html> 
<html lang="en">
	<head>
	${head_string}
	<script type="application/javascript" src="/assets/scripts/vendor.js"></script>
	${'common.js' in manifest ? '<script type="application/javascript" src="/assets/scripts/common.js"></script>' : ''}
	<script type="application/javascript" src="/assets/scripts/app.js"></script>
	</head>
	<body>
		<div id="ren-tar"></div>
		<div id="modal-container"></div>
		<div id="snack-bar-container"></div>
	</body>
</html>
`;

const getLoginHTML = () => `
<!DOCTYPE html> 
<html lang="en">
	<head>
	${head_string}
	<script type="application/javascript" src="/assets/scripts/vendor.js"></script>
	${'common.js' in manifest ? '<script type="application/javascript" src="/assets/scripts/common.js"></script>' : ''}
	<script type="application/javascript" src="/assets/scripts/login.js"></script>
	</head>
	<body>
		<div id="ren-tar"></div>
		<div id="modal-container"></div>
		<div id="snack-bar-container"></div>
	</body>
</html>
`;

router.addRoute({
	path: "/login",
	methods: "get"
}, ([stream,headers,flags,data], route_data) => {
	if (headers["accept"] && headers["accept"].includes("text/html")) {
		stream.respond({
			":status": 200,
			"content-type": "text/html"
		});

		stream.end(getLoginHTML());
	}
	else {
		stream.respond({
			":status": 400,
			"content-type": "text/plain"
		});

		stream.end("bad request");
	}
})

router.addRoute({
	path: "/",
	methods: "get",
	no_final: true,
	options: {
		end: false
	}
}, ([stream,headers,flags,data], route_data) => {
	if (headers["accept"] && headers["accept"].includes("text/html")) {
		stream.respond({
			":status": 200,
			"content-type": "text/html"
		});

		stream.end(getAppHTML());

		return false;
	}
});