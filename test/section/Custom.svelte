<script>
  import ImageCompareSlider from '../../src/ImageCompareSlider.svelte';
  export let height ="250px",
             imgFront_alt="Missing right img",
             imgBack_alt="Missing left img",
             imgFront_src=null,
             imgBack_src=null;
  //border's props
  let slideColor, slideWidth=5;
  //overlay's props
  let overlayOpacity=1;
  //handle's props
  let handleColor,handleSize=20,handleGirth=5,handleOpacity=1;

  $: tableContent = [
    {"id":0,"element":"Slide","feature":"width","value":slideWidth},
    {"id":1,"element":"","feature":"color","value":slideColor},
    {"id":2,"element":"Overlay","feature":"opacity","value":overlayOpacity},
    {"id":3,"element":"Handle","feature":"color","value":handleColor},
    {"id":4,"element":"","feature":"size","value":handleSize},
    {"id":5,"element":"","feature":"girth","value":handleGirth},
    {"id":6,"element":"","feature":"opacity","value":handleOpacity}
  ]
</script>

<div id="custom-component" class='demo'>

  <h2>Custom demo</h2>
  <div class="container">
    <ImageCompareSlider 
        height={height}
        backSrc={imgBack_src}
        backAlt={imgBack_alt}
        frontSrc={imgFront_src}
        frontAlt={imgFront_alt}
        slideWidth={slideWidth}
        slideColor={slideColor}
        overlayOpacity={overlayOpacity}
        handleSize={handleSize}
        handleGirth={handleGirth}
        handleOpacity={handleOpacity}
    />
  </div>

  <h3>Custom characterics</h3>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>Feature</th>
        <th>Slider</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      {#each tableContent as {id,element, feature, value}}
        <tr>
          <td>{element}</td>
          <td>{feature}</td>
          <td>
          {#if (id == 0)}
            <input type="range" name="slideWidth" min="0" max="100" bind:value={slideWidth}>
          {:else if (id == 1)}
            <div name="slideColor" role="slider" aria-valuemin="0" aria-valuemax="360" aria-valuenow={slideColor} tabindex="0"></div>
          {:else if (id == 2)}
            <input type="range" name="overlayOpacity" min="0" max="1" step="0.01" bind:value={overlayOpacity}>
          {:else if (id == 3)}
            <div name="slideColor" role="slider" aria-valuemin="0" aria-valuemax="360" aria-valuenow={handleColor} tabindex="0"></div>
          {:else if (id == 4)}
            <input type="range" name="handleSize" min="0" max="100" bind:value={handleSize}>
          {:else if (id == 5)}
            <input type="range" name="handleGirth" min="0" max="100" bind:value={handleGirth}>
          {:else if (id == 6)}
            <input type="range" name="handleOpacity" min="0" max="1" step="0.01" bind:value={handleOpacity}>
          {/if}
          </td>
          <td>{value}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <h3>Snippet code</h3>
  <pre class="snippet">
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
  &lt;ImageCompareSlider  
    height="{height}"
    backSrc="path_BackgroundImg"
    backAlt="{imgBack_alt}"
    frontSrc="path_foregroundImg"
    frontAlt="{imgFront_alt}"
    slideWidth="&lcub;slideWidth&rcub;"
    slideColor="&lcub;slideColor&rcub;"
    overlayOpacity="&lcub;overlayOpacity&rcub;"
    handleSize="&lcub;handleSize&rcub;"
    handleGirth="&lcub;handleGirth&rcub;"
    handleOpacity="&lcub;handleOpacity&rcub;"
  /&gt;
&lt;/div&gt;
    </code>
  </pre>
</div>

<style>
  @import url(styles.css);

  div[name=slideColor]{
    height:8px;
    width: 200px;
    background: linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%));
    border-radius: 20px;
  }
</style>