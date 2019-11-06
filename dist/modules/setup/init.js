import setup, { loadEtc, processCliArgs } from "./index";
let initialized = false;
const init = async () => {
    if (initialized)
        return;
    await loadEtc(setup);
    await processCliArgs(setup);
    //await checkDirectories(setup);
    initialized = true;
};
export default init;
//# sourceMappingURL=init.js.map