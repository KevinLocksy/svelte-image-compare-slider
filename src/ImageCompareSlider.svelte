<script>
  export let height ="250px",
             frontAlt="Missing foreground img",
             backAlt="Missing background img",
             frontSrc=null, 
             backSrc=null;
  export let slideColor = "white",
             slideWidth = "3";
  export let overlayOpacity = "1"; 
  export let handleColor = "white",
             handleSize = "20",
             handleGirth = "3",
             handleOpacity = "1";

  let img, overlay, handle, limitBack, limitfront;
  let src, alt; //used if only one src is defined

  function init(){
    checkUniqueSrc(backSrc,frontSrc);
  }

  function checkUniqueSrc(backSrc,frontSrc){
    if(!backSrc||!frontSrc){
      src= backSrc ? backSrc : frontSrc;
      return;
    }

    try {
      front_img.src = frontSrc;
      back_img.src = backSrc;
      
      front_img.onerror= function(e){
        //this.onerror=null;
        src = backSrc;
      };
      back_img.onerror= function(e){
        //this.onerror=null;
        src = frontSrc;
      };
    }catch (error){
      //this.onerror=null;
    }
  }

  function setHandlePosition(){
    if (!img) return;
    limitBack=img.getBoundingClientRect().left;
    limitfront=img.getBoundingClientRect().right;
    const size = limitfront - limitBack;
    const centerDiagonal = (handle.getBoundingClientRect().width)/2-Math.SQRT2*handleGirth; 
    overlay.style.width = size*0.5+"px"; //init overlay position
    handle.style.left = size*0.5-centerDiagonal+"px"; //init overlay position
    handle.style.top = "50%"; //init overlay position
  };
  
  function move(){
    if (!img) return;
    limitBack=img.getBoundingClientRect().left;
    limitfront=img.getBoundingClientRect().right;

    window.addEventListener("touchmove",moveSlider);
    window.addEventListener("mousemove",moveSlider);

    function moveSlider(e){
      let x = (e.type==="touchmove" ? e.touches[0] : e).pageX;
      if (x <= limitBack){
        x = limitBack;
      } else if (x >= limitfront) {
        x = limitfront;
      }
      const centerDiagonal = (handle.getBoundingClientRect().width)/2-Math.SQRT2*handleGirth;
      const x_shift = x - limitBack;
      handle.style.left=x_shift-centerDiagonal+"px";
      overlay.style.width = x_shift+"px";
    }

    /**
     * Remove listeners
    */
    window.addEventListener("touchend",removeListener);
    window.addEventListener("mouseup",removeListener);

    function removeListener() {
      window.removeEventListener("touchmove",moveSlider);
      window.removeEventListener("mousemove",moveSlider);
      window.removeEventListener("touchend",removeListener);
      window.removeEventListener("mouseup",removeListener);
    }

  }//end move()
</script>

<svelte:window on:resize={setHandlePosition} />

<div name='image-compare-slider' class='component' use:init style='--height:{height};'>
  {#if !src}
    <img class='background-img' bind:this={img} src={backSrc} alt={backAlt} on:load={setHandlePosition}/>
    <div bind:this={overlay} class='overlay' style="--slideColor:{slideColor};--slideWidth:{slideWidth}; --overlayOpacity:{overlayOpacity}">
      <img class='foreground-img' src={frontSrc} alt={frontAlt}/>
    </div>
    <!--to have the handle in front of the images to compare-->
    <div bind:this={handle} class='handle' on:mousedown={move} on:touchstart={move} style="--handleColor:{handleColor};--handleSize:{handleSize};--handleGirth:{handleGirth};--handleOpacity:{handleOpacity}" role='slider' aria-valuenow='0' tabindex='-1'></div>
  {:else}
    <img class='unique-img' src={src} alt={alt} onerror="this.onerror=null;this.src=/error404.png"/>
  {/if}
</div>

<style> 
  .component[name=image-compare-slider]{
    position:relative;
    max-height:var(--height);
    width:fit-content;
    user-select:none;/* avoid img selection (blue overlay)*/
    touch-action: none;
  }
  img{
    max-height:var(--height);
    max-width:80vw;
  }
  img.background-img{
    position:relative;
  }
  .overlay{
    position:absolute;
    top:0;
    left:0;
    height:inherit;
    overflow:hidden;
    box-sizing: border-box;
    box-shadow: calc(var(--slideWidth)/2* 1px) 0px 0px var(--slideColor);
    border-right: solid;
    border-right-width:calc(var(--slideWidth)/2* 1px);
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
</style>