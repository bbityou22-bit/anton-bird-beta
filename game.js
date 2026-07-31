class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");

        this.levelNumber = 1;
        this.levelData = null;

        this.lives = 3;
        this.bikesRemaining = 0;

        this.currentBird = null;
        this.slingshotAnchor = null;

        this.isDraggingBird = false;
        this.birdLaunched = false;
        this.roundEnding = false;
        this.levelFinished = false;

        this.blocks = [];
        this.bikes = [];
    }

    init(data) {
        this.levelNumber = data.levelNumber || 1;
        this.levelData = getLevelData(this.levelNumber);

        this.lives = this.levelNumber <= 3 ? 3 : 5;
        this.maxLives = this.lives;
        this.bikesRemaining = this.levelData.bikes.length;

        this.currentBird = null;

        this.isDraggingBird = false;
        this.birdLaunched = false;
        this.roundEnding = false;
        this.levelFinished = false;

        this.blocks = [];
        this.bikes = [];
    }

preload() {
    if (!this.textures.exists("background")) {
        this.load.image(
            "background",
            "./Backgrounds/background.png"
        );
    }

    if (!this.textures.exists("selectedBird")) {
        this.load.image(
            "selectedBird",
            `./Birds/${getSelectedSkin()}`
        );
    }

    const bikeTextureKey = `levelBike_${this.levelNumber}`;

    if (!this.textures.exists(bikeTextureKey)) {
        this.load.image(
            bikeTextureKey,
            `./Bikes/${this.levelData.bikeImage}`
        );
    }

    if (!this.textures.exists("slingshot")) {
        this.load.image(
            "slingshot",
            "./slingshot.png"
        );
    }

    this.load.on("loaderror", (file) => {
        console.error(
            `FAILED TO LOAD: ${file.src}`
        );
    });
}

    create() {
        this.createBackground();
        this.createWorldBounds();
        this.createGround();
        this.createSlingshot();
        this.createTower();
        this.createBikes();
        this.createLevelTitle();

        updateLivesDisplay(this.lives, this.maxLives);

        this.matter.world.on(
            "collisionstart",
            this.handleCollisions,
            this
        );

        this.input.on(
            "pointermove",
            this.dragBird,
            this
        );

        this.input.on(
            "pointerup",
            this.releaseBird,
            this
        );

        this.spawnBird();
    }

    createBackground() {
        const width = this.scale.width;
        const height = this.scale.height;

        const background = this.add.image(
            width / 2,
            height / 2,
            "background"
        );

        background.setDisplaySize(width, height);
        background.setDepth(-20);
    }

    createWorldBounds() {
        const worldWidth = Math.max(
            2600,
            this.scale.width
        );

        const worldHeight = Math.max(
            720,
            this.scale.height
        );

        this.matter.world.setBounds(
            0,
            0,
            worldWidth,
            worldHeight,
            64,
            true,
            true,
            true,
            true
        );

        this.cameras.main.setBounds(
            0,
            0,
            worldWidth,
            worldHeight
        );
    }

    createGround() {
        const groundY = this.scale.height - 55;
        const groundWidth = Math.max(
            2200,
            this.scale.width
        );

        const ground = this.matter.add.rectangle(
            groundWidth / 2,
            groundY,
            groundWidth,
            110,
            {
                isStatic: true,
                friction: 0.9,
                restitution: 0.05,
                label: "ground"
            }
        );

        const groundVisual = this.add.rectangle(
            groundWidth / 2,
            groundY,
            groundWidth,
            110,
            0x5d9b3c
        );

        groundVisual.setDepth(-2);

        ground.gameObject = groundVisual;
    }

createSlingshot() {
    const x = this.levelData.slingshot.x;
    const y = this.levelData.slingshot.y;

    this.slingshotAnchor = { x, y };

    this.add.image(
        x,
        y + 35,
        "slingshot"
    )
    .setOrigin(0.5, 1)
    .setDisplaySize(110, 170)
    .setDepth(4);

    this.backBand = this.add.graphics().setDepth(3);
    this.frontBand = this.add.graphics().setDepth(5);
    this.trajectoryGraphics = this.add.graphics().setDepth(6);
}

    createTower() {
        this.levelData.blocks.forEach((blockData) => {
            this.createBlock(blockData);
        });
    }

    createBlock(blockData) {
        const isStone = blockData.type === "stone";

        const colour = isStone
            ? 0x777777
            : 0xb9783b;

        const density = isStone
            ? 0.008
            : 0.003;

        const health = isStone
            ? 110
            : 55;

        const blockVisual = this.add.rectangle(
            blockData.x,
            blockData.y,
            blockData.width,
            blockData.height,
            colour
        );

        blockVisual.setStrokeStyle(
            3,
            isStone ? 0x444444 : 0x6d421f
        );

        const body = this.matter.add.gameObject(
            blockVisual,
            {
                shape: {
                    type: "rectangle",
                    width: blockData.width,
                    height: blockData.height
                },
                density,
                friction: 0.8,
                frictionAir: 0.01,
                restitution: 0.08,
                label: "block"
            }
        );

        body.setData("health", health);
        body.setData("destroyed", false);
        body.setData("blockType", blockData.type);

        body.setDepth(3);

        this.blocks.push(body);
    }

    createBikes() {
        this.levelData.bikes.forEach((bikeData) => {
            this.createBike(bikeData);
        });

        this.bikesRemaining = this.bikes.length;
    }

    createBike(bikeData) {
        const bike = this.matter.add.image(
            bikeData.x,
            bikeData.y,
            `levelBike_${this.levelNumber}`
        );

        bike.setScale(bikeData.scale || 0.3);
        bike.setDepth(4);

        bike.setBody({
            type: "rectangle",
            width: Math.max(70, bike.displayWidth * 0.9),
            height: Math.max(55, bike.displayHeight * 0.8)
        });

        bike.setDensity(0.003);
        bike.setFriction(0.8);
        bike.setFrictionAir(0.018);
        bike.setBounce(0.12);

        bike.body.label = "bike";

        bike.setData("health", 90);
        bike.setData("destroyed", false);

        this.bikes.push(bike);
    }

    createLevelTitle() {
        const title = this.add.text(
            this.scale.width / 2,
            30,
            `Level ${this.levelNumber}: ${this.levelData.name}`,
            {
                fontFamily: "Arial",
                fontSize: "30px",
                fontStyle: "bold",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 6
            }
        );

        title.setOrigin(0.5, 0);
        title.setScrollFactor(0);
        title.setDepth(20);
    }

    spawnBird() {
        if (this.levelFinished || this.lives <= 0) {
            return;
        }

        const x = this.levelData.birdStart.x;
        const y = this.levelData.birdStart.y;

        this.currentBird = this.matter.add.image(
            x,
            y,
            "selectedBird"
        );

        this.currentBird.setDisplaySize(96, 96);
        this.currentBird.setCircle(40);
        this.currentBird.setDensity(0.015);
        this.currentBird.setFriction(0.7);
        this.currentBird.setFrictionAir(0.007);
        this.currentBird.setBounce(0.25);

        this.currentBird.body.label = "bird";
        this.currentBird.setDepth(5);
        this.currentBird.setInteractive({
            useHandCursor: true
        });

        this.currentBird.setData("launched", false);
        this.currentBird.setData("spent", false);

        this.currentBird.setStatic(false);
        this.currentBird.setIgnoreGravity(true);
        this.currentBird.setVelocity(0, 0);
        this.currentBird.setAngularVelocity(0);
        this.currentBird.setRotation(0);

        this.currentBird.on(
            "pointerdown",
            this.startDraggingBird,
            this
        );

        this.isDraggingBird = false;
        this.birdLaunched = false;
        this.roundEnding = false;
    }

    startDraggingBird(pointer) {
        if (
            !this.currentBird ||
            this.birdLaunched ||
            this.roundEnding
        ) {
            return;
        }

        this.currentBird.setIgnoreGravity(true);
        this.currentBird.setVelocity(0, 0);
        this.currentBird.setAngularVelocity(0);
        this.currentBird.setRotation(0);

        this.isDraggingBird = true;

        if (pointer.event) {
            pointer.event.preventDefault();
        }
    }

    dragBird(pointer) {
        if (
            !this.isDraggingBird ||
            !this.currentBird ||
            this.birdLaunched
        ) {
            return;
        }

        this.currentBird.setVelocity(0, 0);
        this.currentBird.setAngularVelocity(0);
        this.currentBird.setRotation(0);

        const anchorX = this.slingshotAnchor.x;
        const anchorY = this.slingshotAnchor.y;

        let dragX = pointer.worldX;
        let dragY = pointer.worldY;

        const deltaX = dragX - anchorX;
        const deltaY = dragY - anchorY;
        const maxDistance = 180;

        const distance = Math.sqrt(
            deltaX * deltaX +
            deltaY * deltaY
        );

        if (distance > maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);

            dragX =
                anchorX +
                Math.cos(angle) * maxDistance;

            dragY =
                anchorY +
                Math.sin(angle) * maxDistance;
        }

        if (dragX > anchorX + 35) {
            dragX = anchorX + 35;
        }

        this.currentBird.setPosition(
            dragX,
            dragY
        );

        this.drawSlingshotBands();
        this.drawTrajectory();
    }

    releaseBird() {
        if (!this.currentBird || !this.isDraggingBird) {
            return;
        }

        this.isDraggingBird = false;
        this.birdLaunched = true;
        this.currentBird.setData("launched", true);

        const dx =
            this.slingshotAnchor.x -
            this.currentBird.x;

        const dy =
            this.slingshotAnchor.y -
            this.currentBird.y;

        this.currentBird.setStatic(false);
        this.currentBird.setIgnoreGravity(false);
        this.currentBird.setVelocity(
            dx * 0.22,
            dy * 0.22
        );

        this.clearSlingshotBands();
        this.clearTrajectory();

        this.cameras.main.startFollow(
            this.currentBird,
            true,
            0.08,
            0.08
        );

        this.time.delayedCall(450, () => {
            this.checkRoundState();
        });
    }

    drawTrajectory() {
        if (!this.trajectoryGraphics || !this.currentBird || !this.isDraggingBird) {
            return;
        }

        this.trajectoryGraphics.clear();

        const velocityX = (this.slingshotAnchor.x - this.currentBird.x) * 0.22;
        const velocityY = (this.slingshotAnchor.y - this.currentBird.y) * 0.22;
        const gravity = 1.15;

        this.trajectoryGraphics.fillStyle(0xffffff, 0.9);

        for (let i = 1; i <= 15; i++) {
            const t = i * 2.25;
            const x = this.currentBird.x + velocityX * t;
            const y = this.currentBird.y + velocityY * t + 0.5 * gravity * t * t;

            if (x > this.scale.width + 100 || y > this.scale.height + 100) {
                break;
            }

            this.trajectoryGraphics.fillCircle(x, y, 5);
        }
    }

    clearTrajectory() {
        if (this.trajectoryGraphics) {
            this.trajectoryGraphics.clear();
        }
    }

    drawSlingshotBands() {
        if (!this.currentBird) {
            return;
        }

        this.backBand.clear();
        this.frontBand.clear();

        this.backBand.lineStyle(
            10,
            0x4a2412,
            1
        );

        this.backBand.beginPath();
        this.backBand.moveTo(
            this.slingshotAnchor.x - 22,
            this.slingshotAnchor.y - 8
        );

        this.backBand.lineTo(
            this.currentBird.x,
            this.currentBird.y
        );

        this.backBand.strokePath();

        this.frontBand.lineStyle(
            10,
            0x5c2c14,
            1
        );

        this.frontBand.beginPath();
        this.frontBand.moveTo(
            this.currentBird.x,
            this.currentBird.y
        );

        this.frontBand.lineTo(
            this.slingshotAnchor.x + 22,
            this.slingshotAnchor.y - 8
        );

        this.frontBand.strokePath();
    }

    clearSlingshotBands() {
        if (this.backBand) {
            this.backBand.clear();
        }

        if (this.frontBand) {
            this.frontBand.clear();
        }
    }

    handleCollisions(event) {
        event.pairs.forEach((pair) => {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;

            const labelA = bodyA.label;
            const labelB = bodyB.label;

            const gameObjectA = bodyA.gameObject;
            const gameObjectB = bodyB.gameObject;

            const speedA = this.getBodySpeed(bodyA);
            const speedB = this.getBodySpeed(bodyB);

            const impactSpeed = Math.max(
                speedA,
                speedB
            );

            if (
                labelA === "bike" ||
                labelB === "bike"
            ) {
                const bike =
                    labelA === "bike"
                        ? gameObjectA
                        : gameObjectB;

                const otherBody =
                    labelA === "bike"
                        ? bodyB
                        : bodyA;

                this.damageBike(
                    bike,
                    impactSpeed,
                    otherBody.label
                );
            }

            if (
                labelA === "block" ||
                labelB === "block"
            ) {
                const block =
                    labelA === "block"
                        ? gameObjectA
                        : gameObjectB;

                this.damageBlock(
                    block,
                    impactSpeed
                );
            }
        });
    }

    getBodySpeed(body) {
        if (!body || !body.velocity) {
            return 0;
        }

        return Math.sqrt(
            body.velocity.x * body.velocity.x +
            body.velocity.y * body.velocity.y
        );
    }

    damageBike(bike, impactSpeed, sourceLabel) {
        if (
            !bike ||
            !bike.active ||
            bike.getData("destroyed")
        ) {
            return;
        }

        let damage = impactSpeed * 9;

        if (sourceLabel === "bird") {
            damage += 35;
        }

        if (impactSpeed < 2.3) {
            return;
        }

        const health =
            bike.getData("health") - damage;

        bike.setData("health", health);

        bike.setTint(0xff8a8a);

        this.time.delayedCall(90, () => {
            if (
                bike &&
                bike.active &&
                !bike.getData("destroyed")
            ) {
                bike.clearTint();
            }
        });

        if (health <= 0) {
            this.destroyBike(bike);
        }
    }

    destroyBike(bike) {
        if (
            !bike ||
            !bike.active ||
            bike.getData("destroyed")
        ) {
            return;
        }

        bike.setData("destroyed", true);

        this.bikesRemaining--;

        this.tweens.add({
            targets: bike,
            alpha: 0,
            scaleX: bike.scaleX * 0.25,
            scaleY: bike.scaleY * 0.25,
            angle: bike.angle + 180,
            duration: 280,
            onComplete: () => {
                if (bike.active) {
                    bike.destroy();
                }
            }
        });

        if (this.bikesRemaining <= 0) {
            this.finishLevel();
        }
    }

    damageBlock(block, impactSpeed) {
        if (
            !block ||
            !block.active ||
            block.getData("destroyed")
        ) {
            return;
        }

        if (impactSpeed < 4) {
            return;
        }

        const blockType =
            block.getData("blockType");

        const damageMultiplier =
            blockType === "stone"
                ? 3.5
                : 6.5;

        const health =
            block.getData("health") -
            impactSpeed * damageMultiplier;

        block.setData("health", health);

        if (health <= 0) {
            block.setData("destroyed", true);

            this.tweens.add({
                targets: block,
                alpha: 0,
                duration: 180,
                onComplete: () => {
                    if (block.active) {
                        block.destroy();
                    }
                }
            });
        }
    }

    checkRoundState() {
        if (
            this.levelFinished ||
            this.roundEnding ||
            !this.currentBird
        ) {
            return;
        }

        const bird = this.currentBird;

        if (!bird.active) {
            return;
        }

        const speed = Math.sqrt(
            bird.body.velocity.x *
                bird.body.velocity.x +
            bird.body.velocity.y *
                bird.body.velocity.y
        );

        const outsideWorld =
            bird.x < -100 ||
            bird.x > 2550 ||
            bird.y > this.scale.height + 150;

        const stopped =
            speed < 0.35 &&
            this.birdLaunched;

        if (outsideWorld || stopped) {
            this.endBirdTurn();
            return;
        }

        this.time.delayedCall(550, () => {
            this.checkRoundState();
        });
    }

    endBirdTurn() {
        if (
            this.roundEnding ||
            this.levelFinished
        ) {
            return;
        }

        this.roundEnding = true;

        if (
            this.currentBird &&
            this.currentBird.active
        ) {
            this.currentBird.disableInteractive();

            this.tweens.add({
                targets: this.currentBird,
                alpha: 0,
                duration: 220,
                onComplete: () => {
                    if (
                        this.currentBird &&
                        this.currentBird.active
                    ) {
                        this.currentBird.destroy();
                    }
                }
            });
        }

        this.clearSlingshotBands();
        this.clearTrajectory();

        this.cameras.main.stopFollow();
        this.cameras.main.pan(
            this.levelData.slingshot.x,
            this.scale.height / 2,
            400
        );

        if (this.bikesRemaining <= 0) {
            return;
        }

        this.lives--;

        updateLivesDisplay(this.lives, this.maxLives);

        if (this.lives <= 0) {
            this.time.delayedCall(600, () => {
                this.triggerGameOver();
            });

            return;
        }

        this.time.delayedCall(650, () => {
            this.spawnBird();
        });
    }

    finishLevel() {
        if (this.levelFinished) {
            return;
        }

        this.levelFinished = true;
        this.roundEnding = true;

        this.clearSlingshotBands();

        this.time.delayedCall(650, () => {
            const alreadyCompleted =
                isLevelCompleted(
                    this.levelNumber
                );

            completeLevel(
                this.levelNumber
            );

            this.scene.pause();

            showLevelCompleteScreen(
                this.levelNumber,
                alreadyCompleted
            );
        });
    }

    triggerGameOver() {
        if (this.levelFinished) {
            return;
        }

        this.levelFinished = true;
        this.roundEnding = true;

        this.clearSlingshotBands();

        this.scene.pause();

        showGameOver();
    }

    update() {
        if (
            this.currentBird &&
            this.currentBird.active &&
            this.isDraggingBird
        ) {
            this.drawSlingshotBands();
            this.drawTrajectory();
        }

        this.bikes.forEach((bike) => {
            if (
                !bike ||
                !bike.active ||
                bike.getData("destroyed")
            ) {
                return;
            }

            if (
                bike.y >
                this.scale.height + 120
            ) {
                this.destroyBike(bike);
            }
        });

        this.blocks.forEach((block) => {
            if (
                !block ||
                !block.active ||
                block.getData("destroyed")
            ) {
                return;
            }

            if (
                block.y >
                this.scale.height + 180
            ) {
                block.setData(
                    "destroyed",
                    true
                );

                block.destroy();
            }
        });
    }

}

const gameConfig = {
    type: Phaser.AUTO,

    parent: "gameContainer",

    width: 1920,
    height: 720,

    backgroundColor: "#87ceeb",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 720
    },

    physics: {
        default: "matter",

        matter: {
            gravity: {
                y: 1.15
            },

            debug: false,

            enableSleeping: false
        }
    },

    scene: [
        GameScene,
        LevelCreatorScene
    ],

    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false
    }
};

window.antonGame = new Phaser.Game(
    gameConfig
);