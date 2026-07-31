const SAVE_KEY = "antonBirdSave";

const DEFAULT_SAVE = {
    coins: 0,
    unlockedLevel: 1,
    selectedSkin: "Free_Anton-removebg-preview.png",
    purchasedSkins: [
        "Free_Anton-removebg-preview.png"
    ],
    completedLevels: []
};

let gameSave = loadGameSave();

function loadGameSave() {
    const savedData = localStorage.getItem(SAVE_KEY);

    if (!savedData) {
        const freshSave = structuredClone(DEFAULT_SAVE);
        localStorage.setItem(SAVE_KEY, JSON.stringify(freshSave));
        return freshSave;
    }

    try {
        const parsedSave = JSON.parse(savedData);

        return {
            ...structuredClone(DEFAULT_SAVE),
            ...parsedSave,
            purchasedSkins: Array.isArray(parsedSave.purchasedSkins)
                ? parsedSave.purchasedSkins
                : [...DEFAULT_SAVE.purchasedSkins],
            completedLevels: Array.isArray(parsedSave.completedLevels)
                ? parsedSave.completedLevels
                : []
        };
    } catch (error) {
        console.error("Anton Bird save file was corrupted:", error);

        const freshSave = structuredClone(DEFAULT_SAVE);
        localStorage.setItem(SAVE_KEY, JSON.stringify(freshSave));

        return freshSave;
    }
}

function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameSave));
    updateCoinDisplays();
}

function getCoins() {
    return gameSave.coins;
}

function addCoins(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
        return;
    }

    gameSave.coins += Math.floor(amount);
    saveGame();
}

function spendCoins(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
        return false;
    }

    amount = Math.floor(amount);

    if (gameSave.coins < amount) {
        return false;
    }

    gameSave.coins -= amount;
    saveGame();

    return true;
}

function getUnlockedLevel() {
    return gameSave.unlockedLevel;
}

function isLevelUnlocked(levelNumber) {
    return levelNumber <= gameSave.unlockedLevel;
}

function unlockLevel(levelNumber) {
    if (!Number.isInteger(levelNumber)) {
        return;
    }

    if (levelNumber > gameSave.unlockedLevel) {
        gameSave.unlockedLevel = Math.min(levelNumber, 7);
        saveGame();
    }
}

function isLevelCompleted(levelNumber) {
    return gameSave.completedLevels.includes(levelNumber);
}

function completeLevel(levelNumber) {
    if (!Number.isInteger(levelNumber)) {
        return;
    }

    const alreadyCompleted = isLevelCompleted(levelNumber);

    if (!alreadyCompleted) {
        gameSave.completedLevels.push(levelNumber);
        gameSave.coins += 50;
    }

    if (levelNumber < 7) {
        gameSave.unlockedLevel = Math.max(
            gameSave.unlockedLevel,
            levelNumber + 1
        );
    }

    saveGame();
}

function getSelectedSkin() {
    return gameSave.selectedSkin;
}

function setSelectedSkin(fileName) {
    if (!isSkinPurchased(fileName)) {
        return false;
    }

    gameSave.selectedSkin = fileName;
    saveGame();

    return true;
}

function isSkinPurchased(fileName) {
    return gameSave.purchasedSkins.includes(fileName);
}

function purchaseSkin(fileName, cost) {
    if (isSkinPurchased(fileName)) {
        return true;
    }

    if (!spendCoins(cost)) {
        return false;
    }

    gameSave.purchasedSkins.push(fileName);
    gameSave.selectedSkin = fileName;

    saveGame();

    return true;
}

function updateCoinDisplays() {
    const shopCoins = document.getElementById("coinDisplay");
    const hudCoins = document.getElementById("coins");

    if (shopCoins) {
        shopCoins.textContent = `Coins: ${gameSave.coins}`;
    }

    if (hudCoins) {
        hudCoins.textContent = gameSave.coins;
    }
}

function resetSaveData() {
    gameSave = structuredClone(DEFAULT_SAVE);
    saveGame();

    location.reload();
}

window.addEventListener("DOMContentLoaded", () => {
    updateCoinDisplays();
});