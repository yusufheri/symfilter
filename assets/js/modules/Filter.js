/**
 * @property {HTMLElement} pagination
 * @property {HTMLElement} sorting
 * @property {HTMLElement} content
 * @property {HTMLFormElement} form
 */

import { Flipper, spring } from 'flip-toolkit'

export default class Filter {

    /**
     * @param {HTMLElement|null} element
     */
    constructor (element) {

        if (element === null) {
            return
        }
        this.pagination = element.querySelector('.js-filter-pagination')
        this.sorting = element.querySelector('.js-filter-sorting')
        this.content = element.querySelector('.js-filter-content')
        this.form = element.querySelector('.js-filter-form')

        this.bindEvents()
    }

    /**
     * Ajouter les comportements dans l element
     */
    bindEvents() {

        const aClickListener =  e =>  {
            if (e.target.tagName === 'A') {
                e.preventDefault()
                this.loadUrl(e.target.getAttribute('href'))
            }
        }
        this.sorting.addEventListener('click', aClickListener)

        this.pagination.addEventListener('click', aClickListener)

        this.form.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', this.loadForm.bind(this))
        })
    }

    async loadForm() {
        const data = new FormData(this.form)
        const url = new URL(this.form.getAttribute('action') || window.location.href)
        const params = new URLSearchParams()

        data.forEach((value, key) => {
            params.append(key, value)
        })

        return this.loadUrl(url.pathname + '?' + params.toString())
        
    }

    async loadUrl(url) {

        this.showLoader()
        const params = new URLSearchParams(url.split('?')[1] || '')
        params.set('ajax', 1)

        const response = await fetch(url.split('?')[0] + '?' + params.toString(), {
            headers: {
                'X-Requested-With' : 'XMLHttpRequest'
            }
        })

        if (response.status >= 200 && response.status < 300) {
            const data = await response.json()
            
            this.flipContent(data.content)
            this.pagination.innerHTML = data.pagination
            this.sorting.innerHTML = data.sorting

            this.updatePrices(data)
            params.delete('ajax') //On enleve la variable Url ajax avant de retourner l'url à afficher
            history.replaceState({},'', url.split('?')[0] + '?' + params.toString())

        } else {
            console.error(response)
        }
        this.hideLoader()
    }

    flipContent(content) {
        const flipper = new Flipper({ element: this.content })
        const springConfig = "gentle" // "wobbly" //"veryGentle" 
        const exitSpring = function (element, index, onComplete) {
            spring({
                config: 'stiff',
                values: {
                    translateY: [0, -20],
                    opacity: [1, 0]
                },
                onUpdate: ({ translateY, opacity }) => {
                    element.style.opacity = opacity;
                    element.style.transform = `translateY(${translateY}px)`;
                },
                onComplete
            });
        }
        const appearSpring = function (element, index) {
            spring({
                config: 'stiff',
                values: {
                    translateY: [20, 0],
                    opacity: [0, 1]
                },
                onUpdate: ({ translateY, opacity }) => {
                    element.style.opacity = opacity;
                    element.style.transform = `translateY(${translateY}px)`;
                },
                delay: index * 15
            });
        }

        this.content.children.forEach(elt => {
            flipper.addFlipped({
                element: elt,
                spring: springConfig,
                flipId: elt.id,
                shouldFlip: false,
                onExit: exitSpring
            })
        })

        flipper.recordBeforeUpdate()
        this.content.innerHTML = content;

        this.content.children.forEach(element => {
            flipper.addFlipped({
                element,
                spring: springConfig,
                flipId: element.id,
                onAppear: appearSpring
            })
        })
        flipper.update();

    }

    showLoader() {
        this.form.classList.add('is-loading')
        const loader = this.form.querySelector('.js-loading')

        if (loader === null) {
            return
        }
        loader.setAttribute('aria-hidden', 'false')
        loader.style.display = null
    }

    hideLoader() {
        this.form.classList.remove('is-loading')
        const loader = this.form.querySelector('.js-loading')

        if (loader === null) {
            return
        }
        loader.setAttribute('aria-hidden', 'true')
        loader.style.display = "none"
    }

    updatePrices({min, max}) {
        const slider= document.getElementById('price-slider');
        console.log(slider)
        if (slider === null ) {
            return
        }
        //console.log(slider.dataset.min, slider.dataset.max)
        document.getElementById("min").value = min.toString()
        document.getElementById("max").value = max.toString()
        
        slider.noUiSlider.updateOptions({
            start: [min, max],
            range: {
                'min': parseInt(slider.dataset.min),
                'max': parseInt(slider.dataset.max)
            }
        })
    }
}
