// 게임 상태 관리
class GameManager {
    constructor() {
        this.gold = CONFIG.player.startGold;
        this.enhanceStones = CONFIG.player.startStones;
        this.stage = 1;
        this.mobKillCount = 0;
        this.currentMob = null;
        this.equippedWeapon = null;
        this.inventory = [];
    }

    // 골드 획득
    addGold(amount) {
        this.gold += amount;
        ui.updateResources();
    }

    // 골드 사용
    useGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            ui.updateResources();
            return true;
        }
        return false;
    }

    // 강화석 획득
    addEnhanceStone(amount = 1) {
        this.enhanceStones += amount;
        ui.updateResources();
    }

    // 강화석 사용
    useEnhanceStone(amount) {
        if (this.enhanceStones >= amount) {
            this.enhanceStones -= amount;
            ui.updateResources();
            return true;
        }
        return false;
    }

    // 현재 공격력 계산
    getAttackPower() {
        if (this.equippedWeapon) {
            return this.equippedWeapon.attack;
        }
        return CONFIG.player.baseAttack;
    }

    // 몹 생성
    spawnMob() {
        const isBoss = (this.mobKillCount % CONFIG.mob.mobsPerStage === CONFIG.mob.mobsPerStage - 1);
        this.currentMob = new Mob(this.stage, isBoss);
        ui.updateMob();
    }

    // 몹 공격
    attackMob() {
        if (!this.currentMob) return;

        const damage = this.getAttackPower();
        this.currentMob.takeDamage(damage);

        ui.updateMob();

        // 몹 처치
        if (this.currentMob.isDead()) {
            this.onMobKilled();
        }
    }

    // 몹 처치 시
    onMobKilled() {
        // 골드 드랍
        this.addGold(CONFIG.mob.goldDrop);

        // 강화석 드랍 확률
        if (Math.random() < CONFIG.drop.enhanceStoneChance) {
            this.addEnhanceStone(1);
        }

        this.mobKillCount++;

        // 보스였으면 스테이지 증가
        if (this.currentMob.isBoss) {
            this.stage++;
            ui.updateStage();
        }

        // 다음 몹 생성
        this.spawnMob();
    }

    // 게임 시작
    start() {
        this.spawnMob();
        ui.updateResources();
        ui.updateStage();
    }
}
