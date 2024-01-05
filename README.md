# svelte-image-compare-slider

Svelte component to compare two images with a slider.

## Features
___

- Simple to use
- Displays a tag `img` if one of the defined sources is empty.

## Usage
___ 
#### API - props
| Name        | Type     | Explanation                                        | Required                 | Default | Example        |
|-------------|----------|----------------------------------------------------|--------------------------|---------|----------------|
| `height`    | `string` | Component's height (thus the images) with its unit | :x:                      |         | 50px / 10em    |
| `left_src`  | `string` | Path of the image on the left. Can be empty.       | :white_check_mark: / :x: |         | /img/left.jpg  |
| `left_alt`  | `string` | Alt of the image on the left                       | :x:                      |         | left           |
| `right_src` | `string` | Path of the image on the right. Can be empty       | :white_check_mark: / :x: |         | /img/right.jpg |
| `right_alt` | `string` | Alt of the image on the right                      | :x:                      |         | right          |

#### Code Snippet
```html
import {ImageCompareSlider} from svelte-image-compare-slider
// or import ImageCompareSlider from svelte-image-compare-slider

<script>
  const height = "50px"; //does not work with %
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
___
//put img

> [!NOTE]
> Reminder: displays a `img` if one of the sources is empty

## Todo
___
- Priority
  - [ ] fix slider use when change window's dimensions : due to onmount?
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

## License
___
© [KevinLocksy](https://github.com/KevinLocksy)