import{e as $,s as T,a as Mt,b as F,n as Jt,c as ke,d as H,r as Rn,i as ns,f as ee,g as Vo,h as Gt,j as Sn,k as q,l as ye,m as en,o as zt,t as Uo,p as tt,q as X,u as V,v as nt,w as Ve,x as pe,y as Ie,z as Wo,A as Mo,R as Go,B as zo,C as Ho,D as ss,E as Xo,F as Ko,T as Ht,G as os,H as rs,I as jo,J as qo,K as Yo,L as Qo,M as Zo,N as Jo,O as er,P as tr,Q as nr,S as yn,U as sr,V as or,W as rr,X as bt,Y as ar,Z as qe,_ as K,$ as ir,a0 as cr,a1 as xe,a2 as we,a3 as In,a4 as tn,a5 as Tn,a6 as lr,a7 as kt,a8 as ur,a9 as dr,aa as pr,ab as hr,ac as fr,ad as mr,ae as xr,af as gr,ag as Cr,ah as vr,ai as br,aj as $r,ak as wr,al as Rr,am as Sr,an as nn,ao as ie,ap as ce,aq as de,ar as ve,as as sn,at as yr,au as Ir,av as Tr,aw as Er,ax as Nr,ay as kr,az as Or,aA as Pr,aB as Dr,aC as Ar,aD as Fr,aE as _r,aF as Lr,aG as Br,aH as Vr,aI as Ur,aJ as Wr,aK as Mr,aL as ct,aM as lt,aN as Gr,aO as Ot,aP as zr,aQ as Hr,aR as Xr,aS as Kr,aT as jr,aU as qr,aV as Yr,aW as Qr,aX as as,aY as is,aZ as cs,a_ as Zr,a$ as Jr,b0 as ea,b1 as ta,b2 as na,b3 as sa,b4 as oa,b5 as ra,b6 as aa,b7 as ia,b8 as ca,b9 as la,ba as ua,bb as Be,bc as da,bd as pa,be as ha,bf as fa,bg as Pt,bh as be,bi as ma,bj as xa,bk as ga,bl as on,bm as Ca,bn as va,bo as ba,bp as $a,bq as wa,br as ls,bs as Ra,bt as Sa,bu as ya,bv as Ia,bw as Ta,bx as Ea,by as Na,bz as ka,bA as Oa,bB as Pa,bC as Da,bD as Aa,bE as Fa,bF as _a,bG as La,bH as Ba,bI as Va,bJ as Ua,bK as Wa,bL as Ma,bM as Ga,bN as za,bO as Ha,bP as Xa,bQ as Ka,bR as ja,bS as qa,bT as Ya,bU as Qa,bV as Za,bW as Ja,bX as ei,bY as ti,bZ as ni,b_ as si,b$ as oi,c0 as ri,c1 as ai,c2 as ii,c3 as ci,c4 as li,c5 as ui,c6 as di,c7 as pi,c8 as hi,c9 as fi,ca as mi,cb as xi,cc as gi,cd as Ci,ce as vi,cf as bi,cg as $i,ch as wi,ci as Ri,cj as Si,ck as yi,cl as Ii,cm as Ti,cn as Ei,co as Ni,cp as ki,cq as Oi,cr as Pi,cs as Di,ct as Ai,cu as Fi,cv as _i,cw as Li,cx as Bi,cy as Vi,cz as Ui,cA as Wi,cB as Mi,cC as Gi,cD as zi,cE as Hi,cF as Xi,cG as Ki,cH as ji,cI as qi,cJ as Yi,cK as Qi,cL as Zi,cM as Ji,cN as ec,cO as tc,cP as nc,cQ as sc,cR as oc,cS as rc,cT as ac,cU as ic,cV as cc,cW as lc,cX as uc,cY as dc,cZ as pc,c_ as hc,c$ as fc,d0 as mc,d1 as xc,d2 as gc,d3 as Cc,d4 as vc,d5 as bc,d6 as rn,d7 as $c,d8 as wc,d9 as Rc,da as Sc,db as yc,dc as Ic,dd as Tc,de as Ec,df as Nc,dg as kc,dh as Oc,di as Pc,dj as Dc,dk as Ac,dl as Fc,dm as _c,dn as Lc,dp as Bc,dq as Vc,dr as Uc,ds as Wc,dt as Mc,du as Gc,dv as zc,dw as Hc,dx as Xc,dy as Kc,dz as jc,dA as qc,dB as Yc,dC as Qc,dD as Zc,dE as Jc,dF as el,dG as tl,dH as nl,dI as sl,dJ as ol,dK as rl,dL as al,dM as il}from"./index-ajiKRGsK.js";import"./index-D1ICkoRh.js";/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Se={},mt={alpha:!1,antialias:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!1,depth:!1,stencil:!1,failIfMajorPerformanceCaveat:!0};function cl(n,e){Se[n]=e}function ae(n,e){if(!(n in Se)||e!=null){const s=ul(n,e);if(s!==null)Se[n]=s;else return console.log("Could not get context for WebGL version",n),null}const t=Se[n];return t==null||t.isContextLost()?(delete Se[n],ae(n)):(t.disable(t.DEPTH_TEST),t.disable(t.STENCIL_TEST),t.disable(t.BLEND),t.disable(t.DITHER),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SAMPLE_COVERAGE),t.enable(t.SCISSOR_TEST),t.enable(t.CULL_FACE),t.cullFace(t.BACK),Se[n])}function ll(n){if(!$().getBool("IS_SAFARI")&&typeof OffscreenCanvas<"u"&&n===2)return new OffscreenCanvas(300,150);if(typeof document<"u")return document.createElement("canvas");throw new Error("Cannot create a canvas in this context")}function ul(n,e){if(n!==1&&n!==2)throw new Error("Cannot get WebGL rendering context, WebGL is disabled.");const t=e??ll(n);return t.addEventListener("webglcontextlost",s=>{s.preventDefault(),delete Se[n]},!1),$().getBool("SOFTWARE_WEBGL_ENABLED")&&(mt.failIfMajorPerformanceCaveat=!1),n===1?t.getContext("webgl",mt)||t.getContext("experimental-webgl",mt):t.getContext("webgl2",mt)}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */var st;(function(n){n[n.DENSE=0]="DENSE",n[n.SHARED_BATCH=1]="SHARED_BATCH"})(st||(st={}));var Z;(function(n){n[n.RENDER=0]="RENDER",n[n.UPLOAD=1]="UPLOAD",n[n.PIXELS=2]="PIXELS",n[n.DOWNLOAD=3]="DOWNLOAD"})(Z||(Z={}));var L;(function(n){n[n.UNPACKED_FLOAT16=0]="UNPACKED_FLOAT16",n[n.UNPACKED_FLOAT32=1]="UNPACKED_FLOAT32",n[n.PACKED_4X1_UNSIGNED_BYTE=2]="PACKED_4X1_UNSIGNED_BYTE",n[n.PACKED_2X2_FLOAT32=3]="PACKED_2X2_FLOAT32",n[n.PACKED_2X2_FLOAT16=4]="PACKED_2X2_FLOAT16"})(L||(L={}));function ut(n,e){return[e,n]}function dl(n,e){return n*e}function xt(n){const e=T(n),t=Math.ceil(e/4);return Mt(t)}function Ue(n,e){return[Math.max(1,Math.ceil(e/2)),Math.max(1,Math.ceil(n/2))]}function pl(n,e){const[t,s]=Ue(n,e);return t*s*4}function an(n,e){const t=n;let s,o,r,a,c,i,l,u,d,p;return $().getNumber("WEBGL_VERSION")===2?(s=t.R32F,o=t.R16F,r=t.RGBA16F,a=t.RGBA32F,c=t.RED,l=4,u=1,d=t.HALF_FLOAT,p=t.FLOAT,i=t.RGBA8):(s=n.RGBA,o=n.RGBA,r=n.RGBA,a=t.RGBA,c=n.RGBA,l=4,u=4,d=e!=null?e.HALF_FLOAT_OES:null,p=n.FLOAT,i=n.RGBA),{internalFormatFloat:s,internalFormatHalfFloat:o,internalFormatPackedHalfFloat:r,internalFormatPackedFloat:a,textureFormatFloat:c,downloadTextureFormat:i,downloadUnpackNumChannels:l,defaultNumChannels:u,textureTypeHalfFloat:d,textureTypeFloat:p}}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function S(n,e){const t=e();return $().getBool("DEBUG")&&hl(n),t}function hl(n){const e=n.getError();if(e!==n.NO_ERROR)throw new Error("WebGL Error: "+ds(n,e))}const fl=596e-10,ml=65504;function us(n){return!!($().getBool("WEBGL_RENDER_FLOAT32_ENABLED")||n===0||fl<Math.abs(n)&&Math.abs(n)<ml)}function ds(n,e){switch(e){case n.NO_ERROR:return"NO_ERROR";case n.INVALID_ENUM:return"INVALID_ENUM";case n.INVALID_VALUE:return"INVALID_VALUE";case n.INVALID_OPERATION:return"INVALID_OPERATION";case n.INVALID_FRAMEBUFFER_OPERATION:return"INVALID_FRAMEBUFFER_OPERATION";case n.OUT_OF_MEMORY:return"OUT_OF_MEMORY";case n.CONTEXT_LOST_WEBGL:return"CONTEXT_LOST_WEBGL";default:return`Unknown error code ${e}`}}function Ye(n,e){return he(n,()=>n.getExtension(e),'Extension "'+e+'" not supported on this browser.')}function ps(n,e){const t=he(n,()=>n.createShader(n.VERTEX_SHADER),"Unable to create vertex WebGLShader.");if(S(n,()=>n.shaderSource(t,e)),S(n,()=>n.compileShader(t)),n.getShaderParameter(t,n.COMPILE_STATUS)===!1)throw console.log(n.getShaderInfoLog(t)),new Error("Failed to compile vertex shader.");return t}function hs(n,e){const t=he(n,()=>n.createShader(n.FRAGMENT_SHADER),"Unable to create fragment WebGLShader.");if(S(n,()=>n.shaderSource(t,e)),S(n,()=>n.compileShader(t)),$().get("ENGINE_COMPILE_ONLY"))return t;if(n.getShaderParameter(t,n.COMPILE_STATUS)===!1)throw cn(e,n.getShaderInfoLog(t)),new Error("Failed to compile fragment shader.");return t}const xl=/ERROR: [0-9]+:([0-9]+):/g;function cn(n,e){const t=xl.exec(e);if(t==null){console.log(`Couldn't parse line number in error: ${e}`),console.log(n);return}const s=+t[1],o=n.split(`
`),r=o.length.toString().length+2,a=o.map((d,p)=>Rn((p+1).toString(),r)+d);let c=0;for(let d=0;d<a.length;d++)c=Math.max(a[d].length,c);const i=a.slice(0,s-1),l=a.slice(s-1,s),u=a.slice(s);console.log(i.join(`
`)),console.log(e.split(`
`)[0]),console.log(`%c ${Rn(l[0],c)}`,"border:1px solid red; background-color:#e3d2d2; color:#a61717"),console.log(u.join(`
`))}function fs(n){return he(n,()=>n.createProgram(),"Unable to create WebGLProgram.")}function ms(n,e){if(S(n,()=>n.linkProgram(e)),!$().get("ENGINE_COMPILE_ONLY")&&n.getProgramParameter(e,n.LINK_STATUS)===!1)throw console.log(n.getProgramInfoLog(e)),new Error("Failed to link vertex and fragment shaders.")}function $t(n,e){if(S(n,()=>n.validateProgram(e)),n.getProgramParameter(e,n.VALIDATE_STATUS)===!1)throw console.log(n.getProgramInfoLog(e)),new Error("Shader program validation failed.")}function xs(n,e){const t=he(n,()=>n.createBuffer(),"Unable to create WebGLBuffer");return S(n,()=>n.bindBuffer(n.ARRAY_BUFFER,t)),S(n,()=>n.bufferData(n.ARRAY_BUFFER,e,n.STATIC_DRAW)),t}function gs(n,e){const t=he(n,()=>n.createBuffer(),"Unable to create WebGLBuffer");return S(n,()=>n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t)),S(n,()=>n.bufferData(n.ELEMENT_ARRAY_BUFFER,e,n.STATIC_DRAW)),t}function gl(){return $().getNumber("WEBGL_VERSION")===2?1:4}function Cs(n){return he(n,()=>n.createTexture(),"Unable to create WebGLTexture.")}function vs(n,e){const t=$().getNumber("WEBGL_MAX_TEXTURE_SIZE");if(n<=0||e<=0){const s=`[${n}x${e}]`;throw new Error("Requested texture size "+s+" is invalid.")}if(n>t||e>t){const s=`[${n}x${e}]`,o=`[${t}x${t}]`;throw new Error("Requested texture size "+s+" greater than WebGL maximum on this browser / GPU "+o+".")}}function bs(n){return he(n,()=>n.createFramebuffer(),"Unable to create WebGLFramebuffer.")}function Xt(n,e,t,s,o,r,a){const c=n.getAttribLocation(e,t);return c===-1?!1:(S(n,()=>n.bindBuffer(n.ARRAY_BUFFER,s)),S(n,()=>n.vertexAttribPointer(c,o,n.FLOAT,!1,r,a)),S(n,()=>n.enableVertexAttribArray(c)),!0)}function $s(n,e,t){Is(n,t),S(n,()=>n.activeTexture(n.TEXTURE0+t)),S(n,()=>n.bindTexture(n.TEXTURE_2D,e))}function Cl(n,e){Is(n,e),S(n,()=>n.activeTexture(n.TEXTURE0+e)),S(n,()=>n.bindTexture(n.TEXTURE_2D,null))}function ws(n,e,t){return he(n,()=>n.getUniformLocation(e,t),'uniform "'+t+'" not present in program.')}function Rs(n,e,t){return n.getUniformLocation(e,t)}function Ss(n,e,t,s){S(n,()=>$s(n,e,s)),S(n,()=>n.uniform1i(t,s))}function vl(n){S(n,()=>n.bindFramebuffer(n.FRAMEBUFFER,null)),S(n,()=>n.viewport(0,0,n.canvas.width,n.canvas.height)),S(n,()=>n.scissor(0,0,n.canvas.width,n.canvas.height))}function wt(n,e,t){S(n,()=>n.bindFramebuffer(n.FRAMEBUFFER,t)),S(n,()=>n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,e,0))}function Kt(n,e){S(n,()=>n.bindFramebuffer(n.FRAMEBUFFER,e)),S(n,()=>n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,null,0))}function Qe(n){const e=n.checkFramebufferStatus(n.FRAMEBUFFER);if(e!==n.FRAMEBUFFER_COMPLETE)throw new Error("Error binding framebuffer: "+ys(n,e))}function ys(n,e){switch(e){case n.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:return"FRAMEBUFFER_INCOMPLETE_ATTACHMENT";case n.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:return"FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";case n.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:return"FRAMEBUFFER_INCOMPLETE_DIMENSIONS";case n.FRAMEBUFFER_UNSUPPORTED:return"FRAMEBUFFER_UNSUPPORTED";default:return`unknown error ${e}`}}function he(n,e,t){const s=S(n,()=>e());if(s==null)throw new Error(t);return s}function Is(n,e){const t=n.MAX_COMBINED_TEXTURE_IMAGE_UNITS-1,s=e+n.TEXTURE0;if(s<n.TEXTURE0||s>t){const o=`[gl.TEXTURE0, gl.TEXTURE${t}]`;throw new Error(`textureUnit must be in ${o}.`)}}function Te(n,e=2){return T(n.slice(0,n.length-e))}function Ee(n){if(n.length===0)throw Error("Cannot get rows and columns of an empty shape array.");return[n.length>1?n[n.length-2]:1,n[n.length-1]]}function Ze(n){let e=[1,1,1];return n.length===0||n.length===1&&n[0]===1||(e=[Te(n),...Ee(n)]),e}function Ts(n,e=!1){let t=$().getNumber("WEBGL_MAX_TEXTURE_SIZE"),s=$().getNumber("WEBGL_MAX_SIZE_FOR_NARROW_TEXTURE");s===1/0&&$().getBool("WEBGL_AUTO_SQUARIFY_NARROW_TEXTURE_SHAPE")&&(s=t/2),e&&(t=t*2,s=s*2,n=n.map((c,i)=>i>=n.length-2?Jt(n[i]):n[i]),n.length===1&&(n=[2,n[0]])),n.length!==2&&(n=ke(n).newShape);let o=T(n),r=null;n.length<=1&&o<=t?r=[1,o]:n.length===2&&n[0]<=t&&n[1]<=t?r=n:n.length===3&&n[0]*n[1]<=t&&n[2]<=t?r=[n[0]*n[1],n[2]]:n.length===3&&n[0]<=t&&n[1]*n[2]<=t?r=[n[0],n[1]*n[2]]:n.length===4&&n[0]*n[1]*n[2]<=t&&n[3]<=t?r=[n[0]*n[1]*n[2],n[3]]:n.length===4&&n[0]<=t&&n[1]*n[2]*n[3]<=t&&(r=[n[0],n[1]*n[2]*n[3]]);const a=r!=null&&Math.max(...r)>s&&Math.min(...r)<=(e?2:1)&&Math.min(...r)>0;if(r==null||a)if(e){const c=Te(n);let i=2,l=2;n.length&&([i,l]=Ee(n)),o=c*(i/2)*(l/2),r=Mt(o).map(u=>u*2)}else r=Mt(o);return r}function gt(n){return n%2===0}function ot(n,e){if(n=n.slice(-2),e=e.slice(-2),H(n,e)||!n.length||!e.length||n[0]===0||n[1]===0||e[0]===0||e[1]===0)return!0;if(n.length!==e.length){const t=n[n.length-1],s=e[e.length-1];if(t===s||gt(t)&&gt(s)&&(n[0]===1||e[0]===1))return!0}return n[1]===e[1]&&gt(n[0])&&gt(e[0])}let Rt,St;function Es(n){if(Rt==null){const e=ae(n);Rt=e.getParameter(e.MAX_TEXTURE_SIZE)}return Rt}function bl(){Rt=null}function $l(){St=null}function Ns(n){if(St==null){const e=ae(n);St=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS)}return Math.min(16,St)}function ks(n){if(n===0)return 0;let e;const t=ae(n);return J(t,"EXT_disjoint_timer_query_webgl2")&&n===2?e=2:J(t,"EXT_disjoint_timer_query")?e=1:e=0,e}function J(n,e){return n.getExtension(e)!=null}function jt(n){try{if(ae(n)!=null)return!0}catch(e){return console.log("Error when getting WebGL context: ",e),!1}return!1}function Os(n){if(n===0)return!1;const e=ae(n);if(n===1){if(!J(e,"OES_texture_float"))return!1}else if(!J(e,"EXT_color_buffer_float"))return!1;return qt(e)}function Ps(n){if(n===0)return!1;const e=ae(n);if(n===1){if(!J(e,"OES_texture_float")||!J(e,"WEBGL_color_buffer_float"))return!1}else{if(J(e,"EXT_color_buffer_float"))return qt(e);const s="EXT_color_buffer_half_float";if(J(e,s)){const o=e.getExtension(s);return wl(e,o)}return!1}return qt(e)}function qt(n){const e=an(n),t=n.createTexture();n.bindTexture(n.TEXTURE_2D,t),n.texImage2D(n.TEXTURE_2D,0,e.internalFormatFloat,1,1,0,e.textureFormatFloat,e.textureTypeFloat,null);const r=n.createFramebuffer();n.bindFramebuffer(n.FRAMEBUFFER,r),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,t,0);const a=n.checkFramebufferStatus(n.FRAMEBUFFER)===n.FRAMEBUFFER_COMPLETE;return n.bindTexture(n.TEXTURE_2D,null),n.bindFramebuffer(n.FRAMEBUFFER,null),n.deleteTexture(t),n.deleteFramebuffer(r),a}function wl(n,e){const t=an(n,e),s=n.createTexture();n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,t.internalFormatHalfFloat,1,1,0,t.textureFormatFloat,t.textureTypeHalfFloat,null);const a=n.createFramebuffer();n.bindFramebuffer(n.FRAMEBUFFER,a),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0);const c=n.checkFramebufferStatus(n.FRAMEBUFFER)===n.FRAMEBUFFER_COMPLETE;return n.bindTexture(n.TEXTURE_2D,null),n.bindFramebuffer(n.FRAMEBUFFER,null),n.deleteTexture(s),n.deleteFramebuffer(a),c}function Ds(n){return n!==2?!1:ae(n).fenceSync!=null}function We(n,e){Array.isArray(n)||(n=[n]),n.forEach(t=>{t!=null&&F(t.dtype!=="complex64",()=>`${e} does not support complex64 tensors in the WebGL backend.`)})}const Rb=Object.freeze(Object.defineProperty({__proto__:null,assertNotComplex:We,bindCanvasToFramebuffer:vl,bindColorTextureToFramebuffer:wt,bindTextureToProgramUniformSampler:Ss,bindTextureUnit:$s,bindVertexBufferToProgramAttribute:Xt,callAndCheck:S,canBeRepresented:us,createFragmentShader:hs,createFramebuffer:bs,createProgram:fs,createStaticIndexBuffer:gs,createStaticVertexBuffer:xs,createTexture:Cs,createVertexShader:ps,getBatchDim:Te,getExtensionOrThrow:Ye,getFramebufferErrorMessage:ys,getMaxTexturesInShader:Ns,getNumChannels:gl,getProgramUniformLocation:Rs,getProgramUniformLocationOrThrow:ws,getRowsCols:Ee,getShapeAs3D:Ze,getTextureShapeFromLogicalShape:Ts,getWebGLDisjointQueryTimerVersion:ks,getWebGLErrorMessage:ds,getWebGLMaxTextureSize:Es,hasExtension:J,isCapableOfRenderingToFloatTexture:Os,isDownloadFloatTextureEnabled:Ps,isReshapeFree:ot,isWebGLFenceEnabled:Ds,isWebGLVersionEnabled:jt,linkProgram:ms,logShaderSourceAndInfoLog:cn,resetMaxTextureSize:bl,resetMaxTexturesInShader:$l,unbindColorTextureFromFramebuffer:Kt,unbindTextureUnit:Cl,validateFramebuffer:Qe,validateProgram:$t,validateTextureSize:vs},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const E=$();E.registerFlag("HAS_WEBGL",()=>E.getNumber("WEBGL_VERSION")>0);E.registerFlag("WEBGL_VERSION",()=>jt(2)?2:jt(1)?1:0);E.registerFlag("WEBGL_CHECK_NUMERICAL_PROBLEMS",()=>!1);E.registerFlag("WEBGL_BUFFER_SUPPORTED",()=>E.get("WEBGL_VERSION")===2);E.registerFlag("WEBGL_CPU_FORWARD",()=>!0);E.registerFlag("WEBGL_FORCE_F16_TEXTURES",()=>!1);E.registerFlag("WEBGL_PACK",()=>E.getBool("HAS_WEBGL"));E.registerFlag("WEBGL_PACK_NORMALIZATION",()=>E.getBool("WEBGL_PACK"));E.registerFlag("WEBGL_PACK_CLIP",()=>E.getBool("WEBGL_PACK"));E.registerFlag("WEBGL_PACK_DEPTHWISECONV",()=>E.getBool("WEBGL_PACK"));E.registerFlag("WEBGL_PACK_BINARY_OPERATIONS",()=>E.getBool("WEBGL_PACK"));E.registerFlag("WEBGL_PACK_UNARY_OPERATIONS",()=>E.getBool("WEBGL_PACK"));E.registerFlag("WEBGL_PACK_ARRAY_OPERATIONS",()=>E.getBool("WEBGL_PACK"));E.registerFlag("WEBGL_PACK_IMAGE_OPERATIONS",()=>E.getBool("WEBGL_PACK"));E.registerFlag("WEBGL_PACK_REDUCE",()=>E.getBool("WEBGL_PACK"));E.registerFlag("WEBGL_LAZILY_UNPACK",()=>E.getBool("WEBGL_PACK"));E.registerFlag("WEBGL_CONV_IM2COL",()=>E.getBool("WEBGL_PACK"));E.registerFlag("WEBGL_PACK_CONV2DTRANSPOSE",()=>E.getBool("WEBGL_PACK"));E.registerFlag("WEBGL_MAX_TEXTURE_SIZE",()=>Es(E.getNumber("WEBGL_VERSION")));E.registerFlag("WEBGL_MAX_TEXTURES_IN_SHADER",()=>Ns(E.getNumber("WEBGL_VERSION")));E.registerFlag("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION",()=>{const n=E.getNumber("WEBGL_VERSION");return n===0?0:ks(n)});E.registerFlag("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE",()=>E.getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")>0&&!ns());E.registerFlag("WEBGL_RENDER_FLOAT32_CAPABLE",()=>Os(E.getNumber("WEBGL_VERSION")));E.registerFlag("WEBGL_RENDER_FLOAT32_ENABLED",()=>E.getBool("WEBGL_FORCE_F16_TEXTURES")?!1:E.getBool("WEBGL_RENDER_FLOAT32_CAPABLE"));E.registerFlag("WEBGL_DOWNLOAD_FLOAT_ENABLED",()=>Ps(E.getNumber("WEBGL_VERSION")));E.registerFlag("WEBGL_FENCE_API_ENABLED",()=>Ds(E.getNumber("WEBGL_VERSION")));E.registerFlag("WEBGL_SIZE_UPLOAD_UNIFORM",()=>E.getBool("WEBGL_RENDER_FLOAT32_ENABLED")?4:0);E.registerFlag("WEBGL_DELETE_TEXTURE_THRESHOLD",()=>-1,n=>{if(typeof n!="number")throw new Error(`WEBGL_DELETE_TEXTURE_THRESHOLD must be a number but got ${n}.`);if(n<0&&n!==-1)throw new Error(`WEBGL_DELETE_TEXTURE_THRESHOLD must be -1 (indicating never delete) or at least 0, but got ${n}.`)});E.registerFlag("WEBGL_FLUSH_THRESHOLD",()=>ns()?1:-1,n=>{if(typeof n!="number")throw new Error(`WEBGL_FLUSH_THRESHOLD must be a number but got ${n}.`);if(n<0&&n!==-1)throw new Error(`WEBGL_FLUSH_THRESHOLD must be -1 (indicating never manual flush) or at least 0, but got ${n}.`)});E.registerFlag("CPU_HANDOFF_SIZE_THRESHOLD",()=>128);E.registerFlag("WEBGL_USE_SHAPES_UNIFORMS",()=>!1);E.registerFlag("TOPK_LAST_DIM_CPU_HANDOFF_SIZE_THRESHOLD",()=>1e5);E.registerFlag("TOPK_K_CPU_HANDOFF_THRESHOLD",()=>128);E.registerFlag("WEBGL_EXP_CONV",()=>!1);E.registerFlag("SOFTWARE_WEBGL_ENABLED",()=>E.getBool("IS_TEST"));E.registerFlag("WEBGL_MAX_SIZE_FOR_NARROW_TEXTURE",()=>1/0);E.registerFlag("WEBGL_AUTO_SQUARIFY_NARROW_TEXTURE_SHAPE",()=>!1);E.registerFlag("WEBGL2_ISNAN_CUSTOM",()=>!1);E.registerFlag("ENGINE_COMPILE_ONLY",()=>!1);/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function z(){let n,e,t,s,o,r,a,c,i,l;return $().getNumber("WEBGL_VERSION")===2?(n="#version 300 es",e="in",t="out",s="in",o="texture",r="outputColor",a="out vec4 outputColor;",c=$().getBool("WEBGL2_ISNAN_CUSTOM")?`
      bool isnan_custom(float val) {
        uint floatToUint = floatBitsToUint(val);
        return (floatToUint & 0x7fffffffu) > 0x7f800000u;
      }

      bvec4 isnan_custom(vec4 val) {
        return bvec4(isnan_custom(val.x),
          isnan_custom(val.y), isnan_custom(val.z), isnan_custom(val.w));
      }

      #define isnan(value) isnan_custom(value)
    `:"",i="",l=`
      #define round(value) newRound(value)
      int newRound(float value) {
        return int(floor(value + 0.5));
      }

      ivec4 newRound(vec4 value) {
        return ivec4(floor(value + vec4(0.5)));
      }
    `):(n="",e="attribute",t="varying",s="varying",o="texture2D",r="gl_FragColor",a="",c=`
      #define isnan(value) isnan_custom(value)
      bool isnan_custom(float val) {
        return (val > 0. || val < 1. || val == 0.) ? false : true;
      }
      bvec4 isnan_custom(vec4 val) {
        return bvec4(isnan(val.x), isnan(val.y), isnan(val.z), isnan(val.w));
      }
    `,i=`
      uniform float INFINITY;

      bool isinf(float val) {
        return abs(val) == INFINITY;
      }
      bvec4 isinf(vec4 val) {
        return equal(abs(val), vec4(INFINITY));
      }
    `,l=`
      int round(float value) {
        return int(floor(value + 0.5));
      }

      ivec4 round(vec4 value) {
        return ivec4(floor(value + vec4(0.5)));
      }
    `),{version:n,attribute:e,varyingVs:t,varyingFs:s,texture2D:o,output:r,defineOutput:a,defineSpecialNaN:c,defineSpecialInf:i,defineRound:l}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Oe(n,e,t="index"){const s=ee(e);return s.map((o,r)=>{const a=`int ${n[r]} = ${t} / ${o}`,c=r===s.length-1?`int ${n[r+1]} = ${t} - ${n[r]} * ${o}`:`index -= ${n[r]} * ${o}`;return`${a}; ${c};`}).join("")}function Dt(n,e,t="index"){const s=ee(e);return s.map((o,r)=>{const a=`int ${n[r]} = ${t} / outShapeStrides[${r}]`,c=r===s.length-1?`int ${n[r+1]} = ${t} - ${n[r]} * outShapeStrides[${r}]`:`index -= ${n[r]} * outShapeStrides[${r}]`;return`${a}; ${c};`}).join("")}function Rl(n,e){const t=n.length,s=n.map(r=>`${e}[${r}]`),o=new Array(t-1);o[t-2]=s[t-1];for(let r=t-3;r>=0;--r)o[r]=`(${o[r+1]} * ${s[r+1]})`;return o}function Sl(n,e,t="index"){const s=n.map((r,a)=>a),o=Rl(s,e);return o.map((r,a)=>{const c=`int ${n[a]} = ${t} / ${o[a]}`,i=a===o.length-1?`int ${n[a+1]} = ${t} - ${n[a]} * ${o[a]}`:`index -= ${n[a]} * ${o[a]}`;return`${c}; ${i};`}).join("")}function ln(n){const e=ee(n).map(t=>t.toString());return`
  int getFlatIndex(ivec3 coords) {
    return coords.x * ${e[0]} + coords.y * ${e[1]} + coords.z;
  }
`}function un(){return`
  int getFlatIndex(ivec3 coords) {
    return coords.x * outShapeStrides[0] + coords.y * outShapeStrides[1] + coords.z;
  }
`}const As=`
  const float FLOAT_MAX = 1.70141184e38;
  const float FLOAT_MIN = 1.17549435e-38;

  lowp vec4 encode_float(highp float v) {
    if (isnan(v)) {
      return vec4(255, 255, 255, 255);
    }

    highp float av = abs(v);

    if(av < FLOAT_MIN) {
      return vec4(0.0, 0.0, 0.0, 0.0);
    } else if(v > FLOAT_MAX) {
      return vec4(0.0, 0.0, 128.0, 127.0) / 255.0;
    } else if(v < -FLOAT_MAX) {
      return vec4(0.0, 0.0,  128.0, 255.0) / 255.0;
    }

    highp vec4 c = vec4(0,0,0,0);

    highp float e = floor(log2(av));
    highp float m = exp2(fract(log2(av))) - 1.0;

    c[2] = floor(128.0 * m);
    m -= c[2] / 128.0;
    c[1] = floor(32768.0 * m);
    m -= c[1] / 32768.0;
    c[0] = floor(8388608.0 * m);

    highp float ebias = e + 127.0;
    c[3] = floor(ebias / 2.0);
    ebias -= c[3] * 2.0;
    c[2] += floor(ebias) * 128.0;

    c[3] += 128.0 * step(0.0, -v);

    return c / 255.0;
  }
`;/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const{getBroadcastDims:Fs}=Vo;function yl(n,e,t){const s=[];if(n.forEach(h=>{const f=T(h.shapeInfo.logicalShape);if(h.shapeInfo.isUniform?s.push(`uniform float ${h.name}${f>1?`[${f}]`:""};`):(s.push(`uniform sampler2D ${h.name};`),s.push(`uniform int offset${h.name};`)),t.enableShapeUniforms){const{uniformShape:g}=dn(t.packedInputs,h.shapeInfo.logicalShape,h.shapeInfo.texShape);switch(g.length){case 1:s.push(`uniform int ${h.name}Shape;`);break;case 2:s.push(`uniform ivec2 ${h.name}Shape;`);break;case 3:s.push(`uniform ivec3 ${h.name}Shape;`);break;case 4:s.push(`uniform ivec4 ${h.name}Shape;`);break}s.push(`uniform ivec2 ${h.name}TexShape;`)}}),t.enableShapeUniforms){switch(e.logicalShape.length){case 1:s.push("uniform int outShape;");break;case 2:s.push("uniform ivec2 outShape;"),s.push("uniform int outShapeStrides;");break;case 3:s.push("uniform ivec3 outShape;"),s.push("uniform ivec2 outShapeStrides;");break;case 4:s.push("uniform ivec4 outShape;"),s.push("uniform ivec3 outShapeStrides;");break}s.push("uniform ivec2 outTexShape;")}t.customUniforms&&t.customUniforms.forEach(h=>{s.push(`uniform ${h.type} ${h.name}${h.arrayIndex?`[${h.arrayIndex}]`:""};`)});const o=s.join(`
`),r=n.map(h=>Il(h,e,t.packedInputs,t.enableShapeUniforms)).join(`
`),a=e.texShape,c=z(),i=Nl(c);let l,u,d=Pl(c);return e.isPacked?(l=Tl(e.logicalShape,a,t.enableShapeUniforms),u=Ol(c)):(l=El(e.logicalShape,a,t.enableShapeUniforms),u=kl(c)),t.packedInputs&&(d+=_l),[d,i,u,o,l,r,t.userCode].join(`
`)}function Me(n,e=!1){const t=n.shapeInfo.logicalShape;switch(t.length){case 0:return jl(n,e);case 1:return Yl(n,e);case 2:return Zl(n,e);case 3:return eu(n,e);case 4:return nu(n,e);case 5:return su(n);case 6:return ou(n);default:throw new Error(`${t.length}-D input sampling is not yet supported`)}}function _s(n,e){switch(n.shapeInfo.logicalShape.length){case 0:return Kl(n);case 1:return ql(n,e);case 2:return Ql(n,e);case 3:return Jl(n,e);default:return tu(n,e)}}function Il(n,e,t=!1,s){let o="";t?o+=_s(n,s):o+=Me(n,s);const r=n.shapeInfo.logicalShape,a=e.logicalShape;return r.length<=a.length&&(t?o+=ru(n,e):o+=au(n,e)),o}function Tl(n,e,t){switch(n.length){case 0:return Ls();case 1:return Ll(n,e,t);case 2:return Hl(n,e,t);case 3:return Vl(n,e,t);default:return Wl(n,e,t)}}function El(n,e,t){switch(n.length){case 0:return Ls();case 1:return Bl(n,e,t);case 2:return Xl(n,e,t);case 3:return Ul(n,e,t);case 4:return Ml(n,e,t);case 5:return Gl(n,e);case 6:return zl(n,e);default:throw new Error(`${n.length}-D output sampling is not yet supported`)}}function Nl(n){return`
    float sampleTexture(sampler2D textureSampler, vec2 uv) {
      return ${n.texture2D}(textureSampler, uv).r;
    }
  `}function kl(n){return`
    void setOutput(float val) {
      ${n.output} = vec4(val, 0, 0, 0);
    }
  `}function Ol(n){return`
    void setOutput(vec4 val) {
      ${n.output} = val;
    }
  `}function Pl(n){return`${n.version}
    precision highp float;
    precision highp int;
    precision highp sampler2D;
    ${n.varyingFs} vec2 resultUV;
    ${n.defineOutput}
    const vec2 halfCR = vec2(0.5, 0.5);

    struct ivec5
    {
      int x;
      int y;
      int z;
      int w;
      int u;
    };

    struct ivec6
    {
      int x;
      int y;
      int z;
      int w;
      int u;
      int v;
    };

    uniform float NAN;
    ${n.defineSpecialNaN}
    ${n.defineSpecialInf}
    ${n.defineRound}

    int imod(int x, int y) {
      return x - y * (x / y);
    }

    int idiv(int a, int b, float sign) {
      int res = a / b;
      int mod = imod(a, b);
      if (sign < 0. && mod != 0) {
        res -= 1;
      }
      return res;
    }

    //Based on the work of Dave Hoskins
    //https://www.shadertoy.com/view/4djSRW
    #define HASHSCALE1 443.8975
    float random(float seed){
      vec2 p = resultUV * seed;
      vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
      p3 += dot(p3, p3.yzx + 19.19);
      return fract((p3.x + p3.y) * p3.z);
    }

    ${Dl}
    ${Al}
    ${Fl}
  `}const Dl=`
vec2 uvFromFlat(int texNumR, int texNumC, int index) {
  int texR = index / texNumC;
  int texC = index - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
vec2 packedUVfrom1D(int texNumR, int texNumC, int index) {
  int texelIndex = index / 2;
  int texR = texelIndex / texNumC;
  int texC = texelIndex - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,Al=`
vec2 packedUVfrom2D(int texelsInLogicalRow, int texNumR,
  int texNumC, int row, int col) {
  int texelIndex = (row / 2) * texelsInLogicalRow + (col / 2);
  int texR = texelIndex / texNumC;
  int texC = texelIndex - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,Fl=`
vec2 packedUVfrom3D(int texNumR, int texNumC,
    int texelsInBatch, int texelsInLogicalRow, int b,
    int row, int col) {
  int index = b * texelsInBatch + (row / 2) * texelsInLogicalRow + (col / 2);
  int texR = index / texNumC;
  int texC = index - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,_l=`
  float getChannel(vec4 frag, vec2 innerDims) {
    vec2 modCoord = mod(innerDims, 2.);
    return modCoord.x == 0. ?
      (modCoord.y == 0. ? frag.r : frag.g) :
      (modCoord.y == 0. ? frag.b : frag.a);
  }
  float getChannel(vec4 frag, int dim) {
    float modCoord = mod(float(dim), 2.);
    return modCoord == 0. ? frag.r : frag.g;
  }
`;function Ls(){return`
    int getOutputCoords() {
      return 0;
    }
  `}function Ll(n,e,t){const s=[Math.ceil(e[0]/2),Math.ceil(e[1]/2)];return s[0]===1?t?`
      int getOutputCoords() {
        return 2 * int(resultUV.x * ceil(float(outTexShape[1]) / 2.0));
      }
    `:`
      int getOutputCoords() {
        return 2 * int(resultUV.x * ${s[1]}.0);
      }
    `:s[1]===1?t?`
      int getOutputCoords() {
        return 2 * int(resultUV.y * ceil(float(outTexShape[0]) / 2.0));
      }
    `:`
      int getOutputCoords() {
        return 2 * int(resultUV.y * ${s[0]}.0);
      }
    `:t?`
    int getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      return 2 * (resTexRC.x * packedTexShape[1] + resTexRC.y);
    }
  `:`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${s[0]}, ${s[1]}));
      return 2 * (resTexRC.x * ${s[1]} + resTexRC.y);
    }
  `}function Bl(n,e,t){return e[0]===1?t?`
      int getOutputCoords() {
        return int(resultUV.x * float(outTexShape[1]));
      }
    `:`
      int getOutputCoords() {
        return int(resultUV.x * ${e[1]}.0);
      }
    `:e[1]===1?t?`
      int getOutputCoords() {
        return int(resultUV.y * float(outTexShape[0]));
      }
    `:`
      int getOutputCoords() {
        return int(resultUV.y * ${e[0]}.0);
      }
    `:t?`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(outTexShape[0], outTexShape[1]));
      return resTexRC.x * outTexShape[1] + resTexRC.y;
    }
  `:`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${e[0]}, ${e[1]}));
      return resTexRC.x * ${e[1]} + resTexRC.y;
    }
  `}function Vl(n,e,t){if(t)return`
    ivec3 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      int texelsInLogicalRow = int(ceil(float(outShape[2]) / 2.0));
      int texelsInBatch = texelsInLogicalRow * int(ceil(float(outShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;

      int b = index / texelsInBatch;
      index -= b * texelsInBatch;

      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec3(b, r, c);
    }
  `;const s=[Math.ceil(e[0]/2),Math.ceil(e[1]/2)],o=Math.ceil(n[2]/2),r=o*Math.ceil(n[1]/2);return`
    ivec3 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${s[0]}, ${s[1]}));
      int index = resTexRC.x * ${s[1]} + resTexRC.y;

      int b = index / ${r};
      index -= b * ${r};

      int r = 2 * (index / ${o});
      int c = imod(index, ${o}) * 2;

      return ivec3(b, r, c);
    }
  `}function Ul(n,e,t){if(t)return`
  ivec3 getOutputCoords() {
    ivec2 resTexRC = ivec2(resultUV.yx *
                           vec2(outTexShape[0], outTexShape[1]));
    int index = resTexRC.x * outTexShape[1] + resTexRC.y;
    ${Dt(["r","c","d"],n)}
    return ivec3(r, c, d);
  }
`;const s=Oe(["r","c","d"],n);return`
    ivec3 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${e[0]}, ${e[1]}));
      int index = resTexRC.x * ${e[1]} + resTexRC.y;
      ${s}
      return ivec3(r, c, d);
    }
  `}function Wl(n,e,t){if(t)return`
    ivec4 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;

      int texelsInLogicalRow = int(ceil(float(outShape[3]) / 2.0));
      int texelsInBatch = texelsInLogicalRow * int(ceil(float(outShape[2]) / 2.0));
      int texelsInBatchN = texelsInBatch * outShape[1];

      int b2 = index / texelsInBatchN;
      index -= b2 * texelsInBatchN;

      int b = index / texelsInBatch;
      index -= b * texelsInBatch;

      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec4(b2, b, r, c);
    }
  `;const s=[Math.ceil(e[0]/2),Math.ceil(e[1]/2)],o=Math.ceil(n[n.length-1]/2),r=o*Math.ceil(n[n.length-2]/2);let a=r,c="",i="b, r, c";for(let l=2;l<n.length-1;l++)a*=n[n.length-l-1],c=`
      int b${l} = index / ${a};
      index -= b${l} * ${a};
    `+c,i=`b${l}, `+i;return`
    ivec${n.length} getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${s[0]}, ${s[1]}));
      int index = resTexRC.x * ${s[1]} + resTexRC.y;

      ${c}

      int b = index / ${r};
      index -= b * ${r};

      int r = 2 * (index / ${o});
      int c = imod(index, ${o}) * 2;

      return ivec${n.length}(${i});
    }
  `}function Ml(n,e,t){if(t)return`
    ivec4 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(outTexShape[0], outTexShape[1]));
      int index = resTexRC.x * outTexShape[1] + resTexRC.y;
      ${Dt(["r","c","d","d2"],n)}
      return ivec4(r, c, d, d2);
    }
  `;const s=Oe(["r","c","d","d2"],n);return`
    ivec4 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(${e[0]}, ${e[1]}));
      int index = resTexRC.x * ${e[1]} + resTexRC.y;
      ${s}
      return ivec4(r, c, d, d2);
    }
  `}function Gl(n,e){const t=Oe(["r","c","d","d2","d3"],n);return`
    ivec5 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx * vec2(${e[0]},
                             ${e[1]}));

      int index = resTexRC.x * ${e[1]} + resTexRC.y;

      ${t}

      ivec5 outShape = ivec5(r, c, d, d2, d3);
      return outShape;
    }
  `}function zl(n,e){const t=Oe(["r","c","d","d2","d3","d4"],n);return`
    ivec6 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(${e[0]}, ${e[1]}));
      int index = resTexRC.x * ${e[1]} + resTexRC.y;

      ${t}

      ivec6 result = ivec6(r, c, d, d2, d3, d4);
      return result;
    }
  `}function Hl(n,e,t){const s=[Math.ceil(e[0]/2),Math.ceil(e[1]/2)];if(H(n,e))return t?`
      ivec2 getOutputCoords() {
        ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
        return 2 * ivec2(resultUV.yx * vec2(packedTexShape[0], packedTexShape[1]));
      }
    `:`
      ivec2 getOutputCoords() {
        return 2 * ivec2(resultUV.yx * vec2(${s[0]}, ${s[1]}));
      }
    `;const o=Math.ceil(n[1]/2);return t?`
    ivec2 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      int texelsInLogicalRow = int(ceil(float(outShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));

      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;
      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec2(r, c);
    }
  `:`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${s[0]}, ${s[1]}));

      int index = resTexRC.x * ${s[1]} + resTexRC.y;
      int r = 2 * (index / ${o});
      int c = imod(index, ${o}) * 2;

      return ivec2(r, c);
    }
  `}function Xl(n,e,t){return H(n,e)?t?`
      ivec2 getOutputCoords() {
        return ivec2(resultUV.yx * vec2(outTexShape[0], outTexShape[1]));
      }
    `:`
      ivec2 getOutputCoords() {
        return ivec2(resultUV.yx * vec2(${e[0]}, ${e[1]}));
      }
    `:n[1]===1?t?`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(outTexShape[0], outTexShape[1]));
        int index = resTexRC.x * outTexShape[1] + resTexRC.y;
        return ivec2(index, 0);
      }
    `:`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(${e[0]}, ${e[1]}));
        int index = resTexRC.x * ${e[1]} + resTexRC.y;
        return ivec2(index, 0);
      }
    `:n[0]===1?t?`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(outTexShape[0], outTexShape[1]));
        int index = resTexRC.x * outTexShape[1] + resTexRC.y;
        return ivec2(0, index);
      }
    `:`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(${e[0]}, ${e[1]}));
        int index = resTexRC.x * ${e[1]} + resTexRC.y;
        return ivec2(0, index);
      }
    `:t?`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(outTexShape[0], outTexShape[1]));
      int index = resTexRC.x * outTexShape[1] + resTexRC.y;
      int r = index / outShape[1];
      int c = index - r * outShape[1];
      return ivec2(r, c);
    }
  `:`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${e[0]}, ${e[1]}));
      int index = resTexRC.x * ${e[1]} + resTexRC.y;
      int r = index / ${n[1]};
      int c = index - r * ${n[1]};
      return ivec2(r, c);
    }
  `}function Pe(n){return`offset${n}`}function Kl(n){const e=n.name,t="get"+e.charAt(0).toUpperCase()+e.slice(1),s=z();return`
    vec4 ${t}() {
      return ${s.texture2D}(${e}, halfCR);
    }
  `}function jl(n,e){const t=n.name,s="get"+t.charAt(0).toUpperCase()+t.slice(1);if(n.shapeInfo.isUniform)return`float ${s}() {return ${t};}`;const[o,r]=n.shapeInfo.texShape;if(o===1&&r===1)return`
      float ${s}() {
        return sampleTexture(${t}, halfCR);
      }
    `;const a=Pe(t);if(e)return`
    float ${s}() {
      vec2 uv = uvFromFlat(${t}TexShape[0], ${t}TexShape[1], ${a});
      return sampleTexture(${t}, uv);
    }
  `;const[c,i]=n.shapeInfo.texShape;return`
    float ${s}() {
      vec2 uv = uvFromFlat(${c}, ${i}, ${a});
      return sampleTexture(${t}, uv);
    }
  `}function ql(n,e){const t=n.name,s="get"+t.charAt(0).toUpperCase()+t.slice(1),o=n.shapeInfo.texShape,r=z();if(e)return`
    vec4 ${s}(int index) {
      ivec2 packedTexShape = ivec2(ceil(float(${t}TexShape[0]) / 2.0), ceil(float(${t}TexShape[1]) / 2.0));
      vec2 uv = packedUVfrom1D(
        packedTexShape[0], packedTexShape[1], index);
      return ${r.texture2D}(${t}, uv);
    }
  `;const a=[Math.ceil(o[0]/2),Math.ceil(o[1]/2)];return`
    vec4 ${s}(int index) {
      vec2 uv = packedUVfrom1D(
        ${a[0]}, ${a[1]}, index);
      return ${r.texture2D}(${t}, uv);
    }
  `}function Yl(n,e){const t=n.name,s="get"+t.charAt(0).toUpperCase()+t.slice(1);if(n.shapeInfo.isUniform)return`
      float ${s}(int index) {
        ${Ge(n)}
      }
    `;const o=n.shapeInfo.texShape,r=o[0],a=o[1];if(a===1&&r===1)return`
      float ${s}(int index) {
        return sampleTexture(${t}, halfCR);
      }
    `;const c=Pe(t);return a===1?e?`
      float ${s}(int index) {
        vec2 uv = vec2(0.5, (float(index + ${c}) + 0.5) / float(${t}TexShape[0]));
        return sampleTexture(${t}, uv);
      }
    `:`
      float ${s}(int index) {
        vec2 uv = vec2(0.5, (float(index + ${c}) + 0.5) / ${r}.0);
        return sampleTexture(${t}, uv);
      }
    `:r===1?e?`
      float ${s}(int index) {
        vec2 uv = vec2((float(index + ${c}) + 0.5) / float(${t}TexShape[1]), 0.5);
        return sampleTexture(${t}, uv);
      }
    `:`
      float ${s}(int index) {
        vec2 uv = vec2((float(index + ${c}) + 0.5) / ${a}.0, 0.5);
        return sampleTexture(${t}, uv);
      }
    `:e?`
    float ${s}(int index) {
      vec2 uv = uvFromFlat(${t}TexShape[0], ${t}TexShape[1], index + ${c});
      return sampleTexture(${t}, uv);
    }
  `:`
    float ${s}(int index) {
      vec2 uv = uvFromFlat(${r}, ${a}, index + ${c});
      return sampleTexture(${t}, uv);
    }
  `}function Ql(n,e){const t=n.shapeInfo.logicalShape,s=n.name,o="get"+s.charAt(0).toUpperCase()+s.slice(1),r=n.shapeInfo.texShape,a=r[0],c=r[1],i=z();if(r!=null&&H(t,r))return e?`
      vec4 ${o}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${s}TexShape[1], ${s}TexShape[0]);

        return ${i.texture2D}(${s}, uv);
      }
    `:`
      vec4 ${o}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${c}.0, ${a}.0);

        return ${i.texture2D}(${s}, uv);
      }
    `;if(e)return`
    vec4 ${o}(int row, int col) {
      ivec2 packedTexShape = ivec2(ceil(float(${s}TexShape[0]) / 2.0), ceil(float(${s}TexShape[1]) / 2.0));
      int valuesPerRow = int(ceil(float(${s}Shape[1]) / 2.0));
      vec2 uv = packedUVfrom2D(valuesPerRow, packedTexShape[0], packedTexShape[1], row, col);
      return ${i.texture2D}(${s}, uv);
    }
  `;const l=[Math.ceil(r[0]/2),Math.ceil(r[1]/2)],u=Math.ceil(t[1]/2);return`
    vec4 ${o}(int row, int col) {
      vec2 uv = packedUVfrom2D(${u}, ${l[0]}, ${l[1]}, row, col);
      return ${i.texture2D}(${s}, uv);
    }
  `}function Zl(n,e){const t=n.shapeInfo.logicalShape,s=n.name,o="get"+s.charAt(0).toUpperCase()+s.slice(1),r=n.shapeInfo.texShape;if(r!=null&&H(t,r)){if(e)return`
      float ${o}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${s}TexShape[1], ${s}TexShape[0]);
        return sampleTexture(${s}, uv);
      }
    `;const p=r[0],h=r[1];return`
    float ${o}(int row, int col) {
      vec2 uv = (vec2(col, row) + halfCR) / vec2(${h}.0, ${p}.0);
      return sampleTexture(${s}, uv);
    }
  `}const{newShape:a,keptDims:c}=ke(t),i=a;if(i.length<t.length){const p=ze(n,i),h=["row","col"];return`
      ${Me(p,e)}
      float ${o}(int row, int col) {
        return ${o}(${He(h,c)});
      }
    `}if(n.shapeInfo.isUniform)return`
      float ${o}(int row, int col) {
        int index = round(dot(vec2(row, col), vec2(${t[1]}, 1)));
        ${Ge(n)}
      }
    `;const l=r[0],u=r[1],d=Pe(s);return u===1?e?`
      float ${o}(int row, int col) {
        float index = dot(vec3(row, col, ${d}), vec3(${s}Shape[1], 1, 1));
        vec2 uv = vec2(0.5, (index + 0.5) / float(${s}TexShape[0]));
        return sampleTexture(${s}, uv);
      }
    `:`
    float ${o}(int row, int col) {
      float index = dot(vec3(row, col, ${d}), vec3(${t[1]}, 1, 1));
      vec2 uv = vec2(0.5, (index + 0.5) / ${l}.0);
      return sampleTexture(${s}, uv);
    }
  `:l===1?e?`
      float ${o}(int row, int col) {
        float index = dot(vec3(row, col, ${d}), vec3(${s}Shape[1], 1, 1));
        vec2 uv = vec2((index + 0.5) / float(${s}TexShape[1]), 0.5);
        return sampleTexture(${s}, uv);
      }
    `:`
    float ${o}(int row, int col) {
      float index = dot(vec3(row, col, ${d}), vec3(${t[1]}, 1, 1));
      vec2 uv = vec2((index + 0.5) / ${u}.0, 0.5);
      return sampleTexture(${s}, uv);
    }
  `:e?`
      float ${o}(int row, int col) {
        // Explicitly use integer operations as dot() only works on floats.
        int index = row * ${s}Shape[1] + col + ${d};
        vec2 uv = uvFromFlat(${s}TexShape[0], ${s}TexShape[1], index);
        return sampleTexture(${s}, uv);
      }
    `:`
  float ${o}(int row, int col) {
    // Explicitly use integer operations as dot() only works on floats.
    int index = row * ${t[1]} + col + ${d};
    vec2 uv = uvFromFlat(${l}, ${u}, index);
    return sampleTexture(${s}, uv);
  }
`}function Jl(n,e){const t=n.shapeInfo.logicalShape,s=n.name,o="get"+s.charAt(0).toUpperCase()+s.slice(1),r=n.shapeInfo.texShape,a=[Math.ceil(r[0]/2),Math.ceil(r[1]/2)];if(t[0]===1){const p=t.slice(1),h=[1,2],f=ze(n,p),g=["b","row","col"];return`
        ${_s(f,e)}
        vec4 ${o}(int b, int row, int col) {
          return ${o}(${He(g,h)});
        }
      `}const c=z();if(e)return`
    vec4 ${o}(int b, int row, int col) {
      ivec2 packedTexShape = ivec2(ceil(float(${s}TexShape[0]) / 2.0), ceil(float(${s}TexShape[1]) / 2.0));
      int valuesPerRow = int(ceil(float(${s}Shape[2]) / 2.0));
      int texelsInBatch = valuesPerRow * int(ceil(float(${s}Shape[1]) / 2.0));
      vec2 uv = packedUVfrom3D(
        packedTexShape[0], packedTexShape[1], texelsInBatch, valuesPerRow, b, row, col);
      return ${c.texture2D}(${s}, uv);
    }
  `;const i=a[0],l=a[1],u=Math.ceil(t[2]/2),d=u*Math.ceil(t[1]/2);return`
    vec4 ${o}(int b, int row, int col) {
      vec2 uv = packedUVfrom3D(
        ${i}, ${l}, ${d}, ${u}, b, row, col);
      return ${c.texture2D}(${s}, uv);
    }
  `}function eu(n,e){const t=n.shapeInfo.logicalShape,s=n.name,o="get"+s.charAt(0).toUpperCase()+s.slice(1),r=t[1]*t[2],a=t[2],{newShape:c,keptDims:i}=ke(t),l=c;if(l.length<t.length){const g=ze(n,l),x=["row","col","depth"];return`
        ${Me(g,e)}
        float ${o}(int row, int col, int depth) {
          return ${o}(${He(x,i)});
        }
      `}if(n.shapeInfo.isUniform)return`
      float ${o}(int row, int col, int depth) {
        int index = round(dot(vec3(row, col, depth),
                          vec3(${r}, ${a}, 1)));
        ${Ge(n)}
      }
    `;const u=n.shapeInfo.texShape,d=u[0],p=u[1],h=n.shapeInfo.flatOffset;if(p===r&&h==null)return e?`
      float ${o}(int row, int col, int depth) {
        int stride1 = ${s}Shape[2];
        float texR = float(row);
        float texC = dot(vec2(col, depth), vec2(stride1, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${s}TexShape[1], ${s}TexShape[0]);
        return sampleTexture(${s}, uv);
      }
    `:`
        float ${o}(int row, int col, int depth) {
          float texR = float(row);
          float texC = dot(vec2(col, depth), vec2(${a}, 1));
          vec2 uv = (vec2(texC, texR) + halfCR) /
                     vec2(${p}.0, ${d}.0);
          return sampleTexture(${s}, uv);
        }
      `;if(p===a&&h==null)return e?`
      float ${o}(int row, int col, int depth) {
        float texR = dot(vec2(row, col), vec2(${s}Shape[1], 1));
        float texC = float(depth);
        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${s}TexShape[1], ${s}TexShape[0]);
        return sampleTexture(${s}, uv);
      }
    `:`
    float ${o}(int row, int col, int depth) {
      float texR = dot(vec2(row, col), vec2(${t[1]}, 1));
      float texC = float(depth);
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${p}.0, ${d}.0);
      return sampleTexture(${s}, uv);
    }
  `;const f=Pe(s);return e?`
    float ${o}(int row, int col, int depth) {
      // Explicitly use integer operations as dot() only works on floats.
      int stride0 = ${s}Shape[1] * ${s}Shape[2];
      int stride1 = ${s}Shape[2];
      int index = row * stride0 + col * stride1 + depth + ${f};
      vec2 uv = uvFromFlat(${s}TexShape[0], ${s}TexShape[1], index);
      return sampleTexture(${s}, uv);
    }
    `:`
      float ${o}(int row, int col, int depth) {
        // Explicitly use integer operations as dot() only works on floats.
        int index = row * ${r} + col * ${a} + depth + ${f};
        vec2 uv = uvFromFlat(${d}, ${p}, index);
        return sampleTexture(${s}, uv);
      }
  `}function tu(n,e){const t=n.name,s="get"+t.charAt(0).toUpperCase()+t.slice(1),o=z();if(e)return`
    vec4 ${s}(int b2, int b, int row, int col) {
      int valuesPerRow = int(ceil(float(${t}Shape[3]) / 2.0));
      int texelsInBatch = valuesPerRow * int(ceil(float(${t}Shape[2]) / 2.0));
      int index = b * texelsInBatch + (row / 2) * valuesPerRow + (col / 2);
      texelsInBatch *= ${t}Shape[1];
      index = b2 * texelsInBatch + index;
      ivec2 packedTexShape = ivec2(ceil(float(${t}TexShape[0]) / 2.0), ceil(float(${t}TexShape[1]) / 2.0));
      int texR = index / packedTexShape[1];
      int texC = index - texR * packedTexShape[1];
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(packedTexShape[1], packedTexShape[0]); return ${o.texture2D}(${t}, uv);
    }
  `;const r=n.shapeInfo.logicalShape,a=r.length,c=n.shapeInfo.texShape,i=[Math.ceil(c[0]/2),Math.ceil(c[1]/2)],l=i[0],u=i[1],d=Math.ceil(r[a-1]/2);let p=d*Math.ceil(r[a-2]/2),h="int b, int row, int col",f=`b * ${p} + (row / 2) * ${d} + (col / 2)`;for(let g=2;g<a-1;g++)h=`int b${g}, `+h,p*=r[a-g-1],f=`b${g} * ${p} + `+f;return`
    vec4 ${s}(${h}) {
      int index = ${f};
      int texR = index / ${u};
      int texC = index - texR * ${u};
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${u}, ${l});
      return ${o.texture2D}(${t}, uv);
    }
  `}function nu(n,e){const t=n.shapeInfo.logicalShape,s=n.name,o="get"+s.charAt(0).toUpperCase()+s.slice(1),r=t[3],a=t[2]*r,c=t[1]*a,{newShape:i,keptDims:l}=ke(t);if(i.length<t.length){const C=ze(n,i),b=["row","col","depth","depth2"];return`
      ${Me(C,e)}
      float ${o}(int row, int col, int depth, int depth2) {
        return ${o}(${He(b,l)});
      }
    `}if(n.shapeInfo.isUniform)return`
      float ${o}(int row, int col, int depth, int depth2) {
        int index = round(dot(vec4(row, col, depth, depth2),
                          vec4(${c}, ${a}, ${r}, 1)));
        ${Ge(n)}
      }
    `;const u=n.shapeInfo.flatOffset,d=n.shapeInfo.texShape,p=d[0],h=d[1],f=`int stride2 = ${s}Shape[3];`,g=`int stride1 = ${s}Shape[2] * stride2;`,x=`int stride0 = ${s}Shape[1] * stride1;`;if(h===c&&u==null)return e?`
      float ${o}(int row, int col, int depth, int depth2) {
        ${f}
        ${g}
        float texR = float(row);
        float texC =
            dot(vec3(col, depth, depth2),
                vec3(stride1, stride2, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${s}TexShape[1], ${s}TexShape[0]);
        return sampleTexture(${s}, uv);
      }
    `:`
      float ${o}(int row, int col, int depth, int depth2) {
        float texR = float(row);
        float texC =
            dot(vec3(col, depth, depth2),
                vec3(${a}, ${r}, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${h}.0, ${p}.0);
        return sampleTexture(${s}, uv);
      }
    `;if(h===r&&u==null)return e?`
      float ${o}(int row, int col, int depth, int depth2) {
        float texR = dot(vec3(row, col, depth),
                         vec3(${s}Shape[1] * ${s}Shape[2], ${s}Shape[2], 1));
        float texC = float(depth2);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${s}TexShape[1], ${s}TexShape[0]);
        return sampleTexture(${s}, uv);
      }
    `:`
      float ${o}(int row, int col, int depth, int depth2) {
        float texR = dot(vec3(row, col, depth),
                         vec3(${t[1]*t[2]}, ${t[2]}, 1));
        float texC = float(depth2);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${h}.0, ${p}.0);
        return sampleTexture(${s}, uv);
      }
    `;const m=Pe(s);return e?`
    float ${o}(int row, int col, int depth, int depth2) {
      // Explicitly use integer operations as dot() only works on floats.
      ${f}
      ${g}
      ${x}
      int index = row * stride0 + col * stride1 +
          depth * stride2 + depth2;
      vec2 uv = uvFromFlat(${s}TexShape[0], ${s}TexShape[1], index + ${m});
      return sampleTexture(${s}, uv);
    }
  `:`
    float ${o}(int row, int col, int depth, int depth2) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${c} + col * ${a} +
          depth * ${r} + depth2;
      vec2 uv = uvFromFlat(${p}, ${h}, index + ${m});
      return sampleTexture(${s}, uv);
    }
  `}function su(n){const e=n.shapeInfo.logicalShape,t=n.name,s="get"+t.charAt(0).toUpperCase()+t.slice(1),o=e[4],r=e[3]*o,a=e[2]*r,c=e[1]*a,{newShape:i,keptDims:l}=ke(e);if(i.length<e.length){const g=ze(n,i),x=["row","col","depth","depth2","depth3"];return`
      ${Me(g)}
      float ${s}(int row, int col, int depth, int depth2, int depth3) {
        return ${s}(${He(x,l)});
      }
    `}if(n.shapeInfo.isUniform)return`
      float ${s}(int row, int col, int depth, int depth2, int depth3) {
        float index = dot(
          vec4(row, col, depth, depth2),
          vec4(${c}, ${a}, ${r}, ${o})) +
          depth3;
        ${Ge(n)}
      }
    `;const u=n.shapeInfo.flatOffset,d=n.shapeInfo.texShape,p=d[0],h=d[1];if(h===c&&u==null)return`
      float ${s}(int row, int col, int depth, int depth2, int depth3) {
        int texR = row;
        float texC = dot(vec4(col, depth, depth2, depth3),
                         vec4(${a}, ${r}, ${o}, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${h}.0, ${p}.0);
        return sampleTexture(${t}, uv);
      }
    `;if(h===o&&u==null)return`
      float ${s}(int row, int col, int depth, int depth2, int depth3) {
        float texR = dot(
          vec4(row, col, depth, depth2),
          vec4(${e[1]*e[2]*e[3]},
               ${e[2]*e[3]}, ${e[3]}, 1));
        int texC = depth3;
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${h}.0, ${p}.0);
        return sampleTexture(${t}, uv);
      }
    `;const f=Pe(t);return`
    float ${s}(int row, int col, int depth, int depth2, int depth3) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${c} + col * ${a} + depth * ${r} +
          depth2 * ${o} + depth3 + ${f};
      vec2 uv = uvFromFlat(${p}, ${h}, index);
      return sampleTexture(${t}, uv);
    }
  `}function ou(n){const e=n.shapeInfo.logicalShape,t=n.name,s="get"+t.charAt(0).toUpperCase()+t.slice(1),{newShape:o,keptDims:r}=ke(e);if(o.length<e.length){const x=ze(n,o),m=["row","col","depth","depth2","depth3","depth4"];return`
      ${Me(x)}
      float ${s}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        return ${s}(${He(m,r)});
      }
    `}const a=e[5],c=e[4]*a,i=e[3]*c,l=e[2]*i,u=e[1]*l;if(n.shapeInfo.isUniform)return`
      float ${s}(int row, int col, int depth,
                  int depth2, int depth3, int depth4) {
        int index = round(dot(
          vec4(row, col, depth, depth2),
          vec4(${u}, ${l}, ${i}, ${c})) +
          dot(
            vec2(depth3, depth4),
            vec2(${a}, 1)));
        ${Ge(n)}
      }
    `;const d=n.shapeInfo.flatOffset,p=n.shapeInfo.texShape,h=p[0],f=p[1];if(f===u&&d==null)return`
      float ${s}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        int texR = row;
        float texC = dot(vec4(col, depth, depth2, depth3),
          vec4(${l}, ${i}, ${c}, ${a})) +
               float(depth4);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${f}.0, ${h}.0);
        return sampleTexture(${t}, uv);
      }
    `;if(f===a&&d==null)return`
      float ${s}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        float texR = dot(vec4(row, col, depth, depth2),
          vec4(${e[1]*e[2]*e[3]*e[4]},
               ${e[2]*e[3]*e[4]},
               ${e[3]*e[4]},
               ${e[4]})) + float(depth3);
        int texC = depth4;
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${f}.0, ${h}.0);
        return sampleTexture(${t}, uv);
      }
    `;const g=Pe(t);return`
    float ${s}(int row, int col, int depth,
                  int depth2, int depth3, int depth4) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${u} + col * ${l} + depth * ${i} +
          depth2 * ${c} + depth3 * ${a} + depth4 + ${g};
      vec2 uv = uvFromFlat(${h}, ${f}, index);
      return sampleTexture(${t}, uv);
    }
  `}function Ge(n){const e=n.name,t=T(n.shapeInfo.logicalShape);return t<2?`return ${e};`:`
    for (int i = 0; i < ${t}; i++) {
      if (i == index) {
        return ${e}[i];
      }
    }
  `}function ru(n,e){const t=n.name,s=t.charAt(0).toUpperCase()+t.slice(1),o="get"+s+"AtOutCoords",r=n.shapeInfo.logicalShape.length,a=e.logicalShape.length,c=Fs(n.shapeInfo.logicalShape,e.logicalShape),i=D(a),l=a-r;let u;const d=["x","y","z","w","u","v"];r===0?u="":a<2&&c.length>=1?u="coords = 0;":u=c.map(C=>`coords.${d[C+l]} = 0;`).join(`
`);let p="";a<2&&r>0?p="coords":p=n.shapeInfo.logicalShape.map((C,b)=>`coords.${d[b+l]}`).join(", ");let h="return outputValue;";const g=T(n.shapeInfo.logicalShape)===1,m=T(e.logicalShape)===1;if(r===1&&!g&&!m)h=`
      return vec4(outputValue.xy, outputValue.xy);
    `;else if(g&&!m)a===1?h=`
        return vec4(outputValue.x, outputValue.x, 0., 0.);
      `:h=`
        return vec4(outputValue.x);
      `;else if(c.length){const C=r-2,b=r-1;c.indexOf(C)>-1&&c.indexOf(b)>-1?h="return vec4(outputValue.x);":c.indexOf(C)>-1?h="return vec4(outputValue.x, outputValue.y, outputValue.x, outputValue.y);":c.indexOf(b)>-1&&(h="return vec4(outputValue.xx, outputValue.zz);")}return`
    vec4 ${o}() {
      ${i} coords = getOutputCoords();
      ${u}
      vec4 outputValue = get${s}(${p});
      ${h}
    }
  `}function au(n,e){const t=n.name,s=t.charAt(0).toUpperCase()+t.slice(1),o="get"+s+"AtOutCoords",r=e.texShape,a=n.shapeInfo.texShape,c=n.shapeInfo.logicalShape.length,i=e.logicalShape.length;if(!n.shapeInfo.isUniform&&c===i&&n.shapeInfo.flatOffset==null&&H(a,r))return`
      float ${o}() {
        return sampleTexture(${t}, resultUV);
      }
    `;const l=D(i),u=Fs(n.shapeInfo.logicalShape,e.logicalShape),d=i-c;let p;const h=["x","y","z","w","u","v"];c===0?p="":i<2&&u.length>=1?p="coords = 0;":p=u.map(g=>`coords.${h[g+d]} = 0;`).join(`
`);let f="";return i<2&&c>0?f="coords":f=n.shapeInfo.logicalShape.map((g,x)=>`coords.${h[x+d]}`).join(", "),`
    float ${o}() {
      ${l} coords = getOutputCoords();
      ${p}
      return get${s}(${f});
    }
  `}function D(n){if(n<=1)return"int";if(n===2)return"ivec2";if(n===3)return"ivec3";if(n===4)return"ivec4";if(n===5)return"ivec5";if(n===6)return"ivec6";throw Error(`GPU for rank ${n} is not yet supported`)}function dn(n,e,t){const{newShape:s,keptDims:o}=ke(e),r=e.length,a=n&&r===3&&e[0]===1,c=a?e.slice(1):s,i=!n&&r>1&&!H(e,t)&&s.length<r||a;return{useSqueezeShape:i,uniformShape:i?c:e,keptDims:o}}function ze(n,e){const t=JSON.parse(JSON.stringify(n));return t.shapeInfo.logicalShape=e,t}function He(n,e){return e.map(t=>n[t]).join(", ")}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function iu(n,e,t,s){const o=t.map((u,d)=>{const p={logicalShape:u.shape,texShape:u.isUniform?null:u.texData.texShape,isUniform:u.isUniform,isPacked:u.isUniform?!1:u.texData.isPacked,flatOffset:null};return u.texData!=null&&u.texData.slice!=null&&u.texData.slice.flatOffset>0&&(p.flatOffset=u.texData.slice.flatOffset),{name:e.variableNames[d],shapeInfo:p}}),r=o.map(u=>u.shapeInfo),a={logicalShape:s.shape,texShape:s.texData.texShape,isUniform:!1,isPacked:s.texData.isPacked,flatOffset:null},c=yl(o,a,e),i=hs(n.gl,c),l=n.createProgram(i);return $().get("ENGINE_COMPILE_ONLY")?{program:e,fragmentShader:i,source:c,webGLProgram:l,inShapeInfos:r,outShapeInfo:a,variablesLocations:null,customUniformLocations:null,infLoc:null,nanLoc:null,outShapeLocation:null,outShapeStridesLocation:null,outTexShapeLocation:null}:(n.buildVao(l),Object.assign({program:e,fragmentShader:i,source:c,webGLProgram:l,inShapeInfos:r,outShapeInfo:a},Bs(n,e,l)))}function Bs(n,e,t){const s=[],o=[];let r,a,c,i=null,l=null;l=n.getUniformLocation(t,"NAN",!1),$().getNumber("WEBGL_VERSION")===1&&(i=n.getUniformLocation(t,"INFINITY",!1));const u=!1;for(const d of e.variableNames){const p={name:d,uniform:n.getUniformLocation(t,d,u),offset:n.getUniformLocation(t,`offset${d}`,u)};e.enableShapeUniforms&&(p.shape=n.getUniformLocation(t,`${d}Shape`,u),p.texShape=n.getUniformLocation(t,`${d}TexShape`,u)),s.push(p)}if(e.enableShapeUniforms&&(r=n.getUniformLocation(t,"outShape",u),c=n.getUniformLocation(t,"outShapeStrides",u),a=n.getUniformLocation(t,"outTexShape",u)),e.customUniforms)for(const d of e.customUniforms)o.push(n.getUniformLocation(t,d.name,u));return{variablesLocations:s,customUniformLocations:o,infLoc:i,nanLoc:l,outShapeLocation:r,outShapeStridesLocation:c,outTexShapeLocation:a}}function En(n,e){if(n.length!==e.length)throw Error(`Binary was compiled with ${n.length} inputs, but was executed with ${e.length} inputs`);n.forEach((t,s)=>{const o=t.logicalShape,r=e[s],a=r.shape;if(!H(o,a))throw Error(`Binary was compiled with different shapes than the current args. Shapes ${o} and ${a} must match`);if(t.isUniform&&r.isUniform)return;const c=t.texShape,i=r.isUniform?null:r.texData.texShape;if(!H(c,i))throw Error(`Binary was compiled with different texture shapes than the current args. Shape ${c} and ${i} must match`)})}function cu(n,e,t,s,o){e.program.enableShapeUniforms||(En(e.inShapeInfos,t),En([e.outShapeInfo],[s]));const r=s.texData.texture,a=s.texData.texShape;s.texData.isPacked?n.setOutputPackedMatrixTexture(r.texture,a[0],a[1]):n.setOutputMatrixTexture(r.texture,a[0],a[1]),n.setProgram(e.webGLProgram),n.bindVertexArray(e.webGLProgram.vao),$().getNumber("WEBGL_VERSION")===1&&e.infLoc!==null&&n.gl.uniform1f(e.infLoc,1/0),e.nanLoc!==null&&n.gl.uniform1f(e.nanLoc,NaN);for(let i=0;i<t.length;++i){const l=t[i],{uniform:u,offset:d,shape:p,texShape:h}=e.variablesLocations[i];if(p){const{uniformShape:f}=dn(e.program.packedInputs,l.shape,l.texData.texShape);switch(f.length){case 1:n.gl.uniform1iv(p,new Int32Array(f));break;case 2:n.gl.uniform2iv(p,new Int32Array(f));break;case 3:n.gl.uniform3iv(p,new Int32Array(f));break;case 4:n.gl.uniform4iv(p,new Int32Array(f));break}}if(h&&n.gl.uniform2i(h,l.texData.texShape[0],l.texData.texShape[1]),u!=null){if(l.isUniform){if(T(l.shape)<2)n.gl.uniform1f(u,l.uniformValues[0]);else{let f=l.uniformValues;f instanceof Float32Array||(f=new Float32Array(f)),n.gl.uniform1fv(u,f)}continue}l.texData.slice!=null&&d!=null&&n.gl.uniform1i(d,l.texData.slice.flatOffset),n.setInputMatrixTexture(l.texData.texture.texture,u,i)}}const c=e.outShapeLocation;if(c)switch(s.shape.length){case 1:n.gl.uniform1iv(c,new Int32Array(s.shape));break;case 2:n.gl.uniform2iv(c,new Int32Array(s.shape));break;case 3:n.gl.uniform3iv(c,new Int32Array(s.shape));break;case 4:n.gl.uniform4iv(c,new Int32Array(s.shape));break}if(e.outShapeStridesLocation){const i=ee(s.shape);switch(s.shape.length){case 2:n.gl.uniform1iv(e.outShapeStridesLocation,new Int32Array(i));break;case 3:n.gl.uniform2iv(e.outShapeStridesLocation,new Int32Array(i));break;case 4:n.gl.uniform3iv(e.outShapeStridesLocation,new Int32Array(i));break}}if(e.outTexShapeLocation&&n.gl.uniform2i(e.outTexShapeLocation,s.texData.texShape[0],s.texData.texShape[1]),e.program.customUniforms&&o)for(let i=0;i<e.program.customUniforms.length;++i){const l=e.program.customUniforms[i],u=e.customUniformLocations[i],d=o[i];if(l.type==="float")n.gl.uniform1fv(u,d);else if(l.type==="vec2")n.gl.uniform2fv(u,d);else if(l.type==="vec3")n.gl.uniform3fv(u,d);else if(l.type==="vec4")n.gl.uniform4fv(u,d);else if(l.type==="int")n.gl.uniform1iv(u,d);else if(l.type==="ivec2")n.gl.uniform2iv(u,d);else if(l.type==="ivec3")n.gl.uniform3iv(u,d);else if(l.type==="ivec4")n.gl.uniform4iv(u,d);else throw Error(`uniform type ${l.type} is not supported yet.`)}n.executeProgram()}function lu(n,e,t){let s="";e.concat(t).forEach(a=>{const c=a.texData!=null&&a.texData.slice!=null&&a.texData.slice.flatOffset>0;if(n.enableShapeUniforms&&!a.isUniform){const i=a.texData.texShape,{useSqueezeShape:l,uniformShape:u,keptDims:d}=dn(n.packedInputs,a.shape,i);let p="",h="",f="";if(u.length===1&&n.packedInputs){const w=[Math.ceil(i[0]/2),Math.ceil(i[1]/2)];p=`${w[0]>1}_${w[1]>1}`}else if(u.length===2&&!n.packedInputs)h=`${u[0]>1}_${u[1]>1}`;else if(u.length>2&&!n.packedInputs){const w=ee(u);f=`${w[0]===i[1]}_${w[w.length-1]===i[1]}`}const g=a.shape.length,x=u.length===2&&H(a.shape,i),m=T(a.shape)===1,C=Gt(a.shape,t.shape),b=!n.packedInputs&&g===t.shape.length&&H(i,t.texData.texShape),v=n.packedInputs||u.length>2?"":`${i[0]>1}_${i[1]>1}`;s+=`${g}_${b}_${l?d:""}_${u.length}_${m}_${C}_${x}_${p}_${h}_${f}_${v}_${c}`}else{const i=a.isUniform?"uniform":a.texData.texShape;s+=`${a.shape}_${i}_${c}`}});const o=n.userCode;let r=n.constructor.name;return r+="_"+s+"_"+o+`${$().getNumber("WEBGL_VERSION")}`,r}function U(n){return $().getBool("WEBGL_USE_SHAPES_UNIFORMS")&&n<=4}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class uu{constructor(e){this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0,this.outPackingScheme=st.DENSE,this.customUniforms=[{name:"texShape",type:"ivec2"}];const t=z();this.outputShape=e,this.enableShapeUniforms=U(this.outputShape.length),this.userCode=`
      ivec3 outCoordsFromFlatIndex(int index) {
        ${this.enableShapeUniforms?Dt(["r","c","d"],e):Oe(["r","c","d"],e)}
        return ivec3(r, c, d);
      }

      void main() {
        ivec2 resTexRC = ivec2(resultUV.yx * vec2(texShape[0], texShape[1]));
        int index = 4 * (resTexRC.x * texShape[1] + resTexRC.y);

        vec4 result = vec4(0.);

        for (int i=0; i<4; i++) {
          int flatIndex = index + i;
          ivec3 rc = outCoordsFromFlatIndex(flatIndex);
          result[i] = getA(rc.x, rc.y, rc.z);
        }

        ${t.output} = result;
      }
    `}}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class du{constructor(e){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outPackingScheme=st.DENSE,this.customUniforms=[{name:"texShape",type:"ivec2"}];const t=z();this.outputShape=e,this.enableShapeUniforms=U(this.outputShape.length),this.userCode=`
      ivec3 outCoordsFromFlatIndex(int index) {
        ${this.enableShapeUniforms?Dt(["r","c","d"],e):Oe(["r","c","d"],e)}
        return ivec3(r, c, d);
      }

      void main() {
        ivec2 resTexRC = ivec2(resultUV.yx * vec2(texShape[0], texShape[1]));
        int index = 4 * (resTexRC.x * texShape[1] + resTexRC.y);

        vec4 result = vec4(0.);

        for (int i=0; i<4; i++) {
          int flatIndex = index + i;
          ivec3 rc = outCoordsFromFlatIndex(flatIndex);
          result[i] = getChannel(getA(rc.x, rc.y, rc.z), vec2(rc.y, rc.z));
        }

        ${t.output} = result;
      }
    `}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class pu{constructor(e){this.variableNames=["A"],this.outTexUsage=Z.DOWNLOAD;const t=z();this.outputShape=e,this.userCode=`
      ${As}

      void main() {
        float x = getAAtOutCoords();
        ${t.output} = encode_float(x);
      }
    `}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class hu{constructor(e){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!1,this.outTexUsage=Z.DOWNLOAD;const t=z();this.outputShape=e,this.userCode=`
      ${As}

      void main() {
        ivec3 coords = getOutputCoords();
        float x = getChannel(getAAtOutCoords(), vec2(coords.y, coords.z));
        ${t.output} = encode_float(x);
      }
    `}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const fu={R:0,G:1,B:2,A:3};class Nn{constructor(e,t=!1,s="RGBA"){this.variableNames=["A"],this.customUniforms=[{name:"texShape",type:"ivec2"}];const o=z();this.outputShape=e,this.enableShapeUniforms=U(this.outputShape.length);let r="result";t&&(r="floor(result * 255. + 0.5)");let a="";for(let c=0;c<s.length;c++){const i=s[c];a+=`
          if(offset == ${c}) {
            result = values[${fu[i]}];
          }`}this.userCode=`
      ${this.enableShapeUniforms?un():ln(e)}

      void main() {
        ivec3 coords = getOutputCoords();
        int flatIndex = getFlatIndex(coords);
        float result = 0.;
        int offset = imod(flatIndex, ${s.length});

        flatIndex = idiv(flatIndex, ${s.length}, 1.);

        int r = flatIndex / texShape[1];
        if (r < texShape[0]) {
          int c = imod(flatIndex, texShape[1]);
          vec2 uv = (vec2(c, r) + halfCR) / vec2(texShape[1], texShape[0]);
          vec4 values = ${o.texture2D}(A, uv);
          ${a}
        }
        ${o.output} = vec4(${r}, 0., 0., 0.);
      }
    `}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class mu{constructor(e,t=!1){this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0,this.customUniforms=[{name:"texShape",type:"ivec2"}];const s=z();this.outputShape=e,this.enableShapeUniforms=U(this.outputShape.length);let o="",r="result";t&&(r="floor(result * 255. + 0.5)");for(let a=0;a<=1;a++)for(let c=0;c<=1;c++){const i=a*2+c;o+=`
          localCoords = coords;
          if(localCoords[2] + ${c} < ${this.enableShapeUniforms?"outShape[2]":`${e[2]}`}) {
          localCoords[2] += ${c};
          if (localCoords[1] + ${a} < ${this.enableShapeUniforms?"outShape[1]":`${e[1]}`}) {
            localCoords[1] += ${a};

            flatIndex = getFlatIndex(localCoords);
            offset = imod(flatIndex, 4);

            flatIndex = idiv(flatIndex, 4, 1.);

            int r = flatIndex / texShape[1];
            int c = imod(flatIndex, texShape[1]);
            vec2 uv = (vec2(c, r) + halfCR) / vec2(texShape[1], texShape[0]);
            values = ${s.texture2D}(A, uv);

            if (offset == 0) {
              result[${i}] = values[0];
            } else if (offset == 1) {
              result[${i}] = values[1];
            } else if (offset == 2) {
              result[${i}] = values[2];
            } else {
              result[${i}] = values[3];
            }
          }
        }
        `}this.userCode=`
        ${this.enableShapeUniforms?un():ln(e)}

        void main() {
          ivec3 coords = getOutputCoords();

          vec4 result = vec4(0.);
          int flatIndex, r, c, offset;
          ivec3 localCoords;
          vec2 uv;
          vec4 values;

          ${o}

          ${s.output} = ${r};
        }
    `}}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Vs(n){const e=z(),t=`${e.version}
    precision highp float;
    ${e.attribute} vec3 clipSpacePos;
    ${e.attribute} vec2 uv;
    ${e.varyingVs} vec2 resultUV;

    void main() {
      gl_Position = vec4(clipSpacePos, 1);
      resultUV = uv;
    }`;return ps(n,t)}function Us(n){const e=new Float32Array([-1,1,0,0,1,-1,-1,0,0,0,1,1,0,1,1,1,-1,0,1,0]);return xs(n,e)}function Ws(n){const e=new Uint16Array([0,1,2,2,1,3]);return gs(n,e)}function dt(n,e,t,s,o,r){vs(e,t);const a=Cs(n),c=n.TEXTURE_2D;return S(n,()=>n.bindTexture(c,a)),S(n,()=>n.texParameteri(c,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE)),S(n,()=>n.texParameteri(c,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)),S(n,()=>n.texParameteri(c,n.TEXTURE_MIN_FILTER,n.NEAREST)),S(n,()=>n.texParameteri(c,n.TEXTURE_MAG_FILTER,n.NEAREST)),$().getNumber("WEBGL_VERSION")===1?S(n,()=>n.texImage2D(c,0,s,e,t,0,o,r,null)):S(n,()=>n.texStorage2D(c,1,s,e,t)),S(n,()=>n.bindTexture(n.TEXTURE_2D,null)),{texture:a,texShape:[t,e]}}function pn(n){return n.internalFormatFloat}function Ms(n,e,t,s){const[o,r]=ut(e,t);return dt(n,o,r,pn(s),s.textureFormatFloat,n.FLOAT)}function hn(n){return n.internalFormatHalfFloat}function Gs(n,e,t,s){const[o,r]=ut(e,t);return dt(n,o,r,hn(s),s.textureFormatFloat,s.textureTypeHalfFloat)}function fn(n){return n.downloadTextureFormat}function zs(n,e,t,s){const[o,r]=ut(e,t);return dt(n,o,r,fn(s),n.RGBA,n.UNSIGNED_BYTE)}function mn(n){return n.internalFormatPackedFloat}function Hs(n,e,t,s){const[o,r]=Ue(e,t);return dt(n,o,r,mn(s),n.RGBA,n.FLOAT)}function xn(n){return n.internalFormatPackedHalfFloat}function Xs(n,e,t,s){const[o,r]=Ue(e,t);return dt(n,o,r,xn(s),n.RGBA,s.textureTypeHalfFloat)}function Ks(n,e,t){return S(n,()=>n.bindBuffer(n.ARRAY_BUFFER,t)),Xt(n,e,"clipSpacePos",t,3,20,0)&&Xt(n,e,"uv",t,2,20,12)}function js(n,e,t,s,o,r){S(n,()=>n.bindTexture(n.TEXTURE_2D,e));let a,c,i;o instanceof Uint8Array?(a=new Uint8Array(t*s*4),c=n.UNSIGNED_BYTE,i=n.RGBA):(a=new Float32Array(t*s*4),c=n.FLOAT,i=r.internalFormatPackedFloat),a.set(o),$().getNumber("WEBGL_VERSION")===2?S(n,()=>n.texSubImage2D(n.TEXTURE_2D,0,0,0,t,s,n.RGBA,c,a)):S(n,()=>n.texImage2D(n.TEXTURE_2D,0,i,t,s,0,n.RGBA,c,a)),S(n,()=>n.bindTexture(n.TEXTURE_2D,null))}function qs(n,e,t){S(n,()=>n.bindTexture(n.TEXTURE_2D,e)),t.data instanceof Uint8Array?$().getNumber("WEBGL_VERSION")===2?S(n,()=>n.texSubImage2D(n.TEXTURE_2D,0,0,0,t.width,t.height,n.RGBA,n.UNSIGNED_BYTE,t.data)):S(n,()=>n.texImage2D(n.TEXTURE_2D,0,n.RGBA,t.width,t.height,0,n.RGBA,n.UNSIGNED_BYTE,t.data)):$().getNumber("WEBGL_VERSION")===2?S(n,()=>n.texSubImage2D(n.TEXTURE_2D,0,0,0,n.RGBA,n.UNSIGNED_BYTE,t)):S(n,()=>n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,t)),S(n,()=>n.bindTexture(n.TEXTURE_2D,null))}function Ys(n,e,t,s){const o=n.createBuffer();S(n,()=>n.bindBuffer(n.PIXEL_PACK_BUFFER,o));const c=4*4*e*t;return S(n,()=>n.bufferData(n.PIXEL_PACK_BUFFER,c,n.STREAM_READ)),S(n,()=>n.readPixels(0,0,t,e,n.RGBA,n.FLOAT,0)),S(n,()=>n.bindBuffer(n.PIXEL_PACK_BUFFER,null)),o}function Qs(n,e,t){const s=n,o=new Float32Array(t);return s.bindBuffer(s.PIXEL_PACK_BUFFER,e),s.getBufferSubData(s.PIXEL_PACK_BUFFER,0,o),s.bindBuffer(s.PIXEL_PACK_BUFFER,null),o}function Zs(n,e,t,s){const[o,r]=ut(e,t),a=4,c=new Uint8Array(dl(e*t,a));return S(n,()=>n.readPixels(0,0,o,r,s.downloadTextureFormat,n.UNSIGNED_BYTE,c)),new Float32Array(c.buffer)}function Js(n,e,t,s,o,r,a,c){const i=n,l=new Float32Array(pl(r,a));return i.bindBuffer(i.PIXEL_PACK_BUFFER,e),i.getBufferSubData(i.PIXEL_PACK_BUFFER,0,l),i.bindBuffer(i.PIXEL_PACK_BUFFER,null),l}function eo(n,e,t){const s=new Float32Array(e*t*4);return S(n,()=>n.readPixels(0,0,t,e,n.RGBA,n.FLOAT,s)),s}const Sb=Object.freeze(Object.defineProperty({__proto__:null,bindVertexProgramAttributeStreams:Ks,createBufferFromOutputTexture:Ys,createFloat16MatrixTexture:Gs,createFloat16PackedMatrixTexture:Xs,createFloat32MatrixTexture:Ms,createIndexBuffer:Ws,createPackedMatrixTexture:Hs,createUnsignedBytesMatrixTexture:zs,createVertexBuffer:Us,createVertexShader:Vs,downloadByteEncodedFloatMatrixFromOutputTexture:Zs,downloadFloat32MatrixFromBuffer:Qs,downloadMatrixFromPackedOutputTexture:eo,downloadPackedMatrixFromBuffer:Js,getInternalFormatForFloat16MatrixTexture:hn,getInternalFormatForFloat16PackedMatrixTexture:xn,getInternalFormatForFloat32MatrixTexture:pn,getInternalFormatForPackedMatrixTexture:mn,getInternalFormatForUnsignedBytesMatrixTexture:fn,uploadDenseMatrixToTexture:js,uploadPixelDataToTexture:qs},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Ut{constructor(e){this.outputTexture=null,this.program=null,this.disposed=!1,this.itemsToPoll=[];const t=$().getNumber("WEBGL_VERSION");if(e!=null?(this.gl=e,cl(t,e)):this.gl=ae(t),e=this.gl,$().getNumber("WEBGL_VERSION")===2){const r=e;this.createVertexArray=()=>S(r,()=>r.createVertexArray()),this.bindVertexArray=a=>S(r,()=>r.bindVertexArray(a)),this.deleteVertexArray=a=>S(r,()=>r.deleteVertexArray(a)),this.getVertexArray=()=>S(r,()=>r.getParameter(r.VERTEX_ARRAY_BINDING))}else if(e!=null){const r=e.getExtension("OES_vertex_array_object");if(r==null)throw new Error("All WebGL1 implementations are expected to offer OES_vertex_array_object.");this.createVertexArray=()=>S(e,()=>r.createVertexArrayOES()),this.bindVertexArray=a=>S(e,()=>r.bindVertexArrayOES(a)),this.deleteVertexArray=a=>S(e,()=>r.deleteVertexArrayOES(a)),this.getVertexArray=()=>S(e,()=>e.getParameter(r.VERTEX_ARRAY_BINDING_OES))}let s="WEBGL_color_buffer_float";const o="EXT_color_buffer_half_float";if(this.parallelCompilationExtension=this.gl.getExtension("KHR_parallel_shader_compile"),$().getNumber("WEBGL_VERSION")===1){const r="OES_texture_float",a="OES_texture_half_float";if(this.textureFloatExtension=Ye(this.gl,r),J(this.gl,a))this.textureHalfFloatExtension=Ye(this.gl,a);else if($().get("WEBGL_FORCE_F16_TEXTURES"))throw new Error("GL context does not support half float textures, yet the environment flag WEBGL_FORCE_F16_TEXTURES is set to true.");if(this.colorBufferFloatExtension=this.gl.getExtension(s),J(this.gl,o))this.colorBufferHalfFloatExtension=Ye(this.gl,o);else if($().get("WEBGL_FORCE_F16_TEXTURES"))throw new Error("GL context does not support color renderable half floats, yet the environment flag WEBGL_FORCE_F16_TEXTURES is set to true.")}else if(s="EXT_color_buffer_float",J(this.gl,s))this.colorBufferFloatExtension=this.gl.getExtension(s);else if(J(this.gl,o))this.colorBufferHalfFloatExtension=this.gl.getExtension(o);else throw new Error("GL context does not support color renderable floats");this.vertexBuffer=Us(this.gl),this.indexBuffer=Ws(this.gl),this.framebuffer=bs(this.gl),this.textureConfig=an(this.gl,this.textureHalfFloatExtension)}get debug(){return $().getBool("DEBUG")}dispose(){if(this.disposed)return;this.program!=null&&console.warn("Disposing a GPGPUContext that still has a bound WebGLProgram. This is probably a resource leak, delete the program with GPGPUContext.deleteProgram before disposing."),this.outputTexture!=null&&console.warn("Disposing a GPGPUContext that still has a bound output matrix texture.  This is probably a resource leak, delete the output matrix texture with GPGPUContext.deleteMatrixTexture before disposing.");const e=this.gl;S(e,()=>e.finish()),S(e,()=>e.bindFramebuffer(e.FRAMEBUFFER,null)),S(e,()=>e.deleteFramebuffer(this.framebuffer)),S(e,()=>e.bindBuffer(e.ARRAY_BUFFER,null)),S(e,()=>e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,null)),S(e,()=>e.deleteBuffer(this.indexBuffer)),this.disposed=!0}createFloat32MatrixTexture(e,t){return this.throwIfDisposed(),Ms(this.gl,e,t,this.textureConfig)}createFloat16MatrixTexture(e,t){return this.throwIfDisposed(),Gs(this.gl,e,t,this.textureConfig)}createUnsignedBytesMatrixTexture(e,t){return this.throwIfDisposed(),zs(this.gl,e,t,this.textureConfig)}uploadPixelDataToTexture(e,t){this.throwIfDisposed(),qs(this.gl,e,t)}uploadDenseMatrixToTexture(e,t,s,o){this.throwIfDisposed(),js(this.gl,e,t,s,o,this.textureConfig)}createFloat16PackedMatrixTexture(e,t){return this.throwIfDisposed(),Xs(this.gl,e,t,this.textureConfig)}createPackedMatrixTexture(e,t){return this.throwIfDisposed(),Hs(this.gl,e,t,this.textureConfig)}deleteMatrixTexture(e){this.throwIfDisposed(),this.outputTexture===e&&(Kt(this.gl,this.framebuffer),this.outputTexture=null),S(this.gl,()=>this.gl.deleteTexture(e))}downloadByteEncodedFloatMatrixFromOutputTexture(e,t,s){return this.downloadMatrixDriver(e,()=>Zs(this.gl,t,s,this.textureConfig))}downloadPackedMatrixFromBuffer(e,t,s,o,r,a){return Js(this.gl,e,t,s,o,r,a,this.textureConfig)}downloadFloat32MatrixFromBuffer(e,t){return Qs(this.gl,e,t)}createBufferFromTexture(e,t,s){this.bindTextureToFrameBuffer(e);const o=Ys(this.gl,t,s,this.textureConfig);return this.unbindTextureToFrameBuffer(),o}createAndWaitForFence(){const e=this.createFence(this.gl);return this.pollFence(e)}createFence(e){let t,s;if($().getBool("WEBGL_FENCE_API_ENABLED")){const o=e,r=o.fenceSync(o.SYNC_GPU_COMMANDS_COMPLETE,0);e.flush(),s=()=>{const a=o.clientWaitSync(r,0,0);return a===o.ALREADY_SIGNALED||a===o.CONDITION_SATISFIED},t=r}else $().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")>0?(t=this.beginQuery(),this.endQuery(),s=()=>this.isQueryAvailable(t,$().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION"))):s=()=>!0;return{query:t,isFencePassed:s}}downloadMatrixFromPackedTexture(e,t,s){return this.downloadMatrixDriver(e,()=>eo(this.gl,t,s))}createProgram(e){this.throwIfDisposed();const t=this.gl;this.vertexShader==null&&(this.vertexShader=Vs(t));const s=fs(t);S(t,()=>t.attachShader(s,this.vertexShader)),S(t,()=>t.attachShader(s,e)),ms(t,s);const o=Object.assign(s,{vao:this.createVertexArray()});return this.debug&&$t(t,o),o}buildVao(e){this.setProgram(e),this.bindVertexArray(e.vao);const t=this.gl;S(t,()=>t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.indexBuffer)),Ks(t,e,this.vertexBuffer)}deleteProgram(e){this.throwIfDisposed(),e===this.program&&(this.program=null),e!=null&&(S(this.gl,()=>this.gl.deleteProgram(e)),this.deleteVertexArray(e.vao))}setProgram(e){this.throwIfDisposed(),this.program=e,this.program!=null&&this.debug&&$t(this.gl,this.program),S(this.gl,()=>this.gl.useProgram(e))}getUniformLocation(e,t,s=!0){return this.throwIfDisposed(),s?ws(this.gl,e,t):Rs(this.gl,e,t)}getAttributeLocation(e,t){return this.throwIfDisposed(),S(this.gl,()=>this.gl.getAttribLocation(e,t))}getUniformLocationNoThrow(e,t){return this.throwIfDisposed(),this.gl.getUniformLocation(e,t)}setInputMatrixTexture(e,t,s){this.throwIfDisposed(),this.throwIfNoProgram(),Ss(this.gl,e,t,s)}setOutputMatrixTexture(e,t,s){this.setOutputMatrixTextureDriver(e,s,t)}setOutputPackedMatrixTexture(e,t,s){this.throwIfDisposed();const[o,r]=Ue(t,s);this.setOutputMatrixTextureDriver(e,o,r)}setOutputMatrixWriteRegion(e,t,s,o){this.setOutputMatrixWriteRegionDriver(s,e,o,t)}setOutputPackedMatrixWriteRegion(e,t,s,o){throw new Error("setOutputPackedMatrixWriteRegion not implemented.")}debugValidate(){this.program!=null&&$t(this.gl,this.program),Qe(this.gl)}executeProgram(){this.throwIfDisposed(),this.throwIfNoProgram();const e=this.gl;if(this.debug){const t=this.getVertexArray();console.assert(t===this.program.vao,"VAO changed between setProgram and executeProgram!"),this.debugValidate()}S(e,()=>e.drawElements(e.TRIANGLES,6,e.UNSIGNED_SHORT,0))}blockUntilAllProgramsCompleted(){this.throwIfDisposed(),S(this.gl,()=>this.gl.finish())}getQueryTimerExtension(){return this.disjointQueryTimerExtension==null&&(this.disjointQueryTimerExtension=Ye(this.gl,$().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")===2?"EXT_disjoint_timer_query_webgl2":"EXT_disjoint_timer_query")),this.disjointQueryTimerExtension}getQueryTimerExtensionWebGL2(){return this.getQueryTimerExtension()}getQueryTimerExtensionWebGL1(){return this.getQueryTimerExtension()}beginQuery(){if($().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")===2){const s=this.gl,o=this.getQueryTimerExtensionWebGL2(),r=s.createQuery();return s.beginQuery(o.TIME_ELAPSED_EXT,r),r}const e=this.getQueryTimerExtensionWebGL1(),t=e.createQueryEXT();return e.beginQueryEXT(e.TIME_ELAPSED_EXT,t),t}endQuery(){if($().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")===2){const t=this.gl,s=this.getQueryTimerExtensionWebGL2();t.endQuery(s.TIME_ELAPSED_EXT);return}const e=this.getQueryTimerExtensionWebGL1();e.endQueryEXT(e.TIME_ELAPSED_EXT)}async waitForQueryAndGetTime(e){return await Sn(()=>this.disposed||this.isQueryAvailable(e,$().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION"))),this.getQueryTime(e,$().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION"))}getQueryTime(e,t){if(t===0)return null;if(t===2){const s=this.gl;return s.getQueryParameter(e,s.QUERY_RESULT)/1e6}else{const s=this.getQueryTimerExtensionWebGL1();return s.getQueryObjectEXT(e,s.QUERY_RESULT_EXT)/1e6}}isQueryAvailable(e,t){if(t===0)return!0;if(t===2){const s=this.gl,o=this.getQueryTimerExtensionWebGL2(),r=s.getQueryParameter(e,s.QUERY_RESULT_AVAILABLE);return this.disjoint==null&&(this.disjoint=this.gl.getParameter(o.GPU_DISJOINT_EXT)),r&&!this.disjoint}else{const s=this.getQueryTimerExtensionWebGL1(),o=s.getQueryObjectEXT(e,s.QUERY_RESULT_AVAILABLE_EXT);return this.disjoint==null&&(this.disjoint=this.gl.getParameter(s.GPU_DISJOINT_EXT)),o&&!this.disjoint}}pollFence(e){return new Promise(t=>{this.addItemToPoll(()=>e.isFencePassed(),()=>t())})}pollItems(){const e=xu(this.itemsToPoll.map(t=>t.isDoneFn));for(let t=0;t<=e;++t){const{resolveFn:s}=this.itemsToPoll[t];s()}this.itemsToPoll=this.itemsToPoll.slice(e+1)}addItemToPoll(e,t){if(this.itemsToPoll.push({isDoneFn:e,resolveFn:t}),this.itemsToPoll.length>1)return;let s;"setTimeoutCustom"in $().platform&&(s=$().platform.setTimeoutCustom.bind($().platform)),Sn(()=>(this.pollItems(),this.itemsToPoll.length===0),()=>0,null,s)}bindTextureToFrameBuffer(e){this.throwIfDisposed(),wt(this.gl,e,this.framebuffer),this.debug&&Qe(this.gl)}unbindTextureToFrameBuffer(){this.outputTexture!=null?(wt(this.gl,this.outputTexture,this.framebuffer),this.debug&&Qe(this.gl)):Kt(this.gl,this.framebuffer)}downloadMatrixDriver(e,t){this.bindTextureToFrameBuffer(e);const s=t();return this.unbindTextureToFrameBuffer(),s}setOutputMatrixTextureDriver(e,t,s){this.throwIfDisposed();const o=this.gl;wt(o,e,this.framebuffer),this.debug&&Qe(o),this.outputTexture=e,S(o,()=>o.viewport(0,0,t,s)),S(o,()=>o.scissor(0,0,t,s))}setOutputMatrixWriteRegionDriver(e,t,s,o){this.throwIfDisposed(),S(this.gl,()=>this.gl.scissor(e,t,s,o))}throwIfDisposed(){if(this.disposed)throw new Error("Attempted to use disposed GPGPUContext.")}throwIfNoProgram(){if(this.program==null)throw new Error("No GPU program is currently set.")}}function xu(n){let e=0;for(;e<n.length&&n[e]();++e);return e-1}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function gu(n){const e=new Float32Array(n.length);for(let t=0;t<n.length;++t)e[t]=Math.abs(n[t]);return e}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function te(n){return(e,t,s,o,r)=>{const a=q(e,t),c=a.length,i=ee(a),l=T(a),u=ye(r,l),d=e.length,p=t.length,h=ee(e),f=ee(t),g=Gt(e,a),x=Gt(t,a);if(g.length+x.length===0)for(let m=0;m<u.length;++m)u[m]=n(s[m%s.length],o[m%o.length]);else for(let m=0;m<u.length;++m){const C=en(m,c,i),b=C.slice(-d);g.forEach(I=>b[I]=0);const v=zt(b,d,h),w=C.slice(-p);x.forEach(I=>w[I]=0);const N=zt(w,p,f);u[m]=n(s[v],o[N])}return[u,a]}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Cu(n,e,t,s){if(s==="int32"){const o=Int32Array.from(n);return[e,"int32",o]}if(s==="bool"){const o=Uo([0],t),[r,a]=te((c,i)=>c!==i?1:0)(e,[],n,o,"bool");return[a,"bool",r]}throw new Error(`Error in Cast: failed to cast ${t} to ${s}`)}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const vu=te((n,e)=>n+e);/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function bu(n,e,t,s,o){const r=T(s),a=tt(o,t);for(let c=0;c<n.length;c++){const i=n[c];if(i<0)throw new Error("Input x must be non-negative!");i>=o||(r>0?a[i]+=e[c]:a[i]+=1)}return a}function $u(n,e,t,s=!1){const o=n.shape[0],r=n.shape[1],a=X([o,t],e.dtype);for(let c=0;c<o;c++)for(let i=0;i<r;i++){const l=n.get(c,i);if(l<0)throw new Error("Input x must be non-negative!");l>=t||(s?a.set(1,c,l):e.size>0?a.set(a.get(c,l)+e.get(c,i),c,l):a.set(a.get(c,l)+1,c,l))}return a}/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const wu=te((n,e)=>n&e);/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function fe(n){return(e,t,s)=>{const o=V(t,e.length);for(let r=0;r<e.length;++r)o[r]=n(e[r],s);return o}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Ru=fe(n=>Math.ceil(n));/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Su(n,e,t,s){const o=V(t,T(e));if(s&&t!=="string"){let r=0;n.forEach(a=>{const c=T(a.shape);o.set(a.vals,r),r+=c})}else{let r=0;n.forEach(a=>{const c=t==="string"?nt(a.vals):a.vals;let i=0;for(let l=0;l<a.shape[0];++l){const u=l*e[1]+r;for(let d=0;d<a.shape[1];++d)o[u+d]=c[i++]}r+=a.shape[1]})}return o}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const yu=te((n,e)=>n===e?1:0);/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Iu=fe(n=>Math.exp(n));/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Tu=fe(n=>Math.expm1(n));/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Eu=fe(n=>Math.floor(n));/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Nu(n,e,t,s,o,r,a,c,i){const l=X([s,r],t);for(let u=0;u<s;u++){const d=[];let p=0;for(let h=0;h<o;h++){const f=n[u*o+h];p+=f*a[h],d.push(f)}if(p<0||p>=i/r)throw new Error(`Invalid indices: ${d} does not index into ${c}`);for(let h=0;h<r;h++)l.values[u*r+h]=e.get(...e.indexToLoc(p*r+h))}return l}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ku(n,e,t){const s=X(t,n.dtype);for(let o=0;o<s.size;++o){const a=s.indexToLoc(o).slice(),c=a[0],i=a[2],l=e.locToIndex([c,i]);a[2]=e.values[l];const u=n.locToIndex(a);0<=u&&u<n.values.length&&(s.values[o]=n.values[u])}return s}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Ou=te((n,e)=>n>e?1:0);/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Pu=te((n,e)=>n>=e?1:0);/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Du=te((n,e)=>n<e?1:0);/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Au=te((n,e)=>n<=e?1:0);/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Fu(n,e,t){const s=(e-n)/(t-1),o=tt(t,"float32");o[0]=n;for(let r=1;r<o.length;r++)o[r]=o[r-1]+s;return o}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const _u=fe(n=>Math.log(n));/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Lu(n,e,t,s){const o=ye(s,T(t));for(let r=0;r<o.length;++r){const a=r*e;let c=n[a];for(let i=0;i<e;++i){const l=n[a+i];(Number.isNaN(l)||l>c)&&(c=l)}o[r]=c}return o}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Bu=te((n,e)=>Math.max(n,e));/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Vu=te((n,e)=>Math.min(n,e));/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const to=te((n,e)=>n*e);/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Uu(n,e,t){const s=Ve(-1,t);return to([],e,s,n,t)}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Wu=te((n,e)=>n!==e?1:0);/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Mu(n,e,t,s,o){const r=e.length,a=T(e),c=ee(e),i=ee(o),l=ye(t,T(o));for(let u=0;u<a;++u){const d=en(u,r,c),p=new Array(d.length);for(let f=0;f<p.length;f++)p[f]=d[s[f]];const h=zt(p,r,i);l[h]=n[u]}return l}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Gu(n,e,t,s){const[o,r]=pe(n,s),a=Ie(e,"int32"),c=tt(T(o),a),i=T(r);for(let l=0;l<c.length;++l){const u=l*i;let d=1;for(let p=0;p<i;++p)d*=t[u+p];c[l]=d}return{outVals:c,outShape:o,outDtype:a}}/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function zu(n,e,t){n.forEach((s,o)=>{if(s<0||s>=t){const r=en(o,e.length,ee(e)).join(",");throw new Error(`indices[${r}] = ${s} is not in [0, ${t})`)}})}function Hu(n,e){for(let t=0;t<n.length;++t){const s=n[t],o=t===n.length-1?e:n[t+1].length;if(s.length===0)throw new Error("Ragged splits may not be empty");if(s[0]<0)throw new Error("Ragged splits must be non-negative");if(s[s.length-1]>o)throw new Error("Ragged splits must not point past values");for(let r=1;r<s.length;++r)if(s[r-1]>s[r])throw new Error("Ragged splits must be sorted in ascending order")}}function Xu(n,e,t,s){const o=[];let r=0;const a=e.length-1+t.length,c=new Array(a).fill(null).map(()=>[0]);Hu(t,s);let i=1;for(let l=0;l<e.length-1;++l){i*=e[l];const u=e[l+1];for(let d=1;d<i+1;++d)c[l].push(d*u)}for(let l=0;l<n.length;++l){let u=n[l],d=n[l]+1;for(let p=0;p<t.length;++p){const h=t[p],f=p+e.length-1;if(f>=0){const g=c[f],x=g[g.length-1]-h[u];for(let m=u;m<d;++m)c[f].push(h[m+1]+x)}u=h[u],d=h[d]}d!==u&&(o.push([u,d]),r+=d-u)}return{outSplits:c,valueSlices:o,numValues:r}}function Ku(n){const e=[];for(let t=0;t<n.length;++t){const s=n[t].length,o=V("int32",s);e.push(o),n[t].forEach((r,a)=>o[a]=r)}return e}function kn(n,e){const t=n.slice(0,e);for(;t.length<e;)t.push(1);for(let s=e;s<n.length;s++)t[e-1]*=n[s];return t}function ju(n,e,t,s,o,r){const a=kn(e,2)[1],c=kn(r,2)[1];let i=0;for(const l of t)for(let u=l[0];u<l[1];++u){for(let d=0;d<s;++d)o[i*c+d]=n[u*a+d];++i}}function qu(n,e,t,s,o){const r=e.slice();r[0]=o;const a=V(t,T(r)),c=n.length,i=c===0?0:c/e[0];return ju(n,e,s,i,a,r),[a,r]}function Yu(n,e,t,s,o,r,a,c){if(n.length===0)throw new Error("paramsNestedSplits must be non empty");if(e[0].length===0)throw new Error("Split tensors must not be scalars");const i=e[0][0]-1;if(zu(r,a,i),s.length===0)throw new Error("params.rank must be nonzero");const l=s[0],{outSplits:u,valueSlices:d,numValues:p}=Xu(r,a,n,l),h=Ku(u),f=qu(t,s,o,d,p);return[h,f[0],f[1]]}/**
 * @license
 * Copyright 2022 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const On=2147483647;function Qu(n,e,t,s,o,r,a){if(e.length>1)throw new Error("starts must be a scalar or vector");if(o.length>1)throw new Error("limits must be a scalar or vector");if(a.length>1)throw new Error("deltas must be a scalar or vector");const c=e.length===0,i=o.length===0,l=a.length===0,u=[];c||u.push(e[0]),i||u.push(o[0]),l||u.push(a[0]);for(let x=1;x<u.length;++x)if(u[x]!==u[x-1])throw new Error("starts, limits, and deltas must have the same shape");const d=u.length===0?1:u[0],p=V("int32",d+1);p[0]=0;for(let x=0;x<d;++x){const m=c?n[0]:n[x],C=i?s[0]:s[x],b=l?r[0]:r[x];if(b===0)throw new Error("Requires delta != 0");let v;if(b>0&&C<m||b<0&&C>m)v=0;else if(v=Math.ceil(Math.abs((C-m)/b)),v>On)throw new Error(`Requires ((limit - start) / delta) <= ${On}`);p[x+1]=p[x]+v}const h=p[d],f=V(t,h);let g=0;for(let x=0;x<d;++x){const m=p[x+1]-p[x];let C=c?n[0]:n[x];const b=l?r[0]:r[x];for(let v=0;v<m;++v)f[g++]=C,C+=b}return[p,f]}/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */var se=Go;class It{constructor(e,t,s,o,r,a,c,i,l,u){this.shape=e,this.shapeShape=t,this.values=s,this.valuesShape=o,this.valuesDType=r,this.defaultValue=a,this.defaultValueShape=c,this.rowPartitionValues=i,this.rowPartitionValuesShapes=l,this.rowPartitionTypes=Wo(u),this.raggedRank=Mo(this.rowPartitionTypes)}getRowPartitionTypeByDimension(e){return this.rowPartitionTypes[0]===se.FIRST_DIM_SIZE?this.rowPartitionTypes[e+1]:this.rowPartitionTypes[e]}getRowPartitionTensor(e){return this.rowPartitionTypes[0]===se.FIRST_DIM_SIZE?this.rowPartitionValues[e+1]:this.rowPartitionValues[e]}getMaxWidth(e){const t=this.getRowPartitionTensor(e-1);switch(this.getRowPartitionTypeByDimension(e-1)){case se.VALUE_ROWIDS:return It.getMaxWidthValueRowID(t);case se.ROW_SPLITS:return It.getMaxWidthRowSplit(t);default:throw new Error(`Cannot handle partition type ${se[this.getRowPartitionTypeByDimension(e-1)]}`)}}static getMaxWidthRowSplit(e){const t=e.length;if(t===0||t===1)return 0;let s=0;for(let o=0;o<t-1;++o){const r=e[o+1]-e[o];r>s&&(s=r)}return s}static getMaxWidthValueRowID(e){const t=e.length;if(t===0)return 0;let s=0,o=e[0],r=0;for(let a=1;a<t;++a){const c=e[a];c!==o&&(o=c,r=Math.max(a-s,r),s=a)}return Math.max(t-s,r)}tensorShapeFromTensor(e,t,s=!0){if(t.length===0){if(e[0]===-1)return[];throw new Error("The only valid scalar shape tensor is the fully unknown shape specified as -1.")}return Dn(e,s)}calculateOutputSize(e){const t=this.valuesShape,s=this.defaultValueShape;zo(s,t);const o=this.tensorShapeFromTensor(this.shape,this.shapeShape),a=Ho(this.raggedRank,o,t);a[0]<0&&(a[0]=e);for(let c=1;c<=this.raggedRank;++c)a[c]<0&&(a[c]=this.getMaxWidth(c));return a}calculateFirstParentOutputIndex(e,t,s){const o=Math.min(e,s),r=[];let a=0;for(let c=0;c<o;++c,a+=t)r.push(a);for(let c=o;c<e;++c)r.push(-1);return F(r.length===e,()=>"Final length of result must be equal to firstDimension."),r}calculateOutputIndexRowSplit(e,t,s,o){const r=e.length,a=[];for(let c=0;c<r-1;++c){const i=e[c+1]-e[c];let l=Math.min(o,i),u=t[c];u===-1&&(l=0);for(let d=0;d<l;++d)a.push(u),u+=s;for(let d=0;d<i-l;++d)a.push(-1)}if(r>0&&a.length!==e[r-1])throw new Error("Invalid row split size.");return a}calculateOutputIndexValueRowID(e,t,s,o){const r=e.length,a=[];if(r===0)return[];let c=0,i=e[0];if(i>=t.length)throw new Error(`Got currentValueRowId=${i}, which is not less than ${t.length}`);let l=t[i];a.push(l);for(let u=1;u<r;++u){const d=e[u];if(d===i)l>=0&&(++c,c<o?l+=s:l=-1);else{if(c=0,i=d,d>=t.length)throw new Error(`Got nextValueRowId=${d} which is not less than ${t.length}`);l=t[d]}a.push(l)}if(a.length!==e.length)throw new Error("Invalid row ids.");return a}calculateOutputIndex(e,t,s,o){const r=this.getRowPartitionTensor(e),a=this.getRowPartitionTypeByDimension(e);switch(a){case se.VALUE_ROWIDS:return this.calculateOutputIndexValueRowID(r,t,s,o);case se.ROW_SPLITS:if(r.length-1>t.length)throw new Error(`Row partition size is greater than output size: ${r.length-1} > ${t.length}`);return this.calculateOutputIndexRowSplit(r,t,s,o);default:throw new Error(`Unsupported partition type: ${se[a]}`)}}getFirstDimensionSize(){const e=this.rowPartitionValues[0];if(this.rowPartitionTypes.length===0)throw new Error("No row_partition_types given.");const t=this.rowPartitionTypes[0];switch(t){case se.FIRST_DIM_SIZE:return e[0];case se.VALUE_ROWIDS:throw new Error("Cannot handle VALUE_ROWIDS in first dimension.");case se.ROW_SPLITS:return this.rowPartitionValuesShapes[0][0]-1;default:throw new Error(`Cannot handle type ${se[t]}`)}}compute(){if(this.rowPartitionValues[0].length<=0)throw new Error("Invalid first partition input. Tensor requires at least one element.");const t=this.getFirstDimensionSize(),s=this.calculateOutputSize(t),o=new Array(this.raggedRank+1);o[o.length-1]=1;for(let i=o.length-2;i>=0;--i)o[i]=o[i+1]*s[i+1];const r=Dn(s,!1),a=V(this.valuesDType,T(r));if(o[0]*s[0]>0){let i=this.calculateFirstParentOutputIndex(t,o[0],s[0]);for(let l=1;l<=this.raggedRank;++l)i=this.calculateOutputIndex(l-1,i,o[l],s[l]);this.setOutput(this.raggedRank,i,a,r)}return[r,a]}setOutput(e,t,s,o){if(s.length===0)return;const r=this.values,a=s;let c=o.slice();c=c.slice(e+1);const i=T(c),l=t.length;let u=this.defaultValue;if(u.length!==i&&u.length!==1){const f=this.defaultValueShape;ss(()=>{const g=Xo(u,f);u=Ko(g,c).dataSync()})}let d=0,p=0,h=0;for(let f=0;f<=l;++f){let g=f<l?t[f]:-1;if(g===h){++h;continue}if(p<h){const x=r.subarray(d*i),m=a.subarray(p*i),C=(h-p)*i;Pn(m,x,C)}if(f>=l){const x=s.length;g=Math.floor(x/i)}if(g>h)if(this.defaultValue.length===1)a.subarray(h*i,g*i).fill(this.defaultValue[0]),h=g;else for(;g>h;){const x=a.slice(h*i);Pn(x,u,i),++h}g<0?(d=f+1,p=h):(d=f,p=h,h=p+1)}}}function Pn(n,e,t){for(let s=0;s<t;s++)n[s]=e[s]}function Dn(n,e){const t=[];for(let s of n){if(s<0){if(!e)throw new Error(`Dimension ${s} must be >= 0`);if(s<-1)throw new Error(`Dimension ${s} must be >= -1`);s=-1}t.push(s)}return t}function Zu(n,e,t,s,o,r,a,c,i,l){return new It(n,e,t,s,o,r,a,c,i,l).compute()}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ju(n,e,t,s){const o=n===e,r=n<e&&t<0,a=e<n&&t>1;if(o||r||a)return tt(0,s);const c=Math.abs(Math.ceil((e-n)/t)),i=tt(c,s);e<n&&t===1&&(t=-1),i[0]=n;for(let l=1;l<i.length;l++)i[l]=i[l-1]+t;return i}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const ed=fe(n=>1/Math.sqrt(n));/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function td(n,e,t,s,o,r,a,c,i,l){const u=[s/o,o],d=n.values,p=e.values;if(s===0)return X(t,e.dtype);const h=i instanceof Ht?i:X(u,e.dtype);typeof i=="string"||typeof i=="number"?h.values.fill(i):typeof i=="boolean"&&h.values.fill(+i);for(let f=0;f<r;f++){const g=[];let x=0;for(let m=0;m<a;m++){const C=d[f*a+m];g.push(C),x+=C*c[m]}if(x<0||x>=s/o)throw new Error(`Invalid indices: ${g} does not index into ${t}`);for(let m=0;m<o;m++)h.values[x*o+m]=e.rank===0?p[0]:p[f*o+m]}return h}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const nd=fe(n=>1/(1+Math.exp(-n)));/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function sd(n,e,t,s,o){const r=os(s,e,t),a=T(t),c=ee(s);if(r){const d=rs(e,c);return o==="string"?n.slice(d,d+a):n.subarray(d,d+a)}const i=o==="string"?nt(n):n,l=X(s,o,i),u=X(t,o);for(let d=0;d<u.size;++d){const p=u.indexToLoc(d),h=p.map((f,g)=>f+e[g]);u.set(l.get(...h),...p)}return o==="string"?jo(u.values):u.values}/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function od(n,e,t,s,o,r,a){const c=e[0],i=r[0],l=new Array(i),u=new Array(c),d=e[1];if(i===0){if(c!==0)throw new Error(qo(c));const x=V(t,0),m=V(o,0);return[x,[0,d],m,l,u]}let p=!0,h=0;const f=new Array(i).fill(0);for(let x=0;x<c;++x){const m=n[x*d];if(m<0)throw new Error(Yo(x,m));if(m>=i)throw new Error(Qo(x,m,i));++f[m],p=p&&m>=h,h=m}let g=!0;for(let x=0;x<i;++x){const m=f[x]===0;l[x]=m,g=g&&!m,f[x]=Math.max(f[x],1),x>0&&(f[x]+=f[x-1])}if(g&&p){const x=n,m=s;for(let C=0;C<c;++C)u[C]=C;return[x,[c,d],m,l,u]}else{const x=f[i-1],m=V(t,x*d),C=V(o,x),b=new Array(i).fill(0);for(let v=0;v<c;++v){const w=n[v*d],N=b[w],I=(w===0?0:f[w-1])+N;b[w]++;for(let y=0;y<d;++y)m[I*d+y]=n[v*d+y];C[I]=s[v],u[v]=I}for(let v=0;v<i;++v)if(b[v]===0){const N=v===0?0:f[v-1];m[N*d+0]=v;for(let I=1;I<d;++I)m[N*d+I]=0;C[N]=a}return[m,[x,d],C,l,u]}}/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function rd(n,e,t,s,o){const r=T(s),a=e[0],c=o.length,i=[];let l=1,u=-1;for(let x=0;x<c;++x){const m=o[x];if(m===-1){if(u!==-1)throw new Error(Zo(u,x));u=x,i.push(1)}else{if(m<0)throw new Error(Jo(x,m));l*=m,i.push(m)}}if(u!==-1){if(l<=0)throw new Error(er());const x=Math.trunc(r/l);if(l*x!==r)throw new Error(tr(s,i));i[u]=x}if(T(i)!==r)throw new Error(nr(s,i));const p=s.length,h=[];if(p>0){h[p-1]=1;for(let x=p-2;x>=0;--x)h[x]=h[x+1]*s[x+1]}const f=[];if(c>0){f[c-1]=1;for(let x=c-2;x>=0;--x)f[x]=f[x+1]*i[x+1]}const g=V(t,a*c);for(let x=0;x<a;++x){let m=0;for(let C=0;C<p;++C)m+=n[x*p+C]*h[C];for(let C=0;C<c;++C)g[x*c+C]=Math.trunc(m/f[C]),m%=f[C]}return[g,[a,c],i]}/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ad(n,e,t,s,o,r=!1,a=0){const c=s.length,i=[e[0],n.length/e[0]],l=i[1],d=c>0?o[c-1]+1:0;if(d<0)throw new Error(yn());const p=e.slice();p[0]=d;const h=p.reduce((b,v)=>b*v,1),f=V(t,h);if(c===0)return d>0&&f.fill(a),[f,p];if(d<=0)throw new Error(yn());let g=0,x=1,m=0,C=o[g];for(;;){let b=0;if(x<c){if(b=o[x],C===b){++x;continue}if(C>=b)throw new Error(sr())}if(C<0||C>=d)throw new Error(or(C,d));C>m&&f.fill(a,m*l,C*l);for(let v=g;v<x;++v){const w=s[v];if(w<0||w>=i[0])throw new Error(rr(v,s[v],i[0]));for(let N=0;N<l;N++)f[C*l+N]+=n[w*l+N]}if(r)for(let v=0;v<l;v++)f[C*l+v]/=x-g;if(g=x,++x,m=C+1,C=b,x>c)break}return m<d&&f.fill(a,m*l,d*l),[f,p]}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const id=fe(n=>Math.sqrt(n));/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const cd=fe((n,e)=>{const{pattern:t,replaceGlobal:s,rewrite:o}=e;return n.replace(new RegExp(t,s?"g":""),o)});/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ld(n,e,t,s){const o=X(n,e.dtype);for(let r=0;r<o.size;r++){const a=o.indexToLoc(r),c=new Array(a.length);for(let i=0;i<c.length;i++)c[i]=a[i]*t[i]+s[i];o.set(e.get(...c),...a)}return o}/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class ud{constructor(e,t,s,o,r,a){this.separator=bt(e),this.nGramWidths=t,this.leftPad=bt(s),this.rightPad=bt(o),this.padWidth=r,this.preserveShort=a}getPadWidth(e){return Math.min(this.padWidth<0?e-1:this.padWidth,e-1)}getNumNGrams(e,t){const s=this.getPadWidth(t);return Math.max(0,e+2*s-t+1)}createNGrams(e,t,s,o,r,a){for(let c=0;c<r;++c){const i=this.getPadWidth(a),l=Math.max(0,i-c),u=Math.max(0,i-(r-(c+1))),d=a-(l+u),p=t+(l>0?0:c-i);let h=0;h+=l*this.leftPad.length;for(let C=0;C<d;++C)h+=e[p+C].length;h+=u*this.rightPad.length;const f=l+u+d-1;h+=f*this.separator.length,s[o+c]=new Uint8Array(h);const g=s[o+c];let x=0;const m=C=>C.forEach(b=>g[x++]=b);for(let C=0;C<l;++C)m(this.leftPad),m(this.separator);for(let C=0;C<d-1;++C)m(e[p+C]),m(this.separator);if(d>0){m(e[p+d-1]);for(let C=0;C<u;++C)m(this.separator),m(this.rightPad)}else{for(let C=0;C<u-1;++C)m(this.rightPad),m(this.separator);m(this.rightPad)}}}compute(e,t){const s=e.length,o=t.length;if(o>0){let i=t[0];if(i!==0)throw new Error(`First split value must be 0, got ${i}`);for(let l=1;l<o;++l){let u=t[l]>=i;if(u=u&&t[l]<=s,!u)throw new Error(`Invalid split value ${t[l]}, must be in [${i}, ${s}]`);i=t[l]}if(i!==s)throw new Error(`Last split value must be data size. Expected ${s}, got ${i}`)}const r=o-1,a=V("int32",o);if(s===0||o===0){const i=new Array(s);for(let l=0;l<=r;++l)a[l]=0;return[i,a]}a[0]=0;for(let i=1;i<=r;++i){const l=t[i]-t[i-1];let u=0;this.nGramWidths.forEach(d=>{u+=this.getNumNGrams(l,d)}),this.preserveShort&&l>0&&u===0&&(u=1),a[i]=a[i-1]+u}const c=new Array(a[r]);for(let i=0;i<r;++i){const l=t[i];let u=a[i];if(this.nGramWidths.forEach(d=>{const p=t[i+1]-t[i],h=this.getNumNGrams(p,d);this.createNGrams(e,l,c,u,h,d),u+=h}),this.preserveShort&&u===a[i]){const d=t[i+1]-t[i];if(d===0)continue;const p=d+2*this.padWidth;this.createNGrams(e,l,c,u,1,p)}}return[c,a]}}function dd(n,e,t,s,o,r,a,c){return new ud(t,s,o,r,a,c).compute(n,e)}/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function pd(n,e,t,s){if(!n.length)return;if(e.length===0){for(let r=0;r<n.length;++r)s.push(n.subarray(r,r+1));return}if(e.length===1){const r=e[0];let a=n.indexOf(r);for(;a!==-1;){const c=n.subarray(0,a);(!t||c.length!==0)&&s.push(c),n=n.subarray(a+1),a=n.indexOf(r)}(!t||n.length!==0)&&s.push(n);return}let o=0;for(let r=0;r<n.length+1;r++)if(r===n.length||e.indexOf(n[r])!==-1){const a=n.subarray(o,r);(!t||a.length!==0)&&s.push(a),o=r+1}}function hd(n,e,t){const s=n.length,o=[];let r=0,a=0;const c=new Array(s);for(let p=0;p<s;++p){const h=o.length;pd(n[p],e,t,o);const f=o.length-h;c[p]=f,r+=f,a=Math.max(a,f)}const i=V("int32",r*2),l=new Array(r),u=[s,a];let d=0;for(let p=0;p<s;++p)for(let h=0;h<c[p];++h)i[d*2]=p,i[d*2+1]=h,l[d]=o[d],++d;return[i,l,u]}/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function fd(n,e){const t=V("int32",n.length);for(let s=0;s<n.length;++s)t[s]=ar(n[s]).modulo(e).getLowBitsUnsigned();return t}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const md=te((n,e)=>n-e);/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function xd(n,e){const t=new Array(n.rank);for(let o=0;o<t.length;o++)t[o]=n.shape[o]*e[o];const s=X(t,n.dtype);for(let o=0;o<s.values.length;++o){const r=s.indexToLoc(o),a=new Array(n.rank);for(let i=0;i<a.length;i++)a[i]=r[i]%n.shape[i];const c=n.locToIndex(a);s.values[o]=n.values[c]}return s}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Je=(n,e)=>{const t=e.value-n.value;return t===0?n.index-e.index:t};function no(n,e,t=0,s=n.length-1){for(;s>t;){if(s-t>600){const c=s-t+1,i=e-t+1,l=Math.log(c),u=.5*Math.exp(2*l/3),d=.5*Math.sqrt(l*u*(c-u)/c)*Math.sign(i-c/2),p=Math.max(t,Math.floor(e-i*u/c+d)),h=Math.min(s,Math.floor(e+(c-i)*u/c+d));no(n,e,p,h)}const o=n[e];let r=t,a=s;for(qe(n,t,e),Je(n[s],o)>0&&qe(n,t,s);r<a;){for(qe(n,r,a),r++,a--;Je(n[r],o)<0;)r=r+1;for(;Je(n[a],o)>0;)a=a-1}Je(n[t],o)===0?qe(n,t,a):(a=a+1,qe(n,a,s)),a<=e&&(t=a+1),e<=a&&(s=a-1)}}function gd(n,e,t,s,o){const r=e[e.length-1],[a,c]=[n.length/r,r],i=ye(t,a*s),l=ye("int32",a*s);for(let d=0;d<a;d++){const p=d*c,h=n.subarray(p,p+c);let f=new Array(h.length);h.forEach((C,b)=>f[b]={value:C,index:b}),s<f.length&&(no(f,s),f=f.slice(0,s)),o&&f.sort(Je);const g=d*s,x=i.subarray(g,g+s),m=l.subarray(g,g+s);for(let C=0;C<s;C++)x[C]=f[C].value,m[C]=f[C].index}const u=e.slice();return u[u.length-1]=s,[X(u,t,i),X(u,"int32",l)]}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Cd(n,e,t,s){const o=K(e,t)[0],r=[1,t[0],1];for(let f=0;f<o;f++)r[0]*=t[f];r[1]=t[o];for(let f=o+1;f<t.length;f++)r[2]*=t[f];const a=new Map,c=new Int32Array(t[o]),i=new Ht(r,s,n),l=[],u=r[0]===1&&r[2]===1;for(let f=0;f<t[o];f++){let g;if(u)g=n[f].toString();else{const m=[];for(let C=0;C<r[0];C++)for(let b=0;b<r[2];b++)m.push(i.get(C,f,b));g=m.join(",")}const x=a.get(g);if(x!=null)c[f]=x;else{const m=a.size;a.set(g,m),c[f]=m,l.push(f)}}const d=r.slice();d[1]=a.size;const p=new Ht(d,s);l.forEach((f,g)=>{for(let x=0;x<r[0];x++)for(let m=0;m<r[2];m++)p.set(i.get(x,f,m),x,g,m)});const h=t.slice();return h[o]=d[1],{outputValues:p.values,outputShape:h,indices:c}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const vd=Object.freeze(Object.defineProperty({__proto__:null,addImpl:vu,bincountImpl:bu,bincountReduceImpl:$u,bitwiseAndImpl:wu,castImpl:Cu,ceilImpl:Ru,concatImpl:Su,equalImpl:yu,expImpl:Iu,expm1Impl:Tu,floorImpl:Eu,gatherNdImpl:Nu,gatherV2Impl:ku,greaterEqualImpl:Pu,greaterImpl:Ou,lessEqualImpl:Au,lessImpl:Du,linSpaceImpl:Fu,logImpl:_u,maxImpl:Lu,maximumImpl:Bu,minimumImpl:Vu,multiplyImpl:to,negImpl:Uu,notEqualImpl:Wu,prodImpl:Gu,raggedGatherImpl:Yu,raggedRangeImpl:Qu,raggedTensorToTensorImpl:Zu,rangeImpl:Ju,rsqrtImpl:ed,scatterImpl:td,sigmoidImpl:nd,simpleAbsImpl:gu,sliceImpl:sd,sparseFillEmptyRowsImpl:od,sparseReshapeImpl:rd,sparseSegmentReductionImpl:ad,sqrtImpl:id,staticRegexReplaceImpl:cd,stridedSliceImpl:ld,stringNGramsImpl:dd,stringSplitImpl:hd,stringToHashBucketFastImpl:fd,subImpl:md,tileImpl:xd,topKImpl:gd,transposeImpl:Mu,uniqueImpl:Cd},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const{addImpl:bd,bincountImpl:so,bincountReduceImpl:$d,bitwiseAndImpl:wd,castImpl:Rd,ceilImpl:Sd,concatImpl:yd,equalImpl:Id,expImpl:Td,expm1Impl:Ed,floorImpl:Nd,gatherNdImpl:kd,gatherV2Impl:Od,greaterImpl:Pd,greaterEqualImpl:Dd,lessImpl:Ad,lessEqualImpl:Fd,linSpaceImpl:_d,logImpl:Ld,maxImpl:Bd,maximumImpl:Vd,minimumImpl:Ud,multiplyImpl:Wd,negImpl:Md,notEqualImpl:Gd,prodImpl:zd,raggedGatherImpl:Hd,raggedRangeImpl:Xd,raggedTensorToTensorImpl:Kd,rangeImpl:jd,rsqrtImpl:qd,scatterImpl:Yd,sigmoidImpl:Qd,simpleAbsImpl:oo,sliceImpl:Zd,sparseFillEmptyRowsImpl:Jd,sparseReshapeImpl:ep,sparseSegmentReductionImpl:ro,sqrtImpl:tp,staticRegexReplaceImpl:np,stridedSliceImpl:sp,stringNGramsImpl:op,stringSplitImpl:rp,stringToHashBucketFastImpl:ap,subImpl:ip,tileImpl:cp,topKImpl:lp,transposeImpl:gn,uniqueImpl:up}=vd;/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ao(n,e){return["x","y","z","w","u","v"].slice(0,e).map(t=>`${n}.${t}`)}function M(n,e){return e===1?[n]:ao(n,e)}function dp(n,e){if(n===1)return"rc";let t="";for(let s=0;s<n;s++)t+=e[s],s<n-1&&(t+=",");return t}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class pp{constructor(e){if(this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0,this.outputShape=e,this.rank=e.length,this.enableShapeUniforms=U(this.outputShape.length),this.rank===0)this.userCode=`
        void main() {
          setOutput(vec4(getA(), 0., 0., 0.));
        }
      `;else{const t=M("rc",this.rank),s=D(this.rank),o=this.getOutOfBoundsCondition(t),r=this.getSetup(t),a=this.getOutput(t);this.userCode=`
        void main() {
          ${s} rc = getOutputCoords();

          if(${o}) {
            setOutput(vec4(0));
          } else {
            ${r}

            setOutput(vec4(${a}));
          }
        }
      `}}getSourceCoordsArr(e){const t=[];for(let s=0;s<=1;s++)for(let o=0;o<=1;o++){let r=`${s===0?"r":"rp1"}, ${o===0?"c":"cp1"}`;for(let a=2;a<this.rank;a++)r=`${e[e.length-1-a]},`+r;t.push(r)}return t}getOutOfBoundsCondition(e){if(this.rank===1)return`rc > ${this.enableShapeUniforms?"outShape":this.outputShape[0]}`;let t="";for(let s=this.rank-2;s<this.rank;s++)t+=`${e[s]} >= ${this.enableShapeUniforms?`outShape[${s}]`:this.outputShape[s]}`,s<this.rank-1&&(t+="||");return t}getSetup(e){if(this.rank===1)return"";const t=e.slice(-2),s=this.enableShapeUniforms?`outShape[${this.rank} - 1]`:this.outputShape[this.rank-1],o=this.enableShapeUniforms?`outShape[${this.rank} - 2]`:this.outputShape[this.rank-2];return`
      int r = ${t[0]};
      int c = ${t[1]};
      int rp1 = r + 1;
      int cp1 = c + 1;

      bool cEdge = cp1 >= ${s};
      bool rEdge = rp1 >= ${o};
    `}getOutput(e){const t=this.getSourceCoordsArr(e);return this.rank===1?`getA(rc), (rc + 1 >= ${this.enableShapeUniforms?"outShape":this.outputShape[0]} ? 0. : getA(rc + 1)), 0, 0`:`getA(${t[0]}),
            cEdge ? 0. : getA(${t[1]}),
            rEdge ? 0. : getA(${t[2]}),
            rEdge || cEdge ? 0. : getA(${t[3]})`}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class io{constructor(e,t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"inputShape",type:"ivec3"}],this.outputShape=e,this.enableShapeUniforms=U(this.outputShape.length);let s="";for(let o=0;o<4;o++){let r="thisRC = rc;";o%2===1&&(r+="thisRC.z += 1;"),o>1&&(r+="thisRC.y += 1;"),s+=`
        ${r}
        ${o>0?"if(thisRC.y < rows && thisRC.z < cols){":""}
          int flatIndex = getFlatIndex(thisRC);

          ivec3 inputRC = inputCoordsFromReshapedOutCoords(flatIndex);
          vec2 inputRCInnerDims = vec2(float(inputRC.y),float(inputRC.z));

          result[${o}] =
            getChannel(getA(inputRC.x, inputRC.y, inputRC.z), inputRCInnerDims);
        ${o>0?"}":""}
      `}this.userCode=`
      ${hp(t,this.enableShapeUniforms)}
      ${this.enableShapeUniforms?un():ln(e)}

      void main() {
        ivec3 rc = getOutputCoords();

        vec4 result = vec4(0.);

        ivec3 thisRC;
        int rows = ${this.enableShapeUniforms?"outShape[1]":e[1]};
        int cols = ${this.enableShapeUniforms?"outShape[2]":e[2]};

        ${s}

        setOutput(result);
      }
    `}}function hp(n,e){return`
    ivec3 inputCoordsFromReshapedOutCoords(int index) {
      ${e?Sl(["r","c","d"],"inputShape"):Oe(["r","c","d"],n)}
      return ivec3(r, c, d);
    }
  `}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class fp{constructor(e){this.gpgpu=e,this.numUsedTextures=0,this.numFreeTextures=0,this._numBytesAllocated=0,this._numBytesFree=0,this.freeTextures={},this.usedTextures={},this.logEnabled=!1}acquireTexture(e,t,s){const o=Fn(t,s),r=_n(e,o,s);r in this.freeTextures||(this.freeTextures[r]=[]),r in this.usedTextures||(this.usedTextures[r]=[]);const a=An(e,o,this.gpgpu.gl,this.gpgpu.textureConfig,s);if(this.freeTextures[r].length>0){this.numFreeTextures--,this.numUsedTextures++,this._numBytesFree-=a,this.log();const i=this.freeTextures[r].pop();return this.usedTextures[r].push(i),i}let c;return o===L.PACKED_2X2_FLOAT32?c=this.gpgpu.createPackedMatrixTexture(e[0],e[1]):o===L.PACKED_2X2_FLOAT16?c=this.gpgpu.createFloat16PackedMatrixTexture(e[0],e[1]):o===L.UNPACKED_FLOAT32?c=this.gpgpu.createFloat32MatrixTexture(e[0],e[1]):o===L.UNPACKED_FLOAT16?c=this.gpgpu.createFloat16MatrixTexture(e[0],e[1]):o===L.PACKED_4X1_UNSIGNED_BYTE&&(c=this.gpgpu.createUnsignedBytesMatrixTexture(e[0],e[1])),this.usedTextures[r].push(c),this.numUsedTextures++,this._numBytesAllocated+=a,this.log(),c}releaseTexture(e,t,s,o){if(this.freeTextures==null)return;const r=Fn(s,o),a=_n(t,r,o);a in this.freeTextures||(this.freeTextures[a]=[]);const c=An(t,r,this.gpgpu.gl,this.gpgpu.textureConfig,o),i=$().getNumber("WEBGL_DELETE_TEXTURE_THRESHOLD");i!==-1&&this._numBytesAllocated>i?(this.gpgpu.deleteMatrixTexture(e.texture),this._numBytesAllocated-=c):(this.freeTextures[a].push(e),this.numFreeTextures++,this._numBytesFree+=c),this.numUsedTextures--;const l=this.usedTextures[a],u=l&&l.indexOf(e);if(u==null||u<0)throw new Error("Cannot release a texture that was never provided by this texture manager");l[u]=l[l.length-1],l.pop(),this.log()}log(){if(!this.logEnabled)return;const e=this.numFreeTextures+this.numUsedTextures;console.log("Free/Used",`${this.numFreeTextures} / ${this.numUsedTextures}`,`(${e})`);const t=this._numBytesFree/this._numBytesAllocated;console.log(`Bytes allocated: ${this._numBytesAllocated}`),console.log(`Bytes unused: ${this._numBytesFree} (${Math.round(100*t)}%)`)}get numBytesAllocated(){return this._numBytesAllocated}get numBytesFree(){return this._numBytesFree}getNumUsedTextures(){return this.numUsedTextures}getNumFreeTextures(){return this.numFreeTextures}dispose(){if(this.freeTextures!=null){for(const e in this.freeTextures)this.freeTextures[e].forEach(t=>{this.gpgpu.deleteMatrixTexture(t.texture)});for(const e in this.usedTextures)this.usedTextures[e].forEach(t=>{this.gpgpu.deleteMatrixTexture(t.texture)});this.freeTextures=null,this.usedTextures=null,this.numUsedTextures=0,this.numFreeTextures=0,this._numBytesAllocated=0,this._numBytesFree=0}}}function mp(n,e){const t=n;if(e===t.R32F)return 4;if(e===t.R16F)return 2;if(e===t.RGBA32F)return 16;if(e===n.RGBA)return 16;if(e===t.RGBA16F)return 8;if(e===t.RGBA8)return 4;throw new Error(`Unknown internal format ${e}`)}function An(n,e,t,s,o){const r=xp(e,s);let a;if(o){const[i,l]=Ue(n[0],n[1]);a=i*l}else{const[i,l]=ut(n[0],n[1]);a=i*l}const c=mp(t,r);return a*c}function xp(n,e){switch(n){case L.PACKED_2X2_FLOAT32:return mn(e);case L.PACKED_2X2_FLOAT16:return xn(e);case L.UNPACKED_FLOAT32:return pn(e);case L.UNPACKED_FLOAT16:return hn(e);case L.PACKED_4X1_UNSIGNED_BYTE:return fn(e);default:throw new Error(`Unknown physical texture type ${n}`)}}function gp(n){return $().getBool("WEBGL_RENDER_FLOAT32_ENABLED")?n?L.PACKED_2X2_FLOAT32:L.UNPACKED_FLOAT32:n?L.PACKED_2X2_FLOAT16:L.UNPACKED_FLOAT16}function Fn(n,e){if(n===Z.UPLOAD)return L.PACKED_2X2_FLOAT32;if(n===Z.RENDER||n==null)return gp(e);if(n===Z.DOWNLOAD||n===Z.PIXELS)return L.PACKED_4X1_UNSIGNED_BYTE;throw new Error(`Unknown logical texture type ${n}`)}function _n(n,e,t){return`${n[0]}_${n[1]}_${e}_${t}`}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class ue{constructor(e,t){this.variableNames=["A"],this.outputShape=e,this.enableShapeUniforms=U(this.outputShape.length),this.userCode=`
      float unaryOperation(float x) {
        ${t}
      }

      void main() {
        float x = getAAtOutCoords();
        float y = unaryOperation(x);

        setOutput(y);
      }
    `}}const oe="if (isnan(x)) return x;",Cp="return x;",Ln="return abs(x);",vp="return (x >= 0.0) ? x : (exp(x) - 1.0);",bp=oe+`
  return (x < 0.0) ? 0.0 : x;
`,$p=oe+`
  return (x < 0.0) ? 0.0 : min(6.0, x);
`,ge="return x;",wp="return 1.0 / (1.0 + exp(-1.0 * x));";/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Rp="return x;",Sp=`
  vec4 result;

  result.r = (x.r >= 0.0) ? x.r : (exp(x.r) - 1.0);
  result.g = (x.g >= 0.0) ? x.g : (exp(x.g) - 1.0);
  result.b = (x.b >= 0.0) ? x.b : (exp(x.b) - 1.0);
  result.a = (x.a >= 0.0) ? x.a : (exp(x.a) - 1.0);

  return result;
`,yp=`
  vec4 result = x * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,Ip=`
  vec4 result = min(x, vec4(6.)) * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,Tp="return 1.0 / (1.0 + exp(-1.0 * x));";class Ce{constructor(e,t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.enableShapeUniforms=U(this.outputShape.length),this.userCode=`
      vec4 unaryOperation(vec4 x) {
        ${t}
      }

      void main() {
        vec4 x = getAAtOutCoords();
        vec4 y = unaryOperation(x);

        setOutput(y);
      }
    `}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Ep{constructor(e){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!1,this.outputShape=e,this.enableShapeUniforms=U(this.outputShape.length);const t=e.length,s=M("rc",t),o=D(t),r=dp(t,s),a=s.slice(-2),c=t<=1?"rc":`vec2(${a.join(",")})`;this.userCode=`
      void main() {
        ${o} rc = getOutputCoords();
        vec4 packedInput = getA(${r});

        setOutput(getChannel(packedInput, ${c}));
      }
    `}}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Np=fr,kp=1e-7,Op=1e-4,Ct={};function Pp(n){return n in Ct||(Ct[n]={}),Ct[n]}const Dp=$().getNumber("CPU_HANDOFF_SIZE_THRESHOLD"),Ap=600;function Fp(){return $().global.screen==null?1024:$().global.screen.height*$().global.screen.width*window.devicePixelRatio*Ap/1024/1024}class At extends ir{nextDataId(){return At.nextDataId++}constructor(e){if(super(),this.pendingRead=new WeakMap,this.pendingDisposal=new WeakSet,this.dataRefCount=new WeakMap,this.numBytesInGPU=0,this.uploadWaitMs=0,this.downloadWaitMs=0,this.lastGlFlushTime=0,this.warnedAboutMemory=!1,this.pendingDeletes=0,this.disposed=!1,!$().getBool("HAS_WEBGL"))throw new Error("WebGL is not supported on this device");let t;if(e!=null){if(e instanceof Ut)t=e;else{const s=ae($().getNumber("WEBGL_VERSION"),e);t=new Ut(s)}this.binaryCache={},this.gpgpuCreatedLocally=!1}else{const s=ae($().getNumber("WEBGL_VERSION"));t=new Ut(s),this.binaryCache=Pp($().getNumber("WEBGL_VERSION")),this.gpgpuCreatedLocally=!0}this.gpgpu=t,this.canvas=this.gpgpu.gl.canvas,this.textureManager=new fp(this.gpgpu),this.numMBBeforeWarning=Fp(),this.texData=new cr(this,xe())}numDataIds(){return this.texData.numDataIds()-this.pendingDeletes}writeTexture(e,t,s,o,r,a){const c=this.makeTensorInfo(t,s),i=this.texData.get(c.dataId);i.isPacked=!1,i.texture={texture:e,texShape:[o,r]},i.texShape=[o,r];const l=Ze(t),u=new Nn(l,!1,a),d=this.runWebGLProgram(u,[c],s,[[o,r]]);return d.shape=t,i.texture=null,this.disposeIntermediateTensorInfo(c),d.dataId}write(e,t,s){if(($().getBool("WEBGL_CHECK_NUMERICAL_PROBLEMS")||$().getBool("DEBUG"))&&this.checkNumericalProblems(e),s==="complex64"&&e!=null)throw new Error("Cannot write to a complex64 dtype. Please use tf.complex(real, imag).");const o={id:this.nextDataId()};return this.texData.set(o,{shape:t,dtype:s,values:e,usage:Z.UPLOAD,refCount:1}),o}refCount(e){return this.texData.has(e)?this.texData.get(e).refCount:0}incRef(e){const t=this.texData.get(e);t.refCount++}decRef(e){if(this.texData.has(e)){const t=this.texData.get(e);t.refCount--}}move(e,t,s,o,r){if($().getBool("DEBUG")&&this.checkNumericalProblems(t),o==="complex64")throw new Error("Cannot write to a complex64 dtype. Please use tf.complex(real, imag).");this.texData.set(e,{shape:s,dtype:o,values:t,usage:Z.UPLOAD,refCount:r})}disposeIntermediateTensorInfo(e){this.disposeData(e.dataId)}readSync(e){const t=this.texData.get(e),{values:s,dtype:o,complexTensorInfos:r,slice:a,shape:c,isPacked:i}=t;if(a!=null){let p;i?p=new Ce(c,ge):p=new ue(c,ge);const h=this.runWebGLProgram(p,[{dataId:e,shape:c,dtype:o}],o),f=this.readSync(h.dataId);return this.disposeIntermediateTensorInfo(h),f}if(s!=null)return this.convertAndCacheOnCPU(e);if(o==="string")return s;const l=this.activeTimers!=null;let u;l&&(u=we());let d;if(o==="complex64"){const p=this.readSync(r.real.dataId),h=this.readSync(r.imag.dataId);d=In(p,h)}else d=this.getValuesFromTexture(e);return l&&(this.downloadWaitMs+=we()-u),this.convertAndCacheOnCPU(e,d)}async read(e){if(this.pendingRead.has(e)){const f=this.pendingRead.get(e);return new Promise(g=>f.push(g))}const t=this.texData.get(e),{values:s,shape:o,slice:r,dtype:a,complexTensorInfos:c,isPacked:i}=t;if(r!=null){let f;i?f=new Ce(o,ge):f=new ue(o,ge);const g=this.runWebGLProgram(f,[{dataId:e,shape:o,dtype:a}],a),x=this.read(g.dataId);return this.disposeIntermediateTensorInfo(g),x}if(s!=null)return this.convertAndCacheOnCPU(e);if($().getBool("DEBUG")&&!$().getBool("WEBGL_DOWNLOAD_FLOAT_ENABLED")&&$().getNumber("WEBGL_VERSION")===2)throw new Error("tensor.data() with WEBGL_DOWNLOAD_FLOAT_ENABLED=false and WEBGL_VERSION=2 not yet supported.");let l=null,u;if(a!=="complex64"&&$().get("WEBGL_BUFFER_SUPPORTED")){u=this.decode(e);const f=this.texData.get(u.dataId);l=this.gpgpu.createBufferFromTexture(f.texture.texture,...xt(o))}this.pendingRead.set(e,[]),a!=="complex64"&&await this.gpgpu.createAndWaitForFence();let d;if(a==="complex64"){const f=await Promise.all([this.read(c.real.dataId),this.read(c.imag.dataId)]),g=f[0],x=f[1];d=In(g,x)}else if(l==null)d=this.getValuesFromTexture(e);else{const f=T(o);d=this.gpgpu.downloadFloat32MatrixFromBuffer(l,f)}if(u!=null&&this.disposeIntermediateTensorInfo(u),l!=null){const f=this.gpgpu.gl;S(f,()=>f.deleteBuffer(l))}const p=this.convertAndCacheOnCPU(e,d),h=this.pendingRead.get(e);return this.pendingRead.delete(e),h.forEach(f=>f(p)),this.pendingDisposal.has(e)&&(this.pendingDisposal.delete(e),this.disposeData(e)&&xe().removeDataId(e,this),this.pendingDeletes--),p}readToGPU(e,t={}){const s=this.texData.get(e),{values:o,shape:r,slice:a,dtype:c,isPacked:i,texture:l}=s;if(c==="complex64")throw new Error("Does not support reading texture for complex64 dtype.");if(a!=null){let h;i?h=new Ce(r,ge):h=new ue(r,ge);const f=this.runWebGLProgram(h,[{dataId:e,shape:r,dtype:c}],c),g=this.readToGPU(f,t);return this.disposeIntermediateTensorInfo(f),g}if(l==null)throw o!=null?new Error("Data is not on GPU but on CPU."):new Error("There is no data on GPU or CPU.");const u=this.decode(e,t.customTexShape),d=xe().makeTensorFromTensorInfo(u),p=this.texData.get(u.dataId);return Object.assign({tensorRef:d},p.texture)}bufferSync(e){const t=this.readSync(e.dataId);if(e.dtype==="string")try{const s=t.map(o=>tn(o));return X(e.shape,e.dtype,s)}catch{throw new Error("Failed to decode encoded string bytes into utf-8")}return X(e.shape,e.dtype,t)}checkNumericalProblems(e){if(e!=null)for(let t=0;t<e.length;t++){const s=e[t];if(!us(s))throw $().getBool("WEBGL_RENDER_FLOAT32_CAPABLE")?Error(`The value ${s} cannot be represented with your current settings. Consider enabling float32 rendering: 'tf.env().set('WEBGL_RENDER_FLOAT32_ENABLED', true);'`):Error(`The value ${s} cannot be represented on this device.`)}}getValuesFromTexture(e){const{shape:t,dtype:s,isPacked:o}=this.texData.get(e),r=T(t);if($().getBool("WEBGL_DOWNLOAD_FLOAT_ENABLED")){const p=this.decode(e),h=this.texData.get(p.dataId),f=this.gpgpu.downloadMatrixFromPackedTexture(h.texture.texture,...xt(t)).subarray(0,r);return this.disposeIntermediateTensorInfo(p),f}const a=$().getBool("WEBGL_PACK")&&o===!0,c=a?Ze(t):t,i=a?new hu(c):new pu(c),l=this.runWebGLProgram(i,[{shape:c,dtype:s,dataId:e}],"float32"),u=this.texData.get(l.dataId),d=this.gpgpu.downloadByteEncodedFloatMatrixFromOutputTexture(u.texture.texture,u.texShape[0],u.texShape[1]).subarray(0,r);return this.disposeIntermediateTensorInfo(l),d}timerAvailable(){return $().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0}time(e){const t=this.activeTimers,s=[];let o=!1;this.programTimersStack==null?(this.programTimersStack=s,o=!0):this.activeTimers.push(s),this.activeTimers=s,e();const r=Tn(this.activeTimers.map(i=>i.query)).filter(i=>i!=null),a=Tn(this.activeTimers.map(i=>i.name)).filter(i=>i!=null);this.activeTimers=t,o&&(this.programTimersStack=null);const c={uploadWaitMs:this.uploadWaitMs,downloadWaitMs:this.downloadWaitMs,kernelMs:null,wallMs:null};return(async()=>{if($().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0){const i=await Promise.all(r);c.kernelMs=lr(i),c.getExtraProfileInfo=()=>i.map((l,u)=>({name:a[u],ms:l})).map(l=>`${l.name}: ${l.ms}`).join(", ")}else c.kernelMs={error:"WebGL query timers are not supported in this environment."};return this.uploadWaitMs=0,this.downloadWaitMs=0,c})()}memory(){return{unreliable:!1,numBytesInGPU:this.numBytesInGPU,numBytesInGPUAllocated:this.textureManager.numBytesAllocated,numBytesInGPUFree:this.textureManager.numBytesFree}}startTimer(){return $().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0?this.gpgpu.beginQuery():{startMs:we(),endMs:null}}endTimer(e){return $().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0?(this.gpgpu.endQuery(),e):(e.endMs=we(),e)}async getQueryTime(e){if($().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0)return this.gpgpu.waitForQueryAndGetTime(e);const t=e;return t.endMs-t.startMs}disposeData(e,t=!1){if(this.pendingDisposal.has(e))return!1;if(!this.texData.has(e))return!0;if(t?this.texData.get(e).refCount=0:this.texData.get(e).refCount--,!t&&this.texData.get(e).refCount>0)return!1;if(this.pendingRead.has(e))return this.pendingDisposal.add(e),this.pendingDeletes++,!1;this.releaseGPUData(e);const{complexTensorInfos:s}=this.texData.get(e);return s!=null&&(this.disposeData(s.real.dataId,t),this.disposeData(s.imag.dataId,t)),this.texData.delete(e),!0}releaseGPUData(e){const{texture:t,dtype:s,texShape:o,usage:r,isPacked:a,slice:c}=this.texData.get(e),i=c&&c.origDataId||e,l=this.dataRefCount.get(i);l>1?this.dataRefCount.set(i,l-1):(this.dataRefCount.delete(i),t!=null&&(this.numBytesInGPU-=this.computeBytes(o,s),this.textureManager.releaseTexture(t,o,r,a)));const u=this.texData.get(e);u.texture=null,u.texShape=null,u.isPacked=!1,u.slice=null}getTexture(e){return this.uploadToGPU(e),this.texData.get(e).texture.texture}getDataInfo(e){return this.texData.get(e)}shouldExecuteOnCPU(e,t=Dp){return $().getBool("WEBGL_CPU_FORWARD")&&e.every(s=>this.texData.get(s.dataId).texture==null&&T(s.shape)<t)}getGPGPUContext(){return this.gpgpu}where(e){kt("tf.where() in webgl locks the UI thread. Call tf.whereAsync() instead");const t=e.dataSync();return Np(e.shape,t)}packedUnaryOp(e,t,s){const o=new Ce(e.shape,t),r=this.compileAndRun(o,[e],s);return xe().makeTensorFromTensorInfo(r)}abs(e){if(this.shouldExecuteOnCPU([e])&&e.dtype!=="complex64"){const o=oo(this.texData.get(e.dataId).values);return this.makeOutput(e.shape,e.dtype,o)}if($().getBool("WEBGL_PACK_UNARY_OPERATIONS"))return this.packedUnaryOp(e,Ln,e.dtype);const t=new ue(e.shape,Ln),s=this.compileAndRun(t,[e]);return xe().makeTensorFromTensorInfo(s)}makeTensorInfo(e,t,s){let o;if(t==="string"&&s!=null&&s.length>0&&ur(s[0])){const r=s.map(a=>bt(a));o=this.write(r,e,t)}else o=this.write(s,e,t);return this.texData.get(o).usage=null,{dataId:o,shape:e,dtype:t}}makeOutput(e,t,s){return xe().makeTensorFromTensorInfo(this.makeTensorInfo(e,t,s),this)}unpackTensor(e){const t=new Ep(e.shape);return this.runWebGLProgram(t,[e],e.dtype)}packTensor(e){const t=new pp(e.shape);return this.runWebGLProgram(t,[e],e.dtype,null,!0)}packedReshape(e,t){const s=[Te(e.shape),...Ee(e.shape)],o={dtype:e.dtype,shape:s,dataId:e.dataId},r=[Te(t),...Ee(t)],a=new io(r,s),c=!0,i=[s],l=this.runWebGLProgram(a,[o],e.dtype,i,c);return{dataId:l.dataId,shape:t,dtype:l.dtype}}decode(e,t){const s=this.texData.get(e),{isPacked:o,shape:r,dtype:a}=s;if(t!=null){const p=T(r),h=t[0]*t[1]*4;F(p<=h,()=>"customTexShape is too small. Row * Column * 4 should be equal or larger than the size of the tensor data.")}const c=Ze(r);let i;o?i=new du(c):i=new uu(c);const l=!0,u=[t??xt(c)],d=this.runWebGLProgram(i,[{shape:c,dtype:a,dataId:e}],a,u,l,t);return{dtype:a,shape:r,dataId:d.dataId}}runWebGLProgram(e,t,s,o,r=!1,a){const c=this.makeTensorInfo(e.outputShape,s),i=this.texData.get(c.dataId);if(e.packedOutput&&(i.isPacked=!0),e.outPackingScheme===st.DENSE){const m=a??xt(e.outputShape);i.texShape=m.map(C=>C*2)}if(e.outTexUsage!=null&&(i.usage=e.outTexUsage),T(c.shape)===0)return i.values=ye(c.dtype,0),c;const l=[],u=t.map(m=>{if(m.dtype==="complex64")throw new Error("GPGPUProgram does not support complex64 input. For complex64 dtypes, please separate the program into real and imaginary parts.");let C=this.texData.get(m.dataId);if(C.texture==null){if(!e.packedInputs&&T(m.shape)<=$().getNumber("WEBGL_SIZE_UPLOAD_UNIFORM"))return{shape:m.shape,texData:null,isUniform:!0,uniformValues:C.values};e.packedInputs&&(C.isPacked=!0,C.shape=m.shape)}if(this.uploadToGPU(m.dataId),!!C.isPacked!=!!e.packedInputs)m=C.isPacked?this.unpackTensor(m):this.packTensor(m),l.push(m),C=this.texData.get(m.dataId);else if(C.isPacked&&!ot(C.shape,m.shape)){const b=m,v=m.shape;m.shape=C.shape,m=this.packedReshape(m,v),l.push(m),C=this.texData.get(m.dataId),b.shape=v}return{shape:m.shape,texData:C,isUniform:!1}});this.uploadToGPU(c.dataId);const d={shape:c.shape,texData:i,isUniform:!1},p=lu(e,u,d),h=this.getAndSaveBinary(p,()=>iu(this.gpgpu,e,u,d)),f=this.activeTimers!=null;let g;f&&(g=this.startTimer()),$().get("ENGINE_COMPILE_ONLY")||cu(this.gpgpu,h,u,d,o),l.forEach(m=>this.disposeIntermediateTensorInfo(m)),f&&(g=this.endTimer(g),this.activeTimers.push({name:e.constructor.name,query:this.getQueryTime(g)}));const x=$().getNumber("WEBGL_FLUSH_THRESHOLD");if(x>0){const m=we();m-this.lastGlFlushTime>x&&(this.gpgpu.gl.flush(),this.lastGlFlushTime=m)}if(!$().getBool("WEBGL_LAZILY_UNPACK")&&i.isPacked&&r===!1){const m=this.unpackTensor(c);return this.disposeIntermediateTensorInfo(c),m}return c}compileAndRun(e,t,s,o,r=!1){return s=s||t[0].dtype,this.runWebGLProgram(e,t,s,o,r)}getAndSaveBinary(e,t){return e in this.binaryCache||(this.binaryCache[e]=t()),this.binaryCache[e]}getTextureManager(){return this.textureManager}dispose(){this.disposed||($().getBool("IS_TEST")||Object.keys(this.binaryCache).forEach(t=>{this.gpgpu.deleteProgram(this.binaryCache[t].webGLProgram),delete this.binaryCache[t]}),this.textureManager.dispose(),this.canvas!=null&&typeof HTMLCanvasElement<"u"&&this.canvas instanceof HTMLCanvasElement?this.canvas.remove():this.canvas=null,this.gpgpuCreatedLocally&&(this.gpgpu.program=null,this.gpgpu.dispose()),this.disposed=!0)}floatPrecision(){return this.floatPrecisionValue==null&&(this.floatPrecisionValue=ss(()=>{if(!$().get("WEBGL_RENDER_FLOAT32_ENABLED")){const e=$().getBool("DEBUG");$().set("DEBUG",!1);const t=this.abs(dr(1e-8)).dataSync()[0];if($().set("DEBUG",e),t>0)return 32}return 16})),this.floatPrecisionValue}epsilon(){return this.floatPrecision()===32?kp:Op}uploadToGPU(e){const t=this.texData.get(e),{shape:s,dtype:o,values:r,texture:a,usage:c,isPacked:i}=t;if(a!=null)return;const l=this.activeTimers!=null;let u;l&&(u=we());let d=t.texShape;if(d==null&&(d=Ts(s,i),t.texShape=d),r!=null){const p=Ze(s);let h,f=d[1],g=d[0];const x=r instanceof Uint8Array||r instanceof Uint8ClampedArray;(i||!x)&&([f,g]=Ue(d[0],d[1])),i?h=new mu(p,x):h=new Nn(p,x);const m=x?[g,f]:d,C=this.makeTensorInfo(m,o),b=this.texData.get(C.dataId);x?b.usage=Z.PIXELS:b.usage=Z.UPLOAD,b.texShape=m,this.gpgpu.uploadDenseMatrixToTexture(this.getTexture(C.dataId),f,g,r);const v=[[g,f]],N=this.runWebGLProgram(h,[C],o,v,!0),I=this.texData.get(N.dataId);t.texShape=I.texShape,t.isPacked=I.isPacked,t.usage=I.usage,$().get("ENGINE_COMPILE_ONLY")?this.disposeData(N.dataId):(t.texture=I.texture,t.values=null,this.texData.delete(N.dataId)),this.disposeIntermediateTensorInfo(C),l&&(this.uploadWaitMs+=we()-u)}else{const p=this.acquireTexture(d,c,o,i);t.texture=p}}convertAndCacheOnCPU(e,t){const s=this.texData.get(e),{dtype:o}=s;return t!=null&&(s.values=_p(t,o)),s.values}acquireTexture(e,t,s,o){if(this.numBytesInGPU+=this.computeBytes(e,s),!this.warnedAboutMemory&&this.numBytesInGPU>this.numMBBeforeWarning*1024*1024){const r=(this.numBytesInGPU/1024/1024).toFixed(2);this.warnedAboutMemory=!0,console.warn(`High memory usage in GPU: ${r} MB, most likely due to a memory leak`)}return this.textureManager.acquireTexture(e,t,o)}computeBytes(e,t){return e[0]*e[1]*pr(t)}checkCompileCompletion(){for(const[,e]of Object.entries(this.binaryCache))this.checkCompletion_(e)}async checkCompileCompletionAsync(){const e=[];if(this.gpgpu.parallelCompilationExtension){for(const[,t]of Object.entries(this.binaryCache))e.push(this.checkCompletionAsync_(t));return Promise.all(e)}else{for(const[,t]of Object.entries(this.binaryCache)){const s=new Promise(o=>{try{this.checkCompletion_(t),o(!0)}catch(r){throw r}});e.push(s)}return Promise.all(e)}}async checkCompletionAsync_(e){return this.gpgpu.gl.getProgramParameter(e.webGLProgram,this.gpgpu.parallelCompilationExtension.COMPLETION_STATUS_KHR)?this.checkCompletion_(e):(await hr(),this.checkCompletionAsync_(e))}checkCompletion_(e){if(this.gpgpu.gl.getProgramParameter(e.webGLProgram,this.gpgpu.gl.LINK_STATUS)===!1)throw console.log(this.gpgpu.gl.getProgramInfoLog(e.webGLProgram)),this.gpgpu.gl.getShaderParameter(e.fragmentShader,this.gpgpu.gl.COMPILE_STATUS)===!1?(cn(e.source,this.gpgpu.gl.getShaderInfoLog(e.fragmentShader)),new Error("Failed to compile fragment shader.")):new Error("Failed to link vertex and fragment shaders.");return!0}getUniformLocations(){for(const e of Object.values(this.binaryCache)){this.gpgpu.buildVao(e.webGLProgram);const{variablesLocations:t,customUniformLocations:s,infLoc:o,nanLoc:r,outShapeLocation:a,outShapeStridesLocation:c,outTexShapeLocation:i}=Bs(this.gpgpu,e.program,e.webGLProgram);e.variablesLocations=t,e.customUniformLocations=s,e.infLoc=o,e.nanLoc=r,e.outShapeLocation=a,e.outShapeStridesLocation=c,e.outTexShapeLocation=i}}createTensorFromGPUData(e,t,s){e.channels=e.channels||"RGBA";const{texture:o,height:r,width:a,channels:c}=e,i=xe().backend;if(!i.gpgpu.gl.isTexture(o))throw new Error("The texture is invalid. Also, please make sure the texture and the TFJS WebGL backend are using the same canvas. If you want to use your own custom canvas, you have to create and use the custom TFJS WebGL backend created from the canvas through 'new tf.MathBackendWebGL(customCanvas)'.");const l=i.writeTexture(o,t,s,r,a,c);return xe().makeTensorFromDataId(l,t,s,i)}}At.nextDataId=0;function _p(n,e){if(e==="float32"||e==="complex64")return n;if(e==="int32"||e==="bool"){const t=e==="int32"?new Int32Array(n.length):new Uint8Array(n.length);for(let s=0;s<t.length;++s)t[s]=Math.round(n[s]);return t}else throw new Error(`Unknown dtype ${e}`)}/** @license See the LICENSE file. */const yb="4.22.0";/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Lp(){$().set("WEBGL_FORCE_F16_TEXTURES",!0)}/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */mr()&&xr("webgl",()=>new At,2);const Ib={forceHalfFloat:Lp};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Cn=`
  if (isnan(a)) return a;
  if (isnan(b)) return b;
`;class Ne{constructor(e,t,s){this.variableNames=["A","B"],this.outputShape=q(t,s),this.enableShapeUniforms=U(this.outputShape.length),this.userCode=`
      float binaryOperation(float a, float b) {
        ${e}
      }

      void main() {
        float a = getAAtOutCoords();
        float b = getBAtOutCoords();
        setOutput(binaryOperation(a, b));
      }
    `}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const De=`
  result.r = isNaN.r ? NAN : result.r;
  result.g = isNaN.g ? NAN : result.g;
  result.b = isNaN.b ? NAN : result.b;
  result.a = isNaN.a ? NAN : result.a;
`;class Xe{constructor(e,t,s,o=!1){this.variableNames=["A","B"],this.supportsBroadcasting=!0,this.packedInputs=!0,this.packedOutput=!0,this.outputShape=q(t,s);const r=this.outputShape.length;this.enableShapeUniforms=U(r);let a="";if(o)if(r===0||T(this.outputShape)===1)a=`
          result.y = 0.;
          result.z = 0.;
          result.w = 0.;
        `;else if(a=`
          ${D(r)} coords = getOutputCoords();
        `,r===1)this.enableShapeUniforms?a+=`
            result.y = (coords + 1) >= outShape ? 0. : result.y;
            result.z = 0.;
            result.w = 0.;
          `:a+=`
            result.y = (coords + 1) >= ${this.outputShape[0]} ? 0. : result.y;
            result.z = 0.;
            result.w = 0.;
          `;else{const i=M("coords",r);this.enableShapeUniforms?a+=`
            bool nextRowOutOfBounds =
              (${i[r-2]} + 1) >= outShape[${r} - 2];
            bool nextColOutOfBounds =
              (${i[r-1]} + 1) >= outShape[${r} - 1];
            result.y = nextColOutOfBounds ? 0. : result.y;
            result.z = nextRowOutOfBounds ? 0. : result.z;
            result.w = nextColOutOfBounds || nextRowOutOfBounds ? 0. : result.w;
          `:a+=`
            bool nextRowOutOfBounds =
              (${i[r-2]} + 1) >= ${this.outputShape[r-2]};
            bool nextColOutOfBounds =
              (${i[r-1]} + 1) >= ${this.outputShape[r-1]};
            result.y = nextColOutOfBounds ? 0. : result.y;
            result.z = nextRowOutOfBounds ? 0. : result.z;
            result.w = nextColOutOfBounds || nextRowOutOfBounds ? 0. : result.w;
          `}this.userCode=`
      vec4 binaryOperation(vec4 a, vec4 b) {
        ${e}
      }

      void main() {
        vec4 a = getAAtOutCoords();
        vec4 b = getBAtOutCoords();

        vec4 result = binaryOperation(a, b);
        ${a}

        setOutput(result);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Y(n){const{inputs:e,backend:t}=n,{x:s}=e;return t.incRef(s.dataId),{dataId:s.dataId,shape:s.shape,dtype:s.dtype}}const Bp={kernelName:gr,backendName:"webgl",kernelFunc:Y};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function $e(n){const{inputs:e,backend:t}=n,{real:s,imag:o}=e,r=t.makeTensorInfo(s.shape,"complex64"),a=t.texData.get(r.dataId),c=Y({inputs:{x:s},backend:t}),i=Y({inputs:{x:o},backend:t});return a.complexTensorInfos={real:c,imag:i},r}const Vp={kernelName:Cr,backendName:"webgl",kernelFunc:$e};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const co="return (a < 0.) ? b * a : a;",lo=`
  vec4 aLessThanZero = vec4(lessThan(a, vec4(0.)));
  return (aLessThanZero * (b * a)) + ((vec4(1.0) - aLessThanZero) * a);
`;function Up(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{alpha:r}=s,a=t.makeTensorInfo([],"float32",Ve(r,"float32")),c=$().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new Xe(lo,o.shape,a.shape):new Ne(co,o.shape,a.shape),i=t.runWebGLProgram(c,[o,a],"float32");return t.disposeIntermediateTensorInfo(a),i}const Wp={kernelName:vr,backendName:"webgl",kernelFunc:Up};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const uo="return (a < 0.) ? b * a : a;",po=`
  vec4 aLessThanZero = vec4(lessThan(a, vec4(0.)));
  return (aLessThanZero * (b * a)) + ((vec4(1.0) - aLessThanZero) * a);
`;function Mp(n){const{inputs:e,backend:t}=n,{x:s,alpha:o}=e,r=$().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new Xe(po,s.shape,o.shape):new Ne(uo,s.shape,o.shape);return t.runWebGLProgram(r,[s,o],"float32")}const Gp={kernelName:br,backendName:"webgl",kernelFunc:Mp};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Ke="if (isnan(x)) return x;";function P({opSnippet:n,packedOpSnippet:e,cpuKernelImpl:t,dtype:s}){return({inputs:o,backend:r})=>{const{x:a}=o,c=r,i=s||a.dtype;if(c.shouldExecuteOnCPU([a])&&t!=null){const d=c.texData.get(a.dataId),p=t(d.values,i);return c.makeTensorInfo(a.shape,i,p)}const l=$().getBool("WEBGL_PACK_UNARY_OPERATIONS")&&e!=null;let u;return l?u=new Ce(a.shape,e):u=new ue(a.shape,n),c.runWebGLProgram(u,[a],i)}}function B({opSnippet:n,packedOpSnippet:e,checkOutOfBounds:t=!1,supportsComplex:s=!1,cpuKernelImpl:o,dtype:r}){return({inputs:a,backend:c})=>{const{a:i,b:l}=a,u=c;if(s&&i.dtype==="complex64"){const f=u.texData.get(i.dataId),g=u.texData.get(l.dataId),[x,m]=[[f.complexTensorInfos.real,g.complexTensorInfos.real],[f.complexTensorInfos.imag,g.complexTensorInfos.imag]].map(b=>{const[v,w]=b,N={dataId:v.dataId,dtype:v.dtype,shape:i.shape},I={dataId:w.dataId,dtype:w.dtype,shape:l.shape},y=new Ne(n,i.shape,l.shape);return u.runWebGLProgram(y,[N,I],Ie(v.dtype,w.dtype))}),C=$e({inputs:{real:x,imag:m},backend:u});return u.disposeIntermediateTensorInfo(x),u.disposeIntermediateTensorInfo(m),C}const d=r||Ie(i.dtype,l.dtype);if((i.dtype==="string"||l.dtype==="string"||u.shouldExecuteOnCPU([i,l]))&&o!=null){const f=u.texData.get(i.dataId).values,g=u.texData.get(l.dataId).values,x=i.dtype==="string"?nt(f):f,m=i.dtype==="string"?nt(g):g,[C,b]=o(i.shape,l.shape,x,m,d),v=u.makeTensorInfo(b,d),w=u.texData.get(v.dataId);return w.values=C,v}const p=$().getBool("WEBGL_PACK_BINARY_OPERATIONS")&&e!=null;let h;return p?h=new Xe(e,i.shape,l.shape,t):h=new Ne(n,i.shape,l.shape),u.runWebGLProgram(h,[i,l],d)}}function rt(n,e=!1){if(n==="linear")return e?Rp:Cp;if(n==="relu")return e?yp:bp;if(n==="elu")return e?Sp:vp;if(n==="relu6")return e?Ip:$p;if(n==="prelu")return e?po:uo;if(n==="leakyrelu")return e?lo:co;if(n==="sigmoid")return e?Tp:wp;throw new Error(`Activation ${n} has not been implemented for the WebGL backend.`)}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class ho{constructor(e,t,s,o=!1,r=!1,a=!1,c=null,i=!1,l=!1){this.variableNames=["matrixA","matrixB"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=s,this.enableShapeUniforms=U(this.outputShape.length);const u=o?e[1]:e[2],d=Math.ceil(u/2),p=o?"i * 2, rc.y":"rc.y, i * 2",h=r?"rc.z, i * 2":"i * 2, rc.z",f=o?["a.xxyy","a.zzww"]:["a.xxzz","a.yyww"],g=r?["b.xzxz","b.ywyw"]:["b.xyxy","b.zwzw"];let x="",m="";c&&(i?x=`vec4 activation(vec4 a) {
          vec4 b = getPreluActivationWeightsAtOutCoords();
          ${c}
        }`:l?x=`vec4 activation(vec4 a) {
          vec4 b = getLeakyreluAlphaAtOutCoords();
          ${c}
        }`:x=`vec4 activation(vec4 x) {
          ${c}
        }`,m="result = activation(result);");const C=a?"result += getBiasAtOutCoords();":"";a&&this.variableNames.push("bias"),i&&this.variableNames.push("preluActivationWeights"),l&&this.variableNames.push("leakyreluAlpha");let b="rc.x",v="rc.x";e[0]<t[0]?b=`imod(rc.x, ${e[0]})`:t[0]<e[0]&&(v=`imod(rc.x, ${t[0]})`),this.userCode=`
      ${x}
      // Don't use uniform for sharedDimensionPacked for performance.
      const float sharedDimension = ${d}.0;

      vec4 dot2x2ARowBCol(ivec3 rc) {
        vec4 result = vec4(0);
        int batchA = ${b};
        int batchB = ${v};
        for (int i = 0; i < ${d}; i++) {
          vec4 a = getMatrixA(batchA, ${p});
          vec4 b = getMatrixB(batchB, ${h});

          // These swizzled products need to be separately added.
          // See: https://github.com/tensorflow/tfjs/issues/1735
          result += (${f[0]} * ${g[0]});
          result += (${f[1]} * ${g[1]});
        }
        return result;
      }

      void main() {
        ivec3 rc = getOutputCoords();
        vec4 result = dot2x2ARowBCol(rc);

        ${C}

        ${m}

        setOutput(result);
      }
    `}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Bn={REAL:"return areal * breal - aimag * bimag;",IMAG:"return areal * bimag + aimag * breal;"};class Vn{constructor(e,t,s){this.variableNames=["AReal","AImag","BReal","BImag"],this.outputShape=q(t,s),this.userCode=`
      float binaryOpComplex(
          float areal, float aimag, float breal, float bimag) {
        ${e}
      }

      void main() {
        float areal = getARealAtOutCoords();
        float aimag = getAImagAtOutCoords();
        float breal = getBRealAtOutCoords();
        float bimag = getBImagAtOutCoords();
        setOutput(binaryOpComplex(areal, aimag, breal, bimag));
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Un="return a * b;";function vn(n){const{inputs:e,backend:t}=n,{a:s,b:o}=e,r=Ie(s.dtype,o.dtype);if(s.dtype==="complex64"){const c=t.texData.get(s.dataId),i=t.texData.get(o.dataId),l=new Vn(Bn.REAL,s.shape,o.shape),u=new Vn(Bn.IMAG,s.shape,o.shape),d=[{dataId:c.complexTensorInfos.real.dataId,dtype:c.complexTensorInfos.real.dtype,shape:s.shape},{dataId:c.complexTensorInfos.imag.dataId,dtype:c.complexTensorInfos.imag.dtype,shape:s.shape},{dataId:i.complexTensorInfos.real.dataId,dtype:i.complexTensorInfos.real.dtype,shape:o.shape},{dataId:i.complexTensorInfos.imag.dataId,dtype:i.complexTensorInfos.imag.dtype,shape:o.shape}],p=t.runWebGLProgram(l,d,"float32"),h=t.runWebGLProgram(u,d,"float32"),f=$e({inputs:{real:p,imag:h},backend:t});return t.disposeIntermediateTensorInfo(p),t.disposeIntermediateTensorInfo(h),f}if(t.shouldExecuteOnCPU([s,o])){const c=t.texData.get(s.dataId),i=t.texData.get(o.dataId),[l,u]=Wd(s.shape,o.shape,c.values,i.values,r),d=t.makeTensorInfo(u,r),p=t.texData.get(d.dataId);return p.values=l,d}let a;return $().getBool("WEBGL_PACK_BINARY_OPERATIONS")?a=new Xe(Un,s.shape,o.shape):a=new Ne(Un,s.shape,o.shape),t.runWebGLProgram(a,[s,o],r)}const zp={kernelName:$r,backendName:"webgl",kernelFunc:vn};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Hp(n,e,t){const s=[Te(n.shape),...Ee(n.shape)],o={dtype:n.dtype,shape:s,dataId:n.dataId},r=[Te(e),...Ee(e)],a=new io(r,s),c=!0,i=[s],l=t.runWebGLProgram(a,[o],n.dtype,i,c);return{dataId:l.dataId,shape:e,dtype:l.dtype}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function R(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{shape:r}=s,a=t,c=T(o.shape),i=Rr(r,c),l=T(i);F(c===l,()=>`The new shape (${i}) has ${l} elements and the old shape (${o.shape}) has ${c} elements. The new shape and old shape must have the same number of elements.`);const u=a.texData.get(o.dataId);return u.isPacked&&!ot(o.shape,i)&&!(u.texture!==null&&ot(u.shape,i))?Hp(o,i,a):(a.incRef(o.dataId),{dataId:o.dataId,shape:i,dtype:o.dtype})}const Xp={kernelName:wr,backendName:"webgl",kernelFunc:R};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Wn{constructor(e,t){this.variableNames=["x"];const{windowSize:s,batchSize:o,inSize:r,outSize:a}=e;this.outputShape=[o,a];const c=Math.floor(s/4)*4,i=s%4;let l="sumValue += dot(values, ones);";if(t!=null){const d=1/t;l=`sumValue += dot(values * ${Sr(d)?d.toPrecision(2):d}, ones);`}let u="";r%s>0&&(u=`
        if (inIdx < 0 || inIdx >= ${r}) {
          return 0.0;
        }
      `),this.userCode=`
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float getValue(int batch, int inIdx) {
        ${u}
        return getX(batch, inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${s};

        float sumValue = 0.0;

        for (int i = 0; i < ${c}; i += 4) {
          int inIdx = inOffset + i;
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          ${l}
        }

        int inIdx = inOffset + ${c};
        if (${i===1}) {
          vec4 values = vec4(getValue(batch, inIdx), 0.0, 0.0, 0.0);

          ${l}
        } else if (${i===2}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1), 0.0, 0.0);

          ${l}
        } else if (${i===3}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2), 0.0);

          ${l}
        }
        setOutput(sumValue);
      }
    `}}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Kp{constructor(e,t){this.variableNames=["x"];const{windowSize:s,batchSize:o,inSize:r,outSize:a}=e;this.outputShape=[o,a];let c="0.0",i="";t==="prod"?c="1.0":t==="min"?(c="1.0 / 1e-20",i="min"):t==="max"&&(c="-1.0 / 1e-20",i="max");let l=`${t}(${t}(${t}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;t==="sum"?l="sumValue":t==="prod"?l="prodValue":t==="all"?l="allValue":t==="any"&&(l="anyValue");const u=Math.floor(s/4)*4,d=s%4;let p=`
      if (${t==="sum"}) {
        sumValue += dot(values, ones);
      } else if (${t==="prod"}) {
        vec2 tmp = vec2(values[0], values[1]) * vec2(values[2], values[3]);
        prodValue *= tmp[0] * tmp[1];
      } else {
        minMaxValue = ${i}(values, minMaxValue);
        if (${t==="min"} || ${t==="max"}) {
          minMaxValue = ${i}(values, minMaxValue);
          bvec4 isNaN = isnan(values);
          if (isNaN.r || isNaN.g || isNaN.b || isNaN.a) {
            minMaxValue = vec4(NAN);
          }
        }
      }
    `,h="vec4";t==="all"?(c="1.0",p=`
        bool reducedAllValue = all(values);
        float floatedReducedAllValue = float(reducedAllValue);
        allValue = float(allValue >= 1.0 && floatedReducedAllValue >= 1.0);
      `,h="bvec4"):t==="any"&&(c="0.0",p=`
        bool reducedAnyValue = any(values);
        float floatedReducedAnyValue = float(reducedAnyValue);
        anyValue = float(anyValue >= 1.0 || floatedReducedAnyValue >= 1.0);
      `,h="bvec4");let f="";r%s>0&&(f=`
        if (inIdx < 0 || inIdx >= ${r}) {
          return initializationValue;
        }
      `),this.userCode=`
      const float initializationValue = ${c};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float getValue(int batch, int inIdx) {
        ${f}
        return getX(batch, inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${s};

        vec4 minMaxValue = vec4(${c});
        float prodValue = 1.0;
        float sumValue = 0.0;
        float allValue = 1.0;
        float anyValue = 0.0;

        for (int i = 0; i < ${u}; i += 4) {
          int inIdx = inOffset + i;
          ${h} values = ${h}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          ${p}
        }

        int inIdx = inOffset + ${u};
        if (${d===1}) {
          ${h} values = ${h}(
            getValue(batch, inIdx),
            initializationValue,
            initializationValue,
            initializationValue
          );

          ${p}
        } else if (${d===2}) {
          ${h} values = ${h}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            initializationValue,
            initializationValue
          );

          ${p}
        } else if (${d===3}) {
          ${h} values = ${h}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            initializationValue
          );

          ${p}
        }
        setOutput(${l});
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function jp(n){const e=[];for(;e.length===0||e[e.length-1].outSize!==1;){const t=e.length?e[e.length-1].outSize:n[1],s=nn(t);e.push({inSize:t,windowSize:s,outSize:Math.ceil(t/s)})}return e}function Ae(n,e,t,s){const o=jp(n.shape);let r=n;for(let a=0;a<o.length;a++){const{inSize:c,windowSize:i,outSize:l}=o[a];let u,d;t==="mean"?u=a===0?new Wn({windowSize:i,inSize:c,batchSize:n.shape[0],outSize:l},c):new Wn({windowSize:i,inSize:c,batchSize:n.shape[0],outSize:l}):u=new Kp({windowSize:i,inSize:c,batchSize:n.shape[0],outSize:l},t),d=r,r=s.runWebGLProgram(u,[r],e),d.dataId!==n.dataId&&s.disposeIntermediateTensorInfo(d)}return r}/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class qp{constructor(e,t){this.variableNames=["A"];const s=new Array(e.length);for(let a=0;a<s.length;a++)s[a]=e[t[a]];this.outputShape=s,this.rank=s.length;const o=D(this.rank),r=Yp(t);this.userCode=`
    void main() {
      ${o} resRC = getOutputCoords();
      setOutput(getA(${r}));
    }
    `}}function Yp(n){const e=n.length;if(e>6)throw Error(`Transpose for rank ${e} is not yet supported`);const t=["resRC.x","resRC.y","resRC.z","resRC.w","resRC.u","resRC.v"],s=new Array(e);for(let o=0;o<n.length;o++)s[n[o]]=t[o];return s.join()}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Qp{constructor(e,t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0;const s=new Array(e.length);for(let u=0;u<s.length;u++)s[u]=e[t[u]];if(this.outputShape=s,this.rank=s.length,this.rank>6)throw Error(`Packed transpose for rank ${this.rank} is not yet supported.`);const o=D(this.rank),r=ao("rc",this.rank),a=new Array(this.rank);for(let u=0;u<t.length;u++)a[t[u]]=r[u];const c=`vec2(${a.slice(-2).join()})`,i=`++${r[this.rank-1]} < ${s[this.rank-1]}`,l=`getChannel(getA(${a.join()}), ${c})`;this.userCode=`
    void main() {
      ${o} rc = getOutputCoords();
      vec4 result = vec4(0.);
      result[0] = ${l};
      if(${i}) {
        result[1] = ${l};
      }
      --${r[this.rank-1]};
      if(++${r[this.rank-2]} < ${s[this.rank-2]}) {
        result[2] = ${l};
        if(${i}) {
          result[3] = ${l};
        }
      }
      setOutput(result);
    }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ft(n,e,t){const s=$().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new Qp(n.shape,e):new qp(n.shape,e);return t.runWebGLProgram(s,[n],n.dtype)}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Zp(n,e,t,s){const o=e,r=n.shape.length,a=K(o,n.shape);let c=a;const i=ie(c,r),l=i!=null;let u=n;l&&(u=Ft(n,i,s),c=ce(c.length,r)),de("sum",c,r);const[d,p]=pe(u.shape,c);let h=d;t&&(h=ve(d,a));const f=T(p),x=T(n.shape)/f,m=R({inputs:{x:u},attrs:{shape:[x,f]},backend:s}),C=sn(n.dtype),b=Ae(m,C,"sum",s),v=R({inputs:{x:b},attrs:{shape:h},backend:s});return s.disposeIntermediateTensorInfo(m),s.disposeIntermediateTensorInfo(b),l&&s.disposeIntermediateTensorInfo(u),v}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function _t(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:a}=s;return Zp(o,r,a,t)}const Jp={kernelName:yr,backendName:"webgl",kernelFunc:_t};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function G(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{perm:r}=s,a=t,c=o.shape.length,i=new Array(c);for(let u=0;u<i.length;u++)i[u]=o.shape[r[u]];let l;if(a.shouldExecuteOnCPU([o])){const d=a.texData.get(o.dataId).values,p=gn(d,o.shape,o.dtype,r,i);l=a.makeTensorInfo(i,o.dtype);const h=a.texData.get(l.dataId);h.values=p}else l=Ft(o,r,a);return l}const eh={kernelName:Ir,backendName:"webgl",kernelFunc:G};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const fo=1e3;function Tt({a:n,b:e,transposeA:t,transposeB:s,backend:o,bias:r=null,preluActivationWeights:a=null,leakyreluAlpha:c=0,activation:i=null}){const l=n.shape.length,u=e.shape.length,d=t?n.shape[l-2]:n.shape[l-1],p=s?e.shape[u-1]:e.shape[u-2],h=t?n.shape[l-1]:n.shape[l-2],f=s?e.shape[u-2]:e.shape[u-1],g=n.shape.slice(0,-2),x=e.shape.slice(0,-2),m=T(g),C=T(x),v=q(n.shape.slice(0,-2),e.shape.slice(0,-2)).concat([h,f]);F(d===p,()=>`Error in matMul: inner shapes (${d}) and (${p}) of Tensors with shapes ${n.shape} and ${e.shape} and transposeA=${t} and transposeB=${s} must match.`);const w=t?[m,d,h]:[m,h,d],N=s?[C,f,p]:[C,p,f],I=R({inputs:{x:n},backend:o,attrs:{shape:w}}),y=R({inputs:{x:e},backend:o,attrs:{shape:N}}),O=[I,y],k=Math.max(m,C),A=t?I.shape[1]:I.shape[2],_=r!=null,le=a!=null,j=i==="leakyrelu",Q=i!=null?rt(i,!0):null,ne=_||le||j||Q!=null;let re;if((h===1||f===1)&&A>fo&&ne===!1){let me=I,Fe=y;t&&(me=G({inputs:{x:I},backend:o,attrs:{perm:[0,2,1]}}),O.push(me)),s&&(Fe=G({inputs:{x:y},backend:o,attrs:{perm:[0,2,1]}}),O.push(Fe));const _e=f!==1,ft=f===1;let Bt=me;_e&&(Bt=R({inputs:{x:me},backend:o,attrs:{shape:[k,A,1]}}),O.push(Bt));const Bo=f===1?2:1;let Vt=Fe;ft&&(Vt=R({inputs:{x:Fe},backend:o,attrs:{shape:[k,1,A]}}),O.push(Vt));const wn=vn({inputs:{a:Bt,b:Vt},backend:o});re=_t({inputs:{x:wn},backend:o,attrs:{axis:Bo,keepDims:!0}}),O.push(wn)}else{const me=Ie(n.dtype,e.dtype),Fe=new ho(w,N,[k,h,f],t,s,_,Q,le,j),_e=[I,y];if(r!=null&&_e.push(r),le&&_e.push(a),j){const ft=o.makeTensorInfo([],"float32",Ve(c,"float32"));_e.push(ft),O.push(ft)}re=o.runWebGLProgram(Fe,_e,me)}const W=R({inputs:{x:re},backend:o,attrs:{shape:v}});O.push(re);for(const me of O)o.disposeIntermediateTensorInfo(me);return W}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function th(n){const{inputs:e,backend:t,attrs:s}=n,{a:o,b:r,bias:a,preluActivationWeights:c}=e,{transposeA:i,transposeB:l,activation:u,leakyreluAlpha:d}=s;return Tt({a:o,b:r,transposeA:i,transposeB:l,backend:t,bias:a,preluActivationWeights:c,leakyreluAlpha:d,activation:u})}const nh={kernelName:Tr,backendName:"webgl",kernelFunc:th};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Mn="return abs(x);";function sh(n){const{inputs:e,backend:t}=n,{x:s}=e;if(t.shouldExecuteOnCPU([s])&&s.dtype!=="complex64"){const r=t.texData.get(s.dataId),a=oo(r.values);return t.makeTensorInfo(s.shape,s.dtype,a)}let o;return $().getBool("WEBGL_PACK_UNARY_OPERATIONS")?o=new Ce(s.shape,Mn):o=new ue(s.shape,Mn),t.runWebGLProgram(o,[s],s.dtype)}const oh={kernelName:Er,backendName:"webgl",kernelFunc:sh};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const rh=oe+`
  if (abs(x) > 1.) {
    return NAN;
  }
  return acos(x);
`,ah=P({opSnippet:rh}),ih={kernelName:Nr,backendName:"webgl",kernelFunc:ah};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const ch=oe+`
  if (x < 1.0) return NAN;
return log(x + sqrt(x * x - 1.0));`,lh=P({opSnippet:ch}),uh={kernelName:kr,backendName:"webgl",kernelFunc:lh};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Gn="return a + b;",dh=B({opSnippet:Gn,packedOpSnippet:Gn,supportsComplex:!0,cpuKernelImpl:bd}),ph={kernelName:Or,backendName:"webgl",kernelFunc:dh};/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class hh{constructor(e,t){this.outputShape=[],this.outputShape=e,this.variableNames=t.map((r,a)=>`T${a}`);const s=[];this.variableNames.forEach(r=>{s.push(`float v${r} = get${r}AtOutCoords();`)});const o=this.variableNames.map(r=>`v${r}`).join(" + ");this.userCode=`
      void main() {
        ${s.join(`
        `)}

        float result = ${o};
        setOutput(result);
      }
    `}}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class fh{constructor(e,t){this.outputShape=[],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.variableNames=t.map((r,a)=>`T${a}`);const s=[];this.variableNames.forEach(r=>{s.push(`vec4 v${r} = get${r}AtOutCoords();`)});const o=this.variableNames.map(r=>`v${r}`).join(" + ");this.userCode=`
      void main() {
        ${s.join(`
        `)}

        vec4 result = ${o};
        setOutput(result);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function yt(n){const{inputs:e,backend:t}=n,s=e;if(s.length===1)return Y({inputs:{x:s[0]},backend:t});if(s.length>$().getNumber("WEBGL_MAX_TEXTURES_IN_SHADER")){const i=Math.floor(s.length/2),l=yt({inputs:s.slice(0,i),backend:t}),u=yt({inputs:s.slice(i),backend:t});return yt({inputs:[l,u],backend:t})}const o=s.map(i=>i.dtype).reduce((i,l)=>Ie(i,l)),r=s.map(i=>i.shape),c=$().getBool("WEBGL_PACK")?new fh(s[0].shape,r):new hh(s[0].shape,r);return t.runWebGLProgram(c,s,o)}const mh={kernelName:Pr,backendName:"webgl",kernelFunc:yt};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function xh(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:a}=s,c=o.shape.length,i=K(r,o.shape);let l=i;const u=ie(l,c);let d=o;u!=null&&(d=G({inputs:{x:o},backend:t,attrs:{perm:u}}),l=ce(l.length,c)),de("all",l,c);const[p,h]=pe(d.shape,l),f=T(h),g=R({inputs:{x:d},backend:t,attrs:{shape:[-1,f]}}),x=Ae(g,g.dtype,"all",t);let m;if(a){const C=ve(p,i);m=R({inputs:{x},backend:t,attrs:{shape:C}})}else m=R({inputs:{x},backend:t,attrs:{shape:p}});return t.disposeIntermediateTensorInfo(g),t.disposeIntermediateTensorInfo(x),u!=null&&t.disposeIntermediateTensorInfo(d),m}const gh={kernelName:Dr,backendName:"webgl",kernelFunc:xh};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ch(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:a}=s,c=o.shape.length,i=K(r,o.shape);let l=i;const u=ie(l,c);let d=o;u!=null&&(d=G({inputs:{x:o},backend:t,attrs:{perm:u}}),l=ce(l.length,c)),de("any",l,c);const[p,h]=pe(d.shape,l),f=T(h),g=R({inputs:{x:d},backend:t,attrs:{shape:[-1,f]}}),x=Ae(g,g.dtype,"any",t);let m;if(a){const C=ve(p,i);m=R({inputs:{x},backend:t,attrs:{shape:C}})}else m=R({inputs:{x},backend:t,attrs:{shape:p}});return t.disposeIntermediateTensorInfo(g),t.disposeIntermediateTensorInfo(x),u!=null&&t.disposeIntermediateTensorInfo(d),m}const vh={kernelName:Ar,backendName:"webgl",kernelFunc:Ch};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class bh{constructor(e,t,s){this.variableNames=["A"];const{windowSize:o,batchSize:r,outSize:a}=e;s||this.variableNames.push("bestIndicesA"),this.outputShape=[r,a];const c=t==="max"?">":"<",i=s?"inOffset + i;":"round(getBestIndicesA(batch, inOffset + i));";this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${o};

        int bestIndex = inOffset;
        float bestValue = getA(batch, bestIndex);

        for (int i = 0; i < ${o}; i++) {
          int inIdx = ${i};
          float candidate = getA(batch, inIdx);
          if (candidate ${c} bestValue) {
            bestValue = candidate;
            bestIndex = inIdx;
          }
        }
        setOutput(float(bestIndex));
      }
    `}}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class $h{constructor(e,t,s,o){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,F(e.length>2,()=>`Packed arg${s.charAt(0).toUpperCase()+s.slice(1)} supports only inputs with rank above 2.`);const r=e[e.length-1],a=Math.ceil(r/t);this.outputShape=e.slice(0,-1),a>1&&this.outputShape.push(a),o||this.variableNames.push("bestIndicesA");const c=this.outputShape,i=c.length,l=D(i),u=M("coords",i);let d,p;if(a===1){p=i+1;const y=D(p);d=`
        ${y} sourceLocR = ${y}(${u.join()}, 0);
        ++${u[i-1]};
        ${y} sourceLocG = ${y}(${u.join()}, 0);
        ++${u[i-2]};
        ${y} sourceLocA = ${y}(${u.join()}, 0);
        --${u[i-1]};
        ${y} sourceLocB = ${y}(${u.join()}, 0);
        --${u[i-2]};`}else p=i,d=`
        ${l} sourceLocR = coords;
        ++${u[i-1]};
        ${l} sourceLocG = coords;
        ++${u[i-2]};
        ${l} sourceLocA = coords;
        --${u[i-1]};
        ${l} sourceLocB = coords;
        --${u[i-2]};`;const h=["x","y","z","w","u","v"].slice(0,p),f="."+h[p-1],g=h.map(y=>"int "+y),x=M("sourceLocR",p-1).concat("inIdx.r"),m=M("sourceLocG",p-1).concat("inIdx.g"),C=M("sourceLocB",p-1).concat("inIdx.b"),b=M("sourceLocA",p-1).concat("inIdx.a"),v=s==="max"?"greaterThan":"lessThan",w=o?"":`
          inIdx = round(vec4(getBestIndicesAChannel(${x.join()}),
                             getBestIndicesAChannel(${m.join()}),
                             getBestIndicesAChannel(${C.join()}),
                             getBestIndicesAChannel(${b.join()})));`,N=`vec4(
            getAChannel(${x.join()}),
            hasNextCol ? getAChannel(${m.join()}) : 0.,
            hasNextRow ? getAChannel(${C.join()}) : 0.,
            hasNextRow && hasNextCol ? getAChannel(${b.join()}) : 0.)`,I=o?"":`
      float getBestIndicesAChannel(${g.join()}) {
        return getChannel(getBestIndicesA(${h.join()}),
                                          vec2(${h.slice(-2).join()}));
      }`;this.userCode=`
      float getAChannel(${g.join()}) {
        return getChannel(getA(${h.join()}),
                               vec2(${h.slice(-2).join()}));
      }
      ${I}
      void main() {
        ${l} coords = getOutputCoords();
        bool hasNextCol = ${u[i-1]} < ${c[i-1]-1};
        bool hasNextRow = ${u[i-2]} < ${c[i-2]-1};
        ${d}
        ivec4 srcIdx = ivec4(sourceLocR${f}, sourceLocG${f},
          sourceLocB${f}, sourceLocA${f}) * ${t};
        ivec4 inIdx = srcIdx;
        vec4 bestIndex = vec4(inIdx);
        vec4 bestValue = ${N};

        for (int i = 0; i < ${t}; i++) {
          inIdx = srcIdx;
          ${w}
          vec4 candidate = ${N};
          bvec4 nan = isnan(candidate);
          bvec4 replace = bvec4(
            vec4(${v}(candidate, bestValue)) * (vec4(1.0) - vec4(nan)));

          bestValue = vec4(replace.x  ? candidate.x : bestValue.x,
                           replace.y  ? candidate.y : bestValue.y,
                           replace.z  ? candidate.z : bestValue.z,
                           replace.w  ? candidate.w : bestValue.w);
          bestIndex = mix(bestIndex, vec4(inIdx), vec4(replace));
          srcIdx++;
        }
        setOutput(bestIndex);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function mo(n,e,t,s=null){let o=e.shape[0],r=e.shape[1];s!=null&&(o=s.shape[0],r=s.shape[1]);const a=nn(r),c={windowSize:a,inSize:r,batchSize:o,outSize:Math.ceil(r/a)},i=new bh(c,t,s==null),l=[e];s!=null&&l.push(s);const u=n.runWebGLProgram(i,l,"int32");if(u.shape[1]===1)return u;const d=mo(n,e,t,u);return n.disposeIntermediateTensorInfo(u),d}function xo(n,e,t,s=null){const o=s!=null?s.shape:e.shape,r=o[o.length-1],a=nn(r),c=new $h(o,a,t,s==null),i=s==null?[e]:[e,s],l=n.runWebGLProgram(c,i,"int32");if(l.shape.length===e.shape.length){const u=xo(n,e,t,l);return n.disposeIntermediateTensorInfo(l),u}return l}function go(n,e,t,s){const o=[t];if(de("arg"+s.charAt(0).toUpperCase()+s.slice(1),o,e.shape.length),!$().getBool("WEBGL_PACK_REDUCE")||e.shape.length<=2){const r=[],a=n.texData.get(e.dataId),c=a!==null&&a.isPacked;let i=e;c&&(i=n.unpackTensor(e),r.push(i));const[l,u]=pe(i.shape,o),d=T(u),p=R({inputs:{x:i},backend:n,attrs:{shape:[-1,d]}});r.push(p);const h=mo(n,p,s);r.push(h);const f=R({inputs:{x:h},backend:n,attrs:{shape:l}});return r.forEach(g=>n.disposeIntermediateTensorInfo(g)),f}return xo(n,e,s)}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function wh(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r}=s;let a=K(r,o.shape);const c=ie(a,o.shape.length);let i=o;const l=[];c!=null&&(i=G({inputs:{x:o},backend:t,attrs:{perm:c}}),l.push(i),a=ce(a.length,i.shape.length)),de("argMax",[a[0]],i.shape.length);const u=go(t,i,a[0],"max");return l.forEach(d=>t.disposeIntermediateTensorInfo(d)),u}const Rh={kernelName:Fr,backendName:"webgl",kernelFunc:wh};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Sh(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r}=s;let a=K(r,o.shape);const c=ie(a,o.shape.length);let i=o;const l=[];c!=null&&(i=G({inputs:{x:o},backend:t,attrs:{perm:c}}),l.push(i),a=ce(a.length,i.shape.length)),de("argMin",[a[0]],i.shape.length);const u=go(t,i,a[0],"min");return l.forEach(d=>t.disposeIntermediateTensorInfo(d)),u}const yh={kernelName:_r,backendName:"webgl",kernelFunc:Sh};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Ih=oe+`
  if (abs(x) > 1.) {
    return NAN;
  }
  return asin(x);
`,Th=P({opSnippet:Ih}),Eh={kernelName:Lr,backendName:"webgl",kernelFunc:Th};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Nh=oe+"return log(x + sqrt(x * x + 1.0));",kh=P({opSnippet:Nh}),Oh={kernelName:Br,backendName:"webgl",kernelFunc:kh};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Ph=oe+`
  return atan(x);
`,Dh=P({opSnippet:Ph}),Ah={kernelName:Vr,backendName:"webgl",kernelFunc:Dh};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Fh=Cn+`
  return atan(a, b);
`,_h=`
  vec4 result = atan(a, b);
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+De+`
  return result;
`,Lh=B({opSnippet:Fh,packedOpSnippet:_h}),Bh={kernelName:Ur,backendName:"webgl",kernelFunc:Lh};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Vh=oe+`
  if ((x < -1.0) || (x > 1.0)) return NAN;
return (log(1.0 + x) - log(1.0 - x)) / 2.0;`,Uh=P({opSnippet:Vh}),Wh={kernelName:Wr,backendName:"webgl",kernelFunc:Uh};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class at{constructor(e,t,s,o=!1,r=!1){if(this.variableNames=["x"],t==="avg"&&s)throw new Error("Cannot compute positions for average pool.");const a=e.filterWidth,c=e.strideHeight,i=e.strideWidth,l=e.dilationHeight,u=e.dilationWidth,d=e.effectiveFilterHeight,p=e.effectiveFilterWidth,h=e.padInfo.top,f=e.padInfo.left;this.outputShape=e.outShape;const g=t==="avg",x=`((batch  * ${e.inHeight} + xR) * ${e.inWidth} + xC) * ${e.inChannels} + d`,m=`(xR * ${e.inWidth} + xC) * ${e.inChannels} + d`;let C="0.0";if(g||(C="-1.0 / 1e-20"),s){const y=">=";this.userCode=`
        const ivec2 strides = ivec2(${c}, ${i});
        const ivec2 pads = ivec2(${h}, ${f});

        void main() {
          ivec4 coords = getOutputCoords();
          int batch = coords[0];
          int d = coords[3];

          ivec2 xRCCorner = coords.yz * strides - pads;
          int xRCorner = xRCCorner.x;
          int xCCorner = xRCCorner.y;

          // max/min x(?, ?, d) to get y(yR, yC, d).
          // ? = to be determined
          float minMaxValue = 0.0;
          float minMaxValueFound = 0.0;
          int minMaxPosition = 0;
          float avgValue = 0.0;

          for (int wR = 0; wR < ${d};
              wR += ${l}) {
            int xR = xRCorner + wR;

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${p};
                wC += ${u}) {
              int xC = xCCorner + wC;

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              float value = getX(batch, xR, xC, d);

              // If a min / max value has already been found, use it. If not,
              // use the current value.
              float currMinMaxValue = mix(
                  value, minMaxValue, minMaxValueFound);
              if (value ${y} currMinMaxValue) {
                minMaxValue = value;
                minMaxValueFound = 1.0;
                minMaxPosition = ${o?r?x:m:`wR * ${p} + wC`};
              }
            }
          }
          setOutput(float(minMaxPosition));
        }
      `;return}const b="max";let v=`${t}(${t}(${t}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;t==="avg"&&(v="avgValue / max(count, 1.0)");const w=Math.floor(a/4)*4,N=a%4,I=`
      if (${g}) {
        avgValue += dot(values, ones);
      } else {
        minMaxValue = ${b}(values, minMaxValue);
      }
    `;this.userCode=`
      const ivec2 strides = ivec2(${c}, ${i});
      const ivec2 pads = ivec2(${h}, ${f});
      const float initializationValue = ${C};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float count = 0.0;

      float getValue(int batch, int xR, int xC, int d) {
        if (xC < 0 || xC >= ${e.inWidth}) {
          return initializationValue;
        }
        count += 1.0;
        return getX(batch, xR, xC, d);
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d = coords[3];

        ivec2 xRCCorner = coords.yz * strides - pads;
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // max/min x(?, ?, d) to get y(yR, yC, d).
        // ? = to be determined
        vec4 minMaxValue = vec4(${C});
        float avgValue = 0.0;
        count = 0.0;

        for (int wR = 0; wR < ${d};
            wR += ${l}) {
          int xR = xRCorner + wR;

          if (xR < 0 || xR >= ${e.inHeight}) {
            continue;
          }

          for (int wC = 0; wC < ${w}; wC += 4) {
            int xC = xCCorner + wC * ${u};

            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${u}, d),
              getValue(batch, xR, xC + 2 * ${u}, d),
              getValue(batch, xR, xC + 3 * ${u}, d)
            );

            ${I}
          }

          int xC = xCCorner + ${w};
          if (${N===1}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              initializationValue,
              initializationValue,
              initializationValue
            );

            ${I}
          } else if (${N===2}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${u}, d),
              initializationValue,
              initializationValue
            );

            ${I}
          } else if (${N===3}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${u}, d),
              getValue(batch, xR, xC + 2 * ${u}, d),
              initializationValue
            );

            ${I}
          }
        }
        setOutput(${v});
      }
    `}}class bn{constructor(e,t,s,o=!1,r=!1){if(this.variableNames=["x"],t==="avg"&&s)throw new Error("Cannot compute positions for average pool.");const a=e.filterWidth,c=e.strideDepth,i=e.strideHeight,l=e.strideWidth,u=e.dilationDepth,d=e.dilationHeight,p=e.dilationWidth,h=e.effectiveFilterDepth,f=e.effectiveFilterHeight,g=e.effectiveFilterWidth,x=e.padInfo.front,m=e.padInfo.top,C=e.padInfo.left;this.outputShape=e.outShape;const b=t==="avg";let v="0.0";if(b||(v="-1.0 / 1e-20"),s){const k=">=";this.userCode=`
        const ivec3 strides =
            ivec3(${c}, ${i}, ${l});
        const ivec3 pads = ivec3(${x}, ${m}, ${C});

        void main() {
          ivec5 coords = getOutputCoords();
          int batch = coords.x;
          int ch = coords.u;

          ivec3 xCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
          int xDCorner = xCorner.x;
          int xRCorner = xCorner.y;
          int xCCorner = xCorner.z;

          // max/min x(?, ?, ?, ch) to get y(yD, yR, yC, ch).
          // ? = to be determined
          float minMaxValue = 0.0;
          float minMaxValueFound = 0.0;
          int minMaxPosition = 0;

          for (int wD = 0; wD < ${h};
              wD += ${u}) {
            int xD = xDCorner + wD;

            if (xD < 0 || xD >= ${e.inDepth}) {
              continue;
            }

            for (int wR = 0; wR < ${f};
                wR += ${d}) {
              int xR = xRCorner + wR;

              if (xR < 0 || xR >= ${e.inHeight}) {
                continue;
              }

              for (int wC = 0; wC < ${g};
                  wC += ${p}) {
                int xC = xCCorner + wC;

                if (xC < 0 || xC >= ${e.inWidth}) {
                  continue;
                }

                float value = getX(batch, xD, xR, xC, ch);

                // If a min / max value has already been found, use it. If not,
                // use the current value.
                float currMinMaxValue = mix(
                    value, minMaxValue, minMaxValueFound);
                if (value ${k} currMinMaxValue) {
                  minMaxValue = value;
                  minMaxValueFound = 1.0;
                  minMaxPosition = ${o?r?`(((batch * ${e.inDepth} + xD) * ${e.inHeight} + xR) * ${e.inWidth} + xC) * ${e.inChannels} + ch`:`((xD * ${e.inHeight} + xR) * ${e.inWidth} + xC) * ${e.inChannels} + ch`:`wD * ${f} * ${g} +
                      wR * ${g} + wC`};
                }
              }
            }
          }
          setOutput(float(minMaxPosition));
        }
      `;return}const w="max";let N=`${t}(${t}(${t}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;t==="avg"&&(N="avgValue / max(count, 1.0)");const I=Math.floor(a/4)*4,y=a%4,O=`
      if (${b}) {
        avgValue += dot(values, ones);
      } else {
        minMaxValue = ${w}(values, minMaxValue);
      }
    `;this.userCode=`
      const ivec3 strides =
        ivec3(${c}, ${i}, ${l});
      const ivec3 pads = ivec3(${x}, ${m}, ${C});
      const float initializationValue = ${v};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float count = 0.0;

      float getValue(int batch, int xD, int xR, int xC, int ch) {
        if (xC < 0 || xC >= ${e.inWidth}) {
          return initializationValue;
        }
        count += 1.0;
        return getX(batch, xD, xR, xC, ch);
      }

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 xCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
        int xDCorner = xCorner.x;
        int xRCorner = xCorner.y;
        int xCCorner = xCorner.z;

        // max/min x(?, ?, ?, d) to get y(yD, yR, yC, ch).
        // ? = to be determined
        vec4 minMaxValue = vec4(${v});
        float avgValue = 0.0;
        count = 0.0;

        for (int wD = 0; wD < ${h};
            wD += ${u}) {
          int xD = xDCorner + wD;

          if (xD < 0 || xD >= ${e.inDepth}) {
            continue;
          }

          for (int wR = 0; wR < ${f};
            wR += ${d}) {
            int xR = xRCorner + wR;

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${I}; wC += 4) {
              int xC = xCCorner + wC * ${p};

              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${p}, ch),
                getValue(batch, xD, xR, xC + 2 * ${p}, ch),
                getValue(batch, xD, xR, xC + 3 * ${p}, ch)
              );

              ${O}
            }

            int xC = xCCorner + ${I};
            if (${y===1}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                initializationValue,
                initializationValue,
                initializationValue
              );

              ${O}
            } else if (${y===2}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${p}, ch),
                initializationValue,
                initializationValue
              );

              ${O}
            } else if (${y===3}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${p}, ch),
                getValue(batch, xD, xR, xC + 2 * ${p}, ch),
                initializationValue
              );

              ${O}
            }
          }
        }
        setOutput(${N});
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Mh(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e;We(o,"avgPool");const{filterSize:r,strides:a,pad:c,dimRoundingMode:i}=s,l=1;F(ct(a,l),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${a} and dilations '${l}'`);const u=lt(o.shape,r,a,l,c,i);if(u.filterWidth===1&&u.filterHeight===1&&H(u.inShape,u.outShape))return Y({inputs:{x:o},backend:t});const d=new at(u,"avg",!1);return t.runWebGLProgram(d,[o],"float32")}const Gh={kernelName:Mr,backendName:"webgl",kernelFunc:Mh};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function zh(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{filterSize:r,strides:a,pad:c,dimRoundingMode:i,dataFormat:l}=s,u=[1,1,1],d=Ot(o.shape,r,a,u,c,i,l),p=new bn(d,"avg",!1);return t.runWebGLProgram(p,[o],"float32")}const Hh={kernelName:Gr,backendName:"webgl",kernelFunc:zh};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Xh{constructor(e){this.variableNames=["dy"],this.outputShape=e.inShape;const t=e.filterHeight,s=e.filterWidth,o=e.strideHeight,r=e.strideWidth,a=e.dilationHeight,c=e.dilationWidth,i=e.effectiveFilterHeight,l=e.effectiveFilterWidth,u=i-1-e.padInfo.top,d=l-1-e.padInfo.left,p=1/(t*s);this.userCode=`
      const ivec2 pads = ivec2(${u}, ${d});
      const float avgMultiplier = float(${p});

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];

        ivec2 dyRCCorner = coords.yz - pads;
        int dyRCorner = dyRCCorner.x;
        int dyCCorner = dyRCCorner.y;

        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${i};
            wR += ${a}) {
          float dyR = float(dyRCorner + wR) / ${o}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          for (int wC = 0; wC < ${l};
            wC+= ${c}) {
            float dyC = float(dyCCorner + wC) / ${r}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            float dyValue = getDy(b, idyR, idyC, d);

            dotProd += dyValue * avgMultiplier;
          }
        }
        setOutput(dotProd);
      }
    `}}class Kh{constructor(e){this.variableNames=["dy"],this.outputShape=e.inShape;const t=e.filterDepth,s=e.filterHeight,o=e.filterWidth,r=e.strideDepth,a=e.strideHeight,c=e.strideWidth,i=e.dilationDepth,l=e.dilationHeight,u=e.dilationWidth,d=e.effectiveFilterDepth,p=e.effectiveFilterHeight,h=e.effectiveFilterWidth,f=d-1-e.padInfo.front,g=p-1-e.padInfo.top,x=h-1-e.padInfo.left,m=1/(t*s*o);this.userCode=`
      const ivec3 pads = ivec3(${f}, ${g}, ${x});
      const float avgMultiplier = float(${m});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyDCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        // Convolve dy(?, ?, ?, d) with pos mask(:, :, :, ch) to get
        // dx(xD, xR, xC, ch).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int wD = 0; wD < ${d};
            wD += ${i}) {
          float dyD = float(dyDCorner + wD) / ${r}.0;

          if (dyD < 0.0 || dyD >= ${e.outDepth}.0 || fract(dyD) > 0.0) {
            continue;
          }
          int idyD = int(dyD);

          for (int wR = 0; wR < ${p};
              wR += ${l}) {
            float dyR = float(dyRCorner + wR) / ${a}.0;

            if (dyR < 0.0 || dyR >= ${e.outHeight}.0 ||
                fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            for (int wC = 0; wC < ${h};
                wC += ${u}) {
              float dyC = float(dyCCorner + wC) / ${c}.0;

              if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              float dyValue = getDy(batch, idyD, idyR, idyC, ch);

              dotProd += dyValue * avgMultiplier;
            }
          }
        }
        setOutput(dotProd);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function jh(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,input:r}=e,a=r,{filterSize:c,strides:i,pad:l,dimRoundingMode:u}=s,d=[1,1,1],p=Ot(a.shape,c,i,d,l,u),h=new Kh(p);return t.runWebGLProgram(h,[o],a.dtype)}const qh={kernelName:zr,backendName:"webgl",kernelFunc:jh};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Yh(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,input:r}=e,a=r;We([o,r],"avgPoolGrad");const{filterSize:c,strides:i,pad:l}=s,u=lt(a.shape,c,i,1,l),d=new Xh(u);return t.runWebGLProgram(d,[o],a.dtype)}const Qh={kernelName:Hr,backendName:"webgl",kernelFunc:Yh};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Zh(n){const{inputs:e,backend:t,attrs:s}=n,{a:o,b:r}=e,{transposeA:a,transposeB:c}=s;return Tt({a:o,b:r,transposeA:a,transposeB:c,backend:t})}const Jh={kernelName:Xr,backendName:"webgl",kernelFunc:Zh};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class ef{constructor(e,t,s,o,r,a){this.outputShape=[],this.variableNames=["x","mean","variance"],q(e,t),q(e,s);let c="0.0";o!=null&&(q(e,o),this.variableNames.push("offset"),c="getOffsetAtOutCoords()");let i="1.0";r!=null&&(q(e,r),this.variableNames.push("scale"),i="getScaleAtOutCoords()"),this.outputShape=e,this.userCode=`
      void main() {
        float x = getXAtOutCoords();
        float mean = getMeanAtOutCoords();
        float variance = getVarianceAtOutCoords();
        float offset = ${c};
        float scale = ${i};
        float inv = scale * inversesqrt(variance + float(${a}));
        setOutput(dot(vec3(x, -mean, offset), vec3(inv, inv, 1)));
      }
    `}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class tf{constructor(e,t,s,o,r,a){this.packedInputs=!0,this.packedOutput=!0,this.variableNames=["x","mean","variance"],q(e,t),q(e,s);let c="vec4(0.0)";o!=null&&(q(e,o),this.variableNames.push("offset"),c="getOffsetAtOutCoords()");let i="vec4(1.0)";r!=null&&(q(e,r),this.variableNames.push("scale"),i="getScaleAtOutCoords()"),this.outputShape=e,this.userCode=`
      void main() {
        vec4 offset = ${c};
        vec4 scale = ${i};

        vec4 x = getXAtOutCoords();
        vec4 mean = getMeanAtOutCoords();
        vec4 variance = getVarianceAtOutCoords();

        vec4 inv = scale * inversesqrt(variance + vec4(${a}));

        setOutput((x - mean) * inv + offset);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const nf=({inputs:n,backend:e,attrs:t})=>{const{x:s,mean:o,variance:r,offset:a,scale:c}=n;F(o.shape.length===r.shape.length,()=>"Batch normalization gradient requires mean and variance to have equal ranks."),F(a==null||o.shape.length===a.shape.length,()=>"Batch normalization gradient requires mean and offset to have equal ranks."),F(c==null||o.shape.length===c.shape.length,()=>"Batch normalization gradient requires mean and scale to have equal ranks.");let{varianceEpsilon:i}=t;i==null&&(i=.001);const l=[s,o,r];let u=null;a!=null&&(u=a.shape,l.push(a));let d=null;c!=null&&(d=c.shape,l.push(c));const p=$().getBool("WEBGL_PACK_NORMALIZATION")?new tf(s.shape,o.shape,r.shape,u,d,i):new ef(s.shape,o.shape,r.shape,u,d,i);return e.runWebGLProgram(p,l,l[0].dtype)},sf={kernelName:Kr,backendName:"webgl",kernelFunc:nf};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class of{constructor(e){this.variableNames=["source"],this.outputShape=e,this.rank=e.length;const t=D(this.rank);this.customUniforms=[{name:"start",arrayIndex:this.rank,type:"int"}];const s=rf(this.rank);let o;const r=e.map((a,c)=>`sourceLoc.${Yt[c]} = start[${c}] + coords.${Yt[c]};`);o=`
        ${t} sourceLoc;
        ${t} coords = getOutputCoords();
        ${r.join(`
`)}
      `,this.userCode=`
      void main() {
        ${o}
        setOutput(getSource(${s}));
      }
    `}}const Yt=["x","y","z","w","u","v"];function rf(n){if(n===1)return"sourceLoc";if(n<=6)return Yt.slice(0,n).map(e=>"sourceLoc."+e).join(",");throw Error(`Slicing for rank ${n} is not yet supported`)}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class af{constructor(e){this.variableNames=["source"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e,this.rank=e.length,this.customUniforms=[{name:"start",arrayIndex:this.rank,type:"int"}];const t=D(this.rank),s=M("coords",this.rank),o=M("sourceLoc",this.rank),r=this.rank===1?"sourceLoc":`vec2(${o.slice(-2).join()})`,a=`getChannel(getSource(${o.join()}), ${r})`,c=`
      result.x = ${a};
      if (++${s[this.rank-1]} < ${e[this.rank-1]}) {
        ++${o[this.rank-1]};
        result.y = ${a};
        --${o[this.rank-1]};
      }
    `,i=this.rank===1?"":`
      --${s[this.rank-1]};
      if (++${s[this.rank-2]} < ${e[this.rank-2]}) {
        ++${o[this.rank-2]};
        result.z = ${a};
        if (++${s[this.rank-1]} < ${e[this.rank-1]}) {
          ++${o[this.rank-1]};
          result.w = ${a};
        }
      }
    `,l=this.rank<=4?`sourceLoc = coords +
            ${t}(${e.map((u,d)=>`start[${d}]`).join()});`:e.map((u,d)=>`${o[d]} = ${s[d]} + start[${d}];`).join(`
`);this.userCode=`
      void main() {
        ${t} coords = getOutputCoords();
        ${t} sourceLoc;
        ${l}
        vec4 result = vec4(0.);
        ${c}
        ${i}
        setOutput(result);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function cf(n,e,t,s){const o=s.texData.get(n.dataId),r=s.makeTensorInfo(t,n.dtype),a=s.texData.get(r.dataId);Object.assign(a,o),a.refCount=1,a.shape=t,a.dtype=n.dtype;let c=rs(e,ee(n.shape));o.slice&&(c+=o.slice.flatOffset),a.slice={flatOffset:c,origDataId:o.slice&&o.slice.origDataId||n.dataId};const i=s.dataRefCount.get(a.slice.origDataId)||1;return s.dataRefCount.set(a.slice.origDataId,i+1),r}function je(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{begin:r,size:a}=s,[c,i]=qr(o,r,a);if(Yr(o,c,i),T(i)===0)return t.makeTensorInfo(i,o.dtype,[]);if(t.shouldExecuteOnCPU([o])||o.dtype==="string"){const d=t.texData.get(o.dataId),p=Zd(d.values,c,i,o.shape,o.dtype);return t.makeTensorInfo(i,o.dtype,p)}const{isPacked:l}=t.texData.get(o.dataId),u=os(o.shape,c,i);if(l||!u){const d=$().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new af(i):new of(i),p=[c];return t.runWebGLProgram(d,[o],o.dtype,p)}return t.uploadToGPU(o.dataId),cf(o,c,i,t)}const lf={kernelName:jr,backendName:"webgl",kernelFunc:je};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const uf=n=>{const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{blockShape:r,crops:a}=s;F(o.shape.length<=4,()=>"batchToSpaceND for rank > 4 with a WebGL backend not implemented yet");const c=r.reduce((C,b)=>C*b),i=as(o.shape,r,c),l=is(i.length,r.length),u=cs(o.shape,r,c),d=Zr(a,r.length),p=Jr(u,a,r.length),h=[],f=R({inputs:{x:o},backend:t,attrs:{shape:i}}),g=G({inputs:{x:f},backend:t,attrs:{perm:l}}),x=R({inputs:{x:g},backend:t,attrs:{shape:u}}),m=je({inputs:{x},backend:t,attrs:{begin:d,size:p}});return h.push(f),h.push(g),h.push(x),h.forEach(C=>t.disposeIntermediateTensorInfo(C)),m},df={kernelName:Qr,backendName:"webgl",kernelFunc:uf};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function pf(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,weights:r}=e,{size:a}=s,c=t.readSync(o.dataId),i=t.readSync(r.dataId),l=so(c,i,r.dtype,r.shape,a);return t.makeTensorInfo([a],r.dtype,l)}const hf={kernelName:ea,backendName:"webgl",kernelFunc:pf};/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const ff=`
  int r = int(a.r) & int(b.r);
  int g = int(a.g) & int(b.g);
  int rb = int(a.b) & int(b.b);
  int ra = int(a.a) & int(b.a);
  return vec4(r, g, rb, ra);
`,mf=`
  return float(int(a.r) & int(b.r));
`;function xf(n){const{inputs:e,backend:t}=n,{a:s,b:o}=e,r=$().getBool("WEBGL_PACK_BINARY_OPERATIONS"),a=$().getNumber("WEBGL_VERSION");if(t.shouldExecuteOnCPU([s,o])||a===1){const i=t.texData.get(s.dataId).values,l=t.texData.get(o.dataId).values,[u,d]=wd(s.shape,o.shape,i,l,s.dtype),p=t.makeTensorInfo(d,s.dtype),h=t.texData.get(p.dataId);return h.values=u,p}let c;return r?c=new Xe(ff,s.shape,o.shape,!1):c=new Ne(mf,s.shape,o.shape),t.runWebGLProgram(c,[s,o],s.dtype)}const gf={kernelName:ta,backendName:"webgl",kernelFunc:xf};/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Cf(n){const{inputs:e,backend:t}=n,{s0:s,s1:o}=e,r=t.readSync(s.dataId),a=t.readSync(o.dataId),c=q(Array.from(r),Array.from(a));return t.makeTensorInfo([c.length],"int32",Int32Array.from(c))}const vf={kernelName:na,backendName:"webgl",kernelFunc:Cf};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const bf="return float(a != b);",Co=B({opSnippet:bf,cpuKernelImpl:Gd,dtype:"bool"}),$f={kernelName:sa,backendName:"webgl",kernelFunc:Co};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function pt(n){const{inputs:e,backend:t}=n,{input:s}=e,o=t.texData.get(s.dataId);return Y({inputs:{x:o.complexTensorInfos.real},backend:t})}const wf={kernelName:oa,backendName:"webgl",kernelFunc:pt};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Rf="return float(int(x));";function Sf(n,e){const t=new ue(n.shape,Rf),s=e.runWebGLProgram(t,[n],"int32");return{dataId:s.dataId,shape:s.shape,dtype:s.dtype}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Qt(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{dtype:r}=s;if(r==="complex64"){if(o.dtype==="complex64")return Y({inputs:{x:o},backend:t});const a=aa(o.shape),c=Qt({inputs:{x:o},backend:t,attrs:{dtype:"float32"}}),i=$e({inputs:{real:c,imag:a},backend:t});return a.dispose(),t.disposeIntermediateTensorInfo(c),i}if(o.dtype==="complex64"){const a=pt({inputs:{input:o},backend:t}),c=Qt({inputs:{x:a},backend:t,attrs:{dtype:r}});return t.disposeIntermediateTensorInfo(a),c}if(!ia(o.dtype,r)){const a=Y({inputs:{x:o},backend:t});return{dataId:a.dataId,shape:a.shape,dtype:r}}if(t.shouldExecuteOnCPU([o])){const a=t.texData.get(o.dataId).values,[c,i,l]=Rd(a,o.shape,o.dtype,r);return t.makeTensorInfo(c,i,l)}if(r==="int32")return Sf(o,t);if(r==="bool"){const a=t.makeTensorInfo([],"bool",ye("bool",1)),i=Co({inputs:{a:o,b:a},backend:t});return t.disposeIntermediateTensorInfo(a),i}throw new Error(`Error in Cast: failed to cast ${o.dtype} to ${r}`)}const yf={kernelName:ra,backendName:"webgl",kernelFunc:Qt};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const zn="return ceil(x);",If=P({opSnippet:zn,packedOpSnippet:zn,cpuKernelImpl:Sd}),Tf={kernelName:ca,backendName:"webgl",kernelFunc:If};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Ef{constructor(e){this.variableNames=["A"],this.customUniforms=[{name:"minVal",type:"float"},{name:"maxVal",type:"float"}],this.outputShape=e,this.userCode=`

      void main() {
        float value = getAAtOutCoords();
        if (isnan(value)) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, minVal, maxVal));
      }
    `}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Nf{constructor(e){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"minVal",type:"float"},{name:"maxVal",type:"float"}],this.outputShape=e,this.userCode=`
      void main() {
        vec4 value = getAAtOutCoords();

        if (any(isnan(value))) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, vec4(minVal), vec4(maxVal)));
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function kf(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{clipValueMin:r,clipValueMax:a}=s;let c;$().getBool("WEBGL_PACK_CLIP")?c=new Nf(o.shape):c=new Ef(o.shape);const i=[[r],[a]];return t.runWebGLProgram(c,[o],o.dtype,i)}const Of={kernelName:la,backendName:"webgl",kernelFunc:kf};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Pf{constructor(e){this.variableNames=["real","imag"],this.outputShape=e,this.userCode=`
      void main() {
        float re = abs(getRealAtOutCoords());
        float im = abs(getImagAtOutCoords());
        float mx = max(re, im);

        // sadly the length function in glsl is not underflow-safe
        // (at least not on Intel GPUs). So the safe solution is
        // to ensure underflow-safety in all cases.
        setOutput(
          mx == 0.0 ? 0.0 : mx * length(vec2(1, min(re, im)/mx))
        );
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Hn(n,e){return{dataId:e.dataId,dtype:e.dtype,shape:n.shape}}function Df(n){const{inputs:e,backend:t}=n,{x:s}=e,o=t.texData.get(s.dataId),r=new Pf(s.shape),a=[Hn(s,o.complexTensorInfos.real),Hn(s,o.complexTensorInfos.imag)];return t.runWebGLProgram(r,a,a[0].dtype)}const Af={kernelName:ua,backendName:"webgl",kernelFunc:Df};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Ff{constructor(e){this.outputShape=[],this.outputShape=Be(e,1),this.variableNames=e.map((a,c)=>`T${c}`);const t=new Array(e.length-1);t[0]=e[0][1];for(let a=1;a<t.length;a++)t[a]=t[a-1]+e[a][1];const s=[`if (yC < ${t[0]}) setOutput(getT0(yR, yC));`];for(let a=1;a<t.length;a++){const c=t[a-1];s.push(`else if (yC < ${t[a]}) setOutput(getT${a}(yR, yC-${c}));`)}const o=t.length,r=t[t.length-1];s.push(`else setOutput(getT${o}(yR, yC-${r}));`),this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int yR = coords.x;
        int yC = coords.y;

        ${s.join(`
        `)}
      }
    `}}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class _f{constructor(e,t){this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[],this.outputShape=Be(e,t);const s=this.outputShape,o=s.length,r=D(o),a=M("coords",o),c=["x","y","z","w","u","v"].slice(0,o);this.variableNames=e.map((g,x)=>`T${x}`);const i=new Array(e.length-1);i[0]=e[0][t];for(let g=1;g<i.length;g++)i[g]=i[g-1]+e[g][t];const l=c[t],u=c.slice(-2),d=c.join();let p=`if (${l} < ${i[0]}) {
        return getChannel(
            getT0(${d}), vec2(${u.join()}));
        }`;for(let g=1;g<i.length;g++){const x=i[g-1];p+=`
        if (${l} < ${i[g]}  && ${l} >= ${i[g-1]}) {
          return getChannel(
            getT${g}(${vt(c,l,x)}),
            vec2(${vt(u,l,x)}));
        }`}const h=i.length,f=i[i.length-1];p+=`
        return getChannel(
          getT${h}(${vt(c,l,f)}),
          vec2(${vt(u,l,f)}));`,this.userCode=`
      float getValue(${c.map(g=>"int "+g)}) {
        ${p}
      }

      void main() {
        ${r} coords = getOutputCoords();
        vec4 result = vec4(getValue(${a}), 0., 0., 0.);

        ${a[o-1]} = ${a[o-1]} + 1;
        if (${a[o-1]} < ${s[o-1]}) {
          result.g = getValue(${a});
        }

        ${a[o-2]} = ${a[o-2]} + 1;
        if (${a[o-2]} < ${s[o-2]}) {
          result.a = getValue(${a});
        }

        ${a[o-1]} = ${a[o-1]} - 1;
        if (${a[o-2]} < ${s[o-2]} &&
            ${a[o-1]} < ${s[o-1]}) {
          result.b = getValue(${a});
        }
        setOutput(result);
      }
    `}}function vt(n,e,t){const s=n.indexOf(e);return n.map((r,a)=>a===s?`${r} - ${t}`:r).join()}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Lt(n){const{inputs:e,backend:t}=n,{input:s}=e,o=t.texData.get(s.dataId);return Y({inputs:{x:o.complexTensorInfos.imag},backend:t})}const Lf={kernelName:da,backendName:"webgl",kernelFunc:Lt};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function et(n,e,t){const s=n[0].dtype;if(s==="complex64"){const h=n.map(C=>pt({inputs:{input:C},backend:t})),f=n.map(C=>Lt({inputs:{input:C},backend:t})),g=et(h,e,t),x=et(f,e,t),m=$e({inputs:{real:g,imag:x},backend:t});return h.forEach(C=>t.disposeIntermediateTensorInfo(C)),f.forEach(C=>t.disposeIntermediateTensorInfo(C)),t.disposeIntermediateTensorInfo(g),t.disposeIntermediateTensorInfo(x),m}let o=t.shouldExecuteOnCPU(n);if(s==="string"&&(o=!0),o){const h=n.map(v=>{const N=[-1,T(v.shape.slice(e))];return R({inputs:{x:v},backend:t,attrs:{shape:N}})}),f=h.map(v=>({vals:t.readSync(v.dataId),shape:v.shape})),g=Be(h.map(v=>v.shape),1),x=h[0].shape[0]===1,m=yd(f,g,s,x),C=Be(n.map(v=>v.shape),e),b=t.makeTensorInfo(C,s,m);return h.forEach(v=>t.disposeIntermediateTensorInfo(v)),b}const r=n.filter(h=>T(h.shape)>0),a=$().getBool("WEBGL_PACK_ARRAY_OPERATIONS")&&r[0].shape.length>1;if(r.length===1){const h=a?new ue(n[0].shape,ge):new Ce(n[0].shape,ge);return t.runWebGLProgram(h,n,s)}const c=$().getNumber("WEBGL_MAX_TEXTURES_IN_SHADER");if(r.length>c){const h=[];for(let g=0;g<r.length;g+=c){const x=r.slice(g,g+c);h.push(et(x,e,t))}const f=et(h,e,t);for(const g of h)t.disposeIntermediateTensorInfo(g);return f}if(a){const h=new _f(r.map(f=>f.shape),e);return t.runWebGLProgram(h,r,s)}const{tensors2D:i,outShape:l}=Bf(r,e,t),u=new Ff(i.map(h=>h.shape)),d=t.runWebGLProgram(u,i,s);i.forEach(h=>t.disposeIntermediateTensorInfo(h));const p=R({inputs:{x:d},attrs:{shape:l},backend:t});return t.disposeIntermediateTensorInfo(d),p}function Bf(n,e,t){const s=Be(n.map(r=>r.shape),e);return{tensors2D:n.map(r=>R({inputs:{x:r},attrs:{shape:[-1,T(r.shape.slice(e))]},backend:t})),outShape:s}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function vo(n){const{inputs:e,backend:t,attrs:s}=n,{axis:o}=s,r=K(o,e[0].shape)[0],a=e.map(l=>l.shape);ha(a,r);const c=Be(e.map(l=>l.shape),r);if(T(c)===0)return t.makeTensorInfo(c,e[0].dtype,[]);const i=e.filter(l=>T(l.shape)>0);return i.length===1?Y({inputs:{x:i[0]},backend:t}):et(i,r,t)}const Vf={kernelName:pa,backendName:"webgl",kernelFunc:vo};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class bo{constructor(e,t=!1,s=null,o=!1,r=!1){this.variableNames=["x","W"],this.outputShape=e.outShape;const a=e.padInfo.top,c=e.padInfo.left,i=e.strideHeight,l=e.strideWidth,u=e.dilationHeight,d=e.dilationWidth,p=e.filterHeight,h=e.filterWidth,f=Math.floor(e.inChannels/4)*4,g=e.inChannels%4,x=e.dataFormat==="channelsLast",m=x?1:2,C=x?2:3,b=x?3:1;let v="",w="";s&&(o?v=`float activation(float a) {
          float b = getPreluActivationWeightsAtOutCoords();
          ${s}
        }`:r?v=`float activation(float a) {
          float b = getLeakyreluAlphaAtOutCoords();
          ${s}
        }`:v=`
          float activation(float x) {
            ${s}
          }
        `,w="result = activation(result);");const N=t?"result += getBiasAtOutCoords();":"";t&&this.variableNames.push("bias"),o&&this.variableNames.push("preluActivationWeights"),r&&this.variableNames.push("leakyreluAlpha"),this.userCode=`
      ${v}

      const ivec2 strides = ivec2(${i}, ${l});
      const ivec2 pads = ivec2(${a}, ${c});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d2 = coords[${b}];

        ivec2 xRCCorner =
            ivec2(coords[${m}], coords[${C}]) * strides - pads;
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // Convolve x(?, ?, d1) with w(:, :, d1, d2) to get y(yR, yC, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${p}; wR++) {
          int xR = xRCorner + wR * ${u};

          if (xR < 0 || xR >= ${e.inHeight}) {
            continue;
          }

          for (int wC = 0; wC < ${h}; wC++) {
            int xC = xCCorner + wC * ${d};

            if (xC < 0 || xC >= ${e.inWidth}) {
              continue;
            }

            for (int d1 = 0; d1 < ${f}; d1 += 4) {
              vec4 wValues = vec4(
                getW(wR, wC, d1, d2),
                getW(wR, wC, d1 + 1, d2),
                getW(wR, wC, d1 + 2, d2),
                getW(wR, wC, d1 + 3, d2)
              );

              if (${x}) {
                vec4 xValues = vec4(
                  getX(batch, xR, xC, d1),
                  getX(batch, xR, xC, d1 + 1),
                  getX(batch, xR, xC, d1 + 2),
                  getX(batch, xR, xC, d1 + 3)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec4 xValues = vec4(
                  getX(batch, d1, xR, xC),
                  getX(batch, d1 + 1, xR, xC),
                  getX(batch, d1 + 2, xR, xC),
                  getX(batch, d1 + 3, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }
            }

            if (${g===1}) {

              if (${x}) {
                dotProd +=
                    getX(batch, xR, xC, ${f}) *
                    getW(wR, wC, ${f}, d2);
              } else {
                dotProd +=
                    getX(batch, ${f}, xR, xC) *
                    getW(wR, wC, ${f}, d2);
              }

            } else if (${g===2}) {
              vec2 wValues = vec2(
                getW(wR, wC, ${f}, d2),
                getW(wR, wC, ${f} + 1, d2)
              );

              if (${x}) {
                vec2 xValues = vec2(
                  getX(batch, xR, xC, ${f}),
                  getX(batch, xR, xC, ${f} + 1)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec2 xValues = vec2(
                  getX(batch, ${f}, xR, xC),
                  getX(batch, ${f} + 1, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }

            } else if (${g===3}) {
              vec3 wValues = vec3(
                getW(wR, wC, ${f}, d2),
                getW(wR, wC, ${f} + 1, d2),
                getW(wR, wC, ${f} + 2, d2)
              );

              if (${x}) {
                vec3 xValues = vec3(
                  getX(batch, xR, xC, ${f}),
                  getX(batch, xR, xC, ${f} + 1),
                  getX(batch, xR, xC, ${f} + 2)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec3 xValues = vec3(
                  getX(batch, ${f}, xR, xC),
                  getX(batch, ${f} + 1, xR, xC),
                  getX(batch, ${f} + 2, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }

            }
          }
        }

        float result = dotProd;
        ${N}
        ${w}
        setOutput(result);
      }
    `}}class Uf{constructor(e){this.variableNames=["x","W"],this.outputShape=e.outShape;const t=e.padInfo.front,s=e.padInfo.top,o=e.padInfo.left,r=e.strideDepth,a=e.strideHeight,c=e.strideWidth,i=e.dilationDepth,l=e.dilationHeight,u=e.dilationWidth,d=e.filterDepth,p=e.filterHeight,h=e.filterWidth,f=Math.floor(e.inChannels/4)*4,g=e.inChannels%4;this.userCode=`
      const ivec3 strides = ivec3(${r}, ${a}, ${c});
      const ivec3 pads = ivec3(${t}, ${s}, ${o});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int d2 = coords.u;

        ivec3 xFRCCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
        int xFCorner = xFRCCorner.x;
        int xRCorner = xFRCCorner.y;
        int xCCorner = xFRCCorner.z;

        // Convolve x(?, ?, ?, d1) with w(:, :, :, d1, d2) to get
        // y(yF, yR, yC, d2). ? = to be determined. : = across all
        // values in that axis.
        float dotProd = 0.0;
        for (int wF = 0; wF < ${d}; wF++) {
          int xF = xFCorner + wF * ${i};

          if (xF < 0 || xF >= ${e.inDepth}) {
            continue;
          }

          for (int wR = 0; wR < ${p}; wR++) {
            int xR = xRCorner + wR * ${l};

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${h}; wC++) {
              int xC = xCCorner + wC * ${u};

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              for (int d1 = 0; d1 < ${f}; d1 += 4) {
                vec4 xValues = vec4(
                  getX(batch, xF, xR, xC, d1),
                  getX(batch, xF, xR, xC, d1 + 1),
                  getX(batch, xF, xR, xC, d1 + 2),
                  getX(batch, xF, xR, xC, d1 + 3)
                );
                vec4 wValues = vec4(
                  getW(wF, wR, wC, d1, d2),
                  getW(wF, wR, wC, d1 + 1, d2),
                  getW(wF, wR, wC, d1 + 2, d2),
                  getW(wF, wR, wC, d1 + 3, d2)
                );

                dotProd += dot(xValues, wValues);
              }

              if (${g===1}) {
                dotProd +=
                  getX(batch, xF, xR, xC, ${f}) *
                  getW(wF, wR, wC, ${f}, d2);
              } else if (${g===2}) {
                vec2 xValues = vec2(
                  getX(batch, xF, xR, xC, ${f}),
                  getX(batch, xF, xR, xC, ${f} + 1)
                );
                vec2 wValues = vec2(
                  getW(wF, wR, wC, ${f}, d2),
                  getW(wF, wR, wC, ${f} + 1, d2)
                );
                dotProd += dot(xValues, wValues);
              } else if (${g===3}) {
                vec3 xValues = vec3(
                  getX(batch, xF, xR, xC, ${f}),
                  getX(batch, xF, xR, xC, ${f} + 1),
                  getX(batch, xF, xR, xC, ${f} + 2)
                );
                vec3 wValues = vec3(
                  getW(wF, wR, wC, ${f}, d2),
                  getW(wF, wR, wC, ${f} + 1, d2),
                  getW(wF, wR, wC, ${f} + 2, d2)
                );
                dotProd += dot(xValues, wValues);
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}}/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class $o{constructor(e,t=!1,s=null,o=!1,r=!1){this.variableNames=["x","W"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"pads",type:"ivec2"},{name:"strides",type:"ivec2"},{name:"dilations",type:"ivec2"},{name:"inDims",type:"ivec2"}],this.outputShape=e.outShape,this.enableShapeUniforms=U(this.outputShape.length);const a=e.padInfo.left,c=e.strideWidth,i=e.dilationWidth,l=e.filterHeight,u=e.filterWidth,d=u;let p=`
       int xR; int xC; int xCOffset;
       vec4 wTexel; vec4 previous; vec4 final;`;for(let x=0;x<u;x++)p+=`
           vec4 xTexelC${x*2};
           int xTexelC${x*2}Ready;
           vec4 xTexelC${x*2+1};
           int xTexelC${x*2+1}Ready;
           vec4 xC${x};`;p+=`
     for (int r = 0; r < ${l}; r++) {
      for (int d1 = 0; d1 < ${e.inChannels}; d1 += 2) {
       `;for(let x=0;x<u;x++)p+=`
           xTexelC${x*2} = vec4(0.0);
           xTexelC${x*2}Ready = 0;
           xTexelC${x*2+1} = vec4(0.0);
           xTexelC${x*2+1}Ready = 0;
           xC${x} = vec4(0.0);`;p+=`
         xR = xRCorner + r * dilations[0];
         if (xR >=0 && xR < inDims[0]) {
       `;for(let x=0;x<(d+1)/2;x++){const m=x*2;if(p+=`
           xC = xCCorner + ${m*i};
           `,c===1){if(m<u&&(a%2===1?(p+=`
                 xCOffset = xC + 1;
                 if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${m}Ready == 0) {
                   xTexelC${m} = getX(batch, xR, xCOffset, d1);

                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${m}.zw = vec2(0.0);
                   }
                   xTexelC${m}Ready = 1;
                 }
               `,i===1&&m>0?p+=`
                 xC${m} = vec4(xTexelC${m-2}.zw, xTexelC${m}.xy);
                 `:p+=`
                   xCOffset = xC + 1 - 2;

                   if (xCOffset >= 0 && xCOffset < inDims[1]) {
                     previous = getX(batch, xR, xCOffset, d1);

                     // Need to manually clear unused channels in case
                     // we're reading from recycled texture.
                     if (xCOffset + 1 >= inDims[1]) {
                       previous.zw = vec2(0.0);
                     }

                     xC${m} = vec4(previous.zw, xTexelC${m}.xy);
                   } else {
                     xC${m} = vec4(0.0, 0.0, xTexelC${m}.xy);
                   }
                   `):p+=`
                 if (xC >= 0 && xC < inDims[1] && xTexelC${m}Ready == 0) {
                   xTexelC${m} = getX(batch, xR, xC, d1);
                   if (xC + 1 >= inDims[1]) {
                     xTexelC${m}.zw = vec2(0.0);
                   }
                   xTexelC${m}Ready = 1;
                 }

                 xC${m} = xTexelC${m};
                 `,m+1<u)){const C=a%2===0?Jt(i):i;i%2===0&&a%2===1||i%2!==0&&a%2!==1?(p+=`
                   xCOffset = xC + imod(pads[1], 2) + ${C};

                   if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${m+1}Ready == 0) {
                     xTexelC${m+1} = getX(batch, xR, xCOffset, d1);

                     // Need to manually clear unused channels in case
                     // we're reading from recycled texture.
                     if (xCOffset + 1 >= inDims[1]) {
                       xTexelC${m+1}.zw = vec2(0.0);
                     }
                     xTexelC${m+1}Ready = 1;
                   }
                   `,i>1?p+=`
                     xCOffset -= 2;
                     if (xCOffset >= 0 && xCOffset < inDims[1]) {
                      previous = getX(batch, xR, xCOffset, d1);
                      xC${m+1} = vec4(previous.zw, xTexelC${m+1}.xy);
                     } else {
                      xC${m+1} = vec4(0.0, 0.0, xTexelC${m+1}.xy);
                     }
                     `:p+=`
                     xC${m+1} = vec4(xTexelC${m}.zw, xTexelC${m+1}.xy);
                     `):C===1?p+=`
                     xC${m+1} = xTexelC${m};
                     `:p+=`
                     xCOffset = xC + ${C};

                     if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${m+1}Ready == 0) {
                       xTexelC${m+1} = getX(batch, xR, xCOffset, d1);
                       if (xCOffset + 1 >= inDims[1]) {
                         xTexelC${m+1}.zw = vec2(0.0);
                       }
                       xTexelC${m+1}Ready = 1;
                     }

                     xC${m+1} = xTexelC${m+1};
                     `}}else m<u&&(a%2===1?(p+=`
                 xCOffset = xC + 1 - strides[1];
                 if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${m}Ready == 0) {
                   xTexelC${m} = getX(batch, xR, xCOffset, d1);
                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${m}.zw = vec2(0.0);
                   }
                   xTexelC${m}Ready = 1;
                 }

                 if(xC + 1 >= 0 && xC + 1 < inDims[1] && xTexelC${m+1}Ready == 0) {
                   xTexelC${m+1} = getX(batch, xR, xC + 1, d1);
                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xC + 2 >= inDims[1]) {
                     xTexelC${m+1}.zw = vec2(0.0);
                   }
                   xTexelC${m+1}Ready = 1;
                 }

                 xC${m} = vec4(xTexelC${m}.zw, xTexelC${m+1}.zw);
               `,m+1<u&&(p+=`
                   final = vec4(0.0);
                   xCOffset = xC + 1 + strides[1];
                   if(xCOffset >= 0 && xCOffset < inDims[1]) {
                     final = getX(batch, xR, xCOffset, d1);
                   }
                   xC${m+1} = vec4(xTexelC${m+1}.xy, final.xy);
                 `)):(p+=`
                 if(xC >= 0 && xC < inDims[1] && xTexelC${m}Ready == 0) {
                   xTexelC${m} = getX(batch, xR, xC, d1);
                   if (xC + 1 >= inDims[1]) {
                     xTexelC${m}.zw = vec2(0.0);
                   }
                   xTexelC${m}Ready = 1;
                 }

                 xCOffset = xC + strides[1];
                 if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${m+1}Ready == 0) {
                   xTexelC${m+1} = getX(batch, xR, xCOffset, d1);
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${m+1}.zw = vec2(0.);
                   }
                   xTexelC${m+1}Ready = 1;
                 }

                 xC${m} = vec4(
                   xTexelC${m}.xy, xTexelC${m+1}.xy);
               `,m+1<u&&(p+=`
                   xC${m+1} = vec4(xTexelC${m}.zw, xTexelC${m+1}.zw);
                 `)));m<u&&(p+=`
             wTexel = getW(r, ${m}, d1, d2);
             dotProd += xC${m}.xxzz * vec4(wTexel.xy, wTexel.xy);
             if(d1 + 1 < ${e.inChannels}) {
               dotProd += xC${m}.yyww * vec4(wTexel.zw, wTexel.zw);
             }
           `,m+1<u&&(p+=`
               wTexel = getW(r, ${m+1}, d1, d2);
               dotProd += xC${m+1}.xxzz * vec4(wTexel.xy, wTexel.xy);
               if(d1 + 1 < ${e.inChannels}) {
                 dotProd += xC${m+1}.yyww * vec4(wTexel.zw, wTexel.zw);
               }
             `))}p+=`
     }
   `,p+=`
     }
   `,p+=`
     }
   `;let h="",f="";s&&(o?h=`vec4 activation(vec4 a) {
           vec4 b = getPreluActivationWeightsAtOutCoords();
           ${s}
         }`:r?h=`vec4 activation(vec4 a) {
           vec4 b = getLeakyreluAlphaAtOutCoords();
           ${s}
         }`:h=`vec4 activation(vec4 x) {
           ${s}
         }`,f="result = activation(result);");const g=t?"result += getBiasAtOutCoords();":"";t&&this.variableNames.push("bias"),o&&this.variableNames.push("preluActivationWeights"),r&&this.variableNames.push("leakyreluAlpha"),this.userCode=`
       ${h}

       void main() {
         ivec4 coords = getOutputCoords();
         int batch = coords.x;
         ivec2 xRCCorner = coords.yz * strides - pads;
         int d2 = coords.w;
         int xRCorner = xRCCorner.x;
         int xCCorner = xRCCorner.y;

         //intialize dotProd with a small epsilon seems to reduce GPU accuracy loss.
         vec4 dotProd = vec4(0.000000000000001);

         ${p}

         vec4 result = dotProd - vec4(0.000000000000001);
         ${g}
         ${f}
         setOutput(result);
       }
     `}}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Wf{constructor(e,t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"inputShape",type:"ivec4"},{name:"pad",type:"ivec2"},{name:"stride",type:"ivec2"},{name:"dilation",type:"ivec2"},{name:"inChannels",type:"int"},{name:"itemsPerBlockRow",type:"int"},{name:"outWidth",type:"int"}],this.outputShape=e,this.enableShapeUniforms=U(this.outputShape.length);const{dataFormat:s}=t,o=z(),r=s==="channelsLast",a=r?1:2,c=r?2:3,i=this.enableShapeUniforms?"if(blockIndex < outShape[2] && pos < outShape[1]) {":`if(blockIndex < ${e[2]} && pos < ${e[1]}) {`;let l="";for(let u=0;u<=1;u++)for(let d=0;d<=1;d++)l+=`
          blockIndex = rc.z + ${d};
          pos = rc.y + ${u};

          ${i}
            offsetY = int(blockIndex / outWidth) * stride[0] - pad[0];
            d0 = offsetY + dilation[0] * (pos / itemsPerBlockRow);

            if(d0 < inputShape[${a}] && d0 >= 0) {
              // Use custom imod instead mod. On Intel GPU, mod may generate
              // unexpected value.
              // https://github.com/tensorflow/tfjs/issues/5447
              offsetX = imod(blockIndex, outWidth) * stride[1] - pad[1];
              d1 = offsetX + dilation[1] * (imod(pos, itemsPerBlockRow) /
                  inChannels);

              if(d1 < inputShape[${c}] && d1 >= 0) {

                ch = imod(pos, inChannels);

                if (${r}) {
                  innerDims = vec2(d1, ch);
                  result[${u*2+d}] = getChannel(
                    getA(rc.x, d0, int(innerDims.x),
                    int(innerDims.y)), innerDims);
                } else {
                  innerDims = vec2(d0, d1);
                  result[${u*2+d}] = getChannel(
                    getA(rc.x, ch, int(innerDims.x),
                    int(innerDims.y)), innerDims);
                }
              }
            }
          }
        `;this.userCode=`
      void main() {
        ivec3 rc = getOutputCoords();

        vec4 result = vec4(0);

        int blockIndex, pos, offsetY, d0, offsetX, d1, ch;
        vec2 innerDims;

        ${l}

        ${o.output} = result;
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Et(n,e){const t=n.length;return t>=3?e?[...n.slice(0,-3),n[t-3]*n[t-2],n[t-1]]:[...n.slice(0,-3),n[t-3],n[t-2]*n[t-1]]:!e&&t===1&&n[0]>1?[n[0],1]:null}function wo({x:n,filter:e,convInfo:t,backend:s,bias:o=null,preluActivationWeights:r=null,leakyreluAlpha:a=0,activation:c=null}){const i=n.shape,l=s.texData.get(n.dataId),u=t.inChannels,d=i[0]*i[1]*i[2],p=t.outChannels,h=t.dataFormat==="channelsLast",f=!1,g=!1;let x;const m=[];if(r!=null){const v=Et(r.shape,h);v!=null&&(r=R({inputs:{x:r},backend:s,attrs:{shape:v}}),m.push(r))}if(o!=null){const v=Et(o.shape,h);v!=null&&(o=R({inputs:{x:o},backend:s,attrs:{shape:v}}),m.push(o))}if(!((d===1||p===1)&&u>fo)&&l.isPacked&&h&&l.texture!=null&&i[2]%2!==0&&H(l.shape.slice(-3),i.slice(-3))){const v=i[0]*i[1]*(i[2]+1),w={dataId:n.dataId,shape:[1,v,t.inChannels],dtype:n.dtype},N=l.shape;l.shape=l.shape.slice(),l.shape[l.shape.length-2]++,F(ot(l.shape,w.shape),()=>`packed reshape ${l.shape} to ${w.shape} isn't free`);const I=R({inputs:{x:e},backend:s,attrs:{shape:[1,t.inChannels,t.outChannels]}});m.push(I);const y=Tt({a:w,b:I,backend:s,transposeA:f,transposeB:g,bias:o,activation:c,preluActivationWeights:r,leakyreluAlpha:a}),O=s.texData.get(y.dataId);F(O.isPacked,()=>"batchMatMul result is expected to be packed"),l.shape=N,O.shape=t.outShape,x=Y({inputs:{x:y},backend:s}),x.shape=t.outShape,m.push(y)}else{const v=t.outHeight*t.outWidth,w=R({inputs:{x:n},backend:s,attrs:{shape:h?[t.batchSize,v,t.inChannels]:[t.batchSize,t.inChannels,v]}}),N=R({inputs:{x:e},backend:s,attrs:{shape:[1,t.inChannels,t.outChannels]}}),I=Tt({a:h?w:N,b:h?N:w,transposeA:!h,transposeB:g,backend:s,bias:o,activation:c,preluActivationWeights:r,leakyreluAlpha:a});x=R({inputs:{x:I},backend:s,attrs:{shape:t.outShape}}),m.push(w),m.push(N),m.push(I)}for(const v of m)s.disposeIntermediateTensorInfo(v);return x}function Ro({x:n,filter:e,convInfo:t,backend:s,bias:o=null,preluActivationWeights:r=null,leakyreluAlpha:a=0,activation:c=null}){const{filterWidth:i,filterHeight:l,inChannels:u,outWidth:d,outHeight:p,dataFormat:h}=t,f=h==="channelsLast",g=i*l*u,x=p*d,m=[t.batchSize,g,x],C=!0,b=!1,v=[];if(r!=null){const W=Et(r.shape,f);W!=null&&(r=R({inputs:{x:r},backend:s,attrs:{shape:W}}),v.push(r))}if(o!=null){const W=Et(o.shape,f);W!=null&&(o=R({inputs:{x:o},backend:s,attrs:{shape:W}}),v.push(o))}const w=R({inputs:{x:e},backend:s,attrs:{shape:[1,g,T(e.shape)/g]}});v.push(w);const N=new Wf(m,t),I=[n.shape,[t.padInfo.top,t.padInfo.left],[t.strideHeight,t.strideWidth],[t.dilationHeight,t.dilationWidth],[t.inChannels],[t.filterWidth*t.inChannels],[t.outWidth]],y=s.runWebGLProgram(N,[n],"float32",I),O=R({inputs:{x:y},backend:s,attrs:{shape:m}});v.push(y),v.push(O);const k=o!=null,A=r!=null,_=c==="leakyrelu",le=c?rt(c,!0):null,j=new ho(f?O.shape:w.shape,f?w.shape:O.shape,f?[t.batchSize,x,t.outChannels]:[t.batchSize,t.outChannels,x],C,b,k,le,A,_),Q=f?[O,w]:[w,O];if(o&&Q.push(o),A&&Q.push(r),_){const W=s.makeTensorInfo([],"float32",Ve(a,"float32"));Q.push(W),v.push(W)}const ne=s.runWebGLProgram(j,Q,"float32"),re=R({inputs:{x:ne},backend:s,attrs:{shape:t.outShape}});v.push(ne);for(const W of v)s.disposeIntermediateTensorInfo(W);return re}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Mf(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r}=e,{strides:a,pad:c,dataFormat:i,dilations:l,dimRoundingMode:u}=s,d=Pt(i),p=be(o.shape,r.shape,a,l,c,u,!1,d);let h;if(p.filterHeight===1&&p.filterWidth===1&&p.dilationHeight===1&&p.dilationWidth===1&&p.strideHeight===1&&p.strideWidth===1&&(p.padInfo.type==="SAME"||p.padInfo.type==="VALID"))h=wo({x:o,filter:r,convInfo:p,backend:t});else if(p.strideWidth<=2&&d==="channelsLast"&&$().getBool("WEBGL_EXP_CONV")){const g=new $o(p),x=[[p.padInfo.top,p.padInfo.left],[p.strideHeight,p.strideWidth],[p.dilationHeight,p.dilationWidth],[p.inHeight,p.inWidth]];h=t.runWebGLProgram(g,[o,r],"float32",x)}else if($().getBool("WEBGL_CONV_IM2COL"))h=Ro({x:o,filter:r,convInfo:p,backend:t});else{const g=new bo(p);h=t.runWebGLProgram(g,[o,r],"float32")}const f=R({inputs:{x:h},backend:t,attrs:{shape:p.outShape}});return t.disposeIntermediateTensorInfo(h),f}const Gf={kernelName:fa,backendName:"webgl",kernelFunc:Mf};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class zf{constructor(e){this.variableNames=["x","dy"],this.outputShape=e.filterShape;const t=e.strideHeight,s=e.strideWidth,o=e.padInfo.top,r=e.padInfo.left,a=e.dataFormat==="channelsLast";this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int wR = coords.x;
        int wC = coords.y;
        int d1 = coords.z;
        int d2 = coords.w;

        // Convolve x(?, ?, d1) with dy(:, :, d2) to get dw(wR, wC, d1, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int b = 0; b < ${e.batchSize}; b++) {
          for (int yR = 0; yR < ${e.outHeight}; yR++) {
            int xR = wR + yR * ${t} - ${o};

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int yC = 0; yC < ${e.outWidth}; yC++) {
              int xC = wC + yC * ${s} - ${r};

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              ${a?`float dyValue = getDy(b, yR, yC, d2);
              float xValue = getX(b, xR, xC, d1);
              dotProd += (xValue * dyValue);`:`float dyValue = getDy(b, d2, yR, yC);
              float xValue = getX(b, d1, xR, xC);
              dotProd += (xValue * dyValue);`}
            }
          }
        }
        setOutput(dotProd);
      }
    `}}class Hf{constructor(e){this.variableNames=["dy","W"],this.outputShape=e.inShape;const t=e.filterHeight,s=e.filterWidth,o=e.strideHeight,r=e.strideWidth,a=e.dataFormat==="channelsLast",c=t-1-e.padInfo.top,i=s-1-e.padInfo.left,l=a?1:2,u=a?2:3,d=a?3:1;this.userCode=`
      const ivec2 pads = ivec2(${c}, ${i});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[${d}];

        ivec2 dyCorner = ivec2(coords[${l}], coords[${u}]) - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${t}; wR++) {
          float dyR = float(dyRCorner + wR) / ${o}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          int wRPerm = ${t} - 1 - wR;

          for (int wC = 0; wC < ${s}; wC++) {
            float dyC = float(dyCCorner + wC) / ${r}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            int wCPerm = ${s} - 1 - wC;

            for (int d2 = 0; d2 < ${e.outChannels}; d2++) {

              if (${a}) {
                float xValue = getDy(batch, idyR, idyC, d2);
                float wValue = getW(wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              } else {
                float xValue = getDy(batch, d2, idyR, idyC);
                float wValue = getW(wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              }

            }
          }
        }
        setOutput(dotProd);
      }
    `}}class Xf{constructor(e){this.variableNames=["x","dy"],this.outputShape=e.filterShape;const t=e.strideDepth,s=e.strideHeight,o=e.strideWidth,r=e.padInfo.front,a=e.padInfo.top,c=e.padInfo.left;this.userCode=`
      void main() {
        ivec5 coords = getOutputCoords();
        int wF = coords.x;
        int wR = coords.y;
        int wC = coords.z;
        int d1 = coords.w;
        int d2 = coords.u;

        float dotProd = 0.0;

        for (int b = 0; b < ${e.batchSize}; b++) {
          for (int yF = 0; yF < ${e.outDepth}; yF++) {
            int xF = wF + yF * ${t} - ${r};

            if (xF < 0 || xF >= ${e.inDepth}) {
              continue;
            }

            for (int yR = 0; yR < ${e.outHeight}; yR++) {
              int xR = wR + yR * ${s} - ${a};

              if (xR < 0 || xR >= ${e.inHeight}) {
                continue;
              }

              for (int yC = 0; yC < ${e.outWidth}; yC++) {
                int xC = wC + yC * ${o} - ${c};

                if (xC < 0 || xC >= ${e.inWidth}) {
                  continue;
                }

                float dyValue = getDy(b, yF, yR, yC, d2);
                float xValue = getX(b, xF, xR, xC, d1);
                dotProd += (xValue * dyValue);
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}}class Kf{constructor(e){this.variableNames=["dy","W"],this.outputShape=e.inShape;const t=e.filterDepth,s=e.filterHeight,o=e.filterWidth,r=e.strideDepth,a=e.strideHeight,c=e.strideWidth,i=t-1-e.padInfo.front,l=s-1-e.padInfo.top,u=o-1-e.padInfo.left;this.userCode=`
      const ivec3 pads = ivec3(${i}, ${l}, ${u});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int d1 = coords.u;


        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyFCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        float dotProd = 0.0;
        for (int wF = 0; wF < ${t}; wF++) {
          float dyF = float(dyFCorner + wF) / ${r}.0;

          if (dyF < 0.0 || dyF >= ${e.outDepth}.0 || fract(dyF) > 0.0) {
            continue;
          }
          int idyF = int(dyF);

          int wFPerm = ${t} - 1 - wF;

          for (int wR = 0; wR < ${s}; wR++) {
            float dyR = float(dyRCorner + wR) / ${a}.0;

            if (dyR < 0.0 || dyR >= ${e.outHeight}.0 ||
              fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            int wRPerm = ${s} - 1 - wR;

            for (int wC = 0; wC < ${o}; wC++) {
              float dyC = float(dyCCorner + wC) / ${c}.0;

              if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              int wCPerm = ${o} - 1 - wC;

              for (int d2 = 0; d2 < ${e.outChannels}; d2++) {
                float xValue = getDy(batch, idyF, idyR, idyC, d2);
                float wValue = getW(wFPerm, wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function jf(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,dy:r}=e,{strides:a,pad:c,dataFormat:i,dimRoundingMode:l,filterShape:u}=s,d=Pt(i),p=be(o.shape,u,a,1,c,l,!1,d),h=new zf(p);return t.runWebGLProgram(h,[o,r],"float32")}const qf={kernelName:ma,backendName:"webgl",kernelFunc:jf};/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Yf{constructor(e){this.variableNames=["dy","W"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"strides",type:"vec2"}],this.outputShape=e.inShape,this.enableShapeUniforms=U(this.outputShape.length);const t=e.filterHeight,s=e.filterWidth,o=t-1-e.padInfo.top,r=s-1-e.padInfo.left;this.userCode=`
      const ivec2 pads = ivec2(${o}, ${r});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[3];

        ivec2 dyCorner = ivec2(coords[1], coords[2]) - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        vec4 result = vec4(0.);
        for (int wR = 0; wR < ${t}; wR++) {
          float dyR = float(dyRCorner + wR) / strides[0];
          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);
          int wRPerm = ${t} - 1 - wR;

          for (int wC = 0; wC < ${s}; wC++) {
            int wCPerm = ${s} - 1 - wC;

            float dyC = float(dyCCorner + wC) / strides[1];
            bool idyCVal = (dyC >= 0.0) && (dyC < ${e.outWidth}.0)
              && (fract(dyC) == 0.0);
            int idyC = int(dyC);

            float dyC2 = float(dyCCorner + wC + 1) / strides[1];
            bool idyCVal2 = (dyC2 >= 0.0) && (dyC2 < ${e.outWidth}.0)
              && (fract(dyC2) == 0.0);
            int idyC2 = int(dyC2);

            if (idyCVal && idyCVal2) {
              for (int d2 = 0; d2 < ${e.outChannels}; d2 += 2) {
                vec4 wValue = getW(wRPerm, wCPerm, d1, d2);
                vec4 dySample = getDy(batch, idyR, idyC, d2);
                vec4 dySample2 = (idyC / 2 == idyC2 / 2) ?
                  dySample : getDy(batch, idyR, idyC2, d2);

                vec2 dyValue = mod(float(idyC), 2.) == 0. ?
                  dySample.xy : dySample.zw;
                result.xy += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));

                dyValue = mod(float(idyC2), 2.) == 0. ?
                  dySample2.xy : dySample2.zw;
                result.zw += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));
              }
            } else if (idyCVal) {
              for (int d2 = 0; d2 < ${e.outChannels}; d2 += 2) {
                vec4 wValue = getW(wRPerm, wCPerm, d1, d2);
                vec4 dySample = getDy(batch, idyR, idyC, d2);
                vec2 dyValue = mod(float(idyC), 2.) == 0. ?
                  dySample.xy : dySample.zw;
                result.xy += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));
              }
            } else if (idyCVal2) {
              for (int d2 = 0; d2 < ${e.outChannels}; d2 += 2) {
                vec4 wValue = getW(wRPerm, wCPerm, d1, d2);
                vec4 dySample = getDy(batch, idyR, idyC2, d2);
                vec2 dyValue = mod(float(idyC2), 2.) == 0. ?
                  dySample.xy : dySample.zw;
                result.zw += vec2(dot(dyValue, wValue.xy),
                  dot(dyValue, wValue.zw));
              }
            }
          }
        }
        setOutput(result);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Qf(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,filter:r}=e,{inputShape:a,strides:c,pad:i,dataFormat:l,dimRoundingMode:u}=s,d=Pt(l),p=be(a,r.shape,c,1,i,u,!1,d);if($().getBool("WEBGL_PACK_CONV2DTRANSPOSE")&&d==="channelsLast"){const h=[[p.strideHeight,p.strideWidth]],f=new Yf(p);return t.runWebGLProgram(f,[o,r],"float32",h)}else{const h=new Hf(p);return t.runWebGLProgram(h,[o,r],"float32")}}const Zf={kernelName:xa,backendName:"webgl",kernelFunc:Qf};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Jf(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r}=e,{strides:a,pad:c,dilations:i}=s,l=on(o.shape,r.shape,a,i,c),u=new Uf(l);return t.runWebGLProgram(u,[o,r],"float32")}const em={kernelName:ga,backendName:"webgl",kernelFunc:Jf};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function tm(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,dy:r}=e,{strides:a,pad:c,filterShape:i}=s,l=on(o.shape,i,a,1,c),u=new Xf(l);return t.runWebGLProgram(u,[o,r],"float32")}const nm={kernelName:Ca,backendName:"webgl",kernelFunc:tm};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function sm(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,filter:r}=e,{pad:a,strides:c,inputShape:i}=s,l=on(i,r.shape,c,1,a),u=new Kf(l);return t.runWebGLProgram(u,[o,r],"float32")}const om={kernelName:va,backendName:"webgl",kernelFunc:sm};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const rm=Ke+`
  return cos(x);
`,am=`
  vec4 result = cos(x);
  bvec4 isNaN = isnan(x);
  ${De}
  return result;
`,im=P({opSnippet:rm,packedOpSnippet:am}),cm={kernelName:ba,backendName:"webgl",kernelFunc:im};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const lm=`
  float e2x = exp(-x);
  return (e2x + 1.0 / e2x) / 2.0;
`,um=P({opSnippet:lm}),dm={kernelName:$a,backendName:"webgl",kernelFunc:um};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class pm{constructor(e,t,s,o,r){this.variableNames=["Image","Boxes","BoxInd"],this.outputShape=[];const[a,c,i,l]=e,[u]=t,[d,p]=s;this.outputShape=[u,d,p,l];const h=o==="bilinear"?1:0,[f,g]=[`${c-1}.0`,`${i-1}.0`],[x,m,C]=d>1?[`${(c-1)/(d-1)}`,"(y2-y1) * height_ratio",`y1*${f} + float(y)*(height_scale)`]:["0.0","0.0",`0.5 * (y1+y2) * ${f}`],[b,v,w]=p>1?[`${(i-1)/(p-1)}`,"(x2-x1) * width_ratio",`x1*${g} + float(x)*(width_scale)`]:["0.0","0.0",`0.5 * (x1+x2) * ${g}`];this.userCode=`
      const float height_ratio = float(${x});
      const float width_ratio = float(${b});
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int y = coords[1];
        int x = coords[2];
        int d = coords[3];

        // get box vals
        float y1 = getBoxes(b,0);
        float x1 = getBoxes(b,1);
        float y2 = getBoxes(b,2);
        float x2 = getBoxes(b,3);

        // get image in batch index
        int bInd = round(getBoxInd(b));
        if(bInd < 0 || bInd >= ${a}) {
          return;
        }

        float height_scale = ${m};
        float width_scale = ${v};

        float in_y = ${C};
        if( in_y < 0.0 || in_y > ${f} ) {
          setOutput(float(${r}));
          return;
        }
        float in_x = ${w};
        if( in_x < 0.0 || in_x > ${g} ) {
          setOutput(float(${r}));
          return;
        }

        vec2 sourceFracIndexCR = vec2(in_x,in_y);
        if(${h} == 1) {
          // Compute the four integer indices.
          ivec2 sourceFloorCR = ivec2(sourceFracIndexCR);
          ivec2 sourceCeilCR = ivec2(ceil(sourceFracIndexCR));

          float topLeft = getImage(b, sourceFloorCR.y, sourceFloorCR.x, d);
          float bottomLeft = getImage(b, sourceCeilCR.y, sourceFloorCR.x, d);
          float topRight = getImage(b, sourceFloorCR.y, sourceCeilCR.x, d);
          float bottomRight = getImage(b, sourceCeilCR.y, sourceCeilCR.x, d);

          vec2 fracCR = sourceFracIndexCR - vec2(sourceFloorCR);

          float top = topLeft + (topRight - topLeft) * fracCR.x;
          float bottom = bottomLeft + (bottomRight - bottomLeft) * fracCR.x;
          float newValue = top + (bottom - top) * fracCR.y;
          setOutput(newValue);
        } else {
          // Compute the coordinators of nearest neighbor point.
          ivec2 sourceNearestCR = ivec2(floor(
            sourceFracIndexCR + vec2(0.5,0.5)));
          float newValue = getImage(b, sourceNearestCR.y, sourceNearestCR.x, d);
          setOutput(newValue);
        }
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const hm=n=>{const{inputs:e,backend:t,attrs:s}=n,{image:o,boxes:r,boxInd:a}=e,{cropSize:c,method:i,extrapolationValue:l}=s,u=new pm(o.shape,r.shape,c,i,l);return t.runWebGLProgram(u,[o,r,a],"float32")},fm={kernelName:wa,backendName:"webgl",kernelFunc:hm};var it;(function(n){n.Prod="*",n.Sum="+"})(it||(it={}));class Xn{constructor(e,t,s,o){this.op=e,this.outputShape=t,this.variableNames=["x"],this.customUniforms=[{name:"index",type:"float"}];const r=this.outputShape.length,a=this.op===it.Prod?"1.0":"0.0",c=s?a:`getX(${Kn(r,"coords",this.op)})`,i=this.outputShape[this.outputShape.length-1];let l="",u="";s?(l=o?`end != ${i-1}`:"end != 0",u=o?"end + 1":"end - 1"):(l=o?`end + pow2 < ${i}`:"end >= pow2",u=o?"end + pow2":"end - pow2"),this.userCode=`
      void main() {
        ${D(r)} coords = getOutputCoords();
        int end = ${jn(r,"coords",this.op)};
        float val = ${c};
        int pow2 = int(pow(2.0, index));
        if (${l}) {
          int idx = ${u};
          ${jn(r,"coords",this.op)} = idx;
          val ${this.op}= getX(${Kn(r,"coords",this.op)});
        }
        setOutput(val);
      }
    `}}function Kn(n,e,t){if(n===1)return`${e}`;if(n===2)return`${e}.x, ${e}.y`;if(n===3)return`${e}.x, ${e}.y, ${e}.z`;if(n===4)return`${e}.x, ${e}.y, ${e}.z, ${e}.w`;throw new Error(`Cumulative ${t} for rank ${n} is not yet supported`)}function jn(n,e,t){if(n===1)return`${e}`;if(n===2)return`${e}.y`;if(n===3)return`${e}.z`;if(n===4)return`${e}.w`;throw new Error(`Cumulative ${t} for rank ${n} is not yet supported`)}/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function So(n,e,t,s,o,r){const a=e.shape.length,c=ie([s],a);let i=e;c!=null&&(i=G({inputs:{x:e},backend:t,attrs:{perm:c}}));const l=ce(1,a)[0];if(l!==a-1)throw new Error(`WebGL cumprod shader expects an inner-most axis=${e.shape.length-1} but got axis=${s}`);const u=i.shape[l];let d=Y({inputs:{x:i},backend:t});for(let p=0;p<=Math.ceil(Math.log2(u))-1;p++){const h=new Xn(n,i.shape,!1,r),f=[[p]],g=d;d=t.runWebGLProgram(h,[d],d.dtype,f),t.disposeIntermediateTensorInfo(g)}if(o){const p=new Xn(n,i.shape,o,r),h=d;d=t.runWebGLProgram(p,[d],d.dtype),t.disposeIntermediateTensorInfo(h)}if(c!=null){const p=ls(c),h=G({inputs:{x:d},backend:t,attrs:{perm:p}});return t.disposeIntermediateTensorInfo(d),t.disposeIntermediateTensorInfo(i),h}return d}/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function mm(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,exclusive:a,reverse:c}=s;return So(it.Prod,o,t,r,a,c)}const xm={kernelName:Ra,backendName:"webgl",kernelFunc:mm};/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function gm(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,exclusive:a,reverse:c}=s;return So(it.Sum,o,t,r,a,c)}const Cm={kernelName:Sa,backendName:"webgl",kernelFunc:gm};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function vm(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,weights:r}=e,{size:a,binaryOutput:c}=s;if(o.shape.length===1){const i=t.readSync(o.dataId),l=t.readSync(r.dataId),u=so(i,l,r.dtype,r.shape,a);return t.makeTensorInfo([a],r.dtype,u)}else if(o.shape.length===2){const i=t.bufferSync(o),l=t.bufferSync(r),u=$d(i,l,a,c);return t.makeTensorInfo(u.shape,r.dtype,u.values)}throw new Error(`Error in denseBincount: input must be at most rank 2, but got rank${o.shape.length}.`)}const bm={kernelName:ya,backendName:"webgl",kernelFunc:vm};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class $m{constructor(e,t,s){this.variableNames=["x"],this.outputShape=[],this.outputShape=e,this.blockSize=t,this.dataFormat=s,this.userCode=`
    void main() {
      ivec4 coords = getOutputCoords();
      int b = coords[0];
      int h = ${this.getHeightCoordString()};
      int w = ${this.getWidthCoordString()};
      int d = ${this.getDepthCoordString()};

      int in_h = h / ${t};
      int offset_h = imod(h, ${t});
      int in_w = w / ${t};
      int offset_w = imod(w, ${t});
      int offset_d = (offset_h * ${t} + offset_w) *
        ${this.getOutputDepthSize()};
      int in_d = d + offset_d;

      float result = ${this.getInputSamplingString()};
      setOutput(result);
    }
  `}getHeightCoordString(){return this.dataFormat==="NHWC"?"coords[1]":"coords[2]"}getWidthCoordString(){return this.dataFormat==="NHWC"?"coords[2]":"coords[3]"}getDepthCoordString(){return this.dataFormat==="NHWC"?"coords[3]":"coords[1]"}getOutputDepthSize(){return this.dataFormat==="NHWC"?this.outputShape[3]:this.outputShape[1]}getInputSamplingString(){return this.dataFormat==="NHWC"?"getX(b, in_h, in_w, in_d)":"getX(b, in_d, in_h, in_w)"}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function wm(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{blockSize:r,dataFormat:a}=s,c=o.shape[0],i=a==="NHWC"?o.shape[1]:o.shape[2],l=a==="NHWC"?o.shape[2]:o.shape[3],u=a==="NHWC"?o.shape[3]:o.shape[1],d=i*r,p=l*r,h=u/(r*r),f=a==="NHWC"?[c,d,p,h]:[c,h,d,p],g=new $m(f,r,a);return t.runWebGLProgram(g,[o],o.dtype)}const Rm={kernelName:Ia,backendName:"webgl",kernelFunc:wm};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class yo{constructor(e,t=!1,s=null,o=!1,r=!1){this.variableNames=["x","W"],this.customUniforms=[{name:"pads",type:"ivec2"},{name:"strides",type:"ivec2"},{name:"dilations",type:"ivec2"},{name:"inDims",type:"ivec2"}],this.outputShape=e.outShape,this.enableShapeUniforms=U(this.outputShape.length);const a=e.filterHeight,c=e.filterWidth,i=e.outChannels/e.inChannels;let l="",u="";s&&(o?l=`float activation(float a) {
          float b = getPreluActivationWeightsAtOutCoords();
          ${s}
        }`:r?l=`float activation(float a) {
          float b = getLeakyreluAlphaAtOutCoords();
          ${s}
        }`:l=`
          float activation(float x) {
            ${s}
          }
        `,u="result = activation(result);");const d=t?"result += getBiasAtOutCoords();":"";t&&this.variableNames.push("bias"),o&&this.variableNames.push("preluActivationWeights"),r&&this.variableNames.push("leakyreluAlpha"),this.userCode=`
      ${l}

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        ivec2 xRCCorner = coords.yz * strides - pads;
        int d2 = coords.w;
        int d1 = d2 / ${i};
        int q = d2 - d1 * ${i};

        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // Convolve x(?, ?, d1) with w(:, :, d1, q) to get y(yR, yC, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        // TO DO(dsmilkov): Flatten the two for loops and vec4 the operations.
        for (int wR = 0; wR < ${a}; wR++) {
          int xR = xRCorner + wR * dilations[0];

          if (xR < 0 || xR >= inDims[0]) {
            continue;
          }

          for (int wC = 0; wC < ${c}; wC++) {
            int xC = xCCorner + wC * dilations[1];

            if (xC < 0 || xC >= inDims[1]) {
              continue;
            }

            float xVal = getX(batch, xR, xC, d1);
            float wVal = getW(wR, wC, d1, q);
            dotProd += xVal * wVal;
          }
        }

        float result = dotProd;
        ${d}
        ${u}
        setOutput(result);
      }
    `}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Io{constructor(e,t=!1,s=null,o=!1,r=!1){this.variableNames=["x","W"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"pads",type:"ivec2"},{name:"strides",type:"ivec2"},{name:"dilations",type:"ivec2"},{name:"inDims",type:"ivec2"}],this.outputShape=e.outShape,this.enableShapeUniforms=U(this.outputShape.length);const a=e.outChannels/e.inChannels,c=e.padInfo.left,i=e.strideWidth,l=e.dilationWidth,u=e.filterHeight,d=e.filterWidth,p=d;let h=`
      int xR; int xC; int xCOffset;
      vec4 wTexel; vec4 previous; vec4 final;`;for(let m=0;m<d;m++)h+=`
          vec4 xTexelC${m*2};
          int xTexelC${m*2}Ready;
          vec4 xTexelC${m*2+1};
          int xTexelC${m*2+1}Ready;
          vec4 xC${m};`;h+=`
    for (int r = 0; r < ${u}; r++) {
      `;for(let m=0;m<d;m++)h+=`
          xTexelC${m*2} = vec4(0.0);
          xTexelC${m*2}Ready = 0;
          xTexelC${m*2+1} = vec4(0.0);
          xTexelC${m*2+1}Ready = 0;
          xC${m} = vec4(0.0);`;h+=`
        xR = xRCorner + r * dilations[0];
        if (xR >=0 && xR < inDims[0]) {
      `;for(let m=0;m<(p+1)/2;m++){const C=m*2;if(h+=`
          xC = xCCorner + ${C*l};
          `,i===1){if(C<d&&(c%2===1?(h+=`
                xCOffset = xC + 1;
                if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${C}Ready == 0) {
                  xTexelC${C} = getX(batch, xR, xCOffset, d1);

                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${C}.zw = vec2(0.0);
                  }
                  xTexelC${C}Ready = 1;
                }
              `,l===1&&C>0?h+=`
                xC${C} = vec4(xTexelC${C-2}.zw, xTexelC${C}.xy);
                `:h+=`
                  xCOffset = xC + 1 - 2;

                  if (xCOffset >= 0 && xCOffset < inDims[1]) {
                    previous = getX(batch, xR, xCOffset, d1);

                    // Need to manually clear unused channels in case
                    // we're reading from recycled texture.
                    if (xCOffset + 1 >= inDims[1]) {
                      previous.zw = vec2(0.0);
                    }

                    xC${C} = vec4(previous.zw, xTexelC${C}.xy);
                  } else {
                    xC${C} = vec4(0.0, 0.0, xTexelC${C}.xy);
                  }
                  `):h+=`
                if (xC >= 0 && xC < inDims[1] && xTexelC${C}Ready == 0) {
                  xTexelC${C} = getX(batch, xR, xC, d1);
                  if (xC + 1 >= inDims[1]) {
                    xTexelC${C}.zw = vec2(0.0);
                  }
                  xTexelC${C}Ready = 1;
                }

                xC${C} = xTexelC${C};
                `,C+1<d)){const b=c%2===0?Jt(l):l;l%2===0&&c%2===1||l%2!==0&&c%2!==1?(h+=`
                  xCOffset = xC + imod(pads[1], 2) + ${b};

                  if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${C+1}Ready == 0) {
                    xTexelC${C+1} = getX(batch, xR, xCOffset, d1);

                    // Need to manually clear unused channels in case
                    // we're reading from recycled texture.
                    if (xCOffset + 1 >= inDims[1]) {
                      xTexelC${C+1}.zw = vec2(0.0);
                    }
                    xTexelC${C+1}Ready = 1;
                  }
                  `,l>1?h+=`
                    xCOffset -= 2;
                    if (xCOffset >= 0 && xCOffset < inDims[1]) {
                     previous = getX(batch, xR, xCOffset, d1);
                     xC${C+1} = vec4(previous.zw, xTexelC${C+1}.xy);
                    } else {
                     xC${C+1} = vec4(0.0, 0.0, xTexelC${C+1}.xy);
                    }
                    `:h+=`
                    xC${C+1} = vec4(xTexelC${C}.zw, xTexelC${C+1}.xy);
                    `):b===1?h+=`
                    xC${C+1} = xTexelC${C};
                    `:h+=`
                    xCOffset = xC + ${b};

                    if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${C+1}Ready == 0) {
                      xTexelC${C+1} = getX(batch, xR, xCOffset, d1);
                      if (xCOffset + 1 >= inDims[1]) {
                        xTexelC${C+1}.zw = vec2(0.0);
                      }
                      xTexelC${C+1}Ready = 1;
                    }

                    xC${C+1} = xTexelC${C+1};
                    `}}else C<d&&(c%2===1?(h+=`
                xCOffset = xC + 1 - strides[1];
                if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${C}Ready == 0) {
                  xTexelC${C} = getX(batch, xR, xCOffset, d1);
                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${C}.zw = vec2(0.0);
                  }
                  xTexelC${C}Ready = 1;
                }

                if(xC + 1 >= 0 && xC + 1 < inDims[1] && xTexelC${C+1}Ready == 0) {
                  xTexelC${C+1} = getX(batch, xR, xC + 1, d1);
                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xC + 2 >= inDims[1]) {
                    xTexelC${C+1}.zw = vec2(0.0);
                  }
                  xTexelC${C+1}Ready = 1;
                }

                xC${C} = vec4(xTexelC${C}.zw, xTexelC${C+1}.zw);
              `,C+1<d&&(h+=`
                  final = vec4(0.0);
                  xCOffset = xC + 1 + strides[1];
                  if(xCOffset >= 0 && xCOffset < inDims[1]) {
                    final = getX(batch, xR, xCOffset, d1);
                  }
                  xC${C+1} = vec4(xTexelC${C+1}.xy, final.xy);
                `)):(h+=`
                if(xC >= 0 && xC < inDims[1] && xTexelC${C}Ready == 0) {
                  xTexelC${C} = getX(batch, xR, xC, d1);
                  if (xC + 1 >= inDims[1]) {
                    xTexelC${C}.zw = vec2(0.0);
                  }
                  xTexelC${C}Ready = 1;
                }

                xCOffset = xC + strides[1];
                if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${C+1}Ready == 0) {
                  xTexelC${C+1} = getX(batch, xR, xCOffset, d1);
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${C+1}.zw = vec2(0.);
                  }
                  xTexelC${C+1}Ready = 1;
                }

                xC${C} = vec4(
                  xTexelC${C}.xy, xTexelC${C+1}.xy);
              `,C+1<d&&(h+=`
                  xC${C+1} = vec4(xTexelC${C}.zw, xTexelC${C+1}.zw);
                `)));C<d&&(h+=`
            wTexel = getW(r, ${C}, d1, q);
            dotProd += xC${C} * vec4(wTexel.xz, wTexel.xz);
          `,C+1<d&&(h+=`
              wTexel = getW(r, ${C+1}, d1, q);
              dotProd += xC${C+1} * vec4(wTexel.xz, wTexel.xz);
            `))}h+=`
    }
  `,h+=`
      }
    `;let f="",g="";s&&(o?f=`vec4 activation(vec4 a) {
          vec4 b = getPreluActivationWeightsAtOutCoords();
          ${s}
        }`:r?f=`vec4 activation(vec4 a) {
          vec4 b = getLeakyreluAlphaAtOutCoords();
          ${s}
        }`:f=`vec4 activation(vec4 x) {
          ${s}
        }`,g="result = activation(result);");const x=t?"result += getBiasAtOutCoords();":"";t&&this.variableNames.push("bias"),o&&this.variableNames.push("preluActivationWeights"),r&&this.variableNames.push("leakyreluAlpha"),this.userCode=`
      ${f}

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        ivec2 xRCCorner = coords.yz * strides - pads;
        int d2 = coords.w;
        int d1 = d2 / ${a};
        int q = d2 - d1 * ${a};
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        //intialize dotProd with a small epsilon seems to reduce GPU accuracy loss.
        vec4 dotProd = vec4(0.000000000000001);

        ${h}

        vec4 result = dotProd - vec4(0.000000000000001);
        ${x}
        ${g}
        setOutput(result);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Sm(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r}=e,{strides:a,pad:c,dilations:i,dimRoundingMode:l}=s;let u=i;u==null&&(u=[1,1]),F(ct(a,u),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${a} and dilations '${u}'`);const d=be(o.shape,r.shape,a,u,c,l,!0);let p;$().getBool("WEBGL_PACK_DEPTHWISECONV")&&d.strideWidth<=2&&d.outChannels/d.inChannels===1?p=new Io(d):p=new yo(d);const h=[[d.padInfo.top,d.padInfo.left],[d.strideHeight,d.strideWidth],[d.dilationHeight,d.dilationWidth],[d.inHeight,d.inWidth]];return t.runWebGLProgram(p,[o,r],"float32",h)}const ym={kernelName:Ta,backendName:"webgl",kernelFunc:Sm};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Im{constructor(e){this.variableNames=["x","dy"],this.outputShape=e.filterShape;const t=e.strideHeight,s=e.strideWidth,o=e.padInfo.top,r=e.padInfo.left,a=e.outChannels/e.inChannels;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int wR = coords.x;
        int wC = coords.y;
        int d1 = coords.z;
        int dm = coords.w;
        int d2 = d1 * ${a} + dm;

        float dotProd = 0.0;

        // TO DO: Vec4 over the batch size
        for (int b = 0; b < ${e.batchSize}; b++) {
          for (int yR = 0; yR < ${e.outHeight}; yR++) {
            int xR = wR + yR * ${t} - ${o};

            if (xR < 0 || xR >= ${e.inHeight}) {
              continue;
            }

            for (int yC = 0; yC < ${e.outWidth}; yC++) {
              int xC = wC + yC * ${s} - ${r};

              if (xC < 0 || xC >= ${e.inWidth}) {
                continue;
              }

              float dyValue = getDy(b, yR, yC, d2);
              float xValue = getX(b, xR, xC, d1);
              dotProd += (xValue * dyValue);
            }
          }
        }
        setOutput(dotProd);
      }
    `}}class Tm{constructor(e){this.variableNames=["dy","W"],this.outputShape=e.inShape;const t=e.filterHeight,s=e.filterWidth,o=e.strideHeight,r=e.strideWidth,a=t-1-e.padInfo.top,c=s-1-e.padInfo.left,i=e.outChannels/e.inChannels;this.userCode=`
      const ivec2 pads = ivec2(${a}, ${c});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[3];
        ivec2 dyCorner = coords.yz - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        float dotProd = 0.0;

        for (int wR = 0; wR < ${t}; wR++) {
          float dyR = float(dyRCorner + wR) / ${o}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          int wRPerm = ${t} - 1 - wR;

          for (int wC = 0; wC < ${s}; wC++) {
            float dyC = float(dyCCorner + wC) / ${r}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            int wCPerm = ${s} - 1 - wC;

            // TO DO: Vec4 over the channelMul
            for (int dm = 0; dm < ${i}; dm++) {
              int d2 = d1 * ${i} + dm;
              float xValue = getDy(batch, idyR, idyC, d2);
              float wValue = getW(wRPerm, wCPerm, d1, dm);
              dotProd += xValue * wValue;
            }
          }
        }
        setOutput(dotProd);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Em(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,dy:r}=e,{strides:a,dilations:c,pad:i,dimRoundingMode:l,filterShape:u}=s,d=be(o.shape,u,a,c,i,l,!0),p=new Im(d);return t.runWebGLProgram(p,[o,r],"float32")}const Nm={kernelName:Ea,backendName:"webgl",kernelFunc:Em};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function km(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,filter:r}=e,{strides:a,dilations:c,pad:i,dimRoundingMode:l,inputShape:u}=s,d=be(u,r.shape,a,c,i,l,!0),p=new Tm(d);return t.runWebGLProgram(p,[o,r],"float32")}const Om={kernelName:Na,backendName:"webgl",kernelFunc:km};/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Pm{constructor(e){this.variableNames=["X"],this.outputShape=[e,e],this.userCode=`
      void main() {
          ivec2 coords = getOutputCoords();
          float val = coords[0] == coords[1] ? getX(coords[0]) : 0.0;
          setOutput(val);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Dm(n){const{inputs:e,backend:t}=n,{x:s}=e,o=[...s.shape,...s.shape],r=T(s.shape),a=R({inputs:{x:s},backend:t,attrs:{shape:[r]}}),c=new Pm(r),i=t.runWebGLProgram(c,[a],a.dtype),l=R({inputs:{x:i},backend:t,attrs:{shape:o}});return t.disposeIntermediateTensorInfo(a),t.disposeIntermediateTensorInfo(i),l}const Am={kernelName:ka,backendName:"webgl",kernelFunc:Dm};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Fm{constructor(e){this.variableNames=["x","W"],this.outputShape=e.outShape;const{inHeight:t,inWidth:s,padInfo:o,strideHeight:r,strideWidth:a,filterHeight:c,filterWidth:i,dilationHeight:l,dilationWidth:u}=e,{top:d,left:p}=o;this.userCode=`
      const ivec2 strides = ivec2(${r}, ${a});
      const ivec2 pads = ivec2(${d}, ${p});
      const float neg_infinity = -3.4e38;

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        int d1 = coords.w;
        ivec2 outTopLeftCorner =
            coords.yz * strides - pads;
        int hBeg = outTopLeftCorner.x;
        int wBeg = outTopLeftCorner.y;

        float curVal = neg_infinity;
        for (int h = 0; h < ${c}; h++) {
          int hIn = hBeg + h * ${l};

          if (hIn >= 0 && hIn < ${t}) {
            for (int w = 0; w < ${i}; w++) {
              int wIn = wBeg + w * ${u};

              if (wIn >= 0 && wIn < ${s}) {
                float xVal = getX(batch, hIn, wIn, d1);
                float wVal = getW(h, w, d1);

                float val = xVal + wVal;
                if (val > curVal) {
                  curVal = val;
                }
              }
            }
          }
        }

        float result = curVal;
        setOutput(result);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function _m(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r}=e,{strides:a,pad:c,dilations:i}=s,l=Pa(o.shape,r.shape,a,c,"NHWC",i);let u;const d=new Fm(l);u=t.runWebGLProgram(d,[o,r],"float32");const p=R({inputs:{x:u},backend:t,attrs:{shape:l.outShape}});return t.disposeIntermediateTensorInfo(u),p}const Lm={kernelName:Oa,backendName:"webgl",kernelFunc:_m};/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Bm(n){const{inputs:e,backend:t,attrs:s}=n,{equation:o}=s,r=e,{allDims:a,summedDims:c,idDims:i}=Aa(o,r.length);Fa(a.length,i,r);const{path:l,steps:u}=_a(c,i),d=u.length;let p=null,h=a.length;const f=[];for(let g=0;g<d;++g){for(const x of u[g]){const{permutationIndices:m,expandDims:C}=La(h,i[x]);let b;Ba(m)?b=r[x]:(b=G({inputs:{x:r[x]},backend:t,attrs:{perm:m}}),f.push(b));const v=b.shape.slice();for(let w=0;w<C.length;++w)v.splice(C[w],0,1);H(b.shape,v)||(b=R({inputs:{x:b},backend:t,attrs:{shape:v}}),f.push(b)),p===null?p=b:(p=vn({inputs:{a:b,b:p},backend:t}),f.push(p))}g<d-1&&(l[g]>=0&&(p=_t({inputs:{x:p},backend:t,attrs:{axis:l[g]-(a.length-h),keepDims:!1}}),f.push(p)),h--)}for(const g of f)g!==p&&t.disposeIntermediateTensorInfo(g);return p}const Vm={kernelName:Da,backendName:"webgl",kernelFunc:Bm};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Um="return (x >= 0.0) ? x : (exp(x) - 1.0);",Wm=`
  vec4 result;

  result.r = (x.r >= 0.0) ? x.r : (exp(x.r) - 1.0);
  result.g = (x.g >= 0.0) ? x.g : (exp(x.g) - 1.0);
  result.b = (x.b >= 0.0) ? x.b : (exp(x.b) - 1.0);
  result.a = (x.a >= 0.0) ? x.a : (exp(x.a) - 1.0);

  return result;
`,Mm=P({opSnippet:Um,packedOpSnippet:Wm}),Gm={kernelName:Va,backendName:"webgl",kernelFunc:Mm};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const zm="return (b >= 0.0) ? a : a * (b + 1.0);",Hm=`
  vec4 bGTEZero = vec4(greaterThanEqual(b, vec4(0.)));
  return (bGTEZero * a) + ((vec4(1.0) - bGTEZero) * (a * (b + vec4(1.0))));
`,Xm=n=>{const{inputs:e,backend:t}=n,{dy:s,y:o}=e,r=$().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new Xe(Hm,s.shape,o.shape):new Ne(zm,s.shape,o.shape);return t.runWebGLProgram(r,[s,o],s.dtype)},Km={kernelName:Ua,backendName:"webgl",kernelFunc:Xm};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const jm=`
  return vec4(equal(a, b));
`,qm="return float(a == b);",Ym=B({opSnippet:qm,packedOpSnippet:jm,dtype:"bool",cpuKernelImpl:Id}),Qm={kernelName:Wa,backendName:"webgl",kernelFunc:Ym};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Zm=`
  // Error function is calculated approximately with elementary function.
  // See "Handbook of Mathematical Functions with Formulas,
  // Graphs, and Mathematical Tables", Abramowitz and Stegun.
  float p = ${Ga};
  float a1 = ${za};
  float a2 = ${Ha};
  float a3 = ${Xa};
  float a4 = ${Ka};
  float a5 = ${ja};

  float sign = sign(x);
  x = abs(x);
  float t = 1.0 / (1.0 + p * x);
  return sign * (1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*exp(-x*x));
`,Jm=P({opSnippet:Zm}),ex={kernelName:Ma,backendName:"webgl",kernelFunc:Jm};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const tx=Ke+`
  return exp(x);
`,nx=`
  vec4 result = exp(x);
  bvec4 isNaN = isnan(x);
  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,To=P({opSnippet:tx,packedOpSnippet:nx,cpuKernelImpl:Td,dtype:"float32"}),sx={kernelName:qa,backendName:"webgl",kernelFunc:To};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Zt(n){const{inputs:e,attrs:t,backend:s}=n,{dim:o}=t,{input:r}=e,a=r.shape.length,c=r.shape.slice();let i=o;return o<0&&(F(-(a+1)<=o,()=>`Axis must be in the interval [${-(a+1)}, ${a}]`),i=a+o+1),c.splice(i,0,1),R({inputs:{x:r},backend:s,attrs:{shape:c}})}const ox={kernelName:Ya,backendName:"webgl",kernelFunc:Zt};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const qn="return exp(x) - 1.0;",rx=P({opSnippet:qn,packedOpSnippet:qn,cpuKernelImpl:Ed}),ax={kernelName:Qa,backendName:"webgl",kernelFunc:rx};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Yn{constructor(e,t,s){this.variableNames=["real","imag"];const o=t[1];this.outputShape=t;const r=s?`2.0 * ${Math.PI}`:`-2.0 * ${Math.PI}`,a=s?`${o}.0`:"1.0";let c;if(e==="real")c="return real * expR - imag * expI;";else if(e==="imag")c="return real * expI + imag * expR;";else throw new Error(`FFT component must be either "real" or "imag", got ${e}.`);this.userCode=`
      const float exponentMultiplier = ${r};

      float unaryOpComplex(float real, float expR, float imag, float expI) {
        ${c}
      }

      float mulMatDFT(int batch, int index) {
        float indexRatio = float(index) / float(${o});
        float exponentMultiplierTimesIndexRatio =
            exponentMultiplier * indexRatio;

        float result = 0.0;

        for (int i = 0; i < ${o}; i++) {
          // x = (-2|2 * PI / N) * index * i;
          float x = exponentMultiplierTimesIndexRatio * float(i);
          float expR = cos(x);
          float expI = sin(x);
          float real = getReal(batch, i);
          float imag = getImag(batch, i);

          result +=
              unaryOpComplex(real, expR, imag, expI) / ${a};
        }

        return result;
      }

      void main() {
        ivec2 coords = getOutputCoords();
        setOutput(mulMatDFT(coords[0], coords[1]));
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Eo(n,e,t){const s=t.texData.get(n.dataId),o=T(n.shape),r=n.shape[n.shape.length-1],a=o/r,c=R({inputs:{x:n},backend:t,attrs:{shape:[a,r]}}),i=c.shape,l=new Yn("real",i,e),u=new Yn("imag",i,e),d=[{dataId:s.complexTensorInfos.real.dataId,dtype:s.complexTensorInfos.real.dtype,shape:i},{dataId:s.complexTensorInfos.imag.dataId,dtype:s.complexTensorInfos.imag.dtype,shape:i}],p=t.runWebGLProgram(l,d,"float32"),h=t.runWebGLProgram(u,d,"float32"),f=$e({inputs:{real:p,imag:h},backend:t});t.disposeIntermediateTensorInfo(p),t.disposeIntermediateTensorInfo(h);const g=R({inputs:{x:f},backend:t,attrs:{shape:n.shape}});return t.disposeIntermediateTensorInfo(c),t.disposeIntermediateTensorInfo(f),g}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ix(n){const{inputs:e,backend:t}=n,{input:s}=e;return Eo(s,!1,t)}const cx={kernelName:Za,backendName:"webgl",kernelFunc:ix};/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class lx{constructor(e,t){this.outputShape=[],this.customUniforms=[{name:"value",type:"float"}],this.variableNames=["x"],this.outputShape=e,this.userCode=`
      void main() {
        // Input can be obtained from uniform value.
        setOutput(value);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ht(n){const{backend:e,attrs:t}=n,{shape:s,value:o}=t;let{dtype:r}=t;if(r=r||ei(o),r==="string"){const a=V(r,T(s));return a.fill(o),e.makeTensorInfo(s,r,a)}else{const a=new lx(s,o),c=[[o]];return e.runWebGLProgram(a,[],r,c)}}const ux={kernelName:Ja,backendName:"webgl",kernelFunc:ht};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class dx{constructor(e){this.variableNames=["Image"],this.outputShape=[];const t=e[2];this.outputShape=e,this.userCode=`
        void main() {
          ivec4 coords = getOutputCoords();
          int x = coords[2];

          int coordX = ${t} - x - 1;
          float outputValue;
          if(coordX >= 0 && coordX < ${t}) {
            outputValue = getImage(coords[0], coords[1], coordX, coords[3]);
          } else {
            outputValue = getImage(coords[0], coords[1], coords[2], coords[3]);
          }
          setOutput(outputValue);
        }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const px={kernelName:ti,backendName:"webgl",kernelFunc:({inputs:n,backend:e})=>{const{image:t}=n,s=e,o=new dx(t.shape);return s.runWebGLProgram(o,[t],t.dtype)}};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Qn="return floor(x);",hx=P({opSnippet:Qn,packedOpSnippet:Qn,cpuKernelImpl:Nd}),fx={kernelName:ni,backendName:"webgl",kernelFunc:hx};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const mx=`
  float s = sign(a) * sign(b);
  int ia = round(a);
  int ib = round(b);
  if (ib != 0) {
    // Windows (D3D) wants guaranteed non-zero int division at compile-time.
    return float(idiv(ia, ib, s));
  } else {
    return NAN;
  }
`,xx=`
  ivec4 ia = round(a);
  ivec4 ib = round(b);
  bvec4 cond = notEqual(ib, ivec4(0));
  ivec4 result = ivec4(0);
  vec4 s = sign(a) * sign(b);

  // Windows (D3D) wants guaranteed non-zero int division at compile-time.
  if (cond[0]) {
    result[0] = idiv(ia[0], ib[0], s[0]);
  }
  if (cond[1]) {
    result[1] = idiv(ia[1], ib[1], s[1]);
  }
  if (cond[2]) {
    result[2] = idiv(ia[2], ib[2], s[2]);
  }
  if (cond[3]) {
    result[3] = idiv(ia[3], ib[3], s[3]);
  }
  return vec4(result);
`,gx=B({opSnippet:mx,packedOpSnippet:xx,dtype:"int32"}),Cx={kernelName:si,backendName:"webgl",kernelFunc:gx};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class vx{constructor(e){this.variableNames=["A"];const t=z(),[s,o]=e;this.outputShape=e,this.userCode=`
      void main() {
        ivec3 coords = getOutputCoords();
        int texR = coords[0];
        int texC = coords[1];
        int depth = coords[2];
        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${o}.0, ${s}.0);

        vec4 values = ${t.texture2D}(A, uv);
        float value;
        if (depth == 0) {
          value = values.r;
        } else if (depth == 1) {
          value = values.g;
        } else if (depth == 2) {
          value = values.b;
        } else if (depth == 3) {
          value = values.a;
        }

        setOutput(floor(value * 255.0 + 0.5));
      }
    `}}/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class bx{constructor(e){this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0;const t=z(),[s,o]=e;this.outputShape=e,this.userCode=`
      void main() {
        ivec3 coords = getOutputCoords();
        int texR = coords[0];
        int texC = coords[1];
        int depth = coords[2];

        vec4 result = vec4(0.);

        for(int row=0; row<=1; row++) {
          for(int col=0; col<=1; col++) {
            texC = coords[1] + row;
            depth = coords[2] + col;

            vec2 uv = (vec2(texC, texR) + halfCR) /
                       vec2(${o}.0, ${s}.0);
            vec4 values = ${t.texture2D}(A, uv);
            float value;
            if (depth == 0) {
              value = values.r;
            } else if (depth == 1) {
              value = values.g;
            } else if (depth == 2) {
              value = values.b;
            } else if (depth == 3) {
              value = values.a;
            }

            result[row * 2 + col] = floor(value * 255.0 + 0.5);
          }
        }

        ${t.output} = result;
      }
    `}}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const $x={kernelName:oi,backendName:"webgl",kernelFunc:wx};let Le,Wt=$().getBool("CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU");function wx(n){const{inputs:e,backend:t,attrs:s}=n;let{pixels:o}=e;const{numChannels:r}=s,a=typeof HTMLVideoElement<"u"&&o instanceof HTMLVideoElement,c=typeof HTMLImageElement<"u"&&o instanceof HTMLImageElement,[i,l]=a?[o.videoWidth,o.videoHeight]:[o.width,o.height],u=[l,i],d=[l,i,r];if(c||a){const g=$().getBool("CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU");(Le==null||g!==Wt)&&(Wt=g,Le=document.createElement("canvas").getContext("2d",{willReadFrequently:Wt})),Le.canvas.width=i,Le.canvas.height=l,Le.drawImage(o,0,0,i,l),o=Le.canvas}const p=t.makeTensorInfo(u,"int32");t.texData.get(p.dataId).usage=Z.PIXELS,t.gpgpu.uploadPixelDataToTexture(t.getTexture(p.dataId),o);const h=$().getBool("WEBGL_PACK")?new bx(d):new vx(d),f=t.runWebGLProgram(h,[p],"int32");return t.disposeData(p.dataId),f}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Rx(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r,bias:a,preluActivationWeights:c}=e,{strides:i,pad:l,dataFormat:u,dilations:d,dimRoundingMode:p,activation:h,leakyreluAlpha:f}=s,g=Pt(u),x=be(o.shape,r.shape,i,d,l,p,!1,g);let m;const C=[],b=a!=null,v=c!=null,w=h==="leakyrelu",N=()=>{const y=[o,r],O=(k,A)=>{if(A==="NCHW"&&k.shape.length===1&&k.shape[0]!==1){const _=R({inputs:{x:k},backend:t,attrs:{shape:[k.shape[0],1,1]}});return C.push(_),_}return k};if(b&&y.push(O(a,u)),v&&y.push(O(c,u)),w){const k=t.makeTensorInfo([],"float32",Ve(f,"float32"));y.push(k),C.push(k)}return y};if(x.filterHeight===1&&x.filterWidth===1&&x.dilationHeight===1&&x.dilationWidth===1&&x.strideHeight===1&&x.strideWidth===1&&(x.padInfo.type==="SAME"||x.padInfo.type==="VALID"))m=wo({x:o,filter:r,convInfo:x,backend:t,bias:a,activation:h,preluActivationWeights:c,leakyreluAlpha:f});else if(x.strideWidth<=2&&g==="channelsLast"&&$().getBool("WEBGL_EXP_CONV")){const y=h?rt(h,!0):null,O=new $o(x,b,y,v,w),k=[[x.padInfo.top,x.padInfo.left],[x.strideHeight,x.strideWidth],[x.dilationHeight,x.dilationWidth],[x.inHeight,x.inWidth]],A=N();m=t.runWebGLProgram(O,A,"float32",k)}else if($().getBool("WEBGL_CONV_IM2COL"))m=Ro({x:o,filter:r,convInfo:x,backend:t,bias:a,activation:h,preluActivationWeights:c,leakyreluAlpha:f});else{const y=h?rt(h,!1):null,O=new bo(x,b,y,v,w),k=N();m=t.runWebGLProgram(O,k,"float32")}const I=R({inputs:{x:m},backend:t,attrs:{shape:x.outShape}});return C.push(m),C.forEach(y=>t.disposeIntermediateTensorInfo(y)),I}const Sx={kernelName:ri,backendName:"webgl",kernelFunc:Rx};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function yx(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,filter:r,bias:a,preluActivationWeights:c}=e,{strides:i,pad:l,dilations:u,dimRoundingMode:d,activation:p,leakyreluAlpha:h}=s,f=[];let g=u;g==null&&(g=[1,1]),F(ct(i,g),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${i} and dilations '${g}'`);const x=be(o.shape,r.shape,i,g,l,d,!0),m=$().getBool("WEBGL_PACK_DEPTHWISECONV")&&x.strideWidth<=2&&x.outChannels/x.inChannels===1,C=p?rt(p,m):null,b=[o,r],v=a!=null,w=c!=null,N=p==="leakyrelu";if(v&&b.push(a),w&&b.push(c),N){const k=t.makeTensorInfo([],"float32",Ve(h,"float32"));b.push(k),f.push(k)}let I;m?I=new Io(x,v,C,w,N):I=new yo(x,v,C,w,N);const y=[[x.padInfo.top,x.padInfo.left],[x.strideHeight,x.strideWidth],[x.dilationHeight,x.dilationWidth],[x.inHeight,x.inWidth]],O=t.runWebGLProgram(I,b,"float32",y);return f.forEach(k=>t.disposeIntermediateTensorInfo(k)),O}const Ix={kernelName:ai,backendName:"webgl",kernelFunc:yx};class Tx{constructor(e,t,s,o){this.sliceDim=e,this.strides=t,this.paramsShape=o,this.variableNames=["x","indices"],this.outputShape=s;const r=D(s.length);let a=`
    int index;`;for(let c=0;c<this.sliceDim;c++)a+=`
          index = round(getIndices(coords[0], ${c}));
          out_of_bounds = out_of_bounds || index < 0;
          out_of_bounds = out_of_bounds || index >= ${this.paramsShape[c]};
          flattenIndex += index * ${this.strides[c]};`;this.userCode=`
         void main() {
          ${r} coords = getOutputCoords();
          int flattenIndex = 0;
          bool out_of_bounds = false;

          ${a}

          setOutput(out_of_bounds ? 0.0 : getX(flattenIndex, coords[1]));
        }
      `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ex(n){const{inputs:e,backend:t}=n,{params:s,indices:o}=e,r=o.shape,a=r[r.length-1],c=T(s.shape),[i,l,u,d]=ci(s,o),p=R({inputs:{x:o},backend:t,attrs:{shape:[l,a]}}),h=R({inputs:{x:s},backend:t,attrs:{shape:[T(s.shape)/u,u]}});if(t.shouldExecuteOnCPU([s,o])||s.dtype==="string"){const m=t.readSync(o.dataId),C=t.bufferSync(s),b=kd(m,C,s.dtype,l,a,u,d,s.shape,c);return t.makeTensorInfo(i,s.dtype,b.values)}const f=new Tx(a,d,[l,u],s.shape),g=t.runWebGLProgram(f,[h,p],h.dtype),x=R({inputs:{x:g},backend:t,attrs:{shape:i}});return t.disposeIntermediateTensorInfo(p),t.disposeIntermediateTensorInfo(h),t.disposeIntermediateTensorInfo(g),x}const Nx={kernelName:ii,backendName:"webgl",kernelFunc:Ex};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class kx{constructor(e,t){this.variableNames=["A","indices"],this.outputShape=t,this.rank=t.length;const s=D(this.rank),o=Ox(e);this.userCode=`
      void main() {
        ${s} resRC = getOutputCoords();
        int index = int(getIndices(resRC.x, resRC.z));
        float inBounds = (index >= 0) && (index < ${e[2]}) ? 1.0 : 0.0;
        setOutput(inBounds * getA(${o}));
      }
    `}}function Ox(n,e){const t=["resRC.x","resRC.y","resRC.z","resRC.w"],s=[];for(let o=0;o<n.length;o++)o===2?s.push("index"):s.push(`${t[o]}`);return s.join()}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function No(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,indices:r}=e,{axis:a,batchDims:c}=s,i=K(a,o.shape)[0];if($().get("DEBUG")){const C=t.readSync(r.dataId),b=o.shape[i];for(let v=0;v<C.length;++v){const w=C[v];F(w<=b-1&&w>=0,()=>`GatherV2: the index value ${w} is not in [0, ${b-1}]`)}}const l=ui(o,r,i,c),u=T(r.shape),d=[],p=R({inputs:{x:o},backend:t,attrs:{shape:[l.batchSize,l.outerSize,l.dimSize,l.sliceSize]}}),h=R({inputs:{x:r},backend:t,attrs:{shape:[l.batchSize,u/l.batchSize]}});d.push(p),d.push(h);const f=[l.batchSize,l.outerSize,u/l.batchSize,l.sliceSize];if(t.shouldExecuteOnCPU([o,r])||o.dtype==="string"){const C=t.bufferSync(h),b=t.bufferSync(p),v=Od(b,C,f);return d.forEach(w=>t.disposeIntermediateTensorInfo(w)),t.makeTensorInfo(l.outputShape,v.dtype,v.values)}const g=new kx(p.shape,f),x=t.runWebGLProgram(g,[p,h],p.dtype);d.push(x);const m=R({inputs:{x},backend:t,attrs:{shape:l.outputShape}});return d.forEach(C=>t.disposeIntermediateTensorInfo(C)),m}const Px={kernelName:li,backendName:"webgl",kernelFunc:No};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Dx="return float(a > b);",Ax=`
  return vec4(greaterThan(a, b));
`,Fx=B({opSnippet:Dx,packedOpSnippet:Ax,cpuKernelImpl:Pd,dtype:"bool"}),_x={kernelName:di,backendName:"webgl",kernelFunc:Fx};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Lx="return float(a >= b);",Bx=`
  return vec4(greaterThanEqual(a, b));
`,Vx=B({opSnippet:Lx,packedOpSnippet:Bx,dtype:"bool",cpuKernelImpl:Dd}),Ux={kernelName:pi,backendName:"webgl",kernelFunc:Vx};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Wx(n){const{inputs:e,backend:t}=n,{input:s}=e;return Eo(s,!0,t)}const Mx={kernelName:hi,backendName:"webgl",kernelFunc:Wx};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Gx="return float(!isnan(x) && !isinf(x));",zx=P({opSnippet:Gx,dtype:"bool"}),Hx={kernelName:fi,backendName:"webgl",kernelFunc:zx};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Xx="return float(isinf(x));",Kx=P({opSnippet:Xx,dtype:"bool"}),jx={kernelName:mi,backendName:"webgl",kernelFunc:Kx};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const qx="return float(isnan(x));",Yx=P({opSnippet:qx,dtype:"bool"}),Qx={kernelName:xi,backendName:"webgl",kernelFunc:Yx};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Zx="return float(a < b);",Jx=`
  return vec4(lessThan(a, b));
`,eg=B({opSnippet:Zx,packedOpSnippet:Jx,cpuKernelImpl:Ad,dtype:"bool"}),tg={kernelName:gi,backendName:"webgl",kernelFunc:eg};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const ng="return float(a <= b);",sg=`
  return vec4(lessThanEqual(a, b));
`,og=B({opSnippet:ng,packedOpSnippet:sg,cpuKernelImpl:Fd,dtype:"bool"}),rg={kernelName:Ci,backendName:"webgl",kernelFunc:og};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ag(n){const{backend:e,attrs:t}=n,{start:s,stop:o,num:r}=t,a=_d(s,o,r);return e.makeTensorInfo([a.length],"float32",a)}const ig={kernelName:vi,backendName:"webgl",kernelFunc:ag};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const cg=Ke+`
  return x < 0.0 ? 0./0. : log(x);
`,lg=`
  vec4 result = log(x);
  bvec4 isNaN = isnan(x);
  result.r = isNaN.r ? x.r : (x.r < 0.0 ? 0./0. : result.r);
  result.g = isNaN.g ? x.g : (x.g < 0.0 ? 0./0. : result.g);
  result.b = isNaN.b ? x.b : (x.b < 0.0 ? 0./0. : result.b);
  result.a = isNaN.a ? x.a : (x.a < 0.0 ? 0./0. : result.a);
  return result;
`,ug=P({opSnippet:cg,packedOpSnippet:lg,cpuKernelImpl:Ld}),dg={kernelName:bi,backendName:"webgl",kernelFunc:ug};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const pg=Ke+`
  return log(1.0 + x);
`,hg=P({opSnippet:pg}),fg={kernelName:$i,backendName:"webgl",kernelFunc:hg};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const mg="return float(a >= 1.0 && b >= 1.0);",xg=`
  return vec4(
    vec4(greaterThanEqual(a, vec4(1.0))) *
    vec4(greaterThanEqual(b, vec4(1.0))));
`,gg=B({opSnippet:mg,packedOpSnippet:xg,dtype:"bool"}),Cg={kernelName:wi,backendName:"webgl",kernelFunc:gg};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const vg="return float(!(x >= 1.0));",bg=P({opSnippet:vg}),$g={kernelName:Ri,backendName:"webgl",kernelFunc:bg};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const wg="return float(a >= 1.0 || b >= 1.0);",Rg=`
  return min(
    vec4(greaterThanEqual(a, vec4(1.0))) +
    vec4(greaterThanEqual(b, vec4(1.0))),
    vec4(1.0));
`,Sg=B({opSnippet:wg,packedOpSnippet:Rg,dtype:"bool"}),yg={kernelName:Si,backendName:"webgl",kernelFunc:Sg};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Ig{constructor(e,t,s,o,r){this.variableNames=["x"],this.outputShape=[];const a=t,c=e[3]-1;this.outputShape=e;let i;const l=`float(${s}) + float(${o}) * sum`;r===.5?i=`inversesqrt(${l})`:r===1?i=`1.0/(${l})`:i=`exp(log(${l}) * float(-${r}));`,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int r = coords[1];
        int c = coords[2];
        int d = coords[3];
        float x = getX(b, r, c, d);
        float sum = 0.0;
        for (int j = -${a}; j <= ${a}; j++) {
          int idx = d + j;
          if (idx >= 0 && idx <=  ${c}) {
            float z = getX(b, r, c, idx);
            sum += z * z;
          }
        }
        float val = x * ${i};
        setOutput(val);
      }
    `}}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Tg{constructor(e,t,s,o,r){this.variableNames=["x"],this.outputShape=[],this.packedInputs=!0,this.packedOutput=!0;const a=t,c=e[3]-1;this.outputShape=e;let i;const l=`float(${s}) + float(${o}) * sum`;r===.5?i=`inversesqrt(${l})`:r===1?i=`1.0/(${l})`:i=`exp(log(${l}) * float(-${r}));`,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords.x;
        int r = coords.y;
        int c = coords.z;
        int d = coords.w;

        bool hasNextCol = d < ${this.outputShape[3]};
        bool hasNextRow = c < ${this.outputShape[2]};

        vec4 sum = vec4(0.);
        vec4 xFragAtOutputCoords = getX(b, r, c, d);

        vec4 xAtOutputCoords = vec4(
          getChannel(xFragAtOutputCoords, vec2(c, d)),
          hasNextCol ?
            getChannel(xFragAtOutputCoords, vec2(c, d + 1)) : 0.0,
          hasNextRow ?
            getChannel(xFragAtOutputCoords , vec2(c + 1, d)) : 0.0,
          (hasNextRow && hasNextCol) ?
            getChannel(xFragAtOutputCoords, vec2(c + 1, d + 1)) : 0.0
        );

        int firstChannel = d - ${a};
        vec2 cache = vec2(0.);
        if(firstChannel >= 0){
          vec4 firstChannelFrag = getX(b, r, c, firstChannel);
          cache.x = getChannel(firstChannelFrag, vec2(c, firstChannel));
            if(hasNextRow){
              cache.y = getChannel(firstChannelFrag, vec2(c + 1, firstChannel));
            }
        }

        ivec2 depth = ivec2(d, d + 1);
        for (int j = - ${a}; j <= ${a}; j++) {
          ivec2 idx = depth + j;
          bvec2 aboveLowerBound = greaterThanEqual(idx, ivec2(0));
          bvec2 belowUpperBound = lessThanEqual(idx, ivec2(${c}));

          bool depthInRange = aboveLowerBound.x && belowUpperBound.x;
          bool depthPlusOneInRange = aboveLowerBound.y && belowUpperBound.y;

          if(depthInRange || depthPlusOneInRange){
            vec4 z = vec4(0.);
            vec4 xFragAtCurrentDepth;
            z.xz = cache.xy;
            if(depthPlusOneInRange && hasNextCol){
              xFragAtCurrentDepth = idx.y != d ?
                getX(b, r, c, idx.y) : xFragAtOutputCoords;
              z.y = getChannel(xFragAtCurrentDepth, vec2(c, idx.y));
              if(hasNextRow){
                z.w = getChannel(xFragAtCurrentDepth, vec2(c + 1, idx.y));
              }
            }
            cache.xy = z.yw;
            sum += z * z;
          }
        }
        vec4 result = xAtOutputCoords * ${i};
        setOutput(result);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Eg=n=>{const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{depthRadius:r,bias:a,alpha:c,beta:i}=s,l=$().getBool("WEBGL_PACK_NORMALIZATION")?new Tg(o.shape,r,a,c,i):new Ig(o.shape,r,a,c,i);return t.runWebGLProgram(l,[o],o.dtype)},Ng={kernelName:yi,backendName:"webgl",kernelFunc:Eg};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class kg{constructor(e,t,s,o,r){this.variableNames=["inputImage","outputImage","dy"],this.outputShape=[],this.outputShape=e,this.depth=e[3],this.depthRadius=t,this.bias=s,this.alpha=o,this.beta=r,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int r = coords[1];
        int c = coords[2];

        float result = 0.0;
        for (int d = 0; d < ${this.depth}; ++d) {
          int depthBegin = int(max(0.0, float(d - ${t})));
          int depthEnd = int(min(float(${this.depth}),
              float(d + ${t} + 1)));

          const int MIN_DEPTH_BEGIN = 0;
          const int MAX_DEPTH_END = ${this.depth};

          float norm = 0.0;
          for (int k = MIN_DEPTH_BEGIN; k < MAX_DEPTH_END; ++k) {
            if (k < depthBegin){
              continue;
            }
            else if (k >= depthBegin && k < depthEnd) {
              norm += getInputImage(b, r, c, k) * getInputImage(b, r, c, k);
            }
            else {
              break;
            }
          }

          norm = float(${o}) * norm + float(${s});

          for(int k = MIN_DEPTH_BEGIN; k < MAX_DEPTH_END; ++k){
            if (k < depthBegin){
              continue;
            }
            else if (k >= depthBegin && k < depthEnd){
              float dyi = -2.0 * float(${o})
                * float(${r})
                * getInputImage(b, r, c, k) * getOutputImage(b, r, c, d)
                / norm;
              if (k == d) {
                dyi += pow(norm, -1.0 * ${r});
              }
              if (k == coords[3]) {
                dyi *= getDy(b, r, c, d);
                result += dyi;
              }
            }
            else {
              break;
            }
          }
      }
      setOutput(result);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Og=n=>{const{inputs:e,backend:t,attrs:s}=n,{x:o,y:r,dy:a}=e,{depthRadius:c,bias:i,alpha:l,beta:u}=s,d=new kg(o.shape,c,i,l,u);return t.runWebGLProgram(d,[o,r,a],o.dtype)},Pg={kernelName:Ii,backendName:"webgl",kernelFunc:Og};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Dg(n,e,t,s){const o=T(e),a=T(n.shape)/o,c=R({inputs:{x:n},attrs:{shape:[a,o]},backend:s}),i=Ae(c,n.dtype,"max",s),l=R({inputs:{x:i},attrs:{shape:t},backend:s});return s.disposeIntermediateTensorInfo(c),s.disposeIntermediateTensorInfo(i),l}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ko(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{reductionIndices:r,keepDims:a}=s,c=o.shape.length,i=K(r,o.shape);let l=i;const u=ie(l,c),d=u!=null,p=t.shouldExecuteOnCPU([o]);let h=o;if(d){if(p){const b=t.texData.get(h.dataId).values,v=new Array(c);for(let I=0;I<v.length;I++)v[I]=o.shape[u[I]];const w=gn(b,o.shape,o.dtype,u,v);h=t.makeTensorInfo(v,o.dtype);const N=t.texData.get(h.dataId);N.values=w}else h=Ft(o,u,t);l=ce(l.length,c)}de("max",l,c);const[f,g]=pe(h.shape,l);let x=f;a&&(x=ve(f,i));let m;if(p){const b=t.texData.get(h.dataId).values,v=Bd(b,T(g),x,o.dtype);m=t.makeTensorInfo(x,o.dtype);const w=t.texData.get(m.dataId);w.values=v}else m=Dg(h,g,x,t);return d&&t.disposeIntermediateTensorInfo(h),m}const Ag={kernelName:Ti,backendName:"webgl",kernelFunc:ko};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Fg=Cn+`
  return max(a, b);
`,_g=`
  vec4 result = vec4(max(a, b));
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+De+`
  return result;
`,Lg=B({opSnippet:Fg,packedOpSnippet:_g,cpuKernelImpl:Vd}),Bg={kernelName:Ei,backendName:"webgl",kernelFunc:Lg};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Vg(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e;We(o,"maxPool");const{filterSize:r,strides:a,pad:c,dimRoundingMode:i}=s,l=1;F(ct(a,l),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${a} and dilations '${l}'`);const u=lt(o.shape,r,a,l,c,i);if(u.filterWidth===1&&u.filterHeight===1&&H(u.inShape,u.outShape))return Y({inputs:{x:o},backend:t});const d=new at(u,"max",!1);return t.runWebGLProgram(d,[o],o.dtype)}const Ug={kernelName:Ni,backendName:"webgl",kernelFunc:Vg};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Wg(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{filterSize:r,strides:a,pad:c,dataFormat:i,dimRoundingMode:l}=s,u=[1,1,1],d=Ot(o.shape,r,a,u,c,l,i),p=new bn(d,"max",!1);return t.runWebGLProgram(p,[o],o.dtype)}const Mg={kernelName:ki,backendName:"webgl",kernelFunc:Wg};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Gg{constructor(e){this.variableNames=["dy","maxPos"],this.outputShape=e.inShape;const t=e.strideHeight,s=e.strideWidth,o=e.dilationHeight,r=e.effectiveFilterHeight,a=e.effectiveFilterWidth,c=r-1-e.padInfo.top,i=a-1-e.padInfo.left,l=r*a-1;this.userCode=`
      const ivec2 pads = ivec2(${c}, ${i});

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];

        ivec2 dyRCCorner = coords.yz - pads;
        int dyRCorner = dyRCCorner.x;
        int dyCCorner = dyRCCorner.y;

        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${r};
          wR += ${o}) {
          float dyR = float(dyRCorner + wR) / ${t}.0;

          if (dyR < 0.0 || dyR >= ${e.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          for (int wC = 0; wC < ${a}; wC++) {
            float dyC = float(dyCCorner + wC) / ${s}.0;

            if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            float dyValue = getDy(b, idyR, idyC, d);
            int maxPosValue = ${l} - int(getMaxPos(b, idyR, idyC, d));

            // Get the current value, check it against the value from the
            // position matrix.
            int curPosValue = wR * ${a} + wC;
            float mask = float(maxPosValue == curPosValue ? 1.0 : 0.0);

            dotProd += dyValue * mask;
          }
        }
        setOutput(dotProd);
      }
    `}}class zg{constructor(e){this.variableNames=["dy","maxPos"],this.outputShape=e.inShape;const t=e.strideDepth,s=e.strideHeight,o=e.strideWidth,r=e.dilationDepth,a=e.dilationHeight,c=e.dilationWidth,i=e.effectiveFilterDepth,l=e.effectiveFilterHeight,u=e.effectiveFilterWidth,d=i-1-e.padInfo.front,p=l-1-e.padInfo.top,h=u-1-e.padInfo.left,f=i*l*u-1;this.userCode=`
      const ivec3 pads = ivec3(${d}, ${p}, ${h});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyDCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        // Convolve dy(?, ?, ?, ch) with pos mask(:, :, :, d) to get
        // dx(xD, xR, xC, ch).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int wD = 0; wD < ${i};
           wD += ${r}) {
          float dyD = float(dyDCorner + wD) / ${t}.0;

          if (dyD < 0.0 || dyD >= ${e.outDepth}.0 || fract(dyD) > 0.0) {
            continue;
          }
          int idyD = int(dyD);

          for (int wR = 0; wR < ${l};
              wR += ${a}) {
            float dyR = float(dyRCorner + wR) / ${s}.0;

            if (dyR < 0.0 || dyR >= ${e.outHeight}.0 ||
                fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            for (int wC = 0; wC < ${u};
                wC += ${c}) {
              float dyC = float(dyCCorner + wC) / ${o}.0;

              if (dyC < 0.0 || dyC >= ${e.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              float dyValue = getDy(batch, idyD, idyR, idyC, ch);
              int maxPosValue = ${f} -
                  int(getMaxPos(batch, idyD, idyR, idyC, ch));

              // Get the current value, check it against the value from the
              // position matrix.
              int curPosValue =
                  wD * ${l} * ${u} +
                  wR * ${u} + wC;
              float mask = float(maxPosValue == curPosValue ? 1.0 : 0.0);

              dotProd += dyValue * mask;
            }
          }
        }
        setOutput(dotProd);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Hg(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,input:r}=e,a=r,{filterSize:c,strides:i,pad:l,dimRoundingMode:u}=s,d=[1,1,1],p=Ot(a.shape,c,i,d,l,u),h=new bn(p,"max",!0),f=t.runWebGLProgram(h,[a],a.dtype),g=new zg(p),x=t.runWebGLProgram(g,[o,f],a.dtype);return t.disposeIntermediateTensorInfo(f),x}const Xg={kernelName:Oi,backendName:"webgl",kernelFunc:Hg};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Kg(n){const{inputs:e,backend:t,attrs:s}=n,{dy:o,input:r,output:a}=e,c=r;We([r,a],"maxPoolGrad");const{filterSize:i,strides:l,pad:u,dimRoundingMode:d}=s,p=lt(c.shape,i,l,1,u,d),h=!0,f=new at(p,"max",h),g=t.runWebGLProgram(f,[c],c.dtype),x=new Gg(p),m=t.runWebGLProgram(x,[o,g],c.dtype);return t.disposeIntermediateTensorInfo(g),m}const jg={kernelName:Pi,backendName:"webgl",kernelFunc:Kg};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function qg(n,e,t,s){let o=new at(t,"max",!1);const r=s.runWebGLProgram(o,[n],"float32");o=new at(t,"max",!0,!0,e);const a=s.runWebGLProgram(o,[n],"float32");return[r,a]}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Yg={kernelName:Di,backendName:"webgl",kernelFunc:({inputs:n,attrs:e,backend:t})=>{const{x:s}=n,{filterSize:o,strides:r,pad:a,includeBatchInIndex:c}=e,i=t;F(s.shape.length===4,()=>`Error in maxPool: input must be rank 4 but got rank ${s.shape.length}.`);const l=[1,1];F(ct(r,l),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${r} and dilations '${l}'`);const u=lt(s.shape,o,r,l,a),[d,p]=qg(s,c,u,i);return[d,p]}};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Qg(n,e,t,s){const o=T(e),a=T(n.shape)/o,c=R({inputs:{x:n},attrs:{shape:[a,o]},backend:s}),i=Ae(c,"float32","mean",s),l=R({inputs:{x:i},attrs:{shape:t},backend:s});return s.disposeIntermediateTensorInfo(c),s.disposeIntermediateTensorInfo(i),l}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Zg={kernelName:Ai,backendName:"webgl",kernelFunc:({inputs:n,attrs:e,backend:t})=>{const{x:s}=n,{keepDims:o,axis:r}=e,a=t,c=s.shape.length,i=K(r,s.shape);let l=i;const u=ie(l,c),d=u!=null,p=a.shouldExecuteOnCPU([s]),h=[];let f=s;if(d){if(p){const v=a.texData.get(f.dataId).values,w=new Array(c);for(let y=0;y<w.length;y++)w[y]=s.shape[u[y]];const N=gn(v,s.shape,s.dtype,u,w);f=a.makeTensorInfo(w,s.dtype);const I=a.texData.get(f.dataId);I.values=N}else f=Ft(s,u,a);h.push(f),l=ce(l.length,c)}de("sum",l,c);const[g,x]=pe(f.shape,l);let m=g;o&&(m=ve(g,i));const C=Qg(f,x,m,a);for(const b of h)a.disposeIntermediateTensorInfo(b);return C}};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Jg(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:a}=s,c=o.shape.length,i=K(r,o.shape);let l=i;const u=ie(l,c);let d=o;u!=null&&(d=G({inputs:{x:o},backend:t,attrs:{perm:u}}),l=ce(l.length,o.shape.length)),de("min",l,c);const[p,h]=pe(d.shape,l),f=T(h),g=R({inputs:{x:d},backend:t,attrs:{shape:[-1,f]}}),x=Ae(g,g.dtype,"min",t);let m;if(a){const C=ve(p,i);m=R({inputs:{x},backend:t,attrs:{shape:C}})}else m=R({inputs:{x},backend:t,attrs:{shape:p}});return t.disposeIntermediateTensorInfo(g),t.disposeIntermediateTensorInfo(x),u!=null&&t.disposeIntermediateTensorInfo(d),m}const eC={kernelName:Fi,backendName:"webgl",kernelFunc:Jg};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const tC=Cn+`
  return min(a, b);
`,nC=`
  vec4 result = vec4(min(a, b));
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+De+`
  return result;
`,sC=B({opSnippet:tC,packedOpSnippet:nC,cpuKernelImpl:Ud}),oC={kernelName:_i,backendName:"webgl",kernelFunc:sC};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class rC{constructor(e,t,s){this.variableNames=["x"],this.outputShape=t.map((u,d)=>u[0]+e[d]+u[1]);const o=e.length,r=D(o),a=t.map(u=>u[0]).join(","),c=t.map((u,d)=>u[0]+e[d]).join(","),i=["coords[0]","coords[1]","coords[2]","coords[3]"].slice(0,o),l=s==="reflect"?0:1;if(o===1){this.userCode=`
        int start = ${a};
        int end = ${c};

        void main() {
          int outC = getOutputCoords();
          if (outC < start) {
            outC = start * 2 - outC - ${l};
          } else if(outC >= end) {
            outC = (end - 1) * 2 - outC + ${l};
          }
          setOutput(getX(outC - start));
        }
      `;return}this.userCode=`
      ${r} start = ${r}(${a});
      ${r} end = ${r}(${c});

      void main() {
        ${r} outC = getOutputCoords();
        for (int i = 0; i < ${o}; i++) {
          if (outC[i] < start[i]) {
            outC[i] = start[i] * 2 - outC[i] - ${l};
          } else if(outC[i] >= end[i]) {
            outC[i] = (end[i] - 1) * 2 - outC[i] + ${l};
          }
        }
        ${r} coords = outC - start;
        setOutput(getX(${i}));
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class aC{constructor(e,t,s){this.variableNames=["x"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=t.map((f,g)=>f[0]+e[g]+f[1]);const o=e.length,r=D(o),a=t.map(f=>f[0]).join(","),c=t.map((f,g)=>f[0]+e[g]).join(","),i=M("rc",o),l=M("source",o),u=`${i[o-1]} < ${this.outputShape[o-1]}`,d=o===1?"source":`vec2(${l.slice(-2).join()})`,p=s==="reflect"?0:1;let h="";if(o===1){const f=`
        ${r} source = rc;
        if (source < start) {
          source = start * 2 - source - ${p};
        } else if (source >= end) {
          source = (end - 1) * 2 - source + ${p};
        }
        source -= start;
      `;h=`
        ${r} rc = outputLoc;
        ${f}
        result[0] = getChannel(getX(${l.join()}), ${d});
        ${i[o-1]} += 1;
        if(${u}) {
          ${f}
          result[1] = getChannel(getX(${l.join()}), ${d});
        }
      `}else{const f=`
        ${r} source = rc;
        ${r} lt = ${r}(lessThan(source, start));
        ${r} gte = ${r}(greaterThanEqual(source, end));
        ${r} orig = 1 - (lt + gte);
        source = orig * source +
                lt * (start * 2 - source - ${p}) +
                gte * ((end - 1) * 2 - source + ${p});
        source -= start;
      `;h=`
        ${r} rc = outputLoc;
        ${f}
        result[0] = getChannel(getX(${l.join()}), ${d});
        ${i[o-1]} += 1;
        if(${u}) {
          ${f}
          result[1] = getChannel(getX(${l.join()}), ${d});
        }
        rc = outputLoc;
        ${i[o-2]} += 1;
        if(${i[o-2]} < ${this.outputShape[o-2]}) {
          ${f}
          result[2] = getChannel(getX(${l.join()}), ${d});
          ${i[o-1]} += 1;
          if(${u}) {
            ${f}
            result[3] = getChannel(getX(${l.join()}), ${d});
          }
        }
      `}this.userCode=`
      const ${r} start = ${r}(${a});
      const ${r} end = ${r}(${c});

      void main() {
        ${r} outputLoc = getOutputCoords();
        vec4 result = vec4(0.);
        ${h}
        setOutput(result);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const iC=({inputs:n,backend:e,attrs:t})=>{const{x:s}=n,{paddings:o,mode:r}=t,a=$().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new aC(s.shape,o,r):new rC(s.shape,o,r);return e.runWebGLProgram(a,[s],s.dtype)},cC={kernelName:Li,backendName:"webgl",kernelFunc:iC};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const lC=`if (b == 0.0) return NAN;
  return mod(a, b);`,uC=`
  vec4 result = mod(a, b);
  bvec4 isNaN = equal(b, vec4(0.0));
  `+De+`
  return result;
`,dC=B({opSnippet:lC,packedOpSnippet:uC}),pC={kernelName:Bi,backendName:"webgl",kernelFunc:dC};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class hC{constructor(e,t,s){this.variableNames=["probs"],this.customUniforms=[{name:"seed",type:"float"}],this.outputShape=[e,s],this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];

        float r = random(seed);
        float cdf = 0.0;

        for (int i = 0; i < ${t-1}; i++) {
          cdf += getProbs(batch, i);

          if (r < cdf) {
            setOutput(float(i));
            return;
          }
        }

        // If no other event happened, last event happened.
        setOutput(float(${t-1}));
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const fC=`
if (a == b) {
  return 1.0;
};
return a / b;`,mC=`
  // vec4 one = vec4(equal(a, b));
  // return one + (vec4(1.0) - one) * a / b;
  vec4 result = a / b;
  if(a.x == b.x) {
    result.x = 1.;
  }
  if(a.y == b.y) {
    result.y = 1.;
  }
  if(a.z == b.z) {
    result.z = 1.;
  }
  if(a.w == b.w) {
    result.w = 1.;
  }

  return result;
`,Oo=B({opSnippet:fC,packedOpSnippet:mC,checkOutOfBounds:!0}),xC={kernelName:Vi,backendName:"webgl",kernelFunc:Oo};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Zn="return a - b;",Po=B({opSnippet:Zn,packedOpSnippet:Zn,supportsComplex:!0,cpuKernelImpl:ip}),gC={kernelName:Ui,backendName:"webgl",kernelFunc:Po};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Do(n){const{inputs:e,backend:t,attrs:s}=n,{logits:o}=e,{dim:r}=s,a=K([r],o.shape),c=ko({inputs:{x:o},backend:t,attrs:{reductionIndices:a,keepDims:!1}}),i=ve(c.shape,a),l=R({inputs:{x:c},backend:t,attrs:{shape:i}}),u=Po({inputs:{a:o,b:l},backend:t}),d=To({inputs:{x:u},backend:t}),p=_t({inputs:{x:d},backend:t,attrs:{axis:a,keepDims:!1}}),h=R({inputs:{x:p},backend:t,attrs:{shape:i}}),f=Oo({inputs:{a:d,b:h},backend:t});return t.disposeIntermediateTensorInfo(c),t.disposeIntermediateTensorInfo(l),t.disposeIntermediateTensorInfo(u),t.disposeIntermediateTensorInfo(d),t.disposeIntermediateTensorInfo(p),t.disposeIntermediateTensorInfo(h),f}const CC={kernelName:Wi,backendName:"webgl",kernelFunc:Do};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function vC(n){const{inputs:e,backend:t,attrs:s}=n,{logits:o}=e,{numSamples:r,seed:a,normalized:c}=s,i=c?o:Do({inputs:{logits:o},backend:t,attrs:{dim:o.shape.length-1}}),l=i.shape[0],u=i.shape[1],d=new hC(l,u,r),p=[[a]],h=t.runWebGLProgram(d,[i],"int32",p);return c||t.disposeIntermediateTensorInfo(i),h}const bC={kernelName:Mi,backendName:"webgl",kernelFunc:vC};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const $C=oe+`
  return -x;
`,wC=`
  vec4 result = -x;
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`;function RC(n){const{inputs:e,backend:t}=n,{x:s}=e;if(t.shouldExecuteOnCPU([s])){const r=t.texData.get(s.dataId),[a,c]=Md(r.values,s.shape,s.dtype);return t.makeTensorInfo(c,s.dtype,a)}let o;return $().getBool("WEBGL_PACK_UNARY_OPERATIONS")?o=new Ce(s.shape,wC):o=new ue(s.shape,$C),t.runWebGLProgram(o,[s],s.dtype)}const SC={kernelName:Gi,backendName:"webgl",kernelFunc:RC};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const yC=Hi;function IC(n){kt("tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead");const{inputs:e,backend:t,attrs:s}=n,{boxes:o,scores:r}=e,{maxOutputSize:a,iouThreshold:c,scoreThreshold:i}=s,l=t.readSync(o.dataId),u=t.readSync(r.dataId),{selectedIndices:d}=yC(l,u,a,c,i);return t.makeTensorInfo([d.length],"int32",new Int32Array(d))}const TC={kernelName:zi,backendName:"webgl",kernelFunc:IC};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const EC=Ki;function NC(n){kt("tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead");const{inputs:e,backend:t,attrs:s}=n,{boxes:o,scores:r}=e,{maxOutputSize:a,iouThreshold:c,scoreThreshold:i,padToMaxOutputSize:l}=s,u=t.readSync(o.dataId),d=t.readSync(r.dataId),{selectedIndices:p,validOutputs:h}=EC(u,d,a,c,i,l);return[t.makeTensorInfo([p.length],"int32",new Int32Array(p)),t.makeTensorInfo([],"int32",new Int32Array([h]))]}const kC={kernelName:Xi,backendName:"webgl",kernelFunc:NC};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const OC=qi;function PC(n){kt("tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead");const{inputs:e,backend:t,attrs:s}=n,{boxes:o,scores:r}=e,{maxOutputSize:a,iouThreshold:c,scoreThreshold:i,softNmsSigma:l}=s,u=t.readSync(o.dataId),d=t.readSync(r.dataId),p=a,h=c,f=i,g=l,{selectedIndices:x,selectedScores:m}=OC(u,d,p,h,f,g);return[t.makeTensorInfo([x.length],"int32",new Int32Array(x)),t.makeTensorInfo([m.length],"float32",new Float32Array(m))]}const DC={kernelName:ji,backendName:"webgl",kernelFunc:PC};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class AC{constructor(e,t,s,o){this.variableNames=["indices"],this.outputShape=[e,t],this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int index = round(getIndices(coords.x));
        setOutput(mix(float(${o}), float(${s}),
                      float(index == coords.y)));
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const FC=n=>{const{inputs:e,backend:t,attrs:s}=n,{indices:o}=e,{dtype:r,depth:a,onValue:c,offValue:i}=s,l=T(o.shape),u=new AC(l,a,c,i),d=R({inputs:{x:o},backend:t,attrs:{shape:[l]}}),p=t.runWebGLProgram(u,[d],r);t.disposeIntermediateTensorInfo(d);const h=[...o.shape,a],f=R({inputs:{x:p},backend:t,attrs:{shape:h}});return t.disposeIntermediateTensorInfo(p),f},_C={kernelName:Yi,backendName:"webgl",kernelFunc:FC};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Nt(n){const{inputs:e,backend:t}=n,{x:s}=e;if(s.dtype==="complex64"){const o=pt({inputs:{input:s},backend:t}),r=Nt({inputs:{x:o},backend:t}),a=Lt({inputs:{input:s},backend:t}),c=Nt({inputs:{x:a},backend:t}),i=$e({inputs:{real:r,imag:c},backend:t});return t.disposeIntermediateTensorInfo(o),t.disposeIntermediateTensorInfo(r),t.disposeIntermediateTensorInfo(a),t.disposeIntermediateTensorInfo(c),i}else return ht({attrs:{shape:s.shape,dtype:s.dtype,value:s.dtype==="string"?"":0},backend:t})}const LC={kernelName:Qi,backendName:"webgl",kernelFunc:Nt};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Ao(n){const{inputs:e,backend:t}=n,{x:s}=e;if(s.dtype==="string")throw new Error("onesLike is not supported under string dtype");if(s.dtype==="complex64"){const o=pt({inputs:{input:s},backend:t}),r=Ao({inputs:{x:o},backend:t}),a=Lt({inputs:{input:s},backend:t}),c=Nt({inputs:{x:a},backend:t}),i=$e({inputs:{real:r,imag:c},backend:t});return t.disposeIntermediateTensorInfo(o),t.disposeIntermediateTensorInfo(r),t.disposeIntermediateTensorInfo(a),t.disposeIntermediateTensorInfo(c),i}else return ht({attrs:{shape:s.shape,dtype:s.dtype,value:1},backend:t})}const BC={kernelName:Zi,backendName:"webgl",kernelFunc:Ao};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function VC(n){const{inputs:e,backend:t,attrs:s}=n,{axis:o}=s;if(e.length===1)return Zt({inputs:{input:e[0]},backend:t,attrs:{dim:o}});const r=e[0].shape,a=e[0].dtype;e.forEach(u=>{ec(r,u.shape,"All tensors passed to stack must have matching shapes"),F(a===u.dtype,()=>"All tensors passed to stack must have matching dtypes")});const c=[],i=e.map(u=>{const d=Zt({inputs:{input:u},backend:t,attrs:{dim:o}});return c.push(d),d}),l=vo({inputs:i,backend:t,attrs:{axis:o}});return c.forEach(u=>t.disposeIntermediateTensorInfo(u)),l}const UC={kernelName:Ji,backendName:"webgl",kernelFunc:VC};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class WC{constructor(e,t,s){this.variableNames=["x"],this.customUniforms=[{name:"value",type:"float"}],this.outputShape=t.map((l,u)=>l[0]+e[u]+l[1]);const o=e.length,r=D(o),a=t.map(l=>l[0]).join(","),c=t.map((l,u)=>l[0]+e[u]).join(","),i=["coords[0]","coords[1]","coords[2]","coords[3]"].slice(0,o);if(o===1){this.userCode=`
        int start = ${a};
        int end = ${c};

        void main() {
          int outC = getOutputCoords();
          if (outC < start || outC >= end) {
            setOutput(value);
          } else {
            setOutput(getX(outC - start));
          }
        }
      `;return}this.userCode=`
      ${r} start = ${r}(${a});
      ${r} end = ${r}(${c});

      void main() {
        ${r} outC = getOutputCoords();
        if (any(lessThan(outC, start)) || any(greaterThanEqual(outC, end))) {
          setOutput(value);
        } else {
          ${r} coords = outC - start;
          setOutput(getX(${i}));
        }
      }
    `}}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class MC{constructor(e,t,s){this.variableNames=["x"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"value",type:"float"}],this.outputShape=t.map((g,x)=>g[0]+e[x]+g[1]);const o=e.length,r=D(o),a=t.map(g=>g[0]).join(","),c=t.map((g,x)=>g[0]+e[x]).join(","),i=M("rc",o),l=M("source",o),u=`${i[o-1]} < ${this.outputShape[o-1]}`,d=o===1?"source":`vec2(${l.slice(-2).join()})`,p=[`${r} rc = outputLoc;`,`${i[o-1]} += 1;
       if(${u}) {
      `,o===1?"":`}
       rc = outputLoc;
       ${i[o-2]} += 1;
       if(${i[o-2]} < ${this.outputShape[o-2]}) {`,o===1?"":`  ${i[o-1]} += 1;
         if(${u}) {`],h=o===1?"rc < start || rc >= end":"any(lessThan(rc, start)) || any(greaterThanEqual(rc, end))";let f="";for(let g=0,x=o===1?2:4;g<x;g++)f+=`
        ${p[g]}
        if (${h}) {
          result[${g}] = float(value);
        } else {
          ${r} source = rc - start;
          result[${g}] = getChannel(getX(${l.join()}), ${d});
        }
      `;f+=o===1?"} ":"}}",this.userCode=`
      const ${r} start = ${r}(${a});
      const ${r} end = ${r}(${c});

      void main() {
        ${r} outputLoc = getOutputCoords();
        vec4 result = vec4(0.);
        ${f}
        setOutput(result);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Fo=n=>{const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{paddings:r,constantValue:a}=s;if(T(o.shape)===0){const l=r.map((u,d)=>u[0]+o.shape[d]+u[1]);return ht({backend:t,attrs:{shape:l,value:a,dtype:o.dtype}})}const c=$().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new MC(o.shape,r,a):new WC(o.shape,r,a),i=[[a]];return t.runWebGLProgram(c,[o],o.dtype,i)},GC={kernelName:tc,backendName:"webgl",kernelFunc:Fo};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const zC=`
  if(a < 0.0 && floor(b) < b){
    return NAN;
  }
  if (b == 0.0) {
    return 1.0;
  }
  return (round(mod(b, 2.0)) != 1) ?
      pow(abs(a), b) : sign(a) * pow(abs(a), b);
`,HC=`
  // isModRound1 has 1 for components with round(mod(b, 2.0)) == 1, 0 otherwise.
  vec4 isModRound1 = vec4(equal(round(mod(b, 2.0)), ivec4(1)));
  vec4 multiplier = sign(a) * isModRound1 + (vec4(1.0) - isModRound1);
  vec4 result = multiplier * pow(abs(a), b);

  // Ensure that a^0 = 1, including 0^0 = 1 as this correspond to TF and JS
  bvec4 isExpZero = equal(b, vec4(0.0));
  result.r = isExpZero.r ? 1.0 : result.r;
  result.g = isExpZero.g ? 1.0 : result.g;
  result.b = isExpZero.b ? 1.0 : result.b;
  result.a = isExpZero.a ? 1.0 : result.a;

  bvec4 isNaN1 = lessThan(a, vec4(0.0));
  bvec4 isNaN2 = lessThan(floor(b), b);
  bvec4 isNaN = bvec4(isNaN1.x && isNaN2.x, isNaN1.y && isNaN2.y, isNaN1.z && isNaN2.z, isNaN1.w && isNaN2.w);
  `+De+`
  return result;
`,XC=B({opSnippet:zC,packedOpSnippet:HC}),KC={kernelName:nc,backendName:"webgl",kernelFunc:XC};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function jC(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{axis:r,keepDims:a}=s,c=o.shape.length,i=[],l=K(r,o.shape);let u=l;const d=ie(u,c);let p=o;d!=null&&(p=G({inputs:{x:o},backend:t,attrs:{perm:d}}),u=ce(u.length,c),i.push(p)),de("prod",u,c);let h;if(t.shouldExecuteOnCPU([p])){const f=t.texData.get(p.dataId).values,{outVals:g,outShape:x,outDtype:m}=zd(p.shape,p.dtype,f,u);h=t.makeTensorInfo(x,m,g)}else{const[f,g]=pe(p.shape,u),x=T(g),m=R({inputs:{x:p},backend:t,attrs:{shape:[-1,x]}}),C=sn(o.dtype),b=Ae(m,C,"prod",t);h=R({inputs:{x:b},backend:t,attrs:{shape:f}}),i.push(m),i.push(b)}if(a){i.push(h);const f=ve(h.shape,l);h=R({inputs:{x:h},backend:t,attrs:{shape:f}})}return i.forEach(f=>t.disposeIntermediateTensorInfo(f)),h}const qC={kernelName:sc,backendName:"webgl",kernelFunc:jC};/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function YC(n){const{inputs:e,backend:t,attrs:s}=n,{paramsNestedSplits:o,paramsDenseValues:r,indices:a}=e,{outputRaggedRank:c}=s,i=o.map(m=>t.readSync(m.dataId)),l=o.map(m=>m.shape),u=t.readSync(r.dataId),d=t.readSync(a.dataId),[p,h,f]=Hd(i,l,u,r.shape,r.dtype,d,a.shape,c),g=p.map(m=>t.makeTensorInfo([m.length],"int32",m)),x=t.makeTensorInfo(f,r.dtype,h);return g.concat([x])}const QC={kernelName:oc,backendName:"webgl",kernelFunc:YC};/**
 * @license
 * Copyright 2022 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function ZC(n){const{inputs:e,backend:t}=n,{starts:s,limits:o,deltas:r}=e,a=t.readSync(s.dataId),c=t.readSync(o.dataId),i=t.readSync(r.dataId),[l,u]=Xd(a,s.shape,s.dtype,c,o.shape,i,r.shape),d=t.makeTensorInfo([l.length],"int32",l),p=t.makeTensorInfo([u.length],s.dtype,u);return[d,p]}const JC={kernelName:rc,backendName:"webgl",kernelFunc:ZC};/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function e0(n){const{inputs:e,backend:t,attrs:s}=n,{shape:o,values:r,defaultValue:a,rowPartitionTensors:c}=e,{rowPartitionTypes:i}=s,l=t.readSync(o.dataId),u=t.readSync(r.dataId),d=t.readSync(a.dataId),p=c.map(x=>t.readSync(x.dataId)),h=c.map(x=>x.shape),[f,g]=Kd(l,o.shape,u,r.shape,r.dtype,d,a.shape,p,h,i);return t.makeTensorInfo(f,r.dtype,g)}const t0={kernelName:ac,backendName:"webgl",kernelFunc:e0};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const _o=n=>{const{backend:e,attrs:t}=n,{start:s,stop:o,step:r,dtype:a}=t,c=jd(s,o,r,a);return e.makeTensorInfo([c.length],a,c)},n0={kernelName:ic,backendName:"webgl",kernelFunc:_o};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const s0="return 1.0 / x;",o0=P({opSnippet:s0}),r0={kernelName:cc,backendName:"webgl",kernelFunc:o0};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const a0=oe+`
  return (x < 0.0) ? 0.0 : x;
`,i0=`
  vec4 result = x * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,c0=P({opSnippet:a0,packedOpSnippet:i0}),l0={kernelName:lc,backendName:"webgl",kernelFunc:c0};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const u0=oe+`
  return (x < 0.0) ? 0.0 : min(6.0, x);
`,d0=`
  vec4 result = min(x, vec4(6.)) * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,p0=P({opSnippet:u0,packedOpSnippet:d0}),h0={kernelName:uc,backendName:"webgl",kernelFunc:p0};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class f0{constructor(e,t,s,o,r){this.variableNames=["A"],this.outputShape=[];const[a,c,i,l]=e;this.outputShape=[a,t,s,l];const u=[o&&t>1?c-1:c,o&&s>1?i-1:i],d=[o&&t>1?t-1:t,o&&s>1?s-1:s];let p;r?p="(vec2(yRC) + vec2(0.5)) * effectiveInputOverOutputRatioRC - vec2(0.5)":p="vec2(yRC) * effectiveInputOverOutputRatioRC",this.userCode=`
      const vec2 effectiveInputOverOutputRatioRC = vec2(
          ${u[0]/d[0]},
          ${u[1]/d[1]});
      const vec2 inputShapeRC = vec2(${c}.0, ${i}.0);

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        ivec2 yRC = coords.yz;

        // Fractional source index.
        vec2 sourceFracIndexRC = ${p};

        // Compute the four integer indices.
        ivec2 sourceFloorRC = ivec2(max(sourceFracIndexRC, vec2(0.0)));
        ivec2 sourceCeilRC = ivec2(
          min(inputShapeRC - 1.0, ceil(sourceFracIndexRC)));

        float topLeft = getA(b, sourceFloorRC.x, sourceFloorRC.y, d);
        float bottomLeft = getA(b, sourceCeilRC.x, sourceFloorRC.y, d);
        float topRight = getA(b, sourceFloorRC.x, sourceCeilRC.y, d);
        float bottomRight = getA(b, sourceCeilRC.x, sourceCeilRC.y, d);

        vec2 fracRC = sourceFracIndexRC - vec2(sourceFloorRC);

        float top = topLeft + (topRight - topLeft) * fracRC.y;
        float bottom = bottomLeft + (bottomRight - bottomLeft) * fracRC.y;
        float newValue = top + (bottom - top) * fracRC.x;

        setOutput(newValue);
      }
    `}}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class m0{constructor(e,t,s,o,r){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[];const[a,c,i,l]=e;this.outputShape=[a,t,s,l];const u=[o&&t>1?c-1:c,o&&s>1?i-1:i],d=[o&&t>1?t-1:t,o&&s>1?s-1:s];let p;r?p="(vec3(yRC) + vec3(0.5)) * effectiveInputOverOutputRatioRC - vec3(0.5)":p="vec3(yRC) * effectiveInputOverOutputRatioRC",this.userCode=`
      const vec3 effectiveInputOverOutputRatioRC = vec3(
          ${u[0]/d[0]},
          ${u[1]/d[1]},
          ${u[1]/d[1]});
      const vec3 inputShapeRC = vec3(${c}.0, ${i}.0,
                                     ${i}.0);

      float getAValue(int b, int r, int c, int d) {
        return getChannel(getA(b, r, c, d), vec2(c, d));
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        // Calculate values for next column in yRC.z.
        ivec3 yRC = coords.yzz + ivec3(0, 0, 1);

        // Fractional source index.
        vec3 sourceFracIndexRC = ${p};

        // Compute the four integer indices.
        ivec3 sourceFloorRC = ivec3(max(sourceFracIndexRC, vec3(0.0)));
        ivec3 sourceCeilRC = ivec3(
          min(inputShapeRC - 1.0, ceil(sourceFracIndexRC)));

        // Should we calculate next column and row elements in 2x2 packed cell.
        bool hasNextCol = d < ${l-1};
        bool hasNextRow = coords.z < ${s-1};

        // In parallel, construct four corners for all four components in
        // packed 2x2 cell.
        vec4 topLeft = vec4(
          getAValue(b, sourceFloorRC.x, sourceFloorRC.y, d),
          hasNextCol ? getAValue(b, sourceFloorRC.x, sourceFloorRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceFloorRC.x, sourceFloorRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceFloorRC.x, sourceFloorRC.z, d + 1) : 0.0);

        vec4 bottomLeft = vec4(
          getAValue(b, sourceCeilRC.x, sourceFloorRC.y, d),
          hasNextCol ? getAValue(b, sourceCeilRC.x, sourceFloorRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceCeilRC.x, sourceFloorRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceCeilRC.x, sourceFloorRC.z, d + 1) : 0.0);

        vec4 topRight = vec4(
          getAValue(b, sourceFloorRC.x, sourceCeilRC.y, d),
          hasNextCol ? getAValue(b, sourceFloorRC.x, sourceCeilRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceFloorRC.x, sourceCeilRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceFloorRC.x, sourceCeilRC.z, d + 1) : 0.0);

        vec4 bottomRight = vec4(
          getAValue(b, sourceCeilRC.x, sourceCeilRC.y, d),
          hasNextCol ? getAValue(b, sourceCeilRC.x, sourceCeilRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceCeilRC.x, sourceCeilRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceCeilRC.x, sourceCeilRC.z, d + 1) : 0.0);

        vec3 fracRC = sourceFracIndexRC - vec3(sourceFloorRC);

        vec4 top = mix(topLeft, topRight, fracRC.yyzz);
        vec4 bottom = mix(bottomLeft, bottomRight, fracRC.yyzz);
        vec4 newValue = mix(top, bottom, fracRC.x);

        setOutput(newValue);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function x0(n){const{inputs:e,backend:t,attrs:s}=n,{images:o}=e,{alignCorners:r,halfPixelCenters:a,size:c}=s,[i,l]=c,u=$().getBool("WEBGL_PACK_IMAGE_OPERATIONS")?new m0(o.shape,i,l,r,a):new f0(o.shape,i,l,r,a);return t.runWebGLProgram(u,[o],"float32")}const g0={kernelName:dc,backendName:"webgl",kernelFunc:x0};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class C0{constructor(e,t,s){this.variableNames=["dy"],this.outputShape=[],this.outputShape=t;const[,o,r]=t,[,a,c]=e,i=[s&&a>1?o-1:o,s&&c>1?r-1:r],l=[s&&a>1?a-1:a,s&&c>1?c-1:c],u=i[0]/l[0],d=i[1]/l[1],p=1/u,h=1/d,f=Math.ceil(p)*2+2,g=Math.ceil(h)*2+2;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        int r = coords[1];
        int c = coords[2];

        float accumulator = 0.0;

        const float heightScale = float(${u});
        const float widthScale = float(${d});

        const float invHeightScale = float(${p});
        const float invWidthScale = float(${h});

        const int winHeight = int(${f});
        const int winWidth = int(${g});

        // Compute bounds for where in dy we will look
        float startRLerp = floor(float(r) * invHeightScale);
        int startDyR = int(startRLerp - float(winHeight / 2));

        float startCLerp = floor(float(c) * invWidthScale);
        int startDyC = int(startCLerp - float(winWidth / 2));

        // Loop over dy
        for (int dyROffset = 0; dyROffset < winHeight; dyROffset++) {
          int dyR = dyROffset + startDyR;

          // Guard against the window exceeding the bounds of dy
          if (dyR < 0 || dyR >= ${a}) {
            continue;
          }

          for (int dyCOffset = 0; dyCOffset < winWidth; dyCOffset++) {
            int dyC = dyCOffset + startDyC;

            // Guard against the window exceeding the bounds of dy
            if (dyC < 0 || dyC >= ${c}) {
              continue;
            }

            float dxR = float(dyR) * heightScale;
            int topDxRIndex = int(floor(dxR));
            int bottomDxRIndex = int(min(ceil(dxR), ${o-1}.0));
            float dxRLerp = dxR - float(topDxRIndex);
            float inverseDxRLerp = 1.0 - dxRLerp;

            float dxC = float(dyC) * widthScale;
            int leftDxCIndex = int(floor(dxC));
            int rightDxCIndex = int(min(ceil(dxC), ${r-1}.0));
            float dxCLerp = dxC - float(leftDxCIndex);
            float inverseDxCLerp = 1.0 - dxCLerp;

            if (r == topDxRIndex && c == leftDxCIndex) {
              // topLeft
              accumulator +=
                getDy(b, dyR, dyC, d) * inverseDxRLerp * inverseDxCLerp;
            }

            if (r == topDxRIndex && c == rightDxCIndex) {
              // topRight
              accumulator += getDy(b, dyR, dyC, d) * inverseDxRLerp * dxCLerp;
            }

            if (r == bottomDxRIndex && c == leftDxCIndex) {
              // bottomLeft
              accumulator += getDy(b, dyR, dyC, d) * dxRLerp * inverseDxCLerp;
            }

            if (r == bottomDxRIndex && c == rightDxCIndex) {
              // bottomRight
              accumulator += getDy(b, dyR, dyC, d) * dxRLerp * dxCLerp;
            }
          }
        }
        // End loop over dy

        setOutput(accumulator);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function v0(n){const{inputs:e,backend:t,attrs:s}=n,{images:o,dy:r}=e,{alignCorners:a}=s,c=new C0(r.shape,o.shape,a);return t.runWebGLProgram(c,[r],r.dtype)}const b0={kernelName:pc,backendName:"webgl",kernelFunc:v0};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class $0{constructor(e,t,s,o,r){this.variableNames=["A"],this.outputShape=[];const[a,c,i,l]=e;this.outputShape=[a,t,s,l];const u=[o&&t>1?c-1:c,o&&s>1?i-1:i],d=[o&&t>1?t-1:t,o&&s>1?s-1:s],p=o?"0.5":"0.0";let h;r?h="max((vec2(yRC) + vec2(0.5)) * effectiveInputOverOutputRatioRC, vec2(0.0))":h="vec2(yRC) * effectiveInputOverOutputRatioRC",this.userCode=`
      const vec2 effectiveInputOverOutputRatioRC = vec2(
          ${u[0]/d[0]},
          ${u[1]/d[1]});
      const vec2 inputShapeRC = vec2(${c}.0, ${i}.0);

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        ivec2 yRC = coords.yz;

        // Fractional source index.
        vec2 sourceFracIndexRC = ${h};

        // Compute the coordinators of nearest neighbor point.
        ivec2 sourceNearestRC = ivec2(
          min(inputShapeRC - 1.0, floor(sourceFracIndexRC + ${p})));
        float newValue = getA(b, sourceNearestRC.x, sourceNearestRC.y, d);

        setOutput(newValue);
      }
    `}}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class w0{constructor(e,t,s,o,r){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[];const[a,c,i,l]=e;this.outputShape=[a,t,s,l];const u=[o&&t>1?c-1:c,o&&s>1?i-1:i],d=[o&&t>1?t-1:t,o&&s>1?s-1:s],p=o?"0.5":"0.0";let h;r?h="max((vec3(yRC) + vec3(0.5)) * effectiveInputOverOutputRatioRC, vec3(0.0))":h="vec3(yRC) * effectiveInputOverOutputRatioRC",this.userCode=`
      const vec3 effectiveInputOverOutputRatioRC = vec3(
          ${u[0]/d[0]},
          ${u[1]/d[1]},
          ${u[1]/d[1]});
      const vec3 inputShapeRC = vec3(${c}.0, ${i}.0,
                                     ${i}.0);

      float getAValue(int b, int r, int c, int d) {
        return getChannel(getA(b, r, c, d), vec2(c, d));
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        // Calculate values for next column in yRC.z.
        ivec3 yRC = coords.yzz + ivec3(0, 0, 1);

        // Fractional source index.
        vec3 sourceFracIndexRC = ${h};

        // Compute the coordinators of nearest neighbor point.
        ivec3 sourceNearestRC = ivec3(
          min(inputShapeRC - 1.0, floor(sourceFracIndexRC + ${p})));

        // Should we calculate next column and row elements in 2x2 packed cell.
        bool hasNextCol = d < ${l-1};
        bool hasNextRow = coords.z < ${s-1};

        vec4 newValue = vec4(
          getAValue(b, sourceNearestRC.x, sourceNearestRC.y, d),
          hasNextCol ? getAValue(b, sourceNearestRC.x, sourceNearestRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceNearestRC.x, sourceNearestRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceNearestRC.x, sourceNearestRC.z, d + 1) : 0.0);

        setOutput(newValue);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function R0(n){const{inputs:e,backend:t,attrs:s}=n,{images:o}=e,{alignCorners:r,halfPixelCenters:a,size:c}=s,[i,l]=c,u=$().getBool("WEBGL_PACK_IMAGE_OPERATIONS")?new w0(o.shape,i,l,r,a):new $0(o.shape,i,l,r,a);return t.runWebGLProgram(u,[o],o.dtype)}const S0={kernelName:hc,backendName:"webgl",kernelFunc:R0};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class y0{constructor(e,t,s){this.variableNames=["dy"],this.outputShape=[],this.outputShape=t;const[,o,r]=t,[,a,c]=e,i=[s&&a>1?o-1:o,s&&c>1?r-1:r],l=[s&&a>1?a-1:a,s&&c>1?c-1:c],u=i[0]/l[0],d=i[1]/l[1],p=1/u,h=1/d,f=Math.ceil(p)*2+2,g=Math.ceil(h)*2+2;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        int r = coords[1];
        int c = coords[2];

        float accumulator = 0.0;

        const float heightScale = float(${u});
        const float widthScale = float(${d});

        const float invHeightScale = float(${p});
        const float invWidthScale = float(${h});

        const int winHeight = int(${f});
        const int winWidth = int(${g});

        // Compute bounds for where in dy we will look
        float startRLerp = floor(float(r) * invHeightScale);
        int startDyR = int(floor(startRLerp - float(winHeight / 2)));

        float startCLerp = floor(float(c) * invWidthScale);
        int startDyC = int(floor(startCLerp - float(winWidth / 2)));

        // Loop over dy
        for (int dyROffset = 0; dyROffset < winHeight; dyROffset++) {
          int dyR = dyROffset + startDyR;

          // Guard against the window exceeding the bounds of dy
          if (dyR < 0 || dyR >= ${a}) {
            continue;
          }

          for (int dyCOffset = 0; dyCOffset < winWidth; dyCOffset++) {
            int dyC = dyCOffset + startDyC;

            // Guard against the window exceeding the bounds of dy
            if (dyC < 0 || dyC >= ${c}) {
              continue;
            }

            float sourceFracRow =
              float(${i[0]}) *
                (float(dyR) / float(${l[0]}));

            float sourceFracCol =
                float(${i[1]}) *
                  (float(dyC) / float(${l[1]}));

            int sourceNearestRow = int(min(
                float(int(${o}) - 1),
                ${s} ? float(round(sourceFracRow)) :
                                  float(floor(sourceFracRow))));

            int sourceNearestCol = int(min(
                float(int(${r}) - 1),
                ${s} ? float(round(sourceFracCol)) :
                                  float(floor(sourceFracCol))));

            if (r == sourceNearestRow && c == sourceNearestCol) {
              accumulator += getDy(b, dyR, dyC, d);
            }
          }
        }
        // End loop over dy

        setOutput(accumulator);
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function I0(n){const{inputs:e,backend:t,attrs:s}=n,{images:o,dy:r}=e,{alignCorners:a}=s,c=new y0(r.shape,o.shape,a);return t.runWebGLProgram(c,[r],r.dtype)}const T0={kernelName:fc,backendName:"webgl",kernelFunc:I0};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class E0{constructor(e,t){this.variableNames=["x"];const s=e.length;if(s>4)throw new Error(`WebGL backend: Reverse of rank-${s} tensor is not yet supported`);if(this.outputShape=e,s===1){this.userCode=`
        void main() {
          int coord = getOutputCoords();
          setOutput(getX(${e[0]} - coord - 1));
        }
      `;return}const o=c=>t.indexOf(c)!==-1&&e[c]!==1?`${e[c]} - coords[${c}] - 1`:`coords[${c}]`,r=e.map((c,i)=>o(i)).join(","),a=D(s);this.userCode=`
      void main() {
        ${a} coords = getOutputCoords();
        setOutput(getX(${r}));
      }
    `}}/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class N0{constructor(e,t){this.variableNames=["x"],this.packedInputs=!0,this.packedOutput=!0;const s=e.length;if(s>4)throw new Error(`WebGL backend: Reverse of rank-${s} tensor is not yet supported`);this.outputShape=e;const o=M("rc",s),r=`${o[s-1]} + 1 < ${this.outputShape[s-1]}`,a=`${o[s-2]} + 1 < ${this.outputShape[s-2]}`,c=D(s);s===1?this.userCode=`
        void main(){
          int rc = getOutputCoords();
          vec4 result = vec4(0.);
          result.r = getChannel(getX(${e[0]} - rc - 1),
            ${e[0]} - rc - 1);
          if(${r}){
              result.g = getChannel(getX(${e[0]} - (rc  + 1) - 1),
                ${e[0]} - (rc  + 1) - 1);
          }
          setOutput(result);
        }
      `:this.userCode=`
        void main() {
          ${c} rc = getOutputCoords();
          vec4 result = vec4(0.);
          result.r = ${i(o.slice())};
          if(${r}){
            result.g = ${l(o.slice())};
          }
          if(${a}) {
            result.b = ${u(o.slice())};
            if(${r}) {
              result.a = ${d(o.slice())};
            }
          }
          setOutput(result);
        }
    `;function i(f){return p(f)}function l(f){return f[s-1]="("+f[s-1]+" + 1)",p(f)}function u(f){return f[s-2]="("+f[s-2]+" + 1)",p(f)}function d(f){return f[s-1]="("+f[s-1]+" + 1)",f[s-2]="("+f[s-2]+" + 1)",p(f)}function p(f){const g=e.map((C,b)=>h(b,f)),x=g.join(","),m=g.slice(-2).join(",");return`getChannel(getX(${x}), vec2(${m}))`}function h(f,g){return t.indexOf(f)!==-1&&e[f]!==1?`${e[f]} - ${g[f]} - 1`:`${g[f]}`}}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function k0(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{dims:r}=s,a=o.shape.length,c=K(r,o.shape);if(a===0)return Y({inputs:{x:o},backend:t});const i=$().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new N0(o.shape,c):new E0(o.shape,c);return t.runWebGLProgram(i,[o],o.dtype)}const O0={kernelName:mc,backendName:"webgl",kernelFunc:k0};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class P0{constructor(e,t){this.variableNames=["Image"],this.outputShape=[],this.customUniforms=[{name:"params",type:"vec4"}];const s=e[1],o=e[2];this.outputShape=e;let r="";typeof t=="number"?r=`float outputValue = ${t.toFixed(2)};`:r=`
        vec3 fill = vec3(${t.join(",")});
        float outputValue = fill[coords[3]];`,this.userCode=`
        void main() {
          ivec4 coords = getOutputCoords();
          int x = coords[2];
          int y = coords[1];
          float coordXFloat = (float(x) - params[0]) * params[3] -
            (float(y) - params[1]) * params[2];
          float coordYFloat = (float(x) - params[0]) * params[2] +
            (float(y) - params[1]) * params[3];
          int coordX = int(round(coordXFloat + params[0]));
          int coordY = int(round(coordYFloat + params[1]));
          ${r}
          if(coordX >= 0 && coordX < ${o} && coordY >= 0 && coordY < ${s}) {
            outputValue = getImage(coords[0], coordY, coordX, coords[3]);
          }
          setOutput(outputValue);
        }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const D0={kernelName:xc,backendName:"webgl",kernelFunc:({inputs:n,attrs:e,backend:t})=>{const{image:s}=n,{radians:o,fillValue:r,center:a}=e,c=t,i=new P0(s.shape,r),[l,u]=gc(a,s.shape[1],s.shape[2]),d=[[l,u,Math.sin(o),Math.cos(o)]];return c.runWebGLProgram(i,[s],s.dtype,d)}};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const A0=`
  // OpenGL ES does not support round function.
  // The algorithm is based on banker's rounding.
  float base = floor(x);
  if ((x - base) < 0.5) {
    return floor(x);
  } else if ((x - base) > 0.5) {
    return ceil(x);
  } else {
    if (mod(base, 2.0) == 0.0) {
      return base;
    } else {
      return base + 1.0;
    }
  }
`,F0=P({opSnippet:A0}),_0={kernelName:Cc,backendName:"webgl",kernelFunc:F0};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const L0="return inversesqrt(x);",B0=P({opSnippet:L0,cpuKernelImpl:qd}),V0={kernelName:vc,backendName:"webgl",kernelFunc:B0};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class $n{constructor(e,t,s,o,r,a,c=!0,i=!1){this.variableNames=["updates","indices","defaultValue"],this.outputShape=a;const l=D(r.length),u=D(a.length);let d="";s===1?d="i":s===2&&(d="i, j");const p=`getIndices(${d})`;let h="";o===1?h="i":o===2&&(h="i, coords[1]");const f=`getUpdates(${h})`;let g="";i&&(g="coords[0], coords[1]");const x=`getDefaultValue(${g})`,m=t>1?"strides[j]":"strides";this.userCode=`
        ${l} strides = ${l}(${r});

        void main() {
          ${u} coords = getOutputCoords();
          float sum = 0.0;
          bool found = false;
          for (int i = 0; i < ${e}; i++) {
            int flattenedIndex = 0;
            for (int j = 0; j < ${t}; j++) {
              int index = round(${p});
              flattenedIndex += index * ${m};
            }
            if (flattenedIndex == coords[0]) {
              sum += ${f};
              found = true;
            }
          }
          setOutput(mix(${x}, sum, float(found)));
        }
      `}}/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class U0{constructor(e,t,s,o,r,a,c=!0,i=!1){this.variableNames=["updates","indices","defaultValue"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=a;const l=D(r.length),u=D(a.length);let d="";s===1?d="i":s===2&&(d="i, j");const p=`getIndices(${d})`;let h="";o===1?h="i":o===2&&(h="i, coords[1]");const f=`getUpdates(${h})`;let g="";i&&(g="coords[0], coords[1]");const x=`getDefaultValue(${g})`,m=t>1?"strides[j]":"strides",C=t>1?"strides[j + 1]":"strides";this.userCode=`
        ${l} strides = ${l}(${r});

        void main() {
          ${u} coords = getOutputCoords();
          vec4 sum = vec4(0.);
          vec4 found = vec4(0.);
          for (int i = 0; i < ${e}; i+=2) {
            ivec2 flattenedIndex = ivec2(0);
            for (int j = 0; j < ${t}; j+=2) {
              ivec4 index = round(${p});
              flattenedIndex += index.xz * ${m};
              if (j + 1 < ${t}) {
                flattenedIndex += index.yw * ${C};
              }
            }
            if (flattenedIndex[0] == coords[0] || flattenedIndex[1] == coords[0] ||
                flattenedIndex[0] == coords[0] + 1 || flattenedIndex[1] == coords[0] + 1) {
              vec4 updVals = ${f};
              if (flattenedIndex[0] == coords[0]) {
                sum.xy += updVals.xy;
                found.xy = vec2(1.);
              } else if (flattenedIndex[0] == coords[0] + 1) {
                sum.zw += updVals.xy;
                found.zw = vec2(1.);
              }
              if (flattenedIndex[1] == coords[0]) {
                sum.xy += updVals.zw;
                found.xy = vec2(1.);
              } else if (flattenedIndex[1] == coords[0] + 1) {
                sum.zw += updVals.zw;
                found.zw = vec2(1.);
              }
            }
          }
          setOutput(mix(${x}, sum, found));
        }
      `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function W0(n){const{inputs:e,backend:t,attrs:s}=n,{indices:o,updates:r}=e,{shape:a}=s,{sliceRank:c,numUpdates:i,sliceSize:l,strides:u,outputSize:d}=rn(r,o,a),p=[d/l,l];if(d===0)return t.makeTensorInfo(a,o.dtype);const h=R({inputs:{x:o},backend:t,attrs:{shape:[i,c]}}),f=R({inputs:{x:r},backend:t,attrs:{shape:[i,l]}}),g=t.makeTensorInfo([],"float32",new Float32Array([0]));let x;$().getBool("WEBGL_PACK")?x=new U0(i,c,h.shape.length,f.shape.length,u,p):x=new $n(i,c,h.shape.length,f.shape.length,u,p);const m=t.runWebGLProgram(x,[f,h,g],f.dtype),C=R({inputs:{x:m},backend:t,attrs:{shape:a}});return t.disposeIntermediateTensorInfo(h),t.disposeIntermediateTensorInfo(f),t.disposeIntermediateTensorInfo(m),t.disposeIntermediateTensorInfo(g),C}const M0={kernelName:bc,backendName:"webgl",kernelFunc:W0};/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class G0{constructor(e,t,s,o){this.variableNames=["sortedSequence","values"],this.customUniforms=[{name:"numInputs",type:"int"}],this.outputShape=[e,s];const r="while (left < right) {",a=`for (int i = 0; i < ${Math.ceil(Math.log2(t+1))}; ++i) { if (left >= right) break;`,c=$().getNumber("WEBGL_VERSION")===2?r:a,i=o==="left"?"<":"<=";this.userCode=`
       int findBound(int batch, float value) {
         int left = 0;
         int right = numInputs;
         int mid;
         ${c}
           mid = (left + right) / 2;
           if (getSortedSequence(batch, mid) ${i} value) {
             left = mid + 1;
           } else {
             right = mid;
           }
         }
         return right;
       }

       void main() {
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int valueIndex = coords[1];

         float value = getValues(batch, valueIndex);

         setOutput(float(findBound(batch, value)));
       }
     `}}/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function z0(n){const{inputs:e,backend:t,attrs:s}=n,{sortedSequence:o,values:r}=e,{side:a}=s,c=new G0(o.shape[0],o.shape[1],r.shape[1],a),i=[[o.shape[1]]];return t.runWebGLProgram(c,[o,r],"int32",i)}const H0={kernelName:$c,backendName:"webgl",kernelFunc:z0};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class X0{constructor(e,t,s){this.variableNames=["c","a","b"],this.outputShape=t;let o,r;if(s>4)throw Error(`Where for rank ${s} is not yet supported`);if(s===1)r="resRC",o="resRC";else{const c=["resRC.x","resRC.y","resRC.z","resRC.w"],i=[],l=[];for(let u=0;u<t.length;u++)l.push(`${c[u]}`),u<e&&i.push(`${c[u]}`);o=i.join(),r=l.join()}const a=D(s);this.userCode=`
      void main() {
        ${a} resRC = getOutputCoords();
        float cVal = getC(${o});
        if (cVal >= 1.0) {
          setOutput(getA(${r}));
        } else {
          setOutput(getB(${r}));
        }
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function K0(n){const{inputs:e,backend:t}=n,{condition:s,t:o,e:r}=e,a=new X0(s.shape.length,o.shape,o.shape.length);return t.runWebGLProgram(a,[s,o,r],Ie(o.dtype,r.dtype))}const j0={kernelName:wc,backendName:"webgl",kernelFunc:K0};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const q0=`
  // Stable and Attracting Fixed Point (0, 1) for Normalized Weights.
  // see: https://arxiv.org/abs/1706.02515
  float scaleAlpha = ${Sc};
  float scale = ${yc};
  return (x >= 0.0) ? scale * x : scaleAlpha * (exp(x) - 1.0);
`,Y0=P({opSnippet:q0}),Q0={kernelName:Rc,backendName:"webgl",kernelFunc:Y0};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Z0=Ke+`
  return 1.0 / (1.0 + exp(-1.0 * x));
`,J0=`
  vec4 result = 1.0 / (1.0 + exp(-1.0 * x));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,ev=P({opSnippet:Z0,packedOpSnippet:J0,cpuKernelImpl:Qd}),tv={kernelName:Ic,backendName:"webgl",kernelFunc:ev};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const nv=`
  if (isnan(x)) { return 0.0; }
  return sign(x);
`,sv=P({opSnippet:nv}),ov={kernelName:Tc,backendName:"webgl",kernelFunc:sv};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const rv=Ke+`
  return sin(x);
`,av=`
  vec4 result = sin(x);
  bvec4 isNaN = isnan(x);
  ${De}
  return result;
`,iv=P({opSnippet:rv,packedOpSnippet:av}),cv={kernelName:Ec,backendName:"webgl",kernelFunc:iv};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const lv=`
  float e2x = exp(x);
  return (e2x - 1.0 / e2x) / 2.0;
`,uv=P({opSnippet:lv}),dv={kernelName:Nc,backendName:"webgl",kernelFunc:uv};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const pv=`
  float epsilon = 1.1920928955078125e-7;
  float threshold = log(epsilon) + 2.0;

  bool too_large = x > -threshold;
  bool too_small = x < threshold;

  float result;
  float exp_x = exp(x);

  if (too_large){
    result = x;
  }
  else if (too_small){
    result = exp_x;
  }
  else{
    result = log(exp_x + 1.0);
  }
  return result;
`,hv=P({opSnippet:pv}),fv={kernelName:kc,backendName:"webgl",kernelFunc:hv};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const mv=n=>{const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{blockShape:r,paddings:a}=s;F(o.shape.length<=4,()=>"spaceToBatchND for rank > 4 with a WebGL backend not implemented yet");const c=r.reduce((m,C)=>m*C),i=[[0,0]];i.push(...a);for(let m=1+r.length;m<o.shape.length;++m)i.push([0,0]);const l=[],u=Fo({inputs:{x:o},backend:t,attrs:{paddings:i,constantValue:0}}),d=as(u.shape,r,c,!1),p=is(d.length,r.length,!1),h=cs(u.shape,r,c,!1),f=R({inputs:{x:u},backend:t,attrs:{shape:d}}),g=G({inputs:{x:f},backend:t,attrs:{perm:p}}),x=R({inputs:{x:g},backend:t,attrs:{shape:h}});return l.push(u),l.push(f),l.push(g),l.forEach(m=>t.disposeIntermediateTensorInfo(m)),x},xv={kernelName:Oc,backendName:"webgl",kernelFunc:mv};/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function gv(n){const{inputs:e,backend:t}=n,{indices:s,values:o,denseShape:r,defaultValue:a}=e;if(r.shape.length!==1)throw new Error(`Dense shape must be a vector, saw:
         ${r.shape}`);if(s.shape.length!==2)throw new Error(`Indices must be a matrix, saw:
         ${s.shape}`);if(o.shape.length!==1)throw new Error(`Values must be a vector, saw:
         ${o.shape}`);if(a.shape.length!==0)throw new Error(`Default value must be a scalar, saw:
        ${a.shape}`);const c=t.readSync(s.dataId),i=t.readSync(o.dataId),l=t.readSync(r.dataId),u=t.readSync(a.dataId)[0],[d,p,h,f,g]=Jd(c,s.shape,s.dtype,i,o.dtype,l,u);return[t.makeTensorInfo(p,s.dtype,d),t.makeTensorInfo([p[0]],o.dtype,h),t.makeTensorInfo([f.length],"bool",new Uint8Array(f.map(x=>Number(x)))),t.makeTensorInfo([g.length],s.dtype,new Int32Array(g))]}const Cv={kernelName:Pc,backendName:"webgl",kernelFunc:gv};/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function vv(n){const{inputs:e,backend:t}=n,{inputIndices:s,inputShape:o,newShape:r}=e;if(s.shape.length!==2)throw new Error(`Input indices should be a matrix but received shape ${s.shape}`);if(o.shape.length!==1)throw new Error(`Input shape should be a vector but received shape ${o.shape}`);if(r.shape.length!==1)throw new Error(`Target shape should be a vector but received shape ${r.shape}`);const a=Array.from(t.readSync(o.dataId)),c=t.readSync(s.dataId),i=Array.from(t.readSync(r.dataId)),[l,u,d]=ep(c,s.shape,s.dtype,a,i);return[t.makeTensorInfo(u,s.dtype,l),t.makeTensorInfo([d.length],r.dtype,new Int32Array(d))]}const bv={kernelName:Dc,backendName:"webgl",kernelFunc:vv};/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function $v(n){const{inputs:e,backend:t}=n,{data:s,indices:o,segmentIds:r}=e;if(s.shape.length<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(o.shape.length!==1)throw new Error(`Indices should be a vector but received shape
              ${o.shape}`);if(r.shape.length!==1)throw new Error(`Segment ids should be a vector but received shape
              ${r.shape}`);const a=t.readSync(s.dataId),c=t.readSync(o.dataId),i=t.readSync(r.dataId),[l,u]=ro(a,s.shape,s.dtype,c,i,!0);return t.makeTensorInfo(u,s.dtype,l)}const wv={kernelName:Ac,backendName:"webgl",kernelFunc:$v};/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Rv(n){const{inputs:e,backend:t}=n,{data:s,indices:o,segmentIds:r}=e;if(s.shape.length<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(o.shape.length!==1)throw new Error(`Indices should be a vector but received shape
             ${o.shape}`);if(r.shape.length!==1)throw new Error(`Segment ids should be a vector but received shape
             ${r.shape}`);const a=t.readSync(s.dataId),c=t.readSync(o.dataId),i=t.readSync(r.dataId),[l,u]=ro(a,s.shape,s.dtype,c,i);return t.makeTensorInfo(u,s.dtype,l)}const Sv={kernelName:Fc,backendName:"webgl",kernelFunc:Rv};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function yv(n){const{inputs:e,backend:t,attrs:s}=n,{sparseIndices:o,sparseValues:r,defaultValue:a}=e,{outputShape:c}=s,{sliceRank:i,numUpdates:l,sliceSize:u,strides:d,outputSize:p}=rn(r,o,c),h=!1;if(r.dtype==="string"){const m=t.bufferSync(o),C=t.bufferSync(r),b=tn(t.readSync(a.dataId)[0]),v=Yd(m,C,c,p,u,l,i,d,b,h);return t.makeTensorInfo(c,v.dtype,v.values)}const f=new $n(l,i,o.shape.length,r.shape.length,d,[p,1],h),g=t.runWebGLProgram(f,[r,o,a],r.dtype),x=R({inputs:{x:g},backend:t,attrs:{shape:c}});return t.disposeIntermediateTensorInfo(g),x}const Iv={kernelName:_c,backendName:"webgl",kernelFunc:yv};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Tv(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{numOrSizeSplits:r,axis:a}=s,c=K(a,o.shape)[0],i=Bc(o,r,c),l=o.shape.length,u=new Array(l).fill(0),d=o.shape.slice();return i.map(p=>{const h=[...d];h[c]=p;const f=je({inputs:{x:o},backend:t,attrs:{begin:u,size:h}});return u[c]+=p,f})}const Ev={kernelName:Lc,backendName:"webgl",kernelFunc:Tv};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Jn="return sqrt(x);",Nv=P({opSnippet:Jn,packedOpSnippet:Jn,cpuKernelImpl:tp}),kv={kernelName:Vc,backendName:"webgl",kernelFunc:Nv};/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Ov="return x * x;",Pv=P({opSnippet:Ov}),Dv={kernelName:Uc,backendName:"webgl",kernelFunc:Pv};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const es="return (a - b) * (a - b);",Av=B({opSnippet:es,packedOpSnippet:es}),Fv={kernelName:Wc,backendName:"webgl",kernelFunc:Av};/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function _v(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e;if(o.dtype!=="string")throw new Error("Input must be of datatype string");const r=t.readSync(o.dataId),a=nt(r),c=np(a,"string",s);return t.makeTensorInfo(o.shape,"string",c)}const Lv={kernelName:Mc,backendName:"webgl",kernelFunc:_v};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Bv({inputs:n,attrs:e,backend:t}){const{x:s}=n,o=oe+`
    return x > 0.0 ? 1.0 : float(${e.alpha});
  `,r=new ue(s.shape,o);return t.runWebGLProgram(r,[s],s.dtype)}const Vv={kernelName:Gc,backendName:"webgl",kernelFunc:Bv};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class Uv{constructor(e,t,s){this.variableNames=["x"],this.outputShape=s;const o=s.length,r=D(s.length),a=D(s.length);let c="";if(o===1)c="coords * strides + begin";else{let i=0;c=s.map((l,u)=>(i++,s.length===1?`coords * strides[${u}] + begin[${u}]`:`coords[${i-1}] * strides[${u}] + begin[${u}]`)).join(",")}this.userCode=`
      ${r} begin = ${r}(${e});
      ${r} strides = ${r}(${t});

      void main() {
        ${a} coords = getOutputCoords();
        setOutput(getX(${c}));
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Wv(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{begin:r,end:a,strides:c,beginMask:i,endMask:l,ellipsisMask:u,newAxisMask:d,shrinkAxisMask:p}=s,{finalShapeSparse:h,finalShape:f,isIdentity:g,sliceDim0:x,isSimpleSlice:m,begin:C,end:b,strides:v}=Hc(o.shape,r,a,c,i,l,u,d,p);let w;if(g)w=R({inputs:{x:o},backend:t,attrs:{shape:f}});else if(x||m){F(o.shape.length>=1,()=>`Input must have rank at least 1, got: ${o.shape.length}`);const I=Xc(C,b,v),y=je({inputs:{x:o},backend:t,attrs:{begin:C,size:I}});w=R({inputs:{x:y},backend:t,attrs:{shape:f}}),t.disposeIntermediateTensorInfo(y)}else if(t.shouldExecuteOnCPU([o])){const y=t.readSync(o.dataId),O=X(o.shape,o.dtype,y),k=sp(h,O,v,C);w=t.makeTensorInfo(f,o.dtype,k.values)}else{const y=new Uv(C,v,h);w=t.runWebGLProgram(y,[o],o.dtype)}const N=R({inputs:{x:w},backend:t,attrs:{shape:f}});return t.disposeIntermediateTensorInfo(w),N}const Mv={kernelName:zc,backendName:"webgl",kernelFunc:Wv};/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Gv(n){const{inputs:e,backend:t,attrs:s}=n,{separator:o,nGramWidths:r,leftPad:a,rightPad:c,padWidth:i,preserveShortSequences:l}=s,{data:u,dataSplits:d}=e,p=t.readSync(u.dataId),h=t.readSync(d.dataId),[f,g]=op(p,h,o,r,a,c,i,l);return[t.makeTensorInfo([f.length],"string",f),t.makeTensorInfo(d.shape,"int32",g)]}const zv={kernelName:Kc,backendName:"webgl",kernelFunc:Gv};/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Hv(n){const{inputs:e,backend:t,attrs:s}=n,{skipEmpty:o}=s,{input:r,delimiter:a}=e;if(r.dtype!=="string")throw new Error("Input must be of datatype string");if(r.shape.length!==1)throw new Error(`Input must be a vector, got shape: ${r.shape}`);if(a.shape.length!==0)throw new Error(`Delimiter must be a scalar, got shape: ${a.shape}`);const c=t.readSync(r.dataId),i=t.readSync(a.dataId)[0],[l,u,d]=rp(c,i,o),p=u.length;return[t.makeTensorInfo([p,2],"int32",l),t.makeTensorInfo([p],"string",u),t.makeTensorInfo([2],"int32",new Int32Array(d))]}const Xv={kernelName:jc,backendName:"webgl",kernelFunc:Hv};/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Kv(n){const{inputs:e,backend:t,attrs:s}=n,{numBuckets:o}=s,{input:r}=e;if(r.dtype!=="string")throw new Error("Input must be of datatype string");if(o<=0)throw new Error("Number of buckets must be at least 1");const a=t.readSync(r.dataId),c=ap(a,o);return t.makeTensorInfo(r.shape,"int32",c)}const jv={kernelName:qc,backendName:"webgl",kernelFunc:Kv};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const qv="return tan(x);",Yv=P({opSnippet:qv}),Qv={kernelName:Yc,backendName:"webgl",kernelFunc:Yv};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Zv=`
  float e2x = exp(-2.0 * abs(x));
  return sign(x) * (1.0 - e2x) / (1.0 + e2x);
`,Jv=P({opSnippet:Zv}),eb={kernelName:Qc,backendName:"webgl",kernelFunc:Jv};/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function tb(n){const{inputs:e,backend:t,attrs:s}=n,{tensor:o,indices:r,updates:a}=e,{sliceRank:c,numUpdates:i,sliceSize:l,strides:u,outputSize:d}=rn(a,r,o.shape),p=[d/l,l];if(d===0)return t.makeTensorInfo(o.shape,r.dtype);const h=R({inputs:{x:r},backend:t,attrs:{shape:[i,c]}}),f=R({inputs:{x:a},backend:t,attrs:{shape:[i,l]}}),g=R({inputs:{x:o},backend:t,attrs:{shape:p}}),x=new $n(i,c,h.shape.length,f.shape.length,u,p,!1,!0),m=t.runWebGLProgram(x,[f,h,g],g.dtype),C=R({inputs:{x:m},backend:t,attrs:{shape:o.shape}});return t.disposeIntermediateTensorInfo(h),t.disposeIntermediateTensorInfo(f),t.disposeIntermediateTensorInfo(g),t.disposeIntermediateTensorInfo(m),C}const nb={kernelName:Zc,backendName:"webgl",kernelFunc:tb};/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class sb{constructor(e,t){this.variableNames=["A"];const s=new Array(e.length);for(let a=0;a<s.length;a++)s[a]=e[a]*t[a];this.outputShape=s,this.rank=s.length;const o=D(this.rank),r=ob(e);this.userCode=`
      void main() {
        ${o} resRC = getOutputCoords();
        setOutput(getA(${r}));
      }
    `}}function ob(n){const e=n.length;if(e>5)throw Error(`Tile for rank ${e} is not yet supported`);if(e===1)return`imod(resRC, ${n[0]})`;const t=["resRC.x","resRC.y","resRC.z","resRC.w","resRC.u"],s=[];for(let o=0;o<n.length;o++)s.push(`imod(${t[o]}, ${n[o]})`);return s.join()}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Lo(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{reps:r}=s;if(o.dtype==="string"||o.shape.length>5){const i=t.readSync(o.dataId),l=o.dtype==="string"?i.map(p=>tn(p)):i,u=X(o.shape,o.dtype,l),d=cp(u,r);return t.makeTensorInfo(d.shape,d.dtype,d.values)}const a=new sb(o.shape,r);return t.runWebGLProgram(a,[o],o.dtype)}const rb={kernelName:Jc,backendName:"webgl",kernelFunc:Lo};class ab{constructor(e){this.variableNames=["x","indices"],this.customUniforms=[{name:"n",type:"int"},{name:"firstPass",type:"int"},{name:"negativeInf",type:"float"},{name:"dir",type:"int"},{name:"inc",type:"int"}],this.outputShape=e,this.userCode=`
       void main() {
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int elemIdx = coords[1];

         // We compare elements pair-wise within a group of size 2 * inc.
         // The comparing rule for each group alternates between ascending
         // and descending. Within each group, we compare each pair at
         // positions i and i+inc. To decide whether an element at position i
         // is x0 or x1, we mod it by 2 * inc, if the result is smaller than
         // inc, it is in the first half of the group, we denote it as x0,
         // otherwise we denote it as x1.
         // For example, as shown in the Bitonic top K paper referenced above,
         // Figure5(a) shows that element[1] is in the
         // second half of the group when group size is 2, but it is in the
         // first half of the group when group size is 4.

         bool isFirstInPair = imod(elemIdx, 2 * inc) < inc;
         int i = isFirstInPair ? elemIdx : elemIdx - inc;

         int i0 = firstPass == 1 ? i : int(getIndices(batch, i));
         int i1 = firstPass == 1 ? i + inc : int(getIndices(batch, i + inc));
         float x0 = i0 < n ? getX(batch, i0) : negativeInf;
         float x1 = i1 < n ? getX(batch, i1) : negativeInf;

         // Denotes which direction indices are in (ascending or descending).
         bool reverse = imod(elemIdx, 2 * dir) >= dir;
         bool isGreater = x0 > x1 || (x0 == x1 && i1 > i0);
         if (reverse == isGreater) { // Elements in opposite order of direction
           int iTemp = i0;
           i0 = i1;
           i1 = iTemp;
         }
         if (isFirstInPair) {
            setOutput(float(i0));
         } else {
            setOutput(float(i1));
         }
       }
     `}}class ib{constructor(e){this.variableNames=["x","indices"],this.customUniforms=[{name:"n",type:"int"},{name:"firstPass",type:"int"},{name:"k",type:"int"}],this.outputShape=e,this.userCode=`
    void main() {
         // Takes max of indices (0, k), (1, k + 1), (2, k + 2) ...
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int elemIdx = coords[1];

         // The output size is half of the previous size.
         // If the previous sequence is | | | | _ _ _ _  | | | |  _ _ _ _ (k=4),
         // we only need to output the indices at positions |, the indices at
         // positions _ can be thrown away, see Figure5(b) After Phase 2
         // (Merge phase) in the Bitonic Top K paper referenced above.
         // For example, the paper shows we only need to output the orange bars.
         // The output sequence should look like this | | | | | | | |.
         // Because the sequence is halved, to map the output index back
         // to the previous sequence to find the corresponding value,
         // we need to double the index. When we double the index,
         // we basically interpolate a position, so 2i looks like
         // | _ | _ | _ | _ | _ | _ | _. We move the | to the first k position
         // of each 2k positions by - elemIdx % k. E.g. for output at
         // index 4,5,6,7, we want to get the corresponding element at
         // original index 8,9,10,11, for output at index 8,9,10,11,
         // we want to get the corresponding element at original index
         // 16,17,18,19, so on and so forth.

         int i = elemIdx < k ? elemIdx : (elemIdx * 2 - imod(elemIdx, k));
         int i0 = firstPass == 1 ? i : int(getIndices(batch, i));
         int i1 = firstPass == 1 ? i + k : int(getIndices(batch, i + k));

         float x0 = getX(batch, i0);
         float x1 = i1 < n ? getX(batch, i1) : x0;

         setOutput(x0 >= x1 ? float(i0) : float(i1));
       }
     `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Re(n,e){e!==null&&n.disposeIntermediateTensorInfo(e)}function ts(n){let e=1;for(;e<n;)e*=2;return e}function cb(n){const{inputs:e,backend:t,attrs:s}=n,{x:o}=e,{k:r,sorted:a}=s,c=$().getNumber("TOPK_LAST_DIM_CPU_HANDOFF_SIZE_THRESHOLD"),i=$().getNumber("TOPK_K_CPU_HANDOFF_THRESHOLD"),l=o.shape,u=l[l.length-1];if(t.shouldExecuteOnCPU([o])||u<c||r>i){const k=t.readSync(o.dataId),[A,_]=lp(k,l,o.dtype,r,a);return[t.makeTensorInfo(A.shape,A.dtype,A.values),t.makeTensorInfo(_.shape,_.dtype,_.values)]}if(r===0)return l[l.length-1]=0,[t.makeTensorInfo(l,o.dtype,[]),t.makeTensorInfo(l,"int32",[])];if(u===1)return[o,ht({attrs:{shape:l,dtype:"int32",value:0},backend:t})];const d=t.texData.get(o.dataId),p=d!==null&&d.isPacked,h=p?t.unpackTensor(o):o,g=T(l)/u,x=R({inputs:{x:h},attrs:{shape:[g,u]},backend:t});p&&Re(t,h);const m=ts(r),C=ts(u);let b=null;const v=()=>b===null?[x,x]:[x,b],w=(k,A,_)=>{const le=v(),j=new ab(_),ne=[[u],[b===null?1:0],[Number.NEGATIVE_INFINITY],[k],[A]],re=b;b=t.runWebGLProgram(j,le,"int32",ne),Re(t,re)};for(let k=1;k<m;k*=2){const A=k*2;for(let _=k;_>=1;_/=2)w(A,_,[g,C])}for(let k=C;k>m;k/=2){const A=v(),_=new ib([g,k/2]),j=[[u],[b===null?1:0],[m]],Q=b;b=t.runWebGLProgram(_,A,"int32",j),Re(t,Q);const ne=m/2,re=ne*2;for(let W=ne;W>=1;W/=2)w(re,W,b.shape)}let N=b;b=je({inputs:{x:b},backend:t,attrs:{begin:0,size:[g,r]}}),Re(t,N);let I=No({inputs:{x,indices:b},backend:t,attrs:{axis:1,batchDims:1}});Re(t,x);const y=l.slice(0,-1);y.push(r),N=b,b=R({inputs:{x:b},attrs:{shape:y},backend:t}),Re(t,N);const O=I;return I=R({inputs:{x:I},attrs:{shape:y},backend:t}),Re(t,O),[I,b]}const lb={kernelName:el,backendName:"webgl",kernelFunc:cb};/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class ub{constructor(e,t,s,o,r,a){this.variableNames=["Image","Transforms"],this.outputShape=a;const c=s==="nearest"?1:2;let i;switch(o){case"constant":i=1;break;case"reflect":i=2;break;case"wrap":i=3;break;case"nearest":i=4;break;default:i=1;break}this.userCode=`
            float mapCoord(float outCoord, float len) {
              float inCoord = outCoord;
              if(${i} == 2) {
                if (inCoord < 0.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz2 = 2.0 * len;
                    if (inCoord < sz2) {
                      inCoord = sz2 * float(int(float(-inCoord / sz2))) +
                      inCoord;
                    }
                    inCoord = inCoord < -len ? inCoord + sz2 : -inCoord - 1.0;
                  }
                } else if (inCoord > len - 1.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz2 = 2.0 * len;
                    inCoord -= sz2 * float(int(float(inCoord / sz2)));
                    if (inCoord >= len) {
                      inCoord = sz2 - inCoord - 1.0;
                    }
                  }
                }
                return clamp(inCoord, 0.0, len - 1.0);
              } else if (${i} == 3) {
                if (inCoord < 0.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz = len - 1.0;
                    inCoord += len * (float(int(float(-inCoord / sz))) + 1.0);
                  }
                } else if (inCoord > len - 1.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz = len - 1.0;
                    inCoord -= len * float(int(float(inCoord / sz)));
                  }
                }
                return clamp(inCoord, 0.0, len - 1.0);
              } else if (${i} == 4) {
                return clamp(outCoord, 0.0, len - 1.0);
              } else {
                return outCoord;
              }
            }

            float readWithFillValue(int batch, int coordY, int coordX,
              int channel) {
              float outputValue;
              if (0 <= coordY && coordY < ${e} && 0 <= coordX && coordX < ${t}) {
                  outputValue = getImage(batch, coordY, coordX, channel);
              } else {
                outputValue = float(${r});
              }
              return outputValue;
            }

            void main() {
              ivec4 coords = getOutputCoords();
              float outputValue;
              int batch = coords[0];
              int x = coords[2];
              int y = coords[1];
              int channel = coords[3];
              float xf = float(x);
              float yf = float(y);
              float a1 = getTransforms(batch, 0);
              float a2 = getTransforms(batch, 1);
              float a3 = getTransforms(batch, 2);
              float b1 = getTransforms(batch, 3);
              float b2 = getTransforms(batch, 4);
              float b3 = getTransforms(batch, 5);
              float c1 = getTransforms(batch, 6);
              float c2 = getTransforms(batch, 7);
              float projection = c1 * xf + c2 * yf + 1.0;
              if (projection == 0.0) {
                outputValue = float(${r});
              } else {
                float inX = (a1 * xf + a2 * yf + a3) / projection;
                float inY = (b1 * xf + b2 * yf + b3) / projection;
                float mapX = mapCoord(inX, float(${t}));
                float mapY = mapCoord(inY, float(${e}));

                if (${c} == 1) {
                  int coordY = int(round(mapY));
                  int coordX = int(round(mapX));
                  outputValue = readWithFillValue(batch, coordY, coordX,
                    channel);
                } else {
                  float yFloor = floor(mapY);
                  float xFloor = floor(mapX);
                  float yCeil = yFloor + 1.0;
                  float xCeil = xFloor + 1.0;
                  float valueYFloor = (xCeil - mapX) *
                  readWithFillValue(batch, int(yFloor), int(xFloor), channel) +
                  (mapX - xFloor) *
                  readWithFillValue(batch, int(yFloor), int(xCeil), channel);
                  float valueYCeil = (xCeil - mapX) *
                  readWithFillValue(batch, int(yCeil), int(xFloor), channel) +
                  (mapX - xFloor) *
                  readWithFillValue(batch, int(yCeil), int(xCeil), channel);
                  outputValue = (yCeil - mapY) * valueYFloor +
                  (mapY - yFloor) * valueYCeil;
                }
              }
              setOutput(outputValue);
            }
        `}}/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function db(n){const{inputs:e,backend:t,attrs:s}=n,{image:o,transforms:r}=e,{interpolation:a,fillMode:c,fillValue:i,outputShape:l}=s,[u,d,p,h]=o.shape,[f,g]=l??[d,p],x=[u,f,g,h],m=new ub(d,p,a,c,i,x);return t.runWebGLProgram(m,[o,r],"float32")}const pb={kernelName:tl,backendName:"webgl",kernelFunc:db};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function hb(n){const{inputs:e,attrs:t,backend:s}=n,{axis:o}=t,{x:r}=e;We(r,"unique"),console.warn("WARNING: ","UI might be locked temporarily as data is being downloaded");const a=s.readSync(r.dataId),{outputValues:c,outputShape:i,indices:l}=up(a,o,r.shape,r.dtype);return[s.makeTensorInfo(i,r.dtype,c),s.makeTensorInfo([l.length],"int32",l)]}const fb={kernelName:nl,backendName:"webgl",kernelFunc:hb};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function mb(n){const{inputs:e,backend:t,attrs:s}=n,{value:o}=e;let{axis:r}=s;r<0&&(r+=o.shape.length);const a=o,c=a.shape.length,i=o.shape[r],l=new Array(c-1);let u=0;for(let g=0;g<c;g++)g!==r&&(l[u++]=a.shape[g]);const d=[],p=new Array(c).fill(0),h=a.shape.slice();h[r]=1;const f=new Array(i);for(let g=0;g<f.length;g++){p[r]=g;const x=je({inputs:{x:a},backend:t,attrs:{begin:p,size:h}}),m=R({inputs:{x},backend:t,attrs:{shape:l}});f[g]=m,d.push(x)}return d.forEach(g=>t.disposeIntermediateTensorInfo(g)),f}const xb={kernelName:sl,backendName:"webgl",kernelFunc:mb};/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */class gb{constructor(e,t){this.variableNames=["x","segmentIds"];const s=e.windowSize,o=e.batchSize,r=e.inSize,a=e.numSegments,c=a*Math.ceil(r/s);this.outputShape=[o,c];const i="0.0",l="sumValue",u=Math.floor(s/4)*4,d=s%4,p=`
        sumValue += dot(values, segFilter);
    `;let h="";r%s>0&&(h=`
        if (inIdx < 0 || inIdx >= ${r}) {
          return initializationValue;
        }
      `);let f="";r%s>0&&(f=`
        if (inIdx < 0 || inIdx >= ${r}) {
          return -1.0;
        }
      `),this.userCode=`
      const float initializationValue = ${i};

      float getValue(int batch, int inIdx) {
        ${h}
        return getX(batch, inIdx);
      }

      float getSegmentIdAtIndex(int inIdx) {
        ${f}
        return getSegmentIds(inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = int(floor(float(outIdx) / float(
          ${a})) * float(${s}));
        int currentSeg = int(mod(float(outIdx), float(${a})));

        float sumValue = 0.0;

        for (int i = 0; i < ${u}; i += 4) {
          int inIdx = inOffset + i;
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 2)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 3)) == currentSeg ? 1 : 0
          );

          ${p}
        }

        int inIdx = inOffset + ${u};
        if (${d===1}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            initializationValue,
            initializationValue,
            initializationValue
          );

          int inIdxSeg = int(getSegmentIdAtIndex(inIdx));

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            0,
            0,
            0
          );

          ${p}
        } else if (${d===2}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            initializationValue,
            initializationValue
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
              0,
              0
          );

          ${p}
        } else if (${d===3}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            initializationValue
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 2)) == currentSeg ? 1 : 0,
            0
          );

          ${p}
        }
        setOutput(${l});
      }
    `}}/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Cb(n){const{inputs:e,backend:t,attrs:s}=n,{x:o,segmentIds:r}=e,{numSegments:a}=s,c=o.shape.length,i=[];let l=0;const u=ie([l],c);let d=o;u!=null&&(d=G({inputs:{x:o},backend:t,attrs:{perm:u}}),i.push(d),l=ce(1,c)[0]);const p=rl(d.shape,l,a),h=T([d.shape[l]]),f=R({inputs:{x:d},backend:t,attrs:{shape:[-1,h]}});i.push(f);const g=sn(o.dtype),x=(v,w,N,I,y)=>{const O=v.shape[0],k=v.shape[1],A=al(k,y),_={windowSize:A,inSize:k,batchSize:O,numSegments:y},le=new gb(_,w),j=t.compileAndRun(le,[v,N],I);if(i.push(j),j.shape[1]===y)return j;const Q=_o({backend:t,attrs:{start:0,stop:y,step:1,dtype:"float32"}}),ne=Lo({inputs:{x:Q},backend:t,attrs:{reps:[k/A]}});return i.push(Q),i.push(ne),x(j,w,ne,I,y)},m=x(f,"unsortedSegmentSum",r,g,a),C=R({inputs:{x:m},backend:t,attrs:{shape:p}});let b=C;if(u!=null){i.push(C);const v=ls(u);b=G({inputs:{x:b},backend:t,attrs:{perm:v}})}return i.forEach(v=>t.disposeIntermediateTensorInfo(v)),b}const vb={kernelName:ol,backendName:"webgl",kernelFunc:Cb};/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const bb=[nh,oh,ih,uh,ph,mh,gh,vh,Rh,yh,Eh,Oh,Ah,Bh,Wh,Gh,Hh,qh,Qh,Jh,sf,df,hf,gf,vf,yf,Tf,Of,Vp,Af,Vf,Gf,qf,Zf,em,nm,om,cm,dm,fm,xm,Cm,bm,Rm,ym,Nm,Om,Am,Lm,Vm,Gm,Km,Qm,ex,sx,ox,ax,cx,ux,px,fx,Cx,$x,Sx,Ix,Nx,Px,_x,Ux,Bp,Mx,Lf,Hx,jx,Qx,Wp,tg,rg,ig,dg,fg,Cg,$g,yg,Ng,Pg,Ag,Bg,Ug,Mg,Xg,jg,Yg,Zg,eC,oC,cC,pC,bC,zp,SC,TC,kC,DC,$f,_C,BC,UC,GC,KC,Gp,qC,QC,JC,t0,n0,wf,xC,r0,l0,h0,Xp,g0,b0,S0,T0,O0,D0,_0,V0,M0,H0,j0,Q0,tv,ov,cv,dv,lf,CC,fv,xv,Cv,bv,wv,Sv,Iv,Ev,kv,Dv,Fv,Lv,Vv,Mv,zv,Xv,jv,gC,Jp,Qv,eb,nb,rb,lb,pb,eh,fb,xb,vb,LC];for(const n of bb)il(n);export{Ut as GPGPUContext,At as MathBackendWebGL,Lp as forceHalfFloat,Sb as gpgpu_util,cl as setWebGLContext,yb as version_webgl,Ib as webgl,Rb as webgl_util};
