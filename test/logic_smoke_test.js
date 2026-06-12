// Smoke tests for the new Diablo-like mechanics (run with `node test/logic_smoke_test.js`)

class PlayerStub {
  constructor() {
    this.atk = 20;
    this.baseAtk = 20;
    this.attackDuration = 20;
    this.critChance = 0.05;
    this.critMultiplier = 1.75;
  }

  recalculateStats(inventory) {
    this.attackDuration = 20; // reset
    let bonusAtk = 0;
    inventory.forEach(item => {
      if (!item || !item.equipped) return;
      if (item.type === 'weapon') {
        bonusAtk += item.value;
        if (item.speed) this.attackDuration = Math.round(20 * item.speed);
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

(function main(){
  console.log('Running logic smoke tests...');
  testCritDistribution(10000);
  testWeaponSpeed();
  testUnequipResetsSpeed();
  testDamageTypeResist();
  console.log('Done.');
})();
