document.addEventListener('DOMContentLoaded', function() {
  lazyLoad(2000, 48)

  // Lazy loader (p -> p + 1)
  // have img with src = (p)_hmn_aw19.jpg
  // have index = p

  // set index = (p + 1 % limit) + 1 <-- starts with 1
  // get url (index)_hmn_aw19.jpg
  // create image, append to src.
  
  // when loaded into img
  //   prepare switch
  //   fadeout fadein
  
  // remove old img.
  // done

  index = 2;
  function lazyLoad(delay, limit) {

    setInterval(function () {
      index = index >= limit ? 1 : index + 1
      var url = "./images/collections/aw/" + (index < 10 ? ("0" + index) : index) + "_hmn_aw19.jpg"
      var oddImage = document.querySelector('.carousel__image--odd')
      var evenImage = document.querySelector('.carousel__image--even')

      if ((index & 1) == 0) {
        evenImage.classList.remove('carousel__image--activate')
        setTimeout(function() {
          evenImage.src = url
        }, 500)        
      } else {
        evenImage.classList.add('carousel__image--activate')
        setTimeout(function() {
          oddImage.src = url
        }, 500)        
      }
    }, delay)

  }

  function loadImage() {
      var carousel = document.getElementById("carousel")
      
      var img = new Image();
      img.classList.add("carousel__image")
      img.onload = function () {
        carousel.appendChild(img);
        carousel.removeChild(carousel.firstChild);
      }
      img.src = url
    }
})
