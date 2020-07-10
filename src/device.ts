// Thanks https://www.regextester.com/102873
// Modified to get only the major browser version
const ua = navigator.userAgent

let browser = ''
let os = navigator.platform

let m = ua.match(/(MSIE|Trident|(?!Gecko.+)Firefox|(?!AppleWebKit.+Chrome.+)Safari(?!.+Edge)(?!.+OPR)|(?!AppleWebKit.+)Chrome(?!.+Edge)(?!.+OPR)|(?!AppleWebKit.+Chrome.+Safari.+)Edge|OPR|AppleWebKit(?!.+Chrome|.+Safari)|Gecko(?!.+Firefox))(?: |\/)([\d]+)/)

if (m && m[1] && m[2]) {
  browser = m[1] + m[2]
}

if (os.match('Linux')) {
  m = ua.match(/(Android)[ -](\d+)/)
  if (m && m[1]) {
    os = m[1] // Android
    if (m[2]) {
      os += m[2] // version
    }
  } else {
    os = 'Linux'
  }
} else if (os.match(/mac/i)) {
  os = 'Mac'
}

const info = {
  // remove arch in name
  os,
  browser
}

export default info
