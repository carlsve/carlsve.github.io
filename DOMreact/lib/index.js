
window.addEventListener('DOMContentLoaded', function() {
  var root = document.getElementById('root')

  root.innerHTML = 
    div(
      h1({ id: 'helloo', className: 'wasup', data: { hello: 'what' } },
        'outerheader',
        p('Lite mera text som ligger i h1?')
      ),
      div(
        h1('header'),
        p('lorem ipsum'),
        a({ href: 'https://google.com' },'google')
      ),
      div({ className: 'hellp'}, 'hjälp mig')
    )

  var helloworld = document.createElement('script')
  helloworld.innerHTML = '';
  helloworld.src = "./lib/helloworld.js"
  root.appendChild(helloworld)
})
