<script>
  import {onMount} from 'svelte';

  export let height ="250px",
             rightAlt="Missing right img",
             leftAlt="Missing left img",
             rightSrc=null, leftSrc=null;
  //border's props
  export let slideColor = "red",
             slideWidth = "3";
  //overlay's props
  export let overlayOpacity = "1"; 
  //handle's props
  export let handleColor = "grey",
             handleSize = "20",
             handleGirth = "5",
             handleOpacity = "1";

  let img, overlay, handle, limitLeft, limitRight;
  let src, alt; //used if only one src is defined

  onMount(()=>{
    checkUniqueSrc(leftSrc,rightSrc);
    init();
  });

  function checkUniqueSrc(leftSrc,rightSrc){
    if(!leftSrc||!rightSrc){
      src= leftSrc ? leftSrc : rightSrc;
      return;
    }

    try {
      let right_img = new Image();
      let left_img = new Image();
      right_img.src = rightSrc;
      left_img.src = leftSrc;

      right_img.onerror= function(e){
        //this.onerror=null;
        src = leftSrc;
      };
      left_img.onerror= function(e){
        //this.onerror=null;
        src = rightSrc;
      };
    }catch (error){
      //this.onerror=null;
    }
  }

  function init(){
    if (!img) return;
    limitLeft=img.getBoundingClientRect().left;
    limitRight=img.getBoundingClientRect().right;
    const size = limitRight - limitLeft;
    const centerDiagonal = (handle.getBoundingClientRect().width)/2-Math.SQRT2*handleGirth; 
    overlay.style.width = size*0.5+"px"; //init overlay position
    handle.style.left = size*0.5-centerDiagonal+"px"; //init overlay position
  };
  
  function move(){
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
      const centerDiagonal = (handle.getBoundingClientRect().width)/2-Math.SQRT2*handleGirth;
      const x_shift = x_mouse - limitLeft;
      handle.style.left=x_shift-centerDiagonal+"px";
      overlay.style.width = x_shift+"px";
    }
    window.addEventListener("mousemove",moveSlider);
    window.addEventListener("mouseup",removeListener);
  }
</script>

<svelte:window on:resize={init} />

<div class='component' style='--height:{height};'>
  <div class='container'>
  {#if !src}
    <img bind:this={img} src={rightSrc} alt={rightAlt} on:load={init}/>
    <div bind:this={overlay} class='overlay' style="--slideColor:{slideColor};--slideWidth:{slideWidth}; --overlayOpacity:{overlayOpacity}">
      <img src={leftSrc} alt={leftAlt}/>
    </div>
    <div bind:this={handle} class='handle' on:mousedown={move} on:touchstart={move} style="--handleColor:{handleColor};--handleSize:{handleSize};--handleGirth:{handleGirth};--handleOpacity:{handleOpacity}" role='slider' aria-valuenow='0' tabindex='-1'></div>
  {:else}
    <img src={src} alt={alt} onerror="this.onerror=null;this.src=/error404.png"/>
  {/if}
  </div>
</div>

<style> 
  .component{
    position:relative;
    height:var(--height);
    width:100%;
    max-width:100%;
    user-select:none;
  }
  .container{
    display: flex;
    position:absolute;
    height:100%;
    align-items: center;
  }
  .overlay{
    position:absolute;
    overflow:hidden;
    height:100%;
    border-right: solid;
    border-right-width:calc(var(--slideWidth)* 1px);
    border-right-color:var(--slideColor);
    opacity: var(--overlayOpacity);
  }
  .handle{
    position: absolute;
    height:calc(var(--handleSize)*1px);
    width: calc(var(--handleSize)*1px);
    border: solid;
    border-width:calc(var(--handleGirth)*1px);
    border-radius: 3px;
    border-color:var(--handleColor);
    transform: rotate(-45deg);
    mask:radial-gradient(circle 10px at top right, #0000 100%,var(--handleColor)) top right,
          radial-gradient(circle 10px at bottom left, #0000 98%, var(--handleColor)) bottom left;
    mask-size: 50%;
    mask-repeat: no-repeat;
    opacity: var(--handleOpacity);
    cursor:grab;
  }
  img{
    position:absolute;
    height:100%;
  }
</style>