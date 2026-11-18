/* Menus sobre todos os cards, com posicionamento dentro da tela. */
(function(){
    let active = null;
    function close(){
        if(!active)return;
        const {menu,placeholder,originalStyle,anchor}=active;
        if(menu.hidePopover){try{menu.hidePopover();}catch{}}
        delete menu.dataset.suiriMenuAberto;
        menu.classList.add('oculto');
        menu.setAttribute('style',originalStyle);
        if(placeholder.isConnected)placeholder.replaceWith(menu);
        active=null;
        anchor?.focus({preventScroll:true});
    }
    window.suiriFecharMenuFlutuante=close;
    window.suiriAbrirMenuFlutuante=function(menu,anchor){
        const same=active?.menu===menu;close();if(same||!menu||!anchor)return;
        const placeholder=document.createElement('span');menu.before(placeholder);document.body.append(menu);
        active={menu,placeholder,anchor,originalStyle:menu.getAttribute('style')||''};menu.dataset.suiriMenuAberto='true';menu.setAttribute('popover','manual');menu.classList.remove('oculto');
        Object.assign(menu.style,{position:'fixed',inset:'auto',margin:'0',zIndex:'100100',maxHeight:'calc(100dvh - 32px)',overflowY:'auto'});
        if(menu.showPopover)menu.showPopover();
        const rect=anchor.getBoundingClientRect(),box=menu.getBoundingClientRect();
        const width=Math.min(box.width||240,innerWidth-24);
        menu.style.width=width+'px';menu.style.maxWidth='calc(100vw - 24px)';
        menu.style.left=Math.max(12,Math.min(rect.right-width,innerWidth-width-12))+'px';
        const height=menu.getBoundingClientRect().height;
        menu.style.top=Math.max(12,Math.min(rect.bottom+8,innerHeight-height-12))+'px';
        menu.querySelector('button,a,[tabindex]')?.focus({preventScroll:true});
    };
    window.abrirMenuAvatarTopo=function(e){e.stopPropagation();window.suiriAbrirMenuFlutuante(document.getElementById('menu-tema-avatar'),document.getElementById('container-avatar-perfil-topo'));};
    window.alternarMenuAcoesMissao=function(id){
        const menu=document.getElementById('menu-drop-missao-'+id);
        const anchor=document.querySelector('button[onclick*="alternarMenuAcoesMissao(\''+id+'\')"]');
        window.suiriAbrirMenuFlutuante(menu,anchor);
    };
    document.addEventListener('click',e=>{if(!active)return;if(active.menu.contains(e.target)){if(e.target.closest('button,a'))close();}else if(!e.target.closest('#container-avatar-perfil-topo,button[onclick*="alternarMenuAcoesMissao"]'))close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
    window.addEventListener('resize',close);
    document.addEventListener('scroll',e=>{if(active&&!active.menu.contains(e.target))close();},true);
})();
