class Req {
	constructor() {
		this.username = '';
		this.password = '';
	}

	/**
	 *
	 * @param {string} username
	 * @param {string} password
	 */
	setUser(username,password) {
		this.username = username;
		this.password = password;
	}

	/**
	 *
	 * @param path
	 * @returns {string}
	 */
	getURI(path) {
		return encodeURI(`${window.location.origin}${path}`);
	}

	/**
	 *
	 * @param {boolean} with_body
	 * @returns {Headers}
	 */
	getHeader(with_body = false) {
		let head = new Headers();

		head.append('accept','application/json');
		head.append('authorization',`Basic ${btoa(this.username + ':' + this.password)}`);

		if(with_body)
			head.append('content-type','application/json');

		return head;
	}

	/**
	 *
	 * @param path
	 * @returns {Promise<Response>}
	 */
	get(path){
		return fetch(this.getURI(path),{
			method: 'GET',
			headers: this.getHeader()
		});
	}

	/**
	 *
	 * @param path
	 * @param data
	 * @returns {Promise<Response>}
	 */
	post(path,data = {}) {
		let uri = this.getURI(path);
		let obj = {
			method: 'POST',
			headers: this.getHeader(data !== null)
		};

		if(data)
			obj['body'] = JSON.stringify(data);

		return fetch(uri,obj);
	}

	/**
	 *
	 * @param path
	 * @param data
	 * @returns {Promise<Response>}
	 */
	put(path,data = {}) {
		let uri = this.getURI(path);
		let obj = {
			method: 'PUT',
			headers: this.getHeader(true)
		};

		if(data)
			obj['body'] = JSON.stringify(data);

		return fetch(uri,obj);
	}

	/**
	 *
	 * @param path
	 * @param data
	 * @returns {Promise<Response>}
	 */
	del(path,data = {}) {
		let uri = this.getURI(path);
		let obj = {
			method: 'DELETE',
			headers: this.getHeader(data !== null)
		};

		if(data)
			obj['body'] = JSON.stringify(data);

		return fetch(uri,obj);
	}
}

const req = new Req();

req.setUser('master','password');

export default req;

window.req = req;