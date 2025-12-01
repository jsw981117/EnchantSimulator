// Enchant Simulator - Main JavaScript

// 전역 변수
let game;
let ui;

// 게임 초기화
window.addEventListener('DOMContentLoaded', () => {
    // UI 초기화
    ui = new UI();
    ui.init();

    // 저장된 설정 로드
    ui.loadSavedSettings();

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

    // 장착 무기 인챈트 버튼
    document.getElementById('equipped-enchant-btn').addEventListener('click', () => {
        if (game.equippedWeapon) {
            ui.openEnchantModal(game.equippedWeapon);
        }
    });

    // 장착 무기 판매 버튼
    document.getElementById('equipped-sell-btn').addEventListener('click', async () => {
        if (game.equippedWeapon) {
            const confirmed = await ui.showConfirm(
                `${game.equippedWeapon.getName()}을(를) ${game.equippedWeapon.getSellPrice()}G에 판매하시겠습니까?`,
                '무기 판매'
            );
            if (confirmed) {
                const weaponName = game.equippedWeapon.getName();
                const sellPrice = game.equippedWeapon.getSellPrice();
                game.sellWeapon(game.equippedWeapon);
                ui.showToast(`${weaponName}을(를) ${sellPrice}G에 판매했습니다!`, 'success');
            }
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

    // 무기 상세 - 인챈트 버튼
    document.getElementById('detail-enchant-btn').addEventListener('click', () => {
        const weapon = ui.selectedWeaponForDetail;
        if (!weapon) return;

        ui.closeWeaponDetail();
        ui.openEnchantModal(weapon);
    });

    // 무기 상세 - 판매 버튼
    document.getElementById('detail-sell-btn').addEventListener('click', async () => {
        const weapon = ui.selectedWeaponForDetail;
        if (!weapon) return;

        const confirmed = await ui.showConfirm(
            `${weapon.getName()}을(를) ${weapon.getSellPrice()}G에 판매하시겠습니까?`,
            '무기 판매'
        );
        if (confirmed) {
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

    // 인챈트 모달 닫기
    document.getElementById('close-enchant').addEventListener('click', () => {
        ui.closeEnchantModal();
    });

    // 인챈트 모달 배경 클릭 시 닫기
    document.getElementById('enchant-modal').addEventListener('click', (e) => {
        if (e.target.id === 'enchant-modal') {
            ui.closeEnchantModal();
        }
    });

    // 인챈트 실행 버튼
    document.getElementById('enchant-execute-btn').addEventListener('click', () => {
        ui.executeEnchant();
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

    // 설정 버튼
    document.getElementById('settings-btn').addEventListener('click', () => {
        ui.openSettings();
    });

    // 설정 모달 닫기
    document.getElementById('close-settings').addEventListener('click', () => {
        ui.closeSettings();
    });

    // 설정 모달 배경 클릭 시 닫기
    document.getElementById('settings-modal').addEventListener('click', (e) => {
        if (e.target.id === 'settings-modal') {
            ui.closeSettings();
        }
    });

    // 설정 탭 버튼
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            ui.switchSettingsTab(tab.dataset.tab);
        });
    });

    // 설정 적용 버튼
    document.getElementById('apply-settings-btn').addEventListener('click', () => {
        ui.applySettings();
    });

    // 설정 초기화 버튼
    document.getElementById('reset-settings-btn').addEventListener('click', () => {
        ui.resetSettings();
    });

    // 무기 타입 추가 버튼
    document.getElementById('add-weapon-type-btn').addEventListener('click', () => {
        const newIndex = CONFIG.weaponTypes.length;
        CONFIG.weaponTypes.push({
            name: '새 무기',
            baseAttack: 10,
            attackSpeed: 1.0,
            durability: 100
        });
        ui.addWeaponTypeToForm(newIndex);
    });

    // 무기 타입 삭제 버튼 (이벤트 위임)
    document.getElementById('weapon-types-list').addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-weapon-type-btn')) {
            if (CONFIG.weaponTypes.length <= 1) {
                ui.showToast('최소 1개의 무기 타입은 필요합니다!', 'error');
                return;
            }

            const item = e.target.closest('.weapon-type-item');

            const confirmed = await ui.showConfirm(
                '이 무기 타입을 삭제하시겠습니까?',
                '무기 타입 삭제'
            );
            if (confirmed) {
                item.remove();
            }
        }
    });
}
