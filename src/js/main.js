// Enchant Simulator - Main JavaScript

// 전역 변수
let game;
let ui;

// 게임 초기화
window.addEventListener('DOMContentLoaded', () => {
    // UI 초기화
    ui = new UI();
    ui.init();

    // 게임 매니저 초기화
    game = new GameManager();

    // 이벤트 리스너 등록
    setupEventListeners();

    // 게임 시작
    game.start();

    console.log('Enchant Simulator initialized');
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 몹 클릭
    document.getElementById('mob-area').addEventListener('click', () => {
        game.attackMob();
    });

    // 인벤토리 버튼
    document.getElementById('inventory-btn').addEventListener('click', () => {
        ui.openInventory();
    });

    // 인벤토리 닫기
    document.getElementById('close-inventory').addEventListener('click', () => {
        ui.closeInventory();
    });

    // 모달 배경 클릭 시 닫기
    document.getElementById('inventory-modal').addEventListener('click', (e) => {
        if (e.target.id === 'inventory-modal') {
            ui.closeInventory();
        }
    });

    // 강화 버튼
    document.getElementById('enhance-btn').addEventListener('click', () => {
        ui.openEnhance();
    });

    // 강화 모달 닫기
    document.getElementById('close-enhance').addEventListener('click', () => {
        ui.closeEnhance();
    });

    // 강화 모달 배경 클릭 시 닫기
    document.getElementById('enhance-modal').addEventListener('click', (e) => {
        if (e.target.id === 'enhance-modal') {
            ui.closeEnhance();
        }
    });

    // 강화석 슬라이더
    document.getElementById('stone-slider').addEventListener('input', () => {
        ui.updateEnhanceRate();
    });

    // 강화 실행 버튼
    document.getElementById('enhance-execute-btn').addEventListener('click', () => {
        ui.executeEnhance();
    });

    // 상점 닫기 버튼
    document.getElementById('close-shop').addEventListener('click', () => {
        ui.closeShopModal();
    });

    // 상점 모달 배경 클릭 시 닫기
    document.getElementById('shop-modal').addEventListener('click', (e) => {
        if (e.target.id === 'shop-modal') {
            ui.closeShopModal();
        }
    });

    // 상점 스킵 버튼
    document.getElementById('shop-skip-btn').addEventListener('click', () => {
        ui.closeShopModal();
    });

    // 상점 탭 버튼
    document.getElementById('buy-tab').addEventListener('click', () => {
        ui.switchShopTab('buy');
    });

    document.getElementById('sell-tab').addEventListener('click', () => {
        ui.switchShopTab('sell');
    });
}
