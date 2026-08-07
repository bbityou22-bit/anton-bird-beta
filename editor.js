class LevelCreatorScene extends Phaser.Scene {
    constructor() {
        super("LevelCreatorScene");
        this.worldWidth = 5000;
        this.groundY = 665;
        this.slingshotAnchor = { x: 260, y: 455 };
        this.editorObjects = [];
        this.selectedTool = null;
        this.selectedObject = null;
        this.mode = "edit";
        this.currentBird = null;
        this.isDraggingBird = false;
        this.birdLaunched = false;
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartScrollX = 0;
        this.savedLayout = [];
        this.lives = 3;
        this.maximumLives = 3;
        this.roundEnding = false;
        this.bikesRemaining = 0;
        this.resultText = null;
        this.resizeHandle = null;
        this.onlinePlayOnly = false;
    }

    preload() {
        if (!this.textures.exists("background")) this.load.image("background", "./Backgrounds/background.png");
        if (!this.textures.exists("selectedBird")) this.load.image("selectedBird", `./Birds/${getSelectedSkin()}`);
        if (!this.textures.exists("slingshot")) this.load.image("slingshot", "./slingshot.png");

        const bikes = [
            ["creatorBike_1", "1.5KWEbike.png"], ["creatorBike_2", "5kwEbike.png"],
            ["creatorBike_3", "ebox3.0.png"], ["creatorBike_4", "tuttio.png"],
            ["creatorBike_5", "surronLBX1.png"], ["creatorBike_6", "surronUBX.png"],
            ["creatorBike_7", "StarkVarg.png"]
        ];
        bikes.forEach(([key, file]) => {
            if (!this.textures.exists(key)) this.load.image(key, `./Bikes/${file}`);
        });
    }

    create() {
        this.cameras.main.setBounds(0, 0, this.worldWidth, 720);
        this.matter.world.setBounds(0, 0, this.worldWidth, 720, 64, true, true, true, true);

        for (let x = 0; x < this.worldWidth; x += 1920) {
            this.add.image(x + 960, 360, "background").setDisplaySize(1920, 720).setDepth(-20);
        }

        this.groundBody = this.matter.add.rectangle(this.worldWidth / 2, this.groundY, this.worldWidth, 110, {
            isStatic: true, friction: 0.9, restitution: 0.05, label: "ground"
        });
        this.add.rectangle(this.worldWidth / 2, this.groundY, this.worldWidth, 110, 0x5d9b3c).setDepth(-2);

        this.add.image(this.slingshotAnchor.x, this.slingshotAnchor.y + 35, "slingshot")
            .setOrigin(0.5, 1).setDisplaySize(110, 170).setDepth(4);
        this.backBand = this.add.graphics().setDepth(3);
        this.frontBand = this.add.graphics().setDepth(5);
        this.trajectoryGraphics = this.add.graphics().setDepth(6);

        this.input.mouse.disableContextMenu();
        this.input.on("pointerdown", this.handlePointerDown, this);
        this.input.on("pointermove", this.handlePointerMove, this);
        this.input.on("pointerup", this.handlePointerUp, this);
        this.input.keyboard.on("keydown-DELETE", () => this.deleteSelected());
        this.input.keyboard.on("keydown-BACKSPACE", () => this.deleteSelected());
        this.matter.world.on("collisionstart", this.handleCollisions, this);

        window.levelCreatorScene = this;
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.matter.world.off("collisionstart", this.handleCollisions, this);
            if (window.levelCreatorScene === this) window.levelCreatorScene = null;
        });
        this.updateCreatorLivesDisplay();
        if (window.pendingOnlineLevel) {
            const pending = window.pendingOnlineLevel; window.pendingOnlineLevel = null;
            this.time.delayedCall(80, () => this.loadPublishedLevel(pending));
        }
    }

    update() {
        if (this.mode !== "play" || !this.birdLaunched || !this.currentBird?.active || this.roundEnding) return;
        const velocity = this.currentBird.body?.velocity || { x: 0, y: 0 };
        const speed = Math.hypot(velocity.x, velocity.y);
        const outOfBounds = this.currentBird.y > 760 || this.currentBird.x > this.worldWidth + 100 || this.currentBird.x < -100;
        const launchedFor = this.time.now - (this.launchTime || this.time.now);
        if (outOfBounds || (launchedFor > 2500 && speed < 0.65)) this.endBirdTurn();
    }

    setTool(tool) {
        if (this.onlinePlayOnly || this.mode !== "edit") return;
        this.selectedTool = tool;
        this.selectObject(null);
        document.querySelectorAll(".creatorTool").forEach(btn => btn.classList.toggle("activeTool", btn.dataset.tool === tool));
    }

    setLives(value) {
        if (this.onlinePlayOnly) return;
        const parsed = Number(value) === 5 ? 5 : 3;
        this.maximumLives = parsed;
        this.lives = parsed;
        this.updateCreatorLivesDisplay();
    }

    updateCreatorLivesDisplay() {
        const display = document.getElementById("creatorLivesDisplay");
        if (display) display.textContent = "❤️".repeat(Math.max(0, this.lives));
        const playDisplay = document.getElementById("creatorPlayLives");
        if (playDisplay) playDisplay.textContent = "❤️".repeat(Math.max(0, this.lives));
    }

    handlePointerDown(pointer, currentlyOver) {
        if (pointer.rightButtonDown()) {
            this.isPanning = true;
            this.panStartX = pointer.x;
            this.panStartScrollX = this.cameras.main.scrollX;
            return;
        }
        if (this.mode === "play") return;
        if (currentlyOver && currentlyOver.length) return;
        if (!this.selectedTool) { this.selectObject(null); return; }
        if (pointer.worldY > this.groundY - 20) return;
        this.placeObject(this.selectedTool, pointer.worldX, pointer.worldY);
    }

    handlePointerMove(pointer) {
        if (this.isPanning) {
            this.cameras.main.scrollX = Phaser.Math.Clamp(this.panStartScrollX - (pointer.x - this.panStartX), 0, this.worldWidth - this.scale.width);
            return;
        }
        if (this.mode === "play" && this.isDraggingBird && this.currentBird) this.dragBird(pointer);
    }

    handlePointerUp() {
        if (this.isPanning) { this.isPanning = false; return; }
        if (this.mode === "play" && this.isDraggingBird) this.releaseBird();
    }

    getDefinition(tool) {
        const definitions = {
            woodFlat: { kind: "block", type: "wood", width: 190, height: 30, colour: 0xb9783b, stroke: 0x6d421f },
            woodUpright: { kind: "block", type: "wood", width: 35, height: 190, colour: 0xb9783b, stroke: 0x6d421f },
            stoneFlat: { kind: "block", type: "stone", width: 190, height: 34, colour: 0x777777, stroke: 0x444444 },
            stoneUpright: { kind: "block", type: "stone", width: 40, height: 190, colour: 0x777777, stroke: 0x444444 }
        };
        return definitions[tool] || null;
    }

    placeObject(tool, x, y, angle = 0) {
        x = Math.max(430, Math.round(x / 10) * 10);
        y = Math.round(y / 10) * 10;
        let object;
        const d = this.getDefinition(tool);
        if (d) {
            object = this.add.rectangle(x, y, d.width, d.height, d.colour).setStrokeStyle(3, d.stroke).setDepth(3);
            object.creatorData = { ...d, tool };
        } else if (tool.startsWith("bike")) {
            const bikeIndex = Number(tool.replace("bike", ""));
            const scales = { 1: 0.28, 2: 0.26, 3: 0.27, 4: 0.27, 5: 0.27, 6: 0.22, 7: 0.09 };
            object = this.add.image(x, y, `creatorBike_${bikeIndex}`).setScale(scales[bikeIndex] || 0.25).setDepth(4);
            object.creatorData = { kind: "bike", bikeIndex, tool, scale: scales[bikeIndex] || 0.25 };
        } else return null;

        object.setAngle(angle || 0);
        object.setInteractive({ draggable: true, useHandCursor: true });
        object.on("pointerdown", pointer => {
            if (this.mode !== "edit" || pointer.rightButtonDown()) return;
            pointer.event.stopPropagation?.();
            this.selectObject(object);
        });
        this.input.setDraggable(object);
        object.on("drag", (pointer, dragX, dragY) => {
            if (this.mode !== "edit") return;
            object.x = Math.max(430, Math.round(dragX / 10) * 10);
            object.y = Math.min(this.groundY - 15, Math.round(dragY / 10) * 10);
            this.updateResizeHandle();
        });
        this.editorObjects.push(object);
        this.selectObject(object);
        return object;
    }

    captureLayout() {
        return this.editorObjects.filter(obj => obj?.active).map(obj => ({
            tool: obj.creatorData.tool, x: obj.x, y: obj.y, angle: obj.angle || 0, width: obj.creatorData.width, height: obj.creatorData.height
        }));
    }

    rebuildLayout(layout, makePhysics = false) {
        this.editorObjects.forEach(obj => { if (obj?.active) obj.destroy(); });
        this.editorObjects = [];
        layout.forEach(item => {
            const obj = this.placeObject(item.tool, item.x, item.y, item.angle);
            if (obj && obj.creatorData.kind === "block" && item.width && item.height) {
                obj.creatorData.width = item.width; obj.creatorData.height = item.height;
                obj.setDisplaySize(item.width, item.height);
            }
        });
        if (makePhysics) this.enableLevelPhysics();
        else this.selectObject(null);
    }

    selectObject(object) {
        if (this.selectedObject?.active) this.selectedObject.clearTint?.();
        this.selectedObject = object;
        if (object?.active) object.setTint?.(0xffff99);
        this.refreshResizeHandle();
    }

    refreshResizeHandle() {
        if (this.resizeHandle?.active) this.resizeHandle.destroy();
        this.resizeHandle = null;
        const obj = this.selectedObject;
        if (this.mode !== "edit" || !obj?.active || obj.creatorData?.kind !== "block") return;
        this.resizeHandle = this.add.circle(0, 0, 10, 0xffffff).setStrokeStyle(3, 0x111111).setDepth(20).setInteractive({ draggable: true, useHandCursor: true });
        this.input.setDraggable(this.resizeHandle);
        this.updateResizeHandle();
        this.resizeHandle.on("drag", (pointer) => {
            if (!obj.active || this.mode !== "edit") return;
            const localX = Math.abs(pointer.worldX - obj.x) * 2;
            const localY = Math.abs(pointer.worldY - obj.y) * 2;
            const horizontal = obj.creatorData.width >= obj.creatorData.height;
            const minLong = 70, maxLong = 420, minShort = 24, maxShort = 90;
            let w = horizontal ? Phaser.Math.Clamp(localX, minLong, maxLong) : Phaser.Math.Clamp(localX, minShort, maxShort);
            let h = horizontal ? Phaser.Math.Clamp(localY, minShort, maxShort) : Phaser.Math.Clamp(localY, minLong, maxLong);
            obj.creatorData.width = Math.round(w); obj.creatorData.height = Math.round(h);
            obj.setDisplaySize(obj.creatorData.width, obj.creatorData.height);
            this.updateResizeHandle();
        });
    }

    updateResizeHandle() {
        const obj = this.selectedObject;
        if (!this.resizeHandle?.active || !obj?.active) return;
        this.resizeHandle.setPosition(obj.x + obj.displayWidth / 2, obj.y + obj.displayHeight / 2);
    }

    deleteSelected() {
        if (this.onlinePlayOnly || this.mode !== "edit" || !this.selectedObject) return;
        const obj = this.selectedObject;
        this.editorObjects = this.editorObjects.filter(item => item !== obj);
        this.selectedObject = null;
        obj.destroy();
    }

    clearLevel() {
        if (this.onlinePlayOnly) return;
        this.returnToEdit();
        this.editorObjects.forEach(obj => obj.destroy());
        this.editorObjects = [];
        this.savedLayout = [];
        this.selectObject(null);
    }

    playLevel() {
        if (this.mode === "play") return;
        this.savedLayout = this.captureLayout();
        this.maximumLives = Number(document.getElementById("creatorLivesSelect")?.value) === 5 ? 5 : 3;
        this.lives = this.maximumLives;
        this.startPlayFromSavedLayout();
    }

    startPlayFromSavedLayout() {
        this.mode = "play";
        this.roundEnding = false;
        this.selectedTool = null;
        this.selectObject(null);

        if (this.resizeHandle?.active) {
            this.resizeHandle.destroy();
        }
        this.resizeHandle = null;

        this.resultText?.destroy();
        this.resultText = null;

        document.querySelectorAll(".creatorTool").forEach(btn => {
            btn.classList.remove("activeTool");
        });

        const playButton = document.getElementById("creatorPlayButton");
        const editButton = document.getElementById("creatorEditButton");
        const palette = document.getElementById("creatorPalette");
        const publishButton = document.getElementById("creatorPublishButton");
        const clearButton = document.getElementById("creatorClearButton");
        const levelName = document.getElementById("creatorLevelName");

        if (playButton) {
            playButton.textContent = "RESTART LEVEL";
            playButton.classList.remove("hidden");
        }

        if (palette) {
            palette.classList.add("hidden");
        }

        if (this.onlinePlayOnly) {
            // Published online levels are play-only.
            if (editButton) editButton.classList.add("hidden");
            if (publishButton) publishButton.classList.add("hidden");
            if (clearButton) clearButton.classList.add("hidden");
            if (levelName) {
                levelName.disabled = true;
                levelName.classList.add("onlineLevelReadOnly");
            }
        } else {
            if (editButton) editButton.classList.remove("hidden");
            if (publishButton) publishButton.classList.remove("hidden");
            if (clearButton) clearButton.classList.remove("hidden");
            if (levelName) {
                levelName.disabled = false;
                levelName.classList.remove("onlineLevelReadOnly");
            }
        }

        this.cameras.main.stopFollow();
        this.cameras.main.scrollX = 0;

        if (this.currentBird?.active) {
            this.currentBird.destroy();
        }

        this.currentBird = null;
        this.clearBands();
        this.rebuildLayout(this.savedLayout, true);
        this.updateCreatorLivesDisplay();
        this.spawnBird();
    }

    enableLevelPhysics() {
        this.bikesRemaining = 0;
        this.editorObjects.forEach(obj => {
            obj.disableInteractive();
            const d = obj.creatorData;
            if (d.kind === "block") {
                this.matter.add.gameObject(obj, {
                    shape: { type: "rectangle", width: d.width, height: d.height },
                    density: d.type === "stone" ? 0.008 : 0.003,
                    friction: 0.8, frictionAir: 0.01, restitution: 0.08, label: "block"
                });
                obj.setData("health", d.type === "stone" ? 110 : 55);
                obj.setData("destroyed", false);
                obj.setData("blockType", d.type);
            } else {
                this.matter.add.gameObject(obj, {
                    shape: { type: "rectangle", width: Math.max(60, obj.displayWidth * 0.88), height: Math.max(45, obj.displayHeight * 0.75) },
                    density: 0.003, friction: 0.8, frictionAir: 0.018, restitution: 0.12, label: "bike"
                });
                obj.setData("health", 90);
                obj.setData("destroyed", false);
                this.bikesRemaining++;
            }
        });
    }

    restartPlay() {
        if (!this.savedLayout.length && this.editorObjects.length) this.savedLayout = this.captureLayout();
        this.lives = this.maximumLives;
        this.startPlayFromSavedLayout();
    }

    returnToEdit() {
        if (this.onlinePlayOnly) {
            return;
        }

        const palette = document.getElementById("creatorPalette");
        const publishButton = document.getElementById("creatorPublishButton");
        const clearButton = document.getElementById("creatorClearButton");
        const levelName = document.getElementById("creatorLevelName");

        if (palette) palette.classList.remove("hidden");
        if (publishButton) publishButton.classList.remove("hidden");
        if (clearButton) clearButton.classList.remove("hidden");

        if (levelName) {
            levelName.disabled = false;
            levelName.classList.remove("onlineLevelReadOnly");
        }

        const layout = this.savedLayout.length ? this.savedLayout : this.captureLayout();

        if (this.currentBird?.active) {
            this.currentBird.destroy();
        }

        this.currentBird = null;
        this.clearBands();
        this.cameras.main.stopFollow();
        this.cameras.main.scrollX = 0;
        this.mode = "edit";
        this.roundEnding = false;

        this.resultText?.destroy();
        this.resultText = null;

        this.rebuildLayout(layout, false);

        const playButton = document.getElementById("creatorPlayButton");
        const editButton = document.getElementById("creatorEditButton");

        if (playButton) playButton.textContent = "PLAY LEVEL";
        if (editButton) editButton.classList.add("hidden");
    }

    spawnBird() {
        if (this.currentBird?.active) this.currentBird.destroy();
        if (this.lives <= 0) { this.showResult("GAME OVER"); return; }
        this.currentBird = this.matter.add.image(this.slingshotAnchor.x, this.slingshotAnchor.y, "selectedBird");
        this.currentBird.setDisplaySize(96, 96).setCircle(40).setDensity(0.015).setFriction(0.7).setFrictionAir(0.007).setBounce(0.25);
        this.currentBird.setIgnoreGravity(true).setVelocity(0, 0).setDepth(5).setInteractive({ useHandCursor: true });
        this.currentBird.body.label = "bird";
        this.currentBird.on("pointerdown", pointer => {
            if (this.mode !== "play" || this.birdLaunched || this.roundEnding) return;
            pointer.event.stopPropagation?.();
            this.isDraggingBird = true;
            this.currentBird.setIgnoreGravity(true).setVelocity(0, 0);
        });
        this.isDraggingBird = false;
        this.birdLaunched = false;
        this.roundEnding = false;
    }

    dragBird(pointer) {
        const a = this.slingshotAnchor;
        let dx = pointer.worldX - a.x, dy = pointer.worldY - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 180) { dx = dx / dist * 180; dy = dy / dist * 180; }
        if (dx > 35) dx = 35;
        this.currentBird.setPosition(a.x + dx, a.y + dy).setVelocity(0, 0);
        this.drawBands(); this.drawTrajectory();
    }

    releaseBird() {
        if (!this.currentBird) return;
        this.isDraggingBird = false;
        this.birdLaunched = true;
        this.launchTime = this.time.now;
        const dx = this.slingshotAnchor.x - this.currentBird.x;
        const dy = this.slingshotAnchor.y - this.currentBird.y;
        this.currentBird.setIgnoreGravity(false).setVelocity(dx * 0.22, dy * 0.22);
        this.clearBands();
        this.cameras.main.startFollow(this.currentBird, true, 0.09, 0.09);
    }

    endBirdTurn() {
        if (this.roundEnding || this.mode !== "play") return;
        this.roundEnding = true;
        this.cameras.main.stopFollow();
        this.time.delayedCall(650, () => {
            if (this.currentBird?.active) this.currentBird.destroy();
            this.currentBird = null;
            this.lives--;
            this.updateCreatorLivesDisplay();
            if (this.bikesRemaining <= 0) this.showResult("LEVEL COMPLETE!");
            else if (this.lives > 0) { this.cameras.main.scrollX = 0; this.spawnBird(); }
            else this.showResult("GAME OVER");
        });
    }

    showResult(message) {
        this.roundEnding = true;
        this.cameras.main.stopFollow();
        this.resultText?.destroy();
        this.resultText = this.add.text(this.scale.width / 2, 130, message, {
            fontFamily: "Arial", fontSize: "54px", fontStyle: "bold", color: "#ffffff",
            stroke: "#000000", strokeThickness: 8, align: "center"
        }).setOrigin(0.5).setScrollFactor(0).setDepth(50);
    }

    handleCollisions(event) {
        if (this.mode !== "play") return;
        event.pairs.forEach(pair => {
            const a = pair.bodyA, b = pair.bodyB;
            const impactSpeed = Math.max(this.getBodySpeed(a), this.getBodySpeed(b));
            if (a.label === "bike" || b.label === "bike") {
                const bike = a.label === "bike" ? a.gameObject : b.gameObject;
                const other = a.label === "bike" ? b : a;
                this.damageBike(bike, impactSpeed, other.label);
            }
            if (a.label === "block" || b.label === "block") {
                this.damageBlock(a.label === "block" ? a.gameObject : b.gameObject, impactSpeed);
            }
        });
    }

    getBodySpeed(body) {
        if (!body?.velocity) return 0;
        return Math.hypot(body.velocity.x, body.velocity.y);
    }

    damageBike(bike, impactSpeed, sourceLabel) {
        if (!bike?.active || bike.getData("destroyed") || impactSpeed < 2.3) return;
        let damage = impactSpeed * 9;
        if (sourceLabel === "bird") damage += 35;
        const health = bike.getData("health") - damage;
        bike.setData("health", health).setTint(0xff8a8a);
        this.time.delayedCall(90, () => { if (bike?.active && !bike.getData("destroyed")) bike.clearTint(); });
        if (health <= 0) this.destroyBike(bike);
    }

    destroyBike(bike) {
        if (!bike?.active || bike.getData("destroyed")) return;
        bike.setData("destroyed", true);
        this.bikesRemaining = Math.max(0, this.bikesRemaining - 1);
        this.tweens.add({
            targets: bike, alpha: 0, scaleX: bike.scaleX * 0.25, scaleY: bike.scaleY * 0.25,
            angle: bike.angle + 180, duration: 280,
            onComplete: () => { if (bike.active) bike.destroy(); }
        });
        if (this.bikesRemaining <= 0) this.time.delayedCall(350, () => this.showResult("LEVEL COMPLETE!"));
    }

    damageBlock(block, impactSpeed) {
        if (!block?.active || block.getData("destroyed") || impactSpeed < 4) return;
        const multiplier = block.getData("blockType") === "stone" ? 3.5 : 6.5;
        const health = block.getData("health") - impactSpeed * multiplier;
        block.setData("health", health);
        if (health <= 0) {
            block.setData("destroyed", true);
            this.tweens.add({ targets: block, alpha: 0, duration: 180, onComplete: () => { if (block.active) block.destroy(); } });
        }
    }


    getPublishData() {
        const layout = this.mode === "play" && this.savedLayout.length ? this.savedLayout : this.captureLayout();
        return {
            name: (document.getElementById("creatorLevelName")?.value || "Untitled Level").trim().slice(0, 40) || "Untitled Level",
            lives: Number(document.getElementById("creatorLivesSelect")?.value) === 5 ? 5 : 3,
            layout
        };
    }

    loadPublishedLevel(level) {
        this.onlinePlayOnly = true;

        const levelName = document.getElementById("creatorLevelName");
        const livesSelect = document.getElementById("creatorLivesSelect");
        const palette = document.getElementById("creatorPalette");
        const editButton = document.getElementById("creatorEditButton");
        const publishButton = document.getElementById("creatorPublishButton");
        const clearButton = document.getElementById("creatorClearButton");

        if (levelName) {
            levelName.value = level.name || "Online Level";
            levelName.disabled = true;
            levelName.classList.add("onlineLevelReadOnly");
        }

        const lives = Number(level.lives) === 5 ? 5 : 3;

        if (livesSelect) {
            livesSelect.value = String(lives);
            livesSelect.disabled = true;
        }

        if (palette) palette.classList.add("hidden");
        if (editButton) editButton.classList.add("hidden");
        if (publishButton) publishButton.classList.add("hidden");
        if (clearButton) clearButton.classList.add("hidden");

        this.maximumLives = lives;
        this.lives = lives;
        this.savedLayout = Array.isArray(level.layout)
            ? level.layout.map(item => ({ ...item }))
            : [];

        this.startPlayFromSavedLayout();
    }

    drawBands() {
        const a = this.slingshotAnchor, b = this.currentBird;
        this.backBand.clear().lineStyle(10, 0x4a2412).lineBetween(a.x - 22, a.y - 8, b.x, b.y);
        this.frontBand.clear().lineStyle(10, 0x5c2c14).lineBetween(b.x, b.y, a.x + 22, a.y - 8);
    }

    drawTrajectory() {
        this.trajectoryGraphics.clear().fillStyle(0xffffff, 0.9);
        const vx = (this.slingshotAnchor.x - this.currentBird.x) * 0.22;
        const vy = (this.slingshotAnchor.y - this.currentBird.y) * 0.22;
        for (let i = 1; i <= 15; i++) {
            const t = i * 2.25;
            this.trajectoryGraphics.fillCircle(this.currentBird.x + vx * t, this.currentBird.y + vy * t + 0.575 * t * t, 5);
        }
    }

    clearBands() {
        this.backBand?.clear(); this.frontBand?.clear(); this.trajectoryGraphics?.clear();
    }
}
