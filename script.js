@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
:root{--yellow:#b8e5e8;--blue:#69b9cf;--pink:#ff3169;--green:#20d366;--ink:#080808;--paper:#fff}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--yellow);color:var(--ink);font-family:Nunito,Arial,sans-serif;font-weight:700}
button,a{font:inherit}
button{cursor:pointer}
.hidden{display:none!important}
.salted-bg{background-color:var(--yellow);background-image:radial-gradient(ellipse at 12% 18%,rgba(255,255,255,.55) 0 4%,transparent 4.5%),radial-gradient(ellipse at 85% 75%,rgba(0,89,220,.10) 0 8%,transparent 8.5%),linear-gradient(135deg,transparent 0 47%,rgba(255,255,255,.2) 48% 52%,transparent 53%);background-size:230px 210px,300px 280px,100% 100%;background-attachment:fixed}
.opening{min-height:100svh;display:flex;align-items:center;justify-content:center;padding:76px 20px 35px;text-align:center;position:relative;overflow:hidden}
.skip-btn{position:absolute;right:20px;top:22px;background:#fff;border:4px solid var(--ink);border-radius:17px;padding:13px 20px;box-shadow:5px 5px 0 var(--ink);font-weight:900}
.opening-content{width:min(100%,440px);display:flex;align-items:center;flex-direction:column;gap:12px}
.logo-ring{width:200px;height:200px;position:relative;border:10px solid transparent;border-radius:50%;display:grid;place-items:center;animation:none;margin-bottom:14px}
.logo-ring::before{content:"";position:absolute;inset:-10px;border:10px solid var(--ink);border-top-color:var(--pink);border-right-color:var(--pink);border-radius:50%;animation:ringLoading 1.1s linear infinite;pointer-events:none}
.logo-tile{width:132px;height:132px;display:grid;place-items:center;background:linear-gradient(145deg,#1682ff,#0643c9);border:7px solid var(--ink);border-radius:28px;box-shadow:0 8px 0 var(--ink);color:white;font-size:56px;font-weight:900;text-shadow:3px 3px #111}
.opening h1{font-size:clamp(23px,6vw,34px);line-height:1.05;margin:0;text-shadow:2px 2px white,-2px -2px white}
.tagline{margin:0 0 22px;font-size:13px;letter-spacing:1.5px}
.loading-card{width:100%;background:var(--blue);color:#fff;border:6px solid var(--ink);border-radius:30px;padding:22px 12px;box-shadow:8px 8px 0 var(--ink);display:flex;flex-direction:column;gap:6px;text-shadow:2px 2px #111}
.loading-card strong{font-size:17px}.loading-card span{font-size:15px}
.loading-bar{height:8px;background:#0036a5;border-radius:99px;overflow:hidden;margin-bottom:8px}
.loading-bar span{display:block;width:40%;height:100%;background:#4fbcff;border-radius:99px;animation:load 3s linear forwards}
@keyframes load{to{width:100%}}
@keyframes ringLoading{to{transform:rotate(360deg)}}
.opening-content>*{animation:enterUp .65s cubic-bezier(.2,.75,.25,1) both}
.opening-content>*:nth-child(1){animation-delay:.05s}.opening-content>*:nth-child(2){animation-delay:.18s}.opening-content>*:nth-child(3){animation-delay:.28s}.opening-content>*:nth-child(4){animation-delay:.38s}
.opening.leaving .opening-content>*{animation:exitUp .55s ease-in forwards}
@keyframes enterUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes exitUp{to{opacity:0;transform:translateY(-75px)}}
.opening small{margin-top:10px;font-size:12px}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:10;display:grid;place-items:center;padding:22px}
.invite-card{width:min(100%,430px);max-height:calc(100svh - 36px);overflow-y:auto;position:relative;background:#fff;border:4px solid var(--ink);border-radius:27px;padding:30px 18px 18px;box-shadow:7px 7px 0 var(--yellow);animation:popupIn .45s cubic-bezier(.2,.8,.2,1) both}
.close-btn{position:absolute;right:-20px;top:-24px;width:48px;height:48px;border:4px solid var(--ink);border-radius:50%;background:var(--pink);font-size:32px;line-height:1;font-weight:900;box-shadow:3px 3px 0 var(--ink)}
.invite-top{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#666;letter-spacing:.8px;font-size:10px;font-weight:900}
.active-pill{white-space:nowrap;color:#111;border:3px solid #111;border-radius:30px;padding:7px 12px;box-shadow:0 0 14px #83f4a2}
.active-pill:first-letter{color:var(--green)}
.dash{border-top:4px dashed #111;margin:24px 0}
.invite-info{display:flex;align-items:flex-start;gap:13px;margin:18px 0 22px}
.wa-icon{flex-shrink:0;width:64px;height:64px;background:var(--green);border:3px solid var(--ink);border-radius:18px;display:grid;place-items:center;box-shadow:0 5px 0 var(--ink);animation:waWave 2.2s ease-in-out infinite}.wa-icon svg{width:43px;height:43px}.wa-btn-icon{width:30px;height:30px;margin-right:10px;flex-shrink:0}
@keyframes waWave{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-4px) rotate(-3deg)}50%{transform:translateY(0) rotate(0)}75%{transform:translateY(3px) rotate(3deg)}}
@keyframes popupIn{from{opacity:0;transform:translateY(18px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
.invite-info h2{font-size:clamp(18px,4.8vw,22px);line-height:1.15;margin:5px 0}
.invite-info p{font-size:14px;line-height:1.45;color:#555;margin:0}
.btn{display:flex;align-items:center;justify-content:center;text-align:center;text-decoration:none;border:5px solid var(--ink);border-radius:24px;padding:19px 15px;color:#07120b;font-weight:900;letter-spacing:1.5px;box-shadow:0 7px 0 var(--ink);transition:transform .12s,box-shadow .12s}
.btn:active,.service-card:active{transform:translateY(4px);box-shadow:0 2px 0 var(--ink)}
.green-btn{background:var(--green);font-size:15px;padding:13px 10px;border-width:3px;border-radius:17px;letter-spacing:.5px}
.tiny-note{font-size:12px;line-height:1.5;color:#666;text-align:center;margin:18px 0 0}
.page{min-height:100svh;padding:24px 16px 85px;animation:pageIn .55s ease both}
@keyframes pageIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.store-header{text-align:center;max-width:680px;margin:0 auto 28px}
.small-logo{width:112px;height:112px;margin:0 auto 18px;font-size:45px;border-radius:25px}
.store-header h1{font-size:clamp(24px,6vw,34px);margin:0 0 8px}
.store-header p{font-size:16px;margin:0;line-height:1.45}
.service-list{max-width:700px;margin:auto;display:grid;gap:18px}
.service-card{width:100%;display:flex;align-items:center;gap:16px;text-align:left;background:#050505;color:#fff;border:0;border-radius:28px;padding:20px 17px;min-height:122px;box-shadow:0 9px 0 rgba(0,0,0,.22);transition:transform .12s}
.service-emoji{width:76px;height:76px;flex-shrink:0;display:grid;place-items:center;background:#b8e5e8;border:4px solid #fff;border-radius:23px;font-size:34px}
.service-copy{display:flex;flex-direction:column;gap:5px;flex:1}
.service-copy strong{font-size:clamp(16px,4.2vw,21px);line-height:1.2}
.service-copy small{color:#25d76d;font-size:15px;line-height:1.3}
.arrow{font-size:29px;padding-left:3px}
.info-panel{max-width:700px;margin:28px auto 0;background:rgba(255,255,255,.42);border:4px solid #111;padding:14px 12px}
.info-panel h2{font-size:20px;margin:0 0 20px}.info-panel p{font-size:16px;line-height:1.5;margin:10px 0}
.profile-panel h2{margin-bottom:20px}.profile-panel h3{font-size:22px;margin:0}.verified{color:#078b43}
.bottom-nav{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:center;gap:8px;background:var(--yellow);padding:10px 8px calc(10px + env(safe-area-inset-bottom));border-top:3px solid #111;z-index:4}
.bottom-nav a{background:#fff;color:#111;border:2px solid #111;border-radius:9px;text-decoration:none;padding:8px 10px;font-size:13px}
.back-btn{background:#fff;border:3px solid #111;border-radius:14px;padding:10px 14px;box-shadow:4px 4px #111;margin:0 0 24px}
.payment-card{max-width:540px;margin:0 auto;background:#fff;border:5px solid #111;border-radius:30px;padding:25px 20px;box-shadow:8px 8px 0 #111;text-align:center}
.eyebrow{font-size:12px;letter-spacing:1.5px;color:#666}
.payment-card h1{font-size:clamp(25px,6vw,34px);line-height:1.1;margin:12px 0}
.selected-service{background:#fff2a6;border:2px dashed #111;border-radius:12px;padding:10px}
.qris-image{display:block;width:min(100%,390px);height:auto;object-fit:contain;margin:18px auto;border:2px solid #eee;border-radius:12px}
.payment-warning{background:#fff1bd;border-left:5px solid #ffb300;text-align:left;padding:12px 14px;margin:16px 0;border-radius:8px}
.payment-warning p{font-size:14px;line-height:1.5;margin:6px 0 0}
.confirm-btn{background:var(--green);font-size:16px;letter-spacing:.3px}
.opening-content .logo-ring{animation-delay:.05s}.opening-content .loading-card{animation-delay:.38s}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}}
@media(max-width:420px){.invite-card{padding:28px 14px 16px}.invite-info{gap:13px}.invite-info h2{font-size:22px}.invite-info p{font-size:15px}.wa-icon{width:68px;height:68px;font-size:30px}.service-card{gap:12px;padding:16px 12px;min-height:110px}.service-emoji{width:62px;height:62px;font-size:29px}.bottom-nav a{font-size:12px;padding:7px 8px}}

/* Logo resmi DZ: gambar tetap diam, hanya ring loading yang berputar. */
.brand-logo{display:block;object-fit:contain;background:#000;}
.opening .brand-logo{width:150px;height:150px;border-radius:0;}
.small-logo{display:block;width:112px;height:112px;object-fit:contain;margin:0 auto 18px;border:0;border-radius:0;box-shadow:none;background:#000;}
.logo-ring{border:0;border-radius:50%;}
.logo-ring::before{inset:-8px;border-width:5px;border-top-color:#fff;border-right-color:#1685a0;border-bottom-color:#fff;border-left-color:#1685a0;}
/* Pop-up majalah pada halaman utama */
.magazine-card{position:relative;width:min(100%,390px);background:#b8e5e8;border:4px solid #080808;border-radius:8px;padding:23px 18px 18px;box-shadow:8px 8px 0 #080808;overflow:hidden;animation:popupIn .35s ease both;}
.magazine-kicker{display:flex;justify-content:space-between;gap:10px;font-size:10px;letter-spacing:1.2px;font-weight:900;border-bottom:2px solid #080808;padding:0 0 12px;}
.magazine-pages{position:relative;min-height:245px;margin:15px 0 12px;}
.magazine-page{display:none;min-height:245px;padding:20px 15px;background:#fff;border:3px solid #080808;box-shadow:5px 5px 0 rgba(0,0,0,.18);text-align:center;}
.magazine-page.active{display:flex;flex-direction:column;align-items:center;justify-content:center;animation:pageFlip .28s ease both;}
.magazine-icon{font-size:38px;line-height:1.2;}
.magazine-label{font-size:10px;letter-spacing:2px;margin:12px 0 4px;color:#1685a0;font-weight:900;}
.magazine-page h2{font-size:clamp(20px,5vw,27px);line-height:1.05;margin:5px 0 10px;}
.magazine-page p:last-child{font-size:13px;line-height:1.5;margin:0;max-width:260px;}
.magazine-controls{display:flex;justify-content:space-between;gap:8px;}
.magazine-controls button,.magazine-done{border:2px solid #080808;background:#fff;border-radius:5px;padding:10px 8px;font-size:10px;font-weight:900;box-shadow:3px 3px 0 #080808;}
.magazine-controls button:disabled{opacity:.4;box-shadow:none;}
.magazine-done{width:100%;margin-top:13px;background:#080808;color:#fff;font-size:12px;letter-spacing:1px;padding:12px;}
@keyframes pageFlip{from{opacity:.25;transform:rotateY(-8deg) translateX(8px)}to{opacity:1;transform:rotateY(0) translateX(0)}}
@media(max-width:420px){.opening .brand-logo{width:130px;height:130px}.magazine-card{padding:21px 14px 15px}.magazine-pages,.magazine-page{min-height:220px}}

/* Final polish: salted-egg blue palette and opening curtain that exits upward. */
:root{--yellow:#b8e5e8;--blue:#69b9cf;--pink:#b8e5e8;}
.opening{z-index:20;transition:transform .56s cubic-bezier(.7,0,.25,1),opacity .56s ease;}
.opening.leaving{transform:translateY(-105%);opacity:1;pointer-events:none;}
.opening-content>*{animation:enterUp .52s cubic-bezier(.2,.75,.25,1) both;}
.opening-content>*:nth-child(1){animation-delay:.05s}
.opening-content>*:nth-child(2){animation-delay:.35s}
.opening-content>*:nth-child(3){animation-delay:.62s}
.opening-content>*:nth-child(4){animation-delay:.88s}
.logo-ring::before{border-top-color:#fff;border-right-color:#1685a0;border-bottom-color:#fff;border-left-color:#1685a0;}
.bottom-nav{left:3%;right:3%;bottom:10px;border:3px solid #080808;border-radius:28px;background:#fff;box-shadow:5px 6px 0 #080808;padding:10px 8px calc(10px + env(safe-area-inset-bottom));gap:7px;}
.bottom-nav a{flex:1;text-align:center;border-radius:18px;padding:10px 5px;font-size:12px;background:#fff;}
.page{padding-bottom:125px}
@media(max-width:420px){.bottom-nav{left:3%;right:3%;bottom:8px;border-radius:26px}.bottom-nav a{font-size:11px;padding:9px 3px}.opening.leaving{transform:translateY(-105%);}}

/* Revisi 9: halaman horizontal ala majalah + tombol WhatsApp mengambang */
#home.page{height:100svh;min-height:100svh;overflow:hidden;padding-bottom:115px;display:flex;flex-direction:column}
#home .store-header{flex:0 0 auto;margin-bottom:12px}
.horizontal-pages{display:flex;flex:1 1 auto;min-height:0;width:100%;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth;overscroll-behavior-x:contain;touch-action:pan-x;scrollbar-width:none}
.horizontal-pages::-webkit-scrollbar{display:none}
.store-page{flex:0 0 100%;width:100%;min-width:100%;height:100%;overflow-y:auto;overflow-x:hidden;scroll-snap-align:start;padding:6px 4px 18px;scrollbar-width:none}
.store-page::-webkit-scrollbar{display:none}
.store-page .service-list{padding:0 3px}
.store-page .info-panel{margin-top:12px}
.bottom-nav a.selected{background:#b8e5e8;box-shadow:inset 0 0 0 2px #111}
.channel-widget{position:fixed;right:14px;bottom:92px;width:min(300px,calc(100vw - 28px));z-index:30;background:#fff;border:3px solid #080808;border-radius:17px;padding:15px 14px 13px;box-shadow:5px 6px 0 #080808;color:#080808;animation:channelPop .28s ease both}
.channel-widget.hidden{display:none!important}
.channel-widget-top{display:flex;align-items:center;gap:10px;padding-right:18px}
.channel-wa-icon{flex:0 0 42px;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#20d366;color:#fff}
.channel-wa-icon svg{width:29px;height:29px}
.channel-widget-top strong{display:block;font-size:14px;line-height:1.2;font-weight:900}
.channel-widget-top small{display:block;font-size:10px;margin-top:4px;color:#555;font-weight:800}
.channel-widget p{font-size:11px;line-height:1.45;margin:11px 0 12px;font-weight:700}
.channel-close{position:absolute;right:6px;top:5px;border:0;background:transparent;font-size:23px;line-height:1;color:#333;padding:1px 5px}
.channel-join{display:block;text-align:center;text-decoration:none;background:#20d366;color:#052d17;border:2px solid #080808;border-radius:9px;padding:10px 8px;font-size:11px;font-weight:900;box-shadow:3px 3px 0 #080808}
.channel-launcher{position:fixed;right:17px;bottom:91px;width:56px;height:56px;border:3px solid #080808;border-radius:50%;background:#20d366;color:#fff;display:grid;place-items:center;z-index:30;box-shadow:4px 5px 0 #080808;padding:0}
.channel-launcher svg{width:34px;height:34px}
@keyframes channelPop{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
#payment:not(.hidden)~.channel-widget,#payment:not(.hidden)~.channel-launcher{display:none!important}
@media(max-width:420px){#home.page{padding-left:12px;padding-right:12px}.store-page{padding-left:1px;padding-right:1px}.channel-widget{right:12px;bottom:88px}.channel-launcher{width:54px;height:54px;right:14px;bottom:88px}}

/* Pop-up WhatsApp dibuat seperti halaman majalah: mengambang di tengah, bukan menempel di bawah. */
.channel-widget{position:fixed;left:50%;right:auto;top:50%;bottom:auto;transform:translate(-50%,-50%);width:min(430px,calc(100vw - 36px));max-height:min(620px,calc(100svh - 70px));z-index:35;background:#fff;border:4px solid #080808;border-radius:27px;padding:27px 18px 17px;box-shadow:8px 9px 0 #080808;overflow:hidden;animation:channelMagazineIn .38s cubic-bezier(.2,.8,.2,1) both}
.channel-widget.hidden{display:none!important}
.channel-magazine-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 3px;font-size:12px;letter-spacing:1.5px;font-weight:900}
.channel-active{border:2px solid #080808;border-radius:20px;padding:6px 10px;background:#d8ffe5;box-shadow:0 0 12px rgba(32,211,102,.45);white-space:nowrap}
.channel-active::first-letter{color:#20d366}
.channel-dash{border-top:3px dashed #080808;margin:18px 0 13px}
.channel-slides{display:flex;width:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-x:contain;touch-action:pan-x;border:3px solid #080808;background:#fff;box-shadow:5px 5px 0 #080808}
.channel-slides::-webkit-scrollbar{display:none}
.channel-slide{flex:0 0 100%;min-width:100%;min-height:295px;padding:25px 18px 21px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;scroll-snap-align:start}
.channel-big-icon{width:76px;height:76px;border-radius:22px;display:grid;place-items:center;font-size:42px;background:#b8e5e8;border:3px solid #080808;box-shadow:4px 4px 0 #080808;margin-bottom:14px}
.channel-kicker{font-size:11px;letter-spacing:4px;margin:0 0 8px;color:#247f95;font-weight:900}
.channel-slide h2{font-size:25px;line-height:1.08;margin:0 0 10px;font-weight:900}
.channel-slide p{font-size:14px;line-height:1.5;margin:0;max-width:330px;font-weight:700}
.channel-slide .channel-join{margin-top:18px;width:100%;max-width:310px;text-align:center;text-decoration:none;background:#20d366;color:#052d17;border:3px solid #080808;border-radius:12px;padding:12px 8px;font-size:12px;font-weight:900;box-shadow:4px 4px 0 #080808}
.channel-controls{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;margin-top:17px}
.channel-controls button{border:3px solid #080808;border-radius:11px;background:#fff;padding:10px 8px;font-size:10px;font-weight:900;box-shadow:3px 3px 0 #080808}
.channel-controls button:disabled{opacity:.35;box-shadow:none}
.channel-controls span{font-size:11px;font-weight:900;letter-spacing:1px;white-space:nowrap}
.channel-controls button:last-child{text-align:right}
.channel-close{position:absolute;right:7px;top:7px;width:46px;height:46px;border:3px solid #080808;border-radius:50%;background:#ff3169;color:#080808;font-size:29px;line-height:1;font-weight:900;z-index:3;box-shadow:3px 3px 0 #080808}
.channel-launcher{position:fixed;right:17px;bottom:91px;width:56px;height:56px;border:3px solid #080808;border-radius:50%;background:#20d366;color:#fff;display:grid;place-items:center;z-index:34;box-shadow:4px 5px 0 #080808;padding:0}
@keyframes channelMagazineIn{from{opacity:0;transform:translate(-50%,-45%) scale(.94)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@media(max-width:420px){.channel-widget{width:calc(100vw - 28px);max-height:calc(100svh - 48px);padding:24px 13px 14px;border-radius:24px}.channel-slide{min-height:270px;padding:20px 12px}.channel-slide h2{font-size:22px}.channel-slide p{font-size:13px}.channel-controls button{font-size:9px;padding:9px 5px}.channel-close{width:43px;height:43px;font-size:27px}}