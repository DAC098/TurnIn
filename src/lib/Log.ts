import {default as chalk} from 'chalk';
import moment from 'moment';
import _ from 'lodash';

interface LogOptions {
	enabled?: boolean,
	exclude_methods?: Set<string>,
	check_parent?: boolean,
	show_time?: boolean
}

const default_options: LogOptions = {
	enabled        : true,
	exclude_methods: new Set(),
	check_parent   : true,
	show_time      : true
};

export default class Log {

	private has_name: boolean;
	private enabled_levels: {
		info:boolean,
		debug:boolean,
		warn:boolean,
		perf:boolean,
		error:boolean
	};
	private name: string;
	private name_list: string[];
	private options: LogOptions;
	private enabled: boolean;
	private strings: {
		debug: string,
		info: string,
		warn: string,
		perf: string,
		error: string
	};
	private id: string;
	private children: {[index: string]: Log};
	private parent: Log | null;

	constructor(id:string = '', name:string|string[] = '', options:LogOptions = {}) {
		let p = Log.parseName(id,name);

		options = _.merge({},default_options, options);

		this.has_name = p.has_name;
		this.name_list = p.name_list;
		this.name = p.name;

		this.options = options;
		this.enabled = options.enabled;
		this.strings = {
			debug: chalk.enabled ? chalk.blue('DEBUG:') : 'DEBUG:',
			info : chalk.enabled ? chalk.green('INFO:') : 'INFO:',
			warn : chalk.enabled ? chalk.yellow('WARN:') : 'WARN:',
			perf : chalk.enabled ? chalk.cyan('PERF:') : 'PERF:',
			error: chalk.enabled ? chalk.red('ERROR:') : 'ERROR:'
		};
		this.enabled_levels = {
			info : true,
			debug: true,
			warn : true,
			perf : true,
			error: true
		};
		this.id = id;
		this.children = {};
		this.parent = null;

		for(let k in this.enabled_levels) {
			if(options.exclude_methods.has(k))
				this.enabled_levels[k] = false;
		}
	}

	static parseName(id: string, name: string|string[]) {
		let rtn = {
			has_name : false,
			name_list: [],
			name     : ''
		};

		if (name.length === 0) {
			name = id;
		}

		if(typeof name[Symbol.iterator] === 'function' && typeof name !== 'string') {
			let t_name = [];
			let list   = [];

			for(let n of name) {
				if(typeof n === 'string' && n.length !== 0) {
					list.push(n);
					t_name.push(`[${n}]`);
				}
			}

			rtn.has_name  = t_name.length !== 0;
			rtn.name_list = list;
			rtn.name      = t_name.join(' ');
		} else {
			rtn.has_name  = typeof name === 'string' && name.length !== 0;
			rtn.name_list = rtn.has_name ? [name] : [];
			rtn.name      = `[${name}]`;
		}

		return rtn;
	}

	static createChild(parent: Log, id:string, name: string|string[] = '', options:LogOptions = {}) {
		let p      = Log.parseName(id, name);
		let t_name = [];

		if(parent.has_name)
			t_name = t_name.concat(parent.name_list, p.name_list);

		let l               = new Log(id, t_name, options);
		l.parent            = parent;
		parent.children[id] = l;

		return l;
	}

	isEnabled(method: string) {
		return this.enabled && this.enabled_levels[method] && (this.options.check_parent
		       && this.parent ? this.parent.enabled : true);
	}

	extend(id:string, name: string = '', options?: LogOptions) {
		if(id in this.children)
			return this.children[id];

		return Log.createChild(this, id, name, options);
	}

	extendChild(path: string, id: string, name: string = '', options?: LogOptions) {
		let parent: Log = this;
		let dot_path = path.split('.');

		for(let p of dot_path) {
			if(p in parent.children) {
				parent = parent.children[p];
			} else {
				Log.createChild(parent, p, name);
				parent = parent.children[p];
			}
		}

		return Log.createChild(parent, id, name, options);
	}

	getPrefix() {
		return `${this.options.show_time ? `{${moment().toISOString()}} ` : ''}${this.has_name ? `${this.name}` : ':'}`;
	}

	setName(name: string|string[]) {
		let p = Log.parseName(this.id, name);

		this.has_name = p.has_name;
		this.name_list = p.name_list;
		this.name = p.name;
	}

	info(...args: any[]) {
		if(!this.isEnabled('info'))
			return;

		args.unshift(this.getPrefix(), this.strings.info);
		console.log(...args);
	}

	warn(...args: any[]) {
		if(!this.isEnabled('warn'))
			return;

		args.unshift(this.getPrefix(), this.strings.warn);
		console.warn(...args);
	}

	perf(...args: any[]) {
		if(!this.isEnabled('perf'))
			return;

		args.unshift(this.getPrefix(), this.strings.perf);
		console.log(...args);
	}

	error(...args: any[]) {
		if(!this.isEnabled('error'))
			return;

		args.unshift(this.getPrefix(), this.strings.error);
		console.error(...args);
	}

	debug(...args: any[]) {
		if(!this.isEnabled('debug'))
			return;

		args.unshift(this.getPrefix(), this.strings.debug);
		console.log(...args);
	}
}