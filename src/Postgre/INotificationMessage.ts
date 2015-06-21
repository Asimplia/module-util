
export = INotificationMessage;
interface INotificationMessage {
	channel: string;
	length: number;
	processId: number;
	payload: string;
}
