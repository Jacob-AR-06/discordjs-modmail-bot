import { Schema, model, Document } from "mongoose";

interface iBlacklist extends Document {
	userId: string;
}

const reqString = { required: true, type: String };
export default model<iBlacklist>(
	"blacklist",
	new Schema({
		userId: reqString,
	})
);
