// Smoke tests for the new Diablo-like mechanics (run with `node test/logic_smoke_test.js`)

const assert = require('node:assert/strict');
const { CombatSystem } = require('../js/CombatSystem.js');
const { Game, Monster, findGridPath, goldDropForMonster } = require('../js/game.js');

class PlayerStub {
  constructor() {
    this.atk = 20;
    this.baseAtk = 20;
    this.baseMaxHp = 100;
    this.maxHp = 100;
    this.hp = 100;
    this.baseMaxMp = 50;
    this.maxMp = 50;
    this.mp = 50;
    this.level = 1;
    this.exp = 0;
    this.nextExp = 100;
    this.statPoints = 0;
    this.skillPoints = 0;
    this.attackDuration = 20;
    this.baseAttackDuration = 20;
    this.critChance = 0.05;
    this.critMultiplier = 1.75;
  }

  refillResources() {
    this.hp = this.maxHp;
    this.mp = this.maxMp;
  }

  gainExp(amount) {
    this.exp += amount;
    let levelsGained = 0;

    while (this.exp >= this.nextExp) {
      this.exp -= this.nextExp;
      this.level++;
      this.statPoints += 5;
      this.skillPoints += 1;
      this.baseMaxHp += 15;
      this.baseMaxMp += 10;
      this.nextExp = Math.floor(this.nextExp * 1.35);
      levelsGained++;
    }

    return levelsGained;
  }

  recalculateStats(inventory) {
    this.attackDuration = this.baseAttackDuration; // reset
    let bonusAtk = 0;
    let bonusHp = 0;
    let bonusMp = 0;
    inventory.forEach(item => {
      if (!item || !item.equipped) return;
      if (item.gems) {
        item.gems.forEach(gem => {
          bonusAtk += gem.effect.atk || 0;
          bonusHp += gem.effect.hp || 0;
          bonusMp += gem.effect.mp || 0;
        });
      }
      bonusHp += item.bonusHp || 0;
      bonusMp += item.bonusMp || 0;
      if (item.type === 'weapon') {
        bonusAtk += item.value;
        if (item.speed) this.attackDuration = Math.round(this.baseAttackDuration * item.speed);
      }
    });
    this.atk = this.baseAtk + bonusAtk;
    this.maxHp = this.baseMaxHp + bonusHp;
    this.maxMp = this.baseMaxMp + bonusMp;
    if (this.hp > this.maxHp) this.hp = this.maxHp;
    if (this.mp > this.maxMp) this.mp = this.maxMp;
  }
}

class MonsterStub {
  constructor() {
    this.hp = 100;
    this.resists = { fire: 0.25, physical: 0 };
  }

  takeDamage(amount, floaters, type = 'physical') {
    const resist = this.resists[type] || 0;
    const final = Math.max(0, Math.floor(amount * (1 - resist)));
    this.hp -= final;
    return final;
  }
}

class ProjectileStub {
  constructor(damage, type) {
    this.damage = damage;
    this.type = type || 'physical';
  }
}

function testCritDistribution(iterations = 10000) {
  const p = new PlayerStub();
  let crits = 0;
  for (let i = 0; i < iterations; i++) {
    if (Math.random() < p.critChance) crits++;
  }
  const observedRate = crits / iterations;
  console.log(`Crits: ${crits}/${iterations} -> ${(observedRate*100).toFixed(2)}% (expected ~${(p.critChance*100).toFixed(2)}%)`);
  assert.ok(observedRate >= 0.035 && observedRate <= 0.065,
    `critical hit rate ${observedRate} is outside the expected tolerance`);
}

function testWeaponSpeed() {
  const p = new PlayerStub();
  const dagger = { type: 'weapon', value: 5, speed: 0.8, equipped: true };
  const mace = { type: 'weapon', value: 8, speed: 1.2, equipped: true };
  p.recalculateStats([dagger]);
  console.log('Dagger attackDuration:', p.attackDuration);
  p.recalculateStats([mace]);
  console.log('Mace attackDuration:', p.attackDuration);
}

function testUnequipResetsSpeed() {
  const p = new PlayerStub();
  const dagger = { type: 'weapon', value: 5, speed: 0.8, equipped: true };
  p.recalculateStats([dagger]);
  dagger.equipped = false;
  p.recalculateStats([dagger]);
  const ok = p.attackDuration === 20;
  console.log(`Unequip resets attackDuration: ${p.attackDuration} ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) process.exitCode = 1;
}

function testClassBaseAttackDurationSurvivesRecalc() {
  const p = new PlayerStub();
  p.baseAttackDuration = 18;
  p.attackDuration = 18;
  p.recalculateStats([]);
  const ok = p.attackDuration === 18;
  console.log(`classBaseAttackDuration: ${p.attackDuration} ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) process.exitCode = 1;
}

function testLevelUpRefillsToNewCapsAfterRecalc() {
  const p = new PlayerStub();
  const relic = { type: 'relic', bonusHp: 20, bonusMp: 5, equipped: true };

  p.recalculateStats([relic]);
  p.refillResources();

  global.sfx = { playLevelUp() {} };
  const game = Object.create(Game.prototype);
  Object.assign(game, {
    player: p,
    inventory: [relic],
    updateUI() {},
    triggerLevelUpBanner() {}
  });
  game.awardPlayerExp(100);

  const ok = p.hp === p.maxHp && p.mp === p.maxMp;
  console.log(`levelUpRefillsNewCaps: hp=${p.hp}/${p.maxHp}, mp=${p.mp}/${p.maxMp} -> ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) process.exitCode = 1;
}

function testMultiLevelGainReportsCountAndRefills() {
  const p = new PlayerStub();
  const relic = { type: 'relic', bonusHp: 20, bonusMp: 5, equipped: true };

  p.recalculateStats([relic]);
  p.hp = 40;
  p.mp = 12;

  global.sfx = { playLevelUp() {} };
  const game = Object.create(Game.prototype);
  Object.assign(game, {
    player: p,
    inventory: [relic],
    updateUI() {},
    triggerLevelUpBanner() {}
  });
  const levelsGained = game.awardPlayerExp(235);
  const ok =
    levelsGained === 2 &&
    p.level === 3 &&
    p.statPoints === 10 &&
    p.skillPoints === 2 &&
    p.hp === p.maxHp &&
    p.mp === p.maxMp &&
    p.maxHp === 150 &&
    p.maxMp === 75;

  console.log(`multiLevelGain: levels=${levelsGained}, hp=${p.hp}/${p.maxHp}, mp=${p.mp}/${p.maxMp}, statPoints=${p.statPoints}, skillPoints=${p.skillPoints} -> ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) process.exitCode = 1;
}

function testDamageTypeResist() {
  const m = new MonsterStub();
  const projFire = new ProjectileStub(50, 'fire');
  const projPhys = new ProjectileStub(50, 'physical');
  const dmgFire = m.takeDamage(projFire.damage, null, projFire.type);
  const hpAfterFire = m.hp;
  console.log(`Fire hit: raw=50 final=${dmgFire} hp=${hpAfterFire}`);
  // reset
  m.hp = 100;
  const dmgPhys = m.takeDamage(projPhys.damage, null, projPhys.type);
  console.log(`Physical hit: raw=50 final=${dmgPhys} hp=${m.hp}`);
}

function testDamageImmunityAllowsZero() {
  const m = new MonsterStub();
  m.resists.fire = 1;
  const dmg = m.takeDamage(50, null, 'fire');
  const ok = dmg === 0 && m.hp === 100;
  console.log(`damageImmunity: final=${dmg} hp=${m.hp} -> ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) process.exitCode = 1;
}

function testEquipSwapOnlyKeepsLatestItemBonuses() {
  const p = new PlayerStub();
  const sword = { type: 'weapon', slot: 'weapon', value: 5, speed: 0.8, equipped: true };
  const mace = { type: 'weapon', slot: 'weapon', value: 8, speed: 1.2, equipped: false };
  const inventory = [sword, mace];

  p.recalculateStats(inventory);
  const game = Object.create(Game.prototype);
  game.player = p;
  game.inventory = inventory;
  const swapped = game.toggleEquipment(1).ok;
  const ok =
    swapped === true &&
    sword.equipped === false &&
    mace.equipped === true &&
    p.atk === 28 &&
    p.attackDuration === 24;

  console.log(`equipSwapLatestOnly: sword=${sword.equipped}, mace=${mace.equipped}, atk=${p.atk}, attackDuration=${p.attackDuration} -> ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) process.exitCode = 1;
}

function testSocketGemConsumesGemAndUpdatesStats() {
  const p = new PlayerStub();
  const axe = {
    type: 'weapon',
    slot: 'weapon',
    value: 6,
    speed: 1,
    sockets: 1,
    gems: [],
    equipped: true
  };
  const ruby = {
    type: 'gem',
    name: 'Ruby',
    effect: { atk: 4, hp: 10 }
  };
  const inventory = [ruby, axe];

  p.recalculateStats(inventory);
  const game = Object.create(Game.prototype);
  game.player = p;
  game.inventory = inventory;
  game.selectedGemIdx = 0;
  const socketed = game.socketGem(0, 1);
  const ok =
    socketed === true &&
    inventory[0] === null &&
    axe.gems.length === 1 &&
    axe.gems[0] === ruby &&
    p.atk === 30 &&
    p.maxHp === 110;

  console.log(`socketGemUpdatesStats: socketed=${socketed}, gemConsumed=${inventory[0] === null}, gems=${axe.gems.length}, atk=${p.atk}, maxHp=${p.maxHp} -> ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) process.exitCode = 1;
}

function testSocketGemRejectsFullSockets() {
  const p = new PlayerStub();
  const helm = {
    type: 'helmet',
    slot: 'helmet',
    sockets: 1,
    gems: [{ type: 'gem', name: 'Topaz', effect: { mp: 5 } }],
    equipped: true
  };
  const ruby = { type: 'gem', name: 'Ruby', effect: { atk: 4, hp: 10 } };
  const inventory = [ruby, helm];

  p.recalculateStats(inventory);
  const beforeAtk = p.atk;
  const beforeHp = p.maxHp;
  const game = Object.create(Game.prototype);
  game.player = p;
  game.inventory = inventory;
  game.selectedGemIdx = 0;
  const socketed = game.socketGem(0, 1);
  const ok =
    socketed === false &&
    inventory[0] === ruby &&
    helm.gems.length === 1 &&
    p.atk === beforeAtk &&
    p.maxHp === beforeHp;

  console.log(`socketGemRejectsFull: socketed=${socketed}, gemStillInBag=${inventory[0] === ruby}, gems=${helm.gems.length}, atk=${p.atk}, maxHp=${p.maxHp} -> ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) process.exitCode = 1;
}

function testDragSwapKeepsSelectedGemOnSameItem() {
  const ruby = { type: 'gem', name: 'Ruby', effect: { atk: 4 } };
  const sword = { type: 'weapon', slot: 'weapon', value: 5, equipped: false };
  const inventory = [ruby, null, sword];

  const game = Object.create(Game.prototype);
  game.inventory = inventory;
  game.selectedGemIdx = 0;
  const moved = game.swapInventorySlots(0, 1);
  const ok =
    moved === true &&
    game.selectedGemIdx === 1 &&
    inventory[0] === null &&
    inventory[1] === ruby &&
    inventory[2] === sword;

  console.log(`dragSwapSelectedGem: selectedGemIdx=${game.selectedGemIdx}, gemMoved=${inventory[1] === ruby}, sourceEmpty=${inventory[0] === null} -> ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) process.exitCode = 1;
}

function makeInventoryClickFixture({ shopOpen = false } = {}) {
  const originalDocument = global.document;
  const originalSfx = global.sfx;
  const player = new PlayerStub();
  const item = {
    name: 'Test Sword',
    type: 'weapon',
    slot: 'weapon',
    value: 10,
    rarity: 'normal',
    color: '#ccc',
    equipped: true
  };
  const inventory = [item];

  player.recalculateStats(inventory);

  global.document = {
    getElementById(id) {
      if (id !== 'shop-panel') return null;
      return {
        classList: {
          contains(name) {
            return name === 'hidden' ? !shopOpen : false;
          }
        }
      };
    }
  };
  global.sfx = {
    init() {},
    playHit() {},
    playPotion() {},
    playMonsterDeath() {}
  };

  const game = Object.create(Game.prototype);
  Object.assign(game, {
    player,
    inventory,
    selectedGemIdx: null,
    pendingDestroySlotIdx: null,
    pendingDestroyUntilMs: 0,
    floaters: { add() {} },
    updateUI() {},
    syncInventoryUI() {}
  });

  return {
    game,
    inventory,
    item,
    restore() {
      global.document = originalDocument;
      global.sfx = originalSfx;
    }
  };
}

function testShiftClickDestroyRequiresSecondClick() {
  const { game, inventory, item, restore } = makeInventoryClickFixture();
  try {
    const first = game.handleInventorySlotClick(0, { shiftKey: true, nowMs: 1000 });
    const armed =
      first.ok === true &&
      first.action === 'arm-destroy' &&
      inventory[0] === item &&
      game.pendingDestroySlotIdx === 0;

    const second = game.handleInventorySlotClick(0, { shiftKey: true, nowMs: 1400 });
    const destroyed =
      second.ok === true &&
      second.action === 'destroy' &&
      inventory[0] === null &&
      game.pendingDestroySlotIdx === null;

    const ok = armed && destroyed;
    console.log(`shiftClickDestroy: armed=${armed}, destroyed=${destroyed} -> ${ok ? 'OK' : 'FAIL'}`);
    if (!ok) process.exitCode = 1;
  } finally {
    restore();
  }
}

function testShiftClickSellsWhenShopOpen() {
  const { game, inventory, restore } = makeInventoryClickFixture({ shopOpen: true });
  try {
    game.player.gold = 0;
    const result = game.handleInventorySlotClick(0, { shiftKey: true, nowMs: 1000 });
    const ok =
      result.ok === true &&
      result.action === 'sell' &&
      inventory[0] === null &&
      game.player.gold === 10;

    console.log(`shiftClickSell: sold=${result.action === 'sell'}, gold=${game.player.gold} -> ${ok ? 'OK' : 'FAIL'}`);
    if (!ok) process.exitCode = 1;
  } finally {
    restore();
  }
}

// ===== New tests for extracted data functions =====

function shopPriceFor(basePrice, playerLevel) {
  return Math.floor(basePrice * (1 + 0.25 * (playerLevel - 1)));
}

function skillMult(baseMult, multPerLevel, lvl) {
  return baseMult + (lvl - 1) * multPerLevel;
}

function skillCost(baseCost, costPerLevel, lvl) {
  return Math.round(baseCost + (lvl - 1) * costPerLevel);
}

function testShopPriceFor() {
  const tests = [
    { base: 15, level: 1, expected: 15 },
    { base: 15, level: 5, expected: 30 },
    { base: 30, level: 3, expected: 45 },
    { base: 60, level: 10, expected: 195 }
  ];
  let ok = true;
  tests.forEach(t => {
    const result = shopPriceFor(t.base, t.level);
    const pass = result === t.expected;
    if (!pass) { ok = false; console.error(`FAIL: shopPriceFor(${t.base}, ${t.level}) = ${result}, expected ${t.expected}`); }
  });
  console.log(`shopPriceFor: ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) process.exitCode = 1;
}

function testSkillScaling() {
  const fireball = { baseMult: 1.8, multPerLevel: 0.4, baseCost: 15, costPerLevel: 2.5 };
  const tests = [
    { lvl: 1, mult: 1.8, cost: 15 },
    { lvl: 5, mult: 3.4, cost: 25 },
    { lvl: 10, mult: 5.4, cost: 38 }
  ];
  let ok = true;
  tests.forEach(t => {
    const m = skillMult(fireball.baseMult, fireball.multPerLevel, t.lvl);
    const c = skillCost(fireball.baseCost, fireball.costPerLevel, t.lvl);
    const mPass = Math.abs(m - t.mult) < 0.01;
    const cPass = c === t.cost;
    if (!mPass || !cPass) {
      ok = false;
      console.error(`FAIL: skill lvl=${t.lvl}: mult=${m} (expected ${t.mult}), cost=${c} (expected ${t.cost})`);
    }
  });
  console.log(`skillScaling: ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) process.exitCode = 1;
}

function testCastingTimer() {
  // Simulate casting logic: castTimer decrements each tick, blocks actions > 0
  let castTimer = 90;
  let blocked = castTimer > 0;
  const ticks = [];
  while (castTimer > 0) {
    if (castTimer > 0) ticks.push(castTimer);
    castTimer--;
  }
  const completeTicks = ticks.length === 90;
  const endsAtZero = castTimer === 0;
  console.log(`castingTimer: ${completeTicks ? '90 ticks' : ticks.length + ' ticks'}, ends at 0: ${endsAtZero} -> ${completeTicks && endsAtZero ? 'OK' : 'FAIL'}`);
  if (!completeTicks || !endsAtZero) process.exitCode = 1;
}

function testCastBlocksAction() {
  let castTimer = 30;
  const canActWhileCasting = () => castTimer <= 0;
  const blocked = canActWhileCasting() === false;
  castTimer = 0;
  const unblocked = canActWhileCasting() === true;
  console.log(`castBlocksAction: blocked=${blocked}, unblocked=${unblocked} -> ${blocked && unblocked ? 'OK' : 'FAIL'}`);
  if (!blocked || !unblocked) process.exitCode = 1;
}

function testCastBlocksSkillTrigger() {
  const game = {
    castTimer: 90,
    skillCasts: 0,
    triggerSkillKey() {
      if (this.castTimer > 0) return;
      this.skillCasts++;
    }
  };
  game.triggerSkillKey();
  const blocked = game.skillCasts === 0;
  game.castTimer = 0;
  game.triggerSkillKey();
  const unblocked = game.skillCasts === 1;
  console.log(`castBlocksSkillTrigger: blocked=${blocked}, unblocked=${unblocked} -> ${blocked && unblocked ? 'OK' : 'FAIL'}`);
  if (!blocked || !unblocked) process.exitCode = 1;
}

function testCastProgressUsesDuration() {
  const progress = (castTimer, castDuration) => 1 - (castTimer / Math.max(1, castDuration || castTimer));
  const potionStart = progress(30, 30);
  const potionHalf = progress(15, 30);
  const portalHalf = progress(45, 90);
  const ok = potionStart === 0 && potionHalf === 0.5 && portalHalf === 0.5;
  console.log(`castProgressDuration: potionStart=${potionStart}, potionHalf=${potionHalf}, portalHalf=${portalHalf} -> ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) process.exitCode = 1;
}

function makeCombatFixture() {
  const player = {
    x: 0,
    y: 0,
    atk: 20,
    mp: 30,
    state: 'idle',
    attackTimer: 0,
    direction: 0,
    critChance: 0,
    critMultiplier: 1.75,
    effectiveSkillLevel: () => 1
  };
  const game = {
    player,
    currentMap: 'dungeon',
    castTimer: 0,
    monsters: [],
    projectiles: [],
    effects: [],
    floaters: { add() {} },
    updateUI() {},
    handleMonsterKill() {}
  };
  return { game, player, combat: new CombatSystem(game) };
}

function installCombatGlobals() {
  global.SKILLS = {
    whirlwind: { kind: 'melee_aoe', radius: 80, damageType: 'physical', color: '#fff' }
  };
  global.skillCost = () => 14;
  global.skillMult = () => 1;
  global.sfx = { playSlash() {}, playFireball() {}, playHit() {}, playMonsterDeath() {} };
}

function testProductionSkillActionLock() {
  installCombatGlobals();
  const { combat, player } = makeCombatFixture();

  assert.equal(combat.castSkill('whirlwind', 10, 0), true);
  assert.equal(combat.castSkill('whirlwind', 10, 0), false);
  assert.equal(player.mp, 16);
  console.log('productionSkillActionLock: OK');
}

function testProductionAoeUsesTargetSnapshot() {
  installCombatGlobals();
  const { combat, game } = makeCombatFixture();
  let childHits = 0;
  const children = [0, 1].map(() => ({
    x: 5,
    y: 0,
    radius: 8,
    state: 'walk',
    takeDamage() { childHits++; return 0; }
  }));
  const parent = {
    x: 5,
    y: 0,
    radius: 12,
    state: 'walk',
    takeDamage() { this.state = 'death'; return 1; }
  };
  game.monsters.push(parent);
  game.handleMonsterKill = () => game.monsters.push(...children);

  combat.castWhirlwind(100, global.SKILLS.whirlwind);
  assert.equal(childHits, 0);
  assert.equal(game.monsters.length, 3);
  console.log('productionAoeTargetSnapshot: OK');
}

function testProductionGoldMultiplierAllowsZero() {
  assert.equal(goldDropForMonster({ level: 10, goldMult: 0 }, 0.9), 0);
  assert.equal(goldDropForMonster({ level: 2 }, 0), 10);
  console.log('productionGoldMultiplierZero: OK');
}

function testProductionPathfindingAroundWall() {
  global.Image = class ImageStub {};
  global.window = {};
  const rows = 7;
  const cols = 7;
  const tileSize = 10;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let row = 1; row <= 5; row++) grid[row][3] = 1;
  const map = {
    rows,
    cols,
    tileSize,
    grid,
    tileToWorld(col, row) {
      return { x: (col + 0.5) * tileSize, y: (row + 0.5) * tileSize };
    },
    isSolid(x, y) {
      const row = Math.floor(y / tileSize);
      const col = Math.floor(x / tileSize);
      return row < 0 || row >= rows || col < 0 || col >= cols || grid[row][col] === 1;
    }
  };
  const start = map.tileToWorld(1, 3);
  const goal = map.tileToWorld(5, 3);
  const path = findGridPath(map, start.x, start.y, goal.x, goal.y);
  assert.ok(path.length > 0);
  assert.ok(path.some(point => Math.floor(point.y / tileSize) === 0 || Math.floor(point.y / tileSize) === 6));

  const monster = new Monster(start.x, start.y, 1);
  monster.speed = 1;
  const player = { x: goal.x, y: goal.y };
  for (let tick = 0; tick < 300; tick++) monster.update(player, map);
  const remainingDistance = Math.hypot(monster.x - player.x, monster.y - player.y);
  assert.ok(remainingDistance <= 15, `monster remained ${remainingDistance}px from the player`);
  console.log('productionMonsterPathfinding: OK');
}

function testProductionPathfindingScalesToLargeSnakeMap() {
  const rows = 40;
  const cols = 40;
  const tileSize = 10;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1));
  const pathCells = [];

  for (let row = 0; row < rows; row++) {
    if (row % 2 === 0) {
      const leftToRight = Math.floor(row / 2) % 2 === 0;
      const colsInOrder = leftToRight
        ? Array.from({ length: cols }, (_, col) => col)
        : Array.from({ length: cols }, (_, col) => cols - 1 - col);
      colsInOrder.forEach(col => {
        grid[row][col] = 0;
        pathCells.push({ row, col });
      });
    } else {
      const connectorCol = Math.floor((row - 1) / 2) % 2 === 0 ? cols - 1 : 0;
      grid[row][connectorCol] = 0;
      pathCells.push({ row, col: connectorCol });
    }
  }

  const map = {
    rows,
    cols,
    tileSize,
    grid,
    tileToWorld(col, row) {
      return { x: (col + 0.5) * tileSize, y: (row + 0.5) * tileSize };
    }
  };

  const startCell = pathCells[0];
  const goalCell = pathCells[pathCells.length - 1];
  const start = map.tileToWorld(startCell.col, startCell.row);
  const goal = map.tileToWorld(goalCell.col, goalCell.row);

  const limitedPath = findGridPath(map, start.x, start.y, goal.x, goal.y, 640);
  const scaledPath = findGridPath(map, start.x, start.y, goal.x, goal.y);

  const ok = limitedPath.length === 0 && scaledPath.length > 0;
  console.log(`productionLargePathBudget: limited=${limitedPath.length}, scaled=${scaledPath.length} -> ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) process.exitCode = 1;
}

function testProductionTrapTilesAreUnique() {
  const originalRandom = Math.random;
  let seed = 123456789;
  Math.random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  try {
    const rows = 20;
    const cols = 20;
    const tileSize = 10;
    const map = {
      rows,
      cols,
      tileSize,
      rooms: [],
      grid: Array.from({ length: rows }, () => Array(cols).fill(0)),
      spawnPoint: { x: 15, y: 15 },
      stairsPoint: { x: 185, y: 185 },
      bossPoint: null,
      tileToWorld(col, row) {
        return { x: (col + 0.5) * tileSize, y: (row + 0.5) * tileSize };
      }
    };
    const game = Object.create(Game.prototype);
    for (let run = 0; run < 100; run++) {
      const traps = game.buildDungeonProps(map).filter(prop => prop.type === 'trap');
      const keys = new Set(traps.map(trap => `${trap.x},${trap.y}`));
      assert.equal(keys.size, traps.length);
    }
  } finally {
    Math.random = originalRandom;
  }
  console.log('productionTrapTilesUnique: OK');
}

function testProductionManaHudOnlyWritesOnVisibleChange() {
  const originalDocument = global.document;
  const elements = {
    'mana-liquid': { style: {} },
    'mana-value': { textContent: '' }
  };
  global.document = { getElementById: id => elements[id] };
  try {
    const game = Object.create(Game.prototype);
    game.player = { mp: 2, maxMp: 30 };
    game.manaUiSignature = '';
    assert.equal(game.updateManaUI(), true);
    game.player.mp = 2.2;
    assert.equal(game.updateManaUI(), true);
    game.player.mp = 2.8;
    assert.equal(game.updateManaUI(), false);
    assert.equal(elements['mana-value'].textContent, '3/30');
  } finally {
    global.document = originalDocument;
  }
  console.log('productionManaHudRefresh: OK');
}

(function main(){
  console.log('Running logic smoke tests...');
  testCritDistribution(10000);
  testWeaponSpeed();
  testUnequipResetsSpeed();
  testClassBaseAttackDurationSurvivesRecalc();
  testLevelUpRefillsToNewCapsAfterRecalc();
  testMultiLevelGainReportsCountAndRefills();
  testDamageTypeResist();
  testDamageImmunityAllowsZero();
  testEquipSwapOnlyKeepsLatestItemBonuses();
  testSocketGemConsumesGemAndUpdatesStats();
  testSocketGemRejectsFullSockets();
  testDragSwapKeepsSelectedGemOnSameItem();
  testShiftClickDestroyRequiresSecondClick();
  testShiftClickSellsWhenShopOpen();
  testShopPriceFor();
  testSkillScaling();
  testCastingTimer();
  testCastBlocksAction();
  testCastBlocksSkillTrigger();
  testCastProgressUsesDuration();
  testProductionSkillActionLock();
  testProductionAoeUsesTargetSnapshot();
  testProductionGoldMultiplierAllowsZero();
  testProductionPathfindingAroundWall();
  testProductionPathfindingScalesToLargeSnakeMap();
  testProductionTrapTilesAreUnique();
  testProductionManaHudOnlyWritesOnVisibleChange();
  console.log('Done.');
})();
