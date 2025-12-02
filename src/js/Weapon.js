// 무기 클래스
class Weapon {
    constructor(enhanceLevel = 0, weaponTypeIndex = null, tier = 1) {
        this.id = Date.now() + Math.random(); // 고유 ID

        // 무기 타입 랜덤 선택 또는 지정
        if (weaponTypeIndex === null) {
            weaponTypeIndex = Math.floor(Math.random() * CONFIG.weaponTypes.length);
        }
        this.weaponTypeIndex = weaponTypeIndex;
        this.weaponType = CONFIG.weaponTypes[weaponTypeIndex];

        this.tier = tier; // 티어 (기본 1)
        this.enhanceLevel = enhanceLevel;
        this.enhanceGrade = null; // 강화 등급 (normal, great, super, master)
        this.enchantments = []; // 인챈트 스킬 목록

        // 속성 시스템 (30% 확률로 속성 부여)
        this.element = null;
        if (Math.random() < CONFIG.weaponElement.chance) {
            const elementIndex = Math.floor(Math.random() * CONFIG.elements.length);
            this.element = CONFIG.elements[elementIndex];
        }

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

        // 티어 배율 적용 (1.3^(tier-1))
        attack *= Math.pow(CONFIG.tier.statMultiplier, this.tier - 1);

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

        // 티어 배율 적용
        durability *= Math.pow(CONFIG.tier.statMultiplier, this.tier - 1);

        // 강화 수치 적용
        durability += this.enhanceLevel * CONFIG.enhance.durabilityIncrease;
        return Math.floor(durability);
    }

    // 무기 가치 계산 (판매/구매 가격 기준)
    calculateValue() {
        let value = 20; // 기본 가격

        // 1. 티어 배율 (1.6^(tier-1))
        value *= Math.pow(CONFIG.tier.valueMultiplier, this.tier - 1);

        // 2. 무기 타입 기본 공격력 반영
        value *= (this.weaponType.baseAttack / 10);

        // 3. 강화 수치 배율 (1 + 레벨 × 0.5)
        value *= (1 + this.enhanceLevel * 0.5);

        // 4. 강화 등급 배율
        if (this.enhanceGrade) {
            const gradeMultipliers = {
                normal: 1.0,
                great: 1.5,
                super: 2.0,
                master: 3.0
            };
            value *= gradeMultipliers[this.enhanceGrade];
        }

        // 5. 스킬 가치 (레벨별 차등)
        if (this.enchantments.length > 0) {
            let skillValue = 0;
            this.enchantments.forEach(key => {
                const skillName = CONFIG.weaponSkills[key].name;
                if (skillName.endsWith(' I')) skillValue += 0.3;
                else if (skillName.endsWith(' II')) skillValue += 0.5;
                else if (skillName.endsWith(' III')) skillValue += 0.8;
                else if (skillName.endsWith(' IV')) skillValue += 1.2;
            });
            value *= (1 + skillValue);
        }

        // 6. 속성 보유
        if (this.element) {
            value *= 1.3;
        }

        // 7. 내구도 비율 (최소 50%, 최대 100%)
        const durabilityRatio = this.currentDurability / this.maxDurability;
        value *= (0.5 + durabilityRatio * 0.5);

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
        let price = Math.floor(this.value * CONFIG.shop.buyRatio);

        // 상점 환율 적용 (있는 경우)
        if (this.shopExchangeRate !== undefined) {
            price = Math.floor(price * (1 + this.shopExchangeRate));
        }

        return price;
    }

    // 공격속도 계산 (초당 공격 횟수)
    getAttackSpeed() {
        let speed = this.weaponType.attackSpeed;

        // 강화 수치당 공격속도 증가
        speed *= (1 + this.enhanceLevel * CONFIG.weapon.attackSpeedPerEnhance);

        // 인챈트 효과 적용
        const swiftSkill = this.getEnchantmentByType('swift');
        if (swiftSkill) {
            speed *= (1 + CONFIG.weaponSkills[swiftSkill].attackSpeedBonus);
        }
        const twoHandedSkill = this.getEnchantmentByType('twoHanded');
        if (twoHandedSkill) {
            speed *= (1 - CONFIG.weaponSkills[twoHandedSkill].attackSpeedPenalty);
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

    // 특정 타입의 인챈트 찾기 (스킬 시리즈 중 하나라도 있으면 반환)
    getEnchantmentByType(skillType) {
        return this.enchantments.find(key => key.startsWith(skillType + '_'));
    }

    // 무기 이름
    getName() {
        let name = this.weaponType.name;

        // 속성 표시
        if (this.element) {
            name = `${this.element} ${name}`;
        }

        if (this.enhanceLevel > 0) {
            name = `+${this.enhanceLevel} ${name}`;

            // 강화 등급 표시 (일반 등급은 표시 안 함)
            if (this.enhanceGrade && this.enhanceGrade !== 'normal') {
                const gradeName = CONFIG.enhanceGrades[this.enhanceGrade].name;
                name = `[${gradeName}] ${name}`;
            }
        }

        // 티어 표시 (T1은 생략)
        if (this.tier > 1) {
            name = `[T${this.tier}] ${name}`;
        }

        return name;
    }

    // 인챈트 스킬 이름 목록
    getEnchantmentNames() {
        return this.enchantments.map(key => CONFIG.weaponSkills[key].name);
    }
}
