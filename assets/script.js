const toggle=document.querySelector('.nav-toggle');
const nav=document.querySelector('.main-nav');
const dropdown=document.querySelector('.nav-dropdown');
const productsLink=dropdown?.querySelector(':scope > a');
const closeNav=()=>{nav?.classList.remove('open');dropdown?.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');document.body.classList.remove('nav-open')};
toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));document.body.classList.toggle('nav-open',open);if(!open)dropdown?.classList.remove('is-open')});
productsLink?.addEventListener('click',e=>{if(window.matchMedia('(max-width:980px)').matches){e.preventDefault();dropdown.classList.toggle('is-open');productsLink.setAttribute('aria-expanded',String(dropdown.classList.contains('is-open')))}});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{if(a===productsLink&&window.matchMedia('(max-width:980px)').matches)return;if(!a.closest('.nav-dropdown')||a.closest('.dropdown-menu'))closeNav()}));
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
const countObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;const target=+el.dataset.count;let v=0;const step=Math.max(1,Math.ceil(target/40));const timer=setInterval(()=>{v=Math.min(target,v+step);el.textContent=v;if(v>=target)clearInterval(timer)},35);countObserver.unobserve(el)}),{threshold:.7});
document.querySelectorAll('[data-count]').forEach(el=>countObserver.observe(el));

(()=>{
  const blocks=[...document.querySelectorAll('.category-block')];
  if(!blocks.length)return;
  const group=new URLSearchParams(location.search).get('group');
  const copy={
    construction:{title:'Construction Machinery',text:'Four products for concrete production and cement / flyash storage.'},
    road:{title:'Road Machinery',text:'Five products for crushing, screening and washing.'},
    mining:{title:'Mining Machinery',text:'Two products for excavation and mine crushing.'}
  };
  if(!copy[group])return;
  blocks.forEach(block=>{if(block.id!==group)block.remove()});
  const h1=document.querySelector('.page-hero h1');
  const intro=document.querySelector('.page-hero p');
  const crumb=document.querySelector('.breadcrumbs span:last-child');
  if(h1)h1.textContent=copy[group].title;
  if(intro)intro.textContent=copy[group].text;
  if(crumb)crumb.textContent=copy[group].title;
  document.title=copy[group].title+' | Mech Equip International';
})();


// Homepage hero slider
(()=>{
  const slider=document.querySelector('.hero-slider');
  if(!slider)return;
  const slides=[...slider.querySelectorAll('.hero-slide')];
  const dots=[...slider.querySelectorAll('.hero-dot')];
  const prev=slider.querySelector('.hero-prev');
  const next=slider.querySelector('.hero-next');
  let current=0,timer;
  const show=(i)=>{
    current=(i+slides.length)%slides.length;
    slides.forEach((s,idx)=>s.classList.toggle('is-active',idx===current));
    dots.forEach((d,idx)=>d.classList.toggle('is-active',idx===current));
  };
  const start=()=>{clearInterval(timer);timer=setInterval(()=>show(current+1),5500)};
  prev?.addEventListener('click',()=>{show(current-1);start()});
  next?.addEventListener('click',()=>{show(current+1);start()});
  dots.forEach((d,i)=>d.addEventListener('click',()=>{show(i);start()}));
  slider.addEventListener('mouseenter',()=>clearInterval(timer));
  slider.addEventListener('mouseleave',start);
  slider.addEventListener('focusin',()=>clearInterval(timer));
  slider.addEventListener('focusout',start);
  start();
})();

// Touch swipe for homepage hero (mobile/tablet). Auto-play continues after swipe.
(()=>{
  const slider=document.querySelector('.hero-slider');
  if(!slider)return;
  const slides=[...slider.querySelectorAll('.hero-slide')];
  const dots=[...slider.querySelectorAll('.hero-dot')];
  let startX=0,startY=0;
  const activate=(dir)=>{
    let current=slides.findIndex(s=>s.classList.contains('is-active'));
    if(current<0)current=0;
    const next=(current+dir+slides.length)%slides.length;
    slides.forEach((s,i)=>s.classList.toggle('is-active',i===next));
    dots.forEach((d,i)=>d.classList.toggle('is-active',i===next));
    // sync the existing slider's next button click only to restart its auto timer
    // without showing arrows on mobile.
    const btn=dir>0?slider.querySelector('.hero-next'):slider.querySelector('.hero-prev');
    if(btn){btn.dispatchEvent(new MouseEvent('click',{bubbles:false}));}
  };
  slider.addEventListener('touchstart',e=>{
    const t=e.changedTouches[0]; startX=t.clientX; startY=t.clientY;
  },{passive:true});
  slider.addEventListener('touchend',e=>{
    const t=e.changedTouches[0],dx=t.clientX-startX,dy=t.clientY-startY;
    if(Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.2){
      activate(dx<0?1:-1);
    }
  },{passive:true});
})();

// Device-specific WhatsApp and actual PHP submission.
document.querySelectorAll('.whatsapp-btn').forEach(a=>{const mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);if(mobile)a.href=a.href.replace('web.whatsapp.com','api.whatsapp.com');});
document.querySelectorAll('.inquiry-form').forEach(form=>{form.elements.source.value=location.href;form.addEventListener('submit',()=>{const button=form.querySelector('[type=submit]');button.disabled=true;button.textContent='Sending...';});});
window.addEventListener('pageshow',()=>document.querySelectorAll('.inquiry-form [type=submit]').forEach(b=>{b.disabled=false;b.textContent='Submit Inquiry';}));
