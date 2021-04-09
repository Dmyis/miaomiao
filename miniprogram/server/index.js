const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');
const detail = require('./routes/detail')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

app.use('/api/detail', detail)
//详情页默认背景图片
app.get('/data/detail/img/*', function (req, res) {
    res.sendFile( __dirname + "/" + req.url );
})
//用户上传的图片
app.post('/api/detail/image', (req, res) => {
  let imgurl = req.query.url
  res.send('上传成功')
})

app.listen(3030, (req, res) => {
  console.log('listen:localhost 3030');
})