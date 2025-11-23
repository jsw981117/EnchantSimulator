// UI 관리
class UI {
    constructor() {
        this.elements = {};
    }

    // DOM 요소 초기화
    init() {
        this.elements.goldDisplay = document.getElementById('gold-display');
        this.elements.stoneDisplay = document.getElementById('stone-display');
        this.elements.stageDisplay = document.getElementById('stage-display');
        this.elements.mobArea = document.getElementById('mob-area');
        this.elements.mobName = document.getElementById('mob-name');
        this.elements.mobHP = document.getElementById('mob-hp');
        this.elements.hpBar = document.getElementById('hp-bar');
        this.elements.equippedWeaponDetails = document.getElementById('equipped-weapon-details');
        this.elements.inventoryModal = document.getElementById('inventory-modal');
        this.elements.inventoryList = document.getElementById('inventory-list');
        this.elements.enhanceModal = document.getElementById('enhance-modal');
        this.elements.enhanceWeaponSelect = document.getElementById('enhance-weapon-select');
        this.elements.enhanceWeaponList = document.getElementById('enhance-weapon-list');
        this.elements.enhancePanel = document.getElementById('enhance-panel');
        this.selectedWeaponForEnhance = null;
    }

    // 자원 표시 업데이트
    updateResources() {
        this.elements.goldDisplay.textContent = game.gold;
        this.elements.stoneDisplay.textContent = game.enhanceStones;
    }

    // 스테이지 표시 업데이트
    updateStage() {
        this.elements.stageDisplay.textContent = game.stage;
    }

    // 몹 표시 업데이트
    updateMob() {
        if (!game.currentMob) return;

        const mob = game.currentMob;

        // 몹 이름
        const mobType = mob.isBoss ? 'BOSS' : 'Mob';
        this.elements.mobName.textContent = `${mobType} (Stage ${mob.stage})`;

        // HP 표시
        this.elements.mobHP.textContent = `${mob.currentHP} / ${mob.maxHP}`;

        // HP 바
        this.elements.hpBar.style.width = `${mob.getHPPercent()}%`;
    }

    // 장착 무기 표시 업데이트
    updateEquippedWeapon() {
        if (!game.equippedWeapon) {
            this.elements.equippedWeaponDetails.innerHTML = '무기 없음';
            return;
        }

        const weapon = game.equippedWeapon;
        this.elements.equippedWeaponDetails.innerHTML = `
            <div><strong>${weapon.getName()}</strong></div>
            <div>공격력: ${weapon.attack}</div>
            <div>내구도: ${weapon.currentDurability} / ${weapon.maxDurability}</div>
        `;
    }

    // 인벤토리 모달 열기
    openInventory() {
        this.updateInventoryList();
        this.elements.inventoryModal.style.display = 'flex';
    }

    // 인벤토리 모달 닫기
    closeInventory() {
        this.elements.inventoryModal.style.display = 'none';
    }

    // 인벤토리 목록 업데이트
    updateInventoryList() {
        this.elements.inventoryList.innerHTML = '';

        if (game.inventory.length === 0) {
            this.elements.inventoryList.innerHTML = '<p class="empty-message">인벤토리가 비어있습니다.</p>';
            return;
        }

        game.inventory.forEach(weapon => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            if (game.equippedWeapon === weapon) {
                itemDiv.classList.add('equipped');
            }

            itemDiv.innerHTML = `
                <div class="weapon-info">
                    <div class="weapon-name">${weapon.getName()}</div>
                    <div class="weapon-stats">
                        공격력: ${weapon.attack} |
                        내구도: ${weapon.currentDurability}/${weapon.maxDurability} |
                        판매가: ${weapon.getSellPrice()}G
                    </div>
                </div>
                <div class="weapon-actions">
                    <button class="equip-btn" data-weapon-id="${weapon.id}">
                        ${game.equippedWeapon === weapon ? '해제' : '장착'}
                    </button>
                    <button class="sell-btn" data-weapon-id="${weapon.id}">판매</button>
                </div>
            `;

            this.elements.inventoryList.appendChild(itemDiv);
        });

        // 이벤트 리스너 등록
        this.attachInventoryEventListeners();
    }

    // 인벤토리 이벤트 리스너
    attachInventoryEventListeners() {
        // 장착/해제 버튼
        document.querySelectorAll('.equip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const weaponId = parseFloat(e.target.dataset.weaponId);
                const weapon = game.inventory.find(w => w.id === weaponId);

                if (game.equippedWeapon === weapon) {
                    game.unequipWeapon();
                } else {
                    game.equipWeapon(weapon);
                }

                this.updateInventoryList();
            });
        });

        // 판매 버튼
        document.querySelectorAll('.sell-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const weaponId = parseFloat(e.target.dataset.weaponId);
                const weapon = game.inventory.find(w => w.id === weaponId);

                if (confirm(`${weapon.getName()}을(를) ${weapon.getSellPrice()}G에 판매하시겠습니까?`)) {
                    game.sellWeapon(weapon);
                    this.updateInventoryList();
                }
            });
        });
    }

    // 강화 모달 열기
    openEnhance() {
        this.selectedWeaponForEnhance = null;
        this.elements.enhanceWeaponSelect.style.display = 'block';
        this.elements.enhancePanel.style.display = 'none';
        this.updateEnhanceWeaponList();
        this.elements.enhanceModal.style.display = 'flex';
    }

    // 강화 모달 닫기
    closeEnhance() {
        this.elements.enhanceModal.style.display = 'none';
        this.selectedWeaponForEnhance = null;
    }

    // 강화 무기 목록 업데이트
    updateEnhanceWeaponList() {
        this.elements.enhanceWeaponList.innerHTML = '';

        if (game.inventory.length === 0) {
            this.elements.enhanceWeaponList.innerHTML = '<p class="empty-message">인벤토리가 비어있습니다.</p>';
            return;
        }

        game.inventory.forEach(weapon => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';

            itemDiv.innerHTML = `
                <div class="weapon-info">
                    <div class="weapon-name">${weapon.getName()}</div>
                    <div class="weapon-stats">
                        공격력: ${weapon.attack} |
                        내구도: ${weapon.currentDurability}/${weapon.maxDurability}
                    </div>
                </div>
                <div class="weapon-actions">
                    <button class="select-enhance-btn" data-weapon-id="${weapon.id}">선택</button>
                </div>
            `;

            this.elements.enhanceWeaponList.appendChild(itemDiv);
        });

        // 이벤트 리스너
        document.querySelectorAll('.select-enhance-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const weaponId = parseFloat(e.target.dataset.weaponId);
                const weapon = game.inventory.find(w => w.id === weaponId);
                this.selectWeaponForEnhance(weapon);
            });
        });
    }

    // 강화할 무기 선택
    selectWeaponForEnhance(weapon) {
        this.selectedWeaponForEnhance = weapon;
        this.elements.enhanceWeaponSelect.style.display = 'none';
        this.elements.enhancePanel.style.display = 'block';
        this.updateEnhancePanel();
    }

    // 강화 패널 업데이트
    updateEnhancePanel() {
        const weapon = this.selectedWeaponForEnhance;
        if (!weapon) return;

        document.getElementById('enhance-weapon-name').textContent = weapon.getName();
        document.getElementById('enhance-current-attack').textContent = weapon.attack;
        document.getElementById('enhance-current-level').textContent = `+${weapon.enhanceLevel}`;
        document.getElementById('enhance-current-durability').textContent =
            `${weapon.currentDurability} / ${weapon.maxDurability}`;

        // 강화석 슬라이더 최대값 설정
        const stoneSlider = document.getElementById('stone-slider');
        stoneSlider.max = game.enhanceStones;
        stoneSlider.value = 0;

        // 강화 비용
        document.getElementById('enhance-cost').textContent = `${weapon.getEnhanceCost()}G`;

        this.updateEnhanceRate();
    }

    // 강화 확률 업데이트
    updateEnhanceRate() {
        const weapon = this.selectedWeaponForEnhance;
        if (!weapon) return;

        const stoneCount = parseInt(document.getElementById('stone-slider').value);
        document.getElementById('stone-count').textContent = stoneCount;

        const successRate = weapon.getEnhanceSuccessRate(stoneCount);
        document.getElementById('success-rate').textContent =
            `${(successRate * 100).toFixed(1)}%`;
    }

    // 강화 실행
    executeEnhance() {
        const weapon = this.selectedWeaponForEnhance;
        if (!weapon) return;

        const stoneCount = parseInt(document.getElementById('stone-slider').value);
        const result = game.enhanceWeapon(weapon, stoneCount);

        if (result.success) {
            alert(result.message);

            if (result.isDestroyed) {
                // 무기 파괴됨
                this.closeEnhance();
            } else {
                // 강화 성공 or 실패 (파괴 안됨)
                this.updateEnhancePanel();
            }
        } else {
            // 골드/강화석 부족
            alert(result.message);
        }
    }
}
