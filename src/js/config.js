// 게임 밸런싱 설정값
const CONFIG = {
    // 몹 관련
    mob: {
        baseHP: 10,              // 기본 몹 체력
        hpGrowth: 1.2,           // 스테이지당 체력 증가율
        goldDrop: 10,            // 몹 처치 시 골드 드랍
        mobsPerStage: 10,        // 스테이지당 몹 수
    },

    // 보스 관련
    boss: {
        hpMultiplier: 5,         // 일반 몹 대비 보스 체력 배율
    },

    // 드랍 확률
    drop: {
        enhanceStoneChance: 0.1, // 강화석 드랍 확률 (10%)
        weaponChance: 0.05,      // 무기 드랍 확률 (5%)
    },

    // 강화 관련
    enhance: {
        baseSuccessRate: 0.8,    // 기본 성공 확률 (80%)
        successRateDecay: 0.05,  // 강화 수치당 확률 감소
        stoneBonus: 0.1,         // 강화석 1개당 확률 증가 (10%)
        costBase: 100,           // 기본 강화 비용
        costGrowth: 1.5,         // 강화 수치당 비용 증가율
        attackIncrease: 5,       // 강화 성공 시 공격력 증가
        durabilityIncrease: 10,  // 강화 성공 시 내구도 증가
        durabilityDecrease: 10,  // 강화 실패 시 내구도 감소
    },

    // 무기 관련
    weapon: {
        attackDurabilityChance: 0.3, // 공격 시 내구도 감소 확률 (30%)
        baseDurability: 100,         // 기본 내구도
        baseAttack: 10,              // 기본 공격력
        baseAttackSpeed: 1.0,        // 기본 공격속도 (초당 1회)
        attackSpeedPerEnhance: 0.05, // 강화 수치당 공격속도 증가 (5%)
    },

    // 상점 관련
    shop: {
        appearChance: 0.1,       // 상점 등장 확률 (10%)
        sellRatio: 0.58,         // 판매 시 가격 비율 (58%)
        buyRatio: 1.0,           // 구매 시 가격 비율 (100%)
        itemSlots: 3,            // 상점 아이템 슬롯 수
    },

    // 플레이어 초기값
    player: {
        startGold: 0,
        startStones: 0,
        baseAttack: 1,           // 무기 없을 때 공격력
    }
};
