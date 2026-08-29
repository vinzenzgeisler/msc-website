export interface EventParticipant { id: string; name: string; vehicle: string; className: string; imageUrl?: string }
export interface DriverRepository { list(eventId: string): Promise<EventParticipant[]> }
export const unavailableDriverRepository: DriverRepository = { async list() { return []; } };
