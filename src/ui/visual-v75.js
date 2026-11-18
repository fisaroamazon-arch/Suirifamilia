/* Suiri 7.5: aparência única, troca de usuário explícita e avatares pessoais. */
(function(){
 const S=window.Suiri;S.theme.apply();
 window.abrirTrocaUsuarioTopo=function(e){e?.stopPropagation?.();window.suiriFecharMenuFlutuante?.();window.abrirJanelaPrincipalQuiosque();};
 window.abrirMenuAvatarTopo=window.abrirTrocaUsuarioTopo;
 const avatar=document.getElementById('container-avatar-perfil-topo');
 if(avatar&&!avatar.querySelector('.avatar-trocar-label')){const label=document.createElement('span');label.className='avatar-trocar-label';label.textContent='Trocar usuário';avatar.append(label);}
 window.atualizarFotosDosEspacos=function(){
  const profile=window.perfilAtual||S.cachedProfile();if(!profile)return;
  document.querySelectorAll('.avatar-espaco-pessoal').forEach(img=>{img.src=S.imageUrl(profile.avatar_url||'assets/icons-modern/icone-pessoa-escopo.svg');img.alt='Foto de '+(profile.nome||'usuário');img.parentElement.classList.add('avatar-espaco-moldura');});
 };
 for(const name of ['renderizarEsqueletoEspacoMasculino','renderizarEsqueletoEspacoMulher']){
  const original=window[name];if(original)window[name]=function(...args){const result=original.apply(this,args);window.atualizarFotosDosEspacos();return result;};
 }
 document.addEventListener('suiri:avatar-updated',window.atualizarFotosDosEspacos);
 document.addEventListener('suiri:session-ready',()=>{S.theme.apply();window.atualizarFotosDosEspacos();});
})();
