import { EventEmitter } from 'events';

import {default as _} from "lodash"

type foundCallback = (keys: string[], index: number, obj: any) => any;
type notFoundCallback = (keys: string[], index: number, obj: any) => any;

function traverseObjectRecursive(
	key_list: string[], 
	index: number,
	obj: any, 
	found: foundCallback, 
	notFound: notFoundCallback
	) 
{
	if (index === key_list.length - 1) {
		if (key_list[index] in obj) {
			return found(key_list, index, obj);
		}
		else {
			return notFound(key_list, index, obj);
		}
	}

	if (key_list[index] in obj) {
		return traverseObjectRecursive(
			key_list, 
			index + 1, 
			obj[key_list[index]],
			found,
			notFound
		);
	}
	else {
		return notFound(key_list, index, obj);
	}
}

function traverseObject(
	key_list: string[],
	obj: any,
	found: foundCallback,
	notFound: notFoundCallback
)
{
	if (key_list.length <= 1) {
		if (key_list.length === 0) {
			throw new TypeError("key list has no length");
		}
		else {
			if (key_list[0] in obj) {
				return found(key_list, 0, obj);
			}
			else {
				return notFound(key_list, 0, obj);
			}
		}
	}
	else {
		return traverseObjectRecursive(
			key_list,
			0,
			obj,
			found,
			notFound
		);
	}
}

export type KeyPath = string | string[];

declare interface Setup<DefaultObject> extends EventEmitter {}

class Setup<DefaultObject> extends EventEmitter {

	private data: DefaultObject;

	constructor(default_data: DefaultObject) {
		super();

		this.data = _.cloneDeep(default_data);
	}

	private getPath(key_str: KeyPath) {
		let is_string = typeof key_str === "string";

		if (is_string || Array.isArray(key_str)) {
			return is_string ? (<string>key_str).split(".") : <string[]>key_str;
		}
		else {
			throw new TypeError("key_str must be a string or an array of strings");
		}
	}
	
	public setKey(key_str: KeyPath, value: any): boolean {
		let rtn = traverseObject(
			this.getPath(key_str),
			this.data,
			(keys, index, obj) => {
				obj[keys[index]] = value;
				return true;
			},
			(keys, index, obj) => {
				return false;
			}
		);

		return rtn;
	}
	
	public setObj(key_str: KeyPath , value: object): void {
		traverseObject(
			this.getPath(key_str),
			this.data,
			(keys, index, obj) => {
				obj[keys[index]] = value;
			},
			(keys, index, obj) => {
				obj[keys[index]] = value;
			}
		);
	}

	public hasKey(key_str: KeyPath): boolean {
		return traverseObject(
			this.getPath(key_str),
			this.data,
			(keys, index, obj) => {
				return true;
			},
			(keys, index, obj) => {
				return false;
			}
		);
	}
	
	public getKey(key_str: KeyPath): any {
		return traverseObject(
			this.getPath(key_str),
			this.data,
			(keys, index, obj) => {
				return _.cloneDeep(obj[keys[index]]);
			},
			(keys, index, obj) => {
				return null;
			}
		);
	}
	
	public get(): DefaultObject {
		return _.cloneDeep(this.data);
	}
}

export default Setup;