function updateLivesDisplay(lives, maximumLives = null) {
    const livesHUD = document.getElementById("livesHUD");

    if (!livesHUD) {
        return;
    }

    const maxLives = maximumLives || (window.currentLevelNumber > 3 ? 5 : 3);
    const safeLives = Math.max(0, Math.min(maxLives, lives));

    livesHUD.textContent =
        "❤️".repeat(safeLives) +
        "🖤".repeat(maxLives - safeLives);
}

function showLevelCompleteScreen(levelNumber) {
    let completeScreen = document.getElementById("levelCompleteScreen");

    if (!completeScreen) {
        completeScreen = document.createElement("div");
        completeScreen.id = "levelCompleteScreen";
        completeScreen.className = "menu hidden";

        completeScreen.innerHTML = `
            <h1>LEVEL COMPLETE</h1>
            <p id="levelCompleteText">You earned 50 coins!</p>

            <button id="nextLevelButton">
                Next Level
            </button>

            <button id="levelSelectButton">
                Level Select
            </button>

            <button id="completeMainMenuButton">
                Main Menu
            </button>
        `;

        document.body.appendChild(completeScreen);

        document
            .getElementById("nextLevelButton")
            .addEventListener("click", () => {
                const currentLevel = Number(
                    completeScreen.dataset.level
                );

                hideLevelCompleteScreen();

                if (currentLevel < 7) {
                    startLevel(currentLevel + 1);
                } else {
                    showLevelMenu();
                }
            });

        document
            .getElementById("levelSelectButton")
            .addEventListener("click", () => {
                hideLevelCompleteScreen();
                showLevelMenu();
            });

        document
            .getElementById("completeMainMenuButton")
            .addEventListener("click", () => {
                hideLevelCompleteScreen();
                showMainMenu();
            });
    }

    completeScreen.dataset.level = levelNumber;

    const nextButton =
        document.getElementById("nextLevelButton");

    const levelCompleteText =
        document.getElementById("levelCompleteText");

    if (isLevelCompleted(levelNumber)) {
        levelCompleteText.textContent =
            "Level completed!";
    } else {
        levelCompleteText.textContent =
            "You earned 50 coins!";
    }

    if (levelNumber >= 7) {
        nextButton.textContent = "All Levels Complete";
    } else {
        nextButton.textContent = "Next Level";
    }

    completeScreen.classList.remove("hidden");

    const hud = document.getElementById("hud");

    if (hud) {
        hud.classList.add("hidden");
    }
}

function hideLevelCompleteScreen() {
    const completeScreen =
        document.getElementById("levelCompleteScreen");

    if (completeScreen) {
        completeScreen.classList.add("hidden");
    }
}

function showGameMessage(message, duration = 1600) {
    let messageBox = document.getElementById("gameMessage");

    if (!messageBox) {
        messageBox = document.createElement("div");
        messageBox.id = "gameMessage";

        messageBox.style.position = "fixed";
        messageBox.style.left = "50%";
        messageBox.style.top = "100px";
        messageBox.style.transform = "translateX(-50%)";
        messageBox.style.background = "rgba(0, 0, 0, 0.8)";
        messageBox.style.color = "white";
        messageBox.style.padding = "14px 24px";
        messageBox.style.borderRadius = "12px";
        messageBox.style.fontSize = "24px";
        messageBox.style.fontWeight = "bold";
        messageBox.style.zIndex = "9999";
        messageBox.style.pointerEvents = "none";
        messageBox.style.opacity = "0";
        messageBox.style.transition = "opacity 0.2s";

        document.body.appendChild(messageBox);
    }

    messageBox.textContent = message;
    messageBox.style.opacity = "1";

    clearTimeout(window.gameMessageTimer);

    window.gameMessageTimer = setTimeout(() => {
        messageBox.style.opacity = "0";
    }, duration);
}

function setHUDVisible(visible) {
    const hud = document.getElementById("hud");

    if (!hud) {
        return;
    }

    hud.classList.toggle("hidden", !visible);
}

function resetHUD() {
    updateLivesDisplay(3);
    updateCoinDisplays();
    setHUDVisible(true);
}

window.updateLivesDisplay = updateLivesDisplay;
window.showLevelCompleteScreen = showLevelCompleteScreen;
window.hideLevelCompleteScreen = hideLevelCompleteScreen;
window.showGameMessage = showGameMessage;
window.setHUDVisible = setHUDVisible;
window.resetHUD = resetHUD;