import router from "../../router";

import server_router from "./router";
import "./close";

router.addMount({
	path: "/server"
},server_router);