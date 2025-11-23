// 무기 클래스
class Weapon {
    constructor(enhanceLevel = 0) {
        this.id = Date.now() + Math.random(); // 고유 ID
        this.enhanceLevel = enhanceLevel;
        this.attack = this.calculateAttack();
        this.maxDurability = this.calculateMaxDurability();
        this.currentDurability = this.maxDurability;
        this.value = this.calculateValue();
    }

    // 공격력 계산
    calculateAttack() {
        return CONFIG.weapon.baseAttack + (this.enhanceLevel * CONFIG.enhance.attackIncrease);
    }

    // 최대 내구도 계산
    calculateMaxDurability() {
        return CONFIG.weapon.baseDurability + (this.enhanceLevel * CONFIG.enhance.durabilityIncrease);
    }

    // 무기 가치 계산 (판매/구매 가격 기준)
    calculateValue() {
        const baseValue = 100;
        return Math.floor(baseValue * Math.pow(1.5, this.enhanceLevel));
    }

    // 내구도 감소
    reduceDurability(amount = 1) {
        this.currentDurability -= amount;
        if (this.currentDurability < 0) {
            this.currentDurability = 0;
        }
    }

    // 파괴 여부
    isDestroyed() {
        return this.currentDurability <= 0;
    }

    // 강화 성공
    enhanceSuccess() {
        this.enhanceLevel++;
        this.attack = this.calculateAttack();
        this.maxDurability = this.calculateMaxDurability();
        this.currentDurability += CONFIG.enhance.durabilityIncrease;
        this.value = this.calculateValue();
    }

    // 강화 성공 확률 계산
    getEnhanceSuccessRate(stoneCount = 0) {
        let rate = CONFIG.enhance.baseSuccessRate - (this.enhanceLevel * CONFIG.enhance.successRateDecay);
        rate += stoneCount * CONFIG.enhance.stoneBonus;
        return Math.max(0, Math.min(1, rate)); // 0~1 사이로 제한
    }

    // 강화 비용 계산
    getEnhanceCost() {
        return Math.floor(CONFIG.enhance.costBase * Math.pow(CONFIG.enhance.costGrowth, this.enhanceLevel));
    }

    // 판매 가격
    getSellPrice() {
        return Math.floor(this.value * CONFIG.shop.sellRatio);
    }

    // 구매 가격
    getBuyPrice() {
        return Math.floor(this.value * CONFIG.shop.buyRatio);
    }

    // 무기 이름
    getName() {
        if (this.enhanceLevel === 0) {
            return '일반 무기';
        }
        return `+${this.enhanceLevel} 무기`;
    }
}
