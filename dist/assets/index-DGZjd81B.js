import{g as Ou,c as fe,a as Lu}from"./index-By55xqqX.js";function Wu(e,t){for(var n=0;n<t.length;n++){const r=t[n];if(typeof r!="string"&&!Array.isArray(r)){for(const s in r)if(s!=="default"&&!(s in e)){const o=Object.getOwnPropertyDescriptor(r,s);o&&Object.defineProperty(e,s,o.get?o:{enumerable:!0,get:()=>r[s]})}}}return Object.freeze(Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}))}/**
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
 */const Uu=1e-7,qu=1e-4;class Gu{constructor(t,n){this.backend=t,this.dataMover=n,this.data=new WeakMap,this.dataIdsCount=0}get(t){return this.data.has(t)||this.dataMover.moveData(this.backend,t),this.data.get(t)}set(t,n){this.dataIdsCount++,this.data.set(t,n)}has(t){return this.data.has(t)}delete(t){return this.dataIdsCount--,this.data.delete(t)}numDataIds(){return this.dataIdsCount}}class Ls{refCount(t){return ht("refCount")}incRef(t){return ht("incRef")}timerAvailable(){return!0}time(t){return ht("time")}read(t){return ht("read")}readSync(t){return ht("readSync")}readToGPU(t,n){return ht("readToGPU")}numDataIds(){return ht("numDataIds")}disposeData(t,n){return ht("disposeData")}write(t,n,r){return ht("write")}move(t,n,r,s,o){return ht("move")}createTensorFromGPUData(t,n,r){return ht("createTensorFromGPUData")}memory(){return ht("memory")}floatPrecision(){return ht("floatPrecision")}epsilon(){return this.floatPrecision()===32?Uu:qu}dispose(){return ht("dispose")}}function ht(e){throw new Error(`'${e}' not yet implemented or not found in the registry. This kernel may not be supported by the tfjs backend you have chosen`)}/**
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
 */function Ws(e){let t=e.length,n=0;for(;t>0;)n=Math.random()*t|0,t--,wn(e,t,n)}function zu(e,t){if(e.length!==t.length)throw new Error(`Array sizes must match to be shuffled together First array length was ${e.length}Second array length was ${t.length}`);let n=e.length,r=0;for(;n>0;)r=Math.random()*n|0,n--,wn(e,n,r),wn(t,n,r)}function Ue(e,t,n){return Math.max(e,Math.min(t,n))}function Ku(e){return e%2===0?e:e+1}function wn(e,t,n){const r=e[t];e[t]=e[n],e[n]=r}function Vu(e){let t=0;for(let n=0;n<e.length;n++)t+=e[n];return t}function ju(e,t){const n=Math.random();return t*n+(1-n)*e}function Hu(e,t){let n=0;for(let r=0;r<e.length;r++){const s=Number(e[r])-Number(t[r]);n+=s*s}return n}function g(e,t){if(!e)throw new Error(typeof t=="string"?t:t())}function ct(e,t,n=""){g(Ct(e,t),()=>n+` Shapes ${e} and ${t} must match`)}function de(e){g(e!=null,()=>"The input to the tensor constructor must be a non-null value.")}function W(e){if(e.length===0)return 1;let t=e[0];for(let n=1;n<e.length;n++)t*=e[n];return t}function Xu(e){return e.length===0}function Us(e,t){if(e===t)return!0;if(e==null||t==null||e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==null&&t[n]!==null&&e[n]!==t[n])return!1;return!0}function Ct(e,t){if(e===t)return!0;if(e==null||t==null||e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0}function _e(e){return e%1===0}function Zu(e){if(Math.tanh!=null)return Math.tanh(e);if(e===1/0)return 1;if(e===-1/0)return-1;{const t=Math.exp(2*e);return(t-1)/(t+1)}}function Ju(e){const t=Math.ceil(Math.sqrt(e));return[t,Math.ceil(e/t)]}function Yu(e){const t=new Uint32Array(e);for(let n=0;n<e;++n)t[n]=n;return Ws(t),t}function Oe(e,t){return t<=e.length?e:e+" ".repeat(t-e.length)}function Qu(e,t=s=>0,n,r){return new Promise((s,o)=>{let a=0;const i=()=>{if(e()){s();return}a++;const c=t(a);if(n!=null&&a>=n){o();return}r!=null?r(i,c):setTimeout(i,c)};i()})}function tl(e,t){let n=1,r=-1;for(let o=0;o<e.length;++o)if(e[o]>=0)n*=e[o];else if(e[o]===-1){if(r!==-1)throw Error(`Shapes can only have 1 implicit size. Found -1 at dim ${r} and dim ${o}`);r=o}else if(e[o]<0)throw Error(`Shapes can not be < 0. Found ${e[o]} at dim ${o}`);if(r===-1){if(t>0&&t!==n)throw Error(`Size(${t}) must match the product of shape ${e}`);return e}if(n===0)throw Error(`Cannot infer the missing size in [${e}] when there are 0 elements`);if(t%n!==0)throw Error(`The implicit shape can't be a fractional number. Got ${t} / ${n}`);const s=e.slice();return s[r]=t/n,s}function nn(e,t){const n=t.length;return e=e==null?t.map((r,s)=>s):[].concat(e),g(e.every(r=>r>=-n&&r<n),()=>`All values in axis param must be in range [-${n}, ${n}) but got axis ${e}`),g(e.every(r=>_e(r)),()=>`All values in axis param must be integers but got axis ${e}`),e.map(r=>r<0?n+r:r)}function qs(e,t){const n=[],r=[],s=t!=null&&Array.isArray(t)&&t.length===0,o=t==null||s?null:nn(t,e).sort();let a=0;for(let i=0;i<e.length;++i){if(o!=null){if(o[a]===i&&e[i]!==1)throw new Error(`Can't squeeze axis ${i} since its dim '${e[i]}' is not 1`);(o[a]==null||o[a]>i)&&e[i]===1&&(n.push(e[i]),r.push(i)),o[a]<=i&&a++}e[i]!==1&&(n.push(e[i]),r.push(i))}return{newShape:n,keptDims:r}}function Gs(e,t){return Sr(e,t)}function Sr(e,t){let n=null;if(e==null||e==="float32")n=new Float32Array(t);else if(e==="int32")n=new Int32Array(t);else if(e==="bool")n=new Uint8Array(t);else if(e==="string")n=new Array(t);else throw new Error(`Unknown data type ${e}`);return n}function zs(e,t){for(let n=0;n<e.length;n++){const r=e[n];if(isNaN(r)||!isFinite(r))throw Error(`A tensor of type ${t} being uploaded contains ${r}.`)}}function Ks(e){return e==="bool"||e==="complex64"||e==="float32"||e==="int32"||e==="string"}function el(e,t){return!(t==="complex64"||t==="float32"&&e!=="complex64"||t==="int32"&&e!=="float32"&&e!=="complex64"||t==="bool"&&e==="bool")}function yn(e){if(e==="float32"||e==="int32")return 4;if(e==="complex64")return 8;if(e==="bool")return 1;throw new Error(`Unknown dtype ${e}`)}function Vs(e){if(e==null)return 0;let t=0;return e.forEach(n=>t+=n.length),t}function qt(e){return typeof e=="string"||e instanceof String}function js(e){return typeof e=="boolean"}function Hs(e){return typeof e=="number"}function rn(e){return Array.isArray(e)?rn(e[0]):e instanceof Float32Array?"float32":e instanceof Int32Array||e instanceof Uint8Array||e instanceof Uint8ClampedArray?"int32":Hs(e)?"float32":qt(e)?"string":js(e)?"bool":"float32"}function Vt(e){return!!(e&&e.constructor&&e.call&&e.apply)}function $n(e,t){for(let n=t;n<e;++n)if(e%n===0)return n;return e}function Fe(e){const t=e.length;if(t<2)return[];const n=new Array(t-1);n[t-2]=e[t-1];for(let r=t-3;r>=0;--r)n[r]=n[r+1]*e[r+1];return n}function Xs(e,t,n,r=!1){const s=new Array;if(t.length===1){const o=t[0]*(r?2:1);for(let a=0;a<o;a++)s[a]=n[e+a]}else{const o=t[0],a=t.slice(1),i=a.reduce((c,u)=>c*u)*(r?2:1);for(let c=0;c<o;c++)s[c]=Xs(e+c*i,a,n,r)}return s}function ke(e,t,n=!1){if(e.length===0)return t[0];const r=e.reduce((s,o)=>s*o)*(n?2:1);if(r===0)return[];if(r!==t.length)throw new Error(`[${e}] does not match the input size ${t.length}${n?" for a complex tensor":""}.`);return Xs(0,e,t,n)}function nl(e,t){if(Array.isArray(e))return e;if(t==="float32")return e instanceof Float32Array?e:new Float32Array(e);if(t==="int32")return e instanceof Int32Array?e:new Int32Array(e);if(t==="bool"||t==="string")return Uint8Array.from(new Int32Array(e));throw new Error(`Unknown dtype ${t}`)}function Ir(e,t){const n=Dn(e,t);for(let r=0;r<n.length;r++)n[r]=1;return n}function Dn(e,t){if(t==null||t==="float32"||t==="complex64")return new Float32Array(e);if(t==="int32")return new Int32Array(e);if(t==="bool")return new Uint8Array(e);throw new Error(`Unknown data type ${t}`)}function rl(e,t){const n=e.reduce((r,s)=>r*s,1);if(t==null||t==="float32")return ke(e,new Float32Array(n));if(t==="int32")return ke(e,new Int32Array(n));if(t==="bool")return ke(e,new Uint8Array(n));throw new Error(`Unknown data type ${t}`)}function pt(e){e.forEach(t=>{g(Number.isInteger(t)&&t>=0,()=>`Tensor must have a shape comprised of positive integers but got shape [${e}].`)})}function sl(e,t,n){if(t===0)return 0;if(t===1)return e[0];let r=e[e.length-1];for(let s=0;s<e.length-1;++s)r+=n[s]*e[s];return r}function ol(e,t,n){if(t===0)return[];if(t===1)return[e];const r=new Array(t);for(let s=0;s<r.length-1;++s)r[s]=Math.floor(e/n[s]),e-=r[s]*n[s];return r[r.length-1]=e,r}function Nn(e){return e&&e.then&&typeof e.then=="function"}/**
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
 */const ws="tfjsflags";class Zs{constructor(t){this.global=t,this.flags={},this.flagRegistry={},this.urlFlags={},this.getQueryParams=al,this.populateURLFlags()}setPlatform(t,n){this.platform!=null&&(R().getBool("IS_TEST")||R().getBool("PROD")||console.warn(`Platform ${this.platformName} has already been set. Overwriting the platform with ${t}.`)),this.platformName=t,this.platform=n}registerFlag(t,n,r){if(this.flagRegistry[t]={evaluationFn:n,setHook:r},this.urlFlags[t]!=null){const s=this.urlFlags[t];R().getBool("IS_TEST")||R().getBool("PROD")||console.warn(`Setting feature override from URL ${t}: ${s}.`),this.set(t,s)}}async getAsync(t){return t in this.flags?this.flags[t]:(this.flags[t]=await this.evaluateFlag(t),this.flags[t])}get(t){if(t in this.flags)return this.flags[t];const n=this.evaluateFlag(t);if(Nn(n))throw new Error(`Flag ${t} cannot be synchronously evaluated. Please use getAsync() instead.`);return this.flags[t]=n,this.flags[t]}getNumber(t){return this.get(t)}getBool(t){return this.get(t)}getString(t){return this.get(t)}getFlags(){return this.flags}get features(){return this.flags}set(t,n){if(this.flagRegistry[t]==null)throw new Error(`Cannot set flag ${t} as it has not been registered.`);this.flags[t]=n,this.flagRegistry[t].setHook!=null&&this.flagRegistry[t].setHook(n)}evaluateFlag(t){if(this.flagRegistry[t]==null)throw new Error(`Cannot evaluate flag '${t}': no evaluation function found.`);return this.flagRegistry[t].evaluationFn()}setFlags(t){this.flags=Object.assign({},t)}reset(){this.flags={},this.urlFlags={},this.populateURLFlags()}populateURLFlags(){if(typeof this.global>"u"||typeof this.global.location>"u"||typeof this.global.location.search>"u")return;const t=this.getQueryParams(this.global.location.search);ws in t&&t[ws].split(",").forEach(r=>{const[s,o]=r.split(":");this.urlFlags[s]=cl(s,o)})}}function al(e){const t={};return e.replace(/[?&]([^=?&]+)(?:=([^&]*))?/g,(n,...r)=>(il(t,r[0],r[1]),r.join("="))),t}function il(e,t,n){e[decodeURIComponent(t)]=decodeURIComponent(n||"")}function cl(e,t){const n=t.toLowerCase();return n==="true"||n==="false"?n==="true":`${+n}`===n?+n:t}function R(){return Tr}let Tr=null;function ul(e){Tr=e}/**
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
 */let jn;function Js(){if(jn==null){let e;if(typeof window<"u")e=window;else if(typeof global<"u")e=global;else if(typeof process<"u")e=process;else if(typeof self<"u")e=self;else throw new Error("Could not find a global object");jn=e}return jn}function ll(){const e=Js();return e._tfGlobals==null&&(e._tfGlobals=new Map),e._tfGlobals}function _r(e,t){const n=ll();if(n.has(e))return n.get(e);{const r=t();return n.set(e,r),n.get(e)}}const Ys="Abs",Qs="Acos",to="Acosh",Ar="Add",eo="AddN",no="All",ro="Any",so="ArgMax",oo="ArgMin",ao="Asin",io="Asinh",co="Atan",uo="Atanh",lo="Atan2",ho="AvgPool",hl="AvgPoolGrad",fo="AvgPool3D",fl="AvgPool3DGrad",po="BatchMatMul",go="BatchToSpaceND",mo="Bincount",bo="BitwiseAnd",dl="BroadcastTo",wo="BroadcastArgs",Dr="Cast",yo="Ceil",$o="ClipByValue",Eo="Complex",ko="ComplexAbs",xo="Concat",vo="Conv2D",So="Conv2DBackpropFilter",Io="Conv2DBackpropInput",To="Conv3D",pl="Conv3DBackpropFilterV2",_o="Conv3DBackpropInputV2",Ao="Cos",Do="Cosh",No="Cumprod",Mo="Cumsum",Fo="CropAndResize",Bo="DenseBincount",Ro="DepthToSpace",Co="DepthwiseConv2dNative",Po="DepthwiseConv2dNativeBackpropFilter",Oo="DepthwiseConv2dNativeBackpropInput",Lo="Diag",Wo="Dilation2D",gl="Dilation2DBackpropInput",ml="Dilation2DBackpropFilter",Nr="Draw",Uo="RealDiv",qo="Einsum",Go="Elu",bl="EluGrad",zo="Erf",Ko="Equal",Vo="Exp",jo="ExpandDims",Ho="Expm1",Xo="FFT",Zo="Fill",Jo="FlipLeftRight",Yo="Floor",Qo="FloorDiv",ta="FusedBatchNorm",ea="GatherV2",na="GatherNd",ra="Greater",sa="GreaterEqual",Mr="Identity",oa="IFFT",aa="Imag",ia="IsFinite",ca="IsInf",ua="IsNan",la="LeakyRelu",ha="Less",fa="LessEqual",da="LinSpace",pa="Log",ga="Log1p",ma="LogicalAnd",ba="LogicalNot",wa="LogicalOr",wl="LogicalXor",yl="LogSoftmax",$l="LowerBound",ya="LRN",El="LRNGrad",kl="MatrixBandPart",$a="Max",Ea="Maximum",ka="MaxPool",xl="MaxPoolGrad",xa="MaxPool3D",vl="MaxPool3DGrad",va="MaxPoolWithArgmax",Sa="Mean",Ia="Min",Ta="Minimum",_a="MirrorPad",Aa="Mod",Da="Multinomial",Na="Multiply",Ma="Neg",Fa="NotEqual",Ba="NonMaxSuppressionV3",Ra="NonMaxSuppressionV4",Ca="NonMaxSuppressionV5",Pa="OnesLike",Oa="OneHot",La="Pack",Wa="PadV2",Sl="Pool",Ua="Pow",qa="Prelu",Ga="Prod",za="RaggedGather",Ka="RaggedRange",Va="RaggedTensorToTensor",ja="Range",Ha="Real",Xa="Reciprocal",Za="Relu",Ja="Reshape",Ya="ResizeNearestNeighbor",Il="ResizeNearestNeighborGrad",Qa="ResizeBilinear",Tl="ResizeBilinearGrad",ti="Relu6",ei="Reverse",ni="Round",ri="Rsqrt",si="ScatterNd",oi="TensorScatterUpdate",ai="SearchSorted",ii="Select",ci="Selu",ui="Slice",li="Sin",hi="Sinh",fi="Sign",di="Sigmoid",pi="Softplus",gi="Sqrt",mi="Sum",bi="SpaceToBatchND",wi="SplitV",yi="Softmax",$i="SparseFillEmptyRows",Ei="SparseReshape",ki="SparseSegmentMean",xi="SparseSegmentSum",vi="SparseToDense",Si="SquaredDifference",_l="Square",Ii="StaticRegexReplace",Ti="StridedSlice",_i="StringNGrams",Ai="StringSplit",Di="StringToHashBucketFast",Ni="Sub",Mi="Tan",Fi="Tanh",Fr="Tile",Bi="TopK",Ri="Transform",pn="Transpose",Ci="Unique",Pi="Unpack",Oi="UnsortedSegmentSum",Al="UpperBound",Li="ZerosLike",Wi="Step",Qn="FromPixels",Ui="RotateWithOffset",tr="_FusedMatMul",er="FusedConv2D",nr="FusedDepthwiseConv2D";/**
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
 */function Wt(...e){R().getBool("IS_TEST")||R().getBool("PROD")||console.warn(...e)}function Dl(...e){R().getBool("IS_TEST")||R().getBool("PROD")||console.log(...e)}/**
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
 */const Ae=_r("kernelRegistry",()=>new Map),qe=_r("gradRegistry",()=>new Map);function Ge(e,t){const n=Br(e,t);return Ae.get(n)}function rr(e){return qe.get(e)}function En(e){const t=Ae.entries(),n=[];for(;;){const{done:r,value:s}=t.next();if(r)break;const[o,a]=s,[i]=o.split("_");i===e&&n.push(a)}return n}function qi(e){const{kernelName:t,backendName:n}=e,r=Br(t,n);Ae.has(r)&&Wt(`The kernel '${t}' for backend '${n}' is already registered`),Ae.set(r,e)}function Nl(e){const{kernelName:t}=e;qe.has(t)&&R().getBool("DEBUG")&&Wt(`Overriding the gradient for '${t}'`),qe.set(t,e)}function Ml(e,t){const n=Br(e,t);if(!Ae.has(n))throw new Error(`The kernel '${e}' for backend '${t}' is not registered`);Ae.delete(n)}function Fl(e){if(!qe.has(e))throw new Error(`The gradient '${e}' for backend is not registered`);qe.delete(e)}function Bl(e,t){En(e).forEach(r=>{const s=Object.assign({},r,{backendName:t});qi(s)})}function Br(e,t){return`${t}_${e}`}/**
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
 */function Gi(e){return e instanceof Float32Array||e instanceof Int32Array||e instanceof Uint8Array||e instanceof Uint8ClampedArray}var zi=V,yt=null;try{yt=new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0,97,115,109,1,0,0,0,1,13,2,96,0,1,127,96,4,127,127,127,127,1,127,3,7,6,0,1,1,1,1,1,6,6,1,127,1,65,0,11,7,50,6,3,109,117,108,0,1,5,100,105,118,95,115,0,2,5,100,105,118,95,117,0,3,5,114,101,109,95,115,0,4,5,114,101,109,95,117,0,5,8,103,101,116,95,104,105,103,104,0,0,10,191,1,6,4,0,35,0,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,126,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,127,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,128,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,129,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,130,34,4,66,32,135,167,36,0,32,4,167,11])),{}).exports}catch{}function V(e,t,n){this.low=e|0,this.high=t|0,this.unsigned=!!n}V.prototype.__isLong__;Object.defineProperty(V.prototype,"__isLong__",{value:!0});function gt(e){return(e&&e.__isLong__)===!0}V.isLong=gt;var ys={},$s={};function pe(e,t){var n,r,s;return t?(e>>>=0,(s=0<=e&&e<256)&&(r=$s[e],r)?r:(n=j(e,(e|0)<0?-1:0,!0),s&&($s[e]=n),n)):(e|=0,(s=-128<=e&&e<128)&&(r=ys[e],r)?r:(n=j(e,e<0?-1:0,!1),s&&(ys[e]=n),n))}V.fromInt=pe;function $t(e,t){if(isNaN(e))return t?ee:Et;if(t){if(e<0)return ee;if(e>=Ki)return Hi}else{if(e<=-ks)return ft;if(e+1>=ks)return ji}return e<0?$t(-e,t).neg():j(e%De|0,e/De|0,t)}V.fromNumber=$t;function j(e,t,n){return new V(e,t,n)}V.fromBits=j;var kn=Math.pow;function Rr(e,t,n){if(e.length===0)throw Error("empty string");if(e==="NaN"||e==="Infinity"||e==="+Infinity"||e==="-Infinity")return Et;if(typeof t=="number"?(n=t,t=!1):t=!!t,n=n||10,n<2||36<n)throw RangeError("radix");var r;if((r=e.indexOf("-"))>0)throw Error("interior hyphen");if(r===0)return Rr(e.substring(1),t,n).neg();for(var s=$t(kn(n,8)),o=Et,a=0;a<e.length;a+=8){var i=Math.min(8,e.length-a),c=parseInt(e.substring(a,a+i),n);if(i<8){var u=$t(kn(n,i));o=o.mul(u).add($t(c))}else o=o.mul(s),o=o.add($t(c))}return o.unsigned=t,o}V.fromString=Rr;function It(e,t){return typeof e=="number"?$t(e,t):typeof e=="string"?Rr(e,t):j(e.low,e.high,typeof t=="boolean"?t:e.unsigned)}V.fromValue=It;var Es=65536,Rl=1<<24,De=Es*Es,Ki=De*De,ks=Ki/2,xs=pe(Rl),Et=pe(0);V.ZERO=Et;var ee=pe(0,!0);V.UZERO=ee;var Ee=pe(1);V.ONE=Ee;var Vi=pe(1,!0);V.UONE=Vi;var sr=pe(-1);V.NEG_ONE=sr;var ji=j(-1,2147483647,!1);V.MAX_VALUE=ji;var Hi=j(-1,-1,!0);V.MAX_UNSIGNED_VALUE=Hi;var ft=j(0,-2147483648,!1);V.MIN_VALUE=ft;var S=V.prototype;S.toInt=function(){return this.unsigned?this.low>>>0:this.low};S.toNumber=function(){return this.unsigned?(this.high>>>0)*De+(this.low>>>0):this.high*De+(this.low>>>0)};S.toString=function(t){if(t=t||10,t<2||36<t)throw RangeError("radix");if(this.isZero())return"0";if(this.isNegative())if(this.eq(ft)){var n=$t(t),r=this.div(n),s=r.mul(n).sub(this);return r.toString(t)+s.toInt().toString(t)}else return"-"+this.neg().toString(t);for(var o=$t(kn(t,6),this.unsigned),a=this,i="";;){var c=a.div(o),u=a.sub(c.mul(o)).toInt()>>>0,h=u.toString(t);if(a=c,a.isZero())return h+i;for(;h.length<6;)h="0"+h;i=""+h+i}};S.getHighBits=function(){return this.high};S.getHighBitsUnsigned=function(){return this.high>>>0};S.getLowBits=function(){return this.low};S.getLowBitsUnsigned=function(){return this.low>>>0};S.getNumBitsAbs=function(){if(this.isNegative())return this.eq(ft)?64:this.neg().getNumBitsAbs();for(var t=this.high!=0?this.high:this.low,n=31;n>0&&!(t&1<<n);n--);return this.high!=0?n+33:n+1};S.isZero=function(){return this.high===0&&this.low===0};S.eqz=S.isZero;S.isNegative=function(){return!this.unsigned&&this.high<0};S.isPositive=function(){return this.unsigned||this.high>=0};S.isOdd=function(){return(this.low&1)===1};S.isEven=function(){return(this.low&1)===0};S.equals=function(t){return gt(t)||(t=It(t)),this.unsigned!==t.unsigned&&this.high>>>31===1&&t.high>>>31===1?!1:this.high===t.high&&this.low===t.low};S.eq=S.equals;S.notEquals=function(t){return!this.eq(t)};S.neq=S.notEquals;S.ne=S.notEquals;S.lessThan=function(t){return this.comp(t)<0};S.lt=S.lessThan;S.lessThanOrEqual=function(t){return this.comp(t)<=0};S.lte=S.lessThanOrEqual;S.le=S.lessThanOrEqual;S.greaterThan=function(t){return this.comp(t)>0};S.gt=S.greaterThan;S.greaterThanOrEqual=function(t){return this.comp(t)>=0};S.gte=S.greaterThanOrEqual;S.ge=S.greaterThanOrEqual;S.compare=function(t){if(gt(t)||(t=It(t)),this.eq(t))return 0;var n=this.isNegative(),r=t.isNegative();return n&&!r?-1:!n&&r?1:this.unsigned?t.high>>>0>this.high>>>0||t.high===this.high&&t.low>>>0>this.low>>>0?-1:1:this.sub(t).isNegative()?-1:1};S.comp=S.compare;S.negate=function(){return!this.unsigned&&this.eq(ft)?ft:this.not().add(Ee)};S.neg=S.negate;S.add=function(t){gt(t)||(t=It(t));var n=this.high>>>16,r=this.high&65535,s=this.low>>>16,o=this.low&65535,a=t.high>>>16,i=t.high&65535,c=t.low>>>16,u=t.low&65535,h=0,l=0,f=0,p=0;return p+=o+u,f+=p>>>16,p&=65535,f+=s+c,l+=f>>>16,f&=65535,l+=r+i,h+=l>>>16,l&=65535,h+=n+a,h&=65535,j(f<<16|p,h<<16|l,this.unsigned)};S.subtract=function(t){return gt(t)||(t=It(t)),this.add(t.neg())};S.sub=S.subtract;S.multiply=function(t){if(this.isZero())return Et;if(gt(t)||(t=It(t)),yt){var n=yt.mul(this.low,this.high,t.low,t.high);return j(n,yt.get_high(),this.unsigned)}if(t.isZero())return Et;if(this.eq(ft))return t.isOdd()?ft:Et;if(t.eq(ft))return this.isOdd()?ft:Et;if(this.isNegative())return t.isNegative()?this.neg().mul(t.neg()):this.neg().mul(t).neg();if(t.isNegative())return this.mul(t.neg()).neg();if(this.lt(xs)&&t.lt(xs))return $t(this.toNumber()*t.toNumber(),this.unsigned);var r=this.high>>>16,s=this.high&65535,o=this.low>>>16,a=this.low&65535,i=t.high>>>16,c=t.high&65535,u=t.low>>>16,h=t.low&65535,l=0,f=0,p=0,w=0;return w+=a*h,p+=w>>>16,w&=65535,p+=o*h,f+=p>>>16,p&=65535,p+=a*u,f+=p>>>16,p&=65535,f+=s*h,l+=f>>>16,f&=65535,f+=o*u,l+=f>>>16,f&=65535,f+=a*c,l+=f>>>16,f&=65535,l+=r*h+s*u+o*c+a*i,l&=65535,j(p<<16|w,l<<16|f,this.unsigned)};S.mul=S.multiply;S.divide=function(t){if(gt(t)||(t=It(t)),t.isZero())throw Error("division by zero");if(yt){if(!this.unsigned&&this.high===-2147483648&&t.low===-1&&t.high===-1)return this;var n=(this.unsigned?yt.div_u:yt.div_s)(this.low,this.high,t.low,t.high);return j(n,yt.get_high(),this.unsigned)}if(this.isZero())return this.unsigned?ee:Et;var r,s,o;if(this.unsigned){if(t.unsigned||(t=t.toUnsigned()),t.gt(this))return ee;if(t.gt(this.shru(1)))return Vi;o=ee}else{if(this.eq(ft)){if(t.eq(Ee)||t.eq(sr))return ft;if(t.eq(ft))return Ee;var a=this.shr(1);return r=a.div(t).shl(1),r.eq(Et)?t.isNegative()?Ee:sr:(s=this.sub(t.mul(r)),o=r.add(s.div(t)),o)}else if(t.eq(ft))return this.unsigned?ee:Et;if(this.isNegative())return t.isNegative()?this.neg().div(t.neg()):this.neg().div(t).neg();if(t.isNegative())return this.div(t.neg()).neg();o=Et}for(s=this;s.gte(t);){r=Math.max(1,Math.floor(s.toNumber()/t.toNumber()));for(var i=Math.ceil(Math.log(r)/Math.LN2),c=i<=48?1:kn(2,i-48),u=$t(r),h=u.mul(t);h.isNegative()||h.gt(s);)r-=c,u=$t(r,this.unsigned),h=u.mul(t);u.isZero()&&(u=Ee),o=o.add(u),s=s.sub(h)}return o};S.div=S.divide;S.modulo=function(t){if(gt(t)||(t=It(t)),yt){var n=(this.unsigned?yt.rem_u:yt.rem_s)(this.low,this.high,t.low,t.high);return j(n,yt.get_high(),this.unsigned)}return this.sub(this.div(t).mul(t))};S.mod=S.modulo;S.rem=S.modulo;S.not=function(){return j(~this.low,~this.high,this.unsigned)};S.and=function(t){return gt(t)||(t=It(t)),j(this.low&t.low,this.high&t.high,this.unsigned)};S.or=function(t){return gt(t)||(t=It(t)),j(this.low|t.low,this.high|t.high,this.unsigned)};S.xor=function(t){return gt(t)||(t=It(t)),j(this.low^t.low,this.high^t.high,this.unsigned)};S.shiftLeft=function(t){return gt(t)&&(t=t.toInt()),(t&=63)===0?this:t<32?j(this.low<<t,this.high<<t|this.low>>>32-t,this.unsigned):j(0,this.low<<t-32,this.unsigned)};S.shl=S.shiftLeft;S.shiftRight=function(t){return gt(t)&&(t=t.toInt()),(t&=63)===0?this:t<32?j(this.low>>>t|this.high<<32-t,this.high>>t,this.unsigned):j(this.high>>t-32,this.high>=0?0:-1,this.unsigned)};S.shr=S.shiftRight;S.shiftRightUnsigned=function(t){if(gt(t)&&(t=t.toInt()),t&=63,t===0)return this;var n=this.high;if(t<32){var r=this.low;return j(r>>>t|n<<32-t,n>>>t,this.unsigned)}else return t===32?j(n,0,this.unsigned):j(n>>>t-32,0,this.unsigned)};S.shru=S.shiftRightUnsigned;S.shr_u=S.shiftRightUnsigned;S.toSigned=function(){return this.unsigned?j(this.low,this.high,!1):this};S.toUnsigned=function(){return this.unsigned?this:j(this.low,this.high,!0)};S.toBytes=function(t){return t?this.toBytesLE():this.toBytesBE()};S.toBytesLE=function(){var t=this.high,n=this.low;return[n&255,n>>>8&255,n>>>16&255,n>>>24,t&255,t>>>8&255,t>>>16&255,t>>>24]};S.toBytesBE=function(){var t=this.high,n=this.low;return[t>>>24,t>>>16&255,t>>>8&255,t&255,n>>>24,n>>>16&255,n>>>8&255,n&255]};V.fromBytes=function(t,n,r){return r?V.fromBytesLE(t,n):V.fromBytesBE(t,n)};V.fromBytesLE=function(t,n){return new V(t[0]|t[1]<<8|t[2]<<16|t[3]<<24,t[4]|t[5]<<8|t[6]<<16|t[7]<<24,n)};V.fromBytesBE=function(t,n){return new V(t[4]<<24|t[5]<<16|t[6]<<8|t[7],t[0]<<24|t[1]<<16|t[2]<<8|t[3],n)};const Xi=Ou(zi),Cl=Wu({__proto__:null,default:Xi},[zi]);/**
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
 */const te=Xi||Cl;function sn(e){return te.fromString(e,!0,16)}const Zi=sn("c3a5c85c97cb3127"),Qt=sn("b492b66fbe98f273"),at=sn("9ae16a3b2f90404f");function or(e){return e.xor(e.shru(47))}function Ji(e,t,n){const r=e.slice(t,t+n);return te.fromBytes(Array.from(r),!0,!0)}function G(e,t){return Ji(e,t,8)}function vs(e,t){return Ji(e,t,4)}function rt(e,t){return t===0?e:e.shru(t).or(e.shl(64-t))}function zt(e,t,n=sn("9ddfea08eb382d69")){let r=e.xor(t).mul(n);r=r.xor(r.shru(47));let s=t.xor(r).mul(n);return s=s.xor(s.shru(47)),s=s.mul(n),s}function Pl(e,t,n,r,s,o){s=s.add(e),o=rt(o.add(s).add(r),21);const a=s;return s=s.add(t),s=s.add(n),o=o.add(rt(s,44)),[s.add(r),o.add(a)]}function fn(e,t,n,r){return Pl(G(e,t),G(e,t+8),G(e,t+16),G(e,t+24),n,r)}function Ol(e,t=e.length){if(t>=8){const n=at.add(t*2),r=G(e,0).add(at),s=G(e,t-8),o=rt(s,37).mul(n).add(r),a=rt(r,25).add(s).mul(n);return zt(o,a,n)}if(t>=4){const n=at.add(t*2),r=vs(e,0);return zt(r.shl(3).add(t),vs(e,t-4),n)}if(t>0){const n=e[0],r=e[t>>1],s=e[t-1],o=n+(r<<8),a=t+(s<<2);return or(at.mul(o).xor(Zi.mul(a))).mul(at)}return at}function Ll(e,t=e.length){const n=at.add(t*2),r=G(e,0).mul(Qt),s=G(e,8),o=G(e,t-8).mul(n),a=G(e,t-16).mul(at);return zt(rt(r.add(s),43).add(rt(o,30)).add(a),r.add(rt(s.add(at),18)).add(o),n)}function Wl(e,t=e.length){const n=at.add(t*2),r=G(e,0).mul(at),s=G(e,8),o=G(e,t-8).mul(n),a=G(e,t-16).mul(at),i=rt(r.add(s),43).add(rt(o,30)).add(a),c=zt(i,r.add(rt(s.add(at),18)).add(o),n),u=G(e,16).mul(n),h=G(e,24),l=i.add(G(e,t-32)).mul(n),f=c.add(G(e,t-24)).mul(n);return zt(rt(u.add(h),43).add(rt(l,30)).add(f),u.add(rt(h.add(r),18)).add(l),n)}function Ul(e,t=e.length){const n=te.fromNumber(81,!0);if(t<=32)return t<=16?Ol(e,t):Ll(e,t);if(t<=64)return Wl(e,t);let r=n,s=n.mul(Qt).add(113),o=or(s.mul(at).add(113)).mul(at),a=[te.UZERO,te.UZERO],i=[te.UZERO,te.UZERO];r=r.mul(at).add(G(e,0));let c=0;const u=(t-1>>6)*64,h=u+(t-1&63)-63;do r=rt(r.add(s).add(a[0]).add(G(e,c+8)),37).mul(Qt),s=rt(s.add(a[1]).add(G(e,c+48)),42).mul(Qt),r=r.xor(i[1]),s=s.add(a[0]).add(G(e,c+40)),o=rt(o.add(i[0]),33).mul(Qt),a=fn(e,c,a[1].mul(Qt),r.add(i[0])),i=fn(e,c+32,o.add(i[1]),s.add(G(e,c+16))),[o,r]=[r,o],c+=64;while(c!==u);const l=Qt.add(o.and(255).shl(1));return c=h,i[0]=i[0].add(t-1&63),a[0]=a[0].add(i[0]),i[0]=i[0].add(a[0]),r=rt(r.add(s).add(a[0]).add(G(e,c+8)),37).mul(l),s=rt(s.add(a[1]).add(G(e,c+48)),42).mul(l),r=r.xor(i[1].mul(9)),s=s.add(a[0].mul(9).add(G(e,c+40))),o=rt(o.add(i[0]),33).mul(l),a=fn(e,c,a[1].mul(l),r.add(i[0])),i=fn(e,c+32,o.add(i[1]),s.add(G(e,c+16))),[o,r]=[r,o],zt(zt(a[0],i[0],l).add(or(s).mul(Zi)).add(o),zt(a[1],i[1],l).add(r),l)}/**
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
 */function ql(e,t){return t==="string"?on(e):Mn([e],t)}function Gl(e,t){return e instanceof Float32Array&&t==="float32"||e instanceof Int32Array&&t==="int32"||e instanceof Uint8Array&&t==="bool"}function Mn(e,t){if(t==="string")throw new Error("Cannot convert a string[] to a TypedArray");if(Array.isArray(e)&&(e=jt(e)),R().getBool("DEBUG")&&zs(e,t),Gl(e,t))return e;if(t==null||t==="float32"||t==="complex64")return new Float32Array(e);if(t==="int32")return new Int32Array(e);if(t==="bool"){const n=new Uint8Array(e.length);for(let r=0;r<n.length;++r)Math.round(e[r])!==0&&(n[r]=1);return n}else throw new Error(`Unknown data type ${t}`)}function ze(){return R().platform.now()}function zl(e,t){return R().platform.fetch(e,t)}function on(e,t="utf-8"){return t=t||"utf-8",R().platform.encode(e,t)}function xn(e,t="utf-8"){return t=t||"utf-8",R().platform.decode(e,t)}function st(e){return R().platform.isTypedArray!=null?R().platform.isTypedArray(e):Gi(e)}function jt(e,t=[],n=!1){if(t==null&&(t=[]),typeof e=="boolean"||typeof e=="number"||typeof e=="string"||Nn(e)||e==null||st(e)&&n)t.push(e);else if(Array.isArray(e)||st(e))for(let r=0;r<e.length;++r)jt(e[r],t,n);else{let r=-1;for(const s of Object.keys(e))/^([1-9]+[0-9]*|0)$/.test(s)&&(r=Math.max(r,Number(s)));for(let s=0;s<=r;s++)jt(e[s],t,n)}return t}const Kl=Object.freeze(Object.defineProperty({__proto__:null,arraysEqual:Ct,arraysEqualWithNull:Us,assert:g,assertNonNegativeIntegerDimensions:pt,assertNonNull:de,assertShapesMatch:ct,bytesFromStringArray:Vs,bytesPerElement:yn,checkConversionForErrors:zs,clamp:Ue,computeStrides:Fe,convertBackendValuesAndArrayBuffer:nl,createScalarValue:ql,createShuffledIndices:Yu,decodeString:xn,distSquared:Hu,encodeString:on,fetch:zl,fingerPrint64:Ul,flatten:jt,getArrayFromDType:Sr,getTypedArrayFromDType:Gs,hasEncodingLoss:el,hexToLong:sn,indexToLoc:ol,inferDtype:rn,inferFromImplicitShape:tl,isBoolean:js,isFunction:Vt,isInt:_e,isNumber:Hs,isPromise:Nn,isScalarShape:Xu,isString:qt,isTypedArray:st,isValidDtype:Ks,locToIndex:sl,makeOnesTypedArray:Ir,makeZerosNestedTypedArray:rl,makeZerosTypedArray:Dn,nearestDivisor:$n,nearestLargerEven:Ku,now:ze,parseAxisParam:nn,randUniform:ju,repeatedTry:Qu,rightPad:Oe,shuffle:Ws,shuffleCombo:zu,sizeFromShape:W,sizeToSquarishShape:Ju,squeezeShape:qs,sum:Vu,swap:wn,tanh:Zu,toNestedArray:ke,toTypedArray:Mn},Symbol.toStringTag,{value:"Module"}));/**
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
 */class Vl{constructor(t,n){this.backendTimer=t,this.logger=n,n==null&&(this.logger=new Hl)}profileKernel(t,n,r){let s;const o=()=>{s=r()};let a;const i=ze();if(this.backendTimer.timerAvailable())a=this.backendTimer.time(o);else{o();for(const u of s)u.dataSync();a=Promise.resolve({kernelMs:ze()-i})}if(R().getBool("CHECK_COMPUTATION_FOR_ERRORS"))for(let u=0;u<s.length;u++){const h=s[u];h.data().then(l=>{jl(l,h.dtype,t)})}return{kernelName:t,outputs:s,inputs:n,timeMs:a.then(u=>u.kernelMs),extraInfo:a.then(u=>u.getExtraProfileInfo!=null?u.getExtraProfileInfo():"")}}logKernelProfile(t){const{kernelName:n,outputs:r,timeMs:s,inputs:o,extraInfo:a}=t;r.forEach(i=>{Promise.all([i.data(),s,a]).then(c=>{this.logger.logKernelProfile(n,i,c[0],c[1],o,c[2])})})}}function jl(e,t,n){if(t!=="float32")return!1;for(let r=0;r<e.length;r++){const s=e[r];if(isNaN(s)||!isFinite(s))return console.warn(`Found ${s} in the result of '${n}'`),!0}return!1}class Hl{logKernelProfile(t,n,r,s,o,a){const i=typeof s=="number"?Oe(`${s}ms`,9):s.error,c=Oe(t,25),u=n.rank,h=n.size,l=Oe(n.shape.toString(),14);let f="";for(const p in o){const w=o[p];if(w!=null){const y=w.shape||n.shape,$=y.length;f+=`${p}: ${$}D ${$>0?y:""} `}}console.log(`%c${c}	%c${i}	%c${u}D ${l}	%c${h}	%c${f}	%c${a}`,"font-weight:bold","color:red","color:blue","color: orange","color: green","color: steelblue")}}/**
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
 */function Xl(e,t,n){const r={},s={};for(let c=0;c<t.length;c++)r[t[c].id]=!0;for(let c=0;c<e.length;c++){const u=e[c],h=u.inputs;for(const l in h){const f=h[l];let p=!1;for(let w=0;w<t.length;w++)if(r[f.id]){u.outputs.forEach(y=>r[y.id]=!0),p=!0,s[u.id]=!0;break}if(p)break}}const o={};o[n.id]=!0;const a={};for(let c=e.length-1;c>=0;c--){const u=e[c],h=u.inputs;for(let l=0;l<u.outputs.length;l++)if(o[u.outputs[l].id]){for(const f in h)o[h[f].id]=!0,a[u.id]=!0;break}}const i=[];for(let c=0;c<e.length;c++){const u=e[c];if(s[u.id]&&a[u.id]){const h={};for(const f in u.inputs){const p=u.inputs[f];r[p.id]&&(h[f]=p)}const l=Object.assign({},u);l.inputs=h,l.outputs=u.outputs,i.push(l)}}return i}function Zl(e,t,n,r){for(let s=t.length-1;s>=0;s--){const o=t[s],a=[];if(o.outputs.forEach(c=>{const u=e[c.id];u!=null?a.push(u):a.push(null)}),o.gradient==null)throw new Error(`Cannot compute gradient: gradient function not found for ${o.kernelName}.`);const i=o.gradient(a);for(const c in o.inputs){if(!(c in i))throw new Error(`Cannot backprop through input ${c}. Available gradients found: ${Object.keys(i)}.`);const u=n(()=>i[c]());if(u.dtype!=="float32")throw new Error(`Error in gradient for op ${o.kernelName}. The gradient of input ${c} must have 'float32' dtype, but has '${u.dtype}'`);const h=o.inputs[c];if(!Ct(u.shape,h.shape))throw new Error(`Error in gradient for op ${o.kernelName}. The gradient of input '${c}' has shape '${u.shape}', which does not match the shape of the input '${h.shape}'`);if(e[h.id]==null)e[h.id]=u;else{const l=e[h.id];e[h.id]=r(l,u),l.dispose()}}}}/**
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
 */const Ss=20,Re=3,Hn=7;function Jl(e,t,n,r){const s=Fe(t),o=Yl(e,t,n,s),a=t.length,i=gn(e,t,n,s,o),c=["Tensor"];return r&&(c.push(`  dtype: ${n}`),c.push(`  rank: ${a}`),c.push(`  shape: [${t}]`),c.push("  values:")),c.push(i.map(u=>"    "+u).join(`
`)),c.join(`
`)}function Yl(e,t,n,r){const s=W(t),o=r[r.length-1],a=new Array(o).fill(0),i=t.length,c=n==="complex64"?Pe(e):e;if(i>1)for(let u=0;u<s/o;u++){const h=u*o;for(let l=0;l<o;l++)a[l]=Math.max(a[l],Ce(c[h+l],0,n).length)}return a}function Ce(e,t,n){let r;return Array.isArray(e)?r=`${parseFloat(e[0].toFixed(Hn))} + ${parseFloat(e[1].toFixed(Hn))}j`:qt(e)?r=`'${e}'`:n==="bool"?r=Yi(e):r=parseFloat(e.toFixed(Hn)).toString(),Oe(r,t)}function Yi(e){return e===0?"false":"true"}function gn(e,t,n,r,s,o=!0){const a=n==="complex64"?2:1,i=t[0],c=t.length;if(c===0){if(n==="complex64"){const y=Pe(e);return[Ce(y[0],0,n)]}return n==="bool"?[Yi(e[0])]:[e[0].toString()]}if(c===1){if(i>Ss){const $=Re*a;let x=Array.from(e.slice(0,$)),N=Array.from(e.slice((i-Re)*a,i*a));return n==="complex64"&&(x=Pe(x),N=Pe(N)),["["+x.map((k,v)=>Ce(k,s[v],n)).join(", ")+", ..., "+N.map((k,v)=>Ce(k,s[i-Re+v],n)).join(", ")+"]"]}return["["+(n==="complex64"?Pe(e):Array.from(e)).map(($,x)=>Ce($,s[x],n)).join(", ")+"]"]}const u=t.slice(1),h=r.slice(1),l=r[0]*a,f=[];if(i>Ss){for(let y=0;y<Re;y++){const $=y*l,x=$+l;f.push(...gn(e.slice($,x),u,n,h,s,!1))}f.push("...");for(let y=i-Re;y<i;y++){const $=y*l,x=$+l;f.push(...gn(e.slice($,x),u,n,h,s,y===i-1))}}else for(let y=0;y<i;y++){const $=y*l,x=$+l;f.push(...gn(e.slice($,x),u,n,h,s,y===i-1))}const p=c===2?",":"";f[0]="["+(i>0?f[0]+p:"");for(let y=1;y<f.length-1;y++)f[y]=" "+f[y]+p;let w=`,
`;for(let y=2;y<c;y++)w+=`
`;return f[f.length-1]=" "+f[f.length-1]+"]"+(o?"":w),f}function Pe(e){const t=[];for(let n=0;n<e.length;n+=2)t.push([e[n],e[n+1]]);return t}/**
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
 */class vn{constructor(t,n,r){if(this.dtype=n,this.shape=t.slice(),this.size=W(t),r!=null){const s=r.length;g(s===this.size,()=>`Length of values '${s}' does not match the size inferred by the shape '${this.size}'.`)}if(n==="complex64")throw new Error("complex64 dtype TensorBuffers are not supported. Please create a TensorBuffer for the real and imaginary parts separately and call tf.complex(real, imag).");this.values=r||Sr(n,this.size),this.strides=Fe(t)}set(t,...n){n.length===0&&(n=[0]),g(n.length===this.rank,()=>`The number of provided coordinates (${n.length}) must match the rank (${this.rank})`);const r=this.locToIndex(n);this.values[r]=t}get(...t){t.length===0&&(t=[0]);let n=0;for(const s of t){if(s<0||s>=this.shape[n]){const o=`Requested out of range element at ${t}.   Buffer shape=${this.shape}`;throw new Error(o)}n++}let r=t[t.length-1];for(let s=0;s<t.length-1;++s)r+=this.strides[s]*t[s];return this.values[r]}locToIndex(t){if(this.rank===0)return 0;if(this.rank===1)return t[0];let n=t[t.length-1];for(let r=0;r<t.length-1;++r)n+=this.strides[r]*t[r];return n}indexToLoc(t){if(this.rank===0)return[];if(this.rank===1)return[t];const n=new Array(this.shape.length);for(let r=0;r<n.length-1;++r)n[r]=Math.floor(t/this.strides[r]),t-=n[r]*this.strides[r];return n[n.length-1]=t,n}get rank(){return this.shape.length}toTensor(){return vt().makeTensor(this.values,this.shape,this.dtype)}}let vt=null,we=null;function Ql(e){vt=e}function th(e){we=e}class Q{constructor(t,n,r,s){this.kept=!1,this.isDisposedInternal=!1,this.shape=t.slice(),this.dtype=n||"float32",this.size=W(t),this.strides=Fe(t),this.dataId=r,this.id=s,this.rankType=this.rank<5?this.rank.toString():"higher"}get rank(){return this.shape.length}async buffer(){const t=await this.data();return we.buffer(this.shape,this.dtype,t)}bufferSync(){return we.buffer(this.shape,this.dtype,this.dataSync())}async array(){const t=await this.data();return ke(this.shape,t,this.dtype==="complex64")}arraySync(){return ke(this.shape,this.dataSync(),this.dtype==="complex64")}async data(){this.throwIfDisposed();const t=vt().read(this.dataId);if(this.dtype==="string"){const n=await t;try{return n.map(r=>xn(r))}catch{throw new Error("Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().")}}return t}dataToGPU(t){return this.throwIfDisposed(),vt().readToGPU(this.dataId,t)}dataSync(){this.throwIfDisposed();const t=vt().readSync(this.dataId);if(this.dtype==="string")try{return t.map(n=>xn(n))}catch{throw new Error("Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().")}return t}async bytes(){this.throwIfDisposed();const t=await vt().read(this.dataId);return this.dtype==="string"?t:new Uint8Array(t.buffer)}dispose(){this.isDisposed||(this.kerasMask&&this.kerasMask.dispose(),vt().disposeTensor(this),this.isDisposedInternal=!0)}get isDisposed(){return this.isDisposedInternal}throwIfDisposed(){if(this.isDisposed)throw new Error("Tensor is disposed.")}print(t=!1){return we.print(this,t)}clone(){return this.throwIfDisposed(),we.clone(this)}toString(t=!1){const n=this.dataSync();return Jl(n,this.shape,this.dtype,t)}cast(t){return this.throwIfDisposed(),we.cast(this,t)}variable(t=!0,n,r){return this.throwIfDisposed(),vt().makeVariable(this,t,n,r)}}Object.defineProperty(Q,Symbol.hasInstance,{value:e=>!!e&&e.data!=null&&e.dataSync!=null&&e.throwIfDisposed!=null});function Qi(){return _r("Tensor",()=>Q)}Qi();class Ke extends Q{constructor(t,n,r,s){super(t.shape,t.dtype,t.dataId,s),this.trainable=n,this.name=r}assign(t){if(t.dtype!==this.dtype)throw new Error(`dtype of the new value (${t.dtype}) and previous value (${this.dtype}) must match`);if(!Ct(t.shape,this.shape))throw new Error(`shape of the new value (${t.shape}) and previous value (${this.shape}) must match`);vt().disposeTensor(this),this.dataId=t.dataId,vt().incRef(this,null)}dispose(){vt().disposeVariable(this),this.isDisposedInternal=!0}}Object.defineProperty(Ke,Symbol.hasInstance,{value:e=>e instanceof Q&&e.assign!=null&&e.assign instanceof Function});/**
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
 */var ar;(function(e){e.R0="R0",e.R1="R1",e.R2="R2",e.R3="R3",e.R4="R4",e.R5="R5",e.R6="R6"})(ar||(ar={}));var ir;(function(e){e.float32="float32",e.int32="int32",e.bool="int32",e.complex64="complex64"})(ir||(ir={}));var cr;(function(e){e.float32="float32",e.int32="int32",e.bool="bool",e.complex64="complex64"})(cr||(cr={}));var ur;(function(e){e.float32="float32",e.int32="float32",e.bool="float32",e.complex64="complex64"})(ur||(ur={}));var lr;(function(e){e.float32="complex64",e.int32="complex64",e.bool="complex64",e.complex64="complex64"})(lr||(lr={}));const eh={float32:ur,int32:ir,bool:cr,complex64:lr};function Fn(e,t){if(e==="string"||t==="string"){if(e==="string"&&t==="string")return"string";throw new Error(`Can not upcast ${e} with ${t}`)}return eh[e][t]}function nh(e){return Fn(e,"int32")}function tc(e){return e!=null&&typeof e=="object"&&"texture"in e&&e.texture instanceof WebGLTexture}function ec(e){return typeof GPUBuffer<"u"&&e!=null&&typeof e=="object"&&"buffer"in e&&e.buffer instanceof GPUBuffer}/**
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
 */function Y(e,t){if(e.dtype===t.dtype)return[e,t];const n=Fn(e.dtype,t.dtype);return[e.cast(n),t.cast(n)]}function nc(e,t){g(e.dtype===t.dtype,()=>`The dtypes of the first(${e.dtype}) and second(${t.dtype}) input must match`)}function rh(e,t){return t.some(n=>n.id===e.id)}function Cr(e){const t=[];return rc(e,t,new Set),t}function rc(e,t,n){if(e==null)return;if(e instanceof Q){t.push(e);return}if(!sh(e))return;const r=e;for(const s in r){const o=r[s];n.has(o)||(n.add(o),rc(o,t,n))}}function sh(e){return Array.isArray(e)||typeof e=="object"}const oh=Object.freeze(Object.defineProperty({__proto__:null,assertTypesMatch:nc,getTensorsInContainer:Cr,isTensorInList:rh,makeTypesMatch:Y},Symbol.toStringTag,{value:"Module"}));/**
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
 */function Xn(e){return e.kernelName!=null}class Is{constructor(){this.registeredVariables={},this.nextTapeNodeId=0,this.numBytes=0,this.numTensors=0,this.numStringTensors=0,this.numDataBuffers=0,this.gradientDepth=0,this.kernelDepth=0,this.scopeStack=[],this.numDataMovesStack=[],this.nextScopeId=0,this.tensorInfo=new WeakMap,this.profiling=!1,this.activeProfile={newBytes:0,newTensors:0,peakBytes:0,kernels:[],result:null,get kernelNames(){return Array.from(new Set(this.kernels.map(t=>t.name)))}}}dispose(){for(const t in this.registeredVariables)this.registeredVariables[t].dispose()}}class Ne{constructor(t){this.ENV=t,this.registry={},this.registryFactory={},this.pendingBackendInitId=0,this.state=new Is}async ready(){if(this.pendingBackendInit!=null)return this.pendingBackendInit.then(()=>{});if(this.backendInstance!=null)return;const t=this.getSortedBackends();for(let n=0;n<t.length;n++){const r=t[n];if(await this.initializeBackend(r).success){await this.setBackend(r);return}}throw new Error("Could not initialize any backends, all backend initializations failed.")}get backend(){if(this.pendingBackendInit!=null)throw new Error(`Backend '${this.backendName}' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods`);if(this.backendInstance==null){const{name:t,asyncInit:n}=this.initializeBackendsAndReturnBest();if(n)throw new Error(`The highest priority backend '${t}' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods`);this.setBackend(t)}return this.backendInstance}backendNames(){return Object.keys(this.registryFactory)}findBackend(t){if(!(t in this.registry))if(t in this.registryFactory){const{asyncInit:n}=this.initializeBackend(t);if(n)return null}else return null;return this.registry[t]}findBackendFactory(t){return t in this.registryFactory?this.registryFactory[t].factory:null}registerBackend(t,n,r=1){return t in this.registryFactory?(Wt(`${t} backend was already registered. Reusing existing backend factory.`),!1):(this.registryFactory[t]={factory:n,priority:r},!0)}async setBackend(t){if(this.registryFactory[t]==null)throw new Error(`Backend name '${t}' not found in registry`);if(this.backendName=t,this.registry[t]==null){this.backendInstance=null;const{success:n,asyncInit:r}=this.initializeBackend(t);if(!(r?await n:n))return!1}return this.backendInstance=this.registry[t],this.setupRegisteredKernels(),this.profiler=new Vl(this.backendInstance),!0}setupRegisteredKernels(){En(this.backendName).forEach(n=>{n.setupFunc!=null&&n.setupFunc(this.backendInstance)})}disposeRegisteredKernels(t){En(t).forEach(r=>{r.disposeFunc!=null&&r.disposeFunc(this.registry[t])})}initializeBackend(t){const n=this.registryFactory[t];if(n==null)throw new Error(`Cannot initialize backend ${t}, no registration found.`);try{const r=n.factory();if(r&&!(r instanceof Ls)&&typeof r.then=="function"){const s=++this.pendingBackendInitId,o=r.then(a=>s<this.pendingBackendInitId?!1:(this.registry[t]=a,this.pendingBackendInit=null,!0)).catch(a=>(s<this.pendingBackendInitId||(this.pendingBackendInit=null,Wt(`Initialization of backend ${t} failed`),Wt(a.stack||a.message)),!1));return this.pendingBackendInit=o,{success:o,asyncInit:!0}}else return this.registry[t]=r,{success:!0,asyncInit:!1}}catch(r){return Wt(`Initialization of backend ${t} failed`),Wt(r.stack||r.message),{success:!1,asyncInit:!1}}}removeBackend(t){if(!(t in this.registryFactory))throw new Error(`${t} backend not found in registry`);this.backendName===t&&this.pendingBackendInit!=null&&this.pendingBackendInitId++,t in this.registry&&(this.disposeRegisteredKernels(t),this.registry[t].dispose(),delete this.registry[t]),delete this.registryFactory[t],this.backendName===t&&(this.pendingBackendInit=null,this.backendName=null,this.backendInstance=null)}getSortedBackends(){if(Object.keys(this.registryFactory).length===0)throw new Error("No backend found in registry.");return Object.keys(this.registryFactory).sort((t,n)=>this.registryFactory[n].priority-this.registryFactory[t].priority)}initializeBackendsAndReturnBest(){const t=this.getSortedBackends();for(let n=0;n<t.length;n++){const r=t[n],{success:s,asyncInit:o}=this.initializeBackend(r);if(o||s)return{name:r,asyncInit:o}}throw new Error("Could not initialize any backends, all backend initializations failed.")}moveData(t,n){const r=this.state.tensorInfo.get(n),s=r.backend,o=this.readSync(n),a=s.refCount(n);s.disposeData(n,!0),r.backend=t,t.move(n,o,r.shape,r.dtype,a),this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack[this.state.numDataMovesStack.length-1]++}tidy(t,n){let r=null;if(n==null){if(typeof t!="function")throw new Error("Please provide a function to tidy()");n=t}else{if(typeof t!="string"&&!(t instanceof String))throw new Error("When calling with two arguments, the first argument to tidy() must be a string");if(typeof n!="function")throw new Error("When calling with two arguments, the 2nd argument to tidy() must be a function");r=t}let s;return this.scopedRun(()=>this.startScope(r),()=>this.endScope(s),()=>(s=n(),s instanceof Promise&&console.error("Cannot return a Promise inside of tidy."),s))}scopedRun(t,n,r){t();try{const s=r();return n(),s}catch(s){throw n(),s}}nextTensorId(){return Ne.nextTensorId++}nextVariableId(){return Ne.nextVariableId++}clone(t){const n=b.runKernel(Mr,{x:t}),r={x:t},s=a=>({x:()=>{const i="float32",c={x:a},u={dtype:i};return b.runKernel(Dr,c,u)}}),o=[];return this.addTapeNode(this.state.activeScope.name,r,[n],s,o,{}),n}runKernel(t,n,r){if(this.backendName==null&&this.backend,!(Ge(t,this.backendName)!=null))throw new Error(`Kernel '${t}' not registered for backend '${this.backendName}'`);return this.runKernelFunc({kernelName:t,inputs:n,attrs:r})}shouldCheckForMemLeaks(){return this.ENV.getBool("IS_TEST")}checkKernelForMemLeak(t,n,r){const s=this.backend.numDataIds();let o=0;r.forEach(c=>{o+=c.dtype==="complex64"?3:1});const a=this.state.numDataMovesStack[this.state.numDataMovesStack.length-1],i=s-n-o-a;if(i>0)throw new Error(`Backend '${this.backendName}' has an internal memory leak (${i} data ids) after running '${t}'`)}runKernelFunc(t){let n,r=[];const s=this.isTapeOn(),o=this.state.numBytes,a=this.state.numTensors;this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack.push(0);let i;this.backendName==null&&this.backend;let c;const u=Xn(t)?t.kernelName:this.state.activeScope!=null?this.state.activeScope.name:"";if(Xn(t)){const{kernelName:w,inputs:y,attrs:$}=t;this.backendName==null&&this.backend;const x=Ge(w,this.backendName);g(x!=null,()=>`Cannot find registered kernel '${w}' for backend '${this.backendName}'`),i=()=>{const N=this.backend.numDataIds();c=x.kernelFunc({inputs:y,attrs:$,backend:this.backend});const k=Array.isArray(c)?c:[c];this.shouldCheckForMemLeaks()&&this.checkKernelForMemLeak(w,N,k);const v=k.map(I=>I.rank!=null?I:this.makeTensorFromTensorInfo(I));if(s){const I=this.getTensorsForGradient(w,y,v);r=this.saveTensorsForBackwardMode(I)}return v}}else{const{forwardFunc:w}=t,y=$=>{s&&(r=$.map(x=>this.keep(this.clone(x))))};i=()=>{const $=this.backend.numDataIds();c=this.tidy(()=>w(this.backend,y));const x=Array.isArray(c)?c:[c];return this.shouldCheckForMemLeaks()&&this.checkKernelForMemLeak(u,$,x),x}}const{inputs:h,attrs:l}=t,f=Xn(t)?null:t.backwardsFunc;let p;return this.scopedRun(()=>this.state.kernelDepth++,()=>this.state.kernelDepth--,()=>{!this.ENV.getBool("DEBUG")&&!this.state.profiling?n=i():(p=this.profiler.profileKernel(u,h,()=>i()),this.ENV.getBool("DEBUG")&&this.profiler.logKernelProfile(p),n=p.outputs)}),s&&this.addTapeNode(u,h,n,f,r,l),this.state.profiling&&this.state.activeProfile.kernels.push({name:u,bytesAdded:this.state.numBytes-o,totalBytesSnapshot:this.state.numBytes,tensorsAdded:this.state.numTensors-a,totalTensorsSnapshot:this.state.numTensors,inputShapes:Object.keys(h).map(w=>h[w]!=null?h[w].shape:null),outputShapes:n.map(w=>w.shape),kernelTimeMs:p.timeMs,extraInfo:p.extraInfo}),Array.isArray(c)?n:n[0]}saveTensorsForBackwardMode(t){return t.map(r=>this.keep(this.clone(r)))}getTensorsForGradient(t,n,r){const s=rr(t);if(s!=null){const o=s.inputsToSave||[],a=s.outputsToSave||[];let i;s.saveAllInputs?(g(Array.isArray(n),()=>"saveAllInputs is true, expected inputs to be an array."),i=Object.keys(n).map(u=>n[u])):i=o.map(u=>n[u]);const c=r.filter((u,h)=>a[h]);return i.concat(c)}return[]}makeTensor(t,n,r,s){if(t==null)throw new Error("Values passed to engine.makeTensor() are null");r=r||"float32",s=s||this.backend;let o=t;r==="string"&&qt(t[0])&&(o=t.map(c=>on(c)));const a=s.write(o,n,r),i=new Q(n,r,a,this.nextTensorId());if(this.trackTensor(i,s),r==="string"){const c=this.state.tensorInfo.get(a),u=Vs(o);this.state.numBytes+=u-c.bytes,c.bytes=u}return i}makeTensorFromDataId(t,n,r,s){r=r||"float32";const o={dataId:t,shape:n,dtype:r};return this.makeTensorFromTensorInfo(o,s)}makeTensorFromTensorInfo(t,n){const{dataId:r,shape:s,dtype:o}=t,a=new Q(s,o,r,this.nextTensorId());return this.trackTensor(a,n),a}makeVariable(t,n=!0,r,s){r=r||this.nextVariableId().toString(),s!=null&&s!==t.dtype&&(t=t.cast(s));const o=new Ke(t,n,r,this.nextTensorId());if(this.state.registeredVariables[o.name]!=null)throw new Error(`Variable with name ${o.name} was already registered`);return this.state.registeredVariables[o.name]=o,this.incRef(o,this.backend),o}trackTensor(t,n){this.state.numTensors++,t.dtype==="string"&&this.state.numStringTensors++;let r=0;t.dtype!=="complex64"&&t.dtype!=="string"&&(r=t.size*yn(t.dtype)),this.state.numBytes+=r,this.state.tensorInfo.has(t.dataId)||(this.state.numDataBuffers++,this.state.tensorInfo.set(t.dataId,{backend:n||this.backend,dtype:t.dtype,shape:t.shape,bytes:r})),t instanceof Ke||this.track(t)}incRef(t,n){this.trackTensor(t,n),this.backend.incRef(t.dataId)}removeDataId(t,n){this.state.tensorInfo.has(t)&&this.state.tensorInfo.get(t).backend===n&&(this.state.tensorInfo.delete(t),this.state.numDataBuffers--)}disposeTensor(t){if(!this.state.tensorInfo.has(t.dataId))return;const n=this.state.tensorInfo.get(t.dataId);if(this.state.numTensors--,t.dtype==="string"&&(this.state.numStringTensors--,this.state.numBytes-=n.bytes),t.dtype!=="complex64"&&t.dtype!=="string"){const r=t.size*yn(t.dtype);this.state.numBytes-=r}n.backend.disposeData(t.dataId)&&this.removeDataId(t.dataId,n.backend)}disposeVariables(){for(const t in this.state.registeredVariables){const n=this.state.registeredVariables[t];this.disposeVariable(n)}}disposeVariable(t){this.disposeTensor(t),this.state.registeredVariables[t.name]!=null&&delete this.state.registeredVariables[t.name]}memory(){const t=this.backend.memory();return t.numTensors=this.state.numTensors,t.numDataBuffers=this.state.numDataBuffers,t.numBytes=this.state.numBytes,this.state.numStringTensors>0&&(t.unreliable=!0,t.reasons==null&&(t.reasons=[]),t.reasons.push("Memory usage by string tensors is approximate (2 bytes per character)")),t}async profile(t){this.state.profiling=!0;const n=this.state.numBytes,r=this.state.numTensors;this.state.activeProfile.kernels=[],this.state.activeProfile.result=await t(),this.state.profiling=!1,this.state.activeProfile.peakBytes=Math.max(...this.state.activeProfile.kernels.map(s=>s.totalBytesSnapshot)),this.state.activeProfile.newBytes=this.state.numBytes-n,this.state.activeProfile.newTensors=this.state.numTensors-r;for(const s of this.state.activeProfile.kernels)s.kernelTimeMs=await s.kernelTimeMs,s.extraInfo=await s.extraInfo;return this.state.activeProfile}isTapeOn(){return this.state.gradientDepth>0&&this.state.kernelDepth===0}addTapeNode(t,n,r,s,o,a){const i={id:this.state.nextTapeNodeId++,kernelName:t,inputs:n,outputs:r,saved:o},c=rr(t);c!=null&&(s=c.gradFunc),s!=null&&(i.gradient=u=>(u=u.map((h,l)=>{if(h==null){const f=r[l],p=Dn(f.size,f.dtype);return this.makeTensor(p,f.shape,f.dtype)}return h}),s(u.length>1?u:u[0],o,a))),this.state.activeTape.push(i)}keep(t){return t.kept=!0,t}startTape(){this.state.gradientDepth===0&&(this.state.activeTape=[]),this.state.gradientDepth++}endTape(){this.state.gradientDepth--}startScope(t){const n={track:[],name:"unnamed scope",id:this.state.nextScopeId++};t&&(n.name=t),this.state.scopeStack.push(n),this.state.activeScope=n}endScope(t){const n=Cr(t),r=new Set(n.map(o=>o.id));for(let o=0;o<this.state.activeScope.track.length;o++){const a=this.state.activeScope.track[o];!a.kept&&!r.has(a.id)&&a.dispose()}const s=this.state.scopeStack.pop();this.state.activeScope=this.state.scopeStack.length===0?null:this.state.scopeStack[this.state.scopeStack.length-1],n.forEach(o=>{!o.kept&&o.scopeId===s.id&&this.track(o)})}gradients(t,n,r,s=!1){if(g(n.length>0,()=>"gradients() received an empty list of xs."),r!=null&&r.dtype!=="float32")throw new Error(`dy must have 'float32' dtype, but has '${r.dtype}'`);const o=this.scopedRun(()=>this.startTape(),()=>this.endTape(),()=>this.tidy("forward",t));g(o instanceof Q,()=>"The result y returned by f() must be a tensor.");const a=Xl(this.state.activeTape,n,o);if(!s&&a.length===0&&n.length>0)throw new Error("Cannot compute gradient of y=f(x) with respect to x. Make sure that the f you passed encloses all operations that lead from x to y.");return this.tidy("backward",()=>{const i={};i[o.id]=r??ah(o.shape),Zl(i,a,u=>this.tidy(u),ih);const c=n.map(u=>i[u.id]);return this.state.gradientDepth===0&&(this.state.activeTape.forEach(u=>{for(const h of u.saved)h.dispose()}),this.state.activeTape=null),{value:o,grads:c}})}customGrad(t){return g(Vt(t),()=>"The f passed in customGrad(f) must be a function."),(...n)=>{g(n.every(i=>i instanceof Q),()=>"The args passed in customGrad(f)(x1, x2,...) must all be tensors");let r;const s={};n.forEach((i,c)=>{s[c]=i});const o=(i,c)=>(r=t(...n,c),g(r.value instanceof Q,()=>"The function f passed in customGrad(f) must return an object where `obj.value` is a tensor"),g(Vt(r.gradFunc),()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function."),r.value),a=(i,c)=>{const u=r.gradFunc(i,c),h=Array.isArray(u)?u:[u];g(h.length===n.length,()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns the same number of tensors as inputs passed to f(...)."),g(h.every(f=>f instanceof Q),()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns a list of only tensors.");const l={};return h.forEach((f,p)=>{l[p]=()=>f}),l};return this.runKernelFunc({forwardFunc:o,backwardsFunc:a,inputs:s})}}readSync(t){return this.state.tensorInfo.get(t).backend.readSync(t)}read(t){return this.state.tensorInfo.get(t).backend.read(t)}readToGPU(t,n){return this.state.tensorInfo.get(t).backend.readToGPU(t,n)}async time(t){const n=ze(),r=await this.backend.time(t);return r.wallMs=ze()-n,r}track(t){return this.state.activeScope!=null&&(t.scopeId=this.state.activeScope.id,this.state.activeScope.track.push(t)),t}get registeredVariables(){return this.state.registeredVariables}reset(){this.pendingBackendInitId++,this.state.dispose(),this.ENV.reset(),this.state=new Is;for(const t in this.registry)this.disposeRegisteredKernels(t),this.registry[t].dispose(),delete this.registry[t];this.backendName=null,this.backendInstance=null,this.pendingBackendInit=null}}Ne.nextTensorId=0;Ne.nextVariableId=0;function ah(e){const t=Ir(W(e),"float32");return b.makeTensor(t,e,"float32")}function sc(){const e=Js();if(e._tfengine==null){const t=new Zs(e);e._tfengine=new Ne(t)}return ul(e._tfengine.ENV),Ql(()=>e._tfengine),e._tfengine}const b=sc();function ih(e,t){const n={a:e,b:t};return b.runKernel(Ar,n)}/**
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
 */function ch(){return typeof navigator<"u"&&navigator!=null}let hr;function uh(e){hr=e}function lh(e){if(hr!==void 0)return hr;if(e||ch()){if(e||(e=navigator),e.product==="ReactNative")return!0;const t=e.userAgent||e.vendor||(typeof window<"u"?window.opera:"");if(!t){const n=e;return n.userAgentData&&n.userAgentData.mobile}return/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(t)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(t.substr(0,4))}return!1}function oc(){return typeof window<"u"&&window.document!=null||typeof WorkerGlobalScope<"u"}const hh=Object.freeze(Object.defineProperty({__proto__:null,isBrowser:oc,isMobile:lh,mockIsMobile:uh},Symbol.toStringTag,{value:"Module"}));/**
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
 */const lt=R();lt.registerFlag("DEBUG",()=>!1,e=>{e&&console.warn("Debugging mode is ON. The output of every math call will be downloaded to CPU and checked for NaNs. This significantly impacts performance.")});lt.registerFlag("IS_BROWSER",()=>oc());lt.registerFlag("IS_NODE",()=>typeof process<"u"&&typeof process.versions<"u"&&typeof process.versions.node<"u");lt.registerFlag("IS_CHROME",()=>typeof navigator<"u"&&navigator!=null&&navigator.userAgent!=null&&/Chrome/.test(navigator.userAgent)&&/Google Inc/.test(navigator.vendor));lt.registerFlag("IS_SAFARI",()=>typeof navigator<"u"&&navigator!=null&&navigator.userAgent!=null&&/Safari/.test(navigator.userAgent)&&/Apple/.test(navigator.vendor));lt.registerFlag("PROD",()=>!1);lt.registerFlag("TENSORLIKE_CHECK_SHAPE_CONSISTENCY",()=>lt.getBool("DEBUG"));lt.registerFlag("DEPRECATION_WARNINGS_ENABLED",()=>!0);lt.registerFlag("IS_TEST",()=>!1);lt.registerFlag("CHECK_COMPUTATION_FOR_ERRORS",()=>lt.getBool("DEBUG"));lt.registerFlag("WRAP_TO_IMAGEBITMAP",()=>!1);lt.registerFlag("CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU",()=>!1);lt.registerFlag("USE_SETTIMEOUTCUSTOM",()=>!1);/**
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
 */function Dt(e,t){let n=e;if(st(e))return t==="string"?[]:[e.length];if(tc(e)){const s=e.channels||"RGBA";return[e.height,e.width*s.length]}else if(ec(e))return[e.buffer.size/(t==null?4:yn(t))];if(!Array.isArray(e))return[];const r=[];for(;Array.isArray(n)||st(n)&&t!=="string";)r.push(n.length),n=n[0];return Array.isArray(e)&&R().getBool("TENSORLIKE_CHECK_SHAPE_CONSISTENCY")&&ac(e,r,[]),r}function ac(e,t,n){if(n=n||[],!Array.isArray(e)&&!st(e)){g(t.length===0,()=>`Element arr[${n.join("][")}] is a primitive, but should be an array/TypedArray of ${t[0]} elements`);return}g(t.length>0,()=>`Element arr[${n.join("][")}] should be a primitive, but is an array of ${e.length} elements`),g(e.length===t[0],()=>`Element arr[${n.join("][")}] should have ${t[0]} elements, but has ${e.length} elements`);const r=t.slice(1);for(let s=0;s<e.length;++s)ac(e[s],r,n.concat(s))}function Ts(e,t,n,r){if(e!=="string_or_numeric"){if(e==null)throw new Error("Expected dtype cannot be null.");if(e!=="numeric"&&e!==t||e==="numeric"&&t==="string")throw new Error(`Argument '${n}' passed to '${r}' must be ${e} tensor, but got ${t} tensor`)}}function d(e,t,n,r="numeric"){if(e instanceof Qi())return Ts(r,e.dtype,t,n),e;let s=rn(e);if(s!=="string"&&["bool","int32","float32"].indexOf(r)>=0&&(s=r),Ts(r,s,t,n),e==null||!st(e)&&!Array.isArray(e)&&typeof e!="number"&&typeof e!="boolean"&&typeof e!="string"){const c=e==null?"null":e.constructor.name;throw new Error(`Argument '${t}' passed to '${n}' must be a Tensor or TensorLike, but got '${c}'`)}const o=Dt(e,s);!st(e)&&!Array.isArray(e)&&(e=[e]);const i=s!=="string"?Mn(e,s):jt(e,[],!0);return b.makeTensor(i,o,s)}function Ve(e,t,n,r="numeric"){if(!Array.isArray(e))throw new Error(`Argument ${t} passed to ${n} must be a \`Tensor[]\` or \`TensorLike[]\``);return e.map((o,a)=>d(o,`${t}[${a}]`,n,r))}/**
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
 */const ic="__op";function m(e){const t=Object.keys(e);if(t.length!==1)throw new Error(`Please provide an object with a single key (operation name) mapping to a function. Got an object with ${t.length} keys.`);let n=t[0];const r=e[n];n.endsWith("_")&&(n=n.substring(0,n.length-1)),n=n+ic;const s=(...o)=>{b.startScope(n);try{const a=r(...o);return Nn(a)&&console.error("Cannot return a Promise inside of tidy."),b.endScope(a),a}catch(a){throw b.endScope(null),a}};return Object.defineProperty(s,"name",{value:n,configurable:!0}),s}/**
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
 */function fh(e,t){const n=d(e,"real","complex"),r=d(t,"imag","complex");ct(n.shape,r.shape,`real and imag shapes, ${n.shape} and ${r.shape}, must match in call to tf.complex().`);const s={real:n,imag:r};return b.runKernel(Eo,s)}const Ht=m({complex_:fh});/**
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
 */function Zt(e,t,n,r){if(r==null)r=rn(e);else if(r==="complex64")throw new Error("Cannot construct a complex64 tensor directly. Please use tf.complex(real, imag).");if(ec(e)||tc(e)){if(r!=="float32"&&r!=="int32")throw new Error(`Creating tensor from GPU data only supports 'float32'|'int32' dtype, while the dtype is ${r}.`);return b.backend.createTensorFromGPUData(e,t||n,r)}if(!st(e)&&!Array.isArray(e)&&typeof e!="number"&&typeof e!="boolean"&&typeof e!="string")throw new Error("values passed to tensor(values) must be a number/boolean/string or an array of numbers/booleans/strings, or a TypedArray");if(t!=null){pt(t);const s=W(t),o=W(n);g(s===o,()=>`Based on the provided shape, [${t}], the tensor should have ${s} values but has ${o}`);for(let a=0;a<n.length;++a){const i=n[a],c=a===n.length-1?i!==W(t.slice(a)):!0;g(n[a]===t[a]||!c,()=>`Error creating a new Tensor. Inferred shape (${n}) does not match the provided shape (${t}). `)}}return!st(e)&&!Array.isArray(e)&&(e=[e]),t=t||n,e=r!=="string"?Mn(e,r):jt(e,[],!0),b.makeTensor(e,t,r)}/**
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
 */function xe(e,t,n){const r=Dt(e,n);return Zt(e,t,r,n)}/**
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
 */const oe={float32:4,float16:2,int32:4,uint16:2,uint8:1,bool:1,complex64:8};class Tt{static join(t){return new Tt(t).slice()}constructor(t){if(this.shards=[],this.previousShardIndex=0,t==null||(t instanceof Array||(t=[t]),t=t.map(r=>st(r)?r.buffer:r),t.length===0))return;this.bufferUniformSize=t[0].byteLength;let n=0;for(let r=0;r<t.length;r++){const s=t[r];r!==t.length-1&&s.byteLength!==this.bufferUniformSize&&(this.bufferUniformSize=void 0);const o=n+s.byteLength;this.shards.push({buffer:s,start:n,end:o}),n=o}this.shards.length===0&&(this.byteLength=0),this.byteLength=this.shards[this.shards.length-1].end}slice(t=0,n=this.byteLength){if(this.shards.length===0)return new ArrayBuffer(0);if(t=isNaN(Number(t))?0:t,n=isNaN(Number(n))?0:n,t=Math.max(0,t),n=Math.min(this.byteLength,n),n<=t)return new ArrayBuffer(0);const r=this.findShardForByte(t);if(r===-1)throw new Error(`Could not find start shard for byte ${t}`);const s=n-t,o=new ArrayBuffer(s),a=new Uint8Array(o);let i=0;for(let c=r;c<this.shards.length;c++){const u=this.shards[c],l=t+i-u.start,f=i,w=Math.min(n,u.end)-u.start,y=new Uint8Array(u.buffer,l,w-l);if(a.set(y,f),i+=y.length,n<u.end)break}return o}findShardForByte(t){if(this.shards.length===0||t<0||t>=this.byteLength)return-1;if(this.bufferUniformSize!=null)return this.previousShardIndex=Math.floor(t/this.bufferUniformSize),this.previousShardIndex;function n(s){return t<s.start?-1:t>=s.end?1:0}if(n(this.shards[this.previousShardIndex])===0)return this.previousShardIndex;const r=dh(this.shards,n);return r===-1?-1:(this.previousShardIndex=r,this.previousShardIndex)}}function dh(e,t){let n=0,r=e.length;for(;n<=r;){const s=Math.floor((r-n)/2)+n,o=t(e[s]);if(o===0)return s;o<0?r=s:n=s+1}return-1}/**
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
 */function ph(){R().set("PROD",!0)}function gh(){R().set("DEBUG",!0)}function mh(){R().set("DEPRECATION_WARNINGS_ENABLED",!1),console.warn("TensorFlow.js deprecation warnings have been disabled.")}function bh(e){R().getBool("DEPRECATION_WARNINGS_ENABLED")&&console.warn(e+" You can disable deprecation warnings with tf.disableDeprecationWarnings().")}function wh(){b.disposeVariables()}function yh(){return b}function $h(){return b.memory()}function Eh(e){return b.profile(e)}function tt(e,t){return b.tidy(e,t)}function ut(e){Cr(e).forEach(n=>n.dispose())}function cc(e){return b.keep(e)}function kh(e){return b.time(e)}function xh(e){return b.setBackend(e)}function vh(){return b.ready()}function uc(){return b.backendName}function Sh(e){b.removeBackend(e)}function Ih(e){return b.findBackend(e)}function Th(e){return b.findBackendFactory(e)}function _h(e,t,n=1){return b.registerBackend(e,t,n)}function lc(){return b.backend}function Ah(e,t){R().setPlatform(e,t)}/**
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
 */const Xt=4;async function Dh(e,t){const n=[],r=[],s=Array.isArray(e)?e.map(a=>a.name):Object.keys(e);for(let a=0;a<s.length;++a){const i=s[a],c=Array.isArray(e)?e[a].tensor:e[i];if(c.dtype!=="float32"&&c.dtype!=="int32"&&c.dtype!=="bool"&&c.dtype!=="string"&&c.dtype!=="complex64")throw new Error(`Unsupported dtype in weight '${i}': ${c.dtype}`);const u={name:i,shape:c.shape,dtype:c.dtype};if(c.dtype==="string"){const h=new Promise(async l=>{const f=await c.bytes(),p=f.reduce(($,x)=>$+x.length,0)+Xt*f.length,w=new Uint8Array(p);let y=0;for(let $=0;$<f.length;$++){const x=f[$],N=new Uint8Array(new Uint32Array([x.length]).buffer);w.set(N,y),y+=Xt,w.set(x,y),y+=x.length}l(w)});r.push(h)}else r.push(c.data());t!=null&&(u.group=t),n.push(u)}const o=await Promise.all(r);return{data:Bh(o),specs:n}}function hc(e,t){const n=new Tt(e),r={};let s=0;for(const o of t){const a=Nh(o,(i,c)=>n.slice(s+i,s+c));r[o.name]=fc(o,n.slice(s,s+a)),s+=a}return r}function Nh(e,t){const n=W(e.shape);let r;if("quantization"in e){const s=e.quantization;r=oe[s.dtype]}else if(e.dtype==="string"){let s=0;for(let o=0;o<n;o++)s+=Xt+new Uint32Array(t(s,s+Xt))[0];return s}else r=oe[e.dtype];return n*r}async function Mh(e,t){const n=W(e.shape);let r;if("quantization"in e){const s=e.quantization;r=oe[s.dtype]}else if(e.dtype==="string"){let s=0;for(let o=0;o<n;o++)s+=Xt+new Uint32Array(await t(s,s+Xt))[0];return s}else r=oe[e.dtype];return n*r}function fc(e,t){const n=e.name,r=e.dtype,s=e.shape,o=W(s);let a,i=0;if("quantization"in e){const c=e.quantization;if(c.dtype==="uint8"||c.dtype==="uint16"){if(!("min"in c&&"scale"in c))throw new Error(`Weight ${e.name} with quantization ${c.dtype} doesn't have corresponding metadata min and scale.`)}else if(c.dtype==="float16"){if(r!=="float32")throw new Error(`Weight ${e.name} is quantized with ${c.dtype} which only supports weights of type float32 not ${r}.`)}else throw new Error(`Weight ${e.name} has unknown quantization dtype ${c.dtype}. Supported quantization dtypes are: 'uint8', 'uint16', and 'float16'.`);const u=oe[c.dtype],h=c.dtype==="uint8"?new Uint8Array(t):new Uint16Array(t);if(r==="float32")if(c.dtype==="uint8"||c.dtype==="uint16"){a=new Float32Array(h.length);for(let l=0;l<h.length;l++){const f=h[l];a[l]=f*c.scale+c.min}}else if(c.dtype==="float16")a=Uh()(h);else throw new Error(`Unsupported quantization type ${c.dtype} for weight type float32.`);else if(r==="int32"){if(c.dtype!=="uint8"&&c.dtype!=="uint16")throw new Error(`Unsupported quantization type ${c.dtype} for weight type int32.`);a=new Int32Array(h.length);for(let l=0;l<h.length;l++){const f=h[l];a[l]=Math.round(f*c.scale+c.min)}}else throw new Error(`Unsupported dtype in weight '${n}': ${r}`);i+=o*u}else if(r==="string"){const c=W(e.shape);a=[];for(let u=0;u<c;u++){const h=new Uint32Array(t.slice(i,i+Xt))[0];i+=Xt;const l=new Uint8Array(t.slice(i,i+h));a.push(l),i+=h}}else{const c=oe[r];if(r==="float32")a=new Float32Array(t);else if(r==="int32")a=new Int32Array(t);else if(r==="bool")a=new Uint8Array(t);else if(r==="complex64"){a=new Float32Array(t);const u=new Float32Array(a.length/2),h=new Float32Array(a.length/2);for(let w=0;w<u.length;w++)u[w]=a[w*2],h[w]=a[w*2+1];const l=xe(u,s,"float32"),f=xe(h,s,"float32"),p=Ht(l,f);return l.dispose(),f.dispose(),p}else throw new Error(`Unsupported dtype in weight '${n}': ${r}`);i+=o*c}return xe(a,s,r)}async function _s(e,t,n){let r=new Uint8Array(t);for(;r.byteLength<n;){const{done:s,value:o}=await e.read();if(s&&o==null){const i=n-r.byteLength;throw new Error(`Reader is done but ${i} bytes are still expected`)}const a=new Uint8Array(r.length+o.byteLength);a.set(r,0),a.set(new Uint8Array(o),r.length),r=a}return r.buffer}async function Fh(e,t){const n={},r=e.getReader();let s=new ArrayBuffer(0);for(const o of t){const a=await Mh(o,async(u,h)=>(s=await _s(r,s,h),s.slice(u,h)));s=await _s(r,s,a);const i=s.slice(0,a);s=s.slice(a);const c=fc(o,i);if(n[o.name]=c,uc()==="webgpu"){const u=lc();"uploadToGPU"in u&&W(c.shape)>=R().get("WEBGPU_CPU_HANDOFF_SIZE_THRESHOLD")&&u.uploadToGPU(c.dataId)}}return n}function Bh(e){if(e===null)throw new Error(`Invalid input value: ${JSON.stringify(e)}`);let t=0;const n=[];e.forEach(o=>{if(t+=o.byteLength,n.push(o.byteLength===o.buffer.byteLength?o:new o.constructor(o)),!(o instanceof Float32Array||o instanceof Int32Array||o instanceof Uint8Array))throw new Error(`Unsupported TypedArray subtype: ${o.constructor.name}`)});const r=new Uint8Array(t);let s=0;return n.forEach(o=>{r.set(new Uint8Array(o.buffer),s),s+=o.byteLength}),r.buffer}const Pr=typeof Buffer<"u"&&(typeof Blob>"u"||typeof atob>"u"||typeof btoa>"u");function As(e){return Pr?Buffer.byteLength(e,"utf8"):new Blob([e]).size}function Rh(e){if(Pr)return Buffer.from(e).toString("base64");const t=new Uint8Array(e);let n="";for(let r=0,s=t.length;r<s;r++)n+=String.fromCharCode(t[r]);return btoa(n)}function Ch(e){if(Pr){const r=Buffer.from(e,"base64");return r.buffer.slice(r.byteOffset,r.byteOffset+r.byteLength)}const t=atob(e),n=new Uint8Array(t.length);for(let r=0;r<t.length;++r)n.set([t.charCodeAt(r)],r);return n.buffer}function Ph(e){return Tt.join(e)}function Ds(e){const t="/";for(e=e.trim();e.endsWith(t);)e=e.slice(0,e.length-1);const n=e.split(t);return n[n.length-1]}function dc(e,t){const n={modelTopology:e.modelTopology,format:e.format,generatedBy:e.generatedBy,convertedBy:e.convertedBy,weightsManifest:t};return e.signature!=null&&(n.signature=e.signature),e.userDefinedMetadata!=null&&(n.userDefinedMetadata=e.userDefinedMetadata),e.modelInitializer!=null&&(n.modelInitializer=e.modelInitializer),e.initializerSignature!=null&&(n.initializerSignature=e.initializerSignature),e.trainingConfig!=null&&(n.trainingConfig=e.trainingConfig),n}function pc(e,t,n){const r={modelTopology:e.modelTopology,format:e.format,generatedBy:e.generatedBy,convertedBy:e.convertedBy};if(e.trainingConfig!=null&&(r.trainingConfig=e.trainingConfig),e.weightsManifest!=null){if(!t)throw new Error("modelJSON has weightsManifest but weightSpecs is null");if(!n)throw new Error("modelJSON has weightsManifest but weightData is null");r.weightSpecs=t,r.weightData=n}return e.signature!=null&&(r.signature=e.signature),e.userDefinedMetadata!=null&&(r.userDefinedMetadata=e.userDefinedMetadata),e.modelInitializer!=null&&(r.modelInitializer=e.modelInitializer),e.initializerSignature!=null&&(r.initializerSignature=e.initializerSignature),r}async function Or(e,t){let n,r;return e.weightsManifest!=null&&([n,r]=await t(e.weightsManifest)),pc(e,n,r)}function an(e){if(e.modelTopology instanceof ArrayBuffer)throw new Error("Expected JSON model topology, received ArrayBuffer.");return{dateSaved:new Date,modelTopologyType:"JSON",modelTopologyBytes:e.modelTopology==null?0:As(JSON.stringify(e.modelTopology)),weightSpecsBytes:e.weightSpecs==null?0:As(JSON.stringify(e.weightSpecs)),weightDataBytes:e.weightData==null?0:new Tt(e.weightData).byteLength}}function fr(e){const t=[];for(const n of e)t.push(...n.weights);return t}function Oh(){const e=n=>{let r=n<<13,s=0;for(;!(r&8388608);)s-=8388608,r<<=1;return r&=-8388609,s+=947912704,r|s},t=new Uint32Array(2048);t[0]=0;for(let n=1;n<1024;n++)t[n]=e(n);for(let n=1024;n<2048;n++)t[n]=939524096+(n-1024<<13);return t}function Lh(){const e=new Uint32Array(64);e[0]=0,e[31]=1199570944,e[32]=2147483648,e[63]=3347054592;for(let t=1;t<31;t++)e[t]=t<<23;for(let t=33;t<63;t++)e[t]=2147483648+(t-32<<23);return e}function Wh(){const e=new Uint32Array(64);for(let t=0;t<64;t++)e[t]=1024;return e[0]=e[32]=0,e}function Uh(){const e=Oh(),t=Lh(),n=Wh();return r=>{const s=new ArrayBuffer(4*r.length),o=new Uint32Array(s);for(let a=0;a<r.length;a++){const i=r[a],c=e[n[i>>10]+(i&1023)]+t[i>>10];o[a]=c}return new Float32Array(s)}}/**
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
 */class J{constructor(){this.saveRouters=[],this.loadRouters=[]}static getInstance(){return J.instance==null&&(J.instance=new J),J.instance}static registerSaveRouter(t){J.getInstance().saveRouters.push(t)}static registerLoadRouter(t){J.getInstance().loadRouters.push(t)}static getSaveHandlers(t){return J.getHandlers(t,"save")}static getLoadHandlers(t,n){return J.getHandlers(t,"load",n)}static getHandlers(t,n,r){const s=[];return(n==="load"?J.getInstance().loadRouters:J.getInstance().saveRouters).forEach(a=>{const i=a(t,r);i!==null&&s.push(i)}),s}}const qh=e=>J.registerSaveRouter(e),Gh=e=>J.registerLoadRouter(e),zh=e=>J.getSaveHandlers(e),Kh=(e,t)=>J.getLoadHandlers(e,t);/**
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
 */const dr="tensorflowjs",pr=1,ne="models_store",Gt="model_info_store";function gc(){if(!R().getBool("IS_BROWSER"))throw new Error("Failed to obtain IndexedDB factory because the current environmentis not a web browser.");const e=typeof window>"u"?self:window,t=e.indexedDB||e.mozIndexedDB||e.webkitIndexedDB||e.msIndexedDB||e.shimIndexedDB;if(t==null)throw new Error("The current browser does not appear to support IndexedDB.");return t}function gr(e){const t=e.result;t.createObjectStore(ne,{keyPath:"modelPath"}),t.createObjectStore(Gt,{keyPath:"modelPath"})}class ae{constructor(t){if(this.indexedDB=gc(),t==null||!t)throw new Error("For IndexedDB, modelPath must not be null, undefined or empty.");this.modelPath=t}async save(t){if(t.modelTopology instanceof ArrayBuffer)throw new Error("BrowserLocalStorage.save() does not support saving model topology in binary formats yet.");return this.databaseAction(this.modelPath,t)}async load(){return this.databaseAction(this.modelPath)}databaseAction(t,n){return new Promise((r,s)=>{const o=this.indexedDB.open(dr,pr);o.onupgradeneeded=()=>gr(o),o.onsuccess=()=>{const a=o.result;if(n==null){const i=a.transaction(ne,"readonly"),u=i.objectStore(ne).get(this.modelPath);u.onsuccess=()=>{if(u.result==null)return a.close(),s(new Error(`Cannot find model with path '${this.modelPath}' in IndexedDB.`));r(u.result.modelArtifacts)},u.onerror=h=>(a.close(),s(u.error)),i.oncomplete=()=>a.close()}else{n.weightData=Tt.join(n.weightData);const i=an(n),c=a.transaction(Gt,"readwrite");let u=c.objectStore(Gt),h;try{h=u.put({modelPath:this.modelPath,modelArtifactsInfo:i})}catch(f){return s(f)}let l;h.onsuccess=()=>{l=a.transaction(ne,"readwrite");const f=l.objectStore(ne);let p;try{p=f.put({modelPath:this.modelPath,modelArtifacts:n,modelArtifactsInfo:i})}catch(w){return s(w)}p.onsuccess=()=>r({modelArtifactsInfo:i}),p.onerror=w=>{u=c.objectStore(Gt);const y=u.delete(this.modelPath);y.onsuccess=()=>(a.close(),s(p.error)),y.onerror=$=>(a.close(),s(p.error))}},h.onerror=f=>(a.close(),s(h.error)),c.oncomplete=()=>{l==null?a.close():l.oncomplete=()=>a.close()}}},o.onerror=a=>s(o.error)})}}ae.URL_SCHEME="indexeddb://";const mc=e=>R().getBool("IS_BROWSER")&&!Array.isArray(e)&&e.startsWith(ae.URL_SCHEME)?Vh(e.slice(ae.URL_SCHEME.length)):null;J.registerSaveRouter(mc);J.registerLoadRouter(mc);function Vh(e){return new ae(e)}function jh(e){return e.startsWith(ae.URL_SCHEME)?e.slice(ae.URL_SCHEME.length):e}class Hh{constructor(){this.indexedDB=gc()}async listModels(){return new Promise((t,n)=>{const r=this.indexedDB.open(dr,pr);r.onupgradeneeded=()=>gr(r),r.onsuccess=()=>{const s=r.result,o=s.transaction(Gt,"readonly"),i=o.objectStore(Gt).getAll();i.onsuccess=()=>{const c={};for(const u of i.result)c[u.modelPath]=u.modelArtifactsInfo;t(c)},i.onerror=c=>(s.close(),n(i.error)),o.oncomplete=()=>s.close()},r.onerror=s=>n(r.error)})}async removeModel(t){return t=jh(t),new Promise((n,r)=>{const s=this.indexedDB.open(dr,pr);s.onupgradeneeded=()=>gr(s),s.onsuccess=()=>{const o=s.result,a=o.transaction(Gt,"readwrite"),i=a.objectStore(Gt),c=i.get(t);let u;c.onsuccess=()=>{if(c.result==null)return o.close(),r(new Error(`Cannot find model with path '${t}' in IndexedDB.`));{const h=i.delete(t),l=()=>{u=o.transaction(ne,"readwrite");const p=u.objectStore(ne).delete(t);p.onsuccess=()=>n(c.result.modelArtifactsInfo),p.onerror=w=>r(c.error)};h.onsuccess=l,h.onerror=f=>(l(),o.close(),r(c.error))}},c.onerror=h=>(o.close(),r(c.error)),a.oncomplete=()=>{u==null?o.close():u.oncomplete=()=>o.close()}},s.onerror=o=>r(s.error)})}}/**
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
 */const Ft="/",ye="tensorflowjs_models",bc="info",Xh="model_topology",Zh="weight_specs",Jh="weight_data",Yh="model_metadata";function wc(e){return{info:[ye,e,bc].join(Ft),topology:[ye,e,Xh].join(Ft),weightSpecs:[ye,e,Zh].join(Ft),weightData:[ye,e,Jh].join(Ft),modelMetadata:[ye,e,Yh].join(Ft)}}function yc(e){for(const t of Object.values(e))window.localStorage.removeItem(t)}function Qh(e){const t=e.split(Ft);if(t.length<3)throw new Error(`Invalid key format: ${e}`);return t.slice(1,t.length-1).join(Ft)}function tf(e){return e.startsWith(ie.URL_SCHEME)?e.slice(ie.URL_SCHEME.length):e}class ie{constructor(t){if(!R().getBool("IS_BROWSER")||typeof window>"u"||typeof window.localStorage>"u")throw new Error("The current environment does not support local storage.");if(this.LS=window.localStorage,t==null||!t)throw new Error("For local storage, modelPath must not be null, undefined or empty.");this.modelPath=t,this.keys=wc(this.modelPath)}async save(t){if(t.modelTopology instanceof ArrayBuffer)throw new Error("BrowserLocalStorage.save() does not support saving model topology in binary formats yet.");{const n=JSON.stringify(t.modelTopology),r=JSON.stringify(t.weightSpecs),s=an(t),o=Tt.join(t.weightData);try{this.LS.setItem(this.keys.info,JSON.stringify(s)),this.LS.setItem(this.keys.topology,n),this.LS.setItem(this.keys.weightSpecs,r),this.LS.setItem(this.keys.weightData,Rh(o));const a={format:t.format,generatedBy:t.generatedBy,convertedBy:t.convertedBy,signature:t.signature!=null?t.signature:void 0,userDefinedMetadata:t.userDefinedMetadata!=null?t.userDefinedMetadata:void 0,modelInitializer:t.modelInitializer!=null?t.modelInitializer:void 0,initializerSignature:t.initializerSignature!=null?t.initializerSignature:void 0,trainingConfig:t.trainingConfig!=null?t.trainingConfig:void 0};return this.LS.setItem(this.keys.modelMetadata,JSON.stringify(a)),{modelArtifactsInfo:s}}catch{throw yc(this.keys),new Error(`Failed to save model '${this.modelPath}' to local storage: size quota being exceeded is a possible cause of this failure: modelTopologyBytes=${s.modelTopologyBytes}, weightSpecsBytes=${s.weightSpecsBytes}, weightDataBytes=${s.weightDataBytes}.`)}}}async load(){const t=JSON.parse(this.LS.getItem(this.keys.info));if(t==null)throw new Error(`In local storage, there is no model with name '${this.modelPath}'`);if(t.modelTopologyType!=="JSON")throw new Error("BrowserLocalStorage does not support loading non-JSON model topology yet.");const n={},r=JSON.parse(this.LS.getItem(this.keys.topology));if(r==null)throw new Error(`In local storage, the topology of model '${this.modelPath}' is missing.`);n.modelTopology=r;const s=JSON.parse(this.LS.getItem(this.keys.weightSpecs));if(s==null)throw new Error(`In local storage, the weight specs of model '${this.modelPath}' are missing.`);n.weightSpecs=s;const o=this.LS.getItem(this.keys.modelMetadata);if(o!=null){const i=JSON.parse(o);n.format=i.format,n.generatedBy=i.generatedBy,n.convertedBy=i.convertedBy,i.signature!=null&&(n.signature=i.signature),i.userDefinedMetadata!=null&&(n.userDefinedMetadata=i.userDefinedMetadata),i.modelInitializer!=null&&(n.modelInitializer=i.modelInitializer),i.initializerSignature!=null&&(n.initializerSignature=i.initializerSignature),i.trainingConfig!=null&&(n.trainingConfig=i.trainingConfig)}const a=this.LS.getItem(this.keys.weightData);if(a==null)throw new Error(`In local storage, the binary weight values of model '${this.modelPath}' are missing.`);return n.weightData=Ch(a),n}}ie.URL_SCHEME="localstorage://";const $c=e=>R().getBool("IS_BROWSER")&&!Array.isArray(e)&&e.startsWith(ie.URL_SCHEME)?ef(e.slice(ie.URL_SCHEME.length)):null;J.registerSaveRouter($c);J.registerLoadRouter($c);function ef(e){return new ie(e)}class nf{constructor(){g(R().getBool("IS_BROWSER"),()=>"Current environment is not a web browser"),g(typeof window>"u"||typeof window.localStorage<"u",()=>"Current browser does not appear to support localStorage"),this.LS=window.localStorage}async listModels(){const t={},n=ye+Ft,r=Ft+bc;for(let s=0;s<this.LS.length;++s){const o=this.LS.key(s);if(o.startsWith(n)&&o.endsWith(r)){const a=Qh(o);t[a]=JSON.parse(this.LS.getItem(o))}}return t}async removeModel(t){t=tf(t);const n=wc(t);if(this.LS.getItem(n.info)==null)throw new Error(`Cannot find model at path '${t}'`);const r=JSON.parse(this.LS.getItem(n.info));return yc(n),r}}/**
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
 */const ve="://";class ot{constructor(){this.managers={}}static getInstance(){return ot.instance==null&&(ot.instance=new ot),ot.instance}static registerManager(t,n){g(t!=null,()=>"scheme must not be undefined or null."),t.endsWith(ve)&&(t=t.slice(0,t.indexOf(ve))),g(t.length>0,()=>"scheme must not be an empty string.");const r=ot.getInstance();g(r.managers[t]==null,()=>`A model store manager is already registered for scheme '${t}'.`),r.managers[t]=n}static getManager(t){const n=ot.getInstance().managers[t];if(n==null)throw new Error(`Cannot find model manager for scheme '${t}'`);return n}static getSchemes(){return Object.keys(ot.getInstance().managers)}}function mn(e){if(e.indexOf(ve)===-1)throw new Error(`The url string provided does not contain a scheme. Supported schemes are: ${ot.getSchemes().join(",")}`);return{scheme:e.split(ve)[0],path:e.split(ve)[1]}}async function Ec(e,t,n=!1){g(e!==t,()=>`Old path and new path are the same: '${e}'`);const r=J.getLoadHandlers(e);g(r.length>0,()=>`Copying failed because no load handler is found for source URL ${e}.`),g(r.length<2,()=>`Copying failed because more than one (${r.length}) load handlers for source URL ${e}.`);const s=r[0],o=J.getSaveHandlers(t);g(o.length>0,()=>`Copying failed because no save handler is found for destination URL ${t}.`),g(o.length<2,()=>`Copying failed because more than one (${r.length}) save handlers for destination URL ${t}.`);const a=o[0],i=mn(e).scheme,c=mn(e).path,u=i===mn(e).scheme,h=await s.load();n&&u&&await ot.getManager(i).removeModel(c);const l=await a.save(h);return n&&!u&&await ot.getManager(i).removeModel(c),l.modelArtifactsInfo}async function rf(){const e=ot.getSchemes(),t={};for(const n of e){const r=await ot.getManager(n).listModels();for(const s in r){const o=n+ve+s;t[o]=r[s]}}return t}async function sf(e){const t=mn(e);return ot.getManager(t.scheme).removeModel(t.path)}async function of(e,t){return Ec(e,t,!1)}async function af(e,t){return Ec(e,t,!0)}/**
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
 */class cf{constructor(){this.messageName="setTimeoutCustom",this.functionRefs=[],this.handledMessageCount=0,this.hasEventListener=!1}fetch(t,n){return fetch(t,n)}now(){return performance.now()}encode(t,n){if(n!=="utf-8"&&n!=="utf8")throw new Error(`Browser's encoder only supports utf-8, but got ${n}`);return this.textEncoder==null&&(this.textEncoder=new TextEncoder),this.textEncoder.encode(t)}decode(t,n){return new TextDecoder(n).decode(t)}setTimeoutCustom(t,n){if(typeof window>"u"||!R().getBool("USE_SETTIMEOUTCUSTOM")){setTimeout(t,n);return}this.functionRefs.push(t),setTimeout(()=>{window.postMessage({name:this.messageName,index:this.functionRefs.length-1},"*")},n),this.hasEventListener||(this.hasEventListener=!0,window.addEventListener("message",r=>{if(r.source===window&&r.data.name===this.messageName){r.stopPropagation();const s=this.functionRefs[r.data.index];s(),this.handledMessageCount++,this.handledMessageCount===this.functionRefs.length&&(this.functionRefs=[],this.handledMessageCount=0)}},!0))}isTypedArray(t){return Gi(t)}}if(R().get("IS_BROWSER")){R().setPlatform("browser",new cf);try{ot.registerManager(ie.URL_SCHEME,new nf)}catch{}try{ot.registerManager(ae.URL_SCHEME,new Hh)}catch{}}/**
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
 */const uf={importFetch:()=>require("node-fetch")};let Zn;class lf{constructor(){this.util=require("util"),this.textEncoder=new this.util.TextEncoder}fetch(t,n){return R().global.fetch!=null?R().global.fetch(t,n):(Zn==null&&(Zn=uf.importFetch()),Zn(t,n))}now(){const t=process.hrtime();return t[0]*1e3+t[1]/1e6}encode(t,n){if(n!=="utf-8"&&n!=="utf8")throw new Error(`Node built-in encoder only supports utf-8, but got ${n}`);return this.textEncoder.encode(t)}decode(t,n){return t.length===0?"":new this.util.TextDecoder(n).decode(t)}isTypedArray(t){return this.util.types.isFloat32Array(t)||this.util.types.isInt32Array(t)||this.util.types.isUint8Array(t)||this.util.types.isUint8ClampedArray(t)}}R().get("IS_NODE")&&!R().get("IS_BROWSER")&&R().setPlatform("node",new lf);/**
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
 */function Bt(e,t="float32",n){return t=t||"float32",pt(e),new vn(e,t,n)}/**
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
 */function hf(e,t){const n=d(e,"x","cast");if(!Ks(t))throw new Error(`Failed to cast to unknown dtype ${t}`);if(t==="string"&&n.dtype!=="string"||t!=="string"&&n.dtype==="string")throw new Error("Only strings can be casted to strings");const r={x:n},s={dtype:t};return b.runKernel(Dr,r,s)}const H=m({cast_:hf});/**
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
 */function ff(e){const n={x:d(e,"x","clone","string_or_numeric")};return b.runKernel(Mr,n)}const se=m({clone_:ff});/**
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
 */function kc(e,t=!1){console.log(e.toString(t))}/**
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
 */sc();const df={buffer:Bt,cast:H,clone:se,print:kc};th(df);/**
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
 */function pf(e,t){let n=d(e,"a","add"),r=d(t,"b","add");[n,r]=Y(n,r);const s={a:n,b:r};return b.runKernel(Ar,s)}const F=m({add_:pf});/**
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
 */function gf(e,t){let n=d(e,"a","floorDiv"),r=d(t,"b","floorDiv");[n,r]=Y(n,r);const s={a:n,b:r};return b.runKernel(Qo,s)}const xc=m({floorDiv_:gf});/**
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
 */function mf(e,t){let n=d(e,"a","div"),r=d(t,"b","div");if([n,r]=Y(n,r),n.dtype==="int32"&&r.dtype==="int32")return xc(n,r);const s={a:n,b:r},o={};return b.runKernel(Uo,s,o)}const K=m({div_:mf});/**
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
 */function bf(e,t){let n=d(e,"a","mul"),r=d(t,"b","mul");[n,r]=Y(n,r);const s={a:n,b:r};return b.runKernel(Na,s)}const T=m({mul_:bf});/**
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
 */function wf(e){const t=d(e,"x","abs");if(t.dtype==="complex64"){const n={x:t};return b.runKernel(ko,n)}else{const n={x:t};return b.runKernel(Ys,n)}}const mt=m({abs_:wf});/**
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
 */function yf(e){const n={x:d(e,"x","acos")};return b.runKernel(Qs,n)}const $f=m({acos_:yf});/**
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
 */function Ef(e){const n={x:d(e,"x","acosh")};return b.runKernel(to,n)}const kf=m({acosh_:Ef});/**
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
 */function xf(e){g(Array.isArray(e),()=>"The argument passed to tf.addN() must be a list of tensors"),g(e.length>=1,()=>`Must pass at least one tensor to tf.addN(), but got ${e.length}`);const t=e.map((s,o)=>d(s,`tensors${o}`,"addN")),n=t[0];t.forEach(s=>{if(s.dtype!==n.dtype)throw new Error("All tensors passed to tf.addN() must have the same dtype")}),t.forEach(s=>{if(!Ct(s.shape,n.shape))throw new Error("All tensors passed to tf.addN() must have the same shape")});const r=t;return b.runKernel(eo,r)}const vf=m({addN_:xf});/**
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
 */function Sf(e,t=null,n=!1){const s={x:d(e,"x","all","bool")},o={axis:t,keepDims:n};return b.runKernel(no,s,o)}const If=m({all_:Sf});/**
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
 */function Tf(e,t=null,n=!1){const s={x:d(e,"x","any","bool")},o={axis:t,keepDims:n};return b.runKernel(ro,s,o)}const _f=m({any_:Tf});/**
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
 */function Af(e,t=0){const r={x:d(e,"x","argMax")},s={axis:t};return b.runKernel(so,r,s)}const Df=m({argMax_:Af});/**
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
 */function Nf(e,t=0){const r={x:d(e,"x","argMin")},s={axis:t};return b.runKernel(oo,r,s)}const Mf=m({argMin_:Nf});/**
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
 */function Ff(e){const n={x:d(e,"x","asin")};return b.runKernel(ao,n)}const Bf=m({asin_:Ff});/**
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
 */function Rf(e){const n={x:d(e,"x","asinh")};return b.runKernel(io,n)}const Cf=m({asinh_:Rf});/**
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
 */function Pf(e){const n={x:d(e,"x","atan")};return b.runKernel(co,n)}const Of=m({atan_:Pf});/**
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
 */function Lf(e,t){let n=d(e,"a","atan2"),r=d(t,"b","atan2");[n,r]=Y(n,r);const s={a:n,b:r};return b.runKernel(lo,s)}const Wf=m({atan2_:Lf});/**
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
 */function Uf(e){const n={x:d(e,"x","atanh")};return b.runKernel(uo,n)}const qf=m({atanh_:Uf});/**
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
 */function Gf(e,t,n,r,s="NHWC",o){const a=e[3],i=[...t,a],c=Ic(s);return cn(e,i,n,o,r,null,null,c)}function vc(e,t,n,r,s,o,a="channelsLast"){const[i,c]=je(t);let u;if(a==="channelsLast")u=[i,c,e[3],e[3]];else if(a==="channelsFirst")u=[i,c,e[1],e[1]];else throw new Error(`Unknown dataFormat ${a}`);return cn(e,u,n,r,s,o,!1,a)}function zf(e,t,n,r,s,o,a="NDHWC"){const[i,c,u]=mr(t);let h,l;if(a==="NDHWC")l="channelsLast",h=[i,c,u,e[4],e[4]];else if(a==="NCDHW")l="channelsFirst",h=[i,c,u,e[1],e[1]];else throw new Error(`Unknown dataFormat ${a}`);return Sc(e,h,n,r,s,!1,l,o)}function cn(e,t,n,r,s,o,a=!1,i="channelsLast"){let[c,u,h,l]=[-1,-1,-1,-1];if(i==="channelsLast")[c,u,h,l]=e;else if(i==="channelsFirst")[c,l,u,h]=e;else throw new Error(`Unknown dataFormat ${i}`);const[f,p,,w]=t,[y,$]=je(n),[x,N]=je(r),k=Se(f,x),v=Se(p,N),{padInfo:I,outHeight:_,outWidth:M}=jf(s,u,h,y,$,k,v,o,i),A=a?w*l:w;let D;return i==="channelsFirst"?D=[c,A,_,M]:i==="channelsLast"&&(D=[c,_,M,A]),{batchSize:c,dataFormat:i,inHeight:u,inWidth:h,inChannels:l,outHeight:_,outWidth:M,outChannels:A,padInfo:I,strideHeight:y,strideWidth:$,filterHeight:f,filterWidth:p,effectiveFilterHeight:k,effectiveFilterWidth:v,dilationHeight:x,dilationWidth:N,inShape:e,outShape:D,filterShape:t}}function Sc(e,t,n,r,s,o=!1,a="channelsLast",i){let[c,u,h,l,f]=[-1,-1,-1,-1,-1];if(a==="channelsLast")[c,u,h,l,f]=e;else if(a==="channelsFirst")[c,f,u,h,l]=e;else throw new Error(`Unknown dataFormat ${a}`);const[p,w,y,,$]=t,[x,N,k]=mr(n),[v,I,_]=mr(r),M=Se(p,v),A=Se(w,I),D=Se(y,_),{padInfo:C,outDepth:B,outHeight:O,outWidth:U}=Hf(s,u,h,l,x,N,k,M,A,D,i),X=o?$*f:$;let nt;return a==="channelsFirst"?nt=[c,X,B,O,U]:a==="channelsLast"&&(nt=[c,B,O,U,X]),{batchSize:c,dataFormat:a,inDepth:u,inHeight:h,inWidth:l,inChannels:f,outDepth:B,outHeight:O,outWidth:U,outChannels:X,padInfo:C,strideDepth:x,strideHeight:N,strideWidth:k,filterDepth:p,filterHeight:w,filterWidth:y,effectiveFilterDepth:M,effectiveFilterHeight:A,effectiveFilterWidth:D,dilationDepth:v,dilationHeight:I,dilationWidth:_,inShape:e,outShape:nt,filterShape:t}}function Kf(e,t,n,r,s){r==null&&(r=Lr(e,t,n));const o=e[0],a=e[1],i=He((o-t+2*r)/n+1,s),c=He((a-t+2*r)/n+1,s);return[i,c]}function Vf(e,t,n,r,s,o){s==null&&(s=Lr(e,t[0],r[0]));const a=[0,0,0,n];for(let i=0;i<3;i++)e[i]+2*s>=t[i]&&(a[i]=He((e[i]-t[i]+2*s)/r[i]+1,o));return a}function Lr(e,t,n,r=1){const s=Se(t,r);return Math.floor((e[0]*(n-1)-n+s)/2)}function je(e){return typeof e=="number"?[e,e,e]:e.length===2?[e[0],e[1],1]:e}function mr(e){return typeof e=="number"?[e,e,e]:e}function Se(e,t){return t<=1?e:e+(e-1)*(t-1)}function jf(e,t,n,r,s,o,a,i,c){let u,h,l;if(typeof e=="number"){u={top:e,bottom:e,left:e,right:e,type:e===0?"VALID":"NUMBER"};const p=Kf([t,n],o,r,e,i);h=p[0],l=p[1]}else if(e==="same"){h=Math.ceil(t/r),l=Math.ceil(n/s);const f=Math.max(0,(h-1)*r+o-t),p=Math.max(0,(l-1)*s+a-n),w=Math.floor(f/2),y=f-w,$=Math.floor(p/2),x=p-$;u={top:w,bottom:y,left:$,right:x,type:"SAME"}}else if(e==="valid")u={top:0,bottom:0,left:0,right:0,type:"VALID"},h=Math.ceil((t-o+1)/r),l=Math.ceil((n-a+1)/s);else if(typeof e=="object"){const f=c==="channelsLast"?e[1][0]:e[2][0],p=c==="channelsLast"?e[1][1]:e[2][1],w=c==="channelsLast"?e[2][0]:e[3][0],y=c==="channelsLast"?e[2][1]:e[3][1];u={top:f,bottom:p,left:w,right:y,type:f===0&&p===0&&w===0&&y===0?"VALID":"EXPLICIT"},h=He((t-o+f+p)/r+1,i),l=He((n-a+w+y)/s+1,i)}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:u,outHeight:h,outWidth:l}}function Hf(e,t,n,r,s,o,a,i,c,u,h){let l,f,p,w;if(e==="valid"&&(e=0),typeof e=="number"){l={top:e,bottom:e,left:e,right:e,front:e,back:e,type:e===0?"VALID":"NUMBER"};const $=Vf([t,n,r,1],[i,c,u],1,[s,o,a],e,h);f=$[0],p=$[1],w=$[2]}else if(e==="same"){f=Math.ceil(t/s),p=Math.ceil(n/o),w=Math.ceil(r/a);const y=(f-1)*s+i-t,$=(p-1)*o+c-n,x=(w-1)*a+u-r,N=Math.floor(y/2),k=y-N,v=Math.floor($/2),I=$-v,_=Math.floor(x/2),M=x-_;l={top:v,bottom:I,left:_,right:M,front:N,back:k,type:"SAME"}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:l,outDepth:f,outHeight:p,outWidth:w}}function He(e,t){if(!t)return Math.trunc(e);switch(t){case"round":return Math.round(e);case"ceil":return Math.ceil(e);case"floor":return Math.floor(e);default:throw new Error(`Unknown roundingMode ${t}`)}}function Xe(e){const[t,n,r]=je(e);return t===1&&n===1&&r===1}function Pt(e,t){return Xe(e)||Xe(t)}function ce(e){return je(e).every(t=>t>0)}function Ic(e){if(e==="NHWC")return"channelsLast";if(e==="NCHW")return"channelsFirst";throw new Error(`Unknown dataFormat ${e}`)}function xt(e,t,n){if(n!=null){if(typeof t=="string")throw Error(`Error in ${e}: pad must be an integer when using dimRoundingMode ${n} but got pad ${t}.`);if(typeof t=="number")g(_e(t),()=>`Error in ${e}: pad must be an integer when using dimRoundingMode ${n} but got pad ${t}.`);else if(typeof t=="object")t.forEach(r=>{r.forEach(s=>{g(_e(s),()=>`Error in ${e}: pad must be an integer when using dimRoundingMode ${n} but got pad ${s}.`)})});else throw Error(`Error in ${e}: Unknown padding parameter: ${t}`)}}/**
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
 */function Xf(e,t){const r={x:d(e,"x","reshape","string_or_numeric")},s={shape:t};return b.runKernel(Ja,r,s)}const E=m({reshape_:Xf});/**
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
 */function Zf(e,t,n,r,s){const o=d(e,"x","avgPool","float32"),a=1;g(Pt(n,a),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`);let i=o,c=!1;o.rank===3&&(c=!0,i=E(o,[1,o.shape[0],o.shape[1],o.shape[2]])),g(i.rank===4,()=>`Error in avgPool: x must be rank 4 but got rank ${i.rank}.`),xt("avgPool",r,s);const u={x:i},h={filterSize:t,strides:n,pad:r,dimRoundingMode:s};let l=b.runKernel(ho,u,h);return l=H(l,o.dtype),c?E(l,[l.shape[1],l.shape[2],l.shape[3]]):l}const Tc=m({avgPool_:Zf});/**
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
 */function Jf(e,t,n,r,s,o="NDHWC"){const a=d(e,"x","avgPool3d","float32");let i=a,c=!1;a.rank===4&&(c=!0,i=E(a,[1,a.shape[0],a.shape[1],a.shape[2],a.shape[3]])),g(i.rank===5,()=>`Error in avgPool3d: x must be rank 5 but got rank ${i.rank}.`),g(o==="NDHWC",()=>`Error in avgPool3d: Only NDHWC is currently supported, but got dataFormat of ${o}`),g(typeof n=="number"&&n>0||Array.isArray(n)&&n[0]>0&&n[1]>0&&n[2]>0,()=>`Error in avgPool3d: Stride must be > 0, but got '${n}'`),xt("avgPool3d",r,s);const u={x:i},h={filterSize:t,strides:n,pad:r,dimRoundingMode:s,dataFormat:o};let l=b.runKernel(fo,u,h);return l=H(l,i.dtype),c?E(l,[l.shape[1],l.shape[2],l.shape[3],l.shape[4]]):l}const Yf=m({avgPool3d_:Jf});/**
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
 */function Qf(e,t=0){g(e.length>=1,()=>"Pass at least one tensor to concat");const n=Ve(e,"tensors","concat","string_or_numeric");if(n[0].dtype==="complex64"&&n.forEach(o=>{if(o.dtype!=="complex64")throw new Error(`Cannot concatenate complex64 tensors with a tensor
          with dtype ${o.dtype}. `)}),n.length===1)return se(n[0]);const r=n,s={axis:t};return b.runKernel(xo,r,s)}const dt=m({concat_:Qf});/**
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
 */function td(e,t,n=!1,r=!1){let s=d(e,"a","matMul"),o=d(t,"b","matMul");[s,o]=Y(s,o);const a={a:s,b:o},i={transposeA:n,transposeB:r};return b.runKernel(po,a,i)}const L=m({matMul_:td});/**
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
 */function ed(e){const n={x:d(e,"x","sigmoid","float32")};return b.runKernel(di,n)}const Ie=m({sigmoid_:ed});/**
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
 */function nd(e,t,n){const r=d(e,"x","slice","string_or_numeric");if(r.rank===0)throw new Error("Slicing scalar is not possible");const s={x:r},o={begin:t,size:n};return b.runKernel(ui,s,o)}const Z=m({slice_:nd});/**
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
 */function rd(e){const n={x:d(e,"x","tanh","float32")};return b.runKernel(Fi,n)}const br=m({tanh_:rd});/**
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
 */function sd(e,t,n,r,s,o){const a=d(e,"forgetBias","basicLSTMCell"),i=d(t,"lstmKernel","basicLSTMCell"),c=d(n,"lstmBias","basicLSTMCell"),u=d(r,"data","basicLSTMCell"),h=d(s,"c","basicLSTMCell"),l=d(o,"h","basicLSTMCell"),f=dt([u,l],1),p=L(f,i),w=F(p,c),y=w.shape[0],$=w.shape[1]/4,x=[y,$],N=Z(w,[0,0],x),k=Z(w,[0,$],x),v=Z(w,[0,$*2],x),I=Z(w,[0,$*3],x),_=F(T(Ie(N),br(k)),T(h,Ie(F(a,v)))),M=T(br(_),Ie(I));return[_,M]}const od=m({basicLSTMCell_:sd});/**
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
 */function ad(e,t,n){const r=d(e,"x","batchToSpaceND"),s=t.reduce((i,c)=>i*c);g(r.rank>=1+t.length,()=>`input rank is ${r.rank} but should be > than blockShape.length ${t.length}`),g(n.length===t.length,()=>`crops.length is ${n.length} but should be equal to blockShape.length  ${t.length}`),g(r.shape[0]%s===0,()=>`input tensor batch is ${r.shape[0]} but is not divisible by the product of the elements of blockShape ${t.join(" * ")} === ${s}`);const o={x:r},a={blockShape:t,crops:n};return b.runKernel(go,o,a)}const _c=m({batchToSpaceND_:ad});function id(e){let t;return e.rank===0||e.rank===1?t=E(e,[1,1,1,e.size]):e.rank===2?t=E(e,[1,1,e.shape[0],e.shape[1]]):e.rank===3?t=E(e,[1,e.shape[0],e.shape[1],e.shape[2]]):t=e,t}/**
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
 */function cd(e,t,n,r,s,o){o==null&&(o=.001);const a=d(e,"x","batchNorm"),i=d(t,"mean","batchNorm"),c=d(n,"variance","batchNorm");let u;s!=null&&(u=d(s,"scale","batchNorm"));let h;r!=null&&(h=d(r,"offset","batchNorm")),g(i.rank===c.rank,()=>"Batch normalization gradient requires mean and variance to have equal ranks."),g(h==null||i.rank===h.rank,()=>"Batch normalization gradient requires mean and offset to have equal ranks."),g(u==null||i.rank===u.rank,()=>"Batch normalization gradient requires mean and scale to have equal ranks.");const f={x:id(a),scale:u,offset:h,mean:i,variance:c},p={varianceEpsilon:o},w=b.runKernel(ta,f,p);return E(w,a.shape)}const Bn=m({batchNorm_:cd});function ud(e,t,n,r,s,o){const a=d(e,"x","batchNorm"),i=d(t,"mean","batchNorm"),c=d(n,"variance","batchNorm");let u;s!=null&&(u=d(s,"scale","batchNorm"));let h;return r!=null&&(h=d(r,"offset","batchNorm")),g(a.rank===2,()=>`Error in batchNorm2D: x must be rank 2 but got rank ${a.rank}.`),g(i.rank===2||i.rank===1,()=>`Error in batchNorm2D: mean must be rank 2 or rank 1 but got rank ${i.rank}.`),g(c.rank===2||c.rank===1,()=>`Error in batchNorm2D: variance must be rank 2 or rank 1 but got rank ${c.rank}.`),u!=null&&g(u.rank===2||u.rank===1,()=>`Error in batchNorm2D: scale must be rank 2 or rank 1 but got rank ${u.rank}.`),h!=null&&g(h.rank===2||h.rank===1,()=>`Error in batchNorm2D: offset must be rank 2 or rank 1 but got rank ${h.rank}.`),Bn(a,i,c,h,u,o)}const ld=m({batchNorm2d_:ud});function hd(e,t,n,r,s,o){const a=d(e,"x","batchNorm"),i=d(t,"mean","batchNorm"),c=d(n,"variance","batchNorm");let u;s!=null&&(u=d(s,"scale","batchNorm"));let h;return r!=null&&(h=d(r,"offset","batchNorm")),g(a.rank===3,()=>`Error in batchNorm3D: x must be rank 3 but got rank ${a.rank}.`),g(i.rank===3||i.rank===1,()=>`Error in batchNorm3D: mean must be rank 3 or rank 1 but got rank ${i.rank}.`),g(c.rank===3||c.rank===1,()=>`Error in batchNorm3D: variance must be rank 3 or rank 1 but got rank ${c.rank}.`),u!=null&&g(u.rank===3||u.rank===1,()=>`Error in batchNorm3D: scale must be rank 3 or rank 1 but got rank ${u.rank}.`),h!=null&&g(h.rank===3||h.rank===1,()=>`Error in batchNorm3D: offset must be rank 3 or rank 1 but got rank ${h.rank}.`),Bn(a,i,c,h,u,o)}const fd=m({batchNorm3d_:hd});function dd(e,t,n,r,s,o){const a=d(e,"x","batchNorm"),i=d(t,"mean","batchNorm"),c=d(n,"variance","batchNorm");let u;s!=null&&(u=d(s,"scale","batchNorm"));let h;return r!=null&&(h=d(r,"offset","batchNorm")),g(a.rank===4,()=>`Error in batchNorm4D: x must be rank 4 but got rank ${a.rank}.`),g(i.rank===4||i.rank===1,()=>`Error in batchNorm4D: mean must be rank 4 or rank 1 but got rank ${i.rank}.`),g(c.rank===4||c.rank===1,()=>`Error in batchNorm4D: variance must be rank 4 or rank 1 but got rank ${c.rank}.`),u!=null&&g(u.rank===4||u.rank===1,()=>`Error in batchNorm4D: scale must be rank 4 or rank 1 but got rank ${u.rank}.`),h!=null&&g(h.rank===4||h.rank===1,()=>`Error in batchNorm4D: offset must be rank 4 or rank 1 but got rank ${h.rank}.`),Bn(a,i,c,h,u,o)}const pd=m({batchNorm4d_:dd});/**
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
 */function gd(e,t,n){const r=d(e,"x","bincount"),s=d(t,"weights","bincount");g(r.dtype==="int32",()=>`Error in bincount: input dtype must be int32, but got ${r.dtype}`),g(n>=0,()=>`size must be non-negative, but got ${n}.`),g(s.size===r.size||s.size===0,()=>`Error in bincount: weights must have the same size as input or0-length, but got input shape: ${r.shape}, weights shape: ${s.shape}.`);const o={x:r,weights:s},a={size:n};return b.runKernel(mo,o,a)}const Ac=m({bincount_:gd});/**
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
 */function md(e,t){const n=d(e,"x","bitwiseAnd"),r=d(t,"y","bitwiseAnd");if(!Ct(n.shape,r.shape))throw new Error(`BitwiseAnd: Tensors must have the same shape. x: ${n.shape}, y: ${r.shape}`);if(n.dtype!=="int32"||r.dtype!=="int32")throw new Error(`BitwiseAnd: Only supports 'int32' values in tensor, found type of x: ${n.dtype} and type of y: ${r.dtype}`);const s={a:n,b:r};return b.runKernel(bo,s)}const bd=m({bitwiseAnd_:md});/**
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
 */function wd(e,t){const n=d(e,"s0","broadcastArgs","int32"),r=d(t,"s1","broadcastArgs","int32");if(n.rank!==1)throw new Error(`broadcastArgs(): first input must be a vector (rank=1). Has rank ${n.rank}`);if(r.rank!==1)throw new Error(`broadcastArgs(): second input must be a vector (rank=1). Has rank ${r.rank}`);const s={s0:n,s1:r};return b.runKernel(wo,s)}const yd=m({broadcastArgs_:wd});/**
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
 */function $d(e,t){let n=d(e,"broadcastTo","x");const r=n.shape;if(pt(t),t.length<n.rank)throw new Error(`broadcastTo(): shape.length=${t.length} < input.rank=${n.rank}.`);if(t.length>n.rank){const u=n.shape.slice();for(;u.length<t.length;)u.unshift(1);n=E(n,u)}const s=n.shape,o=Array.from(t);for(let u=t.length-1;u>=0;u--)if(s[u]===t[u])o[u]=1;else if(n.shape[u]!==1)throw new Error(`broadcastTo(): [${r}] cannot be broadcast to [${t}].`);if(o.map((u,h)=>u>1?h:-1).filter(u=>u>=0).length===0)return se(n);const i={x:n},c={reps:o};return b.runKernel(Fr,i,c)}const bn=m({broadcastTo_:$d});/**
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
 */function Ed(e){const n={x:d(e,"x","ceil","float32")};return b.runKernel(yo,n)}const kd=m({ceil_:Ed});/**
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
 */function un(e,t,n){pt(e),n=n||rn(t);const r={shape:e,value:t,dtype:n};return b.runKernel(Zo,{},r)}/**
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
 */function xd(e,t,n){const r=d(e,"x","clipByValue");if(g(t<=n,()=>`Error in clip: min (${t}) must be less than or equal to max (${n}).`),t===n)return un(r.shape,t,r.dtype);const s={x:r},o={clipValueMin:t,clipValueMax:n};return b.runKernel($o,s,o)}const vd=m({clipByValue_:xd});function Sd(e){return dt(e,0)}const Id=m({concat1d_:Sd});function Td(e,t){return dt(e,t)}const _d=m({concat2d_:Td});function Ad(e,t){return dt(e,t)}const Dd=m({concat3d_:Ad});function Nd(e,t){return dt(e,t)}const Md=m({concat4d_:Nd});/**
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
 */function Fd(e,t,n,r,s="NHWC",o=[1,1],a){const i=d(e,"x","conv2d","float32"),c=d(t,"filter","conv2d","float32");let u=i,h=!1;i.rank===3&&(h=!0,u=E(i,[1,i.shape[0],i.shape[1],i.shape[2]])),g(u.rank===4,()=>`Error in conv2d: input must be rank 4, but got rank ${u.rank}.`),g(c.rank===4,()=>`Error in conv2d: filter must be rank 4, but got rank ${c.rank}.`),xt("conv2d",r,a);const l=s==="NHWC"?u.shape[3]:u.shape[1];g(l===c.shape[2],()=>`Error in conv2d: depth of input (${l}) must match input depth for filter ${c.shape[2]}.`),g(Pt(n,o),()=>`Error in conv2D: Either strides or dilations must be 1. Got strides ${n} and dilations '${o}'`),g(ce(o),()=>"Error in conv2D: Dilated rates should be larger than 0."),g(ce(n),()=>"Error in conv2D: Strides should be larger than 0.");const f={x:u,filter:c},p={strides:n,pad:r,dataFormat:s,dilations:o,dimRoundingMode:a},w=b.runKernel(vo,f,p);return h?E(w,[w.shape[1],w.shape[2],w.shape[3]]):w}const Rn=m({conv2d_:Fd});function Bd(e,t,n,r,s="NWC",o=1,a){const i=d(e,"x","conv1d"),c=d(t,"filter","conv1d");let u=i,h=!1;i.rank===2&&(h=!0,u=E(i,[1,i.shape[0],i.shape[1]])),g(u.rank===3,()=>`Error in conv1d: input must be rank 3, but got rank ${u.rank}.`),g(c.rank===3,()=>`Error in conv1d: filter must be rank 3, but got rank ${c.rank}.`),xt("conv1d",r,a),g(u.shape[2]===c.shape[1],()=>`Error in conv1d: depth of input (${u.shape[2]}) must match input depth for filter ${c.shape[1]}.`),g(Pt(n,o),()=>`Error in conv1D: Either stride or dilation must be 1. Got stride ${n} and dilation '${o}'`),g(ce(o),()=>"Error in conv1D: Dilated rates should be larger than 0."),g(ce(n),()=>"Error in conv1D: Stride should be larger than 0."),g(s==="NWC",()=>`Error in conv1d: got dataFormat of ${s} but only NWC is currently supported.`);const l=E(c,[1,c.shape[0],c.shape[1],c.shape[2]]),f=E(u,[u.shape[0],1,u.shape[1],u.shape[2]]),$=Rn(f,l,[1,n],r,"NHWC",[1,o],a);return h?E($,[$.shape[2],$.shape[3]]):E($,[$.shape[0],$.shape[2],$.shape[3]])}const Rd=m({conv1d_:Bd});/**
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
 */function Cd(e,t,n,r,s,o="NHWC",a){g(e.length===t.rank,()=>`Length of inShape (${e.length}) and rank of dy (${t.rank}) must match`);let i=e,c=t,u=!1;t.rank===3&&(u=!0,c=E(t,[1,t.shape[0],t.shape[1],t.shape[2]]),i=[1,e[0],e[1],e[2]]),g(i.length===4,()=>`Error in conv2dDerInput: inShape must be length 4, but got length ${i.length}.`),g(c.rank===4,()=>`Error in conv2dDerInput: dy must be rank 4, but got rank ${c.rank}`),g(n.rank===4,()=>`Error in conv2dDerInput: filter must be rank 4, but got rank ${n.rank}`);const h=o==="NHWC"?i[3]:i[1],l=o==="NHWC"?c.shape[3]:c.shape[1];g(h===n.shape[2],()=>`Error in conv2dDerInput: depth of input (${h}) must match input depth for filter ${n.shape[2]}.`),g(l===n.shape[3],()=>`Error in conv2dDerInput: depth of output (${l}) must match output depth for filter ${n.shape[3]}.`),xt("conv2dDerInput",s,a);const f={dy:c,filter:n},p={strides:r,pad:s,dataFormat:o,dimRoundingMode:a,inputShape:i},w=b.runKernel(Io,f,p);return u?E(w,[w.shape[1],w.shape[2],w.shape[3]]):w}const Dc=m({conv2DBackpropInput_:Cd});function Pd(e,t,n,r,s,o){const a=d(e,"x","conv2dTranspose"),i=d(t,"filter","conv2dTranspose");return Dc(n,a,i,r,s,"NHWC",o)}const Od=m({conv2dTranspose_:Pd});/**
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
 */function Ld(e,t,n,r,s="NDHWC",o=[1,1,1]){const a=d(e,"x","conv3d"),i=d(t,"filter","conv3d");let c=a,u=!1;a.rank===4&&(u=!0,c=E(a,[1,a.shape[0],a.shape[1],a.shape[2],a.shape[3]])),g(c.rank===5,()=>`Error in conv3d: input must be rank 5, but got rank ${c.rank}.`),g(i.rank===5,()=>`Error in conv3d: filter must be rank 5, but got rank ${i.rank}.`),g(c.shape[4]===i.shape[3],()=>`Error in conv3d: depth of input (${c.shape[4]}) must match input depth for filter ${i.shape[3]}.`),g(Pt(n,o),()=>`Error in conv3D: Either strides or dilations must be 1. Got strides ${n} and dilations '${o}'`),g(s==="NDHWC",()=>`Error in conv3d: got dataFormat of ${s} but only NDHWC is currently supported.`),g(ce(o),()=>"Error in conv3D: Dilated rates should be larger than 0."),g(ce(n),()=>"Error in conv3D: Strides should be larger than 0.");const h={x:c,filter:i},l={strides:n,pad:r,dataFormat:s,dilations:o},f=b.runKernel(To,h,l);return u?E(f,[f.shape[1],f.shape[2],f.shape[3],f.shape[4]]):f}const Wd=m({conv3d_:Ld});/**
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
 */function Ud(e,t,n,r,s){g(e.length===t.rank,()=>`Length of inShape (${e.length}) and rank of dy (${t.rank}) must match`);let o=e,a=t,i=!1;t.rank===4&&(i=!0,a=E(t,[1,t.shape[0],t.shape[1],t.shape[2],t.shape[3]]),o=[1,e[0],e[1],e[2],e[3]]);const c=o[4],u=a.shape[4];g(o.length===5,()=>`Error in conv3dDerInput: inShape must be length 5, but got length ${o.length}.`),g(a.rank===5,()=>`Error in conv3dDerInput: dy must be rank 5, but got rank ${a.rank}`),g(n.rank===5,()=>`Error in conv3dDerInput: filter must be rank 5, but got rank ${n.rank}`),g(c===n.shape[3],()=>`Error in conv3dDerInput: depth of input (${c}) must match input depth for filter ${n.shape[3]}.`),g(u===n.shape[4],()=>`Error in conv3dDerInput: depth of output (${u}) must match output depth for filter ${n.shape[4]}.`);const h={dy:a,filter:n},l={pad:s,strides:r,inputShape:o},f=b.runKernel(_o,h,l);return i?E(f,[f.shape[1],f.shape[2],f.shape[3],f.shape[4]]):f}const qd=m({conv3DBackpropInput_:Ud});function Gd(e,t,n,r,s){const o=d(e,"x","conv3dTranspose"),a=d(t,"filter","conv3dTranspose");return qd(n,o,a,r,s)}const zd=m({conv3dTranspose_:Gd});/**
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
 */function Kd(e){const n={x:d(e,"x","cos","float32")};return b.runKernel(Ao,n)}const Vd=m({cos_:Kd});/**
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
 */function jd(e){const n={x:d(e,"x","cosh","float32")};return b.runKernel(Do,n)}const Hd=m({cosh_:jd});/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function Xd(e,t=0,n=!1,r=!1){const o={x:d(e,"x","cumprod")},a={axis:t,exclusive:n,reverse:r};return b.runKernel(No,o,a)}const Zd=m({cumprod_:Xd});/**
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
 */function Jd(e,t=0,n=!1,r=!1){const o={x:d(e,"x","cumsum")},a={axis:t,exclusive:n,reverse:r};return b.runKernel(Mo,o,a)}const Yd=m({cumsum_:Jd});/**
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
 */function Qd(e,t,n,r=!1){const s=d(e,"x","denseBincount"),o=d(t,"weights","denseBincount");g(s.dtype==="int32",()=>`Error in denseBincount: input dtype must be int32, but got ${s.dtype}`),g(s.rank<=2,()=>`Error in denseBincount: input must be at most rank 2, but got rank ${s.rank}.`),g(n>=0,()=>`size must be non-negative, but got ${n}.`),g(o.size===s.size||o.size===0,()=>`Error in denseBincount: weights must have the same shape as x or 0-length, but got x shape: ${s.shape}, weights shape: ${o.shape}.`);const a={x:s,weights:o},i={size:n,binaryOutput:r};return b.runKernel(Bo,a,i)}const tp=m({denseBincount_:Qd});/**
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
 */function ep(e,t,n="NHWC"){const r=d(e,"x","depthToSpace","float32"),s=n==="NHWC"?r.shape[1]:r.shape[2],o=n==="NHWC"?r.shape[2]:r.shape[3],a=n==="NHWC"?r.shape[3]:r.shape[1];g(t>1,()=>`blockSize should be > 1 for depthToSpace, but was: ${t}`),g(s*t>=0,()=>`Negative dimension size caused by overflow when multiplying
    ${s} and ${t}  for depthToSpace with input shape
    ${r.shape}`),g(o*t>=0,()=>`Negative dimension size caused by overflow when multiplying
    ${o} and ${t} for depthToSpace with input shape
        ${r.shape}`),g(a%(t*t)===0,()=>`Dimension size must be evenly divisible by ${t*t} but is ${a} for depthToSpace with input shape ${r.shape}`);const i={x:r},c={blockSize:t,dataFormat:n};return b.runKernel(Ro,i,c)}const np=m({depthToSpace_:ep});/**
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
 */function rp(e,t,n,r,s="NHWC",o=[1,1],a){const i=d(e,"x","depthwiseConv2d","float32"),c=d(t,"filter","depthwiseConv2d","float32");let u=i,h=!1;i.rank===3&&(h=!0,u=E(i,[1,i.shape[0],i.shape[1],i.shape[2]])),g(u.rank===4,()=>`Error in depthwiseConv2d: input must be rank 4, but got rank ${u.rank}.`),g(c.rank===4,()=>`Error in depthwiseConv2d: filter must be rank 4, but got rank ${c.rank}.`);const l=s==="NHWC"?u.shape[3]:u.shape[1];g(l===c.shape[2],()=>`Error in depthwiseConv2d: number of input channels (${l}) must match the inChannels dimension in filter ${c.shape[2]}.`),xt("depthwiseConv2d",r,a);const f={x:u,filter:c},p={strides:n,pad:r,dataFormat:s,dilations:o,dimRoundingMode:a},w=b.runKernel(Co,f,p);return h?E(w,[w.shape[1],w.shape[2],w.shape[3]]):w}const Wr=m({depthwiseConv2d_:rp});/**
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
 */function sp(e){const n={x:d(e,"x","diag")};return b.runKernel(Lo,n)}const op=m({diag_:sp});/**
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
 */function ap(e,t,n,r,s=[1,1],o="NHWC"){const a=d(e,"x","dilation2d"),i=d(t,"filter","dilation2d");g(a.rank===3||a.rank===4,()=>`Error in dilation2d: input must be rank 3 or 4, but got rank ${a.rank}.`),g(i.rank===3,()=>`Error in dilation2d: filter must be rank 3, but got rank ${i.rank}.`),g(o==="NHWC",()=>`Error in dilation2d: Only NHWC is currently supported, but got dataFormat of ${o}`);let c=a,u=!1;a.rank===3&&(c=E(a,[1,a.shape[0],a.shape[1],a.shape[2]]),u=!0),g(c.shape[3]===i.shape[2],()=>`Error in dilation2d:  input and filter must have the same depth: ${c.shape[3]} vs ${i.shape[2]}`);const h={x:c,filter:i},l={strides:n,pad:r,dilations:s},f=b.runKernel(Wo,h,l);return u?E(f,[f.shape[1],f.shape[2],f.shape[3]]):f}const ip=m({dilation2d_:ap});/**
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
 */function Nc(e,t){const n=e.length,r=[];for(let s=0;s<n;s++){const o=n-1-s,a=e[o]||1;(t[t.length-1-s]||1)>1&&a===1&&r.unshift(o)}return r}function Ur(e,t){const n=[];for(let r=0;r<t.length;r++){const s=e[e.length-r-1],o=t.length-r-1,a=t[o];(s==null||s===1&&a>1)&&n.unshift(o)}return n}function et(e,t){const n=Math.max(e.length,t.length),r=new Array(n);for(let s=0;s<n;s++){let o=e[e.length-s-1];o==null&&(o=1);let a=t[t.length-s-1];if(a==null&&(a=1),o===1)r[n-s-1]=a;else if(a===1)r[n-s-1]=o;else if(o!==a){const i=`Operands could not be broadcast together with shapes ${e} and ${t}.`;throw Error(i)}else r[n-s-1]=o}return r}const cp=Object.freeze(Object.defineProperty({__proto__:null,assertAndGetBroadcastShape:et,getBroadcastDims:Nc,getReductionAxes:Ur},Symbol.toStringTag,{value:"Module"}));/**
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
 */function up(e,t){let n=d(e,"a","equal","string_or_numeric"),r=d(t,"b","equal","string_or_numeric");[n,r]=Y(n,r),et(n.shape,r.shape);const s={a:n,b:r};return b.runKernel(Ko,s)}const Mc=m({equal_:up});/**
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
 */function lp(e,t,n){const r=d(t,"a","where"),s=d(n,"b","where"),o=d(e,"condition","where","bool"),a=et(et(o.shape,r.shape),s.shape),i=bn(o,a),c=bn(r,a),u=bn(s,a),h={condition:i,t:c,e:u};return b.runKernel(ii,h)}const Kt=m({where_:lp});/**
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
 */function hp(e){const n={x:d(e,"x","zerosLike")};return b.runKernel(Li,n)}const bt=m({zerosLike_:hp});/**
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
 */function fp(e,t){let n=d(e,"a","div"),r=d(t,"b","div");[n,r]=Y(n,r);const s=K(n,r),o=bt(s),a=Mc(r,o);return Kt(a,o,s)}const dp=m({divNoNan_:fp});/**
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
 */function pp(e,t){const n=d(e,"t1","dot"),r=d(t,"t2","dot");g((n.rank===1||n.rank===2)&&(r.rank===1||r.rank===2),()=>`Error in dot: inputs must all be rank 1 or 2, but got ranks ${n.rank} and ${r.rank}.`);const s=n.rank===1?n.size:n.shape[1],o=r.rank===1?r.size:r.shape[0];if(g(s===o,()=>`Error in dot: inner dimensions of inputs must match, but got ${s} and ${o}.`),n.rank===1&&r.rank===1){const a=E(n,[1,-1]),i=E(r,[-1,1]),c=L(a,i);return E(c,[])}else if(n.rank===1&&r.rank===2){const a=E(n,[1,-1]),i=E(r,[r.shape[0],r.shape[1]]),c=L(a,i);return E(c,[c.size])}else if(n.rank===2&&r.rank===1){const a=E(r,[-1,1]),i=L(n,a);return E(i,[i.size])}else{const a=E(r,[r.shape[0],r.shape[1]]);return L(n,a)}}const gp=m({dot_:pp});/**
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
 */function mp(e,...t){const n=t.map((s,o)=>d(s,`tensors${o}`,"einsum")),r={equation:e};return b.runKernel(qo,n,r)}const $e=m({einsum_:mp});/**
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
 */function bp(e){const n={x:d(e,"x","elu","float32")};return b.runKernel(Go,n)}const Fc=m({elu_:bp});/**
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
 */function wp(e,t){const n=d(e,"x","ensureShape","string_or_numeric");if(!Us(n.shape,t))throw new Error(`EnsureShape: Shape of tensor ${n.shape} is not compatible with expected shape ${t}`);return e}const yp=m({ensureShape_:wp});/**
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
 */function $p(e){let t=d(e,"x","erf");g(t.dtype==="int32"||t.dtype==="float32",()=>"Input dtype must be `int32` or `float32`."),t.dtype==="int32"&&(t=H(t,"float32"));const n={x:t};return b.runKernel(zo,n)}const Ep=m({erf_:$p});/**
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
 */function qr(e,t){for(let n=0;n<e.length;++n)if(e[e.length-n-1]!==t-1-n)return!1;return!0}function Bc(e,t,n){const r=e.length+t.length,s=[];let o=0,a=0;for(let i=0;i<r;i++)n.indexOf(i)===-1?s.push(e[o++]):s.push(t[a++]);return s}function kp(e,t){const n=[],r=e.length;for(let o=0;o<r;o++)t.indexOf(o)===-1&&n.push(e[o]);const s=t.map(o=>e[o]);return[n,s]}function ln(e,t){const n=t.map(r=>1);return Bc(e,n,t)}function xp(e,t,n){g(qr(t,n),()=>`${e} supports only inner-most axes for now. Got axes ${t} and rank-${n} input.`)}function vp(e,t){if(qr(e,t))return null;const n=[];for(let r=0;r<t;++r)e.indexOf(r)===-1&&n.push(r);return e.forEach(r=>n.push(r)),n}function Sp(e){return e.map((t,n)=>[n,t]).sort((t,n)=>t[1]-n[1]).map(t=>t[0])}function Ip(e,t){const n=[];for(let r=t-e;r<t;++r)n.push(r);return n}/**
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
 */function Tp(e,t=null,n=!1){const s={x:d(e,"x","max")},o={reductionIndices:t,keepDims:n};return b.runKernel($a,s,o)}const Te=m({max_:Tp});/**
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
 */function _p(e,t=null,n=!1){const s={x:d(e,"x","min")},o={axis:t,keepDims:n};return b.runKernel(Ia,s,o)}const wr=m({min_:_p});/**
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
 */function Ap(e,t){let n=d(e,"base","pow"),r=d(t,"exp","pow");[n,r]=Y(n,r);const s={a:n,b:r};return b.runKernel(Ua,s)}const Ze=m({pow_:Ap});/**
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
 */function q(e,t){if((st(e)&&t!=="string"||Array.isArray(e))&&t!=="complex64")throw new Error("Error creating a new Scalar: value must be a primitive (number|boolean|string)");if(t==="string"&&st(e)&&!(e instanceof Uint8Array))throw new Error("When making a scalar from encoded string, the value must be `Uint8Array`.");return Zt(e,[],[],t)}/**
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
 */function Dp(e){const n={x:d(e,"x","sqrt","float32")};return b.runKernel(gi,n)}const Rt=m({sqrt_:Dp});/**
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
 */function Np(e){const t=d(e,"x","square"),n={};return b.runKernel("Square",{x:t},n)}const St=m({square_:Np});/**
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
 */function Mp(e,t=null,n=!1){let r=d(e,"x","sum");r.dtype==="bool"&&(r=H(r,"int32"));const s={x:r},o={axis:t,keepDims:n};return b.runKernel(mi,s,o)}const z=m({sum_:Mp});/**
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
 */function Fp(e,t="euclidean",n=null,r=!1){e=d(e,"x","norm");const s=Rc(e,t,n);let o=s.shape;if(r){const a=nn(n,e.shape);o=ln(s.shape,a)}return E(s,o)}function Rc(e,t,n=null){if(e.rank===0)return mt(e);if(e.rank!==1&&n===null)return Rc(E(e,[-1]),t,n);if(e.rank===1||typeof n=="number"||Array.isArray(n)&&n.length===1){if(t===1)return z(mt(e),n);if(t===1/0)return Te(mt(e),n);if(t===-1/0)return wr(mt(e),n);if(t==="euclidean"||t===2)return Rt(z(Ze(mt(e),q(2,"int32")),n));throw new Error(`Error in norm: invalid ord value: ${t}`)}if(Array.isArray(n)&&n.length===2){if(t===1)return Te(z(mt(e),n[0]),n[1]-1);if(t===1/0)return Te(z(mt(e),n[1]),n[0]);if(t===-1/0)return wr(z(mt(e),n[1]),n[0]);if(t==="fro"||t==="euclidean")return Rt(z(St(e),n));throw new Error(`Error in norm: invalid ord value: ${t}`)}throw new Error(`Error in norm: invalid axis: ${n}`)}const Cn=m({norm_:Fp});/**
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
 */function Bp(e,t=null,n=!1){return Cn(e,"euclidean",t,n)}const Rp=m({euclideanNorm_:Bp});/**
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
 */function Cp(e){const n={x:d(e,"x","exp")};return b.runKernel(Vo,n)}const ue=m({exp_:Cp});/**
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
 */function Pp(e,t=0){const n=d(e,"x","expandDims","string_or_numeric");g(t<=n.rank,()=>"Axis must be <= rank of the tensor");const r={input:n},s={dim:t};return b.runKernel(jo,r,s)}const Lt=m({expandDims_:Pp});/**
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
 */function Op(e){const n={x:d(e,"x","expm1")};return b.runKernel(Ho,n)}const Lp=m({expm1_:Op});/**
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
 */function Wp(e,t){const n=d(e,"x","tile","string_or_numeric");g(n.rank===t.length,()=>`Error in transpose: rank of input ${n.rank} must match length of reps ${t}.`);const r={x:n},s={reps:t};return b.runKernel(Fr,r,s)}const Le=m({tile_:Wp});/**
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
 */function Up(e,t,n,r="float32"){t==null&&(t=e);const s=Bt([e,t],r),o=e<=t?e:t;for(let i=0;i<o;++i)s.set(1,i,i);const a=E(s.toTensor(),[e,t]);if(n==null)return a;if(n.length===1)return Le(Lt(a,0),[n[0],1,1]);if(n.length===2)return Le(Lt(Lt(a,0),0),[n[0],n[1],1,1]);if(n.length===3)return Le(Lt(Lt(Lt(a,0),0),0),[n[0],n[1],n[2],1,1]);throw new Error(`eye() currently supports only 1D and 2D batchShapes, but received ${n.length}D.`)}const Cc=m({eye_:Up});/**
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
 */function qp(e){const n={x:d(e,"x","floor","float32")};return b.runKernel(Yo,n)}const Pc=m({floor_:qp});/**
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
 */function Gp(e,t,n=0,r=0){const s=d(e,"x","gather"),o=d(t,"indices","gather","int32"),a={x:s,indices:o},i={axis:n,batchDims:r};return b.runKernel(ea,a,i)}const Oc=m({gather_:Gp});/**
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
 */function zp(e,t){let n=d(e,"a","greater","string_or_numeric"),r=d(t,"b","greater","string_or_numeric");[n,r]=Y(n,r),et(n.shape,r.shape);const s={a:n,b:r};return b.runKernel(ra,s)}const Pn=m({greater_:zp});/**
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
 */function Kp(e,t){let n=d(e,"a","greaterEqual","string_or_numeric"),r=d(t,"b","greaterEqual","string_or_numeric");[n,r]=Y(n,r),et(n.shape,r.shape);const s={a:n,b:r};return b.runKernel(sa,s)}const Lc=m({greaterEqual_:Kp});/**
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
 */function Vp(e){const n={input:d(e,"input","imag")};return b.runKernel(aa,n)}const On=m({imag_:Vp});/**
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
 */function jp(e){const n={x:d(e,"x","isFinite")};return b.runKernel(ia,n)}const Hp=m({isFinite_:jp});/**
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
 */function Xp(e){const n={x:d(e,"x","isInf")};return b.runKernel(ca,n)}const Zp=m({isInf_:Xp});/**
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
 */function Jp(e){const n={x:d(e,"x","isNaN")};return b.runKernel(ua,n)}const Yp=m({isNaN_:Jp});/**
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
 */function Qp(e,t=.2){const r={x:d(e,"x","leakyRelu")},s={alpha:t};return b.runKernel(la,r,s)}const Wc=m({leakyRelu_:Qp});/**
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
 */function tg(e,t){let n=d(e,"a","less","string_or_numeric"),r=d(t,"b","less","string_or_numeric");[n,r]=Y(n,r),et(n.shape,r.shape);const s={a:n,b:r};return b.runKernel(ha,s)}const yr=m({less_:tg});/**
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
 */function eg(e,t){let n=d(e,"a","lessEqual","string_or_numeric"),r=d(t,"b","lessEqual","string_or_numeric");[n,r]=Y(n,r),et(n.shape,r.shape);const s={a:n,b:r};return b.runKernel(fa,s)}const Gr=m({lessEqual_:eg});/**
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
 */function ng(e,t,n){if(n<=0)throw new Error("The number of values should be positive.");const r={start:e,stop:t,num:n};return b.runKernel(da,{},r)}/**
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
 */function rg(e,t=5,n=1,r=1,s=.5){const o=d(e,"x","localResponseNormalization");g(o.rank===4||o.rank===3,()=>`Error in localResponseNormalization: x must be rank 3 or 4 but got
               rank ${o.rank}.`),g(_e(t),()=>`Error in localResponseNormalization: depthRadius must be an integer but got depthRadius ${t}.`);let a=o,i=!1;o.rank===3&&(i=!0,a=E(o,[1,o.shape[0],o.shape[1],o.shape[2]]));const c={x:a},u={depthRadius:t,bias:n,alpha:r,beta:s},h=b.runKernel(ya,c,u);return i?E(h,[h.shape[1],h.shape[2],h.shape[3]]):h}const sg=m({localResponseNormalization_:rg});/**
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
 */function og(e){const n={x:d(e,"x","log","float32")};return b.runKernel(pa,n)}const Je=m({log_:og});/**
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
 */function ag(e){const n={x:d(e,"x","log1p")};return b.runKernel(ga,n)}const Uc=m({log1p_:ag});/**
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
 */function ig(e){return g(Vt(e),()=>"The f passed in grad(f) must be a function"),(t,n)=>{const r=d(t,"x","tf.grad","string_or_numeric"),s=n!=null?d(n,"dy","tf.grad"):null;return b.tidy(()=>{const{value:o,grads:a}=b.gradients(()=>e(r),[r],s);return s!=null&&ct(o.shape,s.shape,"The shape of dy passed in grad(f)(x, dy) must match the shape returned by f(x)"),Ln(a),a[0]})}}function cg(e){return g(Vt(e),()=>"The f passed in grads(f) must be a function"),(t,n)=>{g(Array.isArray(t),()=>"The args passed in grads(f)(args) must be an array of `Tensor`s or `TensorLike`s");const r=Ve(t,"args","tf.grads","string_or_numeric"),s=n!=null?d(n,"dy","tf.grads"):null;return b.tidy(()=>{const{value:o,grads:a}=b.gradients(()=>e(...r),r,s);return s!=null&&ct(o.shape,s.shape,"The shape of dy passed in grads(f)([x1,...], dy) must match the shape returned by f([x1,...])"),Ln(a),a})}}function ug(e){return g(Vt(e),()=>"The f passed in valueAndGrad(f) must be a function"),(t,n)=>{g(t instanceof Q,()=>"The x passed in valueAndGrad(f)(x) must be a tensor"),g(n==null||n instanceof Q,()=>"The dy passed in valueAndGrad(f)(x, dy) must be a tensor");const{grads:r,value:s}=b.gradients(()=>e(t),[t],n);return Ln(r),{grad:r[0],value:s}}}function lg(e){return g(Vt(e),()=>"The f passed in valueAndGrads(f) must be a function"),(t,n)=>{g(Array.isArray(t)&&t.every(s=>s instanceof Q),()=>"The args passed in valueAndGrads(f)(args) must be array of tensors"),g(n==null||n instanceof Q,()=>"The dy passed in valueAndGrads(f)(args, dy) must be a tensor");const r=b.gradients(()=>e(...t),t,n);return n!=null&&ct(r.value.shape,n.shape,"The shape of dy passed in valueAndGrads(f)([x1,...], dy) must match the shape returned by f([x1,...])"),Ln(r.grads),r}}function qc(e,t){g(Vt(e),()=>"The f passed in variableGrads(f) must be a function"),g(t==null||Array.isArray(t)&&t.every(u=>u instanceof Ke),()=>"The varList passed in variableGrads(f, varList) must be an array of variables");const n=t!=null;if(!n){t=[];for(const u in b.registeredVariables)t.push(b.registeredVariables[u])}const r=n?t.filter(u=>!u.trainable):null,s=t.length;t=t.filter(u=>u.trainable),g(t.length>0,()=>`variableGrads() expects at least one of the input variables to be trainable, but none of the ${s} variables is trainable.`);const o=!0,{value:a,grads:i}=b.gradients(e,t,null,o);g(i.some(u=>u!=null),()=>"Cannot find a connection between any variable and the result of the loss function y=f(x). Please make sure the operations that use variables are inside the function f passed to minimize()."),g(a.rank===0,()=>`The f passed in variableGrads(f) must return a scalar, but it returned a rank-${a.rank} tensor`);const c={};return t.forEach((u,h)=>{i[h]!=null&&(c[u.name]=i[h])}),r!=null&&r.forEach(u=>c[u.name]=null),{value:a,grads:c}}function Nt(e){return b.customGrad(e)}function Ln(e){if(e.filter(n=>n==null).length>0)throw new Error(`Cannot compute gradient of y=f(x) with respect to x. Make sure that
    the f you passed encloses all operations that lead from x to y.`)}/**
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
 */function hg(e){const n={x:d(e,"x","neg")};return b.runKernel(Ma,n)}const At=m({neg_:hg});/**
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
 */function fg(e){const n={x:d(e,"x","softplus")};return b.runKernel(pi,n)}const Gc=m({softplus_:fg});/**
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
 */function dg(e){const t=d(e,"x","logSigmoid");return Nt(r=>({value:At(Gc(At(r))),gradFunc:a=>T(a,Ie(At(r)))}))(t)}const pg=m({logSigmoid_:dg});/**
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
 */function gg(e,t){let n=d(e,"a","sub"),r=d(t,"b","sub");[n,r]=Y(n,r);const s={a:n,b:r};return b.runKernel(Ni,s)}const P=m({sub_:gg});/**
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
 */function mg(e,t=-1){const n=d(e,"logits","logSoftmax");if(t===-1&&(t=n.rank-1),t!==n.rank-1)throw Error(`Log Softmax along a non-last dimension is not yet supported. Logits was rank ${n.rank} and axis was ${t}`);return Nt((s,o)=>{const i=Te(s,t,!0),c=P(s,i),u=P(H(c,"float32"),Je(z(ue(c),t,!0)));return o([u]),{value:u,gradFunc:(l,f)=>{const[p]=f,w=!0,y=ue(p);return P(l,T(z(l,t,w),y))}}})(n)}const bg=m({logSoftmax_:mg});/**
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
 */function wg(e,t=null,n=!1){const r=d(e,"x","logSumExp"),s=nn(t,r.shape),o=Te(r,s,!0),a=P(r,o),i=ue(a),c=z(i,s),u=Je(c),h=F(E(o,u.shape),u);if(n){const l=ln(h.shape,s);return E(h,l)}return h}const zc=m({logSumExp_:wg});/**
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
 */function yg(e,t){const n=d(e,"a","logicalAnd","bool"),r=d(t,"b","logicalAnd","bool");et(n.shape,r.shape);const s={a:n,b:r};return b.runKernel(ma,s)}const Sn=m({logicalAnd_:yg});/**
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
 */function $g(e){const n={x:d(e,"x","logicalNot","bool")};return b.runKernel(ba,n)}const Kc=m({logicalNot_:$g});/**
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
 */function Eg(e,t){const n=d(e,"a","logicalOr","bool"),r=d(t,"b","logicalOr","bool");et(n.shape,r.shape);const s={a:n,b:r};return b.runKernel(wa,s)}const Vc=m({logicalOr_:Eg});/**
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
 */function kg(e,t){const n=d(e,"a","logicalXor","bool"),r=d(t,"b","logicalXor","bool");return et(n.shape,r.shape),Sn(Vc(e,t),Kc(Sn(e,t)))}const xg=m({logicalXor_:kg});/**
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
 */const dn=2147483648;function vg(e,t,n="left"){const r=d(e,"sortedSequence","searchSorted"),s=d(t,"values","searchSorted"),o=r.shape[r.shape.length-1],a=s.shape[s.shape.length-1],i=E(r,[-1,o]),c=E(s,[-1,a]);if(i.rank<2)throw new Error("Sorted input argument must be at least 2-dimensional");if(i.shape[0]!==c.shape[0])throw new Error("Leading dimension of 'sortedSequence' and 'values' must match.");if(W(c.shape)>=dn)throw new Error(`values tensor size must less than ${dn}`);if(i.shape[1]>=dn)throw new Error(`trailing dim_size must less than ${dn} for int32 output type, was ${i.shape[1]}`);const u={sortedSequence:i,values:c},h={side:n};return b.runKernel(ai,u,h)}const zr=m({searchSorted_:vg});/**
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
 */function Sg(e,t){return zr(e,t,"left")}/**
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
 */function Ig(e,t,n,r,s){const o=d(e,"x","maxPool"),a=1;let i=o,c=!1;o.rank===3&&(c=!0,i=E(o,[1,o.shape[0],o.shape[1],o.shape[2]])),g(i.rank===4,()=>`Error in maxPool: input must be rank 4 but got rank ${i.rank}.`),g(Pt(n,a),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${n} and dilations '${a}'`),xt("maxPool",r,s);const u={x:i},h={filterSize:t,strides:n,pad:r,dimRoundingMode:s},l=b.runKernel(ka,u,h);return c?E(l,[l.shape[1],l.shape[2],l.shape[3]]):l}const jc=m({maxPool_:Ig});/**
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
 */function Tg(e,t=[1,1,1],n,r,s,o="NDHWC"){const a=d(e,"x","maxPool3d");let i=a,c=!1;a.rank===4&&(c=!0,i=E(a,[1,a.shape[0],a.shape[1],a.shape[2],a.shape[3]])),g(i.rank===5,()=>`Error in maxPool3d: x must be rank 5 but got rank ${i.rank}.`),g(o==="NDHWC",()=>`Error in maxPool3d: Only NDHWC is currently supported, but got dataFormat of ${o}`),xt("maxPool3d",r,s);const u={x:i},h={filterSize:t,strides:n,pad:r,dimRoundingMode:s,dataFormat:o},l=b.runKernel(xa,u,h);return c?E(l,[l.shape[1],l.shape[2],l.shape[3],l.shape[4]]):l}const _g=m({maxPool3d_:Tg});/**
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
 */function Ag(e,t,n,r,s=!1){const a={x:d(e,"x","maxPoolWithArgmax")},i={filterSize:t,strides:n,pad:r,includeBatchInIndex:s},c=b.runKernel(va,a,i);return{result:c[0],indexes:c[1]}}const Dg=m({maxPoolWithArgmax_:Ag});/**
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
 */function Ng(e,t){let n=d(e,"a","maximum"),r=d(t,"b","maximum");[n,r]=Y(n,r),n.dtype==="bool"&&(n=H(n,"int32"),r=H(r,"int32")),et(n.shape,r.shape);const s={a:n,b:r};return b.runKernel(Ea,s)}const Hc=m({maximum_:Ng});/**
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
 */function Mg(e,t=null,n=!1){const s={x:d(e,"x","mean")},o={axis:t,keepDims:n};return b.runKernel(Sa,s,o)}const In=m({mean_:Mg});/**
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
 */function Me(e,t="float32"){if(pt(e),t==="complex64"){const r=Me(e,"float32"),s=Me(e,"float32");return Ht(r,s)}const n=Dn(W(e),t);return b.makeTensor(n,e,t)}/**
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
 */function re(e,t="float32"){if(pt(e),t==="complex64"){const r=re(e,"float32"),s=Me(e,"float32");return Ht(r,s)}const n=Ir(W(e),t);return b.makeTensor(n,e,t)}/**
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
 */function Fg(e,t,{indexing:n="xy"}={}){if(n!=="xy"&&n!=="ij")throw new TypeError(`${n} is not a valid third argument to meshgrid`);if(e===void 0)return[];let r=d(e,"x","meshgrid",e instanceof Q?e.dtype:"float32");if(t===void 0)return[r];let s=d(t,"y","meshgrid",t instanceof Q?t.dtype:"float32");const o=W(r.shape),a=W(s.shape);return n==="xy"?(r=E(r,[1,-1]),s=E(s,[-1,1]),[L(re([a,1],r.dtype),r),L(s,re([1,o],s.dtype))]):(r=E(r,[-1,1]),s=E(s,[1,-1]),[L(r,re([1,a],r.dtype)),L(re([o,1],s.dtype),s)])}/**
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
 */function Bg(e,t){let n=d(e,"a","minimum"),r=d(t,"b","minimum");[n,r]=Y(n,r),n.dtype==="bool"&&(n=H(n,"int32"),r=H(r,"int32")),et(n.shape,r.shape);const s={a:n,b:r};return b.runKernel(Ta,s)}const Tn=m({minimum_:Bg});/**
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
 */function Rg(e,t,n){g(n==="reflect"||n==="symmetric",()=>`Invalid mode. Mode must be either reflect or symmetric. Got ${n}.`);const r=d(e,"x","mirrorPad");if(r.rank===0)throw new Error("mirrorPad(scalar) is not defined. Pass non-scalar to mirrorPad");g(t.length===r.rank,()=>`Padding doesn't match input. Must be ${r.rank}. Got ${t.length}.`);const s=n==="reflect"?1:0;for(let i=0;i<r.rank;i++)g(t[i].length===2,()=>"Invalid number of paddings. Must be length of 2 each."),g(t[i][0]>=0&&t[i][0]<=r.shape[i]-s&&t[i][1]>=0&&t[i][1]<=r.shape[i]-s,()=>`Padding in dimension ${i} cannot be greater than or equal to ${r.shape[i]-s} or less than 0 for input of shape ${r.shape}`);const o={paddings:t,mode:n},a={x:r};return b.runKernel(_a,a,o)}const Cg=m({mirrorPad_:Rg});/**
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
 */function Pg(e,t){let n=d(e,"a","mod"),r=d(t,"b","mod");[n,r]=Y(n,r);const s={a:n,b:r};return b.runKernel(Aa,s)}const Og=m({mod_:Pg});/**
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
 */function Lg(e,t=null,n=!1){e=d(e,"x","moments");const r=nn(t,e.shape),s=In(e,r,n);let o=s.shape;n||(o=ln(s.shape,r));const a=St(P(H(e,"float32"),E(s,o))),i=In(a,r,n);return{mean:s,variance:i}}const Wg=m({moments_:Lg});function Ug(e,t,n,r){const s=d(t,"data","multiRNNCell"),o=Ve(n,"c","multiRNNCell"),a=Ve(r,"h","multiRNNCell");let i=s;const c=[];for(let l=0;l<e.length;l++){const f=e[l](i,o[l],a[l]);c.push(f[0]),c.push(f[1]),i=f[1]}const u=[],h=[];for(let l=0;l<c.length;l+=2)u.push(c[l]),h.push(c[l+1]);return[u,h]}const qg=m({multiRNNCell_:Ug});/**
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
 */function Gg(e,t,n,r=!1){const s=d(e,"logits","multinomial"),o=s.size,a=s.rank;if(o<2)throw new Error(`Error in multinomial: you need at least 2 outcomes, but got ${o}.`);if(a>2)throw new Error(`Rank of probabilities must be 1 or 2, but is ${a}`);n=n||Math.random();const c={logits:a===1?E(s,[1,-1]):s},u={numSamples:t,seed:n,normalized:r},h=b.runKernel(Da,c,u);return a===1?E(h,[h.size]):h}const zg=m({multinomial_:Gg});/**
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
 */function Kg(e,t){let n=d(e,"a","notEqual","string_or_numeric"),r=d(t,"b","notEqual","string_or_numeric");[n,r]=Y(n,r),et(n.shape,r.shape);const s={a:n,b:r};return b.runKernel(Fa,s)}const Xc=m({notEqual_:Kg});/**
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
 */function Vg(e,t,n=1,r=0,s="int32"){if(t<2)throw new Error(`Error in oneHot: depth must be >=2, but it is ${t}`);const a={indices:d(e,"indices","oneHot","int32")},i={dtype:s,depth:t,onValue:n,offValue:r};return b.runKernel(Oa,a,i)}const $r=m({oneHot_:Vg});/**
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
 */function jg(e){const n={x:d(e,"x","onesLike")};return b.runKernel(Pa,n)}const Hg=m({onesLike_:jg});function Xg(e,t){const n=d(e,"v1","outerProduct"),r=d(t,"v2","outerProduct");g(n.rank===1&&r.rank===1,()=>`Error in outerProduct: inputs must be rank 1, but got ranks ${n.rank} and ${r.rank}.`);const s=E(n,[-1,1]),o=E(r,[1,-1]);return L(s,o)}const Zg=m({outerProduct_:Xg});/**
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
 */function Jg(e,t,n=0){const r=d(e,"x","pad");if(r.rank===0)throw new Error("pad(scalar) is not defined. Pass non-scalar to pad");const s={paddings:t,constantValue:n},o={x:r};return b.runKernel(Wa,o,s)}const hn=m({pad_:Jg});function Yg(e,t,n=0){return g(t.length===2,()=>"Invalid number of paddings. Must be length of 2."),hn(e,[t],n)}const Qg=m({pad1d_:Yg});function tm(e,t,n=0){return g(t.length===2&&t[0].length===2&&t[1].length===2,()=>"Invalid number of paddings. Must be length of 2 each."),hn(e,t,n)}const em=m({pad2d_:tm});function nm(e,t,n=0){return g(t.length===3&&t[0].length===2&&t[1].length===2&&t[2].length===2,()=>"Invalid number of paddings. Must be length of 2 each."),hn(e,t,n)}const rm=m({pad3d_:nm});function sm(e,t,n=0){return g(t.length===4&&t[0].length===2&&t[1].length===2&&t[2].length===2&&t[3].length===2,()=>"Invalid number of paddings. Must be length of 2 each."),hn(e,t,n)}const om=m({pad4d_:sm});/**
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
 */function am(e,t,n){const r=d(e,"x","spaceToBatchND");g(r.rank>=1+t.length,()=>`input rank ${r.rank} should be > than [blockShape] ${t.length}`),g(n.length===t.length,()=>`paddings.shape[0] ${n.length} must be equal to [blockShape] ${t.length}`),g(r.shape.reduce((a,i,c)=>c>0&&c<=t.length?a&&(i+n[c-1][0]+n[c-1][1])%t[c-1]===0:a,!0),()=>`input spatial dimensions ${r.shape.slice(1)} with paddings ${n.toString()} must be divisible by blockShapes ${t.toString()}`);const s={x:r},o={blockShape:t,paddings:n};return b.runKernel(bi,s,o)}const Zc=m({spaceToBatchND_:am});/**
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
 */function im(e,t,n,r,s,o,a){s==null&&(s=[1,1]),o==null&&(o=1),r===0&&(r="valid");const i=d(e,"x","maxPool");let c=i,u=!1;i.rank===3&&(u=!0,c=E(i,[1,i.shape[0],i.shape[1],i.shape[2]])),g(Pt(o,s),()=>`Error in pool: Either strides or dilations must be 1. Got strides ${o} and dilations '${s}'`);const h=vc(c.shape,t,o,s,r),l=[h.dilationHeight,h.dilationWidth];let f;r==="same"?f=um([h.filterHeight,h.filterWidth],l):f=[[0,0],[0,0]];const p=l[0]===1&&l[1]===1,[w,y]=cm([h.inHeight,h.inWidth],l,f),$=p?r:"valid",x=p?c:Zc(c,l,w),k=(n==="avg"?()=>Tc(x,t,o,$,a):()=>jc(x,t,o,$,a))(),v=p?k:_c(k,l,y);return u?E(v,[v.shape[1],v.shape[2],v.shape[3]]):v}function cm(e,t,n){const r=n.map(h=>h[0]),s=n.map(h=>h[1]),o=e.concat(r,s),a=t.map((h,l)=>(h-o[l]%h)%h),i=s.map((h,l)=>h+a[l]),c=t.map((h,l)=>[r[l],i[l]]),u=t.map((h,l)=>[0,a[l]]);return[c,u]}function um(e,t){const r=e.map((a,i)=>a+(a-1)*(t[i]-1)).map(a=>a-1),s=r.map(a=>Math.floor(a/2)),o=r.map((a,i)=>a-s[i]);return r.map((a,i)=>[s[i],o[i]])}const lm=m({pool_:im});/**
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
 */function hm(e,t){const n=d(e,"x","prelu"),r=d(t,"alpha","prelu"),s={x:n,alpha:r};return b.runKernel(qa,s)}const Jc=m({prelu_:hm});/**
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
 */function fm(e,t=null,n=!1){let r=d(e,"x","prod");r.dtype==="bool"&&(r=H(r,"int32"));const s={x:r},o={axis:t,keepDims:n};return b.runKernel(Ga,s,o)}const dm=m({prod_:fm});/**
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
 */function pm(e,t,n,r){const s=e.map((h,l)=>d(h,`tensors${l}`,"raggedGather","int32")),o=d(t,"paramsDenseValues","raggedGather"),a=d(n,"indices","raggedGather","int32"),i={paramsNestedSplits:s,paramsDenseValues:o,indices:a},c={outputRaggedRank:r},u=b.runKernel(za,i,c);return{outputNestedSplits:u.slice(0,u.length-1),outputDenseValues:u[u.length-1]}}const gm=m({raggedGather_:pm});/**
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
 */function mm(e,t,n){const r=d(e,"starts","raggedRange"),s=d(t,"limits","raggedRange",r.dtype),o=d(n,"deltas","raggedRange",r.dtype),a={starts:r,limits:s,deltas:o},i=b.runKernel(Ka,a);return{rtNestedSplits:i[0],rtDenseValues:i[1]}}const bm=m({raggedRange_:mm});/**
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
 */function wm(e,t,n,r,s){const o=d(e,"shape","raggedTensorToTensor","int32"),a=d(t,"values","raggedTensorToTensor"),i=d(n,"defaultValue","raggedTensorToTensor",a.dtype),c=r.map((l,f)=>d(l,`tensors${f}`,"raggedTensorToTensor","int32")),u={shape:o,values:a,defaultValue:i,rowPartitionTensors:c},h={rowPartitionTypes:s};return b.runKernel(Va,u,h)}const ym=m({raggedTensorToTensor_:wm});/**
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
 */function $m(e,t,n){pt(e);const r=W(e);let s=null;if(n==null||n==="float32")s=new Float32Array(r);else if(n==="int32")s=new Int32Array(r);else if(n==="bool")s=new Uint8Array(r);else throw new Error(`Unknown data type ${n}`);for(let o=0;o<r;o++)s[o]=t();return b.makeTensor(s,e,n)}const Em=m({rand_:$m});var Kr={exports:{}};Kr.exports;(function(e){(function(t,n,r){function s(c){var u=this,h=i();u.next=function(){var l=2091639*u.s0+u.c*23283064365386963e-26;return u.s0=u.s1,u.s1=u.s2,u.s2=l-(u.c=l|0)},u.c=1,u.s0=h(" "),u.s1=h(" "),u.s2=h(" "),u.s0-=h(c),u.s0<0&&(u.s0+=1),u.s1-=h(c),u.s1<0&&(u.s1+=1),u.s2-=h(c),u.s2<0&&(u.s2+=1),h=null}function o(c,u){return u.c=c.c,u.s0=c.s0,u.s1=c.s1,u.s2=c.s2,u}function a(c,u){var h=new s(c),l=u&&u.state,f=h.next;return f.int32=function(){return h.next()*4294967296|0},f.double=function(){return f()+(f()*2097152|0)*11102230246251565e-32},f.quick=f,l&&(typeof l=="object"&&o(l,h),f.state=function(){return o(h,{})}),f}function i(){var c=4022871197,u=function(h){h=String(h);for(var l=0;l<h.length;l++){c+=h.charCodeAt(l);var f=.02519603282416938*c;c=f>>>0,f-=c,f*=c,c=f>>>0,f-=c,c+=f*4294967296}return(c>>>0)*23283064365386963e-26};return u}n&&n.exports?n.exports=a:this.alea=a})(fe,e)})(Kr);var km=Kr.exports,Vr={exports:{}};Vr.exports;(function(e){(function(t,n,r){function s(i){var c=this,u="";c.x=0,c.y=0,c.z=0,c.w=0,c.next=function(){var l=c.x^c.x<<11;return c.x=c.y,c.y=c.z,c.z=c.w,c.w^=c.w>>>19^l^l>>>8},i===(i|0)?c.x=i:u+=i;for(var h=0;h<u.length+64;h++)c.x^=u.charCodeAt(h)|0,c.next()}function o(i,c){return c.x=i.x,c.y=i.y,c.z=i.z,c.w=i.w,c}function a(i,c){var u=new s(i),h=c&&c.state,l=function(){return(u.next()>>>0)/4294967296};return l.double=function(){do var f=u.next()>>>11,p=(u.next()>>>0)/4294967296,w=(f+p)/(1<<21);while(w===0);return w},l.int32=u.next,l.quick=l,h&&(typeof h=="object"&&o(h,u),l.state=function(){return o(u,{})}),l}n&&n.exports?n.exports=a:this.xor128=a})(fe,e)})(Vr);var xm=Vr.exports,jr={exports:{}};jr.exports;(function(e){(function(t,n,r){function s(i){var c=this,u="";c.next=function(){var l=c.x^c.x>>>2;return c.x=c.y,c.y=c.z,c.z=c.w,c.w=c.v,(c.d=c.d+362437|0)+(c.v=c.v^c.v<<4^(l^l<<1))|0},c.x=0,c.y=0,c.z=0,c.w=0,c.v=0,i===(i|0)?c.x=i:u+=i;for(var h=0;h<u.length+64;h++)c.x^=u.charCodeAt(h)|0,h==u.length&&(c.d=c.x<<10^c.x>>>4),c.next()}function o(i,c){return c.x=i.x,c.y=i.y,c.z=i.z,c.w=i.w,c.v=i.v,c.d=i.d,c}function a(i,c){var u=new s(i),h=c&&c.state,l=function(){return(u.next()>>>0)/4294967296};return l.double=function(){do var f=u.next()>>>11,p=(u.next()>>>0)/4294967296,w=(f+p)/(1<<21);while(w===0);return w},l.int32=u.next,l.quick=l,h&&(typeof h=="object"&&o(h,u),l.state=function(){return o(u,{})}),l}n&&n.exports?n.exports=a:this.xorwow=a})(fe,e)})(jr);var vm=jr.exports,Hr={exports:{}};Hr.exports;(function(e){(function(t,n,r){function s(i){var c=this;c.next=function(){var h=c.x,l=c.i,f,p;return f=h[l],f^=f>>>7,p=f^f<<24,f=h[l+1&7],p^=f^f>>>10,f=h[l+3&7],p^=f^f>>>3,f=h[l+4&7],p^=f^f<<7,f=h[l+7&7],f=f^f<<13,p^=f^f<<9,h[l]=p,c.i=l+1&7,p};function u(h,l){var f,p=[];if(l===(l|0))p[0]=l;else for(l=""+l,f=0;f<l.length;++f)p[f&7]=p[f&7]<<15^l.charCodeAt(f)+p[f+1&7]<<13;for(;p.length<8;)p.push(0);for(f=0;f<8&&p[f]===0;++f);for(f==8?p[7]=-1:p[f],h.x=p,h.i=0,f=256;f>0;--f)h.next()}u(c,i)}function o(i,c){return c.x=i.x.slice(),c.i=i.i,c}function a(i,c){i==null&&(i=+new Date);var u=new s(i),h=c&&c.state,l=function(){return(u.next()>>>0)/4294967296};return l.double=function(){do var f=u.next()>>>11,p=(u.next()>>>0)/4294967296,w=(f+p)/(1<<21);while(w===0);return w},l.int32=u.next,l.quick=l,h&&(h.x&&o(h,u),l.state=function(){return o(u,{})}),l}n&&n.exports?n.exports=a:this.xorshift7=a})(fe,e)})(Hr);var Sm=Hr.exports,Xr={exports:{}};Xr.exports;(function(e){(function(t,n,r){function s(i){var c=this;c.next=function(){var h=c.w,l=c.X,f=c.i,p,w;return c.w=h=h+1640531527|0,w=l[f+34&127],p=l[f=f+1&127],w^=w<<13,p^=p<<17,w^=w>>>15,p^=p>>>12,w=l[f]=w^p,c.i=f,w+(h^h>>>16)|0};function u(h,l){var f,p,w,y,$,x=[],N=128;for(l===(l|0)?(p=l,l=null):(l=l+"\0",p=0,N=Math.max(N,l.length)),w=0,y=-32;y<N;++y)l&&(p^=l.charCodeAt((y+32)%l.length)),y===0&&($=p),p^=p<<10,p^=p>>>15,p^=p<<4,p^=p>>>13,y>=0&&($=$+1640531527|0,f=x[y&127]^=p+$,w=f==0?w+1:0);for(w>=128&&(x[(l&&l.length||0)&127]=-1),w=127,y=4*128;y>0;--y)p=x[w+34&127],f=x[w=w+1&127],p^=p<<13,f^=f<<17,p^=p>>>15,f^=f>>>12,x[w]=p^f;h.w=$,h.X=x,h.i=w}u(c,i)}function o(i,c){return c.i=i.i,c.w=i.w,c.X=i.X.slice(),c}function a(i,c){i==null&&(i=+new Date);var u=new s(i),h=c&&c.state,l=function(){return(u.next()>>>0)/4294967296};return l.double=function(){do var f=u.next()>>>11,p=(u.next()>>>0)/4294967296,w=(f+p)/(1<<21);while(w===0);return w},l.int32=u.next,l.quick=l,h&&(h.X&&o(h,u),l.state=function(){return o(u,{})}),l}n&&n.exports?n.exports=a:this.xor4096=a})(fe,e)})(Xr);var Im=Xr.exports,Zr={exports:{}};Zr.exports;(function(e){(function(t,n,r){function s(i){var c=this,u="";c.next=function(){var l=c.b,f=c.c,p=c.d,w=c.a;return l=l<<25^l>>>7^f,f=f-p|0,p=p<<24^p>>>8^w,w=w-l|0,c.b=l=l<<20^l>>>12^f,c.c=f=f-p|0,c.d=p<<16^f>>>16^w,c.a=w-l|0},c.a=0,c.b=0,c.c=-1640531527,c.d=1367130551,i===Math.floor(i)?(c.a=i/4294967296|0,c.b=i|0):u+=i;for(var h=0;h<u.length+20;h++)c.b^=u.charCodeAt(h)|0,c.next()}function o(i,c){return c.a=i.a,c.b=i.b,c.c=i.c,c.d=i.d,c}function a(i,c){var u=new s(i),h=c&&c.state,l=function(){return(u.next()>>>0)/4294967296};return l.double=function(){do var f=u.next()>>>11,p=(u.next()>>>0)/4294967296,w=(f+p)/(1<<21);while(w===0);return w},l.int32=u.next,l.quick=l,h&&(typeof h=="object"&&o(h,u),l.state=function(){return o(u,{})}),l}n&&n.exports?n.exports=a:this.tychei=a})(fe,e)})(Zr);var Tm=Zr.exports,Yc={exports:{}};const _m={},Am=Object.freeze(Object.defineProperty({__proto__:null,default:_m},Symbol.toStringTag,{value:"Module"})),Dm=Lu(Am);(function(e){(function(t,n,r){var s=256,o=6,a=52,i="random",c=r.pow(s,o),u=r.pow(2,a),h=u*2,l=s-1,f;function p(v,I,_){var M=[];I=I==!0?{entropy:!0}:I||{};var A=x($(I.entropy?[v,k(n)]:v??N(),3),M),D=new w(M),C=function(){for(var B=D.g(o),O=c,U=0;B<u;)B=(B+U)*s,O*=s,U=D.g(1);for(;B>=h;)B/=2,O/=2,U>>>=1;return(B+U)/O};return C.int32=function(){return D.g(4)|0},C.quick=function(){return D.g(4)/4294967296},C.double=C,x(k(D.S),n),(I.pass||_||function(B,O,U,X){return X&&(X.S&&y(X,D),B.state=function(){return y(D,{})}),U?(r[i]=B,O):B})(C,A,"global"in I?I.global:this==r,I.state)}function w(v){var I,_=v.length,M=this,A=0,D=M.i=M.j=0,C=M.S=[];for(_||(v=[_++]);A<s;)C[A]=A++;for(A=0;A<s;A++)C[A]=C[D=l&D+v[A%_]+(I=C[A])],C[D]=I;(M.g=function(B){for(var O,U=0,X=M.i,nt=M.j,wt=M.S;B--;)O=wt[X=l&X+1],U=U*s+wt[l&(wt[X]=wt[nt=l&nt+O])+(wt[nt]=O)];return M.i=X,M.j=nt,U})(s)}function y(v,I){return I.i=v.i,I.j=v.j,I.S=v.S.slice(),I}function $(v,I){var _=[],M=typeof v,A;if(I&&M=="object")for(A in v)try{_.push($(v[A],I-1))}catch{}return _.length?_:M=="string"?v:v+"\0"}function x(v,I){for(var _=v+"",M,A=0;A<_.length;)I[l&A]=l&(M^=I[l&A]*19)+_.charCodeAt(A++);return k(I)}function N(){try{var v;return f&&(v=f.randomBytes)?v=v(s):(v=new Uint8Array(s),(t.crypto||t.msCrypto).getRandomValues(v)),k(v)}catch{var I=t.navigator,_=I&&I.plugins;return[+new Date,t,_,t.screen,k(n)]}}function k(v){return String.fromCharCode.apply(0,v)}if(x(r.random(),n),e.exports){e.exports=p;try{f=Dm}catch{}}else r["seed"+i]=p})(typeof self<"u"?self:fe,[],Math)})(Yc);var Nm=Yc.exports,Mm=km,Fm=xm,Bm=vm,Rm=Sm,Cm=Im,Pm=Tm,ge=Nm;ge.alea=Mm;ge.xor128=Fm;ge.xorwow=Bm;ge.xorshift7=Rm;ge.xor4096=Cm;ge.tychei=Pm;var Jr=ge;/**
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
 */const Om=.001,Qc=.1;function Lm(e,t,n){return n==null&&(n=Yr()),Er(e,t,(r,s)=>Qr(r,s,n))}function Yr(){return b.backend.floatPrecision()===32?Om:Qc}function Er(e,t,n){let r=!0;if((st(e)||st(t))&&(r=!1),st(e)&&st(t)&&(r=!0),r){const a=e.constructor.name,i=t.constructor.name;if(a!==i)throw new Error(`Arrays are of different type. Actual: ${a}. Expected: ${i}`)}if(Array.isArray(e)&&Array.isArray(t)){const a=Dt(e),i=Dt(t);if(!Ct(a,i))throw new Error(`Arrays have different shapes. Actual: [${a}]. Expected: [${i}]`)}const s=st(e)?e:jt(e),o=st(t)?t:jt(t);if(s.length!==o.length)throw new Error(`Arrays have different lengths actual: ${s.length} vs expected: ${o.length}.
Actual:   ${s}.
Expected: ${o}.`);for(let a=0;a<o.length;++a){const i=s[a],c=o[a];if(!n(i,c))throw new Error(`Arrays differ: actual[${a}] = ${i}, expected[${a}] = ${c}.
Actual:   ${s}.
Expected: ${o}.`)}typeof expect<"u"&&expect().nothing()}function Wm(e,t){e().then(()=>t.fail(),()=>t()),typeof expect<"u"&&expect().nothing()}function Um(e,t){const n=typeof t=="string"||typeof t=="number"||typeof t=="boolean"?[t]:t;return qt(e)||qt(e[0])||qt(t)||qt(t[0])?Er(e,n,(r,s)=>r==s):Er(e,t,(r,s)=>Qr(r,s,0))}function qm(e,t,n){if(n==null&&(n=Yr()),!Qr(e,t,n))throw new Error(`Numbers differ: actual === ${e}, expected === ${t}`);typeof expect<"u"&&expect().nothing()}function Qr(e,t,n){return!isFinite(e)&&!isFinite(t)?!0:!(isNaN(e)||isNaN(t)||Math.abs(e-t)>n)}function Gm(e,t,n){for(let r=0;r<e.length;r++)if(e[r]<t||e[r]>n)throw new Error(`Value out of range:${e[r]} low: ${t}, high: ${n}`)}function zm(e,t){const n=new Float32Array(e),r=new Float32Array(t);if(n.length!==r.length)throw new Error(`Expected ArrayBuffer to be of length ${r.length}, but it was ${n.length}`);for(let s=0;s<r.length;s++)if(n[s]!==r[s])throw new Error(`Expected ArrayBuffer value at ${s} to be ${r[s]} but got ${n[s]} instead`)}function tu(e){for(let t=0;t<e.length;t++){const n=e[t];Array.isArray(n)?tu(n):e[t]=on(n)}return e}function Km(e){const t=document.createElement("video");return"playsInline"in t&&(t.playsInline=!0),t.muted=!0,t.loop=!0,t.style.position="fixed",t.style.left="0px",t.style.top="0px",t.preload="auto",t.appendChild(e),new Promise(n=>{t.addEventListener("loadeddata",r=>n(t)),t.load()})}async function Vm(e){await e.play(),"requestVideoFrameCallback"in e&&await new Promise(t=>{e.requestVideoFrameCallback(t)})}const jm=Object.freeze(Object.defineProperty({__proto__:null,TEST_EPSILON_FLOAT16:Qc,createVideoElement:Km,encodeStrings:tu,expectArrayBuffersEqual:zm,expectArraysClose:Lm,expectArraysEqual:Um,expectNumbersClose:qm,expectPromiseToFail:Wm,expectValuesInRange:Gm,play:Vm,testEpsilon:Yr},Symbol.toStringTag,{value:"Module"}));/**
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
 */class ts{constructor(t,n,r,s,o){this.mean=t,this.stdDev=n,this.dtype=r,this.nextVal=NaN,this.truncated=s,this.truncated&&(this.upper=this.mean+this.stdDev*2,this.lower=this.mean-this.stdDev*2);const a=o||Math.random();this.random=Jr.alea(a.toString())}nextValue(){if(!isNaN(this.nextVal)){const s=this.nextVal;return this.nextVal=NaN,s}let t,n,r=!1;for(;!r;){let s,o,a;do s=2*this.random()-1,o=2*this.random()-1,a=s*s+o*o;while(a>=1||a===0);const i=Math.sqrt(-2*Math.log(a)/a);t=this.mean+this.stdDev*s*i,n=this.mean+this.stdDev*o*i,(!this.truncated||this.isValidTruncated(t))&&(r=!0)}return(!this.truncated||this.isValidTruncated(n))&&(this.nextVal=this.convertValue(n)),this.convertValue(t)}convertValue(t){return this.dtype==null||this.dtype==="float32"?t:Math.round(t)}isValidTruncated(t){return t<=this.upper&&t>=this.lower}}class Hm{constructor(t,n,r,s){this.alpha=t,this.beta=1/n,this.dtype=r;const o=s||Math.random();this.randu=Jr.alea(o.toString()),this.randn=new ts(0,1,r,!1,this.randu()),t<1?this.d=t+2/3:this.d=t-1/3,this.c=1/Math.sqrt(9*this.d)}nextValue(){let t,n,r,s,o,a;for(;;){do s=this.randn.nextValue(),a=1+this.c*s;while(a<=0);if(a*=a*a,t=s*s,n=1-.331*t*t,r=.5*t+this.d*(1-a+Math.log(a)),o=this.randu(),o<n||Math.log(o)<r)break}return a=1/this.beta*this.d*a,this.alpha<1&&(a*=Math.pow(this.randu(),1/this.alpha)),this.convertValue(a)}convertValue(t){return this.dtype==="float32"?t:Math.round(t)}}class Xm{constructor(t=0,n=1,r,s){if(this.canReturnFloat=()=>this.dtype==null||this.dtype==="float32",this.min=t,this.range=n-t,this.dtype=r,s==null&&(s=Math.random()),typeof s=="number"&&(s=s.toString()),!this.canReturnFloat()&&this.range<=1)throw new Error(`The difference between ${t} - ${n} <= 1 and dtype is not float`);this.random=Jr.alea(s)}convertValue(t){return this.canReturnFloat()?t:Math.round(t)}nextValue(){return this.convertValue(this.min+this.range*this.random())}}/**
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
 */function Zm(e,t,n=1,r="float32",s){if(pt(e),n==null&&(n=1),r==null&&(r="float32"),r!=="float32"&&r!=="int32")throw new Error(`Unsupported data type ${r}`);const o=new Hm(t,n,r,s),a=Bt(e,r);for(let i=0;i<a.values.length;i++)a.values[i]=o.nextValue();return a.toTensor()}const Jm=m({randomGamma_:Zm});/**
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
 */function Ym(e,t=0,n=1,r,s){if(pt(e),r!=null&&r==="bool")throw new Error(`Unsupported data type ${r}`);const o=new ts(t,n,r,!1,s),a=Bt(e,r);for(let i=0;i<a.values.length;i++)a.values[i]=o.nextValue();return a.toTensor()}const eu=m({randomNormal_:Ym});/**
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
 */function Qm(e,t,n){if(t!=null&&t==="bool")throw new Error(`Unsupported data type ${t}`);return eu(e,0,1,t,n)}const tb=m({randomStandardNormal_:Qm});/**
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
 */function eb(e,t=0,n=1,r="float32",s){pt(e);const o=Bt(e,r),a=new Xm(t,n,null,s);for(let i=0;i<o.values.length;i++)o.values[i]=a.nextValue();return o.toTensor()}const es=m({randomUniform_:eb});/**
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
 */function nb(e,t,n,r){return es(e,t,n,"int32",r)}const rb=m({randomUniformInt_:nb});/**
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
 */function Ye(e,t,n=1,r="float32"){if(n===0)throw new Error("Cannot have a step of zero");const s={start:e,stop:t,step:n,dtype:r};return b.runKernel(ja,{},s)}/**
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
 */function sb(e){const n={input:d(e,"input","real")};return b.runKernel(Ha,n)}const Qe=m({real_:sb});/**
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
 */function ob(e){const n={x:d(e,"x","reciprocal")};return b.runKernel(Xa,n)}const ab=m({reciprocal_:ob});/**
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
 */function ib(e){const n={x:d(e,"x","relu")};return b.runKernel(Za,n)}const Wn=m({relu_:ib});/**
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
 */function cb(e){const n={x:d(e,"x","relu6")};return b.runKernel(ti,n)}const nu=m({relu6_:cb});/**
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
 */function ub(e,t){const r={x:d(e,"x","reverse")},s={dims:t};return b.runKernel(ei,r,s)}const le=m({reverse_:ub});/**
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
 */function lb(e){const t=d(e,"x","reverse");return g(t.rank===1,()=>`Error in reverse1D: x must be rank 1 but got rank ${t.rank}.`),le(t,0)}const hb=m({reverse1d_:lb});/**
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
 */function fb(e,t){const n=d(e,"x","reverse");return g(n.rank===2,()=>`Error in reverse2D: x must be rank 2 but got rank ${n.rank}.`),le(n,t)}const db=m({reverse2d_:fb});/**
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
 */function pb(e,t){const n=d(e,"x","reverse");return g(n.rank===3,()=>`Error in reverse3D: x must be rank 3 but got rank ${n.rank}.`),le(n,t)}const gb=m({reverse3d_:pb});/**
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
 */function mb(e,t){const n=d(e,"x","reverse");return g(n.rank===4,()=>`Error in reverse4D: x must be rank 4 but got rank ${n.rank}.`),le(n,t)}const bb=m({reverse4d_:mb});/**
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
 */function wb(e){const n={x:d(e,"x","round")};return b.runKernel(ni,n)}const ru=m({round_:wb});/**
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
 */function yb(e){const n={x:d(e,"x","rsqrt","float32")};return b.runKernel(ri,n)}const $b=m({rsqrt_:yb});/**
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
 */function Eb(e){const n={x:d(e,"x","selu")};return b.runKernel(ci,n)}const kb=m({selu_:Eb});function xb(e,t,n,r,s,o=[1,1],a="NHWC"){const i=d(e,"x","separableConv2d"),c=d(t,"depthwiseFilter","separableConv2d"),u=d(n,"pointwiseFilter","separableConv2d");let h=i,l=!1;if(i.rank===3&&(l=!0,h=E(i,[1,i.shape[0],i.shape[1],i.shape[2]])),a==="NCHW")throw new Error("separableConv2d currently does not support dataFormat NCHW; only NHWC is supported");g(h.rank===4,()=>`Error in separableConv2d: input must be rank 4, but got rank ${h.rank}.`),g(c.rank===4,()=>`Error in separableConv2d: depthwise filter must be rank 4, but got rank ${c.rank}.`),g(u.rank===4,()=>`Error in separableConv2d: pointwise filter must be rank 4, but got rank ${c.rank}.`),g(u.shape[0]===1,()=>`Error in separableConv2d: the first dimension of pointwise filter  must be 1, but got ${u.shape[0]}.`),g(u.shape[1]===1,()=>`Error in separableConv2d: the second dimension of pointwise filter must be 1, but got ${u.shape[1]}.`);const f=c.shape[2],p=c.shape[3];g(u.shape[2]===f*p,()=>`Error in separableConv2d: the third dimension of pointwise filter must be ${f*p}, but got ${u.shape[2]}.`);const w=Wr(h,c,r,s,a,o),$=Rn(w,u,1,"valid",a);return l?E($,[$.shape[1],$.shape[2],$.shape[3]]):$}const vb=m({separableConv2d_:xb});/**
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
 */async function Sb(e,t){const n=d(e,"x","setdiff1d"),r=d(t,"y","setdiff1d");g(n.dtype===r.dtype,()=>`x and y should have the same dtype, but got x (${n.dtype}) and y (${r.dtype}).`),g(n.rank===1,()=>`x should be 1D tensor, but got x (${n.shape}).`),g(r.rank===1,()=>`y should be 1D tensor, but got y (${r.shape}).`);const s=await n.data(),o=await r.data(),a=new Set(o);let i=0;for(let h=0;h<s.length;h++)a.has(s[h])||i++;const c=new vn([i],n.dtype),u=new vn([i],"int32");for(let h=0,l=0;h<s.length;h++)a.has(s[h])||(c.values[l]=s[h],u.values[l]=h,l++);return[c.toTensor(),u.toTensor()]}const Ib=Sb;/**
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
 */function Tb(e){const n={x:d(e,"x","sign")};return b.runKernel(fi,n)}const _b=m({sign_:Tb});/**
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
 */function Ab(e){const n={x:d(e,"x","sin","float32")};return b.runKernel(li,n)}const Db=m({sin_:Ab});/**
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
 */function Nb(e){const n={x:d(e,"x","sinh")};return b.runKernel(hi,n)}const Mb=m({sinh_:Nb});/**
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
 */function Fb(e,t,n){const r=d(e,"x","slice1d");return g(r.rank===1,()=>`slice1d expects a rank-1 tensor, but got a rank-${r.rank} tensor`),Z(r,[t],[n])}const Bb=m({slice1d_:Fb});/**
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
 */function Rb(e,t,n){const r=d(e,"x","slice2d");return g(r.rank===2,()=>`slice2d expects a rank-2 tensor, but got a rank-${r.rank} tensor`),Z(r,t,n)}const Cb=m({slice2d_:Rb});/**
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
 */function Pb(e,t,n){const r=d(e,"x","slice3d");return g(r.rank===3,()=>`slice3d expects a rank-3 tensor, but got a rank-${r.rank} tensor`),Z(r,t,n)}const Ob=m({slice3d_:Pb});/**
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
 */function Lb(e,t,n){const r=d(e,"x","slice4d");return g(r.rank===4,()=>`slice4d expects a rank-4 tensor, but got a rank-${r.rank} tensor`),Z(r,t,n)}const Wb=m({slice4d_:Lb});/**
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
 */function Ub(e,t=-1){const n=d(e,"logits","softmax","float32");if(t===-1&&(t=n.rank-1),t!==n.rank-1)throw Error(`Softmax along a non-last dimension is not yet supported. Logits was rank ${n.rank} and dim was ${t}`);const r={logits:n},s={dim:t};return b.runKernel(yi,r,s)}const qb=m({softmax_:Ub});/**
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
 */function Gb(e){g(e.dtype==="complex64",()=>`The dtype for tf.spectral.fft() must be complex64 but got ${e.dtype}.`);const t={input:e};return b.runKernel(Xo,t)}const ns=m({fft_:Gb});/**
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
 */function zb(e){g(e.dtype==="complex64",()=>`The dtype for tf.spectral.ifft() must be complex64 but got ${e.dtype}.`);const t={input:e};return b.runKernel(oa,t)}const _n=m({ifft_:zb});/**
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
 */function Kb(e){const t=e.shape[e.shape.length-1],n=e.size/t;let r;if(t<=2){const s=E(e,[n,t]);r=_n(s)}else{const s=[n,2*(t-1)],o=E(Qe(e),[n,t]),a=E(On(e),[n,t]),i=le(Z(o,[0,1],[n,t-2]),1),c=T(le(Z(a,[0,1],[n,t-2]),1),q(-1)),u=dt([o,i],1),h=dt([a,c],1),l=E(Ht(u,h),[s[0],s[1]]);r=_n(l)}if(r=Qe(r),e.rank===3&&e.shape[0]!==0){const s=r,o=e.shape[0];r=E(r,[o,r.shape[0]/o,r.shape[1]]),s.dispose()}return r}const su=m({irfft_:Kb});/**
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
 */function Vb(e,t,n=0){const s={x:d(e,"x","split")},o={numOrSizeSplits:t,axis:n};return b.runKernel(wi,s,o)}const tn=m({split_:Vb});/**
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
 */function jb(e,t){g(e.dtype==="float32",()=>`The dtype for rfft() must be real value but got ${e.dtype}`);let n=e.shape[e.shape.length-1];const r=e.size/n;let s;if(t!=null&&t<n){const w=e.shape.map($=>0),y=e.shape.map($=>$);y[e.shape.length-1]=t,s=Z(e,w,y),n=t}else if(t!=null&&t>n){const w=e.shape.map(y=>y);w[e.shape.length-1]=t-n,s=dt([e,Me(w)],e.shape.length-1),n=t}else s=e;const o=bt(s),a=E(Ht(s,o),[r,n]),i=ns(a),c=Math.floor(n/2)+1,u=Qe(i),h=On(i),l=tn(u,[c,n-c],u.shape.length-1),f=tn(h,[c,n-c],h.shape.length-1),p=s.shape.slice();return p[s.shape.length-1]=c,E(Ht(l[0],f[0]),p)}const rs=m({rfft_:jb});/**
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
 */function Hb(e,t){let n=d(e,"a","squaredDifference"),r=d(t,"b","squaredDifference");[n,r]=Y(n,r),et(n.shape,r.shape);const s={a:n,b:r},o={};return b.runKernel(Si,s,o)}const ou=m({squaredDifference_:Hb});/**
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
 */function Xb(e,t){const n=d(e,"x","squeeze","string_or_numeric");return E(n,qs(n.shape,t).newShape)}const ss=m({squeeze_:Xb});/**
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
 */function Zb(e,t=0){const n=Ve(e,"tensors","stack","string_or_numeric");g(n.length>=1,()=>"Pass at least one tensor to tf.stack"),n.length>0&&g(t<=n[0].rank,()=>"Axis must be <= rank of the tensor");const r=n,s={axis:t};return b.runKernel(La,r,s)}const en=m({stack_:Zb});/**
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
 */function Jb(e,t=0){const r={x:d(e,"x","step")},s={alpha:t};return b.runKernel(Wi,r,s)}const au=m({step_:Jb});/**
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
 */function Yb(e,t,n,r,s=0,o=0,a=0,i=0,c=0){const h={x:d(e,"x","stridedSlice","string_or_numeric")},l={begin:t,end:n,strides:r,beginMask:s,endMask:o,ellipsisMask:a,newAxisMask:i,shrinkAxisMask:c};return b.runKernel(Ti,h,l)}const Qb=m({stridedSlice_:Yb});/**
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
 */function tw(e){const n={x:d(e,"x","tan","float32")};return b.runKernel(Mi,n)}const ew=m({tan_:tw});/**
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
 */function kt(e,t){de(e);const n=Dt(e,t);if(n.length!==1)throw new Error("tensor1d() requires values to be a flat/TypedArray");return Zt(e,null,n,t)}/**
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
 */function We(e,t,n){if(de(e),t!=null&&t.length!==2)throw new Error("tensor2d() requires shape to have two numbers");const r=Dt(e,n);if(r.length!==2&&r.length!==1)throw new Error("tensor2d() requires values to be number[][] or flat/TypedArray");if(r.length===1&&t==null)throw new Error("tensor2d() requires shape to be provided when `values` are a flat/TypedArray");return Zt(e,t,r,n)}/**
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
 */function iu(e,t,n){if(de(e),t!=null&&t.length!==3)throw new Error("tensor3d() requires shape to have three numbers");const r=Dt(e,n);if(r.length!==3&&r.length!==1)throw new Error("tensor3d() requires values to be number[][][] or flat/TypedArray");if(r.length===1&&t==null)throw new Error("tensor3d() requires shape to be provided when `values` are a flat array");return Zt(e,t,r,n)}/**
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
 */function nw(e,t,n){if(de(e),t!=null&&t.length!==4)throw new Error("tensor4d() requires shape to have four numbers");const r=Dt(e,n);if(r.length!==4&&r.length!==1)throw new Error("tensor4d() requires values to be number[][][][] or flat/TypedArray");if(r.length===1&&t==null)throw new Error("tensor4d() requires shape to be provided when `values` are a flat array");return Zt(e,t,r,n)}/**
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
 */function rw(e,t,n){if(de(e),t!=null&&t.length!==5)throw new Error("tensor5d() requires shape to have five numbers");const r=Dt(e,n);if(r.length!==5&&r.length!==1)throw new Error("tensor5d() requires values to be number[][][][][] or flat/TypedArray");if(r.length===1&&t==null)throw new Error("tensor5d() requires shape to be provided when `values` are a flat array");return Zt(e,t,r,n)}/**
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
 */function sw(e,t,n){if(de(e),t!=null&&t.length!==6)throw new Error("tensor6d() requires shape to have six numbers");const r=Dt(e,n);if(r.length!==6&&r.length!==1)throw new Error("tensor6d() requires values to be number[][][][][][] or flat/TypedArray");if(r.length===1&&t==null)throw new Error("tensor6d() requires shape to be provided when `values` are a flat array");return t=t||r,Zt(e,t,r,n)}function os(e,t,n){const r=t.rank>1?t.shape[t.rank-1]:1,s=t.rank>1?t.rank-1:1,o=`Must have updates.shape = indices.shape[:batchDim] + shape[sliceDim:], got updates.shape: ${n.shape}, indices.shape: ${t.shape}, shape: ${e}, sliceDim: ${r}, and batchDim: ${s}.`;if(n.rank<s)throw new Error(o+` update.rank < ${s}. `);if(e.length<r+(n.rank-s))throw new Error(o+` Output shape length < ${r+(n.rank-s)}`);if(n.rank!==s+e.length-r)throw new Error(o+` update.rank != ${s+e.length-r}`);for(let a=0;a<s;++a)if(n.shape[a]!==t.shape[a])throw new Error(o+` updates.shape[${a}] (${n.shape[a]}) != indices.shape[${a}] (${t.shape[a]}).`);for(let a=0;a<n.rank-s;++a)if(n.shape[a+s]!==e[a+r])throw new Error(o+` updates.shape[${a+s}] (${n.shape[a+s]}) != shape[${a+s}] (${e[a+s]})`)}function Un(e,t,n){if(t.rank<1)throw new Error(`tf.scatterND() expects the indices to be rank 1 or higher, but the rank was ${t.rank}.`);if(e.rank<1)throw new Error(`tf.scatterND() expects the updates to be rank 1 or higher, but the rank was ${e.rank}.`);if(t.dtype!=="int32")throw new Error(`The dtype of 'indices' should be int32, but got dtype: ${t.dtype}`);if(n.length<1)throw new Error(`Output rank must be greater or equal to 1, but got shape: ${n}`);if(n.length===0){if(t.size===0)throw new Error(`Indices specified for empty output. indices shape: ${t.shape}`);if(e.size===0)throw new Error(`Updates specified for empty output. updates shape: ${e.shape}`)}os(n,t,e)}function cu(e,t,n){const r=t.shape.length,s=r>1?t.shape[r-1]:1,o=n.length;let a=1;for(let l=s;l<o;++l)a*=n[l];const i=s<1?1:s,c=W(t.shape)/i,u=[...Fe(n.slice(0,s)),1],h=W(n);return{sliceRank:s,numUpdates:c,sliceSize:a,strides:u,outputSize:h}}const ow=Object.freeze(Object.defineProperty({__proto__:null,calculateShapes:cu,validateInput:Un,validateUpdateShape:os},Symbol.toStringTag,{value:"Module"}));/**
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
 */function aw(e,t,n){const r=d(e,"tensor","tensorScatterupdate"),s=d(t,"indices","tensorScatterupdate","int32"),o=d(n,"updates","tensorScatterupdate");if(Un(o,s,r.shape),r.dtype!==o.dtype)throw new Error(`tensor and updates must have the same dtype, instead they are ${r.dtype} and ${o.dtype}.`);const a={tensor:r,indices:s,updates:o},i={};return b.runKernel(oi,a,i)}const iw=m({tensorScatterUpdate_:aw});/**
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
 */function cw(e,t=1,n=!0){const r=d(e,"x","topk");if(r.rank===0)throw new Error("topk() expects the input to be of rank 1 or higher");const s=r.shape[r.shape.length-1];if(t<0)throw new Error(`'k' passed to topk() must be >= 0 but got ${t}`);if(t>s)throw new Error(`'k' passed to topk() must be <= the last dimension (${s}) but got ${t}`);const o={x:r},a={k:t,sorted:n},[i,c]=b.runKernel(Bi,o,a);return{values:i,indices:c}}const uw=m({topk_:cw});/**
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
 */function lw(e,t=0,n=1,r,s){if(pt(e),r!=null&&r==="bool")throw new Error("Unsupported data type $ { dtype }");const o=new ts(t,n,r,!0,s),a=Bt(e,r);for(let i=0;i<a.values.length;i++)a.values[i]=o.nextValue();return a.toTensor()}const hw=m({truncatedNormal_:lw});/**
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
 */function fw(e,t=0){const n=d(e,"x","unique","string_or_numeric");g(n.rank>0,()=>"The input tensor must be at least 1D");const r={x:n},s={axis:t},[o,a]=b.runKernel(Ci,r,s);return{values:o,indices:a}}const dw=m({unique_:fw});/**
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
 */function pw(e,t,n){const r=d(e,"x","unsortedSegmentSum"),s=d(t,"segmentIds","unsortedSegmentSum","int32");g(_e(n),()=>"numSegments must be of dtype int");const o={x:r,segmentIds:s},a={numSegments:n};return b.runKernel(Oi,o,a)}const gw=m({unsortedSegmentSum_:pw});/**
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
 */function mw(e,t=0){const n=d(e,"x","unstack","string_or_numeric");g(t>=-n.shape.length&&t<n.shape.length,()=>`Axis = ${t} is not in [-${n.shape.length}, ${n.shape.length})`);const r={value:n},s={axis:t};return b.runKernel(Pi,r,s)}const as=m({unstack_:mw});/**
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
 */function bw(e,t){return zr(e,t,"right")}/**
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
 */function ww(e,t=!0,n,r){return b.makeVariable(e,t,n,r)}/**
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
 */function uu(e,t){const n=[];for(let o=0;o<t.length;o++)t[o]&&n.push(o);const r=Bt(e,"int32"),s=Bt([n.length,e.length],"int32");for(let o=0;o<n.length;o++){const a=r.indexToLoc(n[o]),i=o*e.length;s.values.set(a,i)}return s.toTensor()}/**
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
 */async function yw(e){const t=d(e,"condition","whereAsync","bool"),n=await t.data(),r=uu(t.shape,n);return e!==t&&t.dispose(),r}const lu=yw;/**
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
 */async function $w(e,t,n){const r=d(e,"tensor","boolMask"),s=d(t,"mask","boolMask","bool"),o=n??0,a=s.rank,i=r.shape;g(a>0,()=>"mask cannot be scalar"),ct(i.slice(o,o+a),s.shape,"mask's shape must match the first K dimensions of tensor's shape,");let c=1;for(let y=o;y<o+a;y++)c*=i[y];const u=i.slice(0,o).concat([c],i.slice(o+a)),h=E(r,u),l=E(s,[-1]),f=await lu(l),p=ss(f,[1]),w=Oc(h,p,o);return e!==r&&r.dispose(),t!==s&&s.dispose(),p.dispose(),h.dispose(),l.dispose(),f.dispose(),w}const Ew=$w;/**
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
 */function kw(e,t,n){const r=d(e,"x","transpose");if(t==null&&(t=r.shape.map((a,i)=>i).reverse()),g(r.rank===t.length,()=>`Error in transpose: rank of input ${r.rank} must match length of perm ${t}.`),t.forEach(a=>{g(a>=0&&a<r.rank,()=>`All entries in 'perm' must be between 0 and ${r.rank-1} but got ${t}`)}),r.rank<=1)return r.clone();const s={x:r},o={perm:t};return r.dtype==="complex64"?tt(()=>{let a=Qe(r),i=On(r);return a=b.runKernel(pn,{x:a},o),i=b.runKernel(pn,{x:i},o),n&&(i=At(i)),Ht(a,i)}):b.runKernel(pn,s,o)}const An=m({transpose_:kw});/**
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
 */function xw(e,t,n,r,s=!0){const o=d(e,"v","movingAverage"),a=d(t,"x","movingAverage"),i=d(n,"decay","movingAverage");nc(o,a),g(Ct(o.shape,a.shape),()=>"Shape mismatch in v and x");const c=q(1),u=P(c,i);let h=T(P(a,o),u);if(s){g(r!=null,()=>"When using zeroDebias: true, step is required.");const l=d(r,"step","movingAverage");h=K(h,P(c,Ze(i,l)))}return F(o,h)}const vw=m({movingAverage_:xw});/**
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
 */function Sw(e,t,n){pt(n);const r=d(e,"indices","scatterND","int32"),s=d(t,"updates","scatterND");Un(s,r,n);const o={indices:r,updates:s},a={shape:n};return b.runKernel(si,o,a)}const Iw=m({scatterND_:Sw});function Tw(e,t,n,r){if(e.dtype!=="int32")throw new Error(`tf.sparseToDense() expects the indices to be int32 type, but the dtype was ${e.dtype}.`);if(e.rank>2)throw new Error(`sparseIndices should be a scalar, vector, or matrix, but got shape ${e.shape}.`);const s=e.rank>0?e.shape[0]:1,o=e.rank>1?e.shape[1]:1;if(n.length!==o)throw new Error(`outputShape has incorrect number of elements:, ${n.length}, should be: ${o}.`);const a=t.size;if(!(t.rank===0||t.rank===1&&a===s))throw new Error(`sparseValues has incorrect shape ${t.shape}, should be [] or [${s}]`);if(t.dtype!==r.dtype)throw new Error("sparseValues.dtype must match defaultValues.dtype")}/**
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
 */function _w(e,t,n,r=0){pt(n);const s=d(e,"sparseIndices","sparseToDense","int32"),o=d(t,"sparseValues","sparseToDense","string_or_numeric"),a=d(r,"defaultValue","sparseToDense",o.dtype);Tw(s,o,n,a);const i={sparseIndices:s,sparseValues:o,defaultValue:a},c={outputShape:n};return b.runKernel(vi,i,c)}const Aw=m({sparseToDense_:_w});/**
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
 */function Dw(e,t){const n=d(t,"indices","gatherND","int32"),s={params:d(e,"x","gatherND","string_or_numeric"),indices:n};return b.runKernel(na,s)}const Nw=m({gatherND_:Dw});/**
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
 */function Mw(e,t){if(t==null)return e.shape.slice();if(Ct(e.shape,t))return t;if(e.shape.length===t.length){const n=[];for(let r=0;r<e.shape.length;r++)t[r]==null&&e.shape[r]!=null?n.push(e.shape[r]):n.push(t[r]);return n}return t}/**
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
 */function Fw(e,t,n,r){const s=d(e,"x","dropout");if(g(s.dtype==="float32",()=>`x has to be a floating point tensor since it's going to be scaled, but got a ${s.dtype} tensor instead.`),g(t>=0&&t<1,()=>`rate must be a float in the range [0, 1), but got ${t}.`),t===0)return e instanceof Q?s.clone():s;const o=Mw(s,n),a=1-t,i=K(Pc(F(es(o,0,1,"float32",r),a)),a);return T(s,i)}const Bw=m({dropout_:Fw});/**
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
 */function hu(e){return Math.floor(Math.pow(2,Math.ceil(Math.log(e)/Math.log(2))))}function is(e,t,n){const r=1-e%2,s=new Float32Array(e);for(let o=0;o<e;++o){const a=2*Math.PI*o/(e+r-1);s[o]=t-n*Math.cos(a)}return kt(s,"float32")}/**
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
 */async function Rw(e,t,n=1){const r=d(e,"predictions","inTopK"),s=d(t,"targets","inTopK");g(r.rank>1,()=>`inTopK() expects the predictions to be of rank 2 or higher, but got ${r.rank}`),g(r.rank-1===s.rank,()=>`predictions rank should be 1 larger than targets rank, but got predictions rank ${r.rank} and targets rank ${s.rank}`),ct(r.shape.slice(0,r.shape.length-1),s.shape,"predictions's shape should be align with the targets' shape, except the last dimension.");const o=r.shape[r.shape.length-1];g(n>0&&n<=o,()=>`'k' passed to inTopK() must be > 0 && <= the predictions last dimension (${o}), but got ${n}`);const a=await r.data(),i=await s.data(),[c,u]=[a.length/o,o],h=Gs("bool",c);for(let l=0;l<c;l++){const f=l*u,p=a.subarray(f,f+u),w=[];for(let y=0;y<p.length;y++)w.push({value:p[y],index:y});w.sort((y,$)=>$.value-y.value),h[l]=0;for(let y=0;y<n;y++)if(w[y].index===i[l]){h[l]=1;break}}return e!==r&&r.dispose(),t!==s&&s.dispose(),xe(h,s.shape,"bool")}const Cw=Rw;/**
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
 */function Pw(e,t,n,r,s,o="NHWC",a){let i=e;e.rank===3&&(i=E(e,[1,e.shape[0],e.shape[1],e.shape[2]]));let c=t;c.rank===3&&(c=E(t,[1,t.shape[0],t.shape[1],t.shape[2]])),g(i.rank===4,()=>`Error in conv2dDerFilter: input must be rank 4, but got shape ${i.shape}.`),g(c.rank===4,()=>`Error in conv2dDerFilter: dy must be rank 4, but got shape ${c.shape}.`),g(n.length===4,()=>`Error in conv2dDerFilter: filterShape must be length 4, but got ${n}.`);const u=o==="NHWC"?i.shape[3]:i.shape[1],h=o==="NHWC"?c.shape[3]:c.shape[1];g(u===n[2],()=>`Error in conv2dDerFilter: depth of input ${u}) must match input depth in filter (${n[2]}.`),g(h===n[3],()=>`Error in conv2dDerFilter: depth of dy (${h}) must match output depth for filter (${n[3]}).`),xt("conv2dDerFilter",s,a);const l={x:i,dy:c},f={strides:r,pad:s,dataFormat:o,dimRoundingMode:a,filterShape:n};return b.runKernel(So,l,f)}const Ow=m({conv2DBackpropFilter_:Pw});/**
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
 */function qn(e,t,n){if(n==null||n==="linear")return e;if(n==="relu")return T(e,au(t));throw new Error(`Cannot compute gradient for fused activation ${n}.`)}function Gn(e,t){let n=t;const r=Ur(e.shape,t.shape);return r.length>0&&(n=z(n,r)),E(n,e.shape)}function zn(e,t,n,r){if(t==="linear")return e;if(t==="relu")return Wn(e);if(t==="elu")return Fc(e);if(t==="relu6")return nu(e);if(t==="prelu")return Jc(e,n);if(t==="leakyrelu")return Wc(e,r);if(t==="sigmoid")return Ie(e);throw new Error(`Unknown fused activation ${t}.`)}const Kn=(e,t)=>!(e>0)||t==="linear";/**
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
 */function Lw({x:e,filter:t,strides:n,pad:r,dataFormat:s="NHWC",dilations:o=[1,1],dimRoundingMode:a,bias:i,activation:c="linear",preluActivationWeights:u,leakyreluAlpha:h}){if(c=c||"linear",Kn(b.state.gradientDepth,c)===!1){g(s==="NHWC",()=>`Error in fused conv2d: got dataFormat of ${s} but only NHWC is currently supported for the case of gradient depth is 0 and the activation is not linear.`);let _=Rn(e,t,n,r,s,o,a);return i!=null&&(_=F(_,i)),zn(_,c,u,h)}const l=d(e,"x","conv2d","float32"),f=d(t,"filter","conv2d","float32");let p=l,w=!1;l.rank===3&&(w=!0,p=E(l,[1,l.shape[0],l.shape[1],l.shape[2]])),g(p.rank===4,()=>`Error in fused conv2d: input must be rank 4, but got rank ${p.rank}.`),g(f.rank===4,()=>`Error in fused conv2d: filter must be rank 4, but got rank ${f.rank}.`),xt("fused conv2d",r,a);const y=s==="NHWC"?p.shape[3]:p.shape[1];g(f.shape[2]===y,()=>`Error in conv2d: depth of input (${y}) must match input depth for filter ${f.shape[2]}.`),g(Pt(n,o),()=>`Error in conv2D: Either strides or dilations must be 1. Got strides ${n} and dilations '${o}'`);const $=cn(p.shape,f.shape,n,o,r,a);let x;i!=null&&(x=d(i,"bias","fused conv2d"),[x]=Y(x,l),s==="NHWC"?et($.outShape,x.shape):(g(x.shape.length<=1,()=>`Error in fused conv2d: only supports scalar or 1-D Tensor bias for NCHW format but got the bias of rank-${x.shape.length}.`),g(x.shape.length===0||x.shape[0]===$.outChannels||x.shape[0]===1,()=>`Error in fused conv2d: bias shape (${x.shape}) is not compatible with the number of output channels (${$.outChannels})`)));let N;if(u!=null){const _=u.shape;if(g(_.length<=1||_.length===3,()=>`Error in fused conv2d: only supports scalar, 1-D Tensor or 3-D Tensor PReLU activation weights but got a tensor of rank-${_.length}.`),_.length===1)g(_[0]===1||_[0]===$.outChannels,()=>`Error in fused conv2d: PReLU activation weights (${_}) is not compatible with the number of output channels (${$.outChannels}).`);else if(_.length===3)try{et(_,$.outShape)}catch{const A=`Error in fused conv2d: PReLU activation weights (${_}) is not compatible with the output shape of the conv2d (${$.outShape}).`;throw Error(A)}N=d(u,"prelu weights","fused conv2d")}const k=(_,M)=>{g(s==="NHWC",()=>`Error in gradient of fused conv2D: got dataFormat of ${s} but only NHWC is currently supported.`);const[A,D,C,B]=M,O=qn(_,C,c);g(Xe(o),()=>`Error in gradient of fused conv2D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${o}'`);const U=Dc(D.shape,O,A,n,r),X=Ow(D,O,A.shape,n,r),nt=[U,X];if(B!=null){const wt=Gn(B,O);nt.push(wt)}return nt},v={x:p,filter:f,bias:x,preluActivationWeights:N},I={strides:n,pad:r,dataFormat:s,dilations:o,dimRoundingMode:a,activation:c,leakyreluAlpha:h};return i==null?Nt((M,A,D)=>{let C=b.runKernel(er,v,I);return D([A,M,C]),w&&(C=E(C,[C.shape[1],C.shape[2],C.shape[3]])),{value:C,gradFunc:k}})(p,f):Nt((M,A,D,C)=>{let B=b.runKernel(er,v,I);return C([A,M,B,D]),w&&(B=E(B,[B.shape[1],B.shape[2],B.shape[3]])),{value:B,gradFunc:k}})(p,f,x)}const Ww=m({fusedConv2d_:Lw});/**
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
 */function Uw(e,t,n,r,s,o=[1,1],a){let i=e;e.rank===3&&(i=E(e,[1,e.shape[0],e.shape[1],e.shape[2]]));let c=t;c.rank===3&&(c=E(t,[1,t.shape[0],t.shape[1],t.shape[2]]));const u={x:i,dy:c},h={strides:r,pad:s,dimRoundingMode:a,dilations:o,filterShape:n};return b.runKernel(Po,u,h)}const qw=m({depthwiseConv2dNativeBackpropFilter_:Uw});/**
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
 */function Gw(e,t,n,r,s,o=[1,1],a){let i=t,c=!1;t.rank===3&&(c=!0,i=E(t,[1,t.shape[0],t.shape[1],t.shape[2]]));const u={dy:i,filter:n},h={strides:r,pad:s,dimRoundingMode:a,dilations:o,inputShape:e},l=b.runKernel(Oo,u,h);return c?E(l,[l.shape[1],l.shape[2],l.shape[3]]):l}const zw=m({depthwiseConv2dNativeBackpropInput_:Gw});/**
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
 */function Kw({x:e,filter:t,strides:n,pad:r,dataFormat:s="NHWC",dilations:o=[1,1],dimRoundingMode:a,bias:i,activation:c="linear",preluActivationWeights:u,leakyreluAlpha:h}){if(Kn(b.state.gradientDepth,c)===!1){let I=Wr(e,t,n,r,s,o,a);return i!=null&&(I=F(I,i)),zn(I,c,u,h)}const l=d(e,"x","depthwiseConv2d","float32"),f=d(t,"filter","depthwiseConv2d","float32");let p=l,w=!1;l.rank===3&&(w=!0,p=E(l,[1,l.shape[0],l.shape[1],l.shape[2]])),g(p.rank===4,()=>`Error in fused depthwiseConv2d: input must be rank 4, but got rank ${p.rank}.`),g(f.rank===4,()=>`Error in fused depthwiseConv2d: filter must be rank 4, but got rank ${f.rank}.`),g(p.shape[3]===f.shape[2],()=>`Error in fused depthwiseConv2d: number of input channels (${p.shape[3]}) must match the inChannels dimension in filter ${f.shape[2]}.`),o==null&&(o=[1,1]),g(Pt(n,o),()=>`Error in fused depthwiseConv2d: Either strides or dilations must be 1. Got strides ${n} and dilations '${o}'`),xt("fused depthwiseConv2d",r,a);const y=cn(p.shape,f.shape,n,o,r,a,!0);let $;i!=null&&($=d(i,"bias","fused conv2d"),[$]=Y($,l),et(y.outShape,$.shape));let x;u!=null&&(x=d(u,"prelu weights","fused depthwiseConv2d"));const N=(I,_)=>{g(Xe(o),()=>`Error in gradient of fused depthwiseConv2d: dilation rates greater than 1 are not yet supported. Got dilations '${o}'`);const[M,A,D,C]=_,B=qn(I,D,c),O=zw(A.shape,B,M,n,r,o,a),U=qw(A,B,M.shape,n,r,o,a);if(C!=null){const X=Gn($,B);return[O,U,X]}return[O,U]},k={x:p,filter:f,bias:$,preluActivationWeights:x},v={strides:n,pad:r,dataFormat:s,dilations:o,dimRoundingMode:a,activation:c,leakyreluAlpha:h};return i==null?Nt((_,M,A)=>{let D=b.runKernel(nr,k,v);return A([M,_,D]),w&&(D=E(D,[D.shape[1],D.shape[2],D.shape[3]])),{value:D,gradFunc:N}})(p,f):Nt((_,M,A,D)=>{let C=b.runKernel(nr,k,v);return D([M,_,C,A]),w&&(C=E(C,[C.shape[1],C.shape[2],C.shape[3]])),{value:C,gradFunc:N}})(p,f,$)}const Vw=m({fusedDepthwiseConv2d_:Kw});/**
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
 */function jw({a:e,b:t,transposeA:n=!1,transposeB:r=!1,bias:s,activation:o="linear",preluActivationWeights:a,leakyreluAlpha:i=.2}){if(Kn(b.state.gradientDepth,o)===!1){let B=L(e,t,n,r);return s!=null&&(B=F(B,s)),zn(B,o,a,i)}let c=d(e,"a","fused matMul"),u=d(t,"b","fused matMul");[c,u]=Y(c,u);const h=n?c.shape[c.rank-2]:c.shape[c.rank-1],l=r?u.shape[u.rank-1]:u.shape[u.rank-2],f=n?c.shape[c.rank-1]:c.shape[c.rank-2],p=r?u.shape[u.rank-2]:u.shape[u.rank-1],w=c.shape.slice(0,-2),y=u.shape.slice(0,-2),$=W(w),x=W(y);g(h===l,()=>`Error in fused matMul: inner shapes (${h}) and (${l}) of Tensors with shapes ${c.shape} and ${u.shape} and transposeA=${n} and transposeB=${r} must match.`);const k=et(c.shape.slice(0,-2),u.shape.slice(0,-2)).concat([f,p]),v=n?E(c,[$,h,f]):E(c,[$,f,h]),I=r?E(u,[x,p,l]):E(u,[x,l,p]);let _;s!=null&&(_=d(s,"bias","fused matMul"),[_]=Y(_,c),et(k,_.shape));let M;a!=null&&(M=d(a,"prelu weights","fused matMul"));const A=(B,O)=>{const[U,X,nt,wt]=O,Mt=qn(E(B,nt.shape),nt,o);let me,be;if(!n&&!r?(me=L(Mt,X,!1,!0),be=L(U,Mt,!0,!1)):!n&&r?(me=L(Mt,X,!1,!1),be=L(Mt,U,!0,!1)):n&&!r?(me=L(X,Mt,!1,!0),be=L(U,Mt,!1,!1)):(me=L(X,Mt,!0,!0),be=L(Mt,U,!0,!0)),s!=null){const Pu=Gn(wt,Mt);return[me,be,Pu]}else return[me,be]},D={a:v,b:I,bias:_,preluActivationWeights:M},C={transposeA:n,transposeB:r,activation:o,leakyreluAlpha:i};return s==null?Nt((O,U,X)=>{const nt=b.runKernel(tr,D,C);return X([O,U,nt]),{value:E(nt,k),gradFunc:A}})(v,I):Nt((O,U,X,nt)=>{const wt=b.runKernel(tr,D,C);return nt([O,U,wt,X]),{value:E(wt,k),gradFunc:A}})(v,I,_)}const Hw=m({fusedMatMul_:jw});/**
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
 */const Xw=Object.freeze(Object.defineProperty({__proto__:null,conv2d:Ww,depthwiseConv2d:Vw,matMul:Hw},Symbol.toStringTag,{value:"Module"}));/**
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
 */function Zw(e){return is(e,.54,.46)}const Jw=m({hammingWindow_:Zw});/**
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
 */function Yw(e){return is(e,.5,.5)}const fu=m({hannWindow_:Yw});/**
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
 */function Qw(e,t,n,r=!1,s=0){let o=0;const a=[];for(;o+t<=e.size;)a.push(Z(e,o,t)),o+=n;if(r)for(;o<e.size;){const i=o+t-e.size,c=dt([Z(e,o,t-i),un([i],s)]);a.push(c),o+=n}return a.length===0?We([],[0,t]):E(dt(a),[a.length,t])}const du=m({frame_:Qw});/**
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
 */function t0(e,t,n,r,s=fu){r==null&&(r=hu(t));const o=du(e,t,n),a=T(o,s(t));return rs(a,r)}const e0=m({stft_:t0});/**
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
 */function n0(e,t,n,r,s="bilinear",o=0){const a=d(e,"image","cropAndResize"),i=d(t,"boxes","cropAndResize","float32"),c=d(n,"boxInd","cropAndResize","int32"),u=i.shape[0];g(a.rank===4,()=>`Error in cropAndResize: image must be rank 4,but got rank ${a.rank}.`),g(i.rank===2&&i.shape[1]===4,()=>`Error in cropAndResize: boxes must be have size [${u},4] but had shape ${i.shape}.`),g(c.rank===1&&c.shape[0]===u,()=>`Error in cropAndResize: boxInd must be have size [${u}] but had shape ${i.shape}.`),g(r.length===2,()=>`Error in cropAndResize: cropSize must be of length 2, but got length ${r.length}.`),g(r[0]>=1&&r[1]>=1,()=>`cropSize must be atleast [1,1], but was ${r}`),g(s==="bilinear"||s==="nearest",()=>`method must be bilinear or nearest, but was ${s}`);const h={image:a,boxes:i,boxInd:c},l={method:s,extrapolationValue:o,cropSize:r};return b.runKernel(Fo,h,l)}const r0=m({cropAndResize_:n0});/**
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
 */function s0(e){const t=d(e,"image","flipLeftRight","float32");g(t.rank===4,()=>`Error in flipLeftRight: image must be rank 4,but got rank ${t.rank}.`);const n={image:t};return b.runKernel(Jo,n,{})}const o0=m({flipLeftRight_:s0});/**
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
 */function a0(e){const t=d(e,"image","grayscaleToRGB"),n=t.rank-1,r=t.shape[n];g(t.rank>=2,()=>`Error in grayscaleToRGB: images must be at least rank 2, but got rank ${t.rank}.`),g(r===1,()=>`Error in grayscaleToRGB: last dimension of a grayscale image should be size 1, but got size ${r}.`);const s=new Array(t.rank);return s.fill(1,0,n),s[n]=3,Le(t,s)}const i0=m({grayscaleToRGB_:a0});/**
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
 */function c0(e){const t=d(e,"image","RGBToGrayscale"),n=t.rank-1,r=t.shape[n];g(t.rank>=2,()=>`Error in RGBToGrayscale: images must be at least rank 2, but got rank ${t.rank}.`),g(r===3,()=>`Error in RGBToGrayscale: last dimension of an RGB image should be size 3, but got size ${r}.`);const s=t.dtype,o=H(t,"float32"),a=kt([.2989,.587,.114]);let i;switch(t.rank){case 2:i=$e("ij,j->i",o,a);break;case 3:i=$e("ijk,k->ij",o,a);break;case 4:i=$e("ijkl,l->ijk",o,a);break;case 5:i=$e("ijklm,m->ijkl",o,a);break;case 6:i=$e("ijklmn,n->ijklm",o,a);break;default:throw new Error("Not a valid tensor rank.")}return i=Lt(i,-1),H(i,s)}const u0=m({rgbToGrayscale_:c0});/**
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
 */function l0(e,t,n=0,r=.5){const s=d(e,"image","rotateWithOffset","float32");g(s.rank===4,()=>`Error in rotateWithOffset: image must be rank 4,but got rank ${s.rank}.`);const o={image:s},a={radians:t,fillValue:n,center:r};return b.runKernel(Ui,o,a)}const h0=m({rotateWithOffset_:l0});/**
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
 */function Be(e,t,n,r,s,o){r==null&&(r=.5),s==null&&(s=Number.NEGATIVE_INFINITY),o==null&&(o=0);const a=e.shape[0];return n=Math.min(n,a),g(0<=r&&r<=1,()=>`iouThreshold must be in [0, 1], but was '${r}'`),g(e.rank===2,()=>`boxes must be a 2D tensor, but was of rank '${e.rank}'`),g(e.shape[1]===4,()=>`boxes must have 4 columns, but 2nd dimension was ${e.shape[1]}`),g(t.rank===1,()=>"scores must be a 1D tensor"),g(t.shape[0]===a,()=>`scores has incompatible shape with boxes. Expected ${a}, but was ${t.shape[0]}`),g(0<=o&&o<=1,()=>`softNmsSigma must be in [0, 1], but was '${o}'`),{maxOutputSize:n,iouThreshold:r,scoreThreshold:s,softNmsSigma:o}}/**
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
 */function f0(e,t,n,r=.5,s=Number.NEGATIVE_INFINITY){const o=d(e,"boxes","nonMaxSuppression","float32"),a=d(t,"scores","nonMaxSuppression","float32"),i=Be(o,a,n,r,s);n=i.maxOutputSize,r=i.iouThreshold,s=i.scoreThreshold;const c={maxOutputSize:n,iouThreshold:r,scoreThreshold:s};return b.runKernel(Ba,{boxes:o,scores:a},c)}const d0=m({nonMaxSuppression_:f0});/**
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
 */function p0(e,t,n){const r=g0(e,t,n),s=r<0?-(r+1):r;e.splice(s,0,t)}function g0(e,t,n){return b0(e,t,n||m0)}function m0(e,t){return e>t?1:e<t?-1:0}function b0(e,t,n){let r=0,s=e.length,o=0,a=!1;for(;r<s;){o=r+(s-r>>>1);const i=n(t,e[o]);i>0?r=o+1:(s=o,a=!i)}return a?r:-r-1}/**
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
 */function pu(e,t,n,r,s){return cs(e,t,n,r,s,0)}function gu(e,t,n,r,s,o){return cs(e,t,n,r,s,0,!1,o,!0)}function mu(e,t,n,r,s,o){return cs(e,t,n,r,s,o,!0)}function cs(e,t,n,r,s,o,a=!1,i=!1,c=!1){const u=[];for(let $=0;$<t.length;$++)t[$]>s&&u.push({score:t[$],boxIndex:$,suppressBeginIndex:0});u.sort(Ns);const h=o>0?-.5/o:0,l=[],f=[];for(;l.length<n&&u.length>0;){const $=u.pop(),{score:x,boxIndex:N,suppressBeginIndex:k}=$;if(x<s)break;let v=!1;for(let I=l.length-1;I>=k;--I){const _=w0(e,N,l[I]);if(_>=r){v=!0;break}if($.score=$.score*y0(r,h,_),$.score<=s)break}$.suppressBeginIndex=l.length,v||($.score===x?(l.push(N),f.push($.score)):$.score>s&&p0(u,$,Ns))}const p=l.length,w=n-p;i&&w>0&&(l.push(...new Array(w).fill(0)),f.push(...new Array(w).fill(0)));const y={selectedIndices:l};return a&&(y.selectedScores=f),c&&(y.validOutputs=p),y}function w0(e,t,n){const r=e.subarray(t*4,t*4+4),s=e.subarray(n*4,n*4+4),o=Math.min(r[0],r[2]),a=Math.min(r[1],r[3]),i=Math.max(r[0],r[2]),c=Math.max(r[1],r[3]),u=Math.min(s[0],s[2]),h=Math.min(s[1],s[3]),l=Math.max(s[0],s[2]),f=Math.max(s[1],s[3]),p=(i-o)*(c-a),w=(l-u)*(f-h);if(p<=0||w<=0)return 0;const y=Math.max(o,u),$=Math.max(a,h),x=Math.min(i,l),N=Math.min(c,f),k=Math.max(x-y,0)*Math.max(N-$,0);return k/(p+w-k)}function y0(e,t,n){const r=Math.exp(t*n*n);return n<=e?r:0}function Ns(e,t){return e.score-t.score||e.score===t.score&&t.boxIndex-e.boxIndex}/**
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
 */async function $0(e,t,n,r=.5,s=Number.NEGATIVE_INFINITY){const o=d(e,"boxes","nonMaxSuppressionAsync"),a=d(t,"scores","nonMaxSuppressionAsync"),i=Be(o,a,n,r,s);n=i.maxOutputSize,r=i.iouThreshold,s=i.scoreThreshold;const c=await Promise.all([o.data(),a.data()]),u=c[0],h=c[1],{selectedIndices:l}=pu(u,h,n,r,s);return o!==e&&o.dispose(),a!==t&&a.dispose(),kt(l,"int32")}const E0=$0;/**
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
 */function k0(e,t,n,r=.5,s=Number.NEGATIVE_INFINITY,o=0){const a=d(e,"boxes","nonMaxSuppression"),i=d(t,"scores","nonMaxSuppression"),c=Be(a,i,n,r,s,o);n=c.maxOutputSize,r=c.iouThreshold,s=c.scoreThreshold,o=c.softNmsSigma;const u={boxes:a,scores:i},h={maxOutputSize:n,iouThreshold:r,scoreThreshold:s,softNmsSigma:o},l=b.runKernel(Ca,u,h);return{selectedIndices:l[0],selectedScores:l[1]}}const x0=m({nonMaxSuppressionWithScore_:k0});/**
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
 */async function v0(e,t,n,r=.5,s=Number.NEGATIVE_INFINITY,o=0){const a=d(e,"boxes","nonMaxSuppressionAsync"),i=d(t,"scores","nonMaxSuppressionAsync"),c=Be(a,i,n,r,s,o);n=c.maxOutputSize,r=c.iouThreshold,s=c.scoreThreshold,o=c.softNmsSigma;const u=await Promise.all([a.data(),i.data()]),h=u[0],l=u[1],{selectedIndices:f,selectedScores:p}=mu(h,l,n,r,s,o);return a!==e&&a.dispose(),i!==t&&i.dispose(),{selectedIndices:kt(f,"int32"),selectedScores:kt(p)}}const S0=v0;/**
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
 */function I0(e,t,n,r=.5,s=Number.NEGATIVE_INFINITY,o=!1){const a=d(e,"boxes","nonMaxSuppression"),i=d(t,"scores","nonMaxSuppression"),c=Be(a,i,n,r,s,null),u=c.maxOutputSize,h=c.iouThreshold,l=c.scoreThreshold,f={boxes:a,scores:i},p={maxOutputSize:u,iouThreshold:h,scoreThreshold:l,padToMaxOutputSize:o},w=b.runKernel(Ra,f,p);return{selectedIndices:w[0],validOutputs:w[1]}}const T0=m({nonMaxSuppressionPadded_:I0});/**
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
 */async function _0(e,t,n,r=.5,s=Number.NEGATIVE_INFINITY,o=!1){const a=d(e,"boxes","nonMaxSuppressionAsync"),i=d(t,"scores","nonMaxSuppressionAsync"),c=Be(a,i,n,r,s,null),u=c.maxOutputSize,h=c.iouThreshold,l=c.scoreThreshold,[f,p]=await Promise.all([a.data(),i.data()]),{selectedIndices:w,validOutputs:y}=gu(f,p,u,h,l,o);return a!==e&&a.dispose(),i!==t&&i.dispose(),{selectedIndices:kt(w,"int32"),validOutputs:q(y,"int32")}}const A0=_0;/**
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
 */function D0(e,t,n=!1,r=!1){const s=d(e,"images","resizeBilinear");g(s.rank===3||s.rank===4,()=>`Error in resizeBilinear: x must be rank 3 or 4, but got rank ${s.rank}.`),g(t.length===2,()=>`Error in resizeBilinear: new shape must 2D, but got shape ${t}.`),g(r===!1||n===!1,()=>"Error in resizeBilinear: If halfPixelCenters is true, alignCorners must be false.");let o=s,a=!1;s.rank===3&&(a=!0,o=E(s,[1,s.shape[0],s.shape[1],s.shape[2]]));const i={images:o},c={alignCorners:n,halfPixelCenters:r,size:t},u=b.runKernel(Qa,i,c);return a?E(u,[u.shape[1],u.shape[2],u.shape[3]]):u}const N0=m({resizeBilinear_:D0});/**
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
 */function M0(e,t,n=!1,r=!1){const s=d(e,"images","resizeNearestNeighbor");g(s.rank===3||s.rank===4,()=>`Error in resizeNearestNeighbor: x must be rank 3 or 4, but got rank ${s.rank}.`),g(t.length===2,()=>`Error in resizeNearestNeighbor: new shape must 2D, but got shape ${t}.`),g(s.dtype==="float32"||s.dtype==="int32",()=>"`images` must have `int32` or `float32` as dtype"),g(r===!1||n===!1,()=>"Error in resizeNearestNeighbor: If halfPixelCenters is true, alignCorners must be false.");let o=s,a=!1;s.rank===3&&(a=!0,o=E(s,[1,s.shape[0],s.shape[1],s.shape[2]]));const i={images:o},c={alignCorners:n,halfPixelCenters:r,size:t},u=b.runKernel(Ya,i,c);return a?E(u,[u.shape[1],u.shape[2],u.shape[3]]):u}const F0=m({resizeNearestNeighbor_:M0});/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */function B0(e,t="binary",n=!1,r=.5){const s=d(e,"image","threshold"),o=.2989,a=.587,i=.114,c=s.shape[0]*s.shape[1];let u=T(kt([r]),255),h,l,f,p;if(g(s.rank===3,()=>`Error in threshold: image must be rank 3,but got rank ${s.rank}.`),g(s.shape[2]===3||s.shape[2]===1,()=>`Error in threshold: image color channel must be equal to 3 or 1but got ${s.shape[2]}.`),g(s.dtype==="int32"||s.dtype==="float32",()=>`Error in dtype: image dtype must be int32 or float32,but got dtype ${s.dtype}.`),g(t==="otsu"||t==="binary",()=>`Method must be binary or otsu, but was ${t}`),s.shape[2]===3){[h,l,f]=tn(s,[1,1,1],-1);const $=T(h,o),x=T(l,a),N=T(f,i);p=F(F($,x),N)}else p=e;if(t==="otsu"){const $=Ac(H(ru(p),"int32"),xe([]),256);u=R0($,c)}const w=n?Gr(p,u):Pn(p,u);return H(T(w,255),"int32")}function R0(e,t){let n=kt([-1]),r=kt([0]),s=kt([0]),o,a,i,c,u,h;for(let l=0;l<e.size-1;l++){o=Z(e,0,l+1),a=Z(e,l+1),u=K(z(o),t),h=K(z(a),t);const f=z(T(o,Ye(0,o.size)));i=K(f,z(o));const p=un(a.shape,o.size),w=F(Ye(0,a.size),p),y=T(a,w);c=K(z(y),z(a));const $=P(i,c),x=P(i,c),N=T(u,h);s=T(T(N,$),x);const k=Pn(s,r);r=Kt(k,s,r),n=Kt(k,kt([l]),n)}return n}const C0=m({threshold_:B0});/**
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
 */function P0(e,t,n="nearest",r="constant",s=0,o){const a=d(e,"image","transform","float32"),i=d(t,"transforms","transform","float32");g(a.rank===4,()=>`Error in transform: image must be rank 4,but got rank ${a.rank}.`),g(i.rank===2&&(i.shape[0]===a.shape[0]||i.shape[0]===1)&&i.shape[1]===8,()=>"Error in transform: Input transform should be batch x 8 or 1 x 8"),g(o==null||o.length===2,()=>`Error in transform: outputShape must be [height, width] or null, but got ${o}.`);const c={image:a,transforms:i},u={interpolation:n,fillMode:r,fillValue:s,outputShape:o};return b.runKernel(Ri,c,u)}const O0=m({transform_:P0});/**
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
 */function L0(e,t,n){const r=d(e,"a","bandPart");g(r.rank>=2,()=>`bandPart(): Rank must be at least 2, got ${r.rank}.`);const s=r.shape,[o,a]=r.shape.slice(-2);let i,c;typeof t=="number"?(g(t%1===0,()=>`bandPart(): numLower must be an integer, got ${t}.`),g(t<=o,()=>`bandPart(): numLower (${t}) must not be greater than the number of rows (${o}).`),i=d(t<0?o:t,"numLower","bandPart")):(g(t.dtype==="int32",()=>"bandPart(): numLower's dtype must be an int32."),i=Kt(yr(t,0),o,Tn(t,o))),typeof n=="number"?(g(n%1===0,()=>`bandPart(): numUpper must be an integer, got ${n}.`),g(n<=a,()=>`bandPart(): numUpper (${n}) must not be greater than the number of columns (${a}).`),c=d(n<0?a:n,"numUpper","bandPart")):(g(n.dtype==="int32",()=>"bandPart(): numUpper's dtype must be an int32."),c=Kt(yr(n,0),a,Tn(n,a)));const u=E(Ye(0,o,1,"int32"),[-1,1]),h=Ye(0,a,1,"int32"),l=P(u,h),f=Sn(Gr(l,i),Lc(l,At(c))),p=Me([o,a],r.dtype);return E(en(as(E(r,[-1,o,a])).map(w=>Kt(f,w,p))),s)}const W0=m({bandPart_:L0});/**
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
 */function U0(e){let t;if(Array.isArray(e)){t=!1,g(e!=null&&e.length>0,()=>"Gram-Schmidt process: input must not be null, undefined, or empty");const s=e[0].shape[0];for(let o=1;o<e.length;++o)g(e[o].shape[0]===s,()=>`Gram-Schmidt: Non-unique lengths found in the input vectors: (${e[o].shape[0]} vs. ${s})`)}else t=!0,e=tn(e,e.shape[0],0).map(s=>ss(s,[0]));g(e.length<=e[0].shape[0],()=>`Gram-Schmidt: Number of vectors (${e.length}) exceeds number of dimensions (${e[0].shape[0]}).`);const n=[],r=e;for(let s=0;s<e.length;++s)n.push(b.tidy(()=>{let o=r[s];if(s>0)for(let a=0;a<s;++a){const i=T(z(T(n[a],o)),n[a]);o=P(o,i)}return K(o,Cn(o,"euclidean"))}));return t?en(n,0):n}const q0=m({gramSchmidt_:U0});/**
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
 */function G0(e,t=!1){if(g(e.rank>=2,()=>`qr() requires input tensor to have a rank >= 2, but got rank ${e.rank}`),e.rank===2)return Ms(e,t);{const n=e.shape.slice(0,e.shape.length-2).reduce((c,u)=>c*u),r=as(E(e,[n,e.shape[e.shape.length-2],e.shape[e.shape.length-1]]),0),s=[],o=[];r.forEach(c=>{const[u,h]=Ms(c,t);s.push(u),o.push(h)});const a=E(en(s,0),e.shape),i=E(en(o,0),e.shape);return[a,i]}}function Ms(e,t=!1){return b.tidy(()=>{g(e.shape.length===2,()=>`qr2d() requires a 2D Tensor, but got a ${e.shape.length}D Tensor.`);const n=e.shape[0],r=e.shape[1];let s=Cc(n),o=se(e);const a=We([[1]],[1,1]);let i=se(a);const c=n>=r?r:n;for(let u=0;u<c;++u){const h=o,l=i,f=s;[i,o,s]=b.tidy(()=>{const p=Z(o,[u,u],[n-u,1]),w=Cn(p),y=Z(o,[u,u],[1,1]),$=Kt(Pn(y,0),We([[-1]]),We([[1]])),x=P(y,T($,w)),N=K(p,x);N.shape[0]===1?i=se(a):i=dt([a,Z(N,[1,0],[N.shape[0]-1,N.shape[1]])],0);const k=At(K(L($,x),w)),v=Z(o,[u,0],[n-u,r]),I=T(k,i),_=An(i);if(u===0)o=P(v,L(I,L(_,v)));else{const D=P(v,L(I,L(_,v)));o=dt([Z(o,[0,0],[u,r]),D],0)}const M=An(I),A=Z(s,[0,u],[n,s.shape[1]-u]);if(u===0)s=P(A,L(L(A,i),M));else{const D=P(A,L(L(A,i),M));s=dt([Z(s,[0,0],[n,u]),D],1)}return[i,o,s]}),ut([h,l,f])}return!t&&n>r&&(s=Z(s,[0,0],[n,r]),o=Z(o,[0,0],[r,r])),[s,o]})}const z0=m({qr_:G0});/**
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
 */var it;(function(e){e[e.NONE=0]="NONE",e[e.MEAN=1]="MEAN",e[e.SUM=2]="SUM",e[e.SUM_BY_NONZERO_WEIGHTS=3]="SUM_BY_NONZERO_WEIGHTS"})(it||(it={}));function K0(e,t,n=it.SUM_BY_NONZERO_WEIGHTS){const r=d(e,"losses","computeWeightedLoss");let s=null;t!=null&&(s=d(t,"weights","computeWeightedLoss"));const o=s==null?r:T(r,s);if(n===it.NONE)return o;if(n===it.SUM)return z(o);if(n===it.MEAN){if(s==null)return In(o);{const a=r.size/s.size,i=K(z(o),z(s));return a>1?K(i,q(a)):i}}if(n===it.SUM_BY_NONZERO_WEIGHTS){if(s==null)return K(z(o),q(r.size));{const a=T(s,re(r.shape)),i=H(z(Xc(a,q(0))),"float32");return K(z(o),i)}}throw Error(`Unknown reduction: ${n}`)}const Ot=m({computeWeightedLoss_:K0});/**
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
 */function V0(e,t,n,r=it.SUM_BY_NONZERO_WEIGHTS){const s=d(e,"labels","absoluteDifference"),o=d(t,"predictions","absoluteDifference");let a=null;n!=null&&(a=d(n,"weights","absoluteDifference")),ct(s.shape,o.shape,"Error in absoluteDifference: ");const i=mt(P(s,o));return Ot(i,a,r)}const j0=m({absoluteDifference_:V0});function H0(e,t,n,r,s=it.SUM_BY_NONZERO_WEIGHTS){const o=d(e,"labels","cosineDistance"),a=d(t,"predictions","cosineDistance");let i=null;r!=null&&(i=d(r,"weights","cosineDistance")),ct(o.shape,a.shape,"Error in cosineDistance: ");const c=q(1),u=P(c,z(T(o,a),n,!0));return Ot(u,i,s)}const X0=m({cosineDistance_:H0});function Z0(e,t,n,r=it.SUM_BY_NONZERO_WEIGHTS){let s=d(e,"labels","hingeLoss");const o=d(t,"predictions","hingeLoss");let a=null;n!=null&&(a=d(n,"weights","hingeLoss")),ct(s.shape,o.shape,"Error in hingeLoss: ");const i=q(1);s=P(T(q(2),s),i);const c=Wn(P(i,T(s,o)));return Ot(c,a,r)}const J0=m({hingeLoss_:Z0});/**
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
 */function Y0(e,t,n,r=1,s=it.SUM_BY_NONZERO_WEIGHTS){const o=d(e,"labels","huberLoss"),a=d(t,"predictions","huberLoss");let i=null;n!=null&&(i=d(n,"weights","huberLoss")),ct(o.shape,a.shape,"Error in huberLoss: ");const c=q(r),u=mt(P(a,o)),h=Tn(u,c),l=P(u,h),f=F(T(q(.5),St(h)),T(c,l));return Ot(f,i,s)}const Q0=m({huberLoss_:Y0});/**
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
 */function t1(e,t,n,r=1e-7,s=it.SUM_BY_NONZERO_WEIGHTS){const o=d(e,"labels","logLoss"),a=d(t,"predictions","logLoss");let i=null;n!=null&&(i=d(n,"weights","logLoss")),ct(o.shape,a.shape,"Error in logLoss: ");const c=q(1),u=q(r),h=At(T(o,Je(F(a,u)))),l=T(P(c,o),Je(F(P(c,a),u))),f=P(h,l);return Ot(f,i,s)}const e1=m({logLoss_:t1});/**
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
 */function n1(e,t,n,r=it.SUM_BY_NONZERO_WEIGHTS){const s=d(e,"labels","meanSquaredError"),o=d(t,"predictions","meanSquaredError");let a=null;n!=null&&(a=d(n,"weights","meanSquaredError")),ct(s.shape,o.shape,"Error in meanSquaredError: ");const i=ou(s,o);return Ot(i,a,r)}const r1=m({meanSquaredError_:n1});/**
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
 */function s1(e,t){const n=d(e,"labels","sigmoidCrossEntropyWithLogits"),r=d(t,"logits","sigmoidCrossEntropyWithLogits");ct(n.shape,r.shape,"Error in sigmoidCrossEntropyWithLogits: ");const s=Wn(r),o=T(r,n),a=Uc(ue(At(mt(r))));return F(P(s,o),a)}function o1(e,t,n,r=0,s=it.SUM_BY_NONZERO_WEIGHTS){let o=d(e,"multiClassLabels","sigmoidCrossEntropy");const a=d(t,"logits","sigmoidCrossEntropy");let i=null;if(n!=null&&(i=d(n,"weights","sigmoidCrossEntropy")),ct(o.shape,a.shape,"Error in sigmoidCrossEntropy: "),r>0){const u=q(r),h=q(1),l=q(.5);o=F(T(o,P(h,u)),T(l,u))}const c=s1(o,a);return Ot(c,i,s)}const a1=m({sigmoidCrossEntropy_:o1});/**
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
 */function i1(e,t,n=-1){if(n===-1&&(n=t.rank-1),n!==t.rank-1)throw Error(`Softmax cross entropy along a non-last dimension is not yet supported. Labels / logits was rank ${t.rank} and dim was ${n}`);return Nt((s,o,a)=>{const c=zc(o,[n],!0),u=P(H(o,"float32"),c);a([s,u]);const h=At(T(u,s));return{value:z(h,[n]),gradFunc:(p,w)=>{const[y,$]=w,x=ln(p.shape,[n]);return[T(E(p,x),P(H(y,"float32"),ue($))),T(E(p,x),P(ue($),H(y,"float32")))]}}})(e,t)}function c1(e,t,n,r=0,s=it.SUM_BY_NONZERO_WEIGHTS){let o=d(e,"onehotLabels","softmaxCrossEntropy");const a=d(t,"logits","softmaxCrossEntropy");let i=null;if(n!=null&&(i=d(n,"weights","softmaxCrossEntropy")),ct(o.shape,a.shape,"Error in softmaxCrossEntropy: "),r>0){const u=q(r),h=q(1),l=q(o.shape[1]);o=F(T(o,P(h,u)),K(u,l))}const c=i1(o,a);return Ot(c,i,s)}const u1=m({softmaxCrossEntropy_:c1});/**
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
 */function l1(e,t,n,r){const s=d(e,"indices","sparseFillEmptyRows","int32"),o=d(t,"values","sparseFillEmptyRows"),a=d(n,"denseShape","sparseFillEmptyRows","int32"),i=d(r,"defaultValue","sparseFillEmptyRows",o.dtype);if(s.rank!==2)throw new Error(`Indices should be Tensor2D but received shape
        ${s.shape}`);if(o.rank!==1)throw new Error(`Values should be Tensor1D but received shape ${o.shape}`);if(a.rank!==1)throw new Error(`Dense shape should be Tensor1D but received shape ${a.shape}`);if(i.rank!==0)throw new Error(`Default value should be a scalar but received shape ${i.shape}`);const c={indices:s,values:o,denseShape:a,defaultValue:i},u=b.runKernel($i,c);return{outputIndices:u[0],outputValues:u[1],emptyRowIndicator:u[2],reverseIndexMap:u[3]}}const h1=m({sparseFillEmptyRows_:l1});/**
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
 */function f1(e,t,n){const r=d(e,"inputIndices","sparseReshape","int32"),s=d(t,"inputShape","sparseReshape","int32"),o=d(n,"newShape","sparseReshape","int32");if(r.rank!==2)throw new Error(`Input indices should be Tensor2D but received shape
        ${r.shape}`);if(s.rank!==1)throw new Error(`Input shape should be Tensor1D but received shape ${s.shape}`);if(o.rank!==1)throw new Error(`New shape should be Tensor1D but received shape ${o.shape}`);const a={inputIndices:r,inputShape:s,newShape:o},i=b.runKernel(Ei,a);return{outputIndices:i[0],outputShape:i[1]}}const d1=m({sparseReshape_:f1});/**
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
 */function p1(e,t,n){const r=d(e,"data","sparseSegmentMean"),s=d(t,"indices","sparseSegmentMean","int32"),o=d(n,"segmentIds","sparseSegmentMean","int32");if(r.rank<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(s.rank!==1)throw new Error(`Indices should be Tensor1D but received shape
          ${s.shape}`);if(o.rank!==1)throw new Error(`Segment ids should be Tensor1D but received shape
          ${o.shape}`);const a={data:r,indices:s,segmentIds:o};return b.runKernel(ki,a)}const g1=m({sparseSegmentMean_:p1});/**
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
 */function m1(e,t,n){const r=d(e,"data","sparseSegmentSum"),s=d(t,"indices","sparseSegmentSum","int32"),o=d(n,"segmentIds","sparseSegmentSum","int32");if(r.rank<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(s.rank!==1)throw new Error(`Indices should be Tensor1D but received shape
         ${s.shape}`);if(o.rank!==1)throw new Error(`Segment ids should be Tensor1D but received shape
         ${o.shape}`);const a={data:r,indices:s,segmentIds:o};return b.runKernel(xi,a)}const b1=m({sparseSegmentSum_:m1});/**
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
 */function w1(e,t,n,r,s,o,a,i){const c=d(e,"data","stringNGrams","string");if(c.dtype!=="string")throw new Error("Data must be of datatype string");if(c.shape.length!==1)throw new Error(`Data must be a vector, saw: ${c.shape}`);const u=d(t,"dataSplits","stringNGrams");if(u.dtype!=="int32")throw new Error("Data splits must be of datatype int32");const h={separator:n,nGramWidths:r,leftPad:s,rightPad:o,padWidth:a,preserveShortSequences:i},l={data:c,dataSplits:u},f=b.runKernel(_i,l,h);return{nGrams:f[0],nGramsSplits:f[1]}}const y1=m({stringNGrams_:w1});/**
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
 */function $1(e,t,n=!0){const r=d(e,"input","stringSplit","string"),s=d(t,"delimiter","stringSplit","string");if(r.rank!==1)throw new Error(`Input should be Tensor1D but received shape ${r.shape}`);if(s.rank!==0)throw new Error(`Delimiter should be a scalar but received shape ${s.shape}`);const o={skipEmpty:n},a={input:r,delimiter:s},i=b.runKernel(Ai,a,o);return{indices:i[0],values:i[1],shape:i[2]}}const E1=m({stringSplit_:$1});/**
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
 */function k1(e,t){const n=d(e,"input","stringToHashBucketFast","string"),r={numBuckets:t};if(t<=0)throw new Error("Number of buckets must be at least 1");const s={input:n};return b.runKernel(Di,s,r)}const x1=m({stringToHashBucketFast_:k1});/**
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
 */function v1(e,t,n,r=!0){const s=d(e,"input","staticRegexReplace","string"),o={pattern:t,rewrite:n,replaceGlobal:r};return b.runKernel(Ii,{x:s},o)}const S1=m({staticRegexReplace_:v1});/**
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
 */const I1={fft:ns,ifft:_n,rfft:rs,irfft:su},T1={hammingWindow:Jw,hannWindow:fu,frame:du,stft:e0},_1={flipLeftRight:o0,grayscaleToRGB:i0,resizeNearestNeighbor:F0,resizeBilinear:N0,rgbToGrayscale:u0,rotateWithOffset:h0,cropAndResize:r0,nonMaxSuppression:d0,nonMaxSuppressionAsync:E0,nonMaxSuppressionWithScore:x0,nonMaxSuppressionWithScoreAsync:S0,nonMaxSuppressionPadded:T0,nonMaxSuppressionPaddedAsync:A0,threshold:C0,transform:O0},A1={bandPart:W0,gramSchmidt:q0,qr:z0},D1={absoluteDifference:j0,computeWeightedLoss:Ot,cosineDistance:X0,hingeLoss:J0,huberLoss:Q0,logLoss:e1,meanSquaredError:r1,sigmoidCrossEntropy:a1,softmaxCrossEntropy:u1},N1={sparseFillEmptyRows:h1,sparseReshape:d1,sparseSegmentMean:g1,sparseSegmentSum:b1},M1={stringNGrams:y1,stringSplit:E1,stringToHashBucketFast:x1,staticRegexReplace:S1};/**
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
 */const F1=new Map,kr=new Map;class bu{getClassName(){return this.constructor.className}static fromConfig(t,n){return new t(n)}}class Ut{constructor(){this.classNameMap={}}static getMap(){return Ut.instance==null&&(Ut.instance=new Ut),Ut.instance}static register(t){Ut.getMap().classNameMap[t.className]=[t,t.fromConfig]}}function wu(e,t,n){g(e.className!=null,()=>"Class being registered does not have the static className property defined."),g(typeof e.className=="string",()=>"className is required to be a string, but got type "+typeof e.className),g(e.className.length>0,()=>"Class being registered has an empty-string as its className, which is disallowed."),typeof t>"u"&&(t="Custom"),typeof n>"u"&&(n=e.className);const r=n,s=t+">"+r;return Ut.register(e),F1.set(s,e),kr.set(e,s),e}function B1(e){return kr.has(e)?kr.get(e):e.className}const R1=Object.freeze(Object.defineProperty({__proto__:null,Serializable:bu,SerializationMap:Ut,getRegisteredName:B1,registerClass:wu},Symbol.toStringTag,{value:"Module"}));/**
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
 */class Jt extends bu{minimize(t,n=!1,r){const{value:s,grads:o}=this.computeGradients(t,r);if(r!=null){const a=r.map(i=>({name:i.name,tensor:o[i.name]}));this.applyGradients(a)}else this.applyGradients(o);return ut(o),n?s:(s.dispose(),null)}get iterations(){return this.iterations_==null&&(this.iterations_=0),this.iterations_}incrementIterations(){this.iterations_=this.iterations+1}computeGradients(t,n){return qc(t,n)}dispose(){this.iterations_!=null&&ut(this.iterations_)}async saveIterations(){return this.iterations_==null&&(this.iterations_=0),{name:"iter",tensor:q(this.iterations_,"int32")}}async getWeights(){throw new Error("getWeights() is not implemented for this optimizer yet.")}async setWeights(t){throw new Error(`setWeights() is not implemented for this optimizer class ${this.getClassName()}`)}async extractIterations(t){return this.iterations_=(await t[0].tensor.data())[0],t.slice(1)}}Object.defineProperty(Jt,Symbol.hasInstance,{value:e=>e.minimize!=null&&e.computeGradients!=null&&e.applyGradients!=null});/**
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
 */class us extends Jt{static get className(){return"Adadelta"}constructor(t,n,r=null){super(),this.learningRate=t,this.rho=n,this.epsilon=r,this.accumulatedGrads=[],this.accumulatedUpdates=[],r==null&&(this.epsilon=b.backend.epsilon())}applyGradients(t){(Array.isArray(t)?t.map(r=>r.name):Object.keys(t)).forEach((r,s)=>{const o=b.registeredVariables[r],a=!1;this.accumulatedGrads[s]==null&&(this.accumulatedGrads[s]={originalName:`${r}/accum_grad`,variable:tt(()=>bt(o).variable(a))}),this.accumulatedUpdates[s]==null&&(this.accumulatedUpdates[s]={originalName:`${r}/accum_var`,variable:tt(()=>bt(o).variable(a))});const i=Array.isArray(t)?t[s].tensor:t[r];if(i==null)return;const c=this.accumulatedGrads[s].variable,u=this.accumulatedUpdates[s].variable;tt(()=>{const h=F(T(c,this.rho),T(St(i),1-this.rho)),l=T(K(Rt(F(u,this.epsilon)),Rt(F(c,this.epsilon))),i),f=F(T(u,this.rho),T(St(l),1-this.rho));c.assign(h),u.assign(f);const p=F(T(l,-this.learningRate),o);o.assign(p)})}),this.incrementIterations()}dispose(){this.accumulatedUpdates!=null&&(ut(this.accumulatedGrads.map(t=>t.variable)),ut(this.accumulatedUpdates.map(t=>t.variable)))}async getWeights(){const t=[...this.accumulatedGrads,...this.accumulatedUpdates];return[await this.saveIterations()].concat(t.map(n=>({name:n.originalName,tensor:n.variable})))}async setWeights(t){t=await this.extractIterations(t);const n=t.length/2,r=!1;this.accumulatedGrads=t.slice(0,n).map(s=>({originalName:s.name,variable:s.tensor.variable(r)})),this.accumulatedUpdates=t.slice(n,n*2).map(s=>({originalName:s.name,variable:s.tensor.variable(r)}))}getConfig(){return{learningRate:this.learningRate,rho:this.rho,epsilon:this.epsilon}}static fromConfig(t,n){return new t(n.learningRate,n.rho,n.epsilon)}}/**
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
 */class ls extends Jt{static get className(){return"Adagrad"}constructor(t,n=.1){super(),this.learningRate=t,this.initialAccumulatorValue=n,this.accumulatedGrads=[]}applyGradients(t){(Array.isArray(t)?t.map(r=>r.name):Object.keys(t)).forEach((r,s)=>{const o=b.registeredVariables[r];this.accumulatedGrads[s]==null&&(this.accumulatedGrads[s]={originalName:`${r}/accumulator`,variable:tt(()=>un(o.shape,this.initialAccumulatorValue).variable(!1))});const a=Array.isArray(t)?t[s].tensor:t[r];if(a==null)return;const i=this.accumulatedGrads[s].variable;tt(()=>{const c=F(i,St(a));i.assign(c);const u=F(T(K(a,Rt(F(c,b.backend.epsilon()))),-this.learningRate),o);o.assign(u)})}),this.incrementIterations()}dispose(){this.accumulatedGrads!=null&&ut(this.accumulatedGrads.map(t=>t.variable))}async getWeights(){return[await this.saveIterations()].concat(this.accumulatedGrads.map(t=>({name:t.originalName,tensor:t.variable})))}async setWeights(t){t=await this.extractIterations(t);const n=!1;this.accumulatedGrads=t.map(r=>({originalName:r.name,variable:r.tensor.variable(n)}))}getConfig(){return{learningRate:this.learningRate,initialAccumulatorValue:this.initialAccumulatorValue}}static fromConfig(t,n){return new t(n.learningRate,n.initialAccumulatorValue)}}/**
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
 */class hs extends Jt{static get className(){return"Adam"}constructor(t,n,r,s=null){super(),this.learningRate=t,this.beta1=n,this.beta2=r,this.epsilon=s,this.accumulatedFirstMoment=[],this.accumulatedSecondMoment=[],tt(()=>{this.accBeta1=q(n).variable(),this.accBeta2=q(r).variable()}),s==null&&(this.epsilon=b.backend.epsilon())}applyGradients(t){const n=Array.isArray(t)?t.map(r=>r.name):Object.keys(t);tt(()=>{const r=P(1,this.accBeta1),s=P(1,this.accBeta2);n.forEach((o,a)=>{const i=b.registeredVariables[o],c=!1;this.accumulatedFirstMoment[a]==null&&(this.accumulatedFirstMoment[a]={originalName:`${o}/m`,variable:tt(()=>bt(i).variable(c))}),this.accumulatedSecondMoment[a]==null&&(this.accumulatedSecondMoment[a]={originalName:`${o}/v`,variable:tt(()=>bt(i).variable(c))});const u=Array.isArray(t)?t[a].tensor:t[o];if(u==null)return;const h=this.accumulatedFirstMoment[a].variable,l=this.accumulatedSecondMoment[a].variable,f=F(T(h,this.beta1),T(u,1-this.beta1)),p=F(T(l,this.beta2),T(St(u),1-this.beta2)),w=K(f,r),y=K(p,s);h.assign(f),l.assign(p);const $=F(T(K(w,F(Rt(y),this.epsilon)),-this.learningRate),i);i.assign($)}),this.accBeta1.assign(T(this.accBeta1,this.beta1)),this.accBeta2.assign(T(this.accBeta2,this.beta2))}),this.incrementIterations()}dispose(){this.accBeta1.dispose(),this.accBeta2.dispose(),this.accumulatedFirstMoment!=null&&ut(this.accumulatedFirstMoment.map(t=>t.variable)),this.accumulatedSecondMoment!=null&&ut(this.accumulatedSecondMoment.map(t=>t.variable))}async getWeights(){const t=[...this.accumulatedFirstMoment,...this.accumulatedSecondMoment];return[await this.saveIterations()].concat(t.map(n=>({name:n.originalName,tensor:n.variable})))}async setWeights(t){t=await this.extractIterations(t),tt(()=>{this.accBeta1.assign(Ze(this.beta1,this.iterations_+1)),this.accBeta2.assign(Ze(this.beta2,this.iterations_+1))});const n=t.length/2,r=!1;this.accumulatedFirstMoment=t.slice(0,n).map(s=>({originalName:s.name,variable:s.tensor.variable(r)})),this.accumulatedSecondMoment=t.slice(n,n*2).map(s=>({originalName:s.name,variable:s.tensor.variable(r)}))}getConfig(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon}}static fromConfig(t,n){return new t(n.learningRate,n.beta1,n.beta2,n.epsilon)}}/**
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
 */class fs extends Jt{static get className(){return"Adamax"}constructor(t,n,r,s=null,o=0){super(),this.learningRate=t,this.beta1=n,this.beta2=r,this.epsilon=s,this.decay=o,this.accumulatedFirstMoment=[],this.accumulatedWeightedInfNorm=[],tt(()=>{this.iteration=q(0).variable(),this.accBeta1=q(n).variable()}),s==null&&(this.epsilon=b.backend.epsilon())}applyGradients(t){const n=Array.isArray(t)?t.map(r=>r.name):Object.keys(t);tt(()=>{const r=P(1,this.accBeta1),s=K(-this.learningRate,F(T(this.iteration,this.decay),1));n.forEach((o,a)=>{const i=b.registeredVariables[o],c=!1;this.accumulatedFirstMoment[a]==null&&(this.accumulatedFirstMoment[a]={originalName:`${o}/m`,variable:bt(i).variable(c)}),this.accumulatedWeightedInfNorm[a]==null&&(this.accumulatedWeightedInfNorm[a]={originalName:`${o}/v`,variable:bt(i).variable(c)});const u=Array.isArray(t)?t[a].tensor:t[o];if(u==null)return;const h=this.accumulatedFirstMoment[a].variable,l=this.accumulatedWeightedInfNorm[a].variable,f=F(T(h,this.beta1),T(u,1-this.beta1)),p=T(l,this.beta2),w=mt(u),y=Hc(p,w);h.assign(f),l.assign(y);const $=F(T(K(s,r),K(f,F(y,this.epsilon))),i);i.assign($)}),this.iteration.assign(F(this.iteration,1)),this.accBeta1.assign(T(this.accBeta1,this.beta1))}),this.incrementIterations()}dispose(){this.accBeta1.dispose(),this.iteration.dispose(),this.accumulatedFirstMoment!=null&&ut(this.accumulatedFirstMoment.map(t=>t.variable)),this.accumulatedWeightedInfNorm!=null&&ut(this.accumulatedWeightedInfNorm.map(t=>t.variable))}async getWeights(){throw new Error("getWeights() is not implemented for Adamax yet.")}async setWeights(t){throw new Error("setWeights() is not implemented for Adamax yet.")}getConfig(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon,decay:this.decay}}static fromConfig(t,n){return new t(n.learningRate,n.beta1,n.beta2,n.epsilon,n.decay)}}/**
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
 */class Vn extends Jt{static get className(){return"SGD"}constructor(t){super(),this.learningRate=t,this.setLearningRate(t)}applyGradients(t){(Array.isArray(t)?t.map(r=>r.name):Object.keys(t)).forEach((r,s)=>{const o=Array.isArray(t)?t[s].tensor:t[r];if(o==null)return;const a=b.registeredVariables[r];tt(()=>{const i=F(T(this.c,o),a);a.assign(i)})}),this.incrementIterations()}setLearningRate(t){this.learningRate=t,this.c!=null&&this.c.dispose(),this.c=cc(q(-t))}dispose(){this.c.dispose()}async getWeights(){return[await this.saveIterations()]}async setWeights(t){if(t=await this.extractIterations(t),t.length!==0)throw new Error("SGD optimizer does not have settable weights.")}getConfig(){return{learningRate:this.learningRate}}static fromConfig(t,n){return new t(n.learningRate)}}/**
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
 */class ds extends Vn{static get className(){return"Momentum"}constructor(t,n,r=!1){super(t),this.learningRate=t,this.momentum=n,this.useNesterov=r,this.accumulations=[],this.m=q(this.momentum)}applyGradients(t){(Array.isArray(t)?t.map(r=>r.name):Object.keys(t)).forEach((r,s)=>{const o=b.registeredVariables[r];this.accumulations[s]==null&&(this.accumulations[s]={originalName:`${r}/momentum`,variable:tt(()=>bt(o).variable(!1))});const a=this.accumulations[s].variable,i=Array.isArray(t)?t[s].tensor:t[r];i!=null&&tt(()=>{let c;const u=F(T(this.m,a),i);this.useNesterov?c=F(T(this.c,F(i,T(u,this.m))),o):c=F(T(this.c,u),o),a.assign(u),o.assign(c)})}),this.incrementIterations()}dispose(){this.m.dispose(),this.accumulations!=null&&ut(this.accumulations.map(t=>t.variable))}setMomentum(t){this.momentum=t}async getWeights(){return[await this.saveIterations()].concat(this.accumulations.map(t=>({name:t.originalName,tensor:t.variable})))}async setWeights(t){t=await this.extractIterations(t);const n=!1;this.accumulations=t.map(r=>({originalName:r.name,variable:r.tensor.variable(n)}))}getConfig(){return{learningRate:this.learningRate,momentum:this.momentum,useNesterov:this.useNesterov}}static fromConfig(t,n){return new t(n.learningRate,n.momentum,n.useNesterov)}}/**
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
 */class ps extends Jt{static get className(){return"RMSProp"}constructor(t,n=.9,r=0,s=null,o=!1){if(super(),this.learningRate=t,this.decay=n,this.momentum=r,this.epsilon=s,this.accumulatedMeanSquares=[],this.accumulatedMoments=[],this.accumulatedMeanGrads=[],this.centered=o,s==null&&(this.epsilon=b.backend.epsilon()),t==null)throw new Error("learningRate for RMSPropOptimizer must be defined.")}applyGradients(t){(Array.isArray(t)?t.map(r=>r.name):Object.keys(t)).forEach((r,s)=>{const o=b.registeredVariables[r],a=!1;this.accumulatedMeanSquares[s]==null&&(this.accumulatedMeanSquares[s]={originalName:`${r}/rms`,variable:tt(()=>bt(o).variable(a))}),this.accumulatedMoments[s]==null&&(this.accumulatedMoments[s]={originalName:`${r}/momentum`,variable:tt(()=>bt(o).variable(a))}),this.accumulatedMeanGrads[s]==null&&this.centered&&(this.accumulatedMeanGrads[s]={originalName:`${r}/mg`,variable:tt(()=>bt(o).variable(a))});const i=Array.isArray(t)?t[s].tensor:t[r];if(i==null)return;const c=this.accumulatedMeanSquares[s].variable,u=this.accumulatedMoments[s].variable;tt(()=>{const h=F(T(c,this.decay),T(St(i),1-this.decay));if(this.centered){const l=this.accumulatedMeanGrads[s].variable,f=F(T(l,this.decay),T(i,1-this.decay)),p=K(T(i,this.learningRate),Rt(P(h,F(St(f),this.epsilon)))),w=F(T(u,this.momentum),p);c.assign(h),l.assign(f),u.assign(w);const y=P(o,w);o.assign(y)}else{const l=F(T(c,this.decay),T(St(i),1-this.decay)),f=F(T(u,this.momentum),K(T(i,this.learningRate),Rt(F(l,this.epsilon))));c.assign(l),u.assign(f);const p=P(o,f);o.assign(p)}})}),this.incrementIterations()}dispose(){this.accumulatedMeanSquares!=null&&ut(this.accumulatedMeanSquares.map(t=>t.variable)),this.accumulatedMeanGrads!=null&&this.centered&&ut(this.accumulatedMeanGrads.map(t=>t.variable)),this.accumulatedMoments!=null&&ut(this.accumulatedMoments.map(t=>t.variable))}async getWeights(){const t=[...this.accumulatedMeanSquares,...this.accumulatedMoments];return this.centered&&t.push(...this.accumulatedMeanGrads),[await this.saveIterations()].concat(t.map(n=>({name:n.originalName,tensor:n.variable})))}async setWeights(t){t=await this.extractIterations(t);const n=this.centered?t.length/3:t.length/2,r=!1;this.accumulatedMeanSquares=t.slice(0,n).map(s=>({originalName:s.name,variable:s.tensor.variable(r)})),this.accumulatedMoments=t.slice(n,n*2).map(s=>({originalName:s.name,variable:s.tensor.variable(r)})),this.centered&&(this.accumulatedMeanGrads=t.slice(n*2,n*3).map(s=>({originalName:s.name,variable:s.tensor.variable(r)})))}getConfig(){return{learningRate:this.learningRate,decay:this.decay,momentum:this.momentum,epsilon:this.epsilon,centered:this.centered}}static fromConfig(t,n){return new t(n.learningRate,n.decay,n.momentum,n.epsilon,n.centered)}}/**
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
 */const C1=[us,ls,hs,fs,ds,ps,Vn];function P1(){for(const e of C1)wu(e)}/**
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
 */const O1="model",L1=".json",W1=".weights.bin";function Fs(e){return new Promise(t=>setTimeout(t)).then(e)}class he{constructor(t){if(!R().getBool("IS_BROWSER"))throw new Error("browserDownloads() cannot proceed because the current environment is not a browser.");t.startsWith(he.URL_SCHEME)&&(t=t.slice(he.URL_SCHEME.length)),(t==null||t.length===0)&&(t=O1),this.modelJsonFileName=t+L1,this.weightDataFileName=t+W1}async save(t){if(typeof document>"u")throw new Error("Browser downloads are not supported in this environment since `document` is not present");const n=Tt.join(t.weightData),r=window.URL.createObjectURL(new Blob([n],{type:"application/octet-stream"}));if(t.modelTopology instanceof ArrayBuffer)throw new Error("BrowserDownloads.save() does not support saving model topology in binary formats yet.");{const s=[{paths:["./"+this.weightDataFileName],weights:t.weightSpecs}],o=dc(t,s),a=window.URL.createObjectURL(new Blob([JSON.stringify(o)],{type:"application/json"})),i=this.modelJsonAnchor==null?document.createElement("a"):this.modelJsonAnchor;if(i.download=this.modelJsonFileName,i.href=a,await Fs(()=>i.dispatchEvent(new MouseEvent("click"))),t.weightData!=null){const c=this.weightDataAnchor==null?document.createElement("a"):this.weightDataAnchor;c.download=this.weightDataFileName,c.href=r,await Fs(()=>c.dispatchEvent(new MouseEvent("click")))}return{modelArtifactsInfo:an(t)}}}}he.URL_SCHEME="downloads://";class U1{constructor(t){if(t==null||t.length<1)throw new Error(`When calling browserFiles, at least 1 file is required, but received ${t}`);this.jsonFile=t[0],this.weightsFiles=t.slice(1)}async load(){return new Promise((t,n)=>{const r=new FileReader;r.onload=s=>{const o=JSON.parse(s.target.result),a=o.modelTopology;if(a==null){n(new Error(`modelTopology field is missing from file ${this.jsonFile.name}`));return}if(o.weightsManifest==null){n(new Error(`weightManifest field is missing from file ${this.jsonFile.name}`));return}if(this.weightsFiles.length===0){t({modelTopology:a});return}const c=Or(o,u=>this.loadWeights(u));t(c)},r.onerror=s=>n(`Failed to read model topology and weights manifest JSON from file '${this.jsonFile.name}'. BrowserFiles supports loading Keras-style tf.Model artifacts only.`),r.readAsText(this.jsonFile)})}loadWeights(t){const n=[],r=[];for(const a of t)n.push(...a.weights),r.push(...a.paths);const s=this.checkManifestAndWeightFiles(t),o=r.map(a=>this.loadWeightsFile(a,s[a]));return Promise.all(o).then(a=>[n,a])}loadWeightsFile(t,n){return new Promise((r,s)=>{const o=new FileReader;o.onload=a=>{const i=a.target.result;r(i)},o.onerror=a=>s(`Failed to weights data from file of path '${t}'.`),o.readAsArrayBuffer(n)})}checkManifestAndWeightFiles(t){const n=[],r=this.weightsFiles.map(o=>Ds(o.name)),s={};for(const o of t)o.paths.forEach(a=>{const i=Ds(a);if(n.indexOf(i)!==-1)throw new Error(`Duplicate file basename found in weights manifest: '${i}'`);if(n.push(i),r.indexOf(i)===-1)throw new Error(`Weight file with basename '${i}' is not provided.`);s[a]=this.weightsFiles[r.indexOf(i)]});if(n.length!==this.weightsFiles.length)throw new Error(`Mismatch in the number of files in weights manifest (${n.length}) and the number of weight files provided (${this.weightsFiles.length}).`);return s}}const q1=e=>R().getBool("IS_BROWSER")&&!Array.isArray(e)&&e.startsWith(he.URL_SCHEME)?G1(e.slice(he.URL_SCHEME.length)):null;J.registerSaveRouter(q1);function G1(e="model"){return new he(e)}function z1(e){return new U1(e)}/**
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
 */function Bs(e,t,n,r){a(e),n=n??0,r=r??1,i(n,r);let s=0;const o=c=>(c.then(u=>{const h=n+ ++s/e.length*(r-n);return t(h),u}),c);function a(c){g(c!=null&&Array.isArray(c)&&c.length>0,()=>"promises must be a none empty array")}function i(c,u){g(c>=0&&c<=1,()=>`Progress fraction must be in range [0, 1], but got startFraction ${c}`),g(u>=0&&u<=1,()=>`Progress fraction must be in range [0, 1], but got endFraction ${u}`),g(u>=c,()=>`startFraction must be no more than endFraction, but got startFraction ${c} and endFraction ${u}`)}return Promise.all(e.map(o))}/**
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
 */async function yu(e,t){t==null&&(t={});const n=t.fetchFunc==null?R().platform.fetch:t.fetchFunc,r=e.map(l=>n(l,t.requestInit,{isBinary:!0})),i=(t.onProgress==null?await Promise.all(r):await Bs(r,t.onProgress,0,.5)).map(l=>l.arrayBuffer());return t.onProgress==null?await Promise.all(i):await Bs(i,t.onProgress,.5,1)}function K1(e,t){var n;const r=t.fetchFunc==null?R().platform.fetch:t.fetchFunc;let s=0,o;return(n=t.onProgress)===null||n===void 0||n.call(t,0),new ReadableStream({pull:async a=>{for(var i;s<e.length;){o||(o=(await r(e[s],t.requestInit,{isBinary:!0})).body.getReader());const{done:c,value:u}=await o.read();if(c){s++,o=void 0,(i=t.onProgress)===null||i===void 0||i.call(t,s/e.length);continue}a.enqueue(u);return}a.close()}})}async function V1(e,t="",n,r){return $u(a=>yu(a,{requestInit:r}))(e,t,n)}function $u(e){return async(t,n="",r)=>{const s=t.map(()=>!1),o={},a=r!=null?r.map(()=>!1):[],i=[];if(t.forEach((p,w)=>{let y=0;p.weights.forEach($=>{const x="quantization"in $?$.quantization.dtype:$.dtype,N=oe[x]*W($.shape),k=()=>{s[w]=!0,o[w]==null&&(o[w]=[]),o[w].push({manifestEntry:$,groupOffset:y,sizeBytes:N})};r!=null?r.forEach((v,I)=>{v===$.name&&(k(),a[I]=!0)}):k(),i.push($.name),y+=N})}),!a.every(p=>p)){const p=r.filter((w,y)=>!a[y]);throw new Error(`Could not find weights in manifest with names: ${p.join(", ")}. 
Manifest JSON has weights with names: ${i.join(", ")}.`)}const c=s.reduce((p,w,y)=>(w&&p.push(y),p),[]),u=[];c.forEach(p=>{t[p].paths.forEach(w=>{const y=n+(n.endsWith("/")?"":"/")+w;u.push(y)})});const h=await e(u),l={};let f=0;return c.forEach(p=>{const w=t[p].paths.length,y=new Tt(h.slice(f,f+w));o[p].forEach(x=>{const N=y.slice(x.groupOffset,x.groupOffset+x.sizeBytes),k=hc(N,[x.manifestEntry]);for(const v in k)l[v]=k[v]}),f+=w}),l}}/**
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
 */const j1="application/octet-stream",H1="application/json";class gs{constructor(t,n){if(this.DEFAULT_METHOD="POST",n==null&&(n={}),this.weightPathPrefix=n.weightPathPrefix,this.weightUrlConverter=n.weightUrlConverter,n.fetchFunc!=null?(g(typeof n.fetchFunc=="function",()=>"Must pass a function that matches the signature of `fetch` (see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)"),this.fetch=n.fetchFunc):this.fetch=R().platform.fetch,g(t!=null&&t.length>0,()=>"URL path for http must not be null, undefined or empty."),Array.isArray(t)&&g(t.length===2,()=>`URL paths for http must have a length of 2, (actual length is ${t.length}).`),this.path=t,n.requestInit!=null&&n.requestInit.body!=null)throw new Error("requestInit is expected to have no pre-existing body, but has one.");this.requestInit=n.requestInit||{},this.loadOptions=n}async save(t){if(t.modelTopology instanceof ArrayBuffer)throw new Error("BrowserHTTPRequest.save() does not support saving model topology in binary formats yet.");const n=Object.assign({method:this.DEFAULT_METHOD},this.requestInit);n.body=new FormData;const r=[{paths:["./model.weights.bin"],weights:t.weightSpecs}],s=dc(t,r);if(n.body.append("model.json",new Blob([JSON.stringify(s)],{type:H1}),"model.json"),t.weightData!=null){const a=Tt.join(t.weightData);n.body.append("model.weights.bin",new Blob([a],{type:j1}),"model.weights.bin")}const o=await this.fetch(this.path,n);if(o.ok)return{modelArtifactsInfo:an(t),responses:[o]};throw new Error(`BrowserHTTPRequest.save() failed due to HTTP response status ${o.status}.`)}async loadModelJSON(){const t=await this.fetch(this.path,this.requestInit);if(!t.ok)throw new Error(`Request to ${this.path} failed with status code ${t.status}. Please verify this URL points to the model JSON of the model to load.`);let n;try{n=await t.json()}catch{let a=`Failed to parse model JSON of response from ${this.path}.`;throw this.path.endsWith(".pb")?a+=" Your path contains a .pb file extension. Support for .pb models have been removed in TensorFlow.js 1.0 in favor of .json models. You can re-convert your Python TensorFlow model using the TensorFlow.js 1.0 conversion scripts or you can convert your.pb models with the 'pb2json'NPM script in the tensorflow/tfjs-converter repository.":a+=" Please make sure the server is serving valid JSON for this request.",new Error(a)}const r=n.modelTopology,s=n.weightsManifest;if(r==null&&s==null)throw new Error(`The JSON from HTTP path ${this.path} contains neither model topology or manifest for weights.`);return n}async load(){if(this.loadOptions.streamWeights)return this.loadStream();const t=await this.loadModelJSON();return Or(t,n=>this.loadWeights(n))}async loadStream(){const t=await this.loadModelJSON(),n=await this.getWeightUrls(t.weightsManifest),r=fr(t.weightsManifest),s=()=>K1(n,this.loadOptions);return Object.assign(Object.assign({},t),{weightSpecs:r,getWeightStream:s})}async getWeightUrls(t){const n=Array.isArray(this.path)?this.path[1]:this.path,[r,s]=X1(n),o=this.weightPathPrefix||r,a=[],i=[];for(const c of t)for(const u of c.paths)this.weightUrlConverter!=null?i.push(this.weightUrlConverter(u)):a.push(o+u+s);return this.weightUrlConverter&&a.push(...await Promise.all(i)),a}async loadWeights(t){const n=await this.getWeightUrls(t),r=fr(t),s=await yu(n,this.loadOptions);return[r,s]}}gs.URL_SCHEME_REGEX=/^https?:\/\//;function X1(e){const t=e.lastIndexOf("/"),n=e.lastIndexOf("?"),r=e.substring(0,t),s=n>t?e.substring(n):"";return[r+"/",s]}function xr(e){return e.match(gs.URL_SCHEME_REGEX)!=null}const Eu=(e,t)=>{if(typeof fetch>"u"&&(t==null||t.fetchFunc==null))return null;{let n=!0;if(Array.isArray(e)?n=e.every(r=>xr(r)):n=xr(e),n)return ms(e,t)}return null};J.registerSaveRouter(Eu);J.registerLoadRouter(Eu);function ms(e,t){return new gs(e,t)}function Z1(e,t){return ms(e,t)}/**
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
 */class Jn{constructor(t){this.modelArtifacts=t}load(){return this.modelArtifacts}}class ku{constructor(t){this.saveHandler=t}save(t){return this.saveHandler(t)}}class J1{constructor(t){t.load&&(this.load=()=>Promise.resolve(t.load())),t.save&&(this.save=n=>Promise.resolve(t.save(n)))}}function Y1(e,t,n,r){const s=arguments;return new J1(xu(...s))}function xu(e,t,n,r){return arguments.length===1?e.modelTopology!=null||e.weightSpecs!=null?new Jn(e):(console.warn("Please call tf.io.fromMemory() with only one argument. The argument should be of type ModelArtifacts. The multi-argument signature of tf.io.fromMemory() has been deprecated and will be removed in a future release."),new Jn({modelTopology:e})):(console.warn("Please call tf.io.fromMemory() with only one argument. The argument should be of type ModelArtifacts. The multi-argument signature of tf.io.fromMemory() has been deprecated and will be removed in a future release."),new Jn({modelTopology:e,weightSpecs:t,weightData:n,trainingConfig:r}))}function Q1(e){return new ku(e)}function ty(e){return new ku(e)}/**
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
 */const ey=Object.freeze(Object.defineProperty({__proto__:null,CompositeArrayBuffer:Tt,browserFiles:z1,browserHTTPRequest:Z1,concatenateArrayBuffers:Ph,copyModel:of,decodeWeights:hc,decodeWeightsStream:Fh,encodeWeights:Dh,fromMemory:Y1,fromMemorySync:xu,getLoadHandlers:Kh,getModelArtifactsForJSON:Or,getModelArtifactsForJSONSync:pc,getModelArtifactsInfoForJSON:an,getSaveHandlers:zh,getWeightSpecs:fr,http:ms,isHTTPScheme:xr,listModels:rf,loadWeights:V1,moveModel:af,registerLoadRouter:Gh,registerSaveRouter:qh,removeModel:sf,weightsLoaderFactory:$u,withSaveHandler:Q1,withSaveHandlerSync:ty},Symbol.toStringTag,{value:"Module"}));/**
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
 */function ny(e,t,n){const r=d(e,"labels","confusionMatrix"),s=d(t,"predictions","confusionMatrix");g(n==null||n>0&&Number.isInteger(n),()=>`If provided, numClasses must be a positive integer, but got ${n}`),g(r.rank===1,()=>`Expected the rank of labels to be 1, but got ${r.rank}`),g(s.rank===1,()=>`Expected the rank of predictions to be 1, but got ${s.rank}`),g(r.shape[0]===s.shape[0],()=>`Mismatch in the number of examples: ${r.shape[0]} vs. ${s.shape[0]}. Labels and predictions should have the same number of elements.`),g(n>0&&Number.isInteger(n),()=>`numClasses is required to be a positive integer, but got ${n}`);const o=$r(H(r,"int32"),n),a=$r(H(s,"int32"),n),i=An(o),c=L(i,a);return H(c,"int32")}const ry=m({confusionMatrix_:ny});/**
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
 */const sy=Object.freeze(Object.defineProperty({__proto__:null,confusionMatrix:ry},Symbol.toStringTag,{value:"Module"}));/**
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
 */let Yt,Rs=!1;function vu(e,t=3){if(t>4)throw new Error("Cannot construct Tensor with more than 4 channels from pixels.");if(e==null)throw new Error("pixels passed to tf.browser.fromPixels() can not be null");let n=!1,r=!1,s=!1,o=!1,a=!1,i=!1;if(e.data instanceof Uint8Array)n=!0;else if(typeof ImageData<"u"&&e instanceof ImageData)r=!0;else if(typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement)s=!0;else if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement)o=!0;else if(e.getContext!=null)a=!0;else if(typeof ImageBitmap<"u"&&e instanceof ImageBitmap)i=!0;else throw new Error(`pixels passed to tf.browser.fromPixels() must be either an HTMLVideoElement, HTMLImageElement, HTMLCanvasElement, ImageData in browser, or OffscreenCanvas, ImageData in webworker or {data: Uint32Array, width: number, height: number}, but was ${e.constructor.name}`);if(Ge(Qn,b.backendName)!=null){const w={pixels:e},y={numChannels:t};return b.runKernel(Qn,w,y)}const[u,h]=s?[e.videoWidth,e.videoHeight]:[e.width,e.height];let l;if(a)l=e.getContext("2d").getImageData(0,0,u,h).data;else if(r||n)l=e.data;else if(o||s||i){if(Yt==null)if(typeof document>"u")if(typeof OffscreenCanvas<"u"&&typeof OffscreenCanvasRenderingContext2D<"u")Yt=new OffscreenCanvas(1,1).getContext("2d");else throw new Error("Cannot parse input in current context. Reason: OffscreenCanvas Context2D rendering is not supported.");else Yt=document.createElement("canvas").getContext("2d",{willReadFrequently:!0});Yt.canvas.width=u,Yt.canvas.height=h,Yt.drawImage(e,0,0,u,h),l=Yt.getImageData(0,0,u,h).data}let f;if(t===4)f=new Int32Array(l);else{const w=u*h;f=new Int32Array(w*t);for(let y=0;y<w;y++)for(let $=0;$<t;++$)f[y*t+$]=l[y*4+$]}return iu(f,[h,u,t],"int32")}function oy(e){return e!=null&&e.data instanceof Uint8Array}function ay(){return typeof window<"u"&&typeof ImageBitmap<"u"&&window.hasOwnProperty("createImageBitmap")}function iy(e){return e!=null&&e.width!==0&&e.height!==0}function cy(e){return ay()&&!(e instanceof ImageBitmap)&&iy(e)&&!oy(e)}async function uy(e,t=3){let n=null;if(R().getBool("WRAP_TO_IMAGEBITMAP")&&cy(e)){let r;try{r=await createImageBitmap(e,{premultiplyAlpha:"none"})}catch{r=null}r!=null&&r.width===e.width&&r.height===e.height?n=r:n=e}else n=e;return vu(n,t)}function Su(e){if(e.rank!==2&&e.rank!==3)throw new Error(`toPixels only supports rank 2 or 3 tensors, got rank ${e.rank}.`);const t=e.rank===2?1:e.shape[2];if(t>4||t===2)throw new Error(`toPixels only supports depth of size 1, 3 or 4 but got ${t}`);if(e.dtype!=="float32"&&e.dtype!=="int32")throw new Error(`Unsupported type for toPixels: ${e.dtype}. Please use float32 or int32 tensors.`)}function ly(e){const t=(e==null?void 0:e.alpha)||1;if(t>1||t<0)throw new Error(`Alpha value ${t} is suppoed to be in range [0 - 1].`)}async function hy(e,t){let n=d(e,"img","toPixels");if(!(e instanceof Q)){const u=n;n=H(u,"int32"),u.dispose()}Su(n);const[r,s]=n.shape.slice(0,2),o=n.rank===2?1:n.shape[2],a=await n.data(),i=n.dtype==="float32"?255:1,c=new Uint8ClampedArray(s*r*4);for(let u=0;u<r*s;++u){const h=[0,0,0,255];for(let f=0;f<o;f++){const p=a[u*o+f];if(n.dtype==="float32"){if(p<0||p>1)throw new Error(`Tensor values for a float32 Tensor must be in the range [0 - 1] but encountered ${p}.`)}else if(n.dtype==="int32"&&(p<0||p>255))throw new Error(`Tensor values for a int32 Tensor must be in the range [0 - 255] but encountered ${p}.`);o===1?(h[0]=p*i,h[1]=p*i,h[2]=p*i):h[f]=p*i}const l=u*4;c[l+0]=Math.round(h[0]),c[l+1]=Math.round(h[1]),c[l+2]=Math.round(h[2]),c[l+3]=Math.round(h[3])}if(t!=null){Rs||Ge(Nr,b.backendName)!=null&&(console.warn("tf.browser.toPixels is not efficient to draw tensor on canvas. Please try tf.browser.draw instead."),Rs=!0),t.width=s,t.height=r;const u=t.getContext("2d"),h=new ImageData(c,s,r);u.putImageData(h,0,0)}return n!==e&&n.dispose(),c}function fy(e,t,n){let r=d(e,"img","draw");if(!(e instanceof Q)){const a=r;r=H(a,"int32"),a.dispose()}Su(r),ly(n==null?void 0:n.imageOptions);const s={image:r},o={canvas:t,options:n};b.runKernel(Nr,s,o)}const dy=m({fromPixels_:vu}),py=Object.freeze(Object.defineProperty({__proto__:null,draw:fy,fromPixels:dy,fromPixelsAsync:uy,toPixels:hy},Symbol.toStringTag,{value:"Module"}));function Iu(e,t){const n=e.shape.length,r=t.shape.length;if(n<1)throw new Error(`tf.gatherND() expects the input to be rank 1 or higher, but the rank was ${n}.`);if(r<1)throw new Error(`tf.gatherND() expects the indices to be rank 1 or higher, but the rank was ${r}.`);if(t.dtype!=="int32")throw new Error(`tf.gatherND() expects the indices to be int32 type, but the dtype was ${t.dtype}.`);if(t.shape[r-1]>n)throw new Error(`index innermost dimension length must be <= tensor rank; saw: ${t.shape[r-1]} vs. ${n}`);if(W(e.shape)===0)throw new Error(`Requested more than 0 entries, but input is empty. Input shape: ${e.shape}.`);const s=t.shape,o=s[s.length-1];let a=1;for(let l=0;l<s.length-1;++l)a*=s[l];const i=e.shape,c=s.slice();c.pop();let u=1;for(let l=o;l<n;++l)u*=i[l],c.push(i[l]);const h=[...Fe(e.shape).map(l=>l/u),1].slice(0,o);return[c,a,u,h]}const gy=Object.freeze(Object.defineProperty({__proto__:null,prepareAndValidate:Iu},Symbol.toStringTag,{value:"Module"}));/**
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
 */const vr=-2,my=-1;function by(e,t,n){const r=e.shape.length;g(r===t.length,()=>`Error in slice${r}D: Length of begin ${t} must match the rank of the array (${r}).`),g(r===n.length,()=>`Error in slice${r}D: Length of size ${n} must match the rank of the array (${r}).`);for(let s=0;s<r;++s)g(t[s]+n[s]<=e.shape[s],()=>`Error in slice${r}D: begin[${s}] + size[${s}] (${t[s]+n[s]}) would overflow input.shape[${s}] (${e.shape[s]})`)}function wy(e){const t=[];let n=0;for(;e>0;)e&1&&t.push(n),e/=2,n++;return t}function yy(e,t,n){const r=[];for(let s=0;s<e.length;s++)r[s]=Math.ceil((t[s]-e[s])/n[s]);return r}function Tu(e,t,n,r){const s=[...e];for(let o=s.length;o<r.length;o++)s.push(1);for(let o=0;o<n;o++)o===0?s[t]=1:(s.splice(t,0,1),s.pop());return s}function _u(e,t,n){return n<=e?n:n-(t-1)}function Au(e,t){const n=[];for(let r=0;r<e;r++)n.push(t+r);return n}function $y(e,t,n,r,s,o,a,i,c){const u=e.length;let h=new Array(u),l=new Array(u),f=new Array(u);if(t.length&&n>0){const p=t[0],w=n+1;h=Du(a,p,w,r,e),l=Nu(i,p,w,s,e),f=Tu(o,p,w,e)}else for(let p=0;p<u;p++)h[p]=Fu(a,r,o,e,p,c),l[p]=Bu(i,s,o,e,p,c),f[p]=Mu(o,p,c);return{begin:h,end:l,strides:f}}function Du(e,t,n,r,s){const o=[...s],a=Au(n,t);for(let i=0;i<o.length;i++)if(a.indexOf(i)>-1)o[i]=0;else{const c=_u(t,n,i);let u=r[c];e&1<<c&&(u=0),o[i]=u}return o}function Nu(e,t,n,r,s){const o=[...s],a=Au(n,t);for(let i=0;i<o.length;i++)if(a.indexOf(i)>-1)o[i]=Number.MAX_SAFE_INTEGER;else{const c=_u(t,n,i);let u=r[c];e&1<<c&&(u=Number.MAX_SAFE_INTEGER),o[i]=u}for(let i=0;i<o.length;i++){const c=s[i];o[i]<0&&(o[i]+=c),o[i]=Ue(0,o[i],s[i])}return o}function Mu(e,t,n){let r=e[t];return(n&1<<t||r==null)&&(r=1),r}function Fu(e,t,n,r,s,o){let a=t[s];const i=n[s]||1;(e&1<<s||o&1<<s||a==null)&&(i>0?a=Number.MIN_SAFE_INTEGER:a=Number.MAX_SAFE_INTEGER);const c=r[s];return a<0&&(a+=c),a=Ue(0,a,c-1),a}function Bu(e,t,n,r,s,o){let a=t[s];const i=n[s]||1;(e&1<<s||o&1<<s||a==null)&&(i>0?a=Number.MAX_SAFE_INTEGER:a=Number.MIN_SAFE_INTEGER);const c=r[s];return a<0&&(a+=c),i>0?a=Ue(0,a,c):a=Ue(-1,a,c-1),a}function Ey(e,t,n){let r=n.length;for(let s=0;s<n.length;s++)if(n[s]>1){r=s;break}for(let s=r+1;s<n.length;s++)if(t[s]>0||n[s]!==e[s])return!1;return!0}function ky(e,t){let n=e.length>0?e[e.length-1]:1;for(let r=0;r<e.length-1;r++)n+=e[r]*t[r];return n}function xy(e,t,n){let r;const s=e.shape.length;typeof t=="number"?r=[t,...new Array(s-1).fill(0)]:t.length<s?r=t.concat(new Array(s-t.length).fill(0)):r=t.slice(),r.forEach(a=>{g(a!==-1,()=>"slice() does not support negative begin indexing.")});let o;return n==null?o=new Array(s).fill(-1):typeof n=="number"?o=[n,...new Array(s-1).fill(-1)]:n.length<s?o=n.concat(new Array(s-n.length).fill(-1)):o=n,o=o.map((a,i)=>a>=0?a:(g(a===-1,()=>`Negative size values should be exactly -1 but got ${a} for the slice() size at index ${i}.`),e.shape[i]-r[i])),[r,o]}function vy(e,t,n,r,s,o,a,i,c){let u;if(r==null?(u=new Array(t.length),u.fill(1)):u=r,a!=null&&a&a-1)throw new Error("Multiple ellipses in slice is not allowed.");let h=!1;const l={dims:u.length,numAddAxisAfterEllipsis:0,begin:t.slice(),end:n.slice(),strides:u.slice(),beginMask:s,endMask:o,ellipsisMask:a,newAxisMask:i,shrinkAxisMask:c};for(let k=0;k<l.dims;k++)h&&1<<k&i&&l.numAddAxisAfterEllipsis++,1<<k&a&&(h=!0);h||(l.ellipsisMask|=1<<l.dims,l.dims++);const f={dims:e.length,beginMask:0,endMask:0,beginValid:!1,endValid:!1};Sy(l,f);let p=!0,w=!0,y=!0;const $=[],x=[];for(let k=0;k<e.length;++k){if(f.strides[k]===0)throw Error(`strides[${k}] must be non-zero`);const v=!!(f.shrinkAxisMask&1<<k),I=e[k];if(I===-1){$.push(v?1:-1);continue}const _=[f.beginMask&1<<k,f.endMask&1<<k],M=[f.strides[k]>0?0:-1,f.strides[k]>0?I:I-1];if(v&&f.strides[k]<=0)throw Error("only stride 1 allowed on non-range indexing.");y=y&&f.strides[k]===1;const A=!!(f.beginMask&1<<k&&f.endMask&1<<k);if(f.beginValid&&f.endValid){if(v){const O=f.begin[k]<0?I+f.begin[k]:f.begin[k];if(f.begin[k]=O,f.end[k]=f.begin[k]+1,O<0||O>=I)throw Error(`slice index ${f.begin[k]} of dimension ${k} out of bounds.`)}else f.begin[k]=Cs(f.begin[k],0,f.strides[k],I,_,M),f.end[k]=Cs(f.end[k],1,f.strides[k],I,_,M);const B=f.strides[k]===1&&f.begin[k]===0&&f.end[k]===I;p=p&&B,w=w&&(k===0&&f.strides[k]===1||B)}else p=p&&f.strides[k]===1&&A,w=w&&(k===0&&f.strides[k]===1||A);let D,C=!1;if(f.beginValid&&f.endValid?(D=f.end[k]-f.begin[k],C=!0):v?(D=1,C=!0):A&&I>=0&&(f.strides[k]<0?D=-I:D=I,C=!0),C){let B;D===0||D<0!=f.strides[k]<0?B=0:B=Math.trunc(D/f.strides[k])+(D%f.strides[k]!==0?1:0),$.push(B)}else $.push(-1)}for(let k=0;k<f.finalShapeGatherIndices.length;++k){const v=f.finalShapeGatherIndices[k];v>=0?x.push($[v]):v===vr&&x.push(1)}return{finalShapeSparse:x.filter((k,v)=>f.finalShapeGatherIndices[v]!==vr),finalShape:x,isIdentity:p,sliceDim0:w,isSimpleSlice:y,begin:f.begin,end:f.end,strides:f.strides}}function Sy(e,t){t.beginMask=0,t.endMask=0,t.shrinkAxisMask=0;let n=0;t.beginValid=e.begin!=null,t.endValid=e.end!=null,t.begin=new Array(t.dims),t.end=new Array(t.dims),t.strides=new Array(t.dims),t.finalShapeGatherIndices=[],t.finalShapeGatherIndicesSparse=[],t.inputShapeGatherIndicesSparse=new Array(t.dims);for(let r=0;r<e.dims;r++)if(1<<r&e.ellipsisMask){const s=Math.min(t.dims-(e.dims-r)+1+e.numAddAxisAfterEllipsis,t.dims);for(;n<s;n++)t.begin[n]=0,t.end[n]=0,t.strides[n]=1,t.beginMask|=1<<n,t.endMask|=1<<n,t.finalShapeGatherIndices.push(n),t.finalShapeGatherIndicesSparse.push(-1),t.inputShapeGatherIndicesSparse[n]=r}else if(1<<r&e.newAxisMask)t.finalShapeGatherIndices.push(vr),t.finalShapeGatherIndicesSparse.push(-1);else{if(n===t.begin.length)throw Error(`Index out of range using input dim ${n}; input has only ${t.dims} dims, ${t.begin.length}.`);e.begin!=null&&(t.begin[n]=e.begin[r]),e.end!=null&&(t.end[n]=e.end[r]),t.strides[n]=e.strides[r],e.beginMask&1<<r&&(t.beginMask|=1<<n),e.endMask&1<<r&&(t.endMask|=1<<n),e.shrinkAxisMask&1<<r?(t.finalShapeGatherIndices.push(my),t.finalShapeGatherIndicesSparse.push(-1),t.shrinkAxisMask|=1<<n):(t.finalShapeGatherIndices.push(n),t.finalShapeGatherIndicesSparse.push(r)),t.inputShapeGatherIndicesSparse[n]=r,n++}}function Cs(e,t,n,r,s,o){if(s[t])return n>0?o[t]:o[t+1&1];{const a=e<0?r+e:e;return a<o[0]?o[0]:a>o[1]?o[1]:a}}const Ru=Object.freeze(Object.defineProperty({__proto__:null,assertParamsValid:by,computeFlatOffset:ky,computeOutShape:yy,getNormalizedAxes:$y,isSliceContinous:Ey,maskToAxes:wy,parseSliceParams:xy,sliceInfo:vy,startForAxis:Fu,startIndicesWithElidedDims:Du,stopForAxis:Bu,stopIndicesWithElidedDims:Nu,stridesForAxis:Mu,stridesWithElidedDims:Tu},Symbol.toStringTag,{value:"Module"}));/** @license See the LICENSE file. */const Iy="4.22.0";/**
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
 */class Cu{static sgd(t){return new Vn(t)}static momentum(t,n,r=!1){return new ds(t,n,r)}static rmsprop(t,n=.9,r=0,s=null,o=!1){return new ps(t,n,r,s,o)}static adam(t=.001,n=.9,r=.999,s=null){return new hs(t,n,r,s)}static adadelta(t=.001,n=.95,r=null){return new us(t,n,r)}static adamax(t=.002,n=.9,r=.999,s=null,o=0){return new fs(t,n,r,s,o)}static adagrad(t,n=.1){return new ls(t,n)}}/**
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
 */const Ty=Cu;/**
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
 */const _y=typeof requestAnimationFrame<"u"?requestAnimationFrame:typeof setImmediate<"u"?setImmediate:e=>e();function Ay(){return new Promise(e=>_y(()=>e()))}/**
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
 */function Dy(e,t){const n=e[0].length;e.forEach((s,o)=>{g(s.length===n,()=>`Error in concat${n}D: rank of tensors[${o}] must be the same as the rank of the rest (${n})`)}),g(t>=0&&t<n,()=>`Error in concat${n}D: axis must be between 0 and ${n-1}.`);const r=e[0];e.forEach((s,o)=>{for(let a=0;a<n;a++)g(a===t||s[a]===r[a],()=>`Error in concat${n}D: Shape of tensors[${o}] (${s}) does not match the shape of the rest (${r}) along the non-concatenated axis ${o}.`)})}function Ny(e,t){const n=e[0].slice();for(let r=1;r<e.length;r++)n[t]+=e[r][t];return n}/**
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
 */var _t;(function(e){e[e.FIRST_DIM_SIZE=0]="FIRST_DIM_SIZE",e[e.VALUE_ROWIDS=1]="VALUE_ROWIDS",e[e.ROW_LENGTHS=2]="ROW_LENGTHS",e[e.ROW_SPLITS=3]="ROW_SPLITS",e[e.ROW_LIMITS=4]="ROW_LIMITS",e[e.ROW_STARTS=5]="ROW_STARTS"})(_t||(_t={}));function My(e,t,n){let r=new Array;if(n==null&&t==null)return r;if(t==null)for(;r.length<e+n.length;)r.push(-1);else r=t.slice();if(n==null)return r;if(e+n.length!==r.length)throw new Error(`rt input.shape and shape=${t} are incompatible: rt input.rank = ${e+n.length}, but shape.rank = ${r.length}`);for(let s=1;s<n.length;++s){const o=n[s],a=r[r.length-n.length+s],i=r[a];if(o>=0)if(i>=0){if(i!==o)throw new Error(`rt input.shape and shape=${t} are incompatible: rt input.shape[${s+e}] = ${o} but shape[${s+e}] = ${i}`)}else r[a]=o}return r}function Fy(e){const t={FIRST_DIM_SIZE:_t.FIRST_DIM_SIZE,VALUE_ROWIDS:_t.VALUE_ROWIDS,ROW_LENGTHS:_t.ROW_LENGTHS,ROW_SPLITS:_t.ROW_SPLITS,ROW_LIMITS:_t.ROW_LIMITS,ROW_STARTS:_t.ROW_STARTS},n=[];for(const r of e)if(r in t)n.push(t[r]);else break;return n}function By(e){return e.length===0?0:e[0]===_t.FIRST_DIM_SIZE?e.length-1:e.length}function Ry(e,t){if(e==null||t==null)return;const n=e.length,r=t.length;if(n>=r)throw new Error(`defaultValue.shape=${e} and ragged tensor flatValues.shape=${t}, are incompatible: defaultValue.rank = ${n} must be less than ragged tensor input flatValues.rank = ${r})`);for(let s=0;s<Math.min(n,r-1);++s){const o=e[s],a=t[s+1];if(o>=0&&a>=0&&o!==1&&o!==a)throw new Error(`defaultValue.shape=${e}, and ragged tensor input flatValues.shape=${t} are incompatible: defaultValue.shape[${s-e.length}] = ${o} but ragged tensor input.flatValues.shape[${s-e.length}] = ${a}`)}}/**
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
 */const bs=30;function Cy(e){return e<=bs?e:$n(e,Math.floor(Math.sqrt(e)))}/**
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
 */function Py(e,t,n){const r=n*(typeof e=="number"?e:e[0]),s=t*(typeof e=="number"?e:e[1]);return[r,s]}/**
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
 */function Oy(e,t,n,r=!0){let s=[];if(r)s=s.concat(t.slice(0)),s.push(e[0]/n),s=s.concat(e.slice(1));else{s=s.concat(e[0]);const o=t.length;for(let a=0;a<o;++a)s=s.concat([e[a+1]/t[a],t[a]]);s=s.concat(e.slice(o+1))}return s}function Ly(e,t,n=!0){const r=[];if(n){r.push(t);for(let s=t+1;s<e;++s)s<=2*t?(r.push(s),r.push(s-(t+1))):r.push(s)}else{const s=[],o=[];for(let a=1;a<e;++a)a>=t*2+1||a%2===1?o.push(a):s.push(a);r.push(...s),r.push(0),r.push(...o)}return r}function Wy(e,t,n,r=!0){const s=[];r?s.push(e[0]/n):s.push(e[0]*n);for(let o=1;o<e.length;++o)o<=t.length?r?s.push(t[o-1]*e[o]):s.push(e[o]/t[o-1]):s.push(e[o]);return s}function Uy(e,t){const n=[0];for(let r=0;r<t;++r)n.push(e[r][0]);return n}function qy(e,t,n){const r=e.slice(0,1);for(let s=0;s<n;++s)r.push(e[s+1]-t[s][0]-t[s][1]);return r}/**
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
 */const Gy=1.7580993408473768,zy=1.0507009873554805;/**
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
 */const Ky=.3275911,Vy=.254829592,jy=-.284496736,Hy=1.421413741,Xy=-1.453152027,Zy=1.061405429;/**
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
 */function Jy(e,t){if(e.length!==t.length)throw new Error(`Cannot merge real and imag arrays of different lengths. real:${e.length}, imag: ${t.length}.`);const n=new Float32Array(e.length*2);for(let r=0;r<n.length;r+=2)n[r]=e[r/2],n[r+1]=t[r/2];return n}function Yy(e){const t=new Float32Array(e.length/2),n=new Float32Array(e.length/2);for(let r=0;r<e.length;r+=2)t[r/2]=e[r],n[r/2]=e[r+1];return{real:t,imag:n}}function Qy(e){const t=Math.ceil(e.length/4),n=new Float32Array(t),r=new Float32Array(t);for(let s=0;s<e.length;s+=4)n[Math.floor(s/4)]=e[s],r[Math.floor(s/4)]=e[s+1];return{real:n,imag:r}}function t$(e){const t=Math.floor(e.length/4),n=new Float32Array(t),r=new Float32Array(t);for(let s=2;s<e.length;s+=4)n[Math.floor(s/4)]=e[s],r[Math.floor(s/4)]=e[s+1];return{real:n,imag:r}}function e$(e,t){const n=e[t*2],r=e[t*2+1];return{real:n,imag:r}}function n$(e,t,n,r){e[r*2]=t,e[r*2+1]=n}function r$(e,t){const n=new Float32Array(e/2),r=new Float32Array(e/2);for(let s=0;s<Math.ceil(e/2);s++){const o=(t?2:-2)*Math.PI*(s/e);n[s]=Math.cos(o),r[s]=Math.sin(o)}return{real:n,imag:r}}function s$(e,t,n){const r=(n?2:-2)*Math.PI*(e/t),s=Math.cos(r),o=Math.sin(r);return{real:s,imag:o}}/**
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
 */const Yn="->",o$=/->/g,Ps=",",Os="...";function a$(e,t){e=e.replace(/\s/g,"");const n=(e.length-e.replace(o$,"").length)/Yn.length;if(n<1)throw new Error("Equations without an arrow are not supported.");if(n>1)throw new Error(`Equation must contain exactly one arrow ("${Yn}").`);const[r,s]=e.split(Yn);g(r.indexOf(Os)===-1,()=>`The ellipsis notation ("${Os}") is not supported yet.`);const o=r.split(Ps),a=o.length;if(t!==a)throw new Error(`Expected ${a} input tensors, received ${t}`);if(a>2)throw new Error("Support for more than 2 input tensors is not implemented yet.");const i=[];for(let f=0;f<s.length;++f){const p=s[f];if(!o.some(w=>w.indexOf(p)!==-1))throw new Error(`Output subscripts contain the label ${p} not present in the input subscripts.`);i.indexOf(p)===-1&&i.push(p)}for(let f=0;f<r.length;++f){const p=r[f];i.indexOf(p)===-1&&p!==Ps&&i.push(p)}const c=new Array(o.length);for(let f=0;f<a;++f){if(new Set(o[f].split("")).size!==o[f].length)throw new Error(`Found duplicate axes in input component ${o[f]}. Support for duplicate axes in input is not implemented yet.`);c[f]=[];for(let p=0;p<o[f].length;++p)c[f].push(i.indexOf(o[f][p]))}const u=i.length,h=s.length,l=[];for(let f=h;f<u;++f)l.push(f);return{allDims:i,summedDims:l,idDims:c}}function i$(e,t){let n=new Array(e);n.fill(-1);for(let s=0;s<t.length;++s)n[t[s]]=s;const r=[];for(let s=0;s<e;++s)n[s]===-1&&r.push(s);return n=n.filter(s=>s!==-1),{permutationIndices:n,expandDims:r}}function c$(e,t,n){const r=new Array(e);for(let s=0;s<n.length;++s){const o=n[s].shape;for(let a=0;a<t[s].length;++a)r[t[s][a]]===void 0?r[t[s][a]]=o[a]:g(r[t[s][a]]===o[a],()=>`Expected dimension ${r[t[s][a]]} at axis ${a} of input shaped ${JSON.stringify(o)}, but got dimension ${o[a]}`)}}function u$(e,t){const n=e,r=[];let s=0;e.length===0&&n.push(-1),s=e.length+1;for(let a=0;a<s;++a)r.push([]);const o=[];for(let a=0;a<n.length;++a){const i=n[a],c=h$(t,i);for(const u of c)o.indexOf(u)===-1&&(r[a].push(u),o.push(u))}return{path:n,steps:r}}function l$(e){return e.every((t,n)=>t===n)}function h$(e,t){const n=[];for(let r=0;r<e.length;++r)(e[r].length===0||e[r].indexOf(t)!==-1||t===-1)&&n.push(r);return n}function f$(e,t,n=0){let r=[];if(typeof t=="number")g(e.shape[n]%t===0,()=>"Number of splits must evenly divide the axis."),r=new Array(t).fill(e.shape[n]/t);else{const s=t.reduce((a,i)=>(i===-1&&(a+=1),a),0);g(s<=1,()=>"There should be only one negative value in split array.");const o=t.indexOf(-1);if(o!==-1){const a=t.reduce((i,c)=>c>0?i+c:i);t[o]=e.shape[n]-a}g(e.shape[n]===t.reduce((a,i)=>a+i),()=>"The sum of sizes must match the size of the axis dimension."),r=t}return r}/**
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
 */function d$(e){return`Received SparseTensor with denseShape[0] = 0 but
  indices.shape[0] = ${e}`}function p$(e,t){return`indices(${e}, 0) is invalid: ${t} < 0`}function g$(e,t,n){return`indices(${e}, 0) is invalid: ${t} >= ${n}`}/**
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
 */function m$(e,t){return`only one output dimension may be -1, not both ${e} and ${t}`}function b$(e,t){return`size ${e} must be non-negative, not ${t}`}function w$(){return"reshape cannot infer the missing input size for an empty tensor unless all specified input sizes are non-zero"}function y$(e,t){const n=W(e),r=W(t);return`Input to reshape is a SparseTensor with ${n}
  dense values, but the requested shape requires a multiple of ${r}. inputShape=${e} outputShape= ${t}`}function $$(e,t){const n=W(e),r=W(t);return`Input to reshape is a tensor with ${n} dense values, but the requested shape has ${r}. inputShape=${e} outputShape=${t}`}/**
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
 */function E$(){return"segment ids must be >= 0"}function k$(){return"segment ids are not increasing"}function x$(e,t){return`Segment id ${e} out of range [0, ${t}), possibly because segmentIds input is not sorted.`}function v$(e,t,n){return`Bad: indices[${e}] == ${t} out of range [0, ${n})`}/**
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
 */function S$(e,t){let n=!1,r;for(e<=bs?(r=e,n=!0):r=$n(e,Math.floor(Math.sqrt(e)));!n;)r>t||r===e?n=!0:r=$n(e,r+1);return r}function I$(e,t,n){const r=[],s=e.length;for(let o=0;o<s;o++)o!==t?r.push(e[o]):r.push(n);return r}function T$(e,t,n,r){const s=t.shape.length,o=e.shape.length;if(r!==0&&(r<-s||r>s))throw new Error(`Expect batchDims in the range of [-${s}, ${s}], but got ${r}`);if(r<0&&(r+=s),r>o)throw new Error(`batchDims (${r}) must be less than rank(x) (
    ${o}).`);if(n<r)throw new Error(`batchDims (${r}) must be less than or equal to axis (${n}).`);for(let l=0;l<r;++l)if(e.shape[l]!==t.shape[l])throw new Error(`x.shape[${l}]: ${e.shape[l]} should be equal to indices.shape[${l}]: ${t.shape[l]}.`);const a=e.shape[n],i=[];let c=1,u=1,h=1;for(let l=0;l<r;++l)i.push(e.shape[l]),c*=e.shape[l];for(let l=r;l<n;l++)i.push(e.shape[l]),u*=e.shape[l];for(let l=r;l<s;l++)i.push(t.shape[l]);for(let l=n+1;l<o;l++)i.push(e.shape[l]),h*=e.shape[l];return{batchSize:c,sliceSize:h,outerSize:u,dimSize:a,outputShape:i}}const _$=Object.freeze(Object.defineProperty({__proto__:null,collectGatherOpShapeInfo:T$,computeOutShape:I$,segOpComputeOptimalWindowSize:S$},Symbol.toStringTag,{value:"Module"}));/**
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
 */function A$(e){try{return e.map(t=>xn(t))}catch(t){throw new Error(`Failed to decode encoded string bytes into utf-8, error: ${t}`)}}function D$(e){return e.map(t=>on(t))}const N$=Object.freeze(Object.defineProperty({__proto__:null,ERF_A1:Vy,ERF_A2:jy,ERF_A3:Hy,ERF_A4:Xy,ERF_A5:Zy,ERF_P:Ky,PARALLELIZE_THRESHOLD:bs,get RowPartitionType(){return _t},SELU_SCALE:zy,SELU_SCALEALPHA:Gy,applyActivation:zn,assertAndGetBroadcastShape:et,assertAxesAreInnerMostDims:xp,assertParamsConsistent:Dy,assignToTypedArray:n$,axesAreInnerMostDims:qr,calculateShapes:cu,checkEinsumDimSizes:c$,checkPadOnDimRoundingMode:xt,combineLocations:Bc,combineRaggedTensorToTensorShapes:My,complexWithEvenIndex:Qy,complexWithOddIndex:t$,computeConv2DInfo:cn,computeConv3DInfo:Sc,computeDefaultPad:Lr,computeDilation2DInfo:Gf,computeOptimalWindowSize:Cy,computeOutAndReduceShapes:kp,computeOutShape:Ny,computePool2DInfo:vc,computePool3DInfo:zf,convertConv2DDataFormat:Ic,decodeEinsumEquation:a$,eitherStridesOrDilationsAreOne:Pt,expandShapeToKeepDim:ln,exponent:s$,exponents:r$,fromStringArrayToUint8:D$,fromUint8ToStringArray:A$,getAxesPermutation:vp,getBroadcastDims:Nc,getComplexWithIndex:e$,getEinsumComputePath:u$,getEinsumPermutation:i$,getFusedBiasGradient:Gn,getFusedDyActivation:qn,getImageCenter:Py,getInnerMostAxes:Ip,getPermuted:Ly,getRaggedRank:By,getReductionAxes:Ur,getReshaped:Oy,getReshapedPermuted:Wy,getRowPartitionTypesHelper:Fy,getSliceBeginCoords:Uy,getSliceSize:qy,getSparseFillEmptyRowsIndicesDenseShapeMismatch:d$,getSparseFillEmptyRowsNegativeIndexErrorMessage:p$,getSparseFillEmptyRowsOutOfRangeIndexErrorMessage:g$,getSparseReshapeEmptyTensorZeroOutputDimErrorMessage:w$,getSparseReshapeInputOutputMismatchErrorMessage:$$,getSparseReshapeInputOutputMultipleErrorMessage:y$,getSparseReshapeMultipleNegativeOneOutputDimErrorMessage:m$,getSparseReshapeNegativeOutputDimErrorMessage:b$,getSparseSegmentReductionIndicesOutOfRangeErrorMessage:v$,getSparseSegmentReductionNegativeSegmentIdsErrorMessage:E$,getSparseSegmentReductionNonIncreasingSegmentIdsErrorMessage:k$,getSparseSegmentReductionSegmentIdOutOfRangeErrorMessage:x$,getUndoAxesPermutation:Sp,isIdentityPermutation:l$,log:Dl,mergeRealAndImagArrays:Jy,prepareAndValidate:Iu,prepareSplitSize:f$,segment_util:_$,shouldFuse:Kn,slice_util:Ru,splitRealAndImagArrays:Yy,stridesOrDilationsArePositive:ce,tupleValuesAreOne:Xe,upcastType:Fn,validateDefaultValueShape:Ry,validateInput:Un,validateUpdateShape:os,warn:Wt},Symbol.toStringTag,{value:"Module"}));/**
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
 */const M$=Object.freeze(Object.defineProperty({__proto__:null,nonMaxSuppressionV3Impl:pu,nonMaxSuppressionV4Impl:gu,nonMaxSuppressionV5Impl:mu,whereImpl:uu},Symbol.toStringTag,{value:"Module"}));/**
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
 */P1();const B$=Object.freeze(Object.defineProperty({__proto__:null,Abs:Ys,Acos:Qs,Acosh:to,AdadeltaOptimizer:us,AdagradOptimizer:ls,AdamOptimizer:hs,AdamaxOptimizer:fs,Add:Ar,AddN:eo,All:no,Any:ro,ArgMax:so,ArgMin:oo,Asin:ao,Asinh:io,Atan:co,Atan2:lo,Atanh:uo,AvgPool:ho,AvgPool3D:fo,AvgPool3DGrad:fl,AvgPoolGrad:hl,BatchMatMul:po,BatchToSpaceND:go,Bincount:mo,BitwiseAnd:bo,BroadcastArgs:wo,BroadcastTo:dl,Cast:Dr,Ceil:yo,ClipByValue:$o,Complex:Eo,ComplexAbs:ko,Concat:xo,Conv2D:vo,Conv2DBackpropFilter:So,Conv2DBackpropInput:Io,Conv3D:To,Conv3DBackpropFilterV2:pl,Conv3DBackpropInputV2:_o,Cos:Ao,Cosh:Do,CropAndResize:Fo,Cumprod:No,Cumsum:Mo,DataStorage:Gu,DenseBincount:Bo,DepthToSpace:Ro,DepthwiseConv2dNative:Co,DepthwiseConv2dNativeBackpropFilter:Po,DepthwiseConv2dNativeBackpropInput:Oo,Diag:Lo,Dilation2D:Wo,Dilation2DBackpropFilter:ml,Dilation2DBackpropInput:gl,Draw:Nr,get ENV(){return Tr},Einsum:qo,Elu:Go,EluGrad:bl,Environment:Zs,Equal:Ko,Erf:zo,Exp:Vo,ExpandDims:jo,Expm1:Ho,FFT:Xo,Fill:Zo,FlipLeftRight:Jo,Floor:Yo,FloorDiv:Qo,FromPixels:Qn,FusedBatchNorm:ta,FusedConv2D:er,FusedDepthwiseConv2D:nr,GatherNd:na,GatherV2:ea,Greater:ra,GreaterEqual:sa,IFFT:oa,Identity:Mr,Imag:aa,IsFinite:ia,IsInf:ca,IsNan:ua,KernelBackend:Ls,LRN:ya,LRNGrad:El,LeakyRelu:la,Less:ha,LessEqual:fa,LinSpace:da,Log:pa,Log1p:ga,LogSoftmax:yl,LogicalAnd:ma,LogicalNot:ba,LogicalOr:wa,LogicalXor:wl,LowerBound:$l,MatrixBandPart:kl,Max:$a,MaxPool:ka,MaxPool3D:xa,MaxPool3DGrad:vl,MaxPoolGrad:xl,MaxPoolWithArgmax:va,Maximum:Ea,Mean:Sa,Min:Ia,Minimum:Ta,MirrorPad:_a,Mod:Aa,MomentumOptimizer:ds,Multinomial:Da,Multiply:Na,Neg:Ma,NonMaxSuppressionV3:Ba,NonMaxSuppressionV4:Ra,NonMaxSuppressionV5:Ca,NotEqual:Fa,OP_SCOPE_SUFFIX:ic,OneHot:Oa,OnesLike:Pa,Optimizer:Jt,OptimizerConstructors:Cu,Pack:La,PadV2:Wa,Pool:Sl,Pow:Ua,Prelu:qa,Prod:Ga,RMSPropOptimizer:ps,RaggedGather:za,RaggedRange:Ka,RaggedTensorToTensor:Va,Range:ja,get Rank(){return ar},Real:Ha,RealDiv:Uo,Reciprocal:Xa,get Reduction(){return it},Relu:Za,Relu6:ti,Reshape:Ja,ResizeBilinear:Qa,ResizeBilinearGrad:Tl,ResizeNearestNeighbor:Ya,ResizeNearestNeighborGrad:Il,Reverse:ei,RotateWithOffset:Ui,Round:ni,Rsqrt:ri,SGDOptimizer:Vn,ScatterNd:si,SearchSorted:ai,Select:ii,Selu:ci,Sigmoid:di,Sign:fi,Sin:li,Sinh:hi,Slice:ui,Softmax:yi,Softplus:pi,SpaceToBatchND:bi,SparseFillEmptyRows:$i,SparseReshape:Ei,SparseSegmentMean:ki,SparseSegmentSum:xi,SparseToDense:vi,SplitV:wi,Sqrt:gi,Square:_l,SquaredDifference:Si,StaticRegexReplace:Ii,Step:Wi,StridedSlice:Ti,StringNGrams:_i,StringSplit:Ai,StringToHashBucketFast:Di,Sub:Ni,Sum:mi,Tan:Mi,Tanh:Fi,Tensor:Q,TensorBuffer:vn,TensorScatterUpdate:oi,Tile:Fr,TopK:Bi,Transform:Ri,Transpose:pn,Unique:Ci,Unpack:Pi,UnsortedSegmentSum:Oi,UpperBound:Al,Variable:Ke,ZerosLike:Li,_FusedMatMul:tr,abs:mt,acos:$f,acosh:kf,add:F,addN:vf,all:If,any:_f,argMax:Df,argMin:Mf,asin:Bf,asinh:Cf,atan:Of,atan2:Wf,atanh:qf,avgPool:Tc,avgPool3d:Yf,backend:lc,backend_util:N$,basicLSTMCell:od,batchNorm:Bn,batchNorm2d:ld,batchNorm3d:fd,batchNorm4d:pd,batchToSpaceND:_c,bincount:Ac,bitwiseAnd:bd,booleanMaskAsync:Ew,broadcastArgs:yd,broadcastTo:bn,broadcast_util:cp,browser:py,buffer:Bt,cast:H,ceil:kd,clipByValue:vd,clone:se,complex:Ht,concat:dt,concat1d:Id,concat2d:_d,concat3d:Dd,concat4d:Md,conv1d:Rd,conv2d:Rn,conv2dTranspose:Od,conv3d:Wd,conv3dTranspose:zd,copyRegisteredKernels:Bl,cos:Vd,cosh:Hd,cosineWindow:is,cumprod:Zd,cumsum:Yd,customGrad:Nt,denseBincount:tp,deprecationWarn:bh,depthToSpace:np,depthwiseConv2d:Wr,device_util:hh,diag:op,dilation2d:ip,disableDeprecationWarnings:mh,dispose:ut,disposeVariables:wh,div:K,divNoNan:dp,dot:gp,dropout:Bw,einsum:$e,elu:Fc,enableDebugMode:gh,enableProdMode:ph,enclosingPowerOfTwo:hu,engine:yh,ensureShape:yp,env:R,equal:Mc,erf:Ep,euclideanNorm:Rp,exp:ue,expandDims:Lt,expm1:Lp,eye:Cc,fft:ns,fill:un,findBackend:Ih,findBackendFactory:Th,floor:Pc,floorDiv:xc,fused:Xw,gather:Oc,gatherND:Nw,gather_util:gy,getBackend:uc,getGradient:rr,getKernel:Ge,getKernelsForBackend:En,grad:ig,grads:cg,greater:Pn,greaterEqual:Lc,ifft:_n,imag:On,image:_1,inTopKAsync:Cw,io:ey,irfft:su,isFinite:Hp,isInf:Zp,isNaN:Yp,keep:cc,kernel_impls:M$,leakyRelu:Wc,less:yr,lessEqual:Gr,linalg:A1,linspace:ng,localResponseNormalization:sg,log:Je,log1p:Uc,logSigmoid:pg,logSoftmax:bg,logSumExp:zc,logicalAnd:Sn,logicalNot:Kc,logicalOr:Vc,logicalXor:xg,losses:D1,lowerBound:Sg,matMul:L,math:sy,max:Te,maxPool:jc,maxPool3d:_g,maxPoolWithArgmax:Dg,maximum:Hc,mean:In,memory:$h,meshgrid:Fg,min:wr,minimum:Tn,mirrorPad:Cg,mod:Og,moments:Wg,movingAverage:vw,mul:T,multiRNNCell:qg,multinomial:zg,neg:At,nextFrame:Ay,norm:Cn,notEqual:Xc,oneHot:$r,ones:re,onesLike:Hg,op:m,outerProduct:Zg,pad:hn,pad1d:Qg,pad2d:em,pad3d:rm,pad4d:om,pool:lm,pow:Ze,prelu:Jc,print:kc,prod:dm,profile:Eh,raggedGather:gm,raggedRange:bm,raggedTensorToTensor:ym,rand:Em,randomGamma:Jm,randomNormal:eu,randomStandardNormal:tb,randomUniform:es,randomUniformInt:rb,range:Ye,ready:vh,real:Qe,reciprocal:ab,registerBackend:_h,registerGradient:Nl,registerKernel:qi,relu:Wn,relu6:nu,removeBackend:Sh,reshape:E,reverse:le,reverse1d:hb,reverse2d:db,reverse3d:gb,reverse4d:bb,rfft:rs,round:ru,rsqrt:$b,scalar:q,scatterND:Iw,scatter_util:ow,searchSorted:zr,selu:kb,separableConv2d:vb,serialization:R1,setBackend:xh,setPlatform:Ah,setdiff1dAsync:Ib,sigmoid:Ie,sign:_b,signal:T1,sin:Db,sinh:Mb,slice:Z,slice1d:Bb,slice2d:Cb,slice3d:Ob,slice4d:Wb,slice_util:Ru,softmax:qb,softplus:Gc,spaceToBatchND:Zc,sparse:N1,sparseToDense:Aw,spectral:I1,split:tn,sqrt:Rt,square:St,squaredDifference:ou,squeeze:ss,stack:en,step:au,stridedSlice:Qb,string:M1,sub:P,sum:z,sumOutType:nh,tan:ew,tanh:br,tensor:xe,tensor1d:kt,tensor2d:We,tensor3d:iu,tensor4d:nw,tensor5d:rw,tensor6d:sw,tensorScatterUpdate:iw,tensor_util:oh,test_util:jm,tidy:tt,tile:Le,time:kh,topk:uw,train:Ty,transpose:An,truncatedNormal:hw,unique:dw,unregisterGradient:Fl,unregisterKernel:Ml,unsortedSegmentSum:gw,unstack:as,upcastType:Fn,upperBound:bw,util:Kl,valueAndGrad:ug,valueAndGrads:lg,variable:ww,variableGrads:qc,version_core:Iy,where:Kt,whereAsync:lu,zeros:Me,zerosLike:bt},Symbol.toStringTag,{value:"Module"}));export{Ls as $,By as A,Ry as B,My as C,tt as D,E,bn as F,Ey as G,ky as H,D$ as I,d$ as J,p$ as K,g$ as L,m$ as M,b$ as N,w$ as O,y$ as P,$$ as Q,_t as R,E$ as S,vn as T,k$ as U,x$ as V,v$ as W,on as X,Ul as Y,wn as Z,nn as _,Ju as a,qy as a$,Gu as a0,yh as a1,ze as a2,Jy as a3,xn as a4,jt as a5,Vu as a6,Wt as a7,qt as a8,q as a9,eo as aA,no as aB,ro as aC,so as aD,oo as aE,ao as aF,io as aG,co as aH,lo as aI,uo as aJ,ho as aK,Pt as aL,vc as aM,fo as aN,zf as aO,fl as aP,hl as aQ,po as aR,ta as aS,ui as aT,xy as aU,by as aV,go as aW,Oy as aX,Ly as aY,Wy as aZ,Uy as a_,yn as aa,Ay as ab,uu as ac,oc as ad,_h as ae,Mr as af,Eo as ag,la as ah,qa as ai,Na as aj,Ja as ak,tl as al,_e as am,Cy as an,vp as ao,Ip as ap,xp as aq,ln as ar,nh as as,mi as at,pn as au,tr as av,Ys as aw,Qs as ax,to as ay,Ar as az,g as b,Qn as b$,mo as b0,bo as b1,wo as b2,Fa as b3,Ha as b4,Dr as b5,Me as b6,el as b7,yo as b8,$o as b9,Wo as bA,Gf as bB,qo as bC,a$ as bD,c$ as bE,u$ as bF,i$ as bG,l$ as bH,Go as bI,bl as bJ,Ko as bK,zo as bL,Ky as bM,Vy as bN,jy as bO,Hy as bP,Xy as bQ,Zy as bR,Vo as bS,jo as bT,Ho as bU,Xo as bV,Zo as bW,rn as bX,Jo as bY,Yo as bZ,Qo as b_,ko as ba,Ny as bb,aa as bc,xo as bd,Dy as be,vo as bf,Ic as bg,cn as bh,So as bi,Io as bj,To as bk,Sc as bl,pl as bm,_o as bn,Ao as bo,Do as bp,Fo as bq,Sp as br,No as bs,Mo as bt,Bo as bu,Ro as bv,Co as bw,Po as bx,Oo as by,Lo as bz,qs as c,Il as c$,er as c0,nr as c1,na as c2,Iu as c3,ea as c4,T$ as c5,ra as c6,sa as c7,oa as c8,ia as c9,yi as cA,Da as cB,Ma as cC,Ba as cD,pu as cE,Ra as cF,gu as cG,Ca as cH,mu as cI,Oa as cJ,Li as cK,Pa as cL,La as cM,ct as cN,Wa as cO,Ua as cP,Ga as cQ,za as cR,Ka as cS,Va as cT,ja as cU,Xa as cV,Za as cW,ti as cX,Qa as cY,Tl as cZ,Ya as c_,ca,ua as cb,ha as cc,fa as cd,da as ce,pa as cf,ga as cg,ma as ch,ba as ci,wa as cj,ya as ck,El as cl,$a as cm,Ea as cn,ka as co,xa as cp,vl as cq,xl as cr,va as cs,Sa as ct,Ia as cu,Ta as cv,_a as cw,Aa as cx,Uo as cy,Ni as cz,Ct as d,ei as d0,Ui as d1,Py as d2,ni as d3,ri as d4,si as d5,cu as d6,ai as d7,ii as d8,ci as d9,Di as dA,Mi as dB,Fi as dC,oi as dD,Fr as dE,Bi as dF,Ri as dG,Ci as dH,Pi as dI,Oi as dJ,I$ as dK,S$ as dL,qi as dM,B$ as dN,Gy as da,zy as db,di as dc,fi as dd,li as de,hi as df,pi as dg,bi as dh,$i as di,Ei as dj,ki as dk,xi as dl,vi as dm,wi as dn,f$ as dp,gi as dq,_l as dr,Si as ds,Ii as dt,Wi as du,Ti as dv,vy as dw,yy as dx,_i as dy,Ai as dz,R as e,Fe as f,N$ as g,Nc as h,lh as i,Qu as j,et as k,Gs as l,ol as m,Ku as n,sl as o,Dn as p,Bt as q,Oe as r,W as s,Mn as t,Sr as u,A$ as v,ql as w,kp as x,Fn as y,Fy as z};
