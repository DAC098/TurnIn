import {default as AJV} from "ajv";

const AJVInstance = new AJV({allErrors: true});

export default AJVInstance;