import { default as setup_init } from "./setup/init";
//const db_init = require('./psql/init');
let setup_run = false;
const startup = async () => {
    if (setup_run)
        return true;
    await setup_init();
    // finished = await db_init();
    // if(!finished)
    // 	return false;
    setup_run = true;
};
export default startup;
//# sourceMappingURL=startup.js.map