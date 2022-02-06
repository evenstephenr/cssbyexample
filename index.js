const express = require('express')
const { Templater, Dora } = require('./templater')

const app = express()
const port = 3000
app.engine('tmpl', Templater);
app.set('views', './views') // specify the views directory
app.set('view engine', 'tmpl') // register the template engine

app.get('/', function (req, res) {
  return res.render('index', { title: 'home', view: 'index' })
})

app.get('/:route', (req, res) => {
  const { route } = req.params;
  if (!Dora.find(`./views/${route}.tmpl`)) {
    return res.render('404', { title: 'Page not found' })
  }

  return res.render(route, {title: route, view: route })
})

app.listen(port, () => {
  console.log(`cssbyexample app listening on port ${port}`)
})