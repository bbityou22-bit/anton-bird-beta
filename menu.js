const GAME_VERSION = "v1.4 BETA";

let currentLevelNumber = 1;
let isGameRunning = false;

document.addEventListener("DOMContentLoaded", () => {
    const mainMenu = document.getElementById("mainMenu");
    const levelMenu = document.getElementById("levelMenu");
    const shopMenu = document.getElementById("shopMenu");
    const gameOverMenu = document.getElementById("gameOverMenu");
    const updatesMenu = document.getElementById("updatesMenu");
    const roadmapMenu = document.getElementById("roadmapMenu");
    const adminPasswordMenu = document.getElementById("adminPasswordMenu");
    const adminPanelMenu = document.getElementById("adminPanelMenu");
    const hud = document.getElementById("hud");

    const playButton = document.getElementById("playButton");
    const levelsButton = document.getElementById("levelsButton");
    const shopButton = document.getElementById("shopButton");
    const updatesButton = document.getElementById("updatesButton");
    const roadmapButton = document.getElementById("roadmapButton");
    const levelCreatorButton = document.getElementById("levelCreatorButton");
    const levelCreatorUI = document.getElementById("levelCreatorUI");
    const onlineLevelsMenu = document.getElementById("onlineLevelsMenu");
    const onlineLevelsButton = document.getElementById("onlineLevelsButton");
    const backFromOnlineLevels = document.getElementById("backFromOnlineLevels");

    const backFromLevels = document.getElementById("backFromLevels");
    const backFromShop = document.getElementById("backFromShop");
    const backFromUpdates = document.getElementById("backFromUpdates");
    const backFromRoadmap = document.getElementById("backFromRoadmap");

    const retryButton = document.getElementById("retryButton");
    const mainMenuButton = document.getElementById("mainMenuButton");
    const resetButton = document.getElementById("resetButton");
    const levelButtons = document.querySelectorAll(".levelButton");

    const adminPasswordInput = document.getElementById("adminPasswordInput");
    const adminPasswordError = document.getElementById("adminPasswordError");
    const adminLoginButton = document.getElementById("adminLoginButton");
    const adminPasswordCloseButton = document.getElementById("adminPasswordCloseButton");
    const adminPanelCloseButton = document.getElementById("adminPanelCloseButton");
    const adminUnlockSkins = document.getElementById("adminUnlockSkins");
    const adminInfiniteCoins = document.getElementById("adminInfiniteCoins");
    const adminUnlockLevels = document.getElementById("adminUnlockLevels");

    function hideAllMenus() {
        [
            mainMenu,
            levelMenu,
            shopMenu,
            gameOverMenu,
            updatesMenu,
            roadmapMenu,
            adminPasswordMenu,
            adminPanelMenu,
            levelCreatorUI,
            onlineLevelsMenu
        ].forEach((menu) => {
            if (menu) menu.classList.add("hidden");
        });
    }

    function stopCreatorScene() {
        if (!window.antonGame || !window.antonGame.scene) return;
        const scenes = window.antonGame.scene;
        if (scenes.isActive("LevelCreatorScene") || scenes.isPaused("LevelCreatorScene") || scenes.isSleeping("LevelCreatorScene")) {
            scenes.stop("LevelCreatorScene");
        }
    }

    function stopGameScene() {
        if (!window.antonGame || !window.antonGame.scene) return;

        const scenes = window.antonGame.scene;
        if (
            scenes.isActive("GameScene") ||
            scenes.isPaused("GameScene") ||
            scenes.isSleeping("GameScene")
        ) {
            scenes.stop("GameScene");
        }
    }

    function showMainMenu() {
        hideAllMenus();
        mainMenu.classList.remove("hidden");
        hud.classList.add("hidden");
        isGameRunning = false;
        stopGameScene();
        stopCreatorScene();
        updateCoinDisplays();
        updateLevelButtons();
    }

    function showLevelMenu() {
        hideAllMenus();
        levelMenu.classList.remove("hidden");
        hud.classList.add("hidden");
        updateLevelButtons();
    }

    function showShopMenu() {
        hideAllMenus();
        shopMenu.classList.remove("hidden");
        hud.classList.add("hidden");
        updateCoinDisplays();
        if (typeof updateShopButtons === "function") {
            updateShopButtons();
        }
    }

    function showUpdatesMenu() {
        hideAllMenus();
        updatesMenu.classList.remove("hidden");
        hud.classList.add("hidden");
    }

    function showRoadmapMenu() {
        hideAllMenus();
        roadmapMenu.classList.remove("hidden");
        hud.classList.add("hidden");
    }

    function showLevelCreator() {
        hideAllMenus();
        hud.classList.add("hidden");
        stopGameScene();
        stopCreatorScene();
        levelCreatorUI.classList.remove("hidden");
        window.setTimeout(() => window.antonGame.scene.start("LevelCreatorScene"), 50);
    }

    function startLevel(levelNumber) {
        if (!isLevelUnlocked(levelNumber)) return;

        currentLevelNumber = levelNumber;
        isGameRunning = true;

        hideAllMenus();
        hud.classList.remove("hidden");
        updateCoinDisplays();

        const lives = levelNumber <= 3 ? 3 : 5;
        updateLivesDisplay(lives, lives);

        if (!window.antonGame) {
            console.error("Phaser game has not loaded yet.");
            return;
        }

        stopGameScene();

        window.setTimeout(() => {
            window.antonGame.scene.start("GameScene", {
                levelNumber: currentLevelNumber
            });
        }, 50);
    }

    function updateLevelButtons() {
        levelButtons.forEach((button) => {
            const levelNumber = Number(button.dataset.level);
            const unlocked = isLevelUnlocked(levelNumber);
            const completed = isLevelCompleted(levelNumber);

            button.classList.toggle("locked", !unlocked);
            button.disabled = !unlocked;

            if (!unlocked) {
                button.textContent = `Level ${levelNumber} 🔒`;
            } else if (completed) {
                button.textContent = `Level ${levelNumber} ✓`;
            } else {
                button.textContent = `Level ${levelNumber}`;
            }
        });
    }

    function showGameOver() {
        hideAllMenus();
        gameOverMenu.classList.remove("hidden");
        hud.classList.add("hidden");
        isGameRunning = false;

        const sound = document.getElementById("gameOverSound");
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
            sound.play().catch(() => {});
        }
    }

    function retryCurrentLevel() {
        const sound = document.getElementById("gameOverSound");
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
        startLevel(currentLevelNumber);
    }

    function handleLevelComplete(levelNumber) {
        completeLevel(levelNumber);
        isGameRunning = false;
        updateLevelButtons();
        updateCoinDisplays();
        stopGameScene();
        showLevelMenu();
    }

    function openAdminPassword() {
        adminPasswordInput.value = "";
        adminPasswordError.textContent = "";
        adminPasswordMenu.classList.remove("hidden");
        adminPasswordInput.focus();
    }

    function closeAdminMenus() {
        adminPasswordMenu.classList.add("hidden");
        adminPanelMenu.classList.add("hidden");
    }

    function tryAdminLogin() {
        if (adminPasswordInput.value === "antonbird") {
            adminPasswordMenu.classList.add("hidden");
            adminPanelMenu.classList.remove("hidden");
            adminPasswordError.textContent = "";
        } else {
            adminPasswordError.textContent = "Wrong password";
        }
    }

    function showAdminMessage(message) {
        if (typeof showGameMessage === "function") {
            showGameMessage(message, 1800);
        }
    }

    playButton.addEventListener("click", () => startLevel(getUnlockedLevel()));
    levelsButton.addEventListener("click", showLevelMenu);
    shopButton.addEventListener("click", showShopMenu);
    updatesButton.addEventListener("click", showUpdatesMenu);
    roadmapButton.addEventListener("click", showRoadmapMenu);
    levelCreatorButton.addEventListener("click", showLevelCreator);
    onlineLevelsButton?.addEventListener("click", () => { hideAllMenus(); hud.classList.add("hidden"); onlineLevelsMenu.classList.remove("hidden"); window.AntonOnline?.loadLevels("liked"); });
    backFromOnlineLevels?.addEventListener("click", showMainMenu);

    backFromLevels.addEventListener("click", showMainMenu);
    backFromShop.addEventListener("click", showMainMenu);
    backFromUpdates.addEventListener("click", showMainMenu);
    backFromRoadmap.addEventListener("click", showMainMenu);

    retryButton.addEventListener("click", retryCurrentLevel);
    mainMenuButton.addEventListener("click", showMainMenu);

    if (resetButton) {
        resetButton.addEventListener("click", () => {
            if (!confirm("Reset all Anton Bird progress?")) return;
            localStorage.clear();
            location.reload();
        });
    }

    levelButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const levelNumber = Number(button.dataset.level);
            if (Number.isInteger(levelNumber)) startLevel(levelNumber);
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.shiftKey && event.key === "Enter") {
            event.preventDefault();
            openAdminPassword();
        }

        if (event.key === "Escape") {
            closeAdminMenus();
        }
    });

    adminLoginButton.addEventListener("click", tryAdminLogin);
    adminPasswordInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") tryAdminLogin();
    });
    adminPasswordCloseButton.addEventListener("click", closeAdminMenus);
    adminPanelCloseButton.addEventListener("click", closeAdminMenus);

    adminUnlockSkins.addEventListener("click", () => {
        gameSave.purchasedSkins = SHOP_SKINS.map((skin) => skin.fileName);
        saveGame();
        if (typeof updateShopButtons === "function") updateShopButtons();
        showAdminMessage("All skins unlocked");
    });

    adminInfiniteCoins.addEventListener("click", () => {
        gameSave.coins = 999999999;
        saveGame();
        showAdminMessage("Infinite coins enabled");
    });

    adminUnlockLevels.addEventListener("click", () => {
        gameSave.unlockedLevel = TOTAL_LEVELS;
        saveGame();
        updateLevelButtons();
        showAdminMessage("All levels unlocked");
    });

    document.querySelectorAll(".creatorTool").forEach((button) => {
        button.addEventListener("click", () => window.levelCreatorScene?.setTool(button.dataset.tool));
    });
    document.getElementById("creatorPlayButton").addEventListener("click", () => {
        const scene = window.levelCreatorScene;
        if (!scene) return;
        scene.mode === "play" ? scene.restartPlay() : scene.playLevel();
    });
    document.getElementById("creatorEditButton").addEventListener("click", () => window.levelCreatorScene?.returnToEdit());
    document.getElementById("creatorLivesSelect").addEventListener("change", (event) => {
        window.levelCreatorScene?.setLives(event.target.value);
    });
    document.getElementById("creatorClearButton").addEventListener("click", () => {
        if (confirm("Clear every object from this custom level?")) window.levelCreatorScene?.clearLevel();
    });
    document.getElementById("creatorDeleteButton").addEventListener("click", () => window.levelCreatorScene?.deleteSelected());
    document.getElementById("creatorExitButton").addEventListener("click", showMainMenu);

    window.showMainMenu = showMainMenu;
    window.showLevelCreator = showLevelCreator;
    window.showLevelMenu = showLevelMenu;
    window.showShopMenu = showShopMenu;
    window.startLevel = startLevel;
    window.showGameOver = showGameOver;
    window.handleLevelComplete = handleLevelComplete;

    updateLevelButtons();
    updateCoinDisplays();
});
