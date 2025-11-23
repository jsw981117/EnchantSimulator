// 몹 클래스
class Mob {
    constructor(stage, isBoss = false) {
        this.stage = stage;
        this.isBoss = isBoss;
        this.maxHP = this.calculateHP();
        this.currentHP = this.maxHP;
    }

    // 스테이지에 따른 HP 계산
    calculateHP() {
        const baseHP = CONFIG.mob.baseHP * Math.pow(CONFIG.mob.hpGrowth, this.stage - 1);

        if (this.isBoss) {
            return Math.floor(baseHP * CONFIG.boss.hpMultiplier);
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
