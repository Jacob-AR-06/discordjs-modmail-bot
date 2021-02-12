import { Schema, model, Document } from "mongoose";

interface iTicket extends Document {
	messageId?: string;
	channelId?: string;
	claimerId?: string;
	userId: string;
	status: "open" | "closed" | "unclaimed";
}

const reqString = { required: true, type: String };
export default model<iTicket>(
	"ticket",
	new Schema({
		messageId: reqString,
		channelId: reqString,
		claimerId: reqString,
		userId: reqString,
		status: reqString,
	})
);
