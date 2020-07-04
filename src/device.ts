// Thanks https://www.regextester.com/102873
// Modified to get only the major browser version
function getBrowserInfo () {
  const ua = navigator.userAgent
  const m = ua.match(/(MSIE|Trident|(?!Gecko.+)Firefox|(?!AppleWebKit.+Chrome.+)Safari(?!.+Edge)|(?!AppleWebKit.+)Chrome(?!.+Edge)|(?!AppleWebKit.+Chrome.+Safari.+)Edge|AppleWebKit(?!.+Chrome|.+Safari)|Gecko(?!.+Firefox))(?: |\/)([\d]+)/)
  return m![1] + m![2]
}

const info = {
  // remove arch in name
  os: navigator.platform.replace(/\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i, '').trim(),
  browser: getBrowserInfo()
}

export default info
