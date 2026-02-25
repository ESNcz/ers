import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({
	removeAdditional: "all",
	coerceTypes: true,
	useDefaults: true,
});

addFormats(ajv);

export { ajv };
