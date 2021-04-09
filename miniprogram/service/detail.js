import request from './network.js'
export function getBgc(){
  return request({
    url:'detail'
  })
}