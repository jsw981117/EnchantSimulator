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
        this.shopWeapons = [];
        this.autoAttackEnabled = false;
        this.autoAttackIntervalId = null;
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
                ui.showToast(`${this.equippedWeapon.getName()}이(가) 파괴되었습니다!`, 'error');
                this.equippedWeapon = null;
                ui.updateEquippedWeapon();
                // 자동 공격 중이었다면 재시작
                if (this.autoAttackEnabled) {
                    this.stopAutoAttack();
                    ui.updateAutoAttackButton();
                }
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

        // 상점 등장 확률 체크
        if (Math.random() < CONFIG.shop.appearChance) {
            this.openShop();
        } else {
            // 다음 몹 생성
            this.spawnMob();
        }
    }

    // 인벤토리에 무기 추가
    addToInventory(weapon) {
        this.inventory.push(weapon);
    }

    // 무기 장착
    equipWeapon(weapon) {
        this.equippedWeapon = weapon;
        ui.updateEquippedWeapon();
        // 자동 공격 중이면 간격 업데이트
        if (this.autoAttackEnabled) {
            this.updateAutoAttackInterval();
        }
    }

    // 무기 장착 해제
    unequipWeapon() {
        this.equippedWeapon = null;
        ui.updateEquippedWeapon();
        // 자동 공격 중지
        if (this.autoAttackEnabled) {
            this.stopAutoAttack();
            ui.updateAutoAttackButton();
        }
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

    // 무기 강화
    enhanceWeapon(weapon, stoneCount) {
        const cost = weapon.getEnhanceCost();

        // 골드 확인
        if (this.gold < cost) {
            return { success: false, message: '골드가 부족합니다!' };
        }

        // 강화석 확인
        if (this.enhanceStones < stoneCount) {
            return { success: false, message: '강화석이 부족합니다!' };
        }

        // 골드 및 강화석 소비
        this.useGold(cost);
        this.useEnhanceStone(stoneCount);

        // 성공 확률 계산
        const successRate = weapon.getEnhanceSuccessRate(stoneCount);
        const isSuccess = Math.random() < successRate;

        if (isSuccess) {
            // 강화 성공
            weapon.enhanceSuccess();
            ui.updateEquippedWeapon();
            // 장착 중인 무기를 강화했다면 자동 공격 간격 업데이트
            if (this.equippedWeapon === weapon && this.autoAttackEnabled) {
                this.updateAutoAttackInterval();
            }
            return {
                success: true,
                isEnhanceSuccess: true,
                message: `강화 성공! ${weapon.getName()}이(가) 되었습니다!`,
                weapon: weapon
            };
        } else {
            // 강화 실패
            weapon.reduceDurability(CONFIG.enhance.durabilityDecrease);

            // 파괴 체크
            if (weapon.isDestroyed()) {
                // 무기 파괴
                const index = this.inventory.indexOf(weapon);
                if (index !== -1) {
                    this.inventory.splice(index, 1);
                }
                if (this.equippedWeapon === weapon) {
                    this.equippedWeapon = null;
                    // 자동 공격 중지
                    if (this.autoAttackEnabled) {
                        this.stopAutoAttack();
                        ui.updateAutoAttackButton();
                    }
                }
                ui.updateEquippedWeapon();

                return {
                    success: true,
                    isEnhanceSuccess: false,
                    isDestroyed: true,
                    message: `강화 실패! ${weapon.getName()}이(가) 파괴되었습니다...`,
                    weapon: null
                };
            } else {
                // 파괴되지 않음
                ui.updateEquippedWeapon();
                return {
                    success: true,
                    isEnhanceSuccess: false,
                    isDestroyed: false,
                    message: `강화 실패! 내구도가 ${CONFIG.enhance.durabilityDecrease} 감소했습니다.`,
                    weapon: weapon
                };
            }
        }
    }

    // 상점 무기 생성
    generateShopWeapons() {
        this.shopWeapons = [];
        for (let i = 0; i < CONFIG.shop.itemSlots; i++) {
            const randomEnhanceLevel = Math.floor(Math.random() * 6); // 0~5 강화 수치
            const weapon = new Weapon(randomEnhanceLevel);
            this.shopWeapons.push(weapon);
        }
    }

    // 상점 열기
    openShop() {
        this.generateShopWeapons();
        ui.openShopModal();
    }

    // 무기 구매
    buyWeapon(weapon) {
        const cost = weapon.getBuyPrice();

        // 골드 확인
        if (this.gold < cost) {
            return { success: false, message: '골드가 부족합니다!' };
        }

        // 골드 소비
        this.useGold(cost);

        // 인벤토리에 추가
        this.addToInventory(weapon);

        // 상점 목록에서 제거
        const index = this.shopWeapons.indexOf(weapon);
        if (index !== -1) {
            this.shopWeapons.splice(index, 1);
        }

        return { success: true, message: `${weapon.getName()}을(를) 구매했습니다!` };
    }

    // 상점 닫기
    closeShop() {
        this.shopWeapons = [];
        this.spawnMob();
    }

    // 게임 시작
    start() {
        // 기본 무기 생성 및 자동 장착
        const starterWeapon = new Weapon(0);
        this.addToInventory(starterWeapon);
        this.equipWeapon(starterWeapon);

        this.spawnMob();
        ui.updateResources();
        ui.updateStage();
    }

    // 자동 공격 토글
    toggleAutoAttack() {
        if (this.autoAttackEnabled) {
            this.stopAutoAttack();
        } else {
            this.startAutoAttack();
        }
        ui.updateAutoAttackButton();
    }

    // 자동 공격 시작
    startAutoAttack() {
        if (!this.equippedWeapon) {
            ui.showToast('무기를 장착해주세요!', 'warning');
            return;
        }

        this.autoAttackEnabled = true;
        this.updateAutoAttackInterval();
    }

    // 자동 공격 중지
    stopAutoAttack() {
        this.autoAttackEnabled = false;
        if (this.autoAttackIntervalId) {
            clearInterval(this.autoAttackIntervalId);
            this.autoAttackIntervalId = null;
        }
    }

    // 자동 공격 간격 업데이트 (무기 변경 시 호출)
    updateAutoAttackInterval() {
        if (!this.autoAttackEnabled || !this.equippedWeapon) return;

        // 기존 인터벌 제거
        if (this.autoAttackIntervalId) {
            clearInterval(this.autoAttackIntervalId);
        }

        // 새 인터벌 설정
        const interval = this.equippedWeapon.getAttackInterval();
        this.autoAttackIntervalId = setInterval(() => {
            this.attackMob();
        }, interval);
    }
}
