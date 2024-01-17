# svelte-image-compare-slider
Svelte component to compare two images with a slider.

## Features
- Simple to use
- Displays a tag `img` if one of the defined sources is empty.

## Usage
#### API - props
| Name        | Type     | Explanation                                        | Required                 | Default | Example        |
|-------------|----------|----------------------------------------------------|--------------------------|---------|----------------|
| `height`    | `string` | Component's height (thus the images) with its unit | :x:                      |  250px  | 50px / 10em    |
| `left_src`  | `string` | Path of the image on the left. Can be empty.       | :white_check_mark: / :x: |         | /img/left.jpg  |
| `left_alt`  | `string` | Alt of the image on the left                       | :x:                      |         | left           |
| `right_src` | `string` | Path of the image on the right. Can be empty       | :white_check_mark: / :x: |         | /img/right.jpg |
| `right_alt` | `string` | Alt of the image on the right                      | :x:                      |         | right          |

#### Code Snippet
```html
import ImageCompareSlider from 'path/to/svelte-image-compare-slider.svelte' // with the extension
// or import {ImageCompareSlider} from 'path/to/svelte-image-compare-slider' // ? maybe for uploaded pkg 

<script>
  const height = "250px"; //does not work with %
  const imgLeft_src = ""; 
  const imgLeft_alt = "left"; 
  const imgRight_src = "";
  const imgRight_alt = "right";
</script> 

<!-- displays the image comparison -->
<ImageCompareSlider height={height}
                    left_src={imgLeft_src}
                    left_alt={imgLeft_alt}
                    right_src={imgRight_src}
                    right_alt={imgRight_alt} />

<!-- displays the single image defined -->
<ImageCompareSlider height={height}
                    left_src=""
                    left_alt={imgLeft_alt}
                    right_src={imgRight_src}
                    right_alt={imgRight_alt} />

<ImageCompareSlider height={height}
                    left_src={imgLeft_src}
                    left_alt={imgLeft_alt}
                    right_src=""
                    right_alt={imgRight_alt} />
```

## Demo

#### App

- Install the necessary dependencies for creating the app: https://typeofnan.dev/how-to-set-up-a-svelte-app-with-rollup/
  - npm i -D rollup-plugin-svelte > import svelte from 'rollup-plugin-svelte'; 
  - npm i -D @rollup/plugin-node-resolve > import resolve from '@rollup/plugin-node-resolve';
  - npm i -D rollup-plugin-postcss > import postcss from "rollup-plugin-postcss";
- Create your demo application: demo.js / Demo.svelte
- Define the location of the Demo App to bundle for rollup in `rollup.config.mjs > export default {input:'...........'}`
- Define the entry point for the browser in the `public` folder
- Run your application: `(npm run dev) -and (npm run start)`

```js
demo.js

import Demo from './Demo.svelte';
  const demo = new Demo({
    target: document.body,
  });
export default demo;
```

```svelte
Demo.svelte

<script>
  import ImageCompareSlider from '../src/ImageCompareSlider.svelte'
    const height = "250px"; //does not work with %
    const imgLeft_src = "https://www.w3schools.com/howto/img_forest.jpg";
    const imgLeft_alt = "left";
    const imgRight_src = "https://www.w3schools.com/howto/img_snow.jpg";
    const imgRight_alt = "right";
</script>

<div id="container">
  <h1>Image Slider comparison</h1>
  <ImageCompareSlider height={height}
                    left_src={imgLeft_src}
                    left_alt={imgLeft_alt}
                    right_src={imgRight_src}
                    right_alt={imgRight_alt} />
</div>
```

```html
public/index.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Svelte App</title>
  <script defer src="build/bundle.js"></script>
</head>
<body></body>
</html>
```

#### Environment

| Name     | | Explanation                                        | Required                 | Default | Example        |
|----------|-|----------------------------------------------------|--------------------------|---------|----------------|
| `rollup` | | Component's height (thus the images) with its unit | :x:                      |         | 50px / 10em    |
| `@rollup/plugin-node-resolve` | | Used to help rollup resolve third-party plugins | :x:                      |         | 50px / 10em    |
| `rollup-plugin-svelte` | | Third-party plugin that helps rollup understand how to process Svelte apps | :x:                      |         | 50px / 10em    |
| `rollup-plugin-postcss` | | Third-party plugin that helps rollup understand how to CSS apps | :x:                      |         | 50px / 10em    |
| `rollup` | | Component's height (thus the images) with its unit | /                      |         | 50px / 10em    |

if necessary, in `rollup.config.mjs`, add : import * as child from 'child_process';
if necessary, add in package.json `type:'module'` and the extension .mjs for the file `rollup.config.js`

//put img

> [!NOTE]
> Reminder: displays a `img` if one of the sources is empty

####

## Todo
- Priority
  - [ ] fix slider use when change window's dimensions : due to onmount?
  - [ ] pkg component
  - [ ] clean the limits of the box
  - [ ] check necessity of onMount
  - [ ] check necessity of the various tags' positions
  - [ ] check necessity of the various bindings
  - [ ] rename tags' classes
  - [ ] make it responsive if it is a flex element 
  - [ ] add default values for props
  - [ ] add demo

- Features
  - [ ] add a handle
  - [ ] add crop images
  - [ ] add prop to change slider characteristics

© [KevinLocksy](https://github.com/KevinLocksy)