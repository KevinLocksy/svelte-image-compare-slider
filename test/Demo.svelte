<svelte:head>
  <title>Demonstration Svelte Component Image Compare Slider</title>
  <link rel="icon" href="favicon-rounded.logo.png" />
</svelte:head>

<script>
  import Default from './section/Default.svelte';
  import Custom from './section/Custom.svelte';
  import SingleImg from './section/SingleImg.svelte';
  const imgBack_src = "pic-r169.jpg";
  const imgBack_alt = "left";
  const imgFront_src = "draw-r169.jpg";
  const imgFront_alt = "right";
  const height = "250px"; //does not work with %
</script>

<div id='demo-image-compare-slider'>
  <header>
    <h1>Image Comparison Slider</h1>
  </header>
  <div id='standfirst'>
    <p>©KevinLocksy. All rights reserved. Images, videos, writings, and all other creative content are protected and may not be used without expressed permission from the artist</p>
  </div>
  <main>
    <div id="demo-default" class='demo'>
      <Default imgBack_src='{imgBack_src}' imgFront_src='{imgFront_src}'/>
    </div>
    <div id="demo-custom" class='demo'>
      <Custom imgBack_src='{imgBack_src}' imgFront_src='{imgFront_src}'/>
    </div>
    <div id="demo-single-img" class='demo'>
      <SingleImg imgBack_src='{imgBack_src}' imgFront_src=''/>
    </div>
  </main>
  <footer>
    <p>
      Developed by Kevin Locksy
    </p> 
    <p>©KevinLocksy. All rights reserved. Images, videos, writings, and all other creative content are protected and may not be used without expressed permission from the artist</p>
  </footer>
</div>

<style>
  @import url(section/styles.css);
  /**
  * Css var
  */
  #demo-image-compare-slider{
    --background-color-header:#111212;
    --background-color-footer:#111212;
    --background-color-column-odd:#1f2229;
    --shadow-box-primary:#191b1f;
  }
  /**
  * global features 
  */
  header,footer{
    position: sticky;
    position: -webkit-sticky;
    align-content: center;
    text-align: center;
    padding:1em;
    box-shadow: 0px 1px 5px var(--shadow-box-primary);
    z-index: 9999;
  }
  /**
  * Structure 
  */
  header{
    top:0;
    background-color: var(--background-color-header);
    min-height: 5vh;
  }
  #standfirst{
    text-align: center;
    padding: 1em;
  }
  main{
    min-height: calc(100vh - 2*var(--banner-min-height));
    display:flex;
    flex-wrap:wrap;
    justify-content: center;
    &>*{
      flex:1;
    }
    &>*:nth-child(odd){
      background-color: var(--background-color-column-odd);
    }
    background-color: var(--background-color-main);
  }
  footer{
    bottom: 0;
    background-color: var(--background-color-footer);
    min-height: 5vh;
    max-height: 10em;
    padding: 0.25em 1em;
  }
  /**
  * Demo Sections
  */
</style>