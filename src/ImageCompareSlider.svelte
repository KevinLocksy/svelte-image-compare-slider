<script>
  import {onMount} from 'svelte';

  export let height, right_src, left_src, right_alt, left_alt;
  let img, overlay, limitLeft, limitRight, slide;
  let src; //used if only one src is defined

  onMount(()=>{
    limitLeft=img.getBoundingClientRect().left;
    limitRight=img.getBoundingClientRect().right;
    slide.style.left = (img.getBoundingClientRect().width*0.5)+"px";    //init slide position
    overlay.style.width = (img.getBoundingClientRect().width*0.5)+"px"; //init overlay position
    if (right_src.length===0 ||left_src.length===0){
      src = right_src.length===0 ? left_src : right_src;
    }
  });

  function move(e){
    let slider = e.target;

    function removeListener() {
      window.removeEventListener("mousemove",moveSlider);
      window.removeEventListener("mouseup",removeListener);
      window.removeEventListener("touchend",removeListener);
    }

    function moveSlider(mouse){
      let x_mouse = mouse.pageX;

      if (x_mouse <= limitLeft){
        x_mouse = limitLeft;
      } else if (x_mouse >= limitRight) {
        x_mouse = limitRight;
      }
      const x_shift = x_mouse - limitLeft;
      slider.style.left = x_shift+"px";
      overlay.style.width = x_shift+"px";
    }
    window.addEventListener("mousemove",moveSlider);
    window.addEventListener("mouseup",removeListener);
  }
</script>

<div class='container' style='--height:{height};'>
  <div id='box'>
  {#if !src}
    <img bind:this={img} class='left_img' src={left_src} alt={left_alt}/>
    <div bind:this={overlay} class='right_img' id='overlay'>
      <img src={right_src} alt={right_alt}/>
    </div>
    <div bind:this={slide} class='slide' on:mousedown={move} on:touchstart={move}>
    </div>
  {:else}
    <img src={src} alt={left_alt}/>
  {/if}
  </div>
</div>

<style>
  .container {
    position:relative;
    height:var(--height);
    max-width:100%;
    user-select:none;
  }
  #box{
    position:absolute;
    height:100%;
    width:100%;
  }
  #box > * {
    height:100%;
  }
  .left_img{
    position:absolute;
  }
  .right_img{
    position:absolute;
    overflow:hidden;
  }
  .slide{
    position:absolute;
    top:0;
    left:50%;
    width:3px;
    background-color:white;
    cursor:grab;
  }
  img{
    height:100%;
  }
</style>