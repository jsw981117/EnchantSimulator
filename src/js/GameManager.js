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

        // 무기 내구도 감소 확률
        if (this.equippedWeapon && Math.random() < CONFIG.weapon.attackDurabilityChance) {
            this.equippedWeapon.reduceDurability(1);

            // 무기 파괴 체크
            if (this.equippedWeapon.isDestroyed()) {
                alert(`${this.equippedWeapon.getName()}이(가) 파괴되었습니다!`);
                this.equippedWeapon = null;
                ui.updateEquippedWeapon();
            }
        }

        ui.updateMob();
        ui.updateEquippedWeapon();

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

        // 무기 드랍 확률
        if (Math.random() < CONFIG.drop.weaponChance) {
            const randomEnhanceLevel = Math.floor(Math.random() * 3); // 0~2 강화 수치
            const weapon = new Weapon(randomEnhanceLevel);
            this.addToInventory(weapon);
            console.log(`${weapon.getName()} 획득!`);
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

    // 인벤토리에 무기 추가
    addToInventory(weapon) {
        this.inventory.push(weapon);
    }

    // 무기 장착
    equipWeapon(weapon) {
        this.equippedWeapon = weapon;
        ui.updateEquippedWeapon();
    }

    // 무기 장착 해제
    unequipWeapon() {
        this.equippedWeapon = null;
        ui.updateEquippedWeapon();
    }

    // 무기 판매
    sellWeapon(weapon) {
        const index = this.inventory.indexOf(weapon);
        if (index === -1) return false;

        // 장착된 무기인 경우 장착 해제
        if (this.equippedWeapon === weapon) {
            this.unequipWeapon();
        }

        // 인벤토리에서 제거
        this.inventory.splice(index, 1);

        // 골드 획득
        this.addGold(weapon.getSellPrice());

        return true;
    }

    // 게임 시작
    start() {
        this.spawnMob();
        ui.updateResources();
        ui.updateStage();
    }
}
