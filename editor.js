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
    }

    preload() {
        if (!this.textures.exists("background")) this.load.image("background", "./Backgrounds/background.png");
        if (!this.textures.exists("selectedBird")) this.load.image("selectedBird", `./Birds/${getSelectedSkin()}`);
        if (!this.textures.exists("slingshot")) this.load.image("slingshot", "./slingshot.png");

        const bikes = [
            ["creatorBike_1", "1.5KWEbike.png"],
            ["creatorBike_2", "5kwEbike.png"],
            ["creatorBike_3", "ebox3.0.png"],
            ["creatorBike_4", "tuttio.png"],
            ["creatorBike_5", "surronLBX1.png"],
            ["creatorBike_6", "surronUBX.png"],
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

        window.levelCreatorScene = this;
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (window.levelCreatorScene === this) window.levelCreatorScene = null;
        });
    }

    setTool(tool) {
        if (this.mode !== "edit") return;
        this.selectedTool = tool;
        this.selectObject(null);
        document.querySelectorAll(".creatorTool").forEach(btn => {
            btn.classList.toggle("activeTool", btn.dataset.tool === tool);
        });
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
        if (!this.selectedTool) {
            this.selectObject(null);
            return;
        }
        if (pointer.worldY > this.groundY - 20) return;
        this.placeObject(this.selectedTool, pointer.worldX, pointer.worldY);
    }

    handlePointerMove(pointer) {
        if (this.isPanning) {
            const next = Phaser.Math.Clamp(this.panStartScrollX - (pointer.x - this.panStartX), 0, this.worldWidth - this.scale.width);
            this.cameras.main.scrollX = next;
            return;
        }
        if (this.mode === "play" && this.isDraggingBird && this.currentBird) this.dragBird(pointer);
    }

    handlePointerUp(pointer) {
        if (this.isPanning) {
            this.isPanning = false;
            return;
        }
        if (this.mode === "play" && this.isDraggingBird) this.releaseBird();
    }

    placeObject(tool, x, y) {
        x = Math.max(430, Math.round(x / 10) * 10);
        y = Math.round(y / 10) * 10;
        let object;
        const definitions = {
            woodFlat: { kind: "block", type: "wood", width: 190, height: 30, colour: 0xb9783b, stroke: 0x6d421f },
            woodUpright: { kind: "block", type: "wood", width: 35, height: 190, colour: 0xb9783b, stroke: 0x6d421f },
            stoneFlat: { kind: "block", type: "stone", width: 190, height: 34, colour: 0x777777, stroke: 0x444444 },
            stoneUpright: { kind: "block", type: "stone", width: 40, height: 190, colour: 0x777777, stroke: 0x444444 }
        };

        if (definitions[tool]) {
            const d = definitions[tool];
            object = this.add.rectangle(x, y, d.width, d.height, d.colour).setStrokeStyle(3, d.stroke).setDepth(3);
            object.creatorData = { ...d, tool };
        } else if (tool.startsWith("bike")) {
            const bikeIndex = Number(tool.replace("bike", ""));
            const scales = { 1: 0.28, 2: 0.26, 3: 0.27, 4: 0.27, 5: 0.27, 6: 0.22, 7: 0.09 };
            object = this.add.image(x, y, `creatorBike_${bikeIndex}`).setScale(scales[bikeIndex] || 0.25).setDepth(4);
            object.creatorData = { kind: "bike", bikeIndex, tool, scale: scales[bikeIndex] || 0.25 };
        } else return;

        object.setInteractive({ draggable: true, useHandCursor: true });
        object.on("pointerdown", (pointer) => {
            if (this.mode !== "edit" || pointer.rightButtonDown()) return;
            pointer.event.stopPropagation?.();
            this.selectObject(object);
        });
        this.input.setDraggable(object);
        object.on("drag", (pointer, dragX, dragY) => {
            if (this.mode !== "edit") return;
            object.x = Math.max(430, Math.round(dragX / 10) * 10);
            object.y = Math.min(this.groundY - 15, Math.round(dragY / 10) * 10);
        });
        this.editorObjects.push(object);
        this.selectObject(object);
    }

    selectObject(object) {
        if (this.selectedObject?.active) this.selectedObject.clearTint?.();
        this.selectedObject = object;
        if (object?.active) object.setTint?.(0xffff99);
    }

    deleteSelected() {
        if (this.mode !== "edit" || !this.selectedObject) return;
        const obj = this.selectedObject;
        this.editorObjects = this.editorObjects.filter(item => item !== obj);
        this.selectedObject = null;
        obj.destroy();
    }

    clearLevel() {
        this.returnToEdit();
        this.editorObjects.forEach(obj => obj.destroy());
        this.editorObjects = [];
        this.selectObject(null);
    }

    playLevel() {
        if (this.mode === "play") return;
        this.mode = "play";
        this.selectedTool = null;
        this.selectObject(null);
        document.querySelectorAll(".creatorTool").forEach(btn => btn.classList.remove("activeTool"));
        document.getElementById("creatorPlayButton").textContent = "RESTART LEVEL";
        document.getElementById("creatorEditButton").classList.remove("hidden");

        this.editorObjects.forEach(obj => {
            obj.disableInteractive();
            const d = obj.creatorData;
            if (d.kind === "block") {
                this.matter.add.gameObject(obj, {
                    shape: { type: "rectangle", width: d.width, height: d.height },
                    density: d.type === "stone" ? 0.008 : 0.003,
                    friction: 0.8, frictionAir: 0.01, restitution: 0.08, label: "block"
                });
            } else {
                this.matter.add.gameObject(obj, {
                    shape: { type: "rectangle", width: Math.max(60, obj.displayWidth * 0.88), height: Math.max(45, obj.displayHeight * 0.75) },
                    density: 0.003, friction: 0.8, frictionAir: 0.018, restitution: 0.12, label: "bike"
                });
            }
        });
        this.spawnBird();
    }

    restartPlay() {
        const snapshot = this.editorObjects.map(obj => ({ x: obj.x, y: obj.y, data: { ...obj.creatorData } }));
        this.editorObjects.forEach(obj => obj.destroy());
        this.editorObjects = [];
        if (this.currentBird?.active) this.currentBird.destroy();
        this.clearBands();
        this.cameras.main.stopFollow();
        this.cameras.main.scrollX = 0;
        this.mode = "edit";
        snapshot.forEach(item => this.placeObject(item.data.tool, item.x, item.y));
        this.playLevel();
    }

    returnToEdit() {
        if (this.mode === "edit") return;
        const snapshot = this.editorObjects.map(obj => ({ x: obj.x, y: obj.y, data: { ...obj.creatorData } }));
        this.editorObjects.forEach(obj => obj.destroy());
        this.editorObjects = [];
        if (this.currentBird?.active) this.currentBird.destroy();
        this.currentBird = null;
        this.clearBands();
        this.cameras.main.stopFollow();
        this.cameras.main.scrollX = 0;
        this.mode = "edit";
        snapshot.forEach(item => this.placeObject(item.data.tool, item.x, item.y));
        this.selectObject(null);
        document.getElementById("creatorPlayButton").textContent = "PLAY LEVEL";
        document.getElementById("creatorEditButton").classList.add("hidden");
    }

    spawnBird() {
        if (this.currentBird?.active) this.currentBird.destroy();
        this.currentBird = this.matter.add.image(this.slingshotAnchor.x, this.slingshotAnchor.y, "selectedBird");
        this.currentBird.setDisplaySize(96, 96).setCircle(40).setDensity(0.015).setFriction(0.7).setFrictionAir(0.007).setBounce(0.25);
        this.currentBird.setIgnoreGravity(true).setVelocity(0, 0).setDepth(5).setInteractive({ useHandCursor: true });
        this.currentBird.body.label = "bird";
        this.currentBird.on("pointerdown", (pointer) => {
            if (this.mode !== "play" || this.birdLaunched) return;
            pointer.event.stopPropagation?.();
            this.isDraggingBird = true;
            this.currentBird.setIgnoreGravity(true).setVelocity(0, 0);
        });
        this.isDraggingBird = false;
        this.birdLaunched = false;
    }

    dragBird(pointer) {
        const a = this.slingshotAnchor;
        let dx = pointer.worldX - a.x;
        let dy = pointer.worldY - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 180) { dx = dx / dist * 180; dy = dy / dist * 180; }
        if (dx > 35) dx = 35;
        this.currentBird.setPosition(a.x + dx, a.y + dy).setVelocity(0, 0);
        this.drawBands();
        this.drawTrajectory();
    }

    releaseBird() {
        this.isDraggingBird = false;
        this.birdLaunched = true;
        const dx = this.slingshotAnchor.x - this.currentBird.x;
        const dy = this.slingshotAnchor.y - this.currentBird.y;
        this.currentBird.setIgnoreGravity(false).setVelocity(dx * 0.22, dy * 0.22);
        this.clearBands();
        this.cameras.main.startFollow(this.currentBird, true, 0.09, 0.09);
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
