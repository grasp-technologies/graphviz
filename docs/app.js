let VERSION = "1.1.0"

let iOS = navigator.userAgent.indexOf("iPhone") != -1

let editor        = document.querySelector("#editor")
let textArea      = editor.querySelector("textarea")
let lineNumbers   = editor.querySelector(".line-numbers")
let genButton     = editor.querySelector('button[name="generate"]')
let copyButton    = editor.querySelector('button[name="copy"]')
let exampleButton = editor.querySelector('button[name="next-example"]')
let presentation  = document.querySelector("#presentation")
let updateDot     = document.querySelector("#update-dot")
let liveUpdate    = document.querySelector('input[name="liveUpdate"]')

let lastValidOutput = ""

let examples = [
  "color-dots.dot",
  "color-dots-graph.dot",
  "fsm.dot",
  "clusters.dot",
  "data_structs.dot",
  "lalr.dot",
  "prof.dot",
  "projects.dot",
  "records.dot",
  "kuratowski.dot",
  "switch.dot",
  "unix.dot",
  "network.dot",
]

let regenWhenDone = false
let isGenerating = false

// this helps work around a difference in behavior between Firefox and other web browsers,
// where setting textArea.value="bla" causes change events in Safari and Chrome, but not in FF.
let isSwappingOutEditorValue = false

function generateGraph() {
  let e = new Error()
  if (isSwappingOutEditorValue) {
    return
  }
  // bounce to prevent flooding worker with messages
  if (isGenerating) {
    regenWhenDone = true
    return
  }
  isGenerating = true
  showUpdateDot()
  let clearGraphTimer = setTimeout(() => {
    presentation.querySelector(".graph").innerText = ""
  }, 200)

  const timeout = 30000

  function onEnd() {
    clearTimeout(clearGraphTimer)
    hideUpdateDot()
    isGenerating = false
    if (regenWhenDone) {
      regenWhenDone = false
      generateGraph()
    }
  }

  presentation.classList.remove("error")

  let source = textArea.value.trim()
  source = source.replace(/fontname\s*=\s*(?:"Inter"|'Inter'|Inter)/g, 'fontname="Courier,Inter"')

  let addedGraphDirective = false
  if (!source.match(/\b(?:di)?graph(?:\s+[^\{\r\n]+|)[\r\n\s]*\{/m)) {
    // definitely no graph type directive
    source = wrapInGraphDirective(source)
    addedGraphDirective = true
  }

  function render() {
    return graphviz.layout(source, "svg", "dot", timeout).then(svg => {
      // let dataUrl = "data:image/svg+xml;base64," + btoa(svg)
      // presentation.querySelector(".graph").style.backgroundImage = `url(${dataUrl})`
      presentation.querySelector(".graph").innerHTML = svg
      lastValidOutput = svg
      onEnd()
    }).catch(err => {
      //console.log("render() ERROR", err.stack||String(err)) // XXX DEBUG
      if (!addedGraphDirective &&
          err.message &&
          (err.message+"").toLowerCase().indexOf("syntax error") != -1
      ) {
        // try and see if adding graph directive fixes it
        source = wrapInGraphDirective(source)
        addedGraphDirective = true
        return render()
      }
      console.error(err.stack||String(err))
      presentation.querySelector(".error").innerText = String(err)
      presentation.classList.add("error")
      onEnd()
    })
  }
  render()
}


function wrapInGraphDirective(s) {
  return (
    'digraph {\n' +
    '  graph [fontname="Courier,Inter" bgcolor=transparent];\n' +
    '  node  [fontname="Courier,Inter"];\n' +
    '  edge  [fontname="Courier,Inter"];\n' +
    s +
    '\n}\n'
  )
}


let updateDotTimer = null

function hideUpdateDot() {
  clearTimeout(updateDotTimer)
  updateDotTimer = setTimeout(() => { updateDot.classList.remove("visible") }, 120)
}

function showUpdateDot() {
  clearTimeout(updateDotTimer)
  updateDot.classList.add("visible")
}

function updateLineNumbers() {
  let nlines = textArea.value.split("\n").length
  let s = ""
  for (let i = 1; i <= nlines; i++) {
    s += i + "\n"
  }
  lineNumbers.innerText = s
}


function focusEditor() {
  if (!iOS) {
    textArea.focus()
  }
}


let currentExample = -1

function loadNextExample() {
  presentation.querySelector(".graph").innerText = ""
  currentExample = ++currentExample % examples.length
  let url = "examples/" + examples[currentExample] + "?v=" + VERSION
  fetch(url).then(r => r.text()).then(setSource)
}


function setSource(source) {
  // bug workaround: adding an extra space and removing it with execCommand
  // causes the flexbox layout to be correctly updated.
  isSwappingOutEditorValue = true
  textArea.value = source + " "
  document.execCommand("delete")

  setTimeout(() => {
    // workaround for Firefox
    isSwappingOutEditorValue = false
    generateGraph()
    updateLineNumbers()
  },0)

  focusEditor()
  setTimeout(() => {
    try {
      textArea.selectionStart = textArea.selectionEnd = 0
    } catch(_) {}
  },1)
}


function updateGenButtonAvailability() {
  genButton.disabled = liveUpdate.checked
  genButton.classList.toggle("disabled", genButton.disabled)
}


let copyTimer = null
let copyButtonRestingLabel = copyButton.innerText

function copyOutputToClipboard() {
  if (copyTimer !== null) {
    clearTimeout(copyTimer)
    copyButton.innerText = copyButtonRestingLabel
  }
  let ta = document.createElement("textarea")
  ta.style.position = "fixed"
  ta.style.pointerEvents = "none"
  ta.style.opacity = "0"
  document.body.appendChild(ta)
  ta.value = lastValidOutput
  ta.focus()
  ta.select()
  document.execCommand("copy")
  document.body.removeChild(ta)
  copyButton.innerHTML = "✓ Copied&nbsp;"
  copyTimer = setTimeout(() => {
    copyTimer = null
    copyButton.innerText = copyButtonRestingLabel
  }, 1000)
}


// event handlers

editor.onclick = ev => {
  ev.target !== textArea && focusEditor()
}

textArea.oninput = () => {
  updateLineNumbers()
  if (liveUpdate.checked) {
    generateGraph()
  }
}

exampleButton.onclick = loadNextExample
liveUpdate.onchange = updateGenButtonAvailability
genButton.onclick = generateGraph
copyButton.onclick = copyOutputToClipboard


function getSelectedLineIndex() {
  let s = textArea.value
  let start = textArea.selectionStart
  while (start >= 0) {
    if (s.charCodeAt(start) == 0x0A) {
      start++
      break
    }
    start--
  }
  let end = textArea.selectionEnd
  while (end < s.length && s.charCodeAt(end) != 0x0A) {
    end++
  }
  let lineIndex = [start]
  let i = start
  while (i < end) {
    if (s.charCodeAt(i++) == 0x0A) {
      lineIndex.push(i)
    }
  }
  return lineIndex
}


let indentWidth = 2
let indent = "              ".substr(0, indentWidth)


function indentSelectedLines() {
  let s = textArea.value
  let lineIndex = getSelectedLineIndex()
  let origSel = { start: textArea.selectionStart, end: textArea.selectionEnd }
  let offset = 0
  let firstOffset = undefined
  for (let i of lineIndex) {
    // console.log(`i=${i} + offset=${offset} => ${JSON.stringify(textArea.value[i + offset])}`)
    textArea.selectionEnd = textArea.selectionStart = i + offset
    document.execCommand("insertText", false, indent)
    offset += indentWidth
    if (firstOffset === undefined) {
      firstOffset = indentWidth
    }
  }
  textArea.selectionStart = origSel.start + firstOffset
  textArea.selectionEnd = origSel.end + offset
}


function dedentSelectedLines() {
  // this is a little buggy, but it will do.
  let s = textArea.value
  let lineIndex = getSelectedLineIndex()
  let origSel = { start: textArea.selectionStart, end: textArea.selectionEnd }
  let offset = 0
  let firstOffset = undefined

  for (let i of lineIndex) {
    // console.log(`i=${i} + offset=${offset}  =>  ${JSON.stringify(textArea.value[i + offset])}`)
    let end = i
    while (end < i + indentWidth) {
      let c = s.charCodeAt(end)
      if (c != 0x20 && c != 0x09) {
        break
      }
      end++
    }
    if (end > i) {
      textArea.selectionStart = i + offset
      textArea.selectionEnd = end + offset
      let w = end - i
      offset -= w
      if (firstOffset === undefined) {
        firstOffset = w
      }
      document.execCommand("delete")
    }
  }

  textArea.selectionStart = origSel.start - firstOffset
  textArea.selectionEnd = origSel.end + offset
}


textArea.onkeydown = ev => {
  if (((key, ctrlOrMeta) => {
    if (ctrlOrMeta && key == "[") {
      return dedentSelectedLines(), true
    }
    if (ctrlOrMeta && key == "]") {
      return indentSelectedLines(), true
    }
    if (key == "Tab" && !ctrlOrMeta) {
      ev.stopPropagation()
      ev.preventDefault()
      if (ev.altKey) {
        document.execCommand("insertText", false, "\t")
      } else if (ev.shiftKey) {
        dedentSelectedLines()
      } else {
        indentSelectedLines()
      }
    }
  })(ev.key, ev.ctrlKey || ev.metaKey)) {
    ev.stopPropagation()
    ev.preventDefault()
  }
}

document.onkeydown = ev => {
  if ((ev.ctrlKey || ev.metaKey) && (ev.key == "Enter" || ev.key == "s")) {
    ev.stopPropagation()
    ev.preventDefault()
    generateGraph()
  }
}

if (navigator.platform.indexOf("Mac") != -1) {
  genButton.title = "⌘↩  or  ⌘S"
}


let initialWindowWidthRatio = window.outerWidth - window.innerWidth
let initialWindowHeightRatio = window.outerHeight - window.innerHeight
let updateWindowSizeTimer = null

function updateWindowSize() {
  clearTimeout(updateWindowSizeTimer)
  let wrd = Math.abs(initialWindowWidthRatio - (window.outerWidth - window.innerWidth))
  let hrd = Math.abs(initialWindowHeightRatio - (window.outerHeight - window.innerHeight))
  if (wrd > 1 || hrd > 1) {
    // probably a zoom thing going on. Check again in a moment since resize events
    // are throttled and often the "last" one is not delivered in Safari.
    updateWindowSizeTimer = setTimeout(updateWindowSize)
    return
  }
  let s = document.documentElement.style
  s.setProperty("--winWidth", window.innerWidth + "px")
  s.setProperty("--winHeight", window.innerHeight + "px")
}
window.addEventListener("resize", updateWindowSize, {passive:true})


let qs = {}
location.search && location.search.substr(1).split("&").map(function (p) {
  let kv = p.split("=")
  let k = decodeURIComponent(kv[0])
  let v = kv.length == 1 ? "1" : decodeURIComponent(kv[1])
  qs[k] = v
})


let userSource = qs["source"] || ""


updateWindowSize()
if (userSource) {
  setSource(userSource)
} else {
  loadNextExample()
}
updateGenButtonAvailability()
updateLineNumbers()
focusEditor()
