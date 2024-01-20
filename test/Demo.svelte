<svelte:head>
  <title>Demonstration Component Image Compare Slider</title>
</svelte:head>

<script>
//import {ImageCompareSlider} from '../src/ImageCompareSlider'
import ImageCompareSlider from '../src/ImageCompareSlider.svelte'
  const height = "250px"; //does not work with %
  const imgLeft_src = "https://www.w3schools.com/howto/img_forest.jpg";
  const imgLeft_alt = "left";
  const imgRight_src = "https://www.w3schools.com/howto/img_snow.jpg";
  const imgRight_alt = "right";
  //border's props
  let slideColor, slideWidth=5;
  //overlay's props
  let overlayOpacity=1;
  //handle's props
  let handleColor,handleSize=20,handleGirth=5,handleOpacity=1;

</script>

<div id="container">
  <div id="header">
    <h1>Image Comparison Slider</h1>
  </div>
  <div id="demo">
    <div id="default">
      <ImageCompareSlider height={height}
                        leftSrc={imgLeft_src}
                        leftAlt={imgLeft_alt}
                        rightSrc={imgRight_src}
                        rightAlt={imgRight_alt} />
      <h3>Default values</h3>
      <ul type="o">
        <li>Slide's width: 3</li>
        <li>Slide's color: white</li>
        <li>Overlay's opacity: 1</li>
        <li>Handle's color: white</li>
        <li>Handle's size: 20</li>
        <li>Handle's girth: 3</li>
        <li>Handle's opacity: 1</li>
      </ul>
    </div>
    <div id="custom">
      <ImageCompareSlider height={height}
                        leftSrc={imgLeft_src}
                        leftAlt={imgLeft_alt}
                        rightSrc={imgRight_src}
                        rightAlt={imgRight_alt}
                        slideWidth={slideWidth}
                        slideColor={slideColor}
                        overlayOpacity={overlayOpacity}
                        handleSize={handleSize}
                        handleGirth={handleGirth}
                        handleOpacity={handleOpacity}
                         />
      <div class="characteristics">
        <label>Slide's width<input type="range" name="slideWidth" min="0" max="100" bind:value={slideWidth}></label>
        <div role="slider" aria-valuemin="0" aria-valuemax="360" aria-valuenow={slideColor} tabindex="0">Slide's color
          <div name="slideColor"></div>
        </div>
        <label>Overlay's opacity<input type="range" name="overlayOpacity" min="0" max="1" step="0.01" bind:value={overlayOpacity}></label>
        <div role="slider" aria-valuemin="0" aria-valuemax="360" aria-valuenow={handleColor} tabindex="0">Handle's color
          <div name="handleColor"></div>
        </div>
        <label>Handle's size<input type="range" name="handleSize" min="0" max="100" bind:value={handleSize}></label>
        <label>Handle's girth<input type="range" name="handleGirth" min="0" max="100" bind:value={handleGirth}></label>
        <label>Handle's opacity<input type="range" name="handleOpacity" min="0" max="1" step="0.01" bind:value={handleOpacity}></label>
      </div>
    </div>
  </div>
  <div id='footer'>
    Developed by Kevin Locksy
  </div>
</div>

<style>
  #container{
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    justify-content: center;
    /*    text-align:center;*/
  }
  #header{
    height: 10%;
    text-align:center;
  }
  #demo{
    display:grid;
    grid-template-columns:4fr 1fr 4fr 1fr;
    position: relative;
  }
  #custom{
    display: inline-block;
  }
  div[name=slideColor]{
    height:8px;
    width: 200px;
    background: linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%));
    border-radius: 20px;
  }
  #footer{
    display: inline;
    position: fixed;
    height: 10%;
    width: 100%;
    text-align:center;
    vertical-align: middle;
    bottom: 0%;
  }
</style>