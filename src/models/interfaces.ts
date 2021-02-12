export interface iTicket {
	messageId?: string;
	channelId?: string;
	claimerId?: string;
	userId: string;
	status: "open" | "closed" | "unclaimed";
}
