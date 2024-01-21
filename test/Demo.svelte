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
      <div class="snippet">
        <pre>
          <code class="language-html">
  &lt;script&gt;
    import ImageCompareSlider from '../src/ImageCompareSlider.svelte'
  &lt;/script&gt;
  &lt;div&gt;
    &lt;ImageCompareSlider height="{height}"
                        leftSrc="{imgLeft_src}"
                        leftAlt="{imgLeft_alt}"
                        rightSrc="{imgRight_src}"
                        rightAlt="{imgRight_alt}" /&gt;
  &lt;/div&gt;
          </code>
        </pre>
      </div>
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
      <h3>Custom slider</h3>
      <div class="characteristics">
        <ul type="o">
          <li>
            Slide's width<input type="range" name="slideWidth" min="0" max="100" bind:value={slideWidth}>
          </li>
          <li>
            <div role="slider" aria-valuemin="0" aria-valuemax="360" aria-valuenow={slideColor} tabindex="0">Slide's color
              <div name="slideColor"></div>
            </div>
          </li>
          <li>
            <label>Overlay's opacity<input type="range" name="overlayOpacity" min="0" max="1" step="0.01" bind:value={overlayOpacity}></label>
          </li>
          <li>
            <div role="slider" aria-valuemin="0" aria-valuemax="360" aria-valuenow={handleColor} tabindex="0">Handle's color
              <div name="handleColor"></div>
            </div>
          </li>
          <li>
            <label>Handle's size<input type="range" name="handleSize" min="0" max="100" bind:value={handleSize}></label>
          </li>
          <li>
            <label>Handle's girth<input type="range" name="handleGirth" min="0" max="100" bind:value={handleGirth}></label>
          </li>
          <li>
            <label>Handle's opacity<input type="range" name="handleOpacity" min="0" max="1" step="0.01" bind:value={handleOpacity}></label>
          </li>
        </ul>
      </div>
      <div class="snippet">
        <pre>
          <code class="language-html">
  &lt;script&gt;
    import ImageCompareSlider from '../src/ImageCompareSlider.svelte'
  //border's props
    let slideColor="white", slideWidth={slideWidth};
    //overlay's props
    let overlayOpacity={overlayOpacity};
    //handle's props
    let handleColor="white",handleSize={handleSize},handleGirth={handleGirth},handleOpacity={handleOpacity};
  &lt;/script&gt;
  &lt;div&gt;
    &lt;ImageCompareSlider height="{height}"
                        leftSrc="{imgLeft_src}"
                        leftAlt="{imgLeft_alt}"
                        rightSrc="{imgRight_src}"
                        rightAlt="{imgRight_alt}"
                        slideWidth="&lcub;slideWidth&rcub;"
                        slideColor="&lcub;slideColor&rcub;"
                        overlayOpacity="&lcub;overlayOpacity&rcub;"
                        handleSize="&lcub;handleSize&rcub;"
                        handleGirth="&lcub;handleGirth&rcub;"
                        handleOpacity="&lcub;handleOpacity&rcub;"/&gt;
  &lt;/div&gt;
          </code>
        </pre>
      </div>
    </div>
    <div id="singleImg">
      <ImageCompareSlider height={height}
                        leftSrc=""
                        leftAlt={imgLeft_alt}
                        rightSrc={imgRight_src}
                        rightAlt={imgRight_alt} />
      <h3>Single image</h3>
      <div>
        <ul type="o">
          <li>
            Left image's source: ""
          </li>
        </ul>
      </div>
      <div class="snippet">
        <pre>
          <code class="language-html">
  &lt;script&gt;
    import ImageCompareSlider from '../src/ImageCompareSlider.svelte'
  &lt;/script&gt;
  &lt;div&gt;
    &lt;ImageCompareSlider height="{height}"
                        leftSrc=""
                        leftAlt="{imgLeft_alt}"
                        rightSrc="{imgRight_src}"
                        rightAlt="{imgRight_alt}" /&gt;
  &lt;/div&gt;
          </code>
        </pre>
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
    grid-template-columns:4fr 4fr 4fr;
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
  .snippet{
    display:flex;
    height: min-content;
    width: fit-content;
    background-color: lightgrey;
  }
</style>