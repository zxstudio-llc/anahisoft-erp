import{j as e}from"./app-DQczwFTk.js";import{c as n}from"./utils-CPN-yreq.js";import{B as c}from"./button-BYXnJyXv.js";import{D as m,a as l,b as x,c as r,e as p}from"./dropdown-menu-DWIT9g2E.js";import{c as d}from"./createLucideIcon-D40S4Mwt.js";import{c as h}from"./app-sidebar-layout-DjIGW_b8.js";import{E as g}from"./eye-off-B_owjCxK.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]],a=d("ArrowDown",j);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]],i=d("ArrowUp",f);function N({column:s,title:o,className:t}){return s.getCanSort()?e.jsx("div",{className:n("flex items-center space-x-2 ml-2",t),children:e.jsxs(m,{children:[e.jsx(l,{asChild:!0,children:e.jsxs(c,{variant:"ghost",size:"sm",className:"-ml-3 h-8 data-[state=open]:bg-accent",children:[e.jsx("span",{children:o}),s.getIsSorted()==="desc"?e.jsx(a,{}):s.getIsSorted()==="asc"?e.jsx(i,{}):e.jsx(h,{})]})}),e.jsxs(x,{align:"start",children:[e.jsxs(r,{onClick:()=>s.toggleSorting(!1),children:[e.jsx(i,{className:"h-3.5 w-3.5 text-muted-foreground/70"}),"Asc"]}),e.jsxs(r,{onClick:()=>s.toggleSorting(!0),children:[e.jsx(a,{className:"h-3.5 w-3.5 text-muted-foreground/70"}),"Desc"]}),e.jsx(p,{}),e.jsxs(r,{onClick:()=>s.toggleVisibility(!1),children:[e.jsx(g,{className:"h-3.5 w-3.5 text-muted-foreground/70"}),"Hide"]})]})]})}):e.jsx("div",{className:n(t),children:o})}export{N as D};
