const lerp = (f0, f1, t) => (1 - t) * f0 + t * f1
const clamp = (val, min, max) => Math.max(min, Math.min(val, max))

const components = document.querySelectorAll('[fc-distortion-slider = component]')

class DragScroll {
    constructor(obj) {
  	this.component = obj.component
    	this.slider = this.component.querySelector(obj.slider)
    	this.mask = this.component.querySelector(obj.mask)
    	this.slides = this.component.querySelectorAll(obj.slides)
    	this.progressBar = this.component.querySelector(obj.progressBar)
    
    	this.speedFactor = obj.speedFactor,
    	this.strength = obj.strength,
    	this.scaleFactor = obj.scaleFactor,
    	this.distortionFactor = obj.distortionFactor
    
    	this.init()
    }
  
  init() {
    this.progress = 0
    this.speed = 0
    this.oldX = 0
    this.x = 0
    this.playrate = 0
    
    this.bindings()
    this.events()
    this.calculate()
    this.raf()
  }
  
  bindings() {
     [
      "events",
      "calculate",
      "raf",
      "handleWheel",
      "move",
      "handleTouchStart",
      "handleTouchMove",
      "handleTouchEnd"
    ].forEach((method) => {
    	this[method] = this[method].bind(this)
    })
  }
  
  calculate() {
    this.progress = 0
    this.wrapWidth = this.slides[0].clientWidth * this.slides.length
    this.mask.style.width = `${this.wrapWidth}px`
    this.maxScroll = this.wrapWidth - this.component.clientWidth
  }
  
  handleWheel(e) {
    this.progress += e.deltaY
    this.move()
  }
  
  handleTouchStart(e) {
    e.preventDefault()
    this.dragging =  true
    this.startX = e.clientX || e.touches[0].clientX
  }
  
  handleTouchMove(e) {
    if(!this.dragging) return false;
    
    const x = e.clientX || e.touches[0].clientX
    this.progress += (this.startX - x) * this.speedFactor
    this.startX = x
    this.move()
  }
  
  handleTouchEnd() {
  	this.dragging = false
  }
  
  move() {
  	this.progress = clamp(this.progress, 0, this.maxScroll)
  }
  
  events() {
    window.addEventListener("resize", this.calculate)
    
    this.slider.addEventListener("touchstart", this.handleTouchStart)
    this.slider.addEventListener("touchmove", this.handleTouchMove)
    this.slider.addEventListener("touchend", this.handleTouchEnd)
    
    this.slider.addEventListener("mousedown", this.handleTouchStart)
    this.slider.addEventListener("mousemove", this.handleTouchMove)
    this.slider.addEventListener("mouseup", this.handleTouchEnd)
    
    document.body.addEventListener("mouseleave", this.handleTouchEnd)
  }
  
  raf() {
    this.x = lerp(this.x, this.progress, this.strength)
    this.playrate = this.x / this.maxScroll
    
    this.mask.style.transform = `translatex(${-this.x}px)`
    if(this.progressBar !== null)
    	this.progressBar.style.transform = `scaleX(${0.18 + this.playrate * 0.82})`
    
    
    this.speed = Math.min(100, this.oldX - this.x)
    this.oldX = this.x
    
    this.slides.forEach((slide) => {
    	slide.style.transform = `scale(${1 - Math.abs(this.speed) * this.scaleFactor})` 
      slide.querySelector("img").style.transform = `scaleX(${1 + Math.abs(this.speed) * this.distortionFactor})`
    })
  }
}

var Webflow = Webflow || [];
Webflow.push(function () {

	for(const component of components)
	{
	const speedAttribute = parseFloat(component.getAttribute('fc-distortion-slider-speed'))
	  const speedFactor = isNaN(speedAttribute) ? 5 : speedAttribute

	  const strengthAttribute = parseFloat(component.getAttribute('fc-distortion-slider-strength'))
	  const strength = isNaN(strengthAttribute) ? 0.05 : strengthAttribute

	  const scaleAttribute = parseFloat(component.getAttribute('fc-distortion-slider-scale'))
	  const scaleFactor = isNaN(scaleAttribute) ? 0.003 : scaleAttribute

	  const distortionAttribute = parseFloat(component.getAttribute('fc-distortion-slider-distortion'))
	  const distortionFactor = isNaN(distortionAttribute) ? 0.006 : distortionAttribute

	  const scroll = new DragScroll({
	    component: component,
	    slider:"[fc-distortion-slider = slider]", 
	    mask: "[fc-distortion-slider = mask]",
	    slides: "[fc-distortion-slider = slide]",
	    progressBar: "[fc-distortion-slider = progress-bar]",

	    speedFactor: speedFactor,
	    strength: strength,
	    scaleFactor: scaleFactor,
	    distortionFactor: distortionFactor
	  })

	  const animateScroll = () => {
	    requestAnimationFrame(animateScroll)
	    scroll.raf()
	  }

	  animateScroll()
	}
})
