!function(){function r(e,a,v,i){if(0>=a)return n(e);for(var o=0,t=0,u=0;16>u;u++
){var c=e[u];if(c){var s=16*c+u;o^=A[s],t^=B[s]}}var s=o+""+t,d=w[s];if(d&&d.d>=
a&&(!d.u||d.v<=v))return i?d.m:d.v;var l=[N,L,M,I];if(d){var y=l.indexOf(d.m),m=
l[y];l[y]=l[0],l[0]=m}for(var g=void 0,b=!1,u=0;u<l[h];u++){var p=e.slice(),z=l[
u];if(f(p,z)){g=g||z;for(var k=1e9,E=15;E>=0&&k>v;E--)p[E]||(p[E]=2,k=x(k,r(p,a-
1,v)),p[E]=0);k>v&&(v=k,g=z,b=!0)}}return g?(w[s]={d:a,v:v,m:g,u:!b},i?g:v):i?M:
-1e5+n(e)}function n(r){for(var n=0,v=0,i=0,f=0,o=0;4>o;o++)for(var t=0;4>t;t++)
{var u=a(r,o,t);if(u){if(n+=u*O[4*o+t],3>t){var c=a(r,o,t+1);if(c&&(v+=e(u,c)*m(
u+c),2>t)){var s=a(r,o,t+2);if(s&&e(u,s)<=1.1){var d=x(u,s);i+=e(d,c)*m(d)}}}if(
3>o&&(c=a(r,o+1,t),c&&(v+=e(u,c)*m(u+c),2>t))){var s=a(r,o+2,t);if(s&&e(u,s)<=
1.1){var d=x(u,s);i+=e(d,c)*m(d)}}}else f++}var y=11.1-11.1/(1+l.pow(f/2.48,2.71
));return.04*n+5*y-.5*v-2*i}function e(r,n){return r>n?C[r]-C[n]:C[n]-C[r]}
function a(r,n,e){return r[4*n+e]}function v(r,n,e,a){r[4*n+e]=a}function i(r,n)
{return r>=0&&4>r&&n>=0&&4>n}function f(r,n){for(var e=3*n.x,f=5*(1-n.x)-1,o=1-2
*n.x,t=!1,u=e;u!=f;u+=o)for(var c=e;c!=f;c+=o)if(a(r,u,c))for(var s=u+n.u,d=c+
n.v,l=u,y=c;i(s,d);){var m=a(r,s,d),x=a(r,l,y);if(m){if(m==x){v(r,s,d,-2*x),v(r,
l,y,0),t=!0;break}}else v(r,s,d,x),v(r,l,y,0),t=!0;l=s,y=d,s+=n.u,d+=n.v}if(!t)
return!1;for(var g=0;16>g;g++)r[g]<0&&(r[g]*=-1);return!0}function o(){for(var r
=c("tile-container")[0],n=[],e=0;e<r[b][h];e++){var a=r[b][e],i=a[d],f=
"tilel-position-",o=i.indexOf(f)+f[h],u=i.substring(o,o+3);n.push({v:t(a[b][0].
innerHTML),y:t(u[2])-1,z:t(u[0])-1})}for(var s=new Array(16),e=0;16>e;e++)s[e]=0
;for(var e=0;e<n[h];e++){var a=n[e];v(s,a.y,a.z,a.v)}return s}var t=parseInt,u=
document,c=u.getElementsByClassName.bind(u),s=setInterval,d="className",l=Math,y
=l.random,m=l.log,x=l.min,g=l.round,b="children",h="length",p=4294967295,w={};A=
{},B={};for(var z=0;16>z;z++)for(var k=2;8192>=k;k*=2){var E=16*k+z;A[E]=g(p*y()
),B[E]=g(p*y())}for(var O=[0,0,0,10,0,0,0,15,0,0,-5,20,10,15,20,50],C={},z=0;20>
z;z++)C[1<<z]=z;var I={u:-1,v:0,x:0,y:38,z:"Up"},L={u:1,v:0,x:1,y:40,z:"Down"},M
={u:0,v:-1,x:0,y:37,z:"Left"},N={u:0,v:1,x:1,y:39,z:"Right"};s(function(){var n=
o(),e=r(n,4,-1e9,!0),a=new Event("keydown",{bubbles:!0});a.key=e.z,a.keyCode=e.y
,a.which=e.y,u.body.dispatchEvent(a)},50),s(function(){var r=c("game-message")[0
];if(r[d].indexOf("game-won")>=0){var n=c("keep-playing-button")[0];n.click()}},
1e3)}();
