import{o as af,R as Fc,r as O_,_ as D_,W as x_}from"./vendor-misc-DPMFhYdJ.js";const L_=()=>{};var mh={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cf=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},U_=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],c=n[t++],u=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},uf={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,c=o?n[s+1]:0,u=s+2<n.length,h=u?n[s+2]:0,f=i>>2,m=(i&3)<<4|c>>4;let y=(c&15)<<2|h>>6,S=h&63;u||(S=64,o||(y=64)),r.push(t[f],t[m],t[y],t[S])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(cf(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):U_(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const m=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||m==null)throw new M_;const y=i<<2|c>>4;if(r.push(y),h!==64){const S=c<<4&240|h>>2;if(r.push(S),m!==64){const k=h<<6&192|m;r.push(k)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class M_ extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const F_=function(n){const e=cf(n);return uf.encodeByteArray(e,!0)},uo=function(n){return F_(n).replace(/\./g,"")},lf=function(n){try{return uf.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function B_(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const q_=()=>B_().__FIREBASE_DEFAULTS__,$_=()=>{if(typeof process>"u"||typeof mh>"u")return;const n=mh.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},j_=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&lf(n[1]);return e&&JSON.parse(e)},Lo=()=>{try{return L_()||q_()||$_()||j_()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},hf=n=>Lo()?.emulatorHosts?.[n],Bc=n=>{const e=hf(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},df=()=>Lo()?.config,ff=n=>Lo()?.[`_${n}`];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pf{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mf(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...n};return[uo(JSON.stringify(t)),uo(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function je(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function W_(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(je())}function H_(){const n=Lo()?.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function G_(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function qc(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function z_(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function K_(){const n=je();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Q_(){return!H_()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function $c(){try{return typeof indexedDB=="object"}catch{return!1}}function jc(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{e(s.error?.message||"")}}catch(t){e(t)}})}function gf(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Y_="FirebaseError";class gt extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Y_,Object.setPrototypeOf(this,gt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ur.prototype.create)}}class ur{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?J_(i,r):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new gt(s,c,r)}}function J_(n,e){try{let t=0,r="";for(;t<n.length;){const s=n.indexOf("{$",t);if(s===-1){r+=n.substring(t);break}const i=n.indexOf("}",s+2);if(i===-1){r+=n.substring(t);break}const o=n.substring(s+2,i),c=e[o];r+=n.substring(t,s)+(c!=null?String(c):`<${o}?>`),t=i+1}return r}catch{return n}}function X_(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function rn(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(gh(i)&&gh(o)){if(!rn(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function gh(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qr(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Ts(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[s,i]=r.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function vs(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function Z_(n,e){const t=new ey(n,e);return t.subscribe.bind(t)}class ey{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");ty(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=Ha),s.error===void 0&&(s.error=Ha),s.complete===void 0&&(s.complete=Ha);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function ty(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Ha(){}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ny=1e3,ry=2,sy=4*60*60*1e3,iy=.5;function _h(n,e=ny,t=ry){const r=e*Math.pow(t,n),s=Math.round(iy*r*(Math.random()-.5)*2);return Math.min(sy,r+s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ht(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function ci(n){return(await fetch(n,{credentials:"include"})).ok}class mt{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kn="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oy{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new pf;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e?.identifier),r=e?.optional??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(r)return null;throw s}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(cy(e))try{this.getOrInitializeService({instanceIdentifier:Kn})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=Kn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Kn){return this.instances.has(e)}getOptions(e=Kn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);r===c&&o.resolve(s)}return s}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(r)??new Set;s.add(e),this.onInitCallbacks.set(r,s);const i=this.instances.get(r);return i&&e(i,r),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:ay(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Kn){return this.component?this.component.multipleInstances?e:Kn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function ay(n){return n===Kn?void 0:n}function cy(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uy{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new oy(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Z;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(Z||(Z={}));const ly={debug:Z.DEBUG,verbose:Z.VERBOSE,info:Z.INFO,warn:Z.WARN,error:Z.ERROR,silent:Z.SILENT},hy=Z.INFO,dy={[Z.DEBUG]:"log",[Z.VERBOSE]:"log",[Z.INFO]:"info",[Z.WARN]:"warn",[Z.ERROR]:"error"},fy=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=dy[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Uo{constructor(e){this.name=e,this._logLevel=hy,this._logHandler=fy,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Z))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?ly[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Z.DEBUG,...e),this._logHandler(this,Z.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Z.VERBOSE,...e),this._logHandler(this,Z.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Z.INFO,...e),this._logHandler(this,Z.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Z.WARN,...e),this._logHandler(this,Z.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Z.ERROR,...e),this._logHandler(this,Z.ERROR,...e)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class py{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(my(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function my(n){return n.getComponent()?.type==="VERSION"}const cc="@firebase/app",yh="0.16.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sn=new Uo("@firebase/app"),gy="@firebase/app-compat",_y="@firebase/analytics-compat",yy="@firebase/analytics",wy="@firebase/app-check-compat",Ey="@firebase/app-check",Iy="@firebase/auth",Ty="@firebase/auth-compat",vy="@firebase/database",Ay="@firebase/data-connect",Ry="@firebase/database-compat",Py="@firebase/functions",Sy="@firebase/functions-compat",by="@firebase/installations",Cy="@firebase/installations-compat",ky="@firebase/messaging",Ny="@firebase/messaging-compat",Vy="@firebase/performance",Oy="@firebase/performance-compat",Dy="@firebase/remote-config",xy="@firebase/remote-config-compat",Ly="@firebase/storage",Uy="@firebase/storage-compat",My="@firebase/firestore",Fy="@firebase/ai",By="@firebase/firestore-compat",qy="firebase",$y="12.17.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uc="[DEFAULT]",jy={[cc]:"fire-core",[gy]:"fire-core-compat",[yy]:"fire-analytics",[_y]:"fire-analytics-compat",[Ey]:"fire-app-check",[wy]:"fire-app-check-compat",[Iy]:"fire-auth",[Ty]:"fire-auth-compat",[vy]:"fire-rtdb",[Ay]:"fire-data-connect",[Ry]:"fire-rtdb-compat",[Py]:"fire-fn",[Sy]:"fire-fn-compat",[by]:"fire-iid",[Cy]:"fire-iid-compat",[ky]:"fire-fcm",[Ny]:"fire-fcm-compat",[Vy]:"fire-perf",[Oy]:"fire-perf-compat",[Dy]:"fire-rc",[xy]:"fire-rc-compat",[Ly]:"fire-gcs",[Uy]:"fire-gcs-compat",[My]:"fire-fst",[By]:"fire-fst-compat",[Fy]:"fire-vertex","fire-js":"fire-js",[qy]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bs=new Map,Wy=new Map,lc=new Map;function wh(n,e){try{n.container.addComponent(e)}catch(t){sn.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Tt(n){const e=n.name;if(lc.has(e))return sn.debug(`There were multiple attempts to register component ${e}.`),!1;lc.set(e,n);for(const t of Bs.values())wh(t,n);for(const t of Wy.values())wh(t,n);return!0}function Gt(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function pe(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hy={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Yt=new ur("app","Firebase",Hy);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gy{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new mt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Yt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lr=$y;function zy(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:uc,automaticDataCollectionEnabled:!0,...e},s=r.name;if(typeof s!="string"||!s)throw Yt.create("bad-app-name",{appName:String(s)});if(t||(t=df()),!t)throw Yt.create("no-options");const i=Bs.get(s);if(i)if(rn(t,i.options)){if(rn(r,i.config))return i;throw Yt.create("duplicate-app",{appName:s,mismatchedParam:"config",oldValue:JSON.stringify(i.config),newValue:JSON.stringify(r)})}else throw Yt.create("duplicate-app",{appName:s,mismatchedParam:"options",oldValue:JSON.stringify(i.options),newValue:JSON.stringify(t)});const o=new uy(s);for(const u of lc.values())o.addComponent(u);const c=new Gy(t,r,o);return Bs.set(s,c),c}function ui(n=uc){const e=Bs.get(n);if(!e&&n===uc&&df())return zy();if(!e)throw Yt.create("no-app",{appName:n});return e}function Tk(){return Array.from(Bs.values())}function $e(n,e,t){let r=jy[n]??n;t&&(r+=`-${t}`);const s=r.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const o=[`Unable to register library "${r}" with version "${e}":`];s&&o.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),sn.warn(o.join(" "));return}Tt(new mt(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ky="firebase-heartbeat-database",Qy=1,qs="firebase-heartbeat-store";let Ga=null;function _f(){return Ga||(Ga=af(Ky,Qy,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(qs)}catch(t){console.warn(t)}}}}).catch(n=>{throw Yt.create("idb-open",{originalErrorMessage:n.message})})),Ga}async function Yy(n){try{const t=(await _f()).transaction(qs),r=await t.objectStore(qs).get(yf(n));return await t.done,r}catch(e){if(e instanceof gt)sn.warn(e.message);else{const t=Yt.create("idb-get",{originalErrorMessage:e?.message});sn.warn(t.message)}}}async function Eh(n,e){try{const r=(await _f()).transaction(qs,"readwrite");await r.objectStore(qs).put(e,yf(n)),await r.done}catch(t){if(t instanceof gt)sn.warn(t.message);else{const r=Yt.create("idb-set",{originalErrorMessage:t?.message});sn.warn(r.message)}}}function yf(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jy=1024,Xy=30;class Zy{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new tw(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){try{const t=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=Ih();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(s=>s.date===r))return;if(this._heartbeatsCache.heartbeats.push({date:r,agent:t}),this._heartbeatsCache.heartbeats.length>Xy){const s=nw(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(s,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){sn.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";const e=Ih(),{heartbeatsToSend:t,unsentEntries:r}=ew(this._heartbeatsCache.heartbeats),s=uo(JSON.stringify({version:2,heartbeats:t}));return this._heartbeatsCache.lastSentHeartbeatDate=e,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(e){return sn.warn(e),""}}}function Ih(){return new Date().toISOString().substring(0,10)}function ew(n,e=Jy){const t=[];let r=n.slice();for(const s of n){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),Th(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),Th(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class tw{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return $c()?jc().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Yy(this.app);return t?.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Eh(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Eh(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function Th(n){return uo(JSON.stringify({version:2,heartbeats:n})).length}function nw(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rw(n){Tt(new mt("platform-logger",e=>new py(e),"PRIVATE")),Tt(new mt("heartbeat",e=>new Zy(e),"PRIVATE")),$e(cc,yh,n),$e(cc,yh,"esm2020"),$e("fire-js","")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */rw("");function wf(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const sw=wf,Ef=new ur("auth","Firebase",wf());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lo=new Uo("@firebase/auth");function If(n,...e){lo.logLevel<=Z.WARN&&lo.warn(`Auth (${lr}): ${n}`,...e)}function Ji(n,...e){lo.logLevel<=Z.ERROR&&lo.error(`Auth (${lr}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vt(n,...e){throw Hc(n,...e)}function Ye(n,...e){return Hc(n,...e)}function Wc(n,e,t){const r={...sw(),[e]:t};return new ur("auth","Firebase",r).create(e,{appName:n.name})}function Je(n){return Wc(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function li(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&vt(n,"argument-error"),Wc(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Hc(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Ef.create(n,...e)}function L(n,e,...t){if(!n)throw Hc(e,...t)}function Jt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Ji(e),new Error(e)}function on(n,e){n||Jt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $s(){return typeof self<"u"&&self.location?.href||""}function Gc(){return vh()==="http:"||vh()==="https:"}function vh(){return typeof self<"u"&&self.location?.protocol||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iw(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Gc()||qc()||"connection"in navigator)?navigator.onLine:!0}function ow(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hi{constructor(e,t){this.shortDelay=e,this.longDelay=t,on(t>e,"Short delay should be less than long delay!"),this.isMobile=W_()||z_()}get(){return iw()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zc(n,e){on(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tf{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Jt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Jt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Jt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const aw={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cw=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],uw=new hi(3e4,6e4);function Pe(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function Se(n,e,t,r,s={}){return vf(n,s,async()=>{let i={},o={};r&&(e==="GET"?o=r:i={body:JSON.stringify(r)});const c=qr({...o,key:n.config.apiKey}).slice(1),u=await n._getAdditionalHeaders();u["Content-Type"]="application/json",n.languageCode&&(u["X-Firebase-Locale"]=n.languageCode);const h={method:e,headers:u,...i};return G_()||(h.referrerPolicy="strict-origin-when-cross-origin"),n.emulatorConfig&&Ht(n.emulatorConfig.host)&&(h.credentials="include"),Tf.fetch()(await Af(n,n.config.apiHost,t,c),h)})}async function vf(n,e,t){n._canInitEmulator=!1;const r={...aw,...e};try{const s=new hw(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw As(n,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const c=i.ok?o.errorMessage:o.error.message,[u,h]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw As(n,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw As(n,"email-already-in-use",o);if(u==="USER_DISABLED")throw As(n,"user-disabled",o);const f=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw Wc(n,f,h);vt(n,f)}}catch(s){if(s instanceof gt)throw s;vt(n,"network-request-failed",{message:String(s)})}}async function ln(n,e,t,r,s={}){const i=await Se(n,e,t,r,s);return"mfaPendingCredential"in i&&vt(n,"multi-factor-auth-required",{_serverResponse:i}),i}async function Af(n,e,t,r){const s=`${e}${t}?${r}`,i=n,o=i.config.emulator?zc(n.config,s):`${n.config.apiScheme}://${s}`;return cw.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function lw(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class hw{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(Ye(this.auth,"network-request-failed")),uw.get())})}}function As(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=Ye(n,e,r);return s.customData._tokenResponse=t,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ah(n){return n!==void 0&&n.getResponse!==void 0}function Rh(n){return n!==void 0&&n.enterprise!==void 0}class Rf{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return lw(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dw(n){return(await Se(n,"GET","/v1/recaptchaParams")).recaptchaSiteKey||""}async function Pf(n,e){return Se(n,"GET","/v2/recaptchaConfig",Pe(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fw(n,e){return Se(n,"POST","/v1/accounts:delete",e)}async function pw(n,e){return Se(n,"POST","/v1/accounts:update",e)}async function ho(n,e){return Se(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bs(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function mw(n,e=!1){const t=$(n),r=await t.getIdToken(e),s=Mo(r);L(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i?.sign_in_provider;return{claims:s,token:r,authTime:bs(za(s.auth_time)),issuedAtTime:bs(za(s.iat)),expirationTime:bs(za(s.exp)),signInProvider:o||null,signInSecondFactor:i?.sign_in_second_factor||null}}function za(n){return Number(n)*1e3}function Mo(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Ji("JWT malformed, contained fewer than 3 sections"),null;try{const s=lf(t);return s?JSON.parse(s):(Ji("Failed to decode base64 JWT payload"),null)}catch(s){return Ji("Caught error parsing JWT payload as JSON",s?.toString()),null}}function Ph(n){const e=Mo(n);return L(e,"internal-error"),L(typeof e.exp<"u","internal-error"),L(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function rr(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof gt&&gw(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function gw({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _w{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hc{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=bs(this.lastLoginAt),this.creationTime=bs(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function js(n){const e=n.auth,t=await n.getIdToken(),r=await rr(n,ho(e,{idToken:t}));L(r?.users.length,e,"internal-error");const s=r.users[0];n._notifyReloadListener(s);const i=s.providerUserInfo?.length?bf(s.providerUserInfo):[],o=yw(n.providerData,i),c=n.isAnonymous,u=!(n.email&&s.passwordHash)&&!o?.length,h=c?u:!1,f={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new hc(s.createdAt,s.lastLoginAt),isAnonymous:h};Object.assign(n,f)}async function Sf(n){const e=$(n);await js(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function yw(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function bf(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ww(n,e){const t=await vf(n,{},async()=>{const r=qr({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,o=await Af(n,s,"/v1/token",`key=${i}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:c,body:r};return n.emulatorConfig&&Ht(n.emulatorConfig.host)&&(u.credentials="include"),Tf.fetch()(o,u)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function Ew(n,e){return Se(n,"POST","/v2/accounts:revokeToken",Pe(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class br{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){L(e.idToken,"internal-error"),L(typeof e.idToken<"u","internal-error"),L(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Ph(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){L(e.length!==0,"internal-error");const t=Ph(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(L(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await ww(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,o=new br;return r&&(L(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),s&&(L(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(L(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new br,this.toJSON())}_performRefresh(){return Jt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yn(n,e){L(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Pt{constructor({uid:e,auth:t,stsTokenManager:r,...s}){this.providerId="firebase",this.proactiveRefresh=new _w(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new hc(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await rr(this,this.stsTokenManager.getToken(this.auth,e));return L(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return mw(this,e)}reload(){return Sf(this)}_assign(e){this!==e&&(L(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Pt({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){L(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await js(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(pe(this.auth.app))return Promise.reject(Je(this.auth));const e=await this.getIdToken();return await rr(this,fw(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,s=t.email??void 0,i=t.phoneNumber??void 0,o=t.photoURL??void 0,c=t.tenantId??void 0,u=t._redirectEventId??void 0,h=t.createdAt??void 0,f=t.lastLoginAt??void 0,{uid:m,emailVerified:y,isAnonymous:S,providerData:k,stsTokenManager:U}=t;L(m&&U,e,"internal-error");const O=br.fromJSON(this.name,U);L(typeof m=="string",e,"internal-error"),yn(r,e.name),yn(s,e.name),L(typeof y=="boolean",e,"internal-error"),L(typeof S=="boolean",e,"internal-error"),yn(i,e.name),yn(o,e.name),yn(c,e.name),yn(u,e.name),yn(h,e.name),yn(f,e.name);const W=new Pt({uid:m,auth:e,email:s,emailVerified:y,displayName:r,isAnonymous:S,photoURL:o,phoneNumber:i,tenantId:c,stsTokenManager:O,createdAt:h,lastLoginAt:f});return k&&Array.isArray(k)&&(W.providerData=k.map(K=>({...K}))),u&&(W._redirectEventId=u),W}static async _fromIdTokenResponse(e,t,r=!1){const s=new br;s.updateFromServerResponse(t);const i=new Pt({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await js(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];L(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?bf(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!i?.length,c=new br;c.updateFromIdToken(r);const u=new Pt({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:o}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new hc(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!i?.length};return Object.assign(u,h),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sh=new Map;function Xt(n){on(n instanceof Function,"Expected a class definition");let e=Sh.get(n);return e?(on(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Sh.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cf{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Cf.type="NONE";const dc=Cf;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xi(n,e,t){return`firebase:${n}:${e}:${t}`}class Cr{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Xi(this.userKey,s.apiKey,i),this.fullPersistenceKey=Xi("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await ho(this.auth,{idToken:e}).catch(()=>{});return t?Pt._fromGetAccountInfoResponse(this.auth,t,e):null}return Pt._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new Cr(Xt(dc),e,r);const s=(await Promise.all(t.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let i=s[0]||Xt(dc);const o=Xi(r,e.config.apiKey,e.name);let c=null;for(const h of t)try{const f=await h._get(o);if(f){let m;if(typeof f=="string"){const y=await ho(e,{idToken:f}).catch(()=>{});if(!y)break;m=await Pt._fromGetAccountInfoResponse(e,y,f)}else m=Pt._fromJSON(e,f);h!==i&&(c=m),i=h;break}}catch{}const u=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!u.length?new Cr(i,e,r):(i=u[0],c&&await i._set(o,c.toJSON()),await Promise.all(t.map(async h=>{if(h!==i)try{await h._remove(o)}catch{}})),new Cr(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bh(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Of(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(kf(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(xf(e))return"Blackberry";if(Lf(e))return"Webos";if(Nf(e))return"Safari";if((e.includes("chrome/")||Vf(e))&&!e.includes("edge/"))return"Chrome";if(Df(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if(r?.length===2)return r[1]}return"Other"}function kf(n=je()){return/firefox\//i.test(n)}function Nf(n=je()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Vf(n=je()){return/crios\//i.test(n)}function Of(n=je()){return/iemobile/i.test(n)}function Df(n=je()){return/android/i.test(n)}function xf(n=je()){return/blackberry/i.test(n)}function Lf(n=je()){return/webos/i.test(n)}function Kc(n=je()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function Iw(n=je()){return Kc(n)&&!!window.navigator?.standalone}function Tw(){return K_()&&document.documentMode===10}function Uf(n=je()){return Kc(n)||Df(n)||Lf(n)||xf(n)||/windows phone/i.test(n)||Of(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mf(n,e=[]){let t;switch(n){case"Browser":t=bh(je());break;case"Worker":t=`${bh(je())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${lr}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vw{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((o,c)=>{try{const u=e(i);o(u)}catch(u){c(u)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r?.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Aw(n,e={}){return Se(n,"GET","/v2/passwordPolicy",Pe(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rw=6;class Pw{constructor(e){const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??Rw,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sw{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Ch(this),this.idTokenSubscription=new Ch(this),this.beforeStateQueue=new vw(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Ef,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Xt(t)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await Cr.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await ho(this,{idToken:e}),r=await Pt._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(pe(this.app)){const i=this.app.settings.authIdToken;return i?new Promise(o=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(i).then(o,o))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const i=this.redirectUser?._redirectEventId,o=r?._redirectEventId,c=await this.tryRedirectSignIn(e);(!i||i===o)&&c?.user&&(r=c.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(r)}catch(i){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(i))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return L(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await js(e)}catch(t){if(t?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=ow()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(pe(this.app))return Promise.reject(Je(this));const t=e?$(e):null;return t&&L(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&L(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return pe(this.app)?Promise.reject(Je(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return pe(this.app)?Promise.reject(Je(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Xt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Aw(this),t=new Pw(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ur("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await Ew(this,r)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Xt(e)||this._popupRedirectResolver;L(t,this,"argument-error"),this.redirectPersistenceManager=await Cr.create(this,[Xt(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(L(c,this,"internal-error"),c.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const u=e.addObserver(t,r,s);return()=>{o=!0,u()}}else{const u=e.addObserver(t);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return L(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Mf(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){if(pe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&If(`Error while retrieving App Check token: ${e.error}`),e?.token}}function be(n){return $(n)}class Ch{constructor(e){this.auth=e,this.observer=null,this.addObserver=Z_(t=>this.observer=t)}get next(){return L(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let di={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function bw(n){di=n}function Qc(n){return di.loadJS(n)}function Cw(){return di.recaptchaV2Script}function kw(){return di.recaptchaEnterpriseScript}function Nw(){return di.gapiScript}function Ff(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vw=500,Ow=6e4,qi=1e12;class Dw{constructor(e){this.auth=e,this.counter=qi,this._widgets=new Map}render(e,t){const r=this.counter;return this._widgets.set(r,new Uw(e,this.auth.name,t||{})),this.counter++,r}reset(e){const t=e||qi;this._widgets.get(t)?.delete(),this._widgets.delete(t)}getResponse(e){const t=e||qi;return this._widgets.get(t)?.getResponse()||""}async execute(e){const t=e||qi;return this._widgets.get(t)?.execute(),""}}class xw{constructor(){this.enterprise=new Lw}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class Lw{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class Uw{constructor(e,t,r){this.params=r,this.timerId=null,this.deleted=!1,this.responseToken=null,this.clickHandler=()=>{this.execute()};const s=typeof e=="string"?document.getElementById(e):e;L(s,"argument-error",{appName:t}),this.container=s,this.isVisible=this.params.size!=="invisible",this.isVisible?this.execute():this.container.addEventListener("click",this.clickHandler)}getResponse(){return this.checkIfDeleted(),this.responseToken}delete(){this.checkIfDeleted(),this.deleted=!0,this.timerId&&(clearTimeout(this.timerId),this.timerId=null),this.container.removeEventListener("click",this.clickHandler)}execute(){this.checkIfDeleted(),!this.timerId&&(this.timerId=window.setTimeout(()=>{this.responseToken=Mw(50);const{callback:e,"expired-callback":t}=this.params;if(e)try{e(this.responseToken)}catch{}this.timerId=window.setTimeout(()=>{if(this.timerId=null,this.responseToken=null,t)try{t()}catch{}this.isVisible&&this.execute()},Ow)},Vw))}checkIfDeleted(){if(this.deleted)throw new Error("reCAPTCHA mock was already deleted!")}}function Mw(n){const e=[],t="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let r=0;r<n;r++)e.push(t.charAt(Math.floor(Math.random()*t.length)));return e.join("")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fw="recaptcha-enterprise",Cs="NO_RECAPTCHA",kh="onFirebaseAuthREInstanceReady";class zt{constructor(e){this.type=Fw,this.auth=be(e)}async verify(e="verify",t=!1){async function r(i){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,c)=>{Pf(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)c(new Error("recaptcha Enterprise site key undefined"));else{const h=new Rf(u);return i.tenantId==null?i._agentRecaptchaConfig=h:i._tenantRecaptchaConfigs[i.tenantId]=h,o(h.siteKey)}}).catch(u=>{c(u)})})}function s(i,o,c){const u=window.grecaptcha;Rh(u)?u.enterprise.ready(()=>{u.enterprise.execute(i,{action:e}).then(h=>{o(h)}).catch(()=>{o(Cs)})}):c(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new xw().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{r(this.auth).then(async c=>{if(!t&&Rh(window.grecaptcha)&&zt.scriptInjectionDeferred)await zt.scriptInjectionDeferred.promise,s(c,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let u=kw();u.length!==0&&(u+=c+`&onload=${kh}`),zt.scriptInjectionDeferred=new pf,window[kh]=()=>{zt.scriptInjectionDeferred?.resolve()},Qc(u).then(()=>zt.scriptInjectionDeferred?.promise).then(()=>{s(c,i,o)}).catch(h=>{o(h)})}}).catch(c=>{o(c)})})}}zt.scriptInjectionDeferred=null;async function ys(n,e,t,r=!1,s=!1){const i=new zt(n);let o;if(s)o=Cs;else try{o=await i.verify(t)}catch{o=await i.verify(t,!0)}const c={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in c){const u=c.phoneEnrollmentInfo.phoneNumber,h=c.phoneEnrollmentInfo.recaptchaToken;Object.assign(c,{phoneEnrollmentInfo:{phoneNumber:u,recaptchaToken:h,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in c){const u=c.phoneSignInInfo.recaptchaToken;Object.assign(c,{phoneSignInInfo:{recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return c}return r?Object.assign(c,{captchaResp:o}):Object.assign(c,{captchaResponse:o}),Object.assign(c,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(c,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),c}async function Tn(n,e,t,r,s){if(s==="EMAIL_PASSWORD_PROVIDER")if(n._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const i=await ys(n,e,t,t==="getOobCode");return r(n,i)}else return r(n,e).catch(async i=>{if(i.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const o=await ys(n,e,t,t==="getOobCode");return r(n,o)}else return Promise.reject(i)});else if(s==="PHONE_PROVIDER")if(n._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){const i=await ys(n,e,t);return r(n,i).catch(async o=>{if(n._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&(o.code==="auth/missing-recaptcha-token"||o.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${t} flow.`);const c=await ys(n,e,t,!1,!0);return r(n,c)}return Promise.reject(o)})}else{const i=await ys(n,e,t,!1,!0);return r(n,i)}else return Promise.reject(s+" provider is not supported.")}async function Bw(n){const e=be(n),t=await Pf(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),r=new Rf(t);e.tenantId==null?e._agentRecaptchaConfig=r:e._tenantRecaptchaConfigs[e.tenantId]=r,r.isAnyProviderEnabled()&&new zt(e).verify()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qw(n,e){const t=Gt(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(rn(i,e??{}))return s;vt(s,"already-initialized")}return t.initialize({options:e})}function $w(n,e){const t=e?.persistence||[],r=(Array.isArray(t)?t:[t]).map(Xt);e?.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e?.popupRedirectResolver)}function fc(n,e,t){const r=be(n);L(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=Bf(e),{host:o,port:c}=jw(e),u=c===null?"":`:${c}`,h={url:`${i}//${o}${u}/`},f=Object.freeze({host:o,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){L(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),L(rn(h,r.config.emulator)&&rn(f,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=h,r.emulatorConfig=f,r.settings.appVerificationDisabledForTesting=!0,Ht(o)?ci(`${i}//${o}${u}`):Ww()}function Bf(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function jw(n){const e=Bf(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:Nh(r.substr(i.length+1))}}else{const[i,o]=r.split(":");return{host:i,port:Nh(o)}}}function Nh(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function Ww(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fo{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Jt("not implemented")}_getIdTokenResponse(e){return Jt("not implemented")}_linkToIdToken(e,t){return Jt("not implemented")}_getReauthenticationResolver(e){return Jt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hw(n,e){return Se(n,"POST","/v1/accounts:resetPassword",Pe(n,e))}async function Gw(n,e){return Se(n,"POST","/v1/accounts:update",e)}async function zw(n,e){return Se(n,"POST","/v1/accounts:signUp",e)}async function Kw(n,e){return Se(n,"POST","/v1/accounts:update",Pe(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Qw(n,e){return ln(n,"POST","/v1/accounts:signInWithPassword",Pe(n,e))}async function Bo(n,e){return Se(n,"POST","/v1/accounts:sendOobCode",Pe(n,e))}async function Yw(n,e){return Bo(n,e)}async function Jw(n,e){return Bo(n,e)}async function Xw(n,e){return Bo(n,e)}async function Zw(n,e){return Bo(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function eE(n,e){return ln(n,"POST","/v1/accounts:signInWithEmailLink",Pe(n,e))}async function tE(n,e){return ln(n,"POST","/v1/accounts:signInWithEmailLink",Pe(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ws extends Fo{constructor(e,t,r,s=null){super("password",r),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new Ws(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new Ws(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t?.email&&t?.password){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Tn(e,t,"signInWithPassword",Qw,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return eE(e,{email:this._email,oobCode:this._password});default:vt(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Tn(e,r,"signUpPassword",zw,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return tE(e,{idToken:t,email:this._email,oobCode:this._password});default:vt(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function kr(n,e){return ln(n,"POST","/v1/accounts:signInWithIdp",Pe(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nE="http://localhost";class Bt extends Fo{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Bt(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):vt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s,...i}=t;if(!r||!s)return null;const o=new Bt(r,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return kr(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,kr(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,kr(e,t)}buildRequest(){const e={requestUri:nE,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=qr(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Vh(n,e){return Se(n,"POST","/v1/accounts:sendVerificationCode",Pe(n,e))}async function rE(n,e){return ln(n,"POST","/v1/accounts:signInWithPhoneNumber",Pe(n,e))}async function sE(n,e){const t=await ln(n,"POST","/v1/accounts:signInWithPhoneNumber",Pe(n,e));if(t.temporaryProof)throw As(n,"account-exists-with-different-credential",t);return t}const iE={USER_NOT_FOUND:"user-not-found"};async function oE(n,e){const t={...e,operation:"REAUTH"};return ln(n,"POST","/v1/accounts:signInWithPhoneNumber",Pe(n,t),iE)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xn extends Fo{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,t){return new Xn({verificationId:e,verificationCode:t})}static _fromTokenResponse(e,t){return new Xn({phoneNumber:e,temporaryProof:t})}_getIdTokenResponse(e){return rE(e,this._makeVerificationRequest())}_linkToIdToken(e,t){return sE(e,{idToken:t,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return oE(e,this._makeVerificationRequest())}_makeVerificationRequest(){const{temporaryProof:e,phoneNumber:t,verificationId:r,verificationCode:s}=this.params;return e&&t?{temporaryProof:e,phoneNumber:t}:{sessionInfo:r,code:s}}toJSON(){const e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));const{verificationId:t,verificationCode:r,phoneNumber:s,temporaryProof:i}=e;return!r&&!t&&!s&&!i?null:new Xn({verificationId:t,verificationCode:r,phoneNumber:s,temporaryProof:i})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aE(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function cE(n){const e=Ts(vs(n)).link,t=e?Ts(vs(e)).deep_link_id:null,r=Ts(vs(n)).deep_link_id;return(r?Ts(vs(r)).link:null)||r||t||e||n}class qo{constructor(e){const t=Ts(vs(e)),r=t.apiKey??null,s=t.oobCode??null,i=aE(t.mode??null);L(r&&s&&i,"argument-error"),this.apiKey=r,this.operation=i,this.code=s,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=cE(e);try{return new qo(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class an{constructor(){this.providerId=an.PROVIDER_ID}static credential(e,t){return Ws._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=qo.parseLink(t);return L(r,"argument-error"),Ws._fromEmailAndCode(e,r.code,r.tenantId)}}an.PROVIDER_ID="password";an.EMAIL_PASSWORD_SIGN_IN_METHOD="password";an.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hr{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $r extends hr{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}class me extends $r{static credentialFromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;return L("providerId"in t&&"signInMethod"in t,"argument-error"),Bt._fromParams(t)}credential(e){return this._credential({...e,nonce:e.rawNonce})}_credential(e){return L(e.idToken||e.accessToken,"argument-error"),Bt._fromParams({...e,providerId:this.providerId,signInMethod:this.providerId})}static credentialFromResult(e){return me.oauthCredentialFromTaggedObject(e)}static credentialFromError(e){return me.oauthCredentialFromTaggedObject(e.customData||{})}static oauthCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r,oauthTokenSecret:s,pendingToken:i,nonce:o,providerId:c}=e;if(!r&&!s&&!t&&!i||!c)return null;try{return new me(c)._credential({idToken:t,accessToken:r,nonce:o,pendingToken:i})}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yt extends $r{constructor(){super("facebook.com")}static credential(e){return Bt._fromParams({providerId:yt.PROVIDER_ID,signInMethod:yt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return yt.credentialFromTaggedObject(e)}static credentialFromError(e){return yt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return yt.credential(e.oauthAccessToken)}catch{return null}}}yt.FACEBOOK_SIGN_IN_METHOD="facebook.com";yt.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wt extends $r{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Bt._fromParams({providerId:wt.PROVIDER_ID,signInMethod:wt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return wt.credentialFromTaggedObject(e)}static credentialFromError(e){return wt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return wt.credential(t,r)}catch{return null}}}wt.GOOGLE_SIGN_IN_METHOD="google.com";wt.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Et extends $r{constructor(){super("github.com")}static credential(e){return Bt._fromParams({providerId:Et.PROVIDER_ID,signInMethod:Et.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Et.credentialFromTaggedObject(e)}static credentialFromError(e){return Et.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Et.credential(e.oauthAccessToken)}catch{return null}}}Et.GITHUB_SIGN_IN_METHOD="github.com";Et.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class It extends $r{constructor(){super("twitter.com")}static credential(e,t){return Bt._fromParams({providerId:It.PROVIDER_ID,signInMethod:It.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return It.credentialFromTaggedObject(e)}static credentialFromError(e){return It.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return It.credential(t,r)}catch{return null}}}It.TWITTER_SIGN_IN_METHOD="twitter.com";It.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function qf(n,e){return ln(n,"POST","/v1/accounts:signUp",Pe(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await Pt._fromIdTokenResponse(e,r,s),o=Oh(r);return new qt({user:i,providerId:o,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=Oh(r);return new qt({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function Oh(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function uE(n){if(pe(n.app))return Promise.reject(Je(n));const e=be(n);if(await e._initializationPromise,e.currentUser?.isAnonymous)return new qt({user:e.currentUser,providerId:null,operationType:"signIn"});const t=await qf(e,{returnSecureToken:!0}),r=await qt._fromIdTokenResponse(e,"signIn",t,!0);return await e._updateCurrentUser(r.user),r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fo extends gt{constructor(e,t,r,s){super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,fo.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new fo(e,t,r,s)}}function $f(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?fo._fromErrorAndOperation(n,i,e,r):i})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jf(n){return new Set(n.map(({providerId:e})=>e).filter(e=>!!e))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function lE(n,e){const t=$(n);await $o(!0,t,e);const{providerUserInfo:r}=await pw(t.auth,{idToken:await t.getIdToken(),deleteProvider:[e]}),s=jf(r||[]);return t.providerData=t.providerData.filter(i=>s.has(i.providerId)),s.has("phone")||(t.phoneNumber=null),await t.auth._persistUserIfCurrent(t),t}async function Wf(n,e,t=!1){const r=await rr(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return qt._forOperation(n,"link",r)}async function $o(n,e,t){await js(e);const r=jf(e.providerData),s=n===!1?"provider-already-linked":"no-such-provider";L(r.has(t)===n,e.auth,s)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hE(n,e,t=!1){const{auth:r}=n;if(pe(r.app))return Promise.reject(Je(r));const s="reauthenticate";try{const i=await rr(n,$f(r,s,e,n),t);L(i.idToken,r,"internal-error");const o=Mo(i.idToken);L(o,r,"internal-error");const{sub:c}=o;return L(n.uid===c,r,"user-mismatch"),qt._forOperation(n,s,i)}catch(i){throw i?.code==="auth/user-not-found"&&vt(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hf(n,e,t=!1){if(pe(n.app))return Promise.reject(Je(n));const r="signIn",s=await $f(n,r,e),i=await qt._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}async function Yc(n,e){return Hf(be(n),e)}async function Gf(n,e){const t=$(n);return await $o(!1,t,e.providerId),Wf(t,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dE(n,e){return ln(n,"POST","/v1/accounts:signInWithCustomToken",Pe(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fE(n,e){if(pe(n.app))return Promise.reject(Je(n));const t=be(n),r=await dE(t,{token:e,returnSecureToken:!0}),s=await qt._fromIdTokenResponse(t,"signIn",r);return await t._updateCurrentUser(s.user),s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jo(n,e,t){L(t.url?.length>0,n,"invalid-continue-uri"),L(typeof t.dynamicLinkDomain>"u"||t.dynamicLinkDomain.length>0,n,"invalid-dynamic-link-domain"),L(typeof t.linkDomain>"u"||t.linkDomain.length>0,n,"invalid-hosting-link-domain"),e.continueUrl=t.url,e.dynamicLinkDomain=t.dynamicLinkDomain,e.linkDomain=t.linkDomain,e.canHandleCodeInApp=t.handleCodeInApp,t.iOS&&(L(t.iOS.bundleId.length>0,n,"missing-ios-bundle-id"),e.iOSBundleId=t.iOS.bundleId),t.android&&(L(t.android.packageName.length>0,n,"missing-android-pkg-name"),e.androidInstallApp=t.android.installApp,e.androidMinimumVersionCode=t.android.minimumVersion,e.androidPackageName=t.android.packageName)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Jc(n){const e=be(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function pE(n,e,t){const r=be(n),s={requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"};t&&jo(r,s,t),await Tn(r,s,"getOobCode",Jw,"EMAIL_PASSWORD_PROVIDER")}async function mE(n,e,t){await Hw($(n),{oobCode:e,newPassword:t}).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&Jc(n),r})}async function gE(n,e){await Kw($(n),{oobCode:e})}async function _E(n,e,t){if(pe(n.app))return Promise.reject(Je(n));const r=be(n),o=await Tn(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",qf,"EMAIL_PASSWORD_PROVIDER").catch(u=>{throw u.code==="auth/password-does-not-meet-requirements"&&Jc(n),u}),c=await qt._fromIdTokenResponse(r,"signIn",o);return await r._updateCurrentUser(c.user),c}function yE(n,e,t){return pe(n.app)?Promise.reject(Je(n)):Yc($(n),an.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&Jc(n),r})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wE(n,e,t){const r=be(n),s={requestType:"EMAIL_SIGNIN",email:e,clientType:"CLIENT_TYPE_WEB"};function i(o,c){L(c.handleCodeInApp,r,"argument-error"),c&&jo(r,o,c)}i(s,t),await Tn(r,s,"getOobCode",Xw,"EMAIL_PASSWORD_PROVIDER")}function EE(n,e){return qo.parseLink(e)?.operation==="EMAIL_SIGNIN"}async function IE(n,e,t){if(pe(n.app))return Promise.reject(Je(n));const r=$(n),s=an.credentialWithLink(e,t||$s());return L(s._tenantId===(r.tenantId||null),r,"tenant-id-mismatch"),Yc(r,s)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function TE(n,e){return Se(n,"POST","/v1/accounts:createAuthUri",Pe(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function vE(n,e){const t=Gc()?$s():"http://localhost",r={identifier:e,continueUri:t},{signinMethods:s}=await TE($(n),r);return s||[]}async function AE(n,e){const t=$(n),s={requestType:"VERIFY_EMAIL",idToken:await n.getIdToken()};e&&jo(t.auth,s,e);const{email:i}=await Yw(t.auth,s);i!==n.email&&await n.reload()}async function RE(n,e,t){const r=$(n),i={requestType:"VERIFY_AND_CHANGE_EMAIL",idToken:await n.getIdToken(),newEmail:e};t&&jo(r.auth,i,t);const{email:o}=await Zw(r.auth,i);o!==n.email&&await n.reload()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function PE(n,e){return Se(n,"POST","/v1/accounts:update",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function SE(n,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;const r=$(n),i={idToken:await r.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},o=await rr(r,PE(r.auth,i));r.displayName=o.displayName||null,r.photoURL=o.photoUrl||null;const c=r.providerData.find(({providerId:u})=>u==="password");c&&(c.displayName=r.displayName,c.photoURL=r.photoURL),await r._updateTokensIfNecessary(o)}function bE(n,e){const t=$(n);return pe(t.auth.app)?Promise.reject(Je(t.auth)):zf(t,e,null)}function CE(n,e){return zf($(n),null,e)}async function zf(n,e,t){const{auth:r}=n,i={idToken:await n.getIdToken(),returnSecureToken:!0};e&&(i.email=e),t&&(i.password=t);const o=await rr(n,Gw(r,i));await n._updateTokensIfNecessary(o,!0)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kE(n){if(!n)return null;const{providerId:e}=n,t=n.rawUserInfo?JSON.parse(n.rawUserInfo):{},r=n.isNewUser||n.kind==="identitytoolkit#SignupNewUserResponse";if(!e&&n?.idToken){const s=Mo(n.idToken)?.firebase?.sign_in_provider;if(s){const i=s!=="anonymous"&&s!=="custom"?s:null;return new Nr(r,i)}}if(!e)return null;switch(e){case"facebook.com":return new NE(r,t);case"github.com":return new VE(r,t);case"google.com":return new OE(r,t);case"twitter.com":return new DE(r,t,n.screenName||null);case"custom":case"anonymous":return new Nr(r,null);default:return new Nr(r,e,t)}}class Nr{constructor(e,t,r={}){this.isNewUser=e,this.providerId=t,this.profile=r}}class Kf extends Nr{constructor(e,t,r,s){super(e,t,r),this.username=s}}class NE extends Nr{constructor(e,t){super(e,"facebook.com",t)}}class VE extends Kf{constructor(e,t){super(e,"github.com",t,typeof t?.login=="string"?t?.login:null)}}class OE extends Nr{constructor(e,t){super(e,"google.com",t)}}class DE extends Kf{constructor(e,t,r){super(e,"twitter.com",t,r)}}function xE(n){const{user:e,_tokenResponse:t}=n;return e.isAnonymous&&!t?{providerId:null,isNewUser:!1,profile:null}:kE(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $i(n,e){return $(n).setPersistence(e)}function LE(n,e,t,r){return $(n).onIdTokenChanged(e,t,r)}function UE(n,e,t){return $(n).beforeAuthStateChanged(e,t)}function vk(n,e,t,r){return $(n).onAuthStateChanged(e,t,r)}function Ak(n){return $(n).signOut()}function ME(n,e){return be(n).revokeAccessToken(e)}async function FE(n){return $(n).delete()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dh(n,e){return Se(n,"POST","/v2/accounts/mfaEnrollment:start",Pe(n,e))}const po="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qf{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(po,"1"),this.storage.removeItem(po),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BE=1e3,qE=10;class Yf extends Qf{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Uf(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,c,u)=>{this.notifyListeners(o,u)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},i=this.storage.getItem(r);Tw()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,qE):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},BE)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Yf.type="LOCAL";const Jf=Yf;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xf extends Qf{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Xf.type="SESSION";const Xc=Xf;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $E(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wo{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new Wo(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!o?.size)return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const c=Array.from(o).map(async h=>h(t.origin,i)),u=await $E(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Wo.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ho(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jE{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((c,u)=>{const h=Ho("",20);s.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:s,onMessage(m){const y=m;if(y.data.eventId===h)switch(y.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(y.data.response);break;default:clearTimeout(f),clearTimeout(i),u(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:h,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _e(){return window}function WE(n){_e().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zc(){return typeof _e().WorkerGlobalScope<"u"&&typeof _e().importScripts=="function"}async function HE(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function GE(){return navigator?.serviceWorker?.controller||null}function zE(){return Zc()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zf="firebaseLocalStorageDb",KE=1,mo="firebaseLocalStorage",ep="fbase_key";class fi{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Go(n,e){return n.transaction([mo],e?"readwrite":"readonly").objectStore(mo)}function QE(){const n=indexedDB.deleteDatabase(Zf);return new fi(n).toPromise()}function tp(){const n=indexedDB.open(Zf,KE);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(mo,{keyPath:ep})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(mo)?e(r):(r.close(),await QE(),e(await tp()))})})}async function xh(n,e,t){const r=Go(n,!0).put({[ep]:e,value:t});return new fi(r).toPromise()}async function YE(n,e){const t=Go(n,!1).get(e),r=await new fi(t).toPromise();return r===void 0?null:r.value}function Lh(n,e){const t=Go(n,!0).delete(e);return new fi(t).toPromise()}const JE=800,XE=3;class np{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow)),typeof document<"u"&&typeof document.addEventListener=="function"&&document.addEventListener("visibilitychange",this.onVisibilityChange)}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow)),typeof document<"u"&&typeof document.removeEventListener=="function"&&document.removeEventListener("visibilitychange",this.onVisibilityChange)}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isHiding=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isHiding=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isHiding&&(this.isHiding=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this.onVisibilityChange=()=>{typeof document<"u"&&(document.visibilityState==="hidden"?this.onPageHide():document.visibilityState==="visible"&&this.onPageShow())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){if(this.isHiding)throw new Error("Database is closing/hidden");return this.dbPromise?this.dbPromise:(this.dbPromise=tp(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(this.isHiding||t++>XE)throw r;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return Zc()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Wo._getInstance(zE()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await HE(),!this.activeServiceWorker)return;this.sender=new jE(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||GE()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await xh(e,po,"1"),await Lh(e,po)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>xh(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>YE(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Lh(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isHiding)return[];try{const e=await this._withRetries(s=>{const i=Go(s,!1).getAll();return new fi(i).toPromise()});if(this.isHiding)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}catch(e){return this.isHiding||If(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),JE)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}np.type="LOCAL";const rp=np;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Uh(n,e){return Se(n,"POST","/v2/accounts/mfaSignIn:start",Pe(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ka=Ff("rcb"),ZE=new hi(3e4,6e4);class eI{constructor(){this.hostLanguage="",this.counter=0,this.librarySeparatelyLoaded=!!_e().grecaptcha?.render}load(e,t=""){return L(tI(t),e,"argument-error"),this.shouldResolveImmediately(t)&&Ah(_e().grecaptcha)?Promise.resolve(_e().grecaptcha):new Promise((r,s)=>{const i=_e().setTimeout(()=>{s(Ye(e,"network-request-failed"))},ZE.get());_e()[Ka]=()=>{_e().clearTimeout(i),delete _e()[Ka];const c=_e().grecaptcha;if(!c||!Ah(c)){s(Ye(e,"internal-error"));return}const u=c.render;c.render=(h,f)=>{const m=u(h,f);return this.counter++,m},this.hostLanguage=t,r(c)};const o=`${Cw()}?${qr({onload:Ka,render:"explicit",hl:t})}`;Qc(o).catch(()=>{clearTimeout(i),s(Ye(e,"internal-error"))})})}clearedOneInstance(){this.counter--}shouldResolveImmediately(e){return!!_e().grecaptcha?.render&&(e===this.hostLanguage||this.counter>0||this.librarySeparatelyLoaded)}}function tI(n){return n.length<=6&&/^\s*[a-zA-Z0-9\-]*\s*$/.test(n)}class nI{async load(e){return new Dw(e)}clearedOneInstance(){}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ks="recaptcha",rI={theme:"light",type:"image"};class Mh{constructor(e,t,r={...rI}){this.parameters=r,this.type=ks,this.destroyed=!1,this.widgetId=null,this.tokenChangeListeners=new Set,this.renderPromise=null,this.recaptcha=null,this.auth=be(e),this.isInvisible=this.parameters.size==="invisible",L(typeof document<"u",this.auth,"operation-not-supported-in-this-environment");const s=typeof t=="string"?document.getElementById(t):t;L(s,this.auth,"argument-error"),this.container=s,this.parameters.callback=this.makeTokenCallback(this.parameters.callback),this._recaptchaLoader=this.auth.settings.appVerificationDisabledForTesting?new nI:new eI,this.validateStartingState()}async verify(){this.assertNotDestroyed();const e=await this.render(),t=this.getAssertedRecaptcha(),r=t.getResponse(e);return r||new Promise(s=>{const i=o=>{o&&(this.tokenChangeListeners.delete(i),s(o))};this.tokenChangeListeners.add(i),this.isInvisible&&t.execute(e)})}render(){try{this.assertNotDestroyed()}catch(e){return Promise.reject(e)}return this.renderPromise?this.renderPromise:(this.renderPromise=this.makeRenderPromise().catch(e=>{throw this.renderPromise=null,e}),this.renderPromise)}_reset(){this.assertNotDestroyed(),this.widgetId!==null&&this.getAssertedRecaptcha().reset(this.widgetId)}clear(){this.assertNotDestroyed(),this.destroyed=!0,this._recaptchaLoader.clearedOneInstance(),this.isInvisible||this.container.childNodes.forEach(e=>{this.container.removeChild(e)})}validateStartingState(){L(!this.parameters.sitekey,this.auth,"argument-error"),L(this.isInvisible||!this.container.hasChildNodes(),this.auth,"argument-error"),L(typeof document<"u",this.auth,"operation-not-supported-in-this-environment")}makeTokenCallback(e){return t=>{if(this.tokenChangeListeners.forEach(r=>r(t)),typeof e=="function")e(t);else if(typeof e=="string"){const r=_e()[e];typeof r=="function"&&r(t)}}}assertNotDestroyed(){L(!this.destroyed,this.auth,"internal-error")}async makeRenderPromise(){if(await this.init(),!this.widgetId){let e=this.container;if(!this.isInvisible){const t=document.createElement("div");e.appendChild(t),e=t}this.widgetId=this.getAssertedRecaptcha().render(e,this.parameters)}return this.widgetId}async init(){L(Gc()&&!Zc(),this.auth,"internal-error"),await sI(),this.recaptcha=await this._recaptchaLoader.load(this.auth,this.auth.languageCode||void 0);const e=await dw(this.auth);L(e,this.auth,"internal-error"),this.parameters.sitekey=e}getAssertedRecaptcha(){return L(this.recaptcha,this.auth,"internal-error"),this.recaptcha}}function sI(){let n=null;return new Promise(e=>{if(document.readyState==="complete"){e();return}n=()=>e(),window.addEventListener("load",n)}).catch(e=>{throw n&&window.removeEventListener("load",n),e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sp{constructor(e,t){this.verificationId=e,this.onConfirmation=t}confirm(e){const t=Xn._fromVerification(this.verificationId,e);return this.onConfirmation(t)}}async function iI(n,e,t){if(pe(n.app))return Promise.reject(Je(n));const r=be(n),s=await eu(r,e,$(t));return new sp(s,i=>Yc(r,i))}async function oI(n,e,t){const r=$(n);await $o(!1,r,"phone");const s=await eu(r.auth,e,$(t));return new sp(s,i=>Gf(r,i))}async function eu(n,e,t){if(!n._getRecaptchaConfig())try{await Bw(n)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let r;if(typeof e=="string"?r={phoneNumber:e}:r=e,"session"in r){const s=r.session;if("phoneNumber"in r){L(s.type==="enroll",n,"internal-error");const i={idToken:s.credential,phoneEnrollmentInfo:{phoneNumber:r.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await Tn(n,i,"mfaSmsEnrollment",async(h,f)=>{if(f.phoneEnrollmentInfo.captchaResponse===Cs){L(t?.type===ks,h,"argument-error");const m=await Qa(h,f,t);return Dh(h,m)}return Dh(h,f)},"PHONE_PROVIDER").catch(h=>Promise.reject(h))).phoneSessionInfo.sessionInfo}else{L(s.type==="signin",n,"internal-error");const i=r.multiFactorHint?.uid||r.multiFactorUid;L(i,n,"missing-multi-factor-info");const o={mfaPendingCredential:s.credential,mfaEnrollmentId:i,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await Tn(n,o,"mfaSmsSignIn",async(f,m)=>{if(m.phoneSignInInfo.captchaResponse===Cs){L(t?.type===ks,f,"argument-error");const y=await Qa(f,m,t);return Uh(f,y)}return Uh(f,m)},"PHONE_PROVIDER").catch(f=>Promise.reject(f))).phoneResponseInfo.sessionInfo}}else{const s={phoneNumber:r.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await Tn(n,s,"sendVerificationCode",async(u,h)=>{if(h.captchaResponse===Cs){L(t?.type===ks,u,"argument-error");const f=await Qa(u,h,t);return Vh(u,f)}return Vh(u,h)},"PHONE_PROVIDER").catch(u=>Promise.reject(u))).sessionInfo}}finally{t?._reset()}}async function Qa(n,e,t){L(t.type===ks,n,"argument-error");const r=await t.verify();L(typeof r=="string",n,"argument-error");const s={...e};if("phoneEnrollmentInfo"in s){const i=s.phoneEnrollmentInfo.phoneNumber,o=s.phoneEnrollmentInfo.captchaResponse,c=s.phoneEnrollmentInfo.clientType,u=s.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(s,{phoneEnrollmentInfo:{phoneNumber:i,recaptchaToken:r,captchaResponse:o,clientType:c,recaptchaVersion:u}}),s}else if("phoneSignInInfo"in s){const i=s.phoneSignInInfo.captchaResponse,o=s.phoneSignInInfo.clientType,c=s.phoneSignInInfo.recaptchaVersion;return Object.assign(s,{phoneSignInInfo:{recaptchaToken:r,captchaResponse:i,clientType:o,recaptchaVersion:c}}),s}else return Object.assign(s,{recaptchaToken:r}),s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vr{constructor(e){this.providerId=Vr.PROVIDER_ID,this.auth=be(e)}verifyPhoneNumber(e,t){return eu(this.auth,e,$(t))}static credential(e,t){return Xn._fromVerification(e,t)}static credentialFromResult(e){const t=e;return Vr.credentialFromTaggedObject(t)}static credentialFromError(e){return Vr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{phoneNumber:t,temporaryProof:r}=e;return t&&r?Xn._fromTokenResponse(t,r):null}}Vr.PROVIDER_ID="phone";Vr.PHONE_SIGN_IN_METHOD="phone";/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jr(n,e){return e?Xt(e):(L(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tu extends Fo{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return kr(e,this._buildIdpRequest())}_linkToIdToken(e,t){return kr(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return kr(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function aI(n){return Hf(n.auth,new tu(n),n.bypassAuthState)}function cI(n){const{auth:e,user:t}=n;return L(t,e,"internal-error"),hE(t,new tu(n),n.bypassAuthState)}async function uI(n){const{auth:e,user:t}=n;return L(t,e,"internal-error"),Wf(t,new tu(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ip{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:o,type:c}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return aI;case"linkViaPopup":case"linkViaRedirect":return uI;case"reauthViaPopup":case"reauthViaRedirect":return cI;default:vt(this.auth,"internal-error")}}resolve(e){on(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){on(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lI=new hi(2e3,1e4);async function hI(n,e,t){if(pe(n.app))return Promise.reject(Ye(n,"operation-not-supported-in-this-environment"));const r=be(n);li(n,e,hr);const s=jr(r,t);return new Zt(r,"signInViaPopup",e,s).executeNotNull()}async function Rk(n,e,t){const r=$(n);if(pe(r.auth.app))return Promise.reject(Ye(r.auth,"operation-not-supported-in-this-environment"));li(r.auth,e,hr);const s=jr(r.auth,t);return new Zt(r.auth,"reauthViaPopup",e,s,r).executeNotNull()}async function dI(n,e,t){const r=$(n);li(r.auth,e,hr);const s=jr(r.auth,t);return new Zt(r.auth,"linkViaPopup",e,s,r).executeNotNull()}class Zt extends ip{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Zt.currentPopupAction&&Zt.currentPopupAction.cancel(),Zt.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return L(e,this.auth,"internal-error"),e}async onExecution(){on(this.filter.length===1,"Popup operations only handle one event");const e=Ho();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Ye(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(Ye(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Zt.currentPopupAction=null}pollUserCancellation(){const e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Ye(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,lI.get())};e()}}Zt.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fI="pendingRedirect",Zi=new Map;class pI extends ip{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Zi.get(this.auth._key());if(!e){try{const r=await mI(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Zi.set(this.auth._key(),e)}return this.bypassAuthState||Zi.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function mI(n,e){const t=cp(e),r=ap(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}async function op(n,e){return ap(n)._set(cp(e),"true")}function gI(n,e){Zi.set(n._key(),e)}function ap(n){return Xt(n._redirectPersistence)}function cp(n){return Xi(fI,n.config.apiKey,n.name)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _I(n,e,t){return yI(n,e,t)}async function yI(n,e,t){if(pe(n.app))return Promise.reject(Je(n));const r=be(n);li(n,e,hr),await r._initializationPromise;const s=jr(r,t);return await op(s,r),s._openRedirect(r,e,"signInViaRedirect")}function wI(n,e,t){return EI(n,e,t)}async function EI(n,e,t){const r=$(n);li(r.auth,e,hr),await r.auth._initializationPromise;const s=jr(r.auth,t);await $o(!1,r,e.providerId),await op(s,r.auth);const i=await TI(r);return s._openRedirect(r.auth,e,"linkViaRedirect",i)}async function II(n,e){return await be(n)._initializationPromise,up(n,e,!1)}async function up(n,e,t=!1){if(pe(n.app))return Promise.reject(Je(n));const r=be(n),s=jr(r,e),o=await new pI(r,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}async function TI(n){const e=Ho(`${n.uid}:::`);return n._redirectEventId=e,await n.auth._setRedirectUser(n),await n.auth._persistUserIfCurrent(n),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vI=10*60*1e3;class AI{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!RI(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){if(e.error&&!lp(e)){const r=e.error.code?.split("auth/")[1]||"internal-error";t.onError(Ye(this.auth,r))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=vI&&this.cachedEventUids.clear(),this.cachedEventUids.has(Fh(e))}saveEventToCache(e){this.cachedEventUids.add(Fh(e)),this.lastProcessedEventTime=Date.now()}}function Fh(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function lp({type:n,error:e}){return n==="unknown"&&e?.code==="auth/no-auth-event"}function RI(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return lp(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function PI(n,e={}){return Se(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const SI=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,bI=/^https?/;async function CI(n){if(n.config.emulator)return;const{authorizedDomains:e}=await PI(n);for(const t of e)try{if(kI(t))return}catch{}vt(n,"unauthorized-domain")}function kI(n){const e=$s(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!bI.test(t))return!1;if(SI.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const NI=new hi(3e4,6e4);function Bh(){const n=_e().___jsl;if(n?.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function VI(n){return new Promise((e,t)=>{function r(){Bh(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Bh(),t(Ye(n,"network-request-failed"))},timeout:NI.get()})}if(_e().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(_e().gapi?.load)r();else{const s=Ff("iframefcb");return _e()[s]=()=>{gapi.load?r():t(Ye(n,"network-request-failed"))},Qc(`${Nw()}?onload=${s}`).catch(i=>t(i))}}).catch(e=>{throw eo=null,e})}let eo=null;function OI(n){return eo=eo||VI(n),eo}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const DI=new hi(5e3,15e3),xI="__/auth/iframe",LI="emulator/auth/iframe",UI={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},MI=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function FI(n){const e=n.config;L(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?zc(e,LI):`https://${n.config.authDomain}/${xI}`,r={apiKey:e.apiKey,appName:n.name,v:lr},s=MI.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${qr(r).slice(1)}`}async function BI(n){const e=await OI(n),t=_e().gapi;return L(t,n,"internal-error"),e.open({where:document.body,url:FI(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:UI,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const o=Ye(n,"network-request-failed"),c=_e().setTimeout(()=>{i(o)},DI.get());function u(){_e().clearTimeout(c),s(r)}r.ping(u).then(u,()=>{i(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qI={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},$I=500,jI=600,WI="_blank",HI="http://localhost";class qh{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function GI(n,e,t,r=$I,s=jI){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const u={...qI,width:r.toString(),height:s.toString(),top:i,left:o},h=je().toLowerCase();t&&(c=Vf(h)?WI:t),kf(h)&&(e=e||HI,u.scrollbars="yes");const f=Object.entries(u).reduce((y,[S,k])=>`${y}${S}=${k},`,"");if(Iw(h)&&c!=="_self")return zI(e||"",c),new qh(null);const m=window.open(e||"",c,f);L(m,n,"popup-blocked");try{m.focus()}catch{}return new qh(m)}function zI(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const KI="__/auth/handler",QI="emulator/auth/handler",YI=encodeURIComponent("fac");async function $h(n,e,t,r,s,i){L(n.config.authDomain,n,"auth-domain-config-required"),L(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:lr,eventId:s};if(e instanceof hr){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",X_(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,m]of Object.entries({}))o[f]=m}if(e instanceof $r){const f=e.getScopes().filter(m=>m!=="");f.length>0&&(o.scopes=f.join(","))}n.tenantId&&(o.tid=n.tenantId);const c=o;for(const f of Object.keys(c))c[f]===void 0&&delete c[f];const u=await n._getAppCheckToken(),h=u?`#${YI}=${encodeURIComponent(u)}`:"";return`${JI(n)}?${qr(c).slice(1)}${h}`}function JI({config:n}){return n.emulator?zc(n,QI):`https://${n.authDomain}/${KI}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ya="webStorageSupport";class XI{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Xc,this._completeRedirectFn=up,this._overrideRedirectResult=gI}async _openPopup(e,t,r,s){on(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");const i=await $h(e,t,r,$s(),s);return GI(e,i,Ho())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await $h(e,t,r,$s(),s);return WE(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(on(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await BI(e),r=new AI(e);return t.register("authEvent",s=>(L(s?.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Ya,{type:Ya},s=>{const i=s?.[0]?.[Ya];i!==void 0&&t(!!i),vt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=CI(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Uf()||Nf()||Kc()}}const ZI=XI;var jh="@firebase/auth",Wh="1.13.4";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eT{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e(r?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){L(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tT(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function nT(n){Tt(new mt("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=r.options;L(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:o,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Mf(n)},h=new Sw(r,s,i,u);return $w(h,t),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Tt(new mt("auth-internal",e=>{const t=be(e.getProvider("auth").getImmediate());return(r=>new eT(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),$e(jh,Wh,tT(n)),$e(jh,Wh,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rT=5*60,sT=ff("authIdTokenMaxAge")||rT;let Hh=null;const iT=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>sT)return;const s=t?.token;Hh!==s&&(Hh=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function X(n=ui()){const e=Gt(n,"auth");if(e.isInitialized())return e.getImmediate();const t=qw(n,{popupRedirectResolver:ZI,persistence:[rp,Jf,Xc]}),r=ff("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const o=iT(i.toString());UE(t,o,()=>o(t.currentUser)),LE(t,c=>o(c))}}const s=hf("auth");return s&&fc(t,`http://${s}`),t}function oT(){return document.getElementsByTagName("head")?.[0]??document}bw({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=Ye("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",oT().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});nT("Browser");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const aT="type.googleapis.com/google.protobuf.Int64Value",cT="type.googleapis.com/google.protobuf.UInt64Value";function hp(n,e){const t={};for(const r in n)n.hasOwnProperty(r)&&(t[r]=e(n[r]));return t}function go(n){if(n==null)return null;if(n instanceof Number&&(n=n.valueOf()),typeof n=="number"&&isFinite(n)||n===!0||n===!1||Object.prototype.toString.call(n)==="[object String]")return n;if(n instanceof Date)return n.toISOString();if(Array.isArray(n))return n.map(e=>go(e));if(typeof n=="function"||typeof n=="object")return hp(n,e=>go(e));throw new Error("Data cannot be encoded in JSON: "+n)}function Dr(n){if(n==null)return n;if(n["@type"])switch(n["@type"]){case aT:case cT:{const e=Number(n.value);if(isNaN(e))throw new Error("Data cannot be decoded from JSON: "+n);return e}default:throw new Error("Data cannot be decoded from JSON: "+n)}return Array.isArray(n)?n.map(e=>Dr(e)):typeof n=="function"||typeof n=="object"?hp(n,e=>Dr(e)):n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nu="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gh={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class nt extends gt{constructor(e,t,r){super(`${nu}/${e}`,t||""),this.details=r,Object.setPrototypeOf(this,nt.prototype)}}function uT(n){if(n>=200&&n<300)return"ok";switch(n){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function _o(n,e){let t=uT(n),r=t,s;try{const i=e&&e.error;if(i){const o=i.status;if(typeof o=="string"){if(!Gh[o])return new nt("internal","internal");t=Gh[o],r=o}const c=i.message;typeof c=="string"&&(r=c),s=i.details,s!==void 0&&(s=Dr(s))}}catch{}return t==="ok"?null:new nt(t,r,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lT{constructor(e,t,r,s){this.app=e,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,pe(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.auth=t.getImmediate({optional:!0}),this.messaging=r.getImmediate({optional:!0}),this.auth||t.get().then(i=>this.auth=i,()=>{}),this.messaging||r.get().then(i=>this.messaging=i,()=>{}),this.appCheck||s?.get().then(i=>this.appCheck=i,()=>{})}async getAuthToken(){if(this.auth)try{return(await this.auth.getToken())?.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(e){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const t=e?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return t.error?null:t.token}return null}async getContext(e){const t=await this.getAuthToken(),r=await this.getMessagingToken(),s=await this.getAppCheckToken(e);return{authToken:t,messagingToken:r,appCheckToken:s}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pc="us-central1",hT=/^data: (.*?)(?:\n|$)/;function dT(n){let e=null;return{promise:new Promise((t,r)=>{e=setTimeout(()=>{r(new nt("deadline-exceeded","deadline-exceeded"))},n)}),cancel:()=>{e&&clearTimeout(e)}}}class fT{constructor(e,t,r,s,i=pc,o=(...c)=>fetch(...c)){this.app=e,this.fetchImpl=o,this.emulatorOrigin=null,this.contextProvider=new lT(e,t,r,s),this.cancelAllRequests=new Promise(c=>{this.deleteService=()=>Promise.resolve(c())});try{const c=new URL(i);this.customDomain=c.origin+(c.pathname==="/"?"":c.pathname),this.region=pc}catch{this.customDomain=null,this.region=i}}_delete(){return this.deleteService()}_url(e){const t=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${t}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${t}.cloudfunctions.net/${e}`}}function pT(n,e,t){const r=Ht(e);n.emulatorOrigin=`http${r?"s":""}://${e}:${t}`,r&&ci(n.emulatorOrigin+"/backends")}function mT(n,e,t){const r=s=>_T(n,e,s,{});return r.stream=(s,i)=>wT(n,e,s,i),r}function dp(n){return n.emulatorOrigin&&Ht(n.emulatorOrigin)?"include":void 0}async function gT(n,e,t,r,s){t["Content-Type"]="application/json";let i;try{i=await r(n,{method:"POST",body:JSON.stringify(e),headers:t,credentials:dp(s)})}catch{return{status:0,json:null}}let o=null;try{o=await i.json()}catch{}return{status:i.status,json:o}}async function fp(n,e){const t={},r=await n.contextProvider.getContext(e.limitedUseAppCheckTokens);return r.authToken&&(t.Authorization="Bearer "+r.authToken),r.messagingToken&&(t["Firebase-Instance-ID-Token"]=r.messagingToken),r.appCheckToken!==null&&(t["X-Firebase-AppCheck"]=r.appCheckToken),t}function _T(n,e,t,r){const s=n._url(e);return yT(n,s,t,r)}async function yT(n,e,t,r){t=go(t);const s={data:t},i=await fp(n,r),o=r.timeout||7e4,c=dT(o),u=await Promise.race([gT(e,s,i,n.fetchImpl,n),c.promise,n.cancelAllRequests]);if(c.cancel(),!u)throw new nt("cancelled","Firebase Functions instance was deleted.");const h=_o(u.status,u.json);if(h)throw h;if(!u.json)throw new nt("internal","Response is not valid JSON object.");let f=u.json.data;if(typeof f>"u"&&(f=u.json.result),typeof f>"u")throw new nt("internal","Response is missing data field.");return{data:Dr(f)}}function wT(n,e,t,r){const s=n._url(e);return ET(n,s,t,r||{})}async function ET(n,e,t,r){t=go(t);const s={data:t},i=await fp(n,r);i["Content-Type"]="application/json",i.Accept="text/event-stream";let o;try{o=await n.fetchImpl(e,{method:"POST",body:JSON.stringify(s),headers:i,signal:r?.signal,credentials:dp(n)})}catch(y){if(y instanceof Error&&y.name==="AbortError"){const k=new nt("cancelled","Request was cancelled.");return{data:Promise.reject(k),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(k)}}}}}}const S=_o(0,null);return{data:Promise.reject(S),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(S)}}}}}}let c,u;const h=new Promise((y,S)=>{c=y,u=S});r?.signal?.addEventListener("abort",()=>{const y=new nt("cancelled","Request was cancelled.");u(y)});const f=o.body.getReader(),m=IT(f,c,u,r?.signal);return{stream:{[Symbol.asyncIterator](){const y=m.getReader();return{async next(){const{value:S,done:k}=await y.read();return{value:S,done:k}},async return(){return await y.cancel(),{done:!0,value:void 0}}}}},data:h}}function IT(n,e,t,r){const s=(o,c)=>{const u=o.match(hT);if(!u)return;const h=u[1];try{const f=JSON.parse(h);if("result"in f){e(Dr(f.result));return}if("message"in f){c.enqueue(Dr(f.message));return}if("error"in f){const m=_o(0,f);c.error(m),t(m);return}}catch(f){if(f instanceof nt){c.error(f),t(f);return}}},i=new TextDecoder;return new ReadableStream({start(o){let c="";return u();async function u(){if(r?.aborted){const h=new nt("cancelled","Request was cancelled");return o.error(h),t(h),Promise.resolve()}try{const{value:h,done:f}=await n.read();if(f){c.trim()&&s(c.trim(),o),o.close();return}if(r?.aborted){const y=new nt("cancelled","Request was cancelled");o.error(y),t(y),await n.cancel();return}c+=i.decode(h,{stream:!0});const m=c.split(`
`);c=m.pop()||"";for(const y of m)y.trim()&&s(y.trim(),o);return u()}catch(h){const f=h instanceof nt?h:_o(0,null);o.error(f),t(f)}}},cancel(){return n.cancel()}})}const zh="@firebase/functions",Kh="0.13.6";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TT="auth-internal",vT="app-check-internal",AT="messaging-internal";function RT(n){const e=(t,{instanceIdentifier:r})=>{const s=t.getProvider("app").getImmediate(),i=t.getProvider(TT),o=t.getProvider(AT),c=t.getProvider(vT);return new fT(s,i,o,c,r)};Tt(new mt(nu,e,"PUBLIC").setMultipleInstances(!0)),$e(zh,Kh,n),$e(zh,Kh,"esm2020")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pk(n=ui(),e=pc){const r=Gt($(n),nu).getImmediate({identifier:e}),s=Bc("functions");return s&&PT(r,...s),r}function PT(n,e,t){pT($(n),e,t)}function Sk(n,e,t){return mT($(n),e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */RT();var Qh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var vn,pp;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(T,g){function w(){}w.prototype=g.prototype,T.F=g.prototype,T.prototype=new w,T.prototype.constructor=T,T.D=function(v,I,R){for(var _=Array(arguments.length-2),Ze=2;Ze<arguments.length;Ze++)_[Ze-2]=arguments[Ze];return g.prototype[I].apply(v,_)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(T,g,w){w||(w=0);const v=Array(16);if(typeof g=="string")for(var I=0;I<16;++I)v[I]=g.charCodeAt(w++)|g.charCodeAt(w++)<<8|g.charCodeAt(w++)<<16|g.charCodeAt(w++)<<24;else for(I=0;I<16;++I)v[I]=g[w++]|g[w++]<<8|g[w++]<<16|g[w++]<<24;g=T.g[0],w=T.g[1],I=T.g[2];let R=T.g[3],_;_=g+(R^w&(I^R))+v[0]+3614090360&4294967295,g=w+(_<<7&4294967295|_>>>25),_=R+(I^g&(w^I))+v[1]+3905402710&4294967295,R=g+(_<<12&4294967295|_>>>20),_=I+(w^R&(g^w))+v[2]+606105819&4294967295,I=R+(_<<17&4294967295|_>>>15),_=w+(g^I&(R^g))+v[3]+3250441966&4294967295,w=I+(_<<22&4294967295|_>>>10),_=g+(R^w&(I^R))+v[4]+4118548399&4294967295,g=w+(_<<7&4294967295|_>>>25),_=R+(I^g&(w^I))+v[5]+1200080426&4294967295,R=g+(_<<12&4294967295|_>>>20),_=I+(w^R&(g^w))+v[6]+2821735955&4294967295,I=R+(_<<17&4294967295|_>>>15),_=w+(g^I&(R^g))+v[7]+4249261313&4294967295,w=I+(_<<22&4294967295|_>>>10),_=g+(R^w&(I^R))+v[8]+1770035416&4294967295,g=w+(_<<7&4294967295|_>>>25),_=R+(I^g&(w^I))+v[9]+2336552879&4294967295,R=g+(_<<12&4294967295|_>>>20),_=I+(w^R&(g^w))+v[10]+4294925233&4294967295,I=R+(_<<17&4294967295|_>>>15),_=w+(g^I&(R^g))+v[11]+2304563134&4294967295,w=I+(_<<22&4294967295|_>>>10),_=g+(R^w&(I^R))+v[12]+1804603682&4294967295,g=w+(_<<7&4294967295|_>>>25),_=R+(I^g&(w^I))+v[13]+4254626195&4294967295,R=g+(_<<12&4294967295|_>>>20),_=I+(w^R&(g^w))+v[14]+2792965006&4294967295,I=R+(_<<17&4294967295|_>>>15),_=w+(g^I&(R^g))+v[15]+1236535329&4294967295,w=I+(_<<22&4294967295|_>>>10),_=g+(I^R&(w^I))+v[1]+4129170786&4294967295,g=w+(_<<5&4294967295|_>>>27),_=R+(w^I&(g^w))+v[6]+3225465664&4294967295,R=g+(_<<9&4294967295|_>>>23),_=I+(g^w&(R^g))+v[11]+643717713&4294967295,I=R+(_<<14&4294967295|_>>>18),_=w+(R^g&(I^R))+v[0]+3921069994&4294967295,w=I+(_<<20&4294967295|_>>>12),_=g+(I^R&(w^I))+v[5]+3593408605&4294967295,g=w+(_<<5&4294967295|_>>>27),_=R+(w^I&(g^w))+v[10]+38016083&4294967295,R=g+(_<<9&4294967295|_>>>23),_=I+(g^w&(R^g))+v[15]+3634488961&4294967295,I=R+(_<<14&4294967295|_>>>18),_=w+(R^g&(I^R))+v[4]+3889429448&4294967295,w=I+(_<<20&4294967295|_>>>12),_=g+(I^R&(w^I))+v[9]+568446438&4294967295,g=w+(_<<5&4294967295|_>>>27),_=R+(w^I&(g^w))+v[14]+3275163606&4294967295,R=g+(_<<9&4294967295|_>>>23),_=I+(g^w&(R^g))+v[3]+4107603335&4294967295,I=R+(_<<14&4294967295|_>>>18),_=w+(R^g&(I^R))+v[8]+1163531501&4294967295,w=I+(_<<20&4294967295|_>>>12),_=g+(I^R&(w^I))+v[13]+2850285829&4294967295,g=w+(_<<5&4294967295|_>>>27),_=R+(w^I&(g^w))+v[2]+4243563512&4294967295,R=g+(_<<9&4294967295|_>>>23),_=I+(g^w&(R^g))+v[7]+1735328473&4294967295,I=R+(_<<14&4294967295|_>>>18),_=w+(R^g&(I^R))+v[12]+2368359562&4294967295,w=I+(_<<20&4294967295|_>>>12),_=g+(w^I^R)+v[5]+4294588738&4294967295,g=w+(_<<4&4294967295|_>>>28),_=R+(g^w^I)+v[8]+2272392833&4294967295,R=g+(_<<11&4294967295|_>>>21),_=I+(R^g^w)+v[11]+1839030562&4294967295,I=R+(_<<16&4294967295|_>>>16),_=w+(I^R^g)+v[14]+4259657740&4294967295,w=I+(_<<23&4294967295|_>>>9),_=g+(w^I^R)+v[1]+2763975236&4294967295,g=w+(_<<4&4294967295|_>>>28),_=R+(g^w^I)+v[4]+1272893353&4294967295,R=g+(_<<11&4294967295|_>>>21),_=I+(R^g^w)+v[7]+4139469664&4294967295,I=R+(_<<16&4294967295|_>>>16),_=w+(I^R^g)+v[10]+3200236656&4294967295,w=I+(_<<23&4294967295|_>>>9),_=g+(w^I^R)+v[13]+681279174&4294967295,g=w+(_<<4&4294967295|_>>>28),_=R+(g^w^I)+v[0]+3936430074&4294967295,R=g+(_<<11&4294967295|_>>>21),_=I+(R^g^w)+v[3]+3572445317&4294967295,I=R+(_<<16&4294967295|_>>>16),_=w+(I^R^g)+v[6]+76029189&4294967295,w=I+(_<<23&4294967295|_>>>9),_=g+(w^I^R)+v[9]+3654602809&4294967295,g=w+(_<<4&4294967295|_>>>28),_=R+(g^w^I)+v[12]+3873151461&4294967295,R=g+(_<<11&4294967295|_>>>21),_=I+(R^g^w)+v[15]+530742520&4294967295,I=R+(_<<16&4294967295|_>>>16),_=w+(I^R^g)+v[2]+3299628645&4294967295,w=I+(_<<23&4294967295|_>>>9),_=g+(I^(w|~R))+v[0]+4096336452&4294967295,g=w+(_<<6&4294967295|_>>>26),_=R+(w^(g|~I))+v[7]+1126891415&4294967295,R=g+(_<<10&4294967295|_>>>22),_=I+(g^(R|~w))+v[14]+2878612391&4294967295,I=R+(_<<15&4294967295|_>>>17),_=w+(R^(I|~g))+v[5]+4237533241&4294967295,w=I+(_<<21&4294967295|_>>>11),_=g+(I^(w|~R))+v[12]+1700485571&4294967295,g=w+(_<<6&4294967295|_>>>26),_=R+(w^(g|~I))+v[3]+2399980690&4294967295,R=g+(_<<10&4294967295|_>>>22),_=I+(g^(R|~w))+v[10]+4293915773&4294967295,I=R+(_<<15&4294967295|_>>>17),_=w+(R^(I|~g))+v[1]+2240044497&4294967295,w=I+(_<<21&4294967295|_>>>11),_=g+(I^(w|~R))+v[8]+1873313359&4294967295,g=w+(_<<6&4294967295|_>>>26),_=R+(w^(g|~I))+v[15]+4264355552&4294967295,R=g+(_<<10&4294967295|_>>>22),_=I+(g^(R|~w))+v[6]+2734768916&4294967295,I=R+(_<<15&4294967295|_>>>17),_=w+(R^(I|~g))+v[13]+1309151649&4294967295,w=I+(_<<21&4294967295|_>>>11),_=g+(I^(w|~R))+v[4]+4149444226&4294967295,g=w+(_<<6&4294967295|_>>>26),_=R+(w^(g|~I))+v[11]+3174756917&4294967295,R=g+(_<<10&4294967295|_>>>22),_=I+(g^(R|~w))+v[2]+718787259&4294967295,I=R+(_<<15&4294967295|_>>>17),_=w+(R^(I|~g))+v[9]+3951481745&4294967295,T.g[0]=T.g[0]+g&4294967295,T.g[1]=T.g[1]+(I+(_<<21&4294967295|_>>>11))&4294967295,T.g[2]=T.g[2]+I&4294967295,T.g[3]=T.g[3]+R&4294967295}r.prototype.v=function(T,g){g===void 0&&(g=T.length);const w=g-this.blockSize,v=this.C;let I=this.h,R=0;for(;R<g;){if(I==0)for(;R<=w;)s(this,T,R),R+=this.blockSize;if(typeof T=="string"){for(;R<g;)if(v[I++]=T.charCodeAt(R++),I==this.blockSize){s(this,v),I=0;break}}else for(;R<g;)if(v[I++]=T[R++],I==this.blockSize){s(this,v),I=0;break}}this.h=I,this.o+=g},r.prototype.A=function(){var T=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);T[0]=128;for(var g=1;g<T.length-8;++g)T[g]=0;g=this.o*8;for(var w=T.length-8;w<T.length;++w)T[w]=g&255,g/=256;for(this.v(T),T=Array(16),g=0,w=0;w<4;++w)for(let v=0;v<32;v+=8)T[g++]=this.g[w]>>>v&255;return T};function i(T,g){var w=c;return Object.prototype.hasOwnProperty.call(w,T)?w[T]:w[T]=g(T)}function o(T,g){this.h=g;const w=[];let v=!0;for(let I=T.length-1;I>=0;I--){const R=T[I]|0;v&&R==g||(w[I]=R,v=!1)}this.g=w}var c={};function u(T){return-128<=T&&T<128?i(T,function(g){return new o([g|0],g<0?-1:0)}):new o([T|0],T<0?-1:0)}function h(T){if(isNaN(T)||!isFinite(T))return m;if(T<0)return O(h(-T));const g=[];let w=1;for(let v=0;T>=w;v++)g[v]=T/w|0,w*=4294967296;return new o(g,0)}function f(T,g){if(T.length==0)throw Error("number format error: empty string");if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(T.charAt(0)=="-")return O(f(T.substring(1),g));if(T.indexOf("-")>=0)throw Error('number format error: interior "-" character');const w=h(Math.pow(g,8));let v=m;for(let R=0;R<T.length;R+=8){var I=Math.min(8,T.length-R);const _=parseInt(T.substring(R,R+I),g);I<8?(I=h(Math.pow(g,I)),v=v.j(I).add(h(_))):(v=v.j(w),v=v.add(h(_)))}return v}var m=u(0),y=u(1),S=u(16777216);n=o.prototype,n.m=function(){if(U(this))return-O(this).m();let T=0,g=1;for(let w=0;w<this.g.length;w++){const v=this.i(w);T+=(v>=0?v:4294967296+v)*g,g*=4294967296}return T},n.toString=function(T){if(T=T||10,T<2||36<T)throw Error("radix out of range: "+T);if(k(this))return"0";if(U(this))return"-"+O(this).toString(T);const g=h(Math.pow(T,6));var w=this;let v="";for(;;){const I=re(w,g).g;w=W(w,I.j(g));let R=((w.g.length>0?w.g[0]:w.h)>>>0).toString(T);if(w=I,k(w))return R+v;for(;R.length<6;)R="0"+R;v=R+v}},n.i=function(T){return T<0?0:T<this.g.length?this.g[T]:this.h};function k(T){if(T.h!=0)return!1;for(let g=0;g<T.g.length;g++)if(T.g[g]!=0)return!1;return!0}function U(T){return T.h==-1}n.l=function(T){return T=W(this,T),U(T)?-1:k(T)?0:1};function O(T){const g=T.g.length,w=[];for(let v=0;v<g;v++)w[v]=~T.g[v];return new o(w,~T.h).add(y)}n.abs=function(){return U(this)?O(this):this},n.add=function(T){const g=Math.max(this.g.length,T.g.length),w=[];let v=0;for(let I=0;I<=g;I++){let R=v+(this.i(I)&65535)+(T.i(I)&65535),_=(R>>>16)+(this.i(I)>>>16)+(T.i(I)>>>16);v=_>>>16,R&=65535,_&=65535,w[I]=_<<16|R}return new o(w,w[w.length-1]&-2147483648?-1:0)};function W(T,g){return T.add(O(g))}n.j=function(T){if(k(this)||k(T))return m;if(U(this))return U(T)?O(this).j(O(T)):O(O(this).j(T));if(U(T))return O(this.j(O(T)));if(this.l(S)<0&&T.l(S)<0)return h(this.m()*T.m());const g=this.g.length+T.g.length,w=[];for(var v=0;v<2*g;v++)w[v]=0;for(v=0;v<this.g.length;v++)for(let I=0;I<T.g.length;I++){const R=this.i(v)>>>16,_=this.i(v)&65535,Ze=T.i(I)>>>16,$n=T.i(I)&65535;w[2*v+2*I]+=_*$n,K(w,2*v+2*I),w[2*v+2*I+1]+=R*$n,K(w,2*v+2*I+1),w[2*v+2*I+1]+=_*Ze,K(w,2*v+2*I+1),w[2*v+2*I+2]+=R*Ze,K(w,2*v+2*I+2)}for(T=0;T<g;T++)w[T]=w[2*T+1]<<16|w[2*T];for(T=g;T<2*g;T++)w[T]=0;return new o(w,0)};function K(T,g){for(;(T[g]&65535)!=T[g];)T[g+1]+=T[g]>>>16,T[g]&=65535,g++}function Q(T,g){this.g=T,this.h=g}function re(T,g){if(k(g))throw Error("division by zero");if(k(T))return new Q(m,m);if(U(T))return g=re(O(T),g),new Q(O(g.g),O(g.h));if(U(g))return g=re(T,O(g)),new Q(O(g.g),g.h);if(T.g.length>30){if(U(T)||U(g))throw Error("slowDivide_ only works with positive integers.");for(var w=y,v=g;v.l(T)<=0;)w=Ce(w),v=Ce(v);var I=ue(w,1),R=ue(v,1);for(v=ue(v,2),w=ue(w,2);!k(v);){var _=R.add(v);_.l(T)<=0&&(I=I.add(w),R=_),v=ue(v,1),w=ue(w,1)}return g=W(T,I.j(g)),new Q(I,g)}for(I=m;T.l(g)>=0;){for(w=Math.max(1,Math.floor(T.m()/g.m())),v=Math.ceil(Math.log(w)/Math.LN2),v=v<=48?1:Math.pow(2,v-48),R=h(w),_=R.j(g);U(_)||_.l(T)>0;)w-=v,R=h(w),_=R.j(g);k(R)&&(R=y),I=I.add(R),T=W(T,_)}return new Q(I,T)}n.B=function(T){return re(this,T).h},n.and=function(T){const g=Math.max(this.g.length,T.g.length),w=[];for(let v=0;v<g;v++)w[v]=this.i(v)&T.i(v);return new o(w,this.h&T.h)},n.or=function(T){const g=Math.max(this.g.length,T.g.length),w=[];for(let v=0;v<g;v++)w[v]=this.i(v)|T.i(v);return new o(w,this.h|T.h)},n.xor=function(T){const g=Math.max(this.g.length,T.g.length),w=[];for(let v=0;v<g;v++)w[v]=this.i(v)^T.i(v);return new o(w,this.h^T.h)};function Ce(T){const g=T.g.length+1,w=[];for(let v=0;v<g;v++)w[v]=T.i(v)<<1|T.i(v-1)>>>31;return new o(w,T.h)}function ue(T,g){const w=g>>5;g%=32;const v=T.g.length-w,I=[];for(let R=0;R<v;R++)I[R]=g>0?T.i(R+w)>>>g|T.i(R+w+1)<<32-g:T.i(R+w);return new o(I,T.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,pp=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=h,o.fromString=f,vn=o}).apply(typeof Qh<"u"?Qh:typeof self<"u"?self:typeof window<"u"?window:{});var ji=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var mp,Rs,gp,to,mc,_p,yp,wp;(function(){var n,e=Object.defineProperty;function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof ji=="object"&&ji];for(var l=0;l<a.length;++l){var d=a[l];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var r=t(this);function s(a,l){if(l)e:{var d=r;a=a.split(".");for(var p=0;p<a.length-1;p++){var A=a[p];if(!(A in d))break e;d=d[A]}a=a[a.length-1],p=d[a],l=l(p),l!=p&&l!=null&&e(d,a,{configurable:!0,writable:!0,value:l})}}s("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(a){return a||function(l){var d=[],p;for(p in l)Object.prototype.hasOwnProperty.call(l,p)&&d.push([p,l[p]]);return d}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},o=this||self;function c(a){var l=typeof a;return l=="object"&&a!=null||l=="function"}function u(a,l,d){return a.call.apply(a.bind,arguments)}function h(a,l,d){return h=u,h.apply(null,arguments)}function f(a,l){var d=Array.prototype.slice.call(arguments,1);return function(){var p=d.slice();return p.push.apply(p,arguments),a.apply(this,p)}}function m(a,l){function d(){}d.prototype=l.prototype,a.Z=l.prototype,a.prototype=new d,a.prototype.constructor=a,a.Ob=function(p,A,P){for(var x=Array(arguments.length-2),z=2;z<arguments.length;z++)x[z-2]=arguments[z];return l.prototype[A].apply(p,x)}}var y=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function S(a){const l=a.length;if(l>0){const d=Array(l);for(let p=0;p<l;p++)d[p]=a[p];return d}return[]}function k(a,l){for(let p=1;p<arguments.length;p++){const A=arguments[p];var d=typeof A;if(d=d!="object"?d:A?Array.isArray(A)?"array":d:"null",d=="array"||d=="object"&&typeof A.length=="number"){d=a.length||0;const P=A.length||0;a.length=d+P;for(let x=0;x<P;x++)a[d+x]=A[x]}else a.push(A)}}class U{constructor(l,d){this.i=l,this.j=d,this.h=0,this.g=null}get(){let l;return this.h>0?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function O(a){o.setTimeout(()=>{throw a},0)}function W(){var a=T;let l=null;return a.g&&(l=a.g,a.g=a.g.next,a.g||(a.h=null),l.next=null),l}class K{constructor(){this.h=this.g=null}add(l,d){const p=Q.get();p.set(l,d),this.h?this.h.next=p:this.g=p,this.h=p}}var Q=new U(()=>new re,a=>a.reset());class re{constructor(){this.next=this.g=this.h=null}set(l,d){this.h=l,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let Ce,ue=!1,T=new K,g=()=>{const a=Promise.resolve(void 0);Ce=()=>{a.then(w)}};function w(){for(var a;a=W();){try{a.h.call(a.g)}catch(d){O(d)}var l=Q;l.j(a),l.h<100&&(l.h++,a.next=l.g,l.g=a)}ue=!1}function v(){this.u=this.u,this.C=this.C}v.prototype.u=!1,v.prototype.dispose=function(){this.u||(this.u=!0,this.N())},v.prototype[Symbol.dispose]=function(){this.dispose()},v.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function I(a,l){this.type=a,this.g=this.target=l,this.defaultPrevented=!1}I.prototype.h=function(){this.defaultPrevented=!0};var R=function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,l=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const d=()=>{};o.addEventListener("test",d,l),o.removeEventListener("test",d,l)}catch{}return a}();function _(a){return/^[\s\xa0]*$/.test(a)}function Ze(a,l){I.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,l)}m(Ze,I),Ze.prototype.init=function(a,l){const d=this.type=a.type,p=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=l,l=a.relatedTarget,l||(d=="mouseover"?l=a.fromElement:d=="mouseout"&&(l=a.toElement)),this.relatedTarget=l,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&Ze.Z.h.call(this)},Ze.prototype.h=function(){Ze.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var $n="closure_listenable_"+(Math.random()*1e6|0),t_=0;function n_(a,l,d,p,A){this.listener=a,this.proxy=null,this.src=l,this.type=d,this.capture=!!p,this.ha=A,this.key=++t_,this.da=this.fa=!1}function Pi(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function Si(a,l,d){for(const p in a)l.call(d,a[p],p,a)}function r_(a,l){for(const d in a)l.call(void 0,a[d],d,a)}function pl(a){const l={};for(const d in a)l[d]=a[d];return l}const ml="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function gl(a,l){let d,p;for(let A=1;A<arguments.length;A++){p=arguments[A];for(d in p)a[d]=p[d];for(let P=0;P<ml.length;P++)d=ml[P],Object.prototype.hasOwnProperty.call(p,d)&&(a[d]=p[d])}}function bi(a){this.src=a,this.g={},this.h=0}bi.prototype.add=function(a,l,d,p,A){const P=a.toString();a=this.g[P],a||(a=this.g[P]=[],this.h++);const x=Ta(a,l,p,A);return x>-1?(l=a[x],d||(l.fa=!1)):(l=new n_(l,this.src,P,!!p,A),l.fa=d,a.push(l)),l};function Ia(a,l){const d=l.type;if(d in a.g){var p=a.g[d],A=Array.prototype.indexOf.call(p,l,void 0),P;(P=A>=0)&&Array.prototype.splice.call(p,A,1),P&&(Pi(l),a.g[d].length==0&&(delete a.g[d],a.h--))}}function Ta(a,l,d,p){for(let A=0;A<a.length;++A){const P=a[A];if(!P.da&&P.listener==l&&P.capture==!!d&&P.ha==p)return A}return-1}var va="closure_lm_"+(Math.random()*1e6|0),Aa={};function _l(a,l,d,p,A){if(Array.isArray(l)){for(let P=0;P<l.length;P++)_l(a,l[P],d,p,A);return null}return d=El(d),a&&a[$n]?a.J(l,d,c(p)?!!p.capture:!1,A):s_(a,l,d,!1,p,A)}function s_(a,l,d,p,A,P){if(!l)throw Error("Invalid event type");const x=c(A)?!!A.capture:!!A;let z=Pa(a);if(z||(a[va]=z=new bi(a)),d=z.add(l,d,p,x,P),d.proxy)return d;if(p=i_(),d.proxy=p,p.src=a,p.listener=d,a.addEventListener)R||(A=x),A===void 0&&(A=!1),a.addEventListener(l.toString(),p,A);else if(a.attachEvent)a.attachEvent(wl(l.toString()),p);else if(a.addListener&&a.removeListener)a.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return d}function i_(){function a(d){return l.call(a.src,a.listener,d)}const l=o_;return a}function yl(a,l,d,p,A){if(Array.isArray(l))for(var P=0;P<l.length;P++)yl(a,l[P],d,p,A);else p=c(p)?!!p.capture:!!p,d=El(d),a&&a[$n]?(a=a.i,P=String(l).toString(),P in a.g&&(l=a.g[P],d=Ta(l,d,p,A),d>-1&&(Pi(l[d]),Array.prototype.splice.call(l,d,1),l.length==0&&(delete a.g[P],a.h--)))):a&&(a=Pa(a))&&(l=a.g[l.toString()],a=-1,l&&(a=Ta(l,d,p,A)),(d=a>-1?l[a]:null)&&Ra(d))}function Ra(a){if(typeof a!="number"&&a&&!a.da){var l=a.src;if(l&&l[$n])Ia(l.i,a);else{var d=a.type,p=a.proxy;l.removeEventListener?l.removeEventListener(d,p,a.capture):l.detachEvent?l.detachEvent(wl(d),p):l.addListener&&l.removeListener&&l.removeListener(p),(d=Pa(l))?(Ia(d,a),d.h==0&&(d.src=null,l[va]=null)):Pi(a)}}}function wl(a){return a in Aa?Aa[a]:Aa[a]="on"+a}function o_(a,l){if(a.da)a=!0;else{l=new Ze(l,this);const d=a.listener,p=a.ha||a.src;a.fa&&Ra(a),a=d.call(p,l)}return a}function Pa(a){return a=a[va],a instanceof bi?a:null}var Sa="__closure_events_fn_"+(Math.random()*1e9>>>0);function El(a){return typeof a=="function"?a:(a[Sa]||(a[Sa]=function(l){return a.handleEvent(l)}),a[Sa])}function Me(){v.call(this),this.i=new bi(this),this.M=this,this.G=null}m(Me,v),Me.prototype[$n]=!0,Me.prototype.removeEventListener=function(a,l,d,p){yl(this,a,l,d,p)};function He(a,l){var d,p=a.G;if(p)for(d=[];p;p=p.G)d.push(p);if(a=a.M,p=l.type||l,typeof l=="string")l=new I(l,a);else if(l instanceof I)l.target=l.target||a;else{var A=l;l=new I(p,a),gl(l,A)}A=!0;let P,x;if(d)for(x=d.length-1;x>=0;x--)P=l.g=d[x],A=Ci(P,p,!0,l)&&A;if(P=l.g=a,A=Ci(P,p,!0,l)&&A,A=Ci(P,p,!1,l)&&A,d)for(x=0;x<d.length;x++)P=l.g=d[x],A=Ci(P,p,!1,l)&&A}Me.prototype.N=function(){if(Me.Z.N.call(this),this.i){var a=this.i;for(const l in a.g){const d=a.g[l];for(let p=0;p<d.length;p++)Pi(d[p]);delete a.g[l],a.h--}}this.G=null},Me.prototype.J=function(a,l,d,p){return this.i.add(String(a),l,!1,d,p)},Me.prototype.K=function(a,l,d,p){return this.i.add(String(a),l,!0,d,p)};function Ci(a,l,d,p){if(l=a.i.g[String(l)],!l)return!0;l=l.concat();let A=!0;for(let P=0;P<l.length;++P){const x=l[P];if(x&&!x.da&&x.capture==d){const z=x.listener,Ae=x.ha||x.src;x.fa&&Ia(a.i,x),A=z.call(Ae,p)!==!1&&A}}return A&&!p.defaultPrevented}function a_(a,l){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=h(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(l)>2147483647?-1:o.setTimeout(a,l||0)}function Il(a){a.g=a_(()=>{a.g=null,a.i&&(a.i=!1,Il(a))},a.l);const l=a.h;a.h=null,a.m.apply(null,l)}class c_ extends v{constructor(l,d){super(),this.m=l,this.l=d,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:Il(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ns(a){v.call(this),this.h=a,this.g={}}m(ns,v);var Tl=[];function vl(a){Si(a.g,function(l,d){this.g.hasOwnProperty(d)&&Ra(l)},a),a.g={}}ns.prototype.N=function(){ns.Z.N.call(this),vl(this)},ns.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ba=o.JSON.stringify,u_=o.JSON.parse,l_=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function Al(){}function Rl(){}var rs={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Ca(){I.call(this,"d")}m(Ca,I);function ka(){I.call(this,"c")}m(ka,I);var jn={},Pl=null;function ki(){return Pl=Pl||new Me}jn.Ia="serverreachability";function Sl(a){I.call(this,jn.Ia,a)}m(Sl,I);function ss(a){const l=ki();He(l,new Sl(l))}jn.STAT_EVENT="statevent";function bl(a,l){I.call(this,jn.STAT_EVENT,a),this.stat=l}m(bl,I);function Ge(a){const l=ki();He(l,new bl(l,a))}jn.Ja="timingevent";function Cl(a,l){I.call(this,jn.Ja,a),this.size=l}m(Cl,I);function is(a,l){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},l)}function os(){this.g=!0}os.prototype.ua=function(){this.g=!1};function h_(a,l,d,p,A,P){a.info(function(){if(a.g)if(P){var x="",z=P.split("&");for(let se=0;se<z.length;se++){var Ae=z[se].split("=");if(Ae.length>1){const ke=Ae[0];Ae=Ae[1];const kt=ke.split("_");x=kt.length>=2&&kt[1]=="type"?x+(ke+"="+Ae+"&"):x+(ke+"=redacted&")}}}else x=null;else x=P;return"XMLHTTP REQ ("+p+") [attempt "+A+"]: "+l+`
`+d+`
`+x})}function d_(a,l,d,p,A,P,x){a.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+A+"]: "+l+`
`+d+`
`+P+" "+x})}function _r(a,l,d,p){a.info(function(){return"XMLHTTP TEXT ("+l+"): "+p_(a,d)+(p?" "+p:"")})}function f_(a,l){a.info(function(){return"TIMEOUT: "+l})}os.prototype.info=function(){};function p_(a,l){if(!a.g)return l;if(!l)return null;try{const P=JSON.parse(l);if(P){for(a=0;a<P.length;a++)if(Array.isArray(P[a])){var d=P[a];if(!(d.length<2)){var p=d[1];if(Array.isArray(p)&&!(p.length<1)){var A=p[0];if(A!="noop"&&A!="stop"&&A!="close")for(let x=1;x<p.length;x++)p[x]=""}}}}return ba(P)}catch{return l}}var Ni={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},kl={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Nl;function Na(){}m(Na,Al),Na.prototype.g=function(){return new XMLHttpRequest},Nl=new Na;function as(a){return encodeURIComponent(String(a))}function m_(a){var l=1;a=a.split(":");const d=[];for(;l>0&&a.length;)d.push(a.shift()),l--;return a.length&&d.push(a.join(":")),d}function dn(a,l,d,p){this.j=a,this.i=l,this.l=d,this.S=p||1,this.V=new ns(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Vl}function Vl(){this.i=null,this.g="",this.h=!1}var Ol={},Va={};function Oa(a,l,d){a.M=1,a.A=Oi(Ct(l)),a.u=d,a.R=!0,Dl(a,null)}function Dl(a,l){a.F=Date.now(),Vi(a),a.B=Ct(a.A);var d=a.B,p=a.S;Array.isArray(p)||(p=[String(p)]),zl(d.i,"t",p),a.C=0,d=a.j.L,a.h=new Vl,a.g=hh(a.j,d?l:null,!a.u),a.P>0&&(a.O=new c_(h(a.Y,a,a.g),a.P)),l=a.V,d=a.g,p=a.ba;var A="readystatechange";Array.isArray(A)||(A&&(Tl[0]=A.toString()),A=Tl);for(let P=0;P<A.length;P++){const x=_l(d,A[P],p||l.handleEvent,!1,l.h||l);if(!x)break;l.g[x.key]=x}l=a.J?pl(a.J):{},a.u?(a.v||(a.v="POST"),l["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,l)):(a.v="GET",a.g.ea(a.B,a.v,null,l)),ss(),h_(a.i,a.v,a.B,a.l,a.S,a.u)}dn.prototype.ba=function(a){a=a.target;const l=this.O;l&&mn(a)==3?l.j():this.Y(a)},dn.prototype.Y=function(a){try{if(a==this.g)e:{const z=mn(this.g),Ae=this.g.ya(),se=this.g.ca();if(!(z<3)&&(z!=3||this.g&&(this.h.h||this.g.la()||eh(this.g)))){this.K||z!=4||Ae==7||(Ae==8||se<=0?ss(3):ss(2)),Da(this);var l=this.g.ca();this.X=l;var d=g_(this);if(this.o=l==200,d_(this.i,this.v,this.B,this.l,this.S,z,l),this.o){if(this.U&&!this.L){t:{if(this.g){var p,A=this.g;if((p=A.g?A.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!_(p)){var P=p;break t}}P=null}if(a=P)_r(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,xa(this,a);else{this.o=!1,this.m=3,Ge(12),Wn(this),cs(this);break e}}if(this.R){a=!0;let ke;for(;!this.K&&this.C<d.length;)if(ke=__(this,d),ke==Va){z==4&&(this.m=4,Ge(14),a=!1),_r(this.i,this.l,null,"[Incomplete Response]");break}else if(ke==Ol){this.m=4,Ge(15),_r(this.i,this.l,d,"[Invalid Chunk]"),a=!1;break}else _r(this.i,this.l,ke,null),xa(this,ke);if(xl(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),z!=4||d.length!=0||this.h.h||(this.m=1,Ge(16),a=!1),this.o=this.o&&a,!a)_r(this.i,this.l,d,"[Invalid Chunked Response]"),Wn(this),cs(this);else if(d.length>0&&!this.W){this.W=!0;var x=this.j;x.g==this&&x.aa&&!x.P&&(x.j.info("Great, no buffering proxy detected. Bytes received: "+d.length),ja(x),x.P=!0,Ge(11))}}else _r(this.i,this.l,d,null),xa(this,d);z==4&&Wn(this),this.o&&!this.K&&(z==4?ah(this.j,this):(this.o=!1,Vi(this)))}else N_(this.g),l==400&&d.indexOf("Unknown SID")>0?(this.m=3,Ge(12)):(this.m=0,Ge(13)),Wn(this),cs(this)}}}catch{}finally{}};function g_(a){if(!xl(a))return a.g.la();const l=eh(a.g);if(l==="")return"";let d="";const p=l.length,A=mn(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return Wn(a),cs(a),"";a.h.i=new o.TextDecoder}for(let P=0;P<p;P++)a.h.h=!0,d+=a.h.i.decode(l[P],{stream:!(A&&P==p-1)});return l.length=0,a.h.g+=d,a.C=0,a.h.g}function xl(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function __(a,l){var d=a.C,p=l.indexOf(`
`,d);return p==-1?Va:(d=Number(l.substring(d,p)),isNaN(d)?Ol:(p+=1,p+d>l.length?Va:(l=l.slice(p,p+d),a.C=p+d,l)))}dn.prototype.cancel=function(){this.K=!0,Wn(this)};function Vi(a){a.T=Date.now()+a.H,Ll(a,a.H)}function Ll(a,l){if(a.D!=null)throw Error("WatchDog timer not null");a.D=is(h(a.aa,a),l)}function Da(a){a.D&&(o.clearTimeout(a.D),a.D=null)}dn.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(f_(this.i,this.B),this.M!=2&&(ss(),Ge(17)),Wn(this),this.m=2,cs(this)):Ll(this,this.T-a)};function cs(a){a.j.I==0||a.K||ah(a.j,a)}function Wn(a){Da(a);var l=a.O;l&&typeof l.dispose=="function"&&l.dispose(),a.O=null,vl(a.V),a.g&&(l=a.g,a.g=null,l.abort(),l.dispose())}function xa(a,l){try{var d=a.j;if(d.I!=0&&(d.g==a||La(d.h,a))){if(!a.L&&La(d.h,a)&&d.I==3){try{var p=d.Ba.g.parse(l)}catch{p=null}if(Array.isArray(p)&&p.length==3){var A=p;if(A[0]==0){e:if(!d.v){if(d.g)if(d.g.F+3e3<a.F)Mi(d),Li(d);else break e;$a(d),Ge(18)}}else d.xa=A[1],0<d.xa-d.K&&A[2]<37500&&d.F&&d.A==0&&!d.C&&(d.C=is(h(d.Va,d),6e3));Fl(d.h)<=1&&d.ta&&(d.ta=void 0)}else Gn(d,11)}else if((a.L||d.g==a)&&Mi(d),!_(l))for(A=d.Ba.g.parse(l),l=0;l<A.length;l++){let se=A[l];const ke=se[0];if(!(ke<=d.K))if(d.K=ke,se=se[1],d.I==2)if(se[0]=="c"){d.M=se[1],d.ba=se[2];const kt=se[3];kt!=null&&(d.ka=kt,d.j.info("VER="+d.ka));const zn=se[4];zn!=null&&(d.za=zn,d.j.info("SVER="+d.za));const gn=se[5];gn!=null&&typeof gn=="number"&&gn>0&&(p=1.5*gn,d.O=p,d.j.info("backChannelRequestTimeoutMs_="+p)),p=d;const _n=a.g;if(_n){const Bi=_n.g?_n.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Bi){var P=p.h;P.g||Bi.indexOf("spdy")==-1&&Bi.indexOf("quic")==-1&&Bi.indexOf("h2")==-1||(P.j=P.l,P.g=new Set,P.h&&(Ua(P,P.h),P.h=null))}if(p.G){const Wa=_n.g?_n.g.getResponseHeader("X-HTTP-Session-Id"):null;Wa&&(p.wa=Wa,ie(p.J,p.G,Wa))}}d.I=3,d.l&&d.l.ra(),d.aa&&(d.T=Date.now()-a.F,d.j.info("Handshake RTT: "+d.T+"ms")),p=d;var x=a;if(p.na=lh(p,p.L?p.ba:null,p.W),x.L){Bl(p.h,x);var z=x,Ae=p.O;Ae&&(z.H=Ae),z.D&&(Da(z),Vi(z)),p.g=x}else ih(p);d.i.length>0&&Ui(d)}else se[0]!="stop"&&se[0]!="close"||Gn(d,7);else d.I==3&&(se[0]=="stop"||se[0]=="close"?se[0]=="stop"?Gn(d,7):qa(d):se[0]!="noop"&&d.l&&d.l.qa(se),d.A=0)}}ss(4)}catch{}}var y_=class{constructor(a,l){this.g=a,this.map=l}};function Ul(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Ml(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Fl(a){return a.h?1:a.g?a.g.size:0}function La(a,l){return a.h?a.h==l:a.g?a.g.has(l):!1}function Ua(a,l){a.g?a.g.add(l):a.h=l}function Bl(a,l){a.h&&a.h==l?a.h=null:a.g&&a.g.has(l)&&a.g.delete(l)}Ul.prototype.cancel=function(){if(this.i=ql(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function ql(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let l=a.i;for(const d of a.g.values())l=l.concat(d.G);return l}return S(a.i)}var $l=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function w_(a,l){if(a){a=a.split("&");for(let d=0;d<a.length;d++){const p=a[d].indexOf("=");let A,P=null;p>=0?(A=a[d].substring(0,p),P=a[d].substring(p+1)):A=a[d],l(A,P?decodeURIComponent(P.replace(/\+/g," ")):"")}}}function fn(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let l;a instanceof fn?(this.l=a.l,us(this,a.j),this.o=a.o,this.g=a.g,ls(this,a.u),this.h=a.h,Ma(this,Kl(a.i)),this.m=a.m):a&&(l=String(a).match($l))?(this.l=!1,us(this,l[1]||"",!0),this.o=hs(l[2]||""),this.g=hs(l[3]||"",!0),ls(this,l[4]),this.h=hs(l[5]||"",!0),Ma(this,l[6]||"",!0),this.m=hs(l[7]||"")):(this.l=!1,this.i=new fs(null,this.l))}fn.prototype.toString=function(){const a=[];var l=this.j;l&&a.push(ds(l,jl,!0),":");var d=this.g;return(d||l=="file")&&(a.push("//"),(l=this.o)&&a.push(ds(l,jl,!0),"@"),a.push(as(d).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.u,d!=null&&a.push(":",String(d))),(d=this.h)&&(this.g&&d.charAt(0)!="/"&&a.push("/"),a.push(ds(d,d.charAt(0)=="/"?T_:I_,!0))),(d=this.i.toString())&&a.push("?",d),(d=this.m)&&a.push("#",ds(d,A_)),a.join("")},fn.prototype.resolve=function(a){const l=Ct(this);let d=!!a.j;d?us(l,a.j):d=!!a.o,d?l.o=a.o:d=!!a.g,d?l.g=a.g:d=a.u!=null;var p=a.h;if(d)ls(l,a.u);else if(d=!!a.h){if(p.charAt(0)!="/")if(this.g&&!this.h)p="/"+p;else{var A=l.h.lastIndexOf("/");A!=-1&&(p=l.h.slice(0,A+1)+p)}if(A=p,A==".."||A==".")p="";else if(A.indexOf("./")!=-1||A.indexOf("/.")!=-1){p=A.lastIndexOf("/",0)==0,A=A.split("/");const P=[];for(let x=0;x<A.length;){const z=A[x++];z=="."?p&&x==A.length&&P.push(""):z==".."?((P.length>1||P.length==1&&P[0]!="")&&P.pop(),p&&x==A.length&&P.push("")):(P.push(z),p=!0)}p=P.join("/")}else p=A}return d?l.h=p:d=a.i.toString()!=="",d?Ma(l,Kl(a.i)):d=!!a.m,d&&(l.m=a.m),l};function Ct(a){return new fn(a)}function us(a,l,d){a.j=d?hs(l,!0):l,a.j&&(a.j=a.j.replace(/:$/,""))}function ls(a,l){if(l){if(l=Number(l),isNaN(l)||l<0)throw Error("Bad port number "+l);a.u=l}else a.u=null}function Ma(a,l,d){l instanceof fs?(a.i=l,R_(a.i,a.l)):(d||(l=ds(l,v_)),a.i=new fs(l,a.l))}function ie(a,l,d){a.i.set(l,d)}function Oi(a){return ie(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function hs(a,l){return a?l?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function ds(a,l,d){return typeof a=="string"?(a=encodeURI(a).replace(l,E_),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function E_(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var jl=/[#\/\?@]/g,I_=/[#\?:]/g,T_=/[#\?]/g,v_=/[#\?@]/g,A_=/#/g;function fs(a,l){this.h=this.g=null,this.i=a||null,this.j=!!l}function Hn(a){a.g||(a.g=new Map,a.h=0,a.i&&w_(a.i,function(l,d){a.add(decodeURIComponent(l.replace(/\+/g," ")),d)}))}n=fs.prototype,n.add=function(a,l){Hn(this),this.i=null,a=yr(this,a);let d=this.g.get(a);return d||this.g.set(a,d=[]),d.push(l),this.h+=1,this};function Wl(a,l){Hn(a),l=yr(a,l),a.g.has(l)&&(a.i=null,a.h-=a.g.get(l).length,a.g.delete(l))}function Hl(a,l){return Hn(a),l=yr(a,l),a.g.has(l)}n.forEach=function(a,l){Hn(this),this.g.forEach(function(d,p){d.forEach(function(A){a.call(l,A,p,this)},this)},this)};function Gl(a,l){Hn(a);let d=[];if(typeof l=="string")Hl(a,l)&&(d=d.concat(a.g.get(yr(a,l))));else for(a=Array.from(a.g.values()),l=0;l<a.length;l++)d=d.concat(a[l]);return d}n.set=function(a,l){return Hn(this),this.i=null,a=yr(this,a),Hl(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[l]),this.h+=1,this},n.get=function(a,l){return a?(a=Gl(this,a),a.length>0?String(a[0]):l):l};function zl(a,l,d){Wl(a,l),d.length>0&&(a.i=null,a.g.set(yr(a,l),S(d)),a.h+=d.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],l=Array.from(this.g.keys());for(let p=0;p<l.length;p++){var d=l[p];const A=as(d);d=Gl(this,d);for(let P=0;P<d.length;P++){let x=A;d[P]!==""&&(x+="="+as(d[P])),a.push(x)}}return this.i=a.join("&")};function Kl(a){const l=new fs;return l.i=a.i,a.g&&(l.g=new Map(a.g),l.h=a.h),l}function yr(a,l){return l=String(l),a.j&&(l=l.toLowerCase()),l}function R_(a,l){l&&!a.j&&(Hn(a),a.i=null,a.g.forEach(function(d,p){const A=p.toLowerCase();p!=A&&(Wl(this,p),zl(this,A,d))},a)),a.j=l}function P_(a,l){const d=new os;if(o.Image){const p=new Image;p.onload=f(pn,d,"TestLoadImage: loaded",!0,l,p),p.onerror=f(pn,d,"TestLoadImage: error",!1,l,p),p.onabort=f(pn,d,"TestLoadImage: abort",!1,l,p),p.ontimeout=f(pn,d,"TestLoadImage: timeout",!1,l,p),o.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=a}else l(!1)}function S_(a,l){const d=new os,p=new AbortController,A=setTimeout(()=>{p.abort(),pn(d,"TestPingServer: timeout",!1,l)},1e4);fetch(a,{signal:p.signal}).then(P=>{clearTimeout(A),P.ok?pn(d,"TestPingServer: ok",!0,l):pn(d,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(A),pn(d,"TestPingServer: error",!1,l)})}function pn(a,l,d,p,A){try{A&&(A.onload=null,A.onerror=null,A.onabort=null,A.ontimeout=null),p(d)}catch{}}function b_(){this.g=new l_}function Fa(a){this.i=a.Sb||null,this.h=a.ab||!1}m(Fa,Al),Fa.prototype.g=function(){return new Di(this.i,this.h)};function Di(a,l){Me.call(this),this.H=a,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}m(Di,Me),n=Di.prototype,n.open=function(a,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=l,this.readyState=1,ms(this)},n.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const l={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(l.body=a),(this.H||o).fetch(new Request(this.D,l)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,ps(this)),this.readyState=0},n.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,ms(this)),this.g&&(this.readyState=3,ms(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Ql(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function Ql(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}n.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var l=a.value?a.value:new Uint8Array(0);(l=this.B.decode(l,{stream:!a.done}))&&(this.response=this.responseText+=l)}a.done?ps(this):ms(this),this.readyState==3&&Ql(this)}},n.Oa=function(a){this.g&&(this.response=this.responseText=a,ps(this))},n.Na=function(a){this.g&&(this.response=a,ps(this))},n.ga=function(){this.g&&ps(this)};function ps(a){a.readyState=4,a.l=null,a.j=null,a.B=null,ms(a)}n.setRequestHeader=function(a,l){this.A.append(a,l)},n.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],l=this.h.entries();for(var d=l.next();!d.done;)d=d.value,a.push(d[0]+": "+d[1]),d=l.next();return a.join(`\r
`)};function ms(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(Di.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function Yl(a){let l="";return Si(a,function(d,p){l+=p,l+=":",l+=d,l+=`\r
`}),l}function Ba(a,l,d){e:{for(p in d){var p=!1;break e}p=!0}p||(d=Yl(d),typeof a=="string"?d!=null&&as(d):ie(a,l,d))}function fe(a){Me.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}m(fe,Me);var C_=/^https?$/i,k_=["POST","PUT"];n=fe.prototype,n.Fa=function(a){this.H=a},n.ea=function(a,l,d,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);l=l?l.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Nl.g(),this.g.onreadystatechange=y(h(this.Ca,this));try{this.B=!0,this.g.open(l,String(a),!0),this.B=!1}catch(P){Jl(this,P);return}if(a=d||"",d=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var A in p)d.set(A,p[A]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const P of p.keys())d.set(P,p.get(P));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(d.keys()).find(P=>P.toLowerCase()=="content-type"),A=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(k_,l,void 0)>=0)||p||A||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[P,x]of d)this.g.setRequestHeader(P,x);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(P){Jl(this,P)}};function Jl(a,l){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=l,a.o=5,Xl(a),xi(a)}function Xl(a){a.A||(a.A=!0,He(a,"complete"),He(a,"error"))}n.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,He(this,"complete"),He(this,"abort"),xi(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),xi(this,!0)),fe.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?Zl(this):this.Xa())},n.Xa=function(){Zl(this)};function Zl(a){if(a.h&&typeof i<"u"){if(a.v&&mn(a)==4)setTimeout(a.Ca.bind(a),0);else if(He(a,"readystatechange"),mn(a)==4){a.h=!1;try{const P=a.ca();e:switch(P){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var d;if(!(d=l)){var p;if(p=P===0){let x=String(a.D).match($l)[1]||null;!x&&o.self&&o.self.location&&(x=o.self.location.protocol.slice(0,-1)),p=!C_.test(x?x.toLowerCase():"")}d=p}if(d)He(a,"complete"),He(a,"success");else{a.o=6;try{var A=mn(a)>2?a.g.statusText:""}catch{A=""}a.l=A+" ["+a.ca()+"]",Xl(a)}}finally{xi(a)}}}}function xi(a,l){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const d=a.g;a.g=null,l||He(a,"ready");try{d.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function mn(a){return a.g?a.g.readyState:0}n.ca=function(){try{return mn(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(a){if(this.g){var l=this.g.responseText;return a&&l.indexOf(a)==0&&(l=l.substring(a.length)),u_(l)}};function eh(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function N_(a){const l={};a=(a.g&&mn(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<a.length;p++){if(_(a[p]))continue;var d=m_(a[p]);const A=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const P=l[A]||[];l[A]=P,P.push(d)}r_(l,function(p){return p.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function gs(a,l,d){return d&&d.internalChannelParams&&d.internalChannelParams[a]||l}function th(a){this.za=0,this.i=[],this.j=new os,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=gs("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=gs("baseRetryDelayMs",5e3,a),this.Za=gs("retryDelaySeedMs",1e4,a),this.Ta=gs("forwardChannelMaxRetries",2,a),this.va=gs("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new Ul(a&&a.concurrentRequestLimit),this.Ba=new b_,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=th.prototype,n.ka=8,n.I=1,n.connect=function(a,l,d,p){Ge(0),this.W=a,this.H=l||{},d&&p!==void 0&&(this.H.OSID=d,this.H.OAID=p),this.F=this.X,this.J=lh(this,null,this.W),Ui(this)};function qa(a){if(nh(a),a.I==3){var l=a.V++,d=Ct(a.J);if(ie(d,"SID",a.M),ie(d,"RID",l),ie(d,"TYPE","terminate"),_s(a,d),l=new dn(a,a.j,l),l.M=2,l.A=Oi(Ct(d)),d=!1,o.navigator&&o.navigator.sendBeacon)try{d=o.navigator.sendBeacon(l.A.toString(),"")}catch{}!d&&o.Image&&(new Image().src=l.A,d=!0),d||(l.g=hh(l.j,null),l.g.ea(l.A)),l.F=Date.now(),Vi(l)}uh(a)}function Li(a){a.g&&(ja(a),a.g.cancel(),a.g=null)}function nh(a){Li(a),a.v&&(o.clearTimeout(a.v),a.v=null),Mi(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function Ui(a){if(!Ml(a.h)&&!a.m){a.m=!0;var l=a.Ea;Ce||g(),ue||(Ce(),ue=!0),T.add(l,a),a.D=0}}function V_(a,l){return Fl(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=l.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=is(h(a.Ea,a,l),ch(a,a.D)),a.D++,!0)}n.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const A=new dn(this,this.j,a);let P=this.o;if(this.U&&(P?(P=pl(P),gl(P,this.U)):P=this.U),this.u!==null||this.R||(A.J=P,P=null),this.S)e:{for(var l=0,d=0;d<this.i.length;d++){t:{var p=this.i[d];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(l+=p,l>4096){l=d;break e}if(l===4096||d===this.i.length-1){l=d+1;break e}}l=1e3}else l=1e3;l=sh(this,A,l),d=Ct(this.J),ie(d,"RID",a),ie(d,"CVER",22),this.G&&ie(d,"X-HTTP-Session-Id",this.G),_s(this,d),P&&(this.R?l="headers="+as(Yl(P))+"&"+l:this.u&&Ba(d,this.u,P)),Ua(this.h,A),this.Ra&&ie(d,"TYPE","init"),this.S?(ie(d,"$req",l),ie(d,"SID","null"),A.U=!0,Oa(A,d,null)):Oa(A,d,l),this.I=2}}else this.I==3&&(a?rh(this,a):this.i.length==0||Ml(this.h)||rh(this))};function rh(a,l){var d;l?d=l.l:d=a.V++;const p=Ct(a.J);ie(p,"SID",a.M),ie(p,"RID",d),ie(p,"AID",a.K),_s(a,p),a.u&&a.o&&Ba(p,a.u,a.o),d=new dn(a,a.j,d,a.D+1),a.u===null&&(d.J=a.o),l&&(a.i=l.G.concat(a.i)),l=sh(a,d,1e3),d.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),Ua(a.h,d),Oa(d,p,l)}function _s(a,l){a.H&&Si(a.H,function(d,p){ie(l,p,d)}),a.l&&Si({},function(d,p){ie(l,p,d)})}function sh(a,l,d){d=Math.min(a.i.length,d);const p=a.l?h(a.l.Ka,a.l,a):null;e:{var A=a.i;let z=-1;for(;;){const Ae=["count="+d];z==-1?d>0?(z=A[0].g,Ae.push("ofs="+z)):z=0:Ae.push("ofs="+z);let se=!0;for(let ke=0;ke<d;ke++){var P=A[ke].g;const kt=A[ke].map;if(P-=z,P<0)z=Math.max(0,A[ke].g-100),se=!1;else try{P="req"+P+"_"||"";try{var x=kt instanceof Map?kt:Object.entries(kt);for(const[zn,gn]of x){let _n=gn;c(gn)&&(_n=ba(gn)),Ae.push(P+zn+"="+encodeURIComponent(_n))}}catch(zn){throw Ae.push(P+"type="+encodeURIComponent("_badmap")),zn}}catch{p&&p(kt)}}if(se){x=Ae.join("&");break e}}x=void 0}return a=a.i.splice(0,d),l.G=a,x}function ih(a){if(!a.g&&!a.v){a.Y=1;var l=a.Da;Ce||g(),ue||(Ce(),ue=!0),T.add(l,a),a.A=0}}function $a(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=is(h(a.Da,a),ch(a,a.A)),a.A++,!0)}n.Da=function(){if(this.v=null,oh(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=is(h(this.Wa,this),a)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Ge(10),Li(this),oh(this))};function ja(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function oh(a){a.g=new dn(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var l=Ct(a.na);ie(l,"RID","rpc"),ie(l,"SID",a.M),ie(l,"AID",a.K),ie(l,"CI",a.F?"0":"1"),!a.F&&a.ia&&ie(l,"TO",a.ia),ie(l,"TYPE","xmlhttp"),_s(a,l),a.u&&a.o&&Ba(l,a.u,a.o),a.O&&(a.g.H=a.O);var d=a.g;a=a.ba,d.M=1,d.A=Oi(Ct(l)),d.u=null,d.R=!0,Dl(d,a)}n.Va=function(){this.C!=null&&(this.C=null,Li(this),$a(this),Ge(19))};function Mi(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function ah(a,l){var d=null;if(a.g==l){Mi(a),ja(a),a.g=null;var p=2}else if(La(a.h,l))d=l.G,Bl(a.h,l),p=1;else return;if(a.I!=0){if(l.o)if(p==1){d=l.u?l.u.length:0,l=Date.now()-l.F;var A=a.D;p=ki(),He(p,new Cl(p,d)),Ui(a)}else ih(a);else if(A=l.m,A==3||A==0&&l.X>0||!(p==1&&V_(a,l)||p==2&&$a(a)))switch(d&&d.length>0&&(l=a.h,l.i=l.i.concat(d)),A){case 1:Gn(a,5);break;case 4:Gn(a,10);break;case 3:Gn(a,6);break;default:Gn(a,2)}}}function ch(a,l){let d=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(d*=2),d*l}function Gn(a,l){if(a.j.info("Error code "+l),l==2){var d=h(a.bb,a),p=a.Ua;const A=!p;p=new fn(p||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||us(p,"https"),Oi(p),A?P_(p.toString(),d):S_(p.toString(),d)}else Ge(2);a.I=0,a.l&&a.l.pa(l),uh(a),nh(a)}n.bb=function(a){a?(this.j.info("Successfully pinged google.com"),Ge(2)):(this.j.info("Failed to ping google.com"),Ge(1))};function uh(a){if(a.I=0,a.ja=[],a.l){const l=ql(a.h);(l.length!=0||a.i.length!=0)&&(k(a.ja,l),k(a.ja,a.i),a.h.i.length=0,S(a.i),a.i.length=0),a.l.oa()}}function lh(a,l,d){var p=d instanceof fn?Ct(d):new fn(d);if(p.g!="")l&&(p.g=l+"."+p.g),ls(p,p.u);else{var A=o.location;p=A.protocol,l=l?l+"."+A.hostname:A.hostname,A=+A.port;const P=new fn(null);p&&us(P,p),l&&(P.g=l),A&&ls(P,A),d&&(P.h=d),p=P}return d=a.G,l=a.wa,d&&l&&ie(p,d,l),ie(p,"VER",a.ka),_s(a,p),p}function hh(a,l,d){if(l&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return l=a.Aa&&!a.ma?new fe(new Fa({ab:d})):new fe(a.ma),l.Fa(a.L),l}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function dh(){}n=dh.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function Fi(){}Fi.prototype.g=function(a,l){return new ct(a,l)};function ct(a,l){Me.call(this),this.g=new th(l),this.l=a,this.h=l&&l.messageUrlParams||null,a=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(a?a["X-WebChannel-Content-Type"]=l.messageContentType:a={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.sa&&(a?a["X-WebChannel-Client-Profile"]=l.sa:a={"X-WebChannel-Client-Profile":l.sa}),this.g.U=a,(a=l&&l.Qb)&&!_(a)&&(this.g.u=a),this.A=l&&l.supportsCrossDomainXhr||!1,this.v=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!_(l)&&(this.g.G=l,a=this.h,a!==null&&l in a&&(a=this.h,l in a&&delete a[l])),this.j=new wr(this)}m(ct,Me),ct.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},ct.prototype.close=function(){qa(this.g)},ct.prototype.o=function(a){var l=this.g;if(typeof a=="string"){var d={};d.__data__=a,a=d}else this.v&&(d={},d.__data__=ba(a),a=d);l.i.push(new y_(l.Ya++,a)),l.I==3&&Ui(l)},ct.prototype.N=function(){this.g.l=null,delete this.j,qa(this.g),delete this.g,ct.Z.N.call(this)};function fh(a){Ca.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var l=a.__sm__;if(l){e:{for(const d in l){a=d;break e}a=void 0}(this.i=a)&&(a=this.i,l=l!==null&&a in l?l[a]:void 0),this.data=l}else this.data=a}m(fh,Ca);function ph(){ka.call(this),this.status=1}m(ph,ka);function wr(a){this.g=a}m(wr,dh),wr.prototype.ra=function(){He(this.g,"a")},wr.prototype.qa=function(a){He(this.g,new fh(a))},wr.prototype.pa=function(a){He(this.g,new ph)},wr.prototype.oa=function(){He(this.g,"b")},Fi.prototype.createWebChannel=Fi.prototype.g,ct.prototype.send=ct.prototype.o,ct.prototype.open=ct.prototype.m,ct.prototype.close=ct.prototype.close,wp=function(){return new Fi},yp=function(){return ki()},_p=jn,mc={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Ni.NO_ERROR=0,Ni.TIMEOUT=8,Ni.HTTP_ERROR=6,to=Ni,kl.COMPLETE="complete",gp=kl,Rl.EventType=rs,rs.OPEN="a",rs.CLOSE="b",rs.ERROR="c",rs.MESSAGE="d",Me.prototype.listen=Me.prototype.J,Rs=Rl,fe.prototype.listenOnce=fe.prototype.K,fe.prototype.getLastError=fe.prototype.Ha,fe.prototype.getLastErrorCode=fe.prototype.ya,fe.prototype.getStatus=fe.prototype.ca,fe.prototype.getResponseJson=fe.prototype.La,fe.prototype.getResponseText=fe.prototype.la,fe.prototype.send=fe.prototype.ea,fe.prototype.setWithCredentials=fe.prototype.Fa,mp=fe}).apply(typeof ji<"u"?ji:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Wr="12.17.0";function ST(n){Wr=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sr=new Uo("@firebase/firestore");function Ir(){return sr.logLevel}function M(n,...e){if(sr.logLevel<=Z.DEBUG){const t=e.map(ru);sr.debug(`Firestore (${Wr}): ${n}`,...t)}}function cn(n,...e){if(sr.logLevel<=Z.ERROR){const t=e.map(ru);sr.error(`Firestore (${Wr}): ${n}`,...t)}}function St(n,...e){if(sr.logLevel<=Z.WARN){const t=e.map(ru);sr.warn(`Firestore (${Wr}): ${n}`,...t)}}function ru(n){if(typeof n=="string")return n;try{return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function B(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,Ep(n,r,t)}function Ep(n,e,t){let r=`FIRESTORE (${Wr}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw cn(r),new Error(r)}function F(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||Ep(e,s,r)}function G(n,e){return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bT(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class su{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=bT(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%62))}return r}}function J(n,e){return n<e?-1:n>e?1:0}function gc(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const s=n.charAt(r),i=e.charAt(r);if(s!==i)return Ja(s)===Ja(i)?J(s,i):Ja(s)?1:-1}return J(n.length,e.length)}const CT=55296,kT=57343;function Ja(n){const e=n.charCodeAt(0);return e>=CT&&e<=kT}function xr(n,e,t){return n.length===e.length&&n.every((r,s)=>t(r,e[s]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class le{constructor(e,t){this.comparator=e,this.root=t||Le.EMPTY}insert(e,t){return new le(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Le.BLACK,null,null))}remove(e){return new le(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Le.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Wi(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Wi(this.root,e,this.comparator,!1)}getReverseIterator(){return new Wi(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Wi(this.root,e,this.comparator,!0)}}class Wi{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Le{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??Le.RED,this.left=s??Le.EMPTY,this.right=i??Le.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new Le(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Le.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Le.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Le.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Le.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw B(43730,{key:this.key,value:this.value});if(this.right.isRed())throw B(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw B(27949);return e+(this.isRed()?0:1)}}Le.EMPTY=null,Le.RED=!0,Le.BLACK=!1;Le.EMPTY=new class{constructor(){this.size=0}get key(){throw B(57766)}get value(){throw B(16141)}get color(){throw B(16727)}get left(){throw B(29726)}get right(){throw B(36894)}copy(e,t,r,s,i){return this}insert(e,t,r){return new Le(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ie{constructor(e){this.comparator=e,this.data=new le(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Yh(this.data.getIterator())}getIteratorFrom(e){return new Yh(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof Ie)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new Ie(this.comparator);return t.data=e,t}}class Yh{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const b={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class V extends gt{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vt="__name__";class Nt{constructor(e,t,r){t===void 0?t=0:t>e.length&&B(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&B(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Nt.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Nt?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=Nt.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return J(e.length,t.length)}static compareSegments(e,t){const r=Nt.isNumericId(e),s=Nt.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?Nt.extractNumericId(e).compare(Nt.extractNumericId(t)):gc(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return vn.fromString(e.substring(4,e.length-2))}}class ne extends Nt{construct(e,t,r){return new ne(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new V(b.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(s=>s.length>0))}return new ne(t)}static emptyPath(){return new ne([])}}const NT=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let ft=class Tr extends Nt{construct(e,t,r){return new Tr(e,t,r)}static isValidIdentifier(e){return NT.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Tr.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Vt}static keyField(){return new Tr([Vt])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new V(b.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new V(b.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new V(b.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,s+=2}else c==="`"?(o=!o,s++):c!=="."||o?(r+=c,s++):(i(),s++)}if(i(),o)throw new V(b.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Tr(t)}static emptyPath(){return new Tr([])}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ht{constructor(e){this.fields=e,e.sort(ft.comparator)}static empty(){return new ht([])}unionWith(e){let t=new Ie(ft.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new ht(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return xr(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yo(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Fn(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function VT(n,e){const t=[];for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&t.push(e(n[r],r,n));return t}function Ip(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class q{constructor(e){this.path=e}static fromPath(e){return new q(ne.fromString(e))}static fromName(e){return new q(ne.fromString(e).popFirst(5))}static empty(){return new q(ne.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ne.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ne.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new q(new ne(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tp(n,e,t){if(!t)throw new V(b.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function OT(n,e,t,r){if(e===!0&&r===!0)throw new V(b.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Jh(n){if(!q.isDocumentKey(n))throw new V(b.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Xh(n){if(q.isDocumentKey(n))throw new V(b.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function pi(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function zo(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":B(12329,{type:typeof n})}function De(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new V(b.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=zo(n);throw new V(b.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ee(n,e){const t={typeString:n};return e&&(t.value=e),t}function mi(n,e){if(!pi(n))throw new V(b.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const o=n[r];if(s&&typeof o!==s){t=`JSON field '${r}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${r}' field to equal '${i.value}'`;break}}if(t)throw new V(b.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zh=-62135596800,ed=1e6;class oe{static now(){return oe.fromMillis(Date.now())}static fromDate(e){return oe.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*ed);return new oe(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new V(b.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new V(b.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<Zh)throw new V(b.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new V(b.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/ed}_compareTo(e){return this.seconds===e.seconds?J(this.nanoseconds,e.nanoseconds):J(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:oe._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(mi(e,oe._jsonSchema))return new oe(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-Zh;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}oe._jsonSchemaVersion="firestore/timestamp/1.0",oe._jsonSchema={type:Ee("string",oe._jsonSchemaVersion),seconds:Ee("number"),nanoseconds:Ee("number")};/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vp extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Te{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new vp("Invalid base64 string: "+i):i}}(e);return new Te(t)}static fromUint8Array(e){const t=function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i}(e);return new Te(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return J(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Te.EMPTY_BYTE_STRING=new Te("");const DT=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function bn(n){if(F(!!n,39018),typeof n=="string"){let e=0;const t=DT.exec(n);if(F(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:he(n.seconds),nanos:he(n.nanos)}}function he(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Cn(n){return typeof n=="string"?Te.fromBase64String(n):Te.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ap="server_timestamp",Rp="__type__",Pp="__previous_value__",Sp="__local_write_time__";function Ko(n){return(n?.mapValue?.fields||{})[Rp]?.stringValue===Ap}function gi(n){const e=n.mapValue.fields[Pp];return Ko(e)?gi(e):e}function Lr(n){const e=bn(n.mapValue.fields[Sp].timestampValue);return new oe(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xT{constructor(e,t,r,s,i,o,c,u,h,f,m,y,S){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=c,this.longPollingOptions=u,this.useFetchStreams=h,this.isUsingEmulator=f,this.apiKey=m,this._customHeaders=y,this.grpcFlowControlWindow=S}}const _c="(default)";class Hs{constructor(e,t){this.projectId=e,this.database=t||_c}static empty(){return new Hs("","")}get isDefaultDatabase(){return this.database===_c}isEqual(e){return e instanceof Hs&&e.projectId===this.projectId&&e.database===this.database}}function LT(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new V(b.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Hs(n.options.projectId,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iu=-1;function _i(n){return n==null}function Gs(n){return n===0&&1/n==-1/0}function UT(n){return typeof n=="number"&&Number.isInteger(n)&&!Gs(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}function MT(n){return typeof n=="string"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bp="__type__",FT="__max__",Hi={mapValue:{}},Cp="__vector__",zs="value",Ur={nullValue:"NULL_VALUE"},it={booleanValue:!0},Oe={booleanValue:!1};function ve(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Ko(n)?4:BT(n)?9007199254740991:wo(n)?10:11:B(28295,{value:n})}function At(n,e,t){if(n===e)return!0;const r=ve(n);if(r!==ve(e))return!1;switch(r){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Lr(n).isEqual(Lr(e));case 3:return function(i,o){if(typeof i.timestampValue=="string"&&typeof o.timestampValue=="string"&&i.timestampValue.length===o.timestampValue.length)return i.timestampValue===o.timestampValue;const c=bn(i.timestampValue),u=bn(o.timestampValue);return c.seconds===u.seconds&&c.nanos===u.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(i,o){return Cn(i.bytesValue).isEqual(Cn(o.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(i,o){return he(i.geoPointValue.latitude)===he(o.geoPointValue.latitude)&&he(i.geoPointValue.longitude)===he(o.geoPointValue.longitude)}(n,e);case 2:return function(i,o,c){if("integerValue"in i&&"integerValue"in o)return he(i.integerValue)===he(o.integerValue);let u,h;if("doubleValue"in i&&"doubleValue"in o)u=he(i.doubleValue),h=he(o.doubleValue);else{if(!c?.t)return!1;u=he(i.integerValue??i.doubleValue),h=he(o.integerValue??o.doubleValue)}return u===h?!!c?.i||Gs(u)===Gs(h):!!(c===void 0||c.o)&&isNaN(u)&&isNaN(h)}(n,e,t);case 9:return xr(n.arrayValue.values||[],e.arrayValue.values||[],(s,i)=>At(s,i,t));case 10:case 11:return function(i,o,c){const u=i.mapValue.fields||{},h=o.mapValue.fields||{};if(yo(u)!==yo(h))return!1;for(const f in u)if(u.hasOwnProperty(f)&&(h[f]===void 0||!At(u[f],h[f],c)))return!1;return!0}(n,e,t);default:return B(52216,{left:n})}}function Ks(n,e){return(n.values||[]).find(t=>At(t,e))!==void 0}function ot(n,e){if(n===e)return 0;const t=ve(n),r=ve(e);if(t!==r)return J(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return J(n.booleanValue,e.booleanValue);case 2:return function(i,o){const c=he(i.integerValue||i.doubleValue),u=he(o.integerValue||o.doubleValue);return c<u?-1:c>u?1:c===u?0:isNaN(c)?isNaN(u)?0:-1:1}(n,e);case 3:return td(n.timestampValue,e.timestampValue);case 4:return td(Lr(n),Lr(e));case 5:return gc(n.stringValue,e.stringValue);case 6:return function(i,o){const c=Cn(i),u=Cn(o);return c.compareTo(u)}(n.bytesValue,e.bytesValue);case 7:return function(i,o){const c=i.split("/"),u=o.split("/");for(let h=0;h<c.length&&h<u.length;h++){const f=J(c[h],u[h]);if(f!==0)return f}return J(c.length,u.length)}(n.referenceValue,e.referenceValue);case 8:return function(i,o){const c=J(he(i.latitude),he(o.latitude));return c!==0?c:J(he(i.longitude),he(o.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return nd(n.arrayValue,e.arrayValue);case 10:return function(i,o){const c=i.fields||{},u=o.fields||{},h=c[zs]?.arrayValue,f=u[zs]?.arrayValue,m=J(h?.values?.length||0,f?.values?.length||0);return m!==0?m:nd(h,f)}(n.mapValue,e.mapValue);case 11:return function(i,o){if(i===Hi.mapValue&&o===Hi.mapValue)return 0;if(i===Hi.mapValue)return 1;if(o===Hi.mapValue)return-1;const c=i.fields||{},u=Object.keys(c),h=o.fields||{},f=Object.keys(h);u.sort(),f.sort();for(let m=0;m<u.length&&m<f.length;++m){const y=gc(u[m],f[m]);if(y!==0)return y;const S=ot(c[u[m]],h[f[m]]);if(S!==0)return S}return J(u.length,f.length)}(n.mapValue,e.mapValue);default:throw B(23264,{u:t})}}function td(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return J(n,e);const t=bn(n),r=bn(e),s=J(t.seconds,r.seconds);return s!==0?s:J(t.nanos,r.nanos)}function nd(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=ot(t[s],r[s]);if(i!==void 0&&i!==0)return i}return J(t.length,r.length)}function Mr(n){return yc(n)}function yc(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=bn(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return Cn(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return q.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=yc(i);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of r)i?i=!1:s+=",",s+=`${o}:${yc(t.fields[o])}`;return s+"}"}(n.mapValue):B(61005,{value:n})}function no(n){switch(ve(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=gi(n);return e?16+no(e):16;case 5:return 2*n.stringValue.length;case 6:return Cn(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((s,i)=>s+no(i),0)}(n.arrayValue);case 10:case 11:return function(r){let s=0;return Fn(r.fields,(i,o)=>{s+=i.length+no(o)}),s}(n.mapValue);default:throw B(13486,{value:n})}}function rd(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function Ot(n){return!!n&&"integerValue"in n}function Yn(n){return!!n&&"doubleValue"in n}function kn(n){return Ot(n)||Yn(n)}function Fr(n){return!!n&&"arrayValue"in n}function dt(n){return!!n&&"nullValue"in n}function at(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Zn(n){return!!n&&"mapValue"in n}function wo(n){return(n?.mapValue?.fields||{})[bp]?.stringValue===Cp}function wc(n){return(n?.mapValue?.fields||{})[zs]?.arrayValue}function Ns(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return Fn(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=Ns(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Ns(n.arrayValue.values[t]);return e}return{...n}}function BT(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===FT}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qe{constructor(e){this.value=e}static empty(){return new qe({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Zn(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ns(t)}setAll(e){let t=ft.emptyPath(),r={},s=[];e.forEach((o,c)=>{if(!t.isImmediateParentOf(c)){const u=this.getFieldsMap(t);this.applyChanges(u,r,s),r={},s=[],t=c.popLast()}o?r[c.lastSegment()]=Ns(o):s.push(c.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());Zn(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return At(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];Zn(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){Fn(t,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new qe(Ns(this.value))}}function kp(n){const e=[];return Fn(n.fields,(t,r)=>{const s=new ft([t]);if(Zn(r)){const i=kp(r.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)}),new ht(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qo(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Gs(e)?"-0":e}}function ou(n){return{integerValue:""+n}}function au(n,e,t){return UT(e)?ou(e):Qo(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yo{constructor(){this._=void 0}}function qT(n,e,t){return n instanceof Qs?function(s,i){const o={fields:{[Rp]:{stringValue:Ap},[Sp]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Ko(i)&&(i=gi(i)),i&&(o.fields[Pp]=i),{mapValue:o}}(t,e):n instanceof Ys?Vp(n,e):n instanceof Js?Op(n,e):n instanceof Xs?function(s,i){const o=Np(s,i),c=To(o)+To(s.l);return Ot(o)&&Ot(s.l)?ou(c):Qo(s.serializer,c)}(n,e):n instanceof Eo?function(s,i){return sd(s,i,Math.min)}(n,e):n instanceof Io?function(s,i){return sd(s,i,Math.max)}(n,e):void 0}function $T(n,e,t){return n instanceof Ys?Vp(n,e):n instanceof Js?Op(n,e):t}function Np(n,e){return n instanceof Xs?kn(e)?e:{integerValue:0}:null}class Qs extends Yo{}class Ys extends Yo{constructor(e){super(),this.elements=e}}function Vp(n,e){const t=Dp(e);for(const r of n.elements)t.some(s=>At(s,r))||t.push(r);return{arrayValue:{values:t}}}class Js extends Yo{constructor(e){super(),this.elements=e}}function Op(n,e){let t=Dp(e);for(const r of n.elements)t=t.filter(s=>!At(s,r));return{arrayValue:{values:t}}}class cu extends Yo{constructor(e,t){super(),this.serializer=e,this.l=t}}class Xs extends cu{}class Eo extends cu{}class Io extends cu{}function sd(n,e,t){if(!kn(e))return n.l;const r=t(To(e),To(n.l));return Ot(e)&&Ot(n.l)?ou(r):Qo(n.serializer,r)}function To(n){return he(n.integerValue||n.doubleValue)}function Dp(n){return Fr(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jT{constructor(e,t){this.field=e,this.transform=t}}function WT(n,e){return n.field.isEqual(e.field)&&function(r,s){return r instanceof Ys&&s instanceof Ys||r instanceof Js&&s instanceof Js?xr(r.elements,s.elements,At):r instanceof Xs&&s instanceof Xs||r instanceof Eo&&s instanceof Eo||r instanceof Io&&s instanceof Io?At(r.l,s.l):r instanceof Qs&&s instanceof Qs}(n.transform,e.transform)}class HT{constructor(e,t){this.version=e,this.transformResults=t}}class ye{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new ye}static exists(e){return new ye(void 0,e)}static updateTime(e){return new ye(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function ro(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Jo{}function xp(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new wi(n.key,ye.none()):new yi(n.key,n.data,ye.none());{const t=n.data,r=qe.empty();let s=new Ie(ft.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?r.delete(i):r.set(i,o),s=s.add(i)}return new Bn(n.key,r,new ht(s.toArray()),ye.none())}}function GT(n,e,t){n instanceof yi?function(s,i,o){const c=s.value.clone(),u=od(s.fieldTransforms,i,o.transformResults);c.setAll(u),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()}(n,e,t):n instanceof Bn?function(s,i,o){if(!ro(s.precondition,i))return void i.convertToUnknownDocument(o.version);const c=od(s.fieldTransforms,i,o.transformResults),u=i.data;u.setAll(Lp(s)),u.setAll(c),i.convertToFoundDocument(o.version,u).setHasCommittedMutations()}(n,e,t):function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,t)}function Vs(n,e,t,r){return n instanceof yi?function(i,o,c,u){if(!ro(i.precondition,o))return c;const h=i.value.clone(),f=ad(i.fieldTransforms,u,o);return h.setAll(f),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),null}(n,e,t,r):n instanceof Bn?function(i,o,c,u){if(!ro(i.precondition,o))return c;const h=ad(i.fieldTransforms,u,o),f=o.data;return f.setAll(Lp(i)),f.setAll(h),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(m=>m.field))}(n,e,t,r):function(i,o,c){return ro(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):c}(n,e,t)}function zT(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=Np(r.transform,s||null);i!=null&&(t===null&&(t=qe.empty()),t.set(r.field,i))}return t||null}function id(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&xr(r,s,(i,o)=>WT(i,o))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class yi extends Jo{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Bn extends Jo{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Lp(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function od(n,e,t){const r=new Map;F(n.length===t.length,32656,{h:t.length,T:n.length});for(let s=0;s<t.length;s++){const i=n[s],o=i.transform,c=e.data.field(i.field);r.set(i.field,$T(o,c,t[s]))}return r}function ad(n,e,t){const r=new Map;for(const s of n){const i=s.transform,o=t.data.field(s.field);r.set(s.field,qT(i,o,e))}return r}class wi extends Jo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Up extends Jo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vo{constructor(e,t){this.position=e,this.inclusive=t}}function cd(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],o=n.position[s];if(i.field.isKeyField()?r=q.comparator(q.fromName(o.referenceValue),t.key):r=ot(o,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function ud(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!At(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mp{}class we extends Mp{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new QT(e,t,r):t==="array-contains"?new XT(e,r):t==="in"?new ZT(e,r):t==="not-in"?new ev(e,r):t==="array-contains-any"?new tv(e,r):new we(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new YT(e,r):new JT(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(ot(t,this.value)):t!==null&&ve(this.value)===ve(t)&&this.matchesComparison(ot(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return B(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class bt extends Mp{constructor(e,t){super(),this.filters=e,this.op=t,this.P=null}static create(e,t){return new bt(e,t)}matches(e){return Fp(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.P!==null||(this.P=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.P}getFilters(){return Object.assign([],this.filters)}}function Fp(n){return n.op==="and"}function Bp(n){return KT(n)&&Fp(n)}function KT(n){for(const e of n.filters)if(e instanceof bt)return!1;return!0}function Ec(n){if(n instanceof we)return n.field.canonicalString()+n.op.toString()+Mr(n.value);if(Bp(n))return n.filters.map(e=>Ec(e)).join(",");{const e=n.filters.map(t=>Ec(t)).join(",");return`${n.op}(${e})`}}function qp(n,e){return n instanceof we?function(r,s){return s instanceof we&&r.op===s.op&&r.field.isEqual(s.field)&&At(r.value,s.value)}(n,e):n instanceof bt?function(r,s){return s instanceof bt&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,o,c)=>i&&qp(o,s.filters[c]),!0):!1}(n,e):void B(19439)}function $p(n){return n instanceof we?function(t){return`${t.field.canonicalString()} ${t.op} ${Mr(t.value)}`}(n):n instanceof bt?function(t){return t.op.toString()+" {"+t.getFilters().map($p).join(" ,")+"}"}(n):"Filter"}class QT extends we{constructor(e,t,r){super(e,t,r),this.key=q.fromName(r.referenceValue)}matches(e){const t=q.comparator(e.key,this.key);return this.matchesComparison(t)}}class YT extends we{constructor(e,t){super(e,"in",t),this.keys=jp("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class JT extends we{constructor(e,t){super(e,"not-in",t),this.keys=jp("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function jp(n,e){return(e.arrayValue?.values||[]).map(t=>q.fromName(t.referenceValue))}class XT extends we{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Fr(t)&&Ks(t.arrayValue,this.value)}}class ZT extends we{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Ks(this.value.arrayValue,t)}}class ev extends we{constructor(e,t){super(e,"not-in",t)}matches(e){if(Ks(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Ks(this.value.arrayValue,t)}}class tv extends we{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Fr(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Ks(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zs{constructor(e,t="asc"){this.field=e,this.dir=t}}function nv(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class H{static fromTimestamp(e){return new H(e)}static min(){return new H(new oe(0,0))}static max(){return new H(new oe(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ve{constructor(e,t,r,s,i,o,c){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=o,this.documentState=c}static newInvalidDocument(e){return new Ve(e,0,H.min(),H.min(),H.min(),qe.empty(),0)}static newFoundDocument(e,t,r,s){return new Ve(e,1,t,H.min(),r,s,0)}static newNoDocument(e,t){return new Ve(e,2,t,H.min(),H.min(),qe.empty(),0)}static newUnknownDocument(e,t){return new Ve(e,3,t,H.min(),H.min(),qe.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(H.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=qe.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=qe.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=H.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Ve&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Ve(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ei=-1;function rv(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=H.fromTimestamp(r===1e9?new oe(t+1,0):new oe(t,r));return new Nn(s,q.empty(),e)}function sv(n){return new Nn(n.readTime,n.key,ei)}class Nn{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new Nn(H.min(),q.empty(),ei)}static max(){return new Nn(H.max(),q.empty(),ei)}}function iv(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=q.comparator(n.documentKey,e.documentKey),t!==0?t:J(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ov{constructor(e,t=null,r=[],s=[],i=null,o=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=o,this.endAt=c,this.R=null}}function ld(n,e=null,t=[],r=[],s=null,i=null,o=null){return new ov(n,e,t,r,s,i,o)}function Wp(n){const e=G(n);if(e.R===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>Ec(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),_i(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Mr(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Mr(r)).join(",")),e.R=t}return e.R}function Hp(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!nv(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!qp(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!ud(n.startAt,e.startAt)&&ud(n.endAt,e.endAt)}function Qn(n){return!!n.isCorePipeline}function Gp(n){return!!n.path&&q.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hr{constructor(e,t=null,r=[],s=[],i=null,o="F",c=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=o,this.startAt=c,this.endAt=u,this.I=null,this.A=null,this.V=null,this.startAt,this.endAt}}function av(n,e,t,r,s,i,o,c){return new Hr(n,e,t,r,s,i,o,c)}function Xo(n){return new Hr(n)}function hd(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function cv(n){return q.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function zp(n){return n.collectionGroup!==null}function Os(n){const e=G(n);if(e.I===null){e.I=[];const t=new Set;for(const i of e.explicitOrderBy)e.I.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let c=new Ie(ft.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(h=>{h.isInequality()&&(c=c.add(h.field))})}),c})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.I.push(new Zs(i,r))}),t.has(ft.keyField().canonicalString())||e.I.push(new Zs(ft.keyField(),r))}return e.I}function xt(n){const e=G(n);return e.A||(e.A=uv(e,Os(n))),e.A}function uv(n,e){if(n.limitType==="F")return ld(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new Zs(s.field,i)});const t=n.endAt?new vo(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new vo(n.startAt.position,n.startAt.inclusive):null;return ld(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function Ic(n,e){const t=n.filters.concat([e]);return new Hr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function lv(n,e){const t=n.explicitOrderBy.concat([e]);return new Hr(n.path,n.collectionGroup,t,n.filters.slice(),n.limit,n.limitType,n.startAt,n.endAt)}function Ao(n,e,t){return new Hr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function hv(n,e){return Hp(xt(n),xt(e))&&n.limitType===e.limitType}function Ds(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(s=>$p(s)).join(", ")}]`),_i(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(s=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(s)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(s=>Mr(s)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(s=>Mr(s)).join(",")),`Target(${r})`}(xt(n))}; limitType=${n.limitType})`}function Zo(n,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):q.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(n,e)&&function(r,s){for(const i of Os(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(n,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(n,e)&&function(r,s){return!(r.startAt&&!function(o,c,u){const h=cd(o,c,u);return o.inclusive?h<=0:h<0}(r.startAt,Os(r),s)||r.endAt&&!function(o,c,u){const h=cd(o,c,u);return o.inclusive?h>=0:h>0}(r.endAt,Os(r),s))}(n,e)}function uu(n){return(e,t)=>{let r=!1;for(const s of Os(n)){const i=dv(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function dv(n,e,t){const r=n.field.isKeyField()?q.comparator(e.key,t.key):function(i,o,c){const u=o.data.field(i),h=c.data.field(i);return u!==null&&h!==null?ot(u,h):B(42886)}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return B(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fv{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ge,ee;function Kp(n){switch(n){case b.OK:return B(64938);case b.CANCELLED:case b.UNKNOWN:case b.DEADLINE_EXCEEDED:case b.RESOURCE_EXHAUSTED:case b.INTERNAL:case b.UNAVAILABLE:case b.UNAUTHENTICATED:return!1;case b.INVALID_ARGUMENT:case b.NOT_FOUND:case b.ALREADY_EXISTS:case b.PERMISSION_DENIED:case b.FAILED_PRECONDITION:case b.ABORTED:case b.OUT_OF_RANGE:case b.UNIMPLEMENTED:case b.DATA_LOSS:return!0;default:return B(15467,{code:n})}}function Qp(n){if(n===void 0)return cn("GRPC error has no .code"),b.UNKNOWN;switch(n){case ge.OK:return b.OK;case ge.CANCELLED:return b.CANCELLED;case ge.UNKNOWN:return b.UNKNOWN;case ge.DEADLINE_EXCEEDED:return b.DEADLINE_EXCEEDED;case ge.RESOURCE_EXHAUSTED:return b.RESOURCE_EXHAUSTED;case ge.INTERNAL:return b.INTERNAL;case ge.UNAVAILABLE:return b.UNAVAILABLE;case ge.UNAUTHENTICATED:return b.UNAUTHENTICATED;case ge.INVALID_ARGUMENT:return b.INVALID_ARGUMENT;case ge.NOT_FOUND:return b.NOT_FOUND;case ge.ALREADY_EXISTS:return b.ALREADY_EXISTS;case ge.PERMISSION_DENIED:return b.PERMISSION_DENIED;case ge.FAILED_PRECONDITION:return b.FAILED_PRECONDITION;case ge.ABORTED:return b.ABORTED;case ge.OUT_OF_RANGE:return b.OUT_OF_RANGE;case ge.UNIMPLEMENTED:return b.UNIMPLEMENTED;case ge.DATA_LOSS:return b.DATA_LOSS;default:return B(39323,{code:n})}}(ee=ge||(ge={}))[ee.OK=0]="OK",ee[ee.CANCELLED=1]="CANCELLED",ee[ee.UNKNOWN=2]="UNKNOWN",ee[ee.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ee[ee.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ee[ee.NOT_FOUND=5]="NOT_FOUND",ee[ee.ALREADY_EXISTS=6]="ALREADY_EXISTS",ee[ee.PERMISSION_DENIED=7]="PERMISSION_DENIED",ee[ee.UNAUTHENTICATED=16]="UNAUTHENTICATED",ee[ee.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ee[ee.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ee[ee.ABORTED=10]="ABORTED",ee[ee.OUT_OF_RANGE=11]="OUT_OF_RANGE",ee[ee.UNIMPLEMENTED=12]="UNIMPLEMENTED",ee[ee.INTERNAL=13]="INTERNAL",ee[ee.UNAVAILABLE=14]="UNAVAILABLE",ee[ee.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dr{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Fn(this.inner,(t,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return Ip(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pv=new le(q.comparator);function rt(){return pv}const Yp=new le(q.comparator);function vr(...n){let e=Yp;for(const t of n)e=e.insert(t.key,t);return e}function Jp(n){let e=Yp;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function En(){return xs()}function Xp(){return xs()}function xs(){return new dr(n=>n.toString(),(n,e)=>n.isEqual(e))}const mv=new le(q.comparator),gv=new Ie(q.comparator);function Y(...n){let e=gv;for(const t of n)e=e.add(t);return e}const _v=new Ie(J);function yv(){return _v}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wv(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ev=new vn([4294967295,4294967295],0);function dd(n){const e=wv().encode(n),t=new pp;return t.update(e),new Uint8Array(t.digest())}function fd(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new vn([t,r],0),new vn([s,i],0)]}class lu{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Ps(`Invalid padding: ${t}`);if(r<0)throw new Ps(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Ps(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Ps(`Invalid padding when bitmap length is 0: ${t}`);this.m=8*e.length-t,this.p=vn.fromNumber(this.m)}v(e,t,r){let s=e.add(t.multiply(vn.fromNumber(r)));return s.compare(Ev)===1&&(s=new vn([s.getBits(0),s.getBits(1)],0)),s.modulo(this.p).toNumber()}S(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.m===0)return!1;const t=dd(e),[r,s]=fd(t);for(let i=0;i<this.hashCount;i++){const o=this.v(r,s,i);if(!this.S(o))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new lu(i,s,t);return r.forEach(c=>o.insert(c)),o}insert(e){if(this.m===0)return;const t=dd(e),[r,s]=fd(t);for(let i=0;i<this.hashCount;i++){const o=this.v(r,s,i);this.D(o)}}D(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Ps extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ei{constructor(e,t,r,s,i,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,Ii.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Ei(H.min(),s,new le(J),rt(),rt(),Y())}}class Ii{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new Ii(r,t,Y(),Y(),Y())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class so{constructor(e,t,r,s){this.C=e,this.removedTargetIds=t,this.key=r,this.F=s}}class Zp{constructor(e,t){this.targetId=e,this.O=t}}class em{constructor(e,t,r=Te.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class pd{constructor(e){this.targetId=e,this.M=0,this.N=md(),this.L=Te.EMPTY_BYTE_STRING,this.B=!1,this.U=!0}get current(){return this.B}get resumeToken(){return this.L}get k(){return this.M!==0}get q(){return this.U}$(e){e.approximateByteSize()>0&&(this.U=!0,this.L=e)}K(){let e=Y(),t=Y(),r=Y();return this.N.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:B(38017,{changeType:i})}}),new Ii(this.L,this.B,e,t,r)}W(){this.U=!1,this.N=md()}G(e,t){this.U=!0,this.N=this.N.insert(e,t)}j(e){this.U=!0,this.N=this.N.remove(e)}H(){this.M+=1}J(){this.M-=1,F(this.M>=0,3241,{M:this.M,targetId:this.targetId})}Y(){this.U=!0,this.B=!0}}const ws="WatchChangeAggregator";class Iv{constructor(e){this.Z=e,this.X=new Map,this.ee=rt(),this.te=Gi(),this.ne=rt(),this.re=Gi(),this.ie=new le(J)}se(e){for(const t of e.C)e.F&&e.F.isFoundDocument()?this._e(t,e.F):this.oe(t,e.key,e.F);for(const t of e.removedTargetIds)this.oe(t,e.key,e.F)}ae(e){this.forEachTarget(e,t=>{const r=this.X.get(t);if(r)switch(e.state){case 0:this.ue(t)&&r.$(e.resumeToken);break;case 1:r.J(),r.k||r.W(),r.$(e.resumeToken);break;case 2:r.J(),r.k||this.removeTarget(t);break;case 3:this.ue(t)&&(r.Y(),r.$(e.resumeToken));break;case 4:this.ue(t)&&(this.ce(t),r.$(e.resumeToken));break;default:B(56790,{state:e.state})}else M(ws,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.X.forEach((r,s)=>{this.ue(s)&&t(s)})}le(e){return Qn(e)?e.getPipelineSourceType()==="documents"&&e.getPipelineDocuments()?.length===1:Gp(e)}Ee(e){const t=e.targetId,r=e.O.count,s=this.he(t);if(s){const i=s.target;if(this.le(i))if(r===0){const o=new q(Qn(i)?ne.fromString(i.getPipelineDocuments()[0]):i.path);this.oe(t,o,Ve.newNoDocument(o,H.min()))}else F(r===1,20013,"Single document existence filter with count: "+r);else{const o=this.Te(t);if(o!==r){const c=this.Pe(e),u=c?this.Re(c,e,o):1;if(u!==0){this.ce(t);const h=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.ie=this.ie.insert(t,h)}}}}}Pe(e){const t=e.O.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let o,c;try{o=Cn(r).toUint8Array()}catch(u){if(u instanceof vp)return St("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{c=new lu(o,s,i)}catch(u){return St(u instanceof Ps?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return c.m===0?null:c}Re(e,t,r){return t.O.count===r-this.Ve(e,t.targetId)?0:2}Ve(e,t){const r=this.Z.getRemoteKeysForTarget(t);let s=0;return r.forEach(i=>{const o=this.Z.Ae(),c=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.oe(t,i,null),s++)}),s}de(e){const t=new Map;this.X.forEach((i,o)=>{const c=this.he(o);if(c){if(i.current&&this.le(c.target)){const u=Qn(c.target)?ne.fromString(c.target.getPipelineDocuments()[0]):c.target.path,h=new q(u);this.fe(h).has(o)||this.me(o,h)||this.oe(o,h,Ve.newNoDocument(h,e))}i.q&&(t.set(o,i.K()),i.W())}});let r=Y();this.re.forEach((i,o)=>{let c=!0;o.forEachWhile(u=>{const h=this.he(u);return!h||h.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(r=r.add(i))}),this.ee.forEach((i,o)=>o.setReadTime(e)),this.ne.forEach((i,o)=>o.setReadTime(e));const s=new Ei(e,t,this.ie,this.ee,this.ne,r);return this.ee=rt(),this.te=Gi(),this.ne=rt(),this.re=Gi(),this.ie=new le(J),s}_e(e,t){const r=this.X.get(e);if(!r||!this.ue(e))return void M(ws,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.me(e,t.key)?2:0;r.G(t.key,s),Qn(this.he(e).target)&&this.he(e).target.getPipelineFlavor()!=="exact"?this.ne=this.ne.insert(t.key,t):this.ee=this.ee.insert(t.key,t),this.te=this.te.insert(t.key,this.fe(t.key).add(e)),this.re=this.re.insert(t.key,this.pe(t.key).add(e))}oe(e,t,r){const s=this.X.get(e);s&&this.ue(e)?(this.me(e,t)?s.G(t,1):s.j(t),this.re=this.re.insert(t,this.pe(t).delete(e)),this.re=this.re.insert(t,this.pe(t).add(e)),r&&(Qn(this.he(e).target)&&this.he(e).target.getPipelineFlavor()!=="exact"?this.ne=this.ne.insert(t,r):this.ee=this.ee.insert(t,r))):M(ws,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.X.delete(e)}Te(e){const t=this.X.get(e);if(!t)return 0;const r=t.K();return this.Z.getRemoteKeysForTarget(e).size+r.addedDocuments.size-r.removedDocuments.size}H(e){let t=this.X.get(e);t||(M(ws,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new pd(e),this.X.set(e,t)),t.H()}pe(e){let t=this.re.get(e);return t||(t=new Ie(J),this.re=this.re.insert(e,t)),t}fe(e){let t=this.te.get(e);return t||(t=new Ie(J),this.te=this.te.insert(e,t)),t}ue(e){const t=this.he(e)!==null;return t||M(ws,"Detected inactive target",e),t}he(e){const t=this.X.get(e);return t===void 0||t.k?null:this.Z.ge(e)}ce(e){this.X.set(e,new pd(e)),this.Z.getRemoteKeysForTarget(e).forEach(t=>{this.oe(e,t,null)})}me(e,t){return this.Z.getRemoteKeysForTarget(e).has(t)}}function Gi(){return new le(q.comparator)}function md(){return new le(q.comparator)}const Tv={asc:"ASCENDING",desc:"DESCENDING"},vv={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},Av={and:"AND",or:"OR"};class Rv{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Tc(n,e){return n.useProto3Json||_i(e)?e:{value:e}}function Ro(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function hu(n){const e=bn(n);return new oe(e.seconds,e.nanos)}function tm(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function io(n,e){return Ro(n,e.toTimestamp())}function pt(n){return F(!!n,49232),H.fromTimestamp(hu(n))}function du(n,e){return vc(n,e).canonicalString()}function vc(n,e){const t=function(s){return new ne(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function nm(n){const e=ne.fromString(n);return F(cm(e),10190,{key:e.toString()}),e}function ti(n,e){return du(n.databaseId,e.path)}function Ls(n,e){const t=nm(e);if(t.get(1)!==n.databaseId.projectId)throw new V(b.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new V(b.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new q(sm(t))}function rm(n,e){return du(n.databaseId,e)}function Pv(n){const e=nm(n);return e.length===4?ne.emptyPath():sm(e)}function Ac(n){return new ne(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function sm(n){return F(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function gd(n,e,t){return{name:ti(n,e),fields:t.value.mapValue.fields}}function Sv(n,e){return"found"in e?function(r,s){F(!!s.found,43571),s.found.name,s.found.updateTime;const i=Ls(r,s.found.name),o=pt(s.found.updateTime),c=s.found.createTime?pt(s.found.createTime):H.min(),u=new qe({mapValue:{fields:s.found.fields}});return Ve.newFoundDocument(i,o,c,u)}(n,e):"missing"in e?function(r,s){F(!!s.missing,3894),F(!!s.readTime,22933);const i=Ls(r,s.missing),o=pt(s.readTime);return Ve.newNoDocument(i,o)}(n,e):B(7234,{result:e})}function bv(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:B(39313,{state:h})}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(h,f){return h.useProto3Json?(F(f===void 0||typeof f=="string",58123),Te.fromBase64String(f||"")):(F(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),Te.fromUint8Array(f||new Uint8Array))}(n,e.targetChange.resumeToken),o=e.targetChange.cause,c=o&&function(h){const f=h.code===void 0?b.UNKNOWN:Qp(h.code);return new V(f,h.message||"")}(o);t=new em(r,s,i,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Ls(n,r.document.name),i=pt(r.document.updateTime),o=r.document.createTime?pt(r.document.createTime):H.min(),c=new qe({mapValue:{fields:r.document.fields}}),u=Ve.newFoundDocument(s,i,o,c),h=r.targetIds||[],f=r.removedTargetIds||[];t=new so(h,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Ls(n,r.document),i=r.readTime?pt(r.readTime):H.min(),o=Ve.newNoDocument(s,i),c=r.removedTargetIds||[];t=new so([],c,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Ls(n,r.document),i=r.removedTargetIds||[];t=new so([],i,s,null)}else{if(!("filter"in e))return B(11601,{ye:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,o=new fv(s,i),c=r.targetId;t=new Zp(c,o)}}return t}function im(n,e){let t;if(e instanceof yi)t={update:gd(n,e.key,e.value)};else if(e instanceof wi)t={delete:ti(n,e.key)};else if(e instanceof Bn)t={update:gd(n,e.key,e.data),updateMask:Mv(e.fieldMask)};else{if(!(e instanceof Up))return B(16599,{we:e.type});t={verify:ti(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(i,o){const c=o.transform;if(c instanceof Qs)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof Ys)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof Js)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof Xs)return{fieldPath:o.field.canonicalString(),increment:c.l};if(c instanceof Eo)return{fieldPath:o.field.canonicalString(),minimum:c.l};if(c instanceof Io)return{fieldPath:o.field.canonicalString(),maximum:c.l};throw B(20930,{transform:o.transform})}(0,r))),e.precondition.isNone||(t.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:io(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:B(27497)}(n,e.precondition)),t}function Cv(n,e){return n&&n.length>0?(F(e!==void 0,14353),n.map(t=>function(s,i){let o=s.updateTime?pt(s.updateTime):pt(i);return o.isEqual(H.min())&&(o=pt(i)),new HT(o,s.transformResults||[])}(t,e))):[]}function kv(n,e){return{documents:[rm(n,e.path)]}}function Nv(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=rm(n,s);const i=function(h){if(h.length!==0)return am(bt.create(h,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const o=function(h){if(h.length!==0)return h.map(f=>function(y){return{field:Ar(y.field),direction:xv(y.dir)}}(f))}(e.orderBy);o&&(t.structuredQuery.orderBy=o);const c=Tc(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{be:t,parent:s}}function Vv(n){let e=Pv(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){F(r===1,65062);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let i=[];t.where&&(i=function(m){const y=om(m);return y instanceof bt&&Bp(y)?y.getFilters():[y]}(t.where));let o=[];t.orderBy&&(o=function(m){return m.map(y=>function(k){return new Zs(Rr(k.field),function(O){switch(O){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(k.direction))}(y))}(t.orderBy));let c=null;t.limit&&(c=function(m){let y;return y=typeof m=="object"?m.value:m,_i(y)?null:y}(t.limit));let u=null;t.startAt&&(u=function(m){const y=!!m.before,S=m.values||[];return new vo(S,y)}(t.startAt));let h=null;return t.endAt&&(h=function(m){const y=!m.before,S=m.values||[];return new vo(S,y)}(t.endAt)),av(e,s,o,i,c,"F",u,h)}function Ov(n,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return B(28987,{purpose:s})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Dv(n,e){return{structuredPipeline:{pipeline:{stages:e.stages.map(t=>t._toProto(n))}}}}function om(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Rr(t.unaryFilter.field);return we.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Rr(t.unaryFilter.field);return we.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Rr(t.unaryFilter.field);return we.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Rr(t.unaryFilter.field);return we.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return B(61313);default:return B(60726)}}(n):n.fieldFilter!==void 0?function(t){return we.create(Rr(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return B(58110);default:return B(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return bt.create(t.compositeFilter.filters.map(r=>om(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return B(1026)}}(t.compositeFilter.op))}(n):B(30097,{filter:n})}function xv(n){return Tv[n]}function Lv(n){return vv[n]}function Uv(n){return Av[n]}function Ar(n){return{fieldPath:n.canonicalString()}}function Rr(n){return ft.fromServerFormat(n.fieldPath)}function am(n){return n instanceof we?function(t){if(t.op==="=="){if(at(t.value))return{unaryFilter:{field:Ar(t.field),op:"IS_NAN"}};if(dt(t.value))return{unaryFilter:{field:Ar(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(at(t.value))return{unaryFilter:{field:Ar(t.field),op:"IS_NOT_NAN"}};if(dt(t.value))return{unaryFilter:{field:Ar(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Ar(t.field),op:Lv(t.op),value:t.value}}}(n):n instanceof bt?function(t){const r=t.getFilters().map(s=>am(s));return r.length===1?r[0]:{compositeFilter:{op:Uv(t.op),filters:r}}}(n):B(54877,{filter:n})}function Mv(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function cm(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function um(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}function ni(n,e){const t={fields:{}};return e.forEach((r,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=r._toProto(n)}),{mapValue:t}}function lm(n){return{stringValue:n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ea(n){return new Rv(n,!0)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new lt(Te.fromBase64String(e))}catch(t){throw new V(b.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new lt(Te.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:lt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(mi(e,lt._jsonSchema))return lt.fromBase64String(e.bytes)}}lt._jsonSchemaVersion="firestore/bytes/1.0",lt._jsonSchema={type:Ee("string",lt._jsonSchemaVersion),bytes:Ee("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gr{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new V(b.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ft(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function Fv(){return new Gr(Vt)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ta{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new V(b.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new V(b.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return J(this._lat,e._lat)||J(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Lt._jsonSchemaVersion}}static fromJSON(e){if(mi(e,Lt._jsonSchema))return new Lt(e.latitude,e.longitude)}}Lt._jsonSchemaVersion="firestore/geoPoint/1.0",Lt._jsonSchema={type:Ee("string",Lt._jsonSchemaVersion),latitude:Ee("number"),longitude:Ee("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Be{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Be.UNAUTHENTICATED=new Be(null),Be.GOOGLE_CREDENTIALS=new Be("google-credentials-uid"),Be.FIRST_PARTY=new Be("first-party-uid"),Be.MOCK_USER=new Be("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ut{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hm{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Bv{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Be.UNAUTHENTICATED))}shutdown(){}}class qv{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class $v{constructor(e){this.Se=e,this.currentUser=Be.UNAUTHENTICATED,this.De=0,this.forceRefresh=!1,this.auth=null}start(e,t){F(this.xe===void 0,42304);let r=this.De;const s=u=>this.De!==r?(r=this.De,t(u)):Promise.resolve();let i=new Ut;this.xe=()=>{this.De++,this.currentUser=this.Ce(),i.resolve(),i=new Ut,e.enqueueRetryable(()=>s(this.currentUser))};const o=()=>{const u=i;e.enqueueRetryable(async()=>{await u.promise,await s(this.currentUser)})},c=u=>{M("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.xe&&(this.auth.addAuthTokenListener(this.xe),o())};this.Se.onInit(u=>c(u)),setTimeout(()=>{if(!this.auth){const u=this.Se.getImmediate({optional:!0});u?c(u):(M("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Ut)}},0),o()}getToken(){const e=this.De,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.De!==e?(M("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(F(typeof r.accessToken=="string",31837,{Fe:r}),new hm(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.xe&&this.auth.removeAuthTokenListener(this.xe),this.xe=void 0}Ce(){const e=this.auth&&this.auth.getUid();return F(e===null||typeof e=="string",2055,{Oe:e}),new Be(e)}}class jv{constructor(e,t,r){this.Me=e,this.Ne=t,this.Le=r,this.type="FirstParty",this.user=Be.FIRST_PARTY,this.Be=new Map}Ue(){return this.Le?this.Le():null}get headers(){this.Be.set("X-Goog-AuthUser",this.Me);const e=this.Ue();return e&&this.Be.set("Authorization",e),this.Ne&&this.Be.set("X-Goog-Iam-Authorization-Token",this.Ne),this.Be}}class Wv{constructor(e,t,r){this.Me=e,this.Ne=t,this.Le=r}getToken(){return Promise.resolve(new jv(this.Me,this.Ne,this.Le))}start(e,t){e.enqueueRetryable(()=>t(Be.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class _d{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Hv{constructor(e,t){this.ke=t,this.forceRefresh=!1,this.appCheck=null,this.qe=null,this.$e=null,pe(e)&&e.settings.appCheckToken&&(this.$e=e.settings.appCheckToken)}start(e,t){F(this.xe===void 0,3512);const r=i=>{i.error!=null&&M("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.qe;return this.qe=i.token,M("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.xe=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{M("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.xe&&this.appCheck.addTokenListener(this.xe)};this.ke.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.ke.getImmediate({optional:!0});i?s(i):M("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.$e)return Promise.resolve(new _d(this.$e));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(F(typeof t.token=="string",44558,{tokenResult:t}),this.qe=t.token,new _d(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.xe&&this.appCheck.removeTokenListener(this.xe),this.xe=void 0}}function dm(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gv{Ke(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yd="ConnectivityMonitor";class wd{constructor(){this.We=()=>this.Qe(),this.Ge=()=>this.ze(),this.je=[],this.He()}Ke(e){this.je.push(e)}shutdown(){window.removeEventListener("online",this.We),window.removeEventListener("offline",this.Ge)}He(){window.addEventListener("online",this.We),window.addEventListener("offline",this.Ge)}Qe(){M(yd,"Network connectivity changed: AVAILABLE");for(const e of this.je)e(0)}ze(){M(yd,"Network connectivity changed: UNAVAILABLE");for(const e of this.je)e(1)}static Je(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let zi=null;function Rc(){return zi===null?zi=function(){return 268435456+Math.round(2147483648*Math.random())}():zi++,"0x"+zi.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xa="RestConnection",zv={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class Kv{get Ye(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Ze=t+"://"+e.host,this.Xe=`projects/${r}/databases/${s}`,this.et=this.databaseId.database===_c?`project_id=${r}`:`project_id=${r}&database_id=${s}`}tt(e,t,r,s,i){const o=Rc(),c=this.nt(e,t.toUriEncodedString());M(Xa,`Sending RPC '${e}' ${o}:`,c,r);const u={"google-cloud-resource-prefix":this.Xe,"x-goog-request-params":this.et};this.rt(u,s,i);const{host:h}=new URL(c),f=Ht(h);return this.it(e,c,u,r,f).then(m=>(M(Xa,`Received RPC '${e}' ${o}: `,m),m),m=>{throw St(Xa,`RPC '${e}' ${o} failed with error: `,m,"url: ",c,"request:",r),m})}st(e,t,r,s,i,o){return this.tt(e,t,r,s,i)}rt(e,t,r){if(e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Wr}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((s,i)=>e[i]=s),r&&r.headers.forEach((s,i)=>e[i]=s),this.databaseInfo._customHeaders)for(const s of Object.keys(this.databaseInfo._customHeaders))e[s]=this.databaseInfo._customHeaders[s]}nt(e,t){const r=zv[e];let s=`${this.Ze}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qv{constructor(e){this._t=e._t,this.ot=e.ot}ut(e){this.ct=e}lt(e){this.Et=e}ht(e){this.Tt=e}onMessage(e){this.Pt=e}close(){this.ot()}send(e){this._t(e)}Rt(){this.ct()}It(){this.Et()}At(e){this.Tt(e)}Vt(e){this.Pt(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fe="WebChannelConnection",Es=(n,e,t)=>{n.listen(e,r=>{try{t(r)}catch(s){setTimeout(()=>{throw s},0)}})};class Or extends Kv{constructor(e){super(e),this.dt=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static ft(){if(!Or.gt){const e=yp();Es(e,_p.STAT_EVENT,t=>{t.stat===mc.PROXY?M(Fe,"STAT_EVENT: detected buffering proxy"):t.stat===mc.NOPROXY&&M(Fe,"STAT_EVENT: detected no buffering proxy")}),Or.gt=!0}}it(e,t,r,s,i){const o=Rc();return new Promise((c,u)=>{const h=new mp;h.setWithCredentials(!0),h.listenOnce(gp.COMPLETE,()=>{try{switch(h.getLastErrorCode()){case to.NO_ERROR:const m=h.getResponseJson();M(Fe,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(m)),c(m);break;case to.TIMEOUT:M(Fe,`RPC '${e}' ${o} timed out`),u(new V(b.DEADLINE_EXCEEDED,"Request time out"));break;case to.HTTP_ERROR:const y=h.getStatus();if(M(Fe,`RPC '${e}' ${o} failed with status:`,y,"response text:",h.getResponseText()),y>0){let S=h.getResponseJson();Array.isArray(S)&&(S=S[0]);const k=S?.error;if(k&&k.status&&k.message){const U=function(W){const K=W.toLowerCase().replace(/_/g,"-");return Object.values(b).indexOf(K)>=0?K:b.UNKNOWN}(k.status);u(new V(U,k.message))}else u(new V(b.UNKNOWN,"Server responded with status "+h.getStatus()))}else u(new V(b.UNAVAILABLE,"Connection failed."));break;default:B(9055,{yt:e,streamId:o,wt:h.getLastErrorCode(),bt:h.getLastError()})}}finally{M(Fe,`RPC '${e}' ${o} completed.`)}});const f=JSON.stringify(s);M(Fe,`RPC '${e}' ${o} sending request:`,s),h.send(t,"POST",f,r,15)})}vt(e,t,r){const s=Rc(),i=[this.Ze,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=this.createWebChannelTransport(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(c.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(c.useFetchStreams=!0),this.rt(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const h=i.join("");M(Fe,`Creating RPC '${e}' stream ${s}: ${h}`,c);const f=o.createWebChannel(h,c);this.St(f);let m=!1,y=!1;const S=new Qv({_t:k=>{y?M(Fe,`Not sending because RPC '${e}' stream ${s} is closed:`,k):(m||(M(Fe,`Opening RPC '${e}' stream ${s} transport.`),f.open(),m=!0),M(Fe,`RPC '${e}' stream ${s} sending:`,k),f.send(k))},ot:()=>f.close()});return Es(f,Rs.EventType.OPEN,()=>{y||(M(Fe,`RPC '${e}' stream ${s} transport opened.`),S.Rt())}),Es(f,Rs.EventType.CLOSE,()=>{y||(y=!0,M(Fe,`RPC '${e}' stream ${s} transport closed`),S.At(),this.Dt(f))}),Es(f,Rs.EventType.ERROR,k=>{y||(y=!0,St(Fe,`RPC '${e}' stream ${s} transport errored. Name:`,k.name,"Message:",k.message),S.At(new V(b.UNAVAILABLE,"The operation could not be completed")))}),Es(f,Rs.EventType.MESSAGE,k=>{if(!y){const U=k.data[0];F(!!U,16349);const O=U,W=O?.error||O[0]?.error;if(W){M(Fe,`RPC '${e}' stream ${s} received error:`,W);const K=W.status;let Q=function(ue){const T=ge[ue];if(T!==void 0)return Qp(T)}(K),re=W.message;K==="NOT_FOUND"&&re.includes("database")&&re.includes("does not exist")&&re.includes(this.databaseId.database)&&St(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),Q===void 0&&(Q=b.INTERNAL,re="Unknown error status: "+K+" with message "+W.message),y=!0,S.At(new V(Q,re)),f.close()}else M(Fe,`RPC '${e}' stream ${s} received:`,U),S.Vt(U)}}),Or.ft(),setTimeout(()=>{S.It()},0),S}terminate(){this.dt.forEach(e=>e.close()),this.dt=[]}St(e){this.dt.push(e)}Dt(e){this.dt=this.dt.filter(t=>t===e)}rt(e,t,r){super.rt(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return wp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yv(n){return new Or(n)}Or.gt=!1;class fu{constructor(e,t,r=1e3,s=1.5,i=6e4){this.xt=e,this.timerId=t,this.Ct=r,this.Ft=s,this.Ot=i,this.Mt=0,this.Nt=null,this.Lt=Date.now(),this.reset()}reset(){this.Mt=0}Bt(){this.Mt=this.Ot}Ut(e){this.cancel();const t=Math.floor(this.Mt+this.kt()),r=Math.max(0,Date.now()-this.Lt),s=Math.max(0,t-r);s>0&&M("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Mt} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.Nt=this.xt.enqueueAfterDelay(this.timerId,s,()=>(this.Lt=Date.now(),e())),this.Mt*=this.Ft,this.Mt<this.Ct&&(this.Mt=this.Ct),this.Mt>this.Ot&&(this.Mt=this.Ot)}qt(){this.Nt!==null&&(this.Nt.skipDelay(),this.Nt=null)}cancel(){this.Nt!==null&&(this.Nt.cancel(),this.Nt=null)}kt(){return(Math.random()-.5)*this.Mt}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ed="PersistentStream";class fm{constructor(e,t,r,s,i,o,c,u){this.xt=e,this.$t=r,this.Kt=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=c,this.listener=u,this.state=0,this.Wt=0,this.Qt=null,this.Gt=null,this.stream=null,this.zt=0,this.jt=new fu(e,t)}Ht(){return this.state===1||this.state===5||this.Jt()}Jt(){return this.state===2||this.state===3}start(){this.zt=0,this.state!==4?this.auth():this.Yt()}async stop(){this.Ht()&&await this.close(0)}Zt(){this.state=0,this.jt.reset()}Xt(){this.Jt()&&this.Qt===null&&(this.Qt=this.xt.enqueueAfterDelay(this.$t,6e4,()=>this.en()))}tn(e){this.nn(),this.stream.send(e)}async en(){if(this.Jt())return this.close(0)}nn(){this.Qt&&(this.Qt.cancel(),this.Qt=null)}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}async close(e,t){this.nn(),this.rn(),this.jt.cancel(),this.Wt++,e!==4?this.jt.reset():t&&t.code===b.RESOURCE_EXHAUSTED?(cn(t.toString()),cn("Using maximum backoff delay to prevent overloading the backend."),this.jt.Bt()):t&&t.code===b.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.sn(),this.stream.close(),this.stream=null),this.state=e,await this.listener.ht(t)}sn(){}auth(){this.state=1;const e=this._n(this.Wt),t=this.Wt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.Wt===t&&this.an(r,s)},r=>{e(()=>{const s=new V(b.UNKNOWN,"Fetching auth token failed: "+r.message);return this.un(s)})})}an(e,t){const r=this._n(this.Wt);this.stream=this.cn(e,t),this.stream.ut(()=>{r(()=>this.listener.ut())}),this.stream.lt(()=>{r(()=>(this.state=2,this.Gt=this.xt.enqueueAfterDelay(this.Kt,1e4,()=>(this.Jt()&&(this.state=3),Promise.resolve())),this.listener.lt()))}),this.stream.ht(s=>{r(()=>this.un(s))}),this.stream.onMessage(s=>{r(()=>++this.zt==1?this.En(s):this.onNext(s))})}Yt(){this.state=5,this.jt.Ut(async()=>{this.state=0,this.start()})}un(e){return M(Ed,`close with error: ${e}`),this.stream=null,this.close(4,e)}_n(e){return t=>{this.xt.enqueueAndForget(()=>this.Wt===e?t():(M(Ed,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class Jv extends fm{constructor(e,t,r,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}cn(e,t){return this.connection.vt("Listen",e,t)}En(e){return this.onNext(e)}onNext(e){this.jt.reset();const t=bv(this.serializer,e),r=function(i){if(!("targetChange"in i))return H.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?H.min():o.readTime?pt(o.readTime):H.min()}(e);return this.listener.hn(t,r)}Tn(e){const t={};t.database=Ac(this.serializer),t.addTarget=function(i,o){let c;const u=o.target;if(c=Qn(u)?{pipelineQuery:Dv(i,u)}:Gp(u)?{documents:kv(i,u)}:{query:Nv(i,u).be},c.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){c.resumeToken=tm(i,o.resumeToken);const h=Tc(i,o.expectedCount);h!==null&&(c.expectedCount=h)}else if(o.snapshotVersion.compareTo(H.min())>0){c.readTime=Ro(i,o.snapshotVersion.toTimestamp());const h=Tc(i,o.expectedCount);h!==null&&(c.expectedCount=h)}return c}(this.serializer,e);const r=Ov(this.serializer,e);r&&(t.labels=r),this.tn(t)}Pn(e){const t={};t.database=Ac(this.serializer),t.removeTarget=e,this.tn(t)}}class Xv extends fm{constructor(e,t,r,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}get Rn(){return this.zt>0}start(){this.lastStreamToken=void 0,super.start()}sn(){this.Rn&&this.In([])}cn(e,t){return this.connection.vt("Write",e,t)}En(e){return F(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,F(!e.writeResults||e.writeResults.length===0,55816),this.listener.An()}onNext(e){F(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.jt.reset();const t=Cv(e.writeResults,e.commitTime),r=pt(e.commitTime);return this.listener.Vn(r,t)}dn(){const e={};e.database=Ac(this.serializer),this.tn(e)}In(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>im(this.serializer,r))};this.tn(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zv{}class eA extends Zv{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.fn=!1}mn(){if(this.fn)throw new V(b.FAILED_PRECONDITION,"The client has already been terminated.")}tt(e,t,r,s){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.tt(e,vc(t,r),s,i,o)).catch(i=>{throw i.name==="FirebaseError"?(i.code===b.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new V(b.UNKNOWN,i.toString())})}st(e,t,r,s,i){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,c])=>this.connection.st(e,vc(t,r),s,o,c,i)).catch(o=>{throw o.name==="FirebaseError"?(o.code===b.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new V(b.UNKNOWN,o.toString())})}terminate(){this.fn=!0,this.connection.terminate()}}function tA(n,e,t,r){return new eA(n,e,t,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nA="ComponentProvider",Id=new Map;function rA(n,e,t,r,s){return new xT(n,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,dm(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,r,s._customHeaders,s.grpcFlowControlWindow)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Td={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},pm=41943040;class et{static withCacheSize(e){return new et(e,et.DEFAULT_COLLECTION_PERCENTILE,et.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}et.DEFAULT_COLLECTION_PERCENTILE=10,et.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,et.DEFAULT=new et(pm,et.DEFAULT_COLLECTION_PERCENTILE,et.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),et.DISABLED=new et(-1,0,0);/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class na{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.pn(r),this.gn=r=>t.writeSequenceNumber(r))}pn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.gn&&this.gn(e),e}}na.yn=-1;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sA="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class iA{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function zr(n){if(n.code!==b.FAILED_PRECONDITION||n.message!==sA)throw n;M("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&B(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new N((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof N?t:N.resolve(t)}catch(t){return N.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):N.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):N.reject(t)}static resolve(e){return new N((t,r)=>{t(e)})}static reject(e){return new N((t,r)=>{r(e)})}static waitFor(e){return new N((t,r)=>{let s=0,i=0,o=!1;e.forEach(c=>{++s,c.next(()=>{++i,o&&i===s&&t()},u=>r(u))}),o=!0,i===s&&t()})}static or(e){let t=N.resolve(!1);for(const r of e)t=t.next(s=>s?N.resolve(s):r());return t}static forEach(e,t){const r=[];return e.forEach((s,i)=>{r.push(t.call(this,s,i))}),this.waitFor(r)}static mapArray(e,t){return new N((r,s)=>{const i=e.length,o=new Array(i);let c=0;for(let u=0;u<i;u++){const h=u;t(e[h]).next(f=>{o[h]=f,++c,c===i&&r(o)},f=>s(f))}})}static doWhile(e,t){return new N((r,s)=>{const i=()=>{e()===!0?t().next(()=>{i()},s):r()};i()})}}function oA(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function Kr(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vd="LruGarbageCollector",mm=1048576;function Ad([n,e],[t,r]){const s=J(n,t);return s===0?J(e,r):s}class aA{constructor(e){this.Jn=e,this.buffer=new Ie(Ad),this.Yn=0}Zn(){return++this.Yn}Xn(e){const t=[e,this.Zn()];if(this.buffer.size<this.Jn)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();Ad(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class cA{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.er=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.tr(6e4)}stop(){this.er&&(this.er.cancel(),this.er=null)}get started(){return this.er!==null}tr(e){M(vd,`Garbage collection scheduled in ${e}ms`),this.er=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.er=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Kr(t)?M(vd,"Ignoring IndexedDB error during garbage collection: ",t):await zr(t)}await this.tr(3e5)})}}class uA{constructor(e,t){this.nr=e,this.params=t}calculateTargetCount(e,t){return this.nr.rr(e).next(r=>Math.floor(t/100*r))}nthSequenceNumber(e,t){if(t===0)return N.resolve(na.yn);const r=new aA(t);return this.nr.forEachTarget(e,s=>r.Xn(s.sequenceNumber)).next(()=>this.nr.ir(e,s=>r.Xn(s))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.nr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.nr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(M("LruGarbageCollector","Garbage collection skipped; disabled"),N.resolve(Td)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(M("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Td):this.sr(e,t))}getCacheSize(e){return this.nr.getCacheSize(e)}sr(e,t){let r,s,i,o,c,u,h;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(m=>(m>this.params.maximumSequenceNumbersToCollect?(M("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),s=this.params.maximumSequenceNumbersToCollect):s=m,o=Date.now(),this.nthSequenceNumber(e,s))).next(m=>(r=m,c=Date.now(),this.removeTargets(e,r,t))).next(m=>(i=m,u=Date.now(),this.removeOrphanedDocuments(e,r))).next(m=>(h=Date.now(),Ir()<=Z.DEBUG&&M("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${s} in `+(c-o)+`ms
	Removed ${i} targets in `+(u-c)+`ms
	Removed ${m} documents in `+(h-u)+`ms
Total Duration: ${h-f}ms`),N.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:m})))}}function lA(n,e){return new uA(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gm="firestore.googleapis.com",Rd=!0;class Pd{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new V(b.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=gm,this.ssl=Rd}else this.host=e.host,this.ssl=e.ssl??Rd;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),e.cacheSizeBytes===void 0)this.cacheSizeBytes=pm;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<mm)throw new V(b.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(OT("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=dm(e.experimentalLongPollingOptions??{}),function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new V(b.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new V(b.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new V(b.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,e.grpcFlowControlWindow!==void 0){if(typeof e.grpcFlowControlWindow!="number"||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new V(b.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&function(r,s){if(r===s)return!0;if(!r||!s)return!1;const i=Object.keys(r),o=Object.keys(s);if(i.length!==o.length)return!1;for(const c of i)if(r[c]!==s[c])return!1;return!0}(this._customHeaders,e._customHeaders)}}let ra=class{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Pd({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new V(b.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new V(b.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Pd(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Bv;switch(r.type){case"firstParty":return new Wv(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new V(b.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=Id.get(t);r&&(M(nA,"Removing Datastore"),Id.delete(t),r.terminate())}(this),Promise.resolve()}};function hA(n,e,t,r={}){n=De(n,ra);const s=Ht(e),i=n._getSettings(),o={...i,emulatorOptions:n._getEmulatorOptions()},c=`${e}:${t}`;s&&ci(`https://${c}`),i.host!==gm&&i.host!==c&&St("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u={...i,host:c,ssl:s,emulatorOptions:r};if(!rn(u,o)&&(n._setSettings(u),r.mockUserToken)){let h,f;if(typeof r.mockUserToken=="string")h=r.mockUserToken,f=Be.MOCK_USER;else{h=mf(r.mockUserToken,n._app?.options.projectId);const m=r.mockUserToken.sub||r.mockUserToken.user_id;if(!m)throw new V(b.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");f=new Be(m)}n._authCredentials=new qv(new hm(h,f))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hn{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new hn(this.firestore,e,this._query)}}class ae{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new An(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new ae(this.firestore,e,this._key)}toJSON(){return{type:ae._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(mi(t,ae._jsonSchema))return new ae(e,r||null,new q(ne.fromString(t.referencePath)))}}ae._jsonSchemaVersion="firestore/documentReference/1.0",ae._jsonSchema={type:Ee("string",ae._jsonSchemaVersion),referencePath:Ee("string")};class An extends hn{constructor(e,t,r){super(e,t,Xo(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new ae(this.firestore,null,new q(e))}withConverter(e){return new An(this.firestore,e,this._path)}}function kk(n,e,...t){if(n=$(n),Tp("collection","path",e),n instanceof ra){const r=ne.fromString(e,...t);return Xh(r),new An(n,null,r)}{if(!(n instanceof ae||n instanceof An))throw new V(b.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ne.fromString(e,...t));return Xh(r),new An(n.firestore,null,r)}}function dA(n,e,...t){if(n=$(n),arguments.length===1&&(e=su.newId()),Tp("doc","path",e),n instanceof ra){const r=ne.fromString(e,...t);return Jh(r),new ae(n,null,new q(r))}{if(!(n instanceof ae||n instanceof An))throw new V(b.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ne.fromString(e,...t));return Jh(r),new ae(n.firestore,n instanceof An?n.converter:null,new q(r))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class st{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}toJSON(){return{type:st._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(mi(e,st._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new st(e.vectorValues);throw new V(b.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}st._jsonSchemaVersion="firestore/vectorValue/1.0",st._jsonSchema={type:Ee("string",st._jsonSchemaVersion),vectorValues:Ee("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fA=/^__.*__$/;class pA{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new Bn(e,this.data,this.fieldMask,t,this.fieldTransforms):new yi(e,this.data,t,this.fieldTransforms)}}class _m{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new Bn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function ym(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw B(40011,{dataSource:n})}}class pu{constructor(e,t,r,s,i,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new pu({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){const t=this.path?.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){const t=this.path?.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Po(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(ym(this.dataSource)&&fA.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class mA{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||ea(e)}createContext(e,t,r,s=!1){return new pu({dataSource:e,methodName:t,targetDoc:r,path:ft.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Qr(n){const e=n._freezeSettings(),t=ea(n._databaseId);return new mA(n._databaseId,!!e.ignoreUndefinedProperties,t)}function sa(n,e,t,r,s,i={}){const o=n.createContext(i.merge||i.mergeFields?2:0,e,t,s);yu("Data must be an object, but it was:",o,r);const c=wm(r,o);let u,h;if(i.merge)u=new ht(o.fieldMask),h=o.fieldTransforms;else if(i.mergeFields){const f=[];for(const m of i.mergeFields){const y=On(e,m,t);if(!o.contains(y))throw new V(b.INVALID_ARGUMENT,`Field '${y}' is specified in your field mask but missing from your input data.`);Tm(f,y)||f.push(y)}u=new ht(f),h=o.fieldTransforms.filter(m=>u.covers(m.field))}else u=null,h=o.fieldTransforms;return new pA(new qe(c),u,h)}class ia extends ta{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof ia}}class mu extends ta{_toFieldTransform(e){return new jT(e.path,new Qs)}isEqual(e){return e instanceof mu}}function gu(n,e,t,r){const s=n.createContext(1,e,t);yu("Data must be an object, but it was:",s,r);const i=[],o=qe.empty();Fn(r,(u,h)=>{const f=Im(e,u,t);h=$(h);const m=s.childContextForFieldPath(f);if(h instanceof ia)i.push(f);else{const y=Vn(h,m);y!=null&&(i.push(f),o.set(f,y))}});const c=new ht(i);return new _m(o,c,s.fieldTransforms)}function _u(n,e,t,r,s,i){const o=n.createContext(1,e,t),c=[On(e,r,t)],u=[s];if(i.length%2!=0)throw new V(b.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let y=0;y<i.length;y+=2)c.push(On(e,i[y])),u.push(i[y+1]);const h=[],f=qe.empty();for(let y=c.length-1;y>=0;--y)if(!Tm(h,c[y])){const S=c[y];let k=u[y];k=$(k);const U=o.childContextForFieldPath(S);if(k instanceof ia)h.push(S);else{const O=Vn(k,U);O!=null&&(h.push(S),f.set(S,O))}}const m=new ht(h);return new _m(f,m,o.fieldTransforms)}function gA(n,e,t,r=!1){return Vn(t,n.createContext(r?4:3,e))}function Vn(n,e,t){if(Em(n=$(n)))return yu("Unsupported field value:",e,n),wm(n,e);if(n instanceof ta)return function(s,i){if(!ym(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const o=s._toFieldTransform(i);o&&i.fieldTransforms.push(o)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return function(s,i){const o=[];let c=0;for(const u of s){let h=Vn(u,i.childContextForArray(c));h==null&&(h={nullValue:"NULL_VALUE"}),o.push(h),c++}return{arrayValue:{values:o}}}(n,e)}return function(s,i,o){if((s=$(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return au(i.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const c=oe.fromDate(s);return{timestampValue:Ro(i.serializer,c)}}if(s instanceof oe){const c=new oe(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:Ro(i.serializer,c)}}if(s instanceof Lt)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof lt)return{bytesValue:tm(i.serializer,s._byteString)};if(s instanceof ae){const c=i.databaseId,u=s.firestore._databaseId;if(!u.isEqual(c))throw i.createError(`Document reference is for database ${u.projectId}/${u.database} but should be for database ${c.projectId}/${c.database}`);return{referenceValue:du(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof st)return function(u,h){const f=u instanceof st?u.toArray():u;return{mapValue:{fields:{[bp]:{stringValue:Cp},[zs]:{arrayValue:{values:f.map(y=>{if(typeof y!="number")throw h.createError("VectorValues must only contain numeric values.");return Qo(h.serializer,y)})}}}}}}(s,i);if(um(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${zo(s)}`)}(n,e)}function wm(n,e){const t={};return Ip(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Fn(n,(r,s)=>{const i=Vn(s,e.childContextForField(r));i!=null&&(t[r]=i)}),{mapValue:{fields:t}}}function Em(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof oe||n instanceof Lt||n instanceof lt||n instanceof ae||n instanceof ta||n instanceof st||um(n))}function yu(n,e,t){if(!Em(t)||!pi(t)){const r=zo(t);throw r==="an object"?e.createError(n+" a custom object"):e.createError(n+" "+r)}}function On(n,e,t){if((e=$(e))instanceof Gr)return e._internalPath;if(typeof e=="string")return Im(n,e);throw Po("Field path arguments must be of type string or ",n,!1,void 0,t)}const _A=new RegExp("[~\\*/\\[\\]]");function Im(n,e,t){if(e.search(_A)>=0)throw Po(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Gr(...e.split("."))._internalPath}catch{throw Po(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Po(n,e,t,r,s){const i=r&&!r.isEmpty(),o=s!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let u="";return(i||o)&&(u+=" (found",i&&(u+=` in field ${r}`),o&&(u+=` in document ${s}`),u+=")"),new V(b.INVALID_ARGUMENT,c+n+u)}function Tm(n,e){return n.some(t=>t.isEqual(e))}function vm(n){return typeof n._readUserData=="function"}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class We{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const r=qe.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const i=this.optionDefinitions[s];if(s in e){const o=e[s];let c;i.nestedOptions&&pi(o)?c={mapValue:{fields:new We(i.nestedOptions).getOptionsProto(t,o)}}:o&&(c=Vn(o,t)??void 0),c&&r.set(ft.fromServerFormat(i.serverName),c)}}return r}getOptionsProto(e,t,r){const s=this._getKnownOptions(t,e);if(r){const i=new Map(VT(r,(o,c)=>[ft.fromServerFormat(c),o!==void 0?Vn(o,e):null]));s.setAll(i)}return s.value.mapValue.fields??{}}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yA(n){return typeof n=="object"&&n!==null&&!!("nullValue"in n&&(n.nullValue===null||n.nullValue==="NULL_VALUE")||"booleanValue"in n&&(n.booleanValue===null||typeof n.booleanValue=="boolean")||"integerValue"in n&&(n.integerValue===null||typeof n.integerValue=="number"||typeof n.integerValue=="string")||"doubleValue"in n&&(n.doubleValue===null||typeof n.doubleValue=="number")||"timestampValue"in n&&(n.timestampValue===null||function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")}(n.timestampValue))||"stringValue"in n&&(n.stringValue===null||typeof n.stringValue=="string")||"bytesValue"in n&&(n.bytesValue===null||n.bytesValue instanceof Uint8Array)||"referenceValue"in n&&(n.referenceValue===null||typeof n.referenceValue=="string")||"geoPointValue"in n&&(n.geoPointValue===null||function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")}(n.geoPointValue))||"arrayValue"in n&&(n.arrayValue===null||function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))}(n.arrayValue))||"mapValue"in n&&(n.mapValue===null||function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!pi(t.fields))}(n.mapValue))||"fieldReferenceValue"in n&&(n.fieldReferenceValue===null||typeof n.fieldReferenceValue=="string")||"functionValue"in n&&(n.functionValue===null||function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))}(n.functionValue))||"pipelineValue"in n&&(n.pipelineValue===null||function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))}(n.pipelineValue)))}function Nk(){return new mu("serverTimestamp")}function wA(n){return new st(n)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function D(n){let e;return n instanceof fr?n:(e=pi(n)?AA(n):n instanceof Array?RA(n):Am(n,void 0),e)}function Za(n){if(n instanceof fr)return n;if(n instanceof st)return ri(n);if(Array.isArray(n))return ri(wA(n));throw new Error("Unsupported value: "+typeof n)}function wu(n){return MT(n)?oo(n):D(n)}class fr{constructor(){this._protoValueType="ProtoValue"}add(e){return new C("add",[this,D(e)],"add")}asBoolean(){if(this instanceof Dn)return this;if(this instanceof Jr)return new Pm(this);if(this instanceof Yr)return new vA(this);if(this instanceof C)return new Rm(this);throw new V("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new C("subtract",[this,D(e)],"subtract")}multiply(e){return new C("multiply",[this,D(e)],"multiply")}divide(e){return new C("divide",[this,D(e)],"divide")}mod(e){return new C("mod",[this,D(e)],"mod")}equal(e){return new C("equal",[this,D(e)],"equal").asBoolean()}notEqual(e){return new C("not_equal",[this,D(e)],"notEqual").asBoolean()}lessThan(e){return new C("less_than",[this,D(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new C("less_than_or_equal",[this,D(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new C("greater_than",[this,D(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new C("greater_than_or_equal",[this,D(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const r=[e,...t].map(s=>D(s));return new C("array_concat",[this,...r],"arrayConcat")}arrayContains(e){return new C("array_contains",[this,D(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new Ss(e.map(D),"arrayContainsAll"):e;return new C("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new Ss(e.map(D),"arrayContainsAny"):e;return new C("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new C("array_reverse",[this])}arrayLength(){return new C("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new Ss(e.map(D),"equalAny"):e;return new C("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new Ss(e.map(D),"notEqualAny"):e;return new C("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new C("exists",[this],"exists").asBoolean()}charLength(){return new C("char_length",[this],"charLength")}like(e){return new C("like",[this,D(e)],"like").asBoolean()}regexContains(e){return new C("regex_contains",[this,D(e)],"regexContains").asBoolean()}regexFind(e){return new C("regex_find",[this,D(e)],"regexFind")}regexFindAll(e){return new C("regex_find_all",[this,D(e)],"regexFindAll")}regexMatch(e){return new C("regex_match",[this,D(e)],"regexMatch").asBoolean()}stringContains(e){return new C("string_contains",[this,D(e)],"stringContains").asBoolean()}startsWith(e){return new C("starts_with",[this,D(e)],"startsWith").asBoolean()}endsWith(e){return new C("ends_with",[this,D(e)],"endsWith").asBoolean()}toLower(){return new C("to_lower",[this],"toLower")}toUpper(){return new C("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(D(e)),new C("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(D(e)),new C("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(D(e)),new C("rtrim",t,"rtrim")}type(){return new C("type",[this])}isType(e){return new C("is_type",[this,ri(e)],"isType").asBoolean()}stringConcat(e,...t){const r=[e,...t].map(D);return new C("string_concat",[this,...r],"stringConcat")}stringIndexOf(e){return new C("string_index_of",[this,D(e)],"stringIndexOf")}stringRepeat(e){return new C("string_repeat",[this,D(e)],"stringRepeat")}stringReplaceAll(e,t){return new C("string_replace_all",[this,D(e),D(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new C("string_replace_one",[this,D(e),D(t)],"stringReplaceOne")}concat(e,...t){const r=[e,...t].map(D);return new C("concat",[this,...r],"concat")}reverse(){return new C("reverse",[this],"reverse")}arrayFilter(e,t){return new C("array_filter",[this,D(e),t],"arrayFilter")}arrayTransform(e,t){return new C("array_transform",[this,D(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,r){return new C("array_transform",[this,D(e),D(t),r],"arrayTransformWithIndex")}arraySlice(e,t){const r=[this,D(e)];return t!==void 0&&r.push(D(t)),new C("array_slice",r,"arraySlice")}arrayFirst(){return new C("array_first",[this],"arrayFirst")}arrayFirstN(e){return new C("array_first_n",[this,D(e)],"arrayFirstN")}arrayLast(){return new C("array_last",[this],"arrayLast")}arrayLastN(e){return new C("array_last_n",[this,D(e)],"arrayLastN")}arrayMaximum(){return new C("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new C("maximum_n",[this,D(e)],"arrayMaximumN")}arrayMinimum(){return new C("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new C("minimum_n",[this,D(e)],"arrayMinimumN")}arrayIndexOf(e){return new C("array_index_of",[this,D(e),D("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new C("array_index_of",[this,D(e),D("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new C("array_index_of_all",[this,D(e)],"arrayIndexOfAll")}byteLength(){return new C("byte_length",[this],"byteLength")}ceil(){return new C("ceil",[this])}floor(){return new C("floor",[this])}abs(){return new C("abs",[this])}exp(){return new C("exp",[this])}mapGet(e){return new C("map_get",[this,ri(e)],"mapGet")}mapSet(e,t,...r){const s=[this,D(e),D(t),...r.map(D)];return new C("map_set",s,"mapSet")}mapKeys(){return new C("map_keys",[this],"mapKeys")}mapValues(){return new C("map_values",[this],"mapValues")}mapEntries(){return new C("map_entries",[this],"mapEntries")}getField(e){return new C("get_field",[this,D(e)],"get_field")}count(){return ut._create("count",[this],"count")}sum(){return ut._create("sum",[this],"sum")}average(){return ut._create("average",[this],"average")}minimum(){return ut._create("minimum",[this],"minimum")}maximum(){return ut._create("maximum",[this],"maximum")}first(){return ut._create("first",[this],"first")}last(){return ut._create("last",[this],"last")}arrayAgg(){return ut._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return ut._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return ut._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const r=[e,...t];return new C("maximum",[this,...r.map(D)],"logicalMaximum")}logicalMinimum(e,...t){const r=[e,...t];return new C("minimum",[this,...r.map(D)],"minimum")}vectorLength(){return new C("vector_length",[this],"vectorLength")}cosineDistance(e){return new C("cosine_distance",[this,Za(e)],"cosineDistance")}dotProduct(e){return new C("dot_product",[this,Za(e)],"dotProduct")}euclideanDistance(e){return new C("euclidean_distance",[this,Za(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new C("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new C("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new C("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new C("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new C("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new C("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new C("timestamp_add",[this,D(e),D(t)],"timestampAdd")}timestampSubtract(e,t){return new C("timestamp_subtract",[this,D(e),D(t)],"timestampSubtract")}timestampDiff(e,t){return new C("timestamp_diff",[this,wu(e),D(t)],"timestampDiff")}timestampExtract(e,t){const r=[this,D(e)];return t&&r.push(D(t)),new C("timestamp_extract",r,"timestampExtract")}documentId(){return new C("document_id",[this],"documentId")}parent(){return new C("parent",[this],"parent")}substring(e,t){const r=D(e);return new C("substring",t===void 0?[this,r]:[this,r,D(t)],"substring")}arrayGet(e){return new C("array_get",[this,D(e)],"arrayGet")}isError(){return new C("is_error",[this],"isError").asBoolean()}ifError(e){const t=new C("if_error",[this,D(e)],"ifError");return e instanceof Dn?t.asBoolean():t}isAbsent(){return new C("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new C("map_remove",[this,D(e)],"mapRemove")}mapMerge(e,...t){const r=D(e),s=t.map(D);return new C("map_merge",[this,r,...s],"mapMerge")}pow(e){return new C("pow",[this,D(e)])}trunc(e){return e===void 0?new C("trunc",[this]):new C("trunc",[this,D(e)],"trunc")}round(e){return e===void 0?new C("round",[this]):new C("round",[this,D(e)],"round")}collectionId(){return new C("collection_id",[this])}length(){return new C("length",[this])}ln(){return new C("ln",[this])}sqrt(){return new C("sqrt",[this])}stringReverse(){return new C("string_reverse",[this])}ifAbsent(e){return new C("if_absent",[this,D(e)],"ifAbsent")}ifNull(e){return new C("if_null",[this,D(e)],"ifNull")}coalesce(e,...t){return new C("coalesce",[this,D(e),...t.map(D)],"coalesce")}join(e){return new C("join",[this,D(e)],"join")}log10(){return new C("log10",[this])}arraySum(){return new C("sum",[this])}split(e){return new C("split",[this,D(e)])}timestampTruncate(e,t){const r=[this,D(e)];return t&&r.push(D(t)),new C("timestamp_trunc",r)}ascending(){return PA(this)}descending(){return SA(this)}as(e){return new IA(this,e,"as")}}class ut{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,r){const s=new ut(e,t);return s._methodName=r,s}as(e){return new EA(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map(t=>t._toProto(e))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach(t=>t._readUserData(e))}}class EA{constructor(e,t,r){this.aggregate=e,this.alias=t,this._methodName=r}_readUserData(e){this.aggregate._readUserData(e)}}class IA{constructor(e,t,r){this.expr=e,this.alias=t,this._methodName=r,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class Ss extends fr{constructor(e,t){super(),this.ur=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.ur.map(t=>t._toProto(e))}}}_readUserData(e){this.ur.forEach(t=>t._readUserData(e))}}class Yr extends fr{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new C("geo_distance",[this,D(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function oo(n){return TA(n,"field")}function TA(n,e){return new Yr(typeof n=="string"?Vt===n?Fv()._internalPath:On("field",n):n._internalPath,e)}class Jr extends fr{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new Jr(e,void 0);return t._protoValue=e,t}_toProto(e){return F(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,yA(this._protoValue)||(this._protoValue=Vn(this.value,e))}}function ri(n,e){return Am(n,"constant")}function Am(n,e){const t=new Jr(n,e);return typeof n=="boolean"?new Pm(t):t}class C extends fr{constructor(e,t,r,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,r!==void 0&&(this._methodName=r),s!==void 0&&(this._options=s)}get _optionsUtil(){return new We({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map(r=>r._toProto(e))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach(t=>t._readUserData(e)),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class Dn extends fr{get _methodName(){return this._expr._methodName}countIf(){return ut._create("count_if",[this],"countIf")}not(){return new C("not",[this],"not").asBoolean()}conditional(e,t){return new C("conditional",[this,e,t],"conditional")}ifError(e){const t=D(e),r=new C("if_error",[this,t],"ifError");return t instanceof Dn?r.asBoolean():r}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class Rm extends Dn{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class Pm extends Dn{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class vA extends Dn{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function AA(n,e){const t=[];for(const r in n)if(Object.prototype.hasOwnProperty.call(n,r)){const s=n[r];t.push(ri(r)),t.push(D(s))}return new C("map",t,"map")}function RA(n){return function(t,r){return new C("array",t.map(s=>D(s)),r)}(n,"array")}function PA(n){return new Sm(wu(n),"ascending","ascending")}function SA(n){return new Sm(wu(n),"descending","descending")}class Sm{constructor(e,t,r){this.expr=e,this.direction=t,this._methodName=r,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:lm(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _t{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class bm extends _t{get _name(){return"add_fields"}get _optionsUtil(){return new We({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[ni(e,this.fields)]}}_readUserData(e){super._readUserData(e),xn(this.fields,e)}}class Cm extends _t{get _name(){return"aggregate"}get _optionsUtil(){return new We({})}constructor(e,t,r){super(r),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[ni(e,this.accumulators),ni(e,this.groups)]}}_readUserData(e){super._readUserData(e),xn(this.groups,e),xn(this.accumulators,e)}}class km extends _t{get _name(){return"distinct"}get _optionsUtil(){return new We({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[ni(e,this.groups)]}}_readUserData(e){super._readUserData(e),xn(this.groups,e)}}class oa extends _t{get _name(){return"collection"}get _optionsUtil(){return new We({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Er=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.Er}]}}_readUserData(e){super._readUserData(e)}}class aa extends _t{get _name(){return"collection_group"}get _optionsUtil(){return new We({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class Eu extends _t{get _name(){return"database"}get _optionsUtil(){return new We({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class Iu extends _t{get _name(){return"documents"}get _optionsUtil(){return new We({})}constructor(e,t){if(super(t),!e||e.length===0)throw new V(b.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const r=e.map(i=>i.startsWith("/")?i:"/"+i),s=new Set(r);if(s.size!==r.length)throw new V(b.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.hr=r,this.Tr=s}_toProto(e){return{...super._toProto(e),args:this.hr.map(t=>({referenceValue:t}))}}_readUserData(e){super._readUserData(e)}}class ca extends _t{get _name(){return"where"}get _optionsUtil(){return new We({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),xn(this.condition,e)}}class ir extends _t{get _name(){return"limit"}get _optionsUtil(){return new We({})}constructor(e,t){F(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[au(e,this.limit)]}}}class Sd extends _t{get _name(){return"offset"}get _optionsUtil(){return new We({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[au(e,this.offset)]}}}class bA extends _t{get _name(){return"select"}get _optionsUtil(){return new We({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[ni(e,this.selections)]}}_readUserData(e){super._readUserData(e),xn(this.selections,e)}}class en extends _t{get _name(){return"sort"}get _optionsUtil(){return new We({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map(t=>t._toProto(e))}}_readUserData(e){super._readUserData(e),xn(this.orderings,e)}}class Tu extends _t{get _name(){return"replace_with"}get _optionsUtil(){return new We({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),lm(Tu.Pr)]}}_readUserData(e){super._readUserData(e),xn(this.map,e)}}Tu.Pr="full_replace";function xn(n,e){return vm(n)?n._readUserData(e):Array.isArray(n)?n.forEach(t=>t._readUserData(e)):n instanceof Map?n.forEach(t=>t._readUserData(e)):Object.values(n).forEach(t=>t._readUserData(e)),n}/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Us{constructor(e,t,r,s){this._db=e,this.userDataReader=t,this._userDataWriter=r,this.stages=s}Ar(e,t){const r=this.userDataReader.createContext(3,e);return vm(t)?t._readUserData(r):Array.isArray(t)?t.forEach(s=>s._readUserData(r)):t.forEach(s=>s._readUserData(r)),t}where(e){const t=this.stages.map(r=>r);return this.Ar("where",e),t.push(new ca(e,{})),new Us(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){const t=this.stages.map(r=>r);return t.push(new ir(e,{})),new Us(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){const r=this.stages.map(s=>s);return"orderings"in e?r.push(new en(this.Ar("sort",e.orderings),{})):r.push(new en(this.Ar("sort",[e,...t]),{})),new Us(this._db,this.userDataReader,this._userDataWriter,r)}Vr(e){return{pipeline:{stages:this.stages.map(t=>t._toProto(e))}}}}// Copyright 2024 Google LLC* @license
class E{constructor(e,t){this.type=e,this.value=t}static dr(){return new E("ERROR",void 0)}static mr(){return new E("UNSET",void 0)}static pr(){return new E("NULL",Ur)}static newValue(e){return dt(e)?new E("NULL",Ur):function(r){return!!r&&"booleanValue"in r}(e)?new E("BOOLEAN",e):Ot(e)?new E("INT",e):Yn(e)?new E("DOUBLE",e):function(r){return!!r&&"timestampValue"in r&&!!r.timestampValue}(e)?new E("TIMESTAMP",e):function(r){return!!r&&"stringValue"in r}(e)?new E("STRING",e):function(r){return!!r&&"bytesValue"in r}(e)?new E("BYTES",e):e.referenceValue?new E("REFERENCE",e):e.geoPointValue?new E("GEO_POINT",e):Fr(e)?new E("ARRAY",e):wo(e)?new E("VECTOR",e):Zn(e)?new E("MAP",e):new E("ERROR",void 0)}gr(){return this.type==="ERROR"||this.type==="UNSET"}yr(){return this.type==="NULL"}}function Ms(n){if(!n.gr())return n.value}function Nm(n){return n instanceof Dn?n._expr:n}function j(n){if((n=Nm(n))instanceof Yr)return new CA(n);if(n instanceof Jr)return new kA(n);if(n instanceof Ss)return new NA(n);if(n instanceof C){if(n.name==="add")return new DA(n);if(n.name==="subtract")return new xA(n);if(n.name==="multiply")return new LA(n);if(n.name==="divide")return new UA(n);if(n.name==="mod")return new MA(n);if(n.name==="and")return new FA(n);if(n.name==="equal")return new JA(n);if(n.name==="not_equal")return new XA(n);if(n.name==="less_than")return new ZA(n);if(n.name==="less_than_or_equal")return new eR(n);if(n.name==="greater_than")return new tR(n);if(n.name==="greater_than_or_equal")return new nR(n);if(n.name==="array_concat")return new rR(n);if(n.name==="array_reverse")return new sR(n);if(n.name==="array_contains")return new iR(n);if(n.name==="array_contains_all")return new oR(n);if(n.name==="array_contains_any")return new aR(n);if(n.name==="array_length")return new cR(n);if(n.name==="array_element")return new uR(n);if(n.name==="equal_any")return new Vm(n);if(n.name==="not_equal_any")return new qA(n);if(n.name==="is_nan")return new $A(n);if(n.name==="is_not_nan")return new jA(n);if(n.name==="is_null")return new WA(n);if(n.name==="is_not_null")return new HA(n);if(n.name==="is_error")return new GA(n);if(n.name==="exists")return new zA(n);if(n.name==="not")return new ua(n);if(n.name==="or")return new BA(n);if(n.name==="xor")return new vu(n);if(n.name==="conditional")return new KA(n);if(n.name==="maximum")return new QA(n);if(n.name==="minimum")return new YA(n);if(n.name==="reverse")return new lR(n);if(n.name==="replace_first")return new hR(n);if(n.name==="replace_all")return new dR(n);if(n.name==="char_length")return new fR(n);if(n.name==="byte_length")return new pR(n);if(n.name==="like")return new mR(n);if(n.name==="regex_contains")return new gR(n);if(n.name==="regex_match")return new _R(n);if(n.name==="string_contains")return new yR(n);if(n.name==="starts_with")return new wR(n);if(n.name==="ends_with")return new ER(n);if(n.name==="to_lower")return new IR(n);if(n.name==="to_upper")return new TR(n);if(n.name==="trim")return new vR(n);if(n.name==="string_concat")return new AR(n);if(n.name==="map_get")return new RR(n);if(n.name==="cosine_distance")return new PR(n);if(n.name==="dot_product")return new SR(n);if(n.name==="euclidean_distance")return new bR(n);if(n.name==="vector_length")return new CR(n);if(n.name==="unix_micros_to_timestamp")return new DR(n);if(n.name==="timestamp_to_unix_micros")return new UR(n);if(n.name==="unix_millis_to_timestamp")return new xR(n);if(n.name==="timestamp_to_unix_millis")return new MR(n);if(n.name==="unix_seconds_to_timestamp")return new LR(n);if(n.name==="timestamp_to_unix_seconds")return new FR(n);if(n.name==="timestamp_add")return new BR(n);if(n.name==="timestamp_subtract")return new qR(n)}throw new Error(`Unknown Expr : ${n}`)}class CA{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===Vt)return E.newValue({referenceValue:ti(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return E.newValue({timestampValue:io(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return E.newValue({timestampValue:io(e.serializer,t.createTime)});const r=t.data.field(this.expr._fieldPath);return r?Ko(r)?E.newValue(function(i,o){if(i.serverTimestampBehavior==="estimate")return{timestampValue:io(i.serializer,H.fromTimestamp(Lr(o)))};if(i.serverTimestampBehavior==="previous"){const c=gi(o);if(c)return c}return{nullValue:"NULL_VALUE"}}(e,r)):E.newValue(r):E.mr()}}class kA{constructor(e){this.expr=e}evaluate(e,t){return E.newValue(this.expr._getValue())}}class NA{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.ur.map(s=>j(s).evaluate(e,t));return r.some(s=>s.gr())?E.dr():E.newValue({arrayValue:{values:r.map(s=>s.value)}})}}function Ue(n){return Yn(n)?Number(n.doubleValue):Number(n.integerValue)}function $t(n){return BigInt(n.integerValue)}const VA=BigInt("0x7fffffffffffffff"),OA=-BigInt("0x8000000000000000");class Ti{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length>=2,24778);const r=j(this.expr.params[0]).evaluate(e,t),s=j(this.expr.params[1]).evaluate(e,t);let i=this.wr(r,s);for(const o of this.expr.params.slice(2)){const c=j(o).evaluate(e,t);i=this.wr(i,c)}return i}wr(e,t){if(e.gr()||t.gr())return E.dr();if(e.yr()||t.yr())return E.pr();const r=e.value,s=t.value;if(!Yn(r)&&!Ot(r)||!Yn(s)&&!Ot(s))return E.dr();if(Yn(r)||Yn(s)){const i=this.br(r,s);return i?E.newValue(i):E.dr()}if(Ot(r)&&Ot(s)){const i=this.vr(r,s);return i===void 0?E.dr():typeof i=="number"?E.newValue({doubleValue:i}):i<OA||i>VA?E.dr():E.newValue({integerValue:`${i}`})}return E.dr()}}function un(n,e){return ve(n)!==ve(e)?"TYPE_MISMATCH":at(n)||at(e)?"NOT_EQ":dt(n)&&dt(e)?"EQ":dt(n)||dt(e)?"NULL":Fr(n)&&Fr(e)?function(r,s){if(r.values?.length!==s.values?.length)return"NOT_EQ";let i=!1;for(let o=0;o<(r.values?.length??0);o++){const c=r.values[o],u=s.values[o];switch(un(c,u)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:B(44609,{Sr:c,Dr:u})}}return i?"NULL":"EQ"}(n.arrayValue,e.arrayValue):wo(n)&&wo(e)||Zn(n)&&Zn(e)?function(r,s){const i=r.fields||{},o=s.fields||{};if(yo(i)!==yo(o))return"NOT_EQ";let c=!1;for(const u in i)if(i.hasOwnProperty(u)){if(o[u]===void 0)return"NOT_EQ";switch(un(i[u],o[u])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":c=!0}}return c?"NULL":"EQ"}(n.mapValue,e.mapValue):function(r,s){return At(r,s,{o:!1,t:!0,i:!0})}(n,e)?"EQ":"NOT_EQ"}class DA extends Ti{vr(e,t){return $t(e)+$t(t)}br(e,t){return{doubleValue:Ue(e)+Ue(t)}}}class xA extends Ti{constructor(e){super(e),this.expr=e}vr(e,t){return $t(e)-$t(t)}br(e,t){return{doubleValue:Ue(e)-Ue(t)}}}class LA extends Ti{constructor(e){super(e),this.expr=e}vr(e,t){return $t(e)*$t(t)}br(e,t){return{doubleValue:Ue(e)*Ue(t)}}}class UA extends Ti{constructor(e){super(e),this.expr=e}vr(e,t){const r=$t(t);if(r!==BigInt(0))return $t(e)/r}br(e,t){const r=Ue(t);return r===0?{doubleValue:Gs(r)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:Ue(e)/r}}}class MA extends Ti{constructor(e){super(e),this.expr=e}vr(e,t){const r=$t(t);if(r!==BigInt(0))return $t(e)%r}br(e,t){const r=Ue(t);if(r!==0)return{doubleValue:Ue(e)%r}}}class FA{constructor(e){this.expr=e}evaluate(e,t){let r=!1,s=!1;for(const i of this.expr.params){const o=j(i).evaluate(e,t);switch(o.type){case"BOOLEAN":if(!o.value?.booleanValue)return E.newValue(Oe);break;case"NULL":s=!0;break;default:r=!0}}return r?E.dr():s?E.pr():E.newValue(it)}}class ua{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,9634);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return E.newValue({booleanValue:!r.value?.booleanValue});case"NULL":return E.pr();default:return E.dr()}}}class BA{constructor(e){this.expr=e}evaluate(e,t){let r=!1,s=!1;for(const i of this.expr.params){const o=j(i).evaluate(e,t);switch(o.type){case"BOOLEAN":if(o.value?.booleanValue)return E.newValue(it);break;case"NULL":s=!0;break;default:r=!0}}return r?E.dr():s?E.pr():E.newValue(Oe)}}class vu{constructor(e){this.expr=e}evaluate(e,t){let r=!1,s=!1;for(const i of this.expr.params){const o=j(i).evaluate(e,t);switch(o.type){case"BOOLEAN":r=vu.xor(r,!!o.value?.booleanValue);break;case"NULL":s=!0;break;default:return E.dr()}}return s?E.pr():E.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class Vm{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===2,55094);let r=!1;const s=j(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":r=!0;break;case"ERROR":case"UNSET":return E.dr()}const i=j(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.dr()}if(r)return E.pr();for(const o of i.value?.arrayValue?.values??[])switch(dt(s.value)&&dt(o)?"EQ":un(s.value,o)){case"EQ":return E.newValue(it);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(44608,{value:s.value,candidate:o})}return r?E.pr():E.newValue(Oe)}}class qA{constructor(e){this.expr=e}evaluate(e,t){return new ua(new C("not",[new C("equal_any",this.expr.params)])).evaluate(e,t)}}class $A{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,23322);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return E.newValue(Oe);case"DOUBLE":return E.newValue({booleanValue:isNaN(Ue(r.value))});case"NULL":return E.pr();default:return E.dr()}}}class jA{constructor(e){this.expr=e}evaluate(e,t){return F(this.expr.params.length===1,50406),new ua(new C("not",[new C("is_nan",this.expr.params)])).evaluate(e,t)}}class WA{constructor(e){this.expr=e}evaluate(e,t){switch(F(this.expr.params.length===1,23123),j(this.expr.params[0]).evaluate(e,t).type){case"NULL":return E.newValue(it);case"UNSET":case"ERROR":return E.dr();default:return E.newValue(Oe)}}}class HA{constructor(e){this.expr=e}evaluate(e,t){return F(this.expr.params.length===1,23167),new ua(new C("not",[new C("is_null",this.expr.params)])).evaluate(e,t)}}class GA{constructor(e){this.expr=e}evaluate(e,t){return F(this.expr.params.length===1,5228),j(this.expr.params[0]).evaluate(e,t).type==="ERROR"?E.newValue(it):E.newValue(Oe)}}class zA{constructor(e){this.expr=e}evaluate(e,t){switch(F(this.expr.params.length===1,6877),j(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return E.dr();case"UNSET":return E.newValue(Oe);default:return E.newValue(it)}}}class KA{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===3,11706);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return r.value?.booleanValue?j(this.expr.params[1]).evaluate(e,t):j(this.expr.params[2]).evaluate(e,t);case"NULL":return j(this.expr.params[2]).evaluate(e,t);default:return E.dr()}}}class QA{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map(i=>j(i).evaluate(e,t));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||ot(i.value,s.value)>0?i:s}return s===void 0?E.pr():s}}class YA{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map(i=>j(i).evaluate(e,t));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||ot(i.value,s.value)<0?i:s}return s===void 0?E.pr():s}}class Xr{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return E.dr()}const s=j(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return E.dr()}return this.Cr(r,s)}}class JA extends Xr{constructor(e){super(e),this.expr=e}Cr(e,t){if(e.yr()&&t.yr())return E.newValue(it);if(e.yr()||t.yr()||at(e.value)||at(t.value)||ve(e.value)!==ve(t.value))return E.newValue(Oe);switch(un(e.value,t.value)){case"EQ":return E.newValue(it);case"NOT_EQ":return E.newValue(Oe);case"NULL":return E.pr();default:B(44615,{left:e,right:t})}}}class XA extends Xr{constructor(e){super(e),this.expr=e}Cr(e,t){switch(un(e.value,t.value)){case"EQ":return E.newValue(Oe);case"NOT_EQ":case"TYPE_MISMATCH":return E.newValue(it);case"NULL":return E.pr();default:B(44614,{left:e,right:t})}}}class ZA extends Xr{constructor(e){super(e),this.expr=e}Cr(e,t){return ve(e.value)!==ve(t.value)||at(e.value)||at(t.value)?E.newValue(Oe):E.newValue({booleanValue:ot(e.value,t.value)<0})}}class eR extends Xr{constructor(e){super(e),this.expr=e}Cr(e,t){return ve(e.value)!==ve(t.value)||at(e.value)||at(t.value)?E.newValue(Oe):un(e.value,t.value)==="EQ"?E.newValue(it):E.newValue({booleanValue:ot(e.value,t.value)<0})}}class tR extends Xr{constructor(e){super(e),this.expr=e}Cr(e,t){return ve(e.value)!==ve(t.value)||at(e.value)||at(t.value)?E.newValue(Oe):E.newValue({booleanValue:ot(e.value,t.value)>0})}}class nR extends Xr{constructor(e){super(e),this.expr=e}Cr(e,t){return ve(e.value)!==ve(t.value)||at(e.value)||at(t.value)?E.newValue(Oe):un(e.value,t.value)==="EQ"?E.newValue(it):E.newValue({booleanValue:ot(e.value,t.value)>0})}}class rR{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class sR{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,216);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return E.pr();case"ARRAY":{const s=r.value.arrayValue?.values??[];return E.newValue({arrayValue:{values:[...s].reverse()}})}default:return E.dr()}}}class iR{constructor(e){this.expr=e}evaluate(e,t){return F(this.expr.params.length===2,52884),new Vm(new C("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class oR{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===2,1392);let r=!1;const s=j(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.dr()}const i=j(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.dr()}if(r)return E.pr();const o=i.value?.arrayValue?.values??[],c=s.value?.arrayValue?.values??[];for(const u of o){let h=!1;r=!1;for(const f of c){switch(dt(u)&&dt(f)?"EQ":un(u,f)){case"EQ":h=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(44613,{value:f,search:u})}if(h)break}if(!h)return E.newValue(Oe)}return E.newValue(it)}}class aR{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===2,2680);let r=!1;const s=j(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.dr()}const i=j(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.dr()}if(r)return E.pr();const o=i.value?.arrayValue?.values??[],c=s.value?.arrayValue?.values??[];for(const u of c)for(const h of o)switch(dt(u)&&dt(h)?"EQ":un(u,h)){case"EQ":return E.newValue(it);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(60403,{value:u,search:h})}return r?E.pr():E.newValue(Oe)}}class cR{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,38605);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return E.pr();case"ARRAY":return E.newValue({integerValue:`${r.value?.arrayValue?.values?.length??0}`});default:return E.dr()}}}class uR{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class lR{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,1508);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return E.pr();case"BYTES":{const s=r.value?.bytesValue;if(typeof s=="string"){const i=Te.fromBase64String(s).toUint8Array();return i.reverse(),E.newValue({bytesValue:Te.fromUint8Array(i).toBase64()})}return E.newValue({bytesValue:new Uint8Array(s).reverse()})}case"STRING":{const s=r.value?.stringValue,i=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(s),o=Array.from(i,c=>c.segment).reverse();return E.newValue({stringValue:o.join("")})}default:return E.dr()}}}class hR{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class dR{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class fR{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,19400);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return E.pr();case"STRING":{const s=function(o){let c=0;for(let u=0;u<o.length;u++){const h=o.codePointAt(u);if(h===void 0)return;if(h<=65535)if(h>=55296&&h<=57343)if(h<=56319){const f=o.codePointAt(u+1);f!==void 0&&f>=56320&&f<=57343?(c+=1,u++):c+=1}else c+=1;else c+=1;else{if(!(h<=1114111))return;c+=1,u++}}return c}(r.value.stringValue);return s===void 0?E.dr():E.newValue({integerValue:s})}default:return E.dr()}}}class pR{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,8486);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BYTES":{const s=r.value?.bytesValue;return typeof s=="string"?E.newValue({integerValue:Te.fromBase64String(s).toUint8Array().length}):E.newValue({integerValue:new Uint8Array(s).length})}case"STRING":{const s=function(o){let c=0;for(let u=0;u<o.length;u++){const h=o.codePointAt(u);if(h===void 0)return;if(h>=55296&&h<=57343){if(!(h<=56319))return;{const f=o.codePointAt(u+1);if(f===void 0||!(f>=56320&&f<=57343))return;c+=4,u++}}else if(h<=127)c+=1;else if(h<=2047)c+=2;else if(h<=65535)c+=3;else{if(!(h<=1114111))return;c+=4,u++}}return c}(r.value?.stringValue);return s===void 0?E.dr():E.newValue({integerValue:s})}case"NULL":return E.pr();default:return E.dr()}}}class Zr{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let r=!1;const s=j(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":r=!0;break;default:return E.dr()}const i=j(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":r=!0;break;default:return E.dr()}return r?E.pr():this.Fr(s.value?.stringValue,i.value?.stringValue)}}class mR extends Zr{Fr(e,t){try{const r=function(o){let c="";for(let u=0;u<o.length;u++){const h=o.charAt(u);switch(h){case"_":c+=".";break;case"%":c+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":c+="\\"+h;break;default:c+=h}}return"^"+c+"$"}(t),s=Fc.compile(r);return E.newValue({booleanValue:s.matches(e)})}catch(r){return St(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${r}`),E.dr()}}}class gR extends Zr{Fr(e,t){try{const r=Fc.compile(t);return E.newValue({booleanValue:r.test(e)})}catch{return St(`Invalid regex pattern found in regex_contains: ${t}, returning error`),E.dr()}}}class _R extends Zr{Fr(e,t){try{return E.newValue({booleanValue:Fc.compile(t).matches(e)})}catch{return St(`Invalid regex pattern found in regex_match: ${t}, returning error`),E.dr()}}}class yR extends Zr{Fr(e,t){return E.newValue({booleanValue:e.includes(t)})}}class wR extends Zr{Fr(e,t){return E.newValue({booleanValue:e.startsWith(t)})}}class ER extends Zr{Fr(e,t){return E.newValue({booleanValue:e.endsWith(t)})}}class IR{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,29079);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return E.newValue({stringValue:r.value?.stringValue?.toLowerCase()});case"NULL":return E.pr();default:return E.dr()}}}class TR{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,60487);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return E.newValue({stringValue:r.value?.stringValue?.toUpperCase()});case"NULL":return E.pr();default:return E.dr()}}}class vR{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,28544);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return E.newValue({stringValue:r.value?.stringValue?.trim()});case"NULL":return E.pr();default:return E.dr()}}}class AR{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map(o=>j(o).evaluate(e,t));let s="",i=!1;for(const o of r)switch(o.type){case"STRING":s+=o.value.stringValue;break;case"NULL":i=!0;break;default:return E.dr()}return i?E.pr():E.newValue({stringValue:s})}}class RR{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===2,4483);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"UNSET":return E.mr();case"MAP":break;default:return E.dr()}const s=j(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return E.dr();const i=r.value?.mapValue?.fields?.[s.value?.stringValue];return i===void 0?E.mr():E.newValue(i)}}class Au{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let r=!1;const s=j(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":r=!0;break;default:return E.dr()}const i=j(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":r=!0;break;default:return E.dr()}if(r)return E.pr();const o=wc(s.value),c=wc(i.value);if(o===void 0||c===void 0||o.values?.length!==c.values?.length)return E.dr();const u=this.Or(o,c);return u===void 0||isNaN(u)?E.dr():E.newValue({doubleValue:u})}}class PR extends Au{Or(e,t){const r=e?.values??[],s=t?.values??[];if(r.length===0)return;let i=0,o=0,c=0;for(let h=0;h<r.length;h++){if(!kn(r[h])||!kn(s[h]))return;const f=Ue(r[h]),m=Ue(s[h]);i+=f*m,o+=f*f,c+=m*m}const u=Math.sqrt(o)*Math.sqrt(c);if(u!==0)return 1-Math.max(-1,Math.min(1,i/u))}}class SR extends Au{Or(e,t){const r=e?.values??[],s=t?.values??[];if(r.length===0)return 0;let i=0;for(let o=0;o<r.length;o++){if(!kn(r[o])||!kn(s[o]))return;i+=Ue(r[o])*Ue(s[o])}return i}}class bR extends Au{Or(e,t){const r=e?.values??[],s=t?.values??[];if(r.length===0)return 0;let i=0;for(let o=0;o<r.length;o++){if(!kn(r[o])||!kn(s[o]))return;const c=Ue(r[o]),u=Ue(s[o]);i+=Math.pow(c-u,2)}return Math.sqrt(i)}}class CR{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,39044);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{const s=wc(r.value);return E.newValue({integerValue:s?.values?.length??0})}case"NULL":return E.pr();default:return E.dr()}}}const si=BigInt(-62135596800),ii=BigInt(253402300799),So=BigInt(1e3),Rn=BigInt(1e6),kR=si*So,NR=ii*So+BigInt(999),VR=si*Rn,OR=ii*Rn+BigInt(999999);function Ru(n){return n>=VR&&n<=OR}function Om(n){return n>=si&&n<=ii}function oi(n,e){const t=BigInt(n);return!(t<si||t>ii)&&!(e<0||e>=1e9)&&(t!==si||e===0)&&!(t===ii&&e>999999999)}function Dm(n,e){return e<0?{seconds:n-1,nanos:e+1e9}:{seconds:n,nanos:e}}function Pu(n){return BigInt(n.seconds)*Rn+BigInt(Math.trunc(n.nanoseconds/1e3))}class Su{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return this.toTimestamp(BigInt(r.value.integerValue));case"NULL":return E.pr();default:return E.dr()}}}class DR extends Su{toTimestamp(e){if(!Ru(e))return E.dr();let t=Number(e/Rn),r=Number(e%Rn*BigInt(1e3));const s=Dm(t,r);return t=s.seconds,r=s.nanos,oi(t,r)?E.newValue({timestampValue:{seconds:t,nanos:r}}):E.dr()}}class xR extends Su{toTimestamp(e){if(!function(o){return o>=kR&&o<=NR}(e))return E.dr();let t=Number(e/So),r=Number(e%So*BigInt(1e6));const s=Dm(t,r);return t=s.seconds,r=s.nanos,oi(t,r)?E.newValue({timestampValue:{seconds:t,nanos:r}}):E.dr()}}class LR extends Su{toTimestamp(e){if(!Om(e))return E.dr();const t=Number(e);return E.newValue({timestampValue:{seconds:t,nanos:0}})}}class bu{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const r=j(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":return E.pr();default:return E.dr()}const s=hu(r.value.timestampValue);return oi(s.seconds,s.nanoseconds)?this.Mr(s):E.dr()}}class UR extends bu{Mr(e){const t=Pu(e);return Ru(t)?E.newValue({integerValue:`${t.toString()}`}):E.dr()}}class MR extends bu{Mr(e){const t=Pu(e),r=t/BigInt(1e3),s=t%BigInt(1e3);return r>BigInt(0)||s===BigInt(0)?E.newValue({integerValue:r.toString()}):E.newValue({integerValue:(r-BigInt(1)).toString()})}}class FR extends bu{Mr(e){const t=BigInt(e.seconds);return Om(t)?E.newValue({integerValue:t.toString()}):E.dr()}}class xm{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let r=!1;const s=j(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":r=!0;break;default:return E.dr()}const i=j(this.expr.params[1]).evaluate(e,t);let o;switch(i.type){case"STRING":if(o=function(K){switch(K){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}}(i.value.stringValue),o===void 0)return E.dr();break;case"NULL":r=!0;break;default:return E.dr()}const c=j(this.expr.params[2]).evaluate(e,t);switch(c.type){case"INT":break;case"NULL":r=!0;break;default:return E.dr()}if(r)return E.pr();const u=BigInt(c.value.integerValue);let h;try{switch(o){case"microsecond":h=u;break;case"millisecond":h=u*BigInt(1e3);break;case"second":h=u*BigInt(1e6);break;case"minute":h=u*BigInt(6e7);break;case"hour":h=u*BigInt(36e8);break;case"day":h=u*BigInt(864e8);break;default:return E.dr()}if(o!=="microsecond"&&u!==BigInt(0)&&h/u!==BigInt(this.Nr(o)))return E.dr()}catch(W){return St(`Error during timestamp arithmetic: ${W}`),E.dr()}const f=hu(s.value.timestampValue);if(!oi(f.seconds,f.nanoseconds))return E.dr();const m=Pu(f),y=this.Lr(m,h);if(!Ru(y))return E.dr();const S=Number(y/Rn),k=y%Rn,U=Number((k<0?k+Rn:k)*BigInt(1e3)),O=k<0?S-1:S;return oi(O,U)?E.newValue({timestampValue:{seconds:O,nanos:U}}):E.dr()}Nr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class BR extends xm{Lr(e,t){return e+t}}class qR extends xm{Lr(e,t){return e-t}}// Copyright 2024 Google LLC* @license
class Ke{constructor(e,t,r){this.serializer=e,this.stages=t,this.listenOptions=r,this.isCorePipeline=!0}getPipelineCollection(){return la(this)}getPipelineCollectionGroup(){return Cu(this)}getPipelineCollectionId(){return $R(this)}getPipelineDocuments(){return Pc(this)}getPipelineFlavor(){return function(t){let r="exact";return t.stages.forEach((s,i)=>{s._name!==km.name&&s._name!==Cm.name||(r="keyless"),s._name===bA.name&&r==="exact"&&(r="augmented"),s._name===bm.name&&i<t.stages.length-1&&r==="exact"&&(r="augmented")}),r}(this)}getPipelineSourceType(){return Pn(this)}}function Pn(n){const e=n.stages[0];return e instanceof oa||e instanceof aa||e instanceof Eu||e instanceof Iu?e._name:"unknown"}function la(n){if(Pn(n)==="collection")return n.stages[0].Er}function Cu(n){if(Pn(n)==="collection_group")return n.stages[0].collectionId}function $R(n){switch(Pn(n)){case"collection":return ne.fromString(la(n)).lastSegment();case"collection_group":return Cu(n);default:return}}function Pc(n){if(Pn(n)==="documents")return n.stages[0].hr}function ai(n){if((n=Nm(n))instanceof Yr)return`fld(${n.fieldName})`;if(n instanceof Jr)return`cst(${function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof ae?`ref(${t.path})`:t instanceof st?`vec(${JSON.stringify(t)})`:JSON.stringify(t)}(n.value)})`;if(n instanceof C)return`fn(${n.name},[${n.params.map(ai).join(",")}])`;if(n.expressionType==="ListOfExpressions")return`list([${n.ur.map(ai).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(n,null,2)}`)}function jR(n){if(n instanceof bm)return`${n._name}(${Ki(n.fields)})`;if(n instanceof Cm){let e=`${n._name}(${Ki(n.accumulators)})`;return n.groups.size>0&&(e+=`grouping(${Ki(n.groups)})`),e}if(n instanceof km)return`${n._name}(${Ki(n.groups)})`;if(n instanceof oa)return`${n._name}(${n.Er})`;if(n instanceof aa)return`${n._name}(${n.collectionId})`;if(n instanceof Eu)return`${n._name}()`;if(n instanceof Iu)return`${n._name}(${n.hr.sort()})`;if(n instanceof ca)return`${n._name}(${ai(n.condition)})`;if(n instanceof ir)return`${n._name}(${n.limit})`;if(n instanceof en)return`${n._name}(${function(t){return t.map(r=>`${ai(r.expr)}${r.direction}`).join(",")}(n.orderings)})`;throw new Error(`Unrecognized stage ${n._name}`)}function Ki(n){return`${Array.from(n.entries()).sort().map(([e,t])=>`${e}=${ai(t)}`).join(",")}`}function nn(n){return n.stages.map(e=>jR(e)).join("|")}function Lm(n,e){return nn(n)===nn(e)}function Re(n){return n instanceof Ke}function bd(n){return Re(n)?nn(n):Ds(n)}function Um(n){return Re(n)?nn(n):function(t){return`${Wp(xt(t))}|lt:${t.limitType}`}(n)}function ha(n,e){return n instanceof Ke&&e instanceof Ke?Lm(n,e):!(n instanceof Ke&&!(e instanceof Ke)||!(n instanceof Ke)&&e instanceof Ke)&&hv(n,e)}function Mm(n){return Qn(n)?nn(n):Wp(n)}function Fm(n,e){return n instanceof Ke&&e instanceof Ke?Lm(n,e):!(n instanceof Ke&&!(e instanceof Ke)||!(n instanceof Ke)&&e instanceof Ke)&&Hp(n,e)}function WR(n,e){const t=function(s){let i=!1;const o=[];for(const c of s)if(c instanceof en)if(i=!0,c.orderings.some(u=>u.expr instanceof Yr&&u.expr.fieldName===Vt))o.push(c);else{const u=c.orderings.map(h=>h);u.push(oo(Vt).ascending()),o.push(new en(u,{}))}else c instanceof ir&&(i||(o.push(new en([oo(Vt).ascending()],{})),i=!0)),o.push(c);return i||o.push(new en([oo(Vt).ascending()],{})),o}(n.stages);if(n.userDataReader){const r=n.userDataReader.createContext(3,"toCorePipeline");t.forEach(s=>s._readUserData(r))}return new Ke(n.userDataReader.serializer,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HR{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&GT(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Vs(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Vs(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=Xp();return this.mutations.forEach(s=>{const i=e.get(s.key),o=i.overlayedDocument;let c=this.applyToLocalView(o,i.mutatedFields);c=t.has(s.key)?null:c;const u=xp(o,c);u!==null&&r.set(s.key,u),o.isValidDocument()||o.convertToNoDocument(H.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),Y())}isEqual(e){return this.batchId===e.batchId&&xr(this.mutations,e.mutations,(t,r)=>id(t,r))&&xr(this.baseMutations,e.baseMutations,(t,r)=>id(t,r))}}class ku{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){F(e.mutations.length===r.length,58842,{Br:e.mutations.length,Ur:r.length});let s=function(){return mv}();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,r[o].version);return new ku(e,t,r,s)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bm="";function GR(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=Cd(e)),e=zR(n.get(t),e);return Cd(e)}function zR(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const i=n.charAt(s);switch(i){case"\0":t+="";break;case Bm:t+="";break;default:t+=i}}return t}function Cd(n){return n+Bm+""}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KR{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tn{constructor(e,t,r,s,i=H.min(),o=H.min(),c=Te.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=c,this.expectedCount=u}withSequenceNumber(e){return new tn(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new tn(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new tn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new tn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class QR{constructor(e){this.qr=e}}function YR(n){const e=Vv({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Ao(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JR{constructor(){this.Yi=new XR}addToCollectionParentIndex(e,t){return this.Yi.add(t),N.resolve()}getCollectionParents(e,t){return N.resolve(this.Yi.getEntries(t))}addFieldIndex(e,t){return N.resolve()}deleteFieldIndex(e,t){return N.resolve()}deleteAllFieldIndexes(e){return N.resolve()}createTargetIndexes(e,t){return N.resolve()}getDocumentsMatchingTarget(e,t){return N.resolve(null)}getIndexType(e,t){return N.resolve(0)}getFieldIndexes(e,t){return N.resolve([])}getNextCollectionGroupToUpdate(e){return N.resolve(null)}getMinOffset(e,t){return N.resolve(Nn.min())}getMinOffsetFromCollectionGroup(e,t){return N.resolve(Nn.min())}updateCollectionGroup(e,t,r){return N.resolve()}updateIndexEntries(e,t){return N.resolve()}}class XR{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new Ie(ne.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new Ie(ne.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ln{constructor(e){this.gs=e}next(){return this.gs+=2,this.gs}static ys(){return new Ln(0)}static ws(){return new Ln(-1)}}// Copyright 2024 Google LLC* @license
function qm(n,e){let t=e;for(const r of n.stages)t=eP({serializer:n.serializer,serverTimestampBehavior:n.listenOptions?.serverTimestampBehavior},r,t);return t}function da(n,e){return qm(n,[e]).length>0}function ZR(n,e){return Re(n)?da(n,e):Zo(n,e)}function eP(n,e,t){if(e instanceof oa)return function(s,i,o){return o.filter(c=>c.isFoundDocument()&&`/${c.key.getCollectionPath().canonicalString()}`===i.Er)}(0,e,t);if(e instanceof ca)return function(s,i,o){return o.filter(c=>{const u=Ms(j(i.condition).evaluate(s,c));return u!==void 0&&At(u,it)})}(n,e,t);if(e instanceof aa)return function(s,i,o){return o.filter(c=>c.isFoundDocument()&&c.key.getCollectionPath().lastSegment()===i.collectionId)}(0,e,t);if(e instanceof Eu)return function(s,i,o){return o.filter(c=>c.isFoundDocument())}(0,0,t);if(e instanceof Iu)return function(s,i,o){return o.filter(c=>c.isFoundDocument()&&i.Tr.has(c.key.path.toStringWithLeadingSlash()))}(0,e,t);if(e instanceof ir)return function(s,i,o){return o.slice(0,i.limit)}(0,e,t);if(e instanceof en)return function(s,i,o){const c=i.orderings.map(u=>({Os:j(u.expr),direction:u.direction}));return[...o].sort((u,h)=>{for(const{Os:f,direction:m}of c){const y=Ms(f.evaluate(s,u)),S=Ms(f.evaluate(s,h)),k=ot(y??Ur,S??Ur);if(k!==0)return m==="ascending"?k:-k}return 0})}(n,e,t);throw new Error(`Unknown stage: ${e._name}`)}function Sc(n){const e=function(r){for(let s=r.stages.length-1;s>=0;s--){const i=r.stages[s];if(i instanceof en)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")}(n);return(t,r)=>{for(const s of e){const i=Ms(j(s.expr).evaluate({serializer:n.serializer},t)),o=Ms(j(s.expr).evaluate({serializer:n.serializer},r)),c=ot(i||Ur,o||Ur);if(c!==0)return s.direction==="ascending"?c:-c}return 0}}function ec(n){for(let e=n.stages.length-1;e>=0;e--){const t=n.stages[e];if(t instanceof ir)return{limit:t.limit}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tP{constructor(){this.changes=new dr(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Ve.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?N.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nP{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rP{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(r!==null&&Vs(r.mutation,s,ht.empty(),oe.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,Y()).next(()=>r))}getLocalViewOfDocuments(e,t,r=Y()){const s=En();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,r).next(i=>{let o=vr();return i.forEach((c,u)=>{o=o.insert(c,u.overlayedDocument)}),o}))}getOverlayedDocuments(e,t){const r=En();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,Y()))}populateOverlays(e,t,r){const s=[];return r.forEach(i=>{t.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((o,c)=>{t.set(o,c)})})}computeViews(e,t,r,s){let i=rt();const o=xs(),c=function(){return xs()}();return t.forEach((u,h)=>{const f=r.get(h.key);s.has(h.key)&&(f===void 0||f.mutation instanceof Bn)?i=i.insert(h.key,h):f!==void 0?(o.set(h.key,f.mutation.getFieldMask()),Vs(f.mutation,h,f.mutation.getFieldMask(),oe.now())):o.set(h.key,ht.empty())}),this.recalculateAndSaveOverlays(e,i).next(u=>(u.forEach((h,f)=>o.set(h,f)),t.forEach((h,f)=>c.set(h,new nP(f,o.get(h)??null))),c))}recalculateAndSaveOverlays(e,t){const r=xs();let s=new le((o,c)=>o-c),i=Y();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(o=>{for(const c of o)c.keys().forEach(u=>{const h=t.get(u);if(h===null)return;let f=r.get(u)||ht.empty();f=c.applyToLocalView(h,f),r.set(u,f);const m=(s.get(c.batchId)||Y()).add(u);s=s.insert(c.batchId,m)})}).next(()=>{const o=[],c=s.getReverseIterator();for(;c.hasNext();){const u=c.getNext(),h=u.key,f=u.value,m=Xp();f.forEach(y=>{if(!i.has(y)){const S=xp(t.get(y),r.get(y));S!==null&&m.set(y,S),i=i.add(y)}}),o.push(this.documentOverlayCache.saveOverlays(e,h,m))}return N.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,s){return Re(t)?this.getDocumentsMatchingPipeline(e,t,r,s):cv(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):zp(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next(i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):N.resolve(En());let c=ei,u=i;return o.next(h=>N.forEach(h,(f,m)=>(c<m.largestBatchId&&(c=m.largestBatchId),i.get(f)?N.resolve():this.remoteDocumentCache.getEntry(e,f).next(y=>{u=u.insert(f,y)}))).next(()=>this.populateOverlays(e,h,i)).next(()=>this.computeViews(e,u,h,Y())).next(f=>({batchId:c,changes:Jp(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new q(t)).next(r=>{let s=vr();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let o=vr();return this.indexManager.getCollectionParents(e,i).next(c=>N.forEach(c,u=>{const h=function(m,y){return new Hr(y,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(t,u.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,r,s).next(f=>{f.forEach((m,y)=>{o=o.insert(m,y)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s))).next(o=>this.retrieveMatchingLocalDocuments(i,o,c=>Zo(t,c)))}getDocumentsMatchingPipeline(e,t,r,s){if(Pn(t)==="collection_group"){const i=Cu(t);let o=vr();return this.indexManager.getCollectionParents(e,i).next(c=>N.forEach(c,u=>{const h=function(m,y){const S=m.stages.map(k=>k instanceof aa?new oa(y.canonicalString(),{}):k);return new Ke(m.serializer,S)}(t,u.child(i));return this.getDocumentsMatchingPipeline(e,h,r,s).next(f=>{f.forEach((m,y)=>{o=o.insert(m,y)})})}).next(()=>o))}{let i;return this.getOverlaysForPipeline(e,t,r.largestBatchId).next(o=>{switch(i=o,Pn(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s);case"documents":let c=Y();for(const u of Pc(t))c=c.add(q.fromPath(u));return this.remoteDocumentCache.getEntries(e,c);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new V("invalid-argument",`Invalid pipeline source to execute offline: ${nn(t)}`)}}).next(o=>this.retrieveMatchingLocalDocuments(i,o,c=>da(t,c)))}}retrieveMatchingLocalDocuments(e,t,r){e.forEach((i,o)=>{const c=o.getKey();t.get(c)===null&&(t=t.insert(c,Ve.newInvalidDocument(c)))});let s=vr();return t.forEach((i,o)=>{const c=e.get(i);c!==void 0&&Vs(c.mutation,o,ht.empty(),oe.now()),r(o)&&(s=s.insert(i,o))}),s}getOverlaysForPipeline(e,t,r){switch(Pn(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,ne.fromString(la(t)),r);case"collection_group":throw new V("invalid-argument",`Unexpected collection group pipeline: ${nn(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,Pc(t).map(s=>q.fromPath(s)));case"database":return this.documentOverlayCache.getAllOverlays(e,r);default:throw new V("invalid-argument",`Failed to get overlays for pipeline: ${nn(t)}`)}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sP{constructor(e){this.serializer=e,this.Ks=new Map,this.Ws=new Map}getBundleMetadata(e,t){return N.resolve(this.Ks.get(t))}saveBundleMetadata(e,t){return this.Ks.set(t.id,function(s){return{id:s.id,version:s.version,createTime:pt(s.createTime)}}(t)),N.resolve()}getNamedQuery(e,t){return N.resolve(this.Ws.get(t))}saveNamedQuery(e,t){return this.Ws.set(t.name,function(s){return{name:s.name,query:YR(s.bundledQuery),readTime:pt(s.readTime)}}(t)),N.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iP{constructor(){this.overlays=new le(q.comparator),this.Qs=new Map}getOverlay(e,t){return N.resolve(this.overlays.get(t))}getOverlays(e,t){const r=En();return N.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}getAllOverlays(e,t){const r=En();return this.overlays.forEach((s,i)=>{i.largestBatchId>t&&r.set(s,i)}),N.resolve(r)}saveOverlays(e,t,r){return r.forEach((s,i)=>{this.Yr(e,t,i)}),N.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Qs.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Qs.delete(r)),N.resolve()}getOverlaysForCollection(e,t,r){const s=En(),i=t.length+1,o=new q(t.child("")),c=this.overlays.getIteratorFrom(o);for(;c.hasNext();){const u=c.getNext().value,h=u.getKey();if(!t.isPrefixOf(h.path))break;h.path.length===i&&u.largestBatchId>r&&s.set(u.getKey(),u)}return N.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new le((h,f)=>h-f);const o=this.overlays.getIterator();for(;o.hasNext();){const h=o.getNext().value;if(h.getKey().getCollectionGroup()===t&&h.largestBatchId>r){let f=i.get(h.largestBatchId);f===null&&(f=En(),i=i.insert(h.largestBatchId,f)),f.set(h.getKey(),h)}}const c=En(),u=i.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((h,f)=>c.set(h,f)),!(c.size()>=s)););return N.resolve(c)}Yr(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const o=this.Qs.get(s.largestBatchId).delete(r.key);this.Qs.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new KR(t,r));let i=this.Qs.get(t);i===void 0&&(i=Y(),this.Qs.set(t,i)),this.Qs.set(t,i.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oP{constructor(){this.sessionToken=Te.EMPTY_BYTE_STRING}getSessionToken(e){return N.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,N.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nu{constructor(){this.Gs=new Ie(Ne.zs),this.js=new Ie(Ne.Hs)}isEmpty(){return this.Gs.isEmpty()}addReference(e,t){const r=new Ne(e,t);this.Gs=this.Gs.add(r),this.js=this.js.add(r)}Js(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Ys(new Ne(e,t))}Zs(e,t){e.forEach(r=>this.removeReference(r,t))}Xs(e){const t=new q(new ne([])),r=new Ne(t,e),s=new Ne(t,e+1),i=[];return this.js.forEachInRange([r,s],o=>{this.Ys(o),i.push(o.key)}),i}e_(){this.Gs.forEach(e=>this.Ys(e))}Ys(e){this.Gs=this.Gs.delete(e),this.js=this.js.delete(e)}t_(e){const t=new q(new ne([])),r=new Ne(t,e),s=new Ne(t,e+1);let i=Y();return this.js.forEachInRange([r,s],o=>{i=i.add(o.key)}),i}containsKey(e){const t=new Ne(e,0),r=this.Gs.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class Ne{constructor(e,t){this.key=e,this.n_=t}static zs(e,t){return q.comparator(e.key,t.key)||J(e.n_,t.n_)}static Hs(e,t){return J(e.n_,t.n_)||q.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aP{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Qr=1,this.r_=new Ie(Ne.zs)}checkEmpty(e){return N.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.Qr;this.Qr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new HR(i,t,r,s);this.mutationQueue.push(o);for(const c of s)this.r_=this.r_.add(new Ne(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return N.resolve(o)}lookupMutationBatch(e,t){return N.resolve(this.i_(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.s_(r),i=s<0?0:s;return N.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return N.resolve(this.mutationQueue.length===0?iu:this.Qr-1)}getAllMutationBatches(e){return N.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new Ne(t,0),s=new Ne(t,Number.POSITIVE_INFINITY),i=[];return this.r_.forEachInRange([r,s],o=>{const c=this.i_(o.n_);i.push(c)}),N.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new Ie(J);return t.forEach(s=>{const i=new Ne(s,0),o=new Ne(s,Number.POSITIVE_INFINITY);this.r_.forEachInRange([i,o],c=>{r=r.add(c.n_)})}),N.resolve(this.__(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;q.isDocumentKey(i)||(i=i.child(""));const o=new Ne(new q(i),0);let c=new Ie(J);return this.r_.forEachWhile(u=>{const h=u.key.path;return!!r.isPrefixOf(h)&&(h.length===s&&(c=c.add(u.n_)),!0)},o),N.resolve(this.__(c))}__(e){const t=[];return e.forEach(r=>{const s=this.i_(r);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){F(this.o_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.r_;return N.forEach(t.mutations,s=>{const i=new Ne(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.r_=r})}jr(e){}containsKey(e,t){const r=new Ne(t,0),s=this.r_.firstAfterOrEqual(r);return N.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,N.resolve()}o_(e,t){return this.s_(e)}s_(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}i_(e){const t=this.s_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cP{constructor(e){this.a_=e,this.docs=function(){return new le(q.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,o=this.a_(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return N.resolve(r?r.document.mutableCopy():Ve.newInvalidDocument(t))}getEntries(e,t){let r=rt();return t.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():Ve.newInvalidDocument(s))}),N.resolve(r)}getAllEntries(e){let t=rt();return this.docs.forEach((r,s)=>{t=t.insert(r,s.document)}),N.resolve(t)}getDocumentsMatchingQuery(e,t,r,s){let i,o;Re(t)?(i=ne.fromString(la(t)),o=f=>da(t,f)):(i=t.path,o=f=>Zo(t,f));let c=rt();const u=new q(i.child("__id-9223372036854775808__")),h=this.docs.getIteratorFrom(u);for(;h.hasNext();){const{key:f,value:{document:m}}=h.getNext();if(!i.isPrefixOf(f.path))break;f.path.length>i.length+1||iv(sv(m),r)<=0||(s.has(m.key)||o(m))&&(c=c.insert(m.key,m.mutableCopy()))}return N.resolve(c)}getAllFromCollectionGroup(e,t,r,s){B(9500)}u_(e,t){return N.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new uP(this)}getSize(e){return N.resolve(this.size)}}class uP extends tP{constructor(e){super(),this.qs=e}applyChanges(e){const t=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?t.push(this.qs.addEntry(e,s)):this.qs.removeEntry(r)}),N.waitFor(t)}getFromCache(e,t){return this.qs.getEntry(e,t)}getAllFromCache(e,t){return this.qs.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lP{constructor(e){this.persistence=e,this.c_=new dr(t=>Mm(t),Fm),this.lastRemoteSnapshotVersion=H.min(),this.highestTargetId=0,this.l_=0,this.E_=new Nu,this.targetCount=0,this.h_=Ln.ys()}forEachTarget(e,t){return this.c_.forEach((r,s)=>t(s)),N.resolve()}getLastRemoteSnapshotVersion(e){return N.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return N.resolve(this.l_)}allocateTargetId(e){return this.highestTargetId=this.h_.next(),N.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.l_&&(this.l_=t),N.resolve()}Ss(e){this.c_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.h_=new Ln(t),this.highestTargetId=t),e.sequenceNumber>this.l_&&(this.l_=e.sequenceNumber)}addTargetData(e,t){return this.Ss(t),this.targetCount+=1,N.resolve()}updateTargetData(e,t){return this.Ss(t),N.resolve()}removeTargetData(e,t){return this.c_.delete(t.target),this.E_.Xs(t.targetId),this.targetCount-=1,N.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.c_.forEach((o,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.c_.delete(o),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)}),N.waitFor(i).next(()=>s)}getTargetCount(e){return N.resolve(this.targetCount)}getTargetData(e,t){const r=this.c_.get(t)||null;return N.resolve(r)}addMatchingKeys(e,t,r){return this.E_.Js(t,r),N.resolve()}removeMatchingKeys(e,t,r){this.E_.Zs(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach(o=>{i.push(s.markPotentiallyOrphaned(e,o))}),N.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.E_.Xs(t),N.resolve()}getMatchingKeysForTargetId(e,t){const r=this.E_.t_(t);return N.resolve(r)}containsKey(e,t){return N.resolve(this.E_.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $m{constructor(e,t){this.T_={},this.overlays={},this.P_=new na(0),this.R_=!1,this.R_=!0,this.I_=new oP,this.referenceDelegate=e(this),this.A_=new lP(this),this.indexManager=new JR,this.remoteDocumentCache=function(s){return new cP(s)}(r=>this.referenceDelegate.V_(r)),this.serializer=new QR(t),this.d_=new sP(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new iP,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.T_[e.toKey()];return r||(r=new aP(t,this.referenceDelegate),this.T_[e.toKey()]=r),r}getGlobalsCache(){return this.I_}getTargetCache(){return this.A_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.d_}runTransaction(e,t,r){M("MemoryPersistence","Starting transaction:",e);const s=new hP(this.P_.next());return this.referenceDelegate.f_(),r(s).next(i=>this.referenceDelegate.m_(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}p_(e,t){return N.or(Object.values(this.T_).map(r=>()=>r.containsKey(e,t)))}}class hP extends iA{constructor(e){super(),this.currentSequenceNumber=e}}class Vu{constructor(e){this.persistence=e,this.g_=new Nu,this.y_=null}static w_(e){return new Vu(e)}get b_(){if(this.y_)return this.y_;throw B(60996)}addReference(e,t,r){return this.g_.addReference(r,t),this.b_.delete(r.toString()),N.resolve()}removeReference(e,t,r){return this.g_.removeReference(r,t),this.b_.add(r.toString()),N.resolve()}markPotentiallyOrphaned(e,t){return this.b_.add(t.toString()),N.resolve()}removeTarget(e,t){this.g_.Xs(t.targetId).forEach(s=>this.b_.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(i=>this.b_.add(i.toString()))}).next(()=>r.removeTargetData(e,t))}f_(){this.y_=new Set}m_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return N.forEach(this.b_,r=>{const s=q.fromPath(r);return this.v_(e,s).next(i=>{i||t.removeEntry(s,H.min())})}).next(()=>(this.y_=null,t.apply(e)))}updateLimboDocument(e,t){return this.v_(e,t).next(r=>{r?this.b_.delete(t.toString()):this.b_.add(t.toString())})}V_(e){return 0}v_(e,t){return N.or([()=>N.resolve(this.g_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.p_(e,t)])}}class bo{constructor(e,t){this.persistence=e,this.S_=new dr(r=>GR(r.path),(r,s)=>r.isEqual(s)),this.garbageCollector=lA(this,t)}static w_(e,t){return new bo(e,t)}f_(){}m_(e){return N.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}rr(e){const t=this.xs(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>t.next(s=>r+s))}xs(e){let t=0;return this.ir(e,r=>{t++}).next(()=>t)}ir(e,t){return N.forEach(this.S_,(r,s)=>this.Fs(e,r,s).next(i=>i?N.resolve():t(s)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.u_(e,o=>this.Fs(e,o,t).next(c=>{c||(r++,i.removeEntry(o,H.min()))})).next(()=>i.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.S_.set(t,e.currentSequenceNumber),N.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.S_.set(r,e.currentSequenceNumber),N.resolve()}removeReference(e,t,r){return this.S_.set(r,e.currentSequenceNumber),N.resolve()}updateLimboDocument(e,t){return this.S_.set(t,e.currentSequenceNumber),N.resolve()}V_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=no(e.data.value)),t}Fs(e,t,r){return N.or([()=>this.persistence.p_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.S_.get(t);return N.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ou{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.Ao=r,this.Vo=s}static fo(e,t){let r=Y(),s=Y();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Ou(e,t.fromCache,r,s)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dP(n,e){return q.comparator(n.key,e.key)}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fP{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pP{constructor(){this.mo=!1,this.po=!1,this.yo=100,this.wo=function(){return Q_()?8:oA(je())>0?6:4}()}initialize(e,t){this.bo=e,this.indexManager=t,this.mo=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.vo(e,t).next(o=>{i.result=o}).next(()=>{if(!i.result)return this.So(e,t,s,r).next(o=>{i.result=o})}).next(()=>{if(i.result)return;const o=new fP;return this.Do(e,t,o).next(c=>{if(i.result=c,this.po)return this.xo(e,t,o,c.size)})}).next(()=>i.result)}xo(e,t,r,s){return Re(t)?N.resolve():r.documentReadCount<this.yo?(Ir()<=Z.DEBUG&&M("QueryEngine","SDK will not create cache indexes for query:",Ds(t),"since it only creates cache indexes for collection contains","more than or equal to",this.yo,"documents"),N.resolve()):(Ir()<=Z.DEBUG&&M("QueryEngine","Query:",Ds(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.wo*s?(Ir()<=Z.DEBUG&&M("QueryEngine","The SDK decides to create cache indexes for query:",Ds(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,xt(t))):N.resolve())}vo(e,t){if(Re(t))return N.resolve(null);let r=t;if(hd(r))return N.resolve(null);let s=xt(r);return this.indexManager.getIndexType(e,s).next(i=>i===0?null:(r.limit!==null&&i===1&&(r=Ao(r,null,"F"),s=xt(r)),this.indexManager.getDocumentsMatchingTarget(e,s).next(o=>{const c=Y(...o);return this.bo.getDocuments(e,c).next(u=>this.indexManager.getMinOffset(e,s).next(h=>{const f=this.Co(r,u);return this.Fo(r,f,c,h.readTime)?this.vo(e,Ao(r,null,"F")):this.Oo(e,f,r,h)}))})))}So(e,t,r,s){return(Re(t)?function(o){for(const c of o.stages){if(c instanceof ir||c instanceof Sd)return!1;if(c instanceof ca){if(c.condition instanceof Rm&&c.condition._expr.name==="exists"&&c.condition._expr.params[0]instanceof Yr&&c.condition._expr.params[0].fieldName===Vt)continue;return!1}}return!0}(t):hd(t))||s.isEqual(H.min())?N.resolve(null):this.bo.getDocuments(e,r).next(i=>{const o=this.Co(t,i);return this.Fo(t,o,r,s)?N.resolve(null):(Ir()<=Z.DEBUG&&M("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),bd(t)),this.Oo(e,o,t,rv(s,ei)).next(c=>c))})}Co(e,t){let r,s;return Re(e)?(r=new Ie(dP),s=i=>da(e,i)):(r=new Ie(uu(e)),s=i=>Zo(e,i)),t.forEach((i,o)=>{s(o)&&(r=r.add(o))}),r}Fo(e,t,r,s){if(Re(e))return function(c){return c.stages.some(u=>u instanceof ir||u instanceof Sd)}(e);if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Do(e,t,r){return Ir()<=Z.DEBUG&&M("QueryEngine","Using full collection scan to execute query:",bd(t)),this.bo.getDocumentsMatchingQuery(e,t,Nn.min(),r)}Oo(e,t,r,s){return this.bo.getDocumentsMatchingQuery(e,r,s).next(i=>(t.forEach(o=>{i=i.insert(o.key,o)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Du="LocalStore",mP=3e8;class gP{constructor(e,t,r,s){this.persistence=e,this.Mo=t,this.serializer=s,this.No=new le(J),this.Lo=new dr(i=>Mm(i),Fm),this.Bo=new Map,this.Uo=e.getRemoteDocumentCache(),this.A_=e.getTargetCache(),this.d_=e.getBundleCache(),this.ko(r)}ko(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new rP(this.Uo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Uo.setIndexManager(this.indexManager),this.Mo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.No))}}function _P(n,e,t,r){return new gP(n,e,t,r)}async function jm(n,e){const t=G(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,t.ko(e),t.mutationQueue.getAllMutationBatches(r))).next(i=>{const o=[],c=[];let u=Y();for(const h of s){o.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}for(const h of i){c.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}return t.localDocuments.getDocuments(r,u).next(h=>({qo:h,removedBatchIds:o,addedBatchIds:c}))})})}function yP(n,e){const t=G(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=t.Uo.newChangeBuffer({trackRemovals:!0});return function(c,u,h,f){const m=h.batch,y=m.keys();let S=N.resolve();return y.forEach(k=>{S=S.next(()=>f.getEntry(u,k)).next(U=>{const O=h.docVersions.get(k);F(O!==null,48541),U.version.compareTo(O)<0&&(m.applyToRemoteDocument(U,h),U.isValidDocument()&&(U.setReadTime(h.commitVersion),f.addEntry(U)))})}),S.next(()=>c.mutationQueue.removeMutationBatch(u,m))}(t,r,e,i).next(()=>i.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(c){let u=Y();for(let h=0;h<c.mutationResults.length;++h)c.mutationResults[h].transformResults.length>0&&(u=u.add(c.batch.mutations[h].key));return u}(e))).next(()=>t.localDocuments.getDocuments(r,s))})}function Wm(n){const e=G(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.A_.getLastRemoteSnapshotVersion(t))}function wP(n,e){const t=G(n),r=e.snapshotVersion;let s=t.No;return t.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const o=t.Uo.newChangeBuffer({trackRemovals:!0});s=t.No;const c=[];e.targetChanges.forEach((f,m)=>{const y=s.get(m);if(!y)return;c.push(t.A_.removeMatchingKeys(i,f.removedDocuments,m).next(()=>t.A_.addMatchingKeys(i,f.addedDocuments,m)));let S=y.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(m)!==null?S=S.withResumeToken(Te.EMPTY_BYTE_STRING,H.min()).withLastLimboFreeSnapshotVersion(H.min()):f.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(f.resumeToken,r)),s=s.insert(m,S),function(U,O,W){return U.resumeToken.approximateByteSize()===0||O.snapshotVersion.toMicroseconds()-U.snapshotVersion.toMicroseconds()>=mP?!0:W.addedDocuments.size+W.modifiedDocuments.size+W.removedDocuments.size>0}(y,S,f)&&c.push(t.A_.updateTargetData(i,S))});let u=rt(),h=Y();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,f))}),c.push(EP(i,o,e.documentUpdates).next(f=>{u=f.$o,h=f.Ko})),!r.isEqual(H.min())){const f=t.A_.getLastRemoteSnapshotVersion(i).next(m=>t.A_.setTargetsMetadata(i,i.currentSequenceNumber,r));c.push(f)}return N.waitFor(c).next(()=>o.apply(i)).next(()=>t.localDocuments.getLocalViewOfDocuments(i,u,h)).next(()=>u)}).then(i=>(t.No=s,i))}function EP(n,e,t){let r=Y(),s=Y();return t.forEach(i=>r=r.add(i)),e.getEntries(n,r).next(i=>{let o=rt();return t.forEach((c,u)=>{const h=i.get(c);u.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(c)),u.isNoDocument()&&u.version.isEqual(H.min())?(e.removeEntry(c,u.readTime),o=o.insert(c,u)):!h.isValidDocument()||u.version.compareTo(h.version)>0||u.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(u),o=o.insert(c,u)):M(Du,"Ignoring outdated watch update for ",c,". Current version:",h.version," Watch version:",u.version)}),{$o:o,Ko:s}})}function IP(n,e){const t=G(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=iu),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function TP(n,e){const t=G(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return t.A_.getTargetData(r,e).next(i=>i?(s=i,N.resolve(s)):t.A_.allocateTargetId(r).next(o=>(s=new tn(e,o,"TargetPurposeListen",r.currentSequenceNumber),t.A_.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=t.No.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.No=t.No.insert(r.targetId,r),t.Lo.set(e,r.targetId)),r})}async function bc(n,e,t){const r=G(n),s=r.No.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,o=>r.persistence.referenceDelegate.removeTarget(o,s))}catch(o){if(!Kr(o))throw o;M(Du,`Failed to update sequence numbers for target ${e}: ${o}`)}r.No=r.No.remove(e),r.Lo.delete(s.target)}function kd(n,e,t){const r=G(n);let s=H.min(),i=Y();return r.persistence.runTransaction("Execute query","readwrite",o=>function(u,h,f){const m=G(u),y=m.Lo.get(f);return y!==void 0?N.resolve(m.No.get(y)):m.A_.getTargetData(h,f)}(r,o,Re(e)?e:xt(e)).next(c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.A_.getMatchingKeysForTargetId(o,c.targetId).next(u=>{i=u})}).next(()=>r.Mo.getDocumentsMatchingQuery(o,e,t?s:H.min(),t?i:Y())).next(c=>(vP(r,c),{documents:c,Wo:i})))}function vP(n,e){e.forEach((t,r)=>{const s=r.key.getCollectionGroup(),i=n.Bo.get(s)||H.min();r.readTime.compareTo(i)>0&&n.Bo.set(s,r.readTime)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AP{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Jo=0,this.Yo=null,this.Zo=!0}Xo(){this.Jo===0&&(this.ea("Unknown"),this.Yo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.Yo=null,this.ta("Backend didn't respond within 10 seconds."),this.ea("Offline"),Promise.resolve())))}na(e){this.state==="Online"?this.ea("Unknown"):(this.Jo++,this.Jo>=1&&(this.ra(),this.ta(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ea("Offline")))}set(e){this.ra(),this.Jo=0,e==="Online"&&(this.Zo=!1),this.ea(e)}ea(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ta(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Zo?(cn(t),this.Zo=!1):M("OnlineStateTracker",t)}ra(){this.Yo!==null&&(this.Yo.cancel(),this.Yo=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jt="RemoteStore";class RP{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.ia=[],this.sa=new Map,this._a=new Map,this.oa=new Map,this.aa=new Ln(1e3),this.ua=new Ln(1001),this.ca=new Set,this.la=[],this.Ea=i,this.Ea.Ke(o=>{r.enqueueAndForget(async()=>{pr(this)&&(M(jt,"Restarting streams for network reachability change."),await async function(u){const h=G(u);h.ca.add(4),await vi(h),h.ha.set("Unknown"),h.ca.delete(4),await fa(h)}(this))})}),this.ha=new AP(r,s)}}async function fa(n){if(pr(n))for(const e of n.la)await e(!0)}async function vi(n){for(const e of n.la)await e(!1)}function Cc(n,e){return n._a.get(e)||void 0}function Hm(n,e){const t=G(n),r=Cc(t,e.targetId);if(r!==void 0&&t.sa.has(r))return;const s=function(c,u){const h=Cc(c,u);h!==void 0&&c.oa.delete(h);const f=function(y,S){return S%2!=0?y.ua.next():y.aa.next()}(c,u);return c._a.set(u,f),c.oa.set(f,u),f}(t,e.targetId);M(jt,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new tn(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t.sa.set(s,i),Mu(t)?Uu(t):es(t).Jt()&&Lu(t,i)}function xu(n,e){const t=G(n),r=es(t),s=Cc(t,e);M(jt,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t.sa.delete(s),t._a.delete(e),t.oa.delete(s),r.Jt()&&Gm(t,s),t.sa.size===0&&(r.Jt()?r.Xt():pr(t)&&t.ha.set("Unknown"))}function Lu(n,e){if(n.Ta.H(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(H.min())>0){const t=n.oa.get(e.targetId);if(t===void 0)return void M(jt,"SDK target ID not found for remote ID: "+e.targetId);const r=n.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(r)}es(n).Tn(e)}function Gm(n,e){n.Ta.H(e),es(n).Pn(e)}function Uu(n){n.Ta=new Iv({getRemoteKeysForTarget:e=>{const t=n.oa.get(e);return t!==void 0?n.remoteSyncer.getRemoteKeysForTarget(t):Y()},ge:e=>n.sa.get(e)||null,Ae:()=>n.datastore.serializer.databaseId}),es(n).start(),n.ha.Xo()}function Mu(n){return pr(n)&&!es(n).Ht()&&n.sa.size>0}function pr(n){return G(n).ca.size===0}function zm(n){n.Ta=void 0}async function PP(n){n.ha.set("Online")}async function SP(n){n.sa.forEach((e,t)=>{Lu(n,e)})}async function bP(n,e){zm(n),Mu(n)?(n.ha.na(e),Uu(n)):n.ha.set("Unknown")}async function CP(n,e,t){if(n.ha.set("Online"),e instanceof em&&e.state===2&&e.cause)try{await async function(s,i){const o=i.cause;for(const c of i.targetIds){if(s.sa.has(c)){const u=s.oa.get(c);u!==void 0&&(await s.remoteSyncer.rejectListen(u,o),s._a.delete(u),s.oa.delete(c)),s.sa.delete(c)}s.Ta.removeTarget(c)}}(n,e)}catch(r){M(jt,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Co(n,r)}else if(e instanceof so?n.Ta.se(e):e instanceof Zp?n.Ta.Ee(e):n.Ta.ae(e),!t.isEqual(H.min()))try{const r=await Wm(n.localStore);t.compareTo(r)>=0&&await function(i,o){const c=i.Ta.de(o);c.targetChanges.forEach((h,f)=>{if(h.resumeToken.approximateByteSize()>0){const m=i.sa.get(f);m&&i.sa.set(f,m.withResumeToken(h.resumeToken,o))}}),c.targetMismatches.forEach((h,f)=>{const m=i.sa.get(h);if(!m)return;i.sa.set(h,m.withResumeToken(Te.EMPTY_BYTE_STRING,m.snapshotVersion)),Gm(i,h);const y=new tn(m.target,h,f,m.sequenceNumber);Lu(i,y)});const u=function(f,m){const y=new Map;m.targetChanges.forEach((k,U)=>{const O=f.oa.get(U);O!==void 0&&y.set(O,k)});let S=new le(J);return m.targetMismatches.forEach((k,U)=>{const O=f.oa.get(k);O!==void 0&&(S=S.insert(O,U))}),new Ei(m.snapshotVersion,y,S,m.documentUpdates,m.augmentedDocumentUpdates,m.resolvedLimboDocuments)}(i,c);return i.remoteSyncer.applyRemoteEvent(u)}(n,t)}catch(r){M(jt,"Failed to raise snapshot:",r),await Co(n,r)}}async function Co(n,e,t){if(!Kr(e))throw e;n.ca.add(1),await vi(n),n.ha.set("Offline"),t||(t=()=>Wm(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{M(jt,"Retrying IndexedDB access"),await t(),n.ca.delete(1),await fa(n)})}function Km(n,e){return e().catch(t=>Co(n,t,e))}async function pa(n){const e=G(n),t=Un(e);let r=e.ia.length>0?e.ia[e.ia.length-1].batchId:iu;for(;kP(e);)try{const s=await IP(e.localStore,r);if(s===null){e.ia.length===0&&t.Xt();break}r=s.batchId,NP(e,s)}catch(s){await Co(e,s)}Qm(e)&&Ym(e)}function kP(n){return pr(n)&&n.ia.length<10}function NP(n,e){n.ia.push(e);const t=Un(n);t.Jt()&&t.Rn&&t.In(e.mutations)}function Qm(n){return pr(n)&&!Un(n).Ht()&&n.ia.length>0}function Ym(n){Un(n).start()}async function VP(n){Un(n).dn()}async function OP(n){const e=Un(n);for(const t of n.ia)e.In(t.mutations)}async function DP(n,e,t){const r=n.ia.shift(),s=ku.from(r,e,t);await Km(n,()=>n.remoteSyncer.applySuccessfulWrite(s)),await pa(n)}async function xP(n,e){e&&Un(n).Rn&&await async function(r,s){if(function(o){return Kp(o)&&o!==b.ABORTED}(s.code)){const i=r.ia.shift();Un(r).Zt(),await Km(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await pa(r)}}(n,e),Qm(n)&&Ym(n)}async function Nd(n,e){const t=G(n);t.asyncQueue.verifyOperationInProgress(),M(jt,"RemoteStore received new credentials");const r=pr(t);t.ca.add(3),await vi(t),r&&t.ha.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.ca.delete(3),await fa(t)}async function LP(n,e){const t=G(n);e?(t.ca.delete(2),await fa(t)):e||(t.ca.add(2),await vi(t),t.ha.set("Unknown"))}function es(n){return n.Pa||(n.Pa=function(t,r,s){const i=G(t);return i.mn(),new Jv(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{ut:PP.bind(null,n),lt:SP.bind(null,n),ht:bP.bind(null,n),hn:CP.bind(null,n)}),n.la.push(async e=>{e?(n.Pa.Zt(),Mu(n)?Uu(n):n.ha.set("Unknown")):(await n.Pa.stop(),zm(n))})),n.Pa}function Un(n){return n.Ra||(n.Ra=function(t,r,s){const i=G(t);return i.mn(),new Xv(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{ut:()=>Promise.resolve(),lt:VP.bind(null,n),ht:xP.bind(null,n),An:OP.bind(null,n),Vn:DP.bind(null,n)}),n.la.push(async e=>{e?(n.Ra.Zt(),await pa(n)):(await n.Ra.stop(),n.ia.length>0&&(M(jt,`Stopping write stream with ${n.ia.length} pending writes`),n.ia=[]))})),n.Ra}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fu{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ia(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ia(this.observer.error,e):cn("Uncaught Error in snapshot listener:",e.toString()))}Aa(){this.muted=!0}Ia(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bu{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Ut,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const o=Date.now()+r,c=new Bu(e,t,o,s,i);return c.start(r),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new V(b.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function qu(n,e){if(cn("AsyncQueue",`${e}: ${n}`),Kr(n))return new V(b.UNAVAILABLE,`${e}: ${n}`);throw n}class Vd{constructor(){this.activeTargetIds=yv()}La(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ba(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Na(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class UP{constructor(){this.du=new Vd,this.fu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.du.La(e),this.fu[e]||"not-current"}updateQueryState(e,t,r){this.fu[e]=t}removeLocalQueryTarget(e){this.du.Ba(e)}isLocalQueryTarget(e){return this.du.activeTargetIds.has(e)}clearQueryState(e){delete this.fu[e]}getAllActiveQueryTargets(){return this.du.activeTargetIds}isActiveQueryTarget(e){return this.du.activeTargetIds.has(e)}start(){return this.du=new Vd,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}function tc(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class er{static emptySet(e){return new er(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||q.comparator(t.key,r.key):(t,r)=>q.comparator(t.key,r.key),this.keyedMap=vr(),this.sortedSet=new le(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof er)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new er;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Od{constructor(){this.mu=new le(q.comparator)}track(e){const t=e.doc.key,r=this.mu.get(t);r?e.type!==0&&r.type===3?this.mu=this.mu.insert(t,e):e.type===3&&r.type!==1?this.mu=this.mu.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.mu=this.mu.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.mu=this.mu.remove(t):e.type===1&&r.type===2?this.mu=this.mu.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):B(63341,{ye:e,pu:r}):this.mu=this.mu.insert(t,e)}gu(){const e=[];return this.mu.inorderTraversal((t,r)=>{e.push(r)}),e}}class Br{constructor(e,t,r,s,i,o,c,u,h){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=c,this.excludesMetadataChanges=u,this.hasCachedResults=h}static fromInitialDocuments(e,t,r,s,i){const o=[];return t.forEach(c=>{o.push({type:0,doc:c})}),new Br(e,t,er.emptySet(t),o,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&ha(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class MP{constructor(){this.yu=void 0,this.wu=[]}bu(){return this.wu.some(e=>e.vu())}}class FP{constructor(){this.queries=Dd(),this.onlineState="Unknown",this.Su=new Set}terminate(){(function(t,r){const s=G(t),i=s.queries;s.queries=Dd(),i.forEach((o,c)=>{for(const u of c.wu)u.onError(r)})})(this,new V(b.ABORTED,"Firestore shutting down"))}}function Dd(){return new dr(n=>Um(n),ha)}async function $u(n,e){const t=G(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.bu()&&e.vu()&&(r=2):(i=new MP,r=e.vu()?0:1);try{switch(r){case 0:i.yu=await t.onListen(s,!0);break;case 1:i.yu=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const c=qu(o,`Initialization of query '${Re(e.query)?nn(e.query):Ds(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,i),i.wu.push(e),e.Du(t.onlineState),i.yu&&e.xu(i.yu)&&Wu(t)}async function ju(n,e){const t=G(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const o=i.wu.indexOf(e);o>=0&&(i.wu.splice(o,1),i.wu.length===0?s=e.vu()?0:1:!i.bu()&&e.vu()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function BP(n,e){const t=G(n);let r=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const c of o.wu)c.xu(s)&&(r=!0);o.yu=s}}r&&Wu(t)}function qP(n,e,t){const r=G(n),s=r.queries.get(e);if(s)for(const i of s.wu)i.onError(t);r.queries.delete(e)}function Wu(n){n.Su.forEach(e=>{e.next()})}var kc;(function(n){n.Default="default",n.Cache="cache"})(kc||(kc={}));class Hu{constructor(e,t,r){this.query=e,this.Cu=t,this.Fu=!1,this.Ou=null,this.onlineState="Unknown",this.options=r||{}}xu(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new Br(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Fu?this.Mu(e)&&(this.Cu.next(e),t=!0):this.Nu(e,this.onlineState)&&(this.Lu(e),t=!0),this.Ou=e,t}onError(e){this.Cu.error(e)}Du(e){this.onlineState=e;let t=!1;return this.Ou&&!this.Fu&&this.Nu(this.Ou,e)&&(this.Lu(this.Ou),t=!0),t}Nu(e,t){if(!e.fromCache||!this.vu())return!0;const r=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Mu(e){if(e.docChanges.length>0)return!0;const t=this.Ou&&this.Ou.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Lu(e){e=Br.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Fu=!0,this.Cu.next(e)}vu(){return this.options.source!==kc.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jm{constructor(e){this.key=e}}class Xm{constructor(e){this.key=e}}class $P{constructor(e,t){this.query=e,this.Gu=t,this.zu=null,this.hasCachedResults=!1,this.current=!1,this.ju=Y(),this.mutatedKeys=Y(),this.Hu=Re(e)?Sc(e):uu(e),this.Ju=new er(this.Hu)}get Yu(){return this.Gu}Zu(e,t){const r=t?t.Xu:new Od,s=t?t.Ju:this.Ju;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,c=!1;const[u,h]=this.ec(this.query,s);e.inorderTraversal((m,y)=>{const S=s.get(m),k=ZR(this.query,y)?y:null,U=!!S&&this.mutatedKeys.has(S.key),O=!!k&&(k.hasLocalMutations||this.mutatedKeys.has(k.key)&&k.hasCommittedMutations);let W=!1;S&&k?S.data.isEqual(k.data)?U!==O&&(r.track({type:3,doc:k}),W=!0):this.tc(S,k)||(r.track({type:2,doc:k}),W=!0,(u&&this.Hu(k,u)>0||h&&this.Hu(k,h)<0)&&(c=!0)):!S&&k?(r.track({type:0,doc:k}),W=!0):S&&!k&&(r.track({type:1,doc:S}),W=!0,(u||h)&&(c=!0)),W&&(k?(o=o.add(k),i=O?i.add(m):i.delete(m)):(o=o.delete(m),i=i.delete(m)))});const f=this.nc(this.query);if(f)if(Re(this.query)){const m=[];o.forEach(k=>m.push(k));const y=qm(this.query,m);let S=new er(Sc(this.query));for(const k of y)S=S.add(k);o.forEach(k=>{S.has(k.key)||(i=i.delete(k.key),r.track({type:1,doc:k}))}),o=S}else{const m=this.rc(this.query);for(;o.size>f;){const y=m==="F"?o.last():o.first();o=o.delete(y.key),i=i.delete(y.key),r.track({type:1,doc:y})}}return{Ju:o,Xu:r,Fo:c,mutatedKeys:i}}nc(e){return Re(e)?ec(e)?.limit:e.limit||void 0}rc(e){if(Re(e)){const t=ec(e);return t&&t.limit<0?"L":"F"}return e.limitType}ec(e,t){if(Re(e)){const r=ec(e)?.limit;return[t.size===r?t.last():null,null]}return[e.limitType==="F"&&t.size===this.nc(this.query)?t.last():null,e.limitType==="L"&&t.size===this.nc(this.query)?t.first():null]}tc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Ju;this.Ju=e.Ju,this.mutatedKeys=e.mutatedKeys;const o=e.Xu.gu();o.sort((f,m)=>function(S,k){const U=O=>{switch(O){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return B(20277,{ye:O})}};return U(S)-U(k)}(f.type,m.type)||this.Hu(f.doc,m.doc)),this.sc(r),s=s??!1;const c=t&&!s?this._c():[],u=this.ju.size===0&&this.current&&!s?1:0,h=u!==this.zu;return this.zu=u,o.length!==0||h?{snapshot:new Br(this.query,e.Ju,i,o,e.mutatedKeys,u===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),oc:c}:{oc:c}}Du(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ju:this.Ju,Xu:new Od,mutatedKeys:this.mutatedKeys,Fo:!1},!1)):{oc:[]}}ac(e){return!this.Gu.has(e)&&!!this.Ju.has(e)&&!this.Ju.get(e).hasLocalMutations}sc(e){e&&(e.addedDocuments.forEach(t=>this.Gu=this.Gu.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Gu=this.Gu.delete(t)),this.current=e.current)}_c(){if(!this.current)return[];const e=this.ju;this.ju=Y(),this.Ju.forEach(r=>{this.ac(r.key)&&(this.ju=this.ju.add(r.key))});const t=[];return e.forEach(r=>{this.ju.has(r)||t.push(new Xm(r))}),this.ju.forEach(r=>{e.has(r)||t.push(new Jm(r))}),t}uc(e){this.Gu=e.Wo,this.ju=Y();const t=this.Zu(e.documents);return this.applyChanges(t,!0)}cc(){return Br.fromInitialDocuments(this.query,this.Ju,this.mutatedKeys,this.zu===0,this.hasCachedResults)}}const Gu="SyncEngine";class jP{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class WP{constructor(e){this.key=e,this.lc=!1}}class HP{constructor(e,t,r,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Ec={},this.hc=new dr(c=>Um(c),ha),this.Tc=new Map,this.Pc=new Set,this.Rc=new le(q.comparator),this.Ic=new Map,this.Ac=new Nu,this.Vc={},this.dc=new Map,this.fc=Ln.ws(),this.onlineState="Unknown",this.mc=void 0}get isPrimaryClient(){return this.mc===!0}}async function GP(n,e,t=!0){const r=sg(n);let s;const i=r.hc.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.cc()):s=await Zm(r,e,t,!0),s}async function zP(n,e){const t=sg(n);await Zm(t,e,!0,!1)}async function Zm(n,e,t,r){const s=await TP(n.localStore,Re(e)?e:xt(e)),i=s.targetId,o=n.sharedClientState.addLocalQueryTarget(i,t);let c;return r&&(c=await KP(n,e,i,o==="current",s.resumeToken)),n.isPrimaryClient&&t&&Hm(n.remoteStore,s),c}async function KP(n,e,t,r,s){n.gc=(m,y,S)=>async function(U,O,W,K){let Q=O.view.Zu(W);Q.Fo&&(Q=await kd(U.localStore,O.query,!1).then(({documents:T})=>O.view.Zu(T,Q)));const re=K&&K.targetChanges.get(O.targetId),Ce=K&&K.targetMismatches.get(O.targetId)!=null,ue=O.view.applyChanges(Q,U.isPrimaryClient,re,Ce);return Ld(U,O.targetId,ue.oc),ue.snapshot}(n,m,y,S);const i=await kd(n.localStore,e,!0),o=new $P(e,i.Wo),c=o.Zu(i.documents),u=Ii.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),h=o.applyChanges(c,n.isPrimaryClient,u);Ld(n,t,h.oc);const f=new jP(e,t,o);return n.hc.set(e,f),n.Tc.has(t)?n.Tc.get(t).push(e):n.Tc.set(t,[e]),h.snapshot}async function QP(n,e,t){const r=G(n),s=r.hc.get(e),i=r.Tc.get(s.targetId);if(i.length>1)return r.Tc.set(s.targetId,i.filter(o=>!ha(o,e))),void r.hc.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await bc(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),t&&xu(r.remoteStore,s.targetId),Nc(r,s.targetId)}).catch(zr)):(Nc(r,s.targetId),await bc(r.localStore,s.targetId,!0))}async function YP(n,e){const t=G(n),r=t.hc.get(e),s=t.Tc.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),xu(t.remoteStore,r.targetId))}async function JP(n,e,t){const r=sS(n);try{const s=await function(o,c){const u=G(o),h=oe.now(),f=c.reduce((S,k)=>S.add(k.key),Y());let m,y;return u.persistence.runTransaction("Locally write mutations","readwrite",S=>{let k=rt(),U=Y();return u.Uo.getEntries(S,f).next(O=>{k=O,k.forEach((W,K)=>{K.isValidDocument()||(U=U.add(W))})}).next(()=>u.localDocuments.getOverlayedDocuments(S,k)).next(O=>{m=O;const W=[];for(const K of c){const Q=zT(K,m.get(K.key).overlayedDocument);Q!=null&&W.push(new Bn(K.key,Q,kp(Q.value.mapValue),ye.exists(!0)))}return u.mutationQueue.addMutationBatch(S,h,W,c)}).next(O=>{y=O;const W=O.applyToLocalDocumentSet(m,U);return u.documentOverlayCache.saveOverlays(S,O.batchId,W)})}).then(()=>({batchId:y.batchId,changes:Jp(m)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(o,c,u){let h=o.Vc[o.currentUser.toKey()];h||(h=new le(J)),h=h.insert(c,u),o.Vc[o.currentUser.toKey()]=h}(r,s.batchId,t),await Ai(r,s.changes),await pa(r.remoteStore)}catch(s){const i=qu(s,"Failed to persist write");t.reject(i)}}async function eg(n,e){const t=G(n);try{const r=await wP(t.localStore,e);e.targetChanges.forEach((s,i)=>{const o=t.Ic.get(i);o&&(F(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.lc=!0:s.modifiedDocuments.size>0?F(o.lc,14607):s.removedDocuments.size>0&&(F(o.lc,42227),o.lc=!1))}),await Ai(t,r,e)}catch(r){await zr(r)}}function xd(n,e,t){const r=G(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.hc.forEach((i,o)=>{const c=o.view.Du(e);c.snapshot&&s.push(c.snapshot)}),function(o,c){const u=G(o);u.onlineState=c;let h=!1;u.queries.forEach((f,m)=>{for(const y of m.wu)y.Du(c)&&(h=!0)}),h&&Wu(u)}(r.eventManager,e),s.length&&r.Ec.hn(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function XP(n,e,t){const r=G(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Ic.get(e),i=s&&s.key;if(i){let o=new le(q.comparator);o=o.insert(i,Ve.newNoDocument(i,H.min()));const c=Y().add(i),u=new Ei(H.min(),new Map,new le(J),o,rt(),c);await eg(r,u),r.Rc=r.Rc.remove(i),r.Ic.delete(e),zu(r)}else await bc(r.localStore,e,!1).then(()=>Nc(r,e,t)).catch(zr)}async function ZP(n,e){const t=G(n),r=e.batch.batchId;try{const s=await yP(t.localStore,e);ng(t,r,null),tg(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Ai(t,s)}catch(s){await zr(s)}}async function eS(n,e,t){const r=G(n);try{const s=await function(o,c){const u=G(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let f;return u.mutationQueue.lookupMutationBatch(h,c).next(m=>(F(m!==null,37113),f=m.keys(),u.mutationQueue.removeMutationBatch(h,m))).next(()=>u.mutationQueue.performConsistencyCheck(h)).next(()=>u.documentOverlayCache.removeOverlaysForBatchId(h,f,c)).next(()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,f)).next(()=>u.localDocuments.getDocuments(h,f))})}(r.localStore,e);ng(r,e,t),tg(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Ai(r,s)}catch(s){await zr(s)}}function tg(n,e){(n.dc.get(e)||[]).forEach(t=>{t.resolve()}),n.dc.delete(e)}function ng(n,e,t){const r=G(n);let s=r.Vc[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.Vc[r.currentUser.toKey()]=s}}function Nc(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Tc.get(e))n.hc.delete(r),t&&n.Ec.yc(r,t);n.Tc.delete(e),n.isPrimaryClient&&n.Ac.Xs(e).forEach(r=>{n.Ac.containsKey(r)||rg(n,r)})}function rg(n,e){n.Pc.delete(e.path.canonicalString());const t=n.Rc.get(e);t!==null&&(xu(n.remoteStore,t),n.Rc=n.Rc.remove(e),n.Ic.delete(t),zu(n))}function Ld(n,e,t){for(const r of t)r instanceof Jm?(n.Ac.addReference(r.key,e),tS(n,r)):r instanceof Xm?(M(Gu,"Document no longer in limbo: "+r.key),n.Ac.removeReference(r.key,e),n.Ac.containsKey(r.key)||rg(n,r.key)):B(19791,{wc:r})}function tS(n,e){const t=e.key,r=t.path.canonicalString();n.Rc.get(t)||n.Pc.has(r)||(M(Gu,"New document in limbo: "+t),n.Pc.add(r),zu(n))}function zu(n){for(;n.Pc.size>0&&n.Rc.size<n.maxConcurrentLimboResolutions;){const e=n.Pc.values().next().value;n.Pc.delete(e);const t=new q(ne.fromString(e)),r=n.fc.next();n.Ic.set(r,new WP(t)),n.Rc=n.Rc.insert(t,r),Hm(n.remoteStore,new tn(xt(Xo(t.path)),r,"TargetPurposeLimboResolution",na.yn))}}async function Ai(n,e,t){const r=G(n),s=[],i=[],o=[];r.hc.isEmpty()||(r.hc.forEach((c,u)=>{o.push(r.gc(u,e,t).then(h=>{if((h||t)&&r.isPrimaryClient){const f=h?!h.fromCache:t?.targetChanges.get(u.targetId)?.current;r.sharedClientState.updateQueryState(u.targetId,f?"current":"not-current")}if(h){s.push(h);const f=Ou.fo(u.targetId,h);i.push(f)}}))}),await Promise.all(o),r.Ec.hn(s),await async function(u,h){const f=G(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>N.forEach(h,y=>N.forEach(y.Ao,S=>f.persistence.referenceDelegate.addReference(m,y.targetId,S)).next(()=>N.forEach(y.Vo,S=>f.persistence.referenceDelegate.removeReference(m,y.targetId,S)))))}catch(m){if(!Kr(m))throw m;M(Du,"Failed to update sequence numbers: "+m)}for(const m of h){const y=m.targetId;if(!m.fromCache){const S=f.No.get(y),k=S.snapshotVersion,U=S.withLastLimboFreeSnapshotVersion(k);f.No=f.No.insert(y,U)}}}(r.localStore,i))}async function nS(n,e){const t=G(n);if(!t.currentUser.isEqual(e)){M(Gu,"User change. New user:",e.toKey());const r=await jm(t.localStore,e);t.currentUser=e,function(i,o){i.dc.forEach(c=>{c.forEach(u=>{u.reject(new V(b.CANCELLED,o))})}),i.dc.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Ai(t,r.qo)}}function rS(n,e){const t=G(n),r=t.Ic.get(e);if(r&&r.lc)return Y().add(r.key);{let s=Y();const i=t.Tc.get(e);if(!i)return s;for(const o of i??[]){const c=t.hc.get(o);s=s.unionWith(c.view.Yu)}return s}}function sg(n){const e=G(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=eg.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=rS.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=XP.bind(null,e),e.Ec.hn=BP.bind(null,e.eventManager),e.Ec.yc=qP.bind(null,e.eventManager),e}function sS(n){const e=G(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=ZP.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=eS.bind(null,e),e}class ko{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=ea(e.databaseInfo.databaseId),this.sharedClientState=this.vc(e),this.persistence=this.Sc(e),await this.persistence.start(),this.localStore=this.Dc(e),this.gcScheduler=this.xc(e,this.localStore),this.indexBackfillerScheduler=this.Cc(e,this.localStore)}xc(e,t){return null}Cc(e,t){return null}Dc(e){return _P(this.persistence,new pP,e.initialUser,this.serializer)}Sc(e){return new $m(Vu.w_,this.serializer)}vc(e){return new UP}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}ko.provider={build:()=>new ko};class iS extends ko{constructor(e){super(),this.cacheSizeBytes=e}xc(e,t){F(this.persistence.referenceDelegate instanceof bo,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new cA(r,e.asyncQueue,t)}Sc(e){const t=this.cacheSizeBytes!==void 0?et.withCacheSize(this.cacheSizeBytes):et.DEFAULT;return new $m(r=>bo.w_(r,t),this.serializer)}}class Vc{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>xd(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=nS.bind(null,this.syncEngine),await LP(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new FP}()}createDatastore(e){const t=ea(e.databaseInfo.databaseId),r=Yv(e.databaseInfo);return tA(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,s,i,o,c){return new RP(r,s,i,o,c)}(this.localStore,this.datastore,e.asyncQueue,t=>xd(this.syncEngine,t,0),function(){return wd.Je()?new wd:new Gv}())}createSyncEngine(e,t){return function(s,i,o,c,u,h,f){const m=new HP(s,i,o,c,u,h);return f&&(m.mc=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){await async function(t){const r=G(t);M(jt,"RemoteStore shutting down."),r.ca.add(5),await vi(r),r.Ea.shutdown(),r.ha.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}}Vc.provider={build:()=>new Vc};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let oS=class{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new V(b.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await async function(s,i){const o=G(s),c={documents:i.map(m=>ti(o.serializer,m))},u=await o.st("BatchGetDocuments",o.serializer.databaseId,ne.emptyPath(),c,i.length),h=new Map;u.forEach(m=>{const y=Sv(o.serializer,m);h.set(y.key.toString(),y)});const f=[];return i.forEach(m=>{const y=h.get(m.toString());F(!!y,55234,{key:m}),f.push(y)}),f}(this.datastore,e);return t.forEach(r=>this.recordVersion(r)),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(r){this.lastTransactionError=r}this.writtenDocs.add(e.toString())}delete(e){this.write(new wi(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach(t=>{e.delete(t.key.toString())}),e.forEach((t,r)=>{const s=q.fromPath(r);this.mutations.push(new Up(s,this.precondition(s)))}),await async function(r,s){const i=G(r),o={writes:s.map(c=>im(i.serializer,c))};await i.tt("Commit",i.serializer.databaseId,ne.emptyPath(),o)}(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw B(50498,{Oc:e.constructor.name});t=H.min()}const r=this.readVersions.get(e.key.toString());if(r){if(!t.isEqual(r))throw new V(b.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(H.min())?ye.exists(!1):ye.updateTime(t):ye.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(H.min()))throw new V(b.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return ye.updateTime(t)}return ye.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aS{constructor(e,t,r,s,i){this.asyncQueue=e,this.datastore=t,this.options=r,this.updateFunction=s,this.deferred=i,this.Mc=r.maxAttempts,this.jt=new fu(this.asyncQueue,"transaction_retry")}Nc(){this.Mc-=1,this.Lc()}Lc(){this.jt.Ut(async()=>{const e=new oS(this.datastore),t=this.Bc(e);t&&t.then(r=>{this.asyncQueue.enqueueAndForget(()=>e.commit().then(()=>{this.deferred.resolve(r)}).catch(s=>{this.Uc(s)}))}).catch(r=>{this.Uc(r)})})}Bc(e){try{const t=this.updateFunction(e);return!_i(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}Uc(e){this.Mc>0&&this.kc(e)?(this.Mc-=1,this.asyncQueue.enqueueAndForget(()=>(this.Lc(),Promise.resolve()))):this.deferred.reject(e)}kc(e){if(e?.name==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!Kp(t)}return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mn="FirestoreClient";class cS{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=s,this.user=Be.UNAUTHENTICATED,this.clientId=su.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async o=>{M(Mn,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(M(Mn,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Ut;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=qu(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function nc(n,e){n.asyncQueue.verifyOperationInProgress(),M(Mn,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async s=>{r.isEqual(s)||(await jm(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function Ud(n,e){n.asyncQueue.verifyOperationInProgress();const t=await uS(n);M(Mn,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>Nd(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,s)=>Nd(e.remoteStore,s)),n._onlineComponents=e}async function uS(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){M(Mn,"Using user provided OfflineComponentProvider");try{await nc(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===b.FAILED_PRECONDITION||s.code===b.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;St("Error using user provided cache. Falling back to memory cache: "+t),await nc(n,new ko)}}else M(Mn,"Using default OfflineComponentProvider"),await nc(n,new iS(void 0));return n._offlineComponents}async function Ku(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(M(Mn,"Using user provided OnlineComponentProvider"),await Ud(n,n._uninitializedComponentsProvider._online)):(M(Mn,"Using default OnlineComponentProvider"),await Ud(n,new Vc))),n._onlineComponents}function lS(n){return Ku(n).then(e=>e.syncEngine)}function hS(n){return Ku(n).then(e=>e.datastore)}async function No(n){const e=await Ku(n),t=e.eventManager;return t.onListen=GP.bind(null,e.syncEngine),t.onUnlisten=QP.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=zP.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=YP.bind(null,e.syncEngine),t}function dS(n,e,t,r){const s=new Fu(r),i=new Hu(e,s,t);return n.asyncQueue.enqueueAndForget(async()=>$u(await No(n),i)),()=>{s.Aa(),n.asyncQueue.enqueueAndForget(async()=>ju(await No(n),i))}}function ig(n,e,t={}){const r=new Ut;return n.asyncQueue.enqueueAndForget(async()=>function(i,o,c,u,h){const f=new Fu({next:y=>{f.Aa(),o.enqueueAndForget(()=>ju(i,m));const S=y.docs.has(c);!S&&y.fromCache?h.reject(new V(b.UNAVAILABLE,"Failed to get document because the client is offline.")):S&&y.fromCache&&u&&u.source==="server"?h.reject(new V(b.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):h.resolve(y)},error:y=>h.reject(y)}),m=new Hu(Xo(c.path),f,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return $u(i,m)}(await No(n),n.asyncQueue,e,t,r)),r.promise}function fS(n,e,t={}){const r=new Ut;return n.asyncQueue.enqueueAndForget(async()=>function(i,o,c,u,h){const f=new Fu({next:y=>{f.Aa(),o.enqueueAndForget(()=>ju(i,m)),y.fromCache&&u.source==="server"?h.reject(new V(b.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(y)},error:y=>h.reject(y)}),m=new Hu(c instanceof Us?WR(c):c,f,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return $u(i,m)}(await No(n),n.asyncQueue,e,t,r)),r.promise}function pS(n,e){const t=new Ut;return n.asyncQueue.enqueueAndForget(async()=>JP(await lS(n),e,t)),t.promise}function mS(n,e,t){const r=new Ut;return n.asyncQueue.enqueueAndForget(async()=>{const s=await hS(n);new aS(n.asyncQueue,s,t,e,r).Nc()}),r.promise}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Md="AsyncQueue";class Fd{constructor(e=Promise.resolve()){this.Wc=[],this.Qc=!1,this.Gc=[],this.zc=null,this.jc=!1,this.Hc=!1,this.Jc=[],this.jt=new fu(this,"async_queue_retry"),this.Yc=()=>{const r=tc();r&&M(Md,"Visibility state changed to "+r.visibilityState),this.jt.qt()},this.Zc=e;const t=tc();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Yc)}get isShuttingDown(){return this.Qc}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Xc(),this.el(e)}enterRestrictedMode(e){if(!this.Qc){this.Qc=!0,this.Hc=e||!1;const t=tc();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Yc)}}enqueue(e){if(this.Xc(),this.Qc)return new Promise(()=>{});const t=new Ut;return this.el(()=>this.Qc&&this.Hc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Wc.push(e),this.tl()))}async tl(){if(this.Wc.length!==0){try{await this.Wc[0](),this.Wc.shift(),this.jt.reset()}catch(e){if(!Kr(e))throw e;M(Md,"Operation failed with retryable error: "+e)}this.Wc.length>0&&this.jt.Ut(()=>this.tl())}}el(e){const t=this.Zc.then(()=>(this.jc=!0,e().catch(r=>{throw this.zc=r,this.jc=!1,cn("INTERNAL UNHANDLED ERROR: ",Bd(r)),r}).then(r=>(this.jc=!1,r))));return this.Zc=t,t}enqueueAfterDelay(e,t,r){this.Xc(),this.Jc.indexOf(e)>-1&&(t=0);const s=Bu.createAndSchedule(this,e,t,r,i=>this.nl(i));return this.Gc.push(s),s}Xc(){this.zc&&B(47125,{rl:Bd(this.zc)})}verifyOperationInProgress(){}async il(){let e;do e=this.Zc,await e;while(e!==this.Zc)}sl(e){for(const t of this.Gc)if(t.timerId===e)return!0;return!1}_l(e){return this.il().then(()=>{this.Gc.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.Gc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.il()})}ol(e){this.Jc.push(e)}nl(e){const t=this.Gc.indexOf(e);this.Gc.splice(t,1)}}function Bd(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class Rt extends ra{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new Fd,this._persistenceKey=s?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Fd(e),this._firestoreClient=void 0,await e}}}function Ok(n,e,t){const r=Gt(n,"firestore");if(r.isInitialized(t)){const s=r.getImmediate({identifier:t}),i=r.getOptions(t);if(rn(i,e))return s;throw new V(b.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new V(b.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<mm)throw new V(b.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&Ht(e.host)&&ci(e.host),r.initialize({options:e,instanceIdentifier:t})}function Dk(n,e){const t=typeof n=="object"?n:ui(),r=typeof n=="string"?n:e,s=Gt(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=Bc("firestore");i&&hA(s,...i)}return s}function mr(n){if(n._terminated)throw new V(b.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||gS(n),n._firestoreClient}function gS(n){const e=n._freezeSettings(),t=rA(n._databaseId,n._app?.options.appId||"",n._persistenceKey,n._app?.options.apiKey,e);n._componentsProvider||e.localCache?._offlineComponentProvider&&e.localCache?._onlineComponentProvider&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new cS(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&function(s){const i=s?._online.build();return{_offline:s?._offline.build(i),_online:i}}(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class og{convertValue(e,t="none"){switch(ve(e)){case 0:return null;case 1:return e.booleanValue;case 2:return he(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Cn(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw B(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return Fn(e,(s,i)=>{r[s]=this.convertValue(i,t)}),r}convertVectorValue(e){const t=e.fields?.[zs].arrayValue?.values?.map(r=>he(r.doubleValue));return new st(t)}convertGeoPoint(e){return new Lt(he(e.latitude),he(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=gi(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Lr(e));default:return null}}convertTimestamp(e){const t=bn(e);return new oe(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=ne.fromString(e);F(cm(r),9688,{name:e});const s=new Hs(r.get(1),r.get(3)),i=new q(r.popFirst(5));return s.isEqual(t)||cn(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ma extends og{constructor(e){super(),this.firestore=e}convertBytes(e){return new lt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new ae(this.firestore,null,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qd(n){return function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1}(n,["next","error","complete"])}const $d="@firebase/firestore",jd="4.17.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Vo=class{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new ae(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new _S(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(e){if(this._document){const t=this._document.data.field(On("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}},_S=class extends Vo{data(){return super.data()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ag(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new V(b.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Qu{}class Yu extends Qu{}function Uk(n,e,...t){let r=[];e instanceof Qu&&r.push(e),r=r.concat(t),function(i){const o=i.filter(u=>u instanceof Ju).length,c=i.filter(u=>u instanceof ga).length;if(o>1||o>0&&c>0)throw new V(b.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)n=s._apply(n);return n}class ga extends Yu{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new ga(e,t,r)}_apply(e){const t=this._parse(e);return cg(e._query,t),new hn(e.firestore,e.converter,Ic(e._query,t))}_parse(e){const t=Qr(e.firestore);return function(i,o,c,u,h,f,m){let y;if(h.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new V(b.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){Hd(m,f);const k=[];for(const U of m)k.push(Wd(u,i,U));y={arrayValue:{values:k}}}else y=Wd(u,i,m)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||Hd(m,f),y=gA(c,o,m,f==="in"||f==="not-in");return we.create(h,f,y)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function Mk(n,e,t){const r=e,s=On("where",n);return ga._create(s,r,t)}class Ju extends Qu{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Ju(e,t)}_parse(e){const t=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return t.length===1?t[0]:bt.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(s,i){let o=s;const c=i.getFlattenedFilters();for(const u of c)cg(o,u),o=Ic(o,u)}(e._query,t),new hn(e.firestore,e.converter,Ic(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Xu extends Yu{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Xu(e,t)}_apply(e){const t=function(s,i,o){if(s.startAt!==null)throw new V(b.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new V(b.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Zs(i,o)}(e._query,this._field,this._direction);return new hn(e.firestore,e.converter,lv(e._query,t))}}function Fk(n,e="asc"){const t=e,r=On("orderBy",n);return Xu._create(r,t)}class Zu extends Yu{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new Zu(e,t,r)}_apply(e){return new hn(e.firestore,e.converter,Ao(e._query,this._limit,this._limitType))}}function Bk(n){return Zu._create("limit",n,"F")}function Wd(n,e,t){if(typeof(t=$(t))=="string"){if(t==="")throw new V(b.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!zp(e)&&t.indexOf("/")!==-1)throw new V(b.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(ne.fromString(t));if(!q.isDocumentKey(r))throw new V(b.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return rd(n,new q(r))}if(t instanceof ae)return rd(n,t._key);throw new V(b.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${zo(t)}.`)}function Hd(n,e){if(!Array.isArray(n)||n.length===0)throw new V(b.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function cg(n,e){const t=function(s,i){for(const o of s)for(const c of o.getFlattenedFilters())if(i.indexOf(c.op)>=0)return c.op;return null}(n.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new V(b.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new V(b.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function _a(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class yS extends og{constructor(e){super(),this.firestore=e}convertBytes(e){return new lt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new ae(this.firestore,null,t)}}class Pr{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Sn extends Vo{constructor(e,t,r,s,i,o){super(e,t,r,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new ao(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(On("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new V(b.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=Sn._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}Sn._jsonSchemaVersion="firestore/documentSnapshot/1.0",Sn._jsonSchema={type:Ee("string",Sn._jsonSchemaVersion),bundleSource:Ee("string","DocumentSnapshot"),bundleName:Ee("string"),bundle:Ee("string")};class ao extends Sn{data(e={}){return super.data(e)}}class tr{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Pr(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new ao(this._firestore,this._userDataWriter,r.key,r,new Pr(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new V(b.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map(c=>{Re(s._snapshot.query)?Sc(s._snapshot.query):uu(s.query._query);const u=new ao(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Pr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}})}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(c=>i||c.type!==3).map(c=>{const u=new ao(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Pr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,f=-1;return c.type!==0&&(h=o.indexOf(c.doc.key),o=o.delete(c.doc.key)),c.type!==1&&(o=o.add(c.doc),f=o.indexOf(c.doc.key)),{type:wS(c.type),doc:u,oldIndex:h,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new V(b.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=tr._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=su.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],s=[];return this.docs.forEach(i=>{i._document!==null&&(t.push(i._document),r.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function wS(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return B(61501,{type:n})}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */tr._jsonSchemaVersion="firestore/querySnapshot/1.0",tr._jsonSchema={type:Ee("string",tr._jsonSchemaVersion),bundleSource:Ee("string","QuerySnapshot"),bundleName:Ee("string"),bundle:Ee("string")};const ES={maxAttempts:5};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class IS{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=Qr(e)}set(e,t,r){this._verifyNotCommitted();const s=In(e,this._firestore),i=_a(s.converter,t,r),o=sa(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(o.toMutation(s._key,ye.none())),this}update(e,t,r,...s){this._verifyNotCommitted();const i=In(e,this._firestore);let o;return o=typeof(t=$(t))=="string"||t instanceof Gr?_u(this._dataReader,"WriteBatch.update",i._key,t,r,s):gu(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(o.toMutation(i._key,ye.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=In(e,this._firestore);return this._mutations=this._mutations.concat(new wi(t._key,ye.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new V(b.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function In(n,e){if((n=$(n)).firestore!==e)throw new V(b.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let TS=class{constructor(e,t){this._firestore=e,this._transaction=t,this._dataReader=Qr(e)}get(e){const t=In(e,this._firestore),r=new yS(this._firestore);return this._transaction.lookup([t._key]).then(s=>{if(!s||s.length!==1)return B(24041);const i=s[0];if(i.isFoundDocument())return new Vo(this._firestore,r,i.key,i,t.converter);if(i.isNoDocument())return new Vo(this._firestore,r,t._key,null,t.converter);throw B(18433,{doc:i})})}set(e,t,r){const s=In(e,this._firestore),i=_a(s.converter,t,r),o=sa(this._dataReader,"Transaction.set",s._key,i,s.converter!==null,r);return this._transaction.set(s._key,o),this}update(e,t,r,...s){const i=In(e,this._firestore);let o;return o=typeof(t=$(t))=="string"||t instanceof Gr?_u(this._dataReader,"Transaction.update",i._key,t,r,s):gu(this._dataReader,"Transaction.update",i._key,t),this._transaction.update(i._key,o),this}delete(e){const t=In(e,this._firestore);return this._transaction.delete(t._key),this}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vS extends TS{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=In(e,this._firestore),r=new ma(this._firestore);return super.get(e).then(s=>new Sn(this._firestore,r,t._key,s._document,new Pr(!1,!1),t.converter))}}function $k(n,e,t){n=De(n,Rt);const r={...ES,...t};(function(o){if(o.maxAttempts<1)throw new V(b.INVALID_ARGUMENT,"Max attempts must be at least 1")})(r);const s=mr(n);return mS(s,i=>e(new vS(n,i)),r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jk(n){n=De(n,ae);const e=De(n.firestore,Rt),t=mr(e);return ig(t,n._key).then(r=>el(e,n,r))}function Wk(n){n=De(n,ae);const e=De(n.firestore,Rt),t=mr(e);return ig(t,n._key,{source:"server"}).then(r=>el(e,n,r))}function Hk(n){n=De(n,hn);const e=De(n.firestore,Rt),t=mr(e),r=new ma(e);return ag(n._query),fS(t,n._query).then(s=>new tr(e,r,n,s))}function Gk(n,e,t){n=De(n,ae);const r=De(n.firestore,Rt),s=_a(n.converter,e,t),i=Qr(r);return Ri(r,[sa(i,"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,ye.none())])}function zk(n,e,t,...r){n=De(n,ae);const s=De(n.firestore,Rt),i=Qr(s);let o;return o=typeof(e=$(e))=="string"||e instanceof Gr?_u(i,"updateDoc",n._key,e,t,r):gu(i,"updateDoc",n._key,e),Ri(s,[o.toMutation(n._key,ye.exists(!0))])}function Kk(n){return Ri(De(n.firestore,Rt),[new wi(n._key,ye.none())])}function Qk(n,e){const t=De(n.firestore,Rt),r=dA(n),s=_a(n.converter,e),i=Qr(n.firestore);return Ri(t,[sa(i,"addDoc",r._key,s,n.converter!==null,{}).toMutation(r._key,ye.exists(!1))]).then(()=>r)}function Yk(n,...e){n=$(n);let t={includeMetadataChanges:!1,source:"default"},r=0;typeof e[r]!="object"||qd(e[r])||(t=e[r++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(qd(e[r])){const h=e[r];e[r]=h.next?.bind(h),e[r+1]=h.error?.bind(h),e[r+2]=h.complete?.bind(h)}let i,o,c;if(n instanceof ae)o=De(n.firestore,Rt),c=Xo(n._key.path),i={next:h=>{e[r]&&e[r](el(o,n,h))},error:e[r+1],complete:e[r+2]};else{const h=De(n,hn);o=De(h.firestore,Rt),c=h._query;const f=new ma(o);i={next:m=>{e[r]&&e[r](new tr(o,f,h,m))},error:e[r+1],complete:e[r+2]},ag(n._query)}const u=mr(o);return dS(u,c,s,i)}function Ri(n,e){const t=mr(n);return pS(t,e)}function el(n,e,t){const r=t.docs.get(e._key),s=new ma(n);return new Sn(n,s,e._key,r,new Pr(t.hasPendingWrites,t.fromCache),e.converter)}function Jk(n){return n=De(n,Rt),mr(n),new IS(n,e=>Ri(n,e))}(function(e,t=!0){ST(lr),Tt(new mt("firestore",(r,{instanceIdentifier:s,options:i})=>{const o=r.getProvider("app").getImmediate(),c=new Rt(new $v(r.getProvider("auth-internal")),new Hv(o,r.getProvider("app-check-internal")),LT(o,s),o);return i={useFetchStreams:t,...i},c._setSettings(i),c},"PUBLIC").setMultipleInstances(!0)),$e($d,jd,e),$e($d,jd,"esm2020")})();var AS="firebase",RS="12.17.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */$e(AS,RS,"app");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ug="firebasestorage.googleapis.com",lg="storageBucket",PS=2*60*1e3,SS=10*60*1e3,bS=1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class de extends gt{constructor(e,t,r=0){super(rc(e),`Firebase Storage: ${t} (${rc(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,de.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return rc(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var ce;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(ce||(ce={}));function rc(n){return"storage/"+n}function tl(){const n="An unknown error occurred, please check the error payload for server response.";return new de(ce.UNKNOWN,n)}function CS(n){return new de(ce.OBJECT_NOT_FOUND,"Object '"+n+"' does not exist.")}function kS(n){return new de(ce.QUOTA_EXCEEDED,"Quota for bucket '"+n+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function NS(){const n="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new de(ce.UNAUTHENTICATED,n)}function VS(){return new de(ce.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function OS(n){return new de(ce.UNAUTHORIZED,"User does not have permission to access '"+n+"'.")}function hg(){return new de(ce.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function dg(){return new de(ce.CANCELED,"User canceled the upload/download.")}function DS(n){return new de(ce.INVALID_URL,"Invalid URL '"+n+"'.")}function xS(n){return new de(ce.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function LS(){return new de(ce.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+lg+"' property when initializing the app?")}function fg(){return new de(ce.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function US(){return new de(ce.SERVER_FILE_WRONG_SIZE,"Server recorded incorrect upload file size, please retry the upload.")}function MS(){return new de(ce.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function FS(n){return new de(ce.UNSUPPORTED_ENVIRONMENT,`${n} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function Oc(n){return new de(ce.INVALID_ARGUMENT,n)}function pg(){return new de(ce.APP_DELETED,"The Firebase app was deleted.")}function BS(n){return new de(ce.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function Fs(n,e){return new de(ce.INVALID_FORMAT,"String does not match format '"+n+"': "+e)}function Is(n){throw new de(ce.INTERNAL_ERROR,"Internal error: "+n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qe{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let r;try{r=Qe.makeFromUrl(e,t)}catch{return new Qe(e,"")}if(r.path==="")return r;throw xS(e)}static makeFromUrl(e,t){let r=null;const s="([A-Za-z0-9.\\-_]+)";function i(re){re.path.charAt(re.path.length-1)==="/"&&(re.path_=re.path_.slice(0,-1))}const o="(/(.*))?$",c=new RegExp("^gs://"+s+o,"i"),u={bucket:1,path:3};function h(re){re.path_=decodeURIComponent(re.path)}const f="v[A-Za-z0-9_]+",m=t.replace(/[.]/g,"\\."),y="(/([^?#]*).*)?$",S=new RegExp(`^https?://${m}/${f}/b/${s}/o${y}`,"i"),k={bucket:1,path:3},U=t===ug?"(?:storage.googleapis.com|storage.cloud.google.com)":t,O="([^?#]*)",W=new RegExp(`^https?://${U}/${s}/${O}`,"i"),Q=[{regex:c,indices:u,postModify:i},{regex:S,indices:k,postModify:h},{regex:W,indices:{bucket:1,path:2},postModify:h}];for(let re=0;re<Q.length;re++){const Ce=Q[re],ue=Ce.regex.exec(e);if(ue){const T=ue[Ce.indices.bucket];let g=ue[Ce.indices.path];g||(g=""),r=new Qe(T,g),Ce.postModify(r);break}}if(r==null)throw DS(e);return r}}class qS{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $S(n,e,t){let r=1,s=null,i=null,o=!1,c=0;function u(){return c===2}let h=!1;function f(...O){h||(h=!0,e.apply(null,O))}function m(O){s=setTimeout(()=>{s=null,n(S,u())},O)}function y(){i&&clearTimeout(i)}function S(O,...W){if(h){y();return}if(O){y(),f.call(null,O,...W);return}if(u()||o){y(),f.call(null,O,...W);return}r<64&&(r*=2);let Q;c===1?(c=2,Q=0):Q=(r+Math.random())*1e3,m(Q)}let k=!1;function U(O){k||(k=!0,y(),!h&&(s!==null?(O||(c=2),clearTimeout(s),m(0)):O||(c=1)))}return m(0),i=setTimeout(()=>{o=!0,U(!0)},t),U}function jS(n){n(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function WS(n){return n!==void 0}function HS(n){return typeof n=="function"}function GS(n){return typeof n=="object"&&!Array.isArray(n)}function ya(n){return typeof n=="string"||n instanceof String}function Gd(n){return nl()&&n instanceof Blob}function nl(){return typeof Blob<"u"}function Dc(n,e,t,r){if(r<e)throw Oc(`Invalid value for '${n}'. Expected ${e} or greater.`);if(r>t)throw Oc(`Invalid value for '${n}'. Expected ${t} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gr(n,e,t){let r=e;return t==null&&(r=`https://${e}`),`${t}://${r}/v0${n}`}function mg(n){const e=encodeURIComponent;let t="?";for(const r in n)if(n.hasOwnProperty(r)){const s=e(r)+"="+e(n[r]);t=t+s+"&"}return t=t.slice(0,-1),t}var nr;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(nr||(nr={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gg(n,e){const t=n>=500&&n<600,s=[408,429].indexOf(n)!==-1,i=e.indexOf(n)!==-1;return t||s||i}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zS{constructor(e,t,r,s,i,o,c,u,h,f,m,y=!0,S=!1){this.url_=e,this.method_=t,this.headers_=r,this.body_=s,this.successCodes_=i,this.additionalRetryCodes_=o,this.callback_=c,this.errorCallback_=u,this.timeout_=h,this.progressCallback_=f,this.connectionFactory_=m,this.retry=y,this.isUsingEmulator=S,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((k,U)=>{this.resolve_=k,this.reject_=U,this.start_()})}start_(){const e=(r,s)=>{if(s){r(!1,new Qi(!1,null,!0));return}const i=this.connectionFactory_();this.pendingConnection_=i;const o=c=>{const u=c.loaded,h=c.lengthComputable?c.total:-1;this.progressCallback_!==null&&this.progressCallback_(u,h)};this.progressCallback_!==null&&i.addUploadProgressListener(o),i.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(o),this.pendingConnection_=null;const c=i.getErrorCode()===nr.NO_ERROR,u=i.getStatus();if(!c||gg(u,this.additionalRetryCodes_)&&this.retry){const f=i.getErrorCode()===nr.ABORT;r(!1,new Qi(!1,null,f));return}const h=this.successCodes_.indexOf(u)!==-1;r(!0,new Qi(h,i))})},t=(r,s)=>{const i=this.resolve_,o=this.reject_,c=s.connection;if(s.wasSuccessCode)try{const u=this.callback_(c,c.getResponse());WS(u)?i(u):i()}catch(u){o(u)}else if(c!==null){const u=tl();u.serverResponse=c.getErrorText(),this.errorCallback_?o(this.errorCallback_(c,u)):o(u)}else if(s.canceled){const u=this.appDelete_?pg():dg();o(u)}else{const u=hg();o(u)}};this.canceled_?t(!1,new Qi(!1,null,!0)):this.backoffId_=$S(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&jS(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class Qi{constructor(e,t,r){this.wasSuccessCode=e,this.connection=t,this.canceled=!!r}}function KS(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function QS(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function YS(n,e){e&&(n["X-Firebase-GMPID"]=e)}function JS(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function XS(n,e,t,r,s,i,o=!0,c=!1){const u=mg(n.urlParams),h=n.url+u,f=Object.assign({},n.headers);return YS(f,e),KS(f,t),QS(f,i),JS(f,r),new zS(h,n.method,f,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,s,o,c)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ZS(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function eb(...n){const e=ZS();if(e!==void 0){const t=new e;for(let r=0;r<n.length;r++)t.append(n[r]);return t.getBlob()}else{if(nl())return new Blob(n);throw new de(ce.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function tb(n,e,t){return n.webkitSlice?n.webkitSlice(e,t):n.mozSlice?n.mozSlice(e,t):n.slice?n.slice(e,t):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nb(n){if(typeof atob>"u")throw FS("base-64");return atob(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dt={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class sc{constructor(e,t){this.data=e,this.contentType=t||null}}function rb(n,e){switch(n){case Dt.RAW:return new sc(_g(e));case Dt.BASE64:case Dt.BASE64URL:return new sc(yg(n,e));case Dt.DATA_URL:return new sc(ib(e),ob(e))}throw tl()}function _g(n){const e=[];for(let t=0;t<n.length;t++){let r=n.charCodeAt(t);if(r<=127)e.push(r);else if(r<=2047)e.push(192|r>>6,128|r&63);else if((r&64512)===55296)if(!(t<n.length-1&&(n.charCodeAt(t+1)&64512)===56320))e.push(239,191,189);else{const i=r,o=n.charCodeAt(++t);r=65536|(i&1023)<<10|o&1023,e.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63)}else(r&64512)===56320?e.push(239,191,189):e.push(224|r>>12,128|r>>6&63,128|r&63)}return new Uint8Array(e)}function sb(n){let e;try{e=decodeURIComponent(n)}catch{throw Fs(Dt.DATA_URL,"Malformed data URL.")}return _g(e)}function yg(n,e){switch(n){case Dt.BASE64:{const s=e.indexOf("-")!==-1,i=e.indexOf("_")!==-1;if(s||i)throw Fs(n,"Invalid character '"+(s?"-":"_")+"' found: is it base64url encoded?");break}case Dt.BASE64URL:{const s=e.indexOf("+")!==-1,i=e.indexOf("/")!==-1;if(s||i)throw Fs(n,"Invalid character '"+(s?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let t;try{t=nb(e)}catch(s){throw s.message.includes("polyfill")?s:Fs(n,"Invalid character found")}const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}class wg{constructor(e){this.base64=!1,this.contentType=null;const t=e.match(/^data:([^,]+)?,/);if(t===null)throw Fs(Dt.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const r=t[1]||null;r!=null&&(this.base64=ab(r,";base64"),this.contentType=this.base64?r.substring(0,r.length-7):r),this.rest=e.substring(e.indexOf(",")+1)}}function ib(n){const e=new wg(n);return e.base64?yg(Dt.BASE64,e.rest):sb(e.rest)}function ob(n){return new wg(n).contentType}function ab(n,e){return n.length>=e.length?n.substring(n.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kt{constructor(e,t){let r=0,s="";Gd(e)?(this.data_=e,r=e.size,s=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),r=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),r=e.length),this.size_=r,this.type_=s}size(){return this.size_}type(){return this.type_}slice(e,t){if(Gd(this.data_)){const r=this.data_,s=tb(r,e,t);return s===null?null:new Kt(s)}else{const r=new Uint8Array(this.data_.buffer,e,t-e);return new Kt(r,!0)}}static getBlob(...e){if(nl()){const t=e.map(r=>r instanceof Kt?r.data_:r);return new Kt(eb.apply(null,t))}else{const t=e.map(o=>ya(o)?rb(Dt.RAW,o).data:o.data_);let r=0;t.forEach(o=>{r+=o.byteLength});const s=new Uint8Array(r);let i=0;return t.forEach(o=>{for(let c=0;c<o.length;c++)s[i++]=o[c]}),new Kt(s,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rl(n){let e;try{e=JSON.parse(n)}catch{return null}return GS(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cb(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function ub(n,e){const t=e.split("/").filter(r=>r.length>0).join("/");return n.length===0?t:n+"/"+t}function Eg(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lb(n,e){return e}class ze{constructor(e,t,r,s){this.server=e,this.local=t||e,this.writable=!!r,this.xform=s||lb}}let Yi=null;function hb(n){return!ya(n)||n.length<2?n:Eg(n)}function sl(){if(Yi)return Yi;const n=[];n.push(new ze("bucket")),n.push(new ze("generation")),n.push(new ze("metageneration")),n.push(new ze("name","fullPath",!0));function e(i,o){return hb(o)}const t=new ze("name");t.xform=e,n.push(t);function r(i,o){return o!==void 0?Number(o):o}const s=new ze("size");return s.xform=r,n.push(s),n.push(new ze("timeCreated")),n.push(new ze("updated")),n.push(new ze("md5Hash",null,!0)),n.push(new ze("cacheControl",null,!0)),n.push(new ze("contentDisposition",null,!0)),n.push(new ze("contentEncoding",null,!0)),n.push(new ze("contentLanguage",null,!0)),n.push(new ze("contentType",null,!0)),n.push(new ze("metadata","customMetadata",!0)),Yi=n,Yi}function db(n,e){function t(){const r=n.bucket,s=n.fullPath,i=new Qe(r,s);return e._makeStorageReference(i)}Object.defineProperty(n,"ref",{get:t})}function fb(n,e,t){const r={};r.type="file";const s=t.length;for(let i=0;i<s;i++){const o=t[i];r[o.local]=o.xform(r,e[o.server])}return db(r,n),r}function Ig(n,e,t){const r=rl(e);return r===null?null:fb(n,r,t)}function pb(n,e,t,r){const s=rl(e);if(s===null||!ya(s.downloadTokens))return null;const i=s.downloadTokens;if(i.length===0)return null;const o=encodeURIComponent;return i.split(",").map(h=>{const f=n.bucket,m=n.fullPath,y="/b/"+o(f)+"/o/"+o(m),S=gr(y,t,r),k=mg({alt:"media",token:h});return S+k})[0]}function Tg(n,e){const t={},r=e.length;for(let s=0;s<r;s++){const i=e[s];i.writable&&(t[i.server]=n[i.local])}return JSON.stringify(t)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zd="prefixes",Kd="items";function mb(n,e,t){const r={prefixes:[],items:[],nextPageToken:t.nextPageToken};if(t[zd])for(const s of t[zd]){const i=s.replace(/\/$/,""),o=n._makeStorageReference(new Qe(e,i));r.prefixes.push(o)}if(t[Kd])for(const s of t[Kd]){const i=n._makeStorageReference(new Qe(e,s.name));r.items.push(i)}return r}function gb(n,e,t){const r=rl(t);return r===null?null:mb(n,e,r)}class qn{constructor(e,t,r,s){this.url=e,this.method=t,this.handler=r,this.timeout=s,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mt(n){if(!n)throw tl()}function il(n,e){function t(r,s){const i=Ig(n,s,e);return Mt(i!==null),i}return t}function _b(n,e){function t(r,s){const i=gb(n,e,s);return Mt(i!==null),i}return t}function yb(n,e){function t(r,s){const i=Ig(n,s,e);return Mt(i!==null),pb(i,s,n.host,n._protocol)}return t}function ts(n){function e(t,r){let s;return t.getStatus()===401?t.getErrorText().includes("Firebase App Check token is invalid")?s=VS():s=NS():t.getStatus()===402?s=kS(n.bucket):t.getStatus()===403?s=OS(n.path):s=r,s.status=t.getStatus(),s.serverResponse=r.serverResponse,s}return e}function ol(n){const e=ts(n);function t(r,s){let i=e(r,s);return r.getStatus()===404&&(i=CS(n.path)),i.serverResponse=s.serverResponse,i}return t}function wb(n,e,t){const r=e.fullServerUrl(),s=gr(r,n.host,n._protocol),i="GET",o=n.maxOperationRetryTime,c=new qn(s,i,il(n,t),o);return c.errorHandler=ol(e),c}function Eb(n,e,t,r,s){const i={};e.isRoot?i.prefix="":i.prefix=e.path+"/",t.length>0&&(i.delimiter=t),r&&(i.pageToken=r),s&&(i.maxResults=s);const o=e.bucketOnlyServerUrl(),c=gr(o,n.host,n._protocol),u="GET",h=n.maxOperationRetryTime,f=new qn(c,u,_b(n,e.bucket),h);return f.urlParams=i,f.errorHandler=ts(e),f}function Ib(n,e,t){const r=e.fullServerUrl(),s=gr(r,n.host,n._protocol),i="GET",o=n.maxOperationRetryTime,c=new qn(s,i,yb(n,t),o);return c.errorHandler=ol(e),c}function Tb(n,e){const t=e.fullServerUrl(),r=gr(t,n.host,n._protocol),s="DELETE",i=n.maxOperationRetryTime;function o(u,h){}const c=new qn(r,s,o,i);return c.successCodes=[200,204],c.errorHandler=ol(e),c}function vb(n,e){return n&&n.contentType||e&&e.type()||"application/octet-stream"}function vg(n,e,t){const r=Object.assign({},t);return r.fullPath=n.path,r.size=e.size(),r.contentType||(r.contentType=vb(null,e)),r}function Ag(n,e,t,r,s){const i=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function c(){let Q="";for(let re=0;re<2;re++)Q=Q+Math.random().toString().slice(2);return Q}const u=c();o["Content-Type"]="multipart/related; boundary="+u;const h=vg(e,r,s),f=Tg(h,t),m="--"+u+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+f+`\r
--`+u+`\r
Content-Type: `+h.contentType+`\r
\r
`,y=`\r
--`+u+"--",S=Kt.getBlob(m,r,y);if(S===null)throw fg();const k={name:h.fullPath},U=gr(i,n.host,n._protocol),O="POST",W=n.maxUploadRetryTime,K=new qn(U,O,il(n,t),W);return K.urlParams=k,K.headers=o,K.body=S.uploadData(),K.errorHandler=ts(e),K}class Oo{constructor(e,t,r,s){this.current=e,this.total=t,this.finalized=!!r,this.metadata=s||null}}function al(n,e){let t=null;try{t=n.getResponseHeader("X-Goog-Upload-Status")}catch{Mt(!1)}return Mt(!!t&&(e||["active"]).indexOf(t)!==-1),t}function Ab(n,e,t,r,s){const i=e.bucketOnlyServerUrl(),o=vg(e,r,s),c={name:o.fullPath},u=gr(i,n.host,n._protocol),h="POST",f={"X-Goog-Upload-Protocol":"resumable","X-Goog-Upload-Command":"start","X-Goog-Upload-Header-Content-Length":`${r.size()}`,"X-Goog-Upload-Header-Content-Type":o.contentType,"Content-Type":"application/json; charset=utf-8"},m=Tg(o,t),y=n.maxUploadRetryTime;function S(U){al(U);let O;try{O=U.getResponseHeader("X-Goog-Upload-URL")}catch{Mt(!1)}return Mt(ya(O)),O}const k=new qn(u,h,S,y);return k.urlParams=c,k.headers=f,k.body=m,k.errorHandler=ts(e),k}function Rb(n,e,t,r){const s={"X-Goog-Upload-Command":"query"};function i(h){const f=al(h,["active","final"]);let m=null;try{m=h.getResponseHeader("X-Goog-Upload-Size-Received")}catch{Mt(!1)}m||Mt(!1);const y=Number(m);return Mt(!isNaN(y)),new Oo(y,r.size(),f==="final")}const o="POST",c=n.maxUploadRetryTime,u=new qn(t,o,i,c);return u.headers=s,u.errorHandler=ts(e),u}const Qd=256*1024;function Pb(n,e,t,r,s,i,o,c){const u=new Oo(0,0);if(o?(u.current=o.current,u.total=o.total):(u.current=0,u.total=r.size()),r.size()!==u.total)throw US();const h=u.total-u.current;let f=h;s>0&&(f=Math.min(f,s));const m=u.current,y=m+f;let S="";f===0?S="finalize":h===f?S="upload, finalize":S="upload";const k={"X-Goog-Upload-Command":S,"X-Goog-Upload-Offset":`${u.current}`},U=r.slice(m,y);if(U===null)throw fg();function O(re,Ce){const ue=al(re,["active","final"]),T=u.current+f,g=r.size();let w;return ue==="final"?w=il(e,i)(re,Ce):w=null,new Oo(T,g,ue==="final",w)}const W="POST",K=e.maxUploadRetryTime,Q=new qn(t,W,O,K);return Q.headers=k,Q.body=U.uploadData(),Q.progressCallback=c||null,Q.errorHandler=ts(n),Q}const tt={RUNNING:"running",PAUSED:"paused",SUCCESS:"success",CANCELED:"canceled",ERROR:"error"};function ic(n){switch(n){case"running":case"pausing":case"canceling":return tt.RUNNING;case"paused":return tt.PAUSED;case"success":return tt.SUCCESS;case"canceled":return tt.CANCELED;case"error":return tt.ERROR;default:return tt.ERROR}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sb{constructor(e,t,r){if(HS(e)||t!=null||r!=null)this.next=e,this.error=t??void 0,this.complete=r??void 0;else{const i=e;this.next=i.next,this.error=i.error,this.complete=i.complete}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Er(n){return(...e)=>{Promise.resolve().then(()=>n(...e))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bb{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=nr.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=nr.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=nr.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,t,r,s,i){if(this.sent_)throw Is("cannot .send() more than once");if(Ht(e)&&r&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(t,e,!0),i!==void 0)for(const o in i)i.hasOwnProperty(o)&&this.xhr_.setRequestHeader(o,i[o].toString());return s!==void 0?this.xhr_.send(s):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw Is("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw Is("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw Is("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw Is("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class Cb extends bb{initXhr(){this.xhr_.responseType="text"}}function Qt(){return new Cb}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kb{isExponentialBackoffExpired(){return this.sleepTime>this.maxSleepTime}constructor(e,t,r=null){this._transferred=0,this._needToFetchStatus=!1,this._needToFetchMetadata=!1,this._observers=[],this._error=void 0,this._uploadUrl=void 0,this._request=void 0,this._chunkMultiplier=1,this._resolve=void 0,this._reject=void 0,this._ref=e,this._blob=t,this._metadata=r,this._mappings=sl(),this._resumable=this._shouldDoResumable(this._blob),this._state="running",this._errorHandler=s=>{if(this._request=void 0,this._chunkMultiplier=1,s._codeEquals(ce.CANCELED))this._needToFetchStatus=!0,this.completeTransitions_();else{const i=this.isExponentialBackoffExpired();if(gg(s.status,[]))if(i)s=hg();else{this.sleepTime=Math.max(this.sleepTime*2,bS),this._needToFetchStatus=!0,this.completeTransitions_();return}this._error=s,this._transition("error")}},this._metadataErrorHandler=s=>{this._request=void 0,s._codeEquals(ce.CANCELED)?this.completeTransitions_():(this._error=s,this._transition("error"))},this.sleepTime=0,this.maxSleepTime=this._ref.storage.maxUploadRetryTime,this._promise=new Promise((s,i)=>{this._resolve=s,this._reject=i,this._start()}),this._promise.then(null,()=>{})}_makeProgressCallback(){const e=this._transferred;return t=>this._updateProgress(e+t)}_shouldDoResumable(e){return e.size()>256*1024}_start(){this._state==="running"&&this._request===void 0&&(this._resumable?this._uploadUrl===void 0?this._createResumable():this._needToFetchStatus?this._fetchStatus():this._needToFetchMetadata?this._fetchMetadata():this.pendingTimeout=setTimeout(()=>{this.pendingTimeout=void 0,this._continueUpload()},this.sleepTime):this._oneShotUpload())}_resolveToken(e){Promise.all([this._ref.storage._getAuthToken(),this._ref.storage._getAppCheckToken()]).then(([t,r])=>{switch(this._state){case"running":e(t,r);break;case"canceling":this._transition("canceled");break;case"pausing":this._transition("paused");break}})}_createResumable(){this._resolveToken((e,t)=>{const r=Ab(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),s=this._ref.storage._makeRequest(r,Qt,e,t);this._request=s,s.getPromise().then(i=>{this._request=void 0,this._uploadUrl=i,this._needToFetchStatus=!1,this.completeTransitions_()},this._errorHandler)})}_fetchStatus(){const e=this._uploadUrl;this._resolveToken((t,r)=>{const s=Rb(this._ref.storage,this._ref._location,e,this._blob),i=this._ref.storage._makeRequest(s,Qt,t,r);this._request=i,i.getPromise().then(o=>{o=o,this._request=void 0,this._updateProgress(o.current),this._needToFetchStatus=!1,o.finalized&&(this._needToFetchMetadata=!0),this.completeTransitions_()},this._errorHandler)})}_continueUpload(){const e=Qd*this._chunkMultiplier,t=new Oo(this._transferred,this._blob.size()),r=this._uploadUrl;this._resolveToken((s,i)=>{let o;try{o=Pb(this._ref._location,this._ref.storage,r,this._blob,e,this._mappings,t,this._makeProgressCallback())}catch(u){this._error=u,this._transition("error");return}const c=this._ref.storage._makeRequest(o,Qt,s,i,!1);this._request=c,c.getPromise().then(u=>{this._increaseMultiplier(),this._request=void 0,this._updateProgress(u.current),u.finalized?(this._metadata=u.metadata,this._transition("success")):this.completeTransitions_()},this._errorHandler)})}_increaseMultiplier(){Qd*this._chunkMultiplier*2<32*1024*1024&&(this._chunkMultiplier*=2)}_fetchMetadata(){this._resolveToken((e,t)=>{const r=wb(this._ref.storage,this._ref._location,this._mappings),s=this._ref.storage._makeRequest(r,Qt,e,t);this._request=s,s.getPromise().then(i=>{this._request=void 0,this._metadata=i,this._transition("success")},this._metadataErrorHandler)})}_oneShotUpload(){this._resolveToken((e,t)=>{const r=Ag(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),s=this._ref.storage._makeRequest(r,Qt,e,t);this._request=s,s.getPromise().then(i=>{this._request=void 0,this._metadata=i,this._updateProgress(this._blob.size()),this._transition("success")},this._errorHandler)})}_updateProgress(e){const t=this._transferred;this._transferred=e,this._transferred!==t&&this._notifyObservers()}_transition(e){if(this._state!==e)switch(e){case"canceling":case"pausing":this._state=e,this._request!==void 0?this._request.cancel():this.pendingTimeout&&(clearTimeout(this.pendingTimeout),this.pendingTimeout=void 0,this.completeTransitions_());break;case"running":const t=this._state==="paused";this._state=e,t&&(this._notifyObservers(),this._start());break;case"paused":this._state=e,this._notifyObservers();break;case"canceled":this._error=dg(),this._state=e,this._notifyObservers();break;case"error":this._state=e,this._notifyObservers();break;case"success":this._state=e,this._notifyObservers();break}}completeTransitions_(){switch(this._state){case"pausing":this._transition("paused");break;case"canceling":this._transition("canceled");break;case"running":this._start();break}}get snapshot(){const e=ic(this._state);return{bytesTransferred:this._transferred,totalBytes:this._blob.size(),state:e,metadata:this._metadata,task:this,ref:this._ref}}on(e,t,r,s){const i=new Sb(t||void 0,r||void 0,s||void 0);return this._addObserver(i),()=>{this._removeObserver(i)}}then(e,t){return this._promise.then(e,t)}catch(e){return this.then(null,e)}_addObserver(e){this._observers.push(e),this._notifyObserver(e)}_removeObserver(e){const t=this._observers.indexOf(e);t!==-1&&this._observers.splice(t,1)}_notifyObservers(){this._finishPromise(),this._observers.slice().forEach(t=>{this._notifyObserver(t)})}_finishPromise(){if(this._resolve!==void 0){let e=!0;switch(ic(this._state)){case tt.SUCCESS:Er(this._resolve.bind(null,this.snapshot))();break;case tt.CANCELED:case tt.ERROR:const t=this._reject;Er(t.bind(null,this._error))();break;default:e=!1;break}e&&(this._resolve=void 0,this._reject=void 0)}}_notifyObserver(e){switch(ic(this._state)){case tt.RUNNING:case tt.PAUSED:e.next&&Er(e.next.bind(e,this.snapshot))();break;case tt.SUCCESS:e.complete&&Er(e.complete.bind(e))();break;case tt.CANCELED:case tt.ERROR:e.error&&Er(e.error.bind(e,this._error))();break;default:e.error&&Er(e.error.bind(e,this._error))()}}resume(){const e=this._state==="paused"||this._state==="pausing";return e&&this._transition("running"),e}pause(){const e=this._state==="running";return e&&this._transition("pausing"),e}cancel(){const e=this._state==="running"||this._state==="pausing";return e&&this._transition("canceling"),e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class or{constructor(e,t){this._service=e,t instanceof Qe?this._location=t:this._location=Qe.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new or(e,t)}get root(){const e=new Qe(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return Eg(this._location.path)}get storage(){return this._service}get parent(){const e=cb(this._location.path);if(e===null)return null;const t=new Qe(this._location.bucket,e);return new or(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw BS(e)}}function Nb(n,e,t){n._throwIfRoot("uploadBytes");const r=Ag(n.storage,n._location,sl(),new Kt(e,!0),t);return n.storage.makeRequestWithTokens(r,Qt).then(s=>({metadata:s,ref:n}))}function Vb(n,e,t){return n._throwIfRoot("uploadBytesResumable"),new kb(n,new Kt(e),t)}function Ob(n){const e={prefixes:[],items:[]};return Rg(n,e).then(()=>e)}async function Rg(n,e,t){const s=await Db(n,{pageToken:t});e.prefixes.push(...s.prefixes),e.items.push(...s.items),s.nextPageToken!=null&&await Rg(n,e,s.nextPageToken)}function Db(n,e){e!=null&&typeof e.maxResults=="number"&&Dc("options.maxResults",1,1e3,e.maxResults);const t=e||{},r=Eb(n.storage,n._location,"/",t.pageToken,t.maxResults);return n.storage.makeRequestWithTokens(r,Qt)}function xb(n){n._throwIfRoot("getDownloadURL");const e=Ib(n.storage,n._location,sl());return n.storage.makeRequestWithTokens(e,Qt).then(t=>{if(t===null)throw MS();return t})}function Lb(n){n._throwIfRoot("deleteObject");const e=Tb(n.storage,n._location);return n.storage.makeRequestWithTokens(e,Qt)}function Ub(n,e){const t=ub(n._location.path,e),r=new Qe(n._location.bucket,t);return new or(n.storage,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mb(n){return/^[A-Za-z]+:\/\//.test(n)}function Fb(n,e){return new or(n,e)}function Pg(n,e){if(n instanceof cl){const t=n;if(t._bucket==null)throw LS();const r=new or(t,t._bucket);return e!=null?Pg(r,e):r}else return e!==void 0?Ub(n,e):n}function Bb(n,e){if(e&&Mb(e)){if(n instanceof cl)return Fb(n,e);throw Oc("To use ref(service, url), the first argument must be a Storage instance.")}else return Pg(n,e)}function Yd(n,e){const t=e?.[lg];return t==null?null:Qe.makeFromBucketSpec(t,n)}function qb(n,e,t,r={}){n.host=`${e}:${t}`;const s=Ht(e);s&&ci(`https://${n.host}/b`),n._isUsingEmulator=!0,n._protocol=s?"https":"http";const{mockUserToken:i}=r;i&&(n._overrideAuthToken=typeof i=="string"?i:mf(i,n.app.options.projectId))}class cl{constructor(e,t,r,s,i,o=!1){this.app=e,this._authProvider=t,this._appCheckProvider=r,this._url=s,this._firebaseVersion=i,this._isUsingEmulator=o,this._bucket=null,this._host=ug,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=PS,this._maxUploadRetryTime=SS,this._requests=new Set,s!=null?this._bucket=Qe.makeFromBucketSpec(s,this._host):this._bucket=Yd(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=Qe.makeFromBucketSpec(this._url,e):this._bucket=Yd(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){Dc("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){Dc("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){if(pe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new or(this,e)}_makeRequest(e,t,r,s,i=!0){if(this._deleted)return new qS(pg());{const o=XS(e,this._appId,r,s,t,this._firebaseVersion,i,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,t){const[r,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,r,s).getPromise()}}const Jd="@firebase/storage",Xd="0.14.4";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sg="storage";function Xk(n,e,t){return n=$(n),Nb(n,e,t)}function Zk(n,e,t){return n=$(n),Vb(n,e,t)}function eN(n){return n=$(n),Ob(n)}function tN(n){return n=$(n),xb(n)}function nN(n){return n=$(n),Lb(n)}function rN(n,e){return n=$(n),Bb(n,e)}function sN(n=ui(),e){n=$(n);const r=Gt(n,Sg).getImmediate({identifier:e}),s=Bc("storage");return s&&$b(r,...s),r}function $b(n,e,t,r={}){qb(n,e,t,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jb(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),r=n.getProvider("auth-internal"),s=n.getProvider("app-check-internal");return new cl(t,r,s,e,lr)}function Wb(){Tt(new mt(Sg,jb,"PUBLIC").setMultipleInstances(!0)),$e(Jd,Xd,""),$e(Jd,Xd,"esm2020")}Wb();const bg="@firebase/installations",ul="0.6.23";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cg=1e4,kg=`w:${ul}`,Ng="FIS_v2",Hb="https://firebaseinstallations.googleapis.com/v1",Gb=60*60*1e3,zb="installations",Kb="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qb={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},ar=new ur(zb,Kb,Qb);function Vg(n){return n instanceof gt&&n.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Og({projectId:n}){return`${Hb}/projects/${n}/installations`}function Dg(n){return{token:n.token,requestStatus:2,expiresIn:Jb(n.expiresIn),creationTime:Date.now()}}async function xg(n,e){const r=(await e.json()).error;return ar.create("request-failed",{requestName:n,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function Lg({apiKey:n}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n})}function Yb(n,{refreshToken:e}){const t=Lg(n);return t.append("Authorization",Xb(e)),t}async function Ug(n){const e=await n();return e.status>=500&&e.status<600?n():e}function Jb(n){return Number(n.replace("s","000"))}function Xb(n){return`${Ng} ${n}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Zb({appConfig:n,heartbeatServiceProvider:e},{fid:t}){const r=Og(n),s=Lg(n),i=e.getImmediate({optional:!0});if(i){const h=await i.getHeartbeatsHeader();h&&s.append("x-firebase-client",h)}const o={fid:t,authVersion:Ng,appId:n.appId,sdkVersion:kg},c={method:"POST",headers:s,body:JSON.stringify(o)},u=await Ug(()=>fetch(r,c));if(u.ok){const h=await u.json();return{fid:h.fid||t,registrationStatus:2,refreshToken:h.refreshToken,authToken:Dg(h.authToken)}}else throw await xg("Create Installation",u)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mg(n){return new Promise(e=>{setTimeout(e,n)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eC(n){return btoa(String.fromCharCode(...n)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tC=/^[cdef][\w-]{21}$/,xc="";function nC(){try{const n=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(n),n[0]=112+n[0]%16;const t=rC(n);return tC.test(t)?t:xc}catch{return xc}}function rC(n){return eC(n).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wa(n){return`${n.appName}!${n.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fg=new Map;function Bg(n,e){const t=wa(n);qg(t,e),sC(t,e)}function qg(n,e){const t=Fg.get(n);if(t)for(const r of t)r(e)}function sC(n,e){const t=iC();t&&t.postMessage({key:n,fid:e}),oC()}let Jn=null;function iC(){return!Jn&&"BroadcastChannel"in self&&(Jn=new BroadcastChannel("[Firebase] FID Change"),Jn.onmessage=n=>{qg(n.data.key,n.data.fid)}),Jn}function oC(){Fg.size===0&&Jn&&(Jn.close(),Jn=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const aC="firebase-installations-database",cC=1,cr="firebase-installations-store";let oc=null;function ll(){return oc||(oc=af(aC,cC,{upgrade:(n,e)=>{switch(e){case 0:n.createObjectStore(cr)}}})),oc}async function Do(n,e){const t=wa(n),s=(await ll()).transaction(cr,"readwrite"),i=s.objectStore(cr),o=await i.get(t);return await i.put(e,t),await s.done,(!o||o.fid!==e.fid)&&Bg(n,e.fid),e}async function $g(n){const e=wa(n),r=(await ll()).transaction(cr,"readwrite");await r.objectStore(cr).delete(e),await r.done}async function Ea(n,e){const t=wa(n),s=(await ll()).transaction(cr,"readwrite"),i=s.objectStore(cr),o=await i.get(t),c=e(o);return c===void 0?await i.delete(t):await i.put(c,t),await s.done,c&&(!o||o.fid!==c.fid)&&Bg(n,c.fid),c}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hl(n){let e;const t=await Ea(n.appConfig,r=>{const s=uC(r),i=lC(n,s);return e=i.registrationPromise,i.installationEntry});return t.fid===xc?{installationEntry:await e}:{installationEntry:t,registrationPromise:e}}function uC(n){const e=n||{fid:nC(),registrationStatus:0};return jg(e)}function lC(n,e){if(e.registrationStatus===0){if(!navigator.onLine){const s=Promise.reject(ar.create("app-offline"));return{installationEntry:e,registrationPromise:s}}const t={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=hC(n,t);return{installationEntry:t,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:dC(n)}:{installationEntry:e}}async function hC(n,e){try{const t=await Zb(n,e);return Do(n.appConfig,t)}catch(t){throw Vg(t)&&t.customData.serverCode===409?await $g(n.appConfig):await Do(n.appConfig,{fid:e.fid,registrationStatus:0}),t}}async function dC(n){let e=await Zd(n.appConfig);for(;e.registrationStatus===1;)await Mg(100),e=await Zd(n.appConfig);if(e.registrationStatus===0){const{installationEntry:t,registrationPromise:r}=await hl(n);return r||t}return e}function Zd(n){return Ea(n,e=>{if(!e)throw ar.create("installation-not-found");return jg(e)})}function jg(n){return fC(n)?{fid:n.fid,registrationStatus:0}:n}function fC(n){return n.registrationStatus===1&&n.registrationTime+Cg<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function pC({appConfig:n,heartbeatServiceProvider:e},t){const r=mC(n,t),s=Yb(n,t),i=e.getImmediate({optional:!0});if(i){const h=await i.getHeartbeatsHeader();h&&s.append("x-firebase-client",h)}const o={installation:{sdkVersion:kg,appId:n.appId}},c={method:"POST",headers:s,body:JSON.stringify(o)},u=await Ug(()=>fetch(r,c));if(u.ok){const h=await u.json();return Dg(h)}else throw await xg("Generate Auth Token",u)}function mC(n,{fid:e}){return`${Og(n)}/${e}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dl(n,e=!1){let t;const r=await Ea(n.appConfig,i=>{if(!Wg(i))throw ar.create("not-registered");const o=i.authToken;if(!e&&yC(o))return i;if(o.requestStatus===1)return t=gC(n,e),i;{if(!navigator.onLine)throw ar.create("app-offline");const c=EC(i);return t=_C(n,c),c}});return t?await t:r.authToken}async function gC(n,e){let t=await ef(n.appConfig);for(;t.authToken.requestStatus===1;)await Mg(100),t=await ef(n.appConfig);const r=t.authToken;return r.requestStatus===0?dl(n,e):r}function ef(n){return Ea(n,e=>{if(!Wg(e))throw ar.create("not-registered");const t=e.authToken;return IC(t)?{...e,authToken:{requestStatus:0}}:e})}async function _C(n,e){try{const t=await pC(n,e),r={...e,authToken:t};return await Do(n.appConfig,r),t}catch(t){if(Vg(t)&&(t.customData.serverCode===401||t.customData.serverCode===404))await $g(n.appConfig);else{const r={...e,authToken:{requestStatus:0}};await Do(n.appConfig,r)}throw t}}function Wg(n){return n!==void 0&&n.registrationStatus===2}function yC(n){return n.requestStatus===2&&!wC(n)}function wC(n){const e=Date.now();return e<n.creationTime||n.creationTime+n.expiresIn<e+Gb}function EC(n){const e={requestStatus:1,requestTime:Date.now()};return{...n,authToken:e}}function IC(n){return n.requestStatus===1&&n.requestTime+Cg<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function TC(n){const e=n,{installationEntry:t,registrationPromise:r}=await hl(e);return r?r.catch(console.error):dl(e).catch(console.error),t.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function vC(n,e=!1){const t=n;return await AC(t),(await dl(t,e)).token}async function AC(n){const{registrationPromise:e}=await hl(n);e&&await e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function RC(n){if(!n||!n.options)throw ac("App Configuration");if(!n.name)throw ac("App Name");const e=["projectId","apiKey","appId"];for(const t of e)if(!n.options[t])throw ac(t);return{appName:n.name,projectId:n.options.projectId,apiKey:n.options.apiKey,appId:n.options.appId}}function ac(n){return ar.create("missing-app-config-values",{valueName:n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hg="installations",PC="installations-internal",SC=n=>{const e=n.getProvider("app").getImmediate(),t=RC(e),r=Gt(e,"heartbeat");return{app:e,appConfig:t,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},bC=n=>{const e=n.getProvider("app").getImmediate(),t=Gt(e,Hg).getImmediate();return{getId:()=>TC(t),getToken:s=>vC(t,s)}};function CC(){Tt(new mt(Hg,SC,"PUBLIC")),Tt(new mt(PC,bC,"PRIVATE"))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */CC();$e(bg,ul);$e(bg,ul,"esm2020");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xo="analytics",kC="firebase_id",NC="origin",VC=60*1e3,OC="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",fl="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xe=new Uo("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const DC={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},Xe=new ur("analytics","Analytics",DC);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xC(n){if(!n.startsWith(fl)){const e=Xe.create("invalid-gtag-resource",{gtagURL:n});return xe.warn(e.message),""}return n}function Gg(n){return Promise.all(n.map(e=>e.catch(t=>t)))}function LC(n,e){let t;return window.trustedTypes&&(t=window.trustedTypes.createPolicy(n,e)),t}function UC(n,e){const t=LC("firebase-js-sdk-policy",{createScriptURL:xC}),r=document.createElement("script"),s=`${fl}?l=${n}&id=${e}`;r.src=t?t?.createScriptURL(s):s,r.async=!0,document.head.appendChild(r)}function MC(n){let e=[];return Array.isArray(window[n])?e=window[n]:window[n]=e,e}async function FC(n,e,t,r,s,i){const o=r[s];try{if(o)await e[o];else{const u=(await Gg(t)).find(h=>h.measurementId===s);u&&await e[u.appId]}}catch(c){xe.error(c)}n("config",s,i)}async function BC(n,e,t,r,s){try{let i=[];if(s&&s.send_to){let o=s.send_to;Array.isArray(o)||(o=[o]);const c=await Gg(t);for(const u of o){const h=c.find(m=>m.measurementId===u),f=h&&e[h.appId];if(f)i.push(f);else{i=[];break}}}i.length===0&&(i=Object.values(e)),await Promise.all(i),n("event",r,s||{})}catch(i){xe.error(i)}}function qC(n,e,t,r){async function s(i,...o){try{if(i==="event"){const[c,u]=o;await BC(n,e,t,c,u)}else if(i==="config"){const[c,u]=o;await FC(n,e,t,r,c,u)}else if(i==="consent"){const[c,u]=o;n("consent",c,u)}else if(i==="get"){const[c,u,h]=o;n("get",c,u,h)}else if(i==="set"){const[c]=o;n("set",c)}else n(i,...o)}catch(c){xe.error(c)}}return s}function $C(n,e,t,r,s){let i=function(...o){window[r].push(arguments)};return window[s]&&typeof window[s]=="function"&&(i=window[s]),window[s]=qC(i,n,e,t),{gtagCore:i,wrappedGtag:window[s]}}function jC(n){const e=window.document.getElementsByTagName("script");for(const t of Object.values(e))if(t.src&&t.src.includes(fl)&&t.src.includes(n))return t;return null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WC=30,HC=1e3;class GC{constructor(e={},t=HC){this.throttleMetadata=e,this.intervalMillis=t}getThrottleMetadata(e){return this.throttleMetadata[e]}setThrottleMetadata(e,t){this.throttleMetadata[e]=t}deleteThrottleMetadata(e){delete this.throttleMetadata[e]}}const zg=new GC;function zC(n){return new Headers({Accept:"application/json","x-goog-api-key":n})}async function KC(n){const{appId:e,apiKey:t}=n,r={method:"GET",headers:zC(t)},s=OC.replace("{app-id}",e),i=await fetch(s,r);if(i.status!==200&&i.status!==304){let o="";try{const c=await i.json();c.error?.message&&(o=c.error.message)}catch{}throw Xe.create("config-fetch-failed",{httpStatus:i.status,responseMessage:o})}return i.json()}async function QC(n,e=zg,t){const{appId:r,apiKey:s,measurementId:i}=n.options;if(!r)throw Xe.create("no-app-id");if(!s){if(i)return{measurementId:i,appId:r};throw Xe.create("no-api-key")}const o=e.getThrottleMetadata(r)||{backoffCount:0,throttleEndTimeMillis:Date.now()},c=new XC;return setTimeout(async()=>{c.abort()},VC),Kg({appId:r,apiKey:s,measurementId:i},o,c,e)}async function Kg(n,{throttleEndTimeMillis:e,backoffCount:t},r,s=zg){const{appId:i,measurementId:o}=n;try{await YC(r,e)}catch(c){if(o)return xe.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${o} provided in the "measurementId" field in the local Firebase config. [${c?.message}]`),{appId:i,measurementId:o};throw c}try{const c=await KC(n);return s.deleteThrottleMetadata(i),c}catch(c){const u=c;if(!JC(u)){if(s.deleteThrottleMetadata(i),o)return xe.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${o} provided in the "measurementId" field in the local Firebase config. [${u?.message}]`),{appId:i,measurementId:o};throw c}const h=Number(u?.customData?.httpStatus)===503?_h(t,s.intervalMillis,WC):_h(t,s.intervalMillis),f={throttleEndTimeMillis:Date.now()+h,backoffCount:t+1};return s.setThrottleMetadata(i,f),xe.debug(`Calling attemptFetch again in ${h} millis`),Kg(n,f,r,s)}}function YC(n,e){return new Promise((t,r)=>{const s=Math.max(e-Date.now(),0),i=setTimeout(t,s);n.addEventListener(()=>{clearTimeout(i),r(Xe.create("fetch-throttle",{throttleEndTimeMillis:e}))})})}function JC(n){if(!(n instanceof gt)||!n.customData)return!1;const e=Number(n.customData.httpStatus);return e===429||e===500||e===503||e===504}class XC{constructor(){this.listeners=[]}addEventListener(e){this.listeners.push(e)}abort(){this.listeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Lc;async function ZC(n,e,t,r,s){if(s&&s.global){n("event",t,r);return}else{const i=await e,o={...r,send_to:i};n("event",t,o)}}async function ek(n,e,t,r){if(r&&r.global)return n("set",{screen_name:t}),Promise.resolve();{const s=await e;n("config",s,{update:!0,screen_name:t})}}async function tk(n,e,t,r){if(r&&r.global)return n("set",{user_id:t}),Promise.resolve();{const s=await e;n("config",s,{update:!0,user_id:t})}}async function nk(n,e,t,r){if(r&&r.global){const s={};for(const i of Object.keys(t))s[`user_properties.${i}`]=t[i];return n("set",s),Promise.resolve()}else{const s=await e;n("config",s,{update:!0,user_properties:t})}}async function rk(n,e){const t=await e;return new Promise((r,s)=>{n("get",t,"client_id",i=>{i||s(Xe.create("no-client-id")),r(i)})})}async function sk(n,e){const t=await n;window[`ga-disable-${t}`]=!e}let Uc;function Qg(n){Uc=n}function Yg(n){Lc=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ik(){if($c())try{await jc()}catch(n){return xe.warn(Xe.create("indexeddb-unavailable",{errorInfo:n?.toString()}).message),!1}else return xe.warn(Xe.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function ok(n,e,t,r,s,i,o){const c=QC(n);c.then(y=>{t[y.measurementId]=y.appId,n.options.measurementId&&y.measurementId!==n.options.measurementId&&xe.warn(`The measurement ID in the local Firebase config (${n.options.measurementId}) does not match the measurement ID fetched from the server (${y.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(y=>xe.error(y)),e.push(c);const u=ik().then(y=>{if(y)return r.getId()}),[h,f]=await Promise.all([c,u]);jC(i)||UC(i,h.measurementId),Uc&&(s("consent","default",Uc),Qg(void 0)),s("js",new Date);const m=o?.config??{};return m[NC]="firebase",m.update=!0,f!=null&&(m[kC]=f),s("config",h.measurementId,m),Lc&&(s("set",Lc),Yg(void 0)),h.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ak{constructor(e){this.app=e}_delete(){return delete Ft[this.app.options.appId],Promise.resolve()}}let Ft={},tf=[];const nf={};let co="dataLayer",Jg="gtag",rf,Wt,Mc=!1;function ck(n){if(Mc)throw Xe.create("already-initialized");n.dataLayerName&&(co=n.dataLayerName),n.gtagName&&(Jg=n.gtagName)}function uk(){const n=[];if(qc()&&n.push("This is a browser extension environment."),gf()||n.push("Cookies are not available."),n.length>0){const e=n.map((r,s)=>`(${s+1}) ${r}`).join(" "),t=Xe.create("invalid-analytics-context",{errorInfo:e});xe.warn(t.message)}}function lk(n,e,t){uk();const r=n.options.appId;if(!r)throw Xe.create("no-app-id");if(!n.options.apiKey)if(n.options.measurementId)xe.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${n.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw Xe.create("no-api-key");if(Ft[r]!=null)throw Xe.create("already-exists",{id:r});if(!Mc){MC(co);const{wrappedGtag:i,gtagCore:o}=$C(Ft,tf,nf,co,Jg);Wt=i,rf=o,Mc=!0}return Ft[r]=ok(n,tf,nf,e,rf,co,t),new ak(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hk(n=ui()){n=$(n);const e=Gt(n,xo);return e.isInitialized()?e.getImmediate():Xg(n)}function Xg(n,e={}){const t=Gt(n,xo);if(t.isInitialized()){const s=t.getImmediate();if(rn(e,t.getOptions()))return s;throw Xe.create("already-initialized")}return t.initialize({options:e})}async function dk(){if(qc()||!gf()||!$c())return!1;try{return await jc()}catch{return!1}}function fk(n,e,t){n=$(n),ek(Wt,Ft[n.app.options.appId],e,t).catch(r=>xe.error(r))}async function pk(n){return n=$(n),rk(Wt,Ft[n.app.options.appId])}function mk(n,e,t){n=$(n),tk(Wt,Ft[n.app.options.appId],e,t).catch(r=>xe.error(r))}function Zg(n,e,t){n=$(n),nk(Wt,Ft[n.app.options.appId],e,t).catch(r=>xe.error(r))}function gk(n,e){n=$(n),sk(Ft[n.app.options.appId],e).catch(t=>xe.error(t))}function _k(n){Wt?Wt("set",n):Yg(n)}function e_(n,e,t,r){n=$(n),ZC(Wt,Ft[n.app.options.appId],e,t,r).catch(s=>xe.error(s))}function yk(n){Wt?Wt("consent","update",n):Qg(n)}const sf="@firebase/analytics",of="0.10.23";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wk(){Tt(new mt(xo,(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("installations-internal").getImmediate();return lk(r,s,t)},"PUBLIC")),Tt(new mt("analytics-internal",n,"PRIVATE")),$e(sf,of),$e(sf,of,"esm2020");function n(e){try{const t=e.getProvider(xo).getImmediate();return{logEvent:(r,s,i)=>e_(t,r,s,i),setUserProperties:(r,s)=>Zg(t,r,s)}}catch(t){throw Xe.create("interop-component-reg-failed",{reason:t})}}}wk();const iN=Object.freeze(Object.defineProperty({__proto__:null,getAnalytics:hk,getGoogleAnalyticsClientId:pk,initializeAnalytics:Xg,isSupported:dk,logEvent:e_,setAnalyticsCollectionEnabled:gk,setConsent:yk,setCurrentScreen:fk,setDefaultEventParameters:_k,setUserId:mk,setUserProperties:Zg,settings:ck},Symbol.toStringTag,{value:"Module"}));var Sr;(function(n){n.IndexedDbLocal="INDEXED_DB_LOCAL",n.InMemory="IN_MEMORY",n.BrowserLocal="BROWSER_LOCAL",n.BrowserSession="BROWSER_SESSION"})(Sr||(Sr={}));var wn;(function(n){n.APPLE="apple.com",n.FACEBOOK="facebook.com",n.GAME_CENTER="gc.apple.com",n.GITHUB="github.com",n.GOOGLE="google.com",n.MICROSOFT="microsoft.com",n.PLAY_GAMES="playgames.google.com",n.TWITTER="twitter.com",n.YAHOO="yahoo.com",n.PASSWORD="password",n.PHONE="phone"})(wn||(wn={}));const oN=O_("FirebaseAuthentication",{web:()=>D_(()=>Promise.resolve().then(()=>Ek),void 0).then(n=>new n.FirebaseAuthenticationWeb)});class te extends x_{constructor(){super(),this.lastConfirmationResult=new Map;const e=X();e.onAuthStateChanged(t=>this.handleAuthStateChange(t)),e.onIdTokenChanged(t=>void this.handleIdTokenChange(t))}async applyActionCode(e){const t=X();return gE(t,e.oobCode)}async createUserWithEmailAndPassword(e){const t=X(),r=await _E(t,e.email,e.password);return this.createSignInResult(r,null)}async confirmPasswordReset(e){const t=X();return mE(t,e.oobCode,e.newPassword)}async confirmVerificationCode(e){const{verificationCode:t,verificationId:r}=e,s=this.lastConfirmationResult.get(r);if(!s)throw new Error(te.ERROR_CONFIRMATION_RESULT_MISSING);const i=await s.confirm(t);return this.createSignInResult(i,null)}async deleteUser(){const t=X().currentUser;if(!t)throw new Error(te.ERROR_NO_USER_SIGNED_IN);return FE(t)}async fetchSignInMethodsForEmail(e){const t=X();return{signInMethods:await vE(t,e.email)}}async getPendingAuthResult(){this.throwNotAvailableError()}async getCurrentUser(){const e=X();return{user:this.createUserResult(e.currentUser)}}async getIdToken(e){const t=X();if(!t.currentUser)throw new Error(te.ERROR_NO_USER_SIGNED_IN);return{token:await t.currentUser.getIdToken(e?.forceRefresh)||""}}async getRedirectResult(){const e=X(),t=await II(e),r=t?me.credentialFromResult(t):null;return this.createSignInResult(t,r)}async getTenantId(){return{tenantId:X().tenantId}}async isSignInWithEmailLink(e){const t=X();return{isSignInWithEmailLink:EE(t,e.emailLink)}}async linkWithApple(e){const t=new me(wn.APPLE);this.applySignInOptions(e||{},t);const r=await this.linkCurrentUserWithPopupOrRedirect(t,e?.mode),s=me.credentialFromResult(r);return this.createSignInResult(r,s)}async linkWithEmailAndPassword(e){const t=an.credential(e.email,e.password),r=await this.linkCurrentUserWithCredential(t);return this.createSignInResult(r,t)}async linkWithEmailLink(e){const t=an.credentialWithLink(e.email,e.emailLink),r=await this.linkCurrentUserWithCredential(t);return this.createSignInResult(r,t)}async linkWithFacebook(e){const t=new yt;this.applySignInOptions(e||{},t);const r=await this.linkCurrentUserWithPopupOrRedirect(t,e?.mode),s=yt.credentialFromResult(r);return this.createSignInResult(r,s)}async linkWithGameCenter(){this.throwNotAvailableError()}async linkWithGithub(e){const t=new Et;this.applySignInOptions(e||{},t);const r=await this.linkCurrentUserWithPopupOrRedirect(t,e?.mode),s=Et.credentialFromResult(r);return this.createSignInResult(r,s)}async linkWithGoogle(e){const t=new wt;this.applySignInOptions(e||{},t);const r=await this.linkCurrentUserWithPopupOrRedirect(t,e?.mode),s=wt.credentialFromResult(r);return this.createSignInResult(r,s)}async linkWithMicrosoft(e){const t=new me(wn.MICROSOFT);this.applySignInOptions(e||{},t);const r=await this.linkCurrentUserWithPopupOrRedirect(t,e?.mode),s=me.credentialFromResult(r);return this.createSignInResult(r,s)}async linkWithOpenIdConnect(e){const t=new me(e.providerId);this.applySignInOptions(e,t);const r=await this.linkCurrentUserWithPopupOrRedirect(t,e.mode),s=me.credentialFromResult(r);return this.createSignInResult(r,s)}async linkWithPhoneNumber(e){const r=X().currentUser;if(!r)throw new Error(te.ERROR_NO_USER_SIGNED_IN);if(!e.phoneNumber)throw new Error(te.ERROR_PHONE_NUMBER_MISSING);if(!e.recaptchaVerifier||!(e.recaptchaVerifier instanceof Mh))throw new Error(te.ERROR_RECAPTCHA_VERIFIER_MISSING);try{const s=await oI(r,e.phoneNumber,e.recaptchaVerifier),{verificationId:i}=s;this.lastConfirmationResult.set(i,s);const o={verificationId:i};this.notifyListeners(te.PHONE_CODE_SENT_EVENT,o)}catch(s){const i={message:this.getErrorMessage(s)};this.notifyListeners(te.PHONE_VERIFICATION_FAILED_EVENT,i)}}async linkWithPlayGames(){this.throwNotAvailableError()}async linkWithTwitter(e){const t=new It;this.applySignInOptions(e||{},t);const r=await this.linkCurrentUserWithPopupOrRedirect(t,e?.mode),s=It.credentialFromResult(r);return this.createSignInResult(r,s)}async linkWithYahoo(e){const t=new me(wn.YAHOO);this.applySignInOptions(e||{},t);const r=await this.linkCurrentUserWithPopupOrRedirect(t,e?.mode),s=me.credentialFromResult(r);return this.createSignInResult(r,s)}async reload(){const t=X().currentUser;if(!t)throw new Error(te.ERROR_NO_USER_SIGNED_IN);return Sf(t)}async revokeAccessToken(e){const t=X();return ME(t,e.token)}async sendEmailVerification(e){const r=X().currentUser;if(!r)throw new Error(te.ERROR_NO_USER_SIGNED_IN);return AE(r,e?.actionCodeSettings)}async sendPasswordResetEmail(e){const t=X();return pE(t,e.email,e.actionCodeSettings)}async sendSignInLinkToEmail(e){const t=X();return wE(t,e.email,e.actionCodeSettings)}async setLanguageCode(e){const t=X();t.languageCode=e.languageCode}async setPersistence(e){const t=X();switch(e.persistence){case Sr.BrowserLocal:await $i(t,Jf);break;case Sr.BrowserSession:await $i(t,Xc);break;case Sr.IndexedDbLocal:await $i(t,rp);break;case Sr.InMemory:await $i(t,dc);break}}async setTenantId(e){const t=X();t.tenantId=e.tenantId}async signInAnonymously(){const e=X(),t=await uE(e);return this.createSignInResult(t,null)}async signInWithApple(e){const t=new me(wn.APPLE);this.applySignInOptions(e||{},t);const r=await this.signInWithPopupOrRedirect(t,e?.mode),s=me.credentialFromResult(r);return this.createSignInResult(r,s)}async signInWithCustomToken(e){const t=X(),r=await fE(t,e.token);return this.createSignInResult(r,null)}async signInWithEmailAndPassword(e){const t=X(),r=await yE(t,e.email,e.password);return this.createSignInResult(r,null)}async signInWithEmailLink(e){const t=X(),r=await IE(t,e.email,e.emailLink);return this.createSignInResult(r,null)}async signInWithFacebook(e){const t=new yt;this.applySignInOptions(e||{},t);const r=await this.signInWithPopupOrRedirect(t,e?.mode),s=yt.credentialFromResult(r);return this.createSignInResult(r,s)}async signInWithGithub(e){const t=new Et;this.applySignInOptions(e||{},t);const r=await this.signInWithPopupOrRedirect(t,e?.mode),s=Et.credentialFromResult(r);return this.createSignInResult(r,s)}async signInWithGoogle(e){const t=new wt;this.applySignInOptions(e||{},t);const r=await this.signInWithPopupOrRedirect(t,e?.mode),s=wt.credentialFromResult(r);return this.createSignInResult(r,s)}async signInWithMicrosoft(e){const t=new me(wn.MICROSOFT);this.applySignInOptions(e||{},t);const r=await this.signInWithPopupOrRedirect(t,e?.mode),s=me.credentialFromResult(r);return this.createSignInResult(r,s)}async signInWithOpenIdConnect(e){const t=new me(e.providerId);this.applySignInOptions(e,t);const r=await this.signInWithPopupOrRedirect(t,e.mode),s=me.credentialFromResult(r);return this.createSignInResult(r,s)}async signInWithPhoneNumber(e){if(!e.phoneNumber)throw new Error(te.ERROR_PHONE_NUMBER_MISSING);if(!e.recaptchaVerifier||!(e.recaptchaVerifier instanceof Mh))throw new Error(te.ERROR_RECAPTCHA_VERIFIER_MISSING);const t=X();try{const r=await iI(t,e.phoneNumber,e.recaptchaVerifier),{verificationId:s}=r;this.lastConfirmationResult.set(s,r);const i={verificationId:s};this.notifyListeners(te.PHONE_CODE_SENT_EVENT,i)}catch(r){const s={message:this.getErrorMessage(r)};this.notifyListeners(te.PHONE_VERIFICATION_FAILED_EVENT,s)}}async signInWithPlayGames(){this.throwNotAvailableError()}async signInWithGameCenter(){this.throwNotAvailableError()}async signInWithTwitter(e){const t=new It;this.applySignInOptions(e||{},t);const r=await this.signInWithPopupOrRedirect(t,e?.mode),s=It.credentialFromResult(r);return this.createSignInResult(r,s)}async signInWithYahoo(e){const t=new me(wn.YAHOO);this.applySignInOptions(e||{},t);const r=await this.signInWithPopupOrRedirect(t,e?.mode),s=me.credentialFromResult(r);return this.createSignInResult(r,s)}async signOut(){await X().signOut()}async unlink(e){const t=X();if(!t.currentUser)throw new Error(te.ERROR_NO_USER_SIGNED_IN);const r=await lE(t.currentUser,e.providerId);return{user:this.createUserResult(r)}}async updateEmail(e){const r=X().currentUser;if(!r)throw new Error(te.ERROR_NO_USER_SIGNED_IN);return bE(r,e.newEmail)}async updatePassword(e){const r=X().currentUser;if(!r)throw new Error(te.ERROR_NO_USER_SIGNED_IN);return CE(r,e.newPassword)}async updateProfile(e){const r=X().currentUser;if(!r)throw new Error(te.ERROR_NO_USER_SIGNED_IN);return SE(r,{displayName:e.displayName,photoURL:e.photoUrl})}async useAppLanguage(){X().useDeviceLanguage()}async useEmulator(e){const t=X(),r=e.port||9099,s=e.scheme||"http";e.host.includes("://")?fc(t,`${e.host}:${r}`):fc(t,`${s}://${e.host}:${r}`)}async verifyBeforeUpdateEmail(e){const r=X().currentUser;if(!r)throw new Error(te.ERROR_NO_USER_SIGNED_IN);return RE(r,e?.newEmail,e?.actionCodeSettings)}handleAuthStateChange(e){const r={user:this.createUserResult(e)};this.notifyListeners(te.AUTH_STATE_CHANGE_EVENT,r,!0)}async handleIdTokenChange(e){if(!e)return;const r={token:await e.getIdToken(!1)};this.notifyListeners(te.ID_TOKEN_CHANGE_EVENT,r,!0)}applySignInOptions(e,t){if(e.customParameters){const r={};e.customParameters.map(s=>{r[s.key]=s.value}),t.setCustomParameters(r)}if(e.scopes)for(const r of e.scopes)t.addScope(r)}signInWithPopupOrRedirect(e,t){const r=X();return t==="redirect"?_I(r,e):hI(r,e)}linkCurrentUserWithPopupOrRedirect(e,t){const r=X();if(!r.currentUser)throw new Error(te.ERROR_NO_USER_SIGNED_IN);return t==="redirect"?wI(r.currentUser,e):dI(r.currentUser,e)}linkCurrentUserWithCredential(e){const t=X();if(!t.currentUser)throw new Error(te.ERROR_NO_USER_SIGNED_IN);return Gf(t.currentUser,e)}createSignInResult(e,t){const r=this.createUserResult(e?.user||null),s=this.createCredentialResult(t),i=this.createAdditionalUserInfoResult(e);return{user:r,credential:s,additionalUserInfo:i}}createCredentialResult(e){if(!e)return null;const t={providerId:e.providerId};return e instanceof Bt&&(t.accessToken=e.accessToken,t.idToken=e.idToken,t.secret=e.secret),t}createUserResult(e){return e?{displayName:e.displayName,email:e.email,emailVerified:e.emailVerified,isAnonymous:e.isAnonymous,metadata:this.createUserMetadataResult(e.metadata),phoneNumber:e.phoneNumber,photoUrl:e.photoURL,providerData:this.createUserProviderDataResult(e.providerData),providerId:e.providerId,tenantId:e.tenantId,uid:e.uid}:null}createUserMetadataResult(e){const t={};return e.creationTime&&(t.creationTime=Date.parse(e.creationTime)),e.lastSignInTime&&(t.lastSignInTime=Date.parse(e.lastSignInTime)),t}createUserProviderDataResult(e){return e.map(t=>({displayName:t.displayName,email:t.email,phoneNumber:t.phoneNumber,photoUrl:t.photoURL,providerId:t.providerId,uid:t.uid}))}createAdditionalUserInfoResult(e){if(!e)return null;const t=xE(e);if(!t)return null;const{isNewUser:r,profile:s,providerId:i,username:o}=t,c={isNewUser:r};return i!==null&&(c.providerId=i),s!==null&&(c.profile=s),o!=null&&(c.username=o),c}getErrorMessage(e){return e instanceof Object&&"message"in e&&typeof e.message=="string"?e.message:JSON.stringify(e)}throwNotAvailableError(){throw new Error("Not available on web.")}}te.AUTH_STATE_CHANGE_EVENT="authStateChange";te.ID_TOKEN_CHANGE_EVENT="idTokenChange";te.PHONE_CODE_SENT_EVENT="phoneCodeSent";te.PHONE_VERIFICATION_FAILED_EVENT="phoneVerificationFailed";te.ERROR_NO_USER_SIGNED_IN="No user is signed in.";te.ERROR_PHONE_NUMBER_MISSING="phoneNumber must be provided.";te.ERROR_RECAPTCHA_VERIFIER_MISSING="recaptchaVerifier must be provided and must be an instance of RecaptchaVerifier.";te.ERROR_CONFIRMATION_RESULT_MISSING="No confirmation result with this verification id was found.";const Ek=Object.freeze(Object.defineProperty({__proto__:null,FirebaseAuthenticationWeb:te},Symbol.toStringTag,{value:"Module"}));export{zk as A,Hk as B,Gk as C,Fk as D,rN as E,Xk as F,tN as G,nN as H,Jk as I,Kk as J,Zk as K,Yc as L,oN as M,iI as N,wt as O,Vr as P,hI as Q,_I as R,Mh as S,oe as T,SE as U,Rk as V,FE as W,eN as X,iN as Y,ui as a,X as b,qw as c,ZI as d,Jf as e,Ok as f,Tk as g,Dk as h,zy as i,Pk as j,sN as k,dA as l,Ak as m,Qk as n,kk as o,jk as p,vk as q,$k as r,Nk as s,Uk as t,Yk as u,II as v,Mk as w,Wk as x,Sk as y,Bk as z};
