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

<div id="singleImg-component" class='demo'>

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

  <h3>Custom slider</h3>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>Feature</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      {#each tableContent as {id,element, feature, value}}
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
          backSrc="{imgBack_src}"
          backAlt="{imgBack_alt}"
          frontSrc=""
          frontAlt="{imgFront_alt}" 
        /&gt;
      &lt;/div&gt;
    </code>
  </pre>
</div>

<style>
  .demo{
    --table-header-background-color:#a6a6a6;
    --table-row-odd-background-color:#c1c1c1;
    --table-row-even-background-color:#dddddd;
  }
  /**
  * Component position
  */
  .container{
    position: relative;
    width: fit-content;
    left: 12.5%;
  }
  /**
  * Table
  */
  table{
    margin: 1em auto;
  }
  td, th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
    min-width: 120px;
  }
  th {
    background-color: var(--table-header-background-color);
  }
  tr{
    background-color: var(--table-row-odd-background-color);
    &:nth-child(even) {
      background-color: var(--table-row-even-background-color);
    }
  }
  /**
  * Snippet code
  */
  .snippet{
    display:flex;
    justify-content: center;
    height: min-content;
    width: 100%;
  }
  code{
    background-color: lightgrey;
    border: solid 1px grey;
  }
</style>