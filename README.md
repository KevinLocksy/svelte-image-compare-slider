# svelte-image-compare-slider
Svelte component to compare two images with a slider.

## Features
- Simple to use
- Displays a tag `img` if one of the defined sources is empty.
- Possibility to define the opacity of the overlaid image (the left one)
- Possibility to define the handle's characterics: size, girth, color, opacity
- Possibility to define the slider's characterics: width, color

## Usage
#### API - props
| Name            | Type    | Explanation                                        | Required                 | Default          | Example        |
|-----------------|---------|----------------------------------------------------|--------------------------|------------------|----------------|
| `height`        | `string`| Component's height (thus the images) with its unit | :white_check_mark:       |  250px           | 50px / 10em    |
| `leftSrc`       | `string`| Path of the image on the left. Can be empty        | :white_check_mark: / :x: | /                | /img/left.jpg  |
| `leftAlt`       | `string`| Alt of the image on the left                       | :white_check_mark:       | Missing left img | left           |
| `rightSrc`      | `string`| Path of the image on the right. Can be empty       | :white_check_mark: / :x: | /                | /img/right.jpg |
| `rightAlt`      | `string`| Alt of the image on the right                      | :white_check_mark:       | Missing right img| right          |
| `slideColor`    | `string`| Slide's color                                      |                          |                  | white          |
| `slideWidth`    | `int`   | Slide's width in px                                |                          | 3                | 5              |
| `overlayOpacity`| `int`   | Overlaid image's opacity. 0$\leqslant$opacity$\leqslant$1|                    | 1                | 0.5            |
| `handleColor`   | `string`| Handle's color                                     |                          |                  | white          |
| `handleSize`    | `int`   | Handle's size in px                                |                          | 20               | 10             |
| `handleGirth`   | `int`   | Handle's girth in px                               |                          | 5                | 5              |
| `handleOpacity` | `int`   | Handle's opacity. 0$\leqslant$opacity$\leqslant$1  |                          | 1                | 0.8            |

#### Code Snippet
```html
import ImageCompareSlider from 'path/to/svelte-image-compare-slider.svelte' // with the extension
// or import {ImageCompareSlider} from 'path/to/svelte-image-compare-slider' // ? maybe for uploaded pkg 

<script>
  const height = "250px"; //does not work with %
  const imgLeft_src = "path_left_img"; 
  const imgLeft_alt = "Left img missing"; 
  const imgRight_src = "path_right_img";
  const imgRight_alt = "Right img missing";
</script> 

<!-- displays the image comparison -->
<ImageCompareSlider height={height}
                    leftSrc={imgLeft_src}
                    leftAlt={imgLeft_alt}
                    rightSrc={imgRight_src}
                    rightAlt={imgRight_alt} />

<!-- displays a single image -->
<ImageCompareSlider height={height}
                    leftSrc=""
                    leftAlt={imgLeft_alt}
                    rightSrc={imgRight_src}
                    rightAlt={imgRight_alt} />

<ImageCompareSlider height={height}
                    leftSrc={imgLeft_src}
                    leftAlt={imgLeft_alt}
                    rightSrc=""
                    rightAlt={imgRight_alt} />
```
//put img

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
                    leftSrc={imgLeft_src}
                    leftAlt={imgLeft_alt}
                    rightSrc={imgRight_src}
                    rightAlt={imgRight_alt} />
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

> [!NOTE]
> Reminder: displays a `img` if one of the sources is empty

#### Environment

| Name                        | Explanation                                                                | Required          | 
|-----------------------------|----------------------------------------------------------------------------|-------------------|
|`rollup`                     | Bundler                                                                    | :white_check_mark:|
|`@rollup/plugin-node-resolve`| Used to help rollup resolve third-party plugins                            | :white_check_mark:|
|`rollup-plugin-svelte`       | Third-party plugin for rollup to understand how to process Svelte component| :white_check_mark:|
|`rollup-plugin-postcss`      | Third-party plugin for rollup to understand how to process CSS             | if code has CSS   |

if necessary, in `rollup.config.mjs`, add : import * as child from 'child_process';
if necessary, add in package.json `type:'module'` and the extension .mjs for the file `rollup.config.js`

## Roadmap
- Priority
  - [ ] fix issue when the container containing the compo has style attribute `text-align:center;`
  ```html
    <div style="text-align: center;">
  <ImageCompareSlider height={height}
                    leftSrc={imgLeft_src}
                    leftAlt={imgLeft_alt}
                    rightSrc={imgRight_src}
                    rightAlt={imgRight_alt} />
  </div>
  ```
  - [ ] add demo
  - [ ] Upload component to npm
  - [ ] make it responsive if it is a flex element 
  - [x] ~fix slider use when change window's dimensions : due to onmount? Yes~
  - [x] ~clean the limits of the box~
  - [x] ~check necessity of onMount~
  - [x] ~check necessity of the various tags' positions~
  - [x] ~check necessity of the various bindings~
  - [x] ~rename tags' classes~
  - [x] ~add default values for props~

- Features
  - [ ] add crop images
  - [x] ~add a handle~
  - [x] ~add prop to change slider characteristics~

© [KevinLocksy](https://github.com/KevinLocksy)