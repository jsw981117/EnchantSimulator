// 게임 밸런싱 설정값
const CONFIG = {
    // 몹 관련
    mob: {
        baseHP: 50,              // 기본 몹 체력
        hpGrowth: 1.5,           // 스테이지당 체력 증가율
        goldDrop: 10,            // 몹 처치 시 기본 골드 드랍
        goldGrowth: 1.3,         // 스테이지당 골드 증가율 (30%)
        mobsPerStage: 10,        // 스테이지당 몹 수
    },

    // 보스 관련
    boss: {
        hpMultiplier: 5,         // 일반 몹 대비 보스 체력 배율
    },

    // 특수 스킬 관련
    mobSkills: {
        normalMobChance: 0.15,   // 일반 몹 스킬 보유 확률 (15%)
        bossMobChance: 0.5,      // 보스 몹 스킬 보유 확률 (50%)

        // 거인화 - 체력 증가
        giant: {
            normalHPBonus: 0.25, // 일반 몹 HP 증가 (25%)
            bossHPBonus: 0.5,    // 보스 HP 증가 (50%)
        },

        // 부식 - 내구도 소모 증가
        corrosion: {
            durabilityMultiplier: 2, // 내구도 소모 배율
        },

        // 황금상 - 골드 획득
        golden: {
            minGold: 5,          // 최소 골드
            maxGold: 20,         // 최대 골드
            stageMultiplier: 1.2, // 스테이지당 배율
        },

        // 혼돈 - 무기 변환
        chaos: {
            minEnhanceLevel: 0,  // 변환 무기 최소 강화 수치
            maxEnhanceLevel: 3,  // 변환 무기 최대 강화 수치
        },

        // 빙결 - 공격속도 감소
        frozen: {
            attackSpeedMultiplier: 0.5, // 공격속도 배율 (50%)
        },

        // 폭발 - 인벤토리 무기 내구도 감소
        explosive: {
            durabilityLossRatio: 0.5, // 내구도 감소 비율 (50%)
        },

        // 결정화 - 강화석 획득
        crystal: {
            minStones: 1,        // 최소 강화석
            maxStones: 3,        // 최대 강화석
        },

        // 숫돌화 - 내구도 회복
        whetstone: {
            minHealRatio: 0.2,   // 최소 회복 비율 (20%)
            maxHealRatio: 0.5,   // 최대 회복 비율 (50%)
        },
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
        costBase: 20,            // 기본 강화 비용
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

    // 무기 타입 목록
    weaponTypes: [
        {
            name: '검',
            baseAttack: 10,
            attackSpeed: 1.0,
            durability: 100,
        },
        {
            name: '도끼',
            baseAttack: 15,
            attackSpeed: 0.7,
            durability: 120,
        },
        {
            name: '창',
            baseAttack: 12,
            attackSpeed: 0.9,
            durability: 90,
        },
        {
            name: '단검',
            baseAttack: 7,
            attackSpeed: 1.5,
            durability: 70,
        },
        {
            name: '둔기',
            baseAttack: 13,
            attackSpeed: 0.8,
            durability: 130,
        },
    ],

    // 강화 등급 시스템
    enhanceGrades: {
        normal: {
            name: '일반',
            chance: 0.65,
            multiplier: 0.5,
        },
        great: {
            name: '대박',
            chance: 0.25,
            multiplier: 1.0,
        },
        super: {
            name: '초대박',
            chance: 0.09,
            multiplier: 2.0,
        },
        master: {
            name: '장인의 손길',
            chance: 0.01,
            multiplier: 5.0,
        },
    },

    // 인챈트 시스템
    enchant: {
        maxSkills: 4,
        stoneCost: 1,
        skillCountChances: [0.65, 0.25, 0.09, 0.01], // 1개, 2개, 3개, 4개
    },

    // 스킬 등급 시스템
    skillGrades: {
        normal: {
            name: '일반',
            chance: 0.65,
            level: 1, // I 등급 스킬
        },
        magic: {
            name: '마법',
            chance: 0.25,
            level: 2, // II 등급 스킬
        },
        hero: {
            name: '영웅',
            chance: 0.09,
            level: 3, // III 등급 스킬
        },
        legendary: {
            name: '전설',
            chance: 0.01,
            level: 4, // IV 등급 스킬
        },
    },

    // 속성 시스템
    elements: ['화염', '대기', '대지', '빙결', '암흑', '광명'],

    // 속성 색상
    elementColors: {
        '화염': '#ff4444',
        '대기': '#44ddff',
        '대지': '#88cc44',
        '빙결': '#4488ff',
        '암흑': '#aa44ff',
        '광명': '#ffdd44',
    },

    // 무기 속성 관련
    weaponElement: {
        chance: 0.3,  // 무기가 속성을 가질 확률 (30%)
    },

    // 티어 시스템
    tier: {
        statMultiplier: 1.3,     // 티어당 능력치 배율 (30%)
        valueMultiplier: 1.6,    // 티어당 가치 배율 (60%)
    },

    // 몹 저항/약점 시스템
    mobResistance: {
        hasResistanceChance: 0.2,    // 저항을 가질 확률 (20%)
        hasWeaknessChance: 0.2,      // 약점을 가질 확률 (20%)
        level1Chance: 0.60,          // + 등급 (60%)
        level2Chance: 0.30,          // ++ 등급 (30%)
        level3Chance: 0.10,          // +++ 등급 (10%)
        damagePerLevel: 0.10,        // 레벨당 대미지 배율 (10%)
    },

    // 무기 스킬 목록 (44개: 각 스킬 × 4등급)
    weaponSkills: {
        // 화염 시리즈 - 화상 DoT
        'flame_1': {
            name: '화염 I',
            burnDamage: 1,
            burnDuration: 2,
        },
        'flame_2': {
            name: '화염 II',
            burnDamage: 1,
            burnDuration: 3,
        },
        'flame_3': {
            name: '화염 III',
            burnDamage: 2,
            burnDuration: 2,
        },
        'flame_4': {
            name: '화염 IV',
            burnDamage: 2,
            burnDuration: 3,
        },

        // 맹독 시리즈 - 중독 DoT
        'poison_1': {
            name: '맹독 I',
            poisonDamage: 1,
            poisonDuration: 3,
        },
        'poison_2': {
            name: '맹독 II',
            poisonDamage: 1,
            poisonDuration: 4,
        },
        'poison_3': {
            name: '맹독 III',
            poisonDamage: 1,
            poisonDuration: 5,
        },
        'poison_4': {
            name: '맹독 IV',
            poisonDamage: 2,
            poisonDuration: 5,
        },

        // 신속 시리즈 - 공격속도 증가
        'swift_1': {
            name: '신속 I',
            attackSpeedBonus: 0.4,
        },
        'swift_2': {
            name: '신속 II',
            attackSpeedBonus: 0.6,
        },
        'swift_3': {
            name: '신속 III',
            attackSpeedBonus: 0.8,
        },
        'swift_4': {
            name: '신속 IV',
            attackSpeedBonus: 1.0,
        },

        // 행운 시리즈 - 스킬 발동 확률 증가
        'lucky_1': {
            name: '행운 I',
            procChanceBonus: 0.1,
        },
        'lucky_2': {
            name: '행운 II',
            procChanceBonus: 0.15,
        },
        'lucky_3': {
            name: '행운 III',
            procChanceBonus: 0.2,
        },
        'lucky_4': {
            name: '행운 IV',
            procChanceBonus: 0.25,
        },

        // 처형 시리즈 - 낮은 체력 즉시 처치
        'execute_1': {
            name: '처형 I',
            normalThreshold: 0.04,
            bossThreshold: 0.02,
        },
        'execute_2': {
            name: '처형 II',
            normalThreshold: 0.06,
            bossThreshold: 0.03,
        },
        'execute_3': {
            name: '처형 III',
            normalThreshold: 0.08,
            bossThreshold: 0.04,
        },
        'execute_4': {
            name: '처형 IV',
            normalThreshold: 0.1,
            bossThreshold: 0.05,
        },

        // 흡수 시리즈 - 내구도 회복
        'absorb_1': {
            name: '흡수 I',
            durabilityRecovery: 1,
        },
        'absorb_2': {
            name: '흡수 II',
            durabilityRecovery: 2,
        },
        'absorb_3': {
            name: '흡수 III',
            durabilityRecovery: 3,
        },
        'absorb_4': {
            name: '흡수 IV',
            durabilityRecovery: 4,
        },

        // 거인 학살자 시리즈 - 보스 대미지 증가
        'giantSlayer_1': {
            name: '거인 학살자 I',
            bossDamageBonus: 0.06,
        },
        'giantSlayer_2': {
            name: '거인 학살자 II',
            bossDamageBonus: 0.09,
        },
        'giantSlayer_3': {
            name: '거인 학살자 III',
            bossDamageBonus: 0.12,
        },
        'giantSlayer_4': {
            name: '거인 학살자 IV',
            bossDamageBonus: 0.15,
        },

        // 어둠의 장막 시리즈 - 첫 공격 배율
        'darkness_1': {
            name: '어둠의 장막 I',
            firstAttackMultiplier: 1.6,
        },
        'darkness_2': {
            name: '어둠의 장막 II',
            firstAttackMultiplier: 1.9,
        },
        'darkness_3': {
            name: '어둠의 장막 III',
            firstAttackMultiplier: 2.2,
        },
        'darkness_4': {
            name: '어둠의 장막 IV',
            firstAttackMultiplier: 2.5,
        },

        // 양손잡이 시리즈 - 공격속도 감소, 대미지 증가
        'twoHanded_1': {
            name: '양손잡이 I',
            attackSpeedPenalty: 0.25,
            damageMultiplier: 1.4,
        },
        'twoHanded_2': {
            name: '양손잡이 II',
            attackSpeedPenalty: 0.25,
            damageMultiplier: 1.6,
        },
        'twoHanded_3': {
            name: '양손잡이 III',
            attackSpeedPenalty: 0.25,
            damageMultiplier: 1.8,
        },
        'twoHanded_4': {
            name: '양손잡이 IV',
            attackSpeedPenalty: 0.25,
            damageMultiplier: 2.0,
        },

        // 이도류 시리즈 - 다중 공격
        'dualWield_1': {
            name: '이도류 I',
            damagePenalty: 0.25,
            attackCount: 2,
        },
        'dualWield_2': {
            name: '이도류 II',
            damagePenalty: 0.2,
            attackCount: 2,
        },
        'dualWield_3': {
            name: '이도류 III',
            damagePenalty: 0.15,
            attackCount: 2,
        },
        'dualWield_4': {
            name: '이도류 IV',
            damagePenalty: 0.1,
            attackCount: 2,
        },

        // 황금향 시리즈 - 골드 획득
        'golden_1': {
            name: '황금향 I',
            goldChance: 0.1,
            goldAmount: 2,
        },
        'golden_2': {
            name: '황금향 II',
            goldChance: 0.1,
            goldAmount: 3,
        },
        'golden_3': {
            name: '황금향 III',
            goldChance: 0.1,
            goldAmount: 4,
        },
        'golden_4': {
            name: '황금향 IV',
            goldChance: 0.1,
            goldAmount: 5,
        },
    },

    // 상점 관련
    shop: {
        appearChance: 0.1,       // 상점 등장 확률 (10%)
        sellRatio: 0.58,         // 판매 시 가격 비율 (58%)
        buyRatio: 1.0,           // 구매 시 가격 비율 (100%)
        itemSlots: 3,            // 상점 아이템 슬롯 수

        // 티어 등장 확률 (상점 최대 티어 = 현재 스테이지)
        tierChances: {
            plus2: 0.01,   // 스테이지 +2 티어: 1%
            plus1: 0.09,   // 스테이지 +1 티어: 9%
            same: 0.25,    // 동일 티어: 25%
            minus1: 0.30,  // 스테이지 -1 티어: 30%
            minus2: 0.35,  // 스테이지 -2 티어: 35%
        },

        // 환율 시스템
        exchangeRateMin: -0.6,   // 환율 최소 -60%
        exchangeRateMax: 0.8,    // 환율 최대 +80%
    },

    // 플레이어 초기값
    player: {
        startGold: 0,
        startStones: 0,
        baseAttack: 1,           // 무기 없을 때 공격력
    }
};

// 기본값 복사본 (초기화용)
const DEFAULT_CONFIG = JSON.parse(JSON.stringify(CONFIG));
