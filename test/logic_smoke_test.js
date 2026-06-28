// Smoke tests for the new Diablo-like mechanics (run with `node test/logic_smoke_test.js`)

class PlayerStub {
  constructor() {
    this.atk = 20;
    this.baseAtk = 20;
    this.attackDuration = 20;
    this.baseAttackDuration = 20;
    this.critChance = 0.05;
    this.critMultiplier = 1.75;
  }

  recalculateStats(inventory) {
    this.attackDuration = this.baseAttackDuration; // reset
    let bonusAtk = 0;
    inventory.forEach(item => {
      if (!item || !item.equipped) return;
      if (item.type === 'weapon') {
        bonusAtk += item.value;
        if (item.speed) this.attackDuration = Math.round(this.baseAttackDuration * item.speed);
      }
    });
    this.atk = this.baseAtk + bonusAtk;
  }
}

class MonsterStub {
  constructor() {
    this.hp = 100;
    this.resists = { fire: 0.25, physical: 0 };
  }

  takeDamage(amount, floaters, type = 'physical') {
    const resist = this.resists[type] || 0;
    const final = Math.max(1, Math.floor(amount * (1 - resist)));
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
  console.log(`Crits: ${crits}/${iterations} -> ${(crits/iterations*100).toFixed(2)}% (expected ~${(p.critChance*100).toFixed(2)}%)`);
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

(function main(){
  console.log('Running logic smoke tests...');
  testCritDistribution(10000);
  testWeaponSpeed();
  testUnequipResetsSpeed();
  testClassBaseAttackDurationSurvivesRecalc();
  testDamageTypeResist();
  testShopPriceFor();
  testSkillScaling();
  testCastingTimer();
  testCastBlocksAction();
  testCastBlocksSkillTrigger();
  testCastProgressUsesDuration();
  console.log('Done.');
})();
