import noUiSlider from 'nouislider';
import 'nouislider/distribute/nouislider.css';
import '../css/app.css';

// Need jQuery? Install it with "yarn add jquery", then uncomment to import it.
// import $ from 'jquery';

console.log('Hello Webpack Encore! Edit me in assets/js/app.js');

const slider = document.getElementById('price-slider');

if(slider){
    const min = document.getElementById('min');
    const max = document.getElementById('max');

    const range = noUiSlider.create(slider, {
                    start: [min.value || parseInt(slider.dataset.min, 10), max.value || parseInt(slider.dataset.max, 10)],
                    connect: true,
                    step: 10,
                    range: {
                        'min': parseInt(slider.dataset.min, 10),
                        'max': parseInt(slider.dataset.max, 10)
                    }
                });

    range.on('slide', function (values, handle) {
        if(handle === 0) { min.value = Math.round(values[0]);}
        if(handle === 1) { max.value = Math.round(values[1]);}
        
        //console.log(values, handle);
    })

}
