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
        this.selectedWeaponForEnhance = null;
        this.selectedWeaponForDetail = null;
        this.elements.shopModal = document.getElementById('shop-modal');
        this.elements.buyPanel = document.getElementById('buy-panel');
        this.elements.sellPanel = document.getElementById('sell-panel');
        this.elements.shopBuyList = document.getElementById('shop-buy-list');
        this.elements.shopSellList = document.getElementById('shop-sell-list');
        this.currentShopTab = 'buy';
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
        const actionsDiv = document.getElementById('equipped-weapon-actions');

        if (!game.equippedWeapon) {
            this.elements.equippedWeaponDetails.innerHTML = '무기 없음';
            actionsDiv.style.display = 'none';
            return;
        }

        const weapon = game.equippedWeapon;
        this.elements.equippedWeaponDetails.innerHTML = `
            <div><strong>${weapon.getName()}</strong></div>
            <div>공격력: ${weapon.attack}</div>
            <div>내구도: ${weapon.currentDurability} / ${weapon.maxDurability}</div>
        `;

        actionsDiv.style.display = 'block';
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
            itemDiv.style.cursor = 'pointer';
            itemDiv.dataset.weaponId = weapon.id;

            itemDiv.innerHTML = `
                <div class="weapon-info">
                    <div class="weapon-name">${weapon.getName()}</div>
                    <div class="weapon-stats">
                        공격력: ${weapon.attack} |
                        내구도: ${weapon.currentDurability}/${weapon.maxDurability} |
                        판매가: ${weapon.getSellPrice()}G
                    </div>
                </div>
            `;

            this.elements.inventoryList.appendChild(itemDiv);
        });

        // 이벤트 리스너 등록
        this.attachInventoryEventListeners();
    }

    // 인벤토리 이벤트 리스너
    attachInventoryEventListeners() {
        // 아이템 클릭 시 상세 모달 열기
        document.querySelectorAll('.inventory-item').forEach(itemDiv => {
            itemDiv.addEventListener('click', (e) => {
                const weaponId = parseFloat(itemDiv.dataset.weaponId);
                const weapon = game.inventory.find(w => w.id === weaponId);
                this.openWeaponDetail(weapon);
            });
        });
    }

    // 무기 상세 모달 열기
    openWeaponDetail(weapon) {
        this.selectedWeaponForDetail = weapon;

        // 무기 정보 표시
        document.getElementById('weapon-detail-name').textContent = weapon.getName();
        document.getElementById('detail-attack').textContent = weapon.attack;
        document.getElementById('detail-level').textContent = `+${weapon.enhanceLevel}`;
        document.getElementById('detail-attack-speed').textContent = `${weapon.getAttackSpeed().toFixed(2)}/s`;
        document.getElementById('detail-durability').textContent =
            `${weapon.currentDurability} / ${weapon.maxDurability}`;
        document.getElementById('detail-sell-price').textContent = `${weapon.getSellPrice()}G`;

        // 장착 버튼 텍스트 설정
        const equipBtn = document.getElementById('detail-equip-btn');
        equipBtn.textContent = game.equippedWeapon === weapon ? '장착 해제' : '장착';

        // 모달 표시
        document.getElementById('weapon-detail-modal').style.display = 'flex';
    }

    // 무기 상세 모달 닫기
    closeWeaponDetail() {
        document.getElementById('weapon-detail-modal').style.display = 'none';
        this.selectedWeaponForDetail = null;
    }

    // 강화 모달 열기
    openEnhance(weapon) {
        this.selectedWeaponForEnhance = weapon;
        this.updateEnhancePanel();
        this.elements.enhanceModal.style.display = 'flex';
    }

    // 강화 모달 닫기
    closeEnhance() {
        this.elements.enhanceModal.style.display = 'none';
        this.selectedWeaponForEnhance = null;
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
            if (result.isEnhanceSuccess) {
                this.showToast(result.message, 'success');
            } else if (result.isDestroyed) {
                this.showToast(result.message, 'error');
                this.closeEnhance();
            } else {
                this.showToast(result.message, 'warning');
                this.updateEnhancePanel();
            }

            if (!result.isDestroyed) {
                // 강화 성공 or 실패 (파괴 안됨)
                this.updateEnhancePanel();
            }
        } else {
            // 골드/강화석 부족
            this.showToast(result.message, 'error');
        }
    }

    // 상점 모달 열기
    openShopModal() {
        this.currentShopTab = 'buy';
        this.switchShopTab('buy');
        this.elements.shopModal.style.display = 'flex';
    }

    // 상점 모달 닫기
    closeShopModal() {
        this.elements.shopModal.style.display = 'none';
        game.closeShop();
    }

    // 상점 탭 전환
    switchShopTab(tab) {
        this.currentShopTab = tab;

        // 탭 버튼 활성화 상태 변경
        document.querySelectorAll('.shop-tab').forEach(btn => {
            btn.classList.remove('active');
        });

        if (tab === 'buy') {
            document.getElementById('buy-tab').classList.add('active');
            this.elements.buyPanel.style.display = 'block';
            this.elements.sellPanel.style.display = 'none';
            this.updateShopBuyList();
        } else {
            document.getElementById('sell-tab').classList.add('active');
            this.elements.buyPanel.style.display = 'none';
            this.elements.sellPanel.style.display = 'block';
            this.updateShopSellList();
        }
    }

    // 상점 구매 목록 업데이트
    updateShopBuyList() {
        this.elements.shopBuyList.innerHTML = '';

        if (game.shopWeapons.length === 0) {
            this.elements.shopBuyList.innerHTML = '<p class="empty-message">판매 중인 무기가 없습니다.</p>';
            return;
        }

        game.shopWeapons.forEach(weapon => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';

            itemDiv.innerHTML = `
                <div class="weapon-info">
                    <div class="weapon-name">${weapon.getName()}</div>
                    <div class="weapon-stats">
                        공격력: ${weapon.attack} |
                        내구도: ${weapon.currentDurability}/${weapon.maxDurability} |
                        가격: ${weapon.getBuyPrice()}G
                    </div>
                </div>
                <div class="weapon-actions">
                    <button class="buy-weapon-btn" data-weapon-id="${weapon.id}">구매</button>
                </div>
            `;

            this.elements.shopBuyList.appendChild(itemDiv);
        });

        // 이벤트 리스너
        document.querySelectorAll('.buy-weapon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const weaponId = parseFloat(e.target.dataset.weaponId);
                const weapon = game.shopWeapons.find(w => w.id === weaponId);

                const result = game.buyWeapon(weapon);
                if (result.success) {
                    this.showToast(result.message, 'success');
                    this.updateShopBuyList();
                } else {
                    this.showToast(result.message, 'error');
                }
            });
        });
    }

    // 상점 판매 목록 업데이트
    updateShopSellList() {
        this.elements.shopSellList.innerHTML = '';

        if (game.inventory.length === 0) {
            this.elements.shopSellList.innerHTML = '<p class="empty-message">인벤토리가 비어있습니다.</p>';
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
                        내구도: ${weapon.currentDurability}/${weapon.maxDurability} |
                        판매가: ${weapon.getSellPrice()}G
                    </div>
                </div>
                <div class="weapon-actions">
                    <button class="sell-weapon-btn" data-weapon-id="${weapon.id}">판매</button>
                </div>
            `;

            this.elements.shopSellList.appendChild(itemDiv);
        });

        // 이벤트 리스너
        document.querySelectorAll('.sell-weapon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const weaponId = parseFloat(e.target.dataset.weaponId);
                const weapon = game.inventory.find(w => w.id === weaponId);

                if (confirm(`${weapon.getName()}을(를) ${weapon.getSellPrice()}G에 판매하시겠습니까?`)) {
                    const weaponName = weapon.getName();
                    const sellPrice = weapon.getSellPrice();
                    game.sellWeapon(weapon);
                    this.showToast(`${weaponName}을(를) ${sellPrice}G에 판매했습니다!`, 'success');
                    this.updateShopSellList();
                }
            });
        });
    }

    // 토스트 메시지 표시
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // 3초 후 제거
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // 자동 공격 버튼 텍스트 업데이트
    updateAutoAttackButton() {
        const btn = document.getElementById('auto-attack-btn');
        btn.textContent = game.autoAttackEnabled ? '자동 공격: ON' : '자동 공격: OFF';
        btn.style.backgroundColor = game.autoAttackEnabled ? '#2a5a2a' : '';
    }
}
