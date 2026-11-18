/* Recorte local sem CDN: arrasto, pinça, zoom e rotação. Grava somente após confirmar. */
(function(){
 const S=window.Suiri,size=320,output=512,modalId='modal-crop-imagem';
 let serial=0,targetId=null,source=null,image=null,zoom=1,x=0,y=0,base=1,points=new Map(),gesture=null,saving=false,session=null;
 const modal=document.getElementById(modalId);if(!modal)return;
 modal.innerHTML=`<div class="modal-conteudo modal-bottom-sheet crop-editor"><div class="modal-header"><h3>Ajustar foto</h3><button type="button" class="btn-secundario" aria-label="Cancelar recorte" onclick="window.fecharModalCrop()">${window.iconeModernoSuiri('x')}</button></div><p>Arraste a foto para enquadrar. Use dois dedos para ampliar.</p><div class="crop-stage"><canvas id="canvas-crop" width="320" height="320" tabindex="0" aria-label="Área de recorte. Use as setas para mover e mais ou menos para ampliar."></canvas><div class="crop-grade" aria-hidden="true"></div></div><label class="crop-zoom-label" for="crop-zoom">Zoom <output id="crop-zoom-value">100%</output></label><input id="crop-zoom" type="range" min="1" max="4" step="0.01" value="1" aria-label="Ampliar foto"><div class="crop-botoes"><button type="button" class="btn-secundario" onclick="window.girarFotoCrop()">Girar 90°</button><button type="button" class="btn-secundario" onclick="window.centralizarFotoCrop()">Centralizar</button></div><p id="crop-status" role="status" aria-live="polite"></p><div class="crop-botoes"><button type="button" class="btn-secundario" onclick="window.fecharModalCrop()">Cancelar</button><button id="crop-confirmar" type="button" class="btn-principal" onclick="window.confirmarCropImagem()">Usar esta foto</button></div></div>`;
 const canvas=document.getElementById('canvas-crop'),ctx=canvas.getContext('2d'),range=document.getElementById('crop-zoom');
 let picker=document.getElementById('input-upload-avatar-membro');if(!picker){picker=document.createElement('input');picker.id='input-upload-avatar-membro';picker.type='file';picker.accept='image/*';picker.hidden=true;document.body.append(picker);}picker.onchange=e=>window.processarUploadAvatar(e);
 function currentSession(){return {actor:S.memberId(),family:window.familiaAtualId||window.perfilAtual?.familia_id};}
 function sameSession(a){const b=currentSession();return a?.actor===b.actor&&a?.family===b.family;}
 function member(id){return (window.listaMembrosFamilia||[]).find(m=>m.id===id)||(id===S.memberId()?window.perfilAtual:null);}
 function canEdit(id){const m=member(id),p=window.perfilAtual;return !!m&&!!p&&(m.familia_id||p.familia_id)===(window.familiaAtualId||p.familia_id)&&(id===p.id||['adm','admin_familia'].includes(p.papel));}
 function bounds(){if(!image)return;const scale=base*zoom;x=Math.min(0,Math.max(size-image.width*scale,x));y=Math.min(0,Math.max(size-image.height*scale,y));}
 function draw(){if(!image)return;bounds();ctx.clearRect(0,0,size,size);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,x,y,image.width*base*zoom,image.height*base*zoom);range.value=String(zoom);document.getElementById('crop-zoom-value').textContent=Math.round(zoom*100)+'%';}
 function center(){if(!image)return;zoom=1;base=Math.max(size/image.width,size/image.height);x=(size-image.width*base)/2;y=(size-image.height*base)/2;draw();}
 function setZoom(value,anchorX=size/2,anchorY=size/2){if(!image)return;const next=Math.max(1,Math.min(4,Number(value))),ratio=next/zoom;x=anchorX-(anchorX-x)*ratio;y=anchorY-(anchorY-y)*ratio;zoom=next;draw();}
 function openImage(img,id){if(!canEdit(id))throw new Error('Este perfil não pode alterar a foto escolhida.');targetId=id;session=currentSession();source=img;image=img;center();document.getElementById('crop-status').textContent='';S.openModal(modalId);}
 window.abrirSeletorFotoPerfil=function(id){const resolved=typeof id==='string'?id:S.memberId();if(!canEdit(resolved))return window.mostrarToast('Não foi possível editar este perfil.','erro');targetId=resolved;session=currentSession();picker.click();};
 window.abrirFotoDoMembroEmEdicao=()=>window.abrirSeletorFotoPerfil(document.getElementById('edit-familiar-id')?.value);
 window.processarUploadAvatar=function(event){
  const file=event.target.files?.[0],id=targetId,token=++serial,selectionSession=session;event.target.value='';if(!file)return;
  if(!file.type.startsWith('image/'))return window.mostrarToast('Escolha uma imagem.','erro');
  if(file.size>20*1024*1024)return window.mostrarToast('Escolha uma foto de até 20 MB.','erro');
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{try{
   if(token!==serial||!sameSession(selectionSession))return;
   if(!(img.naturalWidth||img.width)||!(img.naturalHeight||img.height))throw new Error('A imagem não pôde ser lida.');
   const ratio=Math.min(1,2048/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height));const reduced=document.createElement('canvas');reduced.width=Math.max(1,Math.round((img.naturalWidth||img.width)*ratio));reduced.height=Math.max(1,Math.round((img.naturalHeight||img.height)*ratio));reduced.getContext('2d').drawImage(img,0,0,reduced.width,reduced.height);openImage(reduced,id);
  }catch(e){S.notifyError(e);}finally{URL.revokeObjectURL(url);}};
  img.onerror=()=>{URL.revokeObjectURL(url);window.mostrarToast('Não consegui abrir essa imagem. Tente JPG, PNG ou WebP.','erro');};img.src=url;
 };
 window.centralizarFotoCrop=()=>{image=source;center();};
 window.girarFotoCrop=function(){if(!image)return;const rotated=document.createElement('canvas');rotated.width=image.height;rotated.height=image.width;const c=rotated.getContext('2d');c.translate(rotated.width/2,rotated.height/2);c.rotate(Math.PI/2);c.drawImage(image,-image.width/2,-image.height/2);image=rotated;center();};
 window.ajustarZoomCrop=delta=>setZoom(zoom+Number(delta));range.addEventListener('input',()=>setZoom(range.value));
 function point(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*size/(r.width||size),y:(e.clientY-r.top)*size/(r.height||size)};}
 function beginGesture(){const a=[...points.values()];gesture=a.length>1?{distance:Math.hypot(a[1].x-a[0].x,a[1].y-a[0].y),zoom}:a.length?{px:a[0].x,py:a[0].y,x,y}:null;}
 canvas.addEventListener('pointerdown',e=>{if(!image)return;e.preventDefault();canvas.setPointerCapture?.(e.pointerId);points.set(e.pointerId,point(e));beginGesture();});
 canvas.addEventListener('pointermove',e=>{if(!points.has(e.pointerId)||!gesture)return;e.preventDefault();points.set(e.pointerId,point(e));const a=[...points.values()];if(a.length>1&&gesture.distance){const distance=Math.hypot(a[1].x-a[0].x,a[1].y-a[0].y);setZoom(gesture.zoom*distance/Math.max(1,gesture.distance),(a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2);}else if(a.length===1){x=gesture.x+a[0].x-gesture.px;y=gesture.y+a[0].y-gesture.py;draw();}});
 for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,e=>{points.delete(e.pointerId);beginGesture();});
 canvas.addEventListener('keydown',e=>{if(!image)return;const moves={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]};if(moves[e.key]){e.preventDefault();x+=moves[e.key][0];y+=moves[e.key][1];draw();}else if(['+','=','-'].includes(e.key)){e.preventDefault();setZoom(zoom+(e.key==='-'?-.1:.1));}});
 window.fecharModalCrop=function(){if(saving)return;serial++;points.clear();source=image=null;S.closeModal(modalId);};
 async function savePhoto(data,id,tokenSession){
  if(!sameSession(tokenSession)||!canEdit(id))throw new Error('O perfil ativo mudou. Escolha a foto novamente.');
  const cli=window.obterClienteSupabase();if(!cli)throw new Error('Entre novamente para salvar a foto.');
  const result=await cli.from('membros').update({avatar_url:data}).eq('id',id).eq('familia_id',tokenSession.family).select('id');S.check(result,1);
  if(!sameSession(tokenSession))return false;
  const m=member(id);if(m)m.avatar_url=data;
  if(window.perfilAtual?.id===id){window.perfilAtual.avatar_url=data;localStorage.setItem('suiri_perfil_ativo',JSON.stringify(window.perfilAtual));for(const key of ['img-avatar-topo','img-avatar-kids']){const el=document.getElementById(key);if(el)el.src=data;}}
  const preview=document.getElementById('edit-familiar-foto-preview');if(preview&&document.getElementById('edit-familiar-id')?.value===id)preview.src=data;
  window.renderizarMembrosFamiliaPainel?.();document.dispatchEvent(new CustomEvent('suiri:avatar-updated',{detail:{memberId:id}}));return true;
 }
 window.guardarFotoPerfil=data=>savePhoto(data,S.memberId(),currentSession());
 window.confirmarCropImagem=async function(){
  if(!image||saving)return;
  saving=true;const button=document.getElementById('crop-confirmar');button.disabled=true;document.getElementById('crop-status').textContent='Salvando foto…';
  try{
   const final=document.createElement('canvas');final.width=final.height=output;const c=final.getContext('2d'),scale=base*zoom;c.fillStyle='#fff';c.fillRect(0,0,output,output);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(image,-x/scale,-y/scale,size/scale,size/scale,0,0,output,output);
   if(await savePhoto(final.toDataURL('image/jpeg',.88),targetId,session)){S.closeModal(modalId);source=image=null;window.mostrarToast('Foto atualizada.');}
  }catch(e){document.getElementById('crop-status').textContent=e.message||'Não foi possível salvar. Tente novamente.';S.notifyError(e);}finally{saving=false;button.disabled=false;}
 };
 const original=window.abrirModalEditarFamiliar;
 window.abrirModalEditarFamiliar=function(id){original(id);const preview=document.getElementById('edit-familiar-foto-preview');if(preview)preview.src=S.imageUrl(member(id)?.avatar_url||'assets/icons-modern/icone-pessoa-escopo.svg');};
 // Estado de geometria exposto para as verificações locais, sem dados enviados a serviços externos.
 window.SuiriCrop={carregarImagem:openImage,zoom:setZoom,estado:()=>({targetId,x,y,zoom,base,width:image?.width,height:image?.height,size}),bounds};
})();
