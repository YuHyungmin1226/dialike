/**
 * diaLike - Monolithic Game Controller (Self-Contained & Portable)
 * Combines Camera, Map, Player, Monsters, Audio Synth, and Loop Engine.
 */

// ==========================================
// 1. SOUND SYNTHESIS ENGINE (Web Audio API)
// ==========================================
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterVolume = null;
    }

    init() {
        if (this.ctx) return;
        try {
            // @ts-ignore
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.masterVolume = this.ctx.createGain();
            this.masterVolume.gain.setValueAtTime(0.2, this.ctx.currentTime);
            this.masterVolume.connect(this.ctx.destination);
        } catch (e) {
            console.warn("Web Audio API is not supported in this browser.", e);
        }
    }

    playSlash() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.masterVolume);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.16);
    }

    playHit() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.masterVolume);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.13);
    }

    playFireball() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.masterVolume);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
    }

    playPotion() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [200, 300, 450, 600];
        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + index * 0.06);
            gain.gain.setValueAtTime(0, now + index * 0.06);
            gain.gain.linearRampToValueAtTime(0.2, now + index * 0.06 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.08);
            osc.connect(gain);
            gain.connect(this.masterVolume);
            osc.start(now + index * 0.06);
            osc.stop(now + index * 0.06 + 0.1);
        });
    }

    playMonsterDeath() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(this.masterVolume);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.45);
    }

    playLevelUp() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + index * 0.12);
            gain.gain.setValueAtTime(0, now + index * 0.12);
            gain.gain.linearRampToValueAtTime(0.25, now + index * 0.12 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.12 + 0.35);
            osc.connect(gain);
            gain.connect(this.masterVolume);
            osc.start(now + index * 0.12);
            osc.stop(now + index * 0.12 + 0.4);
        });

        setTimeout(() => {
            const finalOsc = this.ctx.createOscillator();
            const finalGain = this.ctx.createGain();
            finalOsc.type = 'sine';
            finalOsc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
            finalGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            finalGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
            finalOsc.connect(finalGain);
            finalGain.connect(this.masterVolume);
            finalOsc.start();
            finalOsc.stop(this.ctx.currentTime + 0.85);
        }, 360);
    }

    playBossSpawn() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(70, now);
        osc.frequency.linearRampToValueAtTime(25, now + 1.2);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
        osc.connect(gain);
        gain.connect(this.masterVolume);
        osc.start();
        osc.stop(now + 1.5);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(110, now + 0.1);
        osc2.frequency.linearRampToValueAtTime(55, now + 1.0);
        gain2.gain.setValueAtTime(0.12, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc2.connect(gain2);
        gain2.connect(this.masterVolume);
        osc2.start(now + 0.1);
        osc2.stop(now + 1.3);
    }
}
const sfx = new SoundEngine();

// ==========================================
// 2. CAMERA ENGINE
// ==========================================
class Camera {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.lerpFactor = 0.08;
    }

    update(targetX, targetY) {
        this.x += (targetX - this.x) * this.lerpFactor;
        this.y += (targetY - this.y) * this.lerpFactor;
    }

    getIsoOffset() {
        return {
            x: this.x - this.y,
            y: (this.x + this.y) * 0.5
        };
    }
}

// ==========================================
// 3. ISOMETRIC TILE MAP ENGINE
// ==========================================
class TileMap {
    constructor(tileSize = 64, type = 'dungeon') {
        this.tileSize = tileSize;
        this.type = type;
        this.cols = type === 'town' ? 16 : 30;
        this.rows = type === 'town' ? 16 : 30;

        // Dungeon floors use the stone sprite as a base; town floors are
        // fully procedural (no grass asset exists in /assets).
        this.tileImage = null;
        this.isImageLoaded = false;
        this.tileVariants = this.buildTileVariants(null);
        if (type === 'dungeon') {
            this.tileImage = new Image();
            this.tileImage.src = 'assets/tile_stone.png';
            this.tileImage.onload = () => {
                this.isImageLoaded = true;
                this.tileVariants = this.buildTileVariants(this.tileImage);
            };
        }

        this.grid = [];
        this.variantGrid = [];
        this.generateMap();
    }

    // Deterministic per-cell hash so tile decoration stays stable every frame
    static cellHash(r, c) {
        let h = (r * 73856093) ^ (c * 19349663);
        h = (h ^ (h >> 13)) * 1274126177;
        return Math.abs(h ^ (h >> 16));
    }

    buildTileVariants(baseImage) {
        const w = this.tileSize * 2;
        const h = this.tileSize;
        const isTown = this.type === 'town';
        const baseTones = isTown
            ? ['#1d3a1d', '#1a331a', '#214221', '#183018']
            : ['#262019', '#221c16', '#2a231b', '#1f1a14'];
        const variants = [];

        for (let v = 0; v < 8; v++) {
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const tctx = canvas.getContext('2d');

            let seed = v * 7919 + (isTown ? 131 : 17);
            const rnd = () => {
                seed = (seed * 9301 + 49297) % 233280;
                return seed / 233280;
            };

            tctx.beginPath();
            tctx.moveTo(w / 2, 0);
            tctx.lineTo(w, h / 2);
            tctx.lineTo(w / 2, h);
            tctx.lineTo(0, h / 2);
            tctx.closePath();
            tctx.clip();

            if (baseImage) {
                tctx.drawImage(baseImage, 0, 0, w, h);
                tctx.fillStyle = `rgba(15, 10, 5, ${(v % 4) * 0.07})`;
                tctx.fillRect(0, 0, w, h);
            } else {
                tctx.fillStyle = baseTones.at(v % baseTones.length);
                tctx.fillRect(0, 0, w, h);
                for (let i = 0; i < 5; i++) {
                    tctx.fillStyle = `rgba(${isTown ? '60, 110, 50' : '70, 58, 44'}, ${0.05 + rnd() * 0.08})`;
                    tctx.beginPath();
                    tctx.ellipse(rnd() * w, rnd() * h, 8 + rnd() * 16, 4 + rnd() * 8, 0, 0, Math.PI * 2);
                    tctx.fill();
                }
            }

            // Speckle noise
            for (let i = 0; i < 24; i++) {
                tctx.fillStyle = isTown
                    ? `rgba(${50 + Math.floor(rnd() * 50)}, ${100 + Math.floor(rnd() * 70)}, ${40 + Math.floor(rnd() * 40)}, 0.25)`
                    : `rgba(${60 + Math.floor(rnd() * 50)}, ${50 + Math.floor(rnd() * 40)}, ${40 + Math.floor(rnd() * 30)}, 0.2)`;
                tctx.fillRect(rnd() * w, rnd() * h, 1.5 + rnd() * 2.5, 1 + rnd() * 1.5);
            }

            if (v === 4) {
                if (isTown) {
                    // worn dirt path patch
                    tctx.fillStyle = 'rgba(92, 70, 40, 0.4)';
                    tctx.beginPath();
                    tctx.ellipse(w / 2 + (rnd() - 0.5) * 20, h / 2 + (rnd() - 0.5) * 8, 18 + rnd() * 8, 8 + rnd() * 4, 0, 0, Math.PI * 2);
                    tctx.fill();
                } else {
                    // floor cracks
                    tctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                    tctx.lineWidth = 1;
                    tctx.beginPath();
                    let cx = w * 0.35 + rnd() * w * 0.2;
                    let cy = h * 0.25;
                    tctx.moveTo(cx, cy);
                    for (let i = 0; i < 4; i++) {
                        cx += (rnd() - 0.35) * 20;
                        cy += 4 + rnd() * 8;
                        tctx.lineTo(cx, cy);
                    }
                    tctx.stroke();
                }
            } else if (v === 5) {
                if (isTown) {
                    // grass tufts
                    tctx.strokeStyle = 'rgba(90, 160, 70, 0.8)';
                    tctx.lineWidth = 1;
                    for (let i = 0; i < 6; i++) {
                        const gx = w * 0.25 + rnd() * w * 0.5;
                        const gy = h * 0.3 + rnd() * h * 0.4;
                        tctx.beginPath();
                        tctx.moveTo(gx, gy);
                        tctx.lineTo(gx + (rnd() - 0.5) * 4, gy - 4 - rnd() * 4);
                        tctx.stroke();
                    }
                } else {
                    // scattered pebbles
                    tctx.fillStyle = 'rgba(110, 100, 90, 0.6)';
                    for (let i = 0; i < 5; i++) {
                        tctx.beginPath();
                        tctx.ellipse(w * 0.25 + rnd() * w * 0.5, h * 0.3 + rnd() * h * 0.4, 1.5 + rnd() * 2, 1 + rnd() * 1.5, 0, 0, Math.PI * 2);
                        tctx.fill();
                    }
                }
            } else if (v === 6) {
                if (isTown) {
                    // wild flowers
                    const flowerColors = ['#e8d44d', '#d977c0', '#f0f0f0'];
                    for (let i = 0; i < 3; i++) {
                        const fx = w * 0.3 + rnd() * w * 0.4;
                        const fy = h * 0.3 + rnd() * h * 0.4;
                        tctx.strokeStyle = 'rgba(70, 130, 60, 0.9)';
                        tctx.beginPath();
                        tctx.moveTo(fx, fy + 3);
                        tctx.lineTo(fx, fy);
                        tctx.stroke();
                        tctx.fillStyle = flowerColors.at(Math.floor(rnd() * flowerColors.length));
                        tctx.beginPath();
                        tctx.arc(fx, fy, 1.8, 0, Math.PI * 2);
                        tctx.fill();
                    }
                } else {
                    // old bones
                    tctx.fillStyle = 'rgba(190, 185, 170, 0.75)';
                    const bx = w * 0.4 + rnd() * w * 0.2;
                    const by = h * 0.4 + rnd() * h * 0.2;
                    tctx.fillRect(bx, by, 9, 2);
                    tctx.fillRect(bx + 7, by - 3, 2, 8);
                    tctx.beginPath();
                    tctx.arc(bx - 2, by + 1, 2.5, 0, Math.PI * 2);
                    tctx.fill();
                }
            } else if (v === 7) {
                if (isTown) {
                    // clover patch
                    tctx.fillStyle = 'rgba(60, 140, 60, 0.45)';
                    for (let i = 0; i < 8; i++) {
                        tctx.beginPath();
                        tctx.arc(w * 0.3 + rnd() * w * 0.4, h * 0.3 + rnd() * h * 0.4, 1.5 + rnd(), 0, Math.PI * 2);
                        tctx.fill();
                    }
                } else {
                    // moss growth
                    tctx.fillStyle = 'rgba(50, 90, 45, 0.35)';
                    for (let i = 0; i < 4; i++) {
                        tctx.beginPath();
                        tctx.ellipse(w * 0.3 + rnd() * w * 0.4, h * 0.3 + rnd() * h * 0.4, 4 + rnd() * 6, 2 + rnd() * 3, 0, 0, Math.PI * 2);
                        tctx.fill();
                    }
                }
            }

            // subtle edge shading for tile separation
            tctx.strokeStyle = isTown ? 'rgba(10, 25, 10, 0.35)' : 'rgba(0, 0, 0, 0.3)';
            tctx.lineWidth = 1;
            tctx.beginPath();
            tctx.moveTo(w / 2, 0.5);
            tctx.lineTo(w - 0.5, h / 2);
            tctx.lineTo(w / 2, h - 0.5);
            tctx.lineTo(0.5, h / 2);
            tctx.closePath();
            tctx.stroke();

            variants.push(canvas);
        }
        return variants;
    }

    generateMap() {
        for (let r = 0; r < this.rows; r++) {
            const rowData = [];
            const variantRow = [];
            for (let c = 0; c < this.cols; c++) {
                if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
                    rowData.push(1);
                }
                else if (this.type === 'dungeon' && Math.random() < 0.05 && (r > 12 && r < 18 && c > 12 && c < 18) === false) {
                    rowData.push(1);
                } else {
                    rowData.push(0);
                }

                // Mostly plain tone variants, occasionally a decorated tile
                const hash = TileMap.cellHash(r, c);
                let variant = hash % 4;
                const decoRoll = hash % 23;
                if (decoRoll === 7) variant = 4;
                else if (decoRoll === 11) variant = 5;
                else if (decoRoll === 15) variant = 6;
                else if (decoRoll === 19) variant = 7;
                variantRow.push(variant);
            }
            this.grid.push(rowData);
            this.variantGrid.push(variantRow);
        }
    }

    worldToIso(x, y) {
        return {
            x: x - y,
            y: (x + y) * 0.5
        };
    }

    isoToWorld(isoX, isoY) {
        return {
            x: (isoX + 2 * isoY) * 0.5,
            y: (2 * isoY - isoX) * 0.5
        };
    }

    isSolid(x, y) {
        const c = Math.floor(x / this.tileSize);
        const r = Math.floor(y / this.tileSize);
        if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) {
            return true;
        }
        return this.grid[r][c] === 1;
    }

    render(ctx, camera, viewWidth, viewHeight) {
        const isoCam = camera.getIsoOffset();
        const halfWidth = viewWidth / 2;
        const halfHeight = viewHeight / 2;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const tileType = this.grid.at(r).at(c);
                const cartX = c * this.tileSize + this.tileSize / 2;
                const cartY = r * this.tileSize + this.tileSize / 2;

                const isoPos = this.worldToIso(cartX, cartY);
                const screenX = isoPos.x - isoCam.x + halfWidth;
                const screenY = isoPos.y - isoCam.y + halfHeight;

                const buffer = 150;
                if (screenX < -buffer || screenX > viewWidth + buffer || 
                    screenY < -buffer || screenY > viewHeight + buffer) {
                    continue;
                }

                if (tileType === 0) {
                    const variantIdx = this.variantGrid.at(r).at(c);
                    const tileCanvas = this.tileVariants ? this.tileVariants.at(variantIdx) : null;
                    if (tileCanvas) {
                        const imgWidth = this.tileSize * 2;
                        const imgHeight = this.tileSize;
                        ctx.drawImage(
                            tileCanvas,
                            screenX - imgWidth / 2,
                            screenY - imgHeight / 2,
                            imgWidth,
                            imgHeight
                        );
                    } else {
                        ctx.fillStyle = this.type === 'town' ? '#152515' : '#1c1712';
                        ctx.strokeStyle = this.type === 'town' ? '#223822' : '#2b2118';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(screenX, screenY - this.tileSize / 2);
                        ctx.lineTo(screenX + this.tileSize, screenY);
                        ctx.lineTo(screenX, screenY + this.tileSize / 2);
                        ctx.lineTo(screenX - this.tileSize, screenY);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    }
                } else if (tileType === 1) {
                    const heightOffset = 40;
                    const w = this.tileSize;

                    const wallShade = TileMap.cellHash(r, c) % 3;
                    const topTones = this.type === 'town'
                        ? ['#223b22', '#1f3a26', '#264226']
                        : ['#2d241e', '#332a22', '#2a2520'];
                    ctx.fillStyle = topTones.at(wallShade);
                    ctx.beginPath();
                    ctx.moveTo(screenX, screenY - w / 2 - heightOffset);
                    ctx.lineTo(screenX + w, screenY - heightOffset);
                    ctx.lineTo(screenX, screenY + w / 2 - heightOffset);
                    ctx.lineTo(screenX - w, screenY - heightOffset);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = this.type === 'town' ? '#172b17' : '#1e1814';
                    ctx.beginPath();
                    ctx.moveTo(screenX - w, screenY - heightOffset);
                    ctx.lineTo(screenX, screenY + w / 2 - heightOffset);
                    ctx.lineTo(screenX, screenY + w / 2);
                    ctx.lineTo(screenX - w, screenY);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = this.type === 'town' ? '#0f1f0f' : '#15100d';
                    ctx.beginPath();
                    ctx.moveTo(screenX, screenY + w / 2 - heightOffset);
                    ctx.lineTo(screenX + w, screenY - heightOffset);
                    ctx.lineTo(screenX + w, screenY);
                    ctx.lineTo(screenX, screenY + w / 2);
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = this.type === 'town' ? '#325232' : '#4a3b30';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            }
        }
    }
}

// ==========================================
// 4. PLAYER HERO ENGINE
// ==========================================
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.radius = 16;
        this.speed = 3.5;

        // Base values
        this.level = 1;
        this.hp = 100;
        this.maxHp = 100;
        this.mp = 50;
        this.maxMp = 50;
        this.atk = 15;

        this.baseAtk = 15;
        this.baseMaxHp = 100;
        this.baseMaxMp = 50;

        this.exp = 0;
        this.nextExp = 100;
        this.statPoints = 0;
        this.skillPoints = 0;
        this.skills = { fireball: 1 };
        this.fireballBonus = 0;
        this.potions = [60, 60, 60, 60, 60];
        this.gold = 100;
        this.kills = 0;

        this.state = 'idle';
        this.direction = 0;
        
        this.animTimer = 0;
        this.animSpeed = 0.15;
        // Sheets in /assets ship with pre-keyed transparent backgrounds,
        // so they can be drawn directly (works on file:// as well).
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'assets/hero.png';
        this.processedSheet = null;
        this.isLoaded = false;
        this.spriteSheet.onload = () => {
            this.processedSheet = this.spriteSheet;
            this.isLoaded = true;
        };

        this.attackDuration = 20;
        this.attackTimer = 0;
        this.attackRange = 45;
        this.spellCost = 15;
        this.critChance = 0.05;
        this.critMultiplier = 1.75;
        this.resists = { fire: 0, physical: 0 };
    }

    moveTo(tx, ty) {
        if (this.state === 'attack') return;
        this.targetX = tx;
        this.targetY = ty;
    }

    meleeAttack() {
        if (this.state === 'attack') return false;
        this.state = 'attack';
        this.attackTimer = this.attackDuration;
        this.animTimer = 0;
        return true;
    }

    usePotion() {
        if (this.potions.length > 0 && this.hp < this.maxHp) {
            const healVal = this.potions.pop();
            this.hp = Math.min(this.maxHp, this.hp + healVal);
            return healVal;
        }
        return 0;
    }

    addStat(statType) {
        if (this.statPoints <= 0) return false;
        this.statPoints--;
        
        if (statType === 'atk') {
            this.baseAtk += 3;
        } else if (statType === 'maxhp') {
            this.baseMaxHp += 20;
            this.hp += 20;
        } else if (statType === 'maxmp') {
            this.baseMaxMp += 10;
            this.mp += 10;
        }
        return true;
    }

    gainExp(amount) {
        this.exp += amount;
        let leveledUp = false;
        
        while (this.exp >= this.nextExp) {
            this.exp -= this.nextExp;
            this.level++;
            this.statPoints += 5;
            this.skillPoints += 1;
            this.baseMaxHp += 15;
            this.baseMaxMp += 10;
            this.hp = this.maxHp;
            this.mp = this.maxMp;
            this.nextExp = Math.floor(this.nextExp * 1.5);
            leveledUp = true;
        }
        return leveledUp;
    }

    recalculateStats(inventory) {
        let bonusAtk = 0;
        let bonusHp = 0;
        let bonusMp = 0;
        let skillFireballBonus = 0;

        inventory.forEach(item => {
            if (!item || !item.equipped) return;
            if (item.skillFireballBonus) {
                skillFireballBonus += item.skillFireballBonus;
            }
            if (item.gems) {
                item.gems.forEach(gem => {
                    bonusAtk += gem.effect.atk || 0;
                    bonusHp += gem.effect.hp || 0;
                    bonusMp += gem.effect.mp || 0;
                });
            }
            if (item.type === 'weapon') {
                bonusAtk += item.value;
                if (item.speed) {
                    this.attackDuration = Math.round(20 * item.speed);
                }
            } else if (item.type === 'armor') {
                if (item.stat.includes('HP')) {
                    bonusHp += item.value;
                } else if (item.stat.includes('MP')) {
                    bonusMp += item.value;
                }
            }
        });

        this.atk = this.baseAtk + bonusAtk;
        this.maxHp = this.baseMaxHp + bonusHp;
        this.maxMp = this.baseMaxMp + bonusMp;
        this.fireballBonus = skillFireballBonus;

        if (this.hp > this.maxHp) this.hp = this.maxHp;
        if (this.mp > this.maxMp) this.mp = this.maxMp;
    }

    addSkillPoint(skillKey) {
        if (this.skillPoints <= 0) return false;
        if (skillKey !== 'fireball') return false;
        const lvl = this.skills.fireball;
        if (lvl >= 20) return false;
        this.skillPoints--;
        this.skills.fireball = lvl + 1;
        return true;
    }

    update(map) {
        if (this.state === 'attack') {
            this.attackTimer--;
            this.animTimer += this.animSpeed;
            if (this.attackTimer <= 0) {
                this.state = 'idle';
            }
            return;
        }

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 5) {
            this.state = 'walk';
            this.animTimer += this.animSpeed;

            const vx = (dx / dist) * this.speed;
            const vy = (dy / dist) * this.speed;

            let angle = Math.atan2(vy, vx);
            if (angle < 0) angle += Math.PI * 2;
            
            this.direction = Math.round(angle / (Math.PI / 4)) % 8;

            const newX = this.x + vx;
            const newY = this.y + vy;

            if (!map.isSolid(newX, this.y)) {
                this.x = newX;
            } else {
                this.targetX = this.x;
            }

            if (!map.isSolid(this.x, newY)) {
                this.y = newY;
            } else {
                this.targetY = this.y;
            }
        } else {
            this.state = 'idle';
            this.animTimer = 0;
        }

        if (this.mp < this.maxMp && Math.random() < 0.02) {
            this.mp = Math.min(this.maxMp, this.mp + 1);
        }
    }

    render(ctx, camera, viewWidth, viewHeight) {
        const isoCam = camera.getIsoOffset();
        const halfWidth = viewWidth / 2;
        const halfHeight = viewHeight / 2;

        const isoPos = {
            x: this.x - this.y,
            y: (this.x + this.y) * 0.5
        };

        const screenX = isoPos.x - isoCam.x + halfWidth;
        const screenY = isoPos.y - isoCam.y + halfHeight;

        if (this.isLoaded && this.processedSheet) {
            // hero.png is a labeled animation sheet (8 columns of 128px);
            // source rects skip the baked-in label text above each band.
            const frameW = this.spriteSheet.width / 8;
            const anims = {
                idle:   { sy: 28,  sh: 124, frames: 6 },
                walk:   { sy: 336, sh: 112, frames: 8 },
                attack: { sy: 480, sh: 116, frames: 8 }
            };
            const anim = anims[this.state] || anims.idle;

            let col;
            if (this.state === 'walk') {
                col = Math.floor(this.animTimer) % anim.frames;
            } else if (this.state === 'attack') {
                const t = 1 - (this.attackTimer / this.attackDuration);
                col = Math.floor(t * anim.frames) % anim.frames;
            } else {
                col = Math.floor(Date.now() / 180) % anim.frames;
            }

            const drawH = 80;
            const drawW = Math.round(drawH * frameW / anim.sh);

            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY + 8, 14, 7, 0, 0, Math.PI * 2);
            ctx.fill();

            // sheet faces right; flip when moving toward screen-left
            if (this.direction >= 2 && this.direction <= 4) {
                ctx.translate(screenX, 0);
                ctx.scale(-1, 1);
                ctx.translate(-screenX, 0);
            }
            ctx.drawImage(
                this.processedSheet,
                col * frameW,
                anim.sy,
                frameW,
                anim.sh,
                screenX - drawW / 2,
                screenY + 32 - drawH,
                drawW,
                drawH
            );
            ctx.restore();
        } else {
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';

            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY + 4, 16, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1e1111'; 
            ctx.beginPath();
            ctx.arc(screenX, screenY - 8, 12, 0, Math.PI, false);
            ctx.lineTo(screenX + 12, screenY + 6);
            ctx.lineTo(screenX - 12, screenY + 6);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#0d0d0d'; 
            ctx.beginPath();
            ctx.arc(screenX, screenY - 18, 9, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ff3333';
            ctx.beginPath();
            const eyeOffset = this.getEyeOffsets();
            ctx.arc(screenX - 3 + eyeOffset.x, screenY - 18 + eyeOffset.y, 1.5, 0, Math.PI * 2);
            ctx.arc(screenX + 3 + eyeOffset.x, screenY - 18 + eyeOffset.y, 1.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#bf8a3c';
            ctx.beginPath();
            ctx.arc(screenX - 8, screenY - 8, 4, 0, Math.PI * 2);
            ctx.arc(screenX + 8, screenY - 8, 4, 0, Math.PI * 2);
            ctx.fill();

            if (this.state === 'attack') {
                ctx.strokeStyle = 'rgba(255, 230, 180, 0.8)';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                const angleOffset = (this.direction * (Math.PI / 4));
                const swingStart = angleOffset - Math.PI / 3;
                const swingEnd = angleOffset + Math.PI / 3;
                const t = 1 - (this.attackTimer / this.attackDuration);
                const currentAngle = swingStart + (swingEnd - swingStart) * t;
                ctx.arc(screenX, screenY - 8, 25, currentAngle - 0.2, currentAngle + 0.2);
                ctx.stroke();
            } else {
                ctx.fillStyle = '#aaa';
                ctx.strokeStyle = '#3a2e22';
                ctx.lineWidth = 1.5;
                ctx.save();
                ctx.translate(screenX + 14, screenY - 14 + Math.sin(Date.now() * 0.005) * 3);
                ctx.rotate(Math.PI / 6);
                ctx.beginPath();
                ctx.moveTo(0, -15);
                ctx.lineTo(2, -12);
                ctx.lineTo(2, 0);
                ctx.lineTo(-2, 0);
                ctx.lineTo(-2, -12);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#bf8a3c';
                ctx.fillRect(-4, 0, 8, 2);
                ctx.fillRect(-1, 2, 2, 4);
                ctx.restore();
            }

            ctx.shadowBlur = 0;
        }

        if (this.hp < this.maxHp) {
            const barW = 32;
            const barH = 4;
            const bx = screenX - barW / 2;
            const by = screenY - 36;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(bx, by, barW, barH);
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(bx, by, barW * (this.hp / this.maxHp), barH);
        }
    }

    getEyeOffsets() {
        const offsets = [
            { x: 3, y: 1 },  
            { x: 2, y: 2 },  
            { x: 0, y: 3 },  
            { x: -2, y: 2 }, 
            { x: -3, y: 1 }, 
            { x: -2, y: 0 }, 
            { x: 0, y: -1 }, 
            { x: 2, y: 0 }   
        ];
        return offsets.at(this.direction) || { x: 0, y: 0 };
    }
}

// ==========================================
// 5. SKELETON MONSTER & COMBAT SYSTEM
// ==========================================
class Monster {
    constructor(x, y, level = 1, rank = 'normal') {
        this.x = x;
        this.y = y;
        this.radius = 14;
        
        this.level = level;
        const monsterScale = 1 + (level - 1) * 0.25;
        this.maxHp = Math.floor((30 + level * 10) * monsterScale);
        this.hp = this.maxHp;
        this.atk = Math.floor((5 + level * 2) * monsterScale);
        this.speed = 1.2 + Math.random() * 0.4;
        this.expValue = Math.floor((20 + level * 5) * monsterScale);

        this.state = 'walk'; 
        this.deathTimer = 40; 
        this.direction = 0;
        
        this.attackCooldown = 0;
        this.attackInterval = 60; 

        this.animTimer = Math.random() * 10;
        this.animSpeed = 0.1;
        // Pre-keyed transparent sheet; drawn directly (works on file://).
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'assets/skeleton.png';
        this.processedSheet = null;
        this.isLoaded = false;
        this.spriteSheet.onload = () => {
            this.processedSheet = this.spriteSheet;
            this.isLoaded = true;
        };
        this.resists = { fire: 0, physical: 0 };

        this.rank = rank;
        this.name = '';
        this.scale = 1;
        this.goldMult = 1;
        this.auraColor = null;

        if (rank === 'champion') {
            const mods = [
                { name: '신속의', speedMult: 1.6 },
                { name: '강철 피부', resists: { physical: 0.5 } },
                { name: '화염심장', resists: { fire: 0.6 } },
                { name: '광폭한', atkMult: 1.4 }
            ];
            const mod = mods.at(Math.floor(Math.random() * mods.length));
            this.name = `${mod.name} 챔피언`;
            this.maxHp *= 3;
            this.hp = this.maxHp;
            this.atk = Math.floor(this.atk * 1.5 * (mod.atkMult || 1));
            this.speed *= (mod.speedMult || 1.15);
            this.expValue = Math.floor(this.expValue * 2.5);
            this.goldMult = 3;
            this.scale = 1.2;
            this.auraColor = '#66aaff';
            if (mod.resists) Object.assign(this.resists, mod.resists);
        } else if (rank === 'boss') {
            this.name = '도살자';
            this.maxHp *= 10;
            this.hp = this.maxHp;
            this.atk *= 2;
            this.speed = 1.1;
            this.expValue *= 10;
            this.goldMult = 10;
            this.scale = 1.8;
            this.radius = 24;
            this.auraColor = '#ff2200';
            this.resists.physical = 0.3;
            this.resists.fire = 0.3;
            this.attackInterval = 75;
        }
    }

    update(player, map) {
        if (this.state === 'death') {
            this.deathTimer--;
            return;
        }

        if (this.attackCooldown > 0) this.attackCooldown--;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        const aggroRange = this.rank === 'boss' ? 100000 : 250;
        if (dist < aggroRange && dist > 15) {
            this.animTimer += this.animSpeed;
            
            const vx = (dx / dist) * this.speed;
            const vy = (dy / dist) * this.speed;

            let angle = Math.atan2(vy, vx);
            if (angle < 0) angle += Math.PI * 2;
            this.direction = Math.round(angle / (Math.PI / 4)) % 8;

            const newX = this.x + vx;
            const newY = this.y + vy;

            if (!map.isSolid(newX, this.y)) this.x = newX;
            if (!map.isSolid(this.x, newY)) this.y = newY;
        }

        if (dist <= (this.rank === 'boss' ? 36 : 24) && this.attackCooldown === 0) {
            this.attackCooldown = this.attackInterval;
            return this.atk;
        }
        return 0;
    }

    takeDamage(amount, floaters) {
        if (this.state === 'death') return 0;

        let dmg = amount;
        const type = arguments.length >= 3 ? arguments[2] : 'physical';
        const resist = this.resists && this.resists[type] ? this.resists[type] : 0;
        const final = Math.max(1, Math.floor(dmg * (1 - resist)));

        this.hp -= final;
        floaters.add(this.x, this.y - 12, final.toString(), '#ffcc00');

        if (this.hp <= 0) {
            this.state = 'death';
            return this.expValue;
        }
        return 0;
    }

    render(ctx, camera, viewWidth, viewHeight) {
        if (this.state === 'death' && this.deathTimer <= 0) return;

        const isoCam = camera.getIsoOffset();
        const halfWidth = viewWidth / 2;
        const halfHeight = viewHeight / 2;

        const isoPos = {
            x: this.x - this.y,
            y: (this.x + this.y) * 0.5
        };

        const screenX = isoPos.x - isoCam.x + halfWidth;
        const screenY = isoPos.y - isoCam.y + halfHeight;

        const buffer = 80;
        if (screenX < -buffer || screenX > viewWidth + buffer || 
            screenY < -buffer || screenY > viewHeight + buffer) {
            return;
        }

        ctx.save();
        if (this.state === 'death') {
            ctx.globalAlpha = Math.max(0, this.deathTimer / 40);
        }

        // Champions and bosses are drawn larger around their anchor point
        if (this.scale !== 1) {
            ctx.translate(screenX, screenY);
            ctx.scale(this.scale, this.scale);
            ctx.translate(-screenX, -screenY);
        }

        if (this.auraColor && this.state !== 'death') {
            ctx.save();
            ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.006) * 0.1;
            ctx.shadowBlur = 14;
            ctx.shadowColor = this.auraColor;
            ctx.fillStyle = this.auraColor;
            ctx.beginPath();
            ctx.ellipse(screenX, screenY + 4, 16, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX, screenY + 4, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.isLoaded && this.processedSheet) {
            // skeleton.png is a labeled animation sheet (8 columns of 128px);
            // walk uses cols 0-3 of the Walk/Run band, death plays its own band.
            const frameW = this.spriteSheet.width / 8;
            const anims = {
                walk:  { sy: 192, sh: 134, frames: 4 },
                death: { sy: 762, sh: 94, frames: 8 }
            };
            const anim = this.state === 'death' ? anims.death : anims.walk;

            let col;
            if (this.state === 'death') {
                const t = 1 - Math.max(0, this.deathTimer) / 40;
                col = Math.min(anim.frames - 1, Math.floor(t * anim.frames));
            } else {
                col = Math.floor(this.animTimer) % anim.frames;
            }

            const drawW = 56;
            const drawH = Math.round(drawW * anim.sh / frameW);

            ctx.save();
            if (this.direction >= 2 && this.direction <= 4) {
                ctx.translate(screenX, 0);
                ctx.scale(-1, 1);
                ctx.translate(-screenX, 0);
            }
            ctx.drawImage(
                this.processedSheet,
                col * frameW,
                anim.sy,
                frameW,
                anim.sh,
                screenX - drawW / 2,
                screenY + 16 - drawH,
                drawW,
                drawH
            );
            ctx.restore();
        } else {
            ctx.fillStyle = '#b0a89f'; 
            ctx.strokeStyle = '#3a332a';
            ctx.lineWidth = 1;

            if (this.state === 'death') {
                ctx.fillStyle = '#6a645d';
                ctx.fillRect(screenX - 8, screenY, 6, 3);
                ctx.fillRect(screenX + 2, screenY - 2, 8, 3);
                ctx.beginPath();
                ctx.arc(screenX - 2, screenY - 4, 5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(screenX, screenY - 16 + Math.sin(Date.now() * 0.007) * 2, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#ff0000';
                ctx.fillRect(screenX - 3, screenY - 17 + Math.sin(Date.now() * 0.007) * 2, 1.5, 1.5);
                ctx.fillRect(screenX + 1.5, screenY - 17 + Math.sin(Date.now() * 0.007) * 2, 1.5, 1.5);

                ctx.strokeStyle = '#b0a89f';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(screenX, screenY - 9);
                ctx.lineTo(screenX, screenY + 2);
                ctx.moveTo(screenX - 7, screenY - 6);
                ctx.lineTo(screenX + 7, screenY - 6);
                ctx.moveTo(screenX - 5, screenY - 2);
                ctx.lineTo(screenX + 5, screenY - 2);
                ctx.stroke();

                ctx.fillStyle = '#b0a89f';
                ctx.beginPath();
                ctx.arc(screenX - 10, screenY - 2, 2.5, 0, Math.PI * 2);
                ctx.arc(screenX + 10, screenY - 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (this.hp < this.maxHp && this.state !== 'death') {
            const barW = 24;
            const barH = 3;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(screenX - barW / 2, screenY - 26, barW, barH);
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(screenX - barW / 2, screenY - 26, barW * (this.hp / this.maxHp), barH);
        }

        if (this.name && this.state !== 'death') {
            ctx.fillStyle = this.auraColor || '#ffffff';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 4;
            ctx.fillText(this.name, screenX, screenY - 32);
        }

        ctx.restore();
    }
}

// ==========================================
// 6. FIREBALL PROJECTILE ENGINE
// ==========================================
class Projectile {
    constructor(x, y, tx, ty, damage = 25, level = 1, type = 'physical') {
        this.x = x;
        this.y = y;
        this.radius = 8 + (level - 1) * 0.5;
        this.damage = damage;
        this.life = 70;
        this.level = level;

        const dx = tx - x;
        const dy = ty - y;
        const dist = Math.hypot(dx, dy);
        const speed = 7;
        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed;
        this.angle = Math.atan2(dy, dx);
        this.type = 'physical';
        this.type = type;
    }

    update(map) {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        if (map.isSolid(this.x, this.y)) {
            this.life = 0;
        }
    }

    render(ctx, camera, viewWidth, viewHeight) {
        const isoCam = camera.getIsoOffset();
        const halfWidth = viewWidth / 2;
        const halfHeight = viewHeight / 2;

        const screenX = (this.x - this.y) - isoCam.x + halfWidth;
        const screenY = (this.x + this.y) * 0.5 - isoCam.y + halfHeight;

        ctx.save();
        ctx.shadowBlur = 15 + (this.level - 1) * 2;
        ctx.shadowColor = '#ff4500';

        const grad = ctx.createRadialGradient(screenX, screenY, 1, screenX, screenY, this.radius + 4);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#ffcc00');
        grad.addColorStop(0.6, '#ff4500');
        grad.addColorStop(1, 'rgba(255, 69, 0, 0)');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius + 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 69, 0, 0.4)';
        ctx.beginPath();
        const trailX = screenX - Math.cos(this.angle) * 10;
        const trailY = screenY - Math.sin(this.angle) * 5;
        ctx.arc(trailX, trailY, this.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ==========================================
// 6.5. TOWN PORTAL ENGINE
// ==========================================
class Portal {
    constructor(x, y, targetMap) {
        this.x = x;
        this.y = y;
        this.targetMap = targetMap;
        this.radius = 16;
        this.animTimer = 0;
    }

    update() {
        this.animTimer += 0.05;
    }

    render(ctx, camera, viewWidth, viewHeight) {
        const isoCam = camera.getIsoOffset();
        const halfWidth = viewWidth / 2;
        const halfHeight = viewHeight / 2;

        const screenX = (this.x - this.y) - isoCam.x + halfWidth;
        const screenY = (this.x + this.y) * 0.5 - isoCam.y + halfHeight;

        ctx.save();
        const pulse = Math.sin(this.animTimer) * 3;
        ctx.shadowBlur = 20 + pulse;
        ctx.shadowColor = '#00aaff';

        // Outer ring
        ctx.fillStyle = 'rgba(0, 170, 255, 0.2)';
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(screenX, screenY, 20 + pulse, 10 + pulse / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner core
        const grad = ctx.createRadialGradient(screenX, screenY, 1, screenX, screenY, 12);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, '#00ffff');
        grad.addColorStop(1, 'rgba(0, 128, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(screenX, screenY - 2, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Swirling portal effect
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(screenX, screenY, 8 + pulse, 4 + pulse / 2, this.animTimer, 0, Math.PI);
        ctx.stroke();

        ctx.restore();
    }
}

// ==========================================
// 6.6. MERCHANT NPC
// ==========================================
class Npc {
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.radius = 16;
        this.animTimer = 0;
    }

    update() {
        this.animTimer += 0.03;
    }

    render(ctx, camera, viewWidth, viewHeight) {
        const isoCam = camera.getIsoOffset();
        const halfWidth = viewWidth / 2;
        const halfHeight = viewHeight / 2;

        const screenX = (this.x - this.y) - isoCam.x + halfWidth;
        const screenY = (this.x + this.y) * 0.5 - isoCam.y + halfHeight;

        ctx.save();
        
        // Ellipse shadow under feet
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(screenX, screenY + 4, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Idle floating bounce animation
        const bounce = Math.sin(this.animTimer) * 2;

        // Staff (Behind/Side)
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(screenX - 8, screenY + 6 + bounce);
        ctx.lineTo(screenX - 8, screenY - 24 + bounce);
        ctx.stroke();

        // Golden gem on top of the staff
        ctx.fillStyle = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffd700';
        ctx.beginPath();
        ctx.arc(screenX - 8, screenY - 26 + bounce, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Cloak/Body (Gothic Purple)
        ctx.fillStyle = '#4a148c';
        ctx.beginPath();
        ctx.moveTo(screenX - 10, screenY + 4 + bounce);
        ctx.lineTo(screenX + 10, screenY + 4 + bounce);
        ctx.lineTo(screenX + 6, screenY - 14 + bounce);
        ctx.lineTo(screenX - 6, screenY - 14 + bounce);
        ctx.closePath();
        ctx.fill();

        // Hood/Head
        ctx.fillStyle = '#311b92';
        ctx.beginPath();
        ctx.arc(screenX, screenY - 16 + bounce, 6, 0, Math.PI * 2);
        ctx.fill();

        // Shadow inside hood (Face area)
        ctx.fillStyle = '#110022';
        ctx.beginPath();
        ctx.arc(screenX, screenY - 15 + bounce, 3, 0, Math.PI * 2);
        ctx.fill();

        // Golden Trim/Accents on Cloak
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX - 6, screenY - 14 + bounce);
        ctx.lineTo(screenX, screenY + 4 + bounce);
        ctx.lineTo(screenX + 6, screenY - 14 + bounce);
        ctx.stroke();

        // NPC Name floating above
        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#000000';
        ctx.fillText(this.name, screenX, screenY - 32 + bounce);

        ctx.restore();
    }
}

// ==========================================
// 7. FLOATING TEXT EFFECTS ENGINE
// ==========================================
class FloaterManager {
    constructor() {
        this.floaters = [];
    }

    add(worldX, worldY, text, color = '#ffffff') {
        this.floaters.push({
            worldX,
            worldY,
            text,
            color,
            life: 40,
            maxLife: 40
        });
    }

    update() {
        for (let i = this.floaters.length - 1; i >= 0; i--) {
            const f = this.floaters.at(i);
            f.life--;
            f.worldY -= 0.6;
            if (f.life <= 0) {
                this.floaters.splice(i, 1);
            }
        }
    }

    render(ctx, camera, viewWidth, viewHeight) {
        const isoCam = camera.getIsoOffset();
        const halfWidth = viewWidth / 2;
        const halfHeight = viewHeight / 2;

        ctx.save();
        ctx.font = 'bold 15px Inter, sans-serif';
        ctx.textAlign = 'center';

        for (const f of this.floaters) {
            const screenX = (f.worldX - f.worldY) - isoCam.x + halfWidth;
            const screenY = (f.worldX + f.worldY) * 0.5 - isoCam.y + halfHeight;

            const alpha = f.life / f.maxLife;
            ctx.fillStyle = f.color;
            ctx.globalAlpha = alpha;
            
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 4;

            ctx.fillText(f.text, screenX, screenY);
        }
        ctx.restore();
    }
}

// ==========================================
// 8. MAIN GAME CONTROLLER
// ==========================================
const SPAWN_INTERVAL = 180;
const MAX_MONSTERS = 10;
const ITEM_POOL = [
    { name: '철제 검', type: 'weapon', slot: 'weapon', stat: '+5 공격력', value: 5, speed: 1.0, rarity: 'normal', color: '#b0a89f', reqLevel: 1 },
    { name: '룬 단검', type: 'weapon', slot: 'weapon', stat: '+12 공격력', value: 12, speed: 0.8, rarity: 'normal', color: '#b0a89f', reqLevel: 1 },
    { name: '디아블로의 낫', type: 'weapon', slot: 'weapon', stat: '+30 공격력', value: 30, speed: 1.2, rarity: 'unique', color: '#ff5500', reqLevel: 15 },
    { name: '가죽 방패', type: 'armor', slot: 'shield', stat: '+10 최대 HP', value: 10, rarity: 'normal', color: '#b0a89f', reqLevel: 1 },
    { name: '성기사의 방패', type: 'armor', slot: 'shield', stat: '+40 최대 HP', value: 40, rarity: 'unique', color: '#ff5500', reqLevel: 12 },
    { name: '강철 투구', type: 'armor', slot: 'helmet', stat: '+25 최대 HP', value: 25, rarity: 'normal', color: '#b0a89f', reqLevel: 1 },
    { name: '가죽 갑옷', type: 'armor', slot: 'chest', stat: '+15 최대 HP', value: 15, rarity: 'normal', color: '#b0a89f', reqLevel: 1 },
    { name: '대천사의 로브', type: 'armor', slot: 'chest', stat: '+50 최대 MP', value: 50, rarity: 'unique', color: '#ff5500', reqLevel: 18 },
    { name: '체력 물약', type: 'potion', slot: 'potion', stat: '사용 시 체력 +60 회복', value: 60, rarity: 'normal', color: '#00ff00', reqLevel: 1 }
];

const PREFIXES = [
    { name: '날카로운', slot: 'weapon', value: 3 },
    { name: '치명적인', slot: 'weapon', value: 6 },
    { name: '단단한', slot: 'shield|helmet|chest', value: 4 },
    { name: '두꺼운', slot: 'shield|helmet|chest', value: 8 },
    { name: '빛나는', slot: 'weapon|shield|helmet|chest', value: 5 },
    { name: '축복받은', slot: 'weapon|shield|helmet|chest', value: 10 },
    { name: '신성한', slot: 'weapon|shield|helmet|chest', value: 15 }
];

const SUFFIXES = [
    { name: '의 분노', slot: 'weapon', value: 4, statType: 'ATK' },
    { name: '의 파괴자', slot: 'weapon', value: 10, statType: 'ATK' },
    { name: '의 수호', slot: 'shield|helmet|chest', value: 5, statType: 'HP' },
    { name: '의 생명', slot: 'shield|helmet|chest', value: 12, statType: 'HP' },
    { name: '의 마나', slot: 'helmet|chest', value: 10, statType: 'MP' },
    { name: '의 힘', slot: 'weapon|shield|helmet|chest', value: 6, statType: 'HP' },
    { name: '의 마법사', slot: 'weapon|helmet|chest', value: 1, statType: 'SKILL_FIREBALL' }
];

const GEM_TYPES = [
    { name: '루비', color: '#ff4466', effect: { hp: 25 }, stat: '소켓 장착 시: +25 최대 HP' },
    { name: '사파이어', color: '#3a8fff', effect: { mp: 20 }, stat: '소켓 장착 시: +20 최대 MP' },
    { name: '에메랄드', color: '#2ecc71', effect: { atk: 5 }, stat: '소켓 장착 시: +5 공격력' }
];

const BOSS_KILL_INTERVAL = 50;

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isGameRunning = false;

        this.currentMap = 'dungeon';
        this.dungeonMap = new TileMap(64, 'dungeon');
        this.townMap = new TileMap(64, 'town');
        this.map = this.dungeonMap;
        
        const spawnCartX = 15 * this.map.tileSize + this.map.tileSize / 2;
        const spawnCartY = 15 * this.map.tileSize + this.map.tileSize / 2;
        this.player = new Player(spawnCartX, spawnCartY);
        
        this.camera = new Camera(spawnCartX, spawnCartY);

        this.monsters = [];
        this.projectiles = [];
        this.dungeonPortal = null;
        this.townPortal = null;
        this.floaters = new FloaterManager();
        this.spawnTimer = 0;

        const townCenterCartX = 8 * this.townMap.tileSize + this.townMap.tileSize / 2;
        const townNpcCartY = 5 * this.townMap.tileSize + this.townMap.tileSize / 2;
        this.npc = new Npc(townCenterCartX, townNpcCartY, "아카라");

        this.inventory = new Array(16).fill(null);
        this.mouse = { x: 0, y: 0, isDown: false, button: -1 };
        this.zoom = 1.6;
        this.nextBossKills = BOSS_KILL_INTERVAL;
        this.selectedGemIdx = null;
        this.keys = {};
        this.movingByKeys = false;
        
        this.setupUI();
        this.setupInputs();
        
        this.player.recalculateStats(this.inventory);
        this.updateUI();

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    setupUI() {
        const toggleStatsBtn = document.getElementById('toggle-stats-btn');
        const statsPanel = document.getElementById('stats-panel');
        const closeStatsBtn = document.getElementById('close-stats-btn');

        const toggleStats = () => {
            sfx.init();
            statsPanel.classList.toggle('hidden');
        };
        toggleStatsBtn.addEventListener('click', toggleStats);
        closeStatsBtn.addEventListener('click', () => statsPanel.classList.add('hidden'));

        const toggleInvBtn = document.getElementById('toggle-inv-btn');
        const invPanel = document.getElementById('inventory-panel');
        const closeInvBtn = document.getElementById('close-inv-btn');

        const toggleInv = () => {
            sfx.init();
            invPanel.classList.toggle('hidden');
        };
        toggleInvBtn.addEventListener('click', toggleInv);
        closeInvBtn.addEventListener('click', () => invPanel.classList.add('hidden'));

        const toggleSkillsBtn = document.getElementById('toggle-skills-btn');
        const skillsPanel = document.getElementById('skills-panel');
        const closeSkillsBtn = document.getElementById('close-skills-btn');

        const toggleSkills = () => {
            sfx.init();
            skillsPanel.classList.toggle('hidden');
        };
        toggleSkillsBtn.addEventListener('click', toggleSkills);
        closeSkillsBtn.addEventListener('click', () => skillsPanel.classList.add('hidden'));

        // Shop UI Bindings
        const shopPanel = document.getElementById('shop-panel');
        const closeShopBtn = document.getElementById('close-shop-btn');
        closeShopBtn.addEventListener('click', () => shopPanel.classList.add('hidden'));

        const shopItemsConfig = [
            { name: '소형 체력 물약', value: 30, price: 15 },
            { name: '하급 체력 물약', value: 60, price: 30 },
            { name: '일반 체력 물약', value: 120, price: 60 },
            { name: '대형 체력 물약', value: 250, price: 125 }
        ];

        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                sfx.init();
                const idx = parseInt(btn.dataset.index);
                const itemConfig = shopItemsConfig[idx];
                if (!itemConfig) return;

                if (this.player.gold < itemConfig.price) {
                    this.floaters.add(this.player.x, this.player.y - 15, "골드가 부족합니다!", "#ff3333");
                    sfx.playHit();
                    return;
                }

                // Find empty slot in inventory
                let emptySlotIdx = -1;
                for (let i = 0; i < this.inventory.length; i++) {
                    if (this.inventory.at(i) === null) {
                        emptySlotIdx = i;
                        break;
                    }
                }

                if (emptySlotIdx === -1) {
                    this.floaters.add(this.player.x, this.player.y - 15, "소지품 창이 가득 찼습니다!", "#ff3333");
                    sfx.playHit();
                    return;
                }

                // Deduct gold and add potion item
                this.player.gold -= itemConfig.price;
                const potionItem = {
                    name: itemConfig.name,
                    type: 'potion',
                    slot: 'potion',
                    stat: `사용 시 체력 +${itemConfig.value} 회복`,
                    value: itemConfig.value,
                    rarity: 'normal',
                    color: '#00ff00',
                    reqLevel: 1
                };

                Reflect.set(this.inventory, emptySlotIdx, potionItem);
                sfx.playPotion();
                this.floaters.add(this.player.x, this.player.y - 15, `물약 구매! (-${itemConfig.price} G)`, "#ffd700");

                this.syncInventoryUI();
                this.updateUI();
            });
        });

        document.getElementById('up-fireball').addEventListener('click', () => {
            if (this.player.addSkillPoint('fireball')) {
                sfx.playPotion();
                this.updateUI();
            }
        });

        const startBtn = document.getElementById('start-game-btn');
        const guidePanel = document.getElementById('guide-panel');
        startBtn.addEventListener('click', () => {
            sfx.init();
            guidePanel.classList.add('hidden');
            this.isGameRunning = true;
            this.spawnInitialMonsters();
        });

        document.getElementById('up-atk').addEventListener('click', () => {
            if (this.player.addStat('atk')) {
                sfx.playPotion();
                this.player.recalculateStats(this.inventory);
                this.updateUI();
            }
        });
        document.getElementById('up-maxhp').addEventListener('click', () => {
            if (this.player.addStat('maxhp')) {
                sfx.playPotion();
                this.player.recalculateStats(this.inventory);
                this.updateUI();
            }
        });
        document.getElementById('up-maxmp').addEventListener('click', () => {
            if (this.player.addStat('maxmp')) {
                sfx.playPotion();
                this.player.recalculateStats(this.inventory);
                this.updateUI();
            }
        });

        document.getElementById('slot-potion').addEventListener('click', () => {
            this.triggerPotion();
        });

        document.getElementById('slot-portal').addEventListener('click', () => {
            sfx.init();
            this.triggerTownPortal();
        });

        document.getElementById('slot-lclick').addEventListener('click', () => {
            if (this.isGameRunning) this.triggerMeleeKey();
        });

        document.getElementById('slot-rclick').addEventListener('click', () => {
            if (this.isGameRunning) this.triggerFireballKey();
        });

        const slots = document.querySelectorAll('.inv-slot');
        const descArea = document.getElementById('item-desc');
        slots.forEach(slot => {
            slot.addEventListener('mouseenter', (e) => {
                const idx = parseInt(e.target.dataset.slot);
                const item = this.inventory.at(idx);
                if (item) {
                    descArea.innerHTML = '';
                    
                    const headerGroup = document.createElement('div');
                    headerGroup.style.display = 'flex';
                    headerGroup.style.justifyContent = 'space-between';
                    headerGroup.style.alignItems = 'center';

                    const strong = document.createElement('strong');
                    strong.style.color = item.color;
                    strong.textContent = item.name;
                    headerGroup.appendChild(strong);

                    if (item.equipped) {
                        const eqSpan = document.createElement('span');
                        eqSpan.style.color = '#d4af37';
                        eqSpan.style.fontWeight = 'bold';
                        eqSpan.style.fontSize = '10px';
                        eqSpan.textContent = '[장착 중]';
                        headerGroup.appendChild(eqSpan);
                    } else if (item.slot !== 'potion' && item.type !== 'gem') {
                        const eqSpan = document.createElement('span');
                        eqSpan.style.color = '#888';
                        eqSpan.style.fontSize = '10px';
                        eqSpan.textContent = '[장착 가능]';
                        headerGroup.appendChild(eqSpan);
                    }
                    descArea.appendChild(headerGroup);

                    descArea.appendChild(document.createTextNode(` (${item.rarity.toUpperCase()})`));
                    descArea.appendChild(document.createElement('br'));
                    const lines = item.stat.split('\n');
                    lines.forEach(line => {
                        descArea.appendChild(document.createTextNode(line));
                        descArea.appendChild(document.createElement('br'));
                    });

                    if (item.sockets) {
                        const filled = item.gems ? item.gems.length : 0;
                        const sockSpan = document.createElement('span');
                        sockSpan.style.color = '#9ad0ff';
                        sockSpan.textContent = `소켓: ${'◆'.repeat(filled)}${'◇'.repeat(item.sockets - filled)}`;
                        descArea.appendChild(sockSpan);
                        descArea.appendChild(document.createElement('br'));
                    }

                    if (item.slot !== 'potion' && item.type !== 'gem') {
                        const reqLvl = item.reqLevel || 1;
                        const reqSpan = document.createElement('span');
                        reqSpan.textContent = `요구 레벨: ${reqLvl}`;
                        if (this.player.level < reqLvl) {
                            reqSpan.style.color = '#ff3333';
                            reqSpan.style.fontWeight = 'bold';
                        } else {
                            reqSpan.style.color = '#e0d8cf';
                        }
                        descArea.appendChild(reqSpan);
                        descArea.appendChild(document.createElement('br'));
                    }

                    const span = document.createElement('span');
                    span.style.color = '#888';
                    span.style.fontSize = '10px';
                    if (item.slot === 'potion') {
                        span.textContent = '(클릭: 벨트에 등록 | Shift+클릭: 파괴)';
                    } else if (item.type === 'gem') {
                        span.textContent = '(클릭: 보석 선택 → 소켓 장비 클릭으로 장착 | Shift+클릭: 파괴)';
                    } else {
                        span.textContent = item.equipped ? '(클릭: 장착 해제 | Shift+클릭: 파괴)' : '(클릭: 아이템 장착 | Shift+클릭: 파괴)';
                    }
                    descArea.appendChild(span);
                } else {
                    descArea.textContent = '빈 슬롯';
                }
            });

            slot.addEventListener('mouseleave', () => {
                descArea.textContent = '슬롯 위의 아이템 정보를 보려면 마우스를 올리세요.';
            });

            slot.addEventListener('click', (e) => {
                const idx = parseInt(slot.dataset.slot);
                const item = this.inventory.at(idx);
                if (!item) return;

                sfx.init();

                if (e.shiftKey) {
                    // Shift + Click: Destroy item
                    if (confirm(`'${item.name}'을(를) 파괴하시겠습니까?`)) {
                        Reflect.set(this.inventory, idx, null);
                        if (this.selectedGemIdx === idx) this.selectedGemIdx = null;
                        sfx.playMonsterDeath();
                        this.floaters.add(this.player.x, this.player.y - 15, "파괴됨", "#ff5555");
                    }
                } else {
                    // Regular Click
                    if (item.type === 'gem') {
                        if (this.selectedGemIdx === idx) {
                            this.selectedGemIdx = null;
                            this.floaters.add(this.player.x, this.player.y - 15, "보석 선택 해제", "#aaaaaa");
                        } else {
                            this.selectedGemIdx = idx;
                            this.floaters.add(this.player.x, this.player.y - 15, "소켓이 있는 장비를 클릭하세요", item.color);
                        }
                    } else if (item.slot === 'potion') {
                        this.player.potions.push(item.value);
                        Reflect.set(this.inventory, idx, null);
                        sfx.playPotion();
                        this.floaters.add(this.player.x, this.player.y - 15, `${item.name} 등록`, "#00ff00");
                    } else if (this.selectedGemIdx !== null) {
                        // Socket the selected gem into this equipment
                        const gem = this.inventory.at(this.selectedGemIdx);
                        if (gem && item.sockets && (item.gems ? item.gems.length : 0) < item.sockets) {
                            if (!item.gems) item.gems = [];
                            item.gems.push(gem);
                            item.stat += `\n${gem.name}: ${gem.stat.replace('소켓 장착 시: ', '')}`;
                            Reflect.set(this.inventory, this.selectedGemIdx, null);
                            sfx.playPotion();
                            this.floaters.add(this.player.x, this.player.y - 15, `${gem.name} 소켓 장착!`, gem.color);
                        } else {
                            sfx.playHit();
                            this.floaters.add(this.player.x, this.player.y - 15, "빈 소켓이 없습니다!", "#ff5555");
                        }
                        this.selectedGemIdx = null;
                    } else {
                        // Weapon/Armor Equip Toggle
                        if (item.equipped) {
                            item.equipped = false;
                            sfx.playMonsterDeath(); 
                            this.floaters.add(this.player.x, this.player.y - 15, "장착 해제", "#aaaaaa");
                        } else {
                            if (this.player.level < (item.reqLevel || 1)) {
                                sfx.playHit();
                                this.floaters.add(this.player.x, this.player.y - 15, "레벨 부족!", "#ff3333");
                                return;
                            }
                            // Unequip any other item of the same slot first
                            this.inventory.forEach(otherItem => {
                                if (otherItem && otherItem.slot === item.slot) {
                                    otherItem.equipped = false;
                                }
                            });
                            item.equipped = true;
                            sfx.playPotion(); 
                            this.floaters.add(this.player.x, this.player.y - 15, "장착됨!", "#d4af37");
                        }
                    }
                }
                
                this.syncInventoryUI();
                this.player.recalculateStats(this.inventory);
                this.updateUI();
                slot.dispatchEvent(new Event('mouseenter'));
            });
        });
    }

    setupInputs() {
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());

        this.canvas.addEventListener('wheel', e => {
            e.preventDefault();
            const dir = e.deltaY > 0 ? -0.15 : 0.15;
            this.zoom = Math.min(2.4, Math.max(1.0, this.zoom + dir));
        }, { passive: false });

        this.canvas.addEventListener('mousedown', e => {
            if (!this.isGameRunning) return;
            sfx.init();

            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            this.mouse.isDown = true;
            this.mouse.button = e.button;

            if (e.button === 0) {
                this.handleLeftClick(clickX, clickY);
            } else if (e.button === 2) {
                this.handleRightClick(clickX, clickY);
            }
        });

        this.canvas.addEventListener('mousemove', e => {
            if (!this.isGameRunning) return;
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;

            if (this.mouse.isDown && this.mouse.button === 0 && this.player.state !== 'attack') {
                const cartDest = this.screenToCartesian(this.mouse.x, this.mouse.y);
                this.player.moveTo(cartDest.x, cartDest.y);
            }
        });

        window.addEventListener('mouseup', () => {
            this.mouse.isDown = false;
            this.mouse.button = -1;
        });

        window.addEventListener('keydown', e => {
            sfx.init();
            const code = e.code;
            const key = e.key.toUpperCase();
            if (code === 'KeyW' || code === 'KeyA' || code === 'KeyS' || code === 'KeyD') {
                if (this.isGameRunning) this.keys[code[3]] = true; // 'W','A','S','D'
            } else if (code === 'Comma' || key === ',' || key === '<') {
                if (this.isGameRunning) this.triggerMeleeKey();
            } else if (code === 'Period' || key === '.' || key === '>') {
                if (this.isGameRunning) this.triggerFireballKey();
            } else if (code === 'KeyQ' || key === 'Q') {
                this.triggerPotion();
            } else if (code === 'KeyI' || key === 'I') {
                document.getElementById('inventory-panel').classList.toggle('hidden');
            } else if (code === 'KeyC' || key === 'C') {
                document.getElementById('stats-panel').classList.toggle('hidden');
            } else if (code === 'KeyK' || key === 'K') {
                document.getElementById('skills-panel').classList.toggle('hidden');
            } else if (code === 'KeyT' || key === 'T') {
                this.triggerTownPortal();
            }
        });

        window.addEventListener('keyup', e => {
            const code = e.code;
            if (code === 'KeyW' || code === 'KeyA' || code === 'KeyS' || code === 'KeyD') {
                this.keys[code[3]] = false; // 'W','A','S','D'
            }
        });

        // Drop held movement keys when the window loses focus
        window.addEventListener('blur', () => {
            this.keys = {};
        });
    }

    // Converts held WASD keys (screen directions) into isometric world
    // movement each frame; releasing all keys stops the player.
    processKeyboardMovement() {
        let mx = 0;
        let my = 0;
        if (this.keys.W) my -= 1;
        if (this.keys.S) my += 1;
        if (this.keys.A) mx -= 1;
        if (this.keys.D) mx += 1;

        if (mx !== 0 || my !== 0) {
            let wx = (mx + 2 * my) * 0.5;
            let wy = (2 * my - mx) * 0.5;
            const len = Math.hypot(wx, wy);
            wx /= len;
            wy /= len;
            this.player.moveTo(this.player.x + wx * 50, this.player.y + wy * 50);
            this.movingByKeys = true;
        } else if (this.movingByKeys) {
            this.player.moveTo(this.player.x, this.player.y);
            this.movingByKeys = false;
        }
    }

    triggerPotion() {
        const healed = this.player.usePotion();
        if (healed > 0) {
            sfx.playPotion();
            this.floaters.add(this.player.x, this.player.y - 15, `+${healed} HP`, "#00ff00");
            this.updateUI();
        }
    }

    handleLeftClick(sx, sy) {
        const v = this.screenToVirtual(sx, sy);
        if (this.currentMap === 'town') {
            const isoCam = this.camera.getIsoOffset();
            const npcIso = this.map.worldToIso(this.npc.x, this.npc.y);
            const npx = npcIso.x - isoCam.x + this.canvas.width / 2;
            const npy = npcIso.y - isoCam.y + this.canvas.height / 2;

            if (Math.hypot(v.x - npx, v.y - npy) < 32) {
                const dx = this.npc.x - this.player.x;
                const dy = this.npc.y - this.player.y;
                const dist = Math.hypot(dx, dy);

                if (dist <= 64) {
                    const shopPanel = document.getElementById('shop-panel');
                    if (shopPanel) {
                        shopPanel.classList.toggle('hidden');
                        sfx.playPotion();
                    }
                } else {
                    this.player.moveTo(this.npc.x, this.npc.y);
                    this.floaters.add(this.player.x, this.player.y - 15, "아카라에게 다가갑니다...", "#aaaaaa");
                }
                return;
            }
        }

        const cartDest = this.screenToCartesian(sx, sy);
        let clickedMonster = null;
        for (const m of this.monsters) {
            if (m.state === 'death') continue;
            
            const isoCam = this.camera.getIsoOffset();
            const mIso = this.map.worldToIso(m.x, m.y);
            const msx = mIso.x - isoCam.x + this.canvas.width / 2;
            const msy = mIso.y - isoCam.y + this.canvas.height / 2;

            if (Math.hypot(v.x - msx, v.y - msy) < 32 * (m.scale || 1)) {
                clickedMonster = m;
                break;
            }
        }

        if (clickedMonster) {
            const dist = Math.hypot(clickedMonster.x - this.player.x, clickedMonster.y - this.player.y);
            if (dist <= this.player.attackRange) {
                this.attackMonster(clickedMonster);
            } else {
                this.player.moveTo(clickedMonster.x, clickedMonster.y);
            }
        } else {
            this.player.moveTo(cartDest.x, cartDest.y);
        }
    }

    attackMonster(monster) {
        const dx = monster.x - this.player.x;
        const dy = monster.y - this.player.y;
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += Math.PI * 2;
        this.player.direction = Math.round(angle / (Math.PI / 4)) % 8;

        if (this.player.meleeAttack()) {
            sfx.playSlash();

            // crit calculation
            const baseDamage = this.player.atk;
            const isCrit = Math.random() < (this.player.critChance || 0);
            let damage = baseDamage;
            if (isCrit) {
                damage = Math.floor(damage * (this.player.critMultiplier || 1));
                this.floaters.add(monster.x, monster.y - 10, 'CRIT!', '#ffdd55');
            }

            const expGained = monster.takeDamage(damage, this.floaters, 'physical');
            if (expGained > 0) {
                this.handleMonsterKill(monster);
            }
            this.updateUI();
        }
    }

    handleRightClick(sx, sy) {
        const cartDest = this.screenToCartesian(sx, sy);
        this.castFireball(cartDest.x, cartDest.y);
    }

    castFireball(tx, ty) {
        if (this.currentMap === 'town') {
            this.floaters.add(this.player.x, this.player.y - 15, "마을은 안전지대입니다.", "#00ffff");
            return;
        }
        const effectiveSlvl = this.player.skills.fireball + (this.player.fireballBonus || 0);
        const damageMultiplier = 1.8 + (effectiveSlvl - 1) * 0.4;
        const spellCost = 15 + (effectiveSlvl - 1) * 2.5;

        if (this.player.mp < spellCost) {
            this.floaters.add(this.player.x, this.player.y - 15, "마나 부족!", "#55aaff");
            return;
        }

        this.player.mp -= spellCost;

        const dx = tx - this.player.x;
        const dy = ty - this.player.y;
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += Math.PI * 2;
        this.player.direction = Math.round(angle / (Math.PI / 4)) % 8;

        sfx.playFireball();

        // projectile carries damage type 'fire'
        const fireDamage = Math.floor(this.player.atk * damageMultiplier);
        this.projectiles.push(new Projectile(
            this.player.x,
            this.player.y,
            tx,
            ty,
            fireDamage,
            effectiveSlvl,
            'fire'
        ));

        this.player.state = 'attack';
        this.player.attackTimer = 12;

        this.updateUI();
    }

    findNearestMonster(maxDist) {
        if (this.currentMap !== 'dungeon') return null;
        let nearest = null;
        let nearestDist = maxDist;
        for (const m of this.monsters) {
            if (m.state === 'death') continue;
            const d = Math.hypot(m.x - this.player.x, m.y - this.player.y);
            if (d <= nearestDist) {
                nearestDist = d;
                nearest = m;
            }
        }
        return nearest;
    }

    triggerMeleeKey() {
        const target = this.findNearestMonster(this.player.attackRange);
        if (target) {
            this.attackMonster(target);
        } else if (this.player.meleeAttack()) {
            sfx.playSlash();
        }
    }

    triggerFireballKey() {
        const target = this.findNearestMonster(600);
        if (target) {
            this.castFireball(target.x, target.y);
        } else {
            const angle = this.player.direction * (Math.PI / 4);
            this.castFireball(
                this.player.x + Math.cos(angle) * 120,
                this.player.y + Math.sin(angle) * 120
            );
        }
    }

    // Converts raw screen coords into the unzoomed (virtual) screen space
    // that all world->screen math operates in.
    screenToVirtual(sx, sy) {
        const hw = this.canvas.width / 2;
        const hh = this.canvas.height / 2;
        return {
            x: (sx - hw) / this.zoom + hw,
            y: (sy - hh) / this.zoom + hh
        };
    }

    screenToCartesian(sx, sy) {
        const v = this.screenToVirtual(sx, sy);
        const isoCam = this.camera.getIsoOffset();
        const halfWidth = this.canvas.width / 2;
        const halfHeight = this.canvas.height / 2;
        const isoX = v.x - halfWidth + isoCam.x;
        const isoY = v.y - halfHeight + isoCam.y;
        return this.map.isoToWorld(isoX, isoY);
    }

    applyZoom() {
        const hw = this.canvas.width / 2;
        const hh = this.canvas.height / 2;
        this.ctx.save();
        this.ctx.translate(hw, hh);
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-hw, -hh);
    }

    spawnInitialMonsters() {
        for (let i = 0; i < 5; i++) {
            this.spawnMonster();
        }
    }

    spawnMonster() {
        if (this.monsters.length >= MAX_MONSTERS) return;

        let rx, ry;
        let attempts = 0;
        
        do {
            const row = Math.floor(2 + Math.random() * (this.map.rows - 4));
            const col = Math.floor(2 + Math.random() * (this.map.cols - 4));
            rx = col * this.map.tileSize + this.map.tileSize / 2;
            ry = row * this.map.tileSize + this.map.tileSize / 2;
            attempts++;
        } while ((this.map.isSolid(rx, ry) || Math.hypot(rx - this.player.x, ry - this.player.y) < 200) && attempts < 50);

        // Abort spawning if no valid coordinates were found
        if (this.map.isSolid(rx, ry) || Math.hypot(rx - this.player.x, ry - this.player.y) < 200) {
            return;
        }

        const mLvl = Math.max(1, this.player.level + Math.floor(Math.random() * 3) - 1);
        const rank = Math.random() < 0.10 ? 'champion' : 'normal';
        this.monsters.push(new Monster(rx, ry, mLvl, rank));
    }

    spawnBoss() {
        if (this.monsters.some(m => m.rank === 'boss' && m.state !== 'death')) return;

        const cx = 15 * this.dungeonMap.tileSize + this.dungeonMap.tileSize / 2;
        const cy = 15 * this.dungeonMap.tileSize + this.dungeonMap.tileSize / 2;
        const boss = new Monster(cx, cy, this.player.level + 2, 'boss');
        this.monsters.push(boss);

        sfx.playBossSpawn();
        this.floaters.add(this.player.x, this.player.y - 35, "⚠ 도살자가 깨어났습니다!", '#ff2200');
        this.floaters.add(boss.x, boss.y - 30, "신선한 고기다!", '#ff2200');
    }

    handleMonsterKill(monster) {
        sfx.playMonsterDeath();
        this.player.kills++;

        // Award gold based on monster level and rank
        const goldDropped = Math.floor(monster.level * (5 + Math.random() * 5) * (monster.goldMult || 1));
        this.player.gold += goldDropped;
        this.floaters.add(monster.x, monster.y - 10, `+${goldDropped} G`, '#ffd700');

        const isLeveledUp = this.player.gainExp(monster.expValue);
        if (isLeveledUp) {
            sfx.playLevelUp();
            this.triggerLevelUpBanner();
        }

        this.player.recalculateStats(this.inventory);
        this.updateUI();

        if (monster.rank === 'boss') {
            this.floaters.add(monster.x, monster.y - 25, "도살자 처치!", '#ff5500');
            for (let i = 0; i < 3; i++) {
                this.lootItem(monster.level, true);
            }
        } else if (monster.rank === 'champion') {
            this.lootItem(monster.level);
        } else if (Math.random() < 0.35) {
            this.lootItem(monster.level);
        }

        const gemChance = monster.rank === 'normal' ? 0.08 : 0.25;
        if (Math.random() < gemChance) {
            this.lootGem();
        }

        if (this.player.kills >= this.nextBossKills) {
            this.nextBossKills += BOSS_KILL_INTERVAL;
            this.spawnBoss();
        }
    }

    lootGem() {
        const gemType = GEM_TYPES.at(Math.floor(Math.random() * GEM_TYPES.length));

        const slotIdx = this.inventory.indexOf(null);
        if (slotIdx === -1) {
            this.floaters.add(this.player.x, this.player.y - 25, "인벤토리 가득 참!", "#ff5555");
            return;
        }

        const gem = {
            name: gemType.name,
            type: 'gem',
            slot: 'gem',
            stat: gemType.stat,
            value: 0,
            rarity: 'magic',
            color: gemType.color,
            effect: { ...gemType.effect },
            reqLevel: 1
        };
        Reflect.set(this.inventory, slotIdx, gem);
        this.floaters.add(this.player.x, this.player.y - 25, `${gemType.name} 획득!`, gemType.color);

        this.syncInventoryUI();
        this.updateUI();
    }

    syncInventoryUI() {
        const slots = document.querySelectorAll('.inv-slot');
        slots.forEach((slot, i) => {
            const item = this.inventory.at(i);
            if (item) {
                slot.classList.add('occupied');
                if (item.slot === 'weapon') {
                    slot.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px; transform: rotate(45deg);">🗡️</div>`;
                } else if (item.slot === 'shield') {
                    slot.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🛡️</div>`;
                } else if (item.slot === 'helmet') {
                    slot.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🪖</div>`;
                } else if (item.slot === 'chest') {
                    slot.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🧥</div>`;
                } else if (item.slot === 'potion') {
                    slot.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🧪</div>`;
                } else if (item.type === 'gem') {
                    slot.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px; filter: drop-shadow(0 0 4px ${item.color});">💎</div>`;
                }

                if (item.equipped) {
                    slot.style.borderColor = '#d4af37'; 
                    slot.style.boxShadow = `inset 0 0 8px ${item.color}, 0 0 10px ${item.color}`;
                    const badge = document.createElement('span');
                    badge.style.position = 'absolute';
                    badge.style.top = '2px';
                    badge.style.right = '4px';
                    badge.style.fontSize = '10px';
                    badge.style.color = '#d4af37';
                    badge.style.fontWeight = 'bold';
                    badge.style.textShadow = '1px 1px 2px #000';
                    badge.textContent = 'E';
                    slot.appendChild(badge);
                } else if (this.player.level < (item.reqLevel || 1)) {
                    slot.style.borderColor = '#ff3333';
                    slot.style.boxShadow = 'inset 0 0 10px rgba(255, 0, 0, 0.4)';
                } else {
                    slot.style.borderColor = item.color;
                    slot.style.boxShadow = '';
                }

                if (this.selectedGemIdx === i) {
                    slot.style.borderColor = '#ffffff';
                    slot.style.boxShadow = `0 0 12px ${item.color}`;
                }
            } else {
                slot.classList.remove('occupied');
                slot.style.borderColor = '';
                slot.style.boxShadow = '';
                slot.innerHTML = '';
            }
        });
    }

    lootItem(mLvl = 1, boosted = false) {
        // 1. Roll rarity (boosted rolls — boss drops — are always magic or better)
        const roll = boosted ? 0.7 + Math.random() * 0.3 : Math.random();
        let rarity = 'normal';
        let color = '#b0a89f';
        
        if (roll < 0.70) {
            rarity = 'normal';
            color = '#b0a89f';
        } else if (roll < 0.90) {
            rarity = 'magic';
            color = '#00ffcc';
        } else if (roll < 0.98) {
            rarity = 'rare';
            color = '#ffff00';
        } else {
            rarity = 'unique';
            color = '#ff5500';
        }

        // 2. Select base item or unique item template
        let itemTemplate = null;
        if (rarity === 'unique') {
            const uniques = ITEM_POOL.filter(i => i.rarity === 'unique');
            if (uniques.length > 0) {
                itemTemplate = uniques.at(Math.floor(Math.random() * uniques.length));
            }
        } else {
            const normals = ITEM_POOL.filter(i => i.rarity === 'normal');
            if (normals.length > 0) {
                itemTemplate = normals.at(Math.floor(Math.random() * normals.length));
            }
        }

        if (!itemTemplate) {
            // Fallback if filter failed
            itemTemplate = ITEM_POOL.at(Math.floor(Math.random() * ITEM_POOL.length));
        }

        // Clone item template
        let item = { ...itemTemplate, rarity, color, equipped: false };

        // Determine required level
        let reqLevel = 1;
        if (item.slot !== 'potion') {
            const baseReq = itemTemplate.reqLevel || 1;
            reqLevel = Math.max(baseReq, mLvl + Math.floor(Math.random() * 3) - 1);
        }
        item.reqLevel = reqLevel;

        const scaleMultiplier = 1 + (reqLevel - 1) * 0.15;

        // 3. Apply affixes if magic or rare and not a potion
        if ((rarity === 'magic' || rarity === 'rare') && item.slot !== 'potion') {
            const applicablePrefixes = PREFIXES.filter(p => p.slot.includes(item.slot));
            const applicableSuffixes = SUFFIXES.filter(s => s.slot.includes(item.slot));

            let chosenPrefix = null;
            let chosenSuffix = null;

            if (rarity === 'magic') {
                const typeRoll = Math.random();
                if (typeRoll < 0.4 && applicablePrefixes.length > 0) {
                    chosenPrefix = applicablePrefixes.at(Math.floor(Math.random() * applicablePrefixes.length));
                } else if (typeRoll < 0.8 && applicableSuffixes.length > 0) {
                    chosenSuffix = applicableSuffixes.at(Math.floor(Math.random() * applicableSuffixes.length));
                } else {
                    if (applicablePrefixes.length > 0) chosenPrefix = applicablePrefixes.at(Math.floor(Math.random() * applicablePrefixes.length));
                    if (applicableSuffixes.length > 0) chosenSuffix = applicableSuffixes.at(Math.floor(Math.random() * applicableSuffixes.length));
                }
            } else if (rarity === 'rare') {
                if (applicablePrefixes.length > 0) chosenPrefix = applicablePrefixes.at(Math.floor(Math.random() * applicablePrefixes.length));
                if (applicableSuffixes.length > 0) chosenSuffix = applicableSuffixes.at(Math.floor(Math.random() * applicableSuffixes.length));
            }

            let bonusVal = 0;
            let nameParts = [];

            if (chosenPrefix) {
                nameParts.push(chosenPrefix.name);
                bonusVal += chosenPrefix.value;
            }

            nameParts.push(item.name);

            if (chosenSuffix) {
                nameParts.push(chosenSuffix.name);
                if (chosenSuffix.statType === 'SKILL_FIREBALL') {
                    item.skillFireballBonus = chosenSuffix.value;
                } else {
                    bonusVal += chosenSuffix.value;
                }
            }

            item.name = nameParts.join(' ');
            item.value += bonusVal;
        }

        // Scale values for weapons/armors
        if (item.slot !== 'potion') {
            item.value = Math.floor(item.value * scaleMultiplier);
            
            // Rebuild stat string
            const statParts = [];
            if (itemTemplate.stat.includes('공격력')) {
                statParts.push(`+${item.value} 공격력`);
            } else if (itemTemplate.stat.includes('MP')) {
                statParts.push(`+${item.value} 최대 MP`);
            } else {
                statParts.push(`+${item.value} 최대 HP`);
            }

            if (item.skillFireballBonus) {
                statParts.push(`+${item.skillFireballBonus} 화염구 레벨`);
            }
            
            item.stat = statParts.join('\n');
        }

        // Roll sockets for equipment (0-2)
        if (item.slot !== 'potion') {
            const socketRoll = Math.random();
            item.sockets = socketRoll < 0.45 ? 0 : (socketRoll < 0.8 ? 1 : 2);
            item.gems = [];
        }

        // 4. Place in inventory
        let slotIdx = -1;
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory.at(i) === null) {
                slotIdx = i;
                break;
            }
        }

        if (slotIdx !== -1) {
            Reflect.set(this.inventory, slotIdx, item);
            this.floaters.add(this.player.x, this.player.y - 25, `${item.name} 획득!`, item.color);
            
            this.syncInventoryUI();
            this.player.recalculateStats(this.inventory);
            this.updateUI();
        } else {
            this.floaters.add(this.player.x, this.player.y - 25, "인벤토리 가득 참!", "#ff5555");
        }
    }

    triggerLevelUpBanner() {
        const banner = document.getElementById('level-up-banner');
        banner.classList.remove('hidden');
        const newBanner = banner.cloneNode(true);
        // @ts-ignore
        banner.parentNode.replaceChild(newBanner, banner);
        this.floaters.add(this.player.x, this.player.y - 20, "LEVEL UP!", '#d4af37');
    }

    changeMap(newMapType) {
        this.currentMap = newMapType;
        this.map = newMapType === 'town' ? this.townMap : this.dungeonMap;
    }

    triggerTownPortal() {
        if (!this.isGameRunning) return;
        if (this.currentMap === 'town') {
            this.floaters.add(this.player.x, this.player.y - 15, "마을에서는 차원문을 열 수 없습니다.", "#00ffff");
            return;
        }

        sfx.playPotion();
        
        // Spawn portal at player's location in dungeon
        this.dungeonPortal = new Portal(this.player.x, this.player.y, 'town');
        
        // Spawn portal at town center (8, 8)
        const tx = 8 * this.map.tileSize + this.map.tileSize / 2;
        const ty = 8 * this.map.tileSize + this.map.tileSize / 2;
        this.townPortal = new Portal(tx, ty, 'dungeon');
        
        this.floaters.add(this.player.x, this.player.y - 15, "차원문이 열렸습니다!", "#00ffff");
    }

    updateUI() {
        const healthPercent = (this.player.hp / this.player.maxHp) * 100;
        document.getElementById('health-liquid').style.height = `${healthPercent}%`;
        document.getElementById('health-value').textContent = `${Math.ceil(this.player.hp)}/${this.player.maxHp}`;

        const manaPercent = (this.player.mp / this.player.maxMp) * 100;
        document.getElementById('mana-liquid').style.height = `${manaPercent}%`;
        document.getElementById('mana-value').textContent = `${Math.ceil(this.player.mp)}/${this.player.maxMp}`;

        const xpPercent = (this.player.exp / this.player.nextExp) * 100;
        document.getElementById('xp-fill').style.width = `${xpPercent}%`;

        document.getElementById('hud-level').textContent = this.player.level.toString();
        document.getElementById('potion-count').textContent = this.player.potions.length.toString();

        const goldEl = document.getElementById('stat-gold');
        if (goldEl) {
            goldEl.textContent = `${this.player.gold} G`;
        }

        const buyButtons = document.querySelectorAll('.buy-btn');
        const shopPrices = [15, 30, 60, 125];
        const isInvFull = !this.inventory.includes(null);
        buyButtons.forEach(btn => {
            const btnIdx = parseInt(btn.dataset.index);
            const price = shopPrices[btnIdx] || 0;
            btn.disabled = (this.player.gold < price || isInvFull);
        });

        document.getElementById('stat-level').textContent = this.player.level.toString();
        document.getElementById('stat-atk').textContent = this.player.atk.toString();
        document.getElementById('stat-maxhp').textContent = this.player.maxHp.toString();
        document.getElementById('stat-maxmp').textContent = this.player.maxMp.toString();
        document.getElementById('stat-points').textContent = this.player.statPoints.toString();
        document.getElementById('stat-exp').textContent = `${this.player.exp} / ${this.player.nextExp}`;
        document.getElementById('stat-kills').textContent = this.player.kills.toString();

        const hasPoints = this.player.statPoints > 0;
        document.getElementById('up-atk').disabled = !hasPoints;
        document.getElementById('up-maxhp').disabled = !hasPoints;
        document.getElementById('up-maxmp').disabled = !hasPoints;

        // Skills Panel UI
        const effectiveSlvl = this.player.skills.fireball + (this.player.fireballBonus || 0);
        const damageMultiplier = 1.8 + (effectiveSlvl - 1) * 0.4;
        const spellCost = 15 + (effectiveSlvl - 1) * 2.5;

        document.getElementById('skill-points').textContent = this.player.skillPoints.toString();
        
        let lvlText = `LV ${this.player.skills.fireball}`;
        if (this.player.fireballBonus > 0) {
            lvlText += ` (+${this.player.fireballBonus})`;
        }
        document.getElementById('skill-fireball-level').textContent = lvlText;
        
        document.getElementById('skill-fireball-desc').textContent = `공격력의 ${damageMultiplier.toFixed(1)}배 피해 (마나 ${spellCost.toFixed(0)} 소모)`;
        
        const hasSkillPoints = this.player.skillPoints > 0 && this.player.skills.fireball < 20;
        document.getElementById('up-fireball').disabled = !hasSkillPoints;

        this.syncInventoryUI();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    run() {
        if (!this.isGameRunning) {
            this.ctx.fillStyle = '#080606';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.camera.update(this.player.x, this.player.y);
            this.applyZoom();
            this.map.render(this.ctx, this.camera, this.canvas.width, this.canvas.height);
            this.player.render(this.ctx, this.camera, this.canvas.width, this.canvas.height);
            this.ctx.restore();
            requestAnimationFrame(() => this.run());
            return;
        }

        // --- UPDATE STEP ---
        this.processKeyboardMovement();
        this.player.update(this.map);
        this.camera.update(this.player.x, this.player.y);

        if (this.dungeonPortal) this.dungeonPortal.update();
        if (this.townPortal) this.townPortal.update();
        if (this.currentMap === 'town') {
            this.npc.update();
            const dist = Math.hypot(this.player.x - this.npc.x, this.player.y - this.npc.y);
            if (dist > 80) {
                const shopPanel = document.getElementById('shop-panel');
                if (shopPanel && !shopPanel.classList.contains('hidden')) {
                    shopPanel.classList.add('hidden');
                }
            }
        } else {
            const shopPanel = document.getElementById('shop-panel');
            if (shopPanel && !shopPanel.classList.contains('hidden')) {
                shopPanel.classList.add('hidden');
            }
        }

        // Check portal collisions
        if (this.currentMap === 'dungeon' && this.dungeonPortal) {
            if (Math.hypot(this.player.x - this.dungeonPortal.x, this.player.y - this.dungeonPortal.y) < 24) {
                this.changeMap('town');
                this.player.x = this.townPortal.x + 32;
                this.player.y = this.townPortal.y + 32;
                this.player.targetX = this.player.x;
                this.player.targetY = this.player.y;
                sfx.playPotion();
                this.floaters.add(this.player.x, this.player.y - 15, "마을 도착", "#00ffff");
            }
        } else if (this.currentMap === 'town' && this.townPortal) {
            if (Math.hypot(this.player.x - this.townPortal.x, this.player.y - this.townPortal.y) < 24) {
                const targetX = this.dungeonPortal.x;
                const targetY = this.dungeonPortal.y;
                this.dungeonPortal = null;
                this.townPortal = null;
                this.changeMap('dungeon');
                this.player.x = targetX + 32;
                this.player.y = targetY + 32;
                this.player.targetX = this.player.x;
                this.player.targetY = this.player.y;
                sfx.playPotion();
                this.floaters.add(this.player.x, this.player.y - 15, "던전 진입", "#ff5500");
            }
        }

        if (this.currentMap === 'dungeon') {
            this.spawnTimer++;
            if (this.spawnTimer >= SPAWN_INTERVAL) {
                this.spawnTimer = 0;
                this.spawnMonster();
            }

            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const p = this.projectiles.at(i);
                p.update(this.map);

                let hit = false;
                for (const m of this.monsters) {
                    if (m.state === 'death') continue;
                    if (Math.hypot(p.x - m.x, p.y - m.y) < p.radius + m.radius) {
                        const expGained = m.takeDamage(p.damage, this.floaters, p.type);
                        if (expGained > 0) {
                            this.handleMonsterKill(m);
                        }
                        hit = true;
                        this.updateUI();
                        break;
                    }
                }

                if (hit || p.life <= 0) {
                    this.projectiles.splice(i, 1);
                }
            }

            for (let i = this.monsters.length - 1; i >= 0; i--) {
                const m = this.monsters.at(i);
                const dmgToPlayer = m.update(this.player, this.map);

                if (dmgToPlayer > 0 && this.player.hp > 0) {
                    this.player.hp = Math.max(0, this.player.hp - dmgToPlayer);
                    this.floaters.add(this.player.x, this.player.y - 12, `-${dmgToPlayer}`, '#ff3333');
                    sfx.playHit(); 
                    this.updateUI();

                    if (this.player.hp <= 0) {
                        this.floaters.add(this.player.x, this.player.y - 15, "사망!", "#ff0000");
                        this.isGameRunning = false;
                        alert("사망하셨습니다! 확인을 누르면 재시작합니다.");
                        window.location.reload();
                    }
                }

                if (m.state === 'death' && m.deathTimer <= 0) {
                    this.monsters.splice(i, 1);
                }
            }
        }

        this.floaters.update();

        // --- DRAWING STEP ---
        this.ctx.fillStyle = '#080606';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.applyZoom();
        this.map.render(this.ctx, this.camera, this.canvas.width, this.canvas.height);

        const entities = [];
        entities.push({ type: 'player', ref: this.player, depth: this.player.x + this.player.y });
        
        if (this.currentMap === 'dungeon') {
            for (const m of this.monsters) {
                entities.push({ type: 'monster', ref: m, depth: m.x + m.y });
            }
            for (const p of this.projectiles) {
                entities.push({ type: 'projectile', ref: p, depth: p.x + p.y });
            }
            if (this.dungeonPortal) {
                entities.push({ type: 'portal', ref: this.dungeonPortal, depth: this.dungeonPortal.x + this.dungeonPortal.y });
            }
        } else if (this.currentMap === 'town') {
            if (this.townPortal) {
                entities.push({ type: 'portal', ref: this.townPortal, depth: this.townPortal.x + this.townPortal.y });
            }
            entities.push({ type: 'npc', ref: this.npc, depth: this.npc.x + this.npc.y });
        }

        entities.sort((a, b) => a.depth - b.depth);

        for (const ent of entities) {
            ent.ref.render(this.ctx, this.camera, this.canvas.width, this.canvas.height);
        }

        this.floaters.render(this.ctx, this.camera, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        requestAnimationFrame(() => this.run());
    }
}

// Start game instance on load
window.addEventListener('load', () => {
    const game = new Game();
    window.game = game;
    game.run();
});
