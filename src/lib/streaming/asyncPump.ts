import {default as pump} from "pump"

const asyncPump = (...args: (NodeJS.ReadableStream | NodeJS.WritableStream | pump.Callback)[]): Promise<void> => {
	return new Promise((resolve,reject) => {
		pump(...args,err => {
			if(err)
				reject(err);
			else
				resolve();
		});
	});
};

export default asyncPump;