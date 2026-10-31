(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(n){if(n.ep)return;n.ep=!0;const s=t(n);fetch(n.href,s)}})();/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Ho="187",nh=0,Sl=1,sh=2,Ua=1,Gc=2,Ns=3,Dn=0,Vt=1,pt=2,ns=0,ks=1,ft=2,bl=3,wl=4,ah=5,is=100,rh=101,oh=102,lh=103,ch=104,dh=200,hh=201,uh=202,fh=203,Vc=204,Wc=205,ph=206,mh=207,gh=208,vh=209,xh=210,_h=211,yh=212,Mh=213,Sh=214,Xr=0,Yr=1,Kr=2,Ws=3,Zr=4,Jr=5,Qr=6,jr=7,qc=0,bh=1,wh=2,ji=0,$c=1,Xc=2,Yc=3,Go=4,Kc=5,Zc=6,Jc=7,Qc=300,rs=301,qs=302,cr=303,dr=304,eo=1e3,Ji=1001,to=1002,Nt=1003,Eh=1004,ia=1005,oi=1006,hr=1007,pn=1008,hi=1009,jc=1010,ed=1011,$s=1012,Vo=1013,Bi=1014,Ai=1015,Hi=1016,Wo=1017,qo=1018,os=1020,td=35902,id=35899,nd=1021,sd=1022,Fi=1023,gn=1026,mn=1027,ir=1028,$o=1029,In=1030,Xo=1031,Yo=1033,Fa=33776,za=33777,Oa=33778,ka=33779,io=35840,no=35841,so=35842,ao=35843,ro=36196,oo=37492,lo=37496,co=37488,ho=37489,Ga=37490,uo=37491,fo=37808,po=37809,mo=37810,go=37811,vo=37812,xo=37813,_o=37814,yo=37815,Mo=37816,So=37817,bo=37818,wo=37819,Eo=37820,Ao=37821,To=36492,Co=36494,Ro=36495,Po=36283,Lo=36284,Va=36285,Do=36286,Ah=3200,Wa=0,Th=1,un="",Kt="srgb",qa="srgb-linear",$a="linear",dt="srgb",ur=7680,Ch=519,Rh=512,Ph=513,Lh=514,ad=515,Dh=516,Ih=517,rd=518,od=519,ld=35044,El="300 es",Ti=2e3,Xs=2001;function Nh(a){for(let e=a.length-1;e>=0;--e)if(a[e]>=65535)return!0;return!1}function Xa(a){return document.createElementNS("http://www.w3.org/1999/xhtml",a)}function Uh(){const a=Xa("canvas");return a.style.display="block",a}const Al={};function Ya(...a){const e="THREE."+a.shift();console.log(e,...a)}function cd(a){const e=a[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=a[1];t&&t.isStackTrace?a[0]+=" "+t.getLocation():a[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return a}function He(...a){a=cd(a);const e="THREE."+a.shift();{const t=a[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...a)}}function ot(...a){a=cd(a);const e="THREE."+a.shift();{const t=a[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...a)}}function Ba(...a){const e=a.join(" ");e in Al||(Al[e]=!0,He(...a))}function Fh(a,e,t){return new Promise(function(i,n){function s(){switch(a.clientWaitSync(e,a.SYNC_FLUSH_COMMANDS_BIT,0)){case a.WAIT_FAILED:n();break;case a.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}const zh={[Xr]:Xr,[Kr]:Qr,[Zr]:Zr,[Ws]:Jr,[Yr]:Yr,[Qr]:Kr,[jr]:jr,[Jr]:Ws};class Fn{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const n=i[e];if(n!==void 0){const s=n.indexOf(t);s!==-1&&n.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const n=i.slice(0);for(let s=0,r=n.length;s<r;s++)n[s].call(this,e);e.target=null}}}const $t=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],fr=Math.PI/180,Io=180/Math.PI;function xn(){const a=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return($t[a&255]+$t[a>>8&255]+$t[a>>16&255]+$t[a>>24&255]+"-"+$t[e&255]+$t[e>>8&255]+"-"+$t[e>>16&15|64]+$t[e>>24&255]+"-"+$t[t&63|128]+$t[t>>8&255]+"-"+$t[t>>16&255]+$t[t>>24&255]+$t[i&255]+$t[i>>8&255]+$t[i>>16&255]+$t[i>>24&255]).toLowerCase()}function et(a,e,t){return Math.max(e,Math.min(t,a))}function Oh(a,e){return(a%e+e)%e}function pr(a,e,t){return(1-t)*a+t*e}function kh(a){return Math.pow(2,Math.floor(Math.log(a)/Math.LN2))}function nr(a){switch(a.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function dd(a,e){if(e.constructor===Float32Array)return a;const t=nr(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(a/t,-1)}function hd(a,e){if(e.constructor===Float32Array)return a;const t=nr(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(a*t)}const ol=class ol{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,n=e.elements;return this.x=n[0]*t+n[3]*i+n[6],this.y=n[1]*t+n[4]*i+n[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(et(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(et(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),n=Math.sin(t),s=this.x-e.x,r=this.y-e.y;return this.x=s*i-r*n+e.x,this.y=s*n+r*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};ol.prototype.isVector2=!0;let xe=ol;class ps{constructor(e=0,t=0,i=0,n=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=n}static slerpFlat(e,t,i,n,s,r,o){let c=i[n+0],l=i[n+1],d=i[n+2],h=i[n+3],u=s[r+0],f=s[r+1],p=s[r+2],v=s[r+3];if(h!==v||c!==u||l!==f||d!==p){let g=c*u+l*f+d*p+h*v;g<0&&(u=-u,f=-f,p=-p,v=-v,g=-g);let m=1-o;if(g<.9995){const _=Math.acos(g),M=Math.sin(_);m=Math.sin(m*_)/M,o=Math.sin(o*_)/M,c=c*m+u*o,l=l*m+f*o,d=d*m+p*o,h=h*m+v*o}else{c=c*m+u*o,l=l*m+f*o,d=d*m+p*o,h=h*m+v*o;const _=1/Math.sqrt(c*c+l*l+d*d+h*h);c*=_,l*=_,d*=_,h*=_}}e[t]=c,e[t+1]=l,e[t+2]=d,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,n,s,r){const o=i[n],c=i[n+1],l=i[n+2],d=i[n+3],h=s[r],u=s[r+1],f=s[r+2],p=s[r+3];return e[t]=o*p+d*h+c*f-l*u,e[t+1]=c*p+d*u+l*h-o*f,e[t+2]=l*p+d*f+o*u-c*h,e[t+3]=d*p-o*h-c*u-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,n){return this._x=e,this._y=t,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,n=e._y,s=e._z,r=e._order,o=Math.cos,c=Math.sin,l=o(i/2),d=o(n/2),h=o(s/2),u=c(i/2),f=c(n/2),p=c(s/2);switch(r){case"XYZ":this._x=u*d*h+l*f*p,this._y=l*f*h-u*d*p,this._z=l*d*p+u*f*h,this._w=l*d*h-u*f*p;break;case"YXZ":this._x=u*d*h+l*f*p,this._y=l*f*h-u*d*p,this._z=l*d*p-u*f*h,this._w=l*d*h+u*f*p;break;case"ZXY":this._x=u*d*h-l*f*p,this._y=l*f*h+u*d*p,this._z=l*d*p+u*f*h,this._w=l*d*h-u*f*p;break;case"ZYX":this._x=u*d*h-l*f*p,this._y=l*f*h+u*d*p,this._z=l*d*p-u*f*h,this._w=l*d*h+u*f*p;break;case"YZX":this._x=u*d*h+l*f*p,this._y=l*f*h+u*d*p,this._z=l*d*p-u*f*h,this._w=l*d*h-u*f*p;break;case"XZY":this._x=u*d*h-l*f*p,this._y=l*f*h-u*d*p,this._z=l*d*p+u*f*h,this._w=l*d*h+u*f*p;break;default:He("Quaternion: .setFromEuler() encountered an unknown order: "+r)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,n=Math.sin(i);return this._x=e.x*n,this._y=e.y*n,this._z=e.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],n=t[4],s=t[8],r=t[1],o=t[5],c=t[9],l=t[2],d=t[6],h=t[10],u=i+o+h;if(u>0){const f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(d-c)*f,this._y=(s-l)*f,this._z=(r-n)*f}else if(i>o&&i>h){const f=2*Math.sqrt(1+i-o-h);this._w=(d-c)/f,this._x=.25*f,this._y=(n+r)/f,this._z=(s+l)/f}else if(o>h){const f=2*Math.sqrt(1+o-i-h);this._w=(s-l)/f,this._x=(n+r)/f,this._y=.25*f,this._z=(c+d)/f}else{const f=2*Math.sqrt(1+h-i-o);this._w=(r-n)/f,this._x=(s+l)/f,this._y=(c+d)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(et(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const n=Math.min(1,t/i);return this.slerp(e,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,n=e._y,s=e._z,r=e._w,o=t._x,c=t._y,l=t._z,d=t._w;return this._x=i*d+r*o+n*l-s*c,this._y=n*d+r*c+s*o-i*l,this._z=s*d+r*l+i*c-n*o,this._w=r*d-i*o-n*c-s*l,this._onChangeCallback(),this}slerp(e,t){let i=e._x,n=e._y,s=e._z,r=e._w,o=this.dot(e);o<0&&(i=-i,n=-n,s=-s,r=-r,o=-o);let c=1-t;if(o<.9995){const l=Math.acos(o),d=Math.sin(l);c=Math.sin(c*l)/d,t=Math.sin(t*l)/d,this._x=this._x*c+i*t,this._y=this._y*c+n*t,this._z=this._z*c+s*t,this._w=this._w*c+r*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+n*t,this._z=this._z*c+s*t,this._w=this._w*c+r*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(n*Math.sin(e),n*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const ll=class ll{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Tl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Tl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,n=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*n,this.y=s[1]*t+s[4]*i+s[7]*n,this.z=s[2]*t+s[5]*i+s[8]*n,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,n=this.z,s=e.elements,r=1/(s[3]*t+s[7]*i+s[11]*n+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*n+s[12])*r,this.y=(s[1]*t+s[5]*i+s[9]*n+s[13])*r,this.z=(s[2]*t+s[6]*i+s[10]*n+s[14])*r,this}applyQuaternion(e){const t=this.x,i=this.y,n=this.z,s=e.x,r=e.y,o=e.z,c=e.w,l=2*(r*n-o*i),d=2*(o*t-s*n),h=2*(s*i-r*t);return this.x=t+c*l+r*h-o*d,this.y=i+c*d+o*l-s*h,this.z=n+c*h+s*d-r*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,n=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*n,this.y=s[1]*t+s[5]*i+s[9]*n,this.z=s[2]*t+s[6]*i+s[10]*n,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this.z=et(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this.z=et(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(et(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,n=e.y,s=e.z,r=t.x,o=t.y,c=t.z;return this.x=n*c-s*o,this.y=s*r-i*c,this.z=i*o-n*r,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return mr.copy(this).projectOnVector(e),this.sub(mr)}reflect(e){return this.sub(mr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(et(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,n=this.z-e.z;return t*t+i*i+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const n=Math.sin(t)*e;return this.x=n*Math.sin(i),this.y=Math.cos(t)*e,this.z=n*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),n=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=n,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};ll.prototype.isVector3=!0;let I=ll;const mr=new I,Tl=new ps,cl=class cl{constructor(e,t,i,n,s,r,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,n,s,r,o,c,l)}set(e,t,i,n,s,r,o,c,l){const d=this.elements;return d[0]=e,d[1]=n,d[2]=o,d[3]=t,d[4]=s,d[5]=c,d[6]=i,d[7]=r,d[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,n=t.elements,s=this.elements,r=i[0],o=i[3],c=i[6],l=i[1],d=i[4],h=i[7],u=i[2],f=i[5],p=i[8],v=n[0],g=n[3],m=n[6],_=n[1],M=n[4],y=n[7],A=n[2],E=n[5],x=n[8];return s[0]=r*v+o*_+c*A,s[3]=r*g+o*M+c*E,s[6]=r*m+o*y+c*x,s[1]=l*v+d*_+h*A,s[4]=l*g+d*M+h*E,s[7]=l*m+d*y+h*x,s[2]=u*v+f*_+p*A,s[5]=u*g+f*M+p*E,s[8]=u*m+f*y+p*x,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],r=e[4],o=e[5],c=e[6],l=e[7],d=e[8];return t*r*d-t*o*l-i*s*d+i*o*c+n*s*l-n*r*c}invert(){const e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],r=e[4],o=e[5],c=e[6],l=e[7],d=e[8],h=d*r-o*l,u=o*c-d*s,f=l*s-r*c,p=t*h+i*u+n*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/p;return e[0]=h*v,e[1]=(n*l-d*i)*v,e[2]=(o*i-n*r)*v,e[3]=u*v,e[4]=(d*t-n*c)*v,e[5]=(n*s-o*t)*v,e[6]=f*v,e[7]=(i*c-l*t)*v,e[8]=(r*t-i*s)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,n,s,r,o){const c=Math.cos(s),l=Math.sin(s);return this.set(i*c,i*l,-i*(c*r+l*o)+r+e,-n*l,n*c,-n*(-l*r+c*o)+o+t,0,0,1),this}scale(e,t){return Ba("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(gr.makeScale(e,t)),this}rotate(e){return Ba("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(gr.makeRotation(-e)),this}translate(e,t){return Ba("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(gr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let n=0;n<9;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};cl.prototype.isMatrix3=!0;let We=cl;const gr=new We,Cl=new We().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Rl=new We().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Bh(){const a={enabled:!0,workingColorSpace:qa,spaces:{},convert:function(n,s,r){return this.enabled===!1||s===r||!s||!r||(this.spaces[s].transfer===dt&&(n.r=en(n.r),n.g=en(n.g),n.b=en(n.b)),this.spaces[s].primaries!==this.spaces[r].primaries&&(n.applyMatrix3(this.spaces[s].toXYZ),n.applyMatrix3(this.spaces[r].fromXYZ)),this.spaces[r].transfer===dt&&(n.r=ss(n.r),n.g=ss(n.g),n.b=ss(n.b))),n},workingToColorSpace:function(n,s){return this.convert(n,this.workingColorSpace,s)},colorSpaceToWorking:function(n,s){return this.convert(n,s,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===un?$a:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,s=this.workingColorSpace){return n.fromArray(this.spaces[s].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,s,r){return n.copy(this.spaces[r].fromXYZ).multiply(this.spaces[s].toXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return a.define({[qa]:{primaries:e,whitePoint:i,transfer:$a,toXYZ:Cl,fromXYZ:Rl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Kt},outputColorSpaceConfig:{drawingBufferColorSpace:Kt}},[Kt]:{primaries:e,whitePoint:i,transfer:dt,toXYZ:Cl,fromXYZ:Rl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Kt}}}),a}const nt=Bh();function en(a){return a<.04045?a*.0773993808:Math.pow(a*.9478672986+.0521327014,2.4)}function ss(a){return a<.0031308?a*12.92:1.055*Math.pow(a,.41666)-.055}let On;class Hh{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{On===void 0&&(On=Xa("canvas")),On.width=e.width,On.height=e.height;const n=On.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),i=On}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Xa("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const n=i.getImageData(0,0,e.width,e.height),s=n.data;for(let r=0;r<s.length;r++)s[r]=en(s[r]/255)*255;return i.putImageData(n,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(en(t[i]/255)*255):t[i]=en(t[i]);return{data:t,width:e.width,height:e.height}}else return He("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Gh=0;class Ko{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Gh++}),this.uuid=xn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let s;if(Array.isArray(n)){s=[];for(let r=0,o=n.length;r<o;r++)n[r].isDataTexture?s.push(vr(n[r].image)):s.push(vr(n[r]))}else s=vr(n);i.url=s}return t||(e.images[this.uuid]=i),i}}function vr(a){return typeof HTMLImageElement<"u"&&a instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&a instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&a instanceof ImageBitmap?Hh.getDataURL(a):a.data?{data:Array.from(a.data),width:a.width,height:a.height,type:a.data.constructor.name}:(He("Texture: Unable to serialize Texture."),{})}let Vh=0;const xr=new I;class Qt extends Fn{constructor(e=Qt.DEFAULT_IMAGE,t=Qt.DEFAULT_MAPPING,i=Ji,n=Ji,s=oi,r=pn,o=Fi,c=hi,l=Qt.DEFAULT_ANISOTROPY,d=un){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Vh++}),this.uuid=xn(),this.name="",this.source=new Ko(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=s,this.minFilter=r,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new xe(0,0),this.repeat=new xe(1,1),this.center=new xe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new We,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(xr).x}get height(){return this.source.getSize(xr).y}get depth(){return this.source.getSize(xr).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){He(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const n=this[t];if(n===void 0){He(`Texture.setValues(): property '${t}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Qc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case eo:e.x=e.x-Math.floor(e.x);break;case Ji:e.x=e.x<0?0:1;break;case to:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case eo:e.y=e.y-Math.floor(e.y);break;case Ji:e.y=e.y<0?0:1;break;case to:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Qt.DEFAULT_IMAGE=null;Qt.DEFAULT_MAPPING=Qc;Qt.DEFAULT_ANISOTROPY=1;const dl=class dl{constructor(e=0,t=0,i=0,n=1){this.x=e,this.y=t,this.z=i,this.w=n}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,n){return this.x=e,this.y=t,this.z=i,this.w=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,n=this.z,s=this.w,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*n+r[12]*s,this.y=r[1]*t+r[5]*i+r[9]*n+r[13]*s,this.z=r[2]*t+r[6]*i+r[10]*n+r[14]*s,this.w=r[3]*t+r[7]*i+r[11]*n+r[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,n,s;const c=e.elements,l=c[0],d=c[4],h=c[8],u=c[1],f=c[5],p=c[9],v=c[2],g=c[6],m=c[10];if(Math.abs(d-u)<.01&&Math.abs(h-v)<.01&&Math.abs(p-g)<.01){if(Math.abs(d+u)<.1&&Math.abs(h+v)<.1&&Math.abs(p+g)<.1&&Math.abs(l+f+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const M=(l+1)/2,y=(f+1)/2,A=(m+1)/2,E=(d+u)/4,x=(h+v)/4,w=(p+g)/4;return M>y&&M>A?M<.01?(i=0,n=.707106781,s=.707106781):(i=Math.sqrt(M),n=E/i,s=x/i):y>A?y<.01?(i=.707106781,n=0,s=.707106781):(n=Math.sqrt(y),i=E/n,s=w/n):A<.01?(i=.707106781,n=.707106781,s=0):(s=Math.sqrt(A),i=x/s,n=w/s),this.set(i,n,s,t),this}let _=Math.sqrt((g-p)*(g-p)+(h-v)*(h-v)+(u-d)*(u-d));return Math.abs(_)<.001&&(_=1),this.x=(g-p)/_,this.y=(h-v)/_,this.z=(u-d)/_,this.w=Math.acos((l+f+m-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this.z=et(this.z,e.z,t.z),this.w=et(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this.z=et(this.z,e,t),this.w=et(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(et(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};dl.prototype.isVector4=!0;let wt=dl;class Wh extends Fn{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:oi,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new wt(0,0,e,t),this.scissorTest=!1,this.viewport=new wt(0,0,e,t),this.textures=[];const n=i.count;for(let s=0;s<n;s++)this.textures[s]=new Qt({width:e,height:t,depth:i.depth}),this.textures[s].isRenderTargetTexture=!0,this.textures[s].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:oi,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let n=0,s=this.textures.length;n<s;n++)this.textures[n].image.width=e,this.textures[n].image.height=t,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const n=Object.assign({},e.textures[t].image);this.textures[t].source=new Ko(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class zi extends Wh{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class ud extends Qt{constructor(e=null,t=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Nt,this.minFilter=Nt,this.wrapR=Ji,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class qh extends Qt{constructor(e=null,t=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Nt,this.minFilter=Nt,this.wrapR=Ji,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}}const tr=class tr{constructor(e,t,i,n,s,r,o,c,l,d,h,u,f,p,v,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,n,s,r,o,c,l,d,h,u,f,p,v,g)}set(e,t,i,n,s,r,o,c,l,d,h,u,f,p,v,g){const m=this.elements;return m[0]=e,m[4]=t,m[8]=i,m[12]=n,m[1]=s,m[5]=r,m[9]=o,m[13]=c,m[2]=l,m[6]=d,m[10]=h,m[14]=u,m[3]=f,m[7]=p,m[11]=v,m[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new tr().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,i=e.elements,n=1/kn.setFromMatrixColumn(e,0).length(),s=1/kn.setFromMatrixColumn(e,1).length(),r=1/kn.setFromMatrixColumn(e,2).length();return t[0]=i[0]*n,t[1]=i[1]*n,t[2]=i[2]*n,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*r,t[9]=i[9]*r,t[10]=i[10]*r,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,n=e.y,s=e.z,r=Math.cos(i),o=Math.sin(i),c=Math.cos(n),l=Math.sin(n),d=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const u=r*d,f=r*h,p=o*d,v=o*h;t[0]=c*d,t[4]=-c*h,t[8]=l,t[1]=f+p*l,t[5]=u-v*l,t[9]=-o*c,t[2]=v-u*l,t[6]=p+f*l,t[10]=r*c}else if(e.order==="YXZ"){const u=c*d,f=c*h,p=l*d,v=l*h;t[0]=u+v*o,t[4]=p*o-f,t[8]=r*l,t[1]=r*h,t[5]=r*d,t[9]=-o,t[2]=f*o-p,t[6]=v+u*o,t[10]=r*c}else if(e.order==="ZXY"){const u=c*d,f=c*h,p=l*d,v=l*h;t[0]=u-v*o,t[4]=-r*h,t[8]=p+f*o,t[1]=f+p*o,t[5]=r*d,t[9]=v-u*o,t[2]=-r*l,t[6]=o,t[10]=r*c}else if(e.order==="ZYX"){const u=r*d,f=r*h,p=o*d,v=o*h;t[0]=c*d,t[4]=p*l-f,t[8]=u*l+v,t[1]=c*h,t[5]=v*l+u,t[9]=f*l-p,t[2]=-l,t[6]=o*c,t[10]=r*c}else if(e.order==="YZX"){const u=r*c,f=r*l,p=o*c,v=o*l;t[0]=c*d,t[4]=v-u*h,t[8]=p*h+f,t[1]=h,t[5]=r*d,t[9]=-o*d,t[2]=-l*d,t[6]=f*h+p,t[10]=u-v*h}else if(e.order==="XZY"){const u=r*c,f=r*l,p=o*c,v=o*l;t[0]=c*d,t[4]=-h,t[8]=l*d,t[1]=u*h+v,t[5]=r*d,t[9]=f*h-p,t[2]=p*h-f,t[6]=o*d,t[10]=v*h+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose($h,e,Xh)}lookAt(e,t,i){const n=this.elements;return li.subVectors(e,t),li.lengthSq()===0&&(li.z=1),li.normalize(),an.crossVectors(i,li),an.lengthSq()===0&&(Math.abs(i.z)===1?li.x+=1e-4:li.z+=1e-4,li.normalize(),an.crossVectors(i,li)),an.normalize(),na.crossVectors(li,an),n[0]=an.x,n[4]=na.x,n[8]=li.x,n[1]=an.y,n[5]=na.y,n[9]=li.y,n[2]=an.z,n[6]=na.z,n[10]=li.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,n=t.elements,s=this.elements,r=i[0],o=i[4],c=i[8],l=i[12],d=i[1],h=i[5],u=i[9],f=i[13],p=i[2],v=i[6],g=i[10],m=i[14],_=i[3],M=i[7],y=i[11],A=i[15],E=n[0],x=n[4],w=n[8],L=n[12],C=n[1],N=n[5],F=n[9],W=n[13],P=n[2],G=n[6],K=n[10],B=n[14],ie=n[3],$=n[7],j=n[11],te=n[15];return s[0]=r*E+o*C+c*P+l*ie,s[4]=r*x+o*N+c*G+l*$,s[8]=r*w+o*F+c*K+l*j,s[12]=r*L+o*W+c*B+l*te,s[1]=d*E+h*C+u*P+f*ie,s[5]=d*x+h*N+u*G+f*$,s[9]=d*w+h*F+u*K+f*j,s[13]=d*L+h*W+u*B+f*te,s[2]=p*E+v*C+g*P+m*ie,s[6]=p*x+v*N+g*G+m*$,s[10]=p*w+v*F+g*K+m*j,s[14]=p*L+v*W+g*B+m*te,s[3]=_*E+M*C+y*P+A*ie,s[7]=_*x+M*N+y*G+A*$,s[11]=_*w+M*F+y*K+A*j,s[15]=_*L+M*W+y*B+A*te,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],n=e[8],s=e[12],r=e[1],o=e[5],c=e[9],l=e[13],d=e[2],h=e[6],u=e[10],f=e[14],p=e[3],v=e[7],g=e[11],m=e[15],_=c*f-l*u,M=o*f-l*h,y=o*u-c*h,A=r*f-l*d,E=r*u-c*d,x=r*h-o*d;return t*(v*_-g*M+m*y)-i*(p*_-g*A+m*E)+n*(p*M-v*A+m*x)-s*(p*y-v*E+g*x)}determinantAffine(){const e=this.elements,t=e[0],i=e[4],n=e[8],s=e[1],r=e[5],o=e[9],c=e[2],l=e[6],d=e[10];return t*(r*d-o*l)-i*(s*d-o*c)+n*(s*l-r*c)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const n=this.elements;return e.isVector3?(n[12]=e.x,n[13]=e.y,n[14]=e.z):(n[12]=e,n[13]=t,n[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],r=e[4],o=e[5],c=e[6],l=e[7],d=e[8],h=e[9],u=e[10],f=e[11],p=e[12],v=e[13],g=e[14],m=e[15],_=t*o-i*r,M=t*c-n*r,y=t*l-s*r,A=i*c-n*o,E=i*l-s*o,x=n*l-s*c,w=d*v-h*p,L=d*g-u*p,C=d*m-f*p,N=h*g-u*v,F=h*m-f*v,W=u*m-f*g,P=_*W-M*F+y*N+A*C-E*L+x*w;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const G=1/P;return e[0]=(o*W-c*F+l*N)*G,e[1]=(n*F-i*W-s*N)*G,e[2]=(v*x-g*E+m*A)*G,e[3]=(u*E-h*x-f*A)*G,e[4]=(c*C-r*W-l*L)*G,e[5]=(t*W-n*C+s*L)*G,e[6]=(g*y-p*x-m*M)*G,e[7]=(d*x-u*y+f*M)*G,e[8]=(r*F-o*C+l*w)*G,e[9]=(i*C-t*F-s*w)*G,e[10]=(p*E-v*y+m*_)*G,e[11]=(h*y-d*E-f*_)*G,e[12]=(o*L-r*N-c*w)*G,e[13]=(t*N-i*L+n*w)*G,e[14]=(v*M-p*A-g*_)*G,e[15]=(d*A-h*M+u*_)*G,this}scale(e){const t=this.elements,i=e.x,n=e.y,s=e.z;return t[0]*=i,t[4]*=n,t[8]*=s,t[1]*=i,t[5]*=n,t[9]*=s,t[2]*=i,t[6]*=n,t[10]*=s,t[3]*=i,t[7]*=n,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],n=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,n))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),n=Math.sin(t),s=1-i,r=e.x,o=e.y,c=e.z,l=s*r,d=s*o;return this.set(l*r+i,l*o-n*c,l*c+n*o,0,l*o+n*c,d*o+i,d*c-n*r,0,l*c-n*o,d*c+n*r,s*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,n,s,r){return this.set(1,i,s,0,e,1,r,0,t,n,1,0,0,0,0,1),this}compose(e,t,i){const n=this.elements,s=t._x,r=t._y,o=t._z,c=t._w,l=s+s,d=r+r,h=o+o,u=s*l,f=s*d,p=s*h,v=r*d,g=r*h,m=o*h,_=c*l,M=c*d,y=c*h,A=i.x,E=i.y,x=i.z;return n[0]=(1-(v+m))*A,n[1]=(f+y)*A,n[2]=(p-M)*A,n[3]=0,n[4]=(f-y)*E,n[5]=(1-(u+m))*E,n[6]=(g+_)*E,n[7]=0,n[8]=(p+M)*x,n[9]=(g-_)*x,n[10]=(1-(u+v))*x,n[11]=0,n[12]=e.x,n[13]=e.y,n[14]=e.z,n[15]=1,this}decompose(e,t,i){const n=this.elements;e.x=n[12],e.y=n[13],e.z=n[14];const s=this.determinantAffine();if(s===0)return i.set(1,1,1),t.identity(),this;let r=kn.set(n[0],n[1],n[2]).length();const o=kn.set(n[4],n[5],n[6]).length(),c=kn.set(n[8],n[9],n[10]).length();s<0&&(r=-r),bi.copy(this);const l=1/r,d=1/o,h=1/c;return bi.elements[0]*=l,bi.elements[1]*=l,bi.elements[2]*=l,bi.elements[4]*=d,bi.elements[5]*=d,bi.elements[6]*=d,bi.elements[8]*=h,bi.elements[9]*=h,bi.elements[10]*=h,t.setFromRotationMatrix(bi),i.x=r,i.y=o,i.z=c,this}makePerspective(e,t,i,n,s,r,o=Ti,c=!1){const l=this.elements,d=2*s/(t-e),h=2*s/(i-n),u=(t+e)/(t-e),f=(i+n)/(i-n);let p,v;if(c)p=s/(r-s),v=r*s/(r-s);else if(o===Ti)p=-(r+s)/(r-s),v=-2*r*s/(r-s);else if(o===Xs)p=-r/(r-s),v=-r*s/(r-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=d,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,n,s,r,o=Ti,c=!1){const l=this.elements,d=2/(t-e),h=2/(i-n),u=-(t+e)/(t-e),f=-(i+n)/(i-n);let p,v;if(c)p=1/(r-s),v=r/(r-s);else if(o===Ti)p=-2/(r-s),v=-(r+s)/(r-s);else if(o===Xs)p=-1/(r-s),v=-s/(r-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=d,l[4]=0,l[8]=0,l[12]=u,l[1]=0,l[5]=h,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=p,l[14]=v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let n=0;n<16;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};tr.prototype.isMatrix4=!0;let ht=tr;const kn=new I,bi=new ht,$h=new I(0,0,0),Xh=new I(1,1,1),an=new I,na=new I,li=new I,Pl=new ht,Ll=new ps;class vn{constructor(e=0,t=0,i=0,n=vn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=n}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,n=this._order){return this._x=e,this._y=t,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const n=e.elements,s=n[0],r=n[4],o=n[8],c=n[1],l=n[5],d=n[9],h=n[2],u=n[6],f=n[10];switch(t){case"XYZ":this._y=Math.asin(et(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-d,f),this._z=Math.atan2(-r,s)):(this._x=Math.atan2(u,l),this._z=0);break;case"YXZ":this._x=Math.asin(-et(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(et(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-r,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-et(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-r,l));break;case"YZX":this._z=Math.asin(et(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-d,l),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-et(r,-1,1)),Math.abs(r)<.9999999?(this._x=Math.atan2(u,l),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-d,f),this._y=0);break;default:He("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Pl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Pl,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ll.setFromEuler(this),this.setFromQuaternion(Ll,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}vn.DEFAULT_ORDER="XYZ";class fd{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Yh=0;const Dl=new I,Bn=new ps,$i=new ht,sa=new I,ys=new I,Kh=new I,Zh=new ps,Il=new I(1,0,0),Nl=new I(0,1,0),Ul=new I(0,0,1),Fl={type:"added"},Jh={type:"removed"},Hn={type:"childadded",child:null},_r={type:"childremoved",child:null};class At extends Fn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Yh++}),this.uuid=xn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=At.DEFAULT_UP.clone();const e=new I,t=new vn,i=new ps,n=new I(1,1,1);function s(){i.setFromEuler(t,!1)}function r(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new ht},normalMatrix:{value:new We}}),this.matrix=new ht,this.matrixWorld=new ht,this.matrixAutoUpdate=At.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=At.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new fd,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Bn.setFromAxisAngle(e,t),this.quaternion.multiply(Bn),this}rotateOnWorldAxis(e,t){return Bn.setFromAxisAngle(e,t),this.quaternion.premultiply(Bn),this}rotateX(e){return this.rotateOnAxis(Il,e)}rotateY(e){return this.rotateOnAxis(Nl,e)}rotateZ(e){return this.rotateOnAxis(Ul,e)}translateOnAxis(e,t){return Dl.copy(e).applyQuaternion(this.quaternion),this.position.add(Dl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Il,e)}translateY(e){return this.translateOnAxis(Nl,e)}translateZ(e){return this.translateOnAxis(Ul,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4($i.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?sa.copy(e):sa.set(e,t,i);const n=this.parent;this.updateWorldMatrix(!0,!1),ys.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?$i.lookAt(ys,sa,this.up):$i.lookAt(sa,ys,this.up),this.quaternion.setFromRotationMatrix($i),n&&($i.extractRotation(n.matrixWorld),Bn.setFromRotationMatrix($i),this.quaternion.premultiply(Bn.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(ot("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Fl),Hn.child=e,this.dispatchEvent(Hn),Hn.child=null):ot("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Jh),_r.child=e,this.dispatchEvent(_r),_r.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),$i.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),$i.multiply(e.parent.matrixWorld)),e.applyMatrix4($i),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Fl),Hn.child=e,this.dispatchEvent(Hn),Hn.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,n=this.children.length;i<n;i++){const r=this.children[i].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const n=this.children;for(let s=0,r=n.length;s<r;s++)n[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ys,e,Kh),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ys,Zh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,i=e.y,n=e.z,s=this.matrix.elements;s[12]+=t-s[0]*t-s[4]*i-s[8]*n,s[13]+=i-s[1]*t-s[5]*i-s[9]*n,s[14]+=n-s[2]*t-s[6]*i-s[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0,i)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const n={};n.uuid=this.uuid,n.type=this.type,n.name=this.name,n.castShadow=this.castShadow,n.receiveShadow=this.receiveShadow,n.visible=this.visible,n.frustumCulled=this.frustumCulled,n.renderOrder=this.renderOrder,n.static=this.static,n.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(o=>({...o})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(e),n.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function s(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,d=c.length;l<d;l++){const h=c[l];s(e.shapes,h)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(s(e.materials,this.material[c]));n.material=o}else n.material=s(e.materials,this.material);if(this.children.length>0){n.children=[];for(let o=0;o<this.children.length;o++)n.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){n.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];n.animations.push(s(e.animations,c))}}if(t){const o=r(e.geometries),c=r(e.materials),l=r(e.textures),d=r(e.images),h=r(e.shapes),u=r(e.skeletons),f=r(e.animations),p=r(e.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),d.length>0&&(i.images=d),h.length>0&&(i.shapes=h),u.length>0&&(i.skeletons=u),f.length>0&&(i.animations=f),p.length>0&&(i.nodes=p)}return i.object=n,i;function r(o){const c=[];for(const l in o){const d=o[l];delete d.metadata,c.push(d)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const n=e.children[i];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}At.DEFAULT_UP=new I(0,1,0);At.DEFAULT_MATRIX_AUTO_UPDATE=!0;At.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Te extends At{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Qh={type:"move"};class yr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Te,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Te,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Te,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let n=null,s=null,r=null;const o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){r=!0;for(const v of e.hand.values()){const g=t.getJointPose(v,i),m=this._getHandJoint(l,v);g!==null&&(m.matrix.fromArray(g.transform.matrix),m.matrix.decompose(m.position,m.quaternion,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=g.radius),m.visible=g!==null}const d=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],u=d.position.distanceTo(h.position),f=.02,p=.005;l.inputState.pinching&&u>f+p?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&u<=f-p&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.quaternion,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(n=t.getPose(e.targetRaySpace,i),n===null&&s!==null&&(n=s),n!==null&&(o.matrix.fromArray(n.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,n.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(n.linearVelocity)):o.hasLinearVelocity=!1,n.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(n.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Qh)))}return o!==null&&(o.visible=n!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=r!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Te;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const pd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},rn={h:0,s:0,l:0},aa={h:0,s:0,l:0};function Mr(a,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?a+(e-a)*6*t:t<1/2?e:t<2/3?a+(e-a)*6*(2/3-t):a}class Ce{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const n=e;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Kt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,nt.colorSpaceToWorking(this,t),this}setRGB(e,t,i,n=nt.workingColorSpace){return this.r=e,this.g=t,this.b=i,nt.colorSpaceToWorking(this,n),this}setHSL(e,t,i,n=nt.workingColorSpace){if(e=Oh(e,1),t=et(t,0,1),i=et(i,0,1),t===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+t):i+t-i*t,r=2*i-s;this.r=Mr(r,s,e+1/3),this.g=Mr(r,s,e),this.b=Mr(r,s,e-1/3)}return nt.colorSpaceToWorking(this,n),this}setStyle(e,t=Kt){function i(s){s!==void 0&&parseFloat(s)<1&&He("Color: Alpha component of "+e+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const r=n[1],o=n[2];switch(r){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseFloat(s[1]))/100,Math.min(100,parseFloat(s[2]))/100,Math.min(100,parseFloat(s[3]))/100,t);break;case"hsl":case"hsla":if(s=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:He("Color: Unknown color model "+e)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=n[1],r=s.length;if(r===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(r===6)return this.setHex(parseInt(s,16),t);He("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Kt){const i=pd[e.toLowerCase()];return i!==void 0?this.setHex(i,t):He("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=en(e.r),this.g=en(e.g),this.b=en(e.b),this}copyLinearToSRGB(e){return this.r=ss(e.r),this.g=ss(e.g),this.b=ss(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Kt){return nt.workingToColorSpace(Xt.copy(this),e),Math.round(et(Xt.r*255,0,255))*65536+Math.round(et(Xt.g*255,0,255))*256+Math.round(et(Xt.b*255,0,255))}getHexString(e=Kt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=nt.workingColorSpace){nt.workingToColorSpace(Xt.copy(this),t);const i=Xt.r,n=Xt.g,s=Xt.b,r=Math.max(i,n,s),o=Math.min(i,n,s);let c,l;const d=(o+r)/2;if(o===r)c=0,l=0;else{const h=r-o;switch(l=d<=.5?h/(r+o):h/(2-r-o),r){case i:c=(n-s)/h+(n<s?6:0);break;case n:c=(s-i)/h+2;break;case s:c=(i-n)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=d,e}getRGB(e,t=nt.workingColorSpace){return nt.workingToColorSpace(Xt.copy(this),t),e.r=Xt.r,e.g=Xt.g,e.b=Xt.b,e}getStyle(e=Kt){nt.workingToColorSpace(Xt.copy(this),e);const t=Xt.r,i=Xt.g,n=Xt.b;return e!==Kt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(e,t,i){return this.getHSL(rn),this.setHSL(rn.h+e,rn.s+t,rn.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(rn),e.getHSL(aa);const i=pr(rn.h,aa.h,t),n=pr(rn.s,aa.s,t),s=pr(rn.l,aa.l,t);return this.setHSL(i,n,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,n=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*n,this.g=s[1]*t+s[4]*i+s[7]*n,this.b=s[2]*t+s[5]*i+s[8]*n,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Xt=new Ce;Ce.NAMES=pd;class Qs{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ce(e),this.density=t}clone(){return new Qs(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Zo extends At{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new vn,this.environmentIntensity=1,this.environmentRotation=new vn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}}const wi=new I,Xi=new I,Sr=new I,Yi=new I,Gn=new I,Vn=new I,zl=new I,br=new I,wr=new I,Er=new I,Ar=new wt,Tr=new wt,Cr=new wt;class yi{constructor(e=new I,t=new I,i=new I){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,n){n.subVectors(i,t),wi.subVectors(e,t),n.cross(wi);const s=n.lengthSq();return s>0?n.multiplyScalar(1/Math.sqrt(s)):n.set(0,0,0)}static getBarycoord(e,t,i,n,s){wi.subVectors(n,t),Xi.subVectors(i,t),Sr.subVectors(e,t);const r=wi.dot(wi),o=wi.dot(Xi),c=wi.dot(Sr),l=Xi.dot(Xi),d=Xi.dot(Sr),h=r*l-o*o;if(h===0)return s.set(0,0,0),null;const u=1/h,f=(l*c-o*d)*u,p=(r*d-o*c)*u;return s.set(1-f-p,p,f)}static containsPoint(e,t,i,n){return this.getBarycoord(e,t,i,n,Yi)===null?!1:Yi.x>=0&&Yi.y>=0&&Yi.x+Yi.y<=1}static getInterpolation(e,t,i,n,s,r,o,c){return this.getBarycoord(e,t,i,n,Yi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,Yi.x),c.addScaledVector(r,Yi.y),c.addScaledVector(o,Yi.z),c)}static getInterpolatedAttribute(e,t,i,n,s,r){return Ar.setScalar(0),Tr.setScalar(0),Cr.setScalar(0),Ar.fromBufferAttribute(e,t),Tr.fromBufferAttribute(e,i),Cr.fromBufferAttribute(e,n),r.setScalar(0),r.addScaledVector(Ar,s.x),r.addScaledVector(Tr,s.y),r.addScaledVector(Cr,s.z),r}static isFrontFacing(e,t,i,n){return wi.subVectors(i,t),Xi.subVectors(e,t),wi.cross(Xi).dot(n)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,n){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[n]),this}setFromAttributeAndIndices(e,t,i,n){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,n),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return wi.subVectors(this.c,this.b),Xi.subVectors(this.a,this.b),wi.cross(Xi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return yi.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return yi.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,n,s){return yi.getInterpolation(e,this.a,this.b,this.c,t,i,n,s)}containsPoint(e){return yi.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return yi.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,n=this.b,s=this.c;let r,o;Gn.subVectors(n,i),Vn.subVectors(s,i),br.subVectors(e,i);const c=Gn.dot(br),l=Vn.dot(br);if(c<=0&&l<=0)return t.copy(i);wr.subVectors(e,n);const d=Gn.dot(wr),h=Vn.dot(wr);if(d>=0&&h<=d)return t.copy(n);const u=c*h-d*l;if(u<=0&&c>=0&&d<=0&&c-d>0)return r=c/(c-d),t.copy(i).addScaledVector(Gn,r);Er.subVectors(e,s);const f=Gn.dot(Er),p=Vn.dot(Er);if(p>=0&&f<=p)return t.copy(s);const v=f*l-c*p;if(v<=0&&l>=0&&p<=0)return o=l/(l-p),t.copy(i).addScaledVector(Vn,o);const g=d*p-f*h;if(g<=0&&h-d>=0&&f-p>=0)return zl.subVectors(s,n),o=(h-d)/(h-d+(f-p)),t.copy(n).addScaledVector(zl,o);const m=1/(g+v+u);return r=v*m,o=u*m,t.copy(i).addScaledVector(Gn,r).addScaledVector(Vn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class zn{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Ei.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Ei.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Ei.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let r=0,o=s.count;r<o;r++)e.isMesh===!0?e.getVertexPosition(r,Ei):Ei.fromBufferAttribute(s,r),Ei.applyMatrix4(e.matrixWorld),this.expandByPoint(Ei);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ra.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ra.copy(i.boundingBox)),ra.applyMatrix4(e.matrixWorld),this.union(ra)}const n=e.children;for(let s=0,r=n.length;s<r;s++)this.expandByObject(n[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Ei),Ei.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ms),oa.subVectors(this.max,Ms),Wn.subVectors(e.a,Ms),qn.subVectors(e.b,Ms),$n.subVectors(e.c,Ms),on.subVectors(qn,Wn),ln.subVectors($n,qn),bn.subVectors(Wn,$n);let t=[0,-on.z,on.y,0,-ln.z,ln.y,0,-bn.z,bn.y,on.z,0,-on.x,ln.z,0,-ln.x,bn.z,0,-bn.x,-on.y,on.x,0,-ln.y,ln.x,0,-bn.y,bn.x,0];return!Rr(t,Wn,qn,$n,oa)||(t=[1,0,0,0,1,0,0,0,1],!Rr(t,Wn,qn,$n,oa))?!1:(la.crossVectors(on,ln),t=[la.x,la.y,la.z],Rr(t,Wn,qn,$n,oa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Ei).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Ei).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ki[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ki[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ki[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ki[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ki[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ki[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ki[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ki[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ki),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Ki=[new I,new I,new I,new I,new I,new I,new I,new I],Ei=new I,ra=new zn,Wn=new I,qn=new I,$n=new I,on=new I,ln=new I,bn=new I,Ms=new I,oa=new I,la=new I,wn=new I;function Rr(a,e,t,i,n){for(let s=0,r=a.length-3;s<=r;s+=3){wn.fromArray(a,s);const o=n.x*Math.abs(wn.x)+n.y*Math.abs(wn.y)+n.z*Math.abs(wn.z),c=e.dot(wn),l=t.dot(wn),d=i.dot(wn);if(Math.max(-Math.max(c,l,d),Math.min(c,l,d))>o)return!1}return!0}const Pt=new I,ca=new xe;let jh=0;class Oi extends Fn{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:jh++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=ld,this.updateRanges=[],this.gpuType=Ai,this.version=0,this._normalizationScale=e!==void 0?nr(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let n=0,s=this.itemSize;n<s;n++)this.array[e+n]=t.array[i+n];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)ca.fromBufferAttribute(this,t),ca.applyMatrix3(e),this.setXY(t,ca.x,ca.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Pt.fromBufferAttribute(this,t),Pt.applyMatrix3(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Pt.fromBufferAttribute(this,t),Pt.applyMatrix4(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Pt.fromBufferAttribute(this,t),Pt.applyNormalMatrix(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Pt.fromBufferAttribute(this,t),Pt.transformDirection(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=this._denormalize(i)),i}setComponent(e,t,i){return this.normalized&&(i=this._normalize(i)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),i=this._normalize(i),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this}setXYZW(e,t,i,n,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),i=this._normalize(i),n=this._normalize(n),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){const t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):dd(e,this.array)}_normalize(e){const t=this._normalizationScale;return t!==void 0?Math.round(e*t):hd(e,this.array)}}class md extends Oi{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class gd extends Oi{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class Qe extends Oi{constructor(e,t,i){super(new Float32Array(e),t,i)}}const eu=new zn,Ss=new I,Pr=new I;class ms{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):eu.setFromPoints(e).getCenter(i);let n=0;for(let s=0,r=e.length;s<r;s++)n=Math.max(n,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(n),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ss.subVectors(e,this.center);const t=Ss.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),n=(i-this.radius)*.5;this.center.addScaledVector(Ss,n/i),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Pr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ss.copy(e.center).add(Pr)),this.expandByPoint(Ss.copy(e.center).sub(Pr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let tu=0;const gi=new ht,Lr=new At,Xn=new I,ci=new zn,bs=new zn,Bt=new I;class Ct extends Fn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:tu++}),this.uuid=xn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Nh(e)?gd:md)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new We().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(e),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return gi.makeRotationFromQuaternion(e),this.applyMatrix4(gi),this}rotateX(e){return gi.makeRotationX(e),this.applyMatrix4(gi),this}rotateY(e){return gi.makeRotationY(e),this.applyMatrix4(gi),this}rotateZ(e){return gi.makeRotationZ(e),this.applyMatrix4(gi),this}translate(e,t,i){return gi.makeTranslation(e,t,i),this.applyMatrix4(gi),this}scale(e,t,i){return gi.makeScale(e,t,i),this.applyMatrix4(gi),this}lookAt(e){return Lr.lookAt(e),Lr.updateMatrix(),this.applyMatrix4(Lr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Xn).negate(),this.translate(Xn.x,Xn.y,Xn.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let n=0,s=e.length;n<s;n++){const r=e[n];i.push(r.x,r.y,r.z||0)}this.setAttribute("position",new Qe(i,3))}else{const i=Math.min(e.length,t.count);for(let n=0;n<i;n++){const s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&He("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new zn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ot("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,n=t.length;i<n;i++){const s=t[i];ci.setFromBufferAttribute(s),this.morphTargetsRelative?(Bt.addVectors(this.boundingBox.min,ci.min),this.boundingBox.expandByPoint(Bt),Bt.addVectors(this.boundingBox.max,ci.max),this.boundingBox.expandByPoint(Bt)):(this.boundingBox.expandByPoint(ci.min),this.boundingBox.expandByPoint(ci.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ot('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ms);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ot("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){const i=this.boundingSphere.center;if(ci.setFromBufferAttribute(e),t)for(let s=0,r=t.length;s<r;s++){const o=t[s];bs.setFromBufferAttribute(o),this.morphTargetsRelative?(Bt.addVectors(ci.min,bs.min),ci.expandByPoint(Bt),Bt.addVectors(ci.max,bs.max),ci.expandByPoint(Bt)):(ci.expandByPoint(bs.min),ci.expandByPoint(bs.max))}ci.getCenter(i);let n=0;for(let s=0,r=e.count;s<r;s++)Bt.fromBufferAttribute(e,s),n=Math.max(n,i.distanceToSquared(Bt));if(t)for(let s=0,r=t.length;s<r;s++){const o=t[s],c=this.morphTargetsRelative;for(let l=0,d=o.count;l<d;l++)Bt.fromBufferAttribute(o,l),c&&(Xn.fromBufferAttribute(e,l),Bt.add(Xn)),n=Math.max(n,i.distanceToSquared(Bt))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&ot('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){ot("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,n=t.normal,s=t.uv;let r=this.getAttribute("tangent");(r===void 0||r.count!==i.count)&&(r=new Oi(new Float32Array(4*i.count),4),this.setAttribute("tangent",r));const o=[],c=[],l=new Uint8Array(i.count);for(let L=0;L<i.count;L++)o[L]=new I,c[L]=new I;const d=new I,h=new I,u=new I,f=new xe,p=new xe,v=new xe,g=new I,m=new I;function _(L,C,N){l[L]=l[C]=l[N]=1,d.fromBufferAttribute(i,L),h.fromBufferAttribute(i,C),u.fromBufferAttribute(i,N),f.fromBufferAttribute(s,L),p.fromBufferAttribute(s,C),v.fromBufferAttribute(s,N),h.sub(d),u.sub(d),p.sub(f),v.sub(f);const F=1/(p.x*v.y-v.x*p.y);isFinite(F)&&(g.copy(h).multiplyScalar(v.y).addScaledVector(u,-p.y).multiplyScalar(F),m.copy(u).multiplyScalar(p.x).addScaledVector(h,-v.x).multiplyScalar(F),o[L].add(g),o[C].add(g),o[N].add(g),c[L].add(m),c[C].add(m),c[N].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let L=0,C=M.length;L<C;++L){const N=M[L],F=N.start,W=N.count;for(let P=F,G=F+W;P<G;P+=3)_(e.getX(P+0),e.getX(P+1),e.getX(P+2))}const y=new I,A=new I,E=new I,x=new I;function w(L){E.fromBufferAttribute(n,L),x.copy(E);const C=o[L];y.copy(C),y.sub(E.multiplyScalar(E.dot(C))).normalize(),A.crossVectors(x,C);const F=A.dot(c[L])<0?-1:1;r.setXYZW(L,y.x,y.y,y.z,F)}for(let L=0,C=i.count;L<C;++L)l[L]&&w(L);this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new Oi(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let u=0,f=i.count;u<f;u++)i.setXYZ(u,0,0,0);const n=new I,s=new I,r=new I,o=new I,c=new I,l=new I,d=new I,h=new I;if(e)for(let u=0,f=e.count;u<f;u+=3){const p=e.getX(u+0),v=e.getX(u+1),g=e.getX(u+2);n.fromBufferAttribute(t,p),s.fromBufferAttribute(t,v),r.fromBufferAttribute(t,g),d.subVectors(r,s),h.subVectors(n,s),d.cross(h),o.fromBufferAttribute(i,p),c.fromBufferAttribute(i,v),l.fromBufferAttribute(i,g),o.add(d),c.add(d),l.add(d),i.setXYZ(p,o.x,o.y,o.z),i.setXYZ(v,c.x,c.y,c.z),i.setXYZ(g,l.x,l.y,l.z)}else for(let u=0,f=t.count;u<f;u+=3)n.fromBufferAttribute(t,u+0),s.fromBufferAttribute(t,u+1),r.fromBufferAttribute(t,u+2),d.subVectors(r,s),h.subVectors(n,s),d.cross(h),i.setXYZ(u+0,d.x,d.y,d.z),i.setXYZ(u+1,d.x,d.y,d.z),i.setXYZ(u+2,d.x,d.y,d.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Bt.fromBufferAttribute(e,t),Bt.normalize(),e.setXYZ(t,Bt.x,Bt.y,Bt.z)}toNonIndexed(){function e(o,c){const l=o.array,d=o.itemSize,h=o.normalized,u=new l.constructor(c.length*d);let f=0,p=0;for(let v=0,g=c.length;v<g;v++){o.isInterleavedBufferAttribute?f=c[v]*o.data.stride+o.offset:f=c[v]*d;for(let m=0;m<d;m++)u[p++]=l[f++]}return new Oi(u,d,h)}if(this.index===null)return He("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Ct,i=this.index.array,n=this.attributes;for(const o in n){const c=n[o],l=e(c,i);t.setAttribute(o,l)}const s=this.morphAttributes;for(const o in s){const c=[],l=s[o];for(let d=0,h=l.length;d<h;d++){const u=l[d],f=e(u,i);c.push(f)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;const r=this.groups;for(let o=0,c=r.length;o<c;o++){const l=r[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const c in i){const l=i[c];e.data.attributes[c]=l.toJSON(e.data)}const n={};let s=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],d=[];for(let h=0,u=l.length;h<u;h++){const f=l[h];d.push(f.toJSON(e.data))}d.length>0&&(n[c]=d,s=!0)}s&&(e.data.morphAttributes=n,e.data.morphTargetsRelative=this.morphTargetsRelative);const r=this.groups;r.length>0&&(e.data.groups=JSON.parse(JSON.stringify(r)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const n=e.attributes;for(const l in n){const d=n[l];this.setAttribute(l,d.clone(t))}const s=e.morphAttributes;for(const l in s){const d=[],h=s[l];for(let u=0,f=h.length;u<f;u++)d.push(h[u].clone(t));this.morphAttributes[l]=d}this.morphTargetsRelative=e.morphTargetsRelative;const r=e.groups;for(let l=0,d=r.length;l<d;l++){const h=r[l];this.addGroup(h.start,h.count,h.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class iu{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=ld,this.updateRanges=[],this.version=0,this.uuid=xn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let n=0,s=this.stride;n<s;n++)this.array[e+n]=t.array[i+n];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});const t=Ol(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=this.array.slice(0).buffer);const i=new this.array.constructor(e.arrayBuffers[t]),n=new this.constructor(i,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});const t=Ol(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=Array.from(new Uint32Array(this.array.slice(0).buffer)));const i={uuid:this.uuid,buffer:t,type:this.array.constructor.name,stride:this.stride};return i.usage=this.usage,i}}function Ol(a){return a.buffer._uuid===void 0&&(a.buffer._uuid=xn()),a.byteOffset===0&&a.byteLength===a.buffer.byteLength?a.buffer._uuid:a.buffer._uuid+":"+a.byteOffset+":"+a.byteLength}const ei=new I;class Ka{constructor(e,t,i,n=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=n,this._normalizationScale=e!==void 0?nr(e.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)ei.fromBufferAttribute(this,t),ei.applyMatrix4(e),this.setXYZ(t,ei.x,ei.y,ei.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)ei.fromBufferAttribute(this,t),ei.applyNormalMatrix(e),this.setXYZ(t,ei.x,ei.y,ei.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)ei.fromBufferAttribute(this,t),ei.transformDirection(e),this.setXYZ(t,ei.x,ei.y,ei.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=this._denormalize(i)),i}setComponent(e,t,i){return this.normalized&&(i=this._normalize(i)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=this._denormalize(t)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=this._denormalize(t)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=this._denormalize(t)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=this._denormalize(t)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),i=this._normalize(i)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),i=this._normalize(i),n=this._normalize(n)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=n,this}setXYZW(e,t,i,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),i=this._normalize(i),n=this._normalize(n),s=this._normalize(s)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=n,this.data.array[e+3]=s,this}clone(e){if(e===void 0){Ya("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const n=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[n+s])}return new Oi(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Ka(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Ya("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const n=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[n+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(e){const t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):dd(e,this.data.array)}_normalize(e){const t=this._normalizationScale;return t!==void 0?Math.round(e*t):hd(e,this.data.array)}}const Dr=new I,nu=new I,su=new We;class hn{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,n){return this.normal.set(e,t,i),this.constant=n,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const n=Dr.subVectors(i,t).cross(nu.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(n,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){const n=e.delta(Dr),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return i===!0&&(r<0||r>1)?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||su.getNormalMatrix(e),n=this.coplanarPoint(Dr).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}}let au=0;class _n extends Fn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:au++}),this.uuid=xn(),this.name="",this.type="Material",this.blending=ks,this.side=Dn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Vc,this.blendDst=Wc,this.blendEquation=is,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ce(0,0,0),this.blendAlpha=0,this.depthFunc=Ws,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ch,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ur,this.stencilZFail=ur,this.stencilZPass=ur,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){He(`Material: parameter '${t}' has value of undefined.`);continue}const n=this[t];if(n===void 0){He(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(i.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(i.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(i.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(i.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(s=>s.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(s){const r=[];for(const o in s){const c=s[o];delete c.metadata,r.push(c)}return r}if(t){const s=n(e.textures),r=n(e.images);s.length>0&&(i.textures=s),r.length>0&&(i.images=r)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ce().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(i=>new hn().fromJSON(i))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new xe().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new xe().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const n=t.length;i=new Array(n);for(let s=0;s!==n;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Nn extends _n{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ce(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Yn;const ws=new I,Kn=new I,Zn=new I,Jn=new xe,Es=new xe,vd=new ht,da=new I,As=new I,ha=new I,kl=new xe,Ir=new xe,Bl=new xe;class ls extends At{constructor(e=new Nn){if(super(),this.isSprite=!0,this.type="Sprite",Yn===void 0){Yn=new Ct;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new iu(t,5);Yn.setIndex([0,1,2,0,2,3]),Yn.setAttribute("position",new Ka(i,3,0,!1)),Yn.setAttribute("uv",new Ka(i,2,3,!1))}this.geometry=Yn,this.material=e,this.center=new xe(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&ot('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Kn.setFromMatrixScale(this.matrixWorld),vd.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Zn.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Kn.multiplyScalar(-Zn.z);const i=this.material.rotation;let n,s;i!==0&&(s=Math.cos(i),n=Math.sin(i));const r=this.center;ua(da.set(-.5,-.5,0),Zn,r,Kn,n,s),ua(As.set(.5,-.5,0),Zn,r,Kn,n,s),ua(ha.set(.5,.5,0),Zn,r,Kn,n,s),kl.set(0,0),Ir.set(1,0),Bl.set(1,1);let o=e.ray.intersectTriangle(da,As,ha,!1,ws);if(o===null&&(ua(As.set(-.5,.5,0),Zn,r,Kn,n,s),Ir.set(0,1),o=e.ray.intersectTriangle(da,ha,As,!1,ws),o===null))return;const c=e.ray.origin.distanceTo(ws);c<e.near||c>e.far||t.push({distance:c,point:ws.clone(),uv:yi.getInterpolation(ws,da,As,ha,kl,Ir,Bl,new xe),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}toJSON(e){const t=super.toJSON(e);return t.object.center=this.center.toArray(),t}}function ua(a,e,t,i,n,s){Jn.subVectors(a,t).addScalar(.5).multiply(i),n!==void 0?(Es.x=s*Jn.x-n*Jn.y,Es.y=n*Jn.x+s*Jn.y):Es.copy(Jn),a.copy(e),a.x+=Es.x,a.y+=Es.y,a.applyMatrix4(vd)}const Zi=new I,Nr=new I,fa=new I,pa=new I;class xd{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Zi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Zi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Zi.copy(this.origin).addScaledVector(this.direction,t),Zi.distanceToSquared(e))}distanceSqToSegment(e,t,i,n){Nr.copy(e).add(t).multiplyScalar(.5),fa.copy(t).sub(e).normalize(),pa.copy(this.origin).sub(Nr);const s=e.distanceTo(t)*.5,r=-this.direction.dot(fa),o=pa.dot(this.direction),c=-pa.dot(fa),l=pa.lengthSq(),d=Math.abs(1-r*r);let h,u,f,p;if(d>0)if(h=r*c-o,u=r*o-c,p=s*d,h>=0)if(u>=-p)if(u<=p){const v=1/d;h*=v,u*=v,f=h*(h+r*u+2*o)+u*(r*h+u+2*c)+l}else u=s,h=Math.max(0,-(r*u+o)),f=-h*h+u*(u+2*c)+l;else u=-s,h=Math.max(0,-(r*u+o)),f=-h*h+u*(u+2*c)+l;else u<=-p?(h=Math.max(0,-(-r*s+o)),u=h>0?-s:Math.min(Math.max(-s,-c),s),f=-h*h+u*(u+2*c)+l):u<=p?(h=0,u=Math.min(Math.max(-s,-c),s),f=u*(u+2*c)+l):(h=Math.max(0,-(r*s+o)),u=h>0?s:Math.min(Math.max(-s,-c),s),f=-h*h+u*(u+2*c)+l);else u=r>0?-s:s,h=Math.max(0,-(r*u+o)),f=-h*h+u*(u+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,h),n&&n.copy(Nr).addScaledVector(fa,u),f}intersectSphere(e,t){if(e.radius<0)return null;Zi.subVectors(e.center,this.origin);const i=Zi.dot(this.direction),n=Zi.dot(Zi)-i*i,s=e.radius*e.radius;if(n>s)return null;const r=Math.sqrt(s-n),o=i-r,c=i+r;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,n,s,r,o,c;const l=1/this.direction.x,d=1/this.direction.y,h=1/this.direction.z,u=this.origin;return l>=0?(i=(e.min.x-u.x)*l,n=(e.max.x-u.x)*l):(i=(e.max.x-u.x)*l,n=(e.min.x-u.x)*l),d>=0?(s=(e.min.y-u.y)*d,r=(e.max.y-u.y)*d):(s=(e.max.y-u.y)*d,r=(e.min.y-u.y)*d),i>r||s>n||((s>i||isNaN(i))&&(i=s),(r<n||isNaN(n))&&(n=r),h>=0?(o=(e.min.z-u.z)*h,c=(e.max.z-u.z)*h):(o=(e.max.z-u.z)*h,c=(e.min.z-u.z)*h),i>c||o>n)||((o>i||i!==i)&&(i=o),(c<n||n!==n)&&(n=c),n<0)?null:this.at(i>=0?i:n,t)}intersectsBox(e){return this.intersectBox(e,Zi)!==null}intersectTriangle(e,t,i,n,s){const r=this.origin,o=this.direction,c=o.x,l=o.y,d=o.z,h=e.x-r.x,u=e.y-r.y,f=e.z-r.z,p=t.x-r.x,v=t.y-r.y,g=t.z-r.z,m=i.x-r.x,_=i.y-r.y,M=i.z-r.z,y=Math.abs(c),A=Math.abs(l),E=Math.abs(d);let x,w,L,C,N,F,W,P,G,K,B,ie;if(y>=A&&y>=E?(L=c,F=h,G=p,ie=m,c>=0?(x=l,w=d,C=u,N=f,W=v,P=g,K=_,B=M):(x=d,w=l,C=f,N=u,W=g,P=v,K=M,B=_)):A>=E?(L=l,F=u,G=v,ie=_,l>=0?(x=d,w=c,C=f,N=h,W=g,P=p,K=M,B=m):(x=c,w=d,C=h,N=f,W=p,P=g,K=m,B=M)):(L=d,F=f,G=g,ie=M,d>=0?(x=c,w=l,C=h,N=u,W=p,P=v,K=m,B=_):(x=l,w=c,C=u,N=h,W=v,P=p,K=_,B=m)),L===0)return null;const $=x/L,j=w/L,te=1/L,be=C-$*F,Be=N-j*F,Z=W-$*G,fe=P-j*G,Se=K-$*ie,Oe=B-j*ie,me=Se*fe-Oe*Z,ye=be*Oe-Be*Se,Ie=Z*Be-fe*be;if(n){if(me<0||ye<0||Ie<0)return null}else if((me<0||ye<0||Ie<0)&&(me>0||ye>0||Ie>0))return null;const Me=me+ye+Ie;if(Me===0)return null;const je=te*(me*F+ye*G+Ie*ie);return(Me>0?je<0:je>0)?null:this.at(je/Me,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class De extends _n{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vn,this.combine=qc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Hl=new ht,En=new xd,ma=new ms,Gl=new I,ga=new I,va=new I,xa=new I,Ur=new I,_a=new I,Vl=new I,ya=new I;class H extends At{constructor(e=new Ct,t=new De){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const n=t[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=n.length;s<r;s++){const o=n[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const i=this.geometry,n=i.attributes.position,s=i.morphAttributes.position,r=i.morphTargetsRelative;t.fromBufferAttribute(n,e);const o=this.morphTargetInfluences;if(s&&o){_a.set(0,0,0);for(let c=0,l=s.length;c<l;c++){const d=o[c],h=s[c];d!==0&&(Ur.fromBufferAttribute(h,e),r?_a.addScaledVector(Ur,d):_a.addScaledVector(Ur.sub(t),d))}t.add(_a)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const i=this.geometry,n=this.material,s=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),ma.copy(i.boundingSphere),ma.applyMatrix4(s),En.copy(e.ray).recast(e.near),!(ma.containsPoint(En.origin)===!1&&(En.intersectSphere(ma,Gl)===null||En.origin.distanceToSquared(Gl)>(e.far-e.near)**2))&&(Hl.copy(s).invert(),En.copy(e.ray).applyMatrix4(Hl),!(i.boundingBox!==null&&En.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,En)))}_computeIntersections(e,t,i){let n;const s=this.geometry,r=this.material,o=s.index,c=s.attributes.position,l=s.attributes.uv,d=s.attributes.uv1,h=s.attributes.normal,u=s.groups,f=s.drawRange;if(o!==null)if(Array.isArray(r))for(let p=0,v=u.length;p<v;p++){const g=u[p],m=r[g.materialIndex],_=Math.max(g.start,f.start),M=Math.min(o.count,Math.min(g.start+g.count,f.start+f.count));for(let y=_,A=M;y<A;y+=3){const E=o.getX(y),x=o.getX(y+1),w=o.getX(y+2);n=Ma(this,m,e,i,l,d,h,E,x,w),n&&(n.faceIndex=Math.floor(y/3),n.face.materialIndex=g.materialIndex,t.push(n))}}else{const p=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let g=p,m=v;g<m;g+=3){const _=o.getX(g),M=o.getX(g+1),y=o.getX(g+2);n=Ma(this,r,e,i,l,d,h,_,M,y),n&&(n.faceIndex=Math.floor(g/3),t.push(n))}}else if(c!==void 0)if(Array.isArray(r))for(let p=0,v=u.length;p<v;p++){const g=u[p],m=r[g.materialIndex],_=Math.max(g.start,f.start),M=Math.min(c.count,Math.min(g.start+g.count,f.start+f.count));for(let y=_,A=M;y<A;y+=3){const E=y,x=y+1,w=y+2;n=Ma(this,m,e,i,l,d,h,E,x,w),n&&(n.faceIndex=Math.floor(y/3),n.face.materialIndex=g.materialIndex,t.push(n))}}else{const p=Math.max(0,f.start),v=Math.min(c.count,f.start+f.count);for(let g=p,m=v;g<m;g+=3){const _=g,M=g+1,y=g+2;n=Ma(this,r,e,i,l,d,h,_,M,y),n&&(n.faceIndex=Math.floor(g/3),t.push(n))}}}}function ru(a,e,t,i,n,s,r,o){let c;if(e.side===Vt?c=i.intersectTriangle(r,s,n,!0,o):c=i.intersectTriangle(n,s,r,e.side===Dn,o),c===null)return null;ya.copy(o),ya.applyMatrix4(a.matrixWorld);const l=t.ray.origin.distanceTo(ya);return l<t.near||l>t.far?null:{distance:l,point:ya.clone(),object:a}}function Ma(a,e,t,i,n,s,r,o,c,l){a.getVertexPosition(o,ga),a.getVertexPosition(c,va),a.getVertexPosition(l,xa);const d=ru(a,e,t,i,ga,va,xa,Vl);if(d){const h=new I;yi.getBarycoord(Vl,ga,va,xa,h),n&&(d.uv=yi.getInterpolatedAttribute(n,o,c,l,h,new xe)),s&&(d.uv1=yi.getInterpolatedAttribute(s,o,c,l,h,new xe)),r&&(d.normal=yi.getInterpolatedAttribute(r,o,c,l,h,new I),d.normal.dot(i.direction)>0&&d.normal.multiplyScalar(-1));const u={a:o,b:c,c:l,normal:new I,materialIndex:0};yi.getNormal(ga,va,xa,u.normal),d.face=u,d.barycoord=h}return d}class Jo extends Qt{constructor(e=null,t=1,i=1,n,s,r,o,c,l=Nt,d=Nt,h,u){super(null,r,o,c,l,d,n,s,h,u),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Wl extends Oi{constructor(e,t,i,n=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Qn=new ht,ql=new ht,Sa=[],$l=new zn,ou=new ht,Ts=new H,Cs=new ms;class Rs extends H{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Wl(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,ou)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new zn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Qn),$l.copy(e.boundingBox).applyMatrix4(Qn),this.boundingBox.union($l)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new ms),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Qn),Cs.copy(e.boundingSphere).applyMatrix4(Qn),this.boundingSphere.union(Cs)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture!==null?e.morphTexture.clone():null,this.instanceColor=e.instanceColor!==null?e.instanceColor.clone():null,this.count=e.count,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const i=t.morphTargetInfluences,n=this.morphTexture.source.data.data,s=i.length+1,r=e*s+1;for(let o=0;o<i.length;o++)i[o]=n[r+o]}raycast(e,t){const i=this.matrixWorld,n=this.count;if(Ts.geometry=this.geometry,Ts.material=this.material,Ts.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Cs.copy(this.boundingSphere),Cs.applyMatrix4(i),e.ray.intersectsSphere(Cs)!==!1))for(let s=0;s<n;s++){this.getMatrixAt(s,Qn),ql.multiplyMatrices(i,Qn),Ts.matrixWorld=ql,Ts.raycast(e,Sa);for(let r=0,o=Sa.length;r<o;r++){const c=Sa[r];c.instanceId=s,c.object=this,t.push(c)}Sa.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Wl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){const i=t.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new Jo(new Float32Array(n*this.count),n,this.count,ir,Ai));const s=this.morphTexture.source.data.data;let r=0;for(let l=0;l<i.length;l++)r+=i[l];const o=this.geometry.morphTargetsRelative?1:1-r,c=n*e;return s[c]=o,s.set(i,c+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const An=new ms,lu=new xe(.5,.5),ba=new I;class Ys{constructor(e=new hn,t=new hn,i=new hn,n=new hn,s=new hn,r=new hn){this.planes=[e,t,i,n,s,r]}set(e,t,i,n,s,r){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(n),o[4].copy(s),o[5].copy(r),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Ti,i=!1){const n=this.planes,s=e.elements,r=s[0],o=s[1],c=s[2],l=s[3],d=s[4],h=s[5],u=s[6],f=s[7],p=s[8],v=s[9],g=s[10],m=s[11],_=s[12],M=s[13],y=s[14],A=s[15];if(n[0].setComponents(l-r,f-d,m-p,A-_).normalize(),n[1].setComponents(l+r,f+d,m+p,A+_).normalize(),n[2].setComponents(l+o,f+h,m+v,A+M).normalize(),n[3].setComponents(l-o,f-h,m-v,A-M).normalize(),i)n[4].setComponents(c,u,g,y).normalize(),n[5].setComponents(l-c,f-u,m-g,A-y).normalize();else if(n[4].setComponents(l-c,f-u,m-g,A-y).normalize(),t===Ti)n[5].setComponents(l+c,f+u,m+g,A+y).normalize();else if(t===Xs)n[5].setComponents(c,u,g,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),An.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),An.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(An)}intersectsSprite(e){An.center.set(0,0,0);const t=lu.distanceTo(e.center);return An.radius=.7071067811865476+t,An.applyMatrix4(e.matrixWorld),this.intersectsSphere(An)}intersectsSphere(e){const t=this.planes,i=e.center,n=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<n)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const n=t[i];if(ba.x=n.normal.x>0?e.max.x:e.min.x,ba.y=n.normal.y>0?e.max.y:e.min.y,ba.z=n.normal.z>0?e.max.z:e.min.z,n.distanceToPoint(ba)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}const Xl=new ht;class Qo{constructor(){this.coordinateSystem=Ti,this._frustums=[],this._count=0}setFromArrayCamera(e){const t=e.cameras,i=this._frustums;for(let n=0;n<t.length;n++){const s=t[n];Xl.multiplyMatrices(s.projectionMatrix,s.matrixWorldInverse),i[n]===void 0&&(i[n]=new Ys),i[n].setFromProjectionMatrix(Xl,s.coordinateSystem,s.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){const t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsObject(e))return!0;return!1}intersectsSprite(e){const t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsSprite(e))return!0;return!1}intersectsSphere(e){const t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsSphere(e))return!0;return!1}intersectsBox(e){const t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsBox(e))return!0;return!1}containsPoint(e){const t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;const t=this._frustums,i=e._frustums;for(let n=0;n<e._count;n++)t[n]===void 0&&(t[n]=new Ys),t[n].copy(i[n]);return this._count=e._count,this}clone(){return new Qo().copy(this)}}class Za extends _n{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ce(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Yl=new ht,No=new xd,wa=new ms,Ea=new I;class Uo extends At{constructor(e=new Ct,t=new Za){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const i=this.geometry,n=this.matrixWorld,s=e.params.Points.threshold,r=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),wa.copy(i.boundingSphere),wa.applyMatrix4(n),wa.radius+=s,e.ray.intersectsSphere(wa)===!1)return;Yl.copy(n).invert(),No.copy(e.ray).applyMatrix4(Yl);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=i.index,h=i.attributes.position;if(l!==null){const u=Math.max(0,r.start),f=Math.min(l.count,r.start+r.count);for(let p=u,v=f;p<v;p++){const g=l.getX(p);Ea.fromBufferAttribute(h,g),Kl(Ea,g,c,n,e,t,this)}}else{const u=Math.max(0,r.start),f=Math.min(h.count,r.start+r.count);for(let p=u,v=f;p<v;p++)Ea.fromBufferAttribute(h,p),Kl(Ea,p,c,n,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const n=t[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=n.length;s<r;s++){const o=n[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function Kl(a,e,t,i,n,s,r){const o=No.distanceSqToPoint(a);if(o<t){const c=new I;No.closestPointToPoint(a,c),c.applyMatrix4(i);const l=n.ray.origin.distanceTo(c);if(l<n.near||l>n.far)return;s.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:r})}}class _d extends Qt{constructor(e=[],t=rs,i,n,s,r,o,c,l,d){super(e,t,i,n,s,r,o,c,l,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class sr extends Qt{constructor(e,t,i,n,s,r,o,c,l){super(e,t,i,n,s,r,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class cs extends Qt{constructor(e,t,i=Bi,n,s,r,o=Nt,c=Nt,l,d=gn,h=1){if(d!==gn&&d!==mn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const u={width:e,height:t,depth:h};super(u,n,s,r,o,c,d,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ko(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}}class yd extends cs{constructor(e,t=Bi,i=rs,n,s,r=Nt,o=Nt,c,l=gn){const d={width:e,height:e,depth:1},h=[d,d,d,d,d,d];super(e,e,t,i,n,s,r,o,c,l),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Md extends Qt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class gs extends Ct{constructor(e=1,t=1,i=1,n=1,s=1,r=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:n,heightSegments:s,depthSegments:r};const o=this;n=Math.floor(n),s=Math.floor(s),r=Math.floor(r);const c=[],l=[],d=[],h=[];let u=0,f=0;p("z","y","x",-1,-1,i,t,e,r,s,0),p("z","y","x",1,-1,i,t,-e,r,s,1),p("x","z","y",1,1,e,i,t,n,r,2),p("x","z","y",1,-1,e,i,-t,n,r,3),p("x","y","z",1,-1,e,t,i,n,s,4),p("x","y","z",-1,-1,e,t,-i,n,s,5),this.setIndex(c),this.setAttribute("position",new Qe(l,3)),this.setAttribute("normal",new Qe(d,3)),this.setAttribute("uv",new Qe(h,2));function p(v,g,m,_,M,y,A,E,x,w,L){const C=y/x,N=A/w,F=y/2,W=A/2,P=E/2,G=x+1,K=w+1;let B=0,ie=0;const $=new I;for(let j=0;j<K;j++){const te=j*N-W;for(let be=0;be<G;be++){const Be=be*C-F;$[v]=Be*_,$[g]=te*M,$[m]=P,l.push($.x,$.y,$.z),$[v]=0,$[g]=0,$[m]=E>0?1:-1,d.push($.x,$.y,$.z),h.push(be/x),h.push(1-j/w),B+=1}}for(let j=0;j<w;j++)for(let te=0;te<x;te++){const be=u+te+G*j,Be=u+te+G*(j+1),Z=u+(te+1)+G*(j+1),fe=u+(te+1)+G*j;c.push(be,Be,fe),c.push(Be,Z,fe),ie+=6}o.addGroup(f,ie,L),f+=ie,u+=B}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new gs(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class ut extends Ct{constructor(e=1,t=1,i=4,n=8,s=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:i,radialSegments:n,heightSegments:s},t=Math.max(0,t),i=Math.max(1,Math.floor(i)),n=Math.max(3,Math.floor(n)),s=Math.max(1,Math.floor(s));const r=[],o=[],c=[],l=[],d=t/2,h=Math.PI/2*e,u=t,f=2*h+u,p=i*2+s,v=n+1,g=new I,m=new I;for(let _=0;_<=p;_++){let M=0,y=0,A=0,E=0;if(_<=i){const L=_/i,C=L*Math.PI/2;y=-d-e*Math.cos(C),A=e*Math.sin(C),E=-e*Math.cos(C),M=L*h}else if(_<=i+s){const L=(_-i)/s;y=-d+L*t,A=e,E=0,M=h+L*u}else{const L=(_-i-s)/i,C=L*Math.PI/2;y=d+e*Math.sin(C),A=e*Math.cos(C),E=e*Math.sin(C),M=h+u+L*h}const x=Math.max(0,Math.min(1,M/f));let w=0;_===0?w=.5/n:_===p&&(w=-.5/n);for(let L=0;L<=n;L++){const C=L/n,N=C*Math.PI*2,F=Math.sin(N),W=Math.cos(N);m.x=-A*W,m.y=y,m.z=A*F,o.push(m.x,m.y,m.z),g.set(-A*W,E,A*F),g.normalize(),c.push(g.x,g.y,g.z),l.push(C+w,x)}if(_>0){const L=(_-1)*v;for(let C=0;C<n;C++){const N=L+C,F=L+C+1,W=_*v+C,P=_*v+C+1;r.push(N,F,W),r.push(F,P,W)}}}this.setIndex(r),this.setAttribute("position",new Qe(o,3)),this.setAttribute("normal",new Qe(c,3)),this.setAttribute("uv",new Qe(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ut(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}}class Qi extends Ct{constructor(e=1,t=32,i=0,n=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:n},t=Math.max(3,t);const s=[],r=[],o=[],c=[],l=new I,d=new xe;r.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let h=0,u=3;h<=t;h++,u+=3){const f=i+h/t*n;l.x=e*Math.cos(f),l.y=e*Math.sin(f),r.push(l.x,l.y,l.z),o.push(0,0,1),d.x=(r[u]/e+1)/2,d.y=(r[u+1]/e+1)/2,c.push(d.x,d.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new Qe(r,3)),this.setAttribute("normal",new Qe(o,3)),this.setAttribute("uv",new Qe(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qi(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Jt extends Ct{constructor(e=1,t=1,i=1,n=32,s=1,r=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:c};const l=this;n=Math.floor(n),s=Math.floor(s);const d=[],h=[],u=[],f=[];let p=0;const v=[],g=i/2;let m=0;_(),r===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(d),this.setAttribute("position",new Qe(h,3)),this.setAttribute("normal",new Qe(u,3)),this.setAttribute("uv",new Qe(f,2));function _(){const y=new I,A=new I;let E=0;const x=(t-e)/i;for(let w=0;w<=s;w++){const L=[],C=w/s,N=C*(t-e)+e;for(let F=0;F<=n;F++){const W=F/n,P=W*c+o,G=Math.sin(P),K=Math.cos(P);A.x=N*G,A.y=-C*i+g,A.z=N*K,h.push(A.x,A.y,A.z),y.set(G,x,K).normalize(),u.push(y.x,y.y,y.z),f.push(W,1-C),L.push(p++)}v.push(L)}for(let w=0;w<n;w++)for(let L=0;L<s;L++){const C=v[L][w],N=v[L+1][w],F=v[L+1][w+1],W=v[L][w+1];(e>0||L!==0)&&(d.push(C,N,W),E+=3),(t>0||L!==s-1)&&(d.push(N,F,W),E+=3)}l.addGroup(m,E,0),m+=E}function M(y){const A=p,E=new xe,x=new I;let w=0;const L=y===!0?e:t,C=y===!0?1:-1;for(let F=1;F<=n;F++)h.push(0,g*C,0),u.push(0,C,0),f.push(.5,.5),p++;const N=p;for(let F=0;F<=n;F++){const P=F/n*c+o,G=Math.cos(P),K=Math.sin(P);x.x=L*K,x.y=g*C,x.z=L*G,h.push(x.x,x.y,x.z),u.push(0,C,0),E.x=G*.5+.5,E.y=K*.5*C+.5,f.push(E.x,E.y),p++}for(let F=0;F<n;F++){const W=A+F,P=N+F;y===!0?d.push(P,P+1,W):d.push(P+1,P,W),w+=3}l.addGroup(m,w,y===!0?1:2),m+=w}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Jt(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class vt extends Jt{constructor(e=1,t=1,i=32,n=1,s=!1,r=0,o=Math.PI*2){super(0,e,t,i,n,s,r,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:n,openEnded:s,thetaStart:r,thetaLength:o}}static fromJSON(e){return new vt(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class vs extends Ct{constructor(e=[],t=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:n};const s=[],r=[];o(n),l(i),d(),this.setAttribute("position",new Qe(s,3)),this.setAttribute("normal",new Qe(s.slice(),3)),this.setAttribute("uv",new Qe(r,2)),n===0?this.computeVertexNormals():this.normalizeNormals();function o(_){const M=new I,y=new I,A=new I;for(let E=0;E<t.length;E+=3)f(t[E+0],M),f(t[E+1],y),f(t[E+2],A),c(M,y,A,_)}function c(_,M,y,A){const E=A+1,x=[];for(let w=0;w<=E;w++){x[w]=[];const L=_.clone().lerp(y,w/E),C=M.clone().lerp(y,w/E),N=E-w;for(let F=0;F<=N;F++)F===0&&w===E?x[w][F]=L:x[w][F]=L.clone().lerp(C,F/N)}for(let w=0;w<E;w++)for(let L=0;L<2*(E-w)-1;L++){const C=Math.floor(L/2);L%2===0?(u(x[w][C+1]),u(x[w+1][C]),u(x[w][C])):(u(x[w][C+1]),u(x[w+1][C+1]),u(x[w+1][C]))}}function l(_){const M=new I;for(let y=0;y<s.length;y+=3)M.x=s[y+0],M.y=s[y+1],M.z=s[y+2],M.normalize().multiplyScalar(_),s[y+0]=M.x,s[y+1]=M.y,s[y+2]=M.z}function d(){const _=new I;for(let M=0;M<s.length;M+=3){_.x=s[M+0],_.y=s[M+1],_.z=s[M+2];const y=g(_)/2/Math.PI+.5,A=m(_)/Math.PI+.5;r.push(y,1-A)}p(),h()}function h(){for(let _=0;_<r.length;_+=6){const M=r[_+0],y=r[_+2],A=r[_+4],E=Math.max(M,y,A),x=Math.min(M,y,A);E>.9&&x<.1&&(M<.2&&(r[_+0]+=1),y<.2&&(r[_+2]+=1),A<.2&&(r[_+4]+=1))}}function u(_){s.push(_.x,_.y,_.z)}function f(_,M){const y=_*3;M.x=e[y+0],M.y=e[y+1],M.z=e[y+2]}function p(){const _=new I,M=new I,y=new I,A=new I,E=new xe,x=new xe,w=new xe;for(let L=0,C=0;L<s.length;L+=9,C+=6){_.set(s[L+0],s[L+1],s[L+2]),M.set(s[L+3],s[L+4],s[L+5]),y.set(s[L+6],s[L+7],s[L+8]),E.set(r[C+0],r[C+1]),x.set(r[C+2],r[C+3]),w.set(r[C+4],r[C+5]),A.copy(_).add(M).add(y).divideScalar(3);const N=g(A);v(E,C+0,_,N),v(x,C+2,M,N),v(w,C+4,y,N)}}function v(_,M,y,A){A<0&&_.x===1&&(r[M]=_.x-1),y.x===0&&y.z===0&&(r[M]=A/2/Math.PI+.5)}function g(_){return Math.atan2(_.z,-_.x)}function m(_){return Math.atan2(-_.y,Math.sqrt(_.x*_.x+_.z*_.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new vs(e.vertices,e.indices,e.radius,e.detail)}}class ki extends vs{constructor(e=1,t=0){const i=(1+Math.sqrt(5))/2,n=1/i,s=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-n,-i,0,-n,i,0,n,-i,0,n,i,-n,-i,0,-n,i,0,n,-i,0,n,i,0,-i,0,-n,i,0,-n,-i,0,n,i,0,n],r=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(s,r,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new ki(e.radius,e.detail)}}class Wi{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){He("Curve: .getPoint() not implemented.")}getPointAt(e,t){const i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let i,n=this.getPoint(0),s=0;t.push(0);for(let r=1;r<=e;r++)i=this.getPoint(r/e),s+=i.distanceTo(n),t.push(s),n=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const i=this.getLengths();let n=0;const s=i.length;let r;t?r=t:r=e*i[s-1];let o=0,c=s-1,l;for(;o<=c;)if(n=Math.floor(o+(c-o)/2),l=i[n]-r,l<0)o=n+1;else if(l>0)c=n-1;else{c=n;break}if(n=c,i[n]===r)return n/(s-1);const d=i[n],u=i[n+1]-d,f=(r-d)/u;return(n+f)/(s-1)}getTangent(e,t){let n=e-1e-4,s=e+1e-4;n<0&&(n=0),s>1&&(s=1);const r=this.getPoint(n),o=this.getPoint(s),c=t||(r.isVector2?new xe:new I);return c.copy(o).sub(r).normalize(),c}getTangentAt(e,t){const i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){const i=new I,n=[],s=[],r=[],o=new I,c=new ht;for(let f=0;f<=e;f++){const p=f/e;n[f]=this.getTangentAt(p,new I)}s[0]=new I,r[0]=new I;let l=Number.MAX_VALUE;const d=Math.abs(n[0].x),h=Math.abs(n[0].y),u=Math.abs(n[0].z);d<=l&&(l=d,i.set(1,0,0)),h<=l&&(l=h,i.set(0,1,0)),u<=l&&i.set(0,0,1),o.crossVectors(n[0],i).normalize(),s[0].crossVectors(n[0],o),r[0].crossVectors(n[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),r[f]=r[f-1].clone(),o.crossVectors(n[f-1],n[f]),o.length()>Number.EPSILON){o.normalize();const p=Math.acos(et(n[f-1].dot(n[f]),-1,1));s[f].applyMatrix4(c.makeRotationAxis(o,p))}r[f].crossVectors(n[f],s[f])}if(t===!0){let f=Math.acos(et(s[0].dot(s[e]),-1,1));f/=e,n[0].dot(o.crossVectors(s[0],s[e]))>0&&(f=-f);for(let p=1;p<=e;p++)s[p].applyMatrix4(c.makeRotationAxis(n[p],f*p)),r[p].crossVectors(n[p],s[p])}return{tangents:n,normals:s,binormals:r}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}}class jo extends Wi{constructor(e=0,t=0,i=1,n=1,s=0,r=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=n,this.aStartAngle=s,this.aEndAngle=r,this.aClockwise=o,this.aRotation=c}getPoint(e,t=new xe){const i=t,n=Math.PI*2;let s=this.aEndAngle-this.aStartAngle;const r=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=n;for(;s>n;)s-=n;s<Number.EPSILON&&(r?s=0:s=n),this.aClockwise===!0&&!r&&(s===n?s=-n:s=s-n);const o=this.aStartAngle+e*s;let c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const d=Math.cos(this.aRotation),h=Math.sin(this.aRotation),u=c-this.aX,f=l-this.aY;c=u*d-f*h+this.aX,l=u*h+f*d+this.aY}return i.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class cu extends jo{constructor(e,t,i,n,s,r){super(e,t,i,i,n,s,r),this.isArcCurve=!0,this.type="ArcCurve"}}function el(){let a=0,e=0,t=0,i=0;function n(s,r,o,c){a=s,e=o,t=-3*s+3*r-2*o-c,i=2*s-2*r+o+c}return{initCatmullRom:function(s,r,o,c,l){n(r,o,l*(o-s),l*(c-r))},initNonuniformCatmullRom:function(s,r,o,c,l,d,h){let u=(r-s)/l-(o-s)/(l+d)+(o-r)/d,f=(o-r)/d-(c-r)/(d+h)+(c-o)/h;u*=d,f*=d,n(r,o,u,f)},calc:function(s){const r=s*s,o=r*s;return a+e*s+t*r+i*o}}}const Zl=new I,Jl=new I,Fr=new el,zr=new el,Or=new el;class Sd extends Wi{constructor(e=[],t=!1,i="centripetal",n=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=n}getPoint(e,t=new I){const i=t,n=this.points,s=n.length,r=(s-(this.closed?0:1))*e;let o=Math.floor(r),c=r-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/s)+1)*s:c===0&&o===s-1&&(o=s-2,c=1);let l,d;this.closed||o>0?l=n[(o-1)%s]:(Jl.subVectors(n[0],n[1]).add(n[0]),l=Jl);const h=n[o%s],u=n[(o+1)%s];if(this.closed||o+2<s?d=n[(o+2)%s]:(Zl.subVectors(n[s-1],n[s-2]).add(n[s-1]),d=Zl),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let p=Math.pow(l.distanceToSquared(h),f),v=Math.pow(h.distanceToSquared(u),f),g=Math.pow(u.distanceToSquared(d),f);v<1e-4&&(v=1),p<1e-4&&(p=v),g<1e-4&&(g=v),Fr.initNonuniformCatmullRom(l.x,h.x,u.x,d.x,p,v,g),zr.initNonuniformCatmullRom(l.y,h.y,u.y,d.y,p,v,g),Or.initNonuniformCatmullRom(l.z,h.z,u.z,d.z,p,v,g)}else this.curveType==="catmullrom"&&(Fr.initCatmullRom(l.x,h.x,u.x,d.x,this.tension),zr.initCatmullRom(l.y,h.y,u.y,d.y,this.tension),Or.initCatmullRom(l.z,h.z,u.z,d.z,this.tension));return i.set(Fr.calc(c),zr.calc(c),Or.calc(c)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const n=e.points[t];this.points.push(new I().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Ql(a,e,t,i,n){const s=(i-e)*.5,r=(n-t)*.5,o=a*a,c=a*o;return(2*t-2*i+s+r)*c+(-3*t+3*i-2*s-r)*o+s*a+t}function du(a,e){const t=1-a;return t*t*e}function hu(a,e){return 2*(1-a)*a*e}function uu(a,e){return a*a*e}function Bs(a,e,t,i){return du(a,e)+hu(a,t)+uu(a,i)}function fu(a,e){const t=1-a;return t*t*t*e}function pu(a,e){const t=1-a;return 3*t*t*a*e}function mu(a,e){return 3*(1-a)*a*a*e}function gu(a,e){return a*a*a*e}function Hs(a,e,t,i,n){return fu(a,e)+pu(a,t)+mu(a,i)+gu(a,n)}class bd extends Wi{constructor(e=new xe,t=new xe,i=new xe,n=new xe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=n}getPoint(e,t=new xe){const i=t,n=this.v0,s=this.v1,r=this.v2,o=this.v3;return i.set(Hs(e,n.x,s.x,r.x,o.x),Hs(e,n.y,s.y,r.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class vu extends Wi{constructor(e=new I,t=new I,i=new I,n=new I){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=n}getPoint(e,t=new I){const i=t,n=this.v0,s=this.v1,r=this.v2,o=this.v3;return i.set(Hs(e,n.x,s.x,r.x,o.x),Hs(e,n.y,s.y,r.y,o.y),Hs(e,n.z,s.z,r.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class wd extends Wi{constructor(e=new xe,t=new xe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new xe){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new xe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class xu extends Wi{constructor(e=new I,t=new I){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new I){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new I){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Ed extends Wi{constructor(e=new xe,t=new xe,i=new xe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new xe){const i=t,n=this.v0,s=this.v1,r=this.v2;return i.set(Bs(e,n.x,s.x,r.x),Bs(e,n.y,s.y,r.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class _u extends Wi{constructor(e=new I,t=new I,i=new I){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new I){const i=t,n=this.v0,s=this.v1,r=this.v2;return i.set(Bs(e,n.x,s.x,r.x),Bs(e,n.y,s.y,r.y),Bs(e,n.z,s.z,r.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Ad extends Wi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new xe){const i=t,n=this.points,s=(n.length-1)*e,r=Math.floor(s),o=s-r,c=n[r===0?r:r-1],l=n[r],d=n[r>n.length-2?n.length-1:r+1],h=n[r>n.length-3?n.length-1:r+2];return i.set(Ql(o,c.x,l.x,d.x,h.x),Ql(o,c.y,l.y,d.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const n=e.points[t];this.points.push(n.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const n=e.points[t];this.points.push(new xe().fromArray(n))}return this}}var jl=Object.freeze({__proto__:null,ArcCurve:cu,CatmullRomCurve3:Sd,CubicBezierCurve:bd,CubicBezierCurve3:vu,EllipseCurve:jo,LineCurve:wd,LineCurve3:xu,QuadraticBezierCurve:Ed,QuadraticBezierCurve3:_u,SplineCurve:Ad});class yu extends Wi{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new jl[i](t,e))}return this}getPoint(e,t){const i=e*this.getLength(),n=this.getCurveLengths();let s=0;for(;s<n.length;){if(n[s]>=i){const r=n[s]-i,o=this.curves[s],c=o.getLength(),l=c===0?0:1-r/c;return o.getPointAt(l,t)}s++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let i=0,n=this.curves.length;i<n;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let i;for(let n=0,s=this.curves;n<s.length;n++){const r=s[n],o=r.isEllipseCurve?e*2:r.isLineCurve||r.isLineCurve3?1:r.isSplineCurve?e*r.points.length:e,c=r.getPoints(o);for(let l=0;l<c.length;l++){const d=c[l];i&&i.equals(d)||(t.push(d),i=d)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this.cacheLengths=null,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){const n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const n=e.curves[t];this.curves.push(new jl[n.type]().fromJSON(n))}return this.cacheLengths=null,this}}class ec extends yu{constructor(e){super(),this.type="Path",this.currentPoint=new xe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const i=new wd(this.currentPoint.clone(),new xe(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,n){const s=new Ed(this.currentPoint.clone(),new xe(e,t),new xe(i,n));return this.curves.push(s),this.currentPoint.set(i,n),this}bezierCurveTo(e,t,i,n,s,r){const o=new bd(this.currentPoint.clone(),new xe(e,t),new xe(i,n),new xe(s,r));return this.curves.push(o),this.currentPoint.set(s,r),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),i=new Ad(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,n,s,r){const o=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+o,t+c,i,n,s,r),this}absarc(e,t,i,n,s,r){return this.absellipse(e,t,i,i,n,s,r),this}ellipse(e,t,i,n,s,r,o,c){const l=this.currentPoint.x,d=this.currentPoint.y;return this.absellipse(e+l,t+d,i,n,s,r,o,c),this}absellipse(e,t,i,n,s,r,o,c){const l=new jo(e,t,i,n,s,r,o,c);if(this.curves.length>0){const h=l.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(l);const d=l.getPoint(1);return this.currentPoint.copy(d),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Td extends ec{constructor(e){super(e),this.uuid=xn(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let i=0,n=this.holes.length;i<n;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){const n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const n=e.holes[t];this.holes.push(new ec().fromJSON(n))}return this}}function Mu(a,e,t=2){const i=e&&e.length,n=i?e[0]*t:a.length;let s=Cd(a,0,n,t,!0);const r=[];if(!s||s.next===s.prev)return r;let o,c,l;if(i&&(s=Au(a,e,s,t)),a.length>80*t){o=a[0],c=a[1];let d=o,h=c;for(let u=t;u<n;u+=t){const f=a[u],p=a[u+1];f<o&&(o=f),p<c&&(c=p),f>d&&(d=f),p>h&&(h=p)}l=Math.max(d-o,h-c),l=l!==0?32767/l:0}return Ks(s,r,t,o,c,l,0),r}function Cd(a,e,t,i,n){let s;if(n===zu(a,e,t,i)>0)for(let r=e;r<t;r+=i)s=tc(r/i|0,a[r],a[r+1],s);else for(let r=t-i;r>=e;r-=i)s=tc(r/i|0,a[r],a[r+1],s);return s&&ds(s,s.next)&&(Js(s),s=s.next),s}function Un(a,e){if(!a)return a;e||(e=a);let t=a,i;do if(i=!1,!t.steiner&&(ds(t,t.next)||Et(t.prev,t,t.next)===0)){if(Js(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function Ks(a,e,t,i,n,s,r){if(!a)return;!r&&s&&Lu(a,i,n,s);let o=a;for(;a.prev!==a.next;){const c=a.prev,l=a.next;if(s?bu(a,i,n,s):Su(a)){e.push(c.i,a.i,l.i),Js(a),a=l.next,o=l.next;continue}if(a=l,a===o){r?r===1?(a=wu(Un(a),e),Ks(a,e,t,i,n,s,2)):r===2&&Eu(a,e,t,i,n,s):Ks(Un(a),e,t,i,n,s,1);break}}}function Su(a){const e=a.prev,t=a,i=a.next;if(Et(e,t,i)>=0)return!1;const n=e.x,s=t.x,r=i.x,o=e.y,c=t.y,l=i.y,d=Math.min(n,s,r),h=Math.min(o,c,l),u=Math.max(n,s,r),f=Math.max(o,c,l);let p=i.next;for(;p!==e;){if(p.x>=d&&p.x<=u&&p.y>=h&&p.y<=f&&Us(n,o,s,c,r,l,p.x,p.y)&&Et(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function bu(a,e,t,i){const n=a.prev,s=a,r=a.next;if(Et(n,s,r)>=0)return!1;const o=n.x,c=s.x,l=r.x,d=n.y,h=s.y,u=r.y,f=Math.min(o,c,l),p=Math.min(d,h,u),v=Math.max(o,c,l),g=Math.max(d,h,u),m=Fo(f,p,e,t,i),_=Fo(v,g,e,t,i);let M=a.prevZ,y=a.nextZ;for(;M&&M.z>=m&&y&&y.z<=_;){if(M.x>=f&&M.x<=v&&M.y>=p&&M.y<=g&&M!==n&&M!==r&&Us(o,d,c,h,l,u,M.x,M.y)&&Et(M.prev,M,M.next)>=0||(M=M.prevZ,y.x>=f&&y.x<=v&&y.y>=p&&y.y<=g&&y!==n&&y!==r&&Us(o,d,c,h,l,u,y.x,y.y)&&Et(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;M&&M.z>=m;){if(M.x>=f&&M.x<=v&&M.y>=p&&M.y<=g&&M!==n&&M!==r&&Us(o,d,c,h,l,u,M.x,M.y)&&Et(M.prev,M,M.next)>=0)return!1;M=M.prevZ}for(;y&&y.z<=_;){if(y.x>=f&&y.x<=v&&y.y>=p&&y.y<=g&&y!==n&&y!==r&&Us(o,d,c,h,l,u,y.x,y.y)&&Et(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function wu(a,e){let t=a;do{const i=t.prev,n=t.next.next;!ds(i,n)&&Pd(i,t,t.next,n)&&Zs(i,n)&&Zs(n,i)&&(e.push(i.i,t.i,n.i),Js(t),Js(t.next),t=a=n),t=t.next}while(t!==a);return Un(t)}function Eu(a,e,t,i,n,s){let r=a;do{let o=r.next.next;for(;o!==r.prev;){if(r.i!==o.i&&Nu(r,o)){let c=Ld(r,o);r=Un(r,r.next),c=Un(c,c.next),Ks(r,e,t,i,n,s,0),Ks(c,e,t,i,n,s,0);return}o=o.next}r=r.next}while(r!==a)}function Au(a,e,t,i){const n=[];for(let s=0,r=e.length;s<r;s++){const o=e[s]*i,c=s<r-1?e[s+1]*i:a.length,l=Cd(a,o,c,i,!1);l===l.next&&(l.steiner=!0),n.push(Iu(l))}n.sort(Tu);for(let s=0;s<n.length;s++)t=Cu(n[s],t);return t}function Tu(a,e){let t=a.x-e.x;if(t===0&&(t=a.y-e.y,t===0)){const i=(a.next.y-a.y)/(a.next.x-a.x),n=(e.next.y-e.y)/(e.next.x-e.x);t=i-n}return t}function Cu(a,e){const t=Ru(a,e);if(!t)return e;const i=Ld(t,a);return Un(i,i.next),Un(t,t.next)}function Ru(a,e){let t=e;const i=a.x,n=a.y;let s=-1/0,r;if(ds(a,t))return t;do{if(ds(a,t.next))return t.next;if(n<=t.y&&n>=t.next.y&&t.next.y!==t.y){const h=t.x+(n-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(h<=i&&h>s&&(s=h,r=t.x<t.next.x?t:t.next,h===i))return r}t=t.next}while(t!==e);if(!r)return null;const o=r,c=r.x,l=r.y;let d=1/0;t=r;do{if(i>=t.x&&t.x>=c&&i!==t.x&&Rd(n<l?i:s,n,c,l,n<l?s:i,n,t.x,t.y)){const h=Math.abs(n-t.y)/(i-t.x);Zs(t,a)&&(h<d||h===d&&(t.x>r.x||t.x===r.x&&Pu(r,t)))&&(r=t,d=h)}t=t.next}while(t!==o);return r}function Pu(a,e){return Et(a.prev,a,e.prev)<0&&Et(e.next,a,a.next)<0}function Lu(a,e,t,i){let n=a;do n.z===0&&(n.z=Fo(n.x,n.y,e,t,i)),n.prevZ=n.prev,n.nextZ=n.next,n=n.next;while(n!==a);n.prevZ.nextZ=null,n.prevZ=null,Du(n)}function Du(a){let e,t=1;do{let i=a,n;a=null;let s=null;for(e=0;i;){e++;let r=i,o=0;for(let l=0;l<t&&(o++,r=r.nextZ,!!r);l++);let c=t;for(;o>0||c>0&&r;)o!==0&&(c===0||!r||i.z<=r.z)?(n=i,i=i.nextZ,o--):(n=r,r=r.nextZ,c--),s?s.nextZ=n:a=n,n.prevZ=s,s=n;i=r}s.nextZ=null,t*=2}while(e>1);return a}function Fo(a,e,t,i,n){return a=(a-t)*n|0,e=(e-i)*n|0,a=(a|a<<8)&16711935,a=(a|a<<4)&252645135,a=(a|a<<2)&858993459,a=(a|a<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,a|e<<1}function Iu(a){let e=a,t=a;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==a);return t}function Rd(a,e,t,i,n,s,r,o){return(n-r)*(e-o)>=(a-r)*(s-o)&&(a-r)*(i-o)>=(t-r)*(e-o)&&(t-r)*(s-o)>=(n-r)*(i-o)}function Us(a,e,t,i,n,s,r,o){return!(a===r&&e===o)&&Rd(a,e,t,i,n,s,r,o)}function Nu(a,e){return a.next.i!==e.i&&a.prev.i!==e.i&&!Uu(a,e)&&(Zs(a,e)&&Zs(e,a)&&Fu(a,e)&&(Et(a.prev,a,e.prev)||Et(a,e.prev,e))||ds(a,e)&&Et(a.prev,a,a.next)>0&&Et(e.prev,e,e.next)>0)}function Et(a,e,t){return(e.y-a.y)*(t.x-e.x)-(e.x-a.x)*(t.y-e.y)}function ds(a,e){return a.x===e.x&&a.y===e.y}function Pd(a,e,t,i){const n=Ta(Et(a,e,t)),s=Ta(Et(a,e,i)),r=Ta(Et(t,i,a)),o=Ta(Et(t,i,e));return!!(n!==s&&r!==o||n===0&&Aa(a,t,e)||s===0&&Aa(a,i,e)||r===0&&Aa(t,a,i)||o===0&&Aa(t,e,i))}function Aa(a,e,t){return e.x<=Math.max(a.x,t.x)&&e.x>=Math.min(a.x,t.x)&&e.y<=Math.max(a.y,t.y)&&e.y>=Math.min(a.y,t.y)}function Ta(a){return a>0?1:a<0?-1:0}function Uu(a,e){let t=a;do{if(t.i!==a.i&&t.next.i!==a.i&&t.i!==e.i&&t.next.i!==e.i&&Pd(t,t.next,a,e))return!0;t=t.next}while(t!==a);return!1}function Zs(a,e){return Et(a.prev,a,a.next)<0?Et(a,e,a.next)>=0&&Et(a,a.prev,e)>=0:Et(a,e,a.prev)<0||Et(a,a.next,e)<0}function Fu(a,e){let t=a,i=!1;const n=(a.x+e.x)/2,s=(a.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&n<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==a);return i}function Ld(a,e){const t=zo(a.i,a.x,a.y),i=zo(e.i,e.x,e.y),n=a.next,s=e.prev;return a.next=e,e.prev=a,t.next=n,n.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function tc(a,e,t,i){const n=zo(a,e,t);return i?(n.next=i.next,n.prev=i,i.next.prev=n,i.next=n):(n.prev=n,n.next=n),n}function Js(a){a.next.prev=a.prev,a.prev.next=a.next,a.prevZ&&(a.prevZ.nextZ=a.nextZ),a.nextZ&&(a.nextZ.prevZ=a.prevZ)}function zo(a,e,t){return{i:a,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function zu(a,e,t,i){let n=0;for(let s=e,r=t-i;s<t;s+=i)n+=(a[r]-a[s])*(a[s+1]+a[r+1]),r=s;return n}class Ou{static triangulate(e,t,i=2){return Mu(e,t,i)}}class Gs{static area(e){const t=e.length;let i=0;for(let n=t-1,s=0;s<t;n=s++)i+=e[n].x*e[s].y-e[s].x*e[n].y;return i*.5}static isClockWise(e){return Gs.area(e)<0}static triangulateShape(e,t){const i=[],n=[],s=[];ic(e),nc(i,e);let r=e.length;t.forEach(ic);for(let c=0;c<t.length;c++)n.push(r),r+=t[c].length,nc(i,t[c]);const o=Ou.triangulate(i,n);for(let c=0;c<o.length;c+=3)s.push(o.slice(c,c+3));return s}}function ic(a){const e=a.length;e>2&&a[e-1].equals(a[0])&&a.pop()}function nc(a,e){for(let t=0;t<e.length;t++)a.push(e[t].x),a.push(e[t].y)}class hs extends vs{constructor(e=1,t=0){const i=(1+Math.sqrt(5))/2,n=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(n,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new hs(e.radius,e.detail)}}class Zt extends vs{constructor(e=1,t=0){const i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],n=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,n,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Zt(e.radius,e.detail)}}class Mi extends Ct{constructor(e=1,t=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:n};const s=e/2,r=t/2,o=Math.floor(i),c=Math.floor(n),l=o+1,d=c+1,h=e/o,u=t/c,f=[],p=[],v=[],g=[];for(let m=0;m<d;m++){const _=m*u-r;for(let M=0;M<l;M++){const y=M*h-s;p.push(y,-_,0),v.push(0,0,1),g.push(M/o),g.push(1-m/c)}}for(let m=0;m<c;m++)for(let _=0;_<o;_++){const M=_+l*m,y=_+l*(m+1),A=_+1+l*(m+1),E=_+1+l*m;f.push(M,y,E),f.push(y,A,E)}this.setIndex(f),this.setAttribute("position",new Qe(p,3)),this.setAttribute("normal",new Qe(v,3)),this.setAttribute("uv",new Qe(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Mi(e.width,e.height,e.widthSegments,e.heightSegments)}}class Ci extends Ct{constructor(e=.5,t=1,i=32,n=1,s=0,r=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:n,thetaStart:s,thetaLength:r},i=Math.max(3,i),n=Math.max(1,n);const o=[],c=[],l=[],d=[];let h=e;const u=(t-e)/n,f=new I,p=new xe;for(let v=0;v<=n;v++){for(let g=0;g<=i;g++){const m=s+g/i*r;f.x=h*Math.cos(m),f.y=h*Math.sin(m),c.push(f.x,f.y,f.z),l.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,d.push(p.x,p.y)}h+=u}for(let v=0;v<n;v++){const g=v*(i+1);for(let m=0;m<i;m++){const _=m+g,M=_,y=_+i+1,A=_+i+2,E=_+1;o.push(M,y,E),o.push(y,A,E)}}this.setIndex(o),this.setAttribute("position",new Qe(c,3)),this.setAttribute("normal",new Qe(l,3)),this.setAttribute("uv",new Qe(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ci(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class tl extends Ct{constructor(e=new Td([new xe(0,.5),new xe(-.5,-.5),new xe(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};const i=[],n=[],s=[],r=[];let o=0,c=0;if(Array.isArray(e)===!1)l(e);else for(let d=0;d<e.length;d++)l(e[d]),this.addGroup(o,c,d),o+=c,c=0;this.setIndex(i),this.setAttribute("position",new Qe(n,3)),this.setAttribute("normal",new Qe(s,3)),this.setAttribute("uv",new Qe(r,2));function l(d){const h=n.length/3,u=d.extractPoints(t);let f=u.shape;const p=u.holes;Gs.isClockWise(f)===!1&&(f=f.reverse());for(let g=0,m=p.length;g<m;g++){const _=p[g];Gs.isClockWise(_)===!0&&(p[g]=_.reverse())}const v=Gs.triangulateShape(f,p);for(let g=0,m=p.length;g<m;g++){const _=p[g];f=f.concat(_)}for(let g=0,m=f.length;g<m;g++){const _=f[g];n.push(_.x,_.y,0),s.push(0,0,1),r.push(_.x,_.y)}for(let g=0,m=v.length;g<m;g++){const _=v[g],M=_[0]+h,y=_[1]+h,A=_[2]+h;i.push(M,y,A),c+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes;return ku(t,e)}static fromJSON(e,t){const i=[];for(let n=0,s=e.shapes.length;n<s;n++){const r=t[e.shapes[n]];i.push(r)}return new tl(i,e.curveSegments)}}function ku(a,e){if(e.shapes=[],Array.isArray(a))for(let t=0,i=a.length;t<i;t++){const n=a[t];e.shapes.push(n.uuid)}else e.shapes.push(a.uuid);return e}class Gi extends Ct{constructor(e=1,t=32,i=16,n=0,s=Math.PI*2,r=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:n,phiLength:s,thetaStart:r,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const c=Math.min(r+o,Math.PI);let l=0;const d=[],h=new I,u=new I,f=[],p=[],v=[],g=[];for(let m=0;m<=i;m++){const _=[],M=m/i,y=r+M*o,A=e*Math.cos(y),E=Math.sqrt(e*e-A*A);let x=0;m===0&&r===0?x=.5/t:m===i&&c===Math.PI&&(x=-.5/t);for(let w=0;w<=t;w++){const L=w/t,C=n+L*s;h.x=-E*Math.cos(C),h.y=A,h.z=E*Math.sin(C),p.push(h.x,h.y,h.z),u.copy(h).normalize(),v.push(u.x,u.y,u.z),g.push(L+x,1-M),_.push(l++)}d.push(_)}for(let m=0;m<i;m++)for(let _=0;_<t;_++){const M=d[m][_+1],y=d[m][_],A=d[m+1][_],E=d[m+1][_+1];(m!==0||r>0)&&f.push(M,y,E),(m!==i-1||c<Math.PI)&&f.push(y,A,E)}this.setIndex(f),this.setAttribute("position",new Qe(p,3)),this.setAttribute("normal",new Qe(v,3)),this.setAttribute("uv",new Qe(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Gi(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Ja extends vs{constructor(e=1,t=0){const i=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],n=[2,1,0,0,3,2,1,3,0,2,3,1];super(i,n,e,t),this.type="TetrahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Ja(e.radius,e.detail)}}class Tt extends Ct{constructor(e=1,t=.4,i=12,n=48,s=Math.PI*2,r=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:n,arc:s,thetaStart:r,thetaLength:o},i=Math.floor(i),n=Math.floor(n);const c=[],l=[],d=[],h=[],u=new I,f=new I,p=new I;for(let v=0;v<=i;v++){const g=r+v/i*o;for(let m=0;m<=n;m++){const _=m/n*s;f.x=(e+t*Math.cos(g))*Math.cos(_),f.y=(e+t*Math.cos(g))*Math.sin(_),f.z=t*Math.sin(g),l.push(f.x,f.y,f.z),u.x=e*Math.cos(_),u.y=e*Math.sin(_),p.subVectors(f,u).normalize(),d.push(p.x,p.y,p.z),h.push(m/n),h.push(v/i)}}for(let v=1;v<=i;v++)for(let g=1;g<=n;g++){const m=(n+1)*v+g-1,_=(n+1)*(v-1)+g-1,M=(n+1)*(v-1)+g,y=(n+1)*v+g;c.push(m,_,y),c.push(_,M,y)}this.setIndex(c),this.setAttribute("position",new Qe(l,3)),this.setAttribute("normal",new Qe(d,3)),this.setAttribute("uv",new Qe(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Tt(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}}function us(a){const e={};for(const t in a){e[t]={};for(const i in a[t]){const n=a[t][i];if(sc(n))n.isRenderTargetTexture?(He("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=n.clone();else if(Array.isArray(n))if(sc(n[0])){const s=[];for(let r=0,o=n.length;r<o;r++)s[r]=n[r].clone();e[t][i]=s}else e[t][i]=n.slice();else e[t][i]=n}}return e}function ti(a){const e={};for(let t=0;t<a.length;t++){const i=us(a[t]);for(const n in i)e[n]=i[n]}return e}function sc(a){return a&&(a.isColor||a.isMatrix3||a.isMatrix4||a.isVector2||a.isVector3||a.isVector4||a.isTexture||a.isQuaternion)}function Bu(a){const e=[];for(let t=0;t<a.length;t++)e.push(a[t].clone());return e}function Dd(a){const e=a.getRenderTarget();return e===null?a.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:nt.workingColorSpace}const Hu={clone:us,merge:ti};var Gu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Vu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Vi extends _n{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Gu,this.fragmentShader=Vu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=us(e.uniforms),this.uniformsGroups=Bu(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const n in this.uniforms){const r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:"t",value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:"c",value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:"v2",value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:"v3",value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:"m4",value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const i in e.uniforms){const n=e.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=t[n.value]||null;break;case"c":this.uniforms[i].value=new Ce().setHex(n.value);break;case"v2":this.uniforms[i].value=new xe().fromArray(n.value);break;case"v3":this.uniforms[i].value=new I().fromArray(n.value);break;case"v4":this.uniforms[i].value=new wt().fromArray(n.value);break;case"m3":this.uniforms[i].value=new We().fromArray(n.value);break;case"m4":this.uniforms[i].value=new ht().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Wu extends Vi{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Ni extends _n{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ce(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ce(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Wa,this.normalScale=new xe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Fs extends _n{constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.type="MeshToonMaterial",this.color=new Ce(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ce(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Wa,this.normalScale=new xe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}class qu extends _n{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Ah,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class $u extends _n{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Id extends At{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ce(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class il extends Id{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ce(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const kr=new ht,ac=new I,rc=new I;class Xu{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new xe(512,512),this.mapType=hi,this.map=null,this.mapPass=null,this.matrix=new ht,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ys,this._frameExtents=new xe(1,1),this._viewportCount=1,this._viewports=[new wt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera;ac.setFromMatrixPosition(e.matrixWorld),t.position.copy(ac),rc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(rc),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,i,n){kr.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),i.setFromProjectionMatrix(kr,e.coordinateSystem,e.reversedDepth);const s=this._frameExtents,r=n?n.z/s.x:1,o=n?n.w/s.y:1,c=n?n.x/s.x:0,l=n?n.y/s.y:0;e.coordinateSystem===Xs||e.reversedDepth?t.set(.5*r,0,0,.5*r+c,0,.5*o,0,.5*o+l,0,0,1,0,0,0,0,1):t.set(.5*r,0,0,.5*r+c,0,.5*o,0,.5*o+l,0,0,.5,.5,0,0,0,1),t.multiply(kr)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Ca=new I,Ra=new ps,Pi=new I;class Nd extends At{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ht,this.projectionMatrix=new ht,this.projectionMatrixInverse=new ht,this.coordinateSystem=Ti,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ca,Ra,Pi),Pi.x===1&&Pi.y===1&&Pi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ca,Ra,Pi.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(Ca,Ra,Pi),Pi.x===1&&Pi.y===1&&Pi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ca,Ra,Pi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const cn=new I,oc=new xe,lc=new xe;class di extends Nd{constructor(e=50,t=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Io*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(fr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Io*2*Math.atan(Math.tan(fr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){cn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(cn.x,cn.y).multiplyScalar(-e/cn.z),cn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(cn.x,cn.y).multiplyScalar(-e/cn.z)}getViewSize(e,t){return this.getViewBounds(e,oc,lc),t.subVectors(lc,oc)}setViewOffset(e,t,i,n,s,r){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(fr*.5*this.fov)/this.zoom,i=2*t,n=this.aspect*i,s=-.5*n;const r=this.view;if(this.view!==null&&this.view.enabled){const c=r.fullWidth,l=r.fullHeight;s+=r.offsetX*n/c,t-=r.offsetY*i/l,n*=r.width/c,i*=r.height/l}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+n,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class Ud extends Nd{constructor(e=-1,t=1,i=1,n=-1,s=.1,r=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=n,this.near=s,this.far=r,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,n,s,r){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2;let s=i-e,r=i+e,o=n+t,c=n-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,r=s+l*this.view.width,o-=d*this.view.offsetY,c=o-d*this.view.height}this.projectionMatrix.makeOrthographic(s,r,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Yu extends Xu{constructor(){super(new Ud(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class fs extends Id{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.target=new At,this.shadow=new Yu}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}const jn=-90,es=1;class Oo extends At{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const n=new di(jn,es,e,t);n.layers=this.layers,this.add(n);const s=new di(jn,es,e,t);s.layers=this.layers,this.add(s);const r=new di(jn,es,e,t);r.layers=this.layers,this.add(r);const o=new di(jn,es,e,t);o.layers=this.layers,this.add(o);const c=new di(jn,es,e,t);c.layers=this.layers,this.add(c);const l=new di(jn,es,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,n,s,r,o,c]=t;for(const l of t)this.remove(l);if(e===Ti)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Xs)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,r,o,c,l,d]=this.children,h=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;const v=i.texture.mipmapsAutoUpdate;i.texture.mipmapsAutoUpdate=!1;let g=!1;e.isWebGLRenderer===!0?g=e.state.buffers.depth.getReversed():g=e.reversedDepthBuffer,e.setRenderTarget(i,0,n),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(i,1,n),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,2,n),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,n),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(i,4,n),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),i.texture.mipmapsAutoUpdate=v,e.setRenderTarget(i,5,n),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,d),e.setRenderTarget(h,u,f),e.xr.enabled=p,i.texture.needsPMREMUpdate=!0}}class Ku extends di{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}}class Zu{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,He("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function cc(a,e,t,i){const n=Ju(i);switch(t){case nd:return a*e;case ir:return a*e/n.components*n.byteLength;case $o:return a*e/n.components*n.byteLength;case In:return a*e*2/n.components*n.byteLength;case Xo:return a*e*2/n.components*n.byteLength;case sd:return a*e*3/n.components*n.byteLength;case Fi:return a*e*4/n.components*n.byteLength;case Yo:return a*e*4/n.components*n.byteLength;case Fa:case za:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*8;case Oa:case ka:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*16;case no:case ao:return Math.max(a,16)*Math.max(e,8)/4;case io:case so:return Math.max(a,8)*Math.max(e,8)/2;case ro:case oo:case co:case ho:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*8;case lo:case Ga:case uo:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*16;case fo:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*16;case po:return Math.floor((a+4)/5)*Math.floor((e+3)/4)*16;case mo:return Math.floor((a+4)/5)*Math.floor((e+4)/5)*16;case go:return Math.floor((a+5)/6)*Math.floor((e+4)/5)*16;case vo:return Math.floor((a+5)/6)*Math.floor((e+5)/6)*16;case xo:return Math.floor((a+7)/8)*Math.floor((e+4)/5)*16;case _o:return Math.floor((a+7)/8)*Math.floor((e+5)/6)*16;case yo:return Math.floor((a+7)/8)*Math.floor((e+7)/8)*16;case Mo:return Math.floor((a+9)/10)*Math.floor((e+4)/5)*16;case So:return Math.floor((a+9)/10)*Math.floor((e+5)/6)*16;case bo:return Math.floor((a+9)/10)*Math.floor((e+7)/8)*16;case wo:return Math.floor((a+9)/10)*Math.floor((e+9)/10)*16;case Eo:return Math.floor((a+11)/12)*Math.floor((e+9)/10)*16;case Ao:return Math.floor((a+11)/12)*Math.floor((e+11)/12)*16;case To:case Co:case Ro:return Math.ceil(a/4)*Math.ceil(e/4)*16;case Po:case Lo:return Math.ceil(a/4)*Math.ceil(e/4)*8;case Va:case Do:return Math.ceil(a/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Ju(a){switch(a){case hi:case jc:return{byteLength:1,components:1};case $s:case ed:case Hi:return{byteLength:2,components:1};case Wo:case qo:return{byteLength:2,components:4};case Bi:case Vo:case Ai:return{byteLength:4,components:1};case td:case id:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${a}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ho}}));typeof window<"u"&&(window.__THREE__?He("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ho);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Fd(){let a=null,e=!1,t=null,i=null;function n(s,r){i=a.requestAnimationFrame(n),t(s,r)}return{start:function(){e!==!0&&t!==null&&a!==null&&(i=a.requestAnimationFrame(n),e=!0)},stop:function(){a!==null&&a.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){a=s}}}function Qu(a){const e=new WeakMap;function t(o,c){const l=o.array,d=o.usage,h=l.byteLength,u=a.createBuffer();a.bindBuffer(c,u),a.bufferData(c,l,d),o.onUploadCallback();let f;if(l instanceof Float32Array)f=a.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=a.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?f=a.HALF_FLOAT:f=a.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=a.SHORT;else if(l instanceof Uint32Array)f=a.UNSIGNED_INT;else if(l instanceof Int32Array)f=a.INT;else if(l instanceof Int8Array)f=a.BYTE;else if(l instanceof Uint8Array)f=a.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=a.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:u,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:h}}function i(o,c,l){const d=c.array,h=c.updateRanges;if(a.bindBuffer(l,o),h.length===0)a.bufferSubData(l,0,d);else{h.sort((f,p)=>f.start-p.start);let u=0;for(let f=1;f<h.length;f++){const p=h[u],v=h[f];v.start<=p.start+p.count+1?p.count=Math.max(p.count,v.start+v.count-p.start):(++u,h[u]=v)}h.length=u+1;for(let f=0,p=h.length;f<p;f++){const v=h[f];a.bufferSubData(l,v.start*d.BYTES_PER_ELEMENT,d,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function n(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const c=e.get(o);c&&(a.deleteBuffer(c.buffer),e.delete(o))}function r(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const d=e.get(o);(!d||d.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,o,c),l.version=o.version}}return{get:n,remove:s,update:r}}var ju=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ef=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,tf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,nf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,sf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,af=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,rf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,of=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,lf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,cf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,df=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,hf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,uf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,ff=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,pf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,mf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,gf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,vf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,xf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,_f=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,yf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Mf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Sf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,bf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,wf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Ef=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Af=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Tf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Cf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Rf="gl_FragColor = linearToOutputTexel( gl_FragColor );",Pf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Lf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Df=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,If=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Nf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Uf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Ff=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,zf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Of=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,kf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Bf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Hf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Gf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Vf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Wf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,qf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,$f=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Xf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Yf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Kf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Zf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Jf=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Qf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,jf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,ep=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,tp=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,ip=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,np=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,sp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ap=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,rp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,op=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,lp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,cp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,dp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,hp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,up=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,fp=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,pp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,mp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,gp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,vp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,xp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,_p=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,yp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Mp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Sp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,bp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,wp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Ep=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Ap=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Tp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Cp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Rp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Pp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Lp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Dp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Ip=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Np=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Up=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Fp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,zp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Op=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,kp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Bp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Hp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Gp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Vp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Wp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,qp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,$p=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Xp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Yp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Kp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Zp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Jp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Qp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const jp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,em=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,im=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,nm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,sm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,am=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,rm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,om=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,lm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,cm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,dm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,um=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,fm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,pm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,gm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,xm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_m=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ym=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Mm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Sm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,wm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Em=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Am=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Cm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Rm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Pm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Lm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Dm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ke={alphahash_fragment:ju,alphahash_pars_fragment:ef,alphamap_fragment:tf,alphamap_pars_fragment:nf,alphatest_fragment:sf,alphatest_pars_fragment:af,aomap_fragment:rf,aomap_pars_fragment:of,batching_pars_vertex:lf,batching_vertex:cf,begin_vertex:df,beginnormal_vertex:hf,bsdfs:uf,iridescence_fragment:ff,bumpmap_pars_fragment:pf,clipping_planes_fragment:mf,clipping_planes_pars_fragment:gf,clipping_planes_pars_vertex:vf,clipping_planes_vertex:xf,color_fragment:_f,color_pars_fragment:yf,color_pars_vertex:Mf,color_vertex:Sf,common:bf,defaultnormal_vertex:wf,displacementmap_pars_vertex:Ef,displacementmap_vertex:Af,emissivemap_fragment:Tf,emissivemap_pars_fragment:Cf,colorspace_fragment:Rf,colorspace_pars_fragment:Pf,envmap_fragment:Lf,envmap_common_pars_fragment:Df,envmap_pars_fragment:If,envmap_pars_vertex:Nf,envmap_physical_pars_fragment:qf,envmap_vertex:Uf,fog_vertex:Ff,fog_pars_vertex:zf,fog_fragment:Of,fog_pars_fragment:kf,gradientmap_pars_fragment:Bf,lightmap_pars_fragment:Hf,lights_lambert_fragment:Gf,lights_lambert_pars_fragment:Vf,lights_pars_begin:Wf,lights_toon_fragment:$f,lights_toon_pars_fragment:Xf,lights_phong_fragment:Yf,lights_phong_pars_fragment:Kf,lights_physical_fragment:Zf,lights_physical_pars_fragment:Jf,lights_fragment_begin:Qf,lights_fragment_maps:jf,lights_fragment_end:ep,lightprobes_pars_fragment:tp,logdepthbuf_fragment:ip,logdepthbuf_pars_fragment:np,logdepthbuf_pars_vertex:sp,logdepthbuf_vertex:ap,map_fragment:rp,map_pars_fragment:op,map_particle_fragment:lp,map_particle_pars_fragment:cp,metalnessmap_fragment:dp,metalnessmap_pars_fragment:hp,morphinstance_vertex:up,morphcolor_vertex:fp,morphnormal_vertex:pp,morphtarget_pars_vertex:mp,morphtarget_vertex:gp,normal_fragment_begin:vp,normal_fragment_maps:xp,normal_pars_fragment:_p,normal_pars_vertex:yp,normal_vertex:Mp,normalmap_pars_fragment:Sp,clearcoat_normal_fragment_begin:bp,clearcoat_normal_fragment_maps:wp,clearcoat_pars_fragment:Ep,iridescence_pars_fragment:Ap,opaque_fragment:Tp,packing:Cp,premultiplied_alpha_fragment:Rp,project_vertex:Pp,dithering_fragment:Lp,dithering_pars_fragment:Dp,roughnessmap_fragment:Ip,roughnessmap_pars_fragment:Np,shadowmap_pars_fragment:Up,shadowmap_pars_vertex:Fp,shadowmap_vertex:zp,shadowmask_pars_fragment:Op,skinbase_vertex:kp,skinning_pars_vertex:Bp,skinning_vertex:Hp,skinnormal_vertex:Gp,specularmap_fragment:Vp,specularmap_pars_fragment:Wp,tonemapping_fragment:qp,tonemapping_pars_fragment:$p,transmission_fragment:Xp,transmission_pars_fragment:Yp,uv_pars_fragment:Kp,uv_pars_vertex:Zp,uv_vertex:Jp,worldpos_vertex:Qp,background_vert:jp,background_frag:em,backgroundCube_vert:tm,backgroundCube_frag:im,cube_vert:nm,cube_frag:sm,depth_vert:am,depth_frag:rm,distance_vert:om,distance_frag:lm,equirect_vert:cm,equirect_frag:dm,linedashed_vert:hm,linedashed_frag:um,meshbasic_vert:fm,meshbasic_frag:pm,meshlambert_vert:mm,meshlambert_frag:gm,meshmatcap_vert:vm,meshmatcap_frag:xm,meshnormal_vert:_m,meshnormal_frag:ym,meshphong_vert:Mm,meshphong_frag:Sm,meshphysical_vert:bm,meshphysical_frag:wm,meshtoon_vert:Em,meshtoon_frag:Am,points_vert:Tm,points_frag:Cm,shadow_vert:Rm,shadow_frag:Pm,sprite_vert:Lm,sprite_frag:Dm},ve={common:{diffuse:{value:new Ce(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new We},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new We}},envmap:{envMap:{value:null},envMapRotation:{value:new We},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new We}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new We}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new We},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new We},normalScale:{value:new xe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new We},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new We}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new We}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new We}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ce(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Ce(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0},uvTransform:{value:new We}},sprite:{diffuse:{value:new Ce(16777215)},opacity:{value:1},center:{value:new xe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new We},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0}}},Ui={basic:{uniforms:ti([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.fog]),vertexShader:Ke.meshbasic_vert,fragmentShader:Ke.meshbasic_frag},lambert:{uniforms:ti([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new Ce(0)},envMapIntensity:{value:1}}]),vertexShader:Ke.meshlambert_vert,fragmentShader:Ke.meshlambert_frag},phong:{uniforms:ti([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new Ce(0)},specular:{value:new Ce(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ke.meshphong_vert,fragmentShader:Ke.meshphong_frag},standard:{uniforms:ti([ve.common,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.roughnessmap,ve.metalnessmap,ve.fog,ve.lights,{emissive:{value:new Ce(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ke.meshphysical_vert,fragmentShader:Ke.meshphysical_frag},toon:{uniforms:ti([ve.common,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.gradientmap,ve.fog,ve.lights,{emissive:{value:new Ce(0)}}]),vertexShader:Ke.meshtoon_vert,fragmentShader:Ke.meshtoon_frag},matcap:{uniforms:ti([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,{matcap:{value:null}}]),vertexShader:Ke.meshmatcap_vert,fragmentShader:Ke.meshmatcap_frag},points:{uniforms:ti([ve.points,ve.fog]),vertexShader:Ke.points_vert,fragmentShader:Ke.points_frag},dashed:{uniforms:ti([ve.common,ve.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ke.linedashed_vert,fragmentShader:Ke.linedashed_frag},depth:{uniforms:ti([ve.common,ve.displacementmap]),vertexShader:Ke.depth_vert,fragmentShader:Ke.depth_frag},normal:{uniforms:ti([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,{opacity:{value:1}}]),vertexShader:Ke.meshnormal_vert,fragmentShader:Ke.meshnormal_frag},sprite:{uniforms:ti([ve.sprite,ve.fog]),vertexShader:Ke.sprite_vert,fragmentShader:Ke.sprite_frag},background:{uniforms:{uvTransform:{value:new We},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ke.background_vert,fragmentShader:Ke.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new We}},vertexShader:Ke.backgroundCube_vert,fragmentShader:Ke.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ke.cube_vert,fragmentShader:Ke.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ke.equirect_vert,fragmentShader:Ke.equirect_frag},distance:{uniforms:ti([ve.common,ve.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ke.distance_vert,fragmentShader:Ke.distance_frag},shadow:{uniforms:ti([ve.lights,ve.fog,{color:{value:new Ce(0)},opacity:{value:1}}]),vertexShader:Ke.shadow_vert,fragmentShader:Ke.shadow_frag}};Ui.physical={uniforms:ti([Ui.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new We},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new We},clearcoatNormalScale:{value:new xe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new We},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new We},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new We},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new We},sheen:{value:0},sheenColor:{value:new Ce(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new We},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new We},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new We},transmissionSamplerSize:{value:new xe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new We},attenuationDistance:{value:0},attenuationColor:{value:new Ce(0)},specularColor:{value:new Ce(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new We},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new We},anisotropyVector:{value:new xe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new We}}]),vertexShader:Ke.meshphysical_vert,fragmentShader:Ke.meshphysical_frag};const Pa={r:0,b:0,g:0},Im=new ht,zd=new We;zd.set(-1,0,0,0,1,0,0,0,1);function Nm(a,e,t,i,n,s){const r=new Ce(0);let o=n===!0?0:1,c,l,d=null,h=0,u=null;function f(_){let M=_.isScene===!0?_.background:null;if(M&&M.isTexture){const y=_.backgroundBlurriness>0;M=e.get(M,y)}return M}function p(_){let M=!1;const y=f(_);y===null?g(r,o):y&&y.isColor&&(g(y,1),M=!0);const A=a.xr.getEnvironmentBlendMode();A==="additive"?t.buffers.color.setClear(0,0,0,1,s):A==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(a.autoClear||M)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),a.clear(a.autoClearColor,a.autoClearDepth,a.autoClearStencil))}function v(_,M){const y=f(M);y&&y.isCubeTexture?(l===void 0&&(l=new H(new gs(1,1,1),new Vi({name:"BackgroundCubeMaterial",uniforms:us(Ui.backgroundCube.uniforms),vertexShader:Ui.backgroundCube.vertexShader,fragmentShader:Ui.backgroundCube.fragmentShader,side:Vt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(A,E,x){this.matrixWorld.copyPosition(x.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=y,l.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Im.makeRotationFromEuler(M.backgroundRotation)).transpose(),y.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(zd),l.material.toneMapped=nt.getTransfer(y.colorSpace)!==dt,(d!==y||h!==y.version||u!==a.toneMapping)&&(l.material.needsUpdate=!0,d=y,h=y.version,u=a.toneMapping),l.layers.enableAll(),_.unshift(l,l.geometry,l.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new H(new Mi(2,2),new Vi({name:"BackgroundMaterial",uniforms:us(Ui.background.uniforms),vertexShader:Ui.background.vertexShader,fragmentShader:Ui.background.fragmentShader,side:Dn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=nt.getTransfer(y.colorSpace)!==dt,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(d!==y||h!==y.version||u!==a.toneMapping)&&(c.material.needsUpdate=!0,d=y,h=y.version,u=a.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null))}function g(_,M){_.getRGB(Pa,Dd(a)),t.buffers.color.setClear(Pa.r,Pa.g,Pa.b,M,s)}function m(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return r},setClearColor:function(_,M=1){r.set(_),o=M,g(r,o)},getClearAlpha:function(){return o},setClearAlpha:function(_){o=_,g(r,o)},render:p,addToRenderList:v,dispose:m}}function Um(a,e){const t=a.getParameter(a.MAX_VERTEX_ATTRIBS),i={},n=u(null);let s=n,r=!1;function o(N,F,W,P,G){let K=!1;const B=h(N,P,W,F);s!==B&&(s=B,l(s.object)),K=f(N,P,W,G),K&&p(N,P,W,G),G!==null&&e.update(G,a.ELEMENT_ARRAY_BUFFER),(K||r)&&(r=!1,y(N,F,W,P),G!==null&&a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,e.get(G).buffer))}function c(){return a.createVertexArray()}function l(N){return a.bindVertexArray(N)}function d(N){return a.deleteVertexArray(N)}function h(N,F,W,P){const G=P.wireframe===!0;let K=i[F.id];K===void 0&&(K={},i[F.id]=K);const B=N.isInstancedMesh===!0?N.id:0;let ie=K[B];ie===void 0&&(ie={},K[B]=ie);let $=ie[W.id];$===void 0&&($={},ie[W.id]=$);let j=$[G];return j===void 0&&(j=u(c()),$[G]=j),j}function u(N){const F=[],W=[],P=[];for(let G=0;G<t;G++)F[G]=0,W[G]=0,P[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:W,attributeDivisors:P,object:N,attributes:{},index:null}}function f(N,F,W,P){const G=s.attributes,K=F.attributes;let B=0;const ie=W.getAttributes();for(const $ in ie)if(ie[$].location>=0){const te=G[$];let be=K[$];if(be===void 0&&($==="instanceMatrix"&&N.instanceMatrix&&(be=N.instanceMatrix),$==="instanceColor"&&N.instanceColor&&(be=N.instanceColor)),te===void 0||te.attribute!==be||be&&te.data!==be.data)return!0;B++}return s.attributesNum!==B||s.index!==P}function p(N,F,W,P){const G={},K=F.attributes;let B=0;const ie=W.getAttributes();for(const $ in ie)if(ie[$].location>=0){let te=K[$];te===void 0&&($==="instanceMatrix"&&N.instanceMatrix&&(te=N.instanceMatrix),$==="instanceColor"&&N.instanceColor&&(te=N.instanceColor));const be={};be.attribute=te,te&&te.data&&(be.data=te.data),G[$]=be,B++}s.attributes=G,s.attributesNum=B,s.index=P}function v(){const N=s.newAttributes;for(let F=0,W=N.length;F<W;F++)N[F]=0}function g(N){m(N,0)}function m(N,F){const W=s.newAttributes,P=s.enabledAttributes,G=s.attributeDivisors;W[N]=1,P[N]===0&&(a.enableVertexAttribArray(N),P[N]=1),G[N]!==F&&(a.vertexAttribDivisor(N,F),G[N]=F)}function _(){const N=s.newAttributes,F=s.enabledAttributes;for(let W=0,P=F.length;W<P;W++)F[W]!==N[W]&&(a.disableVertexAttribArray(W),F[W]=0)}function M(N,F,W,P,G,K,B){B===!0?a.vertexAttribIPointer(N,F,W,G,K):a.vertexAttribPointer(N,F,W,P,G,K)}function y(N,F,W,P){v();const G=P.attributes,K=W.getAttributes(),B=F.defaultAttributeValues;for(const ie in K){const $=K[ie];if($.location>=0){let j=G[ie];if(j===void 0&&(ie==="instanceMatrix"&&N.instanceMatrix&&(j=N.instanceMatrix),ie==="instanceColor"&&N.instanceColor&&(j=N.instanceColor)),j!==void 0){const te=j.normalized,be=j.itemSize,Be=e.get(j);if(Be===void 0)continue;const Z=Be.buffer,fe=Be.type,Se=Be.bytesPerElement,Oe=fe===a.INT||fe===a.UNSIGNED_INT||j.gpuType===Vo;if(j.isInterleavedBufferAttribute){const me=j.data,ye=me.isInterleavedBuffer===!0?me.stride:me.itemSize,Ie=j.offset;if(me.isInstancedInterleavedBuffer||me.isInstancedBufferAttribute){for(let Me=0;Me<$.locationSize;Me++)m($.location+Me,me.meshPerAttribute);N.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=me.meshPerAttribute*me.count)}else for(let Me=0;Me<$.locationSize;Me++)g($.location+Me);a.bindBuffer(a.ARRAY_BUFFER,Z);for(let Me=0;Me<$.locationSize;Me++)M($.location+Me,be/$.locationSize,fe,te,ye*Se,(Ie+be/$.locationSize*Me)*Se,Oe)}else{if(j.isInstancedBufferAttribute){for(let me=0;me<$.locationSize;me++)m($.location+me,j.meshPerAttribute);N.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let me=0;me<$.locationSize;me++)g($.location+me);a.bindBuffer(a.ARRAY_BUFFER,Z);for(let me=0;me<$.locationSize;me++)M($.location+me,be/$.locationSize,fe,te,be*Se,be/$.locationSize*me*Se,Oe)}}else if(B!==void 0){const te=B[ie];if(te!==void 0)switch(te.length){case 2:a.vertexAttrib2fv($.location,te);break;case 3:a.vertexAttrib3fv($.location,te);break;case 4:a.vertexAttrib4fv($.location,te);break;default:a.vertexAttrib1fv($.location,te)}}}}_()}function A(){L();for(const N in i){const F=i[N];for(const W in F){const P=F[W];for(const G in P){const K=P[G];for(const B in K)d(K[B].object),delete K[B];delete P[G]}}delete i[N]}}function E(N){if(i[N.id]===void 0)return;const F=i[N.id];for(const W in F){const P=F[W];for(const G in P){const K=P[G];for(const B in K)d(K[B].object),delete K[B];delete P[G]}}delete i[N.id]}function x(N){for(const F in i){const W=i[F];for(const P in W){const G=W[P];if(G[N.id]===void 0)continue;const K=G[N.id];for(const B in K)d(K[B].object),delete K[B];delete G[N.id]}}}function w(N){for(const F in i){const W=i[F],P=N.isInstancedMesh===!0?N.id:0,G=W[P];if(G!==void 0){for(const K in G){const B=G[K];for(const ie in B)d(B[ie].object),delete B[ie];delete G[K]}delete W[P],Object.keys(W).length===0&&delete i[F]}}}function L(){C(),r=!0,s!==n&&(s=n,l(s.object))}function C(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:o,reset:L,resetDefaultState:C,dispose:A,releaseStatesOfGeometry:E,releaseStatesOfObject:w,releaseStatesOfProgram:x,initAttributes:v,enableAttribute:g,disableUnusedAttributes:_}}function Fm(a,e,t){let i;function n(c){i=c}function s(c,l){a.drawArrays(i,c,l),t.update(l,i,1)}function r(c,l,d){d!==0&&(a.drawArraysInstanced(i,c,l,d),t.update(l,i,d))}function o(c,l,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,d);let u=0;for(let f=0;f<d;f++)u+=l[f];t.update(u,i,1)}this.setMode=n,this.render=s,this.renderInstances=r,this.renderMultiDraw=o}function zm(a,e,t,i){let n;function s(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){const x=e.get("EXT_texture_filter_anisotropic");n=a.getParameter(x.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function r(x){return!(x!==Fi&&i.convert(x)!==a.getParameter(a.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(x){const w=x===Hi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(x!==hi&&x!==Ai&&!w&&i.convert(x)!==a.getParameter(a.IMPLEMENTATION_COLOR_READ_TYPE))}function c(x){if(x==="highp"){if(a.getShaderPrecisionFormat(a.VERTEX_SHADER,a.HIGH_FLOAT).precision>0&&a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.HIGH_FLOAT).precision>0)return"highp";x="mediump"}return x==="mediump"&&a.getShaderPrecisionFormat(a.VERTEX_SHADER,a.MEDIUM_FLOAT).precision>0&&a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const d=c(l);d!==l&&(He("WebGLRenderer:",l,"not supported, using",d,"instead."),l=d);const h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),u=t.logarithmicDepthBuffer===!0&&h===!1;t.reversedDepthBuffer===!0&&h===!1&&He("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&h===!0&&He("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const f=a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS),p=a.getParameter(a.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=a.getParameter(a.MAX_TEXTURE_SIZE),g=a.getParameter(a.MAX_CUBE_MAP_TEXTURE_SIZE),m=a.getParameter(a.MAX_VERTEX_ATTRIBS),_=a.getParameter(a.MAX_VERTEX_UNIFORM_VECTORS),M=a.getParameter(a.MAX_VARYING_VECTORS),y=a.getParameter(a.MAX_FRAGMENT_UNIFORM_VECTORS),A=a.getParameter(a.MAX_SAMPLES),E=a.getParameter(a.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:r,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:u,reversedDepthBuffer:h,maxTextures:f,maxVertexTextures:p,maxTextureSize:v,maxCubemapSize:g,maxAttributes:m,maxVertexUniforms:_,maxVaryings:M,maxFragmentUniforms:y,maxSamples:A,samples:E}}function Om(a){const e=this;let t=null,i=0,n=!1,s=!1;const r=new hn,o=new We,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,u){const f=h.length!==0||u||i!==0||n;return n=u,i=h.length,f},this.beginShadows=function(){s=!0,d(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,u){t=d(h,u,0)},this.setState=function(h,u,f){const p=h.clippingPlanes,v=h.clipIntersection,g=h.clipShadows,m=a.get(h);if(!n||p===null||p.length===0||s&&!g)s?d(null):l();else{const _=s?0:i,M=_*4;let y=m.clippingState||null;c.value=y,y=d(p,u,M,f);for(let A=0;A!==M;++A)y[A]=t[A];m.clippingState=y,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=_}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function d(h,u,f,p){const v=h!==null?h.length:0;let g=null;if(v!==0){if(g=c.value,p!==!0||g===null){const m=f+v*4,_=u.matrixWorldInverse;o.getNormalMatrix(_),(g===null||g.length<m)&&(g=new Float32Array(m));for(let M=0,y=f;M!==v;++M,y+=4)r.copy(h[M]).applyMatrix4(_,o),r.normal.toArray(g,y),g[y+3]=r.constant}c.value=g,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,g}}class nl extends zi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},n=[i,i,i,i,i,i];this.texture=new _d(n),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},n=new gs(5,5,5),s=new Vi({name:"CubemapFromEquirect",uniforms:us(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Vt,blending:ns});s.uniforms.tEquirect.value=t;const r=new H(n,s),o=t.minFilter;return t.minFilter===pn&&(t.minFilter=oi),new Oo(1,10,this).update(e,r),t.minFilter=o,r.geometry.dispose(),r.material.dispose(),this}clear(e,t=!0,i=!0,n=!0){const s=e.getRenderTarget();for(let r=0;r<6;r++)e.setRenderTarget(this,r),e.clear(t,i,n);e.setRenderTarget(s)}}const dc=256,km=3,Bm=20,Od=256,kd=16,Hm=3,Gm=new I,Vm=new Ce;class Qa{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Oo(1,10,null),this._boxMesh=new H(new gs(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,i=.1,n=100,s={}){const{size:r=256,position:o=Gm}=s,c=this._renderer;this._setSize(r);const l=this._allocateTarget(),d=this._getSourceTarget(!0);t>0&&(d.texture.mipmapsAutoUpdate=!1);const h=c.autoClear,u=c.autoClearColor,f=c.autoClearDepth,p=c.autoClearStencil,v=e.background;c.autoClear=!0,c.autoClearColor=!0,c.autoClearDepth=!0,c.autoClearStencil=!0,v===null&&(e.background=c.getClearColor(Vm));const g=new Oo(i,n,d);return g.position.copy(o),g.update(c,e),c.autoClear=h,c.autoClearColor=u,c.autoClearDepth=f,c.autoClearStencil=p,e.background=v,t>0&&(d.texture.mipmapsAutoUpdate=!0,this._blur(l,t)),this._applyPMREM(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=fc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=uc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(dc,kh(e))}_fromTexture(e,t){e.mapping===rs||e.mapping===qs?this._setSize(e.image.length===0?dc:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);const i=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(i),i}_allocateTarget(){const e=this._cubeSize,t=hc(e,!1,!1),i=Math.log2(e)-km;for(let n=0;n<=i;n++)t.texture.mipmaps.push({width:e>>n,height:e>>n});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){const t=this._cubeSize,i=this._sourceTarget;return(i===null||i.width!==t||e&&i.depthBuffer===!1)&&(i!==null&&i.dispose(),this._sourceTarget=hc(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,i){const n=this._boxMesh,s=this._cubeCamera;n.material=i,s.renderTarget=e,s.activeMipmapLevel=t;const r=e.width>>t;e.viewport.set(0,0,r,r),s.update(this._renderer,n),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===rs||e.mapping===qs?(this._cubemapMaterial===null&&(this._cubemapMaterial=fc()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=uc()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=Wm(),this._integrationMaterial=qm());const t=this._cubeSize,i=e.texture.mipmaps.length-1,n=this._ggxMaterial.uniforms;n.envMap.value=this._sourceTarget.texture;const s=this._integrationMaterial.uniforms;s.envMap.value=this._sourceTarget.texture,s.sourceLod.value=Math.log2(t/kd);for(let r=0;r<=i;r++){const o=Qa.lodToRoughness(r,i);if(r>i-Hm)s.roughness.value=o,this._renderCube(e,r,this._integrationMaterial);else{const c=o>0?Math.log2(t)+.5*Math.log2(6/(Od*Math.pow(o,4)))+.5:0;n.roughness.value=o,n.lodBias.value=c,this._renderCube(e,r,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=$m());const i=this._blurMaterial,n=i.uniforms,s=this._sourceTarget;n.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,n.envMap.value=s.texture,this._renderCube(e,0,i),n.envMap.value=e.texture,this._renderCube(s,0,i)}}function hc(a,e,t){return new nl(a,{minFilter:pn,generateMipmaps:e,type:Hi,colorSpace:qa,depthBuffer:t})}function js(a,e,t){return new Vi({name:a,uniforms:e,vertexShader:Ke.cube_vert,fragmentShader:t,side:Vt,blending:ns,depthTest:!1,depthWrite:!1})}function Wm(){return js("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Od}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function qm(){return js("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:kd}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function $m(){return js("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Bm}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function uc(){return js("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function fc(){return js("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Xm(a){let e=new WeakMap,t=new WeakMap,i=null;function n(u,f=!1){return u==null?null:f?r(u):s(u)}function s(u){if(u&&u.isTexture){const f=u.mapping;if(f===cr||f===dr)if(e.has(u)){const p=e.get(u).texture;return o(p,u.mapping)}else{const p=u.image;if(p&&p.height>0){const v=new nl(p.height);return v.fromEquirectangularTexture(a,u),e.set(u,v),u.addEventListener("dispose",l),o(v.texture,u.mapping)}else return null}}return u}function r(u){if(u&&u.isTexture&&u.isPMREMTexture!==!0){const f=u.mapping,p=f===cr||f===dr,v=f===rs||f===qs;if(p||v){let g=t.get(u);const m=g!==void 0?g.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==m)return i===null&&(i=new Qa(a)),g=p?i.fromEquirectangular(u,g):i.fromCubemap(u,g),g.texture.pmremVersion=u.pmremVersion,t.set(u,g),g.texture;if(g!==void 0)return g.texture;{const _=u.image;return p&&_&&_.height>0||v&&_&&c(_)?(i===null&&(i=new Qa(a)),g=p?i.fromEquirectangular(u):i.fromCubemap(u),g.texture.pmremVersion=u.pmremVersion,t.set(u,g),u.addEventListener("dispose",d),g.texture):null}}}return u}function o(u,f){return f===cr?u.mapping=rs:f===dr&&(u.mapping=qs),u}function c(u){let f=0;const p=6;for(let v=0;v<p;v++)u[v]!==void 0&&f++;return f===p}function l(u){const f=u.target;f.removeEventListener("dispose",l);const p=e.get(f);p!==void 0&&(e.delete(f),p.dispose())}function d(u){const f=u.target;f.removeEventListener("dispose",d);const p=t.get(f);p!==void 0&&(t.delete(f),p.dispose())}function h(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:h}}function Ym(a){const e={};function t(i){if(e[i]!==void 0)return e[i];const n=a.getExtension(i);return e[i]=n,n}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const n=t(i);return n===null&&Ba("WebGLRenderer: "+i+" extension not supported."),n}}}function Km(a,e,t,i){const n={},s=new WeakMap,r=new FinalizationRegistry(p=>delete n[p]);function o(p){c(p.target)}function c(p){p.index!==null&&e.remove(p.index);for(const g in p.attributes)e.remove(p.attributes[g]);p.removeEventListener("dispose",o),delete n[p.id],r.unregister(p);const v=s.get(p);v&&(e.remove(v),s.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function l(p,v){return n[v.id]!==void 0||(v.addEventListener("dispose",o),n[v.id]=new WeakRef(v),r.register(v,v.id,v),t.memory.geometries++),v}function d(p){const v=p.attributes;for(const g in v)e.update(v[g],a.ARRAY_BUFFER)}function h(p){const v=p.index,g=p.attributes.position;let m=0;if(g===void 0)return;const _=v!==null?v.array.length:g.array.length/3-1,M=g.count>=65535?gd:md,y=new M(Math.ceil(_/3)*6,1),A=y.array;if(v!==null){const x=v.array;m=v.version;for(let w=0,L=0;w<_;w+=3){const C=x[w+0],N=x[w+1],F=x[w+2];A[L++]=C,A[L++]=N,A[L++]=N,A[L++]=F,A[L++]=F,A[L++]=C}}else{m=g.version;for(let x=0,w=0;x<_;x+=3){const L=x+0,C=x+1,N=x+2;A[w++]=L,A[w++]=C,A[w++]=C,A[w++]=N,A[w++]=N,A[w++]=L}}y.version=m;const E=s.get(p);E&&e.remove(E),s.set(p,y)}function u(p){const v=s.get(p);if(v){const g=p.index;g!==null&&v.version<g.version&&h(p)}else h(p);return s.get(p)}function f(){for(const p in n){const v=n[p].deref();v!==void 0&&c(v)}}return{get:l,update:d,getWireframeAttribute:u,dispose:f}}function Zm(a,e,t){let i;function n(h){i=h}let s,r;function o(h){s=h.type,r=h.bytesPerElement}function c(h,u){a.drawElements(i,u,s,h*r),t.update(u,i,1)}function l(h,u,f){f!==0&&(a.drawElementsInstanced(i,u,s,h*r,f),t.update(u,i,f))}function d(h,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,s,h,0,f);let v=0;for(let g=0;g<f;g++)v+=u[g];t.update(v,i,1)}this.setMode=n,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=d}function Jm(a){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,r,o){switch(t.calls++,r){case a.TRIANGLES:t.triangles+=o*(s/3);break;case a.LINES:t.lines+=o*(s/2);break;case a.LINE_STRIP:t.lines+=o*(s-1);break;case a.LINE_LOOP:t.lines+=o*s;break;case a.POINTS:t.points+=o*s;break;default:ot("WebGLInfo: Unknown draw mode:",r);break}}function n(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:n,update:i}}function Qm(a,e,t){const i=new WeakMap,n=new wt;function s(r,o,c){const l=r.morphTargetInfluences,d=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=d!==void 0?d.length:0;let u=i.get(o);if(u===void 0||u.count!==h){let C=function(){w.dispose(),i.delete(o),o.removeEventListener("dispose",C)};var f=C;u!==void 0&&u.texture.dispose();const p=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,g=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],_=o.morphAttributes.normal||[],M=o.morphAttributes.color||[];let y=0;p===!0&&(y=1),v===!0&&(y=2),g===!0&&(y=3);let A=o.attributes.position.count*y,E=1;A>e.maxTextureSize&&(E=Math.ceil(A/e.maxTextureSize),A=e.maxTextureSize);const x=new Float32Array(A*E*4*h),w=new ud(x,A,E,h);w.type=Ai,w.needsUpdate=!0;const L=y*4;for(let N=0;N<h;N++){const F=m[N],W=_[N],P=M[N],G=A*E*4*N;for(let K=0;K<F.count;K++){const B=K*L;p===!0&&(n.fromBufferAttribute(F,K),x[G+B+0]=n.x,x[G+B+1]=n.y,x[G+B+2]=n.z,x[G+B+3]=0),v===!0&&(n.fromBufferAttribute(W,K),x[G+B+4]=n.x,x[G+B+5]=n.y,x[G+B+6]=n.z,x[G+B+7]=0),g===!0&&(n.fromBufferAttribute(P,K),x[G+B+8]=n.x,x[G+B+9]=n.y,x[G+B+10]=n.z,x[G+B+11]=P.itemSize===4?n.w:1)}}u={count:h,texture:w,size:new xe(A,E)},i.set(o,u),o.addEventListener("dispose",C)}if(r.isInstancedMesh===!0&&r.morphTexture!==null)c.getUniforms().setValue(a,"morphTexture",r.morphTexture,t);else{let p=0;for(let g=0;g<l.length;g++)p+=l[g];const v=o.morphTargetsRelative?1:1-p;c.getUniforms().setValue(a,"morphTargetBaseInfluence",v),c.getUniforms().setValue(a,"morphTargetInfluences",l)}c.getUniforms().setValue(a,"morphTargetsTexture",u.texture,t),c.getUniforms().setValue(a,"morphTargetsTextureSize",u.size)}return{update:s}}function jm(a,e,t,i,n){let s=new WeakMap;function r(l){const d=n.render.frame,h=l.geometry,u=e.get(l,h);if(s.get(u)!==d&&(e.update(u),s.set(u,d)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),s.get(l)!==d&&(t.update(l.instanceMatrix,a.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,a.ARRAY_BUFFER),s.set(l,d))),l.isSkinnedMesh){const f=l.skeleton;s.get(f)!==d&&(f.update(),s.set(f,d))}return u}function o(){s=new WeakMap}function c(l){const d=l.target;d.removeEventListener("dispose",c),i.releaseStatesOfObject(d),t.remove(d.instanceMatrix),d.instanceColor!==null&&t.remove(d.instanceColor)}return{update:r,dispose:o}}const e0={[$c]:"LINEAR_TONE_MAPPING",[Xc]:"REINHARD_TONE_MAPPING",[Yc]:"CINEON_TONE_MAPPING",[Go]:"ACES_FILMIC_TONE_MAPPING",[Zc]:"AGX_TONE_MAPPING",[Jc]:"NEUTRAL_TONE_MAPPING",[Kc]:"CUSTOM_TONE_MAPPING"};function t0(a,e,t,i,n,s){const r=new zi(e,t,{type:a,depthBuffer:n,stencilBuffer:s,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let o=null,c=null,l=null;const d=new Ct;d.setAttribute("position",new Qe([-1,3,0,-1,-1,0,3,-1,0],3)),d.setAttribute("uv",new Qe([0,2,0,0,2,0],2));const h=new Wu({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new H(d,h),f=new Ud(-1,1,1,-1,0,1);let p=null,v=null,g=!1,m,_=null,M=[],y=!1;this.setSize=function(A,E){r.setSize(A,E),o!==null&&o.setSize(A,E),c!==null&&c.setSize(A,E);for(let x=0;x<M.length;x++){const w=M[x];w.setSize&&w.setSize(A,E)}},this.setEffects=function(A){M=A,y=M.length>0&&M[0].isRenderPass===!0;const E=r.width,x=r.height;M.length>0&&o===null&&(o=new zi(E,x,{type:Hi,depthBuffer:!1,stencilBuffer:!1}),c=new zi(E,x,{type:Hi,depthBuffer:!1,stencilBuffer:!1}));const w=n===!0&&M.some(L=>L.needsDepthTexture===!0);w!==(r.depthTexture!==null)&&(w===!0&&l===null&&(l=new cs(E,x),s===!0&&(l.format=mn,l.type=os)),r.dispose(),r.depthTexture=w?l:null,r.resolveDepthBuffer=w,r.storeMultisampledDepthBuffer=w);for(let L=0;L<M.length;L++){const C=M[L];C.setSize&&C.setSize(E,x),w&&C.needsDepthTexture===!0&&C.setDepthTexture&&C.setDepthTexture(l)}},this.begin=function(A,E){if(g||A.toneMapping===ji&&M.length===0)return!1;if(_=E,E!==null){const x=E.width,w=E.height;(r.width!==x||r.height!==w)&&this.setSize(x,w)}return y===!1&&A.setRenderTarget(r),m=A.toneMapping,A.toneMapping=ji,!0},this.hasRenderPass=function(){return y},this.end=function(A,E){A.toneMapping=m,g=!0;let x=r,w=o;for(let L=0;L<M.length;L++){const C=M[L];C.enabled!==!1&&(C.render(A,w,x,E),C.needsSwap!==!1&&(x=w,w=w===o?c:o))}if(p!==A.outputColorSpace||v!==A.toneMapping){p=A.outputColorSpace,v=A.toneMapping,h.defines={},nt.getTransfer(p)===dt&&(h.defines.SRGB_TRANSFER="");const L=e0[v];L&&(h.defines[L]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=x.texture,A.setRenderTarget(_),A.render(u,f),_=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){r.dispose(),o!==null&&o.dispose(),c!==null&&c.dispose(),d.dispose(),h.dispose()}}const Bd=new Qt,Hd=new cs(1,1),Gd=new yd(1),Vd=new ud,Wd=new qh,qd=new _d,pc=[],mc=[],gc=new Float32Array(16),vc=new Float32Array(9),xc=new Float32Array(4);function xs(a,e,t){const i=a[0];if(i<=0||i>0)return a;const n=e*t;let s=pc[n];if(s===void 0&&(s=new Float32Array(n),pc[n]=s),e!==0){i.toArray(s,0);for(let r=1,o=0;r!==e;++r)o+=t,a[r].toArray(s,o)}return s}function Ut(a,e){if(a.length!==e.length)return!1;for(let t=0,i=a.length;t<i;t++)if(a[t]!==e[t])return!1;return!0}function Ft(a,e){for(let t=0,i=e.length;t<i;t++)a[t]=e[t]}function ar(a,e){let t=mc[e];t===void 0&&(t=new Int32Array(e),mc[e]=t);for(let i=0;i!==e;++i)t[i]=a.allocateTextureUnit();return t}function i0(a,e){const t=this.cache;t[0]!==e&&(a.uniform1f(this.addr,e),t[0]=e)}function n0(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(a.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;a.uniform2fv(this.addr,e),Ft(t,e)}}function s0(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(a.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(a.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ut(t,e))return;a.uniform3fv(this.addr,e),Ft(t,e)}}function a0(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(a.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;a.uniform4fv(this.addr,e),Ft(t,e)}}function r0(a,e){const t=this.cache,i=e.elements;if(i===void 0){if(Ut(t,e))return;a.uniformMatrix2fv(this.addr,!1,e),Ft(t,e)}else{if(Ut(t,i))return;xc.set(i),a.uniformMatrix2fv(this.addr,!1,xc),Ft(t,i)}}function o0(a,e){const t=this.cache,i=e.elements;if(i===void 0){if(Ut(t,e))return;a.uniformMatrix3fv(this.addr,!1,e),Ft(t,e)}else{if(Ut(t,i))return;vc.set(i),a.uniformMatrix3fv(this.addr,!1,vc),Ft(t,i)}}function l0(a,e){const t=this.cache,i=e.elements;if(i===void 0){if(Ut(t,e))return;a.uniformMatrix4fv(this.addr,!1,e),Ft(t,e)}else{if(Ut(t,i))return;gc.set(i),a.uniformMatrix4fv(this.addr,!1,gc),Ft(t,i)}}function c0(a,e){const t=this.cache;t[0]!==e&&(a.uniform1i(this.addr,e),t[0]=e)}function d0(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(a.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;a.uniform2iv(this.addr,e),Ft(t,e)}}function h0(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(a.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ut(t,e))return;a.uniform3iv(this.addr,e),Ft(t,e)}}function u0(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(a.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;a.uniform4iv(this.addr,e),Ft(t,e)}}function f0(a,e){const t=this.cache;t[0]!==e&&(a.uniform1ui(this.addr,e),t[0]=e)}function p0(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(a.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;a.uniform2uiv(this.addr,e),Ft(t,e)}}function m0(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(a.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ut(t,e))return;a.uniform3uiv(this.addr,e),Ft(t,e)}}function g0(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(a.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;a.uniform4uiv(this.addr,e),Ft(t,e)}}function rr(a){return a.version===0&&(a.compareFunction=od,a.needsUpdate=!0),a}function v0(a,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(a.uniform1i(this.addr,n),i[0]=n);let s;this.type===a.SAMPLER_2D_SHADOW?s=rr(Hd):s=Bd,t.setTexture2D(e||s,n)}function x0(a,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(a.uniform1i(this.addr,n),i[0]=n),t.setTexture3D(e||Wd,n)}function _0(a,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(a.uniform1i(this.addr,n),i[0]=n);let s;this.type===a.SAMPLER_CUBE_SHADOW?s=rr(Gd):s=qd,t.setTextureCube(e||s,n)}function y0(a,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(a.uniform1i(this.addr,n),i[0]=n),t.setTexture2DArray(e||Vd,n)}function M0(a){switch(a){case 5126:return i0;case 35664:return n0;case 35665:return s0;case 35666:return a0;case 35674:return r0;case 35675:return o0;case 35676:return l0;case 5124:case 35670:return c0;case 35667:case 35671:return d0;case 35668:case 35672:return h0;case 35669:case 35673:return u0;case 5125:return f0;case 36294:return p0;case 36295:return m0;case 36296:return g0;case 35678:case 36198:case 36298:case 36306:case 35682:return v0;case 35679:case 36299:case 36307:return x0;case 35680:case 36300:case 36308:case 36293:return _0;case 36289:case 36303:case 36311:case 36292:return y0}}function S0(a,e){a.uniform1fv(this.addr,e)}function b0(a,e){const t=xs(e,this.size,2);a.uniform2fv(this.addr,t)}function w0(a,e){const t=xs(e,this.size,3);a.uniform3fv(this.addr,t)}function E0(a,e){const t=xs(e,this.size,4);a.uniform4fv(this.addr,t)}function A0(a,e){const t=xs(e,this.size,4);a.uniformMatrix2fv(this.addr,!1,t)}function T0(a,e){const t=xs(e,this.size,9);a.uniformMatrix3fv(this.addr,!1,t)}function C0(a,e){const t=xs(e,this.size,16);a.uniformMatrix4fv(this.addr,!1,t)}function R0(a,e){a.uniform1iv(this.addr,e)}function P0(a,e){a.uniform2iv(this.addr,e)}function L0(a,e){a.uniform3iv(this.addr,e)}function D0(a,e){a.uniform4iv(this.addr,e)}function I0(a,e){a.uniform1uiv(this.addr,e)}function N0(a,e){a.uniform2uiv(this.addr,e)}function U0(a,e){a.uniform3uiv(this.addr,e)}function F0(a,e){a.uniform4uiv(this.addr,e)}function z0(a,e,t){const i=this.cache,n=e.length,s=ar(t,n);Ut(i,s)||(a.uniform1iv(this.addr,s),Ft(i,s));let r;this.type===a.SAMPLER_2D_SHADOW?r=rr(Hd):r=Bd;for(let o=0;o!==n;++o)t.setTexture2D(e[o]||r,s[o])}function O0(a,e,t){const i=this.cache,n=e.length,s=ar(t,n);Ut(i,s)||(a.uniform1iv(this.addr,s),Ft(i,s));for(let r=0;r!==n;++r)t.setTexture3D(e[r]||Wd,s[r])}function k0(a,e,t){const i=this.cache,n=e.length,s=ar(t,n);Ut(i,s)||(a.uniform1iv(this.addr,s),Ft(i,s));let r;this.type===a.SAMPLER_CUBE_SHADOW?r=rr(Gd):r=qd;for(let o=0;o!==n;++o)t.setTextureCube(e[o]||r,s[o])}function B0(a,e,t){const i=this.cache,n=e.length,s=ar(t,n);Ut(i,s)||(a.uniform1iv(this.addr,s),Ft(i,s));for(let r=0;r!==n;++r)t.setTexture2DArray(e[r]||Vd,s[r])}function H0(a){switch(a){case 5126:return S0;case 35664:return b0;case 35665:return w0;case 35666:return E0;case 35674:return A0;case 35675:return T0;case 35676:return C0;case 5124:case 35670:return R0;case 35667:case 35671:return P0;case 35668:case 35672:return L0;case 35669:case 35673:return D0;case 5125:return I0;case 36294:return N0;case 36295:return U0;case 36296:return F0;case 35678:case 36198:case 36298:case 36306:case 35682:return z0;case 35679:case 36299:case 36307:return O0;case 35680:case 36300:case 36308:case 36293:return k0;case 36289:case 36303:case 36311:case 36292:return B0}}class G0{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=M0(t.type)}}class V0{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=H0(t.type)}}class W0{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const n=this.seq;for(let s=0,r=n.length;s!==r;++s){const o=n[s];o.setValue(e,t[o.id],i)}}}const Br=/(\w+)(\])?(\[|\.)?/g;function _c(a,e){a.seq.push(e),a.map[e.id]=e}function q0(a,e,t){const i=a.name,n=i.length;for(Br.lastIndex=0;;){const s=Br.exec(i),r=Br.lastIndex;let o=s[1];const c=s[2]==="]",l=s[3];if(c&&(o=o|0),l===void 0||l==="["&&r+2===n){_c(t,l===void 0?new G0(o,a,e):new V0(o,a,e));break}else{let h=t.map[o];h===void 0&&(h=new W0(o),_c(t,h)),t=h}}}class Ha{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const o=e.getActiveUniform(t,r),c=e.getUniformLocation(t,o.name);q0(o,c,this)}const n=[],s=[];for(const r of this.seq)r.type===e.SAMPLER_2D_SHADOW||r.type===e.SAMPLER_CUBE_SHADOW||r.type===e.SAMPLER_2D_ARRAY_SHADOW?n.push(r):s.push(r);n.length>0&&(this.seq=n.concat(s))}setValue(e,t,i,n){const s=this.map[t];s!==void 0&&s.setValue(e,i,n)}setOptional(e,t,i){const n=t[i];n!==void 0&&this.setValue(e,i,n)}static upload(e,t,i,n){for(let s=0,r=t.length;s!==r;++s){const o=t[s],c=i[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,n)}}static seqWithValue(e,t){const i=[];for(let n=0,s=e.length;n!==s;++n){const r=e[n];r.id in t&&i.push(r)}return i}}function yc(a,e,t){const i=a.createShader(e);return a.shaderSource(i,t),a.compileShader(i),i}const $0=37297;let X0=0;function Y0(a,e){const t=a.split(`
`),i=[],n=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let r=n;r<s;r++){const o=r+1;i.push(`${o===e?">":" "} ${o}: ${t[r]}`)}return i.join(`
`)}const Mc=new We;function K0(a){nt._getMatrix(Mc,nt.workingColorSpace,a);const e=`mat3( ${Mc.elements.map(t=>t.toFixed(4))} )`;switch(nt.getTransfer(a)){case $a:return[e,"LinearTransferOETF"];case dt:return[e,"sRGBTransferOETF"];default:return He("WebGLProgram: Unsupported color space: ",a),[e,"LinearTransferOETF"]}}function Sc(a,e,t){const i=a.getShaderParameter(e,a.COMPILE_STATUS),s=(a.getShaderInfoLog(e)||"").trim();if(i&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+Y0(a.getShaderSource(e),o)}else return s}function Z0(a,e){const t=K0(e);return[`vec4 ${a}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const J0={[$c]:"Linear",[Xc]:"Reinhard",[Yc]:"Cineon",[Go]:"ACESFilmic",[Zc]:"AgX",[Jc]:"Neutral",[Kc]:"Custom"};function Q0(a,e){const t=J0[e];return t===void 0?(He("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+a+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+a+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const La=new I;function j0(){nt.getLuminanceCoefficients(La);const a=La.x.toFixed(4),e=La.y.toFixed(4),t=La.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${a}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function eg(a){return[a.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",a.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(zs).join(`
`)}function tg(a){const e=[];for(const t in a){const i=a[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function ig(a,e){const t={},i=a.getProgramParameter(e,a.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){const s=a.getActiveAttrib(e,n),r=s.name;let o=1;s.type===a.FLOAT_MAT2&&(o=2),s.type===a.FLOAT_MAT3&&(o=3),s.type===a.FLOAT_MAT4&&(o=4),t[r]={type:s.type,location:a.getAttribLocation(e,r),locationSize:o}}return t}function zs(a){return a!==""}function bc(a,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return a.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function wc(a,e){return a.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const ng=/^[ \t]*#include +<([\w\d./]+)>/gm;function ko(a){return a.replace(ng,sg)}function sg(a,e){const t=Ke[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return ko(t)}const ag=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ec(a){return a.replace(ag,rg)}function rg(a,e,t,i){let n="";for(let s=parseInt(e);s<parseInt(t);s++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return n}function Ac(a){let e=`precision ${a.precision} float;
	precision ${a.precision} int;
	precision ${a.precision} sampler2D;
	precision ${a.precision} samplerCube;
	precision ${a.precision} sampler3D;
	precision ${a.precision} sampler2DArray;
	precision ${a.precision} sampler2DShadow;
	precision ${a.precision} samplerCubeShadow;
	precision ${a.precision} sampler2DArrayShadow;
	precision ${a.precision} isampler2D;
	precision ${a.precision} isampler3D;
	precision ${a.precision} isamplerCube;
	precision ${a.precision} isampler2DArray;
	precision ${a.precision} usampler2D;
	precision ${a.precision} usampler3D;
	precision ${a.precision} usamplerCube;
	precision ${a.precision} usampler2DArray;
	`;return a.precision==="highp"?e+=`
#define HIGH_PRECISION`:a.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:a.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const og={[Ua]:"SHADOWMAP_TYPE_PCF",[Ns]:"SHADOWMAP_TYPE_VSM"};function lg(a){return og[a.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const cg={[qs]:"ENVMAP_MODE_REFRACTION"};function dg(a){return a.envMap===!1?"ENVMAP_MODE_REFLECTION":cg[a.envMapMode]||"ENVMAP_MODE_REFLECTION"}const hg={[qc]:"ENVMAP_BLENDING_MULTIPLY",[bh]:"ENVMAP_BLENDING_MIX",[wh]:"ENVMAP_BLENDING_ADD"};function ug(a){return a.envMap===!1?"ENVMAP_BLENDING_NONE":hg[a.combine]||"ENVMAP_BLENDING_NONE"}function fg(a,e,t,i){const n=a.getContext(),s=t.defines;let r=t.vertexShader,o=t.fragmentShader;const c=lg(t),l=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",d=dg(t),h=ug(t),u=eg(t),f=tg(s),p=n.createProgram();let v,g,m=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(zs).join(`
`),v.length>0&&(v+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(zs).join(`
`),g.length>0&&(g+=`
`)):(v=[Ac(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(zs).join(`
`),g=[Ac(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+d:"",t.envMap?"#define "+h:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ji?"#define TONE_MAPPING":"",t.toneMapping!==ji?Ke.tonemapping_pars_fragment:"",t.toneMapping!==ji?Q0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ke.colorspace_pars_fragment,Z0("linearToOutputTexel",t.outputColorSpace),j0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(zs).join(`
`)),r=ko(r),r=bc(r,t),r=wc(r,t),o=ko(o),o=bc(o,t),o=wc(o,t),r=Ec(r),o=Ec(o),t.isRawShaderMaterial!==!0&&(m=`#version 300 es
`,v=[u,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,g=["#define varying in",t.glslVersion===El?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===El?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const _=m+v+r,M=m+g+o,y=yc(n,n.VERTEX_SHADER,_),A=yc(n,n.FRAGMENT_SHADER,M);n.attachShader(p,y),n.attachShader(p,A),t.index0AttributeName!==void 0?n.bindAttribLocation(p,0,t.index0AttributeName):t.hasPositionAttribute===!0&&n.bindAttribLocation(p,0,"position"),n.linkProgram(p);function E(C){if(a.debug.checkShaderErrors){const N=n.getProgramInfoLog(p)||"",F=n.getShaderInfoLog(y)||"",W=n.getShaderInfoLog(A)||"",P=N.trim(),G=F.trim(),K=W.trim();let B=!0,ie=!0;if(n.getProgramParameter(p,n.LINK_STATUS)===!1)if(B=!1,typeof a.debug.onShaderError=="function")a.debug.onShaderError(n,p,y,A);else{const $=Sc(n,y,"vertex"),j=Sc(n,A,"fragment");ot("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(p,n.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+P+`
`+$+`
`+j)}else P!==""?He("WebGLProgram: Program Info Log:",P):(G===""||K==="")&&(ie=!1);ie&&(C.diagnostics={runnable:B,programLog:P,vertexShader:{log:G,prefix:v},fragmentShader:{log:K,prefix:g}})}n.deleteShader(y),n.deleteShader(A),x=new Ha(n,p),w=ig(n,p)}let x;this.getUniforms=function(){return x===void 0&&E(this),x};let w;this.getAttributes=function(){return w===void 0&&E(this),w};let L=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return L===!1&&(L=n.getProgramParameter(p,$0)),L},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(p),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=X0++,this.cacheKey=e,this.usedTimes=1,this.program=p,this.vertexShader=y,this.fragmentShader=A,this}let pg=0;class mg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){const n=this._getShaderCacheForMaterial(e);return n.has(t)===!1&&(n.add(t),t.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new gg(e),t.set(e,i)),i}}class gg{constructor(e){this.id=pg++,this.code=e,this.usedTimes=0}}function vg(a){return a===In||a===Ga||a===Va}function xg(a,e,t,i,n,s){const r=new fd,o=new mg,c=new Set,l=[],d=new Map,h=i.logarithmicDepthBuffer,u={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(x){return c.add(x),x===0?"uv":`uv${x}`}function p(x,w,L,C,N,F){const W=C.fog,P=N.geometry,G=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?C.environment:null,K=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,B=e.get(x.envMap||G,K),ie=u[x.type];let $=i.precision;x.precision!==null&&($=i.getMaxPrecision(x.precision),$!==x.precision&&He("WebGLProgram.getParameters:",x.precision,"not supported, using",$,"instead."));const j=P.morphAttributes.position||P.morphAttributes.normal||P.morphAttributes.color,te=j!==void 0?j.length:0;let be=0;P.morphAttributes.position!==void 0&&(be=1),P.morphAttributes.normal!==void 0&&(be=2),P.morphAttributes.color!==void 0&&(be=3);let Be,Z,fe,Se;if(ie){const ge=Ui[ie];Be=ge.vertexShader,Z=ge.fragmentShader}else{Be=x.vertexShader,Z=x.fragmentShader;const ge=o.getVertexShaderStage(x),ct=o.getFragmentShaderStage(x);o.update(x,ge,ct),fe=ge.id,Se=ct.id}const Oe=a.getRenderTarget(),me=a.state.buffers.depth.getReversed(),ye=N.isInstancedMesh===!0,Ie=N.isBatchedMesh===!0,Me=!!x.map,je=!!x.matcap,at=!!B,$e=at&&B.isPMREMTexture===!0,Ht=!!x.aoMap,Lt=!!x.lightMap,si=!!x.bumpMap&&x.wireframe===!1,St=!!x.normalMap,Ri=!!x.displacementMap,zt=!!x.emissiveMap,ui=!!x.metalnessMap,fi=!!x.roughnessMap,pi=x.anisotropy>0,U=x.clearcoat>0,mi=x.diffuseRoughness>0,_t=x.dispersion>0,yt=x.retroreflectivity>0,pe=x.iridescence>0,Dt=x.sheen>0,ke=x.transmission>0,Ve=pi&&!!x.anisotropyMap,T=U&&!!x.clearcoatMap,S=U&&!!x.clearcoatNormalMap,O=U&&!!x.clearcoatRoughnessMap,ne=mi&&!!x.diffuseRoughnessMap,ee=pe&&!!x.iridescenceMap,re=pe&&!!x.iridescenceThicknessMap,he=Dt&&!!x.sheenColorMap,Y=Dt&&!!x.sheenRoughnessMap,J=!!x.specularMap,le=!!x.specularColorMap,R=!!x.specularIntensityMap,Q=ke&&!!x.transmissionMap,X=ke&&!!x.thicknessMap,ce=!!x.gradientMap,ae=!!x.alphaMap,oe=x.alphaTest>0,Ne=!!x.alphaHash,Ye=!!x.extensions;let se=ji;x.toneMapped&&(Oe===null||Oe.isXRRenderTarget===!0)&&(se=a.toneMapping);const ze=$e?B.isCompressedCubeTexture?B.image[0].mipmaps:B.mipmaps:null,Xe={shaderID:ie,shaderType:x.type,shaderName:x.name,vertexShader:Be,fragmentShader:Z,defines:x.defines,customVertexShaderID:fe,customFragmentShaderID:Se,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:$,batching:Ie,batchingColor:Ie&&N._colorsTexture!==null,instancing:ye,instancingColor:ye&&N.instanceColor!==null,instancingMorph:ye&&N.morphTexture!==null,outputColorSpace:Oe===null?a.outputColorSpace:Oe.isXRRenderTarget===!0?Oe.texture.colorSpace:nt.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:Me,matcap:je,envMap:at,envMapMode:at&&B.mapping,envMapPMREM:$e,envMapMaxLod:$e?ze.length-1:null,envMapSize:$e?ze[0].width:null,aoMap:Ht,lightMap:Lt,bumpMap:si,normalMap:St,displacementMap:Ri,emissiveMap:zt,normalMapObjectSpace:St&&x.normalMapType===Th,normalMapTangentSpace:St&&x.normalMapType===Wa,packedNormalMap:St&&x.normalMapType===Wa&&vg(x.normalMap.format),metalnessMap:ui,roughnessMap:fi,anisotropy:pi,anisotropyMap:Ve,clearcoat:U,clearcoatMap:T,clearcoatNormalMap:S,clearcoatRoughnessMap:O,diffuseRoughness:mi,diffuseRoughnessMap:ne,dispersion:_t,retroreflection:yt,iridescence:pe,iridescenceMap:ee,iridescenceThicknessMap:re,sheen:Dt,sheenColorMap:he,sheenRoughnessMap:Y,specularMap:J,specularColorMap:le,specularIntensityMap:R,transmission:ke,transmissionMap:Q,thicknessMap:X,gradientMap:ce,opaque:x.transparent===!1&&x.blending===ks&&x.alphaToCoverage===!1,alphaMap:ae,alphaTest:oe,alphaHash:Ne,combine:x.combine,mapUv:Me&&f(x.map.channel),aoMapUv:Ht&&f(x.aoMap.channel),lightMapUv:Lt&&f(x.lightMap.channel),bumpMapUv:si&&f(x.bumpMap.channel),normalMapUv:St&&f(x.normalMap.channel),displacementMapUv:Ri&&f(x.displacementMap.channel),emissiveMapUv:zt&&f(x.emissiveMap.channel),metalnessMapUv:ui&&f(x.metalnessMap.channel),roughnessMapUv:fi&&f(x.roughnessMap.channel),anisotropyMapUv:Ve&&f(x.anisotropyMap.channel),clearcoatMapUv:T&&f(x.clearcoatMap.channel),clearcoatNormalMapUv:S&&f(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:O&&f(x.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:ne&&f(x.diffuseRoughnessMap.channel),iridescenceMapUv:ee&&f(x.iridescenceMap.channel),iridescenceThicknessMapUv:re&&f(x.iridescenceThicknessMap.channel),sheenColorMapUv:he&&f(x.sheenColorMap.channel),sheenRoughnessMapUv:Y&&f(x.sheenRoughnessMap.channel),specularMapUv:J&&f(x.specularMap.channel),specularColorMapUv:le&&f(x.specularColorMap.channel),specularIntensityMapUv:R&&f(x.specularIntensityMap.channel),transmissionMapUv:Q&&f(x.transmissionMap.channel),thicknessMapUv:X&&f(x.thicknessMap.channel),alphaMapUv:ae&&f(x.alphaMap.channel),vertexTangents:!!P.attributes.tangent&&(St||pi),vertexNormals:!!P.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!P.attributes.color&&P.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!P.attributes.uv&&(Me||ae),fog:!!W,useFog:x.fog===!0,fogExp2:!!W&&W.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||P.attributes.normal===void 0&&St===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:me,skinning:N.isSkinnedMesh===!0,hasPositionAttribute:P.attributes.position!==void 0,morphTargets:P.morphAttributes.position!==void 0,morphNormals:P.morphAttributes.normal!==void 0,morphColors:P.morphAttributes.color!==void 0,morphTargetsCount:te,morphTextureStride:be,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:F.filter(ge=>ge.texture!==null).length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:x.dithering,shadowMapEnabled:a.shadowMap.enabled&&L.length>0,shadowMapType:a.shadowMap.type,toneMapping:se,decodeVideoTexture:Me&&x.map.isVideoTexture===!0&&nt.getTransfer(x.map.colorSpace)===dt,decodeVideoTextureEmissive:zt&&x.emissiveMap.isVideoTexture===!0&&nt.getTransfer(x.emissiveMap.colorSpace)===dt,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===pt,flipSided:x.side===Vt,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:Ye&&x.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ye&&x.extensions.multiDraw===!0||Ie)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Xe.vertexUv1s=c.has(1),Xe.vertexUv2s=c.has(2),Xe.vertexUv3s=c.has(3),c.clear(),Xe}function v(x){const w=[];if(x.shaderID?w.push(x.shaderID):(w.push(x.customVertexShaderID),w.push(x.customFragmentShaderID)),x.defines!==void 0)for(const L in x.defines)w.push(L),w.push(x.defines[L]);return x.isRawShaderMaterial===!1&&(g(w,x),m(w,x),w.push(a.outputColorSpace)),w.push(x.customProgramCacheKey),w.join()}function g(x,w){x.push(w.precision),x.push(w.outputColorSpace),x.push(w.envMapMode),x.push(w.envMapPMREM),x.push(w.envMapMaxLod),x.push(w.envMapSize),x.push(w.mapUv),x.push(w.alphaMapUv),x.push(w.lightMapUv),x.push(w.aoMapUv),x.push(w.bumpMapUv),x.push(w.normalMapUv),x.push(w.displacementMapUv),x.push(w.emissiveMapUv),x.push(w.metalnessMapUv),x.push(w.roughnessMapUv),x.push(w.anisotropyMapUv),x.push(w.clearcoatMapUv),x.push(w.clearcoatNormalMapUv),x.push(w.clearcoatRoughnessMapUv),x.push(w.diffuseRoughnessMapUv),x.push(w.iridescenceMapUv),x.push(w.iridescenceThicknessMapUv),x.push(w.sheenColorMapUv),x.push(w.sheenRoughnessMapUv),x.push(w.specularMapUv),x.push(w.specularColorMapUv),x.push(w.specularIntensityMapUv),x.push(w.transmissionMapUv),x.push(w.thicknessMapUv),x.push(w.combine),x.push(w.fogExp2),x.push(w.sizeAttenuation),x.push(w.morphTargetsCount),x.push(w.numSunLights),x.push(w.numDirLights),x.push(w.numPointLights),x.push(w.numSpotLights),x.push(w.numSpotLightMaps),x.push(w.numHemiLights),x.push(w.numRectAreaLights),x.push(w.numSunLightShadows),x.push(w.numDirLightShadows),x.push(w.numPointLightShadows),x.push(w.numSpotLightShadows),x.push(w.numSpotLightShadowsWithMaps),x.push(w.numLightProbes),x.push(w.numLightProbeGrids),x.push(w.shadowMapType),x.push(w.toneMapping),x.push(w.numClippingPlanes),x.push(w.numClipIntersection),x.push(w.depthPacking)}function m(x,w){r.disableAll(),w.instancing&&r.enable(0),w.instancingColor&&r.enable(1),w.instancingMorph&&r.enable(2),w.matcap&&r.enable(3),w.envMap&&r.enable(4),w.normalMapObjectSpace&&r.enable(5),w.normalMapTangentSpace&&r.enable(6),w.clearcoat&&r.enable(7),w.iridescence&&r.enable(8),w.alphaTest&&r.enable(9),w.vertexColors&&r.enable(10),w.vertexAlphas&&r.enable(11),w.vertexUv1s&&r.enable(12),w.vertexUv2s&&r.enable(13),w.vertexUv3s&&r.enable(14),w.vertexTangents&&r.enable(15),w.anisotropy&&r.enable(16),w.alphaHash&&r.enable(17),w.batching&&r.enable(18),w.dispersion&&r.enable(19),w.retroreflection&&r.enable(24),w.diffuseRoughness&&r.enable(25),w.batchingColor&&r.enable(20),w.gradientMap&&r.enable(21),w.packedNormalMap&&r.enable(22),w.vertexNormals&&r.enable(23),x.push(r.mask),r.disableAll(),w.fog&&r.enable(0),w.useFog&&r.enable(1),w.flatShading&&r.enable(2),w.logarithmicDepthBuffer&&r.enable(3),w.reversedDepthBuffer&&r.enable(4),w.skinning&&r.enable(5),w.morphTargets&&r.enable(6),w.morphNormals&&r.enable(7),w.morphColors&&r.enable(8),w.premultipliedAlpha&&r.enable(9),w.shadowMapEnabled&&r.enable(10),w.doubleSided&&r.enable(11),w.flipSided&&r.enable(12),w.useDepthPacking&&r.enable(13),w.dithering&&r.enable(14),w.transmission&&r.enable(15),w.sheen&&r.enable(16),w.opaque&&r.enable(17),w.pointsUvs&&r.enable(18),w.decodeVideoTexture&&r.enable(19),w.decodeVideoTextureEmissive&&r.enable(20),w.alphaToCoverage&&r.enable(21),w.numLightProbeGrids>0&&r.enable(22),w.hasPositionAttribute&&r.enable(23),x.push(r.mask)}function _(x){const w=u[x.type];let L;if(w){const C=Ui[w];L=Hu.clone(C.uniforms)}else L=x.uniforms;return L}function M(x,w){let L=d.get(w);return L!==void 0?++L.usedTimes:(L=new fg(a,w,x,n),l.push(L),d.set(w,L)),L}function y(x){if(--x.usedTimes===0){const w=l.indexOf(x);l[w]=l[l.length-1],l.pop(),d.delete(x.cacheKey),x.destroy()}}function A(x){o.remove(x)}function E(){o.dispose()}return{getParameters:p,getProgramCacheKey:v,getUniforms:_,acquireProgram:M,releaseProgram:y,releaseShaderCache:A,programs:l,dispose:E}}function _g(){let a=new WeakMap;function e(r){return a.has(r)}function t(r){let o=a.get(r);return o===void 0&&(o={},a.set(r,o)),o}function i(r){a.delete(r)}function n(r,o,c){a.get(r)[o]=c}function s(){a=new WeakMap}return{has:e,get:t,remove:i,update:n,dispose:s}}function yg(a,e){return a.groupOrder!==e.groupOrder?a.groupOrder-e.groupOrder:a.renderOrder!==e.renderOrder?a.renderOrder-e.renderOrder:a.material.id!==e.material.id?a.material.id-e.material.id:a.materialVariant!==e.materialVariant?a.materialVariant-e.materialVariant:a.z!==e.z?a.z-e.z:a.id-e.id}function Tc(a,e){return a.groupOrder!==e.groupOrder?a.groupOrder-e.groupOrder:a.renderOrder!==e.renderOrder?a.renderOrder-e.renderOrder:a.z!==e.z?e.z-a.z:a.id-e.id}function Cc(){const a=[];let e=0;const t=[],i=[],n=[];function s(){e=0,t.length=0,i.length=0,n.length=0}function r(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function o(u,f,p,v,g,m){let _=a[e];return _===void 0?(_={id:u.id,object:u,geometry:f,material:p,materialVariant:r(u),groupOrder:v,renderOrder:u.renderOrder,z:g,group:m},a[e]=_):(_.id=u.id,_.object=u,_.geometry=f,_.material=p,_.materialVariant=r(u),_.groupOrder=v,_.renderOrder=u.renderOrder,_.z=g,_.group=m),e++,_}function c(u,f,p,v,g,m,_){_.reversedDepth===!0&&(g=-g);const M=o(u,f,p,v,g,m);p.transmission>0?i.push(M):p.transparent===!0?n.push(M):t.push(M)}function l(u,f,p,v,g,m){const _=o(u,f,p,v,g,m);p.transmission>0?i.unshift(_):p.transparent===!0?n.unshift(_):t.unshift(_)}function d(u,f){t.length>1&&t.sort(u||yg),i.length>1&&i.sort(f||Tc),n.length>1&&n.sort(f||Tc)}function h(){for(let u=e,f=a.length;u<f;u++){const p=a[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:i,transparent:n,init:s,push:c,unshift:l,finish:h,sort:d}}function Mg(){let a=new WeakMap;function e(i,n){const s=a.get(i);let r;return s===void 0?(r=new Cc,a.set(i,[r])):n>=s.length?(r=new Cc,s.push(r)):r=s[n],r}function t(){a=new WeakMap}return{get:e,dispose:t}}function Sg(){const a={};return{get:function(e){if(a[e.id]!==void 0)return a[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new I,color:new Ce};break;case"SpotLight":t={position:new I,direction:new I,color:new Ce,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new Ce,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new Ce,groundColor:new Ce};break;case"RectAreaLight":t={color:new Ce,position:new I,halfWidth:new I,halfHeight:new I};break}return a[e.id]=t,t}}}function bg(){const a={};return{get:function(e){if(a[e.id]!==void 0)return a[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe,shadowCameraNear:1,shadowCameraFar:1e3};break}return a[e.id]=t,t}}}let wg=0;function Eg(a,e){return(e.castShadow?2:0)-(a.castShadow?2:0)+(e.map?1:0)-(a.map?1:0)}function Ag(a){const e=new Sg,t=bg(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new I);const n=new I,s=new ht,r=new ht;function o(l){let d=0,h=0,u=0;for(let F=0;F<9;F++)i.probe[F].set(0,0,0);let f=0,p=0,v=0,g=0,m=0,_=0,M=0,y=0,A=0,E=0,x=0,w=0,L=0,C=0;l.sort(Eg);for(let F=0,W=l.length;F<W;F++){const P=l[F],G=P.color,K=P.intensity,B=P.distance;let ie=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===In?ie=P.shadow.map.texture:ie=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)d+=G.r*K,h+=G.g*K,u+=G.b*K;else if(P.isLightProbe){for(let $=0;$<9;$++)i.probe[$].addScaledVector(P.sh.coefficients[$],K);C++}else if(P.isSunLight){const $=e.get(P);if($.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const j=P.shadow,te=t.get(P);te.shadowIntensity=j.intensity,te.shadowBias=j.bias,te.shadowNormalBias=j.normalBias,te.shadowRadius=j.radius,te.shadowMapSize.copy(j.mapSize).multiply(j.getFrameExtents()),i.sunShadow[p]=te,i.sunShadowMap[p]=ie;const be=j.getViewportCount();for(let Be=0;Be<be;Be++)i.sunShadowMatrix[v+Be]=j.getMatrix(Be),i.sunShadowCascade[v+Be]=j._cascadeData[Be];v+=be,p++}i.sun[f]=$,f++}else if(P.isDirectionalLight){const $=e.get(P);if($.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const j=P.shadow,te=t.get(P);te.shadowIntensity=j.intensity,te.shadowBias=j.bias,te.shadowNormalBias=j.normalBias,te.shadowRadius=j.radius,te.shadowMapSize=j.mapSize,i.directionalShadow[g]=te,i.directionalShadowMap[g]=ie,i.directionalShadowMatrix[g]=P.shadow.matrix,A++}i.directional[g]=$,g++}else if(P.isSpotLight){const $=e.get(P);$.position.setFromMatrixPosition(P.matrixWorld),$.color.copy(G).multiplyScalar(K),$.distance=B,$.coneCos=Math.cos(P.angle),$.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),$.decay=P.decay,i.spot[_]=$;const j=P.shadow;if(P.map&&(i.spotLightMap[w]=P.map,w++,j.updateMatrices(P),P.castShadow&&L++),i.spotLightMatrix[_]=j.matrix,P.castShadow){const te=t.get(P);te.shadowIntensity=j.intensity,te.shadowBias=j.bias,te.shadowNormalBias=j.normalBias,te.shadowRadius=j.radius,te.shadowMapSize=j.mapSize,i.spotShadow[_]=te,i.spotShadowMap[_]=ie,x++}_++}else if(P.isRectAreaLight){const $=e.get(P);$.color.copy(G).multiplyScalar(K),$.halfWidth.set(P.width*.5,0,0),$.halfHeight.set(0,P.height*.5,0),i.rectArea[M]=$,M++}else if(P.isPointLight){const $=e.get(P);if($.color.copy(P.color).multiplyScalar(P.intensity),$.distance=P.distance,$.decay=P.decay,P.castShadow){const j=P.shadow,te=t.get(P);te.shadowIntensity=j.intensity,te.shadowBias=j.bias,te.shadowNormalBias=j.normalBias,te.shadowRadius=j.radius,te.shadowMapSize=j.mapSize,te.shadowCameraNear=j.camera.near,te.shadowCameraFar=j.camera.far,i.pointShadow[m]=te,i.pointShadowMap[m]=ie,i.pointShadowMatrix[m]=P.shadow.matrix,E++}i.point[m]=$,m++}else if(P.isHemisphereLight){const $=e.get(P);$.skyColor.copy(P.color).multiplyScalar(K),$.groundColor.copy(P.groundColor).multiplyScalar(K),i.hemi[y]=$,y++}}M>0&&(a.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ve.LTC_FLOAT_1,i.rectAreaLTC2=ve.LTC_FLOAT_2):(i.rectAreaLTC1=ve.LTC_HALF_1,i.rectAreaLTC2=ve.LTC_HALF_2)),i.ambient[0]=d,i.ambient[1]=h,i.ambient[2]=u;const N=i.hash;(N.sunLength!==f||N.directionalLength!==g||N.pointLength!==m||N.spotLength!==_||N.rectAreaLength!==M||N.hemiLength!==y||N.numSunShadows!==p||N.numDirectionalShadows!==A||N.numPointShadows!==E||N.numSpotShadows!==x||N.numSpotMaps!==w||N.numLightProbes!==C)&&(i.sun.length=f,i.directional.length=g,i.spot.length=_,i.rectArea.length=M,i.point.length=m,i.hemi.length=y,i.sunShadow.length=p,i.sunShadowMap.length=p,i.sunShadowMatrix.length=v,i.sunShadowCascade.length=v,i.directionalShadow.length=A,i.directionalShadowMap.length=A,i.directionalShadowMatrix.length=A,i.pointShadow.length=E,i.pointShadowMap.length=E,i.pointShadowMatrix.length=E,i.spotShadow.length=x,i.spotShadowMap.length=x,i.spotLightMatrix.length=x+w-L,i.spotLightMap.length=w,i.numSpotLightShadowsWithMaps=L,i.numLightProbes=C,N.sunLength=f,N.directionalLength=g,N.pointLength=m,N.spotLength=_,N.rectAreaLength=M,N.hemiLength=y,N.numSunShadows=p,N.numDirectionalShadows=A,N.numPointShadows=E,N.numSpotShadows=x,N.numSpotMaps=w,N.numLightProbes=C,i.version=wg++)}function c(l,d){let h=0,u=0,f=0,p=0,v=0,g=0;const m=d.matrixWorldInverse;for(let _=0,M=l.length;_<M;_++){const y=l[_];if(y.isSunLight){const A=i.sun[h];A.direction.setFromMatrixPosition(y.matrixWorld),A.direction.transformDirection(m),h++}else if(y.isDirectionalLight){const A=i.directional[u];A.direction.setFromMatrixPosition(y.matrixWorld),n.setFromMatrixPosition(y.target.matrixWorld),A.direction.sub(n),A.direction.transformDirection(m),u++}else if(y.isSpotLight){const A=i.spot[p];A.position.setFromMatrixPosition(y.matrixWorld),A.position.applyMatrix4(m),A.direction.setFromMatrixPosition(y.matrixWorld),n.setFromMatrixPosition(y.target.matrixWorld),A.direction.sub(n),A.direction.transformDirection(m),p++}else if(y.isRectAreaLight){const A=i.rectArea[v];A.position.setFromMatrixPosition(y.matrixWorld),A.position.applyMatrix4(m),r.identity(),s.copy(y.matrixWorld),s.premultiply(m),r.extractRotation(s),A.halfWidth.set(y.width*.5,0,0),A.halfHeight.set(0,y.height*.5,0),A.halfWidth.applyMatrix4(r),A.halfHeight.applyMatrix4(r),v++}else if(y.isPointLight){const A=i.point[f];A.position.setFromMatrixPosition(y.matrixWorld),A.position.applyMatrix4(m),f++}else if(y.isHemisphereLight){const A=i.hemi[g];A.direction.setFromMatrixPosition(y.matrixWorld),A.direction.transformDirection(m),g++}}}return{setup:o,setupView:c,state:i}}function Rc(a){const e=new Ag(a),t=[],i=[],n=[];function s(h){d.camera=h,t.length=0,i.length=0,n.length=0}function r(h){h.isLightProbeGrid?n.push(h):t.push(h)}function o(h){i.push(h)}function c(){e.setup(t),n.sort((h,u)=>h.priority-u.priority||h.id-u.id)}function l(h){e.setupView(t,h)}const d={lightsArray:t,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:d,setupLights:c,setupLightsView:l,pushLight:r,pushShadow:o}}function Tg(a){let e=new WeakMap;function t(n,s=0){const r=e.get(n);let o;return r===void 0?(o=new Rc(a),e.set(n,[o])):s>=r.length?(o=new Rc(a),r.push(o)):o=r[s],o}function i(){e=new WeakMap}return{get:t,dispose:i}}const Cg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Rg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Pg=[new I(1,0,0),new I(-1,0,0),new I(0,1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1)],Lg=[new I(0,-1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1),new I(0,-1,0),new I(0,-1,0)],Pc=new ht,Ps=new I,Hr=new I;function Dg(a,e,t){let i=new Ys;const n=new xe,s=new xe,r=new wt,o=new qu,c=new $u,l={},d=t.maxTextureSize,h={[Dn]:Vt,[Vt]:Dn,[pt]:pt},u=new Vi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new xe},radius:{value:4}},vertexShader:Cg,fragmentShader:Rg}),f=u.clone();f.defines.HORIZONTAL_PASS=1;const p=new Ct;p.setAttribute("position",new Oi(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new H(p,u),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ua;let m=this.type;this.render=function(E,x,w){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||E.length===0)return;this.type===Gc&&(He("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Ua);const L=a.getRenderTarget(),C=a.getActiveCubeFace(),N=a.getActiveMipmapLevel(),F=a.state;F.setBlending(ns),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);const W=m!==this.type;W&&x.traverse(function(P){P.material&&(Array.isArray(P.material)?P.material.forEach(G=>G.needsUpdate=!0):P.material.needsUpdate=!0)});for(let P=0,G=E.length;P<G;P++){const K=E[P],B=K.shadow;if(B===void 0){He("WebGLShadowMap:",K,"has no shadow.");continue}if(B.autoUpdate===!1&&B.needsUpdate===!1)continue;n.copy(B.mapSize);const ie=B.getFrameExtents();n.multiply(ie),s.copy(B.mapSize),(n.x>d||n.y>d)&&(n.x>d&&(s.x=Math.floor(d/ie.x),n.x=s.x*ie.x,B.mapSize.x=s.x),n.y>d&&(s.y=Math.floor(d/ie.y),n.y=s.y*ie.y,B.mapSize.y=s.y));const $=a.state.buffers.depth.getReversed();if(B.camera._reversedDepth=$,B.map===null||W===!0){if(B.map!==null&&(B.map.depthTexture!==null&&(B.map.depthTexture.dispose(),B.map.depthTexture=null),B.map.dispose()),this.type===Ns){if(K.isPointLight){He("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}B.map=new zi(n.x,n.y,{format:In,type:Hi,minFilter:oi,magFilter:oi,generateMipmaps:!1}),B.map.texture.name=K.name+".shadowMap",B.map.depthTexture=new cs(n.x,n.y,Ai),B.map.depthTexture.name=K.name+".shadowMapDepth",B.map.depthTexture.format=gn,B.map.depthTexture.compareFunction=null,B.map.depthTexture.minFilter=Nt,B.map.depthTexture.magFilter=Nt}else K.isPointLight?(B.map=new nl(n.x),B.map.depthTexture=new yd(n.x,Bi)):(B.map=new zi(n.x,n.y),B.map.depthTexture=new cs(n.x,n.y,Bi)),B.map.depthTexture.name=K.name+".shadowMap",B.map.depthTexture.format=gn,this.type===Ua?(B.map.depthTexture.compareFunction=$?rd:ad,B.map.depthTexture.minFilter=oi,B.map.depthTexture.magFilter=oi):(B.map.depthTexture.compareFunction=null,B.map.depthTexture.minFilter=Nt,B.map.depthTexture.magFilter=Nt);B.camera.updateProjectionMatrix()}B.map.isWebGLCubeRenderTarget!==!0&&(B.map.width!==n.x||B.map.height!==n.y)&&B.map.setSize(n.x,n.y);const j=B.map.isWebGLCubeRenderTarget?6:B.getViewportCount();K.isPointLight!==!0&&B.updateMatrices(K,w);const te=(B.camera.layers.mask&4294967294)!==0?B.camera.layers:w.layers;for(let be=0;be<j;be++){const Be=B.getCamera(be);if(K.isPointLight){const Z=B.camera,fe=B.matrix,Se=K.distance||Z.far;Se!==Z.far&&(Z.far=Se,Z.updateProjectionMatrix()),Ps.setFromMatrixPosition(K.matrixWorld),Z.position.copy(Ps),Hr.copy(Z.position),Hr.add(Pg[be]),Z.up.copy(Lg[be]),Z.lookAt(Hr),Z.updateMatrixWorld(),fe.makeTranslation(-Ps.x,-Ps.y,-Ps.z),Pc.multiplyMatrices(Z.projectionMatrix,Z.matrixWorldInverse),B._frustum.setFromProjectionMatrix(Pc,Z.coordinateSystem,Z.reversedDepth)}if(B.map.isWebGLCubeRenderTarget)a.setRenderTarget(B.map,be),a.clear();else{be===0&&(a.setRenderTarget(B.map),a.clear());const Z=B.getViewport(be);r.set(s.x*Z.x,s.y*Z.y,s.x*Z.z,s.y*Z.w),F.viewport(r)}i=B.getFrustum(be),y(x,w,Be,K,te,this.type)}B.isPointLightShadow!==!0&&this.type===Ns&&_(B,w),B.needsUpdate=!1}m=this.type,g.needsUpdate=!1,a.setRenderTarget(L,C,N)};function _(E,x){const w=e.update(v);u.defines.VSM_SAMPLES!==E.blurSamples&&(u.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null?E.mapPass=new zi(n.x,n.y,{format:In,type:Hi}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),u.uniforms.shadow_pass.value=E.map.depthTexture,u.uniforms.resolution.value.set(E.map.width,E.map.height),u.uniforms.radius.value=E.radius,a.setRenderTarget(E.mapPass),a.clear(),a.renderBufferDirect(x,null,w,u,v,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value.set(E.map.width,E.map.height),f.uniforms.radius.value=E.radius,a.setRenderTarget(E.map),a.clear(),a.renderBufferDirect(x,null,w,f,v,null)}function M(E,x,w,L){let C=null;const N=w.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(N!==void 0)C=N;else if(C=w.isPointLight===!0?c:o,a.localClippingEnabled&&x.clipShadows===!0&&Array.isArray(x.clippingPlanes)&&x.clippingPlanes.length!==0||x.displacementMap&&x.displacementScale!==0||x.alphaMap&&x.alphaTest>0||x.map&&x.alphaTest>0||x.alphaToCoverage===!0){const F=C.uuid,W=x.uuid;let P=l[F];P===void 0&&(P={},l[F]=P);let G=P[W];G===void 0&&(G=C.clone(),P[W]=G,x.addEventListener("dispose",A)),C=G}if(C.visible=x.visible,C.wireframe=x.wireframe,L===Ns?C.side=x.shadowSide!==null?x.shadowSide:x.side:C.side=x.shadowSide!==null?x.shadowSide:h[x.side],C.alphaMap=x.alphaMap,C.alphaTest=x.alphaToCoverage===!0?.5:x.alphaTest,C.map=x.map,C.clipShadows=x.clipShadows,C.clippingPlanes=x.clippingPlanes,C.clipIntersection=x.clipIntersection,C.displacementMap=x.displacementMap,C.displacementScale=x.displacementScale,C.displacementBias=x.displacementBias,C.wireframeLinewidth=x.wireframeLinewidth,C.linewidth=x.linewidth,w.isPointLight===!0&&C.isMeshDistanceMaterial===!0){const F=a.properties.get(C);F.light=w}return C}function y(E,x,w,L,C,N){if(E.visible===!1)return;if(E.layers.test(C)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&N===Ns)&&(!E.frustumCulled||E.intersectsFrustum(i))){E.modelViewMatrix.multiplyMatrices(w.matrixWorldInverse,E.matrixWorld);const P=e.update(E),G=E.material;if(Array.isArray(G)){const K=P.groups;for(let B=0,ie=K.length;B<ie;B++){const $=K[B],j=G[$.materialIndex];if(j&&j.visible){const te=M(E,j,L,N);E.onBeforeShadow(a,E,x,w,P,te,$),a.renderBufferDirect(w,null,P,te,E,$),E.onAfterShadow(a,E,x,w,P,te,$)}}}else if(G.visible){const K=M(E,G,L,N);E.onBeforeShadow(a,E,x,w,P,K,null),a.renderBufferDirect(w,null,P,K,E,null),E.onAfterShadow(a,E,x,w,P,K,null)}}const W=E.children;for(let P=0,G=W.length;P<G;P++)y(W[P],x,w,L,C,N)}function A(E){E.target.removeEventListener("dispose",A);for(const w in l){const L=l[w],C=E.target.uuid;C in L&&(L[C].dispose(),delete L[C])}}}function Ig(a,e){function t(){let R=!1;const Q=new wt;let X=null;const ce=new wt(0,0,0,0);return{setMask:function(ae){X!==ae&&!R&&(a.colorMask(ae,ae,ae,ae),X=ae)},setLocked:function(ae){R=ae},setClear:function(ae,oe,Ne,Ye,se){se===!0&&(ae*=Ye,oe*=Ye,Ne*=Ye),Q.set(ae,oe,Ne,Ye),ce.equals(Q)===!1&&(a.clearColor(ae,oe,Ne,Ye),ce.copy(Q))},reset:function(){R=!1,X=null,ce.set(-1,0,0,0)}}}function i(){let R=!1,Q=!1,X=null,ce=null,ae=null;return{setReversed:function(oe){if(Q!==oe){const Ne=e.get("EXT_clip_control");oe?Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.ZERO_TO_ONE_EXT):Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.NEGATIVE_ONE_TO_ONE_EXT),Q=oe;const Ye=ae;ae=null,this.setClear(Ye)}},getReversed:function(){return Q},setTest:function(oe){oe?me(a.DEPTH_TEST):ye(a.DEPTH_TEST)},setMask:function(oe){X!==oe&&!R&&(a.depthMask(oe),X=oe)},setFunc:function(oe){if(Q&&(oe=zh[oe]),ce!==oe){switch(oe){case Xr:a.depthFunc(a.NEVER);break;case Yr:a.depthFunc(a.ALWAYS);break;case Kr:a.depthFunc(a.LESS);break;case Ws:a.depthFunc(a.LEQUAL);break;case Zr:a.depthFunc(a.EQUAL);break;case Jr:a.depthFunc(a.GEQUAL);break;case Qr:a.depthFunc(a.GREATER);break;case jr:a.depthFunc(a.NOTEQUAL);break;default:a.depthFunc(a.LEQUAL)}ce=oe}},setLocked:function(oe){R=oe},setClear:function(oe){ae!==oe&&(ae=oe,Q&&(oe=1-oe),a.clearDepth(oe))},reset:function(){R=!1,X=null,ce=null,ae=null,Q=!1}}}function n(){let R=!1,Q=null,X=null,ce=null,ae=null,oe=null,Ne=null,Ye=null,se=null;return{setTest:function(ze){R||(ze?me(a.STENCIL_TEST):ye(a.STENCIL_TEST))},setMask:function(ze){Q!==ze&&!R&&(a.stencilMask(ze),Q=ze)},setFunc:function(ze,Xe,ge){(X!==ze||ce!==Xe||ae!==ge)&&(a.stencilFunc(ze,Xe,ge),X=ze,ce=Xe,ae=ge)},setOp:function(ze,Xe,ge){(oe!==ze||Ne!==Xe||Ye!==ge)&&(a.stencilOp(ze,Xe,ge),oe=ze,Ne=Xe,Ye=ge)},setLocked:function(ze){R=ze},setClear:function(ze){se!==ze&&(a.clearStencil(ze),se=ze)},reset:function(){R=!1,Q=null,X=null,ce=null,ae=null,oe=null,Ne=null,Ye=null,se=null}}}const s=new t,r=new i,o=new n;let c={};const l=new WeakMap;let d={},h={},u={},f=new WeakMap,p=[],v=null,g=!1,m=null,_=null,M=null,y=null,A=null,E=null,x=null,w=new Ce(0,0,0),L=0,C=!1,N=null,F=null,W=null,P=null,G=null;const K=a.getParameter(a.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let B=!1,ie=0;const $=a.getParameter(a.VERSION);$.indexOf("WebGL")!==-1?(ie=parseFloat(/^WebGL (\d)/.exec($)[1]),B=ie>=1):$.indexOf("OpenGL ES")!==-1&&(ie=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),B=ie>=2);let j=null,te={};const be=a.getParameter(a.SCISSOR_BOX),Be=a.getParameter(a.VIEWPORT),Z=new wt().fromArray(be),fe=new wt().fromArray(Be);function Se(R,Q,X,ce){const ae=new Uint8Array(4),oe=a.createTexture();a.bindTexture(R,oe),a.texParameteri(R,a.TEXTURE_MIN_FILTER,a.NEAREST),a.texParameteri(R,a.TEXTURE_MAG_FILTER,a.NEAREST);for(let Ne=0;Ne<X;Ne++)R===a.TEXTURE_3D||R===a.TEXTURE_2D_ARRAY?a.texImage3D(Q,0,a.RGBA,1,1,ce,0,a.RGBA,a.UNSIGNED_BYTE,ae):a.texImage2D(Q+Ne,0,a.RGBA,1,1,0,a.RGBA,a.UNSIGNED_BYTE,ae);return oe}const Oe={};Oe[a.TEXTURE_2D]=Se(a.TEXTURE_2D,a.TEXTURE_2D,1),Oe[a.TEXTURE_CUBE_MAP]=Se(a.TEXTURE_CUBE_MAP,a.TEXTURE_CUBE_MAP_POSITIVE_X,6),Oe[a.TEXTURE_2D_ARRAY]=Se(a.TEXTURE_2D_ARRAY,a.TEXTURE_2D_ARRAY,1,1),Oe[a.TEXTURE_3D]=Se(a.TEXTURE_3D,a.TEXTURE_3D,1,1),s.setClear(0,0,0,1),r.setClear(1),o.setClear(0),me(a.DEPTH_TEST),r.setFunc(Ws),si(!1),St(Sl),me(a.CULL_FACE),Ht(ns);function me(R){d[R]!==!0&&(a.enable(R),d[R]=!0)}function ye(R){d[R]!==!1&&(a.disable(R),d[R]=!1)}function Ie(R,Q){return u[R]!==Q?(a.bindFramebuffer(R,Q),u[R]=Q,R===a.DRAW_FRAMEBUFFER&&(u[a.FRAMEBUFFER]=Q),R===a.FRAMEBUFFER&&(u[a.DRAW_FRAMEBUFFER]=Q),!0):!1}function Me(R,Q){let X=p,ce=!1;if(R){X=f.get(Q),X===void 0&&(X=[],f.set(Q,X));const ae=R.textures;if(X.length!==ae.length||X[0]!==a.COLOR_ATTACHMENT0){for(let oe=0,Ne=ae.length;oe<Ne;oe++)X[oe]=a.COLOR_ATTACHMENT0+oe;X.length=ae.length,ce=!0}}else X[0]!==a.BACK&&(X[0]=a.BACK,ce=!0);ce&&a.drawBuffers(X)}function je(R){return v!==R?(a.useProgram(R),v=R,!0):!1}const at={[is]:a.FUNC_ADD,[rh]:a.FUNC_SUBTRACT,[oh]:a.FUNC_REVERSE_SUBTRACT};at[lh]=a.MIN,at[ch]=a.MAX;const $e={[dh]:a.ZERO,[hh]:a.ONE,[uh]:a.SRC_COLOR,[Vc]:a.SRC_ALPHA,[xh]:a.SRC_ALPHA_SATURATE,[gh]:a.DST_COLOR,[ph]:a.DST_ALPHA,[fh]:a.ONE_MINUS_SRC_COLOR,[Wc]:a.ONE_MINUS_SRC_ALPHA,[vh]:a.ONE_MINUS_DST_COLOR,[mh]:a.ONE_MINUS_DST_ALPHA,[_h]:a.CONSTANT_COLOR,[yh]:a.ONE_MINUS_CONSTANT_COLOR,[Mh]:a.CONSTANT_ALPHA,[Sh]:a.ONE_MINUS_CONSTANT_ALPHA};function Ht(R,Q,X,ce,ae,oe,Ne,Ye,se,ze){if(R===ns){g===!0&&(ye(a.BLEND),g=!1);return}if(g===!1&&(me(a.BLEND),g=!0),R!==ah){if(R!==m||ze!==C){if((_!==is||A!==is)&&(a.blendEquation(a.FUNC_ADD),_=is,A=is),ze)switch(R){case ks:a.blendFuncSeparate(a.ONE,a.ONE_MINUS_SRC_ALPHA,a.ONE,a.ONE_MINUS_SRC_ALPHA);break;case ft:a.blendFunc(a.ONE,a.ONE);break;case bl:a.blendFuncSeparate(a.ZERO,a.ONE_MINUS_SRC_COLOR,a.ZERO,a.ONE);break;case wl:a.blendFuncSeparate(a.DST_COLOR,a.ONE_MINUS_SRC_ALPHA,a.ZERO,a.ONE);break;default:ot("WebGLState: Invalid blending: ",R);break}else switch(R){case ks:a.blendFuncSeparate(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA,a.ONE,a.ONE_MINUS_SRC_ALPHA);break;case ft:a.blendFuncSeparate(a.SRC_ALPHA,a.ONE,a.ONE,a.ONE);break;case bl:ot("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case wl:ot("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ot("WebGLState: Invalid blending: ",R);break}M=null,y=null,E=null,x=null,w.set(0,0,0),L=0,m=R,C=ze}return}ae=ae||Q,oe=oe||X,Ne=Ne||ce,(Q!==_||ae!==A)&&(a.blendEquationSeparate(at[Q],at[ae]),_=Q,A=ae),(X!==M||ce!==y||oe!==E||Ne!==x)&&(a.blendFuncSeparate($e[X],$e[ce],$e[oe],$e[Ne]),M=X,y=ce,E=oe,x=Ne),(Ye.equals(w)===!1||se!==L)&&(a.blendColor(Ye.r,Ye.g,Ye.b,se),w.copy(Ye),L=se),m=R,C=!1}function Lt(R,Q){R.side===pt?ye(a.CULL_FACE):me(a.CULL_FACE);let X=R.side===Vt;Q&&(X=!X),si(X),R.blending===ks&&R.transparent===!1?Ht(ns):Ht(R.blending,R.blendEquation,R.blendSrc,R.blendDst,R.blendEquationAlpha,R.blendSrcAlpha,R.blendDstAlpha,R.blendColor,R.blendAlpha,R.premultipliedAlpha),r.setFunc(R.depthFunc),r.setTest(R.depthTest),r.setMask(R.depthWrite),s.setMask(R.colorWrite);const ce=R.stencilWrite;o.setTest(ce),ce&&(o.setMask(R.stencilWriteMask),o.setFunc(R.stencilFunc,R.stencilRef,R.stencilFuncMask),o.setOp(R.stencilFail,R.stencilZFail,R.stencilZPass)),zt(R.polygonOffset,R.polygonOffsetFactor,R.polygonOffsetUnits),R.alphaToCoverage===!0?me(a.SAMPLE_ALPHA_TO_COVERAGE):ye(a.SAMPLE_ALPHA_TO_COVERAGE)}function si(R){N!==R&&(R?a.frontFace(a.CW):a.frontFace(a.CCW),N=R)}function St(R){R!==nh?(me(a.CULL_FACE),R!==F&&(R===Sl?a.cullFace(a.BACK):R===sh?a.cullFace(a.FRONT):a.cullFace(a.FRONT_AND_BACK))):ye(a.CULL_FACE),F=R}function Ri(R){R!==W&&(B&&a.lineWidth(R),W=R)}function zt(R,Q,X){R?(me(a.POLYGON_OFFSET_FILL),(P!==Q||G!==X)&&(P=Q,G=X,r.getReversed()&&(Q=-Q,X=-X),a.polygonOffset(Q,X))):ye(a.POLYGON_OFFSET_FILL)}function ui(R){R?me(a.SCISSOR_TEST):ye(a.SCISSOR_TEST)}function fi(R){R===void 0&&(R=a.TEXTURE0+K-1),j!==R&&(a.activeTexture(R),j=R)}function pi(R,Q,X){X===void 0&&(j===null?X=a.TEXTURE0+K-1:X=j);let ce=te[X];ce===void 0&&(ce={type:void 0,texture:void 0},te[X]=ce),(ce.type!==R||ce.texture!==Q)&&(j!==X&&(a.activeTexture(X),j=X),a.bindTexture(R,Q||Oe[R]),ce.type=R,ce.texture=Q)}function U(){const R=te[j];R!==void 0&&R.type!==void 0&&(a.bindTexture(R.type,null),R.type=void 0,R.texture=void 0)}function mi(){try{a.compressedTexImage2D(...arguments)}catch(R){ot("WebGLState:",R)}}function _t(){try{a.compressedTexImage3D(...arguments)}catch(R){ot("WebGLState:",R)}}function yt(){try{a.texSubImage2D(...arguments)}catch(R){ot("WebGLState:",R)}}function pe(){try{a.texSubImage3D(...arguments)}catch(R){ot("WebGLState:",R)}}function Dt(){try{a.compressedTexSubImage2D(...arguments)}catch(R){ot("WebGLState:",R)}}function ke(){try{a.compressedTexSubImage3D(...arguments)}catch(R){ot("WebGLState:",R)}}function Ve(){try{a.texStorage2D(...arguments)}catch(R){ot("WebGLState:",R)}}function T(){try{a.texStorage3D(...arguments)}catch(R){ot("WebGLState:",R)}}function S(){try{a.texImage2D(...arguments)}catch(R){ot("WebGLState:",R)}}function O(){try{a.texImage3D(...arguments)}catch(R){ot("WebGLState:",R)}}function ne(R){return h[R]!==void 0?h[R]:a.getParameter(R)}function ee(R,Q){h[R]!==Q&&(a.pixelStorei(R,Q),h[R]=Q)}function re(R){Z.equals(R)===!1&&(a.scissor(R.x,R.y,R.z,R.w),Z.copy(R))}function he(R){fe.equals(R)===!1&&(a.viewport(R.x,R.y,R.z,R.w),fe.copy(R))}function Y(R,Q){let X=l.get(Q);X===void 0&&(X=new WeakMap,l.set(Q,X));let ce=X.get(R);ce===void 0&&(ce=a.getUniformBlockIndex(Q,R.name),a.uniformBlockBinding(Q,ce,ce),X.set(R,ce))}function J(R,Q,X){const ae=l.get(Q).get(R);c[ae]!==X&&(a.bindBufferBase(a.UNIFORM_BUFFER,ae,X),c[ae]=X)}function le(){a.disable(a.BLEND),a.disable(a.CULL_FACE),a.disable(a.DEPTH_TEST),a.disable(a.POLYGON_OFFSET_FILL),a.disable(a.SCISSOR_TEST),a.disable(a.STENCIL_TEST),a.disable(a.SAMPLE_ALPHA_TO_COVERAGE),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ONE,a.ZERO),a.blendFuncSeparate(a.ONE,a.ZERO,a.ONE,a.ZERO),a.blendColor(0,0,0,0),a.colorMask(!0,!0,!0,!0),a.clearColor(0,0,0,0),a.depthMask(!0),a.depthFunc(a.LESS),r.setReversed(!1),a.clearDepth(1),a.stencilMask(4294967295),a.stencilFunc(a.ALWAYS,0,4294967295),a.stencilOp(a.KEEP,a.KEEP,a.KEEP),a.clearStencil(0),a.cullFace(a.BACK),a.frontFace(a.CCW),a.polygonOffset(0,0),a.activeTexture(a.TEXTURE0),a.bindFramebuffer(a.FRAMEBUFFER,null),a.bindFramebuffer(a.DRAW_FRAMEBUFFER,null),a.bindFramebuffer(a.READ_FRAMEBUFFER,null),a.useProgram(null),a.lineWidth(1),a.scissor(0,0,a.canvas.width,a.canvas.height),a.viewport(0,0,a.canvas.width,a.canvas.height),a.pixelStorei(a.PACK_ALIGNMENT,4),a.pixelStorei(a.UNPACK_ALIGNMENT,4),a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,!1),a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),a.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL,a.BROWSER_DEFAULT_WEBGL),a.pixelStorei(a.PACK_ROW_LENGTH,0),a.pixelStorei(a.PACK_SKIP_PIXELS,0),a.pixelStorei(a.PACK_SKIP_ROWS,0),a.pixelStorei(a.UNPACK_ROW_LENGTH,0),a.pixelStorei(a.UNPACK_IMAGE_HEIGHT,0),a.pixelStorei(a.UNPACK_SKIP_PIXELS,0),a.pixelStorei(a.UNPACK_SKIP_ROWS,0),a.pixelStorei(a.UNPACK_SKIP_IMAGES,0),d={},h={},j=null,te={},u={},c={},f=new WeakMap,p=[],v=null,g=!1,m=null,_=null,M=null,y=null,A=null,E=null,x=null,w=new Ce(0,0,0),L=0,C=!1,N=null,F=null,W=null,P=null,G=null,Z.set(0,0,a.canvas.width,a.canvas.height),fe.set(0,0,a.canvas.width,a.canvas.height),s.reset(),r.reset(),o.reset()}return{buffers:{color:s,depth:r,stencil:o},enable:me,disable:ye,bindFramebuffer:Ie,drawBuffers:Me,useProgram:je,setBlending:Ht,setMaterial:Lt,setFlipSided:si,setCullFace:St,setLineWidth:Ri,setPolygonOffset:zt,setScissorTest:ui,activeTexture:fi,bindTexture:pi,unbindTexture:U,compressedTexImage2D:mi,compressedTexImage3D:_t,texImage2D:S,texImage3D:O,pixelStorei:ee,getParameter:ne,updateUBOMapping:Y,uniformBlockBinding:J,texStorage2D:Ve,texStorage3D:T,texSubImage2D:yt,texSubImage3D:pe,compressedTexSubImage2D:Dt,compressedTexSubImage3D:ke,scissor:re,viewport:he,reset:le}}function Ng(a,e,t,i,n,s,r){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new xe,d=new WeakMap,h=new Set;let u;const f=new WeakMap,p=new Set,v=new FinalizationRegistry(T=>p.delete(T));let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(T,S){return g?new OffscreenCanvas(T,S):Xa("canvas")}function _(T,S,O){let ne=1;const ee=Ve(T);if((ee.width>O||ee.height>O)&&(ne=O/Math.max(ee.width,ee.height)),ne<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const re=Math.floor(ne*ee.width),he=Math.floor(ne*ee.height);u===void 0&&(u=m(re,he));const Y=S?m(re,he):u;return Y.width=re,Y.height=he,Y.getContext("2d").drawImage(T,0,0,re,he),He("WebGLRenderer: Texture has been resized from ("+ee.width+"x"+ee.height+") to ("+re+"x"+he+")."),Y}else return"data"in T&&He("WebGLRenderer: Image in DataTexture is too big ("+ee.width+"x"+ee.height+")."),T;return T}function M(T){return T.generateMipmaps}function y(T){a.generateMipmap(T)}function A(T){return T.isWebGLCubeRenderTarget?a.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?a.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?a.TEXTURE_2D_ARRAY:a.TEXTURE_2D}function E(T,S,O,ne,ee,re=!1){if(T!==null){if(a[T]!==void 0)return a[T];He("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let he;ne&&(he=e.get("EXT_texture_norm16"),he||He("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Y=S;if(S===a.RED&&(O===a.FLOAT&&(Y=a.R32F),O===a.HALF_FLOAT&&(Y=a.R16F),O===a.UNSIGNED_BYTE&&(Y=a.R8),O===a.UNSIGNED_SHORT&&he&&(Y=he.R16_EXT),O===a.SHORT&&he&&(Y=he.R16_SNORM_EXT)),S===a.RED_INTEGER&&(O===a.UNSIGNED_BYTE&&(Y=a.R8UI),O===a.UNSIGNED_SHORT&&(Y=a.R16UI),O===a.UNSIGNED_INT&&(Y=a.R32UI),O===a.BYTE&&(Y=a.R8I),O===a.SHORT&&(Y=a.R16I),O===a.INT&&(Y=a.R32I)),S===a.RG&&(O===a.FLOAT&&(Y=a.RG32F),O===a.HALF_FLOAT&&(Y=a.RG16F),O===a.UNSIGNED_BYTE&&(Y=a.RG8),O===a.UNSIGNED_SHORT&&he&&(Y=he.RG16_EXT),O===a.SHORT&&he&&(Y=he.RG16_SNORM_EXT)),S===a.RG_INTEGER&&(O===a.UNSIGNED_BYTE&&(Y=a.RG8UI),O===a.UNSIGNED_SHORT&&(Y=a.RG16UI),O===a.UNSIGNED_INT&&(Y=a.RG32UI),O===a.BYTE&&(Y=a.RG8I),O===a.SHORT&&(Y=a.RG16I),O===a.INT&&(Y=a.RG32I)),S===a.RGB_INTEGER&&(O===a.UNSIGNED_BYTE&&(Y=a.RGB8UI),O===a.UNSIGNED_SHORT&&(Y=a.RGB16UI),O===a.UNSIGNED_INT&&(Y=a.RGB32UI),O===a.BYTE&&(Y=a.RGB8I),O===a.SHORT&&(Y=a.RGB16I),O===a.INT&&(Y=a.RGB32I)),S===a.RGBA_INTEGER&&(O===a.UNSIGNED_BYTE&&(Y=a.RGBA8UI),O===a.UNSIGNED_SHORT&&(Y=a.RGBA16UI),O===a.UNSIGNED_INT&&(Y=a.RGBA32UI),O===a.BYTE&&(Y=a.RGBA8I),O===a.SHORT&&(Y=a.RGBA16I),O===a.INT&&(Y=a.RGBA32I)),S===a.RGB&&(O===a.UNSIGNED_SHORT&&he&&(Y=he.RGB16_EXT),O===a.SHORT&&he&&(Y=he.RGB16_SNORM_EXT),O===a.UNSIGNED_INT_5_9_9_9_REV&&(Y=a.RGB9_E5),O===a.UNSIGNED_INT_10F_11F_11F_REV&&(Y=a.R11F_G11F_B10F)),S===a.RGBA){const J=re?$a:nt.getTransfer(ee);O===a.FLOAT&&(Y=a.RGBA32F),O===a.HALF_FLOAT&&(Y=a.RGBA16F),O===a.UNSIGNED_BYTE&&(Y=J===dt?a.SRGB8_ALPHA8:a.RGBA8),O===a.UNSIGNED_SHORT&&he&&(Y=he.RGBA16_EXT),O===a.SHORT&&he&&(Y=he.RGBA16_SNORM_EXT),O===a.UNSIGNED_SHORT_4_4_4_4&&(Y=a.RGBA4),O===a.UNSIGNED_SHORT_5_5_5_1&&(Y=a.RGB5_A1)}return(Y===a.R16F||Y===a.R32F||Y===a.RG16F||Y===a.RG32F||Y===a.RGBA16F||Y===a.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function x(T,S){let O;return T?S===null||S===Bi||S===os?O=a.DEPTH24_STENCIL8:S===Ai?O=a.DEPTH32F_STENCIL8:S===$s&&(O=a.DEPTH24_STENCIL8,He("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===Bi||S===os?O=a.DEPTH_COMPONENT24:S===Ai?O=a.DEPTH_COMPONENT32F:S===$s&&(O=a.DEPTH_COMPONENT16),O}function w(T,S){return M(T)===!0||T.isFramebufferTexture&&T.minFilter!==Nt&&T.minFilter!==oi?Math.log2(Math.max(S.width,S.height))+1:T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?S.mipmaps.length:1}function L(T){const S=new WeakRef(T);i.get(T).__ref=S,p.add(S),v.register(T,S,S)}function C(T){const S=i.get(T).__ref;S!==void 0&&(p.delete(S),v.unregister(S))}function N(T){W(T.target)}function F(T){P(T.target)}function W(T){T.removeEventListener("dispose",N),C(T),K(T),T.isVideoTexture&&d.delete(T),T.isHTMLTexture&&h.delete(T)}function P(T){T.removeEventListener("dispose",F),C(T),ie(T)}function G(){for(const T of p){const S=T.deref();S!==void 0&&(S.isRenderTarget===!0?P(S):W(S))}p.clear(),h.clear()}function K(T){const S=i.get(T);if(S.__webglInit===void 0)return;const O=T.source,ne=f.get(O);if(ne){const ee=ne[S.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&B(T),Object.keys(ne).length===0&&f.delete(O)}i.remove(T)}function B(T){const S=i.get(T);a.deleteTexture(S.__webglTexture);const O=T.source,ne=f.get(O);delete ne[S.__cacheKey],r.memory.textures--}function ie(T){const S=i.get(T);S.__depthDisposeCallback&&S.__depthDisposeCallback();const O=T.depthTexture;if(O&&O.renderTarget===T&&W(O),T.isWebGLCubeRenderTarget)for(let ee=0;ee<6;ee++){if(Array.isArray(S.__webglFramebuffer[ee]))for(let re=0;re<S.__webglFramebuffer[ee].length;re++)a.deleteFramebuffer(S.__webglFramebuffer[ee][re]);else a.deleteFramebuffer(S.__webglFramebuffer[ee]);S.__webglDepthbuffer&&a.deleteRenderbuffer(S.__webglDepthbuffer[ee])}else{if(Array.isArray(S.__webglFramebuffer))for(let ee=0;ee<S.__webglFramebuffer.length;ee++)a.deleteFramebuffer(S.__webglFramebuffer[ee]);else a.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&a.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&a.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let ee=0;ee<S.__webglColorRenderbuffer.length;ee++)S.__webglColorRenderbuffer[ee]&&a.deleteRenderbuffer(S.__webglColorRenderbuffer[ee]);S.__webglDepthRenderbuffer&&a.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const ne=T.textures;for(let ee=0,re=ne.length;ee<re;ee++){const he=i.get(ne[ee]);he.__webglTexture&&(a.deleteTexture(he.__webglTexture),r.memory.textures--),i.remove(ne[ee])}i.remove(T)}let $=0;function j(){$=0}function te(){return $}function be(T){$=T}function Be(){const T=$;return T>=n.maxTextures&&He("WebGLTextures: Trying to use "+(T+1)+" texture units while this GPU supports only "+n.maxTextures),$+=1,T}function Z(T){const S=[];return S.push(T.wrapS),S.push(T.wrapT),S.push(T.wrapR||0),S.push(T.magFilter),S.push(T.minFilter),S.push(T.anisotropy),S.push(T.internalFormat),S.push(T.format),S.push(T.type),S.push(T.generateMipmaps),S.push(T.mipmapsAutoUpdate),S.push(T.premultiplyAlpha),S.push(T.flipY),S.push(T.unpackAlignment),S.push(T.colorSpace),S.join()}function fe(T,S){const O=i.get(T);if(T.isVideoTexture&&Dt(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&O.__version!==T.version){const ne=T.image;if(ne===null)He("WebGLRenderer: Texture marked for update but no image data found.");else if(ne.complete===!1)He("WebGLRenderer: Texture marked for update but image is incomplete");else{Lt(O,T,S);return}}else T.isExternalTexture&&(O.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(a.TEXTURE_2D,O.__webglTexture,a.TEXTURE0+S)}function Se(T,S){const O=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&O.__version!==T.version){Lt(O,T,S);return}else T.isExternalTexture&&(O.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(a.TEXTURE_2D_ARRAY,O.__webglTexture,a.TEXTURE0+S)}function Oe(T,S){const O=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&O.__version!==T.version){Lt(O,T,S);return}t.bindTexture(a.TEXTURE_3D,O.__webglTexture,a.TEXTURE0+S)}function me(T,S){const O=i.get(T);if(T.version>0&&O.__version!==T.version){si(O,T,S);return}t.bindTexture(a.TEXTURE_CUBE_MAP,O.__webglTexture,a.TEXTURE0+S)}const ye={[eo]:a.REPEAT,[Ji]:a.CLAMP_TO_EDGE,[to]:a.MIRRORED_REPEAT},Ie={[Nt]:a.NEAREST,[Eh]:a.NEAREST_MIPMAP_NEAREST,[ia]:a.NEAREST_MIPMAP_LINEAR,[oi]:a.LINEAR,[hr]:a.LINEAR_MIPMAP_NEAREST,[pn]:a.LINEAR_MIPMAP_LINEAR},Me={[Rh]:a.NEVER,[od]:a.ALWAYS,[Ph]:a.LESS,[ad]:a.LEQUAL,[Lh]:a.EQUAL,[rd]:a.GEQUAL,[Dh]:a.GREATER,[Ih]:a.NOTEQUAL};function je(T,S){if(S.type===Ai&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===oi||S.magFilter===hr||S.magFilter===ia||S.magFilter===pn||S.minFilter===oi||S.minFilter===hr||S.minFilter===ia||S.minFilter===pn)&&He("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),a.texParameteri(T,a.TEXTURE_WRAP_S,ye[S.wrapS]),a.texParameteri(T,a.TEXTURE_WRAP_T,ye[S.wrapT]),(T===a.TEXTURE_3D||T===a.TEXTURE_2D_ARRAY)&&a.texParameteri(T,a.TEXTURE_WRAP_R,ye[S.wrapR]),a.texParameteri(T,a.TEXTURE_MAG_FILTER,Ie[S.magFilter]),a.texParameteri(T,a.TEXTURE_MIN_FILTER,Ie[S.minFilter]),S.compareFunction&&(a.texParameteri(T,a.TEXTURE_COMPARE_MODE,a.COMPARE_REF_TO_TEXTURE),a.texParameteri(T,a.TEXTURE_COMPARE_FUNC,Me[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Nt||S.minFilter!==ia&&S.minFilter!==pn||S.type===Ai&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||i.get(S).__currentAnisotropy){const O=e.get("EXT_texture_filter_anisotropic");a.texParameterf(T,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,n.getMaxAnisotropy())),i.get(S).__currentAnisotropy=S.anisotropy}}}function at(T,S){let O=!1;T.__webglInit===void 0&&(T.__webglInit=!0,S.addEventListener("dispose",N),L(S));const ne=S.source;let ee=f.get(ne);ee===void 0&&(ee={},f.set(ne,ee));const re=Z(S);if(re!==T.__cacheKey){ee[re]===void 0&&(ee[re]={texture:a.createTexture(),usedTimes:0},r.memory.textures++,O=!0),ee[re].usedTimes++;const he=ee[T.__cacheKey];he!==void 0&&(ee[T.__cacheKey].usedTimes--,he.usedTimes===0&&B(S)),T.__cacheKey=re,T.__webglTexture=ee[re].texture}return O}function $e(T,S,O){return Math.floor(Math.floor(T/O)/S)}function Ht(T,S,O,ne){const re=T.updateRanges;if(re.length===0)t.texSubImage2D(a.TEXTURE_2D,0,0,0,S.width,S.height,O,ne,S.data);else{re.sort((R,Q)=>R.start-Q.start);let he=0;for(let R=1;R<re.length;R++){const Q=re[he],X=re[R],ce=Q.start+Q.count,ae=$e(X.start,S.width,4),oe=$e(Q.start,S.width,4);X.start<=ce+1&&ae===oe&&$e(X.start+X.count-1,S.width,4)===ae?Q.count=Math.max(Q.count,X.start+X.count-Q.start):(++he,re[he]=X)}re.length=he+1;const Y=t.getParameter(a.UNPACK_ROW_LENGTH),J=t.getParameter(a.UNPACK_SKIP_PIXELS),le=t.getParameter(a.UNPACK_SKIP_ROWS);t.pixelStorei(a.UNPACK_ROW_LENGTH,S.width);for(let R=0,Q=re.length;R<Q;R++){const X=re[R],ce=Math.floor(X.start/4),ae=Math.ceil(X.count/4),oe=ce%S.width,Ne=Math.floor(ce/S.width),Ye=ae,se=1;t.pixelStorei(a.UNPACK_SKIP_PIXELS,oe),t.pixelStorei(a.UNPACK_SKIP_ROWS,Ne),t.texSubImage2D(a.TEXTURE_2D,0,oe,Ne,Ye,se,O,ne,S.data)}T.clearUpdateRanges(),t.pixelStorei(a.UNPACK_ROW_LENGTH,Y),t.pixelStorei(a.UNPACK_SKIP_PIXELS,J),t.pixelStorei(a.UNPACK_SKIP_ROWS,le)}}function Lt(T,S,O){let ne=a.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(ne=a.TEXTURE_2D_ARRAY),S.isData3DTexture&&(ne=a.TEXTURE_3D);const ee=at(T,S),re=S.source;t.bindTexture(ne,T.__webglTexture,a.TEXTURE0+O);const he=i.get(re);if(re.version!==he.__version||ee===!0){if(t.activeTexture(a.TEXTURE0+O),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){const se=nt.getPrimaries(nt.workingColorSpace),ze=S.colorSpace===un?null:nt.getPrimaries(S.colorSpace),Xe=S.colorSpace===un||se===ze?a.NONE:a.BROWSER_DEFAULT_WEBGL;t.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL,Xe)}t.pixelStorei(a.UNPACK_ALIGNMENT,S.unpackAlignment);let J=_(S.image,!1,n.maxTextureSize);J=ke(S,J);const le=s.convert(S.format,S.colorSpace),R=s.convert(S.type);let Q=E(S.internalFormat,le,R,S.normalized,S.colorSpace,S.isVideoTexture);je(ne,S);let X;const ce=S.mipmaps,ae=S.isVideoTexture!==!0,oe=he.__version===void 0||ee===!0,Ne=re.dataReady,Ye=w(S,J);if(S.isDepthTexture)Q=x(S.format===mn,S.type),oe&&(ae?t.texStorage2D(a.TEXTURE_2D,1,Q,J.width,J.height):t.texImage2D(a.TEXTURE_2D,0,Q,J.width,J.height,0,le,R,null));else if(S.isDataTexture)if(ce.length>0){ae&&oe&&t.texStorage2D(a.TEXTURE_2D,Ye,Q,ce[0].width,ce[0].height);for(let se=0,ze=ce.length;se<ze;se++)X=ce[se],ae?Ne&&t.texSubImage2D(a.TEXTURE_2D,se,0,0,X.width,X.height,le,R,X.data):t.texImage2D(a.TEXTURE_2D,se,Q,X.width,X.height,0,le,R,X.data);S.generateMipmaps=!1}else ae?(oe&&t.texStorage2D(a.TEXTURE_2D,Ye,Q,J.width,J.height),Ne&&Ht(S,J,le,R)):t.texImage2D(a.TEXTURE_2D,0,Q,J.width,J.height,0,le,R,J.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){ae&&oe&&t.texStorage3D(a.TEXTURE_2D_ARRAY,Ye,Q,ce[0].width,ce[0].height,J.depth);for(let se=0,ze=ce.length;se<ze;se++)if(X=ce[se],S.format!==Fi)if(le!==null)if(ae){if(Ne)if(S.layerUpdates.size>0){const Xe=cc(X.width,X.height,S.format,S.type);for(const ge of S.layerUpdates){const ct=X.data.subarray(ge*Xe/X.data.BYTES_PER_ELEMENT,(ge+1)*Xe/X.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(a.TEXTURE_2D_ARRAY,se,0,0,ge,X.width,X.height,1,le,ct)}}else t.compressedTexSubImage3D(a.TEXTURE_2D_ARRAY,se,0,0,0,X.width,X.height,J.depth,le,X.data)}else t.compressedTexImage3D(a.TEXTURE_2D_ARRAY,se,Q,X.width,X.height,J.depth,0,X.data,0,0);else He("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ae?Ne&&t.texSubImage3D(a.TEXTURE_2D_ARRAY,se,0,0,0,X.width,X.height,J.depth,le,R,X.data):t.texImage3D(a.TEXTURE_2D_ARRAY,se,Q,X.width,X.height,J.depth,0,le,R,X.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{ae&&oe&&t.texStorage2D(a.TEXTURE_2D,Ye,Q,ce[0].width,ce[0].height);for(let se=0,ze=ce.length;se<ze;se++)X=ce[se],S.format!==Fi?le!==null?ae?Ne&&t.compressedTexSubImage2D(a.TEXTURE_2D,se,0,0,X.width,X.height,le,X.data):t.compressedTexImage2D(a.TEXTURE_2D,se,Q,X.width,X.height,0,X.data):He("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ae?Ne&&t.texSubImage2D(a.TEXTURE_2D,se,0,0,X.width,X.height,le,R,X.data):t.texImage2D(a.TEXTURE_2D,se,Q,X.width,X.height,0,le,R,X.data)}else if(S.isDataArrayTexture)if(ae){if(oe&&t.texStorage3D(a.TEXTURE_2D_ARRAY,Ye,Q,J.width,J.height,J.depth),Ne)if(S.layerUpdates.size>0){const se=cc(J.width,J.height,S.format,S.type);for(const ze of S.layerUpdates){const Xe=J.data.subarray(ze*se/J.data.BYTES_PER_ELEMENT,(ze+1)*se/J.data.BYTES_PER_ELEMENT);t.texSubImage3D(a.TEXTURE_2D_ARRAY,0,0,0,ze,J.width,J.height,1,le,R,Xe)}S.clearLayerUpdates()}else t.texSubImage3D(a.TEXTURE_2D_ARRAY,0,0,0,0,J.width,J.height,J.depth,le,R,J.data)}else t.texImage3D(a.TEXTURE_2D_ARRAY,0,Q,J.width,J.height,J.depth,0,le,R,J.data);else if(S.isData3DTexture)ae?(oe&&t.texStorage3D(a.TEXTURE_3D,Ye,Q,J.width,J.height,J.depth),Ne&&t.texSubImage3D(a.TEXTURE_3D,0,0,0,0,J.width,J.height,J.depth,le,R,J.data)):t.texImage3D(a.TEXTURE_3D,0,Q,J.width,J.height,J.depth,0,le,R,J.data);else if(S.isFramebufferTexture){if(oe)if(ae)t.texStorage2D(a.TEXTURE_2D,Ye,Q,J.width,J.height);else{let se=J.width,ze=J.height;for(let Xe=0;Xe<Ye;Xe++)t.texImage2D(a.TEXTURE_2D,Xe,Q,se,ze,0,le,R,null),se>>=1,ze>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in a){const se=a.canvas;if(se.hasAttribute("layoutsubtree")||se.setAttribute("layoutsubtree","true"),J.parentNode!==se){se.appendChild(J),h.add(S),se.onpaint=ze=>{const Xe=ze.changedElements;for(const ge of h)Xe.includes(ge.image)&&(ge.needsUpdate=!0)},se.requestPaint();return}if(a.texElementImage2D.length===3)a.texElementImage2D(a.TEXTURE_2D,a.RGBA8,J);else{const Xe=a.RGBA,ge=a.RGBA,ct=a.UNSIGNED_BYTE;a.texElementImage2D(a.TEXTURE_2D,0,Xe,ge,ct,J)}a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE)}}else if(ce.length>0){if(ae&&oe){const se=Ve(ce[0]);t.texStorage2D(a.TEXTURE_2D,Ye,Q,se.width,se.height)}for(let se=0,ze=ce.length;se<ze;se++)X=ce[se],ae?Ne&&t.texSubImage2D(a.TEXTURE_2D,se,0,0,le,R,X):t.texImage2D(a.TEXTURE_2D,se,Q,le,R,X);S.generateMipmaps=!1}else if(ae){if(oe){const se=Ve(J);t.texStorage2D(a.TEXTURE_2D,Ye,Q,se.width,se.height)}Ne&&t.texSubImage2D(a.TEXTURE_2D,0,0,0,le,R,J)}else t.texImage2D(a.TEXTURE_2D,0,Q,le,R,J);M(S)&&S.mipmapsAutoUpdate===!0&&y(ne),he.__version=re.version,S.onUpdate&&S.onUpdate(S)}T.__version=S.version}function si(T,S,O){if(S.image.length!==6)return;const ne=at(T,S),ee=S.source;t.bindTexture(a.TEXTURE_CUBE_MAP,T.__webglTexture,a.TEXTURE0+O);const re=i.get(ee);if(ee.version!==re.__version||ne===!0){t.activeTexture(a.TEXTURE0+O);const he=nt.getPrimaries(nt.workingColorSpace),Y=S.colorSpace===un?null:nt.getPrimaries(S.colorSpace),J=S.colorSpace===un||he===Y?a.NONE:a.BROWSER_DEFAULT_WEBGL;t.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(a.UNPACK_ALIGNMENT,S.unpackAlignment),t.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL,J);const le=S.isCompressedTexture||S.image[0].isCompressedTexture,R=S.image[0]&&S.image[0].isDataTexture,Q=[];for(let ge=0;ge<6;ge++)!le&&!R?Q[ge]=_(S.image[ge],!0,n.maxCubemapSize):Q[ge]=R?S.image[ge].image:S.image[ge],Q[ge]=ke(S,Q[ge]);const X=Q[0],ce=s.convert(S.format,S.colorSpace),ae=s.convert(S.type);let oe=E(S.internalFormat,ce,ae,S.normalized,S.colorSpace);const Ne=S.isVideoTexture!==!0,Ye=re.__version===void 0||ne===!0,se=ee.dataReady;let ze=w(S,X);je(a.TEXTURE_CUBE_MAP,S);let Xe;if(S.isDepthTexture){if(oe=x(S.format===mn,S.type),Ye)if(Ne)t.texStorage2D(a.TEXTURE_CUBE_MAP,1,oe,X.width,X.height);else for(let ge=0;ge<6;ge++)t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,oe,X.width,X.height,0,ce,ae,null)}else if(le){Ne&&Ye&&t.texStorage2D(a.TEXTURE_CUBE_MAP,ze,oe,X.width,X.height);for(let ge=0;ge<6;ge++){Xe=Q[ge].mipmaps;for(let ct=0;ct<Xe.length;ct++){const Ot=Xe[ct];S.format!==Fi?ce!==null?Ne?se&&t.compressedTexSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ct,0,0,Ot.width,Ot.height,ce,Ot.data):t.compressedTexImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ct,oe,Ot.width,Ot.height,0,Ot.data):He("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ne?se&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ct,0,0,Ot.width,Ot.height,ce,ae,Ot.data):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ct,oe,Ot.width,Ot.height,0,ce,ae,Ot.data)}}}else{if(Xe=S.mipmaps,Ne&&Ye){Xe.length>0&&ze++;const ge=Ve(Q[0]);t.texStorage2D(a.TEXTURE_CUBE_MAP,ze,oe,ge.width,ge.height)}for(let ge=0;ge<6;ge++)if(R){Ne?se&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,Q[ge].width,Q[ge].height,ce,ae,Q[ge].data):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,oe,Q[ge].width,Q[ge].height,0,ce,ae,Q[ge].data);for(let ct=0;ct<Xe.length;ct++){const nn=Xe[ct].image[ge].image;Ne?se&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ct+1,0,0,nn.width,nn.height,ce,ae,nn.data):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ct+1,oe,nn.width,nn.height,0,ce,ae,nn.data)}}else{Ne?se&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,ce,ae,Q[ge]):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,oe,ce,ae,Q[ge]);for(let ct=0;ct<Xe.length;ct++){const Ot=Xe[ct];Ne?se&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ct+1,0,0,ce,ae,Ot.image[ge]):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ct+1,oe,ce,ae,Ot.image[ge])}}}M(S)&&S.mipmapsAutoUpdate===!0&&y(a.TEXTURE_CUBE_MAP),re.__version=ee.version,S.onUpdate&&S.onUpdate(S)}T.__version=S.version}function St(T,S,O,ne,ee,re){const he=s.convert(O.format,O.colorSpace),Y=s.convert(O.type),J=E(O.internalFormat,he,Y,O.normalized,O.colorSpace),le=i.get(S),R=i.get(O);if(R.__renderTarget=S,!le.__hasExternalTextures){const Q=Math.max(1,S.width>>re),X=Math.max(1,S.height>>re);ee===a.TEXTURE_3D||ee===a.TEXTURE_2D_ARRAY?t.texImage3D(ee,re,J,Q,X,S.depth,0,he,Y,null):t.texImage2D(ee,re,J,Q,X,0,he,Y,null)}t.bindFramebuffer(a.FRAMEBUFFER,T),pe(S)?o.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,ne,ee,R.__webglTexture,0,yt(S)):(ee===a.TEXTURE_2D||ee>=a.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=a.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&a.framebufferTexture2D(a.FRAMEBUFFER,ne,ee,R.__webglTexture,re),t.bindFramebuffer(a.FRAMEBUFFER,null)}function Ri(T,S,O){if(a.bindRenderbuffer(a.RENDERBUFFER,T),S.depthBuffer){const ne=S.depthTexture,ee=ne&&ne.isDepthTexture?ne.type:null,re=x(S.stencilBuffer,ee),he=S.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT;pe(S)?o.renderbufferStorageMultisampleEXT(a.RENDERBUFFER,yt(S),re,S.width,S.height):O?a.renderbufferStorageMultisample(a.RENDERBUFFER,yt(S),re,S.width,S.height):a.renderbufferStorage(a.RENDERBUFFER,re,S.width,S.height),a.framebufferRenderbuffer(a.FRAMEBUFFER,he,a.RENDERBUFFER,T)}else{const ne=S.textures;for(let ee=0;ee<ne.length;ee++){const re=ne[ee],he=s.convert(re.format,re.colorSpace),Y=s.convert(re.type),J=E(re.internalFormat,he,Y,re.normalized,re.colorSpace);pe(S)?o.renderbufferStorageMultisampleEXT(a.RENDERBUFFER,yt(S),J,S.width,S.height):O?a.renderbufferStorageMultisample(a.RENDERBUFFER,yt(S),J,S.width,S.height):a.renderbufferStorage(a.RENDERBUFFER,J,S.width,S.height)}}a.bindRenderbuffer(a.RENDERBUFFER,null)}function zt(T,S,O){const ne=S.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(a.FRAMEBUFFER,T),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const ee=i.get(S.depthTexture);ee.__renderTarget=S;const re=ne?S.depthTexture.image[0]:S.depthTexture.image;(!ee.__webglTexture||re.width!==S.width||re.height!==S.height)&&(re.width=S.width,re.height=S.height,S.depthTexture.needsUpdate=!0),ne?me(S.depthTexture,0):fe(S.depthTexture,0);const he=ee.__webglTexture,Y=yt(S),J=ne?a.TEXTURE_CUBE_MAP_POSITIVE_X+O:a.TEXTURE_2D,le=S.depthTexture.format===mn?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT;if(S.depthTexture.format===gn)pe(S)?o.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,le,J,he,0,Y):a.framebufferTexture2D(a.FRAMEBUFFER,le,J,he,0);else if(S.depthTexture.format===mn)pe(S)?o.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,le,J,he,0,Y):a.framebufferTexture2D(a.FRAMEBUFFER,le,J,he,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ui(T){const S=i.get(T),O=T.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==T.depthTexture){const ne=T.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),ne){const ee=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,ne.removeEventListener("dispose",ee)};ne.addEventListener("dispose",ee),S.__depthDisposeCallback=ee}S.__boundDepthTexture=ne}if(T.depthTexture&&!S.__autoAllocateDepthBuffer)if(O)for(let ne=0;ne<6;ne++)zt(S.__webglFramebuffer[ne],T,ne);else T.texture.mipmaps.length>0?zt(S.__webglFramebuffer[0],T,0):zt(S.__webglFramebuffer,T,0);else if(O){S.__webglDepthbuffer=[];for(let ne=0;ne<6;ne++)if(t.bindFramebuffer(a.FRAMEBUFFER,S.__webglFramebuffer[ne]),S.__webglDepthbuffer[ne]===void 0)S.__webglDepthbuffer[ne]=a.createRenderbuffer(),Ri(S.__webglDepthbuffer[ne],T,!1);else{const ee=T.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,re=S.__webglDepthbuffer[ne];a.bindRenderbuffer(a.RENDERBUFFER,re),a.framebufferRenderbuffer(a.FRAMEBUFFER,ee,a.RENDERBUFFER,re)}}else if(T.texture.mipmaps.length>0?t.bindFramebuffer(a.FRAMEBUFFER,S.__webglFramebuffer[0]):t.bindFramebuffer(a.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=a.createRenderbuffer(),Ri(S.__webglDepthbuffer,T,!1);else{const ee=T.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,re=S.__webglDepthbuffer;a.bindRenderbuffer(a.RENDERBUFFER,re),a.framebufferRenderbuffer(a.FRAMEBUFFER,ee,a.RENDERBUFFER,re)}t.bindFramebuffer(a.FRAMEBUFFER,null)}function fi(T,S,O){const ne=i.get(T);S!==void 0&&St(ne.__webglFramebuffer,T,T.texture,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,0),O!==void 0&&ui(T)}function pi(T){const S=T.texture,O=i.get(T),ne=i.get(S);T.addEventListener("dispose",F),L(T);const ee=T.textures,re=T.isWebGLCubeRenderTarget===!0,he=ee.length>1;if(he||(ne.__webglTexture===void 0&&(ne.__webglTexture=a.createTexture()),ne.__version=S.version,r.memory.textures++),re){O.__webglFramebuffer=[];for(let Y=0;Y<6;Y++)if(S.mipmaps.length>0){O.__webglFramebuffer[Y]=[];for(let J=0;J<S.mipmaps.length;J++)O.__webglFramebuffer[Y][J]=a.createFramebuffer()}else O.__webglFramebuffer[Y]=a.createFramebuffer()}else{if(S.mipmaps.length>0){O.__webglFramebuffer=[];for(let Y=0;Y<S.mipmaps.length;Y++)O.__webglFramebuffer[Y]=a.createFramebuffer()}else O.__webglFramebuffer=a.createFramebuffer();if(he)for(let Y=0,J=ee.length;Y<J;Y++){const le=i.get(ee[Y]);le.__webglTexture===void 0&&(le.__webglTexture=a.createTexture(),r.memory.textures++)}if(T.samples>0&&pe(T)===!1){O.__webglMultisampledFramebuffer=a.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(a.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let Y=0;Y<ee.length;Y++){const J=ee[Y];O.__webglColorRenderbuffer[Y]=a.createRenderbuffer(),a.bindRenderbuffer(a.RENDERBUFFER,O.__webglColorRenderbuffer[Y]);const le=s.convert(J.format,J.colorSpace),R=s.convert(J.type),Q=E(J.internalFormat,le,R,J.normalized,J.colorSpace,T.isXRRenderTarget===!0),X=yt(T);a.renderbufferStorageMultisample(a.RENDERBUFFER,X,Q,T.width,T.height),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+Y,a.RENDERBUFFER,O.__webglColorRenderbuffer[Y])}a.bindRenderbuffer(a.RENDERBUFFER,null),T.depthBuffer&&(O.__webglDepthRenderbuffer=a.createRenderbuffer(),Ri(O.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(a.FRAMEBUFFER,null)}}if(re){t.bindTexture(a.TEXTURE_CUBE_MAP,ne.__webglTexture),je(a.TEXTURE_CUBE_MAP,S);for(let Y=0;Y<6;Y++)if(S.mipmaps.length>0)for(let J=0;J<S.mipmaps.length;J++)St(O.__webglFramebuffer[Y][J],T,S,a.COLOR_ATTACHMENT0,a.TEXTURE_CUBE_MAP_POSITIVE_X+Y,J);else St(O.__webglFramebuffer[Y],T,S,a.COLOR_ATTACHMENT0,a.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0);M(S)?y(a.TEXTURE_CUBE_MAP):S.mipmaps.length>0&&a.texParameteri(a.TEXTURE_CUBE_MAP,a.TEXTURE_MAX_LEVEL,S.mipmaps.length-1),t.unbindTexture()}else if(he){for(let Y=0,J=ee.length;Y<J;Y++){const le=ee[Y],R=i.get(le);let Q=a.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(Q=T.isWebGL3DRenderTarget?a.TEXTURE_3D:a.TEXTURE_2D_ARRAY),t.bindTexture(Q,R.__webglTexture),je(Q,le),St(O.__webglFramebuffer,T,le,a.COLOR_ATTACHMENT0+Y,Q,0),M(le)&&y(Q)}t.unbindTexture()}else{let Y=a.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(Y=T.isWebGL3DRenderTarget?a.TEXTURE_3D:a.TEXTURE_2D_ARRAY),t.bindTexture(Y,ne.__webglTexture),je(Y,S),S.mipmaps.length>0)for(let J=0;J<S.mipmaps.length;J++)St(O.__webglFramebuffer[J],T,S,a.COLOR_ATTACHMENT0,Y,J);else St(O.__webglFramebuffer,T,S,a.COLOR_ATTACHMENT0,Y,0);M(S)?y(Y):S.mipmaps.length>0&&a.texParameteri(Y,a.TEXTURE_MAX_LEVEL,S.mipmaps.length-1),t.unbindTexture()}T.depthBuffer&&ui(T)}function U(T){const S=T.textures;for(let O=0,ne=S.length;O<ne;O++){const ee=S[O];if(M(ee)&&ee.mipmapsAutoUpdate===!0){const re=A(T),he=i.get(ee).__webglTexture;t.bindTexture(re,he),y(re),t.unbindTexture()}}}const mi=[];function _t(T){if(T.samples>0){if(pe(T)===!1){const S=T.textures,O=T.width,ne=T.height;let ee=a.COLOR_BUFFER_BIT;const re=T.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,he=i.get(T),Y=S.length>1;if(Y)for(let le=0;le<S.length;le++)t.bindFramebuffer(a.FRAMEBUFFER,he.__webglMultisampledFramebuffer),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+le,a.RENDERBUFFER,null),t.bindFramebuffer(a.FRAMEBUFFER,he.__webglFramebuffer),a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0+le,a.TEXTURE_2D,null,0);t.bindFramebuffer(a.READ_FRAMEBUFFER,he.__webglMultisampledFramebuffer),T.texture.mipmaps.length>0?t.bindFramebuffer(a.DRAW_FRAMEBUFFER,he.__webglFramebuffer[0]):t.bindFramebuffer(a.DRAW_FRAMEBUFFER,he.__webglFramebuffer);for(let le=0;le<S.length;le++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(ee|=a.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(ee|=a.STENCIL_BUFFER_BIT)),Y){a.framebufferRenderbuffer(a.READ_FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.RENDERBUFFER,he.__webglColorRenderbuffer[le]);const R=i.get(S[le]).__webglTexture;a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,R,0)}a.blitFramebuffer(0,0,O,ne,0,0,O,ne,ee,a.NEAREST),c===!0&&(mi.length=0,mi.push(a.COLOR_ATTACHMENT0+le),T.depthBuffer&&T.storeMultisampledDepthBuffer===!1&&mi.push(re),a.invalidateFramebuffer(a.READ_FRAMEBUFFER,mi))}if(t.bindFramebuffer(a.READ_FRAMEBUFFER,null),t.bindFramebuffer(a.DRAW_FRAMEBUFFER,null),Y)for(let le=0;le<S.length;le++){t.bindFramebuffer(a.FRAMEBUFFER,he.__webglMultisampledFramebuffer),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+le,a.RENDERBUFFER,he.__webglColorRenderbuffer[le]);const R=i.get(S[le]).__webglTexture;t.bindFramebuffer(a.FRAMEBUFFER,he.__webglFramebuffer),a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0+le,a.TEXTURE_2D,R,0)}t.bindFramebuffer(a.DRAW_FRAMEBUFFER,he.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.storeMultisampledDepthBuffer===!1&&c){const S=T.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT;a.invalidateFramebuffer(a.DRAW_FRAMEBUFFER,[S])}}}function yt(T){return Math.min(n.maxSamples,T.samples)}function pe(T){const S=i.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function Dt(T){const S=r.render.frame;d.get(T)!==S&&(d.set(T,S),T.update())}function ke(T,S){const O=T.colorSpace,ne=T.format,ee=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||O!==qa&&O!==un&&(nt.getTransfer(O)===dt?(ne!==Fi||ee!==hi)&&He("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ot("WebGLTextures: Unsupported texture color space:",O)),S}function Ve(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(l.width=T.naturalWidth||T.width,l.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(l.width=T.displayWidth,l.height=T.displayHeight):(l.width=T.width,l.height=T.height),l}this.allocateTextureUnit=Be,this.resetTextureUnits=j,this.getTextureUnits=te,this.setTextureUnits=be,this.setTexture2D=fe,this.setTexture2DArray=Se,this.setTexture3D=Oe,this.setTextureCube=me,this.rebindTextures=fi,this.setupRenderTarget=pi,this.updateRenderTargetMipmap=U,this.updateMultisampleRenderTarget=_t,this.setupDepthRenderbuffer=ui,this.setupFrameBufferTexture=St,this.useMultisampledRTT=pe,this.dispose=G}function Ug(a,e){function t(i,n=un){let s;const r=nt.getTransfer(n);if(i===hi)return a.UNSIGNED_BYTE;if(i===Wo)return a.UNSIGNED_SHORT_4_4_4_4;if(i===qo)return a.UNSIGNED_SHORT_5_5_5_1;if(i===td)return a.UNSIGNED_INT_5_9_9_9_REV;if(i===id)return a.UNSIGNED_INT_10F_11F_11F_REV;if(i===jc)return a.BYTE;if(i===ed)return a.SHORT;if(i===$s)return a.UNSIGNED_SHORT;if(i===Vo)return a.INT;if(i===Bi)return a.UNSIGNED_INT;if(i===Ai)return a.FLOAT;if(i===Hi)return a.HALF_FLOAT;if(i===nd)return a.ALPHA;if(i===sd)return a.RGB;if(i===Fi)return a.RGBA;if(i===gn)return a.DEPTH_COMPONENT;if(i===mn)return a.DEPTH_STENCIL;if(i===ir)return a.RED;if(i===$o)return a.RED_INTEGER;if(i===In)return a.RG;if(i===Xo)return a.RG_INTEGER;if(i===Yo)return a.RGBA_INTEGER;if(i===Fa||i===za||i===Oa||i===ka)if(r===dt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===Fa)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===za)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Oa)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===ka)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===Fa)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===za)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Oa)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===ka)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===io||i===no||i===so||i===ao)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===io)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===no)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===so)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===ao)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===ro||i===oo||i===lo||i===co||i===ho||i===Ga||i===uo)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===ro||i===oo)return r===dt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===lo)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(i===co)return s.COMPRESSED_R11_EAC;if(i===ho)return s.COMPRESSED_SIGNED_R11_EAC;if(i===Ga)return s.COMPRESSED_RG11_EAC;if(i===uo)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===fo||i===po||i===mo||i===go||i===vo||i===xo||i===_o||i===yo||i===Mo||i===So||i===bo||i===wo||i===Eo||i===Ao)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===fo)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===po)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===mo)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===go)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===vo)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===xo)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===_o)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===yo)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Mo)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===So)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===bo)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===wo)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Eo)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Ao)return r===dt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===To||i===Co||i===Ro)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===To)return r===dt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Co)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Ro)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Po||i===Lo||i===Va||i===Do)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Po)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Lo)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Va)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Do)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===os?a.UNSIGNED_INT_24_8:a[i]!==void 0?a[i]:null}return{convert:t}}const Fg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,zg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Og{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new Md(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Vi({vertexShader:Fg,fragmentShader:zg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new H(new Mi(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class kg extends Fn{constructor(e,t){super();const i=this;let n=null,s=1,r=null,o="local-floor",c=1,l=null,d=null,h=null,u=null,f=null,p=null;const v=typeof XRWebGLBinding<"u",g=new Og,m={},_=t.getContextAttributes();let M=null,y=null;const A=[],E=[],x=new xe;let w=null,L=null;const C=new di;C.viewport=new wt;const N=new di;N.viewport=new wt;const F=[C,N],W=new Ku;let P=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let fe=A[Z];return fe===void 0&&(fe=new yr,A[Z]=fe),fe.getTargetRaySpace()},this.getControllerGrip=function(Z){let fe=A[Z];return fe===void 0&&(fe=new yr,A[Z]=fe),fe.getGripSpace()},this.getHand=function(Z){let fe=A[Z];return fe===void 0&&(fe=new yr,A[Z]=fe),fe.getHandSpace()};function K(Z){const fe=E.indexOf(Z.inputSource);if(fe===-1)return;const Se=A[fe];Se!==void 0&&(Se.update(Z.inputSource,Z.frame,l||r),Se.dispatchEvent({type:Z.type,data:Z.inputSource}))}function B(){n.removeEventListener("select",K),n.removeEventListener("selectstart",K),n.removeEventListener("selectend",K),n.removeEventListener("squeeze",K),n.removeEventListener("squeezestart",K),n.removeEventListener("squeezeend",K),n.removeEventListener("end",B),n.removeEventListener("inputsourceschange",ie);for(let Z=0;Z<A.length;Z++){const fe=E[Z];fe!==null&&(E[Z]=null,A[Z].disconnect(fe))}P=null,G=null,g.reset();for(const Z in m)delete m[Z];if(e.setRenderTarget(M),f=null,u=null,h=null,n=null,y=null,Be.stop(),i.isPresenting=!1,e.setPixelRatio(w),e.setSize(x.width,x.height,!1),L!==null){const Z=L.camera;Z.fov=L.fov,Z.zoom=L.zoom,Z.updateProjectionMatrix(),L=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){s=Z,i.isPresenting===!0&&He("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,i.isPresenting===!0&&He("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||r},this.setReferenceSpace=function(Z){l=Z},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return h===null&&v&&(h=new XRWebGLBinding(n,t)),h},this.getFrame=function(){return p},this.getSession=function(){return n},this.setSession=async function(Z){if(n=Z,n!==null){if(M=e.getRenderTarget(),n.addEventListener("select",K),n.addEventListener("selectstart",K),n.addEventListener("selectend",K),n.addEventListener("squeeze",K),n.addEventListener("squeezestart",K),n.addEventListener("squeezeend",K),n.addEventListener("end",B),n.addEventListener("inputsourceschange",ie),_.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(x),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let Se=null,Oe=null,me=null;_.depth&&(me=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Se=_.stencil?mn:gn,Oe=_.stencil?os:Bi);const ye={colorFormat:t.RGBA8,depthFormat:me,scaleFactor:s};h=this.getBinding(),u=h.createProjectionLayer(ye),n.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),y=new zi(u.textureWidth,u.textureHeight,{format:Fi,type:hi,depthTexture:new cs(u.textureWidth,u.textureHeight,Oe,void 0,void 0,void 0,void 0,void 0,void 0,Se),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{const Se={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(n,t,Se),n.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new zi(f.framebufferWidth,f.framebufferHeight,{format:Fi,type:hi,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(c),l=null,r=await n.requestReferenceSpace(o),Be.setContext(n),Be.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function ie(Z){for(let fe=0;fe<Z.removed.length;fe++){const Se=Z.removed[fe],Oe=E.indexOf(Se);Oe>=0&&(E[Oe]=null,A[Oe].disconnect(Se))}for(let fe=0;fe<Z.added.length;fe++){const Se=Z.added[fe];let Oe=E.indexOf(Se);if(Oe===-1){for(let ye=0;ye<A.length;ye++)if(ye>=E.length){E.push(Se),Oe=ye;break}else if(E[ye]===null){E[ye]=Se,Oe=ye;break}if(Oe===-1)break}const me=A[Oe];me&&me.connect(Se)}}function $(Z,fe){fe===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(fe.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(n===null)return;let fe=Z.near,Se=Z.far;g.texture!==null&&(g.depthNear>0&&(fe=g.depthNear),g.depthFar>0&&(Se=g.depthFar)),W.near=N.near=C.near=fe,W.far=N.far=C.far=Se,(P!==W.near||G!==W.far)&&(n.updateRenderState({depthNear:W.near,depthFar:W.far}),P=W.near,G=W.far),W.layers.mask=Z.layers.mask|6,C.layers.mask=W.layers.mask&-5,N.layers.mask=W.layers.mask&-3;const Oe=Z.parent,me=W.cameras;$(W,Oe);for(let ye=0;ye<me.length;ye++)$(me[ye],Oe);W.projectionMatrix.copy(C.projectionMatrix),W.projectionMatrixInverse.copy(C.projectionMatrixInverse),L===null&&Z.isPerspectiveCamera&&(L={camera:Z,fov:Z.fov,zoom:Z.zoom}),j(Z,W,Oe)};function j(Z,fe,Se){Se===null?Z.matrix.copy(fe.matrixWorld):(Z.matrix.copy(Se.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(fe.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(fe.projectionMatrix),Z.projectionMatrixInverse.copy(fe.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=Io*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return W},this.getFoveation=function(){if(!(u===null&&f===null))return c},this.setFoveation=function(Z){c=Z,u!==null&&(u.fixedFoveation=Z),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Z)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(W)},this.getCameraTexture=function(Z){return m[Z]};let te=null;function be(Z,fe){if(d=fe.getViewerPose(l||r),p=fe,d!==null){const Se=d.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let Oe=!1;Se.length!==W.cameras.length&&(W.cameras.length=0,Oe=!0);for(let Me=0;Me<Se.length;Me++){const je=Se[Me];let at=null;if(f!==null)at=f.getViewport(je);else{const Ht=h.getViewSubImage(u,je);at=Ht.viewport,Me===0&&(e.setRenderTargetTextures(y,Ht.colorTexture,Ht.depthStencilTexture),e.setRenderTarget(y))}let $e=F[Me];$e===void 0&&($e=new di,$e.layers.enable(Me),$e.viewport=new wt,F[Me]=$e),$e.matrix.fromArray(je.transform.matrix),$e.matrix.decompose($e.position,$e.quaternion,$e.scale),$e.projectionMatrix.fromArray(je.projectionMatrix),$e.projectionMatrixInverse.copy($e.projectionMatrix).invert(),$e.viewport.set(at.x,at.y,at.width,at.height),Me===0&&(W.matrix.copy($e.matrix),W.matrix.decompose(W.position,W.quaternion,W.scale)),Oe===!0&&W.cameras.push($e)}const me=n.enabledFeatures;if(me&&me.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&v){h=i.getBinding();const Me=h.getDepthInformation(Se[0]);Me&&Me.isValid&&Me.texture&&g.init(Me,n.renderState)}if(me&&me.includes("camera-access")&&v){e.state.unbindTexture(),h=i.getBinding();for(let Me=0;Me<Se.length;Me++){const je=Se[Me].camera;if(je){let at=m[je];at||(at=new Md,m[je]=at);const $e=h.getCameraImage(je);at.sourceTexture=$e}}}}for(let Se=0;Se<A.length;Se++){const Oe=E[Se],me=A[Se];Oe!==null&&me!==void 0&&me.update(Oe,fe,l||r)}te&&te(Z,fe),fe.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:fe}),p=null}const Be=new Fd;Be.setAnimationLoop(be),this.setAnimationLoop=function(Z){te=Z},this.dispose=function(){}}}const Bg=new ht,$d=new We;$d.set(-1,0,0,0,1,0,0,0,1);function Hg(a,e){function t(g,m){g.matrixAutoUpdate===!0&&g.updateMatrix(),m.value.copy(g.matrix)}function i(g,m){m.color.getRGB(g.fogColor.value,Dd(a)),m.isFog?(g.fogNear.value=m.near,g.fogFar.value=m.far):m.isFogExp2&&(g.fogDensity.value=m.density)}function n(g,m,_,M,y){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?s(g,m):m.isMeshLambertMaterial?(s(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(s(g,m),h(g,m)):m.isMeshPhongMaterial?(s(g,m),d(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(s(g,m),u(g,m),m.isMeshPhysicalMaterial&&f(g,m,y)):m.isMeshMatcapMaterial?(s(g,m),p(g,m)):m.isMeshDepthMaterial?s(g,m):m.isMeshDistanceMaterial?(s(g,m),v(g,m)):m.isMeshNormalMaterial?s(g,m):m.isLineBasicMaterial?(r(g,m),m.isLineDashedMaterial&&o(g,m)):m.isPointsMaterial?c(g,m,_,M):m.isSpriteMaterial?l(g,m):m.isShadowMaterial?(g.color.value.copy(m.color),g.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(g,m){g.opacity.value=m.opacity,m.color&&g.diffuse.value.copy(m.color),m.emissive&&g.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(g.map.value=m.map,t(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.bumpMap&&(g.bumpMap.value=m.bumpMap,t(m.bumpMap,g.bumpMapTransform),g.bumpScale.value=m.bumpScale,m.side===Vt&&(g.bumpScale.value*=-1)),m.normalMap&&(g.normalMap.value=m.normalMap,t(m.normalMap,g.normalMapTransform),g.normalScale.value.copy(m.normalScale),m.side===Vt&&g.normalScale.value.negate()),m.displacementMap&&(g.displacementMap.value=m.displacementMap,t(m.displacementMap,g.displacementMapTransform),g.displacementScale.value=m.displacementScale,g.displacementBias.value=m.displacementBias),m.emissiveMap&&(g.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,g.emissiveMapTransform)),m.specularMap&&(g.specularMap.value=m.specularMap,t(m.specularMap,g.specularMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest);const _=e.get(m),M=_.envMap,y=_.envMapRotation;M&&(g.envMap.value=M,g.envMapRotation.value.setFromMatrix4(Bg.makeRotationFromEuler(y)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply($d),g.reflectivity.value=m.reflectivity,g.ior.value=m.ior,g.refractionRatio.value=m.refractionRatio),m.lightMap&&(g.lightMap.value=m.lightMap,g.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,g.lightMapTransform)),m.aoMap&&(g.aoMap.value=m.aoMap,g.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,g.aoMapTransform))}function r(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,m.map&&(g.map.value=m.map,t(m.map,g.mapTransform))}function o(g,m){g.dashSize.value=m.dashSize,g.totalSize.value=m.dashSize+m.gapSize,g.scale.value=m.scale}function c(g,m,_,M){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.size.value=m.size*_,g.scale.value=M*.5,m.map&&(g.map.value=m.map,t(m.map,g.uvTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function l(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.rotation.value=m.rotation,m.map&&(g.map.value=m.map,t(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function d(g,m){g.specular.value.copy(m.specular),g.shininess.value=Math.max(m.shininess,1e-4)}function h(g,m){m.gradientMap&&(g.gradientMap.value=m.gradientMap)}function u(g,m){g.metalness.value=m.metalness,m.metalnessMap&&(g.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,g.metalnessMapTransform)),g.roughness.value=m.roughness,m.roughnessMap&&(g.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,g.roughnessMapTransform)),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)}function f(g,m,_){g.ior.value=m.ior,m.diffuseRoughness>0&&(g.diffuseRoughness.value=m.diffuseRoughness,m.diffuseRoughnessMap&&(g.diffuseRoughnessMap.value=m.diffuseRoughnessMap,t(m.diffuseRoughnessMap,g.diffuseRoughnessMapTransform))),m.sheen>0&&(g.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),g.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(g.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,g.sheenColorMapTransform)),m.sheenRoughnessMap&&(g.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,g.sheenRoughnessMapTransform))),m.clearcoat>0&&(g.clearcoat.value=m.clearcoat,g.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(g.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,g.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(g.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Vt&&g.clearcoatNormalScale.value.negate())),m.dispersion>0&&(g.dispersion.value=m.dispersion),m.retroreflectivity>0&&(g.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(g.iridescence.value=m.iridescence,g.iridescenceIOR.value=m.iridescenceIOR,g.iridescenceThicknessMinimum.value=m.iridescenceThicknessMinimum,g.iridescenceThicknessMaximum.value=m.iridescenceThicknessMaximum,m.iridescenceMap&&(g.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,g.iridescenceMapTransform)),m.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),m.transmission>0&&(g.transmission.value=m.transmission,g.transmissionSamplerMap.value=_.texture,g.transmissionSamplerSize.value.set(_.width,_.height),m.transmissionMap&&(g.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,g.transmissionMapTransform)),g.thickness.value=m.thickness,m.thicknessMap&&(g.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=m.attenuationDistance,g.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(g.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(g.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=m.specularIntensity,g.specularColor.value.copy(m.specularColor),m.specularColorMap&&(g.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,g.specularColorMapTransform)),m.specularIntensityMap&&(g.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,g.specularIntensityMapTransform))}function p(g,m){m.matcap&&(g.matcap.value=m.matcap)}function v(g,m){const _=e.get(m).light;g.referencePosition.value.setFromMatrixPosition(_.matrixWorld),g.nearDistance.value=_.shadow.camera.near,g.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function Gg(a,e,t,i){let n={},s={};function r(_,M){const y=M.program;i.uniformBlockBinding(_,y,n[_.id])}function o(_,M){let y=n[_.id];y===void 0&&(p(_),y=c(_),n[_.id]=y,_.addEventListener("dispose",g));const A=M.program;i.updateUBOMapping(_,A);const E=e.render.frame;s[_.id]!==E&&(l(_),s[_.id]=E)}function c(_){const M=a.createBuffer(),y=_.__size,A=_.usage;return a.bindBuffer(a.UNIFORM_BUFFER,M),a.bufferData(a.UNIFORM_BUFFER,y,A),a.bindBuffer(a.UNIFORM_BUFFER,null),M}function l(_){const M=n[_.id],y=_.uniforms,A=_.__cache;a.bindBuffer(a.UNIFORM_BUFFER,M);for(let E=0,x=y.length;E<x;E++){const w=y[E];if(Array.isArray(w))for(let L=0,C=w.length;L<C;L++)d(w[L],E,L,A);else d(w,E,0,A)}a.bindBuffer(a.UNIFORM_BUFFER,null)}function d(_,M,y,A){if(u(_,M,y,A)===!0){const E=_.__offset,x=_.value;if(Array.isArray(x)){let w=0;for(let L=0;L<x.length;L++){const C=x[L],N=v(C,!0);h(C,_.__data,w),w+=N.storage/Float32Array.BYTES_PER_ELEMENT}}else h(x,_.__data,0);a.bufferSubData(a.UNIFORM_BUFFER,E,_.__data)}}function h(_,M,y){typeof _=="number"||typeof _=="boolean"?M[y]=_:_.isMatrix3?(M[y]=_.elements[0],M[y+1]=_.elements[1],M[y+2]=_.elements[2],M[y+3]=0,M[y+4]=_.elements[3],M[y+5]=_.elements[4],M[y+6]=_.elements[5],M[y+7]=0,M[y+8]=_.elements[6],M[y+9]=_.elements[7],M[y+10]=_.elements[8],M[y+11]=0):ArrayBuffer.isView(_)?M.set(_.subarray(0,M.length-y),y):_.toArray(M,y)}function u(_,M,y,A){const E=_.value,x=M+"_"+y;if(Array.isArray(E)){A[x]===void 0&&(A[x]=[]);const w=A[x];let L=!1;for(let C=0;C<E.length;C++)f(E[C],w,C)===!0&&(L=!0);return L}return f(E,A,x)}function f(_,M,y){if(M[y]===void 0)return typeof _=="number"||typeof _=="boolean"?M[y]=_:ArrayBuffer.isView(_)?M[y]=_.slice():M[y]=_.clone(),!0;{const A=M[y];if(typeof _=="number"||typeof _=="boolean"){if(A!==_)return M[y]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(A.equals(_)===!1)return A.copy(_),!0}}return!1}function p(_){const M=_.uniforms;let y=0;const A=16;for(let x=0,w=M.length;x<w;x++){const L=Array.isArray(M[x])?M[x]:[M[x]];for(let C=0,N=L.length;C<N;C++){const F=L[C],W=Array.isArray(F.value)?F.value:[F.value],P=Array.isArray(M[x])||Array.isArray(F.value);let G=y;for(let B=0,ie=W.length;B<ie;B++){const $=W[B],j=v($,P),te=y%A,be=te%j.boundary,Be=te+be;y+=be,Be!==0&&A-Be<j.storage&&(y+=A-Be),B===0&&(G=y),y+=j.storage}const K=F.type==="int"?Int32Array:F.type==="uint"?Uint32Array:Float32Array;F.__data=new K((y-G)/Float32Array.BYTES_PER_ELEMENT),F.__offset=G}}const E=y%A;return E>0&&(y+=A-E),_.__size=y,_.__cache={},this}function v(_,M){const y={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(y.boundary=4,y.storage=4):_.isVector2?(y.boundary=8,y.storage=8):_.isVector3||_.isColor?(y.boundary=16,y.storage=12):_.isVector4?(y.boundary=16,y.storage=16):_.isMatrix3?(y.boundary=16,y.storage=48):_.isMatrix4?(y.boundary=16,y.storage=64):_.isTexture?He("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(_)?(y.boundary=16,y.storage=_.byteLength):He("WebGLRenderer: Unsupported uniform value type.",_),M===!0&&(y.boundary=16,y.storage=Math.ceil(y.storage/16)*16),y}function g(_){const M=_.target;M.removeEventListener("dispose",g),a.deleteBuffer(n[M.id]),delete n[M.id],delete s[M.id]}function m(){for(const _ in n)a.deleteBuffer(n[_]);n={},s={}}return{bind:r,update:o,dispose:m}}const Vg=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Li=null;function Wg(){return Li===null&&(Li=new Jo(Vg,16,16,In,Hi),Li.name="DFG_LUT",Li.minFilter=oi,Li.magFilter=oi,Li.wrapS=Ji,Li.wrapT=Ji,Li.generateMipmaps=!1,Li.needsUpdate=!0),Li}class qg{constructor(e={}){const{canvas:t=Uh(),context:i=null,depth:n=!0,stencil:s=!1,alpha:r=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:u=!1,outputBufferType:f=hi}=e;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=r;const v=f,g=new Set([Yo,Xo,$o]),m=new Set([hi,Bi,$s,os,Wo,qo]),_=new Uint32Array(4),M=new Int32Array(4),y={textures:[],min:[],max:[],resolution:[]};let A=null,E=null;const x=[],w=[];let L=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ji,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const C=this;let N=!1,F=null,W=null,P=null,G=null;this._outputColorSpace=Kt;let K=0,B=0,ie=null,$=-1,j=null;const te=new wt,be=new wt;let Be=null;const Z=new Ce(0);let fe=0,Se=t.width,Oe=t.height,me=1,ye=null,Ie=null;const Me=new wt(0,0,Se,Oe),je=new wt(0,0,Se,Oe);let at=!1;const $e=new Ys,Ht=new Qo;let Lt=!1,si=!1;const St=new ht,Ri=new I,zt=new wt,ui={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let fi=!1;function pi(){return ie===null?me:1}let U=i;function mi(b,D){return t.getContext(b,D)}let _t,yt,pe,Dt,ke,Ve,T,S,O,ne,ee,re,he,Y,J,le,R,Q,X,ce,ae,oe,Ne;try{const b={alpha:!0,depth:n,stencil:s,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:d,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Ho}`),t.addEventListener("webglcontextlost",ze,!1),t.addEventListener("webglcontextrestored",Xe,!1),t.addEventListener("webglcontextcreationerror",ge,!1),U===null){const D="webgl2";if(U=mi(D,b),U===null)throw mi(D)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ye()}catch(b){throw t.removeEventListener("webglcontextlost",ze,!1),t.removeEventListener("webglcontextrestored",Xe,!1),t.removeEventListener("webglcontextcreationerror",ge,!1),ot("WebGLRenderer: "+b.message),b}function Ye(){_t=new Ym(U),_t.init(),ae=new Ug(U,_t),yt=new zm(U,_t,e,ae),pe=new Ig(U,_t),yt.reversedDepthBuffer&&u&&pe.buffers.depth.setReversed(!0),W=U.createFramebuffer(),P=U.createFramebuffer(),G=U.createFramebuffer(),Dt=new Jm(U),ke=new _g,Ve=new Ng(U,_t,pe,ke,yt,ae,Dt),T=new Xm(C),S=new Qu(U),oe=new Um(U,S),O=new Km(U,S,Dt,oe),ne=new jm(U,O,S,oe,Dt),Q=new Qm(U,yt,Ve),J=new Om(ke),ee=new xg(C,T,_t,yt,oe,J),re=new Hg(C,ke),he=new Mg,Y=new Tg(_t),R=new Nm(C,T,pe,ne,p,c),le=new Dg(C,ne,yt),Ne=new Gg(U,Dt,yt,pe),X=new Fm(U,_t,Dt),ce=new Zm(U,_t,Dt),Dt.programs=ee.programs,C.capabilities=yt,C.extensions=_t,C.properties=ke,C.renderLists=he,C.shadowMap=le,C.state=pe,C.info=Dt}v!==hi&&(L=new t0(v,t.width,t.height,o,n,s));const se=new kg(C,U);this.xr=se,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const b=_t.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=_t.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return me},this.setPixelRatio=function(b){b!==void 0&&(me=b,this.setSize(Se,Oe,!1))},this.getSize=function(b){return b.set(Se,Oe)},this.setSize=function(b,D,V=!0){if(se.isPresenting){He("WebGLRenderer: Can't change size while VR device is presenting.");return}Se=b,Oe=D,t.width=Math.floor(b*me),t.height=Math.floor(D*me),V===!0&&(t.style.width=b+"px",t.style.height=D+"px"),L!==null&&L.setSize(t.width,t.height),this.setViewport(0,0,b,D)},this.getDrawingBufferSize=function(b){return b.set(Se*me,Oe*me).floor()},this.setDrawingBufferSize=function(b,D,V){Se=b,Oe=D,me=V,t.width=Math.floor(b*V),t.height=Math.floor(D*V),this.setViewport(0,0,b,D)},this.setEffects=function(b){if(v===hi){ot("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let D=0;D<b.length;D++)if(b[D].isOutputPass===!0){He("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}L.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy(te)},this.getViewport=function(b){return b.copy(Me)},this.setViewport=function(b,D,V,z){b.isVector4?Me.set(b.x,b.y,b.z,b.w):Me.set(b,D,V,z),pe.viewport(te.copy(Me).multiplyScalar(pi()).round())},this.getScissor=function(b){return b.copy(je)},this.setScissor=function(b,D,V,z){b.isVector4?je.set(b.x,b.y,b.z,b.w):je.set(b,D,V,z),pe.scissor(be.copy(je).multiplyScalar(pi()).round())},this.getScissorTest=function(){return at},this.setScissorTest=function(b){pe.setScissorTest(at=b)},this.setOpaqueSort=function(b){ye=b},this.setTransparentSort=function(b){Ie=b},this.getClearColor=function(b){return b.copy(R.getClearColor())},this.setClearColor=function(){R.setClearColor(...arguments)},this.getClearAlpha=function(){return R.getClearAlpha()},this.setClearAlpha=function(){R.setClearAlpha(...arguments)},this.clear=function(b=!0,D=!0,V=!0){let z=0;if(b){let k=!1;if(ie!==null){const ue=ie.texture.format;k=g.has(ue)}if(k){const ue=ie.texture.type,we=m.has(ue),de=R.getClearColor(),_e=R.getClearAlpha(),Re=de.r,qe=de.g,tt=de.b;we?(_[0]=Re,_[1]=qe,_[2]=tt,_[3]=_e,U.clearBufferuiv(U.COLOR,0,_)):(M[0]=Re,M[1]=qe,M[2]=tt,M[3]=_e,U.clearBufferiv(U.COLOR,0,M))}else z|=U.COLOR_BUFFER_BIT}D&&(z|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),V&&(z|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z!==0&&U.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(b){b.setRenderer(this),F=b},this.dispose=function(){t.removeEventListener("webglcontextlost",ze,!1),t.removeEventListener("webglcontextrestored",Xe,!1),t.removeEventListener("webglcontextcreationerror",ge,!1),R.dispose(),he.dispose(),Y.dispose(),Ve.dispose(),ke.dispose(),T.dispose(),ne.dispose(),O.dispose(),oe.dispose(),Ne.dispose(),ee.dispose(),se.dispose(),se.removeEventListener("sessionstart",ul),se.removeEventListener("sessionend",fl),yn.stop()};function ze(b){b.preventDefault(),Ya("WebGLRenderer: Context Lost."),N=!0}function Xe(){Ya("WebGLRenderer: Context Restored."),N=!1;const b=Dt.autoReset,D=le.enabled,V=le.autoUpdate,z=le.needsUpdate,k=le.type;Ye(),Dt.autoReset=b,le.enabled=D,le.autoUpdate=V,le.needsUpdate=z,le.type=k}function ge(b){ot("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function ct(b){const D=b.target;D.removeEventListener("dispose",ct),Ot(D)}function Ot(b){nn(b),ke.remove(b)}function nn(b){const D=ke.get(b).programs;D!==void 0&&(D.forEach(function(V){ee.releaseProgram(V)}),b.isShaderMaterial&&ee.releaseShaderCache(b))}this.renderBufferDirect=function(b,D,V,z,k,ue){D===null&&(D=ui);const we=k.isMesh&&k.matrixWorld.determinantAffine()<0,de=eh(b,D,V,z,k);pe.setMaterial(z,we);let _e=V.index,Re=1;if(z.wireframe===!0){if(_e=O.getWireframeAttribute(V),_e===void 0)return;Re=2}const qe=V.drawRange,tt=V.attributes.position;let Ee=qe.start*Re,it=(qe.start+qe.count)*Re;ue!==null&&(Ee=Math.max(Ee,ue.start*Re),it=Math.min(it,(ue.start+ue.count)*Re)),_e!==null?(Ee=Math.max(Ee,0),it=Math.min(it,_e.count)):tt!=null&&(Ee=Math.max(Ee,0),it=Math.min(it,tt.count));const Rt=it-Ee;if(Rt<0||Rt===1/0)return;oe.setup(k,z,de,V,_e);let gt,mt=X;if(_e!==null&&(gt=S.get(_e),mt=ce,mt.setIndex(gt)),k.isMesh)z.wireframe===!0?(pe.setLineWidth(z.wireframeLinewidth*pi()),mt.setMode(U.LINES)):mt.setMode(U.TRIANGLES);else if(k.isLine){let Wt=z.linewidth;Wt===void 0&&(Wt=1),pe.setLineWidth(Wt*pi()),k.isLineSegments?mt.setMode(U.LINES):k.isLineLoop?mt.setMode(U.LINE_LOOP):mt.setMode(U.LINE_STRIP)}else k.isPoints?mt.setMode(U.POINTS):k.isSprite&&mt.setMode(U.TRIANGLES);if(k.isBatchedMesh)if(_t.get("WEBGL_multi_draw"))mt.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{const Wt=k._multiDrawStarts,Ae=k._multiDrawCounts,jt=k._multiDrawCount,lt=_e?S.get(_e).bytesPerElement:1,Mn=ke.get(z).currentProgram.getUniforms();for(let qt=0;qt<jt;qt++)Mn.setValue(U,"_gl_DrawID",qt),mt.render(Wt[qt]/lt,Ae[qt])}else if(k.isInstancedMesh)mt.renderInstances(Ee,Rt,k.count);else if(V.isInstancedBufferGeometry){const Wt=V._maxInstanceCount!==void 0?V._maxInstanceCount:1/0,Ae=Math.min(V.instanceCount,Wt);mt.renderInstances(Ee,Rt,Ae)}else mt.render(Ee,Rt)};function hl(b,D,V,z){F!==null&&b.isNodeMaterial&&F.setObject(z,b),Lt===!0&&J.setState(b,V,!1),b.transparent===!0&&b.side===pt&&b.forceSinglePass===!1?(b.side=Vt,b.needsUpdate=!0,_s(b,D,z),b.side=Dn,b.needsUpdate=!0,_s(b,D,z),b.side=pt):_s(b,D,z)}this.compile=function(b,D,V=null){V===null&&(V=b),F!==null&&F.renderStart(b,D,V),E=Y.get(V),E.init(D),w.push(E),V.traverseVisible(function(k){k.isLight&&k.layers.test(D.layers)&&(E.pushLight(k),k.castShadow&&E.pushShadow(k))}),b!==V&&b.traverseVisible(function(k){k.isLight&&k.layers.test(D.layers)&&(E.pushLight(k),k.castShadow&&E.pushShadow(k))}),E.setupLights(),F!==null&&F.updateLights(E.state.lightsArray),si=this.localClippingEnabled,Lt=J.init(this.clippingPlanes,si),Lt===!0&&J.setGlobalState(this.clippingPlanes,D),F!==null&&le.render(E.state.shadowsArray,V,D);const z=new Set;return b.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;const ue=k.material;if(ue)if(Array.isArray(ue))for(let we=0;we<ue.length;we++){const de=ue[we];hl(de,V,D,k),z.add(de)}else hl(ue,V,D,k),z.add(ue)}),E=w.pop(),F!==null&&F.renderEnd(),z},this.compileAsync=function(b,D,V=null){const z=this.compile(b,D,V);return new Promise(k=>{function ue(){if(z.forEach(function(we){const _e=ke.get(we).currentProgram;(_e===void 0||_e.isReady())&&z.delete(we)}),z.size===0){k(b);return}setTimeout(ue,10)}_t.get("KHR_parallel_shader_compile")!==null?ue():setTimeout(ue,10)})};let or=null;function Qd(b){or&&or(b)}function ul(){yn.stop()}function fl(){yn.start()}const yn=new Fd;yn.setAnimationLoop(Qd),typeof self<"u"&&yn.setContext(self),this.setAnimationLoop=function(b){or=b,se.setAnimationLoop(b),b===null?yn.stop():yn.start()},se.addEventListener("sessionstart",ul),se.addEventListener("sessionend",fl),this.render=function(b,D){if(D!==void 0&&D.isCamera!==!0){ot("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;F!==null&&F.renderStart(b,D);const V=se.enabled===!0&&se.isPresenting===!0,z=L!==null&&(ie===null||V)&&L.begin(C,ie);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),se.enabled===!0&&se.isPresenting===!0&&(L===null||L.isCompositing()===!1)&&(se.cameraAutoUpdate===!0&&se.updateCamera(D),D=se.getCamera()),b.isScene===!0&&b.onBeforeRender(C,b,D,ie),E=Y.get(b,w.length),E.init(D),E.state.textureUnits=Ve.getTextureUnits(),w.push(E),St.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),D.isArrayCamera?Ht.setFromArrayCamera(D):$e.setFromProjectionMatrix(St,Ti,D.reversedDepth),si=this.localClippingEnabled,Lt=J.init(this.clippingPlanes,si),A=he.get(b,x.length),A.init(),x.push(A),this.info.render.frame++,se.enabled===!0&&se.isPresenting===!0){const we=C.xr.getDepthSensingMesh();we!==null&&lr(we,D,-1/0,C.sortObjects)}lr(b,D,0,C.sortObjects),A.finish(),F!==null&&F.updateLights(E.state.lightsArray),C.sortObjects===!0&&A.sort(ye,Ie),fi=se.enabled===!1||se.isPresenting===!1||se.hasDepthSensing()===!1,fi&&R.addToRenderList(A,b),this.info.autoReset===!0&&this.info.reset(),Lt===!0&&J.beginShadows();const k=E.state.shadowsArray;if(le.render(k,b,D),Lt===!0&&J.endShadows(),(z&&L.hasRenderPass())===!1){const we=A.opaque,de=A.transmissive;if(E.setupLights(),D.isArrayCamera){const _e=D.cameras;if(de.length>0)for(let Re=0,qe=_e.length;Re<qe;Re++){const tt=_e[Re];ml(we,de,b,tt)}fi&&R.render(b);for(let Re=0,qe=_e.length;Re<qe;Re++){const tt=_e[Re];pl(A,b,tt,tt.viewport)}}else de.length>0&&ml(we,de,b,D),fi&&R.render(b),pl(A,b,D)}ie!==null&&B===0&&(Ve.updateMultisampleRenderTarget(ie),Ve.updateRenderTargetMipmap(ie)),z&&L.end(C),b.isScene===!0&&b.onAfterRender(C,b,D),oe.resetDefaultState(),$=-1,j=null,w.pop(),w.length>0?(E=w[w.length-1],Ve.setTextureUnits(E.state.textureUnits),Lt===!0&&J.setGlobalState(C.clippingPlanes,E.state.camera)):E=null,x.pop(),x.length>0?A=x[x.length-1]:A=null,F!==null&&F.renderEnd()};function lr(b,D,V,z){if(b.visible===!1)return;if(b.layers.test(D.layers)){if(b.isGroup)V=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(D);else if(b.isLight)E.pushLight(b),b.castShadow&&E.pushShadow(b);else if(b.isSprite){const we=D.isArrayCamera?Ht:$e;if(!b.frustumCulled||b.intersectsFrustum(we)){z&&zt.setFromMatrixPosition(b.matrixWorld).applyMatrix4(St);const de=ne.update(b),_e=b.material;_e.visible&&A.push(b,de,_e,V,zt.z,null,D)}}else if(b.isMesh||b.isLine||b.isPoints){const we=D.isArrayCamera?Ht:$e;if(!b.frustumCulled||b.intersectsFrustum(we)){const de=ne.update(b),_e=b.material;if(z&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),zt.copy(b.boundingSphere.center)):(de.boundingSphere===null&&de.computeBoundingSphere(),zt.copy(de.boundingSphere.center)),zt.applyMatrix4(b.matrixWorld).applyMatrix4(St)),Array.isArray(_e)){const Re=de.groups;for(let qe=0,tt=Re.length;qe<tt;qe++){const Ee=Re[qe],it=_e[Ee.materialIndex];it&&it.visible&&A.push(b,de,it,V,zt.z,Ee,D)}}else _e.visible&&A.push(b,de,_e,V,zt.z,null,D)}}}const ue=b.children;for(let we=0,de=ue.length;we<de;we++)lr(ue[we],D,V,z)}function pl(b,D,V,z){const{opaque:k,transmissive:ue,transparent:we}=b;E.setupLightsView(V),Lt===!0&&J.setGlobalState(C.clippingPlanes,V),z&&pe.viewport(te.copy(z)),k.length>0&&ea(k,D,V),ue.length>0&&ea(ue,D,V),we.length>0&&ea(we,D,V),pe.buffers.depth.setTest(!0),pe.buffers.depth.setMask(!0),pe.buffers.color.setMask(!0),pe.setPolygonOffset(!1)}function ml(b,D,V,z){if((V.isScene===!0?V.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[z.id]===void 0){const Ee=_t.has("EXT_color_buffer_half_float")||_t.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[z.id]=new zi(1,1,{generateMipmaps:!0,type:Ee?Hi:hi,minFilter:pn,samples:Math.max(4,yt.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:nt.workingColorSpace})}const ue=E.state.transmissionRenderTarget[z.id],we=z.viewport||te;ue.setSize(we.z*C.transmissionResolutionScale,we.w*C.transmissionResolutionScale);const de=C.getRenderTarget(),_e=C.getActiveCubeFace(),Re=C.getActiveMipmapLevel();C.setRenderTarget(ue),C.getClearColor(Z),fe=C.getClearAlpha(),fe<1&&C.setClearColor(16777215,.5),C.clear(),fi&&R.render(V);const qe=C.toneMapping;C.toneMapping=ji;const tt=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),E.setupLightsView(z),Lt===!0&&J.setGlobalState(C.clippingPlanes,z),ea(b,V,z),Ve.updateMultisampleRenderTarget(ue),Ve.updateRenderTargetMipmap(ue),_t.has("WEBGL_multisampled_render_to_texture")===!1){let Ee=!1;for(let it=0,Rt=D.length;it<Rt;it++){const gt=D[it],{object:mt,geometry:Wt,material:Ae,group:jt}=gt;if(Ae.side===pt&&mt.layers.test(z.layers)){const lt=Ae.side;Ae.side=Vt,Ae.needsUpdate=!0,gl(mt,V,z,Wt,Ae,jt),Ae.side=lt,Ae.needsUpdate=!0,Ee=!0}}Ee===!0&&(Ve.updateMultisampleRenderTarget(ue),Ve.updateRenderTargetMipmap(ue))}C.setRenderTarget(de,_e,Re),C.setClearColor(Z,fe),tt!==void 0&&(z.viewport=tt),C.toneMapping=qe}function ea(b,D,V){const z=D.isScene===!0?D.overrideMaterial:null;for(let k=0,ue=b.length;k<ue;k++){const we=b[k],{object:de,geometry:_e,group:Re}=we;let qe=we.material;qe.allowOverride===!0&&z!==null&&(qe=z),de.layers.test(V.layers)&&gl(de,D,V,_e,qe,Re)}}function gl(b,D,V,z,k,ue){F!==null&&k.isNodeMaterial&&F.setObject(b,k),b.onBeforeRender(C,D,V,z,k,ue),b.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),k.onBeforeRender(C,D,V,z,b,ue),k.transparent===!0&&k.side===pt&&k.forceSinglePass===!1?(k.side=Vt,k.needsUpdate=!0,C.renderBufferDirect(V,D,z,k,b,ue),k.side=Dn,k.needsUpdate=!0,C.renderBufferDirect(V,D,z,k,b,ue),k.side=pt):C.renderBufferDirect(V,D,z,k,b,ue),b.onAfterRender(C,D,V,z,k,ue)}function vl(b){let D=0;for(const V of b)V.texture!==null&&D++;return D}function _s(b,D,V){D.isScene!==!0&&(D=ui);const z=ke.get(b),k=E.state.lights,ue=E.state.shadowsArray,we=k.state.version,de=ee.getParameters(b,k.state,ue,D,V,E.state.lightProbeGridArray),_e=ee.getProgramCacheKey(de);let Re=z.programs;z.environment=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?D.environment:null,z.fog=D.fog;const qe=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap;z.envMap=T.get(b.envMap||z.environment,qe),z.envMapRotation=z.environment!==null&&b.envMap===null?D.environmentRotation:b.envMapRotation,Re===void 0&&(b.addEventListener("dispose",ct),Re=new Map,z.programs=Re,z.programVariants=new Map);let tt=Re.get(_e);if(tt!==void 0){if(z.currentProgram===tt&&z.lightsStateVersion===we)return _l(b,de),tt}else de.uniforms=ee.getUniforms(b),F!==null&&b.isNodeMaterial&&F.build(b,V,de),b.onBeforeCompile(de,C),tt=ee.acquireProgram(de,_e),Re.set(_e,tt),z.uniforms=de.uniforms;const Ee=z.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Ee.clippingPlanes=J.uniform),_l(b,de),z.needsLights=ih(b),z.lightsStateVersion=we,z.needsLights&&(Ee.ambientLightColor.value=k.state.ambient,Ee.lightProbe.value=k.state.probe,Ee.sunLights.value=k.state.sun,Ee.sunLightShadows.value=k.state.sunShadow,Ee.directionalLights.value=k.state.directional,Ee.directionalLightShadows.value=k.state.directionalShadow,Ee.spotLights.value=k.state.spot,Ee.spotLightShadows.value=k.state.spotShadow,Ee.rectAreaLights.value=k.state.rectArea,Ee.ltc_1.value=k.state.rectAreaLTC1,Ee.ltc_2.value=k.state.rectAreaLTC2,Ee.pointLights.value=k.state.point,Ee.pointLightShadows.value=k.state.pointShadow,Ee.hemisphereLights.value=k.state.hemi,Ee.sunShadowMatrix.value=k.state.sunShadowMatrix,Ee.sunShadowCascade.value=k.state.sunShadowCascade,Ee.directionalShadowMatrix.value=k.state.directionalShadowMatrix,Ee.spotLightMatrix.value=k.state.spotLightMatrix,Ee.spotLightMap.value=k.state.spotLightMap,Ee.pointShadowMatrix.value=k.state.pointShadowMatrix),z.numLightProbeGrids=vl(E.state.lightProbeGridArray),z.currentProgram=tt,z.uniformsList=null,tt}function jd(b,D,V,z,k){const ue=ke.get(b),we=ue.currentProgram.id+","+z+","+k;let de=ue.programVariants.get(we);return de===void 0?(de=_s(b,D,V),ue.programVariants.set(we,de)):(ue.currentProgram=de,ue.uniformsList=null,ue.outputColorSpace=z,ue.toneMapping=k),de}function xl(b){if(b.uniformsList===null){const D=b.currentProgram.getUniforms();b.uniformsList=Ha.seqWithValue(D.seq,b.uniforms)}return b.uniformsList}function _l(b,D){const V=ke.get(b);V.outputColorSpace=D.outputColorSpace,V.batching=D.batching,V.batchingColor=D.batchingColor,V.instancing=D.instancing,V.instancingColor=D.instancingColor,V.instancingMorph=D.instancingMorph,V.skinning=D.skinning,V.morphTargets=D.morphTargets,V.morphNormals=D.morphNormals,V.morphColors=D.morphColors,V.morphTargetsCount=D.morphTargetsCount,V.numClippingPlanes=D.numClippingPlanes,V.numIntersection=D.numClipIntersection,V.vertexAlphas=D.vertexAlphas,V.vertexTangents=D.vertexTangents,V.toneMapping=D.toneMapping}function eh(b,D,V,z,k){D.isScene!==!0&&(D=ui),Ve.resetTextureUnits();const ue=D.fog,we=z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial?D.environment:null,de=ie===null?C.outputColorSpace:ie.isXRRenderTarget===!0?ie.texture.colorSpace:nt.workingColorSpace,_e=z.isMeshStandardMaterial||z.isMeshLambertMaterial&&!z.envMap||z.isMeshPhongMaterial&&!z.envMap,Re=T.get(z.envMap||we,_e),qe=z.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,tt=!!V.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),Ee=!!V.morphAttributes.position,it=!!V.morphAttributes.normal,Rt=!!V.morphAttributes.color;let gt=ji;z.toneMapped&&(ie===null||ie.isXRRenderTarget===!0)&&(gt=C.toneMapping);const mt=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Wt=mt!==void 0?mt.length:0,Ae=ke.get(z),jt=E.state.lights;if(Lt===!0&&(si===!0||b!==j)){const bt=b===j&&z.id===$;J.setState(z,b,bt)}let lt=!1,Mn=!1;z.version===Ae.__version?Ae.needsLights&&Ae.lightsStateVersion!==jt.state.version||k.isBatchedMesh&&Ae.batching===!1||!k.isBatchedMesh&&Ae.batching===!0||k.isBatchedMesh&&Ae.batchingColor===!0&&k._colorsTexture===null||k.isBatchedMesh&&Ae.batchingColor===!1&&k._colorsTexture!==null||k.isInstancedMesh&&Ae.instancing===!1||!k.isInstancedMesh&&Ae.instancing===!0||k.isSkinnedMesh&&Ae.skinning===!1||!k.isSkinnedMesh&&Ae.skinning===!0||k.isInstancedMesh&&Ae.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&Ae.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&Ae.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&Ae.instancingMorph===!1&&k.morphTexture!==null||Ae.envMap!==Re||z.fog===!0&&Ae.fog!==ue||Ae.numClippingPlanes!==void 0&&(Ae.numClippingPlanes!==J.numPlanes||Ae.numIntersection!==J.numIntersection)||Ae.vertexAlphas!==qe||Ae.vertexTangents!==tt||Ae.morphTargets!==Ee||Ae.morphNormals!==it||Ae.morphColors!==Rt||Ae.morphTargetsCount!==Wt||Ae.numLightProbeGrids!==vl(E.state.lightProbeGridArray)?lt=!0:(Ae.outputColorSpace!==de||Ae.toneMapping!==gt)&&(Mn=!0):(lt=!0,Ae.__version=z.version);let qt=Ae.currentProgram;(lt===!0||Mn===!0)&&(qt=Mn===!0?jd(z,D,k,de,gt):_s(z,D,k),F&&z.isNodeMaterial&&F.onUpdateProgram(z,qt,Ae));let ta=!1,sn=!1,Sn=!1;const rt=qt.getUniforms(),Gt=Ae.uniforms;if(pe.useProgram(qt.program)&&(ta=!0,sn=!0,Sn=!0),z.id!==$&&($=z.id,sn=!0),ta||j!==b){pe.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),rt.setValue(U,"projectionMatrix",b.projectionMatrix),rt.setValue(U,"viewMatrix",b.matrixWorldInverse);const kt=rt.map.cameraPosition;kt!==void 0&&kt.setValue(U,Ri.setFromMatrixPosition(b.matrixWorld)),yt.logarithmicDepthBuffer&&rt.setValue(U,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&rt.setValue(U,"isOrthographic",b.isOrthographicCamera===!0),j!==b&&(j=b,sn=!0,Sn=!0)}if(Ae.needsLights&&(jt.state.sunShadowMap.length>0&&rt.setValue(U,"sunShadowMap",jt.state.sunShadowMap,Ve),jt.state.directionalShadowMap.length>0&&rt.setValue(U,"directionalShadowMap",jt.state.directionalShadowMap,Ve),jt.state.spotShadowMap.length>0&&rt.setValue(U,"spotShadowMap",jt.state.spotShadowMap,Ve),jt.state.pointShadowMap.length>0&&rt.setValue(U,"pointShadowMap",jt.state.pointShadowMap,Ve)),k.isSkinnedMesh){rt.setOptional(U,k,"bindMatrix"),rt.setOptional(U,k,"bindMatrixInverse");const bt=k.skeleton;bt&&(bt.boneTexture===null&&bt.computeBoneTexture(),rt.setValue(U,"boneTexture",bt.boneTexture,Ve))}k.isBatchedMesh&&(rt.setOptional(U,k,"batchingTexture"),rt.setValue(U,"batchingTexture",k._matricesTexture,Ve),rt.setOptional(U,k,"batchingIdTexture"),rt.setValue(U,"batchingIdTexture",k._indirectTexture,Ve),rt.setOptional(U,k,"batchingColorTexture"),k._colorsTexture!==null&&rt.setValue(U,"batchingColorTexture",k._colorsTexture,Ve));const Si=V.morphAttributes;if((Si.position!==void 0||Si.normal!==void 0||Si.color!==void 0)&&Q.update(k,V,qt),(sn||Ae.receiveShadow!==k.receiveShadow)&&(Ae.receiveShadow=k.receiveShadow,rt.setValue(U,"receiveShadow",k.receiveShadow)),(z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial)&&z.envMap===null&&D.environment!==null&&(Gt.envMapIntensity.value=D.environmentIntensity),Gt.dfgLUT!==void 0&&(Gt.dfgLUT.value=Wg()),sn){if(rt.setValue(U,"toneMappingExposure",C.toneMappingExposure),Ae.needsLights&&th(Gt,Sn),ue&&z.fog===!0&&re.refreshFogUniforms(Gt,ue),re.refreshMaterialUniforms(Gt,z,me,Oe,E.state.transmissionRenderTarget[b.id]),Ae.needsLights&&Ae.numLightProbeGrids>0){const bt=y;let kt=0;for(const qi of E.state.lightProbeGridArray)qi.texture!==null&&(bt.textures[kt]=qi.texture,bt.min[kt]=qi.boundingBox.min,bt.max[kt]=qi.boundingBox.max,bt.resolution[kt]=qi.resolution,kt++);for(const qi in bt)bt[qi].length=kt;Gt.probesSH.value=bt.textures,Gt.probesMin.value=bt.min,Gt.probesMax.value=bt.max,Gt.probesResolution.value=bt.resolution}Ha.upload(U,xl(Ae),Gt,Ve)}if(z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(Ha.upload(U,xl(Ae),Gt,Ve),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&rt.setValue(U,"center",k.center),rt.setValue(U,"modelViewMatrix",k.modelViewMatrix),rt.setValue(U,"normalMatrix",k.normalMatrix),rt.setValue(U,"modelMatrix",k.matrixWorld),z.uniformsGroups!==void 0){const bt=z.uniformsGroups;for(let kt=0,qi=bt.length;kt<qi;kt++){const Ml=bt[kt];Ne.update(Ml,qt),Ne.bind(Ml,qt)}}return qt}function th(b,D){b.ambientLightColor.needsUpdate=D,b.lightProbe.needsUpdate=D,b.sunLights.needsUpdate=D,b.sunLightShadows.needsUpdate=D,b.directionalLights.needsUpdate=D,b.directionalLightShadows.needsUpdate=D,b.pointLights.needsUpdate=D,b.pointLightShadows.needsUpdate=D,b.spotLights.needsUpdate=D,b.spotLightShadows.needsUpdate=D,b.rectAreaLights.needsUpdate=D,b.hemisphereLights.needsUpdate=D}function ih(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return K},this.getActiveMipmapLevel=function(){return B},this.getRenderTarget=function(){return ie},this.setRenderTargetTextures=function(b,D,V){const z=ke.get(b);z.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),ke.get(b.texture).__webglTexture=D,ke.get(b.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:V,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,D){const V=ke.get(b);V.__webglFramebuffer=D,V.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(b,D=0,V=0){ie=b,K=D,B=V;let z=null,k=!1,ue=!1;if(b){const de=ke.get(b);if(de.__useDefaultFramebuffer!==void 0){pe.bindFramebuffer(U.FRAMEBUFFER,de.__webglFramebuffer),te.copy(b.viewport),be.copy(b.scissor),Be=b.scissorTest,pe.viewport(te),pe.scissor(be),pe.setScissorTest(Be),$=-1;return}else if(de.__webglFramebuffer===void 0)Ve.setupRenderTarget(b);else if(de.__hasExternalTextures)Ve.rebindTextures(b,ke.get(b.texture).__webglTexture,ke.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const qe=b.depthTexture;if(de.__boundDepthTexture!==qe){if(qe!==null&&ke.has(qe)&&(b.width!==qe.image.width||b.height!==qe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Ve.setupDepthRenderbuffer(b)}}const _e=b.texture;(_e.isData3DTexture||_e.isDataArrayTexture||_e.isCompressedArrayTexture)&&(ue=!0);const Re=ke.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Re[D])?z=Re[D][V]:z=Re[D],k=!0):b.samples>0&&Ve.useMultisampledRTT(b)===!1?z=ke.get(b).__webglMultisampledFramebuffer:Array.isArray(Re)?z=Re[V]:z=Re,te.copy(b.viewport),be.copy(b.scissor),Be=b.scissorTest}else te.copy(Me).multiplyScalar(me).floor(),be.copy(je).multiplyScalar(me).floor(),Be=at;if(V!==0&&(z=W),pe.bindFramebuffer(U.FRAMEBUFFER,z)&&pe.drawBuffers(b,z),pe.viewport(te),pe.scissor(be),pe.setScissorTest(Be),k){const de=ke.get(b.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+D,de.__webglTexture,V)}else if(ue){const de=D;for(let _e=0;_e<b.textures.length;_e++){const Re=ke.get(b.textures[_e]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+_e,Re.__webglTexture,V,de)}}else if(b!==null&&V!==0){const de=ke.get(b.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,de.__webglTexture,V)}$=-1};function yl(b){const D=ke.get(b);return(D.__readFormat!==b.format||D.__readType!==b.type)&&(D.__readFormat=b.format,D.__readType=b.type,D.__formatReadable=yt.textureFormatReadable(b.format),D.__typeReadable=yt.textureTypeReadable(b.type)),D}this.readRenderTargetPixels=function(b,D,V,z,k,ue,we,de=0){if(!(b&&b.isWebGLRenderTarget)){ot("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let _e=ke.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&we!==void 0&&(_e=_e[we],Array.isArray(_e)&&(_e=_e[0])),_e){pe.bindFramebuffer(U.FRAMEBUFFER,_e);try{const Re=b.textures[de],qe=Re.format,tt=Re.type;b.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+de);const Ee=yl(Re);if(Ee.__formatReadable===!1){ot("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ee.__typeReadable===!1){ot("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=b.width-z&&V>=0&&V<=b.height-k&&U.readPixels(D,V,z,k,ae.convert(qe),ae.convert(tt),ue)}finally{const Re=ie!==null?ke.get(ie).__webglFramebuffer:null;pe.bindFramebuffer(U.FRAMEBUFFER,Re)}}},this.readRenderTargetPixelsAsync=async function(b,D,V,z,k,ue,we,de=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let _e=ke.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&we!==void 0&&(_e=_e[we],Array.isArray(_e)&&(_e=_e[0])),_e)if(D>=0&&D<=b.width-z&&V>=0&&V<=b.height-k){pe.bindFramebuffer(U.FRAMEBUFFER,_e);const Re=b.textures[de],qe=Re.format,tt=Re.type;b.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+de);const Ee=yl(Re);if(Ee.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ee.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const it=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,it),U.bufferData(U.PIXEL_PACK_BUFFER,ue.byteLength,U.STREAM_READ),U.readPixels(D,V,z,k,ae.convert(qe),ae.convert(tt),0),U.bindBuffer(U.PIXEL_PACK_BUFFER,null);const Rt=ie!==null?ke.get(ie).__webglFramebuffer:null;pe.bindFramebuffer(U.FRAMEBUFFER,Rt);const gt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Fh(U,gt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,it),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,ue),U.bindBuffer(U.PIXEL_PACK_BUFFER,null),U.deleteBuffer(it),U.deleteSync(gt),ue}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,D=null,V=0){const z=Math.pow(2,-V),k=Math.floor(b.image.width*z),ue=Math.floor(b.image.height*z),we=D!==null?D.x:0,de=D!==null?D.y:0;Ve.setTexture2D(b,0),U.copyTexSubImage2D(U.TEXTURE_2D,V,0,0,we,de,k,ue),pe.unbindTexture()},this.copyTextureToTexture=function(b,D,V=null,z=null,k=0,ue=0){let we,de,_e,Re,qe,tt,Ee,it,Rt;const gt=b.isCompressedTexture?b.mipmaps[ue]:b.image;if(V!==null)we=V.max.x-V.min.x,de=V.max.y-V.min.y,_e=V.isBox3?V.max.z-V.min.z:1,Re=V.min.x,qe=V.min.y,tt=V.isBox3?V.min.z:0;else{const rt=Math.pow(2,-k);we=Math.floor(gt.width*rt),de=Math.floor(gt.height*rt),b.isDataArrayTexture?_e=gt.depth:b.isData3DTexture?_e=Math.floor(gt.depth*rt):_e=1,Re=0,qe=0,tt=0}z!==null?(Ee=z.x,it=z.y,Rt=z.z):(Ee=0,it=0,Rt=0);const mt=ae.convert(D.format),Wt=ae.convert(D.type);let Ae;D.isData3DTexture?(Ve.setTexture3D(D,0),Ae=U.TEXTURE_3D):D.isDataArrayTexture||D.isCompressedArrayTexture?(Ve.setTexture2DArray(D,0),Ae=U.TEXTURE_2D_ARRAY):(Ve.setTexture2D(D,0),Ae=U.TEXTURE_2D),pe.activeTexture(U.TEXTURE0),pe.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,D.flipY),pe.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),pe.pixelStorei(U.UNPACK_ALIGNMENT,D.unpackAlignment);const jt=pe.getParameter(U.UNPACK_ROW_LENGTH),lt=pe.getParameter(U.UNPACK_IMAGE_HEIGHT),Mn=pe.getParameter(U.UNPACK_SKIP_PIXELS),qt=pe.getParameter(U.UNPACK_SKIP_ROWS),ta=pe.getParameter(U.UNPACK_SKIP_IMAGES);pe.pixelStorei(U.UNPACK_ROW_LENGTH,gt.width),pe.pixelStorei(U.UNPACK_IMAGE_HEIGHT,gt.height),pe.pixelStorei(U.UNPACK_SKIP_PIXELS,Re),pe.pixelStorei(U.UNPACK_SKIP_ROWS,qe),pe.pixelStorei(U.UNPACK_SKIP_IMAGES,tt);const sn=b.isDataArrayTexture||b.isData3DTexture,Sn=D.isDataArrayTexture||D.isData3DTexture;if(b.isDepthTexture){const rt=ke.get(b),Gt=ke.get(D),Si=ke.get(rt.__renderTarget),bt=ke.get(Gt.__renderTarget);pe.bindFramebuffer(U.READ_FRAMEBUFFER,Si.__webglFramebuffer),pe.bindFramebuffer(U.DRAW_FRAMEBUFFER,bt.__webglFramebuffer);for(let kt=0;kt<_e;kt++)sn&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,ke.get(b).__webglTexture,k,tt+kt),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,ke.get(D).__webglTexture,ue,Rt+kt)),U.blitFramebuffer(Re,qe,Re+we,qe+de,Ee,it,Ee+we,it+de,U.DEPTH_BUFFER_BIT,U.NEAREST);pe.bindFramebuffer(U.READ_FRAMEBUFFER,null),pe.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(k!==0||b.isRenderTargetTexture||ke.has(b)){const rt=ke.get(b),Gt=ke.get(D);pe.bindFramebuffer(U.READ_FRAMEBUFFER,P),pe.bindFramebuffer(U.DRAW_FRAMEBUFFER,G);for(let Si=0;Si<_e;Si++)sn?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,rt.__webglTexture,k,tt+Si):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,rt.__webglTexture,k),Sn?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Gt.__webglTexture,ue,Rt+Si):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Gt.__webglTexture,ue),k!==0?U.blitFramebuffer(Re,qe,Re+we,qe+de,Ee,it,Ee+we,it+de,U.COLOR_BUFFER_BIT,U.NEAREST):Sn?U.copyTexSubImage3D(Ae,ue,Ee,it,Rt+Si,Re,qe,we,de):U.copyTexSubImage2D(Ae,ue,Ee,it,Re,qe,we,de);pe.bindFramebuffer(U.READ_FRAMEBUFFER,null),pe.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else Sn?b.isDataTexture||b.isData3DTexture?U.texSubImage3D(Ae,ue,Ee,it,Rt,we,de,_e,mt,Wt,gt.data):D.isCompressedArrayTexture?U.compressedTexSubImage3D(Ae,ue,Ee,it,Rt,we,de,_e,mt,gt.data):U.texSubImage3D(Ae,ue,Ee,it,Rt,we,de,_e,mt,Wt,gt):b.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,ue,Ee,it,we,de,mt,Wt,gt.data):b.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,ue,Ee,it,gt.width,gt.height,mt,gt.data):U.texSubImage2D(U.TEXTURE_2D,ue,Ee,it,we,de,mt,Wt,gt);pe.pixelStorei(U.UNPACK_ROW_LENGTH,jt),pe.pixelStorei(U.UNPACK_IMAGE_HEIGHT,lt),pe.pixelStorei(U.UNPACK_SKIP_PIXELS,Mn),pe.pixelStorei(U.UNPACK_SKIP_ROWS,qt),pe.pixelStorei(U.UNPACK_SKIP_IMAGES,ta),ue===0&&D.generateMipmaps===!0&&D.mipmapsAutoUpdate===!0&&U.generateMipmap(Ae),pe.unbindTexture()},this.initRenderTarget=function(b){ke.get(b).__webglFramebuffer===void 0&&Ve.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?Ve.setTextureCube(b,0):b.isData3DTexture?Ve.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?Ve.setTexture2DArray(b,0):Ve.setTexture2D(b,0),pe.unbindTexture()},this.resetState=function(){K=0,B=0,ie=null,pe.reset(),oe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ti}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=nt._getDrawingBufferColorSpace(e),t.unpackColorSpace=nt._getUnpackColorSpace()}}const Di=a=>440*Math.pow(2,(a-69)/12),Lc={title:{bpm:62,root:50,chords:[[0,4,7,11],[-3,2,5,9],[-5,0,4,7],[-1,4,7,11]],arp:[0,7,4,11,7,14,11,4],lead:[14,16,19,21,19,16,14,11],pad:"sine",leadWave:"triangle",drums:!1,brightness:.3},valdoria:{bpm:76,root:50,chords:[[0,4,7,11],[-3,2,5,9],[-5,0,4,7],[-1,4,7,11]],arp:[0,4,7,11,7,4,2,7],lead:[7,9,11,14,12,11,9,7],pad:"sine",leadWave:"triangle",drums:!1,brightness:.4},drakmor:{bpm:88,root:38,chords:[[0,3,7,10],[-2,1,5,8],[-4,0,3,7],[-2,1,5,8]],arp:[0,7,3,10,7,3,0,3],lead:[12,10,7,10,15,12,10,7],pad:"sawtooth",leadWave:"sawtooth",drums:!0,brightness:.28},kansordore:{bpm:68,root:52,chords:[[0,4,7,11],[2,6,9,13],[-3,2,5,9],[-1,4,7,11]],arp:[0,7,11,14,11,7,4,11],lead:[19,21,23,26,23,21,19,16],pad:"sine",leadWave:"sine",drums:!1,brightness:.55},boss:{bpm:112,root:38,chords:[[0,3,7,10],[-1,2,6,9],[-4,0,3,7],[-2,1,5,8]],arp:[0,7,3,10,12,10,7,3],lead:[15,14,12,10,7,10,12,14],pad:"sawtooth",leadWave:"square",drums:!0,brightness:.22}};class $g{constructor(){this.ctx=null,this.started=!1,this.musicVolume=.55,this.sfxVolume=.8,this.theme="title",this.boss=!1,this.step=0,this.nextNoteTime=0,this.lastUpdate=0,this.noiseBuffer=null,this.muted=!1}async start(){if(this.started){this.ctx.state==="suspended"&&await this.ctx.resume();return}const e=window.AudioContext||window.webkitAudioContext;if(!e)return;this.ctx=new e,this.started=!0,this.master=this.ctx.createGain(),this.master.gain.value=this.muted?0:1;const t=this.ctx.createDynamicsCompressor();t.threshold.value=-18,t.knee.value=22,t.ratio.value=4,t.attack.value=.01,t.release.value=.25,this.master.connect(t),t.connect(this.ctx.destination),this.musicBus=this.ctx.createGain(),this.musicBus.gain.value=this.musicVolume*.32,this.musicBus.connect(this.master),this.sfxBus=this.ctx.createGain(),this.sfxBus.gain.value=this.sfxVolume*.75,this.sfxBus.connect(this.master),this.reverb=this.ctx.createConvolver(),this.reverb.buffer=this.makeImpulse(3.4,2.2),this.reverbGain=this.ctx.createGain(),this.reverbGain.gain.value=.28,this.reverb.connect(this.reverbGain),this.reverbGain.connect(this.master),this.noiseBuffer=this.makeNoise(1.2),this.nextNoteTime=this.ctx.currentTime+.1,this.lastUpdate=this.ctx.currentTime}makeNoise(e){const t=Math.floor(this.ctx.sampleRate*e),i=this.ctx.createBuffer(1,t,this.ctx.sampleRate),n=i.getChannelData(0);for(let s=0;s<t;s++)n[s]=Math.random()*2-1;return i}makeImpulse(e,t){const i=this.ctx.sampleRate,n=Math.floor(i*e),s=this.ctx.createBuffer(2,n,i);for(let r=0;r<2;r++){const o=s.getChannelData(r);for(let c=0;c<n;c++){const l=c/n;o[c]=(Math.random()*2-1)*Math.pow(1-l,t)*(1-Math.exp(-c/(i*.02)))}}return s}setMuted(e){this.muted=e,this.master&&this.master.gain.setTargetAtTime(e?0:1,this.ctx.currentTime,.05)}setMusicVolume(e){this.musicVolume=e,this.musicBus&&this.musicBus.gain.setTargetAtTime(e*.32,this.ctx.currentTime,.1)}setSfxVolume(e){this.sfxVolume=e,this.sfxBus&&this.sfxBus.gain.setTargetAtTime(e*.75,this.ctx.currentTime,.1)}setTheme(e,t=!1){this.theme===e&&this.boss===t||(this.theme=e,this.boss=t,this.step=0,this.nextNoteTime=this.ctx?this.ctx.currentTime+.05:0)}update(){if(!this.ctx||!this.started)return;const e=this.ctx.currentTime,t=Lc[this.boss?"boss":this.theme]||Lc.valdoria,i=60/t.bpm;for(;this.nextNoteTime<e+.35;)this.scheduleStep(t,this.step,this.nextNoteTime,i),this.nextNoteTime+=i/2,this.step++}scheduleStep(e,t,i,n){const s=Math.floor(t/8)%e.chords.length,r=e.chords[s],o=e.root;if(t%8===0)for(const h of r)this.note(Di(o+h),i,n*3.8,.055,e.pad,.55,.9),this.note(Di(o+h+12),i,n*3.8,.018,e.pad,.7,1.1);const l=e.arp[t%e.arp.length],d=t%16<8?12:24;if((t%2===0||e.brightness>.5)&&this.note(Di(o+l+d),i,n*.42,.028+e.brightness*.02,"triangle",.7,.18,!0),t%4===0){const h=e.lead[Math.floor(t/4)%e.lead.length];this.note(Di(o+h+12),i,n*1.7,.045,e.leadWave,.45,.55,!0)}e.drums&&(t%4===0&&this.kick(i,.18),t%4===2&&this.snare(i,.06),t%2===1&&this.hat(i,.018)),e.brightness>.45&&t%8===4&&this.note(Di(o+31),i,n*2.2,.012,"sine",.2,1.2,!0)}note(e,t,i,n,s="sine",r=.02,o=.4,c=!1){if(!this.ctx)return;const l=this.ctx.createOscillator(),d=this.ctx.createGain(),h=this.ctx.createBiquadFilter();if(h.type="lowpass",h.frequency.value=900+this.musicVolume*1200,l.type=s,l.frequency.setValueAtTime(e,t),d.gain.setValueAtTime(1e-4,t),d.gain.exponentialRampToValueAtTime(Math.max(2e-4,n),t+r),d.gain.exponentialRampToValueAtTime(1e-4,t+i),l.connect(h),h.connect(d),d.connect(this.musicBus),c){const u=this.ctx.createGain();u.gain.value=.35,d.connect(u),u.connect(this.reverb)}l.start(t),l.stop(t+i+.05)}kick(e,t=.2){if(!this.ctx)return;const i=this.ctx.createOscillator(),n=this.ctx.createGain();i.type="sine",i.frequency.setValueAtTime(110,e),i.frequency.exponentialRampToValueAtTime(38,e+.18),n.gain.setValueAtTime(t,e),n.gain.exponentialRampToValueAtTime(1e-4,e+.28),i.connect(n),n.connect(this.musicBus),i.start(e),i.stop(e+.3)}snare(e,t=.08){if(!this.ctx)return;const i=this.ctx.createBufferSource();i.buffer=this.noiseBuffer;const n=this.ctx.createGain(),s=this.ctx.createBiquadFilter();s.type="bandpass",s.frequency.value=1800,s.Q.value=.7,n.gain.setValueAtTime(t,e),n.gain.exponentialRampToValueAtTime(1e-4,e+.16),i.connect(s),s.connect(n),n.connect(this.musicBus),i.start(e),i.stop(e+.2)}hat(e,t=.02){if(!this.ctx)return;const i=this.ctx.createBufferSource();i.buffer=this.noiseBuffer;const n=this.ctx.createGain(),s=this.ctx.createBiquadFilter();s.type="highpass",s.frequency.value=7e3,n.gain.setValueAtTime(t,e),n.gain.exponentialRampToValueAtTime(1e-4,e+.04),i.connect(s),s.connect(n),n.connect(this.musicBus),i.start(e),i.stop(e+.05)}tone(e,t,i={}){if(!this.ctx)return;const{type:n="sine",gain:s=.12,slide:r=0,delay:o=0,filter:c=0,reverb:l=.1}=i,d=this.ctx.currentTime+o,h=this.ctx.createOscillator(),u=this.ctx.createGain();h.type=n,h.frequency.setValueAtTime(e,d),r&&h.frequency.exponentialRampToValueAtTime(Math.max(20,e+r),d+t),u.gain.setValueAtTime(1e-4,d),u.gain.exponentialRampToValueAtTime(s,d+.008),u.gain.exponentialRampToValueAtTime(1e-4,d+t);let f=h;if(c){const p=this.ctx.createBiquadFilter();p.type="lowpass",p.frequency.value=c,f.connect(p),f=p}if(f.connect(u),u.connect(this.sfxBus),l){const p=this.ctx.createGain();p.gain.value=l,u.connect(p),p.connect(this.reverb)}h.start(d),h.stop(d+t+.02)}noise(e,t={}){if(!this.ctx)return;const{gain:i=.12,freq:n=1800,type:s="bandpass",delay:r=0,q:o=1,sweep:c=0}=t,l=this.ctx.currentTime+r,d=this.ctx.createBufferSource();d.buffer=this.noiseBuffer;const h=this.ctx.createBiquadFilter();h.type=s,h.frequency.setValueAtTime(n,l),c&&h.frequency.exponentialRampToValueAtTime(Math.max(60,n+c),l+e),h.Q.value=o;const u=this.ctx.createGain();u.gain.setValueAtTime(i,l),u.gain.exponentialRampToValueAtTime(1e-4,l+e),d.connect(h),h.connect(u),u.connect(this.sfxBus),d.start(l),d.stop(l+e+.02)}play(e,t={}){if(!this.ctx||this.muted)return;const i=t.pitch||1;switch(e){case"ui":this.tone(520*i,.06,{type:"sine",gain:.06,reverb:.1}),this.tone(780*i,.09,{type:"sine",gain:.04,delay:.03,reverb:.1});break;case"swing":this.noise(.18,{gain:.11,freq:2400,sweep:-1700,q:1.2}),this.tone(180*i,.12,{type:"triangle",gain:.035,slide:-60});break;case"heavy":this.noise(.35,{gain:.16,freq:1500,sweep:-1100,q:.8}),this.tone(95*i,.35,{type:"sine",gain:.16,slide:-40});break;case"hit":this.noise(.12,{gain:.12,freq:500,type:"lowpass"}),this.tone(110*i,.16,{type:"triangle",gain:.12,slide:-45});break;case"crit":this.noise(.16,{gain:.18,freq:2600,q:.8}),this.tone(880*i,.18,{type:"square",gain:.06,slide:220,reverb:.3});break;case"parry":this.tone(1320*i,.3,{type:"triangle",gain:.12,slide:300,reverb:.5}),this.tone(1980*i,.22,{type:"sine",gain:.07,slide:420,reverb:.5}),this.noise(.15,{gain:.1,freq:5e3,type:"highpass"});break;case"block":this.noise(.14,{gain:.1,freq:300,type:"lowpass"}),this.tone(160*i,.12,{type:"triangle",gain:.09});break;case"dodge":this.noise(.22,{gain:.09,freq:700,sweep:900,type:"bandpass"});break;case"spell":this.tone(220*i,.6,{type:"sine",gain:.1,slide:620,reverb:.5}),this.tone(330*i,.7,{type:"triangle",gain:.07,slide:880,reverb:.6}),this.noise(.5,{gain:.05,freq:1200,sweep:4e3});break;case"ultimate":this.tone(110*i,1.2,{type:"sawtooth",gain:.12,slide:440,filter:1200,reverb:.7}),this.tone(220*i,1,{type:"sine",gain:.1,slide:880,reverb:.7}),this.noise(1,{gain:.12,freq:400,sweep:6e3});break;case"capture":[0,4,7,12].forEach((n,s)=>this.tone(Di(72+n)*i,.5,{type:"sine",gain:.06,delay:s*.09,reverb:.5})),this.noise(.6,{gain:.05,freq:3e3,sweep:2e3});break;case"quest":[0,7,12].forEach((n,s)=>this.tone(Di(60+n)*i,.7,{type:"triangle",gain:.07,delay:s*.12,reverb:.4}));break;case"levelup":[0,4,7,12,16].forEach((n,s)=>this.tone(Di(60+n)*i,.6,{type:"sine",gain:.07,delay:s*.08,reverb:.4}));break;case"chest":[0,5,9,12].forEach((n,s)=>this.tone(Di(64+n)*i,.5,{type:"triangle",gain:.06,delay:s*.07,reverb:.3}));break;case"potion":this.tone(420*i,.3,{type:"sine",gain:.06,slide:260}),this.tone(620*i,.4,{type:"sine",gain:.04,delay:.08,slide:200});break;case"error":this.tone(140*i,.22,{type:"square",gain:.05,slide:-40});break;case"death":this.tone(180*i,1.2,{type:"sawtooth",gain:.08,slide:-120,filter:600,reverb:.6});break;case"victory":[0,4,7,12,7,12,16].forEach((n,s)=>this.tone(Di(55+n)*i,1.2,{type:"triangle",gain:.07,delay:s*.15,reverb:.5}));break;case"footstep":this.noise(.08,{gain:.025,freq:220,type:"lowpass"});break;case"seal":this.tone(180*i,.8,{type:"sine",gain:.1,slide:540,reverb:.6});break}}}const Xd="laEspadaCelestial.save.v1",Dc="laEspadaCelestial.settings.v1",Mt={valdoria:{id:"valdoria",name:"VALDORIA",epithet:"El corazón verde de Aetheria",level:"Nivel 1 – 4",description:"Aldeas de piedra clara, praderas infinitas y ruinas que recuerdan un juramento anterior al tiempo.",spawn:{x:0,z:12},bounds:92,palette:{skyTop:"#18375e",skyBottom:"#f3b877",fog:"#a9c3ba",fogNear:70,fogFar:190,sun:"#ffd7a1",sunPos:[48,64,26],hemiSky:"#b9dcff",hemiGround:"#5c6b45",hemiIntensity:1.45,sunIntensity:2.55,water:"#4ba8b8",low:"#5f7d4d",mid:"#78915b",high:"#a9b47a",path:"#b8a278",accent:"#f4d58d",accent2:"#7ee8fa",fogDensity:.006}},drakmor:{id:"drakmor",name:"DRAKMOR",epithet:"Donde la primera brasa aún respira",level:"Nivel 5 – 8",description:"Ríos de magma, fortalezas quebradas y un cielo que nunca termina de arder.",spawn:{x:-58,z:48},bounds:92,palette:{skyTop:"#170d1c",skyBottom:"#7d2924",fog:"#542b2b",fogNear:55,fogFar:170,sun:"#ff8a4a",sunPos:[-40,50,34],hemiSky:"#b34b4b",hemiGround:"#24141a",hemiIntensity:1.15,sunIntensity:2.1,water:"#ff5b2e",low:"#2e2527",mid:"#493438",high:"#6f4a42",path:"#77605a",accent:"#ff8a4a",accent2:"#ffd166",fogDensity:.011}},kansordore:{id:"kansordore",name:"KANSORDORE",epithet:"El archivo de los cielos",level:"Nivel 9 – 12",description:"Templos suspendidos entre estrellas, bibliotecas prohibidas y la memoria de todo lo que fue.",spawn:{x:-56,z:48},bounds:92,palette:{skyTop:"#070b25",skyBottom:"#49448a",fog:"#7e8bbd",fogNear:70,fogFar:210,sun:"#c8e7ff",sunPos:[20,70,-40],hemiSky:"#b9ccff",hemiGround:"#292c52",hemiIntensity:1.3,sunIntensity:2.4,water:"#9bdcff",low:"#8b8bb0",mid:"#b8b4cf",high:"#e7e1ec",path:"#d6c7a7",accent:"#9ef0ff",accent2:"#ffd9f0",fogDensity:.007}}},ii={skin:[{id:"marfil",name:"Marfil",color:"#f4d2b4"},{id:"miel",name:"Miel",color:"#e2b184"},{id:"canela",name:"Canela",color:"#c58a5e"},{id:"ambar",name:"Ámbar",color:"#9c6440"},{id:"caoba",name:"Caoba",color:"#6e432d"},{id:"obsidiana",name:"Obsidiana",color:"#4a2e24"}],hairColors:[{id:"noche",name:"Noche",color:"#241d2e"},{id:"castaño",name:"Castaño",color:"#5b3522"},{id:"cobre",name:"Cobre",color:"#a95c2c"},{id:"trigo",name:"Trigo",color:"#d9b36d"},{id:"plata",name:"Plata",color:"#dbe7ee"},{id:"cereza",name:"Cereza",color:"#b33f5a"},{id:"astro",name:"Astro",color:"#7a62dc"}],outfitColors:[{id:"abismo",name:"Azul abismo",color:"#2e5877"},{id:"violeta",name:"Violeta",color:"#5c3a74"},{id:"brasa",name:"Brasa",color:"#7c3038"},{id:"bosque",name:"Bosque",color:"#2f6a57"},{id:"ocre",name:"Ocre",color:"#8a5a2c"},{id:"acero",name:"Acero",color:"#3f475c"}],accents:[{id:"oro",name:"Oro celestial",color:"#f4d58d"},{id:"aurora",name:"Aurora",color:"#7ee8fa"},{id:"rosa",name:"Rosa astral",color:"#ff8fb1"},{id:"verde",name:"Verdor",color:"#b8f59e"},{id:"ambar",name:"Ámbar",color:"#ffb45c"}],hairStyles:[{id:"corto",name:"Corto"},{id:"largo",name:"Largo"},{id:"trenza",name:"Trenza"},{id:"rapado",name:"Rapado"}],headgear:[{id:"ninguno",name:"Sin casco"},{id:"diadema",name:"Diadema"},{id:"celada",name:"Celada"}],weapons:["filo_aurora","mandoble_alba","hoja_brisa"]},Tn=[{id:"filo",name:"Hijo del Alba",tagline:"Nacido para empuñar la luz.",desc:"+2 Fuerza, +1 Vitalidad. Empiezas con el Filo de Aurora.",bonuses:{fuerza:2,vitalidad:1},weapon:"filo_aurora",icon:"sword"},{id:"velo",name:"Errante del Velo",tagline:"El viento conoce tu nombre.",desc:"+2 Velocidad, +1 Suerte. Empiezas con la Hoja de Brisa.",bonuses:{velocidad:2,suerte:1},weapon:"hoja_brisa",icon:"wind"},{id:"resonancia",name:"Portador de Resonancia",tagline:"Escuchas lo que otros no pueden oír.",desc:"+2 Inteligencia, +1 Resonancia. Empiezas con el Mandoble del Alba.",bonuses:{inteligencia:2,resonancia:1},weapon:"mandoble_alba",icon:"spark"},{id:"guardian",name:"Centinela de Lumen",tagline:"Tu escudo es la última muralla.",desc:"+2 Defensa, +1 Resistencia. Empiezas con el Mandoble del Alba.",bonuses:{defensa:2,resistencia:1},weapon:"mandoble_alba",icon:"shield"}],Gr=[{id:"vitalidad",name:"Vitalidad",desc:"Aumenta la vida máxima."},{id:"resonancia",name:"Resonancia",desc:"Aumenta el maná máximo."},{id:"resistencia",name:"Resistencia",desc:"Aumenta el aguante y la defensa."},{id:"fuerza",name:"Fuerza",desc:"Aumenta el daño de las armas."},{id:"defensa",name:"Defensa",desc:"Reduce el daño recibido."},{id:"velocidad",name:"Velocidad",desc:"Aumenta la velocidad de movimiento."},{id:"inteligencia",name:"Inteligencia",desc:"Potencia las habilidades de resonancia."},{id:"suerte",name:"Suerte",desc:"Aumenta el crítico y la captura de ecos."}],ni={filo_aurora:{id:"filo_aurora",name:"Filo de Aurora",type:"Equilibrada",desc:"La forma primigenia de la Espada Celestial. Canta cuando el Velo se agita.",atk:4,speed:1,crit:.02,color:"#bfe9ff",glow:"#7ee8fa",rarity:"Reliquia"},mandoble_alba:{id:"mandoble_alba",name:"Mandoble del Alba",type:"Pesada",desc:"Una hoja ancha forjada para romper guardias. Cada golpe pesa como un amanecer.",atk:9,speed:.82,crit:0,color:"#ffd58a",glow:"#ffb347",rarity:"Reliquia"},hoja_brisa:{id:"hoja_brisa",name:"Hoja de Brisa",type:"Rápida",desc:"Ligera como una pluma, afilada como un recuerdo. Favorece el contraataque.",atk:2,speed:1.2,crit:.07,color:"#b8f5df",glow:"#7effc8",rarity:"Reliquia"},filo_draconico:{id:"filo_draconico",name:"Filo Dracónico",type:"Equilibrada",desc:"Forjado con una escama de la Reina Ceniza. Aún respira.",atk:13,speed:1,crit:.03,color:"#ff8a5c",glow:"#ff5b2e",rarity:"Épico"},hoja_astral:{id:"hoja_astral",name:"Hoja Astral",type:"Rápida",desc:"Una constelación comprimida en acero. Corta la distancia entre dos verdades.",atk:15,speed:1.12,crit:.08,color:"#c6b7ff",glow:"#9ef0ff",rarity:"Legendaria"},espada_celestial:{id:"espada_celestial",name:"Espada Celestial",type:"Celestial",desc:"La espada completa. No fue forjada para matar, sino para recordar.",atk:22,speed:1.05,crit:.1,color:"#fff2c4",glow:"#fff0a8",rarity:"Celestial"}},_i={tunica_viajero:{id:"tunica_viajero",name:"Túnica de Viajero",desc:"Ropa de camino cosida con hilo de Lumen.",def:2,hp:10,mp:0,tier:0,rarity:"Común"},coraza_valdoria:{id:"coraza_valdoria",name:"Coraza de Valdoria",desc:"Placas de acero claro con el emblema del sol naciente.",def:6,hp:26,mp:0,tier:1,rarity:"Raro"},manto_ceniza:{id:"manto_ceniza",name:"Manto de Ceniza",desc:"Tejido con fibras de Drakmor. El calor le enseña a ser paciente.",def:10,hp:38,mp:6,tier:2,rarity:"Épico"},vestiduras_astrales:{id:"vestiduras_astrales",name:"Vestiduras Astrales",desc:"Las estrellas de Kansordore bordan cada pliegue. No pesan; recuerdan.",def:14,hp:52,mp:20,tier:3,rarity:"Legendaria"},armadura_celestial:{id:"armadura_celestial",name:"Armadura Celestial",desc:"Luz solidificada. El Velo la reconoce como una llave.",def:20,hp:80,mp:30,tier:4,rarity:"Celestial"}},fn={amuleto_lumi:{id:"amuleto_lumi",name:"Amuleto de Lumi",desc:"+8% de probabilidad de capturar ecos.",luck:1,capture:.08,rarity:"Raro"},lagrima_brasa:{id:"lagrima_brasa",name:"Lágrima de Brasa",desc:"+15% de daño con habilidades de resonancia.",spell:.15,rarity:"Épico"},anillo_resonancia:{id:"anillo_resonancia",name:"Anillo de Resonancia",desc:"+20 de maná máximo y regeneración más rápida.",mp:20,regen:.5,rarity:"Raro"},pluma_eco:{id:"pluma_eco",name:"Pluma de Eco",desc:"+12% de captura y +1 Suerte.",luck:1,capture:.12,rarity:"Épico"},talisman_velo:{id:"talisman_velo",name:"Talismán del Velo",desc:"La esquiva otorga 0,12 s extra de invulnerabilidad.",iframes:.12,rarity:"Legendario"}},Yd=[{id:"filo_aurora",name:"Filo de Aurora",desc:"+6% de daño de arma por rango.",max:3,icon:"sword",effect:{attackPct:.06}},{id:"corazon_lumen",name:"Corazón de Lumen",desc:"+18 de vida máxima por rango.",max:3,icon:"heart",effect:{hp:18}},{id:"velo_ligero",name:"Velo Ligero",desc:"+6% de velocidad y -8% de coste de esquiva.",max:2,icon:"wind",effect:{speedPct:.06,dodgeCost:.08}},{id:"guardia_alba",name:"Guardia del Alba",desc:"+0,06 s de ventana de parada perfecta.",max:2,icon:"shield",effect:{parry:.06}},{id:"resonancia_profunda",name:"Resonancia Profunda",desc:"+18 de maná máximo y +8% de poder de habilidad.",max:3,icon:"spark",effect:{mp:18,spellPct:.08}},{id:"instinto",name:"Instinto de Cazador",desc:"+4% de probabilidad de crítico.",max:3,icon:"eye",effect:{crit:.04}},{id:"eco_afin",name:"Eco Afín",desc:"+10% de probabilidad de captura.",max:2,icon:"paw",effect:{capture:.1}},{id:"torrente",name:"Torrente Celestial",desc:"+7% de daño en el tercer golpe del combo.",max:3,icon:"combo",effect:{comboPct:.07}},{id:"juicio",name:"Juicio Celestial",desc:"Desbloquea la habilidad definitiva: un pilar de luz que atraviesa el Velo.",max:1,icon:"sun",effect:{ultimate:!0}}],ai={lumi:{id:"lumi",name:"Lumi",title:"Zorro de Aurora",region:"valdoria",type:"Aurora",rarity:"Común",model:"fox",colors:{body:"#f6f1dc",accent:"#7ee8fa",eye:"#fff7b0"},desc:"Pequeños zorros que duermen dentro de los rayos de sol. Su cola deja estelas de luz.",lore:"Los aldeanos de Lumen dicen que un Lumi puede encontrar a una persona perdida si pronuncia su nombre con cariño.",passive:"+4% de velocidad de movimiento.",passiveEffect:{speedPct:.04},skill:{name:"Destello de Aurora",desc:"Ciega y daña a los enemigos cercanos.",cooldown:9,power:18,effect:"blind"}},brotin:{id:"brotin",name:"Brotín",title:"Guardián de Musgo",region:"valdoria",type:"Tierra",rarity:"Común",model:"mossling",colors:{body:"#6f8f5b",accent:"#b8f59e",eye:"#f5ffca"},desc:"Un montón de musgo con opiniones firmes. Protege los brotes jóvenes de las heladas.",lore:"Cuando un Brotín echa raíces, el bosque entero recuerda su nombre.",passive:"+12 de vida máxima.",passiveEffect:{hp:12},skill:{name:"Raíces Vivas",desc:"Atrapa a los enemigos en el suelo durante 1,4 s.",cooldown:11,power:8,effect:"root"}},zefiro:{id:"zefiro",name:"Zéfiro",title:"Ala de Pradera",region:"valdoria",type:"Viento",rarity:"Raro",model:"bird",colors:{body:"#d6f2ff",accent:"#7effc8",eye:"#2a5360"},desc:"Aves que nunca tocan el suelo dos veces en el mismo lugar. Roban cintas para sus nidos.",lore:"Se dice que un Zéfiro llevó la primera semilla de Valdoria desde el jardín de los dioses.",passive:"+8% de velocidad de esquiva.",passiveEffect:{dodgePct:.08},skill:{name:"Ráfaga",desc:"Atraviesa a los enemigos y otorga velocidad durante 4 s.",cooldown:8,power:22,effect:"haste"}},ascua:{id:"ascua",name:"Ascua",title:"Salamandra de Brasa",region:"drakmor",type:"Brasa",rarity:"Común",model:"salamander",colors:{body:"#b53f2f",accent:"#ffb347",eye:"#fff1a8"},desc:"Duerme en la ceniza tibia. Si se enfada, el suelo recuerda cómo arder.",lore:"La Reina Ceniza las llamaba «las hijas pequeñas del primer fuego».",passive:"+10% de daño de resonancia.",passiveEffect:{spellPct:.1},skill:{name:"Aliento Ígneo",desc:"Quema a los enemigos en cono durante 3 s.",cooldown:10,power:26,effect:"burn"}},obsidiano:{id:"obsidiano",name:"Obsidiano",title:"Escarabajo de Magma",region:"drakmor",type:"Tierra",rarity:"Raro",model:"beetle",colors:{body:"#2b2330",accent:"#ff6b3d",eye:"#ffd166"},desc:"Su caparazón es una fortaleza móvil. Las chispas le sirven de mapa.",lore:"Los antiguos fundidores de Drakmor usaban su caparazón para templar acero sin fuego.",passive:"+8% de defensa.",passiveEffect:{defensePct:.08},skill:{name:"Coraza de Magma",desc:"Otorga un escudo que absorbe daño durante 6 s.",cooldown:12,power:40,effect:"shield"}},aullador:{id:"aullador",name:"Aullador",title:"Lobo de Ceniza",region:"drakmor",type:"Umbra",rarity:"Épico",model:"wolf",colors:{body:"#3b343f",accent:"#b28dff",eye:"#ff6b9d"},desc:"Cazan en silencio hasta que la luna se esconde. Su aullido apaga las antorchas.",lore:"No son lobos. Son juramentos que la ceniza no pudo deshacer.",passive:"+5% de probabilidad de crítico.",passiveEffect:{crit:.05},skill:{name:"Aullido de Ceniza",desc:"Reduce la defensa enemiga durante 5 s.",cooldown:11,power:12,effect:"weaken"}},prisma:{id:"prisma",name:"Prisma",title:"Mariposa de los Sellos",region:"kansordore",type:"Luz",rarity:"Raro",model:"butterfly",colors:{body:"#f4eaff",accent:"#9ef0ff",eye:"#ffd9f0"},desc:"Sus alas contienen fragmentos de luz que aún no han decidido qué color ser.",lore:"Cada Prisma nace de un recuerdo que alguien eligió no olvidar.",passive:"+8% de curación y regeneración.",passiveEffect:{healPct:.08},skill:{name:"Refracción",desc:"Restaura un 25% de la vida del portador.",cooldown:14,power:25,effect:"heal"}},crono:{id:"crono",name:"Crono",title:"Tortuga de los Ecos",region:"kansordore",type:"Tiempo",rarity:"Épico",model:"turtle",colors:{body:"#8c8ab5",accent:"#c6b7ff",eye:"#fff2c4"},desc:"Camina tan despacio que a veces llega antes de haber salido.",lore:"Los archivistas de Kansordore creen que cada Crono lleva un segundo robado al Velo.",passive:"+10 de maná máximo.",passiveEffect:{mp:10},skill:{name:"Marea Lenta",desc:"Ralentiza a los enemigos durante 4 s.",cooldown:13,power:10,effect:"slow"}},serafin:{id:"serafin",name:"Serafín",title:"Pluma del Juicio",region:"kansordore",type:"Celeste",rarity:"Legendario",model:"seraph",colors:{body:"#fff6dc",accent:"#ffd166",eye:"#9ef0ff"},desc:"Un eco de los guardianes originales. Su presencia hace que el aire recuerde rezar.",lore:"Solo queda uno. O quizá siempre hubo uno, esperando a que alguien preguntara su nombre.",passive:"+10% de daño de arma.",passiveEffect:{attackPct:.1},skill:{name:"Juicio de Plumas",desc:"Invoca una lluvia de luz sobre todos los enemigos cercanos.",cooldown:16,power:48,effect:"judgment"}}},Xg={sombra:{id:"sombra",name:"Sombra del Velo",model:"wisp",hp:42,dmg:8,def:1,speed:2.1,range:1.9,attackTime:.55,cooldown:1.8,xp:18,essence:1,radius:.7,height:1.8,captureable:!1,lore:"Un pensamiento que el Velo no pudo digerir."},lobo:{id:"lobo",name:"Lobo de Ceniza",model:"wolf",hp:70,dmg:12,def:3,speed:3.3,range:2.2,attackTime:.45,cooldown:1.5,xp:30,essence:1,radius:.8,height:1.6,captureable:!1,lore:"La ceniza les enseñó a morder antes de aullar."},golem:{id:"golem",name:"Golem de Musgo",model:"golem",hp:110,dmg:16,def:8,speed:1.45,range:2.7,attackTime:.85,cooldown:2.3,xp:46,essence:2,radius:1.15,height:2.7,captureable:!1,lore:"Las ruinas de Valdoria siguen defendiendo algo que ya no recuerdan."},guardia:{id:"guardia",name:"Guardia de Obsidiana",model:"knight",hp:135,dmg:17,def:9,speed:2.2,range:2.6,attackTime:.6,cooldown:1.8,xp:58,essence:2,radius:.9,height:2.3,captureable:!1,lore:"La Reina Ceniza les ordenó no arrodillarse nunca. Obedecen incluso muertos."},centinela:{id:"centinela",name:"Centinela del Velo",model:"sentinel",hp:170,dmg:20,def:10,speed:2,range:6.5,attackTime:.8,cooldown:2.1,xp:72,essence:2,ranged:!0,radius:.9,height:2.5,captureable:!1,lore:"No tiene rostro porque nunca necesitó uno para juzgar."},devorador:{id:"devorador",name:"Devorador de Ceniza",model:"beast",hp:340,dmg:24,def:12,speed:3,range:2.8,attackTime:.7,cooldown:1.5,xp:190,essence:5,radius:1.4,height:2.6,elite:!0,captureable:!1,lore:"Lo que queda cuando un eco olvida su nombre."},guardian:{id:"guardian",name:"El Guardián Astado",model:"stag",hp:300,dmg:18,def:8,speed:2.9,range:3.4,attackTime:.7,cooldown:1.8,xp:260,essence:6,radius:1.9,height:4.3,boss:!0,captureable:!1,lore:"La primera criatura que juró proteger la Gema Celestial. Ahora protege su ausencia."},reina:{id:"reina",name:"La Reina Ceniza",model:"queen",hp:520,dmg:23,def:12,speed:2.5,range:3.2,attackTime:.65,cooldown:1.6,xp:480,essence:10,radius:1.4,height:3.4,boss:!0,captureable:!1,lore:"Ilyra Drakmor vendió su nombre al primer fuego para salvar a su pueblo. El fuego cobró intereses."},vex:{id:"vex",name:"Vex, el Custodio del Velo",model:"vex",hp:760,dmg:28,def:15,speed:2.7,range:3.5,attackTime:.6,cooldown:1.5,xp:900,essence:20,radius:1.5,height:3.8,boss:!0,captureable:!1,lore:"El último Jugador Cero. Eligió sostener el cielo para que nadie más tuviera que hacerlo."}},Pn=[{id:0,title:"La llamada del Velo",objective:"Habla con Lyra en la plaza de Lumen.",hint:"Lyra te espera junto a la fuente, en el centro de la aldea.",region:"valdoria"},{id:1,title:"Ecos en la pradera",objective:"Derrota a las sombras del Velo.",hint:"Las sombras merodean al norte y al este de Lumen.",region:"valdoria",progress:3},{id:2,title:"La voz de la piedra",objective:"Regresa junto a Lyra.",hint:"La erudita querrá saber qué ha despertado en la pradera.",region:"valdoria"},{id:3,title:"El Santuario del Alba",objective:"Enciende las tres Lámparas del Alba.",hint:"El santuario se alza al este, más allá del bosque. Busca tres círculos de luz.",region:"valdoria",progress:3},{id:4,title:"El Guardián Astado",objective:"Derrota al Guardián Astado.",hint:"La piedra central del santuario ha despertado. Prepárate.",region:"valdoria"},{id:5,title:"Ceniza en el horizonte",objective:"Viaja a Drakmor desde el mapa.",hint:"Abre el mapa con M y sigue el rastro del Fragmento de Brasa.",region:"valdoria"},{id:6,title:"La forja rota",objective:"Encuentra a Kael en el Campamento de Ceniza.",hint:"El caballero exiliado acampa al suroeste de la Fortaleza de Ceniza.",region:"drakmor"},{id:7,title:"La puerta de obsidiana",objective:"Derrota a los Guardias de Obsidiana.",hint:"Tres guardias custodian la entrada de la fortaleza.",region:"drakmor",progress:3},{id:8,title:"La Reina Ceniza",objective:"Derrota a la Reina Ceniza.",hint:"El trono arde en el corazón de la fortaleza. No subestimes su fuego.",region:"drakmor"},{id:9,title:"El Archivo Prohibido",objective:"Viaja a Kansordore desde el mapa.",hint:"El Fragmento de Ceniza señala una biblioteca que no existe en ningún mapa.",region:"drakmor"},{id:10,title:"Los tres sellos",objective:"Rompe los Sellos del Archivo.",hint:"Tres centinelas del Velo guardan los sellos. La fe no basta; hay que vencerlos.",region:"kansordore",progress:3},{id:11,title:"La Cumbre de la Convergencia",objective:"Asciende a la Cumbre de la Convergencia.",hint:"El camino se abre al norte del Archivo. Vex te espera.",region:"kansordore"},{id:12,title:"El Custodio del Velo",objective:"Derrota a Vex, el Custodio del Velo.",hint:"El último Jugador Cero no piensa apartarse. La Convergencia ya ha comenzado.",region:"kansordore"},{id:13,title:"La Espada Celestial",objective:"Elige el destino de Aetheria.",hint:"La espada pesa más que nunca. Escucha lo que el Velo te dice.",region:"kansordore"}],Bo={campanas:{id:"campanas",name:"Las campanas dormidas",giver:"Anciana Mira",desc:"Tres braseros de Lumen llevan décadas apagados. Enciéndelos para que la aldea vuelva a recordar la luz.",objective:"Enciende los tres braseros de Lumen.",target:3,reward:"3 Pociones de Luz y 120 de esencia."},ecos:{id:"ecos",name:"El jardín de Nima",giver:"Nima",desc:"Nima quiere saber si el Velo ha dejado de robar los nombres de las criaturas. Captura tres ecos distintos.",objective:"Captura tres ecos distintos.",target:3,reward:"Amuleto de Lumi."},deuda:{id:"deuda",name:"La deuda de Kael",giver:"Kael",desc:"Algo enorme se alimenta en la Caldera de Ceniza. Kael lo llama «su último error».",objective:"Derrota al Devorador de Ceniza.",target:1,reward:"Filo Dracónico y 200 de esencia."},memoria:{id:"memoria",name:"Los ecos del pasado",giver:"Lyra",desc:"Lyra busca tres fragmentos de memoria repartidos por Aetheria. Cada uno contiene una verdad incómoda.",objective:"Recupera tres Ecos del pasado.",target:3,reward:"Vestiduras Astrales."}},sl=[{id:"lore_1",name:"El Primer Juramento",region:"valdoria",pos:{x:-34,z:-24},text:"Antes de los reinos, antes de los nombres, hubo una espada y una promesa. La espada dijo: «No dejaré que el cielo caiga». La promesa respondió: «Yo lo sostendré contigo». Ninguna de las dos sabía que el cielo ya había caído."},{id:"lore_2",name:"Canto de la Brasa",region:"drakmor",pos:{x:58,z:22},text:"Ilyra Drakmor no pidió poder. Pidió que su pueblo sobreviviera al invierno. El primer fuego le concedió ambos y le cobró el nombre. Desde entonces, en Drakmor, amar es una forma lenta de arder."},{id:"lore_3",name:"Los nombres del Velo",region:"kansordore",pos:{x:44,z:-38},text:"El Velo no separa dos mundos. Separa dos decisiones. Cada vez que alguien elige recordar, el Velo se debilita un poco. Cada vez que alguien elige olvidar, se fortalece."},{id:"lore_4",name:"Jugador Cero",region:"kansordore",pos:{x:-44,z:-16},text:"La Profecía de Jugador Cero no habla de un elegido. Habla de alguien que llegará desde fuera del tablero, mirará las reglas y preguntará: «¿quién las escribió?»."},{id:"lore_5",name:"La Jarra de Origen",region:"valdoria",pos:{x:48,z:58},text:"La Jarra no contiene agua. Contiene la primera sed. Quien beba de ella no verá el futuro: verá todas las versiones de sí mismo que podrían haber existido."},{id:"lore_6",name:"La Convergencia Absoluta",region:"kansordore",pos:{x:0,z:-58},text:"Cuando todas las verdades coincidan en un solo punto, el Velo dejará de ser necesario. Eso es la Convergencia. No es el fin del mundo. Es el fin de la distancia entre lo que eres y lo que recuerdas ser."}],Ic={restaurar:{id:"restaurar",title:"EL VELO RESTAURADO",subtitle:"Una paz que recuerda",color:"#7ee8fa",text:"Clavas la Espada Celestial en el corazón de la Convergencia. El cielo se cierra como una herida que aprende a cicatrizar. Aetheria olvida tu nombre, pero cada amanecer tiene un tono dorado que nadie sabe explicar. Lyra deja una silla vacía junto a su ventana. Nunca la ocupa. Nunca la retira.",epilogue:"El Velo resiste. Tú sostienes la memoria de todos los que no pueden recordarte."},romper:{id:"romper",title:"EL VELO ROTO",subtitle:"El mundo respira",color:"#ffb347",text:"Giras la espada y cortas la última hebra. El Velo cae sin ruido. Durante un instante, todos los mundos se ven entre sí: los vivos, los muertos, los que fueron y los que podrían ser. El caos dura tres días. Después, la gente empieza a construir con las ruinas de lo imposible. Nima es la primera en ofrecer la mano a una criatura que nadie había visto antes.",epilogue:"No hay profecía que sobreviva a un mundo que decide escribir su propia historia."},ascender:{id:"ascender",title:"LA ASCENSIÓN",subtitle:"El nuevo Custodio",color:"#c6b7ff",text:"Aceptas el peso. La espada se disuelve en tu pecho y el Velo te reconoce. Vex sonríe por primera vez en mil años. Ocupas su lugar en la Cumbre, viendo todos los caminos sin poder recorrer ninguno. Lyra sube cada invierno a contarte lo que pasa abajo. Tú finges que no lloras. Ella finge no verlo.",epilogue:"El cielo tiene un nuevo guardián. Esta vez, alguien que recuerda por qué lo protege."},celestial:{id:"celestial",title:"LA ESPADA CELESTIAL",subtitle:"El juramento compartido",color:"#fff0a8",text:"No restauras el Velo ni lo rompes. Lo conviertes en un puente. Todos los ecos que has reunido —cada criatura, cada recuerdo, cada nombre— sostienen la tela del cielo junto a ti. La Espada Celestial deja de ser un arma y se convierte en una promesa compartida. Vex llora. Lyra ríe. Nima pregunta si puede invitar a sus bichos a la ceremonia. El cielo, por primera vez en mil años, no pesa.",epilogue:"No ganaste el mundo. Le enseñaste a sostenerse entre todos. Eso es la Espada Celestial."}},Nc=[{id:"historia",name:"Historia",desc:"Combate más indulgente. Ideal para disfrutar del relato.",dmg:.7,hp:.85},{id:"equilibrado",name:"Equilibrado",desc:"La experiencia pensada para la aventura.",dmg:1,hp:1},{id:"celestial",name:"Celestial",desc:"Los enemigos golpean fuerte. El Velo no perdona.",dmg:1.35,hp:1.25}];function Vr(a){return Math.round(70+Math.pow(a-1,1.65)*55)}function Da(a){const e=Math.max(0,Math.floor(a)),t=Math.floor(e/3600),i=Math.floor(e%3600/60);return t>0?`${t}h ${String(i).padStart(2,"0")}m`:`${i}m ${String(e%60).padStart(2,"0")}s`}const Le=Math.PI*2,Je=(a,e,t)=>Math.max(e,Math.min(t,a)),Rn=(a,e,t)=>a+(e-a)*t,Ge=(a,e,t,i)=>Rn(a,e,1-Math.exp(-t*i)),dn=(a,e,t)=>{const i=Je((t-a)/(e-a),0,1);return i*i*(3-2*i)};function Yg(a,e){let t=(e-a+Math.PI)%Le-Math.PI;return t<-Math.PI&&(t+=Le),t}function Cn(a,e,t,i){return a+Yg(a,e)*(1-Math.exp(-t*i))}function tn(a){let e=a>>>0;return function(){e|=0,e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}let Wr=null;function Os(){if(Wr)return Wr;const a=new Uint8Array([52,104,158,210,255]),e=new Jo(a,a.length,1,ir);return e.minFilter=Nt,e.magFilter=Nt,e.needsUpdate=!0,Wr=e,e}function ja(a,e={}){return new Fs({color:a,gradientMap:Os(),...e})}function Pe(a,e={}){return new Ni({color:a,roughness:.82,metalness:.05,...e})}let Ls=null;function al(){if(Ls)return Ls;const a=128,e=document.createElement("canvas");e.width=e.height=a;const t=e.getContext("2d"),i=t.createRadialGradient(a/2,a/2,0,a/2,a/2,a/2);return i.addColorStop(0,"rgba(255,255,255,1)"),i.addColorStop(.15,"rgba(255,255,255,0.95)"),i.addColorStop(.42,"rgba(255,255,255,0.32)"),i.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=i,t.fillRect(0,0,a,a),Ls=new sr(e),Ls.colorSpace=Kt,Ls}function ri(a,e=2,t=.8){const i=new Nn({map:al(),color:a,transparent:!0,opacity:t,depthWrite:!1,blending:ft}),n=new ls(i);return n.scale.set(e,e,1),n}let Ds=null;function Kg(){if(Ds)return Ds;const a=256,e=128,t=document.createElement("canvas");t.width=a,t.height=e;const i=t.getContext("2d"),n=tn(913);for(let s=0;s<22;s++){const r=30+n()*(a-60),o=38+n()*(e-70),c=18+n()*36,l=i.createRadialGradient(r,o,0,r,o,c);l.addColorStop(0,"rgba(255,255,255,0.55)"),l.addColorStop(1,"rgba(255,255,255,0)"),i.fillStyle=l,i.beginPath(),i.arc(r,o,c,0,Le),i.fill()}return Ds=new sr(t),Ds.colorSpace=Kt,Ds}function Zg(a,e={}){const{font:t="600 44px Manrope, sans-serif",color:i="#ffffff",stroke:n="rgba(4,8,20,0.85)",padding:s=22,background:r=null}=e,o=document.createElement("canvas"),c=o.getContext("2d");c.font=t;const l=Math.ceil(c.measureText(a).width+s*2),d=84;o.width=l,o.height=d;const h=o.getContext("2d");r&&(h.fillStyle=r,h.fillRect(0,0,l,d)),h.font=t,h.textAlign="center",h.textBaseline="middle",h.lineWidth=8,h.strokeStyle=n,h.strokeText(a,l/2,d/2+2),h.fillStyle=i,h.fillText(a,l/2,d/2+2);const u=new sr(o);return u.colorSpace=Kt,u}function Uc(a,e="#fff0c2"){const t=Zg(a,{font:"700 40px Cinzel, serif",color:e}),i=new Nn({map:t,transparent:!0,depthWrite:!1}),n=new ls(i);return n.scale.set(t.image.width/46,t.image.height/46,1),n}function st(a,e,t,i=[0,0,0],n=.7){const s=ri(e,t,n);return s.position.set(...i),a.add(s),s}function Fe(a,e,t,i){const n=new H(new gs(a,e,t),i);return n.castShadow=!0,n.receiveShadow=!0,n}function Ze(a,e,t,i,n=8){const s=new H(new Jt(a,e,t,n),i);return s.castShadow=!0,s.receiveShadow=!0,s}function xt(a,e,t=12){const i=new H(new Gi(a,t,Math.max(6,t-2)),e);return i.castShadow=!0,i.receiveShadow=!0,i}function Kd(a,e,t,i=8){const n=new H(new vt(a,e,i),t);return n.castShadow=!0,n.receiveShadow=!0,n}function Fc(a){a.traverse(e=>{e.geometry&&e.geometry.dispose(),e.material&&(Array.isArray(e.material)?e.material.forEach(t=>t.dispose()):e.material.dispose())})}function ts(a,e=!0,t=!0){return a.traverse(i=>{i.isMesh&&(i.castShadow=e,i.receiveShadow=t)}),a}function vi(a,e={}){return ja(a,e)}function Jg(a,e=1.2,t={}){return new De({color:a,...t})}function Qg(a){const e=[];return a.traverse(t=>{if(t.isMesh&&t.material){const i=Array.isArray(t.material)?t.material:[t.material];for(const n of i)n.emissive&&!e.includes(n)&&e.push(n)}}),e}function as(a){const{skin:e="#e2b184",outfit:t="#2e5877",accent:i="#f4d58d",hair:n="#241d2e",hairStyle:s="corto",headgear:r="ninguno",armorTier:o=0,scale:c=1}=a,l=new Te,d=new Te;l.add(d);const h={},u={},f=vi(e),p=vi(t),v=vi(i,{emissive:new Ce(i).multiplyScalar(.12)}),g=vi(n),m=vi("#232433"),_=vi("#3a2d2b"),M=vi("#5d3e32");u.skin=f,u.outfit=p,u.accent=v,u.hair=g;const y=new Te;y.position.y=.92,d.add(y);const A=xt(.3,p,10);A.scale.set(1.05,.7,.8),y.add(A);const E=new Te;E.position.y=.08,y.add(E),h.torso=E;const x=new H(new ut(.27,.38,4,8),p);x.position.y=.3,x.castShadow=!0,x.receiveShadow=!0,x.scale.set(1.06,1,.82),E.add(x);const w=new H(new Tt(.25,.025,4,12),v);w.position.set(0,.23,.02),w.rotation.x=Math.PI/2,w.scale.z=.82,E.add(w);const L=new H(new Tt(.27,.035,4,12),M);L.position.y=-.04,L.rotation.x=Math.PI/2,L.scale.z=.82,E.add(L);const C=Fe(.09,.07,.04,v);if(C.position.set(0,-.04,.235),E.add(C),o>=1)for(const ye of[-1,1]){const Ie=xt(.16,v,8);Ie.scale.set(1.15,.62,1),Ie.position.set(ye*.36,.52,0),E.add(Ie);const Me=new H(new Tt(.11,.018,4,10),v);Me.position.set(ye*.36,.52,0),Me.rotation.x=Math.PI/2,E.add(Me)}function N(ye){const Ie=new Te;Ie.position.set(ye*.36,.48,0),E.add(Ie);const Me=new H(new ut(.075,.24,3,6),p);Me.position.y=-.17,Me.castShadow=!0,Ie.add(Me);const je=new H(new ut(.065,.2,3,6),f);je.position.y=-.46,je.castShadow=!0,Ie.add(je);const at=new H(new Jt(.075,.07,.12,6),v);at.position.y=-.36,Ie.add(at);const $e=xt(.07,f,6);return $e.position.y=-.6,Ie.add($e),Ie}h.leftArm=N(-1),h.rightArm=N(1);function F(ye){const Ie=new Te;Ie.position.set(ye*.16,0,0),y.add(Ie);const Me=new H(new ut(.09,.26,3,6),m);Me.position.y=-.2,Me.castShadow=!0,Ie.add(Me);const je=new H(new ut(.075,.24,3,6),_);je.position.y=-.5,je.castShadow=!0,Ie.add(je);const at=Fe(.17,.11,.27,_);at.position.set(0,-.66,.06),Ie.add(at);const $e=new H(new Gi(.085,6,5),v);return $e.position.y=-.36,Ie.add($e),Ie}h.leftLeg=F(-1),h.rightLeg=F(1);const W=new Te;W.position.y=.66,E.add(W);const P=new Te;P.position.y=.16,W.add(P),h.head=P;const G=xt(.225,f,12);G.scale.set(.92,1.04,.92),P.add(G);const K=xt(.16,f,8);K.position.set(0,-.1,.04),K.scale.set(1,.8,.9),P.add(K);const B=new De({color:"#f8f4e9"}),ie=new De({color:"#263048"});for(const ye of[-1,1]){const Ie=xt(.035,B,6);Ie.position.set(ye*.075,.015,.195),Ie.scale.set(1,.7,.5),P.add(Ie);const Me=xt(.019,ie,6);Me.position.set(ye*.075,.012,.222),Me.scale.set(1,1,.4),P.add(Me)}const $=new De({color:n});for(const ye of[-1,1]){const Ie=Fe(.07,.012,.02,$);Ie.position.set(ye*.075,.075,.215),Ie.rotation.z=ye*-.12,P.add(Ie)}const j=new Te;P.add(j);const te=xt(.245,g,10);te.position.y=.055,te.scale.set(.98,.92,.98),j.add(te);const be=Fe(.34,.09,.12,g);if(be.position.set(0,.12,.16),be.rotation.x=-.18,j.add(be),s==="largo"||s==="trenza"){const ye=new H(new ut(.18,.42,4,8),g);ye.position.set(0,-.16,-.13),ye.scale.set(.95,1,.55),j.add(ye)}if(s==="trenza"){for(let Ie=0;Ie<4;Ie++){const Me=xt(.075-Ie*.008,g,6);Me.position.set(.2,-.22-Ie*.13,-.12),j.add(Me)}const ye=new H(new Tt(.055,.012,4,8),v);ye.position.set(.2,-.5,-.12),ye.rotation.x=Math.PI/2,j.add(ye)}if(s==="rapado"&&(te.scale.set(.94,.55,.94),te.position.y=.08,be.visible=!1),r==="diadema"){const ye=new H(new Tt(.23,.018,4,16),v);ye.position.y=.13,ye.rotation.x=Math.PI/2,P.add(ye);const Ie=new H(new Zt(.045,0),Jg(i,1.4));Ie.position.set(0,.18,.22),P.add(Ie)}else if(r==="celada"){const ye=new H(new Gi(.255,10,8,0,Le,0,Math.PI*.62),v);ye.position.y=.05,ye.scale.set(1,1.08,1),P.add(ye);const Ie=Fe(.045,.16,.06,v);Ie.position.set(0,0,.23),P.add(Ie);const Me=new H(new vt(.06,.22,5),vi("#e7c36b"));Me.position.set(0,.29,-.02),P.add(Me)}const Be=new Te;Be.position.set(0,.5,-.19),E.add(Be);const Z=new Ni({color:i,side:pt,roughness:.95,transparent:!0,opacity:o>=2?.95:.78}),fe=new H(new Mi(.64,o>=2?1.1:.72,4,6),Z);fe.position.y=-.42,fe.rotation.x=.06,fe.castShadow=!0,Be.add(fe),h.cape=Be,u.cape=Z;const Se=new Te,Oe=new H(new Ci(.38,.52,6),new De({color:i,transparent:!0,opacity:.8,side:pt,blending:ft,depthWrite:!1}));Se.add(Oe);const me=new H(new Qi(.36,6),new De({color:i,transparent:!0,opacity:.12,side:pt,blending:ft,depthWrite:!1}));return Se.add(me),Se.position.set(0,1.15,.65),Se.visible=!1,l.add(Se),h.shield=Se,l.scale.setScalar(c),{group:l,bodyRoot:d,parts:h,materials:u,materialsList:Qg(l)}}function Ln(a="filo_aurora",e=1){const t=ni[a]||ni.filo_aurora,i=new Te,n=new Ni({color:t.color,emissive:new Ce(t.glow).multiplyScalar(.65),roughness:.24,metalness:.7}),s=Pe("#d9b969",{metalness:.8,roughness:.35}),r=Pe("#4a2f2c",{roughness:.9}),o=a==="mandoble_alba",c=a==="hoja_brisa",l=o?1.38:c?1.08:1.22,d=o?.13:c?.06:.085,h=Fe(d,l,.035,n);h.position.y=.32+l/2,i.add(h);const u=Kd(d*.78,.24,n,4);u.position.y=.32+l+.1,u.rotation.y=Math.PI/4,i.add(u);const f=Fe(d*.24,l*.82,.04,new De({color:t.glow}));f.position.set(0,.36+l*.45,.005),i.add(f);const p=Fe(o?.44:.3,.06,.07,s);p.position.y=.3,i.add(p);for(const _ of[-1,1]){const M=new H(new vt(.035,.14,4),s);M.position.set(_*(o?.25:.17),.36,0),M.rotation.z=_*-.7,i.add(M)}const v=Ze(.045,.04,.26,r,6);v.position.y=.15,i.add(v);const g=xt(.075,s,6);g.position.y=0,i.add(g);const m=new H(new Zt(.06,0),new De({color:t.glow}));return m.position.set(0,.3,.06),i.add(m),st(i,t.glow,o?.9:.6,[0,.3,.05],.5),i.scale.setScalar(e),i.userData.weapon=t,i.userData.gem=m,i.userData.bladeMat=n,i}function rl(a={},e="filo_aurora",t="tunica_viajero",i="ninguno"){const n=a.skinColor||ii.skin[1].color,s=a.outfitColor||ii.outfitColors[0].color,r=a.accentColor||ii.accents[0].color,o=a.hairColor||ii.hairColors[0].color,c=a.hairStyle||"corto",l={tunica_viajero:0,coraza_valdoria:1,manto_ceniza:2,vestiduras_astrales:3,armadura_celestial:4}[t]??0,d=as({skin:n,outfit:s,accent:r,hair:o,hairStyle:c,headgear:i,armorTier:l}),h=Ln(e,1);return h.position.set(0,-.58,.03),h.rotation.set(.1,0,-.14),d.parts.rightArm.add(h),d.parts.weapon=h,d.group.userData.kind="player",d.group.userData.model=d,d.weaponId=e,d.armorId=t,d.pose={moving:0,sprinting:!1,attacking:!1,attackType:"light",attackProgress:0,combo:0,blocking:!1,casting:!1,castProgress:0,dodging:!1,dodgeProgress:0,hurt:0,dead:!1,deadProgress:0,grounded:!0,time:0},d}function er(a,e,t){const i=a.pose,{bodyRoot:n,parts:s,materialsList:r}=a;i.time+=e;const o=i.time,c=Je(i.moving,0,1),l=c*(i.sprinting?1.35:1);n.position.y=0,n.position.x=0,n.position.z=0,n.rotation.set(0,0,0);const d=Math.sin(o*2.1)*.012;n.position.y=d,s.torso.rotation.x=Ge(s.torso.rotation.x,.06+l*.12,8,e),s.torso.rotation.z=Ge(s.torso.rotation.z,-Math.sin(o*8)*.025*c,8,e);const h=o*(i.sprinting?12:8.5),u=Math.sin(h)*.68*l;if(s.leftLeg.rotation.x=Ge(s.leftLeg.rotation.x,u,16,e),s.rightLeg.rotation.x=Ge(s.rightLeg.rotation.x,-u,16,e),s.leftLeg.rotation.z=0,s.rightLeg.rotation.z=0,s.leftArm.rotation.x=Ge(s.leftArm.rotation.x,-u*.6-.05,14,e),s.rightArm.rotation.x=Ge(s.rightArm.rotation.x,u*.45-.08,14,e),s.leftArm.rotation.z=Ge(s.leftArm.rotation.z,.08,8,e),s.rightArm.rotation.z=Ge(s.rightArm.rotation.z,-.08,8,e),s.head.rotation.x=Ge(s.head.rotation.x,-l*.08,8,e),s.head.rotation.z=Ge(s.head.rotation.z,Math.sin(o*1.3)*.03*(1-c),6,e),s.cape.rotation.x=Ge(s.cape.rotation.x,.05+l*.42+Math.sin(o*5)*.05,7,e),s.cape.rotation.z=Math.sin(o*3.4)*.04,s.shield.visible=!1,s.weapon.visible=!0,s.weapon.rotation.set(.1,0,-.14),s.weapon.position.set(0,-.58,.03),i.hurt>0){i.hurt=Math.max(0,i.hurt-e);const f=i.hurt*8;n.position.x=Math.sin(o*75)*.045*f;for(const p of r)p.emissive?.setRGB(f*.55,f*.08,f*.04)}else for(const f of r)f.emissive?.setRGB(0,0,0);if(i.dead){i.deadProgress=Math.min(1,i.deadProgress+e*1.6),n.rotation.x=-i.deadProgress*1.35,n.position.y=-i.deadProgress*.25;return}if(i.dodging){const f=Je(i.dodgeProgress,0,1);n.position.y=.45+Math.sin(f*Math.PI)*.25,n.rotation.x=f*Le,s.leftArm.rotation.x=-1.2,s.rightArm.rotation.x=-1.2;return}if(i.blocking){s.torso.rotation.x=Ge(s.torso.rotation.x,.22,12,e),s.leftArm.rotation.x=Ge(s.leftArm.rotation.x,-1.25,16,e),s.leftArm.rotation.z=Ge(s.leftArm.rotation.z,-.45,16,e),s.rightArm.rotation.x=Ge(s.rightArm.rotation.x,-.7,12,e),s.rightArm.rotation.z=Ge(s.rightArm.rotation.z,.3,12,e),s.shield.visible=!0;const f=1+Math.sin(o*8)*.04;s.shield.scale.setScalar(f);return}if(i.casting){const f=Je(i.castProgress,0,1),p=Math.sin(f*Math.PI);s.leftArm.rotation.x=Ge(s.leftArm.rotation.x,-2.2*p,18,e),s.rightArm.rotation.x=Ge(s.rightArm.rotation.x,-2.2*p,18,e),s.leftArm.rotation.z=Ge(s.leftArm.rotation.z,-.6*p,18,e),s.rightArm.rotation.z=Ge(s.rightArm.rotation.z,.6*p,18,e),s.torso.rotation.x=Ge(s.torso.rotation.x,-.1*p,10,e),s.head.rotation.x=Ge(s.head.rotation.x,-.2*p,10,e),s.weapon.visible=!1;return}if(i.attacking){const f=Je(i.attackProgress,0,1),p=Math.min(1,f/.34),v=f<.34?0:Math.min(1,(f-.34)/.28),g=f<.62?0:(f-.62)/.38,_=i.combo%3===1?-1:1;let M=-.5-p*1.5+v*2.5-g*.8,y=_*(-.35-p*.85+v*2.15-g*.7),A=_*(-.45*p+v*1.25-g*.8);i.attackType==="heavy"&&(M=-1.9+p*.2+v*2.6-g*.7,y=-.9*p+v*1.9-g*.9,A=-.55*p+v*1.15-g*.6),s.rightArm.rotation.x=Ge(s.rightArm.rotation.x,M,26,e),s.rightArm.rotation.z=Ge(s.rightArm.rotation.z,y,26,e),s.leftArm.rotation.x=Ge(s.leftArm.rotation.x,-.35-v*.4,14,e),s.leftArm.rotation.z=Ge(s.leftArm.rotation.z,.18,12,e),s.torso.rotation.y=Ge(s.torso.rotation.y,A,24,e),s.torso.rotation.x=Ge(s.torso.rotation.x,.08+v*.12,18,e),s.head.rotation.y=Ge(s.head.rotation.y,A*.5,18,e),s.cape.rotation.x=Ge(s.cape.rotation.x,.18+v*.55,10,e);return}s.torso.rotation.y=Ge(s.torso.rotation.y,0,10,e),s.head.rotation.y=Ge(s.head.rotation.y,0,10,e)}function jg(a,e,t,i,n){const s=rl(e,t,i,n);return s.group.position.copy(a.group.position),s.group.rotation.copy(a.group.rotation),s.pose=a.pose,s}function xi(a,e,t,i,n,s,r=.05){const o=new De({color:s});for(let c=0;c<e;c++){const l=xt(r,o,6),d=(c-(e-1)/2)*t;l.position.set(d,i,n),a.add(l),st(a,s,r*6,[d,i,n+.02],.55)}}function ev(a,e=1.6){const t=new Te,i=new H(new Mi(e+.08,.15),new De({color:"#070a15",transparent:!0,opacity:.82,depthWrite:!1})),n=new H(new Mi(e,.08),new De({color:"#ff7a6b",depthWrite:!1}));n.position.z=.01;const s=new H(new Mi(e+.08,.15),new De({color:"#f4d58d",transparent:!0,opacity:.4,wireframe:!0,depthWrite:!1}));return s.position.z=.02,t.add(i,n,s),t.position.y=a+.42,t.userData.fill=n,t.userData.width=e,t}function tv(a,e=1){const t=new Te,i=new Te;t.add(i);const n={},s={wisp:"#6f4bce",wolf:"#3b343f",golem:"#637a52",knight:"#2d2b36",sentinel:"#c9b7ff",beast:"#3a2025",stag:"#d9e7df",queen:"#9b3030",vex:"#d6c4ff"}[a.model]||"#666",r={wisp:"#b98cff",wolf:"#ff6b9d",golem:"#b8f59e",knight:"#ff7a4a",sentinel:"#9ef0ff",beast:"#ff5b2e",stag:"#9ef0ff",queen:"#ffb347",vex:"#ffd166"}[a.model]||"#f4d58d",o=vi(s),c=vi(r,{emissive:new Ce(r).multiplyScalar(.18)}),l=new De({color:r});if(n.body=i,a.model==="wisp"){const h=new H(new hs(.48,1),l);h.position.y=1.55,i.add(h);const u=new H(new hs(.7,1),new De({color:r,transparent:!0,opacity:.18,wireframe:!0}));u.position.y=1.55,i.add(u),n.core=h,n.shell=u;for(let f=0;f<3;f++){const p=new H(new Ja(.14,0),l);p.userData.angle=f/3*Le,p.position.y=1.55,i.add(p),(n.shards||=[]).push(p)}st(i,r,3.2,[0,1.55,0],.55),xi(i,2,.12,1.58,.38,"#fff2b0",.045)}else if(a.model==="wolf"){const h=new H(new ut(.42,.85,4,8),o);h.rotation.z=Math.PI/2,h.position.y=1.05,i.add(h);const u=new Te;u.position.set(0,1.35,.72),i.add(u);const f=new H(new vt(.3,.55,6),o);f.rotation.x=Math.PI/2,f.position.z=.18,u.add(f);const p=Fe(.24,.13,.38,o);p.position.set(0,-.1,.34),u.add(p);for(const g of[-1,1]){const m=new H(new vt(.1,.32,4),o);m.position.set(g*.18,.28,.05),m.rotation.z=g*-.25,u.add(m)}xi(u,2,.14,.06,.46,r,.04),n.head=u;for(const g of[-1,1])for(const m of[-.32,.34]){const _=new Te;_.position.set(g*.28,.78,m),i.add(_);const M=new H(new ut(.09,.52,3,5),o);M.position.y=-.28,_.add(M),(n.legs||=[]).push(_)}const v=new H(new ut(.08,.62,3,5),o);v.position.set(0,1.12,-.72),v.rotation.x=-.8,i.add(v),n.tail=v,st(i,r,1.6,[0,1.05,0],.2)}else if(a.model==="golem"){const h=Fe(1.1,1.25,.8,o);h.position.y=1.65,i.add(h);const u=Fe(.52,.46,.5,o);u.position.set(0,2.55,.08),i.add(u),xi(u,2,.18,.02,.27,r,.055);for(const f of[-1,1]){const p=new Te;p.position.set(f*.72,2.05,0),i.add(p);const v=Fe(.34,1.15,.34,o);v.position.y=-.5,p.add(v);const g=Fe(.44,.44,.44,o);g.position.y=-1.1,p.add(g),(n.arms||=[]).push(p);const m=Fe(.42,.9,.48,o);m.position.set(f*.3,.5,0),i.add(m)}for(let f=0;f<6;f++){const p=xt(.18+Math.random()*.1,c,5);p.position.set((Math.random()-.5)*.9,1.3+Math.random()*1.2,(Math.random()-.5)*.5),i.add(p)}st(i,r,1.8,[0,2.1,0],.15)}else if(a.model==="knight"){const h=as({skin:"#6f5a4a",outfit:s,accent:r,hair:"#1d1b22",hairStyle:"rapado",headgear:"celada",armorTier:2,scale:1.12});h.group.position.y=0,i.add(h.group);const u=Ln("mandoble_alba",1.2);u.position.set(0,-.6,0),u.rotation.z=Math.PI,h.parts.rightArm.add(u),n.humanoid=h,st(i,r,1.5,[0,2,0],.2)}else if(a.model==="sentinel"){const h=new H(new vt(.8,2.1,8,1,!0),o);h.position.y=1.05,i.add(h);const u=new H(new Zt(.38,0),c);u.scale.set(.7,1,.3),u.position.y=2.35,i.add(u);const f=new H(new Tt(.58,.035,4,32),new De({color:r,transparent:!0,opacity:.8,blending:ft}));f.position.y=2.35,f.rotation.x=Math.PI/2,i.add(f),n.halo=f,n.mask=u;for(let p=0;p<4;p++){const v=new H(new Ja(.12,0),l);v.userData.angle=p/4*Le,v.position.y=1.5,i.add(v),(n.shards||=[]).push(v)}st(i,r,2.5,[0,2.2,0],.4)}else if(a.model==="beast"){const h=new H(new ut(.72,1.4,4,8),o);h.rotation.z=Math.PI/2,h.position.y=1.35,i.add(h);const u=new Te;u.position.set(0,1.75,1.05),i.add(u);const f=new H(new ki(.5,0),o);u.add(f);const p=Fe(.42,.28,.65,o);p.position.set(0,-.24,.4),u.add(p);for(const g of[-1,1]){const m=new H(new vt(.13,.85,5),c);m.position.set(g*.36,.5,.05),m.rotation.z=g*-.4,u.add(m)}xi(u,2,.2,.12,.48,"#fff2b0",.065),n.head=u;for(const g of[-1,1])for(const m of[-.55,.55]){const _=new Te;_.position.set(g*.5,.9,m),i.add(_);const M=new H(new ut(.14,.72,3,5),o);M.position.y=-.4,_.add(M),(n.legs||=[]).push(_)}const v=new H(new vt(.18,1.2,5),o);v.position.set(0,1.4,-1.15),v.rotation.x=-1.25,i.add(v),st(i,r,2.2,[0,1.4,0],.3)}else if(a.model==="stag"){const h=new H(new ut(.72,1.7,4,8),o);h.rotation.z=Math.PI/2,h.position.y=2,i.add(h);const u=new H(new ut(.32,.9,3,7),o);u.position.set(0,2.6,.75),u.rotation.x=.4,i.add(u);const f=new Te;f.position.set(0,3.25,1.05),i.add(f);const p=new H(new vt(.3,.9,6),o);p.rotation.x=Math.PI/2,f.add(p),xi(f,2,.16,.1,.38,"#9ef0ff",.055);for(const g of[-1,1]){const m=new Te;m.position.set(g*.2,.22,0),f.add(m);for(let _=0;_<3;_++){const M=new H(new Jt(.025,.06,.8-_*.12,5),c);M.position.set(g*(.15+_*.15),.4+_*.12,0),M.rotation.z=g*(-.35-_*.2),m.add(M)}st(m,r,.8,[g*.3,.6,0],.6)}n.head=f;for(const g of[-1,1])for(const m of[-.62,.66]){const _=new Te;_.position.set(g*.5,1.3,m),i.add(_);const M=new H(new ut(.14,.95,3,5),o);M.position.y=-.52,_.add(M),(n.legs||=[]).push(_)}const v=new H(new Tt(1.7,.035,4,48),new De({color:r,transparent:!0,opacity:.45,blending:ft}));v.position.y=1.7,v.rotation.x=Math.PI/2,i.add(v),n.ring=v,st(i,r,4.5,[0,2.2,0],.35)}else if(a.model==="queen"){const h=as({skin:"#c7a38d",outfit:"#3b171d",accent:"#ffb347",hair:"#2a151a",hairStyle:"largo",headgear:"diadema",armorTier:3,scale:1.42});i.add(h.group),h.group.rotation.y=Math.PI,n.humanoid=h;const u=Ln("mandoble_alba",1.55);u.position.set(0,-.7,0),u.rotation.z=Math.PI,h.parts.rightArm.add(u);const f=new Te;f.position.set(0,2.25,0),i.add(f);for(let p=0;p<5;p++){const v=new H(new vt(.045,.25+(p===2?.18:0),4),new De({color:"#ffb347"}));v.position.set((p-2)*.13,.12,0),f.add(v)}for(let p=0;p<10;p++){const v=ri("#ff8a4a",.3+Math.random()*.5,.6);v.position.set((Math.random()-.5)*2.2,.5+Math.random()*2.8,(Math.random()-.5)*1.8),v.userData.phase=Math.random()*Le,i.add(v),(n.embers||=[]).push(v)}st(i,"#ff5b2e",5.5,[0,1.6,0],.25)}else if(a.model==="vex"){const h=as({skin:"#d8d2e8",outfit:"#282143",accent:"#ffd166",hair:"#e9e5f7",hairStyle:"largo",headgear:"ninguno",armorTier:4,scale:1.58});i.add(h.group),n.humanoid=h;const u=Ln("espada_celestial",1.75);u.position.set(0,-.8,0),u.rotation.z=Math.PI,h.parts.rightArm.add(u);const f=new H(new Tt(1.1,.025,4,48),new De({color:"#ffd166",transparent:!0,opacity:.65,blending:ft}));f.position.y=2.8,f.rotation.x=Math.PI/2,i.add(f),n.halo=f;for(let p=0;p<6;p++){const v=new H(new Zt(.12,0),new De({color:"#ffd166"}));v.userData.angle=p/6*Le,v.position.y=1.2,i.add(v),(n.shards||=[]).push(v)}st(i,"#ffd166",6.5,[0,2,0],.3)}const d=ev(a.height||2,a.boss?2.6:1.5);return d.visible=!1,t.add(d),t.userData.kind="enemy",t.userData.model={group:t,body:i,parts:n,hpBar:d,def:a,level:e,color:s,accent:r},t.userData.model}function qr(a,e,t,i){const{body:n,parts:s,def:r,level:o}=a,c=t,l=i.moveAmount||0,d=c*(i.boss?6.5:8.5);if(s.legs&&s.legs.forEach((h,u)=>{h.rotation.x=Math.sin(d+(u%2?Math.PI:0))*.6*l}),s.tail&&(s.tail.rotation.z=Math.sin(c*3.2)*.18),s.humanoid){const h=s.humanoid;h.pose.moving=l,h.pose.attacking=i.attacking,h.pose.attackProgress=i.attackProgress||0,h.pose.attackType="light",h.pose.combo=i.combo||0,h.pose.blocking=i.blocking||!1,h.pose.hurt=i.hurt||0,h.pose.dead=i.dead||!1,h.pose.deadProgress=i.deadProgress||0,h.pose.casting=i.casting||!1,h.pose.castProgress=i.castProgress||0,er(h,e)}if(s.head&&(s.head.rotation.x=Math.sin(c*1.4)*.04,i.attacking&&(s.head.rotation.x=-.15)),s.core){s.core.rotation.y+=e*1.4,s.core.rotation.x+=e*.7;const h=1+Math.sin(c*4)*.06;s.core.scale.setScalar(h),n.position.y=Math.sin(c*2.2)*.12}if(s.shell&&(s.shell.rotation.y-=e*.6,s.shell.rotation.z+=e*.25),s.shards&&s.shards.forEach((h,u)=>{const f=(h.userData.angle||0)+c*(.6+u*.1);h.position.x=Math.cos(f)*1.05,h.position.z=Math.sin(f)*1.05,h.position.y=1.35+Math.sin(f*1.7)*.35,h.rotation.x+=e*2,h.rotation.y+=e*1.5}),s.halo&&(s.halo.rotation.z+=e*.35),s.ring&&(s.ring.rotation.z+=e*.2,s.ring.scale.setScalar(1+Math.sin(c*2)*.03)),s.embers&&s.embers.forEach(h=>{h.position.y+=e*.45,h.position.y>3.4&&(h.position.y=.3),h.material.opacity=.35+Math.sin(c*3+h.userData.phase)*.25}),i.windup>0){const h=1+i.windup*.06;n.scale.setScalar(h),n.position.y=0}else n.scale.setScalar(1),n.position.y=0;if(i.stagger>0?n.rotation.z=Math.sin(c*30)*.1*i.stagger:n.rotation.z=Ge(n.rotation.z,0,10,e),i.dead?(n.rotation.x=Ge(n.rotation.x,-1.35,5,e),n.position.y=Ge(n.position.y,-.3,3,e)):n.rotation.x=Ge(n.rotation.x,0,8,e),a.hpBar.visible=i.showHp&&!i.dead,i.showHp){const h=Je(i.hp/i.maxHp,0,1);a.hpBar.userData.fill.scale.x=h,a.hpBar.userData.fill.position.x=-(1-h)*a.hpBar.userData.width/2,a.hpBar.userData.fill.material.color.set(h>.5?"#7ee8fa":h>.25?"#ffd166":"#ff7a6b")}}function zc(a){const e=new Te,t=new Te;e.add(t);const i={},n=vi(a.colors.body,{emissive:new Ce(a.colors.body).multiplyScalar(.08)}),s=vi(a.colors.accent,{emissive:new Ce(a.colors.accent).multiplyScalar(.35)});new De({color:a.colors.eye});const r=.72;if(a.model==="fox"){const o=new H(new ut(.24,.55,4,7),n);o.rotation.z=Math.PI/2,o.position.y=.62,t.add(o);const c=xt(.24,n,8);c.position.set(0,.82,.4),t.add(c);for(const d of[-1,1]){const h=new H(new vt(.09,.26,4),s);h.position.set(d*.13,1,.38),h.rotation.z=d*-.2,t.add(h)}const l=new H(new ut(.12,.55,4,6),s);l.position.set(0,.75,-.48),l.rotation.x=-.9,t.add(l),i.tail=l;for(const d of[-1,1])for(const h of[-.2,.22]){const u=new H(new ut(.05,.28,3,5),n);u.position.set(d*.17,.3,h),t.add(u)}xi(t,2,.11,.85,.6,a.colors.eye,.035),st(t,a.colors.accent,1.4,[0,.7,0],.3)}else if(a.model==="mossling"){const o=new H(new ki(.48,0),n);o.position.y=.62,t.add(o);const c=new H(new ki(.28,0),n);c.position.set(0,1.02,.08),t.add(c);for(let l=0;l<5;l++){const d=xt(.11+Math.random()*.07,s,5);d.position.set((Math.random()-.5)*.7,.55+Math.random()*.65,(Math.random()-.5)*.5),t.add(d)}xi(c,2,.12,.02,.24,a.colors.eye,.045);for(const l of[-1,1]){const d=xt(.1,n,5);d.position.set(l*.24,.18,.05),t.add(d)}st(t,a.colors.accent,1.5,[0,.6,0],.25)}else if(a.model==="bird"){const o=new H(new ut(.2,.42,4,7),n);o.rotation.x=Math.PI/2,o.position.y=.72,t.add(o);const c=xt(.18,n,7);c.position.set(0,.95,.35),t.add(c);const l=new H(new vt(.06,.2,4),s);l.position.set(0,.93,.53),l.rotation.x=Math.PI/2,t.add(l);for(const h of[-1,1]){const u=new H(new vt(.18,.62,3),s);u.position.set(h*.26,.82,-.05),u.rotation.z=h*1.1,t.add(u),(i.wings||=[]).push(u)}const d=new H(new vt(.14,.6,3),s);d.position.set(0,.7,-.5),d.rotation.x=-1.2,t.add(d),i.tail=d,xi(c,2,.1,.04,.17,a.colors.eye,.03),st(t,a.colors.accent,1.4,[0,.8,0],.3)}else if(a.model==="salamander"){const o=new H(new ut(.19,.55,4,7),n);o.rotation.x=Math.PI/2,o.position.y=.38,t.add(o);const c=xt(.22,n,7);c.position.set(0,.46,.42),t.add(c);const l=new H(new ut(.1,.6,4,6),s);l.position.set(0,.35,-.5),l.rotation.x=-1.1,t.add(l),i.tail=l;for(const d of[-1,1])for(const h of[-.2,.24]){const u=new H(new ut(.045,.2,3,5),n);u.position.set(d*.19,.2,h),t.add(u)}xi(c,2,.1,.06,.2,a.colors.eye,.032);for(let d=0;d<3;d++){const h=ri(a.colors.accent,.4+Math.random()*.25,.7);h.position.set((Math.random()-.5)*.3,.5+Math.random()*.4,-.35-d*.12),t.add(h),(i.flames||=[]).push(h)}st(t,a.colors.accent,1.4,[0,.5,0],.35)}else if(a.model==="beetle"){const o=xt(.4,n,8);o.scale.set(1.2,.75,1),o.position.y=.55,t.add(o);const c=xt(.18,n,6);c.position.set(0,.5,.42),t.add(c);const l=new H(new vt(.06,.42,4),s);l.position.set(0,.68,.58),l.rotation.x=-.5,t.add(l);for(let d=0;d<3;d++){const h=Fe(.02,.02,.3,s);h.position.set((d-1)*.18,.8,0),t.add(h)}xi(c,2,.1,.02,.15,a.colors.eye,.03);for(const d of[-1,1])for(let h=0;h<3;h++){const u=new H(new ut(.035,.24,3,4),n);u.position.set(d*.42,.32,(h-1)*.22),u.rotation.z=d*.8,t.add(u)}st(t,a.colors.accent,1.6,[0,.6,0],.3)}else if(a.model==="wolf"){const o=new H(new ut(.27,.7,4,7),n);o.rotation.z=Math.PI/2,o.position.y=.66,t.add(o);const c=xt(.23,n,7);c.position.set(0,.84,.48),t.add(c);for(const d of[-1,1]){const h=new H(new vt(.07,.2,4),s);h.position.set(d*.13,1.02,.43),t.add(h)}xi(c,2,.1,.03,.21,a.colors.eye,.03);const l=new H(new ut(.07,.5,3,5),s);l.position.set(0,.7,-.6),l.rotation.x=-.7,t.add(l),i.tail=l,st(t,a.colors.accent,1.6,[0,.7,0],.3)}else if(a.model==="butterfly"){const o=new H(new ut(.08,.35,3,6),n);o.position.y=.9,t.add(o);const c=xt(.11,n,6);c.position.set(0,1.13,.04),t.add(c);for(const l of[-1,1]){const d=new H(new Qi(.42,8),new De({color:a.colors.accent,transparent:!0,opacity:.55,side:pt,blending:ft}));d.position.set(l*.38,1,0),d.rotation.y=l*.5,d.scale.set(1,.75,1),t.add(d),(i.wings||=[]).push(d);const h=new H(new Jt(.01,.01,.3,4),s);h.position.set(l*.07,1.28,.08),h.rotation.z=l*.4,t.add(h)}st(t,a.colors.accent,2.2,[0,1,0],.45)}else if(a.model==="turtle"){const o=xt(.5,n,8);o.scale.set(1.1,.6,1.25),o.position.y=.55,t.add(o);const c=new H(new Tt(.5,.07,4,12),s);c.position.y=.45,c.rotation.x=Math.PI/2,c.scale.set(1.1,1.25,1),t.add(c);const l=xt(.2,n,7);l.position.set(0,.52,.62),t.add(l),xi(l,2,.1,.04,.18,a.colors.eye,.03);for(const d of[-1,1]){const h=new H(new ut(.07,.2,3,4),n);h.position.set(d*.35,.2,.3),t.add(h)}for(let d=0;d<5;d++){const h=new H(new Zt(.045,0),new De({color:a.colors.accent}));h.position.set((d-2)*.18,.82,0),t.add(h)}st(t,a.colors.accent,1.6,[0,.6,0],.3)}else if(a.model==="seraph"){const o=as({skin:"#fff6dc",outfit:"#e7d9b0",accent:a.colors.accent,hair:"#fff2c4",hairStyle:"largo",headgear:"diadema",armorTier:3,scale:.62});t.add(o.group),i.humanoid=o;for(const l of[-1,1])for(let d=0;d<2;d++){const h=new H(new vt(.18,.9,3),new De({color:a.colors.accent,transparent:!0,opacity:.55,side:pt}));h.position.set(l*.4,1.2+d*.18,-.25-d*.08),h.rotation.z=l*(.9+d*.3),h.rotation.x=-.3,t.add(h),(i.wings||=[]).push(h)}const c=new H(new Tt(.3,.02,4,24),new De({color:a.colors.accent}));c.position.y=1.65,c.rotation.x=Math.PI/2,t.add(c),i.halo=c,st(t,a.colors.accent,2.8,[0,1.1,0],.4)}return t.scale.setScalar(r),e.userData.kind="creature",e.userData.model={group:e,body:t,parts:i,species:a},e.userData.model}function Oc(a,e,t,i={}){const{body:n,parts:s}=a,r=t;n.position.y=Math.sin(r*2.4)*.04+(i.hover?.18:0),s.tail&&(s.tail.rotation.z=Math.sin(r*4.2)*.25),s.wings&&s.wings.forEach((o,c)=>{o.rotation.z+=Math.sin(r*7+c)*e*2.5}),s.flames&&s.flames.forEach(o=>{o.material.opacity=.45+Math.sin(r*5+Math.random())*.2}),s.halo&&(s.halo.rotation.z+=e*.6),i.moving&&(n.rotation.z=Math.sin(r*8)*.04),i.attack?n.rotation.x=Math.sin(i.attack*Math.PI)*-.25:n.rotation.x=Ge(n.rotation.x,0,8,e)}function iv(a){const e={lyra:{skin:"#e8bd9d",outfit:"#40356b",accent:"#c6b7ff",hair:"#dbe7ee",hairStyle:"largo",headgear:"diadema",scale:1},nima:{skin:"#b97a54",outfit:"#2f6a57",accent:"#b8f59e",hair:"#5b3522",hairStyle:"trenza",headgear:"ninguno",scale:.98},mira:{skin:"#d6a57f",outfit:"#6b3e4a",accent:"#f4d58d",hair:"#dbe7ee",hairStyle:"largo",headgear:"ninguno",scale:.94},orin:{skin:"#8a5638",outfit:"#5d3e32",accent:"#ffb347",hair:"#241d2e",hairStyle:"rapado",headgear:"ninguno",scale:1.06},kael:{skin:"#c58a5e",outfit:"#4a2228",accent:"#ff8a4a",hair:"#241d2e",hairStyle:"corto",headgear:"ninguno",scale:1.08}},t=e[a]||e.lyra,i=as({...t,armorTier:a==="kael"?2:1});if(i.group.userData.kind="npc",i.group.userData.npcId=a,a==="lyra"){const n=Ln("hoja_brisa",.85);n.position.set(0,-.58,.02),n.rotation.set(.1,0,.2),i.parts.rightArm.add(n)}if(a==="kael"){const n=Ln("filo_draconico",1.05);n.position.set(0,-.58,.03),n.rotation.set(.1,0,-.14),i.parts.rightArm.add(n)}if(a==="mira"){const n=new H(new Jt(.025,.04,1.4,5),Pe("#7a5b3a"));n.position.set(.3,.7,.1),i.group.add(n)}return i.pose={moving:0,sprinting:!1,attacking:!1,attackProgress:0,blocking:!1,casting:!1,castProgress:0,dodging:!1,dodgeProgress:0,hurt:0,dead:!1,deadProgress:0,time:Math.random()*10},i}function nv(a,e,t){const i=a.pose;i.time+=e,i.moving=0,er(a,e)}function sv(a="#f4d58d"){const e=new Te,t=new H(new Zt(.28,0),new De({color:a}));e.add(t);const i=ri(a,2.4,.65);e.add(i);const n=new H(new Tt(.5,.02,4,32),new De({color:a,transparent:!0,opacity:.5,blending:ft}));return n.rotation.x=Math.PI/2,e.add(n),e.userData.gem=t,e.userData.ring=n,e}const av=(a,e,t)=>new I(a,e,t);class rv{constructor(e,t){this.game=e,this.regionId=t,this.region=Mt[t],this.scene=new Zo,this.scene.fog=new Qs(this.region.palette.fog,this.region.palette.fogDensity),this.colliders=[],this.interactables=[],this.npcSpawns=[],this.enemySpawns=[],this.creatureSpawns=[],this.landmarks={},this.markers=[],this.dynamic=[],this.rng=tn(t==="valdoria"?817:t==="drakmor"?991:1201),this.time=0,this.camera=e.camera,this.build()}heightAt(e,t){if(this.regionId==="valdoria"){const r=Math.hypot(e,t),o=Math.hypot(e-58,t+38);let c=Math.sin(e*.035)*1.2*Math.cos(t*.031)+Math.sin(e*.082+t*.047)*.55+Math.cos(e*.13)*Math.sin(t*.11)*.28;c+=Math.max(0,Math.hypot(e,t)-58)*.055,c=Rn(.12,c,dn(8,24,r)),c=Rn(1.45,c,dn(9,22,o));const l=Math.hypot(e+60,t-54);return c-=(1-dn(10,26,l))*2.2,c}if(this.regionId==="drakmor"){const r=Math.hypot(e+58,t-48),o=Math.hypot(e-25,t+30);let c=Math.sin(e*.055+1.2)*1.4*Math.cos(t*.041)+Math.sin(e*.13)*Math.sin(t*.09)*.75+Math.abs(Math.sin(e*.022+t*.031))*1.1;c+=Math.max(0,Math.hypot(e,t)-48)*.07,c=Rn(.25,c,dn(8,24,r)),c=Rn(.5,c,dn(16,34,o));const l=Math.hypot(e-55,t-50);return c-=(1-dn(8,22,l))*3.5,c}const i=Math.hypot(e+56,t-48),n=Math.hypot(e,t);let s=Math.sin(e*.03)*1+Math.cos(t*.037)*.9+Math.sin(e*.08+t*.06)*.3;return s+=Math.max(0,Math.hypot(e,t)-45)*.04,s=Rn(.4,s,dn(9,25,i)),s=Rn(.9,s,dn(18,38,n)),s}addCollider(e,t,i){this.colliders.push({x:e,z:t,r:i})}build(){this.buildSky(),this.buildLights(),this.buildTerrain(),this.buildRoads(),this.buildAmbientParticles(),this.regionId==="valdoria"&&this.buildValdoria(),this.regionId==="drakmor"&&this.buildDrakmor(),this.regionId==="kansordore"&&this.buildKansordore(),this.buildLore(),this.buildWaystones()}buildSky(){const e=this.region.palette,t=new Gi(280,32,20),i=new Vi({side:Vt,depthWrite:!1,fog:!1,uniforms:{topColor:{value:new Ce(e.skyTop)},bottomColor:{value:new Ce(e.skyBottom)},sunColor:{value:new Ce(e.sun)},sunDir:{value:new I(...e.sunPos).normalize()},offset:{value:12},exponent:{value:.82}},vertexShader:`
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 sunColor;
        uniform vec3 sunDir;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          vec3 dir = normalize(vWorldPosition);
          float h = max(0.0, dir.y + offset * 0.01);
          vec3 col = mix(bottomColor, topColor, pow(h, exponent));
          float sun = pow(max(dot(dir, normalize(sunDir)), 0.0), 220.0);
          float halo = pow(max(dot(dir, normalize(sunDir)), 0.0), 9.0);
          col += sunColor * sun * 1.7 + sunColor * halo * 0.16;
          float horizon = pow(1.0 - abs(dir.y), 5.0);
          col += bottomColor * horizon * 0.1;
          gl_FragColor = vec4(col, 1.0);
        }
      `}),n=new H(t,i);n.frustumCulled=!1,this.scene.add(n),this.sky=n;const s=ri(e.sun,32,.42);if(s.position.copy(new I(...e.sunPos).normalize().multiplyScalar(230)),this.scene.add(s),this.regionId==="kansordore"){const o=tn(88),c=[],l=[];for(let u=0;u<900;u++){const f=o()*Le,p=Math.acos(o()*.9),v=240;c.push(v*Math.sin(p)*Math.cos(f),v*Math.cos(p),v*Math.sin(p)*Math.sin(f));const g=new Ce(o()>.7?"#ffd9f0":"#c9e7ff");l.push(g.r,g.g,g.b)}const d=new Ct;d.setAttribute("position",new Qe(c,3)),d.setAttribute("color",new Qe(l,3));const h=new Uo(d,new Za({size:1.4,vertexColors:!0,transparent:!0,opacity:.8,depthWrite:!1,blending:ft,sizeAttenuation:!0}));h.frustumCulled=!1,this.scene.add(h),this.stars=h}const r=new Nn({map:Kg(),transparent:!0,opacity:this.regionId==="drakmor"?.15:.2,depthWrite:!1,color:this.regionId==="drakmor"?"#7a4040":"#ffffff"});this.clouds=[];for(let o=0;o<14;o++){const c=new ls(r.clone()),l=40+this.rng()*50;c.scale.set(l,l*.42,1),c.position.set((this.rng()-.5)*300,40+this.rng()*45,(this.rng()-.5)*300),c.material.opacity=.08+this.rng()*.15,this.scene.add(c),this.clouds.push(c)}}buildLights(){const e=this.region.palette,t=new il(e.hemiSky,e.hemiGround,e.hemiIntensity);this.scene.add(t);const i=new fs(e.sun,e.sunIntensity);i.position.set(...e.sunPos),i.castShadow=!0,i.shadow.mapSize.set(1536,1536),i.shadow.camera.near=1,i.shadow.camera.far=190;const n=68;i.shadow.camera.left=-n,i.shadow.camera.right=n,i.shadow.camera.top=n,i.shadow.camera.bottom=-n,i.shadow.bias=-.0012,i.shadow.normalBias=.02,this.scene.add(i),this.sun=i;const s=new fs(e.accent2,.32);s.position.set(-40,24,-30),this.scene.add(s)}buildTerrain(){const e=this.region.palette,t=220,i=96,n=new Mi(t,t,i,i);n.rotateX(-Math.PI/2);const s=n.attributes.position,r=[],o=new Ce(e.low),c=new Ce(e.mid),l=new Ce(e.high),d=tn(this.regionId==="valdoria"?42:this.regionId==="drakmor"?73:104);for(let p=0;p<s.count;p++){const v=s.getX(p),g=s.getZ(p),m=this.heightAt(v,g);s.setY(p,m);const _=d()*.12,M=Je((m+2)/5,0,1),y=M<.55?o.clone().lerp(c,M/.55):c.clone().lerp(l,(M-.55)/.45);y.offsetHSL((_-.06)*.03,_*.06,(_-.06)*.05),r.push(y.r,y.g,y.b)}n.setAttribute("color",new Qe(r,3)),n.computeVertexNormals();const h=new Fs({vertexColors:!0,gradientMap:Os()}),u=new H(n,h);u.receiveShadow=!0,u.castShadow=!1,this.scene.add(u),this.terrain=u;const f=new H(new Jt(150,142,3,64,1,!0),new De({color:e.low,side:Vt}));f.position.y=-1.4,this.scene.add(f)}buildRoads(){const e=this.region.palette,t=new Ni({color:e.path,roughness:1,metalness:0});let i=[];this.regionId==="valdoria"?i=[[{x:0,z:10},{x:4,z:-10},{x:20,z:-20},{x:42,z:-28},{x:58,z:-38}],[{x:0,z:0},{x:-22,z:15},{x:-42,z:32},{x:-56,z:46}],[{x:0,z:0},{x:20,z:22},{x:34,z:44},{x:46,z:62}]]:this.regionId==="drakmor"?i=[[{x:-58,z:48},{x:-42,z:30},{x:-20,z:10},{x:2,z:-4},{x:16,z:-12},{x:25,z:-24}],[{x:25,z:-24},{x:42,z:-12},{x:55,z:10},{x:60,z:30}]]:i=[[{x:-56,z:48},{x:-42,z:30},{x:-25,z:18},{x:-12,z:8},{x:0,z:2}],[{x:0,z:2},{x:22,z:-10},{x:32,z:-28},{x:30,z:-48},{x:8,z:-62}],[{x:0,z:2},{x:-22,z:-10},{x:-34,z:-26},{x:-28,z:-46},{x:-8,z:-60}]];for(const n of i)this.scene.add(this.makeRibbon(n,3.2,t))}makeRibbon(e,t,i){const n=new Sd(e.map(d=>av(d.x,0,d.z))),s=60,r=[],o=[];for(let d=0;d<=s;d++){const h=d/s,u=n.getPoint(h),f=n.getTangent(h).normalize(),p=-f.z,v=f.x,g=t/2;for(const m of[-1,1]){const _=u.x+p*g*m,M=u.z+v*g*m;r.push(_,this.heightAt(_,M)+.06,M)}if(d<s){const m=d*2;o.push(m,m+1,m+2,m+1,m+3,m+2)}}const c=new Ct;c.setAttribute("position",new Qe(r,3)),c.setIndex(o),c.computeVertexNormals();const l=new H(c,i);return l.receiveShadow=!0,l}buildAmbientParticles(){this.region.palette;const e=this.regionId==="kansordore"?260:this.regionId==="drakmor"?220:170,t=new Float32Array(e*3),i=[];for(let c=0;c<e;c++){const l=(this.rng()-.5)*150,d=(this.rng()-.5)*150;t[c*3]=l,t[c*3+1]=this.heightAt(l,d)+.4+this.rng()*6,t[c*3+2]=d,i.push({x:l,z:d,base:t[c*3+1],phase:this.rng()*Le,speed:.2+this.rng()*.5})}const n=new Ct;n.setAttribute("position",new Oi(t,3));const s=this.regionId==="drakmor"?"#ff8a4a":this.regionId==="kansordore"?"#9ef0ff":"#fff0b8",r=new Za({color:s,size:this.regionId==="kansordore"?.24:.18,map:al(),transparent:!0,opacity:.75,depthWrite:!1,blending:ft,sizeAttenuation:!0}),o=new Uo(n,r);this.scene.add(o),this.motes={points:o,seeds:i,positions:t}}buildValdoria(){this.region.palette,this.landmarks.village={x:0,z:0,name:"Lumen"},this.landmarks.shrine={x:58,z:-38,name:"Santuario del Alba"},this.landmarks.lake={x:-60,z:54,name:"Lago Espejo"},this.landmarks.ruins={x:42,z:58,name:"Ruinas de Vael"},this.buildVillage(),this.buildShrine(),this.buildLake(),this.buildRuins(),this.scatterTrees(72,"valdoria"),this.scatterRocks(32),this.scatterGrass(420,"#7f9c5d"),this.scatterFlowers(120),this.npcSpawns.push({id:"lyra",x:4,z:5,rotation:-.5,name:"Lyra",title:"Erudita del Velo"},{id:"nima",x:-8,z:-4,rotation:.7,name:"Nima",title:"Susurradora de ecos"},{id:"mira",x:10,z:-3,rotation:-2.2,name:"Anciana Mira",title:"Memoria de Lumen"},{id:"orin",x:-11,z:8,rotation:1.1,name:"Orin",title:"Forjador"}),this.enemySpawns.push({type:"sombra",x:24,z:-16,level:1,quest:!0,respawn:!0},{type:"sombra",x:-26,z:20,level:1,quest:!0,respawn:!0},{type:"sombra",x:34,z:16,level:2,quest:!0,respawn:!0},{type:"sombra",x:-36,z:-18,level:2,quest:!0,respawn:!0},{type:"lobo",x:48,z:6,level:3,respawn:!0},{type:"lobo",x:-48,z:-10,level:3,respawn:!0},{type:"golem",x:30,z:52,level:4,respawn:!0}),this.creatureSpawns.push({species:"lumi",x:28,z:18},{species:"lumi",x:-18,z:-34},{species:"brotin",x:-30,z:-30},{species:"brotin",x:48,z:38},{species:"zefiro",x:48,z:22},{species:"zefiro",x:-44,z:6}),this.addBrazier(-5,-9,"brazier_1"),this.addBrazier(13,9,"brazier_2"),this.addBrazier(-13,12,"brazier_3"),this.addChest(36,58,"chest_val_1",{essence:3,potion:1}),this.addChest(-54,-34,"chest_val_2",{fragments:2,essence:2}),this.addChest(70,12,"chest_val_3",{potion:2,fragments:3}),this.addCampfire(-20,10)}buildVillage(){const e=this.region.palette,t=["#d8c9a8","#cdbd9a","#e0d2b3","#c9b894"],i=["#6b4d3a","#78513c","#5f4637","#7c5a43"];[{x:-11,z:-12,r:.2,w:5,d:4.2},{x:12,z:-12,r:-.35,w:5.5,d:4.5},{x:-17,z:2,r:1.1,w:4.6,d:4.2},{x:17,z:4,r:-1.25,w:5,d:4.4},{x:-5,z:15,r:2.8,w:4.4,d:3.8},{x:7,z:16,r:3.4,w:4.8,d:4.2}].forEach((M,y)=>this.addHouse(M.x,M.z,M.r,M.w,M.d,t[y%4],i[y%4]));const s=0,r=0,o=this.heightAt(s,r),c=new Te;c.position.set(s,o,r);const l=Ze(2.1,2.4,.6,Pe("#a8a08a",{roughness:.9}),16);l.position.y=.3,c.add(l);const d=new H(new Qi(1.85,32),new Ni({color:e.water,transparent:!0,opacity:.8,roughness:.1,metalness:.1}));d.rotation.x=-Math.PI/2,d.position.y=.64,c.add(d);const h=Ze(.35,.55,2.6,Pe("#c0b69c"),8);h.position.y=1.7,c.add(h);const u=new Te;u.position.y=3.1;const f=Ze(.22,.34,1.1,Pe("#d6cdb3"),7);u.add(f);const p=xt(.23,Pe("#d6cdb3"),8);p.position.y=.72,u.add(p);const v=new H(new vt(.55,1.3,3),new Ni({color:"#e8dfc3",side:pt,transparent:!0,opacity:.9}));v.position.set(0,.6,-.2),v.rotation.z=Math.PI,u.add(v),c.add(u);const g=st(c,e.accent,3,[0,1.4,0],.35);g.material.opacity=.3,this.scene.add(c),this.addCollider(s,r,2.5),this.landmarks.fountain={x:s,z:r};for(const M of[-1,1]){const y=new Te,A=M*7.5,E=-7;y.position.set(A,this.heightAt(A,E),E);const x=Fe(2.2,.8,1,Pe("#7b563c"));x.position.y=.4,y.add(x);for(const L of[-.9,.9]){const C=Ze(.04,.04,2.2,Pe("#6b4b32"),5);C.position.set(L,1.1,-.4),y.add(C)}const w=new H(new vt(1.7,.7,4),new Ni({color:M>0?"#8f3f4f":"#3f6a73",roughness:.9}));w.position.y=2.25,w.rotation.y=Math.PI/4,y.add(w),this.scene.add(y),this.addCollider(A,E,1.6)}const m=new Te;m.position.set(0,this.heightAt(0,8),8);const _=Fe(2.2,1.5,.12,Pe("#6b4a32"));_.position.y=1.35,m.add(_);for(const M of[-1,1]){const y=Ze(.06,.08,1.8,Pe("#5a3e2b"),5);y.position.set(M*.8,.9,0),m.add(y)}for(let M=0;M<4;M++){const y=Fe(.3,.38,.01,new De({color:M%2?"#f1e4c2":"#e4d4ad"}));y.position.set(-.6+M%2*.9,1.45-Math.floor(M/2)*.4,.08),y.rotation.z=(M-1.5)*.05,m.add(y)}this.scene.add(m),this.addCollider(0,8,1.1);for(const[M,y]of[[-6,3],[7,-4],[-4,-8],[11,10]]){const A=this.makeLampPost(M,y,e.accent);this.scene.add(A),this.addCollider(M,y,.4)}}addHouse(e,t,i,n,s,r,o){const c=this.heightAt(e,t),l=new Te;l.position.set(e,c,t),l.rotation.y=i;const d=Pe(r,{roughness:.95}),h=Pe("#5d3e2c"),u=Pe(o,{roughness:.9}),f=Fe(n+.5,.5,s+.5,Pe("#8b816c"));f.position.y=.25,l.add(f);const p=Fe(n,2.8,s,d);p.position.y=1.75,l.add(p);for(const w of[-1,1])for(const L of[-1,1]){const C=Fe(.16,2.9,.16,h);C.position.set(w*(n/2-.08),1.75,L*(s/2-.08)),l.add(C)}const v=Fe(n+.12,.18,.18,h);v.position.set(0,3.12,s/2-.06),l.add(v);const g=v.clone();g.position.z=-s/2+.06,l.add(g);const m=new H(new vt(Math.max(n,s)*.78,2.3,4),u);m.position.y=4.2,m.rotation.y=Math.PI/4,m.castShadow=!0,l.add(m);const _=Fe(1,1.9,.12,Pe("#4b3023"));_.position.set(0,1.2,s/2+.06),l.add(_);const M=Fe(1.3,.16,.16,h);M.position.set(0,2.2,s/2+.06),l.add(M);for(const w of[-1,1]){const L=Fe(.65,.65,.08,new De({color:"#ffd98a"}));L.position.set(w*(n*.28),1.85,s/2+.07),l.add(L);const C=Fe(.78,.78,.03,h);C.position.set(w*(n*.28),1.85,s/2+.03),l.add(C)}const y=Fe(.55,1.6,.55,Pe("#8d7b66"));y.position.set(n*.28,4.3,-s*.2),l.add(y);const A=Ze(.035,.035,2.2,Pe("#5a3e2b"),5);A.position.set(-n/2+.15,3.5,s/2+.2),l.add(A);const E=new H(new Mi(.9,1.5,2,4),new Ni({color:"#355e78",side:pt,roughness:.9}));E.position.set(-n/2+.15,3.4,s/2+.25),E.rotation.y=.1,l.add(E);const x=new H(new Ci(.16,.22,12),new De({color:"#f4d58d",side:pt}));x.position.set(-n/2+.15,3.55,s/2+.3),l.add(x),this.dynamic.push({type:"banner",mesh:E,phase:this.rng()*Le}),ts(l,!0,!0),this.scene.add(l),this.addCollider(e,t,Math.max(n,s)*.62)}makeLampPost(e,t,i){const n=new Te;n.position.set(e,this.heightAt(e,t),t);const s=Ze(.07,.11,2.4,Pe("#4f4038"),6);s.position.y=1.2,n.add(s);const r=Fe(.7,.08,.08,Pe("#4f4038"));r.position.set(.28,2.35,0),n.add(r);const o=new H(new Jt(.22,.15,.5,6,1,!0),Pe("#3d3632"));o.position.set(.55,2.1,0),n.add(o);const c=ri(i,1.6,.8);return c.position.set(.55,2.1,0),n.add(c),this.dynamic.push({type:"lamp",mesh:c,phase:this.rng()*Le}),n}buildShrine(){const i=this.heightAt(58,-38);this.landmarks.shrine={x:58,z:-38,name:"Santuario del Alba",y:i};const n=new Te;n.position.set(58,i,-38);const s=Pe("#b7b09a",{roughness:.9}),r=Pe("#6f6a5c",{roughness:.95}),o=Pe("#d8bd77",{metalness:.6,roughness:.35}),c=Ze(13,14,1.2,s,8);c.position.y=.6,n.add(c);const l=Ze(10.5,11.5,.5,r,8);l.position.y=1.25,n.add(l);for(let M=0;M<3;M++){const y=Ze(7.4-M*.9,8.2-M*.9,.34,s,8);y.position.y=1.5+M*.34,n.add(y)}const d=Ze(5.3,5.8,.8,r,8);d.position.y=2.75,n.add(d);const h=Fe(2,1.25,1.2,s);h.position.y=3.75,n.add(h);const u=Fe(2.3,.16,1.45,o);u.position.y=4.4,n.add(u);const f=new H(new Zt(.42,0),new De({color:"#9ef0ff"}));f.position.y=5.2,n.add(f),st(n,"#9ef0ff",4.5,[0,5.2,0],.55),this.dynamic.push({type:"crystal",mesh:f,baseY:5.2,phase:0});const p=new H(new Ci(6.2,7.2,64),new De({color:"#9ef0ff",transparent:!0,opacity:.5,side:pt,blending:ft,depthWrite:!1}));p.rotation.x=-Math.PI/2,p.position.y=3.1,n.add(p),this.dynamic.push({type:"runeRing",mesh:p,phase:0});const v=[];for(let M=0;M<6;M++){const y=M/6*Le+Math.PI/6;v.push([Math.cos(y)*8.4,Math.sin(y)*8.4])}for(const[M,y]of v){const A=Ze(.55,.72,6.2,s,6);A.position.set(M,4.3,y),n.add(A);const E=Fe(1.35,.32,1.35,o);E.position.set(M,7.35,y),n.add(E);const x=Fe(1.5,.35,1.5,r);x.position.set(M,1.4,y),n.add(x),this.addCollider(58+M,-38+y,.9)}const g=Pe("#9a927e",{roughness:.95});for(const M of[-1,1]){const y=Fe(1.1,5.8,1.1,g);y.position.set(M*3.1,5.1,-3.8),n.add(y)}const m=Fe(7.2,.9,1,g);m.position.set(0,8,-3.8),m.rotation.z=.03,n.add(m),this.addCollider(58-3.1,-38-3.8,.8),this.addCollider(58+3.1,-38-3.8,.8);const _=[[47,-36,"lamp_shrine_1"],[69,-36,"lamp_shrine_2"],[58,-26,"lamp_shrine_3"]];for(const[M,y,A]of _){const E=this.addLamp(M,y,A,"Lámpara del Alba");E.group.position.y=this.heightAt(M,y)}ts(n,!0,!0),this.scene.add(n),this.shrineGroup=n,this.addCollider(58,-38,5.2);for(let M=0;M<8;M++){const y=M/8*Le,A=58+Math.cos(y)*17,E=-38+Math.sin(y)*17,x=new H(new ki(1.1,0),Pe("#8d8978"));x.position.set(A,this.heightAt(A,E)+.4,E),x.scale.y=1.8,x.castShadow=!0,this.scene.add(x),this.addCollider(A,E,1.2)}}buildLake(){const i=new H(new Qi(22,48),new Vi({transparent:!0,uniforms:{uTime:{value:0},uColor:{value:new Ce("#4ba8b8")},uDeep:{value:new Ce("#1b5f74")}},vertexShader:`
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            vUv = uv;
            vec3 p = position;
            float w = sin(p.x * 0.35 + uTime * 1.2) * 0.06 + cos(p.y * 0.4 + uTime * 0.9) * 0.05;
            p.z += w;
            vWave = w;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,fragmentShader:`
          uniform float uTime;
          uniform vec3 uColor;
          uniform vec3 uDeep;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            vec2 p = vUv - 0.5;
            float r = length(p) * 2.0;
            float ripple = sin(r * 38.0 - uTime * 2.2) * 0.5 + 0.5;
            vec3 col = mix(uDeep, uColor, 0.45 + ripple * 0.12 + vWave * 2.0);
            float edge = smoothstep(0.72, 0.98, r);
            col = mix(col, uDeep * 1.2, edge * 0.7);
            gl_FragColor = vec4(col, 0.78);
          }
        `}));i.rotation.x=-Math.PI/2,i.position.set(-60,-.15,54),this.scene.add(i),this.water=i,this.addCollider(-60,54,20);const n=new Te;n.position.set(-42,this.heightAt(-42,48),48);for(let s=0;s<7;s++){const r=Fe(1.2,.14,4.5,Pe("#6b4a32"));r.position.set(-s*1,.1,0),n.add(r)}for(const s of[-1,1])for(let r=0;r<3;r++){const o=Ze(.1,.12,1.2,Pe("#5a3e2b"),5);o.position.set(-r*2.1,.5,s*2.1),n.add(o)}this.scene.add(n);for(let s=0;s<28;s++){const r=this.rng()*Le,o=18+this.rng()*6,c=-60+Math.cos(r)*o,l=54+Math.sin(r)*o,d=new H(new vt(.06,1.2+this.rng()*.8,3),Pe("#5f7a4a"));d.position.set(c,this.heightAt(c,l)+.5,l),this.scene.add(d)}}buildRuins(){const i=this.heightAt(42,58),n=new Te;n.position.set(42,i,58);const s=Pe("#8d8978",{roughness:.95});for(let o=0;o<4;o++){const c=Fe(8-o*.5,3.4+o*.2,.9,s);if(c.position.set(0,1.7,-4+o*2.6),c.rotation.z=o%2?-.04:.03,n.add(c),o<3){const l=Fe(2.2,2.2,1,new De({color:"#171a20"}));l.position.set(-2.3+o*1.3,1.2,-4+o*2.6+.51),n.add(l)}}for(let o=0;o<5;o++){const c=-7+o*3.5,l=Ze(.45,.55,4.5+o%3*.8,s,6);l.position.set(c,2.2,5),l.rotation.z=o%2?.08:-.04,n.add(l),this.addCollider(42+c,63,.7)}const r=new H(new Tt(3.2,.45,5,12,Math.PI),s);r.position.set(0,5.2,5),r.rotation.z=Math.PI,n.add(r),st(n,"#7ee8fa",3.2,[0,2.5,3],.2),ts(n,!0,!0),this.scene.add(n),this.addCollider(42,58,4.2),this.addChest(49,56,"chest_ruins",{fragments:3,potion:1})}buildDrakmor(){this.region.palette,this.landmarks.camp={x:-58,z:48,name:"Campamento de Ceniza"},this.landmarks.fortress={x:25,z:-30,name:"Fortaleza de Ceniza"},this.landmarks.caldera={x:58,z:52,name:"Caldera de Ceniza"},this.landmarks.gate={x:25,z:-7,name:"Puerta de Obsidiana"},this.buildDrakmorCamp(),this.buildFortress(),this.buildCaldera(),this.scatterDeadTrees(44),this.scatterRocks(46),this.scatterLavaCracks(26),this.npcSpawns.push({id:"kael",x:-58,z:45,rotation:.4,name:"Kael",title:"Caballero de Ceniza"}),this.enemySpawns.push({type:"lobo",x:-30,z:26,level:5,respawn:!0},{type:"lobo",x:-10,z:34,level:5,respawn:!0},{type:"lobo",x:44,z:12,level:6,respawn:!0},{type:"guardia",x:25,z:-7,level:6,quest:!0,respawn:!1},{type:"guardia",x:18,z:-14,level:6,quest:!0,respawn:!1},{type:"guardia",x:33,z:-14,level:6,quest:!0,respawn:!1},{type:"golem",x:60,z:10,level:7,respawn:!0},{type:"devorador",x:58,z:52,level:8,elite:!0,quest:"deuda",respawn:!1}),this.creatureSpawns.push({species:"ascua",x:-18,z:12},{species:"ascua",x:44,z:34},{species:"obsidiano",x:48,z:-8},{species:"obsidiano",x:-42,z:16},{species:"aullador",x:-38,z:-24},{species:"aullador",x:58,z:26}),this.addChest(14,30,"chest_drak_1",{essence:4,fragments:3}),this.addChest(68,-18,"chest_drak_2",{potion:2,fragments:4}),this.addChest(-70,-12,"chest_drak_3",{essence:4,fragments:3})}buildDrakmorCamp(){const i=this.heightAt(-58,48),n=new Te;n.position.set(-58,i,48);const s=Pe("#5d2f2f",{roughness:.95}),r=Pe("#332527"),o=Pe("#4a342b");for(const[f,p,v]of[[-5,-3,.4],[4,-4,-.6],[7,3,.9]]){const g=new Te;g.position.set(f,0,p),g.rotation.y=v;const m=new H(new vt(2.4,3.2,4),s);m.position.y=1.6,m.castShadow=!0,g.add(m);const _=new H(new Qi(.8,8),new De({color:"#1a1012"}));_.position.set(0,1,1.3),g.add(_),n.add(g),this.addCollider(-58+f,48+p,1.6)}const c=new Te;c.position.set(0,0,0);const l=new H(new Tt(1.2,.22,5,12),r);l.rotation.x=Math.PI/2,l.position.y=.15,c.add(l);const d=ri("#ff8a4a",3,.85);d.position.y=1,c.add(d),this.dynamic.push({type:"fire",mesh:d,phase:0});for(let f=0;f<8;f++){const p=Ze(.1,.14,1.5,o,5);p.position.set(Math.cos(f/8*Le)*.7,.25,Math.sin(f/8*Le)*.7),p.rotation.z=Math.PI/2,p.rotation.y=f/8*Le,c.add(p)}n.add(c);const h=new H(new Mi(1.8,3.2),new Ni({color:"#8f2f2f",side:pt}));h.position.set(-9,2.2,0),n.add(h);const u=Ze(.06,.08,4.8,o,5);u.position.set(-9,2.4,0),n.add(u),this.scene.add(n),this.landmarks.camp.y=i,this.addCollider(-58,48,1.8)}buildFortress(){const i=this.heightAt(25,-30),n=new Te;n.position.set(25,i,-30);const s=Pe("#3e3236",{roughness:.92}),r=Pe("#241b20");new De({color:"#ff6b3d"});for(const p of[-1,1]){const v=Fe(10,8,2.2,s);v.position.set(p*11.5,4,18),n.add(v),this.addCollider(25+p*11.5,-12,4.6);const g=Ze(2.2,2.8,13,s,8);g.position.set(p*17,6.5,18),n.add(g);const m=Kd(2.8,3.2,r,8);m.position.set(p*17,14,18),n.add(m),this.addCollider(25+p*17,-12,2.4)}const o=Fe(14,2.4,2.4,s);o.position.set(0,8.2,18),n.add(o);const c=new H(new Mi(11,7),new De({color:"#ff5b2e",transparent:!0,opacity:.16,side:pt,blending:ft,depthWrite:!1}));c.position.set(0,4,18.2),n.add(c),this.dynamic.push({type:"gateGlow",mesh:c,phase:0});for(const p of[-1,1]){const v=Fe(2.2,7,24,s);v.position.set(p*17,3.5,6),n.add(v),this.addCollider(25+p*17,-24,5)}const l=Fe(18,14,16,s);l.position.set(0,7,-8),n.add(l),this.addCollider(25,-38,9);const d=Fe(20,1.2,18,r);d.position.set(0,14.2,-8),n.add(d);for(let p=0;p<5;p++){const v=Fe(1.6,2.2,1.6,s);v.position.set(-8+p*4,15.2,-15.5),n.add(v)}const h=Ze(7,8,1.2,r,8);h.position.set(0,.6,6),n.add(h);const u=Fe(3.4,5,2.4,s);u.position.set(0,3.4,2),n.add(u);const f=new H(new Ci(2.6,3.2,32),new De({color:"#ff8a4a",transparent:!0,opacity:.55,side:pt,blending:ft}));f.rotation.x=-Math.PI/2,f.position.set(0,1.35,6),n.add(f),this.dynamic.push({type:"runeRing",mesh:f,phase:0});for(const p of[-1,1])for(let v=0;v<3;v++){const g=Ze(.8,1,7,s,6);g.position.set(p*9,3.5,8-v*7),n.add(g),this.addCollider(25+p*9,-22-v*7,1.1);const m=ri("#ff6b3d",2,.6);m.position.set(p*9,7.4,8-v*7),n.add(m),this.dynamic.push({type:"fire",mesh:m,phase:this.rng()*Le})}ts(n,!0,!0),this.scene.add(n),this.fortressGroup=n,this.landmarks.fortress.y=i,this.landmarks.fortress.arena={x:25,z:-24}}buildCaldera(){const i=this.heightAt(58,52),n=new Te;n.position.set(58,i,52);const s=Pe("#2b2226"),r=new H(new Tt(9,1.4,5,16),s);r.rotation.x=Math.PI/2,r.position.y=.4,n.add(r);const o=new H(new Qi(8,32),new De({color:"#ff5b2e"}));o.rotation.x=-Math.PI/2,o.position.y=.55,n.add(o),st(n,"#ff5b2e",12,[0,1.5,0],.25),this.scene.add(n),this.addCollider(58,52,8),this.landmarks.caldera.y=i}buildKansordore(){this.region.palette,this.landmarks.spawn={x:-56,z:48,name:"Umbral de Kansordore"},this.landmarks.archive={x:0,z:0,name:"Archivo Prohibido"},this.landmarks.summit={x:0,z:-62,name:"Cumbre de la Convergencia"},this.buildArchive(),this.buildSummit(),this.scatterCrystalTrees(54),this.scatterRocks(30),this.scatterGrass(220,"#b9b5cf"),this.scatterFloatingRocks(24),this.npcSpawns.push({id:"lyra",x:-54,z:44,rotation:.4,name:"Lyra",title:"Erudita del Velo"}),this.enemySpawns.push({type:"centinela",x:-34,z:-8,level:9,quest:!0,respawn:!1,seal:"seal_1"},{type:"centinela",x:34,z:-8,level:9,quest:!0,respawn:!1,seal:"seal_2"},{type:"centinela",x:0,z:-40,level:9,quest:!0,respawn:!1,seal:"seal_3"},{type:"sombra",x:-24,z:24,level:9,respawn:!0},{type:"sombra",x:24,z:22,level:9,respawn:!0},{type:"lobo",x:42,z:34,level:10,respawn:!0},{type:"golem",x:-44,z:10,level:10,respawn:!0}),this.creatureSpawns.push({species:"prisma",x:26,z:8},{species:"prisma",x:-30,z:34},{species:"crono",x:44,z:-26},{species:"crono",x:-46,z:-30},{species:"serafin",x:0,z:-52}),this.addChest(30,38,"chest_kan_1",{essence:5,fragments:5}),this.addChest(-42,32,"chest_kan_2",{potion:3,fragments:4}),this.addChest(48,-40,"chest_kan_3",{essence:5,fragments:6});const e=[{id:"seal_1",x:-34,z:-8,color:"#9ef0ff"},{id:"seal_2",x:34,z:-8,color:"#ffd9f0"},{id:"seal_3",x:0,z:-40,color:"#c6b7ff"}];for(const t of e)this.addSeal(t)}buildArchive(){const i=this.heightAt(0,0),n=new Te;n.position.set(0,i,0);const s=Pe("#c8c3d9",{roughness:.85}),r=Pe("#d8bd77",{metalness:.65,roughness:.35}),o=Pe("#5d5877"),c=Ze(16,18,1.4,s,8);c.position.y=.7,n.add(c);for(let u=0;u<4;u++){const f=Ze(13-u*1.6,14.2-u*1.6,.4,u%2?o:s,8);f.position.y=1.4+u*.4,n.add(f)}const l=Ze(8,9,1.1,o,8);l.position.y=3.4,n.add(l);const d=new H(new Tt(4.2,.35,6,48),r);d.rotation.x=Math.PI/2,d.position.y=6.6,n.add(d),this.dynamic.push({type:"archiveCore",mesh:d,baseY:6.6,phase:0});const h=new H(new Zt(1.3,0),new De({color:"#9ef0ff"}));h.position.y=6.6,n.add(h),st(n,"#9ef0ff",9,[0,6.6,0],.45),this.dynamic.push({type:"crystal",mesh:h,baseY:6.6,phase:1.2});for(let u=0;u<8;u++){const f=u/8*Le,p=Math.cos(f)*11.5,v=Math.sin(f)*11.5,g=Ze(.55,.75,9,s,6);g.position.set(p,5.2,v),n.add(g);const m=Fe(1.5,.4,1.5,r);m.position.set(p,9.8,v),n.add(m),this.addCollider(0+p,0+v,1);const _=new H(new Zt(.18,0),new De({color:"#9ef0ff"}));_.position.set(p,10.6,v),n.add(_),this.dynamic.push({type:"floatRune",mesh:_,baseY:10.6,phase:f})}for(let u=0;u<3;u++){const f=new H(new Tt(7+u*2.2,.08,4,64),new De({color:"#9ef0ff",transparent:!0,opacity:.3,blending:ft}));f.rotation.x=Math.PI/2+(u-1)*.15,f.position.y=5+u*2,n.add(f),this.dynamic.push({type:"orbitRing",mesh:f,speed:.08+u*.03,phase:u})}for(let u=0;u<6;u++){const f=Fe(6-u*.3,.35,1.3,s);f.position.set(0,.3+u*.35,18-u*1.1),n.add(f)}ts(n,!0,!0),this.scene.add(n),this.landmarks.archive.y=i,this.addCollider(0,0,6.2)}buildSummit(){const i=this.heightAt(0,-62),n=new Te;n.position.set(0,i,-62);const s=Pe("#d5d0e2",{roughness:.8}),r=Pe("#d8bd77",{metalness:.65,roughness:.35}),o=Ze(15,18,2.2,s,8);o.position.y=1.1,n.add(o);const c=new H(new Tt(11,.7,6,64),r);c.rotation.x=Math.PI/2,c.position.y=3.6,n.add(c),this.dynamic.push({type:"orbitRing",mesh:c,speed:.12,phase:0});const l=new H(new Zt(2.2,0),new De({color:"#fff0a8"}));l.position.y=6.5,n.add(l),st(n,"#fff0a8",14,[0,6.5,0],.5),this.dynamic.push({type:"crystal",mesh:l,baseY:6.5,phase:.5});for(let d=0;d<6;d++){const h=d/6*Le,u=Math.cos(h)*13,f=Math.sin(h)*13,p=Ze(.4,.55,6.5,s,6);p.position.set(u,4.2,f),n.add(p),this.addCollider(0+u,-62+f,.7)}ts(n,!0,!0),this.scene.add(n),this.landmarks.summit.y=i,this.addCollider(0,-62,7)}addSeal(e){const t=this.heightAt(e.x,e.z),i=new Te;i.position.set(e.x,t,e.z);const n=Pe("#b6b1c8"),s=Ze(2.2,2.6,.5,n,6);s.position.y=.25,i.add(s);const r=Ze(.45,.6,2.2,n,6);r.position.y=1.6,i.add(r);const o=new H(new Zt(.5,0),new De({color:e.color}));o.position.y=3.1,i.add(o),st(i,e.color,3,[0,3.1,0],.55);const c=new H(new Tt(1.1,.035,4,32),new De({color:e.color,transparent:!0,opacity:.7}));c.position.y=3.1,c.rotation.x=Math.PI/2,i.add(c),this.scene.add(i),this.dynamic.push({type:"seal",mesh:o,ring:c,baseY:3.1,phase:this.rng()*Le,id:e.id}),this.interactables.push({id:e.id,type:"seal",x:e.x,z:e.z,radius:3,label:"Sello del Archivo",mesh:i,activated:!1}),this.addCollider(e.x,e.z,1.2)}safePoint(e,t,i=5){if(Math.hypot(e,t)<15||this.regionId==="valdoria"&&Math.hypot(e-58,t+38)<18||this.regionId==="valdoria"&&Math.hypot(e+60,t-54)<24||this.regionId==="drakmor"&&Math.hypot(e-25,t+30)<25||this.regionId==="drakmor"&&Math.hypot(e+58,t-48)<14||this.regionId==="kansordore"&&Math.hypot(e,t)<23||this.regionId==="kansordore"&&Math.hypot(e,t+62)<18||this.regionId==="kansordore"&&Math.hypot(e+56,t-48)<14)return!1;for(const n of this.colliders)if(Math.hypot(e-n.x,t-n.z)<n.r+i)return!1;return!0}scatterTrees(e,t){this.region.palette;const i=new Jt(.18,.32,3.2,6),n=Pe("#5b4131"),s=new hs(1.35,0),r=new Fs({color:"#ffffff",gradientMap:Os(),vertexColors:!1}),o=new Rs(i,n,e),c=new Rs(s,r,e*3);o.castShadow=!0,o.receiveShadow=!0,c.castShadow=!0,c.receiveShadow=!0;const l=new At,d=new Ce;let h=0;for(let u=0;u<e;u++){let f,p,v=0;do f=(this.rng()-.5)*170,p=(this.rng()-.5)*170,v++;while(!this.safePoint(f,p,6)&&v<30);const g=this.heightAt(f,p),m=.7+this.rng()*.9;l.position.set(f,g+1.6*m,p),l.rotation.set(0,this.rng()*Le,0),l.scale.set(m,m,m),l.updateMatrix(),o.setMatrixAt(u,l.matrix);for(let _=0;_<3;_++){const M=(.65+this.rng()*.5)*m;l.position.set(f+(this.rng()-.5)*1.1,g+(2.8+this.rng()*1.2)*m,p+(this.rng()-.5)*1.1),l.rotation.set(this.rng()*.4,this.rng()*Le,this.rng()*.4),l.scale.set(M,M*(.8+this.rng()*.3),M),l.updateMatrix(),c.setMatrixAt(h,l.matrix);const y=.24+this.rng()*.08;d.setHSL(y,.35+this.rng()*.15,.32+this.rng()*.14),c.setColorAt(h,d),h++}this.addCollider(f,p,.55*m)}this.scene.add(o,c),this.dynamic.push({type:"trees",mesh:c,phase:this.rng()*Le})}scatterDeadTrees(e){const t=Pe("#2a1e20"),i=new Te;for(let n=0;n<e;n++){let s,r,o=0;do s=(this.rng()-.5)*170,r=(this.rng()-.5)*170,o++;while(!this.safePoint(s,r,5)&&o<30);const c=this.heightAt(s,r),l=.8+this.rng()*.9,d=Ze(.08,.3,3.8*l,t,5);d.position.set(s,c+1.9*l,r),d.rotation.z=(this.rng()-.5)*.3,i.add(d);for(let h=0;h<3;h++){const u=Ze(.03,.1,1.5*l,t,4);u.position.set(s+(this.rng()-.5)*.8,c+3*l,r+(this.rng()-.5)*.8),u.rotation.z=(this.rng()-.5)*1.8,u.rotation.x=(this.rng()-.5)*1.8,i.add(u)}this.addCollider(s,r,.4)}this.scene.add(i)}scatterCrystalTrees(e){const t=Pe("#7e7b9e"),i=new Ni({color:"#c6b7ff",emissive:new Ce("#7a62dc").multiplyScalar(.4),roughness:.25,metalness:.2}),n=new Te;for(let s=0;s<e;s++){let r,o,c=0;do r=(this.rng()-.5)*170,o=(this.rng()-.5)*170,c++;while(!this.safePoint(r,o,5)&&c<30);const l=this.heightAt(r,o),d=.8+this.rng()*1,h=Ze(.1,.2,3.4*d,t,5);h.position.set(r,l+1.7*d,o),n.add(h);for(let u=0;u<3;u++){const f=new H(new Zt(.55*d,0),i);f.position.set(r+(this.rng()-.5)*1.2,l+(3+this.rng()*.8)*d,o+(this.rng()-.5)*1.2),f.rotation.set(this.rng()*Le,this.rng()*Le,0),n.add(f)}this.addCollider(r,o,.5)}this.scene.add(n)}scatterRocks(e){const t=new ki(.8,0),i=new Fs({color:this.regionId==="drakmor"?"#3b2d31":"#8b877a",gradientMap:Os()}),n=new Rs(t,i,e);n.castShadow=!0,n.receiveShadow=!0;const s=new At,r=new Ce;for(let o=0;o<e;o++){let c,l,d=0;do c=(this.rng()-.5)*160,l=(this.rng()-.5)*160,d++;while(!this.safePoint(c,l,4)&&d<25);const h=this.heightAt(c,l),u=.4+this.rng()*1.4;s.position.set(c,h+u*.35,l),s.rotation.set(this.rng()*Le,this.rng()*Le,this.rng()*Le),s.scale.set(u,u*(.6+this.rng()*.6),u),s.updateMatrix(),n.setMatrixAt(o,s.matrix),r.setHSL(this.regionId==="drakmor"?.02:.12,.12,.28+this.rng()*.16),n.setColorAt(o,r),u>.85&&this.addCollider(c,l,u*.8)}this.scene.add(n)}scatterGrass(e,t){const i=new vt(.09,.55,3),n=new Fs({color:"#ffffff",gradientMap:Os()}),s=new Rs(i,n,e),r=new At,o=new Ce;for(let c=0;c<e;c++){let l,d,h=0;do l=(this.rng()-.5)*150,d=(this.rng()-.5)*150,h++;while(Math.hypot(l,d)<14&&h<12);const u=this.heightAt(l,d);r.position.set(l,u+.25,d),r.rotation.set(0,this.rng()*Le,(this.rng()-.5)*.2);const f=.6+this.rng()*1.1;r.scale.set(f,f,f),r.updateMatrix(),s.setMatrixAt(c,r.matrix),o.set(t).offsetHSL((this.rng()-.5)*.05,.05,(this.rng()-.5)*.12),s.setColorAt(c,o)}s.receiveShadow=!0,this.scene.add(s)}scatterFlowers(e){const t=new Gi(.07,4,3),i=new De({color:"#ffffff"}),n=new Rs(t,i,e),s=new At,r=new Ce,o=["#f4d58d","#ff8fb1","#9ef0ff","#f6f1dc"];for(let c=0;c<e;c++){let l,d,h=0;do l=(this.rng()-.5)*110,d=(this.rng()-.5)*110,h++;while(Math.hypot(l,d)<15&&h<12);const u=this.heightAt(l,d);s.position.set(l,u+.35,d),s.scale.setScalar(.8+this.rng()*.8),s.updateMatrix(),n.setMatrixAt(c,s.matrix),r.set(o[Math.floor(this.rng()*o.length)]),n.setColorAt(c,r)}this.scene.add(n)}scatterLavaCracks(e){const t=new De({color:"#ff5b2e"});for(let i=0;i<e;i++){let n,s,r=0;do n=(this.rng()-.5)*150,s=(this.rng()-.5)*150,r++;while(!this.safePoint(n,s,4)&&r<25);const o=Fe(.12+this.rng()*.2,.02,2+this.rng()*5,t);o.position.set(n,this.heightAt(n,s)+.05,s),o.rotation.y=this.rng()*Le,this.scene.add(o)}}scatterFloatingRocks(e){for(let t=0;t<e;t++){const i=(this.rng()-.5)*130,n=(this.rng()-.5)*130,s=this.heightAt(i,n)+4+this.rng()*12,r=new H(new ki(.6+this.rng()*1.4,0),Pe("#a9a5c2",{roughness:.9}));r.position.set(i,s,n),r.rotation.set(this.rng()*Le,this.rng()*Le,this.rng()*Le),this.scene.add(r),this.dynamic.push({type:"floatingRock",mesh:r,baseY:s,phase:this.rng()*Le,speed:.3+this.rng()*.5}),st(r,"#9ef0ff",2.4,[0,0,0],.12)}}addChest(e,t,i,n){const s=this.heightAt(e,t),r=new Te;r.position.set(e,s,t);const o=Pe("#6b442d"),c=Pe("#d8bd77",{metalness:.6,roughness:.3}),l=Fe(1.1,.7,.75,o);l.position.y=.45,r.add(l);const d=Fe(1.15,.32,.8,o);d.position.y=.95,d.rotation.x=0,r.add(d);for(const u of[-1,1]){const f=Fe(.1,.82,.82,c);f.position.set(u*.38,.55,0),r.add(f)}const h=Fe(.18,.24,.08,c);h.position.set(0,.6,.4),r.add(h),st(r,"#f4d58d",1.8,[0,.9,0],.25),this.scene.add(r),this.interactables.push({id:i,type:"chest",x:e,z:t,radius:2.6,label:"Cofre antiguo",mesh:r,lid:d,opened:!1,loot:n}),this.addCollider(e,t,.8)}addBrazier(e,t,i){const n=this.heightAt(e,t),s=new Te;s.position.set(e,n,t);const r=Pe("#7a7264"),o=Ze(.45,.65,.9,r,6);o.position.y=.45,s.add(o);const c=new H(new Jt(.65,.4,.38,8,1,!0),r);c.position.y=1,s.add(c);const l=ri("#ffb347",1.8,0);l.position.y=1.3,s.add(l),this.scene.add(s),this.interactables.push({id:i,type:"brazier",x:e,z:t,radius:2.5,label:"Brasero dormido",mesh:s,flame:l,lit:!1}),this.addCollider(e,t,.7)}addLamp(e,t,i,n){const s=this.heightAt(e,t),r=new Te;r.position.set(e,s,t);const o=Pe("#8d8978"),c=Ze(.6,.9,.5,o,6);c.position.y=.25,r.add(c);const l=Ze(.18,.28,1.2,o,6);l.position.y=1.1,r.add(l);const d=new H(new Jt(.7,.35,.4,8,1,!0),o);d.position.y=1.75,r.add(d);const h=ri("#9ef0ff",2.2,0);h.position.y=2.1,r.add(h),this.scene.add(r);const u={id:i,type:"lamp",x:e,z:t,radius:2.8,label:n,mesh:r,flame:h,lit:!1};return this.interactables.push(u),this.addCollider(e,t,.8),{group:r,item:u}}addCampfire(e,t){const i=this.heightAt(e,t),n=new Te;n.position.set(e,i,t);const s=Pe("#6f6a5c");for(let o=0;o<7;o++){const c=o/7*Le,l=xt(.2,s,5);l.position.set(Math.cos(c)*.8,.2,Math.sin(c)*.8),n.add(l)}const r=ri("#ffb347",2.2,.7);r.position.y=.8,n.add(r),this.dynamic.push({type:"fire",mesh:r,phase:0}),this.scene.add(n)}addWaystone(e,t,i,n){const s=this.heightAt(e,t),r=new Te;r.position.set(e,s,t);const o=Pe("#8d8978"),c=Ze(1.3,1.6,.5,o,6);c.position.y=.25,r.add(c);const l=new H(new Jt(.42,.62,3.6,4),o);l.position.y=2.1,l.rotation.y=Math.PI/4,r.add(l);const d=new H(new Zt(.28,0),new De({color:"#7ee8fa"}));d.position.y=4.1,r.add(d),st(r,"#7ee8fa",2.8,[0,4.1,0],.5),this.scene.add(r),this.interactables.push({id:i,type:"waystone",x:e,z:t,radius:3,label:n,mesh:r,rune:d}),this.addCollider(e,t,1.2)}buildWaystones(){this.regionId==="valdoria"?this.addWaystone(0,16,"waystone_val","Altar de Resonancia"):this.regionId==="drakmor"?this.addWaystone(-58,53,"waystone_drak","Altar de Ceniza"):this.addWaystone(-56,53,"waystone_kan","Altar de los Ecos")}buildLore(){for(const e of sl){if(e.region!==this.regionId)continue;const t=this.heightAt(e.pos.x,e.pos.z),i=new Te;i.position.set(e.pos.x,t,e.pos.z);const n=Fe(.7,.1,.5,Pe("#efe4c9"));n.position.y=1.2,n.rotation.x=.15,i.add(n);const s=Fe(.74,.04,.54,Pe("#7a4b3a"));s.position.y=1.14,s.rotation.x=.15,i.add(s);const r=st(i,"#f4d58d",2.2,[0,1.2,0],.5);r.material.opacity=.4,this.dynamic.push({type:"lore",mesh:i,baseY:t,phase:this.rng()*Le}),this.scene.add(i),this.interactables.push({id:e.id,type:"lore",x:e.pos.x,z:e.pos.z,radius:2.6,label:e.name,mesh:i,data:e}),this.addCollider(e.pos.x,e.pos.z,.4)}}addQuestMarker(){const e=sv("#f4d58d");return e.visible=!1,this.scene.add(e),this.questMarker=e,e}setQuestTarget(e,t=""){if(this.questMarker||this.addQuestMarker(),!e){this.questMarker.visible=!1;return}this.questMarker.position.set(e.x,this.heightAt(e.x,e.z)+4.2,e.z),this.questMarker.visible=!0,this.questMarker.userData.label=t}update(e){this.time+=e;const t=this.time;if(this.water&&(this.water.material.uniforms.uTime.value=t),this.motes){const i=this.motes.positions;for(let n=0;n<this.motes.seeds.length;n++){const s=this.motes.seeds[n];i[n*3+1]=s.base+Math.sin(t*s.speed+s.phase)*1.6,i[n*3]=s.x+Math.cos(t*s.speed*.3+s.phase)*.6}this.motes.points.geometry.attributes.position.needsUpdate=!0}for(const i of this.clouds)i.position.x+=e*.55,i.position.x>170&&(i.position.x=-170);this.stars&&(this.stars.rotation.y+=e*.003);for(const i of this.dynamic)i.type==="banner"?i.mesh.rotation.y=.08+Math.sin(t*1.7+i.phase)*.08:i.type==="lamp"?i.mesh.material.opacity=.55+Math.sin(t*4+i.phase)*.16:i.type==="fire"?(i.mesh.material.opacity=.5+Math.sin(t*7+i.phase)*.22,i.mesh.scale.setScalar(1.6+Math.sin(t*6+i.phase)*.15)):i.type==="crystal"?(i.mesh.rotation.y+=e*.6,i.mesh.position.y=i.baseY+Math.sin(t*1.5+i.phase)*.22):i.type==="runeRing"?(i.mesh.rotation.z+=e*.22,i.mesh.material.opacity=.35+Math.sin(t*2.2)*.12):i.type==="archiveCore"?(i.mesh.rotation.z+=e*.18,i.mesh.position.y=i.baseY+Math.sin(t*.8)*.2):i.type==="orbitRing"?(i.mesh.rotation.z+=e*i.speed,i.mesh.rotation.x=Math.PI/2+Math.sin(t*.5+i.phase)*.12):i.type==="floatRune"?(i.mesh.position.y=i.baseY+Math.sin(t*1.8+i.phase)*.25,i.mesh.rotation.y+=e*.9):i.type==="floatingRock"?(i.mesh.position.y=i.baseY+Math.sin(t*i.speed+i.phase)*.9,i.mesh.rotation.y+=e*.1):i.type==="lore"?(i.mesh.position.y=i.baseY+Math.sin(t*1.5+i.phase)*.08,i.mesh.rotation.y+=e*.3):i.type==="seal"?(i.mesh.position.y=i.baseY+Math.sin(t*2+i.phase)*.18,i.mesh.rotation.y+=e*.7,i.ring.rotation.z+=e*.5):i.type==="gateGlow"&&(i.mesh.material.opacity=.08+Math.sin(t*2)*.04);this.questMarker?.visible&&(this.questMarker.position.y=this.heightAt(this.questMarker.position.x,this.questMarker.position.z)+4.2+Math.sin(t*2.5)*.25,this.questMarker.userData.gem.rotation.y+=e*1.3,this.questMarker.userData.ring.rotation.z+=e*.7,this.questMarker.userData.ring.scale.setScalar(1+Math.sin(t*2)*.05))}getEnemySpawns(){return this.enemySpawns}getCreatureSpawns(){return this.creatureSpawns}getNpcSpawns(){return this.npcSpawns}getInteractables(){return this.interactables}}function ov(a="Aurel"){return{kicker:"PRÓLOGO · EL DESPERTAR",title:"EL JURAMENTO DE LOS CIELOS ROTOS",lines:["Hubo un tiempo en que el cielo no necesitaba sostenerse. Era joven, y nadie había aprendido aún a tenerle miedo.","La Gema Celestial se quebró en tres Fragmentos: uno quedó dormido bajo Valdoria, otro ardió en Drakmor y el último fue escondido en Kansordore, el archivo de los cielos.","La Profecía de Jugador Cero no hablaba de un elegido. Hablaba de alguien que llegaría desde fuera del tablero, miraría las reglas y preguntaría quién las escribió.",`${a}, portador de la Espada Celestial. No recuerdas haber elegido esta historia. Pero la Espada sí te recuerda.`,"Despiertas en Lumen con una Jarra de Origen vacía, una promesa en el pecho y el Velo temblando sobre el mundo."]}}const lv={5:{kicker:"CAPÍTULO II · DRAKMOR",title:"CENIZA EN EL HORIZONTE",lines:["El Guardián Astado cae, y con él una verdad incómoda: la Gema Celestial no fue robada. Fue repartida.","El Fragmento de Brasa despierta al sureste, en una tierra donde el primer fuego todavía recuerda el nombre de quienes se lo dieron.","Drakmor te espera. Y en Drakmor, amar es una forma lenta de arder."]},9:{kicker:"CAPÍTULO III · KANSORDORE",title:"EL ARCHIVO PROHIBIDO",lines:["La Reina Ceniza cae, y el fuego que la sostenía se convierte en memoria.","El tercer Fragmento no está en un lugar. Está en una decisión: la biblioteca que solo existe para quien ya no puede olvidar.","Kansordore abre sus puertas. Tres sellos guardan la Cumbre de la Convergencia. Tres centinelas guardan los sellos.","Y en la cima, el último Jugador Cero lleva mil años esperando una respuesta."]},11:{kicker:"CAPÍTULO IV · LA CONVERGENCIA",title:"EL PESO DEL CIELO",lines:["Los tres sellos se rompen. El Archivo Prohibido exhala una luz que huele a lluvia y a libros viejos.","La Convergencia Absoluta ya ha comenzado: todas las verdades de Aetheria empiezan a caer en el mismo punto.","La Cumbre te espera al norte. Vex también."]},13:{kicker:"EPÍLOGO · LA ESPADA CELESTIAL",title:"NINGÚN CIELO PESA SOLO",lines:["Vex cae de rodillas, no por la espada, sino por algo parecido al alivio.","La Espada Celestial está completa. No fue forjada para matar. Fue forjada para recordar.","La Convergencia se abre ante ti. Cuatro caminos. Una sola pregunta: ¿qué clase de cielo quieres dejar a los que vienen después?"]}};function Ia(a){return lv[a]||null}function cv(a){const e=a.mainStage,t=a.sideQuests.memoria||{};return e===0?{speaker:"Lyra",portrait:"lyra",lines:["Por fin has llegado. La Espada llevaba tres noches cantando. Yo ya no sabía si era una advertencia o una bienvenida.","Me llamo Lyra. Leo lo que el Velo intenta borrar. Últimamente intenta borrar mucho.","Las sombras que ves en la pradera no son monstruos. Son pensamientos que el Velo no pudo digerir. Y están hambrientas.","La Gema Celestial se rompió, y su juramento contigo. Si no reúnes los Fragmentos antes de la Convergencia, Aetheria olvidará incluso que alguna vez tuvo cielo."],choices:[{id:"accept",label:"Acepto el juramento. Dime qué debo hacer."},{id:"ask",label:"¿Qué es exactamente la Espada Celestial?"}]}:e===1?{speaker:"Lyra",portrait:"lyra",lines:["Aún quedan sombras al norte y al este de Lumen. No las subestimes: el miedo también sabe empuñar una espada.","Cuando las hayas disipado, vuelve. Necesito contarte lo que encontré en los márgenes del Archivo."]}:e===2?{speaker:"Lyra",portrait:"lyra",lines:["Has disipado las sombras. Bien. Eso significa que el Velo aún escucha.","El primer Fragmento está en el Santuario del Alba, al este. Pero la piedra está sellada por tres Lámparas del Alba.","Enciéndelas. Y prepárate: el Santuario no te dará el Fragmento sin pedirte algo a cambio."],choices:[{id:"accept",label:"Iré al Santuario."},{id:"ask",label:"¿Qué me pedirá a cambio?"}]}:e===5?{speaker:"Lyra",portrait:"lyra",lines:["El Fragmento de Brasa ha despertado. Lo siento desde aquí: un latido seco, como una puerta que se cierra.","Abre el mapa y viaja a Drakmor. Busca a Kael en el Campamento de Ceniza. Fue caballero de la Reina antes de que ella olvidara su propio nombre.","Y ten cuidado. En Drakmor, el fuego no ilumina. Recuerda."]}:a.region==="kansordore"&&e>=10&&e<=12?{speaker:"Lyra",portrait:"lyra",lines:["Kansordore no siempre estuvo aquí. El Archivo se escribe a sí mismo cada vez que alguien olvida algo importante.","Los tres sellos están custodiados por Centinelas del Velo. No tienen rostro porque nunca necesitaron uno para juzgar.","Rómpelos. Después sube a la Cumbre. Vex no es un monstruo, pero tampoco va a apartarse."]}:e===13?{speaker:"Lyra",portrait:"lyra",lines:["Has vuelto. La Espada está completa. Yo... no sé si alegrarme o pedirte que te detengas.","La Convergencia te dará cuatro caminos. Ninguno es limpio. Elige el que puedas sostener cuando nadie esté mirando.","Sea cual sea tu decisión, quiero que sepas esto: no fuiste una profecía. Fuiste una elección. La mía también."]}:!t.started&&e>=3?{speaker:"Lyra",portrait:"lyra",lines:["Antes de que sigas, hay algo que solo tú puedes hacer.","He perdido tres memorias en el camino. No son recuerdos míos: son fragmentos de la verdad que el Velo arrancó del mundo.","Están repartidas por Aetheria. Si las recuperas, quizá entienda por qué la Espada te eligió a ti."],choices:[{id:"accept",label:"Las buscaré."},{id:"later",label:"Ahora no. Tengo que seguir."}]}:t.started&&!t.done&&a.lore.length>=3?{speaker:"Lyra",portrait:"lyra",lines:["Tres memorias. Las he leído todas. Duele más de lo que esperaba.","El Primer Juramento no fue entre un héroe y una espada. Fue entre dos personas que tenían miedo de dejar el mundo solo.","Toma estas Vestiduras Astrales. No te protegen del daño. Te protegen del olvido."]}:t.started&&!t.done?{speaker:"Lyra",portrait:"lyra",lines:[`Has recuperado ${a.lore.length} de 3 memorias. Las siento cerca, como páginas que alguien intenta arrancar.`,"Busca los libros que brillan en el mundo. El Velo no puede esconderlos si tú decides mirarlos."]}:{speaker:"Lyra",portrait:"lyra",lines:["El Velo se agita. No sé si es miedo o esperanza. Últimamente los dos suenan igual.","Sigue tu camino. Yo seguiré leyendo. Alguien tiene que recordar lo que pasa después."]}}function dv(a){const e=a.sideQuests.ecos||{};return e.started?!e.done&&a.creatures.length>=3?{speaker:"Nima",portrait:"nima",lines:["¡Tres! ¡Y ninguno se ha comido a nadie! Bueno, el Obsidiano intentó comerse una piedra, pero eso no cuenta.","Los ecos te reconocen. Eso significa que el Velo ya no puede borrarlos sin pelear.","Toma el Amuleto de Lumi. Brilla cuando algo pequeño te quiere. Úsalo bien. O no. Los amuletos también merecen divertirse."]}:e.done?{speaker:"Nima",portrait:"nima",lines:["Los ecos están contentos. Bueno, el Brotín está contento. Los demás están haciendo lo que hacen siempre: existir con mucha dignidad.","Cuando termine esto, quiero que vengas a conocer el jardín. Trae semillas. Y paciencia. Sobre todo paciencia."]}:{speaker:"Nima",portrait:"nima",lines:[`Llevas ${a.creatures.length} de 3 ecos. Los Lumi son fáciles: les gusta la luz y las personas que no gritan.`,"Los Zéfiro son más difíciles. Roban cintas. No preguntes por qué. Yo dejé de preguntar hace tres inviernos."]}:{speaker:"Nima",portrait:"nima",lines:["¡Shhh! Estás espantando a los ecos. Bueno, no. En realidad les gustas. Hueles a tormenta y a decisiones difíciles.","Soy Nima. Hablo con las criaturas que el Velo dejó a medias. Lumi, Brotín, Zéfiro... todas tienen nombre, aunque el mundo finja que no.","Necesito saber si el Velo sigue robando nombres. Captura tres ecos distintos y tráemelos. Bueno, no me los traigas. Resuena con ellos. Es más bonito."],choices:[{id:"accept",label:"Resonaré con tres ecos."},{id:"later",label:"Quizá más tarde."}]}}function hv(a){const e=a.sideQuests.campanas||{};return e.started?!e.done&&(a.flags.braziers||0)>=3?{speaker:"Anciana Mira",portrait:"mira",lines:["Los he visto arder desde mi ventana. Por un momento, Lumen volvió a tener sombras largas.","Toma estas pociones y esta esencia. No es mucho. Pero es lo que una aldea puede dar cuando recuerda cómo dar.","Gracias, portador. Ahora vete. Tengo que llorar un rato y no quiero testigos."]}:e.done?{speaker:"Anciana Mira",portrait:"mira",lines:["La luz vuelve despacio. Como todo lo que merece la pena.","Cuando el cielo se caiga, ven a mi casa. Tengo té y una silla que no cruje. No es mucho, pero es un comienzo."]}:{speaker:"Anciana Mira",portrait:"mira",lines:[`Has encendido ${a.flags.braziers||0} de 3 braseros. El tercero está al oeste de la plaza, junto a la casa de las campanas.`,"No corras. Los braseros llevan décadas dormidos; pueden esperar un poco más."]}:{speaker:"Anciana Mira",portrait:"mira",lines:["Cuando era joven, Lumen tenía tres braseros que nunca se apagaban. La gente decía que mientras ardieran, la aldea recordaría su propio nombre.","Se apagaron la noche en que el Velo se cerró. Desde entonces, nadie recuerda por qué lloramos en primavera.","Enciéndelos. No por mí. Por los que vendrán y no sabrán que les falta algo."],choices:[{id:"accept",label:"Encenderé los tres braseros."},{id:"later",label:"Volveré cuando pueda."}]}}function uv(a){return a.flags.orinGift?{speaker:"Orin",portrait:"orin",lines:["La forja no crea nada. Solo convence al metal de que puede ser otra cosa.","Abre el menú de pausa y entra en Equipo. Ahí puedes mejorar el arma y la armadura con fragmentos de cielo.","Y no me traigas más excusas. Trae esencia."]}:{speaker:"Orin",portrait:"orin",lines:["La Espada Celestial. La he visto en grabados, pero nunca en manos de alguien que todavía tenga que atarse las botas.","No intentes afilarla con piedra. Te va a mirar mal. La Espada recuerda cada forma que ha llevado; necesita fragmentos de cielo, no paciencia de herrero.","Toma estos dos fragmentos. Y si vuelves con esencia de eco, te enseño a despertar lo que ya está dentro de ella."]}}function fv(a){const e=a.sideQuests.deuda||{},t=a.mainStage;return t===6?{speaker:"Kael",portrait:"kael",lines:["Así que Lyra te envía. Claro. Ella siempre manda a otros a hacer las preguntas que le duelen.","La Reina Ceniza fue mi reina. Ilyra Drakmor vendió su nombre al primer fuego para salvar a su pueblo del invierno. El fuego cobró intereses.","Ahora su fortaleza está cerrada. Tres Guardias de Obsidiana custodian la puerta. Si quieres llegar al trono, tendrás que apagarlos.","Y hay algo más. En la Caldera de Ceniza vive un Devorador. Lo llamo «mi último error». Si lo matas, te deberé más de lo que puedo pagar."],choices:[{id:"accept",label:"Abriré la puerta de obsidiana."},{id:"deuda",label:"También mataré al Devorador."},{id:"ask",label:"¿Por qué no lo matas tú?"}]}:e.started&&!e.done?{speaker:"Kael",portrait:"kael",lines:["El Devorador sigue vivo. Lo sé porque todavía sueño con su aliento.","Está en la Caldera, al sureste. No es rápido, pero cuando te alcanza, el mundo se vuelve pequeño.","Si no puedes con él, vuelve. No hay vergüenza en sobrevivir para intentarlo otra vez."]}:t>=8&&t<=9?{speaker:"Kael",portrait:"kael",lines:["La Reina está en el patio de la fortaleza, más allá de la puerta. No la subestimes: su fuego no quema la carne. Quema los nombres.","Cuando la veas, recuerda que un día fue una niña que pidió que su pueblo no muriera de frío.","No te pido que la perdones. Solo que no la reduzcas a un monstruo."]}:e.done?{speaker:"Kael",portrait:"kael",lines:["Mataste al Devorador. No sé si eso me hace libre o me convierte en la última persona que recuerda lo que fui.","Toma el Filo Dracónico. Lo forjé con una escama de la Reina. Aún respira, pero ya no muerde.","Ve a Kansordore. Y cuando encuentres a Vex, no le preguntes por qué sostiene el cielo. Pregúntale para quién."]}:{speaker:"Kael",portrait:"kael",lines:["La ceniza no perdona, pero tampoco guarda rencor. Solo espera.","Si vuelves a Valdoria, dile a Lyra que sigo vivo. No sé si le importará. Dímelo igual."]}}function pv(a){const e={guardian:{speaker:"El Guardián Astado",portrait:"creature",creature:"lumi",lines:["Has encendido las lámparas. El Santuario recuerda tu luz, pero yo recuerdo otra cosa.","La primera criatura que juró proteger la Gema Celestial fui yo. Ahora protejo su ausencia.","Si quieres el Fragmento, demuéstrame que puedes cargar con lo que falta."]},reina:{speaker:"La Reina Ceniza",portrait:"vex",lines:["Otro portador. Otra espada que canta. Otra persona que cree que el fuego se puede apagar con buenas intenciones.","Mi pueblo sobrevivió al invierno. Yo no. Esto que ves es lo que el primer fuego dejó cuando terminó de cobrarse mi nombre.","Ven. Te enseñaré cuánto pesa una corona que arde."]},vex:{speaker:"Vex, Custodio del Velo",portrait:"vex",lines:["Así que tú eres el Jugador Cero. No pareces alguien que vaya a romper el mundo. Pero los que rompen el mundo nunca lo parecen.","He sostenido este cielo durante mil años. He visto a todos los que vinieron antes que tú. Ninguno preguntó quién escribió las reglas.","Si de verdad eres diferente, demuéstralo. La Convergencia no se detiene por buenas preguntas."]},devorador:{speaker:"Devorador de Ceniza",portrait:"creature",creature:"ascua",lines:["El Devorador no habla. Abre la boca, y el aire alrededor recuerda cómo se siente ser olvidado."]}};return e[a]||e.vex}function mv(a){const e=a.creatures.length>=6;return{speaker:"La Convergencia",portrait:"vex",lines:["Todas las verdades de Aetheria han caído en este punto. Puedo ver cada versión de ti: la que se rinde, la que gobierna, la que olvida.","La Espada Celestial no decide por ti. Solo recuerda lo que eliges.","¿Qué clase de cielo quieres dejar a los que vienen después?"],choices:[{id:"restaurar",label:"Restaurar el Velo. Que el mundo duela, pero siga entero."},{id:"romper",label:"Romper el Velo. Que todos los mundos se vean por fin."},{id:"ascender",label:"Ascender. Sostener el cielo yo mismo."},{id:"celestial",label:e?"Tejer un puente. Que el cielo se sostenga entre todos.":"Tejer un puente. (Requiere al menos 6 ecos)",disabled:!e}]}}function gv(a,e="Aurel"){const t={restaurar:["Clavas la Espada en el corazón de la Convergencia. El cielo se cierra como una herida que aprende a cicatrizar.","Aetheria olvida tu nombre. Pero cada amanecer tiene un tono dorado que nadie sabe explicar.",`${e}, el portador sin estatua. El juramento que el mundo no recuerda haber hecho.`],romper:["Giras la espada y cortas la última hebra. El Velo cae sin ruido.","Durante tres días, todos los mundos se ven entre sí. Después, la gente empieza a construir con las ruinas de lo imposible.","No hay profecía que sobreviva a un mundo que decide escribir su propia historia."],ascender:["Aceptas el peso. La espada se disuelve en tu pecho y el Velo te reconoce.","Ocupas el lugar de Vex en la Cumbre, viendo todos los caminos sin poder recorrer ninguno.","El cielo tiene un nuevo guardián. Esta vez, alguien que recuerda por qué lo protege."],celestial:["No restauras el Velo ni lo rompes. Lo conviertes en un puente.","Cada eco que reuniste —cada criatura, cada recuerdo, cada nombre— sostiene la tela del cielo junto a ti.","El cielo, por primera vez en mil años, no pesa. Porque por fin lo sostiene más de una persona."]};return{kicker:"FINAL",title:a==="celestial"?"LA ESPADA CELESTIAL":"EL JURAMENTO SE CUMPLE",lines:t[a]||t.restaurar}}const vv=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV"],Is=-.2,xv="E",Ii=(a,e)=>Math.hypot(a.x-e.x,a.z-e.z),Yt=(a,e,t)=>new I(a,e,t),It=(a,e)=>a+Math.random()*(e-a);class Vs{constructor(e,t,i={}){this.app=e,this.ui=e.ui,this.audio=e.audio,this.camera=e.camera,this.state=this.normalizeState(t),this.scene=null,this.world=null,this.enemies=[],this.creatures=[],this.npcs=[],this.projectiles=[],this.effects=[],this.telegraphs=[],this.extraInteractables=[],this.companion=null,this.captureTarget=null,this.time=0,this.playTime=this.state.playTime||0,this.frozen=!1,this.deathShown=!1,this.deathTimer=0,this.autoSaveTimer=0,this.shake=0,this.iframe=0,this.hurtTimer=0,this.attack=null,this.queuedAttack=null,this.attackCooldown=0,this.dodge=null,this.cast=null,this.comboChain=0,this.comboTimer=0,this.comboDisplay=0,this.blockStart=-10,this.footstepTimer=0,this.speedBuff=0,this.speedBuffTimer=0,this.shield=0,this.cooldowns={spell:0,spellMax:6,creature:0,creatureMax:10,ultimate:0,ultimateMax:22,potion:0},this.keys=new Set,this.nearby=null,this.lastRegion=null,this.introPlayed=!1,this.player={group:null,model:null,blocking:!1,dead:!1,moving:0},this.buildPlayerModel(),this.loadRegion(this.state.region||"valdoria",i.spawn||null);const n=this.getStats(),s=this.state.player;s.hp=Je(Number(s.hp)||n.maxHp,1,n.maxHp),s.mp=Je(Number(s.mp)||n.maxMp,0,n.maxMp),s.sp=Je(Number(s.sp)||n.maxSp,0,n.maxSp),this.spawnCompanion(),this.updateCamera(.016,!0)}static createState(e,t="equilibrado"){const i=e.weapon||"filo_aurora",n=e.armor||"tunica_viajero";return{version:1,createdAt:Date.now(),playTime:0,difficulty:t,player:{name:e.name||"Aurel",origin:e.origin||"filo",appearance:{...e.appearance||{}},stats:{...e.stats||{}},level:1,xp:0,xpNext:Vr(1),hp:e.maxHp||110,mp:e.maxMp||60,sp:e.maxSp||75,weapon:i,armor:n,charm:null,skillPoints:0},region:"valdoria",mainStage:0,stageProgress:{},sideQuests:{},lore:[],creatures:[],inventory:{pocion_luz:3,esencia_eco:3,fragmentos:2,cristal_resonancia:1},ownedWeapons:[i],ownedArmors:[n],ownedCharms:[],upgrades:{weapon:0,armor:0},skills:{},unlockedRegions:["valdoria"],flags:{},stats:{kills:0,chests:0,quests:0,captures:0,deaths:0},defeated:[],ending:null,checkpoint:{region:"valdoria",x:0,z:12},lastPosition:null}}normalizeState(e){const t=e||{},i=Vs.createState({name:t.player?.name,origin:t.player?.origin,appearance:t.player?.appearance,stats:t.player?.stats,weapon:t.player?.weapon,armor:t.player?.armor,maxHp:t.player?.hp,maxMp:t.player?.mp,maxSp:t.player?.sp},t.difficulty),n={...i,...t,player:{...i.player,...t.player||{}},inventory:{...i.inventory,...t.inventory||{}},upgrades:{...i.upgrades,...t.upgrades||{}},stats:{...i.stats,...t.stats||{}},flags:{...t.flags||{}},skills:{...t.skills||{}},sideQuests:{...t.sideQuests||{}},stageProgress:{...t.stageProgress||{}},unlockedRegions:Array.isArray(t.unlockedRegions)&&t.unlockedRegions.length?[...t.unlockedRegions]:["valdoria"],ownedWeapons:Array.isArray(t.ownedWeapons)?[...t.ownedWeapons]:[i.player.weapon],ownedArmors:Array.isArray(t.ownedArmors)?[...t.ownedArmors]:[i.player.armor],ownedCharms:Array.isArray(t.ownedCharms)?[...t.ownedCharms]:[],creatures:Array.isArray(t.creatures)?t.creatures.map(s=>({...s})):[],lore:Array.isArray(t.lore)?[...t.lore]:[],defeated:Array.isArray(t.defeated)?[...t.defeated]:[]};return n.mainStage=Je(Number(n.mainStage)||0,0,Pn.length-1),n.region=Mt[n.region]?n.region:"valdoria",n.player.xpNext=Vr(n.player.level||1),(!n.checkpoint||!Mt[n.checkpoint.region])&&(n.checkpoint={region:n.region,x:Mt[n.region].spawn.x,z:Mt[n.region].spawn.z}),n}get difficulty(){return Nc.find(e=>e.id===this.state.difficulty)||Nc[1]}buildPlayerModel(){const e=this.state.player;this.player.group&&this.scene&&this.scene.remove(this.player.group);const t=rl(e.appearance,e.weapon,e.armor,e.appearance.headgear||"ninguno");t.group.userData.kind="player",this.player.group=t.group,this.player.model=t,this.player.blocking=!1,this.scene&&(this.scene.add(t.group),this.placePlayer(this.player.group.position.x,this.player.group.position.z))}rebuildPlayer(){if(!this.player.model)return;const e=this.player.model,t=jg(e,this.state.player.appearance,this.state.player.weapon,this.state.player.armor,this.state.player.appearance.headgear||"ninguno");this.scene&&(this.scene.remove(e.group),this.scene.add(t.group)),this.player.group=t.group,this.player.model=t,t.group.position.y=this.world?this.world.heightAt(t.group.position.x,t.group.position.z)+Is:Is}loadRegion(e,t=null){this.scene&&this.player.group&&this.scene.remove(this.player.group),this.companion?.group&&this.scene&&this.scene.remove(this.companion.group),this.companion=null,this.scene&&Fc(this.scene),this.enemies=[],this.creatures=[],this.npcs=[],this.projectiles=[],this.effects=[],this.telegraphs=[],this.extraInteractables=[],this.captureTarget=null,this.state.region=e,this.world=new rv(this,e),this.scene=this.world.scene,this.world.addQuestMarker(),this.scene.add(this.player.group),this.spawnEntities(),this.restoreWorldState();let i=t;!i&&this.state.lastPosition&&this.state.region===e&&(i=this.state.lastPosition),!i&&this.state.checkpoint?.region===e&&(i=this.state.checkpoint),i||(i=Mt[e].spawn),this.placePlayer(i.x,i.z),this.state.mainStage>=13&&this.addConvergence(),this.audio.setTheme(e,!1),this.updateQuestMarker(),this.spawnCompanion(),this.updateCamera(.016,!0),this.lastRegion=e}spawnEntities(){for(const e of this.world.getEnemySpawns()){const t=`${this.world.regionId}:${e.type}:${e.x}:${e.z}`;!e.respawn&&this.state.defeated.includes(t)||e.seal&&(this.state.flags.sealsBroken||[]).includes(e.seal)||this.spawnEnemy(e.type,e.level||1,e.x,e.z,{...e,uid:t})}for(const e of this.world.getCreatureSpawns())this.spawnCreature(e.species,e.x,e.z);for(const e of this.world.getNpcSpawns())this.spawnNpc(e);this.ensureBosses()}spawnEnemy(e,t,i,n,s={}){const r=Xg[e];if(!r)return null;const o=tv(r,t),c=this.world.heightAt(i,n);o.group.position.set(i,c,n),o.group.rotation.y=s.rotation||Math.random()*Le,this.scene.add(o.group);const l=1+(t-1)*.06,d={uid:s.uid||`${this.world.regionId}:${e}:${i}:${n}`,type:e,def:r,level:t,group:o.group,model:o,spawn:s,home:{x:i,z:n},hp:r.hp*l,maxHp:r.hp*l,dmg:r.dmg*(1+(t-1)*.07),defStat:r.def,speed:r.speed,range:r.range,radius:r.radius,dead:!1,deadProgress:0,deathTimer:0,respawnTimer:0,aggro:!1,windup:0,attackCooldown:It(.2,1.1),hurt:0,stagger:0,moveAmount:0,attacking:!1,attackProgress:0,active:!r.boss,introPlayed:!1,phase:1,specialTimer:It(4,7),patrolTimer:It(1,4),patrolAngle:Math.random()*Le,status:{stun:0,root:0,slow:0,burn:0,weaken:0}};return r.boss&&(d.hp=r.hp*(1+(t-1)*.05),d.maxHp=d.hp,d.active=!1,d.introPlayed=!1),this.enemies.push(d),d}ensureBosses(){const e=this.state.mainStage,t=this.world.regionId;t==="valdoria"&&e===4&&!this.state.defeated.includes("boss:guardian")&&this.spawnEnemy("guardian",5,58,-24,{uid:"boss:guardian",boss:!0}),t==="drakmor"&&e===8&&!this.state.defeated.includes("boss:reina")&&this.spawnEnemy("reina",8,25,-24,{uid:"boss:reina",boss:!0}),t==="kansordore"&&e===12&&!this.state.defeated.includes("boss:vex")&&this.spawnEnemy("vex",11,0,-50,{uid:"boss:vex",boss:!0})}spawnCreature(e,t,i){const n=ai[e];if(!n)return null;const s=zc(n),r=this.world.heightAt(t,i);s.group.position.set(t,r+.05,i),this.scene.add(s.group);const o={speciesId:e,species:n,group:s.group,model:s,home:{x:t,z:i},x:t,z:i,captured:!1,wanderTimer:It(1,4),target:null,moving:!1,phase:Math.random()*Le};return this.creatures.push(o),o}spawnNpc(e){const t=iv(e.id),i=this.world.heightAt(e.x,e.z);t.group.position.set(e.x,i+Is,e.z),t.group.rotation.y=e.rotation||0,this.scene.add(t.group);const n=Uc(e.name||e.id,"#fff0c2");n.position.set(0,2.55,0),n.scale.multiplyScalar(.72),t.group.add(n);const s=Uc("!","#f4d58d");s.position.set(0,3.15,0),s.scale.multiplyScalar(.8),s.visible=!1,t.group.add(s);const r={...e,model:t,group:t.group,nameSprite:n,questSprite:s};return this.npcs.push(r),r}addConvergence(){if(this.extraInteractables.some(c=>c.id==="convergence"))return;const e=0,t=-50,i=this.world.heightAt(e,t),n=new Te;n.position.set(e,i,t);const s=new H(new Ci(1.8,2.5,48),new De({color:"#fff0a8",transparent:!0,opacity:.6,side:pt,blending:ft}));s.rotation.x=-Math.PI/2,s.position.y=.16,n.add(s);const r=new H(new Zt(.45,0),new De({color:"#fff0a8"}));r.position.y=1.8,n.add(r);const o=new ls(new Nn({map:(this.world.sky.material.uniforms,null)}));o.visible=!1,this.scene.add(n),this.extraInteractables.push({id:"convergence",type:"convergence",x:e,z:t,radius:5,label:"La Convergencia",mesh:n,ring:s,gem:r})}restoreWorldState(){const e=this.state.flags,t=new Set(e.chestsOpened||[]),i=new Set(e.braziersLit||[]),n=new Set(e.lampsLit||[]),s=new Set(e.sealsBroken||[]);for(const r of this.world.getInteractables())r.type==="chest"&&t.has(r.id)&&(r.opened=!0,r.lid&&(r.lid.rotation.x=-1.1)),r.type==="brazier"&&i.has(r.id)&&(r.lit=!0,r.flame.material.opacity=.9,r.flame.scale.setScalar(2.1)),r.type==="lamp"&&n.has(r.id)&&(r.lit=!0,r.flame.material.opacity=.9,r.flame.scale.setScalar(2.4)),r.type==="lore"&&this.state.lore.includes(r.id)&&(r.mesh.visible=!1);for(const r of s){const o=this.world.dynamic.find(c=>c.type==="seal"&&c.id===r);o&&(o.ring.visible=!1,o.mesh.material.color.set("#555064"))}for(const r of this.world.getInteractables())r.type==="seal"&&s.has(r.id)&&(r.activated=!0)}placePlayer(e,t){const i=Mt[this.state.region]?.bounds||90,n=Je(e,-i,i),s=Je(t,-i,i),r=this.world?this.world.heightAt(n,s)+Is:0;this.player.group.position.set(n,r,s),this.state.lastPosition={x:n,z:s}}getStats(){const e=this.state.player,t=e.stats||{},i=ni[e.weapon]||ni.filo_aurora,n=_i[e.armor]||_i.tunica_viajero,s=e.charm?fn[e.charm]:null,r=this.state.skills||{},o=this.state.creatures.find(A=>A.active),c=o?ai[o.id]?.passiveEffect||{}:{},l=Math.max(1,e.level||1),d=l-1,h=Math.round(80+(t.vitalidad||0)*8+n.hp+d*5+(r.corazon_lumen||0)*18+(c.hp||0)),u=Math.round(40+(t.resonancia||0)*6+(n.mp||0)+(s?.mp||0)+d*2+(r.resonancia_profunda||0)*18+(c.mp||0)),f=Math.round(60+(t.resistencia||0)*5+d*2),p=Math.round((8+(t.fuerza||0)*2.2+i.atk+(this.state.upgrades.weapon||0)*2+d*.9)*(1+(r.filo_aurora||0)*.06+(c.attackPct||0))),v=Math.round((3+(t.defensa||0)*1.6+(t.resistencia||0)*.5+n.def+(this.state.upgrades.armor||0)+d*.7)*(1+(c.defensePct||0))),g=Je(.03+(t.suerte||0)*.008+(i.crit||0)+(r.instinto||0)*.04+(c.crit||0),0,.75),m=6.1*(1+(t.velocidad||0)*.015+(r.velo_ligero||0)*.06+(c.speedPct||0)+(this.speedBuff||0)),_=Math.round((12+(t.inteligencia||0)*2+d*1.2)*(1+(r.resonancia_profunda||0)*.08+(c.spellPct||0)+(s?.spell||0))),M=Je(.18+(t.suerte||0)*.012+(s?.capture||0)+(r.eco_afin||0)*.1+(c.capture||0),.08,.95),y=Math.max(6,16*(1-(r.velo_ligero||0)*.08));return{stats:{...t},maxHp:h,maxMp:u,maxSp:f,attack:p,defense:v,crit:g,speed:m,spellPower:_,capture:M,dodgeCost:y,parry:.2+(r.guardia_alba||0)*.06,comboBonus:1+(r.torrente||0)*.07,weapon:i,armor:n,charm:s,level:l}}getCooldowns(){return{spell:this.cooldowns.spell,spellMax:this.cooldowns.spellMax,creature:this.cooldowns.creature,creatureMax:this.cooldowns.creatureMax,ultimate:this.cooldowns.ultimate,ultimateMax:this.cooldowns.ultimateMax}}hasUltimate(){return(this.state.skills.juicio||0)>0}equip(e,t){const i=this.state.player;if(e==="weapon"&&this.state.ownedWeapons.includes(t)&&ni[t])i.weapon=t;else if(e==="armor"&&this.state.ownedArmors.includes(t)&&_i[t])i.armor=t;else if(e==="charm"&&this.state.ownedCharms.includes(t)&&fn[t])i.charm=t;else return;this.rebuildPlayer(),this.audio.play("ui"),this.save(),this.ui.toast("Equipamiento actualizado",`${(ni[t]||_i[t]||fn[t])?.name||t}`,"quest")}upgradeCost(e){const t=this.state.upgrades[e]||0;return[2,4,7][t]??0}upgrade(e){if(e!=="weapon"&&e!=="armor")return;const t=this.state.upgrades[e]||0;if(t>=3){this.ui.toast("Forja completa","Este equipo ya alcanzó su forma máxima.","error");return}const i=this.upgradeCost(e);if((this.state.inventory.fragmentos||0)<i){this.ui.toast("Fragmentos insuficientes",`Necesitas ${i} fragmentos de cielo.`,"error");return}this.state.inventory.fragmentos-=i,this.state.upgrades[e]=t+1,this.audio.play("chest"),this.ui.toast("Forjado",`${e==="weapon"?"Arma":"Armadura"} mejorada a Nv. ${t+1}.`,"level"),this.save()}learnSkill(e){const t=Yd.find(s=>s.id===e),i=this.state.player;if(!t||i.skillPoints<=0)return;const n=this.state.skills[e]||0;n>=t.max||(this.state.skills[e]=n+1,i.skillPoints-=1,this.audio.play("levelup"),this.ui.toast("Habilidad despertada",`${t.name} · rango ${n+1}`,"level"),this.save())}setActiveCreature(e){if(this.state.creatures.find(i=>i.id===e)){for(const i of this.state.creatures)i.active=i.id===e;this.spawnCompanion(),this.audio.play("capture"),this.ui.toast("Eco invocado",`${ai[e]?.name||e} te acompaña.`,"capture"),this.save()}}spawnCompanion(){this.companion?.group&&this.scene&&this.scene.remove(this.companion.group),this.companion=null;const e=this.state.creatures.find(s=>s.active);if(!e||!this.scene)return;const t=ai[e.id];if(!t)return;const i=zc(t),n=this.player.group.position;i.group.position.set(n.x+1.4,n.y+.15,n.z+1.1),i.group.scale.multiplyScalar(.86),this.scene.add(i.group),this.companion={id:e.id,model:i,group:i.group,phase:Math.random()*Le,skillTimer:0}}updateCompanion(e,t=!1){if(!this.companion)return;const i=this.companion,n=this.player.group.position,s=this.time*.55+i.phase,r=n.x+Math.cos(s)*1.7,o=n.z+Math.sin(s)*1.7;i.group.position.x=Ge(i.group.position.x,r,4,e),i.group.position.z=Ge(i.group.position.z,o,4,e);const c=this.world.heightAt(i.group.position.x,i.group.position.z)+.1;i.group.position.y=Ge(i.group.position.y,c+.16,6,e),i.group.rotation.y=Cn(i.group.rotation.y,Math.atan2(n.x-i.group.position.x,n.z-i.group.position.z),5,e),Oc(i.model,e,this.time,{hover:!0,moving:!t&&this.player.moving>.1})}setKey(e,t){t?this.keys.add(e):this.keys.delete(e)}inputVector(){let e=0,t=0;const i=this.ui.joystick;i.active&&Math.hypot(i.x,i.y)>.12&&(e+=i.x,t+=i.y),(this.keys.has("KeyA")||this.keys.has("ArrowLeft"))&&(e-=1),(this.keys.has("KeyD")||this.keys.has("ArrowRight"))&&(e+=1),(this.keys.has("KeyW")||this.keys.has("ArrowUp"))&&(t-=1),(this.keys.has("KeyS")||this.keys.has("ArrowDown"))&&(t+=1);const n=Math.hypot(e,t);return n>1&&(e/=n,t/=n),{x:e,z:t,len:Math.min(1,n),sprint:this.keys.has("ShiftLeft")||this.keys.has("ShiftRight")}}updatePlayer(e){const t=this.state.player,i=this.getStats(),n=this.player.model;if(!n)return;const s=n.pose;if(t.hp=Je(t.hp,0,i.maxHp),t.mp=Je(t.mp,0,i.maxMp),t.sp=Je(t.sp,0,i.maxSp),this.player.dead){s.dead=!0,er(n,e,this.time);return}const r=(.9+(i.charm?.regen||0))*(this.player.blocking?.4:1);t.mp=Je(t.mp+r*e,0,i.maxMp),t.sp=Je(t.sp+(this.player.blocking?4:9)*e,0,i.maxSp),this.iframe=Math.max(0,this.iframe-e),this.hurtTimer=Math.max(0,this.hurtTimer-e),this.attackCooldown=Math.max(0,this.attackCooldown-e),this.comboTimer=Math.max(0,this.comboTimer-e),this.comboTimer<=0&&this.comboDisplay>0&&(this.comboDisplay=0,this.comboChain=0,this.ui.showCombo(0)),this.speedBuffTimer>0&&(this.speedBuffTimer-=e,this.speedBuffTimer<=0&&(this.speedBuff=0));for(const h of Object.keys(this.cooldowns))h.endsWith("Max")||(this.cooldowns[h]=Math.max(0,this.cooldowns[h]-e));const o=this.inputVector();this.player.moving=o.len;const c=!!this.attack,l=!!this.cast;if(this.dodge,this.dodge){this.dodge.time+=e;const h=Je(this.dodge.time/this.dodge.duration,0,1);s.dodging=!0,s.dodgeProgress=h;const u=i.speed*3.1*(1-h*.35);this.tryMovePlayer(this.dodge.dirX*u*e,this.dodge.dirZ*u*e),this.dodge.time>=this.dodge.duration&&(this.dodge=null,s.dodging=!1)}else{s.dodging=!1;const h=this.player.blocking?.42:1,u=c?.22:l?0:1,f=o.sprint&&o.len>.1&&t.sp>2&&!c&&!l&&!this.player.blocking;f&&(t.sp=Math.max(0,t.sp-11*e));const p=i.speed*h*u*(f?1.34:1);if(o.len>.08){const v=Math.hypot(o.x,o.z)||1,g=o.x/v,m=o.z/v;this.tryMovePlayer(g*p*o.len*e,m*p*o.len*e);const _=Math.atan2(g,m);!c&&!l&&!this.player.blocking&&(this.player.group.rotation.y=Cn(this.player.group.rotation.y,_,12,e)),s.moving=o.len,s.sprinting=f,this.footstepTimer-=e,this.footstepTimer<=0&&(this.footstepTimer=f?.24:.36,this.audio.play("footstep"))}else s.moving=0,s.sprinting=!1}if(this.attack){if(this.attack.time+=e,s.attacking=!0,s.attackType=this.attack.type,s.attackProgress=Je(this.attack.time/this.attack.duration,0,1),s.combo=this.attack.combo,!this.attack.hitDone&&this.attack.time>=this.attack.hitAt&&(this.attack.hitDone=!0,this.performAttackHit(this.attack)),this.attack.time>=this.attack.duration&&(this.attack=null,s.attacking=!1,this.queuedAttack)){const h=this.queuedAttack;this.queuedAttack=null,this.startAttack(h)}}else s.attacking=!1;if(this.cast){if(this.cast.time+=e,s.casting=!0,s.castProgress=Je(this.cast.time/this.cast.duration,0,1),this.cast.time>=this.cast.duration){const h=this.cast;this.cast=null,s.casting=!1,h.execute?.()}}else s.casting=!1;s.blocking=this.player.blocking&&!this.attack&&!this.dodge&&!this.cast,s.hurt=this.hurtTimer,s.dead=!1;const d=this.world.heightAt(this.player.group.position.x,this.player.group.position.z);this.player.group.position.y=Ge(this.player.group.position.y,d+Is,18,e),this.state.lastPosition={x:this.player.group.position.x,z:this.player.group.position.z},er(n,e,this.time)}tryMovePlayer(e,t){const i=this.player.group.position,n=Mt[this.state.region]?.bounds||90,s=Je(i.x+e,-n,n);this.collides(s,i.z,.42)||(i.x=s);const r=Je(i.z+t,-n,n);this.collides(i.x,r,.42)||(i.z=r)}collides(e,t,i=.42){if(!this.world)return!1;for(const n of this.world.colliders){const s=n.r+i;if((e-n.x)*(e-n.x)+(t-n.z)*(t-n.z)<s*s)return!0}return!1}action(e){if(this.frozen||this.player.dead)return;const t=this.getStats();switch(e){case"attack":this.startAttack("light");break;case"heavy":if(this.state.player.sp<18){this.ui.toast("Sin aguante","Necesitas 18 de aguante para el golpe pesado.","error");return}this.state.player.sp-=18,this.startAttack("heavy");break;case"dodge":this.startDodge(t);break;case"block":this.setBlocking(!0);break;case"spell":this.castSpell(t);break;case"creature":this.castCreatureSkill();break;case"ultimate":this.castUltimate(t);break;case"potion":this.usePotion(t);break}}setBlocking(e){this.player.dead&&(e=!1),e&&!this.player.blocking&&(this.blockStart=this.time),this.player.blocking=!!e}startAttack(e="light"){if(this.frozen||this.player.dead||this.cast||this.dodge)return;if(this.attack){this.attack.time>this.attack.duration*.42&&(this.queuedAttack=e);return}if(this.attackCooldown>0)return;this.player.blocking=!1;const i=this.getStats().weapon.speed||1,n=(e==="heavy"?.84:.46)/i,s=this.comboChain%3;if(this.comboChain=(this.comboChain+1)%3,this.attack={type:e,time:0,duration:n,hitAt:n*.42,hitDone:!1,combo:s,range:e==="heavy"?4.2:3.4},this.attackCooldown=n*.62,this.ui.settings.autoTarget!==!1){const r=this.nearestEnemy(e==="heavy"?6:5);if(r){const o=r.group.position.x-this.player.group.position.x,c=r.group.position.z-this.player.group.position.z;this.player.group.rotation.y=Math.atan2(o,c)}}this.audio.play(e==="heavy"?"heavy":"swing")}performAttackHit(e){const t=this.getStats(),i=this.player.group.position,n=this.player.group.rotation.y,s=Math.sin(n),r=Math.cos(n);let o=0;for(const l of this.enemies){if(l.dead||!l.active)continue;const d=l.group.position.x-i.x,h=l.group.position.z-i.z,u=Math.hypot(d,h);if(u>e.range+l.radius||(d*s+h*r)/(u||1)<(u<1.8?-1:-.15))continue;let p=t.attack*(e.type==="heavy"?1.75:1);e.combo===2&&(p*=1.25*t.comboBonus),p*=It(.92,1.08);const v=Math.random()<t.crit;v&&(p*=1.8),this.damageEnemy(l,p,{crit:v,heavy:e.type==="heavy"}),o++}const c=e.type==="heavy"?"#ffb347":"#bfe9ff";this.spawnSlash(i,n,e.type==="heavy"?2.6:1.9,c),o>0&&(this.audio.play("hit"),this.shake=Math.min(1,this.shake+(e.type==="heavy"?.4:.16)),this.comboDisplay+=o,this.comboTimer=2,this.ui.showCombo(this.comboDisplay))}startDodge(e){if(this.frozen||this.player.dead||this.dodge||this.cast)return;if(this.state.player.sp<e.dodgeCost){this.ui.toast("Sin aguante","No puedes esquivar todavía.","error");return}this.state.player.sp-=e.dodgeCost;const t=this.inputVector();let i=t.x,n=t.z;t.len<.1&&(i=Math.sin(this.player.group.rotation.y),n=Math.cos(this.player.group.rotation.y));const s=Math.hypot(i,n)||1;this.attack=null,this.queuedAttack=null,this.player.blocking=!1,this.dodge={time:0,duration:.36,dirX:i/s,dirZ:n/s},this.iframe=.28+(e.charm?.iframes||0),this.audio.play("dodge")}castSpell(e){if(!(this.frozen||this.player.dead||this.cast||this.attack||this.dodge)&&!(this.cooldowns.spell>0)){if(this.state.player.mp<22){this.ui.toast("Resonancia insuficiente","Necesitas 22 de maná.","error");return}this.state.player.mp-=22,this.cooldowns.spell=this.cooldowns.spellMax,this.player.blocking=!1,this.audio.play("spell"),this.cast={time:0,duration:.44,execute:()=>{const t=this.player.group.position.clone();this.spawnRing(t,"#7ee8fa",8,.65),this.spawnPillar(t,"#7ee8fa",1,.9),this.shake=Math.min(1,this.shake+.3);for(const i of this.enemies){if(i.dead||!i.active)continue;Ii(i.group.position,t)<8.2&&(this.damageEnemy(i,e.spellPower*It(.92,1.08),{spell:!0}),i.status.stun=Math.max(i.status.stun,.8),i.aggro=!0)}}}}}castCreatureSkill(){if(this.frozen||this.player.dead||this.cast||this.dodge)return;const e=this.state.creatures.find(i=>i.active);if(!e){this.ui.toast("Sin eco activo","Abre el diario y elige un eco que te acompañe.","error");return}if(this.cooldowns.creature>0)return;const t=ai[e.id];t&&(this.cooldowns.creature=t.skill.cooldown,this.cooldowns.creatureMax=t.skill.cooldown,this.player.blocking=!1,this.audio.play("capture"),this.cast={time:0,duration:.35,execute:()=>this.executeCreatureSkill(t,e)})}executeCreatureSkill(e,t){const i=this.player.group.position.clone(),n=this.getStats(),s=e.skill.power*(1+(t.level-1)*.08)*(1+n.spellPower/100),r=e.skill.effect,o=e.colors.accent;this.spawnRing(i,o,r==="judgment"?11:6.5,.7),this.audio.play("spell");const c=this.enemies.filter(l=>!l.dead&&l.active&&Ii(l.group.position,i)<(r==="judgment"?13:7.5));r==="heal"?(this.state.player.hp=Je(this.state.player.hp+n.maxHp*.25,0,n.maxHp),this.spawnPillar(i,o,.7,.7)):r==="shield"?(this.shield=Math.max(this.shield,s*1.6),this.spawnPillar(i,o,.8,.6)):r==="haste"&&(this.speedBuff=.28,this.speedBuffTimer=4,this.spawnPillar(i,o,.6,.6));for(const l of c)r!=="heal"&&r!=="shield"&&r!=="haste"&&this.damageEnemy(l,s,{spell:!0}),r==="blind"&&(l.status.stun=Math.max(l.status.stun,1.5)),r==="root"&&(l.status.root=Math.max(l.status.root,1.4)),r==="burn"&&(l.status.burn=Math.max(l.status.burn,3)),r==="weaken"&&(l.status.weaken=Math.max(l.status.weaken,5)),r==="slow"&&(l.status.slow=Math.max(l.status.slow,4)),l.aggro=!0;r==="judgment"&&(this.shake=Math.min(1,this.shake+.55)),this.ui.toast(e.skill.name,`${e.name} responde a tu llamada.`,"capture")}castUltimate(e){if(!(this.frozen||this.player.dead||this.cast||this.dodge)){if(!this.hasUltimate()){this.ui.toast("Juicio no desbloqueado","Aprende la habilidad Juicio Celestial.","error");return}if(!(this.cooldowns.ultimate>0)){if(this.state.player.mp<50){this.ui.toast("Resonancia insuficiente","El Juicio requiere 50 de maná.","error");return}this.state.player.mp-=50,this.cooldowns.ultimate=this.cooldowns.ultimateMax,this.player.blocking=!1,this.audio.play("ultimate"),this.cast={time:0,duration:.9,execute:()=>{const t=this.player.group.position.clone();this.spawnPillar(t,"#fff0a8",5,1.5),this.spawnRing(t,"#fff0a8",16,1),this.spawnRing(t,"#7ee8fa",11,.8),this.shake=Math.min(1,this.shake+.8);for(const i of this.enemies){if(i.dead||!i.active)continue;Ii(i.group.position,t)<16&&(this.damageEnemy(i,e.spellPower*2.6*It(.94,1.06),{spell:!0,crit:!0}),i.status.stun=Math.max(i.status.stun,1.2))}this.state.player.hp=Je(this.state.player.hp+e.maxHp*.25,0,e.maxHp),this.ui.toast("Juicio Celestial","La luz atraviesa el Velo.","level")}}}}}usePotion(e){if(this.frozen||this.player.dead||this.cooldowns.potion>0)return;const t=this.state.inventory.pocion_luz||0;if(t<=0){this.ui.toast("Sin pociones","Encuentra Pociones de Luz en cofres y misiones.","error");return}this.state.player.hp>=e.maxHp||(this.state.inventory.pocion_luz=t-1,this.state.player.hp=Je(this.state.player.hp+e.maxHp*.45,0,e.maxHp),this.cooldowns.potion=1,this.audio.play("potion"),this.spawnPillar(this.player.group.position,"#ffd58a",.55,.5))}receiveDamage(e,t=null){if(this.player.dead||this.iframe>0||this.frozen)return;const i=this.getStats();let n=e*this.difficulty.dmg,s=!1;if(this.player.blocking&&(this.time-this.blockStart<=i.parry&&this.state.player.sp>4?(this.state.player.sp-=4,s=!0,this.audio.play("parry"),this.spawnRing(this.player.group.position,"#fff0a8",3.2,.45),this.shake=Math.min(1,this.shake+.3),t&&!t.dead&&(t.status.stun=Math.max(t.status.stun,1.3))):(n*=.28,this.state.player.sp=Math.max(0,this.state.player.sp-9),this.audio.play("block"),this.spawnRing(this.player.group.position,"#7ee8fa",2.2,.3))),s)return;if(this.shield>0){const o=Math.min(this.shield,n);this.shield-=o,n-=o,this.shield<=0&&this.ui.toast("Coraza rota","El escudo de tu eco se ha disipado.","error")}const r=i.defense/(i.defense+70);n=Math.max(1,Math.round(n*(1-r))),this.state.player.hp=Math.max(0,this.state.player.hp-n),this.hurtTimer=.3,this.iframe=.35,this.audio.play("hit"),this.shake=Math.min(1,this.shake+.42),this.ui.spawnDamage(this.screenPosition(this.player.group.position.clone().add(Yt(0,1.6,0))),`-${n}`,"player"),this.state.player.hp<=0&&this.die()}damageEnemy(e,t,i={}){if(!e||e.dead)return;const n=e.status.weaken>0?1.25:1,s=e.defStat/(e.defStat+45);let r=Math.max(1,Math.round(t*(1-s)*n*It(.96,1.04)));i.crit&&(r=Math.round(r*1.35)),e.hp-=r,e.hurt=.24,e.aggro=!0,i.heavy&&(e.stagger=Math.max(e.stagger,.45));const o=e.group.position.clone().add(Yt(0,(e.def.height||2)*.75,0));this.ui.spawnDamage(this.screenPosition(o),`${i.crit?"✦":""}${r}`,i.crit?"crit":i.spell?"spell":""),i.crit&&this.audio.play("crit"),e.hp<=0&&this.killEnemy(e)}die(){this.player.dead||(this.player.dead=!0,this.state.player.hp=0,this.state.stats.deaths=(this.state.stats.deaths||0)+1,this.attack=null,this.cast=null,this.dodge=null,this.player.blocking=!1,this.deathShown=!1,this.deathTimer=0,this.audio.play("death"),this.audio.setTheme(this.state.region,!1),this.ui.hideBoss())}killEnemy(e){if(e.dead)return;e.dead=!0,e.deadProgress=0,e.deathTimer=0,e.attacking=!1,e.windup=0,this.state.stats.kills=(this.state.stats.kills||0)+1,this.spawnRing(e.group.position,e.def.boss?"#ffb347":"#7ee8fa",e.def.boss?8:3.5,.8),this.audio.play(e.def.boss?"victory":"hit");const t=e.def.essence||1;this.state.inventory.esencia_eco=(this.state.inventory.esencia_eco||0)+t,(e.def.boss||e.def.elite)&&(this.state.inventory.fragmentos=(this.state.inventory.fragmentos||0)+(e.def.boss?4:2)),this.gainXp(e.def.xp*(1+(e.level-1)*.08)),e.uid&&this.state.defeated.push(e.uid),e.spawn?.respawn?e.respawnTimer=9:e.respawnTimer=-1;const i=e.def.id,n=this.state.flags;if(i==="sombra"&&(n.sombras=(n.sombras||0)+1,this.state.mainStage===1&&this.bumpStageProgress(1,n.sombras,3)),i==="guardia"&&(n.guardias=(n.guardias||0)+1,this.state.mainStage===7&&this.bumpStageProgress(7,n.guardias,3)),i==="centinela"&&e.spawn?.seal&&this.breakSeal(e.spawn.seal),i==="devorador"){n.devoradorDead=!0;const s=this.state.sideQuests.deuda;s?.started&&!s.done&&(s.progress=1,this.ui.toast("Devorador derrotado","Vuelve con Kael en el Campamento de Ceniza.","quest"))}i==="guardian"&&this.onGuardianDeath(),i==="reina"&&this.onReinaDeath(),i==="vex"&&this.onVexDeath(),e.def.boss&&(this.ui.hideBoss(),this.audio.setTheme(this.state.region,!1),this.save())}bumpStageProgress(e,t,i){this.state.stageProgress[e]=Math.min(i,t),t>=i?this.advanceStage(e+1):this.save(),this.updateQuestMarker()}onGuardianDeath(){this.state.flags.guardianDead=!0,this.grantArmor("coraza_valdoria"),this.unlockRegion("drakmor"),this.advanceStage(5)}onReinaDeath(){this.state.flags.reinaDead=!0,this.grantArmor("manto_ceniza"),this.grantWeapon("filo_draconico"),this.unlockRegion("kansordore"),this.advanceStage(9)}onVexDeath(){this.state.flags.vexDead=!0,this.grantWeapon("espada_celestial"),this.grantArmor("armadura_celestial"),this.advanceStage(13)}gainXp(e){const t=this.state.player;t.xp+=Math.round(e);let i=!1;for(;t.xp>=t.xpNext;)t.xp-=t.xpNext,t.level+=1,t.skillPoints+=1,t.xpNext=Vr(t.level),i=!0;if(i){const n=this.getStats();t.hp=n.maxHp,t.mp=n.maxMp,t.sp=n.maxSp,this.audio.play("levelup"),this.spawnPillar(this.player.group.position,"#fff0a8",1.2,1.2),this.ui.toast("Nivel "+t.level,"La Espada recuerda una forma nueva. +1 punto de habilidad.","level"),this.save()}}update(e){if(this.time+=e,!!this.world){if(this.world.update(e),this.updateCamera(e),this.frozen){this.updateEffects(e),this.updateCompanion(e,!0),this.player.dead&&this.updateDeath(e);return}this.state.playTime=(this.state.playTime||0)+e,this.updatePlayer(e),this.updateEnemies(e),this.updateCreatures(e),this.updateNPCs(e),this.updateCompanion(e),this.updateProjectiles(e),this.updateTelegraphs(e),this.updateEffects(e),this.updateInteractions(),this.updateQuestTriggers(),this.updateBossBars(),this.ui.updateHUD(this,e),this.player.dead&&this.updateDeath(e),this.autoSaveTimer+=e,this.autoSaveTimer>75&&(this.autoSaveTimer=0,this.save())}}updateDeath(e){this.deathShown||(this.deathTimer+=e,this.deathTimer>1.15&&(this.deathShown=!0,this.frozen=!0,this.app.enterDeath()))}updateCamera(e,t=!1){if(!this.player.group)return;const i=this.player.group.position,n=this.inputVector(),s=Yt(i.x+n.x*1.2,i.y+15.5,i.z+17.5+n.z*1.2),r=t?100:5.2;t?this.camera.position.copy(s):(this.camera.position.x=Ge(this.camera.position.x,s.x,r,e),this.camera.position.y=Ge(this.camera.position.y,s.y,r,e),this.camera.position.z=Ge(this.camera.position.z,s.z,r,e)),this.shake=Math.max(0,this.shake-e*2.4);const o=this.shake>0?(Math.random()-.5)*this.shake*.55:0,c=this.shake>0?(Math.random()-.5)*this.shake*.4:0;this.camera.lookAt(i.x+o,i.y+1.45+c,i.z)}updateEnemies(e){for(const t of this.enemies){if(t.dead){t.deathTimer+=e,t.deadProgress=Math.min(1,t.deadProgress+e*1.8),qr(t.model,e,this.time,{dead:!0,deadProgress:t.deadProgress,showHp:!1,hp:0,maxHp:t.maxHp,boss:t.def.boss}),t.respawnTimer>0?(t.respawnTimer-=e,t.respawnTimer<=0&&this.respawnEnemy(t)):t.respawnTimer<0&&t.deathTimer>5&&(t.group.visible=!1);continue}if(!t.active){this.updateBossIntro(t),qr(t.model,e,this.time,{moveAmount:0,showHp:!1,hp:t.hp,maxHp:t.maxHp,boss:!0});continue}this.updateEnemyAI(t,e),this.updateEnemyModel(t,e)}}updateEnemyModel(e,t){const i=Ii(e.group.position,this.player.group.position)<22;e.hurt=Math.max(0,e.hurt-t),e.stagger=Math.max(0,e.stagger-t),qr(e.model,t,this.time,{moveAmount:e.moveAmount,attacking:e.attacking,attackProgress:e.attackProgress,combo:0,blocking:!1,hurt:e.hurt,stagger:e.stagger,dead:!1,deadProgress:0,casting:!1,castProgress:0,showHp:i||e.hurt>0,hp:e.hp,maxHp:e.maxHp,boss:e.def.boss,windup:e.windup>0?.4:0}),e.model.hpBar.rotation.y=-e.group.rotation.y;const n=this.world.heightAt(e.group.position.x,e.group.position.z);e.group.position.y=Ge(e.group.position.y,n,12,t),e.def.model==="wisp"&&(e.group.position.y+=.05)}updateEnemyAI(e,t){const i=this.player.group.position,n=i.x-e.group.position.x,s=i.z-e.group.position.z,r=Math.hypot(n,s),o=e.status;for(const l of["stun","root","slow","weaken"])o[l]=Math.max(0,o[l]-t);if(o.burn>0&&(o.burn-=t,e.hp-=(e.def.boss?3:5)*t,e.hp<=0)){this.killEnemy(e);return}e.attackCooldown=Math.max(0,e.attackCooldown-t),e.hurt=Math.max(0,e.hurt-t),e.stagger=Math.max(0,e.stagger-t);const c=e.def.boss?23:15;if(r<c&&(e.aggro=!0),e.def.boss&&e.hp<=e.maxHp*.5&&e.phase===1&&(e.phase=2,e.speed*=1.18,e.dmg*=1.12,this.spawnRing(e.group.position,"#ff8a4a",6,.9),this.ui.toast("FASE II",`${e.def.name} despierta su verdadera forma.`,"error"),this.shake=Math.min(1,this.shake+.5)),o.stun>0){e.moveAmount=0,e.attacking=!1;return}if(!e.aggro){e.moveAmount=0,e.patrolTimer-=t,e.patrolTimer<=0&&(e.patrolTimer=It(2.5,5.5),e.patrolAngle=Math.random()*Le);const l=e.home.x-e.group.position.x,d=e.home.z-e.group.position.z;if(Math.hypot(l,d)>1.5){const h=Math.hypot(l,d)||1;this.moveEnemy(e,l/h*e.speed*.22*t,d/h*e.speed*.22*t),e.moveAmount=.22}e.group.rotation.y=Cn(e.group.rotation.y,Math.atan2(n,s),4,t);return}if(r>.1){const l=Math.atan2(n,s);e.group.rotation.y=Cn(e.group.rotation.y,l,e.def.boss?5:8,t)}if(e.windup>0){e.windup-=t,e.attacking=!0,e.attackProgress=1-Math.max(0,e.windup)/(e.def.attackTime||.6),e.moveAmount=0,e.windup<=0&&(e.attacking=!1,this.enemyStrike(e,r));return}if(e.def.boss&&(e.specialTimer-=t,e.specialTimer<=0&&r<24&&(e.specialTimer=It(6,9),this.bossSpecial(e))),r<=e.range+.4&&e.attackCooldown<=0){e.windup=e.def.attackTime||.6,e.attackCooldown=(e.def.cooldown||1.7)*It(.9,1.15),e.attacking=!0,e.attackProgress=0,e.moveAmount=0,e.def.ranged&&this.spawnEnemyProjectile(e);return}if(r>e.range*.82&&o.root<=0){const l=o.slow>0?.5:1,d=e.speed*l,h=n/(r||1)*d*t,u=s/(r||1)*d*t;this.moveEnemy(e,h,u),e.moveAmount=1}else e.moveAmount=0}moveEnemy(e,t,i){const n=e.group.position,s=Mt[this.state.region]?.bounds||90,r=Je(n.x+t,-s,s),o=Je(n.z+i,-s,s);this.collides(r,n.z,e.radius*.7)||(n.x=r),this.collides(n.x,o,e.radius*.7)||(n.z=o)}enemyStrike(e,t){if(this.getStats(),e.def.ranged){this.spawnEnemyProjectile(e),e.attackCooldown=(e.def.cooldown||2)*1.1;return}if(t<=e.range+.9){this.receiveDamage(e.dmg*It(.9,1.12),e);const i=e.group.rotation.y;this.spawnSlash(e.group.position,i,1.7,e.def.boss?"#ff8a4a":"#ff7a6b")}e.attackCooldown=(e.def.cooldown||1.7)*It(.9,1.2)}spawnEnemyProjectile(e){const t=e.group.position.clone().add(Yt(0,e.def.height*.55,0)),n=this.player.group.position.clone().add(Yt(0,1,0)).sub(t).normalize(),s=e.def.model==="sentinel"?"#c6b7ff":"#ff8a4a",r=new H(new Gi(.22,8,6),new De({color:s,transparent:!0,opacity:.9,blending:ft}));r.position.copy(t);const o=new ls(new Nn({map:this.glowTexture(),color:s,transparent:!0,opacity:.65,depthWrite:!1,blending:ft}));o.scale.setScalar(1.4),r.add(o),this.scene.add(r),this.projectiles.push({mesh:r,pos:t.clone(),vel:n.multiplyScalar(9),life:4,dmg:e.dmg*.9,color:s,radius:.65})}bossSpecial(e){const t=this.player.group.position.clone(),i=e.group.position.clone();if(e.type==="guardian"){this.spawnTelegraph(t,4.2,1.15,e.dmg*1.25,"#9ef0ff");for(let n=0;n<4;n++){const s=n/4*Le;this.spawnRing(i.clone().add(Yt(Math.cos(s)*3,0,Math.sin(s)*3)),"#9ef0ff",3,.7)}this.ui.toast("El Guardián invoca","La piedra recuerda su juramento.","error")}else if(e.type==="reina"){this.spawnTelegraph(t,4.6,1.05,e.dmg*1.35,"#ff6b3d");for(let n=0;n<7;n++){const s=n/7*Le,r=i.clone().add(Yt(0,2,0)),o=Yt(Math.cos(s),.15,Math.sin(s)).normalize(),c=new H(new Gi(.24,8,6),new De({color:"#ff6b3d",transparent:!0,opacity:.9,blending:ft}));c.position.copy(r),this.scene.add(c),this.projectiles.push({mesh:c,pos:r.clone(),vel:o.multiplyScalar(7),life:4.2,dmg:e.dmg*.75,color:"#ff6b3d",radius:.65})}this.ui.toast("La Reina arde","La ceniza no distingue amigos.","error")}else if(e.type==="vex"){const n=Math.random()*Le,s=Je(t.x+Math.cos(n)*5,-80,80),r=Je(t.z+Math.sin(n)*5,-80,80);this.spawnRing(i,"#c6b7ff",4,.6),e.group.position.set(s,this.world.heightAt(s,r),r),this.spawnRing(e.group.position,"#ffd166",4,.6);for(let o=0;o<3;o++){const c=t.clone().add(Yt(It(-4,4),0,It(-4,4)));this.spawnTelegraph(c,2.6,1.3+o*.25,e.dmg*.95,"#ffd166")}this.ui.toast("Vex se desplaza","El Velo no tiene una sola puerta.","error")}this.audio.play("heavy")}updateBossIntro(e){if(e.introPlayed||this.frozen||Ii(e.group.position,this.player.group.position)>14)return;e.introPlayed=!0,this.frozen=!0,this.audio.setTheme(this.state.region,!0);const i=pv(e.type);this.ui.showDialogue({...i,onEnd:()=>{this.frozen=!1,e.active=!0,e.aggro=!0,this.ui.showBoss(e.def.name,e.hp,e.maxHp,e.phase),this.audio.setTheme(this.state.region,!0)}})}respawnEnemy(e){e.dead=!1,e.deadProgress=0,e.deathTimer=0,e.respawnTimer=0,e.hp=e.maxHp,e.active=!0,e.aggro=!1,e.group.visible=!0,e.group.position.set(e.home.x,this.world.heightAt(e.home.x,e.home.z),e.home.z),e.model.pose.dead=!1,e.model.body.rotation.x=0}updateBossBars(){const e=this.enemies.find(t=>t.def.boss&&!t.dead&&t.active&&Ii(t.group.position,this.player.group.position)<30);e?this.ui.showBoss(e.def.name,e.hp,e.maxHp,e.phase):this.ui.hideBoss()}glowTexture(){if(!this._glowTex){const e=document.createElement("canvas");e.width=64,e.height=64;const t=e.getContext("2d"),i=t.createRadialGradient(32,32,0,32,32,32);i.addColorStop(0,"rgba(255,255,255,1)"),i.addColorStop(.3,"rgba(255,255,255,.8)"),i.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=i,t.fillRect(0,0,64,64),this._glowTex=new sr(e)}return this._glowTex}updateProjectiles(e){const t=this.player.group.position;for(let i=this.projectiles.length-1;i>=0;i--){const n=this.projectiles[i];if(n.life-=e,n.pos.addScaledVector(n.vel,e),n.mesh.position.copy(n.pos),Ii(n.pos,t)<n.radius+.55&&Math.abs(n.pos.y-(t.y+1))<2.2){this.receiveDamage(n.dmg),this.spawnRing(n.pos,n.color,2,.35),this.removeProjectile(i);continue}n.life<=0&&this.removeProjectile(i)}}removeProjectile(e){const t=this.projectiles[e];t&&(this.scene.remove(t.mesh),t.mesh.geometry?.dispose(),t.mesh.material?.dispose(),this.projectiles.splice(e,1))}spawnTelegraph(e,t,i,n,s="#ff7a6b"){const r=new H(new Ci(t*.82,t,48),new De({color:s,transparent:!0,opacity:.5,side:pt,blending:ft,depthWrite:!1}));r.rotation.x=-Math.PI/2,r.position.set(e.x,this.world.heightAt(e.x,e.z)+.12,e.z),this.scene.add(r),this.telegraphs.push({pos:{x:e.x,z:e.z},radius:t,time:0,delay:i,damage:n,color:s,ring:r})}updateTelegraphs(e){for(let t=this.telegraphs.length-1;t>=0;t--){const i=this.telegraphs[t];i.time+=e;const n=Je(i.time/i.delay,0,1);i.ring.material.opacity=.22+n*.5,i.ring.scale.setScalar(.85+n*.15),i.time>=i.delay&&(this.scene.remove(i.ring),i.ring.geometry.dispose(),i.ring.material.dispose(),this.spawnRing(Yt(i.pos.x,this.world.heightAt(i.pos.x,i.pos.z),i.pos.z),i.color,i.radius,.5),Ii(i.pos,this.player.group.position)<i.radius+.5&&this.receiveDamage(i.damage),this.telegraphs.splice(t,1))}}spawnRing(e,t,i=3,n=.6){const s=new H(new Ci(.55,.72,40),new De({color:t,transparent:!0,opacity:.8,side:pt,blending:ft,depthWrite:!1}));s.rotation.x=-Math.PI/2,s.position.set(e.x,this.world.heightAt(e.x,e.z)+.14,e.z),this.scene.add(s),this.effects.push({mesh:s,time:0,duration:n,radius:i,type:"ring"})}spawnSlash(e,t,i=2,n="#bfe9ff"){const s=new Ci(i*.45,i,24,1,-.9,1.8),r=new H(s,new De({color:n,transparent:!0,opacity:.75,side:pt,blending:ft,depthWrite:!1}));r.rotation.x=-Math.PI/2,r.rotation.z=-t+Math.PI/2,r.position.set(e.x,this.world.heightAt(e.x,e.z)+1,e.z),this.scene.add(r),this.effects.push({mesh:r,time:0,duration:.28,type:"slash"})}spawnPillar(e,t,i=1,n=.8){const s=new H(new Jt(i*.55,i,14,20,1,!0),new De({color:t,transparent:!0,opacity:.38,side:pt,blending:ft,depthWrite:!1}));s.position.set(e.x,this.world.heightAt(e.x,e.z)+7,e.z),this.scene.add(s),this.effects.push({mesh:s,time:0,duration:n,type:"pillar"})}updateEffects(e){for(let t=this.effects.length-1;t>=0;t--){const i=this.effects[t];i.time+=e;const n=Je(i.time/i.duration,0,1);i.type==="ring"?(i.mesh.scale.setScalar(.5+n*i.radius*1.25),i.mesh.material.opacity=(1-n)*.8):i.type==="slash"?(i.mesh.scale.setScalar(.8+n*.8),i.mesh.material.opacity=(1-n)*.8):i.type==="pillar"&&(i.mesh.scale.y=.6+n*.7,i.mesh.material.opacity=(1-n)*.4),i.time>=i.duration&&(this.scene.remove(i.mesh),i.mesh.geometry?.dispose(),i.mesh.material?.dispose(),this.effects.splice(t,1))}}updateCreatures(e){for(const t of this.creatures){if(t.captured)continue;const i=Ii(t.group.position,this.player.group.position);if(t.wanderTimer-=e,i<9&&(t.group.rotation.y=Cn(t.group.rotation.y,Math.atan2(this.player.group.position.x-t.group.position.x,this.player.group.position.z-t.group.position.z),5,e)),t.wanderTimer<=0){t.wanderTimer=It(2.5,5);const s=Math.random()*Le,r=It(1.5,5);t.target={x:t.home.x+Math.cos(s)*r,z:t.home.z+Math.sin(s)*r}}if(t.target){const s=t.target.x-t.group.position.x,r=t.target.z-t.group.position.z,o=Math.hypot(s,r);if(o<.35)t.target=null;else{const l=t.group.position.x+s/o*1.1*e,d=t.group.position.z+r/o*1.1*e;this.collides(l,d,.3)||(t.group.position.x=l,t.group.position.z=d),t.group.rotation.y=Cn(t.group.rotation.y,Math.atan2(s,r),6,e),t.moving=!0}}else t.moving=!1;t.group.position.y=Ge(t.group.position.y,this.world.heightAt(t.group.position.x,t.group.position.z)+.08,10,e);const n=["bird","butterfly","seraph"].includes(t.species.model);Oc(t.model,e,this.time+t.phase,{hover:n,moving:t.moving})}}updateNPCs(e){for(const t of this.npcs)Ii(t.group.position,this.player.group.position)<7&&(t.group.rotation.y=Cn(t.group.rotation.y,Math.atan2(this.player.group.position.x-t.group.position.x,this.player.group.position.z-t.group.position.z),3,e)),nv(t.model,e,this.time),t.questSprite.visible=this.npcHasQuest(t.id)}npcHasQuest(e){const t=this.state.mainStage;return e==="lyra"&&(t===0||t===2)||e==="nima"&&!this.state.sideQuests.ecos?.started&&t>=1||e==="mira"&&!this.state.sideQuests.campanas?.started||e==="orin"&&!this.state.flags.orinGift||e==="kael"&&t===6}updateInteractions(){const e=this.player.group.position;let t=null,i=1/0;const n=(s,r,o,c,l,d,h={})=>{const u=Math.hypot(e.x-o,e.z-c);u<=l&&u<i&&(i=u,t={type:s,obj:r,x:o,z:c,radius:l,label:d,...h})};for(const s of this.npcs)n("npc",s,s.group.position.x,s.group.position.z,3.6,`Hablar con ${s.name}`);for(const s of this.creatures)s.captured||n("creature",s,s.group.position.x,s.group.position.z,4.2,`Resonar con ${s.species.name}`);for(const s of this.world.getInteractables())if(s.type==="chest"&&!s.opened&&n("chest",s,s.x,s.z,s.radius,"Abrir cofre"),s.type==="brazier"&&!s.lit&&n("brazier",s,s.x,s.z,s.radius,"Encender brasero"),s.type==="lamp"&&!s.lit&&n("lamp",s,s.x,s.z,s.radius,"Encender Lámpara del Alba"),s.type==="lore"&&!this.state.lore.includes(s.id)&&n("lore",s,s.x,s.z,s.radius,`Leer ${s.label}`),s.type==="waystone"&&n("waystone",s,s.x,s.z,s.radius,"Descansar en el altar"),s.type==="seal"&&!s.activated){const r=this.enemies.some(o=>!o.dead&&o.spawn?.seal===s.id);n("seal",s,s.x,s.z,s.radius,r?"El sello aún está custodiado":"Romper sello del Archivo",{guarded:r})}for(const s of this.extraInteractables)n("convergence",s,s.x,s.z,s.radius,"Afrontar la Convergencia");this.nearby=t,t?this.ui.showInteraction(`${t.label} · ${xv}`):this.ui.showInteraction("")}interact(){if(this.frozen||this.player.dead||!this.nearby)return;const e=this.nearby;e.type==="npc"?this.talkTo(e.obj):e.type==="creature"?this.requestCapture(e.obj):e.type==="chest"?this.openChest(e.obj):e.type==="brazier"?this.lightBrazier(e.obj):e.type==="lamp"?this.lightLamp(e.obj):e.type==="lore"?this.readLore(e.obj):e.type==="waystone"?this.restAtWaystone(e.obj):e.type==="seal"?e.guarded?this.ui.toast("Sello custodiado","Derrota al Centinela del Velo que lo protege.","error"):this.breakSeal(e.obj.id):e.type==="convergence"&&this.openConvergence()}openChest(e){if(e.opened)return;e.opened=!0,e.lid&&(e.lid.rotation.x=-1.1),this.state.stats.chests=(this.state.stats.chests||0)+1,this.state.flags.chestsOpened=this.state.flags.chestsOpened||[],this.state.flags.chestsOpened.push(e.id);const t=e.loot||{},i=[];t.essence&&(this.state.inventory.esencia_eco=(this.state.inventory.esencia_eco||0)+t.essence,i.push(`${t.essence} esencia`)),t.potion&&(this.state.inventory.pocion_luz=(this.state.inventory.pocion_luz||0)+t.potion,i.push(`${t.potion} poción${t.potion>1?"es":""}`)),t.fragments&&(this.state.inventory.fragmentos=(this.state.inventory.fragmentos||0)+t.fragments,i.push(`${t.fragments} fragmentos`)),this.chestBonus(e.id),this.audio.play("chest"),this.spawnPillar(Yt(e.x,0,e.z),"#f4d58d",.7,.7),this.ui.toast("Cofre abierto",i.join(" · ")||"Un recuerdo del Velo.","quest"),this.save()}chestBonus(e){e==="chest_val_3"&&this.grantArmor("coraza_valdoria"),e==="chest_drak_2"&&this.grantCharm("anillo_resonancia"),e==="chest_kan_1"&&this.grantCharm("lagrima_brasa"),e==="chest_kan_3"&&this.grantCharm("pluma_eco"),e==="chest_ruins"&&this.grantCharm("amuleto_lumi")}lightBrazier(e){if(e.lit)return;e.lit=!0,e.flame.material.opacity=.9,e.flame.scale.setScalar(2.1),this.state.flags.braziersLit=this.state.flags.braziersLit||[],this.state.flags.braziersLit.push(e.id);const t=this.state.flags.braziersLit.length;this.state.flags.braziers=t;const i=this.state.sideQuests.campanas;i?.started&&!i.done&&(i.progress=t),this.audio.play("spell"),this.spawnPillar(Yt(e.x,0,e.z),"#ffb347",.8,.8),this.ui.toast("Brasero encendido",`${t} de 3. Lumen recuerda un poco más.`,"quest"),t>=3&&i?.started&&!i.done&&this.ui.toast("Campanas dormidas","Vuelve con la Anciana Mira.","quest"),this.save()}lightLamp(e){if(e.lit)return;e.lit=!0,e.flame.material.opacity=.9,e.flame.scale.setScalar(2.4),this.state.flags.lampsLit=this.state.flags.lampsLit||[],this.state.flags.lampsLit.push(e.id);const t=this.state.flags.lampsLit.length;this.state.flags.lamps=t,this.state.mainStage===3&&(this.state.stageProgress[3]=t),this.audio.play("seal"),this.spawnPillar(Yt(e.x,0,e.z),"#9ef0ff",1,1),this.ui.toast("Lámpara del Alba",`${t} de 3 encendidas.`,"quest"),t>=3&&this.state.mainStage===3&&(this.advanceStage(4),this.ensureBosses(),this.ui.toast("El Santuario despierta","Algo enorme se alza entre las piedras.","error")),this.updateQuestMarker(),this.save()}breakSeal(e){if(!e||(this.state.flags.sealsBroken=this.state.flags.sealsBroken||[],this.state.flags.sealsBroken.includes(e)))return;this.state.flags.sealsBroken.push(e);const t=this.world.getInteractables().find(s=>s.type==="seal"&&s.id===e);t&&(t.activated=!0);const i=this.world.dynamic.find(s=>s.type==="seal"&&s.id===e);i&&(i.ring.visible=!1,i.mesh.material.color.set("#555064"));const n=this.state.flags.sealsBroken.length;this.state.flags.seals=n,this.state.mainStage===10&&(this.state.stageProgress[10]=n),this.audio.play("seal"),this.spawnPillar(Yt(t?.x||0,0,t?.z||0),"#c6b7ff",1.4,1.1),this.ui.toast("Sello roto",`${n} de 3. El Archivo recuerda tu nombre.`,"quest"),n>=3&&this.state.mainStage===10&&(this.advanceStage(11),this.ui.toast("La Cumbre se abre","Sube al norte. Vex te espera.","quest")),this.updateQuestMarker(),this.save()}readLore(e){if(this.state.lore.includes(e.id))return;this.state.lore.push(e.id),e.mesh.visible=!1;const t=this.state.sideQuests.memoria;t?.started&&!t.done&&(t.progress=this.state.lore.length),this.audio.play("quest"),this.spawnPillar(Yt(e.x,0,e.z),"#f4d58d",.8,.8);const i=e.data||sl.find(n=>n.id===e.id);this.frozen=!0,this.ui.showDialogue({speaker:i?.name||"Eco del pasado",portrait:"lyra",lines:[i?.text||"El recuerdo se deshace antes de que puedas leerlo."],onEnd:()=>{this.frozen=!1,t?.started&&!t.done&&this.state.lore.length>=3&&this.ui.toast("Memorias reunidas","Vuelve con Lyra.","quest"),this.save()}})}restAtWaystone(e){const t=this.getStats();this.state.player.hp=t.maxHp,this.state.player.mp=t.maxMp,this.state.player.sp=t.maxSp,this.state.checkpoint={region:this.state.region,x:e.x,z:e.z},this.audio.play("quest"),this.spawnRing(Yt(e.x,0,e.z),"#7ee8fa",5,.9),this.ui.toast("Altar de Resonancia","Vida, maná y aguante restaurados. Punto de retorno fijado.","level"),this.save()}requestCapture(e){if(e.captured)return;const t=this.getStats(),i={Común:.12,Raro:.02,Épico:-.08,Legendario:-.18}[e.species.rarity]||0,n=Je(t.capture+i,.12,.94),s=(this.state.inventory.esencia_eco||0)>0;this.captureTarget=e,this.frozen=!0,this.ui.showCapture(e.species,n,s,()=>this.confirmCapture(),()=>this.cancelCapture())}confirmCapture(){const e=this.captureTarget;if(!e)return;if((this.state.inventory.esencia_eco||0)<=0){this.ui.toast("Sin esencia","Necesitas Esencia de Eco para resonar.","error");return}this.state.inventory.esencia_eco-=1;const t=this.getStats(),i={Común:.12,Raro:.02,Épico:-.08,Legendario:-.18}[e.species.rarity]||0,n=Je(t.capture+i,.12,.94),s=Math.random()<n;if(this.ui.hideCapture(),this.captureTarget=null,this.frozen=!1,!s){this.audio.play("error"),this.spawnRing(e.group.position,"#ff7a6b",2.5,.5),this.ui.toast("La resonancia falla",`${e.species.name} se aleja entre la hierba.`,"error"),e.home={x:Je(e.home.x+It(-8,8),-80,80),z:Je(e.home.z+It(-8,8),-80,80)},this.save();return}const r=this.state.creatures.find(c=>c.id===e.speciesId);r?(r.level=Math.min(5,(r.level||1)+1),this.ui.toast("Eco reforzado",`${e.species.name} alcanza el nivel ${r.level}.`,"capture")):(this.state.creatures.push({id:e.speciesId,level:1,active:this.state.creatures.length===0}),this.ui.toast("Eco capturado",`${e.species.name} · ${e.species.title}`,"capture")),this.state.stats.captures=(this.state.stats.captures||0)+1,e.captured=!0,e.group.visible=!1,this.audio.play("capture"),this.spawnPillar(e.group.position,e.species.colors.accent,1.2,1.1),this.spawnRing(e.group.position,e.species.colors.accent,4,.9);const o=this.state.sideQuests.ecos;o?.started&&!o.done&&(o.progress=this.state.creatures.length,o.progress>=3&&this.ui.toast("Jardín de Nima","Vuelve con Nima en Lumen.","quest")),this.state.creatures.length===1&&this.spawnCompanion(),this.save()}cancelCapture(){this.ui.hideCapture(),this.captureTarget=null,this.frozen=!1}talkTo(e){if(this.frozen)return;const t=e.id;let i=null;t==="lyra"?i=cv(this.state):t==="nima"?i=dv(this.state):t==="mira"?i=hv(this.state):t==="orin"?i=uv(this.state):t==="kael"&&(i=fv(this.state)),i&&(this.frozen=!0,this.ui.showDialogue({...i,onEnd:n=>{this.frozen=!1,this.resolveNpcEnd(t,n)}}))}resolveNpcEnd(e,t){const i=this.state,n=i.mainStage;if(e==="lyra")if(n===0)t?.id==="ask"&&this.ui.toast("La Espada Celestial","No fue forjada para matar. Fue forjada para recordar.","quest"),this.advanceStage(1);else if(n===2)this.advanceStage(3);else{const s=i.sideQuests.memoria;!s?.started&&n>=3&&t?.id==="accept"?this.startSideQuest("memoria"):s?.started&&!s.done&&i.lore.length>=3&&(this.completeSideQuest("memoria"),this.grantArmor("vestiduras_astrales"))}else if(e==="nima"){const s=i.sideQuests.ecos;!s?.started&&t?.id==="accept"?this.startSideQuest("ecos"):s?.started&&!s.done&&i.creatures.length>=3&&(this.completeSideQuest("ecos"),this.grantCharm("amuleto_lumi"))}else if(e==="mira"){const s=i.sideQuests.campanas;!s?.started&&t?.id==="accept"?this.startSideQuest("campanas"):s?.started&&!s.done&&(i.flags.braziers||0)>=3&&(this.completeSideQuest("campanas"),i.inventory.pocion_luz=(i.inventory.pocion_luz||0)+3,i.inventory.esencia_eco=(i.inventory.esencia_eco||0)+4,this.ui.toast("Recompensa","3 Pociones de Luz y 4 Esencia de Eco.","quest"))}else if(e==="orin")i.flags.orinGift||(i.flags.orinGift=!0,i.inventory.fragmentos=(i.inventory.fragmentos||0)+2,this.ui.toast("Regalo de Orin","2 Fragmentos de cielo. La forja te espera.","quest"));else if(e==="kael"){const s=i.sideQuests.deuda;n===6?(t?.id==="deuda"&&this.startSideQuest("deuda"),this.advanceStage(7)):s?.started&&!s.done&&i.flags.devoradorDead&&(this.completeSideQuest("deuda"),this.grantWeapon("filo_draconico"))}this.save(),this.updateQuestMarker()}startSideQuest(e){const t=Bo[e];!t||this.state.sideQuests[e]?.started||(this.state.sideQuests[e]={started:!0,done:!1,progress:0},this.audio.play("quest"),this.ui.toast("Misión secundaria",t.name,"quest"),this.save())}completeSideQuest(e){const t=Bo[e],i=this.state.sideQuests[e];!t||!i||i.done||(i.done=!0,i.progress=t.target,this.state.stats.quests=(this.state.stats.quests||0)+1,this.audio.play("quest"),this.ui.toast("Misión completada",`${t.name} · ${t.reward}`,"level"),this.save())}startIntro(){this.introPlayed||(this.introPlayed=!0,this.frozen=!0,this.ui.showCinematic({...ov(this.state.player.name),onEnd:()=>{this.frozen=!1,this.ui.toast("La llamada del Velo","Habla con Lyra en la plaza de Lumen.","quest"),this.save()}}))}playCinematic(e,t){if(!e){t?.();return}this.frozen=!0,this.ui.showCinematic({...e,onEnd:()=>{this.frozen=!1,t?.()}})}advanceStage(e){const t=Je(e,0,Pn.length-1);if(!(t<=this.state.mainStage)){if(this.state.mainStage=t,this.updateQuestMarker(),this.audio.play("quest"),t===5)this.playCinematic(Ia(5),()=>{this.ui.toast("Drakmor desbloqueada","Abre el mapa y viaja al Campamento de Ceniza.","quest"),this.save()});else if(t===9)this.playCinematic(Ia(9),()=>{this.ui.toast("Kansordore desbloqueada","El Archivo Prohibido espera.","quest"),this.save()});else if(t===11)this.playCinematic(Ia(11),()=>{this.ui.toast("La Cumbre de la Convergencia","Asciende al norte del Archivo.","quest"),this.save()});else if(t===13)this.playCinematic(Ia(13),()=>{this.ui.toast("La Espada Celestial","Afronta la Convergencia en la Cumbre.","level"),this.save()});else{const i=Pn[t];i&&this.ui.toast("Nuevo objetivo",i.objective,"quest"),this.save()}this.checkStageAuto()}}checkStageAuto(){const e=this.state,t=e.flags;e.mainStage===1&&(t.sombras||0)>=3&&this.advanceStage(2),e.mainStage===3&&(t.lamps||0)>=3&&(this.advanceStage(4),this.ensureBosses()),e.mainStage===7&&(t.guardias||0)>=3&&(this.advanceStage(8),this.ensureBosses()),e.mainStage===10&&(t.seals||0)>=3&&this.advanceStage(11)}unlockRegion(e){this.state.unlockedRegions.includes(e)||(this.state.unlockedRegions.push(e),this.ui.toast("Región desbloqueada",Mt[e].name,"level"),this.save())}updateQuestTriggers(){const e=this.state;e.region==="kansordore"&&e.mainStage===11&&Math.hypot(this.player.group.position.x-0,this.player.group.position.z+62)<17&&(this.advanceStage(12),this.ensureBosses(),this.ui.toast("La Cumbre","Vex, el Custodio del Velo, te espera.","error"))}openConvergence(){this.frozen||this.state.mainStage<13||(this.frozen=!0,this.ui.showDialogue({...mv(this.state),onEnd:e=>{this.frozen=!1,e?.id?this.completeEnding(e.id):this.ui.toast("La Convergencia espera","Vuelve cuando hayas decidido.","quest")}}))}completeEnding(e){const t=e||"restaurar";this.state.ending=t,this.audio.play("victory"),this.save(),this.playCinematic(gv(t,this.state.player.name),()=>{this.app.enterEnding(t),this.save()})}getQuestInfo(){const e=this.state,t=Pn[e.mainStage]||Pn[0];let i=0,n=t.progress||0;return e.mainStage===1&&(i=Math.min(3,e.flags.sombras||0)),e.mainStage===3&&(i=Math.min(3,e.flags.lamps||0)),e.mainStage===7&&(i=Math.min(3,e.flags.guardias||0)),e.mainStage===10&&(i=Math.min(3,e.flags.seals||0)),{kind:"MISIÓN PRINCIPAL",step:vv[e.mainStage]||"I",title:t.title,objective:t.objective,progress:i,total:n}}updateQuestMarker(){if(!this.world)return;const e=this.state,t=this.world.regionId,i=e.mainStage;let n=null,s="";if(i===0||i===2){if(t==="valdoria"){const r=this.npcs.find(o=>o.id==="lyra");n=r?{x:r.group.position.x,z:r.group.position.z}:{x:4,z:5},s="Lyra"}}else if(i===1)t==="valdoria"&&(n={x:24,z:-16},s="Sombras del Velo");else if(i===3||i===4)t==="valdoria"&&(n=this.world.landmarks.shrine,s=i===3?"Lámparas del Alba":"Guardián Astado");else if(i===6){if(t==="drakmor"){const r=this.npcs.find(o=>o.id==="kael");n=r?{x:r.group.position.x,z:r.group.position.z}:this.world.landmarks.camp,s="Kael"}}else if(i===7)t==="drakmor"&&(n=this.world.landmarks.gate,s="Puerta de Obsidiana");else if(i===8)t==="drakmor"&&(n=this.world.landmarks.fortress?.arena||this.world.landmarks.fortress,s="Reina Ceniza");else if(i===10){if(t==="kansordore"){const r=new Set(e.flags.sealsBroken||[]),o=this.world.getInteractables().find(c=>c.type==="seal"&&!r.has(c.id));n=o?{x:o.x,z:o.z}:null,s="Sello del Archivo"}}else(i===11||i===12||i===13)&&t==="kansordore"&&(n=i===13?{x:0,z:-50}:this.world.landmarks.summit,s=i===13?"La Convergencia":"Cumbre de la Convergencia");this.world.setQuestTarget(n,s)}grantWeapon(e){if(ni[e]){if(this.state.ownedWeapons.includes(e)){this.state.inventory.fragmentos=(this.state.inventory.fragmentos||0)+2;return}this.state.ownedWeapons.push(e),this.ui.toast("Arma obtenida",ni[e].name,"level"),this.audio.play("quest")}}grantArmor(e){if(_i[e]){if(this.state.ownedArmors.includes(e)){this.state.inventory.fragmentos=(this.state.inventory.fragmentos||0)+2;return}this.state.ownedArmors.push(e),this.ui.toast("Armadura obtenida",_i[e].name,"level"),this.audio.play("quest")}}grantCharm(e){if(fn[e]){if(this.state.ownedCharms.includes(e)){this.state.inventory.fragmentos=(this.state.inventory.fragmentos||0)+1;return}this.state.ownedCharms.push(e),this.ui.toast("Talismán obtenido",fn[e].name,"level"),this.audio.play("quest")}}serialize(){const e=this.state;return this.player.group&&(e.lastPosition={x:this.player.group.position.x,z:this.player.group.position.z}),{version:1,savedAt:Date.now(),playTime:e.playTime,difficulty:e.difficulty,player:e.player,region:e.region,mainStage:e.mainStage,stageProgress:e.stageProgress,sideQuests:e.sideQuests,lore:e.lore,creatures:e.creatures,inventory:e.inventory,ownedWeapons:e.ownedWeapons,ownedArmors:e.ownedArmors,ownedCharms:e.ownedCharms,upgrades:e.upgrades,skills:e.skills,unlockedRegions:e.unlockedRegions,flags:e.flags,stats:e.stats,defeated:e.defeated,ending:e.ending,checkpoint:e.checkpoint,lastPosition:e.lastPosition}}save(e=!1){try{localStorage.setItem(Xd,JSON.stringify(this.serialize())),e&&this.ui.toast("Partida guardada","La Espada recuerda este momento.","quest"),this.app?.ui?.updateContinueButton?.()}catch{e&&this.ui.toast("No se pudo guardar","El almacenamiento del navegador no está disponible.","error")}}travelTo(e){if(Mt[e]){if(!this.state.unlockedRegions.includes(e)){this.ui.toast("Región bloqueada","Aún no puedes cruzar ese umbral.","error");return}if(this.state.region===e){this.ui.toast("Ya estás aquí",Mt[e].name,"quest");return}this.app.closeMap(),this.loadRegion(e,Mt[e].spawn),this.state.checkpoint={region:e,x:Mt[e].spawn.x,z:Mt[e].spawn.z},this.ui.toast("Viaje rápido",Mt[e].name,"quest"),this.audio.play("quest"),this.state.mainStage===5&&e==="drakmor"&&this.advanceStage(6),this.state.mainStage===9&&e==="kansordore"&&this.advanceStage(10),this.updateQuestMarker(),this.save()}}revive(){const e=this.getStats(),t=this.state.checkpoint;t&&Mt[t.region]&&t.region!==this.state.region?this.loadRegion(t.region,t):t&&this.placePlayer(t.x,t.z);const i=this.state.player;i.hp=Math.round(e.maxHp*.65),i.mp=Math.round(e.maxMp*.55),i.sp=e.maxSp,this.player.dead=!1,this.deathShown=!1,this.deathTimer=0,this.iframe=1.5,this.attack=null,this.cast=null,this.dodge=null,this.shake=0,this.player.model&&(this.player.model.pose.dead=!1,this.player.model.pose.deadProgress=0),this.spawnPillar(this.player.group.position,"#7ee8fa",1.2,1.2),this.ui.toast("La Espada te recuerda","Continúas desde el último altar.","level"),this.app.resumeFromDeath(),this.save()}dispose(){this.scene&&Fc(this.scene),this.scene=null,this.world=null,this.enemies=[],this.creatures=[],this.npcs=[],this.projectiles=[],this.effects=[],this.telegraphs=[],this.companion=null,this.audio.setTheme("title",!1)}}function Zd(a,e,t,i,n={}){const s=new Gi(n.radius||120,32,20),r=new Vi({side:Vt,depthWrite:!1,fog:!1,uniforms:{topColor:{value:new Ce(a)},bottomColor:{value:new Ce(e)},sunColor:{value:new Ce(t)},sunDir:{value:new I(...i).normalize()}},vertexShader:`
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform vec3 sunColor;
      uniform vec3 sunDir;
      varying vec3 vWorldPosition;
      void main() {
        vec3 dir = normalize(vWorldPosition);
        float h = max(0.0, dir.y);
        vec3 col = mix(bottomColor, topColor, pow(h, 0.72));
        float sun = pow(max(dot(dir, normalize(sunDir)), 0.0), 260.0);
        float halo = pow(max(dot(dir, normalize(sunDir)), 0.0), 8.0);
        col += sunColor * sun * 2.0 + sunColor * halo * 0.18;
        gl_FragColor = vec4(col, 1.0);
      }
    `}),o=new H(s,r);return o.frustumCulled=!1,o}function _v(a,e,t,i,n,s){const r=new Td,o=tn(Math.floor(Math.abs(e*13+t*7))+1);r.moveTo(-i/2,0);const c=9;for(let u=0;u<=c;u++){const f=-i/2+i*u/c,p=u===0||u===c?0:n*(.25+o()*.75);r.lineTo(f,p)}r.lineTo(i/2,0);const l=new tl(r),d=new De({color:s,fog:!1,side:pt}),h=new H(l,d);return h.position.set(e,-2,t),a.add(h),h}function $r(a,e,t,i,n,s=1){const r=tn(s),o=new Te;o.position.set(e,t,i);const c=Pe("#3b3a55",{roughness:.95}),l=ja("#5b7b54"),d=Ze(3.2*n,3.6*n,.8*n,l,8);d.position.y=0,o.add(d);const h=new H(new vt(3.4*n,4.2*n,8),c);h.position.y=-2.5*n,h.rotation.y=Math.PI/8,o.add(h);for(let u=0;u<7;u++){const f=new H(new ki((.3+r()*.8)*n,0),c),p=r()*Le,v=(1.4+r()*2.2)*n;f.position.set(Math.cos(p)*v,-1.2*n-r()*2.2*n,Math.sin(p)*v),f.rotation.set(r()*Le,r()*Le,r()*Le),o.add(f)}for(let u=0;u<5;u++){const f=new Te,p=r()*Le,v=r()*2.4*n;f.position.set(Math.cos(p)*v,.4*n,Math.sin(p)*v);const g=Ze(.08*n,.14*n,1.4*n,Pe("#5b4131"),5);g.position.y=.7*n,f.add(g);const m=new H(new hs(.75*n,0),ja(u%2?"#6f8f5b":"#7a9c66"));m.position.y=1.7*n,f.add(m),o.add(f)}return st(o,"#7ee8fa",8*n,[0,-.6*n,0],.08),a.add(o),o}class yv{constructor(e){this.renderer=e,this.scene=new Zo,this.scene.fog=new Qs("#0b1830",.008),this.camera=new di(45,1,.1,300),this.camera.position.set(0,4.6,14),this.time=0,this.build()}build(){this.scene.add(Zd("#07152e","#ef9f6f","#ffd9a0",[.25,.3,-1],{radius:160}));const e=ri("#ffd9a0",26,.55);e.position.set(34,28,-95),this.scene.add(e);const t=tn(31),i=[];for(let m=0;m<500;m++){const _=t()*Le,M=Math.acos(t()*.8),y=150;i.push(y*Math.sin(M)*Math.cos(_),y*Math.cos(M),y*Math.sin(M)*Math.sin(_))}const n=new Ct;n.setAttribute("position",new Qe(i,3)),this.stars=new Uo(n,new Za({color:"#d8ecff",size:.9,transparent:!0,opacity:.55,depthWrite:!1,blending:ft})),this.scene.add(this.stars);for(let m=0;m<5;m++){const _=-65-m*16;_v(this.scene,-50+m*24,_,80+m*20,18+m*8,m%2?"#172a46":"#102039")}const s=new H(new Jt(24,19,7,7),Pe("#2b3146",{roughness:1}));s.position.set(0,-5.5,0),this.scene.add(s);const r=new H(new Qi(23,32),ja("#3e4d4c"));r.rotation.x=-Math.PI/2,r.position.y=-1.95,this.scene.add(r);const o=Pe("#8b8578",{roughness:.9});for(const m of[-1,1]){const _=Ze(.65,.9,7,o,6);_.position.set(m*4.2,1.5,-1.5),_.rotation.z=m*.03,this.scene.add(_);const M=Fe(1.7,.45,1.7,o);M.position.set(m*4.2,5.2,-1.5),this.scene.add(M)}const c=Fe(10,.8,1.4,o);c.position.set(0,5.75,-1.5),c.rotation.z=.02,this.scene.add(c);const l=new Te;l.position.set(0,-1.7,.2);const d=Ze(2.1,2.5,.7,o,8);d.position.y=.35,l.add(d);const h=Fe(1.4,1,1.4,o);h.position.y=1.2,h.rotation.y=Math.PI/4,l.add(h),this.scene.add(l);const u=Ln("espada_celestial",4.2);u.position.set(0,3,.2),u.rotation.set(.12,.45,.03),this.scene.add(u),this.sword=u,st(u,"#fff0a8",8,[0,1.2,0],.45);const f=new H(new Tt(4.2,.035,4,64),new De({color:"#f4d58d",transparent:!0,opacity:.4,blending:ft}));f.position.set(0,2.6,.2),f.rotation.x=Math.PI/2,this.scene.add(f),this.ring=f,$r(this.scene,-12,7,-18,1.25,4),$r(this.scene,14,11,-28,.85,9),$r(this.scene,7,2.2,-11,.45,12);const p=tn(7);for(let m=0;m<24;m++){const _=p()*Le,M=9+p()*12,y=new H(new ki(.4+p()*1.1,0),Pe(p()>.5?"#3c4353":"#4b4a52"));y.position.set(Math.cos(_)*M,-1.8+p()*.4,Math.sin(_)*M),y.rotation.set(p()*Le,p()*Le,p()*Le),this.scene.add(y)}this.scene.add(new il("#9dc8ff","#1b1a2c",1.4));const v=new fs("#ffd9a0",2.6);v.position.set(12,20,12),this.scene.add(v);const g=new fs("#7ee8fa",1.6);g.position.set(-14,8,-8),this.scene.add(g),this.particles=[];for(let m=0;m<90;m++){const _=ri(m%3?"#ffd58a":"#7ee8fa",.12+p()*.28,.3+p()*.5);_.position.set((p()-.5)*30,p()*14-1,(p()-.5)*24),_.userData={baseY:_.position.y,phase:p()*Le,speed:.15+p()*.4},this.scene.add(_),this.particles.push(_)}this.clouds=[];for(let m=0;m<8;m++){const _=new ls(new Nn({map:al(),color:"#d5c5c0",transparent:!0,opacity:.06,depthWrite:!1}));_.scale.set(30+p()*30,8+p()*8,1),_.position.set((p()-.5)*120,18+p()*18,-50-p()*50),this.scene.add(_),this.clouds.push(_)}}update(e){this.time+=e;const t=this.time;this.camera.position.x=Math.sin(t*.1)*3.4,this.camera.position.y=4.3+Math.sin(t*.17)*.5,this.camera.position.z=13.5+Math.cos(t*.1)*.8,this.camera.lookAt(0,2.8,0),this.sword.rotation.y=.45+Math.sin(t*.22)*.08,this.sword.userData.gem.rotation.y+=e*.9,this.ring.rotation.z+=e*.18,this.ring.material.opacity=.3+Math.sin(t*1.3)*.1,this.stars.rotation.y+=e*.004;for(const i of this.particles)i.position.y=i.userData.baseY+Math.sin(t*i.userData.speed+i.userData.phase)*1.8,i.material.opacity=.25+Math.sin(t*2+i.userData.phase)*.2;for(const i of this.clouds)i.position.x+=e*.2}resize(e,t){this.camera.aspect=e/t,this.camera.updateProjectionMatrix()}}class Mv{constructor(e){this.renderer=e,this.scene=new Zo,this.scene.fog=new Qs("#0b1228",.045),this.camera=new di(38,1,.1,60),this.camera.position.set(0,1.6,4.4),this.time=0,this.model=null,this.manualYaw=0,this.build()}build(){this.scene.add(Zd("#07152e","#2a3b5e","#ffd9a0",[.2,.6,1],{radius:40})),this.scene.add(new il("#b9dcff","#1a1d2c",1.3));const e=new fs("#ffe2b0",3);e.position.set(3,5,4),e.castShadow=!0,e.shadow.mapSize.set(512,512),this.scene.add(e);const t=new fs("#7ee8fa",2.2);t.position.set(-4,3,-2),this.scene.add(t);const i=new Te,n=Ze(1.5,1.8,.22,Pe("#3d4256",{metalness:.2,roughness:.7}),32);i.add(n);const s=new H(new Tt(1.25,.025,4,64),new De({color:"#f4d58d",transparent:!0,opacity:.65,blending:ft}));s.rotation.x=Math.PI/2,s.position.y=.14,i.add(s);const r=new H(new Ci(.5,1.1,64),new De({color:"#7ee8fa",transparent:!0,opacity:.12,side:pt,blending:ft}));r.rotation.x=-Math.PI/2,r.position.y=.16,i.add(r),this.platform=i,this.scene.add(i),this.particles=[];const o=tn(55);for(let c=0;c<45;c++){const l=ri(c%2?"#ffd58a":"#7ee8fa",.08+o()*.16,.4);l.position.set((o()-.5)*5,.3+o()*4,(o()-.5)*4),l.userData={baseY:l.position.y,phase:o()*Le},this.scene.add(l),this.particles.push(l)}this.ring=s}setProfile(e){this.model&&this.scene.remove(this.model.group);const t=e.appearance||{};this.model=rl(t,e.weapon||"filo_aurora",e.armor||"tunica_viajero",e.headgear||"ninguno"),this.model.group.position.y=0,this.model.group.rotation.y=Math.PI,this.scene.add(this.model.group)}update(e){this.time+=e;const t=this.time;this.model&&(this.model.pose.moving=0,this.model.pose.time+=e,this.model.group.rotation.y=Math.PI+Math.sin(t*.35)*.22+this.manualYaw,this.model.group.position.y=0+Math.sin(t*1.2)*.01),this.platform.rotation.y+=e*.08,this.ring.rotation.z+=e*.15,this.camera.position.x=Math.sin(t*.12)*.35,this.camera.lookAt(0,1.15,0);for(const i of this.particles)i.position.y=i.userData.baseY+Math.sin(t*.8+i.userData.phase)*.35}resize(e,t){this.camera.aspect=e/t,this.camera.updateProjectionMatrix()}}const q=a=>document.getElementById(a),Ue=a=>String(a??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),kc={music:.55,sfx:.8,quality:"auto",fontScale:1,reduceMotion:!1,highContrast:!1,damageNumbers:!0,autoTarget:!0,screenShake:!0,leftHanded:!1};let Jd=0;function Bc(a="player",e={},t={}){const i=`p${++Jd}`,n={lyra:{skin:"#e8bd9d",hair:"#dbe7ee",outfit:"#40356b",accent:"#c6b7ff",style:"largo",eye:"#7ee8fa",name:"Lyra"},nima:{skin:"#b97a54",hair:"#5b3522",outfit:"#2f6a57",accent:"#b8f59e",style:"trenza",eye:"#d7ffc7",name:"Nima"},mira:{skin:"#d6a57f",hair:"#dbe7ee",outfit:"#6b3e4a",accent:"#f4d58d",style:"largo",eye:"#c2a36b",name:"Mira"},orin:{skin:"#8a5638",hair:"#241d2e",outfit:"#5d3e32",accent:"#ffb347",style:"rapado",eye:"#f4d58d",name:"Orin"},kael:{skin:"#c58a5e",hair:"#241d2e",outfit:"#4a2228",accent:"#ff8a4a",style:"corto",eye:"#ffd166",name:"Kael"},vex:{skin:"#d8d2e8",hair:"#e9e5f7",outfit:"#282143",accent:"#ffd166",style:"largo",eye:"#fff2c4",name:"Vex"},player:{skin:e.skinColor||"#e2b184",hair:e.hairColor||"#241d2e",outfit:e.outfitColor||"#2e5877",accent:e.accentColor||"#f4d58d",style:e.hairStyle||"corto",eye:"#b9e7ff",name:e.name||"Aurel"}},s=n[a]||n.player,o=s.style==="largo"||s.style==="trenza"?`<path d="M50 112 C38 150 42 196 66 212 L134 212 C158 196 162 150 150 112 C142 142 58 142 50 112Z" fill="${s.hair}"/>`:"",c=s.style==="trenza"?`<path d="M143 145 C158 160 158 190 146 212" stroke="${s.hair}" stroke-width="14" fill="none" stroke-linecap="round"/>
       <path d="M143 177 l12 -4 M146 191 l11 2" stroke="${s.accent}" stroke-width="3" fill="none"/>`:"",l=s.style==="rapado"?`<path d="M62 105 C66 68 134 68 138 105 C124 90 76 90 62 105Z" fill="${s.hair}" opacity=".95"/>`:`<path d="M55 112 C52 72 78 52 100 52 C126 52 150 74 146 112 C136 92 126 83 111 80 C98 92 79 94 68 104 C64 108 60 111 55 112Z" fill="${s.hair}"/>
       <path d="M69 99 C81 75 118 73 135 96 C118 88 90 89 69 99Z" fill="${s.hair}" opacity=".8"/>`,d=t.headgear==="diadema"||a==="lyra"||a==="vex"?`<path d="M61 88 Q100 70 139 88" stroke="${s.accent}" stroke-width="3" fill="none"/>
       <path d="M100 76 l7 10 -7 10 -7 -10Z" fill="${s.accent}"/>`:"",h=t.headgear==="celada"?`<path d="M55 104 C55 68 80 48 100 48 C122 48 146 68 146 104 L142 128 L130 128 L126 98 C112 88 88 88 74 98 L70 128 L58 128Z" fill="${s.accent}"/>
       <path d="M100 60 L100 122 M76 108 L124 108" stroke="#2a2630" stroke-width="4"/>`:"",u=a==="nima"?'<g fill="#8f5c40" opacity=".65"><circle cx="79" cy="144" r="1.8"/><circle cx="86" cy="148" r="1.5"/><circle cx="118" cy="144" r="1.7"/><circle cx="124" cy="148" r="1.4"/></g>':"",f=a==="kael"?'<path d="M121 126 L132 151" stroke="#a9534a" stroke-width="2.5" opacity=".85"/>':"",p=a==="vex"?`<ellipse cx="100" cy="42" rx="42" ry="10" stroke="${s.accent}" stroke-width="2" fill="none" opacity=".85"/>
       <ellipse cx="100" cy="42" rx="30" ry="6" stroke="${s.accent}" stroke-width="1" fill="none" opacity=".4"/>`:"",v=a==="vex"?`<path d="M64 124 Q100 105 136 124 Q130 166 100 174 Q70 166 64 124Z" fill="#f1e6d4" opacity=".96"/>
       <path d="M78 136 Q90 130 96 138 Q86 144 78 136Z" fill="${s.accent}"/>
       <path d="M122 136 Q110 130 104 138 Q114 144 122 136Z" fill="${s.accent}"/>
       <path d="M92 154 Q100 160 108 154" stroke="#7b5a3b" stroke-width="2" fill="none"/>`:"";return`
  <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${Ue(s.name)}">
    <defs>
      <radialGradient id="${i}bg" cx="50%" cy="34%" r="75%">
        <stop offset="0%" stop-color="${s.accent}" stop-opacity=".22"/>
        <stop offset="55%" stop-color="#0c1830" stop-opacity=".92"/>
        <stop offset="100%" stop-color="#050912"/>
      </radialGradient>
      <linearGradient id="${i}out" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${s.outfit}"/>
        <stop offset="100%" stop-color="#111526"/>
      </linearGradient>
      <linearGradient id="${i}skin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${s.skin}"/>
        <stop offset="100%" stop-color="${Na(s.skin,-18)}"/>
      </linearGradient>
      <filter id="${i}glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="200" height="240" fill="url(#${i}bg)"/>
    <circle cx="100" cy="118" r="88" fill="none" stroke="${s.accent}" stroke-opacity=".12"/>
    <circle cx="100" cy="118" r="70" fill="none" stroke="${s.accent}" stroke-opacity=".06"/>
    ${p}
    <path d="M28 240 C30 196 60 174 100 174 C140 174 170 196 172 240Z" fill="url(#${i}out)"/>
    <path d="M66 180 C74 168 126 168 134 180 L130 220 L70 220Z" fill="${s.accent}" opacity=".22"/>
    <path d="M82 158 L118 158 L122 186 L78 186Z" fill="url(#${i}skin)"/>
    ${o}
    <path d="M64 116 C64 84 80 66 100 66 C120 66 136 84 136 116 L132 148 C128 174 112 184 100 184 C88 184 72 174 68 148Z" fill="url(#${i}skin)"/>
    <path d="M66 120 C58 116 58 130 64 134 L69 134Z" fill="${Na(s.skin,-12)}"/>
    <path d="M134 120 C142 116 142 130 136 134 L131 134Z" fill="${Na(s.skin,-12)}"/>
    ${l}
    ${d}
    ${h}
    ${v}
    ${v?"":`
    <path d="M78 122 Q88 116 96 122" stroke="#3b2a28" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M104 122 Q112 116 122 122" stroke="#3b2a28" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="87" cy="130" rx="7" ry="5.5" fill="#fff8ec"/>
    <ellipse cx="113" cy="130" rx="7" ry="5.5" fill="#fff8ec"/>
    <circle cx="88" cy="130" r="3.6" fill="${s.eye}"/>
    <circle cx="112" cy="130" r="3.6" fill="${s.eye}"/>
    <circle cx="88" cy="130" r="1.8" fill="#1b2230"/>
    <circle cx="112" cy="130" r="1.8" fill="#1b2230"/>
    <circle cx="89.5" cy="128.4" r=".9" fill="#fff"/>
    <circle cx="113.5" cy="128.4" r=".9" fill="#fff"/>
    <path d="M100 133 Q97 142 101 144" stroke="${Na(s.skin,-28)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M90 156 Q100 162 110 156" stroke="#8b4f51" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M84 151 Q92 154 99 152" stroke="#d9908a" stroke-width="2" fill="none" opacity=".3"/>
    ${u}
    ${f}
    `}
    ${c}
    <path d="M70 202 Q100 188 130 202" stroke="${s.accent}" stroke-width="2" fill="none" opacity=".65"/>
    <path d="M100 196 l6 8 -6 8 -6 -8Z" fill="${s.accent}" opacity=".9" filter="url(#${i}glow)"/>
  </svg>`}function Hc(a){const e=`c${++Jd}`,t=a.colors,i={fox:`<path d="M62 156 C58 126 72 104 100 104 C128 104 142 126 138 156 C134 186 118 196 100 196 C82 196 66 186 62 156Z" fill="${t.body}"/>
      <path d="M72 112 L62 70 L92 92Z" fill="${t.body}"/><path d="M128 112 L138 70 L108 92Z" fill="${t.body}"/>
      <path d="M70 78 L70 96 L84 94Z" fill="${t.accent}" opacity=".6"/><path d="M130 78 L130 96 L116 94Z" fill="${t.accent}" opacity=".6"/>
      <path d="M76 144 Q86 136 94 144 Q86 152 76 144Z" fill="${t.eye}"/><path d="M124 144 Q114 136 106 144 Q114 152 124 144Z" fill="${t.eye}"/>
      <path d="M94 164 L100 170 L106 164" stroke="${t.accent}" stroke-width="3" fill="none"/>
      <path d="M138 164 C166 150 174 118 158 108 C146 126 148 144 126 154Z" fill="${t.accent}" opacity=".8"/>`,mossling:`<ellipse cx="100" cy="156" rx="48" ry="42" fill="${t.body}"/>
      <ellipse cx="100" cy="108" rx="32" ry="28" fill="${t.body}"/>
      <circle cx="84" cy="146" r="6" fill="${t.eye}"/><circle cx="116" cy="146" r="6" fill="${t.eye}"/>
      <path d="M88 166 Q100 174 112 166" stroke="${t.accent}" stroke-width="3" fill="none"/>
      <circle cx="72" cy="128" r="13" fill="${t.accent}" opacity=".55"/><circle cx="130" cy="112" r="10" fill="${t.accent}" opacity=".45"/>
      <path d="M100 80 Q96 58 112 54 Q106 76 116 82" fill="${t.accent}"/>`,bird:`<path d="M100 96 C120 96 132 118 126 150 C120 180 106 190 100 190 C94 190 80 180 74 150 C68 118 80 96 100 96Z" fill="${t.body}"/>
      <path d="M62 128 C34 108 28 150 62 166Z" fill="${t.accent}" opacity=".85"/>
      <path d="M138 128 C166 108 172 150 138 166Z" fill="${t.accent}" opacity=".85"/>
      <path d="M92 176 L100 194 L108 176Z" fill="${t.accent}"/>
      <circle cx="88" cy="122" r="5" fill="${t.eye}"/><circle cx="112" cy="122" r="5" fill="${t.eye}"/>
      <path d="M100 128 L92 140 L108 140Z" fill="${t.accent}"/>`,salamander:`<path d="M54 164 C52 142 66 128 92 130 L126 138 C148 142 158 158 150 176 C142 190 118 194 92 188 C70 182 58 176 54 164Z" fill="${t.body}"/>
      <path d="M60 166 C38 160 28 176 38 190 C46 200 62 194 64 184" fill="${t.body}"/>
      <circle cx="82" cy="150" r="5" fill="${t.eye}"/><circle cx="108" cy="154" r="5" fill="${t.eye}"/>
      <path d="M120 136 Q136 112 154 118 Q142 132 142 148" fill="${t.accent}" opacity=".85"/>
      <path d="M70 186 L64 202 M94 190 L90 206 M120 188 L118 204" stroke="${t.body}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="144" cy="122" r="8" fill="${t.accent}" opacity=".7"/>`,beetle:`<ellipse cx="100" cy="156" rx="52" ry="38" fill="${t.body}"/>
      <path d="M52 156 Q100 122 148 156" fill="${t.accent}" opacity=".25"/>
      <path d="M100 120 L100 188" stroke="${t.accent}" stroke-width="3" opacity=".6"/>
      <path d="M82 116 Q78 88 94 82 Q94 104 104 112" fill="${t.body}"/>
      <path d="M104 112 Q114 88 132 90 Q124 108 118 116" fill="${t.accent}" opacity=".8"/>
      <circle cx="78" cy="146" r="5" fill="${t.eye}"/><circle cx="122" cy="146" r="5" fill="${t.eye}"/>
      <path d="M64 184 L52 202 M88 190 L82 210 M112 190 L118 210 M136 184 L148 202" stroke="${t.body}" stroke-width="7" stroke-linecap="round"/>`,wolf:`<path d="M54 162 C52 132 68 112 100 112 C132 112 148 132 146 162 C144 190 124 200 100 200 C76 200 56 190 54 162Z" fill="${t.body}"/>
      <path d="M66 120 L58 78 L88 102Z" fill="${t.body}"/><path d="M134 120 L142 78 L112 102Z" fill="${t.body}"/>
      <circle cx="82" cy="150" r="6" fill="${t.eye}"/><circle cx="118" cy="150" r="6" fill="${t.eye}"/>
      <path d="M92 172 Q100 178 108 172" stroke="${t.accent}" stroke-width="3" fill="none"/>
      <path d="M100 190 L92 206 L108 206Z" fill="${t.accent}" opacity=".8"/>
      <path d="M100 118 L88 136 L112 136Z" fill="${t.accent}" opacity=".45"/>`,butterfly:`<path d="M100 104 C126 82 166 92 164 130 C162 162 130 172 100 150Z" fill="${t.accent}" opacity=".7"/>
      <path d="M100 104 C74 82 34 92 36 130 C38 162 70 172 100 150Z" fill="${t.accent}" opacity=".55"/>
      <path d="M100 150 C120 178 158 180 160 158 C162 140 132 136 100 150Z" fill="${t.body}" opacity=".8"/>
      <path d="M100 150 C80 178 42 180 40 158 C38 140 68 136 100 150Z" fill="${t.body}" opacity=".8"/>
      <ellipse cx="100" cy="138" rx="8" ry="34" fill="${t.body}"/>
      <circle cx="100" cy="104" r="11" fill="${t.body}"/>
      <path d="M94 98 Q84 78 76 82 M106 98 Q116 78 124 82" stroke="${t.body}" stroke-width="2" fill="none"/>
      <circle cx="72" cy="122" r="12" fill="${t.eye}" opacity=".7"/><circle cx="128" cy="122" r="12" fill="${t.eye}" opacity=".7"/>`,turtle:`<ellipse cx="100" cy="156" rx="54" ry="42" fill="${t.body}"/>
      <path d="M56 156 Q100 112 144 156 Q100 186 56 156Z" fill="${t.accent}" opacity=".4"/>
      <path d="M100 118 L100 180 M72 132 L128 176 M128 132 L72 176" stroke="${t.accent}" stroke-width="2" opacity=".6"/>
      <circle cx="100" cy="104" r="22" fill="${t.body}"/>
      <circle cx="92" cy="100" r="4" fill="${t.eye}"/><circle cx="108" cy="100" r="4" fill="${t.eye}"/>
      <path d="M100 116 L94 124 L106 124Z" fill="${t.accent}"/>
      <path d="M56 180 L42 196 M144 180 L158 196" stroke="${t.body}" stroke-width="10" stroke-linecap="round"/>`,seraph:`<path d="M100 100 C118 100 128 118 124 146 C120 172 110 186 100 186 C90 186 80 172 76 146 C72 118 82 100 100 100Z" fill="${t.body}"/>
      <path d="M64 120 C34 94 22 140 58 164Z" fill="${t.accent}" opacity=".75"/>
      <path d="M136 120 C166 94 178 140 142 164Z" fill="${t.accent}" opacity=".75"/>
      <path d="M60 152 C36 140 24 174 54 188Z" fill="${t.accent}" opacity=".5"/>
      <path d="M140 152 C164 140 176 174 146 188Z" fill="${t.accent}" opacity=".5"/>
      <circle cx="90" cy="128" r="4" fill="${t.eye}"/><circle cx="110" cy="128" r="4" fill="${t.eye}"/>
      <path d="M92 146 Q100 152 108 146" stroke="${t.accent}" stroke-width="2" fill="none"/>
      <ellipse cx="100" cy="76" rx="26" ry="7" stroke="${t.accent}" stroke-width="2" fill="none" opacity=".9"/>`};return`
  <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${Ue(a.name)}">
    <defs>
      <radialGradient id="${e}bg" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="${t.accent}" stop-opacity=".25"/>
        <stop offset="60%" stop-color="#0b1730" stop-opacity=".92"/>
        <stop offset="100%" stop-color="#050912"/>
      </radialGradient>
      <filter id="${e}g"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="200" height="240" fill="url(#${e}bg)"/>
    <circle cx="100" cy="145" r="74" fill="${t.accent}" opacity=".08" filter="url(#${e}g)"/>
    <circle cx="100" cy="145" r="64" fill="none" stroke="${t.accent}" stroke-opacity=".12"/>
    ${i[a.model]||i.fox}
    <path d="M50 224 Q100 206 150 224" stroke="${t.accent}" stroke-width="2" fill="none" opacity=".4"/>
  </svg>`}function Na(a,e){const t=a.replace("#",""),i=parseInt(t.length===3?t.split("").map(o=>o+o).join(""):t,16),n=Math.max(0,Math.min(255,(i>>16)+e)),s=Math.max(0,Math.min(255,(i>>8&255)+e)),r=Math.max(0,Math.min(255,(i&255)+e));return`#${(n<<16|s<<8|r).toString(16).padStart(6,"0")}`}class Sv{constructor(){this.app=null,this.settings=this.loadSettings(),this.joystick={x:0,y:0,active:!1},this.dialogue=null,this.dialogueIndex=0,this.dialogueTyping=!1,this.dialogueTimer=null,this.dialogueFullText="",this.cinematic=null,this.cinematicIndex=0,this.cinematicTyping=!1,this.cinematicTimer=null,this.capture=null,this.pauseTab="status",this.hudCache={},this.questCache="",this.interactionCache="",this.bossCache="",this.lastMinimap=0,this.comboTimer=null,this.profile=this.defaultProfile(),this.creationTab="skin",this.lastScreen="title",this.init()}setApp(e){this.app=e,this.applySettings(),e.audio?.started&&(e.audio.setMusicVolume(this.settings.music),e.audio.setSfxVolume(this.settings.sfx))}defaultProfile(){return{name:"Aurel",origin:"filo",appearance:{skinColor:ii.skin[1].color,hairColor:ii.hairColors[0].color,hairStyle:"corto",outfitColor:ii.outfitColors[0].color,accentColor:ii.accents[0].color,headgear:"ninguno"},weapon:"filo_aurora",armor:"tunica_viajero",allocation:{vitalidad:0,resonancia:0,resistencia:0,fuerza:0,defensa:0,velocidad:0,inteligencia:0,suerte:0}}}loadSettings(){try{const e=JSON.parse(localStorage.getItem(Dc)||"{}");return{...kc,...e}}catch{return{...kc}}}saveSettings(){try{localStorage.setItem(Dc,JSON.stringify(this.settings))}catch{}}applySettings(){document.documentElement.style.setProperty("--font-scale",String(this.settings.fontScale)),document.body.classList.toggle("reduce-motion",!!this.settings.reduceMotion),document.body.classList.toggle("high-contrast",!!this.settings.highContrast),document.body.classList.toggle("left-handed",!!this.settings.leftHanded),this.app?.audio&&(this.app.audio.setMusicVolume(this.settings.music),this.app.audio.setSfxVolume(this.settings.sfx),this.app.audio.setMuted(this.settings.music<=0&&this.settings.sfx<=0)),this.app&&this.app.setQuality(this.settings.quality),this.saveSettings()}init(){this.bind(),this.renderCreation(),this.renderSettings(),this.updateContinueButton(),this.setLoading(!0)}bind(){q("btn-new-game")?.addEventListener("click",()=>this.app?.showCreation()),q("btn-continue")?.addEventListener("click",()=>this.app?.continueGame()),q("btn-title-settings")?.addEventListener("click",()=>this.openModal("settings-modal")),q("btn-credits")?.addEventListener("click",()=>this.openModal("credits-modal")),q("btn-creation-back")?.addEventListener("click",()=>this.app?.showTitle()),q("btn-start-adventure")?.addEventListener("click",()=>this.startAdventure()),q("char-name")?.addEventListener("input",r=>{this.profile.name=r.target.value.trimStart().slice(0,16)||"Aurel",q("preview-name").textContent=this.profile.name,q("player-initial").textContent=this.profile.name.charAt(0).toUpperCase(),this.refreshPreview()}),q("appearance-tabs")?.addEventListener("click",r=>{const o=r.target.closest("[data-tab]");o&&(this.creationTab=o.dataset.tab,document.querySelectorAll(".appearance-tab").forEach(c=>c.classList.toggle("active",c===o)),this.renderSwatches())}),q("origin-grid")?.addEventListener("click",r=>{const o=r.target.closest("[data-origin]");o&&this.selectOrigin(o.dataset.origin)}),q("weapon-row")?.addEventListener("click",r=>{const o=r.target.closest("[data-weapon]");o&&(this.profile.weapon=o.dataset.weapon,this.renderWeapons(),this.refreshPreview())}),q("stat-grid")?.addEventListener("click",r=>{const o=r.target.closest("button[data-stat]");if(!o)return;const c=o.dataset.stat,l=Number(o.dataset.delta),d=Object.values(this.profile.allocation).reduce((h,u)=>h+u,0);l>0&&d>=6||l<0&&this.profile.allocation[c]<=0||(this.profile.allocation[c]+=l,this.renderStats(),this.refreshPreview())}),q("btn-pause")?.addEventListener("click",()=>this.app?.openPause()),q("btn-map")?.addEventListener("click",()=>this.app?.openMap()),q("btn-resume")?.addEventListener("click",()=>this.app?.resume()),q("btn-save")?.addEventListener("click",()=>this.app?.game?.save(!0)),q("btn-quit")?.addEventListener("click",()=>this.app?.quitToTitle()),q("btn-map-close")?.addEventListener("click",()=>this.app?.closeMap()),q("btn-revive")?.addEventListener("click",()=>this.app?.game?.revive()),q("btn-death-title")?.addEventListener("click",()=>this.app?.quitToTitle()),q("btn-ending-continue")?.addEventListener("click",()=>this.app?.continueAfterEnding()),q("btn-ending-title")?.addEventListener("click",()=>this.app?.quitToTitle()),q("btn-capture-cancel")?.addEventListener("click",()=>this.app?.game?.cancelCapture()),q("btn-capture")?.addEventListener("click",()=>this.app?.game?.confirmCapture()),q("pause-tabs")?.addEventListener("click",r=>{const o=r.target.closest("[data-tab]");o&&(this.pauseTab=o.dataset.tab,document.querySelectorAll("#pause-tabs button").forEach(c=>c.classList.toggle("active",c===o)),this.renderPause())}),q("pause-content")?.addEventListener("click",r=>{const o=r.target.closest("[data-equip]");if(o){const[h,u]=o.dataset.equip.split(":");this.app?.game?.equip(h,u),this.renderPause();return}const c=r.target.closest("[data-upgrade]");if(c){this.app?.game?.upgrade(c.dataset.upgrade),this.renderPause();return}const l=r.target.closest("[data-creature]");if(l){this.app?.game?.setActiveCreature(l.dataset.creature),this.renderPause();return}const d=r.target.closest("[data-skill]");d&&(this.app?.game?.learnSkill(d.dataset.skill),this.renderPause())}),q("dialogue-overlay")?.addEventListener("click",r=>{r.target.closest(".dialogue-choice")||this.advanceDialogue()}),q("cinematic-next")?.addEventListener("click",()=>this.advanceCinematic()),q("cinematic-overlay")?.addEventListener("click",r=>{r.target.closest("button")||this.advanceCinematic()}),document.querySelectorAll("[data-close]").forEach(r=>{r.addEventListener("click",()=>this.closeModal(r.dataset.close))}),document.querySelectorAll(".modal").forEach(r=>{r.addEventListener("click",o=>{o.target===r&&this.closeModal(r.id)})});const e=(r,o,c=!1)=>{const l=q(r);l&&(l.addEventListener("pointerdown",d=>{d.preventDefault(),d.stopPropagation(),l.classList.add("pressed"),c?this.app?.game?.setBlocking(!0):this.app?.game?.action(o)}),l.addEventListener("pointerup",d=>{d.preventDefault(),l.classList.remove("pressed"),c&&this.app?.game?.setBlocking(!1)}),l.addEventListener("pointercancel",()=>{l.classList.remove("pressed"),c&&this.app?.game?.setBlocking(!1)}),l.addEventListener("pointerleave",()=>{c&&this.app?.game?.setBlocking(!1)}))};e("btn-attack","attack"),e("btn-heavy","heavy"),e("btn-dodge","dodge"),e("btn-block","block",!0),e("btn-spell","spell"),e("btn-creature","creature"),e("btn-ultimate","ultimate"),e("btn-potion","potion");const t=q("joystick"),i=q("joystick-knob"),n=r=>{const o=t.getBoundingClientRect(),c=o.left+o.width/2,l=o.top+o.height/2;let d=r.clientX-c,h=r.clientY-l;const u=o.width*.32,f=Math.hypot(d,h);f>u&&(d=d/f*u,h=h/f*u),i.style.transform=`translate(${d}px, ${h}px)`,this.joystick.x=d/u,this.joystick.y=h/u,this.joystick.active=!0};t?.addEventListener("pointerdown",r=>{r.preventDefault(),t.setPointerCapture(r.pointerId),n(r)}),t?.addEventListener("pointermove",r=>{this.joystick.active&&(r.preventDefault(),n(r))});const s=()=>{this.joystick.x=0,this.joystick.y=0,this.joystick.active=!1,i.style.transform="translate(0px, 0px)"};t?.addEventListener("pointerup",s),t?.addEventListener("pointercancel",s),document.addEventListener("input",r=>{const o=r.target.closest("[data-setting]");if(!o)return;const c=o.dataset.setting;o.type==="range"&&(this.settings[c]=Number(o.value),this.applySettings(),this.updateSettingsLabels())}),document.addEventListener("change",r=>{const o=r.target.closest("[data-setting]");if(!o)return;const c=o.dataset.setting;o.tagName==="SELECT"&&(this.settings[c]=o.value,this.applySettings(),this.renderSettings())}),document.addEventListener("click",r=>{const o=r.target.closest(".toggle[data-setting]");if(!o)return;const c=o.dataset.setting;this.settings[c]=!this.settings[c],this.applySettings(),this.renderSettings(),this.app?.audio?.play("ui")}),document.addEventListener("pointerdown",r=>{r.target.closest("button")&&this.app?.audio?.play("ui")},{passive:!0})}setLoading(e){const t=q("loading-screen");t&&(e?(t.classList.remove("hidden"),t.style.opacity="1"):(t.style.opacity="0",setTimeout(()=>t.classList.add("hidden"),700)))}updateContinueButton(){let e=null;try{e=JSON.parse(localStorage.getItem("laEspadaCelestial.save.v1")||"null")}catch{e=null}const t=q("btn-continue"),i=q("continue-sub");if(!(!t||!i))if(t.disabled=!e,e){const n=e.player?.name||"Aurel",s=Mt[e.region]?.name||"Valdoria";i.textContent=`${n} · Nv. ${e.player?.level||1} · ${s}`}else i.textContent="No hay una partida guardada"}showTitle(){this.hideAll(),q("title-screen")?.classList.remove("hidden"),this.updateContinueButton(),this.lastScreen="title"}showCreation(){this.hideAll(),this.profile=this.defaultProfile(),q("char-name").value=this.profile.name,q("preview-name").textContent=this.profile.name,this.selectOrigin("filo",!0),this.renderCreation(),q("creation-screen")?.classList.remove("hidden"),this.lastScreen="creation",this.app?.showPreview(this.profile)}hideAll(){["title-screen","creation-screen","hud","pause-screen","map-screen","death-screen","ending-screen"].forEach(e=>q(e)?.classList.add("hidden")),["dialogue-overlay","cinematic-overlay","capture-modal"].forEach(e=>q(e)?.classList.add("hidden")),document.querySelectorAll(".modal").forEach(e=>e.classList.add("hidden"))}showHUD(){this.hideAll(),q("hud")?.classList.remove("hidden"),this.lastScreen="game"}selectOrigin(e,t=!1){const i=Tn.find(n=>n.id===e)||Tn[0];this.profile.origin=i.id,this.profile.weapon=i.weapon,document.querySelectorAll(".origin-card").forEach(n=>n.classList.toggle("active",n.dataset.origin===i.id)),q("preview-title").textContent=i.name,this.renderWeapons(),this.renderStats(),this.refreshPreview()}renderCreation(){const e=q("origin-grid");e&&(e.innerHTML=Tn.map(t=>`
      <button class="origin-card ${t.id===this.profile.origin?"active":""}" data-origin="${t.id}">
        <b>${Ue(t.name)}</b>
        <small>${Ue(t.desc)}</small>
      </button>`).join(""),this.renderSwatches(),this.renderWeapons(),this.renderStats())}renderSwatches(){const e=q("swatch-row");if(!e)return;if(this.creationTab==="hair"){e.innerHTML=ii.hairStyles.map(i=>`
        <button class="swatch-text ${this.profile.appearance.hairStyle===i.id?"active":""}" data-hair-style="${i.id}">${Ue(i.name)}</button>
      `).join("")+ii.hairColors.map(i=>`
        <button class="swatch ${this.profile.appearance.hairColor===i.color?"active":""}" style="background:${i.color}" title="${Ue(i.name)}" data-hair-color="${i.color}"></button>
      `).join(""),e.querySelectorAll("[data-hair-style]").forEach(i=>i.addEventListener("click",()=>{this.profile.appearance.hairStyle=i.dataset.hairStyle,this.renderSwatches(),this.refreshPreview()})),e.querySelectorAll("[data-hair-color]").forEach(i=>i.addEventListener("click",()=>{this.profile.appearance.hairColor=i.dataset.hairColor,this.renderSwatches(),this.refreshPreview()}));return}if(this.creationTab==="headgear"){e.innerHTML=ii.headgear.map(i=>`
        <button class="swatch-text ${this.profile.appearance.headgear===i.id?"active":""}" data-headgear="${i.id}">${Ue(i.name)}</button>
      `).join(""),e.querySelectorAll("[data-headgear]").forEach(i=>i.addEventListener("click",()=>{this.profile.appearance.headgear=i.dataset.headgear,this.renderSwatches(),this.refreshPreview()}));return}const t={skin:{list:ii.skin,key:"skinColor"},outfit:{list:ii.outfitColors,key:"outfitColor"},accent:{list:ii.accents,key:"accentColor"}}[this.creationTab];t&&(e.innerHTML=t.list.map(i=>`
      <button class="swatch ${this.profile.appearance[t.key]===i.color?"active":""}" style="background:${i.color}" title="${Ue(i.name)}" data-color="${i.color}"></button>
    `).join(""),e.querySelectorAll("[data-color]").forEach(i=>i.addEventListener("click",()=>{this.profile.appearance[t.key]=i.dataset.color,this.renderSwatches(),this.refreshPreview()})))}renderWeapons(){const e=q("weapon-row");e&&(e.innerHTML=ii.weapons.map(t=>{const i=ni[t];return`<button class="weapon-card ${this.profile.weapon===t?"active":""}" data-weapon="${t}">
        <b>${Ue(i.name)}</b>
        <small>${Ue(i.type)}</small>
        <span class="wstat">ATQ +${i.atk} · VEL ${Math.round(i.speed*100)}%</span>
      </button>`}).join(""))}getProfileStats(){const e=Tn.find(s=>s.id===this.profile.origin)||Tn[0],t={};for(const s of Gr)t[s.id]=3+(e.bonuses[s.id]||0)+(this.profile.allocation[s.id]||0);const i=ni[this.profile.weapon]||ni.filo_aurora,n=_i[this.profile.armor]||_i.tunica_viajero;return{stats:t,maxHp:Math.round(80+t.vitalidad*8+n.hp),maxMp:Math.round(40+t.resonancia*6+n.mp),maxSp:Math.round(60+t.resistencia*5),attack:Math.round(8+t.fuerza*2.2+i.atk),defense:Math.round(3+t.defensa*1.6+t.resistencia*.5+n.def)}}renderStats(){const e=q("stat-grid");if(!e)return;const t=Tn.find(r=>r.id===this.profile.origin)||Tn[0],i=Object.values(this.profile.allocation).reduce((r,o)=>r+o,0);q("points-label").textContent=`${6-i} puntos libres`,e.innerHTML=Gr.map(r=>{const o=3+(t.bonuses[r.id]||0),c=this.profile.allocation[r.id]||0;return`<div class="stat-row">
        <span class="stat-name" title="${Ue(r.desc)}">${Ue(r.name)}</span>
        <button data-stat="${r.id}" data-delta="-1" ${c<=0?"disabled":""} aria-label="Quitar ${Ue(r.name)}">−</button>
        <span class="stat-value">${o+c}</span>
        <button data-stat="${r.id}" data-delta="1" ${i>=6?"disabled":""} aria-label="Añadir ${Ue(r.name)}">+</button>
      </div>`}).join("");const n=this.getProfileStats(),s=q("preview-stats");s&&(s.innerHTML=`
        <div class="preview-stat"><span>Vida</span><b>${n.maxHp}</b></div>
        <div class="preview-stat"><span>Maná</span><b>${n.maxMp}</b></div>
        <div class="preview-stat"><span>Ataque</span><b>${n.attack}</b></div>
        <div class="preview-stat"><span>Defensa</span><b>${n.defense}</b></div>`)}refreshPreview(){if(!this.app)return;const e=this.getFullProfile();q("preview-name").textContent=e.name,this.app.showPreview(e)}getFullProfile(){const e=this.getProfileStats();return{name:this.profile.name,origin:this.profile.origin,appearance:{...this.profile.appearance},weapon:this.profile.weapon,armor:this.profile.armor,headgear:this.profile.appearance.headgear,stats:e.stats,maxHp:e.maxHp,maxMp:e.maxMp,maxSp:e.maxSp,attack:e.attack,defense:e.defense}}startAdventure(){const e=this.getFullProfile();if(!e.name||e.name.trim().length<2){this.toast("Nombre incompleto","Escribe al menos dos letras.","error");return}this.app?.startNewGame(e)}updateHUD(e,t){if(!e||!e.state)return;const i=e.state,n=i.player,s=e.getStats(),r=Math.max(0,Math.round(n.hp)),o=Math.max(0,Math.round(n.mp)),c=Math.max(0,Math.round(n.sp));(this.hudCache.hp!==r||this.hudCache.maxHp!==s.maxHp)&&(q("hp-fill").style.width=`${Math.max(0,r/s.maxHp*100)}%`,q("hp-text").textContent=`${r} / ${s.maxHp}`,this.hudCache.hp=r,this.hudCache.maxHp=s.maxHp),(this.hudCache.mp!==o||this.hudCache.maxMp!==s.maxMp)&&(q("mp-fill").style.width=`${Math.max(0,o/s.maxMp*100)}%`,this.hudCache.mp=o,this.hudCache.maxMp=s.maxMp),(this.hudCache.sp!==c||this.hudCache.maxSp!==s.maxSp)&&(q("sp-fill").style.width=`${Math.max(0,c/s.maxSp*100)}%`,this.hudCache.sp=c,this.hudCache.maxSp=s.maxSp);const l=Math.min(100,n.xp/n.xpNext*100);this.hudCache.xp!==l&&(q("xp-fill").style.width=`${l}%`,this.hudCache.xp=l),this.hudCache.level!==n.level&&(q("hud-level").textContent=`Nv. ${n.level}`,q("hud-player-name").textContent=n.name,q("player-initial").textContent=n.name.charAt(0).toUpperCase(),this.hudCache.level=n.level),this.hudCache.region!==i.region&&(q("region-name").textContent=Mt[i.region]?.name||"AETHERIA",q("region-epithet").textContent=Mt[i.region]?.epithet||"",this.hudCache.region=i.region);const d=e.getQuestInfo(),h=JSON.stringify(d);if(this.questCache!==h){q("quest-kind").textContent=d.kind||"MISIÓN PRINCIPAL",q("quest-step").textContent=d.step||"I",q("quest-title").textContent=d.title||"",q("quest-objective").textContent=d.objective||"";const m=q("quest-progress");d.total?(m.classList.remove("hidden"),q("quest-progress-fill").style.width=`${Math.min(100,d.progress/d.total*100)}%`,q("quest-objective").textContent=`${d.objective} (${d.progress}/${d.total})`):m.classList.add("hidden"),this.questCache=h}const u=i.creatures.find(m=>m.active),f=u?`${u.id}:${u.level}`:"none";if(this.hudCache.active!==f){if(u){const m=ai[u.id];q("companion-name").textContent=`${m.name} · Nv. ${u.level}`,q("companion-skill").textContent=m.skill.name}else q("companion-name").textContent="Sin eco activo",q("companion-skill").textContent="Abre el diario para invocar un eco";this.hudCache.active=f}const p=i.inventory.pocion_luz||0;this.hudCache.potions!==p&&(q("potion-count").textContent=p,this.hudCache.potions=p);const v=e.getCooldowns(),g=q("spell-cooldown");if(g){const m=v.spell>0?v.spell/v.spellMax:0;g.style.background=m>0?`conic-gradient(rgba(126,232,250,.55) ${m*360}deg, transparent ${m*360}deg)`:"conic-gradient(transparent 0deg, transparent 360deg)"}q("btn-ultimate")?.classList.toggle("hidden",!e.hasUltimate()),q("btn-block")?.classList.toggle("active",!!e.player?.blocking),t&&(this.lastMinimap+=t,this.lastMinimap>.12&&(this.drawMinimap(e),this.lastMinimap=0))}showInteraction(e){if(this.interactionCache===e)return;this.interactionCache=e;const t=q("interaction-prompt");e?(q("interaction-text").textContent=e,t.classList.remove("hidden")):t.classList.add("hidden")}showBoss(e,t,i,n){const s=`${e}:${Math.round(t)}:${n}`;this.bossCache!==s&&(this.bossCache=s,q("boss-bar").classList.remove("hidden"),q("boss-name").textContent=e.toUpperCase(),q("boss-hp-fill").style.width=`${Math.max(0,t/i*100)}%`,q("boss-phase").textContent=n>1?"FASE II":"FASE I")}hideBoss(){this.bossCache="",q("boss-bar")?.classList.add("hidden")}showCombo(e){const t=q("combo-display");if(e<2){t.classList.add("hidden");return}q("combo-count").textContent=e,t.classList.remove("hidden"),clearTimeout(this.comboTimer),this.comboTimer=setTimeout(()=>t.classList.add("hidden"),1500)}spawnDamage(e,t,i=""){if(!this.settings.damageNumbers)return;const n=q("damage-layer");if(!n||!e?.visible)return;n.childElementCount>26&&n.firstElementChild?.remove();const s=document.createElement("div");s.className=`damage-number ${i}`,s.textContent=t,s.style.left=`${e.x}px`,s.style.top=`${e.y}px`,n.appendChild(s),setTimeout(()=>s.remove(),1e3)}toast(e,t,i=""){const n=q("toast-layer");if(!n)return;for(;n.childElementCount>=4;)n.firstElementChild?.remove();const s=document.createElement("div");s.className=`toast ${i}`,s.innerHTML=`<span class="toast-icon">${i==="capture"?"✦":i==="level"?"✧":"◈"}</span><span class="toast-text"><b>${Ue(e)}</b><small>${Ue(t)}</small></span>`,n.appendChild(s),setTimeout(()=>s.remove(),3800)}showDialogue(e){this.dialogue=e,this.dialogueIndex=0,this.dialogueFullText="",this.dialogueTyping=!1,q("dialogue-overlay").classList.remove("hidden"),q("dialogue-speaker").textContent=(e.speaker||"AETHERIA").toUpperCase(),q("dialogue-portrait").innerHTML=e.portrait==="creature"?Hc(ai[e.creature]||ai.lumi):Bc(e.portrait||"player",e.appearance||{},e),q("dialogue-choices").classList.add("hidden"),q("dialogue-choices").innerHTML="",this.showDialogueLine()}showDialogueLine(){if(!this.dialogue)return;const e=this.dialogue.lines[this.dialogueIndex];if(!e){this.finishDialogue();return}q("dialogue-choices").classList.add("hidden"),q("dialogue-continue").classList.remove("hidden"),this.typeText(q("dialogue-text"),e,()=>{if(this.dialogueIndex>=this.dialogue.lines.length-1&&this.dialogue.choices?.length){q("dialogue-continue").classList.add("hidden");const i=q("dialogue-choices");i.innerHTML=this.dialogue.choices.map((n,s)=>`
          <button class="dialogue-choice" data-choice="${s}" ${n.disabled?"disabled":""}><b>${s+1}.</b>${Ue(n.label)}</button>
        `).join(""),i.classList.remove("hidden"),i.querySelectorAll("[data-choice]").forEach(n=>{n.addEventListener("click",s=>{s.stopPropagation();const r=this.dialogue.choices[Number(n.dataset.choice)];this.finishDialogue(r)})})}})}typeText(e,t,i){if(clearInterval(this.dialogueTimer),this.dialogueFullText=t,this.dialogueTyping=!0,this.settings.reduceMotion){e.textContent=t,this.dialogueTyping=!1,i?.();return}e.textContent="";let n=0;this.dialogueTimer=setInterval(()=>{n+=2,e.textContent=t.slice(0,n),n>=t.length&&(clearInterval(this.dialogueTimer),this.dialogueTyping=!1,i?.())},15)}advanceDialogue(){if(this.dialogue){if(this.dialogueTyping){clearInterval(this.dialogueTimer),this.dialogueTyping=!1,q("dialogue-text").textContent=this.dialogueFullText,this.dialogueIndex>=this.dialogue.lines.length-1&&this.dialogue.choices?.length&&this.showDialogueLine();return}this.dialogueIndex<this.dialogue.lines.length-1?(this.dialogueIndex++,this.showDialogueLine()):this.dialogue.choices?.length||this.finishDialogue()}}finishDialogue(e=null){clearInterval(this.dialogueTimer);const t=this.dialogue;this.dialogue=null,this.dialogueTyping=!1,q("dialogue-overlay").classList.add("hidden"),t?.onEnd?.(e)}showCinematic(e){this.cinematic=e,this.cinematicIndex=0,this.cinematicTyping=!1,q("cinematic-overlay").classList.remove("hidden"),q("cinematic-kicker").textContent=e.kicker||"CAPÍTULO",q("cinematic-title").textContent=e.title||"",this.showCinematicLine()}showCinematicLine(){if(!this.cinematic)return;const e=this.cinematic.lines[this.cinematicIndex];if(!e){this.finishCinematic();return}clearInterval(this.cinematicTimer);const t=q("cinematic-line");if(this.cinematicTyping=!0,this.settings.reduceMotion){t.textContent=e,this.cinematicTyping=!1;return}t.textContent="";let i=0;this.cinematicTimer=setInterval(()=>{i+=2,t.textContent=e.slice(0,i),i>=e.length&&(clearInterval(this.cinematicTimer),this.cinematicTyping=!1)},18)}advanceCinematic(){if(this.cinematic){if(this.cinematicTyping){clearInterval(this.cinematicTimer),this.cinematicTyping=!1,q("cinematic-line").textContent=this.cinematic.lines[this.cinematicIndex];return}this.cinematicIndex<this.cinematic.lines.length-1?(this.cinematicIndex++,this.showCinematicLine()):this.finishCinematic()}}finishCinematic(){clearInterval(this.cinematicTimer);const e=this.cinematic;this.cinematic=null,this.cinematicTyping=!1,q("cinematic-overlay").classList.add("hidden"),e?.onEnd?.()}openPause(e="status"){this.pauseTab=e,document.querySelectorAll("#pause-tabs button").forEach(t=>t.classList.toggle("active",t.dataset.tab===e)),this.renderPause(),q("pause-screen").classList.remove("hidden")}closePause(){q("pause-screen").classList.add("hidden")}renderPause(){const e=this.app?.game;if(!e)return;const t=e.state,i=t.player,n=e.getStats();q("pause-name").textContent=i.name,q("pause-subtitle").textContent=`Nv. ${i.level} · ${Mt[t.region]?.name||"Aetheria"} · ${Da(t.playTime)}`,q("pause-portrait").innerHTML=Bc("player",{...i.appearance,name:i.name});const s=q("pause-content");this.pauseTab==="status"?s.innerHTML=this.statusHTML(e,n):this.pauseTab==="equipment"?s.innerHTML=this.equipmentHTML(e,n):this.pauseTab==="creatures"?s.innerHTML=this.creaturesHTML(e):this.pauseTab==="skills"?s.innerHTML=this.skillsHTML(e):this.pauseTab==="journal"?s.innerHTML=this.journalHTML(e):this.pauseTab==="settings"&&(s.innerHTML=this.settingsHTML()),this.pauseTab==="settings"&&this.updateSettingsLabels()}statusHTML(e,t){const i=e.state,n=i.player,s=ni[n.weapon]||ni.filo_aurora,r=_i[n.armor]||_i.tunica_viajero,o=n.charm?fn[n.charm]:null,c=e.getQuestInfo();return`<div class="menu-grid">
      <div class="panel">
        <h3>Portador</h3>
        <div class="big-stats">
          <div class="big-stat"><span>Vida</span><b>${Math.round(n.hp)} / ${t.maxHp}</b></div>
          <div class="big-stat"><span>Resonancia</span><b>${Math.round(n.mp)} / ${t.maxMp}</b></div>
          <div class="big-stat"><span>Aguante</span><b>${Math.round(n.sp)} / ${t.maxSp}</b></div>
          <div class="big-stat"><span>Ataque</span><b>${t.attack}</b></div>
          <div class="big-stat"><span>Defensa</span><b>${t.defense}</b></div>
          <div class="big-stat"><span>Crítico</span><b>${Math.round(t.crit*100)}%</b></div>
        </div>
        <h4>Equipamiento</h4>
        <div class="stat-line"><span>${Ue(s.name)}</span><b>+${s.atk} ATQ</b></div>
        <div class="stat-line"><span>${Ue(r.name)}</span><b>+${r.def} DEF</b></div>
        <div class="stat-line"><span>${o?Ue(o.name):"Sin talismán"}</span><b>${o?"Activo":"—"}</b></div>
        <h4>Progreso</h4>
        <div class="stat-line"><span>Misión actual</span><b>${Ue(c.title)}</b></div>
        <div class="stat-line"><span>Ecos capturados</span><b>${i.creatures.length} / ${Object.keys(ai).length}</b></div>
        <div class="stat-line"><span>Tiempo de juego</span><b>${Da(i.playTime)}</b></div>
      </div>
      <div class="panel">
        <h3>Atributos</h3>
        <div class="stat-list">
          ${Gr.map(l=>`<div class="stat-line"><span>${Ue(l.name)}</span><b>${t.stats[l.id]}</b></div>`).join("")}
        </div>
        <h4>Recursos</h4>
        <div class="stat-line"><span>Esencia de Eco</span><b>${i.inventory.esencia_eco||0}</b></div>
        <div class="stat-line"><span>Fragmentos de cielo</span><b>${i.inventory.fragmentos||0}</b></div>
        <div class="stat-line"><span>Pociones de Luz</span><b>${i.inventory.pocion_luz||0}</b></div>
        <div class="stat-line"><span>Cristales de Resonancia</span><b>${i.inventory.cristal_resonancia||0}</b></div>
        <h4>Eco activo</h4>
        <p>${i.creatures.find(l=>l.active)?Ue(ai[i.creatures.find(l=>l.active).id].name)+" — "+Ue(ai[i.creatures.find(l=>l.active).id].skill.name):"Ningún eco acompaña al portador. Visita la pestaña Ecos."}</p>
      </div>
    </div>`}equipmentHTML(e,t){const i=e.state.player,n=ni[i.weapon],s=_i[i.armor];i.charm&&fn[i.charm];const r=Object.values(ni).filter(l=>e.state.ownedWeapons.includes(l.id)),o=Object.values(_i).filter(l=>e.state.ownedArmors.includes(l.id)),c=Object.values(fn).filter(l=>e.state.ownedCharms.includes(l.id));return`<div class="menu-grid">
      <div class="panel">
        <h3>Arma</h3>
        <div class="equip-grid" style="grid-template-columns:1fr 1fr">
          ${r.map(l=>this.equipCard("weapon",l,i.weapon===l.id,`+${l.atk} ATQ · VEL ${Math.round(l.speed*100)}%`,e)).join("")}
        </div>
        <h4>Armadura</h4>
        <div class="equip-grid" style="grid-template-columns:1fr 1fr">
          ${o.map(l=>this.equipCard("armor",l,i.armor===l.id,`+${l.def} DEF · +${l.hp} VIDA`,e)).join("")}
        </div>
        <h4>Talismán</h4>
        <div class="equip-grid" style="grid-template-columns:1fr 1fr">
          ${c.map(l=>this.equipCard("charm",l,i.charm===l.id,l.desc,e)).join("")}
        </div>
      </div>
      <div class="panel">
        <h3>Forja</h3>
        <p>La Espada recuerda cada forma que ha llevado. Mejora tu equipo con fragmentos de cielo y esencia de eco.</p>
        <h4>Arma equipada</h4>
        <div class="stat-line"><span>${Ue(n.name)}</span><b>+${n.atk+(e.state.upgrades.weapon||0)*2} ATQ</b></div>
        <div class="stat-line"><span>Mejora</span><b>Nv. ${e.state.upgrades.weapon||0} / 3</b></div>
        <button class="ghost-button" data-upgrade="weapon" style="margin-top:10px;width:100%">Mejorar arma · ${e.upgradeCost("weapon")} fragmentos</button>
        <h4>Armadura equipada</h4>
        <div class="stat-line"><span>${Ue(s.name)}</span><b>+${s.def+(e.state.upgrades.armor||0)} DEF</b></div>
        <div class="stat-line"><span>Mejora</span><b>Nv. ${e.state.upgrades.armor||0} / 3</b></div>
        <button class="ghost-button" data-upgrade="armor" style="margin-top:10px;width:100%">Mejorar armadura · ${e.upgradeCost("armor")} fragmentos</button>
        <h4>Recursos</h4>
        <div class="stat-line"><span>Fragmentos de cielo</span><b>${e.state.inventory.fragmentos||0}</b></div>
        <div class="stat-line"><span>Esencia de Eco</span><b>${e.state.inventory.esencia_eco||0}</b></div>
      </div>
    </div>`}equipCard(e,t,i,n,s){const r=i;return`<div class="equip-card ${r?"selected":""}">
      <div class="rarity">${Ue(t.rarity||"Común")}</div>
      <b>${Ue(t.name)}</b>
      <p>${Ue(t.desc)}</p>
      <span class="stat-tag">${Ue(n)}</span>
      <button data-equip="${e}:${t.id}">${r?"Equipado":"Equipar"}</button>
    </div>`}creaturesHTML(e){const t=new Set(e.state.creatures.map(i=>i.id));return`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <p style="max-width:70%">Los ecos salvajes pueden resonar contigo si te acercas y ofreces esencia. Un eco activo te acompaña en combate y otorga un pasivo.</p>
      <span class="eyebrow">${t.size} / ${Object.keys(ai).length} DESCUBIERTOS</span>
    </div>
    <div class="creature-grid">
      ${Object.values(ai).map(i=>{const n=t.has(i.id),s=e.state.creatures.find(r=>r.id===i.id);return`<div class="creature-card ${n?"owned":"locked"} ${s?.active?"active":""}">
          ${n?"":'<span class="lock-mark">?</span>'}
          <div class="creature-type">${Ue(i.type)} · ${Ue(i.rarity)}</div>
          <b>${n?Ue(i.name):"Eco desconocido"}</b>
          <div class="creature-title">${n?Ue(i.title):"Aún no resonado"}</div>
          <p>${n?Ue(i.desc):"Encuéntralo en el mundo y ofrece tu esencia para descubrir su nombre."}</p>
          ${n?`<div class="stat-line" style="margin-top:6px"><span>Pasivo</span><b>${Ue(i.passive)}</b></div>
          <div class="stat-line"><span>Habilidad</span><b>${Ue(i.skill.name)}</b></div>
          <div class="creature-actions"><button data-creature="${i.id}">${s?.active?"Activo":"Invocar"}</button></div>`:""}
        </div>`}).join("")}
    </div>`}skillsHTML(e){const t=e.state.player;return`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <p>La Espada crece contigo. Gana puntos de habilidad al subir de nivel y elige qué parte de su juramento despiertas.</p>
      <span class="eyebrow">${t.skillPoints} PUNTOS DISPONIBLES</span>
    </div>
    <div class="skill-grid">
      ${Yd.map(i=>{const n=e.state.skills[i.id]||0,s=n>=i.max;return`<div class="skill-card ${s?"maxed":""}">
          <div class="skill-head"><b>${Ue(i.name)}</b><span class="skill-rank">${n} / ${i.max}</span></div>
          <p>${Ue(i.desc)}</p>
          <button data-skill="${i.id}" ${s||t.skillPoints<=0?"disabled":""}>${s?"Completa":"Aprender · 1 punto"}</button>
        </div>`}).join("")}
    </div>
    <div class="panel" style="margin-top:14px">
      <h3>Habilidades activas</h3>
      <div class="stat-line"><span>Onda de Aurora</span><b>R · 22 maná</b></div>
      <div class="stat-line"><span>Juicio Celestial</span><b>${e.hasUltimate()?"F · Desbloqueado":"F · Requiere la habilidad Juicio"}</b></div>
      <div class="stat-line"><span>Eco activo</span><b>C · ${e.state.creatures.find(i=>i.active)?Ue(ai[e.state.creatures.find(i=>i.active).id].skill.name):"Sin eco"}</b></div>
    </div>`}journalHTML(e){const t=e.state,i=Pn[t.mainStage],n=Object.values(Bo).filter(s=>t.sideQuests[s.id]?.started);return`<div class="menu-grid">
      <div class="panel">
        <h3>Diario de la Espada</h3>
        <div class="journal-list">
          <div class="journal-item ${t.mainStage>=13?"done":""}">
            <span class="journal-tag">Misión principal · ${t.mainStage+1} / ${Pn.length}</span>
            <h4>${Ue(i?.title||"La Espada Celestial")}</h4>
            <p>${Ue(e.getQuestInfo().objective)}</p>
          </div>
          ${n.length?n.map(s=>{const r=t.sideQuests[s.id],o=r.progress>=s.target;return`<div class="journal-item ${o?"done":""}">
              <span class="journal-tag">${o?"Completada":"Misión secundaria"}</span>
              <h4>${Ue(s.name)}</h4>
              <p>${Ue(s.desc)}</p>
              <p style="color:var(--gold);margin-top:4px">${Ue(s.objective)} (${Math.min(r.progress,s.target)}/${s.target})</p>
            </div>`}).join(""):'<p style="font-size:.58rem;color:var(--muted-2)">Los habitantes de Aetheria tienen historias que contar. Habla con ellos.</p>'}
        </div>
      </div>
      <div class="panel">
        <h3>Ecos del pasado</h3>
        <div class="lore-list">
          ${sl.map(s=>{const r=t.lore.includes(s.id);return`<div class="lore-item" style="${r?"":"opacity:.45"}">
              <b>${r?Ue(s.name):"???"}</b>
              ${r?Ue(s.text.slice(0,105))+"…":"Un recuerdo aún oculto en Aetheria."}
            </div>`}).join("")}
        </div>
        <h4>Registro</h4>
        <div class="stat-line"><span>Enemigos derrotados</span><b>${t.stats.kills||0}</b></div>
        <div class="stat-line"><span>Ecos capturados</span><b>${t.creatures.length}</b></div>
        <div class="stat-line"><span>Cofres abiertos</span><b>${t.stats.chests||0}</b></div>
        <div class="stat-line"><span>Misiones completadas</span><b>${t.stats.quests||0}</b></div>
        <div class="stat-line"><span>Tiempo de juego</span><b>${Da(t.playTime)}</b></div>
      </div>
    </div>`}settingsHTML(){return`<div class="settings-list">
      ${this.settingRow("Música","Composición procedural del mundo","music","range",0,1,.01)}
      ${this.settingRow("Efectos de sonido","Golpes, pasos y resonancia","sfx","range",0,1,.01)}
      ${this.settingRow("Calidad gráfica","Ajusta sombras y resolución interna","quality","select",null,null,null,[["auto","Automática"],["alta","Alta"],["media","Media"],["baja","Baja"]])}
      ${this.settingRow("Tamaño del texto","Interfaz más legible","fontScale","range",.9,1.25,.01)}
      ${this.settingRow("Reducir movimiento","Menos sacudidas y animaciones","reduceMotion","toggle")}
      ${this.settingRow("Alto contraste","Bordes y textos más visibles","highContrast","toggle")}
      ${this.settingRow("Números de daño","Muestra el daño infligido","damageNumbers","toggle")}
      ${this.settingRow("Fijado automático","Orienta los ataques al enemigo cercano","autoTarget","toggle")}
      ${this.settingRow("Sacudida de cámara","Impacto cinematográfico","screenShake","toggle")}
      ${this.settingRow("Controles para zurdos","Invierte joystick y acciones","leftHanded","toggle")}
    </div>`}settingRow(e,t,i,n,s,r,o,c){const l=this.settings[i];let d="";return n==="range"?d=`<input type="range" min="${s}" max="${r}" step="${o}" value="${l}" data-setting="${i}" aria-label="${Ue(e)}" />`:n==="toggle"?d=`<button class="toggle ${l?"on":""}" data-setting="${i}" aria-label="${Ue(e)}"></button>`:n==="select"&&(d=`<select data-setting="${i}" aria-label="${Ue(e)}">${c.map(([h,u])=>`<option value="${h}" ${l===h?"selected":""}>${Ue(u)}</option>`).join("")}</select>`),`<div class="setting-row"><div class="setting-copy"><b>${Ue(e)}</b><small>${Ue(t)}</small></div>${d}</div>`}updateSettingsLabels(){document.querySelectorAll("[data-setting]").forEach(e=>{if(e.type==="range"){const t=e.dataset.setting;Number(e.value)!==Number(this.settings[t])&&(e.value=this.settings[t])}})}renderSettings(){const e=q("settings-grid");e&&(e.innerHTML=this.settingsHTML());const t=q("pause-content");t&&this.pauseTab==="settings"&&(t.innerHTML=this.settingsHTML()),this.updateSettingsLabels()}openModal(e){q(e)?.classList.remove("hidden"),e==="settings-modal"&&this.renderSettings(),this.app?.audio?.play("ui")}closeModal(e){q(e)?.classList.add("hidden"),this.app?.audio?.play("ui")}openMap(){this.renderMap(),q("map-screen").classList.remove("hidden")}closeMap(){q("map-screen").classList.add("hidden")}renderMap(){const e=this.app?.game;if(!e)return;this.drawWorldMap(e);const t=e.state,i=q("map-sidebar");if(!i)return;const n=t.region,s=t.unlockedRegions,r=["valdoria","drakmor","kansordore"];i.innerHTML=r.map(o=>{const c=Mt[o],l=o===n,d=s.includes(o);return`<div class="region-card ${l?"current":""} ${d?"unlocked":"locked"}">
        <h3>${Ue(c.name)}</h3>
        <p>${Ue(c.description)}</p>
        <div class="region-meta"><span>${Ue(c.level)}</span><span>${l?"ESTÁS AQUÍ":d?"DESBLOQUEADA":"BLOQUEADA"}</span></div>
        ${!l&&d?`<button data-travel="${o}">Viajar a ${Ue(c.name)}</button>`:""}
        ${d?"":`<button disabled>${o==="drakmor"?"Derrota al Guardián Astado":"Derrota a la Reina Ceniza"}</button>`}
      </div>`}).join("")+'<div class="map-note">El viaje rápido te lleva al altar de la región. La Convergencia no espera.</div>',i.querySelectorAll("[data-travel]").forEach(o=>{o.addEventListener("click",()=>this.app?.game?.travelTo(o.dataset.travel))})}drawWorldMap(e){const t=q("world-map");if(!t)return;const i=t.getContext("2d"),n=t.width,s=t.height;i.clearRect(0,0,n,s);const r=i.createRadialGradient(n*.5,s*.45,40,n*.5,s*.5,n*.7);r.addColorStop(0,"#12233c"),r.addColorStop(.6,"#081426"),r.addColorStop(1,"#040a13"),i.fillStyle=r,i.fillRect(0,0,n,s),i.strokeStyle="rgba(126,232,250,0.045)",i.lineWidth=1;for(let u=0;u<n;u+=45)i.beginPath(),i.moveTo(u,0),i.lineTo(u,s),i.stroke();for(let u=0;u<s;u+=45)i.beginPath(),i.moveTo(0,u),i.lineTo(n,u),i.stroke();const o={valdoria:{x:250,y:420},drakmor:{x:500,y:300},kansordore:{x:690,y:165}},c=[["valdoria","drakmor"],["drakmor","kansordore"]];i.setLineDash([6,8]),i.strokeStyle="rgba(244,213,141,0.3)",i.lineWidth=2;for(const[u,f]of c){i.beginPath();const p=o[u],v=o[f];i.moveTo(p.x,p.y),i.quadraticCurveTo((p.x+v.x)/2,Math.min(p.y,v.y)-55,v.x,v.y),i.stroke()}i.setLineDash([]);const l=(u,f,p,v,g,m)=>{i.save(),i.translate(u,f),i.beginPath();const _=y=>Math.sin(m*12.9898+y*78.233)*43758.5453%1;for(let y=0;y<=40;y++){const A=y/40*Math.PI*2,E=.82+Math.abs(_(y))*.3,x=Math.cos(A)*p*E,w=Math.sin(A)*v*E;y===0?i.moveTo(x,w):i.lineTo(x,w)}i.closePath();const M=i.createRadialGradient(0,-v*.2,10,0,0,p);M.addColorStop(0,g),M.addColorStop(1,"#07111f"),i.fillStyle=M,i.fill(),i.strokeStyle="rgba(244,213,141,0.18)",i.lineWidth=1.5,i.stroke(),i.restore()};l(o.valdoria.x,o.valdoria.y,150,105,"#2d4b3c",3),l(o.drakmor.x,o.drakmor.y,128,90,"#4a2727",7),l(o.kansordore.x,o.kansordore.y,120,82,"#3d3b62",11);const d=e.state.unlockedRegions,h=e.state.region;for(const u of["valdoria","drakmor","kansordore"]){const f=o[u],p=Mt[u],v=d.includes(u),g=u===h;if(i.save(),i.translate(f.x,f.y),v){const m=1+Math.sin(performance.now()/500+f.x)*.08,_=i.createRadialGradient(0,0,0,0,0,44*m);_.addColorStop(0,g?"rgba(244,213,141,0.42)":"rgba(126,232,250,0.22)"),_.addColorStop(1,"rgba(126,232,250,0)"),i.fillStyle=_,i.beginPath(),i.arc(0,0,44*m,0,Math.PI*2),i.fill()}i.beginPath(),i.arc(0,0,g?9:7,0,Math.PI*2),i.fillStyle=v?g?"#f4d58d":"#7ee8fa":"#4e5869",i.fill(),i.strokeStyle=g?"#fff2c4":"rgba(255,255,255,.4)",i.lineWidth=2,i.stroke(),i.font="600 22px Cinzel, serif",i.textAlign="center",i.fillStyle=v?"#f5f0e6":"#5d6678",i.fillText(p.name,0,48),i.font="500 13px Manrope, sans-serif",i.fillStyle=v?"rgba(245,240,230,.6)":"rgba(93,102,120,.7)",i.fillText(g?"ESTÁS AQUÍ":v?"DESBLOQUEADA":"BLOQUEADA",0,68),v||(i.font="18px Manrope, sans-serif",i.fillText("✦",0,-18)),i.restore()}i.save(),i.translate(70,70),i.strokeStyle="rgba(244,213,141,.35)",i.lineWidth=1,i.beginPath(),i.arc(0,0,26,0,Math.PI*2),i.stroke(),i.beginPath(),i.moveTo(0,-34),i.lineTo(0,34),i.moveTo(-34,0),i.lineTo(34,0),i.stroke(),i.fillStyle="#f4d58d",i.font="600 11px Cinzel, serif",i.textAlign="center",i.fillText("N",0,-38),i.restore(),i.fillStyle="rgba(244,213,141,.5)",i.font="500 11px Manrope, sans-serif",i.textAlign="right",i.fillText("AETHERIA · MAPA DEL VELO",n-26,s-22)}drawMinimap(e){const t=q("minimap");if(!t||!e.world)return;const i=t.getContext("2d"),n=t.width,s=t.height;i.clearRect(0,0,n,s);const r=Mt[e.state.region],o=n/2,c=s/2,l=(n/2-10)/96;i.save(),i.beginPath(),i.arc(o,c,n/2-3,0,Math.PI*2),i.clip();const d=i.createRadialGradient(o,c,4,o,c,n/2);d.addColorStop(0,r.palette.mid),d.addColorStop(1,r.palette.low),i.fillStyle=d,i.fillRect(0,0,n,s),i.strokeStyle="rgba(255,255,255,0.06)",i.lineWidth=1;for(let f=1;f<4;f++)i.beginPath(),i.arc(o,c,(n/2-8)*(f/4),0,Math.PI*2),i.stroke();const h=(f,p)=>({x:o+f*l,y:c+p*l});for(const f of Object.keys(e.world.landmarks)){const p=e.world.landmarks[f];if(typeof p.x!="number")continue;const v=h(p.x,p.z);i.fillStyle="rgba(244,213,141,.55)",i.beginPath(),i.arc(v.x,v.y,2.4,0,Math.PI*2),i.fill()}for(const f of e.enemies){if(f.dead)continue;const p=h(f.group.position.x,f.group.position.z);Math.hypot(p.x-o,p.y-c)>n/2-6||(i.fillStyle=f.def.boss?"#ff8a4a":"#ff6b6b",i.beginPath(),i.arc(p.x,p.y,f.def.boss?4:2.5,0,Math.PI*2),i.fill())}for(const f of e.creatures){if(f.captured)continue;const p=h(f.group.position.x,f.group.position.z);Math.hypot(p.x-o,p.y-c)>n/2-6||(i.fillStyle="#7ee8fa",i.beginPath(),i.arc(p.x,p.y,2.2,0,Math.PI*2),i.fill())}for(const f of e.npcs){if(!f.group.visible)continue;const p=h(f.group.position.x,f.group.position.z);i.fillStyle="#f4d58d",i.beginPath(),i.arc(p.x,p.y,2.8,0,Math.PI*2),i.fill()}if(e.world.questMarker?.visible){const f=e.world.questMarker.position,p=h(f.x,f.z);i.strokeStyle="#f4d58d",i.lineWidth=1.6,i.beginPath(),i.moveTo(p.x,p.y-6),i.lineTo(p.x+4,p.y),i.lineTo(p.x,p.y+6),i.lineTo(p.x-4,p.y),i.closePath(),i.stroke()}const u=h(e.player.group.position.x,e.player.group.position.z);i.save(),i.translate(u.x,u.y),i.rotate(Math.PI-e.player.group.rotation.y),i.fillStyle="#fff3c4",i.beginPath(),i.moveTo(0,-7),i.lineTo(4.5,5),i.lineTo(0,2.5),i.lineTo(-4.5,5),i.closePath(),i.fill(),i.strokeStyle="#0a1220",i.lineWidth=1,i.stroke(),i.restore(),i.restore(),i.strokeStyle="rgba(244,213,141,.4)",i.lineWidth=2,i.beginPath(),i.arc(o,c,n/2-3,0,Math.PI*2),i.stroke()}showCapture(e,t,i,n,s){this.capture={creature:e,onConfirm:n,onCancel:s},q("capture-portrait").innerHTML=Hc(e),q("capture-name").textContent=e.name,q("capture-title").textContent=`${e.title} · ${e.type} · ${e.rarity}`,q("capture-desc").textContent=e.desc,q("capture-chance").textContent=`${Math.round(t*100)}%`,q("capture-cost").textContent=i?"1":"0 (sin esencia)",q("btn-capture").disabled=!i,q("capture-modal").classList.remove("hidden")}hideCapture(){this.capture=null,q("capture-modal").classList.add("hidden")}showDeath(){q("death-screen").classList.remove("hidden")}hideDeath(){q("death-screen").classList.add("hidden")}showEnding(e,t){const i=Ic[e]||Ic.restaurar;q("ending-kicker").textContent="FINAL DESBLOQUEADO",q("ending-title").textContent=i.title,q("ending-title").style.color=i.color,q("ending-subtitle").textContent=i.subtitle,q("ending-text").textContent=i.text,q("ending-epilogue").textContent=i.epilogue,q("ending-stats").innerHTML=`
      <div class="ending-stat"><span>Tiempo</span><b>${Da(t.playTime)}</b></div>
      <div class="ending-stat"><span>Nivel</span><b>${t.level}</b></div>
      <div class="ending-stat"><span>Ecos</span><b>${t.creatures} / 9</b></div>
      <div class="ending-stat"><span>Enemigos</span><b>${t.kills}</b></div>
      <div class="ending-stat"><span>Memorias</span><b>${t.lore} / 6</b></div>`,q("ending-screen").classList.remove("hidden")}hideEnding(){q("ending-screen").classList.add("hidden")}}const bv={KeyJ:"attack",KeyK:"heavy",Space:"dodge",KeyR:"spell",KeyC:"creature",KeyF:"ultimate",KeyH:"potion"},wv={KeyW:"W",KeyA:"A",KeyS:"S",KeyD:"D",ArrowUp:"↑",ArrowLeft:"←",ArrowDown:"↓",ArrowRight:"→",ShiftLeft:"Shift",ShiftRight:"Shift",Space:"Espacio"};function Ev(a){return a instanceof HTMLElement&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA"||a.isContentEditable)}function Av(){try{const a=localStorage.getItem(Xd);return a?JSON.parse(a):null}catch{return null}}class Tv{constructor(){this.canvas=document.getElementById("game-canvas"),this.mode="loading",this.game=null,this.audio=new $g,this.clock=new Zu,this.elapsed=0,this.lastFrame=performance.now(),this.audioUnlocked=!1,this.quality="auto",this.qualityProfile=null,this.inputBlocked=!1,this.boundKeys=new Set,this.offline=!navigator.onLine,this.createRenderer(),this.createCamera(),this.ui=new Sv,this.ui.setApp(this),this.titleScene=new yv(this.renderer),this.previewScene=null,this.currentScene=this.titleScene.scene,this.currentCamera=this.titleScene.camera,this.bindEvents(),this.resize(),this.showTitle(),this.ui.setLoading(!1),this.loop=this.loop.bind(this),requestAnimationFrame(this.loop)}createRenderer(){try{this.renderer=new qg({canvas:this.canvas,antialias:!0,alpha:!1,powerPreference:"high-performance",stencil:!1})}catch(e){console.error("No se pudo iniciar WebGL",e),this.renderer=null;const t=document.getElementById("loading-screen");t&&(t.innerHTML='<div class="loading-title">LA ESPADA CELESTIAL</div><div class="loading-text">Tu navegador no puede dibujar el Velo. Activa WebGL o prueba otro navegador.</div>');return}this.renderer.outputColorSpace=Kt,this.renderer.toneMapping=Go,this.renderer.toneMappingExposure=1.08,this.renderer.setClearColor("#070d1b",1),this.renderer.shadowMap.type=Gc}createCamera(){this.camera=new di(42,1,.1,340),this.camera.position.set(0,15.5,17.5),this.camera.lookAt(0,1.45,0)}setQuality(e="auto"){if(this.quality=e,!this.renderer)return;const t=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||Math.min(window.innerWidth,window.innerHeight)<720,i=window.devicePixelRatio||1;let n,s;e==="bajo"?(n=Math.min(1,i),s=!1):e==="medio"?(n=Math.min(1.25,i),s=!0):e==="alto"?(n=Math.min(2,i),s=!0):(n=Math.min(t?1.45:1.85,i),s=!t),this.qualityProfile={ratio:n,shadows:s,mobile:t},this.renderer.setPixelRatio(n),this.renderer.shadowMap.enabled=s,this.resize()}resize(){if(!this.renderer)return;const e=Math.max(1,window.innerWidth),t=Math.max(1,window.innerHeight);this.renderer.setSize(e,t,!1);const i=e/t;this.camera.aspect=i,this.camera.updateProjectionMatrix(),this.titleScene?.resize(e,t),this.previewScene?.resize(e,t)}bindEvents(){window.addEventListener("resize",()=>this.resize()),window.addEventListener("orientationchange",()=>setTimeout(()=>this.resize(),120));const e=()=>{this.audioUnlocked||(this.audioUnlocked=!0,this.audio.start().then(()=>{this.audio.setMusicVolume(this.ui.settings.music),this.audio.setSfxVolume(this.ui.settings.sfx),this.audio.setTheme(this.mode==="game"&&this.game?this.game.state.region:"title",!1)}).catch(()=>{}))};window.addEventListener("pointerdown",e,{passive:!0}),window.addEventListener("keydown",e),window.addEventListener("keydown",t=>this.onKeyDown(t)),window.addEventListener("keyup",t=>this.onKeyUp(t)),window.addEventListener("blur",()=>this.releaseInput()),window.addEventListener("online",()=>{this.offline=!1,document.getElementById("offline-indicator")?.classList.add("hidden")}),window.addEventListener("offline",()=>{this.offline=!0,document.getElementById("offline-indicator")?.classList.remove("hidden")}),this.offline&&document.getElementById("offline-indicator")?.classList.remove("hidden"),document.addEventListener("visibilitychange",()=>{document.hidden?(this.releaseInput(),this.game&&this.mode==="game"&&this.game.save()):this.clock.getDelta()})}onKeyDown(e){if(Ev(e.target))return;const t=this.ui,i=!document.getElementById("dialogue-overlay")?.classList.contains("hidden"),n=!document.getElementById("cinematic-overlay")?.classList.contains("hidden");if(i){(e.code==="KeyE"||e.code==="Space"||e.code==="Enter")&&(e.preventDefault(),e.repeat||t.advanceDialogue());return}if(n){(e.code==="KeyE"||e.code==="Space"||e.code==="Enter")&&(e.preventDefault(),e.repeat||t.advanceCinematic());return}if(e.code==="Escape"){e.preventDefault(),this.mode==="game"?this.openPause():this.mode==="pause"?this.resume():this.mode==="map"?this.closeMap():(this.mode==="death"||this.mode==="ending")&&this.quitToTitle();return}if(this.mode==="pause"){e.code==="KeyM"&&this.openMap();return}if(this.mode!=="game"||!this.game)return;if(e.code==="KeyM"){e.preventDefault(),this.openMap();return}if(e.code==="KeyE"){e.preventDefault(),e.repeat||this.game.interact();return}if(e.code==="KeyQ"){e.preventDefault(),this.game.setBlocking(!0);return}(wv[e.code]||["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowLeft","ArrowDown","ArrowRight","ShiftLeft","ShiftRight"].includes(e.code))&&((e.code.startsWith("Arrow")||e.code==="Space")&&e.preventDefault(),this.game.setKey(e.code,!0),this.boundKeys.add(e.code));const s=bv[e.code];s&&!e.repeat&&(e.preventDefault(),this.game.action(s))}onKeyUp(e){if(this.game){if(e.code==="KeyQ"){this.game.setBlocking(!1);return}this.boundKeys.has(e.code)&&(this.game.setKey(e.code,!1),this.boundKeys.delete(e.code))}}releaseInput(){if(!this.game)return;for(const t of this.boundKeys)this.game.setKey(t,!1);this.boundKeys.clear(),this.game.setBlocking(!1),this.ui.joystick.x=0,this.ui.joystick.y=0,this.ui.joystick.active=!1;const e=document.getElementById("joystick-knob");e&&(e.style.transform="translate(0px, 0px)")}showTitle(){this.releaseInput(),this.game&&(this.game.dispose(),this.game=null),this.ui.showTitle(),this.mode="title",this.currentScene=this.titleScene.scene,this.currentCamera=this.titleScene.camera,this.audio.setTheme("title",!1),this.ui.setLoading(!1)}showCreation(){this.releaseInput(),this.ui.showCreation(),this.mode="creation"}showPreview(e){this.previewScene||(this.previewScene=new Mv(this.renderer)),this.previewScene.setProfile(e),this.previewScene.resize(window.innerWidth,window.innerHeight),this.currentScene=this.previewScene.scene,this.currentCamera=this.previewScene.camera,this.mode!=="creation"&&(this.mode="creation")}startNewGame(e){this.releaseInput(),this.game&&this.game.dispose(),this.ui.hideAll(),this.ui.setLoading(!0),this.ui.showHUD(),this.ui.hudCache={},this.ui.questCache="",this.ui.interactionCache="",this.ui.bossCache="";const t=Vs.createState(e);t.flags={...t.flags||{},introSeen:!0},this.game=new Vs(this,t),this.mode="game",this.currentScene=this.game.scene,this.currentCamera=this.camera,this.audio.start().then(()=>{this.audio.setTheme(t.region,!1)}).catch(()=>{}),this.audio.setTheme(t.region,!1),this.game.startIntro(),this.game.save(),this.resize(),this.ui.setLoading(!1)}continueGame(){const e=Av();if(!e){this.ui.toast("Sin partida","No hay una leyenda guardada en este dispositivo.","error");return}this.releaseInput(),this.game&&this.game.dispose(),this.ui.hideAll(),this.ui.setLoading(!0),this.ui.showHUD(),this.ui.hudCache={},this.ui.questCache="",this.ui.interactionCache="",this.ui.bossCache="",this.game=new Vs(this,e),this.mode="game",this.currentScene=this.game.scene,this.currentCamera=this.camera,this.audio.start().then(()=>{this.audio.setTheme(this.game.state.region,!1)}).catch(()=>{}),this.audio.setTheme(this.game.state.region,!1),this.resize(),this.ui.setLoading(!1)}openPause(){this.mode!=="game"||!this.game||(this.releaseInput(),this.mode="pause",this.ui.openPause("status"))}resume(){this.game&&(this.ui.closePause(),this.ui.closeMap(),this.mode="game",this.clock.getDelta())}openMap(){this.game&&(this.releaseInput(),this.mode="map",this.ui.closePause(),this.ui.openMap())}closeMap(){this.ui.closeMap(),this.game&&(this.mode="game",this.clock.getDelta())}enterDeath(){this.releaseInput(),this.mode="death",this.ui.showDeath()}resumeFromDeath(){this.ui.hideDeath(),this.game&&(this.mode="game",this.clock.getDelta())}enterEnding(e){if(!this.game)return;this.releaseInput(),this.mode="ending";const t=this.game.state;this.ui.showEnding(e,{playTime:t.playTime,level:t.player.level,creatures:t.creatures.length,kills:t.stats.kills||0,lore:t.lore.length})}continueAfterEnding(){this.game&&(this.ui.hideEnding(),this.ui.showHUD(),this.game.frozen=!1,this.game.state.ending=null,this.mode="game",this.clock.getDelta(),this.game.save())}quitToTitle(){this.releaseInput(),this.ui.hideCapture?.(),this.ui.closePause(),this.ui.closeMap(),this.ui.hideDeath(),this.ui.hideEnding(),this.showTitle()}loop(e){if(requestAnimationFrame(this.loop),!this.renderer)return;const t=Math.min(.05,Math.max(0,(e-this.lastFrame)/1e3||.016));this.lastFrame=e,this.elapsed+=t;const i=Math.min(t,1/20);this.mode==="title"?(this.titleScene.update(i),this.currentScene=this.titleScene.scene,this.currentCamera=this.titleScene.camera):this.mode==="creation"?(this.previewScene?.update(i),this.currentScene=this.previewScene?.scene||this.titleScene.scene,this.currentCamera=this.previewScene?.camera||this.titleScene.camera):this.game&&(this.mode==="game"?this.game.update(i):this.mode==="death"&&this.game.update(i),this.currentScene=this.game.scene,this.currentCamera=this.camera),this.audio.update(),this.renderer.render(this.currentScene,this.currentCamera)}}window.addEventListener("error",a=>{console.error("Error en LA ESPADA CELESTIAL",a.error||a.message)});const Cv=new Tv;window.__espada=Cv;
