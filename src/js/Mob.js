// 몹 클래스
class Mob {
    constructor(stage, isBoss = false) {
        this.stage = stage;
        this.isBoss = isBoss;
        this.skill = this.rollSkill();
        this.maxHP = this.calculateHP();
        this.currentHP = this.maxHP;
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
}
