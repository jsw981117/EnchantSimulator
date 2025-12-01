// 무기 클래스
class Weapon {
    constructor(enhanceLevel = 0, weaponTypeIndex = null) {
        this.id = Date.now() + Math.random(); // 고유 ID

        // 무기 타입 랜덤 선택 또는 지정
        if (weaponTypeIndex === null) {
            weaponTypeIndex = Math.floor(Math.random() * CONFIG.weaponTypes.length);
        }
        this.weaponTypeIndex = weaponTypeIndex;
        this.weaponType = CONFIG.weaponTypes[weaponTypeIndex];

        this.enhanceLevel = enhanceLevel;
        this.enhanceGrade = null; // 강화 등급 (normal, great, super, master)
        this.enchantments = []; // 인챈트 스킬 목록

        this.attack = this.calculateAttack();
        this.maxDurability = this.calculateMaxDurability();
        this.currentDurability = this.maxDurability;
        this.value = this.calculateValue();

        // DoT 관련 (화상, 중독)
        this.dotEffects = {
            burn: { active: false, damage: 0, duration: 0, timer: null },
            poison: { active: false, damage: 0, duration: 0, timer: null }
        };
    }

    // 공격력 계산
    calculateAttack() {
        let attack = this.weaponType.baseAttack;

        // 강화 수치 적용
        if (this.enhanceLevel > 0) {
            let enhanceBonus = this.enhanceLevel * CONFIG.enhance.attackIncrease;

            // 강화 등급 배율 적용
            if (this.enhanceGrade) {
                const gradeData = CONFIG.enhanceGrades[this.enhanceGrade];
                enhanceBonus *= (1 + gradeData.multiplier);
            }

            attack += enhanceBonus;
        }

        return Math.floor(attack);
    }

    // 최대 내구도 계산
    calculateMaxDurability() {
        let durability = this.weaponType.durability;
        durability += this.enhanceLevel * CONFIG.enhance.durabilityIncrease;
        return Math.floor(durability);
    }

    // 무기 가치 계산 (판매/구매 가격 기준)
    calculateValue() {
        const baseValue = 20;
        let value = baseValue * Math.pow(1.5, this.enhanceLevel);

        // 강화 등급에 따른 가치 증가
        if (this.enhanceGrade) {
            const gradeData = CONFIG.enhanceGrades[this.enhanceGrade];
            value *= (1 + gradeData.multiplier);
        }

        // 인챈트 스킬 당 가치 증가
        value *= (1 + this.enchantments.length * 0.5);

        return Math.floor(value);
    }

    // 내구도 감소
    reduceDurability(amount = 1) {
        this.currentDurability -= amount;
        if (this.currentDurability < 0) {
            this.currentDurability = 0;
        }
    }

    // 내구도 회복
    healDurability(amount) {
        this.currentDurability += amount;
        if (this.currentDurability > this.maxDurability) {
            this.currentDurability = this.maxDurability;
        }
    }

    // 파괴 여부
    isDestroyed() {
        return this.currentDurability <= 0;
    }

    // 강화 성공
    enhanceSuccess(grade = 'normal') {
        this.enhanceLevel++;
        this.enhanceGrade = grade;
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

    // 공격속도 계산 (초당 공격 횟수)
    getAttackSpeed() {
        let speed = this.weaponType.attackSpeed;

        // 강화 수치당 공격속도 증가
        speed *= (1 + this.enhanceLevel * CONFIG.weapon.attackSpeedPerEnhance);

        // 인챈트 효과 적용
        if (this.hasEnchantment('swift')) {
            speed *= (1 + CONFIG.weaponSkills.swift.attackSpeedBonus);
        }
        if (this.hasEnchantment('twoHanded')) {
            speed *= (1 - CONFIG.weaponSkills.twoHanded.attackSpeedPenalty);
        }

        return speed;
    }

    // 공격 간격 계산 (밀리초)
    getAttackInterval() {
        return Math.floor(1000 / this.getAttackSpeed());
    }

    // 인챈트 추가
    addEnchantment(skillKey) {
        if (this.enchantments.length >= CONFIG.enchant.maxSkills) {
            return false;
        }
        if (this.enchantments.includes(skillKey)) {
            return false;
        }
        this.enchantments.push(skillKey);
        this.value = this.calculateValue();
        return true;
    }

    // 인챈트 보유 여부
    hasEnchantment(skillKey) {
        return this.enchantments.includes(skillKey);
    }

    // 무기 이름
    getName() {
        let name = this.weaponType.name;

        if (this.enhanceLevel > 0) {
            name = `+${this.enhanceLevel} ${name}`;

            // 강화 등급 표시
            if (this.enhanceGrade) {
                const gradeName = CONFIG.enhanceGrades[this.enhanceGrade].name;
                name = `[${gradeName}] ${name}`;
            }
        }

        return name;
    }

    // 인챈트 스킬 이름 목록
    getEnchantmentNames() {
        return this.enchantments.map(key => CONFIG.weaponSkills[key].name);
    }
}
