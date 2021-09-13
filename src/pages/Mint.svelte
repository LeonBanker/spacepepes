<script>
    import { Link } from "svelte-routing";
    import { fade } from 'svelte/transition';
    import { address, contract, provider, alreadyMinted, etherLoading, totalSupply, maxSupply } from '../store';
    import { onMount, getContext} from 'svelte';
    import { 
        initProvider,
        mintPepe,
    } from '../utils.js';

    const app = getContext('app');
    var addressDisplay = ''
    async function connectEthProvider(reconnect=false) {
        if(!$address) {
            await initProvider(app, reconnect);
            addressDisplay = String($address).slice(0,10)+"...";
            $address = $address;
        }
    }

    function connectWallet(event) {
        connectEthProvider(false);
    }    

    async function mint(event) {
      await mintPepe(contract, provider);
    }
</script>

<div>
    <div class="wrapper">
        <div class="mint-box">
            <div class="mint-title-box">
                <h1>MINT A SPACEPEPE</h1>
                <p>Only one per account.</p>
                {#if $totalSupply > 0}
                <p>{$totalSupply}/99 Minted</p>
                {/if}
            </div>
            <div class="mint-image-wrapper">
              {#if $etherLoading == true}
                <img style='max-width:30%; margins:auto;' src="/imgs/pepe_loading.gif" alt="">
              {:else}
                <img src="/imgs/mintpepe.png" alt="">
              {/if}
            </div>
            <div style="margin-bottom:2rem;">
              Price: 1 BNB
            </div>
            {#if $etherLoading === false}
            <div class="mint-button-wrapper">
                {#if !$address}
                  <button on:click={connectWallet}><h2>CONNECT WALLET</h2></button>
                {:else if $alreadyMinted == true}
                  <Link to='/mypepes'><button ><h2>MY SPACEPEPES</h2></button></Link>
                {:else}
                  <button><h2>SOLD OUT</h2></button>
                {/if}
            </div>
            {/if}
            <div>
                {addressDisplay}
            </div>
        </div>    
    </div>
    
        <canvas transition:fade style="z-index: -1;height: 100vh;
        position: fixed;
        top: 0px;
        width: 100vw;
        left: 0px;" id="canvas"></canvas>
        <script>
        "use strict";

var canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d'),
  w = canvas.width = window.innerWidth,
  h = canvas.height = window.innerHeight,
    
  hue = 217,
  stars = [],
  count = 0,
  maxStars = 1400;

// Thanks @jackrugile for the performance tip! https://codepen.io/jackrugile/pen/BjBGoM
// Cache gradient
var canvas2 = document.createElement('canvas'),
    ctx2 = canvas2.getContext('2d');
    canvas2.width = 100;
    canvas2.height = 100;
var half = canvas2.width/2,
    gradient2 = ctx2.createRadialGradient(half, half, 0, half, half, half);
    gradient2.addColorStop(0.025, '#fff');
    gradient2.addColorStop(0.1, 'hsl(' + hue + ', 61%, 33%)');
    gradient2.addColorStop(0.25, 'hsl(' + hue + ', 64%, 6%)');
    gradient2.addColorStop(1, 'transparent');

    ctx2.fillStyle = gradient2;
    ctx2.beginPath();
    ctx2.arc(half, half, half, 0, Math.PI * 2);
    ctx2.fill();

// End cache

function random(min, max) {
  if (arguments.length < 2) {
    max = min;
    min = 0;
  }
  
  if (min > max) {
    var hold = max;
    max = min;
    min = hold;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function maxOrbit(x,y) {
  var max = Math.max(x,y),
      diameter = Math.round(Math.sqrt(max*max + max*max));
  return diameter/2;
}

var Star = function() {

  this.orbitRadius = random(maxOrbit(w,h));
  this.radius = random(60, this.orbitRadius) / 12;
  this.orbitX = w / 2;
  this.orbitY = h / 2;
  this.timePassed = random(0, maxStars);
  this.speed = random(this.orbitRadius) / 50000;
  this.alpha = random(2, 10) / 10;

  count++;
  stars[count] = this;
}

Star.prototype.draw = function() {
  var x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX,
      y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY,
      twinkle = random(10);

  if (twinkle === 1 && this.alpha > 0) {
    this.alpha -= 0.05;
  } else if (twinkle === 2 && this.alpha < 1) {
    this.alpha += 0.05;
  }

  ctx.globalAlpha = this.alpha;
    ctx.drawImage(canvas2, x - this.radius / 2, y - this.radius / 2, this.radius, this.radius);
  this.timePassed += this.speed;
}

for (var i = 0; i < maxStars; i++) {
  new Star();
}

function animation() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = 'hsla(' + hue + ', 64%, 6%, 1)';
    ctx.fillRect(0, 0, w, h)
  
  ctx.globalCompositeOperation = 'lighter';
  for (var i = 1, l = stars.length; i < l; i++) {
    stars[i].draw();
  };  
  
  window.requestAnimationFrame(animation);
}

animation();
            </script>
</div>


<style>
    .wrapper{    
      position: relative;
      max-width:1024px;
      padding:2rem 0rem;
      margin:auto;
      min-height:70vh;

        display: flex;
    }
    @keyframes grow{
        0%{transform:scale(1);}
        50%{transform:scale(0.9);}
        100%{transform:scale(1);}
    }
    .mint-image-wrapper{
        padding:1rem 0rem;
    }
    .mint-image-wrapper > img{
        overflow:hidden;border-radius: 1rem;        
        box-shadow: 0px 15px 60px -5px rgba(20, 24, 223, 0.32);
        animation:grow 5s linear infinite;
    }
    .mint-box{
        display:flex;flex-flow:column;
        justify-content: center;
        margin:auto;
    }
    button:hover > h2{
        color:black;
    }
    button:hover{
        background-color:white;
        padding:0.5rem 2rem;border:5px solid white;
    }
    button:hover h2 > img{
filter:invert(0);
    }
    button h2 > img{
filter:invert(1);
    }
    button{cursor:pointer;background-color:transparent;border-radius:1rem;border:5px solid white;padding:0.5rem 2rem;}
    .mint-button-wrapper{
        display:flex;flex-flow:row;justify-content: center;
    }
</style>
