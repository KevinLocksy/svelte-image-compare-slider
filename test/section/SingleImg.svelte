<script>
  import ImageCompareSlider from '../../src/ImageCompareSlider.svelte';
  export let height ="250px",
             imgFront_alt="Missing right img",
             imgBack_alt="Missing left img",
             imgFront_src=null,
             imgBack_src=null;

  const tableContent = [
    {"id":0,"element":"Slide","feature":"width","value":"/"},
    {"id":1,"element":"","feature":"color","value":"/"},
    {"id":2,"element":"Overlay","feature":"opacity","value":"/"},
    {"id":3,"element":"Handle","feature":"color","value":"/"},
    {"id":4,"element":"","feature":"size","value":"/"},
    {"id":5,"element":"","feature":"girth","value":"/"},
    {"id":6,"element":"","feature":"opacity","value":"/"}
  ]
</script>

<div id="singleImg-component">

  <h3>Single image</h3>
  <div class="container">
    <ImageCompareSlider 
      height={height}
      backSrc={imgBack_src}
      backAlt={imgBack_alt}
      frontSrc=""
      frontAlt={imgFront_alt} 
    />
  </div>
  <p>With <code>frontSrc="";</code> </p>

  <h3>Characterics</h3>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>Feature</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      {#each tableContent as {id, element, feature, value}}
        <tr>
          <td>{element}</td>
          <td>{feature}</td>
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
      &lt;/script&gt;
      &lt;div&gt;
        &lt;ImageCompareSlider 
          height="{height}"
          backSrc="path_BackgroundImg"
          backAlt="{imgBack_alt}"
          frontSrc="{imgFront_src}"
          frontAlt="{imgFront_alt}" 
        /&gt;
      &lt;/div&gt;
    </code>
  </pre>
</div>

<style>
</style>