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

    // 자동 공격 토글 버튼
    document.getElementById('auto-attack-btn').addEventListener('click', () => {
        game.toggleAutoAttack();
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

    // 장착 무기 강화 버튼
    document.getElementById('equipped-enhance-btn').addEventListener('click', () => {
        ui.openEnhance(game.equippedWeapon);
    });

    // 장착 무기 판매 버튼
    document.getElementById('equipped-sell-btn').addEventListener('click', () => {
        if (game.equippedWeapon && confirm(`${game.equippedWeapon.getName()}을(를) ${game.equippedWeapon.getSellPrice()}G에 판매하시겠습니까?`)) {
            const weaponName = game.equippedWeapon.getName();
            const sellPrice = game.equippedWeapon.getSellPrice();
            game.sellWeapon(game.equippedWeapon);
            ui.showToast(`${weaponName}을(를) ${sellPrice}G에 판매했습니다!`, 'success');
        }
    });

    // 무기 상세 모달 닫기
    document.getElementById('close-weapon-detail').addEventListener('click', () => {
        ui.closeWeaponDetail();
    });

    // 무기 상세 모달 배경 클릭 시 닫기
    document.getElementById('weapon-detail-modal').addEventListener('click', (e) => {
        if (e.target.id === 'weapon-detail-modal') {
            ui.closeWeaponDetail();
        }
    });

    // 무기 상세 - 장착 버튼
    document.getElementById('detail-equip-btn').addEventListener('click', () => {
        const weapon = ui.selectedWeaponForDetail;
        if (!weapon) return;

        if (game.equippedWeapon === weapon) {
            game.unequipWeapon();
        } else {
            game.equipWeapon(weapon);
        }

        ui.closeWeaponDetail();
        ui.updateInventoryList();
    });

    // 무기 상세 - 강화 버튼
    document.getElementById('detail-enhance-btn').addEventListener('click', () => {
        const weapon = ui.selectedWeaponForDetail;
        if (!weapon) return;

        ui.closeWeaponDetail();
        ui.openEnhance(weapon);
    });

    // 무기 상세 - 판매 버튼
    document.getElementById('detail-sell-btn').addEventListener('click', () => {
        const weapon = ui.selectedWeaponForDetail;
        if (!weapon) return;

        if (confirm(`${weapon.getName()}을(를) ${weapon.getSellPrice()}G에 판매하시겠습니까?`)) {
            const weaponName = weapon.getName();
            const sellPrice = weapon.getSellPrice();
            game.sellWeapon(weapon);
            ui.showToast(`${weaponName}을(를) ${sellPrice}G에 판매했습니다!`, 'success');
            ui.closeWeaponDetail();
            ui.updateInventoryList();
        }
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
