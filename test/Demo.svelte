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
</script>

<div id="container">
  <div>
    <h1>Image Comparison Slider </h1>
  </div>
  <div id="test">
  <ImageCompareSlider height={height}
                    leftSrc={imgLeft_src}
                    leftAlt={imgLeft_alt}
                    rightSrc={imgRight_src}
                    rightAlt={imgRight_alt} />
  </div>
  <div id='footer'>
    Developed by Kevin Locksy
  </div>
</div>

<style>
  #test{
    position: relative;
    display: flex;
  }
  #container{
    display: flex;
    flex-direction: column;
    height: 100%;
/*    text-align:center;*/
  }
  #container > *{
    justify-content: center;
  }

  #footer{
    display: flex;
    position: fixed;
    bottom: 0%;
    width:100%;
    background-color: blue;
  }
</style>