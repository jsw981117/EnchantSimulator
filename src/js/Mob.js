// 몹 클래스
class Mob {
    constructor(stage, isBoss = false) {
        this.stage = stage;
        this.isBoss = isBoss;
        this.skill = this.rollSkill();
        this.resistances = this.rollResistances(); // 저항 목록
        this.weaknesses = this.rollWeaknesses();   // 약점 목록
        this.maxHP = this.calculateHP();
        this.currentHP = this.maxHP;
    }

    // 저항 랜덤 선택
    rollResistances() {
        const resistances = [];
        if (Math.random() < CONFIG.mobResistance.hasResistanceChance) {
            // 랜덤 속성 선택
            const elementIndex = Math.floor(Math.random() * CONFIG.elements.length);
            const element = CONFIG.elements[elementIndex];

            // 저항 레벨 결정 (1=+, 2=++, 3=+++)
            const rand = Math.random();
            let level = 1;
            if (rand < CONFIG.mobResistance.level3Chance) level = 3;
            else if (rand < CONFIG.mobResistance.level3Chance + CONFIG.mobResistance.level2Chance) level = 2;

            resistances.push({ element, level });
        }
        return resistances;
    }

    // 약점 랜덤 선택
    rollWeaknesses() {
        const weaknesses = [];
        if (Math.random() < CONFIG.mobResistance.hasWeaknessChance) {
            // 랜덤 속성 선택
            const elementIndex = Math.floor(Math.random() * CONFIG.elements.length);
            const element = CONFIG.elements[elementIndex];

            // 약점 레벨 결정 (1=+, 2=++, 3=+++)
            const rand = Math.random();
            let level = 1;
            if (rand < CONFIG.mobResistance.level3Chance) level = 3;
            else if (rand < CONFIG.mobResistance.level3Chance + CONFIG.mobResistance.level2Chance) level = 2;

            weaknesses.push({ element, level });
        }
        return weaknesses;
    }

    // 스킬 랜덤 선택
    rollSkill() {
        const chance = this.isBoss ? CONFIG.mobSkills.bossMobChance : CONFIG.mobSkills.normalMobChance;

        if (Math.random() >= chance) {
            return null; // 스킬 없음
        }

        const skills = ['giant', 'corrosion', 'golden', 'chaos', 'frozen', 'explosive', 'crystal', 'whetstone'];
        return skills[Math.floor(Math.random() * skills.length)];
    }

    // 스킬 이름 반환
    getSkillName() {
        const skillNames = {
            giant: '거인화',
            corrosion: '부식',
            golden: '황금상',
            chaos: '혼돈',
            frozen: '빙결',
            explosive: '폭발',
            crystal: '결정화',
            whetstone: '숫돌화'
        };
        return this.skill ? skillNames[this.skill] : null;
    }

    // 스테이지에 따른 HP 계산
    calculateHP() {
        let baseHP = CONFIG.mob.baseHP * Math.pow(CONFIG.mob.hpGrowth, this.stage - 1);

        if (this.isBoss) {
            baseHP *= CONFIG.boss.hpMultiplier;
        }

        // 거인화 스킬 적용
        if (this.skill === 'giant') {
            const bonus = this.isBoss ? CONFIG.mobSkills.giant.bossHPBonus : CONFIG.mobSkills.giant.normalHPBonus;
            baseHP *= (1 + bonus);
        }

        return Math.floor(baseHP);
    }

    // 데미지 받기
    takeDamage(damage) {
        this.currentHP -= damage;
        if (this.currentHP < 0) {
            this.currentHP = 0;
        }
    }

    // 죽었는지 확인
    isDead() {
        return this.currentHP <= 0;
    }

    // HP 퍼센트
    getHPPercent() {
        return (this.currentHP / this.maxHP) * 100;
    }

    // 속성 대미지 배율 계산 (무기 속성에 따른)
    getElementDamageMultiplier(weaponElement) {
        if (!weaponElement) return 1.0;

        let multiplier = 1.0;

        // 저항 확인
        const resistance = this.resistances.find(r => r.element === weaponElement);
        if (resistance) {
            multiplier *= (1 - resistance.level * CONFIG.mobResistance.damagePerLevel);
        }

        // 약점 확인
        const weakness = this.weaknesses.find(w => w.element === weaponElement);
        if (weakness) {
            multiplier *= (1 + weakness.level * CONFIG.mobResistance.damagePerLevel);
        }

        return multiplier;
    }

    // 저항 표시 텍스트
    getResistanceText() {
        if (this.resistances.length === 0) return '';
        const resistance = this.resistances[0];
        const levelMarks = '+'.repeat(resistance.level);
        return `${resistance.element} 저항${levelMarks}`;
    }

    // 약점 표시 텍스트
    getWeaknessText() {
        if (this.weaknesses.length === 0) return '';
        const weakness = this.weaknesses[0];
        const levelMarks = '+'.repeat(weakness.level);
        return `${weakness.element} 약점${levelMarks}`;
    }
}
