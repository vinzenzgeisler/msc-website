export interface VotingStatus { available: boolean; opensAt?: string; closesAt?: string }
export interface VotingService { getStatus(eventId: string): Promise<VotingStatus> }
export const unavailableVotingService: VotingService = { async getStatus() { return { available: false }; } };
