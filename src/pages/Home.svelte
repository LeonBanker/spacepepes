<script>
import { onMount, getContext} from 'svelte';
import { slide, fade } from 'svelte/transition';
import { address, contract, provider, nfts, balances } from '../store';
import Card from "../cards/dex.svelte"
import { Swiper, SwiperSlide } from 'swiper/svelte';
import "swiper/css/pagination"

    //Help import data from opensea and pass into SwiperSlide <3 
    import { 
        initProvider,
    } from '../utils.js';
import 'swiper/css';
async function connectEthProvider(reconnect=false) {
    if(!$address) {
        await initProvider(app, reconnect);
        $address = $address;
    }
}import SwiperCore, {
  Pagination
} from 'swiper';

// install Swiper modules
SwiperCore.use([Pagination]);


function connectWallet(event) {
    connectEthProvider(false);
}   
var metadata = {
     "name": "SpacePepesFTM",
     "description": "100 SpacePepe's from an unknown F-type main sequence star have received an arrival beacon through Lieutenant Pepe that extraterrestrial contact with Earth has been established. They want to use the energy of the earthlings living there and establish a permanent settlement. Though they look terrifying, these SpacePepes are smart creatures that love the fine arts like the Opera.",
     "image": 'https://spacepepes.com/pepes/',
     "external_url": 'https://spacepepes.com/pepes/'
};
</script>

<main>
  <div class="wrapper">
        <Swiper style="height:max-content!important;margin:auto!important;"
        spaceBetween={50}
        slidesPerView={1} pagination='{{
          "clickable": true
        }}'
        on:slideChange={() => console.log('slide change')}
        on:swiper={(e) => console.log(e.detail[0])}
      >
      {#if !$nfts }
      <SwiperSlide>      
        <Card 
        nfttitle="NOT CONNECTED"
        desc="Nft Description Placeholder"
        owner="NO ONE"
        protocol='ERC-721'
          >
          <div><button on:click={connectWallet}>CONNECT WALLET</button></div>
        </Card>
      </SwiperSlide>

      {:else}     
      {#each $nfts as nft} 
      <SwiperSlide>      
        <Card 
        nfttitle="{metadata['name']} #{nft['nftId']+1}"
        desc="{metadata['description']}"
        owner="Owner I"
        nftimage='/pepes/{nft['image']}'
        protocol='ERC-721'
          />
          <img class="scrollimg" src="/imgs/Bar-Arrow.gif" alt="" />
        
      </SwiperSlide>
      {/each}
      
      {/if}
    </Swiper>
    <footer transition:slide >
    </footer>
  </div>
  <canvas transition:fade style="height: 100vh;
  position: fixed;
  top: 0px;
  width: 100vw;
  left: 0px;" id="starfield"></canvas>

<script>
/*****************************************************************************
The MIT License (MIT)

Copyright (c) 2014 Andi Smithers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*****************************************************************************/

// conceptualized and written by andi smithers
// globals
var canvas, context, alpha;
var cX, cY, tX, tY, mouseX, mouseY, density;
var stars = [];
var cameraDepth=0;
var enterWarp, warpStartDepth, warpTime, velocity;

// define to 0 to brute force move all stars
const cameraTrick = 1;

// options
const starCount = 1024;
var initVelocity = -1.0;
var termVelocity = -10.0;
const topleft = 0;
const trackMouse = 1;
const focalPoint = 256;
const sparcity = 1.0;
const tailLength = 20;

// depth modulo fucntion. custom
function modulo(a)
{
  // depth range is 1024
  const b = 1024;
	return a-b * Math.floor(a/b);
}

// handles negative numbers correctly
function modulo2(a, b)
{
	return a-b * Math.floor(a/b);
}

function Star(index)
{
  // randomize a field -1024 to 1024 and positive z
  this.x = (Math.random() *2048-1024)*sparcity;
  this.y = (Math.random() *2048-1024)*sparcity;
  this.z = ((starCount-1)-index)/density;

  if (topleft==1) 
  {
    this.x = this.x + 1024;
    this.y = this.y + 1024;
  }
}

Star.prototype.move = function()
{
  // dont really have to move all stars
  this.z = modulo(this.z + velocity)
}

Star.prototype.draw = function() 
{
  // compute depth perspective effect, cameraDepth is used when cameraTrick = 1
  var depth = focalPoint / (modulo(this.z + cameraDepth) +1);
  var x = this.x * depth + cX;
  var y = this.y * depth + cY;
  var sz = 5 * depth;
  
  // fill a rect
  context.beginPath();
  context.rect(x, y, sz,sz);
  context.fillStyle = 'white';
  context.fill();
  // use border edge for twinkle effect 
  context.lineWidth = 0;
  context.strokeStyle = 'black';
  context.stroke();
};

Star.prototype.warpline = function() 
{
  var depth = modulo(this.z + cameraDepth)+1;
  var depthStart = modulo(this.z + warpStartDepth)+1
  if (depth>depthStart && termVelocity<0) depth = 1;
  if (depth<depthStart && termVelocity>0) depthStart = 1;
  
  var invDepth = focalPoint / depth;
  var invDepthStart = focalPoint / depthStart;
  
  var x = this.x * invDepth + cX;
  var y = this.y * invDepth + cY;
  var sz = 5 * invDepth ;
  
  var wx = this.x * invDepthStart + cX;
  var wy = this.y * invDepthStart + cY;
  var wsz = 5 * invDepthStart;
	
  // computed quadrant dictates what 2 edges we see in rendering the trail
  var top = this.y<0? sz : 0;
  var left = this.x<0? sz : 0;
  var alpha = (sz/5.0+0.1) * 0.7;
  // fill a ray
  context.beginPath();
  context.moveTo(wx, wy);
  context.lineTo(x+sz, y+top);
  context.lineTo(x, y+top);
  context.moveTo(wx, wy);
  context.lineTo(x+left, y+sz);
  context.lineTo(x+left, y);
  context.closePath();
  context.fillStyle = termVelocity<0?'rgba(64,128,192,'+alpha+')':'rgba(192,64,32,'+ alpha+')';
  context.fill();
  // use border edge for twinkle effect 
 // context.lineWidth = 0;
 // context.strokeStyle = 'black';
 // context.stroke();

};

function init()
{
  // setup canvas and context
	canvas = document.getElementById('starfield');
	context = canvas.getContext('2d');
  // set canvas to be window dimensions
  resize();
  canvas.addEventListener('mousemove', mousemove);
  canvas.addEventListener('click', mouseclick);
  window.addEventListener('resize', resize);

  // compute center of screen (its really centre but for americans I change it)
	tX = cX = canvas.width/2;
	tY = cY = canvas.height/4;
  
  if (topleft==1) 
  {
    cX=0;
    cY=0;
  }
  
  density = starCount/1024;
  // allocate and init stars
  for (i=0; i<starCount; i++)
  {
  	stars[i] = new Star(i);
  }
  
  alpha = 6.0;
  enterWarp = false;
  velocity = initVelocity;
}

function animate()
{
  // movement update
  move();
  // render update
  render();
  // trigger next frame
  requestAnimationFrame(animate);
}

function move()
{
  
  if (enterWarp)
  {
    velocity*=1.02;
    if (velocity<termVelocity && termVelocity<0) velocity=termVelocity;
    if (velocity>termVelocity && termVelocity>0) velocity=termVelocity;
    warpTime=warpTime+1;
    if (warpTime>140) enterWarp = false;
    if (warpTime>tailLength) warpStartDepth=modulo(warpStartDepth+velocity);
    // catchup time
    if (warpTime>130)
    {
      warpStartDepth = modulo(warpStartDepth + (cameraDepth-warpStartDepth) * 0.3);
    }
  }
  else
  {
     // slow down
	   var dv = velocity - initVelocity;
     velocity-= dv * 0.01;
  }
  // brute force move.. will replace with camera trick
  if (cameraTrick==0)
  {
  	for (i = 0; i < stars.length; i++) 
  	{
  		stars[i].move();
  	};
  }
  else
  {
  	// camera movement trick
  	cameraDepth = modulo(cameraDepth+velocity);
  }
  
  var dx = tX - cX;
  var dy = tY - cY;
  var dist = Math.sqrt(dx*dx + dy*dy);

  if (dist!=0)
   {
     dx/=dist;
     dy/=dist;
   }
  dist = Math.min(dist, 512.0);

  cX = cX + (dist*dx*0.06125);
  cY = cY + (dist*dy*0.06125);
 
}

function render()
{
  // brute force clear
  context.clearRect(0, 0, canvas.width, canvas.height);

  // draw all stars
  for (i = 0; i < stars.length; i++) 
  {
    var index = cameraTrick==1 ? modulo2((i + 1 + Math.floor(cameraDepth)*density) , stars.length) : i;
    // depending on direction of travel is order of drawing trails
    if (enterWarp && termVelocity<=0) stars[index].warpline();
    stars[index].draw();
    if (enterWarp && termVelocity>0) stars[index].warpline();
  };
  
  
  // banner for a about 12 seconds
  alpha -= 0.008;
  if (alpha<=0) return;
  context.font = '40pt Space Mono';
  context.fillStyle = 'rgba(255,255,255,'+alpha+')';
  context.textAlign = "center";
}

function mousemove(event) 
{
	var rect = canvas.getBoundingClientRect();

	mouseX = event.clientX - rect.left,
	mouseY = event.clientY - rect.top
  // just for fun lets just click on moving
  if (trackMouse)
  {
    tX = mouseX;
    tY = mouseY;
    if (termVelocity>0)
    {
      tX = canvas.width - tX;
      tY = canvas.height - tY;
    }
  }
}

function mouseclick()
{
  tX = mouseX;
  tY = mouseY;
  if (termVelocity>0)
  {
    tX = canvas.width - tX;
    tY = canvas.height - tY;
  }  
  // swap
  if (hitButton(canvas.width/2-100, 10, 200, 32))
  {
    swapView();
    return;
  }
  
  if (!enterWarp)
  {
    enterWarp = true;
    warpStartDepth = cameraDepth;
    warpTime = 0;
  }
}
  

function resize()
{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function swapView()
{
  // inverse the velocities
  initVelocity*=-1;
  termVelocity*=-1;
  velocity*=-1;
  // switch warplines
  if (enterWarp)
  {
    var tmp = cameraDepth;
    cameraDepth = warpStartDepth;
    warpStartDepth = tmp;
  }
  // change view point of travel
  if (termVelocity>0)
  {
    cX = canvas.width - cX;
    cY = canvas.height - cY;
    tX = canvas.width - tX;
    tY = canvas.height - tY;
    }
  else
  {
    cX = canvas.width - cX;
    cY = canvas.height - cY;
    tX = mouseX;
    tY = mouseY;
  }


}

function hitButton(x, y, w, h)
{
  return (mouseX>x && mouseX<x+w && mouseY>y && mouseY<y+h) ? true : false;
}

function createButton(x, y, w, h, name)
{
    // fill a rect
  context.beginPath();
  context.rect(x, y, w,h);
  context.fillStyle = 'rgba(0, 0, 0, 0.5)';
  context.fill();

  context.lineWidth = 2;
  context.strokeStyle = 'rgba(120, 120, 120, 0.5)';
  context.stroke();
  
  context.moveTo(x,y);
  context.font = '20pt Calibri';
  context.fillStyle = 'rgba(255,255,255, 1)';
  context.textAlign = "center";
  context.fillText(name, x+w/2, y+h-9);
}

// entry point
init();
animate();


</script>
</main>

<style type="text/scss">

$stars: 350;         // Number of start per layer
$depth: 300;         // Depth between star layers
$speed: 3s;          // Number of seconds to transition between layers
$width: 3000;        // Width of the starfield
$height: 960;        // Height of the starfield

html, body {
  height: 100%;
  overflow: hidden;
}
body {
  background: #000;
  perspective: 340px;
}

.nav-row{
  position: relative;
  height:100px;top:0px;width:calc(100vw - 4rem);
  display:flex;
  flex-flow:row;
  justify-content: space-between;
  margin:auto;padding:1rem 2rem;
}
.wrapper{    
  position: relative;
    height: auto;
    display: flex;
    min-height: 70vh;
}
@media screen and (max-width: 1000px) {


}
.scrollimg{
  mix-blend-mode: screen;
         filter: brightness(0.5);
         opacity: 0.5;
         position: absolute;
         border-radius:50%;
         right: 0px;
         top: calc(50% - 15rem);
         height: 30rem;
}

.nav-links{display:flex;flex-flow:row;justify-content:space-around;}
.nav-links > a{margin:1rem;}
.stars {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 2px;
  $box-shadow: ();
  @for $i from 0 through $stars {
    $box-shadow: $box-shadow, (random($width)-$width/2 + px) (random($height)-$height/2 + px) hsl(90,0,75+random(25));
  }
  box-shadow: $box-shadow;
  animation: fly $speed linear infinite;
  transform-style: preserve-3d;
  
  &:before, &:after {
    content: "";
    position: absolute;
    width: inherit;
    height: inherit;
    box-shadow: inherit;
  }
  &:before {
    transform: translateZ(-$depth + px);
    animation: fade1 $speed linear infinite;
  }
  &:after {
    transform: translateZ(-$depth * 2 + px);
    animation: fade2 $speed linear infinite;
  }
}

@keyframes fly {
  from {
    transform: translateZ(0px);
  }
  to {
    transform: translateZ($depth + px);
  }
}

@keyframes fade1 {
  from {
    opacity: .5;
  }
  to {
    opacity: 1;
  }  
}
@keyframes fade2 {
  from {
    opacity: 0;
  }
  to {
    opacity: .5;
  }  
}
</style>