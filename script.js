/* UTIL: number formatting */
const fmt = (n)=> n.toLocaleString(undefined,{maximumFractionDigits:0});

/* YEAR */
document.getElementById('year').textContent = new Date().getFullYear();

/* MOBILE NAV */
const menuBtn = document.querySelector('.menu');
menuBtn?.addEventListener('click', ()=>{
  const links = document.querySelector('.links');
  if(!links) return;
  links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
  links.style.flexDirection = 'column';
  links.style.position = 'absolute';
  links.style.top = '64px';
  links.style.right = '12px';
  links.style.background = 'rgba(12,12,16,.95)';
  links.style.padding = '14px';
  links.style.border = '1px solid rgba(255,255,255,.08)';
  links.style.borderRadius = '12px';
});

/* FIRE BACKGROUND (canvas particles) */
(function fireBG(){
  const c = document.getElementById('fire-canvas');
  const ctx = c.getContext('2d');
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w, h;
  const particles = [];
  const COUNT = 140;

  function resize(){
    w = c.width = innerWidth * dpr;
    h = c.height = innerHeight * dpr;
    c.style.width = innerWidth + 'px';
    c.style.height = innerHeight + 'px';
  }
  window.addEventListener('resize', resize); resize();

  function spawn(){
    const x = (Math.random() * w);
    const y = h - Math.random()*50;
    const s = Math.random()*2 + 1;
    const vy = - (Math.random()*1.5 + .8);
    const life = Math.random()*140 + 80;
    particles.push({x,y,s,vy,life});
  }

  function step(){
    ctx.clearRect(0,0,w,h);
    if(particles.length < COUNT) spawn();
    for(let p of particles){
      p.y += p.vy;
      p.life -= 1;
      const alpha = Math.max(p.life/180, 0);
      const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,18*p.s);
      grad.addColorStop(0, `rgba(255, 170, 0, ${alpha})`);
      grad.addColorStop(.5, `rgba(255, 80, 0, ${alpha*.8})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x,p.y,18*p.s,0,Math.PI*2);
      ctx.fill();
    }
    for(let i=particles.length-1;i>=0;i--){
      if(particles[i].life<=0) particles.splice(i,1);
    }
    requestAnimationFrame(step);
  }
  step();
})();

/* DEMO DATA (Replace with on-chain calls) */
let totalSupply = 1_000_000_000; // start demo
let burnedTotal = 124_523_550;
let burnedToday = 2_345_120;
let currentMC = 720_000; // demo USD
let lastBurn = { amount: 120_000, tx: '#', time: new Date().toLocaleTimeString() };

function updateTicker(){
  document.getElementById('liveSupply').textContent = fmt(totalSupply - burnedTotal);
  document.getElementById('burnedToday').textContent = fmt(burnedToday);
  document.getElementById('burnedTotal').textContent = fmt(burnedTotal);
}
updateTicker();

/* Simulate ticking supply (visual only) */
setInterval(()=>{
  const inc = Math.floor(Math.random()*8000);
  burnedTotal += inc;
  burnedToday += inc/2|0;
  updateTicker();
}, 3200);

/* Live Burn Tracker numbers */
document.getElementById('statToday').textContent = fmt(burnedToday);
document.getElementById('statSupply').textContent = fmt(totalSupply - burnedTotal);
document.getElementById('statLastBurn').textContent = fmt(lastBurn.amount) + ' tokens';
document.getElementById('txLink').href = lastBurn.tx;

/* Chart.js supply over time */
let ctx = document.getElementById('supplyChart');
if(ctx && window.Chart){
  const labels = Array.from({length: 30}, (_,i)=> `Day ${i+1}`);
  let supply = labels.map((_,i)=> Math.round(1_000_000_000 * Math.pow(0.985, i))); // decay
  new Chart(ctx, {
    type:'line',
    data:{
      labels,
      datasets:[{
        label:'Total Supply',
        data:supply,
        tension:.35,
        fill:true,
        borderWidth:2
      }]
    },
    options:{
      plugins:{legend:{display:false}},
      scales:{
        y:{grid:{display:false}},
        x:{grid:{display:false}}
      },
    }
  });
}

/* Milestone progress */
const milestones = [1_000_000, 5_000_000, 10_000_000];
function setMC(mc){
  const next = milestones.find(m=> m>mc) || milestones[milestones.length-1];
  const prev = milestones.findLast ? milestones.findLast(m=> m<=mc) : milestones.filter(m=> m<=mc).pop() || 0;
  const p = Math.min((mc - prev)/(next - prev), 1);
  document.getElementById('currentMC').textContent = `$${fmt(mc)}`;
  document.getElementById('nextMilestone').textContent = `$${fmt(next)}`;
  document.getElementById('mcProgress').style.width = (p*100)+'%';
}
setMC(currentMC);
setInterval(()=>{ currentMC += Math.floor(Math.random()*8000); setMC(currentMC); }, 4000);

/* GSAP entrance animations */
window.addEventListener('load', ()=>{
  gsap.registerPlugin(ScrollTrigger);
  gsap.from('.hero-inner > *', {y: 20, opacity:0, stagger:.08, duration:.8, ease:'power3.out'});
  gsap.utils.toArray('.step').forEach((el,i)=>{
    gsap.from(el, {scrollTrigger:{trigger:el,start:'top 80%'}, y:30, opacity:0, duration:.7, delay:i*.05});
  });
  gsap.from('.diagram .bar', {scrollTrigger:{trigger:'.diagram',start:'top 85%'}, scaleY:0, transformOrigin:'bottom', duration:.9, stagger:.1});
  gsap.from('.track-card, .chart-wrap, .cap-box, .burn-table, .lore-text, .pill, .cta-card, details', {scrollTrigger:{trigger:'.tracker',start:'top 80%'}, y:20, opacity:0, duration:.6, stagger:.08});
});

/* Modal for "View Burns Live" */
document.querySelectorAll('a[href="#tracker"], .btn.outline').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    renderMini();
  });
});
document.getElementById('closeModal').addEventListener('click', ()=> document.getElementById('modal').classList.add('hidden'));
document.getElementById('modal').addEventListener('click', (e)=>{ if(e.target.id==='modal') e.currentTarget.classList.add('hidden') });

/* Mini chart in modal */
function renderMini(){
  const el = document.getElementById('burnsMini');
  if(!window.Chart || !el) return;
  const labels = Array.from({length:24}, (_,i)=> `${i}:00`);
  const vals = labels.map(()=> Math.round(Math.random()*1_500_000));
  new Chart(el, { type:'bar', data:{labels, datasets:[{label:'Burns', data:vals}]}, options:{plugins:{legend:{display:false}}, scales:{x:{display:false}}}});
}

/* Smooth scroll */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});
