<script>
  import ImageCompareSlider from '../../src/ImageCompareSlider.svelte';

  export let height ="250px",
             imgFront_alt="Missing right img",
             imgBack_alt="Missing left img",
             imgFront_src=null,
             imgBack_src=null;
  const tableContent = [
    {"id":0,"element":"Slide","feature":"width","value":3},
    {"id":1,"element":"","feature":"color","value":"white"},
    {"id":2,"element":"Overlay","feature":"opacity","value":1},
    {"id":3,"element":"Handle","feature":"color","value":"white"},
    {"id":4,"element":"","feature":"size","value":20},
    {"id":5,"element":"","feature":"girth","value":3},
    {"id":6,"element":"","feature":"opacity","value":1}
  ]
</script>

<div id='default-component' class='demo'>

  <h2>Default demo</h2>
  <div class="container">
    <ImageCompareSlider height={height}
    backSrc={imgBack_src}
    backAlt={imgBack_alt}
    frontSrc={imgFront_src}
    frontAlt={imgFront_alt} />
  </div>

  <h3>Default values</h3>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>Feature</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      {#each tableContent as {element, feature, value}}
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
    frontSrc="path_BackgroundImg"
    frontAlt="{imgFront_alt}"
  /&gt;
&lt;/div&gt;
    </code>
  </pre>
</div>

<style>
  @import url(style.css);
</style>
