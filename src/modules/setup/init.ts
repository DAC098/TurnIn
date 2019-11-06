import setup, {loadEtc,processCliArgs,checkDirectories} from "./index";

let initialized = false;

const init = async (): Promise<void> => {
	if(initialized)
		return;

	await loadEtc(setup);

	await processCliArgs(setup);

	//await checkDirectories(setup);

	initialized = true;
};

export default init;