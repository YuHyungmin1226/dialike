/**
 * diaLike - Monolithic Game Controller (Self-Contained & Portable)
 * Combines Camera, Map, Player, Monsters, Audio Synth, and Loop Engine.
 */

// Preprocessor for transparent PNG keying on black background (CORS safe check)
function makeTransparent(img, threshold = 25) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // keying black pixels
        if (r < threshold && g < threshold && b < threshold) {
            data[i + 3] = 0; // alpha = 0
        }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
}

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
    constructor(tileSize = 64) {
        this.tileSize = tileSize;
        this.cols = 30;
        this.rows = 30;
        
        this.tileImage = new Image();
        this.tileImage.src = 'assets/tile_stone.png';
        this.isImageLoaded = false;
        this.tileImage.onload = () => {
            this.isImageLoaded = true;
        };

        this.grid = [];
        this.generateMap();
    }

    generateMap() {
        for (let r = 0; r < this.rows; r++) {
            const rowData = [];
            for (let c = 0; c < this.cols; c++) {
                if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
                    rowData.push(1);
                } 
                else if (Math.random() < 0.05 && (r > 12 && r < 18 && c > 12 && c < 18) === false) {
                    rowData.push(1);
                } else {
                    rowData.push(0);
                }
            }
            this.grid.push(rowData);
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
                const tileType = this.grid[r][c];
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
                    if (this.isImageLoaded) {
                        const imgWidth = this.tileSize * 2;
                        const imgHeight = this.tileSize;
                        ctx.drawImage(
                            this.tileImage, 
                            screenX - imgWidth / 2, 
                            screenY - imgHeight / 2, 
                            imgWidth, 
                            imgHeight
                        );
                    } else {
                        ctx.fillStyle = '#1c1712';
                        ctx.strokeStyle = '#2b2118';
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
                    
                    ctx.fillStyle = '#2d241e';
                    ctx.beginPath();
                    ctx.moveTo(screenX, screenY - w / 2 - heightOffset);
                    ctx.lineTo(screenX + w, screenY - heightOffset);
                    ctx.lineTo(screenX, screenY + w / 2 - heightOffset);
                    ctx.lineTo(screenX - w, screenY - heightOffset);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = '#1e1814';
                    ctx.beginPath();
                    ctx.moveTo(screenX - w, screenY - heightOffset);
                    ctx.lineTo(screenX, screenY + w / 2 - heightOffset);
                    ctx.lineTo(screenX, screenY + w / 2);
                    ctx.lineTo(screenX - w, screenY);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = '#15100d';
                    ctx.beginPath();
                    ctx.moveTo(screenX, screenY + w / 2 - heightOffset);
                    ctx.lineTo(screenX + w, screenY - heightOffset);
                    ctx.lineTo(screenX + w, screenY);
                    ctx.lineTo(screenX, screenY + w / 2);
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = '#4a3b30';
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
        this.potions = 5;
        this.kills = 0;

        this.state = 'idle';
        this.direction = 0;
        
        this.animTimer = 0;
        this.animSpeed = 0.15;
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'assets/hero.png';
        this.processedSheet = null;
        this.isLoaded = false;
        this.spriteSheet.onload = () => {
            try {
                this.processedSheet = makeTransparent(this.spriteSheet);
                this.isLoaded = true;
            } catch(e) {
                // local file fallback (CORS restriction on file:///)
                this.isLoaded = false;
            }
        };

        this.attackDuration = 20;
        this.attackTimer = 0;
        this.attackRange = 45;
        this.spellCost = 15;
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
        if (this.potions > 0 && this.hp < this.maxHp) {
            this.potions--;
            this.hp = Math.min(this.maxHp, this.hp + 50);
            return true;
        }
        return false;
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

        inventory.forEach(item => {
            if (!item) return;
            if (item.type === 'weapon') {
                bonusAtk += item.value;
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

        if (this.hp > this.maxHp) this.hp = this.maxHp;
        if (this.mp > this.maxMp) this.mp = this.maxMp;
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

        const dirRows = [6, 7, 0, 1, 2, 3, 4, 5]; 
        const row = dirRows[this.direction];

        if (this.isLoaded && this.processedSheet) {
            const frameCols = 8;
            const frameRows = 8;
            const frameW = this.spriteSheet.width / frameCols;
            const frameH = this.spriteSheet.height / frameRows;

            let col = 0;
            if (this.state === 'walk') {
                col = Math.floor(this.animTimer) % frameCols;
            } else if (this.state === 'attack') {
                const t = 1 - (this.attackTimer / this.attackDuration);
                col = Math.floor(t * frameCols) % frameCols;
            }

            const drawW = 64;
            const drawH = 64;
            ctx.drawImage(
                this.processedSheet,
                col * frameW,
                row * frameH,
                frameW,
                frameH,
                screenX - drawW / 2,
                screenY - drawH / 2 - 16,
                drawW,
                drawH
            );
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
        return offsets[this.direction] || { x: 0, y: 0 };
    }
}

// ==========================================
// 5. SKELETON MONSTER & COMBAT SYSTEM
// ==========================================
class Monster {
    constructor(x, y, level = 1) {
        this.x = x;
        this.y = y;
        this.radius = 14;
        
        this.level = level;
        this.maxHp = 30 + level * 10;
        this.hp = this.maxHp;
        this.atk = 5 + level * 2;
        this.speed = 1.2 + Math.random() * 0.4;
        this.expValue = 20 + level * 5;

        this.state = 'walk'; 
        this.deathTimer = 40; 
        this.direction = 0;
        
        this.attackCooldown = 0;
        this.attackInterval = 60; 

        this.animTimer = Math.random() * 10;
        this.animSpeed = 0.1;
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'assets/skeleton.png';
        this.processedSheet = null;
        this.isLoaded = false;
        this.spriteSheet.onload = () => {
            try {
                this.processedSheet = makeTransparent(this.spriteSheet);
                this.isLoaded = true;
            } catch(e) {
                // local file fallback (CORS restriction on file:///)
                this.isLoaded = false;
            }
        };
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

        if (dist < 250 && dist > 15) {
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

        if (dist <= 24 && this.attackCooldown === 0) {
            this.attackCooldown = this.attackInterval;
            return this.atk;
        }
        return 0;
    }

    takeDamage(amount, floaters) {
        if (this.state === 'death') return 0;
        
        this.hp -= amount;
        floaters.add(this.x, this.y - 12, amount.toString(), '#ffcc00');

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

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX, screenY + 4, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.isLoaded && this.processedSheet) {
            const frameCols = 8;
            const frameRows = 8;
            const frameW = this.spriteSheet.width / frameCols;
            const frameH = this.spriteSheet.height / frameRows;

            const dirRows = [6, 7, 0, 1, 2, 3, 4, 5]; 
            const row = dirRows[this.direction];
            
            let col = 0;
            if (this.state === 'walk') {
                col = Math.floor(this.animTimer) % frameCols;
            } else if (this.state === 'death') {
                col = 0;
            }

            const drawW = 56;
            const drawH = 56;
            ctx.drawImage(
                this.processedSheet,
                col * frameW,
                row * frameH,
                frameW,
                frameH,
                screenX - drawW / 2,
                screenY - drawH / 2 - 12,
                drawW,
                drawH
            );
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

        ctx.restore();
    }
}

// ==========================================
// 6. FIREBALL PROJECTILE ENGINE
// ==========================================
class Projectile {
    constructor(x, y, tx, ty, damage = 25) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.damage = damage;
        this.life = 70;

        const dx = tx - x;
        const dy = ty - y;
        const dist = Math.hypot(dx, dy);
        const speed = 7;
        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed;
        this.angle = Math.atan2(dy, dx);
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
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff4500';

        const grad = ctx.createRadialGradient(screenX, screenY, 1, screenX, screenY, 12);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#ffcc00');
        grad.addColorStop(0.6, '#ff4500');
        grad.addColorStop(1, 'rgba(255, 69, 0, 0)');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.arc(screenX, screenY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 69, 0, 0.4)';
        ctx.beginPath();
        const trailX = screenX - Math.cos(this.angle) * 10;
        const trailY = screenY - Math.sin(this.angle) * 5;
        ctx.arc(trailX, trailY, 6, 0, Math.PI * 2);
        ctx.fill();

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
            const f = this.floaters[i];
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
    { name: '철제 검', type: 'weapon', stat: '+5 공격력', value: 5, rarity: 'normal', color: '#b0a89f' },
    { name: '룬 단검', type: 'weapon', stat: '+12 공격력', value: 12, rarity: 'rare', color: '#00ffcc' },
    { name: '디아블로의 낫', type: 'weapon', stat: '+30 공격력', value: 30, rarity: 'unique', color: '#ff5500' },
    { name: '가죽 방패', type: 'armor', stat: '+10 최대 HP', value: 10, rarity: 'normal', color: '#b0a89f' },
    { name: '성기사의 방패', type: 'armor', stat: '+40 최대 HP', value: 40, rarity: 'rare', color: '#00ffcc' },
    { name: '강철 투구', type: 'armor', stat: '+25 최대 HP', value: 25, rarity: 'normal', color: '#b0a89f' },
    { name: '대천사의 로브', type: 'armor', stat: '+50 최대 MP', value: 50, rarity: 'unique', color: '#ff5500' },
    { name: '체력 물약', type: 'potion', stat: '클릭하여 물약 개수 +1', value: 1, rarity: 'normal', color: '#00ff00' }
];

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isGameRunning = false;

        this.map = new TileMap(64);
        
        const spawnCartX = 15 * this.map.tileSize + this.map.tileSize / 2;
        const spawnCartY = 15 * this.map.tileSize + this.map.tileSize / 2;
        this.player = new Player(spawnCartX, spawnCartY);
        
        this.camera = new Camera(spawnCartX, spawnCartY);

        this.monsters = [];
        this.projectiles = [];
        this.floaters = new FloaterManager();
        this.spawnTimer = 0;

        this.inventory = new Array(16).fill(null);
        this.mouse = { x: 0, y: 0, isDown: false, button: -1 };
        
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

        const slots = document.querySelectorAll('.inv-slot');
        const descArea = document.getElementById('item-desc');
        slots.forEach(slot => {
            slot.addEventListener('mouseenter', (e) => {
                const idx = parseInt(e.target.dataset.slot);
                const item = this.inventory[idx];
                if (item) {
                    descArea.innerHTML = `<strong style="color: ${item.color}">${item.name}</strong> (${item.rarity.toUpperCase()})<br>${item.stat}<br><span style="color: #888; font-size: 10px;">(클릭하여 사용/파괴)</span>`;
                } else {
                    descArea.textContent = '빈 슬롯';
                }
            });

            slot.addEventListener('click', (e) => {
                const idx = parseInt(slot.dataset.slot);
                const item = this.inventory[idx];
                if (!item) return;

                sfx.init();
                if (item.type === 'potion') {
                    this.player.potions++;
                    this.inventory[idx] = null;
                    sfx.playPotion();
                    this.floaters.add(this.player.x, this.player.y - 15, "물약 +1", "#00ff00");
                } else {
                    if (confirm(`'${item.name}'을(를) 파괴하시겠습니까?`)) {
                        this.inventory[idx] = null;
                        sfx.playMonsterDeath(); 
                        this.floaters.add(this.player.x, this.player.y - 15, "파괴됨", "#ff5555");
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
            const key = e.key.toUpperCase();
            if (key === 'Q') {
                this.triggerPotion();
            } else if (key === 'I') {
                document.getElementById('inventory-panel').classList.toggle('hidden');
            } else if (key === 'C') {
                document.getElementById('stats-panel').classList.toggle('hidden');
            }
        });
    }

    triggerPotion() {
        if (this.player.usePotion()) {
            sfx.playPotion();
            this.floaters.add(this.player.x, this.player.y - 15, "+50 HP", "#00ff00");
            this.updateUI();
        }
    }

    handleLeftClick(sx, sy) {
        const cartDest = this.screenToCartesian(sx, sy);
        let clickedMonster = null;
        for (const m of this.monsters) {
            if (m.state === 'death') continue;
            
            const isoCam = this.camera.getIsoOffset();
            const mIso = this.map.worldToIso(m.x, m.y);
            const msx = mIso.x - isoCam.x + this.canvas.width / 2;
            const msy = mIso.y - isoCam.y + this.canvas.height / 2;

            if (Math.hypot(sx - msx, sy - msy) < 32) {
                clickedMonster = m;
                break;
            }
        }

        if (clickedMonster) {
            const dx = clickedMonster.x - this.player.x;
            const dy = clickedMonster.y - this.player.y;
            const dist = Math.hypot(dx, dy);

            let angle = Math.atan2(dy, dx);
            if (angle < 0) angle += Math.PI * 2;
            this.player.direction = Math.round(angle / (Math.PI / 4)) % 8;

            if (dist <= this.player.attackRange) {
                if (this.player.meleeAttack()) {
                    sfx.playSlash();
                    const expGained = clickedMonster.takeDamage(this.player.atk, this.floaters);
                    if (expGained > 0) {
                        this.handleMonsterKill(expGained);
                    }
                    this.updateUI();
                }
            } else {
                this.player.moveTo(clickedMonster.x, clickedMonster.y);
            }
        } else {
            this.player.moveTo(cartDest.x, cartDest.y);
        }
    }

    handleRightClick(sx, sy) {
        if (this.player.mp < this.player.spellCost) {
            this.floaters.add(this.player.x, this.player.y - 15, "마나 부족!", "#55aaff");
            return;
        }

        const cartDest = this.screenToCartesian(sx, sy);
        this.player.mp -= this.player.spellCost;
        
        const dx = cartDest.x - this.player.x;
        const dy = cartDest.y - this.player.y;
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += Math.PI * 2;
        this.player.direction = Math.round(angle / (Math.PI / 4)) % 8;

        sfx.playFireball();

        this.projectiles.push(new Projectile(
            this.player.x,
            this.player.y,
            cartDest.x,
            cartDest.y,
            Math.floor(this.player.atk * 1.8)
        ));

        this.player.state = 'attack';
        this.player.attackTimer = 12;

        this.updateUI();
    }

    screenToCartesian(sx, sy) {
        const isoCam = this.camera.getIsoOffset();
        const halfWidth = this.canvas.width / 2;
        const halfHeight = this.canvas.height / 2;
        const isoX = sx - halfWidth + isoCam.x;
        const isoY = sy - halfHeight + isoCam.y;
        return this.map.isoToWorld(isoX, isoY);
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

        const mLvl = Math.max(1, this.player.level + Math.floor(Math.random() * 3) - 1);
        this.monsters.push(new Monster(rx, ry, mLvl));
    }

    handleMonsterKill(exp) {
        sfx.playMonsterDeath();
        this.player.kills++;
        
        const isLeveledUp = this.player.gainExp(exp);
        if (isLeveledUp) {
            sfx.playLevelUp();
            this.triggerLevelUpBanner();
        }
        
        this.player.recalculateStats(this.inventory);
        this.updateUI();

        if (Math.random() < 0.35) {
            this.lootItem();
        }
    }

    syncInventoryUI() {
        const slots = document.querySelectorAll('.inv-slot');
        slots.forEach((slot, i) => {
            const item = this.inventory[i];
            if (item) {
                slot.classList.add('occupied');
                slot.style.borderColor = item.color;
                if (item.type === 'weapon') {
                    slot.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px; transform: rotate(45deg);">🗡️</div>`;
                } else if (item.type === 'armor') {
                    slot.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🛡️</div>`;
                } else if (item.type === 'potion') {
                    slot.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🧪</div>`;
                }
            } else {
                slot.classList.remove('occupied');
                slot.style.borderColor = '';
                slot.innerHTML = '';
            }
        });
    }

    lootItem() {
        const item = ITEM_POOL[Math.floor(Math.random() * ITEM_POOL.length)];
        
        let slotIdx = -1;
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] === null) {
                slotIdx = i;
                break;
            }
        }

        if (slotIdx !== -1) {
            this.inventory[slotIdx] = item;
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
        document.getElementById('potion-count').textContent = this.player.potions.toString();

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
            this.map.render(this.ctx, this.camera, this.canvas.width, this.canvas.height);
            this.player.render(this.ctx, this.camera, this.canvas.width, this.canvas.height);
            requestAnimationFrame(() => this.run());
            return;
        }

        // --- UPDATE STEP ---
        this.player.update(this.map);
        this.camera.update(this.player.x, this.player.y);
        
        this.spawnTimer++;
        if (this.spawnTimer >= SPAWN_INTERVAL) {
            this.spawnTimer = 0;
            this.spawnMonster();
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(this.map);

            let hit = false;
            for (const m of this.monsters) {
                if (m.state === 'death') continue;
                if (Math.hypot(p.x - m.x, p.y - m.y) < p.radius + m.radius) {
                    const expGained = m.takeDamage(p.damage, this.floaters);
                    if (expGained > 0) {
                        this.handleMonsterKill(expGained);
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
            const m = this.monsters[i];
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

        this.floaters.update();

        // --- DRAWING STEP ---
        this.ctx.fillStyle = '#080606';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.map.render(this.ctx, this.camera, this.canvas.width, this.canvas.height);

        const entities = [];
        entities.push({ type: 'player', ref: this.player, y: this.player.y });
        for (const m of this.monsters) {
            entities.push({ type: 'monster', ref: m, y: m.y });
        }
        for (const p of this.projectiles) {
            entities.push({ type: 'projectile', ref: p, y: p.y });
        }

        entities.sort((a, b) => a.y - b.y);

        for (const ent of entities) {
            ent.ref.render(this.ctx, this.camera, this.canvas.width, this.canvas.height);
        }

        this.floaters.render(this.ctx, this.camera, this.canvas.width, this.canvas.height);

        requestAnimationFrame(() => this.run());
    }
}

// Start game instance on load
window.addEventListener('load', () => {
    const game = new Game();
    game.run();
});
