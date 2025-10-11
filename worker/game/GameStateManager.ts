import { GamePhase, RoleConfig, GameState } from "@shared/types/game";
import { validateRoleConfig } from "@shared/utils/validation";

export class GameStateManager {
  private state: GameState;

  constructor() {
    this.state = {
      phase: "waiting",
      roleConfig: { villager: 0, werewolf: 0 },
      mode: "standard",
    };
  }

  getPhase(): GamePhase {
    return this.state.phase;
  }

  setPhase(phase: GamePhase): void {
    this.state.phase = phase;
  }

  getRoleConfig(): RoleConfig {
    return { ...this.state.roleConfig };
  }

  updateRoleConfig(config: RoleConfig): void {
    this.state.roleConfig = config;
  }

  canStartGame(participantCount: number): boolean {
    return validateRoleConfig(this.state.roleConfig, participantCount);
  }

  getState(): GameState {
    return { ...this.state };
  }
}
