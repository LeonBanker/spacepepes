<script>
    import { Router, Route, Link } from "svelte-routing";
    import Home from "./pages/Home.svelte";
    import Mint from "./pages/Mint.svelte";
    import About from "./pages/About.svelte";
    import Four from "./pages/Four.svelte";
    import MyPepes from "./pages/MyPepes.svelte"
    export let url = '';
    import { setContext } from 'svelte';
    import { writable } from 'svelte/store';
    import { fade } from 'svelte/transition';
    
    const app = writable({});
    //export const innerHeight = writable(1000)
    //export const innerWidth = writable(1000) Any use for these
    setContext('app', app);
    console.log(window.location.href);
</script>

<div class="main">
	<header>
        <div class="nav-row">
          <div class="icon-box">
          </div>
          <div class="nav-links">
            <a target="_blank" href="https://twitter.com/spacepepes"><img width="64px" style="filter:invert(1);" src="/imgs/twitter.png" alt="">
            </a>
            <a target="_blank" href="https://discord.gg/5WrhVV5vJA"><img width="64px" style="filter:invert(1);" src="/imgs/discord.png" alt="">
                </a>
          </div>
        </div>
      </header>
      <footer style="">
          <a href="/"><h1 class="pepebottom">SPACEPEPES</h1></a>
          <p style="margin:auto;margin-top:-1rem;">CURRENT CHAIN: BINANCE</p>
        <a href="https://spacepepes.com"><h3 style="text-align:center;">SELECT DIFFERENT CHAIN</h3></a>
      </footer>
    <Router url="{url}">
        
        <Link style="top:0px;left:opx;position:absolute;z-index:6;" to="/mint">
            <button style="margin: 2.5rem;"><p style="margin:unset;">MINT</p></button></Link>
        <Route path="/"><Home /></Route>
        <Route path="/mint" component={Mint}><Mint /></Route>
        <Route path="/mint"><Mint /></Route>
        <Route path="/about" component={About}><About /></Route>
        <Route path="/mypepes" component={MyPepes}></Route>
        <Route path="/*"><Four /></Route>

    </Router>

    <script type="text/javascript" src="/script.js"></script>
    <footer style="">
    </footer>
</div>
<style>
	.main {
		text-align: center;
		padding: 0rem;
		margin: 0 auto;
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
  height: 100vh;
    display: flex;
}
.pepebottom{color: rgb(188, 255, 1);
    margin:2rem auto;
    width:100vw;text-align:center;font-size:5rem;
}
header{z-index:5;position:relative;}
@media only screen and (max-width: 900px) {
    .pepebottom{width:100vw;text-align:center;font-size:3rem;}
}
footer{margin-top: -50px;position:relative;bottom:0px;left:0px;width:100vw;height:auto;z-index: 200;}
footer a > h3{width:100vw;text-align:center;}
.nav-links{display:flex;flex-flow:row;justify-content:space-around;}
.nav-links > a{margin:1rem;transition:transform 0.2s ease;}
.icon-box > a{margin:1rem;transition:transform 0.2s ease;}
.nav-links > a:hover{transform:scale(1.1);}
.icon-box > a:hover{transform:scale(1.1);}
.mint{
    transition: transform 0.2s ease;
}
.mint:hover{transform:scale(1.1);}
</style>