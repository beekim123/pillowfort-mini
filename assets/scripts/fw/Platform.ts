/** P1 平台边界：全部外部能力关闭。玩法不得假设存在微信 API。 */
export type PlatformCapability = 'shareChat' | 'shareTimeline' | 'saveImage' | 'friendRank' | 'rewardedAd';
export interface UnavailableResult {
  available: false;
  reason: 'not-enabled-in-p1';
}
export interface ShareRequest { title: string; imagePath?: string }
export interface RankEntry { key: string; value: number }
const unavailable = (): UnavailableResult => ({ available: false, reason: 'not-enabled-in-p1' });
export class Platform {
  readonly capabilities: Readonly<Record<PlatformCapability, boolean>> = Object.freeze({
    shareChat: false, shareTimeline: false, saveImage: false, friendRank: false, rewardedAd: false,
  });
  has(capability: PlatformCapability): boolean { return this.capabilities[capability]; }
  async shareChat(_request?: ShareRequest): Promise<UnavailableResult> { return unavailable(); }
  async shareTimeline(_request?: ShareRequest): Promise<UnavailableResult> { return unavailable(); }
  async saveImage(_imagePath?: string): Promise<UnavailableResult> { return unavailable(); }
  async friendRank(_entries?: RankEntry[]): Promise<UnavailableResult> { return unavailable(); }
  async rewardedAd(): Promise<UnavailableResult> { return unavailable(); }
}
export const platform = new Platform();
