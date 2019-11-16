import {default as server_router} from "app/server/router";

import router from "./router";

import "./root_routes";
import "./id_middleware";
import "./assignment_routes";
import "./enrollment_routes";

server_router.addMount({
	path: "/sections"
}, router);