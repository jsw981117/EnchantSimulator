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

    // 속성 배지 HTML 생성
    getElementBadgeHTML(element, type = 'weapon') {
        const color = CONFIG.elementColors[element] || '#999';
        const className = type === 'weapon' ? 'element-badge' : `element-badge ${type}`;
        return `<span class="${className}" style="background-color: ${color};">${element}</span>`;
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

        // 몹 이름 (스킬 포함)
        const mobType = mob.isBoss ? 'BOSS' : 'Mob';
        const skillName = mob.getSkillName();
        const skillText = skillName ? ` [${skillName}]` : '';

        this.elements.mobName.textContent = `${mobType} (Stage ${mob.stage})${skillText}`;

        // 속성 배지 표시 (저항/약점)
        const mobElementsDiv = document.getElementById('mob-elements');
        let elementBadges = '';

        if (mob.resistances.length > 0) {
            const resistance = mob.resistances[0];
            const levelMarks = '+'.repeat(resistance.level);
            const color = CONFIG.elementColors[resistance.element] || '#999';
            elementBadges += `<span class="element-badge resistance" style="background-color: ${color};">${resistance.element} 저항${levelMarks}</span>`;
        }

        if (mob.weaknesses.length > 0) {
            const weakness = mob.weaknesses[0];
            const levelMarks = '+'.repeat(weakness.level);
            const color = CONFIG.elementColors[weakness.element] || '#999';
            elementBadges += `<span class="element-badge weakness" style="background-color: ${color};">${weakness.element} 약점${levelMarks}</span>`;
        }

        mobElementsDiv.innerHTML = elementBadges;

        // HP 표시
        this.elements.mobHP.textContent = `${mob.currentHP} / ${mob.maxHP}`;

        // HP 바
        this.elements.hpBar.style.width = `${mob.getHPPercent()}%`;
    }

    // 장착 무기 표시 업데이트
    updateEquippedWeapon() {
        const actionsDiv = document.getElementById('equipped-weapon-actions');
        const elementsDiv = document.getElementById('equipped-weapon-elements');

        if (!game.equippedWeapon) {
            this.elements.equippedWeaponDetails.innerHTML = '무기 없음';
            elementsDiv.innerHTML = '';
            actionsDiv.style.display = 'none';
            return;
        }

        const weapon = game.equippedWeapon;
        let html = `
            <div><strong>${weapon.getName()}</strong></div>
            <div>공격력: ${weapon.attack}</div>
            <div>내구도: ${weapon.currentDurability} / ${weapon.maxDurability}</div>
        `;

        // 인챈트 스킬 표시
        if (weapon.enchantments && weapon.enchantments.length > 0) {
            const skillNames = weapon.getEnchantmentNames().join(', ');
            html += `<div>스킬: ${skillNames}</div>`;
        }

        this.elements.equippedWeaponDetails.innerHTML = html;

        // 속성 배지 표시
        if (weapon.element) {
            elementsDiv.innerHTML = this.getElementBadgeHTML(weapon.element, 'weapon');
        } else {
            elementsDiv.innerHTML = '';
        }

        actionsDiv.style.display = 'block';

        // 버튼에 비용 표시
        const enhanceBtn = document.getElementById('equipped-enhance-btn');
        const enchantBtn = document.getElementById('equipped-enchant-btn');
        const sellBtn = document.getElementById('equipped-sell-btn');

        if (enhanceBtn) {
            const enhanceCost = weapon.getEnhanceCost();
            enhanceBtn.innerHTML = `강화<br><span style="font-size: 0.8em; opacity: 0.8;">(${enhanceCost}G)</span>`;
        }

        if (enchantBtn) {
            const enchantCost = CONFIG.enchant.stoneCost;
            enchantBtn.innerHTML = `인챈트<br><span style="font-size: 0.8em; opacity: 0.8;">(${enchantCost}개)</span>`;
        }

        if (sellBtn) {
            const sellPrice = weapon.getSellPrice();
            sellBtn.innerHTML = `판매<br><span style="font-size: 0.8em; opacity: 0.8;">(${sellPrice}G)</span>`;
        }
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

    // 무기 타입별 이모티콘 매핑
    getWeaponEmoji(weaponTypeName) {
        const emojiMap = {
            '검': '⚔️',
            '도끼': '🪓',
            '창': '🔱',
            '단검': '🗡️',
            '둔기': '🔨'
        };
        return emojiMap[weaponTypeName] || '⚔️';
    }

    // 무기 이미지/아이콘 가져오기
    getWeaponIcon(weapon) {
        const weaponName = weapon.weaponType.name;
        const imagePath = `assets/weapons/${weaponName}.png`;

        // 이미지 엘리먼트 생성
        const img = document.createElement('img');
        img.className = 'weapon-icon';
        img.alt = weaponName;

        // 이미지 로드 시도
        img.src = imagePath;
        img.onerror = () => {
            // 이미지 로드 실패 시 이모티콘으로 대체
            const emoji = this.getWeaponEmoji(weaponName);
            img.style.display = 'none';
            img.parentElement.querySelector('.weapon-emoji').textContent = emoji;
            img.parentElement.querySelector('.weapon-emoji').style.display = 'block';
        };

        return img;
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
            itemDiv.className = 'inventory-item-grid';
            if (game.equippedWeapon === weapon) {
                itemDiv.classList.add('equipped');
            }
            itemDiv.style.cursor = 'pointer';
            itemDiv.dataset.weaponId = weapon.id;

            // 강화 레벨 표시
            const enhanceLevel = weapon.enhanceLevel > 0 ? `+${weapon.enhanceLevel}` : '';
            const gradeClass = weapon.enhanceGrade ? `grade-${weapon.enhanceGrade}` : '';

            // 속성 배지
            const elementBadge = weapon.element ? this.getElementBadgeHTML(weapon.element, 'weapon') : '';

            itemDiv.innerHTML = `
                <div class="weapon-icon-container ${gradeClass}">
                    <span class="weapon-emoji">${this.getWeaponEmoji(weapon.weaponType.name)}</span>
                    ${enhanceLevel ? `<div class="weapon-enhance-badge">${enhanceLevel}</div>` : ''}
                </div>
                <div class="weapon-item-name">${weapon.getName()}</div>
                ${elementBadge ? `<div class="element-badges">${elementBadge}</div>` : ''}
            `;

            // 이미지 로드 시도 (나중에 assets 폴더에 이미지 추가 시 사용)
            const img = new Image();
            img.src = `assets/weapons/${weapon.weaponType.name}.png`;
            img.className = 'weapon-icon';
            img.onload = () => {
                const iconContainer = itemDiv.querySelector('.weapon-icon-container');
                iconContainer.querySelector('.weapon-emoji').style.display = 'none';
                iconContainer.insertBefore(img, iconContainer.firstChild);
            };

            this.elements.inventoryList.appendChild(itemDiv);
        });

        // 이벤트 리스너 등록
        this.attachInventoryEventListeners();
    }

    // 인벤토리 이벤트 리스너
    attachInventoryEventListeners() {
        // 아이템 클릭 시 상세 모달 열기
        document.querySelectorAll('.inventory-item-grid').forEach(itemDiv => {
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

        // 버튼에 비용 표시
        const enhanceBtn = document.getElementById('detail-enhance-btn');
        const enchantBtn = document.getElementById('detail-enchant-btn');
        const sellBtn = document.getElementById('detail-sell-btn');

        if (enhanceBtn) {
            const enhanceCost = weapon.getEnhanceCost();
            enhanceBtn.innerHTML = `강화<br><span style="font-size: 0.8em; opacity: 0.8;">(${enhanceCost}G)</span>`;
        }

        if (enchantBtn) {
            const enchantCost = CONFIG.enchant.stoneCost;
            enchantBtn.innerHTML = `인챈트<br><span style="font-size: 0.8em; opacity: 0.8;">(${enchantCost}개)</span>`;
        }

        if (sellBtn) {
            const sellPrice = weapon.getSellPrice();
            sellBtn.innerHTML = `판매<br><span style="font-size: 0.8em; opacity: 0.8;">(${sellPrice}G)</span>`;
        }

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

            // 환율 표시
            let exchangeRateText = '';
            if (weapon.shopExchangeRate !== undefined) {
                const rate = weapon.shopExchangeRate;
                const ratePercent = Math.round(rate * 100);
                const rateClass = rate < 0 ? 'exchange-rate-discount' : 'exchange-rate-premium';
                const rateSign = rate >= 0 ? '+' : '';
                exchangeRateText = `<span class="${rateClass}">(${rateSign}${ratePercent}%)</span>`;
            }

            itemDiv.innerHTML = `
                <div class="weapon-info">
                    <div class="weapon-name">${weapon.getName()}</div>
                    <div class="weapon-stats">
                        공격력: ${weapon.attack} |
                        내구도: ${weapon.currentDurability}/${weapon.maxDurability} |
                        가격: ${weapon.getBuyPrice()}G ${exchangeRateText}
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
            btn.addEventListener('click', async (e) => {
                const weaponId = parseFloat(e.target.dataset.weaponId);
                const weapon = game.inventory.find(w => w.id === weaponId);

                const confirmed = await this.showConfirm(
                    `${weapon.getName()}을(를) ${weapon.getSellPrice()}G에 판매하시겠습니까?`,
                    '무기 판매'
                );
                if (confirmed) {
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

    // 설정 모달 열기
    openSettings() {
        this.loadSettingsToForm();
        document.getElementById('settings-modal').style.display = 'flex';
    }

    // 설정 모달 닫기
    closeSettings() {
        document.getElementById('settings-modal').style.display = 'none';
    }

    // 설정 탭 전환
    switchSettingsTab(tabName) {
        // 탭 버튼 업데이트
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // 패널 표시 전환
        document.getElementById('basic-settings').style.display = tabName === 'basic' ? 'block' : 'none';
        document.getElementById('enhance-settings').style.display = tabName === 'enhance' ? 'block' : 'none';
        document.getElementById('skills-settings').style.display = tabName === 'skills' ? 'block' : 'none';
        document.getElementById('weapons-settings').style.display = tabName === 'weapons' ? 'block' : 'none';
    }

    // CONFIG 값을 폼에 로드
    loadSettingsToForm() {
        // 기본 설정
        document.getElementById('mob-baseHP').value = CONFIG.mob.baseHP;
        document.getElementById('mob-hpGrowth').value = CONFIG.mob.hpGrowth;
        document.getElementById('mob-goldDrop').value = CONFIG.mob.goldDrop;
        document.getElementById('mob-goldGrowth').value = CONFIG.mob.goldGrowth;
        document.getElementById('mob-mobsPerStage').value = CONFIG.mob.mobsPerStage;

        document.getElementById('boss-hpMultiplier').value = CONFIG.boss.hpMultiplier;

        document.getElementById('drop-enhanceStoneChance').value = CONFIG.drop.enhanceStoneChance;
        document.getElementById('drop-weaponChance').value = CONFIG.drop.weaponChance;

        document.getElementById('shop-appearChance').value = CONFIG.shop.appearChance;
        document.getElementById('shop-sellRatio').value = CONFIG.shop.sellRatio;
        document.getElementById('shop-itemSlots').value = CONFIG.shop.itemSlots;

        // 강화/무기 설정
        document.getElementById('enhance-baseSuccessRate').value = CONFIG.enhance.baseSuccessRate;
        document.getElementById('enhance-successRateDecay').value = CONFIG.enhance.successRateDecay;
        document.getElementById('enhance-stoneBonus').value = CONFIG.enhance.stoneBonus;
        document.getElementById('enhance-costBase').value = CONFIG.enhance.costBase;
        document.getElementById('enhance-costGrowth').value = CONFIG.enhance.costGrowth;
        document.getElementById('enhance-attackIncrease').value = CONFIG.enhance.attackIncrease;
        document.getElementById('enhance-durabilityIncrease').value = CONFIG.enhance.durabilityIncrease;
        document.getElementById('enhance-durabilityDecrease').value = CONFIG.enhance.durabilityDecrease;

        document.getElementById('weapon-attackDurabilityChance').value = CONFIG.weapon.attackDurabilityChance;
        document.getElementById('weapon-baseDurability').value = CONFIG.weapon.baseDurability;
        document.getElementById('weapon-baseAttack').value = CONFIG.weapon.baseAttack;
        document.getElementById('weapon-baseAttackSpeed').value = CONFIG.weapon.baseAttackSpeed;
        document.getElementById('weapon-attackSpeedPerEnhance').value = CONFIG.weapon.attackSpeedPerEnhance;

        // 스킬 설정
        document.getElementById('mobSkills-normalMobChance').value = CONFIG.mobSkills.normalMobChance;
        document.getElementById('mobSkills-bossMobChance').value = CONFIG.mobSkills.bossMobChance;

        document.getElementById('giant-normalHPBonus').value = CONFIG.mobSkills.giant.normalHPBonus;
        document.getElementById('giant-bossHPBonus').value = CONFIG.mobSkills.giant.bossHPBonus;

        document.getElementById('corrosion-durabilityMultiplier').value = CONFIG.mobSkills.corrosion.durabilityMultiplier;

        document.getElementById('golden-minGold').value = CONFIG.mobSkills.golden.minGold;
        document.getElementById('golden-maxGold').value = CONFIG.mobSkills.golden.maxGold;
        document.getElementById('golden-stageMultiplier').value = CONFIG.mobSkills.golden.stageMultiplier;

        document.getElementById('chaos-minEnhanceLevel').value = CONFIG.mobSkills.chaos.minEnhanceLevel;
        document.getElementById('chaos-maxEnhanceLevel').value = CONFIG.mobSkills.chaos.maxEnhanceLevel;

        document.getElementById('frozen-attackSpeedMultiplier').value = CONFIG.mobSkills.frozen.attackSpeedMultiplier;

        document.getElementById('explosive-durabilityLossRatio').value = CONFIG.mobSkills.explosive.durabilityLossRatio;

        document.getElementById('crystal-minStones').value = CONFIG.mobSkills.crystal.minStones;
        document.getElementById('crystal-maxStones').value = CONFIG.mobSkills.crystal.maxStones;

        document.getElementById('whetstone-minHealRatio').value = CONFIG.mobSkills.whetstone.minHealRatio;
        document.getElementById('whetstone-maxHealRatio').value = CONFIG.mobSkills.whetstone.maxHealRatio;

        // 무기 타입 목록 로드
        this.loadWeaponTypesToForm();
    }

    // 설정 적용
    applySettings() {
        // 기본 설정
        CONFIG.mob.baseHP = parseFloat(document.getElementById('mob-baseHP').value);
        CONFIG.mob.hpGrowth = parseFloat(document.getElementById('mob-hpGrowth').value);
        CONFIG.mob.goldDrop = parseFloat(document.getElementById('mob-goldDrop').value);
        CONFIG.mob.goldGrowth = parseFloat(document.getElementById('mob-goldGrowth').value);
        CONFIG.mob.mobsPerStage = parseInt(document.getElementById('mob-mobsPerStage').value);

        CONFIG.boss.hpMultiplier = parseFloat(document.getElementById('boss-hpMultiplier').value);

        CONFIG.drop.enhanceStoneChance = parseFloat(document.getElementById('drop-enhanceStoneChance').value);
        CONFIG.drop.weaponChance = parseFloat(document.getElementById('drop-weaponChance').value);

        CONFIG.shop.appearChance = parseFloat(document.getElementById('shop-appearChance').value);
        CONFIG.shop.sellRatio = parseFloat(document.getElementById('shop-sellRatio').value);
        CONFIG.shop.itemSlots = parseInt(document.getElementById('shop-itemSlots').value);

        // 강화/무기 설정
        CONFIG.enhance.baseSuccessRate = parseFloat(document.getElementById('enhance-baseSuccessRate').value);
        CONFIG.enhance.successRateDecay = parseFloat(document.getElementById('enhance-successRateDecay').value);
        CONFIG.enhance.stoneBonus = parseFloat(document.getElementById('enhance-stoneBonus').value);
        CONFIG.enhance.costBase = parseFloat(document.getElementById('enhance-costBase').value);
        CONFIG.enhance.costGrowth = parseFloat(document.getElementById('enhance-costGrowth').value);
        CONFIG.enhance.attackIncrease = parseFloat(document.getElementById('enhance-attackIncrease').value);
        CONFIG.enhance.durabilityIncrease = parseFloat(document.getElementById('enhance-durabilityIncrease').value);
        CONFIG.enhance.durabilityDecrease = parseFloat(document.getElementById('enhance-durabilityDecrease').value);

        CONFIG.weapon.attackDurabilityChance = parseFloat(document.getElementById('weapon-attackDurabilityChance').value);
        CONFIG.weapon.baseDurability = parseFloat(document.getElementById('weapon-baseDurability').value);
        CONFIG.weapon.baseAttack = parseFloat(document.getElementById('weapon-baseAttack').value);
        CONFIG.weapon.baseAttackSpeed = parseFloat(document.getElementById('weapon-baseAttackSpeed').value);
        CONFIG.weapon.attackSpeedPerEnhance = parseFloat(document.getElementById('weapon-attackSpeedPerEnhance').value);

        // 스킬 설정
        CONFIG.mobSkills.normalMobChance = parseFloat(document.getElementById('mobSkills-normalMobChance').value);
        CONFIG.mobSkills.bossMobChance = parseFloat(document.getElementById('mobSkills-bossMobChance').value);

        CONFIG.mobSkills.giant.normalHPBonus = parseFloat(document.getElementById('giant-normalHPBonus').value);
        CONFIG.mobSkills.giant.bossHPBonus = parseFloat(document.getElementById('giant-bossHPBonus').value);

        CONFIG.mobSkills.corrosion.durabilityMultiplier = parseFloat(document.getElementById('corrosion-durabilityMultiplier').value);

        CONFIG.mobSkills.golden.minGold = parseFloat(document.getElementById('golden-minGold').value);
        CONFIG.mobSkills.golden.maxGold = parseFloat(document.getElementById('golden-maxGold').value);
        CONFIG.mobSkills.golden.stageMultiplier = parseFloat(document.getElementById('golden-stageMultiplier').value);

        CONFIG.mobSkills.chaos.minEnhanceLevel = parseInt(document.getElementById('chaos-minEnhanceLevel').value);
        CONFIG.mobSkills.chaos.maxEnhanceLevel = parseInt(document.getElementById('chaos-maxEnhanceLevel').value);

        CONFIG.mobSkills.frozen.attackSpeedMultiplier = parseFloat(document.getElementById('frozen-attackSpeedMultiplier').value);

        CONFIG.mobSkills.explosive.durabilityLossRatio = parseFloat(document.getElementById('explosive-durabilityLossRatio').value);

        CONFIG.mobSkills.crystal.minStones = parseInt(document.getElementById('crystal-minStones').value);
        CONFIG.mobSkills.crystal.maxStones = parseInt(document.getElementById('crystal-maxStones').value);

        CONFIG.mobSkills.whetstone.minHealRatio = parseFloat(document.getElementById('whetstone-minHealRatio').value);
        CONFIG.mobSkills.whetstone.maxHealRatio = parseFloat(document.getElementById('whetstone-maxHealRatio').value);

        // 무기 타입 저장
        if (!this.saveWeaponTypesFromForm()) {
            return;
        }

        // localStorage에 저장
        localStorage.setItem('enchantSimulatorConfig', JSON.stringify(CONFIG));

        this.showToast('설정이 적용되었습니다!', 'success');
        this.closeSettings();
    }

    // 설정 초기화
    async resetSettings() {
        const confirmed = await this.showConfirm(
            '모든 설정을 기본값으로 초기화하시겠습니까?',
            '설정 초기화'
        );
        if (!confirmed) {
            return;
        }

        // CONFIG를 DEFAULT_CONFIG로 복원
        Object.assign(CONFIG, JSON.parse(JSON.stringify(DEFAULT_CONFIG)));

        // localStorage 삭제
        localStorage.removeItem('enchantSimulatorConfig');

        // 폼 업데이트
        this.loadSettingsToForm();

        this.showToast('설정이 초기화되었습니다!', 'success');
    }

    // 저장된 설정 로드 (게임 시작 시)
    loadSavedSettings() {
        const savedConfig = localStorage.getItem('enchantSimulatorConfig');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                Object.assign(CONFIG, parsed);
            } catch (e) {
                console.error('설정 로드 실패:', e);
            }
        }
    }

    // 무기 타입 목록을 폼에 로드
    loadWeaponTypesToForm() {
        const container = document.getElementById('weapon-types-list');
        container.innerHTML = '';

        CONFIG.weaponTypes.forEach((type, index) => {
            this.addWeaponTypeToForm(index);
        });
    }

    // 무기 타입 하나를 폼에 추가
    addWeaponTypeToForm(index) {
        const container = document.getElementById('weapon-types-list');
        const weaponType = CONFIG.weaponTypes[index];

        const div = document.createElement('div');
        div.className = 'weapon-type-item';
        div.dataset.index = index;
        div.innerHTML = `
            <div class="weapon-type-header">
                <h4>무기 타입 #${index + 1}</h4>
                <button class="delete-weapon-type-btn" data-index="${index}">삭제</button>
            </div>
            <div class="setting-row">
                <label>이름:</label>
                <input type="text" class="weapon-type-name" value="${weaponType.name}">
            </div>
            <div class="setting-row">
                <label>기본 공격력:</label>
                <input type="number" class="weapon-type-attack" min="1" value="${weaponType.baseAttack}">
            </div>
            <div class="setting-row">
                <label>공격속도:</label>
                <input type="number" class="weapon-type-speed" min="0.1" step="0.1" value="${weaponType.attackSpeed}">
            </div>
            <div class="setting-row">
                <label>내구도:</label>
                <input type="number" class="weapon-type-durability" min="1" value="${weaponType.durability}">
            </div>
        `;

        container.appendChild(div);
    }

    // 폼에서 무기 타입 저장
    saveWeaponTypesFromForm() {
        const items = document.querySelectorAll('.weapon-type-item');
        const newWeaponTypes = [];

        items.forEach(item => {
            const name = item.querySelector('.weapon-type-name').value.trim();
            const baseAttack = parseFloat(item.querySelector('.weapon-type-attack').value);
            const attackSpeed = parseFloat(item.querySelector('.weapon-type-speed').value);
            const durability = parseFloat(item.querySelector('.weapon-type-durability').value);

            if (name && baseAttack > 0 && attackSpeed > 0 && durability > 0) {
                newWeaponTypes.push({
                    name,
                    baseAttack,
                    attackSpeed,
                    durability
                });
            }
        });

        if (newWeaponTypes.length === 0) {
            alert('최소 1개 이상의 무기 타입이 필요합니다!');
            return false;
        }

        CONFIG.weaponTypes = newWeaponTypes;
        return true;
    }

    // 인챈트 모달 열기
    openEnchantModal(weapon) {
        this.selectedWeaponForEnchant = weapon;

        // 무기 정보 표시
        document.getElementById('enchant-weapon-name').textContent = weapon.getName();
        document.getElementById('enchant-current-count').textContent =
            `${weapon.enchantments.length} / ${CONFIG.enchant.maxSkills}`;

        // 현재 인챈트 목록 표시
        const listDiv = document.getElementById('enchant-current-list');
        if (weapon.enchantments.length > 0) {
            const skillNames = weapon.getEnchantmentNames();
            listDiv.innerHTML = '<div style="margin-top: 5px;">현재 스킬: ' + skillNames.join(', ') + '</div>';
        } else {
            listDiv.innerHTML = '<div style="margin-top: 5px; opacity: 0.7;">스킬 없음</div>';
        }

        // 비용 표시
        document.getElementById('enchant-cost').textContent = `${CONFIG.enchant.stoneCost}개`;

        // 모달 표시
        document.getElementById('enchant-modal').style.display = 'flex';
    }

    // 인챈트 모달 닫기
    closeEnchantModal() {
        document.getElementById('enchant-modal').style.display = 'none';
        this.selectedWeaponForEnchant = null;
    }

    // 인챈트 실행
    executeEnchant() {
        const weapon = this.selectedWeaponForEnchant;
        if (!weapon) return;

        // 강화석 확인
        if (game.enhanceStones < CONFIG.enchant.stoneCost) {
            this.showToast('강화석이 부족합니다!', 'error');
            return;
        }

        // 이미 최대 스킬 개수인 경우
        if (weapon.enchantments.length >= CONFIG.enchant.maxSkills) {
            this.showToast('이미 최대 스킬 개수입니다!', 'error');
            return;
        }

        // 강화석 소모
        game.enhanceStones -= CONFIG.enchant.stoneCost;

        // 스킬 개수 결정 (1~4개, 확률: 65%, 25%, 9%, 1%)
        const rand = Math.random();
        let skillCount = 1;
        if (rand < 0.01) skillCount = 4;
        else if (rand < 0.10) skillCount = 3;
        else if (rand < 0.35) skillCount = 2;

        // 남은 슬롯 수 고려
        const maxPossibleSkills = Math.min(
            skillCount,
            CONFIG.enchant.maxSkills - weapon.enchantments.length
        );

        if (maxPossibleSkills <= 0) {
            this.showToast('더 이상 스킬을 추가할 수 없습니다!', 'error');
            game.enhanceStones += CONFIG.enchant.stoneCost; // 환불
            return;
        }

        // 각 스킬마다 등급 결정 후 선택
        const addedSkills = [];
        for (let i = 0; i < maxPossibleSkills; i++) {
            // 스킬 등급 결정 (일반 65%, 마법 25%, 영웅 9%, 전설 1%)
            const gradeRand = Math.random();
            let skillLevel = 1;
            if (gradeRand < 0.01) skillLevel = 4;      // 전설 (1%)
            else if (gradeRand < 0.10) skillLevel = 3; // 영웅 (9%)
            else if (gradeRand < 0.35) skillLevel = 2; // 마법 (25%)
            else skillLevel = 1;                        // 일반 (65%)

            // 해당 등급의 사용 가능한 스킬 목록
            const allSkillKeys = Object.keys(CONFIG.weaponSkills);
            const gradeSkills = allSkillKeys.filter(key => {
                const skillName = CONFIG.weaponSkills[key].name;
                const levelSuffix = ['I', 'II', 'III', 'IV'][skillLevel - 1];
                return skillName.endsWith(levelSuffix) && !weapon.enchantments.includes(key);
            });

            if (gradeSkills.length === 0) {
                // 해당 등급에 사용 가능한 스킬이 없으면 스킵
                continue;
            }

            // 랜덤으로 스킬 선택
            const randomIndex = Math.floor(Math.random() * gradeSkills.length);
            const selectedSkill = gradeSkills[randomIndex];
            weapon.addEnchantment(selectedSkill);
            addedSkills.push(CONFIG.weaponSkills[selectedSkill].name);
        }

        // UI 업데이트
        this.updateResources();
        this.updateEquippedWeapon();
        this.updateInventoryList();

        // 성공 메시지
        const skillText = addedSkills.join(', ');
        this.showToast(`인챈트 성공! 획득 스킬: ${skillText}`, 'success');

        // 모달 닫기
        this.closeEnchantModal();
    }

    // 확인 모달 표시 (Promise 반환)
    showConfirm(message, title = '확인') {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            const titleEl = document.getElementById('confirm-title');
            const messageEl = document.getElementById('confirm-message');
            const okBtn = document.getElementById('confirm-ok-btn');
            const cancelBtn = document.getElementById('confirm-cancel-btn');

            titleEl.textContent = title;
            messageEl.textContent = message;

            // 이전 이벤트 리스너 제거를 위해 새 버튼으로 교체
            const newOkBtn = okBtn.cloneNode(true);
            const newCancelBtn = cancelBtn.cloneNode(true);
            okBtn.parentNode.replaceChild(newOkBtn, okBtn);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

            // 새 이벤트 리스너 추가
            newOkBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                resolve(true);
            });

            newCancelBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                resolve(false);
            });

            // 배경 클릭 시 취소
            const backgroundClickHandler = (e) => {
                if (e.target.id === 'confirm-modal') {
                    modal.style.display = 'none';
                    modal.removeEventListener('click', backgroundClickHandler);
                    resolve(false);
                }
            };
            modal.addEventListener('click', backgroundClickHandler);

            modal.style.display = 'flex';
        });
    }
}
