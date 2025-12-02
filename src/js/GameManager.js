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

        // 빙결 스킬이 있으면 자동 공격 간격 업데이트
        if (this.autoAttackEnabled && this.currentMob.skill === 'frozen') {
            this.updateAutoAttackInterval();
        }
    }

    // 몹 공격
    attackMob() {
        if (!this.currentMob) return;

        let damage = this.getAttackPower();

        // 속성 대미지 배율 적용
        if (this.equippedWeapon && this.equippedWeapon.element) {
            const elementMultiplier = this.currentMob.getElementDamageMultiplier(this.equippedWeapon.element);
            damage = Math.floor(damage * elementMultiplier);
        }

        this.currentMob.takeDamage(damage);

        // 황금상 스킬: 공격 시 골드 획득
        if (this.currentMob.skill === 'golden') {
            const baseGold = CONFIG.mobSkills.golden.minGold +
                Math.random() * (CONFIG.mobSkills.golden.maxGold - CONFIG.mobSkills.golden.minGold);
            const stageBonus = Math.pow(CONFIG.mobSkills.golden.stageMultiplier, this.stage - 1);
            const goldGain = Math.floor(baseGold * stageBonus);
            this.addGold(goldGain);
        }

        // 무기 내구도 감소 확률
        if (this.equippedWeapon && Math.random() < CONFIG.weapon.attackDurabilityChance) {
            // 부식 스킬: 내구도 소모 2배
            const durabilityLoss = this.currentMob.skill === 'corrosion' ?
                CONFIG.mobSkills.corrosion.durabilityMultiplier : 1;

            this.equippedWeapon.reduceDurability(durabilityLoss);

            // 무기 파괴 체크
            if (this.equippedWeapon.isDestroyed()) {
                ui.showToast(`${this.equippedWeapon.getName()}이(가) 파괴되었습니다!`, 'error');
                this.equippedWeapon = null;
                ui.updateEquippedWeapon();
                // 자동 공격 중이었다면 중지
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
        const killedMob = this.currentMob;

        // 골드 드랍 (스테이지에 따라 증가)
        const goldAmount = Math.floor(CONFIG.mob.goldDrop * Math.pow(CONFIG.mob.goldGrowth, this.stage - 1));
        this.addGold(goldAmount);

        // 강화석 드랍 확률
        if (Math.random() < CONFIG.drop.enhanceStoneChance) {
            this.addEnhanceStone(1);
        }

        // 무기 드랍 확률
        if (Math.random() < CONFIG.drop.weaponChance) {
            const randomEnhanceLevel = Math.floor(Math.random() * 3); // 0~2 강화 수치

            // 드랍 티어 = 현재 스테이지 ± 1 랜덤
            const tierOffset = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
            const dropTier = Math.max(1, this.stage + tierOffset);

            const weapon = new Weapon(randomEnhanceLevel, null, dropTier);
            this.addToInventory(weapon);
            ui.showToast(`${weapon.getName()} 획득!`, 'success');
        }

        // 스킬 효과 처리
        this.applyMobSkillOnKill(killedMob);

        this.mobKillCount++;

        // 보스였으면 스테이지 증가
        if (killedMob.isBoss) {
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

    // 몹 처치 시 스킬 효과 처리
    applyMobSkillOnKill(mob) {
        if (!mob.skill) return;

        switch (mob.skill) {
            case 'chaos': // 혼돈: 장착 무기를 새 무기로 변환
                if (this.equippedWeapon) {
                    const minLevel = CONFIG.mobSkills.chaos.minEnhanceLevel;
                    const maxLevel = CONFIG.mobSkills.chaos.maxEnhanceLevel;
                    const newLevel = minLevel + Math.floor(Math.random() * (maxLevel - minLevel + 1));
                    const oldWeaponName = this.equippedWeapon.getName();

                    // 기존 무기 제거
                    const index = this.inventory.indexOf(this.equippedWeapon);
                    if (index !== -1) {
                        this.inventory.splice(index, 1);
                    }

                    // 새 무기 생성 및 장착 (티어는 현재 스테이지 기반)
                    const tierOffset = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
                    const chaosTier = Math.max(1, this.stage + tierOffset);
                    const newWeapon = new Weapon(newLevel, null, chaosTier);
                    this.addToInventory(newWeapon);
                    this.equipWeapon(newWeapon);
                    ui.showToast(`혼돈! ${oldWeaponName}이(가) ${newWeapon.getName()}(으)로 변했습니다!`, 'warning');
                }
                break;

            case 'explosive': // 폭발: 인벤토리 무기 내구도 감소
                if (this.inventory.length > 0) {
                    const randomWeapon = this.inventory[Math.floor(Math.random() * this.inventory.length)];
                    const lossAmount = Math.floor(randomWeapon.maxDurability * CONFIG.mobSkills.explosive.durabilityLossRatio);
                    randomWeapon.reduceDurability(lossAmount);

                    if (randomWeapon.isDestroyed()) {
                        const weaponName = randomWeapon.getName();
                        const index = this.inventory.indexOf(randomWeapon);
                        this.inventory.splice(index, 1);
                        if (this.equippedWeapon === randomWeapon) {
                            this.equippedWeapon = null;
                            if (this.autoAttackEnabled) {
                                this.stopAutoAttack();
                                ui.updateAutoAttackButton();
                            }
                        }
                        ui.showToast(`폭발! ${weaponName}이(가) 파괴되었습니다!`, 'error');
                    } else {
                        ui.showToast(`폭발! ${randomWeapon.getName()}의 내구도가 감소했습니다!`, 'warning');
                    }
                    ui.updateEquippedWeapon();
                }
                break;

            case 'crystal': // 결정화: 강화석 획득
                const minStones = CONFIG.mobSkills.crystal.minStones;
                const maxStones = CONFIG.mobSkills.crystal.maxStones;
                const stones = minStones + Math.floor(Math.random() * (maxStones - minStones + 1));
                this.addEnhanceStone(stones);
                ui.showToast(`결정화! 강화석 ${stones}개 획득!`, 'success');
                break;

            case 'whetstone': // 숫돌화: 장착 무기 내구도 회복
                if (this.equippedWeapon) {
                    const minRatio = CONFIG.mobSkills.whetstone.minHealRatio;
                    const maxRatio = CONFIG.mobSkills.whetstone.maxHealRatio;
                    const healRatio = minRatio + Math.random() * (maxRatio - minRatio);
                    const healAmount = Math.floor(this.equippedWeapon.maxDurability * healRatio);

                    this.equippedWeapon.currentDurability = Math.min(
                        this.equippedWeapon.currentDurability + healAmount,
                        this.equippedWeapon.maxDurability
                    );
                    ui.showToast(`숫돌화! ${this.equippedWeapon.getName()}의 내구도가 회복되었습니다!`, 'success');
                    ui.updateEquippedWeapon();
                }
                break;
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
            // 강화 등급 결정
            const gradeRoll = Math.random();
            let grade = 'normal';

            if (gradeRoll < CONFIG.enhanceGrades.master.chance) {
                grade = 'master';
            } else if (gradeRoll < CONFIG.enhanceGrades.master.chance + CONFIG.enhanceGrades.super.chance) {
                grade = 'super';
            } else if (gradeRoll < CONFIG.enhanceGrades.master.chance + CONFIG.enhanceGrades.super.chance + CONFIG.enhanceGrades.great.chance) {
                grade = 'great';
            }

            // 강화 성공
            weapon.enhanceSuccess(grade);

            const gradeName = CONFIG.enhanceGrades[grade].name;
            const gradeMessage = grade !== 'normal' ? ` [${gradeName}]` : '';

            ui.updateEquippedWeapon();
            // 장착 중인 무기를 강화했다면 자동 공격 간격 업데이트
            if (this.equippedWeapon === weapon && this.autoAttackEnabled) {
                this.updateAutoAttackInterval();
            }
            return {
                success: true,
                isEnhanceSuccess: true,
                message: `강화 성공!${gradeMessage} ${weapon.getName()}이(가) 되었습니다!`,
                weapon: weapon,
                grade: grade
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

            // 티어 결정 (스테이지 기반)
            const tier = this.generateShopWeaponTier();

            const weapon = new Weapon(randomEnhanceLevel, null, tier);

            // 환율 적용 (-60% ~ +80%)
            const exchangeRate = CONFIG.shop.exchangeRateMin +
                Math.random() * (CONFIG.shop.exchangeRateMax - CONFIG.shop.exchangeRateMin);
            weapon.shopExchangeRate = exchangeRate;

            this.shopWeapons.push(weapon);
        }
    }

    // 상점 무기 티어 결정
    generateShopWeaponTier() {
        const stage = this.stage;
        const rand = Math.random();

        let tierOffset = -2; // 기본 stage-2
        if (rand < 0.01) tierOffset = 2;
        else if (rand < 0.10) tierOffset = 1;
        else if (rand < 0.35) tierOffset = 0;
        else if (rand < 0.65) tierOffset = -1;

        return Math.max(1, stage + tierOffset); // 최소 티어 1
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

        // 자동 공격 기본 활성화
        this.startAutoAttack();
        ui.updateAutoAttackButton();
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
        let interval = this.equippedWeapon.getAttackInterval();

        // 빙결 스킬: 공격속도 감소
        if (this.currentMob && this.currentMob.skill === 'frozen') {
            interval = interval / CONFIG.mobSkills.frozen.attackSpeedMultiplier;
        }

        this.autoAttackIntervalId = setInterval(() => {
            this.attackMob();
        }, interval);
    }
}
