import{f as D}from"./app-DQczwFTk.js";import{r as E}from"./avatar-CLHvFKAC.js";var s={exports:{}},d={};/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var W;function O(){if(W)return d;W=1;var a=D(),j=E();function p(r,u){return r===u&&(r!==0||1/r===1/u)||r!==r&&u!==u}var z=typeof Object.is=="function"?Object.is:p,M=j.useSyncExternalStore,S=a.useRef,_=a.useEffect,q=a.useMemo,y=a.useDebugValue;return d.useSyncExternalStoreWithSelector=function(r,u,v,m,f){var t=S(null);if(t.current===null){var i={hasValue:!1,value:null};t.current=i}else i=t.current;t=q(function(){function h(e){if(!R){if(R=!0,l=e,e=m(e),f!==void 0&&i.hasValue){var o=i.value;if(f(o,e))return n=o}return n=e}if(o=n,z(l,e))return o;var V=m(e);return f!==void 0&&f(o,V)?(l=e,o):(l=e,n=V)}var R=!1,l,n,b=v===void 0?null:v;return[function(){return h(u())},b===null?void 0:function(){return h(b())}]},[u,v,m,f]);var c=M(r,t[0],t[1]);return _(function(){i.hasValue=!0,i.value=c},[c]),y(c),c},d}var w;function G(){return w||(w=1,s.exports=O()),s.exports}var A=G();export{A as w};
