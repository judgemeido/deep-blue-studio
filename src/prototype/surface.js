import { DataTexture,RGBAFormat,RepeatWrapping,LinearFilter } from 'three';
export function createPaintTexture(){
 const size=64,data=new Uint8Array(size*size*4);let seed=1997;
 for(let i=0;i<data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=150+(seed>>>26);data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}
 const texture=new DataTexture(data,size,size,RGBAFormat);texture.wrapS=texture.wrapT=RepeatWrapping;texture.repeat.set(12,12);texture.magFilter=texture.minFilter=LinearFilter;texture.needsUpdate=true;return texture;
}
