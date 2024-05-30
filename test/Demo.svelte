<svelte:head>
  <title>Demonstration Component Image Compare Slider</title>
</svelte:head>

<script>
  import Default from './section/Default.svelte';
  import Custom from './section/Custom.svelte';
  import SingleImg from './section/SingleImg.svelte';
  const imgBack_src = "https://www.w3schools.com/howto/img_forest.jpg";
  const imgBack_alt = "left";
  const imgFront_src = "https://www.w3schools.com/howto/img_snow.jpg";
  const imgFront_alt = "right";
  const height = "250px"; //does not work with %


</script>

<div id='demo-image-compare-slider'>
  <header>
    <h1>Image Comparison Slider</h1>
  </header>
  <main>
    <div id="demo-default">
      <Default imgBack_src='{imgBack_src}' imgFront_src='{imgFront_src}'/>
    </div>
    <div id="demo-custom">
      <Custom imgBack_src='{imgBack_src}' imgFront_src='{imgFront_src}'/>
    </div>
    <div id="demo-single-img">
      <SingleImg imgBack_src='{imgBack_src}' imgFront_src='{imgFront_src}'/>
    </div>
  </main>
  <footer>
    Developed by Kevin Locksy
  </footer>
</div>

<style>
  /**
  * Css var
  */
  #demo-image-compare-slider{
    --banner-min-height:5vh;
    --background-color-header:rgb(57, 57, 57);
    --background-color-footer:rgb(57, 57, 57);
    --background-color-column-odd:rgb(100, 100, 100);
  }
  /**
  * global features 
  */
  header,footer{
    min-height: var(--banner-min-height);
    min-width: 100%;
    position: sticky;
    position: -webkit-sticky;
    align-content: center;
    text-align: center;
    z-index: 9999;
  }
  /**
  * Structure 
  */
  header{
    top:0;
    background-color: var(--background-color-header);
  }
  main{
    min-height: calc(100vh - 2*var(--banner-min-height));
    padding: 1em;
    display:flex;
    &>*{
      flex:1;
      padding: 0 1.5em;
    }
    &>*:nth-child(odd){
      background-color: var(--background-color-column-odd);
    }
    background-color: var(--background-color-main);
  }
  footer{
    bottom: 0;
    background-color: var(--background-color-footer);
  }
  /**
  * Demo Sections
  */
</style>