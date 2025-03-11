export type BattleStatus = 
  | "ready" 
  | "player-turn" 
  | "bot-turn" 
  | "player-won" 
  | "bot-won" 
  | "draw";

export interface BattleState {
  turn: number;
  status: BattleStatus;
  playerHP: number;
  playerMaxHP: number;
  botHP: number;
  botMaxHP: number;
  lastAction?: string;
  battleLog: string[];
  animating: boolean;
}