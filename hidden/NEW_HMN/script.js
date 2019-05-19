document.addEventListener('DOMContentLoaded', function() {
  setTimeout(lazyLoad.bind(this, 2, 2000, 48), 2000)

  function lazyLoad(index, delay, limit) {
    var imgSrc = "./images/collections/aw/" + (index < 10 ? ("0" + index) : index) + "_hmn_aw19.jpg"
    var nextIndex = index = index >= limit ? 1 : index + 1
    
    var frontImage = document.getElementById('aw_front')
    var backImage  = document.getElementById('aw_back')
    
    var changeSrcImage;
    if (backImage.classList.contains('carousel__image--activate')) {
      changeSrcImage = frontImage
    } else {
      changeSrcImage = backImage
    }
    
    changeSrcImage.src = imgSrc
    changeSrcImage.onload = function() {
      backImage.classList.toggle('carousel__image--activate')
      changeSrcImage.onload = null;
      changeSrcImage.onerror = null;
      
      setTimeout(lazyLoad.bind(this, nextIndex, delay, limit), delay)
    }
    
    changeSrcImage.onerror = function() {
      imgSrc = "./images/collections/aw/" + (nextIndex < 10 ? ("0" + nextIndex) : nextIndex) + "_hmn_aw19.jpg"
      nextIndex = nextIndex = nextIndex >= limit ? 1 : nextIndex + 1
      
      changeSrcImage.src = imgSrc
    }
  }
})
