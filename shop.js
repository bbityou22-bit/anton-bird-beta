const SHOP_SKINS = [
    {
        name: "Free Anton",
        fileName: "Free_Anton-removebg-preview.png",
        cost: 0
    },
    {
        name: "Kitty Anton",
        fileName: "Kitty_Anton-removebg-preview.png",
        cost: 100
    },
    {
        name: "Laughing Anton",
        fileName: "Laughing_Anton-removebg-preview.png",
        cost: 150
    },
    {
        name: "Buck Teeth Anton",
        fileName: "Buck_Teeth_Anton-removebg-preview.png",
        cost: 200
    },
    {
        name: "Baby Anton",
        fileName: "Baby_Anton-removebg-preview.png",
        cost: 250
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const skinsContainer = document.getElementById("skins");

    if (!skinsContainer) {
        console.error("Shop skins container was not found.");
        return;
    }

    createShopCards();
    updateShopButtons();
});

function createShopCards() {
    const skinsContainer = document.getElementById("skins");

    if (!skinsContainer) {
        return;
    }

    skinsContainer.innerHTML = "";

    SHOP_SKINS.forEach((skin) => {
        const skinCard = document.createElement("div");
        skinCard.className = "skin";

        const image = document.createElement("img");
        image.src = `Birds/${skin.fileName}`;
        image.alt = skin.name;

        const name = document.createElement("p");
        name.textContent = skin.name;

        const button = document.createElement("button");
        button.className = "skinButton";
        button.dataset.skin = skin.fileName;
        button.dataset.cost = skin.cost;

        button.addEventListener("click", () => {
            handleSkinButtonClick(skin);
        });

        skinCard.appendChild(image);
        skinCard.appendChild(name);
        skinCard.appendChild(button);

        skinsContainer.appendChild(skinCard);
    });
}

function handleSkinButtonClick(skin) {
    const purchased = isSkinPurchased(skin.fileName);
    const selected = getSelectedSkin() === skin.fileName;

    if (selected) {
        return;
    }

    if (purchased) {
        setSelectedSkin(skin.fileName);
        updateShopButtons();
        return;
    }

    const boughtSuccessfully = purchaseSkin(
        skin.fileName,
        skin.cost
    );

    if (!boughtSuccessfully) {
        showShopMessage("Not enough coins 😭");
        return;
    }

    showShopMessage(`${skin.name} unlocked!`);
    updateShopButtons();
}

function updateShopButtons() {
    const buttons = document.querySelectorAll(".skinButton");

    buttons.forEach((button) => {
        const fileName = button.dataset.skin;
        const cost = Number(button.dataset.cost);

        const purchased = isSkinPurchased(fileName);
        const selected = getSelectedSkin() === fileName;

        button.disabled = false;
        button.classList.remove("selectedSkin");
        button.classList.remove("ownedSkin");

        if (selected) {
            button.textContent = "Selected";
            button.disabled = true;
            button.classList.add("selectedSkin");
            return;
        }

        if (purchased) {
            button.textContent = "Select";
            button.classList.add("ownedSkin");
            return;
        }

        button.textContent = `${cost} Coins`;

        if (getCoins() < cost) {
            button.classList.add("locked");
        } else {
            button.classList.remove("locked");
        }
    });

    updateCoinDisplays();
}

function showShopMessage(message) {
    let messageBox = document.getElementById("shopMessage");

    if (!messageBox) {
        messageBox = document.createElement("div");
        messageBox.id = "shopMessage";
        messageBox.style.position = "fixed";
        messageBox.style.left = "50%";
        messageBox.style.bottom = "40px";
        messageBox.style.transform = "translateX(-50%)";
        messageBox.style.background = "rgba(0, 0, 0, 0.85)";
        messageBox.style.color = "white";
        messageBox.style.padding = "14px 24px";
        messageBox.style.borderRadius = "12px";
        messageBox.style.fontSize = "22px";
        messageBox.style.zIndex = "9999";
        messageBox.style.pointerEvents = "none";
        messageBox.style.opacity = "0";
        messageBox.style.transition = "opacity 0.2s";

        document.body.appendChild(messageBox);
    }

    messageBox.textContent = message;
    messageBox.style.opacity = "1";

    clearTimeout(window.shopMessageTimer);

    window.shopMessageTimer = setTimeout(() => {
        messageBox.style.opacity = "0";
    }, 1800);
}

window.updateShopButtons = updateShopButtons;