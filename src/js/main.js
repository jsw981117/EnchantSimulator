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

    // 인벤토리 버튼 (Phase 3에서 구현)
    document.getElementById('inventory-btn').addEventListener('click', () => {
        console.log('인벤토리 버튼 클릭 (아직 미구현)');
    });

    // 강화 버튼 (Phase 4에서 구현)
    document.getElementById('enhance-btn').addEventListener('click', () => {
        console.log('강화 버튼 클릭 (아직 미구현)');
    });
}
